/* ExOS Common Controls Host Runtime
 * File: exos_comctl32.js
 * Version: 6.4.0-dev-os69
 * Model: EXOS_COMCTL32_V2
 * Client: V8-only browsers
 *
 * This is an ExOS user-mode emulation of the Win32 Common Controls library.
 * It does not provide the Microsoft binary ABI.
 */
'use strict';

(function(global){
  if(
    global.jplopsoft_EXOS_COMCTL32&&
    global.jplopsoft_EXOS_COMCTL32.ready===true&&
    String(global.jplopsoft_EXOS_COMCTL32.version||'')==='6.4.0-dev-os69'
  ){
    return;
  }

  function jplopsoft_comctlInstallStyles(){
    var id='jplopsoft_exos_comctl32_styles',
        style;

    if(document.getElementById(id))return;

    style=document.createElement('style');
    style.id=id;
    style.type='text/css';
    style.textContent=".jplopsoft_comctl{box-sizing:border-box;font-family:\"Segoe UI\",Arial,sans-serif;color:#111827}\n.jplopsoft_comctl-listview{position:relative;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;border:1px solid #cbd5e1;background:#fff;overflow:hidden;user-select:none}\n.jplopsoft_comctl-lv-header{display:grid;flex:0 0 auto;min-height:28px;background:#f1f5f9;border-bottom:1px solid #cbd5e1;color:#334155;font-size:12px;line-height:27px}\n.jplopsoft_comctl-lv-headercell{position:relative;min-width:0;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-right:1px solid #dbe3ec;cursor:default}\n.jplopsoft_comctl-lv-headercell[data-sortable=\"1\"]{cursor:pointer}\n.jplopsoft_comctl-lv-sortmark{font-size:10px;margin-left:4px;color:#2563eb}\n.jplopsoft_comctl-lv-resizer{position:absolute;right:-3px;top:0;width:7px;height:100%;cursor:col-resize;z-index:4}\n.jplopsoft_comctl-lv-body{position:relative;flex:1;min-height:0;overflow:auto;background:#fff;outline:none}\n.jplopsoft_comctl-lv-row{display:grid;min-height:29px;align-items:center;border-bottom:1px solid #f1f5f9;font-size:12.5px;cursor:default}\n.jplopsoft_comctl-lv-row:hover{background:#f8fbff}\n.jplopsoft_comctl-lv-row[data-selected=\"1\"]{background:#dbeafe;color:#0f172a}\n.jplopsoft_comctl-lv-cell{min-width:0;padding:5px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.jplopsoft_comctl-lv-namecell{display:flex;align-items:center;gap:7px}\n.jplopsoft_comctl-lv-icon{flex:0 0 auto;width:18px;height:18px}\n.jplopsoft_comctl-lv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));align-content:start;gap:8px;padding:9px}\n.jplopsoft_comctl-lv-iconitem{min-height:92px;padding:8px 5px;border:1px solid transparent;border-radius:3px;text-align:center;overflow:hidden;cursor:default}\n.jplopsoft_comctl-lv-iconitem:hover{background:#f3f8ff;border-color:#d9e8fb}\n.jplopsoft_comctl-lv-iconitem[data-selected=\"1\"]{background:#dbeafe;border-color:#60a5fa}\n.jplopsoft_comctl-lv-largeicon{display:block;width:38px;height:38px;margin:2px auto 6px}\n.jplopsoft_comctl-lv-icontext{font-size:12px;line-height:1.25;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}\n.jplopsoft_comctl-lv-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));align-content:start;gap:2px 8px;padding:6px}\n.jplopsoft_comctl-lv-listitem{display:flex;align-items:center;gap:7px;min-width:0;height:28px;padding:0 7px;border:1px solid transparent;cursor:default}\n.jplopsoft_comctl-lv-listitem:hover{background:#f3f8ff}\n.jplopsoft_comctl-lv-listitem[data-selected=\"1\"]{background:#dbeafe;border-color:#93c5fd}\n.jplopsoft_comctl-lv-marquee{position:absolute;display:none;z-index:20;border:1px solid #3b82f6;background:rgba(59,130,246,.12);pointer-events:none}\n.jplopsoft_comctl-treeview{width:100%;height:100%;min-height:0;overflow:auto;border:1px solid #cbd5e1;background:#fff;padding:5px 2px;box-sizing:border-box;user-select:none}\n.jplopsoft_comctl-tv-row{display:flex;align-items:center;height:25px;white-space:nowrap;font-size:12.5px;cursor:default}\n.jplopsoft_comctl-tv-row:hover{background:#f3f8ff}\n.jplopsoft_comctl-tv-row[data-selected=\"1\"]{background:#dbeafe;color:#0f172a}\n.jplopsoft_comctl-tv-toggle{display:inline-flex;align-items:center;justify-content:center;width:18px;height:22px;color:#475569;font-size:10px;flex:0 0 18px}\n.jplopsoft_comctl-tv-toggle[data-clickable=\"1\"]{cursor:pointer}\n.jplopsoft_comctl-tv-icon{width:16px;height:16px;flex:0 0 16px;margin-right:5px}\n.jplopsoft_comctl-tv-text{overflow:hidden;text-overflow:ellipsis;padding-right:6px}\n\n.jplopsoft_comctl-header{display:grid;min-height:28px;background:#f1f5f9;border:1px solid #cbd5e1;overflow:hidden;font-size:12px}\n.jplopsoft_comctl-header-cell{position:relative;min-width:0;padding:5px 8px;border-right:1px solid #dbe3ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.jplopsoft_comctl-header-resizer{position:absolute;right:-3px;top:0;width:7px;height:100%;cursor:col-resize}\n.jplopsoft_comctl-tabs{display:flex;flex-direction:column;min-height:0;border:1px solid #cbd5e1;background:#fff}\n.jplopsoft_comctl-tabbar{display:flex;gap:1px;padding:4px 4px 0;background:#eef2f7;border-bottom:1px solid #cbd5e1}\n.jplopsoft_comctl-tab-button{border:1px solid transparent;border-bottom:0;padding:6px 12px;background:transparent;cursor:pointer}\n.jplopsoft_comctl-tab-button[data-active=\"1\"]{background:#fff;border-color:#cbd5e1;margin-bottom:-1px}\n.jplopsoft_comctl-tabpages{position:relative;flex:1;min-height:0}\n.jplopsoft_comctl-tab-page{box-sizing:border-box;width:100%;height:100%;padding:8px;overflow:auto}\n.jplopsoft_comctl-toolbar{display:flex;align-items:center;gap:3px;min-height:36px;padding:4px 7px;background:#f8fafc;border:0;border-bottom:1px solid #e2e8f0;overflow-x:auto}\n.jplopsoft_comctl-toolbar-button{display:inline-flex;align-items:center;gap:5px;min-height:29px;padding:4px 8px;border:1px solid transparent;border-radius:5px;background:transparent;cursor:pointer;white-space:nowrap}\n.jplopsoft_comctl-toolbar-button:hover{border-color:#dbeafe;background:#eff6ff}\n.jplopsoft_comctl-toolbar-button:disabled{opacity:.45;cursor:default}\n.jplopsoft_comctl-toolbar-button[data-checked=\"1\"]{background:#dbeafe;border-color:#93c5fd}\n.jplopsoft_comctl-toolbar-icon{width:18px;height:18px}\n.jplopsoft_comctl-toolbar-drop{font-size:10px;margin-left:2px}\n.jplopsoft_comctl-toolbar-separator{width:1px;height:22px;background:#cbd5e1;margin:0 3px}\n.jplopsoft_comctl-rebar{display:flex;flex-wrap:wrap;align-items:stretch;gap:2px;padding:2px;border:1px solid #cbd5e1;background:#edf2f7}\n.jplopsoft_comctl-rebar-band{display:flex;align-items:center;min-width:60px;min-height:31px;background:#fff;border:1px solid #d7dee8}\n.jplopsoft_comctl-rebar-gripper{cursor:grab;color:#64748b;padding:0 3px;user-select:none}\n.jplopsoft_comctl-rebar-label{font-size:11px;color:#475569;padding:0 5px}\n.jplopsoft_comctl-rebar-content{display:flex;align-items:center;flex:1;min-width:0;min-height:27px}\n.jplopsoft_comctl-pager{display:flex;align-items:stretch;min-width:0;min-height:0}\n.jplopsoft_comctl-pager[data-orientation=\"vertical\"]{flex-direction:column}\n.jplopsoft_comctl-pager-button{flex:0 0 auto;border:1px solid #cbd5e1;background:#f8fafc;min-width:24px}\n.jplopsoft_comctl-pager-viewport{position:relative;flex:1;min-width:0;min-height:0;overflow:hidden}\n.jplopsoft_comctl-pager-content{display:flex;position:relative;will-change:transform}\n.jplopsoft_comctl-pager[data-orientation=\"vertical\"] .jplopsoft_comctl-pager-content{flex-direction:column}\n.jplopsoft_comctl-statusbar{display:flex;min-height:24px;border:1px solid #cbd5e1;background:#f8fafc;color:#334155;font-size:12px}\n.jplopsoft_comctl-status-part{min-width:0;padding:4px 7px;border-right:1px solid #dbe3ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.jplopsoft_comctl-progress{position:relative;height:18px;border:1px solid #94a3b8;background:#e2e8f0;overflow:hidden}\n.jplopsoft_comctl-progress-fill{height:100%;width:0;background:#22c55e;transition:width .12s linear}\n.jplopsoft_comctl-progress[data-state=\"2\"] .jplopsoft_comctl-progress-fill{background:#ef4444}\n.jplopsoft_comctl-progress[data-state=\"3\"] .jplopsoft_comctl-progress-fill{background:#eab308}\n.jplopsoft_comctl-progress[data-marquee=\"1\"] .jplopsoft_comctl-progress-fill{width:30%!important;animation:jplopsoft-comctl-marquee 1s linear infinite}\n@keyframes jplopsoft-comctl-marquee{0%{transform:translateX(-110%)}100%{transform:translateX(360%)}}\n.jplopsoft_comctl-tooltip-popup{position:fixed;z-index:2147483200;max-width:340px;padding:5px 8px;border:1px solid #94a3b8;border-radius:3px;background:#ffffe1;color:#111827;font:12px \"Segoe UI\",Arial,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.18);pointer-events:none}\n.jplopsoft_comctl-animate{display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}\n.jplopsoft_comctl-animate-image{max-width:100%;max-height:100%;object-fit:contain}\n.jplopsoft_comctl-animate-icon{display:inline-flex;align-items:center;justify-content:center}\n.jplopsoft_comctl-trackbar{display:flex;align-items:center;min-height:28px}\n.jplopsoft_comctl-trackbar-input{width:100%;margin:0}\n.jplopsoft_comctl-updown{display:inline-flex;flex-direction:column;width:22px;border:1px solid #94a3b8}\n.jplopsoft_comctl-updown button{height:14px;padding:0;border:0;background:#f1f5f9;font-size:8px;line-height:12px}\n.jplopsoft_comctl-datetime{display:inline-flex}\n.jplopsoft_comctl-datetime-input{min-height:26px;border:1px solid #94a3b8;padding:2px 5px}\n.jplopsoft_comctl-monthcal{display:flex;flex-direction:column;width:100%;height:100%;min-width:240px;min-height:280px;border:1px solid #94a3b8;background:#fff;padding:8px;box-sizing:border-box;overflow:hidden}\n.jplopsoft_comctl-monthcal-head{display:flex;align-items:center;justify-content:space-between;min-height:38px;margin-bottom:6px}\n.jplopsoft_comctl-monthcal-head button{width:34px;height:30px;border:1px solid transparent;border-radius:4px;background:transparent;font-size:20px;cursor:pointer}.jplopsoft_comctl-monthcal-head button:hover{background:#eff6ff;border-color:#bfdbfe}\n.jplopsoft_comctl-monthcal-title{font-weight:600}\n.jplopsoft_comctl-monthcal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-template-rows:26px repeat(6,minmax(32px,1fr));gap:3px;flex:1;min-height:0;align-items:stretch}\n.jplopsoft_comctl-monthcal-week{display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px;color:#64748b;padding:3px;box-sizing:border-box}\n.jplopsoft_comctl-monthcal-empty{min-height:0}\n.jplopsoft_comctl-monthcal-day{min-width:0;min-height:0;border:1px solid transparent;border-radius:4px;background:#fff;cursor:pointer;font:13px \"Segoe UI\",Arial,sans-serif}\n.jplopsoft_comctl-monthcal-day:hover{background:#eff6ff}\n.jplopsoft_comctl-monthcal-day[data-selected=\"1\"]{background:#2563eb;color:#fff;border-color:#1d4ed8}\n.jplopsoft_comctl-ip{display:inline-flex;align-items:center;border:1px solid #94a3b8;background:#fff;padding:2px 4px}\n.jplopsoft_comctl-ip-field{width:42px;border:0!important;outline:0;text-align:center;padding:2px!important;margin:0!important}\n.jplopsoft_comctl-ip-dot{color:#475569}\n.jplopsoft_comctl-link{font:13px \"Segoe UI\",Arial,sans-serif;line-height:1.5}\n.jplopsoft_comctl-link-anchor{color:#0563c1;text-decoration:underline;cursor:pointer}\n";
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  jplopsoft_comctlInstallStyles();

function jplopsoft_comctlBrowserFiles(e){
  try{return e&&e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length?e.dataTransfer.files:null;}catch(ignore){return null;}
}
function jplopsoft_comctlExternalDrop(ctx,e){
  var files=jplopsoft_comctlBrowserFiles(e),out=[];
  if(!files)return null;
  try{e.__exosXshDropHandled=true;}catch(ignoreMark){}
  try{e.preventDefault();}catch(ignorePrevent){}
  try{e.stopPropagation();}catch(ignoreStop){}
  try{if(e.dataTransfer)e.dataTransfer.dropEffect='copy';}catch(ignoreEffect){}
  if(typeof global.jplopsoft_xshRegisterDroppedFiles!=='function'){
    throw new Error('ExOS browser-drop token bridge is unavailable.');
  }
  out=global.jplopsoft_xshRegisterDroppedFiles(ctx,files,{maxBytes:1024*1024*1024});
  return out;
}
function jplopsoft_comctlExternalDragOver(e){
  if(!jplopsoft_comctlBrowserFiles(e))return false;
  try{e.__exosXshDropHandled=true;}catch(ignoreMark){}
  try{e.preventDefault();}catch(ignorePrevent){}
  try{e.stopPropagation();}catch(ignoreStop){}
  try{if(e.dataTransfer)e.dataTransfer.dropEffect='copy';}catch(ignoreEffect){}
  return true;
}

function jplopsoft_comctlEnsureContext(ctx){
  if(!ctx.commonControls)ctx.commonControls={};
  if(!ctx.imageLists)ctx.imageLists={};
  return ctx;
}

function jplopsoft_comctlState(ctx,id,type){
  jplopsoft_comctlEnsureContext(ctx);
  var s=ctx&&ctx.commonControls
    ?ctx.commonControls[String(id||'')]
    :null;

  if(!s||(
    type&&
    String(s.type)!==String(type)
  )){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Common control not found.'
    );
  }

  return s;
}

function jplopsoft_comctlNotify(ctx,id,code,data){
  jplopsoft_xshSendEvent(
    ctx,
    {
      event:'control',
      controlId:String(id||''),
      action:'notify',
      code:String(code||''),
      data:data||{}
    }
  );
}

function jplopsoft_comctlSafeId(value,prefix,index){
  var s=String(
        value===undefined||value===null
          ?''
          :value
      );

  if(!s){
    s=String(prefix||'item')+'_'+String(index||0);
  }

  return s.substring(0,512);
}

function jplopsoft_comctlListNormalizeColumn(col,index){
  var c=col&&typeof col==='object'?col:{};

  return{
    id:String(c.id||('col'+String(index))),
    text:String(c.text||c.title||''),
    width:Math.max(
      48,
      Math.min(1200,parseInt(c.width,10)||120)
    ),
    minWidth:Math.max(
      32,
      Math.min(600,parseInt(c.minWidth,10)||48)
    ),
    align:
      String(c.align||'left').toLowerCase()==='right'
        ?'right'
        :(
          String(c.align||'left').toLowerCase()==='center'
            ?'center'
            :'left'
        ),
    sortable:c.sortable!==false,
    sortType:
      String(c.sortType||'text').toLowerCase()==='number'
        ?'number'
        :'text'
  };
}

function jplopsoft_comctlListNormalizeItem(item,index,columns){
  var it=item&&typeof item==='object'?item:{},
      subs=Array.isArray(it.subItems)
        ?it.subItems.slice()
        :[],
      sortValues=Array.isArray(it.sortValues)
        ?it.sortValues.slice()
        :[],
      id=jplopsoft_comctlSafeId(it.id,'item',index);

  while(subs.length<Math.max(0,columns.length-1)){
    subs.push('');
  }

  return{
    id:id,
    text:String(
      it.text!==undefined
        ?it.text
        :(it.name!==undefined?it.name:id)
    ),
    subItems:subs.map(function(x){
      return String(
        x===undefined||x===null
          ?''
          :x
      );
    }),
    sortValues:sortValues,
    icon:String(it.icon||'file'),
    imageList:String(it.imageList||''),
    imageIndex:
      typeof it.imageIndex==='number'
        ?parseInt(it.imageIndex,10)
        :-1,
    data:
      it.data&&typeof it.data==='object'
        ?it.data
        :{},
    disabled:!!it.disabled
  };
}

function jplopsoft_comctlListTemplate(state){
  var cols=state.columns,
      out=[],
      i;

  for(i=0;i<cols.length;i++){
    out.push(
      String(
        Math.max(
          cols[i].minWidth,
          cols[i].width
        )
      )+'px'
    );
  }

  return out.join(' ');
}

function jplopsoft_comctlListSelectedArray(state){
  var out=[],k;

  for(k in state.selected){
    if(
      state.selected.hasOwnProperty(k)&&
      state.selected[k]
    ){
      out.push(k);
    }
  }

  return out;
}

function jplopsoft_comctlListItemById(state,id){
  var i,s=String(id||'');

  for(i=0;i<state.items.length;i++){
    if(String(state.items[i].id)===s){
      return state.items[i];
    }
  }

  return null;
}

function jplopsoft_comctlListIndexById(state,id){
  var i,s=String(id||'');

  for(i=0;i<state.items.length;i++){
    if(String(state.items[i].id)===s)return i;
  }

  return -1;
}

function jplopsoft_comctlListVisualItems(state){
  try{
    return Array.prototype.slice.call(
      state.body.querySelectorAll(
        '[data-comctl-lv-item-id]'
      )
    );
  }catch(e){
    return[];
  }
}

function jplopsoft_comctlListApplySelection(state){
  var nodes=jplopsoft_comctlListVisualItems(state),
      i,id;

  for(i=0;i<nodes.length;i++){
    id=String(
      nodes[i].getAttribute(
        'data-comctl-lv-item-id'
      )||''
    );

    nodes[i].setAttribute(
      'data-selected',
      state.selected[id]?'1':'0'
    );
  }
}

function jplopsoft_comctlListNotifySelection(ctx,state,reason){
  var ids=jplopsoft_comctlListSelectedArray(state),
      items=[],
      i,it;

  for(i=0;i<ids.length;i++){
    it=jplopsoft_comctlListItemById(
      state,
      ids[i]
    );

    if(it){
      items.push({
        id:it.id,
        text:it.text,
        subItems:it.subItems.slice(),
        icon:it.icon,
        imageList:it.imageList,
        imageIndex:it.imageIndex,
        data:it.data
      });
    }
  }

  jplopsoft_comctlNotify(
    ctx,
    state.id,
    'LVN_ITEMCHANGED',
    {
      selectedIds:ids,
      items:items,
      focusedId:String(state.focusedId||''),
      reason:String(reason||'selection')
    }
  );
}

function jplopsoft_comctlListSelect(
  ctx,
  state,
  id,
  ctrlKey,
  shiftKey,
  reason
){
  var index=jplopsoft_comctlListIndexById(state,id),
      anchorIndex,i,targetId,
      multi=!state.singleSelect;

  if(index<0)return false;

  if(!multi){
    state.selected={};
    state.selected[String(id)]=1;
    state.anchorId=String(id);
  }else if(shiftKey&&state.anchorId){
    anchorIndex=jplopsoft_comctlListIndexById(
      state,
      state.anchorId
    );

    if(anchorIndex<0)anchorIndex=index;

    if(!ctrlKey)state.selected={};

    for(
      i=Math.min(anchorIndex,index);
      i<=Math.max(anchorIndex,index);
      i++
    ){
      targetId=String(state.items[i].id);
      state.selected[targetId]=1;
    }
  }else if(ctrlKey){
    if(state.selected[String(id)]){
      delete state.selected[String(id)];
    }else{
      state.selected[String(id)]=1;
    }

    state.anchorId=String(id);
  }else{
    state.selected={};
    state.selected[String(id)]=1;
    state.anchorId=String(id);
  }

  state.focusedId=String(id);
  jplopsoft_comctlListApplySelection(state);
  jplopsoft_comctlListNotifySelection(
    ctx,
    state,
    reason||'click'
  );

  return true;
}

function jplopsoft_comctlImageEntry(ctx,imageListId,index){
  var list;

  jplopsoft_comctlEnsureContext(ctx);

  list=ctx.imageLists[String(imageListId||'')];

  if(!list)return null;

  index=parseInt(index,10);

  if(isNaN(index)||index<0||index>=list.images.length){
    return null;
  }

  return list.images[index]||null;
}

function jplopsoft_comctlListIconNode(
  ctx,
  iconName,
  size,
  className,
  imageListId,
  imageIndex
){
  var entry=jplopsoft_comctlImageEntry(
        ctx,
        imageListId,
        imageIndex
      ),
      n,img;

  if(entry&&entry.src){
    img=document.createElement('img');
    img.className=String(
      className||'jplopsoft_comctl-lv-icon'
    );
    img.src=String(entry.src);
    img.alt='';
    img.draggable=false;
    img.style.width=String(parseInt(size,10)||18)+'px';
    img.style.height=String(parseInt(size,10)||18)+'px';
    img.style.objectFit='contain';
    return img;
  }

  n=document.createElement('span');
  n.className=String(
    className||'jplopsoft_comctl-lv-icon'
  );

  iconName=entry&&entry.icon
    ?String(entry.icon)
    :String(iconName||'file');

  if(typeof jplopsoft_shareResResolve==='function'&&jplopsoft_shareResResolve(iconName,'shell32.dll')){
    jplopsoft_svgIconApply(n,iconName,parseInt(size,10)||18);
  }else{
    jplopsoft_svgIconApply(n,'file',parseInt(size,10)||18);
  }

  return n;
}

function jplopsoft_comctlListBindItem(
  ctx,
  state,
  node,
  item
){
  node.setAttribute(
    'data-comctl-lv-item-id',
    String(item.id)
  );

  node.setAttribute(
    'data-selected',
    state.selected[String(item.id)]
      ?'1'
      :'0'
  );

  node.onclick=function(e){
    if(item.disabled)return;

    jplopsoft_comctlListSelect(
      ctx,
      state,
      item.id,
      !!(e&&e.ctrlKey),
      !!(e&&e.shiftKey),
      'click'
    );
  };

  node.ondblclick=function(e){
    if(item.disabled)return;

    jplopsoft_comctlListSelect(
      ctx,
      state,
      item.id,
      !!(e&&e.ctrlKey),
      !!(e&&e.shiftKey),
      'dblclick'
    );

    jplopsoft_comctlNotify(
      ctx,
      state.id,
      'NM_DBLCLK',
      {
        item:{
          id:item.id,
          text:item.text,
          subItems:item.subItems.slice(),
          icon:item.icon,
          imageList:item.imageList,
          imageIndex:item.imageIndex,
          data:item.data
        }
      }
    );

    jplopsoft_comctlNotify(
      ctx,
      state.id,
      'LVN_ITEMACTIVATE',
      {
        item:{
          id:item.id,
          text:item.text,
          subItems:item.subItems.slice(),
          icon:item.icon,
          imageList:item.imageList,
          imageIndex:item.imageIndex,
          data:item.data
        }
      }
    );
  };

  if(state.dragDrop){
    node.draggable=true;
    node.ondragstart=function(e){
      if(!state.selected[String(item.id)]){
        jplopsoft_comctlListSelect(ctx,state,item.id,false,false,'drag');
      }
      try{if(e.dataTransfer){e.dataTransfer.effectAllowed='copyMove';e.dataTransfer.setData('text/plain',String(item.id));}}catch(ignoreDragData){}
      jplopsoft_comctlNotify(ctx,state.id,'LVN_BEGINDRAG',{item:{id:item.id,text:item.text,data:item.data}});
    };
    node.ondragover=function(e){
      if(jplopsoft_comctlExternalDragOver(e))return;
      try{
        e.preventDefault();
        if(e.dataTransfer)e.dataTransfer.dropEffect=e.ctrlKey?'copy':'move';
      }catch(ignoreDragOver){}
      jplopsoft_comctlNotify(ctx,state.id,'LVN_DRAGOVER',{item:{id:item.id,text:item.text,data:item.data},ctrlKey:!!(e&&e.ctrlKey)});
    };
    node.ondrop=function(e){
      var dropped=jplopsoft_comctlExternalDrop(ctx,e);
      if(dropped){
        jplopsoft_comctlNotify(ctx,state.id,'NM_DROP',{item:{id:item.id,text:item.text,data:item.data},ctrlKey:false,externalFiles:dropped,external:true});
        return;
      }
      try{e.preventDefault();e.stopPropagation();}catch(ignoreDrop){}
      jplopsoft_comctlNotify(ctx,state.id,'NM_DROP',{item:{id:item.id,text:item.text,data:item.data},ctrlKey:!!(e&&e.ctrlKey)});
    };
  }

  node.oncontextmenu=function(e){
    try{e.preventDefault();}catch(ignoreCtx){}

    if(!state.selected[String(item.id)]){
      jplopsoft_comctlListSelect(
        ctx,
        state,
        item.id,
        false,
        false,
        'rightclick'
      );
    }

    jplopsoft_comctlNotify(
      ctx,
      state.id,
      'NM_RCLICK',
      {
        item:{
          id:item.id,
          text:item.text,
          subItems:item.subItems.slice(),
          icon:item.icon,
          imageList:item.imageList,
          imageIndex:item.imageIndex,
          data:item.data
        },
        x:e&&typeof e.clientX==='number'?e.clientX:0,
        y:e&&typeof e.clientY==='number'?e.clientY:0
      }
    );

    return false;
  };
}

function jplopsoft_comctlListRenderHeader(ctx,state){
  var header=state.header,
      template=jplopsoft_comctlListTemplate(state),
      i,col,cell,label,resizer,mark;

  while(header.firstChild){
    header.removeChild(header.firstChild);
  }

  header.style.gridTemplateColumns=template;

  for(i=0;i<state.columns.length;i++){
    col=state.columns[i];
    cell=document.createElement('div');
    cell.className='jplopsoft_comctl-lv-headercell';
    cell.setAttribute(
      'data-sortable',
      col.sortable?'1':'0'
    );
    cell.style.textAlign=col.align;

    label=document.createElement('span');
    label.textContent=col.text;
    cell.appendChild(label);

    if(state.sortColumn===i){
      mark=document.createElement('span');
      mark.className='jplopsoft_comctl-lv-sortmark';
      mark.textContent=
        state.sortAscending?'▲':'▼';
      cell.appendChild(mark);
    }

    if(col.sortable){
      (function(columnIndex){
        cell.onclick=function(e){
          if(
            e&&
            e.target&&
            String(e.target.className||'').indexOf(
              'jplopsoft_comctl-lv-resizer'
            )>=0
          ){
            return;
          }

          jplopsoft_comctlNotify(
            ctx,
            state.id,
            'LVN_COLUMNCLICK',
            {
              column:columnIndex,
              columnId:state.columns[columnIndex].id,
              ascending:
                state.sortColumn===columnIndex
                  ?!state.sortAscending
                  :true
            }
          );

          if(state.autoSort){
            jplopsoft_comctlListSort(
              ctx,
              state,
              columnIndex,
              state.sortColumn===columnIndex
                ?!state.sortAscending
                :true
            );
          }
        };
      })(i);
    }

    if(i<state.columns.length-1){
      resizer=document.createElement('span');
      resizer.className='jplopsoft_comctl-lv-resizer';

      (function(columnIndex,resizeNode){
        resizeNode.onmousedown=function(e){
          var startX=e.clientX,
              startWidth=state.columns[columnIndex].width,
              move,up;

          try{e.preventDefault();e.stopPropagation();}catch(ignoreResizeDown){}

          move=function(ev){
            var dx=ev.clientX-startX,
                colObj=state.columns[columnIndex];

            colObj.width=Math.max(
              colObj.minWidth,
              Math.min(1200,startWidth+dx)
            );

            jplopsoft_comctlListApplyColumnTemplate(state);
          };

          up=function(){
            window.removeEventListener('mousemove',move,true);
            window.removeEventListener('mouseup',up,true);

            jplopsoft_comctlNotify(
              ctx,
              state.id,
              'HDN_ENDTRACK',
              {
                column:columnIndex,
                columnId:state.columns[columnIndex].id,
                width:state.columns[columnIndex].width
              }
            );
          };

          window.addEventListener('mousemove',move,true);
          window.addEventListener('mouseup',up,true);
        };
      })(i,resizer);

      cell.appendChild(resizer);
    }

    header.appendChild(cell);
  }
}

function jplopsoft_comctlListApplyColumnTemplate(state){
  var template=jplopsoft_comctlListTemplate(state),
      rows,i;

  if(state.header){
    state.header.style.gridTemplateColumns=template;
  }

  if(!state.body)return;

  try{
    rows=state.body.querySelectorAll(
      '.jplopsoft_comctl-lv-row'
    );
  }catch(e){
    rows=[];
  }

  for(i=0;i<rows.length;i++){
    rows[i].style.gridTemplateColumns=template;
  }
}

function jplopsoft_comctlListRenderDetails(ctx,state){
  var body=state.body,
      template=jplopsoft_comctlListTemplate(state),
      i,item,row,c,cell,nameWrap,icon,text;

  state.header.style.display='grid';
  jplopsoft_comctlListRenderHeader(ctx,state);

  for(i=0;i<state.items.length;i++){
    item=state.items[i];
    row=document.createElement('div');
    row.className='jplopsoft_comctl-lv-row';
    row.style.gridTemplateColumns=template;

    for(c=0;c<state.columns.length;c++){
      cell=document.createElement('div');
      cell.className='jplopsoft_comctl-lv-cell';
      cell.style.textAlign=state.columns[c].align;

      if(c===0){
        nameWrap=document.createElement('div');
        nameWrap.className='jplopsoft_comctl-lv-namecell';

        icon=jplopsoft_comctlListIconNode(
          ctx,
          item.icon,
          18,
          'jplopsoft_comctl-lv-icon',
          item.imageList,
          item.imageIndex
        );

        text=document.createElement('span');
        text.textContent=item.text;

        nameWrap.appendChild(icon);
        nameWrap.appendChild(text);
        cell.appendChild(nameWrap);
      }else{
        cell.textContent=String(
          item.subItems[c-1]||''
        );
      }

      row.appendChild(cell);
    }

    jplopsoft_comctlListBindItem(
      ctx,
      state,
      row,
      item
    );

    body.appendChild(row);
  }
}

function jplopsoft_comctlListRenderIcon(ctx,state,large){
  var body=state.body,
      grid=document.createElement('div'),
      i,item,node,icon,text;

  state.header.style.display='none';

  grid.className=
    large
      ?'jplopsoft_comctl-lv-grid'
      :'jplopsoft_comctl-lv-list';

  for(i=0;i<state.items.length;i++){
    item=state.items[i];
    node=document.createElement('div');

    if(large){
      node.className='jplopsoft_comctl-lv-iconitem';

      icon=jplopsoft_comctlListIconNode(
        ctx,
        item.icon,
        38,
        'jplopsoft_comctl-lv-largeicon',
        item.imageList,
        item.imageIndex
      );
      node.appendChild(icon);

      text=document.createElement('div');
      text.className='jplopsoft_comctl-lv-icontext';
      text.textContent=item.text;
      node.appendChild(text);
    }else{
      node.className='jplopsoft_comctl-lv-listitem';

      icon=jplopsoft_comctlListIconNode(
        ctx,
        item.icon,
        18,
        'jplopsoft_comctl-lv-icon',
        item.imageList,
        item.imageIndex
      );
      node.appendChild(icon);

      text=document.createElement('span');
      text.className='jplopsoft_comctl-lv-icontext';
      text.textContent=item.text;
      node.appendChild(text);
    }

    jplopsoft_comctlListBindItem(
      ctx,
      state,
      node,
      item
    );

    grid.appendChild(node);
  }

  body.appendChild(grid);
}

function jplopsoft_comctlListRender(ctx,state){
  var body=state.body;

  while(body.firstChild){
    body.removeChild(body.firstChild);
  }

  if(state.view===1){
    jplopsoft_comctlListRenderDetails(
      ctx,
      state
    );
  }else if(state.view===0){
    jplopsoft_comctlListRenderIcon(
      ctx,
      state,
      true
    );
  }else{
    jplopsoft_comctlListRenderIcon(
      ctx,
      state,
      false
    );
  }

  /*
   * The marquee belongs to the ListView body but must stay above all
   * rendered items. Re-append it after each view/data rebuild.
   */
  body.appendChild(state.marquee);

  jplopsoft_comctlListApplySelection(state);
}

function jplopsoft_comctlListBeginMarquee(ctx,state,e){
  var target=e&&e.target?e.target:null,
      body=state.body,
      rect,startX,startY,move,up,
      marquee=state.marquee,
      initialSelected={},
      k;

  if(!body||!marquee)return;

  if(
    target&&
    target.closest&&
    target.closest('[data-comctl-lv-item-id]')
  ){
    return;
  }

  if((e&&e.button)!==0)return;

  try{e.preventDefault();}catch(ignoreMarqueeDown){}

  rect=body.getBoundingClientRect();
  startX=e.clientX-rect.left+body.scrollLeft;
  startY=e.clientY-rect.top+body.scrollTop;

  if(e.ctrlKey){
    for(k in state.selected){
      if(state.selected.hasOwnProperty(k)&&state.selected[k]){
        initialSelected[k]=1;
      }
    }
  }else{
    state.selected={};
  }

  marquee.style.display='block';
  marquee.style.left=startX+'px';
  marquee.style.top=startY+'px';
  marquee.style.width='0px';
  marquee.style.height='0px';

  move=function(ev){
    var br=body.getBoundingClientRect(),
        x=ev.clientX-br.left+body.scrollLeft,
        y=ev.clientY-br.top+body.scrollTop,
        left=Math.min(startX,x),
        top=Math.min(startY,y),
        right=Math.max(startX,x),
        bottom=Math.max(startY,y),
        nodes=jplopsoft_comctlListVisualItems(state),
        i,nr,nLeft,nTop,nRight,nBottom,id,
        next={};

    if(ev.ctrlKey){
      for(k in initialSelected){
        if(initialSelected.hasOwnProperty(k)){
          next[k]=1;
        }
      }
    }

    marquee.style.left=left+'px';
    marquee.style.top=top+'px';
    marquee.style.width=Math.max(1,right-left)+'px';
    marquee.style.height=Math.max(1,bottom-top)+'px';

    for(i=0;i<nodes.length;i++){
      nr=nodes[i].getBoundingClientRect();
      nLeft=nr.left-br.left+body.scrollLeft;
      nTop=nr.top-br.top+body.scrollTop;
      nRight=nLeft+nr.width;
      nBottom=nTop+nr.height;

      if(
        nRight>=left&&
        nLeft<=right&&
        nBottom>=top&&
        nTop<=bottom
      ){
        id=String(
          nodes[i].getAttribute(
            'data-comctl-lv-item-id'
          )||''
        );

        if(id)next[id]=1;
      }
    }

    state.selected=next;
    jplopsoft_comctlListApplySelection(state);
  };

  up=function(){
    window.removeEventListener('mousemove',move,true);
    window.removeEventListener('mouseup',up,true);
    marquee.style.display='none';

    jplopsoft_comctlListNotifySelection(
      ctx,
      state,
      'marquee'
    );
  };

  window.addEventListener('mousemove',move,true);
  window.addEventListener('mouseup',up,true);
}

function jplopsoft_comctlCreateListView(ctx,hwnd,spec){
  var client=jplopsoft_GetClientElement(parseInt(hwnd,10)||0),
      s=spec||{},
      id=String(s.id||('listview'+(++ctx.controlSeq))),
      parent,root,header,body,marquee,
      state,cols,i;

  if(!client){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Invalid HWND.'
    );
  }

  if(ctx.controls[id]||ctx.commonControls[id]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_COLLISION,
      'Common control id already exists.'
    );
  }

  parent=jplopsoft_xshControlParent(
    ctx,
    client,
    s.parentId
  );

  root=document.createElement('div');
  root.className=
    'jplopsoft_comctl jplopsoft_comctl-listview';
  root.setAttribute('data-xsh-control-id',id);
  root.setAttribute('data-comctl-class','SysListView32');

  header=document.createElement('div');
  header.className='jplopsoft_comctl-lv-header';
  root.appendChild(header);

  body=document.createElement('div');
  body.className='jplopsoft_comctl-lv-body';
  body.tabIndex=0;
  root.appendChild(body);

  marquee=document.createElement('div');
  marquee.className='jplopsoft_comctl-lv-marquee';
  body.appendChild(marquee);

  cols=Array.isArray(s.columns)&&s.columns.length
    ?s.columns
    :[{id:'name',text:'名稱',width:260}];

  state={
    id:id,
    type:'LISTVIEW',
    hwnd:parseInt(hwnd,10)||0,
    root:root,
    header:header,
    body:body,
    marquee:marquee,
    columns:[],
    items:[],
    selected:{},
    focusedId:'',
    anchorId:'',
    view:
      typeof s.view==='number'
        ?parseInt(s.view,10)
        :1,
    singleSelect:!!s.singleSelect,
    dragDrop:!!s.dragDrop,
    autoSort:s.autoSort!==false,
    sortColumn:-1,
    sortAscending:true
  };

  for(i=0;i<cols.length;i++){
    state.columns.push(
      jplopsoft_comctlListNormalizeColumn(
        cols[i],
        i
      )
    );
  }

  state.items=(Array.isArray(s.items)?s.items:[]).map(
    function(item,index){
      return jplopsoft_comctlListNormalizeItem(
        item,
        index,
        state.columns
      );
    }
  );

  jplopsoft_xshApplySafeStyle(
    root,
    s.style
  );

  /* Browser -> XSH external file drop belongs to the ListView instance,
   * not to jplopsoft_comctlListTemplate().  Keeping it here guarantees
   * root/body/ctx are live and process-scoped for the lifetime of this
   * control. */
  if(state.dragDrop){
    root.setAttribute('data-exos-browser-drop-zone','1');
    body.setAttribute('data-exos-browser-drop-zone','1');

    body.ondragover=function(e){
      if(jplopsoft_comctlExternalDragOver(e))return;
      try{
        e.preventDefault();
        if(e.dataTransfer)e.dataTransfer.dropEffect=e.ctrlKey?'copy':'move';
      }catch(ignoreBodyDragOver){}
    };

    body.ondrop=function(e){
      var dropped=jplopsoft_comctlExternalDrop(ctx,e);

      if(dropped){
        jplopsoft_comctlNotify(
          ctx,
          state.id,
          'NM_DROP',
          {
            item:null,
            ctrlKey:false,
            externalFiles:dropped,
            external:true
          }
        );
        return;
      }

      try{
        e.preventDefault();
        e.stopPropagation();
      }catch(ignoreBodyDrop){}

      jplopsoft_comctlNotify(
        ctx,
        state.id,
        'NM_DROP',
        {
          item:null,
          ctrlKey:!!(e&&e.ctrlKey)
        }
      );
    };
  }

  body.onmousedown=function(e){
    jplopsoft_comctlListBeginMarquee(
      ctx,
      state,
      e||window.event
    );
  };

  body.oncontextmenu=function(e){
    var target=e&&e.target,
        row=target&&target.closest
          ?target.closest('[data-comctl-lv-item-id]')
          :null;

    if(row)return;

    try{e.preventDefault();}catch(ignoreBgContext){}

    jplopsoft_comctlNotify(
      ctx,
      state.id,
      'NM_RCLICK_BACKGROUND',
      {
        x:e&&typeof e.clientX==='number'?e.clientX:0,
        y:e&&typeof e.clientY==='number'?e.clientY:0
      }
    );

    return false;
  };

  body.onkeydown=function(e){
    var ids=state.items.map(function(it){
          return String(it.id);
        }),
        current=ids.indexOf(String(state.focusedId||'')),
        next=-1;

    e=e||window.event;

    jplopsoft_comctlNotify(
      ctx,
      state.id,
      'LVN_KEYDOWN',
      {
        key:String(e.key||''),
        ctrlKey:!!e.ctrlKey,
        shiftKey:!!e.shiftKey,
        altKey:!!e.altKey
      }
    );

    if(
      (
        e.ctrlKey&&
        /^(c|x|v|a)$/i.test(String(e.key||''))
      )||
      /^(Delete|F2|F5)$/i.test(String(e.key||''))||
      (
        e.altKey&&
        /^(ArrowLeft|ArrowRight|ArrowUp)$/i.test(String(e.key||''))
      )
    ){
      try{e.preventDefault();}catch(ignoreShellKeyPrevent){}
    }

    if(e.key==='ArrowDown'){
      next=Math.min(
        ids.length-1,
        current<0?0:current+1
      );
    }else if(e.key==='ArrowUp'){
      next=Math.max(
        0,
        current<0?0:current-1
      );
    }else if(e.key==='Enter'&&current>=0){
      var active=jplopsoft_comctlListItemById(
        state,
        ids[current]
      );

      if(active){
        jplopsoft_comctlNotify(
          ctx,
          state.id,
          'LVN_ITEMACTIVATE',
          {
            item:{
              id:active.id,
              text:active.text,
              subItems:active.subItems.slice(),
              icon:active.icon,
              data:active.data
            }
          }
        );
      }
      return;
    }else{
      return;
    }

    if(next>=0&&ids[next]){
      try{e.preventDefault();}catch(ignoreKeyPrevent){}

      jplopsoft_comctlListSelect(
        ctx,
        state,
        ids[next],
        !!e.ctrlKey,
        !!e.shiftKey,
        'keyboard'
      );

      jplopsoft_comctlListEnsureVisible(
        state,
        ids[next]
      );
    }
  };

  parent.appendChild(root);
  ctx.controls[id]=root;
  ctx.commonControls[id]=state;

  jplopsoft_comctlListRender(
    ctx,
    state
  );

  return id;
}

