/* ExOS shell32.dll emulation
 * Version: 6.4.0-dev-os91
 * Model: EXOS_SHELL32_V1
 *
 * Browser/XSH shell API.  The implementation is intentionally restricted to
 * ExOS' ExFS VDO plus session DOS-device aliases. It never exposes the host filesystem.
 */
(function(global){
'use strict';

var PROPERTY_STORES={next:0xD800,items:{}};
var SHELL={
  version:'6.4.0-dev-os91',
  build:'6.4.0-dev-os91-hotfix39',
  taskbarPresentationVersion:4,
  model:'EXOS_SHELL32_V1',
  ready:true,
  clipboard:{
    effect:'',
    paths:[],
    sourcePid:0,
    updatedAt:0
  },
  drag:{
    id:0,
    paths:[],
    allowedEffects:['copy','move'],
    sourcePid:0,
    active:false
  },
  menuSeq:0,
  styleReady:false,
  flyouts:{},
  flyoutDismissBound:false,
  flyoutDismissHandler:null,
  desktopBound:false,
  desktopTimer:0,
  desktopRetryTimer:0,
  desktopBootstrapStarted:false,
  taskbarBound:false,
  clockTimer:0,
  taskbarRetryTimer:0,
  taskbarBootstrapStarted:false,
  notificationSeq:0,
  notifications:{}
};

var SHELL_DESKTOP_WALLPAPER_DATA_URI='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzODQwIiBoZWlnaHQ9IjIxNjAiIHZpZXdCb3g9IjAgMCAzODQwIDIxNjAiPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzBiNzZjNSIvPjxzdG9wIG9mZnNldD0iLjQ4IiBzdG9wLWNvbG9yPSIjMDc1OTk1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDQyYTRmIi8+PC9saW5lYXJHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJnbG93IiBjeD0iLjcyIiBjeT0iLjQ2IiByPSIuNTIiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzlkZTJmZiIgc3RvcC1vcGFjaXR5PSIuNDUiLz48c3RvcCBvZmZzZXQ9Ii4zOCIgc3RvcC1jb2xvcj0iIzUyYjllZiIgc3RvcC1vcGFjaXR5PSIuMTgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDE1MmIiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFuZSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2U5ZjhmZiIgc3RvcC1vcGFjaXR5PSIuOSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzY2YzlmNSIgc3RvcC1vcGFjaXR5PSIuMjYiLz48L2xpbmVhckdyYWRpZW50Pgo8ZmlsdGVyIGlkPSJzb2Z0IiB4PSItNDAlIiB5PSItNDAlIiB3aWR0aD0iMTgwJSIgaGVpZ2h0PSIxODAlIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzNCIvPjwvZmlsdGVyPgo8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiPjxmZURyb3BTaGFkb3cgZHg9IjAiIGR5PSIyNCIgc3RkRGV2aWF0aW9uPSIzNiIgZmxvb2QtY29sb3I9IiMwMDE0MjUiIGZsb29kLW9wYWNpdHk9Ii41MiIvPjwvZmlsdGVyPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIzODQwIiBoZWlnaHQ9IjIxNjAiIGZpbGw9InVybCgjYmcpIi8+PHJlY3Qgd2lkdGg9IjM4NDAiIGhlaWdodD0iMjE2MCIgZmlsbD0idXJsKCNnbG93KSIvPgo8cGF0aCBkPSJNMCAxNzYwIEwyNzkwIDcyMCBMMzg0MCAxMDQwIEwzODQwIDIxNjAgTDAgMjE2MFoiIGZpbGw9IiMwYjgwY2MiIG9wYWNpdHk9Ii4xMSIvPgo8cGF0aCBkPSJNMCAyMDYwIEwyNjMwIDgxMCBMMzg0MCAxMjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiNiY2VjZmYiIHN0cm9rZS13aWR0aD0iNCIgb3BhY2l0eT0iLjA4Ii8+CjxlbGxpcHNlIGN4PSIyODQwIiBjeT0iMTAzMCIgcng9Ijc5MCIgcnk9IjcwMCIgZmlsbD0iIzU2YzZmZiIgb3BhY2l0eT0iLjEyIiBmaWx0ZXI9InVybCgjc29mdCkiLz4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCA0NjApIHNrZXdZKC01KSIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiIG9wYWNpdHk9Ii43OCI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI0NTAiIGhlaWdodD0iNDcwIiBmaWxsPSJ1cmwoI3BhbmUpIi8+PHJlY3QgeD0iNDgyIiB5PSIwIiB3aWR0aD0iNTIwIiBoZWlnaHQ9IjQ3MCIgZmlsbD0idXJsKCNwYW5lKSIvPgo8cmVjdCB4PSIwIiB5PSI1MDIiIHdpZHRoPSI0NTAiIGhlaWdodD0iNTEwIiBmaWxsPSJ1cmwoI3BhbmUpIi8+PHJlY3QgeD0iNDgyIiB5PSI1MDIiIHdpZHRoPSI1MjAiIGhlaWdodD0iNTEwIiBmaWxsPSJ1cmwoI3BhbmUpIi8+CjxwYXRoIGQ9Ik00NTAgMCBMNDgyIDAgTDQ4MiAxMDEyIEw0NTAgMTAxMloiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4xNCIvPjxwYXRoIGQ9Ik0wIDQ3MCBMMTAwMiA0NzAgTDEwMDIgNTAyIEwwIDUwMloiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4xMiIvPgo8L2c+Cjwvc3ZnPg==';

function shellNormalizeDesktopPersonalization(spec){
  var x=spec&&typeof spec==='object'?spec:{},mode=String(x.mode||'preset').toLowerCase(),preset=String(x.preset||'default').toLowerCase(),fit=String(x.fit||'cover').toLowerCase(),color=String(x.color||'#075b9e'),data=String(x.data_url||x.dataUrl||''),taskbarPosition=String(x.taskbar_position||x.taskbarPosition||'bottom').toLowerCase();
  if(mode!=='preset'&&mode!=='solid'&&mode!=='custom')mode='preset';
  if(['default','aurora','night','slate','sunrise'].indexOf(preset)<0)preset='default';
  if(['cover','contain','center','tile','stretch'].indexOf(fit)<0)fit='cover';
  if(['bottom','top','left','right'].indexOf(taskbarPosition)<0)taskbarPosition='bottom';
  if(!/^#[0-9a-f]{6}$/i.test(color))color='#075b9e';
  if(mode==='custom'&&!/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(data)){mode='preset';preset='default';data='';}
  return{mode:mode,preset:preset,fit:fit,color:color,data_url:data,taskbar_position:taskbarPosition};
}
function shellApplyTaskbarPosition(){
  var spec=shellNormalizeDesktopPersonalization(global.state&&state.desktopPersonalization?state.desktopPersonalization:null),body=document.body,pos=spec.taskbar_position||'bottom',names=['bottom','top','left','right'],i;
  if(!body)return false;
  for(i=0;i<names.length;i++)body.classList.remove('jplopsoft_taskbar-'+names[i]);
  body.classList.add('jplopsoft_taskbar-'+pos);
  try{body.setAttribute('data-exos-taskbar-position',pos);}catch(ignoreTaskbarAttribute){}
  try{window.dispatchEvent(new CustomEvent('exos-taskbar-position-changed',{detail:{position:pos}}));}catch(ignoreTaskbarEvent){}
  return true;
}
function shellApplyDesktopWallpaper(){
  var d=document.getElementById('jplopsoft_desktopSurface'),spec,repeat='no-repeat',size='cover',position='center center',image='';
  if(!d)return false;
  spec=shellNormalizeDesktopPersonalization(global.state&&state.desktopPersonalization?state.desktopPersonalization:null);
  if(spec.mode==='solid')d.style.background=spec.color;
  else if(spec.mode==='custom'){
    if(spec.fit==='contain')size='contain';
    else if(spec.fit==='center'){size='auto';position='center center';}
    else if(spec.fit==='tile'){size='auto';repeat='repeat';position='left top';}
    else if(spec.fit==='stretch')size='100% 100%';
    image='url("'+spec.data_url.replace(/["\\\r\n]/g,'')+'")';
    d.style.background=spec.color+' '+image+' '+position+' / '+size+' '+repeat;
  }else if(spec.preset==='aurora')d.style.background='radial-gradient(circle at 68% 35%,rgba(126,249,255,.70),transparent 31%), radial-gradient(circle at 28% 62%,rgba(91,110,255,.70),transparent 38%), linear-gradient(135deg,#07152f 0%,#0b4b72 52%,#08203e 100%)';
  else if(spec.preset==='night')d.style.background='radial-gradient(circle at 72% 28%,rgba(93,130,255,.28),transparent 30%), linear-gradient(145deg,#050912 0%,#101b32 46%,#02050b 100%)';
  else if(spec.preset==='slate')d.style.background='linear-gradient(135deg,#334155 0%,#64748b 48%,#1e293b 100%)';
  else if(spec.preset==='sunrise')d.style.background='radial-gradient(circle at 70% 62%,rgba(255,244,183,.75),transparent 28%), linear-gradient(145deg,#6d28d9 0%,#db2777 43%,#f59e0b 100%)';
  else d.style.background='#075b9e url("'+SHELL_DESKTOP_WALLPAPER_DATA_URI+'") center center / cover no-repeat';
  d.setAttribute('data-exos-wallpaper-layers','1');
  d.setAttribute('data-exos-wallpaper-mode',spec.mode+':'+spec.preset+':'+spec.fit);
  return true;
}
function shellApplyDesktopPersonalization(){shellApplyDesktopWallpaper();shellApplyTaskbarPosition();shellPositionNotificationHost();return true;}
function shellLoadDesktopPersonalization(cb){
  if(!global.state||!state.samAuthenticated||!state.vaultKey){if(cb)cb(false);return false;}
  jplopsoft_api('desktop_personalization_get','POST',{},true,function(err,out){
    if(!err&&out&&out.personalization)state.desktopPersonalization=shellNormalizeDesktopPersonalization(out.personalization);
    shellApplyDesktopPersonalization();
    if(cb)cb(!err,state.desktopPersonalization,err||null);
  });
  return true;
}
function shellQueryDesktopPersonalization(){
  return new Promise(function(resolve,reject){
    jplopsoft_api('desktop_personalization_get','POST',{},true,function(err,out){
      if(err){reject(err);return;}
      state.desktopPersonalization=shellNormalizeDesktopPersonalization(out&&out.personalization?out.personalization:{});
      shellApplyDesktopPersonalization();
      resolve({ok:true,personalization:state.desktopPersonalization});
    });
  });
}
function shellSetDesktopPersonalization(spec){
  spec=shellNormalizeDesktopPersonalization(spec);
  return new Promise(function(resolve,reject){
    jplopsoft_api('desktop_personalization_set','POST',spec,true,function(err,out){
      if(err){reject(err);return;}
      state.desktopPersonalization=shellNormalizeDesktopPersonalization(out&&out.personalization?out.personalization:spec);
      shellApplyDesktopPersonalization();
      resolve({ok:true,personalization:state.desktopPersonalization});
    });
  });
}
async function shellLaunchSystemApp(ctx,name,args){
  var appName=String(name||'').toLowerCase(),list=args&&Object.prototype.toString.call(args)==='[object Array]'?args:[],built=jplopsoft_xshBuiltinManifest(appName),child;
  if(built){child=await jplopsoft_runBuiltinXsh(appName,list,ctx);return{ok:true,pid:child.pid,imagePath:child.imagePath};}
  if(appName==='security'){
    if(typeof jplopsoft_openSecurityScreen==='function'){jplopsoft_openSecurityScreen();return{ok:true,hostSecurityBoundary:true};}
    throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'ExOS Security host UI is unavailable.');
  }
  throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Unknown ExOS system app: '+appName);
}
function shellHostContext(){
  var p=typeof jplopsoft_ntKernelAliveByKey==='function'?jplopsoft_ntKernelAliveByKey('proc:explorer'):null;
  return{pid:p?Number(p.pid)||0:0,process:p||null,currentDrive:'C',currentDirectoryNodeId:0,currentDirectory:'C:\\',builtinAppId:'shell32-host'};
}
function shellDesktopFolderPath(){return 'C:\\Users\\'+String(state&&state.samUsername?state.samUsername:'administrator')+'\\Desktop';}
function shellDesktopSystemItems(){
  return[
    {id:'computer',label:'我的電腦',icon:'computer',title:'我的電腦'},
    {id:'cmd',label:'指令模式',icon:'cmd',title:'指令模式'},
    {id:'trash',label:'資源回收桶',icon:'trash',title:'資源回收桶'}
  ];
}
function shellDesktopPhysicalItems(){
  var ctx=shellHostContext(),paths=[shellDesktopFolderPath(),'C:\\Users\\Public\\Desktop'],out=[],seen={},i,folder,list,j,raw,n,name,path,key;
  if(!global.state||!state.vaultKey)return out;
  for(i=0;i<paths.length;i++){
    try{folder=jplopsoft_xshResolveC(ctx,paths[i],false);}catch(ignoreResolve){folder=null;}
    if(!folder||!folder.id)continue;
    list=jplopsoft_childrenOf(folder.id)||[];
    for(j=0;j<list.length;j++){
      raw=list[j];n=jplopsoft_resolveClientNode(raw);if(!raw||!n)continue;
      name=jplopsoft_decName(raw);if(name===null)name=jplopsoft_decName(n);if(name===null)continue;
      key=String(raw.id);if(seen[key])continue;seen[key]=1;
      path=jplopsoft_exfsNodeFullPath(raw);
      out.push({id:parseInt(raw.id,10)||0,name:name,path:path,directory:n.type==='folder',shortcut:raw.type==='reparse_point',publicDesktop:i===1,icon:raw.type==='reparse_point'?'link':shellIconName(path,n.type==='folder')});
    }
  }
  out.sort(function(a,b){if(a.directory&&!b.directory)return-1;if(!a.directory&&b.directory)return 1;return String(a.name).localeCompare(String(b.name),'zh-Hant');});
  return out;
}
function shellDesktopItems(){return{system:shellDesktopSystemItems(),files:shellDesktopPhysicalItems(),desktopPath:shellDesktopFolderPath()};}
function shellDesktopLaunchSystem(key){
  key=String(key||'').toLowerCase();
  if(key==='computer')return jplopsoft_runBuiltinXsh('explorer',['C:\\'],null);
  if(key==='cmd')return jplopsoft_runBuiltinXsh('cmd',[shellDesktopFolderPath()],null);
  if(key==='trash')return jplopsoft_runBuiltinXsh('trash',[],null);
  return Promise.resolve(false);
}
function shellDesktopContextMenu(kind,value,ev){
  var x=0,y=0;
  ev=ev||window.event;
  if(ev){try{if(ev.preventDefault)ev.preventDefault();if(ev.stopPropagation)ev.stopPropagation();}catch(ignoreEvent){}ev.returnValue=false;ev.cancelBubble=true;x=Number(ev.clientX||0)||0;y=Number(ev.clientY||0)||0;}
  if(kind==='path')jplopsoft_launchSystemXshApp('desktop_shell_menu',['path',String(value||''),String(x),String(y),shellDesktopFolderPath()]);
  else if(kind==='system')jplopsoft_launchSystemXshApp('desktop_shell_menu',['system',String(value||''),String(x),String(y),shellDesktopFolderPath()]);
  else jplopsoft_launchSystemXshApp('desktop_shell_menu',['background',shellDesktopFolderPath(),String(x),String(y),shellDesktopFolderPath()]);
  return false;
}
function shellRenderDesktop(){
  var host=document.querySelector?document.querySelector('.jplopsoft_desktop-icons'):null,items=shellDesktopItems(),i,item,b,icon,label;
  if(!host)return false;
  while(host.firstChild)host.removeChild(host.firstChild);
  for(i=0;i<items.system.length;i++){
    item=items.system[i];b=document.createElement('button');b.type='button';b.id='jplopsoft_desktop'+(item.id==='computer'?'Computer':item.id==='cmd'?'Cmd':'Trash')+'Icon';b.className='jplopsoft_desktop-icon';b.title=item.title;
    icon=document.createElement('span');icon.className='jplopsoft_desktop-icon-glyph';icon.setAttribute('data-exfs-svg',item.icon);icon.setAttribute('data-exfs-svg-size','46');b.appendChild(icon);
    label=document.createElement('span');label.textContent=item.label;b.appendChild(label);
    (function(k,node){node.ondblclick=function(e){if(e&&e.preventDefault)e.preventDefault();shellDesktopLaunchSystem(k);return false;};node.oncontextmenu=function(e){return shellDesktopContextMenu('system',k,e);};})(item.id,b);
    host.appendChild(b);
  }
  for(i=0;i<items.files.length;i++){
    item=items.files[i];if(!item.id)continue;
    b=document.createElement('button');b.type='button';b.className='jplopsoft_desktop-icon jplopsoft_desktop-physical-item'+(item.shortcut?' jplopsoft_desktop-physical-shortcut':'');b.setAttribute('data-desktop-physical-node',String(item.id));b.title=(item.publicDesktop?'Public Desktop ｜ ':'')+item.name;
    icon=document.createElement('span');icon.className='jplopsoft_desktop-icon-glyph';icon.setAttribute('data-exfs-svg',item.icon);icon.setAttribute('data-exfs-svg-size','46');b.appendChild(icon);
    label=document.createElement('span');label.textContent=item.name+(item.shortcut?' ↗':'');b.appendChild(label);
    (function(p,node){node.ondblclick=function(e){if(e&&e.preventDefault)e.preventDefault();shellOpenPath(shellHostContext(),p).catch(function(err){if(typeof jplopsoft_user32MessageBox==='function')jplopsoft_user32MessageBox(String(err&&err.message?err.message:err),'ExOS Shell');});return false;};node.oncontextmenu=function(e){return shellDesktopContextMenu('path',p,e);};})(item.path,b);
    host.appendChild(b);
  }
  try{if(typeof jplopsoft_applySvgIcons==='function')jplopsoft_applySvgIcons(host);}catch(ignoreIcons){}
  return true;
}
function shellBindDesktopSurface(){
  var surface=document.getElementById('jplopsoft_desktopSurface'),icons=document.getElementById('jplopsoft_desktopIcons'),bound=false;
  function backgroundHandler(ev){var t=ev&&(ev.target||ev.srcElement),cur=t;while(cur&&cur!==surface&&cur&&cur!==icons){if(cur.nodeType===1&&(' '+String(cur.className||'')+' ').indexOf(' jplopsoft_desktop-icon ')>=0)return false;cur=cur.parentNode;}return shellDesktopContextMenu('background','',ev);}
  if(!surface)return false;
  if(surface&&surface.__exosShell32DesktopContextBound!==true){surface.oncontextmenu=backgroundHandler;surface.__exosShell32DesktopContextBound=true;bound=true;}
  if(icons&&icons.__exosShell32DesktopContextBound!==true){icons.oncontextmenu=backgroundHandler;icons.__exosShell32DesktopContextBound=true;bound=true;}
  SHELL.desktopBound=!!(surface&&surface.__exosShell32DesktopContextBound===true);
  if(!shellRenderDesktop()&&!bound)return false;
  if(!SHELL.desktopTimer)SHELL.desktopTimer=window.setInterval(function(){
    var s=document.getElementById('jplopsoft_desktopSurface'),i=document.getElementById('jplopsoft_desktopIcons');
    try{
      if(!s||s.__exosShell32DesktopContextBound!==true||!i||i.__exosShell32DesktopContextBound!==true){
        shellBindDesktopSurface();
      }
    }catch(ignoreDesktopHeartbeat){}
  },1200);
  if((!surface||!icons)&&!SHELL.desktopRetryTimer){
    SHELL.desktopRetryTimer=window.setTimeout(function(){SHELL.desktopRetryTimer=0;shellBindDesktopSurface();},120);
  }
  return true;
}
function shellBootstrapDesktopPresentation(){
  if(SHELL.desktopBootstrapStarted)return true;
  SHELL.desktopBootstrapStarted=true;
  function attempt(){
    try{shellBindDesktopSurface();}
    catch(ignoreDesktopBootstrap){
      if(!SHELL.desktopRetryTimer){
        SHELL.desktopRetryTimer=window.setTimeout(function(){SHELL.desktopRetryTimer=0;attempt();},120);
      }
    }
  }
  if(document.readyState==='loading'&&document.addEventListener){
    document.addEventListener('DOMContentLoaded',function(){window.setTimeout(attempt,0);},false);
  }else{
    window.setTimeout(attempt,0);
  }
  return true;
}
function shellTaskbarAppDomId(appId){
  return 'jplopsoft_taskbarApp_'+String(appId||'');
}
function shellTaskbarIconName(icon){
  var value=String(icon||''),r;
  if(typeof jplopsoft_shareResResolve==='function'){
    r=jplopsoft_shareResResolve(value,'shell32.dll');
    if(r)return r.token;
  }
  return'res://shell32.dll/file';
}
function shellTaskbarEnsureApp(appId,icon,label){
  var host=document.getElementById('jplopsoft_taskbarApps'),id=shellTaskbarAppDomId(appId),btn=document.getElementById(id),ic,tx;
  shellEnsureStyle();
  if(!host)return null;
  if(!btn){
    btn=document.createElement('button');btn.id=id;btn.type='button';btn.className='jplopsoft_taskbar-app';btn.setAttribute('data-app-id',String(appId||''));
    btn.onclick=function(){return shellTaskbarToggleApp(String(this.getAttribute('data-app-id')||''));};
    ic=document.createElement('span');ic.className='jplopsoft_taskbar-app-icon';ic.setAttribute('data-task-icon','1');btn.appendChild(ic);
    tx=document.createElement('span');tx.className='jplopsoft_taskbar-app-text';tx.setAttribute('data-task-text','1');btn.appendChild(tx);host.appendChild(btn);
  }
  ic=btn.querySelector?btn.querySelector('[data-task-icon]'):null;tx=btn.querySelector?btn.querySelector('[data-task-text]'):null;
  if(ic&&typeof jplopsoft_svgIconApply==='function')jplopsoft_svgIconApply(ic,shellTaskbarIconName(icon),18);
  if(tx)tx.textContent=String(label||appId);btn.title=String(label||appId);btn.setAttribute('aria-label',String(label||appId));
  return btn;
}
function shellTaskbarRemoveApp(appId){
  var btn=document.getElementById(shellTaskbarAppDomId(appId));if(btn&&btn.parentNode){btn.parentNode.removeChild(btn);return true;}return false;
}
function shellTaskbarSetAppState(appId,stateName){
  var btn=document.getElementById(shellTaskbarAppDomId(appId));if(!btn)return false;
  btn.className='jplopsoft_taskbar-app'+(stateName==='active'?' jplopsoft_active':'')+(stateName==='minimized'?' jplopsoft_minimized':'');
  btn.setAttribute('aria-pressed',stateName==='active'?'true':'false');return true;
}
function shellTaskbarDeactivateApps(exceptApp){
  var host=document.getElementById('jplopsoft_taskbarApps'),buttons,i,app;if(!host)return false;
  buttons=host.getElementsByTagName('button');for(i=0;i<buttons.length;i++){app=String(buttons[i].getAttribute('data-app-id')||'');if(app&&app!==String(exceptApp||'')&&(' '+String(buttons[i].className||'')+' ').indexOf(' jplopsoft_active ')>=0){buttons[i].className='jplopsoft_taskbar-app';buttons[i].setAttribute('aria-pressed','false');}}
  return true;
}
function shellTaskbarToggleApp(appId){
  if(typeof global.jplopsoft_user32ToggleTaskbarWindow==='function')return global.jplopsoft_user32ToggleTaskbarWindow(appId);
  return false;
}
function shellTaskbarTargetAppId(taskbar,target){
  var n=target,a='';while(n&&n!==taskbar){if(n.getAttribute){a=String(n.getAttribute('data-app-id')||'');if(a)return a;}n=n.parentNode;}return'';
}
function shellTaskbarWindowHwnd(appId){
  var rec=typeof global.jplopsoft_user32FindTaskbarWindow==='function'?global.jplopsoft_user32FindTaskbarWindow(appId):null;return rec?Number(rec.hwnd)||0:0;
}
function shellToggleStartMenu(){
  var c;if(!global.state||!state.samAuthenticated||!state.vaultKey||state.kdfBusy){if(typeof jplopsoft_user32MessageBox==='function')jplopsoft_user32MessageBox('請先登入 ExOS。');return false;}
  c=typeof jplopsoft_xshLatestBuiltin==='function'?jplopsoft_xshLatestBuiltin('start_menu'):null;
  if(c&&!c.terminating){jplopsoft_xshTerminate(c,0,'StartButtonToggle',false);return false;}
  jplopsoft_runBuiltinXsh('start_menu',[],null).catch(function(err){if(typeof jplopsoft_user32MessageBox==='function')jplopsoft_user32MessageBox(String(err&&err.message?err.message:err),'開始');});
  return false;
}
function shellTaskbarContextMenu(ev,appId){
  var x=0,y=0,hwnd=shellTaskbarWindowHwnd(appId);ev=ev||window.event;
  if(ev){if(ev.preventDefault)ev.preventDefault();if(ev.stopPropagation)ev.stopPropagation();ev.returnValue=false;ev.cancelBubble=true;x=Number(ev.clientX||0)||0;y=Number(ev.clientY||0)||0;}
  jplopsoft_runBuiltinXsh('taskbar_shell_menu',[String(appId||''),String(hwnd),String(x),String(y)],null).catch(function(err){if(typeof jplopsoft_user32MessageBox==='function')jplopsoft_user32MessageBox(String(err&&err.message?err.message:err),'工作列');});
  return false;
}
function shellHideClipboardMenu(menuId){
  var n=document.getElementById(String(menuId||''));if(n&&n.parentNode){n.parentNode.removeChild(n);return true;}return false;
}
function shellShowClipboardMenu(menuId,anchorNode,items){
  var id=String(menuId||('shell_clipboard_'+(++SHELL.menuSeq))),old=document.getElementById(id),menu,rect,i,row,sep,item,close;
  shellEnsureStyle();if(old&&old.parentNode)old.parentNode.removeChild(old);
  menu=document.createElement('div');menu.id=id;menu.className='jplopsoft_shell32_clipboard_menu';items=items||[];
  for(i=0;i<items.length;i++){
    item=items[i]||{};if(item.separator){sep=document.createElement('div');sep.className='jplopsoft_shell32_clipboard_sep';menu.appendChild(sep);continue;}
    row=document.createElement('button');row.type='button';row.className='jplopsoft_shell32_clipboard_item';
    var text=document.createElement('span'),kbd=document.createElement('kbd');text.textContent=String(item.text||'');kbd.textContent=String(item.shortcut||'');row.appendChild(text);row.appendChild(kbd);
    (function(action){row.onclick=function(e){try{e.preventDefault();e.stopPropagation();}catch(ignoreClick){}shellHideClipboardMenu(id);if(typeof action==='function')Promise.resolve(action()).catch(function(){});};})(item.run);
    menu.appendChild(row);
  }
  (document.body||document.documentElement).appendChild(menu);rect=anchorNode&&anchorNode.getBoundingClientRect?anchorNode.getBoundingClientRect():{right:window.innerWidth-20,bottom:40};
  menu.style.left=Math.max(4,Math.min(window.innerWidth-230,rect.right-220))+'px';menu.style.top=Math.max(4,Math.min(window.innerHeight-170,rect.bottom+2))+'px';
  close=function(e){if(menu&&menu.contains(e.target))return;shellHideClipboardMenu(id);document.removeEventListener('mousedown',close,true);};window.setTimeout(function(){document.addEventListener('mousedown',close,true);},0);return true;
}
function shellClipboardMenuId(hwnd){
  return 'jplopsoft_shell32_clipboard_'+String(Number(hwnd)||0);
}
function shellShowStandardClipboardMenu(hwnd,anchorNode,handlers){
  handlers=handlers||{};
  return shellShowClipboardMenu(
    shellClipboardMenuId(hwnd),
    anchorNode,
    [
      {text:'剪下',shortcut:'Ctrl+X',run:handlers.cut},
      {text:'複製',shortcut:'Ctrl+C',run:handlers.copy},
      {text:'貼上',shortcut:'Ctrl+V',run:handlers.paste},
      {separator:true},
      {text:'全選',shortcut:'Ctrl+A',run:handlers.selectAll}
    ]
  );
}
function shellInstallClipboardPresentation(hwnd,handlers){
  var rec=typeof global.jplopsoft_user32GetRecord==='function'?global.jplopsoft_user32GetRecord(hwnd):null,win=rec&&rec.windowId?document.getElementById(rec.windowId):null,controls=win&&win.querySelector?win.querySelector('.jplopsoft_wm-controls'):null,titleIcon=win&&win.querySelector?win.querySelector('.jplopsoft_wm-title-icon'):null,button,open;
  shellEnsureStyle();if(!win||!controls)return false;
  open=function(anchorNode){return shellShowStandardClipboardMenu(hwnd,anchorNode,handlers);};
  button=document.createElement('button');button.type='button';button.className='jplopsoft_wm-control jplopsoft_shell32_clipboard_button';button.title='編輯';button.setAttribute('aria-label','編輯');button.setAttribute('data-exfs-svg','edit');button.setAttribute('data-exfs-svg-size','13');
  button.onclick=function(e){try{e.preventDefault();e.stopPropagation();}catch(ignoreButton){}open(button);return false;};controls.insertBefore(button,controls.firstChild||null);
  if(titleIcon){titleIcon.style.cursor='default';titleIcon.title='編輯功能表';titleIcon.onclick=function(e){try{e.preventDefault();e.stopPropagation();}catch(ignoreIcon){}open(titleIcon);return false;};}
  try{if(typeof jplopsoft_applySvgIcons==='function')jplopsoft_applySvgIcons(win);}catch(ignoreApply){}return true;
}
function shellDismissClipboardPresentation(hwnd){
  return shellHideClipboardMenu(shellClipboardMenuId(hwnd));
}

function shellPad2(n){n=parseInt(n,10)||0;return n<10?'0'+n:String(n);}
function shellUpdateTaskbarClock(){
  var d=new Date(),timeNode=document.getElementById('jplopsoft_taskbarTime'),dateNode=document.getElementById('jplopsoft_taskbarDate'),clock=document.getElementById('jplopsoft_taskbarClock'),timeText,dateText;
  timeText=shellPad2(d.getHours())+':'+shellPad2(d.getMinutes());dateText=d.getFullYear()+'/'+shellPad2(d.getMonth()+1)+'/'+shellPad2(d.getDate());
  if(timeNode)timeNode.textContent=timeText;if(dateNode)dateNode.textContent=dateText;if(clock)clock.title=dateText+' '+timeText+':'+shellPad2(d.getSeconds());
  return{time:timeText,date:dateText,iso:d.toISOString()};
}
function shellBindTaskbarPresentation(){
  var clock=document.getElementById('jplopsoft_taskbarClock'),start=document.getElementById('jplopsoft_startBtn'),taskbar=document.getElementById('jplopsoft_taskbar'),complete=false;
  shellEnsureStyle();

  /*
   * Phase10 Taskbar presentation can be rebound safely.  Do not use one global
   * boolean as the source of truth because the shell DOM can be created or
   * replaced independently of the runtime module.  Each host node owns its
   * own binding marker instead.
   */
  if(clock&&clock.__exosShell32ClockBound!==true){
    clock.onclick=function(e){e=e||window.event;if(e.stopPropagation)e.stopPropagation();e.cancelBubble=true;if(global.state&&state.samAuthenticated&&state.vaultKey)jplopsoft_runBuiltinXsh('calendar',[],null).catch(function(){});return false;};
    clock.__exosShell32ClockBound=true;
  }
  if(start&&start.__exosShell32StartBound!==true){
    start.onmousedown=function(e){e=e||window.event;if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();e.returnValue=false;e.cancelBubble=true;return false;};
    start.onclick=function(e){e=e||window.event;if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();e.returnValue=false;e.cancelBubble=true;return shellToggleStartMenu();};
    start.__exosShell32StartBound=true;
  }
  if(taskbar&&taskbar.__exosShell32ContextBound!==true){
    taskbar.oncontextmenu=function(e){e=e||window.event;return shellTaskbarContextMenu(e,shellTaskbarTargetAppId(taskbar,e.target||e.srcElement));};
    taskbar.__exosShell32ContextBound=true;
  }

  complete=!!(clock&&start&&taskbar);
  SHELL.taskbarBound=complete;
  shellUpdateTaskbarClock();
  if(!SHELL.clockTimer)SHELL.clockTimer=window.setInterval(function(){
    var c=document.getElementById('jplopsoft_taskbarClock'),s=document.getElementById('jplopsoft_startBtn'),t=document.getElementById('jplopsoft_taskbar');
    try{
      if(!c||!s||!t||c.__exosShell32ClockBound!==true||s.__exosShell32StartBound!==true||t.__exosShell32ContextBound!==true){
        shellBindTaskbarPresentation();
      }else{
        shellUpdateTaskbarClock();
      }
    }catch(ignoreTaskbarHeartbeat){}
  },1000);

  /* A late/replaced Taskbar DOM must heal without moving presentation back to exos.js. */
  if(!complete&&!SHELL.taskbarRetryTimer){
    SHELL.taskbarRetryTimer=window.setTimeout(function(){SHELL.taskbarRetryTimer=0;shellBindTaskbarPresentation();},100);
  }
  return complete;
}
function shellBootstrapTaskbarPresentation(){
  if(SHELL.taskbarBootstrapStarted)return true;
  SHELL.taskbarBootstrapStarted=true;
  function attempt(){
    try{shellBindTaskbarPresentation();}
    catch(ignoreTaskbarBootstrap){
      if(!SHELL.taskbarRetryTimer){
        SHELL.taskbarRetryTimer=window.setTimeout(function(){SHELL.taskbarRetryTimer=0;attempt();},100);
      }
    }
  }
  if(document.readyState==='loading'&&document.addEventListener){
    document.addEventListener('DOMContentLoaded',function(){window.setTimeout(attempt,0);},false);
  }else{
    window.setTimeout(attempt,0);
  }
  return true;
}
function shellNotificationHost(){
  var h=document.getElementById('jplopsoft_shellNotifications');if(h)return h;
  h=document.createElement('div');h.id='jplopsoft_shellNotifications';h.setAttribute('aria-live','polite');h.setAttribute('aria-atomic','false');h.style.cssText='position:fixed;right:12px;bottom:52px;z-index:2147483000;width:min(360px,calc(100vw - 24px));display:flex;flex-direction:column;gap:8px;pointer-events:none;font-family:Segoe UI,Microsoft JhengHei,Arial,sans-serif;';(document.body||document.documentElement).appendChild(h);return h;
}
function shellPositionNotificationHost(){
  var h=document.getElementById('jplopsoft_shellNotifications'),p=shellNormalizeDesktopPersonalization(state&&state.desktopPersonalization?state.desktopPersonalization:null).taskbar_position||'bottom';if(!h)return;
  h.style.left='';h.style.right='';h.style.top='';h.style.bottom='';
  if(p==='top'){h.style.right='12px';h.style.top='52px';}else if(p==='left'){h.style.left='52px';h.style.bottom='12px';}else if(p==='right'){h.style.right='52px';h.style.bottom='12px';}else{h.style.right='12px';h.style.bottom='52px';}
}
function shellShowNotification(ctx,spec){
  spec=spec&&typeof spec==='object'?spec:{};var h=shellNotificationHost(),id='shell_notice_'+(++SHELL.notificationSeq),card=document.createElement('div'),head=document.createElement('div'),body=document.createElement('div'),icon=document.createElement('span'),text=document.createElement('div'),title=document.createElement('div'),msg=document.createElement('div'),timeout=Math.max(1200,Math.min(30000,parseInt(spec.timeout,10)||4500));
  shellPositionNotificationHost();card.id=id;card.style.cssText='pointer-events:auto;background:rgba(20,24,31,.97);color:#f8fafc;border:1px solid rgba(148,163,184,.45);border-radius:6px;box-shadow:0 12px 30px rgba(0,0,0,.34);overflow:hidden;cursor:default;';head.style.cssText='display:flex;gap:10px;align-items:flex-start;padding:12px 13px;';icon.style.cssText='width:28px;height:28px;flex:0 0 28px;display:flex;align-items:center;justify-content:center;';icon.setAttribute('data-exfs-svg',String(spec.icon||'info'));icon.setAttribute('data-exfs-svg-size','24');text.style.cssText='min-width:0;flex:1;';title.style.cssText='font-weight:700;font-size:13px;line-height:1.35;';title.textContent=String(spec.title||'ExOS');msg.style.cssText='margin-top:3px;font-size:12px;line-height:1.5;color:#dbeafe;white-space:pre-wrap;overflow-wrap:anywhere;';msg.textContent=String(spec.message||'');text.appendChild(title);text.appendChild(msg);head.appendChild(icon);head.appendChild(text);card.appendChild(head);h.appendChild(card);try{if(typeof jplopsoft_applySvgIcons==='function')jplopsoft_applySvgIcons(card);}catch(ignoreIcon){}
  function remove(){try{if(card.parentNode)card.parentNode.removeChild(card);}catch(ignoreRemove){}delete SHELL.notifications[id];}
  card.onclick=remove;SHELL.notifications[id]={node:card,timer:window.setTimeout(remove,timeout)};return{id:id,shown:true,timeout:timeout};
}
function shellDismissNotifications(){var k,r;for(k in SHELL.notifications)if(Object.prototype.hasOwnProperty.call(SHELL.notifications,k)){r=SHELL.notifications[k];try{if(r.timer)window.clearTimeout(r.timer);}catch(ignoreTimer){}try{if(r.node&&r.node.parentNode)r.node.parentNode.removeChild(r.node);}catch(ignoreNode){}}SHELL.notifications={};var h=document.getElementById('jplopsoft_shellNotifications');if(h&&h.parentNode)h.parentNode.removeChild(h);return true;}
function shellSessionReady(){
  if(!state||!state.samAuthenticated||!state.vaultKey)return false;
  jplopsoft_runBuiltinXsh('shell_session_notify',[],null).catch(function(){});return true;
}
function shellRunStartupApps(){
  var paths=[
    'C:\\Users\\'+String(state&&state.samUsername?state.samUsername:'administrator')+'\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup',
    'C:\\Users\\Public\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup'
  ],i,id,nodes,j,n,path,count=0;
  for(i=0;i<paths.length;i++){
    try{id=jplopsoft_exfsResolveFolderId(paths[i],0);}catch(ignoreResolve){id=0;}
    if(!(id>0))continue;
    nodes=state&&state.nodes?state.nodes:[];
    for(j=0;j<nodes.length;j++){
      n=nodes[j];
      if(parseInt(n.parent_id,10)!==parseInt(id,10)||n.type!=='file')continue;
      try{
        path=jplopsoft_exfsNodeFullPath(n);
        Promise.resolve(shellOpenPathFromHost(path)).catch(function(){});
        count++;
      }catch(ignoreStartupItem){}
    }
  }
  return count;
}
function shellMimeForName(name){var ext=shellExtension(name),m={jpg:'image/jpeg',jpeg:'image/jpeg',jfif:'image/jpeg',png:'image/png',gif:'image/gif',ico:'image/x-icon',webp:'image/webp',bmp:'image/bmp',zip:'application/zip','7z':'application/x-7z-compressed',rar:'application/vnd.rar',exe:'application/vnd.microsoft.portable-executable',dll:'application/octet-stream',dat:'application/octet-stream',bin:'application/octet-stream',tar:'application/x-tar',gz:'application/gzip',mp3:'audio/mpeg',mp4:'video/mp4',wav:'audio/wav',m4a:'audio/mp4',aac:'audio/aac',flac:'audio/flac',ogg:'audio/ogg',webm:'video/webm',mov:'video/quicktime',avi:'video/x-msvideo'};return m[ext]||'application/octet-stream';}
function shellSaveBlobObject(name,blob){var URLObj=window.URL||window.webkitURL,a=document.createElement('a'),url='';if(!URLObj||!URLObj.createObjectURL)throw new Error('Browser download API is unavailable.');url=URLObj.createObjectURL(blob);a.href=url;a.download=String(name||'download.bin');a.style.display='none';document.body.appendChild(a);try{a.click();}finally{window.setTimeout(function(){try{if(a.parentNode)a.parentNode.removeChild(a);}catch(ignoreA){}try{URLObj.revokeObjectURL(url);}catch(ignoreUrl){}},1200);}return true;}
function shellDownloadNode(node){
  if(!state.vaultKey)throw new Error('Vault is locked.');if(!node||node.type!=='file')throw new Error('Download requires a file.');var name=jplopsoft_decName(node),fmt;if(name===null)throw new Error('File name cannot be decrypted.');if(jplopsoft_nodeIsLargeFile(node)){jplopsoft_downloadLargeFile(node,name);return true;}fmt=jplopsoft_fileFormatFromName(name);jplopsoft_setStatus('正在載入「'+jplopsoft_htmlEscape(name)+'」的加密內容…');jplopsoft_fetchNodeContent(node.id,function(err,out){var payload,fek,blob;if(err){jplopsoft_user32MessageBox(err.message,'ExOS Shell');return;}try{fek=jplopsoft_nodeFekById(node.id);if(jplopsoft_binaryFormat(fmt)){payload=jplopsoft_decBinaryCipher(out.content_enc,fek);if(payload===null)throw new Error('Binary 內容無法解密。');blob=new Blob([new Uint8Array(payload)],{type:shellMimeForName(name)});}else{payload=jplopsoft_decContentCipher(out.content_enc,fek);if(payload===null)throw new Error('文件內容無法解密。');blob=new Blob([String(payload||'')],{type:fmt==='html'?'text/html;charset=utf-8':fmt==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'});}shellSaveBlobObject(name,blob);jplopsoft_setStatus('已下載「'+jplopsoft_htmlEscape(name)+'」。');}catch(e){jplopsoft_user32MessageBox(String(e&&e.message?e.message:e),'ExOS Shell');}},null,'DOWNLOAD');return true;
}
function shellDownloadPath(ctx,path){var n=shellResolve(ctx,String(path||''));if(!n||n.type!=='file')throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Download file not found.');return shellDownloadNode(n);}
async function shellOpenRegisteredPath(ctx,path){
  var n=shellResolve(ctx,String(path||'')),name,ext,child,app,protection,p;if(!n)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Path not found.');p=jplopsoft_xshNodePath(n)||String(path||'');if(n.type==='folder'){child=await jplopsoft_runBuiltinXsh('explorer',[p||'C:\\'],ctx);return{ok:true,pid:child.pid,path:p};}name=String(jplopsoft_decName(n)||'');ext=shellExtension(name);
  if(ext==='xsh'){child=await jplopsoft_runXshNode(n.id,'',ctx&&ctx.process?ctx.process:null);return{ok:true,pid:child.pid,imagePath:child.imagePath,executable:true,path:p};}
  if(ext==='html'||ext==='htm')app='htmlview';else if(['png','jpg','jpeg','jfif','gif','webp','bmp','ico'].indexOf(ext)>=0)app='image_viewer';else if(['mp3','wav','ogg','m4a','aac','flac'].indexOf(ext)>=0)app='audio_preview';else if(['mp4','webm','mov','m4v','avi','mpg','mpeg','h264','264','avc'].indexOf(ext)>=0)app='video_preview';else if(ext==='txt')app='notepad';else if(ext==='csv')app='csvedit';else if(ext==='zip')app='zipfolder';else throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'No registered XSH viewer for this file type.');
  protection=n.has_motw?(app==='htmlview'?'Sandbox+MOTW+WebView':'Sandbox+MOTW'):(app==='htmlview'?'Sandbox+WebView':'Sandbox');child=await jplopsoft_runBuiltinXsh(app,[p],ctx,{integrity:n.has_motw?'LOW':'MEDIUM',protection:protection});return{ok:true,pid:child.pid,path:p,application:app};
}
async function shellOpenPath(ctx,path){return await shellExecute(ctx,String(path||''),'open','');}
function shellOpenPathFromHost(path){return shellOpenPath(shellHostContext(),String(path||''));}

function shellEnsureArray(value){
  if(Object.prototype.toString.call(value)==='[object Array]'){
    return value.slice();
  }

  if(value===undefined||value===null||value===''){
    return[];
  }

  return[value];
}

function shellNormalizePath(path){
  var p=String(path||'')
    .replace(/\//g,'\\')
    .replace(/\\{2,}/g,'\\');

  if(/^[A-Za-z]:$/.test(p))p+='\\';

  if(p.length>3){
    p=p.replace(/\\+$/,'');
  }

  return p;
}

function shellBaseName(path){
  var p=shellNormalizePath(path),
      i=p.lastIndexOf('\\');

  return i>=0
    ?p.substring(i+1)
    :p;
}

function shellParentPath(path){
  var p=shellNormalizePath(path),
      i;

  if(/^[A-Za-z]:\\$/i.test(p))return'';

  i=p.lastIndexOf('\\');

  return i<=2
    ?p.substring(0,2)+'\\'
    :p.substring(0,i);
}

function shellJoinPath(base,name){
  var b=shellNormalizePath(base),
      n=String(name||'').replace(/[\\\/]+/g,'');

  if(!n)return b;

  return /^[A-Za-z]:\\$/.test(b)
    ?b+n
    :b+'\\'+n;
}

function shellQuote(value){
  var s=String(value||'');

  return /[\s"]/g.test(s)
    ?'"'+s.replace(/"/g,'\\"')+'"'
    :s;
}

function shellExtension(path){
  var n=shellBaseName(path),
      i=n.lastIndexOf('.');

  return i>0
    ?n.substring(i+1).toLowerCase()
    :'';
}

function shellTypeName(path,isDirectory){
  var ext;

  if(isDirectory)return'檔案資料夾';

  ext=shellExtension(path);

  if(ext==='txt')return'文字文件';
  if(ext==='csv')return'CSV 文件';
  if(ext==='html'||ext==='htm')return'HTML 文件';
  if(ext==='xsh')return'ExOS XSH 應用程式';
  if(ext==='xba')return'ExOS Batch 批次檔';
  if(ext==='png'||ext==='jpg'||ext==='jpeg'||ext==='jfif'||ext==='gif'||ext==='webp'||ext==='bmp')return'圖片';
  if(ext==='mp3'||ext==='wav'||ext==='ogg'||ext==='m4a')return'音訊';
  if(ext==='mp4'||ext==='webm'||ext==='mov')return'影片';
  if(ext==='pdf')return'PDF 文件';
  if(ext==='zip')return'ZIP 壓縮資料夾';

  return ext
    ?ext.toUpperCase()+' 檔案'
    :'檔案';
}

function shellIconName(path,isDirectory){
  var ext;

  if(isDirectory)return'folder';

  ext=shellExtension(path);

  if(ext==='txt')return'txt';
  if(ext==='csv')return'csv';
  if(ext==='html'||ext==='htm')return'html';
  if(ext==='xsh'||ext==='xba')return'cmd';
  if(ext==='png'||ext==='jpg'||ext==='jpeg'||ext==='jfif'||ext==='gif'||ext==='webp'||ext==='bmp')return'image';
  if(ext==='mp3'||ext==='wav'||ext==='ogg'||ext==='m4a')return'media';
  if(ext==='mp4'||ext==='webm'||ext==='mov')return'media';
  if(ext==='zip')return'zipfolder';

  return'file';
}

function shellResolve(ctx,path){
  var p=shellNormalizePath(path),
      spec=jplopsoft_xshPathSpec(ctx,p),
      node;

  if(spec.kind!=='exfs'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'shell32.dll exposes ExFS volumes and active DOS-device/SUBST aliases only.'
    );
  }

  node=jplopsoft_xshResolveC(
    ctx,
    p,
    false
  );

  return node||null;
}

function shellAssociation(path){
  var ext=shellExtension(path),
      key=ext?'.'+ext:'',
      table=
        typeof state!=='undefined'&&
        state&&
        state.fileAssociations
          ?state.fileAssociations
          :{},
      rec=null;

  if(key&&table){
    rec=
      table[key]||
      table[ext]||
      null;
  }

  if(ext==='zip'){
    return{
      extension:'.zip',registered:true,
      association:{progId:'CompressedFolder',handler:'zipfldr.dll',shellNamespace:true},
      defaultVerb:'open',shellNamespace:true
    };
  }

  return{
    extension:key,
    registered:!!rec,
    association:rec,
    defaultVerb:'open'
  };
}

function shellInfo(ctx,path){
  var p=shellNormalizePath(path),
      raw=jplopsoft_xshResolveC(ctx,p,false,true),
      node=raw&&raw.type==='reparse_point'?jplopsoft_resolveClientNode(raw):raw,
      directory,size,name,targetNode,targetPath='',logicalPath,logicalExt;
  if(!raw||!node)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Shell object not found: '+p);
  directory=node.type==='folder';
  size=parseInt(node.original_size,10)||0;
  name=raw.root?'本機磁碟 (C:)':String(jplopsoft_decName(raw)||shellBaseName(p));
  if(raw.type==='reparse_point'){
    targetNode=jplopsoft_findNode(parseInt(raw.reparse_target,10)||0);
    targetPath=targetNode?jplopsoft_xshNodePath(targetNode):'';
  }
  logicalPath=raw.type==='reparse_point'&&targetPath?targetPath:p;
  logicalExt=directory?'':shellExtension(logicalPath);
  return{
    path:p,name:name,directory:directory,size:size,
    extension:logicalExt,
    typeName:raw.type==='reparse_point'?(directory?'資料夾捷徑':'檔案捷徑'):shellTypeName(p,directory),
    icon:raw.type==='reparse_point'?'link':shellIconName(p,directory),
    nodeId:raw.root?0:(parseInt(raw.id,10)||0),
    targetNodeId:raw.type==='reparse_point'?(parseInt(node.id,10)||0):0,
    reparsePoint:raw.type==='reparse_point',
    reparseTag:raw.type==='reparse_point'?String(raw.reparse_tag||'SYMLINK'):'',
    reparseTarget:targetPath,
    attributes:{directory:directory,reparsePoint:raw.type==='reparse_point',hidden:false,system:false,readOnly:false},
    filesystem:'ExFS',backingVdo:'PHP /_exfs/',
    markOfTheWeb:!directory&&!!node.has_motw,blocked:!directory&&!!node.has_motw,zoneId:!directory&&node.has_motw?3:0,
    association:shellAssociation(logicalPath),compressedFolder:!directory&&logicalExt==='zip',shellNamespace:!directory&&logicalExt==='zip'?'zipfldr':''
  };
}

async function shellInfoWithImage(ctx,path){
  var info=shellInfo(ctx,path),text,image;
  if(info.directory)return info;
  if(info.extension!=='xsh')return info;
  try{
    text=await jplopsoft_xshReadTextFile(ctx,info.path);
    image=jplopsoft_xshParseImage(String(text||''),info.path);
    if(image&&image.icon)info.icon=String(image.icon);
  }catch(ignoreXshIcon){}
  return info;
}

function shellEnsureStyle(){
  var style;

  if(SHELL.styleReady)return;

  SHELL.styleReady=true;

  style=document.createElement('style');
  style.type='text/css';
  style.textContent=
    '.jplopsoft_shell32_menu{position:fixed;min-width:210px;max-width:320px;padding:4px 0;background:#fff;border:1px solid #aeb7c2;box-shadow:0 8px 28px rgba(15,23,42,.28);z-index:2147483000;font:13px "Segoe UI",Arial,sans-serif;color:#111827;user-select:none}'+
    '.jplopsoft_shell32_menu_item{display:flex;align-items:center;gap:8px;min-height:28px;padding:4px 20px 4px 12px;box-sizing:border-box;white-space:nowrap;cursor:default}'+
    '.jplopsoft_shell32_menu_item:hover{background:#eaf2ff}'+
    '.jplopsoft_shell32_menu_item[data-disabled="1"]{color:#9ca3af;background:transparent}'+
    '.jplopsoft_shell32_menu_item[data-default="1"]{font-weight:600}'+
    '.jplopsoft_shell32_menu_sep{height:1px;background:#e5e7eb;margin:4px 5px}'+
    '.jplopsoft_shell32_menu_icon{width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 17px}'+
    '.jplopsoft_shell32_menu_label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}'+
    '.jplopsoft_shell32_menu_arrow{width:12px;margin-left:auto;text-align:right;color:#475569;font-size:15px}'+
    '.jplopsoft_shell32_browse_backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.28);z-index:2147483050;font:13px "Segoe UI",Arial,sans-serif;color:#111827}'+
    '.jplopsoft_shell32_browse{width:min(620px,92vw);height:min(610px,86vh);display:flex;flex-direction:column;background:#fff;border:1px solid #94a3b8;box-shadow:0 18px 54px rgba(15,23,42,.35)}'+
    '.jplopsoft_shell32_browse_head{padding:12px 14px 8px;font-weight:600;font-size:15px;border-bottom:1px solid #e5e7eb}'+
    '.jplopsoft_shell32_browse_prompt{padding:8px 14px;color:#475569}'+
    '.jplopsoft_shell32_browse_path{display:flex;gap:8px;align-items:center;padding:0 14px 10px}'+
    '.jplopsoft_shell32_browse_path span{flex:1;min-width:0;padding:7px 9px;border:1px solid #cbd5e1;background:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.jplopsoft_shell32_browse button{font:inherit;min-height:30px;padding:4px 12px;border:1px solid #aeb7c2;background:#f8fafc;cursor:default}'+
    '.jplopsoft_shell32_browse button:hover{background:#eaf2ff}'+
    '.jplopsoft_shell32_browse_list{flex:1;min-height:0;overflow:auto;margin:0 14px;border:1px solid #cbd5e1;background:#fff}'+
    '.jplopsoft_shell32_browse_row{display:flex;align-items:center;gap:8px;min-height:32px;padding:5px 10px;border-bottom:1px solid #f1f5f9;cursor:default}'+
    '.jplopsoft_shell32_browse_row:hover{background:#f8fafc}'+
    '.jplopsoft_shell32_browse_row[data-selected="1"]{background:#dbeafe;color:#1d4ed8}'+
    '.jplopsoft_shell32_browse_foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e5e7eb}'+
    '.jplopsoft_taskbar-apps{display:flex;align-items:stretch;overflow:hidden;padding:0 2px}'+
    '.jplopsoft_taskbar-app{position:relative;height:40px;min-width:120px;max-width:240px;border:0;border-radius:0;border-bottom:2px solid #60a5fa;background:rgba(255,255,255,.035);color:#f8fafc;padding:0 11px;display:flex;align-items:center;gap:8px;font-family:Segoe UI,Microsoft JhengHei,sans-serif;text-align:left;overflow:hidden}'+
    '.jplopsoft_taskbar-app:hover{background:#334155}.jplopsoft_taskbar-app.jplopsoft_active{background:#475569;border-bottom-color:#93c5fd}.jplopsoft_taskbar-app.jplopsoft_minimized{background:rgba(255,255,255,.02)}'+
    '.jplopsoft_taskbar-app-icon{width:22px;min-width:22px;text-align:center;font-family:Segoe UI Symbol,Segoe UI,Microsoft JhengHei,sans-serif;font-size:15px}.jplopsoft_taskbar-app-text{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}'+
    'body.jplopsoft_taskbar-left .jplopsoft_taskbar-apps,body.jplopsoft_taskbar-right .jplopsoft_taskbar-apps{width:52px;min-width:52px;flex:1;flex-direction:column;align-items:stretch;padding:2px 0;overflow:hidden}'+
    'body.jplopsoft_taskbar-left .jplopsoft_taskbar-app,body.jplopsoft_taskbar-right .jplopsoft_taskbar-app{width:52px;min-width:52px;max-width:52px;height:48px;min-height:48px;padding:0;justify-content:center;border-bottom:0;border-left:2px solid #60a5fa}body.jplopsoft_taskbar-right .jplopsoft_taskbar-app{border-left:0;border-right:2px solid #60a5fa}body.jplopsoft_taskbar-left .jplopsoft_taskbar-app-text,body.jplopsoft_taskbar-right .jplopsoft_taskbar-app-text{display:none}body.jplopsoft_taskbar-left .jplopsoft_taskbar-app-icon,body.jplopsoft_taskbar-right .jplopsoft_taskbar-app-icon{width:24px;min-width:24px}'+
    '@media(max-width:800px){.jplopsoft_taskbar-app{min-width:46px;max-width:150px;padding:0 8px}.jplopsoft_taskbar-app-icon{width:20px;min-width:20px}}'+
    '.jplopsoft_shell32_clipboard_menu{position:fixed;z-index:2147483200;width:220px;padding:4px 0;border:1px solid #aeb7c2;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.32);font:13px "Segoe UI","Microsoft JhengHei",sans-serif;color:#111827}'+
    '.jplopsoft_shell32_clipboard_item{width:100%;height:30px;border:0;background:#fff;padding:0 12px;display:flex;align-items:center;justify-content:space-between;text-align:left;color:#111827}.jplopsoft_shell32_clipboard_item:hover{background:#eaf2ff}.jplopsoft_shell32_clipboard_item kbd{font:11px Consolas,monospace;color:#64748b;background:transparent}.jplopsoft_shell32_clipboard_sep{height:1px;background:#e5e7eb;margin:4px 6px}.jplopsoft_shell32_clipboard_button{background-color:transparent}';

  document.getElementsByTagName('head')[0]
    .appendChild(style);
}

function shellMenuItem(verb,text,enabled,options){
  options=options||{};

  return{
    verb:String(verb||''),
    text:String(text||''),
    enabled:enabled!==false,
    separator:false,
    default:!!options.default,
    icon:String(options.icon||''),
    submenu:Array.isArray(options.submenu)?options.submenu:[]
  };
}

function shellSeparator(){
  return{
    verb:'',
    text:'',
    enabled:false,
    separator:true,
    default:false,
    icon:''
  };
}

function shellContextMenu(ctx,paths,options){
  var list=shellEnsureArray(paths)
        .map(shellNormalizePath)
        .filter(function(x){return!!x;}),
      opt=options||{},
      background=!!opt.background,
      infos=[],
      files=[],
      dirs=[],
      items=[],
      i;

  for(i=0;i<list.length;i++){
    try{
      infos.push(shellInfo(ctx,list[i]));
    }catch(ignoreMissing){}
  }

  files=infos.filter(function(x){return!x.directory;});
  dirs=infos.filter(function(x){return x.directory;});

  if(background){
    items.push(shellMenuItem('refresh','重新整理',true,{icon:'refresh'}));
    items.push(shellSeparator());
    items.push(shellMenuItem('newfolder','新增資料夾',true,{icon:'folder'}));
    items.push(shellMenuItem('newtext','新增文字文件',true,{icon:'txt'}));
    items.push(shellMenuItem('newcsv','新增 CSV',true,{icon:'csv'}));
    items.push(shellMenuItem('newhtml','新增 HTML',true,{icon:'html'}));
    items.push(shellMenuItem('newxsh','新增 XSH',true,{icon:'cmd'}));
    items.push(shellSeparator());
    items.push(
      shellMenuItem(
        'paste',
        '貼上',
        SHELL.clipboard.paths.length>0,
        {icon:'paste'}
      )
    );
    items.push(shellSeparator());
    items.push(shellMenuItem('cmdhere','在此開啟命令提示字元',true,{icon:'cmd'}));
    items.push(shellSeparator());
    items.push(shellMenuItem('personalize','個人化',true,{icon:'control'}));

    return{
      paths:list,
      background:true,
      items:items
    };
  }

  if(infos.length===1){
    items.push(
      shellMenuItem(
        'open',
        infos[0].directory?'開啟':'開啟',
        true,
        {
          default:true,
          icon:infos[0].icon
        }
      )
    );

    if(!infos[0].directory){
      items.push(shellMenuItem('edit','編輯',true,{icon:'edit'}));
      items.push(shellMenuItem('download','下載',true,{icon:'download'}));
    }
    if(infos[0].reparsePoint){
      items.push(shellMenuItem('openlocation','開啟目標位置',true,{icon:'folder'}));
    }

    if(infos[0].directory){
      items.push(shellMenuItem('cmdhere','在此開啟命令提示字元',true,{icon:'cmd'}));
    }
    if(!infos[0].directory&&infos[0].extension==='zip'){
      items.push(shellMenuItem('extractall','全部解壓縮…',true,{icon:'folder'}));
    }

    items.push(shellSeparator());
  }else if(infos.length>1){
    if(files.length){
      items.push(shellMenuItem('download','下載選取的檔案',true,{icon:'download'}));
      items.push(shellSeparator());
    }
  }

  items.push(shellMenuItem('cut','剪下',infos.length>0,{icon:'cut'}));
  items.push(shellMenuItem('copy','複製',infos.length>0,{icon:'copy'}));
  items.push(shellMenuItem('move','移動到…',infos.length>0,{icon:'folder'}));
  if(infos.length===1)items.push(shellMenuItem('createshortcut','建立捷徑',true,{icon:'link'}));
  if(dirs.length===1&&infos.length===1&&!/^C:\\$/i.test(infos[0].path))items.push(shellMenuItem('compresszip','壓縮成 ZIP',true,{icon:'zipfolder'}));
  if(infos.length>0){
    items.push(shellMenuItem('sendto','傳送到…',true,{icon:'copy',submenu:[
      shellMenuItem('sendto_desktop_shortcut','桌面（建立捷徑）',true,{icon:'desktop'}),
      shellMenuItem('sendto_documents','文件',true,{icon:'folder'}),
      shellMenuItem('sendto_downloads','下載',true,{icon:'download'}),
      shellSeparator(),
      shellMenuItem('sendto_zip','壓縮的 (zipped) 資料夾',true,{icon:'zipfolder'})
    ]}));
  }

  if(dirs.length===1&&infos.length===1&&SHELL.clipboard.paths.length){
    items.push(shellMenuItem('paste','貼上到此資料夾',true,{icon:'paste'}));
  }

  items.push(shellSeparator());

  if(infos.length===1&&/^C:\\$/i.test(infos[0].path)){
    items.push(shellMenuItem('renamevolume','重新命名磁碟',true,{icon:'rename'}));
  }else{
    items.push(
      shellMenuItem(
        'rename',
        '重新命名',
        infos.length===1,
        {icon:'rename'}
      )
    );
  }

  items.push(
    shellMenuItem(
      'delete',
      infos.length>1?'刪除選取項目':'刪除',
      infos.length>0,
      {icon:'delete'}
    )
  );

  items.push(shellSeparator());

  items.push(
    shellMenuItem(
      'properties',
      infos.length>1?'內容摘要':'內容',
      infos.length>0,
      {icon:'properties'}
    )
  );

  return{
    paths:infos.map(function(x){return x.path;}),
    background:false,
    items:items
  };
}

function shellTrackContextMenu(ctx,paths,x,y,options){
  return new Promise(function(resolve){
    var model=shellContextMenu(ctx,paths,options),menu=null,subMenu=null,closed=false,clickAway,keyDown,left,top;
    shellEnsureStyle();
    function removeSubmenu(){if(!subMenu)return;try{if(subMenu.parentNode)subMenu.parentNode.removeChild(subMenu);}catch(ignoreSubmenuRemove){}subMenu=null;}
    function renderEntries(host,entries,isSubmenu){
      var i,item;
      for(i=0;i<entries.length;i++){
        item=entries[i];
        if(item.separator){var sep=document.createElement('div');sep.className='jplopsoft_shell32_menu_sep';host.appendChild(sep);continue;}
        (function(entry){
          var row=document.createElement('div'),icon=document.createElement('span'),label=document.createElement('span'),arrow=null;
          row.className='jplopsoft_shell32_menu_item';row.setAttribute('data-disabled',entry.enabled?'0':'1');row.setAttribute('data-default',entry.default?'1':'0');
          icon.className='jplopsoft_shell32_menu_icon';
          if(entry.icon&&typeof jplopsoft_svgIconApply==='function'){try{jplopsoft_svgIconApply(icon,entry.icon,16);}catch(ignoreIcon){}}
          label.className='jplopsoft_shell32_menu_label';label.textContent=entry.text;row.appendChild(icon);row.appendChild(label);
          if(entry.submenu&&entry.submenu.length){arrow=document.createElement('span');arrow.className='jplopsoft_shell32_menu_arrow';arrow.textContent='›';row.appendChild(arrow);}
          function openChild(e){
            if(!entry.enabled||!entry.submenu||!entry.submenu.length)return;
            try{if(e)e.stopPropagation();}catch(ignoreStop){}
            removeSubmenu();subMenu=document.createElement('div');subMenu.className='jplopsoft_shell32_menu';subMenu.setAttribute('data-shell-submenu','1');renderEntries(subMenu,entry.submenu,true);document.body.appendChild(subMenu);
            try{var rr=row.getBoundingClientRect(),sr=subMenu.getBoundingClientRect(),sl=rr.right-1,st=rr.top;if(sl+sr.width>window.innerWidth)sl=Math.max(0,rr.left-sr.width+1);if(st+sr.height>window.innerHeight)st=Math.max(0,window.innerHeight-sr.height-6);subMenu.style.left=Math.max(0,sl)+'px';subMenu.style.top=Math.max(0,st)+'px';}catch(ignoreSubmenuClamp){}
          }
          row.onmouseenter=function(){if(entry.submenu&&entry.submenu.length)openChild();else if(!isSubmenu)removeSubmenu();};
          row.onclick=function(e){try{e.stopPropagation();}catch(ignoreClickStop){}if(!entry.enabled)return;if(entry.submenu&&entry.submenu.length){openChild(e);return;}finish(entry.verb);};
          host.appendChild(row);
        })(item);
      }
    }
    menu=document.createElement('div');menu.className='jplopsoft_shell32_menu';menu.setAttribute('data-shell-menu-id',String(++SHELL.menuSeq));renderEntries(menu,model.items,false);document.body.appendChild(menu);
    left=Math.max(0,parseInt(x,10)||0);top=Math.max(0,parseInt(y,10)||0);menu.style.left=left+'px';menu.style.top=top+'px';
    window.setTimeout(function(){try{var r=menu.getBoundingClientRect();if(r.right>window.innerWidth)menu.style.left=Math.max(0,window.innerWidth-r.width-6)+'px';if(r.bottom>window.innerHeight)menu.style.top=Math.max(0,window.innerHeight-r.height-6)+'px';}catch(ignoreClamp){}},0);
    function finish(verb){if(closed)return;closed=true;removeSubmenu();try{document.removeEventListener('mousedown',clickAway,true);}catch(ignoreMouseRemove){}try{document.removeEventListener('keydown',keyDown,true);}catch(ignoreKeyRemove){}try{if(menu&&menu.parentNode)menu.parentNode.removeChild(menu);}catch(ignoreMenuRemove){}resolve(String(verb||''));}
    clickAway=function(e){if(menu&&menu.contains(e.target))return;if(subMenu&&subMenu.contains(e.target))return;finish('');};
    keyDown=function(e){if(String(e.key||'')==='Escape')finish('');};
    window.setTimeout(function(){document.addEventListener('mousedown',clickAway,true);document.addEventListener('keydown',keyDown,true);},0);
  });
}

function shellTrackPopupMenu(items,x,y){
  return new Promise(function(resolve){
    var entries=Array.isArray(items)?items:[],menu=null,closed=false,clickAway,keyDown,left,top;
    shellEnsureStyle();
    function finish(verb){
      if(closed)return;closed=true;
      try{document.removeEventListener('mousedown',clickAway,true);}catch(ignoreMouseRemove){}
      try{document.removeEventListener('keydown',keyDown,true);}catch(ignoreKeyRemove){}
      try{if(menu&&menu.parentNode)menu.parentNode.removeChild(menu);}catch(ignoreMenuRemove){}
      resolve(String(verb||''));
    }
    menu=document.createElement('div');menu.className='jplopsoft_shell32_menu';menu.setAttribute('data-shell-popup-id',String(++SHELL.menuSeq));
    entries.forEach(function(entry){
      if(!entry)return;
      if(entry.separator){var sep=document.createElement('div');sep.className='jplopsoft_shell32_menu_sep';menu.appendChild(sep);return;}
      var row=document.createElement('div'),icon=document.createElement('span'),label=document.createElement('span'),enabled=entry.enabled!==false;
      row.className='jplopsoft_shell32_menu_item';row.setAttribute('data-disabled',enabled?'0':'1');row.setAttribute('data-default',entry.default?'1':'0');
      icon.className='jplopsoft_shell32_menu_icon';
      if(entry.icon&&typeof jplopsoft_svgIconApply==='function'){try{jplopsoft_svgIconApply(icon,entry.icon,16);}catch(ignoreIcon){}}
      label.className='jplopsoft_shell32_menu_label';label.textContent=String(entry.text||entry.verb||'');row.appendChild(icon);row.appendChild(label);
      row.onclick=function(e){try{e.stopPropagation();}catch(ignoreStop){}if(!enabled)return;finish(entry.verb);};
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    left=Math.max(0,parseInt(x,10)||0);top=Math.max(0,parseInt(y,10)||0);menu.style.left=left+'px';menu.style.top=top+'px';
    window.setTimeout(function(){try{var r=menu.getBoundingClientRect();if(r.right>window.innerWidth)menu.style.left=Math.max(0,window.innerWidth-r.width-6)+'px';if(r.bottom>window.innerHeight)menu.style.top=Math.max(0,window.innerHeight-r.height-6)+'px';}catch(ignoreClamp){}},0);
    clickAway=function(e){if(menu&&menu.contains(e.target))return;finish('');};
    keyDown=function(e){if(String(e.key||'')==='Escape')finish('');};
    window.setTimeout(function(){document.addEventListener('mousedown',clickAway,true);document.addEventListener('keydown',keyDown,true);},0);
  });
}

function shellRect(node){
  var r;
  try{r=node&&node.getBoundingClientRect?node.getBoundingClientRect():null;}catch(ignoreRect){r=null;}
  if(!r)return{left:0,top:0,right:0,bottom:0,width:0,height:0};
  return{left:Number(r.left)||0,top:Number(r.top)||0,right:Number(r.right)||0,bottom:Number(r.bottom)||0,width:Number(r.width)||0,height:Number(r.height)||0};
}

function shellTaskbarInfo(){
  var taskbar=document.getElementById('jplopsoft_taskbar'),start=document.getElementById('jplopsoft_startBtn'),body=document.body,edge='bottom',cls=' '+String(body&&body.className||'')+' ';
  if(cls.indexOf(' jplopsoft_taskbar-top ')>=0)edge='top';
  else if(cls.indexOf(' jplopsoft_taskbar-left ')>=0)edge='left';
  else if(cls.indexOf(' jplopsoft_taskbar-right ')>=0)edge='right';
  return{edge:edge,taskbar:shellRect(taskbar),startButton:shellRect(start),viewport:{width:Number(window.innerWidth)||0,height:Number(window.innerHeight)||0}};
}

function shellSetFlyoutVisual(kind,active){
  var key=String(kind||'').toLowerCase(),b;
  if(key==='start'){
    b=document.getElementById('jplopsoft_startBtn');
    if(b){b.className='jplopsoft_start-btn'+(active?' jplopsoft_active':'');b.setAttribute('aria-expanded',active?'true':'false');}
  }
  return true;
}

function shellFlyoutWindowNode(f){
  var rec,node=null;
  if(!f||!f.hwnd)return null;
  try{rec=typeof global.jplopsoft_user32GetRecord==='function'?global.jplopsoft_user32GetRecord(parseInt(f.hwnd,10)||0):null;}catch(ignoreRecord){rec=null;}
  try{if(rec&&rec.windowId)node=document.getElementById(rec.windowId);}catch(ignoreNode){node=null;}
  return node;
}
function shellHasFlyouts(){
  var k;for(k in SHELL.flyouts)if(Object.prototype.hasOwnProperty.call(SHELL.flyouts,k))return true;return false;
}
function shellRemoveFlyoutDismissListener(){
  if(!SHELL.flyoutDismissBound||!SHELL.flyoutDismissHandler)return true;
  try{document.removeEventListener('mousedown',SHELL.flyoutDismissHandler,true);}catch(ignoreRemove){}
  SHELL.flyoutDismissBound=false;SHELL.flyoutDismissHandler=null;return true;
}
function shellDismissFlyoutRecord(key,f,reason){
  var ctx=null;
  if(!f)return false;
  delete SHELL.flyouts[key];
  shellSetFlyoutVisual(key,false);
  try{ctx=typeof jplopsoft_xshRunByPid==='function'?jplopsoft_xshRunByPid(f.ownerPid):null;}catch(ignoreCtx){ctx=null;}
  try{if(ctx&&!ctx.terminating&&typeof jplopsoft_xshTerminate==='function')jplopsoft_xshTerminate(ctx,0,String(reason||'ShellFlyoutDismissed'),false);}catch(ignoreTerminate){}
  if(!shellHasFlyouts())shellRemoveFlyoutDismissListener();
  return true;
}
function shellEnsureFlyoutDismissListener(){
  if(SHELL.flyoutDismissBound)return true;
  SHELL.flyoutDismissHandler=function(ev){
    var target=ev&&(ev.target||ev.srcElement),start=document.getElementById('jplopsoft_startBtn'),k,f,node;
    if(start&&(target===start||(start.contains&&start.contains(target))))return;
    for(k in SHELL.flyouts){
      if(!Object.prototype.hasOwnProperty.call(SHELL.flyouts,k))continue;
      f=SHELL.flyouts[k];node=shellFlyoutWindowNode(f);
      if(node&&(target===node||(node.contains&&node.contains(target))))return;
    }
    var keys=[];for(k in SHELL.flyouts)if(Object.prototype.hasOwnProperty.call(SHELL.flyouts,k))keys.push(k);
    for(var i=0;i<keys.length;i++){k=keys[i];f=SHELL.flyouts[k];if(f)shellDismissFlyoutRecord(k,f,'ShellFlyoutOutsideClick');}
  };
  try{document.addEventListener('mousedown',SHELL.flyoutDismissHandler,true);SHELL.flyoutDismissBound=true;}catch(ignoreAdd){SHELL.flyoutDismissHandler=null;SHELL.flyoutDismissBound=false;}
  return SHELL.flyoutDismissBound;
}
function shellRegisterFlyout(ctx,kind,hwnd){
  var key=String(kind||'').toLowerCase(),old,oldCtx;
  if(!key)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Flyout kind is required.');
  old=SHELL.flyouts[key];
  if(old&&parseInt(old.ownerPid,10)!==parseInt(ctx.pid,10)){
    try{
      oldCtx=typeof jplopsoft_xshRunByPid==='function'?jplopsoft_xshRunByPid(old.ownerPid):null;
      if(oldCtx&&!oldCtx.terminating&&typeof jplopsoft_xshTerminate==='function')jplopsoft_xshTerminate(oldCtx,0,'ShellFlyoutReplaced',false);
    }catch(ignoreOldFlyout){}
  }
  SHELL.flyouts[key]={kind:key,ownerPid:parseInt(ctx.pid,10)||0,hwnd:parseInt(hwnd,10)||0,openedAt:(new Date()).getTime()};
  shellSetFlyoutVisual(key,true);
  shellEnsureFlyoutDismissListener();
  return{ok:true,kind:key,hwnd:parseInt(hwnd,10)||0};
}

function shellUnregisterFlyout(ctx,kind){
  var key=String(kind||'').toLowerCase(),f=SHELL.flyouts[key];
  if(!f)return true;
  if(ctx&&parseInt(f.ownerPid,10)!==parseInt(ctx.pid,10))throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'Flyout is owned by another process.');
  delete SHELL.flyouts[key];
  shellSetFlyoutVisual(key,false);
  if(!shellHasFlyouts())shellRemoveFlyoutDismissListener();
  return true;
}

function shellStartMenuModel(){
  var root=global.jplopsoft_EXOS_XSH_APPS,apps=root&&root.apps?root.apps:{},visible=[
    'explorer','cmd','control','calc','calendar','taskmgr','regedit','accounts','eventvwr','devmgmt','diskmgmt','paint','notepad','csvedit','html_editor','xsh_editor','volume3d','winmine'
  ],out=[],i,id,a;
  for(i=0;i<visible.length;i++){
    id=visible[i];a=apps[id];if(!a)continue;
    out.push({kind:'app',id:id,appId:id,title:String(a.title||id),description:String(a.description||''),icon:String(a.icon||'app')});
  }
  out.sort(function(a,b){return String(a.title).localeCompare(String(b.title));});
  return{
    version:1,
    pinned:[
      {kind:'path',id:'computer',title:'我的電腦',description:'開啟 ExFS 根目錄',icon:'computer',target:'C:\\'},
      {kind:'app',id:'explorer',appId:'explorer',title:'檔案總管',description:'瀏覽 ExFS 檔案與資料夾',icon:'explorer'},
      {kind:'app',id:'control',appId:'control',title:'控制台',description:'ExOS 系統設定',icon:'control'},
      {kind:'app',id:'cmd',appId:'cmd',title:'指令模式',description:'XSH 命令提示字元',icon:'cmd'},
      {kind:'app',id:'calc',appId:'calc',title:'小算盤',description:'ExOS 小算盤',icon:'calc'},
      {kind:'app',id:'taskmgr',appId:'taskmgr',title:'工作管理員',description:'處理程序與效能',icon:'taskmgr'}
    ],
    apps:out
  };
}

function shellUniqueDestination(ctx,targetFolder,name){
  var base=String(name||''),
      dot=base.lastIndexOf('.'),
      stem=dot>0?base.substring(0,dot):base,
      ext=dot>0?base.substring(dot):'',
      candidate=shellJoinPath(targetFolder,base),
      n=1;

  while(jplopsoft_xshResolveC(ctx,candidate,false)){
    candidate=shellJoinPath(
      targetFolder,
      stem+' ('+n+')'+ext
    );
    n++;
  }

  return candidate;
}


async function shellCreateShortcutAt(ctx,source,destinationFolder){
  var src=shellInfo(ctx,source),base=src.name+' - 捷徑',candidate=base,n=1,dest;
  while(true){dest=shellNormalizePath(destinationFolder+'\\'+candidate);try{shellInfo(ctx,dest);n++;candidate=base+' ('+n+')';}catch(ignoreExistingShortcut){break;}}
  var link=await jplopsoft_xshCreateReparsePoint(ctx,dest,source,'SYMLINK');
  return{path:dest,target:source,id:link.id};
}
async function shellCompressToZip(ctx,list){
  if(!list.length)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'ZIP compression requires at least one object.');
  if(typeof global.jplopsoft_zipfldrDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'zipfldr.dll is unavailable.');
  var first=shellInfo(ctx,list[0]),parent=shellParentPath(list[0]),base=first.name.replace(/\.zip$/i,'')||'Archive',candidate=shellUniqueDestination(ctx,parent,base+'.zip'),opened=null,i;
  await global.jplopsoft_zipfldrDispatch(ctx,'CreateArchive',[candidate]);
  try{
    opened=await global.jplopsoft_zipfldrDispatch(ctx,'OpenArchive',[candidate]);
    for(i=0;i<list.length;i++)await global.jplopsoft_zipfldrDispatch(ctx,'AddPath',[opened.handle,list[i],'']);
    return{ok:true,path:candidate,count:list.length};
  }catch(err){
    try{if(opened&&opened.handle)await global.jplopsoft_zipfldrDispatch(ctx,'CloseArchive',[opened.handle]);}catch(ignoreZipCloseOnError){}
    try{await global.jplopsoft_xshDeleteFile(ctx,candidate);}catch(ignoreZipCleanup){}
    throw err;
  }finally{
    try{if(opened&&opened.handle)await global.jplopsoft_zipfldrDispatch(ctx,'CloseArchive',[opened.handle]);}catch(ignoreZipClose){}
  }
}

async function shellCopyRecursive(ctx,source,destination,depth){
  var info=shellInfo(ctx,source),node=shellResolve(ctx,source),
      children,i,name,target;

  depth=parseInt(depth,10)||0;

  if(depth>48){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Shell copy recursion depth exceeded.'
    );
  }

  if(!node){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Source shell object not found.'
    );
  }

  if(info.reparsePoint){
    await jplopsoft_xshCreateReparsePoint(ctx,destination,info.reparseTarget,info.reparseTag||'SYMLINK');
    return 1;
  }

  if(node.type!=='folder'){
    await jplopsoft_xshCopyFile(
      ctx,
      source,
      destination,
      true
    );

    return 1;
  }

  if(
    shellNormalizePath(destination)===
      shellNormalizePath(source)||
    shellNormalizePath(destination).indexOf(
      shellNormalizePath(source)+'\\'
    )===0
  ){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Cannot copy a directory into itself.'
    );
  }

  await jplopsoft_xshCreateDirectory(
    ctx,
    destination
  );

  children=jplopsoft_xshListDirectory(
    ctx,
    source
  );

  var count=0;

  for(i=0;i<children.length;i++){
    name=String(children[i].name||'');

    target=shellJoinPath(
      destination,
      name
    );

    count+=await shellCopyRecursive(
      ctx,
      children[i].path,
      target,
      depth+1
    );
  }

  return count;
}

async function shellDeleteRecursive(ctx,path,depth){
  var info=shellInfo(ctx,path),node=shellResolve(ctx,path),
      children,i,count=0;

  depth=parseInt(depth,10)||0;

  if(depth>48){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Shell delete recursion depth exceeded.'
    );
  }

  if(!node){
    return 0;
  }

  if(info.reparsePoint){
    if(info.directory)await jplopsoft_xshRemoveDirectory(ctx,path);
    else await jplopsoft_xshDeleteFile(ctx,path);
    return 1;
  }

  if(node.type!=='folder'){
    await jplopsoft_xshDeleteFile(
      ctx,
      path
    );

    return 1;
  }

  children=jplopsoft_xshListDirectory(
    ctx,
    path
  );

  for(i=0;i<children.length;i++){
    count+=await shellDeleteRecursive(
      ctx,
      children[i].path,
      depth+1
    );
  }

  await jplopsoft_xshRemoveDirectory(
    ctx,
    path
  );

  return count;
}

function shellBrowseForFolder(ctx,options){
  var opt=options||{},title=String(opt.title||'瀏覽資料夾'),prompt=String(opt.prompt||'選擇資料夾：'),
      initial=shellNormalizePath(opt.initialDir||opt.initialPath||shellKnownFolder(ctx,'FOLDERID_DESKTOP')),
      okText=String(opt.okText||'確定');
  return new Promise(function(resolve){
    var current=initial,selected=initial,backdrop,box,head,promptNode,pathbar,up,pathText,list,foot,cancel,ok,closed=false,keyDown;
    shellEnsureStyle();
    try{if(!shellResolve(ctx,current)||shellResolve(ctx,current).type!=='folder')current='C:\\';}catch(ignoreInitial){current='C:\\';}
    selected=current;
    function close(result){if(closed)return;closed=true;try{document.removeEventListener('keydown',keyDown,true);}catch(ignoreKey){}try{if(backdrop&&backdrop.parentNode)backdrop.parentNode.removeChild(backdrop);}catch(ignoreRemove){}resolve(result||null);}
    function render(){
      var rows=[],i,item,row,icon,label;
      try{rows=jplopsoft_xshListDirectory(ctx,current)||[];}catch(e){rows=[];}
      pathText.textContent=current;list.innerHTML='';
      for(i=0;i<rows.length;i++){
        item=rows[i];if(!item||!item.directory)continue;
        row=document.createElement('div');row.className='jplopsoft_shell32_browse_row';row.setAttribute('data-selected',shellNormalizePath(selected)===shellNormalizePath(item.path)?'1':'0');
        icon=document.createElement('span');icon.textContent='📁';label=document.createElement('span');label.textContent=String(item.name||shellBaseName(item.path));
        row.appendChild(icon);row.appendChild(label);
        (function(p,r){r.onclick=function(){var all=list.querySelectorAll('.jplopsoft_shell32_browse_row'),k;selected=p;for(k=0;k<all.length;k++)all[k].setAttribute('data-selected',all[k]===r?'1':'0');};r.ondblclick=function(){current=p;selected=p;render();};})(item.path,row);
        list.appendChild(row);
      }
      up.disabled=/^[A-Z]:\\$/i.test(current);
    }
    backdrop=document.createElement('div');backdrop.className='jplopsoft_shell32_browse_backdrop';
    box=document.createElement('div');box.className='jplopsoft_shell32_browse';backdrop.appendChild(box);
    head=document.createElement('div');head.className='jplopsoft_shell32_browse_head';head.textContent=title;box.appendChild(head);
    promptNode=document.createElement('div');promptNode.className='jplopsoft_shell32_browse_prompt';promptNode.textContent=prompt;box.appendChild(promptNode);
    pathbar=document.createElement('div');pathbar.className='jplopsoft_shell32_browse_path';box.appendChild(pathbar);
    up=document.createElement('button');up.type='button';up.textContent='上一層';pathbar.appendChild(up);
    pathText=document.createElement('span');pathbar.appendChild(pathText);
    list=document.createElement('div');list.className='jplopsoft_shell32_browse_list';box.appendChild(list);
    foot=document.createElement('div');foot.className='jplopsoft_shell32_browse_foot';box.appendChild(foot);
    cancel=document.createElement('button');cancel.type='button';cancel.textContent='取消';foot.appendChild(cancel);
    ok=document.createElement('button');ok.type='button';ok.textContent=okText;foot.appendChild(ok);
    up.onclick=function(){if(!/^[A-Z]:\\$/i.test(current)){current=shellParentPath(current);selected=current;render();}};
    cancel.onclick=function(){close(null);};ok.onclick=function(){close({ok:true,path:shellNormalizePath(selected||current)});};
    backdrop.onclick=function(e){if(e.target===backdrop)close(null);};
    keyDown=function(e){if(String(e.key||'')==='Escape'){e.preventDefault();close(null);}else if(String(e.key||'')==='Enter'){e.preventDefault();close({ok:true,path:shellNormalizePath(selected||current)});}};
    document.addEventListener('keydown',keyDown,true);document.body.appendChild(backdrop);render();
  });
}

async function shellRecycleDelete(ctx,paths){
  var list=shellEnsureArray(paths).map(shellNormalizePath).filter(function(x){return!!x;}),ids=[],i,info,out;
  if(!list.length)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Delete requires at least one object.');
  for(i=0;i<list.length;i++){
    info=shellInfo(ctx,list[i]);
    if(!info.nodeId)throw jplopsoft_xshError(jplopsoft_STATUS_ACCESS_DENIED,'The ExFS root cannot be moved to Recycle Bin.');
    ids.push(parseInt(info.nodeId,10)||0);
  }
  out=await jplopsoft_xshApiPromise(ids.length>1?'delete_many':'delete','POST',ids.length>1?{ids:ids}:{id:ids[0]});
  await shellReloadNodesPromise();
  try{shellRenderDesktop();}catch(ignoreDesktopRefresh){}
  return{ok:true,operation:'recycle',completed:parseInt(out&&out.trashed,10)||ids.length,trashed:parseInt(out&&out.trashed,10)||ids.length};
}

async function shellChangeNotify(ctx,eventName,item1,item2){
  await shellReloadNodesPromise();
  try{shellRenderDesktop();}catch(ignoreDesktop){}
  if(typeof global.jplopsoft_xshSendEvent==='function')global.jplopsoft_xshSendEvent(ctx,{event:'shell32',controlId:'SHELL_NOTIFY',action:'change',changeEvent:eventName,item1:item1||null,item2:item2||null});
  return true;
}

async function shellFileOperation(ctx,spec){
  var s=spec||{},
      op=String(
        s.operation||
        s.op||
        ''
      ).toLowerCase(),
      sources=shellEnsureArray(
        s.sources||
        s.source
      )
        .map(shellNormalizePath)
        .filter(function(x){return!!x;}),
      destination=shellNormalizePath(
        s.destination||
        s.target||
        ''
      ),
      i,src,name,dst,count=0;

  if(!sources.length){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'SHFileOperation requires at least one source.'
    );
  }

  if(op==='copy'||op==='move'){
    var targetNode=shellResolve(
      ctx,
      destination
    );

    if(!targetNode||targetNode.type!=='folder'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
        'Destination folder not found.'
      );
    }

    for(i=0;i<sources.length;i++){
      src=sources[i];
      name=shellBaseName(src);

      dst=shellUniqueDestination(
        ctx,
        destination,
        name
      );

      if(op==='move'){
        if(
          shellNormalizePath(
            shellParentPath(src)
          )===
          shellNormalizePath(destination)
        ){
          /*
           * Native shell move inside the same directory is a no-op.
           * Do not manufacture "file (1)" merely because the pointer was
           * dropped on another row in the same ListView.
           */
          continue;
        }

        var srcInfo=shellInfo(
          ctx,
          src
        );

        if(
          srcInfo.directory&&
          (
            shellNormalizePath(destination)===
              shellNormalizePath(src)||
            shellNormalizePath(destination).indexOf(
              shellNormalizePath(src)+'\\'
            )===0
          )
        ){
          throw jplopsoft_xshError(
            jplopsoft_STATUS_INVALID_PARAMETER,
            'Cannot move a directory into itself.'
          );
        }

        await jplopsoft_xshMoveFile(
          ctx,
          src,
          dst
        );
        count++;
      }else{
        count+=await shellCopyRecursive(
          ctx,
          src,
          dst,
          0
        );
      }
    }

    return{
      ok:true,
      operation:op,
      completed:count
    };
  }

  if(op==='delete'){
    for(i=0;i<sources.length;i++){
      count+=await shellDeleteRecursive(
        ctx,
        sources[i],
        0
      );
    }

    return{
      ok:true,
      operation:op,
      completed:count
    };
  }

  if(op==='rename'){
    if(
      sources.length!==1||
      !destination
    ){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Rename requires one source and one destination path.'
      );
    }

    await jplopsoft_xshMoveFile(
      ctx,
      sources[0],
      destination
    );

    return{
      ok:true,
      operation:op,
      completed:1
    };
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported SHFileOperation: '+op
  );
}

async function shellExecute(ctx,path,verb,args){
  var p=shellNormalizePath(path),
      action=String(verb||'open').toLowerCase(),
      info;

  if(action===''||action==='open'||action==='explore'){
    info=shellInfo(ctx,p);

    if(info.directory){
      var child=
        await jplopsoft_runBuiltinXsh(
          'explorer',
          [p],
          ctx
        );

      return{
        ok:true,
        verb:'open',
        pid:child.pid,
        path:p
      };
    }

    if(info.extension==='zip'){
      var zipChild=await jplopsoft_runBuiltinXsh('zipfolder',[p],ctx);
      return{ok:true,verb:'open',pid:zipChild.pid,path:p,compressedFolder:true};
    }

    if(info.extension==='xba'){
      var batchChild=await jplopsoft_runBuiltinXsh(
        'cmd',
        ['/c',shellQuote(p)].concat(shellEnsureArray(args||[])),
        ctx
      );
      return{ok:true,verb:'open',pid:batchChild.pid,path:p,batch:true};
    }

    return await shellOpenRegisteredPath(ctx,p);
  }

  if(action==='edit'){
    info=shellInfo(ctx,p);

    if(info.directory){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'A directory cannot be edited.'
      );
    }

    var ext=info.extension,
        app='notepad';

    if(ext==='csv')app='csvedit';
    if(ext==='html'||ext==='htm')app='html_editor';
    if(ext==='png'||ext==='jpg'||ext==='jpeg'||ext==='jfif'||ext==='gif'||ext==='webp'||ext==='bmp')app='paint';

    var editor=
      await jplopsoft_runBuiltinXsh(
        app,
        [p],
        ctx
      );

    return{
      ok:true,
      verb:'edit',
      pid:editor.pid,
      path:p
    };
  }

  if(action==='download'){
    return shellDownloadPath(ctx,p);
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported ShellExecute verb: '+action
  );
}

async function shellInvokeCommand(ctx,verb,paths,options){
  var action=String(verb||'').toLowerCase(),
      list=shellEnsureArray(paths)
        .map(shellNormalizePath)
        .filter(function(x){return!!x;}),
      opt=options||{},
      i,out;

  if(action==='showdesktop'){
    if(typeof jplopsoft_wmShowDesktop!=='function'){
      throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'Desktop Shell is unavailable.');
    }
    jplopsoft_wmShowDesktop();
    return{ok:true,verb:'showdesktop'};
  }

  if(action==='personalize'){
    var personalizeChild=await jplopsoft_runBuiltinXsh('personalization',[],ctx);
    return{ok:true,verb:'personalize',pid:personalizeChild.pid};
  }

  if(action==='openlocation'){
    if(list.length!==1)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Open location requires one selected object.');
    var locationInfo=shellInfo(ctx,list[0]),locationPath=locationInfo.reparsePoint&&locationInfo.reparseTarget?locationInfo.reparseTarget:list[0];
    try{if(!shellInfo(ctx,locationPath).directory)locationPath=shellParentPath(locationPath);}catch(ignoreLocationInfo){locationPath=shellParentPath(locationPath);}
    var locationChild=await jplopsoft_runBuiltinXsh('explorer',[locationPath||'C:\\'],ctx);
    return{ok:true,verb:'openlocation',pid:locationChild.pid,path:locationPath||'C:\\'};
  }

  if(action==='extractall'){
    if(list.length!==1||shellExtension(list[0])!=='zip'){
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Extract All requires one ZIP archive.');
    }
    var zipExtract=await jplopsoft_runBuiltinXsh('zipfolder',[list[0],'/extract'],ctx);
    return{ok:true,verb:'extractall',pid:zipExtract.pid,path:list[0]};
  }

  if(action==='open'||action==='edit'||action==='download'){
    if(!list.length){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Shell verb requires a selected object.'
      );
    }

    out=[];

    for(i=0;i<list.length;i++){
      out.push(
        await shellExecute(
          ctx,
          list[i],
          action,
          opt.args||[]
        )
      );
    }

    return{
      ok:true,
      verb:action,
      results:out
    };
  }

  if(action==='createshortcut'){
    if(list.length!==1)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Create shortcut requires one selected object.');
    var shortcut=await shellCreateShortcutAt(ctx,list[0],shellParentPath(list[0]));
    shortcut.ok=true;shortcut.verb='createshortcut';return shortcut;
  }

  if(action==='compresszip'||action==='sendto_zip'){
    var zipped=await shellCompressToZip(ctx,list);zipped.verb=action;return zipped;
  }

  if(action==='sendto_desktop_shortcut'){
    var desktop=shellKnownFolder(ctx,'FOLDERID_DESKTOP'),shortcuts=[];
    for(i=0;i<list.length;i++)shortcuts.push(await shellCreateShortcutAt(ctx,list[i],desktop));
    return{ok:true,verb:action,destination:desktop,completed:shortcuts.length,results:shortcuts};
  }

  if(action==='sendto_documents'||action==='sendto_downloads'){
    var sendDestination=shellKnownFolder(ctx,action==='sendto_documents'?'FOLDERID_DOCUMENTS':'FOLDERID_DOWNLOADS');
    var sendResult=await shellFileOperation(ctx,{operation:'copy',sources:list,destination:sendDestination});
    sendResult.verb=action;sendResult.destination=sendDestination;return sendResult;
  }

  if(action==='copy'||action==='cut'){
    SHELL.clipboard.effect=action;
    SHELL.clipboard.paths=list.slice();
    SHELL.clipboard.sourcePid=
      parseInt(ctx&&ctx.pid,10)||0;
    SHELL.clipboard.updatedAt=
      new Date().getTime();

    return{
      ok:true,
      verb:action,
      clipboard:{
        effect:SHELL.clipboard.effect,
        paths:SHELL.clipboard.paths.slice(),
        count:SHELL.clipboard.paths.length
      }
    };
  }

  if(action==='paste'){
    if(!SHELL.clipboard.paths.length){
      return{
        ok:false,
        verb:'paste',
        completed:0,
        reason:'clipboard-empty'
      };
    }

    var result=
      await shellFileOperation(
        ctx,
        {
          operation:
            SHELL.clipboard.effect==='cut'
              ?'move'
              :'copy',
          sources:
            SHELL.clipboard.paths.slice(),
          destination:
            String(opt.targetPath||'')
        }
      );

    if(
      SHELL.clipboard.effect==='cut'&&
      result.ok
    ){
      SHELL.clipboard.effect='';
      SHELL.clipboard.paths=[];
      SHELL.clipboard.sourcePid=0;
      SHELL.clipboard.updatedAt=
        new Date().getTime();
    }

    return result;
  }

  if(action==='move'){
    if(!list.length)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Move requires a selected object.');
    var mover=await jplopsoft_runBuiltinXsh('move_items',list,ctx);
    return{ok:true,verb:'move',pid:mover.pid,paths:list.slice()};
  }

  if(action==='delete'){
    return await shellRecycleDelete(ctx,list);
  }

  if(action==='renamevolume'){
    var label=String(opt.label===undefined?opt.newLabel:opt.label);
    var changed=await jplopsoft_xshApiPromise('volume_set_label','POST',{label:label});
    if(typeof jplopsoft_XSH!=='undefined'&&jplopsoft_XSH.systemVdo){
      jplopsoft_XSH.systemVdo.label=String(changed&&changed.label!==undefined?changed.label:label);
    }
    return{ok:true,verb:'renamevolume',label:String(changed&&changed.label!==undefined?changed.label:label)};
  }

  if(action==='rename'){
    return await shellFileOperation(
      ctx,
      {
        operation:'rename',
        sources:list,
        destination:String(
          opt.newPath||
          opt.destination||
          ''
        )
      }
    );
  }

  if(action==='properties'){
    if(!list.length){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Properties requires a selected object.'
      );
    }

    out=[];

    for(i=0;i<list.length;i++){
      var propertiesChild=await jplopsoft_runBuiltinXsh(
        'properties',
        [list[i]],
        ctx
      );

      out.push({
        path:list[i],
        pid:propertiesChild.pid
      });
    }

    return{
      ok:true,
      verb:'properties',
      results:out
    };
  }

  if(action==='cmdhere'){
    var target=
      list.length
        ?list[0]
        :String(opt.targetPath||ctx.currentDirectory||'C:\\');

    var info=shellInfo(ctx,target);

    if(!info.directory){
      target=shellParentPath(target);
    }

    var child=await jplopsoft_runBuiltinXsh(
      'cmd',
      [
        '/k',
        'cd /d '+shellQuote(target)
      ],
      ctx
    );

    return{
      ok:true,
      verb:'cmdhere',
      pid:child.pid,
      path:target
    };
  }

  if(action==='refresh'||action==='newfolder'||action==='newtext'||action==='newcsv'||action==='newhtml'||action==='newxsh'){
    var shellTarget=String(opt.targetPath||ctx.currentDirectory||'C:\\');
    var shellActionChild=await jplopsoft_runBuiltinXsh('shell_action',[action,shellTarget],ctx);
    return{ok:true,verb:action,pid:shellActionChild.pid,path:shellTarget};
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported shell verb: '+action
  );
}

