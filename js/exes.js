/**
 * EXES V5.9.1 LTS — IE11 to Modern Chrome
 * exes.js (EXtended Encryption Standard)
 *
 * Browser compatibility profile:
 * - ECMAScript 5 syntax baseline: no let/const, arrow functions, classes, Promise, BigInt,
 *   TextEncoder/TextDecoder, Map/Set, or other ES2015+ runtime dependencies.
 * - Internet Explorer 11 uses window.msCrypto.getRandomValues().
 * - Modern Chrome/Edge/Firefox/Safari use window.crypto.getRandomValues().
 * - Node.js uses crypto.randomBytes() only when no browser window object exists.
 * - No Math.random() fallback and no crypto.subtle dependency.
 *
 * V5.9.1 security profile:
 * - Standard ChaCha20 stream block (20 rounds + feed-forward); raw internal state is never emitted.
 * - HMAC-SHA-512 authentication with an independent 512-bit HKDF-SHA-512-derived MAC key.
 * - HKDF-SHA-512 domain separation for the 256-bit ChaCha20 key and 512-bit MAC key.
 * - SHA-512-based deterministic nonce derivation from the full 144-bit IV.
 * - Strict UTF-16 password validation; unpaired surrogates are rejected.
 * - CSPRNG is mandatory for encryption; there is no Math.random() fallback.
 * - Ciphertext prefix: X5A.
 * - V5.8 compatibility code has been completely removed.
 *
 * IMPORTANT: Earlier X59 drafts are intentionally not accepted by this profile.
 */

