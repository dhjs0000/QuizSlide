# 单词答题游戏

一个为课堂一体机设计的静态 Web 单词答题应用，支持中英互译、选择题、限时挑战和双人对战。纯前端实现，无需后端。

## 目录结构

```
QuizSlide/
├── index.html              # 游戏主页面（讲台 / 答题 / 挑战 / 对战入口）
├── pvp.html                # 双人对战页面
├── version.html            # 版本说明页
├── css/
│   ├── base.css            # 全局重置、容器、头部、音标、语音面板
│   ├── layout.css          # 题目区、控制条、选项、统计、页脚
│   ├── states.css          # 特殊状态、移动端基础、大屏、动效、无障碍
│   ├── bank.css            # 题库管理列表
│   ├── challenge.css       # 挑战模式
│   ├── responsive.css      # 题库与挑战模式的移动端适配
│   ├── settings.css        # 背景、透明度、版本信息
│   ├── pvp.css             # 双人对战页
│   └── version.css         # 版本说明页
├── js/
│   ├── app.js              # 主页面入口：组装模块、绑定事件、启动
│   ├── pvp.js              # 对战页入口
│   ├── version.js          # 版本说明页
│   ├── core/               # 与界面无关的核心能力
│   │   ├── constants.js    # 模式常量
│   │   ├── speech.js       # 语音合成
│   │   ├── phonetic.js     # 拼音 / 音标
│   │   ├── csv.js          # CSV 解析
│   │   ├── question-bank.js# 题库状态与统计
│   │   ├── quiz-mode.js    # 答题模式
│   │   ├── challenge-mode.js # 挑战模式状态机
│   │   ├── bank-source.js  # 题库扫描与批量加载
│   │   └── notify.js       # 消息提示
│   ├── app/                # 主页面的界面逻辑，按职责挂到 QuizApp 上
│   │   ├── background.js   # 背景与透明度
│   │   ├── bank-manager.js # 题库选择与上传
│   │   ├── mode-switcher.js# 讲台 / 答题 / 挑战切换
│   │   ├── challenge-ui.js # 挑战模式界面
│   │   ├── quiz-ui.js      # 出题、选项、判题
│   │   └── speech-ui.js    # 发音按钮与语音设置
│   └── pvp/                # 对战页界面逻辑
│       ├── banks.js        # 对战页题库选择
│       └── duel-ui.js      # 双方题目与作答渲染
├── data/                   # 内置 CSV 题库与文件清单
├── images/                 # 背景图片
├── json/                   # 音标数据与版本记录
├── pinyin-pro.js           # 拼音库（全局脚本）
└── sample-words.csv        # 示例题库
```

## 快速开始

页面使用 ES Module（`import` / `export`），浏览器不允许从 `file://` 直接加载模块，因此需要用本地 HTTP 服务器打开，不能用双击方式：

```bash
# Python
python -m http.server 8000

# 或 Node.js
npx http-server
```

然后访问 <http://localhost:8000>。部署到 GitHub Pages 等静态托管时无需任何构建步骤。

## 功能

- **三种答题模式**：中文→英文、英文→中文、随机模式
- **四种玩法**：讲台模式、答题模式（四选一）、挑战模式（限时计分）、双人对战
- **题库管理**：自动扫描 `data/` 下的 CSV，可多选混合加载，也可上传自定义文件
- **语音朗读**：英式 / 美式音标，可调语速、音调、音量，支持自动发音
- **背景与透明度**：内置背景图片，可调界面透明度，设置保存在本地
- **一体机适配**：大字号、高对比度、触摸友好的按钮尺寸

## 题库格式

```csv
中文,英文
你好,hello
世界,world
```

第一行必须是标题，之后每行一个词条，中文在前、英文在后，使用逗号分隔，文件编码为 UTF-8。支持目录列表的服务器会自动扫描 `data/`；GitHub Pages 等静态托管不提供目录列表，会回退到 `data/file-list.json`，因此新增题库时也需要在该文件中登记。

## 键盘快捷键

- **Enter / 空格**：显示答案或下一题
- **Esc**：隐藏答案

## 浏览器支持

Chrome 60+、Firefox 55+、Safari 11+、Edge 79+

## 更新记录

完整记录见 `json/versions.json`，页面内入口为 `version.html`。

- **1.3.0** - 添加双人对战模式
- **1.2.0** - 支持英式 / 美式音标、连词与缩写发音，修复音标问题
- **1.1.0** - 添加背景与透明度、版本说明页
- **1.0.0** - 首个版本：三种模式、多题库、语音朗读、自定义上传