function shellGetClipboard(){
  return{
    effect:String(SHELL.clipboard.effect||''),
    paths:SHELL.clipboard.paths.slice(),
    count:SHELL.clipboard.paths.length,
    sourcePid:SHELL.clipboard.sourcePid,
    updatedAt:SHELL.clipboard.updatedAt
  };
}

function shellEmptyClipboard(){
  SHELL.clipboard.effect='';
  SHELL.clipboard.paths=[];
  SHELL.clipboard.sourcePid=0;
  SHELL.clipboard.updatedAt=
    new Date().getTime();

  return true;
}

function shellBeginDragDrop(ctx,paths,options){
  var list=shellEnsureArray(paths)
        .map(function(x){
          x=String(x||'');
          return typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(x)
            ?x
            :shellNormalizePath(x);
        })
        .filter(function(x){return!!x;}),
      opt=options||{};

  if(!list.length){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'DoDragDrop requires at least one source.'
    );
  }

  SHELL.drag.id++;
  SHELL.drag.paths=list;
  SHELL.drag.sourcePid=
    parseInt(ctx&&ctx.pid,10)||0;
  SHELL.drag.allowedEffects=
    shellEnsureArray(
      opt.allowedEffects||['copy','move']
    )
      .map(function(x){
        return String(x||'').toLowerCase();
      })
      .filter(function(x){
        return x==='copy'||x==='move';
      });

  if(!SHELL.drag.allowedEffects.length){
    SHELL.drag.allowedEffects=['copy','move'];
  }

  SHELL.drag.active=true;

  return{
    id:SHELL.drag.id,
    active:true,
    paths:SHELL.drag.paths.slice(),
    allowedEffects:SHELL.drag.allowedEffects.slice()
  };
}

