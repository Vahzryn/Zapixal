import assert from 'node:assert';
import {
  validateAndParseJson,
  formatJson,
  repairCommonJsonMistakes,
  sortJsonKeysAlphabetically,
  calculateJsonStats,
  SAMPLE_JSON_DATA
} from '../src/lib/jsonFormatter';
import { TOOL_REGISTRY } from '../src/lib/toolRegistry';
import { parseSeoRoute } from '../src/lib/seo/meta';

async function runTests() {
  console.log('--- Comprehensive JSON Formatter, Validator & Repair Suite ---');

  // Test 1: Valid Sample JSON
  console.log('Test 1: Valid Sample JSON & Deep Stats Calculation');
  const sampleStr = JSON.stringify(SAMPLE_JSON_DATA);
  const res1 = validateAndParseJson(sampleStr);
  assert.strictEqual(res1.valid, true, 'Sample JSON should be valid');
  assert.strictEqual(res1.error, null, 'Error should be null for valid JSON');
  assert.ok(res1.stats, 'Stats should be computed');
  assert.strictEqual(res1.stats.rootType, 'object');
  assert.ok(res1.stats.depth >= 3, 'Sample JSON depth should be >= 3');
  assert.ok(res1.stats.totalKeys >= 10, 'Sample JSON should have totalKeys >= 10');
  console.log('✓ Test 1 Passed');

  // Test 2: Formatting Indentations
  console.log('Test 2: Formatting Indentations (2, 4, 3, tab, minified)');
  const obj = { b: 2, a: 1, nested: { d: 4, c: 3 } };
  
  const formatted2 = formatJson(obj, '2');
  assert.ok(formatted2.includes('  "b": 2'), 'Should contain 2 spaces indent');

  const formatted4 = formatJson(obj, '4');
  assert.ok(formatted4.includes('    "b": 2'), 'Should contain 4 spaces indent');

  const formatted3 = formatJson(obj, '3');
  assert.ok(formatted3.includes('   "b": 2'), 'Should contain 3 spaces indent');

  const formattedTab = formatJson(obj, 'tab');
  assert.ok(formattedTab.includes('\t"b": 2'), 'Should contain tab indent');

  const minified = formatJson(obj, 'minified');
  assert.strictEqual(minified, '{"b":2,"a":1,"nested":{"d":4,"c":3}}', 'Minified should be compact without newlines');
  console.log('✓ Test 2 Passed');

  // Test 3: Alphabetical Key Sorting (and Array Ordering Preservation)
  console.log('Test 3: Recursive Key Sorting (A-Z) & Array Preservation');
  const complexObj = {
    z: 10,
    a: 20,
    m: { y: 1, b: 2 },
    arr: [
      { delta: 1, alpha: 2 },
      { zebra: 9, beta: 8 }
    ],
    simpleArr: [3, 1, 2]
  };
  const sorted = sortJsonKeysAlphabetically(complexObj);
  const sortedKeys = Object.keys(sorted);
  assert.deepStrictEqual(sortedKeys, ['a', 'arr', 'm', 'simpleArr', 'z'], 'Top level keys sorted alphabetically');
  assert.deepStrictEqual(Object.keys(sorted.m), ['b', 'y'], 'Nested keys sorted alphabetically');
  assert.deepStrictEqual(Object.keys(sorted.arr[0]), ['alpha', 'delta'], 'Objects in array sorted alphabetically');
  assert.deepStrictEqual(Object.keys(sorted.arr[1]), ['beta', 'zebra'], 'Objects in array sorted alphabetically');
  assert.deepStrictEqual(sorted.simpleArr, [3, 1, 2], 'Primitive array ordering must NEVER be changed');
  console.log('✓ Test 3 Passed');

  // Test 4: Types and Edge Case Values
  console.log('Test 4: Primitives, Unicode, Escapes, Decimals, Negative Numbers');
  const edgeCaseData = {
    emptyObj: {},
    emptyArr: [],
    nullVal: null,
    boolTrue: true,
    boolFalse: false,
    intVal: 42,
    negativeVal: -1024,
    floatVal: 3.14159265,
    sciVal: 1.25e-4,
    escapedStr: 'Quote: " Linebreak: \n Tab: \t Slash: / Backslash: \\',
    unicodeText: 'English, Español, 日本語, العربية, 🚀 ✨ 🔒',
    url: 'https://zapixal.com/tools?query=1&param=a//b#hash'
  };
  const edgeStr = JSON.stringify(edgeCaseData, null, 2);
  const edgeParsed = validateAndParseJson(edgeStr);
  assert.strictEqual(edgeParsed.valid, true, 'Edge case payload should parse cleanly');
  assert.strictEqual(edgeParsed.data.negativeVal, -1024);
  assert.strictEqual(edgeParsed.data.unicodeText, 'English, Español, 日本語, العربية, 🚀 ✨ 🔒');
  assert.strictEqual(edgeParsed.data.nullVal, null);
  console.log('✓ Test 4 Passed');

  // Test 5: Syntax Error Detection with Line and Column Position
  console.log('Test 5: Line & Column Error Detection on Multiline Text');
  const invalidJson = `{\n  "title": "Zapixal",\n  "broken": ,\n  "valid": true\n}`;
  const resInvalid = validateAndParseJson(invalidJson);
  assert.strictEqual(resInvalid.valid, false, 'Invalid JSON should report valid=false');
  assert.ok(resInvalid.error, 'Error object should be populated');
  assert.strictEqual(resInvalid.error.line, 3, 'Error should be reported on line 3');
  assert.ok(resInvalid.error.column > 0, 'Column should be greater than 0');
  assert.ok(resInvalid.error.snippet.length > 0, 'Snippet should contain broken line');
  assert.ok(resInvalid.error.pointer.includes('^'), 'Pointer must contain caret');
  console.log('✓ Test 5 Passed');

  // Test 6: Empty Input Handling
  console.log('Test 6: Empty Input Handling');
  const emptyRes = validateAndParseJson('   ');
  assert.strictEqual(emptyRes.valid, false);
  assert.ok(emptyRes.error?.message.includes('empty'));
  console.log('✓ Test 6 Passed');

  // Test 7: HIGH PRIORITY — String Preservation During Auto-Repair
  console.log('Test 7: HIGH PRIORITY — String Preservation & URL Safety in Repair Engine');
  const dangerousJson = `{
  "url": "https://example.com/a//b?c=1//2",
  "text": "hello // this is not a comment",
  "value": "/* this is not a block comment */",
  "brackets": "this has { [ , : ] } inside a string",
  "singleQuote": "It's a sunny day"
}`;
  const repairedDangerous = repairCommonJsonMistakes(dangerousJson);
  const parsedDangerous = validateAndParseJson(repairedDangerous);
  assert.strictEqual(parsedDangerous.valid, true, 'Preserved strings must parse validly');
  assert.strictEqual(parsedDangerous.data.url, 'https://example.com/a//b?c=1//2', 'URLs with // must remain untouched');
  assert.strictEqual(parsedDangerous.data.text, 'hello // this is not a comment', 'Strings with // must remain untouched');
  assert.strictEqual(parsedDangerous.data.value, '/* this is not a block comment */', 'Strings with /* */ must remain untouched');
  assert.strictEqual(parsedDangerous.data.brackets, 'this has { [ , : ] } inside a string');
  assert.strictEqual(parsedDangerous.data.singleQuote, "It's a sunny day");
  console.log('✓ Test 7 Passed');

  // Test 8: Trailing Commas, Unquoted Keys, Single Quotes, and Comments Repair
  console.log('Test 8: Auto-Repair of Malformed JS-style JSON');
  const malformedInput = `
  // Top-level JavaScript comment
  {
    /* Multi-line header block */
    'appName': 'Zapixal',
    version: '2.0.0',
    $flag: true,
    _internal_id: 12345,
    'escapedSingle': 'Alice\\'s book',
    tags: [
      'fast',
      'local',
    ],
    nested: {
      trailingCommaHere: true,
    },
  }`;

  const repaired = repairCommonJsonMistakes(malformedInput);
  const parsedRepaired = validateAndParseJson(repaired);
  assert.strictEqual(parsedRepaired.valid, true, `Repaired JSON should be valid. Repaired output:\n${repaired}`);
  assert.strictEqual(parsedRepaired.data.appName, 'Zapixal');
  assert.strictEqual(parsedRepaired.data.version, '2.0.0');
  assert.strictEqual(parsedRepaired.data.$flag, true);
  assert.strictEqual(parsedRepaired.data._internal_id, 12345);
  assert.strictEqual(parsedRepaired.data.escapedSingle, "Alice's book");
  assert.deepStrictEqual(parsedRepaired.data.tags, ['fast', 'local']);
  assert.strictEqual(parsedRepaired.data.nested.trailingCommaHere, true);
  console.log('✓ Test 8 Passed');

  // Test 9: Deep Nesting Handling
  console.log('Test 9: Deep Nesting Safety');
  let deepObj: any = { depth: 0 };
  let curr = deepObj;
  for (let d = 1; d <= 50; d++) {
    curr.child = { depth: d };
    curr = curr.child;
  }
  const deepStr = JSON.stringify(deepObj);
  const deepParsed = validateAndParseJson(deepStr);
  assert.strictEqual(deepParsed.valid, true);
  assert.strictEqual(deepParsed.stats?.depth, 52);
  console.log('✓ Test 9 Passed');

  // Test 10: Tool Registry Integrity
  console.log('Test 10: Tool Registry Entry Verification');
  const registryEntry = TOOL_REGISTRY.find(t => t.route === '/json-formatter-validator');
  assert.ok(registryEntry, 'JSON Formatter must be registered in TOOL_REGISTRY');
  assert.strictEqual(registryEntry.status, 'active');
  assert.strictEqual(registryEntry.category, 'developer');
  assert.ok(registryEntry.capabilities.includes('json'));
  assert.ok(registryEntry.searchIntents.length >= 2);
  console.log('✓ Test 10 Passed');

  // Test 11: SEO Route Resolution & Schema
  console.log('Test 11: SEO Route Resolution & Schema Verification');
  const seoData = await parseSeoRoute('/json-formatter-validator');
  assert.strictEqual(seoData.path, '/json-formatter-validator');
  assert.ok(seoData.h1Title.toLowerCase().includes('json formatter'));
  assert.ok(seoData.metaDescription.length > 50);
  assert.ok(seoData.guideContent, 'Guide content must be defined');
  assert.ok(seoData.guideContent.steps.length >= 3, 'Steps must exist');
  assert.ok(seoData.guideContent.faqs.length >= 2, 'FAQs must exist');
  assert.ok(seoData.jsonLd?.softwareApp, 'softwareApp schema must exist');
  assert.ok(seoData.jsonLd?.faqPage, 'faqPage schema must exist');
  assert.ok(seoData.jsonLd?.breadcrumbs, 'breadcrumbs schema must exist');
  console.log('✓ Test 11 Passed');

  console.log('\nAll 11 JSON Formatter & Validator test suites passed successfully!');
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});

