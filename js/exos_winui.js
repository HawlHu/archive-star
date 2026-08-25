/* ExOS.WinUI declarative UI host
 * Version: 6.4.0-dev-os67
 * Model: EXOS_WINUI_V1
 */
(function(global){'use strict';
var WINUI={version:'6.4.0-dev-os67',model:'EXOS_WINUI_V1',ready:true};
function arr(v){return Array.isArray(v)?v:(v==null?[]:[v]);}
function safeType(v){return String(v||'div').toLowerCase();}
async function renderNode(ctx,hwnd,node,parentId,path){node=node&&typeof node==='object'?node:{};path=path||'ui';var type=safeType(node.type),id=String(node.id||path.replace(/[^a-z0-9_]/gi,'_')),children=arr(node.children),i,controlId;
 if(type==='listview'){if(typeof global.jplopsoft_comctlDispatch!=='function')throw global.jplopsoft_xshError(global.jplopsoft_STATUS_NOT_SUPPORTED,'comctl32 is required.');controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateListView',[hwnd,{id:id,parentId:parentId,columns:node.columns||[],items:node.items||node.data||[],view:node.view,style:node.style||{},singleSelect:!!node.singleSelect}]);}
 else if(type==='treeview'){controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateTreeView',[hwnd,{id:id,parentId:parentId,items:node.items||node.data||[],style:node.style||{}}]);}
 else if(type==='statusbar'){controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateStatusBar',[hwnd,{id:id,parentId:parentId,parts:node.parts||[],style:node.style||{}}]);}
 else if(type==='progressbar'){controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateProgressBar',[hwnd,{id:id,parentId:parentId,min:node.min,max:node.max,pos:node.value,style:node.style||{}}]);}
 else {controlId=global.jplopsoft_xshCreateControl(ctx,hwnd,{type:type,id:id,parentId:parentId,text:node.text,value:node.value,placeholder:node.placeholder,readOnly:node.readOnly,spellcheck:node.spellcheck,title:node.title,src:node.src,alt:node.alt,html:node.html,style:node.style||{}});}
 for(i=0;i<children.length;i++)await renderNode(ctx,hwnd,children[i],controlId,path+'_'+i);return controlId;}
async function dispatch(ctx,method,args){args=args||[];if(method==='GetVersion')return{version:WINUI.version,model:WINUI.model};if(method==='Render'){var hwnd=parseInt(args[0],10)||0;if(!ctx.windows[String(hwnd)])throw global.jplopsoft_xshError(global.jplopsoft_STATUS_ACCESS_DENIED,'HWND is not owned by this process.');var root=args[1]||{};return await renderNode(ctx,hwnd,root,String(root.parentId||''),'ui');}if(method==='RenderMany'){var list=arr(args[1]),ids=[],i;for(i=0;i<list.length;i++)ids.push(await renderNode(ctx,args[0],list[i],String(list[i]&&list[i].parentId||''),'ui_'+i));return ids;}if(method==='SetData'){var id=String(args[0]||''),data=args[1]||[],state=ctx.commonControls&&ctx.commonControls[id];if(state&&String(state.type)==='LISTVIEW')return await global.jplopsoft_comctlDispatch(ctx,'ListView_SetItems',[id,data]);if(state&&String(state.type)==='TREEVIEW')return await global.jplopsoft_comctlDispatch(ctx,'TreeView_SetItems',[id,data]);throw global.jplopsoft_xshError(global.jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND,'Declarative control not found.');}throw global.jplopsoft_xshError(global.jplopsoft_STATUS_NOT_SUPPORTED,'Unsupported ExOS.WinUI API: '+method);}
global.jplopsoft_WINUI=WINUI;global.jplopsoft_winuiDispatch=dispatch;
})(window);
