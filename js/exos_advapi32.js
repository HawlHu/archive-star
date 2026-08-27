/* ExOS advapi32.xdl emulation
 * File: exos_advapi32.js
 * Version: 6.4.0-dev-os91-hotfix69
 * Model: EXOS_ADVAPI32_V3
 * Client: V8-only browsers
 *
 * Win32-style Advanced API facade for ExOS XSH:
 * - Registry: HKCU / HKLM\\Software, process-local HKEY handles
 * - Security: SDDL, ACL helpers, named/file/Registry-hive security
 * - Tokens: process token query, duplicate/restricted token views,
 *   membership and privilege checks without privilege escalation.
 *
 * The implementation is a user-mode emulation. Registry/ACL persistence and
 * authoritative access checks remain in PHP /_exfs/; XSH never receives host
 * DOM access, raw PHP files, or an OS/browser credential handle.
 */
(function(global){
'use strict';

var ADV={
  version:'6.4.0-dev-os91-hotfix69',
  model:'EXOS_ADVAPI32_V3',
  ready:true,
  compatibility:'EXOS_ADVAPI32_SEMANTIC_V3'
};

var ROOTS={
  HKEY_CLASSES_ROOT:{hive:'HKLM_SOFTWARE',key:'classes'},
  HKCR:{hive:'HKLM_SOFTWARE',key:'classes'},
  HKEY_CURRENT_USER:{hive:'HKCU',key:''},
  HKCU:{hive:'HKCU',key:''},
  HKEY_LOCAL_MACHINE:{machineRoot:true},
  HKLM:{machineRoot:true},
  HKEY_USERS:{usersRoot:true},
  HKU:{usersRoot:true}
};

var TOKEN_INFO={
  1:'TokenUser',2:'TokenGroups',3:'TokenPrivileges',4:'TokenOwner',
  5:'TokenPrimaryGroup',6:'TokenDefaultDacl',7:'TokenSource',8:'TokenType',
  9:'TokenImpersonationLevel',10:'TokenStatistics',11:'TokenRestrictedSids',
  12:'TokenSessionId',13:'TokenGroupsAndPrivileges',18:'TokenElevationType',
  19:'TokenLinkedToken',20:'TokenElevation',25:'TokenIntegrityLevel',
  29:'TokenIsAppContainer'
};

var PRIVILEGES=[
  'SeChangeNotifyPrivilege','SeBackupPrivilege','SeRestorePrivilege',
  'SeTakeOwnershipPrivilege','SeSecurityPrivilege','SeRelabelPrivilege',
  'SeDebugPrivilege'
];

function fail(status,message){
  if(typeof global.jplopsoft_xshError==='function'){
    throw global.jplopsoft_xshError(status,message);
  }
  var e=new Error(message);e.ntstatus=status;throw e;
}
function status(name,fallback){
  var k='jplopsoft_STATUS_'+name;
  return typeof global[k]!=='undefined'?global[k]:fallback;
}
function clone(x){
  if(x===undefined||x===null)return x;
  return JSON.parse(JSON.stringify(x));
}
function api(action,method,data){
  if(typeof global.jplopsoft_xshApiPromise!=='function'){
    fail(status('NOT_SUPPORTED',0xC00000BB),'ExFS API bridge is unavailable.');
  }
  return global.jplopsoft_xshApiPromise(action,method,data||null);
}
function ensure(ctx){
  if(!ctx.advapi32){
    ctx.advapi32={nextTokenHandle:0x7000,registryHandles:{},tokenHandles:{},primaryToken:null,impersonationToken:0};
  }
  return ctx.advapi32;
}
function normalizeKey(s){
  s=String(s===undefined||s===null?'':s).replace(/\//g,'\\').replace(/\\{2,}/g,'\\');
  return s.replace(/^\\+|\\+$/g,'').toLowerCase();
}
function joinKey(a,b){a=normalizeKey(a);b=normalizeKey(b);return a&&b?a+'\\'+b:(a||b);}
function desiredText(v){
  if(typeof v==='string'){
    v=String(v).toUpperCase();
    if(v==='KEY_ALL_ACCESS'||v==='KEY_WRITE'||v==='KEY_READ')return v;
  }
  v=Number(v)>>>0;
  if((v&0x000F003F)===0x000F003F)return'KEY_ALL_ACCESS';
  if((v&(0x0002|0x0004))!==0)return'KEY_WRITE';
  return'KEY_READ';
}
function rootInfo(h){
  var s=String(h||'').toUpperCase(),r=ROOTS[s];
  return r?{root:true,hive:r.hive||'',key:r.key||'',predefined:s,machineRoot:!!r.machineRoot,usersRoot:!!r.usersRoot}:null;
}
function currentSid(ctx){return String(ctx&&ctx.process&&ctx.process.sid||'');}
function currentUser(ctx){return String(ctx&&ctx.process&&ctx.process.username||'');}
function machineHiveView(subKey){
  var k=normalizeKey(subKey),p,first,rest,map={system:'HKLM_SYSTEM',software:'HKLM_SOFTWARE',sam:'HKLM_SAM',security:'HKLM_SECURITY'};
  if(k==='')return{virtualRoot:true,hive:'',key:''};p=k.indexOf('\\');first=p<0?k:k.substring(0,p);rest=p<0?'':k.substring(p+1);if(!map[first])fail(status('OBJECT_NAME_NOT_FOUND',0xC0000034),'Registry machine hive was not found: '+first);return{hive:map[first],key:rest};
}
function usersHiveView(ctx,subKey){
  var k=normalizeKey(subKey),p,first,rest,sid=currentSid(ctx).toLowerCase(),user=currentUser(ctx).toLowerCase();if(k==='')return{virtualRoot:true,hive:'',key:''};p=k.indexOf('\\');first=p<0?k:k.substring(0,p);rest=p<0?'':k.substring(p+1);if(first==='.default')return{hive:'HKU_DEFAULT',key:rest};if((sid&&first===sid)||(user&&first===user)||first==='currentuser')return{hive:'HKCU',key:rest};fail(status('OBJECT_NAME_NOT_FOUND',0xC0000034),'Registry user hive is not mounted: '+first);
}
function resolveView(ctx,base,subKey){
  if(base.machineRoot)return machineHiveView(subKey);if(base.usersRoot)return usersHiveView(ctx,subKey);return{hive:base.hive,key:joinKey(base.key,subKey)};
}
function isVirtualRootHandle(h){var r=rootInfo(h);return!!(r&&(r.machineRoot||r.usersRoot));}
function regInfo(ctx,h){
  var r=rootInfo(h),st=ensure(ctx),rec;if(r)return r;rec=st.registryHandles[String(h||'')];if(!rec)fail(status('INVALID_HANDLE',0xC0000008),'Invalid Registry HKEY.');return rec;
}
async function ensureServerHandle(ctx,h,write){
  var info=regInfo(ctx,h),st=ensure(ctx),out,desired,cached;if(info.machineRoot||info.usersRoot)fail(status('INVALID_HANDLE',0xC0000008),'A virtual Registry root does not have a server hive handle.');
  if(info.root){cached=st.registryHandles['@root:'+String(h).toUpperCase()];if(cached){if(write&&!cached.write){try{await api('reg_close_key','POST',{handle:cached.serverHandle});}catch(ignoreRootClose){}delete st.registryHandles['@root:'+String(h).toUpperCase()];}else return cached;}}
  if(info.serverHandle){if(write&&!info.write)fail(status('ACCESS_DENIED',0xC0000022),'Registry HKEY is not writable.');return info;}
  desired=write?'KEY_WRITE':'KEY_READ';out=await api('reg_open_key','POST',{hive:info.hive,key:info.key,desired_access:desired});info={root:!!info.root,hive:String(out.hive||info.hive),key:normalizeKey(out.key||info.key),serverHandle:String(out.handle||''),write:write,desired:desired,predefined:info.predefined||''};if(info.root)st.registryHandles['@root:'+String(h).toUpperCase()]=info;return info;
}
function trackRegistry(ctx,out,write){var st=ensure(ctx),h=String(out.handle||'');if(!h)fail(status('INVALID_HANDLE',0xC0000008),'Registry server returned no handle.');st.registryHandles[h]={hive:String(out.hive||''),key:normalizeKey(out.key||''),serverHandle:h,write:!!write,desired:String(out.desired_access||''),created:!!out.created};return h;}
async function regOpen(ctx,hKey,subKey,samDesired,create){
  var base=regInfo(ctx,hKey),view=resolveView(ctx,base,subKey),desired=desiredText(samDesired),write=create||desired!=='KEY_READ',out,h;if(view.virtualRoot){if(write)fail(status('ACCESS_DENIED',0xC0000022),'Predefined Registry root is read-only.');return create?{hKey:hKey,disposition:'REG_OPENED_EXISTING_KEY',created:false}:hKey;}if(create&&desired==='KEY_READ')desired='KEY_WRITE';out=await api('reg_open_key','POST',{hive:view.hive,key:view.key,desired_access:desired});h=trackRegistry(ctx,out,write);return create?{hKey:h,disposition:out.created?'REG_CREATED_NEW_KEY':'REG_OPENED_EXISTING_KEY',created:!!out.created}:h;
}
async function regClose(ctx,hKey){var st=ensure(ctx),r=rootInfo(hKey),h=String(hKey||''),rec;if(r)return true;rec=st.registryHandles[h];if(!rec)return false;delete st.registryHandles[h];if(rec.serverHandle){try{await api('reg_close_key','POST',{handle:rec.serverHandle});}catch(ignore){}}return true;}
function normalizeRegData(type,data){
  var t=String(type||'REG_SZ').toUpperCase();if(t==='4'||t==='REG_DWORD')return{type:'REG_DWORD',data:Number(data)>>>0};if(t==='11'||t==='REG_QWORD')return{type:'REG_QWORD',data:String(data===undefined||data===null?'0':data)};if(t==='3'||t==='REG_BINARY'){if(Array.isArray(data)||ArrayBuffer.isView(data)){var a=Array.prototype.slice.call(data),s='',i;for(i=0;i<a.length;i++)s+=('0'+((Number(a[i])||0)&255).toString(16)).slice(-2);return{type:'REG_BINARY',data:s.toUpperCase()};}return{type:'REG_BINARY',data:String(data||'').replace(/[^0-9a-f]/gi,'').toUpperCase()};}if(t==='7'||t==='REG_MULTI_SZ')return{type:'REG_MULTI_SZ',data:Array.isArray(data)?data.map(String).join('\u0000'):String(data||'')};if(t==='2'||t==='REG_EXPAND_SZ')return{type:'REG_EXPAND_SZ',data:String(data||'')};return{type:'REG_SZ',data:String(data===undefined||data===null?'':data)};
}
function expandRegData(rec){rec=rec||{};var t=String(rec.type||'REG_SZ').toUpperCase(),d=rec.data;if(t==='REG_MULTI_SZ')d=String(d||'').split('\u0000');if(t==='REG_BINARY'){var s=String(d||'').replace(/[^0-9a-f]/gi,''),a=[],i;for(i=0;i+1<s.length;i+=2)a.push(parseInt(s.substr(i,2),16));d=a;}return{name:String(rec.name||''),type:t,data:d,updatedAt:String(rec.updated_at||'')};}
function virtualKeys(ctx,hKey){var r=rootInfo(hKey),sid=currentSid(ctx),a=[];if(r&&r.machineRoot)a=['SAM','SECURITY','SOFTWARE','SYSTEM'];else if(r&&r.usersRoot){a=['.DEFAULT'];if(sid)a.push(sid);}return a;}
async function RegQueryValueEx(ctx,hKey,name){if(isVirtualRootHandle(hKey))fail(status('OBJECT_NAME_NOT_FOUND',0xC0000034),'Predefined Registry root has no direct values.');var info=await ensureServerHandle(ctx,hKey,false),out=await api('reg_get_value','POST',{handle:info.serverHandle,name:String(name||'')});return expandRegData(out);}
async function RegSetValueEx(ctx,hKey,name,type,data){if(isVirtualRootHandle(hKey))fail(status('ACCESS_DENIED',0xC0000022),'Predefined Registry root is read-only.');var info=await ensureServerHandle(ctx,hKey,true),v=normalizeRegData(type,data);await api('reg_set_value','POST',{handle:info.serverHandle,name:String(name||''),type:v.type,data:v.data});return true;}
async function RegEnumKeyEx(ctx,hKey,index){var i=Number(index)||0;if(isVirtualRootHandle(hKey)){var a=virtualKeys(ctx,hKey);return i>=0&&i<a.length?{name:a[i],class:'',last_write_time:''}:null;}var info=await ensureServerHandle(ctx,hKey,false),out=await api('reg_enum_keys','POST',{handle:info.serverHandle}),rows=out.keys||[];return i>=0&&i<rows.length?rows[i]:null;}
async function RegEnumValue(ctx,hKey,index){if(isVirtualRootHandle(hKey))return null;var info=await ensureServerHandle(ctx,hKey,false),out=await api('reg_enum_values','POST',{handle:info.serverHandle}),a=out.values||[],i=Number(index)||0;return i>=0&&i<a.length?expandRegData(a[i]):null;}
async function RegQueryInfoKey(ctx,hKey){if(isVirtualRootHandle(hKey)){var a=virtualKeys(ctx,hKey),m=0,i;for(i=0;i<a.length;i++)if(a[i].length>m)m=a[i].length;return{subKeyCount:a.length,valueCount:0,maxSubKeyNameLength:m,maxValueNameLength:0,maxValueDataLength:0,hive:String(hKey),key:'',virtualRoot:true};}var info=await ensureServerHandle(ctx,hKey,false),out=await api('reg_query_info_key','POST',{handle:info.serverHandle});return out.info||{};}
async function RegDeleteValue(ctx,hKey,name){if(isVirtualRootHandle(hKey))fail(status('ACCESS_DENIED',0xC0000022),'Predefined Registry root is read-only.');var info=await ensureServerHandle(ctx,hKey,true);await api('reg_delete_value_handle','POST',{handle:info.serverHandle,name:String(name||'')});return true;}
async function RegDeleteKey(ctx,hKey,subKey){if(isVirtualRootHandle(hKey))fail(status('ACCESS_DENIED',0xC0000022),'Mounted Registry hive roots cannot be deleted.');var info=await ensureServerHandle(ctx,hKey,true);await api('reg_delete_key_handle','POST',{handle:info.serverHandle,subkey:normalizeKey(subKey)});return true;}
async function RegFlushKey(ctx,hKey){if(!rootInfo(hKey))await ensureServerHandle(ctx,hKey,false);return true;}
function isRegistryTarget(x){return /^(?:HKEY_|HK(?:CU|LM|CR|U)\b)/i.test(String(x||''));}
function parseRegistryTarget(ctx,x){
  var s=String(x||'').replace(/\//g,'\\'),m=s.match(/^(HKEY_CURRENT_USER|HKCU|HKEY_LOCAL_MACHINE|HKLM|HKEY_CLASSES_ROOT|HKCR|HKEY_USERS|HKU)(?:\\(.*))?$/i),r,v;if(!m)return null;r=rootInfo(m[1]);if(!r)return null;v=resolveView(ctx,r,m[2]||'');if(v.virtualRoot)return{virtualRoot:true,root:m[1].toUpperCase()};return{hive:v.hive,key:v.key};
}
async function registrySecurity(ctx,target,set,sddl){var t=typeof target==='string'&&isRegistryTarget(target)?parseRegistryTarget(ctx,target):null,info;if(t&&t.virtualRoot)fail(status('ACCESS_DENIED',0xC0000022),'Security descriptor for the virtual Registry root is not directly writable.');if(!t){info=regInfo(ctx,target);if(info.machineRoot||info.usersRoot)fail(status('ACCESS_DENIED',0xC0000022),'Virtual Registry root security is managed by the Configuration Manager.');t={hive:info.hive,key:info.key};}if(set){var o=await api('reg_security_set_sddl','POST',{hive:t.hive,key:t.key,sddl:String(sddl||'')});return String(o.sddl||'');}var out=await api('reg_security_get_sddl','POST',{hive:t.hive,key:t.key});return{sddl:String(out.sddl||''),descriptor:out.descriptor||{},scope:'HIVE',hive:t.hive,key:t.key};}

function flagsToSddl(flags,audit){flags=Number(flags)||0;var s='';if(flags&1)s+='OI';if(flags&2)s+='CI';if(flags&4)s+='NP';if(flags&8)s+='IO';if(flags&16)s+='ID';if(audit&&flags&64)s+='SA';if(audit&&flags&128)s+='FA';return s;}
function integritySid(level){level=String(level||'MEDIUM').toUpperCase();return level==='LOW'?'S-1-16-4096':level==='HIGH'?'S-1-16-12288':level==='SYSTEM'?'S-1-16-16384':'S-1-16-8192';}
function descriptorToSddl(sd){
  sd=sd||{};if(sd.sddl&&(!sd._dirty))return String(sd.sddl);if(!sd.owner_sid||!sd.group_sid)throw new Error('Security descriptor owner/group is required.');
  var out='O:'+sd.owner_sid+'G:'+sd.group_sid,i,a,d=Array.isArray(sd.dacl)?sd.dacl:[],s=Array.isArray(sd.sacl)?sd.sacl:[];
  if(!sd.control||Number(sd.control.dacl_present)!==0){out+='D:'+(sd.control&&Number(sd.control.dacl_protected)===1?'P':'');for(i=0;i<d.length;i++){a=d[i]||{};out+='('+(String(a.ace_type||'ALLOW').toUpperCase()==='DENY'?'D':'A')+';'+flagsToSddl(a.flags,false)+';0x'+('00000000'+((Number(a.access_mask)||0)>>>0).toString(16).toUpperCase()).slice(-8)+';'+String(a.object_guid||'')+';'+String(a.inherit_object_guid||'')+';'+String(a.sid||'')+')';}}
  if(s.length||sd.mandatory_label){out+='S:';for(i=0;i<s.length;i++){a=s[i]||{};var af=(Number(a.flags)||0)|(Number(a.audit_success)===1?64:0)|(Number(a.audit_failure)===1?128:0);out+='(AU;'+flagsToSddl(af,true)+';0x'+('00000000'+((Number(a.access_mask)||0)>>>0).toString(16).toUpperCase()).slice(-8)+';'+String(a.object_guid||'')+';'+String(a.inherit_object_guid||'')+';'+String(a.sid||'')+')';}if(sd.mandatory_label){var ml=sd.mandatory_label,rights=(Number(ml.no_write_up)!==0?'NW':'')+(Number(ml.no_read_down)!==0?'NR':'')+(Number(ml.no_execute_up)!==0?'NX':'');out+='(ML;;'+rights+';;;'+integritySid(ml.integrity_level)+')';}}
  return out;
}
function normalizeAce(e){e=e||{};return{ace_type:String(e.ace_type||e.type||'ALLOW').toUpperCase()==='DENY'?'DENY':'ALLOW',sid:String(e.sid||''),access_mask:Number(e.access_mask!==undefined?e.access_mask:e.mask)||0,flags:Number(e.flags)||0,inherited:!!e.inherited};}
function SetEntriesInAcl(entries,oldAcl){var out=Array.isArray(oldAcl)?clone(oldAcl):[],a=Array.isArray(entries)?entries:[],i,e,mode;for(i=0;i<a.length;i++){e=normalizeAce(a[i]);if(!e.sid)continue;mode=String(a[i].accessMode||a[i].mode||'GRANT_ACCESS').toUpperCase();if(mode==='REVOKE_ACCESS'){out=out.filter(function(x){return String(x.sid)!==e.sid;});continue;}if(mode==='SET_ACCESS')out=out.filter(function(x){return String(x.sid)!==e.sid;});if(mode==='DENY_ACCESS')e.ace_type='DENY';else if(mode==='GRANT_ACCESS'||mode==='SET_ACCESS')e.ace_type='ALLOW';out.push(e);}return out;}

async function primaryToken(ctx){var st=ensure(ctx),out,t;if(st.primaryToken)return clone(st.primaryToken);out=await api('token_info','GET',null);t=clone(out.token||{});t.integrity_level=String(ctx&&ctx.process&&ctx.process.integrity||out.process_integrity||t.integrity_level||'MEDIUM').toUpperCase();st.primaryToken=t;return clone(t);}
function allocToken(ctx,t,access,mutable){var st=ensure(ctx),h=st.nextTokenHandle++;st.tokenHandles[String(h)]={handle:h,token:clone(t),access:Number(access)>>>0,mutable:!!mutable};return h;}
function tokenRec(ctx,h){var r=ensure(ctx).tokenHandles[String(Number(h)||0)];if(!r)fail(status('INVALID_HANDLE',0xC0000008),'Invalid access token handle.');return r;}
function requireTokenAccess(r,mask,message){if(((Number(r.access)>>>0)&(Number(mask)>>>0))!==(Number(mask)>>>0))fail(status('ACCESS_DENIED',0xC0000022),message||'Token handle access denied.');return r;}
async function OpenProcessToken(ctx,pid,desired){pid=Number(pid);if(!pid||pid===-1)pid=Number(ctx.pid)||0;if(pid!==Number(ctx.pid)){
    var p=typeof global.jplopsoft_ntKernelProcessByPid==='function'?global.jplopsoft_ntKernelProcessByPid(pid):null;if(!p)fail(status('INVALID_CID',0xC000000B),'Target process does not exist.');if(String(p.username||'').toLowerCase()!==String(ctx.process&&ctx.process.username||'').toLowerCase())fail(status('ACCESS_DENIED',0xC0000022),'Cross-user process token access is denied.');
  }
  var t=await primaryToken(ctx);if(pid!==Number(ctx.pid)){var p2=global.jplopsoft_ntKernelProcessByPid(pid);if(p2)t.integrity_level=String(p2.integrity||t.integrity_level||'MEDIUM').toUpperCase();}
  return allocToken(ctx,t,desired,false);
}
function CloseToken(ctx,h){var st=ensure(ctx),k=String(Number(h)||0);if(!st.tokenHandles[k])return false;delete st.tokenHandles[k];return true;}
function tokenInfo(t,cls){var name=typeof cls==='number'?TOKEN_INFO[cls]:String(cls||'TokenUser');
  if(name==='TokenUser')return{sid:String(t.user_sid||''),username:String(t.username||'')};
  if(name==='TokenGroups')return Object.keys(t.group_sids||{}).map(function(sid){return{sid:sid,attributes:4};});
  if(name==='TokenPrivileges')return Object.keys(t.privileges||{}).map(function(n){return{name:n,enabled:Number(t.privileges[n])===1};});
  if(name==='TokenOwner')return{sid:String(t.user_sid||'')};
  if(name==='TokenPrimaryGroup')return{sid:String(t.primary_group_sid||'')};
  if(name==='TokenType')return String(t.token_type||'PRIMARY');
  if(name==='TokenRestrictedSids')return Object.keys(t.disabled_group_sids||{}).map(function(sid){return{sid:sid};});
  if(name==='TokenGroupsAndPrivileges')return{user_sid:String(t.user_sid||''),groups:tokenInfo(t,'TokenGroups'),privileges:tokenInfo(t,'TokenPrivileges'),restricted:!!t.restricted};
  if(name==='TokenElevation'){var elevated=Object.keys(t.group_sids||{}).some(function(sid){return /-544$/.test(sid);})&&integrityRank(t.integrity_level)>=3;return{TokenIsElevated:!!elevated};}
  if(name==='TokenIntegrityLevel')return{integrityLevel:String(t.integrity_level||'MEDIUM').toUpperCase()};
  if(name==='TokenStatistics')return{tokenId:String(t.token_id||''),tokenType:String(t.token_type||'PRIMARY'),issuedAt:Number(t.issued_at)||0,restricted:!!t.restricted};
  return clone(t);
}
async function DuplicateTokenEx(ctx,h,desired,tokenType){var r=requireTokenAccess(tokenRec(ctx,h),0x0002,'TOKEN_DUPLICATE is required.'),t=clone(r.token),want=Number(desired)>>>0,granted=want?(want&(Number(r.access)>>>0)):(Number(r.access)>>>0);t.token_type=String(tokenType||t.token_type||'PRIMARY').toUpperCase();return allocToken(ctx,t,granted,true);}
function integrityRank(x){x=String(x||'MEDIUM').toUpperCase();return x==='LOW'?1:x==='MEDIUM'?2:x==='HIGH'?3:x==='SYSTEM'?4:2;}
function CreateRestrictedToken(ctx,h,options){var r=requireTokenAccess(tokenRec(ctx,h),0x0002,'TOKEN_DUPLICATE is required to create a restricted token.'),t=clone(r.token),o=options||{},disable=Array.isArray(o.disableSids)?o.disableSids:[],del=Array.isArray(o.deletePrivileges)?o.deletePrivileges:[],i,sid,st=ensure(ctx),requested,current;t.restricted=1;t.token_type='RESTRICTED';t.parent_token_id=String(t.token_id||'');t.token_id='LOCAL-'+String(ctx.pid||0)+'-'+String(st.nextTokenHandle);t.disabled_group_sids=t.disabled_group_sids||{};for(i=0;i<disable.length;i++){sid=String(disable[i]||'');if(t.group_sids&&t.group_sids[sid])delete t.group_sids[sid];if(sid)t.disabled_group_sids[sid]=1;}if(o.removeAdministrators!==false){Object.keys(t.group_sids||{}).forEach(function(k){if(/-544$/.test(k)){delete t.group_sids[k];t.disabled_group_sids[k]=1;}});}for(i=0;i<del.length;i++)if(t.privileges)delete t.privileges[String(del[i])];if(o.stripPrivileges){t.privileges={};}if(o.integrity){current=String(t.integrity_level||'MEDIUM').toUpperCase();requested=String(o.integrity).toUpperCase();if(integrityRank(requested)>integrityRank(current))fail(status('ACCESS_DENIED',0xC0000022),'CreateRestrictedToken cannot raise integrity level.');t.integrity_level=requested;}return allocToken(ctx,t,r.access,true);}
function CheckTokenMembership(ctx,h,sid){var r=h?requireTokenAccess(tokenRec(ctx,h),0x0008,'TOKEN_QUERY is required.'):null,t=r?r.token:null;if(!t)fail(status('INVALID_HANDLE',0xC0000008),'A token handle is required.');sid=String(sid||'');return sid===String(t.user_sid||'')||!!(t.group_sids&&t.group_sids[sid]);}
function PrivilegeCheck(ctx,h,names){var t=requireTokenAccess(tokenRec(ctx,h),0x0008,'TOKEN_QUERY is required.').token,a=Array.isArray(names)?names:[names],missing=[],i,n;for(i=0;i<a.length;i++){n=String(a[i]||'');if(!t.privileges||Number(t.privileges[n])!==1)missing.push(n);}return{result:missing.length===0,missing:missing};}
function AdjustTokenPrivileges(ctx,h,changes){var r=requireTokenAccess(tokenRec(ctx,h),0x0020,'TOKEN_ADJUST_PRIVILEGES is required.'),a=Array.isArray(changes)?changes:[],i,n;if(!r.mutable)fail(status('ACCESS_DENIED',0xC0000022),'Primary process token mutation is denied; duplicate or restrict the token first.');for(i=0;i<a.length;i++){n=String(a[i].name||'');if(!n||!r.token.privileges||!Object.prototype.hasOwnProperty.call(r.token.privileges,n))continue;r.token.privileges[n]=a[i].enabled?1:0;}return true;}
function LookupPrivilegeValue(name){var i=PRIVILEGES.indexOf(String(name||''));if(i<0)return null;return{LowPart:i+1,HighPart:0,name:PRIVILEGES[i]};}
function LookupPrivilegeName(luid){var i=Number(luid&&luid.LowPart!==undefined?luid.LowPart:luid)-1;return i>=0&&i<PRIVILEGES.length?PRIVILEGES[i]:'';}
function validSid(s){return /^S-[0-9]+(?:-[0-9]+)+$/i.test(String(s||''));}


function deriveSamKey(username,password,prep){
  return new Promise(function(resolve,reject){
    if(typeof global.jplopsoft_derivePasswordKeyAsync!=='function'){
      reject(new Error('SAM KDF is unavailable.'));
      return;
    }
    global.jplopsoft_derivePasswordKeyAsync(
      String(password||''),
      {
        username:String(username||'').toLowerCase(),
        salt:String(prep.password_salt||''),
        iterations:Number(prep.password_iterations)||20000,
        title:'LogonUser',
        detail:'ADVAPI32 brokered credential validation'
      },
      function(err,key){
        if(err)reject(err);
        else resolve(String(key||''));
      }
    );
  });
}
async function LogonUser(ctx,username,domain,password,logonType,provider){
  username=String(username||'').trim().toLowerCase();
  if(!username)fail(status('INVALID_PARAMETER',0xC000000D),'LogonUser username is required.');
  if(String(domain||'')&&String(domain||'')!=='.'&&String(domain||'').toUpperCase()!=='EXOS'){
    fail(status('NOT_SUPPORTED',0xC00000BB),'ExOS LogonUser supports local SAM accounts only.');
  }
  var prep=await api('sam_prepare','POST',{username:username}),
      key='',verifier='',proof='',result;
  try{
    key=await deriveSamKey(username,password,prep);
    if(typeof global.jplopsoft_samVerifier!=='function'||typeof global.jplopsoft_samProof!=='function'){
      fail(status('NOT_SUPPORTED',0xC00000BB),'SAM proof helpers are unavailable.');
    }
    verifier=global.jplopsoft_samVerifier(key);
    proof=global.jplopsoft_samProof(String(prep.challenge||''),verifier);
  }finally{
    key='';
  }
  result=await api('sam_validate_credentials','POST',{
    username:username,
    challenge_id:String(prep.challenge_id||''),
    proof:proof
  });
  var admin=String(result.account_type||'').toUpperCase()==='LOCAL_ADMINISTRATOR',
      t={
        token_id:'LOGONUSER-'+String(ctx.pid||0)+'-'+String(Date.now()),
        token_type:'PRIMARY',
        username:String(result.username||username),
        user_sid:String(result.user_sid||''),
        primary_group_sid:String(result.primary_group_sid||''),
        group_sids:{},
        privileges:{SeChangeNotifyPrivilege:1},
        integrity_level:admin?'HIGH':'MEDIUM',
        restricted:false,
        logon_type:Number(logonType)||2,
        logon_provider:Number(provider)||0,
        interactive_session_changed:false
      };
  if(t.primary_group_sid)t.group_sids[t.primary_group_sid]=1;
  if(admin){
    /* Built-in Administrators alias RID 544. Exact machine SID is not required
       for the process-local token facade; membership APIs also see primary group. */
    t.group_sids['S-1-5-32-544']=1;
    t.privileges.SeBackupPrivilege=1;
    t.privileges.SeRestorePrivilege=1;
  }else{
    t.group_sids['S-1-5-32-545']=1;
  }
  return allocToken(ctx,t,0x000F01FF,true);
}


function aclArray(v){if(Array.isArray(v))return v;var d=v&&typeof v==='object'?(v.dacl||v.Dacl||v.aces||v.Aces):null;return Array.isArray(d)?d:[];}
function currentTokenRecord(ctx,h){
  if(h)return requireTokenAccess(tokenRec(ctx,h),0x0008,'TOKEN_QUERY is required.').token;
  var st=ensure(ctx);if(st.impersonationToken&&st.tokenHandles[String(st.impersonationToken)])return st.tokenHandles[String(st.impersonationToken)].token;
  return st.primaryToken||null;
}
function tokenSids(t){var out={},i,g,k;t=t||{};if(t.sid)out[String(t.sid).toUpperCase()]=1;if(t.user_sid)out[String(t.user_sid).toUpperCase()]=1;if(t.user&&t.user.sid)out[String(t.user.sid).toUpperCase()]=1;g=t.groups||t.group_sids||[];if(Array.isArray(g)){for(i=0;i<g.length;i++){var s=typeof g[i]==='string'?g[i]:(g[i]&&g[i].sid);if(s)out[String(s).toUpperCase()]=1;}}else if(g&&typeof g==='object'){for(k in g)if(Object.prototype.hasOwnProperty.call(g,k)&&g[k])out[String(k).toUpperCase()]=1;}out['S-1-1-0']=1;return out;}
function aceMask(ace){return Number(ace&&((ace.accessMask!==undefined?ace.accessMask:ace.mask)!==undefined?(ace.accessMask!==undefined?ace.accessMask:ace.mask):0))>>>0;}
function aceSid(ace){return String(ace&&(ace.sid||ace.trustee||ace.Trustee||ace.account)||'').toUpperCase();}
function accessCheckPure(sd,tok,desired){
  var aces=aclArray(sd),sids=tokenSids(tok),want=Number(desired)>>>0,granted=0,denied=0,i,ace,sid,mask,type;
  if(!aces.length)return{accessStatus:true,grantedAccess:want,deniedAccess:0,reason:'No DACL in facade descriptor.'};
  for(i=0;i<aces.length;i++){ace=aces[i]||{};sid=aceSid(ace);if(sid&&sids[sid]!==1)continue;mask=aceMask(ace);type=String(ace.type||ace.accessMode||ace.mode||'ALLOW').toUpperCase();if(type.indexOf('DENY')>=0)denied|=mask;else granted|=mask;}
  var grantedWant=(want&granted)>>>0,deniedWant=(want&denied)>>>0;return{accessStatus:(deniedWant===0&&grantedWant===want),grantedAccess:grantedWant,deniedAccess:deniedWant};
}
async function regDeleteTree(ctx,hKey,subKey){
  var h=await regOpen(ctx,hKey,subKey,0x20006,false),info=await RegQueryInfoKey(ctx,h),names=[],i;
  for(i=0;i<Number(info.subKeyCount||info.subKeys||0);i++){try{var e=await RegEnumKeyEx(ctx,h,i);if(e&&e.name)names.push(e.name);}catch(ignoreEnum){}}
  for(i=0;i<names.length;i++)await regDeleteTree(ctx,h,names[i]);
  var vals=[];info=await RegQueryInfoKey(ctx,h);for(i=0;i<Number(info.valueCount||info.values||0);i++){try{var v=await RegEnumValue(ctx,h,i);if(v&&v.name!==undefined)vals.push(v.name);}catch(ignoreVal){}}
  for(i=0;i<vals.length;i++)await RegDeleteValue(ctx,h,vals[i]);await regClose(ctx,h);return await RegDeleteKey(ctx,hKey,subKey);
}
async function regCopyTree(ctx,srcKey,dstKey){
  var si=await RegQueryInfoKey(ctx,srcKey),i,v,k,childSrc,childDst;
  for(i=0;i<Number(si.valueCount||si.values||0);i++){v=await RegEnumValue(ctx,srcKey,i);if(v){var q=await RegQueryValueEx(ctx,srcKey,v.name);await RegSetValueEx(ctx,dstKey,v.name,q.type,q.data);}}
  var children=[];for(i=0;i<Number(si.subKeyCount||si.subKeys||0);i++){k=await RegEnumKeyEx(ctx,srcKey,i);if(k&&k.name)children.push(k.name);}
  for(i=0;i<children.length;i++){childSrc=await regOpen(ctx,srcKey,children[i],0x20019,false);var cr=await regOpen(ctx,dstKey,children[i],0x20006,true);childDst=cr&&cr.hKey?cr.hKey:cr;await regCopyTree(ctx,childSrc,childDst);await regClose(ctx,childSrc);await regClose(ctx,childDst);}return true;
}


function initSecurityDescriptor(){return{revision:1,control:0,owner:'',group:'',daclPresent:false,dacl:null,saclPresent:false,sacl:null};}
function sdObj(v){if(!v||typeof v!=='object')return initSecurityDescriptor();return clone(v);}
function wellKnownSid(kind){var k=String(kind||'').toUpperCase(),m={WINWORLDSID:'S-1-1-0',WINAUTHENTICATEDUSERSID:'S-1-5-11',WINBUILTINADMINISTRATORSSID:'S-1-5-32-544',WINBUILTINUSERSSID:'S-1-5-32-545',WINLOCALSYSTEMSID:'S-1-5-18',WINLOCALSSERVICE:'S-1-5-19',WINNETWORKSERVICE:'S-1-5-20'};return m[k]||'';}
function sidLength(s){return validSid(s)?(8+Math.max(0,String(s).split('-').length-3)*4):0;}

async function dispatch(ctx,method,args){
  args=args||[];method=String(method||'');
  if(method==='GetVersion'||method==='QueryCapabilities')return{version:ADV.version,model:ADV.model,compatibility:ADV.compatibility,registry:true,tokens:true,acl:true,securityDescriptors:true,impersonation:true,hostRegistry:false};
  args=args||[];ensure(ctx);
  if(method==='RegOpenKeyEx')return await regOpen(ctx,args[0],args[1],args[2],false);
  if(method==='RegOpenKey'||method==='RegOpenKeyA'||method==='RegOpenKeyW')return await regOpen(ctx,args[0],args[1],'KEY_READ',false);
  if(method==='RegCreateKeyEx')return await regOpen(ctx,args[0],args[1],args[2],true);
  if(method==='RegCreateKey'||method==='RegCreateKeyA'||method==='RegCreateKeyW')return await regOpen(ctx,args[0],args[1],'KEY_ALL_ACCESS',true);
  if(method==='RegLoadKey'||method==='RegLoadKeyA'||method==='RegLoadKeyW')fail(status('NOT_SUPPORTED',0xC00000BB),'Raw Windows registry hive loading is not supported; ExOS Registry is an authenticated ExFS hive.');
  if(method==='RegCloseKey')return await regClose(ctx,args[0]);
  if(method==='RegQueryValueEx'||method==='RegGetValue')return await RegQueryValueEx(ctx,args[0],args[1]);
  if(method==='RegQueryValue'||method==='RegQueryValueA'||method==='RegQueryValueW'){
    var qh=args[1]?await regOpen(ctx,args[0],args[1],'KEY_READ',false):args[0],qv;
    try{qv=await RegQueryValueEx(ctx,qh,'');}
    finally{if(qh!==args[0])try{await regClose(ctx,qh);}catch(ignoreLegacyQueryClose){}}
    return qv;
  }
  if(method==='RegSetValueEx')return await RegSetValueEx(ctx,args[0],args[1],args[2],args[3]);
  if(method==='RegSetValue'||method==='RegSetValueA'||method==='RegSetValueW'){
    var sh=args[1]?await regOpen(ctx,args[0],args[1],'KEY_ALL_ACCESS',true):args[0],sv;
    try{sv=await RegSetValueEx(ctx,sh,'',args[2],args[3]);}
    finally{if(sh!==args[0])try{await regClose(ctx,sh);}catch(ignoreLegacySetClose){}}
    return sv;
  }
  if(method==='RegEnumKeyEx')return await RegEnumKeyEx(ctx,args[0],args[1]);
  if(method==='RegEnumKey'||method==='RegEnumKeyA'||method==='RegEnumKeyW'){var ek=await RegEnumKeyEx(ctx,args[0],args[1]);return ek?String(ek.name||ek.key||''):null;}
  if(method==='RegEnumValue')return await RegEnumValue(ctx,args[0],args[1]);
  if(method==='RegQueryInfoKey')return await RegQueryInfoKey(ctx,args[0]);
  if(method==='RegDeleteValue')return await RegDeleteValue(ctx,args[0],args[1]);
  if(method==='RegDeleteKey')return await RegDeleteKey(ctx,args[0],args[1]);
  if(method==='RegFlushKey')return await RegFlushKey(ctx,args[0]);

  if(method==='GetAclInformation'){var aa=aclArray(args[0]);return{AceCount:aa.length,AclBytesInUse:aa.length*32+8,AclRevision:2};}
  if(method==='InitializeSecurityDescriptor')return initSecurityDescriptor();
  if(method==='GetSecurityDescriptorControl'){var sdo=sdObj(args[0]);return{control:Number(sdo.control)||0,revision:Number(sdo.revision)||1};}
  if(method==='SetSecurityDescriptorControl'){sdo=sdObj(args[0]);var mask=Number(args[1])>>>0,bits=Number(args[2])>>>0;sdo.control=((Number(sdo.control)||0)&~mask)|(bits&mask);return sdo;}
  if(method==='GetSecurityDescriptorOwner'){sdo=sdObj(args[0]);return{owner:String(sdo.owner||''),defaulted:false};}
  if(method==='SetSecurityDescriptorOwner'){sdo=sdObj(args[0]);sdo.owner=String(args[1]||'');return sdo;}
  if(method==='GetSecurityDescriptorGroup'){sdo=sdObj(args[0]);return{group:String(sdo.group||''),defaulted:false};}
  if(method==='SetSecurityDescriptorGroup'){sdo=sdObj(args[0]);sdo.group=String(args[1]||'');return sdo;}
  if(method==='GetSecurityDescriptorDacl'){sdo=sdObj(args[0]);return{present:!!sdo.daclPresent,dacl:clone(sdo.dacl),defaulted:false};}
  if(method==='SetSecurityDescriptorDacl'){sdo=sdObj(args[0]);sdo.daclPresent=!!args[1];sdo.dacl=args[1]?aclArray(args[2]):null;return sdo;}
  if(method==='GetSecurityDescriptorSacl'){sdo=sdObj(args[0]);return{present:!!sdo.saclPresent,sacl:clone(sdo.sacl),defaulted:false};}
  if(method==='SetSecurityDescriptorSacl'){sdo=sdObj(args[0]);sdo.saclPresent=!!args[1];sdo.sacl=args[1]?aclArray(args[2]):null;return sdo;}
  if(method==='IsValidSecurityDescriptor'){return !!(args[0]&&typeof args[0]==='object'&&Number(args[0].revision||1)===1);}
  if(method==='GetSecurityDescriptorLength'){var js=JSON.stringify(sdObj(args[0]));return js.length;}
  if(method==='MakeSelfRelativeSD'||method==='MakeAbsoluteSD')return sdObj(args[0]);
  if(method==='CreateWellKnownSid'){var ws=wellKnownSid(args[0]);if(!ws)fail(status('INVALID_PARAMETER',0xC000000D),'Unsupported WELL_KNOWN_SID_TYPE.');return ws;}
  if(method==='IsWellKnownSid'){var expected=wellKnownSid(args[1]);return !!expected&&String(args[0]||'').toUpperCase()===expected.toUpperCase();}
  if(method==='GetLengthSid')return sidLength(args[0]);
  if(method==='CopySid'){var cs=String(args[0]||'');if(!validSid(cs))fail(status('INVALID_PARAMETER',0xC000000D),'Invalid SID.');return cs;}
  if(method==='AllocateAndInitializeSid'){var auth=Number(args[0])||5,subs=Array.isArray(args[1])?args[1]:Array.prototype.slice.call(args,1),sid='S-1-'+auth;for(var sj=0;sj<subs.length&&sj<8;sj++)sid+='-'+String(Number(subs[sj])>>>0);return sid;}
  if(method==='FreeSid')return true;
  if(method==='BuildTrusteeWithSid')return{trusteeType:'TRUSTEE_IS_SID',sid:String(args[0]||'')};
  if(method==='BuildTrusteeWithName')return{trusteeType:'TRUSTEE_IS_NAME',name:String(args[0]||'')};
  if(method==='GetAce'){var al=aclArray(args[0]),ix=Number(args[1])|0;if(ix<0||ix>=al.length)fail(status('INVALID_PARAMETER',0xC000000D),'ACE index out of range.');return clone(al[ix]);}
  if(method==='AddAce'){var list=aclArray(args[0]).slice(),ace=clone(args[1]||{}),pos=args[2]===undefined?list.length:Math.max(0,Math.min(list.length,Number(args[2])|0));list.splice(pos,0,ace);return list;}
  if(method==='DeleteAce'){list=aclArray(args[0]).slice();ix=Number(args[1])|0;if(ix<0||ix>=list.length)return list;list.splice(ix,1);return list;}
  if(method==='AccessCheck'){var tk=args[1]?currentTokenRecord(ctx,args[1]):await primaryToken(ctx);return accessCheckPure(args[0],tk,args[2]);}
  if(method==='OpenThreadToken'){var stt=ensure(ctx);if(!stt.impersonationToken)fail(status('NO_TOKEN',0xC000007C),'Current ExOS XSH thread is not impersonating.');return stt.impersonationToken;}
  if(method==='SetThreadToken'){var sth=ensure(ctx);if(!args[0]){sth.impersonationToken=0;return true;}requireTokenAccess(tokenRec(ctx,args[0]),0x0004,'TOKEN_IMPERSONATE is required.');sth.impersonationToken=Number(args[0])||0;return true;}
  if(method==='ImpersonateLoggedOnUser'){var sr=tokenRec(ctx,args[0]);requireTokenAccess(sr,0x0004,'TOKEN_IMPERSONATE is required.');ensure(ctx).impersonationToken=Number(args[0])||0;return true;}
  if(method==='RevertToSelf'){ensure(ctx).impersonationToken=0;return true;}
  if(method==='RegDeleteTree'||method==='RegDeleteTreeA'||method==='RegDeleteTreeW')return await regDeleteTree(ctx,args[0],args[1]);
  if(method==='RegCopyTree'||method==='RegCopyTreeA'||method==='RegCopyTreeW')return await regCopyTree(ctx,args[0],args[1]);
  if(method==='RegQueryMultipleValues'){var names=Array.isArray(args[1])?args[1]:[],vals={},vi;for(vi=0;vi<names.length;vi++)vals[String(names[vi])]=await RegQueryValueEx(ctx,args[0],names[vi]);return vals;}

  if(method==='ConvertStringSecurityDescriptorToSecurityDescriptor')return await global.jplopsoft_xshSddlCompile(ctx,args[0]);
  if(method==='ConvertSecurityDescriptorToStringSecurityDescriptor')return descriptorToSddl(args[0]);
  if(method==='GetFileSecurity')return await global.jplopsoft_xshGetFileSddl(ctx,args[0]);
  if(method==='SetFileSecurity')return await global.jplopsoft_xshSetFileSddl(ctx,args[0],typeof args[1]==='string'?args[1]:descriptorToSddl(args[1]));
  if(method==='GetNamedSecurityInfo'){if((typeof args[0]==='string'&&isRegistryTarget(args[0]))||rootInfo(args[0])||ensure(ctx).registryHandles[String(args[0]||'')])return await registrySecurity(ctx,args[0],false);return await global.jplopsoft_xshGetFileSddl(ctx,args[0]);}
  if(method==='SetNamedSecurityInfo'){if((typeof args[0]==='string'&&isRegistryTarget(args[0]))||rootInfo(args[0])||ensure(ctx).registryHandles[String(args[0]||'')])return await registrySecurity(ctx,args[0],true,typeof args[1]==='string'?args[1]:descriptorToSddl(args[1]));return await global.jplopsoft_xshSetFileSddl(ctx,args[0],typeof args[1]==='string'?args[1]:descriptorToSddl(args[1]));}
  if(method==='GetSecurityInfo'){var r=ensure(ctx).registryHandles[String(args[0]||'')]||rootInfo(args[0]);if(r)return await registrySecurity(ctx,args[0],false);var fh=ctx.handles&&ctx.handles[String(Number(args[0])||0)];if(fh&&fh.kind==='exfs-file'){var out=await api('security_get_sddl','POST',{id:Number(fh.nodeId)||0});return{sddl:String(out.sddl||''),descriptor:out.descriptor||{}};}fail(status('INVALID_HANDLE',0xC0000008),'Unsupported security object handle.');}
  if(method==='SetSecurityInfo'){var rr=ensure(ctx).registryHandles[String(args[0]||'')]||rootInfo(args[0]);if(rr)return await registrySecurity(ctx,args[0],true,typeof args[1]==='string'?args[1]:descriptorToSddl(args[1]));var f=ctx.handles&&ctx.handles[String(Number(args[0])||0)];if(f&&f.kind==='exfs-file'){var sd=typeof args[1]==='string'?args[1]:descriptorToSddl(args[1]),o=await api('security_set_sddl','POST',{id:Number(f.nodeId)||0,sddl:sd});return String(o.sddl||'');}fail(status('INVALID_HANDLE',0xC0000008),'Unsupported security object handle.');}
  if(method==='InitializeAcl')return[];
  if(method==='SetEntriesInAcl')return SetEntriesInAcl(args[0],args[1]);
  if(method==='GetExplicitEntriesFromAcl')return clone(Array.isArray(args[0])?args[0]:[]);
  if(method==='OpenProcessToken')return await OpenProcessToken(ctx,args[0],args[1]);
  if(method==='GetTokenInformation')return tokenInfo(requireTokenAccess(tokenRec(ctx,args[0]),0x0008,'TOKEN_QUERY is required.').token,args[1]);
  if(method==='DuplicateTokenEx')return await DuplicateTokenEx(ctx,args[0],args[1],args[2]);
  if(method==='DuplicateToken')return await DuplicateTokenEx(ctx,args[0],0,args[1]||'IMPERSONATION');
  if(method==='SetTokenInformation'){var tr=tokenRec(ctx,args[0]);if(!tr.mutable)fail(status('ACCESS_DENIED',0xC0000022),'Token is not mutable.');var cls=typeof args[1]==='number'?TOKEN_INFO[args[1]]:String(args[1]||''),val=args[2];if(cls==='TokenIntegrityLevel'){var lvl=String(val&&val.integrityLevel!==undefined?val.integrityLevel:val||'').toUpperCase(),cur=String(tr.token.integrity_level||'MEDIUM').toUpperCase();if(integrityRank(lvl)>integrityRank(cur))fail(status('ACCESS_DENIED',0xC0000022),'SetTokenInformation cannot raise integrity.');tr.token.integrity_level=lvl;return true;}if(cls==='TokenSessionId'){tr.token.session_id=Number(val)||0;return true;}fail(status('NOT_SUPPORTED',0xC00000BB),'SetTokenInformation class is not supported.');}
  if(method==='CreateRestrictedToken')return CreateRestrictedToken(ctx,args[0],args[1]);
  if(method==='CheckTokenMembership')return CheckTokenMembership(ctx,args[0],args[1]);
  if(method==='PrivilegeCheck')return PrivilegeCheck(ctx,args[0],args[1]);
  if(method==='AdjustTokenPrivileges')return AdjustTokenPrivileges(ctx,args[0],args[1]);
  if(method==='LookupPrivilegeValue')return LookupPrivilegeValue(args[0]);
  if(method==='LookupPrivilegeName')return LookupPrivilegeName(args[0]);
  if(method==='GetUserName'){var t=await primaryToken(ctx);return String(t.username||'');}
  if(method==='LogonUser'||method==='LogonUserA'||method==='LogonUserW')return await LogonUser(ctx,args[0],args[1],args[2],args[3],args[4]);
  if(method==='LookupAccountSid'){var lo=await api('security_lookup_account_sid','POST',{sid:String(args[0]||'')});return lo.principal||null;}
  if(method==='LookupAccountName'){var ln=await api('security_lookup_account_name','POST',{name:String(args[0]||'')});return ln.principal||null;}
  if(method==='ConvertSidToStringSid')return String(args[0]||'');
  if(method==='ConvertStringSidToSid'){var s=String(args[0]||'');if(!validSid(s))fail(status('INVALID_PARAMETER',0xC000000D),'Invalid SID.');return s;}
  if(method==='IsValidSid')return validSid(args[0]);
  if(method==='EqualSid')return String(args[0]||'').toUpperCase()===String(args[1]||'').toUpperCase();
  if(method==='CloseToken')return CloseToken(ctx,args[0]);
  fail(status('NOT_SUPPORTED',0xC00000BB),'Unsupported advapi32 method: '+method);
}

function cleanup(ctx){
  var st=ctx&&ctx.advapi32,k,rec;
  if(!st)return;
  for(k in st.registryHandles){if(Object.prototype.hasOwnProperty.call(st.registryHandles,k)){rec=st.registryHandles[k];if(rec&&rec.serverHandle){try{api('reg_close_key','POST',{handle:rec.serverHandle}).catch(function(){});}catch(ignore){}}}}
  st.registryHandles={};st.tokenHandles={};st.primaryToken=null;
}
function closeHandle(ctx,h){var st=ctx&&ctx.advapi32,k=String(Number(h)||0);if(!st||!st.tokenHandles[k])return false;delete st.tokenHandles[k];return true;}

global.jplopsoft_ADVAPI32=ADV;
global.jplopsoft_advapi32Dispatch=dispatch;
global.jplopsoft_advapi32CleanupContext=cleanup;
global.jplopsoft_advapi32CloseHandle=closeHandle;
})(window);
