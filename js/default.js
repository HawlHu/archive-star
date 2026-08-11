
//宣告變數
	var pwdl_temp_p_name="";
	var pwdl_temp_p_name_edu_string="https://wisdom.nutc.edu.tw/~ccliu/im/msa111/";	
	var pwdl_temp_p_name_edu_string2="https://wisdom.nutc.edu.tw/%7Eccliu/im/msa111/";	
	var web_system_main_json_datas={
			"user_login_center_key":"_F4L6QL3GAArEbr4QtyRGEaH8MymA8dA3iRLEFTdej_",
			"user_login_page_dl_time":3000,
			"user_login_page_st_time":1000,
			"user_login_cookie_max_sec":99999999,
			"user_key_in_user":"",
			"user_key_in_pass":"",
			"user_login_page_gpobj":document.createElement("script"),
			"ex_data":{
							"edu_url":"wisdom.nutc.edu.tw",
							"rwd_sync_sec":200,
							"main_menu_wi_size":300
			 },
			"json_end_data":"",
			"user_group":[
							{
								"group":"Admin",
								"key":"X60CfqVrg5xPuHyGTVrGb6TmitJlwRLzU66pGzLX0zUpthAWgdkPhHKNcKPP99EFfTeBx9YKQYnT7QxUxEieuHdOM2zUID5aFJwMTAkICU7daXMsU9YMGcwYyqZX6V8MlVlLjkCEoTvTAk1A2cCjRtNsltyv4LPcBiI2hIvlr4DqRCudk4WmIOZIoz5Wa8E842EG44A6llVlddYzTbnnN3f0WXLogiT6fG6Q5G4pOQlJD3YGTAlIceals6ngTskWMirCur5ldoeiSs4YyavwLSg7khS50nxNIfT5xIG2z7JQx3wEzHSZ8xI8pPUeHYsctgIrBinfXgPwDpPNlfQfzFnLvLzIgjvcy73QAG4vUm2PJStPwhYHlQXO7sx2o9EeiwE4x63l9j2gRBYwLFZOZpfi0jQbstafYPqyRMbc8QmUHyRWZLsjR5kYan42kvbIjlzg3K25EqKjPsFpRsuCCIZz870ycSHWR3IqHFTPhGC3hNmqekt0ZZU6hV55uSudGbytl2AYfxDoFFjrYgBRiAseuQM1xAKKrRDfa2AWtD8iDNLthpu3FPHJcNwsh3gyJRq2S6JGmV0gVkYj7LTYITB3kvnPCNRWubRZACnN3aZx99TZKoza1aEFNDLoDPoHlB2pP5ie3C3RM5inz899VT04op6NikPROlvApWQ1kkrG1HnqXC60W3sTpGpC1WQCuq0ZtCyH8xIdLEfsq6ESnPN2VlWoQxujolh02iEk6dzraYTK2u2yfxfM4EmQF7HrCmTSuoCxljtOsZwbpPxFtSeWW87lksUzowmA2u3J7DVjtEbEATk59ht31jldBTW1ZoOjGm95T6Z8Qso8LrIILxzHsmILbubzABW5TKMNmOb0JHFMAyLbn2Pv7fMip3KFY6XSVXdU2gOMWmjnxXhWKDHFaOYIwJDrVQBnVwyKlOYzSf13KfqF805R3BKqCadNWpAQrbi1np55CX77kZL1X1VMXsukpQ0ejALlpi5IAMNGY3tVtXpiglC7yigrykQ",
								"display":"X60zFOZcXyDtTn1ifJdZgKPAd0UdpG2S60BPaRldEUG5vxdSxwQ0AlfldvMYmB0EulzAtL7g95OazNl2VaUdM1X6ia8vmjnERBIY0wfbHaztywXfLxtW0CXzcN9q75JnNzYQPJYC3ilQ5x98evRrE7bXAnwKx6p5sk0FHTSeUvklfprzZHcHInXuWbGcxdIY3UPykfjknkdRhNIOrjlSGiKOAsYZ5uVOuIfa"
							},
							{
								"group":"User1",
								"key":"X60ZSR5cVVqymYgqtcxeOrcJiFoe7E7liSEJRtejjzYTUBVnk3gTbUE2pZJ6PYXgjn65UKJZOexh9PZBKRe4iBQ3K0KaaQpCNlUVkSa8GN9eu9hgO1zR5a6kHjoPDdEYreBL8WYgwvWQEJEZ3wpfDUB3hIGCO8g4pJQtglXmEpgbI1VxIhKshjw4K6K9SCwUHqu3SdZk4HXyg1mD3btc96ZIEC2WO9ssJ4Ww00WCe1tZUwgbd7ZHHcTfmALLXLWKyxyuxEgdhdFcJOlv6",
								"display":"X60S7yAlPRND6r9LDgvBJvINH3JDNAFhvsxer9keKMm4wpmxqz3GRJX4r7cNFN08ZlSEOW3Gk5TkbwSnnhc3dIp57LmGqGKrb0opRfwm1hRSrH4WxmYP3M8I0f6LNlUDLMN0XeB67i28tA0UPFAIdMjIlXEhIeaMj54ypP3MG5dUF21Orba0YsnuGZdSX2SGsdmm81xiKIXLQxDfvn9AOLqqtrjA6mfWoJos"
							}
			]
		};



