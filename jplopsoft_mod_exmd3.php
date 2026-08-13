<?php
/*
 * EXMD3-V6 Universal PHP API
 * Target: PHP 4.3.11 through PHP 8.x on Windows
 *
 * Backend selection:
 *   - If PHP provides BOTH SHA-512 and SHA3-512 via hash(), use native PHP.
 *   - Otherwise use persistent TCP to exmd3_service.exe on 127.0.0.1:61476.
 *
 * Input contract:
 *   Valid UTF-8 text representing the same Unicode text as JS v6.
 *
 * Legacy compatibility notes:
 *   - Syntax intentionally stays compatible with PHP 4.3.11.
 *   - No closures, namespaces, exceptions, type hints, [] arrays, ??, etc.
 *   - The EXE fallback avoids old PHP/Windows quoting problems with paths
 *     such as C:\Program Files\... by chdir() into the helper directory and
 *     launching .\exmd3_core.exe.
 */

$EX_MD3_ALPHABET = "rt478aGHLTdbADEFyu3MeRfhi6mnQj";
$EX_MD3_LAST_ERROR = "";
$EX_MD3_LAST_BACKEND = "";

/* -------------------------------------------------------------------------
 * Error / status helpers
 * ---------------------------------------------------------------------- */
function exmd3_set_error($message) {
    global $EX_MD3_LAST_ERROR;
    $EX_MD3_LAST_ERROR = $message;
    return false;
}

function exmd3_clear_error() {
    global $EX_MD3_LAST_ERROR;
    $EX_MD3_LAST_ERROR = "";
}

function ex_md3_last_error() {
    global $EX_MD3_LAST_ERROR;
    return $EX_MD3_LAST_ERROR;
}

function exmd3_set_backend($backend) {
    global $EX_MD3_LAST_BACKEND;
    $EX_MD3_LAST_BACKEND = $backend;
}

function ex_md3_last_backend() {
    global $EX_MD3_LAST_BACKEND;
    return $EX_MD3_LAST_BACKEND;
}

/* -------------------------------------------------------------------------
 * Pure-PHP EXMD3 implementation (used when SHA-512 + SHA3-512 exist)
 * ---------------------------------------------------------------------- */
function exmd3_pct($b) {
    $h = "0123456789ABCDEF";
    return "%" . substr($h, (($b >> 4) & 15), 1) . substr($h, ($b & 15), 1);
}

function exmd3_utf8_decode_one($s, &$i, &$cp) {
    $n = strlen($s);
    if ($i >= $n) return false;

    $c = ord(substr($s, $i++, 1));

    if ($c < 128) {
        $cp = $c;
        return true;
    }

    if ($c >= 0xC2 && $c <= 0xDF && $i < $n) {
        $c2 = ord(substr($s, $i++, 1));
        if (($c2 & 0xC0) != 0x80) return false;
        $cp = (($c & 31) << 6) | ($c2 & 63);
        return true;
    }

    if ($c >= 0xE0 && $c <= 0xEF && $i + 1 < $n) {
        $c2 = ord(substr($s, $i++, 1));
        $c3 = ord(substr($s, $i++, 1));
        if (($c2 & 0xC0) != 0x80 || ($c3 & 0xC0) != 0x80) return false;
        if ($c == 0xE0 && $c2 < 0xA0) return false;
        if ($c == 0xED && $c2 >= 0xA0) return false;
        $cp = (($c & 15) << 12) | (($c2 & 63) << 6) | ($c3 & 63);
        return true;
    }

    if ($c >= 0xF0 && $c <= 0xF4 && $i + 2 < $n) {
        $c2 = ord(substr($s, $i++, 1));
        $c3 = ord(substr($s, $i++, 1));
        $c4 = ord(substr($s, $i++, 1));
        if (($c2 & 0xC0) != 0x80 || ($c3 & 0xC0) != 0x80 || ($c4 & 0xC0) != 0x80) return false;
        if ($c == 0xF0 && $c2 < 0x90) return false;
        if ($c == 0xF4 && $c2 >= 0x90) return false;
        $cp = (($c & 7) << 18) | (($c2 & 63) << 12) | (($c3 & 63) << 6) | ($c4 & 63);
        return true;
    }

    return false;
}

