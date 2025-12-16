# CSV题库文件格式规范

## 文件格式要求
- 文件扩展名：`.csv`
- 编码格式：UTF-8
- 分隔符：逗号（,）
- 文本限定符：双引号（"）可选

## 文件结构
```
中文,英文
[中文词语1],[英文词语1]
[中文词语2],[英文词语2]
...
[中文词语N],[英文词语N]
```

## 示例内容
```csv
中文,英文
你好,hello
世界,world
苹果,apple
香蕉,banana
电脑,computer
手机,mobile phone
学校,school
老师,teacher
学生,student
书本,book
```

## 数据规范

### 中文词语要求
- 使用标准简体中文
- 避免使用特殊符号
- 长度建议1-10个字符
- 可以是单词或短语

### 英文词语要求
- 使用标准英文
- 首字母大小写按英语习惯
- 可以是单词或短语
- 支持空格和连字符

### 特殊字符处理
- 如果内容中包含逗号，需要用双引号包围整个字段
- 如果内容中包含双引号，需要用两个双引号转义

## 示例题库内容（100个常用词汇）

### 基础词汇 (1-20)
```
中文,英文
你好,hello
世界,world
苹果,apple
香蕉,banana
橙子,orange
电脑,computer
手机,mobile phone
学校,school
老师,teacher
学生,student
书本,book
铅笔,pencil
桌子,desk
椅子,chair
窗户,window
门,door
汽车,car
公交车,bus
自行车,bicycle
飞机,airplane
```

### 动物词汇 (21-30)
```
老虎,tiger
狮子,lion
大象,elephant
熊猫,panda
猫,cat
狗,dog
鸟,bird
鱼,fish
兔子,rabbit
马,horse
```

### 颜色词汇 (31-40)
```
红色,red
蓝色,blue
绿色,green
黄色,yellow
黑色,black
白色,white
粉色,pink
紫色,purple
橙色,orange
棕色,brown
```

### 自然词汇 (41-50)
```
天空,sky
太阳,sun
月亮,moon
星星,star
云,cloud
雨,rain
雪,snow
风,wind
山,mountain
河,river
```

### 家庭词汇 (51-60)
```
爸爸,father
妈妈,mother
哥哥,older brother
姐姐,older sister
弟弟,younger brother
妹妹,younger sister
朋友,friend
同学,classmate
医生,doctor
护士,nurse
```

### 时间词汇 (61-70)
```
早上,morning
下午,afternoon
晚上,evening
夜晚,night
今天,today
昨天,yesterday
明天,tomorrow
星期一,Monday
星期二,Tuesday
星期三,Wednesday
```

### 月份词汇 (71-80)
```
一月,January
二月,February
三月,March
四月,April
五月,May
六月,June
七月,July
八月,August
九月,September
十月,October
```

### 季节词汇 (81-90)
```
春天,spring
夏天,summer
秋天,autumn
冬天,winter
热,hot
冷,cold
温暖,warm
凉爽,cool
干燥,dry
潮湿,humid
```

### 其他常用词 (91-100)
```
食物,food
水,water
牛奶,milk
面包,bread
米饭,rice
衣服,clothes
鞋子,shoes
帽子,hat
手表,watch
钱,money
```

## 制作建议

### 题库分类
1. **基础词汇**：适合初学者
2. **主题词汇**：按主题分类（动物、颜色、家庭等）
3. **难度分级**：简单、中等、困难
4. **场景词汇**：学校、家庭、购物、旅游等

### 文件管理
- 文件名建议包含主题和难度信息
- 例如：`animals-easy.csv`、`colors-medium.csv`
- 支持多个题库文件切换使用

### 质量控制
- 确保中英文对应准确
- 避免重复词条
- 定期检查和更新
- 支持用户自定义题库

## 使用说明
1. 创建CSV文件，确保格式正确
2. 将文件保存为UTF-8编码
3. 在应用界面点击"上传题库文件"
4. 选择对应的CSV文件
5. 系统会自动解析并加载题库