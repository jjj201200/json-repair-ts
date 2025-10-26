/**
 * TypeScript Import 使用示例
 *
 * 此示例展示如何在 TypeScript 项目中使用 import 语法导入 json-repair-ts
 */

// 方式 1: 导入默认导出和类型
import jsonRepair, { type RepairOptions, type JSONReturnType } from 'json-repair-ts';

// 方式 2: 命名导入 - 导入主要函数和类型
import {
  repairJson,
  loads,
  load,
  fromFile,
  repairJsonFromFile,
  type LogEntry
} from 'json-repair-ts';

// 方式 3: 导入高级类
import { JSONParser, JsonContext, ObjectComparer } from 'json-repair-ts';

console.log('=== json-repair-ts TypeScript 导入示例 ===\n');

// 示例 1: 基本使用
function basicUsage(): void {
  console.log('示例 1: 基本使用');

  const badJson: string = '{name: "John", age: 30,}';
  const fixed: string = repairJson(badJson);
  const parsed: JSONReturnType = loads(badJson);

  console.log('输入:', badJson);
  console.log('输出:', fixed);
  console.log('解析:', parsed);
  console.log();
}

// 示例 2: 使用类型注解
function typedUsage(): void {
  console.log('示例 2: 使用类型注解');

  interface User {
    name: string;
    age: number;
    email?: string;
  }

  const badUserJson: string = "{name: 'Alice', age: 25, email: 'alice@example.com',}";
  const user = loads(badUserJson) as User;

  console.log('用户名:', user.name);
  console.log('年龄:', user.age);
  console.log('邮箱:', user.email);
  console.log();
}

// 示例 3: 使用选项
function optionsUsage(): void {
  console.log('示例 3: 使用选项');

  const options: RepairOptions = {
    returnLogs: true
  };

  const badJson: string = `{
    // 用户信息
    name: "Bob",
    age: 35,
    /* 地址 */
    city: 'Beijing',
  }`;

  const result = load(badJson, options);

  console.log('输入:');
  console.log(badJson);
  console.log('\n解析结果:');
  console.log(result.data);

  if (result.logs) {
    console.log('\n日志信息:');
    result.logs.forEach((log: LogEntry, index: number) => {
      console.log(`  ${index + 1}. ${log.type}: ${log.message} (位置: ${log.position})`);
    });
  }
  console.log();
}

// 示例 4: 处理数组
function arrayUsage(): void {
  console.log('示例 4: 处理数组');

  const badArray: string = '[1, 2, 3, "four", true, null,]';
  const fixedArray: string = repairJson(badArray);
  const parsedArray: JSONReturnType = loads(badArray);

  console.log('输入:', badArray);
  console.log('输出:', fixedArray);
  console.log('解析:', parsedArray);
  console.log('类型:', Array.isArray(parsedArray) ? 'Array' : typeof parsedArray);
  console.log();
}

// 示例 5: 处理嵌套对象
function nestedObjectUsage(): void {
  console.log('示例 5: 处理嵌套对象');

  interface Address {
    street: string;
    city: string;
    country: string;
  }

  interface Person {
    name: string;
    age: number;
    address: Address;
    hobbies: string[];
  }

  const badComplexJson: string = `{
    name: "Charlie",
    age: 28,
    address: {
      street: "123 Main St",
      city: 'Shanghai',
      country: "China",
    },
    hobbies: ['reading', "gaming", 'traveling',],
  }`;

  const person = loads(badComplexJson) as Person;

  console.log('姓名:', person.name);
  console.log('年龄:', person.age);
  console.log('地址:', `${person.address.street}, ${person.address.city}, ${person.address.country}`);
  console.log('爱好:', person.hobbies.join(', '));
  console.log();
}

// 示例 6: 错误处理
function errorHandling(): void {
  console.log('示例 6: 错误处理');

  const veryBadJson: string = '{this is really broken JSON!!!}';

  try {
    const result: JSONReturnType = loads(veryBadJson);
    console.log('修复成功:', result);
  } catch (error) {
    console.error('修复失败:', error instanceof Error ? error.message : String(error));
  }
  console.log();
}

// 示例 7: 使用高级类 (JSONParser)
function advancedUsage(): void {
  console.log('示例 7: 使用高级类');

  const badJson: string = "{key: 'value', number: 42,}";
  const parser = new JSONParser(badJson);
  const result = parser.parse();

  console.log('输入:', badJson);
  console.log('解析结果:', result.data);

  if (result.logs && result.logs.length > 0) {
    console.log('修复日志:');
    result.logs.forEach((log: LogEntry) => {
      console.log(`  - ${log.type}: ${log.message}`);
    });
  }
  console.log();
}

// 运行所有示例
function runAllExamples(): void {
  basicUsage();
  typedUsage();
  optionsUsage();
  arrayUsage();
  nestedObjectUsage();
  errorHandling();
  advancedUsage();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

// 导出函数以便在其他地方使用
export {
  basicUsage,
  typedUsage,
  optionsUsage,
  arrayUsage,
  nestedObjectUsage,
  errorHandling,
  advancedUsage,
  runAllExamples
};
