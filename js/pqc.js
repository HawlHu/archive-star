/**
 * pqc.js - PQC (Kyber1024 WASM) + EXES V6.0 hybrid encryption module
 *
 * - KEM: Kyber1024 WASM
 * - Symmetric layer: EXES V6.0 (EXES-ChaCha512)
 * - EXES source: https://cdn.jplopsoft.idv.tw/exes.js
 * - CryptoJS / AES dependency removed for new ciphertexts
 */

import initKyberWasm from './pqc-kem-kyber1024.js';

const EXES_CDN_URL = 'https://cdn.jplopsoft.idv.tw/exes.js';
const PQC_EXES_FORMAT = 'PQC-KYBER1024-EXES-V1';

class PQCCrypto {
    static kem = null;
    static _initPromise = null;
    static _exesPromise = null;

    /**
     * Make sure classic-script exes.js is available.
     * exes.js publishes window.exesEncrypt / window.exesDecrypt.
     */
    static async _ensureExes() {
        if (typeof window !== 'undefined' &&
            typeof window.exesEncrypt === 'function' &&
            typeof window.exesDecrypt === 'function') {
            return true;
        }

        if (this._exesPromise) {
            return await this._exesPromise;
        }

        this._exesPromise = new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                reject(new Error('EXES requires a browser environment.'));
                return;
            }

            const validate = () => {
                if (typeof window.exesEncrypt !== 'function' ||
                    typeof window.exesDecrypt !== 'function') {
                    reject(new Error('EXES script loaded, but exesEncrypt/exesDecrypt are unavailable.'));
                    return;
                }

                // Run the built-in EXES primitive/protocol self-test when available.
                if (typeof window.exesSelfTest === 'function') {
                    const result = window.exesSelfTest();
                    if (!result || result.ok !== true) {
                        reject(new Error('EXES V6.0 self-test failed.'));
                        return;
                    }
                }

                resolve(true);
            };

            // Reuse an EXES script that the page may already have loaded/started loading.
            const scripts = document.getElementsByTagName('script');
            let existing = null;
            for (let i = 0; i < scripts.length; i++) {
                const src = scripts[i].src || '';
                if (src === EXES_CDN_URL || src.indexOf('/exes.js') !== -1) {
                    existing = scripts[i];
                    break;
                }
            }

            if (existing) {
                if (typeof window.exesEncrypt === 'function' &&
                    typeof window.exesDecrypt === 'function') {
                    validate();
                    return;
                }

                existing.addEventListener('load', validate, { once: true });
                existing.addEventListener('error', () => {
                    reject(new Error('Unable to load EXES: ' + EXES_CDN_URL));
                }, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = EXES_CDN_URL;
            script.async = true;
            script.setAttribute('data-pqc-exes', '1');
            script.onload = validate;
            script.onerror = () => {
                reject(new Error('Unable to load EXES: ' + EXES_CDN_URL));
            };
            (document.head || document.documentElement).appendChild(script);
        });

        try {
            return await this._exesPromise;
        } catch (e) {
            // Allow a later retry after a transient CDN/network failure.
            this._exesPromise = null;
            throw e;
        }
    }

    static async init() {
        if (this.kem &&
            typeof window !== 'undefined' &&
            typeof window.exesEncrypt === 'function' &&
            typeof window.exesDecrypt === 'function') {
            return;
        }

        if (!this._initPromise) {
            this._initPromise = (async () => {
                const results = await Promise.all([
                    this.kem ? Promise.resolve(this.kem) : initKyberWasm(),
                    this._ensureExes()
                ]);
                this.kem = results[0];
            })();
        }

        try {
            await this._initPromise;
        } catch (e) {
            this._initPromise = null;
            throw e;
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
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Convert Kyber shared secret bytes to a stable ASCII password for EXES.
     * Hex keeps the exact shared-secret byte sequence without Unicode ambiguity.
     */
    static _uint8ToHex(u8Array) {
        let out = '';
        for (let i = 0; i < u8Array.length; i++) {
            const h = u8Array[i].toString(16);
            out += h.length === 1 ? '0' + h : h;
        }
        return out;
    }

    static _zeroize(u8Array) {
        if (!u8Array) return;
        if (typeof u8Array.fill === 'function') {
            u8Array.fill(0);
        } else {
            for (let i = 0; i < u8Array.length; i++) u8Array[i] = 0;
        }
    }

    static async generateKeys() {
        await this.init();
        return await this.kem.keypair();
    }

    static async encrypt(word, publicKey) {
        await this.init();

        if (typeof window.exesEncrypt !== 'function') {
            throw new Error('EXES encryption engine is unavailable.');
        }

        let sharedSecret = null;
        try {
            // 1. Kyber1024 KEM encapsulation.
            const kemResult = await this.kem.encapsulate(publicKey);
            const ciphertext = kemResult.ciphertext;
            sharedSecret = kemResult.sharedSecret;

            // 2. Convert the KEM shared secret to an exact ASCII EXES password.
            const exesPassword = this._uint8ToHex(sharedSecret);

            // 3. Encrypt the retained plaintext with EXES V6.0.
            const exesCiphertext = window.exesEncrypt(String(word), exesPassword);
            if (!exesCiphertext || exesCiphertext.substr(0, 3) !== 'X60') {
                throw new Error('EXES encryption failed or returned an unexpected wire format.');
            }

            // 4. Package Kyber ciphertext + EXES ciphertext.
            // All JSON fields are ASCII, therefore btoa() is safe here.
            const payload = JSON.stringify({
                format: PQC_EXES_FORMAT,
                pqcCiphertext: this._uint8ToBase64(ciphertext),
                exesCiphertext: exesCiphertext
            });

            return btoa(payload);
        } finally {
            this._zeroize(sharedSecret);
        }
    }

    static async decrypt(encryptedBase64, privateKey) {
        await this.init();

        if (typeof window.exesDecrypt !== 'function') {
            throw new Error('EXES decryption engine is unavailable.');
        }

        let payload;
        try {
            payload = JSON.parse(atob(encryptedBase64));
        } catch (e) {
            throw new Error('Invalid PQC encrypted payload.');
        }

        // Explicitly identify the previous AES-based pqc.js payload.
        if (payload && payload.aesCiphertext && !payload.exesCiphertext) {
            throw new Error('Legacy PQC/AES retained-key data detected. Clear the old retained key and save it again with PQC/EXES.');
        }

        if (!payload ||
            payload.format !== PQC_EXES_FORMAT ||
            typeof payload.pqcCiphertext !== 'string' ||
            typeof payload.exesCiphertext !== 'string' ||
            payload.exesCiphertext.substr(0, 3) !== 'X60') {
            throw new Error('Unsupported or corrupted PQC/EXES payload format.');
        }

        const kemCiphertext = this._base64ToUint8(payload.pqcCiphertext);
        let sharedSecret = null;

        try {
            // 1. Kyber1024 KEM decapsulation restores the same shared secret.
            const kemResult = await this.kem.decapsulate(kemCiphertext, privateKey);
            sharedSecret = kemResult.sharedSecret;

            // 2. Recreate the exact EXES password.
            const exesPassword = this._uint8ToHex(sharedSecret);

            // 3. Authenticate + decrypt with EXES V6.0.
            const plaintext = window.exesDecrypt(payload.exesCiphertext, exesPassword);
            if (plaintext === '') {
                throw new Error('PQC/EXES decryption failed: invalid private key, corrupted data, or authentication failure.');
            }

            return plaintext;
        } finally {
            this._zeroize(sharedSecret);
            this._zeroize(kemCiphertext);
        }
    }
}

export { PQCCrypto };
