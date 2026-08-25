/* ExOS ws2_32.dll emulation
 * Version: 6.4.0-dev-os80
 * Model: EXOS_WS2_32_V1
 * Browser limitation: WebSocket broker only; raw TCP/UDP sockets are not exposed.
 */
(function(global){'use strict';
var API={version:'6.4.0-dev-os80',model:'EXOS_WS2_32_V1',ready:true};
function exerr(status,msg){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(status,msg);var e=new Error(msg);e.ntstatus=status;return e;}
function st(n,d){var k='jplopsoft_STATUS_'+n;return typeof global[k]!=='undefined'?global[k]:d;}
function state(ctx){if(!ctx.ws2)ctx.ws2={next:0xA800,sockets:{},started:false};return ctx.ws2;}
function rec(ctx,h){var r=state(ctx).sockets[String(parseInt(h,10)||0)];if(!r)throw exerr(st('INVALID_HANDLE',0xC0000008),'Invalid socket handle.');return r;}
function notify(ctx,r,action,data){if(typeof global.jplopsoft_xshSendEvent==='function')global.jplopsoft_xshSendEvent(ctx,{event:'ws2_32',controlId:'WS2:'+r.handle,action:action,socket:r.handle,data:data||null});}
function enqueue(ctx,r,msg){if(r.waiters.length){var w=r.waiters.shift();if(w.timer)clearTimeout(w.timer);w.resolve(msg);return;}r.queue.push(msg);while(r.queue.length>1024)r.queue.shift();notify(ctx,r,'message',{type:msg.type,bytes:msg.type==='binary'&&msg.data?msg.data.length:undefined});}
function closeRec(ctx,r,code,reason){if(r.closed)return;r.closed=true;r.state='closed';r.closeCode=Number(code)||1000;r.closeReason=String(reason||'');while(r.waiters.length){var w=r.waiters.shift();if(w.timer)clearTimeout(w.timer);w.resolve(null);}notify(ctx,r,'close',{code:r.closeCode,reason:r.closeReason});}
async function dispatch(ctx,method,args){args=args||[];method=String(method||'');var s=state(ctx),r,h,url,opt;
 if(method==='GetVersion')return{version:API.version,model:API.model,backend:'Browser WebSocket broker',rawTcp:false,udp:false};
 if(method==='WSAStartup'){s.started=true;return{version:'2.2',highVersion:'2.2',description:'ExOS WebSocket-backed Winsock facade',systemStatus:'Running'};}
 if(method==='WSACleanup'){cleanup(ctx);return 0;}
 if(method==='socket'){if(!s.started)s.started=true;var type=Number(args[1])||1;if(type!==1)throw exerr(st('NOT_SUPPORTED',0xC00000BB),'SOCK_DGRAM/raw UDP is unavailable in browser ExOS.');h=s.next++;s.sockets[String(h)]={handle:h,state:'created',ws:null,queue:[],waiters:[],closed:false,protocols:[],url:'',closeCode:0,closeReason:''};return h;}
 if(method==='connect'||method==='WebSocketConnect'){
   r=rec(ctx,args[0]);if(r.state!=='created'&&r.state!=='closed')throw exerr(st('INVALID_PARAMETER',0xC000000D),'Socket is already connected.');
   opt=args[2]||{};url=String(typeof args[1]==='string'?args[1]:(args[1]&&args[1].url)||'');
   if(typeof global.jplopsoft_netPolicyValidate!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'ExOS network policy engine is unavailable.');
   url=global.jplopsoft_netPolicyValidate(url,['ws:','wss:']).href;r.url=url;r.closed=false;r.state='connecting';r.protocols=Array.isArray(opt.protocols)?opt.protocols.slice(0,8).map(String):[];
   return await new Promise(function(resolve,reject){var done=false,timer=null,ws;try{ws=new WebSocket(url,r.protocols);r.ws=ws;ws.binaryType='arraybuffer';}catch(e){r.state='closed';reject(exerr(st('NETWORK_UNREACHABLE',0xC000023C),String(e&&e.message||e)));return;}
     function finish(ok,val){if(done)return;done=true;if(timer)clearTimeout(timer);ok?resolve(val):reject(val);}
     timer=setTimeout(function(){try{ws.close();}catch(ignore){}finish(false,exerr(st('IO_TIMEOUT',0xC00000B5),'WebSocket connect timeout.'));},Math.max(1000,Math.min(60000,parseInt(opt.timeoutMs,10)||15000)));
     ws.onopen=function(){r.state='open';notify(ctx,r,'open',{url:url,protocol:String(ws.protocol||'')});finish(true,0);};
     ws.onerror=function(){notify(ctx,r,'error',{url:url});if(r.state==='connecting')finish(false,exerr(st('NETWORK_UNREACHABLE',0xC000023C),'WebSocket connection failed.'));};
     ws.onclose=function(e){closeRec(ctx,r,e.code,e.reason);if(r.state==='connecting')finish(false,exerr(st('CONNECTION_DISCONNECTED',0xC000020C),'WebSocket closed during connect.'));};
     ws.onmessage=function(e){if(typeof e.data==='string'){enqueue(ctx,r,{type:'text',data:String(e.data)});return;}if(e.data instanceof ArrayBuffer){enqueue(ctx,r,{type:'binary',data:new Uint8Array(e.data)});return;}if(e.data&&typeof e.data.arrayBuffer==='function'){e.data.arrayBuffer().then(function(ab){enqueue(ctx,r,{type:'binary',data:new Uint8Array(ab)});});}};
   });
 }
 if(method==='send'){r=rec(ctx,args[0]);if(!r.ws||r.state!=='open')throw exerr(st('CONNECTION_DISCONNECTED',0xC000020C),'Socket is not connected.');if(r.ws.bufferedAmount>4*1024*1024)throw exerr(st('QUOTA_EXCEEDED',0xC0000044),'WebSocket send buffer exceeds 4 MiB.');var d=args[1];if(Array.isArray(d))d=new Uint8Array(d);r.ws.send(d);return typeof d==='string'?d.length:(d&&d.byteLength)||0;}
 if(method==='recv'){r=rec(ctx,args[0]);if(r.queue.length)return r.queue.shift();if(r.closed)return null;var timeout=parseInt(args[1],10);if(isNaN(timeout))timeout=0;return await new Promise(function(resolve){var w={resolve:resolve,timer:0};r.waiters.push(w);if(timeout>0)w.timer=setTimeout(function(){var i=r.waiters.indexOf(w);if(i>=0)r.waiters.splice(i,1);resolve(null);},Math.min(timeout,60000));});}
 if(method==='shutdown'){r=rec(ctx,args[0]);if(r.ws&&r.state==='open')try{r.ws.close(1000,'shutdown');}catch(ignore){}return 0;}
 if(method==='closesocket'){r=rec(ctx,args[0]);if(r.ws)try{r.ws.close(1000,'closesocket');}catch(ignore){}closeRec(ctx,r,1000,'closesocket');delete s.sockets[String(r.handle)];return 0;}
 if(method==='GetSocketState'||method==='getsockopt'){r=rec(ctx,args[0]);return{handle:r.handle,state:r.state,url:r.url,queued:r.queue.length,bufferedAmount:r.ws?Number(r.ws.bufferedAmount)||0:0,protocol:r.ws?String(r.ws.protocol||''):'',closeCode:r.closeCode,closeReason:r.closeReason};}
 if(method==='select'){var list=Array.isArray(args[0])?args[0]:[],out=[];for(var i=0;i<list.length;i++){try{r=rec(ctx,list[i]);out.push({socket:r.handle,readable:r.queue.length>0||r.closed,writable:r.state==='open'&&(!r.ws||r.ws.bufferedAmount<4*1024*1024),closed:r.closed});}catch(ignore){}}return out;}
 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported ws2_32.dll API: '+method);
}
function cleanup(ctx){var s=ctx&&ctx.ws2,k,r;if(!s)return true;for(k in s.sockets)if(s.sockets.hasOwnProperty(k)){r=s.sockets[k];try{if(r.ws)r.ws.close(1001,'process exit');}catch(ignore){}closeRec(ctx,r,1001,'process exit');}ctx.ws2=null;return true;}
global.jplopsoft_WS2_32=API;global.jplopsoft_ws2Dispatch=dispatch;global.jplopsoft_ws2Cleanup=cleanup;
})(window);
