/* ExOS ole32.dll emulation
 * Version: 6.4.0-dev-os77
 * Model: EXOS_OLE32_V1
 * OLE data objects, ExOS clipboard bridge and process-to-process drag broker.
 */
(function(global){'use strict';
var API={version:'6.4.0-dev-os77',model:'EXOS_OLE32_V1',ready:true};
var DRAG={active:null,targets:{}};
function exerr(s,m){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,m);var e=new Error(m);e.ntstatus=s;return e;}
function st(n,d){var k='jplopsoft_STATUS_'+n;return typeof global[k]!=='undefined'?global[k]:d;}
function state(ctx){if(!ctx.ole32)ctx.ole32={next:0xB800,objects:{},initialized:false};return ctx.ole32;}
function obj(ctx,h){var o=state(ctx).objects[String(parseInt(h,10)||0)];if(!o)throw exerr(st('INVALID_HANDLE',0xC0000008),'Invalid OLE data object.');return o;}
function clone(v){if(v instanceof Uint8Array)return v.slice(0);if(v instanceof ArrayBuffer)return v.slice(0);if(v&&typeof v==='object')try{return JSON.parse(JSON.stringify(v));}catch(ignore){}return v;}
function alloc(ctx,data){var s=state(ctx),h=s.next++;s.objects[String(h)]={handle:h,formats:data||{},ownerPid:parseInt(ctx.pid,10)||0};return h;}
function notify(ctx,key,action,data){if(typeof global.jplopsoft_xshSendEvent==='function')global.jplopsoft_xshSendEvent(ctx,{event:'ole32',controlId:key,action:action,data:data||null});}
async function dispatch(ctx,method,args){args=args||[];method=String(method||'');var s=state(ctx),o,h,fmt,target;
 if(method==='GetVersion')return{version:API.version,model:API.model};
 if(method==='OleInitialize'||method==='CoInitializeEx'){s.initialized=true;return 0;}
 if(method==='OleUninitialize'||method==='CoUninitialize'){s.initialized=false;return true;}
 if(method==='CreateDataObject'){h=alloc(ctx,{});o=obj(ctx,h);var initial=args[0]||{};for(fmt in initial)if(initial.hasOwnProperty(fmt))o.formats[String(fmt)]=clone(initial[fmt]);return h;}
 if(method==='SetData'){o=obj(ctx,args[0]);o.formats[String(args[1])]=clone(args[2]);return true;}
 if(method==='GetData'){o=obj(ctx,args[0]);fmt=String(args[1]);return o.formats.hasOwnProperty(fmt)?clone(o.formats[fmt]):null;}
 if(method==='EnumFormatEtc'){o=obj(ctx,args[0]);return Object.keys(o.formats);}
 if(method==='ReleaseDataObject'){delete s.objects[String(parseInt(args[0],10)||0)];return true;}
 if(method==='OleSetClipboard'){o=obj(ctx,args[0]);if(typeof global.jplopsoft_xshClipboardSetMany!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Clipboard broker unavailable.');return await global.jplopsoft_xshClipboardSetMany(ctx,o.formats);}
 if(method==='OleGetClipboard'){if(typeof global.jplopsoft_xshClipboardSnapshot!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Clipboard broker unavailable.');var snap=await global.jplopsoft_xshClipboardSnapshot(ctx,true);return alloc(ctx,snap.formats||{});}
 if(method==='RegisterDragDrop'){var hwnd=parseInt(args[0],10)||0;if(!ctx.windows||!ctx.windows[String(hwnd)])throw exerr(st('ACCESS_DENIED',0xC0000022),'HWND is not owned by this XSH process.');DRAG.targets[String(hwnd)]={ctx:ctx,hwnd:hwnd};return true;}
 if(method==='RevokeDragDrop'){delete DRAG.targets[String(parseInt(args[0],10)||0)];return true;}
 if(method==='DoDragDrop'||method==='BeginDragDrop'){o=obj(ctx,args[0]);DRAG.active={sourceCtx:ctx,sourcePid:parseInt(ctx.pid,10)||0,dataObject:o.handle,formats:Object.keys(o.formats),effects:Array.isArray(args[1])?args[1].map(String):['copy'],effect:'none'};notify(ctx,'OLE:'+o.handle,'dragstart',{formats:DRAG.active.formats,effects:DRAG.active.effects});return{ok:true,dataObject:o.handle,formats:DRAG.active.formats,effects:DRAG.active.effects};}
 if(method==='DragEnter'||method==='DragOver'){if(!DRAG.active)return{effect:'none'};target=DRAG.targets[String(parseInt(args[0],10)||0)];if(!target)return{effect:'none'};var desired=String(args[1]||DRAG.active.effects[0]||'copy');if(DRAG.active.effects.indexOf(desired)<0)desired=DRAG.active.effects[0]||'none';notify(target.ctx,'OLE:'+target.hwnd,method==='DragEnter'?'dragenter':'dragover',{sourcePid:DRAG.active.sourcePid,formats:DRAG.active.formats,effect:desired,point:args[2]||null});DRAG.active.effect=desired;return{effect:desired};}
 if(method==='Drop'){if(!DRAG.active)return{effect:'none'};target=DRAG.targets[String(parseInt(args[0],10)||0)];if(!target)return{effect:'none'};var src=DRAG.active.sourceCtx,so=obj(src,DRAG.active.dataObject),formats={};for(fmt in so.formats)if(so.formats.hasOwnProperty(fmt))formats[fmt]=clone(so.formats[fmt]);var effect=String(args[1]||DRAG.active.effect||'copy');notify(target.ctx,'OLE:'+target.hwnd,'drop',{sourcePid:DRAG.active.sourcePid,effect:effect,formats:formats,point:args[2]||null});notify(src,'OLE:'+so.handle,'dragcomplete',{effect:effect,targetHwnd:target.hwnd});DRAG.active=null;return{effect:effect};}
 if(method==='CancelDragDrop'){if(DRAG.active){notify(DRAG.active.sourceCtx,'OLE:'+DRAG.active.dataObject,'dragcancel',{});DRAG.active=null;}return true;}
 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported ole32.dll API: '+method);
}
function cleanup(ctx){var k;if(DRAG.active&&DRAG.active.sourceCtx===ctx)DRAG.active=null;for(k in DRAG.targets)if(DRAG.targets.hasOwnProperty(k)&&DRAG.targets[k].ctx===ctx)delete DRAG.targets[k];if(ctx)ctx.ole32=null;return true;}
global.jplopsoft_OLE32=API;global.jplopsoft_ole32Dispatch=dispatch;global.jplopsoft_ole32Cleanup=cleanup;
})(window);