function shellDragOver(ctx,targetPath,options){
  var raw=String(targetPath||''),
      targetIsZip=typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(raw),
      target=targetIsZip?raw:shellNormalizePath(raw),
      opt=options||{},node=null,effect='none',sourceHasZip=false,sourceHasNormal=false,i;

  if(!SHELL.drag.active){return{accepted:false,effect:'none',targetPath:target};}
  for(i=0;i<SHELL.drag.paths.length;i++){
    if(typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(SHELL.drag.paths[i]))sourceHasZip=true;
    else sourceHasNormal=true;
  }
  if(targetIsZip){
    if(sourceHasZip)return{accepted:false,effect:'none',targetPath:target};
    effect=SHELL.drag.allowedEffects.indexOf('copy')>=0?'copy':'none';
    return{accepted:effect!=='none',effect:effect,targetPath:target,namespace:'zipfldr'};
  }
  node=shellResolve(ctx,target);
  if(!node||node.type!=='folder')return{accepted:false,effect:'none',targetPath:target};
  if(sourceHasZip){
    effect=SHELL.drag.allowedEffects.indexOf('copy')>=0?'copy':'none';
  }else if(opt.ctrlKey&&SHELL.drag.allowedEffects.indexOf('copy')>=0){
    effect='copy';
  }else if(SHELL.drag.allowedEffects.indexOf('move')>=0){
    effect='move';
  }else if(SHELL.drag.allowedEffects.indexOf('copy')>=0){
    effect='copy';
  }
  return{accepted:effect!=='none',effect:effect,targetPath:target};
}

