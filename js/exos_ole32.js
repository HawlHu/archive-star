/* ExOS ole32.xdl semantic emulation
 * Version: 6.4.0-dev-os86
 * Model: EXOS_OLE32_V3
 * Process-local COM/OLE facade: apartments, GUIDs, task memory, IDataObject,
 * memory IStream, clipboard and ExOS drag/drop broker.
 */
(function(global){'use strict';
var API={version:'6.4.0-dev-os86',model:'EXOS_OLE32_V3',ready:true,compatibility:'NT_COM_OLE_SEMANTIC_V3'};
var DRAG={active:null,targets:{}};
function exerr(s,m){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,m);var e=new Error(m);e.ntstatus=s;return e;}
function st(n,d){var k='jplopsoft_STATUS_'+n;return typeof global[k]!=='undefined'?global[k]:d;}
function state(ctx){if(!ctx.ole32)ctx.ole32={next:0xB800,objects:{},initialized:false,apartment:'COINIT_APARTMENTTHREADED',taskMem:{},rot:{nextCookie:1,entries:{}},bindContexts:{}};return ctx.ole32;}
function clone(v){if(v instanceof Uint8Array)return v.slice(0);if(v instanceof ArrayBuffer)return v.slice(0);if(v&&typeof v==='object')try{return JSON.parse(JSON.stringify(v));}catch(ignore){}return v;}
function alloc(ctx,kind,data){var s=state(ctx),h=s.next++;data=data||{};data.handle=h;data.kind=kind;data.ownerPid=parseInt(ctx.pid,10)||0;s.objects[String(h)]=data;return h;}
function obj(ctx,h,kind){var o=state(ctx).objects[String(parseInt(h,10)||0)];if(!o||(kind&&o.kind!==kind))throw exerr(st('INVALID_HANDLE',0xC0000008),'Invalid OLE/COM object handle.');return o;}
function notify(ctx,key,action,data){if(typeof global.jplopsoft_xshSendEvent==='function')global.jplopsoft_xshSendEvent(ctx,{event:'ole32',controlId:key,action:action,data:data||null});}
function bytes(v){if(v instanceof Uint8Array)return v.slice(0);if(v instanceof ArrayBuffer)return new Uint8Array(v.slice(0));if(ArrayBuffer.isView(v))return new Uint8Array(v.buffer,v.byteOffset,v.byteLength).slice(0);if(Array.isArray(v))return new Uint8Array(v);return new TextEncoder().encode(String(v===undefined?'':v));}
function guid(){var a=new Uint8Array(16);(global.crypto||{}).getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;var h=[],i;for(i=0;i<16;i++)h.push(('0'+a[i].toString(16)).slice(-2));return'{'+h.slice(0,4).join('')+'-'+h.slice(4,6).join('')+'-'+h.slice(6,8).join('')+'-'+h.slice(8,10).join('')+'-'+h.slice(10,16).join('')+'}';}
function normGuid(v){var s=String(v||'').trim().toUpperCase();if(!/^\{?[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}\}?$/.test(s))throw exerr(st('INVALID_PARAMETER',0xC000000D),'Invalid CLSID/GUID string.');if(s.charAt(0)!=='{')s='{'+s+'}';return s;}

function monikerName(o){return o&&o.displayName?String(o.displayName):'';}
function storageObj(ctx,h){return obj(ctx,h,'ISTORAGE');}
function storageEnsureStream(stg,name,create){name=String(name||'');if(!name)throw exerr(st('INVALID_PARAMETER',0xC000000D),'Storage stream name is required.');if(!stg.elements[name]&&create)stg.elements[name]={type:'stream',data:new Uint8Array(0),committed:new Uint8Array(0)};var e=stg.elements[name];if(!e||e.type!=='stream')throw exerr(st('OBJECT_NAME_NOT_FOUND',0xC0000034),'Storage stream not found.');return e;}

async function dispatch(ctx,method,args){
 args=args||[];method=String(method||'');var s=state(ctx),o,h,fmt,target;
 if(method==='GetVersion'||method==='QueryCapabilities')return{version:API.version,model:API.model,compatibility:API.compatibility,hostCOM:false,apartments:['STA','MTA'],streams:true,dataObjects:true,monikers:true,runningObjectTable:true,structuredStorage:true};
 if(method==='OleInitialize'){s.initialized=true;s.apartment='COINIT_APARTMENTTHREADED';return 0;}
 if(method==='CoInitializeEx'){s.initialized=true;s.apartment=Number(args[0])===0?'COINIT_MULTITHREADED':'COINIT_APARTMENTTHREADED';return 0;}
 if(method==='OleUninitialize'||method==='CoUninitialize'){s.initialized=false;return true;}
 if(method==='CoGetApartmentType')return{type:s.apartment,qualifier:'IMPLICIT_MTA_OR_STA',initialized:!!s.initialized};
 if(method==='CoCreateGuid')return guid();
 if(method==='CreateBindCtx'){return alloc(ctx,'IBINDCTX',{options:clone(args[0]||{}),objects:{}});}
 if(method==='CreateItemMoniker'){return alloc(ctx,'IMONIKER',{kindName:'item',delimiter:String(args[0]||'!'),item:String(args[1]||''),displayName:String(args[0]||'!')+String(args[1]||'')});}
 if(method==='CreateFileMoniker'){var fp=String(args[0]||'');return alloc(ctx,'IMONIKER',{kindName:'file',path:fp,displayName:fp});}
 if(method==='MkParseDisplayName'){var dn=String(args[1]!==undefined?args[1]:args[0]||'');return alloc(ctx,'IMONIKER',{kindName:/^[a-zA-Z]:[\\/]/.test(dn)?'file':'display',path:dn,displayName:dn});}
 if(method==='MonikerGetDisplayName'){return monikerName(obj(ctx,args[0],'IMONIKER'));}
 if(method==='MonikerIsEqual'){return monikerName(obj(ctx,args[0],'IMONIKER')).toUpperCase()===monikerName(obj(ctx,args[1],'IMONIKER')).toUpperCase();}
 if(method==='MonikerComposeWith'){var m1=obj(ctx,args[0],'IMONIKER'),m2=obj(ctx,args[1],'IMONIKER'),joiner=String(args[2]||'!');return alloc(ctx,'IMONIKER',{kindName:'composite',displayName:monikerName(m1)+joiner+monikerName(m2)});}
 if(method==='ReleaseMoniker'||method==='ReleaseBindCtx'){delete s.objects[String(parseInt(args[0],10)||0)];return true;}
 if(method==='GetRunningObjectTable')return{handle:'ROT:'+String(ctx.pid||0),processLocal:true};
 if(method==='ROTRegister'){var mon=obj(ctx,args[1],'IMONIKER'),cookie=s.rot.nextCookie++;s.rot.entries[String(cookie)]={cookie:cookie,moniker:monikerName(mon),object:clone(args[0]),flags:Number(args[2])||0};return cookie;}
 if(method==='ROTRevoke'){var ck=String(Number(args[0])||0),had=!!s.rot.entries[ck];delete s.rot.entries[ck];return had;}
 if(method==='ROTIsRunning'){var mn=monikerName(obj(ctx,args[0],'IMONIKER')),rk;for(rk in s.rot.entries)if(Object.prototype.hasOwnProperty.call(s.rot.entries,rk)&&String(s.rot.entries[rk].moniker).toUpperCase()===mn.toUpperCase())return true;return false;}
 if(method==='ROTGetObject'){mn=monikerName(obj(ctx,args[0],'IMONIKER'));for(rk in s.rot.entries)if(Object.prototype.hasOwnProperty.call(s.rot.entries,rk)&&String(s.rot.entries[rk].moniker).toUpperCase()===mn.toUpperCase())return clone(s.rot.entries[rk].object);return null;}
 if(method==='ROTEnumRunning'){var ra=[],re;for(rk in s.rot.entries)if(Object.prototype.hasOwnProperty.call(s.rot.entries,rk)){re=s.rot.entries[rk];ra.push({cookie:re.cookie,moniker:re.moniker,flags:re.flags});}return ra;}
 if(method==='CLSIDFromString'||method==='IIDFromString')return normGuid(args[0]);
 if(method==='StringFromCLSID'||method==='StringFromIID')return normGuid(args[0]);
 if(method==='CoTaskMemAlloc'){
   var size=Math.max(1,Math.min(64*1024*1024,Number(args[0])||1));if(typeof global.jplopsoft_vmmVirtualAlloc!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'ExOS VMM unavailable.');
   var addr=global.jplopsoft_vmmVirtualAlloc(ctx.process,0,size,0x1000|0x2000,0x04);s.taskMem[String(addr)]={address:addr,size:size};return addr;
 }
 if(method==='CoTaskMemFree'){var ad=Number(args[0])||0;if(!s.taskMem[String(ad)])return false;global.jplopsoft_vmmVirtualFree(ctx.process,ad,0,0x8000);delete s.taskMem[String(ad)];return true;}
 if(method==='CoTaskMemRealloc'){var old=Number(args[0])||0,ns=Math.max(1,Math.min(64*1024*1024,Number(args[1])||1)),na=await dispatch(ctx,'CoTaskMemAlloc',[ns]);if(old&&s.taskMem[String(old)]){var os=s.taskMem[String(old)].size,b=global.jplopsoft_vmmRead(ctx.process,old,Math.min(os,ns),true);global.jplopsoft_vmmWrite(ctx.process,na,b,true);await dispatch(ctx,'CoTaskMemFree',[old]);}return na;}
 if(method==='StgCreateDocfile'){return alloc(ctx,'ISTORAGE',{name:String(args[0]||'MemoryStorage'),mode:String(args[1]||'STGM_READWRITE'),elements:{},snapshot:{}});}
 if(method==='StgOpenStorage'){return await dispatch(ctx,'StgCreateDocfile',[args[0],args[1]]);}
 if(method==='StorageCreateStream'){var sg=storageObj(ctx,args[0]),se=storageEnsureStream(sg,args[1],true);return alloc(ctx,'ISTREAM',{data:se.data.slice(0),position:0,name:String(args[1]||''),storage:sg.handle,storageName:String(args[1]||'')});}
 if(method==='StorageOpenStream'){sg=storageObj(ctx,args[0]);se=storageEnsureStream(sg,args[1],false);return alloc(ctx,'ISTREAM',{data:se.data.slice(0),position:0,name:String(args[1]||''),storage:sg.handle,storageName:String(args[1]||'')});}
 if(method==='StorageEnumElements'){sg=storageObj(ctx,args[0]);var ea=[],ek;for(ek in sg.elements)if(Object.prototype.hasOwnProperty.call(sg.elements,ek))ea.push({name:ek,type:sg.elements[ek].type,size:sg.elements[ek].data?sg.elements[ek].data.length:0});return ea;}
 if(method==='StorageCommit'){sg=storageObj(ctx,args[0]);var sk;sg.snapshot={};for(sk in sg.elements)if(Object.prototype.hasOwnProperty.call(sg.elements,sk)){se=sg.elements[sk];sg.snapshot[sk]={type:se.type,data:se.data?se.data.slice(0):null};}return true;}
 if(method==='StorageRevert'){sg=storageObj(ctx,args[0]);sg.elements={};for(sk in sg.snapshot)if(Object.prototype.hasOwnProperty.call(sg.snapshot,sk)){se=sg.snapshot[sk];sg.elements[sk]={type:se.type,data:se.data?se.data.slice(0):null};}return true;}
 if(method==='StorageDestroyElement'){sg=storageObj(ctx,args[0]);var sn=String(args[1]||''),shad=!!sg.elements[sn];delete sg.elements[sn];return shad;}
 if(method==='StorageRenameElement'){sg=storageObj(ctx,args[0]);var so=String(args[1]||''),sdn=String(args[2]||'');if(!sg.elements[so]||!sdn)throw exerr(st('OBJECT_NAME_NOT_FOUND',0xC0000034),'Storage element not found.');sg.elements[sdn]=sg.elements[so];delete sg.elements[so];return true;}
 if(method==='StorageStat'){sg=storageObj(ctx,args[0]);return{name:sg.name,type:'STGTY_STORAGE',mode:sg.mode,elementCount:Object.keys(sg.elements).length};}
 if(method==='ReleaseStorage'){delete s.objects[String(parseInt(args[0],10)||0)];return true;}
 if(method==='CreateDataObject'){h=alloc(ctx,'DATAOBJECT',{formats:{}});o=obj(ctx,h,'DATAOBJECT');var initial=args[0]||{};for(fmt in initial)if(Object.prototype.hasOwnProperty.call(initial,fmt))o.formats[String(fmt)]=clone(initial[fmt]);return h;}
 if(method==='SetData'){o=obj(ctx,args[0],'DATAOBJECT');o.formats[String(args[1])]=clone(args[2]);return true;}
 if(method==='GetData'){o=obj(ctx,args[0],'DATAOBJECT');fmt=String(args[1]);return Object.prototype.hasOwnProperty.call(o.formats,fmt)?clone(o.formats[fmt]):null;}
 if(method==='QueryGetData'){o=obj(ctx,args[0],'DATAOBJECT');return Object.prototype.hasOwnProperty.call(o.formats,String(args[1]));}
 if(method==='EnumFormatEtc'){o=obj(ctx,args[0],'DATAOBJECT');return Object.keys(o.formats);}
 if(method==='GetCanonicalFormatEtc'){return String(args[1]);}
 if(method==='ReleaseDataObject'){delete s.objects[String(parseInt(args[0],10)||0)];return true;}
 if(method==='CreateStreamOnHGlobal'){var initial=bytes(args[0]||new Uint8Array(0));return alloc(ctx,'ISTREAM',{data:initial,position:0,name:String(args[1]||'MemoryStream')});}
 if(method==='StreamRead'){o=obj(ctx,args[0],'ISTREAM');var count=Math.max(0,Math.min(o.data.length-o.position,Number(args[1])||0)),r=o.data.slice(o.position,o.position+count);o.position+=count;return r;}
 if(method==='StreamWrite'){o=obj(ctx,args[0],'ISTREAM');var b=bytes(args[1]),need=o.position+b.length;if(need>64*1024*1024)throw exerr(st('QUOTA_EXCEEDED',0xC0000044),'OLE memory stream exceeds 64 MiB.');if(need>o.data.length){var nd=new Uint8Array(need);nd.set(o.data);o.data=nd;}o.data.set(b,o.position);o.position+=b.length;return b.length;}
 if(method==='StreamSeek'){o=obj(ctx,args[0],'ISTREAM');var origin=String(args[2]||'SET').toUpperCase(),base=origin==='CUR'?o.position:(origin==='END'?o.data.length:0),np=Math.max(0,Math.min(o.data.length,base+(Number(args[1])||0)));o.position=np;return np;}
 if(method==='StreamSetSize'){o=obj(ctx,args[0],'ISTREAM');var sz=Math.max(0,Math.min(64*1024*1024,Number(args[1])||0)),nb=new Uint8Array(sz);nb.set(o.data.subarray(0,Math.min(sz,o.data.length)));o.data=nb;o.position=Math.min(o.position,sz);return true;}
 if(method==='StreamStat'){o=obj(ctx,args[0],'ISTREAM');return{type:'STGTY_STREAM',cbSize:o.data.length,position:o.position,name:o.name,mode:'STGM_READWRITE'};}
 if(method==='StreamClone'){o=obj(ctx,args[0],'ISTREAM');h=alloc(ctx,'ISTREAM',{data:o.data.slice(0),position:o.position,name:o.name+' clone'});return h;}
 if(method==='StreamCommit'){o=obj(ctx,args[0],'ISTREAM');if(o.storage){var ps=storageObj(ctx,o.storage),pe=storageEnsureStream(ps,o.storageName,true);pe.data=o.data.slice(0);}return true;}
 if(method==='ReleaseStream'){o=s.objects[String(parseInt(args[0],10)||0)];if(o&&o.kind==='ISTREAM'&&o.storage){try{var rs=storageObj(ctx,o.storage),re=storageEnsureStream(rs,o.storageName,true);re.data=o.data.slice(0);}catch(ignoreStorageCommit){}}delete s.objects[String(parseInt(args[0],10)||0)];return true;}
 if(method==='OleSetClipboard'){o=obj(ctx,args[0],'DATAOBJECT');if(typeof global.jplopsoft_xshClipboardSetMany!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Clipboard broker unavailable.');return await global.jplopsoft_xshClipboardSetMany(ctx,o.formats);}
 if(method==='OleGetClipboard'){if(typeof global.jplopsoft_xshClipboardSnapshot!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Clipboard broker unavailable.');var snap=await global.jplopsoft_xshClipboardSnapshot(ctx,true);return alloc(ctx,'DATAOBJECT',{formats:snap.formats||{}});}
 if(method==='OleFlushClipboard')return true;
 if(method==='RegisterDragDrop'){var hwnd=parseInt(args[0],10)||0;if(!ctx.windows||!ctx.windows[String(hwnd)])throw exerr(st('ACCESS_DENIED',0xC0000022),'HWND is not owned by this XSH process.');DRAG.targets[String(hwnd)]={ctx:ctx,hwnd:hwnd};return true;}
 if(method==='RevokeDragDrop'){delete DRAG.targets[String(parseInt(args[0],10)||0)];return true;}
 if(method==='DoDragDrop'||method==='BeginDragDrop'){o=obj(ctx,args[0],'DATAOBJECT');DRAG.active={sourceCtx:ctx,sourcePid:parseInt(ctx.pid,10)||0,dataObject:o.handle,formats:Object.keys(o.formats),effects:Array.isArray(args[1])?args[1].map(String):['copy'],effect:'none'};notify(ctx,'OLE:'+o.handle,'dragstart',{formats:DRAG.active.formats,effects:DRAG.active.effects});return{ok:true,dataObject:o.handle,formats:DRAG.active.formats,effects:DRAG.active.effects};}
 if(method==='DragEnter'||method==='DragOver'){if(!DRAG.active)return{effect:'none'};target=DRAG.targets[String(parseInt(args[0],10)||0)];if(!target)return{effect:'none'};var desired=String(args[1]||DRAG.active.effects[0]||'copy');if(DRAG.active.effects.indexOf(desired)<0)desired=DRAG.active.effects[0]||'none';notify(target.ctx,'OLE:'+target.hwnd,method==='DragEnter'?'dragenter':'dragover',{sourcePid:DRAG.active.sourcePid,formats:DRAG.active.formats,effect:desired,point:args[2]||null});DRAG.active.effect=desired;return{effect:desired};}
 if(method==='Drop'){if(!DRAG.active)return{effect:'none'};target=DRAG.targets[String(parseInt(args[0],10)||0)];if(!target)return{effect:'none'};var src=DRAG.active.sourceCtx,so=obj(src,DRAG.active.dataObject,'DATAOBJECT'),formats={};for(fmt in so.formats)if(Object.prototype.hasOwnProperty.call(so.formats,fmt))formats[fmt]=clone(so.formats[fmt]);var effect=String(args[1]||DRAG.active.effect||'copy');notify(target.ctx,'OLE:'+target.hwnd,'drop',{sourcePid:DRAG.active.sourcePid,effect:effect,formats:formats,point:args[2]||null});notify(src,'OLE:'+so.handle,'dragcomplete',{effect:effect,targetHwnd:target.hwnd});DRAG.active=null;return{effect:effect};}
 if(method==='CancelDragDrop'){if(DRAG.active){notify(DRAG.active.sourceCtx,'OLE:'+DRAG.active.dataObject,'dragcancel',{});DRAG.active=null;}return true;}
 if(method==='CoCreateInstance')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Host COM activation is not exposed. Use ExOS facades/data objects/streams.');
 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported ole32.xdl API: '+method);
}
function cleanup(ctx){var s=ctx&&ctx.ole32,k;if(DRAG.active&&DRAG.active.sourceCtx===ctx)DRAG.active=null;for(k in DRAG.targets)if(Object.prototype.hasOwnProperty.call(DRAG.targets,k)&&DRAG.targets[k].ctx===ctx)delete DRAG.targets[k];if(s&&s.taskMem){for(k in s.taskMem)if(Object.prototype.hasOwnProperty.call(s.taskMem,k)){try{global.jplopsoft_vmmVirtualFree(ctx.process,Number(k),0,0x8000);}catch(ignoreMem){}}}if(ctx)ctx.ole32=null;return true;}
global.jplopsoft_OLE32=API;global.jplopsoft_ole32Dispatch=dispatch;global.jplopsoft_ole32Cleanup=cleanup;
})(window);
