/* ExOS shell32.dll emulation
 * Version: 6.4.0-dev-os91
 * Model: EXOS_SHELL32_V1
 *
 * Browser/XSH shell API.  The implementation is intentionally restricted to
 * ExOS' ExFS VDO plus session DOS-device aliases. It never exposes the host filesystem.
 */
(function(global){
'use strict';

var PROPERTY_STORES={next:0xD800,items:{}};
var SHELL={
  version:'6.4.0-dev-os91',
  model:'EXOS_SHELL32_V1',
  ready:true,
  clipboard:{
    effect:'',
    paths:[],
    sourcePid:0,
    updatedAt:0
  },
  drag:{
    id:0,
    paths:[],
    allowedEffects:['copy','move'],
    sourcePid:0,
    active:false
  },
  menuSeq:0,
  styleReady:false
};

function shellEnsureArray(value){
  if(Object.prototype.toString.call(value)==='[object Array]'){
    return value.slice();
  }

  if(value===undefined||value===null||value===''){
    return[];
  }

  return[value];
}

function shellNormalizePath(path){
  var p=String(path||'')
    .replace(/\//g,'\\')
    .replace(/\\{2,}/g,'\\');

  if(/^[A-Za-z]:$/.test(p))p+='\\';

  if(p.length>3){
    p=p.replace(/\\+$/,'');
  }

  return p;
}

function shellBaseName(path){
  var p=shellNormalizePath(path),
      i=p.lastIndexOf('\\');

  return i>=0
    ?p.substring(i+1)
    :p;
}

function shellParentPath(path){
  var p=shellNormalizePath(path),
      i;

  if(/^[A-Za-z]:\\$/i.test(p))return'';

  i=p.lastIndexOf('\\');

  return i<=2
    ?p.substring(0,2)+'\\'
    :p.substring(0,i);
}

function shellJoinPath(base,name){
  var b=shellNormalizePath(base),
      n=String(name||'').replace(/[\\\/]+/g,'');

  if(!n)return b;

  return /^[A-Za-z]:\\$/.test(b)
    ?b+n
    :b+'\\'+n;
}

function shellQuote(value){
  var s=String(value||'');

  return /[\s"]/g.test(s)
    ?'"'+s.replace(/"/g,'\\"')+'"'
    :s;
}

function shellExtension(path){
  var n=shellBaseName(path),
      i=n.lastIndexOf('.');

  return i>0
    ?n.substring(i+1).toLowerCase()
    :'';
}

function shellTypeName(path,isDirectory){
  var ext;

  if(isDirectory)return'檔案資料夾';

  ext=shellExtension(path);

  if(ext==='txt')return'文字文件';
  if(ext==='csv')return'CSV 文件';
  if(ext==='html'||ext==='htm')return'HTML 文件';
  if(ext==='xsh')return'ExOS XSH 應用程式';
  if(ext==='xba')return'ExOS Batch 批次檔';
  if(ext==='png'||ext==='jpg'||ext==='jpeg'||ext==='gif'||ext==='webp'||ext==='bmp')return'圖片';
  if(ext==='mp3'||ext==='wav'||ext==='ogg'||ext==='m4a')return'音訊';
  if(ext==='mp4'||ext==='webm'||ext==='mov')return'影片';
  if(ext==='pdf')return'PDF 文件';
  if(ext==='zip')return'ZIP 壓縮資料夾';

  return ext
    ?ext.toUpperCase()+' 檔案'
    :'檔案';
}

function shellIconName(path,isDirectory){
  var ext;

  if(isDirectory)return'folder';

  ext=shellExtension(path);

  if(ext==='txt')return'txt';
  if(ext==='csv')return'csv';
  if(ext==='html'||ext==='htm')return'html';
  if(ext==='xsh'||ext==='xba')return'cmd';
  if(ext==='png'||ext==='jpg'||ext==='jpeg'||ext==='gif'||ext==='webp'||ext==='bmp')return'image';
  if(ext==='mp3'||ext==='wav'||ext==='ogg'||ext==='m4a')return'media';
  if(ext==='mp4'||ext==='webm'||ext==='mov')return'media';
  if(ext==='zip')return'zipfolder';

  return'file';
}

function shellResolve(ctx,path){
  var p=shellNormalizePath(path),
      spec=jplopsoft_xshPathSpec(ctx,p),
      node;

  if(spec.kind!=='exfs'){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'shell32.dll exposes ExFS volumes and active DOS-device/SUBST aliases only.'
    );
  }

  node=jplopsoft_xshResolveC(
    ctx,
    p,
    false
  );

  return node||null;
}

function shellAssociation(path){
  var ext=shellExtension(path),
      key=ext?'.'+ext:'',
      table=
        typeof state!=='undefined'&&
        state&&
        state.fileAssociations
          ?state.fileAssociations
          :{},
      rec=null;

  if(key&&table){
    rec=
      table[key]||
      table[ext]||
      null;
  }

  if(ext==='zip'){
    return{
      extension:'.zip',registered:true,
      association:{progId:'CompressedFolder',handler:'zipfldr.dll',shellNamespace:true},
      defaultVerb:'open',shellNamespace:true
    };
  }

  return{
    extension:key,
    registered:!!rec,
    association:rec,
    defaultVerb:'open'
  };
}

function shellInfo(ctx,path){
  var p=shellNormalizePath(path),
      raw=jplopsoft_xshResolveC(ctx,p,false,true),
      node=raw&&raw.type==='reparse_point'?jplopsoft_resolveClientNode(raw):raw,
      directory,size,name,targetNode,targetPath='',logicalPath,logicalExt;
  if(!raw||!node)throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Shell object not found: '+p);
  directory=node.type==='folder';
  size=parseInt(node.original_size,10)||0;
  name=raw.root?'本機磁碟 (C:)':String(jplopsoft_decName(raw)||shellBaseName(p));
  if(raw.type==='reparse_point'){
    targetNode=jplopsoft_findNode(parseInt(raw.reparse_target,10)||0);
    targetPath=targetNode?jplopsoft_xshNodePath(targetNode):'';
  }
  logicalPath=raw.type==='reparse_point'&&targetPath?targetPath:p;
  logicalExt=directory?'':shellExtension(logicalPath);
  return{
    path:p,name:name,directory:directory,size:size,
    extension:logicalExt,
    typeName:raw.type==='reparse_point'?(directory?'資料夾捷徑':'檔案捷徑'):shellTypeName(p,directory),
    icon:raw.type==='reparse_point'?'link':shellIconName(p,directory),
    nodeId:raw.root?0:(parseInt(raw.id,10)||0),
    targetNodeId:raw.type==='reparse_point'?(parseInt(node.id,10)||0):0,
    reparsePoint:raw.type==='reparse_point',
    reparseTag:raw.type==='reparse_point'?String(raw.reparse_tag||'SYMLINK'):'',
    reparseTarget:targetPath,
    attributes:{directory:directory,reparsePoint:raw.type==='reparse_point',hidden:false,system:false,readOnly:false},
    filesystem:'ExFS',backingVdo:'PHP /_exfs/',
    markOfTheWeb:!directory&&!!node.has_motw,blocked:!directory&&!!node.has_motw,zoneId:!directory&&node.has_motw?3:0,
    association:shellAssociation(logicalPath),compressedFolder:!directory&&logicalExt==='zip',shellNamespace:!directory&&logicalExt==='zip'?'zipfldr':''
  };
}

async function shellInfoWithImage(ctx,path){
  var info=shellInfo(ctx,path),text,image;
  if(info.directory)return info;
  if(info.extension!=='xsh')return info;
  try{
    text=await jplopsoft_xshReadTextFile(ctx,info.path);
    image=jplopsoft_xshParseImage(String(text||''),info.path);
    if(image&&image.icon)info.icon=String(image.icon);
  }catch(ignoreXshIcon){}
  return info;
}

function shellEnsureStyle(){
  var style;

  if(SHELL.styleReady)return;

  SHELL.styleReady=true;

  style=document.createElement('style');
  style.type='text/css';
  style.textContent=
    '.jplopsoft_shell32_menu{position:fixed;min-width:210px;max-width:320px;padding:4px 0;background:#fff;border:1px solid #aeb7c2;box-shadow:0 8px 28px rgba(15,23,42,.28);z-index:2147483000;font:13px "Segoe UI",Arial,sans-serif;color:#111827;user-select:none}'+
    '.jplopsoft_shell32_menu_item{display:flex;align-items:center;gap:8px;min-height:28px;padding:4px 20px 4px 12px;box-sizing:border-box;white-space:nowrap;cursor:default}'+
    '.jplopsoft_shell32_menu_item:hover{background:#eaf2ff}'+
    '.jplopsoft_shell32_menu_item[data-disabled="1"]{color:#9ca3af;background:transparent}'+
    '.jplopsoft_shell32_menu_item[data-default="1"]{font-weight:600}'+
    '.jplopsoft_shell32_menu_sep{height:1px;background:#e5e7eb;margin:4px 5px}'+
    '.jplopsoft_shell32_menu_icon{width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 17px}'+
    '.jplopsoft_shell32_menu_label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}'+
    '.jplopsoft_shell32_menu_arrow{width:12px;margin-left:auto;text-align:right;color:#475569;font-size:15px}';

  document.getElementsByTagName('head')[0]
    .appendChild(style);
}

function shellMenuItem(verb,text,enabled,options){
  options=options||{};

  return{
    verb:String(verb||''),
    text:String(text||''),
    enabled:enabled!==false,
    separator:false,
    default:!!options.default,
    icon:String(options.icon||''),
    submenu:Array.isArray(options.submenu)?options.submenu:[]
  };
}

function shellSeparator(){
  return{
    verb:'',
    text:'',
    enabled:false,
    separator:true,
    default:false,
    icon:''
  };
}

function shellContextMenu(ctx,paths,options){
  var list=shellEnsureArray(paths)
        .map(shellNormalizePath)
        .filter(function(x){return!!x;}),
      opt=options||{},
      background=!!opt.background,
      infos=[],
      files=[],
      dirs=[],
      items=[],
      i;

  for(i=0;i<list.length;i++){
    try{
      infos.push(shellInfo(ctx,list[i]));
    }catch(ignoreMissing){}
  }

  files=infos.filter(function(x){return!x.directory;});
  dirs=infos.filter(function(x){return x.directory;});

  if(background){
    items.push(shellMenuItem('refresh','重新整理',true,{icon:'refresh'}));
    items.push(shellSeparator());
    items.push(shellMenuItem('newfolder','新增資料夾',true,{icon:'folder'}));
    items.push(shellMenuItem('newtext','新增文字文件',true,{icon:'txt'}));
    items.push(shellMenuItem('newcsv','新增 CSV',true,{icon:'csv'}));
    items.push(shellMenuItem('newhtml','新增 HTML',true,{icon:'html'}));
    items.push(shellMenuItem('newxsh','新增 XSH',true,{icon:'cmd'}));
    items.push(shellSeparator());
    items.push(
      shellMenuItem(
        'paste',
        '貼上',
        SHELL.clipboard.paths.length>0,
        {icon:'paste'}
      )
    );
    items.push(shellSeparator());
    items.push(shellMenuItem('cmdhere','在此開啟命令提示字元',true,{icon:'cmd'}));

    return{
      paths:list,
      background:true,
      items:items
    };
  }

  if(infos.length===1){
    items.push(
      shellMenuItem(
        'open',
        infos[0].directory?'開啟':'開啟',
        true,
        {
          default:true,
          icon:infos[0].icon
        }
      )
    );

    if(!infos[0].directory){
      items.push(shellMenuItem('edit','編輯',true,{icon:'edit'}));
      items.push(shellMenuItem('download','下載',true,{icon:'download'}));
    }

    if(infos[0].directory){
      items.push(shellMenuItem('cmdhere','在此開啟命令提示字元',true,{icon:'cmd'}));
    }
    if(!infos[0].directory&&infos[0].extension==='zip'){
      items.push(shellMenuItem('extractall','全部解壓縮…',true,{icon:'folder'}));
    }

    items.push(shellSeparator());
  }else if(infos.length>1){
    if(files.length){
      items.push(shellMenuItem('download','下載選取的檔案',true,{icon:'download'}));
      items.push(shellSeparator());
    }
  }

  items.push(shellMenuItem('cut','剪下',infos.length>0,{icon:'cut'}));
  items.push(shellMenuItem('copy','複製',infos.length>0,{icon:'copy'}));
  if(infos.length===1)items.push(shellMenuItem('createshortcut','建立捷徑',true,{icon:'link'}));
  if(dirs.length===1&&infos.length===1&&!/^C:\\$/i.test(infos[0].path))items.push(shellMenuItem('compresszip','壓縮成 ZIP',true,{icon:'zipfolder'}));
  if(infos.length>0){
    items.push(shellMenuItem('sendto','傳送到…',true,{icon:'copy',submenu:[
      shellMenuItem('sendto_desktop_shortcut','桌面（建立捷徑）',true,{icon:'desktop'}),
      shellMenuItem('sendto_documents','文件',true,{icon:'folder'}),
      shellMenuItem('sendto_downloads','下載',true,{icon:'download'}),
      shellSeparator(),
      shellMenuItem('sendto_zip','壓縮的 (zipped) 資料夾',true,{icon:'zipfolder'})
    ]}));
  }

  if(dirs.length===1&&infos.length===1&&SHELL.clipboard.paths.length){
    items.push(shellMenuItem('paste','貼上到此資料夾',true,{icon:'paste'}));
  }

  items.push(shellSeparator());

  if(infos.length===1&&/^C:\\$/i.test(infos[0].path)){
    items.push(shellMenuItem('renamevolume','重新命名磁碟',true,{icon:'rename'}));
  }else{
    items.push(
      shellMenuItem(
        'rename',
        '重新命名',
        infos.length===1,
        {icon:'rename'}
      )
    );
  }

  items.push(
    shellMenuItem(
      'delete',
      infos.length>1?'刪除選取項目':'刪除',
      infos.length>0,
      {icon:'delete'}
    )
  );

  items.push(shellSeparator());

  items.push(
    shellMenuItem(
      'properties',
      infos.length>1?'內容摘要':'內容',
      infos.length>0,
      {icon:'properties'}
    )
  );

  return{
    paths:infos.map(function(x){return x.path;}),
    background:false,
    items:items
  };
}

function shellTrackContextMenu(ctx,paths,x,y,options){
  return new Promise(function(resolve){
    var model=shellContextMenu(ctx,paths,options),menu=null,subMenu=null,closed=false,clickAway,keyDown,left,top;
    shellEnsureStyle();
    function removeSubmenu(){if(!subMenu)return;try{if(subMenu.parentNode)subMenu.parentNode.removeChild(subMenu);}catch(ignoreSubmenuRemove){}subMenu=null;}
    function renderEntries(host,entries,isSubmenu){
      var i,item;
      for(i=0;i<entries.length;i++){
        item=entries[i];
        if(item.separator){var sep=document.createElement('div');sep.className='jplopsoft_shell32_menu_sep';host.appendChild(sep);continue;}
        (function(entry){
          var row=document.createElement('div'),icon=document.createElement('span'),label=document.createElement('span'),arrow=null;
          row.className='jplopsoft_shell32_menu_item';row.setAttribute('data-disabled',entry.enabled?'0':'1');row.setAttribute('data-default',entry.default?'1':'0');
          icon.className='jplopsoft_shell32_menu_icon';
          if(entry.icon&&typeof jplopsoft_svgIconApply==='function'){try{jplopsoft_svgIconApply(icon,entry.icon,16);}catch(ignoreIcon){}}
          label.className='jplopsoft_shell32_menu_label';label.textContent=entry.text;row.appendChild(icon);row.appendChild(label);
          if(entry.submenu&&entry.submenu.length){arrow=document.createElement('span');arrow.className='jplopsoft_shell32_menu_arrow';arrow.textContent='›';row.appendChild(arrow);}
          function openChild(e){
            if(!entry.enabled||!entry.submenu||!entry.submenu.length)return;
            try{if(e)e.stopPropagation();}catch(ignoreStop){}
            removeSubmenu();subMenu=document.createElement('div');subMenu.className='jplopsoft_shell32_menu';subMenu.setAttribute('data-shell-submenu','1');renderEntries(subMenu,entry.submenu,true);document.body.appendChild(subMenu);
            try{var rr=row.getBoundingClientRect(),sr=subMenu.getBoundingClientRect(),sl=rr.right-1,st=rr.top;if(sl+sr.width>window.innerWidth)sl=Math.max(0,rr.left-sr.width+1);if(st+sr.height>window.innerHeight)st=Math.max(0,window.innerHeight-sr.height-6);subMenu.style.left=Math.max(0,sl)+'px';subMenu.style.top=Math.max(0,st)+'px';}catch(ignoreSubmenuClamp){}
          }
          row.onmouseenter=function(){if(entry.submenu&&entry.submenu.length)openChild();else if(!isSubmenu)removeSubmenu();};
          row.onclick=function(e){try{e.stopPropagation();}catch(ignoreClickStop){}if(!entry.enabled)return;if(entry.submenu&&entry.submenu.length){openChild(e);return;}finish(entry.verb);};
          host.appendChild(row);
        })(item);
      }
    }
    menu=document.createElement('div');menu.className='jplopsoft_shell32_menu';menu.setAttribute('data-shell-menu-id',String(++SHELL.menuSeq));renderEntries(menu,model.items,false);document.body.appendChild(menu);
    left=Math.max(0,parseInt(x,10)||0);top=Math.max(0,parseInt(y,10)||0);menu.style.left=left+'px';menu.style.top=top+'px';
    window.setTimeout(function(){try{var r=menu.getBoundingClientRect();if(r.right>window.innerWidth)menu.style.left=Math.max(0,window.innerWidth-r.width-6)+'px';if(r.bottom>window.innerHeight)menu.style.top=Math.max(0,window.innerHeight-r.height-6)+'px';}catch(ignoreClamp){}},0);
    function finish(verb){if(closed)return;closed=true;removeSubmenu();try{document.removeEventListener('mousedown',clickAway,true);}catch(ignoreMouseRemove){}try{document.removeEventListener('keydown',keyDown,true);}catch(ignoreKeyRemove){}try{if(menu&&menu.parentNode)menu.parentNode.removeChild(menu);}catch(ignoreMenuRemove){}resolve(String(verb||''));}
    clickAway=function(e){if(menu&&menu.contains(e.target))return;if(subMenu&&subMenu.contains(e.target))return;finish('');};
    keyDown=function(e){if(String(e.key||'')==='Escape')finish('');};
    window.setTimeout(function(){document.addEventListener('mousedown',clickAway,true);document.addEventListener('keydown',keyDown,true);},0);
  });
}

function shellTrackPopupMenu(items,x,y){
  return new Promise(function(resolve){
    var entries=Array.isArray(items)?items:[],menu=null,closed=false,clickAway,keyDown,left,top;
    shellEnsureStyle();
    function finish(verb){
      if(closed)return;closed=true;
      try{document.removeEventListener('mousedown',clickAway,true);}catch(ignoreMouseRemove){}
      try{document.removeEventListener('keydown',keyDown,true);}catch(ignoreKeyRemove){}
      try{if(menu&&menu.parentNode)menu.parentNode.removeChild(menu);}catch(ignoreMenuRemove){}
      resolve(String(verb||''));
    }
    menu=document.createElement('div');menu.className='jplopsoft_shell32_menu';menu.setAttribute('data-shell-popup-id',String(++SHELL.menuSeq));
    entries.forEach(function(entry){
      if(!entry)return;
      if(entry.separator){var sep=document.createElement('div');sep.className='jplopsoft_shell32_menu_sep';menu.appendChild(sep);return;}
      var row=document.createElement('div'),icon=document.createElement('span'),label=document.createElement('span'),enabled=entry.enabled!==false;
      row.className='jplopsoft_shell32_menu_item';row.setAttribute('data-disabled',enabled?'0':'1');row.setAttribute('data-default',entry.default?'1':'0');
      icon.className='jplopsoft_shell32_menu_icon';
      if(entry.icon&&typeof jplopsoft_svgIconApply==='function'){try{jplopsoft_svgIconApply(icon,entry.icon,16);}catch(ignoreIcon){}}
      label.className='jplopsoft_shell32_menu_label';label.textContent=String(entry.text||entry.verb||'');row.appendChild(icon);row.appendChild(label);
      row.onclick=function(e){try{e.stopPropagation();}catch(ignoreStop){}if(!enabled)return;finish(entry.verb);};
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    left=Math.max(0,parseInt(x,10)||0);top=Math.max(0,parseInt(y,10)||0);menu.style.left=left+'px';menu.style.top=top+'px';
    window.setTimeout(function(){try{var r=menu.getBoundingClientRect();if(r.right>window.innerWidth)menu.style.left=Math.max(0,window.innerWidth-r.width-6)+'px';if(r.bottom>window.innerHeight)menu.style.top=Math.max(0,window.innerHeight-r.height-6)+'px';}catch(ignoreClamp){}},0);
    clickAway=function(e){if(menu&&menu.contains(e.target))return;finish('');};
    keyDown=function(e){if(String(e.key||'')==='Escape')finish('');};
    window.setTimeout(function(){document.addEventListener('mousedown',clickAway,true);document.addEventListener('keydown',keyDown,true);},0);
  });
}

function shellUniqueDestination(ctx,targetFolder,name){
  var base=String(name||''),
      dot=base.lastIndexOf('.'),
      stem=dot>0?base.substring(0,dot):base,
      ext=dot>0?base.substring(dot):'',
      candidate=shellJoinPath(targetFolder,base),
      n=1;

  while(jplopsoft_xshResolveC(ctx,candidate,false)){
    candidate=shellJoinPath(
      targetFolder,
      stem+' ('+n+')'+ext
    );
    n++;
  }

  return candidate;
}


async function shellCreateShortcutAt(ctx,source,destinationFolder){
  var src=shellInfo(ctx,source),base=src.name+' - 捷徑',candidate=base,n=1,dest;
  while(true){dest=shellNormalizePath(destinationFolder+'\\'+candidate);try{shellInfo(ctx,dest);n++;candidate=base+' ('+n+')';}catch(ignoreExistingShortcut){break;}}
  var link=await jplopsoft_xshCreateReparsePoint(ctx,dest,source,'SYMLINK');
  return{path:dest,target:source,id:link.id};
}
async function shellCompressToZip(ctx,list){
  if(!list.length)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'ZIP compression requires at least one object.');
  if(typeof global.jplopsoft_zipfldrDispatch!=='function')throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'zipfldr.dll is unavailable.');
  var first=shellInfo(ctx,list[0]),parent=shellParentPath(list[0]),base=first.name.replace(/\.zip$/i,'')||'Archive',candidate=shellUniqueDestination(ctx,parent,base+'.zip'),opened=null,i;
  await global.jplopsoft_zipfldrDispatch(ctx,'CreateArchive',[candidate]);
  try{
    opened=await global.jplopsoft_zipfldrDispatch(ctx,'OpenArchive',[candidate]);
    for(i=0;i<list.length;i++)await global.jplopsoft_zipfldrDispatch(ctx,'AddPath',[opened.handle,list[i],'']);
    return{ok:true,path:candidate,count:list.length};
  }catch(err){
    try{if(opened&&opened.handle)await global.jplopsoft_zipfldrDispatch(ctx,'CloseArchive',[opened.handle]);}catch(ignoreZipCloseOnError){}
    try{await global.jplopsoft_xshDeleteFile(ctx,candidate);}catch(ignoreZipCleanup){}
    throw err;
  }finally{
    try{if(opened&&opened.handle)await global.jplopsoft_zipfldrDispatch(ctx,'CloseArchive',[opened.handle]);}catch(ignoreZipClose){}
  }
}

async function shellCopyRecursive(ctx,source,destination,depth){
  var info=shellInfo(ctx,source),node=shellResolve(ctx,source),
      children,i,name,target;

  depth=parseInt(depth,10)||0;

  if(depth>48){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Shell copy recursion depth exceeded.'
    );
  }

  if(!node){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Source shell object not found.'
    );
  }

  if(info.reparsePoint){
    await jplopsoft_xshCreateReparsePoint(ctx,destination,info.reparseTarget,info.reparseTag||'SYMLINK');
    return 1;
  }

  if(node.type!=='folder'){
    await jplopsoft_xshCopyFile(
      ctx,
      source,
      destination,
      true
    );

    return 1;
  }

  if(
    shellNormalizePath(destination)===
      shellNormalizePath(source)||
    shellNormalizePath(destination).indexOf(
      shellNormalizePath(source)+'\\'
    )===0
  ){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Cannot copy a directory into itself.'
    );
  }

  await jplopsoft_xshCreateDirectory(
    ctx,
    destination
  );

  children=jplopsoft_xshListDirectory(
    ctx,
    source
  );

  var count=0;

  for(i=0;i<children.length;i++){
    name=String(children[i].name||'');

    target=shellJoinPath(
      destination,
      name
    );

    count+=await shellCopyRecursive(
      ctx,
      children[i].path,
      target,
      depth+1
    );
  }

  return count;
}

async function shellDeleteRecursive(ctx,path,depth){
  var info=shellInfo(ctx,path),node=shellResolve(ctx,path),
      children,i,count=0;

  depth=parseInt(depth,10)||0;

  if(depth>48){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Shell delete recursion depth exceeded.'
    );
  }

  if(!node){
    return 0;
  }

  if(info.reparsePoint){
    if(info.directory)await jplopsoft_xshRemoveDirectory(ctx,path);
    else await jplopsoft_xshDeleteFile(ctx,path);
    return 1;
  }

  if(node.type!=='folder'){
    await jplopsoft_xshDeleteFile(
      ctx,
      path
    );

    return 1;
  }

  children=jplopsoft_xshListDirectory(
    ctx,
    path
  );

  for(i=0;i<children.length;i++){
    count+=await shellDeleteRecursive(
      ctx,
      children[i].path,
      depth+1
    );
  }

  await jplopsoft_xshRemoveDirectory(
    ctx,
    path
  );

  return count;
}