async function shellDrop(ctx,targetPath,options){
  var over=shellDragOver(ctx,targetPath,options),result,i,source;
  if(!over.accepted){SHELL.drag.active=false;return{ok:false,effect:'none',completed:0};}
  try{
    if(typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(over.targetPath)){
      result=await jplopsoft_zipfldrAddPathsVirtual(ctx,over.targetPath,SHELL.drag.paths.slice());
      return{ok:true,effect:'copy',completed:Number(result&&result.count)||SHELL.drag.paths.length,targetPath:over.targetPath,namespace:'zipfldr'};
    }
    if(SHELL.drag.paths.some(function(x){return typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(x);})){ 
      var done=0;
      for(i=0;i<SHELL.drag.paths.length;i++){
        source=SHELL.drag.paths[i];
        if(typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(source)){
          await jplopsoft_zipfldrExtractVirtual(ctx,source,over.targetPath);done++;
        }
      }
      return{ok:true,effect:'copy',completed:done,targetPath:over.targetPath,namespace:'zipfldr'};
    }
    result=await shellFileOperation(ctx,{operation:over.effect==='copy'?'copy':'move',sources:SHELL.drag.paths.slice(),destination:over.targetPath});
    return{ok:!!result.ok,effect:over.effect,completed:result.completed||0,targetPath:over.targetPath};
  }finally{
    SHELL.drag.active=false;SHELL.drag.paths=[];SHELL.drag.sourcePid=0;
  }
}

