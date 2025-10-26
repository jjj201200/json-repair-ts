# JSON 修复方案详细说明

## 概述

本项目实现了一个智能的 JSON 修复解析器，能够处理各种格式不规范的 JSON 字符串，并将其转换为标准的 JSON 格式。该方案采用了容错性强的递归下降解析器架构。

## 核心设计理念

1. **优先尝试标准解析**：先使用原生 `JSON.parse()` 尝试解析，如果成功则直接返回
2. **容错解析**：当标准解析失败时，启用自定义解析器进行智能修复
3. **上下文感知**：通过上下文栈跟踪当前解析位置（对象键、对象值、数组）
4. **增量修复**：在解析过程中实时修复问题，而不是预处理整个字符串

## 整体架构

### 主要模块

```
┌─────────────────────────────────────────────────────────────┐
│                      jsonRepair.ts                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  repairJson(jsonStr, options)                         │  │
│  │  - 入口函数，决定使用标准解析还是自定义解析            │  │
│  │  - 处理返回格式（对象/字符串/带日志）                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      jsonParser.ts                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  JSONParser                                           │  │
│  │  - 核心解析引擎                                        │  │
│  │  - 维护解析索引和上下文                               │  │
│  │  - 协调各个子解析器                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ parseObject  │  │ parseArray   │  │ parseString  │
│ parseNumber  │  │ parseComment │  │ parseBoolean │
└──────────────┘  └──────────────┘  └──────────────┘
            │                 │                 │
            └─────────────────┴─────────────────┘
                            │
                            ▼
            ┌──────────────────────────────┐
            │    jsonContext.ts             │
            │  - 上下文栈管理               │
            │  - OBJECT_KEY                │
            │  - OBJECT_VALUE              │
            │  - ARRAY                     │
            └──────────────────────────────┘
```

## 核心流程

### 1. 主入口流程

```mermaid
graph TD
    A[调用 repairJson] --> B{skipJsonLoads?}
    B -->|否| C[尝试 JSON.parse]
    B -->|是| D[直接使用 JSONParser]
    C -->|成功| E[返回解析结果]
    C -->|失败| D
    D --> F[创建 JSONParser 实例]
    F --> G[执行 parser.parse]
    G --> H{logging?}
    H -->|是| I[返回结果和日志]
    H -->|否| J{returnObjects?}
    J -->|是| K[返回对象]
    J -->|否| L[返回 JSON 字符串]
```

### 2. JSONParser 解析流程

```mermaid
graph TD
    A[parse 开始] --> B[调用 parseJson]
    B --> C{字符类型?}
    C -->|左花括号| D[parseObject]
    C -->|左方括号| E[parseArray]
    C -->|引号或字母| F[parseString]
    C -->|数字或负号| G[parseNumber]
    C -->|注释符| H[parseComment]
    C -->|其他| I[跳过字符]

    D --> J{还有更多JSON?}
    E --> J
    F --> J
    G --> J
    H --> J
    I --> C

    J -->|是| K[检查是否为相同对象更新]
    J -->|否| L[返回结果]
    K -->|是| M[替换之前的对象]
    K -->|否| N[添加到数组]
    M --> O[继续解析]
    N --> O
    O --> B
```

### 3. 对象解析流程（parseObject）

```mermaid
graph TD
    A[parseObject 开始] --> B[初始化空对象]
    B --> C{当前字符不是右花括号}
    C -->|是| D[跳过空白]
    C -->|否| Z[返回对象]

    D --> E{发现冒号?}
    E -->|是| F[转为逗号处理]
    E -->|否| G[设置上下文 OBJECT_KEY]

    F --> G
    G --> H[解析键名 parseString]

    H --> I{键名为空?}
    I -->|是且在数组中| J{键名重复?}
    I -->|否| K[跳过空白]

    J -->|是| L[回滚索引并插入左花括号]
    J -->|否| K

    K --> M{发现冒号?}
    M -->|否| N[记录日志缺少冒号]
    M -->|是| O[索引递增]

    N --> P[设置上下文 OBJECT_VALUE]
    O --> P

    P --> Q{发现逗号或右花括号?}
    Q -->|是| R[值为空字符串]
    Q -->|否| S[调用 parseJson 解析值]

    R --> T[将键值对添加到对象]
    S --> T

    T --> U[重置上下文]
    U --> V{发现逗号?}
    V -->|是| W[索引递增]
    V -->|否| X{发现右花括号?}

    W --> C
    X -->|否| Y[记录缺少逗号]
    X -->|是| C
    Y --> C

    L --> Z
```