async function shellFileOperation(ctx,spec){
  var s=spec||{},
      op=String(
        s.operation||
        s.op||
        ''
      ).toLowerCase(),
      sources=shellEnsureArray(
        s.sources||
        s.source
      )
        .map(shellNormalizePath)
        .filter(function(x){return!!x;}),
      destination=shellNormalizePath(
        s.destination||
        s.target||
        ''
      ),
      i,src,name,dst,count=0;

  if(!sources.length){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'SHFileOperation requires at least one source.'
    );
  }

  if(op==='copy'||op==='move'){
    var targetNode=shellResolve(
      ctx,
      destination
    );

    if(!targetNode||targetNode.type!=='folder'){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
        'Destination folder not found.'
      );
    }

    for(i=0;i<sources.length;i++){
      src=sources[i];
      name=shellBaseName(src);

      dst=shellUniqueDestination(
        ctx,
        destination,
        name
      );

      if(op==='move'){
        if(
          shellNormalizePath(
            shellParentPath(src)
          )===
          shellNormalizePath(destination)
        ){
          /*
           * Native shell move inside the same directory is a no-op.
           * Do not manufacture "file (1)" merely because the pointer was
           * dropped on another row in the same ListView.
           */
          continue;
        }

        var srcInfo=shellInfo(
          ctx,
          src
        );

        if(
          srcInfo.directory&&
          (
            shellNormalizePath(destination)===
              shellNormalizePath(src)||
            shellNormalizePath(destination).indexOf(
              shellNormalizePath(src)+'\\'
            )===0
          )
        ){
          throw jplopsoft_xshError(
            jplopsoft_STATUS_INVALID_PARAMETER,
            'Cannot move a directory into itself.'
          );
        }

        await jplopsoft_xshMoveFile(
          ctx,
          src,
          dst
        );
        count++;
      }else{
        count+=await shellCopyRecursive(
          ctx,
          src,
          dst,
          0
        );
      }
    }

    return{
      ok:true,
      operation:op,
      completed:count
    };
  }

  if(op==='delete'){
    for(i=0;i<sources.length;i++){
      count+=await shellDeleteRecursive(
        ctx,
        sources[i],
        0
      );
    }

    return{
      ok:true,
      operation:op,
      completed:count
    };
  }

  if(op==='rename'){
    if(
      sources.length!==1||
      !destination
    ){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Rename requires one source and one destination path.'
      );
    }

    await jplopsoft_xshMoveFile(
      ctx,
      sources[0],
      destination
    );

    return{
      ok:true,
      operation:op,
      completed:1
    };
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported SHFileOperation: '+op
  );
}

