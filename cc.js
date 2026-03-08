let btnCounter = 0;
let currentType = 'photo-url';

// 页面加载完成后初始化
window.onload = function() {
  // 设置消息类型选择事件
  document.querySelectorAll('.type-option').forEach(option => {
    option.addEventListener('click', function() {
      // 更新活动状态
      document.querySelectorAll('.type-option').forEach(el => {
        el.classList.remove('active');
      });
      this.classList.add('active');
      
      // 显示对应的表单
      const type = this.getAttribute('data-type');
      currentType = type;
      
      document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(`${type}-form`).classList.add('active');
    });
  });
  
  // 添加默认按钮
  addButton();
  addButton();
};

// 添加按钮
function addButton() {
  btnCounter++;
  const container = document.getElementById('buttons-container');
  
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'button-item';
  buttonDiv.innerHTML = `
    <button class="delete-btn" onclick="removeButton(this)">×</button>
    <div class="group">
      <label>按钮 ${btnCounter} 文字</label>
      <input type="text" class="btn-text" placeholder="按钮显示文字">
    </div>
    <div class="group">
      <label>按钮 ${btnCounter} 链接</label>
      <input type="url" class="btn-url" placeholder="https://example.com">
    </div>
  `;
  
  container.appendChild(buttonDiv);
}

// 删除按钮
function removeButton(button) {
  const buttonItem = button.parentElement;
  buttonItem.remove();
  
  // 更新剩余按钮的编号
  const buttons = document.querySelectorAll('.button-item');
  buttons.forEach((btn, index) => {
    const labels = btn.querySelectorAll('label');
    labels[0].textContent = `按钮 ${index + 1} 文字`;
    labels[1].textContent = `按钮 ${index + 1} 链接`;
  });
  
  btnCounter = buttons.length;
}

// 生成链接
function generate() {
  let token, chat_id, message_data;
  
  if (currentType === 'photo-url') {
    token = document.getElementById('token').value.trim();
    chat_id = document.getElementById('chat_id').value.trim();
    const photo_url = document.getElementById('photo_url').value.trim();
    const caption = document.getElementById('caption').value.trim();
    
    if (!token || !chat_id || !photo_url) {
      alert('请填写 Token、频道 ID 和图片链接');
      return;
    }
    
    message_data = {
      method: 'sendPhoto',
      params: {
        chat_id: chat_id,
        photo: photo_url,
        ...(caption && { caption: caption }),
        parse_mode: 'HTML'
      }
    };
    
  } else if (currentType === 'photo-base64') {
    token = document.getElementById('base64-token').value.trim();
    chat_id = document.getElementById('base64-chat_id').value.trim();
    const photo_base64 = document.getElementById('photo_base64').value.trim();
    const caption = document.getElementById('base64-caption').value.trim();
    
    if (!token || !chat_id || !photo_base64) {
      alert('请填写 Token、频道 ID 和 Base64 图片数据');
      return;
    }
    
    // 确保Base64数据包含前缀
    if (!photo_base64.startsWith('data:image/')) {
      alert('Base64数据必须包含完整前缀（如 data:image/jpeg;base64,）');
      return;
    }
    
    message_data = {
      method: 'sendPhoto',
      params: {
        chat_id: chat_id,
        photo: photo_base64,
        ...(caption && { caption: caption }),
        parse_mode: 'HTML'
      }
    };
    
  } else { // text-only
    token = document.getElementById('text-token').value.trim();
    chat_id = document.getElementById('text-chat_id').value.trim();
    const message_text = document.getElementById('message_text').value.trim();
    
    if (!token || !chat_id || !message_text) {
      alert('请填写 Token、频道 ID 和消息内容');
      return;
    }
    
    message_data = {
      method: 'sendMessage',
      params: {
        chat_id: chat_id,
        text: message_text,
        parse_mode: 'HTML'
      }
    };
  }
  
  // 收集按钮数据
  const buttons = [];
  document.querySelectorAll('.button-item').forEach(item => {
    const text = item.querySelector('.btn-text').value.trim();
    const url = item.querySelector('.btn-url').value.trim();
    
    if (text && url) {
      buttons.push({ text, url });
    }
  });
  
  // 构建键盘结构
  if (buttons.length > 0) {
    const keyboard = [];
    buttons.forEach(btn => {
      keyboard.push([btn]);
    });
    
    message_data.params.reply_markup = JSON.stringify({ inline_keyboard: keyboard });
  }
  
  // 生成完整URL
  const baseUrl = `https://api.telegram.org/bot${encodeURIComponent(token)}/${message_data.method}`;
  const params = new URLSearchParams();
  
  // 添加参数
  for (const key in message_data.params) {
    if (message_data.params.hasOwnProperty(key)) {
      params.append(key, message_data.params[key]);
    }
  }
  
  const url = `${baseUrl}?${params.toString()}`;
  
  // 显示结果
  document.getElementById('result').innerHTML = url;
}

// 复制到剪贴板
function copyToClipboard() {
  const resultText = document.getElementById('result').innerText;
  navigator.clipboard.writeText(resultText)
    .then(() => {
      alert('链接已复制到剪贴板！');
    })
    .catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动选择并复制链接');
    });
}

// 重置表单
function resetForm() {
  if (confirm('确定要重置所有内容吗？')) {
    if (currentType === 'photo-url') {
      document.getElementById('token').value = '';
      document.getElementById('chat_id').value = '';
      document.getElementById('photo_url').value = '';
      document.getElementById('caption').value = '';
    } else if (currentType === 'photo-base64') {
      document.getElementById('base64-token').value = '';
      document.getElementById('base64-chat_id').value = '';
      document.getElementById('photo_base64').value = '';
      document.getElementById('base64-caption').value = '';
    } else { // text-only
      document.getElementById('text-token').value = '';
      document.getElementById('text-chat_id').value = '';
      document.getElementById('message_text').value = '';
    }
    
    const buttonsContainer = document.getElementById('buttons-container');
    buttonsContainer.innerHTML = '';
    btnCounter = 0;
    
    addButton();
    addButton();
    
    document.getElementById('result').innerText = '填写完毕后点击上方按钮生成链接';
  }
  /* 保持之前的CSS不变，只添加预览相关样式 */
#preview-container {
  margin-top: 15px;
  display: none;
  text-align: center;
}

#image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

}
