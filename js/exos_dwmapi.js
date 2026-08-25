/* ExOS dwmapi.dll emulation
 * Version: 6.4.0-dev-os72
 * Model: EXOS_DWMAPI_V1
 */
(function(global){'use strict';
var API={version:'6.4.0-dev-os72',model:'EXOS_DWMAPI_V1',ready:true};
function rec(hwnd){return typeof global.jplopsoft_user32GetRecord==='function'?global.jplopsoft_user32GetRecord(parseInt(hwnd,10)||0):null;}
function el(hwnd){return typeof global.jplopsoft_GetWindowElement==='function'?global.jplopsoft_GetWindowElement(parseInt(hwnd,10)||0):null;}
function owned(ctx,hwnd){return !!(ctx&&ctx.windows&&ctx.windows[String(parseInt(hwnd,10)||0)]);}
function dispatch(ctx,method,args){args=args||[];var h=parseInt(args[0],10)||0,w,r,opt;
 if(method==='DwmIsCompositionEnabled')return true;
 if(method==='DwmGetWindowAttribute'){r=rec(h);if(!r)return null;var a=String(args[1]||'');if(a==='DWMWA_CLOAKED')return !global.jplopsoft_user32DisplayIsVisible(r);if(a==='DWMWA_EXTENDED_FRAME_BOUNDS')return global.jplopsoft_GetWindowRect(h);if(a==='DWMWA_CAPTION_COLOR')return w?getComputedStyle(w).backgroundColor:'';if(a==='DWMWA_USE_IMMERSIVE_DARK_MODE')return w&&w.getAttribute('data-exos-dwm-dark')==='1';return null;}
 if(!owned(ctx,h))throw global.jplopsoft_xshError(global.jplopsoft_STATUS_ACCESS_DENIED,'HWND is not owned by this XSH process.');w=el(h);if(!w)throw global.jplopsoft_xshError(global.jplopsoft_STATUS_INVALID_HANDLE,'Invalid HWND.');
 if(method==='DwmEnableBlurBehindWindow'){opt=args[1]||{};var enabled=opt.enabled!==false,blur=Math.max(0,Math.min(40,parseInt(opt.blurRadius,10)||10)),opacity=Math.max(.05,Math.min(1,Number(opt.opacity)||.82));w.style.backdropFilter=enabled?'blur('+blur+'px)':'';w.style.webkitBackdropFilter=enabled?'blur('+blur+'px)':'';w.style.backgroundColor=enabled?'rgba(255,255,255,'+opacity+')':'';var c=typeof global.jplopsoft_GetClientElement==='function'?global.jplopsoft_GetClientElement(h):null;if(c)c.style.backgroundColor=enabled?'rgba(255,255,255,'+Math.max(.35,opacity-.18)+')':'';w.setAttribute('data-exos-dwm-blur',enabled?'1':'0');return true;}
 if(method==='DwmExtendFrameIntoClientArea'){opt=args[1]||{};w.style.setProperty('--exos-dwm-frame-top',Math.max(0,parseInt(opt.top,10)||0)+'px');w.style.setProperty('--exos-dwm-frame-right',Math.max(0,parseInt(opt.right,10)||0)+'px');w.style.setProperty('--exos-dwm-frame-bottom',Math.max(0,parseInt(opt.bottom,10)||0)+'px');w.style.setProperty('--exos-dwm-frame-left',Math.max(0,parseInt(opt.left,10)||0)+'px');return true;}
 if(method==='DwmSetWindowAttribute'){var attr=String(args[1]||''),v=args[2];if(attr==='DWMWA_USE_IMMERSIVE_DARK_MODE'){w.setAttribute('data-exos-dwm-dark',v?'1':'0');return true;}if(attr==='DWMWA_WINDOW_CORNER_PREFERENCE'){w.style.borderRadius=v==='round'||Number(v)===2?'8px':v==='roundsmall'||Number(v)===3?'4px':'0';w.style.overflow='hidden';return true;}if(attr==='DWMWA_SYSTEMBACKDROP_TYPE'){if(v==='mica'||v===2){w.style.backdropFilter='blur(18px) saturate(1.15)';w.style.webkitBackdropFilter='blur(18px) saturate(1.15)';w.style.backgroundColor='rgba(246,246,246,.78)';}return true;}return false;}
 if(method==='DwmFlush')return new Promise(function(resolve){requestAnimationFrame(function(){resolve(true);});});
 throw global.jplopsoft_xshError(global.jplopsoft_STATUS_NOT_SUPPORTED,'Unsupported dwmapi.dll API: '+method);
}
global.jplopsoft_DWMAPI=API;global.jplopsoft_dwmapiDispatch=dispatch;
})(window);