async function shellExecute(ctx,path,verb,args){
  var p=shellNormalizePath(path),
      action=String(verb||'open').toLowerCase(),
      info;

  if(action===''||action==='open'||action==='explore'){
    info=shellInfo(ctx,p);

    if(info.directory){
      var child=
        await jplopsoft_runBuiltinXsh(
          'explorer',
          [p],
          ctx
        );

      return{
        ok:true,
        verb:'open',
        pid:child.pid,
        path:p
      };
    }

    if(info.extension==='zip'){
      var zipChild=await jplopsoft_runBuiltinXsh('zipfolder',[p],ctx);
      return{ok:true,verb:'open',pid:zipChild.pid,path:p,compressedFolder:true};
    }

    if(info.extension==='xba'){
      var batchChild=await jplopsoft_runBuiltinXsh(
        'cmd',
        ['/c',shellQuote(p)].concat(shellEnsureArray(args||[])),
        ctx
      );
      return{ok:true,verb:'open',pid:batchChild.pid,path:p,batch:true};
    }

    return await jplopsoft_xshSystemOpenPath(
      ctx,
      p
    );
  }

  if(action==='edit'){
    info=shellInfo(ctx,p);

    if(info.directory){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'A directory cannot be edited.'
      );
    }

    var ext=info.extension,
        app='notepad';

    if(ext==='csv')app='csvedit';
    if(ext==='html'||ext==='htm')app='html_editor';
    if(ext==='png'||ext==='jpg'||ext==='jpeg'||ext==='gif'||ext==='webp'||ext==='bmp')app='paint';

    var editor=
      await jplopsoft_runBuiltinXsh(
        app,
        [p],
        ctx
      );

    return{
      ok:true,
      verb:'edit',
      pid:editor.pid,
      path:p
    };
  }

  if(action==='download'){
    return jplopsoft_xshSystemDownloadPath(
      ctx,
      p
    );
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported ShellExecute verb: '+action
  );
}

