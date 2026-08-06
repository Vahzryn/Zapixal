import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from '../src/App.tsx';
import { PSEO_ROUTES_LIST, DOMAIN } from '../src/lib/seo/routes.ts';
import { parseSeoRoute } from '../src/lib/seo/meta.ts';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function runPrerender() {
  const distDir = path.resolve('dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('Build template dist/index.html not found! Ensure vite build ran first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  // Collect all static routes
  const routePaths = ['/', '/privacy', '/terms', '/about', '/tools', ...PSEO_ROUTES_LIST.map((r) => r.path)];
  const uniquePaths = Array.from(new Set(routePaths));

  console.log(`Prerendering ${uniquePaths.length} static HTML routes with real SSG markup...`);

  const sitemapUrls = [];

  for (const routePath of uniquePaths) {
    const seoData = parseSeoRoute(routePath);
    const fullUrl = `${DOMAIN}${routePath === '/' ? '' : routePath}`;
    sitemapUrls.push({
      url: fullUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: routePath === '/' ? 'daily' : 'weekly',
      priority: routePath === '/' ? '1.0' : '0.8',
    });

    let html = baseHtml;

    // 1. Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(seoData.metaTitle)}</title>`);

    // 2. Remove any existing keywords meta if present
    html = html.replace(/<meta\s+name="keywords"\s+content=".*?"\s*\/?>/gi, '');

    // 3. Build Head Tags Block
    const robotsVal = seoData.isIndexable
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, follow';

    const escapeJson = (obj: any) => JSON.stringify(obj).replace(/</g, '\\u003c');
    
    const jsonLdBlocks = [
      seoData.jsonLd.softwareApp ? `<script id="jsonld-software" type="application/ld+json">${escapeJson(seoData.jsonLd.softwareApp)}</script>` : '',
      seoData.jsonLd.howTo ? `<script id="jsonld-howto" type="application/ld+json">${escapeJson(seoData.jsonLd.howTo)}</script>` : '',
      seoData.jsonLd.faqPage ? `<script id="jsonld-faq" type="application/ld+json">${escapeJson(seoData.jsonLd.faqPage)}</script>` : '',
      seoData.jsonLd.breadcrumbs ? `<script id="jsonld-breadcrumbs" type="application/ld+json">${escapeJson(seoData.jsonLd.breadcrumbs)}</script>` : '',
      seoData.jsonLd.organization ? `<script id="jsonld-organization" type="application/ld+json">${escapeJson(seoData.jsonLd.organization)}</script>` : '',
      seoData.jsonLd.website ? `<script id="jsonld-website" type="application/ld+json">${escapeJson(seoData.jsonLd.website)}</script>` : '',
    ].filter(Boolean).join('\n    ');

    const headInject = `
    <meta name="description" content="${escapeHtml(seoData.metaDescription)}" />
    <meta name="robots" content="${robotsVal}" />
    <meta name="googlebot" content="${robotsVal}" />
    <link rel="canonical" href="${escapeHtml(seoData.canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(seoData.metaTitle)}" />
    <meta property="og:description" content="${escapeHtml(seoData.metaDescription)}" />
    <meta property="og:url" content="${escapeHtml(seoData.canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Zapixal" />
    <meta property="og:image" content="${DOMAIN}/icon-512.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seoData.metaTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(seoData.metaDescription)}" />
    <meta name="twitter:image" content="${DOMAIN}/icon-512.png" />
    ${jsonLdBlocks}
    `;

    // Clean up existing default meta description/canonical if in template
    html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/gi, '');
    html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/gi, '');

    html = html.replace('</head>', `${headInject}\n</head>`);

    // 4. Render the actual App component tree via ReactDOMServer
    const appHtml = ReactDOMServer.renderToString(
      React.createElement(App, { initialPath: routePath } as any)
    );

    html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    // Write file
    if (routePath === '/') {
      fs.writeFileSync(templatePath, html, 'utf-8');
    } else {
      const routeDir = path.join(distDir, routePath.slice(1));
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf-8');
    }
  }

  // 5. Build sitemap.xml with 1:1 match of all generated routes
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`Generated sitemap.xml with ${sitemapUrls.length} entries.`);
  console.log('Prerendering completed successfully.');
}

runPrerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
