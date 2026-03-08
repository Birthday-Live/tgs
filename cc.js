let btnCounter = 0;
let currentTab = 'photo';

// 页面加载完成后初始化
window.onload = function() {
  addButton();
  addButton();
  togglePhotoInput(); // 初始化显示正确的输入框
};

// 切换标签页
function switchTab(tabName) {
  currentTab = tabName;
  
  // 更新标签样式
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
  
  // 更新内容显示
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// 切换图片输入方式
function togglePhotoInput() {
  const source = document.getElementById('photo_source').value;
  
  document.getElementById('photo_url_group').style.display = 'none';
  document.getElementById('photo_base64_group').style.display = 'none';
  document.getElementById('photo_upload_group').style.display = 'none';
  
  if (source === 'url') {
    document.getElementById('photo_url_group').style.display = 'block';
  } else if (source === 'base64') {
    document.getElementById('photo_base64_group').style.display = 'block';
  } else if (source === 'upload') {
    document.getElementById('photo_upload_group').style.display = 'block';
  }
}

// 处理文件上传并自动转为Base64
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // 检查文件类型和大小
  if (!file.type.match('image.*')) {
    alert('请选择图片文件 (JPG, PNG, GIF)');
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert('文件大小不能超过 10MB');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    // 显示预览
    const preview = document.getElementById('image-preview');
    preview.src = e.target.result;
    document.getElementById('preview-container').style.display = 'block';
    
    // 自动填充Base64输入框
    document.getElementById('photo_base64').value = e.target.result;
    
    // 自动切换到Base64模式
    document.getElementById('photo_source').value = 'base64';
    togglePhotoInput();
  };
  
  reader.readAsDataURL(file);
}

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
  
  if (currentTab === 'photo') {
    token = document.getElementById('token').value.trim();
    chat_id = document.getElementById('chat_id').value.trim();
    
    const photo_source = document.getElementById('photo_source').value;
    let photo_data;
    
    if (photo_source === 'url') {
      photo_data = document.getElementById('photo_url').value.trim();
    } else if (photo_source === 'base64' || photo_source === 'upload') {
      photo_data = document.getElementById('photo_base64').value.trim();
      
      // 确保Base64数据包含前缀
      if (photo_data && !photo_data.startsWith('data:image/')) {
        alert('Base64数据必须包含完整前缀（如 data:image/jpeg;base64,）');
        return;
      }
    }
    
    const caption = document.getElementById('caption').value.trim();
    
    if (!token || !chat_id || !photo_data) {
      alert('请填写 Token、频道 ID 和图片数据');
      return;
    }
    
    message_data = {
      method: 'sendPhoto',
      params: {
        chat_id: chat_id,
        photo: photo_data,
        ...(caption && { caption: caption }),
        parse_mode: 'HTML'
      }
    };
    
  } else {
    token = document.getElementById('text_token').value.trim();
    chat_id = document.getElementById('text_chat_id').value.trim();
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
    if (currentTab === 'photo') {
      document.getElementById('token').value = '';
      document.getElementById('chat_id').value = '';
      document.getElementById('photo_url').value = '';
      document.getElementById('photo_base64').value = '';
      document.getElementById('caption').value = '';
      document.getElementById('photo_file').value = '';
      document.getElementById('photo_source').value = 'url';
      document.getElementById('preview-container').style.display = 'none';
      togglePhotoInput();
    } else {
      document.getElementById('text_token').value = '';
      document.getElementById('text_chat_id').value = '';
      document.getElementById('message_text').value = '';
    }
    
    const buttonsContainer = document.getElementById('buttons-container');
buttonsContainer.innerHTML = '';
btnCounter = 0;

addButton();
addButton();

document.getElementById('result').innerText = '填寫完畢後點擊上方按鈕生成鏈接';

    
  
