// 全局变量和数据结构
let questionBank = [];        // 存储所有题目
let currentQuestions = [];    // 当前可用的题目
let currentQuestion = null;   // 当前题目
let answeredCount = 0;        // 已答题数量
let currentMode = 'chinese-to-english'; // 当前模式
let builtInQuestionBanks = {}; // 内置题库

// 应用模式定义
const APP_MODES = {
    LECTURE: 'lecture-mode',
    QUIZ: 'quiz-mode'
};

// 答题模式定义
const MODES = {
    CHINESE_TO_ENGLISH: 'chinese-to-english',
    ENGLISH_TO_CHINESE: 'english-to-chinese',
    RANDOM: 'random-mode'
};

// CSV文件解析模块
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

// 题库管理模块
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

// 答题模式管理模块
class QuizMode {
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
        switch (this.currentMode) {
            case MODES.CHINESE_TO_ENGLISH:
                return question.chinese;
            case MODES.ENGLISH_TO_CHINESE:
                return question.english;
            case MODES.RANDOM:
                // 记录随机选择，确保答案对应
                this.lastRandomQuestion = Math.random() < 0.5 ? 'chinese' : 'english';
                return this.lastRandomQuestion === 'chinese' ? question.chinese : question.english;
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
                // 使用记录的随机选择，确保答案与题目对应
                if (this.lastRandomQuestion === 'chinese') {
                    return question.english;
                } else {
                    return question.chinese;
                }
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

// 主应用控制器
class QuizApp {
    constructor() {
        this.questionBank = new QuestionBank();
        this.quizMode = new QuizMode();
        this.currentQuestion = null;
        this.isAnswerShown = false;
        this.currentAppMode = APP_MODES.LECTURE; // 当前应用模式
        this.currentQuizOptions = []; // 当前答题模式的选项
        this.selectedOption = null; // 用户选择的选项
        this.availableBanks = []; // 可用题库列表
        this.selectedBanks = []; // 已选择的题库
        this.bankQuestions = {}; // 存储各个题库的题目 {bankName: questions}
        
        this.initializeEventListeners();
    }
    
    // 初始化题库管理
    initializeBankManagement = () => {
        // 加载选中题库按钮
        document.getElementById('load-selected-banks').addEventListener('click', () => {
            this.loadSelectedBanks();
        });
        
        // 初始化题库列表
        this.loadAvailableBanks();
    }
    
    // 加载可用题库
    loadAvailableBanks = async () => {
        try {
            // 获取data目录下的所有CSV文件
            const csvFiles = await loadCSVFileList();
            
            // 添加示例题库
            this.availableBanks = [
                { fileName: 'sample', displayName: '基础词汇 (100词)', type: 'built-in' },
                ...csvFiles.map(file => ({
                    fileName: file.fileName,
                    displayName: file.displayName,
                    type: 'file'
                }))
            ];
            
            this.displayAvailableBanks();
        } catch (error) {
            console.error('加载可用题库失败:', error);
            this.showMessage('加载题库列表失败', 'error');
        }
    }
    
    // 显示可用题库
    displayAvailableBanks = () => {
        const bankList = document.getElementById('bank-list');
        bankList.innerHTML = '';
        
        this.availableBanks.forEach((bank, index) => {
            const bankItem = document.createElement('div');
            bankItem.className = 'bank-item';
            bankItem.textContent = bank.displayName;
            bankItem.addEventListener('click', () => {
                this.toggleBankSelection(index);
            });
            bankList.appendChild(bankItem);
        });
    }
    
    // 切换题库选择状态
    toggleBankSelection = (index) => {
        const bank = this.availableBanks[index];
        const bankItems = document.querySelectorAll('.bank-list .bank-item');
        const bankItem = bankItems[index];
        
        if (this.selectedBanks.find(b => b.fileName === bank.fileName)) {
            // 取消选择
            this.selectedBanks = this.selectedBanks.filter(b => b.fileName !== bank.fileName);
            bankItem.classList.remove('selected');
        } else {
            // 选择题库
            this.selectedBanks.push(bank);
            bankItem.classList.add('selected');
        }
        
        this.displaySelectedBanks();
    }
    
    // 显示已选择的题库
    displaySelectedBanks = () => {
        const selectedList = document.getElementById('selected-bank-list');
        selectedList.innerHTML = '';
        
        if (this.selectedBanks.length === 0) {
            selectedList.innerHTML = '<div style="color: #7f8c8d; text-align: center; padding: 10px;">请选择至少一个题库</div>';
            return;
        }
        
        this.selectedBanks.forEach(bank => {
            const bankItem = document.createElement('div');
            bankItem.className = 'bank-item selected';
            bankItem.textContent = bank.displayName;
            selectedList.appendChild(bankItem);
        });
    }
    
    // 加载选中的题库
    loadSelectedBanks = async () => {
        if (this.selectedBanks.length === 0) {
            this.showMessage('请至少选择一个题库！', 'error');
            return;
        }
        
        try {
            let allQuestions = [];
            
            // 加载所有选中的题库
            for (const bank of this.selectedBanks) {
                let questions;
                
                if (bank.type === 'built-in' && bank.fileName === 'sample') {
                    // 加载内置示例题库
                    const response = await fetch('sample-words.csv');
                    const content = await response.text();
                    questions = CSVParser.parseCSV(content);
                } else if (bank.type === 'file') {
                    // 加载文件题库
                    const response = await fetch(`data/${bank.fileName}`);
                    const content = await response.text();
                    questions = CSVParser.parseCSV(content);
                }
                
                if (questions && questions.length > 0) {
                    // 为每个题目添加题库来源信息
                    const questionsWithSource = questions.map(q => ({
                        ...q,
                        source: bank.displayName
                    }));
                    allQuestions = allQuestions.concat(questionsWithSource);
                }
            }
            
            if (allQuestions.length > 0) {
                // 打乱题目顺序
                allQuestions = this.shuffleArray(allQuestions);
                
                // 加载到题库管理器
                this.questionBank.loadQuestions(allQuestions);
                this.nextQuestion();
                this.showMessage(`成功加载 ${this.selectedBanks.length} 个题库，共 ${allQuestions.length} 道题目！`, 'success');
            } else {
                this.showMessage('题库加载失败，没有找到题目！', 'error');
            }
        } catch (error) {
            this.showMessage('题库加载失败：' + error.message, 'error');
        }
    }
    
    // 打乱数组
    shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // 初始化事件监听器
    initializeEventListeners() {
        // 应用模式切换
        document.querySelectorAll('.app-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAppModeChange(e.target.id);
            });
        });
        
