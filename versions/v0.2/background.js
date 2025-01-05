// 全局变量
const AUDIO_URLS = {
    click: 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAACBgIF/gnmDdYRyhW+GbIdqiGiJZopljGONYY5fj12QW5FZkleTVZRTlVGWT5dNmEuZSZpHm0WcQ51BnkCfPqA8oTqiOKM2pDSlMqYwpy6oLKkqqiirJqwkrSKuIK8esB6wHLAasBiwFrAUsBKwELAOsAywCrAIvwa9BLsCuQC3ALUAswCxAK8ArQCrAKkApwClAKMAnwCdAJsAmQCXAJUAkwCRAI8AjQCLAIkAhwCFAIMASwBJAEcARQBDAEEAPwA9ADsAOQA3ADUAMwAxAC8ALQArACkAJwAlACMAIQAfAB0AGwAZABcAFQATABEADwANAAsACQAHAAUAAwABAA==',
    eat: 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAACBgYKBg4GEgYWBhoGHgYiBiYGKgYuBjIGNgY6Bj4GQgZGBkoGTgZSBlYGWgZeBmIGZgZqBm4GcgZ2BnoGfgaCBoYGigaOBpIGlgaaBp4GogamBqoGrga6Br4GwgbGBsoGzgbSBtYG2gbeBuIG5gbqBu4G8gb2BvoG/gcCBwYHCgcOBxIHFgcaBx4HIgcmByoHLgcyBzYHOgc+B0IHRgdKB04HUgdWB1oHXgdiB2YHagduB3IHdgd6B34HggeGB4oHjgeSB5YHmgeeBgoGDgYSBhYGGgYeBiIGJgYqBi4GMgY2BjoGPgZCBkYGSgZOBlIGVgZaBlYGUgZOBkoGRgZCBj4GOgY2BjIGLgYqBiYGIgYeBhoGFgYSBg4GCgYGBgIB/gH6AfYB8gHuAeoB5gHiAd4B2gHWAdIBzgHKAcYBwgG+AboCtgKyAq4CqgKmAqICngKaApYCkgKOAooCfgJ6AnYCcgJuAmoCZgJiAl4CWgJWAlICTgJKAkYCQgI+AjoCNgIyAi4CKgImAiICHgIaAhYCEgIOAgoGBgYCBf4F+gX2BfIF7gXqBeYF4gXeB'
};

const bgCanvas = document.getElementById('backgroundCanvas');
const bgCtx = bgCanvas.getContext('2d');
const mouseSerpents = [];
const foods = [];
const effects = [];
const backgroundParticles = [];
let mouseX = 0;
let mouseY = 0;
let lastFoodSpawnTime = Date.now();
let lastWildSerpentSpawnTime = Date.now();
let audioContext;
let clickSound;
let eatSound;

// 主题切换相关代码
const themeButtons = document.querySelectorAll('.theme-btn');
let currentTheme = localStorage.getItem('selectedTheme') || 'starry-night';
let isThemeSwitching = false;

// 音频相关
let soundEnabled = true;  // 添加音效开关状态
let soundVolume = 0.5;   // 添加音效音量状态

// 初始化主题
function initTheme() {
    document.body.classList.add(`theme-${currentTheme}`);
    document.querySelector(`.theme-btn.${currentTheme}`).classList.add('active');
}

// 切换主题
async function switchTheme(newTheme) {
    if (currentTheme === newTheme || isThemeSwitching) return;
    
    isThemeSwitching = true;
    
    // 添加切换动画类
    document.body.classList.add('theme-switching');
    await new Promise(resolve => setTimeout(resolve, 50));
    document.body.classList.add('fade-in');
    
    // 更新按钮状态
    document.querySelector(`.theme-btn.${currentTheme}`).classList.remove('active');
    document.querySelector(`.theme-btn.${newTheme}`).classList.add('active');
    
    // 等待淡出动画完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 切换主题类
    document.body.classList.remove(`theme-${currentTheme}`);
    document.body.classList.add(`theme-${newTheme}`);
    
    // 保存主题选择
    localStorage.setItem('selectedTheme', newTheme);
    currentTheme = newTheme;
    
    // 等待新主题应用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 移除切换动画类
    document.body.classList.remove('fade-in');
    document.body.classList.remove('theme-switching');
    
    isThemeSwitching = false;
}

// 添加主题切换事件监听
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        switchTheme(theme);
    });
});

// 背景粒子类
class BackgroundParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.2 - 0.1;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.hue = Math.random() * 360;
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检查
        if (this.x < 0 || this.x > window.innerWidth || 
            this.y < 0 || this.y > window.innerHeight) {
            this.reset();
        }

        // 减小脉冲幅度
        this.opacity = (Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.1 + 0.2);
        this.hue = (this.hue + 0.05) % 360;  // 减慢颜色变化
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = `hsla(${this.hue}, 50%, 50%, 0.5)`;  // 降低饱和度和亮度
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 减小光晕效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 1.5
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 50%, 50%, 0.1)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 初始化背景粒子
function initBackgroundParticles() {
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
    for (let i = 0; i < particleCount; i++) {
        backgroundParticles.push(new BackgroundParticle());
    }
}

// 音频相关
async function loadAudio() {
    try {
        // 创建音频上下文
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 如果音频上下文被挂起，则恢复
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
        }

        // 解码音频数据
        const base64ToArrayBuffer = (base64) => {
            const binaryString = window.atob(base64.split(',')[1]);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        };

        // 加载点击音效
        const clickBuffer = base64ToArrayBuffer(AUDIO_URLS.click);
        clickSound = await audioContext.decodeAudioData(clickBuffer);

        // 加载吃食物音效
        const eatBuffer = base64ToArrayBuffer(AUDIO_URLS.eat);
        eatSound = await audioContext.decodeAudioData(eatBuffer);

    } catch (error) {
        console.error('音频加载失败:', error);
    }
}

