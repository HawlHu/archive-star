/*
 * ex_md3 v6 dual-family hardened
 * Target: ECMAScript 3 / IE6 through current Chrome.
 *
 * Construction:
 *   seed = SHA-512(D512 || frame(message)) || SHA3-512(D3 || frame(message))
 *   output = uniform radix-30 squeeze driven by BOTH SHA-512 and SHA3-512
 *
 * The output alphabet is hard-coded and cannot be changed by reassigning the
 * public EX_MD3_ALPHABET variable. Output length remains 209 characters.
 *
 * IMPORTANT:
 * - This is a custom composition, not a NIST-standard hash function.
 * - No finite test suite can prove 100% absence of bugs or cryptanalytic flaws.
 * - For password storage use a password KDF, not this function.
 */

(function (root) {
function _exmd3_alphabet() {
    return "rt478aGHLTdbADEFyu3MeRfhi6mnQj";
}

function _exmd3_assertAlphabet() {
    var a = _exmd3_alphabet();
    var i, j;
    if (a.length !== 30) { throw new Error("ex_md3: internal alphabet length corruption"); }
    for (i = 0; i < a.length; i++) {
        for (j = i + 1; j < a.length; j++) {
            if (a.charAt(i) === a.charAt(j)) {
                throw new Error("ex_md3: internal alphabet contains duplicate characters");
            }
        }
    }
    return a;
}

/* IE6/ES3-safe encodeURI-like encoder. It is injective over JS UTF-16 strings:
 * paired surrogates are encoded as UTF-8; unpaired surrogates are preserved as
 * their own 3-byte UTF-8/CESU-8-style code-unit encoding instead of collapsing
 * to U+FFFD. '%' is always escaped, so generated percent sequences are
 * unambiguous. */
function es1_safe_encodeURI(str) {
    var output = "";
    var hexChars = "0123456789ABCDEF";
    var safeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'();,/?:@&=+$#";
    var i, j, c, c2, cp, ch, isSafe;
    str = String(str);

    function percentEncode(byteVal) {
        return "%" + hexChars.charAt((byteVal >>> 4) & 15) + hexChars.charAt(byteVal & 15);
    }

    for (i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        ch = str.charAt(i);
        isSafe = false;
        if (c < 128) {
            for (j = 0; j < safeChars.length; j++) {
                if (safeChars.charAt(j) === ch) { isSafe = true; break; }
            }
        }
        if (isSafe) {
            output += ch;
        } else if (c < 128) {
            output += percentEncode(c);
        } else if (c < 2048) {
            output += percentEncode(192 | (c >>> 6));
            output += percentEncode(128 | (c & 63));
        } else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < str.length) {
            c2 = str.charCodeAt(i + 1);
            if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00);
                output += percentEncode(240 | (cp >>> 18));
                output += percentEncode(128 | ((cp >>> 12) & 63));
                output += percentEncode(128 | ((cp >>> 6) & 63));
                output += percentEncode(128 | (cp & 63));
                i++;
            } else {
                output += percentEncode(224 | (c >>> 12));
                output += percentEncode(128 | ((c >>> 6) & 63));
                output += percentEncode(128 | (c & 63));
            }
        } else {
            output += percentEncode(224 | (c >>> 12));
            output += percentEncode(128 | ((c >>> 6) & 63));
            output += percentEncode(128 | (c & 63));
        }
    }
    return output;
}

function _exmd3_asciiBytes(str) {
    var out = [], i;
    for (i = 0; i < str.length; i++) { out[i] = str.charCodeAt(i) & 255; }
    return out;
}

function _exmd3_concat(a, b) {
    var out = [], i, n = 0;
    for (i = 0; i < a.length; i++) { out[n++] = a[i] & 255; }
    for (i = 0; i < b.length; i++) { out[n++] = b[i] & 255; }
    return out;
}

function _exmd3_rotrH(h, l, n) {
    if (n === 0) { return h | 0; }
    if (n < 32) {
        return ((h >>> n) | (l << (32 - n))) | 0;
    }
    if (n === 32) { return l | 0; }
    n -= 32;
    return ((l >>> n) | (h << (32 - n))) | 0;
}

function _exmd3_rotrL(h, l, n) {
    if (n === 0) { return l | 0; }
    if (n < 32) {
        return ((l >>> n) | (h << (32 - n))) | 0;
    }
    if (n === 32) { return h | 0; }
    n -= 32;
    return ((h >>> n) | (l << (32 - n))) | 0;
}