async function shellInvokeCommand(ctx,verb,paths,options){
  var action=String(verb||'').toLowerCase(),
      list=shellEnsureArray(paths)
        .map(shellNormalizePath)
        .filter(function(x){return!!x;}),
      opt=options||{},
      i,out;

  if(action==='extractall'){
    if(list.length!==1||shellExtension(list[0])!=='zip'){
      throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Extract All requires one ZIP archive.');
    }
    var zipExtract=await jplopsoft_runBuiltinXsh('zipfolder',[list[0],'/extract'],ctx);
    return{ok:true,verb:'extractall',pid:zipExtract.pid,path:list[0]};
  }

  if(action==='open'||action==='edit'||action==='download'){
    if(!list.length){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Shell verb requires a selected object.'
      );
    }

    out=[];

    for(i=0;i<list.length;i++){
      out.push(
        await shellExecute(
          ctx,
          list[i],
          action,
          opt.args||[]
        )
      );
    }

    return{
      ok:true,
      verb:action,
      results:out
    };
  }

  if(action==='createshortcut'){
    if(list.length!==1)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Create shortcut requires one selected object.');
    var shortcut=await shellCreateShortcutAt(ctx,list[0],shellParentPath(list[0]));
    shortcut.ok=true;shortcut.verb='createshortcut';return shortcut;
  }

  if(action==='compresszip'||action==='sendto_zip'){
    var zipped=await shellCompressToZip(ctx,list);zipped.verb=action;return zipped;
  }

  if(action==='sendto_desktop_shortcut'){
    var desktop=shellKnownFolder(ctx,'FOLDERID_DESKTOP'),shortcuts=[];
    for(i=0;i<list.length;i++)shortcuts.push(await shellCreateShortcutAt(ctx,list[i],desktop));
    return{ok:true,verb:action,destination:desktop,completed:shortcuts.length,results:shortcuts};
  }

  if(action==='sendto_documents'||action==='sendto_downloads'){
    var sendDestination=shellKnownFolder(ctx,action==='sendto_documents'?'FOLDERID_DOCUMENTS':'FOLDERID_DOWNLOADS');
    var sendResult=await shellFileOperation(ctx,{operation:'copy',sources:list,destination:sendDestination});
    sendResult.verb=action;sendResult.destination=sendDestination;return sendResult;
  }

  if(action==='copy'||action==='cut'){
    SHELL.clipboard.effect=action;
    SHELL.clipboard.paths=list.slice();
    SHELL.clipboard.sourcePid=
      parseInt(ctx&&ctx.pid,10)||0;
    SHELL.clipboard.updatedAt=
      new Date().getTime();

    return{
      ok:true,
      verb:action,
      clipboard:{
        effect:SHELL.clipboard.effect,
        paths:SHELL.clipboard.paths.slice(),
        count:SHELL.clipboard.paths.length
      }
    };
  }

  if(action==='paste'){
    if(!SHELL.clipboard.paths.length){
      return{
        ok:false,
        verb:'paste',
        completed:0,
        reason:'clipboard-empty'
      };
    }

    var result=
      await shellFileOperation(
        ctx,
        {
          operation:
            SHELL.clipboard.effect==='cut'
              ?'move'
              :'copy',
          sources:
            SHELL.clipboard.paths.slice(),
          destination:
            String(opt.targetPath||'')
        }
      );

    if(
      SHELL.clipboard.effect==='cut'&&
      result.ok
    ){
      SHELL.clipboard.effect='';
      SHELL.clipboard.paths=[];
      SHELL.clipboard.sourcePid=0;
      SHELL.clipboard.updatedAt=
        new Date().getTime();
    }

    return result;
  }

  if(action==='delete'){
    return await shellFileOperation(
      ctx,
      {
        operation:'delete',
        sources:list
      }
    );
  }

  if(action==='renamevolume'){
    var label=String(opt.label===undefined?opt.newLabel:opt.label);
    var changed=await jplopsoft_xshApiPromise('volume_set_label','POST',{label:label});
    if(typeof jplopsoft_XSH!=='undefined'&&jplopsoft_XSH.systemVdo){
      jplopsoft_XSH.systemVdo.label=String(changed&&changed.label!==undefined?changed.label:label);
    }
    return{ok:true,verb:'renamevolume',label:String(changed&&changed.label!==undefined?changed.label:label)};
  }

  if(action==='rename'){
    return await shellFileOperation(
      ctx,
      {
        operation:'rename',
        sources:list,
        destination:String(
          opt.newPath||
          opt.destination||
          ''
        )
      }
    );
  }

  if(action==='properties'){
    out=[];

    for(i=0;i<list.length;i++){
      out.push(
        shellInfo(
          ctx,
          list[i]
        )
      );
    }

    return{
      ok:true,
      verb:'properties',
      items:out
    };
  }

  if(action==='cmdhere'){
    var target=
      list.length
        ?list[0]
        :String(opt.targetPath||ctx.currentDirectory||'C:\\');

    var info=shellInfo(ctx,target);

    if(!info.directory){
      target=shellParentPath(target);
    }

    var child=await jplopsoft_runBuiltinXsh(
      'cmd',
      [
        '/k',
        'cd /d '+shellQuote(target)
      ],
      ctx
    );

    return{
      ok:true,
      verb:'cmdhere',
      pid:child.pid,
      path:target
    };
  }

  if(action==='refresh'||action==='newfolder'||action==='newtext'||action==='newcsv'||action==='newhtml'||action==='newxsh'){
    return{
      ok:true,
      verb:action,
      hostAction:true
    };
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported shell verb: '+action
  );
}

