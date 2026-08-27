/* ExOS zipfldr.xdl emulation
 * Version: 6.4.0-dev-os86
 * Model: EXOS_ZIPFLDR_V1
 *
 * Shell Namespace Extension for .zip files stored in ExFS.
 * - ZIP is still one encrypted ExFS file.
 * - Entries are projected as a virtual folder namespace.
 * - No host filesystem access is exposed.
 * - STORE(0) and DEFLATE(8) are supported; encrypted/ZIP64/multidisk ZIPs are rejected.
 */
(function(global){
'use strict';

var ZIP={
  version:'6.4.0-dev-os86',
  model:'EXOS_ZIPFLDR_V1',
  ready:true,
  nextHandle:0x7a00,
  handles:{},
  maxArchive:128*1024*1024,
  maxEntry:64*1024*1024,
  maxExpanded:256*1024*1024,
  maxEntries:4096,
  maxRatio:512
};

function err(status,message){
  if(typeof global.jplopsoft_xshError==='function')throw global.jplopsoft_xshError(status,message);
  throw new Error(message);
}
function invalid(message){return err(global.jplopsoft_STATUS_INVALID_PARAMETER||0xC000000D,message);}
function unsupported(message){return err(global.jplopsoft_STATUS_NOT_SUPPORTED||0xC00000BB,message);}
function denied(message){return err(global.jplopsoft_STATUS_ACCESS_DENIED||0xC0000022,message);}
function notfound(message){return err(global.jplopsoft_STATUS_OBJECT_NAME_NOT_FOUND||0xC0000034,message);}
function collision(message){return err(global.jplopsoft_STATUS_OBJECT_NAME_COLLISION||0xC0000035,message);}

function u16(a,o){return (a[o]|(a[o+1]<<8))>>>0;}
function u32(a,o){return ((a[o])|(a[o+1]<<8)|(a[o+2]<<16)|(a[o+3]<<24))>>>0;}
function p16(out,v){out.push(v&255,(v>>>8)&255);}
function p32(out,v){out.push(v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255);}
function append(out,bytes){for(var i=0;i<bytes.length;i++)out.push(bytes[i]&255);}
function bytes(data){return data instanceof Uint8Array?data:new Uint8Array(data||[]);}
function utf8Encode(s){return new TextEncoder().encode(String(s||''));}
function utf8Decode(a){return new TextDecoder('utf-8',{fatal:false}).decode(bytes(a));}
function normInner(p){
  p=String(p||'').replace(/\\/g,'/').replace(/^\/+|\/+$/g,'').replace(/\/{2,}/g,'/');
  if(!p)return'';
  var parts=p.split('/'),out=[],i,q;
  for(i=0;i<parts.length;i++){
    q=parts[i];
    if(!q||q==='.')continue;
    if(q==='..'||q.indexOf(':')>=0||q.indexOf('\u0000')>=0)invalid('ZIP entry path traversal is not allowed.');
    out.push(q);
  }
  return out.join('/');
}
function parentInner(p){p=normInner(p);var i=p.lastIndexOf('/');return i<0?'':p.substring(0,i);}
function baseInner(p){p=normInner(p);var i=p.lastIndexOf('/');return i<0?p:p.substring(i+1);}
function normExfs(p){
  p=String(p||'').replace(/\//g,'\\').replace(/\\{2,}/g,'\\');
  if(/^C:$/i.test(p))p+='\\';
  if(p.length>3)p=p.replace(/\\+$/,'');
  return p;
}
function joinExfs(a,b){a=normExfs(a);b=String(b||'').replace(/^[\\\/]+/,'');return a==='C:\\'?a+b:a+'\\'+b;}
function ext(p){var n=String(p||''),i=n.lastIndexOf('.');return i>=0?n.substring(i+1).toLowerCase():'';}
function safeLeaf(n){return !!(n&&n.length<=120&&!/[\\\/:*?"<>|]/.test(n)&&n!=='.'&&n!=='..');}

var CRC_TABLE=null;
function crcTable(){
  if(CRC_TABLE)return CRC_TABLE;
  CRC_TABLE=new Uint32Array(256);
  for(var n=0;n<256;n++){
    var c=n;
    for(var k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
    CRC_TABLE[n]=c>>>0;
  }
  return CRC_TABLE;
}
function crc32(a){
  a=bytes(a);var t=crcTable(),c=0xFFFFFFFF;
  for(var i=0;i<a.length;i++)c=t[(c^a[i])&255]^(c>>>8);
  return (c^0xFFFFFFFF)>>>0;
}

async function streamTransform(kind,format,input){
  var C=kind==='compress'?global.CompressionStream:global.DecompressionStream;
  if(typeof C!=='function')unsupported((kind==='compress'?'CompressionStream':'DecompressionStream')+' is unavailable in this V8 runtime.');
  var s;
  try{s=new C(format);}catch(e){unsupported(format+' stream is unavailable: '+e.message);}
  var writer=s.writable.getWriter();
  await writer.write(bytes(input));
  await writer.close();
  var ab=await new Response(s.readable).arrayBuffer();
  return new Uint8Array(ab);
}
async function inflateRaw(input,expected){
  var out=await streamTransform('decompress','deflate-raw',input);
  if(expected>=0&&out.length!==expected)invalid('ZIP DEFLATE size mismatch.');
  return out;
}
async function deflateRaw(input){return await streamTransform('compress','deflate-raw',input);}

function findEocd(a){
  var min=Math.max(0,a.length-65557);
  for(var i=a.length-22;i>=min;i--){if(u32(a,i)===0x06054b50)return i;}
  return -1;
}
function validateName(raw){
  raw=String(raw||'').replace(/\\/g,'/').replace(/^\/+/, '');
  var directory=/\/$/.test(raw); raw=raw.replace(/\/+$/,'');
  var clean=normInner(raw);
  return{path:clean,directory:directory};
}
function parseArchive(a){
  a=bytes(a);
  if(a.length>ZIP.maxArchive)invalid('ZIP archive exceeds 128 MiB namespace limit.');
  var eocd=findEocd(a); if(eocd<0)invalid('ZIP End Of Central Directory was not found.');
  var disk=u16(a,eocd+4),cdDisk=u16(a,eocd+6),onDisk=u16(a,eocd+8),count=u16(a,eocd+10),cdSize=u32(a,eocd+12),cdOff=u32(a,eocd+16);
  if(disk!==0||cdDisk!==0||onDisk!==count)unsupported('Multi-disk ZIP archives are not supported.');
  if(count===0xFFFF||cdSize===0xFFFFFFFF||cdOff===0xFFFFFFFF)unsupported('ZIP64 archives are not supported in EXOS_ZIPFLDR_V1.');
  if(count>ZIP.maxEntries)invalid('ZIP has too many entries.');
  if(cdOff+cdSize>a.length||cdOff>eocd)invalid('ZIP central directory is outside the archive.');
  var entries=[],byPath={},pos=cdOff,total=0;
  for(var i=0;i<count;i++){
    if(pos+46>a.length||u32(a,pos)!==0x02014b50)invalid('Invalid ZIP central directory record.');
    var flags=u16(a,pos+8),method=u16(a,pos+10),crc=u32(a,pos+16),cs=u32(a,pos+20),us=u32(a,pos+24),nl=u16(a,pos+28),xl=u16(a,pos+30),cl=u16(a,pos+32),diskNo=u16(a,pos+34),lo=u32(a,pos+42);
    if(flags&1)unsupported('Encrypted ZIP entries are not supported.');
    if(method!==0&&method!==8)unsupported('ZIP compression method '+method+' is not supported.');
    if(diskNo!==0)unsupported('Multi-disk ZIP entry is not supported.');
    if(cs===0xFFFFFFFF||us===0xFFFFFFFF||lo===0xFFFFFFFF)unsupported('ZIP64 entry is not supported.');
    if(us>ZIP.maxEntry)invalid('ZIP entry exceeds 64 MiB: entry '+(i+1));
    if(cs>0&&us/cs>ZIP.maxRatio)invalid('ZIP compression ratio exceeds safety limit.');
    total+=us;if(total>ZIP.maxExpanded)invalid('ZIP expanded content exceeds 256 MiB safety limit.');
    if(pos+46+nl+xl+cl>a.length)invalid('Truncated ZIP central directory.');
    var nameBytes=a.slice(pos+46,pos+46+nl),name=utf8Decode(nameBytes),nameInfo=validateName(name);
    if(nameInfo.path){
      var rec={path:nameInfo.path,name:baseInner(nameInfo.path),directory:nameInfo.directory,method:method,flags:flags,crc32:crc,compressedSize:cs,size:us,localOffset:lo,modifiedDosTime:u16(a,pos+12),modifiedDosDate:u16(a,pos+14)};
      if(byPath[rec.path])invalid('Duplicate ZIP path: '+rec.path);
      byPath[rec.path]=rec;entries.push(rec);
    }
    pos+=46+nl+xl+cl;
  }
  // synthesize parents so namespace browsing behaves like Explorer.
  var add=[];
  for(var j=0;j<entries.length;j++){
    var pp=parentInner(entries[j].path);
    while(pp){if(!byPath[pp]){var d={path:pp,name:baseInner(pp),directory:true,method:0,flags:0,crc32:0,compressedSize:0,size:0,localOffset:-1,synthetic:true};byPath[pp]=d;add.push(d);}pp=parentInner(pp);}
  }
  entries=entries.concat(add);
  return{bytes:a,entries:entries,byPath:byPath,commentLength:u16(a,eocd+20)};
}

async function readEntry(archive,rec){
  if(rec.directory)return new Uint8Array(0);
  var a=archive.bytes,o=rec.localOffset;
  if(o<0||o+30>a.length||u32(a,o)!==0x04034b50)invalid('ZIP local file header is invalid: '+rec.path);
  var nl=u16(a,o+26),xl=u16(a,o+28),start=o+30+nl+xl,end=start+rec.compressedSize;
  if(end>a.length)invalid('ZIP entry data is truncated: '+rec.path);
  var packed=a.slice(start,end),out;
  if(rec.method===0)out=packed;
  else out=await inflateRaw(packed,rec.size);
  if(out.length!==rec.size)invalid('ZIP entry size mismatch: '+rec.path);
  if(crc32(out)!==rec.crc32)invalid('ZIP CRC32 validation failed: '+rec.path);
  return out;
}

function listAt(archive,inner){
  inner=normInner(inner);var prefix=inner?inner+'/':'',seen={},out=[];
  for(var i=0;i<archive.entries.length;i++){
    var e=archive.entries[i];
    if(e.path===inner)continue;
    if(prefix&&e.path.indexOf(prefix)!==0)continue;
    var rest=prefix?e.path.substring(prefix.length):e.path;
    if(rest.indexOf('/')>=0){
      var first=rest.substring(0,rest.indexOf('/')),p=prefix+first;if(seen[p])continue;seen[p]=1;
      var existing=archive.byPath[p];
      out.push({name:first,path:p,directory:true,size:0,compressedSize:0,typeName:'檔案資料夾'});
    }else{
      if(seen[e.path])continue;seen[e.path]=1;
      out.push({name:e.name,path:e.path,directory:!!e.directory,size:e.size||0,compressedSize:e.compressedSize||0,crc32:e.crc32>>>0,method:e.method,typeName:e.directory?'檔案資料夾':'ZIP 檔案'});
    }
  }
  out.sort(function(a,b){if(a.directory!==b.directory)return a.directory?-1:1;return a.name.localeCompare(b.name,'zh-Hant',{sensitivity:'base'});});
  return out;
}

function dosNow(){
  var d=new Date(),year=Math.max(1980,d.getFullYear());
  return{time:((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((Math.floor(d.getSeconds()/2))&31),date:(((year-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31)};
}
async function buildArchive(items){
  // items: [{path,directory,data}]. Recompress files when browser supports raw DEFLATE; otherwise STORE.
  var local=[],central=[],offset=0,now=dosNow(),count=0;
  for(var i=0;i<items.length;i++){
    var it=items[i],name=normInner(it.path)+(it.directory?'/':''),nb=utf8Encode(name),data=it.directory?new Uint8Array(0):bytes(it.data),packed=data,method=0,crc=it.directory?0:crc32(data);
    if(!it.directory&&data.length>32&&typeof global.CompressionStream==='function'){
      try{var d=await deflateRaw(data);if(d.length<data.length){packed=d;method=8;}}catch(ignoreDeflate){}
    }
    var localOffset=offset;
    p32(local,0x04034b50);p16(local,20);p16(local,0x0800);p16(local,method);p16(local,now.time);p16(local,now.date);p32(local,crc);p32(local,packed.length);p32(local,data.length);p16(local,nb.length);p16(local,0);append(local,nb);append(local,packed);
    offset=local.length;
    p32(central,0x02014b50);p16(central,20);p16(central,20);p16(central,0x0800);p16(central,method);p16(central,now.time);p16(central,now.date);p32(central,crc);p32(central,packed.length);p32(central,data.length);p16(central,nb.length);p16(central,0);p16(central,0);p16(central,0);p16(central,0);p32(central,it.directory?0x10:0);p32(central,localOffset);append(central,nb);count++;
  }
  var cdOffset=local.length,cdSize=central.length,out=local.concat(central);
  p32(out,0x06054b50);p16(out,0);p16(out,0);p16(out,count);p16(out,count);p32(out,cdSize);p32(out,cdOffset);p16(out,0);
  return new Uint8Array(out);
}

function purpose(ctx){return ctx&&ctx.process&&String(ctx.process.integrity||'').toUpperCase()==='LOW'?'XSH_SANDBOX':'';}
function resolveArchiveNode(ctx,path){
  path=normExfs(path);if(ext(path)!=='zip')invalid('zipfldr.xdl requires a .zip path.');
  var n=global.jplopsoft_xshResolveC(ctx,path,false);if(!n||n.root||n.type!=='file')notfound('ZIP archive not found: '+path);return n;
}
async function loadArchive(ctx,path){var n=resolveArchiveNode(ctx,path),a=await global.jplopsoft_xshReadNodeBytes(n,purpose(ctx));return{node:n,path:normExfs(path),archive:parseArchive(a)};}
async function saveArchive(ctx,path,a){var n=resolveArchiveNode(ctx,path);if(a.length>ZIP.maxArchive)invalid('ZIP archive exceeds 128 MiB limit.');await global.jplopsoft_xshWriteNodeBytes(n,a);return true;}
async function createArchive(ctx,path){
  path=normExfs(path);if(ext(path)!=='zip')path+='.zip';var n=global.jplopsoft_xshResolveC(ctx,path,false);if(n)collision('Archive already exists: '+path);
  n=await global.jplopsoft_xshCreateCNode(ctx,path,'file');var data=await buildArchive([]);await global.jplopsoft_xshWriteNodeBytes(n,data);return{ok:true,path:path,nodeId:Number(n.id)||0};
}
function alloc(ctx,rec){var h=ZIP.nextHandle++;ZIP.handles[String(h)]={pid:Number(ctx&&ctx.pid)||0,rec:rec};return h;}
function handle(ctx,h){var x=ZIP.handles[String(Number(h)||0)];if(!x||(x.pid&&x.pid!==(Number(ctx&&ctx.pid)||0)))invalid('Invalid ZIP handle.');return x.rec;}
function close(ctx,h){var k=String(Number(h)||0),x=ZIP.handles[k];if(!x)return false;if(x.pid&&x.pid!==(Number(ctx&&ctx.pid)||0))denied('ZIP handle belongs to another process.');delete ZIP.handles[k];return true;}

async function collectItems(ctx,rec){
  var items=[],seen={};
  for(var i=0;i<rec.archive.entries.length;i++){
    var e=rec.archive.entries[i];if(e.synthetic||seen[e.path])continue;seen[e.path]=1;
    if(e.directory)items.push({path:e.path,directory:true,data:new Uint8Array(0)});else items.push({path:e.path,directory:false,data:await readEntry(rec.archive,e)});
  }
  return items;
}
async function refresh(ctx,rec){var newer=await loadArchive(ctx,rec.path);rec.node=newer.node;rec.archive=newer.archive;return rec;}
async function extractOne(ctx,rec,inner,destDir){
  inner=normInner(inner);var e=rec.archive.byPath[inner];if(!e)notfound('ZIP entry not found: '+inner);destDir=normExfs(destDir);
  async function ensureFolder(path){var n=global.jplopsoft_xshResolveC(ctx,path,false);if(n){if(n.type!=='folder')collision('Destination exists and is not a folder: '+path);return n;}return await global.jplopsoft_xshCreateCNode(ctx,path,'folder');}
  async function writeFile(path,data){var n=global.jplopsoft_xshResolveC(ctx,path,false);if(n)collision('Destination file already exists: '+path);n=await global.jplopsoft_xshCreateCNode(ctx,path,'file');await global.jplopsoft_xshWriteNodeBytes(n,data);return n;}
  if(e.directory){
    var base=e.path+'/',made=[];await ensureFolder(joinExfs(destDir,e.name));
    for(var i=0;i<rec.archive.entries.length;i++){
      var q=rec.archive.entries[i];if(q.synthetic||q.path.indexOf(base)!==0)continue;var rel=q.path.substring(base.length),parts=rel.split('/'),cur=joinExfs(destDir,e.name);
      for(var p=0;p<parts.length-1;p++){if(parts[p]){cur=joinExfs(cur,parts[p]);await ensureFolder(cur);}}
      if(q.directory){if(parts[parts.length-1])await ensureFolder(joinExfs(cur,parts[parts.length-1]));}
      else await writeFile(joinExfs(cur,parts[parts.length-1]),await readEntry(rec.archive,q));
    }
    return{ok:true,path:joinExfs(destDir,e.name),directory:true};
  }
  var outPath=joinExfs(destDir,e.name);await writeFile(outPath,await readEntry(rec.archive,e));return{ok:true,path:outPath,directory:false};
}
async function extractAll(ctx,rec,destDir){
  destDir=normExfs(destDir);var root=global.jplopsoft_xshResolveC(ctx,destDir,false);if(!root||root.type!=='folder')notfound('Extraction destination folder not found.');
  var top=listAt(rec.archive,''),out=[];for(var i=0;i<top.length;i++)out.push(await extractOne(ctx,rec,top[i].path,destDir));return{ok:true,count:out.length,results:out};
}
async function addPath(ctx,rec,sourcePath,innerDir){
  sourcePath=normExfs(sourcePath);innerDir=normInner(innerDir);var src=global.jplopsoft_xshResolveC(ctx,sourcePath,false);if(!src)notfound('Source not found: '+sourcePath);
  var items=await collectItems(ctx,rec),map={};for(var i=0;i<items.length;i++)map[items[i].path]=items[i];
  async function walk(node,path,prefix){
    var name=String(global.jplopsoft_decName(node)||baseInner(path.replace(/\\/g,'/'))),zp=normInner(prefix?(prefix+'/'+name):name);
    if(node.type==='folder'){
      if(!map[zp]){map[zp]={path:zp,directory:true,data:new Uint8Array(0)};items.push(map[zp]);}
      var children=global.jplopsoft_childrenOf(Number(node.id)||0);
      for(var j=0;j<children.length;j++){var cn=children[j],cp=joinExfs(path,String(global.jplopsoft_decName(cn)||''));await walk(cn,cp,zp);}
    }else{
      if(map[zp])collision('ZIP entry already exists: '+zp);
      var data=await global.jplopsoft_xshReadNodeBytes(node,purpose(ctx));map[zp]={path:zp,directory:false,data:data};items.push(map[zp]);
    }
  }
  await walk(src,sourcePath,innerDir);var data=await buildArchive(items);await saveArchive(ctx,rec.path,data);await refresh(ctx,rec);return{ok:true,path:sourcePath,innerDir:innerDir};
}
async function addPickedFile(ctx,rec,token,innerDir){
  token=String(token||'');
  innerDir=normInner(innerDir);
  if(!token)invalid('Browser file token is required.');
  if(typeof global.jplopsoft_xshLocalFile!=='function')unsupported('Browser-picked file broker is unavailable.');
  var picked=global.jplopsoft_xshLocalFile(ctx,token),file=picked&&picked.file;
  if(!file)notfound('Browser-picked file token is no longer available.');
  var name=String(file.name||picked.name||'');
  if(!safeLeaf(name))invalid('Invalid ZIP file name.');
  if(Number(file.size||0)>ZIP.maxEntry)invalid('ZIP entry exceeds 64 MiB limit.');
  var data=new Uint8Array(await file.arrayBuffer()),zp=normInner(innerDir?(innerDir+'/'+name):name);
  if(rec.archive.byPath[zp])collision('ZIP entry already exists: '+zp);
  var items=await collectItems(ctx,rec);
  items.push({path:zp,directory:false,data:data});
  await saveArchive(ctx,rec.path,await buildArchive(items));
  await refresh(ctx,rec);
  return{ok:true,path:zp,size:data.length,name:name};
}

async function deleteItem(ctx,rec,inner){
  inner=normInner(inner);if(!rec.archive.byPath[inner])notfound('ZIP item not found: '+inner);var items=await collectItems(ctx,rec),prefix=inner+'/',kept=[];
  for(var i=0;i<items.length;i++)if(items[i].path!==inner&&items[i].path.indexOf(prefix)!==0)kept.push(items[i]);
  await saveArchive(ctx,rec.path,await buildArchive(kept));await refresh(ctx,rec);return{ok:true};
}
async function createFolder(ctx,rec,inner){
  inner=normInner(inner);if(!inner)invalid('ZIP folder path is required.');if(rec.archive.byPath[inner])collision('ZIP item already exists: '+inner);
  var items=await collectItems(ctx,rec);items.push({path:inner,directory:true,data:new Uint8Array(0)});await saveArchive(ctx,rec.path,await buildArchive(items));await refresh(ctx,rec);return{ok:true,path:inner};
}

function makeVirtual(archivePath,inner){return 'zip://'+encodeURIComponent(normExfs(archivePath))+'!/'+normInner(inner).split('/').filter(Boolean).map(encodeURIComponent).join('/');}
function parseVirtual(v){
  v=String(v||'');var m=/^zip:\/\/([^!]+)!\/(.*)$/i.exec(v);if(!m)return null;var ap=decodeURIComponent(m[1]),inner='';if(m[2])inner=m[2].split('/').filter(Boolean).map(decodeURIComponent).join('/');return{archivePath:normExfs(ap),innerPath:normInner(inner)};
}
function isVirtual(v){return /^zip:\/\//i.test(String(v||''))&&!!parseVirtual(v);}

async function dispatch(ctx,method,args){
  args=args||[];
  if(method==='GetVersion')return{version:ZIP.version,model:ZIP.model,namespace:'CompressedFolder'};
  if(method==='IsCompressedFolder')return ext(args[0])==='zip';
  if(method==='CreateArchive')return await createArchive(ctx,args[0]);
  if(method==='OpenArchive'||method==='BindToObject'){
    var r=await loadArchive(ctx,args[0]),h=alloc(ctx,r);return{ok:true,handle:h,path:r.path,entries:r.archive.entries.length,virtualRoot:makeVirtual(r.path,'')};
  }
  if(method==='CloseArchive')return close(ctx,args[0]);
  if(method==='EnumItems'||method==='ListDirectory'){var r1=handle(ctx,args[0]);return listAt(r1.archive,args[1]||'');}
  if(method==='GetItemInfo'){var r2=handle(ctx,args[0]),ip=normInner(args[1]),e=r2.archive.byPath[ip];if(!e)notfound('ZIP entry not found: '+ip);return{name:e.name,path:e.path,directory:!!e.directory,size:e.size||0,compressedSize:e.compressedSize||0,crc32:e.crc32>>>0,method:e.method};}
  if(method==='ReadItem'){var r3=handle(ctx,args[0]),ip2=normInner(args[1]),e2=r3.archive.byPath[ip2];if(!e2)notfound('ZIP entry not found: '+ip2);return{ok:true,path:ip2,data:await readEntry(r3.archive,e2),size:e2.size||0};}
  if(method==='ExtractItem'){return await extractOne(ctx,handle(ctx,args[0]),args[1],args[2]);}
  if(method==='ExtractAll')return await extractAll(ctx,handle(ctx,args[0]),args[1]);
  if(method==='AddFile'||method==='AddPath')return await addPath(ctx,handle(ctx,args[0]),args[1],args[2]||'');
  if(method==='AddPickedFile')return await addPickedFile(ctx,handle(ctx,args[0]),args[1],args[2]||'');
  if(method==='DeleteItem')return await deleteItem(ctx,handle(ctx,args[0]),args[1]);
  if(method==='CreateFolder')return await createFolder(ctx,handle(ctx,args[0]),args[1]);
  if(method==='MakeVirtualPath')return makeVirtual(args[0],args[1]||'');
  if(method==='ParseVirtualPath')return parseVirtual(args[0]);
  unsupported('zipfldr.xdl method is not implemented: '+String(method||''));
}

async function listVirtual(ctx,v){var p=parseVirtual(v);if(!p)invalid('Invalid ZIP virtual path.');var r=await loadArchive(ctx,p.archivePath);return listAt(r.archive,p.innerPath).map(function(x){x.virtualPath=makeVirtual(p.archivePath,x.path);x.archivePath=p.archivePath;return x;});}
async function extractVirtual(ctx,v,destDir){var p=parseVirtual(v);if(!p)invalid('Invalid ZIP virtual path.');var r=await loadArchive(ctx,p.archivePath);return await extractOne(ctx,r,p.innerPath,destDir);}
async function addPathsVirtual(ctx,targetVirtual,paths){var p=parseVirtual(targetVirtual);if(!p)invalid('Invalid ZIP virtual target.');var r=await loadArchive(ctx,p.archivePath),list=Array.isArray(paths)?paths:[paths];for(var i=0;i<list.length;i++)await addPath(ctx,r,list[i],p.innerPath);return{ok:true,count:list.length};}

function cleanup(ctx){var pid=Number(ctx&&ctx.pid)||0,k;for(k in ZIP.handles)if(Object.prototype.hasOwnProperty.call(ZIP.handles,k)&&ZIP.handles[k].pid===pid)delete ZIP.handles[k];}

global.jplopsoft_ZIPFLDR=ZIP;
global.jplopsoft_zipfldrDispatch=dispatch;
global.jplopsoft_zipfldrCleanup=cleanup;
global.jplopsoft_zipfldrIsVirtualPath=isVirtual;
global.jplopsoft_zipfldrMakeVirtualPath=makeVirtual;
global.jplopsoft_zipfldrParseVirtualPath=parseVirtual;
global.jplopsoft_zipfldrListVirtual=listVirtual;
global.jplopsoft_zipfldrExtractVirtual=extractVirtual;
global.jplopsoft_zipfldrAddPathsVirtual=addPathsVirtual;
})(window);
