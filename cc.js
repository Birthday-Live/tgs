/**
 * cc.js - 修复点不动及报错问题
 */
let currentMode = 'a';

function setMode(m, el) {
    currentMode = m;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    
    const uploadBox = document.getElementById('uploadBox');
    const imageGroup = document.getElementById('imageGroup');
    if(uploadBox) uploadBox.style.display = (m === 'b') ? 'block' : 'none';
    if(imageGroup) imageGroup.style.display = (m === 'c') ? 'none' : 'block';
}

function handleFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const target = document.getElementById('imageData');
        if(target) target.value = e.target.result;
    };
    reader.readAsDataURL(file);
}

function getKeyboard() {
    // 增加安全检查，如果找不到输入框，返回空键盘
    try {
        const b1t = document.getElementById('btn1Text')?.value;
        const b1u = document.getElementById('btn1Url')?.value;
        const b2t = document.getElementById('btn2Text')?.value;
        const b2u = document.getElementById('btn2Url')?.value;

        let buttons = [];
        if (b1t && b1u) buttons.push([{ text: b1t, url: b1u }]);
        if (b2t && b2u) buttons.push([{ text: b2t, url: b2u }]);
        return { inline_keyboard: buttons };
    } catch (e) {
        return { inline_keyboard: [] };
    }
}

function base64ToBlob(base64) {
    const parts = base64.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
}

async function startSend() {
    // 1. 获取基础元素
    const tokenEl = document.getElementById('token');
    const chatIdEl = document.getElementById('chatId');
    const textEl = document.getElementById('textContent');
    const dataEl = document.getElementById('imageData');
    const out = document.getElementById('apiOutput');

    if (!tokenEl || !chatIdEl || !out) {
        alert("页面结构损坏，请重新检查 HTML ID");
        return;
    }

    const token = tokenEl.value.trim();
    const chatId = chatIdEl.value.trim();
    if (!token || !chatId) return alert("请填写 Token 和 Chat ID");

    out.innerText = "🚀 正在发送...";
    
    const apiMethod = (currentMode === 'c') ? 'sendMessage' : 'sendPhoto';
    const apiUrl = `https://api.telegram.org/bot${token}/${apiMethod}`;
    const keyboard = getKeyboard();

    try {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('parse_mode', 'HTML');
        formData.append('reply_markup', JSON.stringify(keyboard));

        if (currentMode === 'c') {
            formData.append('text', textEl.value);
        } else {
            const photoData = dataEl.value.trim();
            if (currentMode === 'b' && photoData.startsWith('data:')) {
                formData.append('photo', base64ToBlob(photoData), "img.jpg");
            } else {
                formData.append('photo', photoData);
            }
            formData.append('caption', textEl.value);
        }

        const response = await fetch(apiUrl, { method: 'POST', body: formData });
        const result = await response.json();
        out.innerText = JSON.stringify(result, null, 2);
    } catch (err) {
        out.innerText = "❌ 运行报错: " + err.message;
    }
}
