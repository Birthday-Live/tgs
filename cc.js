/**
 * 核心逻辑文件: cc.js
 */

let currentMode = 'a';

// 切换模式
function setMode(m, el) {
    currentMode = m;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('uploadBox').style.display = (m === 'b') ? 'block' : 'none';
    document.getElementById('imageGroup').style.display = (m === 'c') ? 'none' : 'block';
    document.getElementById('dataLabel').innerText = (m === 'b') ? 'Base64 数据' : '图片 URL';
}

// 处理图片上传
function handleFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { document.getElementById('imageData').value = e.target.result; };
    reader.readAsDataURL(file);
}

// 获取当前的按钮配置
function getKeyboard() {
    return {
        "inline_keyboard": [
            [{"text": document.getElementById('btn1Text').value, "url": document.getElementById('btn1Url').value}],
            [{"text": document.getElementById('btn2Text').value, "url": document.getElementById('btn2Url').value}]
        ]
    };
}

// 执行发送
async function startSend() {
    const token = document.getElementById('token').value.trim();
    const chatId = document.getElementById('chatId').value.trim();
    const text = document.getElementById('textContent').value;
    const photo = document.getElementById('imageData').value;
    const out = document.getElementById('apiOutput');

    if (!token || !chatId) return alert("请填写 Token 和 Chat ID");

    const apiMethod = (currentMode === 'c') ? 'sendMessage' : 'sendPhoto';
    const apiUrl = `https://api.telegram.org/bot${token}/${apiMethod}`;
    const keyboard = getKeyboard(); // 动态获取按钮

    try {
        const payload = {
            chat_id: chatId,
            parse_mode: 'HTML',
            reply_markup: keyboard
        };
        if (currentMode === 'c') { payload.text = text; } 
        else { payload.photo = photo; payload.caption = text; }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        out.innerText = JSON.stringify(result, null, 2);
    } catch (err) {
        fallbackFormSend(apiUrl, chatId, text, photo, keyboard);
    }
}

// 表单降级发送
function fallbackFormSend(url, chatId, text, photo, keyboard) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.target = '_blank';

    const fields = {
        chat_id: chatId,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify(keyboard)
    };

    if (currentMode === 'c') { fields.text = text; } 
    else { fields.photo = photo; fields.caption = text; }

    for (const key in fields) {
        const input = document.createElement('textarea');
        input.name = key;
        input.value = fields[key];
        input.style.display = 'none';
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}