### 4. 字符串解析流程（parseString）

```mermaid
graph TD
    A[parseString 开始] --> B{发现引号?}
    B -->|否| C{发现字母或数字?}
    B -->|是| D[记录引号类型]

    C -->|是| E{是t或f或n开头?}
    C -->|否| F[跳过无效字符]

    E -->|是且非对象键| G[尝试 parseBoolean]
    E -->|否| H[标记缺少引号]

    F --> B
    G --> I{解析成功?}
    I -->|是| J[返回布尔值或null]
    I -->|否| H

    D --> K{双引号?}
    K -->|是| L{空字符串?}
    K -->|否| M[开始收集字符]

    L -->|是| N[返回空字符串]
    L -->|否| O{后面还有引号?}

    O -->|是| P[标记双引号包裹]
    O -->|否| M

    H --> M
    P --> M

    M --> Q{当前字符不是右引号}
    Q -->|是| R{缺少引号且遇到终止符?}
    Q -->|否| AA[跳过右引号]

    R -->|是| S[停止解析]
    R -->|否| T{对象值上下文且遇到逗号或右花括号?}

    T -->|是| U{确定缺少右引号?}
    T -->|否| V{转义字符?}

    U -->|是| S
    U -->|否| V

    V -->|是| W[处理转义序列]
    V -->|否| X[添加字符到结果]

    W --> Y[索引递增]
    X --> Y
    Y --> Q

    AA --> AB{缺少右引号?}
    AB -->|是| AC[修剪尾部空白]
    AB -->|否| AD[返回字符串]

    S --> AC
    AC --> AD
```

### 5. 数组解析流程（parseArray）

```mermaid
graph TD
    A[parseArray 开始] --> B[初始化空数组]
    B --> C[设置上下文 ARRAY]
    C --> D[跳过空白]

    D --> E{当前字符不是右方括号}
    E -->|否| Z[返回数组]
    E -->|是| F[跳过空白]

    F --> G{发现右方括号?}
    G -->|是| H[处理尾随逗号]
    G -->|否| I[调用 parseJson]

    H --> Z
    I --> J{值为空?}

    J -->|是且不是空字符串| K[跳过该值]
    J -->|否| L[添加到数组]

    K --> M[跳过空白]
    L --> M

    M --> N{发现逗号?}
    N -->|是| O[索引递增]
    N -->|否| P{发现右方括号?}

    O --> Q[记录找到逗号]
    P -->|否| R[记录缺少逗号]
    P -->|是| E

    Q --> S[跳过空白]
    R --> S

    S --> T{连续逗号?}
    T -->|是| U[添加null到数组]
    T -->|否| E

    U --> V[索引递增]
    V --> S
```

## 支持的修复类型

### 1. 对象键名问题

#### 缺少引号
```javascript
// 输入
{name: "value", age: 123}

// 输出
{"name": "value", "age": 123}
```

**修复策略**：在 `parseString` 中检测到字母数字开头且在 `OBJECT_KEY` 上下文时，标记 `missingQuotes=true`，遇到 `:` 或空白时停止收集。

#### 单引号
```javascript
// 输入
{'name': 'value'}

// 输出
{"name": "value"}
```

**修复策略**：`parseString` 识别单引号作为字符串分隔符，正常解析后由 `JSON.stringify` 转换为双引号。

### 2. 尾随逗号

#### 对象尾随逗号
```javascript
// 输入
{"name": "value", "age": 123,}

// 输出
{"name": "value", "age": 123}
```

**修复策略**：在 `parseObject` 的循环中，遇到 `,` 后检查下一个字符，如果是 `}`，则自动终止键值对解析。

#### 数组尾随逗号
```javascript
// 输入
[1, 2, 3,]

// 输出
[1, 2, 3]
```

**修复策略**：在 `parseArray` 中，解析逗号后检查下一个字符，如果是 `]`，则跳出循环。

### 3. 缺少逗号

#### 对象缺少逗号
```javascript
// 输入
{"name": "value" "age": 123}

// 输出
{"name": "value", "age": 123}
```

**修复策略**：在 `parseObject` 中，解析完一个键值对后，如果下一个字符不是 `,` 也不是 `}`，记录日志但继续解析下一个键。

#### 数组缺少逗号
```javascript
// 输入
[1 2 3]

// 输出
[1, 2, 3]
```

**修复策略**：在 `parseArray` 中，解析完一个元素后，如果下一个字符不是 `,` 也不是 `]`，记录日志但继续解析。

### 4. 缺少引号

#### 字符串缺少左引号
```javascript
// 输入
{"name": value"}

// 输出
{"name": "value"}
```

