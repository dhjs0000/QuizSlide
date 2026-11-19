// CSV 题库解析：首行为标题，之后每行「中文,英文」，支持引号包裹的逗号
// CSV文件解析模块
export class CSVParser {
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
