// 答题模式：决定当前题目显示中文还是英文，并保证随机模式下题目与答案对应
import { MODES } from './constants.js';
import { speechSynthesis } from './speech.js';

// 答题模式管理模块
export class QuizMode {
    constructor() {
        this.currentMode = MODES.CHINESE_TO_ENGLISH;
        this.lastRandomQuestion = null; // 记录随机模式下的题目选择
    }
    
    // 设置答题模式
    setMode(mode) {
        this.currentMode = mode;
        this.updateModeButtons();
    }
    
    // 根据模式显示题目
    getQuestionText(question) {
        console.log(`[DEBUG] getQuestionText() called, currentMode: ${this.currentMode}, lastRandomQuestion: ${this.lastRandomQuestion}`);
        console.log(`[DEBUG] Question data: chinese="${question.chinese}", english="${question.english}"`);
        
        switch (this.currentMode) {
            case MODES.CHINESE_TO_ENGLISH:
                console.log(`[DEBUG] Returning chinese text: "${question.chinese}"`);
                return question.chinese;
            case MODES.ENGLISH_TO_CHINESE:
                console.log(`[DEBUG] Returning english text: "${question.english}"`);
                return question.english;
            case MODES.RANDOM:
                // 只有在lastRandomQuestion还没有设置的情况下才进行随机选择
                // 这确保同一个题目在多次调用中保持一致
                if (this.lastRandomQuestion === null) {
                    this.lastRandomQuestion = Math.random() < 0.5 ? 'chinese' : 'english';
                    console.log(`[DEBUG] RANDOM mode: FIRST TIME - set lastRandomQuestion = "${this.lastRandomQuestion}"`);
                } else {
                    console.log(`[DEBUG] RANDOM mode: USING EXISTING lastRandomQuestion = "${this.lastRandomQuestion}"`);
                }
                const result = this.lastRandomQuestion === 'chinese' ? question.chinese : question.english;
                console.log(`[DEBUG] RANDOM mode: returning "${result}"`);
                return result;
            default:
                console.log(`[DEBUG] Default: returning chinese text: "${question.chinese}"`);
                return question.chinese;
        }
    }
    
    // 根据模式显示答案
    getAnswerText(question) {
        console.log(`[DEBUG] getAnswerText() called, currentMode: ${this.currentMode}, lastRandomQuestion: ${this.lastRandomQuestion}`);
        console.log(`[DEBUG] Question data: chinese="${question.chinese}", english="${question.english}"`);
        
        switch (this.currentMode) {
            case MODES.CHINESE_TO_ENGLISH:
                console.log(`[DEBUG] Returning english text: "${question.english}"`);
                return question.english;
            case MODES.ENGLISH_TO_CHINESE:
                console.log(`[DEBUG] Returning chinese text: "${question.chinese}"`);
                return question.chinese;
            case MODES.RANDOM:
                // 使用记录的随机选择，确保答案与题目对应
                console.log(`[DEBUG] RANDOM mode: lastRandomQuestion = "${this.lastRandomQuestion}"`);
                if (this.lastRandomQuestion === 'chinese') {
                    console.log(`[DEBUG] RANDOM mode: returning english answer "${question.english}"`);
                    return question.english;
                } else {
                    console.log(`[DEBUG] RANDOM mode: returning chinese answer "${question.chinese}"`);
                    return question.chinese;
                }
            default:
                console.log(`[DEBUG] Default: returning english text: "${question.english}"`);
                return question.english;
        }
    }
    
    // 更新模式按钮状态
    updateModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.getElementById(this.currentMode);
        if (activeButton) {
            activeButton.classList.add('active');
        } else {
            console.warn(`Mode button with ID "${this.currentMode}" not found`);
        }
    }
    
    // 判断文本语言类型
    getTextLanguage(text) {
        if (speechSynthesis.containsChinese(text)) {
            return 'chinese';
        } else if (speechSynthesis.containsEnglish(text)) {
            return 'english';
        }
        return 'unknown';
    }
    
    // 获取当前题目显示的语言类型
    getCurrentQuestionLanguage(question) {
        console.log('[DEBUG] ===== getCurrentQuestionLanguage() START =====');
        const questionText = this.getQuestionText(question);
        console.log(`[DEBUG] getCurrentQuestionLanguage - questionText: "${questionText}"`);
        const result = this.getTextLanguage(questionText);
        console.log(`[DEBUG] getCurrentQuestionLanguage - detected language: "${result}"`);
        console.log('[DEBUG] ===== getCurrentQuestionLanguage() END =====');
        return result;
    }
}