function shellGetClipboard(){
  return{
    effect:String(SHELL.clipboard.effect||''),
    paths:SHELL.clipboard.paths.slice(),
    count:SHELL.clipboard.paths.length,
    sourcePid:SHELL.clipboard.sourcePid,
    updatedAt:SHELL.clipboard.updatedAt
  };
}

function shellEmptyClipboard(){
  SHELL.clipboard.effect='';
  SHELL.clipboard.paths=[];
  SHELL.clipboard.sourcePid=0;
  SHELL.clipboard.updatedAt=
    new Date().getTime();

  return true;
}

function shellBeginDragDrop(ctx,paths,options){
  var list=shellEnsureArray(paths)
        .map(function(x){
          x=String(x||'');
          return typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(x)
            ?x
            :shellNormalizePath(x);
        })
        .filter(function(x){return!!x;}),
      opt=options||{};

  if(!list.length){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'DoDragDrop requires at least one source.'
    );
  }

  SHELL.drag.id++;
  SHELL.drag.paths=list;
  SHELL.drag.sourcePid=
    parseInt(ctx&&ctx.pid,10)||0;
  SHELL.drag.allowedEffects=
    shellEnsureArray(
      opt.allowedEffects||['copy','move']
    )
      .map(function(x){
        return String(x||'').toLowerCase();
      })
      .filter(function(x){
        return x==='copy'||x==='move';
      });

  if(!SHELL.drag.allowedEffects.length){
    SHELL.drag.allowedEffects=['copy','move'];
  }

  SHELL.drag.active=true;

  return{
    id:SHELL.drag.id,
    active:true,
    paths:SHELL.drag.paths.slice(),
    allowedEffects:SHELL.drag.allowedEffects.slice()
  };
}

