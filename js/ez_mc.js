/*
    ez_mc (Secure Static Edition)
    利用 exes.js 與 Web Crypto API 進行靜態環境下的高強度防護。
    驗證碼明文與繪圖邏輯完全封裝在閉包內，杜絕外洩風險。
*/

// 保留全域變數以維持外部按鍵計數相容性
var easy_man_check_gen_a_num_in_key_num = 0;

const EZ_MC_CORE = (function() {
    "use strict";
    
    // 私有變數：無法從外部 Console 讀取與竄改
    let _encryptedCaptcha = "";
    let _sessionKey = "";
    let _initTime = 0;

    // 1. 密碼學安全的隨機整數產生器
    function getSecureRandomInt(min, max) {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        const randomNumber = randomBuffer[0] / (0xffffffff + 1);
        return Math.floor(randomNumber * (max - min + 1)) + min;
    }

    // 2. 產生安全的驗證碼字串
    function generateSecureString(length) {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars[getSecureRandomInt(0, chars.length - 1)];
        }
        return result;
    }

    // 3. 私有繪圖函數 (取代原本外露的 render_captcha_to_canvas)
    function _renderToCanvas(text, target_element_id) {
        var canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 50;
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 使用 Crypto 隨機數繪製干擾線
        for (var i = 0; i < 7; i++) {
            ctx.strokeStyle = '#' + getSecureRandomInt(0, 16777215).toString(16);
            ctx.beginPath();
            ctx.moveTo(getSecureRandomInt(0, canvas.width), getSecureRandomInt(0, canvas.height));
            ctx.lineTo(getSecureRandomInt(0, canvas.width), getSecureRandomInt(0, canvas.height));
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // 使用 Crypto 隨機數繪製雜訊點
        for (var i = 0; i < 40; i++) {
            ctx.fillStyle = '#' + getSecureRandomInt(0, 16777215).toString(16);
            ctx.beginPath();
            ctx.arc(getSecureRandomInt(0, canvas.width), getSecureRandomInt(0, canvas.height), 1, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.font = 'bold 30px Geneva, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 繪製文字 (加入隨機旋轉與偏移)
        for (var i = 0; i < text.length; i++) {
            var x = 30 + i * 30; 
            var y = 25;          
            var random_angle = (getSecureRandomInt(0, 100) / 100);
            var angle = (random_angle - 0.5) * 0.8; 
            var color = '#' + getSecureRandomInt(0x777777, 0xFFFFFF).toString(16); 
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }

        var target = document.getElementById(target_element_id);
        if (target) {
            target.innerHTML = ''; 
            target.appendChild(canvas);
        }
    }

    return {
        // 封裝生成與繪圖，不回傳明文
        generateAndRender: function(out_length, target_element_id) {
            _initTime = new Date().getTime();
            _sessionKey = navigator.userAgent + "-secret-" + _initTime;
            
            const plainText = generateSecureString(out_length);
            
            if (typeof exesEncrypt === 'function') {
                _encryptedCaptcha = exesEncrypt(plainText, _sessionKey);
            }
            
            if (target_element_id) {
                _renderToCanvas(plainText, target_element_id);
            }
            // 結束執行，plainText 從記憶體中釋放，僅保留密文
        },
        
        check: function(userInput, out_length, user_presses_key) {
            if (user_presses_key < out_length) return false;
            
            const timeDiff = new Date().getTime() - _initTime;
            if (timeDiff < ((2500 / 4) * out_length)) return false;

            if (typeof exesDecrypt !== 'function') return false;
            
            const decryptedAnswer = exesDecrypt(_encryptedCaptcha, _sessionKey);
            
            if (decryptedAnswer && userInput.toLowerCase() === decryptedAnswer.toLowerCase()) {
                return true;
            }
            return false;
        }
    };
})();

// ==========================================
// 外部相容介面 (提供 HTML 呼叫)
// ==========================================

// 將原本的參數簽名簡化，傳入字元長度與目標 DOM ID 即可
function easy_man_check_gen_a_num(out_length, target_element_id) {
    EZ_MC_CORE.generateAndRender(out_length, target_element_id);
}

function easy_man_check_gen_a_num_check(user_input_code, out_length, switching_time, decoding_random_difficulty, user_presses_key) {
    return EZ_MC_CORE.check(user_input_code, out_length, user_presses_key);
}