/* ExOS NT Kernel BugCheck Runtime
 * Version: 6.4.0-dev-os84
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
  version:'6.4.0-dev-os84',
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



/* -------------------------------------------------------------------------
 * os84 NT semantic compatibility facade for XSH.
 *
 * Real Windows user-mode code cannot directly call arbitrary ntoskrnl exports.
 * ExOS intentionally exposes a brokered subset so XSH can model NT objects
 * without receiving a host pointer, DOM object, raw kernel object or IRQL
 * privilege. All returned object identifiers are process-local handles.
 * ---------------------------------------------------------------------- */
function ntStatus(name,fallback){
  var k='jplopsoft_STATUS_'+name;
  return typeof global[k]!=='undefined'?global[k]:fallback;
}
function ntError(name,fallback,message){
  var s=ntStatus(name,fallback);
  if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(s,message);
  var e=new Error(message);e.ntstatus=s;return e;
}
function ntState(ctx){
  if(!ctx.ntoskrnlCompat)ctx.ntoskrnlCompat={next:0xF000,objects:{}};
  return ctx.ntoskrnlCompat;
}
function ntAlloc(ctx,type,record){
  var s=ntState(ctx),h=s.next++;
  record=record||{};record.handle=h;record.type=type;record.ownerPid=parseInt(ctx.pid,10)||0;
  s.objects[String(h)]=record;return h;
}
function ntObject(ctx,h,type){
  var o=ntState(ctx).objects[String(parseInt(h,10)||0)]||null;
  if(!o||(type&&o.type!==type))throw ntError('INVALID_HANDLE',0xC0000008,'Invalid NT kernel object handle.');
  return o;
}
function ntTime(){
  var unixMs=Date.now(),fileMs=unixMs+11644473600000, ticks=fileMs*10000,
      high=Math.floor(ticks/4294967296),low=ticks-high*4294967296;
  return{unixMilliseconds:unixMs,fileTimeLow:low>>>0,fileTimeHigh:high>>>0,iso:(new Date(unixMs)).toISOString()};
}
function ntProcessInfo(p){
  if(!p)return null;
  return{
    pid:parseInt(p.pid,10)||0,ppid:parseInt(p.ppid,10)||0,
    imageName:String(p.imageName||p.name||''),imagePath:String(p.imagePath||''),
    username:String(p.username||''),sid:String(p.sid||''),integrity:String(p.integrity||''),
    protection:String(p.protection||''),critical:!!p.critical,kernel:!!p.kernel,alive:p.alive!==false,
    subsystem:String(p.imageSubsystemName||''),generation:Number(p.generation)||0
  };
}
function ntTryAcquire(ctx,o){
  var pid=parseInt(ctx.pid,10)||0;
  if(o.type==='KEVENT'){
    if(!o.signaled)return false;
    if(!o.manualReset)o.signaled=false;
    return true;
  }
  if(o.type==='KSEMAPHORE'){
    if(o.count<=0)return false;o.count--;return true;
  }
  if(o.type==='KMUTEX'){
    if(o.ownerPid===0||o.ownerPid===pid){o.ownerPid=pid;o.recursion=(o.recursion||0)+1;return true;}
    return false;
  }
  if(o.type==='KTIMER'){
    if(!o.signaled)return false;o.signaled=false;return true;
  }
  return false;
}
function ntWait(ctx,h,timeoutMs){
  var o=ntObject(ctx,h),timeout=Number(timeoutMs),start=Date.now();
  if(!isFinite(timeout)||timeout<0)timeout=24*60*60*1000;
  if(ntTryAcquire(ctx,o))return Promise.resolve({status:'STATUS_SUCCESS',signaled:true,waitMilliseconds:0});
  if(timeout===0)return Promise.resolve({status:'STATUS_TIMEOUT',signaled:false,waitMilliseconds:0});
  return new Promise(function(resolve){
    function poll(){
      if(!ctx||ctx.terminating){resolve({status:'STATUS_PROCESS_IS_TERMINATING',signaled:false,waitMilliseconds:Date.now()-start});return;}
      try{if(ntTryAcquire(ctx,o)){resolve({status:'STATUS_SUCCESS',signaled:true,waitMilliseconds:Date.now()-start});return;}}catch(e){resolve({status:'STATUS_INVALID_HANDLE',signaled:false,waitMilliseconds:Date.now()-start});return;}
      if(Date.now()-start>=timeout){resolve({status:'STATUS_TIMEOUT',signaled:false,waitMilliseconds:Date.now()-start});return;}
      global.setTimeout(poll,Math.min(10,Math.max(1,timeout-(Date.now()-start))));
    }
    global.setTimeout(poll,1);
  });
}
function ntCancelTimer(o){
  if(!o)return;
  if(o.timeoutId){try{global.clearTimeout(o.timeoutId);}catch(ignore){}o.timeoutId=0;}
  if(o.intervalId){try{global.clearInterval(o.intervalId);}catch(ignore2){}o.intervalId=0;}
}
function ntArmTimer(o,dueMs,periodMs){
  ntCancelTimer(o);o.signaled=false;o.dueMs=Math.max(0,Number(dueMs)||0);o.periodMs=Math.max(0,Number(periodMs)||0);
  o.timeoutId=global.setTimeout(function(){
    o.signaled=true;o.timeoutId=0;
    if(o.periodMs>0)o.intervalId=global.setInterval(function(){o.signaled=true;},o.periodMs);
  },o.dueMs);
}
async function ntDispatch(ctx,method,args){
  args=args||[];method=String(method||'');var o,p,h,info;
  if(method==='GetVersion')return{version:KERNEL.version,model:KERNEL.model,compatibility:'EXOS_NT_KERNEL_SEMANTIC_V2',previousMode:'UserMode',maxIrql:'PASSIVE_LEVEL'};
  if(method==='QueryBugCheck')return queryBugCheck();
  if(method==='QueryVmm')return queryVmm(args[0]||ctx.pid);
  if(method==='KeQuerySystemTime'||method==='KeQuerySystemTimePrecise')return ntTime();
  if(method==='KeQueryPerformanceCounter')return{counter:Math.floor((global.performance&&performance.now?performance.now():Date.now())*1000),frequency:1000000};
  if(method==='KeQueryTimeIncrement')return 156250;
  if(method==='KeGetCurrentIrql')return 0;
  if(method==='ExGetPreviousMode')return'UserMode';
  if(method==='PsGetCurrentProcessId')return parseInt(ctx.pid,10)||0;
  if(method==='PsGetCurrentProcess')return{pseudoHandle:-1,process:ntProcessInfo(ctx.process)};
  if(method==='PsLookupProcessByProcessId'){
    p=typeof global.jplopsoft_ntKernelProcessByPid==='function'?global.jplopsoft_ntKernelProcessByPid(args[0]):null;
    if(!p)throw ntError('INVALID_CID',0xC000000B,'Process ID does not exist.');return ntProcessInfo(p);
  }
  if(method==='ZwQuerySystemInformation'||method==='NtQuerySystemInformation'){
    if(typeof global.jplopsoft_NtQuerySystemInformation!=='function')throw ntError('NOT_SUPPORTED',0xC00000BB,'NtQuerySystemInformation broker unavailable.');
    return global.jplopsoft_NtQuerySystemInformation(String(args[0]||'SystemProcessInformation'));
  }
  if(method==='KeDelayExecutionThread'){
    var ms=Math.max(0,Math.min(600000,Number(args[0])||0));
    await new Promise(function(resolve){global.setTimeout(resolve,ms);});return{status:'STATUS_SUCCESS',milliseconds:ms};
  }
  if(method==='KeInitializeEvent'||method==='ExCreateEvent')return ntAlloc(ctx,'KEVENT',{manualReset:String(args[0]||'NotificationEvent')!=='SynchronizationEvent'&&args[0]!==false,signaled:!!args[1]});
  if(method==='KeSetEvent'){o=ntObject(ctx,args[0],'KEVENT');var old=o.signaled?1:0;o.signaled=true;return old;}
  if(method==='KeResetEvent'){o=ntObject(ctx,args[0],'KEVENT');old=o.signaled?1:0;o.signaled=false;return old;}
  if(method==='KeClearEvent'){o=ntObject(ctx,args[0],'KEVENT');o.signaled=false;return true;}
  if(method==='KeReadStateEvent'){return ntObject(ctx,args[0],'KEVENT').signaled?1:0;}
  if(method==='KeInitializeSemaphore')return ntAlloc(ctx,'KSEMAPHORE',{count:Math.max(0,Number(args[0])||0),limit:Math.max(1,Number(args[1])||1)});
  if(method==='KeReleaseSemaphore'){o=ntObject(ctx,args[0],'KSEMAPHORE');old=o.count;o.count=Math.min(o.limit,o.count+Math.max(1,Number(args[1])||1));return old;}
  if(method==='KeReadStateSemaphore')return ntObject(ctx,args[0],'KSEMAPHORE').count;
  if(method==='KeInitializeMutex'||method==='KeInitializeMutant')return ntAlloc(ctx,'KMUTEX',{ownerPid:0,recursion:0});
  if(method==='KeReleaseMutex'||method==='KeReleaseMutant'){o=ntObject(ctx,args[0],'KMUTEX');if(o.ownerPid!==(parseInt(ctx.pid,10)||0))throw ntError('MUTANT_NOT_OWNED',0xC0000046,'Mutant is not owned by this process.');o.recursion=Math.max(0,o.recursion-1);if(!o.recursion)o.ownerPid=0;return true;}
  if(method==='KeInitializeTimer'||method==='KeInitializeTimerEx')return ntAlloc(ctx,'KTIMER',{signaled:false,dueMs:0,periodMs:0,timeoutId:0,intervalId:0});
  if(method==='KeSetTimer'||method==='KeSetTimerEx'){o=ntObject(ctx,args[0],'KTIMER');ntArmTimer(o,args[1],args[2]);return true;}
  if(method==='KeCancelTimer'){o=ntObject(ctx,args[0],'KTIMER');var active=!!(o.timeoutId||o.intervalId);ntCancelTimer(o);o.signaled=false;return active;}
  if(method==='KeReadStateTimer')return ntObject(ctx,args[0],'KTIMER').signaled?1:0;
  if(method==='KeWaitForSingleObject')return await ntWait(ctx,args[0],args[1]);
  if(method==='ObReferenceObjectByHandle'){
    h=parseInt(args[0],10)||0;o=ntState(ctx).objects[String(h)];
    if(o)return{handle:h,type:o.type,ownerPid:o.ownerPid,body:Object.assign({},o,{timeoutId:undefined,intervalId:undefined})};
    if(ctx.handles&&ctx.handles[String(h)]){info=ctx.handles[String(h)];return{handle:h,type:String(info.kind||'HANDLE').toUpperCase(),ownerPid:parseInt(ctx.pid,10)||0};}
    if(typeof global.jplopsoft_ntProcessHandleForOwner==='function'){
      info=global.jplopsoft_ntProcessHandleForOwner(ctx.pid,h);if(info)return{handle:h,type:'PROCESS',ownerPid:parseInt(ctx.pid,10)||0,targetPid:info.pid,desiredAccess:info.desiredAccess};
    }
    throw ntError('INVALID_HANDLE',0xC0000008,'Object handle is invalid.');
  }
  if(method==='ObDereferenceObject'||method==='ZwClose'||method==='NtClose'){
    h=parseInt(args[0],10)||0;o=ntState(ctx).objects[String(h)];if(!o)return false;if(o.type==='KTIMER')ntCancelTimer(o);delete ntState(ctx).objects[String(h)];return true;
  }
  if(method==='KeBugCheck'||method==='KeBugCheckEx')throw ntError('ACCESS_DENIED',0xC0000022,'User-mode XSH cannot invoke KeBugCheck/KeBugCheckEx.');
  if(method==='KeRaiseIrql'||method==='KfRaiseIrql'||method==='KeAcquireSpinLock')throw ntError('NOT_SUPPORTED',0xC00000BB,'XSH executes in UserMode/PASSIVE_LEVEL; raising IRQL or acquiring a kernel spin lock is not exposed.');
  throw ntError('NOT_SUPPORTED',0xC00000BB,'Unsupported ntoskrnl semantic API: '+method);
}
function ntCleanup(ctx){
  var s=ctx&&ctx.ntoskrnlCompat,k,o;if(!s)return;
  for(k in s.objects)if(Object.prototype.hasOwnProperty.call(s.objects,k)){o=s.objects[k];if(o&&o.type==='KTIMER')ntCancelTimer(o);}
  ctx.ntoskrnlCompat=null;
}

global.jplopsoft_NTOSKRNL=KERNEL;
global.jplopsoft_KeBugCheck=bugCheck;
global.jplopsoft_KeBugCheckEx=bugCheckEx;
global.jplopsoft_QueryBugCheck=queryBugCheck;
global.jplopsoft_QueryVmm=queryVmm;
global.jplopsoft_ntoskrnlDispatch=ntDispatch;
global.jplopsoft_ntoskrnlCleanupContext=ntCleanup;

})(window);
