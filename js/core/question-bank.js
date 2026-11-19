// 题库状态：待答 / 已答列表与底部统计
import { APP_MODES } from './constants.js';

// 题库管理模块
export class QuestionBank {
    constructor(app) {
        this.questions = [];
        this.answeredQuestions = [];
        this.app = app; // 保存应用实例引用
    }
    
    // 加载题库
    loadQuestions(questions) {
        this.questions = [...questions];
        this.answeredQuestions = [];
        // 只有在非挑战模式下才更新统计信息
        if (!this.app || this.app.currentAppMode !== APP_MODES.CHALLENGE) {
            this.updateStats();
        }
    }
    
    // 获取随机题目
    getRandomQuestion() {
        if (this.questions.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * this.questions.length);
        const question = this.questions[randomIndex];
        
        // 从可用题目中移除，添加到已答题
        this.questions.splice(randomIndex, 1);
        this.answeredQuestions.push(question);
        
        // 只有在非挑战模式下才更新统计信息
        if (!this.app || this.app.currentAppMode !== APP_MODES.CHALLENGE) {
            this.updateStats();
        }
        return question;
    }
    
    // 重置题库
    reset() {
        this.questions = [...this.answeredQuestions, ...this.questions];
        this.answeredQuestions = [];
        // 只有在非挑战模式下才更新统计信息
        if (!this.app || this.app.currentAppMode !== APP_MODES.CHALLENGE) {
            this.updateStats();
        }
    }
    
    // 更新统计信息
    updateStats() {
        // 在挑战模式下，不更新这里的统计信息，由ChallengeMode处理
        if (this.app && this.app.currentAppMode === APP_MODES.CHALLENGE) {
            return;
        }
        
        document.getElementById('answered-count').textContent = this.answeredQuestions.length;
        document.getElementById('remaining-count').textContent = this.questions.length;
    }
}
