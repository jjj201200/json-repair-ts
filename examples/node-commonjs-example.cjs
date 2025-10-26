// Node.js CommonJS (require) 导入示例
// 这个示例测试 UMD 格式在 Node.js 中使用 require 导入

// 方式 1: 直接加载 UMD 版本
const {
  repairJson,
  loads,
  load,
  fromFile,
  repairJsonFromFile
} = require('../dist/json-repair.umd.js');

console.log('=== JSON Repair CommonJS (require) 示例 ===\n');

// 检查导入的模块
console.log('可用方法:', typeof repairJson, typeof loads);
console.log('');

// 示例 1: 使用 repairJson
console.log('示例 1: 修复缺少引号的键');
const input1 = '{name: "John", age: 30}';
console.log('输入:', input1);
const result1 = repairJson(input1);
console.log('输出:', result1);
console.log('解析后:', JSON.parse(result1));
console.log('');

// 示例 2: 修复尾随逗号
console.log('示例 2: 修复尾随逗号');
const input2 = '{"items": [1, 2, 3,], "total": 3,}';
console.log('输入:', input2);
const result2 = repairJson(input2);
console.log('输出:', result2);
console.log('');

// 示例 3: 使用 loads 直接获取对象
console.log('示例 3: 使用 loads 直接获取对象');
const input3 = '{status: "success", data: [1, 2, 3]}';
console.log('输入:', input3);
const result3 = loads(input3);
console.log('输出对象:', result3);
console.log('');

// 示例 4: 测试复杂嵌套结构
console.log('示例 4: 修复复杂嵌套结构');
const input4 = `{
  user: {
    name: 'Alice',
    emails: ['alice@example.com', 'alice2@example.com',],
    settings: {
      theme: 'dark',
      notifications: true,
    }
  }
}`;
console.log('输入:', input4);
const result4 = repairJson(input4);
console.log('输出:', result4);
console.log('解析后:', JSON.stringify(JSON.parse(result4), null, 2));
console.log('');

// 示例 5: 使用 returnObjects 选项
console.log('示例 5: 使用 returnObjects 选项');
const input5 = '{incomplete: true, count: 5,}';
console.log('输入:', input5);
const result5 = repairJson(input5, { returnObjects: true });
console.log('输出对象:', result5);
console.log('');

console.log('=== CommonJS 测试完成 ===');
