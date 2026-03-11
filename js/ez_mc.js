/*
	ez_mc is a simple human-machine recognition package implemented in pure JavaScript, 
	which utilizes the ex_md1 package.
	
	Files:
		https://jplop.neocities.org/js/ez_mc.js
		https://jplop.neocities.org/js/ex_md1.js
		
	Style:
		easy_man_check_gen_a_num_in_input_style
		Example: document.getElementById("mc_input").setAttribute('style',"font-family:Geneva;font-size:28px;color:#dddddd;"+easy_man_check_gen_a_num_in_input_style);
*/

//Create start timer backup
	var easy_man_check_gen_a_num_in_timer=0;
	var easy_man_check_gen_a_num_in_key_num=0;
	
//InputBox Sample Style
	var easy_man_check_gen_a_num_in_input_style="user-select:none;-webkit-user-select:none;-moz-user-select:none;";

//The simple human-machine interface is a module - Create Function.
//Example:	easy_man_check_gen_a_num(6,600,1000);
	function easy_man_check_gen_a_num(out_length, switching_time, decoding_random_difficulty){
		easy_man_check_gen_a_num_in_timer=new Date().getTime();
		return ex_md1(
					navigator.language+"-spacing_string-"+
					document.referrer+"-spacing_string-"+
					document.location.protocol+"-spacing_string-"+
					location.hostname + "-spacing_string-"+
					navigator.userAgent + "-spacing_string-" + 
					Math.round(((new Date().getTime())/((1000)*switching_time)))+ "-spacing_string-" + 
					Math.round(Math.random() * decoding_random_difficulty)
				).substring(0, out_length);
	}

//The simple human-machine interface is a module - Check Function.
//Example: 	easy_man_check_gen_a_num_check(document.getElementById('man_check').value,6,600,1000, easy_man_check_gen_a_num_in_key_num);
//			easy_man_check_gen_a_num_check(document.getElementById('man_check').value,6,600,1000, document.getElementById('man_check').value.length);
	function easy_man_check_gen_a_num_check(user_input_code, out_length,switching_time, decoding_random_difficulty, user_presses_key){
		if(user_presses_key>=out_length){
			if(easy_man_check_gen_a_num_in_timer>=1){
				if((new Date().getTime() - easy_man_check_gen_a_num_in_timer) >= ((2500 / 4) * out_length)){
					for(var i=0;i!=decoding_random_difficulty;i++){
							if( user_input_code.toLowerCase() ==
								ex_md1(
										navigator.language+"-spacing_string-"+	
										document.referrer+"-spacing_string-"+
										document.location.protocol+"-spacing_string-"+
										location.hostname + "-spacing_string-"+
										navigator.userAgent + "-spacing_string-" + 
										Math.round(((new Date().getTime())/((1000)*switching_time)))+ "-spacing_string-" + 
										i
								).substring(0, out_length).toLowerCase() ) {
								return true;
							}else{}
					}				
				}
			}
		}
		return false;		
	}
	

