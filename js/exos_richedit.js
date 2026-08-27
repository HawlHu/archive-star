/* ExOS riched20.xdl / msftedit.xdl emulation
 * Version: 6.4.0-dev-os86
 * Model: EXOS_RICHEDIT_V4
 */
(function(global){'use strict';
var API={version:'6.4.0-dev-os86',model:'EXOS_RICHEDIT_V4',ready:true};
function exerr(s,m){if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,m);var e=new Error(m);e.ntstatus=s;return e;}
function st(n,d){var k='jplopsoft_STATUS_'+n;return typeof global[k]!=='undefined'?global[k]:d;}
function ctrl(ctx,id){var n=ctx&&ctx.controls?ctx.controls[String(id||'')]:null;if(!n||n.getAttribute('data-exos-rich-edit')!=='1')throw exerr(st('INVALID_HANDLE',0xC0000008),'Rich Edit control not found.');return n;}
function sanitize(h){return typeof global.jplopsoft_xshSanitizeRichHtml==='function'?global.jplopsoft_xshSanitizeRichHtml(h):String(h||'');}
function textNodes(root){var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),a=[],n;while((n=w.nextNode()))a.push(n);return a;}
function selectionOffsets(n){var sel=window.getSelection(),out={start:0,end:0};if(!sel||!sel.rangeCount)return out;var r=sel.getRangeAt(0);if(!n.contains(r.startContainer)||!n.contains(r.endContainer))return out;var pre=document.createRange();pre.selectNodeContents(n);pre.setEnd(r.startContainer,r.startOffset);out.start=pre.toString().length;pre=document.createRange();pre.selectNodeContents(n);pre.setEnd(r.endContainer,r.endOffset);out.end=pre.toString().length;return out;}
function setSelection(n,start,end){start=Math.max(0,parseInt(start,10)||0);end=Math.max(start,parseInt(end,10)||start);var nodes=textNodes(n),range=document.createRange(),sel=window.getSelection(),pos=0,sn=n,so=0,en=n,eo=0,foundS=false,foundE=false,i,t,l;for(i=0;i<nodes.length;i++){t=nodes[i];l=t.nodeValue.length;if(!foundS&&start<=pos+l){sn=t;so=start-pos;foundS=true;}if(!foundE&&end<=pos+l){en=t;eo=end-pos;foundE=true;break;}pos+=l;}if(!foundS){sn=n;so=n.childNodes.length;}if(!foundE){en=n;eo=n.childNodes.length;}range.setStart(sn,so);range.setEnd(en,eo);sel.removeAllRanges();sel.addRange(range);n.focus();return true;}
function exec(n,cmd,val){var allow={bold:1,italic:1,underline:1,strikethrough:1,forecolor:1,backcolor:1,hilitecolor:1,fontname:1,fontsize:1,formatblock:1,justifyleft:1,justifycenter:1,justifyright:1,justifyfull:1,insertorderedlist:1,insertunorderedlist:1,indent:1,outdent:1,createlink:1,unlink:1,inserthorizontalrule:1,removeformat:1,undo:1,redo:1,selectall:1};cmd=String(cmd||'').toLowerCase();if(!allow[cmd])throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Rich Edit command is not exposed: '+cmd);n.focus();try{return !!document.execCommand(cmd,false,val===undefined?null:String(val));}catch(e){return false;}}

function richState(n){if(!n.__exosRichState)n.__exosRichState={modified:false,textLimit:0,backgroundColor:'',hideSelection:false,firstVisibleLine:0};return n.__exosRichState;}
function lineInfo(n){var tx=String(n.innerText||''),lines=tx.split(/\r?\n/),starts=[],p=0,i;for(i=0;i<lines.length;i++){starts.push(p);p+=lines[i].length+1;}return{text:tx,lines:lines,starts:starts};}
function setModified(n,v){richState(n).modified=!!v;return true;}
function limitText(n,value){
  var text=String(value===undefined?'':value),lim=richState(n).textLimit;
  return lim>0?text.substring(0,lim):text;
}
function ensureCommandState(n,cmd,want){
  want=!!want;n.focus();
  var cur=false;
  try{cur=!!document.queryCommandState(cmd);}catch(ignoreState){}
  if(cur!==want)return exec(n,cmd);
  return true;
}

async function dispatch(ctx,method,args){args=args||[];method=String(method||'');var n,r;
 if(method==='GetVersion')return{version:API.version,model:API.model,backend:'contenteditable host control',compatibility:'RICHEDIT50W_SEMANTIC_V4'};
 if(method==='CreateRichEdit'){if(typeof global.jplopsoft_xshCreateControl!=='function')throw exerr(st('NOT_SUPPORTED',0xC00000BB),'USER32 control host unavailable.');var spec=args[1]||{};spec.type='richedit';return global.jplopsoft_xshCreateControl(ctx,args[0],spec);}
 if(method==='SetText'){n=ctrl(ctx,args[0]);n.textContent=limitText(n,args[1]);setModified(n,true);return true;}
 if(method==='GetText'){return String(ctrl(ctx,args[0]).innerText||'');}
 if(method==='SetHTML'){n=ctrl(ctx,args[0]);var setSafe=sanitize(args[1]),setLim=richState(n).textLimit;if(setLim>0){var setTmp=document.createElement('div');setTmp.innerHTML=setSafe;if(String(setTmp.innerText||setTmp.textContent||'').length>setLim)n.textContent=String(setTmp.innerText||setTmp.textContent||'').substring(0,setLim);else n.innerHTML=setSafe;}else n.innerHTML=setSafe;setModified(n,true);return true;}
 if(method==='GetHTML'){n=ctrl(ctx,args[0]);n.innerHTML=sanitize(n.innerHTML);return n.innerHTML;}
 if(method==='ExecCommand'){return exec(ctrl(ctx,args[0]),args[1],args[2]);}
 if(method==='GetSelection'||method==='EM_GETSEL'||method==='EM_EXGETSEL'){return selectionOffsets(ctrl(ctx,args[0]));}
 if(method==='SetSelection'||method==='EM_SETSEL'||method==='EM_EXSETSEL'){return setSelection(ctrl(ctx,args[0]),args[1],args[2]);}
 if(method==='EM_LINEFROMCHAR'){n=ctrl(ctx,args[0]);var lii=lineInfo(n),cp=args[1]===undefined?selectionOffsets(n).start:Math.max(0,Number(args[1])||0),ln=0;for(var lx=0;lx<lii.starts.length;lx++){if(lii.starts[lx]<=cp)ln=lx;else break;}return ln;}
 if(method==='EM_LINEINDEX'){n=ctrl(ctx,args[0]);lii=lineInfo(n);var lno=Number(args[1]);if(lno<0)lno=await dispatch(ctx,'EM_LINEFROMCHAR',[args[0]]);return lno>=0&&lno<lii.starts.length?lii.starts[lno]:-1;}
 if(method==='EM_LINELENGTH'){n=ctrl(ctx,args[0]);lii=lineInfo(n);cp=args[1]===undefined?selectionOffsets(n).start:Math.max(0,Number(args[1])||0);ln=0;for(lx=0;lx<lii.starts.length;lx++){if(lii.starts[lx]<=cp)ln=lx;else break;}return lii.lines[ln]?lii.lines[ln].length:0;}
 if(method==='InsertText'){n=ctrl(ctx,args[0]);n.focus();var txt=String(args[1]===undefined?'':args[1]),lim=richState(n).textLimit,remain=lim>0?Math.max(0,lim-String(n.innerText||'').length):txt.length;if(lim>0)txt=txt.substring(0,remain);try{document.execCommand('insertText',false,txt);setModified(n,true);return true;}catch(e){return false;}}
 if(method==='InsertHTML'){n=ctrl(ctx,args[0]);n.focus();var safe=sanitize(args[1]),ilim=richState(n).textLimit;if(ilim>0){var itmp=document.createElement('div');itmp.innerHTML=safe;var iplain=String(itmp.innerText||itmp.textContent||''),isel=selectionOffsets(n),irem=Math.max(0,ilim-(String(n.innerText||'').length-Math.max(0,isel.end-isel.start)));if(iplain.length>irem){safe='';try{document.execCommand('insertText',false,iplain.substring(0,irem));setModified(n,true);return true;}catch(ie){return false;}}}try{var ok=!!document.execCommand('insertHTML',false,safe);if(ok)setModified(n,true);return ok;}catch(e){return false;}}
 if(method==='InsertImage'){n=ctrl(ctx,args[0]);var src=String(args[1]||'');if(!/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(src)||src.length>6*1024*1024)throw exerr(st('INVALID_PARAMETER',0xC000000D),'Rich Edit images must be Base64 image Data URLs <= 6 MiB.');n.focus();try{var ok2=!!document.execCommand('insertImage',false,src);if(ok2)setModified(n,true);return ok2;}catch(e){return false;}}
 if(method==='SetReadOnly'){n=ctrl(ctx,args[0]);n.contentEditable=args[1]?'false':'true';n.setAttribute('aria-readonly',args[1]?'true':'false');return true;}
 if(method==='GetState'){n=ctrl(ctx,args[0]);r=selectionOffsets(n);var rs=richState(n);return{readOnly:n.contentEditable==='false',textLength:String(n.innerText||'').length,htmlLength:String(n.innerHTML||'').length,selection:r,modified:!!rs.modified,textLimit:rs.textLimit,backgroundColor:rs.backgroundColor};}
 if(method==='GetModify'||method==='EM_GETMODIFY')return !!richState(ctrl(ctx,args[0])).modified;
 if(method==='SetModify'||method==='EM_SETMODIFY')return setModified(ctrl(ctx,args[0]),args[1]);
 if(method==='SetTextLimit'||method==='EM_EXLIMITTEXT'||method==='EM_LIMITTEXT'){n=ctrl(ctx,args[0]);richState(n).textLimit=Math.max(0,Number(args[1])||0);return true;}
 if(method==='GetTextLimit'){return richState(ctrl(ctx,args[0])).textLimit;}
 if(method==='SetBackgroundColor'||method==='EM_SETBKGNDCOLOR'){n=ctrl(ctx,args[0]);var bc=String(args[1]||'');n.style.backgroundColor=bc;richState(n).backgroundColor=bc;return true;}
 if(method==='HideSelection'||method==='EM_HIDESELECTION'){n=ctrl(ctx,args[0]);richState(n).hideSelection=!!args[1];return true;}
 if(method==='ScrollCaret'||method==='EM_SCROLLCARET'){n=ctrl(ctx,args[0]);try{n.scrollIntoView({block:'nearest'});}catch(ignoreScroll){}return true;}
 if(method==='GetFirstVisibleLine'||method==='EM_GETFIRSTVISIBLELINE')return richState(ctrl(ctx,args[0])).firstVisibleLine||0;
 if(method==='EM_SETTEXTEX'){return await dispatch(ctx,'SetText',[args[0],args[1]&&args[1].text!==undefined?args[1].text:args[1]]);}
 if(method==='EM_GETTEXTEX'){return await dispatch(ctx,'GetText',[args[0]]);}

 if(method==='GetTextLength'||method==='EM_GETTEXTLENGTHEX'){return String(ctrl(ctx,args[0]).innerText||'').length;}
 if(method==='GetLineCount'){var tx=String(ctrl(ctx,args[0]).innerText||'');return tx===''?1:tx.split(/\r?\n/).length;}
 if(method==='GetLine'){tx=String(ctrl(ctx,args[0]).innerText||'');var lines=tx.split(/\r?\n/),li=Math.max(0,Number(args[1])|0);return li<lines.length?lines[li]:'';}
 if(method==='FindText'||method==='EM_FINDTEXTEX'){n=ctrl(ctx,args[0]);tx=String(n.innerText||'');var needle=String(args[1]||''),opt=args[2]||{},from=Math.max(0,Number(opt.start)||0),hay=opt.matchCase?tx:tx.toLowerCase(),nd=opt.matchCase?needle:needle.toLowerCase(),ix=opt.reverse?hay.lastIndexOf(nd,from||hay.length):hay.indexOf(nd,from);return ix<0?{found:false,start:-1,end:-1}:{found:true,start:ix,end:ix+needle.length};}
 if(method==='ReplaceSelection'||method==='EM_REPLACESEL'){n=ctrl(ctx,args[0]);n.focus();var rep=String(args[1]===undefined?'':args[1]),rlim=richState(n).textLimit,rsel=selectionOffsets(n);if(rlim>0){var rrem=Math.max(0,rlim-(String(n.innerText||'').length-Math.max(0,rsel.end-rsel.start)));rep=rep.substring(0,rrem);}try{document.execCommand('insertText',false,rep);setModified(n,true);return true;}catch(e){return false;}}
 if(method==='SelectAll'){n=ctrl(ctx,args[0]);n.focus();return exec(n,'selectall');}
 if(method==='CanUndo'||method==='EM_CANUNDO'){n=ctrl(ctx,args[0]);try{return !!document.queryCommandEnabled('undo');}catch(e){return false;}}
 if(method==='CanRedo'){n=ctrl(ctx,args[0]);try{return !!document.queryCommandEnabled('redo');}catch(e){return false;}}
 if(method==='Undo'||method==='EM_UNDO')return exec(ctrl(ctx,args[0]),'undo');
 if(method==='Redo')return exec(ctrl(ctx,args[0]),'redo');
 if(method==='SetCharFormat'||method==='EM_SETCHARFORMAT'){n=ctrl(ctx,args[0]);var f=args[1]||{};if(f.bold!==undefined)ensureCommandState(n,'bold',f.bold);if(f.italic!==undefined)ensureCommandState(n,'italic',f.italic);if(f.underline!==undefined)ensureCommandState(n,'underline',f.underline);if(f.strikeout!==undefined)ensureCommandState(n,'strikethrough',f.strikeout);if(f.color)exec(n,'forecolor',f.color);if(f.backgroundColor)exec(n,'hilitecolor',f.backgroundColor);if(f.faceName)exec(n,'fontname',f.faceName);if(f.size)exec(n,'fontsize',Math.max(1,Math.min(7,Math.round(Number(f.size)/3)||3)));setModified(n,true);return true;}
 if(method==='SetParaFormat'||method==='EM_SETPARAFORMAT'){n=ctrl(ctx,args[0]);var pf=args[1]||{},al=String(pf.alignment||'').toLowerCase();if(al==='center')exec(n,'justifycenter');else if(al==='right')exec(n,'justifyright');else if(al==='justify')exec(n,'justifyfull');else if(al)exec(n,'justifyleft');if(pf.bullet===true)exec(n,'insertunorderedlist');if(pf.numbered===true)exec(n,'insertorderedlist');if(pf.indent>0)exec(n,'indent');if(pf.indent<0)exec(n,'outdent');return true;}
 if(method==='StreamIn'||method==='EM_STREAMIN'){n=ctrl(ctx,args[0]);var fmt=String(args[1]||'TEXT').toUpperCase(),content=args[2];if(fmt==='HTML'){var sh=sanitize(content),limh=richState(n).textLimit;if(limh>0){var tmp=document.createElement('div');tmp.innerHTML=sh;if(String(tmp.innerText||'').length>limh){n.textContent=String(tmp.innerText||'').substring(0,limh);}else n.innerHTML=sh;}else n.innerHTML=sh;setModified(n,true);return true;}n.textContent=limitText(n,content);setModified(n,true);return true;}
 if(method==='StreamOut'||method==='EM_STREAMOUT'){n=ctrl(ctx,args[0]);fmt=String(args[1]||'TEXT').toUpperCase();return fmt==='HTML'?sanitize(n.innerHTML):String(n.innerText||'');}
 if(method==='GetEventMask'||method==='EM_GETEVENTMASK'){n=ctrl(ctx,args[0]);return Number(n.__exosRichEventMask||0);}
 if(method==='SetEventMask'||method==='EM_SETEVENTMASK'){n=ctrl(ctx,args[0]);var om=Number(n.__exosRichEventMask||0);n.__exosRichEventMask=Number(args[1])>>>0;return om;}
 if(method==='GetOptions'){n=ctrl(ctx,args[0]);return{readOnly:n.contentEditable==='false',spellcheck:!!n.spellcheck,wordWrap:String(n.style.whiteSpace||'')!=='pre'};}

 throw exerr(st('NOT_SUPPORTED',0xC00000BB),'Unsupported Rich Edit API: '+method);
}
global.jplopsoft_RICHEDIT=API;global.jplopsoft_richeditDispatch=dispatch;
})(window);