function _exmd3_shrH(h, l, n) {
    if (n === 0) { return h | 0; }
    if (n < 32) { return (h >>> n) | 0; }
    if (n === 32) { return 0; }
    return 0;
}

function _exmd3_shrL(h, l, n) {
    if (n === 0) { return l | 0; }
    if (n < 32) {
        return ((l >>> n) | (h << (32 - n))) | 0;
    }
    if (n === 32) { return h | 0; }
    n -= 32;
    return (h >>> n) | 0;
}

/* SHA-512, FIPS 180-4, implemented with pairs of 32-bit words.
 * Only ES3 features are used; no BigInt, typed arrays, TextEncoder, Promise,
 * WebCrypto, let/const, arrow functions, or ArrayBuffer.
 */
function _exmd3_sha512(bytes) {
    var Hh = [
        1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225
    ];
    var Hl = [
        -205731576, -2067093701, -23791573, 1595750129, -1377402159, 725511199, -79577749, 327033209
    ];
    var Kh = [
        1116352408, 1899447441, -1245643825, -373957723, 961987163,
        1508970993, -1841331548, -1424204075, -670586216, 310598401,
        607225278, 1426881987, 1925078388, -2132889090, -1680079193,
        -1046744716, -459576895, -272742522, 264347078, 604807628,
        770255983, 1249150122, 1555081692, 1996064986, -1740746414,
        -1473132947, -1341970488, -1084653625, -958395405, -710438585,
        113926993, 338241895, 666307205, 773529912, 1294757372,
        1396182291, 1695183700, 1986661051, -2117940946, -1838011259,
        -1564481375, -1474664885, -1035236496, -949202525, -778901479,
        -694614492, -200395387, 275423344, 430227734, 506948616,
        659060556, 883997877, 958139571, 1322822218, 1537002063,
        1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
        -1866530822, -1538233109, -1090935817, -965641998, -903397682,
        -779700025, -354779690, -176337025, 116418474, 174292421,
        289380356, 460393269, 685471733, 852142971, 1017036298,
        1126000580, 1288033470, 1501505948, 1607167915, 1816402316
    ];
    var Kl = [
        -685199838, 602891725, -330482897, -2121671748, -213338824,
        -1241133031, -1357295717, -630357736, -1560083902, 1164996542,
        1323610764, -704662302, -226784913, 991336113, 633803317,
        -815192428, -1628353838, 944711139, -1953704523, 2007800933,
        1495990901, 1856431235, -1119749164, -2096016459, -295247957,
        766784016, -1728372417, -1091629340, 1034457026, -1828018395,
        -536640913, 168717936, 1188179964, 1546045734, 1522805485,
        -1651133473, -1951439906, 1014477480, 1206759142, 344077627,
        1290863460, -1136513023, -789014639, 106217008, -688958952,
        1432725776, 1467031594, 851169720, -1194143544, 1363258195,
        -544281703, -509917016, -976659869, -482243893, 2003034995,
        -692930397, 1575990012, 1125592928, -1578062990, 442776044,
        593698344, -561857047, -1295615723, -479046869, -366583396,
        566280711, -840897762, -294727304, 1914138554, -1563912026,
        -1090974290, 320620315, 587496836, 1086792851, 365543100,
        -1676669620, -885112138, -60457430, 987167468, 1246189591
    ];

    var msg = [];
    var i, j, t, p;
    var bitLo, bitHi;
    var Wh = new Array(80);
    var Wl = new Array(80);

    var ah, al, bh, bl, ch, cl, dh, dl;
    var eh, el, fh, fl, gh, gl, hh, hl;
    var s0h, s0l, s1h, s1l;
    var S0h, S0l, S1h, S1l;
    var majh, majl, chh, chl;
    var t1h, t1l, t2h, t2l;
    var loSum, carry;

    for (i = 0; i < bytes.length; i++) {
        msg[i] = bytes[i] & 255;
    }

    /* SHA-512 padding: 1 bit, zeroes, then a 128-bit big-endian length.
     * JS/IE6 cannot practically hold arrays remotely near 2^64 bits, so the
     * upper 64 length bits are zero. The lower 64 bits are still encoded.
     */
    msg[msg.length] = 0x80;
    while ((msg.length % 128) !== 112) {
        msg[msg.length] = 0;
    }

    bitLo = ((bytes.length * 8) >>> 0);
    bitHi = (Math.floor(bytes.length / 536870912) >>> 0);

    for (i = 0; i < 8; i++) { msg[msg.length] = 0; }
    msg[msg.length] = (bitHi >>> 24) & 255;
    msg[msg.length] = (bitHi >>> 16) & 255;
    msg[msg.length] = (bitHi >>> 8) & 255;
    msg[msg.length] = bitHi & 255;
    msg[msg.length] = (bitLo >>> 24) & 255;
    msg[msg.length] = (bitLo >>> 16) & 255;
    msg[msg.length] = (bitLo >>> 8) & 255;
    msg[msg.length] = bitLo & 255;

    for (p = 0; p < msg.length; p += 128) {
        for (t = 0; t < 16; t++) {
            j = p + (t * 8);
            Wh[t] = ((msg[j] << 24) | (msg[j + 1] << 16) |
                     (msg[j + 2] << 8) | msg[j + 3]) | 0;
            Wl[t] = ((msg[j + 4] << 24) | (msg[j + 5] << 16) |
                     (msg[j + 6] << 8) | msg[j + 7]) | 0;
        }

        for (t = 16; t < 80; t++) {
            s0h = (_exmd3_rotrH(Wh[t - 15], Wl[t - 15], 1) ^
                    _exmd3_rotrH(Wh[t - 15], Wl[t - 15], 8) ^
                    _exmd3_shrH(Wh[t - 15], Wl[t - 15], 7)) | 0;
            s0l = (_exmd3_rotrL(Wh[t - 15], Wl[t - 15], 1) ^
                    _exmd3_rotrL(Wh[t - 15], Wl[t - 15], 8) ^
                    _exmd3_shrL(Wh[t - 15], Wl[t - 15], 7)) | 0;

            s1h = (_exmd3_rotrH(Wh[t - 2], Wl[t - 2], 19) ^
                    _exmd3_rotrH(Wh[t - 2], Wl[t - 2], 61) ^
                    _exmd3_shrH(Wh[t - 2], Wl[t - 2], 6)) | 0;
            s1l = (_exmd3_rotrL(Wh[t - 2], Wl[t - 2], 19) ^
                    _exmd3_rotrL(Wh[t - 2], Wl[t - 2], 61) ^
                    _exmd3_shrL(Wh[t - 2], Wl[t - 2], 6)) | 0;

            loSum = (Wl[t - 16] >>> 0) + (s0l >>> 0) +
                    (Wl[t - 7] >>> 0) + (s1l >>> 0);
            carry = Math.floor(loSum / 4294967296);
            Wl[t] = loSum | 0;
            Wh[t] = (Wh[t - 16] + s0h + Wh[t - 7] + s1h + carry) | 0;
        }

        ah = Hh[0] | 0; al = Hl[0] | 0;
        bh = Hh[1] | 0; bl = Hl[1] | 0;
        ch = Hh[2] | 0; cl = Hl[2] | 0;
        dh = Hh[3] | 0; dl = Hl[3] | 0;
        eh = Hh[4] | 0; el = Hl[4] | 0;
        fh = Hh[5] | 0; fl = Hl[5] | 0;
        gh = Hh[6] | 0; gl = Hl[6] | 0;
        hh = Hh[7] | 0; hl = Hl[7] | 0;

        for (t = 0; t < 80; t++) {
            S1h = (_exmd3_rotrH(eh, el, 14) ^
                    _exmd3_rotrH(eh, el, 18) ^
                    _exmd3_rotrH(eh, el, 41)) | 0;
            S1l = (_exmd3_rotrL(eh, el, 14) ^
                    _exmd3_rotrL(eh, el, 18) ^
                    _exmd3_rotrL(eh, el, 41)) | 0;

            chh = ((eh & fh) ^ ((~eh) & gh)) | 0;
            chl = ((el & fl) ^ ((~el) & gl)) | 0;

            loSum = (hl >>> 0) + (S1l >>> 0) + (chl >>> 0) +
                    (Kl[t] >>> 0) + (Wl[t] >>> 0);
            carry = Math.floor(loSum / 4294967296);
            t1l = loSum | 0;
            t1h = (hh + S1h + chh + Kh[t] + Wh[t] + carry) | 0;

            S0h = (_exmd3_rotrH(ah, al, 28) ^
                    _exmd3_rotrH(ah, al, 34) ^
                    _exmd3_rotrH(ah, al, 39)) | 0;
            S0l = (_exmd3_rotrL(ah, al, 28) ^
                    _exmd3_rotrL(ah, al, 34) ^
                    _exmd3_rotrL(ah, al, 39)) | 0;

            majh = ((ah & bh) ^ (ah & ch) ^ (bh & ch)) | 0;
            majl = ((al & bl) ^ (al & cl) ^ (bl & cl)) | 0;

            loSum = (S0l >>> 0) + (majl >>> 0);
            carry = Math.floor(loSum / 4294967296);
            t2l = loSum | 0;
            t2h = (S0h + majh + carry) | 0;

            hh = gh; hl = gl;
            gh = fh; gl = fl;
            fh = eh; fl = el;

            loSum = (dl >>> 0) + (t1l >>> 0);
            carry = Math.floor(loSum / 4294967296);
            el = loSum | 0;
            eh = (dh + t1h + carry) | 0;

            dh = ch; dl = cl;
            ch = bh; cl = bl;
            bh = ah; bl = al;

            loSum = (t1l >>> 0) + (t2l >>> 0);
            carry = Math.floor(loSum / 4294967296);
            al = loSum | 0;
            ah = (t1h + t2h + carry) | 0;
        }

        loSum = (Hl[0] >>> 0) + (al >>> 0);
        Hh[0] = (Hh[0] + ah + Math.floor(loSum / 4294967296)) | 0;
        Hl[0] = loSum | 0;

        loSum = (Hl[1] >>> 0) + (bl >>> 0);
        Hh[1] = (Hh[1] + bh + Math.floor(loSum / 4294967296)) | 0;
        Hl[1] = loSum | 0;

        loSum = (Hl[2] >>> 0) + (cl >>> 0);
        Hh[2] = (Hh[2] + ch + Math.floor(loSum / 4294967296)) | 0;
        Hl[2] = loSum | 0;

        loSum = (Hl[3] >>> 0) + (dl >>> 0);
        Hh[3] = (Hh[3] + dh + Math.floor(loSum / 4294967296)) | 0;
        Hl[3] = loSum | 0;

        loSum = (Hl[4] >>> 0) + (el >>> 0);
        Hh[4] = (Hh[4] + eh + Math.floor(loSum / 4294967296)) | 0;
        Hl[4] = loSum | 0;

        loSum = (Hl[5] >>> 0) + (fl >>> 0);
        Hh[5] = (Hh[5] + fh + Math.floor(loSum / 4294967296)) | 0;
        Hl[5] = loSum | 0;

        loSum = (Hl[6] >>> 0) + (gl >>> 0);
        Hh[6] = (Hh[6] + gh + Math.floor(loSum / 4294967296)) | 0;
        Hl[6] = loSum | 0;

        loSum = (Hl[7] >>> 0) + (hl >>> 0);
        Hh[7] = (Hh[7] + hh + Math.floor(loSum / 4294967296)) | 0;
        Hl[7] = loSum | 0;
    }

    var out = [];
    var wordH, wordL, n = 0;
    for (i = 0; i < 8; i++) {
        wordH = Hh[i] >>> 0;
        wordL = Hl[i] >>> 0;
        out[n++] = (wordH >>> 24) & 255;
        out[n++] = (wordH >>> 16) & 255;
        out[n++] = (wordH >>> 8) & 255;
        out[n++] = wordH & 255;
        out[n++] = (wordL >>> 24) & 255;
        out[n++] = (wordL >>> 16) & 255;
        out[n++] = (wordL >>> 8) & 255;
        out[n++] = wordL & 255;
    }
    return out;
}


