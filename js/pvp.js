// 双人对战页入口：同题不同序，先答对者得分
import { notify } from './core/notify.js';
import bankMethods from './pvp/banks.js';
import duelUiMethods from './pvp/duel-ui.js';

class PVPDuelMode {
    constructor() {
        this.player1 = {
            name: '玩家1',
            score: 0,
            correctCount: 0,
            wrongCount: 0,
            currentQuestion: null,
            currentOptions: [],
            selectedAnswer: null,
            hasAnswered: false,
            questionOrder: [] // 玩家1的题目顺序
        };
        
        this.player2 = {
            name: '玩家2',
            score: 0,
            correctCount: 0,
            wrongCount: 0,
            currentQuestion: null,
            currentOptions: [],
            selectedAnswer: null,
            hasAnswered: false,
            questionOrder: [] // 玩家2的题目顺序
        };
        
        this.gameState = {
            isActive: false,
            currentRound: 0,
            totalRounds: 10,
            questionMode: 'chinese-to-english',
            autoSwitchTime: 0, // 自动切换时间（秒）
            autoSwitchTimer: null, // 自动切换定时器
            startTime: null,
            elapsedTime: 0,
            timer: null,
            allQuestions: [], // 所有题目
            shuffledQuestions: [] // 打乱顺序后的题目
        };
        
        this.questionBank = [];
        this.selectedBanks = [];
        this.availableBanks = [];
        
        this.initializeEventListeners();
        this.initializeBankManagement();
    }

    // 开始对战
    async startDuel() {
        // 获取玩家名称
        const player1Name = document.getElementById('player1-name').value.trim() || '玩家1';
        const player2Name = document.getElementById('player2-name').value.trim() || '玩家2';
        
        this.player1.name = player1Name;
        this.player2.name = player2Name;
        
        // 检查题库
        if (this.questionBank.length === 0) {
            this.showMessage('请先加载题库！', 'error');
            return;
        }
        
        // 检查题数
        if (this.gameState.totalRounds > this.questionBank.length) {
            this.showMessage(`题库中只有${this.questionBank.length}道题，无法开始${this.gameState.totalRounds}题的对战！`, 'error');
            return;
        }
        
        // 初始化游戏状态
        this.gameState.isActive = true;
        this.gameState.currentRound = 0;
        this.gameState.startTime = Date.now();
        this.gameState.elapsedTime = 0;
        
        // 重置玩家状态
        this.resetPlayerState(this.player1);
        this.resetPlayerState(this.player2);
        
        // 生成题目列表并打乱顺序
        this.generateShuffledQuestions();
        
        // 隐藏设置界面，显示游戏界面
        document.getElementById('pvp-setup').style.display = 'none';
        document.getElementById('pvp-game').style.display = 'block';
        document.getElementById('pvp-results').style.display = 'none';
        
        // 更新玩家名称显示
        document.getElementById('player1-name-display').textContent = this.player1.name;
        document.getElementById('player2-name-display').textContent = this.player2.name;
        
        // 开始计时器
        this.startTimer();
        
        // 开始第一轮
        this.nextRound();
        
        this.showMessage('对战开始！祝两位玩家好运！', 'success');
    }

    // 重置玩家状态
    resetPlayerState(player) {
        player.score = 0;   
        player.correctCount = 0;
        player.wrongCount = 0;
        player.currentQuestion = null;
        player.currentOptions = [];
        player.selectedAnswer = null;
        player.hasAnswered = false;
        player.questionOrder = [];
    }

    // 生成打乱顺序的题目
    generateShuffledQuestions() {
        // 从题库中随机选择指定数量的题目
        const selectedQuestions = [];
        const availableQuestions = [...this.questionBank];
        
        for (let i = 0; i < this.gameState.totalRounds; i++) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            selectedQuestions.push(availableQuestions[randomIndex]);
            availableQuestions.splice(randomIndex, 1);
        }
        
        this.gameState.allQuestions = selectedQuestions;
        
