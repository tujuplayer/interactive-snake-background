const playModeBtn = document.querySelector('.play-mode-trigger');
const playModePanel = document.querySelector('.piano-panel');

// 拖拽功能
let isDragging = false;
let offsetX, offsetY;

playModeBtn.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - playModeBtn.getBoundingClientRect().left;
    offsetY = e.clientY - playModeBtn.getBoundingClientRect().top;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        requestAnimationFrame(() => {
            playModeBtn.style.position = 'absolute';
            playModeBtn.style.left = `${e.clientX - offsetX}px`;
            playModeBtn.style.top = `${e.clientY - offsetY}px`;
            // 保存位置到 localStorage
            localStorage.setItem('playModeBtnPosition', JSON.stringify({ left: e.clientX - offsetX, top: e.clientY - offsetY }));
        });
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// 页面加载时恢复位置
window.onload = () => {
    const position = JSON.parse(localStorage.getItem('playModeBtnPosition'));
    if (position) {
        playModeBtn.style.left = `${position.left}px`;
        playModeBtn.style.top = `${position.top}px`;
    }
};

let isPianoActive = false;

playModeBtn.addEventListener('click', () => {
    isPianoActive = !isPianoActive; // 切换状态
    playModePanel.style.display = isPianoActive ? 'block' : 'none';
    console.log('成功点击了演奏模式按钮！');
});

// 播放音符的函数
function playNote(note) {
    const audio = new Audio(`assets/audio/notes/${note}.mp3`);
    audio.play();
    // 更新音符显示
    document.getElementById('note-display').innerText = `当前音符: ${note}`;
}

// 为每个钢琴键添加事件监听器
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', function() {
        const note = this.getAttribute('data-note');
        playNote(note);
    });
});

// 监听键盘事件
document.addEventListener('keydown', function(event) {
    if (isPianoActive) {
        // 在演奏模式下，按键弹奏钢琴
        const noteMap = {
            '1': 'C2',
            '2': 'D2',
            '3': 'E2',
            '4': 'F2',
            '5': 'G2',
            '6': 'A2',
            '7': 'B2',
            '8': 'C3',
            '9': 'D3',
            '0': 'E3',
            'q': 'F3',
            'w': 'G3',
            'e': 'A3',
            'r': 'B3',
            't': 'C4',
            'y': 'D4',
            'u': 'E4',
            'i': 'F4',
            'o': 'G4',
            'p': 'A4',
            'a': 'B4'
        };
        const note = noteMap[event.key];
        if (note) {
            playNote(note);
        }
    } else {
        // 在非演奏模式下，按 'f' 键生成食物
        if (event.key === 'f') {
            generateFood();
        }
    }
});

// 生成食物的逻辑
function generateFood() {
    // 生成食物的逻辑
    console.log('生成食物的逻辑'); // 这里可以放置生成食物的代码
} 