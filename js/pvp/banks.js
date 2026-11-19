// 对战页题库选择：与主页面共用扫描与加载逻辑
import { loadCSVFileList, fetchQuestionsFromBanks } from '../core/bank-source.js';

export default {
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
    },

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
            this.selectedBanks = this.selectedBanks.filter(b => b.fileName !== bank.fileName);
            bankItem.classList.remove('selected');
        } else {
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
            const allQuestions = await fetchQuestionsFromBanks(this.selectedBanks);

            if (allQuestions.length > 0) {
                this.questionBank = this.shuffleArray(allQuestions);
                this.showMessage(`成功加载 ${this.selectedBanks.length} 个题库，共 ${this.questionBank.length} 道题目！`, 'success');
            } else {
                this.showMessage('题库加载失败，没有找到题目！', 'error');
            }
        } catch (error) {
            this.showMessage('题库加载失败：' + error.message, 'error');
        }
    },
};