function jplopsoft_comctlListSetColumns(ctx,id,columns){
  var state=jplopsoft_comctlState(ctx,id,'LISTVIEW'),
      list=Array.isArray(columns)?columns:[],
      i;

  if(!list.length){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'ListView requires at least one column.'
    );
  }

  state.columns=[];

  for(i=0;i<list.length;i++){
    state.columns.push(
      jplopsoft_comctlListNormalizeColumn(
        list[i],
        i
      )
    );
  }

  for(i=0;i<state.items.length;i++){
    state.items[i]=
      jplopsoft_comctlListNormalizeItem(
        state.items[i],
        i,
        state.columns
      );
  }

  jplopsoft_comctlListRender(ctx,state);
  return true;
}

function jplopsoft_comctlListGetColumns(state){
  return state.columns.map(function(c){
    return{
      id:c.id,
      text:c.text,
      width:c.width,
      minWidth:c.minWidth,
      align:c.align,
      sortable:c.sortable,
      sortType:c.sortType
    };
  });
}

function jplopsoft_comctlListSetItems(ctx,id,items){
  var state=jplopsoft_comctlState(ctx,id,'LISTVIEW'),
      list=Array.isArray(items)?items:[],
      i,nextSelected={};

  state.items=[];

  for(i=0;i<list.length;i++){
    state.items.push(
      jplopsoft_comctlListNormalizeItem(
        list[i],
        i,
        state.columns
      )
    );
  }

  for(i=0;i<state.items.length;i++){
    if(state.selected[String(state.items[i].id)]){
      nextSelected[String(state.items[i].id)]=1;
    }
  }

  state.selected=nextSelected;

  if(
    state.focusedId&&
    jplopsoft_comctlListIndexById(
      state,
      state.focusedId
    )<0
  ){
    state.focusedId='';
  }

  jplopsoft_comctlListRender(ctx,state);
  return state.items.length;
}