/* 64-bit left rotate represented by two 32-bit words (high, low). */
function _exmd3_rotlH(h, l, n) {
    n = n % 64;
    if (n === 0) { return h | 0; }
    if (n < 32) { return ((h << n) | (l >>> (32 - n))) | 0; }
    if (n === 32) { return l | 0; }
    n -= 32;
    return ((l << n) | (h >>> (32 - n))) | 0;
}
function _exmd3_rotlL(h, l, n) {
    n = n % 64;
    if (n === 0) { return l | 0; }
    if (n < 32) { return ((l << n) | (h >>> (32 - n))) | 0; }
    if (n === 32) { return h | 0; }
    n -= 32;
    return ((h << n) | (l >>> (32 - n))) | 0;
}

/* Keccak-f[1600], FIPS 202, lanes stored as parallel high/low 32-bit words. */
function _exmd3_keccakF1600(Ah, Al) {
    var R = [
         0, 1,62,28,27,
        36,44, 6,55,20,
         3,10,43,25,39,
        41,45,15,21, 8,
        18, 2,61,56,14
    ];
    var RCh = [
        0x00000000,0x00000000,0x80000000,0x80000000,
        0x00000000,0x00000000,0x80000000,0x80000000,
        0x00000000,0x00000000,0x00000000,0x00000000,
        0x00000000,0x80000000,0x80000000,0x80000000,
        0x80000000,0x80000000,0x00000000,0x80000000,
        0x80000000,0x80000000,0x00000000,0x80000000
    ];
    var RCl = [
        0x00000001,0x00008082,0x0000808A,0x80008000,
        0x0000808B,0x80000001,0x80008081,0x00008009,
        0x0000008A,0x00000088,0x80008009,0x8000000A,
        0x8000808B,0x0000008B,0x00008089,0x00008003,
        0x00008002,0x00000080,0x0000800A,0x8000000A,
        0x80008081,0x00008080,0x80000001,0x80008008
    ];
    var Ch = [0,0,0,0,0], Cl = [0,0,0,0,0];
    var Dh = [0,0,0,0,0], Dl = [0,0,0,0,0];
    var Bh = new Array(25), Bl = new Array(25);
    var round, x, y, i, dst, rh, rl, tH, tL;

    for (round = 0; round < 24; round++) {
        /* theta */
        for (x = 0; x < 5; x++) {
            Ch[x] = (Ah[x] ^ Ah[x+5] ^ Ah[x+10] ^ Ah[x+15] ^ Ah[x+20]) | 0;
            Cl[x] = (Al[x] ^ Al[x+5] ^ Al[x+10] ^ Al[x+15] ^ Al[x+20]) | 0;
        }
        for (x = 0; x < 5; x++) {
            rh = _exmd3_rotlH(Ch[(x+1)%5], Cl[(x+1)%5], 1);
            rl = _exmd3_rotlL(Ch[(x+1)%5], Cl[(x+1)%5], 1);
            Dh[x] = (Ch[(x+4)%5] ^ rh) | 0;
            Dl[x] = (Cl[(x+4)%5] ^ rl) | 0;
        }
        for (y = 0; y < 5; y++) {
            for (x = 0; x < 5; x++) {
                i = x + 5*y;
                Ah[i] = (Ah[i] ^ Dh[x]) | 0;
                Al[i] = (Al[i] ^ Dl[x]) | 0;
            }
        }

        /* rho + pi */
        for (y = 0; y < 5; y++) {
            for (x = 0; x < 5; x++) {
                i = x + 5*y;
                dst = y + 5*((2*x + 3*y) % 5);
                Bh[dst] = _exmd3_rotlH(Ah[i], Al[i], R[i]);
                Bl[dst] = _exmd3_rotlL(Ah[i], Al[i], R[i]);
            }
        }

        /* chi */
        for (y = 0; y < 5; y++) {
            for (x = 0; x < 5; x++) {
                i = x + 5*y;
                tH = ((~Bh[((x+1)%5)+5*y]) & Bh[((x+2)%5)+5*y]) | 0;
                tL = ((~Bl[((x+1)%5)+5*y]) & Bl[((x+2)%5)+5*y]) | 0;
                Ah[i] = (Bh[i] ^ tH) | 0;
                Al[i] = (Bl[i] ^ tL) | 0;
            }
        }

        /* iota */
        Ah[0] = (Ah[0] ^ RCh[round]) | 0;
        Al[0] = (Al[0] ^ RCl[round]) | 0;
    }
}

