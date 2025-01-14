// 在文件顶部定义全局钢琴设置对象
const pianoSettings = {
    volume: 0.5,
    waveform: 'sine',
    enabled: true
};

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

// 创建音频上下文（但不立即激活）
let audioContext = null;

// 激活音频上下文的函数
function activateAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// 在用户首次点击页面时激活音频上下文
document.addEventListener('click', () => {
    activateAudioContext();
}, { once: true });

// 获取音色选择器
const waveformSelector = document.getElementById('waveform');

// 修改播放音符的函数
function playNote(note) {
    if (!audioContext) {
        console.warn('音频上下文未激活，请先点击页面');
        return;
    }

    // 确保note是字符串
    if (typeof note !== 'string') {
        console.error('无效的音符参数:', note);
        return;
    }

    const frequency = getFrequency(note);
    if (!frequency) {
        console.error('无法获取音符频率:', note);
        return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = pianoSettings.waveform;
    gainNode.gain.value = pianoSettings.volume;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);

    // 更新音符显示
    const noteDisplay = document.getElementById('note-display');
    if (noteDisplay) {
        noteDisplay.textContent = `当前音符: ${note}, 音色: ${pianoSettings.waveform}`;
    }
}

// 完善频率计算函数
function getFrequency(note) {
    // 确保note是字符串且格式正确
    if (typeof note !== 'string' || !/^[A-Ga-g]#?\d$/.test(note)) {
        console.error('无效的音符格式:', note);
        return null;
    }

    // 标准化音符格式
    note = note.toUpperCase();
    
    // 音符频率映射表
    const noteFrequencyMap = {
        'C2': 65.41,
        'D2': 73.42,
        'E2': 82.41,
        'F2': 87.31,
        'G2': 98.00,
        'A2': 110.00,
        'B2': 123.47,
        'C3': 130.81,
        'D3': 146.83,
        'E3': 164.81,
        'F3': 174.61,
        'G3': 196.00,
        'A3': 220.00,
        'B3': 246.94,
        'C4': 261.63,
        'D4': 293.66,
        'E4': 329.63,
        'F4': 349.23,
        'G4': 392.00,
        'A4': 440.00,
        'B4': 493.88
    };

    return noteFrequencyMap[note] || null;
}

// 修改钢琴键事件监听器
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', function() {
        const note = this.getAttribute('data-note');
        if (note) {
            playNote(note);
        }
    });
});

// 修改键盘事件监听器
document.addEventListener('keydown', function(event) {
    if (isPianoActive) {
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
            '[': 'B4'
        };
        
        const note = noteMap[event.key];
        if (note) {
            playNote(note);
        }
    }
});

// 生成食物的逻辑
function generateFood() {
    // 生成食物的逻辑
    console.log('生成食物的逻辑'); // 这里可以放置生成食物的代码
}

// 全局设置
document.addEventListener('DOMContentLoaded', function() {
    // 全局音效设置
    const soundVolumeControl = document.getElementById('soundVolume');
    const soundVolumeDisplay = document.querySelector('.music-group .value-display');
    
    if (soundVolumeControl && soundVolumeDisplay) {
        soundVolumeControl.addEventListener('input', () => {
            const volume = soundVolumeControl.value;
            soundVolumeDisplay.textContent = volume;
            // 这里添加全局音效音量控制逻辑
        });
    }

    // 钢琴设置
    const pianoSettings = {
        volume: 0.5,
        waveform: 'sine',
        enabled: true
    };

    // 钢琴设置按钮
    const pianoSettingsButton = document.querySelector('.piano-settings-button');
    const pianoSettingsPanel = document.querySelector('.piano-settings-panel');

    if (pianoSettingsButton && pianoSettingsPanel) {
        pianoSettingsButton.addEventListener('click', function(event) {
            event.stopPropagation();
            pianoSettingsPanel.classList.toggle('show');
        });

        // 钢琴音量控制
        const pianoVolumeControl = document.getElementById('pianoVolume');
        const pianoVolumeDisplay = document.querySelector('.piano-value-display');

        if (pianoVolumeControl && pianoVolumeDisplay) {
            pianoVolumeControl.addEventListener('input', () => {
                pianoSettings.volume = pianoVolumeControl.value;
                pianoVolumeDisplay.textContent = pianoSettings.volume;
            });
        }

        // 钢琴音色选择
        const waveformSelect = document.getElementById('pianoWaveform');
        if (waveformSelect) {
            waveformSelect.addEventListener('change', () => {
                pianoSettings.waveform = waveformSelect.value;
            });
        }
    }
});

// 钢琴键盘事件绑定
document.addEventListener('DOMContentLoaded', function() {
    const pianoKeys = document.querySelectorAll('.piano .key');
    pianoKeys.forEach(key => {
        key.addEventListener('mousedown', function() {
            if (pianoSettings.enabled) {
                const note = this.dataset.note;
                playNote(note);
            }
        });
    });
});

// 钢琴设置面板初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取设置按钮
    const pianoSettingsButton = document.querySelector('.piano-settings-button');
    
    // 添加点击动画
    if (pianoSettingsButton) {
        pianoSettingsButton.addEventListener('click', function(event) {
            event.stopPropagation();
            
            // 添加点击动画
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 200);
            
            // 切换设置面板显示状态
            const pianoSettingsPanel = document.querySelector('.piano-settings-panel');
            if (pianoSettingsPanel) {
                pianoSettingsPanel.classList.toggle('show');
            }
        });
    }
});

// 设置面板控制
document.addEventListener('DOMContentLoaded', function() {
    const settingsTrigger = document.querySelector('.settings-trigger');
    const settingsPanel = document.querySelector('.settings-panel');

    if (settingsTrigger && settingsPanel) {
        // 显示设置面板
        settingsTrigger.addEventListener('click', function(event) {
            event.stopPropagation();
            settingsPanel.classList.toggle('show');
        });

        // 点击外部关闭设置面板
        document.addEventListener('click', function(event) {
            if (!settingsPanel.contains(event.target) && 
                !settingsTrigger.contains(event.target)) {
                settingsPanel.classList.remove('show');
            }
        });

        // 初始化设置项
        const rangeInputs = settingsPanel.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            const display = input.parentElement.querySelector('.value-display');
            if (display) {
                display.textContent = input.value;
                input.addEventListener('input', () => {
                    display.textContent = input.value;
                });
            }
        });
    }
}); 