function jplopsoft_comctlListInsertItem(ctx,id,item,index){
  var state=jplopsoft_comctlState(ctx,id,'LISTVIEW'),
      pos=parseInt(index,10);

  if(isNaN(pos)||pos<0||pos>state.items.length){
    pos=state.items.length;
  }

  state.items.splice(
    pos,
    0,
    jplopsoft_comctlListNormalizeItem(
      item,
      pos,
      state.columns
    )
  );

  jplopsoft_comctlListRender(ctx,state);
  return pos;
}

function jplopsoft_comctlListUpdateItem(ctx,id,itemId,patch){
  var state=jplopsoft_comctlState(ctx,id,'LISTVIEW'),
      index=jplopsoft_comctlListIndexById(state,itemId),
      base,p;

  if(index<0)return false;

  base=state.items[index];
  p=patch&&typeof patch==='object'?patch:{};

  state.items[index]=
    jplopsoft_comctlListNormalizeItem(
      {
        id:base.id,
        text:
          typeof p.text!=='undefined'
            ?p.text
            :base.text,
        subItems:
          typeof p.subItems!=='undefined'
            ?p.subItems
            :base.subItems,
        sortValues:
          typeof p.sortValues!=='undefined'
            ?p.sortValues
            :base.sortValues,
        icon:
          typeof p.icon!=='undefined'
            ?p.icon
            :base.icon,
        data:
          typeof p.data!=='undefined'
            ?p.data
            :base.data,
        disabled:
          typeof p.disabled!=='undefined'
            ?p.disabled
            :base.disabled
      },
      index,
      state.columns
    );

  jplopsoft_comctlListRender(ctx,state);
  return true;
}

function jplopsoft_comctlListDeleteItem(ctx,id,itemId){
  var state=jplopsoft_comctlState(ctx,id,'LISTVIEW'),
      index=jplopsoft_comctlListIndexById(state,itemId);

  if(index<0)return false;

  state.items.splice(index,1);
  delete state.selected[String(itemId)];

  if(String(state.focusedId)===String(itemId)){
    state.focusedId='';
  }

  jplopsoft_comctlListRender(ctx,state);
  return true;
}

function jplopsoft_comctlListSetView(ctx,id,view){
  var state=jplopsoft_comctlState(ctx,id,'LISTVIEW'),
      v=parseInt(view,10);

  if(v!==0&&v!==1&&v!==2&&v!==3){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Unsupported ListView mode.'
    );
  }

  state.view=v;
  jplopsoft_comctlListRender(ctx,state);

  jplopsoft_comctlNotify(
    ctx,
    state.id,
    'LVN_VIEWCHANGED',
    {view:v}
  );

  return true;
}

function jplopsoft_comctlListSort(ctx,state,column,ascending){
  var c=parseInt(column,10),
      asc=ascending!==false,
      col;

  if(c<0||c>=state.columns.length){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_PARAMETER,
      'Invalid ListView sort column.'
    );
  }

  col=state.columns[c];

  state.items.sort(function(a,b){
    var av=
          typeof a.sortValues[c]!=='undefined'
            ?a.sortValues[c]
            :(c===0?a.text:a.subItems[c-1]),
        bv=
          typeof b.sortValues[c]!=='undefined'
            ?b.sortValues[c]
            :(c===0?b.text:b.subItems[c-1]),
        an,bn,cmp;

    if(col.sortType==='number'){
      an=Number(av);
      bn=Number(bv);
      if(isNaN(an))an=0;
      if(isNaN(bn))bn=0;
      cmp=an-bn;
    }else{
      cmp=String(av||'').localeCompare(
        String(bv||''),
        'zh-Hant',
        {
          numeric:true,
          sensitivity:'base'
        }
      );
    }

    return asc?cmp:-cmp;
  });

  state.sortColumn=c;
  state.sortAscending=asc;

  jplopsoft_comctlListRender(ctx,state);
  return true;
}

function jplopsoft_comctlListEnsureVisible(state,itemId){
  var node=null,
      nodes=jplopsoft_comctlListVisualItems(state),
      i;

  for(i=0;i<nodes.length;i++){
    if(
      String(nodes[i].getAttribute(
        'data-comctl-lv-item-id'
      ))===String(itemId)
    ){
      node=nodes[i];
      break;
    }
  }

  if(node&&typeof node.scrollIntoView==='function'){
    try{
      node.scrollIntoView({
        block:'nearest',
        inline:'nearest'
      });
    }catch(e){
      try{
        node.scrollIntoView(false);
      }catch(ignoreEnsure2){}
    }
  }

  return !!node;
}

/* ----------------------------- TreeView ------------------------------- */

function jplopsoft_comctlTreeNormalizeItem(item,index,parentId){
  var it=item&&typeof item==='object'?item:{},
      id=jplopsoft_comctlSafeId(it.id,'tree',index),
      children=Array.isArray(it.children)
        ?it.children
        :[];

  return{
    id:id,
    parentId:String(
      typeof it.parentId!=='undefined'
        ?it.parentId
        :(parentId||'')
    ),
    text:String(
      it.text!==undefined
        ?it.text
        :id
    ),
    icon:String(it.icon||'folder'),
    imageList:String(it.imageList||''),
    imageIndex:
      typeof it.imageIndex==='number'
        ?parseInt(it.imageIndex,10)
        :-1,
    data:
      it.data&&typeof it.data==='object'
        ?it.data
        :{},
    hasChildren:
      typeof it.hasChildren!=='undefined'
        ?!!it.hasChildren
        :children.length>0,
    expanded:!!it.expanded,
    children:children
  };
}

function jplopsoft_comctlTreeFlatten(
  items,
  parentId,
  map,
  childrenMap
){
  var list=Array.isArray(items)?items:[],
      i,node,pid;

  for(i=0;i<list.length;i++){
    node=jplopsoft_comctlTreeNormalizeItem(
      list[i],
      i,
      parentId
    );

    pid=String(node.parentId||'');

    if(map[node.id]){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_OBJECT_NAME_COLLISION,
        'Duplicate TreeView item id.'
      );
    }

    map[node.id]={
      id:node.id,
      parentId:pid,
      text:node.text,
      icon:node.icon,
      imageList:node.imageList,
      imageIndex:node.imageIndex,
      data:node.data,
      hasChildren:node.hasChildren,
      expanded:node.expanded
    };

    if(!childrenMap[pid])childrenMap[pid]=[];
    childrenMap[pid].push(node.id);

    if(node.children.length){
      map[node.id].hasChildren=true;
      jplopsoft_comctlTreeFlatten(
        node.children,
        node.id,
        map,
        childrenMap
      );
    }
  }
}

function jplopsoft_comctlTreeSnapshotItem(state,id){
  var item=state.items[String(id||'')];

  if(!item)return null;

  return{
    id:item.id,
    parentId:item.parentId,
    text:item.text,
    icon:item.icon,
    imageList:item.imageList,
    imageIndex:item.imageIndex,
    data:item.data,
    hasChildren:!!item.hasChildren,
    expanded:!!item.expanded
  };
}

function jplopsoft_comctlTreeSelect(ctx,state,id,reason){
  var item=state.items[String(id||'')],
      rows,i;

  if(!item)return false;

  state.selectedId=item.id;

  try{
    rows=state.root.querySelectorAll(
      '[data-comctl-tv-item-id]'
    );
  }catch(e){
    rows=[];
  }

  for(i=0;i<rows.length;i++){
    rows[i].setAttribute(
      'data-selected',
      String(rows[i].getAttribute(
        'data-comctl-tv-item-id'
      ))===String(item.id)
        ?'1'
        :'0'
    );
  }

  jplopsoft_comctlNotify(
    ctx,
    state.id,
    'TVN_SELCHANGED',
    {
      item:jplopsoft_comctlTreeSnapshotItem(
        state,
        item.id
      ),
      reason:String(reason||'selection')
    }
  );

  return true;
}

