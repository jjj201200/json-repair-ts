// Example usage of json-repair-ts
// First build the project: npm run build
// Then run this example: node example.js

const { repairJson, loads } = require('./dist/index');

console.log('=== JSON Repair Examples ===\n');

// Example 1: Missing closing brace
const broken1 = '{"name": "John", "age": 30';
console.log('Broken JSON:', broken1);
console.log('Repaired:   ', repairJson(broken1));
console.log();

// Example 2: Missing quotes on keys
const broken2 = '{name: "Alice", age: 25}';
console.log('Broken JSON:', broken2);
console.log('Repaired:   ', repairJson(broken2));
console.log();

// Example 3: Trailing commas
const broken3 = '{"items": [1, 2, 3,], "count": 3,}';
console.log('Broken JSON:', broken3);
console.log('Repaired:   ', repairJson(broken3));
console.log();

// Example 4: Get as object
const broken4 = '{key: "value", number: 42';
console.log('Broken JSON:', broken4);
console.log('As Object:  ', loads(broken4));
console.log();

// Example 5: Complex nested structure
const broken5 = `{
  users: [
    {name: "Bob", age: 30,
    {name: "Alice", age: 25}
  ],
  total: 2
`;
console.log('Complex broken JSON:');
console.log(broken5);
console.log('Repaired:');
const repaired5 = loads(broken5);
console.log(JSON.stringify(repaired5, null, 2));

console.log('\n=== All repairs successful! ===');