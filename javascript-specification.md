# JavaScript核心逻辑设计规范

## 全局变量和数据结构

### 题库数据
```javascript
let questionBank = [];        // 存储所有题目
let currentQuestions = [];    // 当前可用的题目
let currentQuestion = null;   // 当前题目
let answeredCount = 0;        // 已答题数量
let currentMode = 'chinese-to-english'; // 当前模式
```

### 模式定义
```javascript
const MODES = {
    CHINESE_TO_ENGLISH: 'chinese-to-english',
    ENGLISH_TO_CHINESE: 'english-to-chinese',
    RANDOM: 'random-mode'
};
```

## 核心功能模块

### 1. CSV文件解析模块
```javascript
class CSVParser {
    // 解析CSV文件内容
    static parseCSV(content) {
        // 按行分割
        const lines = content.trim().split('\n');
        const questions = [];
        
        // 跳过标题行，从第二行开始
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                // 处理CSV格式，支持引号内的逗号
                const parts = this.parseCSVLine(line);
                if (parts.length >= 2) {
                    questions.push({
                        chinese: parts[0].trim(),
                        english: parts[1].trim()
                    });
                }
            }
        }
        
        return questions;
    }
    
    // 解析单行CSV，处理引号和逗号
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
}
```

### 2. 题库管理模块
```javascript
class QuestionBank {
    constructor() {
        this.questions = [];
        this.answeredQuestions = [];
    }
    
    // 加载题库
    loadQuestions(questions) {
        this.questions = [...questions];
        this.answeredQuestions = [];
        this.updateStats();
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
        
        this.updateStats();
        return question;
    }
    
    // 重置题库
    reset() {
        this.questions = [...this.answeredQuestions, ...this.questions];
        this.answeredQuestions = [];
        this.updateStats();
    }
    
    // 更新统计信息
    updateStats() {
        document.getElementById('answered-count').textContent = this.answeredQuestions.length;
        document.getElementById('remaining-count').textContent = this.questions.length;
    }
}
```

### 3. 答题模式管理模块
```javascript
class QuizMode {
    constructor() {
        this.currentMode = MODES.CHINESE_TO_ENGLISH;
    }
    
    // 设置答题模式
    setMode(mode) {
        this.currentMode = mode;
        this.updateModeButtons();
    }
    
    // 根据模式显示题目
    getQuestionText(question) {
        switch (this.currentMode) {
            case MODES.CHINESE_TO_ENGLISH:
                return question.chinese;
            case MODES.ENGLISH_TO_CHINESE:
                return question.english;
            case MODES.RANDOM:
                return Math.random() < 0.5 ? question.chinese : question.english;
            default:
                return question.chinese;
        }
    }
    
    // 根据模式显示答案
    getAnswerText(question) {
        switch (this.currentMode) {
            case MODES.CHINESE_TO_ENGLISH:
                return question.english;
            case MODES.ENGLISH_TO_CHINESE:
                return question.chinese;
            case MODES.RANDOM:
                // 如果题目是中文，答案就是英文，反之亦然
                const questionText = this.getQuestionText(question);
                return questionText === question.chinese ? question.english : question.chinese;
            default:
                return question.english;
        }
    }
    
    // 更新模式按钮状态
    updateModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(this.currentMode).classList.add('active');
    }
}
```

### 4. 主应用控制器
```javascript
class QuizApp {
    constructor() {
        this.questionBank = new QuestionBank();
        this.quizMode = new QuizMode();
        this.currentQuestion = null;
        this.isAnswerShown = false;
        
        this.initializeEventListeners();
    }
    
    // 初始化事件监听器
    initializeEventListeners() {
        // 文件上传
        document.getElementById('csv-file').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        // 模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleModeChange(e.target.id);
            });
        });
        
        // 控制按钮
        document.getElementById('show-answer').addEventListener('click', () => {
            this.showAnswer();
        });
        
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });
    }
    
    // 处理文件上传
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const content = await this.readFile(file);
            const questions = CSVParser.parseCSV(content);
            
            if (questions.length > 0) {
                this.questionBank.loadQuestions(questions);
                this.nextQuestion();
                this.showMessage('题库加载成功！', 'success');
            } else {
                this.showMessage('题库文件格式错误！', 'error');
            }
        } catch (error) {
            this.showMessage('文件读取失败：' + error.message, 'error');
        }
    }
    
    // 读取文件内容
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    }
    
    // 处理模式切换
    handleModeChange(mode) {
        this.quizMode.setMode(mode);
        if (this.currentQuestion) {
            this.displayQuestion();
        }
    }
    
    // 显示下一题
    nextQuestion() {
        const question = this.questionBank.getRandomQuestion();
        
        if (question) {
            this.currentQuestion = question;
            this.isAnswerShown = false;
            this.displayQuestion();
            this.hideAnswer();
        } else {
            this.showCompletionMessage();
        }
    }
    
    // 显示题目
    displayQuestion() {
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        document.getElementById('question').textContent = questionText;
    }
    
    // 显示答案
    showAnswer() {
        if (this.currentQuestion && !this.isAnswerShown) {
            const answerText = this.quizMode.getAnswerText(this.currentQuestion);
            const answerElement = document.getElementById('answer');
            
            answerElement.textContent = answerText;
            answerElement.classList.add('show');
            answerElement.classList.remove('hidden');
            
            this.isAnswerShown = true;
        }
    }
    
    // 隐藏答案
    hideAnswer() {
        const answerElement = document.getElementById('answer');
        answerElement.classList.remove('show');
        answerElement.classList.add('hidden');
        answerElement.textContent = '';
    }
    
    // 显示完成信息
    showCompletionMessage() {
        document.getElementById('question').textContent = '🎉 恭喜！所有题目已完成！';
        document.getElementById('answer').textContent = '';
        this.hideAnswer();
    }
    
    // 显示消息
    showMessage(message, type) {
        // 可以扩展为更复杂的消息显示系统
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
```

## 初始化应用
```javascript
// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new QuizApp();
    
    // 可以在这里添加一些默认行为
    console.log('单词答题游戏已加载完成');
});
```

## 辅助函数
```javascript
// 工具函数
const Utils = {
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 随机数组元素
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // 格式化数字
    formatNumber(num) {
        return num.toLocaleString('zh-CN');
    }
};