function jplopsoft_comctlTreeRenderBranch(
  ctx,
  state,
  parentId,
  depth,
  container
){
  var ids=state.children[String(parentId||'')]||[],
      i,item,row,toggle,icon,text,childWrap;

  for(i=0;i<ids.length;i++){
    item=state.items[ids[i]];

    if(!item)continue;

    row=document.createElement('div');
    row.className='jplopsoft_comctl-tv-row';
    row.style.paddingLeft=
      String(Math.max(0,depth)*16)+'px';

    row.setAttribute(
      'data-comctl-tv-item-id',
      item.id
    );

    row.setAttribute(
      'data-selected',
      String(state.selectedId)===String(item.id)
        ?'1'
        :'0'
    );

    toggle=document.createElement('span');
    toggle.className='jplopsoft_comctl-tv-toggle';

    if(item.hasChildren){
      toggle.textContent=item.expanded?'▼':'▶';
      toggle.setAttribute('data-clickable','1');

      (function(itemId){
        toggle.onclick=function(e){
          try{e.stopPropagation();}catch(ignoreToggle){}

          jplopsoft_comctlTreeExpand(
            ctx,
            state,
            itemId,
            3,
            'toggle'
          );
        };
      })(item.id);
    }else{
      toggle.textContent='';
      toggle.setAttribute('data-clickable','0');
    }

    row.appendChild(toggle);

    icon=jplopsoft_comctlListIconNode(
      ctx,
      item.icon,
      16,
      'jplopsoft_comctl-tv-icon',
      item.imageList,
      item.imageIndex
    );
    row.appendChild(icon);

    text=document.createElement('span');
    text.className='jplopsoft_comctl-tv-text';
    text.textContent=item.text;
    row.appendChild(text);

    if(state.dragDrop){
      (function(itemId){
        row.ondragover=function(e){
          if(jplopsoft_comctlExternalDragOver(e))return;
          try{
            e.preventDefault();
            if(e.dataTransfer)e.dataTransfer.dropEffect=e.ctrlKey?'copy':'move';
          }catch(ignoreTreeDragOver){}
          jplopsoft_comctlNotify(ctx,state.id,'TVN_DRAGOVER',{item:jplopsoft_comctlTreeSnapshotItem(state,itemId),ctrlKey:!!(e&&e.ctrlKey)});
        };
        row.ondrop=function(e){
          var dropped=jplopsoft_comctlExternalDrop(ctx,e);
          if(dropped){
            jplopsoft_comctlNotify(ctx,state.id,'TVN_DROP',{item:jplopsoft_comctlTreeSnapshotItem(state,itemId),ctrlKey:false,externalFiles:dropped,external:true});
            return;
          }
          try{e.preventDefault();e.stopPropagation();}catch(ignoreTreeDrop){}
          jplopsoft_comctlNotify(ctx,state.id,'TVN_DROP',{item:jplopsoft_comctlTreeSnapshotItem(state,itemId),ctrlKey:!!(e&&e.ctrlKey)});
        };
      })(item.id);
    }

    (function(itemId){
      row.onclick=function(){
        jplopsoft_comctlTreeSelect(
          ctx,
          state,
          itemId,
          'click'
        );
      };

      row.oncontextmenu=function(e){
        try{e.preventDefault();e.stopPropagation();}catch(ignoreTreeCtx){}
        if(String(state.selectedId)!==String(itemId)){
          jplopsoft_comctlTreeSelect(ctx,state,itemId,'rightclick');
        }
        jplopsoft_comctlNotify(ctx,state.id,'NM_RCLICK',{
          item:jplopsoft_comctlTreeSnapshotItem(state,itemId),
          x:e&&typeof e.clientX==='number'?e.clientX:0,
          y:e&&typeof e.clientY==='number'?e.clientY:0
        });
        return false;
      };

      row.ondblclick=function(){
        var current=state.items[itemId];

        if(current&&current.hasChildren){
          jplopsoft_comctlTreeExpand(
            ctx,
            state,
            itemId,
            3,
            'dblclick'
          );
        }

        jplopsoft_comctlNotify(
          ctx,
          state.id,
          'NM_DBLCLK',
          {
            item:jplopsoft_comctlTreeSnapshotItem(
              state,
              itemId
            )
          }
        );
      };
    })(item.id);

    container.appendChild(row);

    if(item.expanded){
      childWrap=document.createElement('div');
      container.appendChild(childWrap);

      jplopsoft_comctlTreeRenderBranch(
        ctx,
        state,
        item.id,
        depth+1,
        childWrap
      );
    }
  }
}

function jplopsoft_comctlTreeRender(ctx,state){
  while(state.root.firstChild){
    state.root.removeChild(state.root.firstChild);
  }

  jplopsoft_comctlTreeRenderBranch(
    ctx,
    state,
    '',
    0,
    state.root
  );
}

function jplopsoft_comctlCreateTreeView(ctx,hwnd,spec){
  var client=jplopsoft_GetClientElement(parseInt(hwnd,10)||0),
      s=spec||{},
      id=String(s.id||('treeview'+(++ctx.controlSeq))),
      parent,root,state;

  if(!client){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Invalid HWND.'
    );
  }

  if(ctx.controls[id]||ctx.commonControls[id]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_COLLISION,
      'Common control id already exists.'
    );
  }

  parent=jplopsoft_xshControlParent(
    ctx,
    client,
    s.parentId
  );

  root=document.createElement('div');
  root.className=
    'jplopsoft_comctl jplopsoft_comctl-treeview';
  root.setAttribute('data-xsh-control-id',id);
  root.setAttribute('data-comctl-class','SysTreeView32');

  jplopsoft_xshApplySafeStyle(
    root,
    s.style
  );

  state={
    id:id,
    type:'TREEVIEW',
    hwnd:parseInt(hwnd,10)||0,
    root:root,
    items:{},
    children:{},
    selectedId:'',
    dragDrop:!!s.dragDrop
  };

  if(state.dragDrop){
    root.setAttribute('data-exos-browser-drop-zone','1');
    root.ondragover=function(e){
      if(jplopsoft_comctlExternalDragOver(e))return;
      try{e.preventDefault();}catch(ignoreTreeRootOver){}
    };
    root.ondrop=function(e){
      var dropped=jplopsoft_comctlExternalDrop(ctx,e);
      if(dropped){
        jplopsoft_comctlNotify(ctx,state.id,'TVN_DROP',{item:null,ctrlKey:false,externalFiles:dropped,external:true});
        return;
      }
      try{e.preventDefault();e.stopPropagation();}catch(ignoreTreeRootDrop){}
    };
  }

  jplopsoft_comctlTreeFlatten(
    Array.isArray(s.items)?s.items:[],
    '',
    state.items,
    state.children
  );

  parent.appendChild(root);
  ctx.controls[id]=root;
  ctx.commonControls[id]=state;

  jplopsoft_comctlTreeRender(ctx,state);
  return id;
}

function jplopsoft_comctlTreeSetItems(ctx,id,items){
  var state=jplopsoft_comctlState(ctx,id,'TREEVIEW');

  state.items={};
  state.children={};
  state.selectedId='';

  jplopsoft_comctlTreeFlatten(
    Array.isArray(items)?items:[],
    '',
    state.items,
    state.children
  );

  jplopsoft_comctlTreeRender(ctx,state);
  return true;
}

function jplopsoft_comctlTreeRemoveSubtree(state,id){
  var children=
        state.children[String(id||'')]||[],
      i;

  for(i=0;i<children.length;i++){
    jplopsoft_comctlTreeRemoveSubtree(
      state,
      children[i]
    );
  }

  delete state.children[String(id||'')];
  delete state.items[String(id||'')];

  if(String(state.selectedId)===String(id)){
    state.selectedId='';
  }
}

function jplopsoft_comctlTreeSetChildren(ctx,id,parentId,children){
  var state=jplopsoft_comctlState(ctx,id,'TREEVIEW'),
      pid=String(parentId||''),
      old=state.children[pid]||[],
      i,node;

  if(pid&&!state.items[pid]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'TreeView parent item not found.'
    );
  }

  for(i=0;i<old.length;i++){
    jplopsoft_comctlTreeRemoveSubtree(
      state,
      old[i]
    );
  }

  state.children[pid]=[];

  jplopsoft_comctlTreeFlatten(
    Array.isArray(children)?children:[],
    pid,
    state.items,
    state.children
  );

  if(pid&&state.items[pid]){
    state.items[pid].hasChildren=
      (state.children[pid]||[]).length>0;

    if(!state.items[pid].hasChildren){
      state.items[pid].expanded=false;
    }
  }

  jplopsoft_comctlTreeRender(ctx,state);
  return true;
}

function jplopsoft_comctlTreeInsertItem(ctx,id,item){
  var state=jplopsoft_comctlState(ctx,id,'TREEVIEW'),
      node=jplopsoft_comctlTreeNormalizeItem(
        item,
        Object.keys(state.items).length,
        item&&item.parentId
          ?item.parentId
          :''
      ),
      pid=String(node.parentId||'');

  if(state.items[node.id]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_COLLISION,
      'TreeView item id already exists.'
    );
  }

  if(pid&&!state.items[pid]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'TreeView parent item not found.'
    );
  }

  state.items[node.id]={
    id:node.id,
    parentId:pid,
    text:node.text,
    icon:node.icon,
    data:node.data,
    hasChildren:node.hasChildren,
    expanded:node.expanded
  };

  if(!state.children[pid])state.children[pid]=[];
  state.children[pid].push(node.id);

  if(pid&&state.items[pid]){
    state.items[pid].hasChildren=true;
  }

  jplopsoft_comctlTreeRender(ctx,state);
  return node.id;
}

function jplopsoft_comctlTreeSetItem(ctx,id,itemId,patch){
  var state=jplopsoft_comctlState(ctx,id,'TREEVIEW'),
      item=state.items[String(itemId||'')],
      p=patch&&typeof patch==='object'?patch:{};

  if(!item){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'TreeView item not found.'
    );
  }

  if(typeof p.text!=='undefined')item.text=String(p.text);
  if(typeof p.icon!=='undefined')item.icon=String(p.icon||'folder');
  if(typeof p.imageList!=='undefined')item.imageList=String(p.imageList||'');
  if(typeof p.imageIndex==='number')item.imageIndex=parseInt(p.imageIndex,10);
  if(p.data&&typeof p.data==='object')item.data=p.data;
  if(typeof p.hasChildren!=='undefined')item.hasChildren=!!p.hasChildren;
  if(typeof p.expanded!=='undefined')item.expanded=!!p.expanded;

  jplopsoft_comctlTreeRender(ctx,state);
  return jplopsoft_comctlTreeSnapshotItem(state,item.id);
}

function jplopsoft_comctlTreeDeleteItem(ctx,id,itemId){
  var state=jplopsoft_comctlState(ctx,id,'TREEVIEW'),
      item=state.items[String(itemId||'')],
      siblings,index;

  if(!item)return false;

  siblings=state.children[String(item.parentId||'')]||[];
  index=siblings.indexOf(item.id);

  if(index>=0)siblings.splice(index,1);

  jplopsoft_comctlTreeRemoveSubtree(
    state,
    item.id
  );

  jplopsoft_comctlTreeRender(ctx,state);
  return true;
}

function jplopsoft_comctlTreeExpand(
  ctx,
  state,
  itemId,
  mode,
  reason
){
  var item=state.items[String(itemId||'')],
      requested,
      old;

  if(!item||!item.hasChildren)return false;

  mode=parseInt(mode,10)||3;
  old=!!item.expanded;

  if(mode===1){
    requested=false;
  }else if(mode===2){
    requested=true;
  }else{
    requested=!old;
  }

  jplopsoft_comctlNotify(
    ctx,
    state.id,
    'TVN_ITEMEXPANDING',
    {
      item:jplopsoft_comctlTreeSnapshotItem(
        state,
        item.id
      ),
      expanding:requested,
      reason:String(reason||'api')
    }
  );

  item.expanded=requested;
  jplopsoft_comctlTreeRender(ctx,state);

  jplopsoft_comctlNotify(
    ctx,
    state.id,
    'TVN_ITEMEXPANDED',
    {
      item:jplopsoft_comctlTreeSnapshotItem(
        state,
        item.id
      ),
      expanded:requested
    }
  );

  return true;
}





/* --------------------- Shared Common Control helpers ------------------ */

function jplopsoft_comctlRoot(ctx,hwnd,spec,id,type,className){
  var client=jplopsoft_GetClientElement(parseInt(hwnd,10)||0),
      parent,root;

  jplopsoft_comctlEnsureContext(ctx);

  if(!client){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_INVALID_HANDLE,
      'Invalid HWND.'
    );
  }

  if(ctx.controls[id]||ctx.commonControls[id]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_COLLISION,
      'Common control id already exists.'
    );
  }

  parent=jplopsoft_xshControlParent(
    ctx,
    client,
    spec&&spec.parentId
  );

  root=document.createElement('div');
  root.className='jplopsoft_comctl '+String(spec&&spec.className||'');
  root.setAttribute('data-xsh-control-id',id);
  root.setAttribute('data-comctl-class',className);

  jplopsoft_xshApplySafeStyle(
    root,
    spec&&spec.style
  );

  parent.appendChild(root);
  ctx.controls[id]=root;

  return{
    parent:parent,
    root:root
  };
}

function jplopsoft_comctlDestroy(ctx,id){
  var key=String(id||''),
      state;

  jplopsoft_comctlEnsureContext(ctx);

  state=ctx.commonControls[key];

  if(!state)return false;

  if(state.timer){
    try{window.clearInterval(state.timer);}catch(ignoreTimer){}
    state.timer=0;
  }

  if(state.tools){
    jplopsoft_comctlToolTipDetachAll(state);
  }

  if(
    state.popup&&
    state.popup.parentNode
  ){
    try{
      state.popup.parentNode.removeChild(
        state.popup
      );
    }catch(ignorePopupRemove){}
  }

  try{
    if(state.root&&state.root.parentNode){
      state.root.parentNode.removeChild(state.root);
    }
  }catch(ignoreDestroy){}

  delete ctx.commonControls[key];
  delete ctx.controls[key];

  return true;
}

function jplopsoft_comctlClasses(){
  return[
    'SysListView32',
    'SysTreeView32',
    'SysHeader32',
    'SysTabControl32',
    'ToolbarWindow32',
    'ReBarWindow32',
    'SysPager',
    'msctls_statusbar32',
    'msctls_progress32',
    'tooltips_class32',
    'SysAnimate32',
    'msctls_trackbar32',
    'msctls_updown32',
    'SysDateTimePick32',
    'SysMonthCal32',
    'SysIPAddress32',
    'SysLink'
  ];
}

/* ----------------------------- ImageList ------------------------------ */

function jplopsoft_comctlImageListCreate(ctx,spec){
  var s=spec&&typeof spec==='object'?spec:{},
      id=String(
        s.id||
        ('imagelist'+(++ctx.controlSeq))
      );

  jplopsoft_comctlEnsureContext(ctx);

  if(ctx.imageLists[id]){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_COLLISION,
      'ImageList id already exists.'
    );
  }

  ctx.imageLists[id]={
    id:id,
    width:Math.max(8,Math.min(256,parseInt(s.width,10)||16)),
    height:Math.max(8,Math.min(256,parseInt(s.height,10)||16)),
    flags:Number(s.flags)||0x20,
    images:[]
  };

  return id;
}

function jplopsoft_comctlImageListNormalize(image){
  var it=image&&typeof image==='object'?image:{};

  return{
    icon:String(it.icon||''),
    src:
      /^data:image\//i.test(String(it.src||''))
        ?String(it.src)
        :'',
    data:
      it.data&&typeof it.data==='object'
        ?it.data
        :{}
  };
}

function jplopsoft_comctlImageListAdd(ctx,id,image){
  var list;

  jplopsoft_comctlEnsureContext(ctx);
  list=ctx.imageLists[String(id||'')];

  if(!list){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'ImageList not found.'
    );
  }

  list.images.push(
    jplopsoft_comctlImageListNormalize(image)
  );

  return list.images.length-1;
}

function jplopsoft_comctlImageListReplace(ctx,id,index,image){
  var list;

  jplopsoft_comctlEnsureContext(ctx);
  list=ctx.imageLists[String(id||'')];
  index=parseInt(index,10);

  if(
    !list||
    isNaN(index)||
    index<0||
    index>=list.images.length
  ){
    return false;
  }

  list.images[index]=
    jplopsoft_comctlImageListNormalize(image);

  return true;
}

/* ----------------------------- Header --------------------------------- */

function jplopsoft_comctlHeaderNormalize(item,index){
  var it=item&&typeof item==='object'?item:{};

  return{
    id:String(it.id||('col'+index)),
    text:String(it.text||''),
    width:Math.max(40,Math.min(1200,parseInt(it.width,10)||120)),
    minWidth:Math.max(28,Math.min(600,parseInt(it.minWidth,10)||40)),
    align:
      String(it.align||'left').toLowerCase()==='right'
        ?'right'
        :(
          String(it.align||'left').toLowerCase()==='center'
            ?'center'
            :'left'
        ),
    sortable:it.sortable!==false
  };
}

function jplopsoft_comctlHeaderRender(ctx,state){
  var i,item,cell,label,resizer;

  while(state.root.firstChild){
    state.root.removeChild(state.root.firstChild);
  }

  state.root.style.gridTemplateColumns=
    state.order.map(function(index){
      item=state.items[index];
      return String(
        Math.max(item.minWidth,item.width)
      )+'px';
    }).join(' ');

  for(i=0;i<state.order.length;i++){
    item=state.items[state.order[i]];

    cell=document.createElement('div');
    cell.className='jplopsoft_comctl-header-cell';
    cell.style.textAlign=item.align;

    label=document.createElement('span');
    label.textContent=item.text;
    cell.appendChild(label);

    (function(orderIndex,itemIndex){
      cell.onclick=function(e){
        if(
          e&&e.target&&
          String(e.target.className||'').indexOf(
            'jplopsoft_comctl-header-resizer'
          )>=0
        )return;

        jplopsoft_comctlNotify(
          ctx,
          state.id,
          'HDN_ITEMCLICK',
          {
            index:itemIndex,
            order:orderIndex,
            item:state.items[itemIndex]
          }
        );
      };
    })(i,state.order[i]);

    if(i<state.order.length-1){
      resizer=document.createElement('span');
      resizer.className='jplopsoft_comctl-header-resizer';

      (function(itemIndex,node){
        node.onmousedown=function(e){
          var startX=e.clientX,
              startWidth=state.items[itemIndex].width,
              move,up;

          try{
            e.preventDefault();
            e.stopPropagation();
          }catch(ignoreDown){}

          move=function(ev){
            var col=state.items[itemIndex];

            col.width=Math.max(
              col.minWidth,
              Math.min(
                1200,
                startWidth+(ev.clientX-startX)
              )
            );

            jplopsoft_comctlHeaderRender(ctx,state);
          };

          up=function(){
            window.removeEventListener('mousemove',move,true);
            window.removeEventListener('mouseup',up,true);

            jplopsoft_comctlNotify(
              ctx,
              state.id,
              'HDN_ENDTRACK',
              {
                index:itemIndex,
                width:state.items[itemIndex].width
              }
            );
          };

          window.addEventListener('mousemove',move,true);
          window.addEventListener('mouseup',up,true);
        };
      })(state.order[i],resizer);

      cell.appendChild(resizer);
    }

    state.root.appendChild(cell);
  }
}

function jplopsoft_comctlCreateHeader(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('header'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'HEADER','SysHeader32'
      ),
      state,i;

  host.root.className+=' jplopsoft_comctl-header';

  state={
    id:id,
    type:'HEADER',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    items:[],
    order:[]
  };

  (Array.isArray(s.items)?s.items:[]).forEach(
    function(it,index){
      state.items.push(
        jplopsoft_comctlHeaderNormalize(it,index)
      );
      state.order.push(index);
    }
  );

  ctx.commonControls[id]=state;
  jplopsoft_comctlHeaderRender(ctx,state);

  return id;
}