async function shellDoDragDrop(ctx,paths,targetPath,options){
  shellBeginDragDrop(
    ctx,
    paths,
    options
  );

  return await shellDrop(
    ctx,
    targetPath,
    options
  );
}

function shellCancelDragDrop(){
  SHELL.drag.active=false;
  SHELL.drag.paths=[];
  SHELL.drag.sourcePid=0;

  return true;
}


function shellReloadNodesPromise(){
  return new Promise(function(resolve){
    try{
      jplopsoft_reloadNodes(function(){resolve(true);});
    }catch(e){
      resolve(false);
    }
  });
}

async function shellUnblockFile(ctx,path){
  var info=shellInfo(ctx,path),out;

  if(info.directory){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Zone.Identifier unblock applies to files only.'
    );
  }

  if(!info.nodeId){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Shell file node was not found.'
    );
  }

  if(!info.markOfTheWeb){
    return{
      ok:true,
      changed:false,
      path:info.path,
      markOfTheWeb:false,
      zoneId:0
    };
  }

  /*
   * Dedicated API: do not expose generic ADS_DELETE to XSH. The server accepts
   * only deletion of Zone.Identifier and still performs the file DACL check.
   */
  out=await jplopsoft_xshApiPromise(
    'motw_unblock',
    'POST',
    {id:info.nodeId}
  );

  await shellReloadNodesPromise();

  return{
    ok:true,
    changed:!!(out&&out.changed),
    path:info.path,
    markOfTheWeb:false,
    zoneId:0
  };
}

