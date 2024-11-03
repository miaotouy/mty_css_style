// 预设主题列表
const presetThemes = {
    '科技风': 'tech-style',
    '魔幻风': 'magic-style',
    '现代简约': 'modern-style',
    // ... 其他预设主题 ...
  };
  // 默认主题
  const defaultTheme = 'default-style';
  // 检查 LLM 输出区域是否为空，如果为空则加载测试数据
  window.addEventListener('load', () => {
    const llmOutput = document.getElementById('llm-output');
    if (llmOutput.innerHTML.trim() === '') {
      // 延迟 2 秒后检查是否加载了测试数据
      setTimeout(() => {
        if (llmOutput.innerHTML.trim() === '') {
          appendToLog('获取的 LLM 内容为空');
        }
      }, 2000);
      loadTestData();
    }
  });
  // 加载测试数据
  function loadTestData() {
    fetch('输出格式.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error('加载测试数据失败');
        }
        return response.text();
      })
      .then(data => {
        document.getElementById('llm-output').innerHTML = data;
        // 禁用 MutationObserver 监听
        observer.disconnect();
        // 更新 UI 界面
        updateUi(data);
      })
      .catch(error => {
        console.error(error);
        appendToLog('获取的 LLM 内容为空');
      });
  }
  // 添加日志
  function appendToLog(message) {
    const logList = document.getElementById('log-list');
    const logItem = document.createElement('li');
    logItem.textContent = message;
    logList.appendChild(logItem);
  }
  // 监听 LLM 输出区域的内容变化
  const llmOutput = document.getElementById('llm-output');
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        // 内容发生变化，更新 UI 界面
        updateUi(llmOutput.innerHTML);
        // 检查是否输出完毕
        if (llmOutput.innerHTML.includes('</mts>')) {
          // 停止监听
          observer.disconnect();
        }
      }
    });
  });
  // 配置 MutationObserver
  const config = { childList: true, subtree: true };
  // 开始监听
  observer.observe(llmOutput, config);
  // 全局变量，用于存储已获得的成就与当前页码信息
  let achievements = [];
  let currentPage = {
    'worlds-window': 1,
    'shop-window': 1,
  };
  // 更新 UI 界面
  function updateUi(content) {
    // 更新标题
    const titleMatch = content.match(/\[标题\|(.*?)\]/);
    if (titleMatch) {
      document.getElementById('game-title').textContent = titleMatch[1];
    }
    // 更新系统状态
    const sysMatch = content.match(/\[世界\|(.*?)\]\[时间\|(.*?)\]\[积分\|(.*?)\]\[HP\|(.*?)\]\[EP\|(.*?)\]\[状态\|(.*?)\]/);
    if (sysMatch) {
      document.getElementById('sys-world').textContent = sysMatch[1];
      document.getElementById('sys-time').textContent = sysMatch[2];
      document.getElementById('sys-score').textContent = sysMatch[3];
      document.getElementById('sys-hp').textContent = sysMatch[4];
      document.getElementById('sys-ep').textContent = sysMatch[5];
      document.getElementById('sys-status').textContent = sysMatch[6];
    }
    // 更新剧情
    const plotMatch = content.match(/<plot>([\s\S]*?)<\/plot>/);
    if (plotMatch) {
      document.getElementById('plot-section').innerHTML = plotMatch[1].replace(/\[(.*?)\|(.*?)\]/g, '<span class="$1">$2</span>');
    }
    // 更新选项
    const choicesMatch = content.match(/<choices>([\s\S]*?)<\/choices>/);
    if (choicesMatch) {
      const choicesSection = document.getElementById('choices-section');
      choicesSection.innerHTML = '';
      const choices = choicesMatch[1].trim().split('\n');
      choices.forEach(choice => {
        const [index, text] = choice.slice(1, -1).split('|');
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', () => {
          // TODO: 发送选择结果给 LLM
          console.log('选择:', index);
        });
        choicesSection.appendChild(button);
      });
    }
    // 更新成就
    const achievementMatch = content.match(/<achievements type="generic">\[(.*?) \| (.*?) \| (open|closed) \| (.*?)\]([\s\S]*?)<\/achievements>/);
    if (achievementMatch) {
      const title = achievementMatch[1];
      const id = achievementMatch[2];
      const state = achievementMatch[3];
      const style = achievementMatch[4];
      const achievementContent = achievementMatch[5];
      const newAchievements = achievementContent.match(/\[lv\d+\|.*?\|.*?\]/g) || [];
      updateAchievements(newAchievements);
      updateGenericWindow(id + '-window', title, state, style, achievementContent);
    }
    // 更新窗口
    const winMatch = content.match(/<win>([\s\S]*?)<\/win>/);
    if (winMatch) {
      const winContent = winMatch[1];
      const windowMatches = winContent.match(/<(.*?) type="(.*?)">\[(.*?) \| (.*?) \| (open|closed) \| (.*?)\]([\s\S]*?)<\/\1>/g);
      if (windowMatches) {
        windowMatches.forEach(windowMatch => {
          const [_, windowTag, windowType, title, id, state, style, windowContent] = windowMatch.match(/<(.*?) type="(.*?)">\[(.*?) \| (.*?) \| (open|closed) \| (.*?)\]([\s\S]*?)<\/\1>/);
          switch (windowType) {
            case 'generic':
              updateGenericWindow(id + '-window', title, state, style, windowContent);
              break;
            case 'list':
              updateListWindow(id + '-window', title, state, style, windowContent);
              break;
            default:
              console.warn(`未知窗口类型：${windowType}`);
          }
        });
      }
    }
    // 更新地图
    const mapMatch = content.match(/<map>([\s\S]*?)<\/map>/);
    if (mapMatch) {
      const mapContent = mapMatch[1];
      const map = parseMap(mapContent);
      const mapElement = renderMap(map);
      updateGenericWindow('map-window', '地图', 'open', map.style, mapElement.outerHTML);
    }
  }
  // 更新通用窗口
  function updateGenericWindow(windowId, title, state, style, content) {
    let windowElement = document.getElementById(windowId);
    if (!windowElement) {
      windowElement = createWindow(windowId, title);
    }
    // 更新窗口内容
    windowElement.querySelector('.window-content').innerHTML = content;
    // 应用窗口状态
    if (state === 'open') {
      windowElement.style.display = 'block';
    } else if (state === 'closed') {
      windowElement.style.display = 'none';
    } else if (state === 'disabled') {
      windowElement.style.display = 'none';
      // TODO: 添加禁用样式
    }
    // 应用窗口主题
    applyWindowTheme(windowElement, style);
  }
  // 更新列表窗口（世界列表、商店、背包）
  function updateListWindow(windowId, title, state, style, content) {
    // 解析列表内容
    const [header, ...items] = content.trim().split('\n');
    const [_, _, _, _, page] = header.match(/\[(.*?) \| (.*?) \| (.*?) \| (.*?) \| p(\d+)\]/);
    // 创建窗口（如果不存在）
    let windowElement = document.getElementById(windowId);
    if (!windowElement) {
      windowElement = createWindow(windowId, title);
    }
    // 更新窗口内容
    const contentElement = windowElement.querySelector('.window-content');
    contentElement.innerHTML = '';
    const listElement = document.createElement('ul');
    items.forEach(item => {
      const [index, ...rest] = item.slice(1, -1).split('|');
      const listItem = document.createElement('li');
      listItem.textContent = rest.join(' | ');
      listItem.addEventListener('click', () => {
        if (windowId === 'worlds-window') {
          // TODO: 处理世界跳转逻辑
          console.log('跳转到世界:', index);
        } else if (windowId === 'shop-window') {
          // TODO: 处理购买逻辑
          console.log('购买商品:', index);
        } else if (windowId === 'inventory-window') {
          // TODO: 处理使用物品逻辑
          console.log('使用物品:', index);
        }
      });
      listElement.appendChild(listItem);
    });
    contentElement.appendChild(listElement);
    // 应用窗口状态
    // ... (代码与 updateGenericWindow 相同) ...
    // 应用窗口主题
    // ... (代码与 updateGenericWindow 相同) ...
    // 处理分页
    // TODO: 实现分页逻辑
  }
  // 更新成就列表
  function updateAchievements(newAchievements) {
    // 解析新的成就
    const parsedAchievements = newAchievements.map(achievement => {
      const [level, name, description] = achievement.match(/\[(.+?)\|(.+?)\|(.+?)\]/)[1].split('|');
      return { level, name, description };
    });
    // 去重并添加新成就
    parsedAchievements.forEach(achievement => {
      if (!achievements.some(a => a.name === achievement.name)) {
        achievements.push(achievement);
      }
    });
    // 更新成就面板
    updateAchievementPanel();
  }
  // 更新成就面板
  function updateAchievementPanel() {
    const achievementPanel = document.getElementById('achievement-panel');
    if (achievementPanel) {
      achievementPanel.innerHTML = '';
      achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.classList.add('achievement', `achievement-${achievement.level}`);
        achievementElement.innerHTML = `
          <h3>${achievement.name}</h3>
          <p>${achievement.description}</p>
        `;
        achievementPanel.appendChild(achievementElement);
      });
    }
  }
  // 解析地图数据
  function parseMap(mapContent) {
    const lines = mapContent.split('\n');
    const [_, style, name, size] = lines[0].match(/\[地图\|(.+?)\|(.+?)\|(.+?)\]/);
    const [width, height] = size.split('*').map(Number);
    const locations = lines.slice(1).map(line => {
      const [_, coords, name, status] = line.match(/\[(.+?)\|(.+?)\|(.+?)\]/);
      const [x, y] = coords.split(',').map(Number);
      return { x, y, name, status };
    });
    return {
      style,
      name,
      width,
      height,
      locations
    };
  }
  // 渲染地图
  function renderMap(map) {
    // 创建一个 20*20 的网格
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${map.width}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${map.height}, 1fr)`;
    // 为每个位置创建一个单元格
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const cell = document.createElement('div');
        cell.style.border = '1px solid #ccc';
        cell.style.padding = '5px';
        const location = map.locations.find(loc => loc.x === x && loc.y === y);
        if (location) {
          cell.textContent = location.name;
          cell.classList.add(location.status);
        }
        grid.appendChild(cell);
      }
    }
    return grid;
  }
  // 检查屏幕宽度并应用相应的布局
  function checkScreenWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      // 应用手机布局
      applyMobileLayout();
    } else {
      // 应用 PC 布局
      applyPcLayout();
    }
  }
  // 应用手机布局
  function applyMobileLayout() {
    // TODO: 禁用窗口拖拽，隐藏所有窗口并显示主窗口，调整工具栏按钮的点击事件
    console.log('应用手机布局');
  }
  // 应用 PC 布局
  function applyPcLayout() {
    // 启用窗口拖拽
    initializeWindows();
    // 显示所有窗口，隐藏主窗口
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
      window.style.display = 'block';
    });
    document.getElementById('main-window').style.display = 'none';
    // 恢复工具栏按钮的点击事件，创建新的窗口
    // TODO: 实现工具栏按钮的点击事件
  }
  // 页面加载完成后检查屏幕宽度
  window.addEventListener('load', checkScreenWidth);
  // 监听窗口大小变化事件
  window.addEventListener('resize', checkScreenWidth);
  // 窗口默认位置
  const defaultWindowPositions = {
    'terminal-window': { left: '20px', top: '80px' }, // 例如，终端窗口默认在左上角
    'inventory-window': { left: '340px', top: '80px' }, // 例如，背包窗口默认在右上角
    // ... 其他窗口的默认位置 ...
  };
  // 窗口堆叠偏移量
  const stackOffset = { left: '20px', top: '20px' };
  // 初始化窗口
  function initializeWindows() {
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
      const windowId = window.id;
      // 设置窗口默认位置
      const defaultPosition = defaultWindowPositions[windowId] || { left: '20px', top: '80px' };
      window.style.left = defaultPosition.left;
      window.style.top = defaultPosition.top;
      // 处理窗口堆叠
      const stackedWindows = document.querySelectorAll(`.window[data-zone="${windowId}"]`);
      let stackCount = 0;
      stackedWindows.forEach(stackedWindow => {
        if (stackedWindow !== window) {
          stackCount++;
          stackedWindow.style.left = `${parseInt(defaultPosition.left) + stackCount * stackOffset.left}px`;
          stackedWindow.style.top = `${parseInt(defaultPosition.top) + stackCount * stackOffset.top}px`;
        }
      });
      // 添加拖拽功能
      dragElement(window);
      // 添加点击置顶功能
      window.addEventListener('mousedown', () => bringToFront(window));
      // 读取窗口位置和显示状态
      const position = GM_getValue(`windowPosition-${windowId}`, defaultPosition);
      const isVisible = GM_getValue(`windowVisible-${windowId}`, true);
      window.style.left = position.left;
      window.style.top = position.top;
      window.style.display = isVisible ? 'block' : 'none';
    });
  }
  // 窗口拖拽函数
  function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.querySelector('.window-header').onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // 获取鼠标点击位置
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // 计算鼠标移动距离
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // 更新窗口位置
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
      // 停止拖拽
      document.onmouseup = null;
      document.onmousemove = null;
      // 保存窗口位置
      const windowId = elmnt.id;
      GM_setValue(`windowPosition-${windowId}`, {
        left: elmnt.style.left,
        top: elmnt.style.top
      });
    }
  }
  // 窗口置顶函数
  function bringToFront(window) {
    const windows = document.querySelectorAll('.window');
    let maxZIndex = 0;
    windows.forEach(w => {
      const zIndex = parseInt(w.style.zIndex || 0);
      if (zIndex > maxZIndex) {
        maxZIndex = zIndex;
      }
    });
    window.style.zIndex = maxZIndex + 1;
  }
  // 页面加载完成后初始化窗口
  window.addEventListener('load', initializeWindows);
  // TODO: 实现 parseSettingsWindowContent 函数，解析设置面板内容
  // TODO: 实现 createSettingsWindow 函数，创建设置面板窗口
  // TODO: 实现 showWindow 函数，显示窗口
  // TODO: 实现 applyWindowTheme 函数，应用窗口主题样式
  // TODO: 实现 updateListWindow 函数中的分页逻辑
  // TODO: 实现世界列表、商店和背包的独特功能，例如跳转世界、购买商品、使用物品等
  // TODO: 实现地图的渲染和交互逻辑
  // TODO: 实现工具栏按钮的点击事件
  // TODO: 实现手机布局的逻辑
  // TODO: 实现错误处理和调试工具
  