/* --------------------------- TabControl ------------------------------- */

function jplopsoft_comctlTabNormalize(tab,index){
  var t=tab&&typeof tab==='object'?tab:{};

  return{
    id:String(t.id||('tab'+index)),
    text:String(t.text||t.title||('Tab '+(index+1))),
    icon:String(t.icon||''),
    data:t.data&&typeof t.data==='object'?t.data:{},
    disabled:!!t.disabled
  };
}

function jplopsoft_comctlTabPageId(state,tabId){
  return state.id+'__page_'+String(tabId||'');
}

function jplopsoft_comctlTabRender(ctx,state){
  var i,tab,button,page,pageId,
      validPages={},
      childIndex,child,childId;

  while(state.bar.firstChild){
    state.bar.removeChild(state.bar.firstChild);
  }

  for(i=0;i<state.tabs.length;i++){
    tab=state.tabs[i];

    button=document.createElement('button');
    button.type='button';
    button.className='jplopsoft_comctl-tab-button';
    button.textContent=tab.text;
    button.disabled=!!tab.disabled;
    button.setAttribute(
      'data-active',
      i===state.current?'1':'0'
    );

    (function(index){
      button.onclick=function(){
        jplopsoft_comctlTabSetCurrent(
          ctx,state,index,'click'
        );
      };
    })(i);

    state.bar.appendChild(button);

    pageId=jplopsoft_comctlTabPageId(
      state,
      tab.id
    );
    validPages[pageId]=1;

    page=ctx.controls[pageId];

    if(
      !page||
      page.parentNode!==state.pages
    ){
      page=document.createElement('div');
      page.className='jplopsoft_comctl-tab-page';
      page.setAttribute(
        'data-comctl-tab-page-id',
        pageId
      );
      state.pages.appendChild(page);
      ctx.controls[pageId]=page;
    }

    page.setAttribute(
      'data-active',
      i===state.current?'1':'0'
    );
    page.style.display=
      i===state.current?'block':'none';
  }

  /*
   * Remove only page hosts for tabs that no longer exist.
   * Existing page hosts are kept in-place so child XSH controls survive
   * TabCtrl_SetCurSel and ordinary tab repainting.
   */
  childIndex=state.pages.children.length-1;

  while(childIndex>=0){
    child=state.pages.children[childIndex];
    childId=child&&child.getAttribute
      ?String(
        child.getAttribute(
          'data-comctl-tab-page-id'
        )||''
      )
      :'';

    if(childId&&!validPages[childId]){
      try{
        state.pages.removeChild(child);
      }catch(ignorePageRemove){}

      if(ctx.controls[childId]===child){
        delete ctx.controls[childId];
      }
    }

    childIndex--;
  }
}

function jplopsoft_comctlTabSetCurrent(ctx,state,index,reason){
  var old=state.current;

  index=parseInt(index,10);

  if(
    isNaN(index)||
    index<0||
    index>=state.tabs.length||
    state.tabs[index].disabled
  ){
    return -1;
  }

  state.current=index;
  jplopsoft_comctlTabRender(ctx,state);

  if(old!==index){
    jplopsoft_comctlNotify(
      ctx,
      state.id,
      'TCN_SELCHANGE',
      {
        oldIndex:old,
        newIndex:index,
        tab:state.tabs[index],
        reason:String(reason||'api')
      }
    );
  }

  return old;
}

function jplopsoft_comctlCreateTabControl(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('tabs'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'TAB','SysTabControl32'
      ),
      bar=document.createElement('div'),
      pages=document.createElement('div'),
      state;

  host.root.className+=' jplopsoft_comctl-tabs';

  bar.className='jplopsoft_comctl-tabbar';
  pages.className='jplopsoft_comctl-tabpages';

  host.root.appendChild(bar);
  host.root.appendChild(pages);

  state={
    id:id,
    type:'TAB',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    bar:bar,
    pages:pages,
    tabs:(Array.isArray(s.items)?s.items:[]).map(
      jplopsoft_comctlTabNormalize
    ),
    current:Math.max(
      0,
      Math.min(
        (Array.isArray(s.items)?s.items:[]).length-1,
        parseInt(s.current,10)||0
      )
    )
  };

  ctx.commonControls[id]=state;
  jplopsoft_comctlTabRender(ctx,state);

  return id;
}

/* ----------------------------- Toolbar -------------------------------- */

function jplopsoft_comctlToolbarNormalize(btn,index){
  var b=btn&&typeof btn==='object'?btn:{};

  return{
    id:String(b.id||('button'+index)),
    text:String(b.text||''),
    title:String(b.title||b.text||''),
    icon:String(b.icon||''),
    imageList:String(b.imageList||''),
    imageIndex:
      typeof b.imageIndex==='number'
        ?parseInt(b.imageIndex,10)
        :-1,
    separator:!!b.separator,
    dropdown:!!b.dropdown,
    checkable:!!b.checkable,
    checked:!!b.checked,
    enabled:b.enabled!==false,
    group:String(b.group||''),
    data:b.data&&typeof b.data==='object'?b.data:{}
  };
}

function jplopsoft_comctlToolbarRender(ctx,state){
  var i,b,node,icon,label,drop;

  while(state.root.firstChild)state.root.removeChild(state.root.firstChild);

  for(i=0;i<state.buttons.length;i++){
    b=state.buttons[i];

    if(b.separator){
      node=document.createElement('span');
      node.className='jplopsoft_comctl-toolbar-separator';
      state.root.appendChild(node);
      continue;
    }

    node=document.createElement('button');
    node.type='button';
    node.className='jplopsoft_comctl-toolbar-button';
    node.disabled=!b.enabled;
    node.title=String(b.title||b.text||'');
    node.setAttribute('data-checked',b.checked?'1':'0');

    if(b.icon||b.imageList){
      icon=jplopsoft_comctlListIconNode(
        ctx,
        b.icon,
        18,
        'jplopsoft_comctl-toolbar-icon',
        b.imageList,
        b.imageIndex
      );
      node.appendChild(icon);
    }

    label=document.createElement('span');
    label.textContent=b.text;
    node.appendChild(label);

    if(b.dropdown){
      drop=document.createElement('span');
      drop.className='jplopsoft_comctl-toolbar-drop';
      drop.textContent='▾';
      node.appendChild(drop);
    }

    (function(button,index){
      node.onclick=function(e){
        if(!button.enabled)return;

        if(button.checkable){
          if(button.group){
            state.buttons.forEach(function(other){
              if(other.group===button.group)other.checked=(other===button);
            });
          }else{
            button.checked=!button.checked;
          }
          jplopsoft_comctlToolbarRender(ctx,state);
        }

        jplopsoft_comctlNotify(
          ctx,
          state.id,
          'TBN_CLICK',
          {
            index:index,
            button:button
          }
        );
      };

      if(button.dropdown){
        node.oncontextmenu=function(e){
          try{e.preventDefault();}catch(ignoreCtx){}

          jplopsoft_comctlNotify(
            ctx,
            state.id,
            'TBN_DROPDOWN',
            {
              index:index,
              button:button,
              x:e&&typeof e.clientX==='number'?e.clientX:0,
              y:e&&typeof e.clientY==='number'?e.clientY:0
            }
          );

          return false;
        };
      }
    })(b,i);

    state.root.appendChild(node);
  }
}

function jplopsoft_comctlCreateToolbar(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('toolbar'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'TOOLBAR','ToolbarWindow32'
      ),
      state;

  host.root.className+=' jplopsoft_comctl-toolbar';

  state={
    id:id,
    type:'TOOLBAR',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    buttons:(Array.isArray(s.buttons)?s.buttons:[]).map(
      jplopsoft_comctlToolbarNormalize
    )
  };

  ctx.commonControls[id]=state;
  jplopsoft_comctlToolbarRender(ctx,state);

  return id;
}

/* ------------------------------ ReBar --------------------------------- */

function jplopsoft_comctlRebarNormalize(band,index){
  var b=band&&typeof band==='object'?band:{};

  return{
    id:String(b.id||('band'+index)),
    text:String(b.text||''),
    width:Math.max(60,parseInt(b.width,10)||180),
    breakLine:!!b.breakLine,
    data:b.data&&typeof b.data==='object'?b.data:{}
  };
}

function jplopsoft_comctlRebarParentId(state,bandId){
  return state.id+'__band_'+String(bandId||'');
}

function jplopsoft_comctlRebarRender(ctx,state){
  var i,b,rec,band,gripper,label,content,parentId,
      valid={},
      key;

  if(!state.bandNodes)state.bandNodes={};

  for(i=0;i<state.bands.length;i++){
    b=state.bands[i];
    valid[b.id]=1;
    rec=state.bandNodes[b.id];

    if(!rec){
      band=document.createElement('div');
      band.className='jplopsoft_comctl-rebar-band';

      gripper=document.createElement('span');
      gripper.className='jplopsoft_comctl-rebar-gripper';
      gripper.textContent='⋮';
      band.appendChild(gripper);

      label=document.createElement('span');
      label.className='jplopsoft_comctl-rebar-label';
      band.appendChild(label);

      content=document.createElement('div');
      content.className='jplopsoft_comctl-rebar-content';
      content.setAttribute(
        'data-rebar-band-id',
        b.id
      );
      band.appendChild(content);

      rec={
        band:band,
        gripper:gripper,
        label:label,
        content:content
      };

      state.bandNodes[b.id]=rec;

      (function(bandId,handle){
        handle.onmousedown=function(e){
          var startX=e.clientX,
              moved=false,
              move,up;

          try{e.preventDefault();}catch(ignoreDown){}

          move=function(ev){
            if(Math.abs(ev.clientX-startX)>30){
              moved=true;
            }
          };

          up=function(ev){
            var index,target,dir,tmp;

            window.removeEventListener(
              'mousemove',
              move,
              true
            );
            window.removeEventListener(
              'mouseup',
              up,
              true
            );

            if(!moved)return;

            index=state.bands.findIndex(
              function(x){
                return x.id===bandId;
              }
            );

            if(index<0)return;

            dir=ev.clientX<startX?-1:1;
            target=index+dir;

            if(
              target<0||
              target>=state.bands.length
            )return;

            tmp=state.bands[index];
            state.bands[index]=state.bands[target];
            state.bands[target]=tmp;

            jplopsoft_comctlRebarRender(
              ctx,
              state
            );

            jplopsoft_comctlNotify(
              ctx,
              state.id,
              'RBN_LAYOUTCHANGED',
              {
                from:index,
                to:target
              }
            );
          };

          window.addEventListener(
            'mousemove',
            move,
            true
          );
          window.addEventListener(
            'mouseup',
            up,
            true
          );
        };
      })(b.id,gripper);
    }

    rec.band.style.flexBasis=
      String(b.width)+'px';

    rec.band.style.flexBreak=
      b.breakLine?'after':'';

    rec.label.textContent=b.text;
    rec.label.style.display=
      b.text?'inline':'none';

    parentId=
      jplopsoft_comctlRebarParentId(
        state,
        b.id
      );

    ctx.controls[parentId]=rec.content;

    /*
     * appendChild() moves an existing band without destroying its child
     * controls. This models ReBar band reordering without invalidating the
     * embedded Toolbar/Address controls.
     */
    state.root.appendChild(rec.band);
  }

  for(key in state.bandNodes){
    if(
      !state.bandNodes.hasOwnProperty(key)||
      valid[key]
    )continue;

    rec=state.bandNodes[key];

    try{
      if(rec.band.parentNode){
        rec.band.parentNode.removeChild(
          rec.band
        );
      }
    }catch(ignoreBandRemove){}

    parentId=
      jplopsoft_comctlRebarParentId(
        state,
        key
      );

    if(ctx.controls[parentId]===rec.content){
      delete ctx.controls[parentId];
    }

    delete state.bandNodes[key];
  }
}

function jplopsoft_comctlCreateReBar(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('rebar'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'REBAR','ReBarWindow32'
      ),
      state;

  host.root.className+=' jplopsoft_comctl-rebar';

  state={
    id:id,
    type:'REBAR',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    bands:(Array.isArray(s.bands)?s.bands:[]).map(
      jplopsoft_comctlRebarNormalize
    ),
    bandNodes:{}
  };

  ctx.commonControls[id]=state;
  jplopsoft_comctlRebarRender(ctx,state);

  return id;
}

/* ------------------------------- Pager -------------------------------- */

function jplopsoft_comctlPagerUpdate(state){
  var max=Math.max(
        0,
        state.orientation==='vertical'
          ?state.content.scrollHeight-state.viewport.clientHeight
          :state.content.scrollWidth-state.viewport.clientWidth
      );

  state.pos=Math.max(0,Math.min(max,state.pos));

  if(state.orientation==='vertical'){
    state.content.style.transform=
      'translateY('+String(-state.pos)+'px)';
  }else{
    state.content.style.transform=
      'translateX('+String(-state.pos)+'px)';
  }

  state.prev.disabled=state.pos<=0;
  state.next.disabled=state.pos>=max;
}

function jplopsoft_comctlCreatePager(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('pager'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'PAGER','SysPager'
      ),
      prev=document.createElement('button'),
      viewport=document.createElement('div'),
      content=document.createElement('div'),
      next=document.createElement('button'),
      state,
      contentId=id+'__content';

  host.root.className+=' jplopsoft_comctl-pager';

  prev.type='button';
  prev.className='jplopsoft_comctl-pager-button';
  prev.textContent='◀';

  viewport.className='jplopsoft_comctl-pager-viewport';
  content.className='jplopsoft_comctl-pager-content';

  next.type='button';
  next.className='jplopsoft_comctl-pager-button';
  next.textContent='▶';

  viewport.appendChild(content);
  host.root.appendChild(prev);
  host.root.appendChild(viewport);
  host.root.appendChild(next);

  state={
    id:id,
    type:'PAGER',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    prev:prev,
    next:next,
    viewport:viewport,
    content:content,
    contentId:contentId,
    orientation:
      String(s.orientation||'horizontal').toLowerCase()==='vertical'
        ?'vertical'
        :'horizontal',
    pos:Math.max(0,parseInt(s.pos,10)||0),
    buttonSize:Math.max(8,parseInt(s.buttonSize,10)||32)
  };

  if(state.orientation==='vertical'){
    host.root.setAttribute('data-orientation','vertical');
    prev.textContent='▲';
    next.textContent='▼';
  }

  ctx.controls[contentId]=content;
  ctx.commonControls[id]=state;

  prev.onclick=function(){
    state.pos=Math.max(0,state.pos-state.buttonSize);
    jplopsoft_comctlPagerUpdate(state);

    jplopsoft_comctlNotify(
      ctx,id,'PGN_SCROLL',{pos:state.pos,direction:-1}
    );
  };

  next.onclick=function(){
    state.pos+=state.buttonSize;
    jplopsoft_comctlPagerUpdate(state);

    jplopsoft_comctlNotify(
      ctx,id,'PGN_SCROLL',{pos:state.pos,direction:1}
    );
  };

  window.setTimeout(function(){
    jplopsoft_comctlPagerUpdate(state);
  },0);

  return id;
}

/* ----------------------------- StatusBar ------------------------------- */

function jplopsoft_comctlStatusRender(state){
  var i,part,node;

  while(state.root.firstChild)state.root.removeChild(state.root.firstChild);

  for(i=0;i<state.parts.length;i++){
    part=state.parts[i];
    node=document.createElement('div');
    node.className='jplopsoft_comctl-status-part';
    node.textContent=String(part.text||'');

    if(part.width>0){
      node.style.flex='0 0 '+String(part.width)+'px';
    }else{
      node.style.flex='1 1 0';
    }

    state.root.appendChild(node);
  }
}

function jplopsoft_comctlCreateStatusBar(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('statusbar'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'STATUSBAR','msctls_statusbar32'
      ),
      state;

  host.root.className+=' jplopsoft_comctl-statusbar';

  state={
    id:id,
    type:'STATUSBAR',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    parts:(Array.isArray(s.parts)?s.parts:[{text:''}]).map(
      function(p){
        p=p&&typeof p==='object'?p:{text:p};
        return{
          text:String(p.text||''),
          width:Math.max(0,parseInt(p.width,10)||0)
        };
      }
    )
  };

  ctx.commonControls[id]=state;
  jplopsoft_comctlStatusRender(state);
  return id;
}

/* ---------------------------- ProgressBar ------------------------------ */

function jplopsoft_comctlProgressRender(state){
  var span=Math.max(1,state.max-state.min),
      pct=Math.max(
        0,
        Math.min(100,((state.pos-state.min)/span)*100)
      );

  state.fill.style.width=String(pct)+'%';
  state.root.setAttribute('data-state',String(state.state));
  state.root.setAttribute(
    'data-marquee',
    state.marquee?'1':'0'
  );
  state.root.setAttribute(
    'aria-valuemin',
    String(state.min)
  );
  state.root.setAttribute(
    'aria-valuemax',
    String(state.max)
  );
  state.root.setAttribute(
    'aria-valuenow',
    String(state.pos)
  );
}

function jplopsoft_comctlCreateProgressBar(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('progress'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'PROGRESS','msctls_progress32'
      ),
      fill=document.createElement('div'),
      state;

  host.root.className+=' jplopsoft_comctl-progress';
  host.root.setAttribute('role','progressbar');

  fill.className='jplopsoft_comctl-progress-fill';
  host.root.appendChild(fill);

  state={
    id:id,
    type:'PROGRESS',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    fill:fill,
    min:Number(s.min)||0,
    max:
      typeof s.max==='number'
        ?Number(s.max)
        :100,
    pos:Number(s.pos)||0,
    step:Number(s.step)||10,
    state:parseInt(s.state,10)||1,
    marquee:!!s.marquee
  };

  if(state.max<=state.min)state.max=state.min+100;
  state.pos=Math.max(state.min,Math.min(state.max,state.pos));

  ctx.commonControls[id]=state;
  jplopsoft_comctlProgressRender(state);

  return id;
}

