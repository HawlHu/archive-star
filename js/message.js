/**
 * show_message (兼容版)
 * 支援: IE8+, Edge, Chrome, Firefox, Safari
 */
function show_message(message) {
    // 1. 變數改用 var (兼容 ES5)
    var OVERLAY_ID = 'js-show-message-overlay';
    var STYLE_ID = 'js-show-message-style';

    // 2. 輔助函式：跨瀏覽器事件綁定
    function addEvent(el, type, handler) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, function() {
                // IE8 的 this 指向 window，需修正指向 element，並包裝 event
                var e = window.event;
                e.preventDefault = function() { e.returnValue = false; };
                e.stopPropagation = function() { e.cancelBubble = true; };
                // 兼容 key 屬性
                if (e.keyCode === 27) e.key = 'Escape'; 
                handler.call(el, e);
            });
        }
    }

    function removeEvent(el, type, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(type, handler, false);
        } else if (el.detachEvent) {
            el.detachEvent('on' + type, handler);
        }
    }

    // 3. 移除舊元素 (兼容寫法: parentNode.removeChild)
    var existingOverlay = document.getElementById(OVERLAY_ID);
    var existingStyle = document.getElementById(STYLE_ID);
    if (existingOverlay && existingOverlay.parentNode) existingOverlay.parentNode.removeChild(existingOverlay);
    if (existingStyle && existingStyle.parentNode) existingStyle.parentNode.removeChild(existingStyle);

    // 4. 鎖定 Body (IE8 document.body 可能尚不存在，需判斷)
    var body = document.body || document.documentElement;
    var originalOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    // 5. CSS 兼容處理 (改用 table 垂直置中以兼容 IE8，移除 flex)
    // 注意: IE8 不支援 rgba，這裡使用 rgb 降級，若需透明需用 filter (在此省略 filter 以免代碼過長)
    var css = 
        '#' + OVERLAY_ID + ' { ' +
            'position: fixed; top: 0; left: 0; width: 100%; height: 100%; ' +
            'background-color: rgb(0, 0, 0); ' + /* IE8 fallback */
            'background-color: rgba(0, 0, 0, 0.0); ' +
            'z-index: 99999; ' +
            'display: table; ' + /* 取代 flex */
            'width: 100%; height: 100%; ' +
            'text-align: center; ' +
            'opacity: 0; ' +
            'transition: opacity 0.3s ease-out; ' +
        '} ' +
        '#' + OVERLAY_ID + '.active { ' +
            'background-color: rgba(0, 0, 0, 0.6); ' +
            'opacity: 1; ' +
        '} ' +
        '.msg-cell { display: table-cell; vertical-align: middle; } ' + /* 垂直置中核心 */
        '#' + OVERLAY_ID + ' .msg-box { ' +
            'background: #fff; padding: 30px 40px; ' +
            'display: inline-block; ' + /* 配合 text-align center */
            'border-radius: 12px; ' +
            'box-shadow: 0 20px 50px rgba(0,0,0,0.3); ' +
            'max-width: 90%; min-width: 300px; ' +
            'text-align: center; border: 1px solid #ccc; ' +
            'transform: scale(0.8) translateY(20px); ' +
            'transition: all 0.3s; ' +
            'opacity: 0; ' +
        '} ' +
        '#' + OVERLAY_ID + '.active .msg-box { ' +
            'transform: scale(1) translateY(0); ' +
            'opacity: 1; ' +
        '} ' +
        '#' + OVERLAY_ID + ' .msg-content { font-size: 18px; color: #333; line-height: 1.6; font-weight: bold; } ' +
        '#' + OVERLAY_ID + ' .msg-hint { margin-top: 20px; font-size: 12px; color: #888; text-transform: uppercase; }';

    // 6. 注入 CSS (IE8 特殊處理)
    var styleTag = document.createElement('style');
    styleTag.id = STYLE_ID;
    styleTag.type = 'text/css';
    if (styleTag.styleSheet) {
        styleTag.styleSheet.cssText = css; // IE8 專用
    } else {
        styleTag.appendChild(document.createTextNode(css)); // 標準瀏覽器
    }
    document.getElementsByTagName('head')[0].appendChild(styleTag);

    // 7. 建立 DOM (改用字串拼接)
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    // 增加一層 .msg-cell 用於 table-cell 垂直置中
    overlay.innerHTML = 
        '<div class="msg-cell">' +
            '<div class="msg-box">' +
                '<div class="msg-content">' + message + '</div>' +
                '<div class="msg-hint">Click anywhere to close</div>' +
            '</div>' +
        '</div>';
    
    body.appendChild(overlay);

    // 8. 觸發動畫 (Polyfill requestAnimationFrame)
    var raf = window.requestAnimationFrame || function(cb) { setTimeout(cb, 16); };
    
    raf(function() {
        raf(function() {
            // IE8/9 不支援 classList，使用 className
            overlay.className += ' active';
        });
    });

    // 9. 關閉邏輯
    function closeOverlay(e) {
        if (!e) var e = window.event;
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();

        // 移除 class (正則表達式)
        overlay.className = overlay.className.replace(new RegExp('(^|\\b)' + 'active' + '(\\b|$)', 'gi'), ' ');

        // 偵測是否支援 transition
        var transitionSupported = ('transition' in document.documentElement.style) || ('WebkitTransition' in document.documentElement.style);

        function removeDOM() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (styleTag.parentNode) styleTag.parentNode.removeChild(styleTag);
            body.style.overflow = originalOverflow;
            removeEvent(document, 'keydown', escHandler);
        }

        if (transitionSupported) {
            // 有動畫支援：等待動畫結束
            var contentBox = overlay.getElementsByTagName('div')[0]; // 綁定在內層較保險
            // 使用 setTimeout 作為保險，防止 transitionend 沒觸發
            var timer = setTimeout(removeDOM, 350); 
            // 這裡簡化邏輯，直接用 timer 移除，避免 IE9/10 事件兼容性的複雜度
        } else {
            // IE8/9 無動畫：直接移除
            removeDOM();
        }
    }

    // 10. 綁定事件
    addEvent(overlay, 'click', closeOverlay);

    // ESC 鍵盤事件
    var escHandler = function(e) {
        var key = e.key || e.keyCode;
        if (key === 'Escape' || key === 27) {
            closeOverlay(e);
        }
    };
    addEvent(document, 'keydown', escHandler);
}