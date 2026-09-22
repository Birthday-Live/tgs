// ==========================================
// BY TG@WaterChisato
// ==========================================
function decrypt(keyStr, b64Data) {
    var binary = atob(b64Data);
    var len = binary.length;
    var s = [];
    for (var i = 0; i < 256; i++) { s[i] = i; }
    var j = 0;
    for (var i = 0; i < 256; i++) {
        j = (j + s[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
        var temp = s[i]; s[i] = s[j]; s[j] = temp;
    }
    var i = 0, j = 0;
    var str = '';
    for (var y = 0; y < len; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        var temp = s[i]; s[i] = s[j]; s[j] = temp;
        var decryptedByte = binary.charCodeAt(y) ^ s[(s[i] + s[j]) % 256];
        str += String.fromCharCode(decryptedByte);
    }
    try { return decodeURIComponent(escape(str)); } catch(e) { return str; }
}
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