/* ------------------------------- ToolTip ------------------------------- */

function jplopsoft_comctlToolTipDetachAll(state){
  var k,tool,node;

  if(!state||!state.tools)return;

  for(k in state.tools){
    if(!state.tools.hasOwnProperty(k))continue;

    tool=state.tools[k];
    node=tool.node;

    if(node){
      try{
        node.removeEventListener('mouseenter',tool.enter,false);
        node.removeEventListener('mouseleave',tool.leave,false);
      }catch(ignoreDetach){}
    }
  }

  state.tools={};
}

function jplopsoft_comctlToolTipHide(state){
  if(state.showTimer){
    window.clearTimeout(state.showTimer);
    state.showTimer=0;
  }

  state.popup.style.display='none';
}

function jplopsoft_comctlToolTipAdd(ctx,state,tool){
  var t=tool&&typeof tool==='object'?tool:{},
      targetId=String(t.controlId||''),
      node=ctx.controls[targetId],
      key=String(t.id||targetId),
      rec;

  if(!node){
    throw jplopsoft_xshError(
      jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,
      'Tooltip target control not found.'
    );
  }

  rec={
    id:key,
    node:node,
    text:String(t.text||''),
    enter:null,
    leave:null
  };

  rec.enter=function(e){
    if(!state.active)return;

    if(state.showTimer){
      window.clearTimeout(state.showTimer);
    }

    state.showTimer=window.setTimeout(function(){
      var r=node.getBoundingClientRect();

      state.popup.textContent=rec.text;
      state.popup.style.left=
        String(Math.round(r.left))+'px';
      state.popup.style.top=
        String(Math.round(r.bottom+5))+'px';
      state.popup.style.display='block';
    },state.delay);
  };

  rec.leave=function(){
    jplopsoft_comctlToolTipHide(state);
  };

  node.addEventListener('mouseenter',rec.enter,false);
  node.addEventListener('mouseleave',rec.leave,false);

  state.tools[key]=rec;
  return key;
}

function jplopsoft_comctlCreateToolTip(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('tooltip'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'TOOLTIP','tooltips_class32'
      ),
      popup=document.createElement('div'),
      state;

  host.root.style.display='none';

  popup.className='jplopsoft_comctl-tooltip-popup';
  popup.style.display='none';
  document.body.appendChild(popup);

  state={
    id:id,
    type:'TOOLTIP',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    popup:popup,
    tools:{},
    active:s.active!==false,
    delay:Math.max(0,parseInt(s.delay,10)||700),
    showTimer:0
  };

  ctx.commonControls[id]=state;

  (Array.isArray(s.tools)?s.tools:[]).forEach(
    function(t){
      jplopsoft_comctlToolTipAdd(ctx,state,t);
    }
  );

  return id;
}

/* ------------------------------- Animate ------------------------------- */

function jplopsoft_comctlAnimateFrame(ctx,state,index){
  var frame;

  if(!state.frames.length){
    state.image.style.display='none';
    state.icon.style.display='none';
    return false;
  }

  index=Math.max(0,Math.min(state.frames.length-1,index));
  state.index=index;
  frame=state.frames[index];

  if(frame.src){
    state.image.src=frame.src;
    state.image.style.display='block';
    state.icon.style.display='none';
  }else{
    state.image.style.display='none';
    state.icon.style.display='block';
    jplopsoft_svgIconApply(
      state.icon,
      frame.icon||'file',
      frame.size||48
    );
  }

  return true;
}

function jplopsoft_comctlAnimateStop(state){
  if(state.timer){
    window.clearInterval(state.timer);
    state.timer=0;
  }
  state.playing=false;
}

function jplopsoft_comctlCreateAnimate(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('animate'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'ANIMATE','SysAnimate32'
      ),
      image=document.createElement('img'),
      icon=document.createElement('span'),
      state;

  host.root.className+=' jplopsoft_comctl-animate';

  image.className='jplopsoft_comctl-animate-image';
  image.alt='';
  image.draggable=false;

  icon.className='jplopsoft_comctl-animate-icon';

  host.root.appendChild(image);
  host.root.appendChild(icon);

  state={
    id:id,
    type:'ANIMATE',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    image:image,
    icon:icon,
    frames:[],
    index:0,
    interval:Math.max(50,parseInt(s.interval,10)||250),
    timer:0,
    playing:false,
    loop:s.loop!==false
  };

  ctx.commonControls[id]=state;
  return id;
}

/* ------------------------------- Trackbar ------------------------------ */

function jplopsoft_comctlCreateTrackbar(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('trackbar'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'TRACKBAR','msctls_trackbar32'
      ),
      input=document.createElement('input'),
      state;

  host.root.className+=' jplopsoft_comctl-trackbar';

  input.type='range';
  input.className='jplopsoft_comctl-trackbar-input';

  state={
    id:id,
    type:'TRACKBAR',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    input:input,
    min:Number(s.min)||0,
    max:
      typeof s.max==='number'?Number(s.max):100,
    pos:Number(s.pos)||0,
    ticFreq:Math.max(1,Number(s.ticFreq)||1)
  };

  input.min=String(state.min);
  input.max=String(state.max);
  input.step=String(state.ticFreq);
  input.value=String(
    Math.max(state.min,Math.min(state.max,state.pos))
  );

  input.oninput=function(){
    state.pos=Number(input.value);

    jplopsoft_comctlNotify(
      ctx,id,'TB_THUMBTRACK',{pos:state.pos}
    );
  };

  input.onchange=function(){
    state.pos=Number(input.value);

    jplopsoft_comctlNotify(
      ctx,id,'TB_ENDTRACK',{pos:state.pos}
    );
  };

  host.root.appendChild(input);
  ctx.commonControls[id]=state;

  return id;
}

/* -------------------------------- UpDown ------------------------------- */

function jplopsoft_comctlUpDownSync(ctx,state){
  var buddy;

  state.pos=Math.max(
    state.min,
    Math.min(state.max,state.pos)
  );

  if(state.buddyId){
    buddy=ctx.controls[state.buddyId];

    if(buddy){
      try{
        buddy.value=String(state.pos);
      }catch(ignoreBuddy){}
    }
  }
}

function jplopsoft_comctlCreateUpDown(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('updown'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'UPDOWN','msctls_updown32'
      ),
      up=document.createElement('button'),
      down=document.createElement('button'),
      state;

  host.root.className+=' jplopsoft_comctl-updown';

  up.type='button';
  up.textContent='▲';
  down.type='button';
  down.textContent='▼';

  host.root.appendChild(up);
  host.root.appendChild(down);

  state={
    id:id,
    type:'UPDOWN',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    up:up,
    down:down,
    min:Number(s.min)||0,
    max:
      typeof s.max==='number'?Number(s.max):100,
    pos:Number(s.pos)||0,
    step:Math.max(0.000001,Number(s.step)||1),
    buddyId:String(s.buddyId||'')
  };

  function delta(amount){
    var old=state.pos,
        proposed=state.pos+amount;

    proposed=Math.max(
      state.min,
      Math.min(state.max,proposed)
    );

    jplopsoft_comctlNotify(
      ctx,id,'UDN_DELTAPOS',
      {
        oldPos:old,
        delta:proposed-old,
        newPos:proposed
      }
    );

    state.pos=proposed;
    jplopsoft_comctlUpDownSync(ctx,state);
  }

  up.onclick=function(){delta(state.step);};
  down.onclick=function(){delta(-state.step);};

  ctx.commonControls[id]=state;
  jplopsoft_comctlUpDownSync(ctx,state);

  return id;
}

/* --------------------------- DateTimePicker ---------------------------- */

function jplopsoft_comctlCreateDateTimePicker(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('datetime'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'DATETIME','SysDateTimePick32'
      ),
      input=document.createElement('input'),
      state,
      mode=String(s.mode||'date').toLowerCase();

  host.root.className+=' jplopsoft_comctl-datetime';

  input.type=
    mode==='time'
      ?'time'
      :(
        mode==='datetime'
          ?'datetime-local'
          :'date'
      );

  input.className='jplopsoft_comctl-datetime-input';
  input.value=String(s.value||'');

  host.root.appendChild(input);

  state={
    id:id,
    type:'DATETIME',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    input:input,
    mode:mode,
    format:String(s.format||'')
  };

  input.onchange=function(){
    jplopsoft_comctlNotify(
      ctx,id,'DTN_DATETIMECHANGE',
      {
        value:String(input.value||''),
        mode:state.mode
      }
    );
  };

  ctx.commonControls[id]=state;
  return id;
}

/* ---------------------------- MonthCalendar ---------------------------- */

function jplopsoft_comctlMonthIso(date){
  var y=date.getFullYear(),
      m=String(date.getMonth()+1).padStart(2,'0'),
      d=String(date.getDate()).padStart(2,'0');

  return y+'-'+m+'-'+d;
}

function jplopsoft_comctlMonthParse(value){
  var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(
    String(value||'')
  );

  if(!m)return new Date();

  return new Date(
    parseInt(m[1],10),
    parseInt(m[2],10)-1,
    parseInt(m[3],10)
  );
}

function jplopsoft_comctlMonthRender(ctx,state){
  var first=new Date(
        state.viewDate.getFullYear(),
        state.viewDate.getMonth(),
        1
      ),
      startDay=first.getDay(),
      days=new Date(
        state.viewDate.getFullYear(),
        state.viewDate.getMonth()+1,
        0
      ).getDate(),
      y=state.viewDate.getFullYear(),
      m=state.viewDate.getMonth(),
      i,cell,date,iso;

  state.title.textContent=
    String(y)+' 年 '+String(m+1)+' 月';

  while(state.grid.firstChild){
    state.grid.removeChild(state.grid.firstChild);
  }

  ['日','一','二','三','四','五','六'].forEach(
    function(text){
      cell=document.createElement('div');
      cell.className='jplopsoft_comctl-monthcal-week';
      cell.textContent=text;
      state.grid.appendChild(cell);
    }
  );

  for(i=0;i<startDay;i++){
    cell=document.createElement('div');
    cell.className='jplopsoft_comctl-monthcal-empty';
    state.grid.appendChild(cell);
  }

  for(i=1;i<=days;i++){
    date=new Date(y,m,i);
    iso=jplopsoft_comctlMonthIso(date);

    cell=document.createElement('button');
    cell.type='button';
    cell.className='jplopsoft_comctl-monthcal-day';
    cell.textContent=String(i);
    cell.setAttribute(
      'data-selected',
      iso===state.selected?'1':'0'
    );

    if(
      (state.min&&iso<state.min)||
      (state.max&&iso>state.max)
    ){
      cell.disabled=true;
    }

    (function(value){
      cell.onclick=function(){
        state.selected=value;
        jplopsoft_comctlMonthRender(ctx,state);

        jplopsoft_comctlNotify(
          ctx,state.id,'MCN_SELCHANGE',
          {value:value}
        );
      };
    })(iso);

    state.grid.appendChild(cell);
  }

  /* Keep a stable 6-week grid so the calendar never jumps or overflows when
   * switching between months with different week counts. */
  for(i=startDay+days;i<42;i++){
    cell=document.createElement('div');
    cell.className='jplopsoft_comctl-monthcal-empty';
    state.grid.appendChild(cell);
  }
}

function jplopsoft_comctlCreateMonthCalendar(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('monthcal'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'MONTHCAL','SysMonthCal32'
      ),
      head=document.createElement('div'),
      prev=document.createElement('button'),
      title=document.createElement('span'),
      next=document.createElement('button'),
      grid=document.createElement('div'),
      selected=String(s.value||jplopsoft_comctlMonthIso(new Date())),
      state;

  host.root.className+=' jplopsoft_comctl-monthcal';

  head.className='jplopsoft_comctl-monthcal-head';
  prev.type='button';prev.textContent='‹';
  next.type='button';next.textContent='›';
  title.className='jplopsoft_comctl-monthcal-title';

  head.appendChild(prev);
  head.appendChild(title);
  head.appendChild(next);

  grid.className='jplopsoft_comctl-monthcal-grid';

  host.root.appendChild(head);
  host.root.appendChild(grid);

  state={
    id:id,
    type:'MONTHCAL',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    title:title,
    grid:grid,
    selected:selected,
    viewDate:jplopsoft_comctlMonthParse(selected),
    min:String(s.min||''),
    max:String(s.max||''),
    monthDelta:Math.max(1,parseInt(s.monthDelta,10)||1)
  };

  prev.onclick=function(){
    state.viewDate=new Date(
      state.viewDate.getFullYear(),
      state.viewDate.getMonth()-state.monthDelta,
      1
    );

    jplopsoft_comctlMonthRender(ctx,state);
    jplopsoft_comctlNotify(
      ctx,id,'MCN_VIEWCHANGE',
      {month:jplopsoft_comctlMonthIso(state.viewDate)}
    );
  };

  next.onclick=function(){
    state.viewDate=new Date(
      state.viewDate.getFullYear(),
      state.viewDate.getMonth()+state.monthDelta,
      1
    );

    jplopsoft_comctlMonthRender(ctx,state);
    jplopsoft_comctlNotify(
      ctx,id,'MCN_VIEWCHANGE',
      {month:jplopsoft_comctlMonthIso(state.viewDate)}
    );
  };

  ctx.commonControls[id]=state;
  jplopsoft_comctlMonthRender(ctx,state);

  return id;
}

/* ----------------------------- IPAddress ------------------------------- */

function jplopsoft_comctlIpSync(state){
  state.fields.forEach(function(input,index){
    input.min=String(state.ranges[index][0]);
    input.max=String(state.ranges[index][1]);
  });
}

function jplopsoft_comctlIpValue(state){
  return state.fields.map(function(input){
    var n=parseInt(input.value,10);

    if(isNaN(n))n=0;

    return Math.max(0,Math.min(255,n));
  }).join('.');
}

function jplopsoft_comctlCreateIPAddress(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('ip'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'IPADDRESS','SysIPAddress32'
      ),
      state,i,input,dot,
      parts=String(s.value||'').split('.');

  host.root.className+=' jplopsoft_comctl-ip';

  state={
    id:id,
    type:'IPADDRESS',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    fields:[],
    ranges:[
      [0,255],[0,255],[0,255],[0,255]
    ]
  };

  for(i=0;i<4;i++){
    input=document.createElement('input');
    input.type='number';
    input.inputMode='numeric';
    input.className='jplopsoft_comctl-ip-field';
    input.value=/^\d+$/.test(parts[i]||'')
      ?String(Math.max(0,Math.min(255,parseInt(parts[i],10))))
      :'';

    (function(index,node){
      node.oninput=function(){
        var n=parseInt(node.value,10),
            r=state.ranges[index];

        if(!isNaN(n)){
          n=Math.max(r[0],Math.min(r[1],n));
          node.value=String(n);

          if(
            node.value.length>=3&&
            index<3
          ){
            try{state.fields[index+1].focus();}catch(ignoreFocus){}
          }
        }

        jplopsoft_comctlNotify(
          ctx,id,'IPN_FIELDCHANGED',
          {
            field:index,
            value:isNaN(n)?null:n,
            address:jplopsoft_comctlIpValue(state)
          }
        );
      };

      node.onkeydown=function(e){
        if(
          e.key==='.'&&
          index<3
        ){
          try{
            e.preventDefault();
            state.fields[index+1].focus();
          }catch(ignoreDot){}
        }
      };
    })(i,input);

    state.fields.push(input);
    host.root.appendChild(input);

    if(i<3){
      dot=document.createElement('span');
      dot.className='jplopsoft_comctl-ip-dot';
      dot.textContent='.';
      host.root.appendChild(dot);
    }
  }

  ctx.commonControls[id]=state;
  jplopsoft_comctlIpSync(state);
  return id;
}

/* -------------------------------- SysLink ------------------------------ */

function jplopsoft_comctlLinkRender(ctx,state){
  var i,part,a,span;

  while(state.root.firstChild)state.root.removeChild(state.root.firstChild);

  if(state.text){
    span=document.createElement('span');
    span.textContent=state.text;
    state.root.appendChild(span);
  }

  for(i=0;i<state.links.length;i++){
    part=state.links[i];

    if(i>0||state.text){
      span=document.createElement('span');
      span.textContent=part.prefix||' ';
      state.root.appendChild(span);
    }

    a=document.createElement('a');
    a.href='#';
    a.className='jplopsoft_comctl-link-anchor';
    a.textContent=part.text;
    a.setAttribute('data-link-id',part.id);

    (function(link){
      a.onclick=function(e){
        try{e.preventDefault();}catch(ignoreClick){}

        jplopsoft_comctlNotify(
          ctx,state.id,'NM_CLICK',
          {link:link}
        );

        return false;
      };

      a.onkeydown=function(e){
        if(e.key==='Enter'){
          try{e.preventDefault();}catch(ignoreReturn){}

          jplopsoft_comctlNotify(
            ctx,state.id,'NM_RETURN',
            {link:link}
          );
        }
      };
    })(part);

    state.root.appendChild(a);
  }
}

function jplopsoft_comctlCreateLink(ctx,hwnd,spec){
  var s=spec||{},
      id=String(s.id||('link'+(++ctx.controlSeq))),
      host=jplopsoft_comctlRoot(
        ctx,hwnd,s,id,'LINK','SysLink'
      ),
      state;

  host.root.className+=' jplopsoft_comctl-link';

  state={
    id:id,
    type:'LINK',
    hwnd:parseInt(hwnd,10)||0,
    root:host.root,
    text:String(s.text||''),
    links:(Array.isArray(s.links)?s.links:[]).map(
      function(link,index){
        link=link&&typeof link==='object'?link:{};
        return{
          id:String(link.id||('link'+index)),
          text:String(link.text||link.href||('Link '+(index+1))),
          href:String(link.href||''),
          prefix:String(link.prefix||''),
          data:link.data&&typeof link.data==='object'?link.data:{}
        };
      }
    )
  };

  ctx.commonControls[id]=state;
  jplopsoft_comctlLinkRender(ctx,state);

  return id;
}

/* ------------------------- Create by class name ------------------------ */

