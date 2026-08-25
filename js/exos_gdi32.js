/* ExOS gdi32.dll emulation
 * Version: 6.4.0-dev-os80
 * Model: EXOS_GDI32_V1
 * Client: V8-only browsers
 *
 * Canvas-backed GDI emulation for XSH GUI processes, including raster printer DCs.
 * HDC/GDI handles are process-local and never expose the host graphics device or physical printers.
 */
(function(global){
'use strict';

var API={
  version:'6.4.0-dev-os80',
  model:'EXOS_GDI32_V1',
  ready:true
};

var TYPE={DC:'DC',PEN:'PEN',BRUSH:'BRUSH',FONT:'FONT',BITMAP:'BITMAP',REGION:'REGION'};
var MM_TEXT=1,MM_LOMETRIC=2,MM_HIMETRIC=3,MM_LOENGLISH=4,MM_HIENGLISH=5,MM_TWIPS=6,MM_ISOTROPIC=7,MM_ANISOTROPIC=8;
var TRANSPARENT=1,OPAQUE=2;
var PS_SOLID=0,PS_DASH=1,PS_DOT=2,PS_DASHDOT=3,PS_DASHDOTDOT=4,PS_NULL=5;
var NULLREGION=1,SIMPLEREGION=2,COMPLEXREGION=3;

function err(status,message){
  if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(status,message);
  var e=new Error(message);e.status=status;return e;
}
function invalidHandle(message){return err(global.jplopsoft_STATUS_INVALID_HANDLE||0xC0000008,message||'Invalid GDI handle.');}
function denied(message){return err(global.jplopsoft_STATUS_ACCESS_DENIED||0xC0000022,message||'Access denied.');}
function unsupported(message){return err(global.jplopsoft_STATUS_NOT_SUPPORTED||0xC00000BB,message||'Not supported.');}
function clamp(n,min,max){n=Number(n);if(!isFinite(n))n=0;return Math.max(min,Math.min(max,n));}
function intv(n){n=parseInt(n,10);return isNaN(n)?0:n;}
function copyPoint(p){p=p||{};return{x:Number(p.x)||0,y:Number(p.y)||0};}
function copyRect(r){r=r||{};return{left:Number(r.left)||0,top:Number(r.top)||0,right:Number(r.right)||0,bottom:Number(r.bottom)||0};}
function copyRegion(r){
  if(!r)return null;
  var out={kind:String(r.kind||'rect')};
  if(r.rect)out.rect=copyRect(r.rect);
  if(r.points)out.points=r.points.map(copyPoint);
  return out;
}
function state(ctx){
  if(!ctx.gdi32){
    ctx.gdi32={nextHandle:0x4000,objects:{},dcs:{},surfaces:{},stock:{},invalid:{},bitmapBytes:0,maxObjects:4096,maxBitmapBytes:256*1024*1024,printJobSeq:0,printSpoolBytes:0,maxPrintPages:64,maxPrintSpoolBytes:256*1024*1024};
  }
  return ctx.gdi32;
}
function alloc(ctx,type,obj){
  var s=state(ctx),count=0,k,h;for(k in s.objects)if(s.objects.hasOwnProperty(k))count++;if(count>=s.maxObjects)throw err(global.jplopsoft_STATUS_QUOTA_EXCEEDED||0xC0000044,'GDI object quota exceeded.');h=s.nextHandle++;
  while(s.objects[String(h)])h=s.nextHandle++;
  obj=obj||{};obj.handle=h;obj.type=type;s.objects[String(h)]=obj;
  if(type===TYPE.DC)s.dcs[String(h)]=obj;
  return h;
}
function object(ctx,h,type){
  var o=state(ctx).objects[String(intv(h))]||null;
  if(!o||type&&o.type!==type)throw invalidHandle('Invalid '+String(type||'GDI')+' handle.');
  return o;
}
function ownedWindow(ctx,hwnd){return !!(ctx&&ctx.windows&&ctx.windows[String(intv(hwnd))]);}
function client(hwnd){return typeof global.jplopsoft_GetClientElement==='function'?global.jplopsoft_GetClientElement(intv(hwnd)):null;}
function rgb(r,g,b){return((clamp(r,0,255)|0)|((clamp(g,0,255)|0)<<8)|((clamp(b,0,255)|0)<<16))>>>0;}
function cssColor(v,def){
  if(typeof v==='string'&&v)return v;
  if(typeof v==='number'&&isFinite(v)){
    var n=v>>>0;
    return'rgb('+(n&255)+','+((n>>>8)&255)+','+((n>>>16)&255)+')';
  }
  return def||'#000000';
}
function colorRefFromRgba(r,g,b){return rgb(r,g,b);}
var VIRTUAL_FONT_CATALOG=[
  {faceName:'Segoe UI',family:'UI Sans Serif',pitch:'VARIABLE'},
  {faceName:'Microsoft JhengHei',family:'CJK Sans Serif',pitch:'VARIABLE'},
  {faceName:'Arial',family:'Sans Serif',pitch:'VARIABLE'},
  {faceName:'Tahoma',family:'Sans Serif',pitch:'VARIABLE'},
  {faceName:'Verdana',family:'Sans Serif',pitch:'VARIABLE'},
  {faceName:'Trebuchet MS',family:'Sans Serif',pitch:'VARIABLE'},
  {faceName:'Consolas',family:'Monospace',pitch:'FIXED'},
  {faceName:'Courier New',family:'Monospace',pitch:'FIXED'},
  {faceName:'Times New Roman',family:'Serif',pitch:'VARIABLE'},
  {faceName:'Georgia',family:'Serif',pitch:'VARIABLE'}
];
function enumFontFamiliesEx(filter){
  filter=filter&&typeof filter==='object'?filter:{};
  var face=String(filter.faceName||filter.lfFaceName||'').toLowerCase();
  return VIRTUAL_FONT_CATALOG.filter(function(f){return!face||String(f.faceName).toLowerCase().indexOf(face)>=0;}).map(function(f){return{faceName:f.faceName,fullName:f.faceName,family:f.family,pitch:f.pitch,styles:['Regular','Bold','Italic','Bold Italic'],charSet:1,virtual:true};});
}

function fontCss(f){
  f=f||{};
  var px=Math.max(1,Math.abs(Number(f.height)||16));
  var out='';
  if(f.italic)out+='italic ';
  out+=(Math.max(100,Math.min(900,intv(f.weight)||400)))+' ';
  out+=px+'px "'+String(f.faceName||'Segoe UI').replace(/["\\]/g,'')+'", Arial, sans-serif';
  return out;
}
function stock(ctx,index){
  var s=state(ctx),key=String(index),h=s.stock[key],o;
  if(h&&s.objects[String(h)])return h;
  index=intv(index);
  if(index===0)o={stock:true,type:TYPE.BRUSH,style:'solid',color:rgb(255,255,255)};
  else if(index===1)o={stock:true,type:TYPE.BRUSH,style:'solid',color:rgb(192,192,192)};
  else if(index===2)o={stock:true,type:TYPE.BRUSH,style:'solid',color:rgb(128,128,128)};
  else if(index===3)o={stock:true,type:TYPE.BRUSH,style:'solid',color:rgb(96,96,96)};
  else if(index===4)o={stock:true,type:TYPE.BRUSH,style:'solid',color:rgb(0,0,0)};
  else if(index===5)o={stock:true,type:TYPE.BRUSH,style:'null',color:rgb(0,0,0)};
  else if(index===6)o={stock:true,type:TYPE.PEN,style:PS_SOLID,width:1,color:rgb(255,255,255)};
  else if(index===7)o={stock:true,type:TYPE.PEN,style:PS_SOLID,width:1,color:rgb(0,0,0)};
  else if(index===8)o={stock:true,type:TYPE.PEN,style:PS_NULL,width:1,color:rgb(0,0,0)};
  else if(index===10||index===11)o={stock:true,type:TYPE.FONT,height:14,weight:400,italic:false,underline:false,strikeOut:false,faceName:'Consolas'};
  else if(index===12||index===13||index===17)o={stock:true,type:TYPE.FONT,height:14,weight:400,italic:false,underline:false,strikeOut:false,faceName:'Segoe UI'};
  else if(index===18)o={stock:true,type:TYPE.BRUSH,style:'dc',color:rgb(255,255,255)};
  else if(index===19)o={stock:true,type:TYPE.PEN,style:PS_SOLID,width:1,color:rgb(0,0,0),dc:true};
  else throw unsupported('Unsupported stock object index: '+index);
  h=alloc(ctx,o.type,o);s.stock[key]=h;return h;
}
function defaultDcState(ctx){
  return{
    mapMode:MM_TEXT,
    windowOrg:{x:0,y:0},viewportOrg:{x:0,y:0},windowExt:{x:1,y:1},viewportExt:{x:1,y:1},
    currentPos:{x:0,y:0},
    pen:stock(ctx,7),brush:stock(ctx,5),font:stock(ctx,17),bitmap:0,
    textColor:rgb(0,0,0),bkColor:rgb(255,255,255),bkMode:TRANSPARENT,textAlign:0,
    dcPenColor:rgb(0,0,0),dcBrushColor:rgb(255,255,255),
    clip:[],pathOpen:false,pathEnded:false,path:[],saved:[]
  };
}
function copyDcState(d){
  return{
    mapMode:d.mapMode,windowOrg:copyPoint(d.windowOrg),viewportOrg:copyPoint(d.viewportOrg),windowExt:copyPoint(d.windowExt),viewportExt:copyPoint(d.viewportExt),
    currentPos:copyPoint(d.currentPos),pen:d.pen,brush:d.brush,font:d.font,bitmap:d.bitmap,textColor:d.textColor,bkColor:d.bkColor,bkMode:d.bkMode,textAlign:d.textAlign,
    dcPenColor:d.dcPenColor,dcBrushColor:d.dcBrushColor,clip:(d.clip||[]).map(function(c){return{mode:c.mode,region:copyRegion(c.region)};}),
    pathOpen:d.pathOpen,pathEnded:d.pathEnded,path:(d.path||[]).map(function(c){var x={op:c.op};if(c.p)x.p=copyPoint(c.p);if(c.points)x.points=c.points.map(copyPoint);if(c.rect)x.rect=copyRect(c.rect);return x;}),saved:[]
  };
}
function ensureCanvas2d(canvas){
  var c=canvas&&canvas.getContext?canvas.getContext('2d',{alpha:true,willReadFrequently:true}):null;
  if(!c)throw unsupported('Canvas 2D context is unavailable.');
  return c;
}
function surfaceResize(surface){
  if(!surface||!surface.canvas||!surface.client)return;
  var r=surface.client.getBoundingClientRect(),w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));
  var dpr=Math.max(1,Math.min(4,Number(global.devicePixelRatio)||1)),rw=Math.max(1,Math.round(w*dpr)),rh=Math.max(1,Math.round(h*dpr));
  if(surface.canvas.width===rw&&surface.canvas.height===rh){surface.cssWidth=w;surface.cssHeight=h;surface.dpr=dpr;return;}
  var old=document.createElement('canvas'),oldDpr=surface.dpr||dpr;old.width=surface.canvas.width||1;old.height=surface.canvas.height||1;
  try{old.getContext('2d').drawImage(surface.canvas,0,0);}catch(ignoreCopy){}
  surface.canvas.width=rw;surface.canvas.height=rh;surface.canvas.style.width=w+'px';surface.canvas.style.height=h+'px';
  surface.cssWidth=w;surface.cssHeight=h;surface.dpr=dpr;
  try{var ratio=dpr/Math.max(1,oldDpr);surface.canvas.getContext('2d').drawImage(old,0,0,old.width,old.height,0,0,Math.round(old.width*ratio),Math.round(old.height*ratio));}catch(ignoreRestore){}
}
function windowSurface(ctx,hwnd){
  var s=state(ctx),key=String(hwnd),sf=s.surfaces[key],c;
  if(sf&&sf.canvas&&sf.canvas.isConnected){surfaceResize(sf);return sf;}
  c=client(hwnd);if(!c)throw invalidHandle('Window client area is unavailable.');
  var canvas=document.createElement('canvas');
  canvas.className='jplopsoft-gdi32-surface';
  canvas.setAttribute('data-exos-gdi32-hwnd',key);
  canvas.style.cssText='position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none;z-index:0;';
  try{if(global.getComputedStyle(c).position==='static')c.style.position='relative';}catch(ignoreStyle){}
  if(c.firstChild)c.insertBefore(canvas,c.firstChild);else c.appendChild(canvas);
  sf={hwnd:hwnd,client:c,canvas:canvas,cssWidth:1,cssHeight:1,dpr:1,observer:null};
  surfaceResize(sf);
  if(typeof ResizeObserver==='function'){
    sf.observer=new ResizeObserver(function(){
      surfaceResize(sf);invalidate(ctx,hwnd,null);
      if(!sf.paintScheduled&&typeof global.jplopsoft_xshPostMessage==='function'){
        sf.paintScheduled=true;(global.requestAnimationFrame||global.setTimeout)(function(){sf.paintScheduled=false;try{global.jplopsoft_xshPostMessage(ctx,{hwnd:hwnd,message:'WM_PAINT',wParam:0,lParam:{rect:null,reason:'resize'}});}catch(ignorePaintPost){}},0);
      }
    });
    try{sf.observer.observe(c);}catch(ignoreObserve){}
  }
  s.surfaces[key]=sf;return sf;
}
function dcCanvas(dc){
  if(dc.kind==='window'){
    surfaceResize(dc.surface);return dc.surface.canvas;
  }
  if(dc.kind==='printer'){
    if(!dc.printJob||!dc.printJob.currentPage||!dc.printJob.currentPage.canvas){
      throw unsupported('Printer DC has no active page. Call StartDoc() and StartPage() first.');
    }
    return dc.printJob.currentPage.canvas;
  }
  if(dc.state.bitmap){return object(dc.ctx,dc.state.bitmap,TYPE.BITMAP).canvas;}
  return dc.defaultCanvas;
}
function dcSize(dc){
  var c;
  if(dc.kind==='printer'){
    return{width:dc.printJob.widthPx,height:dc.printJob.heightPx,dpr:1,rawWidth:dc.printJob.widthPx,rawHeight:dc.printJob.heightPx};
  }
  c=dcCanvas(dc);
  if(dc.kind==='window')return{width:dc.surface.cssWidth,height:dc.surface.cssHeight,dpr:dc.surface.dpr,rawWidth:c.width,rawHeight:c.height};
  return{width:c.width,height:c.height,dpr:1,rawWidth:c.width,rawHeight:c.height};
}
function mapParams(dc){
  var d=dc.state,mode=d.mapMode,sx=1,sy=1,dpiX=Number(dc.dpiX)||96,dpiY=Number(dc.dpiY)||96;
  if(mode===MM_LOMETRIC){sx=dpiX/254;sy=-(dpiY/254);}
  else if(mode===MM_HIMETRIC){sx=dpiX/2540;sy=-(dpiY/2540);}
  else if(mode===MM_LOENGLISH){sx=dpiX/100;sy=-(dpiY/100);}
  else if(mode===MM_HIENGLISH){sx=dpiX/1000;sy=-(dpiY/1000);}
  else if(mode===MM_TWIPS){sx=dpiX/1440;sy=-(dpiY/1440);}
  else if(mode===MM_ISOTROPIC||mode===MM_ANISOTROPIC){
    sx=(Number(d.viewportExt.x)||1)/(Number(d.windowExt.x)||1);sy=(Number(d.viewportExt.y)||1)/(Number(d.windowExt.y)||1);
    if(mode===MM_ISOTROPIC){var m=Math.min(Math.abs(sx),Math.abs(sy))||1;sx=(sx<0?-m:m);sy=(sy<0?-m:m);}
  }
  return{sx:sx,sy:sy,tx:d.viewportOrg.x-d.windowOrg.x*sx,ty:d.viewportOrg.y-d.windowOrg.y*sy};
}
function lpToDp(dc,x,y){var m=mapParams(dc);return{x:x*m.sx+m.tx,y:y*m.sy+m.ty};}
function dpToLp(dc,x,y){var m=mapParams(dc);return{x:(x-m.tx)/(m.sx||1),y:(y-m.ty)/(m.sy||1)};}
function applyTransform(dc,c){var m=mapParams(dc),sz=dcSize(dc),dpr=sz.dpr;c.setTransform(dpr*m.sx,0,0,dpr*m.sy,dpr*m.tx,dpr*m.ty);}
function regionPath(c,r){
  if(!r)return;
  if(r.kind==='ellipse'&&r.rect){var q=r.rect,cx=(q.left+q.right)/2,cy=(q.top+q.bottom)/2,rx=Math.abs(q.right-q.left)/2,ry=Math.abs(q.bottom-q.top)/2;c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);return;}
  if(r.kind==='polygon'&&r.points&&r.points.length){c.moveTo(r.points[0].x,r.points[0].y);for(var i=1;i<r.points.length;i++)c.lineTo(r.points[i].x,r.points[i].y);c.closePath();return;}
  var b=r.rect||{left:0,top:0,right:0,bottom:0};c.rect(b.left,b.top,b.right-b.left,b.bottom-b.top);
}
function applyClip(dc,c){
  var clips=dc.state.clip||[],i,cl;
  for(i=0;i<clips.length;i++){
    cl=clips[i];c.beginPath();
    if(cl.mode==='exclude'){
      c.rect(-1000000,-1000000,2000000,2000000);regionPath(c,cl.region);try{c.clip('evenodd');}catch(e){c.clip();}
    }else{regionPath(c,cl.region);c.clip();}
  }
}
function selected(ctx,dc,type){
  var h=type===TYPE.PEN?dc.state.pen:type===TYPE.BRUSH?dc.state.brush:type===TYPE.FONT?dc.state.font:dc.state.bitmap;
  return h?object(ctx,h,type):null;
}
function applyPen(ctx,dc,c){
  var p=selected(ctx,dc,TYPE.PEN);if(!p||p.style===PS_NULL)return false;
  c.strokeStyle=cssColor(p.dc?dc.state.dcPenColor:p.color,'#000');c.lineWidth=Math.max(.25,Number(p.width)||1);c.lineCap='butt';c.lineJoin='miter';
  if(p.style===PS_DASH)c.setLineDash([6,4]);else if(p.style===PS_DOT)c.setLineDash([1,3]);else if(p.style===PS_DASHDOT)c.setLineDash([6,3,1,3]);else if(p.style===PS_DASHDOTDOT)c.setLineDash([6,3,1,3,1,3]);else c.setLineDash([]);
  return true;
}
function applyBrush(ctx,dc,c){var b=selected(ctx,dc,TYPE.BRUSH);if(!b||b.style==='null')return false;c.fillStyle=cssColor(b.style==='dc'?dc.state.dcBrushColor:b.color,'#fff');return true;}
function applyFont(ctx,dc,c){var f=selected(ctx,dc,TYPE.FONT);if(f)c.font=fontCss(f);c.textBaseline='top';c.textAlign='left';return f;}
function withDc(ctx,dc,fn){var can=dcCanvas(dc),c=ensureCanvas2d(can);c.save();try{applyTransform(dc,c);applyClip(dc,c);return fn(c,can);}finally{c.restore();}}
function appendPath(dc,cmd){dc.state.path.push(cmd);}
function drawStoredPath(c,path){
  c.beginPath();
  for(var i=0;i<path.length;i++){
    var q=path[i];
    if(q.op==='move')c.moveTo(q.p.x,q.p.y);
    else if(q.op==='line')c.lineTo(q.p.x,q.p.y);
    else if(q.op==='close')c.closePath();
    else if(q.op==='rect')c.rect(q.rect.left,q.rect.top,q.rect.right-q.rect.left,q.rect.bottom-q.rect.top);
    else if(q.op==='ellipse'){var r=q.rect;c.ellipse((r.left+r.right)/2,(r.top+r.bottom)/2,Math.abs(r.right-r.left)/2,Math.abs(r.bottom-r.top)/2,0,0,Math.PI*2);}
    else if(q.op==='polygon'&&q.points.length){c.moveTo(q.points[0].x,q.points[0].y);for(var j=1;j<q.points.length;j++)c.lineTo(q.points[j].x,q.points[j].y);c.closePath();}
    else if(q.op==='bezier'&&q.points.length>=4){c.moveTo(q.points[0].x,q.points[0].y);for(var k=1;k+2<q.points.length;k+=3)c.bezierCurveTo(q.points[k].x,q.points[k].y,q.points[k+1].x,q.points[k+1].y,q.points[k+2].x,q.points[k+2].y);}
  }
}
function primitive(ctx,dc,kind,args){
  var d=dc.state;
  if(d.pathOpen){
    if(kind==='rect'||kind==='ellipse')appendPath(dc,{op:kind,rect:{left:Number(args[0])||0,top:Number(args[1])||0,right:Number(args[2])||0,bottom:Number(args[3])||0}});
    else if(kind==='polygon')appendPath(dc,{op:'polygon',points:(args[0]||[]).map(copyPoint)});
    else if(kind==='bezier')appendPath(dc,{op:'bezier',points:(args[0]||[]).map(copyPoint)});
    return true;
  }
  return withDc(ctx,dc,function(c){
    c.beginPath();
    if(kind==='rect')c.rect(Number(args[0])||0,Number(args[1])||0,(Number(args[2])||0)-(Number(args[0])||0),(Number(args[3])||0)-(Number(args[1])||0));
    else if(kind==='ellipse'){var l=Number(args[0])||0,t=Number(args[1])||0,r=Number(args[2])||0,b=Number(args[3])||0;c.ellipse((l+r)/2,(t+b)/2,Math.abs(r-l)/2,Math.abs(b-t)/2,0,0,Math.PI*2);}
    else if(kind==='polygon'){var pts=(args[0]||[]).map(copyPoint);if(!pts.length)return false;c.moveTo(pts[0].x,pts[0].y);for(var i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);c.closePath();}
    else if(kind==='bezier'){var bp=(args[0]||[]).map(copyPoint);if(bp.length<4)return false;c.moveTo(bp[0].x,bp[0].y);for(var j=1;j+2<bp.length;j+=3)c.bezierCurveTo(bp[j].x,bp[j].y,bp[j+1].x,bp[j+1].y,bp[j+2].x,bp[j+2].y);}
    if(applyBrush(ctx,dc,c))c.fill();if(applyPen(ctx,dc,c))c.stroke();return true;
  });
}
function bitmapRect(dc,x,y,w,h){
  var a=lpToDp(dc,Number(x)||0,Number(y)||0),b=lpToDp(dc,(Number(x)||0)+(Number(w)||0),(Number(y)||0)+(Number(h)||0)),sz=dcSize(dc),dpr=sz.dpr;
  var l=Math.round(Math.min(a.x,b.x)*dpr),t=Math.round(Math.min(a.y,b.y)*dpr),r=Math.round(Math.max(a.x,b.x)*dpr),bb=Math.round(Math.max(a.y,b.y)*dpr);
  return{x:l,y:t,width:Math.max(1,r-l),height:Math.max(1,bb-t)};
}
function ropPixel(rop,s,d){
  if(rop===0x008800C6)return s&d;       /* SRCAND */
  if(rop===0x00EE0086)return s|d;       /* SRCPAINT */
  if(rop===0x00660046)return s^d;       /* SRCINVERT */
  if(rop===0x00330008)return(~s)&255;    /* NOTSRCCOPY */
  return s;                             /* SRCCOPY */
}
function bitBlt(ctx,dst,dx,dy,w,h,src,sx,sy,rop,sourceW,sourceH){
  rop=Number(rop)>>>0;var dc=dcCanvas(dst),sc=src?dcCanvas(src):null,dr=bitmapRect(dst,dx,dy,w,h),sr=src?bitmapRect(src,sx,sy,typeof sourceW==='undefined'?w:sourceW,typeof sourceH==='undefined'?h:sourceH):null,dctx=ensureCanvas2d(dc),tmp=document.createElement('canvas');tmp.width=dr.width;tmp.height=dr.height;var tc=tmp.getContext('2d');
  if(rop===0x00000042){tc.fillStyle='#000';tc.fillRect(0,0,tmp.width,tmp.height);} /* BLACKNESS */
  else if(rop===0x00FF0062){tc.fillStyle='#fff';tc.fillRect(0,0,tmp.width,tmp.height);} /* WHITENESS */
  else if(rop===0x00550009){
    var di=dctx.getImageData(dr.x,dr.y,dr.width,dr.height);for(var z=0;z<di.data.length;z+=4){di.data[z]=255-di.data[z];di.data[z+1]=255-di.data[z+1];di.data[z+2]=255-di.data[z+2];}tc.putImageData(di,0,0);
  }else{
    if(!src||!sc)throw invalidHandle('BitBlt requires a source DC for this ROP.');
    tc.drawImage(sc,sr.x,sr.y,sr.width,sr.height,0,0,dr.width,dr.height);
    if(rop!==0x00CC0020){
      var si=tc.getImageData(0,0,dr.width,dr.height),dd=dctx.getImageData(dr.x,dr.y,dr.width,dr.height);
      for(var i=0;i<si.data.length;i+=4){si.data[i]=ropPixel(rop,si.data[i],dd.data[i]);si.data[i+1]=ropPixel(rop,si.data[i+1],dd.data[i+1]);si.data[i+2]=ropPixel(rop,si.data[i+2],dd.data[i+2]);if(rop===0x00330008)si.data[i+3]=255;}
      tc.putImageData(si,0,0);
    }
  }
  dctx.save();try{applyTransform(dst,dctx);applyClip(dst,dctx);dctx.setTransform(1,0,0,1,0,0);dctx.drawImage(tmp,dr.x,dr.y);}finally{dctx.restore();}
  return true;
}

function invalidate(ctx,hwnd,rect){
  if(!ctx)return false;var s=state(ctx),key=String(intv(hwnd)),r=rect?copyRect(rect):null,old=s.invalid[key];
  if(!r){s.invalid[key]=null;return true;}
  if(s.invalid.hasOwnProperty(key)&&old===null)return true;
  if(!old){s.invalid[key]=r;return true;}
  s.invalid[key]={left:Math.min(old.left,r.left),top:Math.min(old.top,r.top),right:Math.max(old.right,r.right),bottom:Math.max(old.bottom,r.bottom)};return true;
}


function printPaperSpec(spec){
  spec=spec&&typeof spec==='object'?spec:{};
  var paper=String(spec.paper||spec.paperSize||'A4').toUpperCase(),orientation=String(spec.orientation||'portrait').toLowerCase();
  var widthMm=210,heightMm=297;
  if(paper==='LETTER'){widthMm=215.9;heightMm=279.4;}
  else if(paper==='LEGAL'){widthMm=215.9;heightMm=355.6;}
  else if(paper==='A3'){widthMm=297;heightMm=420;}
  else if(paper==='A5'){widthMm=148;heightMm=210;}
  if(Number(spec.widthMm)>20&&Number(spec.heightMm)>20){widthMm=Math.min(500,Number(spec.widthMm));heightMm=Math.min(500,Number(spec.heightMm));paper='CUSTOM';}
  if(orientation==='landscape'){var tmp=widthMm;widthMm=heightMm;heightMm=tmp;}else orientation='portrait';
  var dpi=Math.max(72,Math.min(192,intv(spec.dpi)||96));
  var widthPx=Math.max(64,Math.round(widthMm/25.4*dpi)),heightPx=Math.max(64,Math.round(heightMm/25.4*dpi));
  if(widthPx*heightPx>24000000)throw err(global.jplopsoft_STATUS_QUOTA_EXCEEDED||0xC0000044,'Printer page exceeds 24 megapixels.');
  return{paper:paper,orientation:orientation,widthMm:widthMm,heightMm:heightMm,dpi:dpi,widthPx:widthPx,heightPx:heightPx};
}
function createPrinterDc(ctx,spec){
  var ps=printPaperSpec(spec),dc={ctx:ctx,kind:'printer',hwnd:0,surface:null,defaultCanvas:null,state:defaultDcState(ctx),released:false,dpiX:ps.dpi,dpiY:ps.dpi};
  dc.printJob={id:0,active:false,docName:'ExOS Document',paper:ps.paper,orientation:ps.orientation,widthMm:ps.widthMm,heightMm:ps.heightMm,widthPx:ps.widthPx,heightPx:ps.heightPx,dpi:ps.dpi,pages:[],currentPage:null,bytes:0};
  return alloc(ctx,TYPE.DC,dc);
}
function printerDc(ctx,h){
  var dc=object(ctx,h,TYPE.DC);
  if(dc.kind!=='printer')throw unsupported('This operation requires a printer DC.');
  return dc;
}
function printerStartDoc(ctx,dc,docInfo){
  var s=state(ctx),j=dc.printJob;
  if(j.active)throw unsupported('A print document is already active on this DC.');
  docInfo=docInfo&&typeof docInfo==='object'?docInfo:{};
  j.id=++s.printJobSeq;j.active=true;j.docName=String(docInfo.docName||docInfo.lpszDocName||'ExOS Document').substring(0,240);j.pages=[];j.currentPage=null;j.bytes=0;
  return j.id;
}
function printerStartPage(ctx,dc){
  var s=state(ctx),j=dc.printJob,canvas,c;
  if(!j.active)throw unsupported('StartDoc() must be called before StartPage().');
  if(j.currentPage)throw unsupported('A printer page is already active.');
  if(j.pages.length>=s.maxPrintPages)throw err(global.jplopsoft_STATUS_QUOTA_EXCEEDED||0xC0000044,'Print job page quota exceeded.');
  canvas=document.createElement('canvas');canvas.width=j.widthPx;canvas.height=j.heightPx;c=ensureCanvas2d(canvas);c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='#ffffff';c.fillRect(0,0,canvas.width,canvas.height);c.restore();
  j.currentPage={canvas:canvas,index:j.pages.length+1};
  return j.currentPage.index;
}
function printerEndPage(ctx,dc){
  var s=state(ctx),j=dc.printJob,page,url,approx;
  if(!j.active||!j.currentPage)throw unsupported('No active printer page.');
  page=j.currentPage;
  try{url=page.canvas.toDataURL('image/png');}catch(e){throw unsupported('Unable to rasterize printer page: '+String(e&&e.message?e.message:e));}
  approx=Math.ceil(url.length*3/4);
  if(j.bytes+approx>s.maxPrintSpoolBytes)throw err(global.jplopsoft_STATUS_QUOTA_EXCEEDED||0xC0000044,'Print spool memory quota exceeded.');
  j.pages.push({dataUrl:url,width:j.widthPx,height:j.heightPx});j.bytes+=approx;s.printSpoolBytes=j.bytes;j.currentPage.canvas.width=1;j.currentPage.canvas.height=1;j.currentPage=null;
  return j.pages.length;
}
function printerAbort(ctx,dc){
  var j=dc.printJob,i;
  if(j.currentPage&&j.currentPage.canvas){j.currentPage.canvas.width=1;j.currentPage.canvas.height=1;}
  for(i=0;i<j.pages.length;i++)j.pages[i].dataUrl='';
  j.active=false;j.pages=[];j.currentPage=null;j.bytes=0;state(ctx).printSpoolBytes=0;return true;
}
function printerEndDoc(ctx,dc){
  var j=dc.printJob,job;
  if(!j.active)throw unsupported('No active print document.');
  if(j.currentPage)throw unsupported('EndPage() must be called before EndDoc().');
  if(!j.pages.length)throw unsupported('Print document contains no pages.');
  if(typeof global.jplopsoft_xshSpoolPrintJob!=='function')throw unsupported('ExOS print spooler is unavailable.');
  job={jobId:j.id,title:j.docName,paper:j.paper,orientation:j.orientation,widthMm:j.widthMm,heightMm:j.heightMm,dpi:j.dpi,pages:j.pages.map(function(p){return{dataUrl:String(p.dataUrl||''),width:Number(p.width)||0,height:Number(p.height)||0,fit:String(p.fit||'contain')};})};
  return Promise.resolve(global.jplopsoft_xshSpoolPrintJob(ctx,job)).then(function(out){printerAbort(ctx,dc);return out;},function(e){printerAbort(ctx,dc);throw e;});
}
function printImageDirect(ctx,dataUrl,spec){
  dataUrl=String(dataUrl||'');spec=spec&&typeof spec==='object'?spec:{};
  if(!/^data:image\/(?:png|jpeg|webp);base64,/i.test(dataUrl))throw unsupported('PrintImage accepts PNG, JPEG or WebP Base64 data URLs only.');
  if(dataUrl.length>32*1024*1024)throw err(global.jplopsoft_STATUS_QUOTA_EXCEEDED||0xC0000044,'PrintImage payload exceeds 32 MiB.');
  if(typeof global.jplopsoft_xshSpoolPrintJob!=='function')throw unsupported('ExOS print spooler is unavailable.');
  var ps=printPaperSpec(spec),job={jobId:++state(ctx).printJobSeq,title:String(spec.title||'ExOS Image').substring(0,240),paper:ps.paper,orientation:ps.orientation,widthMm:ps.widthMm,heightMm:ps.heightMm,dpi:ps.dpi,pages:[{dataUrl:dataUrl,width:0,height:0,fit:String(spec.fit||'contain')} ]};
  return global.jplopsoft_xshSpoolPrintJob(ctx,job);
}

function createDc(ctx,kind,hwnd,compatibleWith){
  var dc={ctx:ctx,kind:kind,hwnd:hwnd||0,surface:null,defaultCanvas:null,state:defaultDcState(ctx),released:false};
  if(kind==='window')dc.surface=windowSurface(ctx,hwnd);
  else{dc.defaultCanvas=document.createElement('canvas');dc.defaultCanvas.width=1;dc.defaultCanvas.height=1;if(compatibleWith){var cdc=object(ctx,compatibleWith,TYPE.DC);dc.state.mapMode=cdc.state.mapMode;dc.dpiX=cdc.dpiX||96;dc.dpiY=cdc.dpiY||96;}}
  return alloc(ctx,TYPE.DC,dc);
}
function selectObject(ctx,dc,h){
  var o=object(ctx,h),old=0;
  if(o.type===TYPE.PEN){old=dc.state.pen;dc.state.pen=h;}
  else if(o.type===TYPE.BRUSH){old=dc.state.brush;dc.state.brush=h;}
  else if(o.type===TYPE.FONT){old=dc.state.font;dc.state.font=h;}
  else if(o.type===TYPE.BITMAP){if(dc.kind!=='memory')throw unsupported('A bitmap can only be selected into a memory DC.');old=dc.state.bitmap;dc.state.bitmap=h;}
  else throw unsupported('SelectObject does not support '+o.type+'.');
  return old||0;
}
function objectSelected(ctx,h){var s=state(ctx),k,d;for(k in s.dcs){if(!s.dcs.hasOwnProperty(k))continue;d=s.dcs[k];if(d.state.pen===h||d.state.brush===h||d.state.font===h||d.state.bitmap===h)return true;}return false;}
function deleteObject(ctx,h){var s=state(ctx),o=s.objects[String(intv(h))];if(!o||o.type===TYPE.DC)return false;if(o.stock||objectSelected(ctx,o.handle))return false;if(o.type===TYPE.BITMAP&&o.canvas){s.bitmapBytes=Math.max(0,s.bitmapBytes-(Number(o.width)||0)*(Number(o.height)||0)*4);o.canvas.width=1;o.canvas.height=1;}delete s.objects[String(o.handle)];return true;}
function deleteDc(ctx,h,releaseWindow){var s=state(ctx),dc=s.dcs[String(intv(h))];if(!dc)return false;if(dc.kind==='window'&&!releaseWindow)return false;if(dc.kind==='printer'&&dc.printJob&&dc.printJob.active){try{printerAbort(ctx,dc);}catch(ignoreAbort){}}delete s.dcs[String(dc.handle)];delete s.objects[String(dc.handle)];dc.released=true;return true;}
function cleanup(ctx){
  if(!ctx||!ctx.gdi32)return;
  var s=ctx.gdi32,k,sf;
  for(k in s.surfaces){if(!s.surfaces.hasOwnProperty(k))continue;sf=s.surfaces[k];try{if(sf.observer)sf.observer.disconnect();}catch(e){}try{if(sf.canvas&&sf.canvas.parentNode)sf.canvas.parentNode.removeChild(sf.canvas);}catch(e2){}}
  for(k in s.dcs){if(!s.dcs.hasOwnProperty(k))continue;try{if(s.dcs[k]&&s.dcs[k].kind==='printer')printerAbort(ctx,s.dcs[k]);}catch(ignorePrintAbort){}}
  ctx.gdi32=null;
}

function bitmapFromDataUrl(ctx,url){
  url=String(url||'');
  if(!/^data:image\/(?:png|jpeg|jpg|gif|webp|bmp);base64,/i.test(url)){
    return Promise.reject(param('CreateBitmapFromDataUrl requires a base64 image data URL.'));
  }
  if(url.length>48*1024*1024){
    return Promise.reject(quota('Image data URL exceeds the 48 MiB limit.'));
  }
  return new Promise(function(resolve,reject){
    var img=new Image();
    img.onload=function(){
      try{
        var w=Math.max(1,Math.min(16384,intv(img.naturalWidth||img.width))),h=Math.max(1,Math.min(16384,intv(img.naturalHeight||img.height))),bytes=w*h*4,s=state(ctx),cv,bh;
        if(bytes>128*1024*1024||s.bitmapBytes+bytes>s.maxBitmapBytes)throw quota('Decoded GDI bitmap exceeds process quota.');
        cv=document.createElement('canvas');cv.width=w;cv.height=h;
        ensureCanvas2d(cv).drawImage(img,0,0,w,h);
        bh=alloc(ctx,TYPE.BITMAP,{width:w,height:h,planes:1,bitsPixel:32,canvas:cv});
        s.bitmapBytes+=bytes;
        resolve(bh);
      }catch(e){reject(e);}
    };
    img.onerror=function(){reject(param('Browser image decoder rejected the image.'));};
    img.src=url;
  });
}
function dcDataUrl(ctx,handle,rect,mime,quality){
  var dc=object(ctx,handle,TYPE.DC),src=dcCanvas(dc),sz=dcSize(dc),r=rect||{left:0,top:0,right:sz.width,bottom:sz.height},left=Math.max(0,Number(r.left)||0),top=Math.max(0,Number(r.top)||0),right=Math.min(sz.width,Number(r.right)||sz.width),bottom=Math.min(sz.height,Number(r.bottom)||sz.height),w=Math.max(1,right-left),h=Math.max(1,bottom-top),dpr=sz.dpr||1,out=document.createElement('canvas'),c;
  out.width=Math.max(1,Math.round(w*dpr));out.height=Math.max(1,Math.round(h*dpr));
  c=ensureCanvas2d(out);
  c.drawImage(src,Math.round(left*dpr),Math.round(top*dpr),Math.round(w*dpr),Math.round(h*dpr),0,0,out.width,out.height);
  mime=String(mime||'image/png').toLowerCase();
  if(mime!=='image/png'&&mime!=='image/jpeg'&&mime!=='image/webp')mime='image/png';
  quality=Math.max(.1,Math.min(1,Number(quality)||.92));
  return out.toDataURL(mime,quality);
}

function dispatch(ctx,method,args){
  args=args||[];var h,dc,o,spec,idx,ret,pts,text,rect,opt;
  if(method==='GetVersion')return{version:API.version,model:API.model,device:'Canvas2D',logicalDpi:96,printing:'EXOS_BROWSER_SPOOL_V1'};
  if(method==='RGB')return rgb(args[0],args[1],args[2]);
  if(method==='CreateDC'){var drv=String(args[0]||'').toUpperCase();if(drv!=='WINSPOOL'&&drv!=='EXOS_PRINT')throw unsupported('Only WINSPOOL / EXOS_PRINT device contexts are exposed to XSH.');return createPrinterDc(ctx,args[3]||{});}
  if(method==='CreatePrinterDC')return createPrinterDc(ctx,args[0]||{});
  if(method==='StartDoc'){dc=printerDc(ctx,args[0]);return printerStartDoc(ctx,dc,args[1]||{});}
  if(method==='StartPage'){dc=printerDc(ctx,args[0]);return printerStartPage(ctx,dc);}
  if(method==='EndPage'){dc=printerDc(ctx,args[0]);return printerEndPage(ctx,dc);}
  if(method==='EndDoc'){dc=printerDc(ctx,args[0]);return printerEndDoc(ctx,dc);}
  if(method==='AbortDoc'){dc=printerDc(ctx,args[0]);return printerAbort(ctx,dc);}
  if(method==='GetPrintJobInfo'){dc=printerDc(ctx,args[0]);var pj=dc.printJob;return{active:!!pj.active,jobId:pj.id,docName:pj.docName,pages:pj.pages.length,pageActive:!!pj.currentPage,paper:pj.paper,orientation:pj.orientation,widthPx:pj.widthPx,heightPx:pj.heightPx,dpi:pj.dpi};}
  if(method==='PrintImage')return printImageDirect(ctx,args[0],args[1]||{});
  if(method==='GetDC'){h=intv(args[0]);if(!ownedWindow(ctx,h))throw denied('GetDC can only target an HWND owned by this XSH process.');return createDc(ctx,'window',h,0);}
  if(method==='BeginPaint'){h=intv(args[0]);if(!ownedWindow(ctx,h))throw denied('BeginPaint can only target an HWND owned by this XSH process.');var ph=createDc(ctx,'window',h,0),pd=object(ctx,ph,TYPE.DC),psz=dcSize(pd),gs2=state(ctx),ik=String(h),ir=gs2.invalid.hasOwnProperty(ik)?gs2.invalid[ik]:null;delete gs2.invalid[ik];return{hdc:ph,fErase:!!args[1],rcPaint:ir||{left:0,top:0,right:psz.width,bottom:psz.height}};}
  if(method==='EndPaint')return deleteDc(ctx,args[1]&&args[1].hdc?args[1].hdc:args[1],true);
  if(method==='ReleaseDC'){dc=object(ctx,args[1],TYPE.DC);if(dc.kind!=='window'||dc.hwnd!==intv(args[0]))return 0;return deleteDc(ctx,args[1],true)?1:0;}
  if(method==='CreateCompatibleDC')return createDc(ctx,'memory',0,args[0]);
  if(method==='DeleteDC')return deleteDc(ctx,args[0],false);
  if(method==='SaveDC'){dc=object(ctx,args[0],TYPE.DC);dc.state.saved.push(copyDcState(dc.state));return dc.state.saved.length;}
  if(method==='RestoreDC'){dc=object(ctx,args[0],TYPE.DC);idx=intv(args[1]);if(!dc.state.saved.length)return false;if(idx<0){var count=Math.min(dc.state.saved.length,Math.abs(idx));while(count-->1)dc.state.saved.pop();ret=dc.state.saved.pop();}else{if(idx<1||idx>dc.state.saved.length)return false;ret=dc.state.saved[idx-1];dc.state.saved.length=idx-1;}ret.saved=dc.state.saved;dc.state=ret;return true;}
  if(method==='CreatePen'){spec=args[0]&&typeof args[0]==='object'?args[0]:{style:args[0],width:args[1],color:args[2]};return alloc(ctx,TYPE.PEN,{style:intv(spec.style),width:Math.max(0,Number(spec.width)||1),color:typeof spec.color==='undefined'?rgb(0,0,0):spec.color});}
  if(method==='CreateSolidBrush')return alloc(ctx,TYPE.BRUSH,{style:'solid',color:args[0]});
  if(method==='EnumFontFamiliesEx'||method==='GetFontCatalog')return enumFontFamiliesEx(args[0]);
  if(method==='CreateFont'){
    if(args[0]&&typeof args[0]==='object')spec=args[0];else spec={height:args[0],width:args[1],escapement:args[2],orientation:args[3],weight:args[4],italic:args[5],underline:args[6],strikeOut:args[7],charSet:args[8],faceName:args[13]};
    return alloc(ctx,TYPE.FONT,{height:Number(spec.height)||16,width:Number(spec.width)||0,escapement:Number(spec.escapement)||0,orientation:Number(spec.orientation)||0,weight:intv(spec.weight)||400,italic:!!spec.italic,underline:!!spec.underline,strikeOut:!!spec.strikeOut,charSet:intv(spec.charSet),faceName:String(spec.faceName||'Segoe UI')});
  }
  if(method==='CreateBitmapFromDataUrl')return bitmapFromDataUrl(ctx,args[0]);
  if(method==='GetDCDataUrl')return dcDataUrl(ctx,args[0],args[1],args[2],args[3]);
  if(method==='CreateBitmap'||method==='CreateCompatibleBitmap'){
    if(method==='CreateCompatibleBitmap')object(ctx,args[0],TYPE.DC);
    var w=Math.max(1,Math.min(16384,intv(method==='CreateCompatibleBitmap'?args[1]:args[0]))),hh=Math.max(1,Math.min(16384,intv(method==='CreateCompatibleBitmap'?args[2]:args[1]))),bytes=w*hh*4,gs=state(ctx);if(bytes>128*1024*1024||gs.bitmapBytes+bytes>gs.maxBitmapBytes)throw err(global.jplopsoft_STATUS_QUOTA_EXCEEDED||0xC0000044,'GDI bitmap memory quota exceeded.');var bc=document.createElement('canvas');bc.width=w;bc.height=hh;var bh=alloc(ctx,TYPE.BITMAP,{width:w,height:hh,planes:1,bitsPixel:32,canvas:bc});gs.bitmapBytes+=bytes;
    if(method==='CreateBitmap'&&args[4]&&Array.isArray(args[4])&&args[4].length>=w*hh*4){var bi=bc.getContext('2d').createImageData(w,hh);for(var bn=0;bn<bi.data.length;bn++)bi.data[bn]=args[4][bn]&255;bc.getContext('2d').putImageData(bi,0,0);}return bh;
  }
  if(method==='GetStockObject')return stock(ctx,args[0]);
  if(method==='DeleteObject')return deleteObject(ctx,args[0]);
  if(method==='SelectObject'){dc=object(ctx,args[0],TYPE.DC);return selectObject(ctx,dc,intv(args[1]));}
  if(method==='GetCurrentObject'){dc=object(ctx,args[0],TYPE.DC);var gt=String(args[1]||'').toUpperCase();return gt==='PEN'||intv(args[1])===1?dc.state.pen:gt==='BRUSH'||intv(args[1])===2?dc.state.brush:gt==='FONT'||intv(args[1])===6?dc.state.font:gt==='BITMAP'||intv(args[1])===7?dc.state.bitmap:0;}
  if(method==='GetObject'){o=object(ctx,args[0]);ret={handle:o.handle,type:o.type};if(o.type===TYPE.PEN){ret.style=o.style;ret.width=o.width;ret.color=o.color;}else if(o.type===TYPE.BRUSH){ret.style=o.style;ret.color=o.color;}else if(o.type===TYPE.FONT){ret.height=o.height;ret.weight=o.weight;ret.italic=o.italic;ret.underline=o.underline;ret.strikeOut=o.strikeOut;ret.faceName=o.faceName;}else if(o.type===TYPE.BITMAP){ret.width=o.width;ret.height=o.height;ret.bitsPixel=o.bitsPixel;}else if(o.type===TYPE.REGION){ret.kind=o.region.kind;}return ret;}
  if(method==='SetDCPenColor'){dc=object(ctx,args[0],TYPE.DC);ret=dc.state.dcPenColor;dc.state.dcPenColor=args[1];return ret;}
  if(method==='SetDCBrushColor'){dc=object(ctx,args[0],TYPE.DC);ret=dc.state.dcBrushColor;dc.state.dcBrushColor=args[1];return ret;}
  if(method==='MoveToEx'){dc=object(ctx,args[0],TYPE.DC);ret=copyPoint(dc.state.currentPos);dc.state.currentPos={x:Number(args[1])||0,y:Number(args[2])||0};if(dc.state.pathOpen)appendPath(dc,{op:'move',p:copyPoint(dc.state.currentPos)});return ret;}
  if(method==='LineTo'){dc=object(ctx,args[0],TYPE.DC);var from=copyPoint(dc.state.currentPos),to={x:Number(args[1])||0,y:Number(args[2])||0};if(dc.state.pathOpen){appendPath(dc,{op:'line',p:to});}else withDc(ctx,dc,function(c){c.beginPath();c.moveTo(from.x,from.y);c.lineTo(to.x,to.y);if(applyPen(ctx,dc,c))c.stroke();});dc.state.currentPos=to;return true;}
  if(method==='Rectangle'){dc=object(ctx,args[0],TYPE.DC);return primitive(ctx,dc,'rect',args.slice(1));}
  if(method==='Ellipse'){dc=object(ctx,args[0],TYPE.DC);return primitive(ctx,dc,'ellipse',args.slice(1));}
  if(method==='Polygon'){dc=object(ctx,args[0],TYPE.DC);return primitive(ctx,dc,'polygon',[args[1]||[]]);}
  if(method==='Polyline'){dc=object(ctx,args[0],TYPE.DC);pts=(args[1]||[]).map(copyPoint);if(pts.length<2)return false;if(dc.state.pathOpen){appendPath(dc,{op:'move',p:pts[0]});for(idx=1;idx<pts.length;idx++)appendPath(dc,{op:'line',p:pts[idx]});return true;}return withDc(ctx,dc,function(c){c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(var pi=1;pi<pts.length;pi++)c.lineTo(pts[pi].x,pts[pi].y);if(applyPen(ctx,dc,c))c.stroke();return true;});}
  if(method==='PolyBezier'){dc=object(ctx,args[0],TYPE.DC);return primitive(ctx,dc,'bezier',[args[1]||[]]);}
  if(method==='BeginPath'){dc=object(ctx,args[0],TYPE.DC);dc.state.path=[];dc.state.pathOpen=true;dc.state.pathEnded=false;return true;}
  if(method==='EndPath'){dc=object(ctx,args[0],TYPE.DC);dc.state.pathOpen=false;dc.state.pathEnded=true;return true;}
  if(method==='CloseFigure'){dc=object(ctx,args[0],TYPE.DC);if(!dc.state.pathOpen)return false;appendPath(dc,{op:'close'});return true;}
  if(method==='AbortPath'){dc=object(ctx,args[0],TYPE.DC);dc.state.path=[];dc.state.pathOpen=false;dc.state.pathEnded=false;return true;}
  if(method==='StrokePath'||method==='FillPath'||method==='StrokeAndFillPath'){dc=object(ctx,args[0],TYPE.DC);if(!dc.state.pathEnded)return false;ret=withDc(ctx,dc,function(c){drawStoredPath(c,dc.state.path);if((method==='FillPath'||method==='StrokeAndFillPath')&&applyBrush(ctx,dc,c))c.fill();if((method==='StrokePath'||method==='StrokeAndFillPath')&&applyPen(ctx,dc,c))c.stroke();return true;});dc.state.path=[];dc.state.pathEnded=false;return ret;}
  if(method==='SetTextColor'){dc=object(ctx,args[0],TYPE.DC);ret=dc.state.textColor;dc.state.textColor=args[1];return ret;}
  if(method==='GetTextColor'){dc=object(ctx,args[0],TYPE.DC);return dc.state.textColor;}
  if(method==='SetBkColor'){dc=object(ctx,args[0],TYPE.DC);ret=dc.state.bkColor;dc.state.bkColor=args[1];return ret;}
  if(method==='SetBkMode'){dc=object(ctx,args[0],TYPE.DC);ret=dc.state.bkMode;dc.state.bkMode=intv(args[1])===OPAQUE?OPAQUE:TRANSPARENT;return ret;}
  if(method==='SetTextAlign'){dc=object(ctx,args[0],TYPE.DC);ret=dc.state.textAlign;dc.state.textAlign=intv(args[1]);return ret;}
  if(method==='GetTextExtentPoint32'){dc=object(ctx,args[0],TYPE.DC);text=String(args[1]===undefined?'':args[1]);return withDc(ctx,dc,function(c){applyFont(ctx,dc,c);var m=c.measureText(text),f=selected(ctx,dc,TYPE.FONT),hh2=Math.max(1,Math.abs(Number(f&&f.height)||16));return{cx:Math.ceil(m.width),cy:Math.ceil(hh2)};});}
  if(method==='TextOut'||method==='ExtTextOut'){
    dc=object(ctx,args[0],TYPE.DC);var x=Number(args[1])||0,y=Number(args[2])||0;
    if(method==='TextOut'){text=String(args[3]===undefined?'':args[3]);opt=0;rect=null;}else{opt=intv(args[3]);rect=args[4]?copyRect(args[4]):null;text=String(args[5]===undefined?'':args[5]);}
    return withDc(ctx,dc,function(c){var f=applyFont(ctx,dc,c),metrics=c.measureText(text),th=Math.max(1,Math.abs(Number(f&&f.height)||16));
      if((opt&0x0002)&&rect){c.fillStyle=cssColor(dc.state.bkColor,'#fff');c.fillRect(rect.left,rect.top,rect.right-rect.left,rect.bottom-rect.top);}else if(dc.state.bkMode===OPAQUE){c.fillStyle=cssColor(dc.state.bkColor,'#fff');c.fillRect(x,y,Math.ceil(metrics.width),th);}
      var align=dc.state.textAlign;if((align&6)===6)c.textAlign='center';else if((align&2)===2)c.textAlign='right';else c.textAlign='left';if((align&24)===24)c.textBaseline='alphabetic';else if((align&8)===8)c.textBaseline='bottom';else c.textBaseline='top';
      c.fillStyle=cssColor(dc.state.textColor,'#000');if((opt&0x0004)&&rect){c.save();c.beginPath();c.rect(rect.left,rect.top,rect.right-rect.left,rect.bottom-rect.top);c.clip();c.fillText(text,x,y);c.restore();}else c.fillText(text,x,y);
      if(f&&f.underline){var uy=y+th-1;c.beginPath();c.moveTo(x,uy);c.lineTo(x+metrics.width,uy);c.strokeStyle=cssColor(dc.state.textColor,'#000');c.lineWidth=1;c.stroke();}
      return true;});
  }
  if(method==='CreateRectRgn')return alloc(ctx,TYPE.REGION,{region:{kind:'rect',rect:{left:Number(args[0])||0,top:Number(args[1])||0,right:Number(args[2])||0,bottom:Number(args[3])||0}}});
  if(method==='CreateEllipticRgn')return alloc(ctx,TYPE.REGION,{region:{kind:'ellipse',rect:{left:Number(args[0])||0,top:Number(args[1])||0,right:Number(args[2])||0,bottom:Number(args[3])||0}}});
  if(method==='CreatePolygonRgn')return alloc(ctx,TYPE.REGION,{region:{kind:'polygon',points:(args[0]||[]).map(copyPoint)}});
  if(method==='SelectClipRgn'){dc=object(ctx,args[0],TYPE.DC);if(!args[1]){dc.state.clip=[];return NULLREGION;}o=object(ctx,args[1],TYPE.REGION);dc.state.clip=[{mode:'intersect',region:copyRegion(o.region)}];return SIMPLEREGION;}
  if(method==='IntersectClipRect'){dc=object(ctx,args[0],TYPE.DC);dc.state.clip.push({mode:'intersect',region:{kind:'rect',rect:{left:Number(args[1])||0,top:Number(args[2])||0,right:Number(args[3])||0,bottom:Number(args[4])||0}}});return COMPLEXREGION;}
  if(method==='ExcludeClipRect'){dc=object(ctx,args[0],TYPE.DC);dc.state.clip.push({mode:'exclude',region:{kind:'rect',rect:{left:Number(args[1])||0,top:Number(args[2])||0,right:Number(args[3])||0,bottom:Number(args[4])||0}}});return COMPLEXREGION;}
  if(method==='SetMapMode'){dc=object(ctx,args[0],TYPE.DC);ret=dc.state.mapMode;idx=intv(args[1]);if(idx<1||idx>8)return 0;dc.state.mapMode=idx;return ret;}
  if(method==='GetMapMode'){dc=object(ctx,args[0],TYPE.DC);return dc.state.mapMode;}
  if(method==='SetWindowOrgEx'){dc=object(ctx,args[0],TYPE.DC);ret=copyPoint(dc.state.windowOrg);dc.state.windowOrg={x:Number(args[1])||0,y:Number(args[2])||0};return ret;}
  if(method==='SetViewportOrgEx'){dc=object(ctx,args[0],TYPE.DC);ret=copyPoint(dc.state.viewportOrg);dc.state.viewportOrg={x:Number(args[1])||0,y:Number(args[2])||0};return ret;}
  if(method==='SetWindowExtEx'){dc=object(ctx,args[0],TYPE.DC);ret=copyPoint(dc.state.windowExt);dc.state.windowExt={x:Number(args[1])||1,y:Number(args[2])||1};return ret;}
  if(method==='SetViewportExtEx'){dc=object(ctx,args[0],TYPE.DC);ret=copyPoint(dc.state.viewportExt);dc.state.viewportExt={x:Number(args[1])||1,y:Number(args[2])||1};return ret;}
  if(method==='LPtoDP'){dc=object(ctx,args[0],TYPE.DC);return(Array.isArray(args[1])?args[1]:[args[1]]).map(function(p){p=copyPoint(p);return lpToDp(dc,p.x,p.y);});}
  if(method==='DPtoLP'){dc=object(ctx,args[0],TYPE.DC);return(Array.isArray(args[1])?args[1]:[args[1]]).map(function(p){p=copyPoint(p);return dpToLp(dc,p.x,p.y);});}
  if(method==='BitBlt'){dc=object(ctx,args[0],TYPE.DC);var br=Number(args[8])>>>0,src=null;if(br!==0x00000042&&br!==0x00FF0062&&br!==0x00550009)src=object(ctx,args[5],TYPE.DC);return bitBlt(ctx,dc,args[1],args[2],args[3],args[4],src,args[6],args[7],br);}
  if(method==='StretchBlt'){dc=object(ctx,args[0],TYPE.DC);var srp=Number(args[10])>>>0,src2=null;if(srp!==0x00000042&&srp!==0x00FF0062&&srp!==0x00550009)src2=object(ctx,args[5],TYPE.DC);return bitBlt(ctx,dc,args[1],args[2],args[3],args[4],src2,args[6],args[7],srp,args[8],args[9]);}
  if(method==='PatBlt'){dc=object(ctx,args[0],TYPE.DC);var rop=Number(args[5])>>>0;if(rop===0x00000042||rop===0x00FF0062||rop===0x00550009)return bitBlt(ctx,dc,args[1],args[2],args[3],args[4],null,0,0,rop);return withDc(ctx,dc,function(c){if(!applyBrush(ctx,dc,c))return false;c.fillRect(Number(args[1])||0,Number(args[2])||0,Number(args[3])||0,Number(args[4])||0);return true;});}
  if(method==='GetPixel'){dc=object(ctx,args[0],TYPE.DC);var pp=lpToDp(dc,Number(args[1])||0,Number(args[2])||0),sz=dcSize(dc),pc=ensureCanvas2d(dcCanvas(dc)),pd=pc.getImageData(Math.max(0,Math.min(sz.rawWidth-1,Math.round(pp.x*sz.dpr))),Math.max(0,Math.min(sz.rawHeight-1,Math.round(pp.y*sz.dpr))),1,1).data;return colorRefFromRgba(pd[0],pd[1],pd[2]);}
  if(method==='SetPixel'){dc=object(ctx,args[0],TYPE.DC);var sp=lpToDp(dc,Number(args[1])||0,Number(args[2])||0),ss=dcSize(dc),cc=ensureCanvas2d(dcCanvas(dc));cc.save();cc.setTransform(1,0,0,1,0,0);cc.fillStyle=cssColor(args[3],'#000');cc.fillRect(Math.round(sp.x*ss.dpr),Math.round(sp.y*ss.dpr),1,1);cc.restore();return args[3];}
  if(method==='GetDeviceCaps'){dc=object(ctx,args[0],TYPE.DC);idx=intv(args[1]);var ds=dcSize(dc);if(idx===8)return ds.width;if(idx===10)return ds.height;if(idx===88)return dc.dpiX||96;if(idx===90)return dc.dpiY||96;if(idx===12)return 32;if(idx===14)return 1;if(idx===2)return dc.kind==='printer'?2:1;if(idx===104)return ds.width;if(idx===106)return ds.height;if(idx===110)return ds.rawWidth;if(idx===111)return ds.rawHeight;if(idx===112||idx===113)return 0;return 0;}
  if(method==='GdiFlush')return new Promise(function(resolve){if(typeof requestAnimationFrame==='function')requestAnimationFrame(function(){resolve(true);});else setTimeout(function(){resolve(true);},0);});
  throw unsupported('Unsupported gdi32.dll API: '+method);
}

global.jplopsoft_GDI32=API;
global.jplopsoft_gdi32Dispatch=dispatch;
global.jplopsoft_gdi32CleanupContext=cleanup;
global.jplopsoft_gdi32Invalidate=invalidate;
})(window);
