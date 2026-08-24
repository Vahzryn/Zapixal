import assert from 'node:assert';
import {
  convertCsvToJson,
  convertJsonToCsv,
  detectDelimiter,
  escapeCsvField,
  inferValueType,
  parseCsvRows
} from '../src/lib/csvConverter';
import { TOOL_REGISTRY } from '../src/lib/toolRegistry';
import { parseSeoRoute } from '../src/lib/seo/meta';

async function runTests() {
  console.log('--- Comprehensive CSV ↔ JSON Engine Test Suite ---');

  // Test 1: Basic CSV to JSON
  console.log('Running Test 1: Basic CSV to JSON conversion...');
  const csv1 = `id,name,age,active\n1,Alice,30,true\n2,Bob,25,false`;
  const res1 = convertCsvToJson(csv1);
  assert.strictEqual(res1.valid, true);
  assert.strictEqual(res1.data?.length, 2);
  assert.strictEqual(res1.data?.[0].id, 1);
  assert.strictEqual(res1.data?.[0].name, 'Alice');
  assert.strictEqual(res1.data?.[0].age, 30);
  assert.strictEqual(res1.data?.[0].active, true);
  assert.strictEqual(res1.stats?.columnCount, 4);
  assert.strictEqual(res1.stats?.rowCount, 2);
  console.log('✓ Test 1 Passed');

  // Test 2: RFC 4180 Quoted Fields, Commas inside quotes, and Escaped Double Quotes
  console.log('Running Test 2: RFC 4180 quoted fields & escaped double quotes...');
  const csv2 = `id,description,quote\n1,"Item with, comma","He said ""Hello World"""\n2,"Multi-line\ndescription","Simple string"`;
  const res2 = convertCsvToJson(csv2);
  assert.strictEqual(res2.valid, true);
  assert.strictEqual(res2.data?.length, 2);
  assert.strictEqual(res2.data?.[0].description, 'Item with, comma');
  assert.strictEqual(res2.data?.[0].quote, 'He said "Hello World"');
  assert.strictEqual(res2.data?.[1].description, 'Multi-line\ndescription');
  console.log('✓ Test 2 Passed');

  // Test 3: Delimiter Auto-Detection & Custom Delimiters (Semicolon, Tab, Pipe)
  console.log('Running Test 3: Delimiter auto-detection & custom delimiters...');
  const csvSemi = `sku;product;price\nSKU1;Coffee;4.50\nSKU2;Tea;3.20`;
  const detSemi = detectDelimiter(csvSemi);
  assert.strictEqual(detSemi, ';');
  const resSemi = convertCsvToJson(csvSemi, { delimiter: 'auto' });
  assert.strictEqual(resSemi.valid, true);
  assert.strictEqual(resSemi.data?.[0].product, 'Coffee');
  assert.strictEqual(resSemi.data?.[0].price, 4.5);

  const tsv = `id\tname\trole\n101\tSarah\tAdmin\n102\tJohn\tUser`;
  const detTsv = detectDelimiter(tsv);
  assert.strictEqual(detTsv, '\t');
  const resTsv = convertCsvToJson(tsv);
  assert.strictEqual(resTsv.valid, true);
  assert.strictEqual(resTsv.data?.[0].name, 'Sarah');

  const pipeCsv = `city|country|pop\nTokyo|Japan|14000000\nParis|France|2161000`;
  const resPipe = convertCsvToJson(pipeCsv, { delimiter: '|' });
  assert.strictEqual(resPipe.valid, true);
  assert.strictEqual(resPipe.data?.[0].city, 'Tokyo');
  assert.strictEqual(resPipe.data?.[0].pop, 14000000);
  console.log('✓ Test 3 Passed');

  // Test 4: Headerless CSV and Duplicate Header Deduplication
  console.log('Running Test 4: Headerless CSV & duplicate headers...');
  const noHeaderCsv = `Red,10,True\nBlue,20,False`;
  const resNoHeader = convertCsvToJson(noHeaderCsv, { hasHeaders: false });
  assert.strictEqual(resNoHeader.valid, true);
  assert.strictEqual(resNoHeader.data?.length, 2);
  assert.strictEqual(resNoHeader.data?.[0].col_1, 'Red');
  assert.strictEqual(resNoHeader.data?.[0].col_2, 10);
  assert.strictEqual(resNoHeader.data?.[0].col_3, true);

  const dupHeaderCsv = `tag,tag,tag\na,b,c`;
  const resDup = convertCsvToJson(dupHeaderCsv);
  assert.strictEqual(resDup.valid, true);
  assert.deepStrictEqual(resDup.stats?.headers, ['tag', 'tag_2', 'tag_3']);
  assert.strictEqual(resDup.data?.[0].tag, 'a');
  assert.strictEqual(resDup.data?.[0].tag_2, 'b');
  assert.strictEqual(resDup.data?.[0].tag_3, 'c');
  console.log('✓ Test 4 Passed');

  // Test 5: Type Inference & Preservation of Leading Zero Strings
  console.log('Running Test 5: Type inference & leading-zero strings...');
  assert.strictEqual(inferValueType('123', true), 123);
  assert.strictEqual(inferValueType('-45.67', true), -45.67);
  assert.strictEqual(inferValueType('true', true), true);
  assert.strictEqual(inferValueType('FALSE', true), false);
  assert.strictEqual(inferValueType('null', true), null);
  // Preserving zip codes and phone numbers
  assert.strictEqual(inferValueType('01234', true), '01234');
  assert.strictEqual(inferValueType('+1-555-0199', true), '+1-555-0199');
  assert.strictEqual(inferValueType('0', true), 0);
  console.log('✓ Test 5 Passed');

  // Test 6: Empty Input Handling
  console.log('Running Test 6: Empty input handling...');
  const emptyRes = convertCsvToJson('');
  assert.strictEqual(emptyRes.valid, false);
  assert.strictEqual(emptyRes.data, null);
  const emptyJsonRes = convertJsonToCsv('');
  assert.strictEqual(emptyJsonRes.valid, false);
  console.log('✓ Test 6 Passed');

  // Test 7: JSON to CSV Conversion (Objects & Escaping)
  console.log('Running Test 7: JSON to CSV conversion...');
  const jsonObj = [
    { id: 1, title: 'Item 1, Special', active: true },
    { id: 2, title: 'Quote: "Winner"', active: false }
  ];
  const jsonToCsvRes = convertJsonToCsv(jsonObj);
  assert.strictEqual(jsonToCsvRes.valid, true);
  assert.strictEqual(jsonToCsvRes.rowCount, 2);
  assert.strictEqual(jsonToCsvRes.columnCount, 3);
  assert.strictEqual(jsonToCsvRes.headers.join(','), 'id,title,active');
  assert.ok(jsonToCsvRes.csvString.includes('"Item 1, Special"'));
  assert.ok(jsonToCsvRes.csvString.includes('"Quote: ""Winner"""'));
  console.log('✓ Test 7 Passed');

  // Test 8: JSON Array-of-Arrays to CSV
  console.log('Running Test 8: Array of arrays JSON to CSV...');
  const arrayJson = [
    ['Header1', 'Header2'],
    ['Val1', 'Val2;WithSemi']
  ];
  const arrCsvRes = convertJsonToCsv(arrayJson, { delimiter: ';' });
  assert.strictEqual(arrCsvRes.valid, true);
  assert.strictEqual(arrCsvRes.rowCount, 2);
  assert.ok(arrCsvRes.csvString.includes('"Val2;WithSemi"'));
  console.log('✓ Test 8 Passed');

  // Test 9: Unicode and Multibyte Characters
  console.log('Running Test 9: Unicode characters & multilingual text...');
  const unicodeCsv = `name,greeting,symbol\nRené,Bonjour,€\n田中,こんにちは,¥\nАлексей,Привет,₽`;
  const unicodeRes = convertCsvToJson(unicodeCsv);
  assert.strictEqual(unicodeRes.valid, true);
  assert.strictEqual(unicodeRes.data?.length, 3);
  assert.strictEqual(unicodeRes.data?.[0].name, 'René');
  assert.strictEqual(unicodeRes.data?.[1].name, '田中');
  assert.strictEqual(unicodeRes.data?.[2].name, 'Алексей');
  console.log('✓ Test 9 Passed');

  // Test 10: Tool Registry Verification
  console.log('Running Test 10: Tool Registry verification...');
  const toolEntry = TOOL_REGISTRY.find(t => t.id === 'csv-to-json-converter');
  assert.ok(toolEntry, 'Tool must be registered in TOOL_REGISTRY');
  assert.strictEqual(toolEntry?.route, '/csv-to-json-converter');
  assert.strictEqual(toolEntry?.status, 'active');
  assert.strictEqual(toolEntry?.indexable, true);
  assert.strictEqual(toolEntry?.category, 'developer');
  console.log('✓ Test 10 Passed');

  // Test 11: SEO Route Resolution & Schema Generation
  console.log('Running Test 11: SEO Route resolution & Schema validation...');
  const seoData = await parseSeoRoute('/csv-to-json-converter');
  assert.strictEqual(seoData.path, '/csv-to-json-converter');
  assert.strictEqual(seoData.isIndexable, true);
  assert.strictEqual(seoData.h1Title, 'CSV ↔ JSON Converter');
  assert.ok(seoData.metaTitle.includes('CSV') && seoData.metaTitle.includes('JSON'));
  assert.ok(seoData.metaDescription.length > 50);
  assert.ok(seoData.jsonLd?.softwareApp);
  assert.ok(seoData.jsonLd?.howTo);
  assert.ok(seoData.jsonLd?.faqPage);
  assert.ok(seoData.jsonLd?.breadcrumbs);
  console.log('✓ Test 11 Passed');

  // Test 12: UTF-8 BOM Stripping
  console.log('Running Test 12: UTF-8 BOM stripping...');
  const bomCsv = '\uFEFFid,name\n1,Alice';
  const bomRes = convertCsvToJson(bomCsv);
  assert.strictEqual(bomRes.valid, true);
  assert.strictEqual(bomRes.data?.[0].id, 1);
  assert.strictEqual(bomRes.data?.[0].name, 'Alice');
  assert.strictEqual(bomRes.stats?.headers[0], 'id');
  console.log('✓ Test 12 Passed');

  // Test 13: 64-bit BigInt / Snowflake ID Precision Preservation
  console.log('Running Test 13: 64-bit numeric ID precision preservation...');
  const bigNumStr = '12345678901234567890';
  assert.strictEqual(inferValueType(bigNumStr, true), bigNumStr); // Must remain string!
  console.log('✓ Test 13 Passed');

  // Test 14: Nested JSON Serialization and Round-trip Deserialization
  console.log('Running Test 14: Nested JSON structures & flattening...');
  const nestedData = [
    { id: 1, user: { name: 'Alice', city: 'Tokyo' }, tags: ['dev', 'ai'] }
  ];
  const nestedCsvRes = convertJsonToCsv(nestedData, { nestedFormat: 'json' });
  assert.strictEqual(nestedCsvRes.valid, true);
  assert.ok(nestedCsvRes.csvString.includes('"{""name"":""Alice"",""city"":""Tokyo""}"'));

  // Flattening mode
  const flatCsvRes = convertJsonToCsv(nestedData, { nestedFormat: 'flatten' });
  assert.strictEqual(flatCsvRes.valid, true);
  assert.ok(flatCsvRes.csvString.includes('user.name,user.city,tags.0,tags.1'));
  assert.ok(flatCsvRes.csvString.includes('Alice,Tokyo,dev,ai'));

  // CSV to JSON with nested parsing enabled
  const roundTripRes = convertCsvToJson(nestedCsvRes.csvString, { parseNestedJson: true });
  assert.strictEqual(roundTripRes.valid, true);
  assert.deepStrictEqual(roundTripRes.data?.[0].user, { name: 'Alice', city: 'Tokyo' });
  assert.deepStrictEqual(roundTripRes.data?.[0].tags, ['dev', 'ai']);
  console.log('✓ Test 14 Passed');

  // Test 15: Primitive Arrays to CSV
  console.log('Running Test 15: Array of primitives to CSV...');
  const primArray = ['Apple', 'Banana', 'Cherry'];
  const primCsvRes = convertJsonToCsv(primArray);
  assert.strictEqual(primCsvRes.valid, true);
  assert.strictEqual(primCsvRes.rowCount, 3);
  assert.strictEqual(primCsvRes.csvString, 'value\r\nApple\r\nBanana\r\nCherry');
  console.log('✓ Test 15 Passed');

  // Test 16: Spreadsheet Formula Injection Mitigation
  console.log('Running Test 16: Formula injection mitigation...');
  const unsafeData = [{ title: '=SUM(A1:A10)', user: '@admin', safeNum: -42, cmd: '+calc' }];
  const safeExport = convertJsonToCsv(unsafeData, { sanitizeFormulas: true });
  assert.strictEqual(safeExport.valid, true);
  assert.ok(safeExport.csvString.includes("'=SUM(A1:A10)"));
  assert.ok(safeExport.csvString.includes("'@admin"));
  assert.ok(safeExport.csvString.includes("'+calc"));
  // Genuine negative numbers should not be ruined
  assert.ok(safeExport.csvString.includes('-42'));
  console.log('✓ Test 16 Passed');

  console.log('\nAll 16 CSV ↔ JSON Engine test suites passed successfully!\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
