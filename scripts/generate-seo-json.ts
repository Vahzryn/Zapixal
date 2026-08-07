import fs from 'fs';
import path from 'path';
import { PSEO_ROUTES_LIST } from '../src/lib/seo/routes.ts';
import { parseSeoRoute } from '../src/lib/seo/meta.ts';

async function generateSeoJson() {
  const targetDir = path.resolve('public/seo-data');
  fs.mkdirSync(targetDir, { recursive: true });

  const routePaths = ['/', '/privacy', '/terms', '/about', '/tools', ...PSEO_ROUTES_LIST.map((r) => r.path)];
  const uniquePaths = Array.from(new Set(routePaths));

  console.log(`Generating ${uniquePaths.length} static SEO JSON files in public/seo-data/...`);

  for (const routePath of uniquePaths) {
    const seoData = parseSeoRoute(routePath);
    const slug = routePath === '/' ? 'home' : routePath.slice(1).replace(/\//g, '-');
    fs.writeFileSync(
      path.join(targetDir, `${slug}.json`),
      JSON.stringify(seoData, null, 2),
      'utf-8'
    );
  }

  console.log('Static SEO JSON files generation completed successfully.');
}

generateSeoJson().catch((err) => {
  console.error('Failed to generate SEO JSON:', err);
  process.exit(1);
});