function playSound(buffer) {
    if (!audioContext || !buffer || !soundEnabled) return;
    
    try {
        // 如果音频上下文被挂起，则恢复
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        
        // 创建音量控制
        const gainNode = audioContext.createGain();
        gainNode.gain.value = soundVolume; // 使用当前音效音量
        
        // 连接节点
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 播放音频
        source.start(0);
    } catch (error) {
        console.error('播放音效失败:', error);
    }
}

// 在点击事件中初始化音频上下文
window.addEventListener('click', async () => {
    if (!audioContext) {
        await loadAudio();
    }
}, { once: true });

// 特效类
class Effect {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1;
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: this.type === 'wild' ? 
                    `hsl(${Math.random() * 60 + 300}, 70%, 60%)` : 
                    `hsl(${Math.random() * 60 + 180}, 70%, 60%)`
            });
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life *= 0.95;
        });
        this.life *= 0.95;
    }

    draw(ctx) {
        ctx.save();
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    isDead() {
        return this.life < 0.01;
    }
}

// 食物类
class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.emoji = ['🍎', '🍕', '🍔', '🍦', '🍪', '🍫', '🍬', '🥐', '🥨', '🥯'][Math.floor(Math.random() * 10)];
    }

    draw(ctx) {
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }
}

// 小蛇类
class BackgroundSerpent {
    constructor(x, y, isWild = false) {
        this.segments = [{x, y, angle: 0}];
        this.speed = isWild ? gameSettings.wildSpeed : gameSettings.normalSpeed;
        this.segmentDistance = gameSettings.snakeSegmentDistance;
        this.health = 100;
        this.lastMealTime = Date.now();
        this.isVanishing = false;
        this.opacity = 1;
        this.vanishingParticles = [];
        this.isWild = isWild;
        this.state = isWild ? 'wandering' : 'following';
        this.stateStartTime = Date.now();
        this.wanderDuration = 8000 + Math.random() * 4000;  // 缩短游荡时间
        this.searchDuration = 6000 + Math.random() * 3000;  // 缩短搜索时间
        this.hasFoundFood = false;
        this.randomTarget = this.getRandomPoint();  // 初始随机目标点
        this.exitPoint = null;
        this.eatDistance = 30;
        this.healthDecayRate = gameSettings.healthDecayRate;
        this.healthRecovery = gameSettings.healthRecovery;
        this.foodEaten = 0;
        this.growthThreshold = 1;      // 每吃1个食物就成长
        this.maxLength = gameSettings.maxSnakeLength;
        this.initialLength = gameSettings.initialSnakeLength;
        this.exitTimer = isWild ? (Math.random() * 5000 + 5000) : null; // 野生蛇5-10秒后离开
        this.exitSpeed = 8;            // 离开时的速度
        this.avoidanceRadius = gameSettings.avoidanceRadius;     // 使用设置中的避让半径
        this.avoidanceForce = gameSettings.avoidanceForce;     // 使用设置中的避让力度
        
        // 外观设置
        if (isWild) {
            this.headEmoji = ['🐉', '🐲', '🦕'][Math.floor(Math.random() * 3)];
            this.bodyEmoji = ['🌟', '⚡'][Math.floor(Math.random() * 2)];
            this.scale = 1.2;
        } else {
            this.headEmoji = '🐍';
            this.bodyEmoji = '✨';
            this.scale = 1.0;
        }

        // 初始化身体段
        for (let i = 0; i < this.initialLength; i++) {
            this.segments.push({x, y, angle: 0});
        }
    }

    getRandomPoint() {
        const margin = 100;
        return {
            x: margin + Math.random() * (window.innerWidth - 2 * margin),
            y: margin + Math.random() * (window.innerHeight - 2 * margin)
        };
    }