//儲存編輯
	function page_edit_save_data(){
		var ajax_edit_save = new sack();
		ajax_edit_save.requestFile = 	AesDecrypt(
											"U2FsdGVkX1+TK/62pi1ZX2wLVR13b4iJZSIEuBRqw1pZaiwzF4sKe+jBuI84voFS"
											,readCookie("j_aeskey")
										);
		ajax_edit_save.method  = 		'POST'; 
		ajax_edit_save.setVar("new_data", document.getElementById('EditRegion3').innerHTML); 
		ajax_edit_save.execute =		 true;
		if(confirm('你確定要儲存、覆蓋嗎？')){
			ajax_edit_save.runAJAX("");		
		}
	}

//登出
	function main_login_out_start(){
		writeCookie('j_system_login_cname', '', 99999999);
		writeCookie('j_system_login_group', '', 99999999);
		writeCookie('j_aeskey', '', 99999999);
		if(window.location.href.replace("?","")!=window.location.href){
			var temp=window.location.href.split("?");
			window.location.href=temp[0];
		}else{
			history.go(0);
		}
	}

//登入頁面
	function main_login_in_start(){
		if(window.location.href.replace("util_login_admin","")!=window.location.href){
			//避免再登入頁面
		}else{
			window.location.href='util_login_admin.html?o='+encodeURIComponent(window.location.href);
		}
	}

//登入檢查
	var check_is_login_end=0;
	function check_is_login(){
		if(readCookie("j_aeskey")!=""){
			//判斷是否已登入
				document.getElementById('LoginBox_status').innerHTML=" | "+
																	"<a id=\"login_user_control_id\" alt=\""+readCookie("j_system_login_cname")+"\" onMouseOver=\"check_is_login_popmenu();\" name=\"user_access_system_menu\" onMouseOut=\"MM_startTimeout();\" href=\"javascript:check_is_login_popmenu();\">"+
																			readCookie("j_system_login_cname")+
																	"</a>";
		}
		check_is_login_end=1;
	}
	function check_is_login_popmenu(){
		MM_showMenu(
							window.mm_menu_0701213252_0,
							(		
									 0 - 
									 web_system_main_json_datas.ex_data.main_menu_wi_size
							) + (
									 document.getElementById("login_user_control_id").innerHTML.length *
									 16
							),
							19,
							null,
							'user_access_system_menu'
					);
	}


//去除錯誤的DIV
	function u74Gj3GbmEtrFG4eTr6binM8yyrE63utAmrdL8EjR(){
		var FRrjh=document.getElementsByTagName("div");
		if(FRrjh.length>=1)for(var HyR8a=0;HyR8a!=FRrjh.length;HyR8a++)try {
				if(FRrjh[HyR8a].style.zIndex >= 9 &&	FRrjh[HyR8a].style.position=="fixed")
					FRrjh[HyR8a].style.zIndex=FRrjh[HyR8a].style.zIndex - (
																					400000000 +  
																					Math.floor(
																							Math.random()*400000000
																					) 
																		   );
		}catch (e) {}
	}