        // 为每个玩家生成不同的题目顺序（保证公平）
        this.player1.questionOrder = this.shuffleArray([...Array(this.gameState.totalRounds).keys()]);
        this.player2.questionOrder = this.shuffleArray([...Array(this.gameState.totalRounds).keys()]);
    }

    // 开始计时器
    startTimer() {
        this.gameState.timer = setInterval(() => {
            this.gameState.elapsedTime = Math.floor((Date.now() - this.gameState.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }

    // 更新计时器显示
    updateTimerDisplay() {
        const minutes = Math.floor(this.gameState.elapsedTime / 60);
        const seconds = this.gameState.elapsedTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('pvp-timer').textContent = timeString;
    }

    // 下一轮
    nextRound() {
        // 清除之前的自动切换定时器
        if (this.gameState.autoSwitchTimer) {
            clearTimeout(this.gameState.autoSwitchTimer);
            this.gameState.autoSwitchTimer = null;
        }
        
        if (this.gameState.currentRound >= this.gameState.totalRounds) {
            this.endDuel();
            return;
        }
        
        this.gameState.currentRound++;
        
        // 重置玩家答题状态
        this.player1.hasAnswered = false;
        this.player2.hasAnswered = false;
        this.player1.selectedAnswer = null;
        this.player2.selectedAnswer = null;
        
        // 获取当前题目（根据各自的顺序）
        const player1QuestionIndex = this.player1.questionOrder[this.gameState.currentRound - 1];
        const player2QuestionIndex = this.player2.questionOrder[this.gameState.currentRound - 1];
        
        this.player1.currentQuestion = this.gameState.allQuestions[player1QuestionIndex];
        this.player2.currentQuestion = this.gameState.allQuestions[player2QuestionIndex];
        
        // 显示题目
        this.displayPlayerQuestion(1);
        this.displayPlayerQuestion(2);
        
        // 更新进度条
        this.updateProgressBar();
        
        // 隐藏下一轮按钮
        document.getElementById('next-pvp-round').style.display = 'none';
        
        // 激活两个玩家区域
        this.setPlayerActive(1, true);
        this.setPlayerActive(2, true);
    }

    // 结束对战
    endDuel() {
        this.gameState.isActive = false;
        
        // 停止计时器
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
            this.gameState.timer = null;
        }
        
        // 清除自动切换定时器
        if (this.gameState.autoSwitchTimer) {
            clearTimeout(this.gameState.autoSwitchTimer);
            this.gameState.autoSwitchTimer = null;
        }
        
        // 隐藏游戏界面，显示结果界面
        document.getElementById('pvp-game').style.display = 'none';
        document.getElementById('pvp-results').style.display = 'block';
        
        // 显示最终结果
        this.displayFinalResults();
    }

    // 显示最终结果
    displayFinalResults() {
        const player1Total = this.player1.correctCount + this.player1.wrongCount;
        const player2Total = this.player2.correctCount + this.player2.wrongCount;
        
        const player1Accuracy = player1Total > 0 ? (this.player1.correctCount / player1Total * 100) : 0;
        const player2Accuracy = player2Total > 0 ? (this.player2.correctCount / player2Total * 100) : 0;
        
        // 确定获胜者
        let winner;
        let announcement;
        
        if (this.player1.score > this.player2.score) {
            winner = this.player1;
            announcement = `🎉 ${winner.name} 获胜！`;
        } else if (this.player2.score > this.player1.score) {
            winner = this.player2;
            announcement = `🎉 ${winner.name} 获胜！`;
        } else {
            winner = null;
            announcement = '🤝 平局！';
        }
        
        // 显示获胜者公告
        const announcementElement = document.getElementById('winner-announcement');
        announcementElement.textContent = announcement;
        announcementElement.className = winner ? 'winner-announcement' : 'draw-announcement';
        
        // 更新玩家1最终统计
        document.getElementById('player1-final-name').textContent = this.player1.name;
        document.getElementById('player1-final-score').textContent = this.player1.score;
        document.getElementById('player1-final-correct').textContent = this.player1.correctCount;
        document.getElementById('player1-final-wrong').textContent = this.player1.wrongCount;
        document.getElementById('player1-final-accuracy').textContent = `${player1Accuracy.toFixed(1)}%`;
        
        // 更新玩家2最终统计
        document.getElementById('player2-final-name').textContent = this.player2.name;
        document.getElementById('player2-final-score').textContent = this.player2.score;
        document.getElementById('player2-final-correct').textContent = this.player2.correctCount;
        document.getElementById('player2-final-wrong').textContent = this.player2.wrongCount;
        document.getElementById('player2-final-accuracy').textContent = `${player2Accuracy.toFixed(1)}%`;
        
        // 高亮获胜者
        if (winner) {
            const winnerFinalElement = document.getElementById(`${winner === this.player1 ? 'player1' : 'player2'}-final`);
            winnerFinalElement.classList.add('winner');
        }
    }

    // 重新开始对战
    restartDuel() {
        // 重置游戏状态
        this.gameState.isActive = false;
        this.gameState.currentRound = 0;
        this.gameState.elapsedTime = 0;
        
        // 重置玩家状态
        this.resetPlayerState(this.player1);
        this.resetPlayerState(this.player2);
        
        // 显示设置界面，隐藏结果界面
        document.getElementById('pvp-setup').style.display = 'block';
        document.getElementById('pvp-game').style.display = 'none';
        document.getElementById('pvp-results').style.display = 'none';
        
        // 清除获胜者高亮
        document.getElementById('player1-final').classList.remove('winner');
        document.getElementById('player2-final').classList.remove('winner');
        
        // 重置计时器显示
        document.getElementById('pvp-timer').textContent = '00:00';
        document.getElementById('progress-fill').style.width = '0%';
    }

    // 工具方法
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    containsChinese(text) {
        return /[\u4e00-\u9fff]/.test(text);
    }

    containsEnglish(text) {
        return /[a-zA-Z]/.test(text);
    }

    // 消息提示委托给统一实现
    showMessage(message, type) {
        notify(message, type);
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 题目数量选择
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const count = e.target.dataset.count;
                const customInput = document.getElementById('custom-count');
                
                if (count === 'custom') {
                    customInput.style.display = 'block';
                    customInput.focus();
                } else {
                    customInput.style.display = 'none';
                    this.gameState.totalRounds = parseInt(count);
                }
            });
        });
        
        // 自定义题数输入
        const customInput = document.getElementById('custom-count');
        customInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (value < 5) e.target.value = 5;
            if (value > 50) e.target.value = 50;
            if (value >= 5 && value <= 50) {
                this.gameState.totalRounds = value;
            }
        });
        
        // 答题模式选择
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameState.questionMode = e.target.dataset.mode;
            });
        });
        
        // 自动切换时间选择
        document.querySelectorAll('.auto-switch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.auto-switch-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameState.autoSwitchTime = parseInt(e.target.dataset.time);
            });
        });
        
        // 开始对战按钮
        document.getElementById('start-pvp').addEventListener('click', () => {
            this.startDuel();
        });
        
        // 玩家1选项按钮
        document.querySelectorAll('#player1-options .pvp-option-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.handlePlayerAnswer(1, index);
            });
        });
        
        // 玩家2选项按钮
        document.querySelectorAll('#player2-options .pvp-option-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.handlePlayerAnswer(2, index);
            });
        });
        
        // 下一轮按钮
        document.getElementById('next-pvp-round').addEventListener('click', () => {
            this.nextRound();
        });
        
        // 结束对战按钮
        document.getElementById('end-pvp').addEventListener('click', () => {
            this.endDuel();
        });
        
        // 重新开始按钮
        document.getElementById('restart-pvp').addEventListener('click', () => {
            this.restartDuel();
        });
        
        // 返回主界面按钮
        document.getElementById('back-to-main-from-pvp').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // 应用模式切换
        document.querySelectorAll('.app-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.id !== 'pvp-mode') {
                    window.location.href = e.target.id === 'challenge-mode' ? 'index.html#challenge' : 'index.html';
                }
            });
        });
    }
}

Object.assign(PVPDuelMode.prototype, bankMethods, duelUiMethods);

document.addEventListener('DOMContentLoaded', () => {
    new PVPDuelMode();

    console.log('双人对战模式已加载完成');
});
