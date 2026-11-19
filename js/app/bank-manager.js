// 题库列表：扫描、展示、多选与加载；也处理本地 CSV 上传
import { APP_MODES } from '../core/constants.js';
import { CSVParser } from '../core/csv.js';
import { loadCSVFileList, fetchQuestionsFromBanks } from '../core/bank-source.js';

export default {
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
    },

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
    },

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
    },

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
    },

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
    },

    // 加载选中的题库
    async loadSelectedBanks() {
        if (this.selectedBanks.length === 0) {
            this.showMessage('请至少选择一个题库！', 'error');
            return;
        }

        try {
            const allQuestions = this.shuffleArray(await fetchQuestionsFromBanks(this.selectedBanks));

            if (allQuestions.length > 0) {
                this.questionBank.loadQuestions(allQuestions);
                // 挑战模式的选择页不显示题目，不能在这里消耗一道题
                if (this.currentAppMode === APP_MODES.CHALLENGE) {
                    if (!this.challengeMode.isActive) this.syncStatsFromBank();
                } else {
                    this.nextQuestion();
                }
                this.showMessage(`成功加载 ${this.selectedBanks.length} 个题库，共 ${allQuestions.length} 道题目！`, 'success');
            } else {
                this.showMessage('题库加载失败，没有找到题目！', 'error');
            }
        } catch (error) {
            this.showMessage('题库加载失败：' + error.message, 'error');
        }
    },

    // 处理文件上传
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const content = await this.readFile(file);
            const questions = CSVParser.parseCSV(content);
            
            if (questions.length > 0) {
                this.questionBank.loadQuestions(questions);
                // 挑战模式的选择页不显示题目，不能在这里消耗一道题
                if (this.currentAppMode === APP_MODES.CHALLENGE) {
                    if (!this.challengeMode.isActive) this.syncStatsFromBank();
                } else {
                    this.nextQuestion();
                }
                this.showMessage('题库加载成功！', 'success');
            } else {
                this.showMessage('题库文件格式错误！', 'error');
            }
        } catch (error) {
            this.showMessage('文件读取失败：' + error.message, 'error');
        }
    },

    // 读取文件内容
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    },
};