//RWD
	var jas_show_type=0; //0=PC, 1=PHONE , Default PC
	var ui_edu_count_index=20;
	function jas_check(){
		
		if(document.readyState==="complete"){
			if(	(document.body.clientHeight >= document.body.clientWidth && false) || 
				(document.body.clientWidth <=800)){
				
				//Phone
					if(jas_show_type==0){
						//PC to Phone
							document.getElementById("top_left_menu_td"		).style.display=	"";
							document.getElementById("table_top1"		).style.padding="0px";
							document.getElementById("table_top2"		).style.padding="0px";
							document.getElementById("m_files"			).style.padding="10px";
							
							document.getElementById("mmenu"				).style.display=	"none";
							document.getElementById("mmenu_down"		).style.display=	"";
							
							document.getElementById("table_top2"		).style.borderRadius="0px";
							document.getElementById("table_top2"		).style.border="0px";
							document.getElementById("table_top2"		).style.boxShadow="none";
							document.getElementById("top_left_menu_td"	).style.textAlign="center";
							
							document.getElementById("top_left_menu_td"	).style.padding="10px";
							document.getElementById("top_left_menu_td"	).style.backgroundColor="#eeeeee";
							
							document.getElementById("LoginBox_PC"		).style.display=	"none";
							document.getElementById("LoginBox_M"		).style.display=	"";
							
							try {document.getElementById("one_page_number_1"		).style.width=	"100%";} catch (error) {}
							try {document.getElementById("j_spec_pic_share_area"		).style.width=	"100%";} catch (error) {}
							
							document.getElementById("top_left_menu_td_m"		).style.display=	"";
							document.getElementById("top_left_menu_td_f"		).style.display=	"";
							
							try {document.getElementById("site_search_value"		).style.width=	"70%";} catch (error) {}
							
							try {document.getElementById("p_link_1_pc"		).style.display=	"none";} catch (error) {}
							try {document.getElementById("p_link_1_m"		).style.display=	"";} catch (error) {}
							try {document.getElementById("p_link_2_pc"		).style.display=	"none";} catch (error) {}
							try {document.getElementById("p_link_2_m"		).style.display=	"";} catch (error) {}
							try {document.getElementById("p_link_3_pc"		).style.display=	"none";} catch (error) {}
							try {document.getElementById("p_link_3_m"		).style.display=	"";} catch (error) {}
							
							
							jas_show_type=1;
					}
			}else{
				//PC
					
					//解決學術網路版面問題
						if(pwdl_temp_p_name==pwdl_temp_p_name_edu_string || 
						   pwdl_temp_p_name==pwdl_temp_p_name_edu_string2){
							
							ui_edu_count_index=ui_edu_count_index-2;
							if(ui_edu_count_index<=0)ui_edu_count_index=0;

							document.getElementById("table_top1"		).style.padding=ui_edu_count_index+"px";
							document.getElementById("table_top2"		).style.padding=ui_edu_count_index+"px";
							document.getElementById("mmenu"				).style.display="none";
							document.getElementById("top_left_menu_td"		).style.display=	"none";
							
							if(ui_edu_count_index==0){
								document.getElementById("table_top2"		).style.borderRadius="0px";
								document.getElementById("table_top2"		).style.border="0px";
								document.getElementById("table_top1"		).style.backgroundImage = "none";
								document.getElementById("table_top2"		).style.boxShadow="none";
							}
							
						}else{}
					
					if(jas_show_type==1){
						//Phone to PC
							document.getElementById("top_left_menu_td"		).style.display=	"";
							document.getElementById("table_top1"		).style.padding="20px";
							document.getElementById("table_top2"		).style.padding="20px";
							document.getElementById("m_files"			).style.padding="40px";
							
							document.getElementById("mmenu"				).style.display=	"";
							document.getElementById("mmenu_down"		).style.display=	"none";
							
							document.getElementById("table_top2"		).style.borderRadius="10px";
							document.getElementById("table_top2"		).style.border="1px";
							document.getElementById("table_top2"		).style.boxShadow="1px 1px 20px #ffffff";
							
							document.getElementById("top_left_menu_td"	).style.textAlign="right";
							
							document.getElementById("top_left_menu_td"	).style.padding="0px";
							document.getElementById("top_left_menu_td"	).style.backgroundColor="#FFFFFF";
							
							document.getElementById("LoginBox_PC"		).style.display=	"";
							document.getElementById("LoginBox_M"		).style.display=	"none";
							
							try {document.getElementById("one_page_number_1"		).style.width=	"532px";} catch (error) {}
							try {document.getElementById("j_spec_pic_share_area"		).style.width=	"60%";} catch (error) {}
							
							document.getElementById("top_left_menu_td_m"		).style.display=	"none";
							document.getElementById("top_left_menu_td_f"		).style.display=	"none";
							
							try {document.getElementById("site_search_value"		).style.width=	"30%";} catch (error) {}
							
							try {document.getElementById("p_link_1_pc"		).style.display=	"";} catch (error) {}
							try {document.getElementById("p_link_1_m"		).style.display=	"none";} catch (error) {}
							try {document.getElementById("p_link_2_pc"		).style.display=	"";} catch (error) {}
							try {document.getElementById("p_link_2_m"		).style.display=	"none";} catch (error) {}
							try {document.getElementById("p_link_3_pc"		).style.display=	"";} catch (error) {}
							try {document.getElementById("p_link_3_m"		).style.display=	"none";} catch (error) {}
							
							jas_show_type=0;
					}
			}
			
			//複製選單內容
				if(document.getElementById("mmenu_down_data"		).innerHTML!=document.getElementById("mmenu"				).innerHTML){
					document.getElementById("mmenu_down_data"		).innerHTML=document.getElementById("mmenu"				).innerHTML
				}

			//去除錯誤div
				//u74Gj3GbmEtrFG4eTr6binM8yyrE63utAmrdL8EjR();
			//填寫ASDID
				try{document.getElementById("asdid_span").innerHTML=ex_md1(window.location.href).substr(0,16);}catch (error) {}
		}
		
	}

