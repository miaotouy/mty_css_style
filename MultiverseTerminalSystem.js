// 用于将 Markdown 格式的剧情内容转换为 HTML 格式，并在页面中显示。
function convertMarkdown(elementId) {
    // 获取指定元素中的剧情内容
    const storyContent = document.getElementById(elementId).innerHTML;

    // 尝试将内容转换为 HTML，如果转换失败则不做任何处理
    try {
      const htmlContent = marked(storyContent);
      document.getElementById(elementId).innerHTML = htmlContent;
    } catch (error) {
      // 忽略错误，不做任何处理
    }
  }

  // 转换 content0 和 content-cot 的 Markdown 内容 (如果存在)
  convertMarkdown('content0');
  convertMarkdown('content-cot');

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
