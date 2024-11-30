// 预设主题列表
const presetThemes = {
    '魔幻风': 'magic-style',
    '现代简约': 'modern-style',
    // ... 其他预设主题 ...
};
// 默认主题
const defaultTheme = 'tech-style'; // 将科技风设置为默认主题
// 检查是否在用户脚本环境中
const isUserScriptEnvironment = typeof GM_getValue !== 'undefined';
// 使用适当的存储函数
function setValue(key, value) {
    if (isUserScriptEnvironment) {
        GM_setValue(key, value);
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
function getValue(key, defaultValue) {
    if (isUserScriptEnvironment) {
        return GM_getValue(key, defaultValue);
    } else {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    }
}
// 检查 LLM 输出区域是否为空，如果为空则加载测试数据
window.addEventListener('load', () => {
    const llmOutput = document.getElementById('llm-output');
    if (llmOutput && llmOutput.innerHTML.includes('<mts>')) {
        console.log("LLM 内容已存在，直接解析并更新 UI");
        updateUi(llmOutput.innerHTML);
    } else {
        console.log("未检测到有效的 LLM 内容，尝试加载测试数据...");
        loadTestData();
    }
});
// 加载本地测试数据 (从同一主机加载)
function loadTestData() {
    const testDataUrl = '/输出格式.txt'; // 使用相对路径以避免跨域问题
    fetch(testDataUrl)
        .then(response => response.text())
        .then(data => {
            document.getElementById('llm-output').innerHTML = data;
            console.log("成功加载测试数据");
            appendToLog("成功加载测试数据");
            updateUi(data);
        })
        .catch(error => {
            console.error("加载测试数据失败:", error);
            appendToLog("加载测试数据失败: " + error);
        });
}
// 添加日志信息的方法，用于调试和记录问题
function appendToLog(message) {
    let logList = document.getElementById('log-list');
    if (!logList) {
        logList = document.createElement('ul');
        logList.id = 'log-list';
        document.body.appendChild(logList);
    }
    const logItem = document.createElement('li');
    logItem.textContent = message;
    logList.appendChild(logItem);
}
// 全局变量，用于存储已获得的成就与当前页码信息
let achievements = [];
let currentPage = {
    'worlds-window': 1,
    'shop-window': 1,
};
// 通用 [] 格式解析模块
function parseBracketContent(content) {
    const items = content.match(/\[(.*?)\]/g); // 去掉 || []
    if (!items) return []; // 如果没有匹配到，返回空数组
    return items.map(item => item.slice(1, -1).split('|'));
}
// 通用的点击模块
function sendChoiceToInput(choice) {
    const stText = document.querySelector('.st-text');
    if (stText) {
        stText.value = choice;
        stText.dispatchEvent(new Event('input', { bubbles: true }));
        stText.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        console.error('Cannot find .st-text element');
    }
}
// 更新 UI 界面
function updateUi(content) {
    // 更新全局主题风格
    const styleMatch = content.match(/<Current_Style_Selection>\[(.*?)\]<\/Current_Style_Selection>/);
    if (styleMatch) {
        applyGlobalTheme(styleMatch[1]);
    }
    // 更新标题
    const titleMatch = content.match(/<title>\[(.*?)\|(.*?)\]<\/title>/);
    if (titleMatch) {
        document.getElementById('game-title').textContent = titleMatch[1];
        applyGlobalTheme(titleMatch[2]); // 应用标题主题
    }
    // 更新系统状态
    updateSystemInfo(content);
    // 更新剧情
    parsePlotWindow(content);
    // 更新选项
    const choicesData = parseChoices(content);
    const choicesSection = document.getElementById('choices-section');
    choicesSection.innerHTML = ''; // 清空之前的选项
    choicesData.forEach(choice => {
        const [index, text] = choice;
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', () => sendChoiceToInput(index));
        choicesSection.appendChild(button);
    });
    // 更新窗口
    parseWin(content);
}
// 检查是否为数字或者范围形式的数据，如 "100/100"
function isNumericValue(value) {
    return /^\d+\/\d+$/.test(value);
}
// 检查字符串中是否包含百分比形式，如 "75%"
function containsPercentage(text) {
    return /\d+%/.test(text);
}
// 更新系统栏内容
function updateSystemInfo(content) {
    const sysData = parseBracketContent(content.match(/<sys>([\s\S]*?)<\/sys>/)[1]);
    const sysInfoContainer = document.getElementById('sys-info');
    // 清空旧内容
    sysInfoContainer.innerHTML = '';
    // 遍历每一项 sys 数据并进行动态分析和渲染
    sysData.forEach(([key, ...values]) => {
        // 为每个属性创建一个容器
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('sys-item'); // 添加样式类
        let renderedItem;
        if (values.length === 0) {
            // 单纯只有 key 没有 value，也许是一个小标题，比如 "世界"
            renderedItem = renderTextItem(key);
        } else if (isNumericValue(values[0])) {
            // 数值型项目，如 HP、EP 等，调用进度条渲染函数
            renderedItem = renderProgressBarItem(key, values[0]);
        } else if (containsPercentage(values.join('|'))) {
            // 带百分比的数据，例如 "社交焦虑:75%"
            renderedItem = renderStatusWithPercentage(key, values.join('|'));
        } else if (values.length > 1) {
            // 多重子项，用 | 分隔 -> 渲染成多行文字或者其他样式
            renderedItem = renderMultipleValues(key, values);
        } else {
            // 普通非数值型项目，比如 "时间" 或者 "积分"
            renderedItem = renderTextWithIcon(key, values[0]);
        }
        // 将渲染结果添加到容器中
        itemContainer.innerHTML = renderedItem; // 确保是 HTML 字符串
        // 将容器添加到系统状态栏中
        sysInfoContainer.appendChild(itemContainer);
    });
}
// 渲染普通文本项目（如"时间"）
function renderTextItem(label) {
    return `<span class='sys-label'>${label}</span>`; // 返回 HTML 字符串
}
// 渲染进度条项目（如 HP/EP）
function renderProgressBarItem(label, value) {
    const [current, max] = value.split('/').map(Number);
    const percentage = Math.floor((current / max) * 100);
    let colorClass = '';
    switch (label.toLowerCase()) {
        case 'hp':
            colorClass = (percentage > 50) ? 'safe' : 'danger';
            break;
        case 'ep':
            colorClass = (percentage > 50) ? 'high-energy' : 'low-energy';
            break;
        default:
            colorClass = 'neutral';
    }
    return `
     <div class="progress-bar-container">
          <span>${label}: ${current}/${max}</span>
          <div class="progress-bar ${colorClass}">
              <div style="width:${percentage}%"></div>
          </div>
     </div>`;
}
// 渲染带有百分比的状态（如社交焦虑）
function renderStatusWithPercentage(label, statusString) {
    const match = statusString.match(/(.*?):(\d+)%?/);
    if (!match) return `<p>${statusString}</p>`;
    const [, name, value] = match;
    let colorClass = value >= 75 ? 'high-anxiety' : value >= 50 ? 'medium-anxiety' : 'low-anxiety';
    return `
          <div class='small-progress-bar-container'>
             <span>${name} (${value}%)</span>
             <div class='small-progress-bar ${colorClass}' style="width:${value}%"></div>
          </div>`
}
// 渲染多重子项（以 | 分隔）
function renderMultipleValues(label, values) {
    let subItems = values.map(v => {
        if (containsPercentage(v)) {
            return renderStatusWithPercentage('', v);
        } else {
            return `<p>${v}</p>`;
        }
    }).join('');
    return `
       <div class="multiple-status-container">
          <strong>${label}:</strong>
          ${subItems}
       </div>`
}
// 渲染普通文本项目（如"时间"）
function renderTextWithIcon(label, value) {
    return `
      <span class='sys-label'>${label}</span>
      <span class='sys-value'>${value || ''}</span>`;
}
// 解析选项
function parseChoices(content) {
    const choicesMatch = content.match(/<choices>([\s\S]*?)<\/choices>/);
    if (!choicesMatch || !choicesMatch[1]) {
        console.warn("未找到选项内容");
        return []; // 返回空数组，避免后续代码出错
    }
    const choicesContent = choicesMatch[1];
    return parseBracketContent(choicesContent);
}
// 解析窗口内容
function parseWin(content) {
    const winMatch = content.match(/<win>([\s\S]*?)<\/win>/);
    if (!winMatch) return;
    const winContent = winMatch[1];
    const windowMatches = winContent.match(/<(.*?)>\[(.*?)\]([\s\S]*?)<\/\1>/g);
    if (windowMatches) {
        windowMatches.forEach(windowMatch => {
            const [_, windowTag, windowHeader, windowContent] = windowMatch.match(/<(.*?)>\[(.*?)\]([\s\S]*?)<\/\1>/);
            const windowData = parseBracketContent(windowHeader)[0];
            let windowTitle = '未知窗口'; // 默认窗口标题
            let windowId = `unknown-window-${windowTag}`; // 默认窗口 ID
            let state = 'open'; // 默认窗口状态
            let style = '科技风'; // 默认窗口样式
            if (windowData && windowData.length >= 2) {
                windowTitle = windowData[0];
                windowId = windowData[1];
            }
            if (windowData && windowData.length >= 3) {
                state = windowData[2];
            }
            if (windowData && windowData.length >= 4) {
                style = windowData[3];
            }
            // 尝试解析窗口内容，如果解析失败，则直接显示原始内容
            let parsedContent;
            try {
                switch (windowTag) {
                    case 'terminal':
                        parsedContent = parseTerminalWindow(windowData, windowContent);
                        break;
                    case 'inventory':
                    case 'skills':
                    case 'shop':
                        parsedContent = parseListWindow(windowTag, windowData, windowContent);
                        break;
                    case 'tasks':
                        parsedContent = parseTasksWindow(windowData, windowContent);
                        break;
                    case 'map':
                        parsedContent = parseMapWindow(windowData, windowContent);
                        break;
                    case 'character':
                        parsedContent = parseCharacterWindow(windowData, windowContent);
                        break;
                    case 'relationships':
                        parsedContent = parseRelationshipsWindow(windowData, windowContent);
                        break;
                    case 'achievements':
                        parsedContent = parseAchievementsWindow(windowData, windowContent);
                        break;
                    case 'worlds':
                        parsedContent = parseWorldsWindow(windowData, windowContent);
                        break;
                    default:
                        // 对于未知窗口类型，直接显示原始内容
                        parsedContent = `<pre>${windowContent}</pre>`;
                        console.warn(`未知窗口类型：${windowTag}，直接显示原始内容`);
                }
            } catch (error) {
                parsedContent = `<pre>${windowContent}</pre>`;
                console.error(`解析窗口 ${windowTag} 时出错：`, error);
            }
            // 使用弹窗基础模板渲染窗口
            renderWindow(windowId, windowTitle, state, style, parsedContent);
        });
    }
}
// 解析终端窗口
function parseTerminalWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style] = windowData;
    // 使用弹窗基础模板渲染窗口
    renderWindow(windowId, windowTitle, state, style, windowContent);
}
// 解析列表窗口（背包、技能、商店）
function parseListWindow(windowTag, windowData, windowContent) {
    const [, windowTitle, windowId, state, style] = windowData;
    const items = parseBracketContent(windowContent);
    const listContent = `
      <ul>
        ${items.map(item => `<li>${item.join(' | ')}</li>`).join('')}
      </ul>
    `;
    // 使用弹窗基础模板渲染窗口
    renderWindow(windowId, windowTitle, state, style, listContent);
}
// 解析任务窗口
function parseTasksWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style] = windowData;
    const tasks = parseBracketContent(windowContent);
    const taskList = `
      <table>
        <thead>
          <tr>
            <th>任务类型</th>
            <th>进度</th>
            <th>状态</th>
            <th>描述</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => `
            <tr>
              <td>${task[0]}</td>
              <td>${task[1]}</td>
              <td>${task[2]}</td>
              <td>${task[3]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    renderWindow(windowId, windowTitle, state, style, taskList);
}
// 解析角色状态窗口
function parseCharacterWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style] = windowData;
    const charactersData = parseBracketContent(windowContent);
    // 创建标签页
    const tabsHtml = charactersData.map((characterData, index) => `
      <div class="tab ${index === 0 ? 'active' : ''}" data-tab-index="${index}">
        ${characterData[0]}
      </div>
    `).join('');
    const tabContentsHtml = charactersData.map((characterData, index) => `
      <div class="tab-content ${index === 0 ? 'active' : ''}" data-tab-index="${index}">
        <table>
          ${characterData.slice(1).map((value, i) => `
            <tr>
              <td>${characterLabels[i] || '其他'}</td>
              <td>${value}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `).join('');
    // 使用弹窗基础模板渲染窗口
    renderWindow(windowId, windowTitle, state, style, `
      <div class="tabs">${tabsHtml}</div>
      <div class="tab-contents">${tabContentsHtml}</div>
    `);
    // 添加标签页切换事件
    const tabs = windowElement.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签页的 active 类
            tabs.forEach(t => t.classList.remove('active'));
            // 添加 active 类到当前标签页
            tab.classList.add('active');
            // 隐藏所有标签页内容
            const tabContents = windowElement.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            // 显示当前标签页内容
            const tabIndex = tab.dataset.tabIndex;
            windowElement.querySelector(`.tab-content[data-tab-index="${tabIndex}"]`).classList.add('active');
        });
    });
}
// 角色信息标签
const characterLabels = [
    '姓名', '性别', '年龄', '身高', '体重', '特长', '爱好', '性格', '目标'
];
// 渲染窗口（弹窗基础模板）
function renderWindow(windowId, windowTitle, state, style, windowContent) {
    let windowElement = document.getElementById(windowId);
    if (!windowElement) {
        windowElement = createWindow(windowId, windowTitle);
    }
    // 更新窗口内容
    windowElement.querySelector('.window-content').innerHTML = windowContent;
    // 应用窗口状态
    if (state === 'open') {
        windowElement.style.display = 'block';
    } else if (state === 'closed') {
        window.style.display = 'none';
    } else if (state === 'disabled') {
        window.style.display = 'none';
        // TODO: 添加禁用样式
    }
    // 应用窗口主题
    applyWindowTheme(windowElement, style);
}
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
        const position = getValue(`windowPosition-${windowId}`, defaultPosition);
        const isVisible = getValue(`windowVisible-${windowId}`, true);
        window.style.left = position.left;
        window.style.top = position.top;
        window.style.display = isVisible ? 'block' : 'none';
    });
}
// 窗口拖拽函数
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    elmnt.querySelector('.window-header').onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        isDragging = true;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        requestAnimationFrame(() => updateElementPosition(elmnt, pos1, pos2));
    }

    function updateElementPosition(elmnt, dx, dy) {
        if (isDragging) {
            elmnt.style.top = (elmnt.offsetTop - dy) + "px";
            elmnt.style.left = (elmnt.offsetLeft - dx) + "px";
        }
    }

    function closeDragElement() {
        isDragging = false;
        document.onmouseup = null;
        document.onmousemove = null;
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
// 应用全局主题
function applyGlobalTheme(themeName) {
    const themeClass = presetThemes[themeName] || defaultTheme;
    document.body.classList.remove(...Object.values(presetThemes));
    document.body.classList.add(themeClass);
}
// 创建窗口
function createWindow(windowId, windowTitle) {
    const windowElement = document.createElement('div');
    windowElement.id = windowId;
    windowElement.classList.add('window');
    windowElement.innerHTML = `
      <div class="window-header">
        <span>${windowTitle}</span>
        <button class="minimize-btn" onclick="toggleMinimize('${windowId}')">—</button>
        <button class="maximize-btn" onclick="toggleMaximize('${windowId}')">□</button>
        <button class="close-btn" onclick="toggleWindow('${windowId}')">X</button>
      </div>
      <div class="window-content"></div>
    `;
    document.getElementById('windows').appendChild(windowElement);
    return windowElement;
}
// 切换窗口显示状态
function toggleWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement.style.display === 'block') {
        windowElement.style.display = 'none';
        setValue(`windowVisible-${windowId}`, false);
    } else {
        windowElement.style.display = 'block';
        setValue(`windowVisible-${windowId}`, true);
    }
}
// 切换窗口最小化状态
function toggleMinimize(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement.classList.contains('minimized')) {
        windowElement.classList.remove('minimized');
        windowElement.querySelector('.window-content').style.display = 'block';
    } else {
        windowElement.classList.add('minimized');
        windowElement.querySelector('.window-content').style.display = 'none';
    }
}
// 切换窗口最大化状态
function toggleMaximize(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement.classList.contains('maximized')) {
        windowElement.classList.remove('maximized');
        windowElement.style.width = '';
        windowElement.style.height = '';
        windowElement.style.left = '';
        windowElement.style.top = '';
    } else {
        windowElement.classList.add('maximized');
        windowElement.style.width = '100vw';
        windowElement.style.height = '100vh';
        windowElement.style.left = '0';
        windowElement.style.top = '0';
    }
}
// 应用窗口主题
function applyWindowTheme(windowElement, themeName) {
    const themeClass = presetThemes[themeName] || defaultTheme;
    windowElement.classList.remove(...Object.values(presetThemes));
    windowElement.classList.add(themeClass);
}
// 解析剧情窗口
function parsePlotWindow(content) {
    const plotMatch = content.match(/<plot>([\s\S]*?)<\/plot>/);
    if (!plotMatch || !plotMatch[1]) {
        console.warn("未找到剧情内容");
        return;
    }
    const plotContent = plotMatch[1];
    try {
        // 提取对话样式
        const dialogStylesMatch = plotContent.match(/<Dialog_styles>\[(.*?)\]<\/Dialog_styles>/);
        if (!dialogStylesMatch || !dialogStylesMatch[1]) {
            console.warn("无法解析对话样式");
            return;
        }
        // 提取对话内容，去掉对话样式部分
        const dialogsContent = plotContent.replace(/<Dialog_styles>\[(.*?)\]<\/Dialog_styles>/, '').trim();
        const dialogs = parseBracketContent(dialogsContent);
        if (!dialogs || dialogs.length === 0) {
            console.warn("对话数据为空");
            return;
        }
        let currentDialogIndex = 0;
        const plotSection = document.getElementById('plot-section');
        function renderDialog(index) {
            if (index < 0 || index >= dialogs.length) return;
            const dialog = dialogs[index];
            plotSection.innerHTML = `
                <div class="dialog" style="text-align: center;">
                    <div>${dialog.join(' | ')}</div>
                    <div class="dialog-controls">
                        <button onclick="navigateDialog(-1)">上一个</button>
                        <button onclick="navigateDialog(1)">下一个</button>
                    </div>
                </div>`;
        }
         function navigateDialog(direction) {
             currentDialogIndex += direction;
             currentDialogIndex = Math.max(0, Math.min(currentDialogIndex, dialogs.length - 1));
             renderDialog(currentDialogIndex);
         }
         renderDialog(currentDialogIndex);
     } catch(error){
       console.error("出错啦", error);
     }
}
// 解析地图窗口
function parseMapWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style, mapSize] = windowData;
    const [width, height] = mapSize.split('*').map(Number);
    const locations = parseBracketContent(windowContent);
    let mapHtml = `<table>`;
    for (let y = 0; y < height; y++) {
        mapHtml += `<tr>`;
        for (let x = 0; x < width; x++) {
            let locationData = locations.find(([locX, locY]) => x === Number(locX) && y === Number(locY));
            let locationClass = '隐藏';
            let locationText = '';
            if (locationData) {
                locationText = locationData[1];
                locationClass = locationData[2];
            }
            mapHtml += `<td class="${locationClass}" data-x="${x}" data-y="${y}">${locationText}</td>`;
        }
        mapHtml += `</tr>`;
    }
    mapHtml += `</table>`;
    renderWindow(windowId, windowTitle, state, style, mapHtml);
    // 添加地图交互事件（例如点击可前往地点）
    const mapCells = document.querySelectorAll(`#${windowId} .可前往`);
    mapCells.forEach(cell => {
        cell.addEventListener('click', () => {
            // TODO: 实现地图交互逻辑，例如移动到目标地点
            console.log(`点击了地图上的可前往地点：${cell.dataset.x}, ${cell.dataset.y}`);
        });
    });
}
// 解析关系网窗口
function parseRelationshipsWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style] = windowData;
    const relationships = parseBracketContent(windowContent.replace(/\[(.*?)\]/, '')); // 移除第一个 [] 内容
    const relationshipList = `
      <ul>
        ${relationships.map(relationship => `<li>${relationship.join(' -> ')} ${relationship[2]}</li>`).join('')}
      </ul>
    `;
    renderWindow(windowId, windowTitle, state, style, relationshipList);
}
// 解析成就窗口
function parseAchievementsWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style] = windowData;
    const achievementsData = parseBracketContent(windowContent);
    const achievementList = `
      <ul>
        ${achievementsData.map(achievement => `
          <li class="achievement achievement-${achievement[0]}">
            ${achievement[1]} - ${achievement[2]}
          </li>
        `).join('')}
      </ul>
    `;
    renderWindow(windowId, windowTitle, state, style, achievementList);
}
// 解析世界列表窗口
function parseWorldsWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style, pageNumber] = windowData;
    // TODO: 实现分页逻辑
    const worlds = parseBracketContent(windowContent);
    const worldList = `
      <ul>
        ${worlds.map(world => `<li>${world.join(' | ')}</li>`).join('')}
      </ul>
    `;
    renderWindow(windowId, windowTitle, state, style, worldList);
}
// 解析商店窗口
function parseShopWindow(windowData, windowContent) {
    const [, windowTitle, windowId, state, style] = windowData;
    // TODO: 实现商店逻辑
    const items = parseBracketContent(windowContent);
    const shopList = `
      <ul>
        ${items.map(item => `<li>${item.join(' | ')}</li>`).join('')}
      </ul>
    `;
    renderWindow(windowId, windowTitle, state, style, shopList);
}
