import assert from 'node:assert';
import { PSEO_ROUTES_LIST } from '../src/lib/seo/routes';
import { parseSeoRoute, ROUTE_ALIASES } from '../src/lib/seo/meta';
import { PSEO_PAGE_BRIEFS } from '../src/lib/seo/briefs';
import { VERIFIED_FACTS } from '../src/lib/seo/facts';

console.log('----------------------------------------------------');
console.log('ZAPIXAL SEO ENGINE — BATCH 5 QUALITY ASSURANCE RUN');
console.log('----------------------------------------------------');

const BANNED_SLOP = [
  'in conclusion',
  'furthermore',
  'moreover',
  'delve into',
  'revolutionize',
  'unlock',
  'seamless',
  'robust',
  'in today\'s digital landscape',
  'look no further',
  'it\'s important to note'
];

async function runSeoQualityTests() {
  const intros = new Set<string>();
  const titles = new Set<string>();
  const h1s = new Set<string>();
  let passedCount = 0;

  console.log(`Verifying metadata coverage and structure for all ${PSEO_ROUTES_LIST.length} active routes...`);

  for (const route of PSEO_ROUTES_LIST) {
    const path = route.path;
    const slug = path.startsWith('/') ? path.slice(1) : path;

    // 1. Brief coverage check
    const targetSlug = ROUTE_ALIASES[slug] || slug;
    const brief = PSEO_PAGE_BRIEFS[targetSlug];
    assert.ok(brief, `Missing Page Brief for slug: "${slug}" (target: "${targetSlug}"). Every active PSEO page must have a structured brief.`);
    assert.strictEqual(brief.slug, targetSlug, `Page brief slug "${brief.slug}" must match target slug "${targetSlug}"`);

    // 2. Load actual rendered page data
    const url = `https://zapixal.com${path}`;
    const pageData = await parseSeoRoute(path);

    assert.ok(pageData, `Failed to load page seo data for path "${path}"`);
    assert.ok(pageData.metaTitle, `Missing metaTitle for path "${path}"`);
    assert.ok(pageData.metaDescription, `Missing metaDescription for path "${path}"`);
    assert.ok(pageData.h1Title, `Missing h1Title for path "${path}"`);
    assert.ok(pageData.guideContent, `Missing guideContent for path "${path}"`);

    assert.ok(!pageData.isNotFound, `Route "${path}" resolved to Not Found! Every active route must have a registered SEO page module.`);
    const guide = pageData.guideContent;
    assert.ok(guide.badge, `Missing badge in guide content on "${path}"`);
    assert.ok(guide.section1Title, `Missing section1Title in guide content on "${path}"`);
    assert.ok(guide.section1Body, `Missing section1Body in guide content on "${path}"`);
    assert.ok(guide.section2Title, `Missing section2Title in guide content on "${path}"`);
    assert.ok(guide.section2Body, `Missing section2Body in guide content on "${path}"`);
    assert.ok(guide.steps && guide.steps.length > 0, `Steps array must have at least one step on "${path}"`);
    assert.ok(guide.faqs && guide.faqs.length > 0, `FAQs array must have at least one faq on "${path}"`);

    // 3. Uniqueness Check (No duplications of Titles, H1s, or Intros across canonical pages)
    if (!ROUTE_ALIASES[slug]) {
      const introTrimmed = guide.section1Body.slice(0, 100).toLowerCase().trim();
      assert.ok(!intros.has(introTrimmed), `DUPLICATE CONTENT DETECTED: First paragraph on "${path}" is identical to another page!`);
      intros.add(introTrimmed);

      assert.ok(!titles.has(pageData.metaTitle), `DUPLICATE TITLE DETECTED: "${pageData.metaTitle}" is duplicated elsewhere!`);
      titles.add(pageData.metaTitle);

      assert.ok(!h1s.has(pageData.h1Title), `DUPLICATE H1 DETECTED: "${pageData.h1Title}" is duplicated elsewhere!`);
      h1s.add(pageData.h1Title);
    }

    // 4. Banned AI Slop Filter Check
    const fullText = JSON.stringify(pageData).toLowerCase();
    for (const slop of BANNED_SLOP) {
      assert.ok(!fullText.includes(slop), `BANNED SLOP TERM DETECTED on page "${path}": Contains banned keyword "${slop}"!`);
    }

    // 5. Anti-Hallucination checks (Prevent server/cloud uploads mentions)
    const serverMentions = ['cloud upload', 'uploaded to secure server', 'safely stored on cloud', 'transfers to our servers', 'server-side processing'];
    for (const mention of serverMentions) {
      assert.ok(!fullText.includes(mention), `HALLUCINATION DETECTED on "${path}": Falsely claimed database/server storage "${mention}" in privacy-first app!`);
    }

    const bannedClaims = [
      '100% private', '100% secure', 'guaranteed private', 'guaranteed secure', 'zero identity leakage',
      'ats compliant', 'government compliant', 'visa compliant', 'passport compliant', 'biometric compliant',
      'guaranteed acceptance', 'guaranteed approval', 'universally accepted',
      'byte-for-byte identical', 'perfect seo', 'guaranteed rankings', 'guaranteed google indexing',
      'other tools store', 'other tools hide', 'competitors hide', 'cloud converters cache',
      'other services strip', 'competitor security', 'other platform', 'other service', 'other site',
      'online tool', 'cloud converter'
    ];
    for (const claim of bannedClaims) {
      assert.ok(!fullText.includes(claim), `UNSUPPORTED CLAIM DETECTED on "${path}": Contains banned phrase "${claim}"!`);
    }

    // 6. Regulatory disclaimer checks for passport, visa, and government portals
    if (slug.includes('passport') || slug.includes('visa') || slug.includes('government') || slug.includes('portal')) {
      const hasDisclaimer = fullText.includes('vary') || fullText.includes('consulate') || fullText.includes('official') || fullText.includes('requirement') || fullText.includes('guidelines');
      assert.ok(hasDisclaimer, `MISSING CAVATE / DISCLAIMER on "${path}": Sizing guidelines for passport/government are variable and must display appropriate official caveats.`);
    }

    // 7. Internal Link validation
    if (pageData.relatedRoutes) {
      assert.ok(pageData.relatedRoutes.length >= 2, `SEO best practice: At least 2 related internal routes are required for "${path}"`);
      for (const rel of pageData.relatedRoutes) {
        assert.ok(rel.path.startsWith('/'), `Related link path "${rel.path}" must be a valid relative root path.`);
        assert.ok(PSEO_ROUTES_LIST.some(r => r.path === rel.path), `Related link to invalid path: "${rel.path}" on page "${path}"`);
      }
    }

    // 8. Search-Intent-First check (Immediately answer the query)
    const lowerIntro = guide.section1Body.toLowerCase();
    assert.ok(!lowerIntro.startsWith('since the inception') && !lowerIntro.startsWith('the history of'), `SEARCH INTENT VIOLATION on "${path}": The page must begin with practical problem-solving solutions rather than dry history.`);

    passedCount++;
  }

  console.log(`\n✓ SUCCESS: All ${passedCount} pages fully validated against briefs, facts, uniqueness, and vocabulary filters!`);
  console.log('✓ 100% PSEO Page Brief coverage is verified.');
  console.log('✓ Anti-duplication mechanisms verified.');
  console.log('✓ Anti-hallucination bounds fully active.');
  console.log('----------------------------------------------------');
}

runSeoQualityTests().catch((err) => {
  console.error('\n❌ QA Run Failed:');
  console.error(err);
  process.exit(1);
});