    update(mouseX, mouseY) {
        // 更新健康值
        this.updateHealth();
        
        // 如果已经标记为移除，不再更新
        if (this.shouldRemove) return;

        // 更新消失效果
        if (this.isVanishing) {
            this.updateVanishingEffect();
        }

        // 野生蛇的状态管理
        if (this.isWild) {
            const now = Date.now();
            const stateTime = now - this.stateStartTime;

            switch (this.state) {
                case 'wandering':
                    if (stateTime > this.wanderDuration) {
                        this.state = 'searching';
                        this.stateStartTime = now;
                        this.hasFoundFood = false;
                    }
                    break;
                case 'searching':
                    if (stateTime > this.searchDuration) {
                        this.startExiting();
                        this.state = 'exiting';
                        this.stateStartTime = now;
                    }
                    break;
                case 'exiting':
                    this.updateExit();
                    return;
            }
        }

        // 修改目标选择逻辑，添加避让其他蛇的逻辑
        let targetX, targetY;
        const nearestFood = this.findNearestFood();
        const nearestSerpent = this.findNearestSerpent();

        // 计算基础目标位置
        if (nearestFood) {
            targetX = nearestFood.food.x;
            targetY = nearestFood.food.y;
            
            if (nearestFood.distance < 100) {
                this.speed = this.isWild ? 
                    gameSettings.wildSpeed * gameSettings.huntingSpeedMultiplier :
                    gameSettings.normalSpeed * gameSettings.huntingSpeedMultiplier;
            } else {
                this.speed = this.isWild ? gameSettings.wildSpeed : gameSettings.normalSpeed;
            }
        } else if (this.isWild) {
            if (!this.randomTarget || this.hasReachedTarget()) {
                this.randomTarget = this.getRandomPoint();
                this.targetChangeTime = Date.now();
            }
            targetX = this.randomTarget.x;
            targetY = this.randomTarget.y;
        } else {
            targetX = mouseX;
            targetY = mouseY;
        }

        // 应用避让力
        if (nearestSerpent && nearestSerpent.distance < this.avoidanceRadius) {
            const avoidanceStrength = (this.avoidanceRadius - nearestSerpent.distance) / this.avoidanceRadius;
            const dx = this.segments[0].x - nearestSerpent.serpent.segments[0].x;
            const dy = this.segments[0].y - nearestSerpent.serpent.segments[0].y;
            const angle = Math.atan2(dy, dx);
            
            // 添加避让偏移
            targetX += Math.cos(angle) * this.avoidanceForce * avoidanceStrength * 50;
            targetY += Math.sin(angle) * this.avoidanceForce * avoidanceStrength * 50;
        }

        // 更新头部位置
        const head = this.segments[0];
        const dx = targetX - head.x;
        const dy = targetY - head.y;
        const angle = Math.atan2(dy, dx);
        
        // 应用平滑移动
        const actualSpeed = this.speed * (nearestSerpent && nearestSerpent.distance < this.avoidanceRadius ? 0.7 : 1);
        head.x += Math.cos(angle) * actualSpeed;
        head.y += Math.sin(angle) * actualSpeed;
        head.angle = angle;

        // 更新身体段
        for (let i = 1; i < this.segments.length; i++) {
            const current = this.segments[i];
            const previous = this.segments[i-1];
            const dx = previous.x - current.x;
            const dy = previous.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.segmentDistance) {
                const angle = Math.atan2(dy, dx);
                current.x += Math.cos(angle) * (distance - this.segmentDistance);
                current.y += Math.sin(angle) * (distance - this.segmentDistance);
                current.angle = angle;
            }
        }