/* SHA3-512 (FIPS 202), rate 72 bytes, domain suffix 0x06. */
function _exmd3_sha3_512(bytes) {
    var Ah = new Array(25), Al = new Array(25);
    var msg = [], rate = 72;
    var i, p, pos, lane, off, b, n = 0, word;
    for (i = 0; i < 25; i++) { Ah[i] = 0; Al[i] = 0; }
    for (i = 0; i < bytes.length; i++) { msg[i] = bytes[i] & 255; }

    /* SHA-3 multi-rate padding: append 0x06, zeroes, set final rate bit 0x80. */
    msg[msg.length] = 0x06;
    while ((msg.length % rate) !== 0) { msg[msg.length] = 0; }
    msg[msg.length - 1] = (msg[msg.length - 1] | 0x80) & 255;

    for (p = 0; p < msg.length; p += rate) {
        for (pos = 0; pos < rate; pos++) {
            lane = (pos / 8) | 0;
            off = pos & 7;
            b = msg[p + pos] & 255;
            if (off < 4) {
                Al[lane] = (Al[lane] ^ (b << (off * 8))) | 0;
            } else {
                Ah[lane] = (Ah[lane] ^ (b << ((off - 4) * 8))) | 0;
            }
        }
        _exmd3_keccakF1600(Ah, Al);
    }

    /* SHA3-512 digest is 64 bytes, which fits inside the 72-byte rate. */
    var out = [];
    for (pos = 0; pos < 64; pos++) {
        lane = (pos / 8) | 0;
        off = pos & 7;
        word = off < 4 ? (Al[lane] >>> 0) : (Ah[lane] >>> 0);
        if (off >= 4) { off -= 4; }
        out[n++] = (word >>> (off * 8)) & 255;
    }
    return out;
}


