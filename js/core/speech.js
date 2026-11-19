// 浏览器语音合成封装：优先选英文女声，按中英文自动切换朗读语言
// 语音合成模块
export class SpeechSynthesis {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isSpeaking = false;
        
        this.initializeVoices();
    }
    
    // 初始化语音列表
    initializeVoices() {
        if (this.synth) {
            this.loadVoices();
            // 监听语音列表变化（某些浏览器需要延迟加载）
            this.synth.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }
    
    // 加载可用的语音
    loadVoices() {
        this.voices = this.synth.getVoices();
        // 优先选择英文语音
        this.currentVoice = this.voices.find(voice=>
            voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
        ) || this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
    }
    
    // 检查文本是否包含中文
    containsChinese(text) {
        return /[\u4e00-\u9fff]/.test(text);
    }
    
    // 检查文本是否包含英文
    containsEnglish(text) {
        return /[a-zA-Z]/.test(text);
    }
    
    // 朗读文本
    speak(text) {
        if (!this.synth || !text) return;
        
        // 停止当前播放
        this.stop();
        
        // 创建语音合成实例
        const utterance = new SpeechSynthesisUtterance(text);
        
        // 设置语音属性
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        
        // 根据文本内容判断语言
        if (this.containsChinese(text)) {
            utterance.lang = 'zh-CN'; // 中文
        } else if (this.containsEnglish(text)) {
            utterance.lang = 'en-US'; // 英文
        } else {
            utterance.lang = 'en-US'; // 默认英文
        }
        
        utterance.rate = 0.8; // 语速稍慢，便于学习
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // 监听状态
        utterance.onstart = () => {
            this.isSpeaking = true;
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
        };
        
        utterance.onerror = () => {
            this.isSpeaking = false;
        };
        
        // 开始朗读
        this.synth.speak(utterance);
    }
    
    // 停止朗读
    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.isSpeaking = false;
        }
    }
    
    // 获取可用的语音列表
    getVoices() {
        return this.voices;
    }
    
    // 设置语音
    setVoice(voice) {
        this.currentVoice = voice;
    }
    
    // 检查是否支持语音合成
    isSupported() {
        return 'speechSynthesis' in window;
    }
}

// 创建全局语音合成实例
export const speechSynthesis = new SpeechSynthesis();
