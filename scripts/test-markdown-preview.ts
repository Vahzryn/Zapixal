import assert from 'node:assert';
import {
  renderMarkdownToHtml,
  extractPlainTextFromMarkdown,
  calculateMarkdownStats,
  generateStandaloneHtmlDocument,
  insertMarkdownSyntax,
  sanitizeUrl,
  sanitizeRawHtml,
  MARKDOWN_PRESETS,
} from '../src/lib/markdownEngine';
import { TOOL_REGISTRY } from '../src/lib/toolRegistry';
import { parseSeoRoute } from '../src/lib/seo/meta';

async function runMarkdownTests() {
  console.log('--- RUNNING RIGOROUS MARKDOWN LIVE PREVIEWER & GFM ENGINE TEST SUITE ---');
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

  // 1. Basic Headings & Anchors
  const h1Html = renderMarkdownToHtml('# Main Heading');
  testAssert(h1Html.includes('<h1 id="main-heading"') && h1Html.includes('Main Heading</h1>'), '1. H1 with slug anchor ID renders');

  const h2Html = renderMarkdownToHtml('## Sub Section Title');
  testAssert(h2Html.includes('<h2 id="sub-section-title"') && h2Html.includes('Sub Section Title</h2>'), '1. H2 renders with slug');

  const h6Html = renderMarkdownToHtml('###### Deep Level Heading');
  testAssert(h6Html.includes('<h6 id="deep-level-heading"'), '1. H6 heading renders correctly');

  // Setext Headings
  const setextH1 = renderMarkdownToHtml('Setext Level 1\n===');
  testAssert(setextH1.includes('<h1') && setextH1.includes('Setext Level 1</h1>'), '1. Setext H1 (===) renders');

  const setextH2 = renderMarkdownToHtml('Setext Level 2\n---');
  testAssert(setextH2.includes('<h2') && setextH2.includes('Setext Level 2</h2>'), '1. Setext H2 (---) renders');

  // 2. Text Emphasis & Inline Elements
  const boldHtml = renderMarkdownToHtml('This is **bold text** and __also bold__');
  testAssert(boldHtml.includes('<strong') && boldHtml.includes('bold text</strong>'), '2. Bold formatting (** and __) renders');

  const italicHtml = renderMarkdownToHtml('This is *italic text* and _also italic_');
  testAssert(italicHtml.includes('<em') && italicHtml.includes('italic text</em>'), '2. Italic formatting (* and _) renders');

  const boldItalicHtml = renderMarkdownToHtml('This is ***bold and italic***');
  testAssert(boldItalicHtml.includes('<strong><em>bold and italic</em></strong>'), '2. Bold and italic (***) renders');

  const strikethroughHtml = renderMarkdownToHtml('~~deprecated method~~');
  testAssert(strikethroughHtml.includes('<del') && strikethroughHtml.includes('deprecated method</del>'), '2. Strikethrough (~~) renders');

  const inlineCodeHtml = renderMarkdownToHtml('Run `npm run build` locally');
  testAssert(inlineCodeHtml.includes('<code') && inlineCodeHtml.includes('npm run build</code>'), '2. Inline code (`) renders');

  // 3. Fenced Code Blocks
  const codeBlockMd = '```typescript\nconst message: string = "Hello";\nconsole.log(message);\n```';
  const codeBlockHtml = renderMarkdownToHtml(codeBlockMd);
  testAssert(codeBlockHtml.includes('data-code-block="true"'), '3. Fenced code block container rendered');
  testAssert(codeBlockHtml.includes('language-typescript'), '3. Code block language class attached');
  testAssert(codeBlockHtml.includes('&quot;Hello&quot;'), '3. Code content properly escaped inside code block');

  // 4. Blockquotes
  const bqMd = '> First quote line\n> Second quote line';
  const bqHtml = renderMarkdownToHtml(bqMd);
  testAssert(bqHtml.includes('<blockquote') && bqHtml.includes('First quote line'), '4. Blockquote rendered with styling');

  // 5. GFM Task Lists
  const taskListMd = '- [x] Completed item\n- [ ] Pending item';
  const taskListHtml = renderMarkdownToHtml(taskListMd);
  testAssert(taskListHtml.includes('<input type="checkbox" checked disabled'), '5. Checked task checkbox renders checked & disabled');
  testAssert(taskListHtml.includes('<input type="checkbox" disabled') && taskListHtml.includes('Pending item'), '5. Pending task checkbox renders unchecked & disabled');

  // 6. Ordered & Unordered Lists
  const ulMd = '- Apple\n- Banana\n- Cherry';
  const ulHtml = renderMarkdownToHtml(ulMd);
  testAssert(ulHtml.includes('<ul') && ulHtml.includes('<li>Apple</li>'), '6. Unordered list (<ul>) renders');

  const olMd = '1. First step\n2. Second step';
  const olHtml = renderMarkdownToHtml(olMd);
  testAssert(olHtml.includes('<ol') && olHtml.includes('<li>First step</li>'), '6. Ordered list (<ol>) renders');

  // 7. GFM Tables with Column Alignments
  const tableMd = `| Name | Role | Status |
| :--- | :---: | ---: |
| Alice | Admin | Active |
| Bob | User | Pending |`;
  const tableHtml = renderMarkdownToHtml(tableMd);
  testAssert(tableHtml.includes('<table') && tableHtml.includes('<thead') && tableHtml.includes('<tbody'), '7. GFM Table structure renders');
  testAssert(tableHtml.includes('text-left') && tableHtml.includes('text-center') && tableHtml.includes('text-right'), '7. GFM Column alignments (left, center, right) applied');
  testAssert(tableHtml.includes('Alice') && tableHtml.includes('Admin'), '7. Table cell data intact');

  // 8. Horizontal Rules
  const hrHtml1 = renderMarkdownToHtml('---');
  const hrHtml2 = renderMarkdownToHtml('***');
  testAssert(hrHtml1.includes('<hr') && hrHtml2.includes('<hr'), '8. Horizontal rules (--- and ***) render');

  // 9. Links and Auto-links
  const linkHtml = renderMarkdownToHtml('[Zapixal](https://zapixal.com "Zapixal Home")');
  testAssert(linkHtml.includes('href="https://zapixal.com"') && linkHtml.includes('title="Zapixal Home"'), '9. Link with title rendered');
  testAssert(linkHtml.includes('rel="noopener noreferrer"'), '9. External link includes security rel attributes');

  const autoLinkHtml = renderMarkdownToHtml('Contact <https://zapixal.com/docs>');
  testAssert(autoLinkHtml.includes('<a href="https://zapixal.com/docs"'), '9. Auto-link (<url>) renders');

  // 10. Rigorous XSS & Security Protections
  const maliciousScript = '<script>alert("XSS Attack")</script>';
  const sanitizedScript = renderMarkdownToHtml(maliciousScript);
  testAssert(!sanitizedScript.includes('<script>') && !sanitizedScript.includes('alert("XSS'), '10. <script> tag completely neutralized');

  const maliciousLink = '[Click Here](javascript:alert(document.cookie))';
  const sanitizedMaliciousLink = renderMarkdownToHtml(maliciousLink);
  testAssert(!sanitizedMaliciousLink.includes('href="javascript:'), '10. Malicious javascript: URL scheme blocked');

  const maliciousImg = '![hacked](javascript:void(0))';
  const sanitizedMaliciousImg = renderMarkdownToHtml(maliciousImg);
  testAssert(!sanitizedMaliciousImg.includes('src="javascript:'), '10. Malicious image URL blocked');

  const dangerousAttr = '<div onclick="alert(1)" onload="evil()">Safe text</div>';
  const sanitizedAttrs = renderMarkdownToHtml(dangerousAttr);
  testAssert(!sanitizedAttrs.includes('onclick') && !sanitizedAttrs.includes('onload'), '10. Event handler attributes stripped from raw HTML');

  // Safe HTML whitelist allowed
  const safeKbd = '<kbd>Ctrl</kbd> + <kbd>C</kbd>';
  const renderedKbd = renderMarkdownToHtml(safeKbd);
  testAssert(renderedKbd.includes('<kbd>Ctrl</kbd>'), '10. Safe whitelist HTML tags (<kbd>) preserved');

  // 11. Image rendering safety
  const safeImg = '![Profile](https://example.com/avatar.png "Avatar")';
  const imgHtml = renderMarkdownToHtml(safeImg);
  testAssert(imgHtml.toLowerCase().includes('referrerpolicy="no-referrer"'), '11. Image contains no-referrer privacy protection');
  testAssert(imgHtml.includes('alt="Profile"'), '11. Alt text correctly set');

  // 12. Plain Text Extraction
  const complexMd = '# Title\n\n**Bold** text with [Link](https://example.com) and `code`.\n- [x] Task\n| Col1 | Col2 |\n|---|---|\n| Val1 | Val2 |';
  const extracted = extractPlainTextFromMarkdown(complexMd);
  testAssert(extracted.includes('Title') && extracted.includes('Bold text with Link and code.'), '12. Plain text extracts words without markup');
  testAssert(!extracted.includes('#') && !extracted.includes('**') && !extracted.includes('['), '12. Markdown punctuation stripped cleanly');

  // 13. Statistical & Unicode Diagnostics
  const statsMd = 'Hello 🚀 World!\n\nSecond paragraph with 3 words.\n- [x] Done\n- [ ] Todo';
  const stats = calculateMarkdownStats(statsMd);
  testAssert(stats.wordCount > 0, '13. Word count calculated');
  testAssert(stats.paragraphCount === 2, '13. Paragraph count is 2');
  testAssert(stats.taskCount.total === 2 && stats.taskCount.completed === 1, '13. Task metrics track completed vs pending');
  testAssert(stats.codePoints > 0 && stats.utf8Bytes > stats.codePoints, '13. Unicode code points and UTF-8 byte calculations accurate');

  // 14. Standalone HTML Export
  const exportHtml = generateStandaloneHtmlDocument('<p>Exported content</p>', 'My Title');
  testAssert(exportHtml.startsWith('<!DOCTYPE html>'), '14. Standalone HTML starts with DOCTYPE');
  testAssert(exportHtml.includes('<title>My Title</title>'), '14. Standalone HTML contains document title');
  testAssert(exportHtml.includes('max-width: 820px'), '14. Standalone HTML includes responsive CSS styles');

  // 15. Editor Toolbar Syntax Actions
  const boldInsert = insertMarkdownSyntax('Sample text', 0, 11, 'bold');
  testAssert(boldInsert.newText === '**Sample text**', '15. Bold toolbar action wraps selected text');

  const tableInsert = insertMarkdownSyntax('', 0, 0, 'table');
  testAssert(tableInsert.newText.includes('| Feature | Status |'), '15. Table toolbar action inserts template table');

  // 16. Template Presets
  testAssert(MARKDOWN_PRESETS.length >= 4, '16. At least 4 diverse Markdown template presets available');
  testAssert(MARKDOWN_PRESETS.some(p => p.id === 'gfm-showcase'), '16. GFM feature showcase preset present');

  // 17. Tool Registry & SEO Route Validation
  const tool = TOOL_REGISTRY.find(t => t.route === '/markdown-live-preview');
  testAssert(!!tool, '17. Tool registered in TOOL_REGISTRY');
  testAssert(tool?.status === 'active' && tool?.category === 'text', '17. Tool status is active and text category');

  const seo = await parseSeoRoute('/markdown-live-preview');
  testAssert(seo.metaTitle.includes('Markdown Live Previewer'), '17. SEO metaTitle contains tool name');
  testAssert(seo.breadcrumbs.length === 4, '17. Breadcrumb hierarchy complete');
  const jsonLd = seo.jsonLd as Record<string, any> | undefined;
  const appType = jsonLd?.softwareApp?.['@type'];
  const hasSoftwareApp = Array.isArray(appType) ? appType.includes('SoftwareApplication') : appType === 'SoftwareApplication';
  testAssert(hasSoftwareApp, '17. SoftwareApplication Schema generated');
  testAssert(jsonLd?.faqPage?.['@type'] === 'FAQPage', '17. FAQPage Schema generated');

  console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runMarkdownTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