function exmd3_encode_and_u16len($s, &$u16) {
    $safe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'();,/?:@&=+$#";
    $i = 0;
    $n = strlen($s);
    $u16 = 0;
    $out = "";

    while ($i < $n) {
        $cp = 0;
        if (!exmd3_utf8_decode_one($s, $i, $cp)) return false;

        $u16 += ($cp > 0xFFFF) ? 2 : 1;

        if ($cp < 128 && strpos($safe, chr($cp)) !== false) {
            $out .= chr($cp);
        }
        else if ($cp < 128) {
            $out .= exmd3_pct($cp);
        }
        else if ($cp < 0x800) {
            $out .= exmd3_pct(0xC0 | ($cp >> 6));
            $out .= exmd3_pct(0x80 | ($cp & 63));
        }
        else if ($cp < 0x10000) {
            $out .= exmd3_pct(0xE0 | ($cp >> 12));
            $out .= exmd3_pct(0x80 | (($cp >> 6) & 63));
            $out .= exmd3_pct(0x80 | ($cp & 63));
        }
        else {
            $out .= exmd3_pct(0xF0 | ($cp >> 18));
            $out .= exmd3_pct(0x80 | (($cp >> 12) & 63));
            $out .= exmd3_pct(0x80 | (($cp >> 6) & 63));
            $out .= exmd3_pct(0x80 | ($cp & 63));
        }
    }

    return $out;
}

function exmd3_has_native_hashes() {
    if (!function_exists('hash') || !function_exists('hash_algos')) return false;

    $algos = hash_algos();
    if (!is_array($algos)) return false;

    return in_array('sha512', $algos) && in_array('sha3-512', $algos);
}

function exmd3_native($s) {
    global $EX_MD3_ALPHABET;

    exmd3_clear_error();
    exmd3_set_backend('native');

    $u16 = 0;
    $enc = exmd3_encode_and_u16len($s, $u16);

    if ($enc === false) {
        return exmd3_set_error('EXMD3 E201: Input is not valid UTF-8.');
    }

    $frame = "EXMD3-V6|U16:" . $u16 . "|ENC:" . strlen($enc) . ":" . $enc .
             "|ALPHABET:" . $EX_MD3_ALPHABET . "|OUT:209";

    $seed = hash('sha512', "EXMD3-V6-SHA512|" . $frame, true) .
            hash('sha3-512', "EXMD3-V6-SHA3-512|" . $frame, true);

    $out = "";
    $counter = 0;

    while (strlen($out) < 209) {
        $c = chr(($counter >> 24) & 255) .
             chr(($counter >> 16) & 255) .
             chr(($counter >> 8) & 255) .
             chr($counter & 255);

        $block = hash('sha512', "EXMD3-V6-SQ-SHA512|" . $seed . $c, true) .
                 hash('sha3-512', "EXMD3-V6-SQ-SHA3-512|" . $seed . $c, true);

        $counter++;

        $blen = strlen($block);
        for ($i = 0; $i < $blen && strlen($out) < 209; $i++) {
            $v = ord(substr($block, $i, 1));
            if ($v < 240) {
                $out .= substr($EX_MD3_ALPHABET, $v % 30, 1);
            }
        }
    }

    return $out;
}

/* -------------------------------------------------------------------------
 * TCP service fallback - PHP 4.3.11 safe
 * Fixed service endpoint: 127.0.0.1:61476
 * ---------------------------------------------------------------------- */
$EX_MD3_SERVICE_HOST = "127.0.0.1";
$EX_MD3_SERVICE_PORT = 61476;
$EX_MD3_SERVICE_TIMEOUT = 2;
$EX_MD3_SERVICE_PERSISTENT = true;
$EX_MD3_SERVICE_FP = false;

