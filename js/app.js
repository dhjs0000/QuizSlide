// 主应用入口：组装各模块、绑定事件并启动
import { APP_MODES } from './core/constants.js';
import { speechSynthesis } from './core/speech.js';
import { phoneticConverter } from './core/phonetic.js';
import { notify } from './core/notify.js';
import { QuestionBank } from './core/question-bank.js';
import { QuizMode } from './core/quiz-mode.js';
import { ChallengeMode } from './core/challenge-mode.js';
import backgroundMethods from './app/background.js';
import bankMethods from './app/bank-manager.js';
import modeSwitcherMethods from './app/mode-switcher.js';
import challengeMethods from './app/challenge-ui.js';
import quizMethods from './app/quiz-ui.js';
import speechMethods from './app/speech-ui.js';

class QuizApp {
    constructor() {
        this.questionBank = new QuestionBank(this);
        this.quizMode = new QuizMode();
        this.challengeMode = new ChallengeMode();
        this.currentQuestion = null;
        this.isAnswerShown = false;
        this.currentAppMode = APP_MODES.LECTURE; // 当前应用模式
        this.currentQuizOptions = []; // 当前答题模式的选项
        this.selectedOption = null; // 用户选择的选项
        this.availableBanks = []; // 可用题库列表
        this.selectedBanks = []; // 已选择的题库
        this.bankQuestions = {}; // 存储各个题库的题目 {bankName: questions}
        this.challengeSelectedOption = null; // 挑战模式用户选择的选项
        this.challengeCurrentOptions = []; // 挑战模式当前选项
        this.autoNextTimer = null; // 自动下一题定时器
        this.autoSwitchTime = 0.3; // 默认自动切换时间（秒）
        this.speechSynthesis = speechSynthesis; // 语音合成实例
        this.speechSettings = {
            rate: 0.8,
            pitch: 1.0,
            volume: 1.0,
            autoSpeak: false
        };
        
        this.initializeEventListeners();
        this.initializeBackgroundSettings();
        
        // 加载音标数据
        this.loadPhoneticData();
    }

    // 加载音标数据
    async loadPhoneticData() {
        await phoneticConverter.loadPhoneticData();
    }

    // 消息提示委托给统一的 notify，避免每个页面各写一份样式
    showMessage(message, type) {
        notify(message, type);
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 应用模式切换
        document.querySelectorAll('.app-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 双人对战是独立页面
                if (e.target.id === 'pvp-mode') {
                    window.location.href = 'pvp.html';
                    return;
                }
                // 允许随时切换模式；进行中的挑战会在切换时结束，不会把用户困住
                this.handleAppModeChange(e.target.id);
            });
        });
        
        // 挑战模式选择
        document.querySelectorAll('.challenge-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChallengeModeSelect(e.target.dataset.mode);
            });
        });
        
        // 挑战模式题数设置
        const questionCountInput = document.getElementById('challenge-question-count');
        if (questionCountInput) {
            questionCountInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (value < 5) e.target.value = 5;
                if (value > 100) e.target.value = 100;
            });
            
            questionCountInput.addEventListener('blur', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 5) e.target.value = 5;
                if (value > 100) e.target.value = 100;
            });
        }
        
        // 自动切换时间设置
        const autoSwitchSelect = document.getElementById('auto-switch-time');
        if (autoSwitchSelect) {
            autoSwitchSelect.addEventListener('change', (e) => {
                this.autoSwitchTime = parseFloat(e.target.value);
            });
        }
        
        // 挑战模式选项按钮
        document.querySelectorAll('#challenge-option-a, #challenge-option-b, #challenge-option-c, #challenge-option-d').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.handleChallengeOptionSelect(index);
            });
        });
        
        // 挑战模式下一题按钮
        document.getElementById('next-challenge-question').addEventListener('click', () => {
            this.nextChallengeQuestion();
        });
        
        // 重新开始挑战按钮
        document.getElementById('restart-challenge').addEventListener('click', () => {
            this.restartChallenge();
        });
        
        // 文件上传
        document.getElementById('csv-file').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        // 发音按钮
        document.getElementById('speak-btn').addEventListener('click', () => {
            this.speakCurrentWord();
        });
        
        // 语音设置按钮
        document.getElementById('speech-settings-btn').addEventListener('click', () => {
            this.toggleSpeechPanel();
        });
        
        // 关闭语音设置面板
        document.getElementById('close-speech-panel').addEventListener('click', () => {
            this.hideSpeechPanel();
        });
        
        // 语音设置滑块
        document.getElementById('speech-rate').addEventListener('input', (e) => {
            this.updateSpeechSetting('rate', parseFloat(e.target.value));
            document.getElementById('speech-rate-value').textContent = e.target.value;
        });
        
        document.getElementById('speech-pitch').addEventListener('input', (e) => {
            this.updateSpeechSetting('pitch', parseFloat(e.target.value));
            document.getElementById('speech-pitch-value').textContent = e.target.value;
        });
        
        document.getElementById('speech-volume').addEventListener('input', (e) => {
            this.updateSpeechSetting('volume', parseFloat(e.target.value));
            document.getElementById('speech-volume-value').textContent = e.target.value;
        });
        
        document.getElementById('auto-speak').addEventListener('change', (e) => {
            this.updateSpeechSetting('autoSpeak', e.target.checked);
        });
        
        // 模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleModeChange(e.target.id);
            });
        });
        
        // 讲台模式控制按钮
        document.getElementById('show-answer').addEventListener('click', () => {
            this.showAnswer();
        });
        
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // 答题模式选项按钮
        document.querySelectorAll('.option-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.handleOptionSelect(index);
            });
        });
        
        // 答题模式下一题按钮
        document.getElementById('next-quiz-question').addEventListener('click', () => {
            this.nextQuizQuestion();
        });
        
        // 初始化题库管理（延迟执行，确保DOM加载完成）
        setTimeout(() => {
            this.initializeBankManagement();
        }, 100);
    }

    // 打乱数组
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// 按职责把界面方法挂到原型上；调用关系与拆分前完全一致
Object.assign(
    QuizApp.prototype,
    backgroundMethods,
    bankMethods,
    modeSwitcherMethods,
    challengeMethods,
    quizMethods,
    speechMethods,
);

document.addEventListener('DOMContentLoaded', () => {
    const app = new QuizApp();

    console.log('单词答题游戏已加载完成');

    // 键盘快捷键：Enter/空格 显示答案或下一题，Esc 隐藏答案
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!app.isAnswerShown) {
                app.showAnswer();
            } else {
                app.nextQuestion();
            }
        } else if (e.key === 'Escape') {
            app.hideAnswer();
        }
    });
});
