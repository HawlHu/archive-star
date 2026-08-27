/* ExOS webview2.xdl / shdocvw.xdl emulation
 * ABI Version: 6.4.0-dev-os86
 * Build: 6.4.0-dev-os91-hotfix11
 * Model: EXOS_WEBVIEW2_V1
 *
 * Encapsulation rules:
 * - XSH code only sees the RPC facade returned by ExOS.LoadLibrary().
 * - DOM iframe objects never cross the XSH RPC boundary.
 * - A controller may attach only to an HWND owned by the current XSH process.
 * - hostControlId is an ExOS host extension and must belong to that same HWND.
 * - Web content runs in an opaque-origin sandbox (allow-scripts only).
 */
(function(global){
'use strict';

var ABI_VERSION='6.4.0-dev-os86';
var BUILD_VERSION='6.4.0-dev-os91-hotfix11';
var MODEL='EXOS_WEBVIEW2_V1';
var MAX_HTML_BYTES=2*1024*1024;
var API=Object.freeze({
  version:ABI_VERSION,
  build:BUILD_VERSION,
  model:MODEL,
  ready:true
});

function exerr(status,message){
  if(typeof global.jplopsoft_xshError==='function'){
    return global.jplopsoft_xshError(status,message);
  }
  var e=new Error(message);
  e.ntstatus=status;
  return e;
}

function st(name,fallback){
  var key='jplopsoft_STATUS_'+name;
  return typeof global[key]!=='undefined'?global[key]:fallback;
}

function ensureState(ctx){
  if(!ctx||typeof ctx!=='object'){
    throw exerr(st('INVALID_PARAMETER',0xC000000D),'Invalid XSH WebView2 context.');
  }
  if(!ctx.webview2){
    ctx.webview2={
      next:0xD000,
      envs:{},
      views:{}
    };
  }
  return ctx.webview2;
}

function getEnvironment(ctx,handle){
  var s=ensureState(ctx),key=String(parseInt(handle,10)||0),env=s.envs[key];
  if(!env){
    throw exerr(st('INVALID_HANDLE',0xC0000008),'Invalid WebView2 environment handle.');
  }
  return env;
}

function getView(ctx,handle){
  var s=ensureState(ctx),key=String(parseInt(handle,10)||0),v=s.views[key];
  if(!v){
    throw exerr(st('INVALID_HANDLE',0xC0000008),'Invalid WebView2 controller handle.');
  }
  return v;
}

function notify(ctx,v,action,data){
  if(typeof global.jplopsoft_xshSendEvent!=='function')return;
  global.jplopsoft_xshSendEvent(ctx,{
    event:'webview2',
    controlId:'WEBVIEW:'+String(v.handle),
    action:String(action||''),
    webview:v.handle,
    data:data||null
  });
}

function validateUrl(raw){
  if(typeof global.jplopsoft_netPolicyValidate!=='function'){
    throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Network policy engine unavailable.');
  }
  return global.jplopsoft_netPolicyValidate(raw,['http:','https:']);
}

function resolveHost(ctx,hwnd,options){
  var client=null,host=null,controlId='',tag='';

  hwnd=parseInt(hwnd,10)||0;
  if(!hwnd||!ctx.windows||!ctx.windows[String(hwnd)]){
    throw exerr(st('ACCESS_DENIED',0xC0000022),'HWND is not owned by this XSH process.');
  }

  options=options&&typeof options==='object'?options:{};
  controlId=String(options.hostControlId||'');

  if(controlId){
    if(typeof global.jplopsoft_xshControl!=='function'){
      throw exerr(st('NOT_SUPPORTED',0xC00000BB),'USER32 control host bridge unavailable.');
    }

    host=global.jplopsoft_xshControl(ctx,controlId);
    if(!host){
      throw exerr(st('INVALID_HANDLE',0xC0000008),'WebView2 host control unavailable: '+controlId);
    }

    if((parseInt(host._jplopsoftXshHwnd,10)||0)!==hwnd){
      throw exerr(st('ACCESS_DENIED',0xC0000022),'WebView2 host control does not belong to the specified HWND.');
    }

    tag=String(host.tagName||'').toUpperCase();
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='IMG'||tag==='IFRAME'||typeof host.appendChild!=='function'){
      throw exerr(st('INVALID_PARAMETER',0xC000000D),'WebView2 host control must be a container control.');
    }
  }else{
    client=typeof global.jplopsoft_GetClientElement==='function'
      ?global.jplopsoft_GetClientElement(hwnd)
      :null;
    host=client;
  }

  if(!host){
    throw exerr(st('INVALID_HANDLE',0xC0000008),'Window client area unavailable.');
  }

  return{
    hwnd:hwnd,
    host:host,
    hostControlId:controlId
  };
}

function wrapHtml(source){
  source=String(source||'');
  if(source.length>MAX_HTML_BYTES){
    throw exerr(st('QUOTA_EXCEEDED',0xC0000044),'NavigateToString HTML exceeds 2 MiB.');
  }

  return '<!doctype html>'+
    '<meta charset="utf-8">'+
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: https: http:; media-src https: http: data:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; connect-src \'none\'; frame-src \'none\'; object-src \'none\'; form-action \'none\'; base-uri \'none\'">'+
    '<style>html,body{font-family:Segoe UI,Arial,sans-serif;margin:0;padding:8px;box-sizing:border-box}</style>'+
    source;
}

function setSource(ctx,v,source,kind,push){
  if(kind==='url'){
    var u=validateUrl(source);
    source=u.href;
    v.frame.removeAttribute('srcdoc');
    v.frame.src=source;
  }else{
    source=String(source||'');
    v.frame.removeAttribute('src');
    v.frame.srcdoc=wrapHtml(source);
  }

  if(push!==false){
    v.history=v.history.slice(0,v.index+1);
    v.history.push({kind:kind,source:source});
    v.index=v.history.length-1;
  }

  v.source=source;
  v.kind=kind;
  notify(ctx,v,'navigationstarting',{
    source:kind==='url'?source:'about:srcdoc'
  });
  return true;
}

function createEnvironment(ctx,options){
  var s=ensureState(ctx),h=s.next++;
  s.envs[String(h)]={
    handle:h,
    options:options&&typeof options==='object'?options:{}
  };
  return h;
}

function createController(ctx,environmentHandle,hwnd,options){
  var s=ensureState(ctx),env=getEnvironment(ctx,environmentHandle),resolved=resolveHost(ctx,hwnd,options),host=resolved.host,frame,h,v,observer=null;

  frame=document.createElement('iframe');
  frame.className='jplopsoft-webview2';
  frame.setAttribute('data-exos-webview2','1');
  frame.setAttribute('sandbox','allow-scripts');
  frame.setAttribute('referrerpolicy','no-referrer');
  frame.setAttribute('allow','');
  frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:1;';

  try{
    if(global.getComputedStyle&&global.getComputedStyle(host).position==='static'){
      host.style.position='relative';
    }
  }catch(ignoreStyle){}

  host.appendChild(frame);

  h=s.next++;
  v={
    handle:h,
    env:env.handle,
    hwnd:resolved.hwnd,
    hostControlId:resolved.hostControlId,
    frame:frame,
    source:'about:blank',
    kind:'url',
    history:[],
    index:-1,
    messageHandler:null,
    observer:null,
    closed:false
  };
  s.views[String(h)]=v;

  frame.onload=function(){
    if(v.closed)return;
    notify(ctx,v,'navigationcompleted',{
      source:v.kind==='url'?v.source:'about:srcdoc',
      success:true
    });
  };

  v.messageHandler=function(e){
    try{
      if(!v.closed&&e.source===frame.contentWindow){
        notify(ctx,v,'webmessage',{
          data:e.data,
          origin:String(e.origin||'null')
        });
      }
    }catch(ignoreMessage){}
  };
  global.addEventListener('message',v.messageHandler,false);

  if(typeof global.ResizeObserver==='function'){
    observer=new global.ResizeObserver(function(){
      if(!v.closed)notify(ctx,v,'boundschanged',{});
    });
    try{observer.observe(host);}catch(ignoreObserve){}
    v.observer=observer;
  }

  return h;
}

function close(ctx,handle){
  var s=ensureState(ctx),key=String(parseInt(handle,10)||0),v=s.views[key];
  if(!v)return false;

  v.closed=true;
  try{if(v.observer)v.observer.disconnect();}catch(ignoreObserver){}
  try{if(v.messageHandler)global.removeEventListener('message',v.messageHandler,false);}catch(ignoreMessage){}
  try{if(v.frame&&v.frame.parentNode)v.frame.parentNode.removeChild(v.frame);}catch(ignoreFrame){}
  delete s.views[key];
  return true;
}

function cleanup(ctx){
  var s=ctx&&ctx.webview2,key;
  if(!s)return true;
  for(key in s.views){
    if(Object.prototype.hasOwnProperty.call(s.views,key))close(ctx,key);
  }
  ctx.webview2=null;
  return true;
}

async function dispatch(ctx,method,args){
  args=args||[];
  method=String(method||'');

  if(method==='GetVersion'){
    return{
      version:ABI_VERSION,
      build:BUILD_VERSION,
      model:MODEL,
      backend:'sandboxed iframe',
      sandbox:'allow-scripts',
      hostExtension:'hostControlId'
    };
  }

  if(method==='CreateCoreWebView2Environment'){
    return createEnvironment(ctx,args[0]);
  }

  if(method==='CreateCoreWebView2Controller'){
    return createController(ctx,args[0],args[1],args[2]);
  }

  if(method==='Navigate'){
    return setSource(ctx,getView(ctx,args[0]),args[1],'url',true);
  }

  if(method==='NavigateToString'){
    return setSource(ctx,getView(ctx,args[0]),args[1],'html',true);
  }

  if(method==='Reload'){
    var vr=getView(ctx,args[0]);
    if(vr.kind==='url'){
      var src=vr.source;
      vr.frame.src='about:blank';
      global.setTimeout(function(){
        try{if(!vr.closed)vr.frame.src=src;}catch(ignoreReload){}
      },0);
    }else{
      setSource(ctx,vr,vr.source,'html',false);
    }
    return true;
  }

  if(method==='GoBack'){
    var vb=getView(ctx,args[0]);
    if(vb.index<=0)return false;
    vb.index--;
    var eb=vb.history[vb.index];
    return setSource(ctx,vb,eb.source,eb.kind,false);
  }

  if(method==='GoForward'){
    var vf=getView(ctx,args[0]);
    if(vf.index>=vf.history.length-1)return false;
    vf.index++;
    var ef=vf.history[vf.index];
    return setSource(ctx,vf,ef.source,ef.kind,false);
  }

  if(method==='GetSource'){
    var vs=getView(ctx,args[0]);
    return vs.kind==='url'?vs.source:'about:srcdoc';
  }

  if(method==='PostWebMessageAsString'||method==='PostWebMessageAsJson'){
    var vm=getView(ctx,args[0]);
    var data=method==='PostWebMessageAsJson'
      ?args[1]
      :String(args[1]===undefined?'':args[1]);
    try{
      vm.frame.contentWindow.postMessage(data,'*');
      return true;
    }catch(ignorePost){
      return false;
    }
  }

  if(method==='SetVisible'){
    var vv=getView(ctx,args[0]);
    vv.frame.style.display=args[1]?'':'none';
    return true;
  }

  if(method==='ExecuteScript'){
    throw exerr(
      st('NOT_SUPPORTED',0xC00000BB),
      'ExecuteScript is intentionally unavailable: WebView runs in an opaque sandbox origin. Use web messaging.'
    );
  }

  if(method==='Close'){
    return close(ctx,args[0]);
  }

  throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported WebView2 API: '+method);
}

global.jplopsoft_WEBVIEW2=API;
global.jplopsoft_webview2Dispatch=dispatch;
global.jplopsoft_webview2Cleanup=cleanup;
})(window);
