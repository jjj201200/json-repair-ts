# JSON Repair 测试 Demo

这是一个简单的单页应用，用于测试 JSON Repair 库的功能。

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件
2. 在左侧输入框中输入需要修复的 JSON
3. 点击"修复 JSON"按钮
4. 右侧将显示修复后的 JSON 结果
5. 底部日志区域会显示操作记录

## 功能特点

- **左侧输入区**：输入待修复的 JSON 字符串
- **右侧输出区**：显示修复后的格式化 JSON
- **底部日志区**：显示操作日志和错误信息
- **示例数据**：点击"加载示例"快速体验

## 技术说明

本 demo 使用了编译打包后的库文件：
- 引用文件：`../dist/json-repair.bundle.js`
- 格式：IIFE (立即调用函数表达式)
- 全局变量：`JsonRepair`
- 主要 API：`JsonRepair.repairJson(jsonString, options)`

## 支持的修复类型

- 缺少引号的对象键名
- 单引号字符串
- 尾随逗号
- 多种其他 JSON 格式问题

## 构建

如需重新构建库文件，在项目根目录运行：

```bash
npm run build:bundle
```

这将生成两个版本：
- `dist/json-repair.bundle.js` - IIFE 格式，用于直接在浏览器中通过 `<script>` 标签引入
- `dist/json-repair.esm.js` - ESM 格式，用于在现代浏览器中通过 `<script type="module">` 引入
