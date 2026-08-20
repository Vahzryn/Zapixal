import {
  computeTextDiff,
  calculateTextStats,
  stripUtf8Bom,
  isBinaryContent,
  tryFormatJson,
} from '../src/lib/diffEngine';
import { TOOL_REGISTRY } from '../src/lib/toolRegistry';
import { parseSeoRoute } from '../src/lib/seo/meta';

async function runDiffComparatorTests() {
  console.log('--- RUNNING RIGOROUS DIFF VIEWER & TEXT COMPARATOR TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function testAssert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${name}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Text Statistics Calculation
  const stats = calculateTextStats('Hello World\nLine 2 🚀');
  testAssert(stats.lines === 2, '1. Correct line count');
  testAssert(stats.words === 5, '1. Correct word count');
  testAssert(stats.unicodeCodePoints > 0, '1. Correct Unicode code points calculation');

  // 2. Identical Inputs Diff
  const identicalText = 'const x = 10;\nconsole.log(x);';
  const identicalResult = computeTextDiff(identicalText, identicalText);
  testAssert(identicalResult.stats.similarityPercentage === 100, '2. Identical text yields 100% similarity');
  testAssert(identicalResult.stats.addedLines === 0 && identicalResult.stats.removedLines === 0, '2. Zero added/removed lines on identical text');

  // 3. Pure Insertion & Deletion
  const resEmptyLeft = computeTextDiff('', 'added line 1\nadded line 2');
  testAssert(resEmptyLeft.stats.addedLines === 2 && resEmptyLeft.stats.removedLines === 0, '3. Empty left input produces pure additions');

  const resEmptyRight = computeTextDiff('removed line 1\nremoved line 2', '');
  testAssert(resEmptyRight.stats.removedLines === 2 && resEmptyRight.stats.addedLines === 0, '3. Empty right input produces pure deletions');

  // 4. Line Modifications
  const leftText = 'line 1\nline 2\nline 3';
  const rightText = 'line 1\nline 2 updated\nline 3\nline 4';
  const diffRes = computeTextDiff(leftText, rightText);
  testAssert(diffRes.stats.addedLines > 0, '4. Detects added lines');
  testAssert(diffRes.sideBySideLines.length >= 3, '4. Generates side-by-side lines');
  testAssert(diffRes.unifiedLines.length >= 3, '4. Generates unified lines');

  // 5. Unified Patch Text Output
  testAssert(typeof diffRes.unifiedPatchText === 'string' && diffRes.unifiedPatchText.includes('--- Original'), '5. Generates valid Unified Patch format');

  // 6. Character-Level Tokens
  const charRes = computeTextDiff('apple', 'apply');
  const hasTokens = charRes.sideBySideLines.some((item) => item.leftTokens && item.rightTokens);
  testAssert(hasTokens, '6. Character-level tokens generated for fine-grained line diffs');

  // 7. Unicode & Emoji Code Points
  const emojiStats = calculateTextStats('🚀 Rocket 😀 Smile');
  testAssert(emojiStats.unicodeCodePoints < emojiStats.utf16CodeUnits, '7. Emoji surrogate pairs distinguished');

  // 8. UTF-8 BOM Stripping
  const bomText = '\uFEFFHeader\nData';
  testAssert(stripUtf8Bom(bomText) === 'Header\nData', '8. UTF-8 BOM marker stripped cleanly');

  // 9. CRLF / LF Normalization
  const crlfRes = computeTextDiff('line1\r\nline2', 'line1\nline2');
  testAssert(crlfRes.stats.similarityPercentage === 100, '9. CRLF and LF normalized identically');

  // 10. Whitespace Sensitivity & Options
  const wsSensRes = computeTextDiff('  code()  ', 'code()');
  testAssert(wsSensRes.stats.similarityPercentage < 100, '10. Default comparison is whitespace-sensitive');

  const wsIgnRes = computeTextDiff('  code()  ', 'code()', { ignoreWhitespace: true });
  testAssert(wsIgnRes.stats.similarityPercentage === 100, '10. ignoreWhitespace option works');

  // 11. Case Sensitivity & Options
  const caseSensRes = computeTextDiff('Zapixal', 'zapixal');
  testAssert(caseSensRes.stats.similarityPercentage < 100, '11. Default comparison is case-sensitive');

  const caseIgnRes = computeTextDiff('Zapixal', 'zapixal', { ignoreCase: true });
  testAssert(caseIgnRes.stats.similarityPercentage === 100, '11. ignoreCase option works');

  // 12. Security & Sanitization
  const xssInput = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
  const xssRes = computeTextDiff(xssInput, xssInput);
  testAssert(xssRes.sideBySideLines[0].leftContent === xssInput, '12. HTML/XSS input preserved as inert text');

  // 13. Binary Null Byte Detection
  const binaryString = 'Clean text\x00Binary null byte';
  testAssert(isBinaryContent(binaryString) === true, '13. Binary content (null byte) detected');

  // 14. JSON Pre-formatting
  const unformattedJson = '{"b":2,"a":1}';
  const jsonRes = tryFormatJson(unformattedJson);
  testAssert(jsonRes.success && jsonRes.formatted.includes('\n'), '14. Valid JSON auto-formatted before comparison');

  // 15. Tool Registry & SEO Route Validation
  const diffTool = TOOL_REGISTRY.find((t) => t.id === 'text-diff');
  testAssert(!!diffTool, '15. text-diff tool registered in TOOL_REGISTRY');
  testAssert(diffTool?.route === '/text-diff', '15. Correct route /text-diff');
  testAssert(diffTool?.category === 'text', '15. Assigned to category text');

  const seoData = await parseSeoRoute('/text-diff');
  testAssert(seoData.path === '/text-diff', '16. SEO parser resolves /text-diff route');
  testAssert(seoData.isIndexable === true, '16. Route /text-diff is indexable');
  testAssert(seoData.canonicalUrl === 'https://zapixal.com/text-diff', '16. Canonical URL matches exactly');
  testAssert(!!seoData.h1Title && seoData.h1Title.length > 5, '16. Contains descriptive H1 title');

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runDiffComparatorTests().catch((err) => {
  console.error('Diff Comparator Test Suite Failed:', err);
  process.exit(1);
});
