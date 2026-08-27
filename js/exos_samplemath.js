/* ExOS Hotfix68 sample self-registering XDL backing asset.
 * Upload this exos_*.js asset to the same trusted Runtime CDN mirrors as exos.js.
 *
 * NT/Win32-style responsibility split:
 *   regxdl32.xsh -> LoadLibraryEx/GetProcAddress -> calls these exports.
 *   THIS module's DllRegisterServer/DllUnregisterServer/DllInstall exports
 *   perform the self-registration work. regxdl32 does not edit the registry.
 */
(function(global){
'use strict';
const MODULE='samplemath.xdl';
const S_OK=0;
function DllMain(ctx,hModule,reason,reserved){return true;}
async function DllRegisterServer(ctx){
  return await global.jplopsoft_XdlRegisterSelf(ctx,MODULE,'');
}
async function DllUnregisterServer(ctx){
  return await global.jplopsoft_XdlUnregisterSelf(ctx,MODULE);
}
async function DllInstall(ctx,install,cmdLine){
  return install
    ? await global.jplopsoft_XdlRegisterSelf(ctx,MODULE,String(cmdLine||''))
    : await global.jplopsoft_XdlUnregisterSelf(ctx,MODULE);
}
function Add(ctx,a,b){return Number(a||0)+Number(b||0);}
function Multiply(ctx,a,b){return Number(a||0)*Number(b||0);}
function GetVersion(ctx){return{module:MODULE,version:'1.0.0',model:'EXOS_XDL_PE_V1'};}
if(typeof global.jplopsoft_RegisterXdlRuntimeModule!=='function')throw new Error('ExOS XDL runtime registration API is unavailable.');
global.jplopsoft_RegisterXdlRuntimeModule(MODULE,{
  DllMain:DllMain,
  DllRegisterServer:DllRegisterServer,
  DllUnregisterServer:DllUnregisterServer,
  DllInstall:DllInstall,
  Add:Add,
  Multiply:Multiply,
  GetVersion:GetVersion
},{version:'1.0.0'});
})(window);