        // 检查是否吃到食物
        this.checkFood();
    }

    hasReachedTarget() {
        const head = this.segments[0];
        const dx = this.randomTarget.x - head.x;
        const dy = this.randomTarget.y - head.y;
        return Math.sqrt(dx * dx + dy * dy) < 50;
    }

    findNearestFood() {
        let nearest = null;
        let minDistance = Infinity;
        
        foods.forEach(food => {
            const dx = food.x - this.segments[0].x;
            const dy = food.y - this.segments[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = { food, distance };
            }
        });
        
        return nearest;
    }

    findNearestSerpent() {
        let nearest = null;
        let minDistance = Infinity;
        
        // 遍历所有蛇（除了自己）
        mouseSerpents.forEach(serpent => {
            if (serpent === this) return;
            
            const dx = serpent.segments[0].x - this.segments[0].x;
            const dy = serpent.segments[0].y - this.segments[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = { serpent, distance };
            }
        });
        
        return nearest;
    }

    updateVanishingEffect() {
        this.opacity = Math.max(0.2, this.health / 50);
        this.vanishingParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life *= 0.95;
            if (p.life < 0.1) {
                p.life = 1;
                p.x = 0;
                p.y = 0;
            }
        });
    }

    checkFood() {
        foods.forEach((food, index) => {
            const dx = food.x - this.segments[0].x;
            const dy = food.y - this.segments[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.eatDistance) {
                this.eatFood(food, index);
                this.hasFoundFood = true;
            }
        });
    }

    getExitPoint() {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(window.innerWidth, window.innerHeight);
        return {
            x: window.innerWidth / 2 + Math.cos(angle) * distance,
            y: window.innerHeight / 2 + Math.sin(angle) * distance
        };
    }

    createVanishingParticles() {
        this.vanishingParticles = [];
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            this.vanishingParticles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1
            });
        }
    }

    updateExit() {
        if (!this.exitPoint) return;

        const dx = this.exitPoint.x - this.segments[0].x;
        const dy = this.exitPoint.y - this.segments[0].y;
        const angle = Math.atan2(dy, dx);
        
        // 使用更快的速度移动向出口
        this.segments[0].x += Math.cos(angle) * this.exitSpeed;
        this.segments[0].y += Math.sin(angle) * this.exitSpeed;
        this.segments[0].angle = angle;

        // 更新身体段
        for (let i = 1; i < this.segments.length; i++) {
            const dx = this.segments[i-1].x - this.segments[i].x;
            const dy = this.segments[i-1].y - this.segments[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.segmentDistance) {
                const angle = Math.atan2(dy, dx);
                this.segments[i].x += Math.cos(angle) * (distance - this.segmentDistance);
                this.segments[i].y += Math.sin(angle) * (distance - this.segmentDistance);
                this.segments[i].angle = angle;
            }
        }

        // 检查是否已经离开屏幕
        const head = this.segments[0];
        if (head.x < -150 || head.x > window.innerWidth + 150 ||
            head.y < -150 || head.y > window.innerHeight + 150) {
            this.shouldRemove = true;
        }
    }

    updateHealth() {
        if (this.isWild) return;
        
        const now = Date.now();
        const timeSinceLastMeal = (now - this.lastMealTime) / 1000;
        this.health = Math.max(0, this.health - this.healthDecayRate * timeSinceLastMeal);
        this.lastMealTime = now;

        // 加快消失过程
        if (this.health < 50) {
            this.healthDecayRate = gameSettings.healthDecayRate * 1.5;
            if (!this.isVanishing) {
                this.startVanishing();
            }
        }

        if (this.health < 20) {
            this.healthDecayRate = gameSettings.healthDecayRate * 2;
            this.shrink();
        }

        if (this.health <= 0) {
            this.shouldRemove = true;
        }
    }

    eatFood(food, index) {
        foods.splice(index, 1);
        
        if (!this.isWild) {
            // 恢复健康值
            this.health = Math.min(100, this.health + this.healthRecovery);
            this.foodEaten++;
            
            // 每吃到指定数量的食物就成长
            if (this.foodEaten % this.growthThreshold === 0) {
                this.grow();
            }
            
            // 如果健康值恢复到安全水平，清除消失效果
            if (this.health > 30) {
                this.isVanishing = false;
                this.opacity = 1;
                this.vanishingParticles = [];
            }

            // 播放吃食物音效
            playSound(eatSound);
        }

        // 创建吃食物特效
        effects.push(new Effect(food.x, food.y, this.isWild ? 'wild' : 'normal'));
    }

    grow() {
        if (this.segments.length < this.maxLength) {
            const lastSegment = this.segments[this.segments.length - 1];
            this.segments.push({
                x: lastSegment.x,
                y: lastSegment.y,
                angle: lastSegment.angle
            });
            
            // 明显增加蛇的大小
            this.scale = Math.min(2.0, this.scale + 0.2);
            
            // 创建成长特效
            effects.push(new Effect(lastSegment.x, lastSegment.y, 'grow'));
        }
    }

    shrink() {
        if (this.segments.length > this.initialLength) {
            this.segments.pop();
            // 明显减小蛇的大小
            this.scale = Math.max(0.8, this.scale - 0.1);
            
            // 创建缩小特效
            const lastSegment = this.segments[this.segments.length - 1];
            effects.push(new Effect(lastSegment.x, lastSegment.y, 'shrink'));
        }
    }

    startVanishing() {
        this.isVanishing = true;
        this.vanishingParticles = [];
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            this.vanishingParticles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1
            });
        }
    }

    startExiting() {
        this.isExiting = true;
        // 选择最近的屏幕边缘作为退出点
        const edges = [
            {x: -100, y: this.segments[0].y}, // 左
            {x: window.innerWidth + 100, y: this.segments[0].y}, // 右
            {x: this.segments[0].x, y: -100}, // 上
            {x: this.segments[0].x, y: window.innerHeight + 100} // 下
        ];
        
        // 找到最近的边缘
        this.exitPoint = edges.reduce((nearest, current) => {
            const currentDist = Math.hypot(
                current.x - this.segments[0].x,
                current.y - this.segments[0].y
            );
            const nearestDist = Math.hypot(
                nearest.x - this.segments[0].x,
                nearest.y - this.segments[0].y
            );
            return currentDist < nearestDist ? current : nearest;
        });
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // 绘制身体
        for (let i = this.segments.length - 1; i > 0; i--) {
            const segment = this.segments[i];
            ctx.save();
            ctx.translate(segment.x, segment.y);
            ctx.rotate(segment.angle);
            ctx.font = `${16 * this.scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.bodyEmoji, 0, 0);
            ctx.restore();
        }

        // 绘制头部
        const head = this.segments[0];
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(head.angle);
        ctx.font = `${20 * this.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.headEmoji, 0, 0);
        ctx.restore();

        // 绘制消失效果
        if (this.isVanishing) {
            this.vanishingParticles.forEach(p => {
                ctx.save();
                ctx.translate(head.x, head.y);
                ctx.globalAlpha = p.life * this.opacity;
                ctx.fillStyle = this.isWild ? '#ff00ff' : '#00ffff';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 绘制警告圆圈
            const warningOpacity = (Math.sin(Date.now() * 0.01) + 1) * 0.5;
            ctx.globalAlpha = warningOpacity * this.opacity;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(head.x, head.y, 30, 0, Math.PI * 2);
            ctx.stroke();

            // 绘制警告符号
            ctx.font = '20px Arial';
            ctx.fillStyle = '#ff0000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠️', head.x, head.y - 40);
        }

        ctx.restore();
    }
}

// 音乐功能初始化
function initMusicFeatures() {
    console.log('初始化音乐功能');
    
    // 获取DOM元素
    const musicTrigger = document.querySelector('.music-trigger');
    const musicPanel = document.querySelector('.music-panel');
    const audio = document.getElementById('bgMusic');
    const playPauseBtn = document.getElementById('playPause');
    const prevBtn = document.getElementById('prevTrack');
    const nextBtn = document.getElementById('nextTrack');
    const volumeSlider = document.getElementById('bgMusicVolume');
    const musicSelect = document.getElementById('musicSelect');
    const soundEnabledCheckbox = document.getElementById('soundEnabled');
    const soundVolumeSlider = document.getElementById('soundVolume');
    
    console.log('音乐触发器元素:', musicTrigger, getComputedStyle(musicTrigger).display);
    console.log('音乐面板元素:', musicPanel, getComputedStyle(musicPanel).display);
    
    let isPlaying = false;
    
    // 音乐列表
    const musicList = [
        { path: 'assets/audio/BGM/星空.mp3', name: '星空' },
        { path: 'assets/audio/BGM/极光.mp3', name: '极光' },
        { path: 'assets/audio/BGM/贝加尔湖畔.mp3', name: '贝加尔湖畔' },
        { path: 'assets/audio/BGM/岁月神偷.mp3', name: '岁月神偷' }
    ];
    
    let currentTrackIndex = 0;
    
    // 初始化音量
    const initialVolume = 0.5;
    console.log('初始音量:', initialVolume);
    audio.volume = initialVolume;
    volumeSlider.value = initialVolume;
    
    // 初始化音效控制
    soundEnabledCheckbox.checked = soundEnabled;
    soundVolumeSlider.value = soundVolume;
    soundVolumeSlider.nextElementSibling.textContent = soundVolume.toFixed(1);
    
    // 音乐面板显示/隐藏
    musicTrigger.addEventListener('click', () => {
        musicPanel.classList.toggle('active');
        // 如果是第一次点击，初始化音频上下文
        if (!audio.audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audio.audioContext = new AudioContext();
            audio.audioContext.resume();
        }
    });
    
    // 点击面板外关闭面板
    document.addEventListener('click', (e) => {
        if (!musicPanel.contains(e.target) && !musicTrigger.contains(e.target)) {
            musicPanel.classList.remove('active');
        }
    });
    
    // 播放/暂停
    playPauseBtn.addEventListener('click', async () => {
        if (!audio.audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audio.audioContext = new AudioContext();
        }
        await audio.audioContext.resume();
        
        if (isPlaying) {
            audio.pause();
            playPauseBtn.textContent = '▶️';
        } else {
            try {
                await audio.play();
                playPauseBtn.textContent = '⏸️';
            } catch (err) {
                console.error('播放失败:', err);
            }
        }
        isPlaying = !isPlaying;
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        audio.volume = volume;
        e.target.nextElementSibling.textContent = volume.toFixed(1);
    });
    
    // 切换音乐
    musicSelect.addEventListener('change', async () => {
        const selectedTrack = musicSelect.value;
        audio.src = selectedTrack;
        if (isPlaying) {
            try {
                await audio.play();
            } catch (err) {
                console.error('切换音乐失败:', err);
                isPlaying = false;
                playPauseBtn.textContent = '▶️';
            }
        }
    });
    
    // 上一曲
    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + musicList.length) % musicList.length;
        loadAndPlayTrack(currentTrackIndex);
    });
    
    // 下一曲
    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % musicList.length;
        loadAndPlayTrack(currentTrackIndex);
    });
    
    // 加载并播放音乐
    async function loadAndPlayTrack(index) {
        const track = musicList[index];
        audio.src = track.path;
        musicSelect.value = track.path;
        
        if (isPlaying) {
            try {
                await audio.play();
            } catch (err) {
                console.error('播放新曲目失败:', err);
                isPlaying = false;
                playPauseBtn.textContent = '▶️';
            }
        }
    }
    
    // 音效控制
    soundEnabledCheckbox.addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        console.log('音效已' + (soundEnabled ? '启用' : '禁用'));
    });
    
    soundVolumeSlider.addEventListener('input', (e) => {
        soundVolume = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = soundVolume.toFixed(1);
        console.log('音效音量已设置为:', soundVolume);
    });
}

