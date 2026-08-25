/* ExOS Media Foundation / Web Audio facade
 * Version: 6.4.0-dev-os70
 * Model: EXOS_MEDIA_FOUNDATION_V1
 *
 * Process-isolated MediaFoundation-style audio API for XSH.  The host owns
 * AudioContext/AudioNode objects; sandbox code only receives opaque handles.
 */
(function(global){
'use strict';

var MF={
  version:'6.4.0-dev-os70',
  model:'EXOS_MEDIA_FOUNDATION_V1',
  ready:true,
  maxHandlesPerProcess:512,
  maxDecodedSourceBytes:48*1024*1024,
  defaultFftSize:2048,
  defaultEq:[60,170,350,1000,3500,10000],
  tables:{},
  nextHandle:0x8000
};

function mfError(status,message){
  if(typeof global.jplopsoft_xshError==='function')return global.jplopsoft_xshError(status,message);
  var e=new Error(String(message||'MediaFoundation error'));e.ntstatus=Number(status)||0;return e;
}
function mfStatus(name,fallback){return typeof global[name]!=='undefined'?global[name]:fallback;}
function mfInvalid(message){throw mfError(mfStatus('jplopsoft_STATUS_INVALID_PARAMETER',0xC000000D),message||'Invalid MediaFoundation parameter.');}
function mfBadHandle(message){throw mfError(mfStatus('jplopsoft_STATUS_INVALID_HANDLE',0xC0000008),message||'Invalid MediaFoundation handle.');}
function mfQuota(message){throw mfError(mfStatus('jplopsoft_STATUS_QUOTA_EXCEEDED',0xC0000044),message||'MediaFoundation quota exceeded.');}
function mfNotSupported(message){throw mfError(mfStatus('jplopsoft_STATUS_NOT_SUPPORTED',0xC00000BB),message||'MediaFoundation feature is not supported.');}
function mfClamp(v,a,b,d){v=Number(v);if(!isFinite(v))v=d;return Math.max(a,Math.min(b,v));}
function mfPid(ctx){return parseInt(ctx&&ctx.pid,10)||0;}
function mfTable(ctx){
  var pid=mfPid(ctx),key=String(pid),t;
  if(!pid)mfBadHandle('MediaFoundation requires a live XSH process.');
  t=MF.tables[key];
  if(!t){t={pid:pid,handles:{},count:0};MF.tables[key]=t;}
  return t;
}
function mfAlloc(ctx,rec){
  var t=mfTable(ctx),h;
  if(t.count>=MF.maxHandlesPerProcess)mfQuota('Too many MediaFoundation handles in this process.');
  h=MF.nextHandle++;
  if(MF.nextHandle>0xEFFFFFFF)MF.nextHandle=0x8000;
  while(t.handles[String(h)])h=MF.nextHandle++;
  rec.handle=h;rec.pid=t.pid;t.handles[String(h)]=rec;t.count++;
  return h;
}
function mfGet(ctx,h,kind){
  var t=mfTable(ctx),r=t.handles[String(parseInt(h,10)||0)]||null;
  if(!r||(kind&&r.kind!==kind))mfBadHandle('Invalid '+(kind||'media')+' handle.');
  return r;
}
function mfRemove(ctx,h){
  var t=mfTable(ctx),k=String(parseInt(h,10)||0),r=t.handles[k];
  if(!r)return false;
  delete t.handles[k];t.count=Math.max(0,t.count-1);return r;
}
function mfAudioContextCtor(){return global.AudioContext||global.webkitAudioContext||null;}
function mfCreateAudioContext(options){
  var C=mfAudioContextCtor();
  if(!C)mfNotSupported('Web Audio API AudioContext is unavailable.');
  options=options||{};
  try{return new C(options.sampleRate?{sampleRate:mfClamp(options.sampleRate,8000,192000,48000)}:undefined);}
  catch(e){try{return new C();}catch(e2){mfNotSupported('AudioContext creation failed: '+String(e2&&e2.message?e2.message:e2));}}
}
function mfConfigureAnalyser(a,options){
  options=options||{};
  var fft=parseInt(options.fftSize,10)||MF.defaultFftSize,pow=32;
  while(pow<fft&&pow<32768)pow*=2;
  a.fftSize=Math.max(32,Math.min(32768,pow));
  a.minDecibels=mfClamp(options.minDecibels,-160,-10,-100);
  a.maxDecibels=mfClamp(options.maxDecibels,-100,10,-30);
  if(a.minDecibels>=a.maxDecibels){a.minDecibels=-100;a.maxDecibels=-30;}
  a.smoothingTimeConstant=mfClamp(options.smoothing,0,1,0.8);
}
function mfMakeSession(ctx,options){
  var ac=mfCreateAudioContext(options),master=ac.createGain(),an=ac.createAnalyser(),h,rec;
  mfConfigureAnalyser(an,options||{});
  master.gain.value=1;
  master.connect(an);an.connect(ac.destination);
  rec={kind:'session',audio:ac,master:master,analyser:an,tracks:{},createdAt:Date.now(),closed:false};
  h=mfAlloc(ctx,rec);rec.handle=h;return rec;
}
function mfSession(ctx,h){return mfGet(ctx,h,'session');}
function mfTrack(ctx,h){return mfGet(ctx,h,'track');}
function mfEqType(i){if(i===0)return'lowshelf';if(i===MF.defaultEq.length-1)return'highshelf';return'peaking';}
function mfBuildTrackChain(track){
  var ac=track.session.audio,i,f;
  track.input=ac.createGain();track.input.gain.value=track.volume;
  track.panner=typeof ac.createStereoPanner==='function'?ac.createStereoPanner():null;
  if(track.panner)track.panner.pan.value=track.pan;
  track.eq=[];
  for(i=0;i<track.eqSpec.length;i++){
    f=ac.createBiquadFilter();
    f.type=track.eqSpec[i].type;f.frequency.value=track.eqSpec[i].frequency;f.Q.value=track.eqSpec[i].Q;f.gain.value=track.eqSpec[i].gain;
    track.eq.push(f);
  }
  track.analyser=ac.createAnalyser();mfConfigureAnalyser(track.analyser,track.analyserOptions||{});
  var node=track.input;
  if(track.panner){node.connect(track.panner);node=track.panner;}
  for(i=0;i<track.eq.length;i++){node.connect(track.eq[i]);node=track.eq[i];}
  node.connect(track.analyser);track.analyser.connect(track.session.master);
}
function mfDisconnectNode(n){try{if(n&&typeof n.disconnect==='function')n.disconnect();}catch(ignore){}}
function mfStopSource(track){
  var s=track.sourceNode;track.sourceNode=null;
  if(s){try{track.ignoreEnded=true;s.stop();}catch(ignore){}mfDisconnectNode(s);}
}
function mfPosition(track){
  var p=Number(track.offset)||0;
  if(track.state==='playing'&&track.sourceNode){p+=(track.session.audio.currentTime-track.startedAt)*track.playbackRate;}
  if(track.buffer&&track.loop&&track.buffer.duration>0)p=p%track.buffer.duration;
  if(track.buffer&&!track.loop)p=Math.max(0,Math.min(track.buffer.duration,p));
  return p;
}
async function mfEnsureRunning(session){
  if(session.closed)mfBadHandle('Audio session is closed.');
  if(session.audio.state==='suspended'&&typeof session.audio.resume==='function'){
    try{await session.audio.resume();}catch(e){throw mfError(mfStatus('jplopsoft_STATUS_ACCESS_DENIED',0xC0000022),'Audio playback requires a browser user activation.');}
  }
}
function mfStartTrack(track,offset){
  var ac=track.session.audio,src=ac.createBufferSource();
  src.buffer=track.buffer;src.loop=!!track.loop;src.playbackRate.value=track.playbackRate;
  src.connect(track.input);track.sourceNode=src;track.ignoreEnded=false;track.startedAt=ac.currentTime;track.offset=Math.max(0,Math.min(track.buffer.duration,Number(offset)||0));
  src.onended=function(){
    if(track.ignoreEnded)return;
    if(track.state==='playing'){
      track.offset=track.loop?mfPosition(track):track.buffer.duration;
      track.state=track.loop?'playing':'ended';
      if(!track.loop)track.sourceNode=null;
    }
  };
  src.start(0,track.offset);track.state='playing';
}
function mfArrayBuffer(bytes){
  var u=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);
  return u.buffer.slice(u.byteOffset,u.byteOffset+u.byteLength);
}
async function mfDecode(ac,bytes){
  var ab=mfArrayBuffer(bytes),copy=ab.slice(0),out=ac.decodeAudioData(copy);
  if(out&&typeof out.then==='function')return await out;
  return await new Promise(function(resolve,reject){ac.decodeAudioData(ab,resolve,reject);});
}
async function mfSourceFromPath(ctx,sessionHandle,path,options){
  var session=mfSession(ctx,sessionHandle),p=String(path||''),node,bytes,buffer,track,h,i;
  if(typeof global.jplopsoft_xshResolveC!=='function'||typeof global.jplopsoft_xshReadNodeBytes!=='function')mfNotSupported('ExFS media bridge is unavailable.');
  node=global.jplopsoft_xshResolveC(ctx,p,false);
  if(!node||node.type!=='file')throw mfError(mfStatus('jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND',0xC0000034),'Media source not found: '+p);
  if((parseInt(node.original_size,10)||0)>MF.maxDecodedSourceBytes)mfQuota('Decoded Web Audio source is limited to 48 MiB.');
  bytes=await global.jplopsoft_xshReadNodeBytes(
    node,
    ctx&&ctx.process&&String(ctx.process.integrity||'').toUpperCase()==='LOW'
      ?'XSH_SANDBOX'
      :''
  );
  if(bytes.length>MF.maxDecodedSourceBytes)mfQuota('Decoded Web Audio source is limited to 48 MiB.');
  try{buffer=await mfDecode(session.audio,bytes);}catch(e){throw mfError(mfStatus('jplopsoft_STATUS_INVALID_IMAGE_FORMAT',0xC000007B),'Audio decoder rejected the media source.');}
  options=options||{};
  track={kind:'track',session:session,buffer:buffer,path:p,name:String(global.jplopsoft_decName?global.jplopsoft_decName(node):p),state:'stopped',offset:0,startedAt:0,sourceNode:null,ignoreEnded:false,loop:!!options.loop,volume:mfClamp(options.volume,0,4,1),pan:mfClamp(options.pan,-1,1,0),playbackRate:mfClamp(options.playbackRate,0.25,4,1),analyserOptions:options.analyser||{},eqSpec:[]};
  for(i=0;i<MF.defaultEq.length;i++)track.eqSpec.push({frequency:MF.defaultEq[i],gain:0,Q:1,type:mfEqType(i)});
  mfBuildTrackChain(track);h=mfAlloc(ctx,track);track.handle=h;session.tracks[String(h)]=track;
  return{handle:h,duration:buffer.duration,sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,path:p,name:track.name};
}
function mfSpectrum(analyser,options,wave){
  options=options||{};
  var count=wave?analyser.fftSize:analyser.frequencyBinCount,want=parseInt(options.bins,10)||count,waveFloat=!!options.float,data,i,out=[],step;
  want=Math.max(1,Math.min(count,want));
  if(wave){
    if(waveFloat&&typeof analyser.getFloatTimeDomainData==='function'){data=new Float32Array(count);analyser.getFloatTimeDomainData(data);}else{data=new Uint8Array(count);analyser.getByteTimeDomainData(data);}
  }else if(options.decibels){data=new Float32Array(count);analyser.getFloatFrequencyData(data);}else{data=new Uint8Array(count);analyser.getByteFrequencyData(data);}
  step=count/want;
  for(i=0;i<want;i++)out.push(Number(data[Math.min(count-1,Math.floor(i*step))]));
  return out;
}
function mfHandleInfo(rec){
  if(rec.kind==='session')return{kind:'session',handle:rec.handle,state:rec.audio.state,masterVolume:rec.master.gain.value,tracks:Object.keys(rec.tracks).length,sampleRate:rec.audio.sampleRate};
  if(rec.kind==='track')return{kind:'track',handle:rec.handle,state:rec.state,path:rec.path,duration:rec.buffer.duration,currentTime:mfPosition(rec),loop:rec.loop,volume:rec.volume,pan:rec.pan,playbackRate:rec.playbackRate,sampleRate:rec.buffer.sampleRate,channels:rec.buffer.numberOfChannels};
  return{kind:String(rec.kind||''),handle:rec.handle};
}
function mfCloseRecord(ctx,rec){
  var k,t;
  if(!rec)return false;
  if(rec.kind==='track'){
    mfStopSource(rec);mfDisconnectNode(rec.input);mfDisconnectNode(rec.panner);mfDisconnectNode(rec.analyser);
    if(rec.eq)for(k=0;k<rec.eq.length;k++)mfDisconnectNode(rec.eq[k]);
    if(rec.session&&rec.session.tracks)delete rec.session.tracks[String(rec.handle)];
  }else if(rec.kind==='session'){
    for(k in rec.tracks){if(rec.tracks.hasOwnProperty(k)){t=rec.tracks[k];mfRemove(ctx,t.handle);mfCloseRecord(ctx,t);}}
    rec.tracks={};rec.closed=true;mfDisconnectNode(rec.master);mfDisconnectNode(rec.analyser);try{if(rec.audio&&typeof rec.audio.close==='function')rec.audio.close();}catch(ignore){}
  }
  return true;
}
function mfClose(ctx,h){var r=mfRemove(ctx,h);if(!r)return false;mfCloseRecord(ctx,r);return true;}
function mfCleanup(ctx){
  var pid=mfPid(ctx),t=MF.tables[String(pid)],keys,i,r;
  if(!t)return true;
  keys=Object.keys(t.handles);
  /* tracks first, sessions second */
  keys.sort(function(a,b){var ra=t.handles[a],rb=t.handles[b];return(ra&&ra.kind==='track'?-1:1)-(rb&&rb.kind==='track'?-1:1);});
  for(i=0;i<keys.length;i++){r=t.handles[keys[i]];if(r){delete t.handles[keys[i]];mfCloseRecord(ctx,r);}}
  delete MF.tables[String(pid)];return true;
}

async function dispatch(ctx,method,args){
  args=args||[];method=String(method||'');
  if(method==='MFStartup')return{ok:true,version:MF.version,model:MF.model,backend:'Web Audio API'};
  if(method==='MFShutdown'){mfCleanup(ctx);return true;}
  if(method==='CreateAudioSession'||method==='MFCreateAudioSession'){
    var s=mfMakeSession(ctx,args[0]||{});return{handle:s.handle,sampleRate:s.audio.sampleRate,state:s.audio.state};
  }
  if(method==='CreateSourceFromPath'||method==='MFCreateSourceFromPath')return await mfSourceFromPath(ctx,args[0],args[1],args[2]);
  if(method==='Play'){var tp=mfTrack(ctx,args[0]);await mfEnsureRunning(tp.session);mfStopSource(tp);mfStartTrack(tp,mfPosition(tp)>=tp.buffer.duration?0:mfPosition(tp));return mfHandleInfo(tp);}
  if(method==='Pause'){var ta=mfTrack(ctx,args[0]);if(ta.state==='playing'){ta.offset=mfPosition(ta);ta.state='paused';mfStopSource(ta);}return mfHandleInfo(ta);}
  if(method==='Stop'){var ts=mfTrack(ctx,args[0]);ts.state='stopped';ts.offset=0;mfStopSource(ts);return mfHandleInfo(ts);}
  if(method==='Seek'){var tk=mfTrack(ctx,args[0]),was=tk.state==='playing',pos=mfClamp(args[1],0,tk.buffer.duration,0);tk.offset=pos;mfStopSource(tk);tk.state=was?'playing':'paused';if(was){await mfEnsureRunning(tk.session);mfStartTrack(tk,pos);}return mfHandleInfo(tk);}
  if(method==='SetVolume'){var tv=mfTrack(ctx,args[0]);tv.volume=mfClamp(args[1],0,4,1);tv.input.gain.value=tv.volume;return tv.volume;}
  if(method==='SetPan'){var tn=mfTrack(ctx,args[0]);tn.pan=mfClamp(args[1],-1,1,0);if(tn.panner)tn.panner.pan.value=tn.pan;return tn.pan;}
  if(method==='SetPlaybackRate'){var tr=mfTrack(ctx,args[0]),p=mfPosition(tr),playing=tr.state==='playing';tr.playbackRate=mfClamp(args[1],0.25,4,1);mfStopSource(tr);tr.offset=p;if(playing){await mfEnsureRunning(tr.session);mfStartTrack(tr,p);}return tr.playbackRate;}
  if(method==='SetLoop'){var tl=mfTrack(ctx,args[0]);tl.loop=!!args[1];if(tl.sourceNode)tl.sourceNode.loop=tl.loop;return tl.loop;}
  if(method==='SetEQ'||method==='SetEqualizer'){
    var te=mfTrack(ctx,args[0]),g=args[1]||[],j,val;
    for(j=0;j<te.eq.length;j++){
      val=Array.isArray(g)?g[j]:(typeof g==='object'?(g[j]!==undefined?g[j]:g[String(te.eqSpec[j].frequency)]):undefined);
      if(val!==undefined){te.eqSpec[j].gain=mfClamp(val,-24,24,0);te.eq[j].gain.value=te.eqSpec[j].gain;}
    }
    return te.eqSpec.map(function(x){return{frequency:x.frequency,gain:x.gain,Q:x.Q,type:x.type};});
  }
  if(method==='SetEQBand'){
    var tb=mfTrack(ctx,args[0]),idx=parseInt(args[1],10),spec=args[2]||{};
    if(idx<0||idx>=tb.eq.length)mfInvalid('EQ band index is out of range.');
    tb.eqSpec[idx].frequency=mfClamp(spec.frequency,20,20000,tb.eqSpec[idx].frequency);tb.eqSpec[idx].gain=mfClamp(spec.gain,-24,24,tb.eqSpec[idx].gain);tb.eqSpec[idx].Q=mfClamp(spec.Q,0.01,30,tb.eqSpec[idx].Q);if(spec.type)tb.eqSpec[idx].type=String(spec.type);
    try{tb.eq[idx].type=tb.eqSpec[idx].type;}catch(ignoreType){}tb.eq[idx].frequency.value=tb.eqSpec[idx].frequency;tb.eq[idx].gain.value=tb.eqSpec[idx].gain;tb.eq[idx].Q.value=tb.eqSpec[idx].Q;
    return{frequency:tb.eqSpec[idx].frequency,gain:tb.eqSpec[idx].gain,Q:tb.eqSpec[idx].Q,type:tb.eqSpec[idx].type};
  }
  if(method==='SetMasterVolume'){var sm=mfSession(ctx,args[0]);sm.master.gain.value=mfClamp(args[1],0,4,1);return sm.master.gain.value;}
  if(method==='ResumeSession'){var sr=mfSession(ctx,args[0]);await mfEnsureRunning(sr);return sr.audio.state;}
  if(method==='SuspendSession'){var ss=mfSession(ctx,args[0]);if(typeof ss.audio.suspend==='function')await ss.audio.suspend();return ss.audio.state;}
  if(method==='GetSpectrum'){var hg=mfGet(ctx,args[0]);return mfSpectrum(hg.kind==='session'?hg.analyser:hg.analyser,args[1]||{},false);}
  if(method==='GetWaveform'){var hw=mfGet(ctx,args[0]);return mfSpectrum(hw.kind==='session'?hw.analyser:hw.analyser,args[1]||{},true);}
  if(method==='GetState'||method==='GetMediaInfo')return mfHandleInfo(mfGet(ctx,args[0]));
  if(method==='CloseMediaHandle'||method==='CloseHandle')return mfClose(ctx,args[0]);
  mfNotSupported('Unsupported MediaFoundation method: '+method);
}

global.jplopsoft_MEDIA_FOUNDATION=MF;
global.jplopsoft_mediaDispatch=dispatch;
global.jplopsoft_mediaCleanup=mfCleanup;
global.jplopsoft_mediaCloseHandle=mfClose;
})(window);
