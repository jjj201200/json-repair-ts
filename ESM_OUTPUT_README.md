# json-repair-ts ES 模块输出方案

## 概述

此项目现在已经完全支持 ES 模块 (ESM) 的 `import` 语法,可以在现代 JavaScript/TypeScript 项目中直接使用。

## 主要改进

### 1. 优化的 package.json 配置

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "module": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "sideEffects": false
}
```

**关键特性:**
- ✅ `type: "module"` - 声明项目为 ES 模块
- ✅ `exports` 字段 - 现代化的导出声明
- ✅ `sideEffects: false` - 支持 tree-shaking 优化
- ✅ 明确的类型定义路径

### 2. 优化的 TypeScript 配置

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2020",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**关键特性:**
- ✅ `module: "NodeNext"` - 生成正确的 ES 模块
- ✅ `moduleResolution: "NodeNext"` - 正确解析模块路径
- ✅ 自动添加 `.js` 扩展名到导入语句
- ✅ 生成 source maps 和 declaration maps

### 3. 正确的导入路径

所有源文件中的导入语句都包含 `.js` 扩展名:

```typescript
// 源文件 (src/index.ts)
import { repairJson } from './jsonRepair.js';
import { JSONParser } from './jsonParser.js';

// 编译后 (dist/index.js)
import { repairJson } from './jsonRepair.js';
import { JSONParser } from './jsonParser.js';
```

## 使用方式

### 方式 1: 默认导出

```javascript
import jsonRepair from 'json-repair-ts';

const fixed = jsonRepair.repair('{name: "John"}');
const parsed = jsonRepair.loads('{name: "John"}');
```

### 方式 2: 命名导出

```javascript
import { repairJson, loads } from 'json-repair-ts';

const fixed = repairJson('{name: "John"}');
const parsed = loads('{name: "John"}');
```

### 方式 3: 命名空间导入

```javascript
import * as JSONRepair from 'json-repair-ts';

const fixed = JSONRepair.repairJson('{name: "John"}');
const parsed = JSONRepair.loads('{name: "John"}');
```

### 方式 4: TypeScript 类型导入

```typescript
import {
  repairJson,
  type RepairOptions,
  type JSONReturnType
} from 'json-repair-ts';

const options: RepairOptions = {
  returnLogs: true
};
```

## 可用的导出

### 主要函数
- `repairJson(jsonStr, options?)` - 修复并返回 JSON 字符串
- `loads(jsonStr, ...)` - 修复并解析 JSON 字符串
- `load(fd, ...)` - 从文件描述符加载
- `fromFile(filename, ...)` - 从文件加载
- `repairJsonFromFile(filename, options?)` - 从文件修复

### 类型定义
- `RepairOptions` - 修复选项接口
- `JSONReturnType` - JSON 返回值类型
- `LogEntry` - 日志条目类型

### 高级类
- `JSONParser` - JSON 解析器类
- `JsonContext` - JSON 上下文类
- `ObjectComparer` - 对象比较器类
- `ContextValues` - 上下文值枚举

## 兼容性

- ✅ Node.js 14+ (ES2020)
- ✅ 现代浏览器 (支持 ES 模块)
- ✅ TypeScript 4.7+
- ✅ 打包工具 (Webpack, Vite, Rollup, esbuild)

## 运行测试

```bash
# 运行 import 测试
node test-import.mjs

# 运行 TypeScript 示例 (需要 tsx)
npx tsx examples/typescript-import-example.ts

# 运行 ES 模块示例
node examples/esm-import-example.mjs
```

## 构建

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 构建打包版本
npm run build:bundle

# 构建所有
npm run build:all
```

## 输出文件结构

```
dist/
├── index.js              # 主入口文件
├── index.d.ts            # TypeScript 类型定义
├── index.js.map          # Source map
├── index.d.ts.map        # Declaration map
├── jsonRepair.js         # 修复逻辑
├── jsonParser.js         # 解析器
├── jsonContext.js        # 上下文
├── objectComparer.js     # 比较器
├── stringFileWrapper.js  # 文件包装器
├── constants.js          # 常量
├── parsers/              # 解析器模块
│   ├── parseArray.js
│   ├── parseObject.js
│   ├── parseString.js
│   ├── parseNumber.js
│   ├── parseBooleanOrNull.js
│   └── parseComment.js
└── *.d.ts, *.js.map      # 对应的类型和 source maps
```

## Tree-shaking 支持

由于设置了 `"sideEffects": false`,现代打包工具可以自动移除未使用的代码:

```javascript
// 只导入需要的函数
import { loads } from 'json-repair-ts';

// 打包工具会自动移除未使用的 repairJson, load, fromFile 等函数
```

## 示例

查看 `examples/` 目录获取完整示例:

- `esm-import-example.mjs` - ES 模块使用示例
- `typescript-import-example.ts` - TypeScript 使用示例
- `IMPORT_GUIDE.md` - 详细的导入指南

## 常见问题

### Q: 为什么源文件中要写 `.js` 扩展名?

A: 这是 ES 模块的规范要求。在 TypeScript 中,导入语句会原封不动地保留到编译后的 JavaScript 中,因此需要使用 `.js` 扩展名(即使源文件是 `.ts`)。

### Q: 如何在 CommonJS 项目中使用?

A: 虽然推荐使用 ES 模块,但可以使用动态导入:

```javascript
(async () => {
  const { repairJson } = await import('json-repair-ts');
  const result = repairJson('{bad: json}');
})();
```

### Q: 支持浏览器吗?

A: 支持!可以使用打包的版本:

```html
<script type="module">
  import { repairJson } from './dist/json-repair.esm.js';
  console.log(repairJson('{bad: json}'));
</script>
```

## 相关资源

- [Node.js ES 模块文档](https://nodejs.org/api/esm.html)
- [TypeScript 模块解析](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Package.json exports 字段](https://nodejs.org/api/packages.html#exports)

---

**版本:** 1.0.0
**许可证:** ISC