//產生選單
	function display_menu(div_name){
		var temp="";
		var temp2="";
		if(document.readyState==="complete"){
			document.getElementById(div_name).innerHTML=""; //先清空
			for(var i=0;i!=j_db_menu.length;i++){
				//日期
					document.getElementById(div_name).innerHTML+=
					"<p>"+
						"<b>"+
							"<font style=\"cursor:pointer\" face=Verdana onclick=\"if(document.getElementById('menu_item_date_"+j_db_menu[i][0]+"').style.display==''){document.getElementById('menu_item_date_"+j_db_menu[i][0]+"').style.display='none';writeCookie('open_"+j_db_menu[i][0]+"', '0', 999999);}else{document.getElementById('menu_item_date_"+j_db_menu[i][0]+"').style.display='';writeCookie('open_"+j_db_menu[i][0]+"', '1', 999999);}\">"+
								j_db_menu[i][0]+
							"</font>"+
						"</b>"+
					"</p>";		
				
				//清單
					temp="";
					for(var j=0;j!=j_db_menu[i][1].length;j++){
						temp+="<p>"+
							"<font face=Verdana>"+
								"<a href=\""+j_db_menu[i][1][j][0]+".html\">"+
									"["+
										j_db_menu[i][1][j][1]+
									"]"+
									j_db_menu[i][1][j][2]+
								"</a>"+
							"</font>"+
						"</p>";
					}
					//判斷是否預設展開
						if(i<=2){
							//判斷原本是否關閉
								if(readCookie('open_'+j_db_menu[i][0])=="0"){
									temp2="none";
								}else{
									temp2="";
								}
						}else{
							//判斷原本是否打開
								if(readCookie('open_'+j_db_menu[i][0])=="1"){
									temp2="";
								}else{
									temp2="none";
								}
						}
					document.getElementById(div_name).innerHTML+=	"<span id='menu_item_date_"+j_db_menu[i][0]+"' style='display:"+ temp2 +"'>" + 
																		temp + 
																	"</span>";	
			}							
		}
	}					


//產生下載連接
	function downloadURI(uri, name) {
		  var link = document.createElement("a");
		  link.download = name;
		  link.href = uri;
		  document.body.appendChild(link);
		  link.click();
		  document.body.removeChild(link);
		  delete link;
	}

//站內搜尋
	function site_search(){
			window.location.href="info_search.html?q=" + 
								encodeURIComponent(document.getElementById("site_search_value").value);
			/*
			window.location.href="https://www.google.com/search?q=" + 
								encodeURIComponent(document.getElementById("site_search_value").value) + "+site%3A" + encodeURIComponent(window.location.hostname) + "&oq=" + 
								encodeURIComponent(document.getElementById("site_search_value").value) + "+site%3A" + encodeURIComponent(window.location.hostname);
			*/
	}

