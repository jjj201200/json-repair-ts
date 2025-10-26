/**
 * ESM Import 使用示例
 *
 * 此示例展示如何在 ES 模块中使用 import 语法导入 json-repair-ts
 */

// 方式 1: 导入默认导出
import jsonRepair from 'json-repair-ts';

// 方式 2: 命名导入 - 导入主要函数
import { repairJson, loads, load } from 'json-repair-ts';

// 方式 3: 导入所有命名导出
import * as JSONRepair from 'json-repair-ts';

// 方式 4: 导入类型(TypeScript 项目中)
// import { type RepairOptions, type JSONReturnType } from 'json-repair-ts';

console.log('=== json-repair-ts ESM 导入示例 ===\n');

// 示例 1: 使用默认导出
console.log('示例 1: 使用默认导出');
const badJson1 = '{name: "John", age: 30,}';
const fixed1 = jsonRepair.repair(badJson1);
console.log('输入:', badJson1);
console.log('输出:', fixed1);
console.log('解析:', jsonRepair.loads(badJson1));
console.log();

// 示例 2: 使用命名导出
console.log('示例 2: 使用命名导出');
const badJson2 = "{'key': 'value', 'number': 123,}";
const fixed2 = repairJson(badJson2);
console.log('输入:', badJson2);
console.log('输出:', fixed2);
console.log('解析:', loads(badJson2));
console.log();

// 示例 3: 使用命名空间导入
console.log('示例 3: 使用命名空间导入');
const badJson3 = '[1, 2, 3, 4,]';
const fixed3 = JSONRepair.repairJson(badJson3);
console.log('输入:', badJson3);
console.log('输出:', fixed3);
console.log('解析:', JSONRepair.loads(badJson3));
console.log();

// 示例 4: 处理复杂的 JSON
console.log('示例 4: 处理复杂的 JSON');
const complexBadJson = `{
  name: "Alice",
  age: 25,
  'hobbies': ["reading", "coding",],
  address: {
    city: 'Beijing',
    country: "China",
  },
}`;

const fixedComplex = repairJson(complexBadJson);
console.log('输入:');
console.log(complexBadJson);
console.log('\n输出:');
console.log(fixedComplex);
console.log('\n解析结果:');
console.log(JSON.stringify(loads(complexBadJson), null, 2));
console.log();

// 示例 5: 带选项的修复
console.log('示例 5: 带选项的修复');
const badJsonWithComments = `{
  // 这是注释
  "name": "Bob",
  /* 多行注释 */
  "age": 35
}`;

const fixedWithOptions = repairJson(badJsonWithComments);
console.log('输入:');
console.log(badJsonWithComments);
console.log('\n输出:');
console.log(fixedWithOptions);
console.log('\n解析结果:');
console.log(loads(badJsonWithComments));