function exmd3_service_close() {
    global $EX_MD3_SERVICE_FP;
    if ($EX_MD3_SERVICE_FP !== false) {
        @fclose($EX_MD3_SERVICE_FP);
        $EX_MD3_SERVICE_FP = false;
    }
}

function exmd3_service_connect() {
    global $EX_MD3_SERVICE_HOST, $EX_MD3_SERVICE_PORT, $EX_MD3_SERVICE_TIMEOUT;
    global $EX_MD3_SERVICE_PERSISTENT, $EX_MD3_SERVICE_FP;

    if ($EX_MD3_SERVICE_FP !== false) return $EX_MD3_SERVICE_FP;

    $errno = 0;
    $errstr = '';
    $fp = false;

    if ($EX_MD3_SERVICE_PERSISTENT && function_exists('pfsockopen')) {
        $fp = @pfsockopen(
            $EX_MD3_SERVICE_HOST,
            $EX_MD3_SERVICE_PORT,
            $errno,
            $errstr,
            $EX_MD3_SERVICE_TIMEOUT
        );
    }
    else {
        $fp = @fsockopen(
            $EX_MD3_SERVICE_HOST,
            $EX_MD3_SERVICE_PORT,
            $errno,
            $errstr,
            $EX_MD3_SERVICE_TIMEOUT
        );
    }

    if ($fp === false) {
        return exmd3_set_error(
            'EXMD3 E501: Cannot connect to exmd3_service.exe at ' .
            $EX_MD3_SERVICE_HOST . ':' . $EX_MD3_SERVICE_PORT .
            '; SocketError=' . $errno . '; ' . $errstr
        );
    }

    $EX_MD3_SERVICE_FP = $fp;
    return $fp;
}

function exmd3_write_all($fp, $data) {
    $len = strlen($data);
    $done = 0;

    while ($done < $len) {
        $n = @fwrite($fp, substr($data, $done));
        if ($n === false || $n == 0) return false;
        $done += $n;
    }

    return true;
}

function exmd3_read_exact($fp, $len) {
    $out = '';

    while (strlen($out) < $len) {
        $buf = @fread($fp, $len - strlen($out));
        if ($buf === false || $buf === '') return false;
        $out .= $buf;
    }

    return $out;
}

function exmd3_service_request_once($cmd, $iterations, $data) {
    $fp = exmd3_service_connect();
    if ($fp === false) return false;

    /* Request header (16 bytes): EXM6, version, cmd, reserved, iterations, length. */
    $header = 'EXM6' . pack('CCnNN', 1, $cmd, 0, $iterations, strlen($data));

    if (!exmd3_write_all($fp, $header) || !exmd3_write_all($fp, $data)) {
        exmd3_service_close();
        return exmd3_set_error('EXMD3 E502: Failed writing request to exmd3_service.exe.');
    }

    $rh = exmd3_read_exact($fp, 12);
    if ($rh === false) {
        exmd3_service_close();
        return exmd3_set_error('EXMD3 E503: exmd3_service.exe closed connection before response header.');
    }

    $u = @unpack('a4magic/Cversion/Cstatus/nreserved/Nlength', $rh);
    if (!is_array($u) || $u['magic'] != 'EXR6' || $u['version'] != 1 || $u['reserved'] != 0) {
        exmd3_service_close();
        return exmd3_set_error('EXMD3 E504: Invalid response header from exmd3_service.exe.');
    }

    $length = $u['length'];
    if ($length < 0 || $length > 16777216) {
        exmd3_service_close();
        return exmd3_set_error('EXMD3 E505: Invalid response length from exmd3_service.exe.');
    }

    $payload = exmd3_read_exact($fp, $length);
    if ($payload === false) {
        exmd3_service_close();
        return exmd3_set_error('EXMD3 E506: exmd3_service.exe closed connection during response payload.');
    }

    if ($u['status'] != 0) {
        return exmd3_set_error($payload);
    }

    return $payload;
}

