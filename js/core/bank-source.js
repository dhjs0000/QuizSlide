// 题库来源：扫描 data/ 目录、读取备用清单、批量加载并解析题库文件
import { CSVParser } from './csv.js';

export async function loadCSVFileList() {
    try {
        // 方法1：尝试获取data目录下的所有文件
        const response = await fetch('data/');
        if (!response.ok) {
            throw new Error(`目录扫描失败：HTTP ${response.status}`);
        }
        const text = await response.text();
        
        // 解析HTML响应，提取CSV文件名
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = doc.querySelectorAll('a');
        
        const csvFiles = [];
        links.forEach(link => {
            const href = link.getAttribute('href');
            const linkText = (link.textContent || '').trim();
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

        // GitHub Pages 等静态托管不会生成目录列表，返回 404 页面且没有 CSV 链接，
        // 此时必须走 file-list.json 备用清单，不能直接返回空数组。
        if (csvFiles.length === 0) {
            throw new Error('目录列表中没有找到 CSV 文件');
        }
        
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
                fileName: '旧课标七年级到八年级上册重点单词.csv',
                displayName: '旧课标初中重点单词'
            }];
        }
    }
}

// 按选择题库批量取题，统一解析并标注来源
export async function fetchQuestionsFromBanks(banks) {
    let allQuestions = [];
    for (const bank of banks) {
        let questions;
        if (bank.type === 'built-in' && bank.fileName === 'sample') {
            const response = await fetch('sample-words.csv');
            questions = CSVParser.parseCSV(await response.text());
        } else if (bank.type === 'file') {
            const response = await fetch(`data/${bank.fileName}`);
            questions = CSVParser.parseCSV(await response.text());
        }
        if (questions && questions.length > 0) {
            allQuestions = allQuestions.concat(questions.map(q => ({ ...q, source: bank.displayName })));
        }
    }
    return allQuestions;
}