// 在页面加载完成后初始化音乐功能
document.addEventListener('DOMContentLoaded', initMusicFeatures);

// 初始化函数
function init() {
    // 设置画布大小
    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initBackgroundParticles();
    });

    // 初始化背景粒子
    initBackgroundParticles();

    // 初始化主题
    initTheme();

    // 初始化游戏设置
    initGameSettings();

    // 开始动画循环
    animate();

    // 鼠标事件监听
    window.addEventListener('mousemove', (e) => {
        const rect = bgCanvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // 点击事件处理
    window.addEventListener('click', async (e) => {
        // 检查是否点击在UI元素上
        if (e.target.closest('.theme-selector') || 
            e.target.closest('.help-panel') || 
            e.target.closest('.settings-panel') ||
            e.target.closest('.help-trigger') ||
            e.target.closest('.settings-trigger') ||
            e.target.closest('.music-trigger') ||
            e.target.closest('.music-panel')) {
            return;
        }

        // 如果音频上下文未初始化，则初始化
        if (!audioContext) {
            await loadAudio();
        }

        // 检查点击位置是否太靠近其他蛇
        const rect = bgCanvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        const tooClose = mouseSerpents.some(serpent => {
            const dx = serpent.segments[0].x - clickX;
            const dy = serpent.segments[0].y - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < gameSettings.minSpawnDistance;
        });

        // 只在不太靠近其他蛇时生成新蛇
        if (!tooClose) {
            mouseSerpents.push(new BackgroundSerpent(clickX, clickY));
            playSound(clickSound);
        }
    });

    // 帮助按钮点击事件
    const helpTrigger = document.querySelector('.help-trigger');
    const helpPanel = document.querySelector('.help-panel');
    
    helpTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        helpPanel.classList.toggle('active');
        settingsPanel.classList.remove('active');
        musicPanel.classList.remove('active');
    });

    // 设置按钮点击事件
    const settingsTrigger = document.querySelector('.settings-trigger');
    const settingsPanel = document.querySelector('.settings-panel');
    
    settingsTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('active');
        helpPanel.classList.remove('active');
        musicPanel.classList.remove('active');
    });

    // 音乐按钮点击事件
    const musicTrigger = document.querySelector('.music-trigger');
    const musicPanel = document.querySelector('.music-panel');
    
    musicTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        musicPanel.classList.toggle('active');
        helpPanel.classList.remove('active');
        settingsPanel.classList.remove('active');
    });

    // 点击外部区域关闭面板
    document.addEventListener('click', (e) => {
        if (!helpPanel.contains(e.target) && !helpTrigger.contains(e.target)) {
            helpPanel.classList.remove('active');
        }
        if (!settingsPanel.contains(e.target) && !settingsTrigger.contains(e.target)) {
            settingsPanel.classList.remove('active');
        }
        if (!musicPanel.contains(e.target) && !musicTrigger.contains(e.target)) {
            musicPanel.classList.remove('active');
        }
    });

    // 键盘事件监听
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // 清除所有小蛇
            mouseSerpents.length = 0;
        } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            // 生成食物
            const x = Math.random() * (window.innerWidth - 100) + 50;
            const y = Math.random() * (window.innerHeight - 100) + 50;
            foods.push(new Food(x, y));
        }
    });

    // 自动生成食物
    setInterval(() => {
        if (gameSettings.foodEnabled && foods.length < gameSettings.maxFood) {
            const x = Math.random() * (window.innerWidth - 100) + 50;
            const y = Math.random() * (window.innerHeight - 100) + 50;
            foods.push(new Food(x, y));
        }
    }, gameSettings.foodSpawnInterval);

    // 自动生成野生蛇
    setInterval(() => {
        if (gameSettings.wildSnakeEnabled && 
            mouseSerpents.filter(s => s.isWild).length < gameSettings.maxWildSnakes) {
            let x, y;
            // 从屏幕边缘生成
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? -50 : window.innerWidth + 50;
                y = Math.random() * window.innerHeight;
            } else {
                x = Math.random() * window.innerWidth;
                y = Math.random() < 0.5 ? -50 : window.innerHeight + 50;
            }
            mouseSerpents.push(new BackgroundSerpent(x, y, true));
        }
    }, gameSettings.wildSnakeInterval);

    // 初始化音乐功能
    initMusicFeatures();

    // 更新日志按钮点击事件
    const updateTrigger = document.querySelector('.update-trigger');
    const updatePanel = document.querySelector('.update-panel');
    
    updateTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        updatePanel.classList.toggle('active');
        helpPanel.classList.remove('active');
        settingsPanel.classList.remove('active');
        musicPanel.classList.remove('active');
    });

    // 点击外部区域关闭面板
    document.addEventListener('click', (e) => {
        if (!helpPanel.contains(e.target) && !helpTrigger.contains(e.target)) {
            helpPanel.classList.remove('active');
        }
        if (!settingsPanel.contains(e.target) && !settingsTrigger.contains(e.target)) {
            settingsPanel.classList.remove('active');
        }
        if (!musicPanel.contains(e.target) && !musicTrigger.contains(e.target)) {
            musicPanel.classList.remove('active');
        }
        if (!updatePanel.contains(e.target) && !updateTrigger.contains(e.target)) {
            updatePanel.classList.remove('active');
        }
    });

    // 更新日志面板折叠功能
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // 切换当前部分的展开/折叠状态
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            content.classList.toggle('show');
        });
    });
}

