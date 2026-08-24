/*
 * ExOS Frontend Module
 * Version: 6.4.0-dev-os24
 *
 * Stable ExOS browser-side operating-system UI functions extracted from exos.php:
 * - CMD shell / parser / commands
 * - 3D Volume / Three.js presentation
 * - Explorer shell / context menus / clipboard / move / trash / properties
 * - HTML / CSV / image / media editor and preview
 *
 * This file is a classic script (not an ES module) for IE11 compatibility.
 * It expects the ExOS core globals/state to have been initialized by exos.php
 * before any of these functions are invoked.
 */

/*
 * Built-in ExFS Desktop wallpaper, 3840x2160 vector.
 * Base64 is embedded in exfs_os.js so all CDN nodes use the same image.
 */
var jplopsoft_EXFS_DESKTOP_WALLPAPER_DATA_URI='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzODQwIiBoZWlnaHQ9IjIxNjAiIHZpZXdCb3g9IjAgMCAzODQwIDIxNjAiPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzBiNzZjNSIvPjxzdG9wIG9mZnNldD0iLjQ4IiBzdG9wLWNvbG9yPSIjMDc1OTk1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDQyYTRmIi8+PC9saW5lYXJHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJnbG93IiBjeD0iLjcyIiBjeT0iLjQ2IiByPSIuNTIiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzlkZTJmZiIgc3RvcC1vcGFjaXR5PSIuNDUiLz48c3RvcCBvZmZzZXQ9Ii4zOCIgc3RvcC1jb2xvcj0iIzUyYjllZiIgc3RvcC1vcGFjaXR5PSIuMTgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDE1MmIiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFuZSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2U5ZjhmZiIgc3RvcC1vcGFjaXR5PSIuOSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzY2YzlmNSIgc3RvcC1vcGFjaXR5PSIuMjYiLz48L2xpbmVhckdyYWRpZW50Pgo8ZmlsdGVyIGlkPSJzb2Z0IiB4PSItNDAlIiB5PSItNDAlIiB3aWR0aD0iMTgwJSIgaGVpZ2h0PSIxODAlIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzNCIvPjwvZmlsdGVyPgo8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiPjxmZURyb3BTaGFkb3cgZHg9IjAiIGR5PSIyNCIgc3RkRGV2aWF0aW9uPSIzNiIgZmxvb2QtY29sb3I9IiMwMDE0MjUiIGZsb29kLW9wYWNpdHk9Ii41MiIvPjwvZmlsdGVyPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIzODQwIiBoZWlnaHQ9IjIxNjAiIGZpbGw9InVybCgjYmcpIi8+PHJlY3Qgd2lkdGg9IjM4NDAiIGhlaWdodD0iMjE2MCIgZmlsbD0idXJsKCNnbG93KSIvPgo8cGF0aCBkPSJNMCAxNzYwIEwyNzkwIDcyMCBMMzg0MCAxMDQwIEwzODQwIDIxNjAgTDAgMjE2MFoiIGZpbGw9IiMwYjgwY2MiIG9wYWNpdHk9Ii4xMSIvPgo8cGF0aCBkPSJNMCAyMDYwIEwyNjMwIDgxMCBMMzg0MCAxMjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiNiY2VjZmYiIHN0cm9rZS13aWR0aD0iNCIgb3BhY2l0eT0iLjA4Ii8+CjxlbGxpcHNlIGN4PSIyODQwIiBjeT0iMTAzMCIgcng9Ijc5MCIgcnk9IjcwMCIgZmlsbD0iIzU2YzZmZiIgb3BhY2l0eT0iLjEyIiBmaWx0ZXI9InVybCgjc29mdCkiLz4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCA0NjApIHNrZXdZKC01KSIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiIG9wYWNpdHk9Ii43OCI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI0NTAiIGhlaWdodD0iNDcwIiBmaWxsPSJ1cmwoI3BhbmUpIi8+PHJlY3QgeD0iNDgyIiB5PSIwIiB3aWR0aD0iNTIwIiBoZWlnaHQ9IjQ3MCIgZmlsbD0idXJsKCNwYW5lKSIvPgo8cmVjdCB4PSIwIiB5PSI1MDIiIHdpZHRoPSI0NTAiIGhlaWdodD0iNTEwIiBmaWxsPSJ1cmwoI3BhbmUpIi8+PHJlY3QgeD0iNDgyIiB5PSI1MDIiIHdpZHRoPSI1MjAiIGhlaWdodD0iNTEwIiBmaWxsPSJ1cmwoI3BhbmUpIi8+CjxwYXRoIGQ9Ik00NTAgMCBMNDgyIDAgTDQ4MiAxMDEyIEw0NTAgMTAxMloiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4xNCIvPjxwYXRoIGQ9Ik0wIDQ3MCBMMTAwMiA0NzAgTDEwMDIgNTAyIEwwIDUwMloiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4xMiIvPgo8L2c+Cjwvc3ZnPg==';

function jplopsoft_applyDesktopWallpaper(){
  var d=jplopsoft_el('jplopsoft_desktopSurface');

  if(!d)return;

  /*
   * os24: one wallpaper only.
   * Using the background shorthand deliberately clears any older gradient,
   * multi-background or cached inline layer before applying the Base64 SVG.
   */
  d.style.background=
    '#075b9e url("'+
    jplopsoft_EXFS_DESKTOP_WALLPAPER_DATA_URI+
    '") center center / cover no-repeat';

  d.setAttribute('data-exos-wallpaper-layers','1');
}

var jplopsoft_EXFS_SVG_ICONS={
  'calc':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMyIgeT0iMiIgd2lkdGg9IjE4IiBoZWlnaHQ9IjIwIiByeD0iMiIgZmlsbD0iI2VhZjRmZiIgc3Ryb2tlPSIjM2I2ZjljIi8+PHJlY3QgeD0iNiIgeT0iNSIgd2lkdGg9IjEyIiBoZWlnaHQ9IjQiIHJ4PSIuNyIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjOGFhNmJkIi8+PGcgZmlsbD0iIzJmODBjOSI+PHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSIyLjYiIGhlaWdodD0iMi42IiByeD0iLjQiLz48cmVjdCB4PSIxMC43IiB5PSIxMiIgd2lkdGg9IjIuNiIgaGVpZ2h0PSIyLjYiIHJ4PSIuNCIvPjxyZWN0IHg9IjE1LjQiIHk9IjEyIiB3aWR0aD0iMi42IiBoZWlnaHQ9IjIuNiIgcng9Ii40Ii8+PHJlY3QgeD0iNiIgeT0iMTYuNCIgd2lkdGg9IjIuNiIgaGVpZ2h0PSIyLjYiIHJ4PSIuNCIvPjxyZWN0IHg9IjEwLjciIHk9IjE2LjQiIHdpZHRoPSIyLjYiIGhlaWdodD0iMi42IiByeD0iLjQiLz48cmVjdCB4PSIxNS40IiB5PSIxNi40IiB3aWR0aD0iMi42IiBoZWlnaHQ9IjIuNiIgcng9Ii40Ii8+PC9nPjwvc3ZnPg==',
  'calendar':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMyIgeT0iNC41IiB3aWR0aD0iMTgiIGhlaWdodD0iMTYiIHJ4PSIxLjgiIGZpbGw9IiNlZWY2ZmYiIHN0cm9rZT0iIzNiNmY5YyIvPjxwYXRoIGQ9Ik0zIDloMTgiIHN0cm9rZT0iIzNiNmY5YyIvPjxwYXRoIGQ9Ik03IDIuOHY0TTE3IDIuOHY0IiBzdHJva2U9IiMyZjgwYzkiIHN0cm9rZS13aWR0aD0iMS44IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZyBmaWxsPSIjMmY4MGM5Ij48cmVjdCB4PSI2IiB5PSIxMiIgd2lkdGg9IjIuNCIgaGVpZ2h0PSIyLjQiIHJ4PSIuNCIvPjxyZWN0IHg9IjEwLjgiIHk9IjEyIiB3aWR0aD0iMi40IiBoZWlnaHQ9IjIuNCIgcng9Ii40Ii8+PHJlY3QgeD0iMTUuNiIgeT0iMTIiIHdpZHRoPSIyLjQiIGhlaWdodD0iMi40IiByeD0iLjQiLz48cmVjdCB4PSI2IiB5PSIxNiIgd2lkdGg9IjIuNCIgaGVpZ2h0PSIyLjQiIHJ4PSIuNCIvPjxyZWN0IHg9IjEwLjgiIHk9IjE2IiB3aWR0aD0iMi40IiBoZWlnaHQ9IjIuNCIgcng9Ii40Ii8+PC9nPjwvc3ZnPg==',
  'chevron_left':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0ibTE0LjUgNi02IDYgNiA2IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iMS44IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=',
  'chevron_right':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0ibTkuNSA2IDYgNi02IDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIxLjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
  'close':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0ibTcgNyAxMCAxME0xNyA3IDcgMTciIHN0cm9rZT0iIzExMTgyNyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  'cmd':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMiIgeT0iMyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjE4IiByeD0iMS44IiBmaWxsPSIjMTAxMjE0IiBzdHJva2U9IiM2YjcyODAiLz48cGF0aCBkPSJtNiA4IDQgMy00IDNNMTIgMTVoNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjhmYWZjIiBzdHJva2Utd2lkdGg9IjEuNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+',
  'computer':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMi41IiB5PSIzLjUiIHdpZHRoPSIxOSIgaGVpZ2h0PSIxMyIgcng9IjEuNiIgZmlsbD0iI2U4ZjRmZiIgc3Ryb2tlPSIjMmI2ZWE2Ii8+PHJlY3QgeD0iNSIgeT0iNiIgd2lkdGg9IjE0IiBoZWlnaHQ9IjgiIGZpbGw9IiM0ZGEzZDkiLz48cGF0aCBkPSJNOSAxOWg2bS04IDJoMTAiIHN0cm9rZT0iI2Q4ZTdmMSIgc3Ryb2tlLXdpZHRoPSIxLjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  'control':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U4ZjJmYiIgc3Ryb2tlPSIjNWY3Zjk5IiBkPSJtMTAuNiAyIC41IDJhOCA4IDAgMCAxIDEuOCAwbC41LTIgMi4yLjktLjcgMS45cS44LjUgMS4zIDEuM2wxLjktLjcuOSAyLjItMiAuNWE4IDggMCAwIDEgMCAxLjhsMiAuNS0uOSAyLjItMS45LS43cS0uNS44LTEuMyAxLjNsLjcgMS45LTIuMi45LS41LTJhOCA4IDAgMCAxLTEuOCAwbC0uNSAyLTIuMi0uOS43LTEuOWE3IDcgMCAwIDEtMS4zLTEuM2wtMS45LjctLjktMi4yIDItLjVhOCA4IDAgMCAxIDAtMS44bC0yLS41LjktMi4yIDEuOS43cS41LS44IDEuMy0xLjNsLS43LTEuOXoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjkiIHI9IjMiIGZpbGw9IiM0Y2E0ZDgiLz48L3N2Zz4=',
  'csv':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMS41IiBmaWxsPSIjZWRmZGY1IiBzdHJva2U9IiMyMzg2NWQiLz48cGF0aCBkPSJNMyA4aDE4TTMgMTNoMThNOCAzdjE4TTE0IDN2MTgiIHN0cm9rZT0iIzM3YTg3NCIgc3Ryb2tlLXdpZHRoPSIxLjIiLz48L3N2Zz4=',
  'desktop':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMi41IiB5PSIzIiB3aWR0aD0iMTkiIGhlaWdodD0iMTQiIHJ4PSIxLjUiIGZpbGw9IiNkZmYzZmYiIHN0cm9rZT0iIzJiNmVhNiIvPjxwYXRoIGQ9Ik00LjUgMTQgMTAgOWwzLjIgMi44IDIuMS0yIDQuMiA0LjJ6IiBmaWxsPSIjMzlhMGQ4Ii8+PHBhdGggZD0iTTkgMjBoNm0tOCAyaDEwIiBzdHJva2U9IiNjYmQ1ZTEiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
  'download':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDN2MTFtLTQtNCA0IDQgNC00TTUgMTloMTQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIxLjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
  'explorer':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIuNSA2LjVoOGwyLTJoOXYxNWgtMTl6IiBmaWxsPSIjZmZkNDVkIiBzdHJva2U9IiNiYjhhMTEiLz48cGF0aCBkPSJNMyA5aDE4bC0xLjcgMTBINC43eiIgZmlsbD0iI2ZmZTI4YSIvPjwvc3ZnPg==',
  'file':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTUgMmgxMGw0IDR2MTZINXoiIGZpbGw9IiNmOGZhZmMiIHN0cm9rZT0iIzY0NzQ4YiIvPjxwYXRoIGQ9Ik0xNSAydjVoNCIgZmlsbD0iI2RiZWFmZSIvPjwvc3ZnPg==',
  'folder':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIuNSA2aDhsMi0yaDl2MTZoLTE5eiIgZmlsbD0iI2ZmZDU1ZiIgc3Ryb2tlPSIjYjk4MjA4Ii8+PHBhdGggZD0iTTMgOWgxOCIgc3Ryb2tlPSIjZTNhZDJlIi8+PC9zdmc+',
  'history':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTUgN1YzTDIgNmwzIDNWN2E4IDggMCAxIDEtMSA4IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTIgN3Y1bDMgMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
  'html':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTUgMmgxMGw0IDR2MTZINXoiIGZpbGw9IiNmZmY0ZWQiIHN0cm9rZT0iI2MyNWQyNSIvPjxwYXRoIGQ9Ik0xNSAydjVoNCIgZmlsbD0iI2ZlZDdhYSIvPjxwYXRoIGQ9Im0xMCAxMS0zIDMgMyAzbTQtNiAzIDMtMyAzIiBmaWxsPSJub25lIiBzdHJva2U9IiNlYTU4MGMiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=',
  'link':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTkuNSAxNC41IDE0LjUgOW0tOCA5LjUtMS0xYTQgNCAwIDAgMSAwLTUuN2wzLTNhNCA0IDAgMCAxIDUuNyAwbDEgMW0yLjMtNC4zIDEgMWE0IDQgMCAwIDEgMCA1LjdsLTMgM2E0IDQgMCAwIDEtNS43IDBsLTEtMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2I4MmY2IiBzdHJva2Utd2lkdGg9IjEuNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
  'maximize':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iNiIgeT0iNSIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTE4MjciIHN0cm9rZS13aWR0aD0iMS40Ii8+PC9zdmc+',
  'minimize':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTYgMTZoMTIiIHN0cm9rZT0iIzExMTgyNyIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48L3N2Zz4=',
  'print':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTcgM2gxMHY1SDd6TTYgMTZoMTJ2NUg2eiIgZmlsbD0iI2VhZjJmNyIgc3Ryb2tlPSIjNTU2YjdhIi8+PHJlY3QgeD0iMyIgeT0iOCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjY2JkNWUxIiBzdHJva2U9IiM1NTZiN2EiLz48Y2lyY2xlIGN4PSIxNy41IiBjeT0iMTEuNSIgcj0iMSIgZmlsbD0iIzI1NjNlYiIvPjwvc3ZnPg==',
  'properties':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOSIgZmlsbD0iI2VhZjRmZiIgc3Ryb2tlPSIjM2I4MmY2Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSIxLjMiIGZpbGw9IiMyNTYzZWIiLz48cGF0aCBkPSJNMTIgMTF2NiIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjEuNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
  'save':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTQgM2gxNGwyIDJ2MTZINHoiIGZpbGw9IiNkYmVhZmUiIHN0cm9rZT0iIzNiNmY5YyIvPjxwYXRoIGQ9Ik03IDNoOHY2SDd6IiBmaWxsPSIjZmZmIiBzdHJva2U9IiMzYjZmOWMiLz48cmVjdCB4PSI3IiB5PSIxMyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjYiIHJ4PSIxIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  'security':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDIgMjAgNXY2YzAgNS0zLjIgOC43LTggMTEtNC44LTIuMy04LTYtOC0xMVY1eiIgZmlsbD0iIzJkOGZkNSIvPjxwYXRoIGQ9Ik0xMiA1djEzLjZjMy4yLTEuOSA1LTQuNCA1LTcuNlY3eiIgZmlsbD0iI2U5ZjZmZiIgb3BhY2l0eT0iLjg1Ii8+PC9zdmc+',
  'start':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGcgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTMgNC41IDEwLjUgM3Y4SDN6Ii8+PHBhdGggZD0iTTEyIDIuNyAyMSAxdjEwaC05eiIvPjxwYXRoIGQ9Ik0zIDEzaDcuNXY4TDMgMTkuNnoiLz48cGF0aCBkPSJNMTIgMTNoOXYxMGwtOS0xLjd6Ii8+PC9nPjwvc3ZnPg==',
  'trash':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTYgN2gxMmwtMSAxNEg3eiIgZmlsbD0iI2U4ZjJmOCIgc3Ryb2tlPSIjNTM3NThjIi8+PHBhdGggZD0iTTggNGg4bDEgMkg3ek00IDZoMTYiIGZpbGw9IiNjZmUzZWUiIHN0cm9rZT0iIzUzNzU4YyIgc3Ryb2tlLXdpZHRoPSIxLjMiLz48cGF0aCBkPSJNMTAgMTB2N200LTd2NyIgc3Ryb2tlPSIjM2I4MmM0IiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==',
  'txt':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTUgMmgxMGw0IDR2MTZINXoiIGZpbGw9IiNmOGZhZmMiIHN0cm9rZT0iIzY0NzQ4YiIvPjxwYXRoIGQ9Ik0xNSAydjVoNCIgZmlsbD0iI2RiZWFmZSIvPjxwYXRoIGQ9Ik04IDExaDhNOCAxNGg4TTggMTdoNiIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjEuMyIvPjxwYXRoIGQ9Ik04IDhoNSIgc3Ryb2tlPSIjMTExODI3IiBzdHJva2Utd2lkdGg9IjEuNiIvPjwvc3ZnPg==',
  'minimize_light':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTYgMTZoMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y4ZmFmYyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz48L3N2Zz4=',
  'maximize_light':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iNi41IiB5PSI1LjUiIHdpZHRoPSIxMSIgaGVpZ2h0PSIxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjhmYWZjIiBzdHJva2Utd2lkdGg9IjEuMzUiLz48L3N2Zz4=',
  'close_light':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTcuNSA3LjUgMTYuNSAxNi41TTE2LjUgNy41IDcuNSAxNi41IiBmaWxsPSJub25lIiBzdHJva2U9IiNmOGZhZmMiIHN0cm9rZS13aWR0aD0iMS40NSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPjwvc3ZnPg==',
  'taskmgr':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3QgeD0iMi41IiB5PSIzIiB3aWR0aD0iMTkiIGhlaWdodD0iMTgiIHJ4PSIxLjUiIGZpbGw9IiNlYWY0ZmYiIHN0cm9rZT0iIzNiNmY5YyIvPjxwYXRoIGQ9Ik01IDE2aDIuNXYtNEg1em00IDBoMi41VjhIOXptNCAwaDIuNXYtNkgxM3ptNCAwaDJWNmgtMnoiIGZpbGw9IiMzYjgyZjYiLz48L3N2Zz4=',
  'regedit':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGcgZmlsbD0iIzYwYTVmYSIgc3Ryb2tlPSIjMWQ0ZWQ4IiBzdHJva2Utd2lkdGg9Ii44Ij48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iNyIgaGVpZ2h0PSI3Ii8+PHJlY3QgeD0iMTQiIHk9IjMiIHdpZHRoPSI3IiBoZWlnaHQ9IjciLz48cmVjdCB4PSIzIiB5PSIxNCIgd2lkdGg9IjciIGhlaWdodD0iNyIvPjxyZWN0IHg9IjE0IiB5PSIxNCIgd2lkdGg9IjciIGhlaWdodD0iNyIvPjwvZz48Y2lyY2xlIGN4PSI2LjUiIGN5PSI2LjUiIHI9IjEuNCIgZmlsbD0iI2VmZjZmZiIvPjxjaXJjbGUgY3g9IjE3LjUiIGN5PSIxNy41IiByPSIxLjQiIGZpbGw9IiNlZmY2ZmYiLz48L3N2Zz4=',
  'disk':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGVsbGlwc2UgY3g9IjEyIiBjeT0iNiIgcng9IjguNSIgcnk9IjMuMyIgZmlsbD0iI2RiZWFmZSIgc3Ryb2tlPSIjNDc1NTY5Ii8+PHBhdGggZD0iTTMuNSA2djExYzAgMS44IDMuOCAzLjMgOC41IDMuM3M4LjUtMS41IDguNS0zLjNWNiIgZmlsbD0iI2UyZThmMCIgc3Ryb2tlPSIjNDc1NTY5Ii8+PHBhdGggZD0iTTMuNSAxMWMwIDEuOCAzLjggMy4zIDguNSAzLjNzOC41LTEuNSA4LjUtMy4zTTMuNSAxNmMwIDEuOCAzLjggMy4zIDguNSAzLjNzOC41LTEuNSA4LjUtMy4zIiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDc0OGIiLz48Y2lyY2xlIGN4PSIxNy4yIiBjeT0iMTciIHI9IjEiIGZpbGw9IiMyMmM1NWUiLz48L3N2Zz4=',
  'user':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGNpcmNsZSBjeD0iMzIiIGN5PSIyMSIgcj0iMTMiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTAgNThjMi0xNiAxMC0yNCAyMi0yNHMyMCA4IDIyIDI0IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  'setup_user':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyMCIgcj0iMTEiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNNyA1M2MyLTEzIDgtMjAgMTgtMjAgNSAwIDkgMiAxMiA1IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iNDciIGN5PSI0NSIgcj0iMTIiIGZpbGw9IiNkZmYzZmYiLz48cGF0aCBkPSJNNDcgMzh2MTRNNDAgNDVoMTQiIHN0cm9rZT0iIzAwNzhkNCIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
  'arrow_right':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTUgMTJoMTNtLTUtNSA1IDUtNSA1IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS44IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4='
};

function jplopsoft_svgIconApply(node,name,size){
  var uri=jplopsoft_EXFS_SVG_ICONS[String(name||'')],
      cls,keepLayoutBox;
  if(!node||!uri)return false;

  size=parseInt(size,10)||18;
  cls=' '+String(node.className||'')+' ';
  keepLayoutBox=
    cls.indexOf(' jplopsoft_wm-control ')>=0 ||
    cls.indexOf(' jplopsoft_wm-title-icon ')>=0;

  node.setAttribute('data-exfs-svg',String(name||''));
  node.style.backgroundImage='url("'+uri+'")';
  node.style.backgroundRepeat='no-repeat';
  node.style.backgroundPosition='center center';
  node.style.backgroundSize=size+'px '+size+'px';
  node.style.fontSize='0';
  node.style.lineHeight='0';
  node.textContent='';

  /*
   * Window chrome owns its physical box through CSS:
   * - title app icon slot: 32x32
   * - minimize/maximize/close hit target: 46x31
   * Only the SVG glyph itself uses data-exfs-svg-size.
   */
  if(keepLayoutBox){
    node.style.width='';
    node.style.height='';
    node.style.minWidth='';
    node.style.display='';
    return true;
  }

  node.style.display='inline-block';
  node.style.width=size+'px';
  node.style.height=size+'px';
  node.style.minWidth=size+'px';
  return true;
}
function jplopsoft_applySvgIcons(root){
  var nodes,i,n,name,size;
  root=root||document;
  if(!root.querySelectorAll)return;
  nodes=root.querySelectorAll('[data-exfs-svg]');
  for(i=0;i<nodes.length;i++){
    n=nodes[i];name=n.getAttribute('data-exfs-svg');
    size=n.getAttribute('data-exfs-svg-size')||18;
    jplopsoft_svgIconApply(n,name,size);
  }
}
function jplopsoft_taskbarIconName(icon,appId){
  var s=String(icon||'').toLowerCase(),a=String(appId||'').toLowerCase();
  if(jplopsoft_EXFS_SVG_ICONS[s])return s;
  if(a==='explorer')return'explorer';
  if(a==='cmd'||a.indexOf('cmd_')===0)return'cmd';
  if(a==='control')return'control';
  if(a==='security')return'security';
  if(a==='trash')return'trash';
  if(a==='calc')return'calc';
  if(a.indexOf('editor_')===0){
    if(a.indexOf('_csv_')>=0)return'csv';
    if(a.indexOf('_txt_')>=0)return'txt';
  }
  return'file';
}


'use strict';


/* =========================================================================
 * Multi-process CMD architecture
 *
 * Every cmd.exe launch owns:
 * - one unique EPROCESS/PID in the ExOS NT process table
 * - one private Virtual Address Space identity
 * - one PEB / RTL_USER_PROCESS_PARAMETERS snapshot
 * - one private Environment block
 * - one private CurrentDirectory, command history, ECHO/COLOR state
 * - one independent HWND + taskbar item
 *
 * state.currentFolder and state.cmd* remain source-compatible with the old
 * command engine through an execution-scoped proxy.  Outside a CMD callback
 * the normal Explorer state is returned, so one CMD cannot move another CMD
 * or Explorer simply by changing CD / SET.
 * ========================================================================= */

var jplopsoft_CMD_INSTANCES={};
var jplopsoft_CMD_SEQ=0;
var jplopsoft_CMD_ACTIVE_ID='';
var jplopsoft_CMD_CONTEXT_STACK=[];
var jplopsoft_CMD_STATE_BACKING={};
var jplopsoft_CMD_STATE_PROXY_INSTALLED=false;

var jplopsoft_CMD_STATE_FIELDS={
  currentFolder:'currentFolder',
  cmdHistory:'cmdHistory',
  cmdHistoryIndex:'cmdHistoryIndex',
  cmdHistoryDraft:'cmdHistoryDraft',
  cmdBusy:'cmdBusy',
  cmdEcho:'cmdEcho',
  cmdPaused:'cmdPaused',
  cmdColor:'cmdColor',
  cmdTabCycle:'cmdTabCycle',
  cmdEnv:'cmdEnv',
  cmdLastPathDenied:'cmdLastPathDenied',
  cmdWindowStarted:'cmdWindowStarted'
};

function jplopsoft_cmdCloneMap(src){
  var out={},k;
  if(!src||typeof src!=='object')return out;
  for(k in src){
    if(src.hasOwnProperty(k))out[k]=src[k];
  }
  return out;
}

function jplopsoft_cmdInstance(id){
  return jplopsoft_CMD_INSTANCES[String(id||'')]||null;
}

function jplopsoft_cmdExecutionId(){
  return jplopsoft_CMD_CONTEXT_STACK.length
    ?String(jplopsoft_CMD_CONTEXT_STACK[jplopsoft_CMD_CONTEXT_STACK.length-1]||'')
    :'';
}

function jplopsoft_cmdExecutionContext(){
  return jplopsoft_cmdInstance(jplopsoft_cmdExecutionId());
}

function jplopsoft_cmdUiContext(){
  return jplopsoft_cmdExecutionContext()||
    jplopsoft_cmdInstance(jplopsoft_CMD_ACTIVE_ID);
}

function jplopsoft_cmdWithInstance(id,fn){
  var ret;
  id=String(id||'');
  if(!id||typeof fn!=='function')return;
  jplopsoft_CMD_CONTEXT_STACK.push(id);
  try{
    ret=fn();
  }finally{
    jplopsoft_CMD_CONTEXT_STACK.pop();
  }
  return ret;
}

function jplopsoft_cmdStateBacking(name){
  return jplopsoft_CMD_STATE_BACKING[String(name||'')];
}

function jplopsoft_cmdSyncPeb(ctx){
  var p,pp;
  if(!ctx||!ctx.process||!ctx.process.peb)return;
  p=ctx.process;
  pp=p.peb.processParameters;
  if(!pp)return;

  pp.currentDirectoryNodeId=parseInt(ctx.currentFolder,10)||0;
  try{
    pp.currentDirectory=jplopsoft_cmdPathText(pp.currentDirectoryNodeId);
  }catch(ignorePath){
    pp.currentDirectory='C:\\';
  }
  pp.environment=ctx.cmdEnv;
  if(typeof jplopsoft_ntEnvironmentCount==='function'){
    pp.environmentCount=jplopsoft_ntEnvironmentCount(ctx.cmdEnv);
  }
}

function jplopsoft_cmdInstallStateProxy(){
  var field,ctxField,initial,descriptorOk=true;

  if(jplopsoft_CMD_STATE_PROXY_INSTALLED)return true;

  for(field in jplopsoft_CMD_STATE_FIELDS){
    if(!jplopsoft_CMD_STATE_FIELDS.hasOwnProperty(field))continue;
    jplopsoft_CMD_STATE_BACKING[field]=state[field];
  }

  function installOne(stateField,processField){
    try{
      Object.defineProperty(state,stateField,{
        configurable:true,
        enumerable:true,
        get:function(){
          var c=jplopsoft_cmdExecutionContext();
          if(c)return c[processField];
          return jplopsoft_CMD_STATE_BACKING[stateField];
        },
        set:function(v){
          var c=jplopsoft_cmdExecutionContext();
          if(c){
            c[processField]=v;
            if(stateField==='currentFolder'||stateField==='cmdEnv'){
              jplopsoft_cmdSyncPeb(c);
            }
          }else{
            jplopsoft_CMD_STATE_BACKING[stateField]=v;
          }
        }
      });
    }catch(e){
      descriptorOk=false;
    }
  }

  for(field in jplopsoft_CMD_STATE_FIELDS){
    if(jplopsoft_CMD_STATE_FIELDS.hasOwnProperty(field)){
      ctxField=jplopsoft_CMD_STATE_FIELDS[field];
      installOne(field,ctxField);
    }
  }

  jplopsoft_CMD_STATE_PROXY_INSTALLED=descriptorOk;
  return descriptorOk;
}

function jplopsoft_cmdLegacyDomId(key){
  var m={
    window:'jplopsoft_cmdWindow',
    body:'jplopsoft_cmdWindowBody',
    panel:'jplopsoft_cmdPanel',
    screen:'jplopsoft_cmdScreen',
    output:'jplopsoft_cmdOutput',
    inputRow:'jplopsoft_cmdInputRow',
    prompt:'jplopsoft_cmdPrompt',
    input:'jplopsoft_cmdInput',
    cursorMirror:'jplopsoft_cmdCursorMirror',
    blockCursor:'jplopsoft_cmdBlockCursor'
  };
  return m[String(key||'')]||'';
}

function jplopsoft_cmdEl(key){
  var c=jplopsoft_cmdUiContext(),id;
  key=String(key||'');
  if(c&&c.dom&&c.dom[key])return c.dom[key];
  id=jplopsoft_cmdLegacyDomId(key);
  return id?jplopsoft_el(id):null;
}

function jplopsoft_cmdCaptureInstanceId(){
  return jplopsoft_cmdExecutionId();
}

function jplopsoft_cmdWrapCallback(cb,id){
  if(typeof cb!=='function')return cb;
  id=String(id||jplopsoft_cmdCaptureInstanceId());
  if(!id)return cb;
  return function(){
    var self=this,args=arguments;
    return jplopsoft_cmdWithInstance(id,function(){
      return cb.apply(self,args);
    });
  };
}

function jplopsoft_cmdApi(api,method,data,auth,cb){
  var id=jplopsoft_cmdCaptureInstanceId();
  return jplopsoft_api(api,method,data,auth,jplopsoft_cmdWrapCallback(cb,id));
}

function jplopsoft_cmdReloadNodes(cb){
  var id=jplopsoft_cmdCaptureInstanceId();
  return jplopsoft_reloadNodes(jplopsoft_cmdWrapCallback(cb,id));
}

function jplopsoft_cmdSetTimeout(fn,delay){
  var id=jplopsoft_cmdCaptureInstanceId();
  if(!id||typeof fn!=='function')return window.setTimeout(fn,delay);
  return window.setTimeout(function(){
    jplopsoft_cmdWithInstance(id,fn);
  },delay);
}

function jplopsoft_cmdSetExplorerFolder(folderId,selectedId){
  folderId=parseInt(folderId,10)||0;
  jplopsoft_CMD_STATE_BACKING.currentFolder=folderId;
  state.selectedId=parseInt(selectedId,10)||0;
  state.checkedFolder=folderId;
  state.checkedIds={};
}

function jplopsoft_cmdCount(){
  var k,n=0;
  for(k in jplopsoft_CMD_INSTANCES){
    if(jplopsoft_CMD_INSTANCES.hasOwnProperty(k)&&jplopsoft_CMD_INSTANCES[k])n++;
  }
  return n;
}

function jplopsoft_cmdRefreshGlobalMode(){
  state.cmdMode=jplopsoft_cmdCount()>0;
}

function jplopsoft_cmdMarkActive(id){
  var c=jplopsoft_cmdInstance(id);
  if(!c)return false;
  jplopsoft_CMD_ACTIVE_ID=String(id);
  jplopsoft_cmdRefreshGlobalMode();
  return true;
}

function jplopsoft_cmdActivateInstance(id,bringToFront){
  var c=jplopsoft_cmdInstance(id),rec;
  if(!c)return false;
  jplopsoft_cmdMarkActive(id);
  if(bringToFront!==false&&c.hwnd){
    rec=jplopsoft_user32GetRecord(c.hwnd);
    if(rec){
      jplopsoft_user32Display(rec,true);
      jplopsoft_user32Activate(rec);
    }
  }
  return true;
}

function jplopsoft_cmdBuildPanel(ctx,client){
  var panel,screen,output,row,prompt,input,mirror,cursor,prefix;

  prefix='jplopsoft_cmd_'+ctx.instanceId+'_';

  panel=document.createElement('div');
  panel.className='jplopsoft_cmd-panel';
  panel.id=prefix+'panel';

  screen=document.createElement('div');
  screen.className='jplopsoft_cmd-screen';
  screen.id=prefix+'screen';
  screen.tabIndex=0;

  output=document.createElement('div');
  output.className='jplopsoft_cmd-output';
  output.id=prefix+'output';
  screen.appendChild(output);

  row=document.createElement('div');
  row.className='jplopsoft_cmd-input-row';
  row.id=prefix+'inputRow';

  prompt=document.createElement('span');
  prompt.className='jplopsoft_cmd-prompt';
  prompt.id=prefix+'prompt';
  prompt.textContent='C:\\>';
  row.appendChild(prompt);

  input=document.createElement('input');
  input.type='text';
  input.className='jplopsoft_cmd-input';
  input.id=prefix+'input';
  input.autocomplete='off';
  input.setAttribute('autocapitalize','off');
  input.spellcheck=false;
  input.setAttribute('aria-label','ExOS cmd.exe PID '+ctx.pid+' command');
  row.appendChild(input);

  mirror=document.createElement('span');
  mirror.className='jplopsoft_cmd-cursor-mirror';
  mirror.id=prefix+'cursorMirror';
  mirror.setAttribute('aria-hidden','true');
  row.appendChild(mirror);

  cursor=document.createElement('span');
  cursor.className='jplopsoft_cmd-block-cursor';
  cursor.id=prefix+'blockCursor';
  cursor.setAttribute('aria-hidden','true');
  row.appendChild(cursor);

  screen.appendChild(row);
  panel.appendChild(screen);
  client.appendChild(panel);

  ctx.dom={
    window:jplopsoft_el(ctx.windowId),
    body:client,
    panel:panel,
    screen:screen,
    output:output,
    inputRow:row,
    prompt:prompt,
    input:input,
    cursorMirror:mirror,
    blockCursor:cursor
  };
}

function jplopsoft_cmdBindInstance(ctx){
  var input=ctx&&ctx.dom?ctx.dom.input:null,
      screen=ctx&&ctx.dom?ctx.dom.screen:null,
      id=ctx?String(ctx.instanceId):'';

  if(!input||!screen||!id)return;

  function run(fn,e){
    jplopsoft_cmdMarkActive(id);
    return jplopsoft_cmdWithInstance(id,function(){return fn(e);});
  }

  screen.onclick=function(e){
    return run(function(){
      if(!input.disabled){
        input.focus();
        jplopsoft_cmdScheduleVisualCursor();
      }
    },e);
  };

  input.onfocus=function(e){
    return run(function(){jplopsoft_cmdScheduleVisualCursor();},e);
  };

  input.onblur=function(e){
    return run(function(){jplopsoft_cmdHideVisualCursor();},e);
  };

  input.onclick=function(e){
    return run(function(){jplopsoft_cmdScheduleVisualCursor();},e);
  };

  input.onmouseup=function(e){
    return run(function(){jplopsoft_cmdScheduleVisualCursor();},e);
  };

  input.onscroll=function(e){
    return run(function(){jplopsoft_cmdUpdateVisualCursor();},e);
  };

  input.oninput=function(e){
    return run(function(){
      state.cmdTabCycle=null;
      if(state.cmdHistoryIndex>=state.cmdHistory.length){
        state.cmdHistoryDraft=input.value;
      }
      jplopsoft_cmdScheduleVisualCursor();
    },e);
  };

  input.onkeydown=function(e){
    e=e||window.event;
    return run(function(){
      var k=e.keyCode||e.which,command;

      jplopsoft_cmdScheduleVisualCursor();

      if(k===9){
        if(e.preventDefault)e.preventDefault();
        e.returnValue=false;
        if(state.cmdBusy)return false;
        jplopsoft_cmdApplyTabCompletion(input,!!e.shiftKey);
        return false;
      }

      if(k!==16&&k!==17&&k!==18)state.cmdTabCycle=null;

      if(k===13){
        if(e.preventDefault)e.preventDefault();
        if(state.cmdBusy)return false;

        command=input.value;
        input.value='';
        jplopsoft_cmdScheduleVisualCursor();

        if(jplopsoft_trim(command)){
          state.cmdHistory.push(command);
          if(state.cmdHistory.length>200)state.cmdHistory.shift();
        }

        state.cmdHistoryIndex=state.cmdHistory.length;
        state.cmdHistoryDraft='';
        jplopsoft_cmdExecute(command);
        jplopsoft_cmdRefreshPrompt();
        jplopsoft_cmdSyncPeb(ctx);
        return false;
      }

      if(k===38){
        if(e.preventDefault)e.preventDefault();
        if(!state.cmdHistory.length)return false;

        if(state.cmdHistoryIndex>=state.cmdHistory.length){
          state.cmdHistoryDraft=input.value;
          state.cmdHistoryIndex=state.cmdHistory.length-1;
        }else if(state.cmdHistoryIndex>0){
          state.cmdHistoryIndex--;
        }

        input.value=state.cmdHistory[state.cmdHistoryIndex]||'';
        state.cmdTabCycle=null;
        try{input.setSelectionRange(input.value.length,input.value.length);}catch(ignoreUp){}
        return false;
      }

      if(k===40){
        if(e.preventDefault)e.preventDefault();
        if(!state.cmdHistory.length)return false;

        if(state.cmdHistoryIndex<state.cmdHistory.length-1){
          state.cmdHistoryIndex++;
          input.value=state.cmdHistory[state.cmdHistoryIndex]||'';
        }else{
          state.cmdHistoryIndex=state.cmdHistory.length;
          input.value=state.cmdHistoryDraft||'';
        }

        state.cmdTabCycle=null;
        try{input.setSelectionRange(input.value.length,input.value.length);}catch(ignoreDown){}
        return false;
      }
    },e);
  };
}

function jplopsoft_cmdInitialFolder(folderId,parentCtx){
  var id;

  if(typeof folderId==='number'){
    id=parseInt(folderId,10)||0;
  }else if(parentCtx){
    id=parseInt(parentCtx.currentFolder,10)||0;
  }else{
    id=parseInt(jplopsoft_CMD_STATE_BACKING.currentFolder,10)||0;
  }

  if(typeof jplopsoft_DESKTOP_FOLDER_ID!=='undefined'&&id===jplopsoft_DESKTOP_FOLDER_ID){
    id=parseInt(state.profileRootId,10)||0;
  }

  return id;
}

function jplopsoft_cmdParentProcess(parentCtx){
  var p=null;

  if(parentCtx&&parentCtx.process&&parentCtx.process.alive){
    return parentCtx.process;
  }

  if(typeof jplopsoft_ntEnsureExplorerProcess==='function'){
    p=jplopsoft_ntEnsureExplorerProcess();
  }

  return p;
}

function jplopsoft_cmdCreateInstance(folderId,parentInstanceId){
  var parentCtx=jplopsoft_cmdInstance(parentInstanceId),
      parentProcess,process,ctx,id,appId,processKey,hwnd,client,win,
      baseEnv={},folder,x,y,title;

  if(!state.samAuthenticated||!state.vaultKey){
    alert('請先登入 ExOS，再開啟指令模式。');
    return null;
  }

  folder=jplopsoft_cmdInitialFolder(
    typeof folderId==='undefined'?null:parseInt(folderId,10),
    parentCtx
  );

  if(folder!==0){
    var n=jplopsoft_findNode(folder);
    if(!n||n.type!=='folder')folder=0;
  }

  jplopsoft_CMD_SEQ++;
  id=String(jplopsoft_CMD_SEQ);
  appId='cmd_'+id;
  processKey='proc:cmd:'+id;

  parentProcess=jplopsoft_cmdParentProcess(parentCtx);

  if(parentProcess&&parentProcess.peb&&parentProcess.peb.processParameters){
    baseEnv=jplopsoft_cmdCloneMap(parentProcess.peb.processParameters.environment);
  }else{
    baseEnv=jplopsoft_cmdCloneMap(jplopsoft_CMD_STATE_BACKING.cmdEnv||{});
  }

  if(typeof jplopsoft_NtCreateUserProcess==='function'){
    process=jplopsoft_NtCreateUserProcess({
      key:processKey,
      imageName:'cmd.exe',
      description:'Command Prompt',
      ppid:parentProcess?parentProcess.pid:0,
      parentProcess:parentProcess||null,
      sessionId:1,
      username:String(state.samUsername||'administrator'),
      sid:String(state.samSid||''),
      integrity:'MEDIUM',
      commandLine:'cmd.exe',
      currentDirectoryNodeId:folder,
      currentDirectory:'',
      environment:baseEnv,
      logicalThreads:2
    });
  }

  if(!process){
    process={
      key:processKey,pid:2000+jplopsoft_CMD_SEQ,ppid:parentProcess?parentProcess.pid:0,
      imageName:'cmd.exe',alive:true,
      peb:{
        id:'PEB-CMD-'+id,
        processParameters:{
          currentDirectoryNodeId:folder,
          currentDirectory:'',
          environment:baseEnv,
          commandLine:'cmd.exe'
        }
      },
      virtualAddressSpaceId:'VAS-CMD-'+id
    };
  }

  ctx={
    instanceId:id,
    appId:appId,
    processKey:processKey,
    process:process,
    pid:process.pid,
    ppid:process.ppid,
    hwnd:0,
    windowId:'',
    currentFolder:folder,
    cmdHistory:[],
    cmdHistoryIndex:0,
    cmdHistoryDraft:'',
    cmdBusy:false,
    cmdEcho:parentCtx?parentCtx.cmdEcho:(jplopsoft_CMD_STATE_BACKING.cmdEcho!==false),
    cmdPaused:false,
    cmdColor:parentCtx?String(parentCtx.cmdColor||'07'):String(jplopsoft_CMD_STATE_BACKING.cmdColor||'07'),
    cmdTabCycle:null,
    cmdEnv:process.peb&&process.peb.processParameters
      ?process.peb.processParameters.environment
      :baseEnv,
    cmdLastPathDenied:'',
    cmdWindowStarted:false,
    dom:null,
    closing:false
  };

  jplopsoft_CMD_INSTANCES[id]=ctx;
  jplopsoft_CMD_ACTIVE_ID=id;
  jplopsoft_cmdRefreshGlobalMode();
  jplopsoft_cmdSyncPeb(ctx);

  x=90+((jplopsoft_CMD_SEQ-1)%8)*26;
  y=55+((jplopsoft_CMD_SEQ-1)%8)*22;
  title='命令提示字元 - ExOS [PID '+ctx.pid+']';

  hwnd=jplopsoft_CreateWindowEx(
    jplopsoft_WS_EX_APPWINDOW,
    'ExOS.Window',
    title,
    jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,
    x,y,920,560,null,null,null,
    {
      appId:appId,
      icon:'cmd',
      windowClass:'jplopsoft_cmd-window',
      clientClass:'jplopsoft_cmd-window-body',
      taskbar:true,
      cmdInstanceId:id,
      ntProcessKey:processKey,
      ntImageName:'cmd.exe',
      ntDescription:'Command Prompt',
      ntParentKey:parentProcess?String(parentProcess.key||''):'',
      wndProc:function(winHwnd,msg){
        if(msg===jplopsoft_WM_CLOSE){
          jplopsoft_cmdCloseInstance(id,false);
          return 0;
        }
        return null;
      }
    }
  );

  if(!hwnd){
    delete jplopsoft_CMD_INSTANCES[id];
    jplopsoft_cmdRefreshGlobalMode();
    return null;
  }

  ctx.hwnd=hwnd;
  ctx.windowId=(jplopsoft_user32GetRecord(hwnd)||{}).windowId||'';
  client=jplopsoft_GetClientElement(hwnd);
  if(!client){
    jplopsoft_DestroyWindow(hwnd);
    return null;
  }

  jplopsoft_cmdBuildPanel(ctx,client);
  jplopsoft_cmdBindInstance(ctx);

  win=ctx.dom?ctx.dom.window:null;
  if(win&&win.addEventListener){
    win.addEventListener('mousedown',function(){jplopsoft_cmdMarkActive(id);},false);
  }

  jplopsoft_cmdWithInstance(id,function(){
    ctx.cmdWindowStarted=true;
    jplopsoft_cmdWelcome();
    jplopsoft_cmdRefreshPrompt();
    jplopsoft_cmdApplyColor();
    jplopsoft_cmdSyncPeb(ctx);
  });

  jplopsoft_taskbarEnsureApp(appId,'cmd','命令提示字元 ['+ctx.pid+']');
  jplopsoft_cmdActivateInstance(id,true);

  window.setTimeout(function(){
    var c=jplopsoft_cmdInstance(id);
    if(!c||!c.dom||!c.dom.input)return;
    jplopsoft_cmdMarkActive(id);
    jplopsoft_cmdWithInstance(id,function(){
      try{c.dom.input.focus();}catch(ignoreFocus){}
      jplopsoft_cmdScrollBottom();
      jplopsoft_cmdUpdateVisualCursor();
    });
  },0);

  return ctx;
}

function jplopsoft_cmdCleanupInstance(id){
  var c=jplopsoft_cmdInstance(id),k,next='';
  if(!c)return;

  delete jplopsoft_CMD_INSTANCES[String(id)];

  if(String(jplopsoft_CMD_ACTIVE_ID)===String(id)){
    for(k in jplopsoft_CMD_INSTANCES){
      if(jplopsoft_CMD_INSTANCES.hasOwnProperty(k)){
        next=String(k);
        break;
      }
    }
    jplopsoft_CMD_ACTIVE_ID=next;
  }

  jplopsoft_cmdRefreshGlobalMode();
}

function jplopsoft_cmdCloseInstance(id,force){
  var c=jplopsoft_cmdInstance(id),hwnd;
  if(!c||c.closing)return false;

  c.closing=true;
  hwnd=c.hwnd;

  jplopsoft_cmdWithInstance(id,function(){
    try{jplopsoft_cmdCancelPause();}catch(ignorePause){}
    try{jplopsoft_cmdHideVisualCursor();}catch(ignoreCursor){}
  });

  jplopsoft_cmdCleanupInstance(id);

  if(hwnd&&jplopsoft_user32GetRecord(hwnd)){
    jplopsoft_DestroyWindow(hwnd);
  }

  return true;
}

function jplopsoft_cmdOnWindowDestroyed(rec){
  var id;
  if(!rec||!rec.param)return;
  id=String(rec.param.cmdInstanceId||'');
  if(id&&jplopsoft_cmdInstance(id)){
    jplopsoft_cmdCleanupInstance(id);
  }
}

function jplopsoft_cmdCloseAll(){
  var ids=[],k,i,c;
  for(k in jplopsoft_CMD_INSTANCES){
    if(jplopsoft_CMD_INSTANCES.hasOwnProperty(k))ids.push(String(k));
  }
  for(i=0;i<ids.length;i++){
    c=jplopsoft_cmdInstance(ids[i]);
    if(c)jplopsoft_cmdCloseInstance(ids[i],true);
  }
  jplopsoft_CMD_ACTIVE_ID='';
  jplopsoft_cmdRefreshGlobalMode();
}

function jplopsoft_cmdMinimizeAll(){
  var k,c;
  for(k in jplopsoft_CMD_INSTANCES){
    if(!jplopsoft_CMD_INSTANCES.hasOwnProperty(k))continue;
    c=jplopsoft_CMD_INSTANCES[k];
    if(c&&c.hwnd&&jplopsoft_user32GetRecord(c.hwnd)){
      jplopsoft_ShowWindow(c.hwnd,jplopsoft_SW_MINIMIZE);
    }
  }
}

function jplopsoft_cmdActiveProcess(){
  var c=jplopsoft_cmdUiContext();
  return c&&c.process?c.process:null;
}

jplopsoft_cmdInstallStateProxy();


function jplopsoft_cmdChangePassword(){
  if(!state.samAuthenticated||!state.vaultKey){
    jplopsoft_cmdWrite('Access is denied. Please log on to ExOS SAM first.','error');
    return;
  }

  jplopsoft_cmdWrite('Starting SAM password change ...','info');

  /*
   * Reuse the SAM password-change path. It validates the current account
   * password and re-wraps the same 4096-bit Vault Key.
   */
  jplopsoft_changePassword();
}

function jplopsoft_cmdPathText(id){
  if(jplopsoft_cmdIsAuditFolderId(id))return 'C:\\logs';
  var p=jplopsoft_folderPath(id),a=['C:'],i,name;
  for(i=0;i<p.length;i++){
    name=jplopsoft_decName(p[i]);
    a.push(name===null?'[UNREADABLE]':name);
  }
  return a.length===1?'C:\\':a[0]+'\\'+a.slice(1).join('\\');
}

function jplopsoft_cmdUsesNativeCaret(){
  /*
   * IE11 ignores CSS caret-color. If the custom VGA/DOS cursor is also
   * painted, the user sees both the browser caret and ExFS cursor.
   */
  return jplopsoft_isIE11Browser();
}

function jplopsoft_cmdHideVisualCursor(){
  var cursor=jplopsoft_cmdEl('blockCursor');

  if(cursor){
    cursor.className='jplopsoft_cmd-block-cursor';
  }
}

function jplopsoft_cmdVisualCursorCopyStyle(input,mirror){
  var style;

  if(!input||!mirror)return;

  if(window.getComputedStyle){
    style=window.getComputedStyle(input,null);

    if(style){
      mirror.style.fontFamily=style.fontFamily;
      mirror.style.fontSize=style.fontSize;
      mirror.style.fontStyle=style.fontStyle;
      mirror.style.fontWeight=style.fontWeight;
      mirror.style.fontVariant=style.fontVariant;
      mirror.style.lineHeight=style.lineHeight;
      mirror.style.letterSpacing=style.letterSpacing;
      mirror.style.wordSpacing=style.wordSpacing;
      mirror.style.textTransform=style.textTransform;
      mirror.style.textIndent=style.textIndent;

      if(typeof style.fontKerning!=='undefined'){
        mirror.style.fontKerning=style.fontKerning;
      }
    }
  }
}

function jplopsoft_cmdUpdateVisualCursor(){
  var input=jplopsoft_cmdEl('input'),
      row=jplopsoft_cmdEl('inputRow'),
      cursor=jplopsoft_cmdEl('blockCursor'),
      mirror=jplopsoft_cmdEl('cursorMirror'),
      inputRect,rowRect,
      pos,before,width,cellWidth,left,
      style,color;

  if(!input||!row||!cursor||!mirror){
    return;
  }

  if(jplopsoft_cmdUsesNativeCaret()){
    jplopsoft_cmdHideVisualCursor();
    return;
  }

  if(
    !state.cmdMode||
    state.cmdBusy||
    state.cmdPaused||
    input.disabled||
    document.activeElement!==input||
    row.className.indexOf('jplopsoft_hidden')>=0
  ){
    jplopsoft_cmdHideVisualCursor();
    return;
  }

  pos=input.value.length;

  try{
    if(
      typeof input.selectionStart==='number'&&
      typeof input.selectionEnd==='number'
    ){
      if(input.selectionStart!==input.selectionEnd){
        jplopsoft_cmdHideVisualCursor();
        return;
      }

      pos=input.selectionStart;
    }
  }catch(ignoreSelection){}

  before=String(input.value||'').substring(0,pos);

  /*
   * Use a hidden DOM mirror instead of Canvas metrics.
   * It shares the browser's real INPUT font fallback and text layout.
   */
  jplopsoft_cmdVisualCursorCopyStyle(input,mirror);

  mirror.textContent=before;
  width=mirror.getBoundingClientRect().width;

  mirror.textContent=before+'0';
  cellWidth=
    mirror.getBoundingClientRect().width-
    width;

  mirror.textContent=before;

  if(!cellWidth||cellWidth<5){
    cellWidth=8;
  }

  inputRect=input.getBoundingClientRect();
  rowRect=row.getBoundingClientRect();

  left=
    (inputRect.left-rowRect.left)+
    width-
    (input.scrollLeft||0);

  if(left<0){
    jplopsoft_cmdHideVisualCursor();
    return;
  }

  if(left>row.clientWidth-2){
    left=row.clientWidth-Math.max(6,cellWidth);
  }

  cursor.style.left=Math.round(left)+'px';
  cursor.style.width=Math.max(6,Math.round(cellWidth))+'px';

  style=window.getComputedStyle
    ?window.getComputedStyle(input,null)
    :null;

  color=style&&style.color?style.color:'#c0c0c0';
  cursor.style.backgroundColor=color;

  cursor.className='jplopsoft_cmd-block-cursor';
  cursor.offsetWidth;
  cursor.className='jplopsoft_cmd-block-cursor jplopsoft_active';
}

function jplopsoft_cmdScheduleVisualCursor(){
  if(jplopsoft_cmdUsesNativeCaret()){
    jplopsoft_cmdHideVisualCursor();
    return;
  }

  jplopsoft_cmdSetTimeout(function(){
    jplopsoft_cmdUpdateVisualCursor();
  },0);
}

function jplopsoft_cmdRefreshPrompt(){
  if(!jplopsoft_cmdEl('prompt'))return;

  jplopsoft_cmdEl('prompt').textContent=
    state.cmdEcho===false
      ?''
      :(jplopsoft_cmdPathText(state.currentFolder)+'>');
}
function jplopsoft_cmdScrollBottom(){
  var s=jplopsoft_cmdEl('screen');
  if(s)s.scrollTop=s.scrollHeight;
}
function jplopsoft_cmdWrite(textLine,kind){
  var out=jplopsoft_cmdEl('output'),d;
  if(!out)return;
  d=document.createElement('div');
  d.className='jplopsoft_cmd-line'+(kind?' jplopsoft_'+kind:'');
  d.textContent=String(textLine===undefined?'':textLine);
  out.appendChild(d);
  jplopsoft_cmdScrollBottom();
}
function jplopsoft_cmdWelcome(){
  if(!jplopsoft_cmdEl('output')||jplopsoft_cmdEl('output').childNodes.length)return;
  jplopsoft_cmdWrite('ExOS - MS-DOS/VGA Command Mode','success');
  jplopsoft_cmdWrite('ExES V6 front-end encryption / Encrypted Sandbox FS','info');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('Commands:');
  jplopsoft_cmdWrite('  VER / WINVER');
  jplopsoft_cmdWrite('  ECHO [text|ON|OFF] / ECHO.');
  jplopsoft_cmdWrite('  SET [name[=value]]');
  jplopsoft_cmdWrite('  CLS / CLEAR / CL / CMD / COMMAND / SHELL / SYSTEM / SH');
  jplopsoft_cmdWrite('  HELP / ? / MAN');
  jplopsoft_cmdWrite('  EXIT / EXPLORER / UI');
  jplopsoft_cmdWrite('  LOGOUT / LOCK / LO / QUIT / SHUTDOWN');
  jplopsoft_cmdWrite('  PASSWD / PW');
  jplopsoft_cmdWrite('  M / MATH / ?? expression');
  jplopsoft_cmdWrite('  MR / RANDOM min max');
  jplopsoft_cmdWrite('  CHKDSK / SCANDISK / SFC');
  jplopsoft_cmdWrite('  TREE [path] [/F] [/A]');
  jplopsoft_cmdWrite('  CLIP text');
  jplopsoft_cmdWrite('  WHOAMI');
  jplopsoft_cmdWrite('  EX text-or-X60');
  jplopsoft_cmdWrite('  EX_MD3 text');
  jplopsoft_cmdWrite('  PAUSE');
  jplopsoft_cmdWrite('  COLOR [attr]');
  jplopsoft_cmdWrite('  VOL [C:]');
  jplopsoft_cmdWrite('  DATE / TIME');
  jplopsoft_cmdWrite('  CD / CHDIR / PWD [folder]');
  jplopsoft_cmdWrite('  CD\\');
  jplopsoft_cmdWrite('  MD / MKDIR folder');
  jplopsoft_cmdWrite('  RD / DELTREE folder');
  jplopsoft_cmdWrite('  REN / RENAME / MV old new');
  jplopsoft_cmdWrite('  COPY / XCOPY / CP / ROBOCOPY source destination');
  jplopsoft_cmdWrite('  MOVE source destination');
  jplopsoft_cmdWrite('  DIR / LS / FIND [path/pattern] [/B] [/W] [/S]');
  jplopsoft_cmdWrite('  DEL / DELETE / ERASE filename');
  jplopsoft_cmdWrite('  DEL / DELETE *.ext');
  jplopsoft_cmdWrite('  TYPE / CAT / LESS / HEAD / TAIL textfile');
  jplopsoft_cmdWrite('  OLD / FILEVER / FV / OL filename');
  jplopsoft_cmdWrite('  TOUCH filename.txt');
  jplopsoft_cmdWrite('  EDIT / E / VI / V / VIM / WORD / NANO filename');
  jplopsoft_cmdWrite('  DL / DOWNLOAD filename');
  jplopsoft_cmdWrite('  START / NOTEPAD filename');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('Help: COMMAND /? 或 COMMAND/? = command-specific help');
  jplopsoft_cmdWrite('Keyboard: ↑/↓ history | TAB autocomplete | Shift+TAB previous match');
  jplopsoft_cmdWrite('Empty Enter: commit current prompt and show a new prompt (MS-DOS style)');
  jplopsoft_cmdWrite('');
}
function jplopsoft_cmdClearSensitiveOutput(){
  jplopsoft_cmdCancelPause();
  if(jplopsoft_cmdEl('output'))jplopsoft_cmdEl('output').innerHTML='';
  if(jplopsoft_cmdEl('input'))jplopsoft_cmdEl('input').value='';
  jplopsoft_cmdHideVisualCursor();
  state.cmdHistory=[];
  state.cmdHistoryIndex=0;
  state.cmdHistoryDraft='';
  state.cmdTabCycle=null;
  state.cmdBusy=false;
  state.cmdEcho=true;
  state.cmdColor='07';
  state.cmdEnv={};
  jplopsoft_cmdApplyColor();
}
function jplopsoft_setCmdMode(on){
  var c;
  on=!!on;

  if(on){
    return jplopsoft_cmdCreateInstance(undefined,null);
  }

  c=jplopsoft_cmdUiContext();
  if(c)return jplopsoft_cmdCloseInstance(c.instanceId,false);
  return false;
}

function jplopsoft_toggleCmdMode(){
  if(jplopsoft_isDesktopFolder()){
    alert('桌面是虛擬捷徑區域，沒有對應的 DOS 目錄。');
    return;
  }
  jplopsoft_cmdCreateInstance(undefined,null);
}
function jplopsoft_openFolderInCmd(folderId){
  var id=parseInt(folderId,10)||0,n,c;

  if(!state.vaultKey){
    alert('請先解鎖，再進入 CMD 模式。');
    return;
  }

  if(id!==0){
    n=jplopsoft_findNode(id);
    if(!n||n.type!=='folder'){
      alert('找不到指定資料夾。');
      return;
    }
  }

  c=jplopsoft_cmdCreateInstance(id,null);
  if(!c)return;

  window.setTimeout(function(){
    if(!jplopsoft_cmdInstance(c.instanceId))return;
    jplopsoft_cmdMarkActive(c.instanceId);
    jplopsoft_cmdWithInstance(c.instanceId,function(){
      if(c.dom&&c.dom.input){
        try{
          c.dom.input.focus();
          c.dom.input.setSelectionRange(c.dom.input.value.length,c.dom.input.value.length);
        }catch(ignoreFocus){}
      }
      jplopsoft_cmdScrollBottom();
    });
  },0);
}

function jplopsoft_cmdUnquote(s){
  s=jplopsoft_trim(String(s||''));
  if(s.length>=2){
    if((s.charAt(0)==='"'&&s.charAt(s.length-1)==='"')||
       (s.charAt(0)==="'"&&s.charAt(s.length-1)==="'")){
      s=s.substring(1,s.length-1);
    }
  }
  return s;
}

var jplopsoft_CMD_AUDIT_FOLDER_ID=-9001;

function jplopsoft_cmdIsAuditFolderId(id){
  return parseInt(id,10)===jplopsoft_CMD_AUDIT_FOLDER_ID;
}

function jplopsoft_cmdAuditResolvePath(path){
  var raw=jplopsoft_cmdUnquote(path).replace(/\//g,'\\'),
      hadDrive=/^c:/i.test(raw),
      absolute,
      base,
      parts,
      i,
      part,
      lower;

  if(hadDrive){
    raw=raw.substring(2);
  }

  absolute=raw.charAt(0)==='\\';

  while(raw.charAt(0)==='\\'){
    raw=raw.substring(1);
  }

  if(hadDrive||absolute){
    base=[];
  }else if(jplopsoft_cmdIsAuditFolderId(state.currentFolder)){
    base=['logs'];
  }else if(parseInt(state.currentFolder,10)===0){
    base=[];
  }else{
    return {handled:false};
  }

  parts=raw===''?[]:raw.split('\\');

  for(i=0;i<parts.length;i++){
    part=parts[i];

    if(!part||part==='.')continue;

    if(part==='..'){
      if(base.length)base.pop();
      continue;
    }

    base.push(part);
  }

  if(!base.length){
    return {handled:false};
  }

  lower=String(base[0]||'').toLowerCase();

  if(lower!=='logs'){
    return {handled:false};
  }

  if(base.length===1){
    return {
      handled:true,
      kind:'folder',
      folderId:jplopsoft_CMD_AUDIT_FOLDER_ID,
      path:'C:\\logs'
    };
  }

  if(
    base.length===2&&
    String(base[1]||'').toLowerCase()==='sys.log'
  ){
    return {
      handled:true,
      kind:'file',
      folderId:jplopsoft_CMD_AUDIT_FOLDER_ID,
      name:'sys.log',
      path:'C:\\logs\\sys.log'
    };
  }

  return {
    handled:true,
    kind:'invalid',
    folderId:jplopsoft_CMD_AUDIT_FOLDER_ID,
    path:'C:\\logs'
  };
}

function jplopsoft_cmdAuditAccessDenied(){
  jplopsoft_cmdWrite('Access is denied.','error');
  jplopsoft_cmdWrite(
    '權限不足：C:\\logs\\sys.log 是 ExFS 唯讀系統稽核紀錄。',
    'error'
  );
}

function jplopsoft_cmdTypeAuditLog(){
  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  jplopsoft_cmdSetBusy(true);
  jplopsoft_cmdWrite('Reading C:\\logs\\sys.log ...','info');

  jplopsoft_cmdApi('audit_read','GET',null,true,function(err,out){
    var content;

    if(err){
      jplopsoft_cmdSetBusy(false);
      jplopsoft_cmdWrite('TYPE failed: '+err.message,'error');
      return;
    }

    content=String(out&&out.content!==undefined?out.content:'');

    state.auditLogSize=parseInt(out&&out.size,10)||0;
    state.auditLogUpdatedAt=String(out&&out.updated_at||'');

    jplopsoft_cmdWrite('');

    if(content===''){
      jplopsoft_cmdWrite('[empty audit log]');
    }else{
      /*
       * cmdWrite uses textContent and pre-wrap; sys.log is inert text.
       */
      jplopsoft_cmdWrite(content.replace(/\r\n/g,'\n').replace(/\r/g,'\n'));
    }

    jplopsoft_cmdWrite('');
    jplopsoft_cmdWrite('----- End of C:\\logs\\sys.log -----','info');
    jplopsoft_cmdSetBusy(false);
    jplopsoft_cmdScrollBottom();
  });
}

function jplopsoft_cmdVirtualSystemFolderName(name){
  var s=String(name||'').toLowerCase();
  if(s==='exos')return 'ExOS';
  if(s==='program files')return 'Program Files';
  if(s==='program files (x86)')return 'Program Files (x86)';
  if(s==='exes_libs')return 'exes_libs';
  return '';
}
function jplopsoft_cmdIsVirtualSystemFolderAtRoot(parentId,name){
  return parseInt(parentId,10)===0 && !!jplopsoft_cmdVirtualSystemFolderName(name);
}
function jplopsoft_cmdVirtualAccessDenied(name){
  var raw=String(name||''),canonical;

  if(raw.toLowerCase()==='logs'){
    jplopsoft_cmdAuditAccessDenied();
    return;
  }

  canonical=jplopsoft_cmdVirtualSystemFolderName(raw)||raw;
  jplopsoft_cmdWrite('Access is denied.','error');
  jplopsoft_cmdWrite('權限不足：C:\\'+canonical+' 是受保護的虛擬系統資料夾。','error');
}

function jplopsoft_cmdCompletionDecodeToken(raw){
  raw=String(raw||'');
  var out='',quote='',i,ch;

  for(i=0;i<raw.length;i++){
    ch=raw.charAt(i);

    if(quote){
      if(ch===quote){
        quote='';
      }else{
        out+=ch;
      }
      continue;
    }

    if(ch==='"'||ch==="'"){
      quote=ch;
      continue;
    }

    out+=ch;
  }

  return out;
}

function jplopsoft_cmdCompletionTokens(line){
  line=String(line||'');
  var out=[],i=0,len=line.length,start,quote,ch,raw;

  while(i<len){
    while(i<len&&/\s/.test(line.charAt(i)))i++;
    if(i>=len)break;

    start=i;
    quote='';

    while(i<len){
      ch=line.charAt(i);

      if(quote){
        if(ch===quote)quote='';
        i++;
        continue;
      }

      if(ch==='"'||ch==="'"){
        quote=ch;
        i++;
        continue;
      }

      if(/\s/.test(ch))break;
      i++;
    }

    raw=line.substring(start,i);

    out.push({
      start:start,
      end:i,
      raw:raw,
      value:jplopsoft_cmdCompletionDecodeToken(raw),
      quoteUsed:/["']/.test(raw)
    });
  }

  return out;
}

function jplopsoft_cmdCompletionTokenAt(line,caret){
  line=String(line||'');
  caret=parseInt(caret,10);

  if(isNaN(caret)||caret<0)caret=line.length;
  if(caret>line.length)caret=line.length;

  var tokens=jplopsoft_cmdCompletionTokens(line),
      i,t,before;

  for(i=0;i<tokens.length;i++){
    t=tokens[i];

    if(caret>=t.start&&caret<=t.end){
      before=line.substring(t.start,caret);

      return {
        index:i,
        start:t.start,
        end:t.end,
        raw:t.raw,
        value:t.value,
        prefixValue:jplopsoft_cmdCompletionDecodeToken(before),
        quoteUsed:t.quoteUsed||/["']/.test(before)
      };
    }

    if(caret<t.start){
      return {
        index:i,
        start:caret,
        end:caret,
        raw:'',
        value:'',
        prefixValue:'',
        quoteUsed:false
      };
    }
  }

  return {
    index:tokens.length,
    start:caret,
    end:caret,
    raw:'',
    value:'',
    prefixValue:'',
    quoteUsed:false
  };
}

function jplopsoft_cmdCompletionCommandNames(){
  return [
    'ver','winver','echo','cls','clear','cl','cmd','command',
    'shell','system','sh','help','man','exit','explorer','ui',
    'logout','lock','lo','quit','shutdown','passwd','pw',
    'm','math','mr','random','date','time','cd','chdir','pwd',
    'md','mkdir','rd','rmdir','deltree','ren','rename','mv',
    'copy','xcopy','cp','robocopy','move','dir','ls','find',
    'del','delete','erase','old','filever','fv','ol','touch',
    'edit','e','vi','v','vim','word','nano','dl','download',
    'type','cat','less','head','tail','start','notepad',
    'chkdsk','scandisk','sfc','tree','clip','whoami','ex','ex_md3',
    'pause','color','vol','libs','lib','libraries','message',
    'msgbox','selftest','compat','servertest','exconfig','msconfig',
    'taskmgr','taskmgr.exe','regedit','regedit.exe','diskmgmt','diskmgmt.msc','calc','calc.exe','peb','tasklist'
  ];
}

function jplopsoft_cmdCompletionCommandCanonical(raw){
  var s=String(raw||''),slash=s.indexOf('/');

  if(slash>0){
    s=s.substring(0,slash);
  }

  return jplopsoft_cmdHelpCanonical(s);
}

function jplopsoft_cmdCompletionApplyCommandCase(candidate,prefix){
  candidate=String(candidate||'');
  prefix=String(prefix||'');

  if(prefix&&prefix===prefix.toUpperCase()){
    return candidate.toUpperCase();
  }

  if(prefix&&prefix===prefix.toLowerCase()){
    return candidate.toLowerCase();
  }

  return candidate;
}

function jplopsoft_cmdCompletionPathMode(canonical,argIndex){
  canonical=String(canonical||'');
  argIndex=parseInt(argIndex,10)||0;

  if(canonical==='cd'&&argIndex===0)return 'folder';
  if(canonical==='md'&&argIndex===0)return 'folder';
  if(canonical==='rd'&&argIndex===0)return 'folder';
  if(canonical==='tree'&&argIndex===0)return 'folder';

  if(canonical==='dir'&&argIndex===0)return 'either';
  if(canonical==='del'&&argIndex===0)return 'file';
  if(canonical==='old'&&argIndex===0)return 'file';
  if(canonical==='edit'&&argIndex===0)return 'file';
  if(canonical==='download'&&argIndex===0)return 'file';
  if(canonical==='type'&&argIndex===0)return 'file';

  if(canonical==='touch'&&argIndex===0)return 'either';
  if(canonical==='start'&&argIndex===0)return 'either';

  if(canonical==='ren'&&(argIndex===0||argIndex===1)){
    return 'either';
  }

  if(canonical==='copy'&&(argIndex===0||argIndex===1)){
    return 'either';
  }

  if(canonical==='move'&&(argIndex===0||argIndex===1)){
    return 'either';
  }

  return '';
}

function jplopsoft_cmdCompletionPathArgIndex(tokens,currentIndex,canonical){
  var count=0,i,v;

  for(i=1;i<currentIndex;i++){
    v=String(tokens[i].value||'');

    if(canonical==='dir'&&/^\/[bws]+$/i.test(v)){
      continue;
    }

    if(canonical==='tree'&&/^\/[fa]+$/i.test(v)){
      continue;
    }

    count++;
  }

  return count;
}

function jplopsoft_cmdCompletionFormatPath(path,isFolder,quoteWanted){
  var out=String(path||'').replace(/\//g,'\\');

  /*
   * MS-DOS/CMD-style completion should complete the directory name
   * itself, not force an extra trailing backslash.
   *
   * Example:
   *   cd 1<TAB>  -> cd 123
   * not:
   *   cd 1<TAB>  -> cd 123\
   *
   * Existing intermediate path separators are preserved naturally:
   *   cd Documents\Pro<TAB>
   *   -> cd Documents\Projects
   */
  if(quoteWanted||/\s/.test(out)){
    return '"'+out+'"';
  }

  return out;
}

function jplopsoft_cmdCompletionPathCandidates(prefix,mode,quoteWanted){
  prefix=String(prefix||'').replace(/\//g,'\\');
  mode=String(mode||'either');

  if(/[*?]/.test(prefix)){
    return [];
  }

  var lastSlash=prefix.lastIndexOf('\\'),
      basePrefix=lastSlash>=0?prefix.substring(0,lastSlash+1):'',
      leafPrefix=lastSlash>=0?prefix.substring(lastSlash+1):prefix,
      parentSpec=basePrefix,
      oldDenied=state.cmdLastPathDenied,
      parentId,a,out=[],i,n,name,lowerPrefix,isFolder;

  if(parentSpec===''){
    parentId=state.currentFolder;
  }else{
    parentId=jplopsoft_cmdResolveFolder(parentSpec);
  }

  state.cmdLastPathDenied=oldDenied;

  lowerPrefix=leafPrefix.toLowerCase();

  /*
   * C:\logs is a protected virtual CMD folder whose sentinel ID is
   * intentionally negative (-9001). It must be handled BEFORE the
   * generic "parentId < 0 means invalid path" check.
   *
   * Examples:
   *   C:\logs>TYPE s<TAB>              -> TYPE sys.log
   *   C:\logs>TYPE sy<TAB>             -> TYPE sys.log
   *   C:\>TYPE C:\logs\s<TAB>         -> TYPE C:\logs\sys.log
   */
  if(jplopsoft_cmdIsAuditFolderId(parentId)){
    if(
      mode!=='folder'&&
      (!lowerPrefix||'sys.log'.indexOf(lowerPrefix)===0)
    ){
      out.push({
        name:'sys.log',
        isFolder:false,
        sortText:'1sys.log',
        token:jplopsoft_cmdCompletionFormatPath(
          basePrefix+'sys.log',
          false,
          quoteWanted
        )
      });
    }

    return out;
  }

  if(parentId<0){
    return [];
  }

  a=jplopsoft_childrenOf(parentId);

  if(parseInt(parentId,10)===0&&mode!=='file'){
    var virtualNames=jplopsoft_cmdDirVirtualNames(0),vi,vn;

    for(vi=0;vi<virtualNames.length;vi++){
      vn=virtualNames[vi];

      if(
        lowerPrefix&&
        vn.toLowerCase().indexOf(lowerPrefix)!==0
      ){
        continue;
      }

      out.push({
        name:vn,
        isFolder:true,
        sortText:'0'+vn.toLowerCase(),
        token:jplopsoft_cmdCompletionFormatPath(
          basePrefix+vn,
          true,
          quoteWanted
        )
      });
    }
  }

  for(i=0;i<a.length;i++){
    n=a[i];
    isFolder=n.type==='folder';

    if(mode==='folder'&&!isFolder)continue;
    if(mode==='file'&&isFolder)continue;

    name=jplopsoft_decName(n);
    if(name===null)continue;

    if(
      lowerPrefix&&
      name.toLowerCase().indexOf(lowerPrefix)!==0
    ){
      continue;
    }

    out.push({
      name:name,
      isFolder:isFolder,
      sortText:
        (isFolder?'0':'1')+
        name.toLowerCase(),
      token:
        jplopsoft_cmdCompletionFormatPath(
          basePrefix+name,
          isFolder,
          quoteWanted
        )
    });
  }

  out.sort(function(a1,b1){
    if(a1.sortText<b1.sortText)return -1;
    if(a1.sortText>b1.sortText)return 1;
    return 0;
  });

  return out;
}

function jplopsoft_cmdBuildTabCandidates(line,caret){
  line=String(line||'');

  var tokens=jplopsoft_cmdCompletionTokens(line),
      current=jplopsoft_cmdCompletionTokenAt(line,caret),
      out=[],
      prefix=String(current.prefixValue||''),
      names,i,name,lowerPrefix,
      commandToken,canonical,argIndex,mode,pathMatches,
      replacement,tail;

  if(current.index===0){
    if(prefix.indexOf('/')>=0||prefix.indexOf('\\')>=0){
      return [];
    }

    names=jplopsoft_cmdCompletionCommandNames();
    lowerPrefix=prefix.toLowerCase();

    for(i=0;i<names.length;i++){
      name=names[i];

      if(
        lowerPrefix&&
        name.toLowerCase().indexOf(lowerPrefix)!==0
      ){
        continue;
      }

      replacement=
        jplopsoft_cmdCompletionApplyCommandCase(name,prefix);

      out.push({
        value:
          line.substring(0,current.start)+
          replacement+
          line.substring(current.end),
        caret:current.start+replacement.length,
        label:replacement
      });
    }

    return out;
  }

  if(!tokens.length){
    return [];
  }

  commandToken=tokens[0].value;
  canonical=jplopsoft_cmdCompletionCommandCanonical(commandToken);

  if(!canonical){
    return [];
  }

  if(
    (canonical==='dir'&&/^\/[bws]+$/i.test(prefix))||
    (canonical==='tree'&&/^\/[fa]+$/i.test(prefix))
  ){
    return [];
  }

  argIndex=
    jplopsoft_cmdCompletionPathArgIndex(
      tokens,
      current.index,
      canonical
    );

  mode=jplopsoft_cmdCompletionPathMode(canonical,argIndex);

  if(!mode){
    return [];
  }

  pathMatches=
    jplopsoft_cmdCompletionPathCandidates(
      prefix,
      mode,
      current.quoteUsed
    );

  tail=line.substring(current.end);

  for(i=0;i<pathMatches.length;i++){
    replacement=pathMatches[i].token;

    out.push({
      value:
        line.substring(0,current.start)+
        replacement+
        tail,
      caret:current.start+replacement.length,
      label:pathMatches[i].name
    });
  }

  return out;
}

function jplopsoft_cmdApplyTabCompletion(input,reverse){
  if(!input)return false;

  var line=String(input.value||''),
      caret=line.length,
      cycle=state.cmdTabCycle,
      candidates,index,item;

  try{
    if(
      typeof input.selectionStart==='number'&&
      input.selectionStart===input.selectionEnd
    ){
      caret=input.selectionStart;
    }
  }catch(ignoreSelection){}

  if(
    cycle&&
    cycle.lastValue===line&&
    cycle.lastCaret===caret&&
    cycle.candidates&&
    cycle.candidates.length
  ){
    candidates=cycle.candidates;
    index=cycle.index+(reverse?-1:1);

    if(index<0)index=candidates.length-1;
    if(index>=candidates.length)index=0;
  }else{
    candidates=jplopsoft_cmdBuildTabCandidates(line,caret);

    if(!candidates.length){
      state.cmdTabCycle=null;
      return false;
    }

    index=reverse?candidates.length-1:0;
    cycle={
      candidates:candidates,
      index:index,
      lastValue:'',
      lastCaret:0
    };
  }

  item=candidates[index];
  input.value=item.value;

  try{
    input.setSelectionRange(item.caret,item.caret);
  }catch(ignoreCaret){}

  cycle.index=index;
  cycle.lastValue=item.value;
  cycle.lastCaret=item.caret;
  state.cmdTabCycle=cycle;

  state.cmdHistoryIndex=state.cmdHistory.length;
  state.cmdHistoryDraft=input.value;

  return true;
}

function jplopsoft_cmdHelp(){
  jplopsoft_cmdWrite('ExOS CMD Mode 6.3 command help','success');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('VER');
  jplopsoft_cmdWrite('WINVER');
  jplopsoft_cmdWrite('    顯示 CMD / EXES 版本資訊。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('ECHO text');
  jplopsoft_cmdWrite('    印出文字；雙引號會保留。');
  jplopsoft_cmdWrite('ECHO');
  jplopsoft_cmdWrite('    顯示目前 ECHO is on/off。');
  jplopsoft_cmdWrite('ECHO OFF');
  jplopsoft_cmdWrite('    關閉之後的 C:\\>command 指令回顯，並隱藏目前輸入列的 C:\\> Prompt。');
  jplopsoft_cmdWrite('    執行結果與錯誤訊息仍正常顯示。');
  jplopsoft_cmdWrite('ECHO ON');
  jplopsoft_cmdWrite('    恢復指令回顯與目前資料夾 Prompt。');
  jplopsoft_cmdWrite('ECHO.');
  jplopsoft_cmdWrite('ECHO:');
  jplopsoft_cmdWrite('    輸出一個空白行。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('SET');
  jplopsoft_cmdWrite('    顯示目前 ExOS CMD 的全部系統參數與使用者環境變數。');
  jplopsoft_cmdWrite('SET NAME');
  jplopsoft_cmdWrite('    顯示名稱以 NAME 開頭的參數，行為接近 ExOS CMD SET。');
  jplopsoft_cmdWrite('SET NAME=value');
  jplopsoft_cmdWrite('    設定目前 cmd.exe 專屬 PEB Environment；SET NAME= 可刪除。');
  jplopsoft_cmdWrite('    可寫內建參數：EXOS_SORT、EXOS_SORTDIR、EXOS_SIDEBAR_WIDTH、EXOS_COLOR、EXOS_ECHO。');
  jplopsoft_cmdWrite('    新 cmd.exe 只在 CreateProcess 時複製父程序環境；之後 SET 互不影響。');
  jplopsoft_cmdWrite('    支援 %NAME% 變數展開，例如 ECHO %USERNAME%。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('PEB');
  jplopsoft_cmdWrite('    顯示目前 cmd.exe 的 PID / PPID / VAS / PEB / CWD / Environment 數量。');
  jplopsoft_cmdWrite('TASKLIST');
  jplopsoft_cmdWrite('    透過 NtQuerySystemInformation(SystemProcessInformation) 顯示 ExFS 處理程序。');
  jplopsoft_cmdWrite('CMD');
  jplopsoft_cmdWrite('START CMD');
  jplopsoft_cmdWrite('    以 CreateProcess 語意建立另一個獨立 cmd.exe，取得不同 PID 與 PEB。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('CLS');
  jplopsoft_cmdWrite('CLEAR');
  jplopsoft_cmdWrite('CL');
  jplopsoft_cmdWrite('SHELL');
  jplopsoft_cmdWrite('SYSTEM');
  jplopsoft_cmdWrite('SH');
  jplopsoft_cmdWrite('    清除目前 cmd.exe 畫面；不啟動主機 Shell。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('HELP');
  jplopsoft_cmdWrite('?');
  jplopsoft_cmdWrite('MAN');
  jplopsoft_cmdWrite('    顯示這份指令說明。');
  jplopsoft_cmdWrite('COMMAND /?');
  jplopsoft_cmdWrite('COMMAND/?');
  jplopsoft_cmdWrite('    兩種寫法相同：只顯示該允許指令說明，不執行功能。');
  jplopsoft_cmdWrite('    DOS switch 可緊貼指令，例如 DIR/W、DIR/W/S、TREE/F/A。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('TAB autocomplete');
  jplopsoft_cmdWrite('    指令、檔名、資料夾可輸入一部分後按 TAB 自動完成。');
  jplopsoft_cmdWrite('    多個候選：TAB 下一個；Shift+TAB 上一個。');
  jplopsoft_cmdWrite('    支援 C:\ 絕對路徑、相對路徑、..\ 與含空白名稱自動加引號。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('EXIT');
  jplopsoft_cmdWrite('EXPLORER');
  jplopsoft_cmdWrite('UI');
  jplopsoft_cmdWrite('    CMD 獨立分頁會回到 Explorer；若由 Explorer 開啟則優先關閉 CMD 分頁。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('LOGOUT');
  jplopsoft_cmdWrite('LOCK');
  jplopsoft_cmdWrite('LO');
  jplopsoft_cmdWrite('QUIT');
  jplopsoft_cmdWrite('SHUTDOWN');
  jplopsoft_cmdWrite('    登出 ExOS SAM，並清除目前瀏覽器記憶體中的 Vault Key。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('PASSWD');
  jplopsoft_cmdWrite('PW');
  jplopsoft_cmdWrite('    更改目前 SAM 帳號密碼。');
  jplopsoft_cmdWrite('    驗證目前 SAM 密碼後輸入兩次新密碼；4096-bit Vault Key 本身不更換。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('M expression');
  jplopsoft_cmdWrite('MATH expression');
  jplopsoft_cmdWrite('?? expression');
  jplopsoft_cmdWrite('    前端 CSP-safe 算術解析器；只接受數字、+ - * / %、小數點與括號。');
  jplopsoft_cmdWrite('    例如：M "1+1+3"  或  M "312*3123+(123+2)"');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('MR min max');
  jplopsoft_cmdWrite('RANDOM min max');
  jplopsoft_cmdWrite('    使用 crypto.getRandomValues() 在 min~max 間產生一個整數（含上下限）。');
  jplopsoft_cmdWrite('    例如：MR 1 100');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('CHKDSK');
  jplopsoft_cmdWrite('SCANDISK');
  jplopsoft_cmdWrite('SFC');
  jplopsoft_cmdWrite('    逐一讀取目前所有檔案的 X60 密文，以 Vault Key 解密並驗證 EXEFS2 封裝。');
  jplopsoft_cmdWrite('    Binary 另驗證 Base64 與原始 byte length；只檢查、不修改檔案。');
  jplopsoft_cmdWrite('    不掃描歷史版本與垃圾桶內容。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('TREE [path] [/F] [/A]');
  jplopsoft_cmdWrite('    以樹狀方式列出指定資料夾以下的全部資料夾與檔案。');
  jplopsoft_cmdWrite('    未指定 path 時從目前資料夾開始；/A 使用 ASCII 樹狀符號。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('CLIP text');
  jplopsoft_cmdWrite('    將文字複製到瀏覽器剪貼簿。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('WHOAMI');
  jplopsoft_cmdWrite('    顯示固定登入者：exes online  user');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('EX text-or-X60');
  jplopsoft_cmdWrite('    使用目前記憶體中的 4096-bit Vault Key 執行 EXES V6 加解密。');
  jplopsoft_cmdWrite('    參數以 X60 開頭：解密並顯示明文。');
  jplopsoft_cmdWrite('    其他內容：加密並顯示 X60 密文。');
  jplopsoft_cmdWrite('    例：EX 123');
  jplopsoft_cmdWrite('    例：EX X60...');
  jplopsoft_cmdWrite('    純 Browser 記憶體運算，不將 Vault Key 傳送到 PHP。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('EX_MD3 text');
  jplopsoft_cmdWrite('    呼叫目前頁面已載入的 ex_md3.js / ex_md3() 雜湊文字。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('PAUSE');
  jplopsoft_cmdWrite('    顯示 Press any key to continue . . .，按任意鍵後回到目前 CMD prompt。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('COLOR [attr]');
  jplopsoft_cmdWrite('    DOS 兩位十六進位色碼：第一位背景、第二位前景，例如 COLOR 0A。');
  jplopsoft_cmdWrite('    COLOR 不帶參數恢復 07（黑底淺灰字）。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('VOL');
  jplopsoft_cmdWrite('VOL C:');
  jplopsoft_cmdWrite('    顯示 ExES 虛擬 C: 磁碟資訊、檔案/資料夾數量與已記錄大小。');
  jplopsoft_cmdWrite('    不會顯示伺服器真正硬碟或作業系統磁碟資訊。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('LIBS [STATUS|SACK|THREE|MESSAGE|ALL|TEST]');
  jplopsoft_cmdWrite('LIB');
  jplopsoft_cmdWrite('LIBRARIES');
  jplopsoft_cmdWrite('    選用 JS library 管理：tw-sack.js / three.min.js。');
  jplopsoft_cmdWrite('    預設不載入，不影響 ExOS 首次開啟與解鎖速度。');
  jplopsoft_cmdWrite('    LIBS TEST 會測試 THREE Vector3、MESSAGE API 與 SACK bootstrap AJAX。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('MESSAGE text');
  jplopsoft_cmdWrite('MSGBOX text');
  jplopsoft_cmdWrite('    使用 message.js 顯示全螢幕提示；文字會先 HTML escape。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('SELFTEST / COMPAT / SERVERTEST');
  jplopsoft_cmdWrite('    Server/PHP/Filesystem/Web protection 相容性自我檢查。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('EXCONFIG / MSCONFIG');
  jplopsoft_cmdWrite('    開啟 ExConfig（類似 ExOS msconfig）的唯讀系統設定應用程式。');
  jplopsoft_cmdWrite('    可查看 OS、PHP 版本 / php.ini 參數、ExFS 自動 Chunk 與伺服器環境。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('DATE');
  jplopsoft_cmdWrite('TIME');
  jplopsoft_cmdWrite('    顯示瀏覽器目前日期或時間。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('CD');
  jplopsoft_cmdWrite('CHDIR');
  jplopsoft_cmdWrite('PWD');
  jplopsoft_cmdWrite('CD folder');
  jplopsoft_cmdWrite('CD ..');
  jplopsoft_cmdWrite('CD\\');
  jplopsoft_cmdWrite('    顯示目前路徑、切換資料夾、上一層或回根目錄。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('MD folder');
  jplopsoft_cmdWrite('MKDIR folder');
  jplopsoft_cmdWrite('    在目前目錄建立資料夾。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('RD folder');
  jplopsoft_cmdWrite('RMDIR folder');
  jplopsoft_cmdWrite('DELTREE folder');
  jplopsoft_cmdWrite('    將資料夾與其內容移到垃圾桶。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('REN oldname newname');
  jplopsoft_cmdWrite('RENAME oldname newname');
  jplopsoft_cmdWrite('MV oldname newname');
  jplopsoft_cmdWrite('    更改檔案或資料夾名稱，不移動位置。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('COPY source destination');
  jplopsoft_cmdWrite('XCOPY source destination');
  jplopsoft_cmdWrite('CP source destination');
  jplopsoft_cmdWrite('ROBOCOPY source destination');
  jplopsoft_cmdWrite('    複製檔案或資料夾；資料夾會遞迴複製。');
  jplopsoft_cmdWrite('    支援萬用字元檔案來源，例如 COPY *.ico C:\\123123\\');
  jplopsoft_cmdWrite('    萬用字元支援 * 與 ?，只匹配來源目錄中的檔案，不遞迴。');
  jplopsoft_cmdWrite('    萬用字元 COPY 的目的地必須是已存在的資料夾；同名檔案會略過。');
  jplopsoft_cmdWrite('    檔案副本從獨立 Version 1 開始，不複製舊版本歷史。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('MOVE source destination');
  jplopsoft_cmdWrite('    移動檔案或資料夾，可同時改名；不搬動實體 .x6f。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('DIR');
  jplopsoft_cmdWrite('LS');
  jplopsoft_cmdWrite('FIND');
  jplopsoft_cmdWrite('    顯示目前目錄。C:\\ 根目錄另外顯示受保護虛擬資料夾：');
  jplopsoft_cmdWrite('    ExOS、Program Files、Program Files (x86)、exes_libs。');
  jplopsoft_cmdWrite('    C:\\Users 是真實 MFT 資料夾；C:\\ 根目錄禁止使用者寫入。');
  jplopsoft_cmdWrite('    支援：DIR *.ico');
  jplopsoft_cmdWrite('           DIR C:\\123123\\');
  jplopsoft_cmdWrite('           DIR \\123123\\');
  jplopsoft_cmdWrite('           DIR 123123   （目前在 C:\\ 根目錄時）');
  jplopsoft_cmdWrite('           DIR C:\\123123\\*.*');
  jplopsoft_cmdWrite('           DIR /B   或 DIR/B');
  jplopsoft_cmdWrite('           DIR /W   或 DIR/W');
  jplopsoft_cmdWrite('           DIR /W /S 或 DIR/W/S');
  jplopsoft_cmdWrite('           DIR /B C:\\123123\\*.ico');
  jplopsoft_cmdWrite('    /B = Bare format，只顯示名稱。');
  jplopsoft_cmdWrite('    /W = Wide format，多欄顯示；資料夾以 [name] 表示。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('DIR /S filename');
  jplopsoft_cmdWrite('    遞迴搜尋；可搭配路徑與 * / ?，例如 DIR /S C:\\Docs\\*.txt。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('DEL filename');
  jplopsoft_cmdWrite('DELETE filename');
  jplopsoft_cmdWrite('ERASE filename');
  jplopsoft_cmdWrite('DEL *.ext');
  jplopsoft_cmdWrite('DELETE *.ext');
  jplopsoft_cmdWrite('ERASE *.ext');
  jplopsoft_cmdWrite('    將檔案移到垃圾桶；萬用字元也支援相對/絕對資料夾路徑。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('TYPE textfile');
  jplopsoft_cmdWrite('CAT textfile');
  jplopsoft_cmdWrite('LESS textfile');
  jplopsoft_cmdWrite('HEAD textfile');
  jplopsoft_cmdWrite('TAIL textfile');
  jplopsoft_cmdWrite('    五者相同：讀取指定文字/HTML 文件，在 CMD 顯示完整原始文字內容。');
  jplopsoft_cmdWrite('    內容使用 Chunked Read 取回並在瀏覽器端 EXES 解密，不會執行 HTML。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('OLD filename');
  jplopsoft_cmdWrite('FILEVER filename');
  jplopsoft_cmdWrite('FV filename');
  jplopsoft_cmdWrite('OL filename');
  jplopsoft_cmdWrite('    顯示指定檔案的版本歷史清單，只讀 metadata，不讀舊版本內容。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('TOUCH filename');
  jplopsoft_cmdWrite('    建立新的空白 TXT 文件並回到 UI；只允許 .txt。');
  jplopsoft_cmdWrite('    省略副檔名時自動補上 .txt。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('EDIT filename');
  jplopsoft_cmdWrite('E filename');
  jplopsoft_cmdWrite('VI filename');
  jplopsoft_cmdWrite('V filename');
  jplopsoft_cmdWrite('VIM filename');
  jplopsoft_cmdWrite('WORD filename');
  jplopsoft_cmdWrite('NANO filename');
  jplopsoft_cmdWrite('    切回 UI 編輯 HTML / 文字格式；Binary / 圖片不可 EDIT。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('DL filename');
  jplopsoft_cmdWrite('DOWNLOAD filename');
  jplopsoft_cmdWrite('    下載指定檔案；留在 CMD 模式，使用既有 Chunked Read + 瀏覽器端 EXES 解密。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('START filename');
  jplopsoft_cmdWrite('NOTEPAD filename');
  jplopsoft_cmdWrite('    切回 UI 並開啟/定位檔案。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('直接執行檔案限制：');
  jplopsoft_cmdWrite('    *.EXE / *.COM / *.BAT 直接當指令執行時一律拒絕。');
  jplopsoft_cmdWrite('    相對路徑、絕對路徑、含空白的雙引號路徑也相同。');
  jplopsoft_cmdWrite('    TYPE / DL / COPY / OLD 等一般檔案操作不受此限制。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('系統稽核紀錄：');
  jplopsoft_cmdWrite('    C:\\logs\\sys.log');
  jplopsoft_cmdWrite('    TYPE C:\\logs\\sys.log');
  jplopsoft_cmdWrite('    記錄 LOGIN_SUCCESS / LOGIN_FAILED / PASSWORD_INITIALIZED / PASSWORD_CHANGED。');
  jplopsoft_cmdWrite('    logs 是唯讀系統資料夾；不可 DEL / REN / MOVE / EDIT。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('受限制指令：');
  jplopsoft_cmdWrite('    IPCONFIG / PING / NET / FDISK / FORMAT / NETSTAT');
  jplopsoft_cmdWrite('    AT / FC / OSK / REGEDIT / PATH / ATTRIB / CALS / CHCP');
  jplopsoft_cmdWrite('    SUDO / CURL / CONTROL / CHMOD / CHOWN / PS / TOP / KILL / WGET / SSH / APT-GET');
  jplopsoft_cmdWrite('    TITLE / ROUTE / ARP / SUBST / MKLINK / BCDEDIT / SCHTASKS / REG / PROMPT');
  jplopsoft_cmdWrite('    COMPACT / CIPHER / TASKKILL / TASKLIST / FINDSTR / TRACERT / NSLOOKUP');
  jplopsoft_cmdWrite('    POWERCFG / ASSOC / DISKPART / DRIVERQUERY / GETMAC');
  jplopsoft_cmdWrite('    MSG / WMIC / LOGOFF / QWINSTA / GPUPDATE / GPRESULT / NBTSTAT');
  jplopsoft_cmdWrite('    FSUTIL / VSSADMIN / LABEL / PATHPING');
  jplopsoft_cmdWrite('    以上皆只顯示 Access is denied，不會執行主機命令。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('鍵盤歷史：');
  jplopsoft_cmdWrite('    ↑  上一筆指令');
  jplopsoft_cmdWrite('    ↓  下一筆指令；到最新位置時恢復原本尚未送出的輸入');
  jplopsoft_cmdWrite('    CMD / UI 切換不清除歷史；鎖定或 LOGOUT 才清除。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('CMD 路徑規則：');
  jplopsoft_cmdWrite('    相對：file.txt、folder\\file.txt、.\\file.txt、..\\file.txt');
  jplopsoft_cmdWrite('    絕對：\\folder\\file.txt、C:\\folder\\file.txt');
  jplopsoft_cmdWrite('    有路徑參數的檔案/資料夾指令皆使用相同 DOS 路徑規則。');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('名稱含空白時請使用雙引號，例如：');
  jplopsoft_cmdWrite('    CD "My Folder"');
  jplopsoft_cmdWrite('    TYPE "read me.txt"');
  jplopsoft_cmdWrite('    DELETE "*.log"');
}
function jplopsoft_cmdTypeFile(path){
  var arg=jplopsoft_cmdUnquote(path),n,name,fmt,audit;

  if(!arg){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: TYPE textfile');
    return;
  }

  audit=jplopsoft_cmdAuditResolvePath(arg);

  if(audit.handled){
    if(audit.kind==='file'){
      jplopsoft_cmdTypeAuditLog();
    }else{
      jplopsoft_cmdWrite('Access is denied. TYPE requires a file.','error');
    }
    return;
  }

  n=jplopsoft_cmdResolveNode(arg);

  if(!n){
    if(jplopsoft_cmdReportLastPathDenied())return;
    jplopsoft_cmdWrite('The system cannot find the file specified.','error');
    return;
  }

  if(n.type!=='file'){
    jplopsoft_cmdWrite('Access is denied. TYPE requires a file.','error');
    return;
  }

  name=jplopsoft_decName(n)||arg;
  if(jplopsoft_nodeIsLargeFile(n)||(parseInt(n.original_size,10)||0)>jplopsoft_TEXT_ONLINE_EDIT_MAX){
    jplopsoft_cmdWrite('TYPE is unavailable for large/download-only files. Use DOWNLOAD instead.','error');
    return;
  }
  fmt=jplopsoft_fileFormatFromName(name);

  /*
   * HTML is textual too, but TYPE displays its raw source only.
   * Images / unknown Binary are rejected instead of decoding arbitrary bytes.
   */
  if(fmt!=='txt'&&fmt!=='html'){
    jplopsoft_cmdWrite('TYPE can display text/HTML files only.','error');
    return;
  }

  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  jplopsoft_cmdSetBusy(true);
  jplopsoft_cmdWrite('Reading '+name+' ...','info');

  jplopsoft_fetchNodeContent(
    n.id,
    function(err,out){
      var src;

      if(err){
        jplopsoft_cmdSetBusy(false);
        jplopsoft_cmdWrite('TYPE failed: '+err.message,'error');
        return;
      }

      try{
        src=jplopsoft_decContentCipher(out.content_enc,jplopsoft_nodeFekById(n.id));
        if(src===null){
          throw new Error('文件內容格式無法解密。');
        }
      }catch(e){
        jplopsoft_cmdSetBusy(false);
        jplopsoft_cmdWrite('TYPE failed: '+e.message,'error');
        return;
      }

      jplopsoft_cmdWrite('');
      /*
       * cmdWrite uses textContent + white-space:pre-wrap.
       * Even HTML source is displayed as inert text and never executed.
       */
      jplopsoft_cmdWrite(src);
      jplopsoft_cmdWrite('');
      jplopsoft_cmdWrite('----- End of '+name+' -----','info');
      jplopsoft_cmdSetBusy(false);
      jplopsoft_cmdScrollBottom();
    },
    function(done,total){
      /*
       * Keep the terminal responsive without adding hundreds of progress lines.
       * The input stays disabled until the requested file has finished loading.
       */
    }
  );
}

function jplopsoft_cmdSplitArgs(s){
  s=String(s||'');
  var out=[],buf='',quote='',i,ch;

  for(i=0;i<s.length;i++){
    ch=s.charAt(i);

    if(quote){
      if(ch===quote)quote='';
      else buf+=ch;
      continue;
    }

    if(ch==='"'||ch==="'"){
      quote=ch;
      continue;
    }

    if(/\s/.test(ch)){
      if(buf!==''){
        out.push(buf);
        buf='';
      }
      continue;
    }

    buf+=ch;
  }

  if(buf!=='')out.push(buf);
  return out;
}
function jplopsoft_cmdValidateName(raw,type,preferredExt){
  var name=jplopsoft_trim(String(raw||'')),ext;

  if(!name){
    jplopsoft_cmdWrite('The file or directory name is invalid.','error');
    return null;
  }
  if(name.length>120){
    jplopsoft_cmdWrite('The name is limited to 120 characters.','error');
    return null;
  }
  if(/[\\\/:*?"<>|]/.test(name)){
    jplopsoft_cmdWrite('The name contains invalid characters.','error');
    return null;
  }
  if(name==='.'||name==='..'){
    jplopsoft_cmdWrite('The file or directory name is invalid.','error');
    return null;
  }

  if(type==='file'&&!jplopsoft_fileExtension(name)){
    ext=String(preferredExt||'').replace(/^\./,'').toLowerCase();
    if(!/^[a-z0-9][a-z0-9_+.-]*$/.test(ext))ext='txt';
    name+='.'+ext;
  }

  return name;
}
function jplopsoft_cmdMathEval(argLine){
  var expr=jplopsoft_cmdUnquote(argLine),pos=0,len,result;

  if(!expr){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: M "1+1+3"');
    return;
  }

  if(expr.length>512){
    jplopsoft_cmdWrite('Math expression is too long. Maximum: 512 characters.','error');
    return;
  }

  if(!/^[0-9+\-*\/%().\s]+$/.test(expr)){
    jplopsoft_cmdWrite('Math expression contains forbidden characters.','error');
    return;
  }

  if(/\/\/|\/\*|\*\/|\*\*/.test(expr)){
    jplopsoft_cmdWrite('Math expression contains a forbidden operator sequence.','error');
    return;
  }

  len=expr.length;

  function jplopsoft_skipSpace(){
    while(pos<len&&/\s/.test(expr.charAt(pos)))pos++;
  }

  function jplopsoft_parseNumber(){
    var begin,ch,dots=0,s;
    jplopsoft_skipSpace();
    begin=pos;

    while(pos<len){
      ch=expr.charAt(pos);

      if(ch>='0'&&ch<='9'){
        pos++;
        continue;
      }

      if(ch==='.'){
        dots++;
        if(dots>1)throw new Error('number');
        pos++;
        continue;
      }

      break;
    }

    if(begin===pos)throw new Error('number');

    s=expr.substring(begin,pos);
    if(s==='.')throw new Error('number');

    return Number(s);
  }

  function jplopsoft_parsePrimary(){
    var v,ch;

    jplopsoft_skipSpace();

    if(pos>=len)throw new Error('primary');

    ch=expr.charAt(pos);

    if(ch==='+'||ch==='-'){
      pos++;
      v=jplopsoft_parsePrimary();
      return ch==='-'?-v:v;
    }

    if(ch==='('){
      pos++;
      v=jplopsoft_parseExpression();
      jplopsoft_skipSpace();

      if(pos>=len||expr.charAt(pos)!==')'){
        throw new Error('paren');
      }

      pos++;
      return v;
    }

    return jplopsoft_parseNumber();
  }

  function jplopsoft_parseTerm(){
    var v=jplopsoft_parsePrimary(),op,rhs;

    while(true){
      jplopsoft_skipSpace();
      if(pos>=len)break;

      op=expr.charAt(pos);

      if(op!=='*'&&op!=='/'&&op!=='%')break;

      pos++;
      rhs=jplopsoft_parsePrimary();

      if(op==='*')v=v*rhs;
      else if(op==='/')v=v/rhs;
      else v=v%rhs;
    }

    return v;
  }

  function jplopsoft_parseExpression(){
    var v=jplopsoft_parseTerm(),op,rhs;

    while(true){
      jplopsoft_skipSpace();
      if(pos>=len)break;

      op=expr.charAt(pos);

      if(op!=='+'&&op!=='-')break;

      pos++;
      rhs=jplopsoft_parseTerm();

      if(op==='+')v=v+rhs;
      else v=v-rhs;
    }

    return v;
  }

  try{
    result=jplopsoft_parseExpression();
    jplopsoft_skipSpace();

    if(pos!==len){
      throw new Error('trailing');
    }
  }catch(e){
    jplopsoft_cmdWrite('Math syntax error.','error');
    return;
  }

  if(typeof result!=='number'||!isFinite(result)||isNaN(result)){
    jplopsoft_cmdWrite('Math result is not a finite number.','error');
    return;
  }

  if(result===0)result=0;
  jplopsoft_cmdWrite(String(result),'success');
}
function jplopsoft_cmdRandomInt(argLine){
  var args=jplopsoft_cmdSplitArgs(argLine||''),
      min,max,span,cryptoObj,values,limit,x,result,
      jplopsoft_UINT32_RANGE=4294967296;

  if(args.length!==2){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: MR min max');
    return;
  }

  if(!/^[+-]?\d+$/.test(args[0])||!/^[+-]?\d+$/.test(args[1])){
    jplopsoft_cmdWrite('MR requires two integers.','error');
    return;
  }

  min=Number(args[0]);
  max=Number(args[1]);

  if(
    !isFinite(min)||!isFinite(max)||
    Math.floor(min)!==min||Math.floor(max)!==max||
    Math.abs(min)>9007199254740991||
    Math.abs(max)>9007199254740991
  ){
    jplopsoft_cmdWrite('MR requires safe JavaScript integers.','error');
    return;
  }

  if(min>max){
    jplopsoft_cmdWrite('MR requires min <= max.','error');
    return;
  }

  span=max-min+1;
  if(span<1||span>jplopsoft_UINT32_RANGE){
    jplopsoft_cmdWrite('MR range is too large. Maximum inclusive range: 4294967296.','error');
    return;
  }

  cryptoObj=window.crypto||window.msCrypto;
  if(!cryptoObj||typeof cryptoObj.getRandomValues!=='function'){
    jplopsoft_cmdWrite('Secure browser random generator is unavailable.','error');
    return;
  }

  values=new Uint32Array(1);
  limit=jplopsoft_UINT32_RANGE-(jplopsoft_UINT32_RANGE%span);

  /* Rejection sampling avoids modulo bias. */
  do{
    cryptoObj.getRandomValues(values);
    x=values[0];
  }while(x>=limit);

  result=min+(x%span);
  jplopsoft_cmdWrite(String(result),'success');
}

function jplopsoft_cmdCheckDiskSafeName(n){
  var name;
  try{
    name=jplopsoft_decName(n);
    if(name!==null&&name!=='')return name;
  }catch(e){}
  return '[UNREADABLE#'+n.id+']';
}
function jplopsoft_cmdCheckDiskSafePath(n){
  var parts=[],cur=n,guard=0,name,parent;

  while(cur&&guard<100000){
    guard++;
    name=jplopsoft_cmdCheckDiskSafeName(cur);
    parts.unshift(name);

    if(cur.parent_id===0)break;

    parent=jplopsoft_findNode(cur.parent_id);
    if(!parent){
      parts.unshift('[MISSING-PARENT#'+cur.parent_id+']');
      break;
    }

    cur=parent;
  }

  return 'C:\\'+parts.join('\\');
}
function jplopsoft_cmdCheckCipherIntegrity(cipher,key){
  var plain='',body,cut,declared,b64,bytes=null,i;

  if(!key||!/^[0-9a-f]{128}$/i.test(String(key))){
    throw new Error('檔案 FEK 不可用');
  }

  if(!cipher||String(cipher).substr(0,3)!=='X60'){
    throw new Error('不是有效的 X60 密文');
  }

  try{
    plain=jplopsoft_decRaw(cipher,key);
  }catch(e){
    throw new Error('EXES 解密失敗');
  }

  if(typeof plain!=='string'){
    throw new Error('解密結果格式異常');
  }

  if(plain.indexOf(jplopsoft_CONTENT2)===0){
    plain='';
    return {kind:'TEXT'};
  }

  if(plain.indexOf(jplopsoft_BINARY2)===0){
    if(!jplopsoft_base64Ready()){
      plain='';
      throw new Error('base64.js 尚未載入');
    }

    body=plain.substring(jplopsoft_BINARY2.length);
    cut=body.indexOf('|');

    if(cut<1){
      plain='';
      throw new Error('Binary 封裝格式損毀');
    }

    declared=parseInt(body.substring(0,cut),10);

    if(!(declared>=0)){
      plain='';
      throw new Error('Binary 原始大小欄位損毀');
    }

    b64=body.substring(cut+1);

    try{
      bytes=window.base64.decode.bytes(b64);
    }catch(e2){
      plain='';
      throw new Error('Binary Base64 損毀');
    }

    if(!bytes||bytes.length!==declared){
      if(bytes&&typeof bytes.length==='number'){
        for(i=0;i<bytes.length;i++)bytes[i]=0;
      }
      bytes=null;
      plain='';
      body='';
      b64='';
      throw new Error('Binary byte length 驗證失敗');
    }

    for(i=0;i<bytes.length;i++)bytes[i]=0;
    bytes=null;
    plain='';
    body='';
    b64='';

    return {
      kind:'BINARY',
      original_size:declared
    };
  }

  plain='';
  throw new Error('無法識別 EXEFS2 內容封裝');
}
function jplopsoft_cmdCheckDisk(argLine){
  var arg=jplopsoft_trim(String(argLine||'')),
      files=[],
      i,n,
      ok=0,
      failed=0,
      nameFailed=0,
      started=(new Date()).getTime();

  if(arg){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: CHKDSK');
    return;
  }

  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  if(!state.vaultKey){
    jplopsoft_cmdWrite('Access is denied. Please unlock EXES first.','error');
    return;
  }

  for(i=0;i<state.nodes.length;i++){
    n=state.nodes[i];
    if(n&&n.type==='file')files.push(n);
  }

  files.sort(function(a,b){
    var ap=jplopsoft_cmdCheckDiskSafePath(a).toLowerCase(),
        bp=jplopsoft_cmdCheckDiskSafePath(b).toLowerCase();
    return ap<bp?-1:(ap>bp?1:0);
  });

  jplopsoft_cmdWrite('EXES CHKDSK - Decryption Integrity Scan','info');
  jplopsoft_cmdWrite('Scanning current files with each file-specific FEK.');
  jplopsoft_cmdWrite('Historical versions and Recycle Bin items are not scanned.');
  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite('Files to scan: '+files.length);

  if(!files.length){
    jplopsoft_cmdWrite('No files found.','success');
    return;
  }

  jplopsoft_cmdSetBusy(true);

  function jplopsoft_finish(){
    var elapsed=((new Date()).getTime()-started)/1000;

    jplopsoft_cmdSetBusy(false);
    jplopsoft_setStatus(
      failed===0&&nameFailed===0
        ? 'CHKDSK 完成：未發現解密或封裝完整性錯誤。'
        : 'CHKDSK 完成：發現 '+failed+' 個內容錯誤，'+nameFailed+' 個檔名警告。'
    );

    jplopsoft_cmdWrite('');
    jplopsoft_cmdWrite('CHKDSK scan complete.','info');
    jplopsoft_cmdWrite('Total  : '+files.length);
    jplopsoft_cmdWrite('OK     : '+ok,'success');
    jplopsoft_cmdWrite('FAILED : '+failed,failed?'error':'success');

    if(nameFailed){
      jplopsoft_cmdWrite('Name decrypt warnings: '+nameFailed,'error');
    }

    jplopsoft_cmdWrite('Elapsed: '+elapsed.toFixed(1)+' sec');

    if(failed===0&&nameFailed===0){
      jplopsoft_cmdWrite(
        'No decryption or EXEFS2 integrity errors were detected.',
        'success'
      );
    }else{
      jplopsoft_cmdWrite(
        'One or more files require attention. CHKDSK did not modify them.',
        'error'
      );
    }

    jplopsoft_cmdRefreshPrompt();
    jplopsoft_cmdScrollBottom();
  }

  function jplopsoft_scan(index){
    var file,path,nameOk=true;

    if(index>=files.length){
      jplopsoft_finish();
      return;
    }

    if(!state.vaultKey){
      failed+=(files.length-index);
      jplopsoft_cmdWrite(
        'Scan aborted because EXES was locked during CHKDSK.',
        'error'
      );
      jplopsoft_finish();
      return;
    }

    file=files[index];

    try{
      if(jplopsoft_decName(file)===null)nameOk=false;
    }catch(e){
      nameOk=false;
    }

    if(!nameOk)nameFailed++;

    path=jplopsoft_cmdCheckDiskSafePath(file);

    jplopsoft_cmdWrite(
      '['+(index+1)+'/'+files.length+'] '+path+' ...',
      'info'
    );

    if(jplopsoft_nodeIsLargeFile(file)){
      jplopsoft_fetchLargeInfo(file.id,function(infoErr,info){
        var blocks,blockIndex=0,fek;

        if(infoErr){
          failed++;
          jplopsoft_cmdWrite('    FAILED: '+infoErr.message,'error');
          jplopsoft_cmdSetTimeout(function(){jplopsoft_scan(index+1);},0);
          return;
        }

        blocks=info&&info.blocks?info.blocks:[];
        try{fek=jplopsoft_nodeFek(file);}catch(fekErr){fek='';}

        function jplopsoft_largeFail(err){
          failed++;
          jplopsoft_closeNodeReadHandle(file.id);
          jplopsoft_cmdWrite(
            '    FAILED: '+String(err&&err.message?err.message:err)+
            (nameOk?'':'  [NAME WARNING]'),
            'error'
          );
          jplopsoft_cmdSetTimeout(function(){jplopsoft_scan(index+1);},0);
        }

        function jplopsoft_largeNext(){
          var block;
          if(blockIndex>=blocks.length){
            jplopsoft_closeNodeReadHandle(file.id);
            ok++;
            jplopsoft_cmdWrite(
              '    OK [CHUNKED_V1]  blocks='+blocks.length+
              '  plain='+String(parseInt(info.original_size,10)||0)+' bytes'+
              (nameOk?'':'  [NAME WARNING]'),
              nameOk?'success':'error'
            );
            jplopsoft_cmdSetTimeout(function(){jplopsoft_scan(index+1);},0);
            return;
          }

          block=blocks[blockIndex];
          jplopsoft_fetchLargeEncryptedBlock(
            file.id,
            block,
            info.chunk_size,
            function(done,total){
              var fileBase=blockIndex/Math.max(1,blocks.length),
                  blockPart=(total?done/total:0)/Math.max(1,blocks.length);
              jplopsoft_setStatus(
                'CHKDSK '+(index+1)+'/'+files.length+
                '：'+path+'  '+
                Math.floor((fileBase+blockPart)*100)+'%'
              );
            },
            function(blockErr,cipher){
              var bytes=null,expected;
              if(blockErr)return jplopsoft_largeFail(blockErr);
              try{
                bytes=jplopsoft_decBinaryCipher(cipher,fek);
                expected=parseInt(block.plain_size,10)||0;
                if(bytes===null)throw new Error('CHUNKED Block FEK 解密失敗。');
                if(bytes.length!==expected)throw new Error('CHUNKED Block 明文大小驗證失敗。');
              }catch(e2){
                cipher='';
                bytes=null;
                return jplopsoft_largeFail(e2);
              }
              cipher='';
              bytes=null;
              blockIndex++;
              jplopsoft_cmdSetTimeout(jplopsoft_largeNext,0);
            }
          );
        }

        if(!fek||!/^[0-9a-f]{128}$/i.test(String(fek))){
          jplopsoft_largeFail(new Error('檔案 FEK 不可用'));
          return;
        }
        jplopsoft_largeNext();
      });
      return;
    }

    jplopsoft_fetchNodeContent(
      file.id,
      function(err,out){
        var verified;

        if(err){
          failed++;
          jplopsoft_cmdWrite('    FAILED: '+err.message,'error');
          jplopsoft_cmdSetTimeout(function(){jplopsoft_scan(index+1);},0);
          return;
        }

        try{
          verified=jplopsoft_cmdCheckCipherIntegrity(out.content_enc,jplopsoft_nodeFek(file));
          ok++;

          jplopsoft_cmdWrite(
            '    OK ['+verified.kind+']  cipher='+
            out.cipher_size+' bytes'+
            (nameOk?'':'  [NAME WARNING]'),
            nameOk?'success':'error'
          );
        }catch(e2){
          failed++;
          jplopsoft_cmdWrite(
            '    FAILED: '+e2.message+
            (nameOk?'':'  [NAME WARNING]'),
            'error'
          );
        }

        if(out)out.content_enc='';
        out=null;
        verified=null;

        jplopsoft_cmdSetTimeout(function(){jplopsoft_scan(index+1);},0);
      },
      function(done,total){
        jplopsoft_setStatus(
          'CHKDSK '+(index+1)+'/'+files.length+
          '：'+path+'  '+
          Math.floor((done/total)*100)+'%'
        );
      }
    );
  }

  jplopsoft_scan(0);
}

function jplopsoft_cmdEchoCommand(argLine){
  var raw=String(argLine===undefined?'':argLine),
      value=jplopsoft_trim(raw),
      lower=value.toLowerCase();

  if(value===''){
    jplopsoft_cmdWrite(
      state.cmdEcho===false?'ECHO is off.':'ECHO is on.',
      'info'
    );
    return;
  }

  if(lower==='off'){
    state.cmdEcho=false;
    jplopsoft_cmdRefreshPrompt();
    return;
  }

  if(lower==='on'){
    state.cmdEcho=true;
    jplopsoft_cmdRefreshPrompt();
    return;
  }

  /*
   * DOS-like ECHO prints text after ECHO as entered by the parser.
   * Quotes are intentionally preserved.
   */
  jplopsoft_cmdWrite(raw);
}

function jplopsoft_cmdSetWritableName(name){
  name=String(name||'').toUpperCase();
  return (
    name==='EXOS_SORT'||
    name==='EXOS_SORTDIR'||
    name==='EXOS_SIDEBAR_WIDTH'||
    name==='EXOS_COLOR'||
    name==='EXOS_ECHO'
  );
}
function jplopsoft_cmdSetSystemMap(){
  var out={},browser='Browser',ctx=jplopsoft_cmdExecutionContext(),proc=ctx&&ctx.process?ctx.process:null,parentProc=null;
  try{
    browser=jplopsoft_isIE11Browser()?'Internet Explorer 11':'Modern Browser';
  }catch(ignoreBrowser){}

  out.CD=jplopsoft_cmdPathText(state.currentFolder);
  out.COMSPEC='EXOS CMD MODE';
  out.HOMEDRIVE='C:';
  out.USERNAME=String(state.samUsername||'');
  out.USER_SID=String(state.samSid||'');
  out.EXOS_VERSION='6.3';
  out.EXOS_AUTH=jplopsoft_EXE_ROUTE?String(jplopsoft_EXE_ROUTE.auth||''):'';
  out.EXOS_CORE=jplopsoft_EXE_ROUTE?String(jplopsoft_EXE_ROUTE.core||''):'';
  out.EXOS_EXECUTABLE=jplopsoft_EXE_ROUTE?String(jplopsoft_EXE_ROUTE.image||''):'';
  out.EXOS_PROCESS_PARENT=jplopsoft_EXE_ROUTE?String(jplopsoft_EXE_ROUTE.parent_process||''):'';
  out.EXOS_PROCESS_CHAIN=jplopsoft_EXE_ROUTE?String(jplopsoft_EXE_ROUTE.run||''):'';
  out.EXOS_PROCESS_DEPTH=jplopsoft_EXE_ROUTE?String(jplopsoft_EXE_ROUTE.process_depth||1):'0';
  out.EXOS_PROCESS_DESCRIPTOR=jplopsoft_EXE_ROUTE?String(jplopsoft_EXE_ROUTE.raw||''):'';
  if(jplopsoft_EXE_ROUTE&&jplopsoft_EXE_ROUTE.parameters){
    var exfsParamIndex,exfsParamKey;
    for(exfsParamIndex=1;exfsParamIndex<=16;exfsParamIndex++){
      exfsParamKey='parameter'+exfsParamIndex;
      if(typeof jplopsoft_EXE_ROUTE.parameters[exfsParamKey]!=='undefined')out['EXOS_PARAMETER'+exfsParamIndex]=String(jplopsoft_EXE_ROUTE.parameters[exfsParamKey]);
    }
  }
  out.EXFS_FILESYSTEM='EXFS_SPLIT7';
  out.EXOS_SAM_MODEL='EXOS_NT_SAM_V3';
  out.EXOS_SECURITY_MODEL='EXOS_NT_SECURITY_V2';
  out.EXOS_NAMESPACE_MODEL='EXOS_NT_PROFILE_V1';
  out.EXFS_REPARSE_MODEL='EXOS_NT_REPARSE_V1';
  out.EXFS_ADS_MODEL='EXOS_NT_ADS_V1';
  out.EXOS_REGISTRY_MODEL='EXOS_NT_REGISTRY_V1';
  out.EXOS_EVENT_LOG_MODEL='EXFS_EVTX1';
  out.EXOS_OBJECT_MANAGER_MODEL='EXFS_OBJECT_MANAGER1';
  out.EXOS_OBJECT_HANDLE_MODEL='EXFS_OBJECT_HANDLE1';
  out.EXOS_ALPC_MODEL='EXFS_ALPC1';
  out.EXFS_MINIFILTER_MODEL='EXFS_MINIFILTER1';
  out.EXFS_QUOTA_MODEL='EXFS_QUOTA2';
  out.EXOS_USERS_ROOT='C:\\Users';
  out.EXOS_PROFILE_ROOT=state.samUsername?('C:\\Users\\'+String(state.samUsername)):'';
  out.EXOS_DOCUMENTS=state.samUsername?('C:\\Users\\'+String(state.samUsername)+'\\Documents'):'';
  out.EXES_VAULT_BITS='4096';
  out.EXOS_SAM_KDF='ex_md3n';
  out.EXOS_SAM_KDF_ITERATIONS=String(state.samIterations||20000);
  out.EXFS_LARGE_BLOCK_BYTES=String(jplopsoft_LARGE_PLAIN_BLOCK_BYTES);
  out.EXFS_MAX_FILE_BYTES=String(jplopsoft_MAX_LOGICAL_FILE_BYTES);

  if(proc){
    if(typeof jplopsoft_ntKernelProcessByPid==='function')parentProc=jplopsoft_ntKernelProcessByPid(proc.ppid);
    out.EXOS_PROCESS='cmd.exe';
    out.EXOS_PID=String(proc.pid||0);
    out.EXOS_PPID=String(proc.ppid||0);
    out.EXOS_PARENT_IMAGE=parentProc?String(parentProc.imageName||''):'';
    out.EXOS_VIRTUAL_ADDRESS_SPACE=String(proc.virtualAddressSpaceId||'');
    out.EXOS_PEB_ID=proc.peb?String(proc.peb.id||''):'';
    out.EXOS_SESSION_ID=String(proc.sessionId||1);
  }
  out.EXOS_BROWSER=browser;
  out.EXOS_SORT=String(state.sortKey||'name').toUpperCase();
  out.EXOS_SORTDIR=state.sortDir===-1?'DESC':'ASC';
  out.EXOS_SIDEBAR_WIDTH=String(parseInt(state.sidebarWidth,10)||270);
  out.EXOS_COLOR=String(state.cmdColor||'07').toUpperCase();
  out.EXOS_ECHO=state.cmdEcho===false?'OFF':'ON';
  return out;
}
function jplopsoft_cmdSetAllMap(){
  var out=jplopsoft_cmdSetSystemMap(),k;
  if(!state.cmdEnv||typeof state.cmdEnv!=='object')state.cmdEnv={};
  for(k in state.cmdEnv){
    if(
      state.cmdEnv.hasOwnProperty(k)&&
      typeof out[k]==='undefined'
    ){
      out[k]=String(state.cmdEnv[k]);
    }
  }
  return out;
}
function jplopsoft_cmdExpandVariables(input){
  var map=jplopsoft_cmdSetAllMap();
  return String(input||'').replace(
    /%([A-Za-z_][A-Za-z0-9_]*)%/g,
    function(all,name){
      name=String(name||'').toUpperCase();
      return typeof map[name]==='undefined'?'':String(map[name]);
    }
  );
}
function jplopsoft_cmdSetApplyBuiltin(name,value){
  var v=String(value===undefined?'':value),n,w,aside;
  name=String(name||'').toUpperCase();

  if(name==='EXOS_SORT'){
    v=jplopsoft_trim(v).toUpperCase();
    if(v!=='NAME'&&v!=='TYPE'&&v!=='SIZE'&&v!=='MODIFIED'){
      jplopsoft_cmdWrite('SET error: EXOS_SORT must be NAME, TYPE, SIZE, or MODIFIED.','error');
      return false;
    }
    state.sortKey=v.toLowerCase();
    state.selectedId=0;
    jplopsoft_uiStorageSave();
    jplopsoft_renderFiles();
    return true;
  }

  if(name==='EXOS_SORTDIR'){
    v=jplopsoft_trim(v).toUpperCase();
    if(v==='ASC'||v==='1')state.sortDir=1;
    else if(v==='DESC'||v==='-1')state.sortDir=-1;
    else{
      jplopsoft_cmdWrite('SET error: EXOS_SORTDIR must be ASC or DESC.','error');
      return false;
    }
    state.selectedId=0;
    jplopsoft_uiStorageSave();
    jplopsoft_renderFiles();
    return true;
  }

  if(name==='EXOS_SIDEBAR_WIDTH'){
    if(!/^\d+$/.test(jplopsoft_trim(v))){
      jplopsoft_cmdWrite('SET error: EXOS_SIDEBAR_WIDTH must be an integer from 190 to 520.','error');
      return false;
    }
    w=parseInt(v,10);
    if(w<190||w>520){
      jplopsoft_cmdWrite('SET error: EXOS_SIDEBAR_WIDTH must be from 190 to 520.','error');
      return false;
    }
    state.sidebarWidth=w;
    aside=document.querySelector('.jplopsoft_sidebar');
    if(aside)aside.style.width=w+'px';
    jplopsoft_uiStorageSave();
    return true;
  }

  if(name==='EXOS_COLOR'){
    v=jplopsoft_trim(v).toUpperCase();
    if(!/^[0-9A-F]{2}$/.test(v)||v.charAt(0)===v.charAt(1)){
      jplopsoft_cmdWrite('SET error: EXOS_COLOR requires two different hexadecimal color digits, for example 0A.','error');
      return false;
    }
    state.cmdColor=v;
    jplopsoft_cmdApplyColor();
    jplopsoft_registrySaveCmdPrefs();
    return true;
  }

  if(name==='EXOS_ECHO'){
    v=jplopsoft_trim(v).toUpperCase();
    if(v!=='ON'&&v!=='OFF'){
      jplopsoft_cmdWrite('SET error: EXOS_ECHO must be ON or OFF.','error');
      return false;
    }
    state.cmdEcho=(v==='ON');
    jplopsoft_cmdRefreshPrompt();
    jplopsoft_registrySaveCmdPrefs();
    return true;
  }

  return false;
}
function jplopsoft_cmdSetCommand(argLine){
  var raw=jplopsoft_trim(String(argLine||'')),map,keys=[],i,k,eq,name,value,
      query,found=0;

  if(raw.length>=2&&raw.charAt(0)==='"'&&raw.charAt(raw.length-1)==='"'){
    raw=raw.substring(1,raw.length-1);
  }

  if(raw===''){
    map=jplopsoft_cmdSetAllMap();
    for(k in map)if(map.hasOwnProperty(k))keys.push(k);
    keys.sort();
    for(i=0;i<keys.length;i++)jplopsoft_cmdWrite(keys[i]+'='+map[keys[i]]);
    return;
  }

  eq=raw.indexOf('=');
  if(eq<0){
    query=jplopsoft_trim(raw).toUpperCase();
    if(!query){
      jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
      return;
    }
    map=jplopsoft_cmdSetAllMap();
    for(k in map){
      if(map.hasOwnProperty(k)&&k.indexOf(query)===0)keys.push(k);
    }
    keys.sort();
    for(i=0;i<keys.length;i++){
      jplopsoft_cmdWrite(keys[i]+'='+map[keys[i]]);
      found++;
    }
    if(!found){
      jplopsoft_cmdWrite('Environment variable '+query+' not defined.','error');
    }
    return;
  }

  name=jplopsoft_trim(raw.substring(0,eq)).toUpperCase();
  value=raw.substring(eq+1);

  if(!/^[A-Z_][A-Z0-9_]{0,63}$/.test(name)){
    jplopsoft_cmdWrite('SET error: invalid variable name.','error');
    return;
  }

  map=jplopsoft_cmdSetSystemMap();

  if(jplopsoft_cmdSetWritableName(name)){
    if(value===''){
      jplopsoft_cmdWrite('SET error: built-in ExFS parameter '+name+' cannot be deleted.','error');
      return;
    }
    if(jplopsoft_cmdSetApplyBuiltin(name,value)){
      map=jplopsoft_cmdSetSystemMap();
      jplopsoft_cmdWrite(name+'='+map[name],'success');
    }
    return;
  }

  if(typeof map[name]!=='undefined'){
    jplopsoft_cmdWrite('Access is denied. '+name+' is a read-only ExFS system parameter.','error');
    return;
  }

  if(!state.cmdEnv||typeof state.cmdEnv!=='object')state.cmdEnv={};

  if(value===''){
    if(jplopsoft_cmdExecutionContext()&&jplopsoft_cmdExecutionContext().process){
      jplopsoft_SetEnvironmentVariable(jplopsoft_cmdExecutionContext().process,name,null);
    }else if(state.cmdEnv.hasOwnProperty(name)){
      delete state.cmdEnv[name];
    }
    jplopsoft_cmdSyncPeb(jplopsoft_cmdExecutionContext());
    return;
  }

  if(value.length>2048){
    jplopsoft_cmdWrite('SET error: variable value is limited to 2048 characters.','error');
    return;
  }

  if(jplopsoft_cmdExecutionContext()&&jplopsoft_cmdExecutionContext().process){
    jplopsoft_SetEnvironmentVariable(jplopsoft_cmdExecutionContext().process,name,value);
    state.cmdEnv=jplopsoft_cmdExecutionContext().process.peb.processParameters.environment;
  }else{
    state.cmdEnv[name]=value;
  }
  jplopsoft_cmdSyncPeb(jplopsoft_cmdExecutionContext());
  jplopsoft_cmdWrite(name+'='+value,'success');
}

function jplopsoft_cmdTreeResolveFolder(path){
  var raw=jplopsoft_cmdUnquote(path),id;

  if(!raw)return state.currentFolder;

  id=jplopsoft_cmdResolveFolder(raw);

  if(id===-2){
    jplopsoft_cmdVirtualAccessDenied(state.cmdLastPathDenied||raw);
    return -1;
  }

  if(id<0){
    jplopsoft_cmdWrite('The system cannot find the path specified.','error');
    return -1;
  }

  return id;
}
function jplopsoft_cmdTree(argLine){
  var args=jplopsoft_cmdSplitArgs(argLine||''),
      path='',
      ascii=false,
      i,a,
      rootId,
      totalFiles=0,
      totalDirs=0,
      visited=0,
      jplopsoft_MAX_TREE_ITEMS=10000;

  for(i=0;i<args.length;i++){
    a=args[i];

    if(/^\/f$/i.test(a)){
      /* EXES TREE always includes files by user design. */
      continue;
    }

    if(/^\/a$/i.test(a)){
      ascii=true;
      continue;
    }

    if(path!==''){
      jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
      jplopsoft_cmdWrite('Usage: TREE [path] [/F] [/A]');
      return;
    }

    path=a;
  }

  rootId=jplopsoft_cmdTreeResolveFolder(path);
  if(rootId<0)return;

  jplopsoft_cmdWrite('Folder PATH listing for volume EXES');
  jplopsoft_cmdWrite(jplopsoft_cmdPathText(rootId));
  jplopsoft_cmdWrite('');

  function jplopsoft_children(folderId){
    var out=[],
        virtuals=jplopsoft_cmdDirVirtualNames(folderId),
        list=jplopsoft_sortTreeNodes(jplopsoft_childrenOf(folderId)),
        j,n,name;

    for(j=0;j<virtuals.length;j++){
      out.push({
        virtual:true,
        type:'folder',
        name:virtuals[j],
        id:0
      });
    }

    for(j=0;j<list.length;j++){
      n=list[j];
      name=jplopsoft_decName(n);

      out.push({
        virtual:false,
        type:n.type,
        name:name===null?'[UNREADABLE#'+n.id+']':name,
        id:n.id,
        node:n
      });
    }

    out.sort(function(x,y){
      var xn=x.name.toLowerCase(),
          yn=y.name.toLowerCase();
      return xn<yn?-1:(xn>yn?1:0);
    });

    return out;
  }

  function jplopsoft_walk(folderId,prefix){
    var list=jplopsoft_children(folderId),j,item,last,branch,nextPrefix;

    for(j=0;j<list.length;j++){
      if(visited>=jplopsoft_MAX_TREE_ITEMS){
        throw new Error('TREE_LIMIT');
      }

      visited++;
      item=list[j];
      last=(j===list.length-1);

      if(ascii){
        branch=last?'\\---':'+---';
        nextPrefix=prefix+(last?'    ':'|   ');
      }else{
        branch=last?'└── ':'├── ';
        nextPrefix=prefix+(last?'    ':'│   ');
      }

      jplopsoft_cmdWrite(
        prefix+branch+
        (item.type==='folder'?'['+item.name+']':item.name)
      );

      if(item.type==='folder'){
        totalDirs++;

        /*
         * Root virtual system folders are presentation-only protected
         * objects and intentionally have no children to traverse.
         */
        if(!item.virtual){
          jplopsoft_walk(item.id,nextPrefix);
        }
      }else{
        totalFiles++;
      }
    }
  }

  try{
    jplopsoft_walk(rootId,'');
  }catch(e){
    if(e&&e.message==='TREE_LIMIT'){
      jplopsoft_cmdWrite('');
      jplopsoft_cmdWrite(
        'TREE stopped after '+jplopsoft_MAX_TREE_ITEMS+
        ' entries to protect the browser.',
        'error'
      );
    }else{
      jplopsoft_cmdWrite('TREE failed.','error');
    }
  }

  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite(totalDirs+' directorie(s), '+totalFiles+' file(s).','info');
}
function jplopsoft_cmdClipboard(argLine){
  var value=jplopsoft_cmdUnquote(argLine),
      ta,
      copied=false,
      p;

  if(value===''){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: CLIP text');
    return;
  }

  function jplopsoft_ok(){
    jplopsoft_cmdWrite('Text copied to clipboard.','success');
  }

  function jplopsoft_fallback(){
    try{
      ta=document.createElement('textarea');
      ta.value=value;
      ta.setAttribute('readonly','readonly');
      ta.style.position='fixed';
      ta.style.left='-9999px';
      ta.style.top='-9999px';
      document.body.appendChild(ta);
      ta.select();
      copied=!!document.execCommand('copy');
      document.body.removeChild(ta);
      ta=null;

      if(copied){
        jplopsoft_ok();
        return;
      }
    }catch(e){
      try{
        if(ta&&ta.parentNode)ta.parentNode.removeChild(ta);
      }catch(ignore){}
    }

    jplopsoft_cmdWrite(
      'Clipboard access was denied by the browser.',
      'error'
    );
  }

  try{
    if(
      navigator.clipboard&&
      typeof navigator.clipboard.writeText==='function'
    ){
      p=navigator.clipboard.writeText(value);

      if(p&&typeof p.then==='function'){
        p.then(jplopsoft_ok,function(){jplopsoft_fallback();});
        return;
      }
    }
  }catch(e2){}

  jplopsoft_fallback();
}
function jplopsoft_cmdWhoAmI(argLine){
  if(jplopsoft_trim(String(argLine||''))){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: WHOAMI');
    return;
  }

  jplopsoft_cmdWrite('exes online  user','success');
}
function jplopsoft_cmdExVault(argLine){
  var value=jplopsoft_cmdUnquote(argLine),
      result,
      decryptMode=false;

  if(value===''){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: EX text-or-X60');
    jplopsoft_cmdWrite('Example: EX 123');
    jplopsoft_cmdWrite('Example: EX X60...');
    return;
  }

  /*
   * CMD is intended for short interactive values, not whole files.
   * Keeping a ceiling also prevents a pasted ciphertext from flooding
   * the terminal DOM with an unbounded amount of text.
   */
  if(value.length>262144){
    jplopsoft_cmdWrite(
      'EX input is limited to 262144 characters.',
      'error'
    );
    return;
  }

  if(!jplopsoft_exesReady()){
    jplopsoft_cmdWrite('exes.js is unavailable.','error');
    return;
  }

  if(!state.vaultKey||!jplopsoft_validVaultKey(state.vaultKey)){
    jplopsoft_cmdWrite(
      'EX failed: 4096-bit Vault Key is not available in memory.',
      'error'
    );
    return;
  }

  decryptMode=value.substr(0,3)==='X60';

  try{
    if(decryptMode){
      result=jplopsoft_decRaw(value,state.vaultKey);

      /*
       * For the interactive EX command an empty result is treated as
       * authentication/decryption failure. EX itself does not accept an
       * empty plaintext for encryption, so there is no ambiguity here.
       */
      if(result===''){
        throw new Error(
          'X60 decrypt/authentication failed.'
        );
      }

      jplopsoft_cmdWrite(String(result),'success');
      return;
    }

    result=jplopsoft_encRaw(value,state.vaultKey);

    if(!result||result.substr(0,3)!=='X60'){
      throw new Error('EXES encryption failed.');
    }

    jplopsoft_cmdWrite(String(result),'success');
  }catch(e){
    jplopsoft_cmdWrite(
      'EX '+(decryptMode?'decrypt':'encrypt')+
      ' failed: '+e.message,
      'error'
    );
  }
}

function jplopsoft_cmdExMd3(argLine){
  var value=jplopsoft_cmdUnquote(argLine),out;

  if(value===''){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: EX_MD3 text');
    return;
  }

  if(value.length>65536){
    jplopsoft_cmdWrite(
      'EX_MD3 input is limited to 65536 characters.',
      'error'
    );
    return;
  }

  if(
    typeof window.ex_md3!=='function'&&
    typeof ex_md3!=='function'
  ){
    jplopsoft_cmdWrite('ex_md3.js is unavailable.','error');
    return;
  }

  try{
    out=typeof window.ex_md3==='function'
      ?window.ex_md3(value)
      :ex_md3(value);

    jplopsoft_cmdWrite(String(out),'success');
  }catch(e){
    jplopsoft_cmdWrite('EX_MD3 failed: '+e.message,'error');
  }
}
function jplopsoft_cmdPauseKeyHandler(e){
  var row=jplopsoft_cmdEl('inputRow');

  if(!state.cmdPaused)return;

  e=e||window.event;

  if(e.preventDefault)e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
  e.cancelBubble=true;

  document.removeEventListener(
    'keydown',
    jplopsoft_cmdPauseKeyHandler,
    true
  );

  state.cmdPaused=false;

  if(row)row.className='jplopsoft_cmd-input-row';

  jplopsoft_cmdSetBusy(false);
  jplopsoft_cmdRefreshPrompt();
  jplopsoft_cmdScrollBottom();
  jplopsoft_cmdScheduleVisualCursor();

  return false;
}
function jplopsoft_cmdCancelPause(){
  var row=jplopsoft_cmdEl('inputRow');

  document.removeEventListener(
    'keydown',
    jplopsoft_cmdPauseKeyHandler,
    true
  );

  state.cmdPaused=false;

  if(row)row.className='jplopsoft_cmd-input-row';
}
function jplopsoft_cmdPause(argLine){
  var row=jplopsoft_cmdEl('inputRow');

  if(jplopsoft_trim(String(argLine||''))){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: PAUSE');
    return;
  }

  if(state.cmdPaused)return;

  state.cmdPaused=true;
  jplopsoft_cmdSetBusy(true);

  if(row)row.className='jplopsoft_cmd-input-row jplopsoft_hidden';
  jplopsoft_cmdHideVisualCursor();

  jplopsoft_cmdWrite('Press any key to continue . . .','info');

  document.addEventListener(
    'keydown',
    jplopsoft_cmdPauseKeyHandler,
    true
  );

  try{jplopsoft_cmdEl('screen').focus();}catch(e){}
}
function jplopsoft_cmdColorTable(){
  return {
    '0':'#000000',
    '1':'#000080',
    '2':'#008000',
    '3':'#008080',
    '4':'#800000',
    '5':'#800080',
    '6':'#808000',
    '7':'#c0c0c0',
    '8':'#808080',
    '9':'#0000ff',
    'A':'#00ff00',
    'B':'#00ffff',
    'C':'#ff0000',
    'D':'#ff00ff',
    'E':'#ffff00',
    'F':'#ffffff'
  };
}
function jplopsoft_cmdApplyColor(){
  var code=String(state.cmdColor||'07').toUpperCase(),
      map=jplopsoft_cmdColorTable(),
      bg=map[code.charAt(0)]||map['0'],
      fg=map[code.charAt(1)]||map['7'],
      screen=jplopsoft_cmdEl('screen'),
      prompt=jplopsoft_cmdEl('prompt'),
      input=jplopsoft_cmdEl('input');

  if(screen){
    screen.style.backgroundColor=bg;
    screen.style.color=fg;
  }

  if(prompt){
    prompt.style.color=fg;
  }

  if(input){
    try{
      input.style.setProperty('color',fg,'important');

      if(!jplopsoft_cmdUsesNativeCaret()){
        input.style.setProperty(
          'caret-color',
          'transparent',
          'important'
        );
      }
    }catch(e){
      input.style.color=fg;

      if(!jplopsoft_cmdUsesNativeCaret()){
        input.style.caretColor='transparent';
      }
    }
  }

  if(jplopsoft_cmdEl('blockCursor')){
    jplopsoft_cmdEl('blockCursor').style.backgroundColor=fg;
  }

  jplopsoft_cmdScheduleVisualCursor();
}
function jplopsoft_cmdColor(argLine){
  var code=jplopsoft_trim(String(argLine||'')).toUpperCase(),
      map=jplopsoft_cmdColorTable();

  if(code===''){
    state.cmdColor='07';
    jplopsoft_cmdApplyColor();
    return;
  }

  if(!/^[0-9A-F]{2}$/.test(code)){
    jplopsoft_cmdWrite(
      'The syntax of the command is incorrect. Usage: COLOR [0-F][0-F]',
      'error'
    );
    return;
  }

  if(code.charAt(0)===code.charAt(1)){
    jplopsoft_cmdWrite(
      'Foreground and background colors cannot be the same.',
      'error'
    );
    return;
  }

  if(!map[code.charAt(0)]||!map[code.charAt(1)]){
    jplopsoft_cmdWrite('Invalid COLOR attribute.','error');
    return;
  }

  state.cmdColor=code;
  jplopsoft_cmdApplyColor();
}

function jplopsoft_cmdShowVolume(argLine){
  var arg=jplopsoft_trim(String(argLine||'')),
      files=0,
      dirs=0,
      knownBytes=0,
      unknownSizes=0,
      i,n,size;

  if(arg&&arg.toLowerCase()!=='c:'&&arg.toLowerCase()!=='c'){
    jplopsoft_cmdWrite('Access is denied.','error');
    jplopsoft_cmdWrite(
      '權限不足：ExFS CMD 只提供虛擬磁碟機 C:。',
      'error'
    );
    return;
  }

  for(i=0;i<state.nodes.length;i++){
    n=state.nodes[i];
    if(!n)continue;

    if(n.type==='folder'){
      dirs++;
      continue;
    }

    if(n.type==='file'){
      files++;
      size=parseInt(n.original_size,10)||0;

      if(size>0){
        knownBytes+=size;
      }else{
        unknownSizes++;
      }
    }
  }

  jplopsoft_cmdWrite(' Volume in drive C is EXES');
  jplopsoft_cmdWrite(' Virtual drive     : C:');
  jplopsoft_cmdWrite(' System            : ExOS 6.3');
  jplopsoft_cmdWrite(' File system       : ExFS / EXFS_SPLIT7');
  jplopsoft_cmdWrite(' Encryption        : ExES V6 / X60');
  jplopsoft_cmdWrite(' Hash / KDF        : ex_md3 / ex_md3n');
  jplopsoft_cmdWrite(' Encryption        : EXES V6 / Browser-side Vault Key');
  jplopsoft_cmdWrite(' Storage backend   : _MFT/_MFTMirr + _Storage/*.x6f');
  jplopsoft_cmdWrite(' System metadata   : _MFT.x6f / _MFTMirr.x6f / _LogFile.x6f');
  jplopsoft_cmdWrite(' Volume/Security   : _Volume.x6f / _Boot.x6f / _Secure.x6f');
  jplopsoft_cmdWrite(' Security model    : EXOS_NT_ACL_V1 / security_id -> Security Descriptor');
  jplopsoft_cmdWrite(' Default identity  : administrator (RID 500) / ADMINISTRATORS');
  jplopsoft_cmdWrite(' Folders           : '+dirs);
  jplopsoft_cmdWrite(' Files             : '+files);
  jplopsoft_cmdWrite(' Recorded file size: '+jplopsoft_cmdBytesText(knownBytes)+' bytes');

  if(unknownSizes){
    jplopsoft_cmdWrite(
      ' Unknown-size files: '+unknownSizes+
      ' (legacy/empty-size metadata may be unavailable)'
    );
  }

  jplopsoft_cmdWrite(
    ' Host disk information is not exposed to the EXES sandbox.',
    'info'
  );
}


function jplopsoft_threeSafeDisposeObject(root){
  if(!root||!root.traverse)return;
  root.traverse(function(obj){
    var mats,i;
    try{
      if(obj.geometry&&obj.geometry.dispose)obj.geometry.dispose();
    }catch(ignoreGeometry){}
    mats=obj.material;
    if(!mats)return;
    if(!(mats instanceof Array))mats=[mats];
    for(i=0;i<mats.length;i++){
      try{
        if(mats[i].map&&mats[i].map.dispose)mats[i].map.dispose();
        if(mats[i].dispose)mats[i].dispose();
      }catch(ignoreMaterial){}
    }
  });
}
function jplopsoft_threeFxBodyMode(mode){
  var b=document.body,cls;
  if(!b)return;
  cls=String(b.className||'')
    .replace(/\bjplopsoft_three-locked\b/g,'')
    .replace(/\bjplopsoft_three-unlocked\b/g,'')
    .replace(/\bjplopsoft_three-cmd\b/g,'');
  cls=jplopsoft_trim(cls);
  if(mode==='locked')cls+=' jplopsoft_three-locked';
  else if(mode==='cmd')cls+=' jplopsoft_three-cmd';
  else cls+=' jplopsoft_three-unlocked';
  b.className=jplopsoft_trim(cls);
}
function jplopsoft_threeAddBar(group,material,w,h,d,x,y,rotZ){
  var geo=new window.THREE.BoxGeometry(w,h,d),
      mesh=new window.THREE.Mesh(geo,material);
  mesh.position.set(x,y,0);
  mesh.rotation.z=rotZ||0;
  group.add(mesh);
  return mesh;
}
function jplopsoft_threeCreateExfsLogo(){
  var jplopsoft_T=window.THREE,
      group=new jplopsoft_T.Group(),
      material=new jplopsoft_T.MeshStandardMaterial({
        color:0x60a5fa,
        emissive:0x0b2447,
        metalness:.55,
        roughness:.28
      }),
      xE=-4.7,xX=-1.6,xF=1.6,xS=4.7,
      stroke=.34,depth=.72;

  jplopsoft_threeAddBar(group,material,stroke,4.2,depth,xE-.82,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xE,1.93,0);
  jplopsoft_threeAddBar(group,material,1.7,stroke,depth,xE-.1,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xE,-1.93,0);

  jplopsoft_threeAddBar(group,material,stroke,4.45,depth,xX,0,.58);
  jplopsoft_threeAddBar(group,material,stroke,4.45,depth,xX,0,-.58);

  jplopsoft_threeAddBar(group,material,stroke,4.2,depth,xF-.82,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xF,1.93,0);
  jplopsoft_threeAddBar(group,material,1.7,stroke,depth,xF-.1,0,0);

  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xS,1.93,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xS,0,0);
  jplopsoft_threeAddBar(group,material,1.95,stroke,depth,xS,-1.93,0);
  jplopsoft_threeAddBar(group,material,stroke,1.75,depth,xS-.82,1,0);
  jplopsoft_threeAddBar(group,material,stroke,1.75,depth,xS+.82,-1,0);

  group.scale.set(.72,.72,.72);
  return group;
}
function jplopsoft_threeAmbientSetMode(mode){
  var a=exfsAmbient3D,pColor;

  a.mode=mode||'ui';
  jplopsoft_threeFxBodyMode(
    a.mode==='locked'?'locked':
    (a.mode==='cmd'?'cmd':'ui')
  );

  if(!a.ready)return;

  if(a.logo){
    a.logo.visible=(a.mode==='locked'||a.mode==='unlock');
  }

  if(a.grid){
    a.grid.visible=(a.mode==='ui'||a.mode==='cmd');
  }

  if(a.particles&&a.particles.material){
    if(a.mode==='locked'||a.mode==='unlock'){
      a.particles.material.opacity=.62;
      pColor=0x60a5fa;
    }else if(a.mode==='cmd'){
      a.particles.material.opacity=.28;
      pColor=0x39ff88;
    }else{
      a.particles.material.opacity=.22;
      pColor=0x60a5fa;
    }
    try{a.particles.material.color.setHex(pColor);}catch(ignoreColor){}
  }
}
function jplopsoft_threeAmbientResize(){
  var a=exfsAmbient3D,w=window.innerWidth||1,h=window.innerHeight||1;
  if(!a.ready||!a.renderer||!a.camera)return;
  a.camera.aspect=w/h;
  a.camera.updateProjectionMatrix();
  a.renderer.setSize(w,h,false);
}
function jplopsoft_threeAmbientAnimate(){
  var a=exfsAmbient3D,now=(new Date()).getTime(),burst,s;

  if(!a.ready)return;
  a.raf=window.requestAnimationFrame(jplopsoft_threeAmbientAnimate);

  if(a.paused||!state.threeFxEnabled)return;

  if(a.logo&&a.logo.visible){
    a.logo.rotation.y+=.004;
    a.logo.rotation.x=Math.sin(now*.00045)*.055;
    burst=now<a.burstUntil;
    if(burst){
      s=.72+Math.sin((a.burstUntil-now)*.024)*.08;
      a.logo.scale.set(s,s,s);
    }else{
      a.logo.scale.set(.72,.72,.72);
    }
  }

  if(a.particles){
    a.particles.rotation.y+=a.mode==='locked'?.00065:.00022;
    a.particles.rotation.x=Math.sin(now*.00008)*.08;
  }

  if(a.grid){
    a.grid.position.z=Math.sin(now*.00025)*.12;
  }

  a.camera.position.x+=(a.mouseX-a.camera.position.x)*.025;
  a.camera.position.y+=(a.mouseY-a.camera.position.y)*.025;
  a.camera.lookAt(0,0,0);

  try{a.renderer.render(a.scene,a.camera);}catch(ignoreRender){}
}
function jplopsoft_threeAmbientInit(){
  var jplopsoft_T=window.THREE,canvas=jplopsoft_el('jplopsoft_threeAmbientCanvas'),
      renderer,scene,camera,pointsGeo,positions,i,
      pointsMat,particles,grid,logo,keyLight,fillLight;

  if(exfsAmbient3D.ready||!jplopsoft_T||!canvas)return;

  try{
    renderer=new jplopsoft_T.WebGLRenderer({
      canvas:canvas,
      antialias:true,
      alpha:true,
      powerPreference:'low-power'
    });
  }catch(e){
    exfsAmbient3D.loading=false;
    try{console.warn('ExOS Three ambient unavailable:',e);}catch(ignore){}
    return;
  }

  try{
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.setClearColor(0x000000,0);

    scene=new jplopsoft_T.Scene();
    camera=new jplopsoft_T.PerspectiveCamera(
      46,
      (window.innerWidth||1)/(window.innerHeight||1),
      .1,
      150
    );
    camera.position.set(0,0,17);

    scene.add(new jplopsoft_T.AmbientLight(0xbcdcff,1.4));
    keyLight=new jplopsoft_T.DirectionalLight(0x7dd3fc,2.1);
    keyLight.position.set(5,8,8);
    scene.add(keyLight);
    fillLight=new jplopsoft_T.DirectionalLight(0x818cf8,1.1);
    fillLight.position.set(-7,-2,5);
    scene.add(fillLight);

    logo=jplopsoft_threeCreateExfsLogo();
    logo.position.set(0,.5,0);
    scene.add(logo);

    pointsGeo=new jplopsoft_T.BufferGeometry();
    positions=new Float32Array(1200*3);
    for(i=0;i<1200;i++){
      positions[i*3]=(Math.random()-.5)*58;
      positions[i*3+1]=(Math.random()-.5)*34;
      positions[i*3+2]=(Math.random()-.5)*26;
    }
    pointsGeo.setAttribute(
      'position',
      new jplopsoft_T.BufferAttribute(positions,3)
    );
    pointsMat=new jplopsoft_T.PointsMaterial({
      color:0x60a5fa,
      size:.065,
      transparent:true,
      opacity:.55,
      depthWrite:false
    });
    particles=new jplopsoft_T.Points(pointsGeo,pointsMat);
    scene.add(particles);

    grid=new jplopsoft_T.GridHelper(56,36,0x2563eb,0x1e3a5f);
    grid.rotation.x=Math.PI/2;
    grid.position.set(0,-4,-7);
    if(grid.material){
      if(grid.material instanceof Array){
        for(i=0;i<grid.material.length;i++){
          grid.material[i].transparent=true;
          grid.material[i].opacity=.12;
        }
      }else{
        grid.material.transparent=true;
        grid.material.opacity=.12;
      }
    }
    scene.add(grid);

    exfsAmbient3D.renderer=renderer;
    exfsAmbient3D.scene=scene;
    exfsAmbient3D.camera=camera;
    exfsAmbient3D.logo=logo;
    exfsAmbient3D.particles=particles;
    exfsAmbient3D.grid=grid;
    exfsAmbient3D.ready=true;
    exfsAmbient3D.loading=false;

    exfsAmbient3D.onResize=function(){jplopsoft_threeAmbientResize();};
    exfsAmbient3D.onMouseMove=function(ev){
      var w=window.innerWidth||1,h=window.innerHeight||1;
      exfsAmbient3D.mouseX=((ev.clientX||0)/w-.5)*1.35;
      exfsAmbient3D.mouseY=-((ev.clientY||0)/h-.5)*.8;
    };

    if(window.addEventListener){
      window.addEventListener('resize',exfsAmbient3D.onResize,false);
      document.addEventListener('mousemove',exfsAmbient3D.onMouseMove,false);
    }

    jplopsoft_threeAmbientResize();
    jplopsoft_threeAmbientSetMode(
      state.vaultKey?(state.cmdMode?'cmd':'ui'):'locked'
    );

    if(
      (' '+document.body.className+' ').indexOf(' jplopsoft_three-fx-ready ')<0
    ){
      document.body.className=
        jplopsoft_trim((document.body.className||'')+' jplopsoft_three-fx-ready');
    }

    jplopsoft_threeAmbientAnimate();
  }catch(e2){
    try{renderer.dispose();}catch(ignoreDispose){}
    exfsAmbient3D.ready=false;
    exfsAmbient3D.loading=false;
    try{console.warn('ExOS Three ambient init failed:',e2);}catch(ignore2){}
  }
}
function jplopsoft_scheduleThreeAmbient(){
  if(!jplopsoft_threeFeatureAllowed()||exfsAmbient3D.ready||exfsAmbient3D.loading||!state.threeFxEnabled){
    return;
  }

  try{
    if(
      window.matchMedia&&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ){
      return;
    }
  }catch(ignoreMotion){}

  exfsAmbient3D.loading=true;

  jplopsoft_cmdSetTimeout(function(){
    jplopsoft_loadOptionalMirroredScript('three',function(err){
      if(err){
        exfsAmbient3D.loading=false;
        try{console.warn('ExOS Three ambient load failed:',err);}catch(ignore){}
        return;
      }
      jplopsoft_threeAmbientInit();
    });
  },420);
}
function jplopsoft_threeAmbientUnlockBurst(){
  jplopsoft_threeAmbientSetMode('unlock');

  if(!state.threeFxEnabled)return;

  if(!exfsAmbient3D.ready){
    jplopsoft_scheduleThreeAmbient();
    jplopsoft_cmdSetTimeout(function(){
      if(state.vaultKey){
        jplopsoft_threeAmbientSetMode(state.cmdMode?'cmd':'ui');
      }
    },950);
    return;
  }

  exfsAmbient3D.burstUntil=(new Date()).getTime()+950;

  jplopsoft_cmdSetTimeout(function(){
    if(state.vaultKey){
      jplopsoft_threeAmbientSetMode(state.cmdMode?'cmd':'ui');
    }
  },950);
}
function jplopsoft_threeVolumeNodeColor(kind,format){
  if(kind==='system')return 0x60a5fa;
  if(kind==='folder')return 0x22d3ee;
  if(format==='image')return 0xf472b6;
  if(format==='binary')return 0xf59e0b;
  return 0xa78bfa;
}
function jplopsoft_threeVolumeLabel(text,color){
  var jplopsoft_T=window.THREE,
      c=document.createElement('canvas'),
      ctx=c.getContext('2d'),
      tex,mat,sprite;

  c.width=512;
  c.height=128;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle='rgba(2,6,23,.76)';
  ctx.fillRect(4,20,504,88);
  ctx.strokeStyle=color||'#93c5fd';
  ctx.lineWidth=3;
  ctx.strokeRect(4,20,504,88);
  ctx.fillStyle='#f8fbff';
  ctx.font='bold 32px Segoe UI, Microsoft JhengHei, sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(String(text||''),256,64);

  tex=new jplopsoft_T.CanvasTexture(c);
  tex.needsUpdate=true;
  mat=new jplopsoft_T.SpriteMaterial({
    map:tex,
    transparent:true,
    depthWrite:false
  });
  sprite=new jplopsoft_T.Sprite(mat);
  sprite.scale.set(4.2,1.05,1);
  return sprite;
}
function jplopsoft_threeVolumeAddLine(root,a,b,color,opacity){
  var jplopsoft_T=window.THREE,
      g=new jplopsoft_T.BufferGeometry().setFromPoints([a,b]),
      m=new jplopsoft_T.LineBasicMaterial({
        color:color||0x335f91,
        transparent:true,
        opacity:typeof opacity==='number'?opacity:.35
      }),
      line=new jplopsoft_T.Line(g,m);
  root.add(line);
  return line;
}
function jplopsoft_threeVolumeSystemNode(root,name,pos,description,pickables){
  var jplopsoft_T=window.THREE,
      geo=new jplopsoft_T.IcosahedronGeometry(1.05,1),
      mat=new jplopsoft_T.MeshStandardMaterial({
        color:jplopsoft_threeVolumeNodeColor('system'),
        emissive:0x071d3b,
        metalness:.4,
        roughness:.32
      }),
      mesh=new jplopsoft_T.Mesh(geo,mat),
      label=jplopsoft_threeVolumeLabel(name,'#60a5fa');

  mesh.position.copy(pos);
  mesh.userData={
    kind:'system',
    title:name,
    html:'<b>'+jplopsoft_htmlEscape(name)+'</b><br>'+jplopsoft_htmlEscape(description)
  };
  root.add(mesh);

  label.position.copy(pos);
  label.position.y+=1.55;
  root.add(label);

  pickables.push(mesh);
  return mesh;
}
function jplopsoft_threeVolumeFileFormat(node,name){
  if(node.type==='folder')return 'folder';
  return jplopsoft_fileFormatFromName(name||'');
}
function jplopsoft_threeVolumeResetView(){
  var v=exfsVolume3D;
  if(!v.camera||!v.root)return;

  if((v.topology||'physical')==='sandbox'){
    v.camera.position.set(8,4.5,34);
    v.camera.lookAt(7,0,0);
    v.root.rotation.set(-.04,-.10,0);
  }else{
    v.camera.position.set(4,5,39);
    v.camera.lookAt(5,0,0);
    v.root.rotation.set(-.04,-.08,0);
  }
}
function jplopsoft_threeVolumeResize(){
  var v=exfsVolume3D,stage=jplopsoft_el('jplopsoft_volume3dStage'),w,h;
  if(!v.renderer||!v.camera||!stage)return;
  w=Math.max(1,stage.clientWidth);
  h=Math.max(1,stage.clientHeight);
  v.camera.aspect=w/h;
  v.camera.updateProjectionMatrix();
  v.renderer.setSize(w,h,false);
}
function jplopsoft_threeVolumeTooltipHide(){
  var tip=jplopsoft_el('jplopsoft_volume3dTooltip');
  if(tip)tip.style.display='none';
}
function jplopsoft_threeVolumeHover(ev){
  var v=exfsVolume3D,canvas=jplopsoft_el('jplopsoft_volume3dCanvas'),
      rect,obj,tip,left,top;

  if(!v.renderer||!v.raycaster||!canvas||v.dragging)return;

  rect=canvas.getBoundingClientRect();
  obj=jplopsoft_threeVolumePickObject(ev);

  if(v.hovered&&v.hovered.scale){
    v.hovered.scale.set(1,1,1);
  }
  v.hovered=null;
  tip=jplopsoft_el('jplopsoft_volume3dTooltip');

  if(!obj){
    jplopsoft_threeVolumeTooltipHide();
    return;
  }

  v.hovered=obj;
  if(obj.scale)obj.scale.set(1.18,1.18,1.18);

  if(tip){
    tip.innerHTML=obj.userData&&obj.userData.html
      ?obj.userData.html
      :'';
    left=Math.max(
      8,
      Math.min(
        Math.max(8,rect.width-345),
        ev.clientX-rect.left+14
      )
    );
    top=Math.max(
      8,
      Math.min(
        Math.max(8,rect.height-125),
        ev.clientY-rect.top+14
      )
    );
    tip.style.left=left+'px';
    tip.style.top=top+'px';
    tip.style.display='block';
  }
}

function jplopsoft_threeVolumeFullscreenElement(){
  return document.fullscreenElement||
    document.webkitFullscreenElement||
    document.webkitCurrentFullScreenElement||
    document.msFullscreenElement||
    null;
}
function jplopsoft_threeVolumeSetFullscreenClass(on,pseudo){
  var b=jplopsoft_el('jplopsoft_volume3dBackdrop'),cls;

  if(!b)return;

  cls=String(b.className||'')
    .replace(/\bjplopsoft_volume3d-fullscreen\b/g,'')
    .replace(/\bjplopsoft_volume3d-pseudo-fullscreen\b/g,'');

  if(on){
    cls+=' jplopsoft_volume3d-fullscreen';
    if(pseudo)cls+=' jplopsoft_volume3d-pseudo-fullscreen';
  }

  b.className=jplopsoft_trim(cls);
}
function jplopsoft_threeVolumeUnbindFullscreenEvents(){
  var v=exfsVolume3D,h=v.fullscreenKeyHandler,c=v.fullscreenChangeHandler;

  if(h){
    if(document.removeEventListener){
      document.removeEventListener('keydown',h,true);
    }else if(document.detachEvent){
      document.detachEvent('onkeydown',h);
    }
  }

  if(c){
    if(document.removeEventListener){
      document.removeEventListener('fullscreenchange',c,false);
      document.removeEventListener('webkitfullscreenchange',c,false);
      document.removeEventListener('MSFullscreenChange',c,false);
    }else if(document.detachEvent){
      document.detachEvent('onfullscreenchange',c);
    }
  }

  v.fullscreenKeyHandler=null;
  v.fullscreenChangeHandler=null;
}
function jplopsoft_threeVolumeUpdateFullscreenButton(){
  var btn=jplopsoft_el('jplopsoft_volume3dFullscreenBtn'),
      active=!!jplopsoft_threeVolumeFullscreenElement()||!!exfsVolume3D.pseudoFullscreen;

  if(!btn)return;

  btn.textContent=active?'↙ 返回原大小':'⛶ 全螢幕';
  btn.title=active
    ?'按任意鍵即可返回原大小'
    :'進入全螢幕；全螢幕中按任意鍵返回';
}
function jplopsoft_threeVolumeFinishFullscreenExit(){
  exfsVolume3D.pseudoFullscreen=false;
  jplopsoft_threeVolumeSetFullscreenClass(false,false);
  jplopsoft_threeVolumeUnbindFullscreenEvents();
  jplopsoft_threeVolumeUpdateFullscreenButton();

  jplopsoft_cmdSetTimeout(function(){
    jplopsoft_threeVolumeResize();
  },0);
}
function jplopsoft_threeVolumeBindFullscreenEvents(){
  var v=exfsVolume3D;

  jplopsoft_threeVolumeUnbindFullscreenEvents();

  v.fullscreenKeyHandler=function(ev){
    ev=ev||window.event;

    if(
      !jplopsoft_threeVolumeFullscreenElement()&&
      !exfsVolume3D.pseudoFullscreen
    ){
      return;
    }

    if(ev.preventDefault)ev.preventDefault();
    if(ev.stopPropagation)ev.stopPropagation();
    ev.cancelBubble=true;

    jplopsoft_threeVolumeExitFullscreen();
    return false;
  };

  v.fullscreenChangeHandler=function(){
    if(
      !jplopsoft_threeVolumeFullscreenElement()&&
      !exfsVolume3D.pseudoFullscreen
    ){
      jplopsoft_threeVolumeFinishFullscreenExit();
    }else{
      jplopsoft_threeVolumeSetFullscreenClass(true,exfsVolume3D.pseudoFullscreen);
      jplopsoft_threeVolumeUpdateFullscreenButton();
      jplopsoft_cmdSetTimeout(function(){jplopsoft_threeVolumeResize();},0);
    }
  };

  if(document.addEventListener){
    document.addEventListener('keydown',v.fullscreenKeyHandler,true);
    document.addEventListener(
      'fullscreenchange',
      v.fullscreenChangeHandler,
      false
    );
    document.addEventListener(
      'webkitfullscreenchange',
      v.fullscreenChangeHandler,
      false
    );
    document.addEventListener(
      'MSFullscreenChange',
      v.fullscreenChangeHandler,
      false
    );
  }else if(document.attachEvent){
    document.attachEvent('onkeydown',v.fullscreenKeyHandler);
  }
}
function jplopsoft_threeVolumeEnterFullscreen(){
  var b=jplopsoft_el('jplopsoft_volume3dBackdrop'),
      request;

  if(!b)return;

  if(jplopsoft_threeVolumeFullscreenElement()||exfsVolume3D.pseudoFullscreen){
    return;
  }

  jplopsoft_threeVolumeBindFullscreenEvents();
  jplopsoft_threeVolumeSetFullscreenClass(true,false);

  request=
    b.requestFullscreen||
    b.webkitRequestFullscreen||
    b.webkitRequestFullScreen||
    b.msRequestFullscreen;

  if(request){
    try{
      var result=request.call(b);

      if(result&&typeof result.catch==='function'){
        result.catch(function(){
          exfsVolume3D.pseudoFullscreen=true;
          jplopsoft_threeVolumeSetFullscreenClass(true,true);
          jplopsoft_threeVolumeUpdateFullscreenButton();
          jplopsoft_cmdSetTimeout(function(){jplopsoft_threeVolumeResize();},0);
        });
      }
    }catch(e){
      exfsVolume3D.pseudoFullscreen=true;
      jplopsoft_threeVolumeSetFullscreenClass(true,true);
    }
  }else{
    exfsVolume3D.pseudoFullscreen=true;
    jplopsoft_threeVolumeSetFullscreenClass(true,true);
  }

  jplopsoft_threeVolumeUpdateFullscreenButton();
  jplopsoft_cmdSetTimeout(function(){jplopsoft_threeVolumeResize();},60);
}
function jplopsoft_threeVolumeExitFullscreen(){
  var exitFn;

  if(exfsVolume3D.pseudoFullscreen){
    jplopsoft_threeVolumeFinishFullscreenExit();
    return;
  }

  if(!jplopsoft_threeVolumeFullscreenElement()){
    jplopsoft_threeVolumeFinishFullscreenExit();
    return;
  }

  exitFn=
    document.exitFullscreen||
    document.webkitExitFullscreen||
    document.webkitCancelFullScreen||
    document.msExitFullscreen;

  if(exitFn){
    try{
      var result=exitFn.call(document);

      if(result&&typeof result.catch==='function'){
        result.catch(function(){
          jplopsoft_threeVolumeFinishFullscreenExit();
        });
      }
    }catch(e){
      jplopsoft_threeVolumeFinishFullscreenExit();
    }
  }else{
    jplopsoft_threeVolumeFinishFullscreenExit();
  }
}
function jplopsoft_threeVolumeToggleFullscreen(){
  if(jplopsoft_threeVolumeFullscreenElement()||exfsVolume3D.pseudoFullscreen){
    jplopsoft_threeVolumeExitFullscreen();
  }else{
    jplopsoft_threeVolumeEnterFullscreen();
  }
}
function jplopsoft_threeVolumePickObject(ev){
  var v=exfsVolume3D,canvas=jplopsoft_el('jplopsoft_volume3dCanvas'),
      rect,x,y,hits;

  if(!v.renderer||!v.raycaster||!v.camera||!canvas)return null;

  rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;

  x=((ev.clientX-rect.left)/rect.width)*2-1;
  y=-((ev.clientY-rect.top)/rect.height)*2+1;

  v.mouse.set(x,y);
  v.raycaster.setFromCamera(v.mouse,v.camera);
  hits=v.raycaster.intersectObjects(v.pickables,false);

  return hits.length?hits[0].object:null;
}
function jplopsoft_threeVolumeNavigateTarget(obj){
  var id,n,name;

  if(!obj||!obj.userData)return;

  id=parseInt(obj.userData.nodeId,10)||0;
  if(!id)return;

  n=jplopsoft_findNode(id);
  if(!n)return;

  name=jplopsoft_decName(n)||('#'+n.id);

  if(state.cmdMode){
    jplopsoft_setCmdMode(false);
  }

  jplopsoft_closeVolume3D();
  jplopsoft_clearFileSearch();
  jplopsoft_clearChecked();

  if(n.type==='folder'){
    state.currentFolder=n.id;
    state.selectedId=0;
    jplopsoft_renderAll();
    jplopsoft_setStatus('已由 3D Volume 進入資料夾「'+jplopsoft_htmlEscape(name)+'」。');
    return;
  }

  jplopsoft_locateSearchResult(n.id);
}
function jplopsoft_threeVolumeBindControls(){
  var v=exfsVolume3D,canvas=jplopsoft_el('jplopsoft_volume3dCanvas');

  if(!canvas)return;

  canvas.onmousedown=function(ev){
    v.dragging=true;
    v.lastX=ev.clientX;
    v.lastY=ev.clientY;
    canvas.className='jplopsoft_volume3d-canvas jplopsoft_dragging';
    if(ev.preventDefault)ev.preventDefault();
  };
  canvas.onmouseup=function(){
    v.dragging=false;
    canvas.className='jplopsoft_volume3d-canvas';
  };
  canvas.onmouseleave=function(){
    v.dragging=false;
    canvas.className='jplopsoft_volume3d-canvas';
    jplopsoft_threeVolumeTooltipHide();
  };
  canvas.onmousemove=function(ev){
    var dx,dy;
    if(v.dragging&&v.root){
      dx=ev.clientX-v.lastX;
      dy=ev.clientY-v.lastY;
      v.lastX=ev.clientX;
      v.lastY=ev.clientY;
      v.root.rotation.y+=dx*.007;
      v.root.rotation.x+=dy*.004;
      v.root.rotation.x=Math.max(-.75,Math.min(.75,v.root.rotation.x));
      jplopsoft_threeVolumeTooltipHide();
      return;
    }
    jplopsoft_threeVolumeHover(ev);
  };
  canvas.ondblclick=function(ev){
    var obj=jplopsoft_threeVolumePickObject(ev);

    if(ev.preventDefault)ev.preventDefault();
    if(ev.stopPropagation)ev.stopPropagation();
    ev.cancelBubble=true;

    if(
      obj&&
      obj.userData&&
      parseInt(obj.userData.nodeId,10)>0
    ){
      jplopsoft_threeVolumeNavigateTarget(obj);
    }

    return false;
  };
  canvas.onwheel=function(ev){
    if(v.camera){
      v.camera.position.z+=ev.deltaY>0?1.3:-1.3;
      v.camera.position.z=Math.max(10,Math.min(54,v.camera.position.z));
    }
    if(ev.preventDefault)ev.preventDefault();
    return false;
  };
  canvas.ontouchstart=function(ev){
    var t=ev.touches&&ev.touches[0];
    if(!t)return;
    v.dragging=true;
    v.lastX=t.clientX;
    v.lastY=t.clientY;
  };
  canvas.ontouchmove=function(ev){
    var t=ev.touches&&ev.touches[0],dx,dy;
    if(!t||!v.dragging||!v.root)return;
    dx=t.clientX-v.lastX;
    dy=t.clientY-v.lastY;
    v.lastX=t.clientX;
    v.lastY=t.clientY;
    v.root.rotation.y+=dx*.007;
    v.root.rotation.x+=dy*.004;
    if(ev.preventDefault)ev.preventDefault();
  };
  canvas.ontouchend=function(){v.dragging=false;};
}
function jplopsoft_threeVolumeAnimate(){
  var v=exfsVolume3D;
  if(!v.renderer||!v.scene||!v.camera)return;
  v.raf=window.requestAnimationFrame(jplopsoft_threeVolumeAnimate);
  if(v.root&&!v.dragging)v.root.rotation.y+=.0008;
  try{v.renderer.render(v.scene,v.camera);}catch(ignore){}
}
function jplopsoft_closeVolume3D(){
  var v=exfsVolume3D,canvas=jplopsoft_el('jplopsoft_volume3dCanvas');

  if(jplopsoft_threeVolumeFullscreenElement()||v.pseudoFullscreen){
    jplopsoft_threeVolumeExitFullscreen();
  }else{
    jplopsoft_threeVolumeUnbindFullscreenEvents();
    jplopsoft_threeVolumeSetFullscreenClass(false,false);
  }

  if(jplopsoft_el('jplopsoft_volume3dBackdrop'))jplopsoft_el('jplopsoft_volume3dBackdrop').style.display='none';
  if(jplopsoft_el('jplopsoft_volume3dWindow'))jplopsoft_wmClassRemove(jplopsoft_el('jplopsoft_volume3dWindow'),'jplopsoft_wm-active');

  if(v.raf){
    window.cancelAnimationFrame(v.raf);
    v.raf=0;
  }
  if(v.onResize&&window.removeEventListener){
    window.removeEventListener('resize',v.onResize,false);
  }
  if(v.hovered&&v.hovered.scale)v.hovered.scale.set(1,1,1);

  if(canvas){
    canvas.onmousedown=null;
    canvas.onmouseup=null;
    canvas.onmouseleave=null;
    canvas.onmousemove=null;
    canvas.ondblclick=null;
    canvas.onwheel=null;
    canvas.ontouchstart=null;
    canvas.ontouchmove=null;
    canvas.ontouchend=null;
  }

  jplopsoft_threeSafeDisposeObject(v.scene);
  if(v.renderer){
    try{v.renderer.dispose();}catch(ignoreDispose){}
  }

  var keepTopology=exfsVolume3D.topology||'physical';
  exfsVolume3D={
    renderer:null,scene:null,camera:null,root:null,raf:0,
    pickables:[],raycaster:null,mouse:null,hovered:null,
    dragging:false,lastX:0,lastY:0,onResize:null,
    pseudoFullscreen:false,fullscreenKeyHandler:null,
    fullscreenChangeHandler:null,
    topology:keepTopology
  };

  exfsAmbient3D.paused=false;
  if(jplopsoft_el('jplopsoft_threeAmbientCanvas'))jplopsoft_el('jplopsoft_threeAmbientCanvas').style.visibility='';
}


function jplopsoft_threeVolumeSetTopologyButtons(){
  var physicalBtn=jplopsoft_el('jplopsoft_volume3dPhysicalBtn'),
      sandboxBtn=jplopsoft_el('jplopsoft_volume3dSandboxBtn'),
      mode=exfsVolume3D.topology||'physical';

  if(physicalBtn){
    physicalBtn.className=
      'jplopsoft_btn jplopsoft_small'+(mode==='physical'?' jplopsoft_active':'');
  }
  if(sandboxBtn){
    sandboxBtn.className=
      'jplopsoft_btn jplopsoft_small'+(mode==='sandbox'?' jplopsoft_active':'');
  }
}
function jplopsoft_threeVolumeSetInfoPanels(){
  var legend=jplopsoft_el('jplopsoft_volume3dLegend'),
      hud=jplopsoft_el('jplopsoft_volume3dHud'),
      mode=exfsVolume3D.topology||'physical';

  if(mode==='sandbox'){
    if(legend){
      legend.innerHTML=
        '<div><span class="jplopsoft_volume3d-dot" style="background:#ffffff"></span>Sandbox Root</div>'+
        '<div><span class="jplopsoft_volume3d-dot" style="background:#22d3ee"></span>Logical Folder</div>'+
        '<div><span class="jplopsoft_volume3d-dot" style="background:#a78bfa"></span>Text / HTML</div>'+
        '<div><span class="jplopsoft_volume3d-dot" style="background:#f472b6"></span>Image</div>'+
        '<div><span class="jplopsoft_volume3d-dot" style="background:#f59e0b"></span>Binary</div>';
    }

    if(hud){
      hud.innerHTML=
        '拖曳：旋轉　｜　滾輪：縮放　｜　Hover：查看 metadata<br>'+
        'Sandbox Root → nodes.parent_id → logical folders / files<br>'+
        '雙擊資料夾：回 UI 並進入　｜　雙擊檔案：回 UI 並定位　｜　全螢幕任意鍵：返回原大小';
    }
    return;
  }

  if(legend){
    legend.innerHTML=
      '<div><span class="jplopsoft_volume3d-dot" style="background:#ffffff"></span>Root Dir</div>'+
      '<div><span class="jplopsoft_volume3d-dot" style="background:#60a5fa"></span>Root Metadata</div>'+
      '<div><span class="jplopsoft_volume3d-dot" style="background:#22d3ee"></span>_Storage / Date Directory</div>'+
      '<div><span class="jplopsoft_volume3d-dot" style="background:#a78bfa"></span>Encrypted .x6f</div>'+
      '<div><span class="jplopsoft_volume3d-dot" style="background:#f472b6"></span>_Metadata.x6f</div>';
  }

  if(hud){
    hud.innerHTML=
      '拖曳：旋轉　｜　滾輪：縮放　｜　Hover：查看 metadata<br>'+
      'Root Dir → Root Metadata / _Storage → YYYY / MM / DD → .x6f<br>'+
      '雙擊 .x6f / _Metadata.x6f：回 UI 並定位　｜　全螢幕任意鍵：返回原大小';
  }
}
function jplopsoft_threeVolumeSwitchTopology(mode){
  mode=mode==='sandbox'?'sandbox':'physical';

  if(exfsVolume3D.topology===mode&&exfsVolume3D.renderer){
    jplopsoft_threeVolumeSetTopologyButtons();
    jplopsoft_threeVolumeSetInfoPanels();
    return;
  }

  exfsVolume3D.topology=mode;
  jplopsoft_threeVolumeSetTopologyButtons();
  jplopsoft_threeVolumeSetInfoPanels();

  if(window.THREE&&jplopsoft_threeReady()){
    jplopsoft_buildVolume3D();
  }
}

function jplopsoft_threeVolumeTopologyNode(
  root,name,pos,kind,description,pickables,nodeId,extraHtml,scaleValue
){
  var jplopsoft_T=window.THREE,geo,mat,color,labelColor,
      mesh,label,s=scaleValue||1;

  if(kind==='root'){
    color=0xffffff;
    labelColor='#ffffff';
    geo=new jplopsoft_T.IcosahedronGeometry(1.22*s,2);
  }else if(kind==='metadata-root'){
    color=0x60a5fa;
    labelColor='#60a5fa';
    geo=new jplopsoft_T.OctahedronGeometry(.9*s,1);
  }else if(kind==='storage-root'){
    color=0x22d3ee;
    labelColor='#22d3ee';
    geo=new jplopsoft_T.OctahedronGeometry(.95*s,1);
  }else if(kind==='directory'){
    color=0x22d3ee;
    labelColor='#67e8f9';
    geo=new jplopsoft_T.OctahedronGeometry(.52*s,0);
  }else if(kind==='sidecar'){
    color=0xf472b6;
    labelColor='#f9a8d4';
    geo=new jplopsoft_T.TetrahedronGeometry(.38*s,0);
  }else if(kind==='data-file'){
    color=0xa78bfa;
    labelColor='#c4b5fd';
    geo=new jplopsoft_T.BoxGeometry(.58*s,.58*s,.58*s);
  }else{
    color=0x60a5fa;
    labelColor='#93c5fd';
    geo=new jplopsoft_T.IcosahedronGeometry(.62*s,1);
  }

  mat=new jplopsoft_T.MeshStandardMaterial({
    color:color,
    emissive:kind==='root'?0x1f2937:0x071d3b,
    metalness:kind==='data-file'?.25:.35,
    roughness:.34
  });

  mesh=new jplopsoft_T.Mesh(geo,mat);
  mesh.position.copy(pos);
  mesh.userData={
    kind:kind,
    nodeId:parseInt(nodeId,10)||0,
    title:name,
    html:
      '<b>'+jplopsoft_htmlEscape(name)+'</b><br>'+
      jplopsoft_htmlEscape(description||'')+
      (extraHtml?('<br>'+extraHtml):'')
  };
  root.add(mesh);

  label=jplopsoft_threeVolumeLabel(name,labelColor);
  label.position.copy(pos);
  label.position.y+=kind==='root'?1.75:1.05;
  label.scale.multiplyScalar(kind==='root'?1.08:.72);
  root.add(label);

  if(pickables)pickables.push(mesh);
  return mesh;
}
function jplopsoft_threeVolumeStorageParts(path){
  var p=String(path||'').replace(/\\/g,'/'),
      m=/^_Storage\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/([0-9]{8})\.x6f$/i.exec(p);

  if(!m)return null;

  return {
    year:m[1],
    month:m[2],
    day:m[3],
    number:m[4],
    path:
      '_Storage/'+m[1]+'/'+m[2]+'/'+m[3]+'/'+m[4]+'.x6f',
    metadataPath:
      '_Storage/'+m[1]+'/'+m[2]+'/'+m[3]+'/'+m[4]+'_Metadata.x6f'
  };
}
function jplopsoft_threeVolumeIndexPush(map,key,value){
  if(!map[key])map[key]=[];
  map[key].push(value);
}

function jplopsoft_threeVolumeBuildSandboxTree(T,root){
  var nodes=state.nodes||[],
      byParent={},
      positions={},
      depthMap={0:0},
      rootPos=new T.Vector3(0,0,0),
      queue=[0],
      maxNodes=260,
      shown=0,
      folders=0,
      files=0,
      maxDepth=0,
      i,n,parentId,currentParent,children,depth,index,
      parentPos,name,format,size,scale,
      siblingCount,angle,ring,pos,mesh;

  jplopsoft_threeVolumeTopologyNode(
    root,
    'Sandbox Root',
    rootPos,
    'root',
    'ExFS 使用者邏輯根目錄。',
    exfsVolume3D.pickables,
    0,
    'Topology source: nodes.parent_id',
    1
  );

  positions[0]=rootPos.clone();

  for(i=0;i<nodes.length;i++){
    n=nodes[i];
    parentId=parseInt(n.parent_id,10)||0;

    if(!byParent[parentId]){
      byParent[parentId]=[];
    }
    byParent[parentId].push(n);
  }

  while(queue.length&&shown<maxNodes){
    currentParent=queue.shift();
    children=byParent[currentParent]||[];
    depth=depthMap[currentParent]||0;
    parentPos=positions[currentParent]||rootPos;
    siblingCount=Math.max(1,children.length);

    for(index=0;index<children.length&&shown<maxNodes;index++){
      n=children[index];
      name=jplopsoft_decName(n)||('[無法解密] #'+n.id);
      format=jplopsoft_threeVolumeFileFormat(n,name);

      angle=
        (index/siblingCount)*Math.PI*2+
        (currentParent%17)*.29;

      ring=2.3+Math.min(4.2,siblingCount*.15);

      pos=new T.Vector3(
        parentPos.x+4.1,
        parentPos.y+Math.cos(angle)*ring,
        parentPos.z+Math.sin(angle)*ring
      );

      if(n.type==='folder'){
        folders++;
        scale=.82;
      }else{
        files++;
        size=parseInt(n.original_size,10)||0;
        scale=Math.max(
          .62,
          Math.min(
            1.25,
            .62+Math.log(size+1)/22
          )
        );
      }

      mesh=jplopsoft_threeVolumeTopologyNode(
        root,
        name,
        pos,
        n.type==='folder'?'directory':'data-file',
        n.type==='folder'
          ?'Logical sandbox folder'
          :'Logical sandbox file',
        exfsVolume3D.pickables,
        n.id,
        'ID: '+n.id+
        '<br>Parent ID: '+n.parent_id+
        (n.type==='file'
          ?('<br>原始大小：'+
            jplopsoft_htmlEscape(jplopsoft_formatFileSize(n.original_size||0)))
          :''),
        scale
      );

      if(n.type==='file'&&mesh.material){
        try{
          mesh.material.color.setHex(
            jplopsoft_threeVolumeNodeColor('file',format)
          );
        }catch(ignoreSandboxColor){}
      }

      jplopsoft_threeVolumeAddLine(
        root,
        parentPos,
        pos,
        n.type==='folder'
          ?0x22d3ee
          :jplopsoft_threeVolumeNodeColor('file',format),
        .30
      );

      positions[n.id]=pos.clone();
      depthMap[n.id]=depth+1;

      if(depth+1>maxDepth){
        maxDepth=depth+1;
      }

      if(n.type==='folder'){
        queue.push(n.id);
      }

      shown++;
    }
  }

  return {
    total:nodes.length,
    shown:shown,
    folders:folders,
    files:files,
    maxDepth:maxDepth
  };
}

function jplopsoft_buildVolume3D(){
  var jplopsoft_T=window.THREE,canvas=jplopsoft_el('jplopsoft_volume3dCanvas'),
      loading=jplopsoft_el('jplopsoft_volume3dLoading'),renderer,scene,camera,root,
      topology=exfsVolume3D.topology||'physical',
      sandboxStats=null,
      light,light2,rootPos,metaPos,storagePos,metaFiles,
      rootMesh,metaMesh,storageMesh,i,node,name,parts,
      storageItems=[],years={},months={},days={},
      yearKeys=[],monthKeys=[],dayKeys=[],
      yk,mk,dk,yearPos,monthPos,dayPos,
      yearMesh,monthMesh,dayMesh,
      yi,mi,di,items,j,item,dataPos,metaSidePos,
      fileScale,dataMesh,metaSideMesh,
      countFiles=0,countStorageDirs=0,maxFiles=180,
      shownFiles=0,lineColor=0x315d91;

  if(!jplopsoft_T||!canvas)return;

  jplopsoft_closeVolume3D();
  jplopsoft_el('jplopsoft_volume3dBackdrop').style.display='flex';
  exfsAmbient3D.paused=true;
  if(jplopsoft_el('jplopsoft_threeAmbientCanvas')){
    jplopsoft_el('jplopsoft_threeAmbientCanvas').style.visibility='hidden';
  }

  try{
    renderer=new jplopsoft_T.WebGLRenderer({
      canvas:canvas,
      antialias:true,
      alpha:false,
      powerPreference:'high-performance'
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio||1,1.65)
    );
    renderer.setClearColor(0x020617,1);

    scene=new jplopsoft_T.Scene();
    scene.fog=new jplopsoft_T.FogExp2(0x020617,.013);

    camera=new jplopsoft_T.PerspectiveCamera(52,1,.1,280);
    root=new jplopsoft_T.Group();
    scene.add(root);

    scene.add(new jplopsoft_T.AmbientLight(0xc7ddff,1.18));
    light=new jplopsoft_T.DirectionalLight(0x60a5fa,2.35);
    light.position.set(8,11,12);
    scene.add(light);

    light2=new jplopsoft_T.PointLight(0xa78bfa,2.15,80);
    light2.position.set(-10,-5,10);
    scene.add(light2);

    exfsVolume3D.renderer=renderer;
    exfsVolume3D.scene=scene;
    exfsVolume3D.camera=camera;
    exfsVolume3D.root=root;
    exfsVolume3D.pickables=[];
    exfsVolume3D.raycaster=new jplopsoft_T.Raycaster();
    exfsVolume3D.mouse=new jplopsoft_T.Vector2();

    jplopsoft_threeVolumeSetTopologyButtons();
    jplopsoft_threeVolumeSetInfoPanels();

    if(topology==='sandbox'){
      sandboxStats=jplopsoft_threeVolumeBuildSandboxTree(
        jplopsoft_T,
        root
      );

      exfsVolume3D.onResize=function(){
        jplopsoft_threeVolumeResize();
      };

      if(window.addEventListener){
        window.addEventListener(
          'resize',
          exfsVolume3D.onResize,
          false
        );
      }

      jplopsoft_threeVolumeBindControls();

      camera.position.set(8,4.5,34);
      camera.lookAt(7,0,0);
      root.rotation.set(-.04,-.10,0);

      jplopsoft_threeVolumeResize();
      jplopsoft_threeVolumeAnimate();

      jplopsoft_el('jplopsoft_volume3dStats').textContent=
        'Sandbox topology'+
        ' ｜ Nodes '+sandboxStats.total+
        ' ｜ Shown '+sandboxStats.shown+
        ' ｜ Folders '+sandboxStats.folders+
        ' ｜ Files '+sandboxStats.files+
        ' ｜ Depth '+sandboxStats.maxDepth+
        ' ｜ THREE r'+String(jplopsoft_T.REVISION||'?');

      if(loading){
        loading.style.display='none';
      }
      return;
    }

    /*
     *             Root Dir
     *             /      \
     *   Root Metadata    _Storage
     */
    rootPos=new jplopsoft_T.Vector3(0,0,0);
    metaPos=new jplopsoft_T.Vector3(-7.2,0,0);
    storagePos=new jplopsoft_T.Vector3(7.2,0,0);

    rootMesh=jplopsoft_threeVolumeTopologyNode(
      root,
      'Root Dir',
      rootPos,
      'root',
      'ExFS physical root：./_exfs/',
      exfsVolume3D.pickables,
      0,
      '只作為 3D Volume 拓樸中心。',
      1
    );

    metaMesh=jplopsoft_threeVolumeTopologyNode(
      root,
      'Root Metadata',
      metaPos,
      'metadata-root',
      '根目錄中的 ExFS _*.x6f system metadata。',
      exfsVolume3D.pickables,
      0,
      '_MFT / _MFTMirr / _LogFile / _Volume / _Boot / _Secure',
      1
    );

    storageMesh=jplopsoft_threeVolumeTopologyNode(
      root,
      '_Storage',
      storagePos,
      'storage-root',
      '實體 encrypted storage root。',
      exfsVolume3D.pickables,
      0,
      '_Storage/YYYY/MM/DD/########.x6f',
      1
    );

    jplopsoft_threeVolumeAddLine(root,rootPos,metaPos,lineColor,.68);
    jplopsoft_threeVolumeAddLine(root,rootPos,storagePos,0x22d3ee,.68);

    /*
     * Root Metadata branch.
     */
    metaFiles=[
      ['_MFT.x6f','Master File Table：nodes、versions、Trash index。'],
      ['_MFTMirr.x6f','_MFT.x6f mirror / fallback。'],
      ['_LogFile.x6f','Metadata flock + PREPARE / COMMIT journal。'],
      ['_Volume.x6f','Volume label、serial、commit/statistics。'],
      ['_Boot.x6f','ExFS filesystem layout descriptor。'],
      ['_Secure.x6f','Vault wrapper / Auth security metadata。']
    ];

    for(i=0;i<metaFiles.length;i++){
      var ma=(i-(metaFiles.length-1)/2)*.7,
          mp=new jplopsoft_T.Vector3(
            metaPos.x-4.2,
            metaPos.y+Math.sin(ma)*5.6,
            Math.cos(ma)*3.9
          ),
          mm=jplopsoft_threeVolumeTopologyNode(
            root,
            metaFiles[i][0],
            mp,
            'system',
            metaFiles[i][1],
            exfsVolume3D.pickables,
            0,
            '位置：./_exfs/'+jplopsoft_htmlEscape(metaFiles[i][0]),
            .9
          );

      jplopsoft_threeVolumeAddLine(
        root,
        metaPos,
        mp,
        0x60a5fa,
        .36
      );
    }

    /*
     * Build actual CURRENT physical storage hierarchy from
     * list metadata only. No .x6f content reads.
     */
    for(i=0;i<state.nodes.length;i++){
      node=state.nodes[i];

      if(node.type!=='file')continue;

      parts=jplopsoft_threeVolumeStorageParts(node.storage_path);
      if(!parts)continue;

      name=jplopsoft_decName(node)||('[無法解密] #'+node.id);

      storageItems.push({
        node:node,
        name:name,
        parts:parts
      });

      years[parts.year]=true;
      months[parts.year+'/'+parts.month]=true;
      days[
        parts.year+'/'+parts.month+'/'+parts.day
      ]=true;

      countFiles++;
    }

    yearKeys=[];
    for(yk in years){
      if(years.hasOwnProperty(yk))yearKeys.push(yk);
    }
    yearKeys.sort();

    monthKeys=[];
    for(mk in months){
      if(months.hasOwnProperty(mk))monthKeys.push(mk);
    }
    monthKeys.sort();

    dayKeys=[];
    for(dk in days){
      if(days.hasOwnProperty(dk))dayKeys.push(dk);
    }
    dayKeys.sort();

    countStorageDirs=
      yearKeys.length+
      monthKeys.length+
      dayKeys.length;

    /*
     * Year level.
     */
    for(yi=0;yi<yearKeys.length;yi++){
      yk=yearKeys[yi];
      yearPos=new jplopsoft_T.Vector3(
        storagePos.x+4.3,
        (yi-(yearKeys.length-1)/2)*4.2,
        Math.sin(yi*.9)*2.6
      );

      jplopsoft_threeVolumeTopologyNode(
        root,
        yk,
        yearPos,
        'directory',
        '_Storage/'+yk,
        exfsVolume3D.pickables,
        0,
        'Physical directory',
        1.08
      );

      jplopsoft_threeVolumeAddLine(
        root,
        storagePos,
        yearPos,
        0x22d3ee,
        .44
      );
    }

    /*
     * Month level. Find its year position deterministically.
     */
    for(mi=0;mi<monthKeys.length;mi++){
      mk=monthKeys[mi];
      var mparts=mk.split('/'),
          myear=mparts[0],
          mmonth=mparts[1],
          yindex=yearKeys.indexOf(myear);

      yearPos=new jplopsoft_T.Vector3(
        storagePos.x+4.3,
        (yindex-(yearKeys.length-1)/2)*4.2,
        Math.sin(yindex*.9)*2.6
      );

      var siblingsM=[],kk;
      for(kk=0;kk<monthKeys.length;kk++){
        if(monthKeys[kk].indexOf(myear+'/')===0){
          siblingsM.push(monthKeys[kk]);
        }
      }
      var mLocal=siblingsM.indexOf(mk);

      monthPos=new jplopsoft_T.Vector3(
        storagePos.x+8.0,
        yearPos.y+(mLocal-(siblingsM.length-1)/2)*2.4,
        yearPos.z+Math.cos(mLocal*.8)*2.1
      );

      jplopsoft_threeVolumeTopologyNode(
        root,
        mmonth,
        monthPos,
        'directory',
        '_Storage/'+myear+'/'+mmonth,
        exfsVolume3D.pickables,
        0,
        'Physical month directory',
        .9
      );

      jplopsoft_threeVolumeAddLine(
        root,
        yearPos,
        monthPos,
        0x22d3ee,
        .32
      );
    }

    /*
     * Day level.
     */
    for(di=0;di<dayKeys.length;di++){
      dk=dayKeys[di];
      var dparts=dk.split('/'),
          dyear=dparts[0],
          dmonth=dparts[1],
          dday=dparts[2],
          monthKey=dyear+'/'+dmonth,
          myIndex=yearKeys.indexOf(dyear),
          siblingMonths=[],
          smi;

      for(smi=0;smi<monthKeys.length;smi++){
        if(monthKeys[smi].indexOf(dyear+'/')===0){
          siblingMonths.push(monthKeys[smi]);
        }
      }

      var monthLocal=siblingMonths.indexOf(monthKey);

      yearPos=new jplopsoft_T.Vector3(
        storagePos.x+4.3,
        (myIndex-(yearKeys.length-1)/2)*4.2,
        Math.sin(myIndex*.9)*2.6
      );

      monthPos=new jplopsoft_T.Vector3(
        storagePos.x+8.0,
        yearPos.y+
          (monthLocal-(siblingMonths.length-1)/2)*2.4,
        yearPos.z+Math.cos(monthLocal*.8)*2.1
      );

      var siblingDays=[],sdi;
      for(sdi=0;sdi<dayKeys.length;sdi++){
        if(dayKeys[sdi].indexOf(monthKey+'/')===0){
          siblingDays.push(dayKeys[sdi]);
        }
      }

      var dayLocal=siblingDays.indexOf(dk);

      dayPos=new jplopsoft_T.Vector3(
        storagePos.x+11.5,
        monthPos.y+
          (dayLocal-(siblingDays.length-1)/2)*1.55,
        monthPos.z+Math.sin(dayLocal*.92)*1.9
      );

      jplopsoft_threeVolumeTopologyNode(
        root,
        dday,
        dayPos,
        'directory',
        '_Storage/'+dyear+'/'+dmonth+'/'+dday,
        exfsVolume3D.pickables,
        0,
        'Physical day directory',
        .78
      );

      jplopsoft_threeVolumeAddLine(
        root,
        monthPos,
        dayPos,
        0x22d3ee,
        .26
      );
    }

    /*
     * Physical data files + their Metadata sidecars.
     * Maximum CURRENT user files shown: maxFiles.
     */
    for(i=0;i<storageItems.length&&shownFiles<maxFiles;i++){
      item=storageItems[i];
      node=item.node;
      parts=item.parts;

      dk=parts.year+'/'+parts.month+'/'+parts.day;

      var dyIndex=yearKeys.indexOf(parts.year),
          smonths=[],
          smonthIndex,
          sdays=[],
          sdayIndex,
          sx;

      for(sx=0;sx<monthKeys.length;sx++){
        if(monthKeys[sx].indexOf(parts.year+'/')===0){
          smonths.push(monthKeys[sx]);
        }
      }
      smonthIndex=
        smonths.indexOf(parts.year+'/'+parts.month);

      yearPos=new jplopsoft_T.Vector3(
        storagePos.x+4.3,
        (dyIndex-(yearKeys.length-1)/2)*4.2,
        Math.sin(dyIndex*.9)*2.6
      );
      monthPos=new jplopsoft_T.Vector3(
        storagePos.x+8.0,
        yearPos.y+
          (smonthIndex-(smonths.length-1)/2)*2.4,
        yearPos.z+Math.cos(smonthIndex*.8)*2.1
      );

      for(sx=0;sx<dayKeys.length;sx++){
        if(
          dayKeys[sx].indexOf(
            parts.year+'/'+parts.month+'/'
          )===0
        ){
          sdays.push(dayKeys[sx]);
        }
      }

      sdayIndex=sdays.indexOf(dk);

      dayPos=new jplopsoft_T.Vector3(
        storagePos.x+11.5,
        monthPos.y+
          (sdayIndex-(sdays.length-1)/2)*1.55,
        monthPos.z+Math.sin(sdayIndex*.92)*1.9
      );

      var dayItems=[],fi;
      for(fi=0;fi<storageItems.length;fi++){
        if(
          storageItems[fi].parts.year===parts.year&&
          storageItems[fi].parts.month===parts.month&&
          storageItems[fi].parts.day===parts.day
        ){
          dayItems.push(storageItems[fi]);
        }
      }

      var fileLocal=dayItems.indexOf(item),
          fileAngle=fileLocal*.72;

      fileScale=Math.max(
        .72,
        Math.min(
          1.45,
          .72+Math.log(
            (parseInt(node.cipher_size,10)||0)+1
          )/22
        )
      );

      dataPos=new jplopsoft_T.Vector3(
        storagePos.x+15.2+
          Math.cos(fileAngle)*1.3,
        dayPos.y+
          (fileLocal-(dayItems.length-1)/2)*.92,
        dayPos.z+
          Math.sin(fileAngle)*2.0
      );

      dataMesh=jplopsoft_threeVolumeTopologyNode(
        root,
        parts.number+'.x6f',
        dataPos,
        'data-file',
        'ExES V6 / X60 encrypted user content。',
        exfsVolume3D.pickables,
        node.id,
        'UI 檔名：'+jplopsoft_htmlEscape(item.name)+
        '<br>Storage：'+jplopsoft_htmlEscape(parts.path)+
        '<br>Cipher size：'+
          jplopsoft_htmlEscape(jplopsoft_formatFileSize(node.cipher_size||0)),
        fileScale
      );

      jplopsoft_threeVolumeAddLine(
        root,
        dayPos,
        dataPos,
        0xa78bfa,
        .28
      );

      metaSidePos=new jplopsoft_T.Vector3(
        dataPos.x+2.0,
        dataPos.y+.35,
        dataPos.z+.6
      );

      metaSideMesh=jplopsoft_threeVolumeTopologyNode(
        root,
        parts.number+'_Metadata.x6f',
        metaSidePos,
        'sidecar',
        'Storage sidecar metadata。',
        exfsVolume3D.pickables,
        node.id,
        '對應 UI 檔名：'+jplopsoft_htmlEscape(item.name)+
        '<br>Sidecar：'+jplopsoft_htmlEscape(parts.metadataPath),
        .86
      );

      jplopsoft_threeVolumeAddLine(
        root,
        dataPos,
        metaSidePos,
        0xf472b6,
        .42
      );

      shownFiles++;
    }

    exfsVolume3D.onResize=function(){
      jplopsoft_threeVolumeResize();
    };

    if(window.addEventListener){
      window.addEventListener(
        'resize',
        exfsVolume3D.onResize,
        false
      );
    }

    jplopsoft_threeVolumeBindControls();

    /*
     * Wider default camera because physical hierarchy is left-to-right.
     */
    camera.position.set(4,5,39);
    camera.lookAt(5,0,0);
    root.rotation.set(-.04,-.08,0);

    jplopsoft_threeVolumeResize();
    jplopsoft_threeVolumeAnimate();

    jplopsoft_el('jplopsoft_volume3dStats').textContent=
      'Root Dir → 2 branches'+
      ' ｜ Current files '+countFiles+
      ' ｜ Storage dirs '+countStorageDirs+
      (countFiles>maxFiles
        ?(' ｜ 顯示前 '+maxFiles+' 個 current files')
        :'')+
      ' ｜ THREE r'+String(jplopsoft_T.REVISION||'?');

    if(loading)loading.style.display='none';
  }catch(e){
    if(loading){
      loading.className=
        'jplopsoft_volume3d-loading jplopsoft_volume3d-error';
      loading.textContent=
        '3D Volume 初始化失敗：'+e.message;
      loading.style.display='flex';
    }

    try{
      console.error('ExOS 3D Volume error:',e);
    }catch(ignoreError){}
  }
}
function jplopsoft_openVolume3D(){
  var loading=jplopsoft_el('jplopsoft_volume3dLoading');

  if(!jplopsoft_threeFeatureAllowed()){
    alert('Internet Explorer 11 相容模式不提供 3D / Three.js 功能。');
    return;
  }

  if(!state.vaultKey){
    alert('請先解鎖，再開啟 3D Volume。');
    return;
  }

  jplopsoft_el('jplopsoft_volume3dBackdrop').style.display='flex';
  jplopsoft_wmActivateOverlay('jplopsoft_volume3dBackdrop','jplopsoft_volume3dWindow','volume3d');
  jplopsoft_threeVolumeSetTopologyButtons();
  jplopsoft_threeVolumeSetInfoPanels();
  jplopsoft_threeVolumeUpdateFullscreenButton();
  if(loading){
    loading.className='jplopsoft_volume3d-loading';
    loading.textContent='正在載入 Three.js 3D 引擎…';
    loading.style.display='flex';
  }

  jplopsoft_loadOptionalMirroredScript('three',function(err){
    if(err){
      if(loading){
        loading.className='jplopsoft_volume3d-loading jplopsoft_volume3d-error';
        loading.textContent='Three.js 載入失敗：'+err.message;
      }
      return;
    }
    jplopsoft_buildVolume3D();
  });
}

function jplopsoft_cmdMessageBox(argLine){
  var value=String(argLine||'');

  if(jplopsoft_trim(value)===''){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: MESSAGE text');
    jplopsoft_cmdWrite('       MSGBOX text');
    return;
  }

  jplopsoft_cmdSetBusy(true);

  jplopsoft_exfsShowMessage(value,function(err){
    jplopsoft_cmdSetBusy(false);

    if(err){
      jplopsoft_cmdWrite(
        'MESSAGE failed: '+err.message,
        'error'
      );
    }else{
      jplopsoft_cmdWrite(
        'MESSAGE displayed by message.js.',
        'success'
      );
    }

    jplopsoft_cmdRefreshPrompt();
  });
}
function jplopsoft_cmdLibraries(argLine){
  var arg=jplopsoft_trim(String(argLine||'')).toLowerCase(),
      targets=[];

  function jplopsoft_showStatus(){
    var ss=jplopsoft_optionalLibraryStatus('sack'),
        ts=jplopsoft_optionalLibraryStatus('three'),
        ms=jplopsoft_optionalLibraryStatus('message');

    jplopsoft_cmdWrite('Optional JavaScript libraries','success');
    jplopsoft_cmdWrite(
      ' tw-sack.js  : '+
      (ss.ready?'READY':'NOT LOADED')+
      (ss.source?' ['+ss.source+']':'')
    );
    if(ts.disabled){
      jplopsoft_cmdWrite(' three.min.js: DISABLED (IE11 Compatibility Mode)');
    }else{
      jplopsoft_cmdWrite(
        ' three.min.js: '+
        (ts.ready
          ?('READY / THREE r'+String(window.THREE.REVISION||'?'))
          :'NOT LOADED')+
        (ts.source?' ['+ts.source+']':'')
      );
    }
    jplopsoft_cmdWrite(
      ' message.js  : '+
      (ms.ready?'READY':'NOT LOADED')+
      (ms.source?' ['+ms.source+']':'')
    );
    jplopsoft_cmdWrite('');
    jplopsoft_cmdWrite('Core libraries are loaded separately:');
    jplopsoft_cmdWrite(' base64.js / ex_md3.js / exes.js');
  }

  function jplopsoft_loadTargets(list){
    if(!list.length){
      jplopsoft_showStatus();
      return;
    }

    jplopsoft_cmdSetBusy(true);
    jplopsoft_cmdWrite(
      'Loading optional libraries: '+list.join(', ')+' ...',
      'info'
    );

    jplopsoft_loadOptionalLibraries(list,function(err){
      jplopsoft_cmdSetBusy(false);

      if(err){
        jplopsoft_cmdWrite(
          'Optional library load failed: '+err.message,
          'error'
        );
        jplopsoft_cmdRefreshPrompt();
        return;
      }

      jplopsoft_showStatus();
      jplopsoft_cmdRefreshPrompt();
    });
  }

  function jplopsoft_runThreeTest(next){
    if(!jplopsoft_threeFeatureAllowed()){
      jplopsoft_cmdWrite('THREE test SKIPPED: IE11 Compatibility Mode.','info');
      next(null);
      return;
    }

    jplopsoft_loadOptionalMirroredScript('three',function(err){
      var v,len;

      if(err){
        next(err);
        return;
      }

      try{
        v=new window.THREE.Vector3(3,4,12);
        len=v.length();

        if(Math.abs(len-13)>0.000001){
          next(new Error('THREE.Vector3 self-test failed'));
          return;
        }

        jplopsoft_cmdWrite(
          'THREE test PASS: Vector3(3,4,12).length() = '+len,
          'success'
        );
        next(null);
      }catch(e){
        next(e);
      }
    });
  }

  function jplopsoft_runMessageTest(next){
    jplopsoft_loadOptionalMirroredScript('message',function(err){
      if(err){
        next(err);
        return;
      }

      if(!jplopsoft_messageReady()){
        next(new Error('show_message() API unavailable'));
        return;
      }

      jplopsoft_cmdWrite(
        'MESSAGE test PASS: show_message() API is available.',
        'success'
      );
      next(null);
    });
  }

  function jplopsoft_runSackTest(next){
    jplopsoft_loadOptionalMirroredScript('sack',function(err){
      var req,finished=false,timer;

      if(err){
        next(err);
        return;
      }

      try{
        req=new window.sack(
          jplopsoft_API_BASE+'?api=bootstrap'
        );
        req.method='GET';
        req.execute=false;

        function jplopsoft_finish(e){
          if(finished)return;
          finished=true;
          clearTimeout(timer);
          next(e||null);
        }

        req.onCompletion=function(){
          var out=null;

          try{
            out=JSON.parse(req.response||'{}');
          }catch(e){
            jplopsoft_finish(
              new Error('SACK bootstrap response is not JSON')
            );
            return;
          }

          if(!out||out.ok!==true){
            jplopsoft_finish(
              new Error('SACK bootstrap API self-test failed')
            );
            return;
          }

          jplopsoft_cmdWrite(
            'SACK test PASS: GET bootstrap completed.',
            'success'
          );
          jplopsoft_finish(null);
        };

        req.onError=function(){
          jplopsoft_finish(
            new Error(
              'SACK HTTP error: '+
              String(
                req.responseStatus&&
                req.responseStatus[0]
                  ?req.responseStatus[0]
                  :'unknown'
              )
            )
          );
        };

        req.onFail=function(){
          jplopsoft_finish(new Error('SACK XMLHttpRequest unavailable'));
        };

        timer=jplopsoft_cmdSetTimeout(function(){
          jplopsoft_finish(new Error('SACK self-test timeout'));
        },8000);

        req.runAJAX();
      }catch(e2){
        next(e2);
      }
    });
  }

  if(arg===''||arg==='status'){
    jplopsoft_showStatus();
    return;
  }

  if(arg==='sack'){
    jplopsoft_loadTargets(['sack']);
    return;
  }

  if(arg==='three'){
    if(!jplopsoft_threeFeatureAllowed()){
      jplopsoft_cmdWrite('THREE is disabled in IE11 Compatibility Mode.','info');
      return;
    }
    jplopsoft_loadTargets(['three']);
    return;
  }

  if(arg==='message'){
    jplopsoft_loadTargets(['message']);
    return;
  }

  if(arg==='all'){
    if(!jplopsoft_threeFeatureAllowed()){
      jplopsoft_cmdWrite('LIBS ALL: skipping THREE in IE11 Compatibility Mode.','info');
      jplopsoft_loadTargets(['sack','message']);
    }else{
      jplopsoft_loadTargets(['sack','three','message']);
    }
    return;
  }

  if(arg==='test'){
    jplopsoft_cmdSetBusy(true);
    jplopsoft_cmdWrite('Running optional library self-tests ...','info');

    jplopsoft_runThreeTest(function(err){
      if(err){
        jplopsoft_cmdSetBusy(false);
        jplopsoft_cmdWrite('LIBS TEST failed: '+err.message,'error');
        jplopsoft_cmdRefreshPrompt();
        return;
      }

      jplopsoft_runMessageTest(function(err2){
        if(err2){
          jplopsoft_cmdSetBusy(false);
          jplopsoft_cmdWrite('LIBS TEST failed: '+err2.message,'error');
          jplopsoft_cmdRefreshPrompt();
          return;
        }

        jplopsoft_runSackTest(function(err3){
          jplopsoft_cmdSetBusy(false);

          if(err3){
            jplopsoft_cmdWrite('LIBS TEST failed: '+err3.message,'error');
          }else if(jplopsoft_isIE11Browser()){
            jplopsoft_cmdWrite('Compatible optional library tests PASS; THREE skipped.','success');
          }else{
            jplopsoft_cmdWrite('All optional library tests PASS.','success');
          }

          jplopsoft_cmdRefreshPrompt();
        });
      });
    });
    return;
  }

  jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
  jplopsoft_cmdWrite('Usage: LIBS [STATUS|SACK|THREE|MESSAGE|ALL|TEST]');
}
function jplopsoft_cmdServerSelfTest(){
  var finished=false,
      caps=jplopsoft_browserCoreCapabilities();

  jplopsoft_cmdWrite('Browser compatibility: '+jplopsoft_browserCompatibilityLabel(),'info');
  if(jplopsoft_isIE11Browser()){jplopsoft_cmdWrite(' IE11 Core APIs: XHR='+(caps.xhr?'OK':'FAIL')+' FileReader='+(caps.fileReader?'OK':'FAIL')+' Blob='+(caps.blob?'OK':'FAIL')+' Uint8Array='+(caps.typedArray?'OK':'FAIL')+' JSON='+(caps.json?'OK':'FAIL')+' CSPRNG='+(caps.crypto?'OK':'FAIL')+' ObjectURL='+(caps.objectUrl?'OK':'FAIL'),jplopsoft_browserCoreCapabilitiesOk(caps)?'success':'error');}

  jplopsoft_cmdSetBusy(true);
  jplopsoft_cmdWrite('Running ExOS server compatibility self-test ...','info');

  jplopsoft_cmdApi('server_selftest','GET',null,true,function(err,out){
    var report,checks,i,c,xhr,probeUrl;

    if(err){
      jplopsoft_cmdSetBusy(false);
      jplopsoft_cmdWrite('SELFTEST failed: '+err.message,'error');
      jplopsoft_cmdRefreshPrompt();
      return;
    }

    report=out&&out.report?out.report:null;
    if(!report){
      jplopsoft_cmdSetBusy(false);
      jplopsoft_cmdWrite('SELFTEST failed: invalid server report.','error');
      jplopsoft_cmdRefreshPrompt();
      return;
    }

    jplopsoft_cmdWrite(
      'Server self-test: '+String(report.overall||'UNKNOWN'),
      report.overall==='PASS'?'success':'info'
    );

    checks=report.checks||[];
    for(i=0;i<checks.length;i++){
      c=checks[i]||{};
      jplopsoft_cmdWrite(
        (c.ok?'[PASS] ':'[WARN] ')+
        String(c.name||'check')+
        ' = '+String(c.value||''),
        c.ok?'success':'info'
      );
      if(c.detail){
        jplopsoft_cmdWrite('       '+String(c.detail));
      }
    }

    if(report.warnings&&report.warnings.length){
      jplopsoft_cmdWrite('');
      for(i=0;i<report.warnings.length;i++){
        jplopsoft_cmdWrite('[WARN] '+String(report.warnings[i]),'info');
      }
    }

    jplopsoft_cmdWrite('');
    jplopsoft_cmdWrite('Checking HTTP protection for /_exfs ...','info');

    xhr=new XMLHttpRequest();
    probeUrl=
      '_exfs/index.html?exfs_selftest='+
      encodeURIComponent(String((new Date()).getTime()));

    function jplopsoft_finishProbe(kind,message){
      if(finished)return;
      finished=true;
      jplopsoft_cmdSetBusy(false);
      jplopsoft_cmdWrite(message,kind);
      jplopsoft_cmdRefreshPrompt();
    }

    xhr.open('GET',probeUrl,true);
    try{
      xhr.setRequestHeader('Cache-Control','no-cache');
    }catch(ignoreHeader){}

    xhr.onreadystatechange=function(){
      if(xhr.readyState!==4||finished)return;

      if(xhr.status>=200&&xhr.status<300){
        jplopsoft_finishProbe(
          'error',
          '[FAIL] HTTP protection: _exfs is publicly reachable (HTTP '+
          xhr.status+'). Enable Apache/IIS/Nginx protection.'
        );
      }else if(
        xhr.status===401||
        xhr.status===403||
        xhr.status===404
      ){
        jplopsoft_finishProbe(
          'success',
          '[PASS] HTTP protection: _exfs is blocked (HTTP '+
          xhr.status+').'
        );
      }else if(xhr.status!==0){
        jplopsoft_finishProbe(
          'info',
          '[WARN] HTTP protection probe returned HTTP '+xhr.status+'.'
        );
      }
    };

    xhr.onerror=function(){
      jplopsoft_finishProbe(
        'success',
        '[PASS/WARN] Browser could not retrieve _exfs directly.'
      );
    };

    try{
      xhr.send(null);
    }catch(e){
      jplopsoft_finishProbe(
        'info',
        '[WARN] HTTP protection probe error: '+e.message
      );
    }
  });
}

function jplopsoft_cmdHelpCanonical(name){
  var n=String(name||'').toLowerCase();

  if(/^c:[\\\/]?$/.test(n))return 'drive_c';
  if(n==='cd\\')return 'cd';
  if(n==='echo.'||n==='echo:')return 'echo';

  if(n==='echo')return 'echo';
  if(n==='set')return 'set';

  if(
    n==='cls'||n==='clear'||n==='cl'||n==='cmd'||
    n==='command'||n==='shell'||n==='system'||n==='sh'
  )return 'cls';

  if(n==='help'||n==='?'||n==='man')return 'help';
  if(n==='exit'||n==='explorer'||n==='ui')return 'exit';

  if(
    n==='logout'||n==='lock'||n==='lo'||
    n==='quit'||n==='shutdown'
  )return 'lock';

  if(n==='passwd'||n==='pw')return 'passwd';
  if(n==='m'||n==='math'||n==='??')return 'math';
  if(n==='mr'||n==='random')return 'random';
  if(n==='ver'||n==='winver')return 'ver';
  if(n==='date')return 'date';
  if(n==='time')return 'time';

  if(n==='cd'||n==='chdir'||n==='pwd')return 'cd';
  if(n==='md'||n==='mkdir')return 'md';
  if(n==='rd'||n==='rmdir'||n==='deltree')return 'rd';
  if(n==='ren'||n==='rename'||n==='mv')return 'ren';

  if(
    n==='copy'||n==='xcopy'||n==='cp'||n==='robocopy'
  )return 'copy';

  if(n==='move')return 'move';
  if(n==='dir'||n==='ls'||n==='find')return 'dir';
  if(n==='del'||n==='delete'||n==='erase')return 'del';
  if(n==='old'||n==='filever'||n==='fv'||n==='ol')return 'old';
  if(n==='touch')return 'touch';

  if(
    n==='edit'||n==='e'||n==='vi'||n==='v'||
    n==='vim'||n==='word'||n==='nano'
  )return 'edit';

  if(n==='dl'||n==='download')return 'download';

  if(
    n==='type'||n==='cat'||n==='less'||
    n==='head'||n==='tail'
  )return 'type';

  if(n==='start'||n==='notepad')return 'start';
  if(n==='chkdsk'||n==='scandisk'||n==='sfc')return 'chkdsk';
  if(n==='tree')return 'tree';
  if(n==='clip')return 'clip';
  if(n==='whoami')return 'whoami';
  if(n==='ex')return 'ex';
  if(n==='ex_md3')return 'ex_md3';
  if(n==='pause')return 'pause';
  if(n==='color')return 'color';
  if(n==='vol')return 'vol';
  if(n==='libs'||n==='lib'||n==='libraries')return 'libs';
  if(n==='message'||n==='msgbox')return 'message';
  if(n==='selftest'||n==='compat'||n==='servertest')return 'selftest';
  if(n==='exconfig'||n==='msconfig'||n==='exconfig.exe'||n==='msconfig.exe')return 'exconfig';
  if(n==='taskmgr'||n==='taskmgr.exe')return 'taskmgr';
  if(n==='regedit'||n==='regedit.exe')return 'regedit';
  if(n==='diskmgmt'||n==='diskmgmt.msc')return 'diskmgmt';

  return '';
}
function jplopsoft_cmdHelpForCommand(name){
  var canonical=jplopsoft_cmdHelpCanonical(name);

  if(!canonical)return false;

  switch(canonical){
    case 'drive_c':
      jplopsoft_cmdWrite('C:','info');
      jplopsoft_cmdWrite('    切換到 EXES 唯一可用的虛擬 C: 根目錄。');
      jplopsoft_cmdWrite('    A:、B:、D:~Z: 均為 Access Denied。');
      break;

    case 'echo':
      jplopsoft_cmdWrite('ECHO [text|ON|OFF]','info');
      jplopsoft_cmdWrite('    ECHO text：印出文字。');
      jplopsoft_cmdWrite('    ECHO OFF：關閉指令回顯與即時 Prompt。');
      jplopsoft_cmdWrite('    ECHO ON：恢復指令回顯與 Prompt。');
      jplopsoft_cmdWrite('    ECHO：顯示目前 on/off 狀態。');
      jplopsoft_cmdWrite('    ECHO. / ECHO:：輸出空白行。');
      break;

    case 'set':
      jplopsoft_cmdWrite('SET [name[=value]]','info');
      jplopsoft_cmdWrite('    SET：列出全部 ExOS CMD 系統參數與目前工作階段變數。');
      jplopsoft_cmdWrite('    SET NAME：查詢名稱以 NAME 開頭的參數。');
      jplopsoft_cmdWrite('    SET NAME=value：建立或修改自訂工作階段變數。');
      jplopsoft_cmdWrite('    SET NAME=：刪除自訂變數。');
      jplopsoft_cmdWrite('    可寫內建：EXOS_SORT=NAME|TYPE|SIZE|MODIFIED');
      jplopsoft_cmdWrite('              EXOS_SORTDIR=ASC|DESC');
      jplopsoft_cmdWrite('              EXOS_SIDEBAR_WIDTH=190..520');
      jplopsoft_cmdWrite('              EXOS_COLOR=00..FF（前景與背景不可相同）');
      jplopsoft_cmdWrite('              EXOS_ECHO=ON|OFF');
      jplopsoft_cmdWrite('    唯讀例：USERNAME、USER_SID、EXOS_VERSION、EXOS_SAM_MODEL、EXOS_SECURITY_MODEL、EXES_VAULT_BITS。');
      jplopsoft_cmdWrite('    支援 %NAME% 展開，例如 ECHO %USERNAME%。');
      break;

    case 'cls':
      jplopsoft_cmdWrite('CLS / CLEAR / CL / CMD / COMMAND / SHELL / SYSTEM / SH','info');
      jplopsoft_cmdWrite('    清除 CMD terminal output。');
      jplopsoft_cmdWrite('    不啟動任何主機 Shell，也不清除 command history。');
      break;

    case 'help':
      jplopsoft_cmdWrite('HELP / ? / MAN','info');
      jplopsoft_cmdWrite('    顯示完整 ExOS CMD 指令說明。');
      jplopsoft_cmdWrite('    所有允許使用的指令均可使用 COMMAND /? 顯示專屬說明。');
      break;

    case 'exit':
      jplopsoft_cmdWrite('EXIT / EXPLORER / UI','info');
      jplopsoft_cmdWrite('    離開 CMD 並返回一般 EXES UI；不鎖定。');
      break;

    case 'lock':
      jplopsoft_cmdWrite('LOGOUT / LOCK / LO / QUIT / SHUTDOWN','info');
      jplopsoft_cmdWrite('    登出 ExOS SAM，並清除 Vault Key 與 CMD 敏感狀態。');
      break;

    case 'passwd':
      jplopsoft_cmdWrite('PASSWD / PW','info');
      jplopsoft_cmdWrite('    變更目前 SAM 帳號密碼並重新包裝相同 4096-bit Vault Key。');
      jplopsoft_cmdWrite('    不重新加密全部 .x6f。');
      break;

    case 'math':
      jplopsoft_cmdWrite('M / MATH / ?? expression','info');
      jplopsoft_cmdWrite('    前端 CSP-safe 數學運算。');
      jplopsoft_cmdWrite('    支援 + - * / %、括號、整數、小數與正負號。');
      jplopsoft_cmdWrite('    例：M "312*3123+(123+2)"');
      break;

    case 'random':
      jplopsoft_cmdWrite('MR / RANDOM min max','info');
      jplopsoft_cmdWrite('    使用 crypto.getRandomValues() 產生 min~max 的整數（含上下限）。');
      jplopsoft_cmdWrite('    例：MR 1 100');
      break;

    case 'ver':
      jplopsoft_cmdWrite('VER / WINVER','info');
      jplopsoft_cmdWrite('    顯示 ExOS CMD 模式與相容版本資訊。');
      break;

    case 'date':
      jplopsoft_cmdWrite('DATE','info');
      jplopsoft_cmdWrite('    顯示瀏覽器本機日期。');
      break;

    case 'time':
      jplopsoft_cmdWrite('TIME','info');
      jplopsoft_cmdWrite('    顯示瀏覽器本機時間。');
      break;

    case 'cd':
      jplopsoft_cmdWrite('CD / CHDIR / PWD [path]','info');
      jplopsoft_cmdWrite('    無參數顯示目前路徑；有參數切換資料夾。');
      jplopsoft_cmdWrite('    支援相對路徑、絕對路徑、.、..、\\folder、C:\\folder。');
      jplopsoft_cmdWrite('    CD\\ 直接回到 C:\\ 根目錄。');
      break;

    case 'md':
      jplopsoft_cmdWrite('MD / MKDIR [path\\]folder','info');
      jplopsoft_cmdWrite('    建立資料夾，支援相對與絕對路徑。');
      break;

    case 'rd':
      jplopsoft_cmdWrite('RD / RMDIR / DELTREE folder','info');
      jplopsoft_cmdWrite('    將指定資料夾子樹移到 EXES 垃圾桶。');
      jplopsoft_cmdWrite('    不允許刪除目前資料夾或其祖先。');
      break;

    case 'ren':
      jplopsoft_cmdWrite('REN / RENAME / MV old new','info');
      jplopsoft_cmdWrite('    重新命名檔案或資料夾。');
      jplopsoft_cmdWrite('    MV = REN；跨資料夾搬移請使用 MOVE。');
      break;

    case 'copy':
      jplopsoft_cmdWrite('COPY / XCOPY / CP / ROBOCOPY source destination','info');
      jplopsoft_cmdWrite('    複製檔案或遞迴複製資料夾。');
      jplopsoft_cmdWrite('    檔案來源支援 * 與 ?；目的同名檔案略過、不覆寫。');
      jplopsoft_cmdWrite('    Server 複製已加密 X60 storage，不解密內容。');
      break;

    case 'move':
      jplopsoft_cmdWrite('MOVE source destination','info');
      jplopsoft_cmdWrite('    搬移檔案或資料夾，也可同時重新命名。');
      jplopsoft_cmdWrite('    只更新 metadata，不搬動實體 .x6f。');
      break;

    case 'dir':
      jplopsoft_cmdWrite('DIR / LS / FIND [path/pattern] [/B] [/W] [/S]','info');
      jplopsoft_cmdWrite('    列出資料夾內容，支援相對/絕對路徑與 * ?。');
      jplopsoft_cmdWrite('    /B = Bare；/W = Wide；/S = 遞迴搜尋。');
      jplopsoft_cmdWrite('    DOS 相容：DIR/W、DIR/B、DIR/S、DIR/WS、DIR/W/S 均可。');
      jplopsoft_cmdWrite('    LS/W、FIND/S 等 alias 也支援緊貼 switch。');
      jplopsoft_cmdWrite('    *.* 在 ExFS CMD 視為全部項目。');
      break;

    case 'del':
      jplopsoft_cmdWrite('DEL / DELETE / ERASE file-or-pattern','info');
      jplopsoft_cmdWrite('    將檔案移到 EXES 垃圾桶。');
      jplopsoft_cmdWrite('    支援相對/絕對路徑與 * ? 萬用字元。');
      break;

    case 'old':
      jplopsoft_cmdWrite('OLD / FILEVER / FV / OL filename','info');
      jplopsoft_cmdWrite('    顯示指定檔案的版本歷史 metadata。');
      jplopsoft_cmdWrite('    不讀取或解密歷史版本內容。');
      break;

    case 'touch':
      jplopsoft_cmdWrite('TOUCH [path\\]filename.txt','info');
      jplopsoft_cmdWrite('    建立空白 TXT；沒有副檔名時自動補 .txt。');
      break;

    case 'edit':
      jplopsoft_cmdWrite('EDIT / E / VI / V / VIM / WORD / NANO filename','info');
      jplopsoft_cmdWrite('    返回 UI 並開啟 HTML/TXT 等可編輯文字檔。');
      jplopsoft_cmdWrite('    Binary/Image 不允許文字編輯。');
      break;

    case 'download':
      jplopsoft_cmdWrite('DL / DOWNLOAD filename','info');
      jplopsoft_cmdWrite('    Chunked Read 取得 X60 密文，瀏覽器解密後下載原始檔案。');
      break;

    case 'type':
      jplopsoft_cmdWrite('TYPE / CAT / LESS / HEAD / TAIL filename','info');
      jplopsoft_cmdWrite('    顯示 HTML/TXT 等文字檔內容。');
      jplopsoft_cmdWrite('    LESS / HEAD / TAIL 目前均等同 TYPE，顯示完整內容。');
      break;

    case 'start':
      jplopsoft_cmdWrite('START / NOTEPAD filename','info');
      jplopsoft_cmdWrite('    返回 UI 開啟檔案；文字檢視、圖片預覽、Binary 選取。');
      jplopsoft_cmdWrite('    指定資料夾時可開啟該資料夾。');
      break;

    case 'chkdsk':
      jplopsoft_cmdWrite('CHKDSK / SCANDISK / SFC','info');
      jplopsoft_cmdWrite('    逐一解密目前版本檔案並驗證 EXEFS2 內容封裝。');
      jplopsoft_cmdWrite('    Binary 另驗證 Base64 與 byte length。');
      jplopsoft_cmdWrite('    只讀、不修復；不掃垃圾桶與歷史版本。');
      break;

    case 'tree':
      jplopsoft_cmdWrite('TREE [path] [/F] [/A]','info');
      jplopsoft_cmdWrite('    樹狀列出指定資料夾以下的全部資料夾與檔案。');
      jplopsoft_cmdWrite('    /A 使用 ASCII；/F 為相容 switch，EXES TREE 預設就顯示檔案。');
      jplopsoft_cmdWrite('    DOS 相容：TREE/F、TREE/A、TREE/FA、TREE/F/A 均可。');
      jplopsoft_cmdWrite('    metadata-only，最多輸出 10000 個項目。');
      break;

    case 'clip':
      jplopsoft_cmdWrite('CLIP text','info');
      jplopsoft_cmdWrite('    將文字複製到瀏覽器剪貼簿。');
      break;

    case 'whoami':
      jplopsoft_cmdWrite('WHOAMI','info');
      jplopsoft_cmdWrite('    顯示固定登入者：exes online  user');
      break;

    case 'ex':
      jplopsoft_cmdWrite('EX text-or-X60','info');
      jplopsoft_cmdWrite('    使用目前已解鎖、記憶體中的 4096-bit Vault Key。');
      jplopsoft_cmdWrite('    EX 123      -> 加密 123，輸出 X60...。');
      jplopsoft_cmdWrite('    EX X60...   -> 解密 X60 密文，輸出明文。');
      jplopsoft_cmdWrite('    判斷規則：參數前三碼為 X60 就解密，否則加密。');
      jplopsoft_cmdWrite('    Vault Key 只存在 Browser 記憶體，不會由 EX 指令送到 Server。');
      jplopsoft_cmdWrite('    注意：輸入與輸出會留在 CMD 畫面/history，鎖定 ExOS 時會清除。');
      break;

    case 'ex_md3':
      jplopsoft_cmdWrite('EX_MD3 text','info');
      jplopsoft_cmdWrite('    呼叫已載入的 ex_md3.js / ex_md3() 雜湊文字。');
      jplopsoft_cmdWrite('    純前端，不呼叫 PHP。');
      break;

    case 'pause':
      jplopsoft_cmdWrite('PAUSE','info');
      jplopsoft_cmdWrite('    顯示 Press any key to continue . . .，按任意鍵後返回目前 prompt。');
      break;

    case 'color':
      jplopsoft_cmdWrite('COLOR [attr]','info');
      jplopsoft_cmdWrite('    DOS 兩位十六進位色碼：第一位背景、第二位前景。');
      jplopsoft_cmdWrite('    例：COLOR 0A = 黑底亮綠字；COLOR 無參數恢復 07。');
      break;

    case 'vol':
      jplopsoft_cmdWrite('VOL [C:]','info');
      jplopsoft_cmdWrite('    顯示 ExES 虛擬 C: 的檔案系統與 metadata 統計。');
      jplopsoft_cmdWrite('    不暴露 Server 真正硬碟資訊。');
      break;

    case 'libs':
      jplopsoft_cmdWrite('LIBS / LIB / LIBRARIES [STATUS|SACK|THREE|MESSAGE|ALL|TEST]','info');
      jplopsoft_cmdWrite('    管理選用 JavaScript libraries。');
      jplopsoft_cmdWrite('    SACK  載入 tw-sack.js。');
      jplopsoft_cmdWrite('    THREE 載入 three.min.js。');
      jplopsoft_cmdWrite('    MESSAGE 載入 message.js。');
      jplopsoft_cmdWrite('    ALL   載入全部選用 libraries。');
      jplopsoft_cmdWrite('    TEST  載入並執行 SACK AJAX + THREE Vector3 + MESSAGE API self-test。');
      jplopsoft_cmdWrite('    兩者均使用與 ExES libraries 相同的 7 個 Mirror，再 fallback 到本機。');
      break;

    case 'message':
      jplopsoft_cmdWrite('MESSAGE / MSGBOX text','info');
      jplopsoft_cmdWrite('    Lazy-load message.js 並顯示全螢幕提示視窗。');
      jplopsoft_cmdWrite('    ExFS 會先做 HTML escape，再交給 show_message()。');
      jplopsoft_cmdWrite('    點擊任意位置或按 ESC 關閉。');
      break;

    case 'selftest':
      jplopsoft_cmdWrite('SELFTEST / COMPAT / SERVERTEST','info');
      jplopsoft_cmdWrite('    檢查 PHP、Session、flock、atomic replace 與 PHP limits。');
      jplopsoft_cmdWrite('    並由瀏覽器確認 /_exfs 是否被 Web Server 阻擋。');
      jplopsoft_cmdWrite('    不讀取或解密使用者檔案內容。');
      break;

    case 'exconfig':
      jplopsoft_cmdWrite('EXCONFIG / MSCONFIG','info');
      jplopsoft_cmdWrite('    開啟 ExConfig 系統設定應用程式。');
      jplopsoft_cmdWrite('    顯示 OS、PHP、ExFS、Web Server、Chunk 與重要 php.ini 參數；唯讀，不修改主機設定。');
      break;

    case 'taskmgr':
      jplopsoft_cmdWrite('TASKMGR / TASKMGR.EXE','info');
      jplopsoft_cmdWrite('    開啟 ExOS 工作管理員；列出 user32 HWND、視窗狀態、Window Class 與 Client Area。');
      break;

    case 'regedit':
      jplopsoft_cmdWrite('REGEDIT / REGEDIT.EXE','info');
      jplopsoft_cmdWrite('    開啟 ExOS Registry Editor，可瀏覽 HKLM\\Software / HKCU，建立機碼與編輯 Registry 值。');
      break;

    case 'diskmgmt':
      jplopsoft_cmdWrite('DISKMGMT / DISKMGMT.MSC','info');
      jplopsoft_cmdWrite('    開啟 ExFS 磁碟管理員，顯示虛擬 C: 容量、配額、Volume Serial 與 metadata 統計。');
      break;

    default:
      return false;
  }

  return true;
}
function jplopsoft_cmdIsBlockedHostCommandName(name){
  var n=String(name||'').toLowerCase();

  return (
    n==='ipconfig'||
    n==='ping'||
    n==='net'||
    n==='fdisk'||
    n==='format'||
    n==='netstat'||
    n==='at'||
    n==='fc'||
    n==='osk'||
    n==='path'||
    n==='attrib'||
    n==='cals'||
    n==='chcp'||
    n==='sudo'||
    n==='curl'||
    n==='control'||
    n==='chmod'||
    n==='chown'||
    n==='ps'||
    n==='top'||
    n==='kill'||
    n==='wget'||
    n==='ssh'||
    n==='apt-get'||
    n==='title'||
    n==='route'||
    n==='arp'||
    n==='subst'||
    n==='mklink'||
    n==='bcdedit'||
    n==='schtasks'||
    n==='reg'||
    n==='prompt'||
    n==='compact'||
    n==='cipher'||
    n==='taskkill'||
    n==='findstr'||
    n==='tracert'||
    n==='nslookup'||
    n==='powercfg'||
    n==='assoc'||
    n==='diskpart'||
    n==='driverquery'||
    n==='getmac'||
    n==='msg'||
    n==='wmic'||
    n==='logoff'||
    n==='qwinsta'||
    n==='gpupdate'||
    n==='gpresult'||
    n==='nbtstat'||
    n==='fsutil'||
    n==='vssadmin'||
    n==='label'||
    n==='pathping'
  );
}
function jplopsoft_cmdNormalizeAttachedSwitches(input){
  var raw=String(input||''),
      m,base,slashPart,tail,canonical,
      pieces,out=[],i,p,allowed;

  /*
   * MS-DOS / Windows CMD accepts switches immediately after
   * a command name:
   *
   *   DIR/W
   *   DIR/W/S
   *   TREE/F/A
   *   DIR/?
   *
   * Only switches ExFS already implements are normalized.
   * Arbitrary COMMAND/path strings are left untouched.
   */
  m=/^([^\s\/]+)((?:\/[^\s\/]+)+)([\s\S]*)$/.exec(raw);

  if(!m){
    return raw;
  }

  base=m[1];
  slashPart=m[2];
  tail=m[3]||'';
  canonical=jplopsoft_cmdHelpCanonical(base);
  pieces=slashPart.substring(1).split('/');

  /*
   * Attached /?:
   * - allowed ExFS commands -> command-specific help
   * - blocked host commands -> normalize only so they still reach
   *   the normal Access Denied path
   */
  if(pieces.length===1&&pieces[0]==='?'){
    if(canonical||jplopsoft_cmdIsBlockedHostCommandName(base)){
      return base+' /?'+tail;
    }
    return raw;
  }

  if(!canonical){
    return raw;
  }

  if(canonical==='dir'){
    allowed=/^[bws]+$/i;
  }else if(canonical==='tree'){
    allowed=/^[fa]+$/i;
  }else{
    return raw;
  }

  for(i=0;i<pieces.length;i++){
    p=pieces[i];

    if(!p||!allowed.test(p)){
      return raw;
    }

    out.push('/'+p);
  }

  return base+' '+out.join(' ')+tail;
}

function jplopsoft_cmdTryHelpSwitch(input){
  var args=jplopsoft_cmdSplitArgs(input||'');

  if(args.length!==2||args[1]!=='/?')return false;

  /*
   * Only allowed EXES commands map to this help system.
   * Blocked host/system commands intentionally fall through so PING /?,
   * WMIC /?, etc. remain Access Denied.
   */
  return jplopsoft_cmdHelpForCommand(args[0]);
}

function jplopsoft_cmdShowDate(){
  var d=new Date(),
      y=d.getFullYear(),
      m=('0'+(d.getMonth()+1)).slice(-2),
      day=('0'+d.getDate()).slice(-2);
  jplopsoft_cmdWrite('Current date is '+y+'/'+m+'/'+day);
}
function jplopsoft_cmdShowTime(){
  var d=new Date(),
      h=('0'+d.getHours()).slice(-2),
      m=('0'+d.getMinutes()).slice(-2),
      s=('0'+d.getSeconds()).slice(-2);
  jplopsoft_cmdWrite('Current time is '+h+':'+m+':'+s);
}
function jplopsoft_cmdDirectExecutableCandidate(input){
  var args=jplopsoft_cmdSplitArgs(input||''),candidate;

  if(!args.length)return '';

  candidate=String(args[0]||'');

  /*
   * Direct execution is forbidden for DOS/Windows executable-like
   * sandbox files.  This is based on the command token, not on whether
   * the file exists, so a direct execution attempt is always denied.
   */
  if(/\.(?:exe|com|bat)$/i.test(candidate)){
    return candidate;
  }

  return '';
}
function jplopsoft_cmdBlockDirectExecutable(input){
  var candidate=jplopsoft_cmdDirectExecutableCandidate(input),
      node,
      display;

  if(!candidate)return false;

  /*
   * Resolve only for a nicer display name. Failure to resolve does not
   * change the security decision: direct execution is still denied.
   */
  node=jplopsoft_cmdResolveNode(candidate);
  display=node&&node.type==='file'
    ? (jplopsoft_decName(node)||candidate)
    : candidate;

  jplopsoft_cmdWrite('Access is denied.','error');
  jplopsoft_cmdWrite(
    '權限不足：禁止直接執行 '+display+'。',
    'error'
  );
  return true;
}

function jplopsoft_cmdBlockedCommand(name){
  jplopsoft_cmdWrite('Access is denied.','error');
  jplopsoft_cmdWrite('權限不足：'+String(name||'')+' 已被 ExES 沙盒禁止執行。','error');
}
function jplopsoft_cmdReportLastPathDenied(){
  if(state.cmdLastPathDenied){
    jplopsoft_cmdVirtualAccessDenied(state.cmdLastPathDenied);
    return true;
  }
  return false;
}
function jplopsoft_cmdResolveNewPath(path){
  var raw=jplopsoft_cmdUnquote(path),normalized,hadDrive,absolute,parts,name,
      parentParts,parentPath,parentId;

  if(!raw){
    return {error:'The file or directory name is invalid.'};
  }

  hadDrive=/^c:/i.test(raw);
  normalized=hadDrive?raw.substring(2):raw;
  absolute=/^[\\\/]/.test(normalized);

  while(/[\\\/]$/.test(normalized)){
    normalized=normalized.substring(0,normalized.length-1);
  }

  parts=normalized.split(/[\\\/]+/);
  while(parts.length&&parts[0]==='')parts.shift();
  while(parts.length&&parts[parts.length-1]==='')parts.pop();

  if(!parts.length){
    return {error:'The file or directory name is invalid.'};
  }

  name=parts.pop();
  if(name==='.'||name==='..'){
    return {error:'The file or directory name is invalid.'};
  }
  if(name.indexOf('*')>=0||name.indexOf('?')>=0){
    return {error:'Wildcards are not allowed in this target name.'};
  }

  parentParts=parts;
  if(!parentParts.length){
    parentId=(absolute||hadDrive)?0:state.currentFolder;
  }else{
    parentPath=(absolute||hadDrive?'\\':'')+parentParts.join('\\');
    if(hadDrive)parentPath='c:'+parentPath;
    parentId=jplopsoft_cmdResolveFolder(parentPath);
    if(parentId===-2){
      return {denied:state.cmdLastPathDenied||parentPath};
    }
    if(parentId<0){
      return {error:'The system cannot find the path specified.'};
    }
  }

  if(jplopsoft_cmdIsAuditFolderId(parentId)){
    return {denied:'logs'};
  }

  return {parentId:parentId,name:name};
}
function jplopsoft_cmdResolveRenameDestination(sourceNode,destSpec){
  var raw=jplopsoft_cmdUnquote(destSpec),target;

  if(!raw)return {error:'Destination name is required.'};

  if(!/[\\\/]/.test(raw)&&!/^c:/i.test(raw)){
    return {parentId:sourceNode.parent_id,name:raw};
  }

  target=jplopsoft_cmdResolveNewPath(raw);
  if(target.denied||target.error)return target;

  if(parseInt(target.parentId,10)!==parseInt(sourceNode.parent_id,10)){
    return {error:'REN cannot move an item to another directory. Use MOVE instead.'};
  }

  return target;
}

function jplopsoft_cmdRenameItem(argLine){
  var args=jplopsoft_cmdSplitArgs(argLine),n,oldName,newName,oldFmt,newFmt,oldBin,newBin;

  if(args.length!==2){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: REN oldname newname');
    return;
  }

  if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,args[0])){
    jplopsoft_cmdVirtualAccessDenied(args[0]);
    return;
  }

  n=jplopsoft_cmdResolveNode(args[0]);
  if(!n){
    if(jplopsoft_cmdReportLastPathDenied())return;
    jplopsoft_cmdWrite('The system cannot find the file specified.','error');
    return;
  }

  oldName=jplopsoft_decName(n);
  if(oldName===null){
    jplopsoft_cmdWrite('Unable to decrypt source name.','error');
    return;
  }

  var renameDest=jplopsoft_cmdResolveRenameDestination(n,args[1]);
  if(renameDest.denied){
    jplopsoft_cmdVirtualAccessDenied(renameDest.denied);
    return;
  }
  if(renameDest.error){
    jplopsoft_cmdWrite(renameDest.error,'error');
    return;
  }

  newName=jplopsoft_cmdValidateName(
    renameDest.name,
    n.type,
    n.type==='file'?jplopsoft_fileExtension(oldName):''
  );
  if(!newName)return;

  if(n.type==='file'){
    oldFmt=jplopsoft_fileFormatFromName(oldName);
    newFmt=jplopsoft_fileFormatFromName(newName);
    oldBin=(oldFmt==='image'||oldFmt==='binary');
    newBin=(newFmt==='image'||newFmt==='binary');
    if(oldBin!==newBin){
      jplopsoft_cmdWrite('Cannot rename across Text/HTML and Binary storage categories.','error');
      return;
    }
  }

  if(jplopsoft_siblingNameExists(n.parent_id,newName,n.id)){
    jplopsoft_cmdWrite('A file or directory with that name already exists.','error');
    return;
  }

  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  jplopsoft_cmdSetBusy(true);

  try{
    jplopsoft_cmdApi('rename','POST',{id:n.id,name_enc:jplopsoft_encName(newName)},true,function(err){
      if(err){
        jplopsoft_cmdSetBusy(false);
        jplopsoft_cmdWrite('REN failed: '+err.message,'error');
        return;
      }
      jplopsoft_cmdReloadNodes(function(){
        jplopsoft_cmdSetBusy(false);
        jplopsoft_cmdWrite(oldName+' -> '+newName,'success');
        jplopsoft_cmdRefreshPrompt();
      });
    });
  }catch(e){
    jplopsoft_cmdSetBusy(false);
    jplopsoft_cmdWrite('REN failed: '+e.message,'error');
  }
}
function jplopsoft_cmdResolveCopyDestination(sourceNode,destRaw){
  var raw=jplopsoft_cmdUnquote(destRaw),
      sourceName=jplopsoft_decName(sourceNode),
      existing,
      normalized,
      absolute,
      trailingSlash,
      parts,
      base,
      parentPath,
      parentId;

  if(!raw)return {error:'Destination is required.'};

  normalized=/^c:/i.test(raw)?raw.substring(2):raw;
  trailingSlash=/[\\\/]$/.test(normalized);

  if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,raw)){
    return {denied:raw};
  }

  existing=jplopsoft_cmdResolveNode(raw);
  if(!existing&&state.cmdLastPathDenied){
    return {denied:state.cmdLastPathDenied};
  }
  if(existing){
    if(existing.type==='folder'){
      return {parentId:existing.id,name:sourceName};
    }
    return {error:'Destination file already exists.'};
  }

  if(trailingSlash){
    parentId=jplopsoft_cmdResolveFolder(raw);
    if(parentId===-2)return {denied:raw};
    if(parentId<0)return {error:'Destination folder does not exist.'};
    return {parentId:parentId,name:sourceName};
  }

  absolute=/^[\\\/]/.test(normalized);
  parts=normalized.split(/[\\\/]+/);

  while(parts.length&&parts[0]==='')parts.shift();
  while(parts.length&&parts[parts.length-1]==='')parts.pop();

  if(!parts.length)return {error:'Destination is invalid.'};

  base=parts.pop();

  if(!parts.length){
    parentId=absolute?0:state.currentFolder;
  }else{
    parentPath=(absolute?'\\':'')+parts.join('\\');
    parentId=jplopsoft_cmdResolveFolder(parentPath);
    if(parentId===-2)return {denied:parentPath};
    if(parentId<0)return {error:'Destination folder does not exist.'};
  }

  return {parentId:parentId,name:base};
}
function jplopsoft_cmdResolveWildcardSource(spec){
  var raw=jplopsoft_cmdUnquote(spec),
      normalized,
      absolute,
      parts,
      pattern,
      parentPath,
      parentId,
      matcher,
      list,
      matches=[],
      i,n,name;

  if(!raw||(raw.indexOf('*')<0&&raw.indexOf('?')<0)){
    return null;
  }

  normalized=/^c:/i.test(raw)?raw.substring(2):raw;
  absolute=/^[\\\/]/.test(normalized);
  parts=normalized.split(/[\\\/]+/);

  while(parts.length&&parts[0]==='')parts.shift();
  while(parts.length&&parts[parts.length-1]==='')parts.pop();

  if(!parts.length){
    return {error:'Wildcard source is invalid.'};
  }

  pattern=parts.pop();

  for(i=0;i<parts.length;i++){
    if(parts[i].indexOf('*')>=0||parts[i].indexOf('?')>=0){
      return {
        error:'Wildcards are supported only in the filename component.'
      };
    }
  }

  if(!parts.length){
    parentId=absolute?0:state.currentFolder;
  }else{
    parentPath=(absolute?'\\':'')+parts.join('\\');
    parentId=jplopsoft_cmdResolveFolder(parentPath);

    if(parentId===-2){
      return {denied:parentPath};
    }

    if(parentId<0){
      return {error:'Source folder does not exist.'};
    }
  }

  if(jplopsoft_cmdIsAuditFolderId(parentId)){
    return {denied:'logs'};
  }

  matcher=jplopsoft_cmdWildcardRegex(pattern);
  list=jplopsoft_childrenOf(parentId);

  for(i=0;i<list.length;i++){
    n=list[i];

    if(n.type!=='file')continue;

    name=jplopsoft_decName(n);

    if(name!==null&&matcher.test(name)){
      matches.push({
        node:n,
        name:name
      });
    }
  }

  matches.sort(function(a,b){
    var an=a.name.toLowerCase(),
        bn=b.name.toLowerCase();
    return an<bn?-1:(an>bn?1:0);
  });

  return {
    folderId:parentId,
    pattern:pattern,
    matches:matches
  };
}
function jplopsoft_copyReencryptThumbnail(sourceId,newFek,cb){
  var n=jplopsoft_findNode(sourceId);
  if(!n||!jplopsoft_nodeHasThumbnail(n))return cb(null,null);
  jplopsoft_fetchImageThumbnail(sourceId,function(err,bytes){var cipher;if(err)return cb(err);try{cipher=jplopsoft_encBinaryBytes(bytes,newFek);}catch(e){return cb(e);}cb(null,{cipher:cipher,plain_size:bytes.length});});
}
function jplopsoft_clientCopySmallFile(source,targetParent,newName,cb){
  var sourceName=jplopsoft_decName(source)||newName,fmt=jplopsoft_fileFormatFromName(sourceName),oldFek,newFek,newWrap;
  try{oldFek=jplopsoft_nodeFek(source);newFek=jplopsoft_newFek();newWrap=jplopsoft_wrapFek(newFek);}catch(e){return cb(e);}
  jplopsoft_fetchNodeContent(source.id,function(err,out){var plain,cipher;if(err)return cb(err);try{if(jplopsoft_binaryFormat(fmt)){plain=jplopsoft_decBinaryCipher(out.content_enc,oldFek);if(plain===null)throw new Error('來源 Binary 無法以 FEK 解密。');cipher=jplopsoft_encBinaryBytes(plain,newFek);}else{plain=jplopsoft_decContentCipher(out.content_enc,oldFek);if(plain===null)throw new Error('來源文件無法以 FEK 解密。');cipher=jplopsoft_encContent(plain,newFek);}}catch(e2){return cb(e2);}
    jplopsoft_copyReencryptThumbnail(source.id,newFek,function(te,thumbnail){if(te)return cb(te);jplopsoft_uploadCipherInChunks(targetParent,newName,cipher,parseInt(source.original_size,10)||0,thumbnail,newWrap,null,function(ue,uout){if(ue)return cb(ue);cb(null,{id:uout.id,copied_nodes:1,new_fek_wrap:newWrap});});});
  });
}
function jplopsoft_clientCopyLargeFile(source,targetParent,newName,cb){
  var oldFek,newFek,newWrap,srcInfo=null,uploadId='',blocks=[],index=0;
  try{oldFek=jplopsoft_nodeFek(source);newFek=jplopsoft_newFek();newWrap=jplopsoft_wrapFek(newFek);}catch(e){return cb(e);}
  function closeSource(){try{jplopsoft_closeNodeReadHandle(source.id);}catch(ignore){}}
  function fail(err){if(uploadId){jplopsoft_cmdApi('large_upload_abort','POST',{upload_id:uploadId},true,function(){closeSource();cb(err);});}else{closeSource();cb(err);}}
  jplopsoft_fetchLargeInfo(source.id,function(err,info){if(err)return cb(err);srcInfo=info;blocks=info.blocks||[];
    jplopsoft_copyReencryptThumbnail(source.id,newFek,function(te,thumbnail){if(te)return fail(te);
      jplopsoft_cmdApi('large_upload_begin','POST',{parent_id:targetParent,name_enc:jplopsoft_encName(newName),original_size:parseInt(info.original_size,10)||0,block_size:parseInt(info.block_size,10)||jplopsoft_LARGE_PLAIN_BLOCK_BYTES,block_count:blocks.length,thumbnail_enc:thumbnail&&thumbnail.cipher?thumbnail.cipher:'',thumbnail_plain_size:thumbnail&&thumbnail.plain_size?thumbnail.plain_size:0,fek_wrap:newWrap,motw_enc:jplopsoft_motwForFek(newFek).cipher,motw_plain_size:jplopsoft_motwForFek(newFek).plain_size},true,function(be,bout){if(be)return fail(be);uploadId=String(bout.upload_id||'');next();});
    });
  });
  function next(){
    if(index>=blocks.length){jplopsoft_cmdApi('large_upload_finish','POST',{upload_id:uploadId},true,function(fe,fout){if(fe)return fail(fe);uploadId='';closeSource();cb(null,{id:fout.id,copied_nodes:1,new_fek_wrap:newWrap});});return;}
    var b=blocks[index];jplopsoft_fetchLargeEncryptedBlock(source.id,b,srcInfo.chunk_size,null,function(re,cipher){var bytes,newCipher;if(re)return fail(re);try{bytes=jplopsoft_decBinaryCipher(cipher,oldFek);if(bytes===null)throw new Error('來源大型 Block 無法以 FEK 解密。');newCipher=jplopsoft_encBinaryBytes(bytes,newFek);}catch(e){return fail(e);}jplopsoft_largeSendEncryptedBlock(uploadId,index,parseInt(b.plain_size,10)||bytes.length,newCipher,0,parseInt(srcInfo.original_size,10)||0,function(se){if(se)return fail(se);index++;jplopsoft_cmdSetTimeout(next,0);},0);});
  }
}
function jplopsoft_clientCopyNode(sourceId,targetParent,newName,cb){
  var source=jplopsoft_findNode(parseInt(sourceId,10)||0),children,index=0,copied=0;
  if(!source)return cb(new Error('來源項目不存在。'));
  if(source.type==='file'){
    if(jplopsoft_nodeIsLargeFile(source))return jplopsoft_clientCopyLargeFile(source,targetParent,newName,cb);
    return jplopsoft_clientCopySmallFile(source,targetParent,newName,cb);
  }
  jplopsoft_cmdApi('create','POST',{parent_id:targetParent,type:'folder',name_enc:jplopsoft_encName(newName),content_enc:'',fek_wrap:'',original_size:0},true,function(err,out){
    if(err)return cb(err);copied=1;children=jplopsoft_childrenOf(source.id).slice(0);
    function nextChild(){var child,childName;if(index>=children.length)return cb(null,{id:out.id,copied_nodes:copied});child=children[index++];childName=jplopsoft_decName(child);if(childName===null)return cb(new Error('子項目名稱無法解密。'));jplopsoft_clientCopyNode(child.id,out.id,childName,function(ce,cout){if(ce)return cb(ce);copied+=parseInt(cout&&cout.copied_nodes,10)||1;nextChild();});}
    nextChild();
  });
}
function jplopsoft_cmdCopyWildcard(sourceSpec,destSpec){
  var source=jplopsoft_cmdResolveWildcardSource(sourceSpec),destRaw=jplopsoft_cmdUnquote(destSpec),destId,copyList=[],skipped=0,failed=0,copied=0,i,item;
  if(!source)return false;if(source.denied){jplopsoft_cmdVirtualAccessDenied(source.denied);return true;}if(source.error){jplopsoft_cmdWrite(source.error,'error');return true;}if(!source.matches.length){jplopsoft_cmdWrite('File Not Found: '+source.pattern,'error');return true;}
  destId=jplopsoft_cmdResolveFolder(destRaw);if(destId===-2){jplopsoft_cmdVirtualAccessDenied(destRaw);return true;}if(destId<0){jplopsoft_cmdWrite('Wildcard COPY destination must be an existing directory.','error');return true;}
  for(i=0;i<source.matches.length;i++){item=source.matches[i];if(jplopsoft_siblingNameExists(destId,item.name,0)){skipped++;continue;}copyList.push(item);}if(copyList.length>1000){jplopsoft_cmdWrite('Wildcard COPY is limited to 1000 files per command.','error');return true;}if(!copyList.length){jplopsoft_cmdWrite('0 file(s) copied. '+skipped+' skipped because the destination already contains the same name.','info');return true;}if(state.cmdBusy){jplopsoft_cmdWrite('Another command is still running.','error');return true;}
  jplopsoft_cmdSetBusy(true);jplopsoft_cmdWrite('Trusted-client copying '+copyList.length+' file(s) with fresh FEKs ...','info');
  function finish(){jplopsoft_cmdSetBusy(false);jplopsoft_cmdReloadNodes(function(){jplopsoft_cmdWrite(copied+' file(s) copied with fresh FEKs. '+skipped+' skipped. '+failed+' failed.',failed?'error':'success');jplopsoft_cmdRefreshPrompt();jplopsoft_cmdScrollBottom();});}
  function next(index){var current;if(index>=copyList.length){finish();return;}current=copyList[index];jplopsoft_clientCopyNode(current.node.id,destId,current.name,function(err){if(err)failed++;else copied++;next(index+1);});}
  next(0);return true;
}

function jplopsoft_cmdCopyItem(argLine){
  var args=jplopsoft_cmdSplitArgs(argLine),source,sourceName,dest,newName,current,guard=0,parentNode;
  if(args.length!==2){jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');jplopsoft_cmdWrite('Usage: COPY source destination');return;}
  if(args[0].indexOf('*')>=0||args[0].indexOf('?')>=0){jplopsoft_cmdCopyWildcard(args[0],args[1]);return;}
  if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,args[0])){jplopsoft_cmdVirtualAccessDenied(args[0]);return;}
  source=jplopsoft_cmdResolveNode(args[0]);if(!source){if(jplopsoft_cmdReportLastPathDenied())return;jplopsoft_cmdWrite('The system cannot find the source specified.','error');return;}sourceName=jplopsoft_decName(source);if(sourceName===null){jplopsoft_cmdWrite('Unable to decrypt source name.','error');return;}
  dest=jplopsoft_cmdResolveCopyDestination(source,args[1]);if(dest.denied){jplopsoft_cmdVirtualAccessDenied(dest.denied);return;}if(dest.error){jplopsoft_cmdWrite(dest.error,'error');return;}newName=jplopsoft_cmdValidateName(dest.name,source.type,source.type==='file'?jplopsoft_fileExtension(sourceName):'');if(!newName)return;if(jplopsoft_siblingNameExists(dest.parentId,newName,0)){jplopsoft_cmdWrite('Destination already contains the same name.','error');return;}
  if(source.type==='folder'){current=dest.parentId;while(current>0&&guard<100000){guard++;if(current===source.id){jplopsoft_cmdWrite('A folder cannot be copied into itself or one of its descendants.','error');return;}parentNode=jplopsoft_findNode(current);if(!parentNode)break;current=parentNode.parent_id;}}
  if(state.cmdBusy){jplopsoft_cmdWrite('Another command is still running.','error');return;}jplopsoft_cmdSetBusy(true);jplopsoft_cmdWrite('Trusted-client COPY: decrypting '+sourceName+' and assigning fresh FEK(s) ...','info');
  jplopsoft_clientCopyNode(source.id,dest.parentId,newName,function(err,out){if(err){jplopsoft_cmdSetBusy(false);jplopsoft_cmdWrite('COPY failed: '+err.message,'error');return;}jplopsoft_cmdReloadNodes(function(){jplopsoft_cmdSetBusy(false);jplopsoft_cmdWrite('Copied '+(out.copied_nodes||1)+' node(s) with new FEK(s): '+newName,'success');jplopsoft_cmdRefreshPrompt();});});
}

function jplopsoft_cmdMoveItem(argLine){
  var args=jplopsoft_cmdSplitArgs(argLine),
      source,
      sourceName,
      dest,
      newName,
      oldFmt,
      newFmt,
      oldBin,
      newBin,
      current,
      guard=0,
      parentNode;

  if(args.length!==2){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: MOVE source destination');
    return;
  }

  if(state.currentFolder===0&&
     jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,args[0])){
    jplopsoft_cmdVirtualAccessDenied(args[0]);
    return;
  }

  source=jplopsoft_cmdResolveNode(args[0]);

  if(!source){
    if(jplopsoft_cmdReportLastPathDenied())return;
    jplopsoft_cmdWrite('The system cannot find the source specified.','error');
    return;
  }

  sourceName=jplopsoft_decName(source);

  if(sourceName===null){
    jplopsoft_cmdWrite('Unable to decrypt source name.','error');
    return;
  }

  /*
   * MOVE destination syntax follows COPY:
   * - existing folder => move source into it
   * - non-existing final component => move and rename
   */
  dest=jplopsoft_cmdResolveCopyDestination(source,args[1]);

  if(dest.denied){
    jplopsoft_cmdVirtualAccessDenied(dest.denied);
    return;
  }

  if(dest.error){
    jplopsoft_cmdWrite(dest.error,'error');
    return;
  }

  newName=jplopsoft_cmdValidateName(
    dest.name,
    source.type,
    source.type==='file'?jplopsoft_fileExtension(sourceName):''
  );

  if(!newName)return;

  if(source.type==='file'){
    oldFmt=jplopsoft_fileFormatFromName(sourceName);
    newFmt=jplopsoft_fileFormatFromName(newName);
    oldBin=(oldFmt==='image'||oldFmt==='binary');
    newBin=(newFmt==='image'||newFmt==='binary');

    if(oldBin!==newBin){
      jplopsoft_cmdWrite(
        'Cannot move/rename across Text/HTML and Binary storage categories.',
        'error'
      );
      return;
    }
  }

  if(jplopsoft_siblingNameExists(dest.parentId,newName,source.id)){
    jplopsoft_cmdWrite('Destination already contains the same name.','error');
    return;
  }

  if(source.type==='folder'){
    current=dest.parentId;

    while(current>0&&guard<100000){
      guard++;

      if(current===source.id){
        jplopsoft_cmdWrite(
          'A folder cannot be moved into itself or one of its descendants.',
          'error'
        );
        return;
      }

      parentNode=jplopsoft_findNode(current);
      if(!parentNode)break;
      current=parentNode.parent_id;
    }
  }

  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  jplopsoft_cmdSetBusy(true);
  jplopsoft_cmdWrite('Moving '+sourceName+' ...','info');

  try{
    jplopsoft_cmdApi(
      'move_node',
      'POST',
      {
        id:source.id,
        target_parent_id:dest.parentId,
        name_enc:jplopsoft_encName(newName)
      },
      true,
      function(err){
        if(err){
          jplopsoft_cmdSetBusy(false);
          jplopsoft_cmdWrite('MOVE failed: '+err.message,'error');
          return;
        }

        jplopsoft_cmdReloadNodes(function(){
          jplopsoft_cmdSetBusy(false);
          jplopsoft_cmdWrite(
            'Moved: '+sourceName+' -> '+
            jplopsoft_cmdPathText(dest.parentId)+
            (dest.parentId===0?'':'\\')+
            newName,
            'success'
          );
          jplopsoft_cmdRefreshPrompt();
        });
      }
    );
  }catch(e){
    jplopsoft_cmdSetBusy(false);
    jplopsoft_cmdWrite('MOVE failed: '+e.message,'error');
  }
}

function jplopsoft_cmdListFileVersions(path){
  var arg=jplopsoft_cmdUnquote(path),n,name;

  if(!arg){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: OLD filename');
    return;
  }

  if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,arg)){
    jplopsoft_cmdVirtualAccessDenied(arg);
    return;
  }

  n=jplopsoft_cmdResolveNode(arg);

  if(!n){
    if(jplopsoft_cmdReportLastPathDenied())return;
    jplopsoft_cmdWrite('The system cannot find the file specified.','error');
    return;
  }

  if(n.type!=='file'){
    jplopsoft_cmdWrite('OLD requires a file, not a directory.','error');
    return;
  }

  name=jplopsoft_decName(n)||arg;

  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  jplopsoft_cmdSetBusy(true);
  jplopsoft_cmdWrite('Version history for '+jplopsoft_cmdNodeFullPath(n));
  jplopsoft_cmdWrite('');

  jplopsoft_cmdApi(
    'versions',
    'POST',
    {id:n.id},
    true,
    function(err,out){
      var a,i,v,sizeText,currentNo,line,dateText;

      jplopsoft_cmdSetBusy(false);

      if(err){
        jplopsoft_cmdWrite('OLD failed: '+err.message,'error');
        return;
      }

      a=out.versions||[];
      currentNo=parseInt(out.current_version,10)||0;

      if(!a.length){
        jplopsoft_cmdWrite('No version history found.','info');
        return;
      }

      jplopsoft_cmdWrite('Version     Date / Time                     Encrypted Size     Status');
      jplopsoft_cmdWrite('-------     -----------------------------   --------------     --------');

      for(i=0;i<a.length;i++){
        v=a[i];
        sizeText=jplopsoft_cmdBytesText(parseInt(v.cipher_size,10)||0);
        dateText=jplopsoft_fmtDate(v.created_at);

        line=
          jplopsoft_cmdPadLeft('v'+v.version_no,7)+'     '+
          (dateText+'                             ').substring(0,29)+'   '+
          jplopsoft_cmdPadLeft(sizeText,14)+'     '+
          (parseInt(v.version_no,10)===currentNo?'CURRENT':'');

        jplopsoft_cmdWrite(line);
      }

      jplopsoft_cmdWrite('');
      jplopsoft_cmdWrite(a.length+' version(s).','success');
      jplopsoft_cmdScrollBottom();
    }
  );
}

function jplopsoft_cmdTouchFile(rawName){
  var target=jplopsoft_cmdResolveNewPath(rawName),raw,ext,name,parentId,cipher,fek,fekWrap;
  if(target.denied){jplopsoft_cmdVirtualAccessDenied(target.denied);return;}if(target.error){jplopsoft_cmdWrite(target.error,'error');jplopsoft_cmdWrite('Usage: TOUCH [path\\]filename.txt');return;}
  raw=target.name;parentId=target.parentId;ext=jplopsoft_fileExtension(raw);if(ext&&ext!=='txt'){jplopsoft_cmdWrite('TOUCH supports .txt files only.','error');return;}name=ext==='txt'?raw:(raw+'.txt');name=jplopsoft_cmdValidateName(name,'file','txt');if(!name)return;if(jplopsoft_siblingNameExists(parentId,name,0)){jplopsoft_cmdWrite('A file with that name already exists.','error');return;}if(state.cmdBusy){jplopsoft_cmdWrite('Another command is still running.','error');return;}
  try{fek=jplopsoft_newFek();fekWrap=jplopsoft_wrapFek(fek);cipher=jplopsoft_encContent('',fek);}catch(e){jplopsoft_cmdWrite('TOUCH encryption failed: '+e.message,'error');return;}
  jplopsoft_cmdSetBusy(true);jplopsoft_cmdWrite('Creating '+name+' ...','info');jplopsoft_cmdApi('create','POST',{parent_id:parentId,type:'file',name_enc:jplopsoft_encName(name),content_enc:cipher,fek_wrap:fekWrap,original_size:0},true,function(err,out){if(err){jplopsoft_cmdSetBusy(false);jplopsoft_cmdWrite('TOUCH failed: '+err.message,'error');return;}jplopsoft_cmdReloadNodes(function(){jplopsoft_cmdSetBusy(false);state.currentFolder=parentId;state.selectedId=out.id;jplopsoft_cmdWrite('Created '+name+' with a dedicated 512-bit FEK.','success');jplopsoft_cmdRefreshPrompt();});});
}

function jplopsoft_cmdDownloadFile(path){
  var arg=jplopsoft_cmdUnquote(path),n,name;

  if(!arg){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: DL filename');
    return;
  }

  if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,arg)){
    jplopsoft_cmdVirtualAccessDenied(arg);
    return;
  }

  n=jplopsoft_cmdResolveNode(arg);

  if(!n){
    if(jplopsoft_cmdReportLastPathDenied())return;
    jplopsoft_cmdWrite('The system cannot find the file specified.','error');
    return;
  }

  if(n.type!=='file'){
    jplopsoft_cmdWrite('The specified item is not a file.','error');
    return;
  }

  name=jplopsoft_decName(n)||arg;

  jplopsoft_cmdWrite('Downloading '+name+' ...','info');

  /*
   * Reuse the existing secure browser-side download path:
   * fetchNodeContent() -> chunked X60 read -> Vault Key decrypt -> Blob.
   * PHP never receives plaintext.
   */
  jplopsoft_downloadNode(n.id);
}

function jplopsoft_cmdEditFile(path){
  var arg=jplopsoft_cmdUnquote(path),n,name,fmt;

  if(!arg){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: EDIT filename');
    return;
  }

  if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,arg)){
    jplopsoft_cmdVirtualAccessDenied(arg);
    return;
  }

  n=jplopsoft_cmdResolveNode(arg);
  if(!n){
    if(jplopsoft_cmdReportLastPathDenied())return;
    jplopsoft_cmdWrite('The system cannot find the file specified.','error');
    return;
  }

  if(n.type!=='file'){
    jplopsoft_cmdWrite('The specified item cannot be edited.','error');
    return;
  }

  name=jplopsoft_decName(n)||arg;
  fmt=jplopsoft_fileFormatFromName(name);

  if(jplopsoft_nodeIsLargeFile(n)||(parseInt(n.original_size,10)||0)>jplopsoft_TEXT_ONLINE_EDIT_MAX){
    jplopsoft_cmdWrite('EDIT is unavailable for large/download-only files. Use DOWNLOAD instead.','error');
    return;
  }

  if(fmt!=='html'&&fmt!=='txt'&&fmt!=='csv'){
    jplopsoft_cmdWrite('Unable to edit this file format. Only HTML, text and CSV formats are editable.','error');
    return;
  }
  jplopsoft_cmdSetExplorerFolder(n.parent_id,n.id);
  jplopsoft_cmdWrite('Opening editor for '+name+' ...','info');
  jplopsoft_routeExplorerAction('htmleditor',jplopsoft_cmdNodeFullPath(n));

  jplopsoft_cmdSetTimeout(function(){
    jplopsoft_openEditor(n.id,true);
  },0);
}
function jplopsoft_cmdFindChild(parentId,name,type){
  var a=jplopsoft_childrenOf(parentId),i,n,plain,want=String(name||'').toLowerCase();
  for(i=0;i<a.length;i++){
    n=a[i];
    if(type&&n.type!==type)continue;
    plain=jplopsoft_decName(n);
    if(plain!==null&&plain.toLowerCase()===want)return n;
  }
  return null;
}
function jplopsoft_cmdResolveFolder(path){
  var raw=jplopsoft_cmdUnquote(path),current,parts,i,part,n,audit;
  state.cmdLastPathDenied='';
  if(raw==='')return state.currentFolder;

  audit=jplopsoft_cmdAuditResolvePath(path);
  if(audit.handled){
    return audit.kind==='folder'?jplopsoft_CMD_AUDIT_FOLDER_ID:-1;
  }
  if(/^c:/i.test(raw))raw=raw.substring(2);
  if(raw==='\\'||raw==='/')return 0;

  current=/^[\\\/]/.test(raw)?0:state.currentFolder;
  parts=raw.split(/[\\\/]+/);

  for(i=0;i<parts.length;i++){
    part=parts[i];
    if(!part||part==='.')continue;
    if(part==='..'){
      if(current!==0){
        n=jplopsoft_findNode(current);
        current=n?n.parent_id:0;
      }
      continue;
    }
    if(jplopsoft_cmdIsVirtualSystemFolderAtRoot(current,part)){
      state.cmdLastPathDenied=part;
      return -2;
    }
    n=jplopsoft_cmdFindChild(current,part,'folder');
    if(!n)return -1;
    current=n.id;
  }
  return current;
}
function jplopsoft_cmdResolveNode(path){
  var raw=jplopsoft_cmdUnquote(path),current,parts,i,part,n,last,j,audit;
  state.cmdLastPathDenied='';
  if(!raw)return null;

  audit=jplopsoft_cmdAuditResolvePath(path);
  if(audit.handled){
    state.cmdLastPathDenied='logs';
    return null;
  }
  if(/^c:/i.test(raw))raw=raw.substring(2);

  current=/^[\\\/]/.test(raw)?0:state.currentFolder;
  parts=raw.split(/[\\\/]+/);

  for(i=0;i<parts.length;i++){
    part=parts[i];
    if(!part||part==='.')continue;
    if(part==='..'){
      if(current!==0){
        n=jplopsoft_findNode(current);
        current=n?n.parent_id:0;
      }
      continue;
    }
    if(jplopsoft_cmdIsVirtualSystemFolderAtRoot(current,part)){
      state.cmdLastPathDenied=part;
      return null;
    }

    last=true;
    for(j=i+1;j<parts.length;j++){
      if(parts[j]&&parts[j]!=='.'){
        last=false;
        break;
      }
    }
    if(last){
      n=jplopsoft_cmdFindChild(current,part,null);
      return n?jplopsoft_resolveClientNode(n):null;
    }

    n=jplopsoft_cmdFindChild(current,part,null);
    n=n?jplopsoft_resolveClientNode(n):null;
    if(!n||n.type!=='folder')return null;
    current=n.id;
  }
  return current===0?null:jplopsoft_findNode(current);
}
function jplopsoft_cmdDateText(s){
  var d=new Date(s),y,m,day,h,min;
  if(isNaN(d.getTime()))return '----/--/-- --:--';
  y=d.getFullYear();
  m=('0'+(d.getMonth()+1)).slice(-2);
  day=('0'+d.getDate()).slice(-2);
  h=('0'+d.getHours()).slice(-2);
  min=('0'+d.getMinutes()).slice(-2);
  return y+'/'+m+'/'+day+' '+h+':'+min;
}
function jplopsoft_cmdPadLeft(s,n){
  s=String(s);
  while(s.length<n)s=' '+s;
  return s;
}
function jplopsoft_cmdBytesText(n){
  n=parseInt(n,10)||0;
  if(n<=0)return '?';
  try{return n.toLocaleString('en-US');}catch(e){return String(n);}
}
function jplopsoft_cmdWildcardRegex(pattern){
  var p=String(pattern||''),re='^',i,ch,special='\\^$+().|{}[]';
  if(!p)p='*';

  for(i=0;i<p.length;i++){
    ch=p.charAt(i);
    if(ch==='*'){
      re+='.*';
    }else if(ch==='?'){
      re+='.';
    }else{
      if(special.indexOf(ch)>=0)re+='\\';
      re+=ch;
    }
  }

  re+='$';

  try{
    return new RegExp(re,'i');
  }catch(e){
    return /^$/;
  }
}
function jplopsoft_cmdNodeFullPath(n){
  var base,name;
  if(!n)return '';
  base=jplopsoft_cmdPathText(n.parent_id);
  name=jplopsoft_decName(n)||'[UNREADABLE]';
  return base+(base.charAt(base.length-1)==='\\'?'':'\\')+name;
}
function jplopsoft_cmdRecursiveFind(folderId,matcher,out){
  var list=jplopsoft_childrenOf(folderId),i,n,name;
  for(i=0;i<list.length;i++){
    n=list[i];
    name=jplopsoft_decName(n);

    if(name!==null&&matcher.test(name)){
      out.push(n);
    }

    if(n.type==='folder'){
      jplopsoft_cmdRecursiveFind(n.id,matcher,out);
    }
  }
}
function jplopsoft_cmdPadRight(s,n){
  s=String(s);
  while(s.length<n)s+=' ';
  return s;
}
function jplopsoft_cmdDirVirtualNames(folderId){
  if(parseInt(folderId,10)!==0)return [];
  return [
    'ExOS',
    'Program Files',
    'Program Files (x86)',
    'exes_libs',
    'logs'
  ];
}
function jplopsoft_cmdDirNormalizePattern(pattern){
  var p=String(pattern||'*');
  /*
   * DOS-style "*.*" is treated as "all entries", including names
   * without a literal dot.
   */
  if(p==='*.*')return '*';
  return p||'*';
}
function jplopsoft_cmdDirParseArgs(argLine){
  var tokens=jplopsoft_cmdSplitArgs(argLine||''),
      flags={bare:false,wide:false,recursive:false},
      target='',
      i,t,chars,j,ch;

  for(i=0;i<tokens.length;i++){
    t=tokens[i];

    if(/^\/[bws]+$/i.test(t)){
      chars=t.substring(1).toLowerCase();

      for(j=0;j<chars.length;j++){
        ch=chars.charAt(j);
        if(ch==='b')flags.bare=true;
        if(ch==='w')flags.wide=true;
        if(ch==='s')flags.recursive=true;
      }
      continue;
    }

    if(target!==''){
      return {
        error:'DIR accepts only one path/pattern argument.'
      };
    }

    target=t;
  }

  /*
   * /B takes precedence if both /B and /W were supplied.
   */
  if(flags.bare)flags.wide=false;

  return {
    flags:flags,
    target:target
  };
}
function jplopsoft_cmdResolveDirSpec(spec){
  var raw=jplopsoft_cmdUnquote(spec),
      audit,
      normalized,
      hadDrive,
      absolute,
      trailing,
      parts,
      last,
      parentParts,
      parentPath,
      parentId,
      node,
      pattern,
      i,
      exactFolderId;

  if(!raw){
    return {
      folderId:state.currentFolder,
      pattern:'*'
    };
  }

  audit=jplopsoft_cmdAuditResolvePath(raw);

  if(audit.handled){
    if(audit.kind==='folder'){
      return {
        folderId:jplopsoft_CMD_AUDIT_FOLDER_ID,
        pattern:'*'
      };
    }

    if(audit.kind==='file'){
      return {
        folderId:jplopsoft_CMD_AUDIT_FOLDER_ID,
        pattern:'sys.log'
      };
    }

    return {
      error:'The system cannot find the path specified.'
    };
  }

  if(/^c:[\\\/]?$/i.test(raw)){
    return {
      folderId:0,
      pattern:'*'
    };
  }

  hadDrive=/^c:/i.test(raw);
  normalized=hadDrive?raw.substring(2):raw;

  /*
   * DOS path rules:
   *   \123123\  = absolute from C:\ root
   *   123123    = relative to currentFolder
   */
  absolute=/^[\\\/]/.test(normalized);
  trailing=/[\\\/]$/.test(normalized);

  if(trailing){
    exactFolderId=jplopsoft_cmdResolveFolder(raw);

    if(exactFolderId===-2){
      return {denied:raw};
    }

    if(exactFolderId<0){
      return {
        error:'The system cannot find the path specified.'
      };
    }

    return {
      folderId:exactFolderId,
      pattern:'*'
    };
  }

  parts=normalized.split(/[\\\/]+/);

  while(parts.length&&parts[0]==='')parts.shift();
  while(parts.length&&parts[parts.length-1]==='')parts.pop();

  if(!parts.length){
    return {
      folderId:(absolute||hadDrive)?0:state.currentFolder,
      pattern:'*'
    };
  }

  last=parts[parts.length-1];

  if(last.indexOf('*')>=0||last.indexOf('?')>=0){
    parentParts=parts.slice(0,parts.length-1);

    for(i=0;i<parentParts.length;i++){
      if(
        parentParts[i].indexOf('*')>=0||
        parentParts[i].indexOf('?')>=0
      ){
        return {
          error:'Wildcards are supported only in the final name component.'
        };
      }
    }

    if(!parentParts.length){
      parentId=(absolute||hadDrive)?0:state.currentFolder;
    }else{
      parentPath=(absolute||hadDrive?'\\':'')+
        parentParts.join('\\');

      if(hadDrive){
        parentPath='c:'+parentPath;
      }

      parentId=jplopsoft_cmdResolveFolder(parentPath);

      if(parentId===-2){
        return {denied:parentPath};
      }

      if(parentId<0){
        return {
          error:'The system cannot find the path specified.'
        };
      }
    }

    return {
      folderId:parentId,
      pattern:jplopsoft_cmdDirNormalizePattern(last)
    };
  }

  /*
   * Exact node:
   * At C:\ root, DIR 123123 resolves the same folder as
   * DIR \123123\ and DIR C:\123123\.
   * In subfolders it remains relative to currentFolder.
   */
  node=jplopsoft_cmdResolveNode(raw);

  if(node){
    if(node.type==='folder'){
      return {
        folderId:node.id,
        pattern:'*'
      };
    }

    return {
      folderId:node.parent_id,
      pattern:jplopsoft_decName(node)||last
    };
  }

  exactFolderId=jplopsoft_cmdResolveFolder(raw);

  if(exactFolderId===-2){
    return {denied:raw};
  }

  if(exactFolderId>=0||jplopsoft_cmdIsAuditFolderId(exactFolderId)){
    return {
      folderId:exactFolderId,
      pattern:'*'
    };
  }

  return {
    error:'The system cannot find the path specified.'
  };
}
function jplopsoft_cmdDirEntries(folderId,pattern){
  var p=jplopsoft_cmdDirNormalizePattern(pattern||'*'),
      matcher=jplopsoft_cmdWildcardRegex(p),
      list,
      virtuals,
      out=[],
      i,n,name;

  if(jplopsoft_cmdIsAuditFolderId(folderId)){
    if(matcher.test('sys.log')){
      out.push({
        virtual:true,
        type:'file',
        name:'sys.log',
        updated_at:state.auditLogUpdatedAt||'',
        original_size:parseInt(state.auditLogSize,10)||0
      });
    }
    return out;
  }

  list=jplopsoft_sortFileNodes(jplopsoft_childrenOf(folderId));
  virtuals=jplopsoft_cmdDirVirtualNames(folderId);

  for(i=0;i<virtuals.length;i++){
    name=virtuals[i];

    if(matcher.test(name)){
      out.push({
        virtual:true,
        type:'folder',
        name:name,
        updated_at:'',
        original_size:0
      });
    }
  }

  for(i=0;i<list.length;i++){
    n=list[i];
    name=jplopsoft_decName(n);

    if(name===null||!matcher.test(name))continue;

    out.push({
      virtual:false,
      node:n,
      type:n.type,
      name:name,
      updated_at:n.updated_at,
      original_size:parseInt(n.original_size,10)||0
    });
  }

  return out;
}
function jplopsoft_cmdDirWriteWide(entries){
  var width=24,
      cols=4,
      line='',
      i,e,label;

  for(i=0;i<entries.length;i++){
    e=entries[i];
    label=e.type==='folder'?'['+e.name+']':e.name;

    if(line!=='')line+=' ';

    if(label.length<width){
      line+=jplopsoft_cmdPadRight(label,width);
    }else{
      line+=label;
    }

    if(((i+1)%cols)===0){
      jplopsoft_cmdWrite(line.replace(/\s+$/,''));
      line='';
    }
  }

  if(line!==''){
    jplopsoft_cmdWrite(line.replace(/\s+$/,''));
  }
}
function jplopsoft_cmdDirRender(folderId,pattern,flags){
  var entries=jplopsoft_cmdDirEntries(folderId,pattern),
      i,e,line,files=0,dirs=0,total=0,
      displayPath=jplopsoft_cmdPathText(folderId);

  if(flags.bare){
    if(!entries.length){
      jplopsoft_cmdWrite('File Not Found','error');
      return;
    }

    for(i=0;i<entries.length;i++){
      jplopsoft_cmdWrite(entries[i].name);
    }
    return;
  }

  jplopsoft_cmdWrite(' Volume in drive C is EXES');
  jplopsoft_cmdWrite(' Directory of '+displayPath);
  jplopsoft_cmdWrite('');

  if(!entries.length){
    jplopsoft_cmdWrite('File Not Found','error');
    return;
  }

  if(flags.wide){
    jplopsoft_cmdDirWriteWide(entries);

    for(i=0;i<entries.length;i++){
      e=entries[i];
      if(e.type==='folder'){
        dirs++;
      }else{
        files++;
        if(e.original_size>0)total+=e.original_size;
      }
    }
  }else{
    for(i=0;i<entries.length;i++){
      e=entries[i];

      if(e.type==='folder'){
        dirs++;
        line=(e.virtual?'----/--/-- --:--':jplopsoft_cmdDateText(e.updated_at))+
          '    <DIR>          '+e.name;
      }else{
        files++;
        if(e.original_size>0)total+=e.original_size;
        line=jplopsoft_cmdDateText(e.updated_at)+' '+
          jplopsoft_cmdPadLeft(jplopsoft_cmdBytesText(e.original_size),16)+' '+
          e.name;
      }

      jplopsoft_cmdWrite(line);
    }
  }

  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite(
    jplopsoft_cmdPadLeft(String(files),16)+
    ' File(s)  '+jplopsoft_cmdBytesText(total)+' bytes'
  );
  jplopsoft_cmdWrite(
    jplopsoft_cmdPadLeft(String(dirs),16)+' Dir(s)'
  );
}
function jplopsoft_cmdDirRecursive(pattern,folderId,bare){
  var p=jplopsoft_cmdDirNormalizePattern(jplopsoft_cmdUnquote(pattern||'*')),
      startId=typeof folderId==='number'?folderId:state.currentFolder,
      matcher=jplopsoft_cmdWildcardRegex(p),
      found=[],
      i,n,size,line,files=0,dirs=0,total=0;

  jplopsoft_cmdRecursiveFind(startId,matcher,found);

  found.sort(function(a,b){
    var ap=jplopsoft_cmdNodeFullPath(a).toLowerCase(),
        bp=jplopsoft_cmdNodeFullPath(b).toLowerCase();
    return ap<bp?-1:(ap>bp?1:0);
  });

  if(!found.length){
    jplopsoft_cmdWrite('File Not Found','error');
    return;
  }

  if(bare){
    for(i=0;i<found.length;i++){
      jplopsoft_cmdWrite(jplopsoft_cmdNodeFullPath(found[i]));
    }
    return;
  }

  jplopsoft_cmdWrite(' Recursive directory search from '+jplopsoft_cmdPathText(startId));
  jplopsoft_cmdWrite(' Pattern: '+p);
  jplopsoft_cmdWrite('');

  for(i=0;i<found.length;i++){
    n=found[i];

    if(n.type==='folder'){
      dirs++;
      line=jplopsoft_cmdDateText(n.updated_at)+
        '    <DIR>          '+jplopsoft_cmdNodeFullPath(n);
    }else{
      files++;
      size=parseInt(n.original_size,10)||0;
      if(size>0)total+=size;
      line=jplopsoft_cmdDateText(n.updated_at)+' '+
        jplopsoft_cmdPadLeft(jplopsoft_cmdBytesText(size),16)+' '+
        jplopsoft_cmdNodeFullPath(n);
    }

    jplopsoft_cmdWrite(line);
  }

  jplopsoft_cmdWrite('');
  jplopsoft_cmdWrite(
    jplopsoft_cmdPadLeft(String(files),16)+
    ' File(s)  '+jplopsoft_cmdBytesText(total)+' bytes'
  );
  jplopsoft_cmdWrite(
    jplopsoft_cmdPadLeft(String(dirs),16)+' Dir(s)'
  );
}
function jplopsoft_cmdDirAdvanced(argLine){
  var parsed=jplopsoft_cmdDirParseArgs(argLine||''),
      resolved,
      flags;

  if(parsed.error){
    jplopsoft_cmdWrite(parsed.error,'error');
    return;
  }

  flags=parsed.flags;
  resolved=jplopsoft_cmdResolveDirSpec(parsed.target);

  if(resolved.denied){
    jplopsoft_cmdVirtualAccessDenied(resolved.denied);
    return;
  }

  if(resolved.error){
    jplopsoft_cmdWrite(resolved.error,'error');
    return;
  }

  if(flags.recursive){
    /*
     * /W is intentionally ignored with /S; /B remains useful and
     * returns full paths, similar to a bare recursive listing.
     */
    jplopsoft_cmdDirRecursive(
      resolved.pattern,
      resolved.folderId,
      flags.bare
    );
    return;
  }

  jplopsoft_cmdDirRender(
    resolved.folderId,
    resolved.pattern,
    flags
  );
}
function jplopsoft_cmdFolderIsCurrentOrAncestor(folderId){
  var current=state.currentFolder,n,guard=0;
  folderId=parseInt(folderId,10)||0;

  if(folderId<=0)return false;

  while(current>0&&guard<100000){
    guard++;

    if(current===folderId)return true;

    n=jplopsoft_findNode(current);
    if(!n)break;
    current=n.parent_id;
  }

  return false;
}
function jplopsoft_cmdSetBusy(on){
  state.cmdBusy=!!on;

  if(jplopsoft_cmdEl('input')){
    jplopsoft_cmdEl('input').disabled=!!on;

    if(on){
      jplopsoft_cmdHideVisualCursor();
    }else{
      try{jplopsoft_cmdEl('input').focus();}catch(e){}
      jplopsoft_cmdScheduleVisualCursor();
    }
  }
}
function jplopsoft_cmdSoftDeleteIds(ids,successText){
  var list=[],seen={},i,id,batches=[];

  for(i=0;i<ids.length;i++){
    id=parseInt(ids[i],10)||0;
    if(id>0&&!seen[id]){
      seen[id]=true;
      list.push(id);
    }
  }

  if(!list.length){
    jplopsoft_cmdWrite('File Not Found','error');
    return;
  }

  while(list.length){
    batches.push(list.splice(0,1000));
  }

  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  jplopsoft_cmdSetBusy(true);

  function jplopsoft_next(index){
    var batch;

    if(index>=batches.length){
      jplopsoft_cmdSetBusy(false);

      jplopsoft_cmdReloadNodes(function(){
        jplopsoft_cmdWrite(successText,'success');
        jplopsoft_cmdRefreshPrompt();
        jplopsoft_cmdScrollBottom();
      });
      return;
    }

    batch=batches[index];

    jplopsoft_cmdApi(
      batch.length===1?'delete':'delete_many',
      'POST',
      batch.length===1?{id:batch[0]}:{ids:batch},
      true,
      function(err){
        if(err){
          jplopsoft_cmdSetBusy(false);
          jplopsoft_cmdWrite('Delete failed: '+err.message,'error');
          return;
        }
        jplopsoft_next(index+1);
      }
    );
  }

  jplopsoft_next(0);
}
function jplopsoft_cmdMakeDirectory(path){
  var target=jplopsoft_cmdResolveNewPath(path),folder,parentId;

  if(target.denied){
    jplopsoft_cmdVirtualAccessDenied(target.denied);
    return;
  }
  if(target.error){
    jplopsoft_cmdWrite(target.error,'error');
    jplopsoft_cmdWrite('Usage: MD [path\\]folder');
    return;
  }

  folder=jplopsoft_cmdValidateName(target.name,'folder','');
  if(!folder)return;
  parentId=target.parentId;

  if(jplopsoft_siblingNameExists(parentId,folder,0)){
    jplopsoft_cmdWrite('A subdirectory or file '+folder+' already exists.','error');
    return;
  }
  if(state.cmdBusy){
    jplopsoft_cmdWrite('Another command is still running.','error');
    return;
  }

  jplopsoft_cmdSetBusy(true);
  try{
    jplopsoft_cmdApi('create','POST',{
      parent_id:parentId,
      type:'folder',
      name_enc:jplopsoft_encName(folder),
      content_enc:'',
      original_size:0
    },true,function(err,out){
      if(err){
        jplopsoft_cmdSetBusy(false);
        jplopsoft_cmdWrite('MD failed: '+err.message,'error');
        return;
      }
      jplopsoft_cmdReloadNodes(function(){
        jplopsoft_cmdSetBusy(false);
        jplopsoft_cmdWrite('Directory created: '+jplopsoft_cmdPathText(parentId)+(parentId===0?'':'\\')+folder,'success');
        jplopsoft_cmdRefreshPrompt();
      });
    });
  }catch(e){
    jplopsoft_cmdSetBusy(false);
    jplopsoft_cmdWrite('MD failed: '+e.message,'error');
  }
}
function jplopsoft_cmdRemoveDirectory(path){
  var raw=jplopsoft_cmdUnquote(path),folder,name;

  if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,raw)){
    jplopsoft_cmdVirtualAccessDenied(raw);
    return;
  }

  folder=jplopsoft_cmdResolveNode(path);

  if(!folder){
    if(jplopsoft_cmdReportLastPathDenied())return;
    jplopsoft_cmdWrite('The system cannot find the path specified.','error');
    return;
  }

  if(folder.type!=='folder'){
    jplopsoft_cmdWrite('The directory name is invalid.','error');
    return;
  }

  if(jplopsoft_cmdFolderIsCurrentOrAncestor(folder.id)){
    jplopsoft_cmdWrite(
      'The directory cannot be removed because it is the current directory or one of its parents.',
      'error'
    );
    return;
  }

  name=jplopsoft_decName(folder)||('#'+folder.id);
  jplopsoft_cmdSoftDeleteIds(
    [folder.id],
    'Directory moved to Recycle Bin: '+name
  );
}
function jplopsoft_cmdDeletePattern(pattern){
  var source=jplopsoft_cmdResolveWildcardSource(pattern),ids=[],i;

  if(!source){
    jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
    jplopsoft_cmdWrite('Usage: DEL filename or DEL [path\\]*.ext');
    return;
  }
  if(source.denied){
    jplopsoft_cmdVirtualAccessDenied(source.denied);
    return;
  }
  if(source.error){
    jplopsoft_cmdWrite(source.error,'error');
    return;
  }

  for(i=0;i<source.matches.length;i++)ids.push(source.matches[i].node.id);
  if(!ids.length){
    jplopsoft_cmdWrite('Could Not Find '+jplopsoft_cmdUnquote(pattern),'error');
    return;
  }
  jplopsoft_cmdSoftDeleteIds(ids,ids.length+' file(s) moved to Recycle Bin.');
}
function jplopsoft_cmdDir(){
  jplopsoft_cmdDirAdvanced('');
}
function jplopsoft_cmdStartNode(n){
  var fmt,name;
  if(!n)return;

  if(n.type==='folder'){
    jplopsoft_cmdSetExplorerFolder(n.id,0);
    if(jplopsoft_routeIsUser()&&jplopsoft_EXE_ROUTE.app==='cmd')jplopsoft_routeExplorer(jplopsoft_EXE_ROUTE.username);
      jplopsoft_setStatus('已由 CMD 開啟資料夾「'+jplopsoft_htmlEscape(jplopsoft_decName(n)||('#'+n.id))+'」。');
    return;
  }

  name=jplopsoft_decName(n)||('#'+n.id);
  fmt=jplopsoft_fileFormatFromName(name);
  if(jplopsoft_nodeIsLargeFile(n)){
    jplopsoft_cmdWrite('Large file is download-only. Use DOWNLOAD '+cmdQuoteArg(name),'info');
    return;
  }
  jplopsoft_cmdSetExplorerFolder(n.parent_id,n.id);
  if(fmt==='html')jplopsoft_routeExplorerAction('htmlview',jplopsoft_cmdNodeFullPath(n));
  else if(jplopsoft_routeIsUser()&&jplopsoft_EXE_ROUTE.app==='cmd')jplopsoft_routeExplorer(jplopsoft_EXE_ROUTE.username);

  jplopsoft_cmdSetTimeout(function(){
    if(fmt!=='binary'){
      jplopsoft_openView(n.id,true);
    }else{
      jplopsoft_setStatus('已由 CMD 定位到 Binary 檔案「'+jplopsoft_htmlEscape(name)+'」。此類型不直接預覽，可使用下載。');
    }
  },0);
}

function jplopsoft_cmdShowPeb(argLine){
  var raw=jplopsoft_trim(String(argLine||'')),ctx=jplopsoft_cmdExecutionContext(),
      p=ctx&&ctx.process?ctx.process:null,pp,env,count=0,k,parent;

  if(raw){
    jplopsoft_cmdWrite('Usage: PEB','error');
    return;
  }

  if(!p||!p.peb||!p.peb.processParameters){
    jplopsoft_cmdWrite('PEB is unavailable for this shell process.','error');
    return;
  }

  pp=p.peb.processParameters;
  env=pp.environment||{};
  for(k in env)if(env.hasOwnProperty(k))count++;
  parent=typeof jplopsoft_ntKernelProcessByPid==='function'
    ?jplopsoft_ntKernelProcessByPid(p.ppid)
    :null;

  jplopsoft_cmdWrite('PROCESS '+p.imageName+'  PID '+p.pid+'  PPID '+p.ppid,'success');
  jplopsoft_cmdWrite('VAS     '+String(p.virtualAddressSpaceId||''));
  jplopsoft_cmdWrite('PEB     '+String(p.peb.id||''));
  jplopsoft_cmdWrite('Parent  '+(parent?parent.imageName:'Unknown'));
  jplopsoft_cmdWrite('CWD     '+String(pp.currentDirectory||jplopsoft_cmdPathText(ctx.currentFolder)));
  jplopsoft_cmdWrite('Command '+String(pp.commandLine||'cmd.exe'));
  jplopsoft_cmdWrite('Env     '+count+' process-local variable(s)');
  jplopsoft_cmdWrite('Note: SET modifies only this PEB Environment block.','info');
}

function jplopsoft_cmdTaskList(argLine){
  var raw=jplopsoft_trim(String(argLine||'')),q,rows,i,p,name,pid,session,user;

  if(raw){
    jplopsoft_cmdWrite('Usage: TASKLIST','error');
    return;
  }

  if(typeof jplopsoft_NtQuerySystemInformation!=='function'){
    jplopsoft_cmdWrite('NtQuerySystemInformation is unavailable.','error');
    return;
  }

  q=jplopsoft_NtQuerySystemInformation('SystemProcessInformation');
  if(!q||q.status!==jplopsoft_STATUS_SUCCESS){
    jplopsoft_cmdWrite('TASKLIST failed.','error');
    return;
  }

  rows=q.information||[];
  jplopsoft_cmdWrite('Image Name                     PID   Session  User');
  jplopsoft_cmdWrite('========================= ======== ========= ====================');

  for(i=0;i<rows.length;i++){
    p=rows[i];
    name=String(p.imageName||'');
    while(name.length<25)name+=' ';
    if(name.length>25)name=name.substring(0,25);

    pid=String(p.pid||0);
    while(pid.length<8)pid=' '+pid;

    session=String(p.sessionId||0);
    while(session.length<9)session=' '+session;

    user=String(p.username||'');
    jplopsoft_cmdWrite(name+' '+pid+' '+session+' '+user);
  }
}


function jplopsoft_cmdExecute(raw){
  var rawInput=String(raw||''),
      input=jplopsoft_trim(rawInput),
      parseInput,lower,sp,cmd,arg,target,n,matcher,list,ids,i,name;

  /*
   * MS-DOS / COMMAND.COM behavior:
   * pressing Enter on an empty command line commits the visible prompt
   * and immediately presents the next prompt on the following line.
   *
   * The caller intentionally does NOT add an empty line to command
   * history, so Up/Down history remains command-only.
   */
  if(!input){
    if(state.cmdEcho!==false){
      jplopsoft_cmdWrite(
        jplopsoft_cmdPathText(state.currentFolder)+'>'+rawInput
      );
    }
    return;
  }

  /*
   * Echo preserves the exact text entered by the user.
   * DOS attached switches are normalized only for parsing.
   */
  if(state.cmdEcho!==false){
    jplopsoft_cmdWrite(jplopsoft_cmdPathText(state.currentFolder)+'>'+rawInput);
  }

  parseInput=jplopsoft_cmdExpandVariables(input);
  parseInput=jplopsoft_cmdNormalizeAttachedSwitches(parseInput);
  lower=parseInput.toLowerCase();

  /* COMMAND /? and COMMAND/? are handled before any side effect. */
  if(jplopsoft_cmdTryHelpSwitch(parseInput)){
    return;
  }

  if(/^[a-bd-z]:(?:[\\\/].*)?$/i.test(parseInput)){
    jplopsoft_cmdWrite('Access is denied.','error');
    jplopsoft_cmdWrite('權限不足：ExES 沙盒不允許存取 '+parseInput.charAt(0).toUpperCase()+': 磁碟機。','error');
    return;
  }

  if(/^c:(?:[\\\/]?)$/i.test(parseInput)){
    state.currentFolder=0;
    state.selectedId=0;
    jplopsoft_renderAll();
    jplopsoft_cmdRefreshPrompt();
    return;
  }

  if(lower==='echo'){
    jplopsoft_cmdEchoCommand('');
    return;
  }

  if(lower==='set'){
    jplopsoft_cmdSetCommand('');
    return;
  }

  if(lower==='echo.'||lower==='echo:'){
    jplopsoft_cmdWrite('');
    return;
  }

  if(lower==='date'){
    jplopsoft_cmdShowDate();
    return;
  }

  if(lower==='time'){
    jplopsoft_cmdShowTime();
    return;
  }

  if(lower==='tree'){
    jplopsoft_cmdTree('');
    return;
  }

  if(lower==='whoami'){
    jplopsoft_cmdWhoAmI('');
    return;
  }

  if(lower==='pause'){
    jplopsoft_cmdPause('');
    return;
  }

  if(lower==='color'){
    jplopsoft_cmdColor('');
    return;
  }

  if(lower==='vol'){
    jplopsoft_cmdShowVolume('');
    return;
  }

  if(
    lower==='libs'||
    lower==='lib'||
    lower==='libraries'
  ){
    jplopsoft_cmdLibraries('');
    return;
  }

  if(
    lower==='selftest'||
    lower==='compat'||
    lower==='servertest'
  ){
    jplopsoft_cmdServerSelfTest();
    return;
  }

  if(
    lower==='exconfig'||lower==='msconfig'||
    lower==='exconfig.exe'||lower==='msconfig.exe'
  ){
    jplopsoft_cmdWrite('Opening ExConfig ...','info');
    jplopsoft_openExconfig();
    return;
  }

  if(lower==='peb'){
    jplopsoft_cmdShowPeb(arg);
    return;
  }

  if(lower==='tasklist'){
    jplopsoft_cmdTaskList(arg);
    return;
  }

  if(
    lower==='cmd'||
    lower==='cmd.exe'||
    lower==='command'
  ){
    if(arg){
      jplopsoft_cmdWrite('Usage: CMD','error');
      return;
    }
    jplopsoft_cmdWrite('CreateProcess: starting child cmd.exe ...','info');
    jplopsoft_cmdCreateInstance(undefined,jplopsoft_cmdExecutionId());
    return;
  }

  if(
    lower==='cls'||
    lower==='clear'||
    lower==='cl'||
    lower==='shell'||
    lower==='system'||
    lower==='sh'
  ){
    if(jplopsoft_cmdEl('output'))jplopsoft_cmdEl('output').innerHTML='';
    return;
  }

  if(lower==='help'||lower==='?'||lower==='man'){
    jplopsoft_cmdHelp();
    return;
  }

  if(lower==='exit'||lower==='explorer'||lower==='ui'){
    jplopsoft_cmdWrite('Returning to ExOS Explorer ...','info');
    jplopsoft_routeCmdExit();
    return;
  }

  if(
    lower==='logout'||
    lower==='lock'||
    lower==='lo'||
    lower==='quit'||
    lower==='shutdown'
  ){
    jplopsoft_cmdWrite('Locking ExOS ...','info');
    jplopsoft_lock(true);
    return;
  }

  if(lower==='passwd'||lower==='pw'){
    jplopsoft_cmdChangePassword();
    return;
  }

  if(lower==='m'||lower==='math'||lower==='??'){
    jplopsoft_cmdMathEval('');
    return;
  }

  if(lower==='mr'||lower==='random'){
    jplopsoft_cmdRandomInt('');
    return;
  }

  if(lower==='ver'||lower==='winver'){
    jplopsoft_cmdWrite('ExOS CMD Mode 6.3','success');
    jplopsoft_cmdWrite('ExES V6 front-end encryption / PHP 4.3.11~8.x compatible');
    return;
  }

  if(lower==='cd\\'){
    state.currentFolder=0;
    state.selectedId=0;
    jplopsoft_renderAll();
    jplopsoft_cmdRefreshPrompt();
    return;
  }

  if(lower==='ls'||lower==='find'){
    jplopsoft_cmdDir();
    return;
  }

  if(lower==='pwd'||lower==='chdir'){
    jplopsoft_cmdWrite(jplopsoft_cmdPathText(state.currentFolder));
    return;
  }

  sp=parseInput.search(/\s/);
  cmd=sp<0?parseInput:parseInput.substring(0,sp);
  arg=sp<0?'':jplopsoft_trim(parseInput.substring(sp+1));
  lower=cmd.toLowerCase();

  if(lower==='echo'){
    jplopsoft_cmdEchoCommand(arg);
    return;
  }

  if(lower==='set'){
    jplopsoft_cmdSetCommand(arg);
    return;
  }

  if(lower==='tree'){
    jplopsoft_cmdTree(arg);
    return;
  }

  if(lower==='clip'){
    jplopsoft_cmdClipboard(arg);
    return;
  }

  if(lower==='whoami'){
    jplopsoft_cmdWhoAmI(arg);
    return;
  }

  if(lower==='ex'){
    jplopsoft_cmdExVault(arg);
    return;
  }

  if(lower==='ex_md3'){
    jplopsoft_cmdExMd3(arg);
    return;
  }

  if(lower==='pause'){
    jplopsoft_cmdPause(arg);
    return;
  }

  if(lower==='color'){
    jplopsoft_cmdColor(arg);
    return;
  }

  if(lower==='vol'){
    jplopsoft_cmdShowVolume(arg);
    return;
  }

  if(
    lower==='libs'||
    lower==='lib'||
    lower==='libraries'
  ){
    jplopsoft_cmdLibraries(arg);
    return;
  }

  if(lower==='message'||lower==='msgbox'){
    jplopsoft_cmdMessageBox(arg);
    return;
  }

  if(
    lower==='selftest'||
    lower==='compat'||
    lower==='servertest'
  ){
    if(arg!==''){
      jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
      jplopsoft_cmdWrite('Usage: SELFTEST');
      return;
    }
    jplopsoft_cmdServerSelfTest();
    return;
  }

  if(lower==='m'||lower==='math'||lower==='??'){
    jplopsoft_cmdMathEval(arg);
    return;
  }

  if(lower==='mr'||lower==='random'){
    jplopsoft_cmdRandomInt(arg);
    return;
  }

  if(
    lower==='chkdsk'||
    lower==='scandisk'||
    lower==='sfc'
  ){
    jplopsoft_cmdCheckDisk(arg);
    return;
  }

  if(
    lower==='exconfig'||lower==='msconfig'||
    lower==='exconfig.exe'||lower==='msconfig.exe'
  ){
    if(arg!==''){
      jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
      jplopsoft_cmdWrite('Usage: EXCONFIG');
      return;
    }
    jplopsoft_cmdWrite('Opening ExConfig ...','info');
    jplopsoft_openExconfig();
    return;
  }

  if(lower==='taskmgr'||lower==='taskmgr.exe'){
    if(arg!==''){jplopsoft_cmdWrite('Usage: TASKMGR','error');return;}
    jplopsoft_cmdWrite('Opening Task Manager ...','info');jplopsoft_openTaskManager(false);return;
  }

  if(lower==='regedit'||lower==='regedit.exe'){
    if(arg!==''){jplopsoft_cmdWrite('Usage: REGEDIT','error');return;}
    jplopsoft_cmdWrite('Opening Registry Editor ...','info');jplopsoft_openRegedit();return;
  }

  if(lower==='diskmgmt'||lower==='diskmgmt.msc'){
    if(arg!==''){jplopsoft_cmdWrite('Usage: DISKMGMT','error');return;}
    jplopsoft_cmdWrite('Opening Disk Management ...','info');jplopsoft_openDiskManager();return;
  }

  if(lower==='calc'||lower==='calc.exe'){
    if(arg!==''){jplopsoft_cmdWrite('Usage: CALC','error');return;}
    jplopsoft_cmdWrite('Opening Calculator ...','info');jplopsoft_openCalculator();return;
  }

  if(jplopsoft_cmdIsBlockedHostCommandName(lower)){
    jplopsoft_cmdBlockedCommand(cmd);
    return;
  }

  /*
   * Direct execution of .exe / .com / .bat is always forbidden.
   * Examples:
   *   test.exe
   *   test.com
   *   test.bat
   *   .\tools\test.bat
   *   "C:\My Tools\test.exe" /silent
   */
  if(jplopsoft_cmdBlockDirectExecutable(input)){
    return;
  }

  /* DOS-style CD\folder */
  if(lower.indexOf('cd\\')===0&&sp<0&&parseInput.length>3){
    arg=parseInput.substring(2);
    lower='cd';
  }

  if(lower==='cd'||lower==='chdir'||lower==='pwd'){
    if(!arg){
      jplopsoft_cmdWrite(jplopsoft_cmdPathText(state.currentFolder));
      return;
    }

    target=jplopsoft_cmdResolveFolder(arg);

    if(target===-2){
      /*
       * Resolve the protected component for a DOS-like access-denied response.
       * These folders exist only in CMD's C:\ virtual view.
       */
      var deniedPart=jplopsoft_cmdUnquote(arg).replace(/^c:/i,'').split(/[\\\/]+/);
      deniedPart=deniedPart[deniedPart.length-1]||arg;
      jplopsoft_cmdVirtualAccessDenied(deniedPart);
      return;
    }

    if(target<0&&!jplopsoft_cmdIsAuditFolderId(target)){
      jplopsoft_cmdWrite('The system cannot find the path specified.','error');
      return;
    }

    state.currentFolder=target;
    state.selectedId=0;
    jplopsoft_renderAll();
    jplopsoft_cmdRefreshPrompt();
    return;
  }

  if(lower==='md'||lower==='mkdir'){
    jplopsoft_cmdMakeDirectory(arg);
    return;
  }

  if(lower==='rd'||lower==='rmdir'||lower==='deltree'){
    arg=jplopsoft_cmdUnquote(arg);

    if(!arg){
      jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
      jplopsoft_cmdWrite('Usage: RD folder');
      return;
    }

    jplopsoft_cmdRemoveDirectory(arg);
    return;
  }

  if(lower==='ren'||lower==='rename'||lower==='mv'){
    jplopsoft_cmdRenameItem(arg);
    return;
  }

  if(
    lower==='copy'||
    lower==='xcopy'||
    lower==='cp'||
    lower==='robocopy'
  ){
    jplopsoft_cmdCopyItem(arg);
    return;
  }

  if(lower==='move'){
    jplopsoft_cmdMoveItem(arg);
    return;
  }

  if(lower==='dir'||lower==='ls'||lower==='find'){
    jplopsoft_cmdDirAdvanced(arg);
    return;
  }

  if(lower==='del'||lower==='delete'||lower==='erase'){
    arg=jplopsoft_cmdUnquote(arg);

    if(!arg){
      jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
      jplopsoft_cmdWrite('Usage: DEL filename or DEL *.ext');
      return;
    }

    /* Wildcard DEL supports relative and absolute source paths. */
    if(arg.indexOf('*')>=0||arg.indexOf('?')>=0){
      jplopsoft_cmdDeletePattern(arg);
      return;
    }

    n=jplopsoft_cmdResolveNode(arg);

    if(!n){
      if(jplopsoft_cmdReportLastPathDenied())return;
      jplopsoft_cmdWrite('Could Not Find '+arg,'error');
      return;
    }

    if(n.type!=='file'){
      jplopsoft_cmdWrite('Access is denied. DEL only accepts files.','error');
      return;
    }

    name=jplopsoft_decName(n)||arg;
    jplopsoft_cmdSoftDeleteIds(
      [n.id],
      '1 file(s) moved to Recycle Bin: '+name
    );
    return;
  }

  if(
    lower==='old'||
    lower==='filever'||
    lower==='fv'||
    lower==='ol'
  ){
    jplopsoft_cmdListFileVersions(arg);
    return;
  }

  if(lower==='touch'){
    jplopsoft_cmdTouchFile(arg);
    return;
  }

  if(
    lower==='edit'||
    lower==='e'||
    lower==='vi'||
    lower==='v'||
    lower==='vim'||
    lower==='word'||
    lower==='nano'
  ){
    jplopsoft_cmdEditFile(arg);
    return;
  }

  if(lower==='dl'||lower==='download'){
    jplopsoft_cmdDownloadFile(arg);
    return;
  }

  if(
    lower==='type'||
    lower==='cat'||
    lower==='less'||
    lower==='head'||
    lower==='tail'
  ){
    if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,jplopsoft_cmdUnquote(arg))){
      jplopsoft_cmdVirtualAccessDenied(jplopsoft_cmdUnquote(arg));
      return;
    }
    jplopsoft_cmdTypeFile(arg);
    return;
  }

  if(lower==='start'||lower==='notepad'){
    arg=jplopsoft_cmdUnquote(arg);

    if(lower==='start'&&(String(arg||'').toLowerCase()==='cmd'||String(arg||'').toLowerCase()==='cmd.exe')){
      jplopsoft_cmdWrite('CreateProcess: starting child cmd.exe ...','info');
      jplopsoft_cmdCreateInstance(undefined,jplopsoft_cmdExecutionId());
      return;
    }

    if(state.currentFolder===0&&jplopsoft_cmdIsVirtualSystemFolderAtRoot(0,arg)){
      jplopsoft_cmdVirtualAccessDenied(arg);
      return;
    }

    if(!arg){
      jplopsoft_cmdWrite('The syntax of the command is incorrect.','error');
      jplopsoft_cmdWrite('Usage: START filename');
      return;
    }

    n=jplopsoft_cmdResolveNode(arg);

    if(!n){
      if(jplopsoft_cmdReportLastPathDenied())return;
      jplopsoft_cmdWrite('The system cannot find the file specified.','error');
      return;
    }

    jplopsoft_cmdWrite('Opening '+(jplopsoft_decName(n)||arg)+' ...','info');
    jplopsoft_cmdStartNode(n);
    return;
  }

  jplopsoft_cmdWrite(
    "'"+cmd+"' is not recognized as an internal or external command.",
    'error'
  );
}
function jplopsoft_bindCmdMode(){
  var btn=jplopsoft_el('jplopsoft_cmdModeBtn');

  if(btn)btn.onclick=function(){
    if(!state.vaultKey){
      alert('請先登入 ExOS。');
      return;
    }
    jplopsoft_wmOpenCmd();
  };

  if(window.addEventListener){
    window.addEventListener('resize',function(){
      var k,c;
      for(k in jplopsoft_CMD_INSTANCES){
        if(!jplopsoft_CMD_INSTANCES.hasOwnProperty(k))continue;
        c=jplopsoft_CMD_INSTANCES[k];
        if(!c)continue;
        jplopsoft_cmdWithInstance(c.instanceId,function(){
          jplopsoft_cmdScheduleVisualCursor();
        });
      }
    },false);
  }
}

function jplopsoft_isDesktopFolder(){
  return parseInt(state.currentFolder,10)===jplopsoft_DESKTOP_FOLDER_ID;
}

/* -------------------------------------------------------------------------
 * Multi-instance TXT / CSV editors.
 * Each document owns its own window, state and taskbar button.
 * ---------------------------------------------------------------------- */
var jplopsoft_MULTI_EDITORS={};
var jplopsoft_MULTI_EDITOR_SEQ=0;

function jplopsoft_multiEditorKey(nodeId){return String(parseInt(nodeId,10)||0);}
function jplopsoft_multiEditorAppId(rec){return'editor_'+String(rec.fmt||'txt')+'_'+String(rec.nodeId||0);}
function jplopsoft_multiEditorWindowId(rec){return'jplopsoft_multiEditorWindow_'+String(rec.nodeId||0);}

function jplopsoft_multiEditorGet(nodeId){
  return jplopsoft_MULTI_EDITORS[jplopsoft_multiEditorKey(nodeId)]||null;
}

function jplopsoft_multiEditorMarkDirty(rec,dirty){
  var s;
  if(!rec)return;
  rec.dirty=!!dirty;
  s=jplopsoft_el(rec.statusId);
  if(s)s.textContent=(rec.dirty?'未儲存 ｜ ':'已儲存 ｜ ')+String(rec.name||'');
}

function jplopsoft_multiEditorCsvNormalize(rec){
  var rows=rec.data||[],r,max=0;
  if(!rows.length)rows=[['']];
  for(r=0;r<rows.length;r++){
    if(!rows[r])rows[r]=[];
    if(rows[r].length>max)max=rows[r].length;
  }
  if(max<1)max=1;
  if(rows.length<8)while(rows.length<8)rows.push([]);
  for(r=0;r<rows.length;r++)while(rows[r].length<max)rows[r].push('');
  rec.data=rows;
}

function jplopsoft_multiEditorCsvRender(rec){
  var wrap=jplopsoft_el(rec.bodyId),table,thead,tbody,tr,th,td,input,r,c,cols=0;
  if(!wrap)return;
  jplopsoft_multiEditorCsvNormalize(rec);
  for(r=0;r<rec.data.length;r++)if(rec.data[r].length>cols)cols=rec.data[r].length;
  if(cols<1)cols=1;

  wrap.innerHTML='';
  table=document.createElement('table');table.className='jplopsoft_multi-editor-csv';
  thead=document.createElement('thead');tr=document.createElement('tr');
  th=document.createElement('th');th.textContent='#';tr.appendChild(th);
  for(c=0;c<cols;c++){th=document.createElement('th');th.textContent=jplopsoft_csvColumnName(c);tr.appendChild(th);}
  thead.appendChild(tr);table.appendChild(thead);
  tbody=document.createElement('tbody');

  for(r=0;r<rec.data.length;r++){
    tr=document.createElement('tr');
    td=document.createElement('td');td.textContent=String(r+1);tr.appendChild(td);
    for(c=0;c<cols;c++){
      td=document.createElement('td');
      input=document.createElement('input');input.type='text';input.value=String(rec.data[r][c]||'');
      input.setAttribute('data-r',String(r));input.setAttribute('data-c',String(c));
      input.onfocus=function(){rec.selectedRow=parseInt(this.getAttribute('data-r'),10)||0;rec.selectedCol=parseInt(this.getAttribute('data-c'),10)||0;};
      input.oninput=function(){
        var rr=parseInt(this.getAttribute('data-r'),10)||0,cc=parseInt(this.getAttribute('data-c'),10)||0;
        if(!rec.data[rr])rec.data[rr]=[];
        rec.data[rr][cc]=this.value;
        rec.selectedRow=rr;rec.selectedCol=cc;
        jplopsoft_multiEditorMarkDirty(rec,true);
      };
      td.appendChild(input);tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);wrap.appendChild(table);
}

function jplopsoft_multiEditorCsvAddRow(rec){
  var cols=1,r;
  for(r=0;r<rec.data.length;r++)if(rec.data[r].length>cols)cols=rec.data[r].length;
  rec.data.push([]);
  while(rec.data[rec.data.length-1].length<cols)rec.data[rec.data.length-1].push('');
  rec.selectedRow=rec.data.length-1;
  jplopsoft_multiEditorCsvRender(rec);jplopsoft_multiEditorMarkDirty(rec,true);
}
function jplopsoft_multiEditorCsvAddCol(rec){
  var r;
  for(r=0;r<rec.data.length;r++)rec.data[r].push('');
  rec.selectedCol=(rec.data[0]?rec.data[0].length:1)-1;
  jplopsoft_multiEditorCsvRender(rec);jplopsoft_multiEditorMarkDirty(rec,true);
}
function jplopsoft_multiEditorCsvDeleteRow(rec){
  if(rec.data.length<=1){rec.data=[['']];}
  else rec.data.splice(Math.max(0,Math.min(rec.selectedRow,rec.data.length-1)),1);
  rec.selectedRow=0;jplopsoft_multiEditorCsvRender(rec);jplopsoft_multiEditorMarkDirty(rec,true);
}
function jplopsoft_multiEditorCsvDeleteCol(rec){
  var r,c=Math.max(0,rec.selectedCol);
  for(r=0;r<rec.data.length;r++){
    if(rec.data[r].length>1)rec.data[r].splice(Math.min(c,rec.data[r].length-1),1);
    else rec.data[r][0]='';
  }
  rec.selectedCol=0;jplopsoft_multiEditorCsvRender(rec);jplopsoft_multiEditorMarkDirty(rec,true);
}

function jplopsoft_multiEditorSource(rec){
  var t;
  if(rec.fmt==='csv')return jplopsoft_csvSerialize(rec.data,rec.hadBom);
  t=jplopsoft_el(rec.textId);
  return t?String(t.value||''):'';
}

function jplopsoft_multiEditorSave(rec){
  var src,plainSize,cipher;
  if(!rec)return;
  src=jplopsoft_multiEditorSource(rec);
  plainSize=jplopsoft_utf8ByteLength(src);
  if(plainSize>jplopsoft_TEXT_ONLINE_EDIT_MAX)return alert('線上編輯內容超過 18 MiB。');
  try{cipher=jplopsoft_encContent(src,jplopsoft_nodeFekById(rec.nodeId));}
  catch(e){return alert(e.message);}
  jplopsoft_saveNodeCipher(rec.nodeId,cipher,plainSize,function(err,out){
    if(err)return alert(err.message);
    jplopsoft_multiEditorMarkDirty(rec,false);
    jplopsoft_reloadNodes(function(){jplopsoft_setStatus('「'+rec.name+'」已保存為版本 v'+out.version_no+'。');});
  });
}

function jplopsoft_multiEditorClose(rec,force){
  if(!rec)return;
  if(rec.dirty&&!force&&!window.confirm('「'+rec.name+'」有尚未儲存的變更。確定關閉嗎？'))return;
  delete jplopsoft_MULTI_EDITORS[jplopsoft_multiEditorKey(rec.nodeId)];
  if(rec.hwnd)jplopsoft_DestroyWindow(rec.hwnd);
  else{
    if(jplopsoft_el(rec.windowId)&&jplopsoft_el(rec.windowId).parentNode)jplopsoft_el(rec.windowId).parentNode.removeChild(jplopsoft_el(rec.windowId));
    jplopsoft_taskbarRemoveApp(rec.appId);
  }
}

function jplopsoft_multiEditorCloseAll(force){
  var k,rec;
  for(k in jplopsoft_MULTI_EDITORS){
    if(jplopsoft_MULTI_EDITORS.hasOwnProperty(k)){
      rec=jplopsoft_MULTI_EDITORS[k];
      jplopsoft_multiEditorClose(rec,force===true);
    }
  }
}

function jplopsoft_multiEditorMinimize(rec){
  if(!rec)return;
  if(rec.hwnd)jplopsoft_ShowWindow(rec.hwnd,jplopsoft_SW_MINIMIZE);
  else jplopsoft_wmMinimize(rec.windowId,rec.appId);
}
function jplopsoft_multiEditorRestore(rec){
  if(!rec)return;
  if(rec.hwnd)jplopsoft_ShowWindow(rec.hwnd,jplopsoft_SW_RESTORE);
  else jplopsoft_wmRestore(rec.windowId,rec.appId);
}

function jplopsoft_multiEditorTaskbarClick(appId){
  var k,rec,btn,active;
  for(k in jplopsoft_MULTI_EDITORS){
    if(jplopsoft_MULTI_EDITORS.hasOwnProperty(k)){
      rec=jplopsoft_MULTI_EDITORS[k];
      if(rec.appId===appId){
        btn=jplopsoft_el(jplopsoft_taskbarAppId(appId));
        active=btn&&jplopsoft_wmClassHas(btn,'jplopsoft_active');
        if(active&&jplopsoft_wmIsDisplayed(rec.windowId))jplopsoft_multiEditorMinimize(rec);
        else jplopsoft_multiEditorRestore(rec);
        return true;
      }
    }
  }
  return false;
}

function jplopsoft_openTextCsvMultiEditor(nodeId,name,fmt,source){
  var key=jplopsoft_multiEditorKey(nodeId),existing=jplopsoft_MULTI_EDITORS[key],
      app=jplopsoft_el('jplopsoft_app')||document.querySelector('.jplopsoft_app'),
      task=jplopsoft_el('jplopsoft_taskbar'),rec,win,titlebar,icon,title,controls,b,toolbar,body,status,
      parsed,offset;

  if(existing){
    jplopsoft_multiEditorRestore(existing);
    return existing;
  }
  if(!app)return null;

  jplopsoft_MULTI_EDITOR_SEQ++;
  offset=(jplopsoft_MULTI_EDITOR_SEQ%8)*22;

  rec={
    nodeId:parseInt(nodeId,10)||0,
    name:String(name||('#'+nodeId)),
    fmt:String(fmt||'txt').toLowerCase(),
    dirty:false,
    selectedRow:0,selectedCol:0,
    windowId:'jplopsoft_multiEditorWindow_'+String(nodeId),
    titlebarId:'jplopsoft_multiEditorTitlebar_'+String(nodeId),
    bodyId:'jplopsoft_multiEditorBody_'+String(nodeId),
    statusId:'jplopsoft_multiEditorStatus_'+String(nodeId),
    textId:'jplopsoft_multiEditorText_'+String(nodeId)
  };
  rec.appId='editor_'+rec.fmt+'_'+String(rec.nodeId);

  if(rec.fmt==='csv'){
    try{
      parsed=jplopsoft_csvParse(source);
      rec.data=jplopsoft_csvEnsureGrid(parsed.rows,8,6);
      rec.hadBom=!!parsed.hadBom;
    }catch(e){
      alert(e.message);return null;
    }
  }

  rec.hwnd=jplopsoft_CreateWindowEx(
    jplopsoft_WS_EX_APPWINDOW,
    'ExOS.MultiEditor',
    (rec.fmt==='csv'?'CSV 試算表':'文字編輯器')+' - '+rec.name,
    jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,
    90+offset,70+offset,760,620,
    null,null,null,
    {
      windowId:rec.windowId,
      titlebarId:rec.titlebarId,
      clientId:'jplopsoft_win32Client_'+String(nodeId),
      appId:rec.appId,
      icon:rec.fmt,
      windowClass:'jplopsoft_multi-editor-window',
      taskbar:true,
      wndProc:function(hwnd,msg,wParam,lParam){
        if(msg===jplopsoft_WM_CLOSE){
          jplopsoft_multiEditorClose(rec,false);
          return 0;
        }
        return null;
      }
    }
  );

  if(!rec.hwnd)return null;
  win=jplopsoft_GetWindowElement(rec.hwnd);
  body=jplopsoft_GetClientElement(rec.hwnd);
  if(!win||!body){
    jplopsoft_DestroyWindow(rec.hwnd);
    return null;
  }

  /* From here down the application only draws its Client Area. */
  toolbar=document.createElement('div');toolbar.className='jplopsoft_multi-editor-toolbar';
  b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small jplopsoft_primary';b.type='button';
  b.innerHTML='<span class="jplopsoft_inline-svg" data-exfs-svg="save" data-exfs-svg-size="15"></span>儲存';
  b.onclick=function(){jplopsoft_multiEditorSave(rec);};toolbar.appendChild(b);

  if(rec.fmt==='csv'){
    b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.type='button';b.textContent='＋ 列';b.onclick=function(){jplopsoft_multiEditorCsvAddRow(rec);};toolbar.appendChild(b);
    b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.type='button';b.textContent='＋ 欄';b.onclick=function(){jplopsoft_multiEditorCsvAddCol(rec);};toolbar.appendChild(b);
    b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.type='button';b.textContent='－ 列';b.onclick=function(){jplopsoft_multiEditorCsvDeleteRow(rec);};toolbar.appendChild(b);
    b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.type='button';b.textContent='－ 欄';b.onclick=function(){jplopsoft_multiEditorCsvDeleteCol(rec);};toolbar.appendChild(b);
  }
  body.appendChild(toolbar);

  /* Client Area body.  user32 owns the surrounding frame/titlebar. */
  var content=document.createElement('div');
  content.id=rec.bodyId;
  content.className='jplopsoft_multi-editor-body';

  if(rec.fmt==='txt'){
    b=document.createElement('textarea');b.id=rec.textId;b.className='jplopsoft_multi-editor-text';b.spellcheck=true;b.value=String(source||'');
    b.oninput=function(){jplopsoft_multiEditorMarkDirty(rec,true);};content.appendChild(b);
  }else{
    content.className+=' jplopsoft_multi-editor-csv-wrap';
  }
  body.appendChild(content);

  status=document.createElement('div');status.id=rec.statusId;status.className='jplopsoft_multi-editor-status';status.textContent='已載入 ｜ '+rec.name;body.appendChild(status);

  jplopsoft_MULTI_EDITORS[key]=rec;

  if(rec.fmt==='csv')jplopsoft_multiEditorCsvRender(rec);

  jplopsoft_applySvgIcons(win);
  jplopsoft_ShowWindow(rec.hwnd,jplopsoft_SW_SHOW);
  if(rec.fmt==='txt')setTimeout(function(){var t=jplopsoft_el(rec.textId);if(t)t.focus();},0);
  return rec;
}

function jplopsoft_wmUpdateExplorerTitle(){
  var t=jplopsoft_el('jplopsoft_explorerWindowTitle'),n,name='我的電腦';
  if(!t)return;
  if(state.currentFolder===jplopsoft_DESKTOP_FOLDER_ID)name='桌面';
  else if(state.currentFolder){
    n=jplopsoft_findNode(state.currentFolder);
    if(n){
      try{name=jplopsoft_decName(n)||name;}catch(ignoreExplorerTitle){}
    }
  }
  t.textContent='檔案總管 - '+String(name||'我的電腦');
}


function jplopsoft_nodeSvgIconName(n,name){
  var fmt;
  if(!n)return'file';
  if(n.type==='folder')return'folder';
  if(n.type==='reparse_point')return'link';
  fmt=jplopsoft_fileFormatFromName(name||'');
  if(fmt==='txt')return'txt';
  if(fmt==='csv')return'csv';
  if(fmt==='html')return'html';
  return'file';
}

function jplopsoft_desktopSystemItems(){
  return[
    {key:'computer',name:'我的電腦',type:'系統資料夾',icon:'computer'},
    {key:'cmd',name:'指令模式',type:'應用程式',icon:'cmd'},
    {key:'trash',name:'資源回收桶',type:'系統資料夾',icon:'trash'}
  ];
}

function jplopsoft_openDesktopSystemItem(key){
  key=String(key||'');
  if(key==='computer'){jplopsoft_openMyComputer();return;}
  if(key==='cmd'){jplopsoft_wmOpenCmd();return;}
  if(key==='trash'){jplopsoft_openTrash();return;}
}

function jplopsoft_renderPhysicalDesktopShortcuts(){
  var host=document.querySelector?document.querySelector('.jplopsoft_desktop-icons'):null,
      old,i,list,item,n,b,icon,label,name,targetId;
  if(!host)return;

  old=host.querySelectorAll?host.querySelectorAll('[data-desktop-dynamic="1"]'):[];
  for(i=old.length-1;i>=0;i--)if(old[i]&&old[i].parentNode===host)host.removeChild(old[i]);

  list=jplopsoft_desktopShortcutEntries();
  for(i=0;i<list.length;i++){
    item=list[i];n=item.target;name=item.name;targetId=parseInt(item.target_node_id,10)||0;
    if(targetId<=0)continue;

    b=document.createElement('button');
    b.type='button';
    b.className='jplopsoft_desktop-icon jplopsoft_desktop-dynamic-shortcut';
    b.setAttribute('data-desktop-dynamic','1');
    b.setAttribute('data-desktop-shortcut-target',String(targetId));
    b.title=name;

    icon=document.createElement('span');
    icon.className='jplopsoft_desktop-icon-glyph';
    icon.setAttribute('data-exfs-svg',jplopsoft_nodeSvgIconName(n,name));
    icon.setAttribute('data-exfs-svg-size','46');
    b.appendChild(icon);

    label=document.createElement('span');
    label.textContent=name;
    b.appendChild(label);

    (function(id,node){
      node.ondblclick=function(e){
        e=e||window.event;
        if(e&&e.preventDefault)e.preventDefault();
        jplopsoft_openDesktopShortcut(id);
        return false;
      };
      node.oncontextmenu=function(e){
        jplopsoft_showDesktopShortcutContextMenu(e,id);
        return false;
      };
    })(targetId,b);

    host.appendChild(b);
  }
  jplopsoft_applySvgIcons(host);
}

function jplopsoft_renderDesktopSystemRows(body){
  var list=jplopsoft_desktopSystemItems(),i,item,tr,td,span;
  for(i=0;i<list.length;i++){
    item=list[i];
    tr=document.createElement('tr');
    tr.className='jplopsoft_item-row '+(state.desktopShellSelected===item.key?'jplopsoft_selected':'');
    tr.setAttribute('data-desktop-system-item',item.key);

    td=document.createElement('td');td.className='jplopsoft_checkcell';tr.appendChild(td);

    td=document.createElement('td');td.className='jplopsoft_namecell';
    span=document.createElement('span');
    span.className='jplopsoft_inline-svg';
    span.setAttribute('data-exfs-svg',item.icon);
    span.setAttribute('data-exfs-svg-size','18');
    td.appendChild(span);
    td.appendChild(document.createTextNode(item.name));
    tr.appendChild(td);

    td=document.createElement('td');td.textContent=item.type;tr.appendChild(td);
    td=document.createElement('td');td.className='jplopsoft_muted';td.textContent='—';tr.appendChild(td);
    td=document.createElement('td');td.className='jplopsoft_muted';td.textContent='—';tr.appendChild(td);

    (function(key,row){
      row.onclick=function(){
        state.desktopSelectedTargetId=0;
        state.desktopShellSelected=key;
        jplopsoft_refreshVisibleFileRowSelection();
      };
      row.ondblclick=function(e){
        e=e||window.event;
        if(e&&e.preventDefault)e.preventDefault();
        jplopsoft_openDesktopSystemItem(key);
        return false;
      };
    })(item.key,tr);

    body.appendChild(tr);
  }
  jplopsoft_applySvgIcons(body);
}

function jplopsoft_showDesktopSystemContextMenu(ev,key){
  var menu=jplopsoft_el('jplopsoft_exfsContextMenu');
  if(!menu)return;
  if(ev){
    if(ev.preventDefault)ev.preventDefault();
    if(ev.stopPropagation)ev.stopPropagation();
    ev.cancelBubble=true;
  }
  jplopsoft_hideExfsContextMenu();
  state.desktopSelectedTargetId=0;
  state.desktopShellSelected=String(key||'');
  jplopsoft_refreshVisibleFileRowSelection();
  menu.appendChild(jplopsoft_exfsContextMenuButton(
    '','開啟',function(){jplopsoft_openDesktopSystemItem(key);},false,false
  ));
  jplopsoft_exfsPositionContextMenu(
    menu,
    ev&&typeof ev.clientX==='number'?ev.clientX:0,
    ev&&typeof ev.clientY==='number'?ev.clientY:0
  );
}

function jplopsoft_renderAll(){
  jplopsoft_wmUpdateExplorerTitle();
  jplopsoft_uiStorageSave();
  jplopsoft_hideExfsContextMenu();

  if(state.checkedFolder!==state.currentFolder){
    state.checkedIds={};
    state.checkedFolder=state.currentFolder;
  }

  if(!jplopsoft_isDesktopFolder()){
    state.desktopSelectedTargetId=0;
  }

  jplopsoft_renderTree();
  jplopsoft_renderPhysicalDesktopShortcuts();
  jplopsoft_renderBreadcrumbs();
  jplopsoft_renderFiles();
  jplopsoft_updateLocationToolbarState();

  if(state.cmdMode)jplopsoft_cmdRefreshPrompt();
}

function jplopsoft_renderTree(){
  var box=jplopsoft_el('jplopsoft_folderTree'),
      desktopRow,desktop,
      rootRow,root,holder;

  box.innerHTML='';

  desktopRow=document.createElement('div');
  desktopRow.className='jplopsoft_tree-node-row';

  desktop=document.createElement('div');
  desktop.className='jplopsoft_tree-node '+(jplopsoft_isDesktopFolder()?'jplopsoft_active':'');
  desktop.textContent=jplopsoft_isIE11Browser()?'桌面':'🖥️ 桌面';
  desktop.setAttribute('data-tree-special','desktop');

  desktop.onclick=function(){
    jplopsoft_clearChecked();
    state.currentFolder=jplopsoft_DESKTOP_FOLDER_ID;
    state.selectedId=0;
    state.desktopSelectedTargetId=0;
    jplopsoft_renderAll();
  };

  desktopRow.appendChild(desktop);
  box.appendChild(desktopRow);

  var trashRow=document.createElement('div'),trashNode=document.createElement('div');
  trashRow.className='jplopsoft_tree-node-row';
  trashNode.className='jplopsoft_tree-node jplopsoft_tree-special-trash';
  trashNode.textContent=jplopsoft_isIE11Browser()?'資源回收桶':'🗑️ 資源回收桶';
  trashNode.setAttribute('data-tree-special','trash');
  trashNode.title='檢視、還原或永久刪除已移除的項目';
  trashNode.onclick=function(){
    jplopsoft_clearChecked();
    state.selectedId=0;
    state.desktopSelectedTargetId=0;
    jplopsoft_openTrash();
  };
  trashRow.appendChild(trashNode);
  box.appendChild(trashRow);

  rootRow=document.createElement('div');
  rootRow.className='jplopsoft_tree-node-row';

  root=document.createElement('div');
  root.className='jplopsoft_tree-node '+(state.currentFolder===0?'jplopsoft_active':'');
  root.textContent=jplopsoft_isIE11Browser()?'根目錄':'📁 根目錄';
  root.setAttribute('data-tree-folder-id','0');
  jplopsoft_bindTreeDropTarget(root,0);
  root.onclick=function(){
    state.currentFolder=0;
    state.selectedId=0;
    jplopsoft_renderAll();
  };

  rootRow.appendChild(root);
  box.appendChild(rootRow);

  holder=document.createElement('div');
  holder.className='jplopsoft_tree-children';
  box.appendChild(holder);
  jplopsoft_appendFolderChildren(holder,0);
}
function jplopsoft_appendFolderChildren(container,parent){
  var list=jplopsoft_sortTreeNodes(jplopsoft_childrenOf(parent)),i,n,row,d,ch,name;

  for(i=0;i<list.length;i++){
    if(list[i].type!=='folder')continue;

    n=list[i];
    name=jplopsoft_decName(n)||'[無法解密]';

    row=document.createElement('div');
    row.className='jplopsoft_tree-node-row';

    d=document.createElement('div');
    d.className='jplopsoft_tree-node '+(state.currentFolder===n.id?'jplopsoft_active':'');
    d.textContent=(jplopsoft_isIE11Browser()?'[資料夾] ':'📁 ')+name;
    d.setAttribute('data-tree-folder-id',n.id);
    jplopsoft_bindTreeDropTarget(d,n.id);

    (function(id,node){
      node.onclick=function(){
        state.currentFolder=id;
        state.selectedId=0;
        jplopsoft_renderAll();
      };
    })(n.id,d);

    row.appendChild(d);
    container.appendChild(row);

    ch=document.createElement('div');
    ch.className='jplopsoft_tree-children';
    container.appendChild(ch);
    jplopsoft_appendFolderChildren(ch,n.id);
  }
}
function jplopsoft_folderPath(id){var a=[],guard=0,n;while(id>0&&guard++<1000){n=jplopsoft_findNode(id);if(!n)break;a.unshift(n);id=n.parent_id;}return a;}
function jplopsoft_folderPathText(id){
  var p=jplopsoft_folderPath(id),a=['根目錄'],i,n;
  for(i=0;i<p.length;i++){
    n=jplopsoft_decName(p[i]);
    a.push(n===null?'[無法解密]':n);
  }
  return a.join(' / ');
}
function jplopsoft_searchResultIcon(name){
  var f=jplopsoft_fileFormatFromName(name);
  if(jplopsoft_isIE11Browser())return f==='html'?'[H]':(f==='txt'?'[T]':(f==='csv'?'[C]':(f==='image'?'[I]':'[F]')));return f==='html'?'📄':(f==='txt'?'📝':(f==='csv'?'📊':(f==='image'?'🖼️':'📦')));
}
function jplopsoft_hideFileSearch(){
  var p=jplopsoft_el('jplopsoft_fileSearchPanel');
  if(p)p.className='jplopsoft_search-panel jplopsoft_hidden';
  state.searchResults=[];
  state.searchActive=-1;
}
function jplopsoft_clearFileSearch(){
  var q=jplopsoft_el('jplopsoft_fileSearchInput');
  if(q)q.value='';
  jplopsoft_hideFileSearch();
}
function jplopsoft_locateSearchResult(id){
  var n=jplopsoft_findNode(id),rows,i,row;
  if(!n||n.type!=='file')return;
  jplopsoft_clearChecked();
  state.currentFolder=n.parent_id;
  state.selectedId=n.id;
  jplopsoft_renderAll();
  jplopsoft_hideFileSearch();
  jplopsoft_setStatus('已定位到「'+jplopsoft_htmlEscape(jplopsoft_decName(n)||('#'+n.id))+'」。');
  setTimeout(function(){
    rows=document.querySelectorAll('#jplopsoft_fileRows tr[data-node-id]');
    for(i=0;i<rows.length;i++){
      row=rows[i];
      if(parseInt(row.getAttribute('data-node-id'),10)===n.id){
        try{row.scrollIntoView({block:'center'});}catch(e){try{row.scrollIntoView();}catch(e2){}}
        break;
      }
    }
  },0);
}
function jplopsoft_renderFileSearch(query){
  var panel=jplopsoft_el('jplopsoft_fileSearchPanel'),q=jplopsoft_trim(String(query||'')).toLowerCase(),results=[],i,n,name,path,fmt,total,limit=100,row,meta,summary;
  if(!state.vaultKey||!q){jplopsoft_hideFileSearch();return;}
  for(i=0;i<state.nodes.length;i++){
    n=state.nodes[i];
    if(n.type!=='file')continue;
    name=jplopsoft_decName(n);
    if(name===null)continue;
    if(name.toLowerCase().indexOf(q)<0)continue;
    results.push({
      id:n.id,
      name:name,
      parent_id:n.parent_id,
      path:jplopsoft_folderPathText(n.parent_id),
      fmt:jplopsoft_fileFormatFromName(name)
    });
  }
  results.sort(function(a,b){
    var an=a.name.toLowerCase(),bn=b.name.toLowerCase();
    return an<bn?-1:(an>bn?1:(a.id-b.id));
  });
  total=results.length;
  state.searchResults=results.slice(0,limit);
  state.searchActive=state.searchResults.length?0:-1;
  panel.innerHTML='';
  panel.className='jplopsoft_search-panel';
  summary=document.createElement('div');
  summary.className='jplopsoft_search-summary';
  summary.textContent=total>limit?'找到 '+total+' 個檔案，顯示前 '+limit+' 個':'找到 '+total+' 個檔案';
  panel.appendChild(summary);
  if(!state.searchResults.length){
    row=document.createElement('div');
    row.className='jplopsoft_search-empty';
    row.textContent='找不到符合「'+query+'」的檔案。';
    panel.appendChild(row);
    return;
  }
  for(i=0;i<state.searchResults.length;i++){
    (function(item,index){
      row=document.createElement('div');
      row.className='jplopsoft_search-result'+(index===state.searchActive?' jplopsoft_active':'');
      row.setAttribute('data-search-index',index);
      row.innerHTML='<div class="jplopsoft_search-result-name">'+jplopsoft_searchResultIcon(item.name)+' '+jplopsoft_htmlEscape(item.name)+'</div>'+
        '<div class="jplopsoft_search-result-meta"><span>'+jplopsoft_htmlEscape(jplopsoft_fileTypeLabel({type:'file'},item.name))+'</span><span class="jplopsoft_search-result-path">'+(jplopsoft_isIE11Browser()?'路徑: ':'📁 ')+jplopsoft_htmlEscape(item.path)+'</span></div>';
      row.onclick=function(){jplopsoft_locateSearchResult(item.id);};
      row.ondblclick=function(){
        jplopsoft_locateSearchResult(item.id);
        var f=jplopsoft_fileFormatFromName(item.name),sn=jplopsoft_findNode(item.id);
        if(sn&&!jplopsoft_nodeOnlinePreviewable(sn,item.name)){
          alert(jplopsoft_nodeIsLargeFile(sn)?jplopsoft_largeFileDownloadOnlyMessage(item.name,sn.original_size):'此檔案超過線上預覽安全上限，只允許下載。');
        }else if(f!=='binary'){
          setTimeout(function(){jplopsoft_openNodeByAssociation(item.id);},0);
        }
      };
      panel.appendChild(row);
    })(state.searchResults[i],i);
  }
}
function jplopsoft_updateSearchActive(delta){
  var p=jplopsoft_el('jplopsoft_fileSearchPanel'),rows,index;
  if(!state.searchResults.length||p.className.indexOf('jplopsoft_hidden')>=0)return;
  index=state.searchActive+delta;
  if(index<0)index=state.searchResults.length-1;
  if(index>=state.searchResults.length)index=0;
  state.searchActive=index;
  rows=p.querySelectorAll('.jplopsoft_search-result');
  for(var i=0;i<rows.length;i++)rows[i].className='jplopsoft_search-result'+(i===index?' jplopsoft_active':'');
  if(rows[index])try{rows[index].scrollIntoView({block:'nearest'});}catch(e){}
}
function jplopsoft_bindFileSearch(){
  var input=jplopsoft_el('jplopsoft_fileSearchInput'),clear=jplopsoft_el('jplopsoft_fileSearchClear');
  input.oninput=function(){
    var v=this.value;
    if(state.searchTimer)clearTimeout(state.searchTimer);
    state.searchTimer=setTimeout(function(){jplopsoft_renderFileSearch(v);},120);
  };
  input.onkeydown=function(e){
    e=e||window.event;
    var k=e.keyCode||e.which;
    if(k===27){jplopsoft_clearFileSearch();return;}
    if(k===40){if(e.preventDefault)e.preventDefault();jplopsoft_updateSearchActive(1);return false;}
    if(k===38){if(e.preventDefault)e.preventDefault();jplopsoft_updateSearchActive(-1);return false;}
    if(k===13){
      if(state.searchActive>=0&&state.searchResults[state.searchActive]){
        if(e.preventDefault)e.preventDefault();
        jplopsoft_locateSearchResult(state.searchResults[state.searchActive].id);
        return false;
      }
    }
  };
  input.onfocus=function(){if(jplopsoft_trim(input.value))jplopsoft_renderFileSearch(input.value);};
  clear.onclick=function(){jplopsoft_clearFileSearch();input.focus();};
  document.addEventListener('click',function(e){
    var box=document.querySelector('.jplopsoft_searchbox');
    if(box&&e.target!==box&&!box.contains(e.target))jplopsoft_hideFileSearch();
  });
}

function jplopsoft_renderBreadcrumbs(){
  var b=jplopsoft_el('jplopsoft_breadcrumbs'),path,root,i,sep,s;

  b.innerHTML='';

  if(jplopsoft_isDesktopFolder()){
    root=document.createElement('span');
    root.className='jplopsoft_crumb jplopsoft_current';
    root.textContent='桌面';
    b.appendChild(root);
    return;
  }

  path=jplopsoft_folderPath(state.currentFolder);
  root=document.createElement('span');
  root.className='jplopsoft_crumb '+(path.length===0?'jplopsoft_current':'');
  root.textContent='根目錄';

  root.onclick=function(){
    if(state.currentFolder!==0){
      state.currentFolder=0;
      state.selectedId=0;
      jplopsoft_renderAll();
    }
  };

  b.appendChild(root);

  for(i=0;i<path.length;i++){
    sep=document.createElement('span');
    sep.textContent='›';
    b.appendChild(sep);

    s=document.createElement('span');
    s.className='jplopsoft_crumb '+(i===path.length-1?'jplopsoft_current':'');
    s.textContent=jplopsoft_decName(path[i])||'[無法解密]';

    if(i<path.length-1){
      (function(id,sp){
        sp.onclick=function(){
          state.currentFolder=id;
          state.selectedId=0;
          jplopsoft_renderAll();
        };
      })(path[i].id,s);
    }

    b.appendChild(s);
  }
}
function jplopsoft_hasDesktopShortcut(targetId){
  var id=parseInt(targetId,10)||0,i,s;

  if(id<=0)return false;

  for(i=0;i<state.desktopShortcuts.length;i++){
    s=state.desktopShortcuts[i];

    if((parseInt(s.target_node_id,10)||0)===id){
      return true;
    }
  }

  return false;
}

function jplopsoft_createDesktopShortcut(targetId){
  var id=parseInt(targetId,10)||0,
      n=jplopsoft_findNode(id),
      name;

  if(!n){
    alert('找不到捷徑目標。');
    return;
  }

  name=jplopsoft_decName(n)||('#'+id);

  jplopsoft_api(
    'desktop_shortcut_add',
    'POST',
    {target_id:id},
    true,
    function(err,out){
      if(err){
        alert(err.message);
        return;
      }

      jplopsoft_reloadNodes(function(){
        jplopsoft_setStatus(
          out&&out.created===false?
            '「'+jplopsoft_htmlEscape(name)+'」在桌面已經有捷徑。':
            '已在桌面建立「'+jplopsoft_htmlEscape(name)+'」捷徑。'
        );
      });
    }
  );
}

function jplopsoft_deleteDesktopShortcut(targetId){
  var id=parseInt(targetId,10)||0,
      n=jplopsoft_findNode(id),
      name=n?(jplopsoft_decName(n)||('#'+id)):('失效捷徑 #'+id);

  if(id<=0)return;

  if(!window.confirm(
    '要從桌面刪除「'+name+'」捷徑嗎？\n\n'+
    '只會刪除捷徑，不會刪除原始檔案或資料夾。'
  )){
    return;
  }

  jplopsoft_api(
    'desktop_shortcut_delete',
    'POST',
    {target_id:id},
    true,
    function(err){
      if(err){
        alert(err.message);
        return;
      }

      state.desktopSelectedTargetId=0;

      jplopsoft_reloadNodes(function(){
        jplopsoft_setStatus('已刪除桌面捷徑；原始項目沒有變更。');
      });
    }
  );
}

function jplopsoft_openDesktopShortcut(targetId){
  var id=parseInt(targetId,10)||0,
      n=jplopsoft_findNode(id);

  if(!n){
    alert(
      '這個捷徑的目標目前不存在，或目標位於垃圾桶。\n\n'+
      '你可以在桌面上按右鍵刪除這個失效捷徑。'
    );
    return;
  }

  if(n.type==='folder'){
    jplopsoft_clearChecked();
    state.desktopSelectedTargetId=0;
    state.currentFolder=n.id;
    state.selectedId=0;
    jplopsoft_renderAll();
    return;
  }

  jplopsoft_exfsContextOpenNode(n.id);
}

function jplopsoft_desktopShortcutEntries(){
  var out=[],i,s,id,n,name,fmt;

  for(i=0;i<state.desktopShortcuts.length;i++){
    s=state.desktopShortcuts[i]||{};
    id=parseInt(s.target_node_id,10)||0;

    if(id<=0)continue;

    n=jplopsoft_findNode(id);

    if(n){
      name=jplopsoft_decName(n)||('[無法解密] #'+id);
      fmt=n.type==='file'?jplopsoft_fileFormatFromName(name):'';
    }else{
      name='[失效捷徑] #'+id;
      fmt='';
    }

    out.push({
      target_node_id:id,
      target:n,
      name:name,
      fmt:fmt,
      created_at:String(s.created_at||'')
    });
  }

  return out;
}

function jplopsoft_sortDesktopShortcutEntries(list){
  var key=state.sortKey,dir=state.sortDir;

  list.sort(function(a,b){
    var c=0,at,bt,ar,br,asize,bsize;

    if(key==='name'){
      c=jplopsoft_compareText(a.name,b.name);
    }else if(key==='type'){
      ar=a.target?jplopsoft_fileTypeRank(a.target):99;
      br=b.target?jplopsoft_fileTypeRank(b.target):99;
      c=ar<br?-1:(ar>br?1:0);
    }else if(key==='size'){
      asize=a.target&&a.target.type==='file'?
        (parseInt(a.target.original_size,10)||0):-1;
      bsize=b.target&&b.target.type==='file'?
        (parseInt(b.target.original_size,10)||0):-1;
      c=asize<bsize?-1:(asize>bsize?1:0);
    }else if(key==='modified'){
      at=Date.parse(
        a.target?a.target.updated_at:a.created_at
      )||0;
      bt=Date.parse(
        b.target?b.target.updated_at:b.created_at
      )||0;
      c=at<bt?-1:(at>bt?1:0);
    }

    if(c===0)c=jplopsoft_compareText(a.name,b.name);

    if(c===0){
      c=a.target_node_id-b.target_node_id;
    }

    return c*dir;
  });

  return list;
}

function jplopsoft_nodeDisplayIcon(n,name){
  var fmt;

  if(jplopsoft_isIE11Browser()){
    if(!n)return '[!] ';
    if(n.type==='folder')return '[D] ';
    if(n.type==='reparse_point')return '[L] ';

    fmt=jplopsoft_fileFormatFromName(name);

    return fmt==='html'?'[H] ':
      (fmt==='txt'?'[T] ':
      (fmt==='csv'?'[C] ':
      (fmt==='image'?'[I] ':
      (fmt==='audio'?'[A] ':
      (fmt==='video'||fmt==='rawvideo'?'[V] ':'[B] ')))));
  }

  if(!n)return '⚠️ ';
  if(n.type==='folder')return '📁 ';
  if(n.type==='reparse_point')return '🔗 ';

  fmt=jplopsoft_fileFormatFromName(name);

  return fmt==='html'?'📄 ':
    (fmt==='txt'?'📝 ':
    (fmt==='csv'?'📊 ':
    (fmt==='image'?'🖼️ ':
    (fmt==='audio'?'🎵 ':
    (fmt==='video'||fmt==='rawvideo'?'🎬 ':'📦 ')))));
}

function jplopsoft_isWritableProfileFolder(folderId){
  var id=parseInt(folderId,10)||0,root=parseInt(state.profileRootId,10)||0,n,guard=0;
  if(id<=0||root<=0||id===parseInt(state.usersRootId,10))return false;
  while(id>0&&guard<100000){
    guard++;
    if(id===root)return true;
    n=jplopsoft_findNode(id);
    if(!n)return false;
    id=parseInt(n.parent_id,10)||0;
  }
  return false;
}

function jplopsoft_updateLocationToolbarState(){
  var desktop=jplopsoft_isDesktopFolder(),
      writable=!desktop&&jplopsoft_isWritableProfileFolder(state.currentFolder),
      ids=[
        'jplopsoft_newFolderBtn','jplopsoft_newHtmlBtn','jplopsoft_newTxtBtn','jplopsoft_newCsvBtn',
        'jplopsoft_uploadFileBtn','jplopsoft_downloadBtn','jplopsoft_renameBtn','jplopsoft_moveBtn'
      ],
      i,b,
      hint=jplopsoft_el('jplopsoft_mainToolbar')?
        jplopsoft_el('jplopsoft_mainToolbar').querySelector('.jplopsoft_upload-hint'):null;

  for(i=0;i<ids.length;i++){
    b=jplopsoft_el(ids[i]);
    if(b)b.disabled=desktop||(!writable&&(ids[i]==='jplopsoft_newFolderBtn'||ids[i]==='jplopsoft_newHtmlBtn'||ids[i]==='jplopsoft_newTxtBtn'||ids[i]==='jplopsoft_newCsvBtn'||ids[i]==='jplopsoft_uploadFileBtn'));
  }

  if(jplopsoft_el('jplopsoft_selectAllRows')){
    jplopsoft_el('jplopsoft_selectAllRows').disabled=desktop;
  }

  if(jplopsoft_el('jplopsoft_cmdModeBtn')){
    jplopsoft_el('jplopsoft_cmdModeBtn').disabled=!state.vaultKey||desktop;
    jplopsoft_el('jplopsoft_cmdModeBtn').title=desktop?
      '桌面是虛擬捷徑區域，沒有對應的 DOS 目錄。':'在 explorer.exe 下建立 cmd.exe 子程序';
  }

  if(hint){
    hint.textContent=desktop?
      '桌面只存放捷徑；請在一般檔案列表按右鍵建立捷徑':
      (writable?'可拖曳 HTML、純文字、圖片或 Binary 檔案上傳':'此位置唯讀；使用者只能寫入 C:\\Users\\'+state.samUsername+'\\');
  }

  jplopsoft_updateDeleteButton();
}

function jplopsoft_fmtDate(s){if(!s)return '';var d=new Date(s);return isNaN(d.getTime())?s:d.toLocaleString();}
function jplopsoft_checkedCount(){var c=0,k;for(k in state.checkedIds)if(state.checkedIds.hasOwnProperty(k)&&state.checkedIds[k])c++;return c;}
function jplopsoft_clearChecked(){state.checkedIds={};jplopsoft_updateDeleteButton();jplopsoft_updateSelectAllBox();}
function jplopsoft_isChecked(id){return !!state.checkedIds[String(id)];}
function jplopsoft_setChecked(id,on){id=String(id);if(on)state.checkedIds[id]=true;else delete state.checkedIds[id];jplopsoft_updateDeleteButton();jplopsoft_updateSelectAllBox();}
function jplopsoft_currentVisibleIds(){
  var a,out=[],i;

  if(jplopsoft_isDesktopFolder())return out;

  a=jplopsoft_sortFileNodes(jplopsoft_childrenOf(state.currentFolder));

  for(i=0;i<a.length;i++){
    out.push(a[i].id);
  }

  return out;
}

function jplopsoft_updateDeleteButton(){
  var b=jplopsoft_el('jplopsoft_deleteBtn'),
      m=jplopsoft_el('jplopsoft_moveBtn'),
      c=jplopsoft_checkedCount();

  if(jplopsoft_isDesktopFolder()){
    if(b){
      b.textContent=jplopsoft_isIE11Browser()?'刪除捷徑':'🗑️ 刪除捷徑';
      b.title='只刪除桌面捷徑，不會刪除原始項目';
      b.disabled=!state.desktopSelectedTargetId;
    }

    if(m){
      m.textContent=jplopsoft_isIE11Browser()?'移動到...':'📁 移動到…';
      m.title='桌面捷徑不能使用一般檔案移動功能';
      m.disabled=true;
    }

    return;
  }

  if(b){
    b.disabled=false;
    b.textContent=c>0?
      ((jplopsoft_isIE11Browser()?'移到垃圾桶 ':'🗑️ 移到垃圾桶 (')+(jplopsoft_isIE11Browser()?'('+c+')':c+')')):
      (jplopsoft_isIE11Browser()?'移到垃圾桶':'🗑️ 移到垃圾桶');
    b.title=c>0?
      '將已勾選的 '+c+' 個項目移到垃圾桶':
      '將目前選取的項目移到垃圾桶';
  }

  if(m){
    m.disabled=false;
    m.textContent=c>0?
      (jplopsoft_isIE11Browser()?('移動到... ('+c+')'):('📁 移動到… ('+c+')')):
      (jplopsoft_isIE11Browser()?'移動到...':'📁 移動到…');
    m.title=c>0?
      '移動已勾選的 '+c+' 個項目':
      '移動目前選取的項目';
  }
}
function jplopsoft_updateSelectAllBox(){var b=jplopsoft_el('jplopsoft_selectAllRows'),ids=jplopsoft_currentVisibleIds(),i,c=0;if(!b)return;for(i=0;i<ids.length;i++)if(jplopsoft_isChecked(ids[i]))c++;b.checked=ids.length>0&&c===ids.length;b.indeterminate=c>0&&c<ids.length;}
function jplopsoft_toggleAllVisible(on){var ids=jplopsoft_currentVisibleIds(),i;for(i=0;i<ids.length;i++){if(on)state.checkedIds[String(ids[i])]=true;else delete state.checkedIds[String(ids[i])];}jplopsoft_renderFiles();}
function jplopsoft_bindBulkSelection(){var b=jplopsoft_el('jplopsoft_selectAllRows');if(!b)return;b.onclick=function(e){e=e||window.event;if(e.stopPropagation)e.stopPropagation();e.cancelBubble=true;jplopsoft_toggleAllVisible(!!b.checked);};jplopsoft_updateDeleteButton();jplopsoft_updateSelectAllBox();}

function jplopsoft_dialogRowsTable(rows){
  var table=document.createElement('table'),tbody=document.createElement('tbody'),i,row,tr,th,td,note;
  table.className='jplopsoft_config-table';
  rows=rows&&typeof rows.length==='number'?rows:[];
  for(i=0;i<rows.length;i++){
    row=rows[i]||{};tr=document.createElement('tr');
    th=document.createElement('th');th.textContent=String(row.name||'');tr.appendChild(th);
    td=document.createElement('td');td.textContent=String(typeof row.value==='undefined'?'':row.value);tr.appendChild(td);
    note=document.createElement('td');note.className='jplopsoft_config-note';note.textContent=String(row.note||'');tr.appendChild(note);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

function jplopsoft_exconfigSetTab(name){
  var backdrop=jplopsoft_el('jplopsoft_exconfigBackdrop'),tabs,panes,i,t;
  if(!backdrop)return;
  name=String(name||'general');
  tabs=backdrop.getElementsByClassName('jplopsoft_exconfig-tab');
  for(i=0;i<tabs.length;i++){
    t=String(tabs[i].getAttribute('data-exconfig-tab')||'');
    tabs[i].className='jplopsoft_exconfig-tab'+(t===name?' jplopsoft_active':'');
  }
  panes=backdrop.getElementsByClassName('jplopsoft_config-pane');
  for(i=0;i<panes.length;i++){
    t=String(panes[i].getAttribute('data-exconfig-pane')||'');
    panes[i].className='jplopsoft_config-pane'+(t===name?' jplopsoft_active':'');
  }
}

function jplopsoft_renderExconfig(out){
  var body=jplopsoft_el('jplopsoft_exconfigBody'),cfg=out&&out.config?out.config:{},names=['general','php','exfs','environment'],labels=['一般','PHP','ExFS','環境'],i,pane,summary,rows;
  if(!body)return;
  body.innerHTML='';
  state.exconfigData=cfg;
  for(i=0;i<names.length;i++){
    pane=document.createElement('div');pane.className='jplopsoft_config-pane'+(i===0?' jplopsoft_active':'');pane.setAttribute('data-exconfig-pane',names[i]);
    if(i===0){
      summary=document.createElement('div');summary.className='jplopsoft_config-summary';summary.textContent='ExConfig 是 ExFS 的唯讀系統設定檢視器，類似 ExOS msconfig。顯示目前 PHP / Web Server / ExFS 實際執行環境，不修改主機 php.ini 或作業系統設定。';pane.appendChild(summary);
    }
    rows=cfg[names[i]]||[];
    pane.appendChild(jplopsoft_dialogRowsTable(rows));
    body.appendChild(pane);
  }
  jplopsoft_exconfigSetTab('general');
  if(jplopsoft_el('jplopsoft_exconfigStatus'))jplopsoft_el('jplopsoft_exconfigStatus').textContent='PHP '+String(cfg.php_version||'')+' / Chunk '+jplopsoft_formatFileSize(cfg.chunk_max||0);
}

function jplopsoft_loadExconfig(){
  var body=jplopsoft_el('jplopsoft_exconfigBody');
  if(body)body.innerHTML='<div class="jplopsoft_config-loading">正在讀取系統設定…</div>';
  jplopsoft_api('system_config','GET',null,true,function(err,out){
    if(err){
      if(body){body.innerHTML='';var d=document.createElement('div');d.className='jplopsoft_config-summary';d.textContent='ExConfig 讀取失敗：'+err.message;body.appendChild(d);}
      return;
    }
    jplopsoft_renderExconfig(out);
  });
}

function jplopsoft_openExconfig(){
  var b=jplopsoft_el('jplopsoft_exconfigBackdrop');
  if(!b)return;
  b.style.display='flex';
  jplopsoft_taskbarOpenControlApp();
  jplopsoft_loadExconfig();
}

function jplopsoft_closeExconfig(){
  var b=jplopsoft_el('jplopsoft_exconfigBackdrop');
  if(b)b.style.display='none';
  jplopsoft_taskbarCloseControlApp();
}

function jplopsoft_bindExconfig(){
  var b=jplopsoft_el('jplopsoft_exconfigBackdrop'),tabs,i;
  if(!b)return;
  if(jplopsoft_el('jplopsoft_exconfigCloseTop'))jplopsoft_el('jplopsoft_exconfigCloseTop').onclick=jplopsoft_closeExconfig;
  if(jplopsoft_el('jplopsoft_exconfigCloseBtn'))jplopsoft_el('jplopsoft_exconfigCloseBtn').onclick=jplopsoft_closeExconfig;
  if(jplopsoft_el('jplopsoft_exconfigRefreshBtn'))jplopsoft_el('jplopsoft_exconfigRefreshBtn').onclick=jplopsoft_loadExconfig;
  if(jplopsoft_el('jplopsoft_controlDiskMgmtBtn'))jplopsoft_el('jplopsoft_controlDiskMgmtBtn').onclick=function(e){
    e=e||window.event;
    if(e&&e.preventDefault)e.preventDefault();
    if(e&&e.stopPropagation)e.stopPropagation();
    if(e)e.cancelBubble=true;
    jplopsoft_openDiskManager();
    return false;
  };
  b.onclick=function(e){
    e=e||window.event;
    return false;
  };
  tabs=b.getElementsByClassName('jplopsoft_exconfig-tab');
  for(i=0;i<tabs.length;i++)(function(tab){tab.onclick=function(){jplopsoft_exconfigSetTab(tab.getAttribute('data-exconfig-tab'));};})(tabs[i]);
}

function jplopsoft_propertiesSetTab(name){
  var b=jplopsoft_el('jplopsoft_propertiesBackdrop'),tabs,panes,i,t;
  if(!b)return;
  name=String(name||'general');
  tabs=b.getElementsByClassName('jplopsoft_properties-tab');
  for(i=0;i<tabs.length;i++){
    t=String(tabs[i].getAttribute('data-properties-tab')||'');
    tabs[i].className='jplopsoft_properties-tab'+(t===name?' jplopsoft_active':'');
  }
  panes=[jplopsoft_el('jplopsoft_propertiesGeneral'),jplopsoft_el('jplopsoft_propertiesSecurity'),jplopsoft_el('jplopsoft_propertiesDetails')];
  for(i=0;i<panes.length;i++)if(panes[i])panes[i].className='jplopsoft_config-pane'+((name==='general'&&i===0)||(name==='security'&&i===1)||(name==='details'&&i===2)?' jplopsoft_active':'');
}

function jplopsoft_propertiesGrid(rows){
  var grid=document.createElement('div'),i,r,l,v;
  grid.className='jplopsoft_properties-grid';
  rows=rows||[];
  for(i=0;i<rows.length;i++){
    r=rows[i]||[];l=document.createElement('div');l.className='jplopsoft_properties-label';l.textContent=String(r[0]||'');grid.appendChild(l);
    v=document.createElement('div');v.className='jplopsoft_properties-value';v.textContent=String(typeof r[1]==='undefined'?'':r[1]);grid.appendChild(v);
  }
  return grid;
}

function jplopsoft_propertiesSection(title,rows){
  var section=document.createElement('div'),h=document.createElement('div');
  section.className='jplopsoft_properties-section';h.className='jplopsoft_properties-section-title';h.textContent=title;section.appendChild(h);section.appendChild(jplopsoft_propertiesGrid(rows));return section;
}

function jplopsoft_propertiesTypeText(n,name){
  var ext='';
  if(!n)return '';
  if(n.type==='folder')return '資料夾';
  if(n.type==='reparse_point')return '重新解析點 ('+String(n.reparse_tag||'SYMLINK')+')';
  ext=jplopsoft_fileExtension(name||'');
  return ext?String(ext).toUpperCase()+' 檔案':'檔案';
}

function jplopsoft_propertiesAttributes(n){
  var a=[];
  if(!n)return '';
  a.push('Encrypted');
  if(n.has_motw)a.push('Mark of the Web');
  if(n.large_file)a.push('Large/Chunked');
  if(n.has_thumbnail)a.push('Thumbnail');
  if(n.ads_names&&n.ads_names.length)a.push('ADS:'+n.ads_names.length);
  if(n.type==='reparse_point')a.push('Reparse');
  return a.join(', ');
}

function jplopsoft_renderPropertiesGeneral(n){
  var box=jplopsoft_el('jplopsoft_propertiesGeneral'),name,parentPath,sizeText,cipherText;
  if(!box||!n)return;
  box.innerHTML='';name=jplopsoft_decName(n)||('[無法解密] #'+n.id);parentPath=jplopsoft_cmdPathText(parseInt(n.parent_id,10)||0);
  sizeText=n.type==='file'?jplopsoft_formatFileSize(n.original_size||0)+' ('+String(parseInt(n.original_size,10)||0)+' bytes)':'—';
  cipherText=n.type==='file'?jplopsoft_formatFileSize(n.cipher_size||0)+' ('+String(parseInt(n.cipher_size,10)||0)+' bytes)':'—';
  box.appendChild(jplopsoft_propertiesSection('一般',[
    ['名稱',name],['類型',jplopsoft_propertiesTypeText(n,name)],['位置',parentPath],['大小',sizeText],['加密資料大小',cipherText],['建立時間',jplopsoft_fmtDate(n.created_at)],['修改時間',jplopsoft_fmtDate(n.updated_at)],['屬性',jplopsoft_propertiesAttributes(n)]
  ]));
}

function jplopsoft_propertiesMaskText(mask,hex){
  var n=parseInt(mask,10)||0,a=[],r=[[1,'READ_DATA'],[2,'WRITE_DATA'],[4,'ADD_SUBDIR'],[128,'READ_ATTR'],[256,'WRITE_ATTR'],[65536,'DELETE'],[131072,'READ_CONTROL'],[262144,'WRITE_DAC'],[524288,'WRITE_OWNER']],i;
  for(i=0;i<r.length;i++)if((n&r[i][0])===r[i][0])a.push(r[i][1]);
  return String(hex||('0x'+('00000000'+n.toString(16).toUpperCase()).slice(-8)))+(a.length?' / '+a.join(', '):'');
}

function jplopsoft_renderPropertiesSecurity(out){
  var box=jplopsoft_el('jplopsoft_propertiesSecurity'),rows,dacl,table,thead,tr,th,tbody,i,r,td,saclNote;
  if(!box)return;box.innerHTML='';
  if(!out){box.appendChild(jplopsoft_propertiesSection('安全性',[['狀態','正在讀取安全性描述元…']]));return;}
  rows=[['Security ID',out.security_id||0],['擁有者',String(out.owner_name||'')+' ('+String(out.owner_sid||'')+')'],['主要群組',String(out.group_name||'')+' ('+String(out.group_sid||'')+')'],['完整性層級',String(out.integrity_level||'MEDIUM')]];
  box.appendChild(jplopsoft_propertiesSection('安全性描述元',rows));
  dacl=out.dacl_rows||[];
  var sec=document.createElement('div'),title=document.createElement('div');sec.className='jplopsoft_properties-section';title.className='jplopsoft_properties-section-title';title.textContent='權限項目 (DACL)';sec.appendChild(title);
  table=document.createElement('table');table.className='jplopsoft_properties-security-table';thead=document.createElement('thead');tr=document.createElement('tr');
  var headers=['類型','主體','SID','權限','繼承'],hi;for(hi=0;hi<headers.length;hi++){th=document.createElement('th');th.textContent=headers[hi];tr.appendChild(th);}thead.appendChild(tr);table.appendChild(thead);tbody=document.createElement('tbody');
  if(!dacl.length){tr=document.createElement('tr');td=document.createElement('td');td.colSpan=5;td.textContent='沒有 DACL 項目。';tr.appendChild(td);tbody.appendChild(tr);}else{
    for(i=0;i<dacl.length;i++){r=dacl[i]||{};tr=document.createElement('tr');
      td=document.createElement('td');td.textContent=String(r.ace_type||'ALLOW');tr.appendChild(td);
      td=document.createElement('td');td.textContent=String(r.principal_name||r.sid||'');tr.appendChild(td);
      td=document.createElement('td');td.textContent=String(r.sid||'');tr.appendChild(td);
      td=document.createElement('td');td.textContent=jplopsoft_propertiesMaskText(r.access_mask,r.access_mask_hex);tr.appendChild(td);
      td=document.createElement('td');td.textContent=parseInt(r.inherited,10)===1?'是':'否';tr.appendChild(td);tbody.appendChild(tr);
    }
  }
  table.appendChild(tbody);sec.appendChild(table);saclNote=document.createElement('div');saclNote.className='jplopsoft_properties-security-note';saclNote.textContent='SACL 稽核項目：'+String((out.sacl_rows||[]).length)+'。此頁目前為唯讀檢視；權限變更仍由 ExFS Security API 控制。';sec.appendChild(saclNote);box.appendChild(sec);
}

function jplopsoft_renderPropertiesDetails(n){
  var box=jplopsoft_el('jplopsoft_propertiesDetails'),name,ext,ads,fullPath;
  if(!box||!n)return;box.innerHTML='';name=jplopsoft_decName(n)||('[無法解密] #'+n.id);ext=jplopsoft_fileExtension(name||'');ads=n.ads_names&&n.ads_names.length?n.ads_names.join(', '):'—';fullPath=jplopsoft_cmdNodeFullPath(n);
  box.appendChild(jplopsoft_propertiesSection('物件',[
    ['Node ID',n.id],['Parent ID',n.parent_id],['虛擬路徑',fullPath],['Node type',n.type],['副檔名',ext||'—'],['Security ID',n.security_id||0],['Owner SID',n.owner_sid||''],['Group SID',n.group_sid||''],['Integrity',n.integrity_level||'MEDIUM']
  ]));
  box.appendChild(jplopsoft_propertiesSection('儲存 / 加密',[
    ['Storage mode',n.storage_mode||''],['Storage path',n.storage_path||'—'],['Cipher size',n.cipher_size||0],['Original size',n.original_size||0],['Block size',n.block_size||0],['Block count',n.block_count||0],['Large file',n.large_file?'Yes':'No'],['EFS format',n.efs_format||'—'],['FEK bits',n.fek_bits||0],['DDF count',n.ddf_count||0]
  ]));
  box.appendChild(jplopsoft_propertiesSection('NT / 擴充資訊',[
    ['ADS',ads],['Mark of the Web',n.has_motw?'Yes':'No'],['Reparse target',n.reparse_target||0],['Reparse tag',n.reparse_tag||'—'],['NT role',n.nt_role||'—'],['Profile user',n.profile_username||'—'],['Thumbnail',n.has_thumbnail?(String(n.thumbnail_width||128)+'x'+String(n.thumbnail_height||128)+' / '+String(n.thumbnail_mode||'')):'No']
  ]));
}

function jplopsoft_openProperties(id){
  var n=jplopsoft_findNode(parseInt(id,10)||0),b,name,icon;
  if(!n)return;
  state.propertiesNodeId=n.id;name=jplopsoft_decName(n)||('[無法解密] #'+n.id);b=jplopsoft_el('jplopsoft_propertiesBackdrop');if(!b)return;
  icon=n.type==='folder'?'folder':(n.type==='reparse_point'?'link':'file');
  jplopsoft_svgIconApply(jplopsoft_el('jplopsoft_propertiesIcon'),icon,34);
  jplopsoft_el('jplopsoft_propertiesTitle').textContent=name+' - 內容';
  jplopsoft_el('jplopsoft_propertiesSubtitle').textContent=jplopsoft_propertiesTypeText(n,name)+' / Node '+String(n.id);
  jplopsoft_renderPropertiesGeneral(n);jplopsoft_renderPropertiesDetails(n);jplopsoft_renderPropertiesSecurity(null);jplopsoft_propertiesSetTab('general');b.style.display='flex';
  jplopsoft_wmActivateOverlay('jplopsoft_propertiesBackdrop','jplopsoft_propertiesWindow','properties');
  jplopsoft_api('security_get','POST',{id:n.id},true,function(err,out){
    if(state.propertiesNodeId!==n.id)return;
    if(err){var box=jplopsoft_el('jplopsoft_propertiesSecurity');if(box){box.innerHTML='';box.appendChild(jplopsoft_propertiesSection('安全性',[['狀態','無法讀取：'+err.message]]));}return;}
    jplopsoft_renderPropertiesSecurity(out);
  });
}

function jplopsoft_closeProperties(){var b=jplopsoft_el('jplopsoft_propertiesBackdrop');if(b)b.style.display='none';state.propertiesNodeId=0;}

function jplopsoft_bindProperties(){
  var b=jplopsoft_el('jplopsoft_propertiesBackdrop'),w=jplopsoft_el('jplopsoft_propertiesWindow'),tabs,i;
  if(!b)return;
  if(jplopsoft_el('jplopsoft_propertiesCloseTop'))jplopsoft_el('jplopsoft_propertiesCloseTop').onclick=jplopsoft_closeProperties;
  if(jplopsoft_el('jplopsoft_propertiesCloseBtn'))jplopsoft_el('jplopsoft_propertiesCloseBtn').onclick=jplopsoft_closeProperties;
  if(w){
    w.onmousedown=function(){jplopsoft_wmActivateOverlay('jplopsoft_propertiesBackdrop','jplopsoft_propertiesWindow','properties');};
    jplopsoft_wmMakeDraggable('jplopsoft_propertiesWindow','jplopsoft_propertiesTitlebar');
  }
  b.onclick=function(e){if(e.target!==b)jplopsoft_wmActivateOverlay('jplopsoft_propertiesBackdrop','jplopsoft_propertiesWindow','properties');};
  tabs=b.getElementsByClassName('jplopsoft_properties-tab');for(i=0;i<tabs.length;i++)(function(tab){tab.onclick=function(){jplopsoft_propertiesSetTab(tab.getAttribute('data-properties-tab'));};})(tabs[i]);
}

function jplopsoft_hideExfsContextMenu(){
  var menu=jplopsoft_el('jplopsoft_exfsContextMenu');

  state.contextNodeId=0;

  if(menu){
    menu.className='jplopsoft_exfs-context-menu jplopsoft_hidden';
    menu.innerHTML='';
  }
}

function jplopsoft_exfsContextMenuButton(icon,label,handler,disabled,danger){
  var b=document.createElement('button'),
      i=document.createElement('span'),
      s=document.createElement('span');

  b.type='button';
  b.setAttribute('role','menuitem');
  b.disabled=!!disabled;
  b.className=danger?'jplopsoft_danger':'';

  i.className='jplopsoft_exfs-context-icon';
  i.textContent=jplopsoft_isIE11Browser()?'':(icon||'');

  s.className='jplopsoft_exfs-context-label';
  s.textContent=label||'';

  b.appendChild(i);
  b.appendChild(s);

  if(!disabled&&handler){
    b.onclick=function(ev){
      ev=ev||window.event;

      if(ev.preventDefault)ev.preventDefault();
      if(ev.stopPropagation)ev.stopPropagation();
      ev.cancelBubble=true;

      jplopsoft_hideExfsContextMenu();
      handler();

      return false;
    };
  }

  return b;
}

function jplopsoft_exfsContextMenuSeparator(menu){
  var s=document.createElement('div');
  s.className='jplopsoft_exfs-context-sep';
  s.setAttribute('role','separator');
  menu.appendChild(s);
}

function jplopsoft_exfsPositionContextMenu(menu,x,y){
  var margin=8,w,h,maxX,maxY;

  x=parseInt(x,10)||0;
  y=parseInt(y,10)||0;

  menu.style.left='0px';
  menu.style.top='0px';
  menu.className='jplopsoft_exfs-context-menu';

  w=menu.offsetWidth||218;
  h=menu.offsetHeight||100;

  maxX=Math.max(
    margin,
    (window.innerWidth||document.documentElement.clientWidth||800)-
    w-
    margin
  );

  maxY=Math.max(
    margin,
    (window.innerHeight||document.documentElement.clientHeight||600)-
    h-
    margin
  );

  if(x<margin)x=margin;
  if(y<margin)y=margin;
  if(x>maxX)x=maxX;
  if(y>maxY)y=maxY;

  menu.style.left=x+'px';
  menu.style.top=y+'px';
}

function jplopsoft_exfsContextSelectSingle(id){
  id=parseInt(id,10)||0;

  state.checkedIds={};
  state.selectedId=id;
  state.contextNodeId=id;

  jplopsoft_renderFiles();
}

function jplopsoft_exfsContextOpenNode(id){
  var link=jplopsoft_findNode(id),n=jplopsoft_resolveClientNode(link),name,fmt;

  if(!link)return;
  if(!n)return alert('重新導向點的目標不存在或形成循環。');

  if(n.type==='folder'){
    jplopsoft_clearChecked();
    state.currentFolder=n.id;
    state.selectedId=0;
    jplopsoft_renderAll();
    return;
  }

  name=jplopsoft_decName(n)||'';
  fmt=jplopsoft_fileFormatFromName(name);

  if(jplopsoft_nodeIsLargeFile(n)){
    alert(jplopsoft_largeFileDownloadOnlyMessage(name,n.original_size));
    return;
  }
  if(fmt==='binary'){
    alert('此 Binary 檔案沒有可直接開啟的預覽；請使用「下載」。');
    return;
  }

  jplopsoft_openNodeByAssociation(n.id);
}

function jplopsoft_exfsContextPreviewNode(id){
  var n=jplopsoft_resolveClientNode(id),name,fmt;

  if(!n||n.type!=='file')return;

  name=jplopsoft_decName(n)||'';
  fmt=jplopsoft_fileFormatFromName(name);

  if(jplopsoft_nodeIsLargeFile(n)){
    alert(jplopsoft_largeFileDownloadOnlyMessage(name,n.original_size));
    return;
  }
  if(fmt==='binary'){
    alert('此 Binary 檔案不提供內容預覽。');
    return;
  }

  jplopsoft_openView(n.id);
}

function jplopsoft_exfsContextEditNode(id){
  var n=jplopsoft_resolveClientNode(id),name,fmt;

  if(!n||n.type!=='file')return;

  name=jplopsoft_decName(n)||'';
  fmt=jplopsoft_fileFormatFromName(name);

  if(n.has_motw){
    alert('此檔案包含 Zone.Identifier (Mark of the Web)，目前只能先以 Low Integrity 檢視器開啟。');
    return;
  }
  if(jplopsoft_nodeIsLargeFile(n)){
    alert(jplopsoft_largeFileDownloadOnlyMessage(name,n.original_size));
    return;
  }
  if(!jplopsoft_nodeOnlineEditable(n,name)){
    alert('此檔案超過 18 MiB 線上編輯上限，只允許下載。');
    return;
  }
  if(fmt!=='html'&&fmt!=='txt'&&fmt!=='csv'){
    alert('此檔案類型不可編輯。');
    return;
  }

  jplopsoft_openEditor(n.id);
}

function jplopsoft_exfsContextOpenFolderCmd(id){
  if(id===0){
    jplopsoft_openFolderInCmd(0);
    return;
  }

  var n=jplopsoft_resolveClientNode(id);
  if(!n||n.type!=='folder')return;
  jplopsoft_openFolderInCmd(n.id);
}

function jplopsoft_showExfsTreeFolderContextMenu(ev,id){
  var menu=jplopsoft_el('jplopsoft_exfsContextMenu'),
      n=id===0?null:jplopsoft_findNode(id),
      isRoot=(id===0),
      name=isRoot?'根目錄':(n?(jplopsoft_decName(n)||('[無法解密] #'+n.id)):''),
      canEditMeta=!isRoot&&!!n;

  if(!menu)return;
  if(!isRoot&&!n)return;

  if(ev){
    if(ev.preventDefault)ev.preventDefault();
    if(ev.stopPropagation)ev.stopPropagation();
    ev.cancelBubble=true;
  }

  jplopsoft_hideExfsContextMenu();

  state.checkedIds={};
  state.selectedId=isRoot?0:(n?n.id:0);
  state.contextNodeId=state.selectedId;
  jplopsoft_renderFiles();

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📂',
      '開啟',
      function(){
        state.currentFolder=id;
        state.selectedId=0;
        jplopsoft_renderAll();
      },
      false,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '⌨️',
      'CMD 模式',
      function(){
        jplopsoft_exfsContextOpenFolderCmd(id);
      },
      false,
      false
    )
  );

  if(!isRoot){
    jplopsoft_exfsContextMenuSeparator(menu);

    menu.appendChild(
      jplopsoft_exfsContextMenuButton(
        '🏷️',
        '重新命名',
        function(){
          state.selectedId=n.id;
          state.checkedIds={};
          jplopsoft_renameSelected();
        },
        !canEditMeta,
        false
      )
    );

    menu.appendChild(
      jplopsoft_exfsContextMenuButton(
        '📁',
        '移動到…',
        function(){
          state.selectedId=n.id;
          state.checkedIds={};
          jplopsoft_openMoveDialog();
        },
        !canEditMeta,
        false
      )
    );

    jplopsoft_exfsContextMenuSeparator(menu);

    menu.appendChild(
      jplopsoft_exfsContextMenuButton(
        '🗑️',
        '刪除',
        function(){
          state.selectedId=n.id;
          state.checkedIds={};
          jplopsoft_deleteSelected();
        },
        !canEditMeta,
        true
      )
    );

    jplopsoft_exfsContextMenuSeparator(menu);
    menu.appendChild(
      jplopsoft_exfsContextMenuButton(
        'ℹ️',
        '內容',
        function(){jplopsoft_openProperties(n.id);},
        false,
        false
      )
    );
  }

  jplopsoft_exfsPositionContextMenu(
    menu,
    ev&&typeof ev.clientX==='number'?ev.clientX:0,
    ev&&typeof ev.clientY==='number'?ev.clientY:0
  );
}

function jplopsoft_exfsContextFindTreeFolderNode(target,panel){
  var cur=target;

  while(cur&&cur!==panel){
    if(
      cur.nodeType===1&&
      typeof cur.getAttribute==='function'&&
      cur.getAttribute('data-tree-folder-id')!==null
    ){
      return cur;
    }

    cur=cur.parentNode;
  }

  return null;
}

function jplopsoft_showDesktopShortcutContextMenu(ev,targetId){
  var menu=jplopsoft_el('jplopsoft_exfsContextMenu'),
      id=parseInt(targetId,10)||0,
      n=jplopsoft_findNode(id);

  if(!menu||id<=0)return;

  if(ev){
    if(ev.preventDefault)ev.preventDefault();
    if(ev.stopPropagation)ev.stopPropagation();
    ev.cancelBubble=true;
  }

  jplopsoft_hideExfsContextMenu();

  state.checkedIds={};
  state.selectedId=0;
  state.desktopSelectedTargetId=id;
  jplopsoft_renderFiles();

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📂',
      '打開捷徑',
      function(){
        jplopsoft_openDesktopShortcut(id);
      },
      !n,
      false
    )
  );

  jplopsoft_exfsContextMenuSeparator(menu);

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '🗑️',
      '刪除捷徑',
      function(){
        jplopsoft_deleteDesktopShortcut(id);
      },
      false,
      true
    )
  );

  jplopsoft_exfsPositionContextMenu(
    menu,
    ev&&typeof ev.clientX==='number'?ev.clientX:0,
    ev&&typeof ev.clientY==='number'?ev.clientY:0
  );
}

function jplopsoft_showExfsNodeContextMenu(ev,id){
  var menu=jplopsoft_el('jplopsoft_exfsContextMenu'),
      n=jplopsoft_findNode(id),
      name,fmt,
      canPreview=false,
      canDownload=false,
      canEdit=false,
      canOpen=false;

  if(!menu||!n)return;

  if(ev){
    if(ev.preventDefault)ev.preventDefault();
    if(ev.stopPropagation)ev.stopPropagation();
    ev.cancelBubble=true;
  }

  jplopsoft_hideExfsContextMenu();

  /*
   * Right-click actions intentionally operate on the clicked item only.
   * Existing multi-select checkboxes are cleared so Rename/Move/Delete
   * cannot accidentally affect unrelated checked rows.
   */
  jplopsoft_exfsContextSelectSingle(n.id);

  n=jplopsoft_findNode(n.id);
  if(!n)return;

  name=jplopsoft_decName(n)||('[無法解密] #'+n.id);
  fmt=n.type==='file'?jplopsoft_fileFormatFromName(name):'';

  canOpen=
    n.type==='folder'||
    (n.type==='file'&&jplopsoft_nodeOnlinePreviewable(n,name));

  canPreview=
    n.type==='file'&&
    jplopsoft_nodeOnlinePreviewable(n,name);

  canDownload=n.type==='file';

  canEdit=jplopsoft_nodeOnlineEditable(n,name);

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📂',
      '開啟',
      function(){
        jplopsoft_exfsContextOpenNode(n.id);
      },
      !canOpen,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '👁',
      '預覽',
      function(){
        jplopsoft_exfsContextPreviewNode(n.id);
      },
      !canPreview,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '⬇',
      '下載',
      function(){
        jplopsoft_downloadNode(n.id);
      },
      !canDownload,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '✏️',
      '編輯',
      function(){
        jplopsoft_exfsContextEditNode(n.id);
      },
      !canEdit,
      false
    )
  );

  if(n.type==='folder'){
    menu.appendChild(
      jplopsoft_exfsContextMenuButton(
        '⌨️',
        'CMD 模式',
        function(){
          jplopsoft_exfsContextOpenFolderCmd(n.id);
        },
        false,
        false
      )
    );
  }

  jplopsoft_exfsContextMenuSeparator(menu);

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '🖥️',
      '在桌面建立捷徑',
      function(){
        jplopsoft_createDesktopShortcut(n.id);
      },
      jplopsoft_hasDesktopShortcut(n.id),
      false
    )
  );

  jplopsoft_exfsContextMenuSeparator(menu);

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '🏷️',
      '重新命名',
      function(){
        state.selectedId=n.id;
        state.checkedIds={};
        jplopsoft_renameSelected();
      },
      false,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📁',
      '移動到…',
      function(){
        state.selectedId=n.id;
        state.checkedIds={};
        jplopsoft_openMoveDialog();
      },
      false,
      false
    )
  );

  jplopsoft_exfsContextMenuSeparator(menu);

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '🗑️',
      '刪除',
      function(){
        state.selectedId=n.id;
        state.checkedIds={};
        jplopsoft_deleteSelected();
      },
      false,
      true
    )
  );

  jplopsoft_exfsContextMenuSeparator(menu);
  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      'ℹ️',
      '內容',
      function(){jplopsoft_openProperties(n.id);},
      false,
      false
    )
  );

  jplopsoft_exfsPositionContextMenu(
    menu,
    ev&&typeof ev.clientX==='number'?ev.clientX:0,
    ev&&typeof ev.clientY==='number'?ev.clientY:0
  );
}

function jplopsoft_showExfsBlankContextMenu(ev){
  var menu=jplopsoft_el('jplopsoft_exfsContextMenu');

  if(!menu)return;

  if(ev){
    if(ev.preventDefault)ev.preventDefault();
    if(ev.stopPropagation)ev.stopPropagation();
    ev.cancelBubble=true;
  }

  jplopsoft_hideExfsContextMenu();

  if(jplopsoft_isDesktopFolder()){
    menu.appendChild(
      jplopsoft_exfsContextMenuButton(
        '🖥️',
        '桌面捷徑區域',
        null,
        true,
        false
      )
    );

    jplopsoft_exfsPositionContextMenu(
      menu,
      ev&&typeof ev.clientX==='number'?ev.clientX:0,
      ev&&typeof ev.clientY==='number'?ev.clientY:0
    );

    return;
  }

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📄',
      '新增 HTML',
      function(){
        jplopsoft_createItem('file','html');
      },
      false,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📁',
      '新增資料夾',
      function(){
        jplopsoft_createItem('folder');
      },
      false,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📝',
      '新增 TXT',
      function(){
        jplopsoft_createItem('file','txt');
      },
      false,
      false
    )
  );

  menu.appendChild(
    jplopsoft_exfsContextMenuButton(
      '📊',
      '新增 CSV',
      function(){
        jplopsoft_createItem('file','csv');
      },
      false,
      false
    )
  );

  jplopsoft_exfsPositionContextMenu(
    menu,
    ev&&typeof ev.clientX==='number'?ev.clientX:0,
    ev&&typeof ev.clientY==='number'?ev.clientY:0
  );
}

function jplopsoft_exfsContextFindItemRow(target,panel){
  var cur=target;

  while(cur&&cur!==panel){
    if(
      cur.nodeType===1&&
      typeof cur.getAttribute==='function'&&
      (
        cur.getAttribute('data-node-id')!==null||
        cur.getAttribute('data-desktop-shortcut-target')!==null||
        cur.getAttribute('data-desktop-system-item')!==null
      )
    ){
      return cur;
    }

    cur=cur.parentNode;
  }

  return null;
}

function jplopsoft_bindExfsContextMenu(){
  var panel=jplopsoft_el('jplopsoft_filePanel'),
      tree=jplopsoft_el('jplopsoft_folderTree'),
      menu=jplopsoft_el('jplopsoft_exfsContextMenu');

  if(!panel||!menu)return;

  panel.oncontextmenu=function(ev){
    ev=ev||window.event;

    if(
      !state.vaultKey||
      state.cmdMode||
      panel.className.indexOf('jplopsoft_hidden')>=0
    ){
      return true;
    }

    var row=jplopsoft_exfsContextFindItemRow(
      ev.target||ev.srcElement,
      panel
    );

    if(row){
      if(row.getAttribute('data-desktop-system-item')!==null){
        jplopsoft_showDesktopSystemContextMenu(
          ev,
          String(row.getAttribute('data-desktop-system-item')||'')
        );
      }else if(row.getAttribute('data-desktop-shortcut-target')!==null){
        jplopsoft_showDesktopShortcutContextMenu(
          ev,
          parseInt(
            row.getAttribute('data-desktop-shortcut-target'),
            10
          )||0
        );
      }else{
        jplopsoft_showExfsNodeContextMenu(
          ev,
          parseInt(row.getAttribute('data-node-id'),10)||0
        );
      }

      return false;
    }

    /*
     * Right-clicking a normal UI button/input inside the list should not
     * unexpectedly turn into "New file". Table headers and actual action
     * controls are excluded; real list whitespace/empty-panel gets the
     * blank-space menu.
     */
    var target=ev.target||ev.srcElement,
        cur=target,
        blocked=false;

    while(cur&&cur!==panel){
      if(
        cur.nodeType===1&&
        /^(BUTTON|INPUT|A|SELECT|TEXTAREA|TH)$/i.test(cur.tagName||'')
      ){
        blocked=true;
        break;
      }

      cur=cur.parentNode;
    }

    if(blocked){
      if(ev.preventDefault)ev.preventDefault();
      ev.returnValue=false;
      jplopsoft_hideExfsContextMenu();
      return false;
    }

    jplopsoft_showExfsBlankContextMenu(ev);
    return false;
  };

  if(tree){
    tree.oncontextmenu=function(ev){
      ev=ev||window.event;

      if(
        !state.vaultKey||
        state.cmdMode
      ){
        return true;
      }

      var node=jplopsoft_exfsContextFindTreeFolderNode(
        ev.target||ev.srcElement,
        tree
      );

      if(node){
        jplopsoft_showExfsTreeFolderContextMenu(
          ev,
          parseInt(node.getAttribute('data-tree-folder-id'),10)||0
        );
        return false;
      }

      jplopsoft_hideExfsContextMenu();
      return false;
    };
  }

  menu.oncontextmenu=function(ev){
    ev=ev||window.event;
    if(ev.preventDefault)ev.preventDefault();
    ev.returnValue=false;
    return false;
  };

  document.addEventListener(
    'mousedown',
    function(ev){
      var target=ev.target||ev.srcElement;

      if(
        menu.className.indexOf('jplopsoft_hidden')<0&&
        target!==menu&&
        !menu.contains(target)
      ){
        jplopsoft_hideExfsContextMenu();
      }
    },
    true
  );

  document.addEventListener(
    'keydown',
    function(ev){
      ev=ev||window.event;
      if((ev.keyCode||ev.which)===27){
        jplopsoft_hideExfsContextMenu();
      }
    },
    true
  );

  window.addEventListener(
    'resize',
    jplopsoft_hideExfsContextMenu,
    false
  );

  window.addEventListener(
    'scroll',
    jplopsoft_hideExfsContextMenu,
    true
  );
}

function jplopsoft_refreshVisibleFileRowSelection(){
  var rows=document.querySelectorAll('#jplopsoft_fileRows tr.jplopsoft_item-row'),
      desktop=jplopsoft_isDesktopFolder(),
      i,row,id,selected;

  for(i=0;i<rows.length;i++){
    row=rows[i];
    selected=false;

    if(desktop){
      if(row.getAttribute('data-desktop-system-item')!==null){
        selected=String(row.getAttribute('data-desktop-system-item')||'')===String(state.desktopShellSelected||'');
      }else{
        id=parseInt(
          row.getAttribute('data-desktop-shortcut-target'),
          10
        )||0;
        selected=id>0&&id===parseInt(state.desktopSelectedTargetId,10);
      }
    }else{
      id=parseInt(
        row.getAttribute('data-node-id'),
        10
      )||0;

      selected=
        id>0&&
        id===parseInt(state.selectedId,10);
    }

    row.className='jplopsoft_item-row '+(selected?'jplopsoft_selected ':'')+(state.clipboardMode==='cut'&&jplopsoft_clipboardContainsId(id)?'jplopsoft_cut':'');
  }

  /*
   * Toolbar state can depend on the selected desktop shortcut,
   * but a simple row selection must never rebuild #jplopsoft_fileRows.
   * Keeping the same TR node alive is required for IE11 to emit
   * a native dblclick event after two clicks.
   */
  jplopsoft_updateDeleteButton();
  jplopsoft_updateSelectAllBox();
}

function jplopsoft_renderDesktopShortcuts(){
  var body=jplopsoft_el('jplopsoft_fileRows'),
      empty=jplopsoft_el('jplopsoft_emptyPanel'),
      list=jplopsoft_sortDesktopShortcutEntries(jplopsoft_desktopShortcutEntries()),
      i,item,n,tr,td,name,icon,mark;

  jplopsoft_hideExfsContextMenu();
  jplopsoft_updateSortHeaders();
  body.innerHTML='';

  empty.textContent='桌面目前沒有使用者捷徑。';
  empty.className='jplopsoft_empty jplopsoft_hidden';

  if(jplopsoft_el('jplopsoft_selectAllRows')){
    jplopsoft_el('jplopsoft_selectAllRows').checked=false;
    jplopsoft_el('jplopsoft_selectAllRows').indeterminate=false;
    jplopsoft_el('jplopsoft_selectAllRows').disabled=true;
  }

  /* Explorer's Desktop namespace and the visible Desktop share one source. */
  jplopsoft_renderDesktopSystemRows(body);

  for(i=0;i<list.length;i++){
    item=list[i];
    n=item.target;
    name=item.name;

    tr=document.createElement('tr');
    tr.className=
      'jplopsoft_item-row '+
      (state.desktopSelectedTargetId===item.target_node_id?
        'jplopsoft_selected':'');

    tr.setAttribute(
      'data-desktop-shortcut-target',
      item.target_node_id
    );

    td=document.createElement('td');
    td.className='jplopsoft_checkcell';

    mark=document.createElement('span');
    mark.textContent='↗';
    mark.title='桌面捷徑';
    mark.setAttribute('aria-hidden','true');

    td.appendChild(mark);
    tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_namecell';

    icon=jplopsoft_nodeDisplayIcon(n,name);
    td.innerHTML=
      icon+
      jplopsoft_htmlEscape(name)+
      ' <span class="jplopsoft_muted" title="桌面捷徑">↗</span>';

    tr.appendChild(td);

    td=document.createElement('td');
    td.textContent=n?
      ('捷徑 → '+jplopsoft_fileTypeLabel(n,name)):
      '失效捷徑';
    tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_muted';
    td.textContent=
      (!n||n.type==='folder')?
        '—':
        jplopsoft_formatFileSize(n.original_size||0);
    tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_muted';
    td.textContent=jplopsoft_fmtDate(
      n?n.updated_at:item.created_at
    );

    if(item.created_at){
      td.title='捷徑建立：'+jplopsoft_fmtDate(item.created_at);
    }

    tr.appendChild(td);

    (function(targetId,row){
      row.onclick=function(){
        state.selectedId=0;
        state.desktopShellSelected='';
        state.desktopSelectedTargetId=targetId;
        jplopsoft_refreshVisibleFileRowSelection();
      };

      row.ondblclick=function(ev){
        ev=ev||window.event;

        if(ev&&ev.preventDefault){
          ev.preventDefault();
        }

        jplopsoft_openDesktopShortcut(targetId);

        return false;
      };
    })(item.target_node_id,tr);

    body.appendChild(tr);
  }

  jplopsoft_updateDeleteButton();
  jplopsoft_updateSelectAllBox();
}

function jplopsoft_clipboardContainsId(id){
  var i,target=parseInt(id,10)||0;
  if(!target||!state.clipboardItems)return false;
  for(i=0;i<state.clipboardItems.length;i++){
    if(parseInt(state.clipboardItems[i].id,10)===target)return true;
  }
  return false;
}
function jplopsoft_clipboardToast(message,sub){
  var box=jplopsoft_el('jplopsoft_clipboardToast');
  if(!box)return;
  if(state.clipboardToastTimer){window.clearTimeout(state.clipboardToastTimer);state.clipboardToastTimer=0;}
  box.innerHTML='<strong>'+jplopsoft_htmlEscape(String(message||''))+'</strong>'+(sub?'<span class="jplopsoft_clipboard-toast-sub">'+jplopsoft_htmlEscape(String(sub))+'</span>':'');
  box.className='jplopsoft_clipboard-toast jplopsoft_show';
  state.clipboardToastTimer=window.setTimeout(function(){box.className='jplopsoft_clipboard-toast';state.clipboardToastTimer=0;},2600);
}
function jplopsoft_clipboardSelectionIds(){
  var ids=[],k,id,n;
  if(jplopsoft_isDesktopFolder())return ids;
  if(jplopsoft_checkedCount()>0){
    for(k in state.checkedIds){
      if(state.checkedIds.hasOwnProperty(k)&&state.checkedIds[k]){
        id=parseInt(k,10)||0;n=jplopsoft_findNode(id);if(n)ids.push(id);
      }
    }
  }else if(state.selectedId>0){
    n=jplopsoft_findNode(state.selectedId);if(n)ids.push(state.selectedId);
  }
  return ids;
}
function jplopsoft_setVirtualClipboard(mode){
  var ids=jplopsoft_clipboardSelectionIds(),items=[],i,n,name;
  if(mode!=='copy'&&mode!=='cut')return;
  if(!state.vaultKey||!state.samAuthenticated){jplopsoft_clipboardToast('請先登入並解鎖 ExFS。');return;}
  if(jplopsoft_isDesktopFolder()){jplopsoft_clipboardToast('桌面捷徑不能放入檔案剪貼簿。');return;}
  if(!ids.length){jplopsoft_clipboardToast('請先選取檔案或資料夾。');return;}
  for(i=0;i<ids.length;i++){
    n=jplopsoft_findNode(ids[i]);if(!n)continue;
    name=jplopsoft_decName(n);if(name===null)continue;
    items.push({id:n.id,parent_id:n.parent_id,type:n.type,name:name,name_enc:n.name_enc});
  }
  if(!items.length){jplopsoft_clipboardToast('選取項目無法加入剪貼簿。');return;}
  state.clipboardMode=mode;
  state.clipboardItems=items;
  jplopsoft_renderFiles();
  jplopsoft_clipboardToast((mode==='cut'?'已剪下 ':'已複製 ')+items.length+' 個項目',mode==='cut'?'切換到目的資料夾後按 Ctrl+V 移動':'切換到目的資料夾後按 Ctrl+V 貼上');
}
function jplopsoft_clearVirtualClipboard(){
  state.clipboardMode='';state.clipboardItems=[];state.clipboardBusy=false;jplopsoft_renderFiles();
}
function jplopsoft_clipboardUniqueCopyName(parentId,name,reserved,type){
  var dot,base,ext,candidate,i=1,key;
  name=String(name||'');reserved=reserved||{};
  key=name.toLowerCase();
  if(!jplopsoft_siblingNameExists(parentId,name,0)&&!reserved[key]){reserved[key]=true;return name;}
  dot=type==='file'?name.lastIndexOf('.'):-1;
  if(dot>0){base=name.substring(0,dot);ext=name.substring(dot);}else{base=name;ext='';}
  candidate=base+' - 複本'+ext;
  while(jplopsoft_siblingNameExists(parentId,candidate,0)||reserved[candidate.toLowerCase()]){
    i++;candidate=base+' - 複本 ('+i+')'+ext;
    if(i>9999)return '';
  }
  reserved[candidate.toLowerCase()]=true;
  return candidate;
}
function jplopsoft_virtualClipboardPasteCopy(target){
  var items=state.clipboardItems.slice(0),reserved={},index=0,copied=0,failed=0,totalNodes=0;
  function finish(){state.clipboardBusy=false;jplopsoft_reloadNodes(function(){jplopsoft_clipboardToast('已貼上 '+copied+' 個項目',failed?('另有 '+failed+' 個項目失敗'):'每個新檔案均已產生獨立 FEK；複製剪貼簿仍可再次貼上');});}
  function next(){var item,n,name;if(index>=items.length){finish();return;}item=items[index++];n=jplopsoft_findNode(item.id);if(!n){failed++;next();return;}name=jplopsoft_clipboardUniqueCopyName(target,item.name,reserved,item.type);if(!name){failed++;next();return;}jplopsoft_clientCopyNode(item.id,target,name,function(err,out){if(err)failed++;else{copied++;totalNodes+=(parseInt(out&&out.copied_nodes,10)||1);}next();});}
  next();
}
function jplopsoft_virtualClipboardPasteCut(target){
  var items=state.clipboardItems.slice(0),ids=[],i,n,conflict,allSame=true;
  for(i=0;i<items.length;i++){n=jplopsoft_findNode(items[i].id);if(n)ids.push(n.id);}
  if(!ids.length){state.clipboardBusy=false;jplopsoft_clearVirtualClipboard();jplopsoft_clipboardToast('剪貼簿中的項目已不存在。');return;}
  if(jplopsoft_invalidMoveTarget(target,ids)){state.clipboardBusy=false;jplopsoft_clipboardToast('無法貼上到這個資料夾。','資料夾不能移入自己或自己的子資料夾');return;}
  for(i=0;i<ids.length;i++){n=jplopsoft_findNode(ids[i]);if(!n||n.parent_id!==target){allSame=false;break;}}
  if(allSame){state.clipboardBusy=false;jplopsoft_clipboardToast('項目已經位於目前資料夾。');return;}
  conflict=jplopsoft_moveNameConflict(target,ids);
  if(conflict){state.clipboardBusy=false;jplopsoft_clipboardToast('目的資料夾已有同名項目：'+conflict,'剪下內容仍保留在剪貼簿');return;}
  function done(err,out){
    if(err){state.clipboardBusy=false;jplopsoft_clipboardToast('貼上失敗：'+err.message,'剪下內容仍保留在剪貼簿');return;}
    state.clipboardMode='';state.clipboardItems=[];state.clipboardBusy=false;state.selectedId=0;jplopsoft_clearChecked();
    jplopsoft_reloadNodes(function(){jplopsoft_clipboardToast('已移動 '+(out&&typeof out.moved==='number'?out.moved:ids.length)+' 個項目','剪下剪貼簿已清空');});
  }
  if(ids.length===1){
    n=jplopsoft_findNode(ids[0]);
    jplopsoft_api('move_node','POST',{id:n.id,target_parent_id:target,name_enc:n.name_enc},true,function(err){done(err,{moved:err?0:1});});
  }else{
    jplopsoft_api('move_many','POST',{ids:ids,target_parent_id:target},true,done);
  }
}
function jplopsoft_pasteVirtualClipboard(){
  var target=parseInt(state.currentFolder,10);
  if(state.clipboardBusy){jplopsoft_clipboardToast('剪貼簿正在處理中。');return;}
  if(!state.vaultKey||!state.samAuthenticated){jplopsoft_clipboardToast('請先登入並解鎖 ExFS。');return;}
  if(!state.clipboardMode||!state.clipboardItems.length){jplopsoft_clipboardToast('剪貼簿是空的。');return;}
  if(jplopsoft_isDesktopFolder()||!(target>=0)){jplopsoft_clipboardToast('桌面只能存放捷徑，不能貼上檔案。');return;}
  if(!jplopsoft_isWritableProfileFolder(target)){jplopsoft_clipboardToast('此位置唯讀；只能貼到自己的 C:\\Users\\'+state.samUsername+'\\。');return;}
  if(state.clipboardMode==='copy'){
    var copyIds=[],ci;
    for(ci=0;ci<state.clipboardItems.length;ci++)copyIds.push(parseInt(state.clipboardItems[ci].id,10)||0);
    if(jplopsoft_invalidMoveTarget(target,copyIds)){jplopsoft_clipboardToast('無法貼上到這個資料夾。','資料夾不能複製到自己或自己的子資料夾');return;}
  }
  state.clipboardBusy=true;
  jplopsoft_clipboardToast(state.clipboardMode==='cut'?'正在移動項目…':'正在複製項目…','目的地：'+jplopsoft_moveTargetName(target));
  if(state.clipboardMode==='cut')jplopsoft_virtualClipboardPasteCut(target);else jplopsoft_virtualClipboardPasteCopy(target);
}

function jplopsoft_selectedIdsForDrag(primaryId){
  var ids=[],k,id=parseInt(primaryId,10)||0;
  if(jplopsoft_checkedCount()>0&&jplopsoft_isChecked(id)){
    for(k in state.checkedIds)if(state.checkedIds.hasOwnProperty(k)&&state.checkedIds[k])ids.push(parseInt(k,10));
  }else if(id>0){ids.push(id);}
  return ids;
}
function jplopsoft_moveIdsToFolder(ids,target){
  var i,n,allSame=true,conflict;
  target=parseInt(target,10);if(!(target>=0)||!ids||!ids.length)return;
  if(!jplopsoft_isWritableProfileFolder(target)){alert('目的地唯讀。只能移動到 C:\\Users\\'+state.samUsername+'\\ 內。');return;}
  if(jplopsoft_invalidMoveTarget(target,ids)){alert('目的資料夾無效：不能把資料夾移到自己或自己的子資料夾中。');return;}
  for(i=0;i<ids.length;i++){n=jplopsoft_findNode(ids[i]);if(!n||n.parent_id!==target){allSame=false;break;}}
  if(allSame){jplopsoft_setStatus('項目原本就位於該資料夾。');return;}
  conflict=jplopsoft_moveNameConflict(target,ids);if(conflict){alert('目的資料夾已經有同名項目：「'+conflict+'」。');return;}
  if(ids.length===1){n=jplopsoft_findNode(ids[0]);if(!n)return;jplopsoft_api('move_node','POST',{id:n.id,target_parent_id:target,name_enc:n.name_enc},true,function(err){if(err)return alert(err.message);state.selectedId=0;jplopsoft_clearChecked();jplopsoft_reloadNodes(function(){jplopsoft_setStatus('拖曳移動完成：1 個項目。');});});}else{jplopsoft_api('move_many','POST',{ids:ids,target_parent_id:target},true,function(err,out){if(err)return alert(err.message);state.selectedId=0;jplopsoft_clearChecked();jplopsoft_reloadNodes(function(){jplopsoft_setStatus('拖曳移動完成：'+(out&&typeof out.moved==='number'?out.moved:ids.length)+' 個項目。');});});}
}
function jplopsoft_bindTreeDropTarget(node,targetId){
  if(!node||!node.addEventListener)return;
  node.addEventListener('dragover',function(e){if(!state.dragNodeIds.length)return;e=e||window.event;if(e.preventDefault)e.preventDefault();try{e.dataTransfer.dropEffect='move';}catch(ignore){}node.className=node.className.replace(/\s*jplopsoft_drag-over/g,'')+' jplopsoft_drag-over';return false;},false);
  node.addEventListener('dragleave',function(){node.className=node.className.replace(/\s*jplopsoft_drag-over/g,'');},false);
  node.addEventListener('drop',function(e){var ids=state.dragNodeIds.slice(0);e=e||window.event;if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();node.className=node.className.replace(/\s*jplopsoft_drag-over/g,'');state.dragNodeIds=[];jplopsoft_moveIdsToFolder(ids,targetId);return false;},false);
}
function jplopsoft_shiftSelectTo(id){
  var ids=jplopsoft_currentVisibleIds(),a=-1,b=-1,i,start,end;
  id=parseInt(id,10)||0;if(!id)return;
  for(i=0;i<ids.length;i++){if(ids[i]===state.shiftAnchorId)a=i;if(ids[i]===id)b=i;}
  if(a<0||b<0){state.shiftAnchorId=id;jplopsoft_setChecked(id,true);return;}
  start=Math.min(a,b);end=Math.max(a,b);for(i=start;i<=end;i++)state.checkedIds[String(ids[i])]=true;
  state.selectedId=id;jplopsoft_renderFiles();
}
function jplopsoft_galleryIds(){
  var list=jplopsoft_sortFileNodes(jplopsoft_childrenOf(state.currentFolder)),out=[],i,n,name,fmt;
  for(i=0;i<list.length;i++){n=list[i];if(n.type!=='file')continue;name=jplopsoft_decName(n)||'';fmt=jplopsoft_fileFormatFromName(name);if(fmt==='image'||fmt==='audio'||fmt==='video'||fmt==='rawvideo')out.push(n.id);}
  return out;
}
function jplopsoft_galleryNavigate(delta){
  var ids=jplopsoft_galleryIds(),i=-1,next;
  if(!state.openId||!ids.length)return;
  for(next=0;next<ids.length;next++)if(ids[next]===state.openId){i=next;break;}
  if(i<0)return;next=i+delta;if(next<0||next>=ids.length)return;
  jplopsoft_openView(ids[next]);
}
function jplopsoft_updateGalleryButtons(){
  var ids=jplopsoft_galleryIds(),i=-1,k,prevIds=['jplopsoft_galleryPrevImage','jplopsoft_galleryPrevMedia'],nextIds=['jplopsoft_galleryNextImage','jplopsoft_galleryNextMedia'];
  for(k=0;k<ids.length;k++)if(ids[k]===state.openId){i=k;break;}
  for(k=0;k<prevIds.length;k++)if(jplopsoft_el(prevIds[k]))jplopsoft_el(prevIds[k]).disabled=(i<=0);
  for(k=0;k<nextIds.length;k++)if(jplopsoft_el(nextIds[k]))jplopsoft_el(nextIds[k]).disabled=(i<0||i>=ids.length-1);
}
function jplopsoft_isTypingTarget(t){
  var tag=t&&t.tagName?String(t.tagName).toLowerCase():'';
  return tag==='input'||tag==='textarea'||tag==='select'||(t&&t.isContentEditable);
}
function jplopsoft_bindGlobalHotkeys(){
  document.addEventListener('keydown',function(e){var k,modalVisible,target,ctrl;e=e||window.event;k=e.keyCode||e.which;target=e.target||e.srcElement;ctrl=!!(e.ctrlKey||e.metaKey);modalVisible=jplopsoft_el('jplopsoft_modalBackdrop')&&jplopsoft_el('jplopsoft_modalBackdrop').style.display!=='none'&&jplopsoft_el('jplopsoft_modalBackdrop').offsetWidth>0;
    if(!!e.ctrlKey&&!!e.shiftKey&&k===27&&state.samAuthenticated&&state.vaultKey){if(e.preventDefault)e.preventDefault();e.returnValue=false;jplopsoft_openTaskManager(true);return false;}
    if(ctrl&&k===70){if(e.preventDefault)e.preventDefault();if(jplopsoft_el('jplopsoft_fileSearchInput')){jplopsoft_el('jplopsoft_fileSearchInput').focus();try{jplopsoft_el('jplopsoft_fileSearchInput').select();}catch(ignore){}}return false;}
    if(modalVisible&&(state.openFormat==='image'||state.openFormat==='audio'||state.openFormat==='video'||state.openFormat==='rawvideo')&&(k===37||k===39)){if(e.preventDefault)e.preventDefault();jplopsoft_galleryNavigate(k===37?-1:1);return false;}
    if(jplopsoft_isTypingTarget(target)||state.cmdMode||modalVisible||state.securityScreenOpen||state.passwordDialogOpen)return;
    if(ctrl&&k===67){if(e.preventDefault)e.preventDefault();e.returnValue=false;jplopsoft_setVirtualClipboard('copy');return false;}
    if(ctrl&&k===88){if(e.preventDefault)e.preventDefault();e.returnValue=false;jplopsoft_setVirtualClipboard('cut');return false;}
    if(ctrl&&k===86){if(e.preventDefault)e.preventDefault();e.returnValue=false;jplopsoft_pasteVirtualClipboard();return false;}
    if(k===113){if(state.selectedId){if(e.preventDefault)e.preventDefault();jplopsoft_renameSelected();return false;}}
    if(k===46){if(state.selectedId||jplopsoft_checkedCount()>0){if(e.preventDefault)e.preventDefault();jplopsoft_deleteSelected();return false;}}
  },false);
}
function jplopsoft_renderFiles(){
  var body,list,i,n,tr,name,td,fmt,chk,icon;

  if(jplopsoft_isDesktopFolder()){
    jplopsoft_renderDesktopShortcuts();
    return;
  }

  body=jplopsoft_el('jplopsoft_fileRows');
  list=jplopsoft_sortFileNodes(jplopsoft_childrenOf(state.currentFolder));

  jplopsoft_hideExfsContextMenu();
  jplopsoft_updateSortHeaders();
  body.innerHTML='';

  jplopsoft_el('jplopsoft_emptyPanel').textContent='這個資料夾目前是空的。';
  jplopsoft_el('jplopsoft_emptyPanel').className=list.length?'jplopsoft_empty jplopsoft_hidden':'jplopsoft_empty';

  if(jplopsoft_el('jplopsoft_selectAllRows')){
    jplopsoft_el('jplopsoft_selectAllRows').disabled=false;
  }

  for(i=0;i<list.length;i++){
    n=list[i];

    tr=document.createElement('tr');
    tr.className='jplopsoft_item-row '+(state.selectedId===n.id?'jplopsoft_selected ':'')+(state.clipboardMode==='cut'&&jplopsoft_clipboardContainsId(n.id)?'jplopsoft_cut':'');
    tr.setAttribute('data-node-id',n.id);
    tr.setAttribute('draggable','true');

    name=jplopsoft_decName(n)||'[無法解密]';
    fmt=n.type==='file'?jplopsoft_fileFormatFromName(name):'';

    td=document.createElement('td');
    td.className='jplopsoft_checkcell';

    chk=document.createElement('input');
    chk.type='checkbox';
    chk.className='jplopsoft_row-check';
    chk.checked=jplopsoft_isChecked(n.id);
    chk.setAttribute('aria-label','選取 '+name);

    (function(id,c){
      c.onclick=function(ev){
        ev=ev||window.event;
        if(ev.stopPropagation)ev.stopPropagation();
        ev.cancelBubble=true;
        if(ev.shiftKey){c.checked=true;jplopsoft_shiftSelectTo(id);}else{state.shiftAnchorId=id;jplopsoft_setChecked(id,!!c.checked);}
      };
    })(n.id,chk);

    td.appendChild(chk);
    tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_namecell';
    icon=jplopsoft_nodeDisplayIcon(n,name);
    td.innerHTML=icon+jplopsoft_htmlEscape(name)+(n.type==='reparse_point'?'<span class="jplopsoft_large-file-badge">REPARSE</span>':'')+(n.has_motw?'<span class="jplopsoft_large-file-badge" title="Zone.Identifier / Mark of the Web">MOTW</span>':'')+(jplopsoft_nodeHasThumbnail(n)?'<span class="jplopsoft_large-file-badge">THUMB</span>':'')+(jplopsoft_nodeIsLargeFile(n)?'<span class="jplopsoft_large-file-badge">CHUNKED</span>':'');
    tr.appendChild(td);

    td=document.createElement('td');
    td.textContent=jplopsoft_fileTypeLabel(n,name);
    tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_muted';
    td.textContent=n.type==='folder'?
      '—':
      jplopsoft_formatFileSize(n.original_size||0);
    td.title=n.type==='folder'?
      '資料夾':
      ((n.original_size||0)>0?
        ((n.original_size||0)+' bytes'):
        '舊檔案尚未記錄原始大小');
    tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_muted';
    td.textContent=jplopsoft_fmtDate(n.updated_at);
    tr.appendChild(td);

    (function(id,row,type,format){
      row.onclick=function(ev){
        ev=ev||window.event;
        if(ev.shiftKey){jplopsoft_shiftSelectTo(id);return;}
        state.shiftAnchorId=id;
        state.selectedId=id;
        state.desktopSelectedTargetId=0;
        jplopsoft_refreshVisibleFileRowSelection();
      };
      row.ondragstart=function(ev){ev=ev||window.event;state.dragNodeIds=jplopsoft_selectedIdsForDrag(id);row.className+=' jplopsoft_dragging';try{ev.dataTransfer.effectAllowed='move';ev.dataTransfer.setData('text/plain',state.dragNodeIds.join(','));}catch(ignoreDrag){}};
      row.ondragend=function(){row.className=row.className.replace(/\s*jplopsoft_dragging/g,'');state.dragNodeIds=[];};

      row.ondblclick=function(ev){
        ev=ev||window.event;

        if(ev&&ev.preventDefault){
          ev.preventDefault();
        }

        var dn=jplopsoft_resolveClientNode(id),dname=dn?(jplopsoft_decName(dn)||''):'';
        if(!dn){
          alert('重新導向點的目標不存在或形成循環。');
        }else if(dn.type==='folder'){
          jplopsoft_clearChecked();
          state.currentFolder=dn.id;
          state.selectedId=0;
          jplopsoft_renderAll();
        }else if(!jplopsoft_nodeOnlinePreviewable(dn,dname)){
          alert(jplopsoft_nodeIsLargeFile(dn)?jplopsoft_largeFileDownloadOnlyMessage(dname,dn.original_size):'此檔案超過線上預覽安全上限，只允許下載。');
        }else if(jplopsoft_fileFormatFromName(dname)!=='binary'){
          jplopsoft_openNodeByAssociation(dn.id);
        }

        return false;
      };
    })(n.id,tr,n.type,fmt);

    body.appendChild(tr);
  }

  jplopsoft_updateDeleteButton();
  jplopsoft_updateSelectAllBox();
}
function jplopsoft_reloadNodes(done){
  jplopsoft_api(
    'list',
    'GET',
    null,
    true,
    function(err,out){
      if(err){
        alert(err.message);
        return;
      }

      state.nodes=out.nodes||[];
      state.desktopShortcuts=out.desktop_shortcuts||[];
      state.namespaceModel=String(out.namespace_model||'');
      state.usersRootId=parseInt(out.users_root_id,10)||0;
      state.profileRootId=parseInt(out.profile_root_id,10)||0;
      state.documentsNodeId=parseInt(out.documents_node_id,10)||0;

      if(
        state.currentFolder!==0&&
        !jplopsoft_isDesktopFolder()&&
        !jplopsoft_findNode(state.currentFolder)
      ){
        state.currentFolder=0;
      }

      jplopsoft_renderAll();

      if(
        jplopsoft_el('jplopsoft_fileSearchInput')&&
        jplopsoft_trim(jplopsoft_el('jplopsoft_fileSearchInput').value)
      ){
        jplopsoft_renderFileSearch(jplopsoft_el('jplopsoft_fileSearchInput').value);
      }

      if(done)done();
    }
  );
}
function jplopsoft_saveFileBlob(name,src){var ext=jplopsoft_fileExtension(name),fmt=jplopsoft_fileFormatFromName(name);name=jplopsoft_validateName(name,'file',ext||(fmt==='html'?'html':(fmt==='csv'?'csv':'txt')));if(!name)return;var mime=fmt==='html'?'text/html;charset=utf-8':(fmt==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'),blob;try{blob=new Blob([String(src||'')],{type:mime});}catch(e){alert('瀏覽器無法建立下載檔案：'+e.message);return;}jplopsoft_saveBlobObject(name,blob);}
function jplopsoft_saveBlobObject(name,blob){if(window.navigator&&window.navigator.msSaveOrOpenBlob){window.navigator.msSaveOrOpenBlob(blob,name);return;}var URLObj=window.URL||window.webkitURL,a=document.createElement('a'),url='';if(!URLObj||!URLObj.createObjectURL){alert('瀏覽器不支援檔案下載。');return;}url=URLObj.createObjectURL(blob);a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);try{a.click();}catch(e){window.open(url,'_blank');}setTimeout(function(){try{document.body.removeChild(a);}catch(e2){}try{URLObj.revokeObjectURL(url);}catch(e3){}},1200);}
function jplopsoft_mimeForName(name){var ext=jplopsoft_fileExtension(name),m={'jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','gif':'image/gif','ico':'image/x-icon','webp':'image/webp','bmp':'image/bmp','zip':'application/zip','7z':'application/x-7z-compressed','rar':'application/vnd.rar','exe':'application/vnd.microsoft.portable-executable','dll':'application/octet-stream','ocx':'application/octet-stream','dat':'application/octet-stream','arj':'application/octet-stream','bin':'application/octet-stream','tar':'application/x-tar','gz':'application/gzip','bz2':'application/x-bzip2','xz':'application/x-xz','iso':'application/octet-stream','mp3':'audio/mpeg','mp4':'video/mp4','h264':'video/h264','264':'video/h264','avc':'video/h264','mpg':'video/mpeg','mpeg':'video/mpeg','wav':'audio/wav','wasm':'application/wasm','pak':'application/octet-stream','m4a':'audio/mp4','aac':'audio/aac','flac':'audio/flac','ogg':'audio/ogg','webm':'video/webm','ogv':'video/ogg','mov':'video/quicktime','m4v':'video/x-m4v','avi':'video/x-msvideo'};return m[ext]||'application/octet-stream';}
function jplopsoft_saveBinaryBlob(name,bytes){var arr;try{arr=(typeof Uint8Array!=='undefined')?new Uint8Array(bytes):bytes;jplopsoft_saveBlobObject(name,new Blob([arr],{type:jplopsoft_mimeForName(name)}));}catch(e){alert('建立 Binary 下載檔失敗：'+e.message);}}
function jplopsoft_downloadNode(id){
  if(!state.vaultKey)return alert('請先解密。');var n=jplopsoft_findNode(id),name,fmt;if(!n||n.type!=='file')return alert('請選擇文件。');name=jplopsoft_decName(n);if(name===null)return alert('檔名無法解密。');if(jplopsoft_nodeIsLargeFile(n)){jplopsoft_downloadLargeFile(n,name);return;}fmt=jplopsoft_fileFormatFromName(name);jplopsoft_setStatus('正在載入「'+jplopsoft_htmlEscape(name)+'」的加密內容…');jplopsoft_fetchNodeContent(id,function(err,out){var payload,fek;if(err)return alert(err.message);try{fek=jplopsoft_nodeFekById(id);if(jplopsoft_binaryFormat(fmt)){payload=jplopsoft_decBinaryCipher(out.content_enc,fek);if(payload===null)return alert('Binary 內容無法解密。');jplopsoft_saveBinaryBlob(name,payload);}else{payload=jplopsoft_decContentCipher(out.content_enc,fek);if(payload===null)return alert('文件內容無法解密。');jplopsoft_saveFileBlob(name,payload);}jplopsoft_setStatus('已下載「'+jplopsoft_htmlEscape(name)+'」。');}catch(e){alert(e.message);}},null,'DOWNLOAD');
}
function jplopsoft_downloadSelected(){var n=jplopsoft_findNode(state.selectedId);if(!n)return alert('請先選取要下載的文件。');if(n.type!=='file')return alert('資料夾不能直接下載。');jplopsoft_downloadNode(n.id);}
function jplopsoft_exfsPrintRemoveFrame(frame){
  if(!frame)return;

  setTimeout(function(){
    try{
      if(frame.parentNode){
        frame.parentNode.removeChild(frame);
      }
    }catch(ignoreRemove){}
  },300);
}

function jplopsoft_exfsPrintFrame(title,bodyHtml,extraCss,waitForImage){
  var old=jplopsoft_el('jplopsoft_exfsPrintFrame'),
      frame,win,doc,html,img,printed=false;

  if(old&&old.parentNode){
    try{old.parentNode.removeChild(old);}catch(ignoreOld){}
  }

  frame=document.createElement('iframe');
  frame.id='jplopsoft_exfsPrintFrame';
  frame.setAttribute('aria-hidden','true');
  frame.setAttribute('title','ExFS print frame');
  frame.style.position='fixed';
  frame.style.left='-10000px';
  frame.style.top='0';
  frame.style.width='1px';
  frame.style.height='1px';
  frame.style.border='0';
  frame.style.opacity='0';
  frame.style.pointerEvents='none';

  document.body.appendChild(frame);

  win=frame.contentWindow;

  if(!win||!win.document){
    jplopsoft_exfsPrintRemoveFrame(frame);
    alert('瀏覽器無法建立列印頁面。');
    return;
  }

  doc=win.document;

  html=
    '<!doctype html>'+
    '<html><head><meta charset="utf-8">'+
    '<title>'+jplopsoft_htmlEscape(title||'ExFS Document')+'</title>'+
    '<style>'+
    '@page{margin:12mm;}'+
    'html,body{background:#fff!important;color:#000!important;}'+
    'body{margin:0;font-family:Segoe UI,Microsoft JhengHei,Arial,sans-serif;'+
    'font-size:12pt;line-height:1.55;overflow-wrap:anywhere;}'+
    'pre{margin:0;white-space:pre-wrap;word-break:break-word;'+
    'font-family:Consolas,"Courier New",monospace;font-size:10.5pt;'+
    'line-height:1.45;}'+
    'img{max-width:100%;height:auto;}'+
    'table{border-collapse:collapse;max-width:100%;}'+
    'td,th{border:1px solid #bbb;padding:5px;}'+
    'a{color:#000;text-decoration:underline;}'+
    (extraCss||'')+
    '</style></head><body>'+
    bodyHtml+
    '</body></html>';

  try{
    doc.open();
    doc.write(html);
    doc.close();
  }catch(e){
    jplopsoft_exfsPrintRemoveFrame(frame);
    alert('建立列印內容失敗：'+e.message);
    return;
  }

  function jplopsoft_doPrint(){
    if(printed)return;
    printed=true;

    try{
      if(win.focus)win.focus();

      if(win.addEventListener){
        win.addEventListener(
          'afterprint',
          function(){
            jplopsoft_exfsPrintRemoveFrame(frame);
          },
          false
        );
      }

      win.print();

      /*
       * Some older browsers do not fire afterprint reliably.
       * print() is normally blocking until the dialog closes.
       */
      setTimeout(function(){
        jplopsoft_exfsPrintRemoveFrame(frame);
      },1200);
    }catch(e2){
      jplopsoft_exfsPrintRemoveFrame(frame);
      alert('無法開啟列印視窗：'+e2.message);
    }
  }

  if(waitForImage){
    img=doc.getElementById('jplopsoft_exfsPrintImage');

    if(img&&!img.complete){
      img.onload=function(){
        setTimeout(jplopsoft_doPrint,30);
      };
      img.onerror=function(){
        jplopsoft_exfsPrintRemoveFrame(frame);
        alert('圖片尚未完成載入，無法列印。');
      };
      return;
    }
  }

  setTimeout(jplopsoft_doPrint,30);
}

function jplopsoft_printCurrentDocument(){
  var n=jplopsoft_findNode(state.openId),
      name,fmt,src,safeBody,imgSrc;

  if(!n||n.type!=='file'){
    alert('目前沒有可列印的文件。');
    return;
  }

  name=jplopsoft_decName(n)||('file-'+n.id);
  fmt=state.openFormat||jplopsoft_fileFormatFromName(name);

  /*
   * Binary formats have no ExFS preview, so there is nothing meaningful
   * to print from the UI.
   */
  if(fmt==='binary'||fmt==='audio'||fmt==='video'||fmt==='rawvideo'){
    alert('影音 / Binary 檔案沒有適合直接列印的內容。');
    return;
  }

  /*
   * IMAGE:
   * Use the already-decrypted Blob/ObjectURL currently displayed.
   */
  if(fmt==='image'){
    imgSrc=jplopsoft_el('jplopsoft_imagePreviewImage')
      ?String(jplopsoft_el('jplopsoft_imagePreviewImage').src||'')
      :'';

    if(!imgSrc){
      alert('圖片尚未完成載入。');
      return;
    }

    jplopsoft_exfsPrintFrame(
      name,
      '<div class="jplopsoft_exfs-print-image">'+
      '<img id="jplopsoft_exfsPrintImage" src="'+jplopsoft_htmlEscape(imgSrc)+'" alt="">'+
      '</div>',
      '.jplopsoft_exfs-print-image{min-height:90vh;display:flex;'+
      'align-items:center;justify-content:center;text-align:center;}'+
      '.jplopsoft_exfs-print-image img{max-width:100%;max-height:95vh;object-fit:contain;}',
      true
    );
    return;
  }

  if(fmt==='csv'){
    jplopsoft_exfsPrintFrame(
      name,
      jplopsoft_csvPrintableTableHtml(),
      '.jplopsoft_exfs-print-csv{border-collapse:collapse;width:100%;font-size:10pt;}'+
      '.jplopsoft_exfs-print-csv th,.jplopsoft_exfs-print-csv td{border:1px solid #999;padding:4px 6px;vertical-align:top;}'+
      '.jplopsoft_exfs-print-csv th{background:#eee;font-weight:700;}',
      false
    );
    return;
  }

  /*
   * If rich editing is active, synchronize it first so printing reflects
   * exactly what the user currently sees/edits.
   */
  if(
    fmt==='html'&&
    state.editorMode==='rich'
  ){
    try{
      jplopsoft_syncRichToSource();
    }catch(ignoreRichSync){}
  }

  src=jplopsoft_el('jplopsoft_htmlEditor')
    ?jplopsoft_el('jplopsoft_htmlEditor').value
    :'';

  if(src===null||src===undefined){
    alert('文件內容尚未載入。');
    return;
  }

  if(fmt==='html'){
    /*
     * Reuse ExFS sanitizer. Only the sanitized body is inserted into the
     * dedicated print document; scripts/unsafe embedded content are not
     * carried into the print frame.
     */
    safeBody=jplopsoft_sanitizeFragment(
      jplopsoft_bodyInnerFromSource(String(src))
    );

    jplopsoft_exfsPrintFrame(
      name,
      safeBody,
      'body{padding:0;}',
      false
    );
    return;
  }

  /*
   * TXT / plain text.
   */
  jplopsoft_exfsPrintFrame(
    name,
    '<pre>'+jplopsoft_htmlEscape(String(src))+'</pre>',
    '',
    false
  );
}

function jplopsoft_downloadCurrentDocument(){var n=jplopsoft_findNode(state.openId),name,fmt,src;if(!n||n.type!=='file')return alert('目前沒有可下載的文件。');name=jplopsoft_decName(n)||('file-'+n.id);fmt=jplopsoft_fileFormatFromName(name);if(jplopsoft_binaryFormat(fmt)){jplopsoft_downloadNode(n.id);return;}try{if(state.editorMode==='rich'&&state.openFormat==='html')jplopsoft_syncRichToSource();src=fmt==='csv'?jplopsoft_csvCurrentSource():jplopsoft_el('jplopsoft_htmlEditor').value;if(src===null||src===undefined)return alert('文件內容尚未載入。');jplopsoft_saveFileBlob(name,src);}catch(e){alert(e.message);}}
function jplopsoft_currentFolderLabel(){if(state.currentFolder===0)return '根目錄';var n=jplopsoft_findNode(state.currentFolder);return n?(jplopsoft_decName(n)||('資料夾 #'+n.id)):'根目錄';}
function jplopsoft_hasDraggedFiles(e){var dt=e&&e.dataTransfer,t,i;if(!dt)return false;if(dt.files&&dt.files.length)return true;if(dt.types){for(i=0;i<dt.types.length;i++){t=String(dt.types[i]);if(t==='Files')return true;}}return false;}
function jplopsoft_showDropOverlay(){if(!state.vaultKey)return;jplopsoft_el('jplopsoft_dropFolderLabel').textContent='將在瀏覽器端加密後放入「'+jplopsoft_currentFolderLabel()+'」。單檔最大 1 GiB；圖片上傳前會先建立並加密 128×128 JPEG 縮圖，預覽只讀縮圖；原圖只在下載時解密。文字 >18 MiB、其他檔案 >24 MiB 自動使用 CHUNKED_V1。';jplopsoft_el('jplopsoft_dropOverlay').className='jplopsoft_drop-overlay';document.body.className=(document.body.className||'').replace(/\bjplopsoft_drop-active\b/g,'')+' jplopsoft_drop-active';}
function jplopsoft_hideDropOverlay(){var o=jplopsoft_el('jplopsoft_dropOverlay');if(o)o.className='jplopsoft_drop-overlay jplopsoft_hidden';document.body.className=(document.body.className||'').replace(/\s*\bjplopsoft_drop-active\b/g,'');state.dragDepth=0;}
function jplopsoft_importUniqueName(raw,reserved){var ext0=jplopsoft_fileExtension(raw),name=jplopsoft_validateName(raw,'file',ext0),dot,baseName,ext,n=2,candidate;if(!name)return null;dot=name.lastIndexOf('.');baseName=dot>0?name.substring(0,dot):name;ext=dot>0?name.substring(dot):'.txt';candidate=name;while(jplopsoft_siblingNameExists(state.currentFolder,candidate,0)||reserved[candidate.toLowerCase()]){candidate=baseName+' ('+n+')'+ext;n++;if(n>10000)return null;}reserved[candidate.toLowerCase()]=true;return candidate;}
function jplopsoft_uploadFiles(fileList){
  if(jplopsoft_isDesktopFolder())return alert('桌面只存放捷徑，請先進入一般資料夾再上傳。');
  if(!state.vaultKey)return alert('請先解密。');
  if(!window.FileReader)return alert('瀏覽器不支援 FileReader，無法匯入本機檔案。');

  var files=[],i,f,reserved={},ok=0,skipped=[];

  for(i=0;i<fileList.length;i++){
    f=fileList[i];
    if(f&&jplopsoft_supportedFileName(String(f.name||'')))files.push(f);
  }

  if(!files.length){alert('沒有可上傳的檔案。');return;}
  jplopsoft_setStatus('準備上傳 '+files.length+' 個檔案到「'+jplopsoft_currentFolderLabel()+'」…');

  function jplopsoft_finishAll(){
    jplopsoft_hideDropOverlay();
    jplopsoft_reloadNodes(function(){
      var msg='已加密上傳 '+ok+' 個檔案';
      if(skipped.length)msg+='；略過 / 失敗 '+skipped.length+' 個';
      jplopsoft_setStatus(msg+'。');
      if(skipped.length)alert(msg+'。\n\n'+skipped.join('\n'));
    });
  }

  function jplopsoft_next(idx){
    if(idx>=files.length){jplopsoft_finishAll();return;}

    var file=files[idx],name,fmt,isBin,isImage,smallLimit,useLarge;

    if(!file){jplopsoft_next(idx+1);return;}
    if(file.size>jplopsoft_MAX_LOGICAL_FILE_BYTES){
      skipped.push(file.name+'（超過 1 GiB 單檔上限）');
      jplopsoft_next(idx+1);return;
    }

    fmt=jplopsoft_fileFormatFromName(file.name);
    isBin=jplopsoft_binaryFormat(fmt);
    isImage=fmt==='image';
    smallLimit=isBin?jplopsoft_MEDIA_PREVIEW_MAX:jplopsoft_TEXT_ONLINE_EDIT_MAX;
    useLarge=file.size>smallLimit;

    if((isBin||useLarge)&&!jplopsoft_base64Ready()){
      skipped.push(file.name+'（base64.js 未載入）');
      jplopsoft_next(idx+1);return;
    }

    name=jplopsoft_importUniqueName(file.name,reserved);
    if(!name){skipped.push(file.name+'（檔名無效）');jplopsoft_next(idx+1);return;}
    var fileFek,fileFekWrap;try{fileFek=jplopsoft_newFek();fileFekWrap=jplopsoft_wrapFek(fileFek);}catch(fekErr){skipped.push(file.name+'（FEK 建立失敗：'+fekErr.message+'）');jplopsoft_next(idx+1);return;}

    function jplopsoft_uploadPrepared(thumbnail){
      var r;

      if(useLarge){
        jplopsoft_setStatus('大型檔案模式：'+jplopsoft_htmlEscape(name)+' ｜ 4 MiB 原圖加密 Block'+(isImage?' ｜ 128×128 JPEG 縮圖已獨立加密':'')+' ｜ 最大 1 GiB');
        jplopsoft_largeUploadFile(file,name,state.currentFolder,thumbnail,fileFek,fileFekWrap,function(err,out){
          if(err){
            skipped.push(file.name+'（大型分塊上傳中斷：'+err.message+'）');
          }else{
            ok++;
            state.selectedId=out.id;
          }
          jplopsoft_next(idx+1);
        });
        return;
      }

      r=new FileReader();
      r.onerror=function(){skipped.push(file.name+'（讀取失敗）');jplopsoft_next(idx+1);};
      r.onload=function(){
        var cipher;
        try{
          if(isBin){
            var bytes=(typeof Uint8Array!=='undefined')?new Uint8Array(r.result):r.result;
            cipher=jplopsoft_encBinaryBytes(bytes,fileFek);
          }else{
            cipher=jplopsoft_encContent(String(r.result||''),fileFek);
          }
        }catch(e){
          skipped.push(file.name+'（加密失敗：'+e.message+'）');
          jplopsoft_next(idx+1);return;
        }

        jplopsoft_setStatus('正在 '+(isBin?'Base64 + EXES':'EXES')+' 加密上傳 '+(idx+1)+' / '+files.length+'：'+jplopsoft_htmlEscape(name)+(isImage?' ｜ 原圖 + JPEG128_V1 加密縮圖':''));
        jplopsoft_uploadCipherInChunks(
          state.currentFolder,
          name,
          cipher,
          file.size||0,
          thumbnail,
          fileFekWrap,
          function(sent,total){
            var pct=total?Math.floor(sent*100/total):0;
            jplopsoft_setStatus('正在分段上傳 '+(idx+1)+' / '+files.length+'：'+jplopsoft_htmlEscape(name)+' ｜ '+pct+'% ｜ '+sent+' / '+total+' bytes');
          },
          function(err,out){
            if(err)skipped.push(file.name+'（'+err.message+'）');
            else{ok++;state.selectedId=out.id;}
            jplopsoft_next(idx+1);
          }
        );
      };

      try{
        if(isBin)r.readAsArrayBuffer(file);
        else r.readAsText(file,'UTF-8');
      }catch(e2){
        skipped.push(file.name+'（讀取失敗：'+e2.message+'）');
        jplopsoft_next(idx+1);
      }
    }

    if(isImage){
      /* Thumbnail is generated and encrypted before any upload API is called. */
      jplopsoft_setStatus('正在 Browser 端建立 128 × 128 JPEG 縮圖：'+jplopsoft_htmlEscape(name)+'…');
      jplopsoft_createEncryptedImageThumbnail(file,function(thumbErr,thumbnail){
        if(thumbErr){
          skipped.push(file.name+'（縮圖建立失敗，因此原圖未上傳：'+thumbErr.message+'）');
          jplopsoft_next(idx+1);
          return;
        }
        jplopsoft_setStatus('縮圖已完成並加密，準備上傳原圖：'+jplopsoft_htmlEscape(name)+' ｜ JPEG128_V1 '+jplopsoft_formatFileSize(thumbnail.plain_size));
        jplopsoft_uploadPrepared(thumbnail);
      },fileFek);
      return;
    }

    jplopsoft_uploadPrepared(null);
  }

  jplopsoft_next(0);
}
function jplopsoft_bindFileDrop(){var input=jplopsoft_el('jplopsoft_uploadFileInput');jplopsoft_el('jplopsoft_uploadFileBtn').onclick=function(){if(jplopsoft_isDesktopFolder())return alert('桌面只存放捷徑，請先進入一般資料夾再上傳。');if(!jplopsoft_isWritableProfileFolder(state.currentFolder))return alert('此位置唯讀。只能上傳到 C:\\Users\\'+state.samUsername+'\\ 內。');if(!state.vaultKey)return alert('請先解鎖。');input.value='';input.click();};input.onchange=function(){if(this.files&&this.files.length)jplopsoft_uploadFiles(this.files);this.value='';};document.addEventListener('dragenter',function(e){if(!jplopsoft_hasDraggedFiles(e))return;e.preventDefault();if(!state.vaultKey)return;state.dragDepth++;jplopsoft_showDropOverlay();});document.addEventListener('dragover',function(e){if(!jplopsoft_hasDraggedFiles(e))return;e.preventDefault();try{e.dataTransfer.dropEffect=state.vaultKey?'copy':'none';}catch(x){}if(state.vaultKey)jplopsoft_showDropOverlay();});document.addEventListener('dragleave',function(e){if(!jplopsoft_hasDraggedFiles(e)&&state.dragDepth<=0)return;if(state.dragDepth>0)state.dragDepth--;if(state.dragDepth<=0)jplopsoft_hideDropOverlay();});document.addEventListener('drop',function(e){if(!jplopsoft_hasDraggedFiles(e))return;e.preventDefault();var fs=e.dataTransfer&&e.dataTransfer.files;jplopsoft_hideDropOverlay();if(!state.vaultKey){alert('請先解鎖，再拖曳文件上傳。');return;}if(fs&&fs.length)jplopsoft_uploadFiles(fs);});}
function jplopsoft_createItem(type,fileFormat){if(jplopsoft_isDesktopFolder())return alert('桌面只存放捷徑，不能直接建立檔案或資料夾。');if(!jplopsoft_isWritableProfileFolder(state.currentFolder))return alert('此位置唯讀。只能在 C:\\Users\\'+state.samUsername+'\\ 內建立檔案或資料夾。');if(!state.vaultKey)return alert('請先解鎖。');var isFolder=type==='folder',fmt=fileFormat==='csv'?'csv':(fileFormat==='txt'?'txt':'html'),raw=window.prompt(isFolder?'新資料夾名稱：':(fmt==='csv'?'新 CSV 文件名稱：':(fmt==='txt'?'新文字文件名稱（可輸入 .txt/.ini/.conf/.xml/.asp/.js/.php 等文字副檔名）：':'新 HTML 文件名稱：')),isFolder?'新資料夾':(fmt==='csv'?'新文件.csv':(fmt==='txt'?'新文件.txt':'新文件.html')));if(raw===null)return;var name=jplopsoft_validateName(raw,type,fmt);if(!name)return;if(jplopsoft_siblingNameExists(state.currentFolder,name,0))return alert('同一資料夾已有相同名稱。');var content='',initial='',actualFmt=type==='file'?jplopsoft_fileFormatFromName(name):'';if(type==='file'&&(actualFmt==='image'||actualFmt==='binary'||actualFmt==='audio'||actualFmt==='video'||actualFmt==='rawvideo'))return alert('Binary / 圖片 / 影音檔案請使用「上傳文件」匯入；新建功能只建立 HTML、純文字或 CSV 文件。');try{var fek='',fekWrap='';if(type==='file'){fek=jplopsoft_newFek();fekWrap=jplopsoft_wrapFek(fek);if(actualFmt==='html')initial='<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>'+jplopsoft_htmlEscape(name)+'</title>\n</head>\n<body>\n<h1>'+jplopsoft_htmlEscape(name)+'</h1>\n<p>在這裡輸入 HTML 內容。</p>\n</body>\n</html>';else initial='';content=jplopsoft_encContent(initial,fek);}jplopsoft_api('create','POST',{parent_id:state.currentFolder,type:type,name_enc:jplopsoft_encName(name),content_enc:content,fek_wrap:fekWrap,original_size:(type==='file'?jplopsoft_utf8ByteLength(initial):0)},true,function(err,out){if(err)return alert(err.message);state.selectedId=out.id;jplopsoft_reloadNodes(function(){if(type==='file')jplopsoft_openEditor(out.id);});});}catch(e){alert(e.message);}}
function jplopsoft_renameSelected(){var n=jplopsoft_findNode(state.selectedId);if(!n)return alert('請先選取一個項目。');var old=jplopsoft_decName(n);if(old===null)return alert('檔名無法解密。');var raw=window.prompt('新的名稱：',old);if(raw===null)return;var preferred=n.type==='file'?jplopsoft_fileExtension(old):'',name=jplopsoft_validateName(raw,n.type,preferred),of,nf,ob,nb;if(!name)return;if(n.type==='file'){of=jplopsoft_fileFormatFromName(old);nf=jplopsoft_fileFormatFromName(name);ob=(of==='image'||of==='binary');nb=(nf==='image'||nf==='binary');if(ob!==nb)return alert('不可直接在「文字/HTML」與「Binary」兩種內容類別間變更副檔名。');}if(jplopsoft_siblingNameExists(n.parent_id,name,n.id))return alert('同一資料夾已有相同名稱。');try{jplopsoft_api('rename','POST',{id:n.id,name_enc:jplopsoft_encName(name)},true,function(err){if(err)return alert(err.message);jplopsoft_reloadNodes();});}catch(e){alert(e.message);}}

function jplopsoft_selectedMoveIds(){
  var ids=[],k;
  if(jplopsoft_checkedCount()>0){
    for(k in state.checkedIds){
      if(state.checkedIds.hasOwnProperty(k)&&state.checkedIds[k])ids.push(parseInt(k,10));
    }
  }else if(state.selectedId>0){
    ids.push(state.selectedId);
  }
  return ids;
}

function jplopsoft_moveSelectedFolderMap(ids){
  var map={},i,n;
  for(i=0;i<ids.length;i++){
    n=jplopsoft_findNode(ids[i]);
    if(n&&n.type==='folder')map[String(n.id)]=true;
  }
  return map;
}

function jplopsoft_invalidMoveTarget(targetId,ids){
  var selectedFolders=jplopsoft_moveSelectedFolderMap(ids),cur,guard=0;
  if(targetId===0)return false;

  cur=jplopsoft_findNode(targetId);
  while(cur&&guard<100000){
    guard++;
    if(selectedFolders[String(cur.id)])return true;
    if(cur.parent_id===0)break;
    cur=jplopsoft_findNode(cur.parent_id);
  }
  return false;
}

function jplopsoft_moveTargetName(targetId){
  var n;
  if(targetId===0)return '根目錄';
  n=jplopsoft_findNode(targetId);
  return n?(jplopsoft_decName(n)||('資料夾 #'+n.id)):('資料夾 #'+targetId);
}

function jplopsoft_moveNameConflict(targetId,ids){
  var selected={},existing={},dest=jplopsoft_childrenOf(targetId),i,n,name,key;

  for(i=0;i<ids.length;i++)selected[String(ids[i])]=true;

  for(i=0;i<dest.length;i++){
    n=dest[i];
    if(selected[String(n.id)])continue;
    name=jplopsoft_decName(n);
    if(name!==null)existing[String(name).toLowerCase()]=true;
  }

  for(i=0;i<ids.length;i++){
    n=jplopsoft_findNode(ids[i]);
    if(!n)continue;
    name=jplopsoft_decName(n);
    if(name===null)continue;
    key=String(name).toLowerCase();
    if(existing[key])return name;
    existing[key]=true;
  }

  return '';
}

function jplopsoft_setMoveTarget(id){
  id=parseInt(id,10);
  if(!(id>=0)||jplopsoft_invalidMoveTarget(id,state.moveIds))return;
  state.moveTarget=id;
  jplopsoft_renderMoveFolders();
}

function jplopsoft_appendMoveFolderRows(container,parent,depth){
  var list=jplopsoft_sortTreeNodes(jplopsoft_childrenOf(parent)),i,n,row,disabled;
  for(i=0;i<list.length;i++){
    n=list[i];
    if(n.type!=='folder')continue;

    disabled=jplopsoft_invalidMoveTarget(n.id,state.moveIds);
    row=document.createElement('div');
    row.className='jplopsoft_move-folder-row'+(state.moveTarget===n.id?' jplopsoft_selected':'')+(disabled?' jplopsoft_disabled':'');
    row.style.paddingLeft=(10+depth*22)+'px';
    row.innerHTML=(jplopsoft_isIE11Browser()?'':'<span class="jplopsoft_move-folder-icon">📁</span>')+'<span>'+jplopsoft_htmlEscape(jplopsoft_decName(n)||('[無法解密] #'+n.id))+'</span>';

    if(!disabled){
      (function(id,r){
        r.onclick=function(){jplopsoft_setMoveTarget(id);};
      })(n.id,row);
    }else{
      row.title='不能把資料夾移到自己或自己的子資料夾中';
    }

    container.appendChild(row);
    jplopsoft_appendMoveFolderRows(container,n.id,depth+1);
  }
}

function jplopsoft_renderMoveFolders(){
  var box=jplopsoft_el('jplopsoft_moveFolderList'),root=document.createElement('div'),disabled;
  box.innerHTML='';

  disabled=jplopsoft_invalidMoveTarget(0,state.moveIds);
  root.className='jplopsoft_move-folder-row'+(state.moveTarget===0?' jplopsoft_selected':'')+(disabled?' jplopsoft_disabled':'');
  root.innerHTML=(jplopsoft_isIE11Browser()?'':'<span class="jplopsoft_move-folder-icon">📁</span>')+'<span>根目錄</span>';
  if(!disabled)root.onclick=function(){jplopsoft_setMoveTarget(0);};
  box.appendChild(root);

  jplopsoft_appendMoveFolderRows(box,0,1);

  if(state.moveTarget>=0){
    jplopsoft_el('jplopsoft_moveDestination').textContent='目的地：'+jplopsoft_moveTargetName(state.moveTarget);
    jplopsoft_el('jplopsoft_moveConfirmBtn').disabled=false;
  }else{
    jplopsoft_el('jplopsoft_moveDestination').textContent='尚未選擇目的資料夾';
    jplopsoft_el('jplopsoft_moveConfirmBtn').disabled=true;
  }
}

function jplopsoft_openMoveDialog(){
  var ids=jplopsoft_selectedMoveIds(),i,n,folders=0,files=0;

  if(!ids.length){
    alert('請先勾選檔案/資料夾，或點選一個項目。');
    return;
  }

  for(i=0;i<ids.length;i++){
    n=jplopsoft_findNode(ids[i]);
    if(!n)continue;
    if(n.type==='folder')folders++;
    else files++;
  }

  state.moveIds=ids;
  state.moveTarget=-1;

  jplopsoft_el('jplopsoft_moveTitle').textContent='移動 '+ids.length+' 個項目';
  jplopsoft_el('jplopsoft_moveHelp').textContent=
    '已選取 '+ids.length+' 個項目（資料夾 '+folders+'、檔案 '+files+'）。選擇新的目的資料夾；移動只會修改目錄位置，不會重新加密或搬動 .x6f。';

  jplopsoft_renderMoveFolders();
  jplopsoft_el('jplopsoft_moveBackdrop').style.display='flex';
}

function jplopsoft_closeMoveDialog(){
  var b=jplopsoft_el('jplopsoft_moveBackdrop');
  if(b)b.style.display='none';
  state.moveIds=[];
  state.moveTarget=-1;
}

function jplopsoft_confirmMove(){
  var ids=state.moveIds.slice(0),target=state.moveTarget,i,n,allSame=true,conflict,msg;

  if(!ids.length||target<0)return;

  if(jplopsoft_invalidMoveTarget(target,ids)){
    alert('目的資料夾無效：不能把資料夾移到自己或自己的子資料夾中。');
    return;
  }

  for(i=0;i<ids.length;i++){
    n=jplopsoft_findNode(ids[i]);
    if(!n||n.parent_id!==target){
      allSame=false;
      break;
    }
  }
  if(allSame){
    alert('這些項目原本就已經在「'+jplopsoft_moveTargetName(target)+'」。');
    return;
  }

  conflict=jplopsoft_moveNameConflict(target,ids);
  if(conflict){
    alert('目的資料夾已經有同名項目：「'+conflict+'」。\n\n請先重新命名其中一個項目。');
    return;
  }

  msg='確定將 '+ids.length+' 個項目移動到「'+jplopsoft_moveTargetName(target)+'」嗎？\n\n移動只修改 flat-file parent_id；既有 .x6f 與版本檔不會搬動或重新加密。';
  if(!window.confirm(msg))return;

  jplopsoft_api('move_many','POST',{ids:ids,target_parent_id:target},true,function(err,out){
    if(err)return alert(err.message);
    jplopsoft_closeMoveDialog();
    state.selectedId=0;
    jplopsoft_clearChecked();
    jplopsoft_reloadNodes(function(){
      jplopsoft_setStatus('已移動 '+(out&&typeof out.moved==='number'?out.moved:ids.length)+' 個項目到「'+jplopsoft_moveTargetName(target)+'」。');
    });
  });
}


function jplopsoft_trashOriginalPath(item){
  var p=parseInt(item.original_parent_id,10)||0,n;
  if(p===0)return '根目錄';
  n=jplopsoft_findNode(p);
  if(!n)return '原資料夾已不存在或也在垃圾桶';
  return jplopsoft_folderPathText(p);
}
function jplopsoft_renderTrash(){
  var body=jplopsoft_el('jplopsoft_trashRows'),items=state.trashItems||[],i,item,tr,td,b,name,icon;
  body.innerHTML='';
  jplopsoft_el('jplopsoft_trashEmpty').className=items.length?'jplopsoft_trash-empty jplopsoft_hidden':'jplopsoft_trash-empty';
  jplopsoft_el('jplopsoft_trashSummary').textContent=items.length?'資源回收桶：'+items.length+' 個項目':'資源回收桶是空的';
  jplopsoft_el('jplopsoft_trashEmptyBtn').disabled=!items.length;

  for(i=0;i<items.length;i++){
    item=items[i];
    name=jplopsoft_decName(item)||('[無法解密] #'+item.id);
    icon=jplopsoft_isIE11Browser()?(item.type==='folder'?'[D]':'[F]'):(item.type==='folder'?'📁':'📄');

    tr=document.createElement('tr');

    td=document.createElement('td');
    td.innerHTML='<span class="jplopsoft_trash-name">'+icon+' '+jplopsoft_htmlEscape(name)+'</span>'+
      '<span class="jplopsoft_trash-sub">原位置：'+jplopsoft_htmlEscape(jplopsoft_trashOriginalPath(item))+'</span>';
    tr.appendChild(td);

    td=document.createElement('td');
    td.textContent=item.type==='folder'?'資料夾':'檔案';
    tr.appendChild(td);

    td=document.createElement('td');
    td.textContent=jplopsoft_fmtDate(item.trashed_at);
    tr.appendChild(td);

    td=document.createElement('td');
    td.textContent=(item.item_count||1)+(item.item_count>1?' 個節點':'');
    tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_actions';

    b=document.createElement('button');
    b.className='jplopsoft_btn jplopsoft_small jplopsoft_primary';
    b.textContent='還原';
    (function(id,btn){btn.onclick=function(){jplopsoft_restoreTrashItem(id);};})(item.id,b);
    td.appendChild(b);

    td.appendChild(document.createTextNode(' '));

    b=document.createElement('button');
    b.className='jplopsoft_btn jplopsoft_small jplopsoft_danger';
    b.textContent='永久刪除';
    (function(id,itemName,btn){btn.onclick=function(){jplopsoft_permanentDeleteTrashItem(id,itemName);};})(item.id,name,b);
    td.appendChild(b);

    tr.appendChild(td);
    body.appendChild(tr);
  }
}
function jplopsoft_refreshTrash(done){
  jplopsoft_api('trash_list','GET',null,true,function(err,out){
    if(err){
      if(done)done(err);
      else alert(err.message);
      return;
    }
    state.trashItems=out.items||[];
    jplopsoft_renderTrash();
    if(done)done(null);
  });
}
function jplopsoft_openTrash(){
  if(!state.vaultKey)return alert('請先解鎖。');
  jplopsoft_el('jplopsoft_trashBackdrop').style.display='flex';
  jplopsoft_taskbarEnsureApp('trash','trash','資源回收桶');
  jplopsoft_wmActivateOverlay('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');
  jplopsoft_el('jplopsoft_trashRows').innerHTML='';
  jplopsoft_el('jplopsoft_trashSummary').textContent='正在讀取資源回收桶…';
  jplopsoft_refreshTrash();
}
function jplopsoft_closeTrash(){
  if(jplopsoft_el('jplopsoft_trashBackdrop'))jplopsoft_el('jplopsoft_trashBackdrop').style.display='none';
  jplopsoft_taskbarRemoveApp('trash');
  state.trashItems=[];
}
function jplopsoft_restoreTrashItem(id){
  var item=null,i,name;
  for(i=0;i<state.trashItems.length;i++){
    if(state.trashItems[i].id===id){item=state.trashItems[i];break;}
  }
  if(!item)return;
  name=jplopsoft_decName(item)||('#'+id);

  if(!window.confirm(
    '確定還原「'+name+'」嗎？\n\n會優先回原資料夾；如果原資料夾不存在或也在垃圾桶，會回根目錄。'
  ))return;

  jplopsoft_api('trash_restore','POST',{id:id},true,function(err){
    if(err)return alert(err.message);
    jplopsoft_reloadNodes(function(){
      jplopsoft_refreshTrash();
      jplopsoft_setStatus('已還原「'+jplopsoft_htmlEscape(name)+'」。');
    });
  });
}
function jplopsoft_permanentDeleteTrashItem(id,name){
  if(!window.confirm(
    '確定永久刪除「'+name+'」嗎？\n\n此操作無法復原，會刪除 metadata、全部版本與對應 .x6f。'
  ))return;

  jplopsoft_api('trash_delete','POST',{id:id},true,function(err){
    if(err)return alert(err.message);
    jplopsoft_refreshTrash();
    jplopsoft_setStatus('已永久刪除「'+jplopsoft_htmlEscape(name)+'」。');
  });
}
function jplopsoft_emptyTrash(){
  var c=(state.trashItems||[]).length;
  if(!c)return;

  if(!window.confirm(
    '確定永久清空資源回收桶嗎？\n\n垃圾桶內 '+c+' 個根項目及其子資料夾、版本與 .x6f 都會永久刪除。'
  ))return;

  if(!window.confirm('最後確認：真的要永久清空資源回收桶？此操作無法復原。'))return;

  jplopsoft_api('trash_empty','POST',{},true,function(err,out){
    if(err)return alert(err.message);
    jplopsoft_refreshTrash();
    jplopsoft_setStatus('垃圾桶已永久清空，共刪除 '+(out.deleted||0)+' 個垃圾桶根項目。');
  });
}
function jplopsoft_deleteSelected(){var ids=[],k,n,name,msg,folders=0,files=0;if(jplopsoft_checkedCount()>0){for(k in state.checkedIds)if(state.checkedIds.hasOwnProperty(k)&&state.checkedIds[k])ids.push(parseInt(k,10));for(k=0;k<ids.length;k++){n=jplopsoft_findNode(ids[k]);if(n&&n.type==='folder')folders++;else if(n)files++;}msg='確定將已勾選的 '+ids.length+' 個項目移到垃圾桶嗎？';if(folders>0)msg+='\n\n其中包含 '+folders+' 個資料夾；資料夾內全部內容會一起進垃圾桶。';if(files>0)msg+='\n檔案：'+files+' 個';msg+='\n\n此時不會刪除 .x6f，可以從垃圾桶還原。';if(!window.confirm(msg))return;jplopsoft_api('delete_many','POST',{ids:ids},true,function(err,out){if(err)return alert(err.message);state.selectedId=0;jplopsoft_clearChecked();jplopsoft_reloadNodes(function(){jplopsoft_setStatus('已將 '+(out.trashed||ids.length)+' 個項目移到垃圾桶。');});});return;}n=jplopsoft_findNode(state.selectedId);if(!n)return alert('請先勾選檔案，或點選一個項目。');name=jplopsoft_decName(n)||('#'+n.id);msg=n.type==='folder'?'確定將資料夾「'+name+'」以及其中全部內容移到垃圾桶嗎？':'確定將「'+name+'」移到垃圾桶嗎？';msg+='\n\n此時不會刪除 .x6f，可以從垃圾桶還原。';if(!window.confirm(msg))return;jplopsoft_api('delete','POST',{id:n.id},true,function(err){if(err)return alert(err.message);state.selectedId=0;jplopsoft_reloadNodes(function(){jplopsoft_setStatus('已將「'+jplopsoft_htmlEscape(name)+'」移到垃圾桶。');});});}


function jplopsoft_bodyInnerFromSource(source){var m=String(source||'').match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);return m?m[1]:String(source||'');}
function jplopsoft_replaceBodyInner(source,bodyHtml){source=String(source||'');if(/<body\b[^>]*>[\s\S]*?<\/body\s*>/i.test(source))return source.replace(/(<body\b[^>]*>)[\s\S]*?(<\/body\s*>)/i,'$1'+bodyHtml+'$2');return '<!doctype html><html><head><meta charset="utf-8"></head><body>'+bodyHtml+'</body></html>';}
function jplopsoft_sanitizeFragmentIE11(source){
  var wrap=document.createElement('div'),
      all,i,j,node,tag,attr,name,val,
      banned={
        'SCRIPT':1,
        'STYLE':1,
        'IFRAME':1,
        'OBJECT':1,
        'EMBED':1,
        'BASE':1,
        'META':1,
        'LINK':1,
        'FORM':1,
        'INPUT':1,
        'BUTTON':1,
        'TEXTAREA':1,
        'SELECT':1,
        'OPTION':1,
        'SVG':1,
        'MATH':1
      };

  /*
   * IE11 uses its normal HTML parser on a detached DIV.
   * The DIV is never attached to the live page before sanitization.
   */
  try{
    wrap.innerHTML=String(source||'');
  }catch(e){
    return jplopsoft_htmlEscape(String(source||''));
  }

  all=wrap.getElementsByTagName('*');

  for(i=all.length-1;i>=0;i--){
    node=all[i];

    if(!node||!node.tagName)continue;

    tag=String(node.tagName).toUpperCase();

    if(banned[tag]){
      if(node.parentNode){
        node.parentNode.removeChild(node);
      }
      continue;
    }

    for(j=node.attributes.length-1;j>=0;j--){
      attr=node.attributes[j];

      if(!attr)continue;

      name=String(attr.name||'').toLowerCase();
      val=String(attr.value||'');

      if(
        name.indexOf('on')===0||
        name==='srcdoc'||
        name==='formaction'||
        name==='action'||
        name==='background'||
        name==='poster'||
        name==='srcset'
      ){
        node.removeAttribute(attr.name);
        continue;
      }

      if(
        name==='src'&&
        !(tag==='IMG'&&
          /^data:image\/(png|gif|jpeg|jpg|webp);base64,[a-z0-9+\/=]+$/i.test(val))
      ){
        node.removeAttribute(attr.name);
        continue;
      }

      if(
        (name==='href'||name==='xlink:href')&&
        /^\s*(javascript|data|vbscript):/i.test(val)
      ){
        node.removeAttribute(attr.name);
        continue;
      }

      if(
        name==='style'&&
        /(url\s*\(|expression\s*\(|@import|behavior\s*:|-moz-binding)/i.test(val)
      ){
        node.removeAttribute(attr.name);
        continue;
      }
    }
  }

  return wrap.innerHTML;
}

function jplopsoft_sanitizePreviewFragment(source){
  var body=jplopsoft_bodyInnerFromSource(source);

  if(jplopsoft_isIE11Browser()){
    return jplopsoft_sanitizeFragmentIE11(body);
  }

  return jplopsoft_sanitizeFragment(body);
}

function jplopsoft_sanitizeFragment(source){var doc=document.implementation.createHTMLDocument('edit'),wrap=doc.body,all,i,j,node,tag,attr,name,val;wrap.innerHTML=String(source||'');var banned={'SCRIPT':1,'STYLE':1,'IFRAME':1,'OBJECT':1,'EMBED':1,'BASE':1,'META':1,'LINK':1,'FORM':1,'INPUT':1,'BUTTON':1,'TEXTAREA':1,'SELECT':1,'OPTION':1,'SVG':1,'MATH':1};all=wrap.getElementsByTagName('*');for(i=all.length-1;i>=0;i--){node=all[i];tag=node.tagName.toUpperCase();if(banned[tag]){node.parentNode.removeChild(node);continue;}for(j=node.attributes.length-1;j>=0;j--){attr=node.attributes[j];name=attr.name.toLowerCase();val=String(attr.value||'');if(name.indexOf('on')===0||name==='srcdoc'||name==='formaction'||name==='action'||name==='background'||name==='poster'||name==='srcset'){node.removeAttribute(attr.name);continue;}if(name==='src'&&!(tag==='IMG'&&/^data:image\/(png|gif|jpeg|jpg|webp);base64,[a-z0-9+\/=]+$/i.test(val))){node.removeAttribute(attr.name);continue;}if((name==='href'||name==='xlink:href')&&/^\s*(javascript|data|vbscript):/i.test(val)){node.removeAttribute(attr.name);continue;}if(name==='style'&&/(url\s*\(|expression\s*\(|@import|behavior\s*:|-moz-binding)/i.test(val)){node.removeAttribute(attr.name);continue;}}}return wrap.innerHTML;}

var jplopsoft_RICH_SAVED_RANGE=null;
var jplopsoft_RICH_LAST_IMAGE=null;

function jplopsoft_richImageDataUrlValid(dataUrl){
  return /^data:image\/(png|gif|jpeg|jpg|webp);base64,[a-z0-9+\/=]+$/i.test(String(dataUrl||''));
}
function jplopsoft_richImageDataBytes(dataUrl){
  var s=String(dataUrl||''),p=s.indexOf(','),b64,pad=0;
  if(p<0)return 0;
  b64=s.substring(p+1);
  if(!b64)return 0;
  if(b64.charAt(b64.length-1)==='=')pad++;
  if(b64.length>1&&b64.charAt(b64.length-2)==='=')pad++;
  return Math.max(0,Math.floor(b64.length*3/4)-pad);
}
function jplopsoft_richSaveSelection(){
  var d=jplopsoft_richFrameDoc(),w,sel;
  if(!d)return false;
  try{
    w=d.defaultView||d.parentWindow;
    sel=w&&w.getSelection?w.getSelection():null;
    if(sel&&sel.rangeCount){jplopsoft_RICH_SAVED_RANGE=sel.getRangeAt(0).cloneRange();return true;}
  }catch(e){}
  return false;
}
function jplopsoft_richRestoreSelection(){
  var d=jplopsoft_richFrameDoc(),w,sel;
  if(!d||!jplopsoft_RICH_SAVED_RANGE)return false;
  try{
    w=d.defaultView||d.parentWindow;
    sel=w&&w.getSelection?w.getSelection():null;
    if(!sel)return false;
    sel.removeAllRanges();sel.addRange(jplopsoft_RICH_SAVED_RANGE);return true;
  }catch(e){}
  return false;
}
function jplopsoft_richInsertHtml(html){
  var d=jplopsoft_richFrameDoc(),w,sel,range,frag,tmp,last;
  if(!d||!d.body)return false;
  jplopsoft_richRestoreSelection();
  try{
    d.body.focus();
    if(d.execCommand&&d.execCommand('insertHTML',false,String(html||''))){jplopsoft_richSaveSelection();return true;}
  }catch(ignoreExec){}
  try{
    w=d.defaultView||d.parentWindow;sel=w&&w.getSelection?w.getSelection():null;
    if(!sel||!sel.rangeCount)return false;
    range=sel.getRangeAt(0);range.deleteContents();
    tmp=d.createElement('div');tmp.innerHTML=String(html||'');frag=d.createDocumentFragment();last=null;
    while(tmp.firstChild){last=frag.appendChild(tmp.firstChild);}
    range.insertNode(frag);
    if(last){range=d.createRange();range.setStartAfter(last);range.collapse(true);sel.removeAllRanges();sel.addRange(range);}
    jplopsoft_richSaveSelection();return true;
  }catch(e){}
  return false;
}
function jplopsoft_richCurrentProjectedSource(extraHtml){
  var d=jplopsoft_richFrameDoc(),src=jplopsoft_el('jplopsoft_htmlEditor').value,body=d&&d.body?d.body.innerHTML:jplopsoft_bodyInnerFromSource(src);
  return jplopsoft_replaceBodyInner(src,body+String(extraHtml||''));
}
function jplopsoft_richImageCountAndBytes(){
  var d=jplopsoft_richFrameDoc(),imgs=d&&d.body?d.body.getElementsByTagName('img'):[],i,src,count=0,bytes=0;
  for(i=0;i<imgs.length;i++){
    src=String(imgs[i].getAttribute('src')||'');
    if(jplopsoft_richImageDataUrlValid(src)){count++;bytes+=jplopsoft_richImageDataBytes(src);}
  }
  return {count:count,bytes:bytes};
}
function jplopsoft_richUpdateImageInfo(){
  var box=jplopsoft_el('jplopsoft_richImageInfo'),info,src,plain;
  if(!box)return;
  info=jplopsoft_richImageCountAndBytes();
  src=jplopsoft_richCurrentProjectedSource('');plain=jplopsoft_utf8ByteLength(src);
  box.textContent='內嵌圖片：'+info.count+' ｜ '+jplopsoft_formatFileSize(info.bytes)+' ｜ HTML '+jplopsoft_formatFileSize(plain);
  box.className='jplopsoft_rich-image-info'+(plain>jplopsoft_TEXT_ONLINE_EDIT_MAX*0.85?' jplopsoft_warn':'');
}
function jplopsoft_richSelectedImage(){
  var d=jplopsoft_richFrameDoc(),w,sel,node;
  if(!d)return null;
  try{
    w=d.defaultView||d.parentWindow;sel=w&&w.getSelection?w.getSelection():null;
    node=sel&&sel.anchorNode?sel.anchorNode:null;
    if(node&&node.nodeType===3)node=node.parentNode;
    while(node&&node!==d.body){if(String(node.tagName||'').toUpperCase()==='IMG')return node;node=node.parentNode;}
  }catch(e){}
  if(jplopsoft_RICH_LAST_IMAGE&&jplopsoft_RICH_LAST_IMAGE.ownerDocument===d)return jplopsoft_RICH_LAST_IMAGE;
  return null;
}
function jplopsoft_richImageProperties(){
  var img=jplopsoft_richSelectedImage(),alt,width,n;
  if(!img)return alert('請先在即時編輯區點選一張圖片。');
  alt=window.prompt('圖片替代文字（alt）：',String(img.getAttribute('alt')||''));if(alt===null)return;
  width=window.prompt('圖片寬度：可留空自動，或輸入 640、50%、640px。',String(img.style.width||img.getAttribute('width')||''));if(width===null)return;
  width=String(width||'').replace(/^\s+|\s+$/g,'');
  if(width!==''&&!/^\d{1,4}(?:px)?$/.test(width)&&!/^\d{1,3}%$/.test(width))return alert('寬度格式錯誤。請輸入 640、640px、50%，或留空。');
  if(/%$/.test(width)){n=parseInt(width,10);if(n<1||n>100)return alert('百分比寬度需為 1%～100%。');}
  else if(width!==''){n=parseInt(width,10);if(n<1||n>4000)return alert('像素寬度需為 1～4000。');width=n+'px';}
  img.setAttribute('alt',alt);
  img.style.maxWidth='100%';img.style.height='auto';
  if(width)img.style.width=width;else img.style.width='';
  jplopsoft_RICH_LAST_IMAGE=img;jplopsoft_richSaveSelection();jplopsoft_richUpdateImageInfo();
}
function jplopsoft_richFileNameAlt(name){return String(name||'圖片').replace(/[\r\n\t]+/g,' ').substring(0,200);}
function jplopsoft_richInsertImageDataUrl(dataUrl,fileName){
  var alt=jplopsoft_richFileNameAlt(fileName),html,projected;
  if(!jplopsoft_richImageDataUrlValid(dataUrl))throw new Error('只允許 PNG / JPEG / GIF / WebP 的 Base64 Data URL。SVG 與外部 URL 不會內嵌。');
  html='<img src="'+String(dataUrl)+'" alt="'+jplopsoft_htmlEscape(alt)+'" style="max-width:100%;height:auto">';
  projected=jplopsoft_richCurrentProjectedSource(html);
  if(jplopsoft_utf8ByteLength(projected)>jplopsoft_TEXT_ONLINE_EDIT_MAX)throw new Error('加入圖片後 HTML 會超過 18 MiB 線上編輯上限。請縮小圖片或減少內嵌圖片。');
  if(!jplopsoft_richInsertHtml(html+'<span>&nbsp;</span>'))throw new Error('瀏覽器無法在目前游標位置插入圖片。');
  jplopsoft_richUpdateImageInfo();
}
function jplopsoft_richInsertImageFile(file,done){
  var reader,size=parseInt(file&&file.size,10)||0,name=file&&file.name?String(file.name):'image';
  if(!file)return done(new Error('找不到圖片檔案。'));
  if(size<=0)return done(new Error('圖片檔案是空的：'+name));
  if(size>jplopsoft_HTML_EMBED_IMAGE_FILE_MAX)return done(new Error('單張內嵌圖片最多 '+jplopsoft_formatFileSize(jplopsoft_HTML_EMBED_IMAGE_FILE_MAX)+'：'+name));
  if(typeof FileReader==='undefined')return done(new Error('此瀏覽器沒有 FileReader，無法轉換 Base64 圖片。'));
  reader=new FileReader();
  reader.onerror=function(){done(new Error('讀取圖片失敗：'+name));};
  reader.onload=function(){
    var dataUrl=String(reader.result||'');
    if(!jplopsoft_richImageDataUrlValid(dataUrl))return done(new Error('不支援的圖片格式：'+name+'。只允許 PNG / JPEG / GIF / WebP。'));
    try{jplopsoft_richInsertImageDataUrl(dataUrl,name);done(null);}catch(e){done(e);}
  };
  try{reader.readAsDataURL(file);}catch(e2){done(e2);}
}
function jplopsoft_richInsertImageFiles(files){
  var list=[],i,index=0;
  if(!files||!files.length)return;
  for(i=0;i<files.length&&list.length<jplopsoft_HTML_EMBED_IMAGE_BATCH_MAX;i++)list.push(files[i]);
  if(files.length>jplopsoft_HTML_EMBED_IMAGE_BATCH_MAX)alert('一次最多插入 '+jplopsoft_HTML_EMBED_IMAGE_BATCH_MAX+' 張圖片，其餘未處理。');
  function next(err){
    if(err){alert(err.message||String(err));return;}
    if(index>=list.length){jplopsoft_setStatus('Base64 圖片已內嵌 HTML；儲存時會連同 HTML 一起由 ExES 加密。');return;}
    jplopsoft_setStatus('正在轉換圖片為 Base64：'+String(list[index].name||('image '+(index+1)))+' …');
    jplopsoft_richInsertImageFile(list[index++],next);
  }
  next(null);
}
function jplopsoft_richDropCaret(e,d){
  var range,sel,w;
  try{
    if(d.caretRangeFromPoint)range=d.caretRangeFromPoint(e.clientX,e.clientY);
    else if(d.caretPositionFromPoint){var p=d.caretPositionFromPoint(e.clientX,e.clientY);if(p){range=d.createRange();range.setStart(p.offsetNode,p.offset);range.collapse(true);}}
    if(range){w=d.defaultView||d.parentWindow;sel=w.getSelection();sel.removeAllRanges();sel.addRange(range);jplopsoft_richSaveSelection();}
  }catch(ignoreDropCaret){}
}
function jplopsoft_richClipboardImageFiles(e){
  var cd=e&&e.clipboardData?e.clipboardData:null,items=cd&&cd.items?cd.items:null,out=[],i,item,f;
  if(!items)return out;
  for(i=0;i<items.length;i++){item=items[i];if(item&&String(item.type||'').indexOf('image/')===0&&item.getAsFile){f=item.getAsFile();if(f)out.push(f);}}
  return out;
}
function jplopsoft_richBindFrameEvents(d){
  var body=d&&d.body?d.body:null;
  if(!body)return;
  body.onmouseup=function(){jplopsoft_richSaveSelection();};
  body.onkeyup=function(){jplopsoft_richSaveSelection();};
  body.onclick=function(e){var t=(e||window.event).target||(e||window.event).srcElement;if(t&&String(t.tagName||'').toUpperCase()==='IMG')jplopsoft_RICH_LAST_IMAGE=t;jplopsoft_richSaveSelection();};
  body.onpaste=function(e){var files=jplopsoft_richClipboardImageFiles(e);if(files.length){if(e.preventDefault)e.preventDefault();e.returnValue=false;jplopsoft_richSaveSelection();jplopsoft_richInsertImageFiles(files);return false;}return true;};
  body.ondragover=function(e){e=e||window.event;var files=e.dataTransfer&&e.dataTransfer.files?e.dataTransfer.files:null;if(files&&files.length){if(e.preventDefault)e.preventDefault();e.returnValue=false;return false;}return true;};
  body.ondrop=function(e){e=e||window.event;var files=e.dataTransfer&&e.dataTransfer.files?e.dataTransfer.files:null;if(files&&files.length){if(e.preventDefault)e.preventDefault();e.returnValue=false;jplopsoft_richDropCaret(e,d);jplopsoft_richInsertImageFiles(files);return false;}return true;};
}

function jplopsoft_richStyleBlocksFromSource(source){var out='',re=/<style\b[^>]*>([\s\S]*?)<\/style\s*>/ig,m,css;source=String(source||'');while((m=re.exec(source))!==null){css=String(m[1]||'');css=css.replace(/@import[\s\S]*?(?:;|$)/ig,'');css=css.replace(/expression\s*\([^)]*\)/ig,'');css=css.replace(/behavior\s*:[^;}]*/ig,'');css=css.replace(/-moz-binding\s*:[^;}]*/ig,'');out+='\n'+css;}return out;}
function jplopsoft_richFrameDoc(){var f=jplopsoft_el('jplopsoft_richEditorFrame');if(!f)return null;try{return f.contentDocument||(f.contentWindow?f.contentWindow.document:null);}catch(e){return null;}}
function jplopsoft_buildRichEditorDocument(source){
  var body=jplopsoft_sanitizeFragment(jplopsoft_bodyInnerFromSource(source)),css=jplopsoft_richStyleBlocksFromSource(source);
  return '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: blob:; style-src \'unsafe-inline\'; font-src data:; media-src \'none\'; connect-src \'none\'; frame-src \'none\'; object-src \'none\'"><style>html,body{min-height:100%;margin:0}body{box-sizing:border-box;padding:24px;font-family:Segoe UI,Microsoft JhengHei,sans-serif;line-height:1.6;word-wrap:break-word;overflow-wrap:anywhere;outline:none}img{max-width:100%;height:auto;cursor:pointer}img:hover{outline:2px solid #93c5fd;outline-offset:2px}blockquote{margin:1em 0;padding:.4em .9em;border-left:4px solid #94a3b8;background:#f8fafc;color:#475569}pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:10px;border-radius:5px;font-family:Consolas,Courier New,monospace}table{border-collapse:collapse}td,th{border:1px solid #bbb;padding:6px;min-width:40px}</style><style>'+css+'</style></head><body contenteditable="true" spellcheck="false">'+body+'</body></html>';
}
function jplopsoft_syncSourceToRich(){
  var d=jplopsoft_richFrameDoc(),html;
  if(!d)return;
  html=jplopsoft_buildRichEditorDocument(jplopsoft_el('jplopsoft_htmlEditor').value);
  try{
    d.open();d.write(html);d.close();d.body.contentEditable='true';d.body.spellcheck=false;
    jplopsoft_RICH_SAVED_RANGE=null;jplopsoft_RICH_LAST_IMAGE=null;
    jplopsoft_richBindFrameEvents(d);jplopsoft_richUpdateImageInfo();
  }catch(e){throw new Error('即時編輯器初始化失敗：'+e.message);}
}
function jplopsoft_syncRichToSource(){
  var d=jplopsoft_richFrameDoc();
  if(!d||!d.body)return;
  jplopsoft_el('jplopsoft_htmlEditor').value=jplopsoft_replaceBodyInner(jplopsoft_el('jplopsoft_htmlEditor').value,d.body.innerHTML);
  jplopsoft_richUpdateImageInfo();
}
function jplopsoft_execRich(cmd,value){
  var d=jplopsoft_richFrameDoc();
  if(!d||!d.body)return;
  try{jplopsoft_richRestoreSelection();d.body.focus();d.execCommand(cmd,false,value===undefined?null:value);jplopsoft_richSaveSelection();jplopsoft_richUpdateImageInfo();}catch(e){}
}
var jplopsoft_CSV_GRID_MIN_ROWS=20;
var jplopsoft_CSV_GRID_MIN_COLS=8;
var jplopsoft_CSV_GRID_MAX_ROWS=1000;
var jplopsoft_CSV_GRID_MAX_COLS=100;

function jplopsoft_csvColumnName(index){
  var n=(parseInt(index,10)||0)+1,s='',r;
  while(n>0){
    r=(n-1)%26;
    s=String.fromCharCode(65+r)+s;
    n=Math.floor((n-1)/26);
  }
  return s||'A';
}
function jplopsoft_csvCellName(row,col){return jplopsoft_csvColumnName(col)+(row+1);}
function jplopsoft_csvParse(source){
  var s=String(source===undefined||source===null?'':source),rows=[],row=[],field='',i=0,ch,quoted=false,hadBom=false;
  if(s.charAt(0)==='\ufeff'){hadBom=true;s=s.substring(1);}
  while(i<s.length){
    ch=s.charAt(i);
    if(quoted){
      if(ch==='"'){
        if(i+1<s.length&&s.charAt(i+1)==='"'){field+='"';i+=2;continue;}
        quoted=false;i++;continue;
      }
      field+=ch;i++;continue;
    }
    if(ch==='"'&&field===''){quoted=true;i++;continue;}
    if(ch===','){row.push(field);field='';i++;continue;}
    if(ch==='\r'){
      row.push(field);field='';rows.push(row);row=[];
      if(i+1<s.length&&s.charAt(i+1)==='\n')i+=2;else i++;
      continue;
    }
    if(ch==='\n'){row.push(field);field='';rows.push(row);row=[];i++;continue;}
    field+=ch;i++;
  }
  if(quoted)throw new Error('CSV 格式錯誤：雙引號欄位沒有結束。');
  if(field!==''||row.length>0||s.length===0){row.push(field);rows.push(row);}
  if(s.length>0&&(s.substr(s.length-2)==='\r\n'||s.charAt(s.length-1)==='\n'||s.charAt(s.length-1)==='\r')&&rows.length>1&&rows[rows.length-1].length===1&&rows[rows.length-1][0]==='')rows.pop();
  return {rows:rows,hadBom:hadBom};
}
function jplopsoft_csvEscapeField(value){
  var s=String(value===undefined||value===null?'':value);
  if(s.indexOf(',')>=0||s.indexOf('"')>=0||s.indexOf('\r')>=0||s.indexOf('\n')>=0||/^\s|\s$/.test(s))return '"'+s.replace(/"/g,'""')+'"';
  return s;
}
function jplopsoft_csvEffectiveSize(data){
  var rows=data||[],lastRow=-1,lastCol=-1,r,c,row;
  for(r=0;r<rows.length;r++){
    row=rows[r]||[];
    for(c=0;c<row.length;c++){
      if(String(row[c]===undefined?'':row[c])!==''){if(r>lastRow)lastRow=r;if(c>lastCol)lastCol=c;}
    }
  }
  if(lastRow<0||lastCol<0)return {rows:0,cols:0};
  return {rows:lastRow+1,cols:lastCol+1};
}
function jplopsoft_csvSerialize(data,hadBom){
  var size=jplopsoft_csvEffectiveSize(data),lines=[],r,c,row,fields,prefix=hadBom?'\ufeff':'';
  if(size.rows===0||size.cols===0)return prefix;
  for(r=0;r<size.rows;r++){
    row=data[r]||[];fields=[];
    for(c=0;c<size.cols;c++)fields.push(jplopsoft_csvEscapeField(c<row.length?row[c]:''));
    lines.push(fields.join(','));
  }
  return prefix+lines.join('\r\n');
}
function jplopsoft_csvEnsureGrid(rows,minRows,minCols){
  var data=rows||[],r,c,maxCols=0;
  if(data.length>jplopsoft_CSV_GRID_MAX_ROWS)throw new Error('CSV 有 '+data.length+' 列，超過試算表介面的 '+jplopsoft_CSV_GRID_MAX_ROWS+' 列上限。');
  for(r=0;r<data.length;r++){
    if(!data[r]||typeof data[r].length==='undefined')data[r]=[];
    if(data[r].length>maxCols)maxCols=data[r].length;
  }
  if(maxCols>jplopsoft_CSV_GRID_MAX_COLS)throw new Error('CSV 有 '+maxCols+' 欄，超過試算表介面的 '+jplopsoft_CSV_GRID_MAX_COLS+' 欄上限。');
  minRows=Math.max(minRows||1,data.length||1);
  minCols=Math.max(minCols||1,maxCols||1);
  if(minRows>jplopsoft_CSV_GRID_MAX_ROWS)minRows=jplopsoft_CSV_GRID_MAX_ROWS;
  if(minCols>jplopsoft_CSV_GRID_MAX_COLS)minCols=jplopsoft_CSV_GRID_MAX_COLS;
  while(data.length<minRows)data.push([]);
  for(r=0;r<data.length;r++){
    while(data[r].length<minCols)data[r].push('');
    for(c=0;c<data[r].length;c++)data[r][c]=data[r][c]===undefined||data[r][c]===null?'':String(data[r][c]);
  }
  return data;
}
function jplopsoft_csvSelectedCellInput(){
  return document.querySelector('#jplopsoft_csvSheetBody input[data-csv-r="'+state.csvSelectedRow+'"][data-csv-c="'+state.csvSelectedCol+'"]');
}
function jplopsoft_csvRefreshSelection(){
  var old=document.querySelector('#jplopsoft_csvSheetBody td.jplopsoft_csv-cell.jplopsoft_selected'),input=jplopsoft_csvSelectedCellInput(),td;
  if(old)old.className='jplopsoft_csv-cell';
  if(input){td=input.parentNode;if(td)td.className='jplopsoft_csv-cell jplopsoft_selected';}
  if(jplopsoft_el('jplopsoft_csvNameBox'))jplopsoft_el('jplopsoft_csvNameBox').value=jplopsoft_csvCellName(state.csvSelectedRow,state.csvSelectedCol);
  if(jplopsoft_el('jplopsoft_csvFormulaInput')){
    jplopsoft_el('jplopsoft_csvFormulaInput').value=state.csvData[state.csvSelectedRow]&&state.csvData[state.csvSelectedRow][state.csvSelectedCol]!==undefined?state.csvData[state.csvSelectedRow][state.csvSelectedCol]:'';
    jplopsoft_el('jplopsoft_csvFormulaInput').readOnly=!!state.csvReadOnly;
  }
}
function jplopsoft_csvSelectCell(row,col,focusCell){
  row=parseInt(row,10)||0;col=parseInt(col,10)||0;
  if(row<0)row=0;if(col<0)col=0;
  if(row>=state.csvData.length)row=Math.max(0,state.csvData.length-1);
  if(state.csvData[row]&&col>=state.csvData[row].length)col=Math.max(0,state.csvData[row].length-1);
  state.csvSelectedRow=row;state.csvSelectedCol=col;jplopsoft_csvRefreshSelection();
  if(focusCell){var input=jplopsoft_csvSelectedCellInput();if(input)try{input.focus();input.select();}catch(ignoreFocus){}}
}
function jplopsoft_csvUpdateSheetSize(){
  var rows=state.csvData.length,cols=rows&&state.csvData[0]?state.csvData[0].length:0,box=jplopsoft_el('jplopsoft_csvSheetSize');
  if(box)box.innerHTML='<strong>'+rows+'</strong> 列 × <strong>'+cols+'</strong> 欄';
}
function jplopsoft_renderCsvGrid(){
  var head=jplopsoft_el('jplopsoft_csvSheetHead'),body=jplopsoft_el('jplopsoft_csvSheetBody'),rows=state.csvData,cols=rows.length&&rows[0]?rows[0].length:0,tr,th,td,input,r,c;
  head.innerHTML='';body.innerHTML='';
  tr=document.createElement('tr');th=document.createElement('th');th.className='jplopsoft_csv-corner';tr.appendChild(th);
  for(c=0;c<cols;c++){
    th=document.createElement('th');th.textContent=jplopsoft_csvColumnName(c);th.setAttribute('data-csv-col-head',c);
    (function(col,cell){cell.onclick=function(){jplopsoft_csvSelectCell(state.csvSelectedRow,col,false);};})(c,th);
    tr.appendChild(th);
  }
  head.appendChild(tr);
  for(r=0;r<rows.length;r++){
    tr=document.createElement('tr');th=document.createElement('th');th.className='jplopsoft_csv-row-head';th.textContent=String(r+1);th.setAttribute('data-csv-row-head',r);
    (function(row,cell){cell.onclick=function(){jplopsoft_csvSelectCell(row,state.csvSelectedCol,false);};})(r,th);
    tr.appendChild(th);
    for(c=0;c<cols;c++){
      td=document.createElement('td');td.className='jplopsoft_csv-cell';
      input=document.createElement('input');input.type='text';input.className='jplopsoft_csv-cell-input';input.value=rows[r][c];input.readOnly=!!state.csvReadOnly;input.setAttribute('data-csv-r',r);input.setAttribute('data-csv-c',c);input.setAttribute('aria-label',jplopsoft_csvCellName(r,c));
      (function(row,col,box){
        box.onfocus=function(){jplopsoft_csvSelectCell(row,col,false);};
        box.oninput=function(){if(state.csvReadOnly)return;state.csvData[row][col]=box.value;if(row===state.csvSelectedRow&&col===state.csvSelectedCol&&jplopsoft_el('jplopsoft_csvFormulaInput'))jplopsoft_el('jplopsoft_csvFormulaInput').value=box.value;};
        box.onkeydown=function(ev){
          ev=ev||window.event;var k=ev.keyCode||ev.which;
          if(k===13){if(ev.preventDefault)ev.preventDefault();jplopsoft_csvSelectCell(Math.min(row+1,state.csvData.length-1),col,true);return false;}
          if(k===9){
            if(ev.preventDefault)ev.preventDefault();
            if(ev.shiftKey){if(col>0)jplopsoft_csvSelectCell(row,col-1,true);else if(row>0)jplopsoft_csvSelectCell(row-1,state.csvData[row-1].length-1,true);}
            else{if(col+1<state.csvData[row].length)jplopsoft_csvSelectCell(row,col+1,true);else if(row+1<state.csvData.length)jplopsoft_csvSelectCell(row+1,0,true);}
            return false;
          }
        };
      })(r,c,input);
      td.appendChild(input);tr.appendChild(td);
    }
    body.appendChild(tr);
  }
  jplopsoft_csvUpdateSheetSize();jplopsoft_csvRefreshSelection();

  if(
    jplopsoft_isIE11Browser()&&
    jplopsoft_el('jplopsoft_modalBackdrop')&&
    jplopsoft_el('jplopsoft_modalBackdrop').style.display!=='none'
  ){
    setTimeout(jplopsoft_ie11FitDocumentModal,0);
  }
}
function jplopsoft_csvLoadEditor(source,readOnly){
  var parsed=jplopsoft_csvParse(source);
  state.csvHadBom=!!parsed.hadBom;state.csvReadOnly=!!readOnly;state.csvSelectedRow=0;state.csvSelectedCol=0;
  state.csvData=jplopsoft_csvEnsureGrid(parsed.rows,jplopsoft_CSV_GRID_MIN_ROWS,jplopsoft_CSV_GRID_MIN_COLS);
  jplopsoft_renderCsvGrid();
  jplopsoft_el('jplopsoft_csvAddRowBtn').disabled=state.csvReadOnly;jplopsoft_el('jplopsoft_csvAddColBtn').disabled=state.csvReadOnly;jplopsoft_el('jplopsoft_csvDelRowBtn').disabled=state.csvReadOnly;jplopsoft_el('jplopsoft_csvDelColBtn').disabled=state.csvReadOnly;
}
function jplopsoft_csvCurrentSource(){return jplopsoft_csvSerialize(state.csvData,state.csvHadBom);}
function jplopsoft_csvAddRow(){
  var cols,c;if(state.csvReadOnly)return;
  if(state.csvData.length>=jplopsoft_CSV_GRID_MAX_ROWS)return alert('CSV 試算表最多 '+jplopsoft_CSV_GRID_MAX_ROWS+' 列。');
  cols=state.csvData.length&&state.csvData[0]?state.csvData[0].length:jplopsoft_CSV_GRID_MIN_COLS;state.csvData.push([]);
  for(c=0;c<cols;c++)state.csvData[state.csvData.length-1].push('');
  jplopsoft_renderCsvGrid();jplopsoft_csvSelectCell(state.csvData.length-1,state.csvSelectedCol,true);
}
function jplopsoft_csvAddColumn(){
  var r;if(state.csvReadOnly)return;
  if(state.csvData.length&&state.csvData[0].length>=jplopsoft_CSV_GRID_MAX_COLS)return alert('CSV 試算表最多 '+jplopsoft_CSV_GRID_MAX_COLS+' 欄。');
  for(r=0;r<state.csvData.length;r++)state.csvData[r].push('');
  jplopsoft_renderCsvGrid();jplopsoft_csvSelectCell(state.csvSelectedRow,state.csvData[0].length-1,true);
}
function jplopsoft_csvDeleteRow(){
  if(state.csvReadOnly)return;if(state.csvData.length<=1)return alert('至少需要保留 1 列。');
  state.csvData.splice(state.csvSelectedRow,1);if(state.csvSelectedRow>=state.csvData.length)state.csvSelectedRow=state.csvData.length-1;
  jplopsoft_renderCsvGrid();jplopsoft_csvSelectCell(state.csvSelectedRow,state.csvSelectedCol,true);
}
function jplopsoft_csvDeleteColumn(){
  var r,cols;if(state.csvReadOnly)return;
  cols=state.csvData.length&&state.csvData[0]?state.csvData[0].length:0;if(cols<=1)return alert('至少需要保留 1 欄。');
  for(r=0;r<state.csvData.length;r++)state.csvData[r].splice(state.csvSelectedCol,1);
  if(state.csvSelectedCol>=cols-1)state.csvSelectedCol=cols-2;
  jplopsoft_renderCsvGrid();jplopsoft_csvSelectCell(state.csvSelectedRow,state.csvSelectedCol,true);
}
function jplopsoft_csvPrintableTableHtml(){
  var size=jplopsoft_csvEffectiveSize(state.csvData),rows=size.rows||1,cols=size.cols||1,h='<table class="jplopsoft_exfs-print-csv"><thead><tr><th></th>',r,c,value;
  for(c=0;c<cols;c++)h+='<th>'+jplopsoft_htmlEscape(jplopsoft_csvColumnName(c))+'</th>';
  h+='</tr></thead><tbody>';
  for(r=0;r<rows;r++){
    h+='<tr><th>'+(r+1)+'</th>';
    for(c=0;c<cols;c++){
      value=state.csvData[r]&&state.csvData[r][c]!==undefined?state.csvData[r][c]:'';
      h+='<td>'+jplopsoft_htmlEscape(String(value)).replace(/\n/g,'<br>')+'</td>';
    }
    h+='</tr>';
  }
  return h+'</tbody></table>';
}

function jplopsoft_showSourceTab(){if(state.editorMode==='rich')jplopsoft_syncRichToSource();state.editorMode='source';jplopsoft_el('jplopsoft_tabEdit').className='jplopsoft_tabbtn jplopsoft_active';jplopsoft_el('jplopsoft_tabRich').className='jplopsoft_tabbtn';jplopsoft_el('jplopsoft_tabPreview').className='jplopsoft_tabbtn';jplopsoft_el('jplopsoft_htmlEditor').className='jplopsoft_editor';jplopsoft_el('jplopsoft_richPane').className='jplopsoft_rich-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_htmlPreview').className='jplopsoft_preview jplopsoft_hidden';jplopsoft_el('jplopsoft_csvPane').className='jplopsoft_csv-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_imagePreviewPane').className='jplopsoft_image-preview-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_mediaPreviewPane').className='jplopsoft_media-preview-pane jplopsoft_hidden';jplopsoft_revokePreview();jplopsoft_revokeImagePreview();jplopsoft_revokeMediaPreview();}
function jplopsoft_showRichTab(){
  if(state.openFormat!=='html')return;
  if(state.editorMode!=='rich')jplopsoft_syncSourceToRich();
  state.editorMode='rich';
  jplopsoft_el('jplopsoft_tabEdit').className='jplopsoft_tabbtn';
  jplopsoft_el('jplopsoft_tabRich').className='jplopsoft_tabbtn jplopsoft_active';
  jplopsoft_el('jplopsoft_tabPreview').className='jplopsoft_tabbtn';
  jplopsoft_el('jplopsoft_htmlEditor').className='jplopsoft_editor jplopsoft_hidden';
  jplopsoft_el('jplopsoft_richPane').className='jplopsoft_rich-pane';
  jplopsoft_el('jplopsoft_htmlPreview').className='jplopsoft_preview jplopsoft_hidden';
  jplopsoft_el('jplopsoft_csvPane').className='jplopsoft_csv-pane jplopsoft_hidden';
  jplopsoft_el('jplopsoft_imagePreviewPane').className='jplopsoft_image-preview-pane jplopsoft_hidden';
  jplopsoft_el('jplopsoft_mediaPreviewPane').className='jplopsoft_media-preview-pane jplopsoft_hidden';
  jplopsoft_revokePreview();jplopsoft_revokeImagePreview();jplopsoft_revokeMediaPreview();jplopsoft_richUpdateImageInfo();
}
function jplopsoft_showPreview(src){if(state.openFormat!=='html')return; if(state.editorMode==='rich')jplopsoft_syncRichToSource();state.editorMode='preview';jplopsoft_el('jplopsoft_tabEdit').className='jplopsoft_tabbtn';jplopsoft_el('jplopsoft_tabRich').className='jplopsoft_tabbtn';jplopsoft_el('jplopsoft_tabPreview').className='jplopsoft_tabbtn jplopsoft_active';jplopsoft_el('jplopsoft_htmlEditor').className='jplopsoft_editor jplopsoft_hidden';jplopsoft_el('jplopsoft_richPane').className='jplopsoft_rich-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_csvPane').className='jplopsoft_csv-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_imagePreviewPane').className='jplopsoft_image-preview-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_mediaPreviewPane').className='jplopsoft_media-preview-pane jplopsoft_hidden';jplopsoft_revokeImagePreview();jplopsoft_revokeMediaPreview();if(jplopsoft_isIE11Browser()){jplopsoft_el('jplopsoft_htmlPreview').className='jplopsoft_preview jplopsoft_hidden';jplopsoft_el('jplopsoft_htmlPreviewIE11').className='jplopsoft_ie11-html-preview';}else{jplopsoft_el('jplopsoft_htmlPreviewIE11').className='jplopsoft_ie11-html-preview jplopsoft_hidden';jplopsoft_el('jplopsoft_htmlPreview').className='jplopsoft_preview';}jplopsoft_renderPreview(src===undefined?jplopsoft_el('jplopsoft_htmlEditor').value:src);}
function jplopsoft_revokeImagePreview(){if(state.imagePreviewUrl){try{(window.URL||window.webkitURL).revokeObjectURL(state.imagePreviewUrl);}catch(e){}state.imagePreviewUrl=null;}var img=jplopsoft_el('jplopsoft_imagePreviewImage');if(img)img.removeAttribute('src');}
function jplopsoft_revokeMediaPreview(){var a=jplopsoft_el('jplopsoft_audioPreview'),v=jplopsoft_el('jplopsoft_videoPreview');if(a){try{a.pause();}catch(e1){}a.removeAttribute('src');try{a.load();}catch(e2){}}if(v){try{v.pause();}catch(e3){}v.removeAttribute('src');try{v.load();}catch(e4){}}if(state.mediaPreviewUrl){try{(window.URL||window.webkitURL).revokeObjectURL(state.mediaPreviewUrl);}catch(e5){}state.mediaPreviewUrl=null;}}
function jplopsoft_hideDocumentPanes(){jplopsoft_el('jplopsoft_htmlEditor').className='jplopsoft_editor jplopsoft_hidden';jplopsoft_el('jplopsoft_richPane').className='jplopsoft_rich-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_htmlPreview').className='jplopsoft_preview jplopsoft_hidden';jplopsoft_el('jplopsoft_htmlPreviewIE11').className='jplopsoft_ie11-html-preview jplopsoft_hidden';jplopsoft_el('jplopsoft_csvPane').className='jplopsoft_csv-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_imagePreviewPane').className='jplopsoft_image-preview-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_mediaPreviewPane').className='jplopsoft_media-preview-pane jplopsoft_hidden';jplopsoft_revokePreview();jplopsoft_revokeImagePreview();jplopsoft_revokeMediaPreview();}
function jplopsoft_openImagePreview(id){
  var n=jplopsoft_findNode(id),name=n?jplopsoft_decName(n):'',URLObj=window.URL||window.webkitURL,img,note;
  if(!n||n.type!=='file'||jplopsoft_fileFormatFromName(name)!=='image')return;
  if(!jplopsoft_nodeHasThumbnail(n))return alert('此圖片沒有 JPEG128_V1 加密縮圖，因此不允許直接解密原圖預覽。請重新上傳圖片。');

  jplopsoft_setStatus('正在讀取圖片 128 × 128 加密縮圖「'+jplopsoft_htmlEscape(name)+'」…');
  jplopsoft_fetchImageThumbnail(id,function(err,bytes,out){
    var blob;
    if(err)return alert(err.message);

    state.editId=0;
    state.openId=id;
    state.openFormat='image';
    state.editorMode='preview';
    jplopsoft_el('jplopsoft_modalTitle').textContent='縮圖預覽：'+(name||('#'+id));
    jplopsoft_el('jplopsoft_saveDocBtn').className='jplopsoft_btn jplopsoft_primary jplopsoft_hidden';
    jplopsoft_el('jplopsoft_modalTabs').className='jplopsoft_modal-tabs jplopsoft_hidden';
    jplopsoft_hideDocumentPanes();
    jplopsoft_el('jplopsoft_imagePreviewPane').className='jplopsoft_image-preview-pane';

    note=jplopsoft_el('jplopsoft_imagePreviewNote');
    note.textContent=name+' ｜ 128 × 128 JPEG 加密縮圖 ｜ '+jplopsoft_formatFileSize(bytes.length)+' ｜ 原圖 '+jplopsoft_formatFileSize(n.original_size||0)+' 僅在下載時解密';
    img=jplopsoft_el('jplopsoft_imagePreviewImage');
    img.onerror=function(){
      note.textContent='加密縮圖已成功解密，但瀏覽器無法顯示 JPEG 縮圖；原圖仍可下載。';
      jplopsoft_setStatus('JPEG 縮圖解密成功，但瀏覽器顯示失敗。');
    };
    img.onload=function(){jplopsoft_setStatus('128 × 128 加密縮圖預覽已載入；未讀取原圖。');};

    try{
      blob=new Blob([(typeof Uint8Array!=='undefined')?new Uint8Array(bytes):bytes],{type:'image/jpeg'});
      if(URLObj&&URLObj.createObjectURL){
        state.imagePreviewUrl=URLObj.createObjectURL(blob);
        img.src=state.imagePreviewUrl;
      }else throw new Error('ObjectURL unavailable');
    }catch(e2){return alert('縮圖預覽失敗：'+e2.message);}

    jplopsoft_showDocumentModal();
    jplopsoft_updateGalleryButtons();
  });
}
function jplopsoft_binaryBytesToUint8(bytes){
  var out,i;

  if(typeof Uint8Array==='undefined'){
    return bytes;
  }

  if(bytes instanceof Uint8Array){
    return bytes;
  }

  out=new Uint8Array(bytes&&bytes.length?bytes.length:0);

  for(i=0;i<out.length;i++){
    out[i]=bytes[i]&255;
  }

  return out;
}

function jplopsoft_mediaAscii(bytes,start,count){
  var s='',i,end;

  start=parseInt(start,10)||0;
  count=parseInt(count,10)||0;
  end=Math.min(bytes.length,start+count);

  for(i=start;i<end;i++){
    s+=String.fromCharCode(bytes[i]&255);
  }

  return s;
}

function jplopsoft_mediaHexPrefix(bytes,count){
  var out=[],i,n;

  count=Math.min(
    parseInt(count,10)||16,
    bytes&&bytes.length?bytes.length:0
  );

  for(i=0;i<count;i++){
    n=(bytes[i]&255).toString(16).toUpperCase();
    if(n.length<2)n='0'+n;
    out.push(n);
  }

  return out.join(' ');
}

function jplopsoft_mediaMpegAudioFrameLength(bytes,pos){
  var b1,b2,b3,
      versionBits,layerBits,bitrateIndex,sampleIndex,padding,
      version,layer,bitrateTable,sampleTable,bitrate,sampleRate;

  if(!bytes||pos<0||pos+3>=bytes.length)return 0;

  b1=bytes[pos]&255;
  b2=bytes[pos+1]&255;
  b3=bytes[pos+2]&255;

  if(b1!==0xFF||(b2&0xE0)!==0xE0)return 0;

  versionBits=(b2>>3)&0x03;
  layerBits=(b2>>1)&0x03;

  if(versionBits===1||layerBits===0)return 0;

  bitrateIndex=(b3>>4)&0x0F;
  sampleIndex=(b3>>2)&0x03;
  padding=(b3>>1)&0x01;

  if(
    bitrateIndex===0||
    bitrateIndex===15||
    sampleIndex===3
  ){
    return 0;
  }

  version=
    versionBits===3
      ?1
      :(versionBits===2?2:25);

  layer=
    layerBits===3
      ?1
      :(layerBits===2?2:3);

  if(version===1){
    if(layer===1){
      bitrateTable=[
        0,32,64,96,128,160,192,224,
        256,288,320,352,384,416,448
      ];
    }else if(layer===2){
      bitrateTable=[
        0,32,48,56,64,80,96,112,
        128,160,192,224,256,320,384
      ];
    }else{
      bitrateTable=[
        0,32,40,48,56,64,80,96,
        112,128,160,192,224,256,320
      ];
    }
  }else{
    if(layer===1){
      bitrateTable=[
        0,32,48,56,64,80,96,112,
        128,144,160,176,192,224,256
      ];
    }else{
      bitrateTable=[
        0,8,16,24,32,40,48,56,
        64,80,96,112,128,144,160
      ];
    }
  }

  bitrate=bitrateTable[bitrateIndex]*1000;

  if(version===1){
    sampleTable=[44100,48000,32000];
  }else if(version===2){
    sampleTable=[22050,24000,16000];
  }else{
    sampleTable=[11025,12000,8000];
  }

  sampleRate=sampleTable[sampleIndex];

  if(!bitrate||!sampleRate)return 0;

  if(layer===1){
    return Math.floor(
      ((12*bitrate/sampleRate)+padding)*4
    );
  }

  if(layer===3&&version!==1){
    return Math.floor(
      (72*bitrate/sampleRate)+padding
    );
  }

  return Math.floor(
    (144*bitrate/sampleRate)+padding
  );
}

function jplopsoft_mediaLooksLikeMp3(bytes){
  var i,len,nextLen,maxScan;

  if(!bytes||bytes.length<4)return false;

  /*
   * ID3v2 at byte zero is a strong MPEG-audio indicator.
   */
  if(
    bytes[0]===0x49&&
    bytes[1]===0x44&&
    bytes[2]===0x33
  ){
    return true;
  }

  /*
   * Without ID3, require two correctly aligned MPEG Audio frames.
   * A single FF Ex-looking sequence inside MP4/WebM is not enough.
   */
  maxScan=Math.min(bytes.length-4,4096);

  for(i=0;i<maxScan;i++){
    len=jplopsoft_mediaMpegAudioFrameLength(bytes,i);

    if(len>4&&i+len+3<bytes.length){
      nextLen=jplopsoft_mediaMpegAudioFrameLength(bytes,i+len);

      if(nextLen>4){
        return true;
      }
    }
  }

  return false;
}

function jplopsoft_mediaSniff(bytes,name){
  var ext=jplopsoft_fileExtension(name),
      result={
        detected:'unknown',
        mime:jplopsoft_mimeForName(name),
        description:'未知媒體格式',
        confidence:'extension',
        extension:ext,
        mismatch:false
      },
      brand;

  bytes=jplopsoft_binaryBytesToUint8(bytes);

  if(!bytes||bytes.length<4){
    result.description='檔案太短，無法辨識媒體格式';
    result.confidence='none';
    return result;
  }

  /*
   * Strong container signatures must win before heuristic MP3 scanning.
   */
  if(
    bytes.length>=12&&
    jplopsoft_mediaAscii(bytes,4,4)==='ftyp'
  ){
    result.detected='mp4';
    result.mime=(ext==='m4a')?'audio/mp4':'video/mp4';
    result.description='ISO Base Media / MP4 container';
    result.confidence='signature';

    brand=jplopsoft_mediaAscii(bytes,8,4);
    if(brand){
      result.description+=' ('+brand+')';
    }

  }else if(
    bytes[0]===0x1A&&
    bytes[1]===0x45&&
    bytes[2]===0xDF&&
    bytes[3]===0xA3
  ){
    result.detected='webm';
    result.mime='video/webm';
    result.description='EBML / WebM-Matroska container';
    result.confidence='signature';

  }else if(
    jplopsoft_mediaAscii(bytes,0,4)==='RIFF'&&
    bytes.length>=12&&
    jplopsoft_mediaAscii(bytes,8,4)==='WAVE'
  ){
    result.detected='wav';
    result.mime='audio/wav';
    result.description='RIFF / WAVE audio';
    result.confidence='signature';

  }else if(jplopsoft_mediaAscii(bytes,0,4)==='fLaC'){
    result.detected='flac';
    result.mime='audio/flac';
    result.description='FLAC audio';
    result.confidence='signature';

  }else if(jplopsoft_mediaAscii(bytes,0,4)==='OggS'){
    result.detected='ogg';
    result.mime=(ext==='ogv')?'video/ogg':'audio/ogg';
    result.description='Ogg container';
    result.confidence='signature';

  }else if(
    (
      bytes.length>=4&&
      bytes[0]===0x00&&
      bytes[1]===0x00&&
      bytes[2]===0x00&&
      bytes[3]===0x01
    )||
    (
      bytes.length>=3&&
      bytes[0]===0x00&&
      bytes[1]===0x00&&
      bytes[2]===0x01
    )
  ){
    result.detected='h264';
    result.mime='video/h264';
    result.description='Raw H.264 elementary stream';
    result.confidence='signature';

  }else if(jplopsoft_mediaLooksLikeMp3(bytes)){
    result.detected='mp3';
    result.mime='audio/mpeg';
    result.description='MPEG Audio / MP3';
    result.confidence='signature';
  }

  if(result.confidence==='signature'){
    if(ext==='mp3'&&result.detected!=='mp3'){
      result.mismatch=true;
    }else if(
      (ext==='mp4'||ext==='m4v'||ext==='mov'||ext==='m4a')&&
      result.detected!=='mp4'
    ){
      result.mismatch=true;
    }else if(ext==='wav'&&result.detected!=='wav'){
      result.mismatch=true;
    }else if(ext==='flac'&&result.detected!=='flac'){
      result.mismatch=true;
    }else if(ext==='webm'&&result.detected!=='webm'){
      result.mismatch=true;
    }else if(
      (ext==='h264'||ext==='264'||ext==='avc')&&
      result.detected!=='h264'
    ){
      result.mismatch=true;
    }
  }

  return result;
}

function jplopsoft_mediaErrorText(media){
  var e=media&&media.error?media.error:null,
      code=e&&typeof e.code==='number'?e.code:0;

  if(code===1){
    return 'MEDIA_ERR_ABORTED：播放被瀏覽器或使用者中止。';
  }

  if(code===2){
    return 'MEDIA_ERR_NETWORK：瀏覽器讀取 Blob 媒體資料時發生錯誤。';
  }

  if(code===3){
    return 'MEDIA_ERR_DECODE：瀏覽器已讀到媒體資料，但無法完成影音解碼；檔案內容、frame 結構或 codec 可能有問題。';
  }

  if(code===4){
    return 'MEDIA_ERR_SRC_NOT_SUPPORTED：瀏覽器無法使用目前媒體來源。可能原因包含 container / codec 不支援，或 Content-Security-Policy 阻擋 Blob media。';
  }

  return '瀏覽器回報未知的媒體播放錯誤。';
}

function jplopsoft_openMediaPreview(id){
  var n=jplopsoft_findNode(id),
      name=n?jplopsoft_decName(n):'',
      fmt=jplopsoft_fileFormatFromName(name),
      URLObj=window.URL||window.webkitURL;

  if(
    !n||
    n.type!=='file'||
    (fmt!=='audio'&&fmt!=='video'&&fmt!=='rawvideo')
  ){
    return;
  }

  jplopsoft_setStatus('正在分段載入影音「'+jplopsoft_htmlEscape(name)+'」…');

  jplopsoft_fetchNodeContent(
    id,
    function(err,out){
      var bytes,typed,blob,media,mime,
          rawWarning=false,
          sniff,
          canPlay='';

      if(err)return alert(err.message);

      jplopsoft_setStatus('影音密文已載入，正在 EXES 解密…');

      try{
        bytes=jplopsoft_decBinaryCipher(out.content_enc,jplopsoft_nodeFekById(id));

        if(bytes===null){
          return alert('影音內容無法解密。');
        }

        typed=jplopsoft_binaryBytesToUint8(bytes);
      }catch(e){
        return alert(e.message);
      }

      sniff=jplopsoft_mediaSniff(typed,name);
      mime=sniff.mime||jplopsoft_mimeForName(name);
      rawWarning=(fmt==='rawvideo'||sniff.detected==='h264');

      state.editId=0;
      state.openId=id;
      state.openFormat=fmt;
      state.editorMode='preview';

      jplopsoft_el('jplopsoft_modalTitle').textContent=
        (mime.indexOf('audio/')===0?'音訊預覽：':'影片預覽：')+
        (name||('#'+id));

      jplopsoft_el('jplopsoft_saveDocBtn').className='jplopsoft_btn jplopsoft_primary jplopsoft_hidden';
      jplopsoft_el('jplopsoft_modalTabs').className='jplopsoft_modal-tabs jplopsoft_hidden';

      jplopsoft_hideDocumentPanes();

      jplopsoft_el('jplopsoft_mediaPreviewPane').className='jplopsoft_media-preview-pane';
      jplopsoft_el('jplopsoft_mediaPreviewIcon').textContent=
        jplopsoft_isIE11Browser()?'':((mime.indexOf('audio/')===0)?'🎵':'🎬');
      jplopsoft_el('jplopsoft_mediaPreviewName').textContent=name||('#'+id);

      if(mime.indexOf('audio/')===0){
        media=jplopsoft_el('jplopsoft_audioPreview');
        media.className='';
        jplopsoft_el('jplopsoft_videoPreview').className='jplopsoft_hidden';
      }else{
        media=jplopsoft_el('jplopsoft_videoPreview');
        media.className='';
        jplopsoft_el('jplopsoft_audioPreview').className='jplopsoft_hidden';
      }

      try{
        if(media.canPlayType){
          canPlay=media.canPlayType(mime)||'';
        }
      }catch(ignoreCanPlay){}

      jplopsoft_el('jplopsoft_mediaPreviewNote').className=
        'jplopsoft_media-preview-note'+
        ((rawWarning||sniff.mismatch||!canPlay)?' jplopsoft_warn':'');

      if(sniff.mismatch){
        jplopsoft_el('jplopsoft_mediaPreviewNote').textContent=
          '偵測到副檔名與實際媒體內容可能不一致。'+
          '副檔名：.'+sniff.extension+
          '；實際檔頭：'+sniff.description+
          '；Blob MIME 已自動改用 '+mime+
          '。檔頭前 16 bytes：'+jplopsoft_mediaHexPrefix(typed,16);

      }else if(rawWarning){
        jplopsoft_el('jplopsoft_mediaPreviewNote').textContent=
          '偵測格式：'+sniff.description+
          '。裸 H.264 沒有 MP4/WebM container；Chrome / Edge 不保證可直接播放。'+
          'ExFS 仍會嘗試交給瀏覽器解碼。';

      }else{
        jplopsoft_el('jplopsoft_mediaPreviewNote').textContent=
          '偵測格式：'+sniff.description+
          ' ｜ MIME：'+mime+
          ' ｜ Browser canPlayType：'+(canPlay||'未宣告支援')+
          ' ｜ '+typed.length+' bytes';
      }

      media.onerror=function(){
        var note=jplopsoft_el('jplopsoft_mediaPreviewNote'),
            errText=jplopsoft_mediaErrorText(media),
            prefix=jplopsoft_mediaHexPrefix(typed,24);

        if(!note)return;

        note.className='jplopsoft_media-preview-note jplopsoft_warn';

        note.textContent=
          errText+
          ' 偵測格式：'+sniff.description+
          '；MIME：'+mime+
          '；canPlayType：'+(canPlay||'未宣告支援')+
          '；檔頭：'+prefix+
          (jplopsoft_isIE11Browser()
            ?'。IE11 的原生影音 codec 支援較少；檔案本身已成功解密，可使用下載功能交由外部播放器開啟。'
            :'。如果下載後也無法播放，代表原始檔或內容格式本身有問題；如果下載後可正常播放，請把這段診斷資訊提供給我。');
      };

      media.onloadedmetadata=function(){
        var note=jplopsoft_el('jplopsoft_mediaPreviewNote'),
            duration=isFinite(media.duration)
              ?media.duration
              :0;

        if(note&&!rawWarning&&!sniff.mismatch){
          note.className='jplopsoft_media-preview-note';
          note.textContent=
            '媒體 metadata 已讀取成功 ｜ '+
            sniff.description+
            ' ｜ '+mime+
            ' ｜ '+typed.length+' bytes'+
            (duration>0
              ?' ｜ '+duration.toFixed(2)+' 秒'
              :'');
        }
      };

      try{
        blob=new Blob(
          [typed],
          {type:mime}
        );

        if(URLObj&&URLObj.createObjectURL){
          state.mediaPreviewUrl=URLObj.createObjectURL(blob);
          media.src=state.mediaPreviewUrl;
          try{media.load();}catch(ignoreLoad){}
        }else{
          throw new Error('ObjectURL unavailable');
        }
      }catch(e2){
        return alert('影音預覽失敗：'+e2.message);
      }

      jplopsoft_showDocumentModal();
      jplopsoft_updateGalleryButtons();

      jplopsoft_setStatus(
        '影音已解密；偵測為 '+
        sniff.description+
        '，正在交給瀏覽器播放器。'
      );
    },
    function(done,total){
      var pct=total?Math.floor(done*100/total):0;

      jplopsoft_setStatus(
        '正在分段載入影音「'+jplopsoft_htmlEscape(name)+'」：'+
        pct+'% ｜ '+done+' / '+total+' bytes'
      );
    }
  );
}

function jplopsoft_openEditor(id,routeInternal){
  var n=jplopsoft_resolveClientNode(id),name,fmt;
  if(!n||n.type!=='file')return;
  name=jplopsoft_decName(n);fmt=jplopsoft_fileFormatFromName(name||'');
  if(n.has_motw&&!routeInternal)return alert('此檔案含有 Zone.Identifier (Mark of the Web)。請先以 Low Integrity 檢視器開啟；目前不允許直接提升到編輯器。');
  if(!routeInternal&&fmt==='html')jplopsoft_routeExplorerAction('htmleditor',jplopsoft_cmdNodeFullPath(n));
  if((fmt==='txt'||fmt==='csv')&&jplopsoft_multiEditorGet(id)){jplopsoft_multiEditorRestore(jplopsoft_multiEditorGet(id));return;}
  if(jplopsoft_nodeIsLargeFile(n))return alert(jplopsoft_largeFileDownloadOnlyMessage(name,n.original_size));
  if((fmt==='html'||fmt==='txt'||fmt==='csv')&&!jplopsoft_nodeOnlineEditable(n,name))return alert('此文字檔超過 18 MiB 線上編輯上限，只允許下載。');
  if(fmt!=='html'&&fmt!=='txt'&&fmt!=='csv')return alert('此檔案類型不可編輯；影音 / 圖片可預覽與下載。');
  jplopsoft_setStatus('正在載入「'+jplopsoft_htmlEscape(name||('#'+id))+'」的加密內容…');
  jplopsoft_fetchNodeContent(id,function(err,out){
    var src;
    if(err)return alert(err.message);
    try{src=jplopsoft_decContentCipher(out.content_enc,jplopsoft_nodeFekById(id));}catch(e){return alert(e.message);}
    if(src===null)return alert('文件內容無法解密。');
    if(fmt==='txt'||fmt==='csv'){
      jplopsoft_openTextCsvMultiEditor(id,name||('#'+id),fmt,src);
      jplopsoft_setStatus((fmt==='csv'?'CSV 試算表':'文字編輯器')+'已開啟，可與其他文件同時工作。');
      return;
    }
    state.editId=id;state.openId=id;state.openFormat=fmt;state.editorMode=fmt==='csv'?'csv':'source';
    jplopsoft_taskbarSetDocumentApp(id,name||('#'+id),fmt);
    jplopsoft_el('jplopsoft_modalTitle').textContent='編輯：'+(name||('#'+id));jplopsoft_el('jplopsoft_saveDocBtn').className='jplopsoft_btn jplopsoft_primary';jplopsoft_hideDocumentPanes();
    if(fmt==='csv'){
      jplopsoft_el('jplopsoft_modalTabs').className='jplopsoft_modal-tabs jplopsoft_hidden';jplopsoft_el('jplopsoft_csvPane').className='jplopsoft_csv-pane';
      try{jplopsoft_csvLoadEditor(src,false);}catch(csvErr){jplopsoft_closeModal();return alert(csvErr.message);}
      jplopsoft_showDocumentModal();jplopsoft_setStatus('CSV 已載入試算表編輯器。');return;
    }
    jplopsoft_el('jplopsoft_htmlEditor').value=src;jplopsoft_el('jplopsoft_htmlEditor').readOnly=false;jplopsoft_el('jplopsoft_htmlEditor').spellcheck=(fmt==='txt');jplopsoft_el('jplopsoft_htmlEditor').className='jplopsoft_editor';
    if(fmt==='txt'){jplopsoft_el('jplopsoft_modalTabs').className='jplopsoft_modal-tabs jplopsoft_hidden';jplopsoft_el('jplopsoft_tabEdit').textContent='純文字 / TXT 模式';}
    else{jplopsoft_el('jplopsoft_tabEdit').textContent='HTML 原始碼';jplopsoft_el('jplopsoft_modalTabs').className='jplopsoft_modal-tabs';jplopsoft_showSourceTab();}
    jplopsoft_showDocumentModal();jplopsoft_setStatus('文件內容已按需載入。');
  });
}

function jplopsoft_openView(id,routeInternal){
  var n=jplopsoft_resolveClientNode(id),name,fmt,launch,inLowViewer;
  if(!n||n.type!=='file')return;
  name=jplopsoft_decName(n);fmt=jplopsoft_fileFormatFromName(name||'');
  inLowViewer=jplopsoft_routeNeedsAlpc();

  /* Explorer's image preview consumes only the pre-generated JPEG128_V1
   * thumbnail.  It never reads/decrypts the original uploaded image, so a
   * MOTW-marked PNG/JPEG can safely show its shell-style thumbnail without
   * turning the MEDIUM explorer.exe process itself into htmlview.exe. */
  if(!routeInternal&&!inLowViewer&&fmt==='image'&&jplopsoft_nodeHasThumbnail(n)){
    return jplopsoft_openImagePreview(id);
  }

  /* Active/original-content preview of MOTW files and HTML runs in a genuine
   * LOW restricted htmlview.exe child.  The primary Explorer opens a child
   * window so window.opener remains the EXFS_ALPC broker. */
  if(!routeInternal&&!inLowViewer&&(n.has_motw||fmt==='html')){
    launch=jplopsoft_routeExplorerAction('htmlview',jplopsoft_cmdNodeFullPath(n));
    if(launch==='window'||launch==='blocked')return;
  }
  if(fmt==='image'&&jplopsoft_nodeHasThumbnail(n))return jplopsoft_openImagePreview(id);
  if(jplopsoft_nodeIsLargeFile(n))return alert(jplopsoft_largeFileDownloadOnlyMessage(name,n.original_size));
  if(!jplopsoft_nodeOnlinePreviewable(n,name))return alert('此檔案超過線上預覽安全上限，只允許下載。');
  if(fmt==='image')return alert('此圖片缺少必要的 JPEG128_V1 加密縮圖，因此不允許載入原圖預覽。');
  if(fmt==='audio'||fmt==='video'||fmt==='rawvideo')return jplopsoft_openMediaPreview(id);
  if(fmt==='binary')return alert('此 Binary 檔案不提供內容預覽，請使用下載。');
  jplopsoft_setStatus('正在載入「'+jplopsoft_htmlEscape(name||('#'+id))+'」的加密內容…');
  jplopsoft_fetchNodeContent(id,function(err,out){
    var src;
    if(err)return alert(err.message);
    try{src=jplopsoft_decContentCipher(out.content_enc,jplopsoft_nodeFekById(id));}catch(e){return alert(e.message);}
    if(src===null)return alert('文件內容無法解密。');
    state.editId=0;state.openId=id;state.openFormat=fmt;
    jplopsoft_el('jplopsoft_modalTitle').textContent='檢視：'+(name||('#'+id));jplopsoft_el('jplopsoft_saveDocBtn').className='jplopsoft_btn jplopsoft_primary jplopsoft_hidden';jplopsoft_el('jplopsoft_modalTabs').className='jplopsoft_modal-tabs jplopsoft_hidden';jplopsoft_hideDocumentPanes();
    if(fmt==='csv'){
      state.editorMode='csv';jplopsoft_el('jplopsoft_csvPane').className='jplopsoft_csv-pane';
      try{jplopsoft_csvLoadEditor(src,true);}catch(csvErr){jplopsoft_closeModal();return alert(csvErr.message);}
      jplopsoft_showDocumentModal();jplopsoft_setStatus('CSV 已載入試算表檢視器。');return;
    }
    jplopsoft_el('jplopsoft_htmlEditor').value=src;jplopsoft_showDocumentModal();
    if(fmt==='txt'){state.editorMode='source';jplopsoft_el('jplopsoft_htmlEditor').readOnly=true;jplopsoft_el('jplopsoft_htmlEditor').spellcheck=true;jplopsoft_el('jplopsoft_htmlEditor').className='jplopsoft_editor';}
    else{state.editorMode='preview';jplopsoft_el('jplopsoft_htmlEditor').readOnly=true;jplopsoft_el('jplopsoft_htmlEditor').spellcheck=false;jplopsoft_showPreview(src);}
    jplopsoft_setStatus('文件內容已按需載入。');
  });
}

function jplopsoft_saveDocument(){if(!state.editId)return;if(state.editorMode==='rich'&&state.openFormat==='html')jplopsoft_syncRichToSource();var src=state.openFormat==='csv'?jplopsoft_csvCurrentSource():jplopsoft_el('jplopsoft_htmlEditor').value,plainSize=jplopsoft_utf8ByteLength(src);if(plainSize>jplopsoft_TEXT_ONLINE_EDIT_MAX)return alert('線上編輯內容超過 18 MiB。請改用大型檔案上傳模式；大型 TXT / HTML / CSV 僅允許下載。');try{var cipher=jplopsoft_encContent(src,jplopsoft_nodeFekById(state.editId));jplopsoft_saveNodeCipher(state.editId,cipher,plainSize,function(err,out){if(err)return alert(err.message);jplopsoft_closeModal();jplopsoft_reloadNodes(function(){jplopsoft_setStatus('文件已以原檔 FEK 加密保存為版本 v'+out.version_no+'。');});});}catch(e){alert(e.message);}}

function jplopsoft_revokeVersionPreview(){if(state.versionPreviewUrl){try{(window.URL||window.webkitURL).revokeObjectURL(state.versionPreviewUrl);}catch(e){}state.versionPreviewUrl=null;}if(jplopsoft_isIE11Browser()){var f=jplopsoft_el('jplopsoft_versionHtmlPreview'),p=jplopsoft_el('jplopsoft_versionHtmlPreviewIE11');if(f){try{f.onload=null;f.src='about:blank';}catch(ignoreIEVersionPreviewReset){}}if(p){try{p.innerHTML='';}catch(ignoreIEVersionPreviewClear){}}}}
function jplopsoft_closeVersions(){jplopsoft_el('jplopsoft_versionBackdrop').style.display='none';state.versionList=[];state.versionCurrentNo=0;jplopsoft_revokeVersionPreview();jplopsoft_el('jplopsoft_versionRows').innerHTML='';jplopsoft_el('jplopsoft_versionTextPreview').className='jplopsoft_version-text jplopsoft_hidden';jplopsoft_el('jplopsoft_versionHtmlPreview').className='jplopsoft_preview jplopsoft_hidden';jplopsoft_el('jplopsoft_versionHtmlPreviewIE11').className='jplopsoft_ie11-html-preview jplopsoft_hidden';jplopsoft_el('jplopsoft_versionImagePreview').className='jplopsoft_version-image jplopsoft_hidden';jplopsoft_el('jplopsoft_versionImagePreview').removeAttribute('src');jplopsoft_el('jplopsoft_versionPreviewEmpty').className='jplopsoft_version-empty';jplopsoft_el('jplopsoft_versionPreviewTitle').textContent='選擇一個版本即可檢視。';}
function jplopsoft_versionDownloadName(name,no){name=String(name||'document');var dot=name.lastIndexOf('.');if(dot>0)return name.substring(0,dot)+'.v'+no+name.substring(dot);return name+'.v'+no;}
function jplopsoft_fetchVersion(versionId,cb){if(!state.openId)return cb(new Error('目前沒有開啟文件。'));jplopsoft_api('version_get','POST',{id:state.openId,version_id:versionId},true,function(err,out){if(err)return cb(err);var v=out.version||{},payload,fek;try{fek=jplopsoft_nodeFekById(state.openId);payload=jplopsoft_binaryFormat(state.openFormat)?jplopsoft_decBinaryCipher(v.content_enc,fek):jplopsoft_decContentCipher(v.content_enc,fek);}catch(e){return cb(e);}if(payload===null)return cb(new Error('版本內容無法解密。'));cb(null,v,payload);});}
function jplopsoft_renderVersionPreview(versionNo,src){jplopsoft_revokeVersionPreview();jplopsoft_el('jplopsoft_versionPreviewEmpty').className='jplopsoft_version-empty jplopsoft_hidden';jplopsoft_el('jplopsoft_versionTextPreview').className='jplopsoft_version-text jplopsoft_hidden';jplopsoft_el('jplopsoft_versionHtmlPreview').className='jplopsoft_preview jplopsoft_hidden';jplopsoft_el('jplopsoft_versionHtmlPreviewIE11').className='jplopsoft_ie11-html-preview jplopsoft_hidden';jplopsoft_el('jplopsoft_versionImagePreview').className='jplopsoft_version-image jplopsoft_hidden';jplopsoft_el('jplopsoft_versionImagePreview').removeAttribute('src');if(state.openFormat==='image'){var n=jplopsoft_findNode(state.openId),name=n?jplopsoft_decName(n):'image',URLObj=window.URL||window.webkitURL,blob;jplopsoft_el('jplopsoft_versionPreviewTitle').textContent='版本 v'+versionNo+' ｜ 圖片預覽';try{blob=new Blob([(typeof Uint8Array!=='undefined')?new Uint8Array(src):src],{type:jplopsoft_mimeForName(name)});state.versionPreviewUrl=URLObj.createObjectURL(blob);jplopsoft_el('jplopsoft_versionImagePreview').src=state.versionPreviewUrl;jplopsoft_el('jplopsoft_versionImagePreview').className='jplopsoft_version-image';}catch(e){jplopsoft_el('jplopsoft_versionPreviewTitle').textContent='版本 v'+versionNo+' ｜ 圖片預覽失敗';}return;}if(state.openFormat==='audio'||state.openFormat==='video'||state.openFormat==='rawvideo'||state.openFormat==='binary'){jplopsoft_el('jplopsoft_versionPreviewTitle').textContent='版本 v'+versionNo+' ｜ Binary / 影音版本';jplopsoft_el('jplopsoft_versionPreviewEmpty').className='jplopsoft_version-empty';jplopsoft_el('jplopsoft_versionPreviewEmpty').textContent='此版本目前提供下載；主文件影音預覽請關閉版本視窗後使用「預覽」。';return;}jplopsoft_el('jplopsoft_versionPreviewTitle').textContent='版本 v'+versionNo+' ｜ '+(state.openFormat==='html'?'安全預覽':'唯讀純文字');if(state.openFormat==='html'){var frame=jplopsoft_el('jplopsoft_versionHtmlPreview'),safe='',URLObj2=window.URL||window.webkitURL;if(jplopsoft_isIE11Browser()){jplopsoft_el('jplopsoft_versionHtmlPreview').className='jplopsoft_preview jplopsoft_hidden';jplopsoft_el('jplopsoft_versionHtmlPreviewIE11').className='jplopsoft_ie11-html-preview';if(jplopsoft_renderIE11HtmlPreview(src,'jplopsoft_versionHtmlPreviewIE11')){jplopsoft_el('jplopsoft_versionPreviewTitle').textContent='版本 v'+versionNo+' ｜ IE11 安全預覽';}else{jplopsoft_el('jplopsoft_versionPreviewTitle').textContent='版本 v'+versionNo+' ｜ IE11 HTML 預覽失敗';}return;}jplopsoft_el('jplopsoft_versionHtmlPreviewIE11').className='jplopsoft_ie11-html-preview jplopsoft_hidden';jplopsoft_el('jplopsoft_versionHtmlPreview').className='jplopsoft_preview';safe=jplopsoft_sanitizeHtml(src);try{if(URLObj2&&window.Blob){var blob2=new Blob([safe],{type:'text/html;charset=utf-8'});state.versionPreviewUrl=URLObj2.createObjectURL(blob2);frame.src=state.versionPreviewUrl;return;}}catch(e2){}try{frame.src='about:blank';var vd=frame.contentWindow.document;vd.open();vd.write(safe);vd.close();}catch(e3){frame.src='data:text/html;charset=utf-8,'+encodeURIComponent(safe);}}else{jplopsoft_el('jplopsoft_versionTextPreview').className='jplopsoft_version-text';jplopsoft_el('jplopsoft_versionTextPreview').value=src;}}
function jplopsoft_viewVersion(versionId,versionNo){if(state.openFormat==='image')return alert('圖片版本不直接解密原圖預覽；請使用主畫面的 128 × 128 加密縮圖。版本原圖仍可使用「下載」。');jplopsoft_fetchVersion(versionId,function(err,v,src){if(err)return alert(err.message);jplopsoft_renderVersionPreview(versionNo,src);});}
function jplopsoft_downloadVersion(versionId,versionNo){jplopsoft_fetchVersion(versionId,function(err,v,src){if(err)return alert(err.message);var n=jplopsoft_findNode(state.openId),name=n?jplopsoft_decName(n):'document',vn=jplopsoft_versionDownloadName(name||'document',versionNo),fmt=jplopsoft_fileFormatFromName(name||'');if(jplopsoft_binaryFormat(fmt))jplopsoft_saveBinaryBlob(vn,src);else jplopsoft_saveFileBlob(vn,src);});}
function jplopsoft_restoreVersion(versionId,versionNo){if(jplopsoft_binaryFormat(state.openFormat))return alert('Binary / 圖片 / 影音版本目前不提供文字內容還原。');if(!state.editId)return alert('請用「編輯」模式開啟文件後再還原版本。');if(!window.confirm('確定把版本 v'+versionNo+' 還原成目前內容嗎？\\n\\n還原本身會再建立一個新的版本，因此原歷史不會消失。'))return;var nodeId=state.openId;jplopsoft_fetchVersion(versionId,function(err,v,src){if(err)return alert(err.message);var cipher;try{cipher=jplopsoft_encContent(src,jplopsoft_nodeFekById(nodeId));}catch(e){return alert(e.message);}jplopsoft_saveNodeCipher(nodeId,cipher,jplopsoft_utf8ByteLength(src),function(err2,out){if(err2)return alert(err2.message);jplopsoft_closeVersions();jplopsoft_reloadNodes(function(){jplopsoft_openEditor(nodeId);jplopsoft_setStatus('已將 v'+versionNo+' 還原並以原檔 FEK 另存為新版本 v'+out.version_no+'。');});});});}
function jplopsoft_renderVersions(){var body=jplopsoft_el('jplopsoft_versionRows'),a=state.versionList||[],i,v,tr,td,b;body.innerHTML='';jplopsoft_el('jplopsoft_versionEmpty').className=a.length?'jplopsoft_version-empty jplopsoft_hidden':'jplopsoft_version-empty';for(i=0;i<a.length;i++){v=a[i];tr=document.createElement('tr');td=document.createElement('td');td.innerHTML='v'+v.version_no+(v.version_no===state.versionCurrentNo?' <span class="jplopsoft_version-current">目前</span>':'');tr.appendChild(td);td=document.createElement('td');td.textContent=jplopsoft_fmtDate(v.created_at);tr.appendChild(td);td=document.createElement('td');td.textContent=v.cipher_size?Math.ceil(v.cipher_size/1024)+' KB':'-';tr.appendChild(td);td=document.createElement('td');td.className='jplopsoft_actions';b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.textContent='檢視';(function(id,no,btn){btn.onclick=function(){jplopsoft_viewVersion(id,no);};})(v.id,v.version_no,b);td.appendChild(b);td.appendChild(document.createTextNode(' '));b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small';b.textContent='下載';(function(id,no,btn){btn.onclick=function(){jplopsoft_downloadVersion(id,no);};})(v.id,v.version_no,b);td.appendChild(b);if(v.version_no!==state.versionCurrentNo&&!jplopsoft_binaryFormat(state.openFormat)){td.appendChild(document.createTextNode(' '));b=document.createElement('button');b.className='jplopsoft_btn jplopsoft_small jplopsoft_primary';b.textContent='還原';b.disabled=!state.editId;(function(id,no,btn){btn.onclick=function(){jplopsoft_restoreVersion(id,no);};})(v.id,v.version_no,b);td.appendChild(b);}tr.appendChild(td);body.appendChild(tr);}}
function jplopsoft_openVersions(){if(!state.openId)return alert('請先打開文件。');var n=jplopsoft_findNode(state.openId),name=n?jplopsoft_decName(n):'';if(n&&jplopsoft_nodeIsLargeFile(n)&&jplopsoft_fileFormatFromName(name)!=='image')return alert('大型 CHUNKED_V1 檔案不提供線上內容版本預覽；可重新命名、移動、複製、刪除與下載。');jplopsoft_el('jplopsoft_versionTitle').textContent='版本紀錄：'+(name||('#'+state.openId));jplopsoft_el('jplopsoft_versionBackdrop').style.display='flex';jplopsoft_el('jplopsoft_versionRows').innerHTML='';jplopsoft_el('jplopsoft_versionEmpty').className='jplopsoft_version-empty';jplopsoft_el('jplopsoft_versionPreviewEmpty').className='jplopsoft_version-empty';jplopsoft_el('jplopsoft_versionTextPreview').className='jplopsoft_version-text jplopsoft_hidden';jplopsoft_el('jplopsoft_versionHtmlPreview').className='jplopsoft_preview jplopsoft_hidden';jplopsoft_el('jplopsoft_versionImagePreview').className='jplopsoft_version-image jplopsoft_hidden';jplopsoft_el('jplopsoft_versionImagePreview').removeAttribute('src');jplopsoft_revokeVersionPreview();jplopsoft_api('versions','POST',{id:state.openId},true,function(err,out){if(err){jplopsoft_closeVersions();return alert(err.message);}state.versionList=out.versions||[];state.versionCurrentNo=out.current_version||0;jplopsoft_renderVersions();});}

function jplopsoft_revokePreview(){if(state.previewUrl){try{(window.URL||window.webkitURL).revokeObjectURL(state.previewUrl);}catch(e){}state.previewUrl=null;}if(jplopsoft_isIE11Browser()){var f=jplopsoft_el('jplopsoft_htmlPreview'),p=jplopsoft_el('jplopsoft_htmlPreviewIE11');if(f){try{f.onload=null;f.src='about:blank';}catch(ignoreIEPreviewReset){}}if(p){try{p.innerHTML='';}catch(ignoreIEPreviewClear){}}}}
function jplopsoft_sanitizeHtml(source){var body=jplopsoft_sanitizeFragment(jplopsoft_bodyInnerFromSource(source));return '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: blob:; style-src \'unsafe-inline\'; font-src data:; media-src \'none\'; connect-src \'none\'; frame-src \'none\'; object-src \'none\'"><style>body{font-family:Segoe UI,Microsoft JhengHei,sans-serif;padding:18px;line-height:1.6;word-wrap:break-word;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>'+body+'</body></html>';}
function jplopsoft_renderIE11HtmlPreview(source,targetId){
  var pane=jplopsoft_el(targetId),
      safe='',
      raw=String(source||'');

  if(!pane){
    return false;
  }

  try{
    safe=jplopsoft_sanitizePreviewFragment(raw);
  }catch(e){
    pane.className='jplopsoft_ie11-html-preview';
    pane.innerHTML=
      '<div style="padding:12px;border:1px solid #fca5a5;background:#fef2f2;color:#991b1b">'+
      'IE11 HTML 預覽安全過濾失敗：'+
      jplopsoft_htmlEscape(String(e.message||e))+
      '</div>';
    return false;
  }

  pane.className='jplopsoft_ie11-html-preview';

  /*
   * Defensive diagnostic: never leave the preview as an unexplained
   * pure-white page when the source contains text but sanitization yields
   * nothing. Show a safe message instead.
   */
  if(jplopsoft_trim(raw)!==''&&jplopsoft_trim(safe)===''){
    pane.innerHTML=
      '<div style="padding:12px;border:1px solid #fde68a;background:#fffbeb;color:#92400e">'+
      'HTML 內容已載入，但經 IE11 安全預覽過濾後沒有可顯示的 BODY 內容。'+
      '</div>';
    return true;
  }

  pane.innerHTML=safe;

  /*
   * Force IE11 layout/repaint on a normal DIV instead of an iframe.
   */
  try{
    pane.style.display='block';
    pane.offsetHeight;
    pane.scrollTop=0;
  }catch(ignorePaint){}

  return true;
}

function jplopsoft_ie11WriteSanitizedPreview(frame,safe,done){
  var finished=false,timer=null;

  if(!frame){
    if(done)done(new Error('Preview iframe unavailable.'));
    return;
  }

  function jplopsoft_finish(err){
    if(finished)return;
    finished=true;
    if(timer){
      clearTimeout(timer);
      timer=null;
    }
    try{frame.onload=null;}catch(ignoreOnload){}
    if(done)done(err||null);
  }

  function jplopsoft_writeNow(){
    var d=null;

    if(finished)return;

    try{
      try{frame.removeAttribute('sandbox');}catch(ignoreSandbox){}

      d=frame.contentDocument||
        (frame.contentWindow?frame.contentWindow.document:null);

      if(!d){
        throw new Error('iframe document unavailable');
      }

      d.open();
      d.write(String(safe||''));
      d.close();

      /*
       * Touch layout to force an IE11 repaint after document.write.
       */
      try{
        if(d.documentElement){
          d.documentElement.style.display='block';
          d.documentElement.offsetHeight;
        }
        if(d.body){
          d.body.style.display='block';
          d.body.offsetHeight;
        }
      }catch(ignorePaint){}

      jplopsoft_finish(null);
    }catch(e){
      jplopsoft_finish(e);
    }
  }

  try{
    frame.onload=function(){
      jplopsoft_writeNow();
    };
    frame.src='about:blank';
  }catch(navErr){
    jplopsoft_finish(navErr);
    return;
  }

  /*
   * Some IE11 builds do not fire onload when about:blank was already
   * loaded. The timed retry covers that case.
   */
  timer=setTimeout(function(){
    jplopsoft_writeNow();
  },30);
}

function jplopsoft_renderPreview(src){
  jplopsoft_revokePreview();

  var frame=jplopsoft_el('jplopsoft_htmlPreview'),
      safe,
      URLObj=window.URL||window.webkitURL;

  if(jplopsoft_isIE11Browser()){
    jplopsoft_el('jplopsoft_htmlPreview').className='jplopsoft_preview jplopsoft_hidden';
    jplopsoft_el('jplopsoft_htmlPreviewIE11').className='jplopsoft_ie11-html-preview';

    if(jplopsoft_renderIE11HtmlPreview(src,'jplopsoft_htmlPreviewIE11')){
      jplopsoft_setStatus('IE11 HTML 安全預覽已載入（DIV Compatibility Renderer）。');
    }else{
      jplopsoft_setStatus('IE11 HTML 預覽載入失敗。');
    }
    return;
  }

  jplopsoft_el('jplopsoft_htmlPreviewIE11').className='jplopsoft_ie11-html-preview jplopsoft_hidden';
  jplopsoft_el('jplopsoft_htmlPreview').className='jplopsoft_preview';

  safe=jplopsoft_sanitizeHtml(src);

  try{
    if(URLObj&&window.Blob){
      var blob=new Blob([safe],{type:'text/html;charset=utf-8'});
      state.previewUrl=URLObj.createObjectURL(blob);
      frame.src=state.previewUrl;
      return;
    }
  }catch(e){}

  try{
    frame.src='about:blank';
    var d=frame.contentWindow.document;
    d.open();
    d.write(safe);
    d.close();
  }catch(e2){
    frame.src='data:text/html;charset=utf-8,'+encodeURIComponent(safe);
  }
}
function jplopsoft_documentWindowApplyMax(on){
  var m=jplopsoft_el('jplopsoft_documentWindow');
  on=!!on;
  if(!m)return;
  m.className='jplopsoft_modal jplopsoft_wm-overlay-window'+(on?' jplopsoft_maximized jplopsoft_wm-maximized':'');
}
function jplopsoft_toggleMax(){
  state.maximized=!state.maximized;
  jplopsoft_documentWindowApplyMax(state.maximized);
  jplopsoft_el('jplopsoft_modalMaxBtn').textContent=state.maximized?'還原':'放到最大';
  jplopsoft_wmActivateOverlay('jplopsoft_modalBackdrop','jplopsoft_documentWindow','document');
  if(jplopsoft_isIE11Browser())setTimeout(jplopsoft_ie11FitDocumentModal,0);
}
function jplopsoft_closeModal(){var ieBody,ieModal,ieCsvPane,ieCsvWrap;jplopsoft_closeVersions();jplopsoft_el('jplopsoft_modalBackdrop').style.display='none';jplopsoft_taskbarRemoveDocumentApp();if(jplopsoft_isIE11Browser()){ieModal=document.querySelector('#jplopsoft_modalBackdrop .jplopsoft_modal');ieBody=document.querySelector('#jplopsoft_modalBackdrop .jplopsoft_modal-body');ieCsvPane=jplopsoft_el('jplopsoft_csvPane');ieCsvWrap=jplopsoft_el('jplopsoft_csvSheetWrap');if(ieModal){ieModal.style.height='';ieModal.style.maxHeight='';}if(ieBody){ieBody.style.height='';ieBody.style.maxHeight='';ieBody.style.msFlex='';ieBody.style.flex='';}if(ieCsvPane){ieCsvPane.style.height='';ieCsvPane.style.maxHeight='';ieCsvPane.style.msFlex='';ieCsvPane.style.flex='';}if(ieCsvWrap){ieCsvWrap.style.height='';ieCsvWrap.style.maxHeight='';ieCsvWrap.style.msFlex='';ieCsvWrap.style.flex='';}}state.editId=0;state.openId=0;state.openFormat='html';state.editorMode='source';state.csvData=[];state.csvHadBom=false;state.csvReadOnly=false;state.csvSelectedRow=0;state.csvSelectedCol=0;jplopsoft_el('jplopsoft_saveDocBtn').className='jplopsoft_btn jplopsoft_primary';jplopsoft_el('jplopsoft_modalTabs').className='jplopsoft_modal-tabs';jplopsoft_revokePreview();jplopsoft_revokeImagePreview();jplopsoft_revokeMediaPreview();jplopsoft_el('jplopsoft_csvPane').className='jplopsoft_csv-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_imagePreviewPane').className='jplopsoft_image-preview-pane jplopsoft_hidden';jplopsoft_el('jplopsoft_mediaPreviewPane').className='jplopsoft_media-preview-pane jplopsoft_hidden';state.maximized=false;jplopsoft_documentWindowApplyMax(false);jplopsoft_el('jplopsoft_modalMaxBtn').textContent='放到最大';jplopsoft_routeClearExplorerAction();}

function jplopsoft_bindRich(){
  var tb=jplopsoft_el('jplopsoft_richToolbar'),buttons=tb?tb.getElementsByTagName('button'):[],i,imageBtn=jplopsoft_el('jplopsoft_richImage'),imageInput=jplopsoft_el('jplopsoft_richImageInput');
  if(!tb)return;
  tb.onmousedown=function(){jplopsoft_richSaveSelection();};
  for(i=0;i<buttons.length;i++)if(buttons[i].getAttribute('data-cmd'))(function(b){b.onclick=function(){jplopsoft_execRich(b.getAttribute('data-cmd'));};})(buttons[i]);
  jplopsoft_el('jplopsoft_richBlock').onchange=function(){if(this.value)jplopsoft_execRich('formatBlock','<'+this.value+'>');this.selectedIndex=0;};
  jplopsoft_el('jplopsoft_richFont').onchange=function(){if(this.value)jplopsoft_execRich('fontName',this.value);this.selectedIndex=0;};
  jplopsoft_el('jplopsoft_richSize').onchange=function(){if(this.value)jplopsoft_execRich('fontSize',this.value);this.selectedIndex=0;};
  jplopsoft_el('jplopsoft_richFore').onchange=function(){var v=String(this.value||'');if(!/^#[0-9a-f]{6}$/i.test(v)){if(jplopsoft_isIE11Browser())alert('請輸入 #RRGGBB 格式，例如 #ff0000。');return;}jplopsoft_execRich('foreColor',v);};
  jplopsoft_el('jplopsoft_richBack').onchange=function(){var v=String(this.value||'');if(!/^#[0-9a-f]{6}$/i.test(v)){if(jplopsoft_isIE11Browser())alert('請輸入 #RRGGBB 格式，例如 #ffff00。');return;}jplopsoft_execRich('hiliteColor',v);jplopsoft_execRich('backColor',v);};
  jplopsoft_el('jplopsoft_richLink').onclick=function(){var u=window.prompt('連結網址：','https://');if(!u)return;u=String(u).replace(/^\s+|\s+$/g,'');if(/^\s*(javascript|data|vbscript):/i.test(u))return alert('基於安全性，不允許 javascript: / data: / vbscript: 連結。');jplopsoft_execRich('createLink',u);};
  jplopsoft_el('jplopsoft_richTable').onclick=function(){var r=parseInt(window.prompt('列數：','3'),10),c=parseInt(window.prompt('欄數：','3'),10),i,j,h='<table><tbody>';if(!(r>0&&r<=30&&c>0&&c<=20))return;for(i=0;i<r;i++){h+='<tr>';for(j=0;j<c;j++)h+='<td>&nbsp;</td>';h+='</tr>';}h+='</tbody></table><p><br></p>';jplopsoft_richInsertHtml(h);jplopsoft_richUpdateImageInfo();};
  if(imageBtn)imageBtn.onclick=function(){jplopsoft_richSaveSelection();if(imageInput){imageInput.value='';try{imageInput.click();}catch(e){alert('瀏覽器無法開啟圖片選擇器。');}}};
  if(imageInput)imageInput.onchange=function(){var files=this.files;jplopsoft_richRestoreSelection();if(files&&files.length)jplopsoft_richInsertImageFiles(files);this.value='';};
  if(jplopsoft_el('jplopsoft_richImageProps'))jplopsoft_el('jplopsoft_richImageProps').onclick=function(){jplopsoft_richRestoreSelection();jplopsoft_richImageProperties();};
}

/* -------------------------------------------------------------------------
 * Windows 10-style ExFS taskbar / Start menu
 * ---------------------------------------------------------------------- */


/* =========================================================================
 * NT interactive-session model
 *
 * Pre-logon:
 *   Session 1 -> WinSta0 -> Winlogon Desktop
 *   setup.exe / LogonUI.exe -> NT AUTHORITY\SYSTEM
 *
 * Post-logon:
 *   Session 1 -> WinSta0 -> Default Desktop
 *   explorer.exe -> SAM user's Access Token
 *
 * This models NT ownership/desktop transitions inside ExFS. Browser JS does
 * not create a real kernel WindowStation or a protected Windows secure desktop.
 * ========================================================================= */
var jplopsoft_NT_INTERACTIVE={
  sessionId:1,
  serviceSessionId:0,
  windowStation:'WinSta0',
  desktop:'Winlogon',
  principal:'NT AUTHORITY\\SYSTEM',
  sid:'S-1-5-18',
  integrity:'SYSTEM',
  process:'LogonUI.exe',
  phase:'LOGON'
};

function jplopsoft_ntPublishContext(){
  var body=document.body,n=jplopsoft_el('jplopsoft_secureDesktopContext'),text;

  if(body){
    body.setAttribute('data-exfs-session',String(jplopsoft_NT_INTERACTIVE.sessionId));
    body.setAttribute('data-exfs-window-station',String(jplopsoft_NT_INTERACTIVE.windowStation));
    body.setAttribute('data-exfs-desktop',String(jplopsoft_NT_INTERACTIVE.desktop));
    body.setAttribute('data-exfs-principal',String(jplopsoft_NT_INTERACTIVE.principal));
    body.setAttribute('data-exfs-integrity',String(jplopsoft_NT_INTERACTIVE.integrity));
    body.setAttribute('data-exfs-process',String(jplopsoft_NT_INTERACTIVE.process));
  }

  text='Session '+jplopsoft_NT_INTERACTIVE.sessionId+
       ' · '+jplopsoft_NT_INTERACTIVE.windowStation+'\\'+jplopsoft_NT_INTERACTIVE.desktop+
       ' · '+jplopsoft_NT_INTERACTIVE.principal+
       ' · '+jplopsoft_NT_INTERACTIVE.process;

  if(n)n.textContent=text;
}

function jplopsoft_ntEnterWinlogonDesktop(process,phase){
  jplopsoft_NT_INTERACTIVE.sessionId=1;
  jplopsoft_NT_INTERACTIVE.serviceSessionId=0;
  jplopsoft_NT_INTERACTIVE.windowStation='WinSta0';
  jplopsoft_NT_INTERACTIVE.desktop='Winlogon';
  jplopsoft_NT_INTERACTIVE.principal='NT AUTHORITY\\SYSTEM';
  jplopsoft_NT_INTERACTIVE.sid='S-1-5-18';
  jplopsoft_NT_INTERACTIVE.integrity='SYSTEM';
  jplopsoft_NT_INTERACTIVE.process=String(process||'LogonUI.exe');
  jplopsoft_NT_INTERACTIVE.phase=String(phase||'LOGON');
  jplopsoft_ntPublishContext();
}

function jplopsoft_ntEnterDefaultDesktop(username,sid){
  username=String(username||'administrator').toLowerCase();
  jplopsoft_NT_INTERACTIVE.sessionId=1;
  jplopsoft_NT_INTERACTIVE.serviceSessionId=0;
  jplopsoft_NT_INTERACTIVE.windowStation='WinSta0';
  jplopsoft_NT_INTERACTIVE.desktop='Default';
  jplopsoft_NT_INTERACTIVE.principal=username;
  jplopsoft_NT_INTERACTIVE.sid=String(sid||'');
  jplopsoft_NT_INTERACTIVE.integrity='USER';
  jplopsoft_NT_INTERACTIVE.process='explorer.exe';
  jplopsoft_NT_INTERACTIVE.phase='USER_DESKTOP';
  jplopsoft_ntPublishContext();
}

function jplopsoft_ntSyncRouteSecurityContext(){
  if(jplopsoft_routeIsSystem()){
    if(jplopsoft_EXE_ROUTE&&jplopsoft_EXE_ROUTE.app==='os_setup'){
      jplopsoft_ntEnterWinlogonDesktop('setup.exe','OOBE');
    }else{
      jplopsoft_ntEnterWinlogonDesktop('LogonUI.exe','LOGON');
    }
    return;
  }

  if(state&&state.samAuthenticated&&state.samSid){
    jplopsoft_ntEnterDefaultDesktop(state.samUsername||jplopsoft_routeUsername(),state.samSid);
  }else{
    jplopsoft_ntEnterWinlogonDesktop('LogonUI.exe','CREDENTIAL_REQUIRED');
  }
}

function jplopsoft_selectLogonAccount(username,focusPassword){
  var sel=jplopsoft_el('jplopsoft_loginUserInput'),
      input=jplopsoft_el('jplopsoft_keyInput');

  username=String(username||state.defaultUsername||'administrator').toLowerCase();

  if(sel)sel.value=username;
  state.samUsername=username;
  if(input)input.value='';

  jplopsoft_renderLogonAccounts();

  if(focusPassword!==false&&input){
    window.setTimeout(function(){try{input.focus();}catch(ignoreFocus){}},20);
  }
}

function jplopsoft_renderLogonAccounts(){
  var host=jplopsoft_el('jplopsoft_logonAccountList'),
      selected=jplopsoft_el('jplopsoft_logonSelectedUser'),
      sel=jplopsoft_el('jplopsoft_loginUserInput'),
      users=state.samUsers||[],
      username,i,b,icon,copy,name,type,nameNode;

  username=String(sel&&sel.value?sel.value:(state.samUsername||state.defaultUsername||'administrator')).toLowerCase();
  if(selected)selected.textContent=username;

  if(!host)return;
  host.innerHTML='';

  for(i=0;i<users.length;i++){
    name=String(users[i]||'').toLowerCase();
    if(!name)continue;

    b=document.createElement('button');
    b.type='button';
    b.className='jplopsoft_logon-account'+(name===username?' jplopsoft_active':'');
    b.setAttribute('data-logon-user',name);
    b.setAttribute('aria-pressed',name===username?'true':'false');

    icon=document.createElement('span');
    icon.className='jplopsoft_logon-account-icon';
    icon.setAttribute('data-exfs-svg','user');
    icon.setAttribute('data-exfs-svg-size','36');
    b.appendChild(icon);

    copy=document.createElement('span');
    copy.className='jplopsoft_logon-account-copy';

    nameNode=document.createElement('span');
    nameNode.className='jplopsoft_logon-account-name';
    nameNode.textContent=name;
    copy.appendChild(nameNode);

    type=document.createElement('small');
    type.className='jplopsoft_logon-account-type';
    type.textContent=name==='administrator'?'內建系統管理員':'本機帳號';
    copy.appendChild(type);
    b.appendChild(copy);

    (function(u,node){
      node.onclick=function(){jplopsoft_selectLogonAccount(u,true);};
    })(name,b);

    host.appendChild(b);
  }

  jplopsoft_applySvgIcons(host);
}

function jplopsoft_oobePasswordFeedback(){
  var p=jplopsoft_el('jplopsoft_setupPasswordInput'),
      c=jplopsoft_el('jplopsoft_setupConfirmInput'),
      s=jplopsoft_el('jplopsoft_oobePasswordState'),
      raw=p?String(p.value||''):'',
      confirm=c?String(c.value||''):'';

  if(!s)return;

  if(!raw){
    s.className='jplopsoft_oobe-password-state';
    s.textContent='請設定不容易猜測的密碼。';
    return;
  }

  if(raw.length<8){
    s.className='jplopsoft_oobe-password-state jplopsoft_bad';
    s.textContent='建議至少 8 個字元。';
    return;
  }

  if(confirm&&raw!==confirm){
    s.className='jplopsoft_oobe-password-state jplopsoft_bad';
    s.textContent='兩次輸入的密碼不一致。';
    return;
  }

  if(confirm&&raw===confirm){
    s.className='jplopsoft_oobe-password-state jplopsoft_ok';
    s.textContent='密碼確認完成。';
    return;
  }

  s.className='jplopsoft_oobe-password-state';
  s.textContent='請再輸入一次密碼確認。';
}

function jplopsoft_submitCredentialUI(){
  var username,raw,confirm,setupName;

  if(state.kdfBusy)return;

  if(!state.initialized){
    setupName=jplopsoft_el('jplopsoft_setupAccountName');
    username=String(setupName&&setupName.value?setupName.value:(state.defaultUsername||'administrator')).toLowerCase();
    raw=String(jplopsoft_el('jplopsoft_setupPasswordInput')?jplopsoft_el('jplopsoft_setupPasswordInput').value:'');
    confirm=String(jplopsoft_el('jplopsoft_setupConfirmInput')?jplopsoft_el('jplopsoft_setupConfirmInput').value:'');

    if(!raw){
      alert('請建立 administrator 密碼。');
      jplopsoft_focusDecryptPassword(false);
      return;
    }

    if(raw!==confirm){
      alert('兩次輸入的密碼不一致。');
      if(jplopsoft_el('jplopsoft_setupConfirmInput'))jplopsoft_el('jplopsoft_setupConfirmInput').focus();
      return;
    }

    jplopsoft_unlockWithPassword(username,raw,false);
    return;
  }

  username=String(jplopsoft_el('jplopsoft_loginUserInput')?jplopsoft_el('jplopsoft_loginUserInput').value:(state.defaultUsername||'administrator')).toLowerCase();
  raw=String(jplopsoft_el('jplopsoft_keyInput')?jplopsoft_el('jplopsoft_keyInput').value:'');
  jplopsoft_unlockWithPassword(username,raw,jplopsoft_rememberUnlockEnabled());
}


function jplopsoft_renderLogonSubmitButton(){
  var b=jplopsoft_el('jplopsoft_unlockBtn'),span;
  if(!b)return;
  b.innerHTML='';
  span=document.createElement('span');
  span.setAttribute('data-exfs-svg','arrow_right');
  span.setAttribute('data-exfs-svg-size','20');
  span.setAttribute('aria-hidden','true');
  b.appendChild(span);
  b.setAttribute('aria-label','登入');
  jplopsoft_applySvgIcons(b);
}

function jplopsoft_secureDesktopUpdate(){
  var shell=jplopsoft_el('jplopsoft_secureDesktopShell'),
      logon=jplopsoft_el('jplopsoft_logonView'),
      status=jplopsoft_el('jplopsoft_logonStatusMirror'),
      setupName=jplopsoft_el('jplopsoft_setupAccountName');

  if(shell&&jplopsoft_EXFS_DESKTOP_WALLPAPER_DATA_URI){
    shell.style.backgroundImage='url("'+jplopsoft_EXFS_DESKTOP_WALLPAPER_DATA_URI+'")';
    shell.style.backgroundPosition='center center';
    shell.style.backgroundSize='cover';
  }

  if(logon&&jplopsoft_EXFS_DESKTOP_WALLPAPER_DATA_URI){
    logon.style.backgroundImage='url("'+jplopsoft_EXFS_DESKTOP_WALLPAPER_DATA_URI+'")';
  }

  if(setupName)setupName.value=String(state.defaultUsername||'administrator');

  jplopsoft_renderLogonAccounts();
  jplopsoft_renderLogonSubmitButton();
  jplopsoft_oobePasswordFeedback();
  jplopsoft_ntSyncRouteSecurityContext();

  if(status&&state.kdfBusy)status.textContent='正在驗證認證資訊…';
}

function jplopsoft_bindSecureDesktopUI(){
  var setupPass=jplopsoft_el('jplopsoft_setupPasswordInput'),
      setupConfirm=jplopsoft_el('jplopsoft_setupConfirmInput'),
      setupNext=jplopsoft_el('jplopsoft_setupNextBtn');

  if(setupPass){
    setupPass.oninput=jplopsoft_oobePasswordFeedback;
    setupPass.onkeydown=function(e){
      e=e||window.event;
      if((e.keyCode||e.which)===13){
        if(e.preventDefault)e.preventDefault();
        try{if(setupConfirm)setupConfirm.focus();}catch(ignore){}
        return false;
      }
    };
  }

  if(setupConfirm){
    setupConfirm.oninput=jplopsoft_oobePasswordFeedback;
    setupConfirm.onkeydown=function(e){
      e=e||window.event;
      if((e.keyCode||e.which)===13){
        if(e.preventDefault)e.preventDefault();
        jplopsoft_submitCredentialUI();
        return false;
      }
    };
  }

  if(setupNext)setupNext.onclick=jplopsoft_submitCredentialUI;

  jplopsoft_secureDesktopUpdate();
}

/* =========================================================================
 * ExFS user32.dll compatibility layer
 *
 * Browser JavaScript cannot call the real Windows user32.dll.  ExFS therefore
 * exposes a Win32-shaped window API whose system-owned Non-Client Area is
 * rendered by one central implementation, while applications only own their
 * Client Area.
 *
 * The API deliberately follows the Win32 names and message flow:
 *   RegisterClass -> CreateWindow/CreateWindowEx -> SendMessage
 *   WM_NCLBUTTONDOWN -> WM_SYSCOMMAND -> WM_CLOSE
 *
 * Existing ExFS windows are "adopted" into the same API, so Explorer, CMD,
 * Control Panel, Security, Recycle Bin, Properties, 3D Volume and editors
 * all share one window-system path.
 * ========================================================================= */

/* Standard Win32-style window styles (subset used by ExFS). */
var jplopsoft_WS_CAPTION=0x00C00000;
var jplopsoft_WS_SYSMENU=0x00080000;
var jplopsoft_WS_THICKFRAME=0x00040000;
var jplopsoft_WS_MINIMIZEBOX=0x00020000;
var jplopsoft_WS_MAXIMIZEBOX=0x00010000;
var jplopsoft_WS_VISIBLE=0x10000000;
var jplopsoft_WS_OVERLAPPEDWINDOW=
  jplopsoft_WS_CAPTION|
  jplopsoft_WS_SYSMENU|
  jplopsoft_WS_THICKFRAME|
  jplopsoft_WS_MINIMIZEBOX|
  jplopsoft_WS_MAXIMIZEBOX;

var jplopsoft_WS_EX_APPWINDOW=0x00040000;
var jplopsoft_WS_EX_TOOLWINDOW=0x00000080;

/* Win32-style messages and system commands. */
var jplopsoft_WM_CREATE=0x0001;
var jplopsoft_WM_DESTROY=0x0002;
var jplopsoft_WM_MOVE=0x0003;
var jplopsoft_WM_SIZE=0x0005;
var jplopsoft_WM_ACTIVATE=0x0006;
var jplopsoft_WM_CLOSE=0x0010;
var jplopsoft_WM_NCLBUTTONDOWN=0x00A1;
var jplopsoft_WM_NCACTIVATE=0x0086;
var jplopsoft_WM_SYSCOMMAND=0x0112;

var jplopsoft_SC_MINIMIZE=0xF020;
var jplopsoft_SC_MAXIMIZE=0xF030;
var jplopsoft_SC_CLOSE=0xF060;
var jplopsoft_SC_RESTORE=0xF120;

var jplopsoft_HTCAPTION=2;
var jplopsoft_HTMINBUTTON=8;
var jplopsoft_HTMAXBUTTON=9;
var jplopsoft_HTCLOSE=20;

var jplopsoft_SW_HIDE=0;
var jplopsoft_SW_SHOWNORMAL=1;
var jplopsoft_SW_SHOWMINIMIZED=2;
var jplopsoft_SW_SHOWMAXIMIZED=3;
var jplopsoft_SW_SHOW=5;
var jplopsoft_SW_MINIMIZE=6;
var jplopsoft_SW_RESTORE=9;

/* SIZE message wParam values. */
var jplopsoft_SIZE_RESTORED=0;
var jplopsoft_SIZE_MINIMIZED=1;
var jplopsoft_SIZE_MAXIMIZED=2;

var jplopsoft_USER32={
  nextHwnd:1000,
  classes:{},
  windows:{},
  byElementId:{}
};

var jplopsoft_DWM={
  compositor:'ExFS Desktop Window Manager',
  activeHwnd:0,
  surfaces:{}
};

function jplopsoft_user32Key(hwnd){
  return String(parseInt(hwnd,10)||0);
}

function jplopsoft_RegisterClass(className,wndProc){
  className=String(className||'');
  if(!className)return false;
  jplopsoft_USER32.classes[className]={name:className,wndProc:typeof wndProc==='function'?wndProc:null};
  return true;
}

function jplopsoft_user32GetRecord(hwnd){
  return jplopsoft_USER32.windows[jplopsoft_user32Key(hwnd)]||null;
}

function jplopsoft_user32GetHwndByElementId(id){
  return parseInt(jplopsoft_USER32.byElementId[String(id||'')],10)||0;
}

function jplopsoft_GetWindowElement(hwnd){
  var r=jplopsoft_user32GetRecord(hwnd);
  return r?jplopsoft_el(r.windowId):null;
}

function jplopsoft_GetClientElement(hwnd){
  var r=jplopsoft_user32GetRecord(hwnd);
  return r&&r.clientId?jplopsoft_el(r.clientId):null;
}

function jplopsoft_SetWindowText(hwnd,text){
  var r=jplopsoft_user32GetRecord(hwnd),n;
  if(!r)return false;
  r.title=String(text||'');
  n=r.titleId?jplopsoft_el(r.titleId):null;
  if(n)n.textContent=r.title;
  return true;
}

function jplopsoft_GetWindowRect(hwnd){
  var w=jplopsoft_GetWindowElement(hwnd),r;
  if(!w||!w.getBoundingClientRect)return null;
  r=w.getBoundingClientRect();
  return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.right-r.left,height:r.bottom-r.top};
}

function jplopsoft_GetClientRect(hwnd){
  var c=jplopsoft_GetClientElement(hwnd),w,r;
  if(c&&c.getBoundingClientRect){
    r=c.getBoundingClientRect();
    return{left:0,top:0,right:r.right-r.left,bottom:r.bottom-r.top,width:r.right-r.left,height:r.bottom-r.top};
  }
  w=jplopsoft_GetWindowElement(hwnd);
  if(!w||!w.getBoundingClientRect)return null;
  r=w.getBoundingClientRect();
  return{left:0,top:0,right:r.right-r.left,bottom:r.bottom-r.top,width:r.right-r.left,height:r.bottom-r.top};
}

function jplopsoft_DwmRegisterSurface(rec){
  var w;
  if(!rec)return;
  w=jplopsoft_el(rec.windowId);
  if(!w)return;
  jplopsoft_wmClassAdd(w,'jplopsoft_win32-window');
  jplopsoft_wmClassAdd(w,'jplopsoft_dwm-surface');
  jplopsoft_wmClassAdd(w,'jplopsoft_dwm-inactive');
  w.setAttribute('data-exfs-hwnd',String(rec.hwnd));
  w.setAttribute('data-exfs-win32-class',String(rec.className||''));
  jplopsoft_DWM.surfaces[jplopsoft_user32Key(rec.hwnd)]=rec.windowId;
}

function jplopsoft_DwmUnregisterSurface(hwnd){
  var k=jplopsoft_user32Key(hwnd);
  delete jplopsoft_DWM.surfaces[k];
  if(jplopsoft_DWM.activeHwnd===parseInt(hwnd,10))jplopsoft_DWM.activeHwnd=0;
}

function jplopsoft_DwmActivateWindow(hwnd){
  var k,id,w,active=parseInt(hwnd,10)||0,rec=jplopsoft_user32GetRecord(hwnd);
  for(k in jplopsoft_DWM.surfaces){
    if(jplopsoft_DWM.surfaces.hasOwnProperty(k)){
      id=jplopsoft_DWM.surfaces[k];
      w=jplopsoft_el(id);
      if(w){
        jplopsoft_wmClassRemove(w,'jplopsoft_dwm-active');
        jplopsoft_wmClassAdd(w,'jplopsoft_dwm-inactive');
      }
    }
  }
  if(rec){
    w=jplopsoft_el(rec.windowId);
    if(w){
      jplopsoft_wmClassRemove(w,'jplopsoft_dwm-inactive');
      jplopsoft_wmClassAdd(w,'jplopsoft_dwm-active');
    }
  }
  jplopsoft_DWM.activeHwnd=active;
}

function jplopsoft_user32Activate(rec){
  if(!rec)return false;

  if(rec.ntTerminated){
    rec.ntTerminated=false;
    rec.ntPid=0;
  }
  if(typeof jplopsoft_ntKernelOnWindowActivated==='function'){
    jplopsoft_ntKernelOnWindowActivated(rec);
  }

  if(rec.overlay){
    jplopsoft_wmActivateOverlay(rec.backdropId,rec.windowId,rec.appId);
  }else{
    jplopsoft_wmActivate(rec.windowId,rec.appId);
  }
  jplopsoft_DwmActivateWindow(rec.hwnd);
  jplopsoft_SendMessage(rec.hwnd,jplopsoft_WM_NCACTIVATE,1,0);
  jplopsoft_SendMessage(rec.hwnd,jplopsoft_WM_ACTIVATE,1,0);
  return true;
}


function jplopsoft_user32DisplayIsVisible(rec){
  var w,b;
  if(!rec)return false;
  if(rec.overlay){
    b=rec.backdropId?jplopsoft_el(rec.backdropId):null;
    return !!(b&&b.style.display!=='none'&&b.offsetWidth>0);
  }
  w=jplopsoft_el(rec.windowId);
  return !!(w&&w.style.display!=='none'&&!jplopsoft_wmClassHas(w,'jplopsoft_hidden'));
}

function jplopsoft_user32BringToFront(hwnd){
  var rec=jplopsoft_user32GetRecord(hwnd);
  if(!rec)return false;
  jplopsoft_user32Display(rec,true);
  jplopsoft_user32Activate(rec);
  return true;
}

function jplopsoft_user32IsMaximized(rec){
  var w=rec?jplopsoft_el(rec.windowId):null;
  return !!(w&&(jplopsoft_wmClassHas(w,'jplopsoft_wm-maximized')||jplopsoft_wmClassHas(w,'jplopsoft_maximized')));
}

function jplopsoft_user32Display(rec,show){
  var w,b;
  if(!rec)return false;
  w=jplopsoft_el(rec.windowId);
  b=rec.backdropId?jplopsoft_el(rec.backdropId):null;
  if(rec.overlay){
    if(b)b.style.display=show?'flex':'none';
  }else if(w){
    if(show)w.style.display=rec.displayMode||'block';
    else w.style.display='none';
  }
  return true;
}

function jplopsoft_ShowWindow(hwnd,cmd){
  var rec=jplopsoft_user32GetRecord(hwnd),w;
  if(!rec)return false;
  w=jplopsoft_el(rec.windowId);

  if(cmd===jplopsoft_SW_HIDE){
    jplopsoft_user32Display(rec,false);
    return true;
  }

  if(cmd===jplopsoft_SW_MINIMIZE||cmd===jplopsoft_SW_SHOWMINIMIZED){
    if(typeof rec.onMinimize==='function')rec.onMinimize(rec);
    else if(rec.overlay)jplopsoft_wmOverlayMinimize(rec.backdropId,rec.windowId,rec.appId);
    else jplopsoft_wmMinimize(rec.windowId,rec.appId);
    jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_MINIMIZED,0);
    return true;
  }

  if(cmd===jplopsoft_SW_SHOWMAXIMIZED){
    jplopsoft_user32Display(rec,true);
    if(typeof rec.onMaximize==='function')rec.onMaximize(rec);
    else if(rec.overlay)jplopsoft_wmClassAdd(w,'jplopsoft_wm-maximized');
    else jplopsoft_wmClassAdd(w,'jplopsoft_wm-maximized');
    jplopsoft_user32Activate(rec);
    jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_MAXIMIZED,0);
    return true;
  }

  if(cmd===jplopsoft_SW_RESTORE){
    jplopsoft_user32Display(rec,true);
    if(typeof rec.onRestore==='function')rec.onRestore(rec);
    else{
      jplopsoft_wmClassRemove(w,'jplopsoft_wm-maximized');
      jplopsoft_wmClassRemove(w,'jplopsoft_maximized');
    }
    jplopsoft_user32Activate(rec);
    jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_RESTORED,0);
    return true;
  }

  jplopsoft_user32Display(rec,true);
  jplopsoft_user32Activate(rec);
  return true;
}

function jplopsoft_DestroyWindow(hwnd){
  var rec=jplopsoft_user32GetRecord(hwnd),w,k;
  if(!rec)return false;
  if(rec.destroying)return false;
  rec.destroying=true;

  if(typeof jplopsoft_ntKernelOnWindowDestroyed==='function'){
    jplopsoft_ntKernelOnWindowDestroyed(rec);
  }
  if(typeof jplopsoft_cmdOnWindowDestroyed==='function'){
    jplopsoft_cmdOnWindowDestroyed(rec);
  }

  jplopsoft_SendMessage(hwnd,jplopsoft_WM_DESTROY,0,0);
  if(rec.appId&&rec.taskbar!==false)jplopsoft_taskbarRemoveApp(rec.appId);

  w=jplopsoft_el(rec.windowId);
  if(rec.dynamic&&w&&w.parentNode)w.parentNode.removeChild(w);
  else jplopsoft_user32Display(rec,false);

  delete jplopsoft_USER32.byElementId[rec.windowId];
  if(rec.titlebarId)delete jplopsoft_USER32.byElementId[rec.titlebarId];
  k=jplopsoft_user32Key(hwnd);
  delete jplopsoft_USER32.windows[k];
  jplopsoft_DwmUnregisterSurface(hwnd);
  return true;
}

function jplopsoft_DefWindowProc(hwnd,msg,wParam,lParam){
  var rec=jplopsoft_user32GetRecord(hwnd),w;
  if(!rec)return 0;

  if(msg===jplopsoft_WM_NCLBUTTONDOWN){
    if(wParam===jplopsoft_HTMINBUTTON)return jplopsoft_SendMessage(hwnd,jplopsoft_WM_SYSCOMMAND,jplopsoft_SC_MINIMIZE,0);
    if(wParam===jplopsoft_HTMAXBUTTON){
      return jplopsoft_SendMessage(hwnd,jplopsoft_WM_SYSCOMMAND,jplopsoft_user32IsMaximized(rec)?jplopsoft_SC_RESTORE:jplopsoft_SC_MAXIMIZE,0);
    }
    if(wParam===jplopsoft_HTCLOSE)return jplopsoft_SendMessage(hwnd,jplopsoft_WM_SYSCOMMAND,jplopsoft_SC_CLOSE,0);
    return 0;
  }

  if(msg===jplopsoft_WM_SYSCOMMAND){
    if(wParam===jplopsoft_SC_MINIMIZE){
      jplopsoft_ShowWindow(hwnd,jplopsoft_SW_MINIMIZE);
      return 0;
    }
    if(wParam===jplopsoft_SC_MAXIMIZE){
      if(typeof rec.onMaximize==='function'){
        rec.onMaximize(rec);
        jplopsoft_user32Activate(rec);
        jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_MAXIMIZED,0);
      }else jplopsoft_ShowWindow(hwnd,jplopsoft_SW_SHOWMAXIMIZED);
      return 0;
    }
    if(wParam===jplopsoft_SC_RESTORE){
      if(typeof rec.onRestore==='function'){
        rec.onRestore(rec);
        jplopsoft_user32Activate(rec);
        jplopsoft_SendMessage(hwnd,jplopsoft_WM_SIZE,jplopsoft_SIZE_RESTORED,0);
      }else jplopsoft_ShowWindow(hwnd,jplopsoft_SW_RESTORE);
      return 0;
    }
    if(wParam===jplopsoft_SC_CLOSE){
      return jplopsoft_SendMessage(hwnd,jplopsoft_WM_CLOSE,0,0);
    }
  }

  if(msg===jplopsoft_WM_CLOSE){
    if(typeof rec.onClose==='function'){
      rec.onClose(rec);
      return 0;
    }
    jplopsoft_DestroyWindow(hwnd);
    return 0;
  }

  return 0;
}

function jplopsoft_SendMessage(hwnd,msg,wParam,lParam){
  var rec=jplopsoft_user32GetRecord(hwnd),ret;
  if(!rec)return 0;
  if(typeof rec.wndProc==='function'){
    ret=rec.wndProc(hwnd,msg,wParam,lParam);
    if(ret!==null&&typeof ret!=='undefined')return ret;
  }
  return jplopsoft_DefWindowProc(hwnd,msg,wParam,lParam);
}

function jplopsoft_user32BindNcButton(hwnd,id,hitCode){
  var b=jplopsoft_el(id);
  if(!b)return;
  b.setAttribute('data-exfs-hwnd',String(hwnd));
  b.setAttribute('data-exfs-nc-hit',String(hitCode));
  b.onclick=function(e){
    e=e||window.event;
    if(e&&e.preventDefault)e.preventDefault();
    jplopsoft_SendMessage(hwnd,jplopsoft_WM_NCLBUTTONDOWN,hitCode,0);
    return false;
  };
}

function jplopsoft_user32BindTitlebar(hwnd,titlebarId){
  var rec=jplopsoft_user32GetRecord(hwnd),t=jplopsoft_el(titlebarId);
  if(!rec||!t)return;
  t.setAttribute('data-exfs-nonclient','1');
  jplopsoft_wmClassAdd(t,'jplopsoft_win32-nonclient-area');
  t.ondblclick=function(e){
    e=e||window.event;
    if(!jplopsoft_wmCanDragTarget(e.target||e.srcElement))return;
    if((rec.style&jplopsoft_WS_MAXIMIZEBOX)!==0){
      jplopsoft_SendMessage(hwnd,jplopsoft_WM_NCLBUTTONDOWN,jplopsoft_HTMAXBUTTON,0);
    }
  };
  jplopsoft_wmMakeDraggable(rec.windowId,titlebarId);
}

function jplopsoft_AdoptWindow(options){
  var o=options||{},classDef,rec,hwnd,w,i,n;
  if(!o.windowId||!jplopsoft_el(o.windowId))return 0;

  hwnd=jplopsoft_USER32.nextHwnd++;
  classDef=jplopsoft_USER32.classes[String(o.className||'')]||null;
  rec={
    hwnd:hwnd,
    dynamic:false,
    overlay:!!o.overlay,
    backdropId:String(o.backdropId||''),
    windowId:String(o.windowId||''),
    titlebarId:String(o.titlebarId||''),
    titleId:String(o.titleId||''),
    clientId:String(o.clientId||''),
    className:String(o.className||'ExFS.AdoptedWindow'),
    title:String(o.title||''),
    style:typeof o.style==='number'?o.style:jplopsoft_WS_OVERLAPPEDWINDOW,
    exStyle:typeof o.exStyle==='number'?o.exStyle:0,
    appId:String(o.appId||''),
    icon:String(o.icon||'file'),
    displayMode:String(o.displayMode||'block'),
    taskbar:o.taskbar===false?false:true,
    wndProc:typeof o.wndProc==='function'?o.wndProc:(classDef?classDef.wndProc:null),
    onMinimize:typeof o.onMinimize==='function'?o.onMinimize:null,
    onMaximize:typeof o.onMaximize==='function'?o.onMaximize:null,
    onRestore:typeof o.onRestore==='function'?o.onRestore:null,
    onClose:typeof o.onClose==='function'?o.onClose:null,
    param:o.param||null
  };

  jplopsoft_USER32.windows[jplopsoft_user32Key(hwnd)]=rec;
  jplopsoft_USER32.byElementId[rec.windowId]=hwnd;
  if(rec.titlebarId)jplopsoft_USER32.byElementId[rec.titlebarId]=hwnd;

  w=jplopsoft_el(rec.windowId);
  jplopsoft_DwmRegisterSurface(rec);

  if(rec.titlebarId)jplopsoft_user32BindTitlebar(hwnd,rec.titlebarId);
  if(o.minButtonId)jplopsoft_user32BindNcButton(hwnd,o.minButtonId,jplopsoft_HTMINBUTTON);
  if(o.maxButtonId)jplopsoft_user32BindNcButton(hwnd,o.maxButtonId,jplopsoft_HTMAXBUTTON);
  if(o.closeButtonId)jplopsoft_user32BindNcButton(hwnd,o.closeButtonId,jplopsoft_HTCLOSE);

  if(o.clientIds&&o.clientIds.length){
    for(i=0;i<o.clientIds.length;i++){
      n=jplopsoft_el(o.clientIds[i]);
      if(n){
        n.setAttribute('data-exfs-client','1');
        jplopsoft_wmClassAdd(n,'jplopsoft_win32-client-area');
      }
    }
  }

  jplopsoft_SendMessage(hwnd,jplopsoft_WM_CREATE,0,rec.param);
  return hwnd;
}

function jplopsoft_CreateWindowEx(exStyle,className,windowName,style,x,y,width,height,parent,menu,instance,param){
  jplopsoft_dwmNormalizeRootStacking();
  var classDef=jplopsoft_USER32.classes[String(className||'')]||null,
      p=param||{},app=jplopsoft_rootWindowHost()||jplopsoft_el('jplopsoft_app')||(document.querySelector?document.querySelector('.jplopsoft_app'):null),
      task=jplopsoft_el('jplopsoft_taskbar'),hwnd,rec,win,titlebar,icon,title,controls,b,client;

  if(!app)return 0;
  hwnd=jplopsoft_USER32.nextHwnd++;

  rec={
    hwnd:hwnd,
    dynamic:true,
    overlay:false,
    backdropId:'',
    windowId:String(p.windowId||('jplopsoft_win32Window_'+hwnd)),
    titlebarId:String(p.titlebarId||('jplopsoft_win32Titlebar_'+hwnd)),
    titleId:String(p.titleId||('jplopsoft_win32Title_'+hwnd)),
    clientId:String(p.clientId||('jplopsoft_win32Client_'+hwnd)),
    className:String(className||'ExOS.Window'),
    title:String(windowName||''),
    style:typeof style==='number'?style:jplopsoft_WS_OVERLAPPEDWINDOW,
    exStyle:typeof exStyle==='number'?exStyle:0,
    appId:String(p.appId||('win32_'+hwnd)),
    icon:String(p.icon||'file'),
    displayMode:'flex',
    taskbar:p.taskbar===false?false:true,
    wndProc:typeof p.wndProc==='function'?p.wndProc:(classDef?classDef.wndProc:null),
    onMinimize:null,onMaximize:null,onRestore:null,onClose:null,
    param:p
  };

  win=document.createElement(p.tagName||'section');
  win.id=rec.windowId;
  win.className='jplopsoft_wm-window jplopsoft_dwm-root-window jplopsoft_win32-window jplopsoft_win32-created-window jplopsoft_dwm-surface '+String(p.windowClass||'');
  win.style.left=(typeof x==='number'?x:80)+'px';
  win.style.top=(typeof y==='number'?y:60)+'px';
  win.style.display='flex';
  win.style.flexDirection='column';
  win.style.alignItems='stretch';
  if(typeof width==='number'&&width>0)win.style.width=width+'px';
  if(typeof height==='number'&&height>0)win.style.height=height+'px';

  titlebar=document.createElement('div');
  titlebar.id=rec.titlebarId;
  titlebar.className='jplopsoft_wm-titlebar jplopsoft_win32-nonclient-area '+String(p.titlebarClass||'');
  titlebar.setAttribute('data-exfs-nonclient','1');

  icon=document.createElement('div');
  icon.className='jplopsoft_wm-title-icon';
  icon.setAttribute('data-exfs-svg',rec.icon);
  icon.setAttribute('data-exfs-svg-size','18');
  titlebar.appendChild(icon);

  title=document.createElement('div');
  title.id=rec.titleId;
  title.className='jplopsoft_wm-title';
  title.textContent=rec.title;
  titlebar.appendChild(title);

  controls=document.createElement('div');
  controls.className='jplopsoft_wm-controls';

  if((rec.style&jplopsoft_WS_MINIMIZEBOX)!==0){
    b=document.createElement('button');b.type='button';b.className='jplopsoft_wm-control';
    b.title='最小化';b.setAttribute('aria-label','最小化');b.setAttribute('data-exfs-svg','minimize');b.setAttribute('data-exfs-svg-size','11');
    b.setAttribute('data-exfs-nc-hit',String(jplopsoft_HTMINBUTTON));controls.appendChild(b);
  }
  if((rec.style&jplopsoft_WS_MAXIMIZEBOX)!==0){
    b=document.createElement('button');b.type='button';b.className='jplopsoft_wm-control';
    b.title='最大化';b.setAttribute('aria-label','最大化');b.setAttribute('data-exfs-svg','maximize');b.setAttribute('data-exfs-svg-size','11');
    b.setAttribute('data-exfs-nc-hit',String(jplopsoft_HTMAXBUTTON));controls.appendChild(b);
  }
  if((rec.style&jplopsoft_WS_SYSMENU)!==0){
    b=document.createElement('button');b.type='button';b.className='jplopsoft_wm-control jplopsoft_wm-close';
    b.title='關閉';b.setAttribute('aria-label','關閉');b.setAttribute('data-exfs-svg','close');b.setAttribute('data-exfs-svg-size','11');
    b.setAttribute('data-exfs-nc-hit',String(jplopsoft_HTCLOSE));controls.appendChild(b);
  }
  titlebar.appendChild(controls);
  win.appendChild(titlebar);

  client=document.createElement('div');
  client.id=rec.clientId;
  client.className='jplopsoft_win32-client jplopsoft_win32-client-area '+String(p.clientClass||'');
  client.setAttribute('data-exfs-client','1');
  win.appendChild(client);

  if(task&&task.parentNode===app)app.insertBefore(win,task);else app.appendChild(win);

  jplopsoft_USER32.windows[jplopsoft_user32Key(hwnd)]=rec;
  jplopsoft_USER32.byElementId[rec.windowId]=hwnd;
  jplopsoft_USER32.byElementId[rec.titlebarId]=hwnd;

  jplopsoft_DwmRegisterSurface(rec);
  jplopsoft_user32BindTitlebar(hwnd,rec.titlebarId);

  /* Bind the centrally generated Non-Client Area controls. */
  controls.onclick=function(e){
    var t=e.target||e.srcElement,hit;
    while(t&&t!==controls&&!t.getAttribute('data-exfs-nc-hit'))t=t.parentNode;
    if(!t||t===controls)return;
    hit=parseInt(t.getAttribute('data-exfs-nc-hit'),10)||0;
    if(hit)jplopsoft_SendMessage(hwnd,jplopsoft_WM_NCLBUTTONDOWN,hit,0);
  };

  win.onmousedown=function(){jplopsoft_user32Activate(rec);};
  jplopsoft_applySvgIcons(win);
  jplopsoft_SendMessage(hwnd,jplopsoft_WM_CREATE,0,p);

  if(rec.taskbar&&(rec.exStyle&jplopsoft_WS_EX_TOOLWINDOW)===0){
    jplopsoft_taskbarEnsureApp(rec.appId,rec.icon,rec.title);
  }

  if((rec.style&jplopsoft_WS_VISIBLE)!==0)jplopsoft_ShowWindow(hwnd,jplopsoft_SW_SHOW);
  else win.style.display='none';

  return hwnd;
}

function jplopsoft_CreateWindow(className,windowName,style,x,y,width,height,parent,menu,instance,param){
  return jplopsoft_CreateWindowEx(0,className,windowName,style,x,y,width,height,parent,menu,instance,param);
}

/* Default window class for applications that do not need a custom WndProc. */
jplopsoft_RegisterClass('ExOS.Window',null);
jplopsoft_RegisterClass('ExOS.MultiEditor',null);

/* -------------------------------------------------------------------------
 * ExFS Desktop Window Manager
 *
 * All primary apps share one browser tab and coexist above the desktop:
 * Explorer, CMD, document editor, Control Panel and Security.
 * ---------------------------------------------------------------------- */
var jplopsoft_WM={
  z:140,
  active:'',
  dragging:false
};

/*
 * os21 Explorer lifecycle stabilization.
 *
 * A shell open request can be followed by stale mouse/taskbar callbacks that
 * were queued before explorer.exe became visible.  Keep a short open guard
 * and generation token so stale non-explicit hide/minimize operations cannot
 * immediately make the Explorer window disappear.
 */
var jplopsoft_EXPLORER_LIFECYCLE={
  generation:0,
  guardUntil:0,
  lastOpenAt:0,
  desiredVisible:false,
  lastHealthReason:'',
  watchdogTimer:0,
  rescueCount:0
};

function jplopsoft_explorerNow(){
  return (new Date()).getTime();
}

function jplopsoft_explorerBeginOpen(){
  jplopsoft_EXPLORER_LIFECYCLE.generation++;
  jplopsoft_EXPLORER_LIFECYCLE.lastOpenAt=jplopsoft_explorerNow();
  jplopsoft_EXPLORER_LIFECYCLE.guardUntil=jplopsoft_EXPLORER_LIFECYCLE.lastOpenAt+1200;
  jplopsoft_EXPLORER_LIFECYCLE.desiredVisible=true;
  jplopsoft_explorerStartWatchdog();
  return jplopsoft_EXPLORER_LIFECYCLE.generation;
}

function jplopsoft_explorerCancelPendingRestore(){
  jplopsoft_EXPLORER_LIFECYCLE.generation++;
  jplopsoft_EXPLORER_LIFECYCLE.guardUntil=0;
}

function jplopsoft_explorerHideGuardActive(){
  return jplopsoft_explorerNow()<jplopsoft_EXPLORER_LIFECYCLE.guardUntil;
}

function jplopsoft_explorerSetDesiredVisible(on){
  jplopsoft_EXPLORER_LIFECYCLE.desiredVisible=!!on;

  if(on)jplopsoft_explorerStartWatchdog();
  else jplopsoft_explorerStopWatchdog();
}

function jplopsoft_explorerComputedVisible(w){
  var cs,r,vw,vh;
  if(!w)return false;
  if(jplopsoft_wmClassHas(w,'jplopsoft_hidden'))return false;
  try{cs=window.getComputedStyle?window.getComputedStyle(w,null):w.currentStyle;}catch(ignoreExplorerStyle){cs=null;}
  if(cs){
    if(String(cs.display||'').toLowerCase()==='none')return false;
    if(String(cs.visibility||'').toLowerCase()==='hidden')return false;
    if(parseFloat(cs.opacity)===0)return false;
  }else if(w.style&&w.style.display==='none')return false;
  if(!w.getBoundingClientRect)return true;
  r=w.getBoundingClientRect();
  vw=document.documentElement.clientWidth||window.innerWidth||1024;
  vh=document.documentElement.clientHeight||window.innerHeight||768;
  if((r.right-r.left)<240||(r.bottom-r.top)<160)return false;
  if(r.right<60||r.bottom<60)return false;
  if(r.left>vw-60||r.top>vh-60)return false;
  return true;
}

function jplopsoft_explorerContainsNode(w,n){
  if(!w||!n)return false;
  if(n===w)return true;
  try{
    if(w.contains)return w.contains(n);
  }catch(ignoreExplorerContains){}
  while(n){
    if(n===w)return true;
    n=n.parentNode;
  }
  return false;
}

function jplopsoft_explorerFrontmost(w){
  var r,vw,vh,points,i,x,y,n;

  if(!w||!jplopsoft_explorerComputedVisible(w))return false;
  if(!document.elementFromPoint)return true;

  r=w.getBoundingClientRect();
  vw=document.documentElement.clientWidth||window.innerWidth||1024;
  vh=document.documentElement.clientHeight||window.innerHeight||768;

  /*
   * Test several points. A single point could coincidentally land below a
   * legitimate popup. The title bar + client area must belong to Explorer.
   */
  points=[
    [r.left+Math.min(120,Math.max(20,(r.right-r.left)/4)),r.top+16],
    [r.left+Math.min(220,Math.max(40,(r.right-r.left)/3)),r.top+60],
    [r.left+Math.min(320,Math.max(60,(r.right-r.left)/2)),r.top+120]
  ];

  for(i=0;i<points.length;i++){
    x=Math.max(1,Math.min(vw-2,Math.round(points[i][0])));
    y=Math.max(1,Math.min(vh-42,Math.round(points[i][1])));

    try{n=document.elementFromPoint(x,y);}catch(ignoreExplorerPoint){n=null;}

    if(n&&jplopsoft_explorerContainsNode(w,n))return true;
  }

  return false;
}

function jplopsoft_explorerForceInlineVisible(w){
  if(!w)return false;

  try{
    w.style.setProperty('display','flex','important');
    w.style.setProperty('visibility','visible','important');
    w.style.setProperty('opacity','1','important');
    w.style.setProperty('pointer-events','auto','important');
    w.style.setProperty('position','fixed','important');
    w.style.setProperty('transform','none','important');
    w.style.setProperty('filter','none','important');
    w.style.setProperty('clip','auto','important');
    w.style.setProperty('clip-path','none','important');
    w.style.setProperty('overflow','hidden','important');
  }catch(ignoreExplorerImportant){
    w.style.display='flex';
    w.style.visibility='visible';
    w.style.opacity='1';
    w.style.pointerEvents='auto';
    w.style.position='fixed';
  }

  return true;
}

function jplopsoft_explorerPromoteForeground(w){
  var z;

  if(!w)return false;

  jplopsoft_dwmNormalizeRootStacking();
  jplopsoft_explorerPortalToRoot(w);
  jplopsoft_explorerForceInlineVisible(w);

  /*
   * Use the normal window manager counter. Since Explorer is now a direct
   * BODY child, its z-index is compared at the same root level as overlays,
   * other applications and the taskbar.
   */
  z=jplopsoft_wmNextZ();
  if(z<200)z=300;

  w.style.zIndex=String(z);
  jplopsoft_WM.z=z;

  jplopsoft_wmClassAdd(
    w,
    'jplopsoft_wm-active'
  );

  return true;
}

function jplopsoft_explorerStartWatchdog(){
  if(jplopsoft_EXPLORER_LIFECYCLE.watchdogTimer)return;

  jplopsoft_EXPLORER_LIFECYCLE.watchdogTimer=window.setInterval(function(){
    if(!jplopsoft_EXPLORER_LIFECYCLE.desiredVisible)return;
    if(!state.samAuthenticated||!state.vaultKey)return;
    jplopsoft_explorerHealthCheck();
  },500);
}

function jplopsoft_explorerStopWatchdog(){
  if(!jplopsoft_EXPLORER_LIFECYCLE.watchdogTimer)return;

  try{
    window.clearInterval(jplopsoft_EXPLORER_LIFECYCLE.watchdogTimer);
  }catch(ignoreExplorerWatchdog){}

  jplopsoft_EXPLORER_LIFECYCLE.watchdogTimer=0;
}



function jplopsoft_explorerResetGeometry(w){
  if(!w)return false;

  jplopsoft_wmClassRemove(w,'jplopsoft_wm-maximized');
  jplopsoft_wmClassRemove(w,'jplopsoft_maximized');

  try{
    w.style.setProperty('position','fixed','important');
    w.style.setProperty('left','40px','important');
    w.style.setProperty('top','36px','important');
    w.style.setProperty('right','auto','important');
    w.style.setProperty('bottom','auto','important');
    w.style.setProperty('width','calc(100vw - 80px)','important');
    w.style.setProperty('height','calc(100vh - 116px)','important');
    w.style.setProperty('min-width','520px','important');
    w.style.setProperty('min-height','320px','important');
    w.style.setProperty('max-width','none','important');
    w.style.setProperty('max-height','none','important');
    w.style.setProperty('resize','both','important');
  }catch(ignoreExplorerGeometryImportant){
    w.style.position='fixed';
    w.style.left='40px';
    w.style.top='36px';
    w.style.right='auto';
    w.style.bottom='auto';
    w.style.width='calc(100vw - 80px)';
    w.style.height='calc(100vh - 116px)';
  }

  return true;
}

function jplopsoft_explorerEnsureOnScreen(){
  var w=jplopsoft_el('jplopsoft_explorerWindow'),r,vw,vh,bad=false,reason='';
  if(!w)return false;
  if(!jplopsoft_explorerComputedVisible(w)){bad=true;reason='computed-hidden-or-offscreen';}
  else if(w.getBoundingClientRect){
    r=w.getBoundingClientRect();
    vw=document.documentElement.clientWidth||window.innerWidth||1024;
    vh=document.documentElement.clientHeight||window.innerHeight||768;
    if((r.right-r.left)<320||(r.bottom-r.top)<240||r.right<80||r.bottom<80||r.left>vw-80||r.top>vh-80){bad=true;reason='invalid-window-geometry';}
  }
  if(bad)jplopsoft_explorerResetGeometry(w);
  jplopsoft_EXPLORER_LIFECYCLE.lastHealthReason=reason;
  return true;
}

function jplopsoft_explorerHealthCheck(){
  var w=jplopsoft_el('jplopsoft_explorerWindow'),
      visible,front;

  if(!jplopsoft_EXPLORER_LIFECYCLE.desiredVisible)return false;
  if(!state.samAuthenticated||!state.vaultKey)return false;
  if(!w)return false;

  jplopsoft_explorerPortalToRoot(w);

  visible=jplopsoft_explorerComputedVisible(w);

  if(!visible){
    jplopsoft_EXPLORER_LIFECYCLE.lastHealthReason='hidden';
    jplopsoft_EXPLORER_LIFECYCLE.rescueCount++;
    jplopsoft_wmRestoreExplorerStable();
    return true;
  }

  jplopsoft_explorerEnsureOnScreen();

  front=jplopsoft_explorerFrontmost(w);

  if(!front){
    jplopsoft_EXPLORER_LIFECYCLE.lastHealthReason='occluded';
    jplopsoft_EXPLORER_LIFECYCLE.rescueCount++;
    jplopsoft_explorerPromoteForeground(w);
  }else{
    jplopsoft_EXPLORER_LIFECYCLE.lastHealthReason='';
  }

  jplopsoft_wmActivate(
    'jplopsoft_explorerWindow',
    'explorer'
  );

  if(!jplopsoft_explorerFrontmost(w)){
    jplopsoft_explorerPromoteForeground(w);
    jplopsoft_taskbarSetAppState(
      'explorer',
      'active'
    );
  }

  return true;
}


function jplopsoft_explorerScheduleStableRestore(generation){
  var delays=[0,40,100,220,500,1000,1800],i;

  for(i=0;i<delays.length;i++){
    (function(delay){
      window.setTimeout(function(){
        if(generation!==jplopsoft_EXPLORER_LIFECYCLE.generation)return;
        if(!jplopsoft_EXPLORER_LIFECYCLE.desiredVisible)return;
        jplopsoft_explorerHealthCheck();
      },delay);
    })(delays[i]);
  }
}

function jplopsoft_wmClassHas(node,name){
  return !!(node&&(' '+String(node.className||'')+' ').indexOf(' '+name+' ')>=0);
}

function jplopsoft_wmClassAdd(node,name){
  if(!node||jplopsoft_wmClassHas(node,name))return;
  node.className=String(node.className||'')+' '+name;
}

function jplopsoft_wmClassRemove(node,name){
  var s;
  if(!node)return;
  s=' '+String(node.className||'')+' ';
  while(s.indexOf(' '+name+' ')>=0)s=s.replace(' '+name+' ',' ');
  node.className=s.replace(/^\s+|\s+$/g,'');
}

function jplopsoft_taskbarAppId(appId){
  return 'jplopsoft_taskbarApp_'+String(appId||'');
}

function jplopsoft_taskbarEnsureApp(appId,icon,label){
  var host=jplopsoft_el('jplopsoft_taskbarApps'),
      id=jplopsoft_taskbarAppId(appId),
      btn=jplopsoft_el(id),ic,tx;

  if(!host)return null;

  if(!btn){
    btn=document.createElement('button');
    btn.id=id;
    btn.type='button';
    btn.className='jplopsoft_taskbar-app';
    btn.setAttribute('data-app-id',String(appId||''));
    btn.onclick=function(){jplopsoft_taskbarAppClick(String(this.getAttribute('data-app-id')||''));};

    ic=document.createElement('span');
    ic.className='jplopsoft_taskbar-app-icon';
    ic.setAttribute('data-task-icon','1');
    btn.appendChild(ic);

    tx=document.createElement('span');
    tx.className='jplopsoft_taskbar-app-text';
    tx.setAttribute('data-task-text','1');
    btn.appendChild(tx);
    host.appendChild(btn);
  }

  ic=btn.querySelector?btn.querySelector('[data-task-icon]'):null;
  tx=btn.querySelector?btn.querySelector('[data-task-text]'):null;
  if(ic)jplopsoft_svgIconApply(ic,jplopsoft_taskbarIconName(icon,appId),18);
  if(tx)tx.textContent=String(label||appId);
  btn.title=String(label||appId);
  btn.setAttribute('aria-label',String(label||appId));
  return btn;
}

function jplopsoft_taskbarRemoveApp(appId){
  var btn=jplopsoft_el(jplopsoft_taskbarAppId(appId));
  if(btn&&btn.parentNode)btn.parentNode.removeChild(btn);
}

function jplopsoft_taskbarSetAppState(appId,stateName){
  var btn=jplopsoft_el(jplopsoft_taskbarAppId(appId));
  if(!btn)return;
  btn.className='jplopsoft_taskbar-app'+
    (stateName==='active'?' jplopsoft_active':'')+
    (stateName==='minimized'?' jplopsoft_minimized':'');
  btn.setAttribute('aria-pressed',stateName==='active'?'true':'false');
}

function jplopsoft_wmNextZ(){
  jplopsoft_WM.z++;
  if(jplopsoft_WM.z>350)jplopsoft_WM.z=150;
  return jplopsoft_WM.z;
}

function jplopsoft_wmDeactivateTaskButtons(exceptApp){
  var host=jplopsoft_el('jplopsoft_taskbarApps'),buttons,i,app;
  if(!host)return;
  buttons=host.getElementsByTagName('button');
  for(i=0;i<buttons.length;i++){
    app=String(buttons[i].getAttribute('data-app-id')||'');
    if(app&&app!==exceptApp&&jplopsoft_wmClassHas(buttons[i],'jplopsoft_active')){
      buttons[i].className='jplopsoft_taskbar-app';
      buttons[i].setAttribute('aria-pressed','false');
    }
  }
}

function jplopsoft_wmActivate(windowId,appId){
  var w=jplopsoft_el(windowId),hwnd;

  if(!w)return;

  if(windowId==='jplopsoft_explorerWindow'){
    jplopsoft_explorerPortalToRoot(w);
  }

  jplopsoft_wmDeactivateTaskButtons(appId);
  jplopsoft_WM.active=String(appId||'');

  w.style.zIndex=String(
    jplopsoft_wmNextZ()
  );

  jplopsoft_wmClassAdd(
    w,
    'jplopsoft_wm-active'
  );

  jplopsoft_taskbarSetAppState(
    appId,
    'active'
  );

  hwnd=jplopsoft_user32GetHwndByElementId(
    windowId
  );

  if(hwnd){
    jplopsoft_DwmActivateWindow(hwnd);
  }
}

function jplopsoft_wmActivateOverlay(backdropId,panelId,appId){
  var b=jplopsoft_el(backdropId),p=jplopsoft_el(panelId),hwnd;
  if(!b||!p)return;
  jplopsoft_wmDeactivateTaskButtons(appId);
  jplopsoft_WM.active=String(appId||'');
  b.style.zIndex=String(jplopsoft_wmNextZ());
  jplopsoft_wmClassAdd(p,'jplopsoft_wm-active');
  jplopsoft_taskbarSetAppState(appId,'active');
  hwnd=jplopsoft_user32GetHwndByElementId(panelId);
  if(hwnd)jplopsoft_DwmActivateWindow(hwnd);
}

function jplopsoft_dwmNormalizeRootStacking(){
  var app=jplopsoft_el('jplopsoft_app')||(
        document.querySelector?document.querySelector('.jplopsoft_app'):null
      ),
      layer=jplopsoft_el('jplopsoft_dwmWindowLayer');

  if(app)app.style.zIndex='auto';

  if(layer){
    layer.style.zIndex='auto';
    layer.style.pointerEvents='none';
  }

  return true;
}

function jplopsoft_dwmWindowLayer(){
  return jplopsoft_el('jplopsoft_dwmWindowLayer');
}

function jplopsoft_dwmAttachToWindowLayer(w){
  var layer=jplopsoft_dwmWindowLayer();

  if(!w||!layer)return false;

  if(w.parentNode!==layer){
    try{layer.appendChild(w);}catch(ignoreDwmAttach){return false;}
  }

  w.style.pointerEvents='auto';
  return true;
}

function jplopsoft_rootWindowHost(){
  return document.body||document.documentElement;
}

function jplopsoft_explorerPortalToRoot(w){
  var host=jplopsoft_rootWindowHost();

  if(!w||!host)return false;

  if(w.parentNode!==host){
    try{
      host.appendChild(w);
    }catch(ignoreExplorerPortal){
      return false;
    }
  }

  jplopsoft_wmClassAdd(
    w,
    'jplopsoft_explorer-root-portal'
  );

  try{
    w.setAttribute(
      'data-exos-window-host',
      'BODY'
    );
  }catch(ignoreExplorerHostAttr){}

  return true;
}






/*
 * Launching a CreateWindowEx application from an overlay (for example
 * diskmgmt.exe from Control Panel) crosses two different window containers.
 * Explicitly put the source overlay one DWM step lower and the child
 * application one step higher.  Both stay below the taskbar's z=390.
 */
function jplopsoft_wmPlaceWindowAboveOverlay(hwnd,backdropId){
  var rec=jplopsoft_user32GetRecord(hwnd),w=rec?jplopsoft_el(rec.windowId):null,b=jplopsoft_el(backdropId),lowerZ,upperZ;
  if(!rec||!w)return false;
  jplopsoft_dwmNormalizeRootStacking();
  lowerZ=jplopsoft_wmNextZ();upperZ=jplopsoft_wmNextZ();
  if(b)b.style.zIndex=String(lowerZ);w.style.zIndex=String(upperZ);
  jplopsoft_wmDeactivateTaskButtons(rec.appId);jplopsoft_WM.active=String(rec.appId||'');
  jplopsoft_wmClassAdd(w,'jplopsoft_wm-active');jplopsoft_taskbarSetAppState(rec.appId,'active');
  try{jplopsoft_DwmActivateWindow(hwnd);}catch(ignoreDwmOverlayOrder){}
  return true;
}

function jplopsoft_wmMinimize(windowId,appId,explicitAction){
  var w=jplopsoft_el(windowId);

  if(
    windowId==='jplopsoft_explorerWindow'&&
    explicitAction!==true&&
    typeof jplopsoft_explorerHideGuardActive==='function'&&
    jplopsoft_explorerHideGuardActive()
  ){
    return false;
  }

  if(!w)return false;

  if(
    windowId==='jplopsoft_explorerWindow'&&
    explicitAction===true
  ){
    jplopsoft_explorerSetDesiredVisible(false);
    jplopsoft_explorerCancelPendingRestore();
  }

  try{
    w.style.setProperty('display','none','important');
  }catch(ignoreWmMinDisplay){
    w.style.display='none';
  }

  jplopsoft_wmClassRemove(
    w,
    'jplopsoft_wm-active'
  );

  if(windowId==='jplopsoft_explorerWindow'){
    try{
      document.body.setAttribute(
        'data-exos-explorer-visible',
        '0'
      );
    }catch(ignoreExplorerMinAttr){}
  }

  jplopsoft_taskbarSetAppState(
    appId,
    'minimized'
  );

  return true;
}

function jplopsoft_wmRestore(windowId,appId){
  var w=jplopsoft_el(windowId);
  if(!w)return;
  jplopsoft_wmClassRemove(w,'jplopsoft_hidden');
  w.style.display=(windowId==='jplopsoft_explorerWindow')?'flex':'block';
  jplopsoft_wmActivate(windowId,appId);
}

function jplopsoft_wmSetMaximized(windowId,on){
  var w=jplopsoft_el(windowId);
  if(!w)return;
  if(on)jplopsoft_wmClassAdd(w,'jplopsoft_wm-maximized');
  else jplopsoft_wmClassRemove(w,'jplopsoft_wm-maximized');
}

function jplopsoft_wmToggleMax(windowId){
  var w=jplopsoft_el(windowId);
  if(!w)return;
  jplopsoft_wmSetMaximized(windowId,!jplopsoft_wmClassHas(w,'jplopsoft_wm-maximized'));
}

function jplopsoft_wmSetOverlayMaximized(panelId,on){
  var p=jplopsoft_el(panelId);
  if(!p)return;
  if(on)jplopsoft_wmClassAdd(p,'jplopsoft_wm-maximized');
  else jplopsoft_wmClassRemove(p,'jplopsoft_wm-maximized');
}

function jplopsoft_wmToggleOverlayMax(panelId){
  var p=jplopsoft_el(panelId);
  if(!p)return;
  jplopsoft_wmSetOverlayMaximized(panelId,!jplopsoft_wmClassHas(p,'jplopsoft_wm-maximized'));
}

function jplopsoft_wmCanDragTarget(t){
  var tag=String(t&&t.tagName||'').toLowerCase();
  return tag!=='button'&&tag!=='input'&&tag!=='select'&&tag!=='textarea'&&tag!=='a';
}

function jplopsoft_wmMakeDraggable(panelId,handleId){
  var p=jplopsoft_el(panelId),h=jplopsoft_el(handleId);
  if(!p||!h)return;

  h.onmousedown=function(e){
    var sx,sy,left,top,move,up,rect;
    e=e||window.event;
    if(!jplopsoft_wmCanDragTarget(e.target||e.srcElement))return;
    if(jplopsoft_wmClassHas(p,'jplopsoft_wm-maximized')||jplopsoft_wmClassHas(p,'jplopsoft_maximized'))return;

    rect=p.getBoundingClientRect();
    sx=e.clientX;sy=e.clientY;left=rect.left;top=rect.top;
    jplopsoft_WM.dragging=true;

    move=function(ev){
      var nx,ny,maxX,maxY;
      ev=ev||window.event;
      if(!jplopsoft_WM.dragging)return;
      nx=left+(ev.clientX-sx);
      ny=top+(ev.clientY-sy);
      maxX=Math.max(0,(document.documentElement.clientWidth||window.innerWidth||1024)-80);
      maxY=Math.max(0,(document.documentElement.clientHeight||window.innerHeight||768)-80);
      if(nx<0)nx=0;if(ny<0)ny=0;if(nx>maxX)nx=maxX;if(ny>maxY)ny=maxY;
      p.style.left=Math.round(nx)+'px';
      p.style.top=Math.round(ny)+'px';
      p.style.right='auto';
      p.style.bottom='auto';
      if(ev.preventDefault)ev.preventDefault();
      return false;
    };
    up=function(){
      jplopsoft_WM.dragging=false;
      if(document.removeEventListener){
        document.removeEventListener('mousemove',move,false);
        document.removeEventListener('mouseup',up,false);
      }else if(document.detachEvent){
        document.detachEvent('onmousemove',move);
        document.detachEvent('onmouseup',up);
      }
    };

    if(document.addEventListener){
      document.addEventListener('mousemove',move,false);
      document.addEventListener('mouseup',up,false);
    }else if(document.attachEvent){
      document.attachEvent('onmousemove',move);
      document.attachEvent('onmouseup',up);
    }
    if(e.preventDefault)e.preventDefault();
    return false;
  };
}

function jplopsoft_wmOverlayMinimize(backdropId,panelId,appId){
  var b=jplopsoft_el(backdropId),p=jplopsoft_el(panelId);
  if(b)b.style.display='none';
  if(p)jplopsoft_wmClassRemove(p,'jplopsoft_wm-active');
  jplopsoft_taskbarSetAppState(appId,'minimized');
}

function jplopsoft_wmOverlayRestore(backdropId,panelId,appId){
  var b=jplopsoft_el(backdropId);
  if(!b)return;
  b.style.display='flex';
  jplopsoft_wmActivateOverlay(backdropId,panelId,appId);
}

function jplopsoft_wmIsDisplayed(id){
  var n=jplopsoft_el(id),cs,r;
  if(!n)return false;
  if(jplopsoft_wmClassHas(n,'jplopsoft_hidden'))return false;
  try{cs=window.getComputedStyle?window.getComputedStyle(n,null):n.currentStyle;}catch(ignoreWmDisplayedStyle){cs=null;}
  if(cs){
    if(String(cs.display||'').toLowerCase()==='none')return false;
    if(String(cs.visibility||'').toLowerCase()==='hidden')return false;
    if(parseFloat(cs.opacity)===0)return false;
  }else if(n.style.display==='none')return false;
  if(n.getBoundingClientRect){r=n.getBoundingClientRect();if((r.right-r.left)<2||(r.bottom-r.top)<2)return false;}
  return true;
}

function jplopsoft_wmRestoreExplorerStable(){
  var w=jplopsoft_el('jplopsoft_explorerWindow'),
      hwnd,er;

  if(!w||!state.samAuthenticated||!state.vaultKey)return false;

  jplopsoft_explorerSetDesiredVisible(true);
  jplopsoft_dwmNormalizeRootStacking();
  jplopsoft_explorerPortalToRoot(w);

  jplopsoft_wmClassRemove(w,'jplopsoft_hidden');
  jplopsoft_wmClassRemove(w,'jplopsoft_dwm-inactive');

  jplopsoft_explorerForceInlineVisible(w);
  jplopsoft_explorerEnsureOnScreen();

  jplopsoft_setBodyClassToken(
    'jplopsoft_explorer-process-stopped',
    false
  );

  jplopsoft_taskbarEnsureApp(
    'explorer',
    'explorer',
    '檔案總管'
  );

  hwnd=jplopsoft_user32GetHwndByElementId(
    'jplopsoft_explorerWindow'
  );

  if(hwnd){
    er=jplopsoft_user32GetRecord(hwnd);

    if(er){
      if(er.ntTerminated){
        er.ntTerminated=false;
        er.ntPid=0;
      }

      try{
        if(typeof jplopsoft_ntKernelOnWindowActivated==='function'){
          jplopsoft_ntKernelOnWindowActivated(er);
        }
      }catch(ignoreExplorerNtActivation){}
    }
  }

  jplopsoft_wmActivate(
    'jplopsoft_explorerWindow',
    'explorer'
  );

  if(hwnd&&jplopsoft_user32GetRecord(hwnd)){
    try{
      jplopsoft_DwmActivateWindow(hwnd);
    }catch(ignoreExplorerDwm){}
  }

  if(!jplopsoft_explorerFrontmost(w)){
    jplopsoft_explorerPromoteForeground(w);
    jplopsoft_taskbarSetAppState(
      'explorer',
      'active'
    );
  }

  try{
    document.body.setAttribute(
      'data-exos-explorer-visible',
      '1'
    );
  }catch(ignoreExplorerVisibleAttr){}

  return jplopsoft_explorerComputedVisible(w);
}

function jplopsoft_wmOpenExplorer(folderId){
  var generation,renderError=null,w;

  if(!state.samAuthenticated||!state.vaultKey)return false;

  generation=jplopsoft_explorerBeginOpen();
  w=jplopsoft_el('jplopsoft_explorerWindow');

  if(w){
    jplopsoft_explorerPortalToRoot(w);
    jplopsoft_explorerForceInlineVisible(w);
    jplopsoft_explorerResetGeometry(w);
  }

  jplopsoft_wmRestoreExplorerStable();

  if(typeof folderId!=='undefined'&&folderId!==null){
    jplopsoft_clearChecked();

    state.currentFolder=parseInt(folderId,10);
    if(isNaN(state.currentFolder))state.currentFolder=0;

    state.selectedId=0;
    state.desktopSelectedTargetId=0;
    state.desktopShellSelected='';
    state.checkedIds={};
    state.checkedFolder=state.currentFolder;

    try{
      jplopsoft_renderAll();
    }catch(e){
      renderError=e;

      try{
        if(window.console&&console.error){
          console.error(
            'ExOS explorer render failed',
            e
          );
        }
      }catch(ignoreExplorerConsole){}
    }
  }

  jplopsoft_wmRestoreExplorerStable();
  jplopsoft_explorerHealthCheck();
  jplopsoft_explorerScheduleStableRestore(generation);

  if(renderError){
    try{
      jplopsoft_setStatus(
        '檔案總管已開啟，但部分內容重新整理失敗：'+
        String(renderError.message||renderError)
      );
    }catch(ignoreExplorerStatus){}
  }

  return true;
}

function jplopsoft_openMyComputer(){
  return jplopsoft_wmOpenExplorer(0);
}

function jplopsoft_wmCloseExplorer(explicitAction){
  var w=jplopsoft_el('jplopsoft_explorerWindow');

  if(
    explicitAction!==true&&
    typeof jplopsoft_explorerHideGuardActive==='function'&&
    jplopsoft_explorerHideGuardActive()
  ){
    return false;
  }

  jplopsoft_explorerSetDesiredVisible(false);
  jplopsoft_explorerCancelPendingRestore();

  if(w){
    try{
      w.style.setProperty('display','none','important');
    }catch(ignoreExplorerCloseDisplay){
      w.style.display='none';
    }
  }

  try{
    document.body.setAttribute(
      'data-exos-explorer-visible',
      '0'
    );
  }catch(ignoreExplorerCloseAttr){}

  jplopsoft_taskbarRemoveApp('explorer');
  return true;
}

function jplopsoft_wmOpenCmd(){
  return jplopsoft_cmdCreateInstance(undefined,null);
}

function jplopsoft_wmMinimizeCmd(){
  var c=jplopsoft_cmdUiContext();
  if(!c||!c.hwnd)return;
  jplopsoft_ShowWindow(c.hwnd,jplopsoft_SW_MINIMIZE);
}

function jplopsoft_wmCloseCmd(){
  var c=jplopsoft_cmdUiContext();
  if(c)jplopsoft_cmdCloseInstance(c.instanceId,false);
}

function jplopsoft_wmShowDesktop(){
  var doc=jplopsoft_taskbarDocumentButton();
  jplopsoft_closeStartMenu();
  jplopsoft_calendarHide();

  if(jplopsoft_el(jplopsoft_taskbarAppId('explorer')))jplopsoft_wmMinimize('jplopsoft_explorerWindow','explorer',true);
  jplopsoft_cmdMinimizeAll();
  if(doc)jplopsoft_taskbarMinimizeDocument();
  if(jplopsoft_el(jplopsoft_taskbarAppId('control')))jplopsoft_wmOverlayMinimize('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');
  if(jplopsoft_el(jplopsoft_taskbarAppId('security')))jplopsoft_wmOverlayMinimize('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');
  if(jplopsoft_el(jplopsoft_taskbarAppId('trash')))jplopsoft_wmOverlayMinimize('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');
  if(jplopsoft_CALC.hwnd&&jplopsoft_user32GetRecord(jplopsoft_CALC.hwnd))jplopsoft_ShowWindow(jplopsoft_CALC.hwnd,jplopsoft_SW_MINIMIZE);
  (function(){var k,r;for(k in jplopsoft_MULTI_EDITORS)if(jplopsoft_MULTI_EDITORS.hasOwnProperty(k)){r=jplopsoft_MULTI_EDITORS[k];jplopsoft_multiEditorMinimize(r);}})();
  jplopsoft_WM.active='desktop';
}

function jplopsoft_wmAfterUnlock(){
  var explorer=jplopsoft_el('jplopsoft_explorerWindow');

  jplopsoft_setBodyClassToken(
    'jplopsoft_exfs-desktop-ready',
    true
  );

  jplopsoft_dwmNormalizeRootStacking();

  if(explorer){
    jplopsoft_explorerPortalToRoot(explorer);
  }

  jplopsoft_applyDesktopWallpaper();
  jplopsoft_calendarHide();

  if(typeof jplopsoft_ntEnsureExplorerProcess==='function'){
    jplopsoft_ntEnsureExplorerProcess();
  }

  jplopsoft_cmdCloseAll();

  jplopsoft_taskbarRemoveApp('control');
  jplopsoft_taskbarRemoveApp('security');
  jplopsoft_taskbarRemoveApp('trash');
  jplopsoft_taskbarRemoveDocumentApp();

  if(
    jplopsoft_EXPLORER_LIFECYCLE&&
    jplopsoft_EXPLORER_LIFECYCLE.desiredVisible
  ){
    jplopsoft_wmRestoreExplorerStable();
  }else{
    jplopsoft_explorerStopWatchdog();

    if(explorer){
      try{
        explorer.style.setProperty(
          'display',
          'none',
          'important'
        );
      }catch(ignoreAfterUnlockExplorer){
        explorer.style.display='none';
      }
    }

    try{
      document.body.setAttribute(
        'data-exos-explorer-visible',
        '0'
      );
    }catch(ignoreExplorerHiddenAttr){}

    jplopsoft_taskbarRemoveApp('explorer');
  }

  jplopsoft_cmdRefreshGlobalMode();

  jplopsoft_WM.active=
    jplopsoft_EXPLORER_LIFECYCLE.desiredVisible
      ?'explorer'
      :'desktop';
}

function jplopsoft_wmPrepareLock(){
  var explorer=jplopsoft_el('jplopsoft_explorerWindow');
  jplopsoft_explorerSetDesiredVisible(false);
  jplopsoft_explorerCancelPendingRestore();
  jplopsoft_explorerStopWatchdog();
  jplopsoft_multiEditorCloseAll(true);
  if(jplopsoft_TASKMGR.hwnd)jplopsoft_closeTaskManager();
  if(jplopsoft_REGEDIT.hwnd)jplopsoft_closeRegedit();
  if(jplopsoft_DISKMGMT.hwnd)jplopsoft_closeDiskManager();
  if(jplopsoft_CALC.hwnd)jplopsoft_closeCalculator();
  jplopsoft_calendarHide();
  jplopsoft_setBodyClassToken('jplopsoft_exfs-desktop-ready',false);
  if(explorer){
    jplopsoft_wmClassRemove(explorer,'jplopsoft_hidden');
    explorer.style.display='flex';
  }
  jplopsoft_cmdCloseAll();
  if(jplopsoft_el('jplopsoft_trashBackdrop'))jplopsoft_el('jplopsoft_trashBackdrop').style.display='none';
  state.trashItems=[];
  jplopsoft_taskbarRemoveApp('explorer');
  jplopsoft_taskbarRemoveApp('control');
  jplopsoft_taskbarRemoveApp('security');
  jplopsoft_taskbarRemoveApp('trash');
  jplopsoft_taskbarRemoveDocumentApp();
}

function jplopsoft_taskbarOpenControlApp(){
  jplopsoft_taskbarEnsureApp('control','control','控制台');
  jplopsoft_wmActivateOverlay('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');
}

function jplopsoft_taskbarCloseControlApp(){
  jplopsoft_taskbarRemoveApp('control');
}

function jplopsoft_taskbarOpenSecurityApp(){
  jplopsoft_taskbarEnsureApp('security','security','ExOS 安全性');
  jplopsoft_wmActivateOverlay('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');
}

function jplopsoft_taskbarCloseSecurityApp(){
  jplopsoft_taskbarRemoveApp('security');
}

function jplopsoft_taskbarAppClick(appId){
  var btn=jplopsoft_el(jplopsoft_taskbarAppId(appId)),
      active=btn&&jplopsoft_wmClassHas(btn,'jplopsoft_active');

  if(String(appId||'').indexOf('editor_')===0&&jplopsoft_multiEditorTaskbarClick(appId))return;
  if(appId==='explorer'){
    if(
      active&&
      jplopsoft_wmIsDisplayed('jplopsoft_explorerWindow')&&
      jplopsoft_explorerFrontmost(jplopsoft_el('jplopsoft_explorerWindow'))
    ){
      jplopsoft_wmMinimize(
        'jplopsoft_explorerWindow',
        'explorer',
        true
      );
    }else{
      jplopsoft_wmOpenExplorer(state.currentFolder);
    }
    return;
  }
  if(appId==='cmd'){
    if(active&&jplopsoft_wmIsDisplayed('jplopsoft_cmdWindow'))jplopsoft_wmMinimizeCmd();
    else jplopsoft_wmRestore('jplopsoft_cmdWindow','cmd');
    return;
  }
  if(String(appId||'').indexOf('cmd_')===0){
    (function(){
      var k,c;
      for(k in jplopsoft_CMD_INSTANCES){
        if(!jplopsoft_CMD_INSTANCES.hasOwnProperty(k))continue;
        c=jplopsoft_CMD_INSTANCES[k];
        if(!c||c.appId!==appId)continue;
        jplopsoft_cmdMarkActive(c.instanceId);
        if(active&&c.hwnd&&jplopsoft_user32DisplayIsVisible(jplopsoft_user32GetRecord(c.hwnd))){
          jplopsoft_ShowWindow(c.hwnd,jplopsoft_SW_MINIMIZE);
        }else if(c.hwnd){
          jplopsoft_ShowWindow(c.hwnd,jplopsoft_SW_RESTORE);
          jplopsoft_cmdActivateInstance(c.instanceId,false);
          window.setTimeout(function(){
            var cc=jplopsoft_cmdInstance(c.instanceId);
            if(cc&&cc.dom&&cc.dom.input){
              try{cc.dom.input.focus();}catch(ignoreCmdTaskbarFocus){}
            }
          },0);
        }
        return;
      }
    })();
    return;
  }
  if(appId==='control'){
    if(active&&jplopsoft_wmIsDisplayed('jplopsoft_exconfigBackdrop'))jplopsoft_wmOverlayMinimize('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');
    else jplopsoft_wmOverlayRestore('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');
    return;
  }
  if(appId==='security'){
    if(active&&jplopsoft_wmIsDisplayed('jplopsoft_securityBackdrop'))jplopsoft_wmOverlayMinimize('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');
    else jplopsoft_wmOverlayRestore('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');
    return;
  }
  if(appId==='trash'){
    if(active&&jplopsoft_wmIsDisplayed('jplopsoft_trashBackdrop'))jplopsoft_wmOverlayMinimize('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');
    else jplopsoft_wmOverlayRestore('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');
    return;
  }

  /* Fallback for future applications created only through CreateWindowEx. */
  (function(){
    var k,r;
    for(k in jplopsoft_USER32.windows){
      if(jplopsoft_USER32.windows.hasOwnProperty(k)){
        r=jplopsoft_USER32.windows[k];
        if(r.appId===appId&&r.taskbar!==false){
          if(active&&jplopsoft_user32DisplayIsVisible(r))jplopsoft_ShowWindow(r.hwnd,jplopsoft_SW_MINIMIZE);
          else jplopsoft_ShowWindow(r.hwnd,jplopsoft_SW_RESTORE);
          return;
        }
      }
    }
  })();
}




/* =========================================================================
 * ExFS NT Kernel / Native Process Model
 *
 * This is the ExOS operating-system model exposed to taskmgr.exe.  It mirrors
 * NT concepts (PID, process object, token, Native API, protected/critical
 * process checks) but it does NOT expose or control the browser host OS.
 * ========================================================================= */

var jplopsoft_STATUS_SUCCESS=0x00000000;
var jplopsoft_STATUS_ACCESS_DENIED=0xC0000022;
var jplopsoft_STATUS_INVALID_CID=0xC000000B;
var jplopsoft_STATUS_INVALID_HANDLE=0xC0000008;
var jplopsoft_STATUS_PROCESS_IS_TERMINATING=0xC000010A;

var jplopsoft_PROCESS_TERMINATE=0x0001;
var jplopsoft_PROCESS_QUERY_INFORMATION=0x0400;
var jplopsoft_PROCESS_QUERY_LIMITED_INFORMATION=0x1000;

var jplopsoft_NT_KERNEL={
  bootTime:(new Date()).getTime(),
  nextPid:2000,
  nextHandle:0x400,
  processByKey:{},
  processByPid:{},
  processHandles:{},
  generation:1
};

function jplopsoft_ntCloneEnvironment(src){
  var out={},k;
  if(!src||typeof src!=='object')return out;
  for(k in src)if(src.hasOwnProperty(k))out[String(k)]=String(src[k]);
  return out;
}

function jplopsoft_ntInitialUserEnvironment(){
  var source=jplopsoft_cmdStateBacking?jplopsoft_cmdStateBacking('cmdEnv'):state.cmdEnv,
      out=jplopsoft_ntCloneEnvironment(source||{});

  if(typeof out.USERNAME==='undefined')out.USERNAME=String(state.samUsername||'administrator');
  if(typeof out.USERPROFILE==='undefined')out.USERPROFILE='C:\\Users\\'+String(state.samUsername||'administrator');
  if(typeof out.HOMEDRIVE==='undefined')out.HOMEDRIVE='C:';
  if(typeof out.HOMEPATH==='undefined')out.HOMEPATH='\\Users\\'+String(state.samUsername||'administrator');

  return out;
}

function jplopsoft_ntEnvironmentCount(env){
  var k,n=0;
  if(!env||typeof env!=='object')return 0;
  for(k in env)if(env.hasOwnProperty(k))n++;
  return n;
}

function jplopsoft_ntCreatePeb(pid,spec,parent){
  var p=spec||{},env,currentNode=parseInt(p.currentDirectoryNodeId,10)||0,
      currentDir=String(p.currentDirectory||''),parentEnv=null;

  if(p.environment&&typeof p.environment==='object'){
    env=jplopsoft_ntCloneEnvironment(p.environment);
  }else if(parent&&parent.peb&&parent.peb.processParameters){
    parentEnv=parent.peb.processParameters.environment;
    env=jplopsoft_ntCloneEnvironment(parentEnv);
  }else{
    env=jplopsoft_ntInitialUserEnvironment();
  }

  if(!currentDir){
    try{currentDir=jplopsoft_cmdPathText(currentNode);}catch(ignoreCwd){currentDir='C:\\';}
  }

  return{
    id:'PEB-'+String(pid)+'-'+String(jplopsoft_NT_KERNEL.generation),
    processId:pid,
    inheritedFromPid:parent?parent.pid:0,
    processParameters:{
      imagePathName:String(p.imagePathName||p.imageName||''),
      commandLine:String(p.commandLine||p.imageName||''),
      currentDirectoryNodeId:currentNode,
      currentDirectory:currentDir,
      environment:env,
      environmentCount:jplopsoft_ntEnvironmentCount(env)
    }
  };
}

function jplopsoft_NtCreateUserProcess(spec){
  var p=spec||{},parent=p.parentProcess||null;

  if(!parent&&parseInt(p.ppid,10)>0){
    parent=jplopsoft_ntKernelProcessByPid(parseInt(p.ppid,10));
  }

  if(!p.key){
    p.key='proc:'+String(p.imageName||'process')+':'+String(jplopsoft_NT_KERNEL.generation);
  }

  if(!p.ppid&&parent)p.ppid=parent.pid;
  return jplopsoft_ntKernelRegisterProcess(p);
}

function jplopsoft_CreateProcess(imageName,commandLine,parentPid,options){
  var o=options||{};
  o.imageName=String(imageName||o.imageName||'unknown.exe');
  o.commandLine=String(commandLine||o.commandLine||o.imageName);
  o.ppid=parseInt(parentPid,10)||parseInt(o.ppid,10)||0;
  return jplopsoft_NtCreateUserProcess(o);
}

function jplopsoft_SetEnvironmentVariable(process,name,value){
  var env,pp;
  if(!process||!process.peb||!process.peb.processParameters)return false;
  name=String(name||'').toUpperCase();
  if(!/^[A-Z_][A-Z0-9_]{0,63}$/.test(name))return false;

  pp=process.peb.processParameters;
  env=pp.environment||{};
  if(value===null||typeof value==='undefined'||String(value)==='')delete env[name];
  else env[name]=String(value);
  pp.environment=env;
  pp.environmentCount=jplopsoft_ntEnvironmentCount(env);
  return true;
}

function jplopsoft_ntEnsureExplorerProcess(){
  var p=jplopsoft_ntKernelAliveByKey('proc:explorer'),
      winlogon;

  if(p)return p;

  jplopsoft_ntKernelEnsureCore();
  winlogon=jplopsoft_ntKernelAliveByKey('core:winlogon');

  p=jplopsoft_NtCreateUserProcess({
    key:'proc:explorer',
    imageName:'explorer.exe',
    description:'ExOS Explorer / ExFS Shell',
    ppid:winlogon?winlogon.pid:220,
    parentProcess:winlogon||null,
    sessionId:1,
    username:String(state.samUsername||'administrator'),
    sid:String(state.samSid||''),
    integrity:'MEDIUM',
    commandLine:'explorer.exe',
    currentDirectoryNodeId:parseInt(jplopsoft_cmdStateBacking('currentFolder'),10)||0,
    environment:jplopsoft_ntInitialUserEnvironment(),
    logicalThreads:3
  });

  return p;
}


function jplopsoft_ntKernelNow(){
  return (new Date()).getTime();
}

function jplopsoft_ntStatusHex(status){
  var n=(Number(status)>>>0).toString(16).toUpperCase();
  while(n.length<8)n='0'+n;
  return'0x'+n;
}

function jplopsoft_ntStatusName(status){
  status=Number(status)>>>0;
  if(status===(jplopsoft_STATUS_SUCCESS>>>0))return'STATUS_SUCCESS';
  if(status===(jplopsoft_STATUS_ACCESS_DENIED>>>0))return'STATUS_ACCESS_DENIED';
  if(status===(jplopsoft_STATUS_INVALID_CID>>>0))return'STATUS_INVALID_CID';
  if(status===(jplopsoft_STATUS_INVALID_HANDLE>>>0))return'STATUS_INVALID_HANDLE';
  if(status===(jplopsoft_STATUS_PROCESS_IS_TERMINATING>>>0))return'STATUS_PROCESS_IS_TERMINATING';
  return'NTSTATUS';
}

function jplopsoft_ntKernelAllocatePid(){
  jplopsoft_NT_KERNEL.nextPid++;
  if(jplopsoft_NT_KERNEL.nextPid>60000)jplopsoft_NT_KERNEL.nextPid=2001;
  while(jplopsoft_NT_KERNEL.processByPid[String(jplopsoft_NT_KERNEL.nextPid)]){
    jplopsoft_NT_KERNEL.nextPid++;
  }
  return jplopsoft_NT_KERNEL.nextPid;
}

function jplopsoft_ntKernelRegisterProcess(spec){
  var p=spec||{},pid=parseInt(p.pid,10)||0,key=String(p.key||''),rec,parent=null,peb;

  if(!key)return null;
  if(pid<=0)pid=jplopsoft_ntKernelAllocatePid();

  if(p.parentProcess)parent=p.parentProcess;
  else if(parseInt(p.ppid,10)>0)parent=jplopsoft_NT_KERNEL.processByPid[String(parseInt(p.ppid,10)||0)]||null;

  peb=jplopsoft_ntCreatePeb(pid,p,parent);

  rec={
    key:key,
    pid:pid,
    ppid:parseInt(p.ppid,10)||0,
    imageName:String(p.imageName||'unknown.exe'),
    description:String(p.description||p.imageName||''),
    sessionId:typeof p.sessionId==='number'?p.sessionId:1,
    username:String(p.username||''),
    sid:String(p.sid||''),
    integrity:String(p.integrity||'MEDIUM'),
    protection:String(p.protection||'None'),
    critical:!!p.critical,
    kernel:!!p.kernel,
    autoRestart:!!p.autoRestart,
    systemProcess:!!p.systemProcess,
    logicalThreads:Math.max(1,parseInt(p.logicalThreads,10)||1),
    startTime:typeof p.startTime==='number'?p.startTime:jplopsoft_ntKernelNow(),
    exitTime:0,
    exitStatus:0,
    alive:true,
    restartAfter:0,
    hwnds:[],
    appIds:[],
    virtualAddressSpaceId:'VAS-'+String(pid)+'-'+String(jplopsoft_NT_KERNEL.generation),
    addressSpaceIsolation:'PRIVATE',
    peb:peb,
    generation:jplopsoft_NT_KERNEL.generation++
  };

  jplopsoft_NT_KERNEL.processByKey[key]=rec;
  jplopsoft_NT_KERNEL.processByPid[String(pid)]=rec;
  return rec;
}

function jplopsoft_ntKernelEnsureFixed(spec){
  var key=String(spec.key||''),old=jplopsoft_NT_KERNEL.processByKey[key],now=jplopsoft_ntKernelNow();

  if(old&&old.alive)return old;

  if(old&&!old.alive&&old.autoRestart&&old.restartAfter>now){
    return null;
  }

  if(old&&old.pid){
    delete jplopsoft_NT_KERNEL.processByPid[String(old.pid)];
  }

  if(old&&old.autoRestart)spec.pid=0;
  return jplopsoft_ntKernelRegisterProcess(spec);
}

function jplopsoft_ntKernelEnsureCore(){
  var systemUser='NT AUTHORITY\\SYSTEM';

  jplopsoft_ntKernelEnsureFixed({
    key:'core:System',pid:4,imageName:'System',description:'NT Kernel & System',
    ppid:0,sessionId:0,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Kernel',critical:true,kernel:true,
    systemProcess:true,logicalThreads:8
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:smss',pid:100,imageName:'smss.exe',description:'Session Manager Subsystem',
    ppid:4,sessionId:0,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Critical',critical:true,systemProcess:true,
    logicalThreads:2
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:csrss',pid:160,imageName:'csrss.exe',description:'Client Server Runtime Process',
    ppid:100,sessionId:1,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Critical',critical:true,systemProcess:true,
    logicalThreads:4
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:winlogon',pid:220,imageName:'winlogon.exe',description:'ExOS Logon Application',
    ppid:100,sessionId:1,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'Critical',critical:true,systemProcess:true,
    logicalThreads:3
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:lsass',pid:280,imageName:'lsass.exe',description:'Local Security Authority Process',
    ppid:4,sessionId:0,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'PPL',critical:true,systemProcess:true,
    logicalThreads:4
  });

  jplopsoft_ntKernelEnsureFixed({
    key:'core:dwm',pid:340,imageName:'dwm.exe',description:'Desktop Window Manager',
    ppid:220,sessionId:1,username:systemUser,sid:'S-1-5-18',
    integrity:'SYSTEM',protection:'None',critical:false,systemProcess:true,
    autoRestart:true,logicalThreads:4
  });
}

function jplopsoft_ntKernelProcessKeyForWindow(rec){
  var app=String(rec&&rec.appId||'');

  if(rec&&rec.param&&rec.param.ntProcessKey)return String(rec.param.ntProcessKey);

  if(app==='explorer'||app==='trash'||app==='properties'||app==='document'){
    return'proc:explorer';
  }

  return'proc:'+app;
}

function jplopsoft_ntKernelImageForWindow(rec){
  var app=String(rec&&rec.appId||'');

  if(rec&&rec.param&&rec.param.ntImageName)return String(rec.param.ntImageName);

  if(app==='explorer'||app==='trash'||app==='properties'||app==='document')return'explorer.exe';
  if(app==='cmd'||app.indexOf('cmd_')===0)return'cmd.exe';
  if(app==='control')return'control.exe';
  if(app==='security')return'security.exe';
  if(app==='volume3d')return'volume3d.exe';
  if(app==='regedit')return'regedit.exe';
  if(app==='diskmgmt')return'mmc.exe';
  if(app==='taskmgr')return'taskmgr.exe';
  if(app.indexOf('editor_txt_')===0)return'notepad.exe';
  if(app.indexOf('editor_csv_')===0)return'csvedit.exe';
  return'exfsapp.exe';
}

function jplopsoft_ntKernelDescriptionForWindow(rec){
  var app=String(rec&&rec.appId||'');
  if(rec&&rec.param&&rec.param.ntDescription)return String(rec.param.ntDescription);
  if(app==='explorer'||app==='trash'||app==='properties'||app==='document')return'ExOS Explorer / ExFS Shell';
  if(app==='cmd'||app.indexOf('cmd_')===0)return'Command Prompt';
  if(app==='control')return'Control Panel';
  if(app==='security')return'ExOS Security';
  if(app==='volume3d')return'ExFS 3D Volume';
  if(app==='regedit')return'Registry Editor';
  if(app==='diskmgmt')return'Disk Management Console';
  if(app==='taskmgr')return'Task Manager';
  if(app.indexOf('editor_txt_')===0)return'Text Editor';
  if(app.indexOf('editor_csv_')===0)return'CSV Editor';
  return jplopsoft_taskmgrWindowTitle(rec);
}

function jplopsoft_ntKernelAliveByKey(key){
  var p=jplopsoft_NT_KERNEL.processByKey[String(key||'')];
  return p&&p.alive?p:null;
}

function jplopsoft_ntKernelParentPidForWindow(rec){
  var parentKey,p;

  if(rec&&rec.param&&rec.param.ntParentKey){
    parentKey=String(rec.param.ntParentKey);
    p=jplopsoft_ntKernelAliveByKey(parentKey);
    if(p)return p.pid;
  }

  if(jplopsoft_ntKernelProcessKeyForWindow(rec)==='proc:explorer'){
    p=jplopsoft_ntKernelAliveByKey('core:winlogon');
    return p?p.pid:220;
  }

  p=jplopsoft_ntKernelAliveByKey('proc:explorer');
  if(p)return p.pid;

  p=jplopsoft_ntKernelAliveByKey('core:winlogon');
  return p?p.pid:220;
}

function jplopsoft_ntKernelOnWindowActivated(rec){
  var key,p;

  if(!rec||rec.destroying)return null;

  jplopsoft_ntKernelEnsureCore();
  key=jplopsoft_ntKernelProcessKeyForWindow(rec);
  p=jplopsoft_ntKernelAliveByKey(key);

  if(!p&&key==='proc:explorer'){
    p=jplopsoft_ntEnsureExplorerProcess();
  }

  if(!p){
    p=jplopsoft_ntKernelRegisterProcess({
      key:key,
      imageName:jplopsoft_ntKernelImageForWindow(rec),
      description:jplopsoft_ntKernelDescriptionForWindow(rec),
      ppid:jplopsoft_ntKernelParentPidForWindow(rec),
      sessionId:1,
      username:String(state.samUsername||'administrator'),
      sid:String(state.samSid||''),
      integrity:rec.appId==='taskmgr'&&jplopsoft_taskmgrHasSeDebugPrivilege()?'HIGH':'MEDIUM',
      protection:'None',
      critical:false,
      systemProcess:false,
      logicalThreads:Math.max(1,rec.dynamic?2:1)
    });
  }

  rec.ntPid=p.pid;
  rec.ntTerminated=false;
  return p;
}

function jplopsoft_ntKernelOnWindowDestroyed(rec){
  var p,key;
  if(!rec)return;
  key=jplopsoft_ntKernelProcessKeyForWindow(rec);
  p=jplopsoft_ntKernelAliveByKey(key);
  if(!p)return;

  /*
   * Final liveness is resolved by NtQuerySystemInformation because one process
   * may own several HWNDs (for example explorer.exe owns Explorer, Recycle Bin,
   * Properties and document preview).
   */
  rec.ntPid=0;
}

function jplopsoft_ntKernelWindowIsProcessAlive(rec){
  if(!rec||rec.destroying||rec.ntTerminated)return false;
  return jplopsoft_taskmgrRecordRunning(rec);
}

function jplopsoft_ntKernelSynchronizeWindows(){
  var k,rec,p,key,seen={},pidKey;

  jplopsoft_ntKernelEnsureCore();

  for(k in jplopsoft_USER32.windows){
    if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
    rec=jplopsoft_USER32.windows[k];

    if(!jplopsoft_ntKernelWindowIsProcessAlive(rec))continue;

    p=jplopsoft_ntKernelOnWindowActivated(rec);
    if(!p)continue;

    pidKey=String(p.pid);
    if(!seen[pidKey])seen[pidKey]={hwnds:[],appIds:[]};

    seen[pidKey].hwnds.push(parseInt(rec.hwnd,10)||0);
    if(seen[pidKey].appIds.indexOf(String(rec.appId||''))<0){
      seen[pidKey].appIds.push(String(rec.appId||''));
    }
  }

  for(key in jplopsoft_NT_KERNEL.processByKey){
    if(!jplopsoft_NT_KERNEL.processByKey.hasOwnProperty(key))continue;
    p=jplopsoft_NT_KERNEL.processByKey[key];
    if(!p||!p.alive||p.systemProcess)continue;

    pidKey=String(p.pid);
    if(seen[pidKey]){
      p.hwnds=seen[pidKey].hwnds;
      p.appIds=seen[pidKey].appIds;
      p.logicalThreads=Math.max(1,p.hwnds.length+1);
    }else if(
      p.key==='proc:explorer'&&
      document.body&&
      !jplopsoft_wmClassHas(document.body,'jplopsoft_explorer-process-stopped')
    ){
      p.hwnds=[];
      p.appIds=['explorer'];
      p.logicalThreads=Math.max(2,p.logicalThreads||2);
    }else if(jplopsoft_ntKernelNow()-p.startTime>1000){
      p.alive=false;
      p.exitTime=jplopsoft_ntKernelNow();
      p.exitStatus=0;
      p.hwnds=[];
      p.appIds=[];
      delete jplopsoft_NT_KERNEL.processByPid[pidKey];
    }
  }
}

function jplopsoft_NtQuerySystemInformation(infoClass){
  var rows=[],k,p,now=jplopsoft_ntKernelNow();

  if(String(infoClass||'')!=='SystemProcessInformation'){
    return{status:jplopsoft_STATUS_INVALID_CID,information:[]};
  }

  jplopsoft_ntKernelSynchronizeWindows();

  for(k in jplopsoft_NT_KERNEL.processByKey){
    if(!jplopsoft_NT_KERNEL.processByKey.hasOwnProperty(k))continue;
    p=jplopsoft_NT_KERNEL.processByKey[k];
    if(!p||!p.alive)continue;

    rows.push({
      pid:p.pid,
      ppid:p.ppid,
      imageName:p.imageName,
      description:p.description,
      sessionId:p.sessionId,
      username:p.username,
      sid:p.sid,
      integrity:p.integrity,
      protection:p.protection,
      critical:p.critical?1:0,
      kernel:p.kernel?1:0,
      systemProcess:p.systemProcess?1:0,
      threadCount:p.logicalThreads,
      handleCount:(p.hwnds?p.hwnds.length:0),
      hwnds:p.hwnds?p.hwnds.slice(0):[],
      appIds:p.appIds?p.appIds.slice(0):[],
      uptimeMs:Math.max(0,now-p.startTime),
      virtualAddressSpaceId:String(p.virtualAddressSpaceId||''),
      addressSpaceIsolation:String(p.addressSpaceIsolation||''),
      pebId:p.peb?String(p.peb.id||''):'',
      environmentCount:p.peb&&p.peb.processParameters
        ?jplopsoft_ntEnvironmentCount(p.peb.processParameters.environment)
        :0,
      currentDirectory:p.peb&&p.peb.processParameters
        ?String(p.peb.processParameters.currentDirectory||'')
        :'',
      commandLine:p.peb&&p.peb.processParameters
        ?String(p.peb.processParameters.commandLine||'')
        :'',
      generation:p.generation
    });
  }

  rows.sort(function(a,b){return a.pid-b.pid;});
  return{status:jplopsoft_STATUS_SUCCESS,information:rows};
}

function jplopsoft_ntKernelProcessByPid(pid){
  return jplopsoft_NT_KERNEL.processByPid[String(parseInt(pid,10)||0)]||null;
}

function jplopsoft_taskmgrHasSeDebugPrivilege(){
  var token=jplopsoft_TASKMGR&&jplopsoft_TASKMGR.token?jplopsoft_TASKMGR.token:null;
  return !!(token&&token.privileges&&parseInt(token.privileges.SeDebugPrivilege,10)===1);
}

function jplopsoft_ntCanTerminateProcess(p){
  var currentUser=String(state.samUsername||'').toLowerCase();

  if(!p||!p.alive)return{ok:false,status:jplopsoft_STATUS_INVALID_CID,reason:'處理程序不存在。'};
  if(p.kernel)return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Kernel process 不能由使用者模式終止。'};
  if(p.protection==='PPL')return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Protected Process Light 拒絕終止要求。'};
  if(p.critical)return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'Critical process 受到 NT 系統完整性保護。'};

  if(String(p.username||'').toLowerCase()!==currentUser&&!jplopsoft_taskmgrHasSeDebugPrivilege()){
    return{ok:false,status:jplopsoft_STATUS_ACCESS_DENIED,reason:'需要 SeDebugPrivilege。'};
  }

  return{ok:true,status:jplopsoft_STATUS_SUCCESS,reason:''};
}

function jplopsoft_OpenProcess(desiredAccess,inheritHandle,pid){
  var p=jplopsoft_ntKernelProcessByPid(pid),rights=jplopsoft_ntCanTerminateProcess(p),h;

  if(!p||!p.alive){
    return{status:jplopsoft_STATUS_INVALID_CID,handle:0};
  }

  if((desiredAccess&jplopsoft_PROCESS_TERMINATE)!==0&&!rights.ok){
    return{status:rights.status,handle:0,reason:rights.reason};
  }

  h=jplopsoft_NT_KERNEL.nextHandle++;
  jplopsoft_NT_KERNEL.processHandles[String(h)]={
    handle:h,
    pid:p.pid,
    desiredAccess:desiredAccess,
    openedAt:jplopsoft_ntKernelNow()
  };

  return{status:jplopsoft_STATUS_SUCCESS,handle:h};
}

function jplopsoft_NtClose(handle){
  handle=parseInt(handle,10)||0;
  if(!jplopsoft_NT_KERNEL.processHandles[String(handle)])return jplopsoft_STATUS_INVALID_HANDLE;
  delete jplopsoft_NT_KERNEL.processHandles[String(handle)];
  return jplopsoft_STATUS_SUCCESS;
}

function jplopsoft_ntForceHideWindow(rec){
  var w,b;

  if(!rec)return;

  rec.ntTerminated=true;
  rec.ntPid=0;

  w=jplopsoft_el(rec.windowId);
  b=rec.backdropId?jplopsoft_el(rec.backdropId):null;

  if(rec.dynamic){
    jplopsoft_DestroyWindow(rec.hwnd);
    return;
  }

  if(b)b.style.display='none';
  if(w)w.style.display='none';

  if(rec.appId)jplopsoft_taskbarRemoveApp(rec.appId);

  if(rec.appId==='cmd')state.cmdMode=false;
  if(rec.appId==='security')state.securityScreenOpen=false;
}

function jplopsoft_ntForceTerminateProcessObject(p,exitStatus){
  var i,hwnds,rec,key;

  if(!p||!p.alive)return jplopsoft_STATUS_INVALID_CID;

  hwnds=p.hwnds?p.hwnds.slice(0):[];

  /*
   * No WM_CLOSE is sent here.  The process object is torn down directly,
   * matching the semantic difference between closing a window and
   * NtTerminateProcess.
   */
  for(i=0;i<hwnds.length;i++){
    rec=jplopsoft_user32GetRecord(hwnds[i]);
    if(rec)jplopsoft_ntForceHideWindow(rec);
  }

  p.alive=false;
  p.exitTime=jplopsoft_ntKernelNow();
  p.exitStatus=Number(exitStatus)||0;
  delete jplopsoft_NT_KERNEL.processByPid[String(p.pid)];

  if(p.key==='proc:explorer'){
    jplopsoft_setBodyClassToken('jplopsoft_explorer-process-stopped',true);
  }

  if(p.key==='core:dwm'){
    p.restartAfter=jplopsoft_ntKernelNow()+800;
  }

  return jplopsoft_STATUS_SUCCESS;
}

function jplopsoft_NtTerminateProcess(handle,exitStatus){
  var h=jplopsoft_NT_KERNEL.processHandles[String(parseInt(handle,10)||0)],
      p,rights,status;

  if(!h)return jplopsoft_STATUS_INVALID_HANDLE;
  if((h.desiredAccess&jplopsoft_PROCESS_TERMINATE)===0)return jplopsoft_STATUS_ACCESS_DENIED;

  p=jplopsoft_ntKernelProcessByPid(h.pid);
  if(!p||!p.alive)return jplopsoft_STATUS_PROCESS_IS_TERMINATING;

  rights=jplopsoft_ntCanTerminateProcess(p);
  if(!rights.ok)return rights.status;

  status=jplopsoft_ntForceTerminateProcessObject(p,exitStatus);

  if(status===jplopsoft_STATUS_SUCCESS&&p.key==='core:dwm'){
    window.setTimeout(function(){
      jplopsoft_ntKernelEnsureCore();
      if(jplopsoft_TASKMGR&&jplopsoft_TASKMGR.hwnd)jplopsoft_taskmgrRender();
    },850);
  }

  return status;
}

function jplopsoft_ntProcessWindowRecords(p){
  var out=[],i,rec;
  if(!p||!p.hwnds)return out;
  for(i=0;i<p.hwnds.length;i++){
    rec=jplopsoft_user32GetRecord(p.hwnds[i]);
    if(rec&&!rec.ntTerminated)out.push(rec);
  }
  return out;
}


/* =========================================================================
 * calc.exe - ExOS Calculator
 * ========================================================================= */
var jplopsoft_CALC={hwnd:0,displayId:'jplopsoft_calcDisplay',expressionId:'jplopsoft_calcExpression',clientId:'jplopsoft_calcClient',accumulator:null,pendingOp:'',lastOp:'',lastOperand:null,input:'0',waiting:false,memory:0,error:false,expression:''};
function jplopsoft_calcNormalizeZero(v){return Math.abs(v)<1e-15?0:v;}
function jplopsoft_calcFormatNumber(v){var n=Number(v),s;if(!isFinite(n))return'Error';n=jplopsoft_calcNormalizeZero(n);if(n===0)return'0';if(Math.abs(n)>=1e15||Math.abs(n)<1e-10){s=n.toExponential(10);s=s.replace(/(\.\d*?[1-9])0+e/,'$1e').replace(/\.0+e/,'e');return s;}return String(parseFloat(n.toPrecision(15)));}
function jplopsoft_calcCurrentValue(){var n=parseFloat(String(jplopsoft_CALC.input||'0'));return isNaN(n)?0:n;}
function jplopsoft_calcSetInput(v){var s=jplopsoft_calcFormatNumber(v);if(s==='Error'){jplopsoft_calcSetError('Error');return false;}jplopsoft_CALC.input=s;jplopsoft_CALC.error=false;return true;}
function jplopsoft_calcOperatorSymbol(op){if(op==='/')return'÷';if(op==='*')return'×';if(op==='-')return'−';if(op==='+')return'+';return'';}
function jplopsoft_calcApplyBinaryValues(a,b,op){a=Number(a);b=Number(b);if(op==='+')return a+b;if(op==='-')return a-b;if(op==='*')return a*b;if(op==='/'){if(b===0)return null;return a/b;}return b;}
function jplopsoft_calcUpdateDisplay(){var d=jplopsoft_el(jplopsoft_CALC.displayId),e=jplopsoft_el(jplopsoft_CALC.expressionId);if(d){d.className='jplopsoft_calc-display'+(jplopsoft_CALC.error?' jplopsoft_calc-error':'');d.textContent=String(jplopsoft_CALC.input||'0');}if(e)e.textContent=String(jplopsoft_CALC.expression||'');}
function jplopsoft_calcSetError(msg){jplopsoft_CALC.input=String(msg||'Error');jplopsoft_CALC.error=true;jplopsoft_CALC.accumulator=null;jplopsoft_CALC.pendingOp='';jplopsoft_CALC.lastOp='';jplopsoft_CALC.lastOperand=null;jplopsoft_CALC.waiting=true;jplopsoft_CALC.expression='';jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcReset(all){jplopsoft_CALC.input='0';jplopsoft_CALC.accumulator=null;jplopsoft_CALC.pendingOp='';jplopsoft_CALC.lastOp='';jplopsoft_CALC.lastOperand=null;jplopsoft_CALC.waiting=false;jplopsoft_CALC.error=false;jplopsoft_CALC.expression='';if(all)jplopsoft_CALC.memory=0;jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcDigit(ch){var s;if(jplopsoft_CALC.error)jplopsoft_calcReset(false);ch=String(ch||'');if(!/^\d$/.test(ch))return;if(jplopsoft_CALC.waiting){jplopsoft_CALC.input=ch;jplopsoft_CALC.waiting=false;}else{s=String(jplopsoft_CALC.input||'0');if(s==='0')s=ch;else if(s==='-0')s='-'+ch;else if(s.replace('-','').length<16)s+=ch;jplopsoft_CALC.input=s;}jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcDecimal(){var s;if(jplopsoft_CALC.error)jplopsoft_calcReset(false);if(jplopsoft_CALC.waiting){jplopsoft_CALC.input='0.';jplopsoft_CALC.waiting=false;}else{s=String(jplopsoft_CALC.input||'0');if(s.indexOf('.')<0&&s.toLowerCase().indexOf('e')<0)jplopsoft_CALC.input=s+'.';}jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcToggleSign(){if(jplopsoft_CALC.error)return;jplopsoft_calcSetInput(-jplopsoft_calcCurrentValue());jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcBackspace(){var s;if(jplopsoft_CALC.error||jplopsoft_CALC.waiting)return;s=String(jplopsoft_CALC.input||'0');if(s.length<=1||(s.charAt(0)==='-'&&s.length<=2))s='0';else s=s.substring(0,s.length-1);jplopsoft_CALC.input=s;jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcClearEntry(){if(jplopsoft_CALC.error)jplopsoft_CALC.error=false;jplopsoft_CALC.input='0';jplopsoft_CALC.waiting=false;jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcUnary(kind){var n=jplopsoft_calcCurrentValue(),r;if(jplopsoft_CALC.error)return;if(kind==='sqrt'){if(n<0){jplopsoft_calcSetError('Invalid input');return;}r=Math.sqrt(n);}else if(kind==='square')r=n*n;else if(kind==='reciprocal'){if(n===0){jplopsoft_calcSetError('Cannot divide by zero');return;}r=1/n;}else if(kind==='percent')r=(jplopsoft_CALC.accumulator!==null&&jplopsoft_CALC.pendingOp)?jplopsoft_CALC.accumulator*n/100:n/100;else return;if(jplopsoft_calcSetInput(r)){jplopsoft_CALC.waiting=true;jplopsoft_calcUpdateDisplay();}}
function jplopsoft_calcBinary(op){var current=jplopsoft_calcCurrentValue(),r;if(jplopsoft_CALC.error)return;if(jplopsoft_CALC.accumulator===null)jplopsoft_CALC.accumulator=current;else if(jplopsoft_CALC.pendingOp&&!jplopsoft_CALC.waiting){r=jplopsoft_calcApplyBinaryValues(jplopsoft_CALC.accumulator,current,jplopsoft_CALC.pendingOp);if(r===null){jplopsoft_calcSetError('Cannot divide by zero');return;}jplopsoft_CALC.accumulator=r;if(!jplopsoft_calcSetInput(r))return;}jplopsoft_CALC.pendingOp=op;jplopsoft_CALC.waiting=true;jplopsoft_CALC.expression=jplopsoft_calcFormatNumber(jplopsoft_CALC.accumulator)+' '+jplopsoft_calcOperatorSymbol(op);jplopsoft_calcUpdateDisplay();}
function jplopsoft_calcEquals(){var current,r,op,left;if(jplopsoft_CALC.error)return;if(jplopsoft_CALC.pendingOp){op=jplopsoft_CALC.pendingOp;left=jplopsoft_CALC.accumulator===null?0:jplopsoft_CALC.accumulator;current=jplopsoft_CALC.waiting?(jplopsoft_CALC.lastOperand!==null?jplopsoft_CALC.lastOperand:left):jplopsoft_calcCurrentValue();r=jplopsoft_calcApplyBinaryValues(left,current,op);if(r===null){jplopsoft_calcSetError('Cannot divide by zero');return;}jplopsoft_CALC.expression=jplopsoft_calcFormatNumber(left)+' '+jplopsoft_calcOperatorSymbol(op)+' '+jplopsoft_calcFormatNumber(current)+' =';jplopsoft_CALC.lastOp=op;jplopsoft_CALC.lastOperand=current;jplopsoft_CALC.pendingOp='';jplopsoft_CALC.accumulator=r;jplopsoft_CALC.waiting=true;jplopsoft_calcSetInput(r);jplopsoft_calcUpdateDisplay();return;}if(jplopsoft_CALC.lastOp&&jplopsoft_CALC.lastOperand!==null){left=jplopsoft_calcCurrentValue();r=jplopsoft_calcApplyBinaryValues(left,jplopsoft_CALC.lastOperand,jplopsoft_CALC.lastOp);if(r===null){jplopsoft_calcSetError('Cannot divide by zero');return;}jplopsoft_CALC.expression=jplopsoft_calcFormatNumber(left)+' '+jplopsoft_calcOperatorSymbol(jplopsoft_CALC.lastOp)+' '+jplopsoft_calcFormatNumber(jplopsoft_CALC.lastOperand)+' =';jplopsoft_CALC.accumulator=r;jplopsoft_CALC.waiting=true;jplopsoft_calcSetInput(r);jplopsoft_calcUpdateDisplay();}}
function jplopsoft_calcMemory(action){var n=jplopsoft_calcCurrentValue();if(jplopsoft_CALC.error)return;if(action==='MC')jplopsoft_CALC.memory=0;else if(action==='MR'){jplopsoft_calcSetInput(jplopsoft_CALC.memory);jplopsoft_CALC.waiting=true;jplopsoft_calcUpdateDisplay();}else if(action==='M+')jplopsoft_CALC.memory+=n;else if(action==='M-')jplopsoft_CALC.memory-=n;else if(action==='MS')jplopsoft_CALC.memory=n;}
function jplopsoft_calcAction(action){action=String(action||'');if(/^\d$/.test(action)){jplopsoft_calcDigit(action);return;}if(action==='.'){jplopsoft_calcDecimal();return;}if(action==='plusminus'){jplopsoft_calcToggleSign();return;}if(action==='back'){jplopsoft_calcBackspace();return;}if(action==='CE'){jplopsoft_calcClearEntry();return;}if(action==='C'){jplopsoft_calcReset(false);return;}if(action==='sqrt'||action==='square'||action==='reciprocal'||action==='percent'){jplopsoft_calcUnary(action);return;}if(action==='+'||action==='-'||action==='*'||action==='/'){jplopsoft_calcBinary(action);return;}if(action==='='){jplopsoft_calcEquals();return;}if(action==='MC'||action==='MR'||action==='M+'||action==='M-'||action==='MS')jplopsoft_calcMemory(action);}
function jplopsoft_calcKeyboard(e){var k;e=e||window.event;k=e.keyCode||e.which;if(k>=96&&k<=105)jplopsoft_calcAction(String(k-96));else if(k>=48&&k<=57&&!e.shiftKey)jplopsoft_calcAction(String(k-48));else if(k===110||k===190)jplopsoft_calcAction('.');else if(k===107||(k===187&&e.shiftKey))jplopsoft_calcAction('+');else if(k===109||k===189)jplopsoft_calcAction('-');else if(k===106||(k===56&&e.shiftKey))jplopsoft_calcAction('*');else if(k===111||k===191)jplopsoft_calcAction('/');else if(k===13||k===187)jplopsoft_calcAction('=');else if(k===8)jplopsoft_calcAction('back');else if(k===46)jplopsoft_calcAction('CE');else if(k===27)jplopsoft_calcAction('C');else if(k===53&&e.shiftKey)jplopsoft_calcAction('percent');else return true;if(e.preventDefault)e.preventDefault();e.returnValue=false;return false;}
function jplopsoft_calcMakeButton(text,action,cls){var b=document.createElement('button');b.type='button';b.className='jplopsoft_calc-key'+(cls?' '+cls:'');b.textContent=text;b.setAttribute('data-calc-action',action);b.onclick=function(){jplopsoft_calcAction(String(this.getAttribute('data-calc-action')||''));};return b;}
function jplopsoft_closeCalculator(){var h=jplopsoft_CALC.hwnd;jplopsoft_CALC.hwnd=0;if(h&&jplopsoft_user32GetRecord(h))jplopsoft_DestroyWindow(h);}
function jplopsoft_openCalculator(){var h,client,displayWrap,expr,display,memory,grid,i,b,memoryKeys=[['MC','MC'],['MR','MR'],['M+','M+'],['M−','M-'],['MS','MS']],keys=[['%','percent',''],['CE','CE',''],['C','C',''],['⌫','back',''],['1/x','reciprocal',''],['x²','square',''],['√x','sqrt',''],['÷','/',''],['7','7','jplopsoft_digit'],['8','8','jplopsoft_digit'],['9','9','jplopsoft_digit'],['×','*',''],['4','4','jplopsoft_digit'],['5','5','jplopsoft_digit'],['6','6','jplopsoft_digit'],['−','-',''],['1','1','jplopsoft_digit'],['2','2','jplopsoft_digit'],['3','3','jplopsoft_digit'],['+','+',''],['±','plusminus','jplopsoft_digit'],['0','0','jplopsoft_digit'],['.','.','jplopsoft_digit'],['=','=','jplopsoft_equals']];if(!state.samAuthenticated||!state.vaultKey){alert('請先登入 ExOS。');return;}if(jplopsoft_CALC.hwnd&&jplopsoft_user32GetRecord(jplopsoft_CALC.hwnd)){jplopsoft_ShowWindow(jplopsoft_CALC.hwnd,jplopsoft_SW_RESTORE);jplopsoft_user32BringToFront(jplopsoft_CALC.hwnd);client=jplopsoft_GetClientElement(jplopsoft_CALC.hwnd);if(client){try{client.focus();}catch(ignoreCalcFocus){}}return;}h=jplopsoft_CreateWindowEx(jplopsoft_WS_EX_APPWINDOW,'ExOS.Window','小算盤',jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,150,75,360,560,null,null,null,{appId:'calc',icon:'calc',windowClass:'jplopsoft_calc-window',clientClass:'jplopsoft_calc-client',taskbar:true,ntProcessKey:'proc:calc',ntImageName:'calc.exe',ntDescription:'Calculator',ntParentKey:'proc:explorer',wndProc:function(hwnd,msg){if(msg===jplopsoft_WM_CLOSE){jplopsoft_closeCalculator();return 0;}return null;}});if(!h)return;jplopsoft_CALC.hwnd=h;client=jplopsoft_GetClientElement(h);if(!client)return;client.id=jplopsoft_CALC.clientId;client.tabIndex=0;client.onkeydown=jplopsoft_calcKeyboard;client.onclick=function(){try{client.focus();}catch(ignoreCalcClickFocus){}};displayWrap=document.createElement('div');displayWrap.className='jplopsoft_calc-display-wrap';expr=document.createElement('div');expr.id=jplopsoft_CALC.expressionId;expr.className='jplopsoft_calc-expression';displayWrap.appendChild(expr);display=document.createElement('div');display.id=jplopsoft_CALC.displayId;display.className='jplopsoft_calc-display';display.textContent='0';displayWrap.appendChild(display);client.appendChild(displayWrap);memory=document.createElement('div');memory.className='jplopsoft_calc-memory';for(i=0;i<memoryKeys.length;i++){b=document.createElement('button');b.type='button';b.textContent=memoryKeys[i][0];b.setAttribute('data-calc-memory',memoryKeys[i][1]);b.onclick=function(){jplopsoft_calcMemory(String(this.getAttribute('data-calc-memory')||''));};memory.appendChild(b);}client.appendChild(memory);grid=document.createElement('div');grid.className='jplopsoft_calc-grid';for(i=0;i<keys.length;i++)grid.appendChild(jplopsoft_calcMakeButton(keys[i][0],keys[i][1],keys[i][2]));client.appendChild(grid);jplopsoft_calcReset(false);jplopsoft_user32BringToFront(h);window.setTimeout(function(){var c=jplopsoft_GetClientElement(h);if(c){try{c.focus();}catch(ignoreCalcInitialFocus){}}},0);}

/* =========================================================================
 * Task Manager
 * ========================================================================= */
var jplopsoft_TASKMGR={
  hwnd:0,
  timer:0,
  bodyId:'jplopsoft_taskmgrBody',
  statusId:'jplopsoft_taskmgrStatus',
  privilegeId:'jplopsoft_taskmgrPrivilege',
  tab:'processes',
  token:null,
  launchSource:'explorer.exe',
  lastStatus:''
};

function jplopsoft_taskmgrRecordRunning(rec){
  var b,w;
  if(!rec||rec.destroying||rec.ntTerminated)return false;
  w=jplopsoft_el(rec.windowId);
  if(rec.dynamic)return !!w;
  if(rec.appId&&jplopsoft_el(jplopsoft_taskbarAppId(rec.appId)))return true;
  if(rec.appId==='document'&&state.openId)return true;
  if(rec.overlay&&rec.backdropId){
    b=jplopsoft_el(rec.backdropId);
    if(b&&b.style.display!=='none'&&b.offsetWidth>0)return true;
  }
  return !!(w&&w.style.display!=='none'&&!jplopsoft_wmClassHas(w,'jplopsoft_hidden'));
}

function jplopsoft_taskmgrWindowTitle(rec){
  var n,w;
  if(!rec)return'';
  if(rec.titleId){
    n=jplopsoft_el(rec.titleId);
    if(n&&jplopsoft_trim(n.textContent||''))return jplopsoft_trim(n.textContent||'');
  }
  if(rec.title)return String(rec.title);
  w=jplopsoft_el(rec.windowId);
  if(w&&w.querySelector){
    n=w.querySelector('.jplopsoft_wm-title,.jplopsoft_modal-title,.jplopsoft_properties-head-name');
    if(n&&jplopsoft_trim(n.textContent||''))return jplopsoft_trim(n.textContent||'');
  }
  return rec.appId||rec.className||('HWND '+rec.hwnd);
}

function jplopsoft_taskmgrWindowState(rec){
  if(!rec)return'';
  if(parseInt(jplopsoft_DWM.activeHwnd,10)===parseInt(rec.hwnd,10))return'執行中';
  if(!jplopsoft_user32DisplayIsVisible(rec))return'已最小化';
  return'背景';
}

function jplopsoft_taskmgrSetStatus(text,isError){
  var n=jplopsoft_el(jplopsoft_TASKMGR.statusId);
  jplopsoft_TASKMGR.lastStatus=String(text||'');
  if(!n)return;
  n.className='jplopsoft_app-status '+(isError?'jplopsoft_taskmgr-status-error':'jplopsoft_taskmgr-status-ok');
  n.textContent=jplopsoft_TASKMGR.lastStatus;
}

function jplopsoft_taskmgrUpdatePrivilegeBadge(){
  var n=jplopsoft_el(jplopsoft_TASKMGR.privilegeId),enabled=jplopsoft_taskmgrHasSeDebugPrivilege();
  if(!n)return;

  if(!jplopsoft_TASKMGR.token){
    n.className='jplopsoft_taskmgr-priv';
    n.textContent='SeDebugPrivilege：讀取中';
    return;
  }

  n.className='jplopsoft_taskmgr-priv '+(enabled?'jplopsoft_enabled':'jplopsoft_denied');
  n.textContent='SeDebugPrivilege：'+(enabled?'Enabled':'Not held');
}

function jplopsoft_taskmgrLoadToken(){
  jplopsoft_api('token_info','GET',null,true,function(err,out){
    if(err||!out||!out.token){
      jplopsoft_TASKMGR.token=null;
      jplopsoft_taskmgrUpdatePrivilegeBadge();
      jplopsoft_taskmgrSetStatus('無法讀取 Access Token：'+(err?err.message:'unknown error'),true);
      return;
    }

    jplopsoft_TASKMGR.token=out.token;
    jplopsoft_taskmgrUpdatePrivilegeBadge();

    if(jplopsoft_taskmgrHasSeDebugPrivilege()){
      jplopsoft_taskmgrSetStatus('Access Token 已載入；SeDebugPrivilege 已啟用。',false);
    }else{
      jplopsoft_taskmgrSetStatus('Access Token 已載入；目前 Token 沒有 SeDebugPrivilege。',false);
    }

    jplopsoft_taskmgrRender();
  });
}

function jplopsoft_taskmgrQueryProcesses(){
  var q=jplopsoft_NtQuerySystemInformation('SystemProcessInformation');
  return q&&q.status===jplopsoft_STATUS_SUCCESS?q.information:[];
}

function jplopsoft_taskmgrProcessState(p){
  var records,i,rec,hasVisible=false,hasMinimized=false;

  if(!p)return'';
  if(p.systemProcess)return'系統';

  records=jplopsoft_ntProcessWindowRecords(p);
  for(i=0;i<records.length;i++){
    rec=records[i];
    if(jplopsoft_user32DisplayIsVisible(rec))hasVisible=true;
    else hasMinimized=true;
    if(parseInt(jplopsoft_DWM.activeHwnd,10)===parseInt(rec.hwnd,10))return'執行中';
  }

  if(hasVisible)return'背景';
  if(hasMinimized||records.length)return'已最小化';
  return'背景';
}

function jplopsoft_taskmgrProtectionLabel(p){
  if(!p)return'';
  if(p.kernel)return'Kernel';
  if(p.protection==='PPL')return'PPL';
  if(p.critical)return'Critical';
  return'—';
}

function jplopsoft_taskmgrProtectionClass(p){
  if(!p)return'jplopsoft_none';
  if(p.protection==='PPL')return'jplopsoft_ppl';
  if(p.kernel||p.critical)return'jplopsoft_critical';
  return'jplopsoft_none';
}

function jplopsoft_taskmgrFindFirstWindow(p){
  var records=jplopsoft_ntProcessWindowRecords(p),i,rec;
  for(i=0;i<records.length;i++){
    rec=records[i];
    if(jplopsoft_user32DisplayIsVisible(rec))return rec;
  }
  return records.length?records[0]:null;
}

function jplopsoft_taskmgrSwitchProcess(pid){
  var p=jplopsoft_ntKernelProcessByPid(pid),rec;
  if(!p||!p.alive)return;
  rec=jplopsoft_taskmgrFindFirstWindow(p);
  if(!rec){
    jplopsoft_taskmgrSetStatus(p.imageName+' 沒有可切換的頂層 HWND。',true);
    return;
  }

  if(rec.appId==='explorer'){
    jplopsoft_wmRestoreExplorerStable();
  }else{
    jplopsoft_user32Display(rec,true);
    jplopsoft_user32Activate(rec);
  }
  jplopsoft_taskmgrRender();
}

function jplopsoft_taskmgrEndTask(pid){
  var p=jplopsoft_ntKernelProcessByPid(pid),records,i,title;

  if(!p||!p.alive)return;
  records=jplopsoft_ntProcessWindowRecords(p);

  if(!records.length){
    jplopsoft_taskmgrSetStatus('此處理程序沒有可接收 WM_CLOSE 的頂層視窗。',true);
    return;
  }

  title=p.imageName;
  if(!window.confirm('要將 WM_CLOSE 傳送給「'+title+'」的所有頂層視窗嗎？'))return;

  /*
   * "End task" is the polite GUI path: WM_CLOSE -> application WndProc.
   * It is intentionally different from NtTerminateProcess below.
   */
  for(i=0;i<records.length;i++){
    jplopsoft_SendMessage(records[i].hwnd,jplopsoft_WM_CLOSE,0,0);
  }

  jplopsoft_taskmgrSetStatus('已送出 WM_CLOSE：'+title,false);
  window.setTimeout(jplopsoft_taskmgrRender,80);
}

function jplopsoft_taskmgrTerminateProcess(pid){
  var p=jplopsoft_ntKernelProcessByPid(pid),rights,opened,status,text;

  if(!p||!p.alive)return;

  if(p.imageName==='taskmgr.exe'&&jplopsoft_TASKMGR.hwnd){
    jplopsoft_taskmgrSetStatus('目前的 taskmgr.exe 實例不提供自我強制終止；可使用右上角關閉。',true);
    return;
  }

  rights=jplopsoft_ntCanTerminateProcess(p);
  if(!rights.ok){
    jplopsoft_taskmgrSetStatus(
      rights.reason+' '+jplopsoft_ntStatusName(rights.status)+' ('+jplopsoft_ntStatusHex(rights.status)+')',
      true
    );
    return;
  }

  if(!window.confirm(
    '強制終止 '+p.imageName+' (PID '+p.pid+')？\n\n'+
    '這會走 NtTerminateProcess 語意，不傳送 WM_CLOSE，未儲存資料可能遺失。'
  ))return;

  opened=jplopsoft_OpenProcess(jplopsoft_PROCESS_TERMINATE|jplopsoft_PROCESS_QUERY_LIMITED_INFORMATION,false,p.pid);
  if(!opened||opened.status!==jplopsoft_STATUS_SUCCESS){
    status=opened?opened.status:jplopsoft_STATUS_ACCESS_DENIED;
    text=(opened&&opened.reason)?opened.reason:'OpenProcess failed.';
    jplopsoft_taskmgrSetStatus(
      text+' '+jplopsoft_ntStatusName(status)+' ('+jplopsoft_ntStatusHex(status)+')',
      true
    );
    return;
  }

  status=jplopsoft_NtTerminateProcess(opened.handle,0xDEAD);
  jplopsoft_NtClose(opened.handle);

  if(status!==jplopsoft_STATUS_SUCCESS){
    jplopsoft_taskmgrSetStatus(
      'NtTerminateProcess 失敗：'+jplopsoft_ntStatusName(status)+' ('+jplopsoft_ntStatusHex(status)+')',
      true
    );
    return;
  }

  jplopsoft_taskmgrSetStatus('NtTerminateProcess 成功：'+p.imageName+' (PID '+p.pid+')',false);
  window.setTimeout(jplopsoft_taskmgrRender,80);
}

function jplopsoft_taskmgrRestartExplorer(){
  var k,rec,p=jplopsoft_ntKernelAliveByKey('proc:explorer');

  if(p){
    p.alive=false;
    p.exitTime=jplopsoft_ntKernelNow();
    delete jplopsoft_NT_KERNEL.processByPid[String(p.pid)];
  }

  for(k in jplopsoft_USER32.windows){
    if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
    rec=jplopsoft_USER32.windows[k];
    if(jplopsoft_ntKernelProcessKeyForWindow(rec)==='proc:explorer'){
      rec.ntTerminated=false;
      rec.ntPid=0;
    }
  }

  jplopsoft_setBodyClassToken('jplopsoft_explorer-process-stopped',false);
  jplopsoft_wmOpenExplorer(0);
  jplopsoft_taskmgrSetStatus('explorer.exe 已重新啟動。',false);
  window.setTimeout(jplopsoft_taskmgrRender,60);
}

function jplopsoft_taskmgrFormatUptime(ms){
  var sec=Math.floor((parseInt(ms,10)||0)/1000),h,m,s;
  h=Math.floor(sec/3600);sec-=h*3600;
  m=Math.floor(sec/60);s=sec-m*60;
  return(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
}

function jplopsoft_taskmgrFormatBytes(v){
  v=parseInt(v,10)||0;
  if(v<=0)return'—';
  return jplopsoft_formatFileSize(v);
}

function jplopsoft_taskmgrBrowserMemory(){
  var p=window.performance||null,m=p&&p.memory?p.memory:null;
  if(!m)return null;
  return{
    used:parseInt(m.usedJSHeapSize,10)||0,
    total:parseInt(m.totalJSHeapSize,10)||0,
    limit:parseInt(m.jsHeapSizeLimit,10)||0
  };
}

function jplopsoft_taskmgrCreateButton(text,fn,disabled,title){
  var b=document.createElement('button');
  b.className='jplopsoft_btn jplopsoft_small';
  b.type='button';
  b.textContent=text;
  b.disabled=!!disabled;
  if(title)b.title=title;
  b.onclick=fn;
  return b;
}

function jplopsoft_taskmgrRenderProcesses(body,rows){
  var table,thead,tbody,tr,th,td,i,p,b,records,rights;

  table=document.createElement('table');
  table.className='jplopsoft_taskmgr-table';
  thead=document.createElement('thead');
  tr=document.createElement('tr');

  ['名稱','PID','使用者','狀態','執行緒','HWND','保護','動作'].forEach(function(x){
    th=document.createElement('th');th.textContent=x;tr.appendChild(th);
  });

  thead.appendChild(tr);
  table.appendChild(thead);
  tbody=document.createElement('tbody');

  for(i=0;i<rows.length;i++){
    p=rows[i];
    tr=document.createElement('tr');
    if(p.systemProcess)tr.className='jplopsoft_taskmgr-system-row';

    td=document.createElement('td');
    td.innerHTML='<span class="jplopsoft_taskmgr-process-name">'+jplopsoft_htmlEscape(p.imageName)+'</span>'+
      '<span class="jplopsoft_taskmgr-process-desc">'+jplopsoft_htmlEscape(p.description)+(p.commandLine?(' ｜ '+jplopsoft_htmlEscape(p.commandLine)):'')+'</span>';
    tr.appendChild(td);

    td=document.createElement('td');td.textContent=String(p.pid);tr.appendChild(td);
    td=document.createElement('td');td.textContent=String(p.username||'—');tr.appendChild(td);
    td=document.createElement('td');td.className='jplopsoft_taskmgr-state';td.textContent=jplopsoft_taskmgrProcessState(p);tr.appendChild(td);
    td=document.createElement('td');td.textContent=String(p.threadCount);tr.appendChild(td);
    td=document.createElement('td');td.textContent=String(p.handleCount);tr.appendChild(td);

    td=document.createElement('td');
    td.className='jplopsoft_taskmgr-protection '+jplopsoft_taskmgrProtectionClass(p);
    td.textContent=jplopsoft_taskmgrProtectionLabel(p);
    tr.appendChild(td);

    td=document.createElement('td');td.className='jplopsoft_taskmgr-actions';
    records=jplopsoft_ntProcessWindowRecords(p);

    b=jplopsoft_taskmgrCreateButton(
      '切換至',
      (function(pid){return function(){jplopsoft_taskmgrSwitchProcess(pid);};})(p.pid),
      !records.length,
      records.length?'切換到第一個頂層視窗':'此程序沒有 HWND'
    );
    td.appendChild(b);

    b=jplopsoft_taskmgrCreateButton(
      '結束工作',
      (function(pid){return function(){jplopsoft_taskmgrEndTask(pid);};})(p.pid),
      !records.length,
      records.length?'送出 WM_CLOSE':'此程序沒有 GUI 視窗'
    );
    td.appendChild(b);

    rights=jplopsoft_ntCanTerminateProcess(p);
    b=jplopsoft_taskmgrCreateButton(
      '結束處理程序',
      (function(pid){return function(){jplopsoft_taskmgrTerminateProcess(pid);};})(p.pid),
      !rights.ok||p.imageName==='taskmgr.exe',
      rights.ok?'NtTerminateProcess':rights.reason
    );
    td.appendChild(b);

    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  body.appendChild(table);
}

function jplopsoft_taskmgrMetric(host,label,value,sub){
  var c,l,v,s;
  c=document.createElement('div');c.className='jplopsoft_taskmgr-metric';
  l=document.createElement('div');l.className='jplopsoft_taskmgr-metric-label';l.textContent=label;c.appendChild(l);
  v=document.createElement('div');v.className='jplopsoft_taskmgr-metric-value';v.textContent=value;c.appendChild(v);
  if(sub){
    s=document.createElement('div');s.className='jplopsoft_taskmgr-metric-sub';s.textContent=sub;c.appendChild(s);
  }
  host.appendChild(c);
}

function jplopsoft_taskmgrRenderPerformance(body,rows){
  var host=document.createElement('div'),
      metrics=document.createElement('div'),
      card=document.createElement('div'),
      mem=jplopsoft_taskmgrBrowserMemory(),
      threads=0,handles=0,i;

  host.className='jplopsoft_taskmgr-perf';
  metrics.className='jplopsoft_taskmgr-metrics';

  for(i=0;i<rows.length;i++){
    threads+=parseInt(rows[i].threadCount,10)||0;
    handles+=parseInt(rows[i].handleCount,10)||0;
  }

  jplopsoft_taskmgrMetric(metrics,'Processes',String(rows.length),'NtQuerySystemInformation');
  jplopsoft_taskmgrMetric(metrics,'Logical Threads',String(threads),'ExFS NT process model');
  jplopsoft_taskmgrMetric(metrics,'Top-level HWND',String(handles),'user32 window handles');
  jplopsoft_taskmgrMetric(metrics,'DWM Surfaces',String(Object.keys(jplopsoft_DWM.surfaces||{}).length),'Desktop compositor');

  jplopsoft_taskmgrMetric(
    metrics,
    'Session',
    String(jplopsoft_NT_INTERACTIVE.sessionId),
    jplopsoft_NT_INTERACTIVE.windowStation+'\\'+jplopsoft_NT_INTERACTIVE.desktop
  );

  jplopsoft_taskmgrMetric(
    metrics,
    'Kernel Uptime',
    jplopsoft_taskmgrFormatUptime(jplopsoft_ntKernelNow()-jplopsoft_NT_KERNEL.bootTime),
    'ExOS runtime uptime'
  );

  jplopsoft_taskmgrMetric(
    metrics,
    'JS Heap',
    mem?jplopsoft_taskmgrFormatBytes(mem.used):'N/A',
    mem?('Limit '+jplopsoft_taskmgrFormatBytes(mem.limit)):'Browser does not expose performance.memory'
  );

  jplopsoft_taskmgrMetric(
    metrics,
    'Active HWND',
    String(jplopsoft_DWM.activeHwnd||'—'),
    'DWM foreground surface'
  );

  host.appendChild(metrics);

  card.className='jplopsoft_taskmgr-native-card';
  card.innerHTML=
    '<strong>NT Native API 路徑</strong><br>'+
    '<code>taskmgr.exe (User Mode / Ring 3)</code> → '+
    '<code>NtQuerySystemInformation(SystemProcessInformation)</code> → '+
    '<code>ExOS NT Kernel Process Table</code><br>'+
    '強制終止使用 <code>OpenProcess(PROCESS_TERMINATE)</code> → '+
    '<code>NtTerminateProcess</code>；一般「結束工作」則使用 <code>WM_CLOSE</code>。<br>'+
    '此資料只描述 ExFS 虛擬 NT Session，不會列出或控制 Web Server / 瀏覽器宿主作業系統的真實程序。';
  host.appendChild(card);

  body.appendChild(host);
}

function jplopsoft_taskmgrRenderDetails(body,rows){
  var table,thead,tbody,tr,th,td,i,p,rights,b;

  table=document.createElement('table');
  table.className='jplopsoft_taskmgr-table';

  thead=document.createElement('thead');
  tr=document.createElement('tr');
  ['映像名稱','PID','PPID','Session','使用者','Integrity','Threads','Handles','VAS','PEB','Env','Protection','Critical','執行時間','動作'].forEach(function(x){
    th=document.createElement('th');th.textContent=x;tr.appendChild(th);
  });
  thead.appendChild(tr);table.appendChild(thead);
  tbody=document.createElement('tbody');

  for(i=0;i<rows.length;i++){
    p=rows[i];
    tr=document.createElement('tr');
    if(p.systemProcess)tr.className='jplopsoft_taskmgr-system-row';

    [p.imageName,p.pid,p.ppid,p.sessionId,p.username||'—',p.integrity,p.threadCount,p.handleCount,p.virtualAddressSpaceId||'—',p.pebId||'—',p.environmentCount||0].forEach(function(v){
      td=document.createElement('td');td.textContent=String(v);tr.appendChild(td);
    });

    td=document.createElement('td');td.textContent=jplopsoft_taskmgrProtectionLabel(p);tr.appendChild(td);
    td=document.createElement('td');td.textContent=p.critical?'是':'否';tr.appendChild(td);
    td=document.createElement('td');td.textContent=jplopsoft_taskmgrFormatUptime(p.uptimeMs);tr.appendChild(td);

    td=document.createElement('td');td.className='jplopsoft_taskmgr-actions';
    rights=jplopsoft_ntCanTerminateProcess(p);
    b=jplopsoft_taskmgrCreateButton(
      '結束處理程序',
      (function(pid){return function(){jplopsoft_taskmgrTerminateProcess(pid);};})(p.pid),
      !rights.ok||p.imageName==='taskmgr.exe',
      rights.ok?'NtTerminateProcess':rights.reason
    );
    td.appendChild(b);
    tr.appendChild(td);

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  body.appendChild(table);
}

function jplopsoft_taskmgrSelectTab(tab){
  var ids=['processes','performance','details'],i,b;
  tab=String(tab||'processes');
  jplopsoft_TASKMGR.tab=tab;

  for(i=0;i<ids.length;i++){
    b=jplopsoft_el('jplopsoft_taskmgrTab_'+ids[i]);
    if(b)b.className='jplopsoft_taskmgr-tab'+(ids[i]===tab?' jplopsoft_active':'');
  }

  jplopsoft_taskmgrRender();
}

function jplopsoft_taskmgrRender(){
  var body=jplopsoft_el(jplopsoft_TASKMGR.bodyId),
      rows=jplopsoft_taskmgrQueryProcesses();

  if(!body)return;
  body.innerHTML='';

  if(!rows.length){
    body.innerHTML='<div class="jplopsoft_taskmgr-empty">NtQuerySystemInformation 沒有回傳處理程序。</div>';
    return;
  }

  if(jplopsoft_TASKMGR.tab==='performance'){
    jplopsoft_taskmgrRenderPerformance(body,rows);
  }else if(jplopsoft_TASKMGR.tab==='details'){
    jplopsoft_taskmgrRenderDetails(body,rows);
  }else{
    jplopsoft_taskmgrRenderProcesses(body,rows);
  }

  jplopsoft_taskmgrUpdatePrivilegeBadge();
}

function jplopsoft_closeTaskManager(){
  var h=jplopsoft_TASKMGR.hwnd;
  if(jplopsoft_TASKMGR.timer){
    window.clearInterval(jplopsoft_TASKMGR.timer);
    jplopsoft_TASKMGR.timer=0;
  }
  jplopsoft_TASKMGR.hwnd=0;
  jplopsoft_TASKMGR.token=null;
  if(h)jplopsoft_DestroyWindow(h);
}

function jplopsoft_openTaskManager(emergency){
  var h,client,toolbar,refresh,restart,priv,tabs,tab,body,status,
      parentKey=emergency?'core:winlogon':'proc:explorer';

  jplopsoft_TASKMGR.launchSource=emergency?'winlogon.exe / Ctrl+Shift+Esc':'explorer.exe';

  if(jplopsoft_TASKMGR.hwnd&&jplopsoft_user32GetRecord(jplopsoft_TASKMGR.hwnd)){
    jplopsoft_ShowWindow(jplopsoft_TASKMGR.hwnd,jplopsoft_SW_RESTORE);
    jplopsoft_user32BringToFront(jplopsoft_TASKMGR.hwnd);
    jplopsoft_taskmgrRender();
    if(!jplopsoft_TASKMGR.token)jplopsoft_taskmgrLoadToken();
    return;
  }

  h=jplopsoft_CreateWindowEx(
    jplopsoft_WS_EX_APPWINDOW,
    'ExOS.Window',
    '工作管理員',
    jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,
    100,55,1080,700,null,null,null,
    {
      appId:'taskmgr',
      icon:'taskmgr',
      windowClass:'jplopsoft_taskmgr-window',
      taskbar:true,
      ntProcessKey:'proc:taskmgr',
      ntImageName:'taskmgr.exe',
      ntDescription:'Task Manager',
      ntParentKey:parentKey,
      wndProc:function(hwnd,msg){
        if(msg===jplopsoft_WM_CLOSE){jplopsoft_closeTaskManager();return 0;}
        return null;
      }
    }
  );

  if(!h)return;

  jplopsoft_TASKMGR.hwnd=h;
  client=jplopsoft_GetClientElement(h);
  client.className+=' jplopsoft_taskmgr-client';

  toolbar=document.createElement('div');
  toolbar.className='jplopsoft_app-toolbar';

  refresh=document.createElement('button');
  refresh.type='button';
  refresh.className='jplopsoft_btn jplopsoft_small';
  refresh.textContent='重新整理';
  refresh.onclick=function(){
    jplopsoft_taskmgrLoadToken();
    jplopsoft_taskmgrRender();
  };
  toolbar.appendChild(refresh);

  restart=document.createElement('button');
  restart.type='button';
  restart.className='jplopsoft_btn jplopsoft_small';
  restart.textContent='重新啟動 Explorer';
  restart.onclick=jplopsoft_taskmgrRestartExplorer;
  toolbar.appendChild(restart);

  priv=document.createElement('span');
  priv.id=jplopsoft_TASKMGR.privilegeId;
  priv.className='jplopsoft_taskmgr-priv';
  priv.textContent='SeDebugPrivilege：讀取中';
  toolbar.appendChild(priv);

  var summary=document.createElement('span');
  summary.className='jplopsoft_taskmgr-summary';
  summary.textContent='User Mode taskmgr.exe ｜ '+jplopsoft_TASKMGR.launchSource;
  toolbar.appendChild(summary);

  client.appendChild(toolbar);

  tabs=document.createElement('div');
  tabs.className='jplopsoft_taskmgr-tabs';

  [
    ['processes','處理程序'],
    ['performance','效能'],
    ['details','詳細資料']
  ].forEach(function(row){
    tab=document.createElement('button');
    tab.type='button';
    tab.id='jplopsoft_taskmgrTab_'+row[0];
    tab.className='jplopsoft_taskmgr-tab'+(jplopsoft_TASKMGR.tab===row[0]?' jplopsoft_active':'');
    tab.textContent=row[1];
    tab.onclick=(function(id){return function(){jplopsoft_taskmgrSelectTab(id);};})(row[0]);
    tabs.appendChild(tab);
  });

  client.appendChild(tabs);

  body=document.createElement('div');
  body.id=jplopsoft_TASKMGR.bodyId;
  body.className='jplopsoft_taskmgr-body';
  client.appendChild(body);

  status=document.createElement('div');
  status.id=jplopsoft_TASKMGR.statusId;
  status.className='jplopsoft_app-status';
  status.textContent='正在呼叫 NtQuerySystemInformation…';
  client.appendChild(status);

  jplopsoft_taskmgrLoadToken();
  jplopsoft_taskmgrRender();

  jplopsoft_TASKMGR.timer=window.setInterval(function(){
    if(jplopsoft_TASKMGR.hwnd&&jplopsoft_user32GetRecord(jplopsoft_TASKMGR.hwnd)){
      jplopsoft_taskmgrRender();
    }
  },1000);
}

/* =========================================================================
 * Registry Editor (regedit.exe)
 * ========================================================================= */
var jplopsoft_REGEDIT={
  hwnd:0,snapshot:null,hive:'HKCU',key:'',selectedValue:null,
  treeId:'jplopsoft_regeditTree',valuesId:'jplopsoft_regeditValues',
  pathId:'jplopsoft_regeditPath',statusId:'jplopsoft_regeditStatus'
};

function jplopsoft_regeditFullPath(hive,key){
  hive=String(hive||'HKCU');key=String(key||'');
  if(hive==='HKLM')return'HKEY_LOCAL_MACHINE\\Software'+(key?'\\'+key:'');
  return'HKEY_CURRENT_USER'+(key?'\\'+key:'');
}

function jplopsoft_regeditHiveData(hive){
  var s=jplopsoft_REGEDIT.snapshot;
  return s&&s.hives?s.hives[String(hive||'HKCU')]:null;
}

function jplopsoft_regeditCurrentKeyRecord(){
  var h=jplopsoft_regeditHiveData(jplopsoft_REGEDIT.hive),key=String(jplopsoft_REGEDIT.key||'');
  return h&&h.keys&&h.keys[key]?h.keys[key]:null;
}

function jplopsoft_regeditSetStatus(text){
  var n=jplopsoft_el(jplopsoft_REGEDIT.statusId);
  if(n)n.textContent=String(text||'');
}

function jplopsoft_regeditSelect(hive,key){
  jplopsoft_REGEDIT.hive=String(hive||'HKCU');
  jplopsoft_REGEDIT.key=String(key||'');
  jplopsoft_REGEDIT.selectedValue=null;
  jplopsoft_regeditRenderTree();
  jplopsoft_regeditRenderValues();
}

function jplopsoft_regeditRenderTree(){
  var host=jplopsoft_el(jplopsoft_REGEDIT.treeId),hives=['HKLM','HKCU'],i,hive,h,keyNames,j,key,row,label,depth;
  if(!host)return;
  host.innerHTML='';

  for(i=0;i<hives.length;i++){
    hive=hives[i];h=jplopsoft_regeditHiveData(hive);if(!h)continue;

    row=document.createElement('button');row.type='button';
    row.className='jplopsoft_regedit-tree-row '+(jplopsoft_REGEDIT.hive===hive&&jplopsoft_REGEDIT.key===''?'jplopsoft_active':'');
    row.style.paddingLeft='8px';row.textContent=String(h.display||hive);
    (function(x){row.onclick=function(){jplopsoft_regeditSelect(x,'');};})(hive);
    host.appendChild(row);

    keyNames=[];
    for(key in h.keys)if(h.keys.hasOwnProperty(key))keyNames.push(key);
    keyNames.sort();

    for(j=0;j<keyNames.length;j++){
      key=String(keyNames[j]||'');
      if(key==='')continue;
      depth=key.split('\\').length;
      label=key.substring(key.lastIndexOf('\\')+1);
      row=document.createElement('button');row.type='button';
      row.className='jplopsoft_regedit-tree-row '+(jplopsoft_REGEDIT.hive===hive&&jplopsoft_REGEDIT.key===key?'jplopsoft_active':'');
      row.style.paddingLeft=(12+depth*14)+'px';
      row.textContent=label;
      row.title=jplopsoft_regeditFullPath(hive,key);
      (function(x,k){row.onclick=function(){jplopsoft_regeditSelect(x,k);};})(hive,key);
      host.appendChild(row);
    }
  }
}

function jplopsoft_regeditRenderValues(){
  var host=jplopsoft_el(jplopsoft_REGEDIT.valuesId),path=jplopsoft_el(jplopsoft_REGEDIT.pathId),
      rec,values,names=[],name,v,table,thead,tbody,tr,th,td,i;
  if(!host)return;
  host.innerHTML='';
  if(path)path.textContent=jplopsoft_regeditFullPath(jplopsoft_REGEDIT.hive,jplopsoft_REGEDIT.key);

  rec=jplopsoft_regeditCurrentKeyRecord();
  values=rec&&rec.values?rec.values:{};
  for(name in values)if(values.hasOwnProperty(name))names.push(name);
  names.sort();

  if(!names.length){
    var empty=document.createElement('div');empty.className='jplopsoft_regedit-empty';empty.textContent='此機碼目前沒有值。';host.appendChild(empty);
    return;
  }

  table=document.createElement('table');table.className='jplopsoft_regedit-values-table';
  thead=document.createElement('thead');tr=document.createElement('tr');
  ['名稱','類型','資料','更新時間'].forEach(function(x){th=document.createElement('th');th.textContent=x;tr.appendChild(th);});
  thead.appendChild(tr);table.appendChild(thead);tbody=document.createElement('tbody');

  for(i=0;i<names.length;i++){
    name=names[i];v=values[name]||{};
    tr=document.createElement('tr');
    if(jplopsoft_REGEDIT.selectedValue===name)tr.className='jplopsoft_selected';
    tr.setAttribute('data-reg-value-name',name);

    td=document.createElement('td');td.textContent=name===''?'(預設)':name;tr.appendChild(td);
    td=document.createElement('td');td.textContent=String(v.type||'REG_SZ');tr.appendChild(td);
    td=document.createElement('td');td.textContent=String(typeof v.data==='undefined'?'':v.data);tr.appendChild(td);
    td=document.createElement('td');td.textContent=String(v.updated_at||'');tr.appendChild(td);

    (function(n,row){
      row.onclick=function(){jplopsoft_REGEDIT.selectedValue=n;jplopsoft_regeditRenderValues();};
      row.ondblclick=function(){jplopsoft_REGEDIT.selectedValue=n;jplopsoft_regeditEditValue();};
    })(name,tr);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);host.appendChild(table);
}

function jplopsoft_regeditLoad(){
  jplopsoft_regeditSetStatus('正在讀取 Registry...');
  jplopsoft_api('regedit_snapshot','GET',null,true,function(err,out){
    if(err){jplopsoft_regeditSetStatus('讀取失敗：'+err.message);return;}
    jplopsoft_REGEDIT.snapshot=out;
    if(!jplopsoft_regeditHiveData(jplopsoft_REGEDIT.hive)){jplopsoft_REGEDIT.hive='HKCU';jplopsoft_REGEDIT.key='';}
    jplopsoft_regeditRenderTree();
    jplopsoft_regeditRenderValues();
    jplopsoft_regeditSetStatus('EXOS_NT_REGISTRY_V1 ｜ '+jplopsoft_regeditFullPath(jplopsoft_REGEDIT.hive,jplopsoft_REGEDIT.key));
  });
}

function jplopsoft_regeditWriteValue(name,type,data){
  var hive=jplopsoft_REGEDIT.hive,key=jplopsoft_REGEDIT.key;
  jplopsoft_api('reg_open_key','POST',{hive:hive,key:key,desired_access:'KEY_WRITE'},true,function(err,out){
    var h;
    if(err){alert(err.message);return;}
    h=out.handle;
    jplopsoft_api('reg_set_value','POST',{handle:h,name:name,type:type,data:data},true,function(err2){
      jplopsoft_api('reg_close_key','POST',{handle:h},true,function(){});
      if(err2){alert(err2.message);return;}
      jplopsoft_regeditLoad();
    });
  });
}

function jplopsoft_regeditEditValue(){
  var rec=jplopsoft_regeditCurrentKeyRecord(),name=jplopsoft_REGEDIT.selectedValue,v,data,type;
  if(name===null||!rec||!rec.values||!rec.values.hasOwnProperty(name))return;
  v=rec.values[name]||{};type=String(v.type||'REG_SZ');
  data=window.prompt('編輯 '+(name===''?'(預設)':name)+'\\n類型：'+type,String(typeof v.data==='undefined'?'':v.data));
  if(data===null)return;
  if(type==='REG_DWORD')data=parseInt(data,10)||0;
  jplopsoft_regeditWriteValue(name,type,data);
}

function jplopsoft_regeditNewValue(){
  var name=window.prompt('新增值名稱\\n留空代表 (預設)','');
  if(name===null)return;
  var type=window.prompt('值類型：REG_SZ / REG_DWORD / REG_BINARY','REG_SZ');
  if(type===null)return;
  type=String(type||'REG_SZ').toUpperCase();
  if(type!=='REG_SZ'&&type!=='REG_DWORD'&&type!=='REG_BINARY'){alert('不支援的 Registry 類型。');return;}
  var data=window.prompt('值資料','');
  if(data===null)return;
  if(type==='REG_DWORD')data=parseInt(data,10)||0;
  jplopsoft_regeditWriteValue(String(name),type,data);
}

function jplopsoft_regeditNewKey(){
  var name=window.prompt('新增子機碼名稱','New Key');
  if(name===null||!jplopsoft_trim(name))return;
  name=jplopsoft_trim(name).replace(/[\/]+/g,'\\');
  var key=jplopsoft_REGEDIT.key?jplopsoft_REGEDIT.key+'\\'+name:name,hive=jplopsoft_REGEDIT.hive;
  jplopsoft_api('reg_open_key','POST',{hive:hive,key:key,desired_access:'KEY_WRITE'},true,function(err,out){
    if(err){alert(err.message);return;}
    jplopsoft_api('reg_close_key','POST',{handle:out.handle},true,function(){});
    jplopsoft_REGEDIT.key=String(key).toLowerCase();
    jplopsoft_regeditLoad();
  });
}

function jplopsoft_regeditDeleteValue(){
  var name=jplopsoft_REGEDIT.selectedValue;
  if(name===null)return;
  if(!window.confirm('要刪除 Registry 值「'+(name===''?'(預設)':name)+'」嗎？'))return;
  jplopsoft_api('reg_delete_value','POST',{hive:jplopsoft_REGEDIT.hive,key:jplopsoft_REGEDIT.key,name:name},true,function(err){
    if(err){alert(err.message);return;}
    jplopsoft_REGEDIT.selectedValue=null;jplopsoft_regeditLoad();
  });
}

function jplopsoft_regeditDeleteKey(){
  var key=jplopsoft_REGEDIT.key,parent;
  if(!key){alert('不能刪除 Registry Hive 根節點。');return;}
  if(!window.confirm('要刪除機碼與全部子機碼嗎？\\n\\n'+jplopsoft_regeditFullPath(jplopsoft_REGEDIT.hive,key)))return;
  jplopsoft_api('reg_delete_key','POST',{hive:jplopsoft_REGEDIT.hive,key:key},true,function(err){
    if(err){alert(err.message);return;}
    parent=key.indexOf('\\')>=0?key.substring(0,key.lastIndexOf('\\')):'';
    jplopsoft_REGEDIT.key=parent;jplopsoft_REGEDIT.selectedValue=null;jplopsoft_regeditLoad();
  });
}

function jplopsoft_closeRegedit(){
  var h=jplopsoft_REGEDIT.hwnd;
  jplopsoft_REGEDIT.hwnd=0;jplopsoft_REGEDIT.snapshot=null;jplopsoft_REGEDIT.selectedValue=null;
  if(h)jplopsoft_DestroyWindow(h);
}

function jplopsoft_openRegedit(){
  var h,client,toolbar,b,path,main,tree,values,status;
  if(jplopsoft_REGEDIT.hwnd&&jplopsoft_user32GetRecord(jplopsoft_REGEDIT.hwnd)){
    jplopsoft_ShowWindow(jplopsoft_REGEDIT.hwnd,jplopsoft_SW_RESTORE);jplopsoft_regeditLoad();return;
  }
  h=jplopsoft_CreateWindowEx(
    jplopsoft_WS_EX_APPWINDOW,'ExOS.Window','登錄編輯程式',
    jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,
    90,55,1040,700,null,null,null,
    {appId:'regedit',icon:'regedit',windowClass:'jplopsoft_regedit-window',taskbar:true,
     wndProc:function(hwnd,msg){if(msg===jplopsoft_WM_CLOSE){jplopsoft_closeRegedit();return 0;}return null;}}
  );
  if(!h)return;
  jplopsoft_REGEDIT.hwnd=h;client=jplopsoft_GetClientElement(h);client.className+=' jplopsoft_regedit-client';

  toolbar=document.createElement('div');toolbar.className='jplopsoft_app-toolbar';
  function add(text,fn){var x=document.createElement('button');x.type='button';x.className='jplopsoft_btn jplopsoft_small';x.textContent=text;x.onclick=fn;toolbar.appendChild(x);}
  add('重新整理',jplopsoft_regeditLoad);add('新增機碼',jplopsoft_regeditNewKey);add('新增值',jplopsoft_regeditNewValue);add('刪除值',jplopsoft_regeditDeleteValue);add('刪除機碼',jplopsoft_regeditDeleteKey);
  path=document.createElement('div');path.id=jplopsoft_REGEDIT.pathId;path.className='jplopsoft_regedit-path';toolbar.appendChild(path);client.appendChild(toolbar);

  main=document.createElement('div');main.className='jplopsoft_regedit-main';
  tree=document.createElement('div');tree.id=jplopsoft_REGEDIT.treeId;tree.className='jplopsoft_regedit-tree';main.appendChild(tree);
  values=document.createElement('div');values.id=jplopsoft_REGEDIT.valuesId;values.className='jplopsoft_regedit-values';main.appendChild(values);
  client.appendChild(main);

  status=document.createElement('div');status.id=jplopsoft_REGEDIT.statusId;status.className='jplopsoft_app-status';client.appendChild(status);
  jplopsoft_regeditLoad();
}

/* =========================================================================
 * Disk Management
 * ========================================================================= */
var jplopsoft_DISKMGMT={hwnd:0,bodyId:'jplopsoft_diskmgmtBody',statusId:'jplopsoft_diskmgmtStatus'};

function jplopsoft_diskmgmtRender(out){
  var host=jplopsoft_el(jplopsoft_DISKMGMT.bodyId),
      card,head,row,icon,main,title,sub,usage,used,label,table,tbody,tr,th,td,status,pct,
      quotaEnabled=parseInt(out.quota_enabled,10)===1,
      quota=parseInt(out.user_quota_bytes,10)||0,
      quotaUsed=parseInt(out.user_quota_used_bytes,10)||0,
      quotaFree=parseInt(out.user_quota_free_bytes,10)||0,
      cryptoText=String(state.cryptoBadgeText||''),
      cryptoSources=String(state.cryptoBadgeSources||'');

  if(!host)return;
  host.innerHTML='';

  if(!cryptoText){
    if(typeof jplopsoft_cryptoReady==='function'&&typeof jplopsoft_osReady==='function'&&jplopsoft_cryptoReady()&&jplopsoft_osReady()){
      cryptoText='EXES + MD3 + Base64 + SHA1 + ExFS OS OK';
    }else{
      cryptoText='Runtime 狀態未確認';
    }
  }

  pct=quotaEnabled&&quota>0?Math.min(100,Math.max(0,(quotaUsed/quota)*100)):0;

  card=document.createElement('div');card.className='jplopsoft_disk-card';
  head=document.createElement('div');head.className='jplopsoft_disk-card-head';head.textContent='磁碟 0 — ExFS 虛擬磁碟';card.appendChild(head);
  row=document.createElement('div');row.className='jplopsoft_disk-volume-row';
  icon=document.createElement('span');icon.className='jplopsoft_disk-icon';icon.setAttribute('data-exfs-svg','disk');icon.setAttribute('data-exfs-svg-size','54');row.appendChild(icon);
  main=document.createElement('div');main.className='jplopsoft_disk-volume-main';
  title=document.createElement('div');title.className='jplopsoft_disk-volume-title';title.textContent=out.drive+'  '+out.label;main.appendChild(title);

  sub=document.createElement('div');sub.className='jplopsoft_disk-volume-sub';
  sub.textContent=out.filesystem+' ｜ 健康狀態：正常 ｜ 動態配置'+
    (quotaEnabled?(' ｜ 使用者配額剩餘 '+jplopsoft_formatFileSize(quotaFree)):' ｜ 使用者配額：未啟用');
  main.appendChild(sub);

  usage=document.createElement('div');usage.className='jplopsoft_disk-usage';
  used=document.createElement('div');used.className='jplopsoft_disk-used';
  used.style.width=(quotaEnabled?pct:0).toFixed(2)+'%';
  usage.appendChild(used);
  label=document.createElement('div');label.className='jplopsoft_disk-usage-label';
  label.textContent=quotaEnabled
    ?('使用者配額已使用 '+pct.toFixed(1)+'%')
    :'虛擬磁碟為動態配置，沒有固定 1 GB 容量';
  usage.appendChild(label);
  main.appendChild(usage);

  row.appendChild(main);card.appendChild(row);host.appendChild(card);
  jplopsoft_applySvgIcons(card);

  table=document.createElement('table');table.className='jplopsoft_diskmgmt-table';tbody=document.createElement('tbody');
  [
    ['裝置',out.device],
    ['Volume Serial',out.serial],
    ['檔案系統',out.filesystem],
    ['配置方式','動態配置（Directory-backed，非固定大小 VHD）'],
    ['虛擬磁碟容量','動態配置，不預設固定容量'],
    ['Quota Model',out.quota_model],
    ['使用者配額',quotaEnabled?jplopsoft_formatFileSize(quota):'未啟用（Unlimited）'],
    ['配額已使用',jplopsoft_formatFileSize(quotaUsed)],
    ['配額剩餘',quotaEnabled?jplopsoft_formatFileSize(quotaFree):'不適用'],
    ['全部檔案邏輯大小',jplopsoft_formatFileSize(out.logical_all_files_bytes)],
    ['加密規範',cryptoText],
    ['Runtime 來源',cryptoSources||'—'],
    ['檔案數',out.file_count],
    ['資料夾數',out.folder_count],
    ['Reparse Points',out.reparse_count],
    ['歷史版本',out.version_count],
    ['垃圾桶 Root',out.trash_root_count],
    ['Commit Seq',out.commit_seq]
  ].forEach(function(r){
    tr=document.createElement('tr');
    th=document.createElement('th');th.textContent=r[0];
    td=document.createElement('td');td.textContent=String(r[1]);
    tr.appendChild(th);tr.appendChild(td);tbody.appendChild(tr);
  });
  table.appendChild(tbody);host.appendChild(table);

  var note=document.createElement('div');
  note.className='jplopsoft_disk-note';
  note.textContent='ExFS C: 是目錄式動態虛擬磁碟。先前看到的 1 GB 是 QuotaFilter 的預設使用者配額，不是磁碟實體可用空間；os14 起預設不啟用配額。';
  host.appendChild(note);

  status=jplopsoft_el(jplopsoft_DISKMGMT.statusId);
  if(status)status.textContent='EXFS_VIRTUAL_DISK1 ｜ DYNAMIC_DIRECTORY_BACKED ｜ '+out.drive+' ｜ '+out.filesystem;
}

function jplopsoft_diskmgmtLoad(){
  var status=jplopsoft_el(jplopsoft_DISKMGMT.statusId);
  if(status)status.textContent='正在讀取磁碟資訊…';
  jplopsoft_api('disk_info','GET',null,true,function(err,out){
    if(err){if(status)status.textContent='讀取失敗：'+err.message;return;}
    jplopsoft_diskmgmtRender(out);
  });
}

function jplopsoft_closeDiskManager(){
  var h=jplopsoft_DISKMGMT.hwnd;jplopsoft_DISKMGMT.hwnd=0;if(h)jplopsoft_DestroyWindow(h);
}

function jplopsoft_openDiskManager(){
  var h,client,toolbar,b,body,status;
  jplopsoft_dwmNormalizeRootStacking();
  if(jplopsoft_DISKMGMT.hwnd&&jplopsoft_user32GetRecord(jplopsoft_DISKMGMT.hwnd)){
    h=jplopsoft_DISKMGMT.hwnd;jplopsoft_ShowWindow(h,jplopsoft_SW_RESTORE);jplopsoft_wmPlaceWindowAboveOverlay(h,'jplopsoft_exconfigBackdrop');jplopsoft_diskmgmtLoad();
    window.setTimeout(function(){if(jplopsoft_DISKMGMT.hwnd)jplopsoft_wmPlaceWindowAboveOverlay(jplopsoft_DISKMGMT.hwnd,'jplopsoft_exconfigBackdrop');},0);
    window.setTimeout(function(){if(jplopsoft_DISKMGMT.hwnd)jplopsoft_wmPlaceWindowAboveOverlay(jplopsoft_DISKMGMT.hwnd,'jplopsoft_exconfigBackdrop');},120);
    return;
  }
  h=jplopsoft_CreateWindowEx(jplopsoft_WS_EX_APPWINDOW,'ExOS.Window','磁碟管理員',jplopsoft_WS_OVERLAPPEDWINDOW|jplopsoft_WS_VISIBLE,110,70,980,640,null,null,null,{appId:'diskmgmt',icon:'disk',windowClass:'jplopsoft_diskmgmt-window',taskbar:true,wndProc:function(hwnd,msg){if(msg===jplopsoft_WM_CLOSE){jplopsoft_closeDiskManager();return 0;}return null;}});
  if(!h)return;
  jplopsoft_DISKMGMT.hwnd=h;client=jplopsoft_GetClientElement(h);client.className+=' jplopsoft_diskmgmt-client';
  toolbar=document.createElement('div');toolbar.className='jplopsoft_app-toolbar';
  b=document.createElement('button');b.type='button';b.className='jplopsoft_btn jplopsoft_small';b.textContent='重新整理';b.onclick=jplopsoft_diskmgmtLoad;toolbar.appendChild(b);
  b=document.createElement('button');b.type='button';b.className='jplopsoft_btn jplopsoft_small';b.textContent='3D 拓樸';b.onclick=jplopsoft_openVolume3D;toolbar.appendChild(b);client.appendChild(toolbar);
  body=document.createElement('div');body.id=jplopsoft_DISKMGMT.bodyId;body.className='jplopsoft_diskmgmt-body';client.appendChild(body);
  status=document.createElement('div');status.id=jplopsoft_DISKMGMT.statusId;status.className='jplopsoft_app-status';client.appendChild(status);
  jplopsoft_wmPlaceWindowAboveOverlay(h,'jplopsoft_exconfigBackdrop');jplopsoft_diskmgmtLoad();
  window.setTimeout(function(){if(jplopsoft_DISKMGMT.hwnd)jplopsoft_wmPlaceWindowAboveOverlay(jplopsoft_DISKMGMT.hwnd,'jplopsoft_exconfigBackdrop');},0);
  window.setTimeout(function(){if(jplopsoft_DISKMGMT.hwnd)jplopsoft_wmPlaceWindowAboveOverlay(jplopsoft_DISKMGMT.hwnd,'jplopsoft_exconfigBackdrop');},80);
  window.setTimeout(function(){if(jplopsoft_DISKMGMT.hwnd)jplopsoft_wmPlaceWindowAboveOverlay(jplopsoft_DISKMGMT.hwnd,'jplopsoft_exconfigBackdrop');},220);
}


function jplopsoft_taskbarFindMultiEditorByAppId(appId){
  var k,rec;
  for(k in jplopsoft_MULTI_EDITORS){
    if(!jplopsoft_MULTI_EDITORS.hasOwnProperty(k))continue;
    rec=jplopsoft_MULTI_EDITORS[k];
    if(rec&&rec.appId===appId)return rec;
  }
  return null;
}

function jplopsoft_taskbarFindCmdByAppId(appId){
  var k,c;
  for(k in jplopsoft_CMD_INSTANCES){
    if(!jplopsoft_CMD_INSTANCES.hasOwnProperty(k))continue;
    c=jplopsoft_CMD_INSTANCES[k];
    if(c&&c.appId===appId)return c;
  }
  return null;
}

function jplopsoft_taskbarCloseAppWindow(appId){
  var rec,k,editor,cmd;
  appId=String(appId||'');
  if(!appId)return false;

  if(appId.indexOf('editor_')===0){
    editor=jplopsoft_taskbarFindMultiEditorByAppId(appId);
    if(editor){jplopsoft_multiEditorClose(editor,false);return true;}
  }

  if(appId==='document'){jplopsoft_closeModal();return true;}
  if(appId==='explorer'){jplopsoft_wmCloseExplorer(true);return true;}
  if(appId==='cmd'){jplopsoft_wmCloseCmd();return true;}

  if(appId.indexOf('cmd_')===0){
    cmd=jplopsoft_taskbarFindCmdByAppId(appId);
    if(cmd){jplopsoft_cmdCloseInstance(cmd.instanceId,false);return true;}
  }

  if(appId==='control'){jplopsoft_closeExconfig();return true;}
  if(appId==='security'){
    if(typeof jplopsoft_closeSecurityScreen==='function')jplopsoft_closeSecurityScreen();
    return true;
  }
  if(appId==='trash'){jplopsoft_closeTrash();return true;}
  if(appId==='volume3d'){jplopsoft_closeVolume3D();return true;}
  if(appId==='taskmgr'){jplopsoft_closeTaskManager();return true;}
  if(appId==='regedit'){jplopsoft_closeRegedit();return true;}
  if(appId==='diskmgmt'){jplopsoft_closeDiskManager();return true;}
  if(appId==='calc'){jplopsoft_closeCalculator();return true;}

  for(k in jplopsoft_USER32.windows){
    if(!jplopsoft_USER32.windows.hasOwnProperty(k))continue;
    rec=jplopsoft_USER32.windows[k];
    if(rec&&rec.appId===appId&&rec.taskbar!==false){
      jplopsoft_SendMessage(rec.hwnd,jplopsoft_WM_CLOSE,0,0);
      return true;
    }
  }

  return false;
}

function jplopsoft_taskbarContextAppId(taskbar,target){
  var n=target,appId;
  while(n&&n!==taskbar){
    if(n.getAttribute){
      appId=String(n.getAttribute('data-app-id')||'');
      if(appId)return appId;
    }
    n=n.parentNode;
  }
  return '';
}

/* =========================================================================
 * Taskbar context menu
 * ========================================================================= */
function jplopsoft_taskbarContextMenuEnsure(appId){
  var menu=jplopsoft_el('jplopsoft_taskbarContextMenu'),icon,text,sep;
  if(!menu){
    menu=document.createElement('div');
    menu.id='jplopsoft_taskbarContextMenu';
    menu.className='jplopsoft_taskbar-context-menu jplopsoft_hidden';
    menu.setAttribute('role','menu');
    document.body.appendChild(menu);
  }

  menu.innerHTML='';
  appId=String(appId||'');
  menu.setAttribute('data-context-app-id',appId);

  function add(label,svg,fn){
    var x=document.createElement('button');
    x.type='button';
    x.className='jplopsoft_taskbar-context-item';

    icon=document.createElement('span');
    icon.className='jplopsoft_taskbar-context-icon';
    icon.setAttribute('data-exfs-svg',svg);
    icon.setAttribute('data-exfs-svg-size','18');
    x.appendChild(icon);

    text=document.createElement('span');
    text.textContent=label;
    x.appendChild(text);

    x.onclick=function(){
      jplopsoft_hideTaskbarContextMenu();
      fn();
    };

    menu.appendChild(x);
  }

  add('顯示桌面','desktop',jplopsoft_wmShowDesktop);
  add('啟動工作管理員','taskmgr',function(){jplopsoft_openTaskManager(false);});

  if(appId){
    sep=document.createElement('div');
    sep.className='jplopsoft_taskbar-context-separator';
    sep.setAttribute('role','separator');
    menu.appendChild(sep);

    add('關閉視窗','close',function(){
      jplopsoft_taskbarCloseAppWindow(appId);
    });
  }

  jplopsoft_applySvgIcons(menu);
  return menu;
}

function jplopsoft_hideTaskbarContextMenu(){
  var menu=jplopsoft_el('jplopsoft_taskbarContextMenu');if(menu)menu.className='jplopsoft_taskbar-context-menu jplopsoft_hidden';
}

function jplopsoft_showTaskbarContextMenu(e,appId){
  var menu,x,y,w,h,vw,vh;
  e=e||window.event;
  appId=String(appId||'');

  if(e.preventDefault)e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
  e.returnValue=false;
  e.cancelBubble=true;

  menu=jplopsoft_taskbarContextMenuEnsure(appId);
  x=typeof e.clientX==='number'?e.clientX:0;
  y=typeof e.clientY==='number'?e.clientY:0;

  menu.className='jplopsoft_taskbar-context-menu';
  menu.style.left='0px';
  menu.style.top='0px';

  w=menu.offsetWidth||220;
  h=menu.offsetHeight||(appId?120:80);
  vw=document.documentElement.clientWidth||window.innerWidth||1024;
  vh=document.documentElement.clientHeight||window.innerHeight||768;

  if(x+w>vw)x=vw-w-4;
  if(y+h>vh)y=vh-h-4;
  if(x<0)x=0;
  if(y<0)y=0;

  menu.style.left=Math.round(x)+'px';
  menu.style.top=Math.round(y)+'px';
  return false;
}

function jplopsoft_RegisterExFSNativeWindows(){
  var hwnd;

  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_explorerWindow')){
    hwnd=jplopsoft_AdoptWindow({
      className:'ExFS.Explorer',
      windowId:'jplopsoft_explorerWindow',
      titlebarId:'jplopsoft_explorerTitlebar',
      titleId:'jplopsoft_explorerWindowTitle',
      clientIds:['jplopsoft_mainContent'],
      appId:'explorer',icon:'explorer',displayMode:'flex',
      style:jplopsoft_WS_OVERLAPPEDWINDOW,
      exStyle:jplopsoft_WS_EX_APPWINDOW,
      minButtonId:'jplopsoft_explorerMinBtn',
      maxButtonId:'jplopsoft_explorerMaxBtn',
      closeButtonId:'jplopsoft_explorerCloseBtn',
      onMinimize:function(){jplopsoft_wmMinimize('jplopsoft_explorerWindow','explorer',true);},
      onMaximize:function(){jplopsoft_wmSetMaximized('jplopsoft_explorerWindow',true);jplopsoft_wmActivate('jplopsoft_explorerWindow','explorer');},
      onRestore:function(){jplopsoft_wmSetMaximized('jplopsoft_explorerWindow',false);jplopsoft_wmRestoreExplorerStable();},
      onClose:function(){jplopsoft_wmCloseExplorer(true);}
    });
  }

  /* os16: cmd.exe is now CreateProcess/CreateWindowEx multi-instance only. */


  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_documentWindow')){
    hwnd=jplopsoft_AdoptWindow({
      className:'ExFS.DocumentWindow',
      overlay:true,backdropId:'jplopsoft_modalBackdrop',
      windowId:'jplopsoft_documentWindow',
      titlebarId:'jplopsoft_documentTitlebar',
      titleId:'jplopsoft_modalTitle',
      clientIds:['jplopsoft_modalBody'],
      appId:'document',icon:'html',
      style:jplopsoft_WS_OVERLAPPEDWINDOW,
      taskbar:false,
      minButtonId:'jplopsoft_modalMinBtn',
      maxButtonId:'jplopsoft_modalMaxBtn',
      closeButtonId:'jplopsoft_modalCloseTop',
      onMinimize:function(){jplopsoft_taskbarMinimizeDocument();},
      onMaximize:function(){jplopsoft_toggleMax();},
      onRestore:function(){jplopsoft_toggleMax();},
      onClose:function(){jplopsoft_closeModal();}
    });
  }

  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_controlWindow')){
    hwnd=jplopsoft_AdoptWindow({
      className:'ExFS.ControlPanel',
      overlay:true,backdropId:'jplopsoft_exconfigBackdrop',
      windowId:'jplopsoft_controlWindow',
      titlebarId:'jplopsoft_controlTitlebar',
      titleId:'jplopsoft_exconfigTitle',
      clientId:'jplopsoft_exconfigBody',
      clientIds:['jplopsoft_exconfigBody'],
      appId:'control',icon:'control',
      style:jplopsoft_WS_OVERLAPPEDWINDOW,
      exStyle:jplopsoft_WS_EX_APPWINDOW,
      minButtonId:'jplopsoft_exconfigMinBtn',
      maxButtonId:'jplopsoft_exconfigMaxBtn',
      closeButtonId:'jplopsoft_exconfigCloseTop',
      onMinimize:function(){jplopsoft_wmOverlayMinimize('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');},
      onMaximize:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_controlWindow',true);jplopsoft_wmActivateOverlay('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');},
      onRestore:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_controlWindow',false);jplopsoft_wmOverlayRestore('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');},
      onClose:function(){jplopsoft_closeExconfig();}
    });
  }

  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_securityWindow')){
    hwnd=jplopsoft_AdoptWindow({
      className:'ExFS.Security',
      overlay:true,backdropId:'jplopsoft_securityBackdrop',
      windowId:'jplopsoft_securityWindow',
      titlebarId:'jplopsoft_securityTitlebar',
      appId:'security',icon:'security',
      style:jplopsoft_WS_OVERLAPPEDWINDOW,
      exStyle:jplopsoft_WS_EX_APPWINDOW,
      minButtonId:'jplopsoft_securityMinBtn',
      maxButtonId:'jplopsoft_securityMaxBtn',
      closeButtonId:'jplopsoft_securityCloseTop',
      onMinimize:function(){jplopsoft_wmOverlayMinimize('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');},
      onMaximize:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_securityWindow',true);jplopsoft_wmActivateOverlay('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');},
      onRestore:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_securityWindow',false);jplopsoft_wmOverlayRestore('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');},
      onClose:function(){jplopsoft_closeSecurityScreen();}
    });
  }

  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_trashWindow')){
    hwnd=jplopsoft_AdoptWindow({
      className:'ExFS.RecycleBin',
      overlay:true,backdropId:'jplopsoft_trashBackdrop',
      windowId:'jplopsoft_trashWindow',
      titlebarId:'jplopsoft_trashTitlebar',
      appId:'trash',icon:'trash',
      style:jplopsoft_WS_OVERLAPPEDWINDOW,
      exStyle:jplopsoft_WS_EX_APPWINDOW,
      minButtonId:'jplopsoft_trashMinBtn',
      maxButtonId:'jplopsoft_trashMaxBtn',
      closeButtonId:'jplopsoft_trashCloseTop',
      onMinimize:function(){jplopsoft_wmOverlayMinimize('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');},
      onMaximize:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_trashWindow',true);jplopsoft_wmActivateOverlay('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');},
      onRestore:function(){jplopsoft_wmSetOverlayMaximized('jplopsoft_trashWindow',false);jplopsoft_wmOverlayRestore('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');},
      onClose:function(){jplopsoft_closeTrash();}
    });
  }

  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_propertiesWindow')){
    hwnd=jplopsoft_AdoptWindow({
      className:'ExFS.Properties',
      overlay:true,backdropId:'jplopsoft_propertiesBackdrop',
      windowId:'jplopsoft_propertiesWindow',
      titlebarId:'jplopsoft_propertiesTitlebar',
      titleId:'jplopsoft_propertiesTitle',
      appId:'properties',icon:'properties',
      style:jplopsoft_WS_CAPTION|jplopsoft_WS_SYSMENU|jplopsoft_WS_THICKFRAME,
      exStyle:jplopsoft_WS_EX_TOOLWINDOW,
      taskbar:false,
      closeButtonId:'jplopsoft_propertiesCloseTop',
      onClose:function(){jplopsoft_closeProperties();}
    });
  }

  if(!jplopsoft_user32GetHwndByElementId('jplopsoft_volume3dWindow')){
    hwnd=jplopsoft_AdoptWindow({
      className:'ExFS.Volume3D',
      overlay:true,backdropId:'jplopsoft_volume3dBackdrop',
      windowId:'jplopsoft_volume3dWindow',
      titlebarId:'jplopsoft_volume3dTitlebar',
      appId:'volume3d',icon:'file',
      style:jplopsoft_WS_CAPTION|jplopsoft_WS_SYSMENU|jplopsoft_WS_THICKFRAME,
      exStyle:jplopsoft_WS_EX_TOOLWINDOW,
      taskbar:false,
      closeButtonId:'jplopsoft_volume3dCloseBtn',
      onClose:function(){jplopsoft_closeVolume3D();}
    });
  }
}

function jplopsoft_bindWindowManager(){
  var explorer=jplopsoft_el('jplopsoft_explorerWindow'),
      cmd=jplopsoft_el('jplopsoft_cmdWindow'),
      doc=jplopsoft_el('jplopsoft_documentWindow'),
      control=jplopsoft_el('jplopsoft_controlWindow'),
      security=jplopsoft_el('jplopsoft_securityWindow'),
      desktopComputer=jplopsoft_el('jplopsoft_desktopComputerIcon'),
      desktopCmd=jplopsoft_el('jplopsoft_desktopCmdIcon'),
      desktopTrash=jplopsoft_el('jplopsoft_desktopTrashIcon'),
      desktopSurface=jplopsoft_el('jplopsoft_desktopSurface');

  jplopsoft_dwmNormalizeRootStacking();
  if(explorer)jplopsoft_explorerPortalToRoot(explorer);
  jplopsoft_applyDesktopWallpaper();

  if(explorer){
    explorer.onmousedown=function(){jplopsoft_wmActivate('jplopsoft_explorerWindow','explorer');};
    jplopsoft_wmMakeDraggable('jplopsoft_explorerWindow','jplopsoft_explorerTitlebar');
  }
  if(cmd){
    cmd.onmousedown=function(){jplopsoft_wmActivate('jplopsoft_cmdWindow','cmd');};
    jplopsoft_wmMakeDraggable('jplopsoft_cmdWindow','jplopsoft_cmdTitlebar');
  }
  if(doc){
    doc.onmousedown=function(){jplopsoft_wmActivateOverlay('jplopsoft_modalBackdrop','jplopsoft_documentWindow','document');};
    jplopsoft_wmMakeDraggable('jplopsoft_documentWindow','jplopsoft_documentTitlebar');
  }
  if(control){
    control.onmousedown=function(){jplopsoft_wmActivateOverlay('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');};
    jplopsoft_wmMakeDraggable('jplopsoft_controlWindow','jplopsoft_controlTitlebar');
  }
  if(security){
    security.onmousedown=function(){jplopsoft_wmActivateOverlay('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');};
    jplopsoft_wmMakeDraggable('jplopsoft_securityWindow','jplopsoft_securityTitlebar');
  }
  if(jplopsoft_el('jplopsoft_trashWindow')){
    jplopsoft_el('jplopsoft_trashWindow').onmousedown=function(){jplopsoft_wmActivateOverlay('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');};
    jplopsoft_wmMakeDraggable('jplopsoft_trashWindow','jplopsoft_trashTitlebar');
  }
  if(jplopsoft_el('jplopsoft_volume3dWindow')){
    jplopsoft_el('jplopsoft_volume3dWindow').onmousedown=function(){jplopsoft_wmActivateOverlay('jplopsoft_volume3dBackdrop','jplopsoft_volume3dWindow','volume3d');};
    jplopsoft_wmMakeDraggable('jplopsoft_volume3dWindow','jplopsoft_volume3dTitlebar');
  }

  if(jplopsoft_el('jplopsoft_explorerMinBtn'))jplopsoft_el('jplopsoft_explorerMinBtn').onclick=function(){jplopsoft_wmMinimize('jplopsoft_explorerWindow','explorer',true);};
  if(jplopsoft_el('jplopsoft_explorerMaxBtn'))jplopsoft_el('jplopsoft_explorerMaxBtn').onclick=function(){jplopsoft_wmToggleMax('jplopsoft_explorerWindow');jplopsoft_wmActivate('jplopsoft_explorerWindow','explorer');};
  if(jplopsoft_el('jplopsoft_explorerCloseBtn'))jplopsoft_el('jplopsoft_explorerCloseBtn').onclick=function(){jplopsoft_wmCloseExplorer(true);};

  if(jplopsoft_el('jplopsoft_cmdMinBtn'))jplopsoft_el('jplopsoft_cmdMinBtn').onclick=jplopsoft_wmMinimizeCmd;
  if(jplopsoft_el('jplopsoft_cmdMaxBtn'))jplopsoft_el('jplopsoft_cmdMaxBtn').onclick=function(){jplopsoft_wmToggleMax('jplopsoft_cmdWindow');jplopsoft_wmActivate('jplopsoft_cmdWindow','cmd');};
  if(jplopsoft_el('jplopsoft_cmdCloseBtn'))jplopsoft_el('jplopsoft_cmdCloseBtn').onclick=jplopsoft_wmCloseCmd;

  if(jplopsoft_el('jplopsoft_modalMinBtn'))jplopsoft_el('jplopsoft_modalMinBtn').onclick=jplopsoft_taskbarMinimizeDocument;

  if(jplopsoft_el('jplopsoft_exconfigMinBtn'))jplopsoft_el('jplopsoft_exconfigMinBtn').onclick=function(){jplopsoft_wmOverlayMinimize('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');};
  if(jplopsoft_el('jplopsoft_exconfigMaxBtn'))jplopsoft_el('jplopsoft_exconfigMaxBtn').onclick=function(){jplopsoft_wmToggleOverlayMax('jplopsoft_controlWindow');jplopsoft_wmActivateOverlay('jplopsoft_exconfigBackdrop','jplopsoft_controlWindow','control');};

  if(jplopsoft_el('jplopsoft_securityMinBtn'))jplopsoft_el('jplopsoft_securityMinBtn').onclick=function(){jplopsoft_wmOverlayMinimize('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');};
  if(jplopsoft_el('jplopsoft_securityMaxBtn'))jplopsoft_el('jplopsoft_securityMaxBtn').onclick=function(){jplopsoft_wmToggleOverlayMax('jplopsoft_securityWindow');jplopsoft_wmActivateOverlay('jplopsoft_securityBackdrop','jplopsoft_securityWindow','security');};
  if(jplopsoft_el('jplopsoft_securityCloseTop'))jplopsoft_el('jplopsoft_securityCloseTop').onclick=jplopsoft_closeSecurityScreen;

  if(jplopsoft_el('jplopsoft_trashMinBtn'))jplopsoft_el('jplopsoft_trashMinBtn').onclick=function(){jplopsoft_wmOverlayMinimize('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');};
  if(jplopsoft_el('jplopsoft_trashMaxBtn'))jplopsoft_el('jplopsoft_trashMaxBtn').onclick=function(){jplopsoft_wmToggleOverlayMax('jplopsoft_trashWindow');jplopsoft_wmActivateOverlay('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');};

  if(desktopComputer)desktopComputer.ondblclick=function(){jplopsoft_openMyComputer();};
  if(desktopComputer)desktopComputer.onclick=function(e){if(e&&e.detail===1)return;};
  if(desktopCmd)desktopCmd.ondblclick=jplopsoft_wmOpenCmd;
  if(desktopTrash)desktopTrash.ondblclick=jplopsoft_openTrash;
  if(desktopSurface)desktopSurface.oncontextmenu=function(e){
    e=e||window.event;
    if(e.preventDefault)e.preventDefault();
    e.returnValue=false;
    jplopsoft_hideExfsContextMenu();
    return false;
  };

  if(window.addEventListener){
    window.addEventListener('resize',function(){
      if(jplopsoft_EXPLORER_LIFECYCLE&&jplopsoft_EXPLORER_LIFECYCLE.desiredVisible)window.setTimeout(jplopsoft_explorerHealthCheck,0);
    },false);
  }else if(window.attachEvent){
    window.attachEvent('onresize',function(){
      if(jplopsoft_EXPLORER_LIFECYCLE&&jplopsoft_EXPLORER_LIFECYCLE.desiredVisible)window.setTimeout(jplopsoft_explorerHealthCheck,0);
    });
  }

  jplopsoft_applySvgIcons(document);

  if(jplopsoft_el('jplopsoft_explorerTitlebar'))jplopsoft_el('jplopsoft_explorerTitlebar').ondblclick=function(e){if(jplopsoft_wmCanDragTarget(e.target||e.srcElement))jplopsoft_wmToggleMax('jplopsoft_explorerWindow');};
  if(jplopsoft_el('jplopsoft_cmdTitlebar'))jplopsoft_el('jplopsoft_cmdTitlebar').ondblclick=function(e){if(jplopsoft_wmCanDragTarget(e.target||e.srcElement))jplopsoft_wmToggleMax('jplopsoft_cmdWindow');};

  /* user32 owns all Non-Client Area controls from this point onward. */
  jplopsoft_RegisterExFSNativeWindows();
}

function jplopsoft_taskbarDocumentFormatInfo(fmt){
  fmt=String(fmt||'').toLowerCase();
  if(fmt==='csv')return{icon:'csv',app:'CSV 試算表'};
  if(fmt==='txt')return{icon:'txt',app:'文字編輯器'};
  return{icon:'html',app:'HTML 編輯器'};
}

function jplopsoft_taskbarDocumentButton(){
  return jplopsoft_el('jplopsoft_taskbarDocumentApp');
}

function jplopsoft_taskbarSetDocumentApp(id,name,fmt){
  var host=jplopsoft_el('jplopsoft_taskbarApps'),btn=jplopsoft_taskbarDocumentButton(),
      info=jplopsoft_taskbarDocumentFormatInfo(fmt),icon,text,label;

  if(!host)return;

  if(!btn){
    btn=document.createElement('button');
    btn.id='jplopsoft_taskbarDocumentApp';
    btn.type='button';
    btn.className='jplopsoft_taskbar-app';
    btn.setAttribute('data-app-id','document');
    btn.setAttribute('aria-label','文件編輯器');
    btn.onclick=jplopsoft_taskbarToggleDocument;

    icon=document.createElement('span');
    icon.id='jplopsoft_taskbarDocumentIcon';
    icon.className='jplopsoft_taskbar-app-icon';
    btn.appendChild(icon);

    text=document.createElement('span');
    text.id='jplopsoft_taskbarDocumentText';
    text.className='jplopsoft_taskbar-app-text';
    btn.appendChild(text);

    host.appendChild(btn);
  }

  label=info.app+' - '+String(name||('#'+id));
  btn.setAttribute('data-node-id',String(parseInt(id,10)||0));
  btn.setAttribute('data-format',String(fmt||''));
  btn.title=label;
  btn.setAttribute('aria-label',label);

  icon=jplopsoft_el('jplopsoft_taskbarDocumentIcon');
  text=jplopsoft_el('jplopsoft_taskbarDocumentText');
  if(icon)jplopsoft_svgIconApply(icon,info.icon,18);
  if(text)text.textContent=label;

  jplopsoft_taskbarDocumentActivated();
}

function jplopsoft_taskbarRemoveDocumentApp(){
  var btn=jplopsoft_taskbarDocumentButton();
  if(btn&&btn.parentNode)btn.parentNode.removeChild(btn);
}

function jplopsoft_taskbarDocumentVisible(){
  var back=jplopsoft_el('jplopsoft_modalBackdrop');
  return !!(back&&back.style.display!=='none'&&back.offsetWidth>0);
}

function jplopsoft_taskbarDocumentActivated(){
  var btn=jplopsoft_taskbarDocumentButton();
  if(!btn)return;
  jplopsoft_wmDeactivateTaskButtons('document');
  btn.className='jplopsoft_taskbar-app jplopsoft_active';
  btn.setAttribute('aria-pressed','true');
  jplopsoft_wmActivateOverlay('jplopsoft_modalBackdrop','jplopsoft_documentWindow','document');
}

function jplopsoft_taskbarDocumentMinimized(){
  var btn=jplopsoft_taskbarDocumentButton();
  if(!btn)return;
  btn.className='jplopsoft_taskbar-app jplopsoft_minimized';
  btn.setAttribute('aria-pressed','false');
}

function jplopsoft_taskbarMinimizeDocument(){
  var back=jplopsoft_el('jplopsoft_modalBackdrop');
  if(!back||!jplopsoft_taskbarDocumentButton())return false;
  if(typeof jplopsoft_closeVersions==='function')jplopsoft_closeVersions();
  jplopsoft_documentWindowApplyMax(!!state.maximized);
  back.style.display='none';
  jplopsoft_taskbarDocumentMinimized();
  return true;
}

function jplopsoft_taskbarRestoreDocument(){
  var back=jplopsoft_el('jplopsoft_modalBackdrop');
  if(!back||!jplopsoft_taskbarDocumentButton()||!state.openId)return false;
  jplopsoft_documentWindowApplyMax(!!state.maximized);
  back.style.display='flex';
  jplopsoft_taskbarDocumentActivated();
  if(jplopsoft_isIE11Browser()){
    setTimeout(jplopsoft_ie11FitDocumentModal,0);
    setTimeout(jplopsoft_ie11FitDocumentModal,80);
  }
  return true;
}

function jplopsoft_taskbarToggleDocument(){
  if(jplopsoft_taskbarDocumentVisible())jplopsoft_taskbarMinimizeDocument();
  else jplopsoft_taskbarRestoreDocument();
}


/* =========================================================================
 * ExOS taskbar time / calendar flyout
 * ========================================================================= */
var jplopsoft_CALENDAR={visible:false,year:0,month:0,selectedYear:0,selectedMonth:0,selectedDay:0};
function jplopsoft_calendarPad2(n){n=parseInt(n,10)||0;return n<10?'0'+n:String(n);}
function jplopsoft_calendarWeekdayName(day){var a=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];day=parseInt(day,10)||0;return a[day]||'';}
function jplopsoft_calendarDateText(y,m,d){var dt=new Date(y,m,d);return y+'年'+(m+1)+'月'+d+'日 '+jplopsoft_calendarWeekdayName(dt.getDay());}
function jplopsoft_calendarSameDate(a,b){return !!(a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate());}
function jplopsoft_calendarBuildMonthCells(year,month){var first=new Date(year,month,1),start=new Date(year,month,1-first.getDay()),cells=[],i,d;for(i=0;i<42;i++){d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);cells.push({year:d.getFullYear(),month:d.getMonth(),day:d.getDate(),weekday:d.getDay(),currentMonth:d.getMonth()===month?1:0});}return cells;}
function jplopsoft_calendarUpdateLiveTime(){var now=new Date(),t=jplopsoft_el('jplopsoft_calendarLiveTime'),d=jplopsoft_el('jplopsoft_calendarLiveDate');if(t)t.textContent=jplopsoft_calendarPad2(now.getHours())+':'+jplopsoft_calendarPad2(now.getMinutes())+':'+jplopsoft_calendarPad2(now.getSeconds());if(d)d.textContent=jplopsoft_calendarDateText(now.getFullYear(),now.getMonth(),now.getDate());}
function jplopsoft_calendarRender(){var grid=jplopsoft_el('jplopsoft_calendarGrid'),label=jplopsoft_el('jplopsoft_calendarMonthLabel'),selected=jplopsoft_el('jplopsoft_calendarSelected'),cells,today=new Date(),i,c,b,cellDate,todayDate;if(!grid)return;if(!jplopsoft_CALENDAR.year){jplopsoft_CALENDAR.year=today.getFullYear();jplopsoft_CALENDAR.month=today.getMonth();}if(!jplopsoft_CALENDAR.selectedYear){jplopsoft_CALENDAR.selectedYear=today.getFullYear();jplopsoft_CALENDAR.selectedMonth=today.getMonth();jplopsoft_CALENDAR.selectedDay=today.getDate();}if(label)label.textContent=jplopsoft_CALENDAR.year+'年 '+(jplopsoft_CALENDAR.month+1)+'月';if(selected)selected.textContent=jplopsoft_calendarDateText(jplopsoft_CALENDAR.selectedYear,jplopsoft_CALENDAR.selectedMonth,jplopsoft_CALENDAR.selectedDay);cells=jplopsoft_calendarBuildMonthCells(jplopsoft_CALENDAR.year,jplopsoft_CALENDAR.month);grid.innerHTML='';todayDate=new Date(today.getFullYear(),today.getMonth(),today.getDate());for(i=0;i<cells.length;i++){c=cells[i];b=document.createElement('button');b.type='button';b.className='jplopsoft_calendar-day'+(c.currentMonth?'':' jplopsoft_other-month');b.textContent=String(c.day);b.setAttribute('role','gridcell');b.setAttribute('data-y',String(c.year));b.setAttribute('data-m',String(c.month));b.setAttribute('data-d',String(c.day));b.title=jplopsoft_calendarDateText(c.year,c.month,c.day);cellDate=new Date(c.year,c.month,c.day);if(jplopsoft_calendarSameDate(cellDate,todayDate)){b.className+=' jplopsoft_today';b.setAttribute('aria-current','date');}if(c.year===jplopsoft_CALENDAR.selectedYear&&c.month===jplopsoft_CALENDAR.selectedMonth&&c.day===jplopsoft_CALENDAR.selectedDay){b.className+=' jplopsoft_selected';b.setAttribute('aria-selected','true');}b.onclick=function(e){var y=parseInt(this.getAttribute('data-y'),10),m=parseInt(this.getAttribute('data-m'),10),d=parseInt(this.getAttribute('data-d'),10);if(e&&e.stopPropagation)e.stopPropagation();jplopsoft_CALENDAR.selectedYear=y;jplopsoft_CALENDAR.selectedMonth=m;jplopsoft_CALENDAR.selectedDay=d;jplopsoft_CALENDAR.year=y;jplopsoft_CALENDAR.month=m;jplopsoft_calendarRender();};grid.appendChild(b);}jplopsoft_calendarUpdateLiveTime();}
function jplopsoft_calendarNavigate(delta){var d=new Date(jplopsoft_CALENDAR.year||new Date().getFullYear(),(jplopsoft_CALENDAR.month||0)+parseInt(delta,10),1);jplopsoft_CALENDAR.year=d.getFullYear();jplopsoft_CALENDAR.month=d.getMonth();jplopsoft_calendarRender();}
function jplopsoft_calendarToday(){var d=new Date();jplopsoft_CALENDAR.year=d.getFullYear();jplopsoft_CALENDAR.month=d.getMonth();jplopsoft_CALENDAR.selectedYear=d.getFullYear();jplopsoft_CALENDAR.selectedMonth=d.getMonth();jplopsoft_CALENDAR.selectedDay=d.getDate();jplopsoft_calendarRender();}
function jplopsoft_calendarVisible(){var f=jplopsoft_el('jplopsoft_calendarFlyout');return !!(f&&(' '+String(f.className||'')+' ').indexOf(' jplopsoft_open ')>=0);}
function jplopsoft_calendarHide(){var f=jplopsoft_el('jplopsoft_calendarFlyout'),c=jplopsoft_el('jplopsoft_taskbarClock');jplopsoft_CALENDAR.visible=false;if(f){f.className='jplopsoft_calendar-flyout';f.setAttribute('aria-hidden','true');}if(c){c.className='jplopsoft_taskbar-clock';c.setAttribute('aria-expanded','false');}}
function jplopsoft_calendarShow(){var f=jplopsoft_el('jplopsoft_calendarFlyout'),c=jplopsoft_el('jplopsoft_taskbarClock'),now=new Date();if(!state.samAuthenticated||!state.vaultKey)return;if(!f||!c)return;jplopsoft_closeStartMenu();jplopsoft_hideTaskbarContextMenu();if(!jplopsoft_CALENDAR.visible){jplopsoft_CALENDAR.year=now.getFullYear();jplopsoft_CALENDAR.month=now.getMonth();if(!jplopsoft_CALENDAR.selectedYear){jplopsoft_CALENDAR.selectedYear=now.getFullYear();jplopsoft_CALENDAR.selectedMonth=now.getMonth();jplopsoft_CALENDAR.selectedDay=now.getDate();}}jplopsoft_CALENDAR.visible=true;f.className='jplopsoft_calendar-flyout jplopsoft_open';f.setAttribute('aria-hidden','false');c.className='jplopsoft_taskbar-clock jplopsoft_active';c.setAttribute('aria-expanded','true');jplopsoft_calendarRender();}
function jplopsoft_calendarToggle(){if(jplopsoft_calendarVisible())jplopsoft_calendarHide();else jplopsoft_calendarShow();}

function jplopsoft_taskbarPad2(n){
  n=parseInt(n,10)||0;
  return n<10?'0'+n:String(n);
}

function jplopsoft_taskbarUpdateClock(){
  var d=new Date(),timeNode=jplopsoft_el('jplopsoft_taskbarTime'),
      dateNode=jplopsoft_el('jplopsoft_taskbarDate'),
      clockNode=jplopsoft_el('jplopsoft_taskbarClock'),
      timeText,dateText;

  timeText=jplopsoft_taskbarPad2(d.getHours())+':'+jplopsoft_taskbarPad2(d.getMinutes());
  dateText=d.getFullYear()+'/'+jplopsoft_taskbarPad2(d.getMonth()+1)+'/'+jplopsoft_taskbarPad2(d.getDate());

  if(timeNode)timeNode.textContent=timeText;
  if(dateNode)dateNode.textContent=dateText;
  if(clockNode)clockNode.title=dateText+' '+timeText+':'+jplopsoft_taskbarPad2(d.getSeconds());
  if(jplopsoft_calendarVisible())jplopsoft_calendarUpdateLiveTime();
}

function jplopsoft_startMenuVisible(){
  var m=jplopsoft_el('jplopsoft_startMenu');
  return !!(m&&(' '+String(m.className||'')+' ').indexOf(' jplopsoft_open ')>=0);
}

function jplopsoft_closeStartMenu(){
  var m=jplopsoft_el('jplopsoft_startMenu'),b=jplopsoft_el('jplopsoft_startBtn');
  if(m)m.className='jplopsoft_start-menu';
  if(b){
    b.className='jplopsoft_start-btn';
    b.setAttribute('aria-expanded','false');
  }
}

function jplopsoft_openStartMenu(){
  var m=jplopsoft_el('jplopsoft_startMenu'),b=jplopsoft_el('jplopsoft_startBtn');
  if(!m||!b)return;
  jplopsoft_taskbarUpdateAvailability();
  m.className='jplopsoft_start-menu jplopsoft_open';
  b.className='jplopsoft_start-btn jplopsoft_active';
  b.setAttribute('aria-expanded','true');
}

function jplopsoft_toggleStartMenu(){
  if(jplopsoft_startMenuVisible())jplopsoft_closeStartMenu();
  else jplopsoft_openStartMenu();
}

function jplopsoft_taskbarUpdateAvailability(){
  var logged=!!(state&&state.samAuthenticated&&state.vaultKey),
      ids=['jplopsoft_startComputer','jplopsoft_startDesktop','jplopsoft_startControlPanel','jplopsoft_startCmd','jplopsoft_startCalc','jplopsoft_startSecurity'],
      i,n;
  if(!logged)jplopsoft_taskbarRemoveDocumentApp();
  for(i=0;i<ids.length;i++){
    n=jplopsoft_el(ids[i]);
    if(n)n.disabled=!logged||!!state.kdfBusy;
  }
}

function jplopsoft_taskbarRequireDesktop(){
  if(!state.samAuthenticated||!state.vaultKey){
    alert('請先登入 ExOS。');
    return false;
  }
  return true;
}

function jplopsoft_taskbarOpenFolder(folderId){
  if(!jplopsoft_taskbarRequireDesktop())return;
  jplopsoft_closeStartMenu();
  jplopsoft_wmOpenExplorer(folderId);
}

function jplopsoft_taskbarOpenComputer(){
  if(!jplopsoft_taskbarRequireDesktop())return;
  jplopsoft_closeStartMenu();
  jplopsoft_openMyComputer();
}

function jplopsoft_taskbarOpenDesktop(){
  if(!jplopsoft_taskbarRequireDesktop())return;
  jplopsoft_wmShowDesktop();
}

function jplopsoft_taskbarOpenControlPanel(){
  if(!jplopsoft_taskbarRequireDesktop())return;
  jplopsoft_closeStartMenu();
  if(typeof jplopsoft_openExconfig==='function')jplopsoft_openExconfig();
}

function jplopsoft_taskbarOpenCmd(){
  if(!jplopsoft_taskbarRequireDesktop())return;
  jplopsoft_closeStartMenu();
  jplopsoft_wmOpenCmd();
}

function jplopsoft_taskbarOpenCalculator(){
  if(!jplopsoft_taskbarRequireDesktop())return;
  jplopsoft_closeStartMenu();
  jplopsoft_openCalculator();
}

function jplopsoft_taskbarOpenSecurity(){
  if(!jplopsoft_taskbarRequireDesktop())return;
  jplopsoft_closeStartMenu();
  jplopsoft_openSecurityScreen();
}

function jplopsoft_taskbarContains(parent,node){
  while(node){
    if(node===parent)return true;
    node=node.parentNode;
  }
  return false;
}

function jplopsoft_bindTaskbar(){
  var startBtn=jplopsoft_el('jplopsoft_startBtn'),startMenu=jplopsoft_el('jplopsoft_startMenu'),computer=jplopsoft_el('jplopsoft_startComputer'),desktop=jplopsoft_el('jplopsoft_startDesktop'),control=jplopsoft_el('jplopsoft_startControlPanel'),cmd=jplopsoft_el('jplopsoft_startCmd'),calc=jplopsoft_el('jplopsoft_startCalc'),security=jplopsoft_el('jplopsoft_startSecurity'),clock=jplopsoft_el('jplopsoft_taskbarClock'),calPrev=jplopsoft_el('jplopsoft_calendarPrev'),calNext=jplopsoft_el('jplopsoft_calendarNext'),calToday=jplopsoft_el('jplopsoft_calendarToday'),calendar=jplopsoft_el('jplopsoft_calendarFlyout'),taskbar=jplopsoft_el('jplopsoft_taskbar');
  if(!startBtn||!startMenu)return;
  startBtn.onclick=function(e){e=e||window.event;if(e.stopPropagation)e.stopPropagation();e.cancelBubble=true;jplopsoft_calendarHide();jplopsoft_toggleStartMenu();return false;};
  if(computer)computer.onclick=jplopsoft_taskbarOpenComputer;if(desktop)desktop.onclick=jplopsoft_taskbarOpenDesktop;if(control)control.onclick=jplopsoft_taskbarOpenControlPanel;if(cmd)cmd.onclick=jplopsoft_taskbarOpenCmd;if(calc)calc.onclick=jplopsoft_taskbarOpenCalculator;if(security)security.onclick=jplopsoft_taskbarOpenSecurity;
  if(clock)clock.onclick=function(e){e=e||window.event;if(e.stopPropagation)e.stopPropagation();e.cancelBubble=true;jplopsoft_calendarToggle();return false;};
  if(calendar)calendar.onclick=function(e){e=e||window.event;if(e.stopPropagation)e.stopPropagation();e.cancelBubble=true;};
  if(calPrev)calPrev.onclick=function(e){if(e&&e.stopPropagation)e.stopPropagation();jplopsoft_calendarNavigate(-1);};if(calNext)calNext.onclick=function(e){if(e&&e.stopPropagation)e.stopPropagation();jplopsoft_calendarNavigate(1);};if(calToday)calToday.onclick=function(e){if(e&&e.stopPropagation)e.stopPropagation();jplopsoft_calendarToday();};
  if(taskbar)taskbar.oncontextmenu=function(e){var appId;e=e||window.event;appId=jplopsoft_taskbarContextAppId(taskbar,e.target||e.srcElement);return jplopsoft_showTaskbarContextMenu(e,appId);};
  if(document.addEventListener){
    document.addEventListener('mousedown',function(e){var t=e.target||e.srcElement,tm=jplopsoft_el('jplopsoft_taskbarContextMenu');if(tm&&tm.className.indexOf('jplopsoft_hidden')<0&&!jplopsoft_taskbarContains(tm,t))jplopsoft_hideTaskbarContextMenu();if(jplopsoft_calendarVisible()&&!jplopsoft_taskbarContains(jplopsoft_el('jplopsoft_calendarFlyout'),t)&&!jplopsoft_taskbarContains(jplopsoft_el('jplopsoft_taskbarClock'),t))jplopsoft_calendarHide();if(!jplopsoft_startMenuVisible())return;if(jplopsoft_taskbarContains(startMenu,t)||jplopsoft_taskbarContains(startBtn,t))return;jplopsoft_closeStartMenu();},false);
    document.addEventListener('keydown',function(e){e=e||window.event;if((e.keyCode||e.which)===27){jplopsoft_hideTaskbarContextMenu();if(jplopsoft_calendarVisible()){jplopsoft_calendarHide();try{if(clock)clock.focus();}catch(ignoreCalendarFocus){}}if(jplopsoft_startMenuVisible()){jplopsoft_closeStartMenu();try{startBtn.focus();}catch(ignoreStartFocus){}}}},false);
  }
  jplopsoft_taskbarUpdateClock();jplopsoft_calendarRender();
  if(window.jplopsoft_EXOS_TASKBAR_CLOCK_TIMER){try{window.clearInterval(window.jplopsoft_EXOS_TASKBAR_CLOCK_TIMER);}catch(ignoreOldClock){}}
  if(window.jplopsoft_EXFS_TASKBAR_CLOCK_TIMER){try{window.clearInterval(window.jplopsoft_EXFS_TASKBAR_CLOCK_TIMER);}catch(ignoreLegacyClock){}}
  window.jplopsoft_EXOS_TASKBAR_CLOCK_TIMER=window.setInterval(jplopsoft_taskbarUpdateClock,1000);jplopsoft_taskbarUpdateAvailability();
}

function jplopsoft_bind(){jplopsoft_el('jplopsoft_unlockBtn').onclick=jplopsoft_submitCredentialUI;jplopsoft_el('jplopsoft_loginUserInput').onkeydown=function(e){e=e||window.event;if((e.keyCode||e.which)===13&&!state.kdfBusy){try{jplopsoft_el('jplopsoft_keyInput').focus();}catch(ignoreUserEnter){}}};jplopsoft_el('jplopsoft_loginUserInput').onchange=function(){if(state.kdfBusy)return;jplopsoft_selectLogonAccount(String(this.value||state.defaultUsername||'administrator').toLowerCase(),true);};jplopsoft_el('jplopsoft_keyInput').onkeydown=function(e){e=e||window.event;if((e.keyCode||e.which)===13&&!state.kdfBusy)jplopsoft_submitCredentialUI();};jplopsoft_bindSecureDesktopUI();if(jplopsoft_el('jplopsoft_rememberUnlock'))jplopsoft_el('jplopsoft_rememberUnlock').onchange=jplopsoft_onRememberUnlockChanged;if(jplopsoft_el('jplopsoft_largeTransferCancelBtn'))jplopsoft_el('jplopsoft_largeTransferCancelBtn').onclick=jplopsoft_cancelLargeTransfer;if(jplopsoft_el('jplopsoft_largeTransferMinBtn'))jplopsoft_el('jplopsoft_largeTransferMinBtn').onclick=jplopsoft_toggleLargeTransferMinimized;jplopsoft_el('jplopsoft_newFolderBtn').onclick=function(){jplopsoft_createItem('folder');};jplopsoft_el('jplopsoft_newHtmlBtn').onclick=function(){jplopsoft_createItem('file','html');};jplopsoft_el('jplopsoft_newTxtBtn').onclick=function(){jplopsoft_createItem('file','txt');};jplopsoft_el('jplopsoft_newCsvBtn').onclick=function(){jplopsoft_createItem('file','csv');};jplopsoft_el('jplopsoft_downloadBtn').onclick=jplopsoft_downloadSelected;jplopsoft_el('jplopsoft_renameBtn').onclick=jplopsoft_renameSelected;jplopsoft_el('jplopsoft_moveBtn').onclick=jplopsoft_openMoveDialog;jplopsoft_el('jplopsoft_deleteBtn').onclick=function(){if(jplopsoft_isDesktopFolder()){if(state.desktopSelectedTargetId)jplopsoft_deleteDesktopShortcut(state.desktopSelectedTargetId);return;}jplopsoft_deleteSelected();};if(jplopsoft_threeFeatureAllowed()){if(jplopsoft_el('jplopsoft_volume3dBtn'))jplopsoft_el('jplopsoft_volume3dBtn').onclick=jplopsoft_openVolume3D;if(jplopsoft_el('jplopsoft_volume3dPhysicalBtn'))jplopsoft_el('jplopsoft_volume3dPhysicalBtn').onclick=function(){jplopsoft_threeVolumeSwitchTopology('physical');};if(jplopsoft_el('jplopsoft_volume3dSandboxBtn'))jplopsoft_el('jplopsoft_volume3dSandboxBtn').onclick=function(){jplopsoft_threeVolumeSwitchTopology('sandbox');};if(jplopsoft_el('jplopsoft_volume3dCloseBtn'))jplopsoft_el('jplopsoft_volume3dCloseBtn').onclick=jplopsoft_closeVolume3D;if(jplopsoft_el('jplopsoft_volume3dFullscreenBtn'))jplopsoft_el('jplopsoft_volume3dFullscreenBtn').onclick=jplopsoft_threeVolumeToggleFullscreen;if(jplopsoft_el('jplopsoft_volume3dResetBtn'))jplopsoft_el('jplopsoft_volume3dResetBtn').onclick=jplopsoft_threeVolumeResetView;if(jplopsoft_el('jplopsoft_volume3dBackdrop'))jplopsoft_el('jplopsoft_volume3dBackdrop').onclick=function(e){if(e.target===jplopsoft_el('jplopsoft_volume3dBackdrop'))jplopsoft_closeVolume3D();else jplopsoft_wmActivateOverlay('jplopsoft_volume3dBackdrop','jplopsoft_volume3dWindow','volume3d');};}jplopsoft_el('jplopsoft_modalClose').onclick=jplopsoft_closeModal;jplopsoft_el('jplopsoft_modalCloseTop').onclick=jplopsoft_closeModal;jplopsoft_el('jplopsoft_modalVersionsBtn').onclick=jplopsoft_openVersions;jplopsoft_el('jplopsoft_versionCloseTop').onclick=jplopsoft_closeVersions;jplopsoft_el('jplopsoft_versionBackdrop').onclick=function(e){if(e.target===jplopsoft_el('jplopsoft_versionBackdrop'))jplopsoft_closeVersions();};jplopsoft_el('jplopsoft_moveCloseTop').onclick=jplopsoft_closeMoveDialog;jplopsoft_el('jplopsoft_moveCancelBtn').onclick=jplopsoft_closeMoveDialog;jplopsoft_el('jplopsoft_moveConfirmBtn').onclick=jplopsoft_confirmMove;jplopsoft_el('jplopsoft_moveBackdrop').onclick=function(e){if(e.target===jplopsoft_el('jplopsoft_moveBackdrop'))jplopsoft_closeMoveDialog();};jplopsoft_el('jplopsoft_trashCloseTop').onclick=jplopsoft_closeTrash;jplopsoft_el('jplopsoft_trashCloseBtn').onclick=jplopsoft_closeTrash;jplopsoft_el('jplopsoft_trashEmptyBtn').onclick=jplopsoft_emptyTrash;jplopsoft_el('jplopsoft_trashBackdrop').onclick=function(e){if(e.target!==jplopsoft_el('jplopsoft_trashBackdrop'))jplopsoft_wmActivateOverlay('jplopsoft_trashBackdrop','jplopsoft_trashWindow','trash');};jplopsoft_el('jplopsoft_modalDownloadBtn').onclick=jplopsoft_downloadCurrentDocument;jplopsoft_el('jplopsoft_modalPrintBtn').onclick=jplopsoft_printCurrentDocument;jplopsoft_el('jplopsoft_modalMaxBtn').onclick=jplopsoft_toggleMax;jplopsoft_el('jplopsoft_saveDocBtn').onclick=jplopsoft_saveDocument;jplopsoft_el('jplopsoft_csvAddRowBtn').onclick=jplopsoft_csvAddRow;jplopsoft_el('jplopsoft_csvAddColBtn').onclick=jplopsoft_csvAddColumn;jplopsoft_el('jplopsoft_csvDelRowBtn').onclick=jplopsoft_csvDeleteRow;jplopsoft_el('jplopsoft_csvDelColBtn').onclick=jplopsoft_csvDeleteColumn;jplopsoft_el('jplopsoft_csvFormulaInput').oninput=function(){if(state.csvReadOnly)return;var r=state.csvSelectedRow,c=state.csvSelectedCol,input;if(!state.csvData[r])return;state.csvData[r][c]=this.value;input=jplopsoft_csvSelectedCellInput();if(input)input.value=this.value;};jplopsoft_el('jplopsoft_tabEdit').onclick=jplopsoft_showSourceTab;jplopsoft_el('jplopsoft_tabRich').onclick=jplopsoft_showRichTab;jplopsoft_el('jplopsoft_tabPreview').onclick=function(){jplopsoft_showPreview();};jplopsoft_el('jplopsoft_modalBackdrop').onclick=function(e){if(e.target!==jplopsoft_el('jplopsoft_modalBackdrop'))jplopsoft_wmActivateOverlay('jplopsoft_modalBackdrop','jplopsoft_documentWindow','document');};if(jplopsoft_el('jplopsoft_galleryPrevImage'))jplopsoft_el('jplopsoft_galleryPrevImage').onclick=function(){jplopsoft_galleryNavigate(-1);};if(jplopsoft_el('jplopsoft_galleryNextImage'))jplopsoft_el('jplopsoft_galleryNextImage').onclick=function(){jplopsoft_galleryNavigate(1);};if(jplopsoft_el('jplopsoft_galleryPrevMedia'))jplopsoft_el('jplopsoft_galleryPrevMedia').onclick=function(){jplopsoft_galleryNavigate(-1);};if(jplopsoft_el('jplopsoft_galleryNextMedia'))jplopsoft_el('jplopsoft_galleryNextMedia').onclick=function(){jplopsoft_galleryNavigate(1);};jplopsoft_bindSecurityUI();jplopsoft_bindExconfig();jplopsoft_bindProperties();jplopsoft_bindTaskbar();jplopsoft_bindWindowManager();jplopsoft_bindRich();jplopsoft_bindSortHeaders();jplopsoft_bindBulkSelection();jplopsoft_bindFileDrop();jplopsoft_bindFileSearch();jplopsoft_bindExfsContextMenu();jplopsoft_bindCmdMode();jplopsoft_bindGlobalHotkeys();jplopsoft_bindSidebarResizer();if(jplopsoft_isIE11Browser()&&window.addEventListener)window.addEventListener('resize',jplopsoft_ie11FitDocumentModal,false);}

window.jplopsoft_EXOS_OS={
  ready:true,
  version:'6.4.0-dev-os24',
  build:'external-os-root-window-portal-single-wallpaper'
};
