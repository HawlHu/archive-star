/**
 * pqc.js - PQC (Kyber1024 WASM) + AES 混合加密模組 (修正 CryptoJS 金鑰處理版)
 */

import initKyberWasm from './pqc-kem-kyber1024.js';

class PQCCrypto {
    static kem = null;

    static async init() {
        if (!this.kem) {
            this.kem = await initKyberWasm();
        }
    }

    static _uint8ToBase64(u8Array) {
        let binary = '';
        for (let i = 0; i < u8Array.byteLength; i++) {
            binary += String.fromCharCode(u8Array[i]);
        }
        return btoa(binary);
    }

    static _base64ToUint8(base64) {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * 新增：將 Uint8Array 轉為 Hex 16進位字串，用來當作 AES 的密碼字串
     */
    static _uint8ToHex(u8Array) {
        return Array.from(u8Array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static async generateKeys() {
        await this.init();
        return await this.kem.keypair(); 
    }

    static async encrypt(word, publicKey) {
        await this.init();
        
        // 1. 執行 KEM 封裝
        const { ciphertext, sharedSecret } = await this.kem.encapsulate(publicKey);

        // 2. 將 Shared Secret 轉為 Hex 字串，當作 CryptoJS 的通行密碼
        const aesPassword = this._uint8ToHex(sharedSecret);

        // 3. 使用字串密碼交給 AES 加密 (CryptoJS 會自動處理 Salt 與 IV)
        const aesCiphertext = CryptoJS.AES.encrypt(word, aesPassword).toString();

        // 4. 打包資料
        const payload = JSON.stringify({
            pqcCiphertext: this._uint8ToBase64(ciphertext),
            aesCiphertext: aesCiphertext
        });
        
        return btoa(payload);
    }

    static async decrypt(encryptedBase64, privateKey) {
        await this.init();

        const payload = JSON.parse(atob(encryptedBase64));
        const kemCiphertext = this._base64ToUint8(payload.pqcCiphertext);
        const aesCiphertext = payload.aesCiphertext;

        // 1. 執行 KEM 解封裝，還原 Shared Secret
        const { sharedSecret } = await this.kem.decapsulate(kemCiphertext, privateKey);

        // 2. 將還原出的 Shared Secret 轉為 Hex 字串
        const aesPassword = this._uint8ToHex(sharedSecret);

        // 3. 使用相同的通行密碼解密 AES 內容
        const decryptedBytes = CryptoJS.AES.decrypt(aesCiphertext, aesPassword);
        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    }
}

export { PQCCrypto };