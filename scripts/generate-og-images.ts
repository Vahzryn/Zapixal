import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { parseSeoRoute } from '../src/lib/seo/meta';
import { PSEO_ROUTES_LIST } from '../src/lib/seo/routes';
import { ALL_ARTICLE_SYSTEM_ROUTES } from '../src/lib/seo/routes';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function wrapText(text: string, maxCharsPerLine = 34): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3);
}

function getCategoryBadge(pathStr: string, pageCategory?: string): string {
  if (pathStr === '/') return 'Client-Side WASM Engine';
  if (pathStr.startsWith('/articles')) return 'Editorial & Technical Guide';
  if (pageCategory === 'converter') return 'In-Browser Converter';
  if (pageCategory === 'compression') return 'Client-Side Compressor';
  if (pageCategory === 'use-case') return 'Local Image Utility';
  return '100% Client-Side WASM';
}

function generateOgImageSvg(title: string, description: string, badgeText: string): string {
  const titleLines = wrapText(title, 32);
  const descLines = wrapText(description, 58);

  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${220 + i * 52}" fill="#F8FAFC" font-size="42" font-family="sans-serif" font-weight="bold">${escapeXml(line)}</text>`
    )
    .join('\n');

  const descStartY = 230 + titleLines.length * 52;
  const descSvg = descLines
    .map(
      (line, i) =>
        `<text x="80" y="${descStartY + i * 32}" fill="#94A3B8" font-size="22" font-family="sans-serif">${escapeXml(line)}</text>`
    )
    .join('\n');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#070A12"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="#0F172A" stroke="#1E293B" stroke-width="2"/>
  
  <g transform="translate(80, 80)">
    <rect width="44" height="44" rx="10" fill="#0EA5E9"/>
    <path d="M14 14 L30 14 L14 30 L30 30" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="60" y="30" fill="#F8FAFC" font-size="22" font-family="sans-serif" font-weight="bold" letter-spacing="2">ZAPIXAL</text>
  </g>

  <rect x="800" y="80" width="320" height="40" rx="20" fill="#0C4A6E" stroke="#0284C7" stroke-width="1"/>
  <text x="960" y="105" fill="#38BDF8" font-size="15" font-family="sans-serif" font-weight="600" text-anchor="middle">${escapeXml(badgeText)}</text>

  ${titleSvg}
  ${descSvg}

  <line x1="80" y1="520" x2="1120" y2="520" stroke="#1E293B" stroke-width="1"/>
  <text x="80" y="555" fill="#64748B" font-size="16" font-family="sans-serif">Zero Cloud Uploads • WebAssembly Speed • Instant Local Memory Processing</text>
  <text x="1120" y="555" fill="#38BDF8" font-size="18" font-family="sans-serif" font-weight="600" text-anchor="end">zapixal.com</text>
</svg>`;
}

async function generateAllOgImages() {
  const outputDir = path.resolve(process.cwd(), 'public', 'og-images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const staticRoutes = ['/', '/tools', '/about', '/privacy', '/terms'];
  const allRoutes = Array.from(
    new Set([
      ...staticRoutes,
      ...ALL_ARTICLE_SYSTEM_ROUTES,
      ...PSEO_ROUTES_LIST.map((r) => r.path),
    ])
  );

  let generatedCount = 0;

  for (const routePath of allRoutes) {
    const seoData = await parseSeoRoute(routePath);
    const filename = routePath === '/' ? 'home' : routePath.replace(/^\//, '').replace(/\//g, '-');
    const badgeText = getCategoryBadge(routePath, seoData.pageCategory);

    const title = seoData.h1Title || seoData.metaTitle;
    const description = seoData.metaDescription;

    const svg = generateOgImageSvg(title, description, badgeText);
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const pngBuffer = resvg.render().asPng();

    const outFile = path.join(outputDir, `${filename}.png`);
    fs.writeFileSync(outFile, pngBuffer);
    generatedCount++;
  }

  console.log(`Successfully generated ${generatedCount} route-aware OG images in public/og-images/`);
}

generateAllOgImages().catch((err) => {
  console.error('Failed to generate OG images:', err);
  process.exit(1);
});