// 动画循环
function animate() {
    // 清空画布
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 首先绘制主题背景
    updateThemeEffects();
    
    // 更新和绘制背景粒子
    backgroundParticles.forEach(particle => {
        particle.update();
        particle.draw(bgCtx);
    });
    
    // 更新和绘制所有小蛇
    mouseSerpents.forEach((serpent, index) => {
        serpent.update(mouseX, mouseY);
        serpent.draw(bgCtx);
        
        if (serpent.shouldRemove) {
            mouseSerpents.splice(index, 1);
        }
    });
    
    // 绘制食物
    foods.forEach(food => food.draw(bgCtx));
    
    // 更新和绘制特效
    effects.forEach((effect, index) => {
        effect.update();
        effect.draw(bgCtx);
        if (effect.isDead()) {
            effects.splice(index, 1);
        }
    });
    
    // 自动生成食物和野生蛇
    const now = Date.now();
    
    // 自动生成食物
    if (now - lastFoodSpawnTime > gameSettings.foodSpawnInterval * 1000 && 
        foods.length < gameSettings.maxFoodCount) {
        const x = Math.random() * (bgCanvas.width - 100) + 50;
        const y = Math.random() * (bgCanvas.height - 100) + 50;
        foods.push(new Food(x, y));
        lastFoodSpawnTime = now;
    }
    
    // 自动生成野生蛇
    if (now - lastWildSerpentSpawnTime > gameSettings.wildSpawnInterval * 1000 && 
        mouseSerpents.filter(s => s.isWild).length < gameSettings.maxWildCount) {
        // 从屏幕边缘随机位置生成
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -50 : bgCanvas.width + 50;
            y = Math.random() * bgCanvas.height;
        } else {
            x = Math.random() * bgCanvas.width;
            y = Math.random() < 0.5 ? -50 : bgCanvas.height + 50;
        }
        
        mouseSerpents.push(new BackgroundSerpent(x, y, true));
        lastWildSerpentSpawnTime = now;
    }
    
    requestAnimationFrame(animate);
}

// 更新主题特效
function updateThemeEffects() {
    const time = Date.now() * 0.001;
    
    switch (currentTheme) {
        case 'starry-night':
            drawStarryNightEffect(time);
            break;
        case 'aurora':
            drawAuroraEffect(time);
            break;
        case 'sunset':
            drawSunsetEffect(time);
            break;
        case 'ocean':
            drawOceanEffect(time);
            break;
        case 'forest':
            drawForestEffect(time);
            break;
    }
}