function _exmd3_toHex(bytes) {
    var h = "0123456789abcdef", out = "", i, v;
    for (i = 0; i < bytes.length; i++) {
        v = bytes[i] & 255;
        out += h.charAt(v >>> 4) + h.charAt(v & 15);
    }
    return out;
}

function _exmd3_frame(a) {
    var alphabet = _exmd3_assertAlphabet();
    /* Coerce exactly once: objects may have stateful toString() methods. */
    var s = String(a);
    var encoded = es1_safe_encodeURI(s);
    /* Both decimal lengths are framed: UTF-16 input length and encoded length. */
    return "EXMD3-V6|U16:" + String(s.length) +
           "|ENC:" + String(encoded.length) + ":" + encoded +
           "|ALPHABET:" + alphabet + "|OUT:209";
}

/* Composite seed uses two independently standardized hash families. */
function _exmd3_compositeFromBytes(data) {
    var d512 = _exmd3_sha512(_exmd3_concat(_exmd3_asciiBytes("EXMD3-V6-SHA512|"), data));
    var d3 = _exmd3_sha3_512(_exmd3_concat(_exmd3_asciiBytes("EXMD3-V6-SHA3-512|"), data));
    return _exmd3_concat(d512, d3);
}

function _ex_md3_raw(a) {
    return _exmd3_compositeFromBytes(_exmd3_asciiBytes(_exmd3_frame(a)));
}

