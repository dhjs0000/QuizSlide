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
    QUIZ: 'quiz-mode',
    CHALLENGE: 'challenge-mode'
};

// 答题模式定义
const MODES = {
    CHINESE_TO_ENGLISH: 'chinese-to-english',
    ENGLISH_TO_CHINESE: 'english-to-chinese',
    RANDOM: 'random-mode'
};

// 语音合成模块
class SpeechSynthesis {
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
const speechSynthesis = new SpeechSynthesis();

// 拼音和音标转换模块
class PhoneticConverter {
    constructor() {
        // 简单的英文音标映射表（常用的单词）
        this.ipaDict = {
            // 基础词汇
            'hello': 'həˈloʊ',
            'world': 'wɜrld',
            'apple': 'ˈæpl',
            'book': 'bʊk',
            'cat': 'kæt',
            'dog': 'dɔg',
            'house': 'haʊs',
            'water': 'ˈwɔtər',
            'food': 'fud',
            'good': 'gʊd',
            'bad': 'bæd',
            'big': 'bɪg',
            'small': 'smɔl',
            'happy': 'ˈhæpi',
            'sad': 'sæd',
            'love': 'lʌv',
            'hate': 'heɪt',
            'friend': 'frɛnd',
            'family': 'ˈfæməli',
            'school': 'skul',
            'teacher': 'ˈtitʃər',
            'student': 'ˈstudənt',
            'learn': 'lɜrn',
            'study': 'ˈstʌdi',
            'read': 'rid',
            'write': 'raɪt',
            'speak': 'spik',
            'listen': 'ˈlɪsən',
            'understand': 'ˌʌndərˈstænd',
            'know': 'noʊ',
            'think': 'θɪŋk',
            'remember': 'rɪˈmɛmbər',
            'forget': 'fərˈgɛt',
            'time': 'taɪm',
            'day': 'deɪ',
            'night': 'naɪt',
            'morning': 'ˈmɔrnɪŋ',
            'afternoon': 'ˌæftərˈnun',
            'evening': 'ˈivnɪŋ',
            'week': 'wik',
            'month': 'mʌnθ',
            'year': 'jɪr',
            'today': 'təˈdeɪ',
            'tomorrow': 'təˈmɔroʊ',
            'yesterday': 'ˈjɛstərˌdeɪ',
            'color': 'ˈkʌlər',
            'red': 'rɛd',
            'blue': 'blu',
            'green': 'grin',
            'yellow': 'ˈjɛloʊ',
            'black': 'blæk',
            'white': 'waɪt',
            'number': 'ˈnʌmbər',
            'one': 'wʌn',
            'two': 'tu',
            'three': 'θri',
            'four': 'fɔr',
            'five': 'faɪv',
            'six': 'sɪks',
            'seven': 'ˈsɛvən',
            'eight': 'eɪt',
            'nine': 'naɪn',
            'ten': 'tɛn',
            'country': 'ˈkʌntri',
            'city': 'ˈsɪti',
            'people': 'ˈpipəl',
            'person': 'ˈpɜrsən',
            'man': 'mæn',
            'woman': 'ˈwʊmən',
            'child': 'tʃaɪld',
            'children': 'ˈtʃɪldrən',
            'father': 'ˈfɑðər',
            'mother': 'ˈmʌðər',
            'brother': 'ˈbrʌðər',
            'sister': 'ˈsɪstər',
            'work': 'wɜrk',
            'job': 'dʒɑb',
            'money': 'ˈmʌni',
            'buy': 'baɪ',
            'sell': 'sɛl',
            'pay': 'peɪ',
            'price': 'praɪs',
            'cheap': 'tʃip',
            'expensive': 'ɪkˈspɛnsɪv',
            'free': 'fri',
            'help': 'hɛlp',
            'need': 'nid',
            'want': 'wɑnt',
            'like': 'laɪk',
            'love': 'lʌv',
            'enjoy': 'ɪnˈdʒɔɪ',
            'hate': 'heɪt',
            'live': 'lɪv',
            'life': 'laɪf',
            'die': 'daɪ',
            'death': 'dɛθ',
            'health': 'hɛlθ',
            'healthy': 'ˈhɛlθi',
            'sick': 'sɪk',
            'doctor': 'ˈdɑktər',
            'hospital': 'ˈhɑspɪtl',
            'medicine': 'ˈmɛdɪsɪn',
            'food': 'fud',
            'water': 'ˈwɔtər',
            'eat': 'it',
            'drink': 'drɪŋk',
            'hungry': 'ˈhʌŋgri',
            'thirsty': 'ˈθɜrsti',
            'house': 'haʊs',
            'home': 'hoʊm',
            'room': 'rum',
            'kitchen': 'ˈkɪtʃən',
            'bedroom': 'ˈbɛdrum',
            'bathroom': 'ˈbæθrum',
            'table': 'ˈteɪbəl',
            'chair': 'tʃɛr',
            'bed': 'bɛd',
            'door': 'dɔr',
            'window': 'ˈwɪndoʊ',
            'car': 'kɑr',
            'bus': 'bʌs',
            'train': 'treɪn',
            'plane': 'pleɪn',
            'ship': 'ʃɪp',
            'walk': 'wɔk',
            'run': 'rʌn',
            'jump': 'dʒʌmp',
            'swim': 'swɪm',
            'drive': 'draɪv',
            'fly': 'flaɪ',
            'travel': 'ˈtrævəl',
            'trip': 'trɪp',
            'journey': 'ˈdʒɜrni',
            'road': 'roʊd',
            'street': 'strit',
            'bridge': 'brɪdʒ',
            'river': 'ˈrɪvər',
            'mountain': 'ˈmaʊntən',
            'hill': 'hɪl',
            'forest': 'ˈfɔrəst',
            'tree': 'tri',
            'flower': 'ˈflaʊər',
            'grass': 'græs',
            'sun': 'sʌn',
            'moon': 'mun',
            'star': 'stɑr',
            'sky': 'skaɪ',
            'cloud': 'klaʊd',
            'rain': 'reɪn',
            'snow': 'snoʊ',
            'wind': 'wɪnd',
            'storm': 'stɔrm',
            'weather': 'ˈwɛðər',
            'hot': 'hɑt',
            'cold': 'koʊld',
            'warm': 'wɔrm',
            'cool': 'kul',
            'spring': 'sprɪŋ',
            'summer': 'ˈsʌmər',
            'autumn': 'ˈɔtəm',
            'winter': 'ˈwɪntər',
            'January': 'ˈdʒænjuˌɛri',
            'February': 'ˈfɛbruˌɛri',
            'March': 'mɑrtʃ',
            'April': 'ˈeɪprəl',
            'May': 'meɪ',
            'June': 'dʒun',
            'July': 'dʒuˈlaɪ',
            'August': 'ˈɔgəst',
            'September': 'sɛpˈtɛmbər',
            'October': 'ɑkˈtoʊbər',
            'November': 'noʊˈvɛmbər',
            'December': 'dɪˈsɛmbər',
            'Monday': 'ˈmʌndeɪ',
            'Tuesday': 'ˈtuzdeɪ',
            'Wednesday': 'ˈwɛnzdeɪ',
            'Thursday': 'ˈθɜrzdeɪ',
            'Friday': 'ˈfraɪdeɪ',
            'Saturday': 'ˈsætərdeɪ',
            'Sunday': 'ˈsʌndeɪ'
        };
    }
    
