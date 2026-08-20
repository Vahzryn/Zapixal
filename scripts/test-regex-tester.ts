import assert from 'node:assert';
import {
  analyzeRegex,
  buildHighlightSegments,
  executeReplacement,
  extractMatches,
  calculateStringDiagnostics,
  getSupportedFlags,
  REGEX_PRESETS
} from '../src/lib/regexEngine';
import { TOOL_REGISTRY } from '../src/lib/toolRegistry';
import { parseSeoRoute } from '../src/lib/seo/meta';

async function runRegexTests() {
  console.log('--- RUNNING RIGOROUS REGEX TESTER & STRING DEBUGGER TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function testAssert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${name}`);
      failed++;
    }
  }

  // 1. Basic literal match
  const res1 = analyzeRegex('hello', '', 'hello world');
  testAssert(res1.valid, '1. Basic literal regex compiles');
  testAssert(res1.matchCount === 1, '1. Single match count matches');
  testAssert(res1.matches[0].text === 'hello' && res1.matches[0].index === 0, '1. Match text and offset correct');

  // 2. Case-insensitive matching (i flag)
  const res2 = analyzeRegex('hello', 'i', 'HeLLo world');
  testAssert(res2.valid, '2. Case-insensitive regex compiles');
  testAssert(res2.matchCount === 1, '2. Case-insensitive match succeeds');
  testAssert(res2.matches[0].text === 'HeLLo', '2. Matched original case preserved');

  // 3. Global matching (g flag)
  const res3 = analyzeRegex('\\d+', 'g', 'abc 123 def 456 ghi 789');
  testAssert(res3.matchCount === 3, '3. Global matching finds all 3 matches');
  testAssert(res3.matches[0].text === '123' && res3.matches[1].text === '456' && res3.matches[2].text === '789', '3. All match segments correct');

  // 4. Multiline matching (m flag)
  const res4 = analyzeRegex('^item', 'gm', 'item 1\nother line\nitem 2');
  testAssert(res4.matchCount === 2, '4. Multiline ^ matches line beginnings');

  // 5. DotAll (s flag)
  const res5 = analyzeRegex('start.*end', 's', 'start\nmiddle newline\nend');
  testAssert(res5.matchCount === 1, '5. DotAll matches across newlines');

  // 6. Unicode input and emojis (u flag)
  const res6 = analyzeRegex('\\p{Emoji}', 'gu', 'Status: 🚀 and 🌟 are live');
  testAssert(res6.valid, '6. Unicode property escapes compile with u flag');
  testAssert(res6.matchCount === 2, '6. Emojis correctly matched as single code points');

  // 7. Capture groups ($1, $2)
  const res7 = analyzeRegex('(\\w+)@(\\w+)', '', 'user@domain');
  testAssert(res7.matches[0].groups.length === 2, '7. Two capture groups extracted');
  testAssert(res7.matches[0].groups[0].value === 'user', '7. Group 1 value is "user"');
  testAssert(res7.matches[0].groups[1].value === 'domain', '7. Group 2 value is "domain"');

  // 8. Named capture groups (?<name>)
  const res8 = analyzeRegex('(?<year>\\d{4})-(?<month>\\d{2})', '', '2026-08');
  const namedYear = res8.matches[0].groups.find((g) => g.name === 'year');
  const namedMonth = res8.matches[0].groups.find((g) => g.name === 'month');
  testAssert(namedYear?.value === '2026', '8. Named group "year" matches "2026"');
  testAssert(namedMonth?.value === '08', '8. Named group "month" matches "08"');

  // 9. Multiple matches with line & column coordinates
  const multilineText = 'First line foo\nSecond line foo\nThird line foo';
  const res9 = analyzeRegex('foo', 'g', multilineText);
  testAssert(res9.matchCount === 3, '9. Three occurrences found');
  testAssert(res9.matches[0].line === 1 && res9.matches[1].line === 2 && res9.matches[2].line === 3, '9. Line coordinates tracked accurately');

  // 10. Zero-length matches without infinite loop
  const res10 = analyzeRegex('\\b', 'g', 'a b');
  testAssert(res10.valid, '10. Zero-length boundary regex compiles');
  testAssert(res10.matchCount === 4, '10. Zero-length \\b matched without freezing');

  const res10b = analyzeRegex('a*', 'g', 'bb');
  testAssert(res10b.valid, '10b. Greedy zero-match quantifier terminates safely');
  testAssert(res10b.matchCount >= 2, '10b. Multiple zero-length matches extracted without hanging');

  // 11. Invalid regex syntax error handling
  const res11 = analyzeRegex('[unclosed-bracket', '', 'test');
  testAssert(!res11.valid, '11. Invalid bracket regex caught as invalid');
  testAssert(res11.error !== null, '11. Error message provided');

  // 12. Invalid flag rejection
  const res12 = analyzeRegex('test', 'xyz', 'test');
  testAssert(!res12.valid, '12. Invalid regex flags return clean error');

  // 13. Empty regex handling
  const res13 = analyzeRegex('', '', 'sample text');
  testAssert(res13.valid && res13.matchCount === 0, '13. Empty regex handled gracefully with 0 matches');

  // 14. Empty test string handling
  const res14 = analyzeRegex('abc', 'g', '');
  testAssert(res14.valid && res14.matchCount === 0, '14. Empty test string returns 0 matches');

  // 15. Replacement with standard string
  const rep15 = executeReplacement('hello world', 'world', '', 'everyone');
  testAssert(rep15.success && rep15.result === 'hello everyone', '15. Literal replacement works');

  // 16. Replacement with capture references ($1, $&, $<name>)
  const rep16 = executeReplacement('2026-08-17', '(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})', '', '$<d>/$<m>/$<y>');
  testAssert(rep16.success && rep16.result === '17/08/2026', '16. Named capture replacement works ($<name>)');

  const rep16b = executeReplacement('apple and banana', '(\\w+) and (\\w+)', '', '$2 and $1');
  testAssert(rep16b.success && rep16b.result === 'banana and apple', '16b. Numbered capture replacement works ($1, $2)');

  // 17. No-match case
  const res17 = analyzeRegex('zebra', '', 'horse and donkey');
  testAssert(res17.valid && res17.matchCount === 0, '17. No-match returns valid 0 matches');

  // 18. Special regex characters
  const res18 = analyzeRegex('\\[\\$\\^\\*\\+\\?\\(\\)\\{\\}\\|\\]', '', '[$^*+?(){}|]');
  testAssert(res18.valid && res18.matchCount === 1, '18. Escaped regex meta-characters match exactly');

  // 19. HTML/XSS-looking input safety
  const xssString = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  const res19 = analyzeRegex('<[^>]+>', 'g', xssString);
  testAssert(res19.matchCount === 3, '19. HTML tags matched cleanly');
  const segs19 = buildHighlightSegments(xssString, res19.matches);
  testAssert(segs19.length > 0, '19. Highlight segments built without HTML evaluation');

  // 20. Large input handling & performance
  const largeText = 'The quick brown fox jumps over the lazy dog. '.repeat(1000); // 45,000 chars
  const res20 = analyzeRegex('fox', 'g', largeText);
  testAssert(res20.matchCount === 1000, '20. Large text matches 1,000 occurrences');
  testAssert(res20.executionTimeMs >= 0, '20. Execution time recorded');

  // 21. Line-ending detection (LF, CRLF, CR, Mixed)
  const diagLF = calculateStringDiagnostics('line1\nline2\nline3');
  testAssert(diagLF.lineEndings.dominant === 'LF' && diagLF.lineCount === 3, '21. LF line endings detected');

  const diagCRLF = calculateStringDiagnostics('line1\r\nline2\r\nline3');
  testAssert(diagCRLF.lineEndings.dominant === 'CRLF' && diagCRLF.lineCount === 3, '21. CRLF line endings detected');

  const diagMixed = calculateStringDiagnostics('line1\r\nline2\nline3\rline4');
  testAssert(diagMixed.lineEndings.dominant === 'Mixed' && diagMixed.lineCount === 4, '21. Mixed line endings detected');

  // 22. UTF-16 code units vs Unicode code-point counts
  const emojiStr = 'Hi 🚀🌟!';
  const diagEmoji = calculateStringDiagnostics(emojiStr);
  // 'Hi 🚀🌟!' -> chars: H(1), i(1), space(1), 🚀(2 UTF-16 units), 🌟(2 UTF-16 units), !(1) = 8 code units, 6 code points
  testAssert(diagEmoji.codeUnits === 8, '22. UTF-16 code units counted as 8');
  testAssert(diagEmoji.codePoints === 6, '22. Unicode code points counted as 6');

  // 23. UTF-8 byte calculation
  const utf8Sample = 'café ☕'; // 'c'(1)+'a'(1)+'f'(1)+'é'(2)+' '(1)+'☕'(3) = 9 bytes
  const diagUtf8 = calculateStringDiagnostics(utf8Sample);
  testAssert(diagUtf8.utf8Bytes === 9, '23. UTF-8 multi-byte sequence correctly sized to 9 bytes');

  // 24. Match highlighting segmentation correctness
  const highlightText = 'AAA 123 BBB 456 CCC';
  const res24 = analyzeRegex('\\d+', 'g', highlightText);
  const segments = buildHighlightSegments(highlightText, res24.matches);
  const reconstructed = segments.map((s) => s.text).join('');
  testAssert(reconstructed === highlightText, '24. Highlight segments reconstruct original text perfectly');
  testAssert(segments.filter((s) => s.isMatch).length === 2, '24. Exactly 2 matched segments highlighted');

  // 25. Extraction utility tests
  const extFull = extractMatches(res24.matches, 'full', '', ', ');
  testAssert(extFull === '123, 456', '25. Full match extraction matches');

  const extJson = extractMatches(res24.matches, 'json');
  testAssert(JSON.parse(extJson).length === 2, '25. JSON structured extraction valid');

  // 26. Tool Registry registration
  const toolEntry = TOOL_REGISTRY.find((t) => t.id === 'regex-tester');
  testAssert(!!toolEntry, '26. regex-tester registered in TOOL_REGISTRY');
  testAssert(toolEntry?.route === '/regex-tester', '26. Route is /regex-tester');
  testAssert(toolEntry?.category === 'developer', '26. Category is developer');
  testAssert(toolEntry?.indexable === true, '26. Tool is marked indexable');

  // 27. SEO Metadata and canonical
  const seoData = await parseSeoRoute('/regex-tester');
  testAssert(seoData.path === '/regex-tester', '27. SEO path matches');
  testAssert(seoData.canonicalUrl === 'https://zapixal.com/regex-tester', '27. Canonical URL is https://zapixal.com/regex-tester');
  testAssert(seoData.metaTitle.includes('Regex Tester'), '27. Meta title includes Regex Tester');
  testAssert(seoData.jsonLd?.softwareApp !== undefined, '27. SoftwareApplication schema present');
  testAssert(seoData.jsonLd?.faqPage !== undefined, '27. FAQPage schema present');

  // 28. Presets availability
  testAssert(REGEX_PRESETS.length >= 7, '28. Presets library loaded with comprehensive patterns');

  console.log(`\n========================================`);
  console.log(`ALL REGEX TESTS COMPLETE: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRegexTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
