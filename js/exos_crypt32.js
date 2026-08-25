/* ExOS crypt32.dll + bcrypt.dll emulation
 * Version: 6.4.0-dev-os79
 * Models: EXOS_CRYPT32_V1 / EXOS_BCRYPT_V1
 * Bridges XSH to trusted host ex_md3.js, exes.js and Web Crypto.
 */
(function(global){'use strict';
var C={version:'6.4.0-dev-os79',model:'EXOS_CRYPT32_V1',ready:true};
var B={version:'6.4.0-dev-os79',model:'EXOS_BCRYPT_V1',ready:true};
function exerr(s,m){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,m);var e=new Error(m);e.ntstatus=s;return e;}
function st(n,d){var k='jplopsoft_STATUS_'+n;return typeof global[k]!=='undefined'?global[k]:d;}
function need(){if(typeof global.ex_md3!=='function'||typeof global.ex_md3n!=='function'||typeof global.exesEncrypt!=='function'||typeof global.exesDecrypt!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'ex_md3.js / exes.js host crypto is unavailable.');}
function bytes(v){if(v instanceof Uint8Array)return v;if(v instanceof ArrayBuffer)return new Uint8Array(v);if(ArrayBuffer.isView(v))return new Uint8Array(v.buffer,v.byteOffset,v.byteLength);if(Array.isArray(v))return new Uint8Array(v);return new TextEncoder().encode(String(v===undefined||v===null?'':v));}
function hex(a){a=bytes(a);var s='',i;for(i=0;i<a.length;i++)s+=('0'+a[i].toString(16)).slice(-2);return s;}
function b64(a){a=bytes(a);var s='',i,chunk=0x8000;for(i=0;i<a.length;i+=chunk)s+=String.fromCharCode.apply(null,Array.prototype.slice.call(a,i,Math.min(a.length,i+chunk)));return btoa(s);}
function fromB64(s){var x=atob(String(s||'')),a=new Uint8Array(x.length),i;for(i=0;i<x.length;i++)a[i]=x.charCodeAt(i)&255;return a;}
function md3Input(v){return typeof v==='string'?v:'EXOS-BINARY|'+b64(bytes(v));}
function dpapiKey(ctx,entropy){need();var stt=global.state||{},sid=String(stt.samSid||ctx&&ctx.process&&ctx.process.token&&ctx.process.token.userSid||''),vault=String(stt.vaultKey||'');if(!vault)throw exerr(st('ACCESS_DENIED',0xC0000022),'ExOS user vault is locked.');return global.ex_md3('EXOS-DPAPI-V1|'+sid+'|'+vault+'|'+String(entropy||''));}
async function cryptDispatch(ctx,method,args){args=args||[];method=String(method||'');need();
 if(method==='GetVersion')return{version:C.version,model:C.model,backends:['ex_md3.js','exes.js','Web Crypto']};
 if(method==='ExMd3'||method==='CryptHashData'){var alg=method==='ExMd3'?'EX_MD3':String(args[1]||'EX_MD3').toUpperCase();if(alg!=='EX_MD3')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'CryptHashData supports EX_MD3; use bcrypt.dll for SHA-2.');return global.ex_md3(md3Input(args[0]));}
 if(method==='ExMd3N'){var it=Math.max(1,Math.min(1000000,parseInt(args[1],10)||1));return global.ex_md3n(md3Input(args[0]),it);}
 if(method==='ExesEncrypt'){return global.exesEncrypt(String(args[0]===undefined?'':args[0]),String(args[1]||''));}
 if(method==='ExesDecrypt'){return global.exesDecrypt(String(args[0]||''),String(args[1]||''));}
 if(method==='CryptProtectData'){var raw=args[0],isBin=typeof raw!=='string',payload=JSON.stringify({v:1,t:isBin?'b':'s',d:isBin?b64(bytes(raw)):String(raw),desc:String(args[1]||'')});return{data:global.exesEncrypt(payload,dpapiKey(ctx,args[2])),description:String(args[1]||''),scope:'CURRENT_USER'};}
 if(method==='CryptUnprotectData'){var p=global.exesDecrypt(String(args[0]||''),dpapiKey(ctx,args[1])),o;try{o=JSON.parse(p);}catch(e){throw exerr(st('DATA_ERROR',0xC000003E),'Protected data is invalid.');}return{data:o.t==='b'?fromB64(o.d):String(o.d||''),description:String(o.desc||''),scope:'CURRENT_USER'};}
 if(method==='CryptBinaryToString'){var f=String(args[1]||'BASE64').toUpperCase();return f==='HEX'?hex(args[0]):b64(args[0]);}
 if(method==='CryptStringToBinary'){var ff=String(args[1]||'BASE64').toUpperCase(),s=String(args[0]||'');if(ff==='HEX'){if(s.length%2)throw exerr(st('INVALID_PARAMETER',0xC000000D),'Invalid HEX length.');var a=new Uint8Array(s.length/2),i;for(i=0;i<a.length;i++)a[i]=parseInt(s.substr(i*2,2),16);return a;}return fromB64(s);}
 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported crypt32.dll API: '+method);
}
async function bcryptDispatch(ctx,method,args){args=args||[];method=String(method||'');
 if(method==='GetVersion')return{version:B.version,model:B.model,backend:'Web Crypto + ex_md3'};
 if(method==='BCryptGenRandom'){var n=Math.max(1,Math.min(16*1024*1024,parseInt(args[0],10)||32)),out=new Uint8Array(n),i;for(i=0;i<n;i+=65536)crypto.getRandomValues(out.subarray(i,Math.min(n,i+65536)));return out;}
 if(method==='BCryptHash'){var alg=String(args[0]||'SHA-256').toUpperCase(),data=bytes(args[1]),key=args[2];if(alg==='EX_MD3'){need();return global.ex_md3(md3Input(args[1]));}if(alg==='EX_MD3N'){need();return global.ex_md3n(md3Input(args[1]),Math.max(1,Math.min(1000000,parseInt(args[2],10)||1)));}var webAlg=alg.replace('SHA256','SHA-256').replace('SHA384','SHA-384').replace('SHA512','SHA-512');if(key!==undefined&&key!==null){var k=await crypto.subtle.importKey('raw',bytes(key),{name:'HMAC',hash:{name:webAlg}},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,data));}return new Uint8Array(await crypto.subtle.digest(webAlg,data));}
 if(method==='BCryptDeriveKeyPBKDF2'){var hash=String(args[0]||'SHA-256').toUpperCase(),password=bytes(args[1]),salt=bytes(args[2]),iter=Math.max(1,Math.min(5000000,parseInt(args[3],10)||100000)),len=Math.max(1,Math.min(1024,parseInt(args[4],10)||32));if(hash==='EX_MD3N'){need();return global.ex_md3n(md3Input(args[1])+'|'+b64(salt),iter);}var key=await crypto.subtle.importKey('raw',password,'PBKDF2',false,['deriveBits']),bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:hash.replace('SHA256','SHA-256').replace('SHA384','SHA-384').replace('SHA512','SHA-512'),salt:salt,iterations:iter},key,len*8);return new Uint8Array(bits);}
 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported bcrypt.dll API: '+method);
}
global.jplopsoft_CRYPT32=C;global.jplopsoft_BCRYPT=B;global.jplopsoft_crypt32Dispatch=cryptDispatch;global.jplopsoft_bcryptDispatch=bcryptDispatch;
})(window);
