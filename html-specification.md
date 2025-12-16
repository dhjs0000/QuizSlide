# HTML页面设计规范

## 页面结构
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>单词答题游戏</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- 头部区域 -->
        <header>
            <h1>单词答题游戏</h1>
            <div class="mode-selector">
                <button id="chinese-to-english" class="mode-btn active">中文→英文</button>
                <button id="english-to-chinese" class="mode-btn">英文→中文</button>
                <button id="random-mode" class="mode-btn">随机模式</button>
            </div>
        </header>
        
        <!-- 主要内容区域 -->
        <main>
            <div class="question-area">
                <div id="question" class="question-text">点击开始答题</div>
                <div id="answer" class="answer-text hidden"></div>
            </div>
            
            <div class="controls">
                <button id="show-answer" class="control-btn">显示答案</button>
                <button id="next-question" class="control-btn">下一题</button>
            </div>
            
            <div class="stats">
                <span>已答题: <span id="answered-count">0</span></span>
                <span>剩余: <span id="remaining-count">0</span></span>
            </div>
        </main>
        
        <!-- 底部区域 -->
        <footer>
            <div class="file-upload">
                <label for="csv-file">上传题库文件:</label>
                <input type="file" id="csv-file" accept=".csv">
            </div>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

## 关键元素说明

### 模式选择器
- `mode-selector`: 包含三个模式按钮的容器
- `mode-btn`: 模式按钮，具有active状态样式
- 三个模式ID: `chinese-to-english`, `english-to-chinese`, `random-mode`

### 题目显示区域
- `question-area`: 题目和答案的显示容器
- `question`: 显示当前题目
- `answer`: 显示答案，初始状态为隐藏

### 控制按钮
- `controls`: 控制按钮容器
- `show-answer`: 显示答案按钮
- `next-question`: 下一题按钮

### 统计信息
- `stats`: 统计信息容器
- `answered-count`: 已答题数量
- `remaining-count`: 剩余题目数量

### 文件上传
- `file-upload`: 文件上传区域
- `csv-file`: CSV文件输入框