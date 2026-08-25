/* ExOS shell32.dll emulation
 * Version: 6.4.0-dev-os57
 * Model: EXOS_SHELL32_V1
 *
 * Browser/XSH shell API.  The implementation is intentionally restricted to
 * ExOS' C: -> ExFS -> PHP /_exfs/ VDO.  It never exposes the host filesystem.
 */
(function(global){
'use strict';

var SHELL={
  version:'6.4.0-dev-os57',
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

  if(/^C:$/i.test(p))p+='\\';

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

  if(/^C:\\$/i.test(p))return'';

  i=p.lastIndexOf('\\');

  return i<=2
    ?'C:\\'
    :p.substring(0,i);
}

function shellJoinPath(base,name){
  var b=shellNormalizePath(base),
      n=String(name||'').replace(/[\\\/]+/g,'');

  if(!n)return b;

  return b==='C:\\'
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

  return'file';
}

function shellResolve(ctx,path){
  var p=shellNormalizePath(path),
      node;

  if(!/^C:(?:\\|$)/i.test(p)){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_NOT_SUPPORTED,
      'shell32.dll only exposes the ExOS C: / ExFS VDO.'
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

  return{
    extension:key,
    registered:!!rec,
    association:rec,
    defaultVerb:'open'
  };
}

function shellInfo(ctx,path){
  var p=shellNormalizePath(path),
      node=shellResolve(ctx,p),
      directory,size,name;

  if(!node){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Shell object not found: '+p
    );
  }

  directory=node.type==='folder';
  size=parseInt(node.original_size,10)||0;
  name=node.root
    ?'本機磁碟 (C:)'
    :String(jplopsoft_decName(node)||shellBaseName(p));

  return{
    path:p,
    name:name,
    directory:directory,
    size:size,
    extension:directory?'':shellExtension(p),
    typeName:shellTypeName(p,directory),
    icon:shellIconName(p,directory),
    nodeId:node.root?0:(parseInt(node.id,10)||0),
    attributes:{
      directory:directory,
      hidden:false,
      system:false,
      readOnly:false
    },
    filesystem:'ExFS',
    backingVdo:'PHP /_exfs/',
    association:shellAssociation(p)
  };
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
    '.jplopsoft_shell32_menu_icon{width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 17px}';

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
    icon:String(options.icon||'')
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

    items.push(shellSeparator());
  }else if(infos.length>1){
    if(files.length){
      items.push(shellMenuItem('download','下載選取的檔案',true,{icon:'download'}));
      items.push(shellSeparator());
    }
  }

  items.push(shellMenuItem('cut','剪下',infos.length>0,{icon:'cut'}));
  items.push(shellMenuItem('copy','複製',infos.length>0,{icon:'copy'}));

  if(dirs.length===1&&infos.length===1&&SHELL.clipboard.paths.length){
    items.push(shellMenuItem('paste','貼上到此資料夾',true,{icon:'paste'}));
  }

  items.push(shellSeparator());

  items.push(
    shellMenuItem(
      'rename',
      '重新命名',
      infos.length===1,
      {icon:'rename'}
    )
  );

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
    var model=shellContextMenu(
          ctx,
          paths,
          options
        ),
        menu,item,i,closed=false,
        clickAway,keyDown,
        left,top;

    shellEnsureStyle();

    menu=document.createElement('div');
    menu.className='jplopsoft_shell32_menu';
    menu.setAttribute(
      'data-shell-menu-id',
      String(++SHELL.menuSeq)
    );

    for(i=0;i<model.items.length;i++){
      item=model.items[i];

      if(item.separator){
        var sep=document.createElement('div');
        sep.className='jplopsoft_shell32_menu_sep';
        menu.appendChild(sep);
        continue;
      }

      (function(entry){
        var row=document.createElement('div'),
            icon=document.createElement('span'),
            label=document.createElement('span');

        row.className='jplopsoft_shell32_menu_item';
        row.setAttribute(
          'data-disabled',
          entry.enabled?'0':'1'
        );
        row.setAttribute(
          'data-default',
          entry.default?'1':'0'
        );

        icon.className='jplopsoft_shell32_menu_icon';

        if(
          entry.icon&&
          typeof jplopsoft_svgIconApply==='function'
        ){
          try{
            jplopsoft_svgIconApply(
              icon,
              entry.icon,
              16
            );
          }catch(ignoreIcon){}
        }

        label.textContent=entry.text;

        row.appendChild(icon);
        row.appendChild(label);

        row.onclick=function(e){
          try{e.stopPropagation();}catch(ignoreStop){}

          if(!entry.enabled)return;

          finish(entry.verb);
        };

        menu.appendChild(row);
      })(item);
    }

    document.body.appendChild(menu);

    left=Math.max(
      0,
      parseInt(x,10)||0
    );

    top=Math.max(
      0,
      parseInt(y,10)||0
    );

    menu.style.left=left+'px';
    menu.style.top=top+'px';

    window.setTimeout(function(){
      try{
        var r=menu.getBoundingClientRect();

        if(r.right>window.innerWidth){
          menu.style.left=
            Math.max(
              0,
              window.innerWidth-r.width-6
            )+'px';
        }

        if(r.bottom>window.innerHeight){
          menu.style.top=
            Math.max(
              0,
              window.innerHeight-r.height-6
            )+'px';
        }
      }catch(ignoreClamp){}
    },0);

    function finish(verb){
      if(closed)return;
      closed=true;

      try{
        document.removeEventListener(
          'mousedown',
          clickAway,
          true
        );
      }catch(ignoreMouseRemove){}

      try{
        document.removeEventListener(
          'keydown',
          keyDown,
          true
        );
      }catch(ignoreKeyRemove){}

      try{
        if(menu.parentNode){
          menu.parentNode.removeChild(menu);
        }
      }catch(ignoreMenuRemove){}

      resolve(String(verb||''));
    }

    clickAway=function(e){
      if(!menu.contains(e.target)){
        finish('');
      }
    };

    keyDown=function(e){
      if(
        String(e.key||'')==='Escape'
      ){
        finish('');
      }
    };

    window.setTimeout(function(){
      document.addEventListener(
        'mousedown',
        clickAway,
        true
      );

      document.addEventListener(
        'keydown',
        keyDown,
        true
      );
    },0);
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

async function shellCopyRecursive(ctx,source,destination,depth){
  var node=shellResolve(ctx,source),
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
  var node=shellResolve(ctx,path),
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
        .map(shellNormalizePath)
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
  var target=shellNormalizePath(targetPath),
      opt=options||{},
      node=shellResolve(ctx,target),
      effect='none';

  if(
    !SHELL.drag.active||
    !node||
    node.type!=='folder'
  ){
    return{
      accepted:false,
      effect:'none',
      targetPath:target
    };
  }

  if(
    opt.ctrlKey&&
    SHELL.drag.allowedEffects.indexOf('copy')>=0
  ){
    effect='copy';
  }else if(
    SHELL.drag.allowedEffects.indexOf('move')>=0
  ){
    effect='move';
  }else if(
    SHELL.drag.allowedEffects.indexOf('copy')>=0
  ){
    effect='copy';
  }

  return{
    accepted:effect!=='none',
    effect:effect,
    targetPath:target
  };
}

async function shellDrop(ctx,targetPath,options){
  var over=shellDragOver(
        ctx,
        targetPath,
        options
      ),
      result;

  if(!over.accepted){
    SHELL.drag.active=false;

    return{
      ok:false,
      effect:'none',
      completed:0
    };
  }

  result=await shellFileOperation(
    ctx,
    {
      operation:
        over.effect==='copy'
          ?'copy'
          :'move',
      sources:SHELL.drag.paths.slice(),
      destination:over.targetPath
    }
  );

  SHELL.drag.active=false;

  return{
    ok:!!result.ok,
    effect:over.effect,
    completed:result.completed||0,
    targetPath:over.targetPath
  };
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

async function shellDispatch(ctx,method,args){
  args=args||[];

  if(method==='GetShellVersion'){
    return{
      version:SHELL.version,
      model:SHELL.model
    };
  }

  if(method==='SHGetFileAssociation'){
    return shellAssociation(
      args[0]
    );
  }

  if(method==='SHGetFileInfo'){
    return shellInfo(
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

global.jplopsoft_SHELL32=SHELL;
global.jplopsoft_shell32Dispatch=shellDispatch;

})(window);
