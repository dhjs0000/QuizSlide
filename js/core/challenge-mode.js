// 挑战模式状态机：计时、计分、错题记录与能力分
import { MODES } from './constants.js';

// 挑战模式管理模块
export class ChallengeMode {
    constructor() {
        this.isActive = false;
        this.startTime = null;
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.totalQuestions = 0;
        this.targetQuestionCount = 20; // 默认题目数量
        this.wrongQuestions = [];
        this.correctQuestions = [];
        this.currentChallengeMode = MODES.CHINESE_TO_ENGLISH;
        this.timer = null;
        this.timeElapsed = 0;
    }
    
    start(targetQuestionCount = 20) {
        this.isActive = true;
        this.startTime = Date.now();
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.totalQuestions = 0;
        this.targetQuestionCount = targetQuestionCount;
        this.wrongQuestions = [];
        this.correctQuestions = [];
        this.timeElapsed = 0;
        this.startTimer();
    }
    
    stop() {
        this.isActive = false;
        this.stopTimer();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeElapsed / 60);
        const seconds = this.timeElapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const timerElement = document.getElementById('challenge-time');
        if (timerElement) {
            timerElement.textContent = timeString;
        }
    }
    
    updateScore(correct) {
        if (correct) {
            this.score += 3;
            this.correctCount++;
        } else {
            this.score = Math.max(0, this.score - 2); // 确保分数不为负
            this.wrongCount++;
        }
        this.totalQuestions++;
        this.updateScoreDisplay();
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('challenge-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // 同时更新进度信息
        this.updateProgressDisplay();
    }
    
    updateProgressDisplay() {
        // 更新统计信息中的进度显示
        const answeredCountElement = document.getElementById('answered-count');
        const remainingCountElement = document.getElementById('remaining-count');
        
        if (answeredCountElement) {
            answeredCountElement.textContent = this.totalQuestions;
        }
        
        if (remainingCountElement) {
            const remaining = Math.max(0, this.targetQuestionCount - this.totalQuestions);
            remainingCountElement.textContent = remaining;
        }
    }
    
    recordQuestion(question, userAnswer, correctAnswer, isCorrect) {
        const questionRecord = {
            question: question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
        };
        
        if (isCorrect) {
            this.correctQuestions.push(questionRecord);
        } else {
            this.wrongQuestions.push(questionRecord);
        }
    }
    
    calculateAbilityScore() {
        // 能力分计算公式：基础分 + 正确率加分 + 速度加分
        const accuracy = this.totalQuestions > 0 ? this.correctCount / this.totalQuestions : 0;
        const timeBonus = this.timeElapsed > 0 ? Math.max(0, 100 - this.timeElapsed / 60) : 0; // 时间越短加分越多
        const abilityScore = Math.round(60 + accuracy * 30 + timeBonus * 0.1);
        return Math.min(100, abilityScore); // 最高100分
    }
    
    getResults() {
        return {
            totalTime: this.timeElapsed,
            score: this.score,
            correctCount: this.correctCount,
            wrongCount: this.wrongCount,
            totalQuestions: this.totalQuestions,
            accuracy: this.totalQuestions > 0 ? (this.correctCount / this.totalQuestions * 100) : 0,
            abilityScore: this.calculateAbilityScore(),
            wrongQuestions: this.wrongQuestions,
            correctQuestions: this.correctQuestions
        };
    }
}