    // 获取中文拼音
    getPinyin(chineseText) {
        if (!chineseText || typeof chineseText !== 'string') return '';
        
        try {
            // 使用pinyin-pro库
            if (typeof pinyinPro !== 'undefined') {
                return pinyinPro.pinyin(chineseText, { toneType: 'symbol' });
            } else {
                // 备用方案：简单的拼音转换
                return this.simplePinyin(chineseText);
            }
        } catch (error) {
            console.warn('拼音转换失败:', error);
            return this.simplePinyin(chineseText);
        }
    }
    
    // 简单的拼音转换（备用方案）
    simplePinyin(chineseText) {
        // 简单的汉字到拼音映射（常用字）
        const simpleDict = {
            '你': 'nǐ', '好': 'hǎo', '世': 'shì', '界': 'jiè', '苹': 'píng', '果': 'guǒ',
            '书': 'shū', '猫': 'māo', '狗': 'gǒu', '房': 'fáng', '子': 'zi', '水': 'shuǐ',
            '食': 'shí', '物': 'wù', '好': 'hǎo', '坏': 'huài', '大': 'dà', '小': 'xiǎo',
            '高': 'gāo', '兴': 'xìng', '悲': 'bēi', '伤': 'shāng', '爱': 'ài', '恨': 'hèn',
            '朋': 'péng', '友': 'yǒu', '家': 'jiā', '人': 'rén', '学': 'xué', '校': 'xiào',
            '老': 'lǎo', '师': 'shī', '学': 'xué', '生': 'shēng', '学': 'xué', '习': 'xí',
            '读': 'dú', '写': 'xiě', '说': 'shuō', '听': 'tīng', '懂': 'dǒng', '知': 'zhī',
            '道': 'dào', '思': 'sī', '考': 'kǎo', '记': 'jì', '得': 'dé', '忘': 'wàng',
            '时': 'shí', '间': 'jiān', '白': 'bái', '天': 'tiān', '黑': 'hēi', '夜': 'yè',
            '早': 'zǎo', '上': 'shàng', '下': 'xià', '午': 'wǔ', '晚': 'wǎn', '上': 'shàng',
            '周': 'zhōu', '月': 'yuè', '年': 'nián', '今': 'jīn', '天': 'tiān', '明': 'míng',
            '天': 'tiān', '昨': 'zuó', '天': 'tiān', '颜': 'yán', '色': 'sè', '红': 'hóng',
            '蓝': 'lán', '绿': 'lǜ', '黄': 'huáng', '黑': 'hēi', '白': 'bái', '数': 'shù',
            '字': 'zì', '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ',
            '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí', '国': 'guó',
            '城': 'chéng', '市': 'shì', '人': 'rén', '民': 'mín', '个': 'gè', '人': 'rén',
            '男': 'nán', '女': 'nǚ', '小': 'xiǎo', '孩': 'hái', '子': 'zi', '父': 'fù',
            '母': 'mǔ', '兄': 'xiōng', '弟': 'dì', '姐': 'jiě', '妹': 'mèi', '工': 'gōng',
            '作': 'zuò', '职': 'zhí', '业': 'yè', '钱': 'qián', '买': 'mǎi', '卖': 'mài',
            '付': 'fù', '价': 'jià', '格': 'gé', '便': 'pián', '宜': 'yí', '贵': 'guì',
            '免': 'miǎn', '费': 'fèi', '帮': 'bāng', '助': 'zhù', '需': 'xū', '要': 'yào',
            '想': 'xiǎng', '喜': 'xǐ', '欢': 'huān', '享': 'xiǎng', '受': 'shòu', '讨': 'tǎo',
            '厌': 'yàn', '居': 'jū', '住': 'zhù', '生': 'shēng', '活': 'huó', '死': 'sǐ',
            '亡': 'wáng', '健': 'jiàn', '康': 'kāng', '医': 'yī', '生': 'shēng', '院': 'yuàn',
            '药': 'yào', '品': 'pǐn', '吃': 'chī', '喝': 'hē', '饥': 'jī', '饿': 'è',
            '渴': 'kě', '房': 'fáng', '屋': 'wū', '家': 'jiā', '庭': 'tíng', '房': 'fáng',
            '厨': 'chú', '房': 'fáng', '卧': 'wò', '室': 'shì', '浴': 'yù', '室': 'shì',
            '桌': 'zhuō', '子': 'zi', '椅': 'yǐ', '子': 'zi', '床': 'chuáng', '门': 'mén',
            '窗': 'chuāng', '户': 'hu', '汽': 'qì', '车': 'chē', '公': 'gōng', '共': 'gòng',
            '汽': 'qì', '车': 'chē', '火': 'huǒ', '车': 'chē', '飞': 'fēi', '机': 'jī',
            '船': 'chuán', '只': 'zhī', '步': 'bù', '行': 'xíng', '跑': 'pǎo', '跳': 'tiào',
            '游': 'yóu', '泳': 'yǒng', '驾': 'jià', '驶': 'shǐ', '飞': 'fēi', '行': 'xíng',
            '旅': 'lǚ', '行': 'xíng', '旅': 'lǚ', '程': 'chéng', '旅': 'lǚ', '途': 'tú',
            '道': 'dào', '路': 'lù', '街': 'jiē', '道': 'dào', '桥': 'qiáo', '梁': 'liáng',
            '河': 'hé', '流': 'liú', '山': 'shān', '丘': 'qiū', '丘': 'qiū', '陵': 'líng',
            '森': 'sēn', '林': 'lín', '树': 'shù', '木': 'mù', '花': 'huā', '朵': 'duǒ',
            '草': 'cǎo', '原': 'yuán', '太': 'tài', '阳': 'yáng', '月': 'yuè', '亮': 'liàng',
            '星': 'xīng', '星': 'xīng', '天': 'tiān', '空': 'kōng', '云': 'yún', '彩': 'cǎi',
            '雨': 'yǔ', '水': 'shuǐ', '雪': 'xuě', '花': 'huā', '风': 'fēng', '风': 'fēng',
            '暴': 'bào', '天': 'tiān', '气': 'qì', '炎': 'yán', '热': 'rè', '寒': 'hán',
            '冷': 'lěng', '温': 'wēn', '暖': 'nuǎn', '凉': 'liáng', '爽': 'shuǎng', '春': 'chūn',
            '夏': 'xià', '秋': 'qiū', '冬': 'dōng', '一': 'yī', '月': 'yuè', '二': 'èr',
            '月': 'yuè', '三': 'sān', '月': 'yuè', '四': 'sì', '月': 'yuè', '五': 'wǔ',
            '月': 'yuè', '六': 'liù', '月': 'yuè', '七': 'qī', '月': 'yuè', '八': 'bā',
            '月': 'yuè', '九': 'jiǔ', '月': 'yuè', '十': 'shí', '月': 'yuè', '十': 'shí',
            '一': 'yī', '月': 'yuè', '十': 'shí', '二': 'èr', '月': 'yuè', '星': 'xīng',
            '期': 'qī', '一': 'yī', '星': 'xīng', '期': 'qī', '二': 'èr', '星': 'xīng',
            '期': 'qī', '三': 'sān', '星': 'xīng', '期': 'qī', '四': 'sì', '星': 'xīng',
            '期': 'qī', '五': 'wǔ', '星': 'xīng', '期': 'qī', '六': 'liù', '星': 'xīng',
            '期': 'qī', '日': 'rì'
        };
        
        // 将每个字符转换为拼音
        let result = '';
        for (let char of chineseText) {
            if (simpleDict[char]) {
                result += simpleDict[char] + ' ';
            } else {
                result += char + ' ';
            }
        }
        return result.trim();
    }
    
