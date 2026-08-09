import fs from 'node:fs';
import path from 'node:path';
import { PSEO_ROUTES_LIST, ALL_ARTICLE_SYSTEM_ROUTES, DOMAIN } from '../src/lib/seo/routes';

const STATIC_ROUTES = ['/', '/about', '/privacy', '/terms'];

function generateSitemap() {
  const routesSet = new Set<string>();

  // Add static routes
  STATIC_ROUTES.forEach((r) => routesSet.add(r));

  // Add article system routes
  ALL_ARTICLE_SYSTEM_ROUTES.forEach((r) => routesSet.add(r));

  // Add pSEO routes
  PSEO_ROUTES_LIST.forEach((item) => {
    if (item.path) {
      routesSet.add(item.path);
    }
  });

  const baseUrl = DOMAIN.replace(/\/$/, '');

  const urlEntries = Array.from(routesSet).map((routePath) => {
    const formattedPath = routePath === '/' ? '' : (routePath.startsWith('/') ? routePath : `/${routePath}`);
    const loc = `${baseUrl}${formattedPath}`;
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;

  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xmlContent, 'utf-8');
  console.log(`Generated sitemap.xml with ${routesSet.size} routes at ${outputPath}`);
}

generateSitemap();
