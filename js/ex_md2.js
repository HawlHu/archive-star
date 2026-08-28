function es1_safe_encodeURI(str) {
    var output = "";
    var hexChars = "0123456789ABCDEF";

    var safeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'();,/?@&=+$#";

    function percentEncode(byteVal) {
        var high = (byteVal >> 4) & 0x0F; // 取得高 4-bit
        var low = byteVal & 0x0F;       // 取得低 4-bit
        return "%" + hexChars.charAt(high) + hexChars.charAt(low);
    }

    for (var i = 0; i < str.length; i++) {
        var c_code = str.charCodeAt(i);
        var c_char = str.charAt(i);

        // 檢查是否為安全字元
        var isSafe = false;
        for (var j = 0; j < safeChars.length; j++) {
            if (safeChars.charAt(j) == c_char) {
                isSafe = true;
                break;
            }
        }

        if (isSafe) {
            output += c_char;
        } else {
            if (c_code >= 0 && c_code <= 127) {
                output += percentEncode(c_code);
            } 
            else if (c_code >= 128 && c_code <= 2047) {
                var byte1 = 192 | (c_code >> 6);         // 110xxxxx
                var byte2 = 128 | (c_code & 63);       // 10xxxxxx
                output += percentEncode(byte1) + percentEncode(byte2);
            } 
            else if (c_code >= 2048 && c_code <= 65535) {
                var byte1 = 224 | (c_code >> 12);        // 1110xxxx
                var byte2 = 128 | ((c_code >> 6) & 63);  // 10xxxxxx
                var byte3 = 128 | (c_code & 63);       // 10xxxxxx
                output += percentEncode(byte1) + percentEncode(byte2) + percentEncode(byte3);
            }
        }
    }
    return output;
}

function ex_md2(a) {
    var b = "rt478aGHLTdbADEFyu3MeRfhi6mnQj";
    var M = 2147483629;
    var s = [19850721, 98765432, 12345678, 55119733];
    
    a = es1_safe_encodeURI(a) + b; // 使用 b (charset) 作為 salt

    for (var i = 0; i < a.length; i++) {
        var c = a.charCodeAt(i);
        s[0] = (s[0] * 16807 + c) % M;
        s[1] = (s[1] * 48271 + s[0]) % M;
        s[2] = (s[2] ^ s[0]) % M;

        if(s[2] < 0) s[2] += M; 
        
        s[3] = (s[3] + s[1] + c * 13) % M;
    }

    var res = "";
    for (var i = 0; i < 41; i++) {
        s[0] = (s[0] * 16807) % M;
        s[1] = (s[1] * 37 + s[0]) % M;
        s[2] = (s[2] + s[3] + i) % M;
        s[3] = (s[3] * 48271) % M;
        
        var idx = (s[0] + s[1] + s[2] + s[3]) % 30;

        if (idx < 0) idx += 30;
        
        res += b.charAt(idx);
    }
    return res;
}

//加密n次
function ex_md2n(a,n) {
	for(var i=0; i < n;i++){
		a=ex_md2(a);
	}
	return a;
}