function jplopsoft_comctlCreateByClass(ctx,hwnd,className,spec){
  className=String(className||'');

  if(className==='SysListView32'){
    return jplopsoft_comctlCreateListView(ctx,hwnd,spec);
  }

  if(className==='SysTreeView32'){
    return jplopsoft_comctlCreateTreeView(ctx,hwnd,spec);
  }

  if(className==='SysHeader32'){
    return jplopsoft_comctlCreateHeader(ctx,hwnd,spec);
  }

  if(className==='SysTabControl32'){
    return jplopsoft_comctlCreateTabControl(ctx,hwnd,spec);
  }

  if(className==='ToolbarWindow32'){
    return jplopsoft_comctlCreateToolbar(ctx,hwnd,spec);
  }

  if(className==='ReBarWindow32'){
    return jplopsoft_comctlCreateReBar(ctx,hwnd,spec);
  }

  if(className==='SysPager'){
    return jplopsoft_comctlCreatePager(ctx,hwnd,spec);
  }

  if(className==='msctls_statusbar32'){
    return jplopsoft_comctlCreateStatusBar(ctx,hwnd,spec);
  }

  if(className==='msctls_progress32'){
    return jplopsoft_comctlCreateProgressBar(ctx,hwnd,spec);
  }

  if(className==='tooltips_class32'){
    return jplopsoft_comctlCreateToolTip(ctx,hwnd,spec);
  }

  if(className==='SysAnimate32'){
    return jplopsoft_comctlCreateAnimate(ctx,hwnd,spec);
  }

  if(className==='msctls_trackbar32'){
    return jplopsoft_comctlCreateTrackbar(ctx,hwnd,spec);
  }

  if(className==='msctls_updown32'){
    return jplopsoft_comctlCreateUpDown(ctx,hwnd,spec);
  }

  if(className==='SysDateTimePick32'){
    return jplopsoft_comctlCreateDateTimePicker(ctx,hwnd,spec);
  }

  if(className==='SysMonthCal32'){
    return jplopsoft_comctlCreateMonthCalendar(ctx,hwnd,spec);
  }

  if(className==='SysIPAddress32'){
    return jplopsoft_comctlCreateIPAddress(ctx,hwnd,spec);
  }

  if(className==='SysLink'){
    return jplopsoft_comctlCreateLink(ctx,hwnd,spec);
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported Common Control class: '+className
  );
}



