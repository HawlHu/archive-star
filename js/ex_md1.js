
//Expansion - Message Digest Randomize
	function ex_md1_rand(encode_str){
		var rand_node_temp=Math.round((Math.random() * (211 - 101)) + 101);
		return ex_md1(encode_str.toString() + "_exmd1rand_" + rand_node_temp.toString());
	}
	
//Expansion - Message Digest Randomize Check
	function ex_md1_rand_check(encode_str,ex_md1_str){
		var check_is=false;
		for(var i=101;i!=(211+1);i++){
			if(ex_md1(encode_str.toString() + "_exmd1rand_" + (i).toString())==ex_md1_str)check_is=true;
		}
		if(check_is){
			return true;
		}else{
			return false;
		}
	}


//Expansion - Message Digest 1.2
	function ex_md1(encode_str){
		//宣告
			var chr_select=				"rt478aGHLTdbADEFyu3MeRfhi6mnQj";
			var prime_number=	Array(
										19,     31,     109,    199,    409,    571,    631,    829,    1489,   1999, 
										2341,   2971,   3529,   4621,   4789,   7039,   7669,   8779,   9721,   10459, 
										10711,  13681,  14851,  16069,  16381,  17659,  20011,  20359,  23251,  25939, 
										27541,  29191,  29611,  31321,  34429,  36739,  40099,  40591,  42589,  5, 
										13,     41,     61,     113,    181,    313,    421,    613,    761,    1013, 
										1201,   1301,   1741,   1861,   2113,   2381,   2521,   3121,   3613,   4513, 
										5101,   7321,   8581,   9661,   9941,   10513,  12641,  13613,  14281,  14621, 
										15313,  16381,  19013,  19801,  20201,  21013,  21841,  23981,  24421,  26681
							);

			var hash_number = Array(
										0,      0,     	0,    	0,    	0,    	0,    	0,    	0,    	0,   	0, 
										0,   	0,   	0,   	0,   	0,   	0,   	0,   	0,   	0,   	0, 
										0,  	0,  	0,  	0,  	0,  	0,  	0,  	0,  	0,  	0, 
										0,  	0,  	0,  	0,  	0,  	0,  	0,  	0,  	0,  	0, 
										0,     	0,     	0,     	0,    	0,    	0,    	0,    	0,    	0,    	0, 
										0,   	0,   	0,   	0,   	0,   	0,   	0,   	0,   	0,   	0, 
										0,   	0,   	0,   	0,   	0,   	0,  	0,  	0,  	0,  	0, 
										0,  	0,  	0,  	0,  	0,  	0,  	0,  	0,  	0,  	0
							);
			
			var prime_remainder=			55119733;
			var prime_temporary_hash_code=	913571;

			//UrlEncode	
				encode_str=					encodeURI(encode_str);
			
			encode_str +=				"29370129709106503393731231206507";
			
			var basic_string_set=		"";
			var encode_out=				"";
			
			
		//透過質數陣列進行雜湊
			for(var for_i=0;for_i!=encode_str.length;for_i++){
				
				for(var for_j=0;for_j!=(prime_number.length);for_j++){ 
					
					
					hash_number[for_j] +=	(
												prime_number[   
													(
															encode_str.substr(for_i,1).charCodeAt() +
															for_i +
															for_j +
															prime_temporary_hash_code
													) % 
													prime_number.length
												]
											) %
											prime_remainder;
					 
					
					prime_temporary_hash_code=hash_number[for_j] ;
					
				}
				
			}

		//將雜湊數字變成單一字串
			basic_string_set = hash_number.join("");

		//轉換成可用密碼字元
			for(for_i=0;for_i<=basic_string_set.length-2;for_i+=2)
				encode_out += 	chr_select.substr(
									(basic_string_set.substr(for_i,2)) % chr_select.length   ,
									1
								);

			return encode_out.substr(0,41);
	}