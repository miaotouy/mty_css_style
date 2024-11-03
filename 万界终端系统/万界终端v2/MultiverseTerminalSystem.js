// 切换显示不同的内容区域
function showContent(divId) {
    // 隐藏所有内容区
    document.querySelectorAll('.content-div').forEach(div => div.classList.remove('active'));
    
    // 显示对应ID的内容
    document.getElementById(divId).classList.add('active');

    // 更新左侧导航栏的激活状态
    document.querySelectorAll('.left-nav .section').forEach(section => section.classList.remove('active'));
    
    document.querySelector(`.left-nav .section[data-content="${divId}"]`).classList.add('active');
}

// 响应左侧导航栏点击事件
document.querySelector('.left-nav').addEventListener('click', (event) => {
    if (event.target.classList.contains('section')) {
        showContent(event.target.getAttribute('data-content'));
    }
});

// 在页面加载时更新布局，并根据窗口大小调整布局样式
window.addEventListener('load', updateLayout);
window.addEventListener('resize', updateLayout);

function updateLayout() {
    const container = document.querySelector('.container');
    container.classList.toggle('narrow', window.innerWidth <= 768);
}