function _exmd3_counterBytes(counter) {
    return [(counter >>> 24)&255,(counter >>> 16)&255,(counter >>> 8)&255,counter&255];
}

/* Uniform radix-30 squeeze. Each counter emits 128 candidate bytes: 64 from
 * SHA-512 and 64 from SHA3-512. Values 240..255 are rejected, eliminating
 * modulo bias because 240 is exactly divisible by 30. */
function _exmd3_uniform30(seed, outLen) {
    var alphabet = _exmd3_assertAlphabet();
    var out = "", counter = 0, c, in512, in3, b512, b3, block, i, v;
    while (out.length < outLen) {
        c = _exmd3_counterBytes(counter);
        in512 = _exmd3_concat(_exmd3_asciiBytes("EXMD3-V6-SQ-SHA512|"), seed);
        in512 = _exmd3_concat(in512, c);
        in3 = _exmd3_concat(_exmd3_asciiBytes("EXMD3-V6-SQ-SHA3-512|"), seed);
        in3 = _exmd3_concat(in3, c);
        b512 = _exmd3_sha512(in512);
        b3 = _exmd3_sha3_512(in3);
        block = _exmd3_concat(b512, b3);
        counter = (counter + 1) >>> 0;
        for (i = 0; i < block.length && out.length < outLen; i++) {
            v = block[i] & 255;
            if (v < 240) { out += alphabet.charAt(v % 30); }
        }
        if (counter === 0 && out.length < outLen) {
            throw new Error("ex_md3: output counter exhausted");
        }
    }
    return out;
}

function ex_md3(a) {
    return _exmd3_uniform30(_ex_md3_raw(a), 209);
}

function ex_md3n(a, n) {
    var i;
    n = Number(n);
    if (!(n >= 0) || n !== Math.floor(n) || n === Infinity) {
        throw new Error("ex_md3n: n must be a finite non-negative integer");
    }
    for (i = 0; i < n; i++) { a = ex_md3(a); }
    return a;
}

