/**
 * show_message
 * 取代原生 alert() 的高質感提示視窗
 *
 * 特色：
 * 1. 純 JS，無須任何 CSS 檔案或外部 Library。
 * 2. 支援 RWD (手機/平板/桌機)。
 * 3. 玻璃擬態 (Glassmorphism) + 彈跳動畫效果。
 * 4. 點擊任意處關閉，並自動恢復頁面滾動。
 * 5. 嚴格的錯誤處理與 DOM 清理。
 *
 * @param {string} message - 要顯示的訊息內容 (支援 HTML)
 */
function show_message(message) {
    // 1. 定義元件 ID，用於識別與防重複
    const OVERLAY_ID = 'js-show-message-overlay';
    const STYLE_ID = 'js-show-message-style';

    // 2. 嚴謹檢查：如果已經存在舊的視窗，先強制移除，避免堆疊
    const existingOverlay = document.getElementById(OVERLAY_ID);
    const existingStyle = document.getElementById(STYLE_ID);
    if (existingOverlay) existingOverlay.remove();
    if (existingStyle) existingStyle.remove();

    // 3. 鎖定背景滾動 (Body Scroll Lock)
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 4. 動態注入 CSS (確保樣式獨立，不汙染外部，也不依賴外部)
    const css = `
        #${OVERLAY_ID} {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.0); /* 初始透明，用於淡入 */
            backdrop-filter: blur(0px); /* 初始無模糊 */
            z-index: 2147483647; /* 瀏覽器允許的最大 Z-index */
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease-out;
            opacity: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        #${OVERLAY_ID}.active {
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px); /* 酷炫毛玻璃效果 */
            opacity: 1;
        }

        #${OVERLAY_ID} .msg-box {
            background: rgba(255, 255, 255, 0.95);
            padding: 30px 40px;
            border-radius: 12px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            max-width: 90%;
            min-width: 300px;
            text-align: center;
            transform: scale(0.8) translateY(20px);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 彈跳貝茲曲線 */
            opacity: 0;
            border: 1px solid rgba(255,255,255,0.3);
        }

        #${OVERLAY_ID}.active .msg-box {
            transform: scale(1) translateY(0);
            opacity: 1;
        }

        #${OVERLAY_ID} .msg-content {
            font-size: 1.25rem;
            color: #333;
            line-height: 1.6;
            font-weight: 600;
            word-wrap: break-word;
        }

        #${OVERLAY_ID} .msg-hint {
            margin-top: 20px;
            font-size: 0.85rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* RWD 手機版調整 */
        @media (max-width: 480px) {
            #${OVERLAY_ID} .msg-box {
                width: 85%;
                padding: 25px;
            }
            #${OVERLAY_ID} .msg-content {
                font-size: 1.1rem;
            }
        }
    `;

    // 建立 style 標籤
    const styleTag = document.createElement('style');
    styleTag.id = STYLE_ID;
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // 5. 建立 DOM 結構
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    
    // 為了安全，防止 message 含有惡意 script，這裡雖然用 innerHTML 但建議傳入純文字或受控的 HTML
    overlay.innerHTML = `
        <div class="msg-box">
            <div class="msg-content">${message}</div>
            <div class="msg-hint">Click anywhere to close</div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 6. 觸發動畫 (使用 requestAnimationFrame 確保 DOM 渲染後才加 class)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    });

    // 7. 定義關閉函式 (封裝以確保能正確移除監聽器)
    const closeOverlay = (e) => {
        // 防止事件冒泡導致多次觸發(雖已移除監聽，但保險起見)
        e.preventDefault();
        e.stopPropagation();

        // 開始退場動畫
        overlay.classList.remove('active');

        // 等待動畫結束後移除 DOM
        overlay.addEventListener('transitionend', () => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (styleTag.parentNode) {
                styleTag.parentNode.removeChild(styleTag);
            }
            // 恢復背景滾動
            document.body.style.overflow = originalOverflow;
        }, { once: true });
    };

    // 8. 綁定點擊事件 (點擊遮罩或文字框皆可關閉)
    overlay.addEventListener('click', closeOverlay);
    
    // 支援鍵盤 ESC 關閉 (增強無障礙體驗)
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeOverlay(e);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}