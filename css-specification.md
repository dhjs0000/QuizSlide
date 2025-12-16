# CSS样式设计规范

## 设计原则
- 适配一体机大屏幕（建议1920x1080分辨率）
- 大字体，高对比度
- 简洁清晰的界面
- 触摸友好的按钮尺寸

## 基础样式规范

### 全局样式
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #333;
}
```

### 容器样式
```css
.container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    padding: 40px;
    max-width: 1200px;
    width: 90%;
    min-height: 600px;
    display: flex;
    flex-direction: column;
}
```

## 组件样式规范

### 头部区域
```css
header {
    text-align: center;
    margin-bottom: 40px;
}

header h1 {
    font-size: 48px;
    color: #2c3e50;
    margin-bottom: 30px;
    font-weight: bold;
}

.mode-selector {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}
```

### 模式按钮
```css
.mode-btn {
    padding: 15px 30px;
    font-size: 20px;
    border: 2px solid #3498db;
    background: white;
    color: #3498db;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;
}

.mode-btn:hover {
    background: #3498db;
    color: white;
    transform: translateY(-2px);
}

.mode-btn.active {
    background: #3498db;
    color: white;
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}
```

### 题目显示区域
```css
.question-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 40px 0;
    min-height: 200px;
}

.question-text {
    font-size: 64px;
    font-weight: bold;
    color: #2c3e50;
    text-align: center;
    margin-bottom: 30px;
    line-height: 1.4;
}

.answer-text {
    font-size: 48px;
    color: #27ae60;
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease;
}

.answer-text.show {
    opacity: 1;
    transform: translateY(0);
}
```

### 控制按钮
```css
.controls {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin: 30px 0;
}

.control-btn {
    padding: 20px 40px;
    font-size: 24px;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;
    min-width: 180px;
}

#show-answer {
    background: #e74c3c;
    color: white;
}

#show-answer:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
}

#next-question {
    background: #27ae60;
    color: white;
}

#next-question:hover {
    background: #229954;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}
```

### 统计信息
```css
.stats {
    display: flex;
    justify-content: center;
    gap: 50px;
    font-size: 20px;
    color: #7f8c8d;
    margin: 20px 0;
}

.stats span {
    font-weight: bold;
}

#answered-count, #remaining-count {
    color: #3498db;
    font-size: 24px;
}
```

### 文件上传区域
```css
footer {
    margin-top: auto;
    padding-top: 30px;
    border-top: 2px solid #ecf0f1;
}

.file-upload {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    font-size: 18px;
}

.file-upload label {
    color: #7f8c8d;
}

#csv-file {
    padding: 10px;
    border: 2px dashed #bdc3c7;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 16px;
}

#csv-file:hover {
    border-color: #3498db;
    background: #ebf3fd;
}
```

## 响应式设计
```css
@media (max-width: 768px) {
    .container {
        padding: 20px;
        margin: 20px;
    }
    
    header h1 {
        font-size: 36px;
    }
    
    .question-text {
        font-size: 48px;
    }
    
    .answer-text {
        font-size: 36px;
    }
    
    .mode-btn, .control-btn {
        font-size: 18px;
        padding: 15px 25px;
    }
}
```

## 特殊状态样式
```css
.hidden {
    display: none;
}

.show {
    display: block;
}

.loading {
    opacity: 0.6;
    pointer-events: none;
}

.error {
    color: #e74c3c;
    font-size: 18px;
    text-align: center;
    margin: 20px 0;
}