// 星空效果
function drawStarryNightEffect(time) {
    const gradient = bgCtx.createRadialGradient(
        bgCanvas.width / 2, bgCanvas.height / 2, 0,
        bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width
    );
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(0.5, '#000066');
    gradient.addColorStop(1, '#000033');
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 减少星星数量，降低闪烁频率
    for (let i = 0; i < 50; i++) {  // 减少到50颗星星
        const x = (i * 567) % bgCanvas.width;  // 使用固定位置
        const y = (i * 789) % bgCanvas.height;
        const size = Math.random() * 1.5 + 0.5;  // 减小星星大小
        // 大幅降低闪烁速度，增加基础亮度
        const opacity = (Math.sin(time * 0.2 + i) + 1) * 0.15 + 0.5;
        
        bgCtx.beginPath();
        bgCtx.arc(x, y, size, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        bgCtx.fill();
        
        // 添加柔和的星星光晕
        const glow = bgCtx.createRadialGradient(x, y, 0, x, y, size * 2);
        glow.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.2})`);
        glow.addColorStop(1, 'transparent');
        bgCtx.fillStyle = glow;
        bgCtx.fill();
    }

    // 绘制流星
    const meteorTime = time % 10;  // 每10秒一个周期
    if (meteorTime < 1.5) {  // 流星持续1.5秒
        const progress = meteorTime / 1.5;
        // 从右上角开始，向左下角划过
        const startX = bgCanvas.width - (bgCanvas.width * progress);
        const startY = progress * bgCanvas.height * 0.5;
        const length = 150;  // 增加流星长度
        
        // 计算流星路径
        const angle = Math.PI / 4;  // 45度角
        const endX = startX - length * Math.cos(angle);
        const endY = startY + length * Math.sin(angle);
        
        // 创建流星渐变
        const meteorGradient = bgCtx.createLinearGradient(
            startX, startY,
            endX, endY
        );
        meteorGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * (1 - progress)})`);
        meteorGradient.addColorStop(0.5, `rgba(200, 220, 255, ${0.5 * (1 - progress)})`);
        meteorGradient.addColorStop(1, 'transparent');
        
        // 绘制流星主体
        bgCtx.beginPath();
        bgCtx.moveTo(startX, startY);
        bgCtx.lineTo(endX, endY);
        bgCtx.strokeStyle = meteorGradient;
        bgCtx.lineWidth = 3;
        bgCtx.stroke();
        
        // 添加流星头部光晕
        const headGlow = bgCtx.createRadialGradient(
            startX, startY, 0,
            startX, startY, 30
        );
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${0.8 * (1 - progress)})`);
        headGlow.addColorStop(0.5, `rgba(255, 255, 255, ${0.4 * (1 - progress)})`);
        headGlow.addColorStop(1, 'transparent');
        bgCtx.fillStyle = headGlow;
        bgCtx.beginPath();
        bgCtx.arc(startX, startY, 30, 0, Math.PI * 2);
        bgCtx.fill();
    }
}

// 极光效果
function drawAuroraEffect(time) {
    const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0, '#001a33');
    gradient.addColorStop(1, '#000033');
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 添加更强的极光效果
    for (let i = 0; i < 3; i++) {
        const hue = (time * 20 + i * 120) % 360;
        
        bgCtx.beginPath();
        bgCtx.moveTo(0, bgCanvas.height * 0.3);
        
        for (let x = 0; x < bgCanvas.width; x += 5) {
            const y = Math.sin(x * 0.01 + time + i) * 100 + 
                     bgCanvas.height * 0.3 + 
                     Math.sin(x * 0.02 - time) * 50;
            bgCtx.lineTo(x, y);
        }
        
        const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.3)`);
        gradient.addColorStop(1, 'transparent');
        
        bgCtx.strokeStyle = gradient;
        bgCtx.lineWidth = 50;
        bgCtx.stroke();
    }
}

// 日落效果
function drawSunsetEffect(time) {
    const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0, '#1a0000');  // 更暗的顶部
    gradient.addColorStop(0.5, '#660000'); // 中间偏暗红
    gradient.addColorStop(0.7, '#cc3300'); // 日落的主要颜色
    gradient.addColorStop(1, '#ff6600');   // 底部偏橙
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 绘制太阳
    const centerX = bgCanvas.width / 2;
    const centerY = bgCanvas.height * 0.75;
    const radius = bgCanvas.height * 0.15;
    
    // 太阳光晕
    const sunGlow = bgCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 2
    );
    sunGlow.addColorStop(0, 'rgba(255, 102, 0, 0.4)');
    sunGlow.addColorStop(0.5, 'rgba(255, 51, 0, 0.2)');
    sunGlow.addColorStop(1, 'transparent');
    
    bgCtx.fillStyle = sunGlow;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 太阳本体
    bgCtx.beginPath();
    bgCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    const sunGradient = bgCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
    );
    sunGradient.addColorStop(0, '#ff6600');
    sunGradient.addColorStop(1, '#ff3300');
    bgCtx.fillStyle = sunGradient;
    bgCtx.fill();
}

// 海洋效果
function drawOceanEffect(time) {
    const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0, '#000066');
    gradient.addColorStop(0.7, '#000099');
    gradient.addColorStop(1, '#0000cc');
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 添加更多层次的波浪
    for (let i = 0; i < 5; i++) {
        bgCtx.beginPath();
        bgCtx.moveTo(0, bgCanvas.height * (0.5 + i * 0.1));
        
        for (let x = 0; x < bgCanvas.width; x += 5) {
            const y = Math.sin(x * 0.01 + time + i) * 20 + 
                     Math.sin(x * 0.02 - time * 0.5) * 10 +
                     bgCanvas.height * (0.5 + i * 0.1);
            bgCtx.lineTo(x, y);
        }
        
        bgCtx.strokeStyle = `rgba(255, 255, 255, ${0.15 - i * 0.02})`;
        bgCtx.lineWidth = 30 - i * 5;
        bgCtx.stroke();
    }
}

// 森林效果
function drawForestEffect(time) {
    const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0, '#001a00');
    gradient.addColorStop(0.5, '#003300');
    gradient.addColorStop(1, '#004d00');
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 添加更多的树叶效果
    for (let i = 0; i < 30; i++) {
        const x = (i / 30) * bgCanvas.width;
        const y = bgCanvas.height * (0.3 + Math.sin(time + i * 0.5) * 0.1);
        
        bgCtx.save();
        bgCtx.translate(x, y);
        bgCtx.rotate(Math.sin(time + i) * 0.2);
        
        // 绘制树叶
        bgCtx.beginPath();
        bgCtx.moveTo(0, -30);
        bgCtx.lineTo(30, 0);
        bgCtx.lineTo(0, 30);
        bgCtx.lineTo(-30, 0);
        bgCtx.closePath();
        
        const leafGradient = bgCtx.createRadialGradient(0, 0, 0, 0, 0, 40);
        leafGradient.addColorStop(0, 'rgba(0, 153, 0, 0.3)');
        leafGradient.addColorStop(1, 'rgba(0, 102, 0, 0.1)');
        
        bgCtx.fillStyle = leafGradient;
        bgCtx.fill();
        
        bgCtx.restore();
    }
}

