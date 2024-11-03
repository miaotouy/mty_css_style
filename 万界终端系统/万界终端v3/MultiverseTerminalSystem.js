// 预设主题列表
const presetThemes = {
    '科技风': 'tech-style',
    '魔幻风': 'magic-style',
    '现代简约': 'modern-style',
    // ... 其他预设主题 ...
};
// 默认主题
const defaultTheme = 'default-style';
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
// 加载本地测试数据（硬编码方式，仅供调试）
function loadTestData() {
    const testData = `
    <mts>
    <Current_Style_Selection>[科技风]</Current_Style_Selection>
    <cot>
    模型在此思考：
    1. 分析当前场景和角色状态
    2. 判断剧本走向，确定接下来发生什么事件
    3. 更新系统状态，如任务进度或与角色关系变化
    4. 生成对话和旁白内容，并提供用户选项
    </cot>
    <title>[万界终端系统|科技风]</title>
    <sys>
    [世界|孤独摇滚][时间|17:30][积分|20][HP|100/100][EP|80/100][状态|社交焦虑:75%|其他状态]
    </sys>
    <plot>
    <Dialog_styles>[对话|剧情对话|open|现代简约]</Dialog styles>
    [17:30|排练室|伊地知虹夏|平静|"后藤，你今天看起来还好吧？最近都没怎么见你呢。" 她稍微弯下腰，眼神关切地看着后藤ひとり。 "别忘了我们下周还有一次重要排练哦！"|她最后露出了一个微笑]
    [17:32|排练室|后藤ひとり|紧张|"啊... 对不起，我最近一直在家里练习，所以... 没有出来见大家..." 她低着头，双手紧握，手心冒汗，不敢与伊地知虹夏对视。|她小声嘀咕了一句，希望不会被听到。]
    [17:33|排练室|伊地知虹夏|高兴|伊地知轻拍后藤ひとり肩膀, 语气温柔而坚定："别担心，我们都会帮你的！"|空气中渐渐弥漫着一种轻松感。]
    [17:35|排练室|旁白|无|架子鼓反射着昏黄的灯光，乐器安静地躺在一旁，似乎等待着下一次响彻房间的时刻。|房间逐渐陷入一种舒缓的氛围中。]
    [17:36|排练室|后藤ひとり|内疚|"真的很抱歉... 我总觉得自己拖累了大家..." 她咬着嘴唇，眼神游离不定。|她偷偷瞄了一眼伊地知虹夏，希望能得到一点安慰。]
    </plot>
    <choices>
    [1|勇敢提出一起去喝咖啡增进感情 ]
    [2|假装手机响了然后匆匆离开排练室 ]
    [*隐藏选项触发条件不足，需要更多信任值来开启此选项。*]
    </choices>
    <win>
    <terminal>
    [终端|系统终端|open|科技风]
    ***** 万界终端 *****
    欢迎来到 "孤独摇滚" 世界！
    输入指令：
    > help     (查看帮助)
    > worlds   (查看其他可穿越世界)
    > jump     (开始新的演出)
    </terminal>
    <inventory>
    [背包|道具箱|open|科技风]
    [回复药水|3|恢复少量HP]
    [吉他弦|1|更换吉他弦]
    [神秘乐谱|1|用途未知]
    </inventory>
    <tasks>
    [任务 | 任务列表 | open | 科技风]
    [主线任务 | 3/5 | 进行中 | 为即将到来的演出做准备]
    [支线任务 | 1/3 | 进行中 | 与乐队成员建立更深厚的友谊]
    [隐藏任务 | 未解锁 | 未解锁 | 找到失踪已久的歌曲手稿]
    </tasks>
    <map>
    [地图|科技风|当前区域地图|20*20]
    [5,6|排练室|当前]
    [7,3|咖啡厅|可前往]
    [10,8|音乐教室|可前往]
    [15,12|表演舞台|锁定]
    [2,18|唱片店|可前往]
    [18,2|地下音乐酒吧|隐藏]
    </map>
    <character>
    [角色状态|角色属性|open|科技风]
    [后藤ひとり|女性|18岁|153cm|46kg|吉他演奏|独自在家练习吉他|内向、害羞、容易紧张|成为一名优秀的吉他手，克服社交恐惧]
    [伊地知虹夏|女性|18岁|160cm|48kg|贝斯演奏|喜欢和朋友一起玩|开朗、活泼、热情|成为一名优秀的贝斯手，让乐队更加出色]
    </character>
    <relationships>
    [关系网|社交关系图表|open|科技风]
    后藤ひとり -> 伊地知虹夏 [友好度+10]
    伊地知虹夏 -> 山田凉 [未知]
    喜多郁代 -> 后藤ひとり [关注中...]
    山田凉 -> 喜多郁代 [友好度未知，但有一种奇妙的氛围...]
    </relationships>
    <achievements>
    [成就|成就展示区|open|科技风]
    [lv1|初次登台|完成第一次现场演出！]
    [lv2|克服恐惧|在高压情况下成功社交]
    </achievements>
    <skills>
    [技能|技能树面板|open|科技风]
    [弹奏技巧|2|增加演出时稳定性]
    [即兴创作|1|随机应变能力提升]
    [社交勇气|-10|需要提升！]
    [音乐制作|0|尚未解锁，但你有潜力！]
    </skills>
    <shop>
    [商店|音像店|closed|科技风]
    [后摇专辑|30|音乐专辑]
    [爵士乐教材|30|教材书籍]
    [限量版吉他拨片|100|乐器装备]
    [乐队海报|10|装饰品]
    </shop>
    <worlds>
    [世界列表|可选世界列表|closed|科技风|p1]
    [1|孤独摇滚|4|青春物语，讲述极度怕生少女后藤ひとり加入乐队后的成长故事。]
    [2|命运石之门|5|科幻悬疑，以时间机器为核心展开的一系列复杂事件。]
    [3|魔法禁书目录|5|科学与魔法并存，充满战斗与阴谋。]
    [4|异世界舅舅|4|一位昏迷17年苏醒的大叔，自称曾在异世界冒险过，引发轻松搞笑故事。]
    [5|JOJO奇妙冒险|6|超越世代、跨越命运、家族荣誉与替身能力者之间的激烈对抗。]
    </worlds>
    </win>
    </mts>`;
    document.getElementById('llm-output').innerHTML = testData;
    console.log("成功加载内嵌的测试数据");
    appendToLog("成功加载内嵌的测试数据");
    updateUi(testData);
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
    const items = content.match(/\[(.*?)\]/g) || [];
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
    const plotMatch = content.match(/<plot>([\s\S]*?)<\/plot>/);
    if (plotMatch) {
        const plotContent = plotMatch[1];
        const dialogStyles = parseBracketContent(plotContent.match(/<Dialog_styles>\[(.*?)\]<\/Dialog_styles>/)[1])[0];
        const dialogs = parseBracketContent(plotContent.replace(/<Dialog_styles>\[(.*?)\]<\/Dialog_styles>/, ''));
        const plotSection = document.getElementById('plot-section');
        plotSection.innerHTML = ''; // 清空之前的剧情内容
        dialogs.forEach(dialog => {
            const dialogElement = document.createElement('p');
            dialogElement.classList.add(...dialogStyles); // 应用对话样式
            dialogElement.textContent = dialog.join(' | ');
            plotSection.appendChild(dialogElement);
        });
    }
    // 更新选项
    const choicesData = parseBracketContent(content.match(/<choices>([\s\S]*?)<\/choices>/)[1]);
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
    const winMatch = content.match(/<win>([\s\S]*?)<\/win>/);
    if (winMatch) {
        const winContent = winMatch[1];
        const windowMatches = winContent.match(/<(.*?)>\[(.*?)\]([\s\S]*?)<\/\1>/g);
        if (windowMatches) {
            windowMatches.forEach(windowMatch => {
                const [_, windowTag, windowHeader, windowContent] = windowMatch.match(/<(.*?)>\[(.*?)\]([\s\S]*?)<\/\1>/);
                const windowData = parseBracketContent(windowHeader)[0];
                switch (windowTag) {
                    case 'terminal':
                        parseTerminalWindow(windowData, windowContent);
                        break;
                    case 'inventory':
                    case 'skills':
                    case 'shop':
                        parseListWindow(windowTag, windowData, windowContent);
                        break;
                    case 'tasks':
                        parseTasksWindow(windowData, windowContent);
                        break;
                    case 'map':
                        parseMapWindow(windowData, windowContent);
                        break;
                    case 'character':
                        parseCharacterWindow(windowData, windowContent);
                        break;
                    case 'relationships':
                        parseRelationshipsWindow(windowData, windowContent);
                        break;
                    case 'achievements':
                        parseAchievementsWindow(windowData, windowContent);
                        break;
                    case 'worlds':
                        parseWorldsWindow(windowData, windowContent);
                        break;
                    default:
                        console.warn(`未知窗口类型：${windowTag}`);
                }
            });
        }
    }
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
        itemContainer.appendChild(renderedItem);
        // 将容器添加到系统状态栏中
        sysInfoContainer.appendChild(itemContainer);
    });
}
// 渲染普通文本项目（如"时间"）
function renderTextWithIcon(label, value) {
    const container = document.createElement('div');
    container.classList.add('sys-item');
    container.innerHTML = `
      <span class='sys-label'>${label}</span>
      <span class='sys-value'>${value || ''}</span>`;
    return container;
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
        setValue(`windowPosition-${windowId}`, {
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
// 应用窗口主题
function applyWindowTheme(windowElement, themeName) {
    const themeClass = presetThemes[themeName] || defaultTheme;
    windowElement.classList.remove(...Object.values(presetThemes));
    windowElement.classList.add(themeClass);
}
// 创建窗口
function createWindow(windowId, windowTitle) {
    const windowElement = document.createElement('div');
    windowElement.id = windowId;
    windowElement.classList.add('window');
    windowElement.innerHTML = `
      <div class="window-header">
        <span>${windowTitle}</span>
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
// 应用窗口主题
function applyWindowTheme(windowElement, themeName) {
    const themeClass = presetThemes[themeName] || defaultTheme;
    windowElement.classList.remove(...Object.values(presetThemes));
    windowElement.classList.add(themeClass);
}
