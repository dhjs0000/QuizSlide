// 讲台 / 答题 / 挑战三种应用模式的切换与界面显隐
import { APP_MODES } from '../core/constants.js';

export default {
    // 处理应用模式切换
    handleAppModeChange(mode) {
        // 如果切换到挑战模式，需要特殊处理
        if (mode === APP_MODES.CHALLENGE) {
            this.startChallengeMode();
            return;
        }

        // 离开挑战模式：停止计时器和自动跳题，清掉挑战残留状态
        if (this.currentAppMode === APP_MODES.CHALLENGE) {
            this.stopChallengeMode();
        }

        // 离开"题目已全部完成"状态时，移除动态添加的重新开始按钮
        const resetButton = document.querySelector('.reset-button');
        if (resetButton) resetButton.remove();

        this.currentAppMode = mode;
        this.updateAppModeButtons();
        this.switchUIMode();

        // 重置状态
        this.isAnswerShown = false;
        this.selectedOption = null;
        this.hideAnswer();
        this.hideQuizResult();

        // 挑战模式会临时改写统计栏，切回后还原为题库真实进度
        this.syncStatsFromBank();

        if (this.currentQuestion) {
            if (this.currentAppMode === APP_MODES.LECTURE) {
                this.displayQuestion();
            } else if (this.currentAppMode === APP_MODES.QUIZ) {
                this.displayQuizQuestion();
            }
        }
    },

    // 结束进行中的挑战（切换模式或离开挑战时调用）
    stopChallengeMode() {
        this.challengeMode.stop();

        if (this.autoNextTimer) {
            clearTimeout(this.autoNextTimer);
            this.autoNextTimer = null;
        }

        this.challengeSelectedOption = null;
        this.challengeCurrentOptions = [];
    },

    // 统计栏回到题库真实进度
    syncStatsFromBank() {
        const answeredCountElement = document.getElementById('answered-count');
        const remainingCountElement = document.getElementById('remaining-count');

        if (answeredCountElement) {
            answeredCountElement.textContent = this.questionBank.answeredQuestions.length;
        }
        if (remainingCountElement) {
            remainingCountElement.textContent = this.questionBank.questions.length;
        }
    },

    // 更新应用模式按钮状态
    updateAppModeButtons() {
        document.querySelectorAll('.app-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(this.currentAppMode).classList.add('active');
    },

    // 切换UI模式
    switchUIMode() {
        const lectureControls = document.querySelector('.lecture-controls');
        const quizControls = document.querySelector('.quiz-controls');
        const challengeControls = document.querySelector('.challenge-controls');
        const challengeResults = document.querySelector('.challenge-results');
        const regularModeSelector = document.querySelector('#regular-mode-selector');
        
        // 隐藏所有控制界面
        if (lectureControls) lectureControls.style.display = 'none';
        if (quizControls) quizControls.style.display = 'none';
        if (challengeControls) challengeControls.style.display = 'none';
        if (challengeResults) challengeResults.style.display = 'none';
        
        // 显示/隐藏模式选择器
        if (regularModeSelector) {
            if (this.currentAppMode === APP_MODES.CHALLENGE) {
                regularModeSelector.style.display = 'none';
            } else {
                regularModeSelector.style.display = 'flex';
            }
        }
        
        // 显示对应的控制界面
        if (this.currentAppMode === APP_MODES.LECTURE) {
            if (lectureControls) lectureControls.style.display = 'flex';
        } else if (this.currentAppMode === APP_MODES.QUIZ) {
            if (quizControls) quizControls.style.display = 'flex';
        } else if (this.currentAppMode === APP_MODES.CHALLENGE) {
            if (challengeControls) challengeControls.style.display = 'flex';
            // 显示模式选择界面，隐藏答题界面
            this.showChallengeModeSelection();
        }
    },

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
    },
};
