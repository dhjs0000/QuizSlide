// 讲台 / 答题模式界面：出题、音标、选项、判题与结算
import { APP_MODES, MODES } from '../core/constants.js';
import { speechSynthesis } from '../core/speech.js';
import { phoneticConverter } from '../core/phonetic.js';

export default {
    // 显示下一题（讲台模式）
    nextQuestion() {
        const question = this.questionBank.getRandomQuestion();
        
        if (question) {
            this.currentQuestion = question;
            this.isAnswerShown = false;
            // 重置随机模式的选择状态，为新题目做准备
            this.quizMode.lastRandomQuestion = null;
            this.displayQuestion();
            this.hideAnswer();
            return true; // 表示成功获取下一题
        } else {
            this.showCompletionMessage();
            return false; // 表示没有更多题目
        }
    },

    // 显示答题模式题目
    displayQuizQuestion() {
        // 注意：不要在答题模式下重复设置随机选择，这已经在displayQuestion()中设置过了
        // 重复设置会导致题目和答案不一致
        
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        document.getElementById('question').textContent = questionText;
        
        // 显示拼音或音标
        this.displayQuestionPhonetic();
        
        this.generateQuizOptions();
        this.updateSpeakButton();
        
        // 如果启用了自动发音，延迟一段时间后自动发音题目
        if (this.speechSettings.autoSpeak && !this.speechSynthesis.isSpeaking) {
            setTimeout(() => {
                this.speakCurrentWord();
            }, 800); // 延迟800ms后自动发音题目
        }
    },

    // 显示题目拼音或音标
    displayQuestionPhonetic() {
        console.log('[DEBUG] ===== displayQuestionPhonetic() START =====');
        if (!this.currentQuestion) {
            console.log('[DEBUG] No current question in displayQuestionPhonetic');
            return;
        }
        
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        console.log(`[DEBUG] displayQuestionPhonetic - questionText: "${questionText}"`);
        
        // 获取音标容器
        const questionPhoneticContainer = document.getElementById('question-phonetic');
        
        // 清空之前的内容
        questionPhoneticContainer.innerHTML = '';
        
        // 根据当前题目显示的语言类型来决定显示拼音还是音标
        const currentLanguage = this.quizMode.getCurrentQuestionLanguage(this.currentQuestion);
        console.log(`[DEBUG] displayQuestionPhonetic - currentLanguage: "${currentLanguage}"`);
        
        if (currentLanguage === 'english') {
            // 英文显示音标 - 动态生成英式和美式音标结构
            const ipa = phoneticConverter.getIPA(questionText);
            console.log(`[DEBUG] English mode - IPA result:`, ipa);
            if (ipa && (ipa.uk || ipa.us)) {
                // 创建英式音标项
                if (ipa.uk) {
                    const ukItem = this.createPhoneticItem('英式', `[${ipa.uk}]`);
                    questionPhoneticContainer.appendChild(ukItem);
                }
                
                // 创建美式音标项
                if (ipa.us) {
                    const usItem = this.createPhoneticItem('美式', `[${ipa.us}]`);
                    questionPhoneticContainer.appendChild(usItem);
                }
            }
        } else if (currentLanguage === 'chinese') {
            // 中文显示拼音 - 动态生成拼音结构
            const pinyin = phoneticConverter.getPinyin(questionText);
            console.log(`[DEBUG] Chinese mode - Pinyin result: "${pinyin}"`);
            if (pinyin) {
                const pinyinItem = this.createPhoneticItem('', pinyin);
                questionPhoneticContainer.appendChild(pinyinItem);
            }
        }
        
        console.log('[DEBUG] ===== displayQuestionPhonetic() END =====');
    },

    // 创建音标显示项
    createPhoneticItem(label, text) {
        const item = document.createElement('div');
        item.className = 'phonetic-item';
        
        if (label) {
            const labelSpan = document.createElement('span');
            labelSpan.className = 'phonetic-label';
            labelSpan.textContent = label + ':';
            item.appendChild(labelSpan);
        }
        
        const textSpan = document.createElement('span');
        textSpan.className = 'phonetic-text';
        textSpan.textContent = text;
        item.appendChild(textSpan);
        
        return item;
    },

    // 显示答案拼音或音标
    displayAnswerPhonetic() {
        if (!this.currentQuestion) return;
        
        const answerText = this.quizMode.getAnswerText(this.currentQuestion);
        
        // 获取答案音标容器
        const answerPhoneticContainer = document.getElementById('answer-phonetic');
        
        // 清空之前的内容
        answerPhoneticContainer.innerHTML = '';
        
        // 根据文本内容判断是中文还是英文
        if (speechSynthesis.containsEnglish(answerText)) {
            // 英文显示音标 - 动态生成英式和美式音标结构
            const ipa = phoneticConverter.getIPA(answerText);
            if (ipa && (ipa.uk || ipa.us)) {
                // 创建英式音标项
                if (ipa.uk) {
                    const ukItem = this.createPhoneticItem('英式', `[${ipa.uk}]`);
                    answerPhoneticContainer.appendChild(ukItem);
                }
                
                // 创建美式音标项
                if (ipa.us) {
                    const usItem = this.createPhoneticItem('美式', `[${ipa.us}]`);
                    answerPhoneticContainer.appendChild(usItem);
                }
            }
        } else {
            // 中文显示拼音 - 动态生成拼音结构
            const pinyin = phoneticConverter.getPinyin(answerText);
            if (pinyin) {
                const pinyinItem = this.createPhoneticItem('', pinyin);
                answerPhoneticContainer.appendChild(pinyinItem);
            }
        }
    },

    // 生成答题模式选项
    generateQuizOptions() {
        if (!this.currentQuestion) return;
        
        const correctAnswer = this.quizMode.getAnswerText(this.currentQuestion);
        const wrongAnswers = this.generateWrongAnswers(correctAnswer);
        
        // 确保有3个错误答案
        const finalWrongAnswers = wrongAnswers.length >= 3 ? wrongAnswers.slice(0, 3) : wrongAnswers;
        
        // 合并正确和错误答案
        const allOptions = [correctAnswer, ...finalWrongAnswers];
        
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
    },

    // 生成错误答案
    generateWrongAnswers(correctAnswer) {
        const allQuestions = this.questionBank.questions.concat(this.questionBank.answeredQuestions);
        
        // 获取当前题目显示的语言类型
        const currentLanguage = this.quizMode.getCurrentQuestionLanguage(this.currentQuestion);
        
        // 从题库中选择与当前题目语言类型相反的错误答案
        // 如果题目是中文，选项应该是英文；如果题目是英文，选项应该是中文
        const targetLanguage = currentLanguage === 'chinese' ? 'english' : 'chinese';
        
        // 获取目标语言的所有答案（不包括正确答案）
        const targetLanguageAnswers = allQuestions
            .map(q => {
                const answerText = this.quizMode.getAnswerText(q);
                const answerLanguage = this.quizMode.getTextLanguage(answerText);
                return { text: answerText, language: answerLanguage };
            })
            .filter(item => item.language === targetLanguage && item.text !== correctAnswer)
            .map(item => item.text);
        
        // 去重
        const uniqueAnswers = [...new Set(targetLanguageAnswers)];
        
        // 随机选择3个不同的错误答案
        const shuffled = this.shuffleArray(uniqueAnswers);
        
        // 如果相反类型的错误答案不够，生成一些默认的错误答案
        if (shuffled.length < 3) {
            const defaultWrongAnswers = targetLanguage === 'chinese'
                ? ['未知答案', '暂无', '错误选项', '其他', '不适用']
                : ['Unknown answer', 'Not available', 'Wrong option', 'Other', 'Not applicable'];
            const additionalAnswers = defaultWrongAnswers.filter(ans =>
                ans !== correctAnswer && !shuffled.includes(ans)
            );
            shuffled.push(...additionalAnswers.slice(0, 3 - shuffled.length));
        }
        
        return shuffled.slice(0, 3);
    },

    // 处理选项选择
    handleOptionSelect(index) {
        if (this.selectedOption !== null) return; // 已经选择过了
        
        this.selectedOption = index;
        const selectedAnswer = this.currentQuizOptions[index];
        const correctAnswer = this.quizMode.getAnswerText(this.currentQuestion);
        const isCorrect = selectedAnswer === correctAnswer;
        
        // 显示结果
        this.showQuizResult(isCorrect, correctAnswer);
        
        // 如果启用了自动发音，发音正确答案
        if (this.speechSettings.autoSpeak) {
            setTimeout(() => {
                // 发音正确答案
                const correctText = this.quizMode.getAnswerText(this.currentQuestion);
                this.speakText(correctText);
            }, 300); // 延迟300ms后发音正确答案
        }
        
        // 禁用所有选项按钮
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === document.querySelectorAll('.option-btn')[index] && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
    },

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
    },

    // 隐藏答题结果
    hideQuizResult() {
        const resultElement = document.getElementById('quiz-result');
        resultElement.style.display = 'none';
        resultElement.className = 'quiz-result';
    },

    // 答题模式下一题
    nextQuizQuestion() {
        this.selectedOption = null;
        const hasNextQuestion = this.nextQuestion();
        if (hasNextQuestion && this.currentQuestion) {
            this.displayQuizQuestion();
        }
        // 如果nextQuestion返回false，说明已经显示完成页面，不需要额外操作
    },

    // 显示题目（根据应用模式）
    displayQuestion() {
        if (this.currentAppMode === APP_MODES.LECTURE) {
            // 对于随机模式，先确定题目类型
            if (this.quizMode.currentMode === MODES.RANDOM) {
                this.quizMode.lastRandomQuestion = Math.random() < 0.5 ? 'chinese' : 'english';
            }
            const questionText = this.quizMode.getQuestionText(this.currentQuestion);
            document.getElementById('question').textContent = questionText;
            
            // 显示拼音或音标
            this.displayQuestionPhonetic();
        } else if (this.currentAppMode === APP_MODES.QUIZ) {
            this.displayQuizQuestion();
        }
        
        // 更新发音按钮状态
        this.updateSpeakButton();
    },

    // 显示答案
    showAnswer() {
        if (this.currentQuestion && !this.isAnswerShown) {
            // 对于随机模式，确保答案与题目类型一致
            // lastRandomQuestion应该在显示题目时已经确定
            const answerText = this.quizMode.getAnswerText(this.currentQuestion);
            const answerElement = document.getElementById('answer');
            
            answerElement.textContent = answerText;
            answerElement.classList.add('show');
            answerElement.classList.remove('hidden');
            
            // 显示答案的拼音或音标
            this.displayAnswerPhonetic();
            
            this.isAnswerShown = true;
        }
    },

    // 隐藏答案
    hideAnswer() {
        const answerElement = document.getElementById('answer');
        const answerPhoneticContainer = document.getElementById('answer-phonetic');
        
        answerElement.classList.remove('show');
        answerElement.classList.add('hidden');
        answerElement.textContent = '';
        
        // 同时隐藏答案的拼音或音标
        if (answerPhoneticContainer) {
            answerPhoneticContainer.innerHTML = '';
        }
    },

    // 显示完成信息
    showCompletionMessage() {
        // 隐藏所有控制按钮和结果
        this.hideQuizResult();
        this.hideAnswer();
        
        // 显示完成消息
        document.getElementById('question').textContent = '🎉 恭喜！所有题目已完成！';
        document.getElementById('answer').textContent = '';
        
        // 隐藏控制按钮
        const lectureControls = document.querySelector('.lecture-controls');
        const quizControls = document.querySelector('.quiz-controls');
        const challengeControls = document.querySelector('.challenge-controls');
        const challengeResults = document.querySelector('.challenge-results');
        
        if (lectureControls) lectureControls.style.display = 'none';
        if (quizControls) quizControls.style.display = 'none';
        if (challengeControls) challengeControls.style.display = 'none';
        if (challengeResults) challengeResults.style.display = 'none';
        
        // 显示重置按钮
        this.showResetButton();
        
        // 显示完成提示
        this.showMessage('🎉 恭喜！所有题目已完成！', 'success');
    },

    // 显示重置按钮
    showResetButton() {
        // 创建重置按钮
        const resetButton = document.createElement('button');
        resetButton.textContent = '重新开始';
        resetButton.className = 'control-btn';
        resetButton.style.background = '#9b59b6';
        resetButton.style.color = 'white';
        resetButton.style.margin = '20px auto';
        resetButton.style.display = 'block';
        
        resetButton.addEventListener('click', () => {
            this.resetQuiz();
        });
        
        // 添加到题目区域
        const questionArea = document.querySelector('.question-area');
        if (questionArea) {
            // 移除旧的重置按钮（如果存在）
            const oldResetButton = questionArea.querySelector('.reset-button');
            if (oldResetButton) {
                oldResetButton.remove();
            }
            resetButton.className = 'control-btn reset-button';
            questionArea.appendChild(resetButton);
        }
    },

    // 重置测验
    resetQuiz() {
        // 重置题库
        this.questionBank.reset();
        
        // 重置状态
        this.isAnswerShown = false;
        this.selectedOption = null;
        this.currentQuestion = null;
        this.challengeSelectedOption = null;
        
        // 停止挑战模式
        this.challengeMode.stop();
        
        // 移除重置按钮
        const resetButton = document.querySelector('.reset-button');
        if (resetButton) {
            resetButton.remove();
        }
        
        // 隐藏所有控制界面
        const lectureControls = document.querySelector('.lecture-controls');
        const quizControls = document.querySelector('.quiz-controls');
        const challengeControls = document.querySelector('.challenge-controls');
        const challengeResults = document.querySelector('.challenge-results');
        
        if (lectureControls) lectureControls.style.display = 'none';
        if (quizControls) quizControls.style.display = 'none';
        if (challengeControls) challengeControls.style.display = 'none';
        if (challengeResults) challengeResults.style.display = 'none';
        
        // 重置应用模式为讲台模式
        this.currentAppMode = APP_MODES.LECTURE;
        this.updateAppModeButtons();
        
        // 根据当前模式显示对应的控制界面
        this.switchUIMode();
        
        // 开始新题目
        this.nextQuestion();
        
        this.showMessage('测验已重置，开始新的练习！', 'success');
    },
};