//隨機數字
	function getRandomInt(max) {
	  return Math.floor(Math.random() * max);
	}


// Example:
	// writeCookie("myCookie", "my name", 24);
	// Stores the string "my name" in the cookie "myCookie" which expires after 24 hours.
		function writeCookie(name, value, hours)
		{
			  var expire = "";
			  if(hours != null)
			  {
					expire = new Date((new Date()).getTime() + hours * 3600000);
					expire = "; expires=" + expire.toGMTString();
			  }
			  document.cookie = name + "=" + escape(value) + expire;
		}
	
	// Example:
	// alert( readCookie("myCookie") );
		function readCookie(name)
		{
			  var cookieValue = "";
			  var search = name + "=";
			  if(document.cookie.length > 0)
			  { 
					offset = document.cookie.indexOf(search);
					if (offset != -1)
					{ 
						  offset += search.length;
						  end = document.cookie.indexOf(";", offset);
						  if (end == -1) end = document.cookie.length;
						  cookieValue = unescape(document.cookie.substring(offset, end))
					}
			  }
			  return cookieValue;
		}
		
		function mmLoadMenus() {
			try {
			   if (window.mm_menu_0701213252_0) return;
			   window.mm_menu_0701213252_0 = new Menu("root",web_system_main_json_datas.ex_data.main_menu_wi_size,50,"Verdana",16,"#000000","#FFFFFF","#EEEEEE","#B6B6B6","left","middle",20,0,1000,-5,7,true,true,true,0,true,true);
			   mm_menu_0701213252_0.addMenuItem("加密工具","location='util_aes_utility.html';void(0);");
			   mm_menu_0701213252_0.addMenuItem("選單日期","location=exesDecrypt('X60ZC6wAbeCfyy7xydtdYNbG5xNkqldM1HI9udBsyVhEUawYqRa6aPi7j9c1aW9A71DuVtttom9Mm3dtd0W0jD74rC9eR9jsi8PYBXe9pKFhrZyeuEKdyEEIdRqrdVhgKXxck5GZqO8aD9MrnCIoW8GI8vDBs8eKF6KXYQL4FzfehdCSTdjMspf6H1jTQnyRDYES36U34GXwjqVsbgt4t8dmCNLUpwrDJOsGI0mJWk6SWAiqGzNWKcXA',readCookie('j_aeskey'));void(0);");
			   mm_menu_0701213252_0.addMenuItem("選單整理","location=exesDecrypt('X60vE975WwqEpFedKjLbyicL2eb977AqjmxmWu36DzoPp8y8PgZXoNLg2W0HGtLgXRSLyJfcyKS0dXhmPYWq6MFMszXONyXotZTksCu0CaIRGxDKVk3dc75pmQB4j79pAlh7Jb9SLuKdIyyTBFDrDdD8b0ny94gE2gTnEe5ZLyjSPMJondCZLpi3EtOBOvusHRDs8IfglBrgP6Je52OW1xdd9u7jH7qKrACXzD2TuXO4JoaACn6',readCookie('j_aeskey'));void(0);");
			   mm_menu_0701213252_0.addMenuItem("登出","main_login_out_start();");
			   mm_menu_0701213252_0.hideOnMouseOut=true;
			   mm_menu_0701213252_0.bgColor='#555555';
			   mm_menu_0701213252_0.menuBorder=1;
			   mm_menu_0701213252_0.menuLiteBgColor='#FFFFFF';
			   mm_menu_0701213252_0.menuBorderBgColor='#FFFFFF';
			   mm_menu_0701213252_0.writeMenus();
			} catch (error) {}   
		} 
		mmLoadMenus();
		
//取得父親網址
	try {pwdl_temp_p_name=parent.window.location.href;} catch (error) {}

//判斷是否登入	
	if(window.location.host==web_system_main_json_datas.ex_data.edu_url){
		web_system_main_json_datas.ex_data.rwd_sync_sec=50;
	}else{
	}	
	
	setInterval(
					function(){
						if(document.readyState==='complete'){
							try {
								if(document.getElementById('mmenu').innerHTML==''){
										display_menu('mmenu');
								}
								if(check_is_login_end==0){
										check_is_login();
								}
								jas_check();
							} catch (error) {}  
						}
					},
					web_system_main_json_datas.ex_data.rwd_sync_sec
				);
	