function exmd3_service_request($cmd, $iterations, $data) {
    global $EX_MD3_LAST_ERROR;

    exmd3_clear_error();
    exmd3_set_backend('service');

    $result = exmd3_service_request_once($cmd, $iterations, $data);
    if ($result !== false) return $result;

    /* One reconnect/retry handles a stale persistent socket after service restart. */
    exmd3_service_close();
    exmd3_clear_error();
    $result = exmd3_service_request_once($cmd, $iterations, $data);
    return $result;
}

function exmd3_service_ping() {
    return exmd3_service_request(4, 0, '');
}

function exmd3_service_selftest() {
    return exmd3_service_request(3, 0, '');
}

function exmd3_service_hash($s) {
    global $EX_MD3_ALPHABET;

    $out = exmd3_service_request(1, 1, $s);
    if ($out === false) return false;

    if (strlen($out) != 209 || strspn($out, $EX_MD3_ALPHABET) != strlen($out)) {
        return exmd3_set_error('EXMD3 E507: Invalid HASH output returned by exmd3_service.exe.');
    }

    return $out;
}

function exmd3_service_hashn($s, $n) {
    global $EX_MD3_ALPHABET;

    $out = exmd3_service_request(2, $n, $s);
    if ($out === false) return false;

    if ($n == 0) return $out;

    if (strlen($out) != 209 || strspn($out, $EX_MD3_ALPHABET) != strlen($out)) {
        return exmd3_set_error('EXMD3 E508: Invalid HASHN output returned by exmd3_service.exe.');
    }

    return $out;
}

/* -------------------------------------------------------------------------
 * Public API
 * ---------------------------------------------------------------------- */
function ex_md3($s) {
    if (exmd3_has_native_hashes()) {
        return exmd3_native($s);
    }

    return exmd3_service_hash($s);
}

function ex_md3n($s, $n) {
    if (!is_numeric($n) || $n < 0 || floor($n) != $n) {
        return exmd3_set_error('EXMD3 E301: Iteration count must be a non-negative integer.');
    }

    $n = (int)$n;

    if (exmd3_has_native_hashes()) {
        for ($i = 0; $i < $n; $i++) {
            $s = exmd3_native($s);
            if ($s === false) return false;
        }
        return $s;
    }

    /* Legacy PHP: one TCP request; all N iterations run inside the C service. */
    return exmd3_service_hashn($s, $n);
}

function ex_md3_selftest() {
    $kat = "GFiReiA6ettMrAQtAEEr676aFhHredT8DrtdTLLQDTATAfMGMTMRdy7EeeGf7GFi6TFLLf443urDt6ejrFtMdG383Le3ddhEtbTGjRHm6MTeaDtmamAHyDGjerdGut8f7yrdMDDRdE7tDDiQGfmtna67FierAede46eryyAHQfLE3E87fu6mmjh7mH37nrGE3neGR76tHh64QReAL";
    $n2 = "ebyMbin6ahhf4uQFFMti87d8bTE7fFirGfj6GabHTLL4rhfbGTTeLAGAiLDfMMaTd7nuhRd3TFG3mFiLLAGLj3mhMdy4n3Gt7nAd66jDmRhhdQTmatjL68EE6b7mGmyQe7DAm3iyiiM78ERymAA6u3fiTinfeQfaiybHGmMdhjrDijf8ir6QMu4nfbnrmHn4f3AbyThntaH6ndhA8";

    if (ex_md3('abc') !== $kat) return 'FAIL';
    if (ex_md3n('abc', 2) !== $n2) return 'FAIL';
    if (ex_md3n('abc', 0) !== 'abc') return 'FAIL';

    return 'PASS';
}

/* -------------------------------------------------------------------------
 * Original direct-test behavior
 * ---------------------------------------------------------------------- */
//$result = ex_md3("123");
//if ($result === false) {
//    echo ex_md3_last_error();
//}
//else {
//    echo $result;
//}
?>
