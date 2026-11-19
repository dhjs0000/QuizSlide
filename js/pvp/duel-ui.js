// 对战页渲染：双方题目、选项、作答反馈与进度条
export default {
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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

    // 设置玩家区域激活状态
    setPlayerActive(playerNumber, isActive) {
        const playerArea = document.getElementById(`player${playerNumber}-area`);
        if (isActive) {
            playerArea.classList.add('active');
        } else {
            playerArea.classList.remove('active');
        }
    },

    // 更新玩家统计
    updatePlayerStats(playerNumber) {
        const player = playerNumber === 1 ? this.player1 : this.player2;
        
        document.getElementById(`player${playerNumber}-correct`).textContent = player.correctCount;
        document.getElementById(`player${playerNumber}-wrong`).textContent = player.wrongCount;
        document.getElementById(`player${playerNumber}-progress`).textContent = `${player.correctCount + player.wrongCount}/${this.gameState.totalRounds}`;
    },

    // 更新进度条
    updateProgressBar() {
        const progress = (this.gameState.currentRound / this.gameState.totalRounds) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    },
};
