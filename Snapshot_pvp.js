// 双人对战模式管理器
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
            window.location.href = 'Snapshot_html.html';
        });
        
        // 应用模式切换
        document.querySelectorAll('.app-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.id !== 'pvp-mode') {
                    window.location.href = e.target.id === 'challenge-mode' ? 'Snapshot_html.html#challenge' : 'Snapshot_html.html';
                }
            });
        });
    }
    
    // 初始化题库管理
    initializeBankManagement() {
        const loadButton = document.getElementById('load-selected-banks');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                this.loadSelectedBanks();
            });
        }
        
        // 初始化题库列表
        this.loadAvailableBanks();
    }
    
    // 加载可用题库
    async loadAvailableBanks() {
        try {
            const csvFiles = await loadCSVFileList();
            
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
    displayAvailableBanks() {
        const bankList = document.getElementById('bank-list');
        if (!bankList) return;
        
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
    toggleBankSelection(index) {
        const bank = this.availableBanks[index];
        const bankItems = document.querySelectorAll('.bank-list .bank-item');
        if (index >= bankItems.length) return;
        
        const bankItem = bankItems[index];
        
        if (this.selectedBanks.find(b => b.fileName === bank.fileName)) {
            this.selectedBanks = this.selectedBanks.filter(b => b.fileName !== bank.fileName);
            bankItem.classList.remove('selected');
        } else {
            this.selectedBanks.push(bank);
            bankItem.classList.add('selected');
        }
        
        this.displaySelectedBanks();
    }
    
    // 显示已选择的题库
    displaySelectedBanks() {
        const selectedList = document.getElementById('selected-bank-list');
        if (!selectedList) return;
        
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
    async loadSelectedBanks() {
        if (this.selectedBanks.length === 0) {
            this.showMessage('请至少选择一个题库！', 'error');
            return;
        }
        
        try {
            let allQuestions = [];
            
            for (const bank of this.selectedBanks) {
                let questions;
                
                if (bank.type === 'built-in' && bank.fileName === 'sample') {
                    const response = await fetch('sample-words.csv');
                    const content = await response.text();
                    questions = CSVParser.parseCSV(content);
                } else if (bank.type === 'file') {
                    const response = await fetch(`data/${bank.fileName}`);
                    const content = await response.text();
                    questions = CSVParser.parseCSV(content);
                }
                
                if (questions && questions.length > 0) {
                    const questionsWithSource = questions.map(q => ({
                        ...q,
                        source: bank.displayName
                    }));
                    allQuestions = allQuestions.concat(questionsWithSource);
                }
            }
            
            if (allQuestions.length > 0) {
                this.questionBank = this.shuffleArray(allQuestions);
                this.showMessage(`成功加载 ${this.selectedBanks.length} 个题库，共 ${this.questionBank.length} 道题目！`, 'success');
            } else {
                this.showMessage('题库加载失败，没有找到题目！', 'error');
            }
        } catch (error) {
            this.showMessage('题库加载失败：' + error.message, 'error');
        }
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
    
    // 显示玩家题目
    displayPlayerQuestion(playerNumber) {
        const player = playerNumber === 1 ? this.player1 : this.player2;
        const questionText = this.getQuestionText(player.currentQuestion);
        
        document.getElementById(`player${playerNumber}-question`).textContent = questionText;
        
        // 生成选项
        this.generatePlayerOptions(playerNumber);
        
        // 清除之前的结果
        document.getElementById(`player${playerNumber}-result`).textContent = '';
        document.getElementById(`player${playerNumber}-result`).className = 'pvp-result';
        
        // 更新玩家统计
        this.updatePlayerStats(playerNumber);
    }
    
    // 获取题目文本
    getQuestionText(question) {
        switch (this.gameState.questionMode) {
            case 'chinese-to-english':
                return question.chinese;
            case 'english-to-chinese':
                return question.english;
            case 'random':
                return Math.random() < 0.5 ? question.chinese : question.english;
            default:
                return question.chinese;
        }
    }
    
    // 获取答案文本
    getAnswerText(question) {
        switch (this.gameState.questionMode) {
            case 'chinese-to-english':
                return question.english;
            case 'english-to-chinese':
                return question.chinese;
            case 'random':
                // 对于随机模式，需要根据题目类型返回对应答案
                const questionText = this.getQuestionText(question);
                return questionText === question.chinese ? question.english : question.chinese;
            default:
                return question.english;
        }
    }
    
    // 生成玩家选项
    generatePlayerOptions(playerNumber) {
        const player = playerNumber === 1 ? this.player1 : this.player2;
        const correctAnswer = this.getAnswerText(player.currentQuestion);
        
        // 生成错误答案
        const wrongAnswers = this.generateWrongAnswers(correctAnswer, player.currentQuestion);
        
        // 合并正确和错误答案
        const allOptions = [correctAnswer, ...wrongAnswers];
        
        // 随机打乱选项顺序
        player.currentOptions = this.shuffleArray(allOptions);
        
        // 显示选项
        const optionButtons = document.querySelectorAll(`#player${playerNumber}-options .pvp-option-btn`);
        optionButtons.forEach((btn, index) => {
            btn.textContent = player.currentOptions[index];
            btn.className = 'pvp-option-btn';
            btn.disabled = false;
        });
    }
    
    // 生成错误答案
    generateWrongAnswers(correctAnswer, currentQuestion) {
        const allQuestions = this.gameState.allQuestions;
        const wrongAnswers = [];
        
        // 从其他题目中获取错误答案
        for (const question of allQuestions) {
            if (question === currentQuestion) continue;
            
            const wrongAnswer = this.getAnswerText(question);
            if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
            
            if (wrongAnswers.length >= 3) break;
        }
        
        // 如果错误答案不够，生成默认错误答案
        if (wrongAnswers.length < 3) {
            const defaultWrongAnswers = this.containsChinese(correctAnswer) 
                ? ['未知答案', '暂无', '错误选项', '其他']
                : ['Unknown answer', 'Not available', 'Wrong option', 'Other'];
            
            for (const wrongAnswer of defaultWrongAnswers) {
                if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                    wrongAnswers.push(wrongAnswer);
                }
                if (wrongAnswers.length >= 3) break;
            }
        }
        
        return wrongAnswers.slice(0, 3);
    }
    
    // 处理玩家答题
    handlePlayerAnswer(playerNumber, optionIndex) {
        const player = playerNumber === 1 ? this.player1 : this.player2;
        
        if (player.hasAnswered) return; // 已经答过题了
        
        player.hasAnswered = true;
        player.selectedAnswer = optionIndex;
        
        const selectedAnswer = player.currentOptions[optionIndex];
        const correctAnswer = this.getAnswerText(player.currentQuestion);
        const isCorrect = selectedAnswer === correctAnswer;
        
        // 更新分数和统计
        if (isCorrect) {
            player.score += 3;
            player.correctCount++;
        } else {
            player.score = Math.max(0, player.score - 1); // 答错扣1分
            player.wrongCount++;
        }
        
        // 显示结果
        this.showPlayerResult(playerNumber, isCorrect, correctAnswer);
        
        // 禁用选项按钮
        this.disablePlayerOptions(playerNumber, isCorrect, correctAnswer);
        
        // 更新玩家统计
        this.updatePlayerStats(playerNumber);
        
        // 检查是否两个玩家都答完了
        if (this.player1.hasAnswered && this.player2.hasAnswered) {
            // 如果设置了自动切换时间，则在指定时间后自动进入下一轮
            if (this.gameState.autoSwitchTime > 0) {
                this.gameState.autoSwitchTimer = setTimeout(() => {
                    this.nextRound();
                }, this.gameState.autoSwitchTime * 1000);
            } else {
                // 手动模式，显示下一轮按钮
                setTimeout(() => {
                    document.getElementById('next-pvp-round').style.display = 'inline-block';
                }, 1500);
            }
        }
    }
    
    // 显示玩家结果
    showPlayerResult(playerNumber, isCorrect, correctAnswer) {
        const resultElement = document.getElementById(`player${playerNumber}-result`);
        
        if (isCorrect) {
            resultElement.textContent = '✅ 回答正确！+3分';
            resultElement.className = 'pvp-result correct';
        } else {
            resultElement.textContent = `❌ 回答错误！-1分，正确答案是：${correctAnswer}`;
            resultElement.className = 'pvp-result incorrect';
        }
        
        // 更新分数显示
        document.getElementById(`player${playerNumber}-score`).textContent = playerNumber === 1 ? this.player1.score : this.player2.score;
    }
    
    // 禁用玩家选项
    disablePlayerOptions(playerNumber, isCorrect, correctAnswer) {
        const optionButtons = document.querySelectorAll(`#player${playerNumber}-options .pvp-option-btn`);
        
        optionButtons.forEach((btn, index) => {
            btn.disabled = true;
            
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (index === (playerNumber === 1 ? this.player1.selectedAnswer : this.player2.selectedAnswer) && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // 设置玩家区域为非激活状态
        this.setPlayerActive(playerNumber, false);
    }
    
    // 设置玩家区域激活状态
    setPlayerActive(playerNumber, isActive) {
        const playerArea = document.getElementById(`player${playerNumber}-area`);
        if (isActive) {
            playerArea.classList.add('active');
        } else {
            playerArea.classList.remove('active');
        }
    }
    
    // 更新玩家统计
    updatePlayerStats(playerNumber) {
        const player = playerNumber === 1 ? this.player1 : this.player2;
        
        document.getElementById(`player${playerNumber}-correct`).textContent = player.correctCount;
        document.getElementById(`player${playerNumber}-wrong`).textContent = player.wrongCount;
        document.getElementById(`player${playerNumber}-progress`).textContent = `${player.correctCount + player.wrongCount}/${this.gameState.totalRounds}`;
    }
    
    // 更新进度条
    updateProgressBar() {
        const progress = (this.gameState.currentRound / this.gameState.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
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
    
    showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

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

// 显示消息函数
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

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

.message.warning {
    background: #f39c12;
    color: white;
    box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const pvpDuel = new PVPDuelMode();
    
    console.log('双人对战模式已加载完成');
});