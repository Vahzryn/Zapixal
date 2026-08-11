import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { parseSeoRoute, PSEO_ROUTES_LIST } from '../src/lib/seoEngine';
import { ALL_ARTICLE_SYSTEM_ROUTES } from '../src/lib/seo/routes';

async function prerender() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found. Did you run vite build?');
    process.exit(1);
  }

  const ssrEntryPath = path.resolve(process.cwd(), 'dist-ssr', 'entry-server.js');
  if (!fs.existsSync(ssrEntryPath)) {
    console.error('dist-ssr/entry-server.js not found. Did you run vite build --ssr?');
    process.exit(1);
  }

  const { renderApp } = await import(pathToFileURL(ssrEntryPath).href);
  const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  const staticRoutes = [
    '/',
    '/tools',
    ...PSEO_ROUTES_LIST.map(r => r.path),
    ...ALL_ARTICLE_SYSTEM_ROUTES,
    '/about',
    '/privacy',
    '/terms',
    '/404'
  ];


  const uniqueRoutes = Array.from(new Set(staticRoutes));

  for (const route of uniqueRoutes) {
    const seoData = await parseSeoRoute(route);
    const appHtml = await renderApp(route, seoData);

    let html = templateHtml;

    // Inject SSR content into #root
    html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*<script/m, `<div id="root">${appHtml}</div>\n    <script`);

    // Replace <title>
    html = html.replace(/<title>[\s\S]*?<\/title>/g, `<title>${seoData.metaTitle}</title>`);

    // Replace meta tags
    const replaceMeta = (nameAttr: string, attrVal: string, contentVal: string) => {
      const regex = new RegExp(`<meta\\s+(?:name|property)="${attrVal}"\\s+content="[^"]*"\\s*\\/?>`, 'g');
      if (regex.test(html)) {
        html = html.replace(regex, `<meta ${nameAttr}="${attrVal}" content="${contentVal}" />`);
      }
    };

    replaceMeta('name', 'title', seoData.metaTitle);
    replaceMeta('name', 'description', seoData.metaDescription);

    const robotsVal = seoData.isIndexable
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, follow';
    replaceMeta('name', 'robots', robotsVal);
    replaceMeta('name', 'googlebot', robotsVal);

    // Canonical
    const canonicalRegex = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g;
    html = html.replace(canonicalRegex, `<link rel="canonical" href="${seoData.canonicalUrl}" />`);

    const ogImageUrl = seoData.ogImage?.url || 'https://zapixal.com/icon-512.png';
    const ogImageAlt = seoData.ogImage?.alt || seoData.metaTitle;

    replaceMeta('property', 'og:title', seoData.metaTitle);
    replaceMeta('property', 'og:description', seoData.metaDescription);
    replaceMeta('property', 'og:url', seoData.canonicalUrl);
    replaceMeta('property', 'og:image', ogImageUrl);

    replaceMeta('name', 'twitter:card', 'summary_large_image');
    replaceMeta('name', 'twitter:title', seoData.metaTitle);
    replaceMeta('name', 'twitter:description', seoData.metaDescription);
    replaceMeta('name', 'twitter:image', ogImageUrl);

    if (!html.includes('og:image:width')) {
      html = html.replace(
        '<meta property="og:image"',
        `<meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="${ogImageAlt}" />\n    <meta property="og:image"`
      );
    }

    // Strip all existing json-ld scripts
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');

    // Prepare new json-ld scripts
    let jsonLdScripts = '';
    if (seoData.jsonLd) {
      if (seoData.jsonLd.article) jsonLdScripts += `<script id="jsonld-article" type="application/ld+json">${JSON.stringify(seoData.jsonLd.article)}</script>\n`;
      if (seoData.jsonLd.softwareApp) jsonLdScripts += `<script id="jsonld-software" type="application/ld+json">${JSON.stringify(seoData.jsonLd.softwareApp)}</script>\n`;
      if (seoData.jsonLd.howTo) jsonLdScripts += `<script id="jsonld-howto" type="application/ld+json">${JSON.stringify(seoData.jsonLd.howTo)}</script>\n`;
      if (seoData.jsonLd.faqPage) jsonLdScripts += `<script id="jsonld-faq" type="application/ld+json">${JSON.stringify(seoData.jsonLd.faqPage)}</script>\n`;
      if (seoData.jsonLd.breadcrumbs) jsonLdScripts += `<script id="jsonld-breadcrumbs" type="application/ld+json">${JSON.stringify(seoData.jsonLd.breadcrumbs)}</script>\n`;
      if (seoData.jsonLd.organization) jsonLdScripts += `<script id="jsonld-organization" type="application/ld+json">${JSON.stringify(seoData.jsonLd.organization)}</script>\n`;
      if (seoData.jsonLd.website) jsonLdScripts += `<script id="jsonld-website" type="application/ld+json">${JSON.stringify(seoData.jsonLd.website)}</script>\n`;
    }

    // Inject JSON-LD and seo-data-payload right before </head>
    const payloadScript = `<script id="seo-data-payload" type="application/json">${JSON.stringify(seoData)}</script>`;

    html = html.replace('</head>', `${jsonLdScripts}${payloadScript}\n</head>`);

    const routePath = route.replace(/^\//, '');
    if (routePath) {
      const routeDir = path.join(distDir, routePath);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      const outPath = path.join(routeDir, 'index.html');
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`Prerendered: ${routePath}/index.html`);

      if (routePath === '404') {
        const root404Path = path.join(distDir, '404.html');
        fs.writeFileSync(root404Path, html, 'utf8');
        console.log('Prerendered: 404.html');
      }
    } else {
      fs.writeFileSync(indexHtmlPath, html, 'utf8');
      console.log(`Prerendered: index.html`);
    }
  }

  // Cleanup dist-ssr directory
  const distSsrDir = path.resolve(process.cwd(), 'dist-ssr');
  if (fs.existsSync(distSsrDir)) {
    fs.rmSync(distSsrDir, { recursive: true, force: true });
    console.log('Cleaned up dist-ssr directory.');
  }

  console.log('All static routes prerendered successfully.');
}

prerender().catch((err) => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});
