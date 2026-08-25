/* ExOS riched20.dll / msftedit.dll emulation
 * Version: 6.4.0-dev-os79
 * Model: EXOS_RICHEDIT_V2
 */
(function(global){'use strict';
var API={version:'6.4.0-dev-os79',model:'EXOS_RICHEDIT_V2',ready:true};
function exerr(s,m){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,m);var e=new Error(m);e.ntstatus=s;return e;}
function st(n,d){var k='jplopsoft_STATUS_'+n;return typeof global[k]!=='undefined'?global[k]:d;}
function ctrl(ctx,id){var n=ctx&&ctx.controls?ctx.controls[String(id||'')]:null;if(!n||n.getAttribute('data-exos-rich-edit')!=='1')throw exerr(st('INVALID_HANDLE',0xC0000008),'Rich Edit control not found.');return n;}
function sanitize(h){return typeof global.jplopsoft_xshSanitizeRichHtml==='function'?global.jplopsoft_xshSanitizeRichHtml(h):String(h||'');}
function textNodes(root){var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),a=[],n;while((n=w.nextNode()))a.push(n);return a;}
function selectionOffsets(n){var sel=window.getSelection(),out={start:0,end:0};if(!sel||!sel.rangeCount)return out;var r=sel.getRangeAt(0);if(!n.contains(r.startContainer)||!n.contains(r.endContainer))return out;var pre=document.createRange();pre.selectNodeContents(n);pre.setEnd(r.startContainer,r.startOffset);out.start=pre.toString().length;pre=document.createRange();pre.selectNodeContents(n);pre.setEnd(r.endContainer,r.endOffset);out.end=pre.toString().length;return out;}
function setSelection(n,start,end){start=Math.max(0,parseInt(start,10)||0);end=Math.max(start,parseInt(end,10)||start);var nodes=textNodes(n),range=document.createRange(),sel=window.getSelection(),pos=0,sn=n,so=0,en=n,eo=0,foundS=false,foundE=false,i,t,l;for(i=0;i<nodes.length;i++){t=nodes[i];l=t.nodeValue.length;if(!foundS&&start<=pos+l){sn=t;so=start-pos;foundS=true;}if(!foundE&&end<=pos+l){en=t;eo=end-pos;foundE=true;break;}pos+=l;}if(!foundS){sn=n;so=n.childNodes.length;}if(!foundE){en=n;eo=n.childNodes.length;}range.setStart(sn,so);range.setEnd(en,eo);sel.removeAllRanges();sel.addRange(range);n.focus();return true;}
function exec(n,cmd,val){var allow={bold:1,italic:1,underline:1,strikethrough:1,forecolor:1,backcolor:1,hilitecolor:1,fontname:1,fontsize:1,formatblock:1,justifyleft:1,justifycenter:1,justifyright:1,justifyfull:1,insertorderedlist:1,insertunorderedlist:1,indent:1,outdent:1,createlink:1,unlink:1,inserthorizontalrule:1,removeformat:1,undo:1,redo:1,selectall:1};cmd=String(cmd||'').toLowerCase();if(!allow[cmd])throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Rich Edit command is not exposed: '+cmd);n.focus();try{return !!document.execCommand(cmd,false,val===undefined?null:String(val));}catch(e){return false;}}
async function dispatch(ctx,method,args){args=args||[];method=String(method||'');var n,r;
 if(method==='GetVersion')return{version:API.version,model:API.model,backend:'contenteditable host control'};
 if(method==='CreateRichEdit'){if(typeof global.jplopsoft_xshCreateControl!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'USER32 control host unavailable.');var spec=args[1]||{};spec.type='richedit';return global.jplopsoft_xshCreateControl(ctx,args[0],spec);}
 if(method==='SetText'){n=ctrl(ctx,args[0]);n.textContent=String(args[1]===undefined?'':args[1]);return true;}
 if(method==='GetText'){return String(ctrl(ctx,args[0]).innerText||'');}
 if(method==='SetHTML'){n=ctrl(ctx,args[0]);n.innerHTML=sanitize(args[1]);return true;}
 if(method==='GetHTML'){n=ctrl(ctx,args[0]);n.innerHTML=sanitize(n.innerHTML);return n.innerHTML;}
 if(method==='ExecCommand'){return exec(ctrl(ctx,args[0]),args[1],args[2]);}
 if(method==='GetSelection'){return selectionOffsets(ctrl(ctx,args[0]));}
 if(method==='SetSelection'){return setSelection(ctrl(ctx,args[0]),args[1],args[2]);}
 if(method==='InsertText'){n=ctrl(ctx,args[0]);n.focus();var txt=String(args[1]===undefined?'':args[1]);try{document.execCommand('insertText',false,txt);return true;}catch(e){return false;}}
 if(method==='InsertHTML'){n=ctrl(ctx,args[0]);n.focus();var safe=sanitize(args[1]);try{return !!document.execCommand('insertHTML',false,safe);}catch(e){return false;}}
 if(method==='InsertImage'){n=ctrl(ctx,args[0]);var src=String(args[1]||'');if(!/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(src)||src.length>6*1024*1024)throw exerr(st('INVALID_PARAMETER',0xC000000D),'Rich Edit images must be Base64 image Data URLs <= 6 MiB.');n.focus();try{return !!document.execCommand('insertImage',false,src);}catch(e){return false;}}
 if(method==='SetReadOnly'){n=ctrl(ctx,args[0]);n.contentEditable=args[1]?'false':'true';n.setAttribute('aria-readonly',args[1]?'true':'false');return true;}
 if(method==='GetState'){n=ctrl(ctx,args[0]);r=selectionOffsets(n);return{readOnly:n.contentEditable==='false',textLength:String(n.innerText||'').length,htmlLength:String(n.innerHTML||'').length,selection:r};}
 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported Rich Edit API: '+method);
}
global.jplopsoft_RICHEDIT=API;global.jplopsoft_richeditDispatch=dispatch;
})(window);
