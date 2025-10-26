# json-repair-ts

[![npm version](https://img.shields.io/npm/v/json-repair-ts.svg)](https://www.npmjs.com/package/json-repair-ts)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

一个强大的 TypeScript JSON 修复库,可以修复各种格式错误的 JSON 字符串。完全支持 ES 模块、TypeScript 类型定义和 tree-shaking。

## ✨ 特性

- 🔧 **修复各种 JSON 错误** - 缺少引号、尾随逗号、注释等
- 📦 **ES 模块支持** - 原生支持 `import` 语法
- 🌳 **Tree-shaking 友好** - 只打包使用的代码
- 💪 **完整的 TypeScript 支持** - 包含类型定义文件
- 🚀 **零依赖** - 无需安装其他包
- 📖 **详细的日志** - 可选的修复日志功能
- ⚡ **高性能** - 基于流式解析

## 📦 安装

```bash
npm install json-repair-ts
```

或使用其他包管理器:

```bash
yarn add json-repair-ts
pnpm add json-repair-ts
```

## 🚀 快速开始

### 基本使用

```javascript
import { repairJson, loads } from 'json-repair-ts';

// 修复并返回 JSON 字符串
const badJson = '{name: "John", age: 30,}';
const fixed = repairJson(badJson);
console.log(fixed);
// 输出: {"name":"John","age":30}

// 修复并直接解析为对象
const parsed = loads(badJson);
console.log(parsed);
// 输出: { name: 'John', age: 30 }
```

### TypeScript 使用

```typescript
import { loads, type RepairOptions } from 'json-repair-ts';

interface User {
  name: string;
  age: number;
}

const badJson = "{name: 'Alice', age: 25,}";
const user = loads(badJson) as User;

console.log(user.name); // "Alice"
console.log(user.age);  // 25
```

## 📚 API 文档

### 主要函数

#### `repairJson(jsonStr: string, options?: RepairOptions): string`

修复 JSON 字符串并返回修复后的字符串。

```javascript
import { repairJson } from 'json-repair-ts';

const result = repairJson('{name: "John"}');
// 返回: '{"name":"John"}'
```

#### `loads(jsonStr: string, skipJsonLoads?: boolean, logging?: boolean): any`

修复并解析 JSON 字符串,类似于 `JSON.parse()`。

```javascript
import { loads } from 'json-repair-ts';

const obj = loads('{name: "John", age: 30,}');
// 返回: { name: 'John', age: 30 }
```

#### `load(fd: number, skipJsonLoads?: boolean, logging?: boolean): any`

从文件描述符读取并修复 JSON。

```javascript
import { load } from 'json-repair-ts';
import fs from 'fs';

const fd = fs.openSync('data.json', 'r');
const data = load(fd);
fs.closeSync(fd);
```

#### `fromFile(filename: string, skipJsonLoads?: boolean, logging?: boolean): any`

从文件读取并修复 JSON。

```javascript
import { fromFile } from 'json-repair-ts';

const data = fromFile('./data.json');
console.log(data);
```

#### `repairJsonFromFile(filename: string, options?: RepairOptions): string`

从文件读取、修复并返回 JSON 字符串。

```javascript
import { repairJsonFromFile } from 'json-repair-ts';

const fixedJson = repairJsonFromFile('./data.json');
console.log(fixedJson);
```

### 选项

```typescript
interface RepairOptions {
  returnObjects?: boolean;  // 返回对象而不是字符串
  skipJsonLoads?: boolean;  // 跳过原生 JSON.parse 尝试
  logging?: boolean;        // 返回修复日志
  streamStable?: boolean;   // 流式解析稳定性模式
  ensureAscii?: boolean;    // 确保 ASCII 输出
  indent?: number;          // 缩进空格数(默认 2)
}
```

### 带选项的使用

```javascript
import { load } from 'json-repair-ts';

const result = load(badJson, {
  returnLogs: true,
  logging: true
});

console.log(result.data);  // 解析后的数据
console.log(result.logs);  // 修复日志
```

## 🔧 能修复的错误

### 1. 缺少引号

```javascript
loads('{name: "John"}')
// ✓ 自动添加引号
```

### 2. 单引号

```javascript
loads("{'name': 'John'}")
// ✓ 转换为双引号
```

### 3. 尾随逗号

```javascript
loads('[1, 2, 3,]')
// ✓ 移除尾随逗号
```

### 4. 注释

```javascript
loads(`{
  // 注释
  "name": "John"
}`)
// ✓ 移除注释
```

### 5. 未闭合的括号

```javascript
loads('[1, 2, 3')
// ✓ 自动闭合
```

### 6. 混合引号

```javascript
loads('{name: "John", city: \'Beijing\'}')
// ✓ 统一为双引号
```

## 📖 使用示例

### 示例 1: 处理 API 响应

```javascript
import { loads } from 'json-repair-ts';

// 假设从某个地方获得了格式不规范的 JSON
const apiResponse = `{
  users: [
    {name: 'Alice', age: 25,},
    {name: 'Bob', age: 30,}
  ]
}`;

const data = loads(apiResponse);
console.log(data.users);
// [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
```

### 示例 2: 读取配置文件

```javascript
import { fromFile } from 'json-repair-ts';

// config.json 可能包含注释和尾随逗号
const config = fromFile('./config.json');
console.log(config);
```

### 示例 3: 获取修复日志

```javascript
import { load } from 'json-repair-ts';

const badJson = '{name: "John", age: 30,}';
const result = load(badJson, { returnLogs: true });

console.log('数据:', result.data);
console.log('修复日志:', result.logs);
// 显示所有修复操作
```

## 🎯 导入方式

### 默认导出

```javascript
import jsonRepair from 'json-repair-ts';

jsonRepair.repair('{bad: json}');
jsonRepair.loads('{bad: json}');
```

### 命名导出

```javascript
import { repairJson, loads } from 'json-repair-ts';

repairJson('{bad: json}');
loads('{bad: json}');
```

### 命名空间导入

```javascript
import * as JSONRepair from 'json-repair-ts';

JSONRepair.repairJson('{bad: json}');
JSONRepair.loads('{bad: json}');
```

### TypeScript 类型导入

```typescript
import {
  type RepairOptions,
  type JSONReturnType,
  type LogEntry
} from 'json-repair-ts';
```

## 🏗️ 高级用法

### 使用 JSONParser 类

```javascript
import { JSONParser } from 'json-repair-ts';

const parser = new JSONParser('{bad: "json"}');
const result = parser.parse();
console.log(result.data);
```

### 类型定义

```typescript
import { JSONParser, JsonContext, ObjectComparer } from 'json-repair-ts';

// 使用高级类进行自定义解析
```

## 🌐 兼容性

- ✅ Node.js 14+
- ✅ 现代浏览器 (支持 ES2020)
- ✅ TypeScript 4.7+
- ✅ 打包工具: Webpack, Vite, Rollup, esbuild

## 📄 许可证

ISC License

## 🤝 贡献

欢迎贡献代码!请随时提交 Issue 或 Pull Request。

## 🔗 相关链接

- [GitHub 仓库](https://github.com/yourusername/json-repair-ts)
- [npm 包](https://www.npmjs.com/package/json-repair-ts)
- [问题反馈](https://github.com/yourusername/json-repair-ts/issues)

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 获取详细的版本更新信息。

---

**关键词:** JSON 修复, JSON 解析, TypeScript, ES 模块, malformed JSON, broken JSON
