/* ExOS.WinUI declarative UI host
 * Version: 6.4.0-dev-os84
 * Model: EXOS_WINUI_V2
 * Declarative facade over USER32 + COMCTL32. XSH never receives DOM nodes.
 */
(function(global){'use strict';
var WINUI={version:'6.4.0-dev-os84',model:'EXOS_WINUI_V2',ready:true,compatibility:'NT_USER32_DECLARATIVE_V2'};
function arr(v){return Array.isArray(v)?v:(v==null?[]:[v]);}
function safeType(v){return String(v||'div').toLowerCase();}
function err(name,fallback,msg){var k='jplopsoft_STATUS_'+name,s=typeof global[k]!=='undefined'?global[k]:fallback;if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,msg);var e=new Error(msg);e.ntstatus=s;return e;}
function ownWindow(ctx,hwnd){return !!(ctx&&ctx.windows&&ctx.windows[String(parseInt(hwnd,10)||0)]);}
function control(ctx,id){var n=ctx&&ctx.controls?ctx.controls[String(id||'')]:null;if(!n)throw err('OBJECT_NAME_NOT_FOUND',0xC0000034,'WinUI control not found.');return n;}
async function renderNode(ctx,hwnd,node,parentId,path){
 node=node&&typeof node==='object'?node:{};path=path||'ui';var type=safeType(node.type),id=String(node.id||path.replace(/[^a-z0-9_]/gi,'_')),children=arr(node.children),i,controlId,spec;
 if(type==='listview'){controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateListView',[hwnd,{id:id,parentId:parentId,columns:node.columns||[],items:node.items||node.data||[],view:node.view,style:node.style||{},singleSelect:!!node.singleSelect}]);}
 else if(type==='treeview'){controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateTreeView',[hwnd,{id:id,parentId:parentId,items:node.items||node.data||[],style:node.style||{}}]);}
 else if(type==='statusbar'){controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateStatusBar',[hwnd,{id:id,parentId:parentId,parts:node.parts||[],style:node.style||{}}]);}
 else if(type==='progressbar'){controlId=await global.jplopsoft_comctlDispatch(ctx,'CreateProgressBar',[hwnd,{id:id,parentId:parentId,min:node.min,max:node.max,pos:node.value,style:node.style||{}}]);}
 else{
  spec={type:type,id:id,parentId:parentId,text:node.text,value:node.value,placeholder:node.placeholder,readOnly:node.readOnly,disabled:node.disabled,checked:node.checked,spellcheck:node.spellcheck,title:node.title,src:node.src,alt:node.alt,html:node.html,items:node.items||node.data,multiple:node.multiple,rows:node.rows,selectedIndex:node.selectedIndex,selectedIndices:node.selectedIndices,min:node.min,max:node.max,step:node.step,style:node.style||{}};
  controlId=global.jplopsoft_xshCreateControl(ctx,hwnd,spec);
 }
 for(i=0;i<children.length;i++)await renderNode(ctx,hwnd,children[i],controlId,path+'_'+i);
 return controlId;
}
async function remove(ctx,id){
 id=String(id||'');var cc=ctx.commonControls&&ctx.commonControls[id];
 if(cc&&typeof global.jplopsoft_comctlDispatch==='function'){try{return await global.jplopsoft_comctlDispatch(ctx,'DestroyCommonControl',[id]);}catch(ignoreCommon){}}
 var n=ctx.controls&&ctx.controls[id];if(!n)return false;
 try{if(n.parentNode)n.parentNode.removeChild(n);}catch(ignoreRemove){}
 delete ctx.controls[id];return true;
}
function setText(ctx,id,value){
 var n=control(ctx,id),tag=String(n.tagName||'').toLowerCase(),text=String(value===undefined||value===null?'':value);
 if(n._jplopsoftGroupLegend)n._jplopsoftGroupLegend.textContent=text;
 else if(tag==='input'||tag==='textarea'||tag==='select')n.value=text;
 else n.textContent=text;
 return true;
}
function getText(ctx,id){
 var n=control(ctx,id),tag=String(n.tagName||'').toLowerCase();
 if(n._jplopsoftGroupLegend)return String(n._jplopsoftGroupLegend.textContent||'');
 return tag==='input'||tag==='textarea'||tag==='select'?String(n.value||''):String(n.textContent||'');
}
async function setData(ctx,id,data){
 var state=ctx.commonControls&&ctx.commonControls[String(id||'')];
 if(state&&String(state.type)==='LISTVIEW')return await global.jplopsoft_comctlDispatch(ctx,'ListView_SetItems',[id,data||[]]);
 if(state&&String(state.type)==='TREEVIEW')return await global.jplopsoft_comctlDispatch(ctx,'TreeView_SetItems',[id,data||[]]);
 if(ctx.controls&&ctx.controls[String(id||'')]&&String(ctx.controls[String(id||'')].tagName||'').toLowerCase()==='select')return global.jplopsoft_xshSetControlProperty(ctx,id,'items',data||[]);
 throw err('OBJECT_NAME_NOT_FOUND',0xC0000034,'Declarative control does not expose SetData.');
}
async function dispatch(ctx,method,args){
 args=args||[];method=String(method||'');var hwnd,root,list,ids=[],i,id,ops,out=[];
 if(method==='GetVersion'||method==='QueryCapabilities')return{version:WINUI.version,model:WINUI.model,compatibility:WINUI.compatibility,controls:['USER32','COMCTL32'],diffDomExposed:false};
 if(method==='Render'){hwnd=parseInt(args[0],10)||0;if(!ownWindow(ctx,hwnd))throw err('ACCESS_DENIED',0xC0000022,'HWND is not owned by this XSH process.');root=args[1]||{};return await renderNode(ctx,hwnd,root,String(root.parentId||''),'ui');}
 if(method==='RenderMany'){hwnd=parseInt(args[0],10)||0;if(!ownWindow(ctx,hwnd))throw err('ACCESS_DENIED',0xC0000022,'HWND is not owned by this XSH process.');list=arr(args[1]);for(i=0;i<list.length;i++)ids.push(await renderNode(ctx,hwnd,list[i],String(list[i]&&list[i].parentId||''),'ui_'+i));return ids;}
 if(method==='SetData')return await setData(ctx,args[0],args[1]);
 if(method==='SetText')return setText(ctx,args[0],args[1]);
 if(method==='GetText')return getText(ctx,args[0]);
 if(method==='SetProperty')return global.jplopsoft_xshSetControlProperty(ctx,args[0],args[1],args[2]);
 if(method==='GetProperty')return global.jplopsoft_xshGetControlProperty(ctx,args[0],args[1]);
 if(method==='SetStyle')return global.jplopsoft_xshSetControlStyle(ctx,args[0],args[1]||{});
 if(method==='Focus')return global.jplopsoft_xshFocusControl(ctx,args[0]);
 if(method==='Enable')return global.jplopsoft_xshSetControlProperty(ctx,args[0],'disabled',!args[1]);
 if(method==='Show'){control(ctx,args[0]);return global.jplopsoft_xshSetControlStyle(ctx,args[0],{display:args[1]===false?'none':''});}
 if(method==='Remove')return await remove(ctx,args[0]);
 if(method==='ClearChildren')return global.jplopsoft_xshClearControlChildren(ctx,args[0]);
 if(method==='Batch'){
  ops=arr(args[0]);if(ops.length>256)throw err('QUOTA_EXCEEDED',0xC0000044,'WinUI Batch is limited to 256 operations.');
  for(i=0;i<ops.length;i++){var q=ops[i]||{},m=String(q.method||'');if(m==='Batch')throw err('INVALID_PARAMETER',0xC000000D,'Nested Batch is not supported.');out.push(await dispatch(ctx,m,q.args||[]));}return out;
 }
 throw err('NOT_SUPPORTED',0xC00000BB,'Unsupported ExOS.WinUI API: '+method);
}
global.jplopsoft_WINUI=WINUI;global.jplopsoft_winuiDispatch=dispatch;
})(window);
