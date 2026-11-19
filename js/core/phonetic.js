// 拼音 / 英式美式音标转换。pinyinPro 由页面上的 pinyin-pro.js 提供全局变量
// 拼音和音标转换模块
export class PhoneticConverter {
    constructor() {
        // 存储英式音标数据
        this.ukPhoneticData = {};
        // 存储美式音标数据
        this.usPhoneticData = {};
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
            'Sunday': 'ˈsʌndeɪ',
            // 缩写词处理
            'somebody': 'ˈsʌmbɑdi',
            'something': 'ˈsʌmθɪŋ',
            'somebody\'s': 'ˈsʌmbɑdiz',
            'something\'s': 'ˈsʌmθɪŋz'
        };
    }
    
    // 加载音标数据
    async loadPhoneticData() {
        try {
            // 加载英式音标数据
            const ukResponse = await fetch('json/en_UK.json');
            if (ukResponse.ok) {
                this.ukPhoneticData = await ukResponse.json();
                console.log('英式音标数据加载完成，共' + Object.keys(this.ukPhoneticData).length + '个单词');
            } else {
                console.warn('英式音标数据加载失败，状态码:', ukResponse.status);
            }
            
            // 加载美式音标数据
            const usResponse = await fetch('json/en_US.json');
            if (usResponse.ok) {
                this.usPhoneticData = await usResponse.json();
                console.log('美式音标数据加载完成，共' + Object.keys(this.usPhoneticData).length + '个单词');
            } else {
                console.warn('美式音标数据加载失败，状态码:', usResponse.status);
            }
            
            console.log('音标数据加载完成');
        } catch (error) {
            console.warn('音标数据加载失败:', error);
        }
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
    
    // 获取英文音标（同时返回英式和美式）
    getIPA(englishText) {
        if (!englishText || typeof englishText !== 'string') return { uk: '', us: '' };
        
        let word = englishText.toLowerCase().trim();
        
        // 扩展的缩写词处理
        word = this.expandAbbreviations(word);
        
        // 首先检查JSON数据
        let ukPhonetic = '';
        let usPhonetic = '';
        
        // 从英式音标数据中查找 - 处理JSON格式 {"en_UK": [{"word": "/phonetic/"}]}
        if (this.ukPhoneticData && this.ukPhoneticData.en_UK && Array.isArray(this.ukPhoneticData.en_UK) && this.ukPhoneticData.en_UK.length > 0) {
            const ukDict = this.ukPhoneticData.en_UK[0];
            if (ukDict && ukDict[word]) {
                ukPhonetic = ukDict[word];
            }
        }
        
        // 从美式音标数据中查找 - 处理JSON格式 {"en_US": [{"word": "/phonetic/"}]}
        if (this.usPhoneticData && this.usPhoneticData.en_US && Array.isArray(this.usPhoneticData.en_US) && this.usPhoneticData.en_US.length > 0) {
            const usDict = this.usPhoneticData.en_US[0];
            if (usDict && usDict[word]) {
                usPhonetic = usDict[word];
            }
        }
        
        // 如果JSON数据中没有，使用内置词典
        if (!ukPhonetic && !usPhonetic && this.ipaDict[word]) {
            ukPhonetic = this.ipaDict[word];
            usPhonetic = this.ipaDict[word];
        }
        
        // 处理复合词：先按连字符分割，再按空格分割
        if (word.includes('-') || word.includes(' ')) {
            // 先按连字符分割
            const hyphenParts = word.split('-');
            const ukHyphenParts = [];
            const usHyphenParts = [];
            let hasValidHyphenParts = false;
            
            hyphenParts.forEach(part => {
                // 对每个连字符部分再按空格分割
                const spaceWords = part.trim().split(/\s+/).filter(w => w.length > 0);
                const ukSpaceParts = [];
                const usSpaceParts = [];
                let hasValidSpaceParts = false;
                
                spaceWords.forEach(w => {
                    const result = this.getIPA(w);
                    if (result.uk) {
                        ukSpaceParts.push(result.uk);
                        hasValidSpaceParts = true;
                    }
                    if (result.us) {
                        usSpaceParts.push(result.us);
                        hasValidSpaceParts = true;
                    }
                });
                
                if (hasValidSpaceParts) {
                    // 对每个单词的音标，只选择第一个发音（去除多个发音选项）
                    const ukFirstPronunciation = ukSpaceParts.map(ipa => {
                        // 如果音标包含多个选项（用逗号分隔），只取第一个
                        return ipa.includes(',') ? ipa.split(',')[0].trim() : ipa;
                    });
                    const usFirstPronunciation = usSpaceParts.map(ipa => {
                        // 如果音标包含多个选项（用逗号分隔），只取第一个
                        return ipa.includes(',') ? ipa.split(',')[0].trim() : ipa;
                    });
                    
                    ukHyphenParts.push(ukFirstPronunciation.join(' '));
                    usHyphenParts.push(usFirstPronunciation.join(' '));
                    hasValidHyphenParts = true;
                }
            });
            
            // 使用连词符号（‐）连接复合词的音标
            if (hasValidHyphenParts) {
                return {
                    uk: ukHyphenParts.join('‐'),
                    us: usHyphenParts.join('‐')
                };
            }
        }
        
        // 如果没有找到任何音标，使用简单的音标生成规则
        if (!ukPhonetic && !usPhonetic) {
            const simpleIPA = this.generateSimpleIPA(word);
            return {
                uk: simpleIPA + "*",
                us: simpleIPA + "*"
            };
        }
        
        return {
            uk: ukPhonetic || usPhonetic || this.generateSimpleIPA(word),
            us: usPhonetic || ukPhonetic || this.generateSimpleIPA(word)
        };
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
    
    // 扩展缩写词处理
    expandAbbreviations(word) {
        // 处理各种形式的缩写
        const abbreviations = {
            'sb': 'somebody',
            'sth': 'something',
            "sb's": 'somebody\'s',
            "sth's": 'something\'s',
            'sbs': 'somebody',
            'sths': 'something',
            '(sb)': 'somebody',
            '(sth)': 'something',
            '(sb': 'somebody',
            '(sth': 'something',
            'sb)': 'somebody',
            'sth)': 'something',
            '(in)': 'in',
            '(at)': 'at',
            '(on)': 'on',
            '(for)': 'for',
            '(to)': 'to',
            '(with)': 'with',
            '(in': 'in',
            '(at': 'at',
            '(on': 'on',
            '(for': 'for',
            '(to': 'to',
            '(with': 'with',
            'in)': 'in',
            'at)': 'at',
            'on)': 'on',
            'for)': 'for',
            'to)': 'to',
            'with)': 'with'
        };
        
        // 检查是否是缩写词
        if (abbreviations[word]) {
            return abbreviations[word];
        }
        
        // 处理带's的情况（如 somebody's, something's）
        if (word.endsWith("'s")) {
            const base = word.slice(0, -2);
            if (base === 'sb') {
                return 'somebody\'s';
            } else if (base === 'sth') {
                return 'something\'s';
            }
        }
        
        return word;
    }
}

// 创建全局拼音音标转换器实例
export const phoneticConverter = new PhoneticConverter();
