/* ExOS WebView2 / shdocvw.dll emulation
 * Version: 6.4.0-dev-os79
 * Model: EXOS_WEBVIEW2_V1
 * Each view is a host-owned iframe sandboxed WITHOUT allow-same-origin.
 */
(function(global){'use strict';
var API={version:'6.4.0-dev-os79',model:'EXOS_WEBVIEW2_V1',ready:true};
function exerr(s,m){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,m);var e=new Error(m);e.ntstatus=s;return e;}
function st(n,d){var k='jplopsoft_STATUS_'+n;return typeof global[k]!=='undefined'?global[k]:d;}
function state(ctx){if(!ctx.webview2)ctx.webview2={next:0xD000,envs:{},views:{}};return ctx.webview2;}
function view(ctx,h){var v=state(ctx).views[String(parseInt(h,10)||0)];if(!v)throw exerr(st('INVALID_HANDLE',0xC0000008),'Invalid WebView2 handle.');return v;}
function notify(ctx,v,action,data){if(typeof global.jplopsoft_xshSendEvent==='function')global.jplopsoft_xshSendEvent(ctx,{event:'webview2',controlId:'WEBVIEW:'+v.handle,action:action,webview:v.handle,data:data||null});}
function validate(raw){if(typeof global.jplopsoft_netPolicyValidate!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Network policy engine unavailable.');return global.jplopsoft_netPolicyValidate(raw,['http:','https:']);}
function setSource(ctx,v,source,kind,push){if(kind==='url'){var u=validate(source);source=u.href;v.frame.removeAttribute('srcdoc');v.frame.src=source;}else{source=String(source||'');if(source.length>2*1024*1024)throw exerr(st('QUOTA_EXCEEDED',0xC0000044),'NavigateToString HTML exceeds 2 MiB.');v.frame.removeAttribute('src');v.frame.srcdoc='<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: https: http:; media-src https: http: data:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; connect-src \'none\'; frame-src \'none\'; object-src \'none\'; form-action \'none\'; base-uri \'none\'"><style>html,body{font-family:Segoe UI,Arial,sans-serif;margin:0;padding:8px;box-sizing:border-box}</style>'+source;}
 if(push!==false){v.history=v.history.slice(0,v.index+1);v.history.push({kind:kind,source:source});v.index=v.history.length-1;}v.source=source;v.kind=kind;notify(ctx,v,'navigationstarting',{source:kind==='url'?source:'about:srcdoc'});return true;}
async function dispatch(ctx,method,args){args=args||[];method=String(method||'');var s=state(ctx),h,v,env,hwnd,client,frame,obs;
 if(method==='GetVersion')return{version:API.version,model:API.model,backend:'sandboxed iframe',sandbox:'allow-scripts'};
 if(method==='CreateCoreWebView2Environment'){h=s.next++;s.envs[String(h)]={handle:h,options:args[0]||{}};return h;}
 if(method==='CreateCoreWebView2Controller'){env=s.envs[String(parseInt(args[0],10)||0)];if(!env)throw exerr(st('INVALID_HANDLE',0xC0000008),'Invalid WebView2 environment.');hwnd=parseInt(args[1],10)||0;if(!ctx.windows||!ctx.windows[String(hwnd)])throw exerr(st('ACCESS_DENIED',0xC0000022),'HWND is not owned by this XSH process.');client=typeof global.jplopsoft_GetClientElement==='function'?global.jplopsoft_GetClientElement(hwnd):null;if(!client)throw exerr(st('INVALID_HANDLE',0xC0000008),'Window client area unavailable.');frame=document.createElement('iframe');frame.className='jplopsoft-webview2';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('allow','');frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:1;';try{if(getComputedStyle(client).position==='static')client.style.position='relative';}catch(ignore){}client.appendChild(frame);h=s.next++;v={handle:h,env:env.handle,hwnd:hwnd,frame:frame,source:'about:blank',kind:'url',history:[],index:-1,messageHandler:null,observer:null};s.views[String(h)]=v;frame.onload=function(){notify(ctx,v,'navigationcompleted',{source:v.kind==='url'?v.source:'about:srcdoc',success:true});};v.messageHandler=function(e){try{if(e.source===frame.contentWindow)notify(ctx,v,'webmessage',{data:e.data,origin:String(e.origin||'null')});}catch(ignore){}};window.addEventListener('message',v.messageHandler,false);if(typeof ResizeObserver==='function'){obs=new ResizeObserver(function(){notify(ctx,v,'boundschanged',{});});try{obs.observe(client);}catch(ignoreObs){}v.observer=obs;}return h;}
 if(method==='Navigate'){v=view(ctx,args[0]);return setSource(ctx,v,args[1],'url',true);}
 if(method==='NavigateToString'){v=view(ctx,args[0]);return setSource(ctx,v,args[1],'html',true);}
 if(method==='Reload'){v=view(ctx,args[0]);if(v.kind==='url'){var src=v.source;v.frame.src='about:blank';setTimeout(function(){try{v.frame.src=src;}catch(ignore){}},0);}else setSource(ctx,v,v.source,'html',false);return true;}
 if(method==='GoBack'){v=view(ctx,args[0]);if(v.index<=0)return false;v.index--;var e=v.history[v.index];return setSource(ctx,v,e.source,e.kind,false);}
 if(method==='GoForward'){v=view(ctx,args[0]);if(v.index>=v.history.length-1)return false;v.index++;var e2=v.history[v.index];return setSource(ctx,v,e2.source,e2.kind,false);}
 if(method==='GetSource'){v=view(ctx,args[0]);return v.kind==='url'?v.source:'about:srcdoc';}
 if(method==='PostWebMessageAsString'||method==='PostWebMessageAsJson'){v=view(ctx,args[0]);var data=method==='PostWebMessageAsJson'?args[1]:String(args[1]===undefined?'':args[1]);try{v.frame.contentWindow.postMessage(data,'*');return true;}catch(e3){return false;}}
 if(method==='SetVisible'){v=view(ctx,args[0]);v.frame.style.display=args[1]?'':'none';return true;}
 if(method==='ExecuteScript')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'ExecuteScript is intentionally unavailable: WebView runs in an opaque sandbox origin. Use web messaging.');
 if(method==='Close'){return close(ctx,args[0]);}
 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported WebView2 API: '+method);
}
function close(ctx,h){var s=state(ctx),k=String(parseInt(h,10)||0),v=s.views[k];if(!v)return false;try{if(v.observer)v.observer.disconnect();}catch(ignore){}try{if(v.messageHandler)window.removeEventListener('message',v.messageHandler,false);}catch(ignore2){}try{if(v.frame&&v.frame.parentNode)v.frame.parentNode.removeChild(v.frame);}catch(ignore3){}delete s.views[k];return true;}
function cleanup(ctx){var s=ctx&&ctx.webview2,k;if(!s)return true;for(k in s.views)if(s.views.hasOwnProperty(k))close(ctx,k);ctx.webview2=null;return true;}
global.jplopsoft_WEBVIEW2=API;global.jplopsoft_webview2Dispatch=dispatch;global.jplopsoft_webview2Cleanup=cleanup;
})(window);
