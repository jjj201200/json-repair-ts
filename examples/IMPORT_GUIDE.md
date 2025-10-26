# json-repair-ts Import 使用指南

本指南详细说明如何在不同的 JavaScript/TypeScript 项目中使用 `import` 语法导入 `json-repair-ts`。

## 目录

- [安装](#安装)
- [ES 模块 (ESM) 使用](#es-模块-esm-使用)
- [TypeScript 项目使用](#typescript-项目使用)
- [不同导入方式](#不同导入方式)
- [常见问题](#常见问题)

---

## 安装

### 本地安装

```bash
npm install json-repair-ts
```

### 从源码构建

```bash
cd json-repair-ts
npm install
npm run build
```

---

## ES 模块 (ESM) 使用

### 基本导入方式

#### 方式 1: 默认导出

```javascript
import jsonRepair from 'json-repair-ts';

const badJson = '{name: "John", age: 30,}';
const fixed = jsonRepair.repair(badJson);
const parsed = jsonRepair.loads(badJson);
```

#### 方式 2: 命名导出

```javascript
import { repairJson, loads, load } from 'json-repair-ts';

const badJson = '{name: "John", age: 30,}';
const fixed = repairJson(badJson);
const parsed = loads(badJson);
```

#### 方式 3: 命名空间导入

```javascript
import * as JSONRepair from 'json-repair-ts';

const badJson = '{name: "John", age: 30,}';
const fixed = JSONRepair.repairJson(badJson);
const parsed = JSONRepair.loads(badJson);
```

### 在 Node.js 中使用

确保你的 `package.json` 包含:

```json
{
  "type": "module"
}
```

或者使用 `.mjs` 文件扩展名:

```bash
node example.mjs
```

---

## TypeScript 项目使用

### 基本导入

```typescript
import { repairJson, loads, type RepairOptions } from 'json-repair-ts';

const badJson: string = '{name: "John", age: 30,}';
const fixed: string = repairJson(badJson);
const parsed = loads(badJson);
```

### 带类型注解

```typescript
import { loads } from 'json-repair-ts';

interface User {
  name: string;
  age: number;
}

const badJson = "{name: 'Alice', age: 25,}";
const user = loads(badJson) as User;
```

### 导入类型定义

```typescript
import {
  type RepairOptions,
  type JSONReturnType,
  type LogEntry
} from 'json-repair-ts';

const options: RepairOptions = {
  returnLogs: true
};
```

### 使用高级类

```typescript
import { JSONParser, JsonContext } from 'json-repair-ts';

const parser = new JSONParser('{bad: "json",}');
const result = parser.parse();
```

---

## 不同导入方式对比

| 导入方式 | 语法 | 优点 | 使用场景 |
|---------|------|------|---------|
| 默认导出 | `import jsonRepair from 'json-repair-ts'` | 简洁,包含所有主要方法 | 需要多个方法时 |
| 命名导出 | `import { repairJson } from 'json-repair-ts'` | 明确,支持 tree-shaking | 只需要特定函数 |
| 命名空间 | `import * as JSONRepair from 'json-repair-ts'` | 避免命名冲突 | 与其他库集成 |
| 类型导出 | `import { type RepairOptions } from 'json-repair-ts'` | TypeScript 类型安全 | TypeScript 项目 |

---

## 可用的导出

### 主要函数

```typescript
import {
  repairJson,       // 修复并返回 JSON 字符串
  loads,            // 修复并解析 JSON 字符串
  load,             // 修复并解析,支持选项
  fromFile,         // 从文件加载(Node.js)
  repairJsonFromFile // 从文件修复(Node.js)
} from 'json-repair-ts';
```

### 类型定义

```typescript
import {
  type RepairOptions,   // 修复选项类型
  type JSONReturnType,  // JSON 返回值类型
  type LogEntry         // 日志条目类型
} from 'json-repair-ts';
```

### 高级类

```typescript
import {
  JSONParser,        // JSON 解析器类
  JsonContext,       // JSON 上下文类
  ObjectComparer,    // 对象比较器类
  ContextValues      // 上下文值类型
} from 'json-repair-ts';
```

---

## 使用示例

### 修复简单的 JSON 字符串

```javascript
import { repairJson } from 'json-repair-ts';

const badJson = "{name: 'John', age: 30,}";
const fixed = repairJson(badJson);
// 输出: {"name":"John","age":30}
```

### 修复并解析 JSON

```javascript
import { loads } from 'json-repair-ts';

const badJson = "{name: 'Alice', city: 'Beijing',}";
const parsed = loads(badJson);
console.log(parsed.name);  // "Alice"
console.log(parsed.city);  // "Beijing"
```

### 带选项的修复

```javascript
import { load } from 'json-repair-ts';

const badJson = `{
  // 注释
  name: "Bob",
  age: 35,
}`;

const result = load(badJson, { returnLogs: true });
console.log(result.data);  // 解析后的数据
console.log(result.logs);  // 修复日志
```

### 处理文件 (Node.js)

```javascript
import { fromFile } from 'json-repair-ts';

const data = await fromFile('./data.json');
console.log(data);
```

---

## package.json 配置

你的项目的 `package.json` 应该包含:

```json
{
  "type": "module",
  "dependencies": {
    "json-repair-ts": "^1.0.0"
  }
}
```

### TypeScript 配置

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2020",
    "lib": ["ES2020"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

---

## 常见问题

### Q: 为什么导入失败?

**A:** 确保:
1. 已安装包: `npm install json-repair-ts`
2. `package.json` 中设置了 `"type": "module"`
3. 或使用 `.mjs` 文件扩展名

### Q: TypeScript 中找不到类型定义?

**A:** 确保:
1. 已构建项目: `npm run build`
2. `dist` 目录存在且包含 `.d.ts` 文件
3. `tsconfig.json` 中 `moduleResolution` 设置正确

### Q: 能否在浏览器中使用?

**A:** 可以!使用打包后的版本:

```html
<script type="module">
  import { repairJson } from './dist/json-repair.esm.js';
  const fixed = repairJson('{bad: "json"}');
</script>
```

### Q: 支持 CommonJS 吗?

**A:** 推荐使用 ES 模块。如果必须使用 CommonJS,可以使用动态导入:

```javascript
(async () => {
  const { repairJson } = await import('json-repair-ts');
  const fixed = repairJson('{bad: "json"}');
})();
```

---

## 更多示例

查看 `examples` 目录中的完整示例:

- `esm-import-example.mjs` - ES 模块使用示例
- `typescript-import-example.ts` - TypeScript 使用示例

运行示例:

```bash
# ES 模块示例
node examples/esm-import-example.mjs

# TypeScript 示例
npx tsx examples/typescript-import-example.ts
```

---

## 参考资源

- [ES 模块规范](https://nodejs.org/api/esm.html)
- [TypeScript 模块解析](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [npm package.json 字段说明](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

---

## 许可证

ISC
