// Node.js ESM 导入示例
import { repairJson, loads } from '../dist/index.js';

console.log('=== JSON Repair Node.js 示例 ===\n');

// 示例 1: 修复缺少引号的键
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
console.log('解析后:', JSON.parse(result2));
console.log('');

// 示例 3: 修复单引号
console.log('示例 3: 修复单引号');
const input3 = "{'name': 'John', 'city': 'New York'}";
console.log('输入:', input3);
const result3 = repairJson(input3);
console.log('输出:', result3);
console.log('解析后:', JSON.parse(result3));
console.log('');

// 示例 4: 修复缺少逗号
console.log('示例 4: 修复缺少逗号');
const input4 = '{"a": 1 "b": 2 "c": 3}';
console.log('输入:', input4);
const result4 = repairJson(input4);
console.log('输出:', result4);
console.log('解析后:', JSON.parse(result4));
console.log('');

// 示例 5: 使用 loads 直接获取对象
console.log('示例 5: 使用 loads 直接获取对象');
const input5 = '{status: "success", data: [1, 2, 3]}';
console.log('输入:', input5);
const result5 = loads(input5);
console.log('输出对象:', result5);
console.log('');

// 示例 6: 使用返回对象选项
console.log('示例 6: 使用 returnObjects 选项');
const input6 = '{incomplete: true, count: 5,}';
console.log('输入:', input6);
const result6 = repairJson(input6, { returnObjects: true });
console.log('输出对象:', result6);
console.log('');

// 示例 7: 启用日志记录
console.log('示例 7: 启用日志记录');
const input7 = '[1, 2, 3,]';
console.log('输入:', input7);
const result7 = repairJson(input7, { logging: true });
console.log('输出:', result7);
console.log('');

console.log('=== 所有测试完成 ===');
