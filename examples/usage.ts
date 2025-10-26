import { repairJson, loads, fromFile } from '../dist/index';
import * as fs from 'fs';

console.log('=== JSON Repair TypeScript Examples ===\n');

// Example 1: Basic repair - missing closing brace
console.log('1. Missing closing brace:');
const malformed1 = '{"name": "John", "age": 30, "city": "New York"';
const repaired1 = repairJson(malformed1);
console.log('Input: ', malformed1);
console.log('Output:', repaired1);
console.log();

// Example 2: Missing quotes on keys
console.log('2. Missing quotes on keys:');
const malformed2 = '{name: "Alice", age: 25, city: "Paris"}';
const repaired2 = repairJson(malformed2);
console.log('Input: ', malformed2);
console.log('Output:', repaired2);
console.log();

// Example 3: Trailing commas
console.log('3. Trailing commas:');
const malformed3 = '{"items": [1, 2, 3,], "count": 3,}';
const repaired3 = repairJson(malformed3);
console.log('Input: ', malformed3);
console.log('Output:', repaired3);
console.log();

// Example 4: Return as object
console.log('4. Return as object instead of string:');
const malformed4 = '{"product": "Laptop", "price": 999.99';
const repaired4 = repairJson(malformed4, { returnObjects: true });
console.log('Input: ', malformed4);
console.log('Output:', repaired4);
console.log();

// Example 5: With logging
console.log('5. Repair with logging:');
const malformed5 = '{key: "value", broken: true,';
const [repaired5, logs5] = repairJson(malformed5, {
  returnObjects: true,
  logging: true
}) as [any, any[]];
console.log('Input: ', malformed5);
console.log('Output:', repaired5);
console.log('Repair logs:');
logs5.forEach((log, i) => {
  console.log(`  ${i + 1}. ${log.text}`);
});
console.log();

// Example 6: Using loads (like JSON.parse)
console.log('6. Using loads function:');
const malformed6 = '{"users": [{"name": "Bob"}, {"name": "Carol"';
const repaired6 = loads(malformed6);
console.log('Input: ', malformed6);
console.log('Output:', repaired6);
console.log();

// Example 7: Comments in JSON
console.log('7. Handling comments:');
const malformed7 = `{
  // This is a comment
  "name": "David",
  /* Multi-line
     comment */
  "active": true
}`;
const repaired7 = repairJson(malformed7);
console.log('Input: ');
console.log(malformed7);
console.log('Output:', repaired7);
console.log();

// Example 8: Complex nested structure
console.log('8. Complex nested structure with multiple issues:');
const malformed8 = `{
  users: [
    {name: "Eve", age: 28, tags: ["admin", "user"},
    {name: "Frank", age: 35, tags: ["user"],
  ],
  "total": 2,
  metadata: {
    version: "1.0"
    timestamp: 1234567890
  }
`;
const repaired8 = repairJson(malformed8, { returnObjects: true });
console.log('Input: ');
console.log(malformed8);
console.log('Output:', JSON.stringify(repaired8, null, 2));
console.log();

// Example 9: Incomplete strings
console.log('9. Incomplete strings:');
const malformed9 = '{"message": "Hello world';
const repaired9 = repairJson(malformed9);
console.log('Input: ', malformed9);
console.log('Output:', repaired9);
console.log();

// Example 10: Mixed quote styles
console.log('10. Mixed quote styles:');
const malformed10 = "{'key1': \"value1\", 'key2': 'value2'}";
const repaired10 = repairJson(malformed10);
console.log('Input: ', malformed10);
console.log('Output:', repaired10);
console.log();

// Example 11: File operations (create a test file first)
console.log('11. File operations:');
const testFilePath = 'test-broken.json';
const brokenJson = '{name: "Test", items: [1, 2, 3,], active: true';
fs.writeFileSync(testFilePath, brokenJson);
console.log('Created test file with broken JSON:', brokenJson);

try {
  const repairedFromFile = fromFile(testFilePath);
  console.log('Repaired from file:', repairedFromFile);
} finally {
  // Clean up test file
  fs.unlinkSync(testFilePath);
  console.log('Test file cleaned up');
}
console.log();

console.log('=== All examples completed successfully! ===');