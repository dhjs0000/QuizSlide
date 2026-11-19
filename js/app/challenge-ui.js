// 挑战模式界面：设置、计时、逐题作答与结果页
import { APP_MODES, MODES } from '../core/constants.js';

export default {
    // 开始挑战模式
    startChallengeMode() {
        this.currentAppMode = APP_MODES.CHALLENGE;
        this.updateAppModeButtons();
        this.switchUIMode();

        // 结束上一次可能仍在进行的挑战
        this.stopChallengeMode();

        // 移除"全部完成"留下的重新开始按钮
        const resetButton = document.querySelector('.reset-button');
        if (resetButton) resetButton.remove();

        // 显示挑战模式选择界面
        this.showChallengeModeSelection();

        // 重置挑战模式状态
        this.challengeSelectedOption = null;
        this.challengeCurrentOptions = [];

        // 清理挑战模式界面状态
        this.clearChallengeInterface();

        // 统计栏显示题库真实进度
        this.syncStatsFromBank();
    },

    // 清理挑战模式界面状态
    clearChallengeInterface() {
        // 清理计时器和分数显示
        const timerElement = document.getElementById('challenge-time');
        const scoreElement = document.getElementById('challenge-score');
        if (timerElement) timerElement.textContent = '00:00';
        if (scoreElement) scoreElement.textContent = '0';

        // 清理选项按钮
        const optionButtons = document.querySelectorAll('#challenge-option-a, #challenge-option-b, #challenge-option-c, #challenge-option-d');
        optionButtons.forEach(btn => {
            btn.textContent = '';
            btn.className = 'option-btn';
            btn.disabled = false;
            btn.style.display = 'flex';
        });

        // 清理结果显示
        const resultElement = document.getElementById('challenge-result');
        if (resultElement) {
            resultElement.textContent = '';
            resultElement.style.display = 'none';
            resultElement.className = 'quiz-result';
        }

        // 清理题目、答案以及上一个词残留的拼音 / 音标
        document.getElementById('question').textContent = '在下方选择题库后开始答题';
        document.getElementById('question-phonetic').innerHTML = '';

        const answerElement = document.getElementById('answer');
        answerElement.textContent = '';
        answerElement.classList.remove('show');
        answerElement.classList.add('hidden');
        document.getElementById('answer-phonetic').innerHTML = '';

        const speakButton = document.getElementById('speak-btn');
        if (speakButton) speakButton.style.display = 'none';

        // 同步讲台 / 答题模式的状态标记
        this.isAnswerShown = false;
        this.selectedOption = null;
        this.hideQuizResult();
    },

    // 处理挑战模式选择
    handleChallengeModeSelect(mode) {
        // 将挑战模式的mode转换为标准的mode格式
        let standardMode;
        switch (mode) {
            case 'chinese-to-english':
                standardMode = MODES.CHINESE_TO_ENGLISH;
                break;
            case 'english-to-chinese':
                standardMode = MODES.ENGLISH_TO_CHINESE;
                break;
            case 'random':
                standardMode = MODES.RANDOM;
                break;
            default:
                standardMode = MODES.CHINESE_TO_ENGLISH;
        }
        
        // 获取自定义题数
        const questionCountInput = document.getElementById('challenge-question-count');
        const targetQuestionCount = parseInt(questionCountInput.value) || 20;
        
        // 验证题数范围
        if (targetQuestionCount < 5 || targetQuestionCount > 100) {
            this.showMessage('题目数量必须在5-100之间！', 'warning');
            return;
        }
        
        this.challengeMode.currentChallengeMode = standardMode;
        this.challengeMode.start(targetQuestionCount);
        
        // 隐藏选择界面，显示答题界面
        this.hideChallengeModeSelection();
        this.showChallengeQuizInterface();
        
        // 延迟开始第一题，确保界面完全切换
        setTimeout(() => {
            this.nextChallengeQuestion();
        }, 100);
    },

    // 显示挑战模式选择界面
    showChallengeModeSelection() {
        const selectionElement = document.querySelector('.challenge-mode-selection');
        const quizInterface = document.querySelector('.challenge-quiz-interface');
        
        if (selectionElement) selectionElement.style.display = 'block';
        if (quizInterface) quizInterface.style.display = 'none';
    },

    // 隐藏挑战模式选择界面
    hideChallengeModeSelection() {
        const selectionElement = document.querySelector('.challenge-mode-selection');
        const quizInterface = document.querySelector('.challenge-quiz-interface');
        
        if (selectionElement) selectionElement.style.display = 'none';
        if (quizInterface) quizInterface.style.display = 'block';
    },

    // 显示挑战模式答题界面
    showChallengeQuizInterface() {
        // 更新模式显示
        this.quizMode.setMode(this.challengeMode.currentChallengeMode);
        
        // 更新统计信息，显示目标题数
        const answeredCountElement = document.getElementById('answered-count');
        const remainingCountElement = document.getElementById('remaining-count');
        
        if (answeredCountElement) {
            answeredCountElement.textContent = '0';
        }
        
        if (remainingCountElement) {
            remainingCountElement.textContent = this.challengeMode.targetQuestionCount;
        }
    },

    // 挑战模式下一题
    nextChallengeQuestion() {
        // 当前题还没作答时忽略重复触发：自动跳题计时器与手动点击可能撞车，否则会一次跳过两道题
        if (this.challengeMode.isActive
            && this.challengeMode.totalQuestions > 0
            && this.challengeSelectedOption === null) {
            return;
        }

        this.challengeSelectedOption = null;
        
        // 清理上一题的状态
        this.clearPreviousChallengeQuestion();
        
        // 检查是否已达到目标题数
        if (this.challengeMode.totalQuestions >= this.challengeMode.targetQuestionCount) {
            // 挑战结束，显示结果
            this.showChallengeResults();
            return;
        }
        
        const hasNextQuestion = this.nextQuestion();
        
        if (hasNextQuestion && this.currentQuestion) {
            // 立即显示下一题，不延迟
            // 确保随机模式的题目和答案选择一致
            this.displayChallengeQuestion();
        } else {
            // 题库用完，挑战结束，显示结果
            this.showChallengeResults();
        }
    },

    // 清理上一题的挑战模式状态
    clearPreviousChallengeQuestion() {
        // 停止自动下一题的定时器（如果存在）
        if (this.autoNextTimer) {
            clearTimeout(this.autoNextTimer);
            this.autoNextTimer = null;
        }
        
        // 清理选项按钮状态
        const optionButtons = document.querySelectorAll('#challenge-option-a, #challenge-option-b, #challenge-option-c, #challenge-option-d');
        optionButtons.forEach(btn => {
            btn.className = 'option-btn';
            btn.disabled = false;
            btn.style.display = 'flex'; // 确保按钮可见
        });
        
        // 隐藏结果
        const resultElement = document.getElementById('challenge-result');
        if (resultElement) {
            resultElement.textContent = '';
            resultElement.style.display = 'none';
            resultElement.className = 'quiz-result';
        }
    },

    // 显示挑战模式题目
    displayChallengeQuestion() {
        console.log('[DEBUG] ===== displayChallengeQuestion() START =====');
        if (!this.currentQuestion) {
            console.log('[DEBUG] No current question, returning');
            return;
        }
        
        console.log(`[DEBUG] Challenge mode display, currentMode: ${this.quizMode.currentMode}`);
        console.log(`[DEBUG] lastRandomQuestion before getQuestionText: ${this.quizMode.lastRandomQuestion}`);
        
        // 注意：不要在挑战模式下重复设置随机选择，这已经在displayQuestion()中设置过了
        // 重复设置会导致题目和答案不一致
        
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        console.log(`[DEBUG] Question text from getQuestionText: "${questionText}"`);
        document.getElementById('question').textContent = questionText;
        
        // 作答之前不允许手动跳到下一题
        const nextButton = document.getElementById('next-challenge-question');
        if (nextButton) nextButton.disabled = true;
        
        // 显示拼音或音标
        this.displayQuestionPhonetic();
        
        // 确保选项生成完成后再显示
        this.generateChallengeOptions();
        
        // 更新发音按钮状态
        this.updateSpeakButton();
        
        // 如果启用了自动发音，延迟一段时间后自动发音题目
        if (this.speechSettings.autoSpeak && !this.speechSynthesis.isSpeaking) {
            setTimeout(() => {
                this.speakCurrentWord();
            }, 800); // 延迟800ms后自动发音题目
        }
        
        console.log('[DEBUG] ===== displayChallengeQuestion() END =====');
    },

    // 生成挑战模式选项
    generateChallengeOptions() {
        if (!this.currentQuestion) return;
        
        // 获取正确答案（此时lastRandomQuestion已经确定，不会变化）
        const correctAnswer = this.quizMode.getAnswerText(this.currentQuestion);
        const wrongAnswers = this.generateWrongAnswers(correctAnswer);
        
        // 确保有足够多的错误答案
        if (wrongAnswers.length < 3) {
            // 如果题库中的错误答案不够，生成一些默认的错误答案
            const currentLanguage = this.quizMode.getCurrentQuestionLanguage(this.currentQuestion);
            const targetLanguage = currentLanguage === 'chinese' ? 'english' : 'chinese';
            const defaultWrongAnswers = targetLanguage === 'chinese'
                ? ['未知答案', '暂无', '错误选项', '其他', '不适用']
                : ['Unknown answer', 'Not available', 'Wrong option', 'Other', 'Not applicable'];
            const additionalAnswers = defaultWrongAnswers.filter(ans =>
                ans !== correctAnswer && !wrongAnswers.includes(ans)
            );
            wrongAnswers.push(...additionalAnswers.slice(0, 3 - wrongAnswers.length));
        }
        
        // 确保有3个错误答案，合并正确和错误答案
        const finalWrongAnswers = wrongAnswers.length >= 3 ? wrongAnswers.slice(0, 3) : wrongAnswers;
        const allOptions = [correctAnswer, ...finalWrongAnswers];
        
        // 随机打乱选项顺序
        this.challengeCurrentOptions = this.shuffleArray(allOptions);
        
        // 显示选项
        const optionButtons = document.querySelectorAll('#challenge-option-a, #challenge-option-b, #challenge-option-c, #challenge-option-d');
        optionButtons.forEach((btn, index) => {
            if (this.challengeCurrentOptions[index]) {
                btn.textContent = this.challengeCurrentOptions[index];
                btn.className = 'option-btn'; // 重置样式
                btn.disabled = false;
                btn.style.display = 'flex'; // 确保按钮可见
            } else {
                btn.style.display = 'none'; // 隐藏没有内容的按钮
            }
        });
        
        // 隐藏结果
        const resultElement = document.getElementById('challenge-result');
        if (resultElement) {
            resultElement.textContent = '';
            resultElement.style.display = 'none';
            resultElement.className = 'quiz-result';
        }
    },

    // 处理挑战模式选项选择
    handleChallengeOptionSelect(index) {
        if (this.challengeSelectedOption !== null) return; // 已经选择过了
        
        this.challengeSelectedOption = index;
        const selectedAnswer = this.challengeCurrentOptions[index];
        const correctAnswer = this.quizMode.getAnswerText(this.currentQuestion);
        const isCorrect = selectedAnswer === correctAnswer;
        
        // 记录答题结果
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        this.challengeMode.recordQuestion(questionText, selectedAnswer, correctAnswer, isCorrect);
        this.challengeMode.updateScore(isCorrect);
        
        // 作答后允许进入下一题
        const nextButton = document.getElementById('next-challenge-question');
        if (nextButton) nextButton.disabled = false;
        
        // 显示结果
        this.showChallengeResult(isCorrect, correctAnswer);
        
        // 禁用所有选项按钮
        const optionButtons = document.querySelectorAll('#challenge-option-a, #challenge-option-b, #challenge-option-c, #challenge-option-d');
        optionButtons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === optionButtons[index] && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // 根据设置的时间自动进入下一题
        // 用计时器身份 + 题目引用做双重校验，避免手动点"下一题"后旧计时器又把题跳过去
        if (this.autoSwitchTime > 0) {
            const askedQuestion = this.currentQuestion;
            const timer = setTimeout(() => {
                if (this.autoNextTimer !== timer) return;
                this.autoNextTimer = null;
                if (this.currentAppMode === APP_MODES.CHALLENGE
                    && this.challengeMode.isActive
                    && this.currentQuestion === askedQuestion) {
                    this.nextChallengeQuestion();
                }
            }, this.autoSwitchTime * 1000);
            this.autoNextTimer = timer;
        }
    },

    // 显示挑战模式结果
    showChallengeResult(isCorrect, correctAnswer) {
        const resultElement = document.getElementById('challenge-result');
        
        if (isCorrect) {
            resultElement.textContent = '✅ 回答正确！+3分';
            resultElement.className = 'quiz-result correct';
        } else {
            resultElement.textContent = `❌ 回答错误！-2分，正确答案是：${correctAnswer}`;
            resultElement.className = 'quiz-result incorrect';
        }
        
        resultElement.style.display = 'block';
        
        // 如果启用了自动发音，发音正确答案
        if (this.speechSettings.autoSpeak) {
            setTimeout(() => {
                const correctText = this.quizMode.getAnswerText(this.currentQuestion);
                this.speakText(correctText);
            }, 300); // 延迟300ms后发音正确答案
        }
    },

    // 显示挑战模式最终结果
    showChallengeResults() {
        // 结束挑战：停表并清掉可能还在排队的自动跳题计时器
        this.stopChallengeMode();
        
        const results = this.challengeMode.getResults();
        
        // 隐藏答题界面
        document.querySelector('.challenge-controls').style.display = 'none';
        
        // 显示结果界面
        document.querySelector('.challenge-results').style.display = 'block';
        
        // 填充结果数据
        const minutes = Math.floor(results.totalTime / 60);
        const seconds = results.totalTime % 60;
        document.getElementById('total-time').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('final-score').textContent = results.score;
        document.getElementById('accuracy').textContent = `${results.accuracy.toFixed(1)}%`;
        document.getElementById('ability-score').textContent = results.abilityScore;
        
        // 在结果显示中添加目标题数信息（重复进入结果页时复用同一节点，避免叠加）
        const resultsSummary = document.querySelector('.results-summary');
        let targetCountItem = document.getElementById('challenge-target-count');
        if (!targetCountItem) {
            targetCountItem = document.createElement('div');
            targetCountItem.id = 'challenge-target-count';
            targetCountItem.className = 'result-item';
            targetCountItem.innerHTML = '<span>目标题数:</span><span></span>';
            resultsSummary.insertBefore(targetCountItem, resultsSummary.firstChild);
        }
        targetCountItem.lastElementChild.textContent = this.challengeMode.targetQuestionCount;
        
        // 显示错题和正确题
        this.displayChallengeQuestionResults(results);
    },

    // 显示挑战模式题目结果
    displayChallengeQuestionResults(results) {
        const wrongList = document.getElementById('wrong-list');
        const correctList = document.getElementById('correct-list');
        
        wrongList.innerHTML = '';
        correctList.innerHTML = '';
        
        // 显示错题（置顶）
        if (results.wrongQuestions.length > 0) {
            results.wrongQuestions.forEach((item, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'result-question wrong';
                questionDiv.innerHTML = `
                    <div class="question-text">${item.question}</div>
                    <div class="answer-comparison">
                        <span class="user-answer">你的答案: ${item.userAnswer}</span>
                        <span class="correct-answer">正确答案: ${item.correctAnswer}</span>
                    </div>
                `;
                wrongList.appendChild(questionDiv);
            });
        } else {
            wrongList.innerHTML = '<div class="no-questions">没有错题，太棒了！</div>';
        }
        
        // 显示正确题
        if (results.correctQuestions.length > 0) {
            results.correctQuestions.forEach((item, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'result-question correct';
                questionDiv.innerHTML = `
                    <div class="question-text">${item.question}</div>
                    <div class="answer-text">答案: ${item.correctAnswer}</div>
                `;
                correctList.appendChild(questionDiv);
            });
        } else {
            correctList.innerHTML = '<div class="no-questions">没有答对的题目</div>';
        }
    },

    // 重新开始挑战
    restartChallenge() {
        // 隐藏结果界面
        document.querySelector('.challenge-results').style.display = 'none';

        // 重置题库
        this.questionBank.reset();
        
        // 重置状态
        this.currentQuestion = null;
        this.challengeSelectedOption = null;
        
        // 重新开始挑战模式
        this.startChallengeMode();
    },
};