function shellDragOver(ctx,targetPath,options){
  var raw=String(targetPath||''),
      targetIsZip=typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(raw),
      target=targetIsZip?raw:shellNormalizePath(raw),
      opt=options||{},node=null,effect='none',sourceHasZip=false,sourceHasNormal=false,i;

  if(!SHELL.drag.active){return{accepted:false,effect:'none',targetPath:target};}
  for(i=0;i<SHELL.drag.paths.length;i++){
    if(typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(SHELL.drag.paths[i]))sourceHasZip=true;
    else sourceHasNormal=true;
  }
  if(targetIsZip){
    if(sourceHasZip)return{accepted:false,effect:'none',targetPath:target};
    effect=SHELL.drag.allowedEffects.indexOf('copy')>=0?'copy':'none';
    return{accepted:effect!=='none',effect:effect,targetPath:target,namespace:'zipfldr'};
  }
  node=shellResolve(ctx,target);
  if(!node||node.type!=='folder')return{accepted:false,effect:'none',targetPath:target};
  if(sourceHasZip){
    effect=SHELL.drag.allowedEffects.indexOf('copy')>=0?'copy':'none';
  }else if(opt.ctrlKey&&SHELL.drag.allowedEffects.indexOf('copy')>=0){
    effect='copy';
  }else if(SHELL.drag.allowedEffects.indexOf('move')>=0){
    effect='move';
  }else if(SHELL.drag.allowedEffects.indexOf('copy')>=0){
    effect='copy';
  }
  return{accepted:effect!=='none',effect:effect,targetPath:target};
}

async function shellDrop(ctx,targetPath,options){
  var over=shellDragOver(ctx,targetPath,options),result,i,source;
  if(!over.accepted){SHELL.drag.active=false;return{ok:false,effect:'none',completed:0};}
  try{
    if(typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(over.targetPath)){
      result=await jplopsoft_zipfldrAddPathsVirtual(ctx,over.targetPath,SHELL.drag.paths.slice());
      return{ok:true,effect:'copy',completed:Number(result&&result.count)||SHELL.drag.paths.length,targetPath:over.targetPath,namespace:'zipfldr'};
    }
    if(SHELL.drag.paths.some(function(x){return typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(x);})){ 
      var done=0;
      for(i=0;i<SHELL.drag.paths.length;i++){
        source=SHELL.drag.paths[i];
        if(typeof jplopsoft_zipfldrIsVirtualPath==='function'&&jplopsoft_zipfldrIsVirtualPath(source)){
          await jplopsoft_zipfldrExtractVirtual(ctx,source,over.targetPath);done++;
        }
      }
      return{ok:true,effect:'copy',completed:done,targetPath:over.targetPath,namespace:'zipfldr'};
    }
    result=await shellFileOperation(ctx,{operation:over.effect==='copy'?'copy':'move',sources:SHELL.drag.paths.slice(),destination:over.targetPath});
    return{ok:!!result.ok,effect:over.effect,completed:result.completed||0,targetPath:over.targetPath};
  }finally{
    SHELL.drag.active=false;SHELL.drag.paths=[];SHELL.drag.sourcePid=0;
  }
}

async function shellDoDragDrop(ctx,paths,targetPath,options){
  shellBeginDragDrop(
    ctx,
    paths,
    options
  );

  return await shellDrop(
    ctx,
    targetPath,
    options
  );
}

function shellCancelDragDrop(){
  SHELL.drag.active=false;
  SHELL.drag.paths=[];
  SHELL.drag.sourcePid=0;

  return true;
}


function shellReloadNodesPromise(){
  return new Promise(function(resolve){
    try{
      jplopsoft_reloadNodes(function(){resolve(true);});
    }catch(e){
      resolve(false);
    }
  });
}

async function shellUnblockFile(ctx,path){
  var info=shellInfo(ctx,path),out;

  if(info.directory){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Zone.Identifier unblock applies to files only.'
    );
  }

  if(!info.nodeId){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Shell file node was not found.'
    );
  }

  if(!info.markOfTheWeb){
    return{
      ok:true,
      changed:false,
      path:info.path,
      markOfTheWeb:false,
      zoneId:0
    };
  }

  /*
   * Dedicated API: do not expose generic ADS_DELETE to XSH. The server accepts
   * only deletion of Zone.Identifier and still performs the file DACL check.
   */
  out=await jplopsoft_xshApiPromise(
    'motw_unblock',
    'POST',
    {id:info.nodeId}
  );

  await shellReloadNodesPromise();

  return{
    ok:true,
    changed:!!(out&&out.changed),
    path:info.path,
    markOfTheWeb:false,
    zoneId:0
  };
}

async function shellQueryRecycleBin(ctx){
  var out=await jplopsoft_xshApiPromise('trash_list','GET',null),
      items=out&&out.items&&Object.prototype.toString.call(out.items)==='[object Array]'?out.items:[],
      result=[],i,item,name,original;

  for(i=0;i<items.length;i++){
    item=items[i]||{};
    try{name=jplopsoft_decName(item);}catch(ignoreName){name='';}
    if(!name)name='[encrypted #'+String(item.id||0)+']';
    try{original=jplopsoft_trashOriginalPath(item);}catch(ignorePath){original='C:\\';}
    result.push({
      id:parseInt(item.id,10)||0,
      name:String(name),
      type:String(item.type||'file'),
      trashedAt:String(item.trashed_at||''),
      originalParentId:parseInt(item.original_parent_id,10)||0,
      originalPath:String(original||'C:\\'),
      itemCount:parseInt(item.item_count,10)||1
    });
  }
  return result;
}

async function shellRestoreFromRecycleBin(ctx,id){
  id=parseInt(id,10)||0;
  if(id<=0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Recycle Bin item id is required.');
  await jplopsoft_xshApiPromise('trash_restore','POST',{id:id});
  await shellReloadNodesPromise();
  return true;
}

async function shellDeleteFromRecycleBin(ctx,id){
  id=parseInt(id,10)||0;
  if(id<=0)throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_PARAMETER,'Recycle Bin item id is required.');
  await jplopsoft_xshApiPromise('trash_delete','POST',{id:id});
  await shellReloadNodesPromise();
  return true;
}

