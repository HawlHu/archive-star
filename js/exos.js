/*
 * ExOS Frontend Module
 * Version: 6.4.0-dev-os91
 *
 * ExOS browser-side operating-system Runtime and Shell lifecycle bridge extracted from exos.php:
 * - NT process/session/window/runtime plumbing
 * - XSH host, DLL dispatch and generic OS services
 * - Desktop/Taskbar Shell lifecycle hooks
 * - Application UI belongs in XSH SystemApps; DLLs expose reusable capabilities
 *
 * Client policy since os30: Chromium/V8 JavaScript engine only.
 * Legacy non-V8 browsers are intentionally rejected by ExOS startup.
 * It expects the ExOS core globals/state to have been initialized by exos.php
 * before any of these functions are invoked.
 */

/* =========================================================================
 * USER32 common dialog backend - os91 hotfix26
 *
 * MessageBox / ConfirmBox / PromptBox are generic USER32 services.  They are
 * no longer emitted by exos.php and are not owned by any application.
 * XSH applications call user32.dll; host/runtime errors use the same backend.
 * ========================================================================= */
var jplopsoft_USER32_DIALOG={queue:[],active:false,seq:0};
function jplopsoft_user32DialogEnqueue(kind,message,title,defaultValue){
  return new Promise(function(resolve){
    jplopsoft_USER32_DIALOG.queue.push({
      id:++jplopsoft_USER32_DIALOG.seq,
      kind:String(kind||'message'),
      message:String(message===undefined||message===null?'':message),
      title:String(title||'ExOS'),
      defaultValue:String(defaultValue===undefined||defaultValue===null?'':defaultValue),
      resolve:resolve
    });
    jplopsoft_user32DialogPump();
  });
}
function jplopsoft_user32DialogPump(){
  if(jplopsoft_USER32_DIALOG.active||!jplopsoft_USER32_DIALOG.queue.length)return;
  var item=jplopsoft_USER32_DIALOG.queue.shift(),backdrop,box,title,msg,input,buttons,ok,cancel,finished=false;
  jplopsoft_USER32_DIALOG.active=true;
  backdrop=document.createElement('div');
  backdrop.className='jplopsoft_user32-dialog-backdrop';
  backdrop.style.cssText='position:fixed;inset:0;z-index:2147483500;background:rgba(0,0,0,.38);display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:Segoe UI,Arial,sans-serif;';
  box=document.createElement('div');
  box.className='jplopsoft_user32-dialog';
  box.style.cssText='width:min(520px,94vw);max-height:86vh;overflow:auto;background:#fff;color:#111827;border:1px solid #9aa7b5;border-radius:8px;box-shadow:0 24px 72px rgba(0,0,0,.38);padding:0;';
  title=document.createElement('div');
  title.style.cssText='font-size:15px;font-weight:600;padding:14px 16px 10px;border-bottom:1px solid #e5e7eb;';
  title.textContent=item.title;
  msg=document.createElement('div');
  msg.style.cssText='white-space:pre-wrap;line-height:1.55;font-size:14px;padding:16px;';
  msg.textContent=item.message;
  box.appendChild(title);box.appendChild(msg);
  if(item.kind==='prompt'){
    input=document.createElement('input');input.type='text';input.value=item.defaultValue;
    input.style.cssText='display:block;width:calc(100% - 32px);margin:0 16px 14px;padding:8px 10px;box-sizing:border-box;border:1px solid #9aa7b5;border-radius:4px;font:14px Segoe UI,Arial,sans-serif;outline:none;';
    box.appendChild(input);
  }
  buttons=document.createElement('div');
  buttons.style.cssText='display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e5e7eb;background:#f8fafc;';
  function makeButton(text,primary){var b=document.createElement('button');b.type='button';b.textContent=text;b.style.cssText='min-width:82px;padding:7px 14px;border-radius:4px;border:1px solid '+(primary?'#2563eb':'#9aa7b5')+';background:'+(primary?'#2563eb':'#fff')+';color:'+(primary?'#fff':'#111827')+';font:13px Segoe UI,Arial,sans-serif;';return b;}
  function finish(value){if(finished)return;finished=true;try{document.removeEventListener('keydown',onKey,true);}catch(ignore){}try{if(backdrop.parentNode)backdrop.parentNode.removeChild(backdrop);}catch(ignore2){}jplopsoft_USER32_DIALOG.active=false;item.resolve(value);window.setTimeout(jplopsoft_user32DialogPump,0);}
  ok=makeButton('確定',true);buttons.appendChild(ok);
  if(item.kind==='confirm'||item.kind==='prompt'){cancel=makeButton('取消',false);buttons.insertBefore(cancel,ok);cancel.onclick=function(){finish(item.kind==='confirm'?false:null);};}
  ok.onclick=function(){finish(item.kind==='confirm'?true:(item.kind==='prompt'?String(input.value||''):1));};
  backdrop.onclick=function(e){if(e.target===backdrop&&(item.kind==='confirm'||item.kind==='prompt'))finish(item.kind==='confirm'?false:null);};
  function onKey(e){var k=String(e.key||'');if(k==='Escape'){if(item.kind==='message')finish(1);else finish(item.kind==='confirm'?false:null);e.preventDefault();}else if(k==='Enter'&&(item.kind!=='prompt'||e.target===input)){ok.click();e.preventDefault();}}
  document.addEventListener('keydown',onKey,true);
  box.appendChild(buttons);backdrop.appendChild(box);(document.body||document.documentElement).appendChild(backdrop);
  window.setTimeout(function(){try{(input||ok).focus();if(input)input.select();}catch(ignoreFocus){}},0);
}
function jplopsoft_user32MessageBox(message,title){return jplopsoft_user32DialogEnqueue('message',message,title||'ExOS','');}
function jplopsoft_user32ConfirmBox(message,title){return jplopsoft_user32DialogEnqueue('confirm',message,title||'ExOS','');}
function jplopsoft_user32PromptBox(message,title,defaultValue){return jplopsoft_user32DialogEnqueue('prompt',message,title||'ExOS',defaultValue);}

/* Desktop personalization storage/presentation is owned by shell32.dll. */
/* Shared image resources are owned by exos_share_res.js. */
function jplopsoft_svgIconApply(node,name,size){
  if(typeof jplopsoft_shareResApplyIcon!=='function')return false;
  return jplopsoft_shareResApplyIcon(node,name,size,'shell32.dll');
}
function jplopsoft_applySvgIcons(root){
  var nodes,i,n,name,size;
  root=root||document;
  if(!root.querySelectorAll)return;
  nodes=root.querySelectorAll('[data-exfs-svg],[data-exos-resource-icon]');
  for(i=0;i<nodes.length;i++){
    n=nodes[i];
    name=n.getAttribute('data-exos-resource-icon')||n.getAttribute('data-exfs-svg');
    size=n.getAttribute('data-exfs-svg-size')||18;
    jplopsoft_svgIconApply(n,name,size);
  }
}
/* Taskbar application-button icon/presentation policy is owned by shell32.dll. */


'use strict';


/* =========================================================================
 * Client engine policy - os30
 * XSH uses MessageChannel, Promise, TextEncoder/TextDecoder and async functions.
 * ExOS now intentionally supports Chromium-family browsers using V8 only.
 * ========================================================================= */
function jplopsoft_v8EngineSupported(){
  var ua=String(navigator.userAgent||'');
  if(/CriOS\//i.test(ua))return false;
  if(!/(?:Chrome|Chromium|Edg|OPR)\/[0-9]+/i.test(ua))return false;
  if(!window.chrome)return false;
  return !!(
    window.Promise&&window.MessageChannel&&window.TextEncoder&&window.TextDecoder&&
    window.Uint8Array&&window.Blob&&window.URL&&URL.createObjectURL&&
    typeof document.createElement==='function'
  );
}
function jplopsoft_requireV8Browser(){
  var old,n;
  if(jplopsoft_v8EngineSupported())return true;
  old=document.getElementById('jplopsoft_v8Required');
  if(old)return false;
  n=document.createElement('div');
  n.id='jplopsoft_v8Required';
  n.className='jplopsoft_v8-required';
  n.innerHTML='<div class="jplopsoft_v8-required-card"><h1>ExOS 需要 V8 JavaScript 引擎</h1><p>此版本僅支援 Chromium / Google Chrome / Microsoft Edge 等 V8 瀏覽器。</p><p>Firefox、Safari、IE 與其他非 V8 舊瀏覽器已不再列入客戶端相容範圍。</p></div>';
  document.body.appendChild(n);
  return false;
}


/* =========================================================================
 * XSH-first shell helpers - os91 hotfix20
 *
 * CMD is a real SystemApps/cmd.xsh process hosted by xshhost.exe.  exos.js
 * retains only generic ExFS path helpers and small shell launch adapters.
 * Command parsing, history, completion and console UI belong to cmd.xsh.
 * ========================================================================= */
function jplopsoft_exfsFolderPath(id){
  var chain=[],a=['C:'],guard=0,n,name;
  id=parseInt(id,10)||0;
  while(id>0&&guard++<1000){
    n=jplopsoft_findNode(id);if(!n)break;chain.unshift(n);id=parseInt(n.parent_id,10)||0;
  }
  for(var i=0;i<chain.length;i++){
    name=jplopsoft_decName(chain[i]);a.push(name===null?'[UNREADABLE]':name);
  }
  return a.length===1?'C:\\':a[0]+'\\'+a.slice(1).join('\\');
}
function jplopsoft_exfsNodeFullPath(n){
  var base,name;
  if(!n)return'';
  base=jplopsoft_exfsFolderPath(parseInt(n.parent_id,10)||0);
  name=jplopsoft_decName(n);
  if(name===null)name='[UNREADABLE]';
  return base+(base.charAt(base.length-1)==='\\'?'':'\\')+name;
}
function jplopsoft_exfsResolvePath(path,currentFolder,noFollowFinal){
  var folder=parseInt(currentFolder,10)||0,
      ctx={currentDrive:'C',currentDirectoryNodeId:folder,currentDirectory:jplopsoft_exfsFolderPath(folder)};
  return jplopsoft_xshResolveC(ctx,String(path||''),false,!!noFollowFinal);
}
function jplopsoft_exfsResolveFolderId(path,currentFolder){
  var n=jplopsoft_exfsResolvePath(path,currentFolder,false);
  if(!n||n.type!=='folder')return-1;
  return n.root?0:(parseInt(n.id,10)||0);
}
function jplopsoft_threeSafeDisposeObject(root){
  if(!root||!root.traverse)return;
  root.traverse(function(obj){
    var mats,i;
    try{
      if(obj.geometry&&obj.geometry.dispose)obj.geometry.dispose();
    }catch(ignoreGeometry){}
    mats=obj.material;
    if(!mats)return;
    if(!(mats instanceof Array))mats=[mats];
    for(i=0;i<mats.length;i++){
      try{
        if(mats[i].map&&mats[i].map.dispose)mats[i].map.dispose();
        if(mats[i].dispose)mats[i].dispose();
      }catch(ignoreMaterial){}
    }
  });
}
function jplopsoft_threeFxBodyMode(mode){
  var b=document.body,cls;
  if(!b)return;
  cls=String(b.className||'')
    .replace(/\bjplopsoft_three-locked\b/g,'')
    .replace(/\bjplopsoft_three-unlocked\b/g,'')
    .replace(/\bjplopsoft_three-cmd\b/g,'');
  cls=jplopsoft_trim(cls);
  if(mode==='locked')cls+=' jplopsoft_three-locked';
  else if(mode==='cmd')cls+=' jplopsoft_three-cmd';
  else cls+=' jplopsoft_three-unlocked';
  b.className=jplopsoft_trim(cls);
}
function jplopsoft_threeAddBar(group,material,w,h,d,x,y,rotZ){
  var geo=new window.THREE.BoxGeometry(w,h,d),
      mesh=new window.THREE.Mesh(geo,material);
  mesh.position.set(x,y,0);
  mesh.rotation.z=rotZ||0;
  group.add(mesh);
  return mesh;
}
function jplopsoft_threeCreateExfsLogo(){
  var jplopsoft_T=window.THREE,
      group=new jplopsoft_T.Group(),
      material=new jplopsoft_T.MeshStandardMaterial({
        color:0x60a5fa,
        emissive:0x0b2447,
        metalness:.55,
        roughness:.28
      }),
      xE=-4.7,xX=-1.6,xF=1.6,xS=4.7,
      stroke=.34,depth=.72;

  jplopsoft_threeAddBar(group,material,stroke,4.2,depth,xE-.82,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xE,1.93,0);
  jplopsoft_threeAddBar(group,material,1.7,stroke,depth,xE-.1,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xE,-1.93,0);

  jplopsoft_threeAddBar(group,material,stroke,4.45,depth,xX,0,.58);
  jplopsoft_threeAddBar(group,material,stroke,4.45,depth,xX,0,-.58);

  jplopsoft_threeAddBar(group,material,stroke,4.2,depth,xF-.82,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xF,1.93,0);
  jplopsoft_threeAddBar(group,material,1.7,stroke,depth,xF-.1,0,0);

  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xS,1.93,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xS,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xS,-1.93,0);
  jplopsoft_threeAddBar(group,material,stroke,1.75,depth,xS-.82,1,0);
  jplopsoft_threeAddBar(group,material,stroke,1.75,depth,xS+.82,-1,0);

  group.scale.set(.72,.72,.72);
  return group;
}
function jplopsoft_threeAmbientSetMode(mode){
  var a=exfsAmbient3D,pColor;

  a.mode=mode||'ui';
  jplopsoft_threeFxBodyMode(
    a.mode==='locked'?'locked':
    (a.mode==='cmd'?'cmd':'ui')
  );

  if(!a.ready)return;

  if(a.logo){
    a.logo.visible=(a.mode==='locked'||a.mode==='unlock');
  }

  if(a.grid){
    a.grid.visible=(a.mode==='ui'||a.mode==='cmd');
  }

  if(a.particles&&a.particles.material){
    if(a.mode==='locked'||a.mode==='unlock'){
      a.particles.material.opacity=.62;
      pColor=0x60a5fa;
    }else if(a.mode==='cmd'){
      a.particles.material.opacity=.28;
      pColor=0x39ff88;
    }else{
      a.particles.material.opacity=.22;
      pColor=0x60a5fa;
    }
    try{a.particles.material.color.setHex(pColor);}catch(ignoreColor){}
  }
}
function jplopsoft_threeAmbientResize(){
  var a=exfsAmbient3D,w=window.innerWidth||1,h=window.innerHeight||1;
  if(!a.ready||!a.renderer||!a.camera)return;
  a.camera.aspect=w/h;
  a.camera.updateProjectionMatrix();
  a.renderer.setSize(w,h,false);
}
function jplopsoft_threeAmbientAnimate(){
  var a=exfsAmbient3D,now=(new Date()).getTime(),burst,s;

  if(!a.ready)return;
  a.raf=window.requestAnimationFrame(jplopsoft_threeAmbientAnimate);

  if(a.paused||!state.threeFxEnabled)return;

  if(a.logo&&a.logo.visible){
    a.logo.rotation.y+=.004;
    a.logo.rotation.x=Math.sin(now*.00045)*.055;
    burst=now<a.burstUntil;
    if(burst){
      s=.72+Math.sin((a.burstUntil-now)*.024)*.08;
      a.logo.scale.set(s,s,s);
    }else{
      a.logo.scale.set(.72,.72,.72);
    }
  }

  if(a.particles){
    a.particles.rotation.y+=a.mode==='locked'?.00065:.00022;
    a.particles.rotation.x=Math.sin(now*.00008)*.08;
  }

  if(a.grid){
    a.grid.position.z=Math.sin(now*.00025)*.12;
  }

  a.camera.position.x+=(a.mouseX-a.camera.position.x)*.025;
  a.camera.position.y+=(a.mouseY-a.camera.position.y)*.025;
  a.camera.lookAt(0,0,0);

  try{a.renderer.render(a.scene,a.camera);}catch(ignoreRender){}
}
function jplopsoft_threeAmbientInit(){
  var jplopsoft_T=window.THREE,canvas=jplopsoft_el('jplopsoft_threeAmbientCanvas'),
      renderer,scene,camera,pointsGeo,positions,i,
      pointsMat,particles,grid,logo,keyLight,fillLight;

  if(exfsAmbient3D.ready||!jplopsoft_T||!canvas)return;

  try{
    renderer=new jplopsoft_T.WebGLRenderer({
      canvas:canvas,
      antialias:true,
      alpha:true,
      powerPreference:'low-power'
    });
  }catch(e){
    exfsAmbient3D.loading=false;
    try{console.warn('ExOS Three ambient unavailable:',e);}catch(ignore){}
    return;
  }

  try{
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.setClearColor(0x000000,0);

    scene=new jplopsoft_T.Scene();
    camera=new jplopsoft_T.PerspectiveCamera(
      46,
      (window.innerWidth||1)/(window.innerHeight||1),
      .1,
      150
    );
    camera.position.set(0,0,17);

    scene.add(new jplopsoft_T.AmbientLight(0xbcdcff,1.4));
    keyLight=new jplopsoft_T.DirectionalLight(0x7dd3fc,2.1);
    keyLight.position.set(5,8,8);
    scene.add(keyLight);
    fillLight=new jplopsoft_T.DirectionalLight(0x818cf8,1.1);
    fillLight.position.set(-7,-2,5);
    scene.add(fillLight);

    logo=jplopsoft_threeCreateExfsLogo();
    logo.position.set(0,.5,0);
    scene.add(logo);

    pointsGeo=new jplopsoft_T.BufferGeometry();
    positions=new Float32Array(1200*3);
    for(i=0;i<1200;i++){
      positions[i*3]=(Math.random()-.5)*58;
      positions[i*3+1]=(Math.random()-.5)*34;
      positions[i*3+2]=(Math.random()-.5)*26;
    }
    pointsGeo.setAttribute(
      'position',
      new jplopsoft_T.BufferAttribute(positions,3)
    );
    pointsMat=new jplopsoft_T.PointsMaterial({
      color:0x60a5fa,
      size:.065,
      transparent:true,
      opacity:.55,
      depthWrite:false
    });
    particles=new jplopsoft_T.Points(pointsGeo,pointsMat);
    scene.add(particles);

    grid=new jplopsoft_T.GridHelper(56,36,0x2563eb,0x1e3a5f);
    grid.rotation.x=Math.PI/2;
    grid.position.set(0,-4,-7);
    if(grid.material){
      if(grid.material instanceof Array){
        for(i=0;i<grid.material.length;i++){
          grid.material[i].transparent=true;
          grid.material[i].opacity=.12;
        }
      }else{
        grid.material.transparent=true;
        grid.material.opacity=.12;
      }
    }
    scene.add(grid);

    exfsAmbient3D.renderer=renderer;
    exfsAmbient3D.scene=scene;
    exfsAmbient3D.camera=camera;
    exfsAmbient3D.logo=logo;
    exfsAmbient3D.particles=particles;
    exfsAmbient3D.grid=grid;
    exfsAmbient3D.ready=true;
    exfsAmbient3D.loading=false;

    exfsAmbient3D.onResize=function(){jplopsoft_threeAmbientResize();};
    exfsAmbient3D.onMouseMove=function(ev){
      var w=window.innerWidth||1,h=window.innerHeight||1;
      exfsAmbient3D.mouseX=((ev.clientX||0)/w-.5)*1.35;
      exfsAmbient3D.mouseY=-((ev.clientY||0)/h-.5)*.8;
    };

    if(window.addEventListener){
      window.addEventListener('resize',exfsAmbient3D.onResize,false);
      document.addEventListener('mousemove',exfsAmbient3D.onMouseMove,false);
    }

    jplopsoft_threeAmbientResize();
    jplopsoft_threeAmbientSetMode(
      state.vaultKey?'ui':'locked'
    );

    if(
      (' '+document.body.className+' ').indexOf(' jplopsoft_three-fx-ready ')<0
    ){
      document.body.className=
        jplopsoft_trim((document.body.className||'')+' jplopsoft_three-fx-ready');
    }

    jplopsoft_threeAmbientAnimate();
  }catch(e2){
    try{renderer.dispose();}catch(ignoreDispose){}
    exfsAmbient3D.ready=false;
    exfsAmbient3D.loading=false;
    try{console.warn('ExOS Three ambient init failed:',e2);}catch(ignore2){}
  }
}
function jplopsoft_scheduleThreeAmbient(){
  if(!jplopsoft_threeFeatureAllowed()||exfsAmbient3D.ready||exfsAmbient3D.loading||!state.threeFxEnabled){
    return;
  }

  try{
    if(
      window.matchMedia&&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ){
      return;
    }
  }catch(ignoreMotion){}

  exfsAmbient3D.loading=true;

  window.setTimeout(function(){
    jplopsoft_loadOptionalMirroredScript('three',function(err){
      if(err){
        exfsAmbient3D.loading=false;
        try{console.warn('ExOS Three ambient load failed:',err);}catch(ignore){}
        return;
      }
      jplopsoft_threeAmbientInit();
    });
  },420);
}
function jplopsoft_threeAmbientUnlockBurst(){
  jplopsoft_threeAmbientSetMode('unlock');

  if(!state.threeFxEnabled)return;

  if(!exfsAmbient3D.ready){
    jplopsoft_scheduleThreeAmbient();
    window.setTimeout(function(){
      if(state.vaultKey){
        jplopsoft_threeAmbientSetMode('ui');
      }
    },950);
    return;
  }

  exfsAmbient3D.burstUntil=(new Date()).getTime()+950;

  window.setTimeout(function(){
    if(state.vaultKey){
      jplopsoft_threeAmbientSetMode('ui');
    }
  },950);
}
/* os91-hotfix21: legacy native Volume3D UI removed; SystemApps/volume3d.xsh owns the application. */

/* os91-hotfix20: native CMD parser/application body removed; see SystemApps/cmd.xsh. */

function jplopsoft_copyReencryptThumbnail(sourceId,newFek,cb){
  var n=jplopsoft_findNode(sourceId);
  if(!n||!jplopsoft_nodeHasThumbnail(n))return cb(null,null);
  jplopsoft_fetchImageThumbnail(sourceId,function(err,bytes){var cipher;if(err)return cb(err);try{cipher=jplopsoft_encBinaryBytes(bytes,newFek);}catch(e){return cb(e);}cb(null,{cipher:cipher,plain_size:bytes.length});});
}
function jplopsoft_clientCopySmallFile(source,targetParent,newName,cb){
  var sourceName=jplopsoft_decName(source)||newName,fmt=jplopsoft_fileFormatFromName(sourceName),oldFek,newFek,newWrap;
  try{oldFek=jplopsoft_nodeFek(source);newFek=jplopsoft_newFek();newWrap=jplopsoft_wrapFek(newFek);}catch(e){return cb(e);}
  jplopsoft_fetchNodeContent(source.id,function(err,out){var plain,cipher;if(err)return cb(err);try{if(jplopsoft_binaryFormat(fmt)){plain=jplopsoft_decBinaryCipher(out.content_enc,oldFek);if(plain===null)throw new Error('來源 Binary 無法以 FEK 解密。');cipher=jplopsoft_encBinaryBytes(plain,newFek);}else{plain=jplopsoft_decContentCipher(out.content_enc,oldFek);if(plain===null)throw new Error('來源文件無法以 FEK 解密。');cipher=jplopsoft_encContent(plain,newFek);}}catch(e2){return cb(e2);}
    jplopsoft_copyReencryptThumbnail(source.id,newFek,function(te,thumbnail){if(te)return cb(te);jplopsoft_uploadCipherInChunks(targetParent,newName,cipher,parseInt(source.original_size,10)||0,thumbnail,newWrap,null,function(ue,uout){if(ue)return cb(ue);cb(null,{id:uout.id,copied_nodes:1,new_fek_wrap:newWrap});});});
  });
}
function jplopsoft_clientCopyLargeFile(source,targetParent,newName,cb){
  var oldFek,newFek,newWrap,srcInfo=null,uploadId='',blocks=[],index=0;
  try{oldFek=jplopsoft_nodeFek(source);newFek=jplopsoft_newFek();newWrap=jplopsoft_wrapFek(newFek);}catch(e){return cb(e);}
  function closeSource(){try{jplopsoft_closeNodeReadHandle(source.id);}catch(ignore){}}
  function fail(err){if(uploadId){jplopsoft_api('large_upload_abort','POST',{upload_id:uploadId},true,function(){closeSource();cb(err);});}else{closeSource();cb(err);}}
  jplopsoft_fetchLargeInfo(source.id,function(err,info){if(err)return cb(err);srcInfo=info;blocks=info.blocks||[];
    jplopsoft_copyReencryptThumbnail(source.id,newFek,function(te,thumbnail){if(te)return fail(te);
      jplopsoft_api('large_upload_begin','POST',{parent_id:targetParent,name_enc:jplopsoft_encName(newName),original_size:parseInt(info.original_size,10)||0,block_size:parseInt(info.block_size,10)||jplopsoft_LARGE_PLAIN_BLOCK_BYTES,block_count:blocks.length,thumbnail_enc:thumbnail&&thumbnail.cipher?thumbnail.cipher:'',thumbnail_plain_size:thumbnail&&thumbnail.plain_size?thumbnail.plain_size:0,fek_wrap:newWrap,motw_enc:jplopsoft_motwForFek(newFek).cipher,motw_plain_size:jplopsoft_motwForFek(newFek).plain_size},true,function(be,bout){if(be)return fail(be);uploadId=String(bout.upload_id||'');next();});
    });
  });
  function next(){
    if(index>=blocks.length){jplopsoft_api('large_upload_finish','POST',{upload_id:uploadId},true,function(fe,fout){if(fe)return fail(fe);uploadId='';closeSource();cb(null,{id:fout.id,copied_nodes:1,new_fek_wrap:newWrap});});return;}
    var b=blocks[index];jplopsoft_fetchLargeEncryptedBlock(source.id,b,srcInfo.chunk_size,null,function(re,cipher){var bytes,newCipher;if(re)return fail(re);try{bytes=jplopsoft_decBinaryCipher(cipher,oldFek);if(bytes===null)throw new Error('來源大型 Block 無法以 FEK 解密。');newCipher=jplopsoft_encBinaryBytes(bytes,newFek);}catch(e){return fail(e);}jplopsoft_largeSendEncryptedBlock(uploadId,index,parseInt(b.plain_size,10)||bytes.length,newCipher,0,parseInt(srcInfo.original_size,10)||0,function(se){if(se)return fail(se);index++;window.setTimeout(next,0);},0);});
  }
}
function jplopsoft_clientCopyNode(sourceId,targetParent,newName,cb){
  var source=jplopsoft_findNode(parseInt(sourceId,10)||0),children,index=0,copied=0;
  if(!source)return cb(new Error('來源項目不存在。'));
  if(source.type==='file'){
    if(jplopsoft_nodeIsLargeFile(source))return jplopsoft_clientCopyLargeFile(source,targetParent,newName,cb);
    return jplopsoft_clientCopySmallFile(source,targetParent,newName,cb);
  }
  jplopsoft_api('create','POST',{parent_id:targetParent,type:'folder',name_enc:jplopsoft_encName(newName),content_enc:'',fek_wrap:'',original_size:0},true,function(err,out){
    if(err)return cb(err);copied=1;children=jplopsoft_childrenOf(source.id).slice(0);
    function nextChild(){var child,childName;if(index>=children.length)return cb(null,{id:out.id,copied_nodes:copied});child=children[index++];childName=jplopsoft_decName(child);if(childName===null)return cb(new Error('子項目名稱無法解密。'));jplopsoft_clientCopyNode(child.id,out.id,childName,function(ce,cout){if(ce)return cb(ce);copied+=parseInt(cout&&cout.copied_nodes,10)||1;nextChild();});}
    nextChild();
  });
}


/* -------------------------------------------------------------------------
 * Multi-instance TXT / CSV editors.
 * Each document owns its own window, state and taskbar button.
 * ---------------------------------------------------------------------- */
/* os91-hotfix19: native ExOS.MultiEditor removed.
 * TXT/CSV/HTML/XSH editing is implemented by SystemApps/*.xsh. */



/* Desktop presentation is owned by shell32.dll. */
function jplopsoft_renderAll(){
  try{if(typeof jplopsoft_shell32RefreshDesktop==='function')jplopsoft_shell32RefreshDesktop();}catch(ignoreDesktopRefresh){}
  try{jplopsoft_applySvgIcons(document.body);}catch(ignoreSvgRefresh){}
}


function jplopsoft_isWritableProfileFolder(folderId){
  var id=parseInt(folderId,10)||0,root=parseInt(state.profileRootId,10)||0,
      publicDocs=parseInt(state.publicDocumentsId,10)||0,
      publicDesktop=parseInt(state.publicDesktopId,10)||0,n,guard=0,start=id;
  if(id<=0||id===parseInt(state.usersRootId,10))return false;
  while(id>0&&guard<100000){
    guard++;
    if(id===root||id===publicDocs||id===publicDesktop)return true;
    n=jplopsoft_findNode(id);if(!n)return false;id=parseInt(n.parent_id,10)||0;
  }
  return false;
}




/* Application dialogs/context menus are XSH + shell32-owned. */

function jplopsoft_bindGlobalHotkeys(){
  document.addEventListener('keydown',function(e){
    var k;e=e||window.event;k=e.keyCode||e.which;
    if(!!e.ctrlKey&&!!e.shiftKey&&k===27&&state.samAuthenticated&&state.vaultKey){
      if(e.preventDefault)e.preventDefault();e.returnValue=false;jplopsoft_launchSystemXshApp('taskmgr',[]);return false;
    }
  },false);
}
function jplopsoft_reloadNodes(done){
  jplopsoft_api(
    'list',
    'GET',
    null,
    true,
    function(err,out){
      if(err){
        jplopsoft_user32MessageBox(err.message);
        return;
      }

      state.nodes=out.nodes||[];
      state.namespaceModel=String(out.namespace_model||'');
      state.usersRootId=parseInt(out.users_root_id,10)||0;
      state.profileRootId=parseInt(out.profile_root_id,10)||0;
      state.documentsNodeId=parseInt(out.documents_node_id,10)||0;
      state.desktopNodeId=parseInt(out.desktop_node_id,10)||0;
      state.downloadsNodeId=parseInt(out.downloads_node_id,10)||0;
      state.publicRootId=parseInt(out.public_root_id,10)||0;
      state.publicDocumentsId=parseInt(out.public_documents_id,10)||0;
      state.publicDesktopId=parseInt(out.public_desktop_id,10)||0;

      try{
        if(typeof jplopsoft_shell32RefreshDesktop==='function'){
          jplopsoft_shell32RefreshDesktop();
        }
      }catch(ignoreDesktopReloadRefresh){}

      if(done)done();
    }
  );
}
/* Browser download belongs to shell32.dll; physical print spooling belongs to gdi32.dll. */
/* os91-hotfix20: Document Modal print/download UI retired; XSH apps use GDI32/COMDLG32/SHELL32 APIs. */
function jplopsoft_currentFolderLabel(){if(state.currentFolder===0)return '根目錄';var n=jplopsoft_findNode(state.currentFolder);return n?(jplopsoft_decName(n)||('資料夾 #'+n.id)):'根目錄';}
/* File association/viewer policy is centralized in shell32.dll. */

/* -------------------------------------------------------------------------
 * Windows 10-style ExFS taskbar / Start menu
 * ---------------------------------------------------------------------- */


/* =========================================================================
 * NT interactive-session model
 *
 * Pre-logon:
 *   Session 1 -> WinSta0 -> Winlogon Desktop
 *   setup.exe / LogonUI.exe -> NT AUTHORITY\SYSTEM
 *
 * Post-logon:
 *   Session 1 -> WinSta0 -> Default Desktop
 *   explorer.exe -> SAM user's Access Token
 *
 * This models NT ownership/desktop transitions inside ExFS. Browser JS does
 * not create a real kernel WindowStation or a protected Windows secure desktop.
 * ========================================================================= */
var jplopsoft_NT_INTERACTIVE={
  sessionId:1,
  serviceSessionId:0,
  windowStation:'WinSta0',
  desktop:'Winlogon',
  principal:'NT AUTHORITY\\SYSTEM',
  sid:'S-1-5-18',
  integrity:'SYSTEM',
  process:'LogonUI.exe',
  phase:'LOGON'
};

function jplopsoft_ntPublishContext(){
  var body=document.body,n=jplopsoft_el('jplopsoft_secureDesktopContext'),text;

  if(body){
    body.setAttribute('data-exfs-session',String(jplopsoft_NT_INTERACTIVE.sessionId));
    body.setAttribute('data-exfs-window-station',String(jplopsoft_NT_INTERACTIVE.windowStation));
    body.setAttribute('data-exfs-desktop',String(jplopsoft_NT_INTERACTIVE.desktop));
    body.setAttribute('data-exfs-principal',String(jplopsoft_NT_INTERACTIVE.principal));
    body.setAttribute('data-exfs-integrity',String(jplopsoft_NT_INTERACTIVE.integrity));
    body.setAttribute('data-exfs-process',String(jplopsoft_NT_INTERACTIVE.process));
  }

  text='Session '+jplopsoft_NT_INTERACTIVE.sessionId+
       ' · '+jplopsoft_NT_INTERACTIVE.windowStation+'\\'+jplopsoft_NT_INTERACTIVE.desktop+
       ' · '+jplopsoft_NT_INTERACTIVE.principal+
       ' · '+jplopsoft_NT_INTERACTIVE.process;

  if(n)n.textContent=text;
}

function jplopsoft_ntEnterWinlogonDesktop(process,phase){
  jplopsoft_NT_INTERACTIVE.sessionId=1;
  jplopsoft_NT_INTERACTIVE.serviceSessionId=0;
  jplopsoft_NT_INTERACTIVE.windowStation='WinSta0';
  jplopsoft_NT_INTERACTIVE.desktop='Winlogon';
  jplopsoft_NT_INTERACTIVE.principal='NT AUTHORITY\\SYSTEM';
  jplopsoft_NT_INTERACTIVE.sid='S-1-5-18';
  jplopsoft_NT_INTERACTIVE.integrity='SYSTEM';
  jplopsoft_NT_INTERACTIVE.process=String(process||'LogonUI.exe');
  jplopsoft_NT_INTERACTIVE.phase=String(phase||'LOGON');
  jplopsoft_ntPublishContext();
}

function jplopsoft_ntEnterDefaultDesktop(username,sid){
  username=String(username||'administrator').toLowerCase();
  jplopsoft_NT_INTERACTIVE.sessionId=1;
  jplopsoft_NT_INTERACTIVE.serviceSessionId=0;
  jplopsoft_NT_INTERACTIVE.windowStation='WinSta0';
  jplopsoft_NT_INTERACTIVE.desktop='Default';
  jplopsoft_NT_INTERACTIVE.principal=username;
  jplopsoft_NT_INTERACTIVE.sid=String(sid||'');
  jplopsoft_NT_INTERACTIVE.integrity='USER';
  jplopsoft_NT_INTERACTIVE.process='explorer.exe';
  jplopsoft_NT_INTERACTIVE.phase='USER_DESKTOP';
  jplopsoft_ntPublishContext();
}

function jplopsoft_ntSyncRouteSecurityContext(){
  if(jplopsoft_routeIsSystem()){
    if(jplopsoft_EXE_ROUTE&&jplopsoft_EXE_ROUTE.app==='os_setup'){
      jplopsoft_ntEnterWinlogonDesktop('setup.exe','OOBE');
    }else{
      jplopsoft_ntEnterWinlogonDesktop('LogonUI.exe','LOGON');
    }
    return;
  }

  if(state&&state.samAuthenticated&&state.samSid){
    jplopsoft_ntEnterDefaultDesktop(state.samUsername||jplopsoft_routeUsername(),state.samSid);
  }else{
    jplopsoft_ntEnterWinlogonDesktop('LogonUI.exe','CREDENTIAL_REQUIRED');
  }
}

function jplopsoft_selectLogonAccount(username,focusPassword){
  var sel=jplopsoft_el('jplopsoft_loginUserInput'),
      input=jplopsoft_el('jplopsoft_keyInput');

  username=String(username||state.defaultUsername||'administrator').toLowerCase();

  if(sel)sel.value=username;
  state.samUsername=username;
  if(input)input.value='';

  jplopsoft_renderLogonAccounts();

  if(focusPassword!==false&&input){
    window.setTimeout(function(){try{input.focus();}catch(ignoreFocus){}},20);
  }
}

function jplopsoft_renderLogonAccounts(){
  var host=jplopsoft_el('jplopsoft_logonAccountList'),
      selected=jplopsoft_el('jplopsoft_logonSelectedUser'),
      sel=jplopsoft_el('jplopsoft_loginUserInput'),
      users=state.samUsers||[],
      username,i,b,icon,copy,name,type,nameNode;

  username=String(sel&&sel.value?sel.value:(state.samUsername||state.defaultUsername||'administrator')).toLowerCase();
  if(selected)selected.textContent=username;

  if(!host)return;
  host.innerHTML='';

  for(i=0;i<users.length;i++){
    name=String(users[i]||'').toLowerCase();
    if(!name)continue;

    b=document.createElement('button');
    b.type='button';
    b.className='jplopsoft_logon-account'+(name===username?' jplopsoft_active':'');
    b.setAttribute('data-logon-user',name);
    b.setAttribute('aria-pressed',name===username?'true':'false');

    icon=document.createElement('span');
    icon.className='jplopsoft_logon-account-icon';
    icon.setAttribute('data-exfs-svg','user');
    icon.setAttribute('data-exfs-svg-size','36');
    b.appendChild(icon);

    copy=document.createElement('span');
    copy.className='jplopsoft_logon-account-copy';

    nameNode=document.createElement('span');
    nameNode.className='jplopsoft_logon-account-name';
    nameNode.textContent=name;
    copy.appendChild(nameNode);

    type=document.createElement('small');
    type.className='jplopsoft_logon-account-type';
    type.textContent=name==='administrator'?'內建系統管理員':'本機帳號';
    copy.appendChild(type);
    b.appendChild(copy);

    (function(u,node){
      node.onclick=function(){jplopsoft_selectLogonAccount(u,true);};
    })(name,b);

    host.appendChild(b);
  }

  jplopsoft_applySvgIcons(host);
}

function jplopsoft_oobePasswordFeedback(){
  var p=jplopsoft_el('jplopsoft_setupPasswordInput'),
      c=jplopsoft_el('jplopsoft_setupConfirmInput'),
      s=jplopsoft_el('jplopsoft_oobePasswordState'),
      raw=p?String(p.value||''):'',
      confirm=c?String(c.value||''):'';

  if(!s)return;

  if(!raw){
    s.className='jplopsoft_oobe-password-state';
    s.textContent='請設定不容易猜測的密碼。';
    return;
  }

  if(raw.length<8){
    s.className='jplopsoft_oobe-password-state jplopsoft_bad';
    s.textContent='建議至少 8 個字元。';
    return;
  }

  if(confirm&&raw!==confirm){
    s.className='jplopsoft_oobe-password-state jplopsoft_bad';
    s.textContent='兩次輸入的密碼不一致。';
    return;
  }

  if(confirm&&raw===confirm){
    s.className='jplopsoft_oobe-password-state jplopsoft_ok';
    s.textContent='密碼確認完成。';
    return;
  }

  s.className='jplopsoft_oobe-password-state';
  s.textContent='請再輸入一次密碼確認。';
}

function jplopsoft_submitCredentialUI(){
  var username,raw,confirm,setupName;

  if(state.kdfBusy)return;

  if(!state.initialized){
    setupName=jplopsoft_el('jplopsoft_setupAccountName');
    username=String(setupName&&setupName.value?setupName.value:(state.defaultUsername||'administrator')).toLowerCase();
    raw=String(jplopsoft_el('jplopsoft_setupPasswordInput')?jplopsoft_el('jplopsoft_setupPasswordInput').value:'');
    confirm=String(jplopsoft_el('jplopsoft_setupConfirmInput')?jplopsoft_el('jplopsoft_setupConfirmInput').value:'');

    if(!raw){
      jplopsoft_user32MessageBox('請建立 administrator 密碼。');
      jplopsoft_focusDecryptPassword(false);
      return;
    }

    if(raw!==confirm){
      jplopsoft_user32MessageBox('兩次輸入的密碼不一致。');
      if(jplopsoft_el('jplopsoft_setupConfirmInput'))jplopsoft_el('jplopsoft_setupConfirmInput').focus();
      return;
    }

    jplopsoft_unlockWithPassword(username,raw,false);
    return;
  }

  username=String(jplopsoft_el('jplopsoft_loginUserInput')?jplopsoft_el('jplopsoft_loginUserInput').value:(state.defaultUsername||'administrator')).toLowerCase();
  raw=String(jplopsoft_el('jplopsoft_keyInput')?jplopsoft_el('jplopsoft_keyInput').value:'');
  jplopsoft_unlockWithPassword(username,raw,jplopsoft_rememberUnlockEnabled());
}


function jplopsoft_renderLogonSubmitButton(){
  var b=jplopsoft_el('jplopsoft_unlockBtn'),fallback,span,applied=false,next,nextIcon;
  if(!b)return;
  b.innerHTML='';
  fallback=document.createElement('span');
  fallback.className='jplopsoft_logon-submit-fallback';
  fallback.setAttribute('aria-hidden','true');
  fallback.textContent='→';
  b.appendChild(fallback);
  span=document.createElement('span');
  span.setAttribute('data-exfs-svg','arrow_right');
  span.setAttribute('data-exfs-svg-size','20');
  span.setAttribute('aria-hidden','true');
  b.appendChild(span);
  b.setAttribute('aria-label','登入');
  applied=!!jplopsoft_svgIconApply(span,'arrow_right',20);
  if(applied)b.setAttribute('data-icon-ready','1');else b.removeAttribute('data-icon-ready');
  next=jplopsoft_el('jplopsoft_setupNextBtn');
  if(next){
    nextIcon=next.querySelector?next.querySelector('.jplopsoft_oobe-next-icon'):null;
    if(nextIcon&&jplopsoft_svgIconApply(nextIcon,'arrow_right',18))next.setAttribute('data-icon-ready','1');
    else next.removeAttribute('data-icon-ready');
  }
}

function jplopsoft_secureDesktopUpdate(){
  var status=jplopsoft_el('jplopsoft_logonStatusMirror'),
      setupName=jplopsoft_el('jplopsoft_setupAccountName');

  /* Secure Desktop owns its own LogonUI/OOBE background presentation.
     Desktop wallpaper data is owned by shell32.dll and must not be reached
     through a legacy Host global from the Runtime. */
  if(setupName)setupName.value=String(state.defaultUsername||'administrator');

  jplopsoft_renderLogonAccounts();
  jplopsoft_renderLogonSubmitButton();
  jplopsoft_oobePasswordFeedback();
  jplopsoft_ntSyncRouteSecurityContext();

  if(status&&state.kdfBusy)status.textContent='正在驗證認證資訊…';
}

function jplopsoft_bindSecureDesktopUI(){
  var setupPass=jplopsoft_el('jplopsoft_setupPasswordInput'),
      setupConfirm=jplopsoft_el('jplopsoft_setupConfirmInput'),
      setupNext=jplopsoft_el('jplopsoft_setupNextBtn');

  if(setupPass){
    setupPass.oninput=jplopsoft_oobePasswordFeedback;
    setupPass.onkeydown=function(e){
      e=e||window.event;
      if((e.keyCode||e.which)===13){
        if(e.preventDefault)e.preventDefault();
        try{if(setupConfirm)setupConfirm.focus();}catch(ignore){}
        return false;
      }
    };
  }

  if(setupConfirm){
    setupConfirm.oninput=jplopsoft_oobePasswordFeedback;
    setupConfirm.onkeydown=function(e){
      e=e||window.event;
      if((e.keyCode||e.which)===13){
        if(e.preventDefault)e.preventDefault();
        jplopsoft_submitCredentialUI();
        return false;
      }
    };
  }

  if(setupNext)setupNext.onclick=jplopsoft_submitCredentialUI;

  jplopsoft_secureDesktopUpdate();
}

/* =========================================================================
 * ExFS user32.dll compatibility layer
 *
 * Browser JavaScript cannot call the real Windows user32.dll.  ExFS therefore
 * exposes a Win32-shaped window API whose system-owned Non-Client Area is
 * rendered by one central implementation, while applications only own their
 * Client Area.
 *
 * The API deliberately follows the Win32 names and message flow:
 *   RegisterClass -> CreateWindow/CreateWindowEx -> SendMessage
 *   WM_NCLBUTTONDOWN -> WM_SYSCOMMAND -> WM_CLOSE
 *
 * Existing ExFS windows are "adopted" into the same API, so Explorer, CMD,
 * Control Panel, Security, Recycle Bin, Properties, 3D Volume and editors
 * all share one window-system path.
 * ========================================================================= */

/* Standard Win32-style window styles (subset used by ExFS). */
var jplopsoft_WS_CAPTION=0x00C00000;
var jplopsoft_WS_SYSMENU=0x00080000;
var jplopsoft_WS_THICKFRAME=0x00040000;
var jplopsoft_WS_MINIMIZEBOX=0x00020000;
var jplopsoft_WS_MAXIMIZEBOX=0x00010000;
var jplopsoft_WS_VISIBLE=0x10000000;
var jplopsoft_WS_OVERLAPPEDWINDOW=
  jplopsoft_WS_CAPTION|
  jplopsoft_WS_SYSMENU|
  jplopsoft_WS_THICKFRAME|
  jplopsoft_WS_MINIMIZEBOX|
  jplopsoft_WS_MAXIMIZEBOX;

var jplopsoft_WS_EX_APPWINDOW=0x00040000;
var jplopsoft_WS_EX_TOOLWINDOW=0x00000080;

/* Win32-style messages and system commands. */
var jplopsoft_WM_CREATE=0x0001;
var jplopsoft_WM_DESTROY=0x0002;
var jplopsoft_WM_MOVE=0x0003;
var jplopsoft_WM_SIZE=0x0005;
var jplopsoft_WM_ACTIVATE=0x0006;
var jplopsoft_WM_CLOSE=0x0010;
var jplopsoft_WM_NCLBUTTONDOWN=0x00A1;
var jplopsoft_WM_NCACTIVATE=0x0086;
var jplopsoft_WM_SYSCOMMAND=0x0112;

var jplopsoft_SC_MINIMIZE=0xF020;
var jplopsoft_SC_MAXIMIZE=0xF030;
var jplopsoft_SC_CLOSE=0xF060;
var jplopsoft_SC_RESTORE=0xF120;

var jplopsoft_HTCAPTION=2;
var jplopsoft_HTMINBUTTON=8;
var jplopsoft_HTMAXBUTTON=9;
var jplopsoft_HTCLOSE=20;

var jplopsoft_SW_HIDE=0;
var jplopsoft_SW_SHOWNORMAL=1;
var jplopsoft_SW_SHOWMINIMIZED=2;
var jplopsoft_SW_SHOWMAXIMIZED=3;
var jplopsoft_SW_SHOW=5;
var jplopsoft_SW_MINIMIZE=6;
var jplopsoft_SW_RESTORE=9;

/* SIZE message wParam values. */
var jplopsoft_SIZE_RESTORED=0;
var jplopsoft_SIZE_MINIMIZED=1;
var jplopsoft_SIZE_MAXIMIZED=2;

var jplopsoft_USER32={
  nextHwnd:1000,
  classes:{},
  windows:{},
  byElementId:{}
};

var jplopsoft_DWM={
  compositor:'ExFS Desktop Window Manager',
  activeHwnd:0,
  surfaces:{}
};

var jplopsoft_NT_SCHEDULER={
  foregroundPid:0,
  foregroundHwnd:0,
  baseQuantumMs:20,
  foregroundQuantumMs:36,
  basePriority:8,
  foregroundBoost:2,
  generation:0
};

function jplopsoft_ntKernelBugCheckFreeze(info){
  var k,ctx,i,w;
  jplopsoft_NT_SCHEDULER.halted=true;
  jplopsoft_NT_SCHEDULER.foregroundPid=0;
  jplopsoft_NT_SCHEDULER.foregroundHwnd=0;
  jplopsoft_NT_SCHEDULER.generation++;
  if(typeof jplopsoft_XSH!=='undefined'&&jplopsoft_XSH&&jplopsoft_XSH.byPid){
    for(k in jplopsoft_XSH.byPid){
      if(!Object.prototype.hasOwnProperty.call(jplopsoft_XSH.byPid,k))continue;
      ctx=jplopsoft_XSH.byPid[k];
      if(!ctx)continue;
      ctx.kernelFrozen=true;
      ctx.messageQueue=[];
      ctx.eventQueue=[];
      if(ctx.messageWaiters&&ctx.messageWaiters.length){
        for(i=0;i<ctx.messageWaiters.length;i++){
          w=ctx.messageWaiters[i];
          try{if(w.timer)window.clearTimeout(w.timer);}catch(ignoreTimer){}
          try{w.resolve(null);}catch(ignoreResolve){}
        }
        ctx.messageWaiters=[];
      }
    }
  }
  return info||null;
}

function jplopsoft_ntSchedulerSetForeground(rec){
  if(typeof jplopsoft_KERNEL_BUGCHECK_ACTIVE!=='undefined'&&jplopsoft_KERNEL_BUGCHECK_ACTIVE)return null;
  var oldPid=jplopsoft_NT_SCHEDULER.foregroundPid,
      old=oldPid?jplopsoft_ntKernelProcessByPid(oldPid):null,
      p=null;
  if(old){old.foregroundBoost=0;old.dynamicPriority=old.basePriority||8;old.quantumMs=jplopsoft_NT_SCHEDULER.baseQuantumMs;}
  if(rec&&typeof jplopsoft_ntKernelOnWindowActivated==='function')p=jplopsoft_ntKernelOnWindowActivated(rec);
  if(p){
    p.foregroundBoost=jplopsoft_NT_SCHEDULER.foregroundBoost;
    p.dynamicPriority=Math.min(15,(p.basePriority||8)+p.foregroundBoost);
    p.quantumMs=jplopsoft_NT_SCHEDULER.foregroundQuantumMs;
    p.lastForegroundAt=jplopsoft_ntKernelNow();
    jplopsoft_NT_SCHEDULER.foregroundPid=p.pid;
    jplopsoft_NT_SCHEDULER.foregroundHwnd=rec.hwnd;
  }else{
    jplopsoft_NT_SCHEDULER.foregroundPid=0;
    jplopsoft_NT_SCHEDULER.foregroundHwnd=0;
  }
  jplopsoft_NT_SCHEDULER.generation++;
  return p;
}


function jplopsoft_user32Key(hwnd){
  return String(parseInt(hwnd,10)||0);
}

function jplopsoft_RegisterClass(className,wndProc){
  className=String(className||'');
  if(!className)return false;
  jplopsoft_USER32.classes[className]={name:className,wndProc:typeof wndProc==='function'?wndProc:null};
  return true;
}

function jplopsoft_user32GetRecord(hwnd){
  return jplopsoft_USER32.windows[jplopsoft_user32Key(hwnd)]||null;
}

function jplopsoft_user32GetHwndByElementId(id){
  return parseInt(jplopsoft_USER32.byElementId[String(id||'')],10)||0;
}

function jplopsoft_GetWindowElement(hwnd){
  var r=jplopsoft_user32GetRecord(hwnd);
  return r?jplopsoft_el(r.windowId):null;
}

function jplopsoft_GetClientElement(hwnd){
  var r=jplopsoft_user32GetRecord(hwnd);
  return r&&r.clientId?jplopsoft_el(r.clientId):null;
}

function jplopsoft_SetWindowText(hwnd,text){
  var r=jplopsoft_user32GetRecord(hwnd),n;
  if(!r)return false;
  r.title=String(text||'');
  n=r.titleId?jplopsoft_el(r.titleId):null;
  if(n)n.textContent=r.title;
  return true;
}

function jplopsoft_GetWindowRect(hwnd){
  var w=jplopsoft_GetWindowElement(hwnd),r;
  if(!w||!w.getBoundingClientRect)return null;
  r=w.getBoundingClientRect();
  return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.right-r.left,height:r.bottom-r.top};
}

function jplopsoft_GetClientRect(hwnd){
  var c=jplopsoft_GetClientElement(hwnd),w,r;
  if(c&&c.getBoundingClientRect){
    r=c.getBoundingClientRect();
    return{left:0,top:0,right:r.right-r.left,bottom:r.bottom-r.top,width:r.right-r.left,height:r.bottom-r.top};
  }
  w=jplopsoft_GetWindowElement(hwnd);
  if(!w||!w.getBoundingClientRect)return null;
  r=w.getBoundingClientRect();
  return{left:0,top:0,right:r.right-r.left,bottom:r.bottom-r.top,width:r.right-r.left,height:r.bottom-r.top};
}

function jplopsoft_DwmRegisterSurface(rec){
  var w;
  if(!rec)return;
  w=jplopsoft_el(rec.windowId);
  if(!w)return;
  jplopsoft_wmClassAdd(w,'jplopsoft_win32-window');
  jplopsoft_wmClassAdd(w,'jplopsoft_dwm-surface');
  jplopsoft_wmClassAdd(w,'jplopsoft_dwm-inactive');
  w.setAttribute('data-exfs-hwnd',String(rec.hwnd));
  w.setAttribute('data-exfs-win32-class',String(rec.className||''));
  jplopsoft_DWM.surfaces[jplopsoft_user32Key(rec.hwnd)]=rec.windowId;
}

function jplopsoft_DwmUnregisterSurface(hwnd){
  var k=jplopsoft_user32Key(hwnd);
  delete jplopsoft_DWM.surfaces[k];
  if(jplopsoft_DWM.activeHwnd===parseInt(hwnd,10))jplopsoft_DWM.activeHwnd=0;
}

function jplopsoft_DwmActivateWindow(hwnd){
  var k,id,w,active=parseInt(hwnd,10)||0,rec=jplopsoft_user32GetRecord(hwnd);
  for(k in jplopsoft_DWM.surfaces){
    if(jplopsoft_DWM.surfaces.hasOwnProperty(k)){
      id=jplopsoft_DWM.surfaces[k];
      w=jplopsoft_el(id);
      if(w){
        jplopsoft_wmClassRemove(w,'jplopsoft_dwm-active');
        jplopsoft_wmClassAdd(w,'jplopsoft_dwm-inactive');
      }
    }
  }
  if(rec){
    w=jplopsoft_el(rec.windowId);
    if(w){
      jplopsoft_wmClassRemove(w,'jplopsoft_dwm-inactive');
      jplopsoft_wmClassAdd(w,'jplopsoft_dwm-active');
    }
  }
  jplopsoft_DWM.activeHwnd=active;
}

function jplopsoft_user32Activate(rec){
  var oldHwnd,oldRec;
  if(!rec)return false;

  oldHwnd=parseInt(jplopsoft_NT_SCHEDULER.foregroundHwnd,10)||0;
  oldRec=oldHwnd?jplopsoft_user32GetRecord(oldHwnd):null;
  if(oldRec&&oldRec.hwnd!==rec.hwnd){
    jplopsoft_xshWindowActivation(oldRec,false);
  }

  if(rec.ntTerminated){
    rec.ntTerminated=false;
    rec.ntPid=0;
  }
  if(typeof jplopsoft_ntKernelOnWindowActivated==='function'){
    jplopsoft_ntKernelOnWindowActivated(rec);
  }

  if(rec.overlay){
    jplopsoft_wmActivateOverlay(rec.backdropId,rec.windowId,rec.appId);
  }else{
    jplopsoft_wmActivate(rec.windowId,rec.appId);
  }
  jplopsoft_DwmActivateWindow(rec.hwnd);
  jplopsoft_ntSchedulerSetForeground(rec);
  jplopsoft_SendMessage(rec.hwnd,jplopsoft_WM_NCACTIVATE,1,0);
  jplopsoft_SendMessage(rec.hwnd,jplopsoft_WM_ACTIVATE,1,0);
  jplopsoft_xshWindowActivation(rec,true);
  return true;
}


function jplopsoft_user32NodeVisible(n){
  var cs,r;
  if(!n||jplopsoft_wmClassHas(n,'jplopsoft_hidden'))return false;
  try{cs=window.getComputedStyle?window.getComputedStyle(n,null):n.currentStyle;}catch(ignoreUser32VisibleStyle){cs=null;}
  if(cs){
    if(String(cs.display||'').toLowerCase()==='none')return false;
    if(String(cs.visibility||'').toLowerCase()==='hidden')return false;
  }else if(n.style&&n.style.display==='none')return false;
  try{
    if(n.getBoundingClientRect){
      r=n.getBoundingClientRect();
      if((r.right-r.left)<=0||(r.bottom-r.top)<=0)return false;
    }
  }catch(ignoreUser32VisibleRect){}
  return true;
}
function jplopsoft_user32DisplayIsVisible(rec){
  var w,b;
  if(!rec)return false;
  if(rec.overlay){
    b=rec.backdropId?jplopsoft_el(rec.backdropId):null;
    return jplopsoft_user32NodeVisible(b);
  }
  w=jplopsoft_el(rec.windowId);
  return jplopsoft_user32NodeVisible(w);
}

function jplopsoft_user32BringToFront(hwnd){
  var rec=jplopsoft_user32GetRecord(hwnd);
  if(!rec)return false;
  jplopsoft_user32Display(rec,true);
  jplopsoft_user32SetWindowState(rec,'normal');
  jplopsoft_user32Activate(rec);
  return true;
}

function jplopsoft_user32IsMaximized(rec){
  var w=rec?jplopsoft_el(rec.windowId):null;
  return !!(w&&(jplopsoft_wmClassHas(w,'jplopsoft_wm-maximized')||jplopsoft_wmClassHas(w,'jplopsoft_maximized')));
}

function jplopsoft_user32SetNodeDisplay(n,show,displayMode){
  if(!n)return false;
  if(show){
    jplopsoft_wmClassRemove(n,'jplopsoft_hidden');
    try{n.style.removeProperty('display');}catch(ignoreUser32DisplayRemove){}
    try{n.style.display=String(displayMode||'block');}catch(ignoreUser32DisplayShow){}
    try{n.removeAttribute('aria-hidden');}catch(ignoreUser32AriaShow){}
  }else{
    jplopsoft_wmClassAdd(n,'jplopsoft_hidden');
    try{n.style.setProperty('display','none','important');}catch(ignoreUser32DisplayHide){try{n.style.display='none';}catch(ignoreUser32DisplayHide2){}}
    try{n.setAttribute('aria-hidden','true');}catch(ignoreUser32AriaHide){}
  }
  return true;
}
function jplopsoft_user32Display(rec,show){
  var w,b;
  if(!rec)return false;
  w=jplopsoft_el(rec.windowId);
  b=rec.backdropId?jplopsoft_el(rec.backdropId):null;
  if(rec.overlay){
    if(b)jplopsoft_user32SetNodeDisplay(b,show,'flex');
  }else if(w){
    jplopsoft_user32SetNodeDisplay(w,show,rec.displayMode||'block');
  }
  return true;
}

function jplopsoft_user32SetWindowState(rec,stateName){
  var w,b,s=String(stateName||'normal');
  if(!rec)return false;
  if(s!=='normal'&&s!=='minimized'&&s!=='maximized'&&s!=='hidden')s='normal';
  rec.windowState=s;
  w=jplopsoft_el(rec.windowId);
  b=rec.backdropId?jplopsoft_el(rec.backdropId):null;
  try{if(w)w.setAttribute('data-exos-window-state',s);}catch(ignoreStateAttr){}
  try{if(b)b.setAttribute('data-exos-window-state',s);}catch(ignoreBackdropStateAttr){}
  return true;
}

function jplopsoft_ShowWindow(hwnd,cmd){
  var rec=jplopsoft_user32GetRecord(hwnd),w;
  if(!rec)return false;
  w=jplopsoft_el(rec.windowId);

  if(cmd===jplopsoft_SW_HIDE){
    jplopsoft_user32Display(rec,false);
    jplopsoft_user32SetWindowState(rec,'hidden');
    return true;
  }

  if(cmd===jplopsoft_SW_MINIMIZE||cmd===jplopsoft_SW_SHOWMINIMIZED){
    var minimized=false;

    try{
      if(typeof rec.onMinimize==='function'){
        rec.onMinimize(rec);
      }else if(rec.overlay){
        jplopsoft_wmOverlayMinimize(
          rec.backdropId,
          rec.windowId,
          rec.appId
        );
      }else{
        jplopsoft_wmMinimize(
          rec.windowId,
          rec.appId,
          true
        );
      }
    }catch(ignoreUser32MinimizeCallback){}

    /*
     * USER32 owns SW_MINIMIZE semantics. If a callback returned without
     * actually hiding the window, enforce
     * the DWM state here instead of leaving a dead minimize button.
     */
    minimized=
      !jplopsoft_user32DisplayIsVisible(
        rec
      );

    if(!minimized){
      if(rec.overlay){
        if(rec.backdropId){
          var back=jplopsoft_el(
            rec.backdropId
          );

          if(back){
            jplopsoft_user32SetNodeDisplay(back,false,'flex');
          }
        }
      }else if(w){
        jplopsoft_user32SetNodeDisplay(w,false,rec.displayMode||'block');
      }
    }

    if(w){
      jplopsoft_wmClassRemove(
        w,
        'jplopsoft_wm-active'
      );
    }

    if(
      rec.appId&&
      rec.taskbar!==false
    ){
      jplopsoft_taskbarSetAppState(
        rec.appId,
        'minimized'
      );
    }


    jplopsoft_user32SetWindowState(rec,'minimized');

    jplopsoft_SendMessage(
      hwnd,
      jplopsoft_WM_SIZE,
      jplopsoft_SIZE_MINIMIZED,
      0
    );

    return true;
  }

  if(cmd===jplopsoft_SW_SHOWMAXIMIZED){
    jplopsoft_user32Display(rec,true);
    if(typeof rec.onMaximize==='function')rec.onMaximize(rec);
    else if(rec.overlay)jplopsoft_wmClassAdd(w,'jplopsoft_wm-maximized');
    else jplopsoft_wmClassAdd(w,'jplopsoft_wm-maximized');
    jplopsoft_user32SetWindowState(rec,'maximized');
    jplopsoft_user32Activate(rec);
    jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_MAXIMIZED,0);
    return true;
  }

  if(cmd===jplopsoft_SW_RESTORE){
    jplopsoft_user32Display(rec,true);
    if(typeof rec.onRestore==='function')rec.onRestore(rec);
    else{
      jplopsoft_wmClassRemove(w,'jplopsoft_wm-maximized');
      jplopsoft_wmClassRemove(w,'jplopsoft_maximized');
    }
    jplopsoft_user32SetWindowState(rec,'normal');
    jplopsoft_user32Activate(rec);
    jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_RESTORED,0);
    return true;
  }

  jplopsoft_user32Display(rec,true);
  jplopsoft_user32Activate(rec);
  return true;
}

function jplopsoft_DestroyWindow(hwnd){
  var rec=jplopsoft_user32GetRecord(hwnd),w,k;
  if(!rec)return false;
  if(rec.destroying)return false;
  rec.destroying=true;

  if(typeof jplopsoft_ntKernelOnWindowDestroyed==='function'){
    jplopsoft_ntKernelOnWindowDestroyed(rec);
  }

  jplopsoft_SendMessage(hwnd,jplopsoft_WM_DESTROY,0,0);
  if(rec.appId&&rec.taskbar!==false)jplopsoft_taskbarRemoveApp(rec.appId);

  w=jplopsoft_el(rec.windowId);
  if(rec.dynamic&&w&&w.parentNode)w.parentNode.removeChild(w);
  else jplopsoft_user32Display(rec,false);

  delete jplopsoft_USER32.byElementId[rec.windowId];
  if(rec.titlebarId)delete jplopsoft_USER32.byElementId[rec.titlebarId];
  k=jplopsoft_user32Key(hwnd);
  delete jplopsoft_USER32.windows[k];
  jplopsoft_DwmUnregisterSurface(hwnd);
  return true;
}

function jplopsoft_DefWindowProc(hwnd,msg,wParam,lParam){
  var rec=jplopsoft_user32GetRecord(hwnd),w;
  if(!rec)return 0;

  if(msg===jplopsoft_WM_NCLBUTTONDOWN){
    if(wParam===jplopsoft_HTMINBUTTON)return jplopsoft_SendMessage(hwnd,jplopsoft_WM_SYSCOMMAND,jplopsoft_SC_MINIMIZE,0);
    if(wParam===jplopsoft_HTMAXBUTTON){
      return jplopsoft_SendMessage(hwnd,jplopsoft_WM_SYSCOMMAND,jplopsoft_user32IsMaximized(rec)?jplopsoft_SC_RESTORE:jplopsoft_SC_MAXIMIZE,0);
    }
    if(wParam===jplopsoft_HTCLOSE)return jplopsoft_SendMessage(hwnd,jplopsoft_WM_SYSCOMMAND,jplopsoft_SC_CLOSE,0);
    return 0;
  }

  if(msg===jplopsoft_WM_SYSCOMMAND){
    if(wParam===jplopsoft_SC_MINIMIZE){
      jplopsoft_ShowWindow(hwnd,jplopsoft_SW_MINIMIZE);
      return 0;
    }
    if(wParam===jplopsoft_SC_MAXIMIZE){
      if(typeof rec.onMaximize==='function'){
        rec.onMaximize(rec);
        jplopsoft_user32SetWindowState(rec,'maximized');
        jplopsoft_user32Activate(rec);
        jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_MAXIMIZED,0);
      }else jplopsoft_ShowWindow(hwnd,jplopsoft_SW_SHOWMAXIMIZED);
      return 0;
    }
    if(wParam===jplopsoft_SC_RESTORE){
      if(typeof rec.onRestore==='function'){
        rec.onRestore(rec);
        jplopsoft_user32SetWindowState(rec,'normal');
        jplopsoft_user32Activate(rec);
        jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_RESTORED,0);
      }else jplopsoft_ShowWindow(hwnd,jplopsoft_SW_RESTORE);
      return 0;
    }
    if(wParam===jplopsoft_SC_CLOSE){
      return jplopsoft_SendMessage(hwnd,jplopsoft_WM_CLOSE,0,0);
    }
  }

  if(msg===jplopsoft_WM_CLOSE){
    if(typeof rec.onClose==='function'){
      rec.onClose(rec);
      return 0;
    }
    jplopsoft_DestroyWindow(hwnd);
    return 0;
  }

  return 0;
}

function jplopsoft_SendMessage(hwnd,msg,wParam,lParam){
  if(typeof jplopsoft_KERNEL_BUGCHECK_ACTIVE!=='undefined'&&jplopsoft_KERNEL_BUGCHECK_ACTIVE)return 0;
  var rec=jplopsoft_user32GetRecord(hwnd),ret;
  if(!rec)return 0;
  if(typeof rec.wndProc==='function'){
    ret=rec.wndProc(hwnd,msg,wParam,lParam);
    if(ret!==null&&typeof ret!=='undefined')return ret;
  }
  return jplopsoft_DefWindowProc(hwnd,msg,wParam,lParam);
}

var jplopsoft_USER32_NC_CAPTURE_BOUND=false;
function jplopsoft_user32InstallNcCaptureRouter(){
  if(jplopsoft_USER32_NC_CAPTURE_BOUND||!document||!document.addEventListener)return false;
  jplopsoft_USER32_NC_CAPTURE_BOUND=true;
  document.addEventListener('click',function(e){
    var t=e&&e.target,btn,hwnd,hit;
    if(!t)return;
    btn=t.closest?t.closest('[data-exfs-hwnd][data-exfs-nc-hit]'):null;
    if(!btn)return;
    hwnd=parseInt(btn.getAttribute('data-exfs-hwnd'),10)||0;
    hit=parseInt(btn.getAttribute('data-exfs-nc-hit'),10)||0;
    if(!hwnd||!hit)return;
    if(e.preventDefault)e.preventDefault();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    else if(e.stopPropagation)e.stopPropagation();
    jplopsoft_SendMessage(hwnd,jplopsoft_WM_NCLBUTTONDOWN,hit,0);
  },true);
  return true;
}

function jplopsoft_user32BindNcButtonNode(hwnd,b,hitCode){
  if(!b)return false;
  jplopsoft_user32InstallNcCaptureRouter();

  hwnd=parseInt(hwnd,10)||0;
  hitCode=parseInt(hitCode,10)||0;

  if(!hwnd||!hitCode)return false;

  b.setAttribute(
    'data-exfs-hwnd',
    String(hwnd)
  );

  b.setAttribute(
    'data-exfs-nc-hit',
    String(hitCode)
  );

  /*
   * Bind the actual button node, rather than relying on titlebar/container
   * event delegation.  Several legacy ExOS windows install their own
   * onclick handlers later during desktop initialization; re-binding the
   * physical Non-Client button makes USER32 the final owner again.
   */
  b.onclick=function(e){
    e=e||window.event;

    if(e&&e.preventDefault){
      e.preventDefault();
    }

    if(e&&e.stopPropagation){
      e.stopPropagation();
    }

    jplopsoft_SendMessage(
      hwnd,
      jplopsoft_WM_NCLBUTTONDOWN,
      hitCode,
      0
    );

    return false;
  };

  return true;
}

function jplopsoft_user32BindNcButton(hwnd,id,hitCode){
  return jplopsoft_user32BindNcButtonNode(
    hwnd,
    jplopsoft_el(id),
    hitCode
  );
}

function jplopsoft_user32RebindNonClientButtons(root){
  var nodes,i,b,hwnd,hit;

  root=root||document;

  if(!root||!root.querySelectorAll){
    return 0;
  }

  nodes=root.querySelectorAll(
    '[data-exfs-hwnd][data-exfs-nc-hit]'
  );

  for(i=0;i<nodes.length;i++){
    b=nodes[i];

    hwnd=parseInt(
      b.getAttribute('data-exfs-hwnd'),
      10
    )||0;

    hit=parseInt(
      b.getAttribute('data-exfs-nc-hit'),
      10
    )||0;

    if(hwnd&&hit){
      jplopsoft_user32BindNcButtonNode(
        hwnd,
        b,
        hit
      );
    }
  }

  return nodes.length;
}

function jplopsoft_user32BindTitlebar(hwnd,titlebarId){
  var rec=jplopsoft_user32GetRecord(hwnd),t=jplopsoft_el(titlebarId);
  if(!rec||!t)return;
  t.setAttribute('data-exfs-nonclient','1');
  jplopsoft_wmClassAdd(t,'jplopsoft_win32-nonclient-area');
  t.ondblclick=function(e){
    e=e||window.event;
    if(!jplopsoft_wmCanDragTarget(e.target||e.srcElement))return;
    if((rec.style&jplopsoft_WS_MAXIMIZEBOX)!==0){
      jplopsoft_SendMessage(hwnd,jplopsoft_WM_NCLBUTTONDOWN,jplopsoft_HTMAXBUTTON,0);
    }
  };
  jplopsoft_wmMakeDraggable(rec.windowId,titlebarId);
}

function jplopsoft_AdoptWindow(options){
  var o=options||{},classDef,rec,hwnd,w,i,n;
  if(!o.windowId||!jplopsoft_el(o.windowId))return 0;

  hwnd=jplopsoft_USER32.nextHwnd++;
  classDef=jplopsoft_USER32.classes[String(o.className||'')]||null;
  rec={
    hwnd:hwnd,
    dynamic:false,
    overlay:!!o.overlay,
    backdropId:String(o.backdropId||''),
    windowId:String(o.windowId||''),
    titlebarId:String(o.titlebarId||''),
    titleId:String(o.titleId||''),
    clientId:String(o.clientId||''),
    className:String(o.className||'ExFS.AdoptedWindow'),
    title:String(o.title||''),
    style:typeof o.style==='number'?o.style:jplopsoft_WS_OVERLAPPEDWINDOW,
    exStyle:typeof o.exStyle==='number'?o.exStyle:0,
    appId:String(o.appId||''),
    icon:String(o.icon||'file'),
    displayMode:String(o.displayMode||'block'),
    taskbar:o.taskbar===false?false:true,
    windowState:'normal',
    wndProc:typeof o.wndProc==='function'?o.wndProc:(classDef?classDef.wndProc:null),
    onMinimize:typeof o.onMinimize==='function'?o.onMinimize:null,
    onMaximize:typeof o.onMaximize==='function'?o.onMaximize:null,
    onRestore:typeof o.onRestore==='function'?o.onRestore:null,
    onClose:typeof o.onClose==='function'?o.onClose:null,
    param:o.param||null
  };

  jplopsoft_USER32.windows[jplopsoft_user32Key(hwnd)]=rec;
  jplopsoft_USER32.byElementId[rec.windowId]=hwnd;
  if(rec.titlebarId)jplopsoft_USER32.byElementId[rec.titlebarId]=hwnd;

  w=jplopsoft_el(rec.windowId);
  jplopsoft_DwmRegisterSurface(rec);

  if(rec.titlebarId)jplopsoft_user32BindTitlebar(hwnd,rec.titlebarId);
  if(o.minButtonId)jplopsoft_user32BindNcButton(hwnd,o.minButtonId,jplopsoft_HTMINBUTTON);
  if(o.maxButtonId)jplopsoft_user32BindNcButton(hwnd,o.maxButtonId,jplopsoft_HTMAXBUTTON);
  if(o.closeButtonId)jplopsoft_user32BindNcButton(hwnd,o.closeButtonId,jplopsoft_HTCLOSE);

  if(o.clientIds&&o.clientIds.length){
    for(i=0;i<o.clientIds.length;i++){
      n=jplopsoft_el(o.clientIds[i]);
      if(n){
        n.setAttribute('data-exfs-client','1');
        jplopsoft_wmClassAdd(n,'jplopsoft_win32-client-area');
      }
    }
  }

  jplopsoft_SendMessage(hwnd,jplopsoft_WM_CREATE,0,rec.param);
  return hwnd;
}

function jplopsoft_CreateWindowEx(exStyle,className,windowName,style,x,y,width,height,parent,menu,instance,param){
  jplopsoft_dwmNormalizeRootStacking();
  var classDef=jplopsoft_USER32.classes[String(className||'')]||null,
      p=param||{},app=jplopsoft_rootWindowHost()||jplopsoft_el('jplopsoft_app')||(document.querySelector?document.querySelector('.jplopsoft_app'):null),
      task=jplopsoft_el('jplopsoft_taskbar'),hwnd,rec,win,titlebar,icon,title,controls,b,client;

  if(!app)return 0;
  hwnd=jplopsoft_USER32.nextHwnd++;

  rec={
    hwnd:hwnd,
    dynamic:true,
    overlay:false,
    backdropId:'',
    windowId:String(p.windowId||('jplopsoft_win32Window_'+hwnd)),
    titlebarId:String(p.titlebarId||('jplopsoft_win32Titlebar_'+hwnd)),
    titleId:String(p.titleId||('jplopsoft_win32Title_'+hwnd)),
    clientId:String(p.clientId||('jplopsoft_win32Client_'+hwnd)),
    className:String(className||'ExOS.Window'),
    title:String(windowName||''),
    style:typeof style==='number'?style:jplopsoft_WS_OVERLAPPEDWINDOW,
    exStyle:typeof exStyle==='number'?exStyle:0,
    appId:String(p.appId||('win32_'+hwnd)),
    icon:String(p.icon||'file'),
    displayMode:'flex',
    taskbar:p.taskbar===false?false:true,
    windowState:'normal',
    wndProc:typeof p.wndProc==='function'?p.wndProc:(classDef?classDef.wndProc:null),
    onMinimize:null,onMaximize:null,onRestore:null,onClose:null,
    param:p
  };

  win=document.createElement(p.tagName||'section');
  win.id=rec.windowId;
  win.className='jplopsoft_wm-window jplopsoft_dwm-root-window jplopsoft_win32-window jplopsoft_win32-created-window jplopsoft_dwm-surface '+String(p.windowClass||'');
  win.style.left=(typeof x==='number'?x:80)+'px';
  win.style.top=(typeof y==='number'?y:60)+'px';
  win.style.display='flex';
  win.style.flexDirection='column';
  win.style.alignItems='stretch';
  if(typeof width==='number'&&width>0)win.style.width=width+'px';
  if(typeof height==='number'&&height>0)win.style.height=height+'px';

  titlebar=document.createElement('div');
  titlebar.id=rec.titlebarId;
  titlebar.className='jplopsoft_wm-titlebar jplopsoft_win32-nonclient-area '+String(p.titlebarClass||'');
  titlebar.setAttribute('data-exfs-nonclient','1');

  icon=document.createElement('div');
  icon.className='jplopsoft_wm-title-icon';
  icon.setAttribute('data-exfs-svg',rec.icon);
  icon.setAttribute('data-exfs-svg-size','18');
  titlebar.appendChild(icon);

  title=document.createElement('div');
  title.id=rec.titleId;
  title.className='jplopsoft_wm-title';
  title.textContent=rec.title;
  titlebar.appendChild(title);

  controls=document.createElement('div');
  controls.className='jplopsoft_wm-controls';

  if((rec.style&jplopsoft_WS_MINIMIZEBOX)!==0){
    b=document.createElement('button');b.type='button';b.className='jplopsoft_wm-control';
    b.title='最小化';b.setAttribute('aria-label','最小化');b.setAttribute('data-exfs-svg','minimize');b.setAttribute('data-exfs-svg-size','11');
    jplopsoft_user32BindNcButtonNode(hwnd,b,jplopsoft_HTMINBUTTON);controls.appendChild(b);
  }
  if((rec.style&jplopsoft_WS_MAXIMIZEBOX)!==0){
    b=document.createElement('button');b.type='button';b.className='jplopsoft_wm-control';
    b.title='最大化';b.setAttribute('aria-label','最大化');b.setAttribute('data-exfs-svg','maximize');b.setAttribute('data-exfs-svg-size','11');
    jplopsoft_user32BindNcButtonNode(hwnd,b,jplopsoft_HTMAXBUTTON);controls.appendChild(b);
  }
  if((rec.style&jplopsoft_WS_SYSMENU)!==0){
    b=document.createElement('button');b.type='button';b.className='jplopsoft_wm-control jplopsoft_wm-close';
    b.title='關閉';b.setAttribute('aria-label','關閉');b.setAttribute('data-exfs-svg','close');b.setAttribute('data-exfs-svg-size','11');
    jplopsoft_user32BindNcButtonNode(hwnd,b,jplopsoft_HTCLOSE);controls.appendChild(b);
  }
  titlebar.appendChild(controls);
  win.appendChild(titlebar);

  client=document.createElement('div');
  client.id=rec.clientId;
  client.className='jplopsoft_win32-client jplopsoft_win32-client-area '+String(p.clientClass||'');
  client.setAttribute('data-exfs-client','1');
  win.appendChild(client);

  if(task&&task.parentNode===app)app.insertBefore(win,task);else app.appendChild(win);

  jplopsoft_USER32.windows[jplopsoft_user32Key(hwnd)]=rec;
  jplopsoft_USER32.byElementId[rec.windowId]=hwnd;
  jplopsoft_USER32.byElementId[rec.titlebarId]=hwnd;

  jplopsoft_DwmRegisterSurface(rec);
  jplopsoft_user32BindTitlebar(hwnd,rec.titlebarId);

  /* Bind the centrally generated Non-Client Area controls. */
  controls.onclick=function(e){
    var t=e.target||e.srcElement,hit;
    while(t&&t!==controls&&!t.getAttribute('data-exfs-nc-hit'))t=t.parentNode;
    if(!t||t===controls)return;
    hit=parseInt(t.getAttribute('data-exfs-nc-hit'),10)||0;
    if(hit)jplopsoft_SendMessage(hwnd,jplopsoft_WM_NCLBUTTONDOWN,hit,0);
  };

  win.onmousedown=function(){jplopsoft_user32Activate(rec);};
  jplopsoft_applySvgIcons(win);
  jplopsoft_SendMessage(hwnd,jplopsoft_WM_CREATE,0,p);

  if(rec.taskbar&&(rec.exStyle&jplopsoft_WS_EX_TOOLWINDOW)===0){
    jplopsoft_taskbarEnsureApp(rec.appId,rec.icon,rec.title);
  }

  if((rec.style&jplopsoft_WS_VISIBLE)!==0)jplopsoft_ShowWindow(hwnd,jplopsoft_SW_SHOW);
  else win.style.display='none';

  return hwnd;
}

function jplopsoft_CreateWindow(className,windowName,style,x,y,width,height,parent,menu,instance,param){
  return jplopsoft_CreateWindowEx(0,className,windowName,style,x,y,width,height,parent,menu,instance,param);
}

/* Default window class for applications that do not need a custom WndProc. */
jplopsoft_RegisterClass('ExOS.Window',null);
jplopsoft_RegisterClass('ExOS.MultiEditor',null);

/* -------------------------------------------------------------------------
 * ExFS Desktop Window Manager
 *
 * All primary apps share one browser tab and coexist above the desktop:
 * Explorer, CMD, document editor, Control Panel and Security.
 * ---------------------------------------------------------------------- */
var jplopsoft_WM={
  z:140,
  active:'',
  dragging:false
};

/* Explorer application lifecycle is owned by XSH/SystemApps + USER32. */

function jplopsoft_wmClassHas(node,name){
  return !!(node&&(' '+String(node.className||'')+' ').indexOf(' '+name+' ')>=0);
}

function jplopsoft_wmClassAdd(node,name){
  if(!node||jplopsoft_wmClassHas(node,name))return;
  node.className=String(node.className||'')+' '+name;
}

function jplopsoft_wmClassRemove(node,name){
  var s;
  if(!node)return;
  s=' '+String(node.className||'')+' ';
  while(s.indexOf(' '+name+' ')>=0)s=s.replace(' '+name+' ',' ');
  node.className=s.replace(/^\s+|\s+$/g,'');
}

function jplopsoft_taskbarEnsureApp(appId,icon,label){
  if(typeof jplopsoft_shell32TaskbarEnsureApp==='function'){
    return jplopsoft_shell32TaskbarEnsureApp(appId,icon,label);
  }
  return null;
}

function jplopsoft_taskbarRemoveApp(appId){
  if(typeof jplopsoft_shell32TaskbarRemoveApp==='function'){
    return jplopsoft_shell32TaskbarRemoveApp(appId);
  }
  return false;
}

function jplopsoft_taskbarSetAppState(appId,stateName){
  if(typeof jplopsoft_shell32TaskbarSetAppState==='function'){
    return jplopsoft_shell32TaskbarSetAppState(appId,stateName);
  }
  return false;
}

function jplopsoft_wmNextZ(){
  var items=[],k,r,n,z,i;

  if(jplopsoft_WM.z>=340){
    for(k in jplopsoft_USER32.windows){
      if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
      r=jplopsoft_USER32.windows[k];
      if(!r)continue;

      if(r.overlay){
        n=r.backdropId?document.getElementById(r.backdropId):null;
      }else{
        n=r.windowId?document.getElementById(r.windowId):null;
      }

      if(!n)continue;

      try{
        if(n.style.display==='none'||n.offsetWidth<=0||n.offsetHeight<=0)continue;
      }catch(ignoreZVisibility){}

      z=parseInt(n.style.zIndex,10);
      if(isNaN(z))z=150;
      items.push({node:n,z:z});
    }

    items.sort(function(a,b){return a.z-b.z;});

    z=150;
    for(i=0;i<items.length;i++){
      items[i].node.style.zIndex=String(z++);
    }

    jplopsoft_WM.z=z;
    if(jplopsoft_WM.z>330)jplopsoft_WM.z=330;
  }

  jplopsoft_WM.z++;
  return jplopsoft_WM.z;
}

function jplopsoft_wmDeactivateTaskButtons(exceptApp){
  if(typeof jplopsoft_shell32TaskbarDeactivateApps==='function'){
    jplopsoft_shell32TaskbarDeactivateApps(exceptApp);
  }
}

function jplopsoft_wmActivate(windowId,appId){
  var w,hwnd;

  w=document.getElementById(String(windowId||''))||jplopsoft_el(windowId);
  if(!w)return;

  jplopsoft_wmDeactivateTaskButtons(appId);
  jplopsoft_WM.active=String(appId||'');

  w.style.zIndex=String(jplopsoft_wmNextZ());
  jplopsoft_wmClassAdd(w,'jplopsoft_wm-active');
  jplopsoft_taskbarSetAppState(appId,'active');

  hwnd=jplopsoft_user32GetHwndByElementId(String(windowId||''));
  if(hwnd)jplopsoft_DwmActivateWindow(hwnd);
}

function jplopsoft_wmActivateOverlay(backdropId,panelId,appId){
  var b=jplopsoft_el(backdropId),p=jplopsoft_el(panelId),hwnd;
  if(!b||!p)return;
  jplopsoft_wmDeactivateTaskButtons(appId);
  jplopsoft_WM.active=String(appId||'');
  b.style.zIndex=String(jplopsoft_wmNextZ());
  jplopsoft_wmClassAdd(p,'jplopsoft_wm-active');
  jplopsoft_taskbarSetAppState(appId,'active');
  hwnd=jplopsoft_user32GetHwndByElementId(panelId);
  if(hwnd)jplopsoft_DwmActivateWindow(hwnd);
}

function jplopsoft_dwmNormalizeRootStacking(){
  var app=jplopsoft_el('jplopsoft_app')||(
        document.querySelector?document.querySelector('.jplopsoft_app'):null
      ),
      layer=jplopsoft_el('jplopsoft_dwmWindowLayer');

  if(app)app.style.zIndex='auto';

  if(layer){
    layer.style.zIndex='auto';
    layer.style.pointerEvents='none';
  }

  return true;
}

function jplopsoft_dwmWindowLayer(){
  return jplopsoft_el('jplopsoft_dwmWindowLayer');
}

function jplopsoft_dwmAttachToWindowLayer(w){
  var layer=jplopsoft_dwmWindowLayer();

  if(!w||!layer)return false;

  if(w.parentNode!==layer){
    try{layer.appendChild(w);}catch(ignoreDwmAttach){return false;}
  }

  w.style.pointerEvents='auto';
  return true;
}

function jplopsoft_rootWindowHost(){
  /* Hotfix63: USER32 top-level windows belong to the DWM desktop window station,
     not to the HTML document root. Keeping HWND surfaces inside this bounded
     layer prevents an XSH window dragged below/right of the desktop from
     enlarging document.scrollHeight/scrollWidth and creating browser scrollbars. */
  return jplopsoft_dwmWindowLayer()||
    jplopsoft_el('jplopsoft_app')||
    (document.querySelector?document.querySelector('.jplopsoft_app'):null)||
    document.body||document.documentElement;
}







/*
 * Launching a CreateWindowEx application from an overlay (for example
 * diskmgmt.exe from Control Panel) crosses two different window containers.
 * Explicitly put the source overlay one DWM step lower and the child
 * application one step higher.  Both stay below the taskbar's z=390.
 */
function jplopsoft_wmPlaceWindowAboveOverlay(hwnd,backdropId){
  var rec=jplopsoft_user32GetRecord(hwnd),w=rec?jplopsoft_el(rec.windowId):null,b=jplopsoft_el(backdropId),lowerZ,upperZ;
  if(!rec||!w)return false;
  jplopsoft_dwmNormalizeRootStacking();
  lowerZ=jplopsoft_wmNextZ();upperZ=jplopsoft_wmNextZ();
  if(b)b.style.zIndex=String(lowerZ);w.style.zIndex=String(upperZ);
  jplopsoft_wmDeactivateTaskButtons(rec.appId);jplopsoft_WM.active=String(rec.appId||'');
  jplopsoft_wmClassAdd(w,'jplopsoft_wm-active');jplopsoft_taskbarSetAppState(rec.appId,'active');
  try{jplopsoft_DwmActivateWindow(hwnd);}catch(ignoreDwmOverlayOrder){}
  return true;
}

function jplopsoft_wmMinimize(windowId,appId,explicitAction){
  var w;

  w=document.getElementById(String(windowId||''))||jplopsoft_el(windowId);
  if(!w)return false;

  jplopsoft_user32SetNodeDisplay(w,false,'block');
  jplopsoft_wmClassRemove(w,'jplopsoft_wm-active');
  jplopsoft_taskbarSetAppState(appId,'minimized');
  return true;
}

function jplopsoft_wmRestore(windowId,appId){
  var w=jplopsoft_el(windowId);
  if(!w)return;
  jplopsoft_user32SetNodeDisplay(w,true,'block');
  jplopsoft_wmActivate(windowId,appId);
}

function jplopsoft_wmSetMaximized(windowId,on){
  var w=jplopsoft_el(windowId);
  if(!w)return;
  if(on)jplopsoft_wmClassAdd(w,'jplopsoft_wm-maximized');
  else jplopsoft_wmClassRemove(w,'jplopsoft_wm-maximized');
}

function jplopsoft_wmToggleMax(windowId){
  var w=jplopsoft_el(windowId);
  if(!w)return;
  jplopsoft_wmSetMaximized(windowId,!jplopsoft_wmClassHas(w,'jplopsoft_wm-maximized'));
}

function jplopsoft_wmSetOverlayMaximized(panelId,on){
  var p=jplopsoft_el(panelId);
  if(!p)return;
  if(on)jplopsoft_wmClassAdd(p,'jplopsoft_wm-maximized');
  else jplopsoft_wmClassRemove(p,'jplopsoft_wm-maximized');
}

function jplopsoft_wmToggleOverlayMax(panelId){
  var p=jplopsoft_el(panelId);
  if(!p)return;
  jplopsoft_wmSetOverlayMaximized(panelId,!jplopsoft_wmClassHas(p,'jplopsoft_wm-maximized'));
}

function jplopsoft_wmCanDragTarget(t){
  var tag=String(t&&t.tagName||'').toLowerCase();
  return tag!=='button'&&tag!=='input'&&tag!=='select'&&tag!=='textarea'&&tag!=='a';
}

function jplopsoft_wmMakeDraggable(panelId,handleId){
  var p=jplopsoft_el(panelId),h=jplopsoft_el(handleId);
  if(!p||!h)return;

  h.onmousedown=function(e){
    var sx,sy,left,top,move,up,rect;
    e=e||window.event;
    if(!jplopsoft_wmCanDragTarget(e.target||e.srcElement))return;
    if(jplopsoft_wmClassHas(p,'jplopsoft_wm-maximized')||jplopsoft_wmClassHas(p,'jplopsoft_maximized'))return;

    rect=p.getBoundingClientRect();
    sx=e.clientX;sy=e.clientY;left=rect.left;top=rect.top;
    jplopsoft_WM.dragging=true;

    move=function(ev){
      var nx,ny,maxX,maxY;
      ev=ev||window.event;
      if(!jplopsoft_WM.dragging)return;
      nx=left+(ev.clientX-sx);
      ny=top+(ev.clientY-sy);
      maxX=Math.max(0,(document.documentElement.clientWidth||window.innerWidth||1024)-80);
      maxY=Math.max(0,(document.documentElement.clientHeight||window.innerHeight||768)-80);
      if(nx<0)nx=0;if(ny<0)ny=0;if(nx>maxX)nx=maxX;if(ny>maxY)ny=maxY;
      p.style.left=Math.round(nx)+'px';
      p.style.top=Math.round(ny)+'px';
      p.style.right='auto';
      p.style.bottom='auto';
      if(ev.preventDefault)ev.preventDefault();
      return false;
    };
    up=function(){
      jplopsoft_WM.dragging=false;
      document.removeEventListener('mousemove',move,false);
      document.removeEventListener('mouseup',up,false);
    };

    document.addEventListener('mousemove',move,false);
    document.addEventListener('mouseup',up,false);
    if(e.preventDefault)e.preventDefault();
    return false;
  };
}

function jplopsoft_wmOverlayMinimize(backdropId,panelId,appId){
  var b=jplopsoft_el(backdropId),p=jplopsoft_el(panelId);
  if(b)b.style.display='none';
  if(p)jplopsoft_wmClassRemove(p,'jplopsoft_wm-active');
  jplopsoft_taskbarSetAppState(appId,'minimized');
}

function jplopsoft_wmOverlayRestore(backdropId,panelId,appId){
  var b=jplopsoft_el(backdropId);
  if(!b)return;
  jplopsoft_user32SetNodeDisplay(b,true,'flex');
  jplopsoft_wmActivateOverlay(backdropId,panelId,appId);
}

function jplopsoft_wmIsDisplayed(id){
  var n=jplopsoft_el(id),cs,r;
  if(!n)return false;
  if(jplopsoft_wmClassHas(n,'jplopsoft_hidden'))return false;
  try{cs=window.getComputedStyle?window.getComputedStyle(n,null):n.currentStyle;}catch(ignoreWmDisplayedStyle){cs=null;}
  if(cs){
    if(String(cs.display||'').toLowerCase()==='none')return false;
    if(String(cs.visibility||'').toLowerCase()==='hidden')return false;
    if(parseFloat(cs.opacity)===0)return false;
  }else if(n.style.display==='none')return false;
  if(n.getBoundingClientRect){r=n.getBoundingClientRect();if((r.right-r.left)<2||(r.bottom-r.top)<2)return false;}
  return true;
}


/* =========================================================================
 * ExOS Services Subsystem - browser Master Node / Session 0 SCM host
 * ========================================================================= */
var jplopsoft_SERVICE_CORE={
  lockName:'exos_service_core_lock',attempting:false,master:false,adminEligible:false,
  scmCtx:null,scmPid:0,releaseLock:null,lockPromise:null,bus:null,pending:{},seq:0,lastError:''
};
function jplopsoft_serviceCoreWatermark(active){
  var n=jplopsoft_el('jplopsoft_desktopWatermark');if(!n)return;
  if(active){n.textContent='EXOS DESKTOP ｜ SERVICE CORE ACTIVE';jplopsoft_wmClassAdd(n,'jplopsoft_service-core-active');n.title='此分頁正在背景執行 ExOS 系統服務，請勿關閉';}
  else{n.textContent='EXOS DESKTOP';jplopsoft_wmClassRemove(n,'jplopsoft_service-core-active');n.title='ExOS Desktop';}
}
function jplopsoft_serviceCoreEnsureBus(){
  if(jplopsoft_SERVICE_CORE.bus||typeof BroadcastChannel==='undefined')return jplopsoft_SERVICE_CORE.bus;
  try{
    var bus=new BroadcastChannel('exos_service_core_bus');jplopsoft_SERVICE_CORE.bus=bus;
    bus.onmessage=function(ev){var m=ev&&ev.data?ev.data:{};
      if(m.type==='command'&&jplopsoft_SERVICE_CORE.master){
        jplopsoft_serviceCoreCommandLocal(m.action,m.name).then(function(out){try{bus.postMessage({type:'result',id:m.id,ok:true,out:out});}catch(ignoreBusResult){}}).catch(function(e){try{bus.postMessage({type:'result',id:m.id,ok:false,error:String(e&&e.message?e.message:e)});}catch(ignoreBusError){}});
      }else if(m.type==='result'&&m.id&&jplopsoft_SERVICE_CORE.pending[m.id]){
        var p=jplopsoft_SERVICE_CORE.pending[m.id];delete jplopsoft_SERVICE_CORE.pending[m.id];window.clearTimeout(p.timer);if(m.ok)p.resolve(m.out);else p.reject(new Error(String(m.error||'Service command failed.')));
      }
    };
  }catch(e){jplopsoft_SERVICE_CORE.bus=null;}
  return jplopsoft_SERVICE_CORE.bus;
}
function jplopsoft_serviceCoreAuthorization(){
  return jplopsoft_xshApiPromise('services_auth','GET',null).then(function(out){jplopsoft_SERVICE_CORE.adminEligible=!!(out&&out.eligible);return out;},function(e){jplopsoft_SERVICE_CORE.adminEligible=false;throw e;});
}
async function jplopsoft_serviceCoreQuery(){
  var c=jplopsoft_SERVICE_CORE,held=false,pending=false;
  if(navigator.locks&&typeof navigator.locks.query==='function'){
    try{var q=await navigator.locks.query(),i;for(i=0;i<(q.held||[]).length;i++)if(q.held[i].name===c.lockName)held=true;for(i=0;i<(q.pending||[]).length;i++)if(q.pending[i].name===c.lockName)pending=true;}catch(ignoreLockQuery){}
  }
  return{ok:true,lockName:c.lockName,master:!!c.master,activeMaster:held,held:held,pending:pending,scmPid:Number(c.scmPid)||0,adminEligible:!!c.adminEligible,lastError:String(c.lastError||'')};
}
async function jplopsoft_serviceCoreCommandLocal(action,name){
  var c=jplopsoft_SERVICE_CORE;if(!c.master||!c.scmCtx||c.scmCtx.terminating)throw new Error('This tab is not the active service Master Node.');
  return jplopsoft_xshPostMessage(c.scmCtx,{message:'WM_EXOS_SERVICE_CONTROL',hwnd:0,wParam:0,lParam:{action:String(action||''),name:String(name||'')}});
}
async function jplopsoft_serviceCoreCommand(action,name){
  await jplopsoft_serviceCoreAuthorization();if(!jplopsoft_SERVICE_CORE.adminEligible)throw new Error('Administrator token is required to control services.');
  if(jplopsoft_SERVICE_CORE.master)return await jplopsoft_serviceCoreCommandLocal(action,name);
  var bus=jplopsoft_serviceCoreEnsureBus();if(!bus)throw new Error('Active Master Node is unavailable.');
  return await new Promise(function(resolve,reject){var id='svc'+(++jplopsoft_SERVICE_CORE.seq)+'_'+Date.now(),timer=window.setTimeout(function(){delete jplopsoft_SERVICE_CORE.pending[id];reject(new Error('Service Master Node did not respond.'));},5000);jplopsoft_SERVICE_CORE.pending[id]={resolve:resolve,reject:reject,timer:timer};bus.postMessage({type:'command',id:id,action:String(action||''),name:String(name||'')});});
}
function jplopsoft_serviceCoreStop(reason){
  var c=jplopsoft_SERVICE_CORE;c.attempting=false;c.adminEligible=false;
  if(c.scmCtx&&!c.scmCtx.terminating){try{jplopsoft_xshTerminate(c.scmCtx,0,String(reason||'ServiceCoreStop'),false);}catch(ignoreScmStop){}}
  c.scmCtx=null;c.scmPid=0;c.master=false;jplopsoft_serviceCoreWatermark(false);
  if(c.releaseLock){try{c.releaseLock();}catch(ignoreRelease){}c.releaseLock=null;}
  return true;
}
function jplopsoft_serviceCoreAfterLogon(){
  var c=jplopsoft_SERVICE_CORE;if(c.attempting||c.master||!state.samAuthenticated||!state.vaultKey)return false;
  c.attempting=true;c.lastError='';
  jplopsoft_serviceCoreAuthorization().then(function(auth){
    if(!auth||!auth.eligible){c.attempting=false;return;}
    jplopsoft_serviceCoreEnsureBus();
    if(!navigator.locks||typeof navigator.locks.request!=='function'){c.lastError='Web Locks API unavailable.';c.attempting=false;return;}
    c.lockPromise=navigator.locks.request(c.lockName,{mode:'exclusive',ifAvailable:true},async function(lock){
      if(!lock){c.attempting=false;c.master=false;jplopsoft_serviceCoreWatermark(false);return;}
      try{
        c.master=true;c.attempting=false;
        c.scmCtx=await jplopsoft_runBuiltinXsh('services',[],null,{integrity:'SYSTEM',protection:'TrustedSystemService',sessionId:0,username:'NT AUTHORITY\\SYSTEM',sid:'S-1-5-18',systemProcess:true,critical:false,imageName:'services.exe'});
        c.scmPid=c.scmCtx?Number(c.scmCtx.pid)||0:0;jplopsoft_serviceCoreWatermark(true);
        await new Promise(function(resolve){c.releaseLock=resolve;});
      }catch(e){c.lastError=String(e&&e.message?e.message:e);}finally{c.master=false;c.scmCtx=null;c.scmPid=0;c.releaseLock=null;c.attempting=false;jplopsoft_serviceCoreWatermark(false);}
    });
    if(c.lockPromise&&typeof c.lockPromise.catch==='function')c.lockPromise.catch(function(e){c.lastError=String(e&&e.message?e.message:e);c.attempting=false;c.master=false;jplopsoft_serviceCoreWatermark(false);});
  }).catch(function(e){c.lastError=String(e&&e.message?e.message:e);c.attempting=false;});
  return true;
}

/* SystemApp launch/routing is owned by shell32.dll. */

function jplopsoft_xshTerminateBuiltin(appId){
  var list=
        typeof jplopsoft_xshBuiltinContexts==='function'
          ?jplopsoft_xshBuiltinContexts(appId)
          :[],
      i,c;

  for(i=0;i<list.length;i++){
    c=list[i];

    if(c&&!c.terminating){
      jplopsoft_xshTerminate(
        c,
        0,
        'SystemAppRestart',
        false
      );
    }
  }
}

function jplopsoft_user32FindTaskbarWindow(appId){
  var a=String(appId||''),k,rec,best=null,bestZ=-2147483648,node,z;
  if(!a)return null;
  for(k in jplopsoft_USER32.windows){
    if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
    rec=jplopsoft_USER32.windows[k];
    if(!rec||rec.taskbar===false||String(rec.appId||'')!==a)continue;
    node=rec.overlay&&rec.backdropId?jplopsoft_el(rec.backdropId):jplopsoft_el(rec.windowId);
    z=node?parseInt(node.style.zIndex,10):0;
    if(isNaN(z))z=0;
    if(!best||z>=bestZ){best=rec;bestZ=z;}
  }
  return best;
}

function jplopsoft_user32ToggleTaskbarWindow(appId){
  var rec=jplopsoft_user32FindTaskbarWindow(appId),active;
  if(!rec)return false;
  active=String(jplopsoft_WM.active||'')===String(rec.appId||'');
  if(active&&jplopsoft_user32DisplayIsVisible(rec)){
    return jplopsoft_ShowWindow(rec.hwnd,jplopsoft_SW_MINIMIZE);
  }
  return jplopsoft_ShowWindow(rec.hwnd,jplopsoft_SW_RESTORE);
}

function jplopsoft_user32MinimizeTaskbarWindows(){
  var list=[],k,rec,i;
  for(k in jplopsoft_USER32.windows){
    if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
    rec=jplopsoft_USER32.windows[k];
    if(rec&&rec.taskbar!==false&&jplopsoft_user32DisplayIsVisible(rec))list.push(rec.hwnd);
  }
  for(i=0;i<list.length;i++)jplopsoft_ShowWindow(list[i],jplopsoft_SW_MINIMIZE);
  return list.length;
}

function jplopsoft_wmShowDesktop(){
  jplopsoft_xshMinimizeAllWindows();
  jplopsoft_user32MinimizeTaskbarWindows();
  jplopsoft_WM.active='desktop';
}

function jplopsoft_wmAfterUnlock(){
  jplopsoft_setBodyClassToken('jplopsoft_exfs-desktop-ready',true);
  jplopsoft_dwmNormalizeRootStacking();
  if(typeof jplopsoft_shell32ApplyDesktopPersonalization==='function')jplopsoft_shell32ApplyDesktopPersonalization();

  if(typeof jplopsoft_ntEnsureExplorerProcess==='function'){
    jplopsoft_ntEnsureExplorerProcess();
  }

  jplopsoft_WM.active='desktop';

  /* explorer.exe is the interactive Shell process. Explorer application HWNDs
   * are created only by shell32/SystemApps when the user opens a namespace. */
}


function jplopsoft_wmPrepareLock(){
  jplopsoft_xshTerminateAll('SessionLock');
  jplopsoft_setBodyClassToken('jplopsoft_exfs-desktop-ready',false);
}

/* =========================================================================
 * ExFS NT Kernel / Native Process Model
 *
 * This is the ExOS operating-system model exposed to XSH and system DLL APIs.  It mirrors
 * NT concepts (PID, process object, token, Native API, protected/critical
 * process checks) but it does NOT expose or control the browser host OS.
 * ========================================================================= */

var jplopsoft_STATUS_SUCCESS=0x00000000;
var jplopsoft_STATUS_ACCESS_DENIED=0xC0000022;
var jplopsoft_STATUS_INVALID_CID=0xC000000B;
var jplopsoft_STATUS_INVALID_HANDLE=0xC0000008;
var jplopsoft_STATUS_PROCESS_IS_TERMINATING=0xC000010A;
var jplopsoft_STATUS_QUOTA_EXCEEDED=0xC0000044;
var jplopsoft_STATUS_CANCELLED=0xC0000120;
var jplopsoft_STATUS_TIMEOUT=0x00000102;
var jplopsoft_STATUS_PARTIAL_COPY=0x8000000D;
var jplopsoft_STATUS_INVALID_ADDRESS=0xC0000141;

var jplopsoft_PROCESS_TERMINATE=0x0001;
var jplopsoft_PROCESS_VM_OPERATION=0x0008;
var jplopsoft_PROCESS_VM_READ=0x0010;
var jplopsoft_PROCESS_VM_WRITE=0x0020;
var jplopsoft_PROCESS_SET_INFORMATION=0x0200;
var jplopsoft_PROCESS_QUERY_INFORMATION=0x0400;
var jplopsoft_PROCESS_QUERY_LIMITED_INFORMATION=0x1000;

var jplopsoft_NT_KERNEL={
  bootTime:(new Date()).getTime(),
  nextPid:2000,
  nextHandle:0x400,
  processByKey:{},
  processByPid:{},
  processHandles:{},
  nextObjectHandle:0x10000,
  nextObjectId:1,
  nextMappingId:1,
  nextAsyncIrp:1,
  objectHandles:{},
  namedObjects:{},
  sectionViews:{},
  generation:1
};

function jplopsoft_ntCloneEnvironment(src){
  var out={},k;
  if(!src||typeof src!=='object')return out;
  for(k in src)if(src.hasOwnProperty(k))out[String(k)]=String(src[k]);
  return out;
}

function jplopsoft_ntInitialUserEnvironment(){
  var source=state.cmdEnv,
      out=jplopsoft_ntCloneEnvironment(source||{});

  if(typeof out.USERNAME==='undefined')out.USERNAME=String(state.samUsername||'administrator');
  if(typeof out.USERPROFILE==='undefined')out.USERPROFILE='C:\\Users\\'+String(state.samUsername||'administrator');
  if(typeof out.HOMEDRIVE==='undefined')out.HOMEDRIVE='C:';
  if(typeof out.HOMEPATH==='undefined')out.HOMEPATH='\\Users\\'+String(state.samUsername||'administrator');
  if(typeof out.PUBLIC==='undefined')out.PUBLIC='C:\\Users\\Public';
  if(typeof out.SystemDrive==='undefined')out.SystemDrive='C:';
  if(typeof out.SystemRoot==='undefined')out.SystemRoot='C:\\Windows';
  if(typeof out.windir==='undefined')out.windir='C:\\Windows';
  if(typeof out.ProgramFiles==='undefined')out.ProgramFiles='C:\\Program Files';
  if(typeof out['ProgramFiles(x86)']==='undefined')out['ProgramFiles(x86)']='C:\\Program Files (x86)';
  if(typeof out.COMSPEC==='undefined')out.COMSPEC='C:\\ExOS\\SystemApps\\cmd.xsh';
  if(typeof out.PATH==='undefined')out.PATH='C:\\ExOS\\SystemApps;C:\\';
  if(typeof out.PATHEXT==='undefined')out.PATHEXT='.XBA;.XSH';

  return out;
}

function jplopsoft_ntEnvironmentCount(env){
  var k,n=0;
  if(!env||typeof env!=='object')return 0;
  for(k in env)if(env.hasOwnProperty(k))n++;
  return n;
}

function jplopsoft_ntCreatePeb(pid,spec,parent){
  var p=spec||{},env,currentNode=parseInt(p.currentDirectoryNodeId,10)||0,
      currentDir=String(p.currentDirectory||''),parentEnv=null;

  if(p.environment&&typeof p.environment==='object'){
    env=jplopsoft_ntCloneEnvironment(p.environment);
  }else if(parent&&parent.peb&&parent.peb.processParameters){
    parentEnv=parent.peb.processParameters.environment;
    env=jplopsoft_ntCloneEnvironment(parentEnv);
  }else{
    env=jplopsoft_ntInitialUserEnvironment();
  }

  if(!currentDir){
    try{currentDir=jplopsoft_exfsFolderPath(currentNode);}catch(ignoreCwd){currentDir='C:\\';}
  }

  return{
    id:'PEB-'+String(pid)+'-'+String(jplopsoft_NT_KERNEL.generation),
    processId:pid,
    inheritedFromPid:parent?parent.pid:0,
    processParameters:{
      imagePathName:String(p.imagePathName||p.imageName||''),
      commandLine:String(p.commandLine||p.imageName||''),
      currentDirectoryNodeId:currentNode,
      currentDirectory:currentDir,
      environment:env,
      environmentCount:jplopsoft_ntEnvironmentCount(env),
      imageFormat:String(p.imageFormat||''),
      imageMachine:String(p.imageMachine||''),
      imageSubsystem:parseInt(p.imageSubsystem,10)||0,
      imageSubsystemName:String(p.imageSubsystemName||''),
      consoleHandle:0,
      standardInputHandle:0,
      standardOutputHandle:0,
      standardErrorHandle:0
    }
  };
}

function jplopsoft_NtCreateUserProcess(spec){
  var p=spec||{},parent=p.parentProcess||null;

  if(!parent&&parseInt(p.ppid,10)>0){
    parent=jplopsoft_ntKernelProcessByPid(parseInt(p.ppid,10));
  }

  if(!p.key){
    p.key='proc:'+String(p.imageName||'process')+':'+String(jplopsoft_NT_KERNEL.generation);
  }

  if(!p.ppid&&parent)p.ppid=parent.pid;
  return jplopsoft_ntKernelRegisterProcess(p);
}

function jplopsoft_CreateProcess(imageName,commandLine,parentPid,options){
  var o=options||{};
  o.imageName=String(imageName||o.imageName||'unknown.exe');
  o.commandLine=String(commandLine||o.commandLine||o.imageName);
  o.ppid=parseInt(parentPid,10)||parseInt(o.ppid,10)||0;
  return jplopsoft_NtCreateUserProcess(o);
}

function jplopsoft_SetEnvironmentVariable(process,name,value){
  var env,pp;
  if(!process||!process.peb||!process.peb.processParameters)return false;
  name=String(name||'').toUpperCase();
  if(!/^[A-Z_][A-Z0-9_]{0,63}$/.test(name))return false;

  pp=process.peb.processParameters;
  env=pp.environment||{};
  if(value===null||typeof value==='undefined'||String(value)==='')delete env[name];
  else env[name]=String(value);
  pp.environment=env;
  pp.environmentCount=jplopsoft_ntEnvironmentCount(env);
  return true;
}

function jplopsoft_ntEnsureExplorerProcess(){
  var p=jplopsoft_ntKernelAliveByKey('proc:explorer'),
      winlogon;

  if(p)return p;

  jplopsoft_ntKernelEnsureCore();
  winlogon=jplopsoft_ntKernelAliveByKey('core:winlogon');

  p=jplopsoft_NtCreateUserProcess({
    key:'proc:explorer',
    imageName:'explorer.exe',
    description:'ExOS Explorer / ExFS Shell',
    ppid:winlogon?winlogon.pid:220,
    parentProcess:winlogon||null,
    sessionId:1,
    username:String(state.samUsername||'administrator'),
    sid:String(state.samSid||''),
    integrity:'MEDIUM',
    commandLine:'explorer.exe',
    currentDirectoryNodeId:parseInt(state.currentFolder,10)||0,
    environment:jplopsoft_ntInitialUserEnvironment(),
    logicalThreads:3
  });

  return p;
}


function jplopsoft_ntKernelNow(){
  return (new Date()).getTime();
}


function jplopsoft_ntNormalizeBaseNamedObject(name){
  var s=String(name||'').replace(/\//g,'\\');

  while(s.indexOf('\\\\')>=0)s=s.replace(/\\\\/g,'\\');

  if(!s)return'';
  if(s.charAt(0)!=='\\')s='\\BaseNamedObjects\\'+s;
  if(s.toLowerCase().indexOf('\\basenamedobjects\\')!==0)return'';
  if(s.length>256||/[\x00-\x1F]/.test(s))return'';

  return s;
}

function jplopsoft_ntNamedObjectKey(type,name){
  return String(type||'').toUpperCase()+'|'+String(name||'').toLowerCase();
}

function jplopsoft_ntNamedObjectFind(type,name){
  var n=jplopsoft_ntNormalizeBaseNamedObject(name);

  if(!n)return null;

  return jplopsoft_NT_KERNEL.namedObjects[
    jplopsoft_ntNamedObjectKey(type,n)
  ]||null;
}

function jplopsoft_ntObjectHandleCount(objectId){
  var k,h,n=0;

  for(k in jplopsoft_NT_KERNEL.objectHandles){
    if(!jplopsoft_NT_KERNEL.objectHandles.hasOwnProperty(k))continue;
    h=jplopsoft_NT_KERNEL.objectHandles[k];

    if(h&&parseInt(h.objectId,10)===parseInt(objectId,10))n++;
  }

  return n;
}

function jplopsoft_ntObjectHandleCountForPid(pid){
  var k,h,n=0;

  pid=parseInt(pid,10)||0;

  for(k in jplopsoft_NT_KERNEL.objectHandles){
    if(!jplopsoft_NT_KERNEL.objectHandles.hasOwnProperty(k))continue;
    h=jplopsoft_NT_KERNEL.objectHandles[k];

    if(h&&parseInt(h.pid,10)===pid)n++;
  }

  return n;
}

function jplopsoft_ntObjectAllocateHandle(pid,obj,access){
  var h=jplopsoft_NT_KERNEL.nextObjectHandle++;

  if(jplopsoft_NT_KERNEL.nextObjectHandle>0x7FFFFFF0){
    jplopsoft_NT_KERNEL.nextObjectHandle=0x10000;
  }

  jplopsoft_NT_KERNEL.objectHandles[String(h)]={
    handle:h,
    pid:parseInt(pid,10)||0,
    objectId:obj.objectId,
    objectType:String(obj.type||''),
    access:String(access||'ALL'),
    openedAt:jplopsoft_ntKernelNow()
  };

  return h;
}

function jplopsoft_ntObjectFromHandle(pid,handle,type){
  var h=jplopsoft_NT_KERNEL.objectHandles[
        String(parseInt(handle,10)||0)
      ],
      key,obj;

  if(
    !h||
    parseInt(h.pid,10)!==(parseInt(pid,10)||0)||
    (type&&String(h.objectType)!==String(type))
  ){
    return null;
  }

  for(key in jplopsoft_NT_KERNEL.namedObjects){
    if(!jplopsoft_NT_KERNEL.namedObjects.hasOwnProperty(key))continue;
    obj=jplopsoft_NT_KERNEL.namedObjects[key];

    if(obj&&parseInt(obj.objectId,10)===parseInt(h.objectId,10)){
      return obj;
    }
  }

  return null;
}

function jplopsoft_ntObjectMaybeDelete(obj){
  var key,members=0,views=0;

  if(!obj)return;

  if(jplopsoft_ntObjectHandleCount(obj.objectId)>0)return;

  if(obj.type==='SECTION'){
    views=obj.views?Object.keys(obj.views).length:0;
    if(views>0)return;
    if(typeof jplopsoft_ntSectionDestroyBacking==='function'){
      jplopsoft_ntSectionDestroyBacking(obj);
    }
  }

  if(obj.type==='JOB'){
    members=obj.members?Object.keys(obj.members).length:0;
    if(members>0)return;
  }

  key=jplopsoft_ntNamedObjectKey(obj.type,obj.name);

  if(
    jplopsoft_NT_KERNEL.namedObjects[key]===obj
  ){
    delete jplopsoft_NT_KERNEL.namedObjects[key];
  }
}

function jplopsoft_ntProcessIsDescendantOf(process,ancestorPid){
  var p=process,guard=0;

  ancestorPid=parseInt(ancestorPid,10)||0;

  while(p&&guard++<64){
    if(parseInt(p.pid,10)===ancestorPid)return true;
    if((parseInt(p.ppid,10)||0)<=0)break;
    p=jplopsoft_ntKernelProcessByPid(p.ppid);
  }

  return false;
}

function jplopsoft_ntJobByObjectId(objectId){
  var key,obj;

  for(key in jplopsoft_NT_KERNEL.namedObjects){
    if(!jplopsoft_NT_KERNEL.namedObjects.hasOwnProperty(key))continue;
    obj=jplopsoft_NT_KERNEL.namedObjects[key];

    if(
      obj&&
      obj.type==='JOB'&&
      parseInt(obj.objectId,10)===parseInt(objectId,10)
    ){
      return obj;
    }
  }

  return null;
}

function jplopsoft_ntJobMemoryUsage(job){
  var total=0,k,p;

  if(!job||!job.members)return 0;

  for(k in job.members){
    if(!job.members.hasOwnProperty(k))continue;
    p=jplopsoft_ntKernelProcessByPid(parseInt(k,10)||0);

    if(p&&p.alive){
      total+=Math.max(0,parseInt(p.accountedMemoryBytes,10)||0);
      total+=Math.max(0,parseInt(p.sectionViewBytes,10)||0);
    }
  }

  return total;
}

function jplopsoft_ntJobAliveCount(job){
  var n=0,k,p;

  if(!job||!job.members)return 0;

  for(k in job.members){
    if(!job.members.hasOwnProperty(k))continue;
    p=jplopsoft_ntKernelProcessByPid(parseInt(k,10)||0);
    if(p&&p.alive)n++;
  }

  return n;
}

function jplopsoft_ntJobCanAccept(job,process,extraMemory){
  var activeLimit,memoryLimit,current;

  if(!job||!process)return{
    ok:false,
    status:jplopsoft_STATUS_INVALID_HANDLE,
    reason:'Invalid Job or process.'
  };

  activeLimit=parseInt(job.limits.activeProcessLimit,10)||0;

  if(
    activeLimit>0&&
    !job.members[String(process.pid)]&&
    jplopsoft_ntJobAliveCount(job)>=activeLimit
  ){
    return{
      ok:false,
      status:jplopsoft_STATUS_QUOTA_EXCEEDED,
      reason:'JOB_OBJECT_LIMIT_ACTIVE_PROCESS exceeded.'
    };
  }

  memoryLimit=parseInt(job.limits.jobMemoryLimitBytes,10)||0;

  if(memoryLimit>0){
    current=jplopsoft_ntJobMemoryUsage(job);

    if(!job.members[String(process.pid)]){
      current+=
        Math.max(0,parseInt(process.accountedMemoryBytes,10)||0)+
        Math.max(0,parseInt(process.sectionViewBytes,10)||0);
    }

    current+=Math.max(0,parseInt(extraMemory,10)||0);

    if(current>memoryLimit){
      return{
        ok:false,
        status:jplopsoft_STATUS_QUOTA_EXCEEDED,
        reason:'JOB_OBJECT_LIMIT_JOB_MEMORY exceeded.'
      };
    }
  }

  return{
    ok:true,
    status:jplopsoft_STATUS_SUCCESS,
    reason:''
  };
}

function jplopsoft_ntJobAssign(job,process){
  var chk;

  if(!job||!process||!process.alive)return{
    ok:false,
    status:jplopsoft_STATUS_INVALID_CID
  };

  if(
    process.jobObjectId&&
    parseInt(process.jobObjectId,10)!==parseInt(job.objectId,10)
  ){
    return{
      ok:false,
      status:jplopsoft_STATUS_ACCESS_DENIED,
      reason:'Process is already assigned to another Job.'
    };
  }

  chk=jplopsoft_ntJobCanAccept(job,process,0);

  if(!chk.ok)return chk;

  job.members[String(process.pid)]=1;
  process.jobObjectId=job.objectId;
  process.jobObjectName=job.name;

  return{
    ok:true,
    status:jplopsoft_STATUS_SUCCESS
  };
}

function jplopsoft_ntJobInherit(parent,child){
  var job,chk;

  if(!parent||!child||!parent.jobObjectId)return{
    ok:true,
    status:jplopsoft_STATUS_SUCCESS
  };

  job=jplopsoft_ntJobByObjectId(parent.jobObjectId);

  if(!job)return{
    ok:true,
    status:jplopsoft_STATUS_SUCCESS
  };

  if(job.limits.breakawayOk)return{
    ok:true,
    status:jplopsoft_STATUS_SUCCESS
  };

  chk=jplopsoft_ntJobAssign(job,child);
  return chk;
}

function jplopsoft_ntJobOnProcessExit(process){
  var job;

  if(!process||!process.jobObjectId)return;

  job=jplopsoft_ntJobByObjectId(process.jobObjectId);

  if(job&&job.members){
    delete job.members[String(process.pid)];
    jplopsoft_ntObjectMaybeDelete(job);
  }

  process.jobObjectId=0;
  process.jobObjectName='';
}

function jplopsoft_ntProcessChargeMemory(process,bytes,sectionBytes){
  var delta=Math.max(0,parseInt(bytes,10)||0),
      sectionDelta=Math.max(0,parseInt(sectionBytes,10)||0),
      job,chk;

  if(!process)return{
    ok:false,
    status:jplopsoft_STATUS_INVALID_CID
  };

  if(process.jobObjectId){
    job=jplopsoft_ntJobByObjectId(process.jobObjectId);

    if(job){
      chk=jplopsoft_ntJobCanAccept(
        job,
        process,
        delta+sectionDelta
      );

      if(!chk.ok)return chk;
    }
  }

  process.accountedMemoryBytes=
    Math.max(0,parseInt(process.accountedMemoryBytes,10)||0)+delta;
  process.sectionViewBytes=
    Math.max(0,parseInt(process.sectionViewBytes,10)||0)+sectionDelta;

  return{
    ok:true,
    status:jplopsoft_STATUS_SUCCESS
  };
}

function jplopsoft_ntProcessReleaseMemory(process,bytes,sectionBytes){
  if(!process)return;

  process.accountedMemoryBytes=Math.max(
    0,
    (parseInt(process.accountedMemoryBytes,10)||0)-
      Math.max(0,parseInt(bytes,10)||0)
  );

  process.sectionViewBytes=Math.max(
    0,
    (parseInt(process.sectionViewBytes,10)||0)-
      Math.max(0,parseInt(sectionBytes,10)||0)
  );
}


/* ------------------------------ SECTION --------------------------------
 * EXOS_VMM_V1 SECTION objects are page-backed kernel objects.  Each process
 * maps a SECTION into a private 47-bit VAS at its own base address.  The VAD
 * is process-private, while the 4 KiB page objects are shared by every view.
 * ----------------------------------------------------------------------- */

function jplopsoft_ntSectionDestroyBacking(obj){
  var v,k,page,bytes;
  if(!obj||obj.type!=='SECTION'||obj.backingReleased)return;
  obj.backingReleased=true;
  v=jplopsoft_vmmKernel();
  if(obj.pages){
    for(k in obj.pages){
      if(!obj.pages.hasOwnProperty(k))continue;
      page=obj.pages[k];
      if(page)jplopsoft_vmmPageRelease(page);
    }
  }
  obj.pages={};
  bytes=Math.max(0,Number(obj.commitChargeBytes)||0);
  if(bytes){
    v.committedBytes=Math.max(0,v.committedBytes-bytes);
    obj.commitChargeBytes=0;
  }
}

function jplopsoft_ntSectionCreate(pid,name,size,options){
  var n=jplopsoft_ntNormalizeBaseNamedObject(name),
      key,obj,h,bytes,opt=options||{},v,initial,fileNodeId;

  bytes=jplopsoft_vmmAlignUp(Math.max(1,Number(size)||0),jplopsoft_VMM_PAGE_SIZE);
  v=jplopsoft_vmmKernel();

  if(bytes>v.commitLimitBytes){
    return{
      status:jplopsoft_STATUS_QUOTA_EXCEEDED,
      handle:0,
      reason:'SECTION size exceeds the ExOS VMM commit limit.'
    };
  }

  if(n){
    key=jplopsoft_ntNamedObjectKey('SECTION',n);
    obj=jplopsoft_NT_KERNEL.namedObjects[key];

    if(obj){
      h=jplopsoft_ntObjectAllocateHandle(pid,obj,'SECTION_ALL_ACCESS');
      return{
        status:jplopsoft_STATUS_SUCCESS,
        handle:h,
        alreadyExists:true,
        section:jplopsoft_ntSectionQuery(obj)
      };
    }
  }else{
    n='\\BaseNamedObjects\\Section-'+
      String(pid)+'-'+String(jplopsoft_NT_KERNEL.nextObjectId);
    key=jplopsoft_ntNamedObjectKey('SECTION',n);
  }

  if(v.committedBytes+bytes>v.commitLimitBytes){
    return{
      status:jplopsoft_STATUS_QUOTA_EXCEEDED,
      handle:0,
      reason:'Insufficient ExOS VMM commit charge for SECTION.'
    };
  }

  initial=opt.initialBytes instanceof Uint8Array
    ?opt.initialBytes
    :(opt.initialBytes instanceof ArrayBuffer
      ?new Uint8Array(opt.initialBytes)
      :(Array.isArray(opt.initialBytes)?new Uint8Array(opt.initialBytes):null));

  fileNodeId=parseInt(opt.fileNodeId,10)||0;

  obj={
    objectId:jplopsoft_NT_KERNEL.nextObjectId++,
    type:'SECTION',
    name:n,
    ownerPid:parseInt(pid,10)||0,
    size:bytes,
    createdAt:jplopsoft_ntKernelNow(),
    zeroCopy:true,
    transport:'EXOS_VMM_SHARED_PAGES',
    pages:{},
    views:{},
    backingBytes:initial,
    fileBacked:!!fileNodeId,
    fileNodeId:fileNodeId,
    filePath:String(opt.filePath||''),
    dirty:false,
    protect:jplopsoft_vmmProtectValue(opt.protect||jplopsoft_PAGE_READWRITE),
    commitChargeBytes:bytes,
    backingReleased:false
  };

  v.committedBytes+=bytes;
  jplopsoft_NT_KERNEL.namedObjects[key]=obj;
  h=jplopsoft_ntObjectAllocateHandle(pid,obj,'SECTION_ALL_ACCESS');

  return{
    status:jplopsoft_STATUS_SUCCESS,
    handle:h,
    alreadyExists:false,
    section:jplopsoft_ntSectionQuery(obj)
  };
}

function jplopsoft_ntSectionOpen(pid,name){
  var obj=jplopsoft_ntNamedObjectFind('SECTION',name),h;

  if(!obj)return{
    status:jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
    handle:0
  };

  h=jplopsoft_ntObjectAllocateHandle(pid,obj,'SECTION_ALL_ACCESS');

  return{
    status:jplopsoft_STATUS_SUCCESS,
    handle:h,
    section:jplopsoft_ntSectionQuery(obj)
  };
}

function jplopsoft_ntSectionQuery(obj){
  return{
    objectType:'SECTION',
    objectId:obj.objectId,
    name:obj.name,
    size:obj.size,
    transport:obj.transport,
    zeroCopy:true,
    vmmModel:'EXOS_VMM_V1',
    pageSize:jplopsoft_VMM_PAGE_SIZE,
    fileBacked:!!obj.fileBacked,
    filePath:String(obj.filePath||''),
    dirty:!!obj.dirty,
    viewCount:obj.views?Object.keys(obj.views).length:0,
    handleCount:jplopsoft_ntObjectHandleCount(obj.objectId)
  };
}

function jplopsoft_ntSectionMap(pid,handle,offset,length,options){
  var obj=jplopsoft_ntObjectFromHandle(pid,handle,'SECTION'),
      process=jplopsoft_ntKernelProcessByPid(pid),
      opt=options||{},
      off=Math.max(0,Math.floor(Number(offset)||0)),
      len=Math.floor(Number(length)||0),
      preferred=jplopsoft_vmmSafeAddress(opt.baseAddress||0),
      base,charge,id,view,region,pageCount;

  if(!obj)return{status:jplopsoft_STATUS_INVALID_HANDLE};

  if(!process||!process.alive||!process.vm){
    return{status:jplopsoft_STATUS_INVALID_CID};
  }

  if((off%jplopsoft_VMM_ALLOCATION_GRANULARITY)!==0){
    return{
      status:jplopsoft_STATUS_INVALID_PARAMETER,
      reason:'MapViewOfFile offset must be aligned to the 64 KiB allocation granularity.'
    };
  }

  if(off>=obj.size)return{status:jplopsoft_STATUS_INVALID_PARAMETER};

  if(len<=0)len=obj.size-off;
  len=Math.min(len,obj.size-off);
  len=jplopsoft_vmmAlignUp(len,jplopsoft_VMM_PAGE_SIZE);

  base=jplopsoft_vmmFindFreeBase(
    process.vm,
    len,
    preferred>0?preferred:0,
    !!opt.topDown
  );

  if(!base){
    return{
      status:jplopsoft_STATUS_QUOTA_EXCEEDED,
      reason:'No contiguous virtual address range is available for this SECTION view.'
    };
  }

  charge=jplopsoft_ntProcessChargeMemory(process,0,len);
  if(!charge.ok)return{status:charge.status,reason:charge.reason};

  id=jplopsoft_NT_KERNEL.nextMappingId++;

  region=jplopsoft_vmmNewRegion(
    process,
    base,
    len,
    jplopsoft_vmmProtectValue(opt.protect||obj.protect||jplopsoft_PAGE_READWRITE),
    jplopsoft_MEM_MAPPED,
    obj.name,
    {
      mapped:true,
      mappingId:id,
      sectionObject:obj,
      sectionOffset:off,
      ownsCommit:false
    }
  );

  pageCount=Math.ceil(len/jplopsoft_VMM_PAGE_SIZE);
  jplopsoft_vmmRangeAdd(region,0,pageCount);

  view={
    mappingId:id,
    pid:parseInt(pid,10)||0,
    sectionId:obj.objectId,
    offset:off,
    length:len,
    baseAddress:base,
    regionId:region.id,
    createdAt:jplopsoft_ntKernelNow()
  };

  obj.views[String(id)]=view;
  jplopsoft_NT_KERNEL.sectionViews[String(id)]=view;

  return{
    status:jplopsoft_STATUS_SUCCESS,
    mappingId:id,
    baseAddress:base,
    sectionName:obj.name,
    offset:off,
    length:len,
    transport:obj.transport,
    zeroCopy:true,
    vmmModel:'EXOS_VMM_V1'
  };
}

function jplopsoft_ntSectionView(pid,mappingOrAddress){
  var raw=Number(mappingOrAddress),view=null,obj,key,k;

  if(isFinite(raw)){
    view=jplopsoft_NT_KERNEL.sectionViews[String(Math.floor(raw))]||null;
  }

  if(!view&&isFinite(raw)){
    for(k in jplopsoft_NT_KERNEL.sectionViews){
      if(!jplopsoft_NT_KERNEL.sectionViews.hasOwnProperty(k))continue;
      var candidate=jplopsoft_NT_KERNEL.sectionViews[k];
      if(
        candidate&&
        parseInt(candidate.pid,10)===(parseInt(pid,10)||0)&&
        raw>=Number(candidate.baseAddress)&&
        raw<Number(candidate.baseAddress)+Number(candidate.length)
      ){
        view=candidate;
        break;
      }
    }
  }

  if(!view||parseInt(view.pid,10)!==(parseInt(pid,10)||0))return null;

  for(key in jplopsoft_NT_KERNEL.namedObjects){
    if(!jplopsoft_NT_KERNEL.namedObjects.hasOwnProperty(key))continue;
    obj=jplopsoft_NT_KERNEL.namedObjects[key];

    if(
      obj&&
      obj.type==='SECTION'&&
      parseInt(obj.objectId,10)===parseInt(view.sectionId,10)
    ){
      return{view:view,section:obj};
    }
  }

  return null;
}

function jplopsoft_ntSectionUnmap(pid,mappingOrAddress){
  var pair=jplopsoft_ntSectionView(pid,mappingOrAddress),
      process,region;

  if(!pair)return jplopsoft_STATUS_INVALID_HANDLE;

  process=jplopsoft_ntKernelProcessByPid(pid);
  if(process&&process.vm){
    region=jplopsoft_vmmFindRegion(process,pair.view.baseAddress);
    if(region&&parseInt(region.mappingId,10)===parseInt(pair.view.mappingId,10)){
      jplopsoft_vmmReleaseRegion(process,region,false);
    }
  }

  jplopsoft_ntProcessReleaseMemory(process,0,pair.view.length);

  delete pair.section.views[String(pair.view.mappingId)];
  delete jplopsoft_NT_KERNEL.sectionViews[String(pair.view.mappingId)];

  jplopsoft_ntObjectMaybeDelete(pair.section);
  return jplopsoft_STATUS_SUCCESS;
}

function jplopsoft_ntSectionRead(pid,mappingOrAddress,offset,length){
  var pair=jplopsoft_ntSectionView(pid,mappingOrAddress),
      process=jplopsoft_ntKernelProcessByPid(pid),
      off=Math.max(0,Math.floor(Number(offset)||0)),
      len=Math.floor(Number(length)||0),
      data;

  if(!pair||!process)return{
    status:jplopsoft_STATUS_INVALID_HANDLE,
    data:[]
  };

  if(off>=pair.view.length)return{
    status:jplopsoft_STATUS_INVALID_PARAMETER,
    data:[]
  };

  if(len<=0)len=pair.view.length-off;
  len=Math.min(len,pair.view.length-off,64*1024*1024);

  try{
    data=jplopsoft_vmmRead(
      process,
      Number(pair.view.baseAddress)+off,
      len,
      true
    );
  }catch(e){
    return{
      status:e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_PARTIAL_COPY,
      reason:String(e&&e.message||e),
      data:[]
    };
  }

  return{
    status:jplopsoft_STATUS_SUCCESS,
    address:Number(pair.view.baseAddress)+off,
    bytesRead:data.length,
    data:jplopsoft_xshBytesToArray(data)
  };
}

function jplopsoft_ntSectionWrite(pid,mappingOrAddress,offset,data){
  var pair=jplopsoft_ntSectionView(pid,mappingOrAddress),
      process=jplopsoft_ntKernelProcessByPid(pid),
      off=Math.max(0,Math.floor(Number(offset)||0)),
      bytes=data instanceof Uint8Array
        ?data
        :(data instanceof ArrayBuffer
          ?new Uint8Array(data)
          :new Uint8Array(data||[])),
      len,written;

  if(!pair||!process)return{
    status:jplopsoft_STATUS_INVALID_HANDLE,
    bytesWritten:0
  };

  if(off>=pair.view.length)return{
    status:jplopsoft_STATUS_INVALID_PARAMETER,
    bytesWritten:0
  };

  len=Math.min(bytes.length,pair.view.length-off,64*1024*1024);

  try{
    written=jplopsoft_vmmWrite(
      process,
      Number(pair.view.baseAddress)+off,
      bytes.subarray(0,len),
      true
    );
  }catch(e){
    return{
      status:e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_PARTIAL_COPY,
      reason:String(e&&e.message||e),
      bytesWritten:0
    };
  }

  return{
    status:jplopsoft_STATUS_SUCCESS,
    address:Number(pair.view.baseAddress)+off,
    bytesWritten:written
  };
}

function jplopsoft_ntReleaseProcessSections(pid){
  var ids=[],k,v,i;

  pid=parseInt(pid,10)||0;

  for(k in jplopsoft_NT_KERNEL.sectionViews){
    if(!jplopsoft_NT_KERNEL.sectionViews.hasOwnProperty(k))continue;
    v=jplopsoft_NT_KERNEL.sectionViews[k];
    if(v&&parseInt(v.pid,10)===pid)ids.push(parseInt(k,10)||0);
  }

  for(i=0;i<ids.length;i++){
    jplopsoft_ntSectionUnmap(pid,ids[i]);
  }
}

/* -------------------------------- JOB ---------------------------------- */

function jplopsoft_ntJobCreate(pid,name,limits){
  var n=jplopsoft_ntNormalizeBaseNamedObject(name),
      key,obj,h;

  if(!n){
    n='\\BaseNamedObjects\\Job-'+String(pid)+'-'+
      String(jplopsoft_NT_KERNEL.nextObjectId);
  }

  key=jplopsoft_ntNamedObjectKey('JOB',n);
  obj=jplopsoft_NT_KERNEL.namedObjects[key];

  if(obj){
    h=jplopsoft_ntObjectAllocateHandle(pid,obj,'JOB_OBJECT_ALL_ACCESS');
    return{
      status:jplopsoft_STATUS_SUCCESS,
      handle:h,
      alreadyExists:true,
      job:jplopsoft_ntJobQuery(obj)
    };
  }

  obj={
    objectId:jplopsoft_NT_KERNEL.nextObjectId++,
    type:'JOB',
    name:n,
    ownerPid:parseInt(pid,10)||0,
    createdAt:jplopsoft_ntKernelNow(),
    members:{},
    limits:{
      killOnJobClose:false,
      breakawayOk:false,
      activeProcessLimit:0,
      jobMemoryLimitBytes:0
    }
  };

  jplopsoft_NT_KERNEL.namedObjects[key]=obj;
  jplopsoft_ntJobSetInformationObject(obj,limits||{});
  h=jplopsoft_ntObjectAllocateHandle(pid,obj,'JOB_OBJECT_ALL_ACCESS');

  return{
    status:jplopsoft_STATUS_SUCCESS,
    handle:h,
    alreadyExists:false,
    job:jplopsoft_ntJobQuery(obj)
  };
}

function jplopsoft_ntJobOpen(pid,name){
  var obj=jplopsoft_ntNamedObjectFind('JOB',name),h;

  if(!obj)return{
    status:jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
    handle:0
  };

  h=jplopsoft_ntObjectAllocateHandle(pid,obj,'JOB_OBJECT_ALL_ACCESS');

  return{
    status:jplopsoft_STATUS_SUCCESS,
    handle:h,
    job:jplopsoft_ntJobQuery(obj)
  };
}

function jplopsoft_ntJobSetInformationObject(job,limits){
  var l=limits||{},n;

  if(typeof l.killOnJobClose!=='undefined'){
    job.limits.killOnJobClose=!!l.killOnJobClose;
  }

  if(typeof l.breakawayOk!=='undefined'){
    job.limits.breakawayOk=!!l.breakawayOk;
  }

  if(typeof l.activeProcessLimit!=='undefined'){
    n=Math.max(0,Math.min(1024,parseInt(l.activeProcessLimit,10)||0));
    job.limits.activeProcessLimit=n;
  }

  if(typeof l.jobMemoryLimitBytes!=='undefined'){
    n=Math.max(
      0,
      Math.min(
        2147483647,
        parseInt(l.jobMemoryLimitBytes,10)||0
      )
    );
    job.limits.jobMemoryLimitBytes=n;
  }

  return true;
}

function jplopsoft_ntJobQuery(job){
  var members=[],k,p;

  for(k in job.members){
    if(!job.members.hasOwnProperty(k))continue;
    p=jplopsoft_ntKernelProcessByPid(parseInt(k,10)||0);

    members.push({
      pid:parseInt(k,10)||0,
      alive:!!(p&&p.alive),
      imageName:p?String(p.imageName||''):'',
      accountedMemoryBytes:p
        ?(
          (parseInt(p.accountedMemoryBytes,10)||0)+
          (parseInt(p.sectionViewBytes,10)||0)
        )
        :0
    });
  }

  return{
    objectType:'JOB',
    objectId:job.objectId,
    name:job.name,
    ownerPid:job.ownerPid,
    limits:{
      killOnJobClose:!!job.limits.killOnJobClose,
      breakawayOk:!!job.limits.breakawayOk,
      activeProcessLimit:parseInt(job.limits.activeProcessLimit,10)||0,
      jobMemoryLimitBytes:parseInt(job.limits.jobMemoryLimitBytes,10)||0
    },
    activeProcesses:jplopsoft_ntJobAliveCount(job),
    accountedMemoryBytes:jplopsoft_ntJobMemoryUsage(job),
    members:members,
    handleCount:jplopsoft_ntObjectHandleCount(job.objectId)
  };
}

function jplopsoft_ntJobSetInformation(pid,handle,limits){
  var job=jplopsoft_ntObjectFromHandle(pid,handle,'JOB');

  if(!job)return{
    status:jplopsoft_STATUS_INVALID_HANDLE
  };

  jplopsoft_ntJobSetInformationObject(job,limits||{});

  return{
    status:jplopsoft_STATUS_SUCCESS,
    job:jplopsoft_ntJobQuery(job)
  };
}

function jplopsoft_ntJobAssignByHandle(callerPid,handle,targetPid){
  var job=jplopsoft_ntObjectFromHandle(callerPid,handle,'JOB'),
      target=jplopsoft_ntKernelProcessByPid(targetPid);

  if(!job)return{
    status:jplopsoft_STATUS_INVALID_HANDLE
  };

  if(!target||!target.alive)return{
    status:jplopsoft_STATUS_INVALID_CID
  };

  if(
    parseInt(target.pid,10)!==(parseInt(callerPid,10)||0)&&
    !jplopsoft_ntProcessIsDescendantOf(target,callerPid)
  ){
    return{
      status:jplopsoft_STATUS_ACCESS_DENIED,
      reason:'A sandbox may assign only itself or descendant processes to a Job.'
    };
  }

  return jplopsoft_ntJobAssign(job,target);
}

function jplopsoft_ntTerminateJob(job,exitStatus,callerPid){
  var pids=[],k,p,i,current=null;

  if(!job)return jplopsoft_STATUS_INVALID_HANDLE;

  for(k in job.members){
    if(job.members.hasOwnProperty(k))pids.push(parseInt(k,10)||0);
  }

  for(i=0;i<pids.length;i++){
    p=jplopsoft_ntKernelProcessByPid(pids[i]);

    if(!p||!p.alive)continue;

    if(parseInt(p.pid,10)===(parseInt(callerPid,10)||0)){
      current=p;
      continue;
    }

    jplopsoft_ntForceTerminateProcessObject(
      p,
      Number(exitStatus)||0
    );
  }

  if(current&&current.alive){
    window.setTimeout(function(){
      if(current.alive){
        jplopsoft_ntForceTerminateProcessObject(
          current,
          Number(exitStatus)||0
        );
      }
    },0);
  }

  return jplopsoft_STATUS_SUCCESS;
}

/* -------------------------- IO COMPLETION PORT -------------------------- */

function jplopsoft_ntIocpCreate(pid,name,concurrency){
  var n=jplopsoft_ntNormalizeBaseNamedObject(name),
      key,obj,h;

  if(!n){
    n='\\BaseNamedObjects\\IoCompletion-'+String(pid)+'-'+
      String(jplopsoft_NT_KERNEL.nextObjectId);
  }

  key=jplopsoft_ntNamedObjectKey('IO_COMPLETION',n);
  obj=jplopsoft_NT_KERNEL.namedObjects[key];

  if(!obj){
    obj={
      objectId:jplopsoft_NT_KERNEL.nextObjectId++,
      type:'IO_COMPLETION',
      name:n,
      ownerPid:parseInt(pid,10)||0,
      createdAt:jplopsoft_ntKernelNow(),
      concurrency:Math.max(1,Math.min(64,parseInt(concurrency,10)||1)),
      queue:[],
      waiters:[]
    };
    jplopsoft_NT_KERNEL.namedObjects[key]=obj;
  }

  h=jplopsoft_ntObjectAllocateHandle(
    pid,
    obj,
    'IO_COMPLETION_ALL_ACCESS'
  );

  return{
    status:jplopsoft_STATUS_SUCCESS,
    handle:h,
    port:jplopsoft_ntIocpQuery(obj)
  };
}

function jplopsoft_ntIocpOpen(pid,name){
  var obj=jplopsoft_ntNamedObjectFind('IO_COMPLETION',name),h;

  if(!obj)return{
    status:jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
    handle:0
  };

  h=jplopsoft_ntObjectAllocateHandle(
    pid,
    obj,
    'IO_COMPLETION_ALL_ACCESS'
  );

  return{
    status:jplopsoft_STATUS_SUCCESS,
    handle:h,
    port:jplopsoft_ntIocpQuery(obj)
  };
}

function jplopsoft_ntIocpQuery(obj){
  return{
    objectType:'IO_COMPLETION',
    objectId:obj.objectId,
    name:obj.name,
    concurrency:obj.concurrency,
    queuedPackets:obj.queue.length,
    waitingThreads:obj.waiters.length,
    handleCount:jplopsoft_ntObjectHandleCount(obj.objectId)
  };
}

function jplopsoft_ntIocpPost(obj,packet){
  var waiter;

  if(!obj)return false;

  packet=packet||{};
  packet.queuedAt=jplopsoft_ntKernelNow();

  if(obj.waiters.length){
    waiter=obj.waiters.shift();

    if(waiter.timer){
      window.clearTimeout(waiter.timer);
    }

    waiter.resolve({
      status:jplopsoft_STATUS_SUCCESS,
      packet:packet
    });

    return true;
  }

  obj.queue.push(packet);

  while(obj.queue.length>4096)obj.queue.shift();

  return true;
}

function jplopsoft_ntIocpRemove(pid,handle,timeoutMs){
  var obj=jplopsoft_ntObjectFromHandle(
        pid,
        handle,
        'IO_COMPLETION'
      ),
      timeout=parseInt(timeoutMs,10);

  if(!obj){
    return Promise.resolve({
      status:jplopsoft_STATUS_INVALID_HANDLE,
      packet:null
    });
  }

  if(obj.queue.length){
    return Promise.resolve({
      status:jplopsoft_STATUS_SUCCESS,
      packet:obj.queue.shift()
    });
  }

  if(isNaN(timeout))timeout=0xFFFFFFFF;

  if(timeout===0){
    return Promise.resolve({
      status:jplopsoft_STATUS_TIMEOUT,
      packet:null
    });
  }

  if(timeout===0xFFFFFFFF)timeout=60000;
  timeout=Math.max(1,Math.min(60000,timeout));

  return new Promise(function(resolve){
    var waiter={
      resolve:resolve,
      timer:0
    };

    waiter.timer=window.setTimeout(function(){
      var i=obj.waiters.indexOf(waiter);

      if(i>=0)obj.waiters.splice(i,1);

      resolve({
        status:jplopsoft_STATUS_TIMEOUT,
        packet:null
      });
    },timeout);

    obj.waiters.push(waiter);
  });
}

function jplopsoft_ntCloseObjectHandle(pid,handle){
  var key=String(parseInt(handle,10)||0),
      h=jplopsoft_NT_KERNEL.objectHandles[key],
      obj,allKeys,k;

  if(!h||parseInt(h.pid,10)!==(parseInt(pid,10)||0))return false;

  obj=jplopsoft_ntObjectFromHandle(pid,handle,h.objectType);

  delete jplopsoft_NT_KERNEL.objectHandles[key];

  if(
    obj&&
    obj.type==='JOB'&&
    obj.limits.killOnJobClose&&
    jplopsoft_ntObjectHandleCount(obj.objectId)===0
  ){
    window.setTimeout(function(){
      jplopsoft_ntTerminateJob(
        obj,
        0xDEAD,
        pid
      );
    },0);
  }

  if(obj)jplopsoft_ntObjectMaybeDelete(obj);

  return true;
}

function jplopsoft_ntCloseAllObjectHandlesForPid(pid){
  var handles=[],k,h,i;

  pid=parseInt(pid,10)||0;

  for(k in jplopsoft_NT_KERNEL.objectHandles){
    if(!jplopsoft_NT_KERNEL.objectHandles.hasOwnProperty(k))continue;
    h=jplopsoft_NT_KERNEL.objectHandles[k];

    if(h&&parseInt(h.pid,10)===pid){
      handles.push(parseInt(k,10)||0);
    }
  }

  for(i=0;i<handles.length;i++){
    jplopsoft_ntCloseObjectHandle(pid,handles[i]);
  }
}

function jplopsoft_ntQueryNamedObjects(){
  var out=[],k,obj;

  for(k in jplopsoft_NT_KERNEL.namedObjects){
    if(!jplopsoft_NT_KERNEL.namedObjects.hasOwnProperty(k))continue;
    obj=jplopsoft_NT_KERNEL.namedObjects[k];

    if(!obj)continue;

    out.push({
      objectId:obj.objectId,
      objectType:obj.type,
      name:obj.name,
      ownerPid:obj.ownerPid,
      handleCount:jplopsoft_ntObjectHandleCount(obj.objectId),
      detail:
        obj.type==='SECTION'
          ?jplopsoft_ntSectionQuery(obj)
          :(
            obj.type==='JOB'
              ?jplopsoft_ntJobQuery(obj)
              :(
                obj.type==='IO_COMPLETION'
                  ?jplopsoft_ntIocpQuery(obj)
                  :{}
              )
          )
    });
  }

  return out;
}

function jplopsoft_ntStatusHex(status){
  var n=(Number(status)>>>0).toString(16).toUpperCase();
  while(n.length<8)n='0'+n;
  return'0x'+n;
}

function jplopsoft_ntStatusName(status){
  status=Number(status)>>>0;
  if(status===(jplopsoft_STATUS_SUCCESS>>>0))return'STATUS_SUCCESS';
  if(status===(jplopsoft_STATUS_ACCESS_DENIED>>>0))return'STATUS_ACCESS_DENIED';
  if(status===(jplopsoft_STATUS_INVALID_CID>>>0))return'STATUS_INVALID_CID';
  if(status===(jplopsoft_STATUS_INVALID_HANDLE>>>0))return'STATUS_INVALID_HANDLE';
  if(status===(jplopsoft_STATUS_PROCESS_IS_TERMINATING>>>0))return'STATUS_PROCESS_IS_TERMINATING';
  if(status===(jplopsoft_STATUS_QUOTA_EXCEEDED>>>0))return'STATUS_QUOTA_EXCEEDED';
  if(status===(jplopsoft_STATUS_CANCELLED>>>0))return'STATUS_CANCELLED';
  if(status===(jplopsoft_STATUS_TIMEOUT>>>0))return'STATUS_TIMEOUT';
  return'NTSTATUS';
}

function jplopsoft_ntKernelAllocatePid(){
  jplopsoft_NT_KERNEL.nextPid++;
  if(jplopsoft_NT_KERNEL.nextPid>60000)jplopsoft_NT_KERNEL.nextPid=2001;
  while(jplopsoft_NT_KERNEL.processByPid[String(jplopsoft_NT_KERNEL.nextPid)]){
    jplopsoft_NT_KERNEL.nextPid++;
  }
  return jplopsoft_NT_KERNEL.nextPid;
}


function jplopsoft_ntUtf8Bytes(text){
  text=String(text===undefined?'':text);
  if(typeof TextEncoder!=='undefined')return new TextEncoder().encode(text);
  var utf=unescape(encodeURIComponent(text)),out=new Uint8Array(utf.length),i;
  for(i=0;i<utf.length;i++)out[i]=utf.charCodeAt(i)&255;
  return out;
}

/* =========================================================================
 * ExOS VMM - EXOS_VMM_V1
 *
 * The browser cannot expose real CPU page tables to XSH, so ExOS models an
 * NT-style 47-bit user VAS in the host kernel.  Addresses are safe JavaScript
 * Numbers (< 2^47).  Reserve is metadata-only; Commit consumes commit charge.
 * A 4 KiB physical frame is materialized only on first touch.  Read/Write
 * VirtualMemory and mapped-section accesses are therefore the software page-
 * fault boundary.  Evicted pages move to the kernel-owned C:\pagefile.sys
 * sparse swap store.
 * ========================================================================= */

var jplopsoft_MEM_COMMIT=0x00001000;
var jplopsoft_MEM_RESERVE=0x00002000;
var jplopsoft_MEM_DECOMMIT=0x00004000;
var jplopsoft_MEM_RELEASE=0x00008000;
var jplopsoft_MEM_RESET=0x00080000;
var jplopsoft_MEM_TOP_DOWN=0x00100000;

var jplopsoft_MEM_PRIVATE=0x00020000;
var jplopsoft_MEM_MAPPED=0x00040000;
var jplopsoft_MEM_IMAGE=0x01000000;
var jplopsoft_MEM_FREE=0x00010000;

var jplopsoft_PAGE_NOACCESS=0x01;
var jplopsoft_PAGE_READONLY=0x02;
var jplopsoft_PAGE_READWRITE=0x04;
var jplopsoft_PAGE_WRITECOPY=0x08;
var jplopsoft_PAGE_EXECUTE=0x10;
var jplopsoft_PAGE_EXECUTE_READ=0x20;
var jplopsoft_PAGE_EXECUTE_READWRITE=0x40;
var jplopsoft_PAGE_EXECUTE_WRITECOPY=0x80;
var jplopsoft_PAGE_GUARD=0x100;

var jplopsoft_VMM_PAGE_SIZE=4096;
var jplopsoft_VMM_ALLOCATION_GRANULARITY=65536;
var jplopsoft_VMM_USER_ADDRESS_MIN=65536;
var jplopsoft_VMM_USER_ADDRESS_BYTES=Math.pow(2,47);
var jplopsoft_VMM_USER_ADDRESS_MAX=jplopsoft_VMM_USER_ADDRESS_BYTES-1;

function jplopsoft_vmmAlignDown(value,alignment){
  var a=Math.max(1,Number(alignment)||1),v=Math.max(0,Number(value)||0);
  return Math.floor(v/a)*a;
}
function jplopsoft_vmmAlignUp(value,alignment){
  var a=Math.max(1,Number(alignment)||1),v=Math.max(0,Number(value)||0);
  return Math.ceil(v/a)*a;
}
function jplopsoft_vmmSafeAddress(value){
  var n=Number(value);
  if(!isFinite(n)||n<0||n>jplopsoft_VMM_USER_ADDRESS_MAX)return -1;
  return Math.floor(n);
}
function jplopsoft_vmmProtectValue(value){
  var s;
  if(typeof value==='number'&&isFinite(value))return Number(value)>>>0;
  s=String(value||'PAGE_READWRITE').toUpperCase();
  if(s==='PAGE_NOACCESS')return jplopsoft_PAGE_NOACCESS;
  if(s==='PAGE_READONLY')return jplopsoft_PAGE_READONLY;
  if(s==='PAGE_WRITECOPY')return jplopsoft_PAGE_WRITECOPY;
  if(s==='PAGE_EXECUTE')return jplopsoft_PAGE_EXECUTE;
  if(s==='PAGE_EXECUTE_READ')return jplopsoft_PAGE_EXECUTE_READ;
  if(s==='PAGE_EXECUTE_READWRITE')return jplopsoft_PAGE_EXECUTE_READWRITE;
  if(s==='PAGE_EXECUTE_WRITECOPY')return jplopsoft_PAGE_EXECUTE_WRITECOPY;
  return jplopsoft_PAGE_READWRITE;
}
function jplopsoft_vmmProtectName(value){
  var n=jplopsoft_vmmProtectValue(value)&0xFF;
  if(n===jplopsoft_PAGE_NOACCESS)return'PAGE_NOACCESS';
  if(n===jplopsoft_PAGE_READONLY)return'PAGE_READONLY';
  if(n===jplopsoft_PAGE_WRITECOPY)return'PAGE_WRITECOPY';
  if(n===jplopsoft_PAGE_EXECUTE)return'PAGE_EXECUTE';
  if(n===jplopsoft_PAGE_EXECUTE_READ)return'PAGE_EXECUTE_READ';
  if(n===jplopsoft_PAGE_EXECUTE_READWRITE)return'PAGE_EXECUTE_READWRITE';
  if(n===jplopsoft_PAGE_EXECUTE_WRITECOPY)return'PAGE_EXECUTE_WRITECOPY';
  return'PAGE_READWRITE';
}
function jplopsoft_vmmProtectReadable(value){
  var n=jplopsoft_vmmProtectValue(value)&0xFF;
  return n===jplopsoft_PAGE_READONLY||
    n===jplopsoft_PAGE_READWRITE||
    n===jplopsoft_PAGE_WRITECOPY||
    n===jplopsoft_PAGE_EXECUTE_READ||
    n===jplopsoft_PAGE_EXECUTE_READWRITE||
    n===jplopsoft_PAGE_EXECUTE_WRITECOPY;
}
function jplopsoft_vmmProtectWritable(value){
  var n=jplopsoft_vmmProtectValue(value)&0xFF;
  return n===jplopsoft_PAGE_READWRITE||
    n===jplopsoft_PAGE_WRITECOPY||
    n===jplopsoft_PAGE_EXECUTE_READWRITE||
    n===jplopsoft_PAGE_EXECUTE_WRITECOPY;
}
function jplopsoft_vmmTypeName(type){
  type=Number(type)>>>0;
  if(type===jplopsoft_MEM_IMAGE)return'MEM_IMAGE';
  if(type===jplopsoft_MEM_MAPPED)return'MEM_MAPPED';
  return'MEM_PRIVATE';
}
function jplopsoft_vmmStateName(state){
  state=Number(state)>>>0;
  if(state===jplopsoft_MEM_COMMIT)return'MEM_COMMIT';
  if(state===jplopsoft_MEM_RESERVE)return'MEM_RESERVE';
  return'MEM_FREE';
}
function jplopsoft_vmmAllocationFlags(value){
  var n,s,parts,i;
  if(typeof value==='number'&&isFinite(value))return Number(value)>>>0;
  s=String(value||'').toUpperCase();
  if(!s)return jplopsoft_MEM_RESERVE|jplopsoft_MEM_COMMIT;
  n=0;parts=s.split(/[|,\s]+/);
  for(i=0;i<parts.length;i++){
    if(parts[i]==='MEM_COMMIT')n|=jplopsoft_MEM_COMMIT;
    else if(parts[i]==='MEM_RESERVE')n|=jplopsoft_MEM_RESERVE;
    else if(parts[i]==='MEM_DECOMMIT')n|=jplopsoft_MEM_DECOMMIT;
    else if(parts[i]==='MEM_RELEASE')n|=jplopsoft_MEM_RELEASE;
    else if(parts[i]==='MEM_RESET')n|=jplopsoft_MEM_RESET;
    else if(parts[i]==='MEM_TOP_DOWN')n|=jplopsoft_MEM_TOP_DOWN;
  }
  return n;
}
function jplopsoft_vmmKernel(){
  var v=jplopsoft_NT_KERNEL.vmm,deviceMemory,physical,pagefile;
  if(v)return v;

  deviceMemory=Number(
    typeof navigator!=='undefined'&&navigator.deviceMemory
      ?navigator.deviceMemory
      :0
  );
  physical=deviceMemory>0
    ?Math.max(64*1024*1024,Math.min(512*1024*1024,Math.floor(deviceMemory*64*1024*1024)))
    :256*1024*1024;
  pagefile=2*1024*1024*1024;

  v={
    model:'EXOS_VMM_V1',
    addressBits:47,
    virtualAddressBytes:jplopsoft_VMM_USER_ADDRESS_BYTES,
    pageSize:jplopsoft_VMM_PAGE_SIZE,
    allocationGranularity:jplopsoft_VMM_ALLOCATION_GRANULARITY,
    physicalLimitBytes:physical,
    commitLimitBytes:physical+pagefile,
    committedBytes:0,
    residentBytes:0,
    nextRegionId:1,
    nextFrameId:1,
    touchClock:1,
    frames:{},
    imageSections:{},
    pagefile:{
      path:'C:\\pagefile.sys',
      model:'SPARSE_PAGEFILE_V1',
      maxBytes:pagefile,
      usedBytes:0,
      nextSlot:1,
      slots:{}
    },
    stats:{
      pageFaults:0,
      demandZeroFaults:0,
      hardFaults:0,
      pageIns:0,
      pageOuts:0,
      trims:0,
      bytesPagedIn:0,
      bytesPagedOut:0
    },
    pagerTimer:0
  };
  jplopsoft_NT_KERNEL.vmm=v;

  if(typeof window!=='undefined'&&typeof window.setInterval==='function'){
    v.pagerTimer=window.setInterval(function(){
      try{
        var k=jplopsoft_vmmKernel();
        if(k.residentBytes>Math.floor(k.physicalLimitBytes*0.82)){
          jplopsoft_vmmTrimTo(Math.floor(k.physicalLimitBytes*0.68),null);
        }
      }catch(ignoreVmmPager){}
    },5000);
  }

  return v;
}
function jplopsoft_vmmPagefileFreeSlot(page){
  var v=jplopsoft_vmmKernel(),pf=v.pagefile,slot=parseInt(page&&page.swapSlot,10)||0;
  if(!slot)return;
  if(pf.slots[String(slot)]){
    delete pf.slots[String(slot)];
    pf.usedBytes=Math.max(0,pf.usedBytes-jplopsoft_VMM_PAGE_SIZE);
  }
  page.swapSlot=0;
}
function jplopsoft_vmmPagefileStore(page){
  var v=jplopsoft_vmmKernel(),pf=v.pagefile,slot;
  if(!page||!page.bytes)return false;
  slot=parseInt(page.swapSlot,10)||0;
  if(!slot){
    if(pf.usedBytes+jplopsoft_VMM_PAGE_SIZE>pf.maxBytes){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_QUOTA_EXCEEDED,
        'C:\\pagefile.sys has reached the ExOS commit backing limit.'
      );
    }
    slot=pf.nextSlot++;
    page.swapSlot=slot;
    pf.usedBytes+=jplopsoft_VMM_PAGE_SIZE;
  }
  pf.slots[String(slot)]=page.bytes.slice(0);
  return true;
}
function jplopsoft_vmmPageRelease(page){
  var v=jplopsoft_vmmKernel();
  if(!page)return;
  if(page.resident){
    delete v.frames[String(page.frameId)];
    v.residentBytes=Math.max(0,v.residentBytes-jplopsoft_VMM_PAGE_SIZE);
  }
  jplopsoft_vmmPagefileFreeSlot(page);
  page.bytes=null;
  page.resident=false;
  page.frameId=0;
}
function jplopsoft_vmmPageOut(page){
  var v=jplopsoft_vmmKernel();
  if(!page||!page.resident||!page.bytes)return false;
  if(page.pinCount>0)return false;

  if(page.dirty){
    jplopsoft_vmmPagefileStore(page);
    page.dirty=false;
  }

  delete v.frames[String(page.frameId)];
  page.bytes=null;
  page.resident=false;
  page.frameId=0;
  v.residentBytes=Math.max(0,v.residentBytes-jplopsoft_VMM_PAGE_SIZE);
  v.stats.pageOuts++;
  v.stats.bytesPagedOut+=jplopsoft_VMM_PAGE_SIZE;
  return true;
}
function jplopsoft_vmmTrimTo(targetBytes,excludePage){
  var v=jplopsoft_vmmKernel(),list=[],k,p,i,target=Math.max(0,Number(targetBytes)||0);
  for(k in v.frames){
    if(!v.frames.hasOwnProperty(k))continue;
    p=v.frames[k];
    if(!p||p===excludePage||p.pinCount>0)continue;
    list.push(p);
  }
  list.sort(function(a,b){return(Number(a.lastAccess)||0)-(Number(b.lastAccess)||0);});
  for(i=0;i<list.length&&v.residentBytes>target;i++){
    try{jplopsoft_vmmPageOut(list[i]);}catch(ignorePageOut){}
  }
  v.stats.trims++;
  return v.residentBytes;
}
function jplopsoft_vmmEnsureFrameCapacity(excludePage){
  var v=jplopsoft_vmmKernel();
  if(v.residentBytes+jplopsoft_VMM_PAGE_SIZE<=v.physicalLimitBytes)return true;
  jplopsoft_vmmTrimTo(
    Math.max(0,v.physicalLimitBytes-jplopsoft_VMM_PAGE_SIZE),
    excludePage
  );
  if(v.residentBytes+jplopsoft_VMM_PAGE_SIZE>v.physicalLimitBytes){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_QUOTA_EXCEEDED,
      'ExOS VMM could not obtain a free physical 4 KiB frame.'
    );
  }
  return true;
}
function jplopsoft_vmmPageIn(page,section,pageIndex,countFault){
  var v=jplopsoft_vmmKernel(),pf=v.pagefile,slot,src,start,end;
  if(page.resident&&page.bytes){
    page.lastAccess=v.touchClock++;
    return page.bytes;
  }

  if(countFault!==false)v.stats.pageFaults++;
  jplopsoft_vmmEnsureFrameCapacity(page);

  page.bytes=new Uint8Array(jplopsoft_VMM_PAGE_SIZE);
  slot=parseInt(page.swapSlot,10)||0;

  if(slot&&pf.slots[String(slot)]){
    page.bytes.set(pf.slots[String(slot)].subarray(0,jplopsoft_VMM_PAGE_SIZE));
    if(countFault!==false){
      v.stats.hardFaults++;
      v.stats.pageIns++;
      v.stats.bytesPagedIn+=jplopsoft_VMM_PAGE_SIZE;
    }
  }else if(section&&section.backingBytes){
    start=Math.max(0,Math.floor(Number(pageIndex)||0)*jplopsoft_VMM_PAGE_SIZE);
    end=Math.min(section.backingBytes.length,start+jplopsoft_VMM_PAGE_SIZE);
    if(end>start)page.bytes.set(section.backingBytes.subarray(start,end),0);
    if(countFault!==false)v.stats.demandZeroFaults++;
  }else{
    if(countFault!==false)v.stats.demandZeroFaults++;
  }

  page.resident=true;
  page.frameId=v.nextFrameId++;
  page.lastAccess=v.touchClock++;
  v.frames[String(page.frameId)]=page;
  v.residentBytes+=jplopsoft_VMM_PAGE_SIZE;
  return page.bytes;
}
function jplopsoft_vmmRegionCommittedPages(region){
  var n=0,i,ranges=region&&region.commitRanges?region.commitRanges:[];
  for(i=0;i<ranges.length;i++)n+=Math.max(0,Number(ranges[i][1])-Number(ranges[i][0]));
  return n;
}
function jplopsoft_vmmRangeAdd(region,startPage,endPage){
  var old=jplopsoft_vmmRegionCommittedPages(region),
      a=Math.max(0,Math.floor(Number(startPage)||0)),
      b=Math.max(0,Math.floor(Number(endPage)||0)),
      list=(region.commitRanges||[]).slice(),out=[],i,r,inserted=false;
  if(b<=a)return 0;
  list.push([a,b]);
  list.sort(function(x,y){return x[0]-y[0];});
  for(i=0;i<list.length;i++){
    r=list[i];
    if(!out.length||r[0]>out[out.length-1][1]){
      out.push([r[0],r[1]]);
    }else{
      out[out.length-1][1]=Math.max(out[out.length-1][1],r[1]);
    }
  }
  region.commitRanges=out;
  return Math.max(0,jplopsoft_vmmRegionCommittedPages(region)-old);
}
function jplopsoft_vmmRangeRemove(region,startPage,endPage){
  var old=jplopsoft_vmmRegionCommittedPages(region),
      a=Math.max(0,Math.floor(Number(startPage)||0)),
      b=Math.max(0,Math.floor(Number(endPage)||0)),
      list=region.commitRanges||[],out=[],i,r;
  if(b<=a)return 0;
  for(i=0;i<list.length;i++){
    r=list[i];
    if(r[1]<=a||r[0]>=b){
      out.push([r[0],r[1]]);
      continue;
    }
    if(r[0]<a)out.push([r[0],a]);
    if(r[1]>b)out.push([b,r[1]]);
  }
  region.commitRanges=out;
  return Math.max(0,old-jplopsoft_vmmRegionCommittedPages(region));
}
function jplopsoft_vmmPageCommitted(region,pageIndex){
  var a=region&&region.commitRanges?region.commitRanges:[],i,n=Math.floor(Number(pageIndex)||0);
  for(i=0;i<a.length;i++){
    if(n>=a[i][0]&&n<a[i][1])return true;
    if(n<a[i][0])break;
  }
  return false;
}
function jplopsoft_vmmFindRegion(proc,address){
  var vm=proc&&proc.vm,regions=vm&&vm.regions?vm.regions:[],
      addr=jplopsoft_vmmSafeAddress(address),i,r;
  if(addr<0)return null;
  for(i=0;i<regions.length;i++){
    r=regions[i];
    if(addr>=Number(r.base)&&addr<Number(r.base)+Number(r.size))return r;
  }
  return null;
}
function jplopsoft_vmmRegionOverlaps(vm,base,size,ignoreRegion){
  var regions=vm&&vm.regions?vm.regions:[],end=base+size,i,r,re;
  for(i=0;i<regions.length;i++){
    r=regions[i];
    if(r===ignoreRegion)continue;
    re=Number(r.base)+Number(r.size);
    if(base<re&&end>Number(r.base))return true;
  }
  return false;
}
function jplopsoft_vmmSortRegions(vm){
  if(vm&&vm.regions)vm.regions.sort(function(a,b){return Number(a.base)-Number(b.base);});
}
function jplopsoft_vmmFindFreeBase(vm,size,preferred,topDown){
  var bytes=jplopsoft_vmmAlignUp(size,jplopsoft_VMM_ALLOCATION_GRANULARITY),
      regions=(vm&&vm.regions?vm.regions:[]).slice(),base,i,r,end,maxStart;
  regions.sort(function(a,b){return Number(a.base)-Number(b.base);});

  if(preferred){
    base=jplopsoft_vmmAlignDown(preferred,jplopsoft_VMM_ALLOCATION_GRANULARITY);
    if(
      base>=jplopsoft_VMM_USER_ADDRESS_MIN&&
      base+bytes<=jplopsoft_VMM_USER_ADDRESS_BYTES&&
      !jplopsoft_vmmRegionOverlaps(vm,base,bytes,null)
    )return base;
  }

  if(topDown){
    maxStart=jplopsoft_vmmAlignDown(
      jplopsoft_VMM_USER_ADDRESS_BYTES-bytes,
      jplopsoft_VMM_ALLOCATION_GRANULARITY
    );
    base=maxStart;
    for(i=regions.length-1;i>=0;i--){
      r=regions[i];
      end=Number(r.base)+Number(r.size);
      if(base>=end)break;
      base=jplopsoft_vmmAlignDown(
        Number(r.base)-bytes,
        jplopsoft_VMM_ALLOCATION_GRANULARITY
      );
      if(base<jplopsoft_VMM_USER_ADDRESS_MIN)return 0;
    }
    return base>=jplopsoft_VMM_USER_ADDRESS_MIN?base:0;
  }

  base=Math.max(
    jplopsoft_VMM_USER_ADDRESS_MIN,
    jplopsoft_vmmAlignUp(Number(vm.nextBase)||0x100000000,jplopsoft_VMM_ALLOCATION_GRANULARITY)
  );
  for(i=0;i<regions.length;i++){
    r=regions[i];
    if(base+bytes<=Number(r.base))break;
    end=Number(r.base)+Number(r.size);
    if(base<end){
      base=jplopsoft_vmmAlignUp(end,jplopsoft_VMM_ALLOCATION_GRANULARITY);
    }
  }
  if(base+bytes>jplopsoft_VMM_USER_ADDRESS_BYTES)return 0;
  vm.nextBase=base+bytes;
  return base;
}
function jplopsoft_vmmNewRegion(proc,base,size,protect,type,name,options){
  var vm=proc.vm,opt=options||{},r={
    id:jplopsoft_vmmKernel().nextRegionId++,
    base:Number(base),
    allocationBase:Number(base),
    size:jplopsoft_vmmAlignUp(size,jplopsoft_VMM_PAGE_SIZE),
    allocationProtect:jplopsoft_vmmProtectValue(protect),
    protect:jplopsoft_vmmProtectValue(protect),
    type:Number(type)||jplopsoft_MEM_PRIVATE,
    name:String(name||''),
    commitRanges:[],
    pages:{},
    mapped:!!opt.mapped,
    mappingId:parseInt(opt.mappingId,10)||0,
    sectionObject:opt.sectionObject||null,
    sectionOffset:Math.max(0,Number(opt.sectionOffset)||0),
    ownsCommit:opt.ownsCommit!==false,
    systemImage:!!opt.systemImage,
    createdAt:jplopsoft_ntKernelNow()
  };
  vm.regions.push(r);
  jplopsoft_vmmSortRegions(vm);
  vm.reservedBytes=(Number(vm.reservedBytes)||0)+r.size;
  return r;
}
function jplopsoft_vmmCommitCharge(proc,bytes,chargeProcess){
  var v=jplopsoft_vmmKernel(),n=Math.max(0,Number(bytes)||0),chk;
  if(!n)return true;
  if(v.committedBytes+n>v.commitLimitBytes){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_QUOTA_EXCEEDED,
      'ExOS VMM commit limit exceeded (RAM + C:\\pagefile.sys).'
    );
  }
  if(chargeProcess!==false){
    chk=jplopsoft_ntProcessChargeMemory(proc,n,0);
    if(!chk.ok)throw jplopsoft_xshError(chk.status,chk.reason||'Process commit charge denied.');
  }
  v.committedBytes+=n;
  if(proc&&proc.vm){
    proc.vm.committedBytes=(Number(proc.vm.committedBytes)||0)+n;
    proc.vmCommittedBytes=proc.vm.committedBytes;
  }
  return true;
}
function jplopsoft_vmmReleaseCommit(proc,bytes,chargeProcess){
  var v=jplopsoft_vmmKernel(),n=Math.max(0,Number(bytes)||0);
  if(!n)return;
  v.committedBytes=Math.max(0,v.committedBytes-n);
  if(proc&&proc.vm){
    proc.vm.committedBytes=Math.max(0,(Number(proc.vm.committedBytes)||0)-n);
    proc.vmCommittedBytes=proc.vm.committedBytes;
  }
  if(chargeProcess!==false)jplopsoft_ntProcessReleaseMemory(proc,n,0);
}
function jplopsoft_vmmCommitRegion(proc,region,address,size,chargeProcess){
  var start=Math.max(Number(region.base),Number(address)),
      finish=Math.min(Number(region.base)+Number(region.size),start+Math.max(0,Number(size)||0)),
      first,last,added,bytes;
  if(finish<=start)return 0;
  first=Math.floor((start-Number(region.base))/jplopsoft_VMM_PAGE_SIZE);
  last=Math.ceil((finish-Number(region.base))/jplopsoft_VMM_PAGE_SIZE);
  added=jplopsoft_vmmRangeAdd(region,first,last);
  bytes=added*jplopsoft_VMM_PAGE_SIZE;
  if(bytes){
    try{
      if(region.ownsCommit!==false)jplopsoft_vmmCommitCharge(proc,bytes,chargeProcess);
    }catch(e){
      jplopsoft_vmmRangeRemove(region,first,last);
      throw e;
    }
  }
  return bytes;
}
function jplopsoft_vmmPageObject(proc,region,pageIndex,create){
  var section=region.sectionObject,container,key,page,sectionPage;
  if(section){
    sectionPage=Math.floor(
      (Number(region.sectionOffset)+pageIndex*jplopsoft_VMM_PAGE_SIZE)/
      jplopsoft_VMM_PAGE_SIZE
    );
    container=section.pages||(section.pages={});
    key=String(sectionPage);
    page=container[key]||null;
    if(!page&&create){
      page={
        key:'S:'+String(section.objectId)+':'+key,
        ownerKind:region.systemImage?'IMAGE':'SECTION',
        ownerPid:0,
        ownerId:section.objectId,
        pageIndex:sectionPage,
        resident:false,
        bytes:null,
        frameId:0,
        swapSlot:0,
        dirty:false,
        pinCount:0,
        lastAccess:0
      };
      container[key]=page;
    }
    return page;
  }

  container=region.pages||(region.pages={});
  key=String(pageIndex);
  page=container[key]||null;
  if(!page&&create){
    page={
      key:'P:'+String(proc.pid)+':'+String(region.id)+':'+key,
      ownerKind:'PRIVATE',
      ownerPid:proc.pid,
      ownerId:region.id,
      pageIndex:pageIndex,
      resident:false,
      bytes:null,
      frameId:0,
      swapSlot:0,
      dirty:false,
      pinCount:0,
      lastAccess:0
    };
    container[key]=page;
  }
  return page;
}
function jplopsoft_vmmTouchPage(proc,region,pageIndex,write,countFault){
  var page,section,bytes;
  if(!jplopsoft_vmmPageCommitted(region,pageIndex)){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_ADDRESS,
      'Page fault on an uncommitted virtual page.'
    );
  }
  if(write&&!jplopsoft_vmmProtectWritable(region.protect)){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_ACCESS_DENIED,
      'Write access violation at '+String(region.name||'virtual region')+'.'
    );
  }
  if(!write&&!jplopsoft_vmmProtectReadable(region.protect)){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_ACCESS_DENIED,
      'Read access violation at '+String(region.name||'virtual region')+'.'
    );
  }

  page=jplopsoft_vmmPageObject(proc,region,pageIndex,true);
  section=region.sectionObject||null;
  bytes=jplopsoft_vmmPageIn(
    page,
    section,
    section
      ?Math.floor((Number(region.sectionOffset)+pageIndex*jplopsoft_VMM_PAGE_SIZE)/jplopsoft_VMM_PAGE_SIZE)
      :pageIndex,
    countFault
  );
  page.lastAccess=jplopsoft_vmmKernel().touchClock++;
  if(write){
    page.dirty=true;
    if(section)section.dirty=true;
  }
  return bytes;
}
function jplopsoft_vmmRead(proc,address,size,countFault){
  var addr=jplopsoft_vmmSafeAddress(address),
      remaining=Math.max(0,Math.min(64*1024*1024,Math.floor(Number(size)||0))),
      out=new Uint8Array(remaining),cursor=addr,outPos=0,region,pageIndex,pageOff,take,page;
  if(addr<0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'Invalid virtual address.');
  while(remaining>0){
    region=jplopsoft_vmmFindRegion(proc,cursor);
    if(!region)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'Virtual address is MEM_FREE.');
    pageIndex=Math.floor((cursor-Number(region.base))/jplopsoft_VMM_PAGE_SIZE);
    pageOff=(cursor-Number(region.base))%jplopsoft_VMM_PAGE_SIZE;
    take=Math.min(remaining,jplopsoft_VMM_PAGE_SIZE-pageOff,Number(region.base)+Number(region.size)-cursor);
    page=jplopsoft_vmmTouchPage(proc,region,pageIndex,false,countFault);
    out.set(page.subarray(pageOff,pageOff+take),outPos);
    cursor+=take;outPos+=take;remaining-=take;
  }
  return out;
}
function jplopsoft_vmmWrite(proc,address,data,countFault){
  var src=data instanceof Uint8Array
        ?data
        :(data instanceof ArrayBuffer
          ?new Uint8Array(data)
          :(Array.isArray(data)
            ?new Uint8Array(data)
            :jplopsoft_ntUtf8Bytes(String(data===undefined?'':data)))),
      addr=jplopsoft_vmmSafeAddress(address),
      remaining=src.length,cursor=addr,srcPos=0,region,pageIndex,pageOff,take,page;
  if(src.length>64*1024*1024)throw jplopsoft_xshError(jplopsoft_STATUS_QUOTA_EXCEEDED,'Virtual write is limited to 64 MiB per call.');
  if(addr<0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'Invalid virtual address.');
  while(remaining>0){
    region=jplopsoft_vmmFindRegion(proc,cursor);
    if(!region)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'Virtual address is MEM_FREE.');
    pageIndex=Math.floor((cursor-Number(region.base))/jplopsoft_VMM_PAGE_SIZE);
    pageOff=(cursor-Number(region.base))%jplopsoft_VMM_PAGE_SIZE;
    take=Math.min(remaining,jplopsoft_VMM_PAGE_SIZE-pageOff,Number(region.base)+Number(region.size)-cursor);
    page=jplopsoft_vmmTouchPage(proc,region,pageIndex,true,countFault);
    page.set(src.subarray(srcPos,srcPos+take),pageOff);
    cursor+=take;srcPos+=take;remaining-=take;
  }
  return src.length;
}
function jplopsoft_vmmReleaseRegion(proc,region,releaseCommit){
  var vm=proc&&proc.vm,v=jplopsoft_vmmKernel(),k,page,committed;
  if(!vm||!region)return false;

  if(region.sectionObject){
    /* Shared pages belong to the SECTION/image cache, not this mapping. */
  }else{
    for(k in region.pages){
      if(region.pages.hasOwnProperty(k)){
        page=region.pages[k];
        jplopsoft_vmmPageRelease(page);
      }
    }
  }

  committed=jplopsoft_vmmRegionCommittedPages(region)*jplopsoft_VMM_PAGE_SIZE;
  if(releaseCommit!==false&&region.ownsCommit!==false&&committed){
    jplopsoft_vmmReleaseCommit(proc,committed,true);
  }

  vm.reservedBytes=Math.max(0,(Number(vm.reservedBytes)||0)-Number(region.size));
  for(k=0;k<vm.regions.length;k++){
    if(vm.regions[k]===region){
      vm.regions.splice(k,1);
      break;
    }
  }
  return true;
}
function jplopsoft_vmmReleaseProcess(proc){
  var vm=proc&&proc.vm,copy,i;
  if(!vm)return true;
  copy=vm.regions.slice();
  for(i=0;i<copy.length;i++){
    if(copy[i].mapped&&!copy[i].systemImage)continue;
    jplopsoft_vmmReleaseRegion(proc,copy[i],true);
  }
  vm.regions=[];
  vm.reservedBytes=0;
  vm.modules={};
  return true;
}
function jplopsoft_vmmVirtualAlloc(proc,address,size,allocationType,protect){
  var vm=proc&&proc.vm,flags=jplopsoft_vmmAllocationFlags(allocationType),
      bytes=jplopsoft_vmmAlignUp(size,jplopsoft_VMM_PAGE_SIZE),
      addr=jplopsoft_vmmSafeAddress(address),base,region,offsetSize;

  if(!vm)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_CID,'Process has no VMM address space.');
  if(bytes<=0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'VirtualAlloc size must be greater than zero.');

  if(addr<0&&address!==null&&address!==undefined&&Number(address)!==0){
    throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'VirtualAlloc address is outside the 128 TB user VAS.');
  }

  if((flags&(jplopsoft_MEM_RESERVE|jplopsoft_MEM_COMMIT))===0){
    throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'VirtualAlloc requires MEM_RESERVE and/or MEM_COMMIT.');
  }

  if((flags&jplopsoft_MEM_RESERVE)!==0){
    if(addr>0){
      base=jplopsoft_vmmAlignDown(addr,jplopsoft_VMM_ALLOCATION_GRANULARITY);
      offsetSize=(addr-base)+bytes;
      bytes=jplopsoft_vmmAlignUp(offsetSize,jplopsoft_VMM_PAGE_SIZE);
      if(
        base<jplopsoft_VMM_USER_ADDRESS_MIN||
        base+bytes>jplopsoft_VMM_USER_ADDRESS_BYTES||
        jplopsoft_vmmRegionOverlaps(vm,base,bytes,null)
      ){
        throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'Requested VirtualAlloc range is unavailable.');
      }
    }else{
      base=jplopsoft_vmmFindFreeBase(vm,bytes,0,(flags&jplopsoft_MEM_TOP_DOWN)!==0);
      if(!base)throw jplopsoft_xshError(jplopsoft_STATUS_QUOTA_EXCEEDED,'No contiguous virtual address range is available.');
    }
    region=jplopsoft_vmmNewRegion(
      proc,base,bytes,protect,jplopsoft_MEM_PRIVATE,'VirtualAlloc',
      {ownsCommit:true}
    );
  }else{
    if(!(addr>0))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'MEM_COMMIT without MEM_RESERVE requires an existing reserved address.');
    region=jplopsoft_vmmFindRegion(proc,addr);
    if(!region||region.type!==jplopsoft_MEM_PRIVATE){
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'MEM_COMMIT address is not inside a private reserved allocation.');
    }
    base=Number(region.base);
  }

  if((flags&jplopsoft_MEM_COMMIT)!==0){
    jplopsoft_vmmCommitRegion(
      proc,
      region,
      addr>0?addr:Number(region.base),
      bytes,
      true
    );
    region.protect=jplopsoft_vmmProtectValue(protect);
  }

  return addr>0&&!(flags&jplopsoft_MEM_RESERVE)?addr:Number(region.base);
}
function jplopsoft_vmmDecommit(proc,region,address,size){
  var start=Math.max(Number(region.base),Number(address)),
      finish=Math.min(Number(region.base)+Number(region.size),start+Math.max(0,Number(size)||0)),
      first,last,removed,k,pageIndex,page;
  if(finish<=start)return 0;
  first=Math.floor((start-Number(region.base))/jplopsoft_VMM_PAGE_SIZE);
  last=Math.ceil((finish-Number(region.base))/jplopsoft_VMM_PAGE_SIZE);
  removed=jplopsoft_vmmRangeRemove(region,first,last);
  for(k in region.pages){
    if(!region.pages.hasOwnProperty(k))continue;
    pageIndex=parseInt(k,10)||0;
    if(pageIndex>=first&&pageIndex<last){
      page=region.pages[k];
      jplopsoft_vmmPageRelease(page);
      delete region.pages[k];
    }
  }
  if(removed&&region.ownsCommit!==false){
    jplopsoft_vmmReleaseCommit(proc,removed*jplopsoft_VMM_PAGE_SIZE,true);
  }
  return removed*jplopsoft_VMM_PAGE_SIZE;
}
function jplopsoft_vmmVirtualFree(proc,address,size,freeType){
  var addr=jplopsoft_vmmSafeAddress(address),
      flags=jplopsoft_vmmAllocationFlags(freeType),
      region;
  if(addr<0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'Invalid VirtualFree address.');
  region=jplopsoft_vmmFindRegion(proc,addr);
  if(!region||region.mapped)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'VirtualFree requires a private allocation.');

  if((flags&jplopsoft_MEM_RELEASE)!==0){
    if(addr!==Number(region.allocationBase)||Number(size||0)!==0){
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'MEM_RELEASE requires AllocationBase and dwSize=0.');
    }
    return jplopsoft_vmmReleaseRegion(proc,region,true);
  }

  if((flags&jplopsoft_MEM_DECOMMIT)!==0){
    if(!(Number(size)>0))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'MEM_DECOMMIT requires a non-zero size.');
    jplopsoft_vmmDecommit(proc,region,addr,size);
    return true;
  }

  throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'VirtualFree requires MEM_DECOMMIT or MEM_RELEASE.');
}
function jplopsoft_vmmVirtualQuery(proc,address){
  var vm=proc&&proc.vm,addr=jplopsoft_vmmSafeAddress(address),
      regions=vm&&vm.regions?vm.regions.slice():[],region,i,r,next,end,pageIndex,
      ranges,j,range,stateBase,stateEnd,state,protect,type;
  if(addr<0)return null;
  regions.sort(function(a,b){return Number(a.base)-Number(b.base);});
  region=jplopsoft_vmmFindRegion(proc,addr);

  if(!region){
    next=jplopsoft_VMM_USER_ADDRESS_BYTES;
    for(i=0;i<regions.length;i++){
      if(Number(regions[i].base)>addr){next=Number(regions[i].base);break;}
    }
    end=Math.max(addr+jplopsoft_VMM_PAGE_SIZE,next);
    stateBase=jplopsoft_vmmAlignDown(addr,jplopsoft_VMM_PAGE_SIZE);
    return{
      BaseAddress:stateBase,
      AllocationBase:0,
      AllocationProtect:0,
      RegionSize:Math.max(jplopsoft_VMM_PAGE_SIZE,end-stateBase),
      State:jplopsoft_MEM_FREE,
      StateName:'MEM_FREE',
      Protect:0,
      ProtectName:'PAGE_NOACCESS',
      Type:0,
      TypeName:'MEM_FREE',
      Name:''
    };
  }

  pageIndex=Math.floor((addr-Number(region.base))/jplopsoft_VMM_PAGE_SIZE);
  ranges=region.commitRanges||[];
  state=jplopsoft_MEM_RESERVE;
  stateBase=Number(region.base);
  stateEnd=Number(region.base)+Number(region.size);

  for(j=0;j<ranges.length;j++){
    range=ranges[j];
    if(pageIndex>=range[0]&&pageIndex<range[1]){
      state=jplopsoft_MEM_COMMIT;
      stateBase=Number(region.base)+range[0]*jplopsoft_VMM_PAGE_SIZE;
      stateEnd=Math.min(Number(region.base)+Number(region.size),Number(region.base)+range[1]*jplopsoft_VMM_PAGE_SIZE);
      break;
    }
    if(pageIndex<range[0]){
      stateBase=Number(region.base)+
        (j===0?0:ranges[j-1][1]*jplopsoft_VMM_PAGE_SIZE);
      stateEnd=Number(region.base)+range[0]*jplopsoft_VMM_PAGE_SIZE;
      break;
    }
  }
  if(state===jplopsoft_MEM_RESERVE&&ranges.length&&pageIndex>=ranges[ranges.length-1][1]){
    stateBase=Number(region.base)+ranges[ranges.length-1][1]*jplopsoft_VMM_PAGE_SIZE;
  }

  protect=state===jplopsoft_MEM_COMMIT?region.protect:0;
  type=region.type;

  return{
    BaseAddress:stateBase,
    AllocationBase:Number(region.allocationBase),
    AllocationProtect:region.allocationProtect,
    AllocationProtectName:jplopsoft_vmmProtectName(region.allocationProtect),
    RegionSize:Math.max(jplopsoft_VMM_PAGE_SIZE,stateEnd-stateBase),
    State:state,
    StateName:jplopsoft_vmmStateName(state),
    Protect:protect,
    ProtectName:state===jplopsoft_MEM_COMMIT?jplopsoft_vmmProtectName(protect):'PAGE_NOACCESS',
    Type:type,
    TypeName:jplopsoft_vmmTypeName(type),
    Name:String(region.name||''),
    MappingId:parseInt(region.mappingId,10)||0,
    Shared:!!region.sectionObject
  };
}
function jplopsoft_vmmVirtualProtect(proc,address,size,newProtect){
  var addr=jplopsoft_vmmSafeAddress(address),region=jplopsoft_vmmFindRegion(proc,addr),
      bytes=Math.max(1,Number(size)||0),end=addr+bytes,old;
  if(!region||end>Number(region.base)+Number(region.size)){
    throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'VirtualProtect range must stay inside one allocation.');
  }
  old=region.protect;
  region.protect=jplopsoft_vmmProtectValue(newProtect);
  return{
    ok:true,
    oldProtect:old,
    oldProtectName:jplopsoft_vmmProtectName(old),
    newProtect:region.protect,
    newProtectName:jplopsoft_vmmProtectName(region.protect)
  };
}
function jplopsoft_vmmSystemImageSize(name){
  var n=String(name||'').toLowerCase(),table={
    'ntoskrnl.exe':768*1024,
    'ntoskrnl.dll':768*1024,
    'ntdll.dll':384*1024,
    'kernel32.dll':512*1024,
    'user32.dll':768*1024,
    'gdi32.dll':512*1024,
    'advapi32.dll':384*1024,
    'comctl32.dll':640*1024,
    'comdlg32.dll':512*1024,
    'zipfldr.dll':768*1024,
    'wininet.dll':384*1024,
    'ws2_32.dll':384*1024,
    'wsock32.dll':384*1024,
    'psapi.dll':192*1024,
    'oleaut32.dll':256*1024,
    'icmp.dll':128*1024,
    'winmm.dll':256*1024,
    'zlib.dll':256*1024,
    'tapi32.dll':192*1024,
    'urlmon.dll':256*1024,
    'ole32.dll':384*1024,
    'crypt32.dll':384*1024,
    'bcrypt.dll':384*1024,
    'riched20.dll':512*1024,
    'msftedit.dll':512*1024,
    'webview2.dll':512*1024,
    'shdocvw.dll':384*1024,
    'shell32.dll':768*1024,
    'uxtheme.dll':256*1024,
    'dwmapi.dll':256*1024,
    'winui.dll':384*1024,
    'd3d11.dll':640*1024,
    'd3dx.dll':640*1024,
    'three32.dll':640*1024,
    'mfplat.dll':512*1024,
    'mediafoundation.dll':512*1024
  };
  return table[n]||256*1024;
}
function jplopsoft_vmmImageSection(name){
  var v=jplopsoft_vmmKernel(),n=String(name||'').toLowerCase(),s,size,marker;
  if(!n)return null;
  s=v.imageSections[n];
  if(s)return s;
  size=jplopsoft_vmmAlignUp(jplopsoft_vmmSystemImageSize(n),jplopsoft_VMM_PAGE_SIZE);
  if(v.committedBytes+size>v.commitLimitBytes)return null;
  marker=jplopsoft_ntUtf8Bytes('MZ\0\0EXOS_SHARED_IMAGE\0'+n+'\0EXOS_VMM_V1\0');
  s={
    objectId:'IMG:'+n,
    type:'IMAGE_SECTION',
    name:n,
    size:size,
    protect:jplopsoft_PAGE_EXECUTE_READ,
    pages:{},
    backingBytes:marker,
    dirty:false,
    systemImage:true,
    commitChargeBytes:size
  };
  v.imageSections[n]=s;
  v.committedBytes+=size;
  return s;
}
function jplopsoft_vmmRegisterLoadedModule(proc,name){
  var vm=proc&&proc.vm,n=String(name||'').toLowerCase(),section,base,region;
  if(!vm||!n||n.length>128)return null;
  if(vm.modules[n])return vm.modules[n];
  section=jplopsoft_vmmImageSection(n);
  if(!section)return null;
  base=jplopsoft_vmmFindFreeBase(vm,section.size,0,true);
  if(!base)return null;
  region=jplopsoft_vmmNewRegion(
    proc,base,section.size,section.protect,jplopsoft_MEM_IMAGE,n,
    {mapped:true,sectionObject:section,sectionOffset:0,ownsCommit:false,systemImage:true}
  );
  jplopsoft_vmmRangeAdd(region,0,Math.ceil(section.size/jplopsoft_VMM_PAGE_SIZE));
  vm.modules[n]=base;
  vm.sharedImageBytes=(Number(vm.sharedImageBytes)||0)+section.size;
  proc.sharedImageBytes=vm.sharedImageBytes;
  return base;
}
function jplopsoft_vmmProcessStatus(proc){
  var vm=proc&&proc.vm,v=jplopsoft_vmmKernel(),resident=0,swapped=0,k,r,page,
      privateCommitted=vm?Number(vm.committedBytes)||0:0;
  if(vm){
    for(k=0;k<vm.regions.length;k++){
      r=vm.regions[k];
      if(r.sectionObject)continue;
      for(var pk in r.pages){
        if(!r.pages.hasOwnProperty(pk))continue;
        page=r.pages[pk];
        if(page.resident)resident+=jplopsoft_VMM_PAGE_SIZE;
        if(page.swapSlot)swapped+=jplopsoft_VMM_PAGE_SIZE;
      }
    }
  }
  return{
    model:'EXOS_VMM_V1',
    pid:proc?proc.pid:0,
    virtualAddressBits:47,
    virtualAddressBytes:jplopsoft_VMM_USER_ADDRESS_BYTES,
    reservedBytes:vm?Number(vm.reservedBytes)||0:0,
    committedBytes:privateCommitted,
    residentPrivateBytes:resident,
    swappedPrivateBytes:swapped,
    sharedImageBytes:vm?Number(vm.sharedImageBytes)||0:0,
    regions:vm&&vm.regions?vm.regions.length:0,
    pageSize:jplopsoft_VMM_PAGE_SIZE,
    allocationGranularity:jplopsoft_VMM_ALLOCATION_GRANULARITY,
    pagefilePath:v.pagefile.path
  };
}
function jplopsoft_vmmGlobalStatus(proc){
  var v=jplopsoft_vmmKernel(),ps=proc?jplopsoft_vmmProcessStatus(proc):null;
  return{
    model:v.model,
    virtualAddressBits:v.addressBits,
    virtualAddressBytes:v.virtualAddressBytes,
    pageSize:v.pageSize,
    allocationGranularity:v.allocationGranularity,
    physicalLimitBytes:v.physicalLimitBytes,
    residentBytes:v.residentBytes,
    availablePhysicalBytes:Math.max(0,v.physicalLimitBytes-v.residentBytes),
    commitLimitBytes:v.commitLimitBytes,
    committedBytes:v.committedBytes,
    availableCommitBytes:Math.max(0,v.commitLimitBytes-v.committedBytes),
    pagefile:{
      path:v.pagefile.path,
      model:v.pagefile.model,
      maxBytes:v.pagefile.maxBytes,
      usedBytes:v.pagefile.usedBytes,
      freeBytes:Math.max(0,v.pagefile.maxBytes-v.pagefile.usedBytes)
    },
    stats:{
      pageFaults:v.stats.pageFaults,
      demandZeroFaults:v.stats.demandZeroFaults,
      hardFaults:v.stats.hardFaults,
      pageIns:v.stats.pageIns,
      pageOuts:v.stats.pageOuts,
      trims:v.stats.trims,
      bytesPagedIn:v.stats.bytesPagedIn,
      bytesPagedOut:v.stats.bytesPagedOut
    },
    process:ps
  };
}
function jplopsoft_vmmGlobalMemoryStatus(proc){
  var v=jplopsoft_vmmKernel(),vm=proc&&proc.vm,
      load=v.physicalLimitBytes>0?Math.min(100,Math.round((v.residentBytes/v.physicalLimitBytes)*100)):0;
  return{
    dwLength:64,
    dwMemoryLoad:load,
    ullTotalPhys:v.physicalLimitBytes,
    ullAvailPhys:Math.max(0,v.physicalLimitBytes-v.residentBytes),
    ullTotalPageFile:v.commitLimitBytes,
    ullAvailPageFile:Math.max(0,v.commitLimitBytes-v.committedBytes),
    ullTotalVirtual:jplopsoft_VMM_USER_ADDRESS_BYTES,
    ullAvailVirtual:Math.max(0,jplopsoft_VMM_USER_ADDRESS_BYTES-(vm?Number(vm.reservedBytes)||0:0)),
    ullAvailExtendedVirtual:0,
    pageSize:jplopsoft_VMM_PAGE_SIZE,
    pagefilePath:v.pagefile.path
  };
}
function jplopsoft_vmmSeed(proc,address,data){
  var region=jplopsoft_vmmFindRegion(proc,address),oldProtect;
  if(!region)return 0;
  oldProtect=region.protect;
  region.protect=jplopsoft_PAGE_READWRITE;
  try{
    return jplopsoft_vmmWrite(proc,address,data,false);
  }finally{
    region.protect=oldProtect;
  }
}
function jplopsoft_ntCreateProcessVm(rec){
  var vm={
        model:'EXOS_VMM_V1',
        addressBits:47,
        virtualAddressBytes:jplopsoft_VMM_USER_ADDRESS_BYTES,
        pageSize:jplopsoft_VMM_PAGE_SIZE,
        allocationGranularity:jplopsoft_VMM_ALLOCATION_GRANULARITY,
        regions:[],
        modules:{},
        nextBase:0x100000000,
        reservedBytes:0,
        committedBytes:0,
        sharedImageBytes:0
      },
      image,heapBase,heap,peb,params,banner;
  rec.vm=vm;

  image=jplopsoft_vmmNewRegion(rec,0x00400000,65536,jplopsoft_PAGE_EXECUTE_READ,jplopsoft_MEM_IMAGE,String(rec.imageName||'image'),{ownsCommit:true});
  jplopsoft_vmmCommitRegion(rec,image,image.base,image.size,false);

  heapBase=0x10000000+((Number(rec.pid)||0)%512)*0x00100000;
  heap=jplopsoft_vmmNewRegion(rec,heapBase,262144,jplopsoft_PAGE_READWRITE,jplopsoft_MEM_PRIVATE,'Default Heap',{ownsCommit:true});
  jplopsoft_vmmCommitRegion(rec,heap,heap.base,heap.size,false);

  peb=jplopsoft_vmmNewRegion(rec,0x7FFDF000,4096,jplopsoft_PAGE_READWRITE,jplopsoft_MEM_PRIVATE,'PEB',{ownsCommit:true});
  jplopsoft_vmmCommitRegion(rec,peb,peb.base,peb.size,false);

  params=rec.peb&&rec.peb.processParameters?rec.peb.processParameters:{};
  banner='MZ\u0000\u0000ExOS V8 Image\r\n'+String(rec.imageName||'unknown.exe')+'\r\n';
  jplopsoft_vmmSeed(rec,image.base,jplopsoft_ntUtf8Bytes(banner));
  jplopsoft_vmmSeed(rec,heap.base,jplopsoft_ntUtf8Bytes('EXOS_HEAP1\u0000PID='+String(rec.pid)+'\u0000IMAGE='+String(rec.imageName||'')+'\u0000'));
  jplopsoft_vmmSeed(rec,peb.base,jplopsoft_ntUtf8Bytes('EXOS_PEB1\u0000PID='+String(rec.pid)+'\u0000PPID='+String(rec.ppid)+'\u0000CWD='+String(params.currentDirectory||'')+'\u0000CMD='+String(params.commandLine||'')+'\u0000'));

  vm.heapBase=heapBase;
  vm.heapSize=heap.size;

  /* Every XSH/user process starts with the core user-mode DLL images mapped.
   * They are backed by global IMAGE_SECTION pages, so identical code pages are
   * physically resident only once even though every process sees its own VAS. */
  jplopsoft_vmmRegisterLoadedModule(rec,'ntdll.dll');
  jplopsoft_vmmRegisterLoadedModule(rec,'kernel32.dll');
  jplopsoft_vmmRegisterLoadedModule(rec,'user32.dll');

  return vm;
}
function jplopsoft_ntVmFindRegion(proc,address,size,write){
  var addr=jplopsoft_vmmSafeAddress(address),n=Math.max(0,Number(size)||0),
      region=jplopsoft_vmmFindRegion(proc,addr),end;
  if(!region)return null;
  end=addr+n;
  if(end>Number(region.base)+Number(region.size))return null;
  if(write&&!jplopsoft_vmmProtectWritable(region.protect))return null;
  if(!write&&!jplopsoft_vmmProtectReadable(region.protect))return null;
  return region;
}

function jplopsoft_ntProcessHandleForOwner(ownerPid,handle){
  var raw=Number(handle);
  if(raw===-1&&parseInt(ownerPid,10)>0){
    return{
      handle:-1,
      pid:parseInt(ownerPid,10)||0,
      targetPid:parseInt(ownerPid,10)||0,
      ownerPid:parseInt(ownerPid,10)||0,
      desiredAccess:0xFFFFFFFF,
      inheritHandle:false,
      openedAt:jplopsoft_ntKernelNow(),
      kind:'PROCESS_PSEUDO'
    };
  }
  var h=jplopsoft_NT_KERNEL.processHandles[String(parseInt(handle,10)||0)];
  if(!h)return null;
  if(parseInt(ownerPid,10)>0&&parseInt(h.ownerPid,10)!==parseInt(ownerPid,10))return null;
  return h;
}
function jplopsoft_ntCanOpenProcessForXsh(ctx,target,desiredAccess){
  var self=ctx&&ctx.process?ctx.process:null,mask=Number(desiredAccess)>>>0,vmMask=jplopsoft_PROCESS_VM_READ|jplopsoft_PROCESS_VM_WRITE|jplopsoft_PROCESS_VM_OPERATION;
  if(!self||!target||!target.alive)return{ok:false,status:jplopsoft_STATUS_INVALID_CID,reason:'Process not found.'};
  if(target.pid===self.pid)return{ok:true,status:jplopsoft_STATUS_SUCCESS,reason:''};
  if(target.kernel||target.critical||target.protection==='PPL')return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Protected/kernel process denies cross-process memory access.'};
  if(String(target.username||'').toLowerCase()!==String(self.username||'').toLowerCase())return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Cross-user process access requires a privileged debugger token.'};
  if((mask&vmMask)!==0)return{ok:true,status:jplopsoft_STATUS_SUCCESS,reason:''};
  return{ok:true,status:jplopsoft_STATUS_SUCCESS,reason:''};
}
function jplopsoft_xshOpenProcess(ctx,desiredAccess,inheritHandle,pid){
  var target=jplopsoft_ntKernelProcessByPid(pid),rights,h;
  desiredAccess=Number(desiredAccess)>>>0;
  rights=jplopsoft_ntCanOpenProcessForXsh(ctx,target,desiredAccess);
  if(!rights.ok)throw jplopsoft_xshError(rights.status,rights.reason);
  h=jplopsoft_NT_KERNEL.nextHandle++;
  jplopsoft_NT_KERNEL.processHandles[String(h)]={handle:h,pid:target.pid,targetPid:target.pid,ownerPid:ctx.pid,desiredAccess:desiredAccess,inheritHandle:!!inheritHandle,openedAt:jplopsoft_ntKernelNow(),kind:'PROCESS'};
  return h;
}
function jplopsoft_xshProcessFromOwnedHandle(ctx,handle,requiredAccess){
  var h=jplopsoft_ntProcessHandleForOwner(ctx.pid,handle),p;
  if(!h)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid process handle.');
  if(requiredAccess&&((Number(h.desiredAccess)>>>0)&(Number(requiredAccess)>>>0))!==(Number(requiredAccess)>>>0))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Process handle does not have the required access mask.');
  p=jplopsoft_ntKernelProcessByPid(h.pid);
  if(!p||!p.alive)throw jplopsoft_xshError(jplopsoft_STATUS_PROCESS_IS_TERMINATING,'Target process is not running.');
  return{handle:h,process:p};
}
function jplopsoft_xshNtQueryInformationProcess(ctx,handle,infoClass){
  var x=jplopsoft_xshProcessFromOwnedHandle(ctx,handle,jplopsoft_PROCESS_QUERY_LIMITED_INFORMATION),p=x.process,c=String(infoClass||'');
  if(c==='ProcessBasePriority')return{status:jplopsoft_STATUS_SUCCESS,information:parseInt(p.basePriority,10)||8};
  if(c==='ProcessAffinityMask')return{status:jplopsoft_STATUS_SUCCESS,information:typeof p.affinityMask==='number'?p.affinityMask:15};
  if(c==='ProcessImageFileName')return{status:jplopsoft_STATUS_SUCCESS,information:p.peb&&p.peb.processParameters?String(p.peb.processParameters.imagePathName||''):''};
  if(c==='ProcessCommandLineInformation')return{status:jplopsoft_STATUS_SUCCESS,information:p.peb&&p.peb.processParameters?String(p.peb.processParameters.commandLine||''):''};
  if(c==='ProcessBasicInformation')return{status:jplopsoft_STATUS_SUCCESS,information:{pid:p.pid,ppid:p.ppid,sessionId:p.sessionId,integrity:p.integrity,protection:p.protection,critical:!!p.critical,kernel:!!p.kernel}};
  return{status:jplopsoft_STATUS_INVALID_PARAMETER,information:null};
}
function jplopsoft_xshNtSetInformationProcess(ctx,handle,infoClass,value){
  var x=jplopsoft_xshProcessFromOwnedHandle(ctx,handle,jplopsoft_PROCESS_SET_INFORMATION),p=x.process,c=String(infoClass||''),n;
  if(p.kernel||p.critical||p.protection==='PPL')throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Protected/kernel process settings cannot be modified.');
  if(c==='ProcessBasePriority'){
    n=parseInt(value,10);
    if(!(n>=1&&n<=15))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Base priority must be between 1 and 15.');
    p.basePriority=n;p.dynamicPriority=Math.max(1,Math.min(15,n+(parseInt(p.foregroundBoost,10)||0)));
    return{status:jplopsoft_STATUS_SUCCESS,information:n};
  }
  if(c==='ProcessAffinityMask'){
    n=parseInt(value,10);
    if(!(n>=1&&n<=15))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Affinity mask must be 0x1 through 0xF.');
    p.affinityMask=n;
    return{status:jplopsoft_STATUS_SUCCESS,information:n};
  }
  throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Unsupported process information class: '+c);
}

function jplopsoft_xshReadProcessMemory(ctx,handle,address,size){
  var h=jplopsoft_ntProcessHandleForOwner(ctx.pid,handle),p,n,out,info;
  if(!h)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid process handle.');
  if((h.desiredAccess&jplopsoft_PROCESS_VM_READ)===0)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'PROCESS_VM_READ was not granted.');
  p=jplopsoft_ntKernelProcessByPid(h.pid);
  if(!p||!p.alive)throw jplopsoft_xshError(jplopsoft_STATUS_PROCESS_IS_TERMINATING,'Target process is not running.');
  n=Math.max(0,Math.min(1024*1024,Math.floor(Number(size)||0)));
  if(n<=0)return{address:Number(address)||0,bytes:new Uint8Array(0),bytesRead:0};
  try{
    out=jplopsoft_vmmRead(p,address,n,true);
    info=jplopsoft_vmmVirtualQuery(p,address);
  }catch(e){
    throw jplopsoft_xshError(
      e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_PARTIAL_COPY,
      'ReadProcessMemory failed: '+String(e&&e.message||e)
    );
  }
  return{
    address:Number(address)||0,
    bytes:out,
    bytesRead:out.length,
    region:info
  };
}
function jplopsoft_xshWriteProcessMemory(ctx,handle,address,data){
  var h=jplopsoft_ntProcessHandleForOwner(ctx.pid,handle),p,src,written;
  if(!h)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid process handle.');
  if((h.desiredAccess&jplopsoft_PROCESS_VM_WRITE)===0||(h.desiredAccess&jplopsoft_PROCESS_VM_OPERATION)===0)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'PROCESS_VM_WRITE | PROCESS_VM_OPERATION are required.');
  p=jplopsoft_ntKernelProcessByPid(h.pid);
  if(!p||!p.alive)throw jplopsoft_xshError(jplopsoft_STATUS_PROCESS_IS_TERMINATING,'Target process is not running.');
  if(data instanceof Uint8Array)src=data;
  else if(data instanceof ArrayBuffer)src=new Uint8Array(data);
  else if(Array.isArray(data))src=new Uint8Array(data);
  else if(typeof data==='string')src=jplopsoft_ntUtf8Bytes(data);
  else throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'WriteProcessMemory data must be Uint8Array, ArrayBuffer, byte array, or string.');
  if(src.length>1024*1024)throw jplopsoft_xshError(jplopsoft_STATUS_QUOTA_EXCEEDED,'WriteProcessMemory is limited to 1 MiB per call.');
  try{
    written=jplopsoft_vmmWrite(p,address,src,true);
  }catch(e){
    throw jplopsoft_xshError(
      e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_PARTIAL_COPY,
      'WriteProcessMemory failed: '+String(e&&e.message||e)
    );
  }
  return{address:Number(address)||0,bytesWritten:written};
}
function jplopsoft_xshVirtualQueryEx(ctx,handle,address){
  var h=jplopsoft_ntProcessHandleForOwner(ctx.pid,handle),p;
  if(!h)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid process handle.');
  if((h.desiredAccess&(jplopsoft_PROCESS_QUERY_INFORMATION|jplopsoft_PROCESS_QUERY_LIMITED_INFORMATION|jplopsoft_PROCESS_VM_READ))===0)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Query access was not granted.');
  p=jplopsoft_ntKernelProcessByPid(h.pid);
  if(!p||!p.alive)throw jplopsoft_xshError(jplopsoft_STATUS_PROCESS_IS_TERMINATING,'Target process is not running.');
  return jplopsoft_vmmVirtualQuery(p,address);
}

function jplopsoft_ntKernelRegisterProcess(spec){
  var p=spec||{},pid=parseInt(p.pid,10)||0,key=String(p.key||''),rec,parent=null,peb;

  if(!key)return null;
  if(pid<=0)pid=jplopsoft_ntKernelAllocatePid();

  if(p.parentProcess)parent=p.parentProcess;
  else if(parseInt(p.ppid,10)>0)parent=jplopsoft_NT_KERNEL.processByPid[String(parseInt(p.ppid,10)||0)]||null;

  peb=jplopsoft_ntCreatePeb(pid,p,parent);

  rec={
    key:key,
    pid:pid,
    ppid:parseInt(p.ppid,10)||0,
    imageName:String(p.imageName||'unknown.exe'),
    description:String(p.description||p.imageName||''),
    sessionId:typeof p.sessionId==='number'?p.sessionId:1,
    username:String(p.username||''),
    sid:String(p.sid||''),
    integrity:String(p.integrity||'MEDIUM'),
    protection:String(p.protection||'None'),
    critical:!!p.critical,
    kernel:!!p.kernel,
    autoRestart:!!p.autoRestart,
    systemProcess:!!p.systemProcess,
    logicalThreads:Math.max(1,parseInt(p.logicalThreads,10)||1),
    basePriority:Math.max(1,Math.min(15,parseInt(p.basePriority,10)||8)),
    dynamicPriority:Math.max(1,Math.min(15,parseInt(p.basePriority,10)||8)),
    foregroundBoost:0,
    quantumMs:jplopsoft_NT_SCHEDULER.baseQuantumMs,
    affinityMask:Math.max(1,Math.min(15,parseInt(p.affinityMask,10)||15)),
    lastForegroundAt:0,
    startTime:typeof p.startTime==='number'?p.startTime:jplopsoft_ntKernelNow(),
    exitTime:0,
    exitStatus:0,
    alive:true,
    restartAfter:0,
    hwnds:[],
    appIds:[],
    virtualAddressSpaceId:'VAS-'+String(pid)+'-'+String(jplopsoft_NT_KERNEL.generation),
    addressSpaceIsolation:'PRIVATE',
    accountedMemoryBytes:Math.max(65536,parseInt(p.accountedMemoryBytes,10)||262144),
    sectionViewBytes:0,
    jobObjectId:0,
    jobObjectName:'',
    runtimeHostImage:String(p.runtimeHostImage||''),
    imageFormat:String(p.imageFormat||''),
    imageMachine:String(p.imageMachine||''),
    imageSubsystem:parseInt(p.imageSubsystem,10)||0,
    imageSubsystemName:String(p.imageSubsystemName||''),
    consoleId:0,
    consoleHostPid:0,
    peb:peb,
    generation:jplopsoft_NT_KERNEL.generation++
  };

  rec.vm=jplopsoft_ntCreateProcessVm(rec);
  rec.vmCommittedBytes=rec.vm?parseInt(rec.vm.committedBytes,10)||0:0;
  rec.accountedMemoryBytes=Math.max(rec.accountedMemoryBytes,rec.vmCommittedBytes);
  jplopsoft_NT_KERNEL.processByKey[key]=rec;
  jplopsoft_NT_KERNEL.processByPid[String(pid)]=rec;
  return rec;
}

function jplopsoft_ntKernelEnsureFixed(spec){
  var key=String(spec.key||''),old=jplopsoft_NT_KERNEL.processByKey[key],now=jplopsoft_ntKernelNow();

  if(old&&old.alive)return old;

  if(old&&!old.alive&&old.autoRestart&&old.restartAfter>now){
    return null;
  }

  if(old&&old.pid){
    delete jplopsoft_NT_KERNEL.processByPid[String(old.pid)];
  }

  if(old&&old.autoRestart)spec.pid=0;
  return jplopsoft_ntKernelRegisterProcess(spec);
}

function jplopsoft_ntKernelEnsureCore(){
  var systemUser='NT AUTHORITY\\SYSTEM';

  jplopsoft_ntKernelEnsureFixed({
    key:'core:System',pid:4,imageName:'System',description:'NT Kernel & System',
    ppid:0,sessionId:0,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Kernel',critical:true,kernel:true,
    systemProcess:true,logicalThreads:8
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:smss',pid:100,imageName:'smss.exe',description:'Session Manager Subsystem',
    ppid:4,sessionId:0,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Critical',critical:true,systemProcess:true,
    logicalThreads:2
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:csrss',pid:160,imageName:'csrss.exe',description:'Client Server Runtime Process',
    ppid:100,sessionId:1,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Critical',critical:true,systemProcess:true,
    logicalThreads:4
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:winlogon',pid:220,imageName:'winlogon.exe',description:'ExOS Logon Application',
    ppid:100,sessionId:1,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Critical',critical:true,systemProcess:true,
    logicalThreads:3
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:lsass',pid:280,imageName:'lsass.exe',description:'Local Security Authority Process',
    ppid:4,sessionId:0,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'PPL',critical:true,systemProcess:true,
    logicalThreads:4
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:dwm',pid:340,imageName:'dwm.exe',description:'Desktop Window Manager',
    ppid:220,sessionId:1,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'None',critical:false,systemProcess:true,
    autoRestart:true,logicalThreads:4
  });
}

function jplopsoft_ntWindowRecordRunning(rec){
  var b,w;
  if(!rec||rec.destroying||rec.ntTerminated)return false;
  w=jplopsoft_el(rec.windowId);
  if(rec.dynamic)return !!w;
  if(rec.overlay&&rec.backdropId){b=jplopsoft_el(rec.backdropId);if(b&&b.style.display!=='none'&&b.offsetWidth>0)return true;}
  return !!(w&&w.style.display!=='none'&&!jplopsoft_wmClassHas(w,'jplopsoft_hidden'));
}
function jplopsoft_ntWindowTitle(rec){
  var n,w;
  if(!rec)return'';
  if(rec.titleId){n=jplopsoft_el(rec.titleId);if(n&&jplopsoft_trim(n.textContent||''))return jplopsoft_trim(n.textContent||'');}
  if(rec.title)return String(rec.title);
  w=jplopsoft_el(rec.windowId);
  if(w&&w.querySelector){n=w.querySelector('.jplopsoft_wm-title');if(n&&jplopsoft_trim(n.textContent||''))return jplopsoft_trim(n.textContent||'');}
  return rec.appId||rec.className||('HWND '+rec.hwnd);
}

function jplopsoft_ntKernelProcessKeyForWindow(rec){
  var app=String(rec&&rec.appId||'');

  /* XSH/ConHost/other process-owned USER32 windows always carry their
   * real process key.  Never infer an executable image from an appId. */
  if(rec&&rec.param&&rec.param.ntProcessKey)return String(rec.param.ntProcessKey);

  if(app==='security')return'core:winlogon';

  /* Legacy shell-owned DOM/HWNDs belong to explorer.exe.  Unknown legacy
   * windows are also charged to the shell instead of fabricating exfsapp.exe,
   * control.exe, regedit.exe, mmc.exe, notepad.exe, etc. */
  return'proc:explorer';
}

function jplopsoft_ntKernelImageForWindow(rec){
  var app=String(rec&&rec.appId||'');
  if(rec&&rec.param&&rec.param.ntImageName)return String(rec.param.ntImageName);
  if(app==='security')return'winlogon.exe';
  return'explorer.exe';
}

function jplopsoft_ntKernelDescriptionForWindow(rec){
  var app=String(rec&&rec.appId||'');
  if(rec&&rec.param&&rec.param.ntDescription)return String(rec.param.ntDescription);
  if(app==='security')return'ExOS Logon / Secure Desktop';
  return'ExOS Explorer / Shell-owned legacy window';
}

function jplopsoft_ntKernelAliveByKey(key){
  var p=jplopsoft_NT_KERNEL.processByKey[String(key||'')];
  return p&&p.alive?p:null;
}

function jplopsoft_ntKernelParentPidForWindow(rec){
  var parentKey,p;

  if(rec&&rec.param&&rec.param.ntParentKey){
    parentKey=String(rec.param.ntParentKey);
    p=jplopsoft_ntKernelAliveByKey(parentKey);
    if(p)return p.pid;
  }

  if(jplopsoft_ntKernelProcessKeyForWindow(rec)==='proc:explorer'){
    p=jplopsoft_ntKernelAliveByKey('core:winlogon');
    return p?p.pid:220;
  }

  p=jplopsoft_ntKernelAliveByKey('proc:explorer');
  if(p)return p.pid;

  p=jplopsoft_ntKernelAliveByKey('core:winlogon');
  return p?p.pid:220;
}

function jplopsoft_ntKernelOnWindowActivated(rec){
  var key,p;

  if(!rec||rec.destroying)return null;

  jplopsoft_ntKernelEnsureCore();
  key=jplopsoft_ntKernelProcessKeyForWindow(rec);
  p=jplopsoft_ntKernelAliveByKey(key);

  if(!p&&key==='proc:explorer'){
    p=jplopsoft_ntEnsureExplorerProcess();
  }

  if(!p){
    p=jplopsoft_ntKernelRegisterProcess({
      key:key,
      imageName:jplopsoft_ntKernelImageForWindow(rec),
      description:jplopsoft_ntKernelDescriptionForWindow(rec),
      ppid:jplopsoft_ntKernelParentPidForWindow(rec),
      sessionId:1,
      username:String(state.samUsername||'administrator'),
      sid:String(state.samSid||''),
      integrity:'MEDIUM',
      protection:'None',
      critical:false,
      systemProcess:false,
      logicalThreads:Math.max(1,rec.dynamic?2:1)
    });
  }

  rec.ntPid=p.pid;
  rec.ntTerminated=false;
  return p;
}

function jplopsoft_ntKernelOnWindowDestroyed(rec){
  var p,key;
  if(!rec)return;
  key=jplopsoft_ntKernelProcessKeyForWindow(rec);
  p=jplopsoft_ntKernelAliveByKey(key);
  if(!p)return;

  /*
   * Final liveness is resolved by NtQuerySystemInformation because one process
   * may own several HWNDs (for example explorer.exe owns Explorer, Recycle Bin,
   * Properties and document preview).
   */
  rec.ntPid=0;
}

function jplopsoft_ntKernelWindowIsProcessAlive(rec){
  if(!rec||rec.destroying||rec.ntTerminated)return false;
  return jplopsoft_ntWindowRecordRunning(rec);
}

function jplopsoft_ntKernelSynchronizeWindows(){
  var k,rec,p,key,seen={},pidKey;

  jplopsoft_ntKernelEnsureCore();

  for(k in jplopsoft_USER32.windows){
    if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
    rec=jplopsoft_USER32.windows[k];

    if(!jplopsoft_ntKernelWindowIsProcessAlive(rec))continue;

    p=jplopsoft_ntKernelOnWindowActivated(rec);
    if(!p)continue;

    pidKey=String(p.pid);
    if(!seen[pidKey])seen[pidKey]={hwnds:[],appIds:[]};

    seen[pidKey].hwnds.push(parseInt(rec.hwnd,10)||0);
    if(seen[pidKey].appIds.indexOf(String(rec.appId||''))<0){
      seen[pidKey].appIds.push(String(rec.appId||''));
    }
  }

  for(key in jplopsoft_NT_KERNEL.processByKey){
    if(!jplopsoft_NT_KERNEL.processByKey.hasOwnProperty(key))continue;
    p=jplopsoft_NT_KERNEL.processByKey[key];
    if(!p||!p.alive||p.systemProcess)continue;

    pidKey=String(p.pid);
    if(seen[pidKey]){
      p.hwnds=seen[pidKey].hwnds;
      p.appIds=seen[pidKey].appIds;
      p.logicalThreads=Math.max(1,p.hwnds.length+1);
    }else if(
      p.key==='proc:explorer'&&
      document.body&&
      !jplopsoft_wmClassHas(document.body,'jplopsoft_explorer-process-stopped')
    ){
      p.hwnds=[];
      p.appIds=['explorer'];
      p.logicalThreads=Math.max(2,p.logicalThreads||2);
    }else if(jplopsoft_ntKernelNow()-p.startTime>1000){
      jplopsoft_ntReleaseProcessSections(p.pid);
      jplopsoft_ntCloseAllObjectHandlesForPid(p.pid);
      jplopsoft_ntJobOnProcessExit(p);
      p.alive=false;
      p.exitTime=jplopsoft_ntKernelNow();
      p.exitStatus=0;
      p.hwnds=[];
      p.appIds=[];
      delete jplopsoft_NT_KERNEL.processByPid[pidKey];
    }
  }
}

function jplopsoft_NtQuerySystemInformation(infoClass){
  var rows=[],k,p,now=jplopsoft_ntKernelNow();

  infoClass=String(infoClass||'');

  if(infoClass==='SystemObjectInformation'){
    return{
      status:jplopsoft_STATUS_SUCCESS,
      information:jplopsoft_ntQueryNamedObjects()
    };
  }

  if(infoClass==='SystemPerformanceInformation'){
    var alive=0,threads=0,handles=0,pk,pp,
        vmm=jplopsoft_vmmGlobalStatus(null),
        mem=jplopsoft_vmmGlobalMemoryStatus(null),
        foregroundPid=parseInt(jplopsoft_NT_SCHEDULER.foregroundPid,10)||0,
        dwmSurfaces=jplopsoft_DWM&&jplopsoft_DWM.surfaces?Object.keys(jplopsoft_DWM.surfaces).length:0,
        cpu=0;
    jplopsoft_ntKernelSynchronizeWindows();
    for(pk in jplopsoft_NT_KERNEL.processByKey){
      if(!jplopsoft_NT_KERNEL.processByKey.hasOwnProperty(pk))continue;
      pp=jplopsoft_NT_KERNEL.processByKey[pk];
      if(!pp||!pp.alive)continue;
      alive++;
      threads+=parseInt(pp.logicalThreads,10)||1;
      handles+=jplopsoft_ntObjectHandleCountForPid(pp.pid)+(pp.hwnds?pp.hwnds.length:0);
      cpu+=0.15+(parseInt(pp.logicalThreads,10)||1)*0.08;
      if(pp.pid===foregroundPid)cpu+=5.5;
      if(String(pp.imageName||'').toLowerCase()==='dwm.exe')cpu+=Math.min(4,dwmSurfaces*0.18);
    }
    cpu=Math.max(0,Math.min(100,cpu));
    return{
      status:jplopsoft_STATUS_SUCCESS,
      information:{
        bootTime:jplopsoft_NT_KERNEL.bootTime,
        uptimeMs:Math.max(0,jplopsoft_ntKernelNow()-jplopsoft_NT_KERNEL.bootTime),
        processCount:alive,
        threadCount:threads,
        handleCount:handles,
        logicalProcessors:4,
        cpuUsage:cpu,
        gpuUsage:Math.max(0,Math.min(100,dwmSurfaces*0.8)),
        diskUsage:vmm&&vmm.physicalLimitBytes?Math.max(0,Math.min(100,(Number(vmm.pagefile&&vmm.pagefile.usedBytes)||0)/Math.max(1,Number(vmm.pagefile&&vmm.pagefile.maxBytes)||1)*100)):0,
        networkBytesPerSec:0,
        memory:{
          totalPhys:mem.ullTotalPhys,
          availPhys:mem.ullAvailPhys,
          memoryLoad:mem.dwMemoryLoad,
          totalPageFile:mem.ullTotalPageFile,
          availPageFile:mem.ullAvailPageFile
        },
        vmm:vmm
      }
    };
  }

  if(infoClass!=='SystemProcessInformation'){
    return{status:jplopsoft_STATUS_INVALID_CID,information:[]};
  }

  jplopsoft_ntKernelSynchronizeWindows();

  for(k in jplopsoft_NT_KERNEL.processByKey){
    if(!jplopsoft_NT_KERNEL.processByKey.hasOwnProperty(k))continue;
    p=jplopsoft_NT_KERNEL.processByKey[k];
    if(!p||!p.alive)continue;

    rows.push({
      pid:p.pid,
      ppid:p.ppid,
      imageName:p.imageName,
      description:p.description,
      sessionId:p.sessionId,
      username:p.username,
      sid:p.sid,
      integrity:p.integrity,
      protection:p.protection,
      critical:p.critical?1:0,
      kernel:p.kernel?1:0,
      systemProcess:p.systemProcess?1:0,
      threadCount:p.logicalThreads,
      basePriority:parseInt(p.basePriority,10)||8,
      dynamicPriority:parseInt(p.dynamicPriority,10)||8,
      foregroundBoost:parseInt(p.foregroundBoost,10)||0,
      quantumMs:parseInt(p.quantumMs,10)||jplopsoft_NT_SCHEDULER.baseQuantumMs,
      affinityMask:typeof p.affinityMask==='number'?p.affinityMask:15,
      foreground:(p.pid===jplopsoft_NT_SCHEDULER.foregroundPid)?1:0,
      handleCount:(p.hwnds?p.hwnds.length:0),
      hwnds:p.hwnds?p.hwnds.slice(0):[],
      appIds:p.appIds?p.appIds.slice(0):[],
      uptimeMs:Math.max(0,now-p.startTime),
      virtualAddressSpaceId:String(p.virtualAddressSpaceId||''),
      addressSpaceIsolation:String(p.addressSpaceIsolation||''),
      accountedMemoryBytes:
        (parseInt(p.accountedMemoryBytes,10)||0)+
        (parseInt(p.sectionViewBytes,10)||0),
      sectionViewBytes:parseInt(p.sectionViewBytes,10)||0,
      vmm:typeof jplopsoft_vmmProcessStatus==='function'
        ?jplopsoft_vmmProcessStatus(p)
        :null,
      jobObjectId:parseInt(p.jobObjectId,10)||0,
      jobObjectName:String(p.jobObjectName||''),
      imageFormat:String(p.imageFormat||''),
      imageMachine:String(p.imageMachine||''),
      imageSubsystem:parseInt(p.imageSubsystem,10)||0,
      imageSubsystemName:String(p.imageSubsystemName||''),
      consoleId:parseInt(p.consoleId,10)||0,
      consoleHostPid:parseInt(p.consoleHostPid,10)||0,
      objectHandleCount:jplopsoft_ntObjectHandleCountForPid(p.pid),
      pebId:p.peb?String(p.peb.id||''):'',
      environmentCount:p.peb&&p.peb.processParameters
        ?jplopsoft_ntEnvironmentCount(p.peb.processParameters.environment)
        :0,
      currentDirectory:p.peb&&p.peb.processParameters
        ?String(p.peb.processParameters.currentDirectory||'')
        :'',
      imagePathName:p.peb&&p.peb.processParameters
        ?String(p.peb.processParameters.imagePathName||'')
        :'',
      commandLine:p.peb&&p.peb.processParameters
        ?String(p.peb.processParameters.commandLine||'')
        :'',
      generation:p.generation
    });
  }

  rows.sort(function(a,b){return a.pid-b.pid;});
  return{status:jplopsoft_STATUS_SUCCESS,information:rows};
}

function jplopsoft_ntKernelProcessByPid(pid){
  return jplopsoft_NT_KERNEL.processByPid[String(parseInt(pid,10)||0)]||null;
}

function jplopsoft_ntCanTerminateProcess(p){
  if(!p||!p.alive)return{ok:false,status:jplopsoft_STATUS_INVALID_CID,reason:'處理程序不存在。'};
  if(p.kernel)return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Kernel process 不能由使用者模式終止。'};
  if(p.protection==='PPL')return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Protected Process Light 拒絕終止要求。'};
  if(p.critical)return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Critical process 受到 NT 系統完整性保護。'};
  return{ok:true,status:jplopsoft_STATUS_SUCCESS,reason:''};
}

function jplopsoft_OpenProcess(desiredAccess,inheritHandle,pid){
  var p=jplopsoft_ntKernelProcessByPid(pid),rights=jplopsoft_ntCanTerminateProcess(p),h;

  if(!p||!p.alive){
    return{status:jplopsoft_STATUS_INVALID_CID,handle:0};
  }

  if((desiredAccess&jplopsoft_PROCESS_TERMINATE)!==0&&!rights.ok){
    return{status:rights.status,handle:0,reason:rights.reason};
  }

  h=jplopsoft_NT_KERNEL.nextHandle++;
  jplopsoft_NT_KERNEL.processHandles[String(h)]={
    handle:h,
    pid:p.pid,
    desiredAccess:desiredAccess,
    ownerPid:0,
    kind:'PROCESS',
    openedAt:jplopsoft_ntKernelNow()
  };

  return{status:jplopsoft_STATUS_SUCCESS,handle:h};
}

function jplopsoft_NtClose(handle){
  handle=parseInt(handle,10)||0;
  if(!jplopsoft_NT_KERNEL.processHandles[String(handle)])return jplopsoft_STATUS_INVALID_HANDLE;
  delete jplopsoft_NT_KERNEL.processHandles[String(handle)];
  return jplopsoft_STATUS_SUCCESS;
}

function jplopsoft_ntForceHideWindow(rec){
  var w,b;

  if(!rec)return;

  rec.ntTerminated=true;
  rec.ntPid=0;

  w=jplopsoft_el(rec.windowId);
  b=rec.backdropId?jplopsoft_el(rec.backdropId):null;

  if(rec.dynamic){
    jplopsoft_DestroyWindow(rec.hwnd);
    return;
  }

  if(b)b.style.display='none';
  if(w)w.style.display='none';

  if(rec.appId)jplopsoft_taskbarRemoveApp(rec.appId);

  if(rec.appId==='security')state.securityScreenOpen=false;
}

function jplopsoft_ntForceTerminateProcessObject(p,exitStatus){
  var i,hwnds,rec,key,consoleSession;

  if(!p||!p.alive)return jplopsoft_STATUS_INVALID_CID;

  if(String(p.key||'').indexOf('proc:xsh:')===0){
    jplopsoft_xshTerminateByPid(p.pid,'NtTerminateProcess',true);
  }

  if(String(p.imageName||'').toLowerCase()==='conhost.exe'){
    consoleSession=jplopsoft_xshConsoleByHostPid(p.pid);

    if(consoleSession){
      jplopsoft_xshConsoleCloseSession(
        consoleSession,
        'ConhostTerminated'
      );
    }
  }

  hwnds=p.hwnds?p.hwnds.slice(0):[];

  /*
   * No WM_CLOSE is sent here.  The process object is torn down directly,
   * matching the semantic difference between closing a window and
   * NtTerminateProcess.
   */
  for(i=0;i<hwnds.length;i++){
    rec=jplopsoft_user32GetRecord(hwnds[i]);
    if(rec)jplopsoft_ntForceHideWindow(rec);
  }

  jplopsoft_ntReleaseProcessSections(p.pid);
  jplopsoft_ntCloseAllObjectHandlesForPid(p.pid);
  if(typeof jplopsoft_vmmReleaseProcess==='function'){
    jplopsoft_vmmReleaseProcess(p);
  }
  jplopsoft_ntJobOnProcessExit(p);

  p.alive=false;
  p.exitTime=jplopsoft_ntKernelNow();
  p.exitStatus=Number(exitStatus)||0;
  delete jplopsoft_NT_KERNEL.processByPid[String(p.pid)];

  if(p.key==='proc:explorer'){
    jplopsoft_setBodyClassToken('jplopsoft_explorer-process-stopped',true);
  }

  if(p.key==='core:dwm'){
    p.restartAfter=jplopsoft_ntKernelNow()+800;
  }

  return jplopsoft_STATUS_SUCCESS;
}

function jplopsoft_NtTerminateProcess(handle,exitStatus){
  var h=jplopsoft_NT_KERNEL.processHandles[String(parseInt(handle,10)||0)],
      p,rights,status;

  if(!h)return jplopsoft_STATUS_INVALID_HANDLE;
  if((h.desiredAccess&jplopsoft_PROCESS_TERMINATE)===0)return jplopsoft_STATUS_ACCESS_DENIED;

  p=jplopsoft_ntKernelProcessByPid(h.pid);
  if(!p||!p.alive)return jplopsoft_STATUS_PROCESS_IS_TERMINATING;

  rights=jplopsoft_ntCanTerminateProcess(p);
  if(!rights.ok)return rights.status;

  status=jplopsoft_ntForceTerminateProcessObject(p,exitStatus);

  if(status===jplopsoft_STATUS_SUCCESS&&p.key==='core:dwm'){
    window.setTimeout(function(){
      jplopsoft_ntKernelEnsureCore();
    },850);
  }

  return status;
}

function jplopsoft_ntProcessWindowRecords(p){
  var out=[],i,rec;
  if(!p||!p.hwnds)return out;
  for(i=0;i<p.hwnds.length;i++){
    rec=jplopsoft_user32GetRecord(p.hwnds[i]);
    if(rec&&!rec.ntTerminated)out.push(rec);
  }
  return out;
}


/* =========================================================================
 * XSH Sandbox Runtime (.xsh) - os38
 *
 * .xsh is an EXOS_XSH_PE_V1 executable image: a PE-inspired text header
 * declares Machine / Subsystem / EntryPoint, followed by JavaScript code.
 * The code is NOT evaluated in the ExOS host
 * window. Each executable runs in a sandboxed, opaque-origin iframe with a
 * private MessageChannel capability broker. CSP blocks network, external
 * scripts, images, media, workers, objects and forms. The sandbox has no
 * same-origin privilege to the ExOS DOM.
 *
 * The NT / Ring 0 / IRP / Driver / HAL layers below are ExOS emulation. They
 * model the call path and enforce ExFS/EXES capabilities; browser JavaScript
 * cannot enter the host operating system's real Ring 0 or access host DMA.
 * ========================================================================= */
var jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND=0xC0000034;
var jplopsoft_STATUS_OBJECT_NAME_COLLISION=0xC0000035;
var jplopsoft_STATUS_INVALID_PARAMETER=0xC000000D;
var jplopsoft_STATUS_NOT_SUPPORTED=0xC00000BB;
var jplopsoft_STATUS_DISK_FULL=0xC000007F;

var jplopsoft_IMAGE_SUBSYSTEM_UNKNOWN=0;
var jplopsoft_IMAGE_SUBSYSTEM_NATIVE=1;
var jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_GUI=2;
var jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI=3;
var jplopsoft_XSH_IMAGE_FORMAT='EXOS_XSH_PE_V1';
var jplopsoft_XSH_IMAGE_MACHINE='EXOS_IMAGE_FILE_MACHINE_V8';

var jplopsoft_XSH={
  version:'XSH4',
  runs:{},
  byPid:{},
  builtinByApp:{},
  consoleSessions:{},
  runSeq:0,
  irpSeq:0,
  consoleSeq:0,
  maxSourceBytes:2*1024*1024,
  maxIoBytes:18*1024*1024,
  systemVdo:{
    drive:'C',
    deviceName:'\\Device\\ExFSVdo0',
    symbolicLink:'\\DosDevices\\C:',
    label:'ExFS',
    filesystem:'ExFS',
    encryption:'ExES V6 / X60',
    backingStore:'PHP /_exfs/',
    bridge:'PhpExfsBridge.sys',
    mounted:true
  }
};

function jplopsoft_xshStatusName(status){
  status=Number(status)>>>0;
  if(status===(jplopsoft_STATUS_SUCCESS>>>0))return'STATUS_SUCCESS';
  if(status===(jplopsoft_STATUS_ACCESS_DENIED>>>0))return'STATUS_ACCESS_DENIED';
  if(status===(jplopsoft_STATUS_INVALID_HANDLE>>>0))return'STATUS_INVALID_HANDLE';
  if(status===(jplopsoft_STATUS_INVALID_PARAMETER>>>0))return'STATUS_INVALID_PARAMETER';
  if(status===(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND>>>0))return'STATUS_OBJECT_NAME_NOT_FOUND';
  if(status===(jplopsoft_STATUS_OBJECT_NAME_COLLISION>>>0))return'STATUS_OBJECT_NAME_COLLISION';
  if(status===(jplopsoft_STATUS_NOT_SUPPORTED>>>0))return'STATUS_NOT_SUPPORTED';
  if(status===(jplopsoft_STATUS_DISK_FULL>>>0))return'STATUS_DISK_FULL';
  if(status===(jplopsoft_STATUS_QUOTA_EXCEEDED>>>0))return'STATUS_QUOTA_EXCEEDED';
  if(status===(jplopsoft_STATUS_CANCELLED>>>0))return'STATUS_CANCELLED';
  if(status===(jplopsoft_STATUS_TIMEOUT>>>0))return'STATUS_TIMEOUT';
  return jplopsoft_ntStatusName(status);
}

function jplopsoft_xshError(status,message){
  var e=new Error(String(message||jplopsoft_xshStatusName(status)));
  e.ntstatus=Number(status)>>>0;
  e.statusName=jplopsoft_xshStatusName(status);
  return e;
}


function jplopsoft_xshSubsystemName(value){
  value=parseInt(value,10)||0;

  if(value===jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_GUI){
    return'IMAGE_SUBSYSTEM_WINDOWS_GUI';
  }

  if(value===jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI){
    return'IMAGE_SUBSYSTEM_WINDOWS_CUI';
  }

  if(value===jplopsoft_IMAGE_SUBSYSTEM_NATIVE){
    return'IMAGE_SUBSYSTEM_NATIVE';
  }

  return'IMAGE_SUBSYSTEM_UNKNOWN';
}

function jplopsoft_xshSubsystemValue(value){
  var s=String(value===undefined?'':value).trim().toUpperCase(),
      n;

  if(s==='IMAGE_SUBSYSTEM_WINDOWS_GUI'||s==='WINDOWS_GUI'||s==='GUI'){
    return jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_GUI;
  }

  if(s==='IMAGE_SUBSYSTEM_WINDOWS_CUI'||s==='WINDOWS_CUI'||s==='CUI'){
    return jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI;
  }

  if(/^[0-9]+$/.test(s)){
    n=parseInt(s,10)||0;

    if(
      n===jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_GUI||
      n===jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI
    ){
      return n;
    }
  }

  return jplopsoft_IMAGE_SUBSYSTEM_UNKNOWN;
}

function jplopsoft_xshNormalizeEmbeddedIcon(value){
  var s=String(value||'').trim(),r;
  if(!s)return'';
  if(/^res:\/\//i.test(s)){
    r=typeof jplopsoft_shareResResolve==='function'?jplopsoft_shareResResolve(s,'shell32.dll'):null;
    return r?String(r.token||s):'';
  }
  if(s.length>262144)return'';
  if(/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z0-9+\/=]+$/i.test(s))return s;
  return'';
}

function jplopsoft_xshParseImage(source,imagePath){
  var raw=String(source||''),
      m,lines,fields={},i,line,pos,key,value,subsystem,entry,
      prefixLen;

  if(raw.charCodeAt(0)===0xFEFF){
    raw=raw.substring(1);
  }

  m=/^\s*\/\*EXOS_XSH_PE_V1(?:\r?\n)([\s\S]*?)\*\/(?:\r?\n)?/.exec(raw);

  if(!m){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Invalid XSH executable image: missing EXOS_XSH_PE_V1 header.'
    );
  }

  lines=String(m[1]||'').split(/\r?\n/);

  for(i=0;i<lines.length;i++){
    line=String(lines[i]||'').trim();

    if(!line)continue;

    pos=line.indexOf('=');

    if(pos<=0){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Invalid XSH image-header field.'
      );
    }

    key=line.substring(0,pos).trim();
    value=line.substring(pos+1).trim();

    if(!/^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(key)){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Invalid XSH image-header key.'
      );
    }

    fields[key]=value;
  }

  if(
    String(fields.Machine||'').toUpperCase()!==
    jplopsoft_XSH_IMAGE_MACHINE
  ){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'Unsupported XSH image Machine. Expected '+jplopsoft_XSH_IMAGE_MACHINE+'.'
    );
  }

  subsystem=jplopsoft_xshSubsystemValue(fields.Subsystem);

  if(
    subsystem!==jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_GUI&&
    subsystem!==jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI
  ){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'XSH supports IMAGE_SUBSYSTEM_WINDOWS_GUI or IMAGE_SUBSYSTEM_WINDOWS_CUI.'
    );
  }

  entry=String(fields.EntryPoint||'main');

  if(entry!=='main'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'XSH V1 supports EntryPoint=main only.'
    );
  }

  prefixLen=m[0].length;

  return{
    format:jplopsoft_XSH_IMAGE_FORMAT,
    machine:jplopsoft_XSH_IMAGE_MACHINE,
    subsystem:subsystem,
    subsystemName:jplopsoft_xshSubsystemName(subsystem),
    subsystemVersion:String(fields.SubsystemVersion||'1.0'),
    entryPoint:entry,
    characteristics:String(
      fields.Characteristics||
      'EXECUTABLE_IMAGE|SANDBOXED'
    ),
    minimumEngine:String(fields.MinimumEngine||'V8'),
    icon:jplopsoft_xshNormalizeEmbeddedIcon(fields.Icon||fields.IconData||''),
    imagePath:String(imagePath||'program.xsh'),
    headerBytes:prefixLen,
    code:raw.substring(prefixLen)
  };
}

function jplopsoft_xshPeHeaderForProcess(image){
  var x=image||{};

  return{
    format:String(x.format||jplopsoft_XSH_IMAGE_FORMAT),
    machine:String(x.machine||jplopsoft_XSH_IMAGE_MACHINE),
    subsystem:parseInt(x.subsystem,10)||0,
    subsystemName:String(x.subsystemName||''),
    subsystemVersion:String(x.subsystemVersion||'1.0'),
    entryPoint:String(x.entryPoint||'main'),
    characteristics:String(x.characteristics||''),
    minimumEngine:String(x.minimumEngine||'V8'),
    icon:String(x.icon||''),
    headerBytes:parseInt(x.headerBytes,10)||0
  };
}


function jplopsoft_xshApiPromise(api,method,payload){
  return new Promise(function(resolve,reject){
    jplopsoft_api(api,method,payload,true,function(err,out){
      if(err)reject(err);else resolve(out||{});
    });
  });
}

function jplopsoft_xshReloadNodes(){
  return new Promise(function(resolve){jplopsoft_reloadNodes(function(){resolve(true);});});
}

function jplopsoft_xshRunByPid(pid){
  return jplopsoft_XSH.byPid[String(parseInt(pid,10)||0)]||null;
}

function jplopsoft_xshAppendConsole(ctx,text,level){
  var pre,line,span;
  if(!ctx)return;
  pre=document.getElementById(ctx.consoleId);
  line=String(text===undefined?'':text);
  if(pre){
    span=document.createElement('span');
    if(level==='error')span.className='jplopsoft_xsh-error';
    else if(level==='warn')span.className='jplopsoft_xsh-warn';
    else if(level==='info')span.className='jplopsoft_xsh-info';
    span.textContent=line+'\n';
    pre.appendChild(span);
    pre.scrollTop=pre.scrollHeight;
  }
}

function jplopsoft_xshSetStatus(ctx,text){
  var n;
  if(!ctx)return;
  n=document.getElementById(ctx.statusId);
  if(n)n.textContent=String(text||'');
}

function jplopsoft_xshBeginIrp(ctx,win32Api,nativeApi,major,path,device){
  var irp={
    id:'IRP-'+(++jplopsoft_XSH.irpSeq),
    pid:ctx?ctx.pid:0,
    createdAt:(new Date()).getTime(),
    win32Api:String(win32Api||''),
    nativeApi:String(nativeApi||''),
    majorFunction:String(major||''),
    path:String(path||''),
    device:String(device||''),
    status:jplopsoft_STATUS_SUCCESS,
    completed:false,
    stages:[]
  };
  if(ctx){
    ctx.irpTrace.push(irp);
    while(ctx.irpTrace.length>120)ctx.irpTrace.shift();
  }
  jplopsoft_xshIrpStage(irp,'USER_MODE',String(win32Api||nativeApi||'API'),'Request');
  if(nativeApi)jplopsoft_xshIrpStage(irp,'NTDLL',String(nativeApi),'Native API');
  jplopsoft_xshIrpStage(irp,'SYSCALL','SSDT','ExOS emulated system-service dispatch');
  jplopsoft_xshIrpStage(irp,'IO_MANAGER','IoAllocateIrp',String(major||''));
  return irp;
}

function jplopsoft_xshIrpStage(irp,layer,driver,action,detail){
  if(!irp)return;
  irp.stages.push({
    t:(new Date()).getTime()-irp.createdAt,
    layer:String(layer||''),
    driver:String(driver||''),
    action:String(action||''),
    detail:detail===undefined?'':String(detail)
  });
}

function jplopsoft_xshCompleteIrp(irp,status){
  if(!irp)return;
  irp.status=Number(status)>>>0;
  irp.statusName=jplopsoft_xshStatusName(status);
  irp.completed=true;
  irp.completedAt=(new Date()).getTime();
  jplopsoft_xshIrpStage(irp,'IO_MANAGER','IoCompleteRequest',irp.statusName);
}

function jplopsoft_xshSystemVdoInfo(){
  var v=jplopsoft_XSH.systemVdo;
  return{drive:v.drive,deviceName:v.deviceName,symbolicLink:v.symbolicLink,label:v.label,filesystem:v.filesystem,encryption:v.encryption,backingStore:v.backingStore,bridge:v.bridge,mounted:!!v.mounted,hostDiskExposed:false,extraMountedVolumes:0};
}
function jplopsoft_xshDriverStackForPath(path){
  var p=String(path||''),drive=(/^([A-Za-z]):/.exec(p)||[])[1],table;
  drive=drive?drive.toUpperCase():'C';
  table=(typeof jplopsoft_xshDosDeviceTable==='function')?jplopsoft_xshDosDeviceTable():{};
  if(drive!=='C'&&!table[drive])return['IopRejectNonSystemVolume'];
  return drive==='C'
    ?['ExFSFsd.sys','ExesFlt.sys','ExFSVdo.sys','PhpExfsBridge.sys','HAL']
    :['DosDevices.sys','ExFSFsd.sys','ExesFlt.sys','ExFSVdo.sys','PhpExfsBridge.sys','HAL'];
}
function jplopsoft_xshTraceDownStack(irp,path,op){
  var stack=jplopsoft_xshDriverStackForPath(path),i,driver;
  for(i=0;i<stack.length;i++){
    driver=stack[i];
    if(driver==='IopRejectNonSystemVolume')jplopsoft_xshIrpStage(irp,'IO_MANAGER',driver,'STATUS_NO_SUCH_DEVICE','The DOS device is not defined in the ExOS session.');
    else if(driver==='DosDevices.sys')jplopsoft_xshIrpStage(irp,'IO_MANAGER',driver,'RESOLVE_SUBST','Resolve \??\ drive alias into the C: ExFS namespace');
    else if(driver==='ExFSFsd.sys')jplopsoft_xshIrpStage(irp,'FSD',driver,'MAP_FILE_OBJECT','Resolve C: path into ExFS namespace');
    else if(driver==='ExesFlt.sys')jplopsoft_xshIrpStage(irp,'FILTER',driver,'PRE_'+op,'ExES FEK/content encryption boundary');
    else if(driver==='ExFSVdo.sys')jplopsoft_xshIrpStage(irp,'VDO',driver,'REDIRECT_BACKING_VDO','\\Device\\ExFSVdo0 -> PHP /_exfs/');
    else if(driver==='PhpExfsBridge.sys')jplopsoft_xshIrpStage(irp,'PORT',driver,'SUBMIT_PHP_IO','exos.php API bridges the IRP to server-side /_exfs/ backing storage');
    else if(driver==='HAL')jplopsoft_xshIrpStage(irp,'HAL','HAL','VIRTUAL_IO_COMPLETE','No host DMA/physical disk is exposed to the sandbox');
  }
}
function jplopsoft_xshTraceReadComplete(irp,path){
  if(String(path||'').charAt(0).toUpperCase()==='C')jplopsoft_xshIrpStage(irp,'FILTER','ExesFlt.sys','POST_READ_DECRYPT','Plaintext returned after PHP /_exfs/ VDO read');
}

function jplopsoft_xshNormalizeSlashes(path){
  return String(path||'').replace(/\//g,'\\').replace(/\\{2,}/g,'\\');
}

function jplopsoft_xshPathSpec(ctx,path){
  var raw=String(path||''),m,drive,rest,explicitDrive=false,absolute=false;
  if(/^\\\.\\Exes$/i.test(raw)||/^\\.\\Exes$/i.test(raw))return{kind:'exes-device',path:'\\\\.\\Exes'};
  raw=jplopsoft_xshNormalizeSlashes(raw);
  m=/^([A-Za-z]):(.*)$/.exec(raw);
  if(m){
    explicitDrive=true;drive=m[1].toUpperCase();rest=m[2]||'\\';
  }else{
    drive=String(ctx.currentDrive||'C').toUpperCase();rest=raw;
  }
  if(rest==='')rest='\\';
  absolute=rest.charAt(0)==='\\';
  var requestedDrive=drive,map=(typeof jplopsoft_xshDosDeviceTable==='function')?jplopsoft_xshDosDeviceTable():{};
  if(drive!=='C'&&map[drive]){
    if(absolute||explicitDrive){
      var mapped=String(map[drive]||'C:\\').replace(/\\+$/,'');
      var combined=mapped+(absolute?rest:'\\'+rest);
      var mm=/^C:(.*)$/i.exec(combined);
      if(mm){drive='C';rest=mm[1]||'\\';}
    }else{
      /* A plain relative path while the process is already on a SUBST drive
       * starts from that process' current directory node. */
      drive='C';
    }
  }
  return{kind:drive==='C'?'exfs':'unsupported-volume',drive:requestedDrive,physicalDrive:drive,rest:rest,explicitDrive:explicitDrive,absolute:absolute,path:requestedDrive+':'+(m?m[2]||'\\':rest)};
}

function jplopsoft_xshFindChildRaw(parentId,name,type){
  var a=jplopsoft_childrenOf(parentId),i,n,plain,want=String(name||'').toLowerCase();
  for(i=0;i<a.length;i++){
    n=a[i];
    if(type&&n.type!==type)continue;
    plain=jplopsoft_decName(n);
    if(plain!==null&&plain.toLowerCase()===want)return n;
  }
  return null;
}
function jplopsoft_xshFindChild(parentId,name,type){
  var n=jplopsoft_xshFindChildRaw(parentId,name,type);
  return n?jplopsoft_resolveClientNode(n):null;
}

function jplopsoft_xshResolveC(ctx,path,wantParent,noFollowFinal){
  var spec=jplopsoft_xshPathSpec(ctx,path),rest,current,parts,i,part,n,lastName='';
  if(spec.kind!=='exfs')return null;
  rest=spec.rest;
  current=/^\\/.test(rest)?0:(parseInt(ctx.currentDirectoryNodeId,10)||0);
  parts=rest.split(/\\+/);
  for(i=0;i<parts.length;i++){
    part=parts[i];
    if(!part||part==='.')continue;
    if(part==='..'){
      if(current!==0){n=jplopsoft_findNode(current);current=n?parseInt(n.parent_id,10)||0:0;}
      continue;
    }
    if(wantParent){
      var hasLater=false,j;
      for(j=i+1;j<parts.length;j++)if(parts[j]&&parts[j]!=='.'){hasLater=true;break;}
      if(!hasLater){lastName=part;return{parentId:current,name:lastName};}
    }
    var finalPart=true,k;
    for(k=i+1;k<parts.length;k++)if(parts[k]&&parts[k]!=='.'){finalPart=false;break;}
    n=(noFollowFinal&&finalPart)
      ?jplopsoft_xshFindChildRaw(current,part,null)
      :jplopsoft_xshFindChild(current,part,null);
    if(!n)return null;
    if(!finalPart&&n.type!=='folder')return null;
    current=parseInt(n.id,10)||0;
  }
  return current===0?{root:true,id:0,type:'folder'}:jplopsoft_findNode(current);
}

function jplopsoft_xshValidLeafName(name){
  name=String(name||'');
  return !!(name&&name.length<=120&&!/[\\\/:*?"<>|]/.test(name)&&name!=='.'&&name!=='..');
}

function jplopsoft_xshUtf8Encode(text){return new TextEncoder().encode(String(text||''));}
function jplopsoft_xshUtf8Decode(bytes){return new TextDecoder('utf-8').decode(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]));}
function jplopsoft_xshBytesToArray(bytes){return Array.prototype.slice.call(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]));}

function jplopsoft_xshNormalizeBytes(data){
  var tag,bytes,i,a;

  if(data===undefined||data===null){
    return new Uint8Array(0);
  }

  tag=Object.prototype.toString.call(data);

  if(
    data instanceof Uint8Array||
    tag==='[object Uint8Array]'
  ){
    return new Uint8Array(
      data.buffer.slice(
        data.byteOffset||0,
        (data.byteOffset||0)+data.byteLength
      )
    );
  }

  if(
    tag==='[object ArrayBuffer]'||
    (
      typeof ArrayBuffer!=='undefined'&&
      data instanceof ArrayBuffer
    )
  ){
    return new Uint8Array(
      data.slice(0)
    );
  }

  if(
    typeof ArrayBuffer!=='undefined'&&
    ArrayBuffer.isView&&
    ArrayBuffer.isView(data)
  ){
    return new Uint8Array(
      data.buffer.slice(
        data.byteOffset||0,
        (data.byteOffset||0)+data.byteLength
      )
    );
  }

  if(
    data&&
    typeof data==='object'&&
    String(data.encoding||'').toLowerCase()==='base64'&&
    typeof data.data==='string'
  ){
    if(
      window.base64&&
      window.base64.decode&&
      typeof window.base64.decode.bytes==='function'
    ){
      bytes=window.base64.decode.bytes(data.data);

      return bytes instanceof Uint8Array
        ?bytes
        :new Uint8Array(bytes||[]);
    }

    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'Base64 byte decoder is unavailable.'
    );
  }

  if(tag==='[object Array]'){
    return new Uint8Array(data);
  }

  if(
    data&&
    typeof data==='object'&&
    typeof data.length==='number'
  ){
    a=[];

    for(i=0;i<data.length;i++){
      a.push(Number(data[i])&255);
    }

    return new Uint8Array(a);
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_INVALID_PARAMETER,
    'WriteFile requires ArrayBuffer, TypedArray, byte array, string, or Base64 byte payload.'
  );
}

async function jplopsoft_xshReadNodeBytes(node,accessPurpose){
  accessPurpose=String(accessPurpose||'').toUpperCase();

  var out=await new Promise(function(resolve,reject){
    /*
     * os68:
     * MOTW is not removed.  Two kernel-mediated read purposes are exposed:
     *
     *   IMAGE_LOAD   - loader may read a Zone.Identifier-marked .xsh image
     *                  before the child process exists.
     *   XSH_SANDBOX - a Low Integrity XSH process may read its data/image
     *                  dependencies through the sandbox broker.
     *
     * Ordinary UI reads still use an empty purpose and remain subject to the
     * regular MOTW policy.
     */
    jplopsoft_fetchNodeContent(
      node.id,
      function(err,o){
        if(err)reject(err);
        else resolve(o);
      },
      null,
      accessPurpose
    );
  }),fmt=jplopsoft_fileFormatFromName(jplopsoft_decName(node)||''),plain,fek;
  fek=jplopsoft_nodeFekById(node.id);
  if(jplopsoft_binaryFormat(fmt)){
    plain=jplopsoft_decBinaryCipher(out.content_enc,fek);
    if(plain===null)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Binary content decrypt failed.');
    return new Uint8Array(plain);
  }
  plain=jplopsoft_decContentCipher(out.content_enc,fek);
  if(plain===null)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Text content decrypt failed.');
  return jplopsoft_xshUtf8Encode(plain);
}

async function jplopsoft_xshWriteNodeBytes(node,bytes){
  var fmt=jplopsoft_fileFormatFromName(jplopsoft_decName(node)||''),fek=jplopsoft_nodeFekById(node.id),cipher,plainSize;
  bytes=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);
  plainSize=bytes.length;
  if(jplopsoft_binaryFormat(fmt))cipher=jplopsoft_encBinaryBytes(bytes,fek);
  else cipher=jplopsoft_encContent(jplopsoft_xshUtf8Decode(bytes),fek);
  await new Promise(function(resolve,reject){
    jplopsoft_saveNodeCipher(node.id,cipher,plainSize,function(err,out){if(err)reject(err);else resolve(out);});
  });
  await jplopsoft_xshReloadNodes();
  return true;
}

async function jplopsoft_xshCreateCNode(ctx,path,type){
  var parent=jplopsoft_xshResolveC(ctx,path,true),name,fek='',wrap='',content='',fmt,out;
  if(!parent)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Parent path not found.');
  name=parent.name;
  if(!jplopsoft_xshValidLeafName(name))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Invalid file name.');
  if(jplopsoft_xshFindChild(parent.parentId,name,null))throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_COLLISION,'Object already exists.');
  if(!jplopsoft_isWritableProfileFolder(parent.parentId))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'XSH can create objects only inside the current user profile or writable Public folders.');
  if(type==='file'){
    fek=jplopsoft_newFek();wrap=jplopsoft_wrapFek(fek);fmt=jplopsoft_fileFormatFromName(name);
    content=jplopsoft_binaryFormat(fmt)?jplopsoft_encBinaryBytes(new Uint8Array(0),fek):jplopsoft_encContent('',fek);
  }
  out=await jplopsoft_xshApiPromise('create','POST',{
    parent_id:parent.parentId,type:type,name_enc:jplopsoft_encName(name),content_enc:content,fek_wrap:wrap,original_size:0
  });
  await jplopsoft_xshReloadNodes();
  return jplopsoft_findNode(parseInt(out.id,10)||0);
}

function jplopsoft_xshAllocateHandle(ctx,rec){
  var h=ctx.nextHandle++;
  rec.handle=h;ctx.handles[String(h)]=rec;return h;
}
function jplopsoft_xshHandle(ctx,h){return ctx.handles[String(parseInt(h,10)||0)]||null;}

/*
 * os79 — anonymous byte-stream pipes and replaceable standard handles.
 *
 * Pipe objects live only in the ExOS host/kernel. XSH applications receive
 * ordinary numeric HANDLE values through RPC. CMD swaps these handles in the
 * process parameters exactly where Windows STARTUPINFO would expose
 * hStdInput / hStdOutput / hStdError.
 */
var jplopsoft_XSH_PIPE_MAX_BYTES=16*1024*1024;

function jplopsoft_xshCreatePipe(ctx){
  var pipe={
        data:[],
        readClosed:false,
        writeClosed:false,
        createdAt:(new Date()).getTime()
      },
      readHandle=jplopsoft_xshAllocateHandle(
        ctx,
        {
          kind:'pipe-read',
          path:'\\Device\\NamedPipe\\ExOSAnonymous',
          access:{read:true,write:false},
          position:0,
          pipe:pipe
        }
      ),
      writeHandle=jplopsoft_xshAllocateHandle(
        ctx,
        {
          kind:'pipe-write',
          path:'\\Device\\NamedPipe\\ExOSAnonymous',
          access:{read:false,write:true},
          position:0,
          pipe:pipe
        }
      );

  return{
    readHandle:readHandle,
    writeHandle:writeHandle
  };
}

function jplopsoft_xshStdHandleField(which){
  which=parseInt(which,10)||0;
  if(which===-10)return'standardInputHandle';
  if(which===-11)return'standardOutputHandle';
  if(which===-12)return'standardErrorHandle';
  return'';
}

function jplopsoft_xshGetStdHandleValue(ctx,which){
  var field=jplopsoft_xshStdHandleField(which),
      pp,value;

  if(!field)return 0;

  pp=
    ctx&&ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters
      ?ctx.process.peb.processParameters
      :null;

  value=pp?parseInt(pp[field],10)||0:0;

  if(value)return value;

  return jplopsoft_xshConsoleForProcess(ctx)
    ?(parseInt(which,10)||0)
    :0;
}

function jplopsoft_xshSetStdHandleValue(ctx,which,handle){
  var field=jplopsoft_xshStdHandleField(which),
      pp,h=parseInt(handle,10)||0;

  if(!field){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'SetStdHandle requires STD_INPUT_HANDLE, STD_OUTPUT_HANDLE, or STD_ERROR_HANDLE.'
    );
  }

  if(
    h!==0&&
    h!==-10&&
    h!==-11&&
    h!==-12&&
    !jplopsoft_xshHandle(ctx,h)
  ){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'SetStdHandle received an invalid process handle.'
    );
  }

  pp=
    ctx&&ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters
      ?ctx.process.peb.processParameters
      :null;

  if(!pp){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Process parameters are unavailable.'
    );
  }

  pp[field]=h;
  return true;
}

function jplopsoft_xshCloseHandle(ctx,h){
  h=parseInt(h,10)||0;

  if(ctx.handles[String(h)]){
    var localHandle=ctx.handles[String(h)];

    if(localHandle&&localHandle.pipe){
      if(localHandle.kind==='pipe-read'){
        localHandle.pipe.readClosed=true;
      }else if(localHandle.kind==='pipe-write'){
        localHandle.pipe.writeClosed=true;
      }
    }

    delete ctx.handles[String(h)];
    return true;
  }

  if(jplopsoft_ntProcessHandleForOwner(ctx.pid,h)){
    delete jplopsoft_NT_KERNEL.processHandles[String(h)];
    return true;
  }

  return jplopsoft_ntCloseObjectHandle(
    ctx.pid,
    h
  );
}

function jplopsoft_xshAccessFlags(access){
  var n=Number(access),s=String(access||'').toLowerCase(),read=false,write=false;
  if(!isNaN(n)&&n!==0){read=((n>>>0)&0x80000000)!==0;write=((n>>>0)&0x40000000)!==0;}
  else{read=s.indexOf('r')>=0||s==='read'||s==='generic_read';write=s.indexOf('w')>=0||s==='write'||s==='generic_write';}
  if(!read&&!write)read=true;
  return{read:read,write:write};
}
function jplopsoft_xshDisposition(v){
  if(typeof v==='number')return v;
  v=String(v||'OPEN_EXISTING').toUpperCase();
  if(v==='CREATE_NEW')return 1;if(v==='CREATE_ALWAYS')return 2;if(v==='OPEN_EXISTING')return 3;if(v==='OPEN_ALWAYS')return 4;if(v==='TRUNCATE_EXISTING')return 5;
  return 3;
}


function jplopsoft_xshDosDeviceTable(){
  if(!jplopsoft_XSH.dosDevices)jplopsoft_XSH.dosDevices={};
  return jplopsoft_XSH.dosDevices;
}
function jplopsoft_xshQueryDosDevice(name){
  var table=jplopsoft_xshDosDeviceTable(),d=String(name||'').replace(':','').toUpperCase();
  if(!d){var out={'C:':'\\Device\\ExFSVdo0'},k;for(k in table)if(table.hasOwnProperty(k))out[k+':']=String(table[k]);return out;}
  if(d==='C')return'\\Device\\ExFSVdo0';
  return table[d]?String(table[d]):null;
}
function jplopsoft_xshDefineDosDevice(ctx,flags,deviceName,targetPath){
  var table=jplopsoft_xshDosDeviceTable(),d=String(deviceName||'').replace(':','').toUpperCase(),remove=!!((Number(flags)||0)&0x00000002),target,node,m,targetDrive;
  if(!/^[D-Z]$/.test(d))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'SUBST/DefineDosDevice supports drive letters D: through Z:.');
  if(remove){
    if(!table[d])return false;
    delete table[d];
    if(ctx&&String(ctx.currentDrive||'C').toUpperCase()===d){
      ctx.currentDrive='C';ctx.currentDirectoryNodeId=0;ctx.currentDirectory='C:\\';
      if(ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters)ctx.process.peb.processParameters.currentDirectory=ctx.currentDirectory;
    }
    return true;
  }
  if(table[d])throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_COLLISION,'Drive already SUBSTed. Remove the existing definition first.');
  target=String(targetPath||'');m=/^([A-Za-z]):/.exec(target);targetDrive=m?String(m[1]).toUpperCase():String(ctx&&ctx.currentDrive||'C').toUpperCase();
  if(targetDrive!=='C'&&table[targetDrive])throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'A SUBST drive cannot be used as the target of another SUBST drive.');
  node=jplopsoft_xshResolveC(ctx,target,false);
  if(!node||node.type!=='folder')throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'DOS device target directory not found.');
  table[d]=jplopsoft_exfsFolderPath(node.root?0:node.id);return true;
}
async function jplopsoft_xshCreateReparsePoint(ctx,linkPath,targetPath,tag){
  var target=jplopsoft_xshResolveC(ctx,targetPath,false),parent=jplopsoft_xshResolveC(ctx,linkPath,true),name,out;
  tag=String(tag||'SYMLINK').toUpperCase();
  if(!target||target.root)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Link target not found.');
  if(!parent)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Link parent directory not found.');
  if(!jplopsoft_xshValidLeafName(parent.name))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Invalid link name.');
  if(jplopsoft_xshFindChild(parent.parentId,parent.name,null))throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_COLLISION,'Link name already exists.');
  if(tag==='MOUNT_POINT'&&target.type!=='folder')throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Junction target must be a directory.');
  if(!jplopsoft_isWritableProfileFolder(parent.parentId))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Link can be created only in writable profile/Public folders.');
  name=parent.name;
  out=await jplopsoft_xshApiPromise('create_reparse_point','POST',{parent_id:parent.parentId,target_id:target.id,name_enc:jplopsoft_encName(name),reparse_tag:tag});
  await jplopsoft_xshReloadNodes();
  return{ok:true,id:parseInt(out.id,10)||0,targetNodeId:target.id,reparseTag:tag,path:String(linkPath),target:String(targetPath)};
}

async function jplopsoft_xshNtCreateFile(ctx,path,desiredAccess,creationDisposition,win32Api){
  var access=jplopsoft_xshAccessFlags(desiredAccess),disp=jplopsoft_xshDisposition(creationDisposition),spec=jplopsoft_xshPathSpec(ctx,path),irp,h,node,createdNow=false;
  irp=jplopsoft_xshBeginIrp(ctx,win32Api||'', 'NtCreateFile','IRP_MJ_CREATE',String(path),spec.drive||'');
  try{
    jplopsoft_xshTraceDownStack(irp,String(path),'CREATE');
    if(spec.kind==='exes-device'){
      h=jplopsoft_xshAllocateHandle(ctx,{kind:'exes-device',access:access,position:0,path:'\\\\.\\Exes'});
    }else if(spec.kind==='unsupported-volume'){
      throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Only C: backed by PHP /_exfs/ is exposed.');
    }else{
      node=jplopsoft_xshResolveC(ctx,path,false);
      if(!node&&disp!==3&&disp!==5){node=await jplopsoft_xshCreateCNode(ctx,path,'file');createdNow=true;}
      if(!node||node.type!=='file')throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'File not found.');
      if(access.write&&!jplopsoft_isWritableProfileFolder(node.parent_id))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Write access denied outside writable profile/Public folders.');
      if(
        !createdNow&&
        (disp===2||disp===5)&&
        access.write
      ){
        await jplopsoft_xshWriteNodeBytes(
          node,
          new Uint8Array(0)
        );
      }

      h=jplopsoft_xshAllocateHandle(
        ctx,
        {
          kind:'exfs-file',
          nodeId:node.id,
          path:String(path),
          access:access,
          position:0,

          /*
           * NT semantics: after CREATE_ALWAYS/TRUNCATE_EXISTING the
           * file object is logically zero-length. The next write can
           * build from an empty buffer without issuing a redundant
           * read IRP against the backing ExFS object.
           */
          knownEmpty:
            !!(
              access.write&&
              (disp===2||disp===5)
            )
        }
      );
    }
    jplopsoft_xshCompleteIrp(irp,jplopsoft_STATUS_SUCCESS);
    return{status:jplopsoft_STATUS_SUCCESS,handle:h};
  }catch(e){
    jplopsoft_xshCompleteIrp(irp,e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER);
    return{status:e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER,handle:0,error:e.message};
  }
}

function jplopsoft_xshRuntimeReadPurpose(ctx){
  return(
    ctx&&
    ctx.process&&
    String(ctx.process.integrity||'').toUpperCase()==='LOW'
  )
    ?'XSH_SANDBOX'
    :'';
}

async function jplopsoft_xshNtReadFile(ctx,handle,length,offset,win32Api){
  var h=jplopsoft_xshHandle(ctx,handle),irp,bytes,start,end,node,slice;
  if(!h)return{status:jplopsoft_STATUS_INVALID_HANDLE,bytesRead:0,data:[]};
  if(!h.access||!h.access.read)return{status:jplopsoft_STATUS_ACCESS_DENIED,bytesRead:0,data:[]};
  length=parseInt(length,10);if(!(length>=0))length=jplopsoft_XSH.maxIoBytes;if(length>jplopsoft_XSH.maxIoBytes)length=jplopsoft_XSH.maxIoBytes;
  start=(offset===undefined||offset===null)?h.position:Math.max(0,parseInt(offset,10)||0);
  irp=jplopsoft_xshBeginIrp(ctx,win32Api||'','NtReadFile','IRP_MJ_READ',h.path||'',h.kind);
  try{
    jplopsoft_xshTraceDownStack(irp,h.path||'','READ');

    if(h.kind==='pipe-read'){
      var pipeData=h.pipe&&h.pipe.data?h.pipe.data:[],
          pipeStart=Math.max(0,parseInt(h.position,10)||0),
          pipeEnd=Math.min(pipeData.length,pipeStart+length),
          pipeSlice=new Uint8Array(pipeData.slice(pipeStart,pipeEnd));

      h.position=pipeEnd;
      jplopsoft_xshCompleteIrp(irp,jplopsoft_STATUS_SUCCESS);

      return{
        status:jplopsoft_STATUS_SUCCESS,
        bytesRead:pipeSlice.length,
        data:jplopsoft_xshBytesToArray(pipeSlice),
        eof:pipeEnd>=pipeData.length&&!!(h.pipe&&h.pipe.writeClosed),
        position:h.position
      };
    }

    if(h.kind!=='exfs-file')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Handle does not support ReadFile.');
    node=jplopsoft_findNode(h.nodeId);if(!node)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'File object disappeared.');
    bytes=await jplopsoft_xshReadNodeBytes(node,jplopsoft_xshRuntimeReadPurpose(ctx));end=Math.min(bytes.length,start+length);if(end<start)end=start;slice=bytes.slice(start,end);h.position=end;
    jplopsoft_xshTraceReadComplete(irp,h.path||'');jplopsoft_xshCompleteIrp(irp,jplopsoft_STATUS_SUCCESS);
    return{status:jplopsoft_STATUS_SUCCESS,bytesRead:slice.length,data:jplopsoft_xshBytesToArray(slice),eof:end>=bytes.length,position:h.position};
  }catch(e){jplopsoft_xshCompleteIrp(irp,e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER);return{status:e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER,bytesRead:0,data:[],error:e.message};}
}


async function jplopsoft_xshNtReadFileBuffer(ctx,handle,length,offset,win32Api){
  var h=jplopsoft_xshHandle(ctx,handle),irp,bytes,start,end,node,slice;

  if(!h){
    return{
      status:jplopsoft_STATUS_INVALID_HANDLE,
      bytesRead:0,
      data:new Uint8Array(0)
    };
  }

  if(!h.access||!h.access.read){
    return{
      status:jplopsoft_STATUS_ACCESS_DENIED,
      bytesRead:0,
      data:new Uint8Array(0)
    };
  }

  length=parseInt(length,10);
  if(!(length>=0))length=jplopsoft_XSH.maxIoBytes;
  if(length>jplopsoft_XSH.maxIoBytes)length=jplopsoft_XSH.maxIoBytes;

  start=
    (offset===undefined||offset===null)
      ?h.position
      :Math.max(0,parseInt(offset,10)||0);

  irp=jplopsoft_xshBeginIrp(
    ctx,
    win32Api||'',
    'NtReadFile',
    'IRP_MJ_READ',
    h.path||'',
    h.kind
  );

  try{
    jplopsoft_xshTraceDownStack(irp,h.path||'','READ');

    if(h.kind==='pipe-read'){
      var pData=h.pipe&&h.pipe.data?h.pipe.data:[],
          pStart=Math.max(0,parseInt(h.position,10)||0),
          pEnd=Math.min(pData.length,pStart+length),
          pSlice=new Uint8Array(pData.slice(pStart,pEnd));

      h.position=pEnd;
      jplopsoft_xshCompleteIrp(irp,jplopsoft_STATUS_SUCCESS);

      return{
        status:jplopsoft_STATUS_SUCCESS,
        bytesRead:pSlice.length,
        data:pSlice,
        eof:pEnd>=pData.length&&!!(h.pipe&&h.pipe.writeClosed),
        position:h.position
      };
    }

    if(h.kind!=='exfs-file'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_NOT_SUPPORTED,
        'Handle does not support ReadFileBuffer.'
      );
    }

    node=jplopsoft_findNode(h.nodeId);

    if(!node){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
        'File object disappeared.'
      );
    }

    bytes=await jplopsoft_xshReadNodeBytes(node,jplopsoft_xshRuntimeReadPurpose(ctx));
    end=Math.min(bytes.length,start+length);

    if(end<start)end=start;

    slice=bytes.slice(start,end);
    h.position=end;

    jplopsoft_xshTraceReadComplete(irp,h.path||'');
    jplopsoft_xshCompleteIrp(
      irp,
      jplopsoft_STATUS_SUCCESS
    );

    /*
     * os67:
     * Preserve Uint8Array across MessagePort structured clone.  Large
     * binary consumers (WebAssembly, media decoders, game engines) no
     * longer pay the memory cost of turning every byte into a JS Number.
     */
    return{
      status:jplopsoft_STATUS_SUCCESS,
      bytesRead:slice.length,
      data:slice,
      eof:end>=bytes.length,
      position:h.position
    };
  }catch(e){
    jplopsoft_xshCompleteIrp(
      irp,
      e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER
    );

    return{
      status:e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER,
      bytesRead:0,
      data:new Uint8Array(0),
      error:e.message
    };
  }
}

async function jplopsoft_xshNtWriteFile(ctx,handle,data,offset,win32Api){
  var h=jplopsoft_xshHandle(ctx,handle),irp,src,old,start,total,out,node;
  if(!h)return{status:jplopsoft_STATUS_INVALID_HANDLE,bytesWritten:0};
  if(!h.access||!h.access.write)return{status:jplopsoft_STATUS_ACCESS_DENIED,bytesWritten:0};
  src=typeof data==='string'
    ?jplopsoft_xshUtf8Encode(data)
    :jplopsoft_xshNormalizeBytes(data);
  if(src.length>jplopsoft_XSH.maxIoBytes)return{status:jplopsoft_STATUS_INVALID_PARAMETER,bytesWritten:0,error:'WriteFile request exceeds XSH per-call limit.'};
  start=(offset===undefined||offset===null)?h.position:Math.max(0,parseInt(offset,10)||0);irp=jplopsoft_xshBeginIrp(ctx,win32Api||'','NtWriteFile','IRP_MJ_WRITE',h.path||'',h.kind);
  try{
    jplopsoft_xshTraceDownStack(irp,h.path||'','WRITE');

    if(h.kind==='pipe-write'){
      var p=h.pipe;

      if(!p||p.readClosed){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'The pipe reader is closed.'
        );
      }

      if(p.data.length+src.length>jplopsoft_XSH_PIPE_MAX_BYTES){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_QUOTA_EXCEEDED,
          'Anonymous pipe exceeded the 16 MiB ExOS safety limit.'
        );
      }

      for(var pi=0;pi<src.length;pi++){
        p.data.push(src[pi]&255);
      }

      h.position=p.data.length;
      jplopsoft_xshCompleteIrp(irp,jplopsoft_STATUS_SUCCESS);

      return{
        status:jplopsoft_STATUS_SUCCESS,
        bytesWritten:src.length,
        position:h.position
      };
    }

    if(h.kind!=='exfs-file')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Handle does not support WriteFile.');
    node=jplopsoft_findNode(h.nodeId);if(!node)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'File object disappeared.');
    if(h.knownEmpty){
      old=new Uint8Array(0);
    }else{
      old=await jplopsoft_xshReadNodeBytes(node,jplopsoft_xshRuntimeReadPurpose(ctx));
    }

    total=Math.max(
      old.length,
      start+src.length
    );

    out=new Uint8Array(total);
    out.set(old,0);
    out.set(src,start);

    await jplopsoft_xshWriteNodeBytes(
      node,
      out
    );

    h.knownEmpty=false;
    h.position=start+src.length;

    jplopsoft_xshCompleteIrp(
      irp,
      jplopsoft_STATUS_SUCCESS
    );

    return{
      status:jplopsoft_STATUS_SUCCESS,
      bytesWritten:src.length,
      position:h.position
    };
  }catch(e){jplopsoft_xshCompleteIrp(irp,e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER);return{status:e.ntstatus||jplopsoft_STATUS_INVALID_PARAMETER,bytesWritten:0,error:e.message};}
}

function jplopsoft_xshGetFileSizeByHandle(ctx,handle){
  var h=jplopsoft_xshHandle(ctx,handle),
      node;

  if(h&&(h.kind==='pipe-read'||h.kind==='pipe-write')){
    return h.pipe&&h.pipe.data
      ?h.pipe.data.length
      :0;
  }

  if(!h||h.kind!=='exfs-file'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'GetFileSize requires an ExFS file or pipe handle.'
    );
  }

  node=jplopsoft_findNode(h.nodeId);

  if(!node){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'File object disappeared.'
    );
  }

  return parseInt(node.original_size,10)||0;
}

async function jplopsoft_xshFlushFileBuffers(ctx,handle){
  var h=jplopsoft_xshHandle(ctx,handle);

  if(!h||h.kind!=='exfs-file'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'FlushFileBuffers requires an ExFS file handle.'
    );
  }

  await jplopsoft_xshReloadNodes();

  return{
    ok:true,
    size:jplopsoft_xshGetFileSizeByHandle(
      ctx,
      handle
    )
  };
}

async function jplopsoft_xshCreateDirectory(ctx,path){var spec=jplopsoft_xshPathSpec(ctx,path);if(spec.kind!=='exfs')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Only C: / PHP /_exfs/ VDO is available.');await jplopsoft_xshCreateCNode(ctx,path,'folder');return true;}


function jplopsoft_xshNodePath(n){
  if(!n)return'';
  try{return jplopsoft_exfsNodeFullPath(n);}catch(ignoreXshNodePath){}
  return'';
}

function jplopsoft_xshListDirectory(ctx,path){
  var p=String(path||ctx.currentDirectory||'C:\\'),
      folder=jplopsoft_xshResolveC(ctx,p,false),
      logicalBase=jplopsoft_xshNormalizeSlashes(p),
      parentId,a,i,n,resolved,name,out=[],directory,attrs,targetNode,targetPath,logicalPath;

  if(!folder||folder.type!=='folder'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Directory not found.'
    );
  }

  /* Preserve the caller-visible DOS namespace. A ListDirectory on a SUBST
   * path such as Z:\\ must return Z:\\child paths, not backing C:\\ paths.
   * This matches Win32 directory enumeration semantics and keeps Shell tree
   * item identities unique across DOS device aliases. */
  if(!/^[A-Za-z]:\\/.test(logicalBase)){
    logicalBase=String(
      ctx&&ctx.currentDirectory
        ?ctx.currentDirectory
        :(jplopsoft_xshNodePath(folder)||'C:\\')
    );
  }
  logicalBase=jplopsoft_xshNormalizeSlashes(logicalBase);
  if(/^[A-Za-z]:/.test(logicalBase)){
    logicalBase=logicalBase.charAt(0).toUpperCase()+logicalBase.substring(1);
  }
  if(logicalBase.length>3)logicalBase=logicalBase.replace(/\\+$/,'');

  parentId=folder.root?0:(parseInt(folder.id,10)||0);
  a=jplopsoft_childrenOf(parentId);

  for(i=0;i<a.length;i++){
    n=a[i];
    resolved=n.type==='reparse_point'?jplopsoft_resolveClientNode(n):n;
    if(!resolved)continue;
    name=jplopsoft_decName(n);
    if(name===null)name='[encrypted-name #'+String(n.id)+']';
    directory=resolved.type==='folder';
    attrs=(Number(n.win32_attributes)||0)|(directory?0x10:0)|(n.type==='reparse_point'?0x400:0);
    if(!attrs)attrs=directory?0x10:0x80;
    targetNode=n.type==='reparse_point'?jplopsoft_findNode(parseInt(n.reparse_target,10)||0):null;
    targetPath=targetNode?jplopsoft_xshNodePath(targetNode):'';
    logicalPath=(logicalBase.length===3&&/^[A-Za-z]:\\$/.test(logicalBase))
      ?logicalBase+String(name)
      :logicalBase+'\\'+String(name);
    out.push({
      name:String(name),
      path:logicalPath,
      directory:directory,
      reparsePoint:n.type==='reparse_point',
      reparseTag:n.type==='reparse_point'?String(n.reparse_tag||'SYMLINK'):'',
      reparseTarget:targetPath,
      type:String(n.type||''),
      targetType:String(resolved.type||''),
      size:parseInt(resolved.original_size,10)||0,
      nodeId:parseInt(n.id,10)||0,
      targetNodeId:n.type==='reparse_point'?(parseInt(resolved.id,10)||0):0,
      modified:String(n.updated_at||resolved.updated_at||''),
      dwFileAttributes:attrs>>>0
    });
  }

  out.sort(function(x,y){
    if(x.directory&&!y.directory)return-1;
    if(!x.directory&&y.directory)return 1;
    var a=String(x.name||'').toLowerCase(),b=String(y.name||'').toLowerCase();
    return a<b?-1:(a>b?1:0);
  });
  return out;
}

async function jplopsoft_xshDeleteFile(ctx,path){
  var n=jplopsoft_xshResolveC(ctx,path,false,true),resolved;
  if(!n)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'File not found.');
  resolved=n.type==='reparse_point'?jplopsoft_resolveClientNode(n):n;
  if(!resolved||resolved.type!=='file')throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'File not found.');
  if(!jplopsoft_isWritableProfileFolder(parseInt(n.parent_id,10)||0))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Delete access denied outside writable profile/Public folders.');
  await jplopsoft_xshApiPromise('delete','POST',{id:n.id});
  await jplopsoft_xshReloadNodes();
  return true;
}

async function jplopsoft_xshRemoveDirectory(ctx,path){
  var n=jplopsoft_xshResolveC(ctx,path,false,true),resolved,id;
  if(!n||n.root)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Directory not found.');
  resolved=n.type==='reparse_point'?jplopsoft_resolveClientNode(n):n;
  if(!resolved||resolved.type!=='folder')throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Directory not found.');
  id=parseInt(n.id,10)||0;
  if(n.type!=='reparse_point'&&jplopsoft_childrenOf(id).length)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Directory is not empty.');
  if(!jplopsoft_isWritableProfileFolder(parseInt(n.parent_id,10)||0))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'RemoveDirectory denied outside writable profile/Public folders.');
  await jplopsoft_xshApiPromise('delete','POST',{id:id});
  await jplopsoft_xshReloadNodes();
  return true;
}

async function jplopsoft_xshMoveFile(ctx,source,destination){
  var n=jplopsoft_xshResolveC(ctx,source,false,true),
      target=jplopsoft_xshResolveC(ctx,destination,true),existing,name;
  if(!n)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Source object not found.');
  if(!target)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Destination parent not found.');
  name=String(target.name||'');
  if(!jplopsoft_xshValidLeafName(name))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Invalid destination name.');
  existing=jplopsoft_xshFindChildRaw(target.parentId,name,null);
  if(existing&&parseInt(existing.id,10)!==parseInt(n.id,10))throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_COLLISION,'Destination already exists.');
  if(!jplopsoft_isWritableProfileFolder(parseInt(n.parent_id,10)||0)||!jplopsoft_isWritableProfileFolder(parseInt(target.parentId,10)||0))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'MoveFile denied outside writable profile/Public folders.');
  await jplopsoft_xshApiPromise('move_node','POST',{id:n.id,target_parent_id:target.parentId,name_enc:jplopsoft_encName(name)});
  await jplopsoft_xshReloadNodes();
  return true;
}

async function jplopsoft_xshCopyFile(ctx,source,destination,failIfExists){
  var src=jplopsoft_xshResolveC(ctx,source,false),
      dst=jplopsoft_xshResolveC(ctx,destination,false),
      bytes;

  if(!src||src.type!=='file'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Source file not found.'
    );
  }

  if(dst){
    if(dst.type!=='file'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_OBJECT_NAME_COLLISION,
        'Destination is not a file.'
      );
    }

    if(failIfExists!==false){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_OBJECT_NAME_COLLISION,
        'Destination already exists.'
      );
    }
  }else{
    dst=await jplopsoft_xshCreateCNode(
      ctx,
      destination,
      'file'
    );
  }

  bytes=await jplopsoft_xshReadNodeBytes(src,jplopsoft_xshRuntimeReadPurpose(ctx));
  await jplopsoft_xshWriteNodeBytes(dst,bytes);
  return true;
}

function jplopsoft_xshGetAttributes(ctx,path){
  var spec=jplopsoft_xshPathSpec(ctx,path),raw,n,a=0;
  if(spec.kind!=='exfs')return null;
  raw=jplopsoft_xshResolveC(ctx,path,false,true);
  if(!raw)return null;
  n=raw.type==='reparse_point'?jplopsoft_resolveClientNode(raw):raw;
  if(!n)return null;
  a=Number(raw.win32_attributes)||0;
  if(n.type==='folder')a|=0x10;
  if(raw.type==='reparse_point')a|=0x400;
  if(!a)a=n.type==='folder'?0x10:0x80;
  return{
    exists:true,
    directory:n.type==='folder',
    reparsePoint:raw.type==='reparse_point',
    reparseTag:raw.type==='reparse_point'?String(raw.reparse_tag||'SYMLINK'):'',
    reparseTarget:raw.type==='reparse_point'?jplopsoft_xshNodePath(jplopsoft_findNode(parseInt(raw.reparse_target,10)||0)):'',
    size:parseInt(n.original_size,10)||0,
    nodeId:raw.id,
    targetNodeId:raw.type==='reparse_point'?(parseInt(n.id,10)||0):0,
    drive:String(spec.drive||'C'),
    backingVdo:'PHP /_exfs/',
    dwFileAttributes:a>>>0,
    attributes:a>>>0,
    readOnly:!!(a&0x1),hidden:!!(a&0x2),system:!!(a&0x4),archive:!!(a&0x20)
  };
}

async function jplopsoft_xshReadTextFile(ctx,path){
  var o=await jplopsoft_xshNtCreateFile(ctx,path,'r','OPEN_EXISTING','ReadTextFile');
  if(o.status!==jplopsoft_STATUS_SUCCESS)throw jplopsoft_xshError(o.status,o.error);
  try{
    var r=await jplopsoft_xshNtReadFile(ctx,o.handle,jplopsoft_XSH.maxIoBytes,0,'ReadTextFile');
    if(r.status!==jplopsoft_STATUS_SUCCESS)throw jplopsoft_xshError(r.status,r.error);
    return jplopsoft_xshUtf8Decode(new Uint8Array(r.data));
  }finally{jplopsoft_xshCloseHandle(ctx,o.handle);}
}
async function jplopsoft_xshWriteTextFile(ctx,path,text){
  var o=await jplopsoft_xshNtCreateFile(ctx,path,'rw','CREATE_ALWAYS','WriteTextFile');
  if(o.status!==jplopsoft_STATUS_SUCCESS)throw jplopsoft_xshError(o.status,o.error);
  try{
    var r=await jplopsoft_xshNtWriteFile(ctx,o.handle,String(text||''),0,'WriteTextFile');
    if(r.status!==jplopsoft_STATUS_SUCCESS)throw jplopsoft_xshError(r.status,r.error);
    return r.bytesWritten;
  }finally{jplopsoft_xshCloseHandle(ctx,o.handle);}
}



/* ------------------------- ExOS Console Subsystem -----------------------
 * IMAGE_SUBSYSTEM_WINDOWS_CUI processes are automatically attached to a
 * console session before their XSH sandbox begins execution.
 *
 * conhost.exe and ConDrv.sys are ExOS models. Browser JavaScript cannot
 * create a real Windows kernel console object.
 * --------------------------------------------------------------------- */

function jplopsoft_xshConsoleById(id){
  return jplopsoft_XSH.consoleSessions[
    String(parseInt(id,10)||0)
  ]||null;
}

function jplopsoft_xshConsoleForProcess(ctx){
  if(!ctx||!ctx.consoleId)return null;
  return jplopsoft_xshConsoleById(ctx.consoleId);
}

function jplopsoft_xshConsoleByHostPid(pid){
  var k,s;

  pid=parseInt(pid,10)||0;

  for(k in jplopsoft_XSH.consoleSessions){
    if(!jplopsoft_XSH.consoleSessions.hasOwnProperty(k))continue;

    s=jplopsoft_XSH.consoleSessions[k];

    if(
      s&&
      s.conhostProcess&&
      parseInt(s.conhostProcess.pid,10)===pid
    ){
      return s;
    }
  }

  return null;
}


function jplopsoft_xshConsoleScrollToCursor(session){
  var client,row;

  if(!session)return;

  client=jplopsoft_GetClientElement(
    session.hwnd
  );

  row=document.getElementById(
    session.inputRowId
  );

  if(!client)return;

  window.setTimeout(function(){
    try{
      client.scrollTop=
        client.scrollHeight;

      if(
        row&&
        row.style.display!=='none'&&
        typeof row.scrollIntoView==='function'
      ){
        row.scrollIntoView({
          block:'nearest',
          inline:'nearest'
        });
      }
    }catch(ignoreConsoleScroll){}
  },0);
}

function jplopsoft_xshConsoleRender(session){
  var out;

  if(!session)return;

  out=document.getElementById(
    session.outputId
  );

  if(out){
    out.textContent=
      String(session.buffer||'');
  }

  jplopsoft_xshConsoleScrollToCursor(
    session
  );
}

function jplopsoft_xshConsoleTrim(session){
  var s;

  if(!session)return;

  s=String(session.buffer||'');

  if(s.length>1024*1024){
    s=s.substring(s.length-(900*1024));
    session.buffer='[console scrollback truncated]\r\n'+s;
  }
}

function jplopsoft_xshConsoleWrite(ctx,text,stream){
  var session=jplopsoft_xshConsoleForProcess(ctx),
      s=String(text===undefined?'':text);

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  session.buffer+=s;
  jplopsoft_xshConsoleTrim(session);
  jplopsoft_xshConsoleRender(session);

  return{
    written:s.length,
    stream:String(stream||'stdout')
  };
}

function jplopsoft_xshConsoleActivateInput(session){
  var row,prompt,input,last;

  if(!session||!session.waiters.length)return;

  row=document.getElementById(session.inputRowId);
  prompt=document.getElementById(session.promptId);
  input=document.getElementById(session.inputId);

  if(!row||!prompt||!input)return;

  if(!session.inputActive){
    last=String(session.buffer||'').lastIndexOf('\n');

    if(last>=0){
      session.pendingPrompt=
        String(session.buffer||'').substring(last+1);
      session.buffer=
        String(session.buffer||'').substring(0,last+1);
    }else{
      session.pendingPrompt=String(session.buffer||'');
      session.buffer='';
    }

    session.inputActive=true;
    jplopsoft_xshConsoleRender(session);
  }

  prompt.textContent=
    session.pendingPrompt;

  row.style.display='flex';

  jplopsoft_xshConsoleScrollToCursor(
    session
  );

  window.setTimeout(function(){
    try{
      input.focus();
      jplopsoft_xshConsoleScrollToCursor(
        session
      );
    }catch(ignoreConsoleFocus){}
  },0);
}

function jplopsoft_xshConsoleSubmit(session){
  var input,row,prompt,line,waiter,maxChars,returned;

  if(!session||!session.waiters.length)return false;

  input=document.getElementById(session.inputId);
  row=document.getElementById(session.inputRowId);
  prompt=document.getElementById(session.promptId);

  line=input?String(input.value||''):'';
  waiter=session.waiters.shift();
  maxChars=Math.max(1,parseInt(waiter.maxChars,10)||4096);

  if(line.length>Math.max(0,maxChars-2)){
    line=line.substring(0,Math.max(0,maxChars-2));
  }

  returned=line+'\r\n';

  if(line.trim()){
    if(
      !session.history.length||
      session.history[session.history.length-1]!==line
    ){
      session.history.push(line);

      while(session.history.length>session.historyMax){
        session.history.shift();
      }
    }
  }

  session.historyIndex=session.history.length;
  session.historyDraft='';
  session.completion=null;

  session.buffer+=
    String(session.pendingPrompt||'')+
    line+
    '\r\n';

  session.pendingPrompt='';
  session.inputActive=false;

  if(input)input.value='';
  if(prompt)prompt.textContent='';
  if(row)row.style.display='none';

  jplopsoft_xshConsoleTrim(session);
  jplopsoft_xshConsoleRender(session);

  try{
    waiter.resolve(returned);
  }catch(ignoreConsoleResolve){}

  if(session.waiters.length){
    window.setTimeout(function(){
      jplopsoft_xshConsoleActivateInput(session);
    },0);
  }

  return true;
}

function jplopsoft_xshConsoleRead(ctx,maxChars){
  var session=jplopsoft_xshConsoleForProcess(ctx),
      limit=Math.max(1,Math.min(65536,parseInt(maxChars,10)||4096));

  if(!session){
    return Promise.reject(
      jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_HANDLE,
        'The process is not attached to a console.'
      )
    );
  }

  return new Promise(function(resolve,reject){
    session.waiters.push({
      pid:ctx.pid,
      maxChars:limit,
      resolve:resolve,
      reject:reject
    });

    jplopsoft_xshConsoleActivateInput(session);
  });
}

function jplopsoft_xshConsoleCancelReads(ctx){
  var session=jplopsoft_xshConsoleForProcess(ctx),
      keep=[],i,w;

  if(!session)return;

  for(i=0;i<session.waiters.length;i++){
    w=session.waiters[i];

    if(parseInt(w.pid,10)===(parseInt(ctx.pid,10)||0)){
      try{
        w.reject(
          jplopsoft_xshError(
            jplopsoft_STATUS_CANCELLED,
            'Console read cancelled.'
          )
        );
      }catch(ignoreConsoleReject){}
    }else{
      keep.push(w);
    }
  }

  session.waiters=keep;

  if(!keep.length){
    var row=document.getElementById(session.inputRowId),
        input=document.getElementById(session.inputId),
        prompt=document.getElementById(session.promptId);

    session.inputActive=false;
    session.pendingPrompt='';

    if(row)row.style.display='none';
    if(input)input.value='';
    if(prompt)prompt.textContent='';
  }
}


function jplopsoft_xshConsoleHistoryMove(session,direction){
  var input=document.getElementById(session.inputId),
      next;

  if(!input||!session.history.length)return false;

  if(
    session.historyIndex<0||
    session.historyIndex>session.history.length
  ){
    session.historyIndex=session.history.length;
  }

  if(
    session.historyIndex===session.history.length&&
    direction<0
  ){
    session.historyDraft=String(input.value||'');
  }

  next=session.historyIndex+direction;
  next=Math.max(
    0,
    Math.min(session.history.length,next)
  );

  session.historyIndex=next;
  session.completion=null;

  if(next===session.history.length){
    input.value=String(session.historyDraft||'');
  }else{
    input.value=String(session.history[next]||'');
  }

  try{
    input.selectionStart=
      input.selectionEnd=
        input.value.length;
  }catch(ignoreHistoryCaret){}

  return true;
}

function jplopsoft_xshConsoleCommonPrefix(values){
  var list=Array.isArray(values)?values:[],
      prefix,i,j,s;

  if(!list.length)return'';

  prefix=String(list[0]||'');

  for(i=1;i<list.length;i++){
    s=String(list[i]||'');

    for(
      j=0;
      j<prefix.length&&
      j<s.length&&
      prefix.charAt(j).toLowerCase()===
        s.charAt(j).toLowerCase();
      j++
    ){}

    prefix=prefix.substring(0,j);

    if(!prefix)break;
  }

  return prefix;
}

function jplopsoft_xshConsoleAutocomplete(session,reverse){
  var input=document.getElementById(session.inputId),
      waiter=session&&session.waiters.length
        ?session.waiters[0]
        :null,
      ctx=waiter
        ?jplopsoft_xshRunByPid(waiter.pid)
        :null,
      value,caret,before,m,tokenStart,rawToken,quoted,
      token,slash,dirPart,leaf,folder,children,matches,
      key,candidate,common,replacement,after;

  if(!input||!ctx)return false;

  value=String(input.value||'');
  caret=
    typeof input.selectionStart==='number'
      ?input.selectionStart
      :value.length;

  before=value.substring(0,caret);

  m=/(^|\s)("([^"]*)|([^\s"]*))$/.exec(before);

  if(!m)return false;

  tokenStart=
    m.index+
    String(m[1]||'').length;

  rawToken=String(m[2]||'');
  quoted=rawToken.charAt(0)==='"';

  token=quoted
    ?String(m[3]||'')
    :String(m[4]||'');

  slash=Math.max(
    token.lastIndexOf('\\'),
    token.lastIndexOf('/')
  );

  dirPart=slash>=0
    ?token.substring(0,slash+1)
    :'';

  leaf=slash>=0
    ?token.substring(slash+1)
    :token;

  try{
    folder=jplopsoft_xshResolveC(
      ctx,
      dirPart||ctx.currentDirectory,
      false
    );
  }catch(ignoreCompleteResolve){
    folder=null;
  }

  if(!folder||folder.type!=='folder'){
    return false;
  }

  children=jplopsoft_childrenOf(
    folder.root
      ?0
      :(parseInt(folder.id,10)||0)
  );

  matches=[];

  children.forEach(function(n){
    var name=jplopsoft_decName(n);

    if(name===null)return;

    if(
      String(name).toLowerCase().indexOf(
        String(leaf).toLowerCase()
      )===0
    ){
      matches.push({
        name:String(name),
        directory:n.type==='folder'
      });
    }
  });

  matches.sort(function(a,b){
    return a.name.localeCompare(
      b.name,
      'en',
      {
        numeric:true,
        sensitivity:'base'
      }
    );
  });

  if(!matches.length)return false;

  key=String(ctx.currentDirectory);

  if(
    session.completion&&
    session.completion.cwd===key&&
    session.completion.start===tokenStart&&
    session.completion.lastToken===token
  ){
    matches=session.completion.matches;

    session.completion.index+=
      reverse?-1:1;

    if(session.completion.index<0){
      session.completion.index=
        matches.length-1;
    }

    if(
      session.completion.index>=
      matches.length
    ){
      session.completion.index=0;
    }

    candidate=
      dirPart+
      matches[session.completion.index].name+
      (
        matches[session.completion.index].directory
          ?'\\'
          :''
      );
  }else{
    session.completion={
      cwd:key,
      start:tokenStart,
      index:
        reverse
          ?matches.length-1
          :0,
      matches:matches,
      lastToken:''
    };

    common=
      jplopsoft_xshConsoleCommonPrefix(
        matches.map(function(x){
          return x.name;
        })
      );

    if(
      matches.length>1&&
      common.length>leaf.length
    ){
      candidate=
        dirPart+
        common;
    }else{
      candidate=
        dirPart+
        matches[session.completion.index].name+
        (
          matches[session.completion.index].directory
            ?'\\'
            :''
        );
    }
  }

  session.completion.lastToken=
    candidate;

  replacement=
    /\s/.test(candidate)
      ?'"'+candidate+'"'
      :candidate;

  after=value.substring(caret);

  input.value=
    value.substring(0,tokenStart)+
    replacement+
    after;

  try{
    input.selectionStart=
      input.selectionEnd=
        tokenStart+
        replacement.length;
  }catch(ignoreCompleteCaret){}

  return true;
}

function jplopsoft_xshConsoleBreakCurrentLine(session){
  var input=document.getElementById(session.inputId),
      row=document.getElementById(session.inputRowId),
      prompt=document.getElementById(session.promptId),
      waiter;

  if(!session||!session.waiters.length){
    return false;
  }

  waiter=session.waiters.shift();

  session.buffer+=
    String(session.pendingPrompt||'')+
    '^C\r\n';

  session.pendingPrompt='';
  session.inputActive=false;
  session.historyIndex=session.history.length;
  session.historyDraft='';
  session.completion=null;

  if(input)input.value='';
  if(prompt)prompt.textContent='';
  if(row)row.style.display='none';

  jplopsoft_xshConsoleTrim(session);
  jplopsoft_xshConsoleRender(session);

  try{
    waiter.resolve('\r\n');
  }catch(ignoreBreakResolve){}

  if(session.waiters.length){
    window.setTimeout(function(){
      jplopsoft_xshConsoleActivateInput(
        session
      );
    },0);
  }

  return true;
}

function jplopsoft_xshConsoleColorCss(attribute){
  var table=[
        '#000000','#000080','#008000','#008080',
        '#800000','#800080','#808000','#c0c0c0',
        '#808080','#0000ff','#00ff00','#00ffff',
        '#ff0000','#ff00ff','#ffff00','#ffffff'
      ],
      a=Number(attribute)>>>0,
      fg=a&15,
      bg=(a>>>4)&15;

  return{
    foreground:table[fg]||'#c0c0c0',
    background:table[bg]||'#000000'
  };
}

function jplopsoft_xshConsoleApplyAttribute(session){
  var css=jplopsoft_xshConsoleColorCss(
        session.attributes
      ),
      out=document.getElementById(
        session.outputId
      ),
      row=document.getElementById(
        session.inputRowId
      ),
      prompt=document.getElementById(
        session.promptId
      ),
      input=document.getElementById(
        session.inputId
      );

  if(out){
    out.style.color=css.foreground;
    out.style.backgroundColor=css.background;
  }

  if(row){
    row.style.color=css.foreground;
    row.style.backgroundColor=css.background;
  }

  if(prompt){
    prompt.style.color=css.foreground;
  }

  if(input){
    input.style.setProperty(
      'color',
      css.foreground,
      'important'
    );

    input.style.setProperty(
      'background-color',
      css.background,
      'important'
    );
  }
}

function jplopsoft_xshConsoleSetTextAttribute(ctx,attribute){
  var session=
        jplopsoft_xshConsoleForProcess(ctx),
      a=Number(attribute);

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  if(isNaN(a)||a<0||a>255){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Console text attribute must be 00-FF.'
    );
  }

  session.attributes=a&255;
  jplopsoft_xshConsoleApplyAttribute(
    session
  );

  return true;
}

function jplopsoft_xshConsoleHistory(ctx){
  var session=
    jplopsoft_xshConsoleForProcess(ctx);

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  return session.history.slice();
}

function jplopsoft_xshConsoleSetHistoryMax(ctx,count){
  var session=
    jplopsoft_xshConsoleForProcess(ctx);

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  count=Math.max(
    1,
    Math.min(
      999,
      parseInt(count,10)||50
    )
  );

  session.historyMax=count;

  while(
    session.history.length>count
  ){
    session.history.shift();
  }

  session.historyIndex=
    session.history.length;

  return count;
}

function jplopsoft_xshConsoleExpungeHistory(ctx){
  var session=
    jplopsoft_xshConsoleForProcess(ctx);

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  session.history=[];
  session.historyIndex=0;
  session.historyDraft='';
  session.completion=null;

  return true;
}

var jplopsoft_XSH_CLIPBOARD={openPid:0,sequence:0,formats:{},names:{'1':'CF_TEXT','2':'CF_BITMAP','8':'CF_DIB','13':'CF_UNICODETEXT','49153':'Rich Text Format'},nextCustom:0xC100};
function jplopsoft_xshClipboardFormat(fmt){if(typeof fmt==='number')return String(fmt|0);fmt=String(fmt||'').toUpperCase();if(fmt==='CF_TEXT')return'1';if(fmt==='CF_BITMAP')return'2';if(fmt==='CF_DIB')return'8';if(fmt==='CF_UNICODETEXT')return'13';if(fmt==='CF_RTF'||fmt==='RICH TEXT FORMAT')return'49153';if(/^\d+$/.test(fmt))return String(parseInt(fmt,10));return'';}
function jplopsoft_xshClipboardOpen(ctx){var pid=parseInt(ctx&&ctx.pid,10)||0;if(jplopsoft_XSH_CLIPBOARD.openPid&&jplopsoft_XSH_CLIPBOARD.openPid!==pid)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Clipboard is open by another XSH process.');jplopsoft_XSH_CLIPBOARD.openPid=pid;return true;}
function jplopsoft_xshClipboardClose(ctx){var pid=parseInt(ctx&&ctx.pid,10)||0;if(jplopsoft_XSH_CLIPBOARD.openPid===pid)jplopsoft_XSH_CLIPBOARD.openPid=0;return true;}
function jplopsoft_xshClipboardEnsureOwner(ctx){var p=parseInt(ctx&&ctx.pid,10)||0;if(jplopsoft_XSH_CLIPBOARD.openPid&&jplopsoft_XSH_CLIPBOARD.openPid!==p)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Clipboard is open by another process.');}
function jplopsoft_xshDataUrlToBlob(url){var m=String(url||'').match(/^data:([^;,]+);base64,(.*)$/i);if(!m)return null;var raw=atob(m[2]),a=new Uint8Array(raw.length),i;for(i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i)&255;return new Blob([a],{type:m[1]});}
function jplopsoft_xshBlobToDataUrl(blob){return blob.arrayBuffer().then(function(ab){var a=new Uint8Array(ab),s='',i,chunk=0x8000;for(i=0;i<a.length;i+=chunk)s+=String.fromCharCode.apply(null,Array.prototype.slice.call(a,i,Math.min(a.length,i+chunk)));return'data:'+String(blob.type||'application/octet-stream')+';base64,'+btoa(s);});}
async function jplopsoft_xshClipboardSet(ctx,format,data){jplopsoft_xshClipboardEnsureOwner(ctx);var f=jplopsoft_xshClipboardFormat(format);if(!f)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Unknown clipboard format.');var hostSynced=false;if(f==='1'||f==='13'){data=String(data===undefined?'':data);jplopsoft_XSH_CLIPBOARD.formats['1']=data;jplopsoft_XSH_CLIPBOARD.formats['13']=data;try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(data);hostSynced=true;}}catch(ignoreTextWrite){}}else if(f==='2'||f==='8'){var url=typeof data==='string'?String(data):(data&&data.dataUrl?String(data.dataUrl):'');if(!/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(url)||url.length>16*1024*1024)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'CF_BITMAP/CF_DIB expects a Base64 image Data URL <= 16 MiB.');jplopsoft_XSH_CLIPBOARD.formats['2']={dataUrl:url};jplopsoft_XSH_CLIPBOARD.formats['8']={dataUrl:url};try{var blob=jplopsoft_xshDataUrlToBlob(url);if(blob&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem==='function'){await navigator.clipboard.write([new ClipboardItem({'image/png':blob.type==='image/png'?blob:new Blob([await blob.arrayBuffer()],{type:'image/png'})})]);hostSynced=true;}}catch(ignoreImageWrite){}}else{jplopsoft_XSH_CLIPBOARD.formats[f]=data;}
 jplopsoft_XSH_CLIPBOARD.sequence++;return{ok:true,format:parseInt(f,10),hostSynced:hostSynced,sequence:jplopsoft_XSH_CLIPBOARD.sequence};}
async function jplopsoft_xshClipboardGet(ctx,format,preferHost){jplopsoft_xshClipboardEnsureOwner(ctx);var f=jplopsoft_xshClipboardFormat(format);if(!f)return null;if((f==='1'||f==='13')&&preferHost!==false){try{if(navigator.clipboard&&navigator.clipboard.readText){var t=await navigator.clipboard.readText();if(typeof t==='string'){jplopsoft_XSH_CLIPBOARD.formats['1']=t;jplopsoft_XSH_CLIPBOARD.formats['13']=t;return t;}}}catch(ignoreReadText){}}if((f==='2'||f==='8')&&preferHost!==false){try{if(navigator.clipboard&&navigator.clipboard.read){var items=await navigator.clipboard.read(),i,j,it,types,blob;for(i=0;i<items.length;i++){it=items[i];types=it.types||[];for(j=0;j<types.length;j++){if(/^image\//i.test(types[j])){blob=await it.getType(types[j]);var url=await jplopsoft_xshBlobToDataUrl(blob);jplopsoft_XSH_CLIPBOARD.formats['2']={dataUrl:url};jplopsoft_XSH_CLIPBOARD.formats['8']={dataUrl:url};return{dataUrl:url,mime:String(blob.type||types[j])};}}}}}catch(ignoreReadImage){}}return jplopsoft_XSH_CLIPBOARD.formats.hasOwnProperty(f)?jplopsoft_XSH_CLIPBOARD.formats[f]:null;}
async function jplopsoft_xshClipboardSetMany(ctx,formats){jplopsoft_xshClipboardEnsureOwner(ctx);var keys=Object.keys(formats||{}),results=[],i;for(i=0;i<keys.length;i++)results.push(await jplopsoft_xshClipboardSet(ctx,keys[i],formats[keys[i]]));return{ok:true,results:results};}
async function jplopsoft_xshClipboardSnapshot(ctx,preferHost){var out={},keys=Object.keys(jplopsoft_XSH_CLIPBOARD.formats),i;for(i=0;i<keys.length;i++)out[keys[i]]=jplopsoft_XSH_CLIPBOARD.formats[keys[i]];if(preferHost){try{var t=await jplopsoft_xshClipboardGet(ctx,13,true);if(t!==null)out['13']=out['1']=t;}catch(ignore){}}return{sequence:jplopsoft_XSH_CLIPBOARD.sequence,formats:out};}
globalThis.jplopsoft_xshClipboardSetMany=jplopsoft_xshClipboardSetMany;globalThis.jplopsoft_xshClipboardSnapshot=jplopsoft_xshClipboardSnapshot;
var jplopsoft_CONHOST_TEXT_CLIPBOARD='';
function jplopsoft_conhostSelectedText(session){
  var input=document.getElementById(session.inputId),out=document.getElementById(session.outputId),sel,text='';
  if(input&&typeof input.selectionStart==='number'&&input.selectionEnd>input.selectionStart){
    return String(input.value||'').substring(input.selectionStart,input.selectionEnd);
  }
  try{
    sel=window.getSelection?window.getSelection():null;
    if(sel&&sel.rangeCount&&out&&out.contains(sel.anchorNode)&&out.contains(sel.focusNode))text=String(sel.toString()||'');
  }catch(ignoreConsoleSelection){}
  return text;
}
function jplopsoft_conhostClipboardWrite(text){
  text=String(text||'');jplopsoft_CONHOST_TEXT_CLIPBOARD=text;
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text).then(function(){return true;},function(){return true;});
  }catch(ignoreClipboardWrite){}
  return Promise.resolve(true);
}
function jplopsoft_conhostClipboardRead(){
  try{
    if(navigator.clipboard&&navigator.clipboard.readText){
      return navigator.clipboard.readText().then(function(t){if(String(t||''))jplopsoft_CONHOST_TEXT_CLIPBOARD=String(t);return String(t||jplopsoft_CONHOST_TEXT_CLIPBOARD||'');},function(){return String(jplopsoft_CONHOST_TEXT_CLIPBOARD||'');});
    }
  }catch(ignoreClipboardRead){}
  return Promise.resolve(String(jplopsoft_CONHOST_TEXT_CLIPBOARD||''));
}
function jplopsoft_conhostCut(session){
  var input=document.getElementById(session.inputId),start,end,text;
  if(!input||typeof input.selectionStart!=='number')return Promise.resolve(false);
  start=input.selectionStart;end=input.selectionEnd;
  if(end<=start)return Promise.resolve(false);
  text=String(input.value||'').substring(start,end);
  input.value=String(input.value||'').substring(0,start)+String(input.value||'').substring(end);
  input.selectionStart=input.selectionEnd=start;
  input.focus();
  return jplopsoft_conhostClipboardWrite(text);
}
function jplopsoft_conhostCopy(session){
  var text=jplopsoft_conhostSelectedText(session);
  if(!text)return Promise.resolve(false);
  return jplopsoft_conhostClipboardWrite(text);
}
function jplopsoft_conhostPaste(session){
  var input=document.getElementById(session.inputId);
  if(!input)return Promise.resolve(false);
  return jplopsoft_conhostClipboardRead().then(function(text){
    var start=typeof input.selectionStart==='number'?input.selectionStart:String(input.value||'').length,
        end=typeof input.selectionEnd==='number'?input.selectionEnd:start,
        value=String(input.value||'');
    text=String(text||'');
    input.value=value.substring(0,start)+text+value.substring(end);
    input.selectionStart=input.selectionEnd=start+text.length;
    input.focus();
    return true;
  });
}
function jplopsoft_conhostSelectAll(session){
  var out=document.getElementById(session.outputId),sel,range;
  try{
    if(out&&window.getSelection&&document.createRange){
      range=document.createRange();range.selectNodeContents(out);sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);return true;
    }
  }catch(ignoreConsoleSelectAll){}
  return false;
}
function jplopsoft_conhostBindClipboardPresentation(session,hwnd){
  if(typeof jplopsoft_shell32InstallClipboardPresentation!=='function')return false;
  return jplopsoft_shell32InstallClipboardPresentation(hwnd,{
    cut:function(){return jplopsoft_conhostCut(session);},
    copy:function(){return jplopsoft_conhostCopy(session);},
    paste:function(){return jplopsoft_conhostPaste(session);},
    selectAll:function(){return jplopsoft_conhostSelectAll(session);}
  });
}
function jplopsoft_conhostDismissClipboardPresentation(session){
  if(typeof jplopsoft_shell32DismissClipboardPresentation==='function'){
    return jplopsoft_shell32DismissClipboardPresentation(session&&session.hwnd?session.hwnd:0);
  }
  return false;
}

function jplopsoft_xshConsoleCreateSession(ctx){
  var id=++jplopsoft_XSH.consoleSeq,
      conhost,h,client,out,row,prompt,input,
      session;

  conhost=jplopsoft_CreateProcess(
    'conhost.exe',
    'conhost.exe --server '+String(ctx.pid),
    ctx.pid,
    {
      key:'proc:conhost:'+String(id),
      imageName:'conhost.exe',
      description:'ExOS Console Window Host',
      parentProcess:ctx.process,
      sessionId:ctx.process&&typeof ctx.process.sessionId==='number'?ctx.process.sessionId:1,
      username:String(ctx.process&&ctx.process.username?ctx.process.username:(state.samUsername||'administrator')),
      sid:String(ctx.process&&ctx.process.sid?ctx.process.sid:(state.samSid||'')),
      integrity:String(ctx.process&&ctx.process.integrity?ctx.process.integrity:'MEDIUM'),
      protection:'Console',
      critical:false,
      systemProcess:false,
      imagePathName:'C:\\ExOS\\System32\\conhost.exe',
      currentDirectoryNodeId:ctx.currentDirectoryNodeId,
      currentDirectory:ctx.currentDirectory,
      logicalThreads:2,
      accountedMemoryBytes:196608
    }
  );

  session={
    id:id,
    conhostProcess:conhost,
    hwnd:0,
    title:String(ctx.name||'ExOS Console'),
    clients:{},
    buffer:'',
    waiters:[],
    pendingPrompt:'',
    inputActive:false,
    inputMode:0x0001|0x0002|0x0004,
    outputMode:0,
    inputCodePage:65001,
    outputCodePage:65001,
    attributes:7,
    history:[],
    historyMax:100,
    historyIndex:-1,
    historyDraft:'',
    completion:null,
    outputId:'jplopsoft_conhost_output_'+String(id),
    inputRowId:'jplopsoft_conhost_inputrow_'+String(id),
    promptId:'jplopsoft_conhost_prompt_'+String(id),
    inputId:'jplopsoft_conhost_input_'+String(id),
    closing:false
  };

  jplopsoft_XSH.consoleSessions[String(id)]=session;

  h=jplopsoft_CreateWindowEx(
    jplopsoft_WS_EX_APPWINDOW,
    'ExOS.Window',
    session.title,
    jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,
    90+(id%7)*22,
    70+(id%7)*18,
    900,
    620,
    null,null,null,
    {
      appId:'conhost_'+String(id),
      icon:'cmd',
      windowClass:'jplopsoft_conhost-window',
      clientClass:'jplopsoft_conhost-client',
      taskbar:true,
      ntProcessKey:conhost?conhost.key:ctx.process.key,
      ntImageName:'conhost.exe',
      ntDescription:'ExOS Console Window Host',
      ntParentKey:ctx.process?ctx.process.key:'',
      wndProc:function(hwnd,msg){
        if(msg===jplopsoft_WM_CLOSE){
          jplopsoft_xshConsoleCloseSession(
            session,
            'ConsoleWindowClose'
          );
          return 0;
        }

        return null;
      }
    }
  );

  session.hwnd=h;
  jplopsoft_conhostBindClipboardPresentation(session,h);

  client=jplopsoft_GetClientElement(h);

  if(client){
    out=document.createElement('pre');
    out.id=session.outputId;
    out.className='jplopsoft_conhost-output';
    client.appendChild(out);

    row=document.createElement('div');
    row.id=session.inputRowId;
    row.className='jplopsoft_conhost-inputrow';

    prompt=document.createElement('span');
    prompt.id=session.promptId;
    prompt.className='jplopsoft_conhost-prompt';
    row.appendChild(prompt);

    input=document.createElement('input');
    input.id=session.inputId;
    input.className='jplopsoft_conhost-input';
    input.type='text';
    input.autocomplete='off';
    input.spellcheck=false;

    input.onkeydown=function(e){
      var key;

      e=e||window.event;
      key=String(e.key||'');

      if(e.ctrlKey&&!e.altKey){
        if(key.toLowerCase()==='c'&&input.selectionEnd>input.selectionStart){try{e.preventDefault();}catch(ignoreConsoleCopyKey){}jplopsoft_conhostCopy(session);return;}
        if(key.toLowerCase()==='x'){try{e.preventDefault();}catch(ignoreConsoleCutKey){}jplopsoft_conhostCut(session);return;}
        if(key.toLowerCase()==='v'){try{e.preventDefault();}catch(ignoreConsolePasteKey){}jplopsoft_conhostPaste(session);return;}
        if(key.toLowerCase()==='a'){try{e.preventDefault();}catch(ignoreConsoleAllKey){}input.select();return;}
      }

      if(key==='Enter'){
        try{e.preventDefault();}catch(ignoreConsolePrevent){}
        jplopsoft_xshConsoleSubmit(session);
        return;
      }

      if(key==='ArrowUp'){
        try{e.preventDefault();}catch(ignoreConsoleUp){}
        jplopsoft_xshConsoleHistoryMove(
          session,
          -1
        );
        return;
      }

      if(key==='ArrowDown'){
        try{e.preventDefault();}catch(ignoreConsoleDown){}
        jplopsoft_xshConsoleHistoryMove(
          session,
          1
        );
        return;
      }

      if(key==='Tab'){
        try{e.preventDefault();}catch(ignoreConsoleTab){}

        jplopsoft_xshConsoleAutocomplete(
          session,
          !!e.shiftKey
        );
        return;
      }

      if(key==='F3'){
        try{e.preventDefault();}catch(ignoreConsoleF3){}

        if(session.history.length){
          input.value=String(
            session.history[
              session.history.length-1
            ]||''
          );

          try{
            input.selectionStart=
              input.selectionEnd=
                input.value.length;
          }catch(ignoreConsoleF3Caret){}
        }

        session.completion=null;
        return;
      }

      if(key==='F8'){
        var prefix=
              String(input.value||''),
            hi,
            candidate='';

        try{e.preventDefault();}catch(ignoreConsoleF8){}

        hi=
          session.historyIndex>=0&&
          session.historyIndex<
            session.history.length
            ?session.historyIndex-1
            :session.history.length-1;

        for(;hi>=0;hi--){
          if(
            String(
              session.history[hi]||''
            ).toLowerCase().indexOf(
              prefix.toLowerCase()
            )===0
          ){
            candidate=String(
              session.history[hi]||''
            );
            session.historyIndex=hi;
            break;
          }
        }

        if(candidate){
          input.value=candidate;

          try{
            input.selectionStart=
              input.selectionEnd=
                input.value.length;
          }catch(ignoreConsoleF8Caret){}
        }

        session.completion=null;
        return;
      }

      if(
        key.toLowerCase()==='c'&&
        (e.ctrlKey||e.metaKey)
      ){
        try{e.preventDefault();}catch(ignoreConsoleBreak){}

        jplopsoft_xshConsoleBreakCurrentLine(
          session
        );
        return;
      }

      if(key==='Escape'){
        try{e.preventDefault();}catch(ignoreConsoleEsc){}
        input.value='';
        session.completion=null;
        return;
      }

      session.completion=null;
    };

    row.appendChild(input);
    client.appendChild(row);

    jplopsoft_xshConsoleApplyAttribute(
      session
    );
  }

  return session;
}

function jplopsoft_xshConsoleAttachSession(ctx,session){
  if(!ctx||!session)return false;

  session.clients[String(ctx.pid)]=1;
  ctx.consoleId=session.id;

  if(ctx.process){
    ctx.process.consoleId=session.id;
    ctx.process.consoleHostPid=
      session.conhostProcess
        ?session.conhostProcess.pid
        :0;

    if(
      ctx.process.peb&&
      ctx.process.peb.processParameters
    ){
      ctx.process.peb.processParameters.consoleHandle=
        session.id;
      ctx.process.peb.processParameters.standardInputHandle=
        -10;
      ctx.process.peb.processParameters.standardOutputHandle=
        -11;
      ctx.process.peb.processParameters.standardErrorHandle=
        -12;
    }
  }

  return true;
}

function jplopsoft_xshConsoleAttachAutomatic(ctx,parentCtx){
  var parentSession=null,session;

  if(!ctx)return false;

  if(parentCtx&&parentCtx.consoleId){
    parentSession=jplopsoft_xshConsoleById(
      parentCtx.consoleId
    );
  }

  session=parentSession||jplopsoft_xshConsoleCreateSession(ctx);

  return jplopsoft_xshConsoleAttachSession(
    ctx,
    session
  );
}

function jplopsoft_xshConsoleAlloc(ctx){
  if(jplopsoft_xshConsoleForProcess(ctx))return false;

  return jplopsoft_xshConsoleAttachSession(
    ctx,
    jplopsoft_xshConsoleCreateSession(ctx)
  );
}

function jplopsoft_xshConsoleAttachToProcess(ctx,targetPid){
  var target;

  if(jplopsoft_xshConsoleForProcess(ctx)){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_ACCESS_DENIED,
      'Process is already attached to a console.'
    );
  }

  targetPid=Number(targetPid)>>>0;

  if(targetPid===0xFFFFFFFF){
    targetPid=ctx.ppid;
  }

  target=jplopsoft_xshRunByPid(targetPid);

  if(!target||!target.consoleId){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Target process does not own an ExOS console.'
    );
  }

  return jplopsoft_xshConsoleAttachSession(
    ctx,
    jplopsoft_xshConsoleById(target.consoleId)
  );
}

function jplopsoft_xshConsoleDetach(ctx){
  var session=jplopsoft_xshConsoleForProcess(ctx),
      key,k,count=0,p;

  if(!session||!ctx)return false;

  jplopsoft_xshConsoleCancelReads(ctx);

  delete session.clients[String(ctx.pid)];

  ctx.consoleId=0;

  if(ctx.process){
    ctx.process.consoleId=0;
    ctx.process.consoleHostPid=0;

    if(
      ctx.process.peb&&
      ctx.process.peb.processParameters
    ){
      ctx.process.peb.processParameters.consoleHandle=0;
      ctx.process.peb.processParameters.standardInputHandle=0;
      ctx.process.peb.processParameters.standardOutputHandle=0;
      ctx.process.peb.processParameters.standardErrorHandle=0;
    }
  }

  for(k in session.clients){
    if(session.clients.hasOwnProperty(k))count++;
  }

  if(count===0){
    session.closing=true;

    try{
      if(session.hwnd&&jplopsoft_user32GetRecord(session.hwnd)){
        jplopsoft_DestroyWindow(session.hwnd);
      }
    }catch(ignoreConhostWindow){}

    p=session.conhostProcess;

    if(p&&p.alive){
      p.alive=false;
      p.exitTime=jplopsoft_ntKernelNow();
      p.exitStatus=0;
      delete jplopsoft_NT_KERNEL.processByPid[String(p.pid)];
    }

    delete jplopsoft_XSH.consoleSessions[String(session.id)];
  }

  return true;
}

function jplopsoft_xshConsoleCloseSession(session,reason){
  jplopsoft_conhostDismissClipboardPresentation(session);
  var pids=[],k,i,ctx;

  if(!session||session.closing)return false;

  session.closing=true;

  for(k in session.clients){
    if(session.clients.hasOwnProperty(k)){
      pids.push(parseInt(k,10)||0);
    }
  }

  for(i=0;i<pids.length;i++){
    ctx=jplopsoft_xshRunByPid(pids[i]);

    if(ctx&&!ctx.terminating){
      jplopsoft_xshTerminate(
        ctx,
        0,
        String(reason||'ConsoleClosed'),
        false
      );
    }
  }

  return true;
}

function jplopsoft_xshConsoleSetTitle(ctx,title){
  var session=jplopsoft_xshConsoleForProcess(ctx);

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  session.title=String(title||'ExOS Console');

  if(session.hwnd&&jplopsoft_user32GetRecord(session.hwnd)){
    jplopsoft_SetWindowText(
      session.hwnd,
      session.title
    );
  }

  return true;
}

function jplopsoft_xshConsoleClear(ctx){
  var session=jplopsoft_xshConsoleForProcess(ctx);

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  session.buffer='';
  session.pendingPrompt='';
  jplopsoft_xshConsoleRender(session);

  return true;
}

function jplopsoft_xshConsoleInfo(ctx){
  var session=jplopsoft_xshConsoleForProcess(ctx),
      lines;

  if(!session){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'The process is not attached to a console.'
    );
  }

  lines=String(session.buffer||'').split(/\r?\n/);

  return{
    size:{x:120,y:3000},
    cursorPosition:{
      x:lines.length
        ?lines[lines.length-1].length
        :0,
      y:Math.max(0,lines.length-1)
    },
    attributes:session.attributes,
    window:{left:0,top:0,right:119,bottom:39},
    maximumWindowSize:{x:120,y:40},
    consoleId:session.id,
    consoleHostPid:
      session.conhostProcess
        ?session.conhostProcess.pid
        :0
  };
}


function jplopsoft_xshCreateHostWindow(ctx){
  var h,client,toolbar,b,stateNode,pre,status;
  h=jplopsoft_CreateWindowEx(
    jplopsoft_WS_EX_APPWINDOW,'ExOS.Window',ctx.name+' - XSH Sandbox [PID '+ctx.pid+']',
    jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,
    120+(ctx.runId%6)*24,80+(ctx.runId%6)*20,720,520,null,null,null,
    {appId:ctx.appId,icon:'xsh',windowClass:'jplopsoft_xsh-host-window',clientClass:'jplopsoft_xsh-host-client',taskbar:true,xshPid:ctx.pid,
     ntProcessKey:ctx.process.key,ntImageName:'xshhost.exe',ntDescription:'ExOS XSH Sandbox Host',ntParentKey:ctx.parentProcess?ctx.parentProcess.key:'proc:explorer',
     wndProc:function(hwnd,msg){if(msg===jplopsoft_WM_CLOSE){jplopsoft_xshTerminate(ctx,0,'WindowClose',false);return 0;}return null;}}
  );
  if(!h)return 0;ctx.hostHwnd=h;ctx.windows[String(h)]=1;client=jplopsoft_GetClientElement(h);if(!client)return h;
  toolbar=document.createElement('div');toolbar.className='jplopsoft_xsh-toolbar';
  b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.textContent='API';b.onclick=function(){jplopsoft_xshPrintApi(ctx);};toolbar.appendChild(b);
  b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.textContent='I/O Trace';b.onclick=function(){jplopsoft_xshPrintIrpTrace(ctx);};toolbar.appendChild(b);
  b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.textContent='VDO';b.onclick=function(){jplopsoft_xshAppendConsole(ctx,JSON.stringify(jplopsoft_xshSystemVdoInfo(),null,2),'info');};toolbar.appendChild(b);
  b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.textContent='Terminate';b.onclick=function(){jplopsoft_xshTerminate(ctx,1,'UserTerminate',false);};toolbar.appendChild(b);
  stateNode=document.createElement('span');stateNode.className='jplopsoft_xsh-state';stateNode.id=ctx.stateId;stateNode.textContent='Initializing';toolbar.appendChild(stateNode);client.appendChild(toolbar);
  pre=document.createElement('pre');pre.id=ctx.consoleId;pre.className='jplopsoft_xsh-console';client.appendChild(pre);
  status=document.createElement('div');status.id=ctx.statusId;status.className='jplopsoft_xsh-status';status.textContent='Sandbox: opaque origin ｜ CSP network=deny ｜ PID '+ctx.pid;client.appendChild(status);
  return h;
}

function jplopsoft_xshPrintApi(ctx){jplopsoft_xshAppendConsole(ctx,'XSH4 API\n  kernel32: CreateFile ReadFile ReadFileBuffer WriteFile CloseHandle GetFileSize FlushFileBuffers ReadTextFile WriteTextFile CreateDirectory CreateSymbolicLink CreateJunction DefineDosDevice QueryDosDevice GetFileAttributes ListDirectory DeleteFile RemoveDirectory MoveFile CopyFile SetCurrentDirectory GetCurrentDirectory SetEnvironmentVariable GetEnvironmentVariable GetEnvironmentStrings GetStdHandle SetStdHandle CreatePipe AllocConsole FreeConsole AttachConsole WriteConsole ReadConsole SetConsoleTitle GetConsoleTitle GetConsoleMode SetConsoleMode SetConsoleTextAttribute GetConsoleScreenBufferInfo GetConsoleCommandHistory GetConsoleCommandHistoryLength SetConsoleNumberOfCommands ExpungeConsoleCommandHistory ClearConsole GetConsoleCP GetConsoleOutputCP CreateFileMapping OpenFileMapping MapViewOfFile UnmapViewOfFile FlushViewOfFile ReadMappedView WriteMappedView VirtualAlloc VirtualFree VirtualProtect VirtualQuery ReadVirtualMemory WriteVirtualMemory GlobalMemoryStatusEx QueryVmmStatistics CreateJobObject OpenJobObject SetInformationJobObject AssignProcessToJobObject QueryInformationJobObject TerminateJobObject CreateIoCompletionPort GetQueuedCompletionStatus PostQueuedCompletionStatus ReadFileAsync WriteFileAsync CancelIoEx CreateProcess OpenProcess GetProcessId TerminateProcess GetPriorityClass SetPriorityClass GetProcessAffinityMask SetProcessAffinityMask QueryFullProcessImageName VirtualQueryEx ReadProcessMemory WriteProcessMemory CreateThread PostThreadMessage GetThreadMessage WaitForSingleObject GetExitCodeThread TerminateThread DeviceIoControl\n  ntdll: NtCreateFile NtReadFile NtWriteFile NtClose NtQuerySystemInformation NtQueryInformationProcess NtSetInformationProcess NtDeviceIoControlFile NtAllocateVirtualMemory NtFreeVirtualMemory NtProtectVirtualMemory NtQueryVirtualMemory NtReadVirtualMemory NtWriteVirtualMemory NtCreateSection NtOpenSection NtMapViewOfSection NtUnmapViewOfSection NtQuerySection NtReadSection NtWriteSection NtCreateJobObject NtOpenJobObject NtAssignProcessToJobObject NtSetInformationJobObject NtQueryInformationJobObject NtTerminateJobObject NtCreateIoCompletion NtOpenIoCompletion NtSetIoCompletion NtRemoveIoCompletion NtCreateUserProcess NtTerminateProcess\n  user32: CreateWindow SetWindowText ShowWindow DestroyWindow GetForegroundWindow SetForegroundWindow LoadIcon GetIconInfo EnumIconResources SetWindowIcon GetMessage PeekMessage PostMessage DispatchMessage InvalidateRect UpdateWindow CreateControl(COMBOBOX/LISTBOX/GROUPBOX/FRAME) SetControlText GetControlText AppendControlText SetControlProperty GetControlProperty SetControlStyle InsertControlText FocusControl ClearControlChildren GetCursorPos ClientToScreen ScreenToClient SetCapture GetCapture ReleaseCapture MoveWindow SetWindowPos GetWindowLong SetWindowLong GetSystemMetrics RegisterHotKey UnregisterHotKey PickImageDataUrl PickFiles PromptBox ConfirmBox MessageBox OpenClipboard CloseClipboard EmptyClipboard SetClipboardData GetClipboardData IsClipboardFormatAvailable EnumClipboardFormats RegisterClipboardFormat GetClipboardSequenceNumber OnControl OnWindow OnHotKey\n  gdi32(exos_gdi32.js): GetDC ReleaseDC BeginPaint EndPaint CreateDC CreatePrinterDC StartDoc StartPage EndPage EndDoc AbortDoc PrintImage GetPrintJobInfo CreateCompatibleDC DeleteDC CreatePen CreateSolidBrush CreateFont EnumFontFamiliesEx CreateBitmap CreateCompatibleBitmap SelectObject DeleteObject MoveToEx LineTo Rectangle Ellipse Polygon Polyline PolyBezier BitBlt ApplyImageFilter TextOut ExtTextOut GetTextExtentPoint32 CreateRectRgn CreateEllipticRgn CreatePolygonRgn SelectClipRgn SetMapMode LPtoDP DPtoLP\n  game2d(exos_2dgame_sdk.js / game2d.dll): GetVersion QueryCapabilities ResolveAssetPath LoadTextureFile LoadSampleFile LoadMusicFile LoadTilemapFile LoadJsonFile LoadTextFile CreateAssetManager DestroyAssetManager AssetResolvePath AssetLoadTexture AssetLoadSample AssetLoadMusic AssetLoadTilemap AssetLoadJson AssetLoadText AssetGetStats AssetClearCache CreateScene CreateCameraObject CreateSpriteObject CreateTransform2D CreateRenderTexture CreateAnimator CreateStateMachine CreateGameStateMachine CreateTween CreateTimer CreateInputActionMap WorldToScreen DebugDraw CreatePhysicsWorld2D CreatePhysicsBody2D AddCollider2D TestHitboxHurtbox CreateProjectileSystem CreateUIContext CreateFont CreateTileset ComputeAutotile CreateNavigationMap CreateAudioBus WriteSaveData ReadSaveData CreateLocalization CreateDialogueSystem CreateLight2D SetParticleCurves CreateTransition CreateSurface DestroySurface ResizeSurface SetSurfaceOptions FocusSurface PresentFrame PollInput WaitFrame GetSurfaceInfo GetFrameStats MeasureText CreateTexture DestroyTexture CaptureFrame CreateParticleEmitter EmitParticles UpdateParticleEmitter ClearParticleEmitter DestroyParticleEmitter CreateTilemap DestroyTilemap GetTile SetTile TestTilemapAABB SetTilemapTriggers QueryTilemapTriggers ResolveTilemapAABB FindTilemapPath TestAABB TestCircle TestPoint TestHitboxes CreateAnimation DestroyAnimation SetAnimationState AdvanceAnimation GetAnimationState CreateEntityWorld DestroyEntityWorld SpawnEntity UpdateEntity GetEntity RemoveEntity QueryEntities StepEntityWorld TestEntityCollisions ComputeCamera AddCameraShake Ease PlayTone StopTone PlaySequence StopAllTones RumbleGamepad\n  d3d11(exos_d3d11.js): D3D11CreateDeviceAndSwapChain CreateBuffer CreateTexture2D CreateVertexShader CreatePixelShader CreateInputLayout IASetVertexBuffers IASetIndexBuffer IASetPrimitiveTopology VSSetShader PSSetShader OMSetRenderTargets RSSetViewports ClearRenderTargetView Draw DrawIndexed PresentTextureFrame Present\n  d3dx/three32(exos_d3dx.js + three.min.js): Scene Camera Geometry Material Mesh Light WebGLRenderer TextureLoader Clock\n  comctl32(exos_comctl32.js): InitCommonControlsEx GetCommonControlClasses CreateCommonControl SysListView32 SysTreeView32 SysHeader32 SysTabControl32 ToolbarWindow32 ReBarWindow32 SysPager StatusBar ProgressBar ToolTip Animate Trackbar UpDown DateTimePicker MonthCalendar IPAddress SysLink ImageList\n  comdlg32(exos_comdlg32.js): GetOpenFileName GetSaveFileName ChooseColor ChooseFont PrintDlg PrintDlgEx PageSetupDlg FindText ReplaceText\n  zipfldr(exos_zipfldr.js): GetVersion IsCompressedFolder CreateArchive OpenArchive BindToObject CloseArchive EnumItems ListDirectory GetItemInfo ReadItem ExtractItem ExtractAll AddFile AddPath AddPickedFile DeleteItem CreateFolder MakeVirtualPath ParseVirtualPath\n  wininet: InternetOpen InternetOpenUrl HttpOpenRequest HttpAddRequestHeaders HttpSendRequest InternetReadFile InternetReadText InternetQueryInfo InternetCloseHandle QueryNetworkPolicy\n  ws2_32: WSAStartup socket connect send recv shutdown closesocket select GetSocketState (WebSocket backend; no raw TCP/UDP)\n  ole32: OleInitialize CreateDataObject SetData GetData EnumFormatEtc OleSetClipboard OleGetClipboard RegisterDragDrop DoDragDrop DragEnter DragOver Drop\n  crypt32/bcrypt: ExMd3 ExMd3N ExesEncrypt ExesDecrypt CryptProtectData CryptUnprotectData BCryptGenRandom BCryptHash BCryptDeriveKeyPBKDF2\n  riched20/msftedit: CreateRichEdit SetText GetText SetHTML GetHTML ExecCommand GetSelection SetSelection InsertText InsertImage\n  webview2/shdocvw: CreateCoreWebView2Environment CreateCoreWebView2Controller Navigate NavigateToString Reload GoBack GoForward PostWebMessageAsString\n  uxtheme: IsThemeActive OpenThemeData CloseThemeData SetWindowTheme GetThemeColor ApplyTheme\n  dwmapi: DwmIsCompositionEnabled DwmEnableBlurBehindWindow DwmExtendFrameIntoClientArea DwmSetWindowAttribute DwmGetWindowAttribute DwmFlush\n  ExOS.WinUI: Render RenderMany SetData\n  ExOS.MediaFoundation(exos_media.js): MFStartup CreateAudioSession CreateSourceFromPath CreateVideoFromPath Play Pause Stop Seek SetVolume SetPlaybackRate SetLoop SetPan SetEQ GetState GetSpectrum GetWaveform CloseMediaHandle\n  advapi32(exos_advapi32.js): RegOpenKeyEx RegCreateKeyEx RegCloseKey RegQueryValueEx RegGetValue RegSetValueEx RegEnumKeyEx RegEnumValue RegQueryInfoKey RegDeleteValue RegDeleteKey RegFlushKey ConvertStringSecurityDescriptorToSecurityDescriptor ConvertSecurityDescriptorToStringSecurityDescriptor GetFileSecurity SetFileSecurity GetNamedSecurityInfo SetNamedSecurityInfo GetSecurityInfo SetSecurityInfo InitializeAcl SetEntriesInAcl GetExplicitEntriesFromAcl OpenProcessToken GetTokenInformation DuplicateTokenEx CreateRestrictedToken CheckTokenMembership PrivilegeCheck AdjustTokenPrivileges LookupPrivilegeValue LookupPrivilegeName GetUserName LookupAccountSid LookupAccountName ConvertSidToStringSid ConvertStringSidToSid IsValidSid EqualSid\n  shell32: SHGetFileInfo SHGetFileAssociation SHGetContextMenu TrackContextMenu TrackPopupMenu ShellExecute OpenPath LaunchSystemApp InvokeCommand SHFileOperation SHBrowseForFolder SHChangeNotify GetTaskbarInfo GetStartMenuModel GetDesktopItems RefreshDesktop GetDesktopPersonalization SetDesktopPersonalization ShowNotification DownloadPath RegisterFlyout UnregisterFlyout DoDragDrop BeginDragDrop DragOver Drop SHQueryRecycleBin SHRestoreFromRecycleBin SHDeleteFromRecycleBin SHEmptyRecycleBin\n  ExOS: LoadLibrary UploadPickedFile ReleasePickedFile QuerySystemConfig QueryLocalAccounts CreateLocalAccount ResetLocalAccountPassword SetLocalAccountEnabled SetLocalAccountType SetLocalAccountProfile DeleteLocalAccount QueryEvents QueryEventLogInfo QueryServiceAuthorization QueryServiceCore QueryServices RunServiceNow ControlService\n  exes: GetStatus QuerySystemVdo QueryDosDevice GetBackingStore FlushSystemVdo\n  io: GetIrpTrace ClearIrpTrace GetDriverStack GetVdoBridge\n  hal: QueryCapabilities\n  process: pid ppid env argv imagePath cwd ExitProcess','info');}
function jplopsoft_xshPrintIrpTrace(ctx){
  var a=ctx.irpTrace.slice(-20),i,j,irp,s='';
  for(i=0;i<a.length;i++){
    irp=a[i];s+='\n'+irp.id+' '+irp.majorFunction+' '+irp.path+' '+(irp.statusName||'PENDING')+'\n';
    for(j=0;j<irp.stages.length;j++)s+='  +'+irp.stages[j].t+'ms ['+irp.stages[j].layer+'] '+irp.stages[j].driver+' '+irp.stages[j].action+(irp.stages[j].detail?' - '+irp.stages[j].detail:'')+'\n';
  }
  jplopsoft_xshAppendConsole(ctx,s||'[no IRP trace]','info');
}

function jplopsoft_xshCreateAppWindow(ctx,spec){
  var s=spec||{},seq=++ctx.windowSeq,appId='xsh_'+ctx.pid+'_w'+seq,h,client,
      taskbar=s.taskbar!==false,
      exStyle=taskbar?jplopsoft_WS_EX_APPWINDOW:jplopsoft_WS_EX_TOOLWINDOW;
  h=jplopsoft_CreateWindowEx(
    exStyle,'ExOS.Window',String(s.title||ctx.name),jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,
    parseInt(s.x,10)||170+seq*18,parseInt(s.y,10)||110+seq*16,
    Math.max(280,Math.min(1200,parseInt(s.width,10)||560)),Math.max(180,Math.min(900,parseInt(s.height,10)||380)),
    null,null,null,
    {appId:appId,icon:String(s.icon||ctx.icon||'xsh'),windowClass:'jplopsoft_xsh-app-window',clientClass:'jplopsoft_xsh-app-client',taskbar:taskbar,xshPid:ctx.pid,
     ntProcessKey:ctx.process.key,ntImageName:'xshhost.exe',ntDescription:'XSH Application Window',ntParentKey:ctx.parentProcess?ctx.parentProcess.key:'proc:explorer',
     wndProc:function(hwnd,msg){if(msg===jplopsoft_WM_CLOSE){delete ctx.windows[String(hwnd)];jplopsoft_DestroyWindow(hwnd);if(ctx.autoExitOnLastWindow){window.setTimeout(function(){var k,count=0;for(k in ctx.windows)if(ctx.windows.hasOwnProperty(k)&&parseInt(k,10)!==parseInt(ctx.hostHwnd,10))count++;if(count===0)jplopsoft_xshTerminate(ctx,0,'LastWindowClosed',false);},0);}return 0;}return null;}}
  );
  if(!h)throw new Error('CreateWindow failed.');ctx.windows[String(h)]=1;client=jplopsoft_GetClientElement(h);if(client)client.setAttribute('data-xsh-pid',String(ctx.pid));return h;
}

function jplopsoft_xshControl(ctx,controlId){return ctx.controls[String(controlId||'')]||null;}
function jplopsoft_xshLoadIcon(ctx,dll,name){
  var token;
  if(typeof jplopsoft_shareResLoadIcon!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_share_res.js is not loaded.');
  token=jplopsoft_shareResLoadIcon(dll,name);
  if(!token)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Icon resource not found: '+String(dll||'shell32.dll')+'!'+String(name||''));
  return token;
}
function jplopsoft_xshGetIconInfo(ctx,value){
  var r=typeof jplopsoft_shareResResolve==='function'?jplopsoft_shareResResolve(value,'shell32.dll'):null;
  if(!r)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Icon resource not found.');
  return r;
}
function jplopsoft_xshEnumIconResources(ctx,dll){
  if(typeof jplopsoft_shareResEnumIcons!=='function')return[];
  return jplopsoft_shareResEnumIcons(dll);
}
function jplopsoft_xshSetWindowIcon(ctx,hwnd,icon){
  var h=parseInt(hwnd,10)||0,rec;
  if(!ctx.windows[String(h)])throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'HWND is not owned by this XSH process.');
  if(!jplopsoft_shareResResolve(icon,'shell32.dll'))throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Icon resource not found.');
  rec=jplopsoft_user32GetRecord(h);
  if(!rec)return false;
  rec.icon=String(icon);
  var winNode=rec.windowId?document.getElementById(rec.windowId):null, titleIcon=winNode&&winNode.querySelector?winNode.querySelector('.jplopsoft_wm-title-icon'):null;
  if(titleIcon){titleIcon.setAttribute('data-exfs-svg',rec.icon);jplopsoft_svgIconApply(titleIcon,rec.icon,18);}
  if(rec.taskbar)jplopsoft_taskbarEnsureApp(rec.appId,rec.icon,rec.title);
  return true;
}
function jplopsoft_xshApplySafeStyle(n,style){var s=style||{},k,allowed={display:1,position:1,left:1,top:1,right:1,bottom:1,inset:1,zIndex:1,pointerEvents:1,transform:1,width:1,height:1,minWidth:1,minHeight:1,maxWidth:1,maxHeight:1,margin:1,marginTop:1,marginRight:1,marginBottom:1,marginLeft:1,padding:1,paddingTop:1,paddingRight:1,paddingBottom:1,paddingLeft:1,boxSizing:1,fontSize:1,fontWeight:1,fontFamily:1,lineHeight:1,textAlign:1,whiteSpace:1,overflow:1,overflowX:1,overflowY:1,resize:1,border:1,borderRadius:1,background:1,color:1,gap:1,gridTemplateColumns:1,gridTemplateRows:1,alignItems:1,justifyContent:1,flexDirection:1,flexWrap:1,flex:1,opacity:1,cursor:1,boxShadow:1,borderTop:1,borderRight:1,borderBottom:1,borderLeft:1};if(!n||!n.style)return;for(k in s){if(!s.hasOwnProperty(k)||!allowed[k])continue;try{n.style[k]=String(s[k]);}catch(ignoreXshStyle){}}}
function jplopsoft_xshControlParent(ctx,client,parentId){var p=parentId?jplopsoft_xshControl(ctx,parentId):null;return p||client;}

function jplopsoft_xshSetControlStyle(ctx,id,style){
  var n=jplopsoft_xshControl(ctx,id);

  if(!n){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Control not found.'
    );
  }

  jplopsoft_xshApplySafeStyle(
    n,
    style||{}
  );

  return true;
}

function jplopsoft_xshTextSelection(n){
  return{
    start:typeof n.selectionStart==='number'?n.selectionStart:0,
    end:typeof n.selectionEnd==='number'?n.selectionEnd:0,
    direction:String(n.selectionDirection||'none')
  };
}
function jplopsoft_xshAttachTextControlEvents(ctx,id,n){
  function send(action,e){
    var sel=jplopsoft_xshTextSelection(n);
    jplopsoft_xshSendEvent(
      ctx,
      {
        event:'control',
        controlId:id,
        action:action,
        value:n.value,
        checked:('checked' in n)?!!n.checked:false,
        selectionStart:sel.start,
        selectionEnd:sel.end,
        selectionDirection:sel.direction,
        key:String(e&&e.key||''),
        keyCode:parseInt(e&&(e.keyCode||e.which),10)||0,
        ctrlKey:!!(e&&e.ctrlKey),
        shiftKey:!!(e&&e.shiftKey),
        altKey:!!(e&&e.altKey),
        scrollTop:Number(n.scrollTop)||0,
        scrollLeft:Number(n.scrollLeft)||0
      }
    );
  }
  n.onchange=function(e){send('change',e);};
  n.oninput=function(e){send('input',e);};
  n.onfocus=function(e){jplopsoft_xshRememberFocus(ctx,id,n);send('focus',e);};
  n.onclick=function(e){send('click',e);};
  n.onkeyup=function(e){send('keyup',e);};
  n.onscroll=function(e){send('scroll',e);};
  n.onkeydown=function(e){
    e=e||window.event;
    var key=String(e.key||'').toLowerCase();
    if(
      (e.ctrlKey&&(key==='s'||key==='o'||key==='f'||key==='h'||key==='g'))||
      key==='f3'||key==='f5'||
      (key==='tab'&&n._exosAcceptTab===true)
    ){
      try{e.preventDefault();}catch(ignorePreventDefault){}
      try{e.returnValue=false;}catch(ignoreReturnValue){}
    }
    send('keydown',e);
  };
}


/* ------------------------- ExOS comctl32.dll ---------------------------
 * EXOS_COMCTL32_V1
 *
 * SysListView32:
 * - Details/List/Large Icon/Small Icon views
 * - multi-select / Ctrl / Shift range selection
 * - marquee selection
 * - draggable column widths
 * - header sort notifications and optional automatic sorting
 *
 * SysTreeView32:
 * - nested hierarchy
 * - expand/collapse
 * - lazy-population friendly SetChildren API
 * - selection and expansion notifications
 * --------------------------------------------------------------------- */

/* Common Controls host implementation is loaded from exos_comctl32.js. */


function jplopsoft_xshTopologySnapshot(mode){
  var out=[],nodes=state&&state.nodes&&Object.prototype.toString.call(state.nodes)==='[object Array]'?state.nodes:[],
      i,n,name,path,parentId,modeName=String(mode||'physical').toLowerCase();

  if(modeName==='sandbox'){
    out.push({id:'root',parentId:'',label:'本機磁碟 (C:)',kind:'root',path:'C:\\',detail:'ExOS 使用者沙盒根目錄'});
    for(i=0;i<nodes.length&&out.length<181;i++){
      n=nodes[i];
      if(!n||!n.id)continue;
      try{name=jplopsoft_decName(n);}catch(ignoreName){name='';}
      if(!name)name='[encrypted #'+String(n.id)+']';
      try{path=jplopsoft_xshNodePath(n);}catch(ignorePath){path='';}
      parentId=parseInt(n.parent_id,10)||0;
      out.push({
        id:'n'+String(n.id),
        parentId:parentId>0?'n'+String(parentId):'root',
        label:String(name),
        kind:n.type==='folder'?'folder':'file',
        type:String(n.type||''),
        path:String(path||''),
        detail:n.type==='folder'?'Logical Folder':'Encrypted ExFS Object',
        size:parseInt(n.original_size,10)||0
      });
    }
    return out;
  }

  out.push({id:'phys_root',parentId:'',label:'/_exfs/',kind:'root',detail:'ExFS PHP VDO backing root'});
  out.push({id:'mft',parentId:'phys_root',label:'_MFT.x6f',kind:'metadata',detail:'Master File Table / nodes'});
  out.push({id:'mftmirr',parentId:'phys_root',label:'_MFTMirr.x6f',kind:'metadata',detail:'MFT mirror'});
  out.push({id:'log',parentId:'phys_root',label:'_LogFile.x6f',kind:'metadata',detail:'ExFS transaction log'});
  out.push({id:'volume',parentId:'phys_root',label:'_Volume.x6f',kind:'metadata',detail:'Volume metadata'});
  out.push({id:'secure',parentId:'phys_root',label:'_Secure.x6f',kind:'security',detail:'Security descriptors / ACL'});
  out.push({id:'storage',parentId:'phys_root',label:'_Storage/',kind:'folder',detail:'Encrypted data object store'});
  for(i=0;i<nodes.length&&out.length<135;i++){
    n=nodes[i];
    if(!n||!n.id)continue;
    try{name=jplopsoft_decName(n);}catch(ignorePhysName){name='';}
    if(!name)name='#'+String(n.id);
    out.push({
      id:'p'+String(n.id),
      parentId:'storage',
      label:String(name),
      kind:n.type==='folder'?'folder':'data',
      type:String(n.type||''),
      detail:n.type==='folder'?'Logical folder metadata':'Encrypted .x6f data object',
      size:parseInt(n.original_size,10)||0
    });
  }
  return out;
}

function jplopsoft_xshTopologyColor(kind){
  if(kind==='root')return 0xffffff;
  if(kind==='folder')return 0x22d3ee;
  if(kind==='metadata')return 0x60a5fa;
  if(kind==='security')return 0xf59e0b;
  if(kind==='data')return 0xa78bfa;
  return 0xf472b6;
}

function jplopsoft_xshTopologyDisposeObject(obj){
  if(!obj)return;
  try{
    if(obj.traverse){
      obj.traverse(function(child){
        try{if(child.geometry&&child.geometry.dispose)child.geometry.dispose();}catch(ignoreGeometryDispose){}
        try{
          if(child.material){
            if(Object.prototype.toString.call(child.material)==='[object Array]'){
              for(var mi=0;mi<child.material.length;mi++)if(child.material[mi]&&child.material[mi].dispose)child.material[mi].dispose();
            }else if(child.material.dispose)child.material.dispose();
          }
        }catch(ignoreMaterialDispose){}
      });
    }
  }catch(ignoreTraverseDispose){}
}
function jplopsoft_xshTopologyDispose(n){
  var t=n&&n._exosTopologyState?n._exosTopologyState:null;
  if(!t)return;
  t.disposed=true;
  if(t.animationFrame){try{cancelAnimationFrame(t.animationFrame);}catch(ignoreAnim){}}
  if(t.resizeObserver){try{t.resizeObserver.disconnect();}catch(ignoreRO){}}
  try{jplopsoft_xshTopologyDisposeObject(t.group);}catch(ignoreGroupDispose){}
  try{if(t.renderer)t.renderer.dispose();}catch(ignoreRendererDispose){}
  n._exosTopologyState=null;
}

function jplopsoft_xshTopologyReset(n){
  var t=n&&n._exosTopologyState?n._exosTopologyState:null;
  if(!t)return false;
  t.rotX=-0.28;t.rotY=0.35;t.distance=26;
  if(t.group){t.group.rotation.x=t.rotX;t.group.rotation.y=t.rotY;}
  if(t.camera){t.camera.position.set(0,2,t.distance);t.camera.lookAt(0,0,0);}
  return true;
}

function jplopsoft_xshTopologyRebuild(ctx,id,n){
  var t=n&&n._exosTopologyState?n._exosTopologyState:null,T=window.THREE,data,group,map={},levels={},i,d,item,parent,mesh,geo,mat,
      positions={},keys,k,angle,radius,x,y,z,segments=[],a,b,lineGeo,lineMat,line,stats;
  if(!t||!T||!t.scene)return false;
  if(t.group){
    try{t.scene.remove(t.group);}catch(ignoreRemove){}
    try{jplopsoft_xshTopologyDisposeObject(t.group);}catch(ignoreOldTopologyDispose){}
  }
  group=new T.Group();t.scene.add(group);t.group=group;t.pickables=[];
  data=jplopsoft_xshTopologySnapshot(t.mode);t.data=data;
  for(i=0;i<data.length;i++)map[data[i].id]=data[i];
  function depthOf(rec){
    var depth=0,p=rec,guard=0;
    while(p&&p.parentId&&map[p.parentId]&&guard++<24){depth++;p=map[p.parentId];}
    return depth;
  }
  for(i=0;i<data.length;i++){d=depthOf(data[i]);if(!levels[d])levels[d]=[];levels[d].push(data[i]);}
  keys=Object.keys(levels).map(Number).sort(function(a,b){return a-b;});
  for(k=0;k<keys.length;k++){
    d=keys[k];
    for(i=0;i<levels[d].length;i++){
      item=levels[d][i];
      if(d===0){x=0;y=0;z=0;}
      else{
        angle=(i/Math.max(1,levels[d].length))*Math.PI*2+(d%2?0.22:0);
        radius=4.3+d*3.8;
        x=Math.cos(angle)*radius;
        z=Math.sin(angle)*radius;
        y=(d-1)*1.1+(i%3-1)*0.45;
      }
      positions[item.id]=new T.Vector3(x,y,z);
      geo=(item.kind==='folder'||item.kind==='metadata')?new T.BoxGeometry(item.kind==='folder'?0.85:0.7,item.kind==='folder'?0.65:0.7,item.kind==='folder'?0.85:0.7):new T.SphereGeometry(item.kind==='root'?0.95:0.52,16,12);
      mat=new T.MeshStandardMaterial({color:jplopsoft_xshTopologyColor(item.kind),roughness:0.48,metalness:0.14});
      mesh=new T.Mesh(geo,mat);mesh.position.copy(positions[item.id]);mesh.userData={topology:item};group.add(mesh);t.pickables.push(mesh);
    }
  }
  for(i=0;i<data.length;i++){
    item=data[i];
    if(!item.parentId||!positions[item.parentId]||!positions[item.id])continue;
    segments.push(positions[item.parentId],positions[item.id]);
  }
  if(segments.length){
    lineGeo=new T.BufferGeometry().setFromPoints(segments);
    lineMat=new T.LineBasicMaterial({color:0x64748b,transparent:true,opacity:0.58});
    line=new T.LineSegments(lineGeo,lineMat);group.add(line);
  }
  stats=data.length+' nodes ｜ '+(t.mode==='sandbox'?'Sandbox':'Physical');
  if(t.stats)t.stats.textContent=stats;
  jplopsoft_xshSendEvent(ctx,{event:'control',controlId:id,action:'topologyready',nodeCount:data.length,mode:t.mode});
  return true;
}

function jplopsoft_xshTopologyInit(ctx,id,n,spec){
  var canvas=document.createElement('canvas'),stats=document.createElement('div'),tip=document.createElement('div'),t;
  n.style.position='relative';n.style.overflow='hidden';n.style.background='#07101e';
  canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;outline:0;';
  stats.style.cssText='position:absolute;left:10px;bottom:8px;padding:4px 7px;border-radius:5px;background:rgba(15,23,42,.72);color:#cbd5e1;font:11px Segoe UI,Arial,sans-serif;pointer-events:none;';
  tip.style.cssText='display:none;position:absolute;z-index:4;max-width:260px;padding:6px 8px;border-radius:5px;background:rgba(15,23,42,.92);color:#f8fafc;font:12px Segoe UI,Arial,sans-serif;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.28);';
  n.appendChild(canvas);n.appendChild(stats);n.appendChild(tip);
  t={canvas:canvas,stats:stats,tip:tip,mode:String(spec.topologyMode||'physical')==='sandbox'?'sandbox':'physical',renderer:null,scene:null,camera:null,group:null,pickables:[],raycaster:null,mouse:null,rotX:-0.28,rotY:0.35,distance:26,dragging:false,lastX:0,lastY:0,animationFrame:0,resizeObserver:null,disposed:false,data:[]};
  n._exosTopologyState=t;
  function fail(err){
    if(t.disposed)return;
    stats.textContent='3D unavailable';
    jplopsoft_xshSendEvent(ctx,{event:'control',controlId:id,action:'topologyerror',message:String(err&&err.message?err.message:err)});
  }
  function start(){
    try{
      var T=window.THREE;
      if(!T)throw new Error('Three.js is not available.');
      t.renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
      t.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      t.scene=new T.Scene();t.scene.background=new T.Color(0x07101e);
      t.camera=new T.PerspectiveCamera(48,1,0.1,200);t.camera.position.set(0,2,t.distance);t.camera.lookAt(0,0,0);
      t.scene.add(new T.HemisphereLight(0xdbeafe,0x0f172a,1.4));
      var light=new T.DirectionalLight(0xffffff,1.0);light.position.set(6,10,8);t.scene.add(light);
      var grid=new T.GridHelper(38,38,0x334155,0x1e293b);grid.position.y=-3.3;t.scene.add(grid);
      t.raycaster=new T.Raycaster();t.mouse=new T.Vector2();
      jplopsoft_xshTopologyRebuild(ctx,id,n);jplopsoft_xshTopologyReset(n);
      function resize(){
        if(t.disposed||!t.renderer)return;
        var r=n.getBoundingClientRect(),w=Math.max(2,Math.floor(r.width)),h=Math.max(2,Math.floor(r.height));
        t.renderer.setSize(w,h,false);t.camera.aspect=w/h;t.camera.updateProjectionMatrix();
      }
      if(typeof ResizeObserver!=='undefined'){t.resizeObserver=new ResizeObserver(resize);t.resizeObserver.observe(n);}else window.setTimeout(resize,0);
      resize();
      function animate(){if(t.disposed)return;t.animationFrame=requestAnimationFrame(animate);if(t.group&&!t.dragging)t.group.rotation.y+=0.0007;try{t.renderer.render(t.scene,t.camera);}catch(ignoreRender){}}
      animate();
      canvas.onpointerdown=function(e){t.dragging=true;t.lastX=e.clientX;t.lastY=e.clientY;try{canvas.setPointerCapture(e.pointerId);}catch(ignoreCapture){}};
      canvas.onpointermove=function(e){
        if(t.dragging&&t.group){t.rotY+=(e.clientX-t.lastX)*0.008;t.rotX+=(e.clientY-t.lastY)*0.008;t.rotX=Math.max(-1.25,Math.min(1.25,t.rotX));t.group.rotation.x=t.rotX;t.group.rotation.y=t.rotY;t.lastX=e.clientX;t.lastY=e.clientY;}
        var r=canvas.getBoundingClientRect();t.mouse.x=((e.clientX-r.left)/Math.max(1,r.width))*2-1;t.mouse.y=-((e.clientY-r.top)/Math.max(1,r.height))*2+1;t.raycaster.setFromCamera(t.mouse,t.camera);var hit=t.raycaster.intersectObjects(t.pickables,false)[0];
        if(hit&&hit.object&&hit.object.userData&&hit.object.userData.topology){var d=hit.object.userData.topology;tip.style.display='block';tip.style.left=Math.min(r.width-230,Math.max(8,e.clientX-r.left+12))+'px';tip.style.top=Math.min(r.height-60,Math.max(8,e.clientY-r.top+12))+'px';tip.textContent=d.label;}else tip.style.display='none';
      };
      canvas.onpointerup=function(e){t.dragging=false;try{canvas.releasePointerCapture(e.pointerId);}catch(ignoreRelease){}};
      canvas.onpointercancel=function(){t.dragging=false;};
      canvas.onwheel=function(e){try{e.preventDefault();}catch(ignorePrevent){}t.distance=Math.max(8,Math.min(65,t.distance+(e.deltaY>0?2:-2)));t.camera.position.z=t.distance;};
      canvas.onclick=function(e){var r=canvas.getBoundingClientRect();t.mouse.x=((e.clientX-r.left)/Math.max(1,r.width))*2-1;t.mouse.y=-((e.clientY-r.top)/Math.max(1,r.height))*2+1;t.raycaster.setFromCamera(t.mouse,t.camera);var hit=t.raycaster.intersectObjects(t.pickables,false)[0];if(hit&&hit.object&&hit.object.userData&&hit.object.userData.topology)jplopsoft_xshSendEvent(ctx,{event:'control',controlId:id,action:'topologynode',data:hit.object.userData.topology});};
    }catch(e){fail(e);}
  }
  if(window.THREE&&jplopsoft_threeReady())start();
  else jplopsoft_loadOptionalMirroredScript('three',function(err){if(err)fail(err);else start();});
}

function jplopsoft_xshSanitizeRichHtml(html){
  var template=document.createElement('template'),
      allowed={DIV:1,P:1,BR:1,B:1,STRONG:1,I:1,EM:1,U:1,S:1,STRIKE:1,SPAN:1,FONT:1,A:1,UL:1,OL:1,LI:1,BLOCKQUOTE:1,PRE:1,CODE:1,H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,HR:1,IMG:1,TABLE:1,THEAD:1,TBODY:1,TFOOT:1,TR:1,TH:1,TD:1,CAPTION:1},
      styleAllow={'color':1,'background-color':1,'font-weight':1,'font-style':1,'text-decoration':1,'font-family':1,'font-size':1,'text-align':1,'vertical-align':1,'border':1,'border-collapse':1,'padding':1,'margin-left':1,'margin-right':1},
      nodes,i,n,attrs,j,a,clean=[],prop,val,tag,name,href,num;
  template.innerHTML=String(html||'');
  nodes=template.content.querySelectorAll('*');
  for(i=nodes.length-1;i>=0;i--){
    n=nodes[i];tag=String(n.tagName||'').toUpperCase();
    if(!allowed[tag]){
      while(n.firstChild)n.parentNode.insertBefore(n.firstChild,n);
      if(n.parentNode)n.parentNode.removeChild(n);
      continue;
    }
    attrs=Array.prototype.slice.call(n.attributes||[]);
    for(j=0;j<attrs.length;j++){
      a=attrs[j];name=String(a.name||'').toLowerCase();
      if(name==='style')continue;
      if(tag==='IMG'&&name==='src'&&/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(a.value)&&a.value.length<=6*1024*1024)continue;
      if(tag==='IMG'&&(name==='alt'||name==='title'))continue;
      if(tag==='A'&&name==='href'){
        href=String(a.value||'').trim();
        if(/^(?:https?:|mailto:|#|\/)/i.test(href)&&!/^(?:javascript|data|vbscript):/i.test(href))continue;
      }
      if(tag==='A'&&name==='title')continue;
      if(tag==='FONT'&&name==='face'&&String(a.value||'').length<=100)continue;
      if(tag==='FONT'&&name==='color'&&/^(?:#[0-9a-f]{3,8}|rgb\([^)]{1,60}\)|[a-z]{1,30})$/i.test(String(a.value||'')))continue;
      if(tag==='FONT'&&name==='size'&&/^[1-7]$/.test(String(a.value||'')))continue;
      if((tag==='TD'||tag==='TH')&&(name==='colspan'||name==='rowspan')){num=parseInt(a.value,10)||1;if(num>=1&&num<=50)continue;}
      n.removeAttribute(a.name);
    }
    if(n.hasAttribute&&n.hasAttribute('style')){
      clean=[];
      String(n.getAttribute('style')||'').split(';').forEach(function(x){
        var q=x.indexOf(':');if(q<1)return;
        prop=x.substring(0,q).trim().toLowerCase();val=x.substring(q+1).trim();
        if(styleAllow[prop]&&!/[<>{};]/.test(val)&&!/(?:url|expression|behavior|binding)\s*\(/i.test(val))clean.push(prop+':'+val);
      });
      if(clean.length)n.setAttribute('style',clean.join(';'));else n.removeAttribute('style');
    }
  }
  return template.innerHTML;
}

function jplopsoft_xshAttachRichEditEvents(ctx,id,n){
  function send(action,e){jplopsoft_xshSendEvent(ctx,{event:'control',controlId:id,action:action,text:String(n.innerText||''),html:jplopsoft_xshSanitizeRichHtml(n.innerHTML),key:String(e&&e.key||''),code:String(e&&e.code||''),ctrlKey:!!(e&&e.ctrlKey),shiftKey:!!(e&&e.shiftKey),altKey:!!(e&&e.altKey)});}
  n.oninput=function(e){send('input',e);};
  n.onchange=function(e){send('change',e);};
  n.onkeydown=function(e){
    e=e||window.event;
    var key=String(e&&e.key||'').toLowerCase();
    if(e&&e.ctrlKey&&(key==='s'||key==='o'||key==='n'||key==='f'||key==='h')){
      try{e.preventDefault();}catch(ignoreRichPrevent){}
      try{e.returnValue=false;}catch(ignoreRichReturn){}
    }
    send('keydown',e);
  };
  n.onkeyup=function(e){send('keyup',e);};n.onblur=function(e){send('blur',e);};n.onfocus=function(e){jplopsoft_xshRememberFocus(ctx,id,n);send('focus',e);};
  n.onpaste=function(e){var cd=e&&e.clipboardData,html='',text='';try{if(cd){html=String(cd.getData('text/html')||'');text=String(cd.getData('text/plain')||'');}}catch(ignore){}if(!html&&!text)return;try{e.preventDefault();}catch(ignore2){}n.focus();try{if(html)document.execCommand('insertHTML',false,jplopsoft_xshSanitizeRichHtml(html));else document.execCommand('insertText',false,text);}catch(ignore3){}send('input',e);};
}


function jplopsoft_xshNormalizeControlItems(items){
  var src=Array.isArray(items)?items:[],out=[],i,x;
  for(i=0;i<src.length;i++){
    x=src[i];
    if(x&&typeof x==='object')out.push({
      text:String(x.text===undefined||x.text===null?(x.label===undefined||x.label===null?(x.value===undefined||x.value===null?'':x.value):x.label):x.text),
      value:String(x.value===undefined||x.value===null?(x.text===undefined||x.text===null?i:x.text):x.value),
      disabled:!!x.disabled,
      selected:!!x.selected
    });
    else out.push({text:String(x===undefined||x===null?'':x),value:String(x===undefined||x===null?'':x),disabled:false,selected:false});
  }
  return out;
}

function jplopsoft_xshSetSelectItems(n,items){
  var list=jplopsoft_xshNormalizeControlItems(items),i,o;
  while(n.options&&n.options.length)n.remove(0);
  for(i=0;i<list.length;i++){
    o=document.createElement('option');
    o.textContent=list[i].text;
    o.value=list[i].value;
    o.disabled=!!list[i].disabled;
    o.selected=!!list[i].selected;
    n.appendChild(o);
  }
  return list.length;
}

function jplopsoft_xshSelectSnapshot(n){
  var indices=[],values=[],texts=[],i,o;
  if(!n||String(n.tagName||'').toLowerCase()!=='select')return{selectedIndex:-1,selectedIndices:[],selectedValues:[],selectedTexts:[],value:'',text:''};
  for(i=0;i<n.options.length;i++){
    o=n.options[i];
    if(o.selected){indices.push(i);values.push(String(o.value||''));texts.push(String(o.textContent||''));}
  }
  return{
    selectedIndex:Number(n.selectedIndex),
    selectedIndices:indices,
    selectedValues:values,
    selectedTexts:texts,
    value:String(n.value||''),
    text:n.selectedIndex>=0&&n.options[n.selectedIndex]?String(n.options[n.selectedIndex].textContent||''):''
  };
}

function jplopsoft_xshAttachSelectEvents(ctx,id,n){
  function send(action,e){
    var s=jplopsoft_xshSelectSnapshot(n);
    jplopsoft_xshSendEvent(ctx,{
      event:'control',controlId:id,action:action,
      value:s.value,text:s.text,selectedIndex:s.selectedIndex,
      selectedIndices:s.selectedIndices,selectedValues:s.selectedValues,selectedTexts:s.selectedTexts,
      ctrlKey:!!(e&&e.ctrlKey),shiftKey:!!(e&&e.shiftKey),altKey:!!(e&&e.altKey)
    });
  }
  n.onchange=function(e){send('change',e);};
  n.oninput=function(e){send('input',e);};
  n.ondblclick=function(e){send('dblclick',e);};
  n.onkeydown=function(e){send('keydown',e);};
  n.onfocus=function(e){jplopsoft_xshRememberFocus(ctx,id,n);send('focus',e);};
  n.onblur=function(e){send('blur',e);};
}

function jplopsoft_xshCreateControl(ctx,hwnd,spec){
  var client=jplopsoft_GetClientElement(parseInt(hwnd,10)||0),
      s=spec||{},
      type=String(s.type||'label').toLowerCase(),
      id=String(s.id||('ctrl'+(++ctx.controlSeq))),
      n,parent;

  if(!client){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Invalid HWND.'
    );
  }

  if(ctx.controls[id]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_COLLISION,
      'Control id already exists.'
    );
  }

  parent=jplopsoft_xshControlParent(
    ctx,
    client,
    s.parentId
  );

  if(type==='button'){
    n=document.createElement('button');
    n.type='button';
    n.className=
      'jplopsoft_xsh-control jplopsoft_xsh-control-button';
    /*
     * os74:
     * An explicitly supplied empty string is meaningful (color swatches,
     * icon-only controls).  Do not replace it with the control id.
     */
    n.textContent=String(
      s.text===undefined||s.text===null
        ?id
        :s.text
    );

    n.onclick=function(e){
      jplopsoft_xshSendEvent(
        ctx,
        {
          event:'control',
          controlId:id,
          action:'click',
          value:n.value||'',
          ctrlKey:!!(e&&e.ctrlKey),
          shiftKey:!!(e&&e.shiftKey),
          altKey:!!(e&&e.altKey)
        }
      );
    };

    n.ondblclick=function(e){
      jplopsoft_xshSendEvent(
        ctx,
        {
          event:'control',
          controlId:id,
          action:'dblclick',
          value:n.value||'',
          ctrlKey:!!(e&&e.ctrlKey),
          shiftKey:!!(e&&e.shiftKey),
          altKey:!!(e&&e.altKey)
        }
      );
    };
  }else if(type==='combobox'||type==='select'){
    n=document.createElement('select');
    n.className='jplopsoft_xsh-control jplopsoft_xsh-control-combobox';
    n.setAttribute('data-exos-win32-class','COMBOBOX');
    jplopsoft_xshSetSelectItems(n,s.items||[]);
    if(typeof s.selectedIndex!=='undefined')n.selectedIndex=Math.max(-1,Math.min(n.options.length-1,parseInt(s.selectedIndex,10)||0));
    if(typeof s.value!=='undefined')n.value=String(s.value);
    jplopsoft_xshAttachSelectEvents(ctx,id,n);
  }else if(type==='listbox'){
    n=document.createElement('select');
    n.className='jplopsoft_xsh-control jplopsoft_xsh-control-listbox';
    n.setAttribute('data-exos-win32-class','LISTBOX');
    n.multiple=!!s.multiple;
    n.size=Math.max(2,Math.min(64,parseInt(s.rows||s.size,10)||6));
    jplopsoft_xshSetSelectItems(n,s.items||[]);
    if(Array.isArray(s.selectedIndices)){
      for(var lsi=0;lsi<n.options.length;lsi++)n.options[lsi].selected=s.selectedIndices.indexOf(lsi)>=0;
    }else if(typeof s.selectedIndex!=='undefined')n.selectedIndex=Math.max(-1,Math.min(n.options.length-1,parseInt(s.selectedIndex,10)||0));
    jplopsoft_xshAttachSelectEvents(ctx,id,n);
  }else if(type==='groupbox'||type==='frame'){
    n=document.createElement('fieldset');
    n.className='jplopsoft_xsh-control jplopsoft_xsh-control-groupbox';
    n.setAttribute('data-exos-win32-class',type==='frame'?'FRAME':'BUTTON');
    var legend=document.createElement('legend');
    legend.className='jplopsoft_xsh-groupbox-legend';
    legend.textContent=String(s.text||s.title||'');
    n.appendChild(legend);
    n._jplopsoftGroupLegend=legend;
  }else if(type==='input'){
    n=document.createElement('input');
    n.type=String(s.inputType||'text');
    n.className=
      'jplopsoft_xsh-control jplopsoft_xsh-control-input';
    n.value=String(
      s.text!==undefined&&s.text!==null
        ?s.text
        :(s.value!==undefined&&s.value!==null?s.value:'')
    );
    if(n.type==='checkbox'||n.type==='radio'){
      n.checked=!!s.checked;
    }
    if(typeof s.min!=='undefined'&&'min' in n)n.min=String(s.min);
    if(typeof s.max!=='undefined'&&'max' in n)n.max=String(s.max);
    if(typeof s.step!=='undefined'&&'step' in n)n.step=String(s.step);
    n.readOnly=!!s.readOnly;
    if(typeof s.placeholder!=='undefined'){
      n.placeholder=String(s.placeholder||'');
    }
    if(typeof s.spellcheck!=='undefined'){
      n.spellcheck=!!s.spellcheck;
    }
    n._exosAcceptTab=!!s.acceptTab;
    jplopsoft_xshAttachTextControlEvents(ctx,id,n);
  }else if(type==='richedit'){
    n=document.createElement('div');
    n.className='jplopsoft_xsh-control jplopsoft_xsh-control-richedit';
    n.setAttribute('data-exos-rich-edit','1');
    n.contentEditable=s.readOnly?'false':'true';
    n.setAttribute('aria-readonly',s.readOnly?'true':'false');
    n.spellcheck=typeof s.spellcheck==='undefined'?true:!!s.spellcheck;
    if(typeof s.html!=='undefined')n.innerHTML=jplopsoft_xshSanitizeRichHtml(s.html);
    else n.textContent=String(s.text||s.value||'');
    jplopsoft_xshAttachRichEditEvents(ctx,id,n);
  }else if(type==='textarea'){
    n=document.createElement('textarea');
    n.className=
      'jplopsoft_xsh-control jplopsoft_xsh-control-textarea';
    n.value=String(s.text||s.value||'');
    n.readOnly=!!s.readOnly;
    if(typeof s.placeholder!=='undefined'){
      n.placeholder=String(s.placeholder||'');
    }
    if(typeof s.spellcheck!=='undefined'){
      n.spellcheck=!!s.spellcheck;
    }
    jplopsoft_xshAttachTextControlEvents(ctx,id,n);
  }else if(type==='pre'){
    n=document.createElement('pre');
    n.className='jplopsoft_xsh-control jplopsoft_xsh-control-pre';
    n.textContent=String(s.text||'');
  }else if(type==='image'){
    n=document.createElement('img');
    n.className='jplopsoft_xsh-control';
    n.alt=String(s.alt||'');
    if(s.src){
      var imageRes=typeof jplopsoft_shareResResolve==='function'?jplopsoft_shareResResolve(s.src,'shell32.dll'):null;
      if(imageRes){n.src=imageRes.uri;n._exosResourceToken=imageRes.token;}
      else if(/^data:image\/(?:png|jpeg|gif|webp|svg\+xml);base64,/i.test(String(s.src))){n.src=String(s.src);}
    }
  }else if(type==='topology3d'){
    n=document.createElement('div');
    n.className='jplopsoft_xsh-control jplopsoft_xsh-topology3d';
  }else if(type==='htmlpreview'){
    n=document.createElement('iframe');
    n.className='jplopsoft_xsh-control';
    n.setAttribute('sandbox','');
    n.setAttribute('referrerpolicy','no-referrer');
    n.srcdoc=
      '<!doctype html><meta charset="utf-8">'+
      '<meta http-equiv="Content-Security-Policy" '+
      'content="default-src data: blob:; connect-src \'none\'; '+
      'script-src \'none\'; object-src \'none\'; frame-src \'none\'; '+
      'form-action \'none\';">'+
      '<style>html,body{font-family:Segoe UI,Arial,sans-serif;'+
      'margin:10px}</style>'+
      String(s.html||'');
  }else{
    n=document.createElement('div');
    n.className='jplopsoft_xsh-control';
    n.textContent=String(s.text||'');

    n.onclick=function(e){
      jplopsoft_xshSendEvent(
        ctx,
        {
          event:'control',
          controlId:id,
          action:'click',
          ctrlKey:!!(e&&e.ctrlKey),
          shiftKey:!!(e&&e.shiftKey),
          altKey:!!(e&&e.altKey)
        }
      );
    };

    n.ondblclick=function(e){
      jplopsoft_xshSendEvent(
        ctx,
        {
          event:'control',
          controlId:id,
          action:'dblclick',
          ctrlKey:!!(e&&e.ctrlKey),
          shiftKey:!!(e&&e.shiftKey),
          altKey:!!(e&&e.altKey)
        }
      );
    };
  }

  if(s.preventContextMenu){
    n.oncontextmenu=function(e){
      e=e||window.event;
      if(e&&e.preventDefault)e.preventDefault();
      if(e)e.returnValue=false;
      return false;
    };
  }

  if(s.trackPointer){
    (function(){
      function sendPointer(action,e){
        var r=n.getBoundingClientRect
              ?n.getBoundingClientRect()
              :{left:0,top:0,width:0,height:0},
            coalesced=[],
            samples=[],
            i,se;

        /*
         * os74:
         * Chromium/V8 PointerEvent.getCoalescedEvents() carries higher-rate
         * digitizer/mouse samples that may be collapsed into one DOM
         * pointermove.  Forward a bounded sample list to drawing XSH apps so
         * GDI strokes do not lose intermediate coordinates.
         */
        if(
          action==='pointermove'&&
          e&&
          typeof e.getCoalescedEvents==='function'
        ){
          try{
            samples=e.getCoalescedEvents()||[];
          }catch(ignoreCoalesced){
            samples=[];
          }

          if(samples.length>64){
            samples=samples.slice(samples.length-64);
          }

          for(i=0;i<samples.length;i++){
            se=samples[i];
            coalesced.push({
              x:(typeof se.clientX==='number'?se.clientX:0)-r.left,
              y:(typeof se.clientY==='number'?se.clientY:0)-r.top,
              clientX:typeof se.clientX==='number'?se.clientX:0,
              clientY:typeof se.clientY==='number'?se.clientY:0,
              pressure:typeof se.pressure==='number'?se.pressure:0
            });
          }
        }

        jplopsoft_xshSendEvent(
          ctx,
          {
            event:'control',
            controlId:id,
            action:action,
            x:(typeof e.clientX==='number'?e.clientX:0)-r.left,
            y:(typeof e.clientY==='number'?e.clientY:0)-r.top,
            width:Number(r.width)||0,
            height:Number(r.height)||0,
            clientX:typeof e.clientX==='number'?e.clientX:0,
            clientY:typeof e.clientY==='number'?e.clientY:0,
            button:parseInt(e.button,10)||0,
            buttons:parseInt(e.buttons,10)||0,
            pressure:typeof e.pressure==='number'?e.pressure:0,
            pointerType:String(e.pointerType||'mouse'),
            coalesced:coalesced,
            ctrlKey:!!e.ctrlKey,
            shiftKey:!!e.shiftKey,
            altKey:!!e.altKey
          }
        );
      }
      n.style.touchAction='none';
      n.onpointerdown=function(e){
        try{n.setPointerCapture(e.pointerId);}catch(ignoreCapture){}
        sendPointer('pointerdown',e);
      };
      n.onpointermove=function(e){sendPointer('pointermove',e);};
      n.onpointerup=function(e){
        sendPointer('pointerup',e);
        try{n.releasePointerCapture(e.pointerId);}catch(ignoreRelease){}
      };
      n.onpointercancel=function(e){sendPointer('pointercancel',e);};
      n.onpointerleave=function(e){sendPointer('pointerleave',e);};
    })();
  }

  n._jplopsoftXshHwnd=parseInt(hwnd,10)||0;

  n.setAttribute(
    'data-xsh-control-id',
    id
  );

  if(s.title)n.title=String(s.title);
  if(typeof s.disabled!=='undefined'&&'disabled' in n)n.disabled=!!s.disabled;
  n.setAttribute('data-exos-theme-role',type);

  jplopsoft_xshApplySafeStyle(
    n,
    s.style
  );

  parent.appendChild(n);
  ctx.controls[id]=n;

  if(type==='topology3d'){
    window.setTimeout(function(){
      if(!ctx.terminating&&ctx.controls[id]===n){
        jplopsoft_xshTopologyInit(ctx,id,n,s);
      }
    },0);
  }

  return id;
}
function jplopsoft_xshQueueWakeWaiter(ctx){
  var waiter;
  if(!ctx||ctx.suspended||!ctx.messageWaiters||!ctx.messageWaiters.length||!ctx.messageQueue||!ctx.messageQueue.length)return;
  waiter=ctx.messageWaiters.shift();
  if(waiter.timer)window.clearTimeout(waiter.timer);
  waiter.resolve(ctx.messageQueue.shift());
}
function jplopsoft_xshScheduleMessageDrain(ctx){
  if(typeof jplopsoft_KERNEL_BUGCHECK_ACTIVE!=='undefined'&&jplopsoft_KERNEL_BUGCHECK_ACTIVE)return;
  if(!ctx||ctx.suspended||ctx.messageDrainScheduled)return;
  ctx.messageDrainScheduled=true;
  var run=function(){
    ctx.messageDrainScheduled=false;
    if(ctx.terminating||!ctx.port)return;
    var budget=(ctx.pid===jplopsoft_NT_SCHEDULER.foregroundPid)?24:8,packet;
    while(budget-->0&&ctx.eventQueue.length){
      packet=ctx.eventQueue.shift();
      try{ctx.port.postMessage({type:'event',payload:packet.payload});}catch(ignoreXshEvent){}
    }
    if(ctx.eventQueue.length)jplopsoft_xshScheduleMessageDrain(ctx);
  };
  if(typeof queueMicrotask==='function'&&ctx.pid===jplopsoft_NT_SCHEDULER.foregroundPid)queueMicrotask(run);
  else window.setTimeout(run,ctx.pid===jplopsoft_NT_SCHEDULER.foregroundPid?0:1);
}
function jplopsoft_xshPostMessage(ctx,msg){
  if(typeof jplopsoft_KERNEL_BUGCHECK_ACTIVE!=='undefined'&&jplopsoft_KERNEL_BUGCHECK_ACTIVE)return false;
  if(!ctx)return false;
  var m=msg&&typeof msg==='object'?msg:{message:String(msg||'WM_NULL')};
  m.message=String(m.message||m.msg||'WM_NULL');
  m.hwnd=parseInt(m.hwnd,10)||0;
  m.wParam=typeof m.wParam==='undefined'?0:m.wParam;
  m.lParam=typeof m.lParam==='undefined'?0:m.lParam;
  m.time=jplopsoft_ntKernelNow();
  ctx.messageQueue.push(m);
  while(ctx.messageQueue.length>4096)ctx.messageQueue.shift();
  jplopsoft_xshQueueWakeWaiter(ctx);
  return true;
}
function jplopsoft_xshPeekMessage(ctx,remove){
  if(!ctx||!ctx.messageQueue.length)return null;
  return remove===false?ctx.messageQueue[0]:ctx.messageQueue.shift();
}
function jplopsoft_xshGetMessage(ctx,timeoutMs){
  if(typeof jplopsoft_KERNEL_BUGCHECK_ACTIVE!=='undefined'&&jplopsoft_KERNEL_BUGCHECK_ACTIVE)return Promise.resolve(null);
  ctx.explicitMessageLoop=true;
  if(ctx.messageQueue.length)return Promise.resolve(ctx.messageQueue.shift());
  timeoutMs=parseInt(timeoutMs,10);if(isNaN(timeoutMs))timeoutMs=0;
  return new Promise(function(resolve){
    var waiter={resolve:resolve,timer:0};
    ctx.messageWaiters.push(waiter);
    if(timeoutMs>0){waiter.timer=window.setTimeout(function(){var i=ctx.messageWaiters.indexOf(waiter);if(i>=0)ctx.messageWaiters.splice(i,1);resolve(null);},Math.min(timeoutMs,60000));}
  });
}
function jplopsoft_xshDispatchMessage(ctx,msg){
  if(typeof jplopsoft_KERNEL_BUGCHECK_ACTIVE!=='undefined'&&jplopsoft_KERNEL_BUGCHECK_ACTIVE)return false;
  if(!ctx||!msg)return false;
  if(String(msg.message||'')==='WM_EXOS_EVENT'&&msg.lParam&&typeof msg.lParam==='object'){
    ctx.eventQueue.push({payload:msg.lParam});
  }else{
    ctx.eventQueue.push({payload:{event:'message',message:msg}});
  }
  jplopsoft_xshScheduleMessageDrain(ctx);
  return true;
}
function jplopsoft_xshSendEvent(ctx,payload){
  if(typeof jplopsoft_KERNEL_BUGCHECK_ACTIVE!=='undefined'&&jplopsoft_KERNEL_BUGCHECK_ACTIVE)return;
  if(!ctx)return;
  jplopsoft_xshPostMessage(ctx,{message:'WM_EXOS_EVENT',hwnd:payload&&payload.hwnd||0,wParam:0,lParam:payload});
  if(!ctx.explicitMessageLoop){
    ctx.eventQueue.push({payload:payload});
    while(ctx.eventQueue.length>4096)ctx.eventQueue.shift();
    jplopsoft_xshScheduleMessageDrain(ctx);
  }
}


function jplopsoft_xshAppendControlText(ctx,id,text){
  var n=jplopsoft_xshControl(ctx,id),
      value=String(text===undefined?'':text);

  if(!n){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Control not found.'
    );
  }

  if('value' in n)n.value=String(n.value||'')+value;
  else n.textContent=String(n.textContent||'')+value;

  try{
    n.scrollTop=n.scrollHeight;
  }catch(ignoreXshAppendScroll){}

  return true;
}

function jplopsoft_xshControlWindowHwnd(n){
  var p=n,h;
  while(p){
    try{
      h=parseInt(p.getAttribute&&p.getAttribute('data-exfs-hwnd'),10)||0;
      if(h)return h;
    }catch(ignoreXshFocusHwnd){}
    p=p.parentNode;
  }
  return 0;
}

function jplopsoft_xshRememberFocus(ctx,id,n){
  var h;
  if(!ctx||!n)return false;
  h=jplopsoft_xshControlWindowHwnd(n);
  if(!ctx.focusByHwnd)ctx.focusByHwnd={};
  if(h)ctx.focusByHwnd[String(h)]=String(id||'');
  ctx.lastFocusControlId=String(id||'');
  ctx.lastFocusHwnd=h;
  return true;
}

function jplopsoft_xshContextForWindowRecord(rec){
  var pid=parseInt(rec&&rec.param&&rec.param.xshPid,10)||0;
  if(!pid||typeof jplopsoft_XSH==='undefined'||!jplopsoft_XSH||!jplopsoft_XSH.byPid)return null;
  return jplopsoft_XSH.byPid[String(pid)]||jplopsoft_XSH.byPid[pid]||null;
}

function jplopsoft_xshWindowActivation(rec,active){
  var ctx=jplopsoft_xshContextForWindowRecord(rec),id,n;
  if(!ctx)return false;
  jplopsoft_xshSendEvent(ctx,{
    event:'window',
    controlId:'WINDOW:'+String(rec.hwnd),
    action:active?'activate':'deactivate',
    hwnd:rec.hwnd,
    pid:ctx.pid
  });
  if(!active)return true;
  id=ctx.focusByHwnd&&ctx.focusByHwnd[String(rec.hwnd)]?ctx.focusByHwnd[String(rec.hwnd)]:ctx.lastFocusControlId;
  if(!id)return true;
  n=jplopsoft_xshControl(ctx,id);
  if(!n)return true;
  window.setTimeout(function(){
    try{
      if(jplopsoft_NT_SCHEDULER.foregroundHwnd===rec.hwnd){
        n.focus();
      }
    }catch(ignoreXshRestoreFocus){}
  },0);
  return true;
}

function jplopsoft_xshFocusControl(ctx,id){
  var n=jplopsoft_xshControl(ctx,id);

  if(!n){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Control not found.'
    );
  }

  try{
    n.focus();
    jplopsoft_xshRememberFocus(ctx,id,n);

    if(
      typeof n.setSelectionRange==='function'&&
      typeof n.value==='string'
    ){
      n.setSelectionRange(
        n.value.length,
        n.value.length
      );
    }
  }catch(ignoreXshFocus){}

  return true;
}

function jplopsoft_xshClearControlChildren(ctx,id){
  var parent=jplopsoft_xshControl(ctx,id),
      k,n,remove=[],
      i;

  if(!parent){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Control not found.'
    );
  }

  for(k in ctx.controls){
    if(!ctx.controls.hasOwnProperty(k)||k===String(id))continue;
    n=ctx.controls[k];

    try{
      if(parent.contains(n))remove.push(k);
    }catch(ignoreXshContains){}
  }

  for(i=0;i<remove.length;i++){
    delete ctx.controls[remove[i]];
  }

  while(parent.firstChild){
    parent.removeChild(parent.firstChild);
  }

  return true;
}

function jplopsoft_xshSetControlProperty(ctx,id,prop,value){
  var n=jplopsoft_xshControl(ctx,id),p=String(prop||'');

  if(!n){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Control not found.'
    );
  }

  if(p==='src'){
    var imageRes=typeof jplopsoft_shareResResolve==='function'?jplopsoft_shareResResolve(value,'shell32.dll'):null;
    if(String(n.tagName||'').toLowerCase()!=='img'){
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Image control required.');
    }
    if(imageRes){n.src=imageRes.uri;n._exosResourceToken=imageRes.token;return true;}
    if(!/^data:image\/(?:png|jpeg|gif|webp|svg\+xml);base64,/i.test(String(value||''))){
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Only ExOS resource icons or Base64 image Data URLs are allowed.');
    }
    n.src=String(value);n._exosResourceToken='';
    return true;
  }

  if(p==='html'){
    if(String(n.tagName||'').toLowerCase()!=='iframe'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'HTML property requires htmlpreview control.'
      );
    }
    n.srcdoc=
      '<!doctype html><meta charset="utf-8">'+
      '<meta http-equiv="Content-Security-Policy" '+
      'content="default-src data: blob:; connect-src \'none\'; '+
      'script-src \'none\'; object-src \'none\'; frame-src \'none\'; '+
      'form-action \'none\';">'+
      '<style>html,body{font-family:Segoe UI,Arial,sans-serif;'+
      'margin:10px}</style>'+
      String(value||'');
    return true;
  }

  if(p==='visible'){
    n.style.display=value?'':'none';
    return true;
  }

  if(p==='readOnly'&&('readOnly' in n)){
    n.readOnly=!!value;
    return true;
  }

  if(p==='disabled'&&('disabled' in n)){
    n.disabled=!!value;
    return true;
  }

  if(p==='checked'&&('checked' in n)){
    n.checked=!!value;
    return true;
  }

  if((p==='min'||p==='max'||p==='step')&&(p in n)){
    n[p]=String(value===undefined||value===null?'':value);
    return true;
  }

  if(p==='spellcheck'&&('spellcheck' in n)){
    n.spellcheck=!!value;
    return true;
  }

  if(p==='placeholder'&&('placeholder' in n)){
    n.placeholder=String(value||'');
    return true;
  }

  if(p==='wrap'&&String(n.tagName||'').toLowerCase()==='textarea'){
    n.wrap=value===false?'off':String(value||'soft');
    return true;
  }

  if(p==='acceptTab'&&String(n.tagName||'').toLowerCase()==='textarea'){
    n._exosAcceptTab=!!value;
    return true;
  }

  if(p==='selection'&&('selectionStart' in n)){
    var range=value&&typeof value==='object'?value:{},
        len=String(n.value||'').length,
        start=Math.max(0,Math.min(len,parseInt(range.start,10)||0)),
        end=Math.max(0,Math.min(len,parseInt(range.end,10)||start)),
        direction=String(range.direction||'none');
    if(end<start){var tmp=start;start=end;end=tmp;}
    try{
      n.setSelectionRange(start,end,direction);
      if(range.focus!==false)n.focus();
    }catch(ignoreXshSelection){}
    return true;
  }

  if(p==='scrollTop'&&('scrollTop' in n)){
    n.scrollTop=Math.max(0,Number(value)||0);
    return true;
  }

  if(p==='scrollLeft'&&('scrollLeft' in n)){
    n.scrollLeft=Math.max(0,Number(value)||0);
    return true;
  }

  if(p==='title'){
    n.title=String(value||'');
    return true;
  }

  if(String(n.tagName||'').toLowerCase()==='select'){
    if(p==='items')return jplopsoft_xshSetSelectItems(n,value||[]);
    if(p==='selectedIndex'){n.selectedIndex=Math.max(-1,Math.min(n.options.length-1,Number(value)|0));return true;}
    if(p==='selectedIndices'){
      var sel=Array.isArray(value)?value:[],si;
      for(si=0;si<n.options.length;si++)n.options[si].selected=sel.indexOf(si)>=0;
      return true;
    }
    if(p==='multiple'){n.multiple=!!value;return true;}
    if(p==='size'||p==='rows'){n.size=Math.max(1,Math.min(64,parseInt(value,10)||1));return true;}
    if(p==='value'){n.value=String(value===undefined||value===null?'':value);return true;}
  }
  if(n._jplopsoftGroupLegend&&(p==='legend'||p==='text')){
    n._jplopsoftGroupLegend.textContent=String(value===undefined||value===null?'':value);return true;
  }

  if(n._exosTopologyState){
    if(p==='topologyMode'){
      n._exosTopologyState.mode=String(value||'physical')==='sandbox'?'sandbox':'physical';
      return jplopsoft_xshTopologyRebuild(ctx,String(id||''),n);
    }
    if(p==='refreshTopology'){
      return jplopsoft_xshTopologyRebuild(ctx,String(id||''),n);
    }
    if(p==='resetView'){
      return jplopsoft_xshTopologyReset(n);
    }
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported control property.'
  );
}
function jplopsoft_xshGetControlProperty(ctx,id,prop){
  var n=jplopsoft_xshControl(ctx,id),p=String(prop||'');

  if(!n){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Control not found.'
    );
  }

  if(p==='visible')return n.style.display!=='none';
  if(p==='readOnly')return !!n.readOnly;
  if(p==='disabled')return !!n.disabled;
  if(p==='checked'&&('checked' in n))return !!n.checked;
  if((p==='min'||p==='max'||p==='step')&&(p in n))return String(n[p]||'');
  if(p==='spellcheck')return !!n.spellcheck;
  if(p==='placeholder')return String(n.placeholder||'');
  if(p==='wrap'&&String(n.tagName||'').toLowerCase()==='textarea')return String(n.wrap||'soft');
  if(p==='acceptTab'&&String(n.tagName||'').toLowerCase()==='textarea')return !!n._exosAcceptTab;
  if(p==='selection'&&('selectionStart' in n))return jplopsoft_xshTextSelection(n);
  if(p==='selectionStart'&&('selectionStart' in n))return Number(n.selectionStart)||0;
  if(p==='selectionEnd'&&('selectionEnd' in n))return Number(n.selectionEnd)||0;
  if(p==='scrollTop'&&('scrollTop' in n))return Number(n.scrollTop)||0;
  if(p==='scrollLeft'&&('scrollLeft' in n))return Number(n.scrollLeft)||0;
  if(p==='scrollHeight'&&('scrollHeight' in n))return Number(n.scrollHeight)||0;
  if(p==='scrollWidth'&&('scrollWidth' in n))return Number(n.scrollWidth)||0;
  if(p==='title')return String(n.title||'');
  if(String(n.tagName||'').toLowerCase()==='select'){
    var ss=jplopsoft_xshSelectSnapshot(n),items=[],oi;
    if(p==='selectedIndex')return ss.selectedIndex;
    if(p==='selectedIndices')return ss.selectedIndices;
    if(p==='selectedValues')return ss.selectedValues;
    if(p==='selectedTexts')return ss.selectedTexts;
    if(p==='value')return ss.value;
    if(p==='itemCount')return n.options.length;
    if(p==='multiple')return !!n.multiple;
    if(p==='size'||p==='rows')return Number(n.size)||0;
    if(p==='items'){
      for(oi=0;oi<n.options.length;oi++)items.push({text:String(n.options[oi].textContent||''),value:String(n.options[oi].value||''),disabled:!!n.options[oi].disabled,selected:!!n.options[oi].selected});
      return items;
    }
  }
  if(n._jplopsoftGroupLegend&&(p==='legend'||p==='text'))return String(n._jplopsoftGroupLegend.textContent||'');
  if(p==='win32Class')return String(n.getAttribute&&n.getAttribute('data-exos-win32-class')||'');
  if(p==='src')return String(n._exosResourceToken||n.getAttribute('src')||'');
  if(n._exosTopologyState&&p==='topologyMode')return String(n._exosTopologyState.mode||'physical');
  if(n._exosTopologyState&&p==='topologyStats')return {mode:String(n._exosTopologyState.mode||'physical'),nodeCount:n._exosTopologyState.data?n._exosTopologyState.data.length:0};
  return null;
}
function jplopsoft_xshInsertControlText(ctx,id,text){var n=jplopsoft_xshControl(ctx,id),s=String(text||''),start,end,v;if(!n||!('value' in n))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Text control required.');v=String(n.value||'');start=typeof n.selectionStart==='number'?n.selectionStart:v.length;end=typeof n.selectionEnd==='number'?n.selectionEnd:start;n.value=v.substring(0,start)+s+v.substring(end);try{n.selectionStart=n.selectionEnd=start+s.length;n.focus();}catch(ignoreInsertFocus){}return n.value;}
function jplopsoft_xshPickImageDataUrl(ctx){return new Promise(function(resolve,reject){var input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/gif,image/webp';input.style.position='fixed';input.style.left='-10000px';input.onchange=function(){var f=input.files&&input.files[0]?input.files[0]:null,r;if(!f){if(input.parentNode)input.parentNode.removeChild(input);resolve(null);return;}if(f.size>6*1024*1024){if(input.parentNode)input.parentNode.removeChild(input);reject(jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Image exceeds 6 MiB picker limit.'));return;}r=new FileReader();r.onload=function(){var s=String(r.result||'');if(input.parentNode)input.parentNode.removeChild(input);if(!/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(s)){reject(jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Unsupported image type.'));return;}resolve({name:String(f.name||'image'),dataUrl:s,size:f.size,type:String(f.type||'')});};r.onerror=function(){if(input.parentNode)input.parentNode.removeChild(input);reject(new Error('Image picker read failed.'));};r.readAsDataURL(f);};document.body.appendChild(input);input.click();});}
function jplopsoft_xshSandboxUrl(){
  var path=String(
    window.location&&window.location.pathname
      ?window.location.pathname
      :'exos.php'
  );

  return path+
    '?func=xshsandbox&v='+
    encodeURIComponent(jplopsoft_XSH.version);
}

function jplopsoft_xshBootstrapFail(ctx,message){
  var text='XSH Sandbox bootstrap failed: '+String(message||'Unknown error');

  if(!ctx||ctx.terminating)return false;

  if(ctx.bootstrapTimer){
    try{window.clearTimeout(ctx.bootstrapTimer);}catch(ignoreXshBootTimer){}
    ctx.bootstrapTimer=0;
  }

  if(
    ctx.subsystem===
      jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI&&
    jplopsoft_xshConsoleForProcess(ctx)
  ){
    try{
      jplopsoft_xshConsoleWrite(
        ctx,
        text+'\r\n',
        'stderr'
      );
    }catch(ignoreXshCuiBootError){}
  }else if(ctx.showHost){
    jplopsoft_xshAppendConsole(ctx,text,'error');
    jplopsoft_xshSetStatus(ctx,'Bootstrap error ｜ PID '+ctx.pid);
  }else{
    window.setTimeout(function(){
      try{
        jplopsoft_user32MessageBox(
          'XSH 應用程式啟動失敗：'+
          String(message||'Sandbox bootstrap error')
        );
      }catch(ignoreXshBootAlert){}
    },0);
  }

  window.setTimeout(function(){
    jplopsoft_xshTerminate(
      ctx,
      1,
      'BootstrapError',
      false
    );
  },0);

  return false;
}

function jplopsoft_xshAttachSandbox(ctx){
  var iframe,ch,port2;

  if(!ctx)return null;

  iframe=document.createElement('iframe');
  iframe.setAttribute('sandbox','allow-scripts');
  iframe.setAttribute('aria-hidden','true');
  iframe.setAttribute('title','ExOS XSH Sandbox');
  iframe.style.display='none';

  ch=new MessageChannel();
  port2=ch.port2;

  ctx.frame=iframe;
  ctx.port=ch.port1;

  ctx.port.onmessage=function(ev){
    jplopsoft_xshOnSandboxMessage(ctx,ev.data||{});
  };
  ctx.port.start();

  iframe.onload=function(){
    if(ctx.terminating||!port2)return;

    try{
      iframe.contentWindow.postMessage(
        {type:'EXOS_XSH_PORT'},
        '*',
        [port2]
      );
      port2=null;
    }catch(e){
      jplopsoft_xshBootstrapFail(
        ctx,
        e&&e.message?e.message:e
      );
    }
  };

  iframe.onerror=function(){
    jplopsoft_xshBootstrapFail(
      ctx,
      'Unable to load '+jplopsoft_xshSandboxUrl()
    );
  };

  ctx.bootstrapTimer=window.setTimeout(function(){
    if(!ctx.terminating){
      jplopsoft_xshBootstrapFail(
        ctx,
        'Sandbox did not report ready within 5000 ms.'
      );
    }
  },5000);

  iframe.src=jplopsoft_xshSandboxUrl();
  document.body.appendChild(iframe);

  return ctx;
}

function jplopsoft_xshRpcError(e){return{message:String(e&&e.message?e.message:e||'XSH API error'),ntstatus:e&&e.ntstatus!==undefined?Number(e.ntstatus)>>>0:jplopsoft_STATUS_INVALID_PARAMETER,statusName:e&&e.statusName?String(e.statusName):jplopsoft_xshStatusName(e&&e.ntstatus!==undefined?e.ntstatus:jplopsoft_STATUS_INVALID_PARAMETER)};}


async function jplopsoft_xshPromptBox(ctx,message,title,defaultValue){
  var text=String(message||''),
      caption=String(title||ctx.name||'ExOS'),
      result;

  result=await jplopsoft_user32PromptBox(
    text,
    caption,
    String(defaultValue===undefined?'':defaultValue)
  );

  return result===null?null:String(result);
}

async function jplopsoft_xshConfirmBox(ctx,message,title){
  return !!await jplopsoft_user32ConfirmBox(
    String(message||''),
    String(title||ctx.name||'ExOS')
  );
}

function jplopsoft_xshRegisterBrowserFiles(ctx,fileList,options){
  var opt=options||{},
      files=fileList||[],
      hardMax=16*1024*1024*1024,
      maxBytes=Math.max(1,Math.min(hardMax,parseInt(opt.maxBytes,10)||hardMax)),
      out=[],i,f,size,token;

  if(!ctx)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'XSH process context is unavailable.');
  if(!ctx.localFiles)ctx.localFiles={};
  if(!ctx.nextLocalFile)ctx.nextLocalFile=1;

  for(i=0;i<files.length;i++){
    f=files[i];
    if(!f)continue;
    size=parseInt(f.size,10)||0;
    if(size>maxBytes){
      out.push({name:String(f.name||''),size:size,type:String(f.type||''),lastModified:parseInt(f.lastModified,10)||0,error:'FILE_TOO_LARGE',fileToken:''});
      continue;
    }
    token='LF'+String(ctx.pid)+'_'+String(ctx.nextLocalFile++);
    ctx.localFiles[token]={file:f,name:String(f.name||''),size:size,type:String(f.type||''),lastModified:parseInt(f.lastModified,10)||0,createdAt:(new Date()).getTime(),source:String(opt.source||'browser')};
    out.push({name:String(f.name||''),size:size,type:String(f.type||''),lastModified:parseInt(f.lastModified,10)||0,error:'',fileToken:token});
  }
  return out;
}

/* Common Controls uses this bridge for native desktop/browser file drops. */
function jplopsoft_xshRegisterDroppedFiles(ctx,fileList,options){
  options=options||{};
  options.source='drop';
  return jplopsoft_xshRegisterBrowserFiles(ctx,fileList,options);
}
if(typeof window!=='undefined')window.jplopsoft_xshRegisterDroppedFiles=jplopsoft_xshRegisterDroppedFiles;

function jplopsoft_xshPickFiles(ctx,options){
  var opt=options||{},
      tokenMode=!!opt.returnFileToken,
      hardMax=16*1024*1024*1024,
      maxBytes=Math.max(
        1,
        Math.min(
          tokenMode?hardMax:jplopsoft_XSH.maxIoBytes,
          parseInt(opt.maxBytes,10)||(tokenMode?hardMax:jplopsoft_XSH.maxIoBytes)
        )
      );

  if(!ctx.localFiles)ctx.localFiles={};
  if(!ctx.nextLocalFile)ctx.nextLocalFile=1;

  return new Promise(function(resolve,reject){
    var input=document.createElement('input');

    input.type='file';
    input.multiple=!!opt.multiple;
    input.style.position='fixed';
    input.style.left='-10000px';
    input.style.top='0';

    function cleanup(){
      try{
        if(input.parentNode){
          input.parentNode.removeChild(input);
        }
      }catch(ignoreXshPickCleanup){}
    }

    input.onchange=function(){
      var files=input.files||[],
          out=[],
          index=0;

      function next(){
        var f,r,size,token;

        if(index>=files.length){
          cleanup();
          resolve(out);
          return;
        }

        f=files[index++];

        if(!f){
          next();
          return;
        }

        size=parseInt(f.size,10)||0;

        if(size>maxBytes){
          out.push({
            name:String(f.name||''),
            size:size,
            type:String(f.type||''),
            lastModified:parseInt(f.lastModified,10)||0,
            error:'FILE_TOO_LARGE',
            fileToken:'',
            dataBuffer:new ArrayBuffer(0)
          });
          next();
          return;
        }

        /*
         * Token mode is the V8 large-file path.  Do not FileReader the whole
         * object into the XSH sandbox: retain the browser File handle in the
         * host process and let ExOS stream it through SINGLE_V1/CHUNKED_V1.
         */
        if(tokenMode){
          var registered=jplopsoft_xshRegisterBrowserFiles(ctx,[f],{maxBytes:maxBytes,source:'picker'});
          if(registered.length)out.push(registered[0]);
          next();
          return;
        }

        r=new FileReader();

        r.onerror=function(){
          out.push({
            name:String(f.name||''),
            size:size,
            type:String(f.type||''),
            lastModified:parseInt(f.lastModified,10)||0,
            error:'READ_FAILED',
            fileToken:'',
            dataBuffer:new ArrayBuffer(0)
          });
          next();
        };

        r.onload=function(){
          var buffer=
            Object.prototype.toString.call(r.result)==='[object ArrayBuffer]'
              ?r.result
              :new ArrayBuffer(0);

          out.push({
            name:String(f.name||''),
            size:buffer.byteLength,
            type:String(f.type||''),
            lastModified:parseInt(f.lastModified,10)||0,
            error:'',
            fileToken:'',
            dataBuffer:buffer
          });

          next();
        };

        try{
          r.readAsArrayBuffer(f);
        }catch(e){
          out.push({
            name:String(f.name||''),
            size:size,
            type:String(f.type||''),
            lastModified:parseInt(f.lastModified,10)||0,
            error:String(e&&e.message?e.message:e),
            fileToken:'',
            dataBuffer:new ArrayBuffer(0)
          });
          next();
        }
      }

      next();
    };

    document.body.appendChild(input);

    try{
      input.click();
    }catch(e){
      cleanup();
      reject(e);
    }
  });
}

function jplopsoft_xshLocalFile(ctx,token){
  var rec=ctx&&ctx.localFiles?ctx.localFiles[String(token||'')]:null;
  if(!rec||!rec.file){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Picked browser file token is no longer valid.'
    );
  }
  return rec;
}

function jplopsoft_xshReleasePickedFile(ctx,token){
  token=String(token||'');
  if(ctx&&ctx.localFiles&&ctx.localFiles[token]){
    delete ctx.localFiles[token];
    return true;
  }
  return false;
}

function jplopsoft_xshReadBrowserFile(file){
  return new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onerror=function(){reject(new Error('Browser FileReader failed.'));};
    reader.onload=function(){
      var b=Object.prototype.toString.call(reader.result)==='[object ArrayBuffer]'
        ?reader.result
        :new ArrayBuffer(0);
      resolve(b);
    };
    try{reader.readAsArrayBuffer(file);}catch(e){reject(e);}
  });
}

async function jplopsoft_xshUploadPickedFile(ctx,token,path){
  var rec=jplopsoft_xshLocalFile(ctx,token),
      file=rec.file,
      size=parseInt(rec.size,10)||0,
      maxLogical=16*1024*1024*1024,
      singleLimit=24*1024*1024,
      parent=jplopsoft_xshResolveC(ctx,String(path||''),true),
      name,node,buffer,fek='',fekWrap='',cipher='',fmt,out;

  if(size>maxLogical){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'ExOS Explorer accepts at most 16 GiB per uploaded file.'
    );
  }
  if(!parent){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Upload destination folder was not found.'
    );
  }
  name=String(parent.name||'');
  if(!jplopsoft_xshValidLeafName(name)){
    throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Invalid upload file name.');
  }
  if(jplopsoft_xshFindChild(parent.parentId,name,null)){
    throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_COLLISION,'Upload destination already exists.');
  }
  if(!jplopsoft_isWritableProfileFolder(parent.parentId)){
    throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Upload is allowed only inside the current user profile or writable Public folders.');
  }

  /*
   * os66:
   * Browser-picked files must NEVER go through the generic CreateFile /
   * WriteFile -> API [save] path.
   *
   * A 4 MiB binary expands after Base64 + EXES/X60 encryption. Sending the
   * complete ciphertext as one application/x-www-form-urlencoded request can
   * exceed PHP/Web-server post limits even though the plaintext file is small.
   *
   * SINGLE_V1 therefore uses the same transport-safe pipeline as the classic
   * Explorer uploader:
   *
   *   browser File -> browser-side FEK encryption
   *                -> upload_begin
   *                -> upload_chunk (adaptive 512 KiB / 1 MiB / 2 MiB)
   *                -> upload_finish
   *
   * The logical ExFS file is still SINGLE_V1. Only the HTTP transport is
   * chunked. Files above singleLimit continue to use CHUNKED_V1 with 4 MiB
   * plaintext blocks.
   */
  if(size<=singleLimit){
    if(typeof jplopsoft_uploadCipherInChunks!=='function'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_NOT_SUPPORTED,
        'ExOS SINGLE_V1 chunk upload engine is unavailable.'
      );
    }

    buffer=await jplopsoft_xshReadBrowserFile(file);
    if(buffer.byteLength!==size){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Browser file size changed while reading.'
      );
    }

    try{
      fek=jplopsoft_newFek();
      fekWrap=jplopsoft_wrapFek(fek);
      fmt=jplopsoft_fileFormatFromName(name);

      if(jplopsoft_binaryFormat(fmt)){
        cipher=jplopsoft_encBinaryBytes(new Uint8Array(buffer),fek);
      }else{
        cipher=jplopsoft_encContent(
          jplopsoft_xshUtf8Decode(new Uint8Array(buffer)),
          fek
        );
      }

      out=await new Promise(function(resolve,reject){
        jplopsoft_uploadCipherInChunks(
          parent.parentId,
          name,
          cipher,
          size,
          null,
          fekWrap,
          null,
          function(err,result){
            if(err)reject(err);
            else resolve(result||{});
          }
        );
      });
    }finally{
      /*
       * FEK/cipher strings are browser-managed immutable values, so explicit
       * clearing is best-effort only. Dropping references still shortens their
       * lifetime and matches the existing ExOS upload model.
       */
      buffer=null;
      cipher='';
      fek='';
      fekWrap='';
    }

    await jplopsoft_xshReloadNodes();
    node=jplopsoft_xshResolveC(ctx,path,false);

    return{
      ok:true,
      path:String(path||''),
      size:size,
      nodeId:parseInt(out&&out.id,10)||(node&&node.id?parseInt(node.id,10)||0:0),
      storageMode:'SINGLE_V1',
      blockCount:1,
      transport:'UPLOAD_CHUNK'
    };
  }

  /*
   * Large-file path: File.slice() -> 4 MiB plaintext blocks -> browser FEK
   * encryption -> small HTTP chunks -> PHP _Uploads staging -> CHUNKED_V1.
   * No request and no sandbox ArrayBuffer ever contains the whole 16 GiB file.
   */
  if(typeof jplopsoft_largeUploadFile!=='function'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'ExOS large-file upload engine is unavailable.'
    );
  }

  fek=jplopsoft_newFek();
  fekWrap=jplopsoft_wrapFek(fek);

  try{
    out=await new Promise(function(resolve,reject){
      jplopsoft_largeUploadFile(
        file,
        name,
        parent.parentId,
        null,
        fek,
        fekWrap,
        function(err,result){
          if(err)reject(err);
          else resolve(result||{});
        }
      );
    });
  }finally{
    fek='';
    fekWrap='';
  }

  await jplopsoft_xshReloadNodes();

  return{
    ok:true,
    path:String(path||''),
    size:size,
    nodeId:parseInt(out.id,10)||0,
    storageMode:String(out.storage_mode||'CHUNKED_V1'),
    blockSize:parseInt(out.block_size,10)||4194304,
    blockCount:parseInt(out.block_count,10)||Math.ceil(size/4194304),
    transport:'LARGE_UPLOAD_CHUNK'
  };
}

function jplopsoft_xshAccountBuildCredential(username,password,title){
  username=String(username||'').toLowerCase();password=String(password||'');
  return new Promise(function(resolve,reject){
    var salt='',iterations=20000;
    try{salt=jplopsoft_secureRandomHex(32).toLowerCase();}catch(e){reject(e);return;}
    try{
      jplopsoft_derivePasswordKeyAsync(password,{username:username,salt:salt,iterations:iterations,title:String(title||'正在建立本機帳號認證'),detail:'使用 salted ex_md3n 建立 SAM3 verifier 與 Vault Key wrap；密碼不會送到 PHP'},function(err,samKey){
        var wrapKey='',vaultEnc='',verifier='';password='';
        if(err){reject(err);return;}
        try{
          verifier=jplopsoft_samVerifier(samKey);
          wrapKey=jplopsoft_samWrapKey(username,salt,samKey);
          vaultEnc=jplopsoft_encRaw(jplopsoft_SAM_VAULT_PREFIX+String(state.vaultKey||''),wrapKey);
          resolve({password_salt:salt,password_iterations:iterations,password_verifier:verifier,vault_key_enc:vaultEnc});
        }catch(e2){reject(e2);}finally{samKey='';wrapKey='';verifier='';}
      });
    }catch(e3){password='';reject(e3);}
  });
}
async function jplopsoft_xshSystemQueryLocalAccounts(ctx){
  return await jplopsoft_xshApiPromise('account_list','GET',null);
}
async function jplopsoft_xshSystemCreateLocalAccount(ctx,spec){
  var o=spec&&typeof spec==='object'?spec:{},username=String(o.username||'').trim().toLowerCase(),password=String(o.password||''),administrator=!!o.administrator,cred,payload;
  if(!/^[a-z0-9_.-]{1,64}$/.test(username)||username==='administrator')throw new Error('帳號名稱只能使用 a-z、0-9、_、.、-，且不能使用 administrator。');
  if(password.length<8)throw new Error('密碼至少需要 8 個字元。');
  if(!state.vaultKey||!jplopsoft_validVaultKey(state.vaultKey))throw new Error('Vault Key 尚未解鎖。');
  cred=await jplopsoft_xshAccountBuildCredential(username,password,'正在建立 '+username+' 帳號');password='';
  payload={username:username,administrator:administrator?1:0,password_salt:cred.password_salt,password_iterations:cred.password_iterations,password_verifier:cred.password_verifier,vault_key_enc:cred.vault_key_enc,profile_name_enc:jplopsoft_encRaw(jplopsoft_NAME2+username,state.vaultKey),documents_name_enc:jplopsoft_encRaw(jplopsoft_NAME2+'Documents',state.vaultKey),desktop_name_enc:jplopsoft_encRaw(jplopsoft_NAME2+'Desktop',state.vaultKey),downloads_name_enc:jplopsoft_encRaw(jplopsoft_NAME2+'Downloads',state.vaultKey)};
  return await jplopsoft_xshApiPromise('account_create','POST',payload);
}
async function jplopsoft_xshSystemResetLocalAccountPassword(ctx,username,password){
  username=String(username||'').trim().toLowerCase();password=String(password||'');if(!username||password.length<8)throw new Error('帳號或新密碼無效；密碼至少需要 8 個字元。');
  if(!state.vaultKey||!jplopsoft_validVaultKey(state.vaultKey))throw new Error('Vault Key 尚未解鎖。');
  var cred=await jplopsoft_xshAccountBuildCredential(username,password,'正在重設 '+username+' 密碼');password='';
  return await jplopsoft_xshApiPromise('account_reset_password','POST',{username:username,password_salt:cred.password_salt,password_iterations:cred.password_iterations,password_verifier:cred.password_verifier,vault_key_enc:cred.vault_key_enc});
}
async function jplopsoft_xshSystemSetLocalAccountEnabled(ctx,username,enabled){return await jplopsoft_xshApiPromise('account_set_enabled','POST',{username:String(username||''),enabled:enabled?1:0});}
async function jplopsoft_xshSystemSetLocalAccountType(ctx,username,administrator){return await jplopsoft_xshApiPromise('account_set_type','POST',{username:String(username||''),administrator:administrator?1:0});}
async function jplopsoft_xshSystemSetLocalAccountProfile(ctx,username,spec){var o=spec&&typeof spec==='object'?spec:{};return await jplopsoft_xshApiPromise('account_set_profile','POST',{username:String(username||''),full_name:String(o.full_name||''),description:String(o.description||'')});}
async function jplopsoft_xshSystemDeleteLocalAccount(ctx,username){return await jplopsoft_xshApiPromise('account_delete','POST',{username:String(username||'')});}
async function jplopsoft_xshSystemQueryEvents(ctx,filter){var f=filter&&typeof filter==='object'?filter:{};return await jplopsoft_xshApiPromise('event_query','POST',{event_id:parseInt(f.eventId,10)||0,event_name:String(f.eventName||''),limit:Math.max(1,Math.min(5000,parseInt(f.limit,10)||1000))});}
async function jplopsoft_xshSystemQueryEventLogInfo(ctx){return await jplopsoft_xshApiPromise('audit_info','GET',null);}

function jplopsoft_xshObjectStatus(result,message){
  if(!result||Number(result.status)!==Number(jplopsoft_STATUS_SUCCESS)){
    throw jplopsoft_xshError(
      result&&typeof result.status!=='undefined'
        ?result.status
        :jplopsoft_STATUS_INVALID_HANDLE,
      result&&result.reason
        ?result.reason
        :String(message||'NT object operation failed.')
    );
  }

  return result;
}

function jplopsoft_xshAssociateIocp(ctx,fileHandle,portHandle,completionKey){
  var fh=jplopsoft_xshHandle(ctx,fileHandle),
      port=jplopsoft_ntObjectFromHandle(
        ctx.pid,
        portHandle,
        'IO_COMPLETION'
      );

  if(!port){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Invalid I/O completion port handle.'
    );
  }

  if(fileHandle!==null&&typeof fileHandle!=='undefined'&&parseInt(fileHandle,10)!==0){
    if(!fh||fh.kind!=='file'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_HANDLE,
        'CreateIoCompletionPort requires an XSH file handle.'
      );
    }

    fh.iocpHandle=parseInt(portHandle,10)||0;
    fh.completionKey=
      completionKey===undefined
        ?0
        :completionKey;
  }

  return port;
}

function jplopsoft_xshAsyncPacket(ctx,request,status,result,err){
  var packet={
    requestId:request.requestId,
    operation:request.operation,
    completionKey:request.completionKey,
    overlapped:request.overlapped,
    status:Number(status)>>>0,
    statusName:jplopsoft_xshStatusName(status),
    bytesTransferred:0,
    completedAt:jplopsoft_ntKernelNow()
  };

  if(result){
    if(typeof result.bytesRead!=='undefined'){
      packet.bytesTransferred=parseInt(result.bytesRead,10)||0;
      packet.data=result.data||[];
      packet.eof=!!result.eof;
    }

    if(typeof result.bytesWritten!=='undefined'){
      packet.bytesTransferred=parseInt(result.bytesWritten,10)||0;
    }
  }

  if(err){
    packet.error=String(err&&err.message?err.message:err);
  }

  return packet;
}

function jplopsoft_xshScheduleAsyncRead(ctx,fileHandle,length,offset,overlapped){
  var fh=jplopsoft_xshHandle(ctx,fileHandle),
      port,requestId,request;

  if(!fh||fh.kind!=='file'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'ReadFileAsync requires a file handle.'
    );
  }

  if(!fh.iocpHandle){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'File handle is not associated with an IOCP.'
    );
  }

  port=jplopsoft_ntObjectFromHandle(
    ctx.pid,
    fh.iocpHandle,
    'IO_COMPLETION'
  );

  if(!port){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Associated IOCP is closed.'
    );
  }

  requestId='AIO-'+String(jplopsoft_NT_KERNEL.nextAsyncIrp++);

  request={
    requestId:requestId,
    operation:'READ',
    fileHandle:parseInt(fileHandle,10)||0,
    portHandle:parseInt(fh.iocpHandle,10)||0,
    completionKey:fh.completionKey,
    overlapped:overlapped||{},
    cancelled:false
  };

  ctx.asyncIrps[requestId]=request;

  window.setTimeout(function(){
    if(request.cancelled||ctx.terminating){
      jplopsoft_ntIocpPost(
        port,
        jplopsoft_xshAsyncPacket(
          ctx,
          request,
          jplopsoft_STATUS_CANCELLED,
          null,
          null
        )
      );
      delete ctx.asyncIrps[requestId];
      return;
    }

    jplopsoft_xshNtReadFile(
      ctx,
      fileHandle,
      length,
      offset,
      'ReadFileAsync'
    ).then(function(result){
      if(request.cancelled||ctx.terminating){
        jplopsoft_ntIocpPost(
          port,
          jplopsoft_xshAsyncPacket(
            ctx,
            request,
            jplopsoft_STATUS_CANCELLED,
            null,
            null
          )
        );
      }else{
        jplopsoft_ntIocpPost(
          port,
          jplopsoft_xshAsyncPacket(
            ctx,
            request,
            jplopsoft_STATUS_SUCCESS,
            result,
            null
          )
        );
      }

      delete ctx.asyncIrps[requestId];
    }).catch(function(err){
      jplopsoft_ntIocpPost(
        port,
        jplopsoft_xshAsyncPacket(
          ctx,
          request,
          err&&typeof err.ntstatus!=='undefined'
            ?err.ntstatus
            :jplopsoft_STATUS_INVALID_PARAMETER,
          null,
          err
        )
      );

      delete ctx.asyncIrps[requestId];
    });
  },0);

  return{
    pending:true,
    status:jplopsoft_STATUS_SUCCESS,
    requestId:requestId
  };
}

function jplopsoft_xshScheduleAsyncWrite(ctx,fileHandle,data,offset,overlapped){
  var fh=jplopsoft_xshHandle(ctx,fileHandle),
      port,requestId,request;

  if(!fh||fh.kind!=='file'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'WriteFileAsync requires a file handle.'
    );
  }

  if(!fh.iocpHandle){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'File handle is not associated with an IOCP.'
    );
  }

  port=jplopsoft_ntObjectFromHandle(
    ctx.pid,
    fh.iocpHandle,
    'IO_COMPLETION'
  );

  if(!port){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Associated IOCP is closed.'
    );
  }

  requestId='AIO-'+String(jplopsoft_NT_KERNEL.nextAsyncIrp++);

  request={
    requestId:requestId,
    operation:'WRITE',
    fileHandle:parseInt(fileHandle,10)||0,
    portHandle:parseInt(fh.iocpHandle,10)||0,
    completionKey:fh.completionKey,
    overlapped:overlapped||{},
    cancelled:false
  };

  ctx.asyncIrps[requestId]=request;

  window.setTimeout(function(){
    if(request.cancelled||ctx.terminating){
      jplopsoft_ntIocpPost(
        port,
        jplopsoft_xshAsyncPacket(
          ctx,
          request,
          jplopsoft_STATUS_CANCELLED,
          null,
          null
        )
      );
      delete ctx.asyncIrps[requestId];
      return;
    }

    jplopsoft_xshNtWriteFile(
      ctx,
      fileHandle,
      data,
      offset,
      'WriteFileAsync'
    ).then(function(result){
      if(request.cancelled||ctx.terminating){
        jplopsoft_ntIocpPost(
          port,
          jplopsoft_xshAsyncPacket(
            ctx,
            request,
            jplopsoft_STATUS_CANCELLED,
            null,
            null
          )
        );
      }else{
        jplopsoft_ntIocpPost(
          port,
          jplopsoft_xshAsyncPacket(
            ctx,
            request,
            jplopsoft_STATUS_SUCCESS,
            result,
            null
          )
        );
      }

      delete ctx.asyncIrps[requestId];
    }).catch(function(err){
      jplopsoft_ntIocpPost(
        port,
        jplopsoft_xshAsyncPacket(
          ctx,
          request,
          err&&typeof err.ntstatus!=='undefined'
            ?err.ntstatus
            :jplopsoft_STATUS_INVALID_PARAMETER,
          null,
          err
        )
      );

      delete ctx.asyncIrps[requestId];
    });
  },0);

  return{
    pending:true,
    status:jplopsoft_STATUS_SUCCESS,
    requestId:requestId
  };
}

function jplopsoft_xshCancelIo(ctx,requestId){
  var r=ctx.asyncIrps[String(requestId||'')];

  if(!r)return false;

  r.cancelled=true;
  return true;
}

async function jplopsoft_xshSddlCompile(ctx,sddl){
  var out=await jplopsoft_xshApiPromise(
    'sddl_compile',
    'POST',
    {sddl:String(sddl||'')}
  );

  return out.descriptor||null;
}

async function jplopsoft_xshSddlDecompile(ctx,descriptor){
  var out=await jplopsoft_xshApiPromise(
    'sddl_decompile',
    'POST',
    {descriptor:descriptor||{}}
  );

  return String(out.sddl||'');
}

async function jplopsoft_xshGetFileSddl(ctx,path){
  var n=jplopsoft_xshResolveC(ctx,path,false),out;

  if(!n){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'GetFileSecurity path not found.'
    );
  }

  out=await jplopsoft_xshApiPromise(
    'security_get_sddl',
    'POST',
    {id:n.root?0:(parseInt(n.id,10)||0)}
  );

  return{
    sddl:String(out.sddl||''),
    descriptor:out.descriptor||{}
  };
}

async function jplopsoft_xshSetFileSddl(ctx,path,sddl){
  var n=jplopsoft_xshResolveC(ctx,path,false),out;

  if(!n){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'SetFileSecurity path not found.'
    );
  }

  out=await jplopsoft_xshApiPromise(
    'security_set_sddl',
    'POST',
    {
      id:n.root?0:(parseInt(n.id,10)||0),
      sddl:String(sddl||'')
    }
  );

  return String(out.sddl||'');
}


async function jplopsoft_xshCreateFileMappingWin32(ctx,args){
  var hFile,name,size,protect,opt={},handle,node,bytes,high,low,result;
  args=args||[];

  /* Win32 shape:
   * CreateFileMapping(hFile, security, protect, sizeHigh, sizeLow, name)
   * An INVALID_HANDLE_VALUE mapping is backed by the VMM pagefile.
   */
  if(args.length>=5){
    hFile=Number(args[0]);
    protect=jplopsoft_vmmProtectValue(args[2]||jplopsoft_PAGE_READWRITE);
    high=Math.max(0,Number(args[3])||0);
    low=Math.max(0,Number(args[4])||0);
    size=Math.floor(high*4294967296+low);
    name=String(args[5]||'');
    opt.protect=protect;

    if(hFile!==-1&&hFile!==4294967295){
      handle=jplopsoft_xshHandle(ctx,hFile);
      if(!handle||handle.kind!=='exfs-file'){
        throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'CreateFileMapping requires an ExFS file handle or INVALID_HANDLE_VALUE.');
      }
      node=jplopsoft_findNode(parseInt(handle.nodeId,10)||0);
      if(!node||node.type!=='file')throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Mapped file object no longer exists.');
      if(size<=0)size=Math.max(1,parseInt(node.original_size,10)||0);
      if(size>64*1024*1024){
        throw jplopsoft_xshError(jplopsoft_STATUS_QUOTA_EXCEEDED,'File-backed mappings are limited to 64 MiB per SECTION image.');
      }
      bytes=await jplopsoft_xshReadNodeBytes(node,jplopsoft_xshRuntimeReadPurpose(ctx));
      opt.initialBytes=bytes;
      opt.fileNodeId=parseInt(node.id,10)||0;
      opt.filePath=String(handle.path||'');
    }else if(size<=0){
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Pagefile-backed CreateFileMapping requires a non-zero maximum size.');
    }
  }else{
    /* Native ExOS SECTION helper shape: (name, size, options). */
    name=String(args[0]||'');
    size=Math.max(1,Number(args[1])||0);
    opt=args[2]&&typeof args[2]==='object'?args[2]:{};
  }

  result=jplopsoft_ntSectionCreate(ctx.pid,name,size,opt);
  jplopsoft_xshObjectStatus(result,'CreateFileMapping failed.');
  return result.handle;
}

function jplopsoft_xshOpenFileMappingWin32(ctx,args){
  var name=args&&args.length>=3?args[2]:args[0],r;
  r=jplopsoft_ntSectionOpen(ctx.pid,String(name||''));
  jplopsoft_xshObjectStatus(r,'OpenFileMapping failed.');
  return r.handle;
}

function jplopsoft_xshMapViewOfFileWin32(ctx,args){
  var handle=args[0],access=args[1],high,low,offset,length,opt={},r,a;
  if(args.length>=5){
    high=Math.max(0,Number(args[2])||0);
    low=Math.max(0,Number(args[3])||0);
    offset=Math.floor(high*4294967296+low);
    length=Math.max(0,Math.floor(Number(args[4])||0));
    a=Number(access)>>>0;
    opt.protect=(a&0x0002)!==0||a===0x000F001F
      ?jplopsoft_PAGE_READWRITE
      :jplopsoft_PAGE_READONLY;
  }else{
    offset=Math.max(0,Math.floor(Number(args[1])||0));
    length=Math.max(0,Math.floor(Number(args[2])||0));
    opt=args[3]&&typeof args[3]==='object'?args[3]:{};
  }
  r=jplopsoft_ntSectionMap(ctx.pid,handle,offset,length,opt);
  r=jplopsoft_xshObjectStatus(r,'MapViewOfFile failed.');
  return r.baseAddress;
}

async function jplopsoft_xshFlushMappedView(ctx,mappingOrAddress,length){
  var pair=jplopsoft_ntSectionView(ctx.pid,mappingOrAddress),obj,node,data,k,page;
  if(!pair)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid mapped view.');
  obj=pair.section;
  if(!obj.fileBacked||!obj.fileNodeId)return true;
  if(!obj.dirty)return true;
  if(obj.size>64*1024*1024)throw jplopsoft_xshError(jplopsoft_STATUS_QUOTA_EXCEEDED,'FlushViewOfFile file mapping is limited to 64 MiB.');
  node=jplopsoft_findNode(parseInt(obj.fileNodeId,10)||0);
  if(!node||node.type!=='file')throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Mapped ExFS file no longer exists.');
  data=new Uint8Array(obj.size);
  if(obj.backingBytes)data.set(obj.backingBytes.subarray(0,Math.min(data.length,obj.backingBytes.length)));
  for(k in obj.pages){
    if(!obj.pages.hasOwnProperty(k))continue;
    page=obj.pages[k];
    if(!page)continue;
    var bytes=jplopsoft_vmmPageIn(page,obj,parseInt(k,10)||0,false);
    data.set(bytes.subarray(0,Math.min(bytes.length,data.length-(parseInt(k,10)||0)*jplopsoft_VMM_PAGE_SIZE)),(parseInt(k,10)||0)*jplopsoft_VMM_PAGE_SIZE);
    page.dirty=false;
    jplopsoft_vmmPagefileFreeSlot(page);
  }
  await jplopsoft_xshWriteNodeBytes(node,data);
  obj.backingBytes=data.slice(0);
  obj.dirty=false;
  return true;
}


/* =========================================================================
 * os82 — Win32 / Windows NT compatibility surface for XSH
 *
 * This layer preserves the ExOS security boundary:
 * - HWND/process/registry/file operations target ExOS objects only.
 * - keyboard/mouse injection and hooks are confined to the caller's ExOS
 *   foreground process; browser-host/global input is never exposed.
 * - ICMP/TAPI/raw host facilities explicitly report NOT_SUPPORTED instead of
 *   faking a capability that Chromium does not provide.
 * ========================================================================= */

var jplopsoft_NTCOMPAT_OS83={
  version:'6.4.0-dev-os91',
  model:'EXOS_WIN32_NT_COMPAT_V2',
  input:{keys:{},cursor:{x:0,y:0},clip:null,showCount:0},
  hookSeq:0xD100,
  hotkeys:{},
  capture:null
};


function jplopsoft_ntcompatModifierMask(e){
  var m=0;
  if(e&&e.altKey)m|=0x0001;
  if(e&&e.ctrlKey)m|=0x0002;
  if(e&&e.shiftKey)m|=0x0004;
  if(e&&e.metaKey)m|=0x0008;
  return m;
}

function jplopsoft_ntcompatHotkeyKey(modifiers,vk){
  return String((Number(modifiers)||0)&0x000F)+':'+String(Number(vk)||0);
}

function jplopsoft_ntcompatDispatchHotkeys(e,keyCode){
  var table=jplopsoft_NTCOMPAT_OS83.hotkeys,k,h,mods,ctx,rec,lParam,matched=false;
  if(!table)return false;
  mods=jplopsoft_ntcompatModifierMask(e);
  for(k in table){
    if(!table.hasOwnProperty(k))continue;
    h=table[k];
    if(!h)continue;
    ctx=typeof jplopsoft_xshRunByPid==='function'?jplopsoft_xshRunByPid(h.pid):null;
    if(!ctx||ctx.terminating){delete table[k];continue;}
    if((Number(h.modifiers)&0x000F)!==mods||Number(h.vk)!==Number(keyCode))continue;
    if((Number(h.modifiers)&0x4000)!==0&&e&&e.repeat)continue;
    rec=h.hwnd?jplopsoft_user32GetRecord(h.hwnd):null;
    if(h.hwnd&&(!rec||!ctx.windows[String(h.hwnd)])){delete table[k];continue;}
    lParam=((Number(h.vk)&0xFFFF)<<16)|(Number(h.modifiers)&0xFFFF);
    jplopsoft_xshPostMessage(ctx,{hwnd:h.hwnd||0,message:'WM_HOTKEY',wParam:h.id,lParam:lParam});
    jplopsoft_xshSendEvent(ctx,{
      event:'hotkey',
      controlId:'HOTKEY:'+String(h.id),
      action:'hotkey',
      hwnd:h.hwnd||0,
      id:h.id,
      modifiers:Number(h.modifiers)||0,
      vkCode:Number(h.vk)||0,
      repeat:!!(e&&e.repeat)
    });
    matched=true;
  }
  if(matched&&e){try{e.preventDefault();}catch(ignoreHotkeyPrevent){}try{e.stopPropagation();}catch(ignoreHotkeyStop){}}
  return matched;
}

function jplopsoft_ntcompatCaptureEvent(action,e){
  var cap=jplopsoft_NTCOMPAT_OS83.capture,ctx,rec,client,cr,x,y;
  if(!cap)return false;
  ctx=typeof jplopsoft_xshRunByPid==='function'?jplopsoft_xshRunByPid(cap.pid):null;
  rec=jplopsoft_user32GetRecord(cap.hwnd);
  if(!ctx||ctx.terminating||!rec||!ctx.windows[String(cap.hwnd)]){
    jplopsoft_NTCOMPAT_OS83.capture=null;
    return false;
  }
  client=jplopsoft_GetClientElement(cap.hwnd);
  cr=client&&client.getBoundingClientRect?client.getBoundingClientRect():{left:0,top:0,width:0,height:0};
  x=(Number(e&&e.clientX)||0)-Number(cr.left||0);
  y=(Number(e&&e.clientY)||0)-Number(cr.top||0);
  jplopsoft_xshSendEvent(ctx,{
    event:'window',
    controlId:'WINDOW:'+String(cap.hwnd),
    action:'capture-'+String(action||''),
    hwnd:cap.hwnd,
    x:x,y:y,
    clientX:Number(e&&e.clientX)||0,
    clientY:Number(e&&e.clientY)||0,
    button:Number(e&&e.button)||0,
    buttons:Number(e&&e.buttons)||0,
    pointerId:Number(e&&e.pointerId)||0,
    pointerType:String(e&&e.pointerType||'mouse'),
    ctrlKey:!!(e&&e.ctrlKey),shiftKey:!!(e&&e.shiftKey),altKey:!!(e&&e.altKey)
  });
  return true;
}

(function(){
  if(typeof document==='undefined'||jplopsoft_NTCOMPAT_OS83.input.bound)return;
  jplopsoft_NTCOMPAT_OS83.input.bound=true;

  function keyCode(e){
    return Number(e&&(
      e.keyCode||
      e.which||
      (
        String(e.code||'').indexOf('Key')===0
          ?String(e.code).charCodeAt(3)
          :0
      )
    ))||0;
  }

  function foregroundCtx(){
    var pid=parseInt(jplopsoft_NT_SCHEDULER.foregroundPid,10)||0;
    return pid&&typeof jplopsoft_xshRunByPid==='function'
      ?jplopsoft_xshRunByPid(pid)
      :null;
  }

  function hookEvent(type,e){
    var ctx=foregroundCtx(),hooks,k,h,match=false,payload;
    if(!ctx||!ctx.ntcompatHooks)return;
    hooks=ctx.ntcompatHooks;

    for(k in hooks){
      if(!hooks.hasOwnProperty(k))continue;
      h=hooks[k];
      if(!h)continue;

      if(type==='keyboard'){
        match=h.idHook===2||h.idHook===13;
        payload={
          vkCode:keyCode(e),
          key:String(e.key||''),
          code:String(e.code||''),
          down:e.type==='keydown',
          repeat:!!e.repeat,
          ctrlKey:!!e.ctrlKey,
          shiftKey:!!e.shiftKey,
          altKey:!!e.altKey
        };
      }else{
        match=h.idHook===7||h.idHook===14;
        payload={
          x:Number(e.clientX)||0,
          y:Number(e.clientY)||0,
          button:Number(e.button)||0,
          buttons:Number(e.buttons)||0,
          action:String(e.type||'')
        };
      }

      if(match&&typeof jplopsoft_xshSendEvent==='function'){
        jplopsoft_xshSendEvent(ctx,{
          event:'hook',
          controlId:'HOOK:'+String(h.handle),
          action:type,
          hook:h.handle,
          code:0,
          data:payload
        });
      }
    }
  }

  document.addEventListener('keydown',function(e){
    var c=keyCode(e);
    if(c)jplopsoft_NTCOMPAT_OS83.input.keys[String(c)]={down:true,pressed:true};
    hookEvent('keyboard',e);
    if(c)jplopsoft_ntcompatDispatchHotkeys(e,c);
  },true);

  document.addEventListener('keyup',function(e){
    var c=keyCode(e),r;
    if(c){
      r=jplopsoft_NTCOMPAT_OS83.input.keys[String(c)]||{};
      r.down=false;
      jplopsoft_NTCOMPAT_OS83.input.keys[String(c)]=r;
    }
    hookEvent('keyboard',e);
  },true);

  document.addEventListener('mousemove',function(e){
    var c=jplopsoft_NTCOMPAT_OS83.input.cursor,clip=jplopsoft_NTCOMPAT_OS83.input.clip,
        x=Number(e.clientX)||0,y=Number(e.clientY)||0;
    if(clip){
      x=Math.max(Number(clip.left)||0,Math.min(Number(clip.right)||window.innerWidth,x));
      y=Math.max(Number(clip.top)||0,Math.min(Number(clip.bottom)||window.innerHeight,y));
    }
    c.x=x;c.y=y;
    hookEvent('mouse',e);
    jplopsoft_ntcompatCaptureEvent('pointermove',e);
  },true);

  document.addEventListener('mousedown',function(e){hookEvent('mouse',e);jplopsoft_ntcompatCaptureEvent('pointerdown',e);},true);
  document.addEventListener('mouseup',function(e){hookEvent('mouse',e);jplopsoft_ntcompatCaptureEvent('pointerup',e);},true);
  document.addEventListener('pointercancel',function(e){jplopsoft_ntcompatCaptureEvent('pointercancel',e);},true);
})();

function jplopsoft_ntcompatIntegrityRank(x){
  x=String(x||'MEDIUM').toUpperCase();
  return x==='LOW'?1:x==='MEDIUM'?2:x==='HIGH'?3:x==='SYSTEM'?4:2;
}

function jplopsoft_ntcompatWindowReadable(ctx,rec){
  if(!rec)return false;
  if(ctx&&ctx.windows&&ctx.windows[String(rec.hwnd)])return true;
  var p=rec.ntPid?jplopsoft_ntKernelProcessByPid(rec.ntPid):null,
      self=ctx&&ctx.process?ctx.process:null;
  if(!p||!self)return true;
  return String(p.username||'').toLowerCase()===String(self.username||'').toLowerCase();
}

function jplopsoft_ntcompatWindowWritable(ctx,rec){
  if(!rec||!ctx)return false;
  if(ctx.windows&&ctx.windows[String(rec.hwnd)])return true;
  var p=rec.ntPid?jplopsoft_ntKernelProcessByPid(rec.ntPid):null,
      self=ctx.process;
  if(!p||!self)return false;
  if(String(p.username||'').toLowerCase()!==String(self.username||'').toLowerCase())return false;
  return jplopsoft_ntcompatIntegrityRank(p.integrity)<=jplopsoft_ntcompatIntegrityRank(self.integrity);
}

function jplopsoft_ntcompatWindowList(){
  var out=[],k,r,w,z;
  for(k in jplopsoft_USER32.windows){
    if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
    r=jplopsoft_USER32.windows[k];
    if(!r||r.ntTerminated)continue;
    w=jplopsoft_GetWindowElement(r.hwnd);
    z=0;
    try{z=parseInt(w&&w.style?w.style.zIndex:0,10)||0;}catch(ignoreZ){}
    out.push({rec:r,z:z});
  }
  out.sort(function(a,b){
    if(a.z!==b.z)return a.z-b.z;
    return (parseInt(a.rec.hwnd,10)||0)-(parseInt(b.rec.hwnd,10)||0);
  });
  return out.map(function(x){return x.rec;});
}

function jplopsoft_ntcompatFindWindow(ctx,className,title,parentHwnd,afterHwnd){
  var list=jplopsoft_ntcompatWindowList(),i,r,start=!afterHwnd,
      cls=className===null||typeof className==='undefined'?'':String(className),
      txt=title===null||typeof title==='undefined'?'':String(title),
      parent=parseInt(parentHwnd,10)||0,after=parseInt(afterHwnd,10)||0;

  for(i=0;i<list.length;i++){
    r=list[i];
    if(!start){
      if(parseInt(r.hwnd,10)===after)start=true;
      continue;
    }
    if(parent&&(parseInt(r.parentHwnd,10)||0)!==parent)continue;
    if(!parent&&(parseInt(r.parentHwnd,10)||0)!==0)continue;
    if(cls&&String(r.className||'').toLowerCase()!==cls.toLowerCase())continue;
    if(txt&&String(r.title||'')!==txt)continue;
    if(!jplopsoft_ntcompatWindowReadable(ctx,r))continue;
    return parseInt(r.hwnd,10)||0;
  }
  return 0;
}

function jplopsoft_ntcompatActiveElementHwnd(){
  var n=document.activeElement,cur,hwnd=0;
  while(n&&n!==document.body){
    try{
      cur=n.getAttribute&&n.getAttribute('data-exfs-hwnd');
      if(cur){hwnd=parseInt(cur,10)||0;break;}
    }catch(ignoreAttr){}
    n=n.parentNode;
  }
  if(!hwnd)hwnd=parseInt(jplopsoft_NT_SCHEDULER.foregroundHwnd,10)||0;
  return hwnd;
}

function jplopsoft_ntcompatMoveWindow(ctx,hwnd,x,y,w,h,repaint){
  var rec=jplopsoft_user32GetRecord(hwnd),el;
  if(!rec)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid HWND.');
  if(!jplopsoft_ntcompatWindowWritable(ctx,rec))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Window manipulation denied by ExOS UIPI.');
  el=jplopsoft_GetWindowElement(hwnd);
  if(!el)return false;
  el.style.left=Math.round(Number(x)||0)+'px';
  el.style.top=Math.round(Number(y)||0)+'px';
  if(Number(w)>0)el.style.width=Math.round(Number(w))+'px';
  if(Number(h)>0)el.style.height=Math.round(Number(h))+'px';
  if(repaint&&typeof jplopsoft_gdi32Invalidate==='function')jplopsoft_gdi32Invalidate(ctx,hwnd,null);
  return true;
}


function jplopsoft_ntcompatApplyWindowStyles(rec){
  var win=rec?jplopsoft_GetWindowElement(rec.hwnd):null,
      titlebar=rec&&rec.titlebarId?jplopsoft_el(rec.titlebarId):null,
      WS_CAPTION=0x00C00000,WS_THICKFRAME=0x00040000,WS_EX_TOPMOST=0x00000008;
  if(!rec||!win)return false;
  if(titlebar)titlebar.style.display=(Number(rec.style)&WS_CAPTION)!==0?'':'none';
  win.style.resize=(Number(rec.style)&WS_THICKFRAME)!==0?'both':'none';
  win.style.overflow='hidden';
  if((Number(rec.exStyle)&WS_EX_TOPMOST)!==0){rec.topmost=true;win.style.zIndex='2147481000';}
  else if(rec.topmost){rec.topmost=false;win.style.zIndex='';}
  return true;
}

function jplopsoft_ntcompatSetWindowPos(ctx,hwnd,insertAfter,x,y,cx,cy,flags){
  var SWP_NOSIZE=0x0001,SWP_NOMOVE=0x0002,SWP_NOZORDER=0x0004,SWP_SHOWWINDOW=0x0040,SWP_HIDEWINDOW=0x0080,
      HWND_TOP=0,HWND_BOTTOM=1,HWND_TOPMOST=-1,HWND_NOTOPMOST=-2,WS_EX_TOPMOST=0x00000008,
      rec=jplopsoft_user32GetRecord(hwnd),el,ia=parseInt(insertAfter,10);
  if(!rec)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid HWND.');
  if(!jplopsoft_ntcompatWindowWritable(ctx,rec))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'SetWindowPos denied by ExOS UIPI.');
  el=jplopsoft_GetWindowElement(hwnd);if(!el)return false;flags=Number(flags)>>>0;
  if(!(flags&SWP_NOMOVE)){el.style.left=Math.round(Number(x)||0)+'px';el.style.top=Math.round(Number(y)||0)+'px';}
  if(!(flags&SWP_NOSIZE)){if(Number(cx)>0)el.style.width=Math.round(Number(cx))+'px';if(Number(cy)>0)el.style.height=Math.round(Number(cy))+'px';}
  if(!(flags&SWP_NOZORDER)){
    if(ia===HWND_TOPMOST){rec.exStyle=(Number(rec.exStyle)||0)|WS_EX_TOPMOST;rec.topmost=true;el.style.zIndex='2147481000';}
    else if(ia===HWND_NOTOPMOST){rec.exStyle=(Number(rec.exStyle)||0)&(~WS_EX_TOPMOST);rec.topmost=false;el.style.zIndex='';jplopsoft_user32Activate(rec);}
    else if(ia===HWND_BOTTOM){rec.topmost=false;el.style.zIndex='2';}
    else if(ia===HWND_TOP||isNaN(ia)){jplopsoft_user32Activate(rec);}
    else{var after=jplopsoft_GetWindowElement(ia);if(after){var az=parseInt(after.style.zIndex,10)||140;el.style.zIndex=String(az+1);}}
  }
  if(flags&SWP_SHOWWINDOW)jplopsoft_user32Display(rec,true);
  if(flags&SWP_HIDEWINDOW)jplopsoft_user32Display(rec,false);
  jplopsoft_ntcompatApplyWindowStyles(rec);
  jplopsoft_SendMessage(rec.hwnd,jplopsoft_WM_SIZE,0,0);
  return true;
}

function jplopsoft_ntcompatExpandEnv(ctx,text){
  var env=ctx&&ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters
        ?ctx.process.peb.processParameters.environment:{};
  return String(text===undefined||text===null?'':text).replace(/%([^%]+)%/g,function(all,name){
    var key=String(name||'').toUpperCase();
    return typeof env[key]==='undefined'?all:String(env[key]);
  });
}

function jplopsoft_ntcompatGetCurrentProcess(ctx){
  return ctx&&ctx.process?ctx.process:null;
}

function jplopsoft_ntcompatProcessFromHandle(ctx,h){
  h=Number(h);
  if(h===-1)return jplopsoft_ntcompatGetCurrentProcess(ctx);
  var rec=jplopsoft_ntProcessHandleForOwner(ctx.pid,h);
  return rec?jplopsoft_ntKernelProcessByPid(rec.pid):null;
}

function jplopsoft_ntcompatEmptyWorkingSet(ctx,h){
  var p=jplopsoft_ntcompatProcessFromHandle(ctx,h),vm,i,r,k,page,count=0;
  if(!p||!p.vm)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid process handle.');
  vm=p.vm;
  for(i=0;i<vm.regions.length;i++){
    r=vm.regions[i];
    if(!r||r.sectionObject)continue;
    for(k in r.pages){
      if(!r.pages.hasOwnProperty(k))continue;
      page=r.pages[k];
      if(page&&page.resident&&page.pinCount<=0){
        try{if(jplopsoft_vmmPageOut(page))count++;}catch(ignoreTrim){}
      }
    }
  }
  jplopsoft_vmmKernel().stats.trims++;
  return{ok:true,pagesTrimmed:count,workingSet:jplopsoft_vmmProcessStatus(p)};
}

function jplopsoft_ntcompatSetWorkingSet(ctx,h,minBytes,maxBytes){
  var p=jplopsoft_ntcompatProcessFromHandle(ctx,h),max=Number(maxBytes),min=Number(minBytes),
      status;
  if(!p)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid process handle.');
  if(min===-1&&max===-1)return jplopsoft_ntcompatEmptyWorkingSet(ctx,h);
  p.workingSetMinBytes=Math.max(0,isFinite(min)?min:0);
  p.workingSetMaxBytes=Math.max(p.workingSetMinBytes,isFinite(max)&&max>=0?max:0);
  status=jplopsoft_vmmProcessStatus(p);
  if(p.workingSetMaxBytes>0&&status.residentPrivateBytes>p.workingSetMaxBytes){
    var vm=p.vm,i,r,k,page,list=[];
    for(i=0;i<vm.regions.length;i++){
      r=vm.regions[i];
      if(!r||r.sectionObject)continue;
      for(k in r.pages)if(r.pages.hasOwnProperty(k)){
        page=r.pages[k];
        if(page&&page.resident&&page.pinCount<=0)list.push(page);
      }
    }
    list.sort(function(a,b){return(Number(a.lastAccess)||0)-(Number(b.lastAccess)||0);});
    for(i=0;i<list.length&&jplopsoft_vmmProcessStatus(p).residentPrivateBytes>p.workingSetMaxBytes;i++){
      try{jplopsoft_vmmPageOut(list[i]);}catch(ignoreWsTrim){}
    }
  }
  return true;
}

function jplopsoft_ntcompatToolhelpSnapshot(ctx,flags,pid){
  var rows=jplopsoft_NtQuerySystemInformation('SystemProcessInformation');
  rows=rows&&rows.information?rows.information:[];
  var h=jplopsoft_xshAllocateHandle(ctx,{
    kind:'toolhelp-process',
    rows:rows,
    index:-1,
    flags:Number(flags)>>>0,
    targetPid:Number(pid)>>>0
  });
  return h;
}

function jplopsoft_ntcompatToolhelpNext(ctx,h,first){
  var rec=jplopsoft_xshHandle(ctx,h),row;
  if(!rec||rec.kind!=='toolhelp-process')throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid Toolhelp snapshot handle.');
  rec.index=first?0:rec.index+1;
  if(rec.index<0||rec.index>=rec.rows.length)return null;
  row=rec.rows[rec.index];
  return{
    dwSize:296,
    cntUsage:0,
    th32ProcessID:Number(row.pid)||0,
    th32DefaultHeapID:0,
    th32ModuleID:0,
    cntThreads:Number(row.logicalThreads)||1,
    th32ParentProcessID:Number(row.ppid)||0,
    pcPriClassBase:Number(row.basePriority)||8,
    dwFlags:0,
    szExeFile:String(row.imageName||'')
  };
}

function jplopsoft_ntcompatModuleFileName(ctx,hModule){
  var p=ctx.process,base=Number(hModule)||0,k;
  if(!p)return'';
  if(!base)return String(ctx.imagePath||p.imagePath||p.imageName||'');
  if(p.vm&&p.vm.modules){
    for(k in p.vm.modules){
      if(p.vm.modules.hasOwnProperty(k)&&Number(p.vm.modules[k])===base){
        return 'C:\\Windows\\System32\\'+String(k);
      }
    }
  }
  return'';
}

async function jplopsoft_ntcompatEnsureTemp(ctx){
  var username=String(ctx&&ctx.process&&ctx.process.username||state.samUsername||'administrator'),
      parts=['C:\\Users\\'+username+'\\AppData','C:\\Users\\'+username+'\\AppData\\Local','C:\\Users\\'+username+'\\AppData\\Local\\Temp'],
      i,n;
  for(i=0;i<parts.length;i++){
    n=jplopsoft_xshResolveC(ctx,parts[i],false);
    if(!n){
      try{await jplopsoft_xshCreateDirectory(ctx,parts[i]);}catch(ignoreCreateTemp){}
    }
  }
  if(ctx&&ctx.process){
    jplopsoft_SetEnvironmentVariable(ctx.process,'LOCALAPPDATA','C:\\Users\\'+username+'\\AppData\\Local');
    jplopsoft_SetEnvironmentVariable(ctx.process,'TEMP',parts[2]);
    jplopsoft_SetEnvironmentVariable(ctx.process,'TMP',parts[2]);
  }
  return parts[2]+'\\';
}

function jplopsoft_ntcompatIniParse(text){
  var sections={},section='',lines=String(text||'').split(/\r?\n/),i,line,p,key,val;
  sections['']={};
  for(i=0;i<lines.length;i++){
    line=lines[i].trim();
    if(!line||line.charAt(0)===';'||line.charAt(0)==='#')continue;
    if(line.charAt(0)==='['&&line.charAt(line.length-1)===']'){
      section=line.substring(1,line.length-1).trim();
      if(!sections[section])sections[section]={};
      continue;
    }
    p=line.indexOf('=');
    if(p<0)continue;
    key=line.substring(0,p).trim();val=line.substring(p+1).trim();
    if(!sections[section])sections[section]={};
    sections[section][key]=val;
  }
  return sections;
}

function jplopsoft_ntcompatIniFindSection(sections,name){
  var k,want=String(name||'').toLowerCase();
  for(k in sections)if(sections.hasOwnProperty(k)&&String(k).toLowerCase()===want)return k;
  return null;
}

function jplopsoft_ntcompatIniFindKey(sec,name){
  var k,want=String(name||'').toLowerCase();
  for(k in sec)if(sec.hasOwnProperty(k)&&String(k).toLowerCase()===want)return k;
  return null;
}

async function jplopsoft_ntcompatGetPrivateProfileString(ctx,section,key,def,file){
  var text='',sections,sname,kname,sec;
  try{text=await jplopsoft_xshReadTextFile(ctx,file);}catch(ignoreIniRead){text='';}
  sections=jplopsoft_ntcompatIniParse(text);
  if(section===null||typeof section==='undefined')return Object.keys(sections).filter(function(x){return x!=='';});
  sname=jplopsoft_ntcompatIniFindSection(sections,section);
  if(sname===null)return String(def===undefined||def===null?'':def);
  sec=sections[sname];
  if(key===null||typeof key==='undefined')return Object.keys(sec);
  kname=jplopsoft_ntcompatIniFindKey(sec,key);
  return kname===null?String(def===undefined||def===null?'':def):String(sec[kname]);
}

async function jplopsoft_ntcompatWritePrivateProfileString(ctx,section,key,value,file){
  var text='',sections,sname,kname,sec,out=[],s,k;
  try{text=await jplopsoft_xshReadTextFile(ctx,file);}catch(ignoreIniRead){text='';}
  sections=jplopsoft_ntcompatIniParse(text);
  sname=jplopsoft_ntcompatIniFindSection(sections,section);
  if(sname===null){sname=String(section||'');sections[sname]={};}
  sec=sections[sname];

  if(key===null||typeof key==='undefined'){
    delete sections[sname];
  }else{
    kname=jplopsoft_ntcompatIniFindKey(sec,key);
    if(value===null||typeof value==='undefined'){
      if(kname!==null)delete sec[kname];
    }else{
      sec[kname===null?String(key):kname]=String(value);
    }
  }

  for(s in sections){
    if(!sections.hasOwnProperty(s))continue;
    if(s!=='')out.push('['+s+']');
    sec=sections[s];
    for(k in sec)if(sec.hasOwnProperty(k))out.push(k+'='+String(sec[k]));
    out.push('');
  }
  await jplopsoft_xshWriteTextFile(ctx,file,out.join('\r\n'));
  return true;
}

async function jplopsoft_ntcompatWaitProcess(ctx,h,ms){
  var p=jplopsoft_ntcompatProcessFromHandle(ctx,h),start=Date.now(),timeout=Number(ms)>>>0;
  if(!p)return 0;
  if(!p.alive)return 0;
  return await new Promise(function(resolve){
    function poll(){
      var q=jplopsoft_ntKernelProcessByPid(p.pid);
      if(!q||!q.alive){resolve(0);return;}
      if(timeout!==0xFFFFFFFF&&Date.now()-start>=timeout){resolve(0x102);return;}
      window.setTimeout(poll,25);
    }
    poll();
  });
}

function jplopsoft_ntcompatGetLastErrorState(ctx){
  if(!ctx.ntcompat)ctx.ntcompat={lastError:0};
  return ctx.ntcompat;
}

function jplopsoft_ntcompatSetLastError(ctx,code){
  jplopsoft_ntcompatGetLastErrorState(ctx).lastError=Number(code)>>>0;
  return code;
}

async function jplopsoft_ntcompatCompress(data,decompress){
  var src=jplopsoft_xshNormalizeBytes(data),kind=decompress?'DecompressionStream':'CompressionStream',
      C=window[kind],stream,writer,response,ab;
  if(typeof C!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Chromium CompressionStream API is unavailable.');
  stream=new C('deflate');
  writer=stream.writable.getWriter();
  await writer.write(src);
  await writer.close();
  response=new Response(stream.readable);
  ab=await response.arrayBuffer();
  return new Uint8Array(ab);
}

async function jplopsoft_ntcompatMinorDispatch(ctx,api,method,args){
  args=args||[];
  if(api==='psapi'){
    if(method==='GetVersion')return{version:'6.4.0-dev-os86',model:'EXOS_PSAPI_V1'};
    if(method==='EmptyWorkingSet')return jplopsoft_ntcompatEmptyWorkingSet(ctx,args[0]);
  }

  if(api==='oleaut32'){
    if(!ctx.oleaut32)ctx.oleaut32={next:0xDA00,bstr:{}};
    if(method==='GetVersion')return{version:'6.4.0-dev-os86',model:'EXOS_OLEAUT32_V1'};
    if(method==='SysAllocString'){
      var bh=ctx.oleaut32.next++;
      ctx.oleaut32.bstr[String(bh)]=String(args[0]===undefined||args[0]===null?'':args[0]);
      return bh;
    }
    if(method==='SysStringLen'){
      var bs=ctx.oleaut32.bstr[String(Number(args[0])||0)];
      if(typeof bs==='undefined')throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid BSTR handle.');
      return bs.length;
    }
    if(method==='BstrToString'){
      var bst=ctx.oleaut32.bstr[String(Number(args[0])||0)];
      if(typeof bst==='undefined')throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid BSTR handle.');
      return String(bst);
    }
    if(method==='SysFreeString'){
      delete ctx.oleaut32.bstr[String(Number(args[0])||0)];
      return true;
    }
  }

  if(api==='icmp'){
    if(!ctx.icmp)ctx.icmp={next:0xDB00,handles:{}};
    if(method==='GetVersion'||method==='QueryCapabilities')return{version:'6.4.0-dev-os86',rawIcmp:false,browserRestriction:true};
    if(method==='IcmpCreateFile'){
      var ih=ctx.icmp.next++;
      ctx.icmp.handles[String(ih)]={handle:ih};
      jplopsoft_ntcompatSetLastError(ctx,0);
      return ih;
    }
    if(method==='IcmpCloseHandle'){
      var ik=String(Number(args[0])||0);
      if(!ctx.icmp.handles[ik])return false;
      delete ctx.icmp.handles[ik];return true;
    }
    if(method==='IcmpSendEcho'){
      jplopsoft_ntcompatSetLastError(ctx,50); /* ERROR_NOT_SUPPORTED */
      return{replyCount:0,lastError:50,status:'ERROR_NOT_SUPPORTED',rawIcmp:false};
    }
  }

  if(api==='zlib'){
    if(method==='GetVersion')return{version:'1.2-compatible facade',backend:'CompressionStream(deflate)'};
    if(method==='compress'){
      var c=await jplopsoft_ntcompatCompress(args[0],false);
      return{status:0,data:c,destLen:c.length};
    }
    if(method==='uncompress'){
      var u=await jplopsoft_ntcompatCompress(args[0],true);
      return{status:0,data:u,destLen:u.length};
    }
  }

  if(api==='tapi32'){
    if(method==='GetVersion'||method==='QueryCapabilities')return{telephony:false,hostDialerExposed:false};
    if(method==='tapiRequestMakeCall'){
      jplopsoft_ntcompatSetLastError(ctx,50);
      return 0x80000048; /* LINEERR_OPERATIONUNAVAIL */
    }
  }

  if(api==='urlmon'){
    if(method==='GetVersion')return{version:'6.4.0-dev-os86',backend:'WinINet broker + ExFS'};
    if(method==='URLDownloadToFile'){
      if(typeof jplopsoft_wininetDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'WinINet broker unavailable.');
      var session=await jplopsoft_wininetDispatch(ctx,'InternetOpen',['URLMON/ExOS']);
      var hurl=0;
      try{
        hurl=await jplopsoft_wininetDispatch(ctx,'InternetOpenUrl',[session,args[1],{},{}]);
        var chunks=[],total=0,r;
        do{
          r=await jplopsoft_wininetDispatch(ctx,'InternetReadFile',[hurl,262144]);
          if(r&&r.data&&r.data.length){chunks.push(r.data);total+=r.data.length;}
        }while(r&&!r.eof);
        var all=new Uint8Array(total),off=0,i;
        for(i=0;i<chunks.length;i++){all.set(chunks[i],off);off+=chunks[i].length;}
        var file=jplopsoft_xshResolveC(ctx,String(args[2]||''),false);
        if(!file)file=await jplopsoft_xshCreateCNode(ctx,String(args[2]||''),'file');
        await jplopsoft_xshWriteNodeBytes(file,all);
        return 0; /* S_OK */
      }finally{
        try{if(hurl)await jplopsoft_wininetDispatch(ctx,'InternetCloseHandle',[hurl]);}catch(ignoreUrlClose){}
        try{await jplopsoft_wininetDispatch(ctx,'InternetCloseHandle',[session]);}catch(ignoreSessionClose){}
      }
    }
  }

  if(api==='winmm'){
    if(!ctx.winmm)ctx.winmm={session:0,track:0};
    if(method==='GetVersion')return{version:'6.4.0-dev-os86',backend:'ExOS MediaFoundation'};
    if(method==='sndPlaySound'){
      if(typeof jplopsoft_mediaDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'MediaFoundation unavailable.');
      var sound=args[0],flags=Number(args[1])>>>0;
      if(sound===null||typeof sound==='undefined'||sound===''){
        try{if(ctx.winmm.track)await jplopsoft_mediaDispatch(ctx,'Stop',[ctx.winmm.track]);}catch(ignoreStopSound){}
        ctx.winmm.track=0;
        return true;
      }
      if(!ctx.winmm.session){
        await jplopsoft_mediaDispatch(ctx,'MFStartup',[]);
        var sr=await jplopsoft_mediaDispatch(ctx,'CreateAudioSession',[{}]);
        ctx.winmm.session=sr&&sr.handle?sr.handle:sr;
      }
      var tr=await jplopsoft_mediaDispatch(ctx,'CreateSourceFromPath',[ctx.winmm.session,String(sound),{loop:!!(flags&0x0008)}]);
      ctx.winmm.track=tr&&tr.handle?tr.handle:tr;
      await jplopsoft_mediaDispatch(ctx,'Play',[ctx.winmm.track]);
      return true;
    }
    if(method==='sndPlay'||method==='sndStop'){
      return await jplopsoft_ntcompatMinorDispatch(ctx,'winmm','sndPlaySound',method==='sndStop'?[null,args[1]]:args);
    }
  }

  throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'XSH compatibility API not supported: '+api+'.'+method);
}

async function jplopsoft_ntcompatKernel32Dispatch(ctx,method,args){
  args=args||[];
  if(method==='GetVersionEx'||method==='GetVersionExA'||method==='GetVersionExW'){
    return{
      dwOSVersionInfoSize:284,
      dwMajorVersion:10,
      dwMinorVersion:0,
      dwBuildNumber:19045,
      dwPlatformId:2,
      szCSDVersion:'ExOS NT compatibility layer',
      wServicePackMajor:0,
      wServicePackMinor:0,
      wSuiteMask:0,
      wProductType:1,
      exosVersion:'6.4.0-dev-os91',
      emulated:true
    };
  }
  if(method==='ExitProcess'){
    window.setTimeout(function(){jplopsoft_xshTerminate(ctx,Number(args[0])||0,'kernel32.ExitProcess',false);},0);
    return true;
  }
  if(method==='GetCurrentProcess')return -1;
  if(method==='GetCurrentProcessId')return Number(ctx.pid)||0;
  if(method==='GetTickCount')return ((Date.now()-jplopsoft_NT_KERNEL.bootTime)>>>0);
  if(method==='GetTickCount64')return Math.max(0,Date.now()-jplopsoft_NT_KERNEL.bootTime);
  if(method==='GetSystemInfo'){
    var vs=jplopsoft_vmmGlobalStatus(ctx.process);
    return{
      wProcessorArchitecture:9,
      dwPageSize:vs.pageSize,
      lpMinimumApplicationAddress:0x10000,
      lpMaximumApplicationAddress:Math.pow(2,47)-1,
      dwActiveProcessorMask:0xFFFFFFFF,
      dwNumberOfProcessors:Math.max(1,Number(navigator.hardwareConcurrency)||1),
      dwProcessorType:8664,
      dwAllocationGranularity:vs.allocationGranularity,
      wProcessorLevel:6,
      wProcessorRevision:0,
      architecture:'AMD64-compatible ExOS V8 virtual process'
    };
  }
  if(method==='GlobalMemoryStatus'){
    var m=jplopsoft_vmmGlobalMemoryStatus(ctx.process);
    return{
      dwLength:32,
      dwMemoryLoad:Number(m.dwMemoryLoad)||0,
      dwTotalPhys:Math.min(0xFFFFFFFF,Number(m.ullTotalPhys)||0),
      dwAvailPhys:Math.min(0xFFFFFFFF,Number(m.ullAvailPhys)||0),
      dwTotalPageFile:Math.min(0xFFFFFFFF,Number(m.ullTotalPageFile)||0),
      dwAvailPageFile:Math.min(0xFFFFFFFF,Number(m.ullAvailPageFile)||0),
      dwTotalVirtual:0x7FFFFFFF,
      dwAvailVirtual:0x7FFFFFFF
    };
  }
  if(method==='SetProcessWorkingSetSize')return jplopsoft_ntcompatSetWorkingSet(ctx,args[0],args[1],args[2]);
  if(method==='WaitForSingleObject')return await jplopsoft_ntcompatWaitProcess(ctx,args[0],args[1]);
  if(method==='CreateToolhelp32Snapshot'||method==='CreateToolhelpSnapshot')return jplopsoft_ntcompatToolhelpSnapshot(ctx,args[0],args[1]);
  if(method==='Process32First'||method==='ProcessFirst')return jplopsoft_ntcompatToolhelpNext(ctx,args[0],true);
  if(method==='Process32Next'||method==='ProcessNext')return jplopsoft_ntcompatToolhelpNext(ctx,args[0],false);
  if(method==='GetWindowsDirectory'||method==='GetWindowsDirectoryA'||method==='GetWindowsDirectoryW')return'C:\\Windows';
  if(method==='GetSystemDirectory'||method==='GetSystemDirectoryA'||method==='GetSystemDirectoryW')return'C:\\Windows\\System32';
  if(method==='GetTempPath'||method==='GetTempPathA'||method==='GetTempPathW')return await jplopsoft_ntcompatEnsureTemp(ctx);
  if(method==='ExpandEnvironmentStrings'||method==='ExpandEnvironmentStringsA'||method==='ExpandEnvironmentStringsW')return jplopsoft_ntcompatExpandEnv(ctx,args[0]);
  if(method==='GetModuleFileName'||method==='GetModuleFileNameA'||method==='GetModuleFileNameW')return jplopsoft_ntcompatModuleFileName(ctx,args[0]);
  if(method==='GetPrivateProfileString'||method==='GetPrivateProfileStringA'||method==='GetPrivateProfileStringW')return await jplopsoft_ntcompatGetPrivateProfileString(ctx,args[0],args[1],args[2],args[3]);
  if(method==='WritePrivateProfileString'||method==='WritePrivateProfileStringA'||method==='WritePrivateProfileStringW')return await jplopsoft_ntcompatWritePrivateProfileString(ctx,args[0],args[1],args[2],args[3]);
  if(method==='GetVolumeInformation'||method==='GetVolumeInformationA'||method==='GetVolumeInformationW'){
    var d=await jplopsoft_xshApiPromise('disk_info','GET',null),serial=0;
    if(d.serial){
      var sm=String(d.serial).replace(/[^0-9A-F]/ig,'').slice(-8);
      serial=parseInt(sm||'0',16)>>>0;
    }
    return{
      volumeName:String(d.label||'ExFS'),
      volumeSerialNumber:serial,
      maximumComponentLength:120,
      fileSystemFlags:0x00000002|0x00000004|0x00040000,
      fileSystemName:'ExFS',
      exfsFormat:String(d.filesystem||'EXFS')
    };
  }
  if(method==='SetFileAttributes'||method==='SetFileAttributesA'||method==='SetFileAttributesW'){
    var n=jplopsoft_xshResolveC(ctx,args[0],false);
    if(!n)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'File not found.');
    await jplopsoft_xshApiPromise('file_set_attributes','POST',{id:Number(n.id)||0,attributes:Number(args[1])>>>0});
    await jplopsoft_xshReloadNodes();
    return true;
  }
  if(method==='RtlZeroMemory'){
    var addr=Number(args[0]),len=Math.max(0,Math.min(64*1024*1024,Number(args[1])||0));
    if(!isFinite(addr)||addr<=0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_ADDRESS,'RtlZeroMemory requires an ExOS virtual address.');
    return{bytesWritten:jplopsoft_vmmWrite(ctx.process,addr,new Uint8Array(len),true)};
  }
  if(method==='RtlMoveMemory'||method==='CopyMemory'||method==='CopyMemory_For_GIABHN'){
    var dst=Number(args[0]),count=Math.max(0,Math.min(64*1024*1024,Number(args[2])||0)),src=args[1],b;
    if(typeof src==='number')b=jplopsoft_vmmRead(ctx.process,src,count,true);
    else b=jplopsoft_xshNormalizeBytes(src).subarray(0,count);
    return{bytesWritten:jplopsoft_vmmWrite(ctx.process,dst,b,true)};
  }
  throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Unsupported kernel32 compatibility method: '+method);
}

async function jplopsoft_ntcompatUser32Dispatch(ctx,method,args){
  args=args||[];
  var hwnd,rec,r,list,i,idx,cmd,w,el;

  if(method==='FindWindow'||method==='FindWindowA'||method==='FindWindowW')return jplopsoft_ntcompatFindWindow(ctx,args[0],args[1],0,0);
  if(method==='FindWindowEx'||method==='FindWindowExA'||method==='FindWindowExW')return jplopsoft_ntcompatFindWindow(ctx,args[2],args[3],args[0],args[1]);

  if(method==='GetClassName'||method==='GetClassNameA'||method==='GetClassNameW'){
    rec=jplopsoft_user32GetRecord(args[0]);return rec&&jplopsoft_ntcompatWindowReadable(ctx,rec)?String(rec.className||''):'';}
  if(method==='GetWindowText'||method==='GetWindowTextA'||method==='GetWindowTextW'){
    rec=jplopsoft_user32GetRecord(args[0]);return rec&&jplopsoft_ntcompatWindowReadable(ctx,rec)?String(rec.title||''):'';}
  if(method==='GetWindowTextLength'||method==='GetWindowTextLengthA'||method==='GetWindowTextLengthW'){
    rec=jplopsoft_user32GetRecord(args[0]);return rec&&jplopsoft_ntcompatWindowReadable(ctx,rec)?String(rec.title||'').length:0;}

  if(method==='IsWindow')return !!jplopsoft_user32GetRecord(args[0]);
  if(method==='IsWindowVisible'){rec=jplopsoft_user32GetRecord(args[0]);return !!(rec&&jplopsoft_user32DisplayIsVisible(rec));}
  if(method==='IsWindowEnabled'){rec=jplopsoft_user32GetRecord(args[0]);if(!rec)return false;el=jplopsoft_GetWindowElement(rec.hwnd);return !(el&&el.disabled);}
  if(method==='IsZoomed'){rec=jplopsoft_user32GetRecord(args[0]);return !!(rec&&jplopsoft_user32IsMaximized(rec));}
  if(method==='IsIconic'){rec=jplopsoft_user32GetRecord(args[0]);return !!(rec&&String(rec.windowState||'')==='minimized');}
  if(method==='IsChild'){rec=jplopsoft_user32GetRecord(args[1]);return !!(rec&&(parseInt(rec.parentHwnd,10)||0)===(parseInt(args[0],10)||0));}

  if(method==='GetFocus')return jplopsoft_ntcompatActiveElementHwnd();
  if(method==='GetActiveWindow'||method==='GetForegroundWindow')return parseInt(jplopsoft_NT_SCHEDULER.foregroundHwnd,10)||0;
  if(method==='GetWindow'||method==='GetNextWindow'){
    hwnd=parseInt(args[0],10)||0;cmd=Number(args[1])||2;list=jplopsoft_ntcompatWindowList();idx=-1;
    for(i=0;i<list.length;i++)if(parseInt(list[i].hwnd,10)===hwnd){idx=i;break;}
    if(cmd===0)return list.length?list[0].hwnd:0;
    if(cmd===1)return list.length?list[list.length-1].hwnd:0;
    if(cmd===2)return idx>=0&&idx+1<list.length?list[idx+1].hwnd:0;
    if(cmd===3)return idx>0?list[idx-1].hwnd:0;
    if(cmd===4){rec=jplopsoft_user32GetRecord(hwnd);return rec?(parseInt(rec.ownerHwnd,10)||0):0;}
    if(cmd===5){for(i=0;i<list.length;i++)if((parseInt(list[i].parentHwnd,10)||0)===hwnd)return list[i].hwnd;return 0;}
    return 0;
  }

  if(method==='MoveWindow')return jplopsoft_ntcompatMoveWindow(ctx,args[0],args[1],args[2],args[3],args[4],args[5]);
  if(method==='SetWindowPos')return jplopsoft_ntcompatSetWindowPos(ctx,args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
  if(method==='GetWindowRect'){r=jplopsoft_GetWindowRect(args[0]);return r||null;}
  if(method==='WindowFromPoint'){
    var x=Number(args[0]&&typeof args[0]==='object'?args[0].x:args[0])||0,
        y=Number(args[0]&&typeof args[0]==='object'?args[0].y:args[1])||0;
    list=jplopsoft_ntcompatWindowList();
    for(i=list.length-1;i>=0;i--){
      rec=list[i];r=jplopsoft_GetWindowRect(rec.hwnd);
      if(r&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&jplopsoft_user32DisplayIsVisible(rec))return rec.hwnd;
    }
    return 0;
  }

  if(method==='GetWindowThreadProcessId'){
    rec=jplopsoft_user32GetRecord(args[0]);
    return rec?{threadId:Number(rec.ntPid)||0,processId:Number(rec.ntPid)||0}:null;
  }

  if(method==='GetWindowLong'||method==='GetWindowLongA'||method==='GetWindowLongW'){
    rec=jplopsoft_user32GetRecord(args[0]);if(!rec)return 0;
    var gi=Number(args[1])|0;
    if(gi===-16)return Number(rec.style)||0;
    if(gi===-20)return Number(rec.exStyle)||0;
    if(gi===-21)return Number(rec.userData)||0;
    return 0;
  }
  if(method==='SetWindowLong'||method==='SetWindowLongA'||method==='SetWindowLongW'){
    rec=jplopsoft_user32GetRecord(args[0]);if(!rec)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid HWND.');
    if(!jplopsoft_ntcompatWindowWritable(ctx,rec))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'SetWindowLong denied by ExOS UIPI.');
    var si=Number(args[1])|0,old=0,nv=Number(args[2])||0;
    if(si===-16){old=Number(rec.style)||0;rec.style=nv;jplopsoft_ntcompatApplyWindowStyles(rec);}
    else if(si===-20){old=Number(rec.exStyle)||0;rec.exStyle=nv;jplopsoft_ntcompatApplyWindowStyles(rec);}
    else if(si===-21){old=Number(rec.userData)||0;rec.userData=nv;}
    return old;
  }

  if(method==='SetLayeredWindowAttributes'){
    rec=jplopsoft_user32GetRecord(args[0]);if(!rec)return false;
    if(!jplopsoft_ntcompatWindowWritable(ctx,rec))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Layered-window update denied.');
    el=jplopsoft_GetWindowElement(rec.hwnd);
    if(el)el.style.opacity=String(Math.max(0,Math.min(255,Number(args[2])||255))/255);
    return true;
  }

  if(method==='SystemParametersInfo'||method==='SystemParametersInfoA'||method==='SystemParametersInfoW'){
    var action=typeof args[0]==='string'?String(args[0]).toUpperCase():Number(args[0]);
    if(action===48||action==='SPI_GETWORKAREA')return{left:0,top:0,right:window.innerWidth,bottom:Math.max(0,window.innerHeight-40)};
    if(action===0||action==='SPI_GETBEEP')return true;
    if(action===16||action==='SPI_GETSCREENSAVEACTIVE')return false;
    if(action===10||action==='SPI_GETKEYBOARDSPEED')return 31;
    if(action===22||action==='SPI_GETKEYBOARDDELAY')return 1;
    return{supported:false,action:action};
  }

  if(method==='GetAsyncKeyState'){
    var vk=String(Number(args[0])||0),ks=jplopsoft_NTCOMPAT_OS83.input.keys[vk]||{},foreground=parseInt(jplopsoft_NT_SCHEDULER.foregroundPid,10)||0,val=0;
    if(foreground!==parseInt(ctx.pid,10))return 0;
    if(ks.down)val|=0x8000;
    if(ks.pressed){val|=1;ks.pressed=false;}
    return val;
  }

  if(method==='GetCursorPos')return{x:jplopsoft_NTCOMPAT_OS83.input.cursor.x,y:jplopsoft_NTCOMPAT_OS83.input.cursor.y};
  if(method==='ClientToScreen'||method==='ScreenToClient'){
    rec=jplopsoft_user32GetRecord(args[0]);
    if(!rec||!jplopsoft_ntcompatWindowReadable(ctx,rec))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid HWND.');
    var client=jplopsoft_GetClientElement(rec.hwnd),br=client&&client.getBoundingClientRect?client.getBoundingClientRect():null,
        pt=args[1]&&typeof args[1]==='object'?args[1]:{x:args[1],y:args[2]},px=Number(pt.x)||0,py=Number(pt.y)||0;
    if(!br)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Window client area unavailable.');
    if(method==='ClientToScreen')return{x:px+br.left,y:py+br.top};
    return{x:px-br.left,y:py-br.top};
  }
  if(method==='SetCapture'){
    hwnd=parseInt(args[0],10)||0;rec=jplopsoft_user32GetRecord(hwnd);
    if(!rec||!ctx.windows[String(hwnd)])throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'SetCapture requires an HWND owned by the caller XSH process.');
    var oldCap=jplopsoft_NTCOMPAT_OS83.capture?Number(jplopsoft_NTCOMPAT_OS83.capture.hwnd)||0:0;
    jplopsoft_NTCOMPAT_OS83.capture={pid:ctx.pid,hwnd:hwnd};
    return oldCap;
  }
  if(method==='GetCapture')return jplopsoft_NTCOMPAT_OS83.capture?Number(jplopsoft_NTCOMPAT_OS83.capture.hwnd)||0:0;
  if(method==='ReleaseCapture'){
    if(!jplopsoft_NTCOMPAT_OS83.capture)return false;
    if(Number(jplopsoft_NTCOMPAT_OS83.capture.pid)!==Number(ctx.pid))return false;
    jplopsoft_NTCOMPAT_OS83.capture=null;return true;
  }
  if(method==='GetSystemMetrics'){
    var index=typeof args[0]==='string'?String(args[0]).toUpperCase():Number(args[0]),root=jplopsoft_rootWindowHost?jplopsoft_rootWindowHost():null,
        rw=root&&root.getBoundingClientRect?root.getBoundingClientRect():{width:window.innerWidth,height:window.innerHeight},sw=Math.round(rw.width||window.innerWidth),sh=Math.round(rw.height||window.innerHeight),task=40;
    var metrics={0:sw,1:sh,2:17,3:17,4:30,5:1,6:1,7:3,8:3,11:32,12:32,13:32,14:32,15:24,16:sw,17:Math.max(0,sh-task),19:1,20:17,21:17,28:160,29:38,30:30,31:30,32:4,33:4,34:120,35:60,36:4,37:4,38:75,39:75,43:3,45:2,46:2,49:16,50:16,51:22,52:22,53:22,54:18,55:18,59:sw,60:sh,61:sw,62:Math.max(0,sh-task),63:1,67:0};
    var names={SM_CXSCREEN:0,SM_CYSCREEN:1,SM_CXVSCROLL:2,SM_CYHSCROLL:3,SM_CYCAPTION:4,SM_CXBORDER:5,SM_CYBORDER:6,SM_CXDLGFRAME:7,SM_CYDLGFRAME:8,SM_CXICON:11,SM_CYICON:12,SM_CXCURSOR:13,SM_CYCURSOR:14,SM_CYMENU:15,SM_CXFULLSCREEN:16,SM_CYFULLSCREEN:17,SM_MOUSEPRESENT:19,SM_CYVSCROLL:20,SM_CXHSCROLL:21,SM_CXMIN:28,SM_CYMIN:29,SM_CXSIZE:30,SM_CYSIZE:31,SM_CXFRAME:32,SM_CYFRAME:33,SM_CXMINTRACK:34,SM_CYMINTRACK:35,SM_CXDOUBLECLK:36,SM_CYDOUBLECLK:37,SM_CXICONSPACING:38,SM_CYICONSPACING:39,SM_CMOUSEBUTTONS:43,SM_CXEDGE:45,SM_CYEDGE:46,SM_CXSMICON:49,SM_CYSMICON:50,SM_CYSMCAPTION:51,SM_CXSMSIZE:52,SM_CYSMSIZE:53,SM_CXMENUSIZE:54,SM_CYMENUSIZE:55,SM_CXMAXTRACK:59,SM_CYMAXTRACK:60,SM_CXMAXIMIZED:61,SM_CYMAXIMIZED:62,SM_NETWORK:63,SM_CLEANBOOT:67};
    if(typeof index==='string')index=typeof names[index]==='undefined'?-1:names[index];
    return typeof metrics[index]==='undefined'?0:metrics[index];
  }
  if(method==='RegisterHotKey'){
    hwnd=parseInt(args[0],10)||0;var hotId=Number(args[1])|0,hotMods=Number(args[2])>>>0,hotVk=Number(args[3])|0;
    if(hwnd&&!ctx.windows[String(hwnd)])throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'RegisterHotKey HWND must belong to the caller XSH process.');
    if(!hotId||hotVk<=0||hotVk>255)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Invalid hotkey id or virtual key.');
    var hotKey=jplopsoft_ntcompatHotkeyKey(hotMods,hotVk),existing=jplopsoft_NTCOMPAT_OS83.hotkeys[hotKey];
    if(existing&&!(Number(existing.pid)===Number(ctx.pid)&&Number(existing.id)===hotId))return false;
    jplopsoft_NTCOMPAT_OS83.hotkeys[hotKey]={pid:ctx.pid,hwnd:hwnd,id:hotId,modifiers:hotMods,vk:hotVk};
    return true;
  }
  if(method==='UnregisterHotKey'){
    hwnd=parseInt(args[0],10)||0;var unId=Number(args[1])|0,hkTable=jplopsoft_NTCOMPAT_OS83.hotkeys,hkk,hv;
    for(hkk in hkTable){if(!hkTable.hasOwnProperty(hkk))continue;hv=hkTable[hkk];if(hv&&Number(hv.pid)===Number(ctx.pid)&&Number(hv.id)===unId&&Number(hv.hwnd||0)===hwnd){delete hkTable[hkk];return true;}}
    return false;
  }
  if(method==='SetCursorPos'){
    var cx=Number(args[0])||0,cy=Number(args[1])||0,cl=jplopsoft_NTCOMPAT_OS83.input.clip;
    if(cl){cx=Math.max(cl.left,Math.min(cl.right,cx));cy=Math.max(cl.top,Math.min(cl.bottom,cy));}
    jplopsoft_NTCOMPAT_OS83.input.cursor={x:cx,y:cy};
    return{ok:true,virtualOnly:true,x:cx,y:cy};
  }
  if(method==='ClipCursor'){jplopsoft_NTCOMPAT_OS83.input.clip=args[0]||null;return true;}
  if(method==='ShowCursor'){
    var show=!!args[0];jplopsoft_NTCOMPAT_OS83.input.showCount+=show?1:-1;
    if(document&&document.documentElement)document.documentElement.style.cursor=jplopsoft_NTCOMPAT_OS83.input.showCount<0?'none':'';
    return jplopsoft_NTCOMPAT_OS83.input.showCount;
  }

  if(method==='keybd_event'){
    if((parseInt(jplopsoft_NT_SCHEDULER.foregroundPid,10)||0)!==parseInt(ctx.pid,10))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Synthetic keyboard input is limited to the caller foreground process.');
    var vkCode=Number(args[0])||0,flags=Number(args[2])>>>0,isUp=!!(flags&0x0002),target=document.activeElement;
    if(target&&target.dispatchEvent){
      try{target.dispatchEvent(new KeyboardEvent(isUp?'keyup':'keydown',{keyCode:vkCode,which:vkCode,bubbles:true,cancelable:true}));}catch(ignoreSyntheticKey){}
    }
    return true;
  }
  if(method==='mouse_event'){
    if((parseInt(jplopsoft_NT_SCHEDULER.foregroundPid,10)||0)!==parseInt(ctx.pid,10))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Synthetic mouse input is limited to the caller foreground process.');
    jplopsoft_NTCOMPAT_OS83.input.cursor.x=Number(args[1])||jplopsoft_NTCOMPAT_OS83.input.cursor.x;
    jplopsoft_NTCOMPAT_OS83.input.cursor.y=Number(args[2])||jplopsoft_NTCOMPAT_OS83.input.cursor.y;
    return{ok:true,virtualOnly:true};
  }

  if(method==='SetWindowsHookEx'||method==='SetWindowsHookExA'||method==='SetWindowsHookExW'){
    var hookType=Number(args[0])||0;
    if([2,7,13,14].indexOf(hookType)<0)throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Only keyboard/mouse ExOS process-local hooks are supported.');
    if(!ctx.ntcompatHooks)ctx.ntcompatHooks={};
    var hh=++jplopsoft_NTCOMPAT_OS83.hookSeq;
    ctx.ntcompatHooks[String(hh)]={handle:hh,idHook:hookType,threadId:Number(args[3])||0};
    return hh;
  }
  if(method==='UnhookWindowsHookEx'){
    if(!ctx.ntcompatHooks)return false;
    var hk=String(Number(args[0])||0);if(!ctx.ntcompatHooks[hk])return false;delete ctx.ntcompatHooks[hk];return true;
  }
  if(method==='CallNextHookEx')return true;

  if(method==='SendMessage'||method==='SendMessageA'||method==='SendMessageW'){
    rec=jplopsoft_user32GetRecord(args[0]);if(!rec)return 0;
    if(!jplopsoft_ntcompatWindowWritable(ctx,rec))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Cross-process SendMessage denied by ExOS UIPI.');
    return jplopsoft_SendMessage(rec.hwnd,args[1],args[2],args[3]);
  }

  if(method==='GetDC'){
    if(typeof jplopsoft_gdi32Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'GDI32 unavailable.');
    return await jplopsoft_gdi32Dispatch(ctx,'GetDC',[args[0]]);
  }
  if(method==='ReleaseDC'){
    if(typeof jplopsoft_gdi32Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'GDI32 unavailable.');
    return await jplopsoft_gdi32Dispatch(ctx,'ReleaseDC',[args[0],args[1]]);
  }

  throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Unsupported user32 compatibility method: '+method);
}

async function jplopsoft_xshDispatch(ctx,api,method,args){
  var r,h,attr,path,proc,child,code,drive,v,control;
  api=String(api||'');method=String(method||'');args=args||[];
  if(ctx.terminating)throw jplopsoft_xshError(jplopsoft_STATUS_PROCESS_IS_TERMINATING,'XSH process is terminating.');

  if(api==='kernel32'){
    if(method==='CreateFile'){r=await jplopsoft_xshNtCreateFile(ctx,args[0],args[1],args[2],'CreateFile');if(r.status!==jplopsoft_STATUS_SUCCESS)throw jplopsoft_xshError(r.status,r.error);return r.handle;}
    if(method==='ReadFile'){
      if((parseInt(args[0],10)||0)===-10){
        var consoleText=await jplopsoft_xshConsoleRead(ctx,args[1]);
        return{
          status:jplopsoft_STATUS_SUCCESS,
          bytesRead:String(consoleText).length,
          text:String(consoleText)
        };
      }
      r=await jplopsoft_xshNtReadFile(ctx,args[0],args[1],args[2],'ReadFile');if(r.status!==jplopsoft_STATUS_SUCCESS)throw jplopsoft_xshError(r.status,r.error);return r;
    }
    if(method==='ReadFileBuffer'){
      r=await jplopsoft_xshNtReadFileBuffer(ctx,args[0],args[1],args[2],'ReadFileBuffer');
      if(r.status!==jplopsoft_STATUS_SUCCESS){
        throw jplopsoft_xshError(r.status,r.error);
      }
      return r;
    }
    if(method==='WriteFile'){
      var writeHandle=parseInt(args[0],10)||0;
      if(writeHandle===-11||writeHandle===-12){
        var wr=jplopsoft_xshConsoleWrite(
          ctx,
          args[1],
          writeHandle===-12?'stderr':'stdout'
        );
        return{
          status:jplopsoft_STATUS_SUCCESS,
          bytesWritten:wr.written
        };
      }
      r=await jplopsoft_xshNtWriteFile(ctx,args[0],args[1],args[2],'WriteFile');if(r.status!==jplopsoft_STATUS_SUCCESS)throw jplopsoft_xshError(r.status,r.error);return r;
    }
    if(method==='CloseHandle'){
      if(jplopsoft_xshCloseHandle(ctx,args[0]))return true;
      var ph=jplopsoft_ntProcessHandleForOwner(ctx.pid,args[0]);
      if(ph&&Number(args[0])!==-1){delete jplopsoft_NT_KERNEL.processHandles[String(parseInt(args[0],10)||0)];return true;}
      if(typeof jplopsoft_advapi32CloseHandle==='function'&&jplopsoft_advapi32CloseHandle(ctx,args[0]))return true;
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid handle.');
    }
    if(method==='GetFileSize')return jplopsoft_xshGetFileSizeByHandle(ctx,args[0]);
    if(method==='FlushFileBuffers')return await jplopsoft_xshFlushFileBuffers(ctx,args[0]);
    if(method==='ReadTextFile')return await jplopsoft_xshReadTextFile(ctx,args[0]);
    if(method==='WriteTextFile')return await jplopsoft_xshWriteTextFile(ctx,args[0],args[1]);
    if(method==='CreateDirectory')return await jplopsoft_xshCreateDirectory(ctx,args[0]);
    if(method==='CreateSymbolicLink'||method==='CreateSymbolicLinkA'||method==='CreateSymbolicLinkW')return await jplopsoft_xshCreateReparsePoint(ctx,args[0],args[1],'SYMLINK');
    if(method==='CreateJunction')return await jplopsoft_xshCreateReparsePoint(ctx,args[0],args[1],'MOUNT_POINT');
    if(method==='DefineDosDevice'||method==='DefineDosDeviceA'||method==='DefineDosDeviceW')return jplopsoft_xshDefineDosDevice(ctx,args[0],args[1],args[2]);
    if(method==='QueryDosDevice'||method==='QueryDosDeviceA'||method==='QueryDosDeviceW')return jplopsoft_xshQueryDosDevice(args[0]);
    if(method==='GetFileAttributes'){attr=jplopsoft_xshGetAttributes(ctx,args[0]);if(!attr)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Object not found.');return attr;}
    if(method==='ListDirectory')return jplopsoft_xshListDirectory(ctx,args[0]);
    if(method==='DeleteFile')return await jplopsoft_xshDeleteFile(ctx,args[0]);
    if(method==='RemoveDirectory')return await jplopsoft_xshRemoveDirectory(ctx,args[0]);
    if(method==='MoveFile')return await jplopsoft_xshMoveFile(ctx,args[0],args[1]);
    if(method==='CopyFile')return await jplopsoft_xshCopyFile(ctx,args[0],args[1],args[2]);
    if(method==='GetCurrentDirectory')return ctx.currentDirectory;
    if(method==='SetEnvironmentVariable'){
      if(!jplopsoft_SetEnvironmentVariable(ctx.process,args[0],args[1])){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_PARAMETER,
          'Invalid environment variable name.'
        );
      }
      return true;
    }
    if(method==='GetEnvironmentVariable'){
      var envName=String(args[0]||'').toUpperCase(),
          env=ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters
            ?ctx.process.peb.processParameters.environment
            :{};
      return typeof env[envName]==='undefined'?null:String(env[envName]);
    }
    if(method==='GetEnvironmentStrings'){
      var outEnv={},srcEnv=
        ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters
          ?ctx.process.peb.processParameters.environment
          :{},ek;
      for(ek in srcEnv){
        if(srcEnv.hasOwnProperty(ek))outEnv[ek]=String(srcEnv[ek]);
      }
      return outEnv;
    }
    if(method==='GetStdHandle'){
      return jplopsoft_xshGetStdHandleValue(
        ctx,
        args[0]
      );
    }
    if(method==='SetStdHandle'){
      return jplopsoft_xshSetStdHandleValue(
        ctx,
        args[0],
        args[1]
      );
    }
    if(method==='CreatePipe'){
      return jplopsoft_xshCreatePipe(ctx);
    }
    if(method==='AllocConsole'){
      if(!jplopsoft_xshConsoleAlloc(ctx)){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_ACCESS_DENIED,
          'Console is already attached.'
        );
      }
      return true;
    }
    if(method==='FreeConsole'){
      return jplopsoft_xshConsoleDetach(ctx);
    }
    if(method==='AttachConsole'){
      return jplopsoft_xshConsoleAttachToProcess(ctx,args[0]);
    }
    if(method==='WriteConsole'){
      var wh=parseInt(args[0],10)||0;

      if(wh!==-11&&wh!==-12){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'WriteConsole requires STD_OUTPUT_HANDLE or STD_ERROR_HANDLE.'
        );
      }

      return jplopsoft_xshConsoleWrite(
        ctx,
        args[1],
        wh===-12?'stderr':'stdout'
      );
    }
    if(method==='ReadConsole'){
      if((parseInt(args[0],10)||0)!==-10){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'ReadConsole requires STD_INPUT_HANDLE.'
        );
      }

      return await jplopsoft_xshConsoleRead(
        ctx,
        args[1]
      );
    }
    if(method==='SetConsoleTitle'){
      return jplopsoft_xshConsoleSetTitle(
        ctx,
        args[0]
      );
    }
    if(method==='GetConsoleTitle'){
      var titleSession=jplopsoft_xshConsoleForProcess(ctx);

      if(!titleSession){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'The process is not attached to a console.'
        );
      }

      return String(titleSession.title||'');
    }
    if(method==='GetConsoleMode'){
      var modeSession=jplopsoft_xshConsoleForProcess(ctx),
          modeHandle=parseInt(args[0],10)||0;

      if(!modeSession){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'The process is not attached to a console.'
        );
      }

      return modeHandle===-10
        ?modeSession.inputMode
        :modeSession.outputMode;
    }
    if(method==='SetConsoleMode'){
      var setModeSession=jplopsoft_xshConsoleForProcess(ctx),
          setModeHandle=parseInt(args[0],10)||0,
          setModeValue=Number(args[1])>>>0;

      if(!setModeSession){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'The process is not attached to a console.'
        );
      }

      if(setModeHandle===-10){
        setModeSession.inputMode=setModeValue;
      }else if(setModeHandle===-11||setModeHandle===-12){
        setModeSession.outputMode=setModeValue;
      }else{
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'Invalid console handle.'
        );
      }

      return true;
    }
    if(method==='SetConsoleTextAttribute'){
      var textAttrHandle=parseInt(args[0],10)||0;

      if(
        textAttrHandle!==-11&&
        textAttrHandle!==-12
      ){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_INVALID_HANDLE,
          'SetConsoleTextAttribute requires an output handle.'
        );
      }

      return jplopsoft_xshConsoleSetTextAttribute(
        ctx,
        args[1]
      );
    }
    if(method==='GetConsoleScreenBufferInfo'){
      return jplopsoft_xshConsoleInfo(ctx);
    }
    if(method==='GetConsoleCommandHistory'){
      return jplopsoft_xshConsoleHistory(ctx);
    }
    if(method==='GetConsoleCommandHistoryLength'){
      return jplopsoft_xshConsoleHistory(ctx).join('\0').length;
    }
    if(method==='SetConsoleNumberOfCommands'){
      return jplopsoft_xshConsoleSetHistoryMax(
        ctx,
        args[0]
      );
    }
    if(method==='ExpungeConsoleCommandHistory'){
      return jplopsoft_xshConsoleExpungeHistory(
        ctx
      );
    }
    if(method==='ClearConsole'){
      return jplopsoft_xshConsoleClear(ctx);
    }
    if(method==='GetConsoleCP'){
      var cpSession=jplopsoft_xshConsoleForProcess(ctx);
      return cpSession?cpSession.inputCodePage:0;
    }
    if(method==='GetConsoleOutputCP'){
      var ocpSession=jplopsoft_xshConsoleForProcess(ctx);
      return ocpSession?ocpSession.outputCodePage:0;
    }
    if(method==='SetCurrentDirectory'){
      path=String(args[0]||'');
      var spec=jplopsoft_xshPathSpec(ctx,path),node;

      if(spec.kind!=='exfs'){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_NOT_SUPPORTED,
          'The requested DOS device is not mapped to the ExOS system VDO.'
        );
      }

      node=jplopsoft_xshResolveC(ctx,path,false);

      if(!node||node.type!=='folder'){
        throw jplopsoft_xshError(
          jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
          'Directory not found.'
        );
      }

      ctx.currentDrive=String(spec.drive||'C').toUpperCase();
      ctx.currentDirectoryNodeId=node.root?0:node.id;
      if(ctx.currentDrive!=='C'&&jplopsoft_xshDosDeviceTable()[ctx.currentDrive]){
        var base=String(jplopsoft_xshDosDeviceTable()[ctx.currentDrive]),physical=jplopsoft_exfsFolderPath(ctx.currentDirectoryNodeId),rel=physical.toLowerCase().indexOf(base.toLowerCase())===0?physical.substring(base.length):'';
        ctx.currentDirectory=ctx.currentDrive+':'+(rel||'\\');
      }else ctx.currentDirectory=jplopsoft_exfsFolderPath(ctx.currentDirectoryNodeId);

      if(
        ctx.process&&
        ctx.process.peb&&
        ctx.process.peb.processParameters
      ){
        ctx.process.peb.processParameters.currentDirectory=
          ctx.currentDirectory;
      }

      return true;
    }
    if(method==='CreateFileMapping'){
      return await jplopsoft_xshCreateFileMappingWin32(ctx,args);
    }
    if(method==='OpenFileMapping'){
      return jplopsoft_xshOpenFileMappingWin32(ctx,args);
    }
    if(method==='MapViewOfFile'){
      return jplopsoft_xshMapViewOfFileWin32(ctx,args);
    }
    if(method==='UnmapViewOfFile'){
      r=jplopsoft_ntSectionUnmap(ctx.pid,args[0]);
      if(Number(r)!==Number(jplopsoft_STATUS_SUCCESS))throw jplopsoft_xshError(r,'UnmapViewOfFile failed.');
      return true;
    }
    if(method==='FlushViewOfFile'){
      return await jplopsoft_xshFlushMappedView(ctx,args[0],args[1]);
    }
    if(method==='ReadMappedView'){
      r=jplopsoft_ntSectionRead(ctx.pid,args[0],args[1],args[2]);
      return jplopsoft_xshObjectStatus(r,'ReadMappedView failed.');
    }
    if(method==='WriteMappedView'){
      r=jplopsoft_ntSectionWrite(ctx.pid,args[0],args[1],args[2]);
      return jplopsoft_xshObjectStatus(r,'WriteMappedView failed.');
    }
    if(method==='CreateJobObject'){
      r=jplopsoft_ntJobCreate(ctx.pid,args[0],args[1]);
      jplopsoft_xshObjectStatus(r,'CreateJobObject failed.');
      return r.handle;
    }
    if(method==='OpenJobObject'){
      r=jplopsoft_ntJobOpen(ctx.pid,args[0]);
      jplopsoft_xshObjectStatus(r,'OpenJobObject failed.');
      return r.handle;
    }
    if(method==='SetInformationJobObject'){
      r=jplopsoft_ntJobSetInformation(ctx.pid,args[0],args[1]);
      return jplopsoft_xshObjectStatus(r,'SetInformationJobObject failed.').job;
    }
    if(method==='AssignProcessToJobObject'){
      r=jplopsoft_ntJobAssignByHandle(ctx.pid,args[0],args[1]);
      jplopsoft_xshObjectStatus(r,'AssignProcessToJobObject failed.');
      return true;
    }
    if(method==='QueryInformationJobObject'){
      var job=jplopsoft_ntObjectFromHandle(ctx.pid,args[0],'JOB');
      if(!job)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid Job handle.');
      return jplopsoft_ntJobQuery(job);
    }
    if(method==='TerminateJobObject'){
      var termJob=jplopsoft_ntObjectFromHandle(ctx.pid,args[0],'JOB');
      if(!termJob)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid Job handle.');
      r=jplopsoft_ntTerminateJob(termJob,args[1],ctx.pid);
      if(Number(r)!==Number(jplopsoft_STATUS_SUCCESS))throw jplopsoft_xshError(r,'TerminateJobObject failed.');
      return true;
    }
    if(method==='CreateIoCompletionPort'){
      var existing=parseInt(args[1],10)||0,portObj,portHandle;
      if(existing){
        portObj=jplopsoft_ntObjectFromHandle(ctx.pid,existing,'IO_COMPLETION');
        if(!portObj)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid existing completion port.');
        portHandle=existing;
      }else{
        r=jplopsoft_ntIocpCreate(ctx.pid,'',args[3]);
        jplopsoft_xshObjectStatus(r,'CreateIoCompletionPort failed.');
        portHandle=r.handle;
      }
      jplopsoft_xshAssociateIocp(ctx,args[0],portHandle,args[2]);
      return portHandle;
    }
    if(method==='GetQueuedCompletionStatus'){
      r=await jplopsoft_ntIocpRemove(ctx.pid,args[0],args[1]);
      if(Number(r.status)===Number(jplopsoft_STATUS_TIMEOUT))return{ok:false,timeout:true,status:r.status,packet:null};
      return jplopsoft_xshObjectStatus(r,'GetQueuedCompletionStatus failed.');
    }
    if(method==='PostQueuedCompletionStatus'){
      var postPort=jplopsoft_ntObjectFromHandle(ctx.pid,args[0],'IO_COMPLETION');
      if(!postPort)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid completion port.');
      jplopsoft_ntIocpPost(postPort,{
        manual:true,
        bytesTransferred:parseInt(args[1],10)||0,
        completionKey:args[2],
        overlapped:args[3]||{},
        status:jplopsoft_STATUS_SUCCESS,
        statusName:'STATUS_SUCCESS'
      });
      return true;
    }
    if(method==='ReadFileAsync')return jplopsoft_xshScheduleAsyncRead(ctx,args[0],args[1],args[2],args[3]);
    if(method==='WriteFileAsync')return jplopsoft_xshScheduleAsyncWrite(ctx,args[0],args[1],args[2],args[3]);
    if(method==='CancelIoEx')return jplopsoft_xshCancelIo(ctx,args[0]);
    if(method==='VirtualAlloc')return jplopsoft_vmmVirtualAlloc(ctx.process,args[0],args[1],args[2],args[3]);
    if(method==='VirtualFree')return jplopsoft_vmmVirtualFree(ctx.process,args[0],args[1],args[2]);
    if(method==='VirtualProtect')return jplopsoft_vmmVirtualProtect(ctx.process,args[0],args[1],args[2]);
    if(method==='VirtualQuery')return jplopsoft_vmmVirtualQuery(ctx.process,args[0]);
    if(method==='ReadVirtualMemory'){
      var selfRead=jplopsoft_vmmRead(ctx.process,args[0],Math.max(0,Math.min(64*1024*1024,Math.floor(Number(args[1])||0))),true);
      return{address:Number(args[0])||0,bytesRead:selfRead.length,data:jplopsoft_xshBytesToArray(selfRead)};
    }
    if(method==='WriteVirtualMemory'){
      var selfData=args[1] instanceof Uint8Array?args[1]:(args[1] instanceof ArrayBuffer?new Uint8Array(args[1]):(Array.isArray(args[1])?new Uint8Array(args[1]):jplopsoft_ntUtf8Bytes(args[1])));
      return{address:Number(args[0])||0,bytesWritten:jplopsoft_vmmWrite(ctx.process,args[0],selfData,true)};
    }
    if(method==='GlobalMemoryStatusEx')return jplopsoft_vmmGlobalMemoryStatus(ctx.process);
    if(method==='QueryVmmStatistics')return jplopsoft_vmmGlobalStatus(ctx.process);
    if(method==='RegisterModule')return jplopsoft_vmmRegisterLoadedModule(ctx.process,args[0]);
    if(method==='OpenProcess')return jplopsoft_xshOpenProcess(ctx,args[0],args[1],args[2]);
    if(method==='GetProcessId'){var gp=jplopsoft_xshProcessFromOwnedHandle(ctx,args[0],0);return gp.process.pid;}
    if(method==='TerminateProcess'){var tp=jplopsoft_ntProcessHandleForOwner(ctx.pid,args[0]);if(!tp)return jplopsoft_STATUS_INVALID_HANDLE;return jplopsoft_NtTerminateProcess(args[0],args[1]);}
    if(method==='GetPriorityClass'){var gpc=jplopsoft_xshNtQueryInformationProcess(ctx,args[0],'ProcessBasePriority').information;return gpc>=15?0x100:gpc>=13?0x80:gpc>=10?0x8000:gpc>=8?0x20:gpc>=6?0x4000:0x40;}
    if(method==='SetPriorityClass'){var pc=Number(args[1])>>>0,bp=pc===0x100?15:pc===0x80?13:pc===0x8000?10:pc===0x4000?6:pc===0x40?4:8;jplopsoft_xshNtSetInformationProcess(ctx,args[0],'ProcessBasePriority',bp);return true;}
    if(method==='GetProcessAffinityMask'){var ga=jplopsoft_xshNtQueryInformationProcess(ctx,args[0],'ProcessAffinityMask').information;return{processMask:ga,systemMask:15};}
    if(method==='SetProcessAffinityMask'){jplopsoft_xshNtSetInformationProcess(ctx,args[0],'ProcessAffinityMask',args[1]);return true;}
    if(method==='QueryFullProcessImageName'){return jplopsoft_xshNtQueryInformationProcess(ctx,args[0],'ProcessImageFileName').information;}
    if(method==='ReadProcessMemory')return jplopsoft_xshReadProcessMemory(ctx,args[0],args[1],args[2]);
    if(method==='WriteProcessMemory')return jplopsoft_xshWriteProcessMemory(ctx,args[0],args[1],args[2]);
    if(method==='VirtualQueryEx')return jplopsoft_xshVirtualQueryEx(ctx,args[0],args[1]);
    if(method==='CreateProcess'){
      var cpSpec=args[2]&&typeof args[2]==='object'?args[2]:{},
          cpApp=String(args[0]||''),
          cpCmd=String(args[1]||''),
          cpOldCwd=ctx.currentDirectory,
          cpChildCtx,cpHandle,cpStartup=cpSpec.startupInfo||cpSpec.STARTUPINFO||{};
      if(cpSpec.currentDirectory){
        try{ctx.currentDirectory=String(cpSpec.currentDirectory);}catch(ignoreCpCwd){}
      }
      try{
        child=await jplopsoft_xshRunPath(ctx,cpApp,cpCmd);
      }finally{
        ctx.currentDirectory=cpOldCwd;
      }
      cpChildCtx=typeof jplopsoft_xshRunByPid==='function'?jplopsoft_xshRunByPid(child.pid):null;
      if(cpChildCtx&&cpSpec.environment&&typeof cpSpec.environment==='object'){
        var cpek;
        for(cpek in cpSpec.environment)if(cpSpec.environment.hasOwnProperty(cpek)){
          jplopsoft_SetEnvironmentVariable(cpChildCtx.process,cpek,cpSpec.environment[cpek]);
        }
      }
      if(
        cpChildCtx&&
        (cpSpec.inheritHandles||cpSpec.bInheritHandles)&&
        (Number(cpStartup.dwFlags)||0)&0x00000100
      ){
        var cppp=cpChildCtx.process&&cpChildCtx.process.peb?cpChildCtx.process.peb.processParameters:null,
            inheritFields=[
              ['standardInputHandle',cpStartup.hStdInput],
              ['standardOutputHandle',cpStartup.hStdOutput],
              ['standardErrorHandle',cpStartup.hStdError]
            ],
            cpi,cpsrc,cphNew;
        for(cpi=0;cpi<inheritFields.length;cpi++){
          cpsrc=jplopsoft_xshHandle(ctx,inheritFields[cpi][1]);
          if(cpsrc&&cppp){
            cphNew=jplopsoft_xshAllocateHandle(cpChildCtx,{
              kind:cpsrc.kind,
              path:cpsrc.path,
              access:cpsrc.access,
              position:Number(cpsrc.position)||0,
              nodeId:cpsrc.nodeId,
              pipe:cpsrc.pipe||null
            });
            cppp[inheritFields[cpi][0]]=cphNew;
          }else if(cppp&&[-10,-11,-12].indexOf(Number(inheritFields[cpi][1]))>=0){
            cppp[inheritFields[cpi][0]]=Number(inheritFields[cpi][1]);
          }
        }
      }
      cpHandle=jplopsoft_xshOpenProcess(
        ctx,
        jplopsoft_PROCESS_QUERY_INFORMATION|jplopsoft_PROCESS_QUERY_LIMITED_INFORMATION,
        false,
        child.pid
      );
      return{
        hProcess:cpHandle,
        hThread:0,
        dwProcessId:child.pid,
        dwThreadId:0,
        pid:child.pid,
        processId:child.pid
      };
    }
    if(method==='DeviceIoControl')return await jplopsoft_xshDeviceIoControl(ctx,args[0],args[1],args[2]);
    return await jplopsoft_ntcompatKernel32Dispatch(ctx,method,args);
  }

  if(api==='ntdll'){
    if(method==='NtCreateFile')return await jplopsoft_xshNtCreateFile(ctx,args[0],args[1],args[2],'');
    if(method==='NtReadFile')return await jplopsoft_xshNtReadFile(ctx,args[0],args[1],args[2],'');
    if(method==='NtWriteFile')return await jplopsoft_xshNtWriteFile(ctx,args[0],args[1],args[2],'');
    if(method==='NtClose')return jplopsoft_xshCloseHandle(ctx,args[0])?jplopsoft_STATUS_SUCCESS:jplopsoft_STATUS_INVALID_HANDLE;
    if(method==='NtQuerySystemInformation')return jplopsoft_NtQuerySystemInformation(String(args[0]||'SystemProcessInformation'));
    if(method==='NtQueryInformationProcess')return jplopsoft_xshNtQueryInformationProcess(ctx,args[0],args[1]);
    if(method==='NtSetInformationProcess')return jplopsoft_xshNtSetInformationProcess(ctx,args[0],args[1],args[2]);
    if(method==='NtDeviceIoControlFile')return await jplopsoft_xshDeviceIoControl(ctx,args[0],args[1],args[2]);
    if(method==='NtAllocateVirtualMemory'){
      try{return{status:jplopsoft_STATUS_SUCCESS,baseAddress:jplopsoft_vmmVirtualAlloc(ctx.process,args[0],args[1],args[2],args[3])};}
      catch(e){return{status:e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_INVALID_PARAMETER,baseAddress:0,reason:String(e&&e.message||e)};}
    }
    if(method==='NtFreeVirtualMemory'){
      try{return{status:jplopsoft_STATUS_SUCCESS,released:jplopsoft_vmmVirtualFree(ctx.process,args[0],args[1],args[2])};}
      catch(e){return{status:e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_INVALID_PARAMETER,released:0,reason:String(e&&e.message||e)};}
    }
    if(method==='NtProtectVirtualMemory'){
      try{return{status:jplopsoft_STATUS_SUCCESS,information:jplopsoft_vmmVirtualProtect(ctx.process,args[0],args[1],args[2])};}
      catch(e){return{status:e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_INVALID_PARAMETER,reason:String(e&&e.message||e)};}
    }
    if(method==='NtQueryVirtualMemory')return{status:jplopsoft_STATUS_SUCCESS,information:jplopsoft_vmmVirtualQuery(ctx.process,args[0])};
    if(method==='NtReadVirtualMemory'){
      try{var nativeRead=jplopsoft_vmmRead(ctx.process,args[0],Math.max(0,Math.min(64*1024*1024,Math.floor(Number(args[1])||0))),true);return{status:jplopsoft_STATUS_SUCCESS,bytesRead:nativeRead.length,data:jplopsoft_xshBytesToArray(nativeRead)};}
      catch(e){return{status:e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_PARTIAL_COPY,bytesRead:0,data:[],reason:String(e&&e.message||e)};}
    }
    if(method==='NtWriteVirtualMemory'){
      try{var nativeData=args[1] instanceof Uint8Array?args[1]:(args[1] instanceof ArrayBuffer?new Uint8Array(args[1]):(Array.isArray(args[1])?new Uint8Array(args[1]):jplopsoft_ntUtf8Bytes(args[1])));return{status:jplopsoft_STATUS_SUCCESS,bytesWritten:jplopsoft_vmmWrite(ctx.process,args[0],nativeData,true)};}
      catch(e){return{status:e&&e.ntstatus?e.ntstatus:jplopsoft_STATUS_PARTIAL_COPY,bytesWritten:0,reason:String(e&&e.message||e)};}
    }
    if(method==='NtCreateSection')return jplopsoft_ntSectionCreate(ctx.pid,args[0],args[1],args[2]);
    if(method==='NtOpenSection')return jplopsoft_ntSectionOpen(ctx.pid,args[0]);
    if(method==='NtMapViewOfSection')return jplopsoft_ntSectionMap(ctx.pid,args[0],args[1],args[2]);
    if(method==='NtUnmapViewOfSection')return jplopsoft_ntSectionUnmap(ctx.pid,args[0]);
    if(method==='NtQuerySection'){
      var section=jplopsoft_ntObjectFromHandle(ctx.pid,args[0],'SECTION');
      return section?{status:jplopsoft_STATUS_SUCCESS,section:jplopsoft_ntSectionQuery(section)}:{status:jplopsoft_STATUS_INVALID_HANDLE};
    }
    if(method==='NtReadSection')return jplopsoft_ntSectionRead(ctx.pid,args[0],args[1],args[2]);
    if(method==='NtWriteSection')return jplopsoft_ntSectionWrite(ctx.pid,args[0],args[1],args[2]);
    if(method==='NtCreateJobObject')return jplopsoft_ntJobCreate(ctx.pid,args[0],args[1]);
    if(method==='NtOpenJobObject')return jplopsoft_ntJobOpen(ctx.pid,args[0]);
    if(method==='NtAssignProcessToJobObject')return jplopsoft_ntJobAssignByHandle(ctx.pid,args[0],args[1]);
    if(method==='NtSetInformationJobObject')return jplopsoft_ntJobSetInformation(ctx.pid,args[0],args[1]);
    if(method==='NtQueryInformationJobObject'){
      var nativeJob=jplopsoft_ntObjectFromHandle(ctx.pid,args[0],'JOB');
      return nativeJob?{status:jplopsoft_STATUS_SUCCESS,job:jplopsoft_ntJobQuery(nativeJob)}:{status:jplopsoft_STATUS_INVALID_HANDLE};
    }
    if(method==='NtTerminateJobObject'){
      var nativeTermJob=jplopsoft_ntObjectFromHandle(ctx.pid,args[0],'JOB');
      return nativeTermJob?jplopsoft_ntTerminateJob(nativeTermJob,args[1],ctx.pid):jplopsoft_STATUS_INVALID_HANDLE;
    }
    if(method==='NtCreateIoCompletion')return jplopsoft_ntIocpCreate(ctx.pid,args[0],args[1]);
    if(method==='NtOpenIoCompletion')return jplopsoft_ntIocpOpen(ctx.pid,args[0]);
    if(method==='NtSetIoCompletion'){
      var nativePort=jplopsoft_ntObjectFromHandle(ctx.pid,args[0],'IO_COMPLETION');
      if(!nativePort)return{status:jplopsoft_STATUS_INVALID_HANDLE};
      jplopsoft_ntIocpPost(nativePort,{
        manual:true,
        completionKey:args[1],
        bytesTransferred:parseInt(args[2],10)||0,
        overlapped:args[3]||{},
        status:typeof args[4]==='undefined'?jplopsoft_STATUS_SUCCESS:Number(args[4])>>>0,
        statusName:jplopsoft_xshStatusName(typeof args[4]==='undefined'?jplopsoft_STATUS_SUCCESS:args[4])
      });
      return{status:jplopsoft_STATUS_SUCCESS};
    }
    if(method==='NtRemoveIoCompletion')return await jplopsoft_ntIocpRemove(ctx.pid,args[0],args[1]);
    if(method==='NtCreateUserProcess'){child=await jplopsoft_xshRunPath(ctx,String(args[0]||''),String(args[1]||''));return{status:jplopsoft_STATUS_SUCCESS,pid:child.pid};}
    if(method==='NtTerminateProcess'){
      var ownedProcessHandle=jplopsoft_ntProcessHandleForOwner(ctx.pid,args[0]);
      if(!ownedProcessHandle)return jplopsoft_STATUS_INVALID_HANDLE;
      return jplopsoft_NtTerminateProcess(args[0],args[1]);
    }
  }

  if(api==='user32'){
    if(method==='CreateWindow')return jplopsoft_xshCreateAppWindow(ctx,args[0]);
    if(method==='SetWindowText'){if(!jplopsoft_SetWindowText(parseInt(args[0],10)||0,String(args[1]||'')))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid HWND.');return true;}
    if(method==='ShowWindow'){return !!jplopsoft_ShowWindow(parseInt(args[0],10)||0,parseInt(args[1],10)||jplopsoft_SW_SHOW);}
    if(method==='DestroyWindow'){h=parseInt(args[0],10)||0;if(!ctx.windows[String(h)])throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'HWND is not owned by this XSH process.');delete ctx.windows[String(h)];return !!jplopsoft_DestroyWindow(h);}
    if(method==='LoadIcon')return jplopsoft_xshLoadIcon(ctx,args[0],args[1]);
    if(method==='GetIconInfo')return jplopsoft_xshGetIconInfo(ctx,args[0]);
    if(method==='EnumIconResources')return jplopsoft_xshEnumIconResources(ctx,args[0]);
    if(method==='SetWindowIcon')return jplopsoft_xshSetWindowIcon(ctx,args[0],args[1]);
    if(method==='CreateControl')return jplopsoft_xshCreateControl(ctx,args[0],args[1]);
    if(method==='SetControlText'){
      control=jplopsoft_xshControl(ctx,args[0]);
      if(!control)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Control not found.');
      var tagName=String(control.tagName||'').toLowerCase(),textValue=String(args[1]===undefined||args[1]===null?'':args[1]);
      if(control._jplopsoftGroupLegend)control._jplopsoftGroupLegend.textContent=textValue;
      else if(tagName==='input'||tagName==='textarea'||tagName==='select')control.value=textValue;
      else control.textContent=textValue;
      return true;
    }
    if(method==='GetControlText'){
      control=jplopsoft_xshControl(ctx,args[0]);
      if(!control)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Control not found.');
      var getTag=String(control.tagName||'').toLowerCase();
      if(control._jplopsoftGroupLegend)return String(control._jplopsoftGroupLegend.textContent||'');
      return getTag==='input'||getTag==='textarea'||getTag==='select'?String(control.value||''):String(control.textContent||'');
    }
    if(method==='AppendControlText')return jplopsoft_xshAppendControlText(ctx,args[0],args[1]);
    if(method==='SetControlProperty')return jplopsoft_xshSetControlProperty(ctx,args[0],args[1],args[2]);
    if(method==='GetControlProperty')return jplopsoft_xshGetControlProperty(ctx,args[0],args[1]);
    if(method==='GetControlRect'){
      control=jplopsoft_xshControl(ctx,args[0]);
      if(!control)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Control not found.');
      var rr=control.getBoundingClientRect(),hh=parseInt(control._jplopsoftXshHwnd,10)||0,ce=hh?jplopsoft_GetClientElement(hh):null,cr=ce&&ce.getBoundingClientRect?ce.getBoundingClientRect():{left:0,top:0};
      return{left:rr.left-cr.left,top:rr.top-cr.top,right:rr.right-cr.left,bottom:rr.bottom-cr.top,width:rr.width,height:rr.height};
    }
    if(method==='SetControlStyle')return jplopsoft_xshSetControlStyle(ctx,args[0],args[1]);
    if(method==='InsertControlText')return jplopsoft_xshInsertControlText(ctx,args[0],args[1]);
    if(method==='FocusControl')return jplopsoft_xshFocusControl(ctx,args[0]);
    if(method==='ClearControlChildren')return jplopsoft_xshClearControlChildren(ctx,args[0]);
    if(method==='PickImageDataUrl')return await jplopsoft_xshPickImageDataUrl(ctx);
    if(method==='PickFiles')return await jplopsoft_xshPickFiles(ctx,args[0]);
    if(method==='PromptBox')return jplopsoft_xshPromptBox(ctx,args[0],args[1],args[2]);
    if(method==='ConfirmBox')return jplopsoft_xshConfirmBox(ctx,args[0],args[1]);
    if(method==='MessageBox'){await jplopsoft_user32MessageBox(String(args[0]||''),String(args[1]||ctx.name));return 1;}
    if(method==='OpenClipboard')return jplopsoft_xshClipboardOpen(ctx);
    if(method==='CloseClipboard')return jplopsoft_xshClipboardClose(ctx);
    if(method==='EmptyClipboard'){jplopsoft_xshClipboardEnsureOwner(ctx);jplopsoft_XSH_CLIPBOARD.formats={};jplopsoft_XSH_CLIPBOARD.sequence++;return true;}
    if(method==='SetClipboardData')return await jplopsoft_xshClipboardSet(ctx,args[0],args[1]);
    if(method==='GetClipboardData')return await jplopsoft_xshClipboardGet(ctx,args[0],args[1]!==false);
    if(method==='IsClipboardFormatAvailable'){var cf=jplopsoft_xshClipboardFormat(args[0]);return !!(cf&&jplopsoft_XSH_CLIPBOARD.formats.hasOwnProperty(cf));}
    if(method==='EnumClipboardFormats')return Object.keys(jplopsoft_XSH_CLIPBOARD.formats).map(function(x){return parseInt(x,10)||0;});
    if(method==='RegisterClipboardFormat'){var nm=String(args[0]||'');for(var ck in jplopsoft_XSH_CLIPBOARD.names)if(jplopsoft_XSH_CLIPBOARD.names.hasOwnProperty(ck)&&jplopsoft_XSH_CLIPBOARD.names[ck]===nm)return parseInt(ck,10)||0;var id=jplopsoft_XSH_CLIPBOARD.nextCustom++;jplopsoft_XSH_CLIPBOARD.names[String(id)]=nm;return id;}
    if(method==='GetClipboardSequenceNumber')return jplopsoft_XSH_CLIPBOARD.sequence;
    if(method==='QueryClipboardCapabilities')return{browserClipboard:!!navigator.clipboard,secureContext:!!window.isSecureContext,clipboardItem:typeof ClipboardItem==='function',internalFallback:true,formats:['CF_TEXT','CF_UNICODETEXT','CF_BITMAP','CF_DIB','CF_RTF']};
    if(method==='PostMessage')return jplopsoft_xshPostMessage(ctx,{hwnd:args[0],message:args[1],wParam:args[2],lParam:args[3]});
    if(method==='PeekMessage')return jplopsoft_xshPeekMessage(ctx,args[0]!==false);
    if(method==='GetMessage')return await jplopsoft_xshGetMessage(ctx,args[0]);
    if(method==='DispatchMessage')return jplopsoft_xshDispatchMessage(ctx,args[0]);
    if(method==='InvalidateRect'){h=parseInt(args[0],10)||0;if(!ctx.windows[String(h)])throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'HWND is not owned by this XSH process.');if(typeof jplopsoft_gdi32Invalidate==='function')jplopsoft_gdi32Invalidate(ctx,h,args[1]||null);return jplopsoft_xshPostMessage(ctx,{hwnd:h,message:'WM_PAINT',wParam:args[2]?1:0,lParam:{rect:args[1]||null}});}
    if(method==='UpdateWindow'){h=parseInt(args[0],10)||0;if(!ctx.windows[String(h)])throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'HWND is not owned by this XSH process.');if(typeof jplopsoft_gdi32Invalidate==='function')jplopsoft_gdi32Invalidate(ctx,h,null);return jplopsoft_xshPostMessage(ctx,{hwnd:h,message:'WM_PAINT',wParam:0,lParam:{rect:null}});}
    if(method==='GetForegroundWindow')return jplopsoft_NT_SCHEDULER.foregroundHwnd||0;
    if(method==='SetForegroundWindow'){h=parseInt(args[0],10)||0;if(!ctx.windows[String(h)])throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'HWND is not owned by this XSH process.');return jplopsoft_user32BringToFront(h);}
    return await jplopsoft_ntcompatUser32Dispatch(ctx,method,args);
  }

  if(api==='ntoskrnl'){
    if(typeof jplopsoft_ntoskrnlDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_ntoskrnl.js semantic facade is not loaded.');
    return await jplopsoft_ntoskrnlDispatch(ctx,method,args);
  }

  if(api==='gdi32'){
    if(typeof jplopsoft_gdi32Dispatch!=='function'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_NOT_SUPPORTED,
        'exos_gdi32.js is not loaded.'
      );
    }
    return await jplopsoft_gdi32Dispatch(ctx,method,args);
  }

  if(api==='game2d'){
    if(typeof jplopsoft_2dgameDispatch!=='function'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_NOT_SUPPORTED,
        'exos_2dgame_sdk.js is not loaded.'
      );
    }
    return await jplopsoft_2dgameDispatch(ctx,method,args);
  }

  if(api==='d3d11'){
    if(typeof jplopsoft_d3d11Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_d3d11.js is not loaded.');
    return await jplopsoft_d3d11Dispatch(ctx,method,args);
  }

  if(api==='d3dx'){
    if(typeof jplopsoft_d3dxDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_d3dx.js is not loaded.');
    return await jplopsoft_d3dxDispatch(ctx,method,args);
  }

  if(api==='comctl32'){
    if(typeof jplopsoft_comctlDispatch!=='function'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_NOT_SUPPORTED,
        'exos_comctl32.js is not loaded.'
      );
    }

    return await jplopsoft_comctlDispatch(
      ctx,
      method,
      args
    );
  }

  if(api==='comdlg32'){
    if(typeof jplopsoft_comdlg32Dispatch!=='function'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_NOT_SUPPORTED,
        'exos_comdlg32.js is not loaded.'
      );
    }
    return await jplopsoft_comdlg32Dispatch(ctx,method,args);
  }

  if(api==='zipfldr'){
    if(typeof jplopsoft_zipfldrDispatch!=='function'){
      throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_zipfldr.js is not loaded.');
    }
    return await jplopsoft_zipfldrDispatch(ctx,method,args);
  }

  if(api==='shell32'){
    if(typeof jplopsoft_shell32Dispatch!=='function'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_NOT_SUPPORTED,
        'exos_shell32.js is not loaded.'
      );
    }

    return await jplopsoft_shell32Dispatch(
      ctx,
      method,
      args
    );
  }

  if(api==='uxtheme'){if(typeof jplopsoft_uxthemeDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_uxtheme.js is not loaded.');return await jplopsoft_uxthemeDispatch(ctx,method,args);}

  if(api==='dwmapi'){if(typeof jplopsoft_dwmapiDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_dwmapi.js is not loaded.');return await jplopsoft_dwmapiDispatch(ctx,method,args);}

  if(api==='winui'){if(typeof jplopsoft_winuiDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_winui.js is not loaded.');return await jplopsoft_winuiDispatch(ctx,method,args);}

  if(api==='advapi32'){
    if(typeof jplopsoft_advapi32Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_advapi32.js is not loaded.');
    return await jplopsoft_advapi32Dispatch(ctx,method,args);
  }

  if(api==='media'){
    if(typeof jplopsoft_mediaDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_media.js is not loaded.');
    return await jplopsoft_mediaDispatch(ctx,method,args);
  }

  if(api==='wininet'){if(typeof jplopsoft_wininetDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_wininet.js is not loaded.');return await jplopsoft_wininetDispatch(ctx,method,args);}
  if(api==='ws2_32'){if(typeof jplopsoft_ws2Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_ws2_32.js is not loaded.');return await jplopsoft_ws2Dispatch(ctx,method,args);}
  if(api==='ole32'){if(typeof jplopsoft_ole32Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_ole32.js is not loaded.');return await jplopsoft_ole32Dispatch(ctx,method,args);}
  if(api==='crypt32'){if(typeof jplopsoft_crypt32Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_crypt32.js is not loaded.');return await jplopsoft_crypt32Dispatch(ctx,method,args);}
  if(api==='bcrypt'){if(typeof jplopsoft_bcryptDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_crypt32.js is not loaded.');return await jplopsoft_bcryptDispatch(ctx,method,args);}
  if(api==='richedit'){if(typeof jplopsoft_richeditDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_richedit.js is not loaded.');return await jplopsoft_richeditDispatch(ctx,method,args);}
  if(api==='webview2'){if(typeof jplopsoft_webview2Dispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'exos_webview2.js is not loaded.');return await jplopsoft_webview2Dispatch(ctx,method,args);}

  if(api==='psapi'||api==='oleaut32'||api==='icmp'||api==='zlib'||api==='tapi32'||api==='urlmon'||api==='winmm'){
    return await jplopsoft_ntcompatMinorDispatch(ctx,api,method,args);
  }

  if(api==='exes'){
    if(method==='GetStatus')return{engine:'ExES V6',vaultUnlocked:!!state.vaultKey,systemVdo:jplopsoft_xshSystemVdoInfo()};
    if(method==='QuerySystemVdo')return jplopsoft_xshSystemVdoInfo();
    if(method==='QueryDiskInfo')return await jplopsoft_xshApiPromise('disk_info','GET',null);
    if(method==='QueryDosDevice'){var qdd=jplopsoft_xshQueryDosDevice(args[0]);if(String(args[0]||'').replace(':','').toUpperCase()==='C')return jplopsoft_xshSystemVdoInfo();return qdd;}
    if(method==='GetBackingStore')return{type:'PHP_VDO',path:'/_exfs/',entryPoint:'exos.php',hostDiskExposed:false,encryption:'ExES client-side'};
    if(method==='FlushSystemVdo')return true;
  }

  if(api==='io'){
    if(method==='GetIrpTrace'){var lim=Math.max(1,Math.min(120,parseInt(args[0],10)||30));return ctx.irpTrace.slice(-lim);}
    if(method==='ClearIrpTrace'){ctx.irpTrace=[];return true;}
    if(method==='GetDriverStack')return jplopsoft_xshDriverStackForPath(String(args[0]||'C:\\'));
    if(method==='GetVdoBridge')return{drive:'C:',device:'\\Device\\ExFSVdo0',backing:'PHP /_exfs/',bridge:'PhpExfsBridge.sys',hostDiskExposed:false};
  }

  if(api==='hal'&&method==='QueryCapabilities')return{emulated:true,hostHardwareExposed:false,ring0:false,dma:'virtual-vdo-copy',interrupts:'event-loop/PHP completion',architecture:'ExOS Browser HAL',systemVdo:'C: -> PHP /_exfs/'};

  if(api==='system'&&method==='QueryServiceAuthorization')return await jplopsoft_xshApiPromise('services_auth','GET',null);
  if(api==='system'&&method==='QueryServiceCore')return await jplopsoft_serviceCoreQuery();
  if(api==='system'&&method==='QueryServices'){
    var svc=await jplopsoft_xshApiPromise('services_status','GET',null);svc.core=await jplopsoft_serviceCoreQuery();return svc;
  }
  if(api==='system'&&method==='RunServiceNow')return await jplopsoft_serviceCoreCommand('run',args[0]);
  if(api==='system'&&method==='ControlService')return await jplopsoft_serviceCoreCommand(args[1],args[0]);
  if(api==='system'&&method==='ServiceExecuteTask'){
    if(String(ctx.builtinAppId||'')!=='services')throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Only services.xsh may execute backend service tasks.');
    return await jplopsoft_xshApiPromise('service_execute','POST',{name:String(args[0]||'')});
  }
  if(api==='system'&&method==='ServiceControlBackend'){
    if(String(ctx.builtinAppId||'')!=='services')throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Only services.xsh may control backend service state.');
    return await jplopsoft_xshApiPromise('service_control','POST',{name:String(args[0]||''),action:String(args[1]||'')});
  }

  if(api==='system'&&method==='UploadPickedFile'){
    return await jplopsoft_xshUploadPickedFile(
      ctx,
      args[0],
      args[1]
    );
  }

  if(api==='system'&&method==='ReleasePickedFile'){
    return jplopsoft_xshReleasePickedFile(
      ctx,
      args[0]
    );
  }

  if(api==='system'&&method==='QueryLocalAccounts')return await jplopsoft_xshSystemQueryLocalAccounts(ctx);
  if(api==='system'&&method==='CreateLocalAccount')return await jplopsoft_xshSystemCreateLocalAccount(ctx,args[0]);
  if(api==='system'&&method==='ResetLocalAccountPassword')return await jplopsoft_xshSystemResetLocalAccountPassword(ctx,args[0],args[1]);
  if(api==='system'&&method==='SetLocalAccountEnabled')return await jplopsoft_xshSystemSetLocalAccountEnabled(ctx,args[0],args[1]);
  if(api==='system'&&method==='SetLocalAccountType')return await jplopsoft_xshSystemSetLocalAccountType(ctx,args[0],args[1]);
  if(api==='system'&&method==='SetLocalAccountProfile')return await jplopsoft_xshSystemSetLocalAccountProfile(ctx,args[0],args[1]);
  if(api==='system'&&method==='DeleteLocalAccount')return await jplopsoft_xshSystemDeleteLocalAccount(ctx,args[0]);
  if(api==='system'&&method==='QueryEvents')return await jplopsoft_xshSystemQueryEvents(ctx,args[0]);
  if(api==='system'&&method==='QueryEventLogInfo')return await jplopsoft_xshSystemQueryEventLogInfo(ctx);

  if(api==='system'&&method==='QuerySystemConfig'){
    return await jplopsoft_xshApiPromise(
      'system_config',
      'GET',
      null
    );
  }

  if(api==='process'&&method==='ExitProcess'){code=parseInt(args[0],10)||0;window.setTimeout(function(){jplopsoft_xshTerminate(ctx,code,'ExitProcess',false);},0);return true;}

  throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'XSH API not supported: '+api+'.'+method);
}

async function jplopsoft_xshDeviceIoControl(ctx,handle,code,input){var h=jplopsoft_xshHandle(ctx,handle),c=String(code||'').toUpperCase();if(!h||h.kind!=='exes-device')throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'DeviceIoControl requires a handle to \\.\Exes.');if(c==='IOCTL_EXES_QUERY_SYSTEM_VDO')return jplopsoft_xshSystemVdoInfo();if(c==='IOCTL_EXES_QUERY_BACKING_STORE')return{type:'PHP_VDO',path:'/_exfs/',entryPoint:'exos.php',hostDiskExposed:false};if(c==='IOCTL_EXES_FLUSH_SYSTEM_VDO')return true;throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Unknown EXES IOCTL.');}

async function jplopsoft_xshRunPath(parentCtx,path,argLine){
  var app=jplopsoft_xshBuiltinManifestByPath(path),
      node;

  if(app){
    return await jplopsoft_runBuiltinXsh(
      app.id,
      jplopsoft_xshBuildArgv(argLine),
      parentCtx
    );
  }

  node=jplopsoft_xshResolveC(
    parentCtx,
    path,
    false
  );

  if(
    !node||
    node.type!=='file'||
    jplopsoft_fileFormatFromName(
      jplopsoft_decName(node)||''
    )!=='xsh'
  ){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'CreateProcess accepts an ExFS .xsh executable or C:\\ExOS\\SystemApps\\*.xsh.'
    );
  }

  return await jplopsoft_runXshNode(
    node.id,
    argLine,
    parentCtx.process
  );
}

function jplopsoft_xshBuildArgv(argLine){
  var s=String(argLine||'').trim(),out=[],m,re=/"([^"]*)"|'([^']*)'|([^\s]+)/g;
  while((m=re.exec(s))!==null)out.push(m[1]!==undefined?m[1]:(m[2]!==undefined?m[2]:m[3]));
  return out;
}

function jplopsoft_xshBuiltinManifest(appId){var root=window.jplopsoft_EXOS_XSH_APPS,apps=root&&root.apps?root.apps:null;return apps?apps[String(appId||'')]||null:null;}

function jplopsoft_xshBuiltinManifestByFileName(fileName){
  var root=window.jplopsoft_EXOS_XSH_APPS,
      apps=root&&root.apps?root.apps:null,
      k,a,want=String(fileName||'').toLowerCase();

  if(!apps||!want)return null;

  for(k in apps){
    if(!apps.hasOwnProperty(k))continue;
    a=apps[k];

    if(
      a&&
      String(a.fileName||'').toLowerCase()===want
    ){
      return a;
    }
  }

  return null;
}

function jplopsoft_xshBuiltinManifestByPath(path){
  var p=jplopsoft_xshNormalizeSlashes(path),
      m=/^C:\\ExOS\\SystemApps\\([^\\]+\.xsh)$/i.exec(p);

  return m
    ?jplopsoft_xshBuiltinManifestByFileName(m[1])
    :null;
}

function jplopsoft_xshBuiltinContexts(appId){
  var out=[],k,c;

  appId=String(appId||'');

  for(k in jplopsoft_XSH.runs){
    if(!jplopsoft_XSH.runs.hasOwnProperty(k))continue;
    c=jplopsoft_XSH.runs[k];

    if(
      c&&
      !c.terminating&&
      String(c.builtinAppId||'')===appId
    ){
      out.push(c);
    }
  }

  out.sort(function(a,b){
    return (parseInt(a.runId,10)||0)-(parseInt(b.runId,10)||0);
  });

  return out;
}

function jplopsoft_xshLatestBuiltin(appId){
  var a=jplopsoft_xshBuiltinContexts(appId);
  return a.length?a[a.length-1]:null;
}

function jplopsoft_xshHasBuiltin(appId){
  return jplopsoft_xshBuiltinContexts(appId).length>0;
}

function jplopsoft_xshBuiltinArgv(app,args){var a=[String(app.fileName||((app.id||'app')+'.xsh'))],i,list=args||[];for(i=0;i<list.length;i++)a.push(String(list[i]));return a;}
async function jplopsoft_runBuiltinXsh(appId,args,parentCtx,launchOptions){
  var app=jplopsoft_xshBuiltinManifest(appId),
      existing,parent,proc,runId,ctx,imagePath,k,rec,image,
      cwdNode=0,cwd='C:\\',
      launchIntegrity='MEDIUM',launchProtection='Sandbox';

  launchOptions=launchOptions||{};
  launchIntegrity=String(launchOptions.integrity||'MEDIUM').toUpperCase();
  if(['LOW','MEDIUM','HIGH','SYSTEM'].indexOf(launchIntegrity)<0)launchIntegrity='MEDIUM';
  launchProtection=String(launchOptions.protection||(launchIntegrity==='LOW'?'Sandbox+Restricted':'Sandbox'));

  if(!app){
    throw new Error(
      'Built-in XSH app is unavailable: '+String(appId)
    );
  }

  if(!jplopsoft_v8EngineSupported()){
    jplopsoft_requireV8Browser();
    throw new Error('XSH requires a V8 browser.');
  }

  if(!state.samAuthenticated||!state.vaultKey){
    throw new Error('Please log on to ExOS first.');
  }

  if(app.singleInstance){
    existing=jplopsoft_XSH.builtinByApp[String(appId)];

    if(existing&&!existing.terminating){
      for(k in existing.windows){
        if(!existing.windows.hasOwnProperty(k))continue;
        rec=jplopsoft_user32GetRecord(parseInt(k,10)||0);

        if(rec){
          jplopsoft_ShowWindow(
            rec.hwnd,
            jplopsoft_SW_RESTORE
          );
          jplopsoft_user32BringToFront(rec.hwnd);
          return existing;
        }
      }
    }
  }

  if(
    parentCtx&&
    parentCtx.process&&
    parentCtx.process.alive
  ){
    parent=parentCtx.process;
    cwdNode=parseInt(parentCtx.currentDirectoryNodeId,10)||0;
    cwd=String(parentCtx.currentDirectory||'C:\\');
  }else{
    parent=
      jplopsoft_ntKernelAliveByKey('proc:explorer')||
      jplopsoft_ntEnsureExplorerProcess();
  }

  runId=++jplopsoft_XSH.runSeq;

  imagePath=
    'C:\\ExOS\\SystemApps\\'+
    String(app.fileName||appId+'.xsh');

  image=jplopsoft_xshParseImage(
    String(app.source||''),
    imagePath
  );

  proc=jplopsoft_CreateProcess(
    'xshhost.exe',
    '"'+imagePath+'" '+(args||[]).join(' '),
    parent?parent.pid:0,
    {
      key:'proc:xsh:'+runId,
      imageName:(launchOptions.systemProcess&&launchOptions.imageName)?String(launchOptions.imageName):'xshhost.exe',
      runtimeHostImage:'xshhost.exe',
      imageFormat:image.format,
      imageMachine:image.machine,
      imageSubsystem:image.subsystem,
      imageSubsystemName:image.subsystemName,
      description:String(
        app.description||
        ('XSH System App: '+appId)
      ),
      parentProcess:parent||null,
      sessionId:(typeof launchOptions.sessionId!=='undefined'&&!isNaN(parseInt(launchOptions.sessionId,10)))?Math.max(0,parseInt(launchOptions.sessionId,10)):1,
      username:(typeof launchOptions.username!=='undefined')?String(launchOptions.username):String(state.samUsername||'administrator'),
      sid:(typeof launchOptions.sid!=='undefined')?String(launchOptions.sid):String(state.samSid||''),
      /*
       * os69:
       * Built-in SystemApps are compiled into the trusted ExOS package.
       * They are not ExFS nodes and therefore have no Zone.Identifier/MOTW.
       */
      integrity:launchIntegrity,
      protection:launchProtection,
      critical:!!launchOptions.critical,
      systemProcess:!!launchOptions.systemProcess,
      imagePathName:imagePath,
      currentDirectoryNodeId:cwdNode,
      currentDirectory:cwd,
      logicalThreads:2,
      accountedMemoryBytes:Math.max(
        262144,
        String(image.code||'').length*2+131072
      )
    }
  );

  if(!proc)throw new Error('CreateProcess failed.');

  var inheritJob=jplopsoft_ntJobInherit(parent,proc);

  if(!inheritJob.ok){
    proc.alive=false;
    proc.exitTime=jplopsoft_ntKernelNow();
    proc.exitStatus=inheritJob.status;
    delete jplopsoft_NT_KERNEL.processByPid[String(proc.pid)];

    throw jplopsoft_xshError(
      inheritJob.status,
      inheritJob.reason||
      'Parent Job quota rejected CreateProcess.'
    );
  }

  ctx={
    runId:runId,
    pid:proc.pid,
    ppid:proc.ppid,
    process:proc,
    parentProcess:parent,
    nodeId:0,
    name:String(app.title||app.fileName||appId),
    imagePath:imagePath,
    image:image,
    markOfTheWeb:false,
    zoneId:0,
    subsystem:image.subsystem,
    subsystemName:image.subsystemName,
    source:String(image.code||''),
    argv:jplopsoft_xshBuiltinArgv(app,args),
    currentDrive:'C',
    currentDirectoryNodeId:cwdNode,
    currentDirectory:cwd,
    appId:'xsh_'+proc.pid,
    hostHwnd:0,
    windowSeq:0,
    controlSeq:0,
    nextHandle:0x100,
    nextLocalFile:1,
    localFiles:{},
    handles:{},
    asyncIrps:{},
    windows:{},
    controls:{},
    commonControls:{},
    imageLists:{},
    messageQueue:[],
    messageWaiters:[],
    eventQueue:[],
    messageDrainScheduled:false,
    explicitMessageLoop:false,
    suspended:false,
    suspendReason:'',
    suspendedRpcQueue:[],
    suspendedRafIds:[],
    animationFrames:{},
    irpTrace:[],
    port:null,
    frame:null,
    bootstrapTimer:0,
    terminating:false,
    showHost:false,
    autoExitOnLastWindow:
      image.subsystem===jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_GUI,
    icon:String(app.icon||image.icon||'xsh'),
    builtinAppId:String(appId),
    consoleId:0
  };

  jplopsoft_XSH.runs[String(runId)]=ctx;
  jplopsoft_XSH.byPid[String(proc.pid)]=ctx;

  if(app.singleInstance){
    jplopsoft_XSH.builtinByApp[String(appId)]=ctx;
  }

  if(
    image.subsystem===
    jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI
  ){
    jplopsoft_xshConsoleAttachAutomatic(
      ctx,
      parentCtx||null
    );
  }

  jplopsoft_xshAttachSandbox(ctx);
  return ctx;
}
function jplopsoft_launchSystemXshApp(appId,args,launchOptions){
  var name=String(appId||'').toLowerCase();

  /* System applications are launched as xshhost.exe + real .xsh images. */
  jplopsoft_runBuiltinXsh(appId,args||[],null,launchOptions||{}).catch(function(e){
    jplopsoft_user32MessageBox('XSH app 啟動失敗：'+String(e&&e.message?e.message:e));
  });
}

async function jplopsoft_runXshNode(id,argLine,parentProcess){
  var n=jplopsoft_resolveClientNode(id),
      name,bytes,source,parent,proc,runId,ctx,image,parentCtx;

  if(!jplopsoft_v8EngineSupported()){
    jplopsoft_requireV8Browser();
    throw new Error('XSH requires a V8 browser.');
  }

  if(!state.samAuthenticated||!state.vaultKey){
    throw new Error('Please log on to ExOS first.');
  }

  if(!n||n.type!=='file'){
    throw new Error('XSH executable not found.');
  }

  name=jplopsoft_decName(n)||('program-'+n.id+'.xsh');

  if(jplopsoft_fileFormatFromName(name)!=='xsh'){
    throw new Error('Only .xsh can be executed by XSH sandbox.');
  }

  if(
    jplopsoft_nodeIsLargeFile(n)||
    (parseInt(n.original_size,10)||0)>jplopsoft_XSH.maxSourceBytes
  ){
    throw new Error(
      '.xsh exceeds the 2 MiB executable-source limit.'
    );
  }

  bytes=await jplopsoft_xshReadNodeBytes(n,'IMAGE_LOAD');
  source=jplopsoft_xshUtf8Decode(bytes);

  image=jplopsoft_xshParseImage(
    source,
    jplopsoft_exfsNodeFullPath(n)
  );

  parent=
    parentProcess||
    jplopsoft_ntKernelAliveByKey('proc:explorer')||
    jplopsoft_ntEnsureExplorerProcess();

  parentCtx=parent
    ?jplopsoft_xshRunByPid(parent.pid)
    :null;

  runId=++jplopsoft_XSH.runSeq;

  proc=jplopsoft_CreateProcess(
    'xshhost.exe',
    '"'+jplopsoft_exfsNodeFullPath(n)+'" '+String(argLine||''),
    parent?parent.pid:0,
    {
      key:'proc:xsh:'+runId,
      imageName:'xshhost.exe',
      runtimeHostImage:'xshhost.exe',
      imageFormat:image.format,
      imageMachine:image.machine,
      imageSubsystem:image.subsystem,
      imageSubsystemName:image.subsystemName,
      description:'XSH Image: '+name,
      parentProcess:parent||null,
      sessionId:1,
      username:String(state.samUsername||'administrator'),
      sid:String(state.samSid||''),
      /*
       * os69:
       * External ExFS XSH images retain Mark-of-the-Web semantics.
       * The kernel loader may inspect the image with IMAGE_LOAD, but a
       * Zone.Identifier-marked image is created as a Low Integrity XSH host.
       */
      integrity:n.has_motw?'LOW':'MEDIUM',
      protection:n.has_motw?'Sandbox+MOTW':'Sandbox',
      critical:false,
      systemProcess:false,
      imagePathName:jplopsoft_exfsNodeFullPath(n),
      currentDirectoryNodeId:parseInt(n.parent_id,10)||0,
      currentDirectory:jplopsoft_exfsFolderPath(
        parseInt(n.parent_id,10)||0
      ),
      logicalThreads:2,
      accountedMemoryBytes:Math.max(
        262144,
        String(image.code||'').length*2+131072
      )
    }
  );

  if(!proc)throw new Error('CreateProcess failed.');

  var inheritJob=jplopsoft_ntJobInherit(parent,proc);

  if(!inheritJob.ok){
    proc.alive=false;
    proc.exitTime=jplopsoft_ntKernelNow();
    proc.exitStatus=inheritJob.status;
    delete jplopsoft_NT_KERNEL.processByPid[String(proc.pid)];

    throw jplopsoft_xshError(
      inheritJob.status,
      inheritJob.reason||
      'Parent Job quota rejected CreateProcess.'
    );
  }

  ctx={
    runId:runId,
    pid:proc.pid,
    ppid:proc.ppid,
    process:proc,
    parentProcess:parent,
    nodeId:n.id,
    name:name,
    imagePath:jplopsoft_exfsNodeFullPath(n),
    image:image,
    markOfTheWeb:!!n.has_motw,
    zoneId:n.has_motw?3:0,
    subsystem:image.subsystem,
    subsystemName:image.subsystemName,
    source:String(image.code||''),
    argv:[name].concat(jplopsoft_xshBuildArgv(argLine)),
    currentDrive:'C',
    currentDirectoryNodeId:parseInt(n.parent_id,10)||0,
    currentDirectory:jplopsoft_exfsFolderPath(
      parseInt(n.parent_id,10)||0
    ),
    appId:'xsh_'+proc.pid,
    hostHwnd:0,
    windowSeq:0,
    controlSeq:0,
    nextHandle:0x100,
    nextLocalFile:1,
    localFiles:{},
    handles:{},
    asyncIrps:{},
    windows:{},
    controls:{},
    commonControls:{},
    imageLists:{},
    messageQueue:[],
    messageWaiters:[],
    eventQueue:[],
    messageDrainScheduled:false,
    explicitMessageLoop:false,
    suspended:false,
    suspendReason:'',
    suspendedRpcQueue:[],
    suspendedRafIds:[],
    animationFrames:{},
    irpTrace:[],
    port:null,
    frame:null,
    bootstrapTimer:0,
    terminating:false,
    showHost:false,
    autoExitOnLastWindow:
      image.subsystem===jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_GUI,
    icon:String(image.icon||'xsh'),
    builtinAppId:'',
    consoleId:0
  };

  jplopsoft_XSH.runs[String(runId)]=ctx;
  jplopsoft_XSH.byPid[String(proc.pid)]=ctx;

  if(
    image.subsystem===
    jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI
  ){
    jplopsoft_xshConsoleAttachAutomatic(
      ctx,
      parentCtx
    );
  }

  jplopsoft_xshAttachSandbox(ctx);
  return ctx;
}


function jplopsoft_runXshNodeSafe(id,argLine,parentProcess,origin){
  origin=String(origin||'Shell');

  return jplopsoft_runXshNode(
    id,
    argLine,
    parentProcess
  ).catch(function(e){
    var n=jplopsoft_resolveClientNode(id),
        name=n?String(jplopsoft_decName(n)||''):'';

    try{
      jplopsoft_user32MessageBox(
        'XSH 啟動失敗'+
        (name?'：'+name:'')+
        '\n\n'+
        String(e&&e.message?e.message:e)+
        '\n\n來源：'+origin
      );
    }catch(ignoreXshLaunchMessage){}

    try{
      console.error(
        '[ExOS XSH launch failure]',
        origin,
        name,
        e
      );
    }catch(ignoreXshLaunchConsole){}

    return null;
  });
}

function jplopsoft_xshRequestAnimationFrame(ctx,id){
  id=parseInt(id,10)||0;
  if(!ctx||ctx.terminating||!ctx.port||!id)return false;
  if(ctx.suspended){if(!ctx.suspendedRafIds)ctx.suspendedRafIds=[];if(ctx.suspendedRafIds.indexOf(id)<0)ctx.suspendedRafIds.push(id);return true;}
  if(!ctx.animationFrames)ctx.animationFrames={};
  if(ctx.animationFrames[String(id)])return true;
  ctx.animationFrames[String(id)]=window.requestAnimationFrame(function(ts){
    if(!ctx||ctx.terminating)return;
    delete ctx.animationFrames[String(id)];
    try{if(ctx.port)ctx.port.postMessage({type:'raf-fire',id:id,time:Number(ts)||0});}catch(ignoreRafPost){}
  });
  return true;
}
function jplopsoft_xshCancelAnimationFrame(ctx,id){
  id=parseInt(id,10)||0;
  if(!ctx||!ctx.animationFrames||!id)return false;
  var h=ctx.animationFrames[String(id)];
  if(!h)return false;
  try{window.cancelAnimationFrame(h);}catch(ignoreRafCancel){}
  delete ctx.animationFrames[String(id)];
  return true;
}
function jplopsoft_xshCancelAllAnimationFrames(ctx){
  if(!ctx||!ctx.animationFrames)return;
  var k;
  for(k in ctx.animationFrames)if(ctx.animationFrames.hasOwnProperty(k)){
    try{window.cancelAnimationFrame(ctx.animationFrames[k]);}catch(ignoreRafCancelAll){}
  }
  ctx.animationFrames={};
}

function jplopsoft_xshOnSandboxMessage(ctx,m){
  if(!ctx||ctx.terminating)return;
  if(m.type==='ready'){
    var env=
      ctx.process&&
      ctx.process.peb&&
      ctx.process.peb.processParameters
        ?ctx.process.peb.processParameters.environment
        :{};

    if(ctx.bootstrapTimer){
      try{
        window.clearTimeout(ctx.bootstrapTimer);
      }catch(ignoreXshReadyTimer){}
      ctx.bootstrapTimer=0;
    }

    ctx.port.postMessage({
      type:'run',
      source:ctx.source,
      meta:{
        pid:ctx.pid,
        ppid:ctx.ppid,
        argv:ctx.argv,
        env:jplopsoft_ntCloneEnvironment(env),
        imagePath:ctx.imagePath,
        cwd:ctx.currentDirectory,
        jobObjectName:ctx.process?String(ctx.process.jobObjectName||''):'',
        accountedMemoryBytes:ctx.process
          ?(
            (parseInt(ctx.process.accountedMemoryBytes,10)||0)+
            (parseInt(ctx.process.sectionViewBytes,10)||0)
          )
          :0,
        subsystem:parseInt(ctx.subsystem,10)||0,
        subsystemName:String(ctx.subsystemName||''),
        consoleAttached:!!jplopsoft_xshConsoleForProcess(ctx),
        peHeader:jplopsoft_xshPeHeaderForProcess(ctx.image)
      }
    });

    ctx.source='';
    jplopsoft_xshSetStatus(ctx,'Running ｜ PID '+ctx.pid);
    return;
  }
  if(m.type==='raf-request'){jplopsoft_xshRequestAnimationFrame(ctx,m.id);return;}
  if(m.type==='raf-cancel'){jplopsoft_xshCancelAnimationFrame(ctx,m.id);return;}
  if(m.type==='stdout'){
    var a=m.args||[],parts=[],i;
    for(i=0;i<a.length;i++){
      try{
        parts.push(
          typeof a[i]==='string'
            ?a[i]
            :JSON.stringify(a[i])
        );
      }catch(e){
        parts.push(String(a[i]));
      }
    }

    if(
      ctx.subsystem===
      jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI&&
      jplopsoft_xshConsoleForProcess(ctx)
    ){
      jplopsoft_xshConsoleWrite(
        ctx,
        parts.join(' ')+'\r\n',
        m.level==='error'?'stderr':'stdout'
      );
    }else{
      jplopsoft_xshAppendConsole(
        ctx,
        parts.join(' '),
        m.level||'log'
      );
    }

    return;
  }
  if(m.type==='rpc'){
    if(ctx.suspended){if(!ctx.suspendedRpcQueue)ctx.suspendedRpcQueue=[];if(ctx.suspendedRpcQueue.length<2048)ctx.suspendedRpcQueue.push(m);return;}
    Promise.resolve().then(function(){return jplopsoft_xshDispatch(ctx,m.api,m.method,m.args);}).then(function(result){
      if(!ctx.port)return;
      try{ctx.port.postMessage({type:'rpc-result',id:m.id,ok:true,result:result});}
      catch(cloneErr){ctx.port.postMessage({type:'rpc-result',id:m.id,ok:false,error:jplopsoft_xshRpcError(new Error('XSH RPC result is not structured-clone safe: '+String(cloneErr&&cloneErr.message?cloneErr.message:cloneErr)))});}
    }).catch(function(e){if(ctx.port)ctx.port.postMessage({type:'rpc-result',id:m.id,ok:false,error:jplopsoft_xshRpcError(e)});});return;
  }
  if(m.type==='main-complete'){
    if(
      ctx.subsystem===
      jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI
    ){
      window.setTimeout(function(){
        jplopsoft_xshTerminate(
          ctx,
          0,
          'CuiMainReturn',
          false
        );
      },0);
      return;
    }

    jplopsoft_xshAppendConsole(
      ctx,
      '[GUI main completed; process remains available for USER32/message callbacks]',
      'info'
    );
    jplopsoft_xshSetStatus(
      ctx,
      'GUI message loop ｜ PID '+ctx.pid
    );
    return;
  }
  if(m.type==='runtime-error'){
    var runtimeText=
      String(m.message||'Runtime error')+
      '\r\n'+
      String(m.stack||'');

    if(
      ctx.subsystem===
      jplopsoft_IMAGE_SUBSYSTEM_WINDOWS_CUI&&
      jplopsoft_xshConsoleForProcess(ctx)
    ){
      jplopsoft_xshConsoleWrite(
        ctx,
        runtimeText+'\r\n',
        'stderr'
      );
    }else{
      window.setTimeout(function(){
        try{
          jplopsoft_user32MessageBox(
            'XSH GUI runtime error：'+
            String(m.message||'Runtime error')
          );
        }catch(ignoreXshRuntimeAlert){}
      },0);
    }

    jplopsoft_xshSetStatus(
      ctx,
      'Runtime error ｜ PID '+ctx.pid
    );
  }
}

async function jplopsoft_xshTerminate(ctx,exitCode,reason,skipKernel){
  var k,p;
  if(!ctx||ctx.terminating)return false;
  ctx.terminating=true;

  if(ctx.bootstrapTimer){
    try{
      window.clearTimeout(ctx.bootstrapTimer);
    }catch(ignoreXshTerminateBootTimer){}
    ctx.bootstrapTimer=0;
  }
  jplopsoft_xshCancelAllAnimationFrames(ctx);
  try{if(ctx.port)ctx.port.close();}catch(ignorePort){}ctx.port=null;
  try{if(ctx.frame&&ctx.frame.parentNode)ctx.frame.parentNode.removeChild(ctx.frame);}catch(ignoreFrame){}ctx.frame=null;
  for(k in ctx.asyncIrps){
    if(ctx.asyncIrps.hasOwnProperty(k)&&ctx.asyncIrps[k])ctx.asyncIrps[k].cancelled=true;
  }
  ctx.asyncIrps={};
  jplopsoft_xshConsoleCancelReads(ctx);
  if(typeof jplopsoft_zipfldrCleanup==='function'){try{jplopsoft_zipfldrCleanup(ctx);}catch(ignoreZipFldrCleanup){}}
  if(typeof jplopsoft_wininetCleanup==='function'){try{jplopsoft_wininetCleanup(ctx);}catch(ignoreWininetCleanup){}}
  if(typeof jplopsoft_ws2Cleanup==='function'){try{jplopsoft_ws2Cleanup(ctx);}catch(ignoreWs2Cleanup){}}
  if(typeof jplopsoft_ntoskrnlCleanupContext==='function'){try{jplopsoft_ntoskrnlCleanupContext(ctx);}catch(ignoreNtCompatCleanup){}}
  if(typeof jplopsoft_ole32Cleanup==='function'){try{jplopsoft_ole32Cleanup(ctx);}catch(ignoreOleCleanup){}}
  if(typeof jplopsoft_shell32CleanupContext==='function'){try{jplopsoft_shell32CleanupContext(ctx);}catch(ignoreShellCleanup){}}
  if(typeof jplopsoft_webview2Cleanup==='function'){try{jplopsoft_webview2Cleanup(ctx);}catch(ignoreWebViewCleanup){}}
  jplopsoft_xshClipboardClose(ctx);
  if(typeof jplopsoft_comdlg32CleanupContext==='function'){
    try{jplopsoft_comdlg32CleanupContext(ctx);}catch(ignoreComdlgCleanup){}
  }
  if(typeof jplopsoft_gdi32CleanupContext==='function'){
    try{jplopsoft_gdi32CleanupContext(ctx);}catch(ignoreGdiCleanup){}
  }
  if(typeof jplopsoft_2dgameCleanupProcess==='function'){
    try{jplopsoft_2dgameCleanupProcess(ctx.pid);}catch(ignoreGame2dCleanup){}
  }
  if(typeof jplopsoft_d3d11CleanupContext==='function'){
    try{jplopsoft_d3d11CleanupContext(ctx);}catch(ignoreD3dCleanup){}
  }
  if(typeof jplopsoft_d3dxCleanupContext==='function'){
    try{jplopsoft_d3dxCleanupContext(ctx);}catch(ignoreD3dxCleanup){}
  }
  if(typeof jplopsoft_advapi32CleanupContext==='function'){
    try{jplopsoft_advapi32CleanupContext(ctx);}catch(ignoreAdvapiCleanup){}
  }
  if(typeof jplopsoft_mediaCleanup==='function'){
    try{jplopsoft_mediaCleanup(ctx);}catch(ignoreMediaCleanup){}
  }
  if(typeof jplopsoft_NTCOMPAT_OS83!=='undefined'){
    try{
      if(jplopsoft_NTCOMPAT_OS83.capture&&Number(jplopsoft_NTCOMPAT_OS83.capture.pid)===Number(ctx.pid))jplopsoft_NTCOMPAT_OS83.capture=null;
      var hkClean=jplopsoft_NTCOMPAT_OS83.hotkeys,hkName;
      for(hkName in hkClean)if(hkClean.hasOwnProperty(hkName)&&hkClean[hkName]&&Number(hkClean[hkName].pid)===Number(ctx.pid))delete hkClean[hkName];
    }catch(ignoreNtCompatCleanup){}
  }
  for(k in ctx.handles)if(ctx.handles.hasOwnProperty(k))delete ctx.handles[k];
  for(k in jplopsoft_NT_KERNEL.processHandles){
    if(jplopsoft_NT_KERNEL.processHandles.hasOwnProperty(k)&&parseInt(jplopsoft_NT_KERNEL.processHandles[k].ownerPid,10)===parseInt(ctx.pid,10))delete jplopsoft_NT_KERNEL.processHandles[k];
  }
  jplopsoft_ntReleaseProcessSections(ctx.pid);
  jplopsoft_ntCloseAllObjectHandlesForPid(ctx.pid);
  p=jplopsoft_ntKernelProcessByPid(ctx.pid);
  if(p&&typeof jplopsoft_vmmReleaseProcess==='function'){
    jplopsoft_vmmReleaseProcess(p);
  }
  for(k in ctx.controls){
    if(ctx.controls.hasOwnProperty(k)&&ctx.controls[k]&&ctx.controls[k]._exosTopologyState){
      try{jplopsoft_xshTopologyDispose(ctx.controls[k]);}catch(ignoreTopologyDispose){}
    }
  }
  var hwnds=[];for(k in ctx.windows)if(ctx.windows.hasOwnProperty(k))hwnds.push(parseInt(k,10)||0);
  for(k=0;k<hwnds.length;k++){var h=hwnds[k];if(h&&jplopsoft_user32GetRecord(h)){try{jplopsoft_DestroyWindow(h);}catch(ignoreWindow){}}}
  ctx.windows={};
  ctx.controls={};
  ctx.commonControls={};
  ctx.imageLists={};
  ctx.localFiles={};

  if(ctx.consoleId){
    jplopsoft_xshConsoleDetach(ctx);
  }

  if(!skipKernel){p=jplopsoft_ntKernelProcessByPid(ctx.pid);if(p&&p.alive){jplopsoft_ntJobOnProcessExit(p);p.alive=false;p.exitTime=jplopsoft_ntKernelNow();p.exitStatus=Number(exitCode)||0;delete jplopsoft_NT_KERNEL.processByPid[String(p.pid)];}}
  if(ctx.builtinAppId&&jplopsoft_XSH.builtinByApp[String(ctx.builtinAppId)]===ctx)delete jplopsoft_XSH.builtinByApp[String(ctx.builtinAppId)];
  delete jplopsoft_XSH.byPid[String(ctx.pid)];
  delete jplopsoft_XSH.runs[String(ctx.runId)];

  return true;
}

function jplopsoft_xshMinimizeAllWindows(){
  var k,c,w,h,session,
      seenConsole={};

  for(k in jplopsoft_XSH.runs){
    if(!jplopsoft_XSH.runs.hasOwnProperty(k))continue;

    c=jplopsoft_XSH.runs[k];

    if(!c||c.terminating)continue;

    if(c.consoleId&&!seenConsole[String(c.consoleId)]){
      seenConsole[String(c.consoleId)]=1;
      session=jplopsoft_xshConsoleForProcess(c);

      if(
        session&&
        session.hwnd&&
        jplopsoft_user32GetRecord(session.hwnd)
      ){
        jplopsoft_ShowWindow(
          session.hwnd,
          jplopsoft_SW_MINIMIZE
        );
      }
    }

    for(w in c.windows){
      if(!c.windows.hasOwnProperty(w))continue;

      h=parseInt(w,10)||0;

      if(h&&jplopsoft_user32GetRecord(h)){
        jplopsoft_ShowWindow(
          h,
          jplopsoft_SW_MINIMIZE
        );
      }
    }
  }
}

function jplopsoft_xshSuspendAll(reason){
  var k,ctx,p;
  reason=String(reason||'SecureDesktop');
  for(k in jplopsoft_XSH.runs){
    if(!jplopsoft_XSH.runs.hasOwnProperty(k))continue;
    ctx=jplopsoft_XSH.runs[k];
    if(!ctx||ctx.terminating||ctx.suspended)continue;
    ctx.suspended=true;
    ctx.suspendReason=reason;
    if(!ctx.suspendedRpcQueue)ctx.suspendedRpcQueue=[];
    if(!ctx.suspendedRafIds)ctx.suspendedRafIds=[];
    jplopsoft_xshCancelAllAnimationFrames(ctx);
    p=jplopsoft_ntKernelProcessByPid(ctx.pid);
    if(p){p.suspended=true;p.suspendReason=reason;}
    try{if(ctx.port)ctx.port.postMessage({type:'suspend',reason:reason});}catch(ignoreXshSuspendPost){}
  }
  jplopsoft_NT_SCHEDULER.foregroundPid=0;
  jplopsoft_NT_SCHEDULER.foregroundHwnd=0;
  return true;
}

function jplopsoft_xshResumeAll(reason){
  var k,ctx,p,rpcQueue,rafIds,i;
  reason=String(reason||'SecureDesktopResume');
  for(k in jplopsoft_XSH.runs){
    if(!jplopsoft_XSH.runs.hasOwnProperty(k))continue;
    ctx=jplopsoft_XSH.runs[k];
    if(!ctx||ctx.terminating||!ctx.suspended)continue;
    ctx.suspended=false;
    ctx.suspendReason='';
    p=jplopsoft_ntKernelProcessByPid(ctx.pid);
    if(p){p.suspended=false;p.suspendReason='';}
    try{if(ctx.port)ctx.port.postMessage({type:'resume',reason:reason});}catch(ignoreXshResumePost){}
    rpcQueue=(ctx.suspendedRpcQueue||[]).splice(0);
    rafIds=(ctx.suspendedRafIds||[]).splice(0);
    jplopsoft_xshQueueWakeWaiter(ctx);
    jplopsoft_xshScheduleMessageDrain(ctx);
    for(i=0;i<rafIds.length;i++)jplopsoft_xshRequestAnimationFrame(ctx,rafIds[i]);
    if(rpcQueue.length)(function(c,q){window.setTimeout(function(){var j;for(j=0;j<q.length;j++)jplopsoft_xshOnSandboxMessage(c,q[j]);},0);})(ctx,rpcQueue);
  }
  return true;
}

var jplopsoft_SECURE_SAS={active:false,locked:false,reason:'',enteredAt:0,bound:false,leaving:false};

function jplopsoft_secureDesktopEnter(reason){
  var back=jplopsoft_el('jplopsoft_securityBackdrop'),active=document.activeElement;
  if(!state||!state.samAuthenticated||!state.vaultKey)return false;
  reason=String(reason||'SAS');
  if(!jplopsoft_SECURE_SAS.active){
    jplopsoft_SECURE_SAS.active=true;
    jplopsoft_SECURE_SAS.reason=reason;
    jplopsoft_SECURE_SAS.enteredAt=(new Date()).getTime();
    jplopsoft_xshSuspendAll('SecureDesktop:'+reason);
  }
  try{if(active&&active.blur)active.blur();}catch(ignoreSecureBlur){}
  try{if(typeof jplopsoft_shell32DismissAllUI==='function')jplopsoft_shell32DismissAllUI();}catch(ignoreSecureShellMenu){}
  if(jplopsoft_el('jplopsoft_securityUserName'))jplopsoft_el('jplopsoft_securityUserName').textContent=state.samUsername||'administrator';
  if(jplopsoft_el('jplopsoft_securityUserSid'))jplopsoft_el('jplopsoft_securityUserSid').textContent=state.samSid||'';
  state.securityScreenOpen=true;
  state.securitySessionLocked=!!jplopsoft_SECURE_SAS.locked;
  if(typeof jplopsoft_securitySetMode==='function')jplopsoft_securitySetMode(!!jplopsoft_SECURE_SAS.locked);
  if(back){back.style.setProperty('display','flex','important');back.style.setProperty('z-index','2147483647','important');back.setAttribute('data-secure-desktop','1');}
  return true;
}

function jplopsoft_secureDesktopLeave(reason){
  var back=jplopsoft_el('jplopsoft_securityBackdrop');
  if(!jplopsoft_SECURE_SAS.active)return true;
  if(jplopsoft_SECURE_SAS.locked||state.securitySessionLocked)return false;
  jplopsoft_SECURE_SAS.leaving=true;
  if(back){back.style.setProperty('display','none','important');back.removeAttribute('data-secure-desktop');}
  state.securityScreenOpen=false;
  jplopsoft_SECURE_SAS.active=false;
  jplopsoft_SECURE_SAS.reason='';
  jplopsoft_xshResumeAll(String(reason||'SecureDesktopLeave'));
  jplopsoft_SECURE_SAS.leaving=false;
  return true;
}

function jplopsoft_secureDesktopLockSession(){
  if(!jplopsoft_SECURE_SAS.active)jplopsoft_secureDesktopEnter('Lock');
  jplopsoft_SECURE_SAS.locked=true;
  state.securitySessionLocked=true;
  if(typeof jplopsoft_securitySetMode==='function')jplopsoft_securitySetMode(true);
  return true;
}

function jplopsoft_secureDesktopUnlockSuccess(){
  jplopsoft_SECURE_SAS.locked=false;
  state.securitySessionLocked=false;
  if(typeof jplopsoft_securitySetMode==='function')jplopsoft_securitySetMode(false);
  return jplopsoft_secureDesktopLeave('UnlockVerified');
}

function jplopsoft_secureDesktopLogout(){
  var back=jplopsoft_el('jplopsoft_securityBackdrop');
  jplopsoft_SECURE_SAS.locked=true;
  state.securitySessionLocked=true;
  if(back){back.style.setProperty('display','none','important');back.removeAttribute('data-secure-desktop');}
  state.securityScreenOpen=false;
  jplopsoft_SECURE_SAS.active=false;
  jplopsoft_SECURE_SAS.reason='Logout';
  /* Do not resume user-mode XSH here.  jplopsoft_lock(true) tears down the
   * interactive desktop/processes; resuming them during the transition would
   * briefly re-enable untrusted code beneath Winlogon. */
  return jplopsoft_lock(true);
}

function jplopsoft_secureDesktopBindSas(){
  if(jplopsoft_SECURE_SAS.bound||!document.addEventListener)return;
  jplopsoft_SECURE_SAS.bound=true;
  document.addEventListener('keydown',function(e){
    e=e||window.event;
    var key=String(e.key||'').toLowerCase(),code=e.keyCode||e.which;
    if(e.ctrlKey&&e.altKey&&(key==='s'||code===83)){
      if(e.preventDefault)e.preventDefault();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();else if(e.stopPropagation)e.stopPropagation();
      e.cancelBubble=true;
      if(state&&state.samAuthenticated&&state.vaultKey)jplopsoft_secureDesktopEnter('Ctrl+Alt+S');
      return false;
    }
    if(jplopsoft_SECURE_SAS.active){
      /* Security Desktop owns keyboard focus while active. */
      if(code===27&&!jplopsoft_SECURE_SAS.locked){if(e.preventDefault)e.preventDefault();jplopsoft_secureDesktopLeave('Escape');return false;}
    }
    return true;
  },true);
}

function jplopsoft_xshTerminateAll(reason){
  var list=[],k,c,i;

  for(k in jplopsoft_XSH.runs){
    if(
      jplopsoft_XSH.runs.hasOwnProperty(k)&&
      jplopsoft_XSH.runs[k]
    ){
      list.push(jplopsoft_XSH.runs[k]);
    }
  }

  for(i=0;i<list.length;i++){
    c=list[i];

    if(c&&!c.terminating){
      jplopsoft_xshTerminate(
        c,
        0,
        String(reason||'SessionEnd'),
        false
      );
    }
  }
}

function jplopsoft_xshTerminateByPid(pid,reason,skipKernel){var ctx=jplopsoft_xshRunByPid(pid);if(!ctx)return false;jplopsoft_xshTerminate(ctx,1,reason||'Terminate',!!skipKernel);return true;}


/* =========================================================================
 * Task Manager
 * os91-hotfix18: UI moved to C:\ExOS\SystemApps\taskmgr.xsh.
 * exos.js now exposes only kernel/DLL process primitives.
 * ========================================================================= */

/* Taskbar context-menu event routing/presentation is owned by shell32.dll. */

function jplopsoft_RegisterExFSNativeWindows(){
  /* os91-hotfix21: SystemApps own their USER32 HWNDs. Secure Desktop remains host-native. */
  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_securityWindow')){
    jplopsoft_AdoptWindow({
      className:'ExFS.Security',
      overlay:true,backdropId:'jplopsoft_securityBackdrop',
      windowId:'jplopsoft_securityWindow',
      titlebarId:'jplopsoft_securityTitlebar',
      appId:'security',icon:'security',
      style:jplopsoft_WS_OVERLAPPEDWINDOW,
      exStyle:jplopsoft_WS_EX_APPWINDOW,
      minButtonId:'jplopsoft_securityMinBtn',
      maxButtonId:'jplopsoft_securityMaxBtn',
      closeButtonId:'jplopsoft_securityCloseTop',
      onMinimize:function(){jplopsoft_wmOverlayMinimize('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');},
      onMaximize:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_securityWindow',true);jplopsoft_wmActivateOverlay('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');},
      onRestore:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_securityWindow',false);jplopsoft_wmOverlayRestore('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');},
      onClose:function(){jplopsoft_closeSecurityScreen();}
    });
  }
}

function jplopsoft_bindWindowManager(){
  var security=jplopsoft_el('jplopsoft_securityWindow');

  jplopsoft_dwmNormalizeRootStacking();
  if(typeof jplopsoft_shell32ApplyDesktopPersonalization==='function')jplopsoft_shell32ApplyDesktopPersonalization();

  if(security){
    security.onmousedown=function(){jplopsoft_wmActivateOverlay('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');};
    jplopsoft_wmMakeDraggable('jplopsoft_securityWindow','jplopsoft_securityTitlebar');
  }
  if(jplopsoft_el('jplopsoft_securityMinBtn'))jplopsoft_el('jplopsoft_securityMinBtn').onclick=function(){jplopsoft_wmOverlayMinimize('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');};
  if(jplopsoft_el('jplopsoft_securityMaxBtn'))jplopsoft_el('jplopsoft_securityMaxBtn').onclick=function(){jplopsoft_wmToggleOverlayMax('jplopsoft_securityWindow');jplopsoft_wmActivateOverlay('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');};
  if(jplopsoft_el('jplopsoft_securityCloseTop'))jplopsoft_el('jplopsoft_securityCloseTop').onclick=jplopsoft_closeSecurityScreen;

  if(typeof jplopsoft_shell32BindDesktopSurface==='function')jplopsoft_shell32BindDesktopSurface();


  jplopsoft_applySvgIcons(document);
  jplopsoft_user32RebindNonClientButtons(document);
  jplopsoft_RegisterExFSNativeWindows();
  jplopsoft_user32RebindNonClientButtons(document);
}


/* =========================================================================
 * Taskbar clock launcher
 * os91-hotfix21: calendar UI is SystemApps/calendar.xsh, not a host flyout.
 * ========================================================================= */
function jplopsoft_bindTaskbar(){
  if(typeof jplopsoft_shell32BindTaskbarPresentation==='function'){
    jplopsoft_shell32BindTaskbarPresentation();
  }
}


function jplopsoft_bind(){
  var n;
  /* Taskbar is a Shell lifecycle boundary. Bind it before optional host UI so
     a later Secure Desktop/Security binding error cannot strand Start/clock. */
  jplopsoft_bindTaskbar();
  n=jplopsoft_el('jplopsoft_unlockBtn');if(n)n.onclick=jplopsoft_submitCredentialUI;
  n=jplopsoft_el('jplopsoft_loginUserInput');if(n){
    n.onkeydown=function(e){e=e||window.event;if((e.keyCode||e.which)===13&&!state.kdfBusy){try{var p=jplopsoft_el('jplopsoft_keyInput');if(p)p.focus();}catch(ignoreUserEnter){}}};
    n.onchange=function(){if(state.kdfBusy)return;jplopsoft_selectLogonAccount(String(this.value||state.defaultUsername||'administrator').toLowerCase(),true);};
  }
  n=jplopsoft_el('jplopsoft_keyInput');if(n)n.onkeydown=function(e){e=e||window.event;if((e.keyCode||e.which)===13&&!state.kdfBusy)jplopsoft_submitCredentialUI();};
  jplopsoft_bindSecureDesktopUI();jplopsoft_secureDesktopBindSas();
  n=jplopsoft_el('jplopsoft_rememberUnlock');if(n)n.onchange=jplopsoft_onRememberUnlockChanged;
  n=jplopsoft_el('jplopsoft_largeTransferCancelBtn');if(n)n.onclick=jplopsoft_cancelLargeTransfer;
  n=jplopsoft_el('jplopsoft_largeTransferMinBtn');if(n)n.onclick=jplopsoft_toggleLargeTransferMinimized;
  jplopsoft_bindSecurityUI();
  jplopsoft_bindWindowManager();
  jplopsoft_bindGlobalHotkeys();
}

window.jplopsoft_EXOS_OS={
  ready:true,
  version:'6.4.0-dev-os91',
  build:'os91-hotfix63-window-root-boot-splash'
};
