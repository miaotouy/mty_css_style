function showContent(divId) {
    document.querySelectorAll('.content-div').forEach(div => div.classList.remove('active'));
    document.getElementById(divId).classList.add('active');

    document.querySelectorAll('.left-nav .section').forEach(section => section.classList.remove('active'));
    document.querySelector(`.left-nav .section[data-content="${divId}"]`).classList.add('active');
}

function updateLayout() {
    const container = document.querySelector('.container');
    container.setAttribute('data-theme', event.data.theme === 'light' ? 'light' : '');
    container.classList.toggle('narrow', window.innerWidth <= 768);
}

document.querySelector('.left-nav').addEventListener('click', (event) => {
    if (event.target.classList.contains('section')) {
        showContent(event.target.getAttribute('data-content'));
    }
});

window.addEventListener('message', event => {
    if (event.data.type === 'themeChange') {
        updateLayout();
    }
});

window.addEventListener('load', updateLayout);
window.addEventListener('resize', updateLayout);