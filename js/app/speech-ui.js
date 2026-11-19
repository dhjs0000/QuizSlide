// 发音按钮与语音设置面板
import { APP_MODES } from '../core/constants.js';

export default {
    // 发音指定文本
    speakText(text) {
        if (!text || !this.speechSynthesis.isSupported()) return;
        
        // 清理文本
        const cleanText = this.cleanTextForSpeech(text);
        if (!cleanText) return;
        
        // 判断语言
        let targetLang = 'en-US';
        if (this.containsChinese(cleanText)) {
            targetLang = 'zh-CN';
        } else if (this.containsEnglish(cleanText)) {
            targetLang = 'en-US';
        }
        
        // 创建语音合成实例
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // 设置语音属性
        if (this.speechSynthesis.currentVoice) {
            utterance.voice = this.speechSynthesis.currentVoice;
        }
        utterance.lang = targetLang;
        utterance.rate = this.speechSettings.rate;
        utterance.pitch = this.speechSettings.pitch;
        utterance.volume = this.speechSettings.volume;
        
        // 停止当前播放并开始新的朗读
        this.speechSynthesis.stop();
        this.speechSynthesis.synth.speak(utterance);
    },

    // 发音功能
    speakCurrentWord() {
        if (!this.currentQuestion) return;
        
        // 获取要发音的文本
        let textToSpeak = '';
        let targetLang = 'en-US';
        
        // 根据当前模式决定发音内容
        if (this.currentAppMode === APP_MODES.LECTURE) {
            // 讲台模式：如果显示了答案，则发音答案；否则发音题目
            if (this.isAnswerShown) {
                textToSpeak = this.quizMode.getAnswerText(this.currentQuestion);
            } else {
                // 发音当前显示的文本
                textToSpeak = this.quizMode.getQuestionText(this.currentQuestion);
            }
        } else if (this.currentAppMode === APP_MODES.QUIZ) {
            // 答题模式：发音题目
            textToSpeak = this.quizMode.getQuestionText(this.currentQuestion);
        } else if (this.currentAppMode === APP_MODES.CHALLENGE) {
            // 挑战模式：发音题目
            textToSpeak = this.quizMode.getQuestionText(this.currentQuestion);
        }
        
        // 根据文本内容判断语言
        if (this.containsChinese(textToSpeak)) {
            targetLang = 'zh-CN';
        } else if (this.containsEnglish(textToSpeak)) {
            targetLang = 'en-US';
        }
        
        // 清理文本（移除特殊字符）
        textToSpeak = this.cleanTextForSpeech(textToSpeak);
        
        if (textToSpeak && this.speechSynthesis.isSupported()) {
            // 更新按钮状态
            const speakBtn = document.getElementById('speak-btn');
            speakBtn.classList.add('speaking');
            
            // 使用自定义设置创建语音合成实例
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            
            // 设置语音属性
            if (this.speechSynthesis.currentVoice) {
                utterance.voice = this.speechSynthesis.currentVoice;
            }
            utterance.lang = targetLang;
            utterance.rate = this.speechSettings.rate;
            utterance.pitch = this.speechSettings.pitch;
            utterance.volume = this.speechSettings.volume;
            
            // 监听状态
            utterance.onstart = () => {
                this.speechSynthesis.isSpeaking = true;
            };
            
            utterance.onend = () => {
                this.speechSynthesis.isSpeaking = false;
                speakBtn.classList.remove('speaking');
            };
            
            utterance.onerror = () => {
                this.speechSynthesis.isSpeaking = false;
                speakBtn.classList.remove('speaking');
            };
            
            // 停止当前播放并开始新的朗读
            this.speechSynthesis.stop();
            this.speechSynthesis.synth.speak(utterance);
            
        } else if (!this.speechSynthesis.isSupported()) {
            this.showMessage('您的浏览器不支持语音合成功能', 'warning');
        }
    },

    // 检查文本是否包含英文
    containsEnglish(text) {
        return /[a-zA-Z]/.test(text);
    },

    // 检查文本是否包含中文
    containsChinese(text) {
        return /[\u4e00-\u9fff]/.test(text);
    },

    // 清理文本以便发音
    cleanTextForSpeech(text) {
        if (!text) return '';
        
        // 移除HTML标签
        text = text.replace(/<[^>]*>/g, '');
        
        // 扩展缩写词处理（用于发音）
        text = this.expandAbbreviationsForSpeech(text);
        
        // 移除特殊字符，但保留字母、数字、空格和基本标点
        text = text.replace(/[^\w\s.,!?()-]/g, '');
        
        // 移除多余的空格
        text = text.trim().replace(/\s+/g, ' ');
        
        return text;
    },

    // 为发音功能扩展缩写词处理
    expandAbbreviationsForSpeech(text) {
        // 处理各种形式的缩写，包括带's的情况
        const abbreviations = {
            'sb': 'somebody',
            'sth': 'something',
            'sbs': 'somebody',
            'sths': 'something'
        };
        
        let result = text;
        
        // 替换独立的缩写词
        Object.keys(abbreviations).forEach(abbr => {
            const regex = new RegExp('\\b' + abbr + '\\b', 'gi');
            result = result.replace(regex, abbreviations[abbr]);
        });
        
        // 处理带's的情况（如 somebody's, something's）
        result = result.replace(/\bsb's\b/gi, 'somebody\'s');
        result = result.replace(/\bsth's\b/gi, 'something\'s');
        
        return result;
    },

    // 更新发音按钮显示
    updateSpeakButton() {
        const speakBtn = document.getElementById('speak-btn');
        if (!speakBtn) return;
        
        // 检查是否有当前题目
        if (this.currentQuestion && this.speechSynthesis.isSupported()) {
            speakBtn.style.display = 'inline-flex';
        } else {
            speakBtn.style.display = 'none';
        }
    },

    // 语音设置相关方法
    toggleSpeechPanel() {
        const panel = document.getElementById('speech-panel');
        panel.classList.toggle('hidden');
    },

    hideSpeechPanel() {
        const panel = document.getElementById('speech-panel');
        panel.classList.add('hidden');
    },

    updateSpeechSetting(setting, value) {
        this.speechSettings[setting] = value;
        
        // 更新语音合成实例的设置
        if (setting === 'rate' || setting === 'pitch' || setting === 'volume') {
            // 这些设置将在下次发音时应用
        }
    },
};
