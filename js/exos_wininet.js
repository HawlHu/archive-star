/* ExOS wininet.xdl emulation
 * Version: 6.4.0-dev-os86
 * Model: EXOS_WININET_V1
 * Client: V8-only browsers
 *
 * Network is brokered by the trusted ExOS host. XSH never receives fetch,
 * XMLHttpRequest or browser credential/cookie handles.
 */
(function(global){
'use strict';
var API={version:'6.4.0-dev-os86',model:'EXOS_WININET_V1',ready:true};
var POLICY={
  name:'PUBLIC_WEB_ONLY',
  schemes:['http:','https:'],
  websocketSchemes:['ws:','wss:'],
  maxResponseBytes:16*1024*1024,
  maxRequestBytes:8*1024*1024,
  maxHandlesPerProcess:64,
  credentials:'omit',
  cors:true,
  blockPrivateAddressLiterals:true
};
function exerr(status,msg){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(status,msg);var e=new Error(msg);e.ntstatus=status;return e;}
function status(name,fallback){var k='jplopsoft_STATUS_'+name;return typeof global[k]!=='undefined'?global[k]:fallback;}
function invalid(msg){throw exerr(status('INVALID_PARAMETER',0xC000000D),msg||'Invalid WinINet parameter.');}
function denied(msg){throw exerr(status('ACCESS_DENIED',0xC0000022),msg||'Network policy denied the request.');}
function unsupported(msg){throw exerr(status('NOT_SUPPORTED',0xC00000BB),msg||'WinINet operation is not supported.');}
function quota(msg){throw exerr(status('QUOTA_EXCEEDED',0xC0000044),msg||'WinINet quota exceeded.');}
function pid(ctx){return parseInt(ctx&&ctx.pid,10)||0;}
function state(ctx){if(!ctx.wininet)ctx.wininet={next:0xA100,handles:{},log:[]};return ctx.wininet;}
function count(o){var n=0,k;for(k in o)if(o.hasOwnProperty(k))n++;return n;}
function alloc(ctx,rec){var s=state(ctx),h;if(count(s.handles)>=POLICY.maxHandlesPerProcess)quota('Maximum WinINet handle count reached.');h=s.next++;while(s.handles[String(h)])h=s.next++;rec.handle=h;s.handles[String(h)]=rec;return h;}
function get(ctx,h,kind){var r=state(ctx).handles[String(parseInt(h,10)||0)];if(!r||(kind&&r.kind!==kind))throw exerr(status('INVALID_HANDLE',0xC0000008),'Invalid WinINet handle.');return r;}
function close(ctx,h){var s=state(ctx),k=String(parseInt(h,10)||0),r=s.handles[k];if(!r)return false;delete s.handles[k];return true;}
function log(ctx,action,url,result){var s=state(ctx);s.log.push({time:new Date().toISOString(),pid:pid(ctx),action:String(action||''),url:String(url||''),result:String(result||'')});while(s.log.length>100)s.log.shift();}
function hostPrivate(host){
  host=String(host||'').toLowerCase().replace(/^\[|\]$/g,'');
  if(!host)return true;
  if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal'))return true;
  if(host==='::1'||host==='0:0:0:0:0:0:0:1'||host.indexOf('fe80:')===0||host.indexOf('fc')===0||host.indexOf('fd')===0)return true;
  var m=host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/),a,b;
  if(!m)return false;
  a=parseInt(m[1],10);b=parseInt(m[2],10);
  if(a===0||a===10||a===127)return true;
  if(a===169&&b===254)return true;
  if(a===172&&b>=16&&b<=31)return true;
  if(a===192&&b===168)return true;
  if(a===100&&b>=64&&b<=127)return true;
  if(a>=224)return true;
  return false;
}
function validateUrl(raw,schemes){
  var u;
  try{u=new URL(String(raw||''));}catch(e){invalid('Invalid URL.');}
  schemes=schemes||POLICY.schemes;
  if(schemes.indexOf(String(u.protocol||'').toLowerCase())<0)denied('URL scheme is not permitted by ExOS network policy.');
  if(u.username||u.password)denied('Credentials embedded in URLs are not permitted.');
  if(POLICY.blockPrivateAddressLiterals&&hostPrivate(u.hostname))denied('Private/local network destinations are blocked by the default ExOS policy.');
  return u;
}
global.jplopsoft_netPolicyValidate=validateUrl;
global.jplopsoft_netPolicy=POLICY;
function headersObject(h){var o={};if(!h)return o;if(typeof h.forEach==='function'){h.forEach(function(v,k){o[String(k).toLowerCase()]=String(v);});return o;}if(typeof h==='string'){h.split(/\r?\n/).forEach(function(line){var i=line.indexOf(':');if(i>0)o[line.substring(0,i).trim().toLowerCase()]=line.substring(i+1).trim();});return o;}for(var k in h)if(h.hasOwnProperty(k))o[String(k).toLowerCase()]=String(h[k]);return o;}
function bodyBytes(body){if(body===undefined||body===null)return 0;if(typeof body==='string')return new TextEncoder().encode(body).byteLength;if(body instanceof ArrayBuffer)return body.byteLength;if(ArrayBuffer.isView(body))return body.byteLength;if(Array.isArray(body))return body.length;return new TextEncoder().encode(JSON.stringify(body)).byteLength;}
function fetchBody(body){if(body===undefined||body===null)return undefined;if(typeof body==='string'||body instanceof ArrayBuffer||ArrayBuffer.isView(body)||body instanceof Blob)return body;if(Array.isArray(body))return new Uint8Array(body);return JSON.stringify(body);}
async function perform(ctx,rec,extraHeaders,body,opt){
  opt=opt||{};var u=validateUrl(rec.url,POLICY.schemes),bytes=bodyBytes(body);if(bytes>POLICY.maxRequestBytes)quota('HTTP request body exceeds 8 MiB.');
  var hdr=headersObject(rec.headers),more=headersObject(extraHeaders),k;for(k in more)hdr[k]=more[k];
  /* Cookie/Authorization are application-controlled data. Browser credential jars are never attached. */
  var controller=typeof AbortController==='function'?new AbortController():null,timeout=Math.max(1000,Math.min(120000,parseInt(opt.timeoutMs,10)||30000)),timer=null,res,ab;
  try{
    if(controller)timer=setTimeout(function(){try{controller.abort();}catch(ignore){}},timeout);
    res=await fetch(u.href,{method:String(rec.method||'GET').toUpperCase(),headers:hdr,body:/^(GET|HEAD)$/i.test(rec.method)?undefined:fetchBody(body),credentials:'omit',cache:'no-store',redirect:'follow',referrerPolicy:'no-referrer',mode:'cors',signal:controller?controller.signal:undefined});
    ab=await res.arrayBuffer();
    if(ab.byteLength>POLICY.maxResponseBytes)quota('HTTP response exceeds 16 MiB WinINet broker quota.');
    rec.response={status:res.status,statusText:String(res.statusText||''),url:String(res.url||u.href),headers:headersObject(res.headers),data:new Uint8Array(ab),position:0,ok:!!res.ok,redirected:!!res.redirected};
    log(ctx,rec.method,u.href,String(res.status));
    return {handle:rec.handle,statusCode:res.status,statusText:rec.response.statusText,url:rec.response.url,headers:rec.response.headers,contentLength:ab.byteLength,ok:!!res.ok,redirected:!!res.redirected};
  }catch(e){log(ctx,rec.method,u.href,'ERROR '+String(e&&e.message||e));throw exerr(status('NETWORK_UNREACHABLE',0xC000023C),'WinINet request failed (CORS/browser/network policy may apply): '+String(e&&e.message?e.message:e));}
  finally{if(timer!==null)clearTimeout(timer);}
}
async function dispatch(ctx,method,args){
  args=args||[];method=String(method||'');var r,h,u,opt;
  if(method==='GetVersion')return{version:API.version,model:API.model,backend:'Browser Fetch broker',policy:POLICY.name};
  if(method==='QueryNetworkPolicy')return JSON.parse(JSON.stringify(POLICY));
  if(method==='GetNetworkLog')return state(ctx).log.slice();
  if(method==='InternetOpen'){h=alloc(ctx,{kind:'session',agent:String(args[0]||'ExOS XSH'),createdAt:Date.now()});return h;}
  if(method==='InternetCrackUrl'){u=validateUrl(args[0],POLICY.schemes);return{scheme:u.protocol.replace(':',''),host:u.hostname,port:u.port?parseInt(u.port,10):(u.protocol==='https:'?443:80),path:u.pathname||'/',query:u.search||'',fragment:u.hash||'',url:u.href};}
  if(method==='HttpOpenRequest'){get(ctx,args[0],'session');u=validateUrl(args[2],POLICY.schemes);h=alloc(ctx,{kind:'request',session:parseInt(args[0],10)||0,method:String(args[1]||'GET').toUpperCase(),url:u.href,headers:headersObject(args[3]),response:null});return h;}
  if(method==='HttpAddRequestHeaders'){r=get(ctx,args[0],'request');var add=headersObject(args[1]),k;for(k in add)r.headers[k]=add[k];return true;}
  if(method==='HttpSendRequest'){r=get(ctx,args[0],'request');return await perform(ctx,r,args[1],args[2],args[3]||{});}
  if(method==='InternetOpenUrl'){get(ctx,args[0],'session');u=validateUrl(args[1],POLICY.schemes);h=alloc(ctx,{kind:'request',session:parseInt(args[0],10)||0,method:'GET',url:u.href,headers:headersObject(args[2]),response:null});await perform(ctx,get(ctx,h,'request'),null,null,args[3]||{});return h;}
  if(method==='InternetQueryInfo'){r=get(ctx,args[0]);if(r.kind==='session')return{handle:r.handle,kind:r.kind,agent:r.agent};if(!r.response)return{handle:r.handle,kind:r.kind,method:r.method,url:r.url,sent:false};return{handle:r.handle,kind:r.kind,method:r.method,url:r.response.url,statusCode:r.response.status,statusText:r.response.statusText,headers:r.response.headers,contentLength:r.response.data.length,position:r.response.position,eof:r.response.position>=r.response.data.length,ok:r.response.ok};}
  if(method==='InternetReadFile'){r=get(ctx,args[0]);if(!r.response)invalid('HTTP response is not available.');var n=Math.max(1,Math.min(1024*1024,parseInt(args[1],10)||65536)),p=r.response.position,end=Math.min(r.response.data.length,p+n),data=r.response.data.slice(p,end);r.response.position=end;return{data:data,bytesRead:data.length,eof:end>=r.response.data.length};}
  if(method==='InternetReadText'){r=get(ctx,args[0]);if(!r.response)invalid('HTTP response is not available.');var remaining=r.response.data.slice(r.response.position),enc=String(args[1]||'utf-8');r.response.position=r.response.data.length;try{return new TextDecoder(enc).decode(remaining);}catch(e){return new TextDecoder('utf-8').decode(remaining);}}
  if(method==='InternetCloseHandle')return close(ctx,args[0]);
  unsupported('Unsupported wininet.xdl API: '+method);
}
function cleanup(ctx){if(ctx)ctx.wininet=null;return true;}
global.jplopsoft_WININET=API;global.jplopsoft_wininetDispatch=dispatch;global.jplopsoft_wininetCleanup=cleanup;
})(window);