// 初始化游戏设置
function initGameSettings() {
    const settingsPanel = document.querySelector('.settings-panel');
    if (!settingsPanel) return;

    // 按类别组织设置选项
    const settingGroups = {
        snake: {
            title: '小蛇设置',
            settings: [
                { id: 'normalSpeed', label: '移动速度', min: 1, max: 10, value: gameSettings.normalSpeed },
                { id: 'huntingSpeedMultiplier', label: '捕食加速倍数', min: 1, max: 3, step: 0.1, value: gameSettings.huntingSpeedMultiplier },
                { id: 'healthDecayRate', label: '健康值衰减速度', min: 0.1, max: 1, step: 0.1, value: gameSettings.healthDecayRate },
                { id: 'healthRecovery', label: '食物恢复健康值', min: 20, max: 100, value: gameSettings.healthRecovery },
                { id: 'maxSnakeLength', label: '最大长度', min: 3, max: 30, value: gameSettings.maxSnakeLength },
                { id: 'initialSnakeLength', label: '初始长度', min: 2, max: 10, value: gameSettings.initialSnakeLength }
            ]
        },
        avoidance: {
            title: '避让设置',
            settings: [
                { id: 'avoidanceRadius', label: '避让范围', min: 20, max: 150, value: gameSettings.avoidanceRadius },
                { id: 'avoidanceForce', label: '避让力度', min: 0.1, max: 2, step: 0.1, value: gameSettings.avoidanceForce },
                { id: 'minSpawnDistance', label: '最小生成距离', min: 20, max: 150, value: gameSettings.minSpawnDistance }
            ]
        },
        food: {
            title: '食物设置',
            settings: [
                { id: 'maxFood', label: '最大数量', min: 5, max: 50, value: gameSettings.maxFood },
                { id: 'foodSpawnInterval', label: '生成间隔(ms)', min: 500, max: 5000, step: 100, value: gameSettings.foodSpawnInterval }
            ],
            toggles: [
                { id: 'foodEnabled', label: '启用食物生成' }
            ]
        },
        wildSnake: {
            title: '野生蛇设置',
            settings: [
                { id: 'wildSpeed', label: '移动速度', min: 1, max: 10, value: gameSettings.wildSpeed },
                { id: 'maxWildSnakes', label: '最大数量', min: 0, max: 10, value: gameSettings.maxWildSnakes },
                { id: 'wildSnakeInterval', label: '生成间隔(ms)', min: 2000, max: 10000, step: 500, value: gameSettings.wildSnakeInterval }
            ],
            toggles: [
                { id: 'wildSnakeEnabled', label: '启用野生蛇' }
            ]
        }
    };

    // 生成设置面板HTML
    const settingsHTML = Object.entries(settingGroups).map(([groupKey, group]) => `
        <div class="settings-group">
            <h3>${group.title}</h3>
            ${group.settings.map(setting => `
                <div class="setting-item">
                    <label for="${setting.id}">${setting.label}: <span>${setting.value}</span></label>
                    <input type="range" id="${setting.id}" 
                        min="${setting.min}" max="${setting.max}" 
                        step="${setting.step || 1}" value="${setting.value}">
                </div>
            `).join('')}
            ${group.toggles ? group.toggles.map(toggle => `
                <div class="setting-item toggle">
                    <label>
                        <input type="checkbox" id="${toggle.id}" ${gameSettings[toggle.id] ? 'checked' : ''}>
                        ${toggle.label}
                    </label>
                </div>
            `).join('') : ''}
        </div>
    `).join('');

    settingsPanel.innerHTML = settingsHTML;

    // 添加事件监听
    Object.values(settingGroups).forEach(group => {
        group.settings.forEach(setting => {
            const input = document.getElementById(setting.id);
            const valueDisplay = input.previousElementSibling.querySelector('span');
            
            input.addEventListener('input', () => {
                const value = parseFloat(input.value);
                gameSettings[setting.id] = value;
                valueDisplay.textContent = value;
            });
        });

        if (group.toggles) {
            group.toggles.forEach(toggle => {
                const input = document.getElementById(toggle.id);
                input.addEventListener('change', () => {
                    gameSettings[toggle.id] = input.checked;
                });
            });
        }
    });
}

// 游戏设置对象
const gameSettings = {
    normalSpeed: 3,
    wildSpeed: 4,
    huntingSpeedMultiplier: 1.5,
    maxSnakes: 10,
    foodSpawnRate: 0.02,
    maxFood: 20,
    healthDecayRate: 0.5,    // 加快健康值衰减
    healthRecovery: 40,
    wildSnakeEnabled: true,  // 是否生成野生蛇
    foodEnabled: true,       // 是否生成食物
    maxWildSnakes: 5,       // 最大野生蛇数量
    wildSnakeInterval: 5000, // 野生蛇生成间隔
    foodSpawnInterval: 2000, // 食物生成间隔
    initialSnakeLength: 3,   // 初始蛇长度
    maxSnakeLength: 15,      // 最大蛇长度
    snakeSegmentDistance: 20, // 蛇身体段间距
    avoidanceRadius: 50,     // 避让半径
    avoidanceForce: 0.5,     // 避让力度
    minSpawnDistance: 50     // 最小生成距离
};

// 启动应用
init(); 