    // 获取英文音标
    getIPA(englishText) {
        if (!englishText || typeof englishText !== 'string') return '';
        
        const word = englishText.toLowerCase().trim();
        
        // 首先检查内置词典
        if (this.ipaDict[word]) {
            return this.ipaDict[word];
        }
        
        // 尝试分解复合词
        const words = word.split(/\s+/);
        if (words.length > 1) {
            const ipaParts = words.map(w => this.getIPA(w)).filter(ipa => ipa);
            return ipaParts.join(' ');
        }
        
        // 简单的音标生成规则（基于拼写规则）
        return this.generateSimpleIPA(word);
    }
    
    // 简单的音标生成规则
    generateSimpleIPA(word) {
        // 基于英语拼写规则的简单音标生成
        let ipa = word;
        
        // 常见的拼写到音标转换规则
        const rules = [
            // 元音规则
            { pattern: /ee/g, replacement: 'iː' },
            { pattern: /ea/g, replacement: 'iː' },
            { pattern: /oo/g, replacement: 'uː' },
            { pattern: /oa/g, replacement: 'oʊ' },
            { pattern: /ai/g, replacement: 'eɪ' },
            { pattern: /ay/g, replacement: 'eɪ' },
            { pattern: /ei/g, replacement: 'eɪ' },
            { pattern: /ey/g, replacement: 'eɪ' },
            { pattern: /ou/g, replacement: 'aʊ' },
            { pattern: /ow/g, replacement: 'aʊ' },
            { pattern: /oi/g, replacement: 'ɔɪ' },
            { pattern: /oy/g, replacement: 'ɔɪ' },
            { pattern: /au/g, replacement: 'ɔː' },
            { pattern: /aw/g, replacement: 'ɔː' },
            { pattern: /ar/g, replacement: 'ɑːr' },
            { pattern: /or/g, replacement: 'ɔːr' },
            { pattern: /er/g, replacement: 'ɜːr' },
            { pattern: /ir/g, replacement: 'ɜːr' },
            { pattern: /ur/g, replacement: 'ɜːr' },
            
            // 辅音规则
            { pattern: /ch/g, replacement: 'tʃ' },
            { pattern: /sh/g, replacement: 'ʃ' },
            { pattern: /th/g, replacement: 'θ' },
            { pattern: /ng/g, replacement: 'ŋ' },
            { pattern: /ph/g, replacement: 'f' },
            { pattern: /qu/g, replacement: 'kw' },
            { pattern: /x/g, replacement: 'ks' },
            
            // 简单的元音
            { pattern: /a/g, replacement: 'æ' },
            { pattern: /e/g, replacement: 'e' },
            { pattern: /i/g, replacement: 'ɪ' },
            { pattern: /o/g, replacement: 'ɒ' },
            { pattern: /u/g, replacement: 'ʌ' },
            
            // 简单的辅音
            { pattern: /b/g, replacement: 'b' },
            { pattern: /c/g, replacement: 'k' },
            { pattern: /d/g, replacement: 'd' },
            { pattern: /f/g, replacement: 'f' },
            { pattern: /g/g, replacement: 'g' },
            { pattern: /h/g, replacement: 'h' },
            { pattern: /j/g, replacement: 'dʒ' },
            { pattern: /k/g, replacement: 'k' },
            { pattern: /l/g, replacement: 'l' },
            { pattern: /m/g, replacement: 'm' },
            { pattern: /n/g, replacement: 'n' },
            { pattern: /p/g, replacement: 'p' },
            { pattern: /q/g, replacement: 'k' },
            { pattern: /r/g, replacement: 'r' },
            { pattern: /s/g, replacement: 's' },
            { pattern: /t/g, replacement: 't' },
            { pattern: /v/g, replacement: 'v' },
            { pattern: /w/g, replacement: 'w' },
            { pattern: /y/g, replacement: 'j' },
            { pattern: /z/g, replacement: 'z' }
        ];
        
        // 应用转换规则
        for (let rule of rules) {
            ipa = ipa.replace(rule.pattern, rule.replacement);
        }
        
        // 重音规则（简单的启发式）
        if (ipa.length > 4) {
            // 在第二个音节添加重音
            const syllables = ipa.split(' ');
            if (syllables.length >= 2) {
                syllables[0] = 'ˈ' + syllables[0];
                ipa = syllables.join(' ');
            } else {
                ipa = 'ˈ' + ipa;
            }
        } else {
            ipa = 'ˈ' + ipa;
        }
        
        return ipa;
    }
}

// 创建全局拼音音标转换器实例
const phoneticConverter = new PhoneticConverter();

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
        
