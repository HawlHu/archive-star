/* ExOS comdlg32.dll emulation
 * Version: 6.4.0-dev-os77
 * Model: EXOS_COMDLG32_V1
 * Client: V8-only browsers
 *
 * Common Dialog Box Library for XSH applications.
 * Host-owned UI only: XSH never receives DOM nodes, browser File handles,
 * native printer handles, or access to the host filesystem.
 *
 * Implemented families:
 * - GetOpenFileName / GetSaveFileName
 * - ChooseColor
 * - ChooseFont
 * - PrintDlg / PrintDlgEx
 * - PageSetupDlg
 * - FindText / ReplaceText (modeless notification dialogs)
 */
(function(global){
'use strict';

var API={
  version:'6.4.0-dev-os77',
  model:'EXOS_COMDLG32_V1',
  ready:true
};

var BASIC_COLORS=[
  '#000000','#800000','#008000','#808000','#000080','#800080','#008080','#c0c0c0',
  '#808080','#ff0000','#00ff00','#ffff00','#0000ff','#ff00ff','#00ffff','#ffffff',
  '#400000','#804000','#004000','#004040','#000040','#400040','#004080','#808040',
  '#804040','#ff8040','#008040','#00ff80','#008080','#0080ff','#8000ff','#804080',
  '#ff8080','#ffc080','#80ff80','#80ffc0','#80ffff','#80c0ff','#8080ff','#ff80ff',
  '#400080','#804080','#408000','#808000','#008000','#008080','#004080','#404080'
];

var FONT_SIZES=[8,9,10,11,12,14,16,18,20,22,24,26,28,32,36,48,72];
var PAPER_SPECS={
  A4:{name:'A4',widthMm:210,heightMm:297},
  LETTER:{name:'Letter',widthMm:215.9,heightMm:279.4},
  LEGAL:{name:'Legal',widthMm:215.9,heightMm:355.6},
  A3:{name:'A3',widthMm:297,heightMm:420},
  A5:{name:'A5',widthMm:148,heightMm:210}
};

function status(name,fallback){
  var k='jplopsoft_STATUS_'+name;
  return typeof global[k]!=='undefined'?global[k]:fallback;
}
function exerr(st,msg){
  if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(st,msg);
  var e=new Error(String(msg||'Common dialog error.'));e.ntstatus=st;return e;
}
function invalid(msg){throw exerr(status('INVALID_PARAMETER',0xC000000D),msg||'Invalid common-dialog parameter.');}
function unsupported(msg){throw exerr(status('NOT_SUPPORTED',0xC00000BB),msg||'Common dialog operation is unavailable.');}
function state(ctx){
  if(!ctx.comdlg32)ctx.comdlg32={nextHandle:0xA000,dialogs:{},lastError:0};
  return ctx.comdlg32;
}
function pid(ctx){return parseInt(ctx&&ctx.pid,10)||0;}
function esc(s){return String(s===undefined||s===null?'':s);}
function clamp(v,a,b,d){v=Number(v);if(!isFinite(v))v=d;return Math.max(a,Math.min(b,v));}
function iv(v,d){v=parseInt(v,10);return isNaN(v)?(d||0):v;}
function normalizePath(path){
  var p=String(path||'').replace(/\//g,'\\').replace(/\\{2,}/g,'\\');
  if(/^C:$/i.test(p))p+='\\';
  if(p.length>3)p=p.replace(/\\+$/,'');
  return p;
}
function baseName(path){var p=normalizePath(path),i=p.lastIndexOf('\\');return i>=0?p.substring(i+1):p;}
function parentPath(path){
  var p=normalizePath(path),i;
  if(/^C:\\$/i.test(p))return'';
  i=p.lastIndexOf('\\');
  return i<=2?'C:\\':p.substring(0,i);
}
function joinPath(base,name){
  var b=normalizePath(base),n=String(name||'').replace(/^[\\\/]+/,'').replace(/[\\\/]+$/,'');
  if(!n)return b;
  return b==='C:\\'?b+n:b+'\\'+n;
}
function extension(path){var n=baseName(path),i=n.lastIndexOf('.');return i>0?n.substring(i+1).toLowerCase():'';}
function hasExtension(path){return /(^|\\)[^\\]+\.[^\\.]+$/.test(String(path||''));}
function ensureStyle(){
  if(document.getElementById('jplopsoft_exos_comdlg32_styles'))return;
  var st=document.createElement('style');
  st.id='jplopsoft_exos_comdlg32_styles';st.type='text/css';
  st.textContent=
    '.exos-comdlg-backdrop{position:fixed;inset:0;z-index:2147483300;background:rgba(15,23,42,.24);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;font-family:var(--exos-ui-font,"Segoe UI",Arial,sans-serif);color:var(--exos-ui-text,#111827)}'+
    '.exos-comdlg-window{position:fixed;display:flex;flex-direction:column;min-width:320px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);background:var(--exos-ui-bg,#fff);border:1px solid var(--exos-ui-border,#aeb7c2);box-shadow:0 20px 55px rgba(15,23,42,.34);border-radius:4px;overflow:hidden}'+
    '.exos-comdlg-modeless{position:fixed;z-index:2147483290;display:flex;flex-direction:column;background:var(--exos-ui-bg,#fff);border:1px solid var(--exos-ui-border,#aeb7c2);box-shadow:0 15px 42px rgba(15,23,42,.30);border-radius:4px;overflow:hidden;font-family:var(--exos-ui-font,"Segoe UI",Arial,sans-serif);color:var(--exos-ui-text,#111827)}'+
    '.exos-comdlg-title{display:flex;align-items:center;min-height:34px;padding:0 10px;background:var(--exos-ui-surface-2,#f1f5f9);border-bottom:1px solid var(--exos-ui-border-soft,#dbe3ec);font-size:13px;font-weight:600;user-select:none;cursor:default}'+
    '.exos-comdlg-title span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.exos-comdlg-title button{width:30px;height:27px;border:0;background:transparent;font-size:18px;line-height:18px}.exos-comdlg-title button:hover{background:#fee2e2;color:#b91c1c}'+
    '.exos-comdlg-body{flex:1;min-height:0;overflow:auto;padding:12px;box-sizing:border-box}.exos-comdlg-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:9px 12px;border-top:1px solid var(--exos-ui-border-soft,#dbe3ec);background:var(--exos-ui-surface,#f8fafc)}'+
    '.exos-comdlg-button{min-width:82px;min-height:29px;padding:4px 12px;border:1px solid var(--exos-ui-border,#9aa7b5);border-radius:2px;background:linear-gradient(#fff,var(--exos-ui-surface-2,#f1f5f9));color:var(--exos-ui-text,#111827);font:13px var(--exos-ui-font,"Segoe UI",Arial,sans-serif)}.exos-comdlg-button:hover{background:var(--exos-ui-hover,#eaf4fd)}.exos-comdlg-button[data-primary="1"]{border-color:var(--exos-ui-accent,#0078d7)}'+
    '.exos-comdlg-input,.exos-comdlg-select{min-height:28px;padding:4px 7px;border:1px solid var(--exos-ui-border,#aeb7c2);border-radius:2px;background:var(--exos-ui-bg,#fff);color:var(--exos-ui-text,#111827);box-sizing:border-box;font:13px var(--exos-ui-font,"Segoe UI",Arial,sans-serif)}'+
    '.exos-comdlg-label{font-size:12px;color:var(--exos-ui-muted,#475569)}'+
    '.exos-comdlg-filetop{display:grid;grid-template-columns:auto auto minmax(180px,1fr);gap:6px;align-items:center;margin-bottom:8px}.exos-comdlg-filemain{display:grid;grid-template-columns:145px minmax(360px,1fr);gap:8px;min-height:330px}.exos-comdlg-places{border:1px solid var(--exos-ui-border-soft,#dbe3ec);background:var(--exos-ui-surface,#f8fafc);padding:5px;overflow:auto}.exos-comdlg-place{display:flex;align-items:center;width:100%;min-height:34px;padding:5px 7px;border:0;background:transparent;text-align:left;font-size:12px}.exos-comdlg-place:hover{background:var(--exos-ui-hover,#eaf4fd)}'+
    '.exos-comdlg-filelist{border:1px solid var(--exos-ui-border,#cbd5e1);background:var(--exos-ui-bg,#fff);overflow:auto;min-height:330px;outline:none}.exos-comdlg-filehead,.exos-comdlg-filerow{display:grid;grid-template-columns:minmax(230px,1fr) 110px 90px;align-items:center;min-height:28px}.exos-comdlg-filehead{position:sticky;top:0;z-index:2;background:var(--exos-ui-surface-2,#f1f5f9);border-bottom:1px solid var(--exos-ui-border,#cbd5e1);font-size:11px;color:#475569}.exos-comdlg-filehead>div,.exos-comdlg-filerow>div{padding:4px 7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.exos-comdlg-filerow{font-size:12px;border-bottom:1px solid #f1f5f9}.exos-comdlg-filerow:hover{background:var(--exos-ui-hover,#eef6ff)}.exos-comdlg-filerow[data-selected="1"]{background:var(--exos-ui-selected,#cce8ff)}.exos-comdlg-filename{display:flex;align-items:center;gap:8px;margin-top:9px}.exos-comdlg-filename label{width:76px;font-size:12px}.exos-comdlg-filename input,.exos-comdlg-filename select{flex:1;min-width:0}'+
    '.exos-comdlg-namecell{display:flex;align-items:center;gap:7px}.exos-comdlg-icon{width:18px;height:18px;flex:0 0 18px;display:inline-flex;align-items:center;justify-content:center}'+
    '.exos-comdlg-colorgrid{display:grid;grid-template-columns:repeat(8,24px);gap:4px}.exos-comdlg-colorcell{width:24px;height:24px;padding:0;border:1px solid #64748b}.exos-comdlg-colorcell[data-selected="1"]{outline:2px solid var(--exos-ui-accent,#0078d7);outline-offset:1px}.exos-comdlg-spectrum{position:relative;width:300px;height:180px;border:1px solid #64748b;cursor:crosshair;overflow:hidden}.exos-comdlg-spectrum canvas{display:block;width:300px;height:180px}.exos-comdlg-cross{position:absolute;width:11px;height:11px;border:1px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #000;transform:translate(-50%,-50%);pointer-events:none}'+
    '.exos-comdlg-fontgrid{display:grid;grid-template-columns:minmax(190px,1fr) 130px 90px;gap:10px}.exos-comdlg-fontgrid>div{display:flex;flex-direction:column;gap:5px}.exos-comdlg-fontgrid select{min-height:190px}.exos-comdlg-preview{margin-top:12px;padding:14px;border:1px solid var(--exos-ui-border,#cbd5e1);min-height:70px;background:var(--exos-ui-bg,#fff);overflow:hidden}'+
    '.exos-comdlg-formgrid{display:grid;grid-template-columns:140px minmax(180px,1fr);gap:8px 10px;align-items:center}.exos-comdlg-formgrid .span2{grid-column:1/-1}.exos-comdlg-radio{display:flex;align-items:center;gap:6px;font-size:12px}.exos-comdlg-group{border:1px solid var(--exos-ui-border-soft,#dbe3ec);padding:10px;margin:8px 0}.exos-comdlg-group legend{padding:0 5px;font-size:12px;color:#475569}';
  (document.head||document.documentElement).appendChild(st);
}
function button(text,primary){
  var b=document.createElement('button');b.type='button';b.className='exos-comdlg-button';b.textContent=String(text||'');b.setAttribute('data-primary',primary?'1':'0');return b;
}
function input(type,value){var n=document.createElement('input');n.type=type||'text';n.className='exos-comdlg-input';if(value!==undefined)n.value=String(value);return n;}
function select(){var n=document.createElement('select');n.className='exos-comdlg-select';return n;}
function option(value,text){var o=document.createElement('option');o.value=String(value);o.textContent=String(text);return o;}
function ownerValid(ctx,hwnd){hwnd=iv(hwnd);return !hwnd||!!(ctx&&ctx.windows&&ctx.windows[String(hwnd)]);}
function makeTitle(parent,title,closable,onClose){
  var bar=document.createElement('div'),t=document.createElement('span');bar.className='exos-comdlg-title';t.textContent=String(title||'');bar.appendChild(t);
  if(closable){var x=document.createElement('button');x.type='button';x.textContent='×';x.title='關閉';x.onclick=function(){onClose();};bar.appendChild(x);}parent.appendChild(bar);return bar;
}
function modal(ctx,opt,builder){
  ensureStyle();opt=opt||{};

  if(!ownerValid(ctx,opt.hwndOwner)){
    invalid('hwndOwner is not owned by this XSH process.');
  }

  return new Promise(function(resolve,reject){
    var backdrop=document.createElement('div'),
        win=document.createElement('div'),
        body=document.createElement('div'),
        foot=document.createElement('div'),
        titlebar,
        closed=false,
        keydown;

    backdrop.className='exos-comdlg-backdrop';
    win.className='exos-comdlg-window';
    win.style.width=
      Math.max(320,Math.min(1100,iv(opt.width,720)))+'px';

    if(opt.height){
      win.style.height=
        Math.max(220,Math.min(820,iv(opt.height,520)))+'px';
    }

    backdrop.appendChild(win);

    titlebar=makeTitle(
      win,
      opt.title||'ExOS',
      true,
      function(){done(null);}
    );

    body.className='exos-comdlg-body';
    foot.className='exos-comdlg-footer';
    win.appendChild(body);
    win.appendChild(foot);

    (document.body||document.documentElement)
      .appendChild(backdrop);

    /*
     * os74:
     * Modal Common Dialogs used to be centered by the backdrop but were not
     * attached to the drag handler.  Convert the already-rendered centered
     * position into explicit fixed coordinates, then use the same pointer-
     * capture drag implementation as modeless Find/Replace.
     */
    try{
      var r=win.getBoundingClientRect();
      win.style.left=
        Math.max(0,Math.round(r.left))+'px';
      win.style.top=
        Math.max(0,Math.round(r.top))+'px';
    }catch(ignoreInitialPosition){}

    draggable(win,titlebar);

    function cleanup(){
      try{
        document.removeEventListener(
          'keydown',
          keydown,
          true
        );
      }catch(ignore){}

      try{
        if(backdrop.parentNode){
          backdrop.parentNode.removeChild(backdrop);
        }
      }catch(ignore2){}
    }

    function done(value){
      if(closed)return;
      closed=true;
      cleanup();
      resolve(value);
    }

    function fail(e){
      if(closed)return;
      closed=true;
      cleanup();
      reject(e);
    }

    keydown=function(e){
      if(String(e.key||'')==='Escape'){
        try{e.preventDefault();}catch(ignore){}
        done(null);
      }
    };

    document.addEventListener(
      'keydown',
      keydown,
      true
    );

    Promise.resolve()
      .then(function(){
        return builder({
          backdrop:backdrop,
          window:win,
          titlebar:titlebar,
          body:body,
          footer:foot,
          done:done,
          fail:fail
        });
      })
      .catch(fail);
  });
}
function draggable(win,titlebar){
  var active=false,sx=0,sy=0,sl=0,st=0;

  titlebar.style.cursor='move';
  titlebar.style.touchAction='none';

  titlebar.addEventListener(
    'pointerdown',
    function(e){
      if(e.target&&e.target.tagName==='BUTTON')return;

      active=true;
      sx=e.clientX;
      sy=e.clientY;

      var r=win.getBoundingClientRect();
      sl=r.left;
      st=r.top;

      try{e.preventDefault();}catch(ignorePrevent){}
      try{
        titlebar.setPointerCapture(e.pointerId);
      }catch(ignoreCapture){}
    }
  );

  titlebar.addEventListener(
    'pointermove',
    function(e){
      if(!active)return;

      var maxX=Math.max(0,window.innerWidth-win.offsetWidth),
          maxY=Math.max(0,window.innerHeight-win.offsetHeight),
          x=Math.max(
            0,
            Math.min(maxX,sl+(e.clientX-sx))
          ),
          y=Math.max(
            0,
            Math.min(maxY,st+(e.clientY-sy))
          );

      win.style.left=Math.round(x)+'px';
      win.style.top=Math.round(y)+'px';
    }
  );

  function stop(e){
    active=false;
    try{
      if(e){
        titlebar.releasePointerCapture(e.pointerId);
      }
    }catch(ignoreRelease){}
  }

  titlebar.addEventListener('pointerup',stop);
  titlebar.addEventListener('pointercancel',stop);
}
function parseFilters(filter){
  var out=[],a,i;
  if(Array.isArray(filter)){
    for(i=0;i<filter.length;i++){
      if(typeof filter[i]==='string')out.push({name:String(filter[i]),pattern:String(filter[i])});
      else if(filter[i]&&typeof filter[i]==='object')out.push({name:String(filter[i].name||filter[i].label||filter[i].pattern||'Files'),pattern:String(filter[i].pattern||filter[i].spec||'*.*')});
    }
  }else if(typeof filter==='string'&&filter){
    a=filter.indexOf('\u0000')>=0?filter.split('\u0000'):filter.split('|');
    for(i=0;i+1<a.length;i+=2){if(a[i]||a[i+1])out.push({name:String(a[i]||a[i+1]),pattern:String(a[i+1]||'*.*')});}
    if(!out.length)out.push({name:String(filter),pattern:String(filter)});
  }
  if(!out.length)out.push({name:'所有檔案 (*.*)',pattern:'*.*'});
  return out;
}
function wildcardRegex(pat){
  var s=String(pat||'*.*').replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.');
  if(s==='.*\\..*'||s==='.*')return /^.*$/i;
  return new RegExp('^'+s+'$','i');
}
function matchPattern(name,pattern){var p=String(pattern||'*.*').split(';'),i;for(i=0;i<p.length;i++){try{if(wildcardRegex(p[i].trim()).test(String(name||'')))return true;}catch(ignore){}}return false;}
function formatSize(n){n=Number(n)||0;if(n<1024)return n+' B';if(n<1024*1024)return(n/1024).toFixed(n<10240?1:0)+' KB';if(n<1024*1024*1024)return(n/1024/1024).toFixed(1)+' MB';return(n/1024/1024/1024).toFixed(1)+' GB';}
async function shellInfo(ctx,path){
  if(typeof global.jplopsoft_shell32Dispatch!=='function')unsupported('shell32.dll is required by common file dialogs.');
  return await global.jplopsoft_shell32Dispatch(ctx,'SHGetFileInfo',[path]);
}
function resolveNode(ctx,path){return typeof global.jplopsoft_xshResolveC==='function'?global.jplopsoft_xshResolveC(ctx,normalizePath(path),false):null;}
function validDir(ctx,path){var n=resolveNode(ctx,path);return!!(n&&n.type==='folder');}
async function fileDialog(ctx,save,opt){
  opt=opt&&typeof opt==='object'?opt:{};
  var filters=parseFilters(opt.filter),filterIndex=Math.max(1,Math.min(filters.length,iv(opt.filterIndex,1))),initial=normalizePath(opt.initialDir||ctx.currentDirectory||'C:\\'),initialFile=String(opt.file||opt.fileName||''),defaultExt=String(opt.defaultExt||'').replace(/^\./,''),allowMulti=!save&&!!opt.allowMultiSelect;
  if(!validDir(ctx,initial)){var pp=parentPath(initial);initial=validDir(ctx,pp)?pp:'C:\\';}
  return await modal(ctx,{title:opt.title||(save?'另存新檔':'開啟'),width:850,height:590,hwndOwner:opt.hwndOwner},async function(ui){
    var body=ui.body,foot=ui.footer,current=initial,history=[],selected={},rows={},currentEntries=[];
    body.style.overflow='hidden';body.style.display='flex';body.style.flexDirection='column';
    var top=document.createElement('div');top.className='exos-comdlg-filetop';
    var up=button('↑',false),refresh=button('↻',false),pathBox=input('text',current);up.title='上一層';refresh.title='重新整理';top.appendChild(up);top.appendChild(refresh);top.appendChild(pathBox);body.appendChild(top);
    var main=document.createElement('div');main.className='exos-comdlg-filemain';
    var places=document.createElement('div');places.className='exos-comdlg-places';var list=document.createElement('div');list.className='exos-comdlg-filelist';list.tabIndex=0;main.appendChild(places);main.appendChild(list);body.appendChild(main);
    var placesData=[['本機磁碟 (C:)','C:\\']];
    var user=String(ctx&&ctx.username||'administrator');placesData.push(['文件',normalizePath('C:\\Users\\'+user+'\\Documents')]);placesData.push(['使用者資料夾',normalizePath('C:\\Users\\'+user)]);
    placesData.forEach(function(it){var b=document.createElement('button');b.type='button';b.className='exos-comdlg-place';b.textContent=it[0];b.onclick=function(){navigate(it[1],true);};places.appendChild(b);});
    var fileRow=document.createElement('div');fileRow.className='exos-comdlg-filename';var fl=document.createElement('label');fl.textContent='檔案名稱：';var fileBox=input('text',initialFile);fileRow.appendChild(fl);fileRow.appendChild(fileBox);body.appendChild(fileRow);
    var filterRow=document.createElement('div');filterRow.className='exos-comdlg-filename';var fll=document.createElement('label');fll.textContent='檔案類型：';var filterSel=select();filters.forEach(function(f,idx){filterSel.appendChild(option(String(idx+1),f.name+' ('+f.pattern+')'));});filterSel.value=String(filterIndex);filterRow.appendChild(fll);filterRow.appendChild(filterSel);body.appendChild(filterRow);
    var ok=button(save?'儲存':'開啟',true),cancel=button('取消',false);ui.footer.appendChild(ok);ui.footer.appendChild(cancel);cancel.onclick=function(){ui.done(null);};
    function clearSel(){selected={};Object.keys(rows).forEach(function(k){rows[k].setAttribute('data-selected','0');});}
    function selectEntry(entry,row,ctrl){if(!allowMulti||!ctrl)clearSel();selected[entry.path]=entry;row.setAttribute('data-selected','1');if(!entry.directory)fileBox.value=entry.name;}
    async function render(){
      list.innerHTML='';rows={};selected={};pathBox.value=current;
      var head=document.createElement('div');head.className='exos-comdlg-filehead';['名稱','類型','大小'].forEach(function(t){var d=document.createElement('div');d.textContent=t;head.appendChild(d);});list.appendChild(head);
      var entries=global.jplopsoft_xshListDirectory(ctx,current),filter=filters[Math.max(0,iv(filterSel.value,1)-1)]||filters[0];
      currentEntries=entries.filter(function(e){return e.directory||matchPattern(e.name,filter.pattern);});
      if(!currentEntries.length){var empty=document.createElement('div');empty.style.cssText='padding:28px 12px;text-align:center;color:#64748b;font-size:12px;';empty.textContent='沒有符合目前篩選條件的項目。';list.appendChild(empty);return;}
      for(var i=0;i<currentEntries.length;i++){
        (function(entry){
          var row=document.createElement('div');row.className='exos-comdlg-filerow';row.setAttribute('data-selected','0');rows[entry.path]=row;
          var nameCell=document.createElement('div');nameCell.className='exos-comdlg-namecell';var icon=document.createElement('span');icon.className='exos-comdlg-icon';var text=document.createElement('span');text.textContent=entry.name;nameCell.appendChild(icon);nameCell.appendChild(text);
          var type=document.createElement('div');type.textContent=entry.directory?'檔案資料夾':'';var size=document.createElement('div');size.textContent=entry.directory?'':formatSize(entry.size);
          row.appendChild(nameCell);row.appendChild(type);row.appendChild(size);list.appendChild(row);
          shellInfo(ctx,entry.path).then(function(info){type.textContent=info.typeName||type.textContent;if(info.icon&&typeof global.jplopsoft_shareResApplyIcon==='function'){try{global.jplopsoft_shareResApplyIcon(icon,info.icon,18,'shell32.dll');}catch(ignore){}}}).catch(function(){});
          row.onclick=function(e){selectEntry(entry,row,!!(e.ctrlKey||e.metaKey));};
          row.ondblclick=function(){if(entry.directory)navigate(entry.path,true);else{selectEntry(entry,row,false);if(!save)accept();}};
        })(currentEntries[i]);
      }
    }
    async function navigate(path,push){path=normalizePath(path);if(!validDir(ctx,path))return false;if(push&&current!==path)history.push(current);current=path;await render();return true;}
    async function accept(){
      if(save){
        var raw=String(fileBox.value||'').trim();if(!raw)return;
        var path=/^C:\\/i.test(raw)?normalizePath(raw):joinPath(current,raw);
        if(defaultExt&&!hasExtension(path))path+='.'+defaultExt;
        var par=parentPath(path);if(!validDir(ctx,par)){if(typeof global.jplopsoft_exosMessage==='function')await global.jplopsoft_exosMessage('指定的資料夾不存在：\n'+par,'另存新檔');return;}
        var existing=resolveNode(ctx,path);if(existing&&existing.type==='folder'){await navigate(path,true);fileBox.value='';return;}
        if(existing&&opt.overwritePrompt!==false){var yes=typeof global.jplopsoft_exosConfirm==='function'?await global.jplopsoft_exosConfirm('「'+baseName(path)+'」已經存在。\n\n要取代它嗎？','確認另存新檔'):false;if(!yes)return;}
        ui.done({ok:true,file:path,path:path,fileTitle:baseName(path),directory:parentPath(path),filterIndex:iv(filterSel.value,1),overwrite:!!existing});return;
      }
      var paths=Object.keys(selected).filter(function(k){return selected[k]&&!selected[k].directory;});
      if(!paths.length&&fileBox.value){var guessed=/^C:\\/i.test(fileBox.value)?normalizePath(fileBox.value):joinPath(current,fileBox.value);var gn=resolveNode(ctx,guessed);if(gn&&gn.type==='file')paths=[guessed];}
      if(!paths.length)return;
      if(!allowMulti)paths=[paths[0]];
      ui.done({ok:true,file:paths[0],path:paths[0],files:paths.slice(),fileTitle:baseName(paths[0]),directory:parentPath(paths[0]),filterIndex:iv(filterSel.value,1)});
    }
    up.onclick=function(){var p=parentPath(current);if(p)navigate(p,true);};refresh.onclick=function(){render();};pathBox.onkeydown=function(e){if(e.key==='Enter'){navigate(pathBox.value,true);}};filterSel.onchange=function(){filterIndex=iv(filterSel.value,1);render();};ok.onclick=accept;fileBox.onkeydown=function(e){if(e.key==='Enter')accept();};
    await render();setTimeout(function(){try{fileBox.focus();fileBox.select();}catch(ignore){}},0);
  });
}
function rgbRef(r,g,b){return((iv(r)&255)|((iv(g)&255)<<8)|((iv(b)&255)<<16))>>>0;}
function refRgb(c){c=Number(c)>>>0;return{r:c&255,g:(c>>>8)&255,b:(c>>>16)&255};}
function rgbHex(r,g,b){function h(n){return('0'+clamp(n,0,255,0).toString(16)).slice(-2);}return'#'+h(r)+h(g)+h(b);}
function hslToRgb(h,s,l){h=((Number(h)%360)+360)%360;s=clamp(s,0,100,100)/100;l=clamp(l,0,100,50)/100;var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return{r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)};}
function rgbToHsl(r,g,b){r=clamp(r,0,255,0)/255;g=clamp(g,0,255,0)/255;b=clamp(b,0,255,0)/255;var max=Math.max(r,g,b),min=Math.min(r,g,b),h=0,s=0,l=(max+min)/2,d=max-min;if(d){s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h*=60;}return{h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)};}
async function chooseColor(ctx,opt){
  opt=opt&&typeof opt==='object'?opt:{};var init=refRgb(opt.rgbResult===undefined?rgbRef(0,120,215):opt.rgbResult),hsl=rgbToHsl(init.r,init.g,init.b);
  return await modal(ctx,{title:opt.title||'色彩',width:730,height:430,hwndOwner:opt.hwndOwner},async function(ui){
    var current={r:init.r,g:init.g,b:init.b,h:hsl.h,s:hsl.s,l:hsl.l},selectedCell=null;ui.body.style.display='grid';ui.body.style.gridTemplateColumns='230px 1fr';ui.body.style.gap='18px';
    var left=document.createElement('div'),right=document.createElement('div');ui.body.appendChild(left);ui.body.appendChild(right);
    var lab=document.createElement('div');lab.className='exos-comdlg-label';lab.textContent='基本色彩';lab.style.marginBottom='7px';left.appendChild(lab);var grid=document.createElement('div');grid.className='exos-comdlg-colorgrid';left.appendChild(grid);
    var preview=document.createElement('div');preview.style.cssText='height:52px;margin-top:14px;border:1px solid #64748b;';left.appendChild(preview);
    BASIC_COLORS.forEach(function(hex){var c=document.createElement('button');c.type='button';c.className='exos-comdlg-colorcell';c.style.background=hex;c.title=hex.toUpperCase();c.onclick=function(){if(selectedCell)selectedCell.setAttribute('data-selected','0');selectedCell=c;c.setAttribute('data-selected','1');current.r=parseInt(hex.substr(1,2),16);current.g=parseInt(hex.substr(3,2),16);current.b=parseInt(hex.substr(5,2),16);var z=rgbToHsl(current.r,current.g,current.b);current.h=z.h;current.s=z.s;current.l=z.l;sync(true);};grid.appendChild(c);});
    var sp=document.createElement('div');sp.className='exos-comdlg-spectrum';var cv=document.createElement('canvas');cv.width=300;cv.height=180;var cross=document.createElement('div');cross.className='exos-comdlg-cross';sp.appendChild(cv);sp.appendChild(cross);right.appendChild(sp);
    var lightRow=document.createElement('div');lightRow.style.cssText='display:flex;align-items:center;gap:8px;margin-top:9px;';var lLab=document.createElement('span');lLab.className='exos-comdlg-label';lLab.textContent='亮度 L';var light=input('range',String(current.l));light.min='0';light.max='100';light.style.flex='1';lightRow.appendChild(lLab);lightRow.appendChild(light);right.appendChild(lightRow);
    var nums=document.createElement('div');nums.className='exos-comdlg-formgrid';nums.style.marginTop='10px';right.appendChild(nums);var fields={};[['R','r',255],['G','g',255],['B','b',255],['H','h',359],['S','s',100],['L','l',100]].forEach(function(spec){var l=document.createElement('label');l.className='exos-comdlg-label';l.textContent=spec[0];var n=input('number',String(current[spec[1]]));n.min='0';n.max=String(spec[2]);fields[spec[1]]=n;nums.appendChild(l);nums.appendChild(n);});
    function drawSpectrum(){var c=cv.getContext('2d'),img=c.createImageData(cv.width,cv.height),d=img.data,i=0,x,y,rgb;for(y=0;y<cv.height;y++){for(x=0;x<cv.width;x++){rgb=hslToRgb(x/(cv.width-1)*359,(1-y/(cv.height-1))*100,current.l);d[i++]=rgb.r;d[i++]=rgb.g;d[i++]=rgb.b;d[i++]=255;}}c.putImageData(img,0,0);}
    function sync(redraw){fields.r.value=String(current.r);fields.g.value=String(current.g);fields.b.value=String(current.b);fields.h.value=String(Math.round(current.h));fields.s.value=String(Math.round(current.s));fields.l.value=String(Math.round(current.l));light.value=String(Math.round(current.l));preview.style.background=rgbHex(current.r,current.g,current.b);cross.style.left=(current.h/359*300)+'px';cross.style.top=((1-current.s/100)*180)+'px';if(redraw)drawSpectrum();}
    function pick(e){var r=sp.getBoundingClientRect(),x=clamp(e.clientX-r.left,0,r.width,0),y=clamp(e.clientY-r.top,0,r.height,0);current.h=x/r.width*359;current.s=(1-y/r.height)*100;var rgb=hslToRgb(current.h,current.s,current.l);current.r=rgb.r;current.g=rgb.g;current.b=rgb.b;sync(false);}
    sp.onpointerdown=function(e){pick(e);try{sp.setPointerCapture(e.pointerId);}catch(ignore){}};sp.onpointermove=function(e){if(e.buttons)pick(e);};light.oninput=function(){current.l=iv(light.value,50);var rgb=hslToRgb(current.h,current.s,current.l);current.r=rgb.r;current.g=rgb.g;current.b=rgb.b;sync(true);};
    ['r','g','b'].forEach(function(k){fields[k].onchange=function(){current[k]=clamp(fields[k].value,0,255,0);var z=rgbToHsl(current.r,current.g,current.b);current.h=z.h;current.s=z.s;current.l=z.l;sync(true);};});['h','s','l'].forEach(function(k){fields[k].onchange=function(){current[k]=clamp(fields[k].value,0,k==='h'?359:100,current[k]);var z=hslToRgb(current.h,current.s,current.l);current.r=z.r;current.g=z.g;current.b=z.b;sync(true);};});
    var ok=button('確定',true),cancel=button('取消',false);ui.footer.appendChild(ok);ui.footer.appendChild(cancel);ok.onclick=function(){ui.done({ok:true,rgbResult:rgbRef(current.r,current.g,current.b),rgb:{r:current.r,g:current.g,b:current.b},hsl:{h:Math.round(current.h),s:Math.round(current.s),l:Math.round(current.l)},customColors:Array.isArray(opt.customColors)?opt.customColors.slice(0,16):[]});};cancel.onclick=function(){ui.done(null);};sync(true);
  });
}
async function fontCatalog(ctx){
  if(typeof global.jplopsoft_gdi32Dispatch!=='function')unsupported('gdi32.dll is required by ChooseFont.');
  return await global.jplopsoft_gdi32Dispatch(ctx,'EnumFontFamiliesEx',[{}]);
}
async function chooseFont(ctx,opt){
  opt=opt&&typeof opt==='object'?opt:{};var fonts=await fontCatalog(ctx),lf=opt.logFont&&typeof opt.logFont==='object'?opt.logFont:{},initialFace=String(lf.lfFaceName||opt.faceName||'Segoe UI'),initialSize=Number(opt.pointSize)||Math.max(8,Math.round(Math.abs(Number(lf.lfHeight)||16)*72/96)),initialWeight=iv(lf.lfWeight,400),initialItalic=!!lf.lfItalic;
  return await modal(ctx,{title:opt.title||'字型',width:650,height:470,hwndOwner:opt.hwndOwner},async function(ui){
    var grid=document.createElement('div');grid.className='exos-comdlg-fontgrid';ui.body.appendChild(grid);var fcol=document.createElement('div'),scol=document.createElement('div'),zcol=document.createElement('div');grid.appendChild(fcol);grid.appendChild(scol);grid.appendChild(zcol);
    function labeled(col,text,ctrl){var l=document.createElement('div');l.className='exos-comdlg-label';l.textContent=text;col.appendChild(l);col.appendChild(ctrl);}
    var face=select(),style=select(),size=select();fonts.forEach(function(f){face.appendChild(option(f.faceName,f.faceName));});[['regular','標準'],['bold','粗體'],['italic','斜體'],['bolditalic','粗斜體']].forEach(function(x){style.appendChild(option(x[0],x[1]));});FONT_SIZES.forEach(function(n){size.appendChild(option(n,n));});labeled(fcol,'字型：',face);labeled(scol,'字型樣式：',style);labeled(zcol,'大小：',size);
    face.value=fonts.some(function(f){return f.faceName===initialFace;})?initialFace:(fonts[0]?fonts[0].faceName:'Segoe UI');style.value=initialWeight>=600?(initialItalic?'bolditalic':'bold'):(initialItalic?'italic':'regular');if(!FONT_SIZES.includes(initialSize))size.appendChild(option(initialSize,initialSize));size.value=String(initialSize);
    var extras=document.createElement('div');extras.style.cssText='display:flex;gap:16px;margin-top:12px;';var underline=input('checkbox'),strike=input('checkbox');underline.checked=!!lf.lfUnderline;strike.checked=!!lf.lfStrikeOut;var ul=document.createElement('label');ul.className='exos-comdlg-radio';ul.appendChild(underline);ul.appendChild(document.createTextNode('底線'));var sl=document.createElement('label');sl.className='exos-comdlg-radio';sl.appendChild(strike);sl.appendChild(document.createTextNode('刪除線'));extras.appendChild(ul);extras.appendChild(sl);ui.body.appendChild(extras);
    var preview=document.createElement('div');preview.className='exos-comdlg-preview';preview.textContent=String(opt.previewText||'AaBbYyZz 中文字型預覽 123');ui.body.appendChild(preview);
    function sync(){var st=style.value,pt=Number(size.value)||12;preview.style.fontFamily='"'+face.value.replace(/"/g,'')+'", sans-serif';preview.style.fontSize=pt+'pt';preview.style.fontWeight=st.indexOf('bold')>=0?'700':'400';preview.style.fontStyle=st.indexOf('italic')>=0?'italic':'normal';preview.style.textDecoration=(underline.checked?'underline ':'')+(strike.checked?'line-through':'');}
    [face,style,size,underline,strike].forEach(function(c){c.onchange=sync;});sync();
    var ok=button('確定',true),cancel=button('取消',false);ui.footer.appendChild(ok);ui.footer.appendChild(cancel);ok.onclick=function(){var st=style.value,pt=Number(size.value)||12,w=st.indexOf('bold')>=0?700:400,it=st.indexOf('italic')>=0;ui.done({ok:true,pointSize:pt,logFont:{lfHeight:-Math.round(pt*96/72),lfWidth:0,lfEscapement:0,lfOrientation:0,lfWeight:w,lfItalic:it?1:0,lfUnderline:underline.checked?1:0,lfStrikeOut:strike.checked?1:0,lfCharSet:1,lfOutPrecision:0,lfClipPrecision:0,lfQuality:5,lfPitchAndFamily:0,lfFaceName:face.value},faceName:face.value,style:st});};cancel.onclick=function(){ui.done(null);};
  });
}
function printerList(){return[{name:'ExOS Browser Printer',driver:'EXOS_BROWSER_SPOOL_V1',port:'BROWSER:',default:true,status:'Ready',capabilities:{copies:true,collate:true,duplex:['simplex','long-edge','short-edge'],paper:Object.keys(PAPER_SPECS)}}];}
async function printDlg(ctx,opt,extended){
  opt=opt&&typeof opt==='object'?opt:{};var printers=printerList();
  return await modal(ctx,{title:opt.title||(extended?'列印':'列印'),width:570,height:520,hwndOwner:opt.hwndOwner},async function(ui){
    var g=document.createElement('div');g.className='exos-comdlg-formgrid';ui.body.appendChild(g);function row(label,ctrl){var l=document.createElement('label');l.className='exos-comdlg-label';l.textContent=label;g.appendChild(l);g.appendChild(ctrl);}
    var printer=select();printers.forEach(function(p){printer.appendChild(option(p.name,p.name+(p.default?'（預設）':'')));});row('印表機：',printer);var statusLine=document.createElement('div');statusLine.className='exos-comdlg-label span2';statusLine.textContent='狀態：就緒 ｜ 連接埠：BROWSER: ｜ 驅動：EXOS_BROWSER_SPOOL_V1';g.appendChild(statusLine);
    var rangeBox=document.createElement('fieldset');rangeBox.className='exos-comdlg-group span2';var leg=document.createElement('legend');leg.textContent='列印範圍';rangeBox.appendChild(leg);var all=input('radio'),current=input('radio'),pages=input('radio');all.name=current.name=pages.name='range_'+pid(ctx)+'_'+Date.now();all.checked=String(opt.range||'all')==='all';current.checked=String(opt.range||'')==='current';pages.checked=String(opt.range||'')==='pages';function radio(n,text){var l=document.createElement('label');l.className='exos-comdlg-radio';l.style.marginRight='16px';l.appendChild(n);l.appendChild(document.createTextNode(text));rangeBox.appendChild(l);}radio(all,'全部');radio(current,'目前頁面');radio(pages,'頁碼');var from=input('number',opt.fromPage||1),to=input('number',opt.toPage||1);from.min='1';to.min='1';from.style.width=70+'px';to.style.width=70+'px';rangeBox.appendChild(document.createTextNode(' 從 '));rangeBox.appendChild(from);rangeBox.appendChild(document.createTextNode(' 到 '));rangeBox.appendChild(to);g.appendChild(rangeBox);
    var copies=input('number',opt.copies||1);copies.min='1';copies.max='99';row('份數：',copies);var collate=input('checkbox');collate.checked=opt.collate!==false;var cl=document.createElement('label');cl.className='exos-comdlg-radio';cl.appendChild(collate);cl.appendChild(document.createTextNode('逐份列印'));row('',cl);var duplex=select();duplex.appendChild(option('simplex','單面列印'));duplex.appendChild(option('long-edge','雙面－長邊翻頁'));duplex.appendChild(option('short-edge','雙面－短邊翻頁'));duplex.value=String(opt.duplex||'simplex');row('雙面列印：',duplex);
    var ok=button('列印',true),cancel=button('取消',false);ui.footer.appendChild(ok);ui.footer.appendChild(cancel);cancel.onclick=function(){ui.done(null);};ok.onclick=async function(){var range=pages.checked?'pages':current.checked?'current':'all',devMode={deviceName:printer.value,paper:String(opt.paper||'A4').toUpperCase(),orientation:String(opt.orientation||'portrait').toLowerCase(),copies:Math.max(1,iv(copies.value,1)),duplex:duplex.value,collate:!!collate.checked,dpi:iv(opt.dpi,96)};var hdc=0;if(opt.returnDC||opt.returnDc||((iv(opt.flags)&0x00000100)!==0)){hdc=await global.jplopsoft_gdi32Dispatch(ctx,'CreatePrinterDC',[devMode]);}ui.done({ok:true,resultAction:'PRINT',printerName:printer.value,range:range,fromPage:Math.max(1,iv(from.value,1)),toPage:Math.max(1,iv(to.value,1)),copies:devMode.copies,collate:devMode.collate,duplex:devMode.duplex,devMode:devMode,hDC:hdc,extended:!!extended});};
  });
}
async function pageSetupDlg(ctx,opt){
  opt=opt&&typeof opt==='object'?opt:{};var units=String(opt.units||'mm').toLowerCase()==='in'?'in':'mm';
  return await modal(ctx,{title:opt.title||'版面設定',width:520,height:520,hwndOwner:opt.hwndOwner},async function(ui){
    var g=document.createElement('div');g.className='exos-comdlg-formgrid';ui.body.appendChild(g);function row(label,ctrl){var l=document.createElement('label');l.className='exos-comdlg-label';l.textContent=label;g.appendChild(l);g.appendChild(ctrl);}
    var paper=select();Object.keys(PAPER_SPECS).forEach(function(k){var p=PAPER_SPECS[k];paper.appendChild(option(k,p.name+'  '+p.widthMm+' × '+p.heightMm+' mm'));});paper.value=String(opt.paper||'A4').toUpperCase();row('紙張大小：',paper);var tray=select();tray.appendChild(option('AUTO','自動選取'));tray.appendChild(option('MANUAL','手動進紙'));tray.appendChild(option('TRAY1','紙匣 1'));row('來源紙匣：',tray);var orient=select();orient.appendChild(option('portrait','直向'));orient.appendChild(option('landscape','橫向'));orient.value=String(opt.orientation||'portrait').toLowerCase();row('方向：',orient);
    var margins=opt.margins||{},factor=units==='in'?25.4:1;function marginInput(v){var x=input('number',String((Number(v===undefined?20:v)/factor).toFixed(units==='in'?2:1)));x.step=units==='in'?'0.1':'1';x.min='0';x.max=units==='in'?'5':'120';return x;}var top=marginInput(margins.top),bottom=marginInput(margins.bottom),left=marginInput(margins.left),right=marginInput(margins.right);row('上邊界 ('+units+')：',top);row('下邊界 ('+units+')：',bottom);row('左邊界 ('+units+')：',left);row('右邊界 ('+units+')：',right);
    var preview=document.createElement('div');preview.className='span2';preview.style.cssText='height:120px;margin-top:8px;display:flex;align-items:center;justify-content:center;background:#eef2f7;border:1px solid #cbd5e1;';var page=document.createElement('div');page.style.cssText='width:78px;height:105px;background:#fff;border:1px solid #94a3b8;box-shadow:0 2px 4px rgba(0,0,0,.15);';preview.appendChild(page);g.appendChild(preview);function syncPreview(){var land=orient.value==='landscape';page.style.width=(land?'105px':'78px');page.style.height=(land?'78px':'105px');}orient.onchange=syncPreview;syncPreview();
    var ok=button('確定',true),cancel=button('取消',false);ui.footer.appendChild(ok);ui.footer.appendChild(cancel);cancel.onclick=function(){ui.done(null);};ok.onclick=function(){var p=PAPER_SPECS[paper.value]||PAPER_SPECS.A4,mm=function(n){return Number(n.value||0)*factor;};ui.done({ok:true,paper:paper.value,paperName:p.name,orientation:orient.value,sourceTray:tray.value,widthMm:p.widthMm,heightMm:p.heightMm,units:units,margins:{top:mm(top),bottom:mm(bottom),left:mm(left),right:mm(right)},devMode:{paper:paper.value,orientation:orient.value,sourceTray:tray.value,widthMm:p.widthMm,heightMm:p.heightMm}});};
  });
}
function notify(ctx,rec,code,data){if(typeof global.jplopsoft_xshSendEvent!=='function')return;global.jplopsoft_xshSendEvent(ctx,{event:'control',controlId:'COMDLG:'+String(rec.handle),action:'notify',code:String(code||''),data:data||{}});}
function destroyModeless(ctx,handle,notifyTerm){var s=state(ctx),rec=s.dialogs[String(iv(handle))];if(!rec)return false;delete s.dialogs[String(rec.handle)];try{if(rec.node&&rec.node.parentNode)rec.node.parentNode.removeChild(rec.node);}catch(ignore){}if(notifyTerm!==false)notify(ctx,rec,'FR_DIALOGTERM',{handle:rec.handle});return true;}
function modelessFindReplace(ctx,replace,opt){
  ensureStyle();opt=opt&&typeof opt==='object'?opt:{};if(!ownerValid(ctx,opt.hwndOwner))invalid('hwndOwner is not owned by this XSH process.');var s=state(ctx),h=s.nextHandle++,win=document.createElement('div');win.className='exos-comdlg-modeless';win.style.width=(replace?470:430)+'px';win.style.left=Math.max(20,Math.round((window.innerWidth-(replace?470:430))/2)+(h%5)*16)+'px';win.style.top=Math.max(50,Math.round(window.innerHeight*.22)+(h%5)*14)+'px';var rec={handle:h,node:win,replace:replace,state:{findWhat:String(opt.findWhat||''),replaceWith:String(opt.replaceWith||''),matchCase:!!opt.matchCase,direction:String(opt.direction||'down')==='up'?'up':'down'}};s.dialogs[String(h)]=rec;
  var title=makeTitle(win,opt.title||(replace?'取代':'尋找'),true,function(){destroyModeless(ctx,h,true);});draggable(win,title);var body=document.createElement('div');body.className='exos-comdlg-body';win.appendChild(body);var g=document.createElement('div');g.className='exos-comdlg-formgrid';body.appendChild(g);function row(label,ctrl){var l=document.createElement('label');l.className='exos-comdlg-label';l.textContent=label;g.appendChild(l);g.appendChild(ctrl);}var find=input('text',rec.state.findWhat);row('尋找目標：',find);var repl=null;if(replace){repl=input('text',rec.state.replaceWith);row('取代為：',repl);}var opts=document.createElement('div');opts.className='span2';opts.style.cssText='display:flex;gap:14px;align-items:center;margin-top:5px;';var mc=input('checkbox');mc.checked=rec.state.matchCase;var mcl=document.createElement('label');mcl.className='exos-comdlg-radio';mcl.appendChild(mc);mcl.appendChild(document.createTextNode('大小寫視為相異'));opts.appendChild(mcl);var down=input('radio'),up=input('radio');down.name=up.name='dir_'+h;down.checked=rec.state.direction!=='up';up.checked=!down.checked;function rr(n,t){var l=document.createElement('label');l.className='exos-comdlg-radio';l.appendChild(n);l.appendChild(document.createTextNode(t));opts.appendChild(l);}rr(down,'往下');rr(up,'往上');g.appendChild(opts);
  var foot=document.createElement('div');foot.className='exos-comdlg-footer';win.appendChild(foot);function payload(){rec.state.findWhat=find.value;rec.state.replaceWith=repl?repl.value:'';rec.state.matchCase=mc.checked;rec.state.direction=up.checked?'up':'down';return{handle:h,findWhat:rec.state.findWhat,replaceWith:rec.state.replaceWith,matchCase:rec.state.matchCase,direction:rec.state.direction};}var findNext=button('尋找下一個',true);foot.appendChild(findNext);findNext.onclick=function(){notify(ctx,rec,'FR_FINDNEXT',payload());};if(replace){var rb=button('取代',false),ra=button('全部取代',false);foot.appendChild(rb);foot.appendChild(ra);rb.onclick=function(){notify(ctx,rec,'FR_REPLACE',payload());};ra.onclick=function(){notify(ctx,rec,'FR_REPLACEALL',payload());};}var close=button('關閉',false);foot.appendChild(close);close.onclick=function(){destroyModeless(ctx,h,true);};find.onkeydown=function(e){if(e.key==='Enter')notify(ctx,rec,'FR_FINDNEXT',payload());};(document.body||document.documentElement).appendChild(win);setTimeout(function(){try{find.focus();find.select();}catch(ignore){}},0);return h;
}
function getModelessState(ctx,handle){var rec=state(ctx).dialogs[String(iv(handle))];return rec?JSON.parse(JSON.stringify(rec.state)):null;}
function cleanup(ctx){var s=ctx&&ctx.comdlg32,k;if(!s)return true;for(k in s.dialogs)if(s.dialogs.hasOwnProperty(k))destroyModeless(ctx,k,false);ctx.comdlg32=null;return true;}
async function dispatch(ctx,method,args){
  args=args||[];state(ctx);method=String(method||'');
  try{
    if(method==='GetVersion')return{version:API.version,model:API.model};
    if(method==='CommDlgExtendedError')return state(ctx).lastError||0;
    if(method==='GetOpenFileName'||method==='GetOpenFileNameW'||method==='GetOpenFileNameA')return await fileDialog(ctx,false,args[0]);
    if(method==='GetSaveFileName'||method==='GetSaveFileNameW'||method==='GetSaveFileNameA')return await fileDialog(ctx,true,args[0]);
    if(method==='ChooseColor'||method==='ChooseColorW'||method==='ChooseColorA')return await chooseColor(ctx,args[0]);
    if(method==='ChooseFont'||method==='ChooseFontW'||method==='ChooseFontA')return await chooseFont(ctx,args[0]);
    if(method==='PrintDlg'||method==='PrintDlgW'||method==='PrintDlgA')return await printDlg(ctx,args[0],false);
    if(method==='PrintDlgEx'||method==='PrintDlgExW'||method==='PrintDlgExA')return await printDlg(ctx,args[0],true);
    if(method==='PageSetupDlg'||method==='PageSetupDlgW'||method==='PageSetupDlgA')return await pageSetupDlg(ctx,args[0]);
    if(method==='FindText'||method==='FindTextW'||method==='FindTextA')return modelessFindReplace(ctx,false,args[0]);
    if(method==='ReplaceText'||method==='ReplaceTextW'||method==='ReplaceTextA')return modelessFindReplace(ctx,true,args[0]);
    if(method==='DestroyDialog')return destroyModeless(ctx,args[0],true);
    if(method==='GetDialogState')return getModelessState(ctx,args[0]);
    throw exerr(status('NOT_SUPPORTED',0xC00000BB),'Unsupported comdlg32.dll API: '+method);
  }catch(e){state(ctx).lastError=Number(e&&e.ntstatus)||1;throw e;}
}

global.jplopsoft_COMDLG32=API;
global.jplopsoft_comdlg32Dispatch=dispatch;
global.jplopsoft_comdlg32CleanupContext=cleanup;
})(window);
