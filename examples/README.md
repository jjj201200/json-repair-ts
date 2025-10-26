# JSON Repair 使用示例

本目录包含了在不同环境下使用 json-repair-ts 的示例代码。

## 📦 可用的构建格式

json-repair-ts 提供了多种构建格式,适用于不同的使用场景:

| 格式 | 文件 | 使用场景 | 加载方式 |
|------|------|----------|----------|
| **CommonJS/ES Module** | `dist/index.js` | Node.js 项目 | `import` / `require` |
| **UMD** | `dist/json-repair.umd.js` | 浏览器 + Node.js 通用 | `<script>` / `require` |
| **UMD Minified** | `dist/json-repair.umd.min.js` | 生产环境浏览器 | `<script>` (CDN) |
| **ESM** | `dist/json-repair.esm.js` | 现代浏览器 | `<script type="module">` |
| **IIFE** | `dist/json-repair.bundle.js` | 浏览器全局变量 | `<script>` |

## 🚀 快速开始

### 1. Node.js 环境 (ESM)

```javascript
// 使用 ES Module 导入
import { repairJson, loads } from 'json-repair-ts';

const result = repairJson('{name: "John", age: 30}');
console.log(result); // {"name": "John", "age": 30}

const obj = loads('{status: "ok"}');
console.log(obj); // { status: 'ok' }
```

运行示例:
```bash
node examples/node-example.js
```

### 2. Node.js 环境 (CommonJS)

```javascript
// 使用 require 导入 UMD 版本
const JsonRepair = require('json-repair-ts/umd');

const result = JsonRepair.repairJson('{name: "John"}');
console.log(result);
```

运行示例:
```bash
node examples/node-commonjs-example.cjs
```

### 3. 浏览器环境 (UMD)

```html
<!-- 通过 script 标签引入 -->
<script src="path/to/json-repair.umd.js"></script>
<script>
  const result = JsonRepair.repairJson('{name: "John"}');
  console.log(result);
</script>
```

在浏览器中打开:
```bash
# 可以使用任何本地服务器,例如:
npx http-server examples -p 8080
# 然后访问 http://localhost:8080/browser-example.html
```

### 4. 现代浏览器 (ES Module)

```html
<script type="module">
  import { repairJson } from './path/to/json-repair.esm.js';

  const result = repairJson('{name: "John"}');
  console.log(result);
</script>
```

### 5. CDN 引入 (生产环境)

```html
<!-- 使用 unpkg -->
<script src="https://unpkg.com/json-repair-ts/dist/json-repair.umd.min.js"></script>

<!-- 或使用 jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/json-repair-ts/dist/json-repair.umd.min.js"></script>

<script>
  // 全局变量 JsonRepair 已可用
  const fixed = JsonRepair.repairJson('{broken: "json"}');
</script>
```

## 📝 API 说明

### repairJson(jsonStr, options?)

修复 JSON 字符串并返回格式化后的字符串。

```javascript
const result = repairJson('{name: "John"}', {
  returnObjects: false, // 返回字符串还是对象
  skipJsonLoads: false, // 跳过 JSON.parse 验证
  logging: false,       // 启用日志记录
  indent: 2             // 缩进空格数
});
```

### loads(jsonStr, skipJsonLoads?, logging?, streamStable?)

修复 JSON 字符串并返回 JavaScript 对象。

```javascript
const obj = loads('{name: "John"}');
console.log(obj); // { name: 'John' }
```

### fromFile(filename, ...) - 仅 Node.js

从文件读取并修复 JSON。**注意:此功能仅在 Node.js 环境可用。**

```javascript
// 仅在 Node.js 中可用
import { fromFile } from 'json-repair-ts';
const obj = fromFile('./data.json');
```

在浏览器中尝试使用会抛出错误:
```
Error: fromFile() is only available in Node.js environment.
In browser, use repairJson() with string input instead.
```

## 🔍 环境自适应

json-repair-ts 能够自动检测运行环境:

- ✅ **Node.js**: 所有功能可用,包括文件操作
- ✅ **浏览器**: 字符串处理功能可用,文件操作会给出友好的错误提示

```javascript
// 这段代码在两种环境下都能工作
import { repairJson } from 'json-repair-ts';

const fixed = repairJson('{name: "John"}');
console.log(fixed); // 在 Node.js 和浏览器中都能正常运行
```

## 🎯 使用场景

1. **Web 应用**: 处理来自 API 的不规范 JSON
2. **Node.js 工具**: 修复配置文件、日志文件中的 JSON
3. **数据处理**: 清理和标准化 JSON 数据
4. **开发工具**: 构建 JSON 格式化和验证工具

## 📋 支持的 JSON 修复类型

- ✅ 缺少引号的键: `{name: "value"}` → `{"name": "value"}`
- ✅ 单引号: `{'key': 'value'}` → `{"key": "value"}`
- ✅ 尾随逗号: `[1, 2, 3,]` → `[1, 2, 3]`
- ✅ 缺少逗号: `{"a": 1 "b": 2}` → `{"a": 1, "b": 2}`
- ✅ 注释: `{/* comment */ "key": "value"}` → `{"key": "value"}`
- ✅ 更多...

## 🛠️ 构建项目

```bash
# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 构建浏览器版本 (UMD, ESM, IIFE)
npm run build:bundle

# 构建所有格式
npm run build:all
```

## 💡 更多信息

查看项目的主 README.md 获取更多详细信息和高级用法。