async function shellQueryRecycleBin(ctx){
  var out=await jplopsoft_xshApiPromise('trash_list','GET',null),
      items=out&&out.items&&Object.prototype.toString.call(out.items)==='[object Array]'?out.items:[],
      result=[],i,item,name,original;

  for(i=0;i<items.length;i++){
    item=items[i]||{};
    try{name=jplopsoft_decName(item);}catch(ignoreName){name='';}
    if(!name)name='[encrypted #'+String(item.id||0)+']';
    try{original=jplopsoft_trashOriginalPath(item);}catch(ignorePath){original='C:\\';}
    result.push({
      id:parseInt(item.id,10)||0,
      name:String(name),
      type:String(item.type||'file'),
      trashedAt:String(item.trashed_at||''),
      originalParentId:parseInt(item.original_parent_id,10)||0,
      originalPath:String(original||'C:\\'),
      itemCount:parseInt(item.item_count,10)||1
    });
  }
  return result;
}

async function shellRestoreFromRecycleBin(ctx,id){
  id=parseInt(id,10)||0;
  if(id<=0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Recycle Bin item id is required.');
  await jplopsoft_xshApiPromise('trash_restore','POST',{id:id});
  await shellReloadNodesPromise();
  return true;
}

async function shellDeleteFromRecycleBin(ctx,id){
  id=parseInt(id,10)||0;
  if(id<=0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Recycle Bin item id is required.');
  await jplopsoft_xshApiPromise('trash_delete','POST',{id:id});
  await shellReloadNodesPromise();
  return true;
}

async function shellEmptyRecycleBin(ctx){
  var out=await jplopsoft_xshApiPromise('trash_empty','POST',{});
  await shellReloadNodesPromise();
  return {ok:true,deleted:out&&out.deleted?parseInt(out.deleted,10)||0:0};
}


function shellEnv(ctx,name,def){
  var e=ctx&&ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters?ctx.process.peb.processParameters.environment:null,k=String(name||'').toUpperCase();
  return e&&typeof e[k]!=='undefined'?String(e[k]):String(def||'');
}
function shellKnownFolder(ctx,id){
  var u=shellEnv(ctx,'USERPROFILE','C:\\Users\\'+String(ctx&&ctx.username||'administrator')),
      pub=shellEnv(ctx,'PUBLIC','C:\\Users\\Public'),win=shellEnv(ctx,'SYSTEMROOT','C:\\Windows'),
      pf=shellEnv(ctx,'PROGRAMFILES','C:\\Program Files'),pfx=shellEnv(ctx,'PROGRAMFILES(X86)','C:\\Program Files (x86)'),
      k=String(id===undefined?'':id).toUpperCase().replace(/[{}]/g,'');
  var map={
    'FOLDERID_DESKTOP':u+'\\Desktop','DESKTOP':u+'\\Desktop','0X10':u+'\\Desktop','16':u+'\\Desktop',
    'FOLDERID_DOCUMENTS':u+'\\Documents','DOCUMENTS':u+'\\Documents','PERSONAL':u+'\\Documents','0X5':u+'\\Documents','5':u+'\\Documents',
    'FOLDERID_DOWNLOADS':u+'\\Downloads','DOWNLOADS':u+'\\Downloads',
    'FOLDERID_PUBLICDOCUMENTS':pub+'\\Documents','PUBLICDOCUMENTS':pub+'\\Documents','0X2E':pub+'\\Documents','46':pub+'\\Documents',
    'FOLDERID_PUBLICDESKTOP':pub+'\\Desktop','PUBLICDESKTOP':pub+'\\Desktop','0X19':pub+'\\Desktop','25':pub+'\\Desktop',
    'FOLDERID_WINDOWS':win,'WINDOWS':win,'0X24':win,'36':win,
    'FOLDERID_PROGRAMFILES':pf,'PROGRAMFILES':pf,'0X26':pf,'38':pf,
    'FOLDERID_PROGRAMFILESX86':pfx,'PROGRAMFILESX86':pfx,'0X2A':pfx,'42':pfx,
    'FOLDERID_PROFILE':u,'PROFILE':u,'0X28':u,'40':u
  };
  if(Object.prototype.hasOwnProperty.call(map,k))return shellNormalizePath(map[k]);
  throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Known Folder/CSIDL is not mapped by ExOS: '+String(id));
}
function shellPidl(ctx,path){
  var p=shellNormalizePath(path),info=shellInfo(ctx,p);
  return{pidl:'PIDL:EXFS:'+encodeURIComponent(p),parsingName:p,displayName:info.name,typeName:info.typeName,directory:info.directory,nodeId:info.nodeId,filesystem:'ExFS'};
}
function shellPidlPath(pidl){
  if(pidl&&typeof pidl==='object'&&pidl.parsingName)return shellNormalizePath(pidl.parsingName);
  var s=String(pidl||'');if(s.indexOf('PIDL:EXFS:')===0){try{return shellNormalizePath(decodeURIComponent(s.substring(10)));}catch(ignore){}}
  return shellNormalizePath(s);
}
async function shellCreateDirectoryTree(ctx,path){
  var p=shellNormalizePath(path);if(!/^C:\\/i.test(p))throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'SHCreateDirectoryEx supports ExFS C: only.');
  var parts=p.substring(3).split('\\'),cur='C:\\',i;
  for(i=0;i<parts.length;i++){if(!parts[i])continue;cur=cur==='C:\\'?cur+parts[i]:cur+'\\'+parts[i];if(!shellResolve(ctx,cur)){try{await global.jplopsoft_xshCreateDirectory(ctx,cur);}catch(e){if(!shellResolve(ctx,cur))throw e;}}}
  return true;
}


function shellPidlClone(ctx,pidl){var p=shellPidlPath(pidl);return shellPidl(ctx,p);}
function shellPidlCombine(ctx,a,b){var ap=shellPidlPath(a),bp=shellPidlPath(b);if(/^[a-zA-Z]:[\\/]/.test(bp))return shellPidl(ctx,bp);return shellPidl(ctx,ap.replace(/[\\/]+$/,'')+'\\'+bp.replace(/^[\\/]+/,''));}
function shellCommandLineToArgv(text){var s=String(text||''),out=[],cur='',quote=false,bs=0,i,ch;for(i=0;i<=s.length;i++){ch=i<s.length?s.charAt(i):' ';if(ch==='\\'){bs++;continue;}if(ch==='"'){cur+='\\'.repeat(Math.floor(bs/2));if(bs%2)cur+='"';else quote=!quote;bs=0;continue;}if(bs){cur+='\\'.repeat(bs);bs=0;}if(/\s/.test(ch)&&!quote){if(cur!==''){out.push(cur);cur='';}}else cur+=ch;}return out;}
function shellPropertyStore(ctx,path){var info=shellInfo(ctx,path),h=PROPERTY_STORES.next++;PROPERTY_STORES.items[String(h)]={handle:h,ownerPid:parseInt(ctx.pid,10)||0,path:info.path,values:{'System.ItemNameDisplay':info.name,'System.ItemPathDisplay':info.path,'System.ItemTypeText':info.typeName,'System.FileExtension':info.extension?'.'+info.extension:'','System.Size':info.size||0,'System.DateModified':info.updatedAt||'', 'System.IsFolder':!!info.directory}};return h;}
function shellPropertyRec(ctx,h){var r=PROPERTY_STORES.items[String(Number(h)||0)];if(!r||r.ownerPid!==(parseInt(ctx.pid,10)||0))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid Shell property store.');return r;}

async function shellDispatch(ctx,method,args){
  args=args||[];

  if(method==='GetShellVersion'){
    return{
      version:SHELL.version,
      model:SHELL.model,
      compatibility:'EXOS_SHELL32_SEMANTIC_V2',
      knownFolders:true,
      pidlObjects:true,
      propertyStores:true,
      hostShellObjects:false
    };
  }


  if(method==='SHGetKnownFolderPath'||method==='SHGetKnownFolderPathA'||method==='SHGetKnownFolderPathW'||method==='SHGetFolderPath'||method==='SHGetFolderPathA'||method==='SHGetFolderPathW')return shellKnownFolder(ctx,args[0]);
  if(method==='SHGetSpecialFolderPath'||method==='SHGetSpecialFolderPathA'||method==='SHGetSpecialFolderPathW'||method==='SHGetSpecialFolderLocation')return shellKnownFolder(ctx,args[0]);
  if(method==='ILClone'||method==='ILCloneFull')return shellPidlClone(ctx,args[0]);
  if(method==='ILCombine')return shellPidlCombine(ctx,args[0],args[1]);
  if(method==='ILFindLastID'){var lp=shellPidlPath(args[0]),parts=lp.split('\\');return{kind:'EXOS_PIDL',parsingName:parts.length?parts[parts.length-1]:'',absolute:false};}
  if(method==='ILRemoveLastID'){lp=shellPidlPath(args[0]);parts=lp.split('\\');parts.pop();return shellPidl(ctx,parts.join('\\'));}
  if(method==='SHBindToParent'){lp=shellPidlPath(args[0]);parts=lp.split('\\');var child=parts.pop()||'';return{parent:shellPidl(ctx,parts.join('\\')),child:{kind:'EXOS_PIDL',parsingName:child,absolute:false}};}
  if(method==='SHCreateShellItem')return shellInfo(ctx,shellPidlPath(args[0]));
  if(method==='SHCreateItemInKnownFolder'){var base=shellKnownFolder(ctx,args[0]),rel=String(args[1]||'');return shellInfo(ctx,base.replace(/\\+$/,'')+(rel?'\\'+rel.replace(/^\\+/, ''):''));}
  if(method==='CommandLineToArgvW'||method==='CommandLineToArgvA')return shellCommandLineToArgv(args[0]);
  if(method==='SHGetStockIconInfo'){var si=String(args[0]||'').toUpperCase(),map={SIID_FOLDER:'folder',SIID_DOCNOASSOC:'file',SIID_DRIVEFIXED:'drive',SIID_DELETE:'recycle',SIID_APPLICATION:'app',SIID_WARNING:'warning',SIID_INFO:'info'};return{id:si,icon:map[si]||'file',dll:'shell32.dll'};}
  if(method==='SHGetPropertyStoreFromParsingName'){return shellPropertyStore(ctx,args[0]);}
  if(method==='PropertyStoreGetValue'){var pr=shellPropertyRec(ctx,args[0]);return Object.prototype.hasOwnProperty.call(pr.values,String(args[1]))?pr.values[String(args[1])]:null;}
  if(method==='PropertyStoreEnum'){pr=shellPropertyRec(ctx,args[0]);return Object.keys(pr.values).map(function(k){return{key:k,value:pr.values[k]};});}
  if(method==='PropertyStoreCommit')return true;
  if(method==='PropertyStoreRelease'){pr=shellPropertyRec(ctx,args[0]);delete PROPERTY_STORES.items[String(pr.handle)];return true;}
  if(method==='SHParseDisplayName')return shellPidl(ctx,args[0]);
  if(method==='SHGetNameFromIDList'){var pp=shellPidlPath(args[0]),ii=shellInfo(ctx,pp);return String(args[1]||'SIGDN_FILESYSPATH').toUpperCase().indexOf('NORMALDISPLAY')>=0?ii.name:pp;}
  if(method==='SHCreateItemFromParsingName')return shellInfo(ctx,args[0]);
  if(method==='SHGetDesktopFolder')return{namespace:'Desktop',path:shellKnownFolder(ctx,'FOLDERID_DESKTOP'),pidl:shellPidl(ctx,shellKnownFolder(ctx,'FOLDERID_DESKTOP'))};
  if(method==='SHCreateDirectoryEx'||method==='SHCreateDirectoryExA'||method==='SHCreateDirectoryExW')return await shellCreateDirectoryTree(ctx,args[0]);
  if(method==='ShellExecuteEx'||method==='ShellExecuteExA'||method==='ShellExecuteExW'){
    var ex=args[0]||{},res=await shellExecute(ctx,ex.file||ex.lpFile||'',ex.verb||ex.lpVerb||'open',ex.parameters||ex.lpParameters||'');return{ok:true,hInstApp:33,processId:res&&res.pid?res.pid:0,result:res};
  }
  if(method==='SHChangeNotify')return await shellChangeNotify(ctx,args[0],args[1],args[2]);
  if(method==='SHBrowseForFolder')return await shellBrowseForFolder(ctx,args[0]);

  if(method==='OpenPath')return await shellOpenPath(ctx,args[0]);
  if(method==='LaunchSystemApp')return await shellLaunchSystemApp(ctx,args[0],args[1]);
  if(method==='GetDesktopPersonalization')return await shellQueryDesktopPersonalization();
  if(method==='SetDesktopPersonalization')return await shellSetDesktopPersonalization(args[0]||{});
  if(method==='GetDesktopItems')return shellDesktopItems();
  if(method==='RefreshDesktop')return shellRenderDesktop();
  if(method==='ShowNotification')return shellShowNotification(ctx,args[0]||{});
  if(method==='DownloadPath')return shellDownloadPath(ctx,args[0]);
  if(method==='GetTaskbarInfo')return shellTaskbarInfo();
  if(method==='GetStartMenuModel')return shellStartMenuModel();
  if(method==='RegisterFlyout')return shellRegisterFlyout(ctx,args[0],args[1]);
  if(method==='UnregisterFlyout')return shellUnregisterFlyout(ctx,args[0]);

  if(method==='SHGetFileAssociation'){
    return shellAssociation(
      args[0]
    );
  }

  if(method==='SHGetFileInfo'){
    return await shellInfoWithImage(
      ctx,
      args[0]
    );
  }

  if(method==='SHGetFileTypeName'){
    var info=shellInfo(ctx,args[0]);
    return info.typeName;
  }

  if(method==='SHGetContextMenu'){
    return shellContextMenu(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='TrackContextMenu'){
    return await shellTrackContextMenu(
      ctx,
      args[0],
      args[1],
      args[2],
      args[3]
    );
  }

  if(method==='TrackPopupMenu'){
    return await shellTrackPopupMenu(args[0],args[1],args[2]);
  }

  if(method==='ShellExecute'){
    return await shellExecute(
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }

  if(method==='InvokeCommand'){
    return await shellInvokeCommand(
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }

  if(method==='SHFileOperation'){
    return await shellFileOperation(
      ctx,
      args[0]
    );
  }

  if(method==='GetClipboardState'){
    return shellGetClipboard();
  }

  if(method==='EmptyClipboard'){
    return shellEmptyClipboard();
  }

  if(method==='DoDragDrop'){
    return await shellDoDragDrop(
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }

  if(method==='BeginDragDrop'){
    return shellBeginDragDrop(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='DragOver'){
    return shellDragOver(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='Drop'){
    return await shellDrop(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='CancelDragDrop'){
    return shellCancelDragDrop();
  }

  if(method==='UnblockFile'){
    return await shellUnblockFile(
      ctx,
      args[0]
    );
  }

  if(method==='SHQueryRecycleBin'){
    return await shellQueryRecycleBin(ctx);
  }

  if(method==='SHRestoreFromRecycleBin'){
    return await shellRestoreFromRecycleBin(ctx,args[0]);
  }

  if(method==='SHDeleteFromRecycleBin'){
    return await shellDeleteFromRecycleBin(ctx,args[0]);
  }

  if(method==='SHEmptyRecycleBin'){
    return await shellEmptyRecycleBin(ctx);
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'shell32.dll method is not implemented: '+String(method||'')
  );
}

function shellCleanupContext(ctx){
  var pid=parseInt(ctx&&ctx.pid,10)||0,k,r;
  for(k in PROPERTY_STORES.items){
    if(Object.prototype.hasOwnProperty.call(PROPERTY_STORES.items,k)){
      r=PROPERTY_STORES.items[k];
      if(r&&parseInt(r.ownerPid,10)===pid)delete PROPERTY_STORES.items[k];
    }
  }
  if(SHELL.drag&&parseInt(SHELL.drag.sourcePid,10)===pid){
    SHELL.drag={id:0,paths:[],allowedEffects:['copy','move'],sourcePid:0,active:false};
  }
  if(SHELL.clipboard&&parseInt(SHELL.clipboard.sourcePid,10)===pid){
    /* Clipboard data remains usable after the source process exits, matching
       Windows clipboard ownership transfer semantics. Only ownership changes. */
    SHELL.clipboard.sourcePid=0;
  }
  for(k in SHELL.flyouts){
    if(!Object.prototype.hasOwnProperty.call(SHELL.flyouts,k))continue;
    r=SHELL.flyouts[k];
    if(r&&parseInt(r.ownerPid,10)===pid){delete SHELL.flyouts[k];shellSetFlyoutVisual(k,false);}
  }
  return true;
}

function shellDismissAllUi(){
  var nodes=document.querySelectorAll?document.querySelectorAll('.jplopsoft_shell32_menu,.jplopsoft_shell32_browse_backdrop,.jplopsoft_shell32_clipboard_menu'):[],i,k,f,ctx,pids=[];
  shellDismissNotifications();
  for(i=nodes.length-1;i>=0;i--){try{if(nodes[i]&&nodes[i].parentNode)nodes[i].parentNode.removeChild(nodes[i]);}catch(ignoreDismiss){}}
  for(k in SHELL.flyouts){if(Object.prototype.hasOwnProperty.call(SHELL.flyouts,k)){f=SHELL.flyouts[k];if(f&&f.ownerPid)pids.push(parseInt(f.ownerPid,10)||0);shellSetFlyoutVisual(k,false);}}
  SHELL.flyouts={};shellRemoveFlyoutDismissListener();
  for(i=0;i<pids.length;i++){
    try{ctx=typeof jplopsoft_xshRunByPid==='function'?jplopsoft_xshRunByPid(pids[i]):null;if(ctx&&!ctx.terminating&&typeof jplopsoft_xshTerminate==='function')jplopsoft_xshTerminate(ctx,0,'ShellDismissAllUI',false);}catch(ignoreFlyoutTerminate){}
  }
  return true;
}

global.jplopsoft_SHELL32=SHELL;
global.jplopsoft_shell32Dispatch=shellDispatch;
global.jplopsoft_shell32CleanupContext=shellCleanupContext;
global.jplopsoft_shell32DismissAllUI=shellDismissAllUi;
global.jplopsoft_shell32LoadDesktopPersonalization=shellLoadDesktopPersonalization;
global.jplopsoft_shell32ApplyDesktopPersonalization=shellApplyDesktopPersonalization;
global.jplopsoft_shell32BindDesktopSurface=shellBindDesktopSurface;
global.jplopsoft_shell32RefreshDesktop=shellRenderDesktop;
global.jplopsoft_shell32BindTaskbarPresentation=shellBindTaskbarPresentation;
global.jplopsoft_shell32BootstrapTaskbarPresentation=shellBootstrapTaskbarPresentation;
global.jplopsoft_shell32TaskbarEnsureApp=shellTaskbarEnsureApp;
global.jplopsoft_shell32TaskbarRemoveApp=shellTaskbarRemoveApp;
global.jplopsoft_shell32TaskbarSetAppState=shellTaskbarSetAppState;
global.jplopsoft_shell32TaskbarDeactivateApps=shellTaskbarDeactivateApps;
global.jplopsoft_shell32InstallClipboardPresentation=shellInstallClipboardPresentation;
global.jplopsoft_shell32DismissClipboardPresentation=shellDismissClipboardPresentation;
global.jplopsoft_shell32OnSessionReady=shellSessionReady;
global.jplopsoft_shell32RunStartupApps=shellRunStartupApps;
global.jplopsoft_shell32OpenPathFromHost=shellOpenPathFromHost;
global.jplopsoft_shell32SaveBlobObject=shellSaveBlobObject;

/* SHELL32 owns desktop/taskbar presentation lifecycle.  Bootstrap independently from
 * exos.js so unrelated host UI binding failures cannot strand shell affordances. */
shellBootstrapDesktopPresentation();
shellBootstrapTaskbarPresentation();

})(window);