        const activeButton = document.getElementById(this.currentMode);
        if (activeButton) {
            activeButton.classList.add('active');
        } else {
            console.warn(`Mode button with ID "${this.currentMode}" not found`);
        }
    }
}

// 挑战模式管理模块
class ChallengeMode {
    constructor() {
        this.isActive = false;
        this.startTime = null;
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.totalQuestions = 0;
        this.wrongQuestions = [];
        this.correctQuestions = [];
        this.currentChallengeMode = MODES.CHINESE_TO_ENGLISH;
        this.timer = null;
        this.timeElapsed = 0;
    }
    
    start() {
        this.isActive = true;
        this.startTime = Date.now();
        this.score = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.totalQuestions = 0;
        this.wrongQuestions = [];
        this.correctQuestions = [];
        this.timeElapsed = 0;
        this.startTimer();
    }
    
    stop() {
        this.isActive = false;
        this.stopTimer();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeElapsed / 60);
        const seconds = this.timeElapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const timerElement = document.getElementById('challenge-time');
        if (timerElement) {
            timerElement.textContent = timeString;
        }
    }
    
    updateScore(correct) {
        if (correct) {
            this.score += 3;
            this.correctCount++;
        } else {
            this.score = Math.max(0, this.score - 2); // 确保分数不为负
            this.wrongCount++;
        }
        this.totalQuestions++;
        this.updateScoreDisplay();
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('challenge-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    recordQuestion(question, userAnswer, correctAnswer, isCorrect) {
        const questionRecord = {
            question: question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
        };
        
        if (isCorrect) {
            this.correctQuestions.push(questionRecord);
        } else {
            this.wrongQuestions.push(questionRecord);
        }
    }
    
    calculateAbilityScore() {
        // 能力分计算公式：基础分 + 正确率加分 + 速度加分
        const accuracy = this.totalQuestions > 0 ? this.correctCount / this.totalQuestions : 0;
        const timeBonus = this.timeElapsed > 0 ? Math.max(0, 100 - this.timeElapsed / 60) : 0; // 时间越短加分越多
        const abilityScore = Math.round(60 + accuracy * 30 + timeBonus * 0.1);
        return Math.min(100, abilityScore); // 最高100分
    }
    
    getResults() {
        return {
            totalTime: this.timeElapsed,
            score: this.score,
            correctCount: this.correctCount,
            wrongCount: this.wrongCount,
            totalQuestions: this.totalQuestions,
            accuracy: this.totalQuestions > 0 ? (this.correctCount / this.totalQuestions * 100) : 0,
            abilityScore: this.calculateAbilityScore(),
            wrongQuestions: this.wrongQuestions,
            correctQuestions: this.correctQuestions
        };
    }
}

