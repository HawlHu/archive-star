/* ExOS uxtheme.dll emulation
 * Version: 6.4.0-dev-os60
 * Model: EXOS_UXTHEME_V1
 * Client: V8-only browsers
 */
(function(global){
'use strict';
var UX={version:'6.4.0-dev-os60',model:'EXOS_UXTHEME_V1',ready:true,current:'windows10',handles:{},nextHandle:1};
var THEMES={
  windows10:{name:'Windows 10',dark:false,vars:{
    '--exos-ui-font':'"Segoe UI",Arial,sans-serif','--exos-ui-bg':'#ffffff','--exos-ui-surface':'#f8fafc','--exos-ui-surface-2':'#f1f5f9','--exos-ui-text':'#111827','--exos-ui-muted':'#64748b','--exos-ui-border':'#cbd5e1','--exos-ui-border-soft':'#dbe3ec','--exos-ui-accent':'#0078d7','--exos-ui-accent-soft':'#e5f1fb','--exos-ui-hover':'#eaf4fd','--exos-ui-selected':'#cce8ff','--exos-ui-danger':'#c42b1c','--exos-ui-radius':'2px','--exos-ui-shadow':'0 8px 28px rgba(15,23,42,.22)'
  }},
  dark:{name:'Dark',dark:true,vars:{
    '--exos-ui-font':'"Segoe UI",Arial,sans-serif','--exos-ui-bg':'#202020','--exos-ui-surface':'#2b2b2b','--exos-ui-surface-2':'#323232','--exos-ui-text':'#f3f4f6','--exos-ui-muted':'#b4b4b4','--exos-ui-border':'#565656','--exos-ui-border-soft':'#454545','--exos-ui-accent':'#60a5fa','--exos-ui-accent-soft':'#17365d','--exos-ui-hover':'#343f4e','--exos-ui-selected':'#164e87','--exos-ui-danger':'#ff6b5f','--exos-ui-radius':'2px','--exos-ui-shadow':'0 8px 28px rgba(0,0,0,.45)'
  }}
};
function installStyle(){
  if(document.getElementById('jplopsoft_exos_uxtheme_styles'))return;
  var st=document.createElement('style');st.id='jplopsoft_exos_uxtheme_styles';st.type='text/css';
  st.textContent=':root{--exos-ui-font:"Segoe UI",Arial,sans-serif;--exos-ui-bg:#fff;--exos-ui-surface:#f8fafc;--exos-ui-surface-2:#f1f5f9;--exos-ui-text:#111827;--exos-ui-muted:#64748b;--exos-ui-border:#cbd5e1;--exos-ui-border-soft:#dbe3ec;--exos-ui-accent:#0078d7;--exos-ui-accent-soft:#e5f1fb;--exos-ui-hover:#eaf4fd;--exos-ui-selected:#cce8ff;--exos-ui-radius:2px;--exos-ui-shadow:0 8px 28px rgba(15,23,42,.22)}'+
  '.jplopsoft_xsh-control{font-family:var(--exos-ui-font);color:var(--exos-ui-text);box-sizing:border-box}'+
  '.jplopsoft_xsh-control-button{min-height:28px;padding:3px 12px;border:1px solid var(--exos-ui-border);border-radius:var(--exos-ui-radius);background:linear-gradient(#fff,var(--exos-ui-surface-2));color:var(--exos-ui-text);transition:background .08s,border-color .08s,box-shadow .08s}'+
  '.jplopsoft_xsh-control-button:hover{background:var(--exos-ui-hover);border-color:#7aa7d9}.jplopsoft_xsh-control-button:active{background:var(--exos-ui-selected);box-shadow:inset 0 1px 2px rgba(0,0,0,.12)}'+
  '.jplopsoft_xsh-control-input,.jplopsoft_xsh-control-textarea{border:1px solid var(--exos-ui-border);background:var(--exos-ui-bg);color:var(--exos-ui-text);border-radius:var(--exos-ui-radius);padding:5px 7px;outline:none}'+
  '.jplopsoft_xsh-control-input:focus,.jplopsoft_xsh-control-textarea:focus{border-color:var(--exos-ui-accent);box-shadow:0 0 0 1px var(--exos-ui-accent)}'+
  '.jplopsoft_dwm-surface{color:var(--exos-ui-text)} .jplopsoft_dwm-surface .jplopsoft_xsh-host-client{background:var(--exos-ui-bg)}'+
  '.jplopsoft_comctl{font-family:var(--exos-ui-font)!important;color:var(--exos-ui-text)!important}.jplopsoft_comctl-listview,.jplopsoft_comctl-treeview,.jplopsoft_comctl-tabs{background:var(--exos-ui-bg)!important;border-color:var(--exos-ui-border)!important;color:var(--exos-ui-text)!important}'+
  '.jplopsoft_comctl-lv-header,.jplopsoft_comctl-header,.jplopsoft_comctl-toolbar,.jplopsoft_comctl-statusbar{background:var(--exos-ui-surface-2)!important;border-color:var(--exos-ui-border)!important;color:var(--exos-ui-text)!important}'+
  '.jplopsoft_comctl-lv-row:hover,.jplopsoft_comctl-tv-row:hover,.jplopsoft_comctl-lv-iconitem:hover,.jplopsoft_comctl-lv-listitem:hover{background:var(--exos-ui-hover)!important}'+
  '.jplopsoft_comctl-lv-row[data-selected="1"],.jplopsoft_comctl-tv-row[data-selected="1"],.jplopsoft_comctl-lv-iconitem[data-selected="1"],.jplopsoft_comctl-lv-listitem[data-selected="1"]{background:var(--exos-ui-selected)!important;color:var(--exos-ui-text)!important}';
  document.getElementsByTagName('head')[0].appendChild(st);
}
function applyTheme(name){var t=THEMES[String(name||'').toLowerCase()]||THEMES.windows10,k,root=document.documentElement;for(k in t.vars)if(t.vars.hasOwnProperty(k))root.style.setProperty(k,t.vars[k]);root.setAttribute('data-exos-theme',t.dark?'dark':'windows10');UX.current=t.dark?'dark':'windows10';return {ok:true,name:t.name,id:UX.current,dark:t.dark};}
function windowEl(hwnd){return typeof global.jplopsoft_GetWindowElement==='function'?global.jplopsoft_GetWindowElement(parseInt(hwnd,10)||0):null;}
function dispatch(ctx,method,args){args=args||[];installStyle();
 if(method==='IsThemeActive')return true;
 if(method==='IsAppThemed')return true;
 if(method==='GetCurrentThemeName')return UX.current;
 if(method==='ApplyTheme')return applyTheme(args[0]);
 if(method==='OpenThemeData'){var h=UX.nextHandle++;UX.handles[String(h)]={handle:h,pid:ctx?ctx.pid:0,hwnd:parseInt(args[0],10)||0,classList:String(args[1]||'')};return h;}
 if(method==='CloseThemeData'){delete UX.handles[String(parseInt(args[0],10)||0)];return true;}
 if(method==='SetWindowTheme'){var el=windowEl(args[0]);if(!el)return false;el.setAttribute('data-exos-window-theme',String(args[1]||''));if(args[2])el.setAttribute('data-exos-window-theme-subid',String(args[2]));return true;}
 if(method==='GetThemeColor'){var key=String(args[1]||args[0]||'accent').toLowerCase(),map={accent:'--exos-ui-accent',background:'--exos-ui-bg',surface:'--exos-ui-surface',text:'--exos-ui-text',border:'--exos-ui-border',selected:'--exos-ui-selected',hover:'--exos-ui-hover'};return getComputedStyle(document.documentElement).getPropertyValue(map[key]||'--exos-ui-accent').trim();}
 if(method==='GetThemeMetric'){var m=String(args[0]||'').toLowerCase();if(m==='cornerRadius'.toLowerCase())return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--exos-ui-radius'),10)||2;if(m==='animationDuration'.toLowerCase())return 80;return 0;}
 throw global.jplopsoft_xshError(global.jplopsoft_STATUS_NOT_SUPPORTED,'Unsupported uxtheme.dll API: '+method);
}
installStyle();applyTheme('windows10');
global.jplopsoft_UXTHEME=UX;global.jplopsoft_uxthemeDispatch=dispatch;
})(window);
