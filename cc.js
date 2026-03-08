/**
 * Telegram 消息助手逻辑控制
 * 文件名: cc.js
 */

let currentMode = 'a';

// 模式切换
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
        dataLabel.innerText = (m === 'b') ? '图片 Base64 数据' : '图片 URL';
    }
}

// 图片转 Base64 处理
function handleFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imageData').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 获取按钮配置
function getKeyboard() {
    return {
        "inline_keyboard": [
            [{"text": document.getElementById('btn1Text').value, "url": document.getElementById('btn1Url').value}],
            [{"text": document.getElementById('btn2Text').value, "url": document.getElementById('btn2Url').value}]
        ]
    };
}

/**
 * 关键函数：将 Base64 字符串转换为二进制文件 (Blob)
 */
function base64ToBlob(base64) {
    const parts = base64.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// 执行发送
async function startSend() {
    const token = document.getElementById('token').value.trim();
    const chatId = document.getElementById('chatId').value.trim();
    const text = document.getElementById('textContent').value;
    const photoValue = document.getElementById('imageData').value.trim();
    const out = document.getElementById('apiOutput');

    if (!token || !chatId) return alert("请填写 Token 和 Chat ID");

    out.innerText = "🚀 正在执行发送 (二进制流模式)...";
    out.style.color = "#abb2bf";

    const apiMethod = (currentMode === 'c') ? 'sendMessage' : 'sendPhoto';
    const apiUrl = `https://api.telegram.org/bot${token}/${apiMethod}`;
    const keyboard = getKeyboard();

    try {
        // 使用 FormData 模拟真实表单上传，这能处理极大长度的数据
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('parse_mode', 'HTML');
        formData.append('reply_markup', JSON.stringify(keyboard));

        if (currentMode === 'c') {
            formData.append('text', text);
        } else {
            // 如果是 B 模式且是 Base64 数据，转成 Blob 文件对象
            if (currentMode === 'b' && photoValue.startsWith('data:')) {
                const blob = base64ToBlob(photoValue);
                formData.append('photo', blob, "image.jpg"); 
            } else {
                // A 模式或普通字符串直接添加
                formData.append('photo', photoValue);
            }
            formData.append('caption', text);
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData // 注意：不需要设置 Content-Type，浏览器会自动处理
        });

        const result = await response.json();
        out.innerText = JSON.stringify(result, null, 2);
        out.style.color = result.ok ? "#98c379" : "#e06c75";

    } catch (err) {
        out.innerText = "❌ 网络错误: " + err.message + "\n可能是跨域拦截或代理未生效。";
        out.style.color = "#e06c75";
    }
}
    const file = input.files[0];
    if (!file) return;
    
    // 如果文件超过 5MB，给出提示
    if (file.size > 5 * 1024 * 1024) {
        alert("图片较大，发送时间可能会较长，请耐心等待。");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imageData').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * 获取网页上配置的内联按钮数据
 */
function getKeyboard() {
    return {
        "inline_keyboard": [
            [
                {
                    "text": document.getElementById('btn1Text').value || "查看规则", 
                    "url": document.getElementById('btn1Url').value || "#"
                }
            ],
            [
                {
                    "text": document.getElementById('btn2Text').value || "加入群组", 
                    "url": document.getElementById('btn2Url').value || "#"
                }
            ]
        ]
    };
}

/**
 * 核心辅助函数：将 Base64 字符串转换为二进制 Blob 对象
 * 这是解决 "wrong remote file identifier" 报错的关键
 */
function base64ToBlob(base64) {
    const parts = base64.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/**
 * 执行发送逻辑
 */
async function startSend() {
    const token = document.getElementById('token').value.trim();
    const chatId = document.getElementById('chatId').value.trim();
    const text = document.getElementById('textContent').value;
    const photoData = document.getElementById('imageData').value.trim();
    const out = document.getElementById('apiOutput');

    if (!token || !chatId) {
        alert("请先填写机器人 Token 和目标 Chat ID");
        return;
    }

    out.innerText = "🚀 正在通过二进制流上传模式发送，请稍候...";
    out.style.color = "#abb2bf";

    const apiMethod = (currentMode === 'c') ? 'sendMessage' : 'sendPhoto';
    const apiUrl = `https://api.telegram.org/bot${token}/${apiMethod}`;
    const keyboard = getKeyboard();

    try {
        // 使用 FormData 包装数据，这等同于 HTML 表单的 multipart/form-data
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('parse_mode', 'HTML');
        formData.append('reply_markup', JSON.stringify(keyboard));

        if (currentMode === 'c') {
            formData.append('text', text);
        } else {
            // 针对 B 模式（本地上传）的特殊处理
            if (currentMode === 'b' && photoData.startsWith('data:')) {
                const imageBlob = base64ToBlob(photoData);
                // 将 Blob 对象作为文件附加到 photo 字段
                formData.append('photo', imageBlob, "upload_image.jpg");
            } else {
                // A 模式直接发送 URL 字符串
                formData.append('photo', photoData);
            }
            formData.append('caption', text);
        }

        // 发送请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData // Fetch 会根据 FormData 自动设置正确的请求头
        });

        const result = await response.json();
        
        // 渲染回执结果
        out.innerText = JSON.stringify(result, null, 2);
        
        if (result.ok) {
            out.style.color = "#98c379"; // 成功绿色
        } else {
            out.style.color = "#e06c75"; // 失败红色
            if (result.description.includes("file identifier")) {
                out.innerText += "\n\n提示：检测到文件标识符错误，请确认是否选择了正确的【B. 本地上传】模式并重新上传图片。";
            }
        }

    } catch (err) {
        out.innerText = "❌ 网络请求失败: " + err.message + "\n\n排查建议：\n1. 请检查您的梯子是否开启了全局模式。\n2. 确保浏览器可以访问 api.telegram.org。";
        out.style.color = "#e06c75";
    }
}