// 主应用控制器
class QuizApp {
    constructor() {
        this.questionBank = new QuestionBank();
        this.quizMode = new QuizMode();
        this.challengeMode = new ChallengeMode();
        this.currentQuestion = null;
        this.isAnswerShown = false;
        this.currentAppMode = APP_MODES.LECTURE; // 当前应用模式
        this.currentQuizOptions = []; // 当前答题模式的选项
        this.selectedOption = null; // 用户选择的选项
        this.availableBanks = []; // 可用题库列表
        this.selectedBanks = []; // 已选择的题库
        this.bankQuestions = {}; // 存储各个题库的题目 {bankName: questions}
        this.challengeSelectedOption = null; // 挑战模式用户选择的选项
        this.challengeCurrentOptions = []; // 挑战模式当前选项
        this.autoNextTimer = null; // 自动下一题定时器
        this.autoSwitchTime = 0.3; // 默认自动切换时间（秒）
        this.speechSynthesis = speechSynthesis; // 语音合成实例
        this.speechSettings = {
            rate: 0.8,
            pitch: 1.0,
            volume: 1.0,
            autoSpeak: false
        };
        
        this.initializeEventListeners();
    }
    
    // 初始化事件监听器
    initializeEventListeners() {
        // 应用模式切换
        document.querySelectorAll('.app-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 如果在挑战模式中，禁止切换模式，除非点击重新开始
                if (this.currentAppMode === APP_MODES.CHALLENGE && e.target.id !== 'challenge-mode') {
                    this.showMessage('挑战模式中，请先完成挑战或点击重新开始！', 'warning');
                    return;
                }
                this.handleAppModeChange(e.target.id);
            });
        });
        
        // 挑战模式选择
        document.querySelectorAll('.challenge-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChallengeModeSelect(e.target.dataset.mode);
            });
        });
        
        // 自动切换时间设置
        const autoSwitchSelect = document.getElementById('auto-switch-time');
        if (autoSwitchSelect) {
            autoSwitchSelect.addEventListener('change', (e) => {
                this.autoSwitchTime = parseFloat(e.target.value);
            });
        }
        
        // 挑战模式选项按钮
        document.querySelectorAll('#challenge-option-a, #challenge-option-b, #challenge-option-c, #challenge-option-d').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.handleChallengeOptionSelect(index);
            });
        });
        
        // 挑战模式下一题按钮
        document.getElementById('next-challenge-question').addEventListener('click', () => {
            this.nextChallengeQuestion();
        });
        
        // 重新开始挑战按钮
        document.getElementById('restart-challenge').addEventListener('click', () => {
            this.restartChallenge();
        });
        
        // 文件上传
        document.getElementById('csv-file').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        // 发音按钮
        document.getElementById('speak-btn').addEventListener('click', () => {
            this.speakCurrentWord();
        });
        
        // 语音设置按钮
        document.getElementById('speech-settings-btn').addEventListener('click', () => {
            this.toggleSpeechPanel();
        });
        
        // 关闭语音设置面板
        document.getElementById('close-speech-panel').addEventListener('click', () => {
            this.hideSpeechPanel();
        });
        
        // 语音设置滑块
        document.getElementById('speech-rate').addEventListener('input', (e) => {
            this.updateSpeechSetting('rate', parseFloat(e.target.value));
            document.getElementById('speech-rate-value').textContent = e.target.value;
        });
        
        document.getElementById('speech-pitch').addEventListener('input', (e) => {
            this.updateSpeechSetting('pitch', parseFloat(e.target.value));
            document.getElementById('speech-pitch-value').textContent = e.target.value;
        });
        
        document.getElementById('speech-volume').addEventListener('input', (e) => {
            this.updateSpeechSetting('volume', parseFloat(e.target.value));
            document.getElementById('speech-volume-value').textContent = e.target.value;
        });
        
        document.getElementById('auto-speak').addEventListener('change', (e) => {
            this.updateSpeechSetting('autoSpeak', e.target.checked);
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
        
        // 初始化题库管理（延迟执行，确保DOM加载完成）
        setTimeout(() => {
            this.initializeBankManagement();
        }, 100);
    }
    
    // 初始化题库管理
    initializeBankManagement() {
        // 检查元素是否存在
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
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
        // 如果切换到挑战模式，需要特殊处理
        if (mode === APP_MODES.CHALLENGE) {
            this.startChallengeMode();
            return;
        }
        
        // 如果从挑战模式切换到其他模式，停止挑战模式
        if (this.currentAppMode === APP_MODES.CHALLENGE) {
            this.challengeMode.stop();
        }
        
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
    
    // 开始挑战模式
    startChallengeMode() {
        this.currentAppMode = APP_MODES.CHALLENGE;
        this.updateAppModeButtons();
        this.switchUIMode();
        
        // 显示挑战模式选择界面
        this.showChallengeModeSelection();
        
        // 重置挑战模式状态
        this.challengeMode.stop();
        this.challengeSelectedOption = null;
        
        // 清理挑战模式界面状态
        this.clearChallengeInterface();
    }
    
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
        });
        
        // 清理结果显示
        const resultElement = document.getElementById('challenge-result');
        if (resultElement) {
            resultElement.textContent = '';
            resultElement.style.display = 'none';
            resultElement.className = 'quiz-result';
        }
        
        // 清理题目显示
        document.getElementById('question').textContent = '在下方选择题库后开始答题';
        document.getElementById('answer').textContent = '';
    }
    
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
        
        this.challengeMode.currentChallengeMode = standardMode;
        this.challengeMode.start();
        
        // 隐藏选择界面，显示答题界面
        this.hideChallengeModeSelection();
        this.showChallengeQuizInterface();
        
        // 延迟开始第一题，确保界面完全切换
        setTimeout(() => {
            this.nextChallengeQuestion();
        }, 100);
    }
    
    // 显示挑战模式选择界面
    showChallengeModeSelection() {
        const selectionElement = document.querySelector('.challenge-mode-selection');
        const quizInterface = document.querySelector('.challenge-quiz-interface');
        
        if (selectionElement) selectionElement.style.display = 'block';
        if (quizInterface) quizInterface.style.display = 'none';
    }
    
    // 隐藏挑战模式选择界面
    hideChallengeModeSelection() {
        const selectionElement = document.querySelector('.challenge-mode-selection');
        const quizInterface = document.querySelector('.challenge-quiz-interface');
        
        if (selectionElement) selectionElement.style.display = 'none';
        if (quizInterface) quizInterface.style.display = 'block';
    }
    
    // 显示挑战模式答题界面
    showChallengeQuizInterface() {
        // 更新模式显示
        this.quizMode.setMode(this.challengeMode.currentChallengeMode);
    }
    
    // 挑战模式下一题
    nextChallengeQuestion() {
        this.challengeSelectedOption = null;
        
        // 清理上一题的状态
        this.clearPreviousChallengeQuestion();
        
        const hasNextQuestion = this.nextQuestion();
        
        if (hasNextQuestion && this.currentQuestion) {
            // 立即显示下一题，不延迟
            this.displayChallengeQuestion();
        } else {
            // 挑战结束，显示结果
            this.showChallengeResults();
        }
    }
    
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
    }
    
    // 显示挑战模式题目
    displayChallengeQuestion() {
        if (!this.currentQuestion) return;
        
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        document.getElementById('question').textContent = questionText;
        
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
    }
    
    // 生成挑战模式选项
    generateChallengeOptions() {
        if (!this.currentQuestion) return;
        
        const correctAnswer = this.quizMode.getAnswerText(this.currentQuestion);
        const wrongAnswers = this.generateWrongAnswers(correctAnswer);
        
        // 确保有足够多的错误答案
        if (wrongAnswers.length < 3) {
            // 如果题库中的错误答案不够，生成一些默认的错误答案
            const defaultWrongAnswers = ['暂无', '暂无', '暂无', '暂无', '未知答案'];
            const additionalAnswers = defaultWrongAnswers.filter(ans =>
                ans !== correctAnswer && !wrongAnswers.includes(ans)
            );
            wrongAnswers.push(...additionalAnswers.slice(0, 3 - wrongAnswers.length));
        }
        
        // 合并正确和错误答案
        const allOptions = [correctAnswer, ...wrongAnswers.slice(0, 3)];
        
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
    }
    
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
        if (this.autoSwitchTime > 0) {
            this.autoNextTimer = setTimeout(() => {
                this.nextChallengeQuestion();
            }, this.autoSwitchTime * 1000);
        }
    }
    
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
    }
    
    // 显示挑战模式最终结果
    showChallengeResults() {
        this.challengeMode.stop();
        
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
        
        // 显示错题和正确题
        this.displayChallengeQuestionResults(results);
    }
    
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
    }
    
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
            return true; // 表示成功获取下一题
        } else {
            this.showCompletionMessage();
            return false; // 表示没有更多题目
        }
    }
    
    // 显示答题模式题目
    displayQuizQuestion() {
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
    }
    
    // 显示题目拼音或音标
    displayQuestionPhonetic() {
        if (!this.currentQuestion) return;
        
        const questionText = this.quizMode.getQuestionText(this.currentQuestion);
        const questionPhoneticElement = document.getElementById('question-phonetic');
        
        // 根据文本内容判断是中文还是英文
        if (speechSynthesis.containsEnglish(questionText)) {
            // 英文显示音标
            const ipa = phoneticConverter.getIPA(questionText);
            questionPhoneticElement.textContent = ipa ? `[${ipa}]` : '';
        } else {
            // 中文显示拼音
            const pinyin = phoneticConverter.getPinyin(questionText);
            questionPhoneticElement.textContent = pinyin;
        }
    }
    
    // 显示答案拼音或音标
    displayAnswerPhonetic() {
        if (!this.currentQuestion) return;
        
        const answerText = this.quizMode.getAnswerText(this.currentQuestion);
        const answerPhoneticElement = document.getElementById('answer-phonetic');
        
        // 根据文本内容判断是中文还是英文
        if (speechSynthesis.containsEnglish(answerText)) {
            // 英文显示音标
            const ipa = phoneticConverter.getIPA(answerText);
            answerPhoneticElement.textContent = ipa ? `[${ipa}]` : '';
        } else {
            // 中文显示拼音
            const pinyin = phoneticConverter.getPinyin(answerText);
            answerPhoneticElement.textContent = pinyin;
        }
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
        const hasNextQuestion = this.nextQuestion();
        if (hasNextQuestion && this.currentQuestion) {
            this.displayQuizQuestion();
        }
        // 如果nextQuestion返回false，说明已经显示完成页面，不需要额外操作
    }
    
    // 显示题目（根据应用模式）
    displayQuestion() {
        if (this.currentAppMode === APP_MODES.LECTURE) {
            const questionText = this.quizMode.getQuestionText(this.currentQuestion);
            document.getElementById('question').textContent = questionText;
        } else if (this.currentAppMode === APP_MODES.QUIZ) {
            this.displayQuizQuestion();
        }
        
        // 更新发音按钮状态
        this.updateSpeakButton();
    }
    
    // 显示答案
    showAnswer() {
        if (this.currentQuestion && !this.isAnswerShown) {
            const answerText = this.quizMode.getAnswerText(this.currentQuestion);
            const answerElement = document.getElementById('answer');
            
            answerElement.textContent = answerText;
            answerElement.classList.add('show');
            answerElement.classList.remove('hidden');
            
            // 显示答案的拼音或音标
            this.displayAnswerPhonetic();
            
            this.isAnswerShown = true;
        }
    }
    
    // 隐藏答案
    hideAnswer() {
        const answerElement = document.getElementById('answer');
        const answerPhoneticElement = document.getElementById('answer-phonetic');
        
        answerElement.classList.remove('show');
        answerElement.classList.add('hidden');
        answerElement.textContent = '';
        
        // 同时隐藏答案的拼音或音标
        answerPhoneticElement.textContent = '';
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
    // 检查文本是否包含英文
    containsEnglish(text) {
        return /[a-zA-Z]/.test(text);
    }
    
    // 检查文本是否包含中文
    containsChinese(text) {
        return /[\u4e00-\u9fff]/.test(text);
    }
    
    // 清理文本以便发音
    cleanTextForSpeech(text) {
        if (!text) return '';
        
        // 移除HTML标签
        text = text.replace(/<[^>]*>/g, '');
        
        // 移除特殊字符，但保留字母、数字、空格和基本标点
        text = text.replace(/[^\w\s.,!?()-]/g, '');
        
        // 移除多余的空格
        text = text.trim().replace(/\s+/g, ' ');
        
        return text;
    }
    
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
    }
    
    // 语音设置相关方法
    toggleSpeechPanel() {
        const panel = document.getElementById('speech-panel');
        panel.classList.toggle('hidden');
    }
    
    hideSpeechPanel() {
        const panel = document.getElementById('speech-panel');
        panel.classList.add('hidden');
    }
    
    updateSpeechSetting(setting, value) {
        this.speechSettings[setting] = value;
        
        // 更新语音合成实例的设置
        if (setting === 'rate' || setting === 'pitch' || setting === 'volume') {
            // 这些设置将在下次发音时应用
        }
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
    if (!selector) return;

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
