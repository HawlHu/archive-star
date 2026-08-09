/*
	ez_mc is a simple human-machine recognition package implemented in pure JavaScript, 
	which utilizes the ex_md1 package.
*/

// Create start timer backup
var easy_man_check_gen_a_num_in_timer = 0;
var easy_man_check_gen_a_num_in_key_num = 0;

// 移除舊版的 InputBox Sample Style，因為改用 Canvas 繪製，無需透過 CSS 防選取
// var easy_man_check_gen_a_num_in_input_style="user-select:none;-webkit-user-select:none;-moz-user-select:none;";

// The simple human-machine interface is a module - Create Function.
function easy_man_check_gen_a_num(out_length, switching_time, decoding_random_difficulty){
    easy_man_check_gen_a_num_in_timer = new Date().getTime();
    return ex_md1(
        navigator.language + "-spacing_string-" +
        document.referrer + "-spacing_string-" +
        document.location.protocol + "-spacing_string-" +
        location.hostname + "-spacing_string-" +
        navigator.userAgent + "-spacing_string-" + 
        Math.round(((new Date().getTime())/((1000)*switching_time))) + "-spacing_string-" + 
        Math.round(Math.random() * decoding_random_difficulty)
    ).substring(0, out_length);
}

// 新增：將驗證碼繪製為 Canvas 圖片的函數，提升防機器人辨識難度
function render_captcha_to_canvas(text, target_element_id) {
    var canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 50;
    var ctx = canvas.getContext('2d');

    // 設定背景色
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 加入干擾線 (隨機顏色與位置)
    for (var i = 0; i < 7; i++) {
        ctx.strokeStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // 加入干擾雜訊點
    for (var i = 0; i < 40; i++) {
        ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    // 繪製文字 (加入隨機旋轉與偏移)
    ctx.font = 'bold 30px Geneva, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (var i = 0; i < text.length; i++) {
        var x = 30 + i * 30; // 每個字的 X 軸間距
        var y = 25;          // Y 軸置中
        var angle = (Math.random() - 0.5) * 0.8; // 隨機旋轉角度
        var color = '#' + (Math.random() * 0x888888 + 0x777777 | 0).toString(16); // 偏亮的隨機色
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }

    // 將產生的 Canvas 塞入指定的 DOM 容器中
    var target = document.getElementById(target_element_id);
    if (target) {
        target.innerHTML = ''; // 清空原有內容
        target.appendChild(canvas);
    }
}

// The simple human-machine interface is a module - Check Function.
function easy_man_check_gen_a_num_check(user_input_code, out_length, switching_time, decoding_random_difficulty, user_presses_key){
    if(user_presses_key >= out_length){
        if(easy_man_check_gen_a_num_in_timer >= 1){
            if((new Date().getTime() - easy_man_check_gen_a_num_in_timer) >= ((2500 / 4) * out_length)){
                for(var i = 0; i != decoding_random_difficulty; i++){
                    if( user_input_code.toLowerCase() ==
                        ex_md1(
                            navigator.language + "-spacing_string-" +	
                            document.referrer + "-spacing_string-" +
                            document.location.protocol + "-spacing_string-" +
                            location.hostname + "-spacing_string-" +
                            navigator.userAgent + "-spacing_string-" + 
                            Math.round(((new Date().getTime())/((1000)*switching_time))) + "-spacing_string-" + 
                            i
                        ).substring(0, out_length).toLowerCase() ) {
                        return true;
                    }
                }				
            }
        }
    }
    return false;		
}