        // 多选题库管理
        this.initializeBankManagement();
        
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
    }
    
    // 加载内置题库
    async loadBuiltInBank() {
        const selector = document.getElementById('built-in-selector');
        const selectedBank = selector.value;
        
        if (!selectedBank) {
            this.showMessage('请先选择一个内置题库！', 'error');
            return;
        }
        
        try {
            let questions;
            if (selectedBank === 'sample') {
                // 加载示例题库
                const response = await fetch('sample-words.csv');
                const content = await response.text();
                questions = CSVParser.parseCSV(content);
            } else {
                // 清理路径，确保格式正确
                let cleanPath = selectedBank.replace(/\/+/g, '/'); // 移除重复斜杠
                if (cleanPath.startsWith('/')) {
                    cleanPath = cleanPath.substring(1); // 移除开头的斜杠
                }
                
                // 加载动态识别的CSV文件
                const response = await fetch(cleanPath);
                const content = await response.text();
                questions = CSVParser.parseCSV(content);
            }
            
            if (questions.length > 0) {
                this.questionBank.loadQuestions(questions);
                this.nextQuestion();
                this.showMessage(`题库加载成功！共${questions.length}道题目`, 'success');
            } else {
                this.showMessage('题库加载失败！', 'error');
            }
        } catch (error) {
            this.showMessage('题库加载失败：' + error.message, 'error');
        }
        
        // 初始化题库管理
        initializeBankManagement = () => {
            // 加载选中题库按钮
            document.getElementById('load-selected-banks').addEventListener('click', () => {
                this.loadSelectedBanks();
            });
            
            // 初始化题库列表
            this.loadAvailableBanks();
        }
        
        // 加载可用题库
        loadAvailableBanks = async () => {
            try {
                // 获取data目录下的所有CSV文件
                const csvFiles = await loadCSVFileList();
                
                // 添加示例题库
                this.availableBanks = [
                    { fileName: 'sample', displayName: '基础词汇 (100词)', type: 'built-in' },
                    ...csvFiles.map(file => ({
                        fileName: file.fileName,
                        displayName: file.displayName,
                        type: 'file'
                    }))
                ];
                
                this.displayAvailableBanks();
            } catch (error) {
                console.error('加载可用题库失败:', error);
                this.showMessage('加载题库列表失败', 'error');
            }
        }
        
        // 显示可用题库
        displayAvailableBanks = () => {
            const bankList = document.getElementById('bank-list');
            bankList.innerHTML = '';
            
            this.availableBanks.forEach((bank, index) => {
                const bankItem = document.createElement('div');
                bankItem.className = 'bank-item';
                bankItem.textContent = bank.displayName;
                bankItem.addEventListener('click', () => {
                    this.toggleBankSelection(index);
                });
                bankList.appendChild(bankItem);
            });
        }
        
        // 切换题库选择状态
        toggleBankSelection = (index) => {
            const bank = this.availableBanks[index];
            const bankItems = document.querySelectorAll('.bank-list .bank-item');
            const bankItem = bankItems[index];
            
            if (this.selectedBanks.find(b => b.fileName === bank.fileName)) {
                // 取消选择
                this.selectedBanks = this.selectedBanks.filter(b => b.fileName !== bank.fileName);
                bankItem.classList.remove('selected');
            } else {
                // 选择题库
                this.selectedBanks.push(bank);
                bankItem.classList.add('selected');
            }
            
            this.displaySelectedBanks();
        }
        
        // 显示已选择的题库
        displaySelectedBanks = () => {
            const selectedList = document.getElementById('selected-bank-list');
            selectedList.innerHTML = '';
            
            if (this.selectedBanks.length === 0) {
                selectedList.innerHTML = '<div style="color: #7f8c8d; text-align: center; padding: 10px;">请选择至少一个题库</div>';
                return;
            }
            
            this.selectedBanks.forEach(bank => {
                const bankItem = document.createElement('div');
                bankItem.className = 'bank-item selected';
                bankItem.textContent = bank.displayName;
                selectedList.appendChild(bankItem);
            });
        }
        
        // 加载选中的题库
        loadSelectedBanks = async () => {
            if (this.selectedBanks.length === 0) {
                this.showMessage('请至少选择一个题库！', 'error');
                return;
            }
            
            try {
                let allQuestions = [];
                
                // 加载所有选中的题库
                for (const bank of this.selectedBanks) {
                    let questions;
                    
                    if (bank.type === 'built-in' && bank.fileName === 'sample') {
                        // 加载内置示例题库
                        const response = await fetch('sample-words.csv');
                        const content = await response.text();
                        questions = CSVParser.parseCSV(content);
                    } else if (bank.type === 'file') {
                        // 加载文件题库
                        const response = await fetch(`data/${bank.fileName}`);
                        const content = await response.text();
                        questions = CSVParser.parseCSV(content);
                    }
                    
                    if (questions && questions.length > 0) {
                        // 为每个题目添加题库来源信息
                        const questionsWithSource = questions.map(q => ({
                            ...q,
                            source: bank.displayName
                        }));
                        allQuestions = allQuestions.concat(questionsWithSource);
                    }
                }
                
                if (allQuestions.length > 0) {
                    // 打乱题目顺序
                    allQuestions = this.shuffleArray(allQuestions);
                    
                    // 加载到题库管理器
                    this.questionBank.loadQuestions(allQuestions);
                    this.nextQuestion();
                    this.showMessage(`成功加载 ${this.selectedBanks.length} 个题库，共 ${allQuestions.length} 道题目！`, 'success');
                } else {
                    this.showMessage('题库加载失败，没有找到题目！', 'error');
                }
            } catch (error) {
                this.showMessage('题库加载失败：' + error.message, 'error');
            }
        }
        
        // 打乱数组
        shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
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
    
    // 处理应用模式切换
    handleAppModeChange(mode) {
        this.currentAppMode = mode;
        this.updateAppModeButtons();
        this.switchUIMode();
        
        // 重置状态
        this.isAnswerShown = false;
        this.selectedOption = null;
        this.hideAnswer();
        this.hideQuizResult();
        
        if (this.currentQuestion) {
            if (this.currentAppMode === APP_MODES.LECTURE) {
                this.displayQuestion();
            } else if (this.currentAppMode === APP_MODES.QUIZ) {
                this.displayQuizQuestion();
            }
        }
    }
    
    // 更新应用模式按钮状态
    updateAppModeButtons() {
        document.querySelectorAll('.app-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(this.currentAppMode).classList.add('active');
    }
    
    // 切换UI模式
    switchUIMode() {
        const lectureControls = document.querySelector('.lecture-controls');
        const quizControls = document.querySelector('.quiz-controls');
        
        if (this.currentAppMode === APP_MODES.LECTURE) {
            lectureControls.style.display = 'flex';
            quizControls.style.display = 'none';
        } else {
            lectureControls.style.display = 'none';
            quizControls.style.display = 'flex';
        }
    }
    
    // 处理模式切换
    handleModeChange(mode) {
        this.quizMode.setMode(mode);
        if (this.currentQuestion) {
            if (this.currentAppMode === APP_MODES.LECTURE) {
                this.displayQuestion();
            } else if (this.currentAppMode === APP_MODES.QUIZ) {
                this.displayQuizQuestion();
            }
        }
    }
    
    // 显示下一题（讲台模式）
    nextQuestion() {
        const question = this.questionBank.getRandomQuestion();
        
        if (question) {
            this.currentQuestion = question;
            this.isAnswerShown = false;
            // 重置随机模式的选择状态
            if (this.quizMode.currentMode === MODES.RANDOM) {
                this.quizMode.lastRandomQuestion = null;
            }
            this.displayQuestion();
            this.hideAnswer();
        } else {
            this.showCompletionMessage();
        }
    }
    
    // 显示答题模式题目
    displayQuizQuestion() {
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        document.getElementById('question').textContent = questionText;
        this.generateQuizOptions();
    }
    
    // 生成答题模式选项
    generateQuizOptions() {
        if (!this.currentQuestion) return;
        
        const correctAnswer = this.quizMode.getAnswerText(this.currentQuestion);
        const wrongAnswers = this.generateWrongAnswers(correctAnswer);
        
        // 合并正确和错误答案
        const allOptions = [correctAnswer, ...wrongAnswers];
        
        // 随机打乱选项顺序
        this.currentQuizOptions = this.shuffleArray(allOptions);
        
        // 显示选项
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.textContent = this.currentQuizOptions[index];
            btn.className = 'option-btn'; // 重置样式
            btn.disabled = false;
        });
        
        // 隐藏结果
        this.hideQuizResult();
    }
    
    // 生成错误答案
    generateWrongAnswers(correctAnswer) {
        const wrongAnswers = [];
        const allQuestions = this.questionBank.questions.concat(this.questionBank.answeredQuestions);
        
        // 从题库中随机选择3个不同的错误答案
        const availableAnswers = allQuestions
            .map(q => this.quizMode.getAnswerText(q))
            .filter(answer => answer !== correctAnswer);
        
        // 随机选择3个不同的错误答案
        const shuffled = this.shuffleArray([...new Set(availableAnswers)]);
        return shuffled.slice(0, 3);
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
    
    // 处理选项选择
    handleOptionSelect(index) {
        if (this.selectedOption !== null) return; // 已经选择过了
        
        this.selectedOption = index;
        const selectedAnswer = this.currentQuizOptions[index];
        const correctAnswer = this.quizMode.getAnswerText(this.currentQuestion);
        const isCorrect = selectedAnswer === correctAnswer;
        
        // 显示结果
        this.showQuizResult(isCorrect, correctAnswer);
        
        // 禁用所有选项按钮
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === document.querySelectorAll('.option-btn')[index] && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
    }
    
    // 显示答题结果
    showQuizResult(isCorrect, correctAnswer) {
        const resultElement = document.getElementById('quiz-result');
        
        if (isCorrect) {
            resultElement.textContent = '✅ 回答正确！';
            resultElement.className = 'quiz-result correct';
        } else {
            resultElement.textContent = `❌ 回答错误！正确答案是：${correctAnswer}`;
            resultElement.className = 'quiz-result incorrect';
        }
        
        resultElement.style.display = 'block';
    }
    
    // 隐藏答题结果
    hideQuizResult() {
        const resultElement = document.getElementById('quiz-result');
        resultElement.style.display = 'none';
        resultElement.className = 'quiz-result';
    }
    
    // 答题模式下一题
    nextQuizQuestion() {
        this.selectedOption = null;
        this.nextQuestion();
        if (this.currentQuestion) {
            this.displayQuizQuestion();
        }
    }
    
    // 显示题目（根据应用模式）
    displayQuestion() {
        if (this.currentAppMode === APP_MODES.LECTURE) {
            const questionText = this.quizMode.getQuestionText(this.currentQuestion);
            document.getElementById('question').textContent = questionText;
        } else if (this.currentAppMode === APP_MODES.QUIZ) {
            this.displayQuizQuestion();
        }
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
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 3秒后移除
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

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

// 添加消息样式
const messageStyles = `
.message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
}

.message.success {
    background: #27ae60;
    color: white;
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.message.error {
    background: #e74c3c;
    color: white;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// 注入样式
const styleSheet = document.createElement('style');
styleSheet.textContent = messageStyles;
document.head.appendChild(styleSheet);

// 动态加载data文件夹中的CSV文件列表
async function loadCSVFileList() {
    try {
        // 方法1：尝试获取data目录下的所有文件
        const response = await fetch('data/');
        const text = await response.text();
        
        // 解析HTML响应，提取CSV文件名
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = doc.querySelectorAll('a');
        
        const csvFiles = [];
        links.forEach(link => {
            const href = link.getAttribute('href');
            const linkText = link.textContent || '';
            if (href && href.endsWith('.csv')) {
                // 清理文件路径，避免重复的data/前缀
                let fileName = href.split('/').pop() || href;
                fileName = fileName.replace(/^data\//, ''); // 移除开头的data/
                
                // 使用链接文本作为显示名称（避免URL编码问题）
                const displayName = linkText.replace('.csv', '').replace(/（旧课标）/, '').replace(/_/g, ' ');
                csvFiles.push({
                    fileName: fileName,
                    displayName: displayName || fileName.replace('.csv', '')
                });
            }
        });
        
        return csvFiles;
    } catch (error) {
        console.log('无法自动加载CSV文件列表，尝试使用备用方法:', error);
        
        try {
            // 方法2：使用预定义的文件列表
            const response = await fetch('data/file-list.json');
            const data = await response.json();
            return data.csvFiles.map(file => ({
                fileName: file.fileName.replace(/^data\//, ''), // 清理路径
                displayName: file.displayName || file.fileName.replace('.csv', '')
            }));
        } catch (jsonError) {
            console.log('备用方法也失败，使用默认题库:', jsonError);
            
            // 方法3：返回默认的已知文件
            return [{
                fileName: '七年级到八年级上册重点单词.csv',
                displayName: '初中重点单词'
            }];
        }
    }
}

// 动态填充内置题库选择器
async function populateBuiltInSelector() {
const selector = document.getElementById('built-in-selector');

// 清空现有选项（保留第一个默认选项）
selector.innerHTML = '<option value="">选择内置题库</option>';

// 添加示例题库
const sampleOption = document.createElement('option');
sampleOption.value = 'sample';
sampleOption.textContent = '基础词汇 (100词)';
selector.appendChild(sampleOption);

// 动态加载data文件夹中的CSV文件
const csvFiles = await loadCSVFileList();

csvFiles.forEach(file => {
    const option = document.createElement('option');
    option.value = `data/${file.fileName}`;
    // 只显示友好的名称，不显示文件名（避免URL编码问题）
    option.textContent = file.displayName;
    selector.appendChild(option);
});
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    const app = new QuizApp();
    
    // 动态填充题库选择器
    await populateBuiltInSelector();
    
    // 可以在这里添加一些默认行为
    console.log('单词答题游戏已加载完成');
    
    // 添加键盘快捷键支持
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