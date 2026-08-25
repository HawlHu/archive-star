/* ExOS NT Kernel BugCheck Runtime
 * Version: 6.4.0-dev-os70
 * Model: EXOS_NTOSKRNL_BUGCHECK_V1
 * Client: V8-only browsers
 *
 * KeBugCheck / KeBugCheckEx are kernel-fatal paths. The renderer bypasses
 * USER32, DWM, WinUI and common controls and writes directly to a fixed DOM
 * surface, analogous to a minimal boot-video/frame-buffer path.
 */
(function(global){
'use strict';

var KERNEL={
  version:'6.4.0-dev-os70',
  model:'EXOS_NTOSKRNL_BUGCHECK_V1',
  ready:true,
  vmm:{
    model:'EXOS_VMM_V1',
    addressBits:47,
    virtualAddressBytes:Math.pow(2,47),
    pageSize:4096,
    allocationGranularity:65536,
    pagefilePath:'C:\\pagefile.sys'
  },
  bugcheck:{
    active:false,
    code:0,
    parameters:[0,0,0,0],
    reason:'',
    timestamp:'',
    sequence:0,
    stack:''
  }
};

var BUGCHECK_NAMES={
  0x0000000A:'IRQL_NOT_LESS_OR_EQUAL',
  0x0000001E:'KMODE_EXCEPTION_NOT_HANDLED',
  0x00000024:'NTFS_FILE_SYSTEM',
  0x0000003B:'SYSTEM_SERVICE_EXCEPTION',
  0x00000050:'PAGE_FAULT_IN_NONPAGED_AREA',
  0x0000007E:'SYSTEM_THREAD_EXCEPTION_NOT_HANDLED',
  0x0000007F:'UNEXPECTED_KERNEL_MODE_TRAP',
  0x000000D1:'DRIVER_IRQL_NOT_LESS_OR_EQUAL',
  0x00000109:'CRITICAL_STRUCTURE_CORRUPTION',
  0x00000139:'KERNEL_SECURITY_CHECK_FAILURE',
  0xE0000001:'EXOS_KERNEL_INVARIANT_FAILURE',
  0xE0000002:'EXOS_EXFS_FATAL_IO_FAILURE',
  0xE0000003:'EXOS_DRIVER_FATAL_ERROR'
};

function u32(v){
  var n=Number(v);
  if(!isFinite(n))n=0;
  return n>>>0;
}

function hex(v){
  return '0x'+('00000000'+u32(v).toString(16).toUpperCase()).slice(-8);
}

function codeName(code){
  return BUGCHECK_NAMES[u32(code)]||'EXOS_KERNEL_BUGCHECK';
}

function safeStack(){
  try{
    var e=new Error('KeBugCheckEx');
    return String(e.stack||'').substring(0,8192);
  }catch(ignore){return'';}
}

function freezeKernel(){
  global.jplopsoft_KERNEL_BUGCHECK_ACTIVE=true;
  try{
    if(typeof global.jplopsoft_ntKernelBugCheckFreeze==='function'){
      global.jplopsoft_ntKernelBugCheckFreeze(KERNEL.bugcheck);
    }
  }catch(ignoreFreeze){}
}

function installInputBarrier(surface){
  var stop=function(e){
    try{e.preventDefault();}catch(ignorePrevent){}
    try{e.stopImmediatePropagation();}catch(ignoreImmediate){try{e.stopPropagation();}catch(ignoreStop){}}
    return false;
  };
  ['keydown','keyup','keypress','mousedown','mouseup','mousemove','click','dblclick','contextmenu','wheel','touchstart','touchmove','touchend','dragstart','drop'].forEach(function(type){
    document.addEventListener(type,stop,true);
  });
  surface.__exosBugcheckStop=stop;
}

function addLine(parent,text,style){
  var d=document.createElement('div');
  d.textContent=String(text||'');
  if(style)d.style.cssText=style;
  parent.appendChild(d);
  return d;
}

function renderBugCheck(){
  var old=document.getElementById('jplopsoft_exos_bugcheck_surface');
  if(old&&old.parentNode)old.parentNode.removeChild(old);

  var surface=document.createElement('div');
  surface.id='jplopsoft_exos_bugcheck_surface';
  surface.setAttribute('role','alert');
  surface.setAttribute('aria-live','assertive');
  surface.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0078d7;color:#fff;overflow:auto;box-sizing:border-box;padding:8vh 8vw 6vh;font-family:Consolas,"Courier New",monospace;font-size:clamp(14px,1.45vw,23px);line-height:1.46;cursor:none;';

  addLine(surface,':(','font-family:Segoe UI,Arial,sans-serif;font-weight:300;font-size:clamp(64px,9vw,140px);line-height:1;margin:0 0 4vh;');
  addLine(surface,'ExOS 發生核心層致命錯誤。為避免 ExFS 或其他系統狀態進一步損毀，核心已停止執行。','font-family:Segoe UI,Arial,sans-serif;font-size:clamp(18px,2vw,32px);line-height:1.35;margin-bottom:3vh;max-width:1100px;');
  addLine(surface,'BUGCHECK: '+codeName(KERNEL.bugcheck.code)+'  ('+hex(KERNEL.bugcheck.code)+')','font-weight:700;margin:18px 0 8px;');
  addLine(surface,'Parameters: '+KERNEL.bugcheck.parameters.map(hex).join(', '));
  addLine(surface,'Sequence: '+KERNEL.bugcheck.sequence+'    Time: '+KERNEL.bugcheck.timestamp);
  if(KERNEL.bugcheck.reason)addLine(surface,'Reason: '+KERNEL.bugcheck.reason,'margin-top:10px;');
  addLine(surface,'','height:16px;');
  addLine(surface,'KeBugCheckEx has frozen ExOS message dispatch, XSH event delivery and new ExFS I/O.');
  addLine(surface,'重新載入此頁面才能重新啟動 ExOS。未完成的使用者模式工作不會繼續執行。');

  var detail=document.createElement('pre');
  detail.textContent=KERNEL.bugcheck.stack||'';
  detail.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.38);font:12px/1.35 Consolas,"Courier New",monospace;opacity:.82;max-width:1200px;';
  surface.appendChild(detail);

  (document.body||document.documentElement).appendChild(surface);
  installInputBarrier(surface);
  try{surface.focus();}catch(ignoreFocus){}
}

function bugCheckEx(code,p1,p2,p3,p4,reason){
  if(KERNEL.bugcheck.active)return KERNEL.bugcheck;

  KERNEL.bugcheck.active=true;
  KERNEL.bugcheck.code=u32(code);
  KERNEL.bugcheck.parameters=[u32(p1),u32(p2),u32(p3),u32(p4)];
  KERNEL.bugcheck.reason=String(reason||'');
  KERNEL.bugcheck.timestamp=(new Date()).toISOString();
  KERNEL.bugcheck.sequence++;
  KERNEL.bugcheck.stack=safeStack();

  freezeKernel();
  renderBugCheck();
  return KERNEL.bugcheck;
}

function bugCheck(code){
  return bugCheckEx(code,0,0,0,0,'');
}

function queryBugCheck(){
  return {
    active:KERNEL.bugcheck.active,
    code:KERNEL.bugcheck.code,
    codeName:codeName(KERNEL.bugcheck.code),
    parameters:KERNEL.bugcheck.parameters.slice(),
    reason:KERNEL.bugcheck.reason,
    timestamp:KERNEL.bugcheck.timestamp,
    sequence:KERNEL.bugcheck.sequence
  };
}


function queryVmm(pid){
  var p=null;
  try{
    if(pid&&typeof global.jplopsoft_ntKernelProcessByPid==='function'){
      p=global.jplopsoft_ntKernelProcessByPid(parseInt(pid,10)||0);
    }
    if(typeof global.jplopsoft_vmmGlobalStatus==='function'){
      return global.jplopsoft_vmmGlobalStatus(p);
    }
  }catch(ignoreVmmQuery){}
  return{
    model:KERNEL.vmm.model,
    available:false,
    addressBits:KERNEL.vmm.addressBits,
    virtualAddressBytes:KERNEL.vmm.virtualAddressBytes,
    pageSize:KERNEL.vmm.pageSize,
    allocationGranularity:KERNEL.vmm.allocationGranularity,
    pagefilePath:KERNEL.vmm.pagefilePath
  };
}

global.jplopsoft_NTOSKRNL=KERNEL;
global.jplopsoft_KeBugCheck=bugCheck;
global.jplopsoft_KeBugCheckEx=bugCheckEx;
global.jplopsoft_QueryBugCheck=queryBugCheck;
global.jplopsoft_QueryVmm=queryVmm;

})(window);