function ex_md3_selftest() {
    var alphabet = _exmd3_assertAlphabet();
    var sha512Empty =
        "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce" +
        "47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e";
    var sha512Abc =
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" +
        "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f";
    var sha3Empty =
        "a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a6" +
        "15b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26";
    var sha3Abc =
        "b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e" +
        "10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0";
    var h1, h2, i;
    if (_exmd3_toHex(_exmd3_sha512([])) !== sha512Empty) { return "FAIL: SHA512 empty"; }
    if (_exmd3_toHex(_exmd3_sha512(_exmd3_asciiBytes("abc"))) !== sha512Abc) { return "FAIL: SHA512 abc"; }
    if (_exmd3_toHex(_exmd3_sha3_512([])) !== sha3Empty) { return "FAIL: SHA3-512 empty"; }
    if (_exmd3_toHex(_exmd3_sha3_512(_exmd3_asciiBytes("abc"))) !== sha3Abc) { return "FAIL: SHA3-512 abc"; }
    if (es1_safe_encodeURI("\ud83d\ude00") !== "%F0%9F%98%80") { return "FAIL: UTF8 pair"; }
    h1 = ex_md3("abc"); h2 = ex_md3("abc");
    if (h1 !== h2) { return "FAIL: deterministic"; }
    if (h1 !== "GFiReiA6ettMrAQtAEEr676aFhHredT8DrtdTLLQDTATAfMGMTMRdy7EeeGf7GFi6TFLLf443urDt6ejrFtMdG383Le3ddhEtbTGjRHm6MTeaDtmamAHyDGjerdGut8f7yrdMDDRdE7tDDiQGfmtna67FierAede46eryyAHQfLE3E87fu6mmjh7mH37nrGE3neGR76tHh64QReAL") { return "FAIL: ex_md3 abc KAT"; }
    if (h1.length !== 209) { return "FAIL: output length"; }
    for (i = 0; i < h1.length; i++) {
        if (alphabet.indexOf(h1.charAt(i)) < 0) { return "FAIL: alphabet"; }
    }
    /* Reassigning the public compatibility variable must not alter behavior. */
    root.EX_MD3_ALPHABET = "BROKEN";
    if (ex_md3("abc") !== h1) { return "FAIL: alphabet tamper isolation"; }
    root.EX_MD3_ALPHABET = alphabet;
    if (ex_md3n("abc",0) !== "abc") { return "FAIL: n=0"; }
    if (ex_md3n("abc",1) !== h1) { return "FAIL: n=1"; }
    return "PASS";
}



/* Publish only the legacy/public API. Core primitives stay closure-private in browsers. */
root.EX_MD3_ALPHABET = _exmd3_alphabet();
root.es1_safe_encodeURI = es1_safe_encodeURI;
root.ex_md3 = ex_md3;
root.ex_md3n = ex_md3n;
root.ex_md3_selftest = ex_md3_selftest;

/* Fail closed on load if core known-answer/integrity tests fail. */
var EX_MD3_STARTUP_SELFTEST = ex_md3_selftest();
if (EX_MD3_STARTUP_SELFTEST !== "PASS") {
    throw new Error("ex_md3 startup self-test failed: " + EX_MD3_STARTUP_SELFTEST);
}
root.EX_MD3_STARTUP_SELFTEST = EX_MD3_STARTUP_SELFTEST;

/* CommonJS gets test-only internal hooks; browsers do not. */
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        EX_MD3_ALPHABET: _exmd3_alphabet(),
        EX_MD3_STARTUP_SELFTEST: EX_MD3_STARTUP_SELFTEST,
        es1_safe_encodeURI: es1_safe_encodeURI,
        ex_md3: ex_md3,
        ex_md3n: ex_md3n,
        ex_md3_selftest: ex_md3_selftest,
        _exmd3_frame: _exmd3_frame,
        _ex_md3_raw: _ex_md3_raw,
        _exmd3_compositeFromBytes: _exmd3_compositeFromBytes,
        _exmd3_uniform30: _exmd3_uniform30,
        _exmd3_sha512: _exmd3_sha512,
        _exmd3_sha3_512: _exmd3_sha3_512,
        _exmd3_toHex: _exmd3_toHex,
        _exmd3_asciiBytes: _exmd3_asciiBytes
    };
}
})(this);