**修复策略**：在 `parseString` 中检测到字母开头但不是布尔值时，标记 `missingQuotes=true`，根据上下文（`:`、`,`、`}`、`]`）判断字符串结束。

#### 字符串缺少右引号
```javascript
// 输入
{"name": "value}

// 输出
{"name": "value"}
```

**修复策略**：在 `parseString` 中，当处于 `OBJECT_VALUE` 上下文且遇到 `,` 或 `}` 时，检查是否缺少右引号，如果确认缺少则停止收集。

### 5. 注释

```javascript
// 输入
{
  // 这是注释
  "name": "value", # Python 风格注释
  "age": 123
}

// 输出
{"name": "value", "age": 123}
```

**修复策略**：`parseComment` 函数检测 `//`、`/**/` 和 `#` 风格的注释，跳过整个注释块。

### 6. 多个 JSON 对象

```javascript
// 输入
{"a": 1} {"b": 2}

// 输出
[{"a": 1}, {"b": 2}]
```

**修复策略**：在 `parse()` 方法中，解析完第一个 JSON 后检查是否还有字符，如果有则继续解析并将结果放入数组。

### 7. 对象更新模式

```javascript
// 输入
{"name": "old"} {"name": "new", "age": 123}

// 输出
{"name": "new", "age": 123}
```

**修复策略**：使用 `ObjectComparer.isSameObject()` 检测新对象是否为旧对象的更新版本（键的包含关系），如果是则替换而非追加。

### 8. 重复键处理

```javascript
// 输入（在数组中的对象）
[{"id": 1, "name": "a", "id": 2}]

// 输出
[{"id": 1, "name": "a"}, {"id": 2}]
```

**修复策略**：在 `parseObject` 中，如果在 `ARRAY` 上下文中检测到重复键，回滚索引并插入 `{` 来分割成两个对象。

### 9. 转义序列

```javascript
// 输入
{"text": "line1\nline2\ttab"}

// 输出
{"text": "line1\nline2\ttab"}
```

**修复策略**：在 `parseString` 中识别 `\t`、`\n`、`\r`、`\b`、`\\` 和 Unicode 转义 `\uXXXX`，转换为实际字符。

## 上下文管理机制

### 上下文栈

`JsonContext` 类维护一个上下文栈，用于追踪解析器当前所在的位置：

```typescript
enum ContextValues {
  OBJECT_KEY = "OBJECT_KEY",      // 正在解析对象的键
  OBJECT_VALUE = "OBJECT_VALUE",  // 正在解析对象的值
  ARRAY = "ARRAY"                 // 正在解析数组元素
}
```

### 上下文使用示例

```
解析: {"items": [1, 2], "name": "test"}

位置              上下文栈                    说明
─────────────────────────────────────────────────────────
{                []                         进入对象
"items"          [OBJECT_KEY]               解析键
:                [OBJECT_VALUE]             准备解析值
[                [OBJECT_VALUE, ARRAY]      进入数组
1                [OBJECT_VALUE, ARRAY]      解析数组元素
]                [OBJECT_VALUE]             退出数组
"name"           [OBJECT_KEY]               解析下一个键
:                [OBJECT_VALUE]             准备解析值
"test"           [OBJECT_VALUE]             解析值
}                []                         退出对象
```

### 上下文的作用

1. **区分字符串类型**：在 `OBJECT_KEY` 上下文中，字母开头会被视为无引号的键名；在其他上下文中可能是布尔值
2. **确定终止符**：
   - `OBJECT_KEY`: `:` 或空白表示键名结束
   - `OBJECT_VALUE`: `,` 或 `}` 表示值结束
   - `ARRAY`: `,` 或 `]` 表示元素结束
3. **处理特殊情况**：在数组中的对象如果有重复键，需要分割成多个对象

## 日志系统

当 `logging: true` 时，解析器会记录修复过程：

```typescript
interface LogEntry {
  text: string;      // 日志消息
  context: string;   // 出错位置的上下文（前后10个字符）
}
```

### 日志示例

```javascript
const [result, logs] = repairJson(
  '{name: "test"}',
  { returnObjects: true, logging: true }
);

// logs:
[
  {
    text: "While parsing a string, we found a literal instead of a quote",
    context: "{name: \"te"
  }
]
```

## 性能优化

### 1. 优先标准解析
先尝试 `JSON.parse()`，只有失败时才使用自定义解析器，提高处理标准 JSON 的性能。

### 2. 增量解析
边解析边修复，不需要预处理整个字符串，减少内存占用和处理时间。

