/**
 * 测试 import 语法是否正常工作
 */

console.log('开始测试 json-repair-ts import 功能...\n');

// 测试 1: 默认导出
console.log('测试 1: 导入默认导出...');
try {
  const jsonRepairDefault = await import('./dist/index.js');
  console.log('✓ 默认导出导入成功');
  console.log('  可用方法:', Object.keys(jsonRepairDefault.default || {}));
} catch (error) {
  console.error('✗ 默认导出导入失败:', error.message);
}

// 测试 2: 命名导出
console.log('\n测试 2: 导入命名导出...');
try {
  const { repairJson, loads, load } = await import('./dist/index.js');
  console.log('✓ 命名导出导入成功');

  // 测试基本功能
  const badJson = '{name: "Test", value: 123,}';
  const fixed = repairJson(badJson);
  const parsed = loads(badJson);

  console.log('  输入:', badJson);
  console.log('  修复后:', fixed);
  console.log('  解析结果:', parsed);
} catch (error) {
  console.error('✗ 命名导出导入失败:', error.message);
}

// 测试 3: 命名空间导入
console.log('\n测试 3: 导入命名空间...');
try {
  const JSONRepair = await import('./dist/index.js');
  console.log('✓ 命名空间导入成功');
  console.log('  可用导出:', Object.keys(JSONRepair));

  // 测试数组修复
  const badArray = '[1, 2, 3,]';
  const fixedArray = JSONRepair.repairJson(badArray);
  console.log('  数组修复测试:', badArray, '->', fixedArray);
} catch (error) {
  console.error('✗ 命名空间导入失败:', error.message);
}

// 测试 4: 类导出
console.log('\n测试 4: 导入高级类...');
try {
  const { JSONParser } = await import('./dist/index.js');
  console.log('✓ JSONParser 类导入成功');

  const parser = new JSONParser('{test: "value",}');
  const result = parser.parse();
  console.log('  JSONParser 解析结果:', result.data);
} catch (error) {
  console.error('✗ JSONParser 类导入失败:', error.message);
}

// 测试 5: 复杂 JSON 修复
console.log('\n测试 5: 复杂 JSON 修复...');
try {
  const { loads } = await import('./dist/index.js');

  const complexJson = `{
    name: "Alice",
    age: 25,
    hobbies: ['reading', "coding",],
    address: {
      city: 'Beijing',
      country: "China",
    },
  }`;

  const result = loads(complexJson);
  console.log('✓ 复杂 JSON 修复成功');
  console.log('  结果:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('✗ 复杂 JSON 修复失败:', error.message);
}

console.log('\n所有测试完成!');