// =============================================================================
// EXES V5.9 hardened core
// =============================================================================
var _EXES_CORE_V59 = (function() {
    "use strict";

    var VERSION_PREFIX = "X5A";
    var CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var C_MAP = CHARSET.split('');
    var DECODE_MAP = new Array(128);
    var MAX_PAYLOAD_SIZE = 64 * 1024 * 1024;
    var MAX_PASSWORD_SIZE = 1024 * 1024;
    var i;

    for (i = 0; i < 128; i++) DECODE_MAP[i] = -1;
    for (i = 0; i < 62; i++) DECODE_MAP[CHARSET.charCodeAt(i)] = i;

    function zeroize(arr) {
        if (!arr) return;
        for (var z = 0; z < arr.length; z++) arr[z] = 0;
    }

    // Strict UTF-16 -> UTF-8. V5.8 mapped every unpaired surrogate to U+FFFD,
    // which allowed distinct JavaScript strings to become equivalent passwords.
    // V5.9 rejects such strings instead.
    function strToUTF8Strict(value) {
        var s = String(value), out = [], j = 0, c, c2, u;
        for (j = 0; j < s.length; j++) {
            c = s.charCodeAt(j);
            if (c >= 0xD800 && c <= 0xDBFF) {
                if (j + 1 >= s.length) return null;
                c2 = s.charCodeAt(j + 1);
                if (c2 < 0xDC00 || c2 > 0xDFFF) return null;
                u = ((c - 0xD800) << 10) + (c2 - 0xDC00) + 0x10000;
                out.push(0xF0 | (u >>> 18));
                out.push(0x80 | ((u >>> 12) & 0x3F));
                out.push(0x80 | ((u >>> 6) & 0x3F));
                out.push(0x80 | (u & 0x3F));
                j++;
            } else if (c >= 0xDC00 && c <= 0xDFFF) {
                return null;
            } else if (c < 0x80) {
                out.push(c);
            } else if (c < 0x800) {
                out.push(0xC0 | (c >>> 6));
                out.push(0x80 | (c & 0x3F));
            } else {
                out.push(0xE0 | (c >>> 12));
                out.push(0x80 | ((c >>> 6) & 0x3F));
                out.push(0x80 | (c & 0x3F));
            }
        }
        return out;
    }

    function utf8ToStrStrict(bytes) {
        if (!bytes || bytes.length === 0) return "";
        var out = [], j = 0, c, c2, c3, c4, u;
        while (j < bytes.length) {
            c = bytes[j++];
            if (c < 0x80) {
                out.push(String.fromCharCode(c));
            } else if (c >= 0xC2 && c <= 0xDF) {
                if (j >= bytes.length) return null;
                c2 = bytes[j++];
                if ((c2 & 0xC0) !== 0x80) return null;
                out.push(String.fromCharCode(((c & 0x1F) << 6) | (c2 & 0x3F)));
            } else if (c >= 0xE0 && c <= 0xEF) {
                if (j + 1 >= bytes.length) return null;
                c2 = bytes[j++]; c3 = bytes[j++];
                if ((c2 & 0xC0) !== 0x80 || (c3 & 0xC0) !== 0x80) return null;
                if (c === 0xE0 && c2 < 0xA0) return null;
                if (c === 0xED && c2 >= 0xA0) return null;
                u = ((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
                if (u < 0x0800 || (u >= 0xD800 && u <= 0xDFFF)) return null;
                out.push(String.fromCharCode(u));
            } else if (c >= 0xF0 && c <= 0xF4) {
                if (j + 2 >= bytes.length) return null;
                c2 = bytes[j++]; c3 = bytes[j++]; c4 = bytes[j++];
                if ((c2 & 0xC0) !== 0x80 || (c3 & 0xC0) !== 0x80 || (c4 & 0xC0) !== 0x80) return null;
                if (c === 0xF0 && c2 < 0x90) return null;
                if (c === 0xF4 && c2 >= 0x90) return null;
                u = ((c & 0x07) << 18) | ((c2 & 0x3F) << 12) | ((c3 & 0x3F) << 6) | (c4 & 0x3F);
                if (u < 0x10000 || u > 0x10FFFF) return null;
                u -= 0x10000;
                out.push(String.fromCharCode(0xD800 | (u >>> 10), 0xDC00 | (u & 0x3FF)));
            } else {
                return null;
            }
        }
        return out.join('');
    }

    function asciiBytes(s) {
        var out = new Array(s.length);
        for (var a = 0; a < s.length; a++) out[a] = s.charCodeAt(a) & 0x7F;
        return out;
    }

    // V5.9.1 LTS never falls back to Math.random().
    // IE11 path: window.msCrypto.getRandomValues().
    // Modern browser path: window.crypto.getRandomValues().
    // If a browser window exists but neither source is usable, encryption fails closed;
    // it will not fall through to a bundler-provided require() shim.
    function secureRandomBytes(count) {
        var out, cryptoObj, offset, take, view, nodeCrypto, buf, n;

        if (typeof window !== "undefined") {
            try {
                cryptoObj = null;
                if (window.crypto && typeof window.crypto.getRandomValues === "function") {
                    cryptoObj = window.crypto;
                } else if (window.msCrypto && typeof window.msCrypto.getRandomValues === "function") {
                    cryptoObj = window.msCrypto;
                }

                if (cryptoObj && typeof Uint8Array !== "undefined") {
                    out = new Array(count);
                    offset = 0;
                    while (offset < count) {
                        // Web Crypto getRandomValues() rejects views larger than 65,536 bytes.
                        take = Math.min(65536, count - offset);
                        view = new Uint8Array(take);
                        cryptoObj.getRandomValues(view);
                        for (n = 0; n < take; n++) out[offset + n] = view[n];
                        offset += take;
                    }
                    return out;
                }
            } catch (e1) {}
            return null;
        }

        try {
            if (typeof require === "function") {
                nodeCrypto = require("crypto");
                if (nodeCrypto && nodeCrypto.randomBytes) {
                    buf = nodeCrypto.randomBytes(count);
                    out = new Array(count);
                    for (n = 0; n < count; n++) out[n] = buf[n];
                    return out;
                }
            }
        } catch (e2) {}
        return null;
    }

    function environmentTest() {
        var isBrowser = (typeof window !== "undefined");
        var ua = "";
        var isIE11 = false;
        var typedArray = false;
        var cryptoSource = "none";
        var randomOK = false;
        var primitive = null;
        var roundTrip = false;
        var probe = null;
        var cipher = "";
        var plain = "";

        try {
            if (typeof navigator !== "undefined" && navigator.userAgent) ua = String(navigator.userAgent);
        } catch (e0) {}
        isIE11 = /Trident\/7\.0.*rv:11\.0/.test(ua);

        try {
            typedArray = (typeof Uint8Array !== "undefined") && (new Uint8Array(1)).length === 1;
        } catch (e1) { typedArray = false; }

        if (isBrowser) {
            try {
                if (window.crypto && typeof window.crypto.getRandomValues === "function") {
                    cryptoSource = "window.crypto.getRandomValues";
                } else if (window.msCrypto && typeof window.msCrypto.getRandomValues === "function") {
                    cryptoSource = "window.msCrypto.getRandomValues";
                }
            } catch (e2) {}
        } else if (typeof require === "function") {
            cryptoSource = "node:crypto.randomBytes";
        }

        probe = secureRandomBytes(32);
        randomOK = !!(probe && probe.length === 32);
        zeroize(probe);

        primitive = selfTest();
        if (randomOK && primitive.ok) {
            cipher = enc("EXES-LTS-IE11-ROUNDTRIP", "LTS-Test-Key-1234567890");
            plain = dec(cipher, "LTS-Test-Key-1234567890");
            roundTrip = (plain === "EXES-LTS-IE11-ROUNDTRIP");
        }

        return {
            version: "5.9.1",
            build: "LTS-IE11-MODERN",
            target: "IE11 to Modern Chrome",
            es5SyntaxBaseline: true,
            browser: isBrowser,
            ie11: isIE11,
            typedArray: typedArray,
            csprng: randomOK,
            csprngSource: cryptoSource,
            primitives: primitive,
            roundTrip: roundTrip,
            encryptionReady: typedArray && randomOK && primitive.ok && roundTrip
        };
    }

    // -------------------------------------------------------------------------
    // SHA-512 / HMAC-SHA-512 / HKDF-SHA-512
    // 64-bit words are represented as signed 32-bit high/low pairs so this stays
    // compatible with classic JavaScript engines without BigInt.
    // -------------------------------------------------------------------------
    var SHA512_K = [
        0x428a2f98,0xd728ae22, 0x71374491,0x23ef65cd, 0xb5c0fbcf,0xec4d3b2f, 0xe9b5dba5,0x8189dbbc,
        0x3956c25b,0xf348b538, 0x59f111f1,0xb605d019, 0x923f82a4,0xaf194f9b, 0xab1c5ed5,0xda6d8118,
        0xd807aa98,0xa3030242, 0x12835b01,0x45706fbe, 0x243185be,0x4ee4b28c, 0x550c7dc3,0xd5ffb4e2,
        0x72be5d74,0xf27b896f, 0x80deb1fe,0x3b1696b1, 0x9bdc06a7,0x25c71235, 0xc19bf174,0xcf692694,
        0xe49b69c1,0x9ef14ad2, 0xefbe4786,0x384f25e3, 0x0fc19dc6,0x8b8cd5b5, 0x240ca1cc,0x77ac9c65,
        0x2de92c6f,0x592b0275, 0x4a7484aa,0x6ea6e483, 0x5cb0a9dc,0xbd41fbd4, 0x76f988da,0x831153b5,
        0x983e5152,0xee66dfab, 0xa831c66d,0x2db43210, 0xb00327c8,0x98fb213f, 0xbf597fc7,0xbeef0ee4,
        0xc6e00bf3,0x3da88fc2, 0xd5a79147,0x930aa725, 0x06ca6351,0xe003826f, 0x14292967,0x0a0e6e70,
        0x27b70a85,0x46d22ffc, 0x2e1b2138,0x5c26c926, 0x4d2c6dfc,0x5ac42aed, 0x53380d13,0x9d95b3df,
        0x650a7354,0x8baf63de, 0x766a0abb,0x3c77b2a8, 0x81c2c92e,0x47edaee6, 0x92722c85,0x1482353b,
        0xa2bfe8a1,0x4cf10364, 0xa81a664b,0xbc423001, 0xc24b8b70,0xd0f89791, 0xc76c51a3,0x0654be30,
        0xd192e819,0xd6ef5218, 0xd6990624,0x5565a910, 0xf40e3585,0x5771202a, 0x106aa070,0x32bbd1b8,
        0x19a4c116,0xb8d2d0c8, 0x1e376c08,0x5141ab53, 0x2748774c,0xdf8eeb99, 0x34b0bcb5,0xe19b48a8,
        0x391c0cb3,0xc5c95a63, 0x4ed8aa4a,0xe3418acb, 0x5b9cca4f,0x7763e373, 0x682e6ff3,0xd6b2b8a3,
        0x748f82ee,0x5defb2fc, 0x78a5636f,0x43172f60, 0x84c87814,0xa1f0ab72, 0x8cc70208,0x1a6439ec,
        0x90befffa,0x23631e28, 0xa4506ceb,0xde82bde9, 0xbef9a3f7,0xb2c67915, 0xc67178f2,0xe372532b,
        0xca273ece,0xea26619c, 0xd186b8c7,0x21c0c207, 0xeada7dd6,0xcde0eb1e, 0xf57d4f7f,0xee6ed178,
        0x06f067aa,0x72176fba, 0x0a637dc5,0xa2c898a6, 0x113f9804,0xbef90dae, 0x1b710b35,0x131c471b,
        0x28db77f5,0x23047d84, 0x32caab7b,0x40c72493, 0x3c9ebe0a,0x15c9bebc, 0x431d67c4,0x9c100d4c,
        0x4cc5d4be,0xcb3e42b6, 0x597f299c,0xfc657e2a, 0x5fcb6fab,0x3ad6faec, 0x6c44198c,0x4a475817
    ];

    function rotr64(h,l,n) {
        var m;
        h|=0; l|=0;
        if (n===32) return [l,h];
        if (n<32) return [((h>>>n)|(l<<(32-n)))|0, ((l>>>n)|(h<<(32-n)))|0];
        m=n-32;
        return [((l>>>m)|(h<<(32-m)))|0, ((h>>>m)|(l<<(32-m)))|0];
    }
    function shr64(h,l,n) {
        if (n===32) return [0,h>>>0];
        if (n<32) return [(h>>>n)>>>0, ((l>>>n)|(h<<(32-n)))>>>0];
        return [0,(h>>>(n-32))>>>0];
    }
    function xor64_3(a,b,c) { return [(a[0]^b[0]^c[0])|0,(a[1]^b[1]^c[1])|0]; }
    function add64() {
        var lo=0, hi=0, carry=0, i4, x, old;
        for(i4=0;i4<arguments.length;i4++) {
            x=arguments[i4]; old=lo>>>0; lo=(lo+(x[1]>>>0))>>>0;
            if ((lo>>>0)<old) carry++;
            hi=(hi+(x[0]>>>0))>>>0;
        }
        hi=(hi+carry)>>>0;
        return [hi|0,lo|0];
    }

    function SHA512() {
        this.h=[
            0x6a09e667|0,0xf3bcc908|0, 0xbb67ae85|0,0x84caa73b|0,
            0x3c6ef372|0,0xfe94f82b|0, 0xa54ff53a|0,0x5f1d36f1|0,
            0x510e527f|0,0xade682d1|0, 0x9b05688c|0,0x2b3e6c1f|0,
            0x1f83d9ab|0,0xfb41bd6b|0, 0x5be0cd19|0,0x137e2179|0
        ];
        this.buf=new Array(128); this.bufLen=0; this.bytesLo=0; this.bytesHi=0; this.finished=false;
    }
    SHA512.prototype._addLength=function(n){
        var old=this.bytesLo>>>0;
        this.bytesLo=(this.bytesLo+(n>>>0))>>>0;
        if((this.bytesLo>>>0)<old)this.bytesHi=(this.bytesHi+1)>>>0;
    };
    SHA512.prototype._compress=function(block,off){
        var wh=new Array(80),wl=new Array(80),t,p,x0,x1,s0,s1,T1,T2;
        var ah,al,bh,bl,ch,cl,dh,dl,eh,el,fh,fl,gh,gl,hh,hl;
        var r1,r2,r3,S0,S1,Ch,Maj,kword,wWord;
        for(t=0;t<16;t++){
            p=off+t*8;
            wh[t]=(((block[p]&255)<<24)|((block[p+1]&255)<<16)|((block[p+2]&255)<<8)|(block[p+3]&255))|0;
            wl[t]=(((block[p+4]&255)<<24)|((block[p+5]&255)<<16)|((block[p+6]&255)<<8)|(block[p+7]&255))|0;
        }
        for(t=16;t<80;t++){
            r1=rotr64(wh[t-15],wl[t-15],1); r2=rotr64(wh[t-15],wl[t-15],8); r3=shr64(wh[t-15],wl[t-15],7); s0=xor64_3(r1,r2,r3);
            r1=rotr64(wh[t-2],wl[t-2],19); r2=rotr64(wh[t-2],wl[t-2],61); r3=shr64(wh[t-2],wl[t-2],6); s1=xor64_3(r1,r2,r3);
            x0=add64([wh[t-16],wl[t-16]],s0,[wh[t-7],wl[t-7]],s1); wh[t]=x0[0]; wl[t]=x0[1];
        }
        ah=this.h[0]|0;al=this.h[1]|0;bh=this.h[2]|0;bl=this.h[3]|0;ch=this.h[4]|0;cl=this.h[5]|0;dh=this.h[6]|0;dl=this.h[7]|0;
        eh=this.h[8]|0;el=this.h[9]|0;fh=this.h[10]|0;fl=this.h[11]|0;gh=this.h[12]|0;gl=this.h[13]|0;hh=this.h[14]|0;hl=this.h[15]|0;
        for(t=0;t<80;t++){
            r1=rotr64(eh,el,14); r2=rotr64(eh,el,18); r3=rotr64(eh,el,41); S1=xor64_3(r1,r2,r3);
            Ch=[((eh&fh)^((~eh)&gh))|0,((el&fl)^((~el)&gl))|0];
            kword=[SHA512_K[t*2]|0,SHA512_K[t*2+1]|0]; wWord=[wh[t],wl[t]];
            T1=add64([hh,hl],S1,Ch,kword,wWord);
            r1=rotr64(ah,al,28); r2=rotr64(ah,al,34); r3=rotr64(ah,al,39); S0=xor64_3(r1,r2,r3);
            Maj=[((ah&bh)^(ah&ch)^(bh&ch))|0,((al&bl)^(al&cl)^(bl&cl))|0];
            T2=add64(S0,Maj);
            hh=gh;hl=gl; gh=fh;gl=fl; fh=eh;fl=el;
            x1=add64([dh,dl],T1); eh=x1[0];el=x1[1];
            dh=ch;dl=cl; ch=bh;cl=bl; bh=ah;bl=al;
            x1=add64(T1,T2); ah=x1[0];al=x1[1];
        }
        x0=add64([this.h[0],this.h[1]],[ah,al]);this.h[0]=x0[0];this.h[1]=x0[1];
        x0=add64([this.h[2],this.h[3]],[bh,bl]);this.h[2]=x0[0];this.h[3]=x0[1];
        x0=add64([this.h[4],this.h[5]],[ch,cl]);this.h[4]=x0[0];this.h[5]=x0[1];
        x0=add64([this.h[6],this.h[7]],[dh,dl]);this.h[6]=x0[0];this.h[7]=x0[1];
        x0=add64([this.h[8],this.h[9]],[eh,el]);this.h[8]=x0[0];this.h[9]=x0[1];
        x0=add64([this.h[10],this.h[11]],[fh,fl]);this.h[10]=x0[0];this.h[11]=x0[1];
        x0=add64([this.h[12],this.h[13]],[gh,gl]);this.h[12]=x0[0];this.h[13]=x0[1];
        x0=add64([this.h[14],this.h[15]],[hh,hl]);this.h[14]=x0[0];this.h[15]=x0[1];
        zeroize(wh);zeroize(wl);
    };
    SHA512.prototype.update=function(data){
        if(this.finished)throw new Error("SHA512 already finalized");
        if(!data||data.length===0)return this;
        var pos=0,take,n; this._addLength(data.length>>>0);
        while(pos<data.length){
            take=Math.min(128-this.bufLen,data.length-pos);
            for(n=0;n<take;n++)this.buf[this.bufLen+n]=data[pos+n]&255;
            this.bufLen+=take;pos+=take;
            if(this.bufLen===128){this._compress(this.buf,0);this.bufLen=0;}
        }
        return this;
    };
    SHA512.prototype.digest=function(){
        if(this.finished)throw new Error("SHA512 already finalized"); this.finished=true;
        var bitLo=(this.bytesLo<<3)>>>0, bitHi=((this.bytesHi<<3)|(this.bytesLo>>>29))>>>0;
        var j5,v,out=new Array(64),o=0;
        this.buf[this.bufLen++]=0x80;
        if(this.bufLen>112){while(this.bufLen<128)this.buf[this.bufLen++]=0;this._compress(this.buf,0);this.bufLen=0;}
        while(this.bufLen<112)this.buf[this.bufLen++]=0;
        for(j5=112;j5<120;j5++)this.buf[j5]=0;
        this.buf[120]=(bitHi>>>24)&255;this.buf[121]=(bitHi>>>16)&255;this.buf[122]=(bitHi>>>8)&255;this.buf[123]=bitHi&255;
        this.buf[124]=(bitLo>>>24)&255;this.buf[125]=(bitLo>>>16)&255;this.buf[126]=(bitLo>>>8)&255;this.buf[127]=bitLo&255;
        this._compress(this.buf,0);
        for(j5=0;j5<16;j5++){v=this.h[j5]>>>0;out[o++]=(v>>>24)&255;out[o++]=(v>>>16)&255;out[o++]=(v>>>8)&255;out[o++]=v&255;}
        zeroize(this.buf);zeroize(this.h); return out;
    };
    function sha512Bytes(data){return (new SHA512()).update(data).digest();}

    function HMAC512(keyBytes){
        var key=keyBytes.slice(0),kh,i6;
        if(key.length>128){kh=sha512Bytes(key);zeroize(key);key=kh;}
        while(key.length<128)key.push(0);
        this.opad=new Array(128);var ipad=new Array(128);
        for(i6=0;i6<128;i6++){ipad[i6]=key[i6]^0x36;this.opad[i6]=key[i6]^0x5C;}
        this.inner=new SHA512();this.inner.update(ipad);zeroize(ipad);zeroize(key);
    }
    HMAC512.prototype.update=function(data){this.inner.update(data);return this;};
    HMAC512.prototype.digest=function(){
        var innerHash=this.inner.digest(),outer=new SHA512();outer.update(this.opad);outer.update(innerHash);
        var out=outer.digest();zeroize(innerHash);zeroize(this.opad);return out;
    };
    function hmacSha512(key,data){return (new HMAC512(key)).update(data).digest();}

    // RFC 5869-style HKDF using HMAC-SHA-512.
    // Extract: PRK = HMAC-SHA-512(salt, IKM)
    // Expand : T(n) = HMAC-SHA-512(PRK, T(n-1) || info || counter)
    function hkdfExtractSha512(salt, ikm) {
        var actualSalt = salt && salt.length ? salt.slice(0) : new Array(64), i;
        if (!salt || !salt.length) for (i=0;i<64;i++) actualSalt[i]=0;
        var prk = hmacSha512(actualSalt, ikm);
        zeroize(actualSalt);
        return prk;
    }

    function hkdfExpandSha512(prk, info, length) {
        if (length < 0 || length > 255 * 64) return null;
        var out = [], prev = [], counter = 1, block = null, input = null, i;
        try {
            while (out.length < length) {
                input = prev.slice(0);
                for (i=0;i<info.length;i++) input.push(info[i] & 255);
                input.push(counter & 255);
                block = hmacSha512(prk, input);
                for (i=0;i<block.length && out.length<length;i++) out.push(block[i]);
                zeroize(prev);
                prev = block.slice(0);
                zeroize(block); block = null;
                zeroize(input); input = null;
                counter++;
            }
            return out;
        } finally {
            zeroize(prev); zeroize(block); zeroize(input);
        }
    }

    // Domain-separated keys derived exclusively with HKDF-SHA-512.
    // encKey = 256 bits for ChaCha20; macKey = 512 bits for HMAC-SHA-512.
    function hkdfKeys(passwordBytes,saltBytes){
        var prk=null,encInfo=null,macInfo=null,encKey=null,macKey=null,all=null;
        try {
            prk=hkdfExtractSha512(saltBytes,passwordBytes);
            encInfo=asciiBytes("EXES-V5.9-ENC");
            macInfo=asciiBytes("EXES-V5.9-MAC");
            encKey=hkdfExpandSha512(prk,encInfo,32);
            macKey=hkdfExpandSha512(prk,macInfo,64);
            if(!encKey||!macKey)return null;
            all=encKey.concat(macKey);
            return {encKey:encKey,macKey:macKey,all:all};
        } finally {
            zeroize(prk);zeroize(encInfo);zeroize(macInfo);
        }
    }

    // -------------------------------------------------------------------------
    // Standard ChaCha20 IETF stream block: 20 rounds + feed-forward.
    // The raw internal state is never copied directly to ciphertext keystream.
    // -------------------------------------------------------------------------
    function rotl32(x,n) { return ((x << n) | (x >>> (32 - n))) | 0; }
    function load32le(b,o) { return ((b[o]&255) | ((b[o+1]&255)<<8) | ((b[o+2]&255)<<16) | ((b[o+3]&255)<<24)) | 0; }
    function store32le(v,out,o) { out[o]=v&255; out[o+1]=(v>>>8)&255; out[o+2]=(v>>>16)&255; out[o+3]=(v>>>24)&255; }

    function chachaQuarter(x,a,b,c,d) {
        x[a]=(x[a]+x[b])|0; x[d]^=x[a]; x[d]=rotl32(x[d],16);
        x[c]=(x[c]+x[d])|0; x[b]^=x[c]; x[b]=rotl32(x[b],12);
        x[a]=(x[a]+x[b])|0; x[d]^=x[a]; x[d]=rotl32(x[d],8);
        x[c]=(x[c]+x[d])|0; x[b]^=x[c]; x[b]=rotl32(x[b],7);
    }

    function chacha20Block(key, counter, nonce) {
        var s = new Array(16), x, r, j2, out = new Array(64);
        s[0]=0x61707865; s[1]=0x3320646e; s[2]=0x79622d32; s[3]=0x6b206574;
        for (j2=0;j2<8;j2++) s[4+j2]=load32le(key,j2*4);
        s[12]=counter|0; s[13]=load32le(nonce,0); s[14]=load32le(nonce,4); s[15]=load32le(nonce,8);
        x=s.slice(0);
        for (r=0;r<10;r++) {
            chachaQuarter(x,0,4,8,12); chachaQuarter(x,1,5,9,13); chachaQuarter(x,2,6,10,14); chachaQuarter(x,3,7,11,15);
            chachaQuarter(x,0,5,10,15); chachaQuarter(x,1,6,11,12); chachaQuarter(x,2,7,8,13); chachaQuarter(x,3,4,9,14);
        }
        for (j2=0;j2<16;j2++) { x[j2]=(x[j2]+s[j2])|0; store32le(x[j2],out,j2*4); }
        zeroize(s); zeroize(x);
        return out;
    }

    function createChaCha20Stream(key, nonce) {
        var counter = 1, block = [], idx = 64;
        return {
            nextByte: function() {
                if (idx >= 64) {
                    zeroize(block);
                    if ((counter >>> 0) === 0) throw new Error("ChaCha20 counter exhausted");
                    block = chacha20Block(key, counter >>> 0, nonce);
                    counter = (counter + 1) >>> 0;
                    idx = 0;
                }
                return block[idx++];
            },
            scrub: function() { zeroize(block); counter = 0; idx = 64; }
        };
    }

    // Use every bit of the 144-bit IV while feeding ChaCha20 a 96-bit nonce.
    // Nonce = first 96 bits of SHA-512(IV || "EXES-V5.9-NONCE").
    // SHA-512 is used here so the entire V5.9 hash/KDF/MAC family is unified.
    function deriveNonce(ivBytes) {
        var material = ivBytes.slice(0), label = asciiBytes("EXES-V5.9-NONCE"), n;
        for (n = 0; n < label.length; n++) material.push(label[n]);
        var digest = sha512Bytes(material);
        var nonce = digest.slice(0,12);
        zeroize(material); zeroize(label); zeroize(digest);
        return nonce;
    }

    // -------------------------------------------------------------------------
    // Base62 topology codec retained only as the wire representation.
    // Integrity is now provided by HMAC-SHA-512, not by this modulo relation.
    // -------------------------------------------------------------------------
    function enc24to62(val, outArr, outIdx) {
        var expandedVal = val * 54 + (val % 54);
        outArr[outIdx+4] = C_MAP[expandedVal % 62]; expandedVal = Math.floor(expandedVal / 62);
        outArr[outIdx+3] = C_MAP[expandedVal % 62]; expandedVal = Math.floor(expandedVal / 62);
        outArr[outIdx+2] = C_MAP[expandedVal % 62]; expandedVal = Math.floor(expandedVal / 62);
        outArr[outIdx+1] = C_MAP[expandedVal % 62]; expandedVal = Math.floor(expandedVal / 62);
        outArr[outIdx] = C_MAP[expandedVal];
    }

    function dec62to24(c, idx) {
        if (idx < 0 || idx + 4 >= c.length) return -1;
        var c0=c.charCodeAt(idx),c1=c.charCodeAt(idx+1),c2=c.charCodeAt(idx+2),c3=c.charCodeAt(idx+3),c4=c.charCodeAt(idx+4);
        if (c0>127||c1>127||c2>127||c3>127||c4>127) return -1;
        var d0=DECODE_MAP[c0],d1=DECODE_MAP[c1],d2=DECODE_MAP[c2],d3=DECODE_MAP[c3],d4=DECODE_MAP[c4];
        if (d0<0||d1<0||d2<0||d3<0||d4<0) return -1;
        var expanded=d0*14776336+d1*238328+d2*3844+d3*62+d4;
        var val=Math.floor(expanded/54);
        if ((expanded%54)!==(val%54) || val>0xFFFFFF) return -1;
        return val;
    }

    function bytes18ToWords24(bytes, off) {
        var a = new Array(6), j3, p;
        for (j3=0;j3<6;j3++) { p=off+j3*3; a[j3]=((bytes[p]&255)<<16)|((bytes[p+1]&255)<<8)|(bytes[p+2]&255); }
        return a;
    }

    function words24ToBytes(words) {
        var out=new Array(18), j4, v;
        for (j4=0;j4<6;j4++) { v=words[j4]>>>0; out[j4*3]=(v>>>16)&255; out[j4*3+1]=(v>>>8)&255; out[j4*3+2]=v&255; }
        return out;
    }

    function packWords24(words,out,idx) {
        for (var k=0;k<words.length;k++) { enc24to62(words[k],out,idx); idx+=5; }
        return idx;
    }

    function unpackWords24(c,idx,count) {
        var out=new Array(count), k, v;
        for(k=0;k<count;k++){ v=dec62to24(c,idx+k*5); if(v<0)return null; out[k]=v; }
        return out;
    }

    function packBytesAs24(bytes,out,idx) {
        for (var p=0;p<bytes.length;p+=3) {
            var b0=bytes[p]||0,b1=(p+1<bytes.length?bytes[p+1]:0),b2=(p+2<bytes.length?bytes[p+2]:0);
            enc24to62(((b0&255)<<16)|((b1&255)<<8)|(b2&255),out,idx); idx+=5;
        }
        return idx;
    }

    function unpackBytes24(c,idx,groups) {
        var out=new Array(groups*3), g,v;
        for(g=0;g<groups;g++) { v=dec62to24(c,idx+g*5); if(v<0)return null; out[g*3]=(v>>>16)&255; out[g*3+1]=(v>>>8)&255; out[g*3+2]=v&255; }
        return out;
    }

    function constantTimeEqual(a,b) {
        if (!a || !b || a.length !== b.length) return false;
        var diff=0;
        for(var k=0;k<a.length;k++) diff |= (a[k]^b[k]);
        return diff===0;
    }

    function hmacForCipher(macKey, saltBytes, ivBytes, ctLenHi, ctLenLo, cipherPadded) {
        var h = new HMAC512(macKey), versionBytes = asciiBytes(VERSION_PREFIX);
        h.update(versionBytes);
        h.update(saltBytes); h.update(ivBytes);
        h.update([(ctLenHi>>>16)&255,(ctLenHi>>>8)&255,ctLenHi&255,(ctLenLo>>>16)&255,(ctLenLo>>>8)&255,ctLenLo&255]);
        h.update(cipherPadded);
        zeroize(versionBytes);
        return h.digest();
    }

    function enc(word,pwd) {
        var plainBytes=null,passwordBytes=null,rnd=null,saltWords=null,ivWords=null,saltBytes=null,ivBytes=null;
        var keys=null,nonce=null,stream=null,cipherBytes=null,tag=null,tagPadded=null,out=null;
        try {
            if (word===null||word===undefined||word===""||pwd===null||pwd===undefined||pwd==="") return "";
            plainBytes=strToUTF8Strict(typeof word==='string'?word:String(word));
            passwordBytes=strToUTF8Strict(typeof pwd==='string'?pwd:String(pwd));
            if (!plainBytes||!passwordBytes||plainBytes.length===0||passwordBytes.length===0) return "";
            if (plainBytes.length>MAX_PAYLOAD_SIZE||passwordBytes.length>MAX_PASSWORD_SIZE) return "";

            rnd=secureRandomBytes(36); if(!rnd) return "";
            saltWords=bytes18ToWords24(rnd,0); ivWords=bytes18ToWords24(rnd,18);
            saltBytes=words24ToBytes(saltWords); ivBytes=words24ToBytes(ivWords);
            keys=hkdfKeys(passwordBytes,saltBytes); nonce=deriveNonce(ivBytes); stream=createChaCha20Stream(keys.encKey,nonce);

            var len=plainBytes.length, lenHi=Math.floor(len/16777216), lenLo=len%16777216;
            var hiMix=(stream.nextByte()<<16)|(stream.nextByte()<<8)|stream.nextByte();
            var loMix=(stream.nextByte()<<16)|(stream.nextByte()<<8)|stream.nextByte();
            var ctLenHi=(lenHi^hiMix)&0xFFFFFF, ctLenLo=(lenLo^loMix)&0xFFFFFF;
            var paddedLen=Math.ceil(len/3)*3, j;
            cipherBytes=new Array(paddedLen);
            for(j=0;j<paddedLen;j++) cipherBytes[j]=((j<len?plainBytes[j]:0)^stream.nextByte())&255;

            tag=hmacForCipher(keys.macKey,saltBytes,ivBytes,ctLenHi,ctLenLo,cipherBytes);
            tagPadded=tag.slice(0); tagPadded.push(0); tagPadded.push(0); // 64-byte tag + two zero pads = 22 groups.

            out=new Array(3+70+(paddedLen/3)*5+110);
            out[0]=VERSION_PREFIX.charAt(0);out[1]=VERSION_PREFIX.charAt(1);out[2]=VERSION_PREFIX.charAt(2);
            var outIdx=3;
            outIdx=packWords24(saltWords,out,outIdx); outIdx=packWords24(ivWords,out,outIdx);
            enc24to62(ctLenHi,out,outIdx); outIdx+=5; enc24to62(ctLenLo,out,outIdx); outIdx+=5;
            outIdx=packBytesAs24(cipherBytes,out,outIdx);
            packBytesAs24(tagPadded,out,outIdx);
            return out.join('');
        } catch(e) { return ""; }
        finally {
            zeroize(plainBytes);zeroize(passwordBytes);zeroize(rnd);zeroize(saltWords);zeroize(ivWords);zeroize(saltBytes);zeroize(ivBytes);
            if(keys){zeroize(keys.encKey);zeroize(keys.macKey);zeroize(keys.all);} zeroize(nonce); if(stream)stream.scrub();
            zeroize(cipherBytes);zeroize(tag);zeroize(tagPadded);
        }
    }

    function dec(cipher,pwd) {
        var body,passwordBytes=null,saltWords=null,ivWords=null,saltBytes=null,ivBytes=null,keys=null,nonce=null,stream=null;
        var cipherBytes=null,tagEncoded=null,tag64=null,expectedTag=null,plainPadded=null,plainBytes=null;
        try {
            if(typeof cipher!=="string"||cipher.substr(0,3)!==VERSION_PREFIX||cipher.length<183||pwd===null||pwd===undefined||pwd==="") return "";
            body=cipher.substr(3);
            if(body.length<180||((body.length-180)%5)!==0) return "";
            passwordBytes=strToUTF8Strict(typeof pwd==='string'?pwd:String(pwd));
            if(!passwordBytes||passwordBytes.length===0||passwordBytes.length>MAX_PASSWORD_SIZE) return "";

            saltWords=unpackWords24(body,0,6); if(!saltWords)return "";
            ivWords=unpackWords24(body,30,6); if(!ivWords)return "";
            var ctLenHi=dec62to24(body,60),ctLenLo=dec62to24(body,65); if(ctLenHi<0||ctLenLo<0)return "";
            var cipherGroups=(body.length-180)/5;
            if(cipherGroups<0)return "";
            cipherBytes=unpackBytes24(body,70,cipherGroups); if(!cipherBytes)return "";
            tagEncoded=unpackBytes24(body,70+cipherGroups*5,22); if(!tagEncoded||tagEncoded.length!==66||tagEncoded[64]!==0||tagEncoded[65]!==0)return "";
            tag64=tagEncoded.slice(0,64);

            saltBytes=words24ToBytes(saltWords);ivBytes=words24ToBytes(ivWords);
            keys=hkdfKeys(passwordBytes,saltBytes);
            expectedTag=hmacForCipher(keys.macKey,saltBytes,ivBytes,ctLenHi,ctLenLo,cipherBytes);
            if(!constantTimeEqual(expectedTag,tag64))return "";

            nonce=deriveNonce(ivBytes);stream=createChaCha20Stream(keys.encKey,nonce);
            var hiMix=(stream.nextByte()<<16)|(stream.nextByte()<<8)|stream.nextByte();
            var loMix=(stream.nextByte()<<16)|(stream.nextByte()<<8)|stream.nextByte();
            var lenHi=(ctLenHi^hiMix)&0xFFFFFF,lenLo=(ctLenLo^loMix)&0xFFFFFF;
            var exactLen=lenHi*16777216+lenLo;
            if(exactLen<0||exactLen>MAX_PAYLOAD_SIZE||Math.ceil(exactLen/3)*3!==cipherBytes.length)return "";

            plainPadded=new Array(cipherBytes.length);
            for(var j=0;j<cipherBytes.length;j++)plainPadded[j]=(cipherBytes[j]^stream.nextByte())&255;
            for(j=exactLen;j<plainPadded.length;j++)if(plainPadded[j]!==0)return "";
            plainBytes=plainPadded.slice(0,exactLen);
            var result=utf8ToStrStrict(plainBytes);
            return result===null?"":result;
        } catch(e) { return ""; }
        finally {
            zeroize(passwordBytes);zeroize(saltWords);zeroize(ivWords);zeroize(saltBytes);zeroize(ivBytes);
            if(keys){zeroize(keys.encKey);zeroize(keys.macKey);zeroize(keys.all);} zeroize(nonce);if(stream)stream.scrub();
            zeroize(cipherBytes);zeroize(tagEncoded);zeroize(tag64);zeroize(expectedTag);zeroize(plainPadded);zeroize(plainBytes);
        }
    }

    // Primitive known-answer tests for deployment diagnostics.
    function selfTest() {
        function hex(bytes){var s='',h='0123456789abcdef';for(var k=0;k<bytes.length;k++)s+=h[(bytes[k]>>>4)&15]+h[bytes[k]&15];return s;}
        var abc=asciiBytes('abc');
        var sha512=sha512Bytes(abc);
        var sha512OK=hex(sha512)==='ddaf35a193617abacc417349ae204131' +
            '12e6fa4e89a97ea20a9eeee64b55d39a' +
            '2192992a274fc1a836ba3c23a3feebbd' +
            '454d4423643ce80e2a9ac94fa54ca49f';
        var hm=hmacSha512(asciiBytes('key'),asciiBytes('The quick brown fox jumps over the lazy dog'));
        var hmacOK=hex(hm)==='b42af09057bac1e2d41708e48a902e09' +
            'b5ff7f12ab428a4fe86653c73dd248fb' +
            '82f948a549f7b791a5b41915ee4d1ec3' +
            '935357e4e2317250d0372afa2ebeeb3a';
        var hkdfIkm=[],hkdfSalt=[],hkdfInfo=[],hx;
        for(hx=0;hx<22;hx++)hkdfIkm.push(0x0b);
        for(hx=0;hx<13;hx++)hkdfSalt.push(hx);
        for(hx=0;hx<10;hx++)hkdfInfo.push(0xf0+hx);
        var hkdfPrk=hkdfExtractSha512(hkdfSalt,hkdfIkm);
        var hkdfOkm=hkdfExpandSha512(hkdfPrk,hkdfInfo,42);
        var hkdfOK=hex(hkdfOkm)==='832390086cda71fb47625bb5ceb168e4c8e26a1a16ed34d9fc7fe92c1481579338da362cb8d9f925d7cb';
        var key=new Array(32);for(var x=0;x<32;x++)key[x]=x;
        var nonce=[0,0,0,9,0,0,0,0x4a,0,0,0,0];
        var block=chacha20Block(key,1,nonce);
        var chachaOK=hex(block)==='10f1e7e4d13b5915500fdd1fa32071c4c7d1f4c733c068030422aa9ac3d46c4e' +
            'd2826446079faa0914c2d705d98b02a2b5129cd1de164eb9cbd083e8a2503c4e';
        var nonceIv=new Array(18);for(var ni=0;ni<18;ni++)nonceIv[ni]=ni;
        var derivedNonce=deriveNonce(nonceIv);
        var nonceSha512OK=hex(derivedNonce)==='e6827d473e5852e96916d98b';
        zeroize(abc);zeroize(sha512);zeroize(hm);zeroize(hkdfIkm);zeroize(hkdfSalt);zeroize(hkdfInfo);zeroize(hkdfPrk);zeroize(hkdfOkm);zeroize(key);zeroize(nonce);zeroize(block);zeroize(nonceIv);zeroize(derivedNonce);
        return {sha512:sha512OK,hmacSha512:hmacOK,hkdfSha512:hkdfOK,nonceSha512:nonceSha512OK,chacha20:chachaOK,ok:sha512OK&&hmacOK&&hkdfOK&&nonceSha512OK&&chachaOK};
    }

    return { enc:enc, dec:dec, selfTest:selfTest, environmentTest:environmentTest, version:"5.9.1", build:"LTS-IE11-MODERN" };
})();

(function(global) {
    global.exesEncrypt = function(word, pwd) { return _EXES_CORE_V59.enc(word, pwd); };
    global.exesDecrypt = function(cipher, pwd) { return _EXES_CORE_V59.dec(cipher, pwd); };
    global.exesSelfTest = function() { return _EXES_CORE_V59.selfTest(); };
    global.exesEnvironmentTest = function() { return _EXES_CORE_V59.environmentTest(); };
    global.EXES_VERSION = "5.9.1";
    global.EXES_BUILD = "LTS-IE11-MODERN";
    global.EXES_COMPATIBILITY = "IE11 to Modern Chrome";

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            encrypt: global.exesEncrypt,
            decrypt: global.exesDecrypt,
            selfTest: global.exesSelfTest,
            environmentTest: global.exesEnvironmentTest,
            version: "5.9.1",
            build: "LTS-IE11-MODERN",
            compatibility: "IE11 to Modern Chrome"
        };
    }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