### 3. 条件日志
默认禁用日志，避免字符串切片和对象创建的开销：
```typescript
if (!logging) {
  this.log = () => {}; // No-op
}
```

### 4. 流式文件处理
支持通过文件描述符流式读取大文件，使用 `StringFileWrapper` 分块读取：
```typescript
const result = fromFile('large.json', false, false, 1024 * 1024);
```

## 配置选项

```typescript
interface RepairOptions {
  returnObjects?: boolean;   // true: 返回对象, false: 返回字符串
  skipJsonLoads?: boolean;   // true: 跳过 JSON.parse 尝试
  logging?: boolean;         // true: 启用日志记录
  streamStable?: boolean;    // 流式模式（针对未完成的流）
  ensureAscii?: boolean;     // 确保输出为 ASCII
  indent?: number;           // JSON 字符串缩进（默认 2）
}
```

## API 使用示例

### 基本用法

```typescript
import { repairJson } from 'json-repair-ts';

// 返回修复后的 JSON 字符串
const jsonString = repairJson('{name: "test", value: 123,}');
// '{"name": "test", "value": 123}'

// 返回 JavaScript 对象
const obj = repairJson(
  '{name: "test"}',
  { returnObjects: true }
);
// { name: "test" }
```

### 带日志的调试

```typescript
const [result, logs] = repairJson(
  '{name: test, value: 123}',
  { returnObjects: true, logging: true }
);

console.log('Result:', result);
console.log('修复日志:');
logs.forEach(log => {
  console.log(`  ${log.text}`);
  console.log(`    上下文: ${log.context}`);
});
```

### 从文件读取

```typescript
import { repairJsonFromFile } from 'json-repair-ts';

const result = repairJsonFromFile('data.json', {
  returnObjects: true
});
```

### 浏览器中使用

```html
<script src="dist/json-repair.bundle.js"></script>
<script>
  const result = JsonRepair.repairJson(
    '{name: "test"}',
    { returnObjects: true }
  );
  console.log(result);
</script>
```

## 测试建议

### 1. 基本功能测试
```typescript
// 测试无引号键名
expect(repairJson('{name: "test"}')).toBe('{"name": "test"}');

// 测试尾随逗号
expect(repairJson('[1, 2, 3,]')).toBe('[1, 2, 3]');

// 测试缺少逗号
expect(repairJson('{"a": 1 "b": 2}')).toBe('{"a": 1, "b": 2}');
```

### 2. 边界情况测试
```typescript
// 空对象
expect(repairJson('{}')).toBe('{}');

// 空数组
expect(repairJson('[]')).toBe('[]');

// 空字符串
expect(repairJson('""')).toBe('""');

// 嵌套结构
expect(repairJson('{a: {b: [1, 2,]}}'))
  .toBe('{"a": {"b": [1, 2]}}');
```

### 3. 性能测试
```typescript
// 大文件
const start = Date.now();
const result = repairJsonFromFile('large.json');
const duration = Date.now() - start;
console.log(`处理耗时: ${duration}ms`);
```

## 已知限制

1. **无效的 Unicode 字符**：某些损坏的 Unicode 序列可能无法正确修复
2. **深度嵌套**：极深的嵌套可能导致栈溢出（虽然 JavaScript 的调用栈限制较高）
3. **特殊数字格式**：如 `NaN`、`Infinity` 等非标准 JSON 数字会被当作字符串处理
4. **混合模式**：同时存在多种格式问题时，某些边界情况可能无法完美修复

## 扩展与定制

### 添加新的修复规则

1. 在 `parsers/` 目录下创建新的解析器函数
2. 在 `JSONParser` 类中绑定该函数
3. 在 `parseJson()` 方法中添加触发条件

### 自定义日志输出

```typescript
class CustomLogger {
  logs: LogEntry[] = [];

  add(text: string, context: string) {
    this.logs.push({ text, context });
    console.log(`[修复] ${text}`);
  }
}
```

## 总结

本 JSON 修复方案采用了智能容错解析的方式，通过上下文感知和增量修复，能够处理大多数常见的 JSON 格式问题。其核心优势在于：

1. ✅ **高兼容性**：支持多种格式问题的修复
2. ✅ **性能优化**：优先使用标准解析，增量处理
3. ✅ **灵活配置**：支持多种输出格式和调试选项
4. ✅ **易于扩展**：模块化设计便于添加新的修复规则
5. ✅ **跨平台**：同时支持 Node.js 和浏览器环境

该方案特别适用于处理来自非标准来源的 JSON 数据，如 AI 生成的输出、日志文件、或用户输入等场景。