async function shellEmptyRecycleBin(ctx){
  var out=await jplopsoft_xshApiPromise('trash_empty','POST',{});
  await shellReloadNodesPromise();
  return {ok:true,deleted:out&&out.deleted?parseInt(out.deleted,10)||0:0};
}


function shellEnv(ctx,name,def){
  var e=ctx&&ctx.process&&ctx.process.peb&&ctx.process.peb.processParameters?ctx.process.peb.processParameters.environment:null,k=String(name||'').toUpperCase();
  return e&&typeof e[k]!=='undefined'?String(e[k]):String(def||'');
}
function shellKnownFolder(ctx,id){
  var u=shellEnv(ctx,'USERPROFILE','C:\\Users\\'+String(ctx&&ctx.username||'administrator')),
      pub=shellEnv(ctx,'PUBLIC','C:\\Users\\Public'),win=shellEnv(ctx,'SYSTEMROOT','C:\\Windows'),
      pf=shellEnv(ctx,'PROGRAMFILES','C:\\Program Files'),pfx=shellEnv(ctx,'PROGRAMFILES(X86)','C:\\Program Files (x86)'),
      k=String(id===undefined?'':id).toUpperCase().replace(/[{}]/g,'');
  var map={
    'FOLDERID_DESKTOP':u+'\\Desktop','DESKTOP':u+'\\Desktop','0X10':u+'\\Desktop','16':u+'\\Desktop',
    'FOLDERID_DOCUMENTS':u+'\\Documents','DOCUMENTS':u+'\\Documents','PERSONAL':u+'\\Documents','0X5':u+'\\Documents','5':u+'\\Documents',
    'FOLDERID_DOWNLOADS':u+'\\Downloads','DOWNLOADS':u+'\\Downloads',
    'FOLDERID_PUBLICDOCUMENTS':pub+'\\Documents','PUBLICDOCUMENTS':pub+'\\Documents','0X2E':pub+'\\Documents','46':pub+'\\Documents',
    'FOLDERID_PUBLICDESKTOP':pub+'\\Desktop','PUBLICDESKTOP':pub+'\\Desktop','0X19':pub+'\\Desktop','25':pub+'\\Desktop',
    'FOLDERID_WINDOWS':win,'WINDOWS':win,'0X24':win,'36':win,
    'FOLDERID_PROGRAMFILES':pf,'PROGRAMFILES':pf,'0X26':pf,'38':pf,
    'FOLDERID_PROGRAMFILESX86':pfx,'PROGRAMFILESX86':pfx,'0X2A':pfx,'42':pfx,
    'FOLDERID_PROFILE':u,'PROFILE':u,'0X28':u,'40':u
  };
  if(Object.prototype.hasOwnProperty.call(map,k))return shellNormalizePath(map[k]);
  throw jplopsoft_xshError(jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Known Folder/CSIDL is not mapped by ExOS: '+String(id));
}
function shellPidl(ctx,path){
  var p=shellNormalizePath(path),info=shellInfo(ctx,p);
  return{pidl:'PIDL:EXFS:'+encodeURIComponent(p),parsingName:p,displayName:info.name,typeName:info.typeName,directory:info.directory,nodeId:info.nodeId,filesystem:'ExFS'};
}
function shellPidlPath(pidl){
  if(pidl&&typeof pidl==='object'&&pidl.parsingName)return shellNormalizePath(pidl.parsingName);
  var s=String(pidl||'');if(s.indexOf('PIDL:EXFS:')===0){try{return shellNormalizePath(decodeURIComponent(s.substring(10)));}catch(ignore){}}
  return shellNormalizePath(s);
}
async function shellCreateDirectoryTree(ctx,path){
  var p=shellNormalizePath(path);if(!/^C:\\/i.test(p))throw jplopsoft_xshError(jplopsoft_STATUS_NOT_SUPPORTED,'SHCreateDirectoryEx supports ExFS C: only.');
  var parts=p.substring(3).split('\\'),cur='C:\\',i;
  for(i=0;i<parts.length;i++){if(!parts[i])continue;cur=cur==='C:\\'?cur+parts[i]:cur+'\\'+parts[i];if(!shellResolve(ctx,cur)){try{await global.jplopsoft_xshCreateDirectory(ctx,cur);}catch(e){if(!shellResolve(ctx,cur))throw e;}}}
  return true;
}


function shellPidlClone(ctx,pidl){var p=shellPidlPath(pidl);return shellPidl(ctx,p);}
function shellPidlCombine(ctx,a,b){var ap=shellPidlPath(a),bp=shellPidlPath(b);if(/^[a-zA-Z]:[\\/]/.test(bp))return shellPidl(ctx,bp);return shellPidl(ctx,ap.replace(/[\\/]+$/,'')+'\\'+bp.replace(/^[\\/]+/,''));}
function shellCommandLineToArgv(text){var s=String(text||''),out=[],cur='',quote=false,bs=0,i,ch;for(i=0;i<=s.length;i++){ch=i<s.length?s.charAt(i):' ';if(ch==='\\'){bs++;continue;}if(ch==='"'){cur+='\\'.repeat(Math.floor(bs/2));if(bs%2)cur+='"';else quote=!quote;bs=0;continue;}if(bs){cur+='\\'.repeat(bs);bs=0;}if(/\s/.test(ch)&&!quote){if(cur!==''){out.push(cur);cur='';}}else cur+=ch;}return out;}
function shellPropertyStore(ctx,path){var info=shellInfo(ctx,path),h=PROPERTY_STORES.next++;PROPERTY_STORES.items[String(h)]={handle:h,ownerPid:parseInt(ctx.pid,10)||0,path:info.path,values:{'System.ItemNameDisplay':info.name,'System.ItemPathDisplay':info.path,'System.ItemTypeText':info.typeName,'System.FileExtension':info.extension?'.'+info.extension:'','System.Size':info.size||0,'System.DateModified':info.updatedAt||'', 'System.IsFolder':!!info.directory}};return h;}
function shellPropertyRec(ctx,h){var r=PROPERTY_STORES.items[String(Number(h)||0)];if(!r||r.ownerPid!==(parseInt(ctx.pid,10)||0))throw jplopsoft_xshError(jplopsoft_STATUS_INVALID_HANDLE,'Invalid Shell property store.');return r;}

async function shellDispatch(ctx,method,args){
  args=args||[];

  if(method==='GetShellVersion'){
    return{
      version:SHELL.version,
      model:SHELL.model,
      compatibility:'EXOS_SHELL32_SEMANTIC_V2',
      knownFolders:true,
      pidlObjects:true,
      propertyStores:true,
      hostShellObjects:false
    };
  }


  if(method==='SHGetKnownFolderPath'||method==='SHGetKnownFolderPathA'||method==='SHGetKnownFolderPathW'||method==='SHGetFolderPath'||method==='SHGetFolderPathA'||method==='SHGetFolderPathW')return shellKnownFolder(ctx,args[0]);
  if(method==='SHGetSpecialFolderPath'||method==='SHGetSpecialFolderPathA'||method==='SHGetSpecialFolderPathW'||method==='SHGetSpecialFolderLocation')return shellKnownFolder(ctx,args[0]);
  if(method==='ILClone'||method==='ILCloneFull')return shellPidlClone(ctx,args[0]);
  if(method==='ILCombine')return shellPidlCombine(ctx,args[0],args[1]);
  if(method==='ILFindLastID'){var lp=shellPidlPath(args[0]),parts=lp.split('\\');return{kind:'EXOS_PIDL',parsingName:parts.length?parts[parts.length-1]:'',absolute:false};}
  if(method==='ILRemoveLastID'){lp=shellPidlPath(args[0]);parts=lp.split('\\');parts.pop();return shellPidl(ctx,parts.join('\\'));}
  if(method==='SHBindToParent'){lp=shellPidlPath(args[0]);parts=lp.split('\\');var child=parts.pop()||'';return{parent:shellPidl(ctx,parts.join('\\')),child:{kind:'EXOS_PIDL',parsingName:child,absolute:false}};}
  if(method==='SHCreateShellItem')return shellInfo(ctx,shellPidlPath(args[0]));
  if(method==='SHCreateItemInKnownFolder'){var base=shellKnownFolder(ctx,args[0]),rel=String(args[1]||'');return shellInfo(ctx,base.replace(/\\+$/,'')+(rel?'\\'+rel.replace(/^\\+/, ''):''));}
  if(method==='CommandLineToArgvW'||method==='CommandLineToArgvA')return shellCommandLineToArgv(args[0]);
  if(method==='SHGetStockIconInfo'){var si=String(args[0]||'').toUpperCase(),map={SIID_FOLDER:'folder',SIID_DOCNOASSOC:'file',SIID_DRIVEFIXED:'drive',SIID_DELETE:'recycle',SIID_APPLICATION:'app',SIID_WARNING:'warning',SIID_INFO:'info'};return{id:si,icon:map[si]||'file',dll:'shell32.dll'};}
  if(method==='SHGetPropertyStoreFromParsingName'){return shellPropertyStore(ctx,args[0]);}
  if(method==='PropertyStoreGetValue'){var pr=shellPropertyRec(ctx,args[0]);return Object.prototype.hasOwnProperty.call(pr.values,String(args[1]))?pr.values[String(args[1])]:null;}
  if(method==='PropertyStoreEnum'){pr=shellPropertyRec(ctx,args[0]);return Object.keys(pr.values).map(function(k){return{key:k,value:pr.values[k]};});}
  if(method==='PropertyStoreCommit')return true;
  if(method==='PropertyStoreRelease'){pr=shellPropertyRec(ctx,args[0]);delete PROPERTY_STORES.items[String(pr.handle)];return true;}
  if(method==='SHParseDisplayName')return shellPidl(ctx,args[0]);
  if(method==='SHGetNameFromIDList'){var pp=shellPidlPath(args[0]),ii=shellInfo(ctx,pp);return String(args[1]||'SIGDN_FILESYSPATH').toUpperCase().indexOf('NORMALDISPLAY')>=0?ii.name:pp;}
  if(method==='SHCreateItemFromParsingName')return shellInfo(ctx,args[0]);
  if(method==='SHGetDesktopFolder')return{namespace:'Desktop',path:shellKnownFolder(ctx,'FOLDERID_DESKTOP'),pidl:shellPidl(ctx,shellKnownFolder(ctx,'FOLDERID_DESKTOP'))};
  if(method==='SHCreateDirectoryEx'||method==='SHCreateDirectoryExA'||method==='SHCreateDirectoryExW')return await shellCreateDirectoryTree(ctx,args[0]);
  if(method==='ShellExecuteEx'||method==='ShellExecuteExA'||method==='ShellExecuteExW'){
    var ex=args[0]||{},res=await shellExecute(ctx,ex.file||ex.lpFile||'',ex.verb||ex.lpVerb||'open',ex.parameters||ex.lpParameters||'');return{ok:true,hInstApp:33,processId:res&&res.pid?res.pid:0,result:res};
  }
  if(method==='SHChangeNotify'){if(typeof global.jplopsoft_xshSendEvent==='function')global.jplopsoft_xshSendEvent(ctx,{event:'shell32',controlId:'SHELL_NOTIFY',action:'change',changeEvent:args[0],item1:args[1]||null,item2:args[2]||null});return true;}

  if(method==='SHGetFileAssociation'){
    return shellAssociation(
      args[0]
    );
  }

  if(method==='SHGetFileInfo'){
    return await shellInfoWithImage(
      ctx,
      args[0]
    );
  }

  if(method==='SHGetFileTypeName'){
    var info=shellInfo(ctx,args[0]);
    return info.typeName;
  }

  if(method==='SHGetContextMenu'){
    return shellContextMenu(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='TrackContextMenu'){
    return await shellTrackContextMenu(
      ctx,
      args[0],
      args[1],
      args[2],
      args[3]
    );
  }

  if(method==='TrackPopupMenu'){
    return await shellTrackPopupMenu(args[0],args[1],args[2]);
  }

  if(method==='ShellExecute'){
    return await shellExecute(
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }

  if(method==='InvokeCommand'){
    return await shellInvokeCommand(
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }

  if(method==='SHFileOperation'){
    return await shellFileOperation(
      ctx,
      args[0]
    );
  }

  if(method==='GetClipboardState'){
    return shellGetClipboard();
  }

  if(method==='EmptyClipboard'){
    return shellEmptyClipboard();
  }

  if(method==='DoDragDrop'){
    return await shellDoDragDrop(
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }

  if(method==='BeginDragDrop'){
    return shellBeginDragDrop(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='DragOver'){
    return shellDragOver(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='Drop'){
    return await shellDrop(
      ctx,
      args[0],
      args[1]
    );
  }

  if(method==='CancelDragDrop'){
    return shellCancelDragDrop();
  }

  if(method==='UnblockFile'){
    return await shellUnblockFile(
      ctx,
      args[0]
    );
  }

  if(method==='SHQueryRecycleBin'){
    return await shellQueryRecycleBin(ctx);
  }

  if(method==='SHRestoreFromRecycleBin'){
    return await shellRestoreFromRecycleBin(ctx,args[0]);
  }

  if(method==='SHDeleteFromRecycleBin'){
    return await shellDeleteFromRecycleBin(ctx,args[0]);
  }

  if(method==='SHEmptyRecycleBin'){
    return await shellEmptyRecycleBin(ctx);
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'shell32.dll method is not implemented: '+String(method||'')
  );
}

function shellCleanupContext(ctx){
  var pid=parseInt(ctx&&ctx.pid,10)||0,k,r;
  for(k in PROPERTY_STORES.items){
    if(Object.prototype.hasOwnProperty.call(PROPERTY_STORES.items,k)){
      r=PROPERTY_STORES.items[k];
      if(r&&parseInt(r.ownerPid,10)===pid)delete PROPERTY_STORES.items[k];
    }
  }
  if(SHELL.drag&&parseInt(SHELL.drag.sourcePid,10)===pid){
    SHELL.drag={id:0,paths:[],allowedEffects:['copy','move'],sourcePid:0,active:false};
  }
  if(SHELL.clipboard&&parseInt(SHELL.clipboard.sourcePid,10)===pid){
    /* Clipboard data remains usable after the source process exits, matching
       Windows clipboard ownership transfer semantics. Only ownership changes. */
    SHELL.clipboard.sourcePid=0;
  }
  return true;
}

global.jplopsoft_SHELL32=SHELL;
global.jplopsoft_shell32Dispatch=shellDispatch;
global.jplopsoft_shell32CleanupContext=shellCleanupContext;

})(window);
