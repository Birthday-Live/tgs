/**
 * Telegram 消息发送核心逻辑
 * 文件名: cc.js
 */

let currentMode = 'a';
const keyboard = {
    "inline_keyboard": [
        [{"text": "查看水喝千束規則", "url": "https://te.legra.ph/%E7%BE%A4%E8%A7%84-03-07-2"}],
        [{"text": "加入群組", "url": "https://tg.chat.chisato.org.cn/"}]
    ]
};

// 切换 A/B/C 模式
function setMode(m, el) {
    currentMode = m;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    
    const uploadBox = document.getElementById('uploadBox');
    const imageGroup = document.getElementById('imageGroup');
    const dataLabel = document.getElementById('dataLabel');

    if (m === 'c') {
        imageGroup.style.display = 'none';
    } else {
        imageGroup.style.display = 'block';
        uploadBox.style.display = (m === 'b') ? 'block' : 'none';
        dataLabel.innerText = (m === 'b') ? '图片 Base64 数据' : '图片 URL 链接';
    }
}

// 处理本地图片转 Base64
function handleFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imageData').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 执行发送逻辑
async function startSend() {
    const token = document.getElementById('token').value.trim();
    const chatId = document.getElementById('chatId').value.trim();
    const text = document.getElementById('textContent').value;
    const photo = document.getElementById('imageData').value;
    const out = document.getElementById('apiOutput');

    if (!token || !chatId) return alert("请填写 Token 和 Chat ID");

    out.innerText = "正在尝试发送 (Fetch)...";
    out.style.color = "#abb2bf";

    const apiMethod = (currentMode === 'c') ? 'sendMessage' : 'sendPhoto';
    const apiUrl = `https://api.telegram.org/bot${token}/${apiMethod}`;

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
        out.style.color = result.ok ? "#98c379" : "#e06c75";

    } catch (err) {
        // 如果 Fetch 报错 (例如 Failed to fetch)，自动降级到 Form 提交
        out.innerText = "Fetch 失败，正在尝试强制模式 (Form Submit)...";
        out.style.color = "#d19a66";
        
        setTimeout(() => {
            fallbackFormSend(apiUrl, chatId, text, photo);
        }, 1000);
    }
}

// 强制模式：通过隐藏表单提交（解决跨域和超长 Base64 问题）
function fallbackFormSend(url, chatId, text, photo) {
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
    
    document.getElementById('apiOutput').innerText += "\n\n[强制模式] 已弹出新窗口发送，请查看窗口回执。";
}
