const gameOutput = document.getElementById('game-output');
const userInput = document.getElementById('user-input');
const submitButton = document.getElementById('submit-button');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsPage = document.getElementById('settingsPage');
const closeSettingsBtn = document.getElementById('closeSettings');
const restartButton = document.getElementById('restartButton');

// 更新所有角色信息
function updateAllPlayerInfo(playerData) {
    document.getElementById('name').textContent = playerData.name || '';
    document.getElementById('jingjie').textContent = playerData.realm || '';
    document.getElementById('linggen').textContent = playerData.linggen || '';
    document.getElementById('xiuwei').textContent = playerData.cultivation?.experience || '';
    document.getElementById('experience').textContent = playerData.experience || '';
    document.getElementById('health').textContent = `${playerData.health}/${playerData.max_health}` || '';
    document.getElementById('spiritual_power').textContent = `${playerData.spiritual_power}/${playerData.max_spiritual_power}` || '';
    document.getElementById('attack').textContent = playerData.attack || '';
    document.getElementById('defense').textContent = playerData.defense || '';
    document.getElementById('ore').textContent = playerData.inventory?.find(item => item.name === '矿石')?.quantity || 0;
    document.getElementById('herb').textContent = playerData.inventory?.find(item => item.name === '药草')?.quantity || 0;
    document.getElementById('spirit_stone').textContent = playerData.inventory?.find(item => item.name === '灵石')?.quantity || 0;

    // 更新背包
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    playerData.inventory?.forEach(item => {
        inventoryList.innerHTML += `<li>${item.name} x ${item.quantity}</li>`;
    });

    // 更新任务 (简化展示，可以根据任务状态进行更详细的展示)
    const questList = document.getElementById('quest-list');
    questList.innerHTML = '';
    playerData.plot?.main_quests?.forEach(quest => {
        questList.innerHTML += `<li>${quest.name} (${quest.status})</li>`;
    });
}

// 模拟初始角色数据
updateAllPlayerInfo({
    name: '无名氏',
    realm: '练气一层',
    linggen: '火',
    experience: 100,
    health: 100,
    max_health: 100,
    spiritual_power: 50,
    max_spiritual_power: 100,
    attack: 10,
    defense: 5,
    cultivation: { experience: 0 },
    inventory: [
        { name: '矿石', quantity: 0 },
        { name: '药草', quantity: 0 },
        { name: '灵石', quantity: 10 }
    ],
    plot: {
        main_quests: [
            { name: '初入修途', status: '进行中' }
        ]
    }
});

submitButton.addEventListener('click', () => {
    const command = userInput.value.trim();
    if (command) {
        gameOutput.innerHTML += `<p class="user-command">&gt; ${command}</p>`;
        sendToServer(command);
        userInput.value = '';
        gameOutput.scrollTop = gameOutput.scrollHeight;
    }
});

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        submitButton.click();
    }
});

toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
        const activity = this.dataset.activity;
        gameOutput.innerHTML += `<p class="user-action">你开始${this.textContent}...</p>`;
        sendToServer(activity); // 将活动名称作为指令发送到后端
        gameOutput.scrollTop = gameOutput.scrollHeight;
    });
});

settingsBtn.addEventListener('click', () => {
    settingsPage.style.display = 'flex';
});

closeSettingsBtn.addEventListener('click', () => {
    settingsPage.style.display = 'none';
});

restartButton.addEventListener('click', () => {
    // 这里可以添加重新开始游戏的逻辑，例如清除本地存储或向后端发送请求
    alert('游戏已重新开始 (功能待实现)');
});

function sendToServer(command) {
    const frontendState = captureFrontendState(); // 获取前端状态
    fetch('/process_command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command: command, frontend_state: frontendState }) // 将前端状态一同发送
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            if (data.events) {
                data.events.forEach(event => {
                    gameOutput.innerHTML += `<p class="game-event">${event.text}</p>`;
                });
            }
            if (data.player) {
                updateAllPlayerInfo(data.player);
            }
            // 可以根据后端返回的 JSON 数据更新其他 UI 元素
        }
    })
    .catch(error => {
        console.error('Error:', error);
        gameOutput.innerHTML += `<p class="error">与服务器通信发生错误。</p>`;
    });
}

// 捕获前端显示信息到 JSON
function captureFrontendState() {
    return {
        player: {
            name: document.getElementById('name').textContent,
            realm: document.getElementById('jingjie').textContent,
            linggen: document.getElementById('linggen').textContent,
            experience: parseInt(document.getElementById('experience').textContent) || 0,
            health: parseInt(document.getElementById('health').textContent.split('/')[0]) || 0,
            max_health: parseInt(document.getElementById('health').textContent.split('/')[1]) || 0,
            spiritual_power: parseInt(document.getElementById('spiritual_power').textContent.split('/')[0]) || 0,
            max_spiritual_power: parseInt(document.getElementById('spiritual_power').textContent.split('/')[1]) || 0,
            attack: parseInt(document.getElementById('attack').textContent) || 0,
            defense: parseInt(document.getElementById('defense').textContent) || 0
        },
        inventory: Array.from(document.getElementById('inventory-list').children).map(item => {
            const parts = item.textContent.split(' x ');
            return {
                name: parts[0],
                quantity: parseInt(parts[1])
            };
        }),
        quests: Array.from(document.getElementById('quest-list').children).map(item => {
            const parts = item.textContent.match(/(.*) \((.*)\)/);
            return {
                name: parts ? parts[1] : '',
                status: parts ? parts[2] : ''
            };
        }),
        location: document.querySelector('.container h2')?.textContent || '' // 示例：捕获页面标题作为位置信息
        // 可以添加更多需要捕获的信息
    };
}
