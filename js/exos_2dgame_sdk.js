/* ExOS 2D Game SDK
 * Version: 6.4.0-dev-os91
 * Build: 6.4.0-dev-os91-hotfix57
 * Model: EXOS_2DGAME_SDK_V9
 *
 * Host-side accelerated 2D game service for sandboxed XSH applications.
 * XSH access: ExOS.LoadLibrary('game2d.dll')
 *
 * Design goals:
 *  - XSH never receives raw DOM / Canvas / AudioContext objects.
 *  - Drawing crosses the sandbox boundary in one batched PresentFrame call.
 *  - Surface, texture and audio handles are process-owned kernel-style objects.
 *  - Input is normalized for keyboard, pointer and standards-based gamepads.
 */
(function(global){
'use strict';

var SDK={
  version:'6.4.0-dev-os91',
  build:'6.4.0-dev-os91-hotfix57',
  model:'EXOS_2DGAME_SDK_V9',
  apiVersion:9,
  ready:true,
  maxCommands:65536,
  nextSurface:0x2D00,
  nextTexture:0x2E00,
  nextTone:1,
  nextEmitter:0x2F00,
  nextTilemap:0x3000,
  nextAnimation:0x3100,
  nextWorld:0x3200,
  nextTimeline:0x3300,
  nextQuest:0x3400,
  nextInventory:0x3500,
  nextLayer:0x3600,
  nextSpriteBatch:0x3700,
  nextAudioBuffer:0x3800,
  nextAudioVoice:0x3900,
  nextMode7:0x3A00,
  surfaces:{},
  textures:{},
  emitters:{},
  tilemaps:{},
  animations:{},
  worlds:{},
  timelines:{},
  quests:{},
  inventories:{},
  layers:{},
  spriteBatches:{},
  audioBuffers:{},
  audioVoices:{},
  audioMix:{},
  mode7:{},
  audioContext:null,
  tones:{}
};

function clamp(v,a,b){v=Number(v);if(!isFinite(v))v=0;return v<a?a:(v>b?b:v);}
function num(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
function str(v,d){return String(v===undefined||v===null?(d||''):v);}
function color(v,d){v=str(v,d||'#ffffff');return v||d||'#ffffff';}
function nowMs(){return global.performance&&typeof global.performance.now==='function'?global.performance.now():Date.now();}
function own(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function surfaceRecord(handle){return SDK.surfaces[String(parseInt(handle,10)||0)]||null;}
function textureRecord(handle){return SDK.textures[String(parseInt(handle,10)||0)]||null;}
function emitterRecord(handle){return SDK.emitters[String(parseInt(handle,10)||0)]||null;}
function tilemapRecord(handle){return SDK.tilemaps[String(parseInt(handle,10)||0)]||null;}
function animationRecord(handle){return SDK.animations[String(parseInt(handle,10)||0)]||null;}
function worldRecord(handle){return SDK.worlds[String(parseInt(handle,10)||0)]||null;}
function timelineRecord(handle){return SDK.timelines[String(parseInt(handle,10)||0)]||null;}
function questRecord(handle){return SDK.quests[String(parseInt(handle,10)||0)]||null;}
function inventoryRecord(handle){return SDK.inventories[String(parseInt(handle,10)||0)]||null;}
function layerRecord(handle){return SDK.layers[String(parseInt(handle,10)||0)]||null;}
function spriteBatchRecord(handle){return SDK.spriteBatches[String(parseInt(handle,10)||0)]||null;}
function audioBufferRecord(handle){return SDK.audioBuffers[String(parseInt(handle,10)||0)]||null;}
function audioVoiceRecord(handle){return SDK.audioVoices[String(parseInt(handle,10)||0)]||null;}
function mode7Record(handle){return SDK.mode7[String(parseInt(handle,10)||0)]||null;}
function assertSurface(ctx,handle){
  var r=surfaceRecord(handle);
  if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D surface.');
  if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D surface is owned by another XSH process.');
  if(!r.canvas||!r.canvas.isConnected)r.alive=false;
  return r;
}
function assertTexture(ctx,handle){
  var r=textureRecord(handle);
  if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D texture.');
  if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D texture is owned by another XSH process.');
  return r;
}
function assertEmitter(ctx,handle){var r=emitterRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D particle emitter.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D emitter is owned by another XSH process.');return r;}
function assertTilemap(ctx,handle){var r=tilemapRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D tilemap.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D tilemap is owned by another XSH process.');return r;}
function assertAnimation(ctx,handle){var r=animationRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D animation.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D animation is owned by another XSH process.');return r;}
function assertWorld(ctx,handle){var r=worldRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D entity world.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D entity world is owned by another XSH process.');return r;}
function assertTimeline(ctx,handle){var r=timelineRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D timeline.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D timeline is owned by another XSH process.');return r;}
function assertQuest(ctx,handle){var r=questRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D quest journal.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D quest journal is owned by another XSH process.');return r;}
function assertInventory(ctx,handle){var r=inventoryRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D inventory.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D inventory is owned by another XSH process.');return r;}
function assertLayer(ctx,handle){var r=layerRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D layer.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D layer is owned by another XSH process.');return r;}
function assertSpriteBatch(ctx,handle){var r=spriteBatchRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D sprite batch.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D sprite batch is owned by another XSH process.');return r;}
function assertAudioBuffer(ctx,handle){var r=audioBufferRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D audio buffer.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D audio buffer is owned by another XSH process.');return r;}
function assertAudioVoice(ctx,handle){var r=audioVoiceRecord(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D audio voice.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D audio voice is owned by another XSH process.');return r;}
function assertMode7(ctx,handle){var r=mode7Record(handle);if(!r)throw new Error('STATUS_INVALID_HANDLE: invalid Game2D Mode7 background.');if(ctx&&Number(r.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: Game2D Mode7 background is owned by another XSH process.');return r;}
function windowClient(ctx,hwnd){
  hwnd=parseInt(hwnd,10)||0;
  if(!ctx||!ctx.windows||!ctx.windows[String(hwnd)])throw new Error('STATUS_ACCESS_DENIED: HWND is not owned by this XSH process.');
  if(typeof global.jplopsoft_GetClientElement!=='function')throw new Error('USER32 client surface is unavailable.');
  var el=global.jplopsoft_GetClientElement(hwnd);
  if(!el)throw new Error('STATUS_INVALID_HANDLE: window client is unavailable.');
  return el;
}
function normalizeKey(e){return String(e&&e.code?e.code:(e&&e.key?e.key:''));}
function preventGameKey(e,k){if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Tab'].indexOf(k)>=0&&e&&e.preventDefault)e.preventDefault();}
function bindInput(r){
  var c=r.canvas;
  c.tabIndex=0;
  c.setAttribute('role','application');
  c.setAttribute('aria-label',r.title||'ExOS 2D Game Surface');
  c.style.outline='none';
  c.style.touchAction='none';
  c.oncontextmenu=function(e){if(e&&e.preventDefault)e.preventDefault();return false;};
  c.onkeydown=function(e){var k=normalizeKey(e);if(!k)return;if(!r.keys[k])r.pressed[k]=true;r.keys[k]=true;preventGameKey(e,k);};
  c.onkeyup=function(e){var k=normalizeKey(e);if(!k)return;r.keys[k]=false;r.released[k]=true;preventGameKey(e,k);};
  c.onblur=function(){r.keys={};r.pressed={};r.released={};r.pointer.buttons=0;r.pointer.down=false;r.pointer.captured=false;r.pointer.captureId=null;};
  function pointer(e){var b=c.getBoundingClientRect(),sx=r.width/Math.max(1,b.width),sy=r.height/Math.max(1,b.height),nx=(num(e.clientX)-b.left)*sx,ny=(num(e.clientY)-b.top)*sy;r.pointer.dx+=nx-r.pointer.x;r.pointer.dy+=ny-r.pointer.y;r.pointer.x=nx;r.pointer.y=ny;r.pointer.clientX=num(e.clientX);r.pointer.clientY=num(e.clientY);r.pointer.buttons=Number(e.buttons)||0;r.pointer.button=Number(e.button);r.pointer.down=r.pointer.buttons!==0;r.pointer.inside=true;r.pointer.pointerType=str(e.pointerType,'mouse');r.pointer.pressure=num(e.pressure,r.pointer.down?.5:0);r.pointer.tiltX=num(e.tiltX);r.pointer.tiltY=num(e.tiltY);r.pointer.twist=num(e.twist);r.pointer.width=num(e.width,1);r.pointer.height=num(e.height,1);r.pointer.isPrimary=e.isPrimary!==false;r.pointer.pointerId=Number(e.pointerId)||0;}
  c.onpointerdown=function(e){pointer(e);r.pointer.pressedButtons[String(Number(e.button)||0)]=true;try{c.focus();c.setPointerCapture(e.pointerId);r.pointer.captured=true;r.pointer.captureId=e.pointerId;}catch(ignore){}if(e&&e.preventDefault)e.preventDefault();};
  c.onpointermove=function(e){pointer(e);};
  c.onpointerup=function(e){pointer(e);r.pointer.releasedButtons[String(Number(e.button)||0)]=true;if(!r.pointer.buttons){try{c.releasePointerCapture(e.pointerId);}catch(ignore){}r.pointer.captured=false;r.pointer.captureId=null;}if(e&&e.preventDefault)e.preventDefault();};
  c.onpointercancel=function(e){pointer(e);r.pointer.buttons=0;r.pointer.down=false;r.pointer.captured=false;r.pointer.captureId=null;};
  c.onpointerenter=function(e){pointer(e);r.pointer.inside=true;};
  c.onpointerleave=function(){if(!r.pointer.captured)r.pointer.inside=false;};
  c.onwheel=function(e){r.pointer.wheelX+=num(e.deltaX);r.pointer.wheelY+=num(e.deltaY);r.pointer.wheelZ+=num(e.deltaZ);if(e&&e.preventDefault)e.preventDefault();};
  c.onclick=function(){try{c.focus();}catch(ignore){}};
}
function createSurface(ctx,hwnd,spec){
  spec=spec&&typeof spec==='object'?spec:{};
  var client=windowClient(ctx,hwnd),canvas=document.createElement('canvas'),h=++SDK.nextSurface,w=Math.round(clamp(spec.width||800,160,2560)),hh=Math.round(clamp(spec.height||520,120,1440)),r;
  canvas.width=w;canvas.height=hh;
  canvas.style.cssText='display:block;width:100%;height:100%;background:#000;image-rendering:'+(spec.pixelated?'pixelated':'auto')+';cursor:'+(spec.cursor||'default')+';user-select:none;';
  while(client.firstChild)client.removeChild(client.firstChild);
  client.style.padding='0';client.style.overflow='hidden';client.style.background='#000';
  client.appendChild(canvas);
  r={handle:h,pid:Number(ctx.pid)||0,hwnd:parseInt(hwnd,10)||0,canvas:canvas,g:canvas.getContext('2d',{alpha:false,desynchronized:true}),width:w,height:hh,title:str(spec.title,'ExOS Game'),keys:{},pressed:{},released:{},pointer:{x:w/2,y:hh/2,clientX:0,clientY:0,dx:0,dy:0,buttons:0,button:-1,down:false,inside:false,pressedButtons:{},releasedButtons:{},wheelX:0,wheelY:0,wheelZ:0,pointerType:'mouse',pressure:0,tiltX:0,tiltY:0,twist:0,width:1,height:1,isPrimary:true,pointerId:0,captured:false,captureId:null},alive:true,lastFrame:nowMs(),frames:0,lastDt:0,fps:0,fpsSamples:[],background:color(spec.background,'#05070b'),pixelated:!!spec.pixelated,gamepadPrevious:{},raster:{scroll:null,scale:null,color:null,warp:null},rasterScratch:null};
  r.g.imageSmoothingEnabled=!r.pixelated;
  SDK.surfaces[String(h)]=r;bindInput(r);global.setTimeout(function(){try{canvas.focus();}catch(ignore){}},0);
  return{handle:h,width:w,height:hh,apiVersion:SDK.apiVersion};
}
function destroySurface(ctx,h){var r=assertSurface(ctx,h);r.alive=false;try{if(r.canvas&&r.canvas.parentNode)r.canvas.parentNode.removeChild(r.canvas);}catch(ignore){}delete SDK.surfaces[String(r.handle)];return true;}
function resizeSurface(ctx,h,w,hh){var r=assertSurface(ctx,h);w=Math.round(clamp(w,160,2560));hh=Math.round(clamp(hh,120,1440));r.width=w;r.height=hh;r.canvas.width=w;r.canvas.height=hh;r.g.imageSmoothingEnabled=!r.pixelated;return{width:w,height:hh};}
function setSurfaceOptions(ctx,h,spec){var r=assertSurface(ctx,h);spec=spec&&typeof spec==='object'?spec:{};if(spec.background!==undefined)r.background=color(spec.background,r.background);if(spec.cursor!==undefined)r.canvas.style.cursor=str(spec.cursor,'default');if(spec.pixelated!==undefined){r.pixelated=!!spec.pixelated;r.canvas.style.imageRendering=r.pixelated?'pixelated':'auto';r.g.imageSmoothingEnabled=!r.pixelated;}if(spec.focus){try{r.canvas.focus();}catch(ignore){}}return{background:r.background,pixelated:r.pixelated,cursor:r.canvas.style.cursor||'default'};}
function focusSurface(ctx,h){var r=assertSurface(ctx,h);try{r.canvas.focus();return true;}catch(ignore){return false;}}
function applyPaint(g,c,fillDefault){g.globalAlpha=clamp(c.alpha===undefined?1:c.alpha,0,1);g.lineWidth=Math.max(.25,num(c.lineWidth,1));g.strokeStyle=color(c.stroke,'#ffffff');g.fillStyle=color(c.fill,fillDefault||'#ffffff');g.lineCap=c.lineCap||'round';g.lineJoin=c.lineJoin||'round';if(c.shadowColor){g.shadowColor=color(c.shadowColor,'rgba(0,0,0,.5)');g.shadowBlur=Math.max(0,num(c.shadowBlur,0));g.shadowOffsetX=num(c.shadowX,0);g.shadowOffsetY=num(c.shadowY,0);}}
function pathRoundRect(g,x,y,w,h,r){r=Math.max(0,Math.min(Math.abs(w)/2,Math.min(Math.abs(h)/2,num(r,6))));g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();}
function drawStar(g,x,y,rOuter,rInner,points,rotation){var i,a,rr;points=Math.max(3,Math.round(num(points,5)));g.beginPath();for(i=0;i<points*2;i++){a=(rotation||-Math.PI/2)+i*Math.PI/points;rr=i%2?rInner:rOuter;if(i===0)g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);else g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();}
function drawSprite(r,c,x,y,w,h){var t=textureRecord(c.texture);if(!t||Number(t.pid)!==Number(r.pid)||!t.image)return;var img=t.image,sx=num(c.sx,0),sy=num(c.sy,0),sw=num(c.sw,t.width),sh=num(c.sh,t.height),dw=w||num(c.dw,sw),dh=h||num(c.dh,sh);try{r.g.drawImage(img,sx,sy,sw,sh,x,y,dw,dh);}catch(ignore){}}
function createParticleEmitter(ctx,h,spec){var r=assertSurface(ctx,h),s=spec&&typeof spec==='object'?spec:{},id=++SDK.nextEmitter,e={handle:id,pid:Number(ctx.pid)||0,surface:r.handle,particles:[],maxParticles:Math.round(clamp(s.maxParticles||1200,16,4096)),shape:str(s.shape,'circle').toLowerCase(),gravityX:num(s.gravityX,0),gravityY:num(s.gravityY,140),drag:clamp(s.drag===undefined?.985:s.drag,.5,1),fill:color(s.fill,'#ffffff'),alive:true};SDK.emitters[String(id)]=e;return{handle:id,maxParticles:e.maxParticles,shape:e.shape};}
function emitParticles(ctx,h,spec){var e=assertEmitter(ctx,h),s=spec&&typeof spec==='object'?spec:{},count=Math.round(clamp(s.count||8,1,512)),x=num(s.x),y=num(s.y),angle=num(s.angle,-Math.PI/2),spread=Math.max(0,num(s.spread,Math.PI*2)),speed=Math.max(0,num(s.speed,120)),sv=Math.max(0,num(s.speedVariance,speed*.45)),life=Math.max(.03,num(s.life,.55)),lv=Math.max(0,num(s.lifeVariance,.2)),size=Math.max(.5,num(s.size,3)),sizeV=Math.max(0,num(s.sizeVariance,2)),shape=str(s.shape,e.shape),fill=color(s.fill,e.fill),gravityX=num(s.gravityX,e.gravityX),gravityY=num(s.gravityY,e.gravityY),drag=clamp(s.drag===undefined?e.drag:s.drag,.5,1),i,a,sp,lf,sz;for(i=0;i<count&&e.particles.length<e.maxParticles;i++){a=angle+(Math.random()-.5)*spread;sp=Math.max(0,speed+(Math.random()-.5)*2*sv);lf=Math.max(.03,life+(Math.random()-.5)*2*lv);sz=Math.max(.5,size+(Math.random()-.5)*2*sizeV);e.particles.push({x:x+num(s.offsetX,0)+(Math.random()-.5)*num(s.areaW,0),y:y+num(s.offsetY,0)+(Math.random()-.5)*num(s.areaH,0),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:lf,maxLife:lf,size:sz,sizeEnd:Math.max(0,num(s.sizeEnd,0)),fill:fill,alpha:clamp(s.alpha===undefined?1:s.alpha,0,1),gravityX:gravityX,gravityY:gravityY,drag:drag,shape:shape,spin:num(s.spin,0)*(Math.random()<.5?-1:1),rotation:Math.random()*Math.PI*2});}return{count:e.particles.length,emitted:i};}
function updateEmitterInternal(e,dt){dt=clamp(dt||.016,0,.1);for(var i=e.particles.length-1;i>=0;i--){var p=e.particles[i];p.vx+=p.gravityX*dt;p.vy+=p.gravityY*dt;var d=Math.pow(p.drag,dt*60);p.vx*=d;p.vy*=d;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rotation+=p.spin*dt;p.life-=dt;if(p.life<=0)e.particles.splice(i,1);}return e.particles.length;}
function updateParticleEmitter(ctx,h,dt){var e=assertEmitter(ctx,h);return{count:updateEmitterInternal(e,dt)};}
function clearParticleEmitter(ctx,h){var e=assertEmitter(ctx,h);e.particles.length=0;return true;}
function destroyParticleEmitter(ctx,h){var e=assertEmitter(ctx,h);e.alive=false;e.particles.length=0;delete SDK.emitters[String(e.handle)];return true;}
function drawEmitter(r,c,camX,camY){var e=emitterRecord(c.emitter);if(!e||Number(e.pid)!==Number(r.pid))return;if(c.dt!==undefined)updateEmitterInternal(e,c.dt);var g=r.g,ox=num(c.x),oy=num(c.y),i,p,t,sz,alpha;for(i=0;i<e.particles.length;i++){p=e.particles[i];t=clamp(p.life/Math.max(.001,p.maxLife),0,1);sz=p.sizeEnd+(p.size-p.sizeEnd)*t;alpha=p.alpha*t;g.save();g.globalAlpha=alpha;g.fillStyle=p.fill;g.translate(p.x-camX+ox,p.y-camY+oy);if(p.rotation)g.rotate(p.rotation);if(p.shape==='rect')g.fillRect(-sz/2,-sz/2,sz,sz);else if(p.shape==='star'){drawStar(g,0,0,sz,sz*.45,5,0);g.fill();}else{g.beginPath();g.arc(0,0,Math.max(.5,sz),0,Math.PI*2);g.fill();}g.restore();}}
function createTilemap(ctx,h,spec){var r=assertSurface(ctx,h),s=spec&&typeof spec==='object'?spec:{},cols=Math.round(clamp(s.cols||1,1,256)),rows=Math.round(clamp(s.rows||1,1,256)),tw=Math.round(clamp(s.tileWidth||32,4,256)),th=Math.round(clamp(s.tileHeight||32,4,256)),need=cols*rows,tiles=Array.isArray(s.tiles)?s.tiles.slice(0,need):[],flags=Array.isArray(s.cellFlags)?s.cellFlags.slice(0,need):[];while(tiles.length<need)tiles.push(0);while(flags.length<need)flags.push(null);tiles=tiles.map(function(v){v=parseInt(v,10);return isFinite(v)?v:0;});var id=++SDK.nextTilemap,t={handle:id,pid:Number(ctx.pid)||0,surface:r.handle,cols:cols,rows:rows,tileWidth:tw,tileHeight:th,tiles:tiles,cellFlags:flags,palette:Array.isArray(s.palette)?s.palette.slice(0,512):[],originX:num(s.x,0),originY:num(s.y,0),time:0,properties:s.properties&&typeof s.properties==='object'?s.properties:{},cacheCanvas:null,cacheDirty:true};SDK.tilemaps[String(id)]=t;return{handle:id,cols:cols,rows:rows,tileWidth:tw,tileHeight:th,animated:true,layered:true};}
function destroyTilemap(ctx,h){var t=assertTilemap(ctx,h);delete SDK.tilemaps[String(t.handle)];return true;}
function getTile(ctx,h,x,y){var t=assertTilemap(ctx,h);x=Math.floor(num(x));y=Math.floor(num(y));if(x<0||y<0||x>=t.cols||y>=t.rows)return null;return t.tiles[y*t.cols+x];}
function setTile(ctx,h,x,y,v){var t=assertTilemap(ctx,h);x=Math.floor(num(x));y=Math.floor(num(y));if(x<0||y<0||x>=t.cols||y>=t.rows)return false;t.tiles[y*t.cols+x]=parseInt(v,10)||0;t.cacheDirty=true;return true;}
function tileSolid(t,v){var p=t.palette[v];return !!(p&&typeof p==='object'&&p.solid);}
function testTilemapAABB(ctx,h,rect){var t=assertTilemap(ctx,h),r=rect&&typeof rect==='object'?rect:{},x=num(r.x),y=num(r.y),w=Math.max(0,num(r.w)),hh=Math.max(0,num(r.h)),x0=Math.max(0,Math.floor((x-t.originX)/t.tileWidth)),y0=Math.max(0,Math.floor((y-t.originY)/t.tileHeight)),x1=Math.min(t.cols-1,Math.floor((x+w-0.001-t.originX)/t.tileWidth)),y1=Math.min(t.rows-1,Math.floor((y+hh-0.001-t.originY)/t.tileHeight)),hits=[],tx,ty,v;for(ty=y0;ty<=y1;ty++)for(tx=x0;tx<=x1;tx++){v=t.tiles[ty*t.cols+tx];if(tileSolid(t,v))hits.push({x:tx,y:ty,tile:v,rect:{x:t.originX+tx*t.tileWidth,y:t.originY+ty*t.tileHeight,w:t.tileWidth,h:t.tileHeight}});}return{hit:hits.length>0,hits:hits.slice(0,64)};}
function drawTilemap(r,c,camX,camY){var t=tilemapRecord(c.tilemap);if(!t||Number(t.pid)!==Number(r.pid))return;var g=r.g,scale=clamp(c.scale===undefined?1:c.scale,.1,8),ox=t.originX+num(c.x)-camX,oy=t.originY+num(c.y)-camY,tw=t.tileWidth*scale,th=t.tileHeight*scale,startX=r._cameraTransformed?0:Math.max(0,Math.floor((-ox)/tw)-1),startY=r._cameraTransformed?0:Math.max(0,Math.floor((-oy)/th)-1),endX=r._cameraTransformed?t.cols-1:Math.min(t.cols-1,Math.ceil((r.width-ox)/tw)+1),endY=r._cameraTransformed?t.rows-1:Math.min(t.rows-1,Math.ceil((r.height-oy)/th)+1),x,y,v,p,f,pri,minP=c.minPriority===undefined?-9999:num(c.minPriority),maxP=c.maxPriority===undefined?9999:num(c.maxPriority);for(y=startY;y<=endY;y++)for(x=startX;x<=endX;x++){var idx=y*t.cols+x;v=t.tiles[idx];if(!v)continue;p=tileEntry(t,v);f=t.cellFlags[idx]||{};pri=f.priority===undefined?num(p.priority,0):num(f.priority,0);if(pri<minP||pri>maxP)continue;var dx=ox+x*tw,dy=oy+y*th,flipX=!!(f.flipX||p.flipX),flipY=!!(f.flipY||p.flipY),tex=p.texture?textureRecord(p.texture):null;if(tex&&tex.image){var sx=num(p.sx),sy=num(p.sy),sw=num(p.sw,tex.width),sh=num(p.sh,tex.height);g.save();g.translate(dx+tw/2,dy+th/2);g.scale(flipX?-1:1,flipY?-1:1);try{g.drawImage(tex.image,sx,sy,sw,sh,-tw/2,-th/2,tw,th);}catch(ignore){}g.restore();}else if(p.fill){g.fillStyle=color(p.fill,'#64748b');g.save();g.translate(dx+tw/2,dy+th/2);g.scale(flipX?-1:1,flipY?-1:1);g.fillRect(-tw/2,-th/2,tw+.5,th+.5);g.restore();}if(p.stroke){g.strokeStyle=color(p.stroke,'#111827');g.lineWidth=Math.max(.5,num(p.lineWidth,1));g.strokeRect(dx,dy,tw,th);}}}
function testAABB(a,b){a=a&&typeof a==='object'?a:{};b=b&&typeof b==='object'?b:{};var ax=num(a.x),ay=num(a.y),aw=Math.max(0,num(a.w)),ah=Math.max(0,num(a.h)),bx=num(b.x),by=num(b.y),bw=Math.max(0,num(b.w)),bh=Math.max(0,num(b.h));return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}
function testCircle(a,b){a=a&&typeof a==='object'?a:{};b=b&&typeof b==='object'?b:{};var dx=num(a.x)-num(b.x),dy=num(a.y)-num(b.y),rr=Math.max(0,num(a.r))+Math.max(0,num(b.r));return dx*dx+dy*dy<rr*rr;}
function testPoint(p,r){p=p&&typeof p==='object'?p:{};r=r&&typeof r==='object'?r:{};var x=num(p.x),y=num(p.y),rx=num(r.x),ry=num(r.y),rw=Math.max(0,num(r.w)),rh=Math.max(0,num(r.h));return x>=rx&&x<=rx+rw&&y>=ry&&y<=ry+rh;}
function testHitboxes(attacks,targets){attacks=Array.isArray(attacks)?attacks:[];targets=Array.isArray(targets)?targets:[];var hits=[],i,j,a,b;for(i=0;i<Math.min(attacks.length,256);i++){a=attacks[i]&&typeof attacks[i]==='object'?attacks[i]:{};for(j=0;j<Math.min(targets.length,256);j++){b=targets[j]&&typeof targets[j]==='object'?targets[j]:{};if(testAABB(a,b))hits.push({attackIndex:i,targetIndex:j,attackId:a.id===undefined?i:a.id,targetId:b.id===undefined?j:b.id});if(hits.length>=512)return hits;}}return hits;}
function setTilemapTriggers(ctx,h,triggers){var t=assertTilemap(ctx,h);triggers=Array.isArray(triggers)?triggers:[];t.triggers=[];for(var i=0;i<Math.min(triggers.length,512);i++){var q=triggers[i]&&typeof triggers[i]==='object'?triggers[i]:{};t.triggers.push({id:str(q.id,'trigger'+i),type:str(q.type,'generic'),x:num(q.x),y:num(q.y),w:Math.max(0,num(q.w,t.tileWidth)),h:Math.max(0,num(q.h,t.tileHeight)),data:q.data===undefined?null:q.data});}return{count:t.triggers.length};}
function queryTilemapTriggers(ctx,h,rect){var t=assertTilemap(ctx,h),r=rect&&typeof rect==='object'?rect:{},out=[],list=t.triggers||[];for(var i=0;i<list.length;i++){var q=list[i];if(testAABB(r,q))out.push({id:q.id,type:q.type,x:q.x,y:q.y,w:q.w,h:q.h,data:q.data});if(out.length>=128)break;}return out;}
function resolveTilemapAABB(ctx,h,rect,delta){var t=assertTilemap(ctx,h),r=rect&&typeof rect==='object'?rect:{},d=delta&&typeof delta==='object'?delta:{},out={x:num(r.x),y:num(r.y),w:Math.max(0,num(r.w)),h:Math.max(0,num(r.h)),hitX:false,hitY:false};var dx=num(d.x),dy=num(d.y),steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/Math.max(4,Math.min(t.tileWidth,t.tileHeight)/2))),sx=dx/steps,sy=dy/steps,i,test;for(i=0;i<steps;i++){out.x+=sx;test=testTilemapAABB(ctx,h,out);if(test.hit){out.x-=sx;out.hitX=true;}out.y+=sy;test=testTilemapAABB(ctx,h,out);if(test.hit){out.y-=sy;out.hitY=true;}}return out;}
function findTilemapPath(ctx,h,start,goal,opt){var t=assertTilemap(ctx,h),s=start&&typeof start==='object'?start:{},g=goal&&typeof goal==='object'?goal:{},o=opt&&typeof opt==='object'?opt:{},sx=Math.floor(num(s.tileX,s.x)),sy=Math.floor(num(s.tileY,s.y)),gx=Math.floor(num(g.tileX,g.x)),gy=Math.floor(num(g.tileY,g.y)),diag=!!o.diagonal,maxNodes=Math.round(clamp(o.maxNodes||4096,32,16384));function valid(x,y){return x>=0&&y>=0&&x<t.cols&&y<t.rows&&!tileSolid(t,t.tiles[y*t.cols+x]);}if(!valid(sx,sy)||!valid(gx,gy))return{found:false,path:[],visited:0};var dirs=diag?[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]:[[1,0],[-1,0],[0,1],[0,-1]],open=[{x:sx,y:sy,g:0,f:Math.abs(gx-sx)+Math.abs(gy-sy),p:null}],best={},visited=0,node,key,nx,ny,ng,nf,idx;best[sx+','+sy]=0;while(open.length&&visited<maxNodes){idx=0;for(var oi=1;oi<open.length;oi++)if(open[oi].f<open[idx].f)idx=oi;node=open.splice(idx,1)[0];visited++;if(node.x===gx&&node.y===gy){var path=[];while(node){path.push({x:node.x,y:node.y});node=node.p;}path.reverse();return{found:true,path:path,visited:visited};}for(var di=0;di<dirs.length;di++){nx=node.x+dirs[di][0];ny=node.y+dirs[di][1];if(!valid(nx,ny))continue;if(diag&&di>=4&&(!valid(node.x+dirs[di][0],node.y)||!valid(node.x,node.y+dirs[di][1])))continue;ng=node.g+(di>=4?1.4142:1);key=nx+','+ny;if(best[key]!==undefined&&best[key]<=ng)continue;best[key]=ng;nf=ng+Math.abs(gx-nx)+Math.abs(gy-ny);open.push({x:nx,y:ny,g:ng,f:nf,p:node});}}return{found:false,path:[],visited:visited};}
function normalizeAnimStateFrames(v){var a=Array.isArray(v)?v:[],out=[];for(var i=0;i<Math.min(a.length,256);i++){var f=a[i]&&typeof a[i]==='object'?a[i]:{frame:a[i]};out.push({frame:f.frame===undefined?i:f.frame,duration:Math.max(.01,num(f.duration,.1)),tag:str(f.tag,''),event:f.event===undefined?null:f.event});}if(!out.length)out.push({frame:0,duration:.1,tag:'',event:null});return out;}
function createAnimation(ctx,h,spec){assertSurface(ctx,h);var s=spec&&typeof spec==='object'?spec:{},states={},k;if(s.states&&typeof s.states==='object')for(k in s.states)if(own(s.states,k))states[str(k)]=normalizeAnimStateFrames(s.states[k]);if(!Object.keys(states).length)states.idle=normalizeAnimStateFrames(s.frames||[0]);var initial=str(s.initial,Object.keys(states)[0]),id=++SDK.nextAnimation;if(!states[initial])initial=Object.keys(states)[0];SDK.animations[String(id)]={handle:id,pid:Number(ctx.pid)||0,surface:parseInt(h,10)||0,states:states,state:initial,index:0,time:0,loop:s.loop!==false,finished:false,speed:clamp(s.speed===undefined?1:s.speed,.05,8)};return getAnimationState(ctx,id);}
function destroyAnimation(ctx,h){var a=assertAnimation(ctx,h);delete SDK.animations[String(a.handle)];return true;}
function setAnimationState(ctx,h,state,reset){var a=assertAnimation(ctx,h);state=str(state);if(!a.states[state])throw new Error('STATUS_NOT_FOUND: animation state not found.');if(a.state!==state||reset!==false){a.state=state;a.index=0;a.time=0;a.finished=false;}return getAnimationState(ctx,h);}
function advanceAnimation(ctx,h,dt){var a=assertAnimation(ctx,h),frames=a.states[a.state],remain=clamp(dt||0,0,.25)*a.speed,events=[];a.time+=remain;while(a.time>=frames[a.index].duration&&!a.finished){a.time-=frames[a.index].duration;var prev=frames[a.index];if(prev&&prev.event!==null&&prev.event!==undefined)events.push(prev.event);a.index++;if(a.index>=frames.length){if(a.loop)a.index=0;else{a.index=frames.length-1;a.time=0;a.finished=true;}}}var out=getAnimationState(ctx,h);out.events=events;return out;}
function getAnimationState(ctx,h){var a=assertAnimation(ctx,h),frames=a.states[a.state],f=frames[a.index]||frames[0];return{handle:a.handle,state:a.state,index:a.index,frame:f.frame,tag:f.tag,event:f.event===undefined?null:f.event,time:a.time,duration:f.duration,finished:!!a.finished};}
function easeValue(kind,t){t=clamp(t,0,1);kind=str(kind,'linear').toLowerCase();if(kind==='inquad')return t*t;if(kind==='outquad')return t*(2-t);if(kind==='inoutquad')return t<.5?2*t*t:-1+(4-2*t)*t;if(kind==='incubic')return t*t*t;if(kind==='outcubic'){t--;return t*t*t+1;}if(kind==='smoothstep')return t*t*(3-2*t);return t;}
function entitySnapshot(e){var st=[],k;if(e.statuses)for(k in e.statuses)if(own(e.statuses,k))st.push({name:k,duration:e.statuses[k].duration,stacks:e.statuses[k].stacks,potency:e.statuses[k].potency,tickEvery:e.statuses[k].tickEvery,tickValue:e.statuses[k].tickValue,data:e.statuses[k].data});return{id:e.id,name:e.name,tags:e.tags.slice(),x:e.x,y:e.y,w:e.w,h:e.h,vx:e.vx,vy:e.vy,ax:e.ax,ay:e.ay,solid:!!e.solid,active:e.active!==false,data:e.data,components:e.components||{},statuses:st};}
function createEntityWorld(ctx,h,spec){assertSurface(ctx,h);var s=spec&&typeof spec==='object'?spec:{},id=++SDK.nextWorld,b=s.bounds&&typeof s.bounds==='object'?s.bounds:{};SDK.worlds[String(id)]={handle:id,pid:Number(ctx.pid)||0,surface:parseInt(h,10)||0,nextEntity:1,gravityX:num(s.gravityX,0),gravityY:num(s.gravityY,0),drag:clamp(s.drag===undefined?1:s.drag,.1,1),bounds:{x:num(b.x,0),y:num(b.y,0),w:Math.max(0,num(b.w,0)),h:Math.max(0,num(b.h,0))},entities:{}};return{handle:id};}
function destroyEntityWorld(ctx,h){var w=assertWorld(ctx,h);delete SDK.worlds[String(w.handle)];return true;}
function spawnEntity(ctx,h,spec){var w=assertWorld(ctx,h),s=spec&&typeof spec==='object'?spec:{},id=w.nextEntity++,e={id:id,name:str(s.name,'entity'+id),tags:Array.isArray(s.tags)?s.tags.slice(0,32).map(function(x){return str(x);}):[],x:num(s.x),y:num(s.y),w:Math.max(0,num(s.w,16)),h:Math.max(0,num(s.h,16)),vx:num(s.vx),vy:num(s.vy),ax:num(s.ax),ay:num(s.ay),solid:!!s.solid,active:s.active!==false,data:s.data===undefined?null:s.data,components:s.components&&typeof s.components==='object'?s.components:{},statuses:{}};w.entities[String(id)]=e;return entitySnapshot(e);}
function updateEntity(ctx,h,id,patch){var w=assertWorld(ctx,h),e=w.entities[String(parseInt(id,10)||0)];if(!e)throw new Error('STATUS_NOT_FOUND: entity not found.');var p=patch&&typeof patch==='object'?patch:{};['x','y','w','h','vx','vy','ax','ay'].forEach(function(k){if(p[k]!==undefined)e[k]=(k==='w'||k==='h')?Math.max(0,num(p[k])):num(p[k]);});if(p.name!==undefined)e.name=str(p.name);if(p.tags!==undefined&&Array.isArray(p.tags))e.tags=p.tags.slice(0,32).map(function(x){return str(x);});if(p.solid!==undefined)e.solid=!!p.solid;if(p.active!==undefined)e.active=!!p.active;if(p.data!==undefined)e.data=p.data;if(p.components!==undefined&&p.components&&typeof p.components==='object')e.components=p.components;return entitySnapshot(e);}
function getEntity(ctx,h,id){var w=assertWorld(ctx,h),e=w.entities[String(parseInt(id,10)||0)];return e?entitySnapshot(e):null;}
function removeEntity(ctx,h,id){var w=assertWorld(ctx,h),k=String(parseInt(id,10)||0);if(!w.entities[k])return false;delete w.entities[k];return true;}
function queryEntities(ctx,h,filter){var w=assertWorld(ctx,h),f=filter&&typeof filter==='object'?filter:{},rect=f.rect&&typeof f.rect==='object'?f.rect:null,tag=f.tag===undefined?'':str(f.tag),out=[],limit=Math.round(clamp(f.limit||256,1,2048)),k,e;for(k in w.entities){if(!own(w.entities,k))continue;e=w.entities[k];if(f.active!==undefined&&!!e.active!==!!f.active)continue;if(tag&&e.tags.indexOf(tag)<0)continue;if(rect&&!testAABB(e,rect))continue;out.push(entitySnapshot(e));if(out.length>=limit)break;}return out;}
function stepEntityWorld(ctx,h,dt,opt){var w=assertWorld(ctx,h),o=opt&&typeof opt==='object'?opt:{},d=clamp(dt||0,0,.1),gx=num(o.gravityX,w.gravityX),gy=num(o.gravityY,w.gravityY),drag=clamp(o.drag===undefined?w.drag:o.drag,.1,1),b=w.bounds,k,e,m=Math.pow(drag,d*60),moved=[];for(k in w.entities){if(!own(w.entities,k))continue;e=w.entities[k];if(e.active===false)continue;e.vx+=(e.ax+gx)*d;e.vy+=(e.ay+gy)*d;e.vx*=m;e.vy*=m;e.x+=e.vx*d;e.y+=e.vy*d;if(b.w>0){if(e.x<b.x){e.x=b.x;e.vx=0;}if(e.x+e.w>b.x+b.w){e.x=b.x+b.w-e.w;e.vx=0;}}if(b.h>0){if(e.y<b.y){e.y=b.y;e.vy=0;}if(e.y+e.h>b.y+b.h){e.y=b.y+b.h-e.h;e.vy=0;}}moved.push(entitySnapshot(e));}return{count:moved.length,entities:moved};}
function testEntityCollisions(ctx,h,opt){var w=assertWorld(ctx,h),o=opt&&typeof opt==='object'?opt:{},tagA=o.tagA===undefined?'':str(o.tagA),tagB=o.tagB===undefined?'':str(o.tagB),arr=[],k,e,hits=[];for(k in w.entities)if(own(w.entities,k)){e=w.entities[k];if(e.active!==false)arr.push(e);}for(var i=0;i<arr.length;i++){var a=arr[i];if(tagA&&a.tags.indexOf(tagA)<0)continue;for(var j=i+1;j<arr.length;j++){var b=arr[j];if(tagB&&b.tags.indexOf(tagB)<0)continue;if(testAABB(a,b)){hits.push({a:a.id,b:b.id});if(hits.length>=1024)return hits;}}}return hits;}
function entityById(ctx,h,id){var w=assertWorld(ctx,h),e=w.entities[String(parseInt(id,10)||0)];if(!e)throw new Error('STATUS_NOT_FOUND: entity not found.');if(!e.components)e.components={};if(!e.statuses)e.statuses={};return e;}
function setEntityComponent(ctx,h,id,name,value){var e=entityById(ctx,h,id),n=str(name).trim();if(!n)throw new Error('STATUS_INVALID_PARAMETER: component name is required.');if(Object.keys(e.components).length>=64&&!own(e.components,n))throw new Error('STATUS_QUOTA_EXCEEDED: entity component limit reached.');e.components[n]=value===undefined?null:value;return{name:n,value:e.components[n]};}
function getEntityComponent(ctx,h,id,name){var e=entityById(ctx,h,id),n=str(name).trim();return own(e.components,n)?e.components[n]:null;}
function removeEntityComponent(ctx,h,id,name){var e=entityById(ctx,h,id),n=str(name).trim();if(!own(e.components,n))return false;delete e.components[n];return true;}
function queryEntitiesByComponent(ctx,h,name,opt){var w=assertWorld(ctx,h),n=str(name).trim(),o=opt&&typeof opt==='object'?opt:{},out=[],limit=Math.round(clamp(o.limit||256,1,2048)),k,e;for(k in w.entities){if(!own(w.entities,k))continue;e=w.entities[k];if(e.active===false&&!o.includeInactive)continue;if(e.components&&own(e.components,n)){out.push(entitySnapshot(e));if(out.length>=limit)break;}}return out;}
function setEntityStatus(ctx,h,id,spec){var e=entityById(ctx,h,id),q=spec&&typeof spec==='object'?spec:{},name=str(q.name).trim();if(!name)throw new Error('STATUS_INVALID_PARAMETER: status name is required.');var prev=e.statuses[name],maxStacks=Math.round(clamp(q.maxStacks||99,1,999)),stacks=Math.round(clamp(q.stacks===undefined?(prev?prev.stacks+1:1):q.stacks,1,maxStacks));e.statuses[name]={duration:Math.max(0,num(q.duration,1)),stacks:stacks,potency:num(q.potency,1),tickEvery:Math.max(0,num(q.tickEvery,0)),tickValue:num(q.tickValue,0),tickClock:prev?num(prev.tickClock,0):0,data:q.data===undefined?(prev?prev.data:null):q.data};return{name:name,duration:e.statuses[name].duration,stacks:stacks,potency:e.statuses[name].potency};}
function getEntityStatuses(ctx,h,id){return entitySnapshot(entityById(ctx,h,id)).statuses;}
function clearEntityStatuses(ctx,h,id,name){var e=entityById(ctx,h,id);if(name===undefined||name===null||str(name)===''){e.statuses={};return true;}name=str(name);if(!own(e.statuses,name))return false;delete e.statuses[name];return true;}
function tickEntityStatuses(ctx,h,dt){var w=assertWorld(ctx,h),d=clamp(dt||0,0,10),events=[],k,e,n,st;for(k in w.entities){if(!own(w.entities,k))continue;e=w.entities[k];if(!e.statuses)continue;for(n in e.statuses){if(!own(e.statuses,n))continue;st=e.statuses[n];st.duration=Math.max(0,st.duration-d);if(st.tickEvery>0&&st.tickValue!==0){st.tickClock+=d;while(st.tickClock>=st.tickEvery){st.tickClock-=st.tickEvery;events.push({entityId:e.id,status:n,type:'tick',value:st.tickValue*st.stacks,potency:st.potency});if(events.length>=2048)break;}}if(st.duration<=0){events.push({entityId:e.id,status:n,type:'expired',value:0,potency:st.potency});delete e.statuses[n];}if(events.length>=2048)break;}if(events.length>=2048)break;}return{events:events};}
function normalizeTimelineEvent(v,i){var e=v&&typeof v==='object'?v:{};return{id:e.id===undefined?('event'+i):str(e.id),at:Math.max(0,num(e.at,0)),name:str(e.name,e.id===undefined?('event'+i):e.id),data:e.data===undefined?null:e.data,once:e.once!==false,fired:!!e.fired};}
function createTimeline(ctx,h,spec){assertSurface(ctx,h);var q=spec&&typeof spec==='object'?spec:{},id=++SDK.nextTimeline,events=[],src=Array.isArray(q.events)?q.events:[];for(var i=0;i<Math.min(src.length,2048);i++)events.push(normalizeTimelineEvent(src[i],i));events.sort(function(a,b){return a.at-b.at;});SDK.timelines[String(id)]={handle:id,pid:Number(ctx.pid)||0,surface:parseInt(h,10)||0,time:Math.max(0,num(q.time,0)),duration:Math.max(0,num(q.duration,events.length?events[events.length-1].at:0)),loop:!!q.loop,paused:!!q.paused,speed:clamp(q.speed===undefined?1:q.speed,.05,16),events:events};return getTimelineState(ctx,id);}
function destroyTimeline(ctx,h){var t=assertTimeline(ctx,h);delete SDK.timelines[String(t.handle)];return true;}
function scheduleTimelineEvent(ctx,h,spec){var t=assertTimeline(ctx,h),e=normalizeTimelineEvent(spec,t.events.length);if(t.events.length>=4096)throw new Error('STATUS_QUOTA_EXCEEDED: timeline event limit reached.');t.events.push(e);t.events.sort(function(a,b){return a.at-b.at;});t.duration=Math.max(t.duration,e.at);return{id:e.id,at:e.at,name:e.name};}
function resetTimeline(ctx,h,time){var t=assertTimeline(ctx,h);t.time=Math.max(0,num(time,0));for(var i=0;i<t.events.length;i++)t.events[i].fired=false;return getTimelineState(ctx,h);}
function setTimelineState(ctx,h,patch){var t=assertTimeline(ctx,h),p=patch&&typeof patch==='object'?patch:{};if(p.paused!==undefined)t.paused=!!p.paused;if(p.speed!==undefined)t.speed=clamp(p.speed,.05,16);if(p.loop!==undefined)t.loop=!!p.loop;if(p.time!==undefined)return resetTimeline(ctx,h,p.time);return getTimelineState(ctx,h);}
function advanceTimeline(ctx,h,dt){var t=assertTimeline(ctx,h),d=clamp(dt||0,0,10),from=t.time,to=from+(t.paused?0:d*t.speed),fired=[];if(!t.paused){for(var i=0;i<t.events.length;i++){var e=t.events[i];if(e.fired&&e.once)continue;if(e.at>from&&e.at<=to || (from===0&&e.at===0&&!e.fired)){fired.push({id:e.id,name:e.name,at:e.at,data:e.data});if(e.once)e.fired=true;}}t.time=to;if(t.loop&&t.duration>0&&t.time>=t.duration){t.time=t.time%t.duration;for(var j=0;j<t.events.length;j++)t.events[j].fired=false;}else if(t.duration>0)t.time=Math.min(t.time,t.duration);}return{handle:t.handle,time:t.time,duration:t.duration,paused:t.paused,loop:t.loop,speed:t.speed,events:fired,finished:!t.loop&&t.duration>0&&t.time>=t.duration};}
function getTimelineState(ctx,h){var t=assertTimeline(ctx,h);return{handle:t.handle,time:t.time,duration:t.duration,paused:t.paused,loop:t.loop,speed:t.speed,eventCount:t.events.length};}
function normalizeQuest(v,id){var q=v&&typeof v==='object'?v:{},target=Math.max(0,num(q.target,1)),progress=clamp(q.progress||0,0,target||999999);return{id:str(q.id,id),title:str(q.title,q.id||id),description:str(q.description,''),state:['inactive','active','complete','failed'].indexOf(str(q.state,'inactive'))>=0?str(q.state,'inactive'):'inactive',progress:progress,target:target,data:q.data===undefined?null:q.data};}
function createQuestJournal(ctx,h,spec){assertSurface(ctx,h);var q=spec&&typeof spec==='object'?spec:{},id=++SDK.nextQuest,j={handle:id,pid:Number(ctx.pid)||0,surface:parseInt(h,10)||0,quests:{},order:[]},src=Array.isArray(q.quests)?q.quests:[];for(var i=0;i<Math.min(src.length,512);i++){var x=normalizeQuest(src[i],'quest'+i);j.quests[x.id]=x;j.order.push(x.id);}SDK.quests[String(id)]=j;return getQuestJournal(ctx,id);}
function destroyQuestJournal(ctx,h){var j=assertQuest(ctx,h);delete SDK.quests[String(j.handle)];return true;}
function upsertQuest(ctx,h,spec){var j=assertQuest(ctx,h),q=normalizeQuest(spec,'quest'+j.order.length),old=j.quests[q.id];if(old){q.progress=spec&&spec.progress===undefined?old.progress:q.progress;q.state=spec&&spec.state===undefined?old.state:q.state;}else{if(j.order.length>=512)throw new Error('STATUS_QUOTA_EXCEEDED: quest journal limit reached.');j.order.push(q.id);}j.quests[q.id]=q;return q;}
function setQuestState(ctx,h,id,state){var j=assertQuest(ctx,h),q=j.quests[str(id)];if(!q)throw new Error('STATUS_NOT_FOUND: quest not found.');state=str(state);if(['inactive','active','complete','failed'].indexOf(state)<0)throw new Error('STATUS_INVALID_PARAMETER: invalid quest state.');q.state=state;if(state==='complete'&&q.target>0)q.progress=q.target;return q;}
function updateQuestProgress(ctx,h,id,value,opt){var j=assertQuest(ctx,h),q=j.quests[str(id)],o=opt&&typeof opt==='object'?opt:{};if(!q)throw new Error('STATUS_NOT_FOUND: quest not found.');q.progress=clamp(o.absolute?num(value):q.progress+num(value),0,q.target||999999);if(q.state==='inactive')q.state='active';if(o.autoComplete!==false&&q.target>0&&q.progress>=q.target)q.state='complete';return q;}
function getQuestJournal(ctx,h,opt){var j=assertQuest(ctx,h),o=opt&&typeof opt==='object'?opt:{},out=[];for(var i=0;i<j.order.length;i++){var q=j.quests[j.order[i]];if(!q)continue;if(o.state&&q.state!==o.state)continue;out.push({id:q.id,title:q.title,description:q.description,state:q.state,progress:q.progress,target:q.target,data:q.data});}return{handle:j.handle,quests:out,count:out.length};}
function createInventory(ctx,h,spec){assertSurface(ctx,h);var q=spec&&typeof spec==='object'?spec:{},id=++SDK.nextInventory,inv={handle:id,pid:Number(ctx.pid)||0,surface:parseInt(h,10)||0,capacity:Math.round(clamp(q.capacity||64,1,512)),items:{},order:[],equipment:{}};SDK.inventories[String(id)]=inv;if(Array.isArray(q.items))for(var i=0;i<q.items.length;i++)addInventoryItem(ctx,id,q.items[i]);return getInventory(ctx,id);}
function destroyInventory(ctx,h){var inv=assertInventory(ctx,h);delete SDK.inventories[String(inv.handle)];return true;}
function addInventoryItem(ctx,h,spec){var inv=assertInventory(ctx,h),q=spec&&typeof spec==='object'?spec:{},id=str(q.id,q.name).trim();if(!id)throw new Error('STATUS_INVALID_PARAMETER: item id is required.');var count=Math.max(1,Math.round(num(q.count,1))),maxStack=Math.round(clamp(q.maxStack||99,1,9999)),it=inv.items[id];if(!it){if(inv.order.length>=inv.capacity)throw new Error('STATUS_QUOTA_EXCEEDED: inventory capacity reached.');it={id:id,name:str(q.name,id),count:0,maxStack:maxStack,tags:Array.isArray(q.tags)?q.tags.slice(0,32).map(str):[],data:q.data===undefined?null:q.data};inv.items[id]=it;inv.order.push(id);}it.count=Math.min(it.maxStack,it.count+count);return{id:it.id,name:it.name,count:it.count,maxStack:it.maxStack,tags:it.tags.slice(),data:it.data};}
function removeInventoryItem(ctx,h,id,count){var inv=assertInventory(ctx,h),k=str(id),it=inv.items[k];if(!it)return{removed:0,count:0};var n=Math.max(1,Math.round(num(count,1))),removed=Math.min(n,it.count);it.count-=removed;if(it.count<=0){delete inv.items[k];inv.order=inv.order.filter(function(x){return x!==k;});for(var slot in inv.equipment)if(own(inv.equipment,slot)&&inv.equipment[slot]===k)delete inv.equipment[slot];}return{removed:removed,count:it.count};}
function equipInventoryItem(ctx,h,slot,id){var inv=assertInventory(ctx,h),s=str(slot).trim(),k=str(id).trim();if(!s||!k)throw new Error('STATUS_INVALID_PARAMETER: slot and item id are required.');if(!inv.items[k]||inv.items[k].count<=0)throw new Error('STATUS_NOT_FOUND: inventory item not found.');inv.equipment[s]=k;return{slot:s,itemId:k};}
function unequipInventorySlot(ctx,h,slot){var inv=assertInventory(ctx,h),s=str(slot).trim(),old=inv.equipment[s]||null;if(old!==null)delete inv.equipment[s];return{slot:s,itemId:old};}
function getInventory(ctx,h){var inv=assertInventory(ctx,h),items=[];for(var i=0;i<inv.order.length;i++){var it=inv.items[inv.order[i]];if(it)items.push({id:it.id,name:it.name,count:it.count,maxStack:it.maxStack,tags:it.tags.slice(),data:it.data});}var eq={};for(var k in inv.equipment)if(own(inv.equipment,k))eq[k]=inv.equipment[k];return{handle:inv.handle,capacity:inv.capacity,items:items,equipment:eq};}
function computeCameraRail(target,points,opt){target=target&&typeof target==='object'?target:{};points=Array.isArray(points)?points:[];opt=opt&&typeof opt==='object'?opt:{};if(!points.length)return{x:0,y:0,zoom:1,segment:-1,t:0};if(points.length===1)return{x:num(points[0].x),y:num(points[0].y),zoom:num(points[0].zoom,1),segment:0,t:0};var axis=str(opt.axis,'x')==='y'?'y':'x',v=num(target[axis]),idx=0;for(var i=0;i<points.length-1;i++){var a=num(points[i][axis]),b=num(points[i+1][axis]);if((v>=a&&v<=b)||(v<=a&&v>=b)){idx=i;break;}if(v>b)idx=i;}var p0=points[idx],p1=points[Math.min(points.length-1,idx+1)],den=num(p1[axis])-num(p0[axis]),t=den===0?0:clamp((v-num(p0[axis]))/den,0,1),e=easeValue(str(opt.ease,'smoothstep'),t);return{x:num(p0.x)+(num(p1.x)-num(p0.x))*e,y:num(p0.y)+(num(p1.y)-num(p0.y))*e,zoom:num(p0.zoom,1)+(num(p1.zoom,1)-num(p0.zoom,1))*e,segment:idx,t:t};}
function resolveCombatEffects(spec){var s=spec&&typeof spec==='object'?spec:{},hp=num(s.hp,0),mp=num(s.mp,0),shield=num(s.shield,0),effects=Array.isArray(s.effects)?s.effects:[],events=[];for(var i=0;i<Math.min(effects.length,128);i++){var e=effects[i]&&typeof effects[i]==='object'?effects[i]:{},type=str(e.type).toLowerCase(),value=num(e.value,0);if(type==='damage'){var d=calculateDamage(e);hp-=d.amount;events.push({type:'damage',amount:d.amount,critical:d.critical});}else if(type==='heal'){hp+=Math.max(0,value);events.push({type:'heal',amount:Math.max(0,value)});}else if(type==='mp'){mp+=value;events.push({type:'mp',amount:value});}else if(type==='shield'){shield+=value;events.push({type:'shield',amount:value});}}if(s.maxHp!==undefined)hp=clamp(hp,0,num(s.maxHp));if(s.maxMp!==undefined)mp=clamp(mp,0,num(s.maxMp));shield=Math.max(0,shield);return{hp:hp,mp:mp,shield:shield,events:events};}
function calculateDamage(spec){var s=spec&&typeof spec==='object'?spec:{},atk=Math.max(0,num(s.attack,10)),def=Math.max(0,num(s.defense,0)),power=Math.max(0,num(s.power,1)),flat=num(s.flat,0),pierce=clamp(s.pierce||0,0,1),effectiveDef=def*(1-pierce),base=Math.max(num(s.minDamage,1),atk*power-effectiveDef*.55+flat),variance=clamp(s.variance===undefined?.08:s.variance,0,.75),roll=s.roll===undefined?Math.random():clamp(s.roll,0,1),varMul=1+(roll*2-1)*variance,critRoll=s.critRoll===undefined?Math.random():clamp(s.critRoll,0,1),critical=critRoll<clamp(s.critChance||0,0,1),critMul=critical?Math.max(1,num(s.critMultiplier,1.5)):1,amount=Math.max(num(s.minDamage,1),Math.round(base*varMul*critMul));return{amount:amount,base:base,critical:critical,roll:roll,critRoll:critRoll,effectiveDefense:effectiveDef};}
function queryTilemapRegion(ctx,h,rect,opt){var t=assertTilemap(ctx,h),r=rect&&typeof rect==='object'?rect:{},o=opt&&typeof opt==='object'?opt:{},tileCoords=!!o.tileCoordinates,x0,y0,x1,y1;if(tileCoords){x0=Math.floor(num(r.x));y0=Math.floor(num(r.y));x1=Math.floor(num(r.x)+Math.max(1,num(r.w,1))-1);y1=Math.floor(num(r.y)+Math.max(1,num(r.h,1))-1);}else{x0=Math.floor((num(r.x)-t.originX)/t.tileWidth);y0=Math.floor((num(r.y)-t.originY)/t.tileHeight);x1=Math.floor((num(r.x)+Math.max(1,num(r.w,1))-1-t.originX)/t.tileWidth);y1=Math.floor((num(r.y)+Math.max(1,num(r.h,1))-1-t.originY)/t.tileHeight);}x0=Math.max(0,x0);y0=Math.max(0,y0);x1=Math.min(t.cols-1,x1);y1=Math.min(t.rows-1,y1);var cells=[],solid=0,v,p;for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++){v=t.tiles[y*t.cols+x];p=t.palette[v]||{};if(tileSolid(t,v))solid++;cells.push({x:x,y:y,tile:v,solid:!!(p&&p.solid)});if(cells.length>=4096)return{cells:cells,solidCount:solid,truncated:true};}return{cells:cells,solidCount:solid,truncated:false,bounds:{x0:x0,y0:y0,x1:x1,y1:y1}};}
function computeCameraZone(target,zones,opt){target=target&&typeof target==='object'?target:{};zones=Array.isArray(zones)?zones:[];opt=opt&&typeof opt==='object'?opt:{};var cx=num(target.x)+num(target.w,0)/2,cy=num(target.y)+num(target.h,0)/2,chosen=null;for(var i=0;i<zones.length;i++){var z=zones[i]&&typeof zones[i]==='object'?zones[i]:{};if(cx>=num(z.x)&&cy>=num(z.y)&&cx<=num(z.x)+Math.max(0,num(z.w))&&cy<=num(z.y)+Math.max(0,num(z.h))){chosen=z;break;}}var b=chosen&&chosen.cameraBounds?chosen.cameraBounds:(chosen||opt.worldBounds||{}),camera=computeCamera(target,b,opt);return{camera:camera,zoneId:chosen?str(chosen.id,''):null};}
function navigateMenu(state,input){var s=state&&typeof state==='object'?state:{},i=input&&typeof input==='object'?input:{},count=Math.max(1,Math.round(num(s.count,1))),cols=Math.max(1,Math.round(num(s.columns,1))),idx=Math.round(clamp(s.index||0,0,count-1)),wrap=s.wrap!==false;if(i.home)idx=0;else if(i.end)idx=count-1;else{var dx=Math.round(num(i.dx,0)),dy=Math.round(num(i.dy,0)),next=idx+dx+dy*cols;if(wrap){next=((next%count)+count)%count;}else next=Math.round(clamp(next,0,count-1));idx=next;}return{index:idx,row:Math.floor(idx/cols),column:idx%cols,count:count,columns:cols};}
function computeCamera(target,bounds,opt){target=target&&typeof target==='object'?target:{};bounds=bounds&&typeof bounds==='object'?bounds:{};opt=opt&&typeof opt==='object'?opt:{};var vw=Math.max(1,num(opt.viewportWidth,960)),vh=Math.max(1,num(opt.viewportHeight,540)),tx=num(target.x)+num(target.w,0)/2,ty=num(target.y)+num(target.h,0)/2,x=tx-vw/2+num(opt.lookAheadX,0),y=ty-vh/2+num(opt.lookAheadY,0),bw=Math.max(0,num(bounds.w,0)),bh=Math.max(0,num(bounds.h,0));if(bw>0)x=clamp(x,num(bounds.x,0),Math.max(num(bounds.x,0),num(bounds.x,0)+bw-vw));if(bh>0)y=clamp(y,num(bounds.y,0),Math.max(num(bounds.y,0),num(bounds.y,0)+bh-vh));if(opt.previous&&typeof opt.previous==='object'){var s=clamp(opt.smoothing===undefined?1:opt.smoothing,0,1);x=num(opt.previous.x)+(x-num(opt.previous.x))*s;y=num(opt.previous.y)+(y-num(opt.previous.y))*s;}return{x:x,y:y};}
function addCameraShake(camera,spec){camera=camera&&typeof camera==='object'?camera:{};spec=spec&&typeof spec==='object'?spec:{};var a=Math.max(0,num(spec.amplitude,6))*clamp(spec.strength===undefined?1:spec.strength,0,1);return{x:num(camera.x)+(Math.random()*2-1)*a,y:num(camera.y)+(Math.random()*2-1)*a};}

function blendMode(v){v=str(v,'source-over').toLowerCase();var m={normal:'source-over',add:'lighter',additive:'lighter',multiply:'multiply',screen:'screen',overlay:'overlay',darken:'darken',lighten:'lighten','source-over':'source-over'};return m[v]||'source-over';}
function layerSnapshot(l){return{handle:l.handle,name:l.name,scrollX:l.scrollX,scrollY:l.scrollY,opacity:l.opacity,priority:l.priority,blend:l.blend,visible:l.visible,scrollFactorX:l.scrollFactorX,scrollFactorY:l.scrollFactorY};}
function createLayer(ctx,h,spec){var r=assertSurface(ctx,h),q=spec&&typeof spec==='object'?spec:{},id=++SDK.nextLayer,l={handle:id,pid:Number(ctx.pid)||0,surface:r.handle,name:str(q.name,'Layer '+id),scrollX:num(q.scrollX,0),scrollY:num(q.scrollY,0),opacity:clamp(q.opacity===undefined?1:q.opacity,0,1),priority:num(q.priority,0),blend:blendMode(q.blend),visible:q.visible!==false,scrollFactorX:num(q.scrollFactorX,1),scrollFactorY:num(q.scrollFactorY,1)};SDK.layers[String(id)]=l;return layerSnapshot(l);}
function destroyLayer(ctx,h){var l=assertLayer(ctx,h);delete SDK.layers[String(l.handle)];return true;}
function setLayerScroll(ctx,h,x,y){var l=assertLayer(ctx,h);if(x&&typeof x==='object'){y=x.y;x=x.x;}l.scrollX=num(x,l.scrollX);l.scrollY=num(y,l.scrollY);return layerSnapshot(l);}
function setLayerOpacity(ctx,h,v){var l=assertLayer(ctx,h);l.opacity=clamp(v,0,1);return layerSnapshot(l);}
function setLayerPriority(ctx,h,v){var l=assertLayer(ctx,h);l.priority=num(v,l.priority);return layerSnapshot(l);}
function setLayerBlend(ctx,h,v){var l=assertLayer(ctx,h);l.blend=blendMode(v);return layerSnapshot(l);}
function setLayerVisible(ctx,h,v){var l=assertLayer(ctx,h);l.visible=!!v;return layerSnapshot(l);}
function setLayerScrollFactor(ctx,h,x,y){var l=assertLayer(ctx,h);if(x&&typeof x==='object'){y=x.y;x=x.x;}l.scrollFactorX=num(x,l.scrollFactorX);l.scrollFactorY=num(y,l.scrollFactorY);return layerSnapshot(l);}
function getLayerInfo(ctx,h){return layerSnapshot(assertLayer(ctx,h));}

function createSpriteBatch(ctx,h,spec){var r=assertSurface(ctx,h),q=spec&&typeof spec==='object'?spec:{},id=++SDK.nextSpriteBatch,b={handle:id,pid:Number(ctx.pid)||0,surface:r.handle,maxSprites:Math.round(clamp(q.maxSprites||2048,1,8192)),nextSprite:0,sprites:{},order:[]};SDK.spriteBatches[String(id)]=b;return{handle:id,maxSprites:b.maxSprites};}
function destroySpriteBatch(ctx,h){var b=assertSpriteBatch(ctx,h);delete SDK.spriteBatches[String(b.handle)];return true;}
function normalizeSprite(q,id){q=q&&typeof q==='object'?q:{};return{id:id,texture:parseInt(q.texture,10)||0,x:num(q.x),y:num(q.y),w:num(q.w||q.dw,32),h:num(q.h||q.dh,32),sx:num(q.sx),sy:num(q.sy),sw:q.sw===undefined?0:num(q.sw),sh:q.sh===undefined?0:num(q.sh),z:num(q.z,0),flipX:!!q.flipX,flipY:!!q.flipY,rotation:num(q.rotation),scaleX:q.scaleX===undefined?1:num(q.scaleX,1),scaleY:q.scaleY===undefined?1:num(q.scaleY,1),alpha:clamp(q.alpha===undefined?1:q.alpha,0,1),tint:q.tint===undefined?null:color(q.tint,'#ffffff'),visible:q.visible!==false,data:q.data===undefined?null:q.data};}
function addSprite(ctx,h,spec){var b=assertSpriteBatch(ctx,h);if(b.order.length>=b.maxSprites)throw new Error('STATUS_QUOTA_EXCEEDED: sprite batch is full.');var id=++b.nextSprite,sp=normalizeSprite(spec,id);b.sprites[String(id)]=sp;b.order.push(id);return{id:id};}
function updateSprite(ctx,h,id,patch){var b=assertSpriteBatch(ctx,h),k=String(parseInt(id,10)||0),sp=b.sprites[k];if(!sp)throw new Error('STATUS_NOT_FOUND: sprite not found.');patch=patch&&typeof patch==='object'?patch:{};var merged={};for(var x in sp)if(own(sp,x))merged[x]=sp[x];for(var y in patch)if(own(patch,y))merged[y]=patch[y];sp=normalizeSprite(merged,sp.id);b.sprites[k]=sp;return{id:sp.id,x:sp.x,y:sp.y,z:sp.z,visible:sp.visible};}
function removeSprite(ctx,h,id){var b=assertSpriteBatch(ctx,h),k=String(parseInt(id,10)||0);if(!b.sprites[k])return false;delete b.sprites[k];b.order=b.order.filter(function(v){return String(v)!==k;});return true;}
function clearSpriteBatch(ctx,h){var b=assertSpriteBatch(ctx,h);b.sprites={};b.order=[];return true;}
function renderSpriteBatch(ctx,h,opt){assertSpriteBatch(ctx,h);opt=opt&&typeof opt==='object'?opt:{};return{type:'spritebatch',batch:parseInt(h,10)||0,x:num(opt.x),y:num(opt.y),alpha:opt.alpha===undefined?1:clamp(opt.alpha,0,1)};}
function drawSpriteBatch(r,c){var b=spriteBatchRecord(c.batch);if(!b||Number(b.pid)!==Number(r.pid))return;var arr=[],i,sp;for(i=0;i<b.order.length;i++){sp=b.sprites[String(b.order[i])];if(sp&&sp.visible)arr.push(sp);}arr.sort(function(a,z){return a.z-z.z||a.id-z.id;});for(i=0;i<arr.length;i++){sp=arr[i];var t=textureRecord(sp.texture);if(!t||Number(t.pid)!==Number(r.pid)||!t.image)continue;var g=r.g,w=sp.w,h=sp.h,sx=sp.sx,sy=sp.sy,sw=sp.sw||t.width,sh=sp.sh||t.height;g.save();g.globalAlpha*=sp.alpha*clamp(c.alpha===undefined?1:c.alpha,0,1);g.translate(sp.x+num(c.x)+w/2,sp.y+num(c.y)+h/2);g.rotate(sp.rotation);g.scale((sp.flipX?-1:1)*sp.scaleX,(sp.flipY?-1:1)*sp.scaleY);try{g.drawImage(t.image,sx,sy,sw,sh,-w/2,-h/2,w,h);if(sp.tint){g.globalCompositeOperation='source-atop';g.fillStyle=sp.tint;g.fillRect(-w/2,-h/2,w,h);}}catch(ignore){}g.restore();}}

function tileEntry(t,v){var p=t.palette[v]||{};if(typeof p==='string')p={fill:p};if(p&&Array.isArray(p.animation)&&p.animation.length){var dur=Math.max(.02,num(p.frameDuration,.14)),idx=Math.floor(t.time/dur)%p.animation.length,n=p.animation[idx];if(typeof n==='number'){var base=t.palette[n]||{};if(typeof base==='string')base={fill:base};var merged={};for(var k in base)if(own(base,k))merged[k]=base[k];for(var q in p)if(own(p,q)&&q!=='animation')merged[q]=p[q];p=merged;}else if(n&&typeof n==='object'){var m={};for(var a in p)if(own(p,a)&&a!=='animation')m[a]=p[a];for(var b in n)if(own(n,b))m[b]=n[b];p=m;}}return p||{};}
function advanceTilemapAnimation(ctx,h,dt){var t=assertTilemap(ctx,h);t.time+=clamp(dt||0,0,1);return{time:t.time};}
function setTileFlags(ctx,h,x,y,flags){var t=assertTilemap(ctx,h);x=Math.floor(num(x));y=Math.floor(num(y));if(x<0||y<0||x>=t.cols||y>=t.rows)return false;t.cellFlags[y*t.cols+x]=flags&&typeof flags==='object'?flags:null;t.cacheDirty=true;return true;}
function getTileProperties(ctx,h,x,y){var t=assertTilemap(ctx,h);x=Math.floor(num(x));y=Math.floor(num(y));if(x<0||y<0||x>=t.cols||y>=t.rows)return null;var idx=y*t.cols+x,v=t.tiles[idx],p=tileEntry(t,v),f=t.cellFlags[idx]||{};return{tile:v,properties:p.properties||null,priority:num(f.priority,p.priority||0),flipX:!!(f.flipX||p.flipX),flipY:!!(f.flipY||p.flipY),palette:f.palette===undefined?p.palette:f.palette};}
function setTileProperties(ctx,h,tile,props){var t=assertTilemap(ctx,h),i=Math.max(0,Math.floor(num(tile)));if(i>=512)throw new Error('STATUS_INVALID_PARAMETER: tile index out of range.');var p=t.palette[i];if(typeof p==='string')p={fill:p};if(!p||typeof p!=='object')p={};p.properties=props&&typeof props==='object'?props:{};t.palette[i]=p;t.cacheDirty=true;return true;}

function normalizeCameraTransform(cam){cam=cam&&typeof cam==='object'?cam:{};return{x:num(cam.x),y:num(cam.y),zoom:clamp(cam.zoom===undefined?1:cam.zoom,.05,32),rotation:num(cam.rotation),scaleX:cam.scaleX===undefined?1:num(cam.scaleX,1),scaleY:cam.scaleY===undefined?1:num(cam.scaleY,1)};}
function cameraForLayer(cam,l){var c=normalizeCameraTransform(cam);if(l){c.x=c.x*l.scrollFactorX+l.scrollX;c.y=c.y*l.scrollFactorY+l.scrollY;}return c;}
function transformedCamera(c){return Math.abs(c.zoom-1)>.0001||Math.abs(c.rotation)>.0001||Math.abs(c.scaleX-1)>.0001||Math.abs(c.scaleY-1)>.0001;}
function beginCamera(g,r,c){g.translate(r.width/2,r.height/2);g.rotate(-c.rotation);g.scale(c.zoom*c.scaleX,c.zoom*c.scaleY);g.translate(-r.width/2-c.x,-r.height/2-c.y);}
function screenToWorldTransformed(r,q,cam){var c=normalizeCameraTransform(cam),sx=(num(q.x)-r.width/2)/(c.zoom*c.scaleX),sy=(num(q.y)-r.height/2)/(c.zoom*c.scaleY),co=Math.cos(c.rotation),si=Math.sin(c.rotation);return{x:sx*co-sy*si+r.width/2+c.x,y:sx*si+sy*co+r.height/2+c.y};}

function scanValue(spec,y,h,def){if(spec===null||spec===undefined)return def;if(typeof spec==='number')return spec;if(Array.isArray(spec)){if(!spec.length)return def;return spec[Math.max(0,Math.min(spec.length-1,Math.floor(y*spec.length/h)))];}if(typeof spec==='object'){var start=Math.max(0,num(spec.start,0)),end=Math.min(h-1,num(spec.end,h-1));if(y<start||y>end)return def;if(Array.isArray(spec.values)&&spec.values.length){var k=Math.floor((y-start)/Math.max(1,end-start+1)*spec.values.length);return spec.values[Math.min(spec.values.length-1,k)];}return num(spec.base,def)+Math.sin(num(spec.phase,0)+y*num(spec.frequency,.08))*num(spec.amplitude,0);}return def;}
function setScanlineScroll(ctx,h,spec){var r=assertSurface(ctx,h);r.raster.scroll=spec===null?null:spec;return true;}
function setScanlineScale(ctx,h,spec){var r=assertSurface(ctx,h);r.raster.scale=spec===null?null:spec;return true;}
function setScanlineColor(ctx,h,spec){var r=assertSurface(ctx,h);r.raster.color=spec===null?null:spec;return true;}
function setScanlineWarp(ctx,h,spec){var r=assertSurface(ctx,h);r.raster.warp=spec===null?null:spec;return true;}
function clearScanlineEffects(ctx,h){var r=assertSurface(ctx,h);r.raster={scroll:null,scale:null,color:null,warp:null};return true;}
function ensureRasterScratch(r){if(!r.rasterScratch){r.rasterScratch=document.createElement('canvas');}if(r.rasterScratch.width!==r.width||r.rasterScratch.height!==r.height){r.rasterScratch.width=r.width;r.rasterScratch.height=r.height;}return r.rasterScratch;}
function applyRasterEffects(r){var rs=r.raster;if(!rs||(!rs.scroll&&!rs.scale&&!rs.color&&!rs.warp))return;var sc=ensureRasterScratch(r),sg=sc.getContext('2d');sg.setTransform(1,0,0,1,0,0);sg.clearRect(0,0,r.width,r.height);sg.drawImage(r.canvas,0,0);var g=r.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,r.width,r.height);for(var y=0;y<r.height;y++){var dx=num(scanValue(rs.scroll,y,r.height,0),0),scale=clamp(scanValue(rs.scale,y,r.height,1),.05,8),warp=num(scanValue(rs.warp,y,r.height,0),0),dw=r.width*scale,destX=(r.width-dw)/2+dx+warp;g.drawImage(sc,0,y,r.width,1,destX,y,dw,1);var cc=rs.color;if(cc){var col=typeof cc==='string'?cc:(Array.isArray(cc)?scanValue(cc,y,r.height,''):(cc.color||'')),alpha=typeof cc==='object'&&!Array.isArray(cc)?clamp(cc.alpha===undefined?.12:cc.alpha,0,1):.12;if(col){g.globalAlpha=alpha;g.fillStyle=col;g.fillRect(0,y,r.width,1);g.globalAlpha=1;}}}}

function audioMixFor(pid){var k=String(Number(pid)||0),m=SDK.audioMix[k];if(!m){m={musicVolume:.7,channels:{},musicVoice:null};SDK.audioMix[k]=m;}return m;}
function channelVolume(pid,ch){var m=audioMixFor(pid),k=String(Math.max(0,Math.floor(num(ch,0))));return m.channels[k]===undefined?1:clamp(m.channels[k],0,1);}
async function decodeAudioDataUrl(dataUrl){var ac=ensureAudio();if(!ac)throw new Error('STATUS_NOT_SUPPORTED: Web Audio is unavailable.');dataUrl=str(dataUrl);if(!/^data:audio\//i.test(dataUrl))throw new Error('STATUS_INVALID_PARAMETER: audio data URL required.');if(dataUrl.length>48*1024*1024)throw new Error('STATUS_FILE_TOO_LARGE: audio data URL exceeds 48 MiB.');var ab=await (await fetch(dataUrl)).arrayBuffer();return await new Promise(function(resolve,reject){var done=false,ok=function(b){if(!done){done=true;resolve(b);}},bad=function(){if(!done){done=true;reject(new Error('STATUS_INVALID_AUDIO_FORMAT: decode failed.'));}};try{var p=ac.decodeAudioData(ab,ok,bad);if(p&&typeof p.then==='function')p.then(ok,bad);}catch(e){bad();}});}
async function loadAudioBuffer(ctx,h,dataUrl,spec,kind){assertSurface(ctx,h);var buf=await decodeAudioDataUrl(dataUrl),id=++SDK.nextAudioBuffer,q=spec&&typeof spec==='object'?spec:{};SDK.audioBuffers[String(id)]={handle:id,pid:Number(ctx.pid)||0,buffer:buf,kind:kind,name:str(q.name,kind),duration:num(buf.duration)};return{handle:id,duration:num(buf.duration),channels:num(buf.numberOfChannels),sampleRate:num(buf.sampleRate),kind:kind};}
async function loadSample(ctx,h,dataUrl,spec){return await loadAudioBuffer(ctx,h,dataUrl,spec,'sample');}
async function loadMusic(ctx,h,dataUrl,spec){return await loadAudioBuffer(ctx,h,dataUrl,spec,'music');}
function unloadAudioBuffer(ctx,h){var b=assertAudioBuffer(ctx,h);delete SDK.audioBuffers[String(b.handle)];return true;}
function playAudioBuffer(ctx,h,spec,kind){var b=assertAudioBuffer(ctx,h),q=spec&&typeof spec==='object'?spec:{},ac=ensureAudio();if(!ac)return{played:false};if(kind&&b.kind!==kind)throw new Error('STATUS_INVALID_PARAMETER: audio buffer kind mismatch.');var source=ac.createBufferSource(),gain=ac.createGain(),pan=ac.createStereoPanner?ac.createStereoPanner():null,id=++SDK.nextAudioVoice,ch=Math.max(0,Math.floor(num(q.channel,0))),mix=audioMixFor(ctx.pid),baseVol=clamp(q.volume===undefined?1:q.volume,0,2)*(b.kind==='music'?mix.musicVolume:1)*channelVolume(ctx.pid,ch);source.buffer=b.buffer;source.loop=!!q.loop;source.playbackRate.value=clamp(q.rate===undefined?1:q.rate,.25,4);gain.gain.value=baseVol;if(pan){pan.pan.value=clamp(q.pan||0,-1,1);source.connect(gain);gain.connect(pan);pan.connect(ac.destination);}else{source.connect(gain);gain.connect(ac.destination);}var v={handle:id,pid:Number(ctx.pid)||0,source:source,gain:gain,pan:pan,buffer:b.handle,kind:b.kind,channel:ch,volume:clamp(q.volume===undefined?1:q.volume,0,2)};SDK.audioVoices[String(id)]=v;if(b.kind==='music')mix.musicVoice=id;source.onended=function(){delete SDK.audioVoices[String(id)];if(mix.musicVoice===id)mix.musicVoice=null;};source.start(0,Math.max(0,num(q.offset,0)));return{played:true,voice:id,duration:b.duration,kind:b.kind};}
function playSample(ctx,h,spec){return playAudioBuffer(ctx,h,spec,'sample');}
function stopSample(ctx,h){var v=assertAudioVoice(ctx,h);try{v.source.stop();}catch(ignore){}delete SDK.audioVoices[String(v.handle)];return true;}
function playMusic(ctx,h,spec){var mix=audioMixFor(ctx.pid);if(mix.musicVoice&&audioVoiceRecord(mix.musicVoice)){try{stopSample(ctx,mix.musicVoice);}catch(ignore){}}return playAudioBuffer(ctx,h,spec,'music');}
function stopMusic(ctx){var mix=audioMixFor(ctx.pid),id=mix.musicVoice;if(id&&audioVoiceRecord(id)){try{stopSample(ctx,id);}catch(ignore){}}mix.musicVoice=null;return true;}
function setMusicVolume(ctx,v){var mix=audioMixFor(ctx.pid);mix.musicVolume=clamp(v,0,1);for(var k in SDK.audioVoices)if(own(SDK.audioVoices,k)){var a=SDK.audioVoices[k];if(Number(a.pid)===Number(ctx.pid)&&a.kind==='music')a.gain.gain.value=a.volume*mix.musicVolume*channelVolume(ctx.pid,a.channel);}return mix.musicVolume;}
function setChannelVolume(ctx,ch,v){var mix=audioMixFor(ctx.pid),key=String(Math.max(0,Math.floor(num(ch,0))));mix.channels[key]=clamp(v,0,1);for(var k in SDK.audioVoices)if(own(SDK.audioVoices,k)){var a=SDK.audioVoices[k];if(Number(a.pid)===Number(ctx.pid)&&String(a.channel)===key)a.gain.gain.value=a.volume*(a.kind==='music'?mix.musicVolume:1)*mix.channels[key];}return mix.channels[key];}

function tilemapSourceCanvas(t){var w=Math.min(2048,t.cols*t.tileWidth),h=Math.min(2048,t.rows*t.tileHeight);if(!t.cacheCanvas){t.cacheCanvas=document.createElement('canvas');t.cacheDirty=true;}if(t.cacheCanvas.width!==w||t.cacheCanvas.height!==h){t.cacheCanvas.width=w;t.cacheCanvas.height=h;t.cacheDirty=true;}if(!t.cacheDirty)return t.cacheCanvas;var g=t.cacheCanvas.getContext('2d'),sx=w/(t.cols*t.tileWidth),sy=h/(t.rows*t.tileHeight);g.clearRect(0,0,w,h);for(var y=0;y<t.rows;y++)for(var x=0;x<t.cols;x++){var v=t.tiles[y*t.cols+x];if(!v)continue;var p=tileEntry(t,v);if(p.fill){g.fillStyle=color(p.fill,'#475569');g.fillRect(x*t.tileWidth*sx,y*t.tileHeight*sy,t.tileWidth*sx+.5,t.tileHeight*sy+.5);}}t.cacheDirty=false;return t.cacheCanvas;}
function createMode7Background(ctx,h,spec){var r=assertSurface(ctx,h),q=spec&&typeof spec==='object'?spec:{},id=++SDK.nextMode7,m={handle:id,pid:Number(ctx.pid)||0,surface:r.handle,texture:parseInt(q.texture,10)||0,tilemap:parseInt(q.tilemap,10)||0,horizon:clamp(q.horizon===undefined?r.height*.43:q.horizon,0,r.height-1),cameraX:num(q.cameraX),cameraY:num(q.cameraY),rotation:num(q.rotation),nearScale:clamp(q.nearScale===undefined?2.8:q.nearScale,.05,12),farScale:clamp(q.farScale===undefined?.18:q.farScale,.01,4),distance:num(q.distance,900),opacity:clamp(q.opacity===undefined?1:q.opacity,0,1),repeat:q.repeat!==false,scanlineStep:Math.round(clamp(q.scanlineStep||1,1,8)),scanlines:{scroll:null,scale:null,rotation:null,color:null}};if(!m.texture&&!m.tilemap)throw new Error('STATUS_INVALID_PARAMETER: Mode7 requires texture or tilemap source.');SDK.mode7[String(id)]=m;return{handle:id,horizon:m.horizon};}
function destroyMode7Background(ctx,h){var m=assertMode7(ctx,h);delete SDK.mode7[String(m.handle)];return true;}
function updateMode7Background(ctx,h,patch){var m=assertMode7(ctx,h),q=patch&&typeof patch==='object'?patch:{};['cameraX','cameraY','rotation','nearScale','farScale','distance','opacity','horizon'].forEach(function(k){if(q[k]!==undefined)m[k]=num(q[k],m[k]);});if(q.texture!==undefined)m.texture=parseInt(q.texture,10)||0;if(q.tilemap!==undefined)m.tilemap=parseInt(q.tilemap,10)||0;return{handle:m.handle,cameraX:m.cameraX,cameraY:m.cameraY,rotation:m.rotation,horizon:m.horizon};}
function setMode7Scanlines(ctx,h,spec){var m=assertMode7(ctx,h),q=spec&&typeof spec==='object'?spec:{};m.scanlines={scroll:q.scroll===undefined?m.scanlines.scroll:q.scroll,scale:q.scale===undefined?m.scanlines.scale:q.scale,rotation:q.rotation===undefined?m.scanlines.rotation:q.rotation,color:q.color===undefined?m.scanlines.color:q.color};return true;}
function renderMode7Background(ctx,h,opt){assertMode7(ctx,h);opt=opt&&typeof opt==='object'?opt:{};return{type:'mode7',mode7:parseInt(h,10)||0,alpha:opt.alpha===undefined?1:clamp(opt.alpha,0,1)};}
function mode7Source(m){if(m.texture){var t=textureRecord(m.texture);return t&&t.image?t.image:null;}if(m.tilemap){var tm=tilemapRecord(m.tilemap);return tm?tilemapSourceCanvas(tm):null;}return null;}
function drawMode7(r,c){var m=mode7Record(c.mode7);if(!m||Number(m.pid)!==Number(r.pid))return;var src=mode7Source(m);if(!src)return;var g=r.g,sw=src.width||1,sh=src.height||1,hz=clamp(m.horizon,0,r.height-1),step=m.scanlineStep,co=Math.cos(m.rotation),si=Math.sin(m.rotation);g.save();g.globalAlpha*=m.opacity*clamp(c.alpha===undefined?1:c.alpha,0,1);for(var y=Math.floor(hz);y<r.height;y+=step){var p=(y-hz+1)/Math.max(1,r.height-hz),scale=m.farScale+(m.nearScale-m.farScale)*p,slScale=num(scanValue(m.scanlines.scale,y,r.height,1),1),slScroll=num(scanValue(m.scanlines.scroll,y,r.height,0),0),slRot=num(scanValue(m.scanlines.rotation,y,r.height,0),0),dist=m.distance/Math.max(.025,p),sourceY=((m.cameraY+dist)%sh+sh)%sh;g.save();g.beginPath();g.rect(0,y,r.width,step);g.clip();g.translate(r.width/2+slScroll,y);g.rotate(m.rotation+slRot);g.scale(scale*slScale,1);var cx=((m.cameraX+dist*si)%sw+sw)%sw;for(var rep=-2;rep<=2;rep++)try{g.drawImage(src,0,Math.floor(sourceY),sw,Math.min(step,sh-Math.floor(sourceY)),-cx+rep*sw-r.width/(2*scale),0,sw,step);}catch(ignore){}g.restore();var cc=m.scanlines.color;if(cc){var col=typeof cc==='string'?cc:(cc.color||''),alpha=typeof cc==='object'?clamp(cc.alpha===undefined?.08:cc.alpha,0,1):.08;if(col){g.globalAlpha=alpha;g.fillStyle=col;g.fillRect(0,y,r.width,step);g.globalAlpha=m.opacity*clamp(c.alpha===undefined?1:c.alpha,0,1);}}}g.restore();}

function drawCommand(r,c,camX,camY){
  if(!c||typeof c!=='object')return;
  var g=r.g,type=str(c.type).toLowerCase(),x=num(c.x)-camX,y=num(c.y)-camY,w=num(c.w),h=num(c.h),i,pts,grad,a0,a1;
  g.save();applyPaint(g,c);
  if(c.translateX||c.translateY)g.translate(num(c.translateX),num(c.translateY));
  if(c.rotation){g.translate(x+(w/2),y+(h/2));g.rotate(num(c.rotation));x=-w/2;y=-h/2;}
  if(c.scaleX!==undefined||c.scaleY!==undefined)g.scale(c.scaleX===undefined?1:num(c.scaleX,1),c.scaleY===undefined?1:num(c.scaleY,1));
  if(type==='rect'){if(c.fill!==null)g.fillRect(x,y,w,h);if(c.stroke)g.strokeRect(x,y,w,h);}
  else if(type==='strokerect'){g.strokeRect(x,y,w,h);}
  else if(type==='roundrect'){pathRoundRect(g,x,y,w,h,c.radius);if(c.fill!==null)g.fill();if(c.stroke)g.stroke();}
  else if(type==='gradientrect'){grad=g.createLinearGradient(x,y,x+(c.horizontal?w:0),y+(c.horizontal?0:h));grad.addColorStop(0,color(c.top||c.left,'#111827'));grad.addColorStop(1,color(c.bottom||c.right,'#000000'));g.fillStyle=grad;g.fillRect(x,y,w,h);}
  else if(type==='circle'){g.beginPath();g.arc(x,y,Math.max(0,num(c.r,4)),0,Math.PI*2);if(c.fill!==null)g.fill();if(c.stroke)g.stroke();}
  else if(type==='ellipse'){g.beginPath();if(typeof g.ellipse==='function')g.ellipse(x,y,Math.max(0,num(c.rx,w/2||4)),Math.max(0,num(c.ry,h/2||4)),num(c.rotation,0),0,Math.PI*2);else g.arc(x,y,Math.max(0,num(c.rx,w/2||4)),0,Math.PI*2);if(c.fill!==null)g.fill();if(c.stroke)g.stroke();}
  else if(type==='arc'){a0=num(c.start,0);a1=num(c.end,Math.PI*2);g.beginPath();g.arc(x,y,Math.max(0,num(c.r,8)),a0,a1,!!c.ccw);if(c.fill){g.lineTo(x,y);g.closePath();g.fill();}if(c.stroke!==null)g.stroke();}
  else if(type==='line'){g.beginPath();g.moveTo(x,y);g.lineTo(num(c.x2)-camX,num(c.y2)-camY);g.stroke();}
  else if(type==='bezier'){g.beginPath();g.moveTo(x,y);g.bezierCurveTo(num(c.cx1)-camX,num(c.cy1)-camY,num(c.cx2)-camX,num(c.cy2)-camY,num(c.x2)-camX,num(c.y2)-camY);g.stroke();}
  else if(type==='poly'||type==='polygon'){pts=Array.isArray(c.points)?c.points:[];if(pts.length>=2){g.beginPath();g.moveTo(num(pts[0][0])-camX,num(pts[0][1])-camY);for(i=1;i<pts.length;i++)g.lineTo(num(pts[i][0])-camX,num(pts[i][1])-camY);if(c.closed!==false)g.closePath();if(c.fill!==null)g.fill();if(c.stroke)g.stroke();}}
  else if(type==='star'){drawStar(g,x,y,Math.max(0,num(c.r,12)),Math.max(0,num(c.innerR,num(c.r,12)*.45)),c.points,c.starRotation);if(c.fill!==null)g.fill();if(c.stroke)g.stroke();}
  else if(type==='text'){g.font=str(c.font,(c.bold?'700 ':'')+Math.max(8,num(c.size,16))+'px Segoe UI, Microsoft JhengHei, sans-serif');g.textAlign=c.align||'left';g.textBaseline=c.baseline||'alphabetic';if(c.stroke){g.strokeStyle=color(c.stroke,'#000');g.lineWidth=Math.max(1,num(c.lineWidth,2));g.strokeText(str(c.text),x,y);}g.fillText(str(c.text),x,y);}
  else if(type==='bar'){var ratio=clamp(c.value,0,1);g.fillStyle=color(c.back,'rgba(0,0,0,.55)');g.fillRect(x,y,w,h);g.fillStyle=color(c.fill,'#22c55e');g.fillRect(x,y,w*ratio,h);if(c.stroke){g.strokeStyle=color(c.stroke,'#fff');g.strokeRect(x,y,w,h);}}
  else if(type==='checker'){var cell=Math.max(2,Math.round(num(c.cell,16))),yy,xx;for(yy=0;yy<h;yy+=cell)for(xx=0;xx<w;xx+=cell){g.fillStyle=((Math.floor(xx/cell)+Math.floor(yy/cell))%2)?color(c.color1,'#1f2937'):color(c.color2,'#111827');g.fillRect(x+xx,y+yy,Math.min(cell,w-xx),Math.min(cell,h-yy));}}
  else if(type==='panel'){pathRoundRect(g,x,y,w,h,c.radius===undefined?10:c.radius);g.fillStyle=color(c.fill,'rgba(15,23,42,.92)');g.fill();if(c.stroke!==null){g.strokeStyle=color(c.stroke,'rgba(255,255,255,.28)');g.lineWidth=Math.max(.5,num(c.lineWidth,1));g.stroke();}}
  else if(type==='dialog'){var pad=Math.max(6,num(c.padding,16)),fs=Math.max(8,num(c.size,16)),lh=Math.max(fs+3,num(c.lineHeight,fs+6)),tw=Math.max(20,w-pad*2),words=str(c.text).split(/\s+/),lines=[],line='',test,yy2;pathRoundRect(g,x,y,w,h,c.radius===undefined?10:c.radius);g.fillStyle=color(c.fill,'rgba(3,7,18,.94)');g.fill();g.strokeStyle=color(c.stroke,'#94a3b8');g.lineWidth=Math.max(1,num(c.lineWidth,2));g.stroke();g.font=str(c.font,(c.bold?'700 ':'')+fs+'px Segoe UI, Microsoft JhengHei, sans-serif');for(var wi=0;wi<words.length;wi++){test=line?line+' '+words[wi]:words[wi];if(g.measureText(test).width>tw&&line){lines.push(line);line=words[wi];}else line=test;}if(line)lines.push(line);g.fillStyle=color(c.textColor,'#f8fafc');g.textAlign='left';g.textBaseline='top';yy2=y+pad;if(c.name){g.font='700 '+Math.max(9,fs-1)+'px Segoe UI, Microsoft JhengHei, sans-serif';g.fillStyle=color(c.nameColor,'#fde68a');g.fillText(str(c.name),x+pad,yy2);yy2+=lh;g.font=fs+'px Segoe UI, Microsoft JhengHei, sans-serif';g.fillStyle=color(c.textColor,'#f8fafc');}for(var li=0;li<lines.length&&yy2+lh<=y+h-pad;li++,yy2+=lh)g.fillText(lines[li],x+pad,yy2);var opts=Array.isArray(c.options)?c.options:[];if(opts.length){yy2=y+h-pad-lh;for(var oi=opts.length-1;oi>=0;oi--){var label=(oi===Number(c.selected)?'▶ ':'  ')+str(opts[oi]);g.fillStyle=oi===Number(c.selected)?color(c.selectColor,'#67e8f9'):color(c.optionColor,'#cbd5e1');g.fillText(label,x+pad,yy2);yy2-=lh;}}}
  else if(type==='transition'){var pr=clamp(c.progress,0,1),mode=str(c.mode,'fade').toLowerCase(),cc=color(c.fill,'#000');g.fillStyle=cc;if(mode==='wipeleft')g.fillRect(0,0,r.width*pr,r.height);else if(mode==='wiperight')g.fillRect(r.width*(1-pr),0,r.width*pr,r.height);else if(mode==='iris'){g.save();g.fillRect(0,0,r.width,r.height);g.globalCompositeOperation='destination-out';g.beginPath();g.arc(r.width/2,r.height/2,Math.max(r.width,r.height)*(1-pr),0,Math.PI*2);g.fill();g.restore();}else{g.globalAlpha=pr;g.fillRect(0,0,r.width,r.height);}}
  else if(type==='crosshair'){var rr=Math.max(4,num(c.r,14)),gap=Math.max(1,num(c.gap,5)),tick=Math.max(2,num(c.tick,9));g.strokeStyle=color(c.stroke,'#fff');g.lineWidth=Math.max(1,num(c.lineWidth,2));g.beginPath();g.arc(x,y,rr,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(x-rr-tick,y);g.lineTo(x-gap,y);g.moveTo(x+gap,y);g.lineTo(x+rr+tick,y);g.moveTo(x,y-rr-tick);g.lineTo(x,y-gap);g.moveTo(x,y+gap);g.lineTo(x,y+rr+tick);g.stroke();if(c.dot!==false){g.fillStyle=color(c.fill,c.stroke||'#fff');g.beginPath();g.arc(x,y,Math.max(1,num(c.dotRadius,2)),0,Math.PI*2);g.fill();}}
  else if(type==='sprite'){drawSprite(r,c,x,y,w,h);}
  else if(type==='spritebatch'){drawSpriteBatch(r,c);}
  else if(type==='mode7'){drawMode7(r,c);}
  else if(type==='particles'){drawEmitter(r,c,camX,camY);}
  else if(type==='tilemap'){drawTilemap(r,c,camX,camY);}
  g.restore();
}
function renderCommandList(r,cmds,cam,layer){var g=r.g,c=cameraForLayer(cam,layer),max=Math.min(cmds.length,SDK.maxCommands),useTransform=transformedCamera(c),i;g.save();if(layer){g.globalAlpha=layer.opacity;g.globalCompositeOperation=layer.blend;}if(useTransform){beginCamera(g,r,c);r._cameraTransformed=true;for(i=0;i<max;i++)drawCommand(r,cmds[i],0,0);r._cameraTransformed=false;}else{for(i=0;i<max;i++)drawCommand(r,cmds[i],c.x,c.y);}g.restore();return max;}
function presentFrame(ctx,h,frame){var r=assertSurface(ctx,h),g=r.g,f=frame&&typeof frame==='object'?frame:{},cmds=Array.isArray(f.commands)?f.commands:[],cam=f.camera||{},count=0,dropped=0;g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.setTransform(1,0,0,1,0,0);g.fillStyle=color(f.clear,r.background);g.fillRect(0,0,r.width,r.height);g.restore();var groups=[];if(Array.isArray(f.layers)){for(var li=0;li<f.layers.length;li++){var q=f.layers[li]&&typeof f.layers[li]==='object'?f.layers[li]:{},l=layerRecord(q.layer);if(!l||Number(l.pid)!==Number(r.pid)||Number(l.surface)!==Number(r.handle)||!l.visible)continue;groups.push({layer:l,commands:Array.isArray(q.commands)?q.commands:[],index:li});}groups.sort(function(a,b){return a.layer.priority-b.layer.priority||a.index-b.index;});for(var gi=0;gi<groups.length;gi++){var n=renderCommandList(r,groups[gi].commands,cam,groups[gi].layer);count+=n;dropped+=Math.max(0,groups[gi].commands.length-n);}}if(cmds.length){var n2=renderCommandList(r,cmds,cam,null);count+=n2;dropped+=Math.max(0,cmds.length-n2);}applyRasterEffects(r);r.frames++;return{ok:true,commands:count,dropped:dropped,frame:r.frames,layers:groups.length};}
function pollGamepads(r){
  var fn=global.navigator&&(global.navigator.getGamepads||global.navigator.webkitGetGamepads),pads=[],list,i,p,j,b,prev,press=[];
  if(typeof fn!=='function')return pads;
  try{list=fn.call(global.navigator)||[];}catch(ignore){return pads;}
  for(i=0;i<list.length;i++){
    p=list[i];if(!p)continue;prev=r.gamepadPrevious[String(i)]||[];press=[];b=[];
    for(j=0;j<p.buttons.length;j++){var val=typeof p.buttons[j]==='object'?num(p.buttons[j].value,p.buttons[j].pressed?1:0):num(p.buttons[j],0),down=val>.5;b.push(val);if(down&&!prev[j])press.push(j);prev[j]=down;}
    r.gamepadPrevious[String(i)]=prev;
    pads.push({index:i,id:str(p.id),connected:!!p.connected,mapping:str(p.mapping),buttons:b,pressed:press,axes:Array.prototype.slice.call(p.axes||[]).map(function(v){return num(v);})});
  }
  return pads;
}
function pointerSnapshot(r){var p=r.pointer,pressed=Object.keys(p.pressedButtons).map(function(v){return Number(v);}),released=Object.keys(p.releasedButtons).map(function(v){return Number(v);});return{x:p.x,y:p.y,dx:p.dx,dy:p.dy,clientX:p.clientX,clientY:p.clientY,buttons:p.buttons,button:p.button,down:p.down,inside:p.inside,pressed:pressed,released:released,wheelX:p.wheelX,wheelY:p.wheelY,wheelZ:p.wheelZ,pointerType:p.pointerType,pressure:p.pressure,tiltX:p.tiltX,tiltY:p.tiltY,twist:p.twist,width:p.width,height:p.height,isPrimary:p.isPrimary,captured:p.captured,left:!!(p.buttons&1),right:!!(p.buttons&2),middle:!!(p.buttons&4)};}
function clearPointerEdges(r){r.pointer.dx=0;r.pointer.dy=0;r.pointer.wheelX=0;r.pointer.wheelY=0;r.pointer.wheelZ=0;r.pointer.pressedButtons={};r.pointer.releasedButtons={};}
function pollInput(ctx,h){var r=assertSurface(ctx,h),ps=pointerSnapshot(r),out={keys:{},pressed:Object.keys(r.pressed),released:Object.keys(r.released),pointer:ps,mouse:ps,gamepads:pollGamepads(r)};Object.keys(r.keys).forEach(function(k){if(r.keys[k])out.keys[k]=true;});r.pressed={};r.released={};clearPointerEdges(r);return out;}
function getPointerState(ctx,h,clear){var r=assertSurface(ctx,h),out=pointerSnapshot(r);if(clear)clearPointerEdges(r);return out;}
function setPointerCapture(ctx,h,enabled){var r=assertSurface(ctx,h),c=r.canvas;if(enabled!==false){try{c.focus();}catch(ignore){}r.pointer.forceCapture=true;return{captured:!!r.pointer.captured,armed:true};}r.pointer.forceCapture=false;if(r.pointer.captureId!==null){try{c.releasePointerCapture(r.pointer.captureId);}catch(ignore2){}}r.pointer.captured=false;r.pointer.captureId=null;return{captured:false,armed:false};}
function resetPointerInput(ctx,h){var r=assertSurface(ctx,h);clearPointerEdges(r);r.pointer.button=-1;return true;}
function hitTestPointerTargets(ctx,h,targets,opt){var r=assertSurface(ctx,h),p=r.pointer,o=opt&&typeof opt==='object'?opt:{},arr=Array.isArray(targets)?targets:[],hits=[];for(var i=0;i<Math.min(arr.length,4096);i++){var t=arr[i]&&typeof arr[i]==='object'?arr[i]:{},shape=str(t.shape,t.r!==undefined?'circle':'rect').toLowerCase(),inside=false,dx,dy,rr;if(shape==='circle'){dx=p.x-num(t.x);dy=p.y-num(t.y);rr=Math.max(0,num(t.r,0));inside=dx*dx+dy*dy<=rr*rr;}else inside=p.x>=num(t.x)&&p.y>=num(t.y)&&p.x<=num(t.x)+Math.max(0,num(t.w))&&p.y<=num(t.y)+Math.max(0,num(t.h));if(inside)hits.push({id:t.id===undefined?i:t.id,index:i,priority:num(t.priority,0),data:t.data===undefined?null:t.data});}hits.sort(function(a,b){return b.priority-a.priority||a.index-b.index;});return{pointer:pointerSnapshot(r),hits:o.firstOnly?hits.slice(0,1):hits,count:hits.length};}
function screenToWorldPoint(ctx,h,point,camera){var r=assertSurface(ctx,h),q=point&&typeof point==='object'?point:r.pointer;return screenToWorldTransformed(r,q,camera);}
function waitFrame(ctx,h,targetFps){var r=assertSurface(ctx,h),fps=clamp(targetFps||60,15,144),minimum=1000/fps;return new Promise(function(resolve){function done(ts){if(!r.canvas||!r.canvas.isConnected){r.alive=false;resolve({alive:false,time:ts||nowMs(),dt:0,fps:0});return;}var now=ts||nowMs(),elapsed=now-r.lastFrame;if(elapsed+0.25<minimum){global.setTimeout(function(){global.requestAnimationFrame(done);},Math.max(0,minimum-elapsed-1));return;}r.lastFrame=now;r.lastDt=Math.min(.1,Math.max(0,elapsed/1000));var inst=r.lastDt>0?1/r.lastDt:0;r.fpsSamples.push(inst);if(r.fpsSamples.length>30)r.fpsSamples.shift();r.fps=r.fpsSamples.reduce(function(a,b){return a+b;},0)/Math.max(1,r.fpsSamples.length);resolve({alive:true,time:now,dt:r.lastDt,fps:r.fps});}global.requestAnimationFrame(done);});}
function getSurfaceInfo(ctx,h){var r=assertSurface(ctx,h);return{handle:r.handle,hwnd:r.hwnd,width:r.width,height:r.height,alive:!!r.alive,frames:r.frames,pixelated:r.pixelated};}
function getFrameStats(ctx,h){var r=assertSurface(ctx,h);return{frames:r.frames,dt:r.lastDt,fps:r.fps,targetIndependent:true};}
function measureText(ctx,h,text,spec){var r=assertSurface(ctx,h),g=r.g,s=spec&&typeof spec==='object'?spec:{};g.save();g.font=str(s.font,(s.bold?'700 ':'')+Math.max(8,num(s.size,16))+'px Segoe UI, Microsoft JhengHei, sans-serif');var m=g.measureText(str(text));g.restore();return{width:num(m.width),actualBoundingBoxAscent:num(m.actualBoundingBoxAscent),actualBoundingBoxDescent:num(m.actualBoundingBoxDescent)};}
function createTexture(ctx,dataUrl,spec){
  spec=spec&&typeof spec==='object'?spec:{};dataUrl=str(dataUrl);if(!/^data:image\/(png|jpeg|jpg|webp|gif|bmp);base64,/i.test(dataUrl))throw new Error('STATUS_INVALID_PARAMETER: CreateTexture requires an image data URL.');if(dataUrl.length>24*1024*1024)throw new Error('STATUS_FILE_TOO_LARGE: texture data URL exceeds 24 MiB.');
  return new Promise(function(resolve,reject){var img=new Image(),h=++SDK.nextTexture;img.onload=function(){SDK.textures[String(h)]={handle:h,pid:Number(ctx.pid)||0,image:img,width:img.naturalWidth||img.width,height:img.naturalHeight||img.height,name:str(spec.name,'texture')};resolve({handle:h,width:img.naturalWidth||img.width,height:img.naturalHeight||img.height});};img.onerror=function(){reject(new Error('STATUS_INVALID_IMAGE_FORMAT: texture decode failed.'));};img.src=dataUrl;});
}
function destroyTexture(ctx,h){var t=assertTexture(ctx,h);try{t.image.src='';}catch(ignore){}delete SDK.textures[String(t.handle)];return true;}
function captureFrame(ctx,h,spec){var r=assertSurface(ctx,h),s=spec&&typeof spec==='object'?spec:{},type=str(s.type,'image/png').toLowerCase();if(['image/png','image/jpeg','image/webp'].indexOf(type)<0)type='image/png';var q=clamp(s.quality===undefined?.92:s.quality,.1,1);try{return{dataUrl:r.canvas.toDataURL(type,q),type:type,width:r.width,height:r.height};}catch(e){throw new Error('STATUS_NOT_SUPPORTED: frame capture failed.');}}
function ensureAudio(){var C=global.AudioContext||global.webkitAudioContext;if(!C)return null;if(!SDK.audioContext){try{SDK.audioContext=new C();}catch(ignore){return null;}}try{if(SDK.audioContext.state==='suspended')SDK.audioContext.resume();}catch(ignoreResume){}return SDK.audioContext;}
function playTone(ctx,h,spec){assertSurface(ctx,h);spec=spec&&typeof spec==='object'?spec:{};var ac=ensureAudio();if(!ac)return{played:false};var osc=ac.createOscillator(),gain=ac.createGain(),id=SDK.nextTone++,dur=clamp(spec.duration||.09,.02,4),when=Math.max(0,num(spec.delay,0)),now=ac.currentTime+when,f0=clamp(spec.frequency||440,30,5000),f1=clamp(spec.endFrequency||f0,30,5000),ch=Math.max(0,Math.floor(num(spec.channel,0))),vol=clamp(spec.volume===undefined?.08:spec.volume,0,.4)*channelVolume(ctx.pid,ch);osc.type=['sine','square','sawtooth','triangle'].indexOf(spec.wave)>=0?spec.wave:'square';osc.frequency.setValueAtTime(f0,now);if(f1!==f0)osc.frequency.exponentialRampToValueAtTime(f1,now+dur);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),now+.005);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);osc.connect(gain);gain.connect(ac.destination);osc.start(now);osc.stop(now+dur+.02);SDK.tones[id]={osc:osc,gain:gain,pid:Number(ctx.pid)||0,channel:ch};osc.onended=function(){delete SDK.tones[id];};return{played:true,id:id};}
function stopTone(ctx,id){id=parseInt(id,10)||0;var t=SDK.tones[id];if(!t)return false;if(ctx&&Number(t.pid)!==Number(ctx.pid))throw new Error('STATUS_ACCESS_DENIED: tone is owned by another XSH process.');try{t.osc.stop();}catch(ignore){}delete SDK.tones[id];return true;}
function playSequence(ctx,h,notes){assertSurface(ctx,h);notes=Array.isArray(notes)?notes:[];var cursor=0,ids=[],i,n,r;for(i=0;i<Math.min(notes.length,64);i++){n=notes[i]&&typeof notes[i]==='object'?notes[i]:{};r=playTone(ctx,h,{frequency:n.frequency||440,endFrequency:n.endFrequency||n.frequency||440,duration:n.duration||.08,wave:n.wave||'square',volume:n.volume===undefined?.055:n.volume,channel:n.channel===undefined?0:n.channel,delay:cursor+(n.delay||0)});if(r&&r.id)ids.push(r.id);cursor+=Math.max(.02,num(n.duration,.08))+Math.max(0,num(n.gap,.015));}return{played:ids.length>0,ids:ids,duration:cursor};}
function stopAllTones(ctx){var k,t;for(k in SDK.tones){if(!own(SDK.tones,k))continue;t=SDK.tones[k];if(ctx&&Number(t.pid)!==Number(ctx.pid))continue;try{t.osc.stop();}catch(ignore){ }delete SDK.tones[k];}return true;}
async function rumbleGamepad(ctx,index,spec){spec=spec&&typeof spec==='object'?spec:{};var fn=global.navigator&&(global.navigator.getGamepads||global.navigator.webkitGetGamepads),pads,p,act;if(typeof fn!=='function')return{supported:false};try{pads=fn.call(global.navigator)||[];p=pads[parseInt(index,10)||0];if(!p)return{supported:false};act=p.vibrationActuator;if(!act||typeof act.playEffect!=='function')return{supported:false};await act.playEffect('dual-rumble',{duration:clamp(spec.duration||120,20,1000),strongMagnitude:clamp(spec.strong===undefined?.6:spec.strong,0,1),weakMagnitude:clamp(spec.weak===undefined?.35:spec.weak,0,1)});return{supported:true};}catch(ignore){return{supported:false};}}
function cleanupProcess(pid){var k,r,t;for(k in SDK.surfaces){if(!own(SDK.surfaces,k))continue;r=SDK.surfaces[k];if(Number(r.pid)===Number(pid)){try{if(r.canvas&&r.canvas.parentNode)r.canvas.parentNode.removeChild(r.canvas);}catch(ignore){}delete SDK.surfaces[k];}}for(k in SDK.textures){if(!own(SDK.textures,k))continue;t=SDK.textures[k];if(Number(t.pid)===Number(pid)){try{t.image.src='';}catch(ignore2){}delete SDK.textures[k];}}for(k in SDK.emitters){if(own(SDK.emitters,k)&&Number(SDK.emitters[k].pid)===Number(pid))delete SDK.emitters[k];}for(k in SDK.tilemaps){if(own(SDK.tilemaps,k)&&Number(SDK.tilemaps[k].pid)===Number(pid))delete SDK.tilemaps[k];}for(k in SDK.animations){if(own(SDK.animations,k)&&Number(SDK.animations[k].pid)===Number(pid))delete SDK.animations[k];}for(k in SDK.worlds){if(own(SDK.worlds,k)&&Number(SDK.worlds[k].pid)===Number(pid))delete SDK.worlds[k];}for(k in SDK.timelines){if(own(SDK.timelines,k)&&Number(SDK.timelines[k].pid)===Number(pid))delete SDK.timelines[k];}for(k in SDK.quests){if(own(SDK.quests,k)&&Number(SDK.quests[k].pid)===Number(pid))delete SDK.quests[k];}for(k in SDK.inventories){if(own(SDK.inventories,k)&&Number(SDK.inventories[k].pid)===Number(pid))delete SDK.inventories[k];}for(k in SDK.layers){if(own(SDK.layers,k)&&Number(SDK.layers[k].pid)===Number(pid))delete SDK.layers[k];}for(k in SDK.spriteBatches){if(own(SDK.spriteBatches,k)&&Number(SDK.spriteBatches[k].pid)===Number(pid))delete SDK.spriteBatches[k];}for(k in SDK.mode7){if(own(SDK.mode7,k)&&Number(SDK.mode7[k].pid)===Number(pid))delete SDK.mode7[k];}for(k in SDK.audioVoices){if(own(SDK.audioVoices,k)&&Number(SDK.audioVoices[k].pid)===Number(pid)){try{SDK.audioVoices[k].source.stop();}catch(ignore3){}delete SDK.audioVoices[k];}}for(k in SDK.audioBuffers){if(own(SDK.audioBuffers,k)&&Number(SDK.audioBuffers[k].pid)===Number(pid))delete SDK.audioBuffers[k];}delete SDK.audioMix[String(Number(pid)||0)];stopAllTones({pid:pid});return true;}

async function dispatch(ctx,method,args){
  args=args||[];method=str(method);
  if(method==='GetVersion')return{version:SDK.version,build:SDK.build,model:SDK.model,apiVersion:SDK.apiVersion};
  if(method==='QueryCapabilities')return{canvas2d:true,batchedPresent:true,keyboard:true,pointer:true,mouse:true,mouseButtons:true,mouseWheel:true,pointerCapture:true,pointerHitTesting:true,gamepad:true,gamepadRumble:true,audioTone:true,audioSequence:true,audioSamples:true,audioMusic:true,audioChannels:true,logicalResolution:true,textures:true,frameCapture:true,frameStats:true,measureText:true,particleSystem:true,tilemaps:true,tilemapAnimation:true,tilePriority:true,tileFlip:true,tileProperties:true,tileTriggers:true,pathfinding:true,collisionHelpers:true,animationTimeline:true,animationEvents:true,entityWorld:true,entityComponents:true,statusEffects:true,combatMath:true,tileRegionQuery:true,cameraZones:true,menuNavigation:true,cameraHelpers:true,cameraTransform:true,layers:true,parallax:true,spriteBatches:true,rasterEffects:true,scanlineEffects:true,mode7:true,mode7Perspective:true,timelines:true,questJournal:true,inventorySystem:true,cameraRails:true,combatEffects:true,dialogRenderer:true,transitions:true,compatibilityProfile:'16BIT_CONSOLE_V1',maxCommandsPerFrame:SDK.maxCommands,maxSpritesPerBatch:8192,maxParticlesPerEmitter:4096,maxTilemap:{cols:256,rows:256},maxSurface:{width:2560,height:1440},targetFps:[30,60,120,144],renderCommands:['rect','strokeRect','roundRect','gradientRect','circle','ellipse','arc','line','bezier','poly','polygon','star','text','bar','checker','panel','dialog','transition','crosshair','sprite','spritebatch','particles','tilemap','mode7']};
  if(method==='CreateSurface')return createSurface(ctx,args[0],args[1]);
  if(method==='DestroySurface')return destroySurface(ctx,args[0]);
  if(method==='ResizeSurface')return resizeSurface(ctx,args[0],args[1],args[2]);
  if(method==='SetSurfaceOptions')return setSurfaceOptions(ctx,args[0],args[1]);
  if(method==='FocusSurface')return focusSurface(ctx,args[0]);
  if(method==='CreateLayer')return createLayer(ctx,args[0],args[1]);
  if(method==='DestroyLayer')return destroyLayer(ctx,args[0]);
  if(method==='SetLayerScroll')return setLayerScroll(ctx,args[0],args[1],args[2]);
  if(method==='SetLayerOpacity')return setLayerOpacity(ctx,args[0],args[1]);
  if(method==='SetLayerPriority')return setLayerPriority(ctx,args[0],args[1]);
  if(method==='SetLayerBlend')return setLayerBlend(ctx,args[0],args[1]);
  if(method==='SetLayerVisible')return setLayerVisible(ctx,args[0],args[1]);
  if(method==='SetLayerScrollFactor')return setLayerScrollFactor(ctx,args[0],args[1],args[2]);
  if(method==='GetLayerInfo')return getLayerInfo(ctx,args[0]);
  if(method==='CreateSpriteBatch')return createSpriteBatch(ctx,args[0],args[1]);
  if(method==='DestroySpriteBatch')return destroySpriteBatch(ctx,args[0]);
  if(method==='AddSprite')return addSprite(ctx,args[0],args[1]);
  if(method==='UpdateSprite')return updateSprite(ctx,args[0],args[1],args[2]);
  if(method==='RemoveSprite')return removeSprite(ctx,args[0],args[1]);
  if(method==='ClearSpriteBatch')return clearSpriteBatch(ctx,args[0]);
  if(method==='RenderSpriteBatch')return renderSpriteBatch(ctx,args[0],args[1]);
  if(method==='SetScanlineScroll')return setScanlineScroll(ctx,args[0],args[1]);
  if(method==='SetScanlineScale')return setScanlineScale(ctx,args[0],args[1]);
  if(method==='SetScanlineColor')return setScanlineColor(ctx,args[0],args[1]);
  if(method==='SetScanlineWarp')return setScanlineWarp(ctx,args[0],args[1]);
  if(method==='ClearScanlineEffects')return clearScanlineEffects(ctx,args[0]);
  if(method==='CreateMode7Background')return createMode7Background(ctx,args[0],args[1]);
  if(method==='DestroyMode7Background')return destroyMode7Background(ctx,args[0]);
  if(method==='UpdateMode7Background')return updateMode7Background(ctx,args[0],args[1]);
  if(method==='SetMode7Scanlines')return setMode7Scanlines(ctx,args[0],args[1]);
  if(method==='RenderMode7Background')return renderMode7Background(ctx,args[0],args[1]);
  if(method==='PresentFrame')return presentFrame(ctx,args[0],args[1]);
  if(method==='PollInput')return pollInput(ctx,args[0]);
  if(method==='GetPointerState')return getPointerState(ctx,args[0],args[1]);
  if(method==='SetPointerCapture')return setPointerCapture(ctx,args[0],args[1]);
  if(method==='ResetPointerInput')return resetPointerInput(ctx,args[0]);
  if(method==='HitTestPointerTargets')return hitTestPointerTargets(ctx,args[0],args[1],args[2]);
  if(method==='ScreenToWorldPoint')return screenToWorldPoint(ctx,args[0],args[1],args[2]);
  if(method==='WaitFrame')return await waitFrame(ctx,args[0],args[1]);
  if(method==='GetSurfaceInfo')return getSurfaceInfo(ctx,args[0]);
  if(method==='GetFrameStats')return getFrameStats(ctx,args[0]);
  if(method==='MeasureText')return measureText(ctx,args[0],args[1],args[2]);
  if(method==='CreateTexture')return await createTexture(ctx,args[0],args[1]);
  if(method==='DestroyTexture')return destroyTexture(ctx,args[0]);
  if(method==='CaptureFrame')return captureFrame(ctx,args[0],args[1]);
  if(method==='CreateParticleEmitter')return createParticleEmitter(ctx,args[0],args[1]);
  if(method==='EmitParticles')return emitParticles(ctx,args[0],args[1]);
  if(method==='UpdateParticleEmitter')return updateParticleEmitter(ctx,args[0],args[1]);
  if(method==='ClearParticleEmitter')return clearParticleEmitter(ctx,args[0]);
  if(method==='DestroyParticleEmitter')return destroyParticleEmitter(ctx,args[0]);
  if(method==='CreateTilemap')return createTilemap(ctx,args[0],args[1]);
  if(method==='DestroyTilemap')return destroyTilemap(ctx,args[0]);
  if(method==='GetTile')return getTile(ctx,args[0],args[1],args[2]);
  if(method==='SetTile')return setTile(ctx,args[0],args[1],args[2],args[3]);
  if(method==='AdvanceTilemapAnimation')return advanceTilemapAnimation(ctx,args[0],args[1]);
  if(method==='SetTileFlags')return setTileFlags(ctx,args[0],args[1],args[2],args[3]);
  if(method==='GetTileProperties')return getTileProperties(ctx,args[0],args[1],args[2]);
  if(method==='SetTileProperties')return setTileProperties(ctx,args[0],args[1],args[2]);
  if(method==='TestTilemapAABB')return testTilemapAABB(ctx,args[0],args[1]);
  if(method==='TestAABB')return testAABB(args[0],args[1]);
  if(method==='TestCircle')return testCircle(args[0],args[1]);
  if(method==='TestPoint')return testPoint(args[0],args[1]);
  if(method==='TestHitboxes')return testHitboxes(args[0],args[1]);
  if(method==='SetTilemapTriggers')return setTilemapTriggers(ctx,args[0],args[1]);
  if(method==='QueryTilemapTriggers')return queryTilemapTriggers(ctx,args[0],args[1]);
  if(method==='ResolveTilemapAABB')return resolveTilemapAABB(ctx,args[0],args[1],args[2]);
  if(method==='FindTilemapPath')return findTilemapPath(ctx,args[0],args[1],args[2],args[3]);
  if(method==='CreateAnimation')return createAnimation(ctx,args[0],args[1]);
  if(method==='DestroyAnimation')return destroyAnimation(ctx,args[0]);
  if(method==='SetAnimationState')return setAnimationState(ctx,args[0],args[1],args[2]);
  if(method==='AdvanceAnimation')return advanceAnimation(ctx,args[0],args[1]);
  if(method==='GetAnimationState')return getAnimationState(ctx,args[0]);
  if(method==='CreateEntityWorld')return createEntityWorld(ctx,args[0],args[1]);
  if(method==='DestroyEntityWorld')return destroyEntityWorld(ctx,args[0]);
  if(method==='SpawnEntity')return spawnEntity(ctx,args[0],args[1]);
  if(method==='UpdateEntity')return updateEntity(ctx,args[0],args[1],args[2]);
  if(method==='GetEntity')return getEntity(ctx,args[0],args[1]);
  if(method==='RemoveEntity')return removeEntity(ctx,args[0],args[1]);
  if(method==='QueryEntities')return queryEntities(ctx,args[0],args[1]);
  if(method==='StepEntityWorld')return stepEntityWorld(ctx,args[0],args[1],args[2]);
  if(method==='TestEntityCollisions')return testEntityCollisions(ctx,args[0],args[1]);
  if(method==='SetEntityComponent')return setEntityComponent(ctx,args[0],args[1],args[2],args[3]);
  if(method==='GetEntityComponent')return getEntityComponent(ctx,args[0],args[1],args[2]);
  if(method==='RemoveEntityComponent')return removeEntityComponent(ctx,args[0],args[1],args[2]);
  if(method==='QueryEntitiesByComponent')return queryEntitiesByComponent(ctx,args[0],args[1],args[2]);
  if(method==='SetEntityStatus')return setEntityStatus(ctx,args[0],args[1],args[2]);
  if(method==='GetEntityStatuses')return getEntityStatuses(ctx,args[0],args[1]);
  if(method==='ClearEntityStatuses')return clearEntityStatuses(ctx,args[0],args[1],args[2]);
  if(method==='TickEntityStatuses')return tickEntityStatuses(ctx,args[0],args[1]);
  if(method==='CreateTimeline')return createTimeline(ctx,args[0],args[1]);
  if(method==='DestroyTimeline')return destroyTimeline(ctx,args[0]);
  if(method==='ScheduleTimelineEvent')return scheduleTimelineEvent(ctx,args[0],args[1]);
  if(method==='ResetTimeline')return resetTimeline(ctx,args[0],args[1]);
  if(method==='SetTimelineState')return setTimelineState(ctx,args[0],args[1]);
  if(method==='AdvanceTimeline')return advanceTimeline(ctx,args[0],args[1]);
  if(method==='GetTimelineState')return getTimelineState(ctx,args[0]);
  if(method==='CreateQuestJournal')return createQuestJournal(ctx,args[0],args[1]);
  if(method==='DestroyQuestJournal')return destroyQuestJournal(ctx,args[0]);
  if(method==='UpsertQuest')return upsertQuest(ctx,args[0],args[1]);
  if(method==='SetQuestState')return setQuestState(ctx,args[0],args[1],args[2]);
  if(method==='UpdateQuestProgress')return updateQuestProgress(ctx,args[0],args[1],args[2],args[3]);
  if(method==='GetQuestJournal')return getQuestJournal(ctx,args[0],args[1]);
  if(method==='CreateInventory')return createInventory(ctx,args[0],args[1]);
  if(method==='DestroyInventory')return destroyInventory(ctx,args[0]);
  if(method==='AddInventoryItem')return addInventoryItem(ctx,args[0],args[1]);
  if(method==='RemoveInventoryItem')return removeInventoryItem(ctx,args[0],args[1],args[2]);
  if(method==='EquipInventoryItem')return equipInventoryItem(ctx,args[0],args[1],args[2]);
  if(method==='UnequipInventorySlot')return unequipInventorySlot(ctx,args[0],args[1]);
  if(method==='GetInventory')return getInventory(ctx,args[0]);
  if(method==='CalculateDamage')return calculateDamage(args[0]);
  if(method==='QueryTilemapRegion')return queryTilemapRegion(ctx,args[0],args[1],args[2]);
  if(method==='ComputeCamera')return computeCamera(args[0],args[1],args[2]);
  if(method==='AddCameraShake')return addCameraShake(args[0],args[1]);
  if(method==='ComputeCameraZone')return computeCameraZone(args[0],args[1],args[2]);
  if(method==='ComputeCameraRail')return computeCameraRail(args[0],args[1],args[2]);
  if(method==='ResolveCombatEffects')return resolveCombatEffects(args[0]);
  if(method==='NavigateMenu')return navigateMenu(args[0],args[1]);
  if(method==='Ease')return easeValue(args[0],args[1]);
  if(method==='LoadSample')return await loadSample(ctx,args[0],args[1],args[2]);
  if(method==='PlaySample')return playSample(ctx,args[0],args[1]);
  if(method==='StopSample')return stopSample(ctx,args[0]);
  if(method==='UnloadSample')return unloadAudioBuffer(ctx,args[0]);
  if(method==='LoadMusic')return await loadMusic(ctx,args[0],args[1],args[2]);
  if(method==='PlayMusic')return playMusic(ctx,args[0],args[1]);
  if(method==='StopMusic')return stopMusic(ctx);
  if(method==='UnloadMusic')return unloadAudioBuffer(ctx,args[0]);
  if(method==='SetMusicVolume')return setMusicVolume(ctx,args[0]);
  if(method==='SetChannelVolume')return setChannelVolume(ctx,args[0],args[1]);
  if(method==='PlayTone')return playTone(ctx,args[0],args[1]);
  if(method==='StopTone')return stopTone(ctx,args[0]);
  if(method==='PlaySequence')return playSequence(ctx,args[0],args[1]);
  if(method==='StopAllTones')return stopAllTones(ctx);
  if(method==='RumbleGamepad')return await rumbleGamepad(ctx,args[0],args[1]);
  throw new Error('Game2D API not supported: '+method);
}

global.jplopsoft_EXOS_2DGAME_SDK=Object.freeze({version:SDK.version,build:SDK.build,model:SDK.model,apiVersion:SDK.apiVersion,ready:true});
global.jplopsoft_2dgameDispatch=dispatch;
global.jplopsoft_2dgameCleanupProcess=cleanupProcess;
})(window);