async function jplopsoft_comctlDispatch(ctx,method,args){
  var state,item,index,list,ids,i,entry;

  args=Array.isArray(args)?args:[];
  jplopsoft_comctlEnsureContext(ctx);

  if(method==='InitCommonControlsEx'){
    return{
      ok:true,
      model:'EXOS_COMCTL32_V2',
      version:'6.4.0-dev-os69',
      classes:jplopsoft_comctlClasses()
    };
  }

  if(method==='GetCommonControlsVersion'){
    return{
      model:'EXOS_COMCTL32_V2',
      version:'6.4.0-dev-os69'
    };
  }

  if(method==='GetCommonControlClasses'){
    return jplopsoft_comctlClasses();
  }

  if(method==='CreateCommonControl'){
    return jplopsoft_comctlCreateByClass(
      ctx,args[0],args[1],args[2]||{}
    );
  }

  if(method==='DestroyCommonControl'){
    return jplopsoft_comctlDestroy(ctx,args[0]);
  }

  /* ListView */
  if(method==='CreateListView'){
    return jplopsoft_comctlCreateListView(ctx,args[0],args[1]);
  }
  if(method==='ListView_SetColumns'){
    return jplopsoft_comctlListSetColumns(ctx,args[0],args[1]);
  }
  if(method==='ListView_GetColumns'){
    return jplopsoft_comctlListGetColumns(
      jplopsoft_comctlState(ctx,args[0],'LISTVIEW')
    );
  }
  if(method==='ListView_SetItems'){
    return jplopsoft_comctlListSetItems(ctx,args[0],args[1]);
  }
  if(method==='ListView_InsertItem'){
    return jplopsoft_comctlListInsertItem(ctx,args[0],args[1],args[2]);
  }
  if(method==='ListView_UpdateItem'){
    return jplopsoft_comctlListUpdateItem(ctx,args[0],args[1],args[2]);
  }
  if(method==='ListView_DeleteItem'){
    return jplopsoft_comctlListDeleteItem(ctx,args[0],args[1]);
  }
  if(method==='ListView_DeleteAllItems'){
    return jplopsoft_comctlListSetItems(ctx,args[0],[]);
  }
  if(method==='ListView_GetItem'){
    state=jplopsoft_comctlState(ctx,args[0],'LISTVIEW');
    item=jplopsoft_comctlListItemById(state,args[1]);

    return item
      ?{
        id:item.id,
        text:item.text,
        subItems:item.subItems.slice(),
        icon:item.icon,
        imageList:item.imageList,
        imageIndex:item.imageIndex,
        data:item.data
      }
      :null;
  }
  if(method==='ListView_GetItemCount'){
    return jplopsoft_comctlState(ctx,args[0],'LISTVIEW').items.length;
  }
  if(method==='ListView_SetView'){
    return jplopsoft_comctlListSetView(ctx,args[0],args[1]);
  }
  if(method==='ListView_GetView'){
    return jplopsoft_comctlState(ctx,args[0],'LISTVIEW').view;
  }
  if(method==='ListView_GetSelectedItems'){
    state=jplopsoft_comctlState(ctx,args[0],'LISTVIEW');
    ids=jplopsoft_comctlListSelectedArray(state);
    list=[];

    for(i=0;i<ids.length;i++){
      item=jplopsoft_comctlListItemById(state,ids[i]);

      if(item){
        list.push({
          id:item.id,
          text:item.text,
          subItems:item.subItems.slice(),
          icon:item.icon,
          imageList:item.imageList,
          imageIndex:item.imageIndex,
          data:item.data
        });
      }
    }

    return list;
  }
  if(method==='ListView_SetSelectedItems'){
    state=jplopsoft_comctlState(ctx,args[0],'LISTVIEW');
    ids=Array.isArray(args[1])?args[1]:[];
    state.selected={};

    for(i=0;i<ids.length;i++){
      if(jplopsoft_comctlListItemById(state,ids[i])){
        state.selected[String(ids[i])]=1;
      }
    }

    state.focusedId=ids.length?String(ids[ids.length-1]):'';
    state.anchorId=state.focusedId;

    jplopsoft_comctlListApplySelection(state);
    jplopsoft_comctlListNotifySelection(ctx,state,'api');
    return true;
  }
  if(method==='ListView_SortItems'){
    state=jplopsoft_comctlState(ctx,args[0],'LISTVIEW');
    return jplopsoft_comctlListSort(
      ctx,state,args[1],args[2]!==false
    );
  }
  if(method==='ListView_EnsureVisible'){
    return jplopsoft_comctlListEnsureVisible(
      jplopsoft_comctlState(ctx,args[0],'LISTVIEW'),
      args[1]
    );
  }

  /* TreeView */
  if(method==='CreateTreeView'){
    return jplopsoft_comctlCreateTreeView(ctx,args[0],args[1]);
  }
  if(method==='TreeView_SetItems'){
    return jplopsoft_comctlTreeSetItems(ctx,args[0],args[1]);
  }
  if(method==='TreeView_SetItem'){
    return jplopsoft_comctlTreeSetItem(ctx,args[0],args[1],args[2]);
  }
  if(method==='TreeView_SetChildren'){
    return jplopsoft_comctlTreeSetChildren(ctx,args[0],args[1],args[2]);
  }
  if(method==='TreeView_InsertItem'){
    return jplopsoft_comctlTreeInsertItem(ctx,args[0],args[1]);
  }
  if(method==='TreeView_DeleteItem'){
    return jplopsoft_comctlTreeDeleteItem(ctx,args[0],args[1]);
  }
  if(method==='TreeView_DeleteAllItems'){
    return jplopsoft_comctlTreeSetItems(ctx,args[0],[]);
  }
  if(method==='TreeView_GetItem'){
    return jplopsoft_comctlTreeSnapshotItem(
      jplopsoft_comctlState(ctx,args[0],'TREEVIEW'),
      args[1]
    );
  }
  if(method==='TreeView_SelectItem'){
    return jplopsoft_comctlTreeSelect(
      ctx,
      jplopsoft_comctlState(ctx,args[0],'TREEVIEW'),
      args[1],
      'api'
    );
  }
  if(method==='TreeView_GetSelection'){
    state=jplopsoft_comctlState(ctx,args[0],'TREEVIEW');

    return state.selectedId
      ?jplopsoft_comctlTreeSnapshotItem(state,state.selectedId)
      :null;
  }
  if(method==='TreeView_Expand'){
    return jplopsoft_comctlTreeExpand(
      ctx,
      jplopsoft_comctlState(ctx,args[0],'TREEVIEW'),
      args[1],
      args[2],
      'api'
    );
  }
  if(method==='TreeView_GetExpandedItems'){
    state=jplopsoft_comctlState(ctx,args[0],'TREEVIEW');
    list=[];

    for(index in state.items){
      if(
        state.items.hasOwnProperty(index)&&
        state.items[index].expanded
      ){
        list.push(index);
      }
    }

    return list;
  }

  /* Header */
  if(method==='CreateHeader'){
    return jplopsoft_comctlCreateHeader(ctx,args[0],args[1]);
  }
  if(method==='Header_SetItems'){
    state=jplopsoft_comctlState(ctx,args[0],'HEADER');
    state.items=(Array.isArray(args[1])?args[1]:[]).map(
      jplopsoft_comctlHeaderNormalize
    );
    state.order=state.items.map(function(x,i){return i;});
    jplopsoft_comctlHeaderRender(ctx,state);
    return true;
  }
  if(method==='Header_GetItems'){
    state=jplopsoft_comctlState(ctx,args[0],'HEADER');
    return state.order.map(function(i){return state.items[i];});
  }
  if(method==='Header_InsertItem'){
    state=jplopsoft_comctlState(ctx,args[0],'HEADER');
    index=parseInt(args[2],10);
    if(isNaN(index)||index<0||index>state.items.length)index=state.items.length;
    state.items.splice(
      index,0,
      jplopsoft_comctlHeaderNormalize(args[1],index)
    );
    state.order=state.items.map(function(x,i){return i;});
    jplopsoft_comctlHeaderRender(ctx,state);
    return index;
  }
  if(method==='Header_DeleteItem'){
    state=jplopsoft_comctlState(ctx,args[0],'HEADER');
    index=parseInt(args[1],10);
    if(isNaN(index)||index<0||index>=state.items.length)return false;
    state.items.splice(index,1);
    state.order=state.items.map(function(x,i){return i;});
    jplopsoft_comctlHeaderRender(ctx,state);
    return true;
  }
  if(method==='Header_GetItem'){
    state=jplopsoft_comctlState(ctx,args[0],'HEADER');
    index=parseInt(args[1],10);
    return state.items[index]||null;
  }
  if(method==='Header_SetItem'){
    state=jplopsoft_comctlState(ctx,args[0],'HEADER');
    index=parseInt(args[1],10);
    if(isNaN(index)||index<0||index>=state.items.length)return false;
    state.items[index]=jplopsoft_comctlHeaderNormalize(args[2],index);
    jplopsoft_comctlHeaderRender(ctx,state);
    return true;
  }
  if(method==='Header_GetItemCount'){
    return jplopsoft_comctlState(ctx,args[0],'HEADER').items.length;
  }
  if(method==='Header_SetOrderArray'){
    state=jplopsoft_comctlState(ctx,args[0],'HEADER');
    list=Array.isArray(args[1])?args[1].map(function(x){return parseInt(x,10);}):[];
    if(
      list.length!==state.items.length||
      list.some(function(x){return isNaN(x)||x<0||x>=state.items.length;})||
      (new Set(list)).size!==list.length
    ){
      throw jplopsoft_xshError(
        jplopsoft_STATUS_INVALID_PARAMETER,
        'Invalid Header order array.'
      );
    }
    state.order=list;
    jplopsoft_comctlHeaderRender(ctx,state);
    return true;
  }
  if(method==='Header_GetOrderArray'){
    return jplopsoft_comctlState(ctx,args[0],'HEADER').order.slice();
  }

  /* TabControl */
  if(method==='CreateTabControl'){
    return jplopsoft_comctlCreateTabControl(ctx,args[0],args[1]);
  }
  if(method==='TabCtrl_InsertItem'){
    state=jplopsoft_comctlState(ctx,args[0],'TAB');
    index=parseInt(args[2],10);
    if(isNaN(index)||index<0||index>state.tabs.length)index=state.tabs.length;
    state.tabs.splice(index,0,jplopsoft_comctlTabNormalize(args[1],index));
    if(state.tabs.length===1)state.current=0;
    jplopsoft_comctlTabRender(ctx,state);
    return index;
  }
  if(method==='TabCtrl_DeleteItem'){
    state=jplopsoft_comctlState(ctx,args[0],'TAB');
    index=parseInt(args[1],10);
    if(isNaN(index)||index<0||index>=state.tabs.length)return false;
    delete ctx.controls[jplopsoft_comctlTabPageId(state,state.tabs[index].id)];
    state.tabs.splice(index,1);
    state.current=Math.max(0,Math.min(state.tabs.length-1,state.current));
    jplopsoft_comctlTabRender(ctx,state);
    return true;
  }
  if(method==='TabCtrl_GetItem'){
    state=jplopsoft_comctlState(ctx,args[0],'TAB');
    return state.tabs[parseInt(args[1],10)]||null;
  }
  if(method==='TabCtrl_SetItem'){
    state=jplopsoft_comctlState(ctx,args[0],'TAB');
    index=parseInt(args[1],10);
    if(isNaN(index)||index<0||index>=state.tabs.length)return false;
    state.tabs[index]=jplopsoft_comctlTabNormalize(args[2],index);
    jplopsoft_comctlTabRender(ctx,state);
    return true;
  }
  if(method==='TabCtrl_GetItemCount'){
    return jplopsoft_comctlState(ctx,args[0],'TAB').tabs.length;
  }
  if(method==='TabCtrl_SetCurSel'){
    state=jplopsoft_comctlState(ctx,args[0],'TAB');
    return jplopsoft_comctlTabSetCurrent(ctx,state,args[1],'api');
  }
  if(method==='TabCtrl_GetCurSel'){
    return jplopsoft_comctlState(ctx,args[0],'TAB').current;
  }
  if(method==='TabCtrl_GetPageId'){
    state=jplopsoft_comctlState(ctx,args[0],'TAB');
    index=parseInt(args[1],10);
    return state.tabs[index]
      ?jplopsoft_comctlTabPageId(state,state.tabs[index].id)
      :'';
  }

  /* Toolbar */
  if(method==='CreateToolbar'){
    return jplopsoft_comctlCreateToolbar(ctx,args[0],args[1]);
  }
  if(method==='Toolbar_SetButtons'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLBAR');
    state.buttons=(Array.isArray(args[1])?args[1]:[]).map(
      jplopsoft_comctlToolbarNormalize
    );
    jplopsoft_comctlToolbarRender(ctx,state);
    return true;
  }
  if(method==='Toolbar_AddButtons'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLBAR');
    (Array.isArray(args[1])?args[1]:[]).forEach(function(b){
      state.buttons.push(
        jplopsoft_comctlToolbarNormalize(b,state.buttons.length)
      );
    });
    jplopsoft_comctlToolbarRender(ctx,state);
    return state.buttons.length;
  }
  if(method==='Toolbar_GetButton'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLBAR');
    return state.buttons.find(function(b){return b.id===String(args[1]);})||null;
  }
  if(
    method==='Toolbar_EnableButton'||
    method==='Toolbar_CheckButton'||
    method==='Toolbar_SetButtonText'
  ){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLBAR');
    item=state.buttons.find(function(b){return b.id===String(args[1]);});
    if(!item)return false;

    if(method==='Toolbar_EnableButton')item.enabled=!!args[2];
    if(method==='Toolbar_CheckButton')item.checked=!!args[2];
    if(method==='Toolbar_SetButtonText')item.text=String(args[2]||'');

    jplopsoft_comctlToolbarRender(ctx,state);
    return true;
  }

  /* ReBar */
  if(method==='CreateReBar'){
    return jplopsoft_comctlCreateReBar(ctx,args[0],args[1]);
  }
  if(method==='ReBar_SetBands'){
    state=jplopsoft_comctlState(ctx,args[0],'REBAR');
    state.bands=(Array.isArray(args[1])?args[1]:[]).map(
      jplopsoft_comctlRebarNormalize
    );
    jplopsoft_comctlRebarRender(ctx,state);
    return true;
  }
  if(method==='ReBar_InsertBand'){
    state=jplopsoft_comctlState(ctx,args[0],'REBAR');
    index=parseInt(args[2],10);
    if(isNaN(index)||index<0||index>state.bands.length)index=state.bands.length;
    state.bands.splice(index,0,jplopsoft_comctlRebarNormalize(args[1],index));
    jplopsoft_comctlRebarRender(ctx,state);
    return index;
  }
  if(method==='ReBar_DeleteBand'){
    state=jplopsoft_comctlState(ctx,args[0],'REBAR');
    index=parseInt(args[1],10);
    if(isNaN(index)||index<0||index>=state.bands.length)return false;
    state.bands.splice(index,1);
    jplopsoft_comctlRebarRender(ctx,state);
    return true;
  }
  if(method==='ReBar_GetBandCount'){
    return jplopsoft_comctlState(ctx,args[0],'REBAR').bands.length;
  }
  if(method==='ReBar_MoveBand'){
    state=jplopsoft_comctlState(ctx,args[0],'REBAR');
    var from=parseInt(args[1],10),to=parseInt(args[2],10),band;
    if(
      isNaN(from)||isNaN(to)||
      from<0||from>=state.bands.length||
      to<0||to>=state.bands.length
    )return false;
    band=state.bands.splice(from,1)[0];
    state.bands.splice(to,0,band);
    jplopsoft_comctlRebarRender(ctx,state);
    return true;
  }
  if(method==='ReBar_GetBandParentId'){
    state=jplopsoft_comctlState(ctx,args[0],'REBAR');
    index=parseInt(args[1],10);
    return state.bands[index]
      ?jplopsoft_comctlRebarParentId(state,state.bands[index].id)
      :'';
  }

  /* Pager */
  if(method==='CreatePager'){
    return jplopsoft_comctlCreatePager(ctx,args[0],args[1]);
  }
  if(method==='Pager_SetPos'){
    state=jplopsoft_comctlState(ctx,args[0],'PAGER');
    state.pos=Math.max(0,parseInt(args[1],10)||0);
    jplopsoft_comctlPagerUpdate(state);
    return state.pos;
  }
  if(method==='Pager_GetPos'){
    return jplopsoft_comctlState(ctx,args[0],'PAGER').pos;
  }
  if(method==='Pager_SetButtonSize'){
    state=jplopsoft_comctlState(ctx,args[0],'PAGER');
    state.buttonSize=Math.max(8,parseInt(args[1],10)||32);
    return state.buttonSize;
  }
  if(method==='Pager_GetContentParentId'){
    return jplopsoft_comctlState(ctx,args[0],'PAGER').contentId;
  }

  /* StatusBar */
  if(method==='CreateStatusBar'){
    return jplopsoft_comctlCreateStatusBar(ctx,args[0],args[1]);
  }
  if(method==='StatusBar_SetParts'){
    state=jplopsoft_comctlState(ctx,args[0],'STATUSBAR');
    state.parts=(Array.isArray(args[1])?args[1]:[]).map(function(p){
      p=p&&typeof p==='object'?p:{text:p};
      return{
        text:String(p.text||''),
        width:Math.max(0,parseInt(p.width,10)||0)
      };
    });
    jplopsoft_comctlStatusRender(state);
    return true;
  }
  if(method==='StatusBar_SetText'){
    state=jplopsoft_comctlState(ctx,args[0],'STATUSBAR');
    index=parseInt(args[1],10);
    if(isNaN(index)||index<0||index>=state.parts.length)return false;
    state.parts[index].text=String(args[2]||'');
    jplopsoft_comctlStatusRender(state);
    return true;
  }
  if(method==='StatusBar_GetText'){
    state=jplopsoft_comctlState(ctx,args[0],'STATUSBAR');
    index=parseInt(args[1],10);
    return state.parts[index]?state.parts[index].text:'';
  }
  if(method==='StatusBar_GetParts'){
    return jplopsoft_comctlState(ctx,args[0],'STATUSBAR').parts.map(
      function(p){return{text:p.text,width:p.width};}
    );
  }

  /* ProgressBar */
  if(method==='CreateProgressBar'){
    return jplopsoft_comctlCreateProgressBar(ctx,args[0],args[1]);
  }
  if(method==='ProgressBar_SetRange'){
    state=jplopsoft_comctlState(ctx,args[0],'PROGRESS');
    state.min=Number(args[1])||0;
    state.max=Number(args[2]);
    if(!isFinite(state.max)||state.max<=state.min)state.max=state.min+100;
    state.pos=Math.max(state.min,Math.min(state.max,state.pos));
    jplopsoft_comctlProgressRender(state);
    return true;
  }
  if(method==='ProgressBar_SetPos'){
    state=jplopsoft_comctlState(ctx,args[0],'PROGRESS');
    var oldPos=state.pos;
    state.pos=Math.max(state.min,Math.min(state.max,Number(args[1])||0));
    jplopsoft_comctlProgressRender(state);
    return oldPos;
  }
  if(method==='ProgressBar_DeltaPos'){
    state=jplopsoft_comctlState(ctx,args[0],'PROGRESS');
    state.pos=Math.max(state.min,Math.min(state.max,state.pos+(Number(args[1])||0)));
    jplopsoft_comctlProgressRender(state);
    return state.pos;
  }
  if(method==='ProgressBar_SetStep'){
    state=jplopsoft_comctlState(ctx,args[0],'PROGRESS');
    var oldStep=state.step;
    state.step=Number(args[1])||1;
    return oldStep;
  }
  if(method==='ProgressBar_StepIt'){
    state=jplopsoft_comctlState(ctx,args[0],'PROGRESS');
    state.pos=Math.max(state.min,Math.min(state.max,state.pos+state.step));
    jplopsoft_comctlProgressRender(state);
    return state.pos;
  }
  if(method==='ProgressBar_SetState'){
    state=jplopsoft_comctlState(ctx,args[0],'PROGRESS');
    var oldState=state.state;
    state.state=parseInt(args[1],10)||1;
    jplopsoft_comctlProgressRender(state);
    return oldState;
  }
  if(method==='ProgressBar_SetMarquee'){
    state=jplopsoft_comctlState(ctx,args[0],'PROGRESS');
    state.marquee=!!args[1];
    jplopsoft_comctlProgressRender(state);
    return true;
  }

  /* ToolTip */
  if(method==='CreateToolTip'){
    return jplopsoft_comctlCreateToolTip(ctx,args[0],args[1]);
  }
  if(method==='ToolTip_AddTool'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLTIP');
    return jplopsoft_comctlToolTipAdd(ctx,state,args[1]);
  }
  if(method==='ToolTip_DelTool'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLTIP');
    item=state.tools[String(args[1]||'')];
    if(!item)return false;
    try{
      item.node.removeEventListener('mouseenter',item.enter,false);
      item.node.removeEventListener('mouseleave',item.leave,false);
    }catch(ignoreTipDel){}
    delete state.tools[String(args[1]||'')];
    return true;
  }
  if(method==='ToolTip_UpdateTipText'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLTIP');
    item=state.tools[String(args[1]||'')];
    if(!item)return false;
    item.text=String(args[2]||'');
    return true;
  }
  if(method==='ToolTip_Activate'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLTIP');
    state.active=!!args[1];
    if(!state.active)jplopsoft_comctlToolTipHide(state);
    return true;
  }
  if(method==='ToolTip_SetDelayTime'){
    state=jplopsoft_comctlState(ctx,args[0],'TOOLTIP');
    state.delay=Math.max(0,parseInt(args[1],10)||0);
    return state.delay;
  }

  /* Animate */
  if(method==='CreateAnimate'){
    return jplopsoft_comctlCreateAnimate(ctx,args[0],args[1]);
  }
  if(method==='Animate_Open'){
    state=jplopsoft_comctlState(ctx,args[0],'ANIMATE');
    state.frames=(Array.isArray(args[1])?args[1]:[]).map(function(f){
      f=f&&typeof f==='object'?f:{};
      return{
        src:/^data:image\//i.test(String(f.src||''))?String(f.src):'',
        icon:String(f.icon||''),
        size:Math.max(8,Math.min(256,parseInt(f.size,10)||48))
      };
    });
    state.index=0;
    jplopsoft_comctlAnimateStop(state);
    jplopsoft_comctlAnimateFrame(ctx,state,0);
    return state.frames.length;
  }
  if(method==='Animate_Play'){
    state=jplopsoft_comctlState(ctx,args[0],'ANIMATE');
    jplopsoft_comctlAnimateStop(state);
    if(args[1]!==undefined)state.interval=Math.max(50,parseInt(args[1],10)||state.interval);
    if(args[2]!==undefined)state.loop=!!args[2];
    if(!state.frames.length)return false;
    state.playing=true;
    state.timer=window.setInterval(function(){
      var next=state.index+1;
      if(next>=state.frames.length){
        if(!state.loop){
          jplopsoft_comctlAnimateStop(state);
          return;
        }
        next=0;
      }
      jplopsoft_comctlAnimateFrame(ctx,state,next);
    },state.interval);
    return true;
  }
  if(method==='Animate_Stop'){
    state=jplopsoft_comctlState(ctx,args[0],'ANIMATE');
    jplopsoft_comctlAnimateStop(state);
    return true;
  }
  if(method==='Animate_Seek'){
    state=jplopsoft_comctlState(ctx,args[0],'ANIMATE');
    return jplopsoft_comctlAnimateFrame(ctx,state,parseInt(args[1],10)||0);
  }
  if(method==='Animate_Close'){
    state=jplopsoft_comctlState(ctx,args[0],'ANIMATE');
    jplopsoft_comctlAnimateStop(state);
    state.frames=[];
    state.index=0;
    jplopsoft_comctlAnimateFrame(ctx,state,0);
    return true;
  }

  /* Trackbar */
  if(method==='CreateTrackbar'){
    return jplopsoft_comctlCreateTrackbar(ctx,args[0],args[1]);
  }
  if(method==='Trackbar_SetRange'){
    state=jplopsoft_comctlState(ctx,args[0],'TRACKBAR');
    state.min=Number(args[1])||0;
    state.max=Number(args[2]);
    if(!isFinite(state.max)||state.max<=state.min)state.max=state.min+100;
    state.input.min=String(state.min);
    state.input.max=String(state.max);
    state.pos=Math.max(state.min,Math.min(state.max,state.pos));
    state.input.value=String(state.pos);
    return true;
  }
  if(method==='Trackbar_SetPos'){
    state=jplopsoft_comctlState(ctx,args[0],'TRACKBAR');
    state.pos=Math.max(state.min,Math.min(state.max,Number(args[1])||0));
    state.input.value=String(state.pos);
    return state.pos;
  }
  if(method==='Trackbar_GetPos'){
    return jplopsoft_comctlState(ctx,args[0],'TRACKBAR').pos;
  }
  if(method==='Trackbar_SetTicFreq'){
    state=jplopsoft_comctlState(ctx,args[0],'TRACKBAR');
    state.ticFreq=Math.max(0.000001,Number(args[1])||1);
    state.input.step=String(state.ticFreq);
    return state.ticFreq;
  }

  /* UpDown */
  if(method==='CreateUpDown'){
    return jplopsoft_comctlCreateUpDown(ctx,args[0],args[1]);
  }
  if(method==='UpDown_SetRange'){
    state=jplopsoft_comctlState(ctx,args[0],'UPDOWN');
    state.min=Number(args[1])||0;
    state.max=Number(args[2]);
    if(!isFinite(state.max)||state.max<state.min)state.max=state.min;
    jplopsoft_comctlUpDownSync(ctx,state);
    return true;
  }
  if(method==='UpDown_SetPos'){
    state=jplopsoft_comctlState(ctx,args[0],'UPDOWN');
    var oldUp=state.pos;
    state.pos=Number(args[1])||0;
    jplopsoft_comctlUpDownSync(ctx,state);
    return oldUp;
  }
  if(method==='UpDown_GetPos'){
    return jplopsoft_comctlState(ctx,args[0],'UPDOWN').pos;
  }
  if(method==='UpDown_SetBuddy'){
    state=jplopsoft_comctlState(ctx,args[0],'UPDOWN');
    state.buddyId=String(args[1]||'');
    jplopsoft_comctlUpDownSync(ctx,state);
    return state.buddyId;
  }
  if(method==='UpDown_GetBuddy'){
    return jplopsoft_comctlState(ctx,args[0],'UPDOWN').buddyId;
  }

  /* DateTimePicker */
  if(method==='CreateDateTimePicker'){
    return jplopsoft_comctlCreateDateTimePicker(ctx,args[0],args[1]);
  }
  if(method==='DateTime_SetSystemTime'){
    state=jplopsoft_comctlState(ctx,args[0],'DATETIME');
    state.input.value=String(args[1]||'');
    return true;
  }
  if(method==='DateTime_GetSystemTime'){
    return String(jplopsoft_comctlState(ctx,args[0],'DATETIME').input.value||'');
  }
  if(method==='DateTime_SetFormat'){
    state=jplopsoft_comctlState(ctx,args[0],'DATETIME');
    state.format=String(args[1]||'');
    return true;
  }

  /* MonthCalendar */
  if(method==='CreateMonthCalendar'){
    return jplopsoft_comctlCreateMonthCalendar(ctx,args[0],args[1]);
  }
  if(method==='MonthCal_SetCurSel'){
    state=jplopsoft_comctlState(ctx,args[0],'MONTHCAL');
    state.selected=String(args[1]||'');
    state.viewDate=jplopsoft_comctlMonthParse(state.selected);
    jplopsoft_comctlMonthRender(ctx,state);
    return true;
  }
  if(method==='MonthCal_GetCurSel'){
    return jplopsoft_comctlState(ctx,args[0],'MONTHCAL').selected;
  }
  if(method==='MonthCal_SetRange'){
    state=jplopsoft_comctlState(ctx,args[0],'MONTHCAL');
    state.min=String(args[1]||'');
    state.max=String(args[2]||'');
    jplopsoft_comctlMonthRender(ctx,state);
    return true;
  }
  if(method==='MonthCal_GetRange'){
    state=jplopsoft_comctlState(ctx,args[0],'MONTHCAL');
    return{min:state.min,max:state.max};
  }
  if(method==='MonthCal_SetMonthDelta'){
    state=jplopsoft_comctlState(ctx,args[0],'MONTHCAL');
    state.monthDelta=Math.max(1,parseInt(args[1],10)||1);
    return state.monthDelta;
  }

  /* IPAddress */
  if(method==='CreateIPAddress'){
    return jplopsoft_comctlCreateIPAddress(ctx,args[0],args[1]);
  }
  if(method==='IPAddress_SetAddress'){
    state=jplopsoft_comctlState(ctx,args[0],'IPADDRESS');
    var parts=String(args[1]||'').split('.');
    state.fields.forEach(function(input,i){
      input.value=/^\d+$/.test(parts[i]||'')
        ?String(Math.max(0,Math.min(255,parseInt(parts[i],10))))
        :'';
    });
    return true;
  }
  if(method==='IPAddress_GetAddress'){
    return jplopsoft_comctlIpValue(
      jplopsoft_comctlState(ctx,args[0],'IPADDRESS')
    );
  }
  if(method==='IPAddress_ClearAddress'){
    state=jplopsoft_comctlState(ctx,args[0],'IPADDRESS');
    state.fields.forEach(function(input){input.value='';});
    return true;
  }
  if(method==='IPAddress_SetRange'){
    state=jplopsoft_comctlState(ctx,args[0],'IPADDRESS');
    index=parseInt(args[1],10);
    if(isNaN(index)||index<0||index>3)return false;
    var ipMin=parseInt(args[2],10),
        ipMax=parseInt(args[3],10);

    if(isNaN(ipMin))ipMin=0;
    if(isNaN(ipMax))ipMax=255;

    state.ranges[index]=[
      Math.max(0,Math.min(255,ipMin)),
      Math.max(0,Math.min(255,ipMax))
    ];
    if(state.ranges[index][1]<state.ranges[index][0]){
      state.ranges[index][1]=state.ranges[index][0];
    }
    jplopsoft_comctlIpSync(state);
    return true;
  }

  /* SysLink */
  if(method==='CreateLink'){
    return jplopsoft_comctlCreateLink(ctx,args[0],args[1]);
  }
  if(method==='Link_SetText'){
    state=jplopsoft_comctlState(ctx,args[0],'LINK');
    state.text=String(args[1]||'');
    jplopsoft_comctlLinkRender(ctx,state);
    return true;
  }
  if(method==='Link_SetLinks'){
    state=jplopsoft_comctlState(ctx,args[0],'LINK');
    state.links=(Array.isArray(args[1])?args[1]:[]).map(
      function(link,index){
        link=link&&typeof link==='object'?link:{};
        return{
          id:String(link.id||('link'+index)),
          text:String(link.text||link.href||('Link '+(index+1))),
          href:String(link.href||''),
          prefix:String(link.prefix||''),
          data:link.data&&typeof link.data==='object'?link.data:{}
        };
      }
    );
    jplopsoft_comctlLinkRender(ctx,state);
    return true;
  }
  if(method==='Link_GetIdealSize'){
    state=jplopsoft_comctlState(ctx,args[0],'LINK');
    return{
      width:Math.max(60,state.root.scrollWidth||state.root.offsetWidth||60),
      height:Math.max(20,state.root.scrollHeight||state.root.offsetHeight||20)
    };
  }

  /* ImageList */
  if(method==='ImageList_Create'){
    return jplopsoft_comctlImageListCreate(ctx,args[0]);
  }
  if(method==='ImageList_Destroy'){
    jplopsoft_comctlEnsureContext(ctx);
    if(!ctx.imageLists[String(args[0]||'')])return false;
    delete ctx.imageLists[String(args[0]||'')];
    return true;
  }
  if(method==='ImageList_Add'){
    return jplopsoft_comctlImageListAdd(ctx,args[0],args[1]);
  }
  if(method==='ImageList_Replace'){
    return jplopsoft_comctlImageListReplace(ctx,args[0],args[1],args[2]);
  }
  if(method==='ImageList_Remove'){
    jplopsoft_comctlEnsureContext(ctx);
    list=ctx.imageLists[String(args[0]||'')];
    index=parseInt(args[1],10);
    if(!list||isNaN(index)||index<0||index>=list.images.length)return false;
    list.images.splice(index,1);
    return true;
  }
  if(method==='ImageList_GetImageCount'){
    jplopsoft_comctlEnsureContext(ctx);
    list=ctx.imageLists[String(args[0]||'')];
    return list?list.images.length:0;
  }
  if(method==='ImageList_GetIcon'){
    return jplopsoft_comctlImageEntry(ctx,args[0],args[1]);
  }
  if(method==='ImageList_SetIconSize'){
    jplopsoft_comctlEnsureContext(ctx);
    list=ctx.imageLists[String(args[0]||'')];
    if(!list)return false;
    list.width=Math.max(8,Math.min(256,parseInt(args[1],10)||16));
    list.height=Math.max(8,Math.min(256,parseInt(args[2],10)||16));
    return true;
  }
  if(method==='ImageList_GetIconSize'){
    jplopsoft_comctlEnsureContext(ctx);
    list=ctx.imageLists[String(args[0]||'')];
    return list?{width:list.width,height:list.height}:null;
  }

  throw jplopsoft_xshError(
    jplopsoft_STATUS_NOT_SUPPORTED,
    'Unsupported comctl32 API: '+String(method||'')
  );
}


  global.jplopsoft_comctlDispatch=jplopsoft_comctlDispatch;

  global.jplopsoft_EXOS_COMCTL32=Object.freeze({
    ready:true,
    version:'6.4.0-dev-os69',
    model:'EXOS_COMCTL32_V2',
    build:'external-comctl32-core-controls',
    classes:Object.freeze(jplopsoft_comctlClasses().slice())
  });
})(window);
