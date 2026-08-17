import { SeoRouteData, getNotFoundSeo } from '../seoEngine';
import { applySeoToHead } from './head';
import { getArticleBySlug, getCategoryInfo } from '../../content/articles';
import { generateArticleJsonLdSchema } from './schema';
import { TOOL_REGISTRY } from '../toolRegistry';

export { applySeoToHead };

function getArticleCategorySeo(subPath: string, fullUrl: string): SeoRouteData | null {
  const cat = getCategoryInfo(subPath);
  if (!cat) return null;
  return {
    path: `/articles/${cat.slug}`,
    h1Title: cat.title,
    metaTitle: cat.metaTitle,
    metaDescription: cat.metaDescription,
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'resource',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Articles', url: '/articles' },
      { name: cat.title, url: `/articles/${cat.slug}` }
    ],
    guideContent: null,
    jsonLd: null
  };
}

export const PAGE_IMPORTS: Record<string, () => Promise<{ getPageSeo: (url: string, path: string) => SeoRouteData }>> = {
  'home': () => import('./pages/home'),
  'privacy': () => import('./pages/privacy'),
  'terms': () => import('./pages/terms'),
  'about': () => import('./pages/about'),
  'client-side-private-image-compressor': () => import('./pages/client-side-private-image-compressor'),
  'convert-heic-to-jpg-locally': () => import('./pages/convert-heic-to-jpg-locally'),
  'strip-exif-metadata-online-private': () => import('./pages/strip-exif-metadata-online-private'),
  'bulk-image-compressor-offline': () => import('./pages/bulk-image-compressor-offline'),
  'compress-png-images-online': () => import('./pages/compress-png-images-online'),
  'convert-webp-to-png-transparent': () => import('./pages/convert-webp-to-png-transparent'),
  'convert-avif-to-jpg-converter': () => import('./pages/convert-avif-to-jpg-converter'),
  'convert-svg-to-png-transparent': () => import('./pages/convert-svg-to-png-transparent'),
  'convert-png-to-webp-lossless': () => import('./pages/convert-png-to-webp-lossless'),
  'crop-image-to-exact-aspect-ratio': () => import('./pages/crop-image-to-exact-aspect-ratio'),
  'add-text-watermark-image-browser': () => import('./pages/add-text-watermark-image-browser'),
  'convert-tiff-bmp-to-jpg': () => import('./pages/convert-tiff-bmp-to-jpg'),
  'dpi-ppi-converter-change-image-resolution': () => import('./pages/dpi-ppi-converter-change-image-resolution'),
  'convert-jpg-to-webp-browser': () => import('./pages/convert-jpg-to-webp-browser'),
  'convert-ico-to-png-favicon-extractor': () => import('./pages/convert-ico-to-png-favicon-extractor'),
  'convert-png-to-jpg-white-background': () => import('./pages/convert-png-to-jpg-white-background'),
  'blur-sensitive-image-privacy-pixelator': () => import('./pages/blur-sensitive-image-privacy-pixelator'),
  'secure-document-compressor-pdf': () => import('./pages/secure-document-compressor-pdf'),
  'convert-to-avif-online-free': () => import('./pages/convert-to-avif-online-free'),
  'compress-image-to-exact-size-kb': () => import('./pages/compress-image-to-exact-size-kb'),
  'convert-pdf-pages-to-jpg-images': () => import('./pages/convert-pdf-pages-to-jpg-images'),
  'merge-pdf': () => import('./pages/merge-pdf'),
  'split-pdf': () => import('./pages/split-pdf'),
  'client-side-image-to-base64': () => import('./pages/client-side-image-to-base64'),
  'palette-color-extractor-image-hex': () => import('./pages/palette-color-extractor-image-hex'),
  'embed': () => import('./pages/embed'),
  'widget': () => import('./pages/widget'),
  'tools': () => import('./pages/tools'),
  'articles': () => import('./pages/articles'),
  'articles/benchmarks': () => import('./pages/articles/benchmarks'),
};

export const ROUTE_ALIASES: Record<string, string> = {
  'compress-image-under-50kb-government-portal': 'compress-image-to-exact-size-kb',
  'compress-image-to-100kb-online': 'compress-image-to-exact-size-kb',
  'compress-image-to-200kb-online': 'compress-image-to-exact-size-kb',
  'reduce-image-size-to-1mb-online': 'compress-image-to-exact-size-kb',
  'compress-image-for-email-attachment-limit': 'compress-image-to-exact-size-kb',
  'secure-signature-compressor-pdf': 'secure-document-compressor-pdf',
  'compress-pdf-scanned-document-images': 'secure-document-compressor-pdf',
  'compress-png-lossless-webassembly': 'compress-png-images-online',
  'compress-screenshot-png-size-fast': 'compress-png-images-online',
  'bulk-image-resizer-ecommerce-catalog': 'bulk-image-compressor-offline',
  'shopify-image-optimizer-bulk-free': 'bulk-image-compressor-offline',
  'etsy-image-resizer-batch-optimize': 'bulk-image-compressor-offline',
  'bulk-heic-to-jpg-converter-offline': 'convert-heic-to-jpg-locally',
  'passport-photo-size-reducer-kb': 'crop-image-to-exact-aspect-ratio',
  'discord-avatar-compressor-pfp-size': 'crop-image-to-exact-aspect-ratio',
  'social-media-banner-resizer-linkedin-twitter': 'crop-image-to-exact-aspect-ratio',
  'resize-image-for-job-application-form': 'crop-image-to-exact-aspect-ratio',
  'convert-hdr-heic-to-png-transparency': 'convert-heic-to-jpg-locally',
  'lossless-jpeg-optimizer-exif-preserve': 'client-side-private-image-compressor',
  'high-res-image-resizer-client-side': 'client-side-private-image-compressor',
  'ai-image-compressor-online-private': 'client-side-private-image-compressor',
  'compress-animated-gif-size-online': 'client-side-private-image-compressor',
};

export async function parseSeoRoute(path: string): Promise<SeoRouteData> {
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  const fullUrl = `https://zapixal.com${normalizedPath === '/' ? '' : normalizedPath}`;

  try {
    let key = normalizedPath === '/' ? 'home' : normalizedPath.replace(/^\//, '');
    const isAlias = !!ROUTE_ALIASES[key];
    if (isAlias) {
      key = ROUTE_ALIASES[key];
    }

    // Dynamic Article Handling
    if (key.startsWith('articles/')) {
      const subPath = key.replace('articles/', '');
      
      // Benchmarks has a custom SEO page
      if (subPath === 'benchmarks') {
        const module = await PAGE_IMPORTS[key]();
        return module.getPageSeo(fullUrl, normalizedPath);
      }
      
      // Category Pages
      const categorySeo = getArticleCategorySeo(subPath, fullUrl);
      if (categorySeo) {
         return categorySeo;
      }
      
      // Individual Articles
      const article = getArticleBySlug(subPath);
      if (article) {
         const articleBreadcrumbs = [
           { name: 'Home', url: '/' },
           { name: 'Articles', url: '/articles' },
           { name: article.category, url: `/articles/${article.category}` },
           { name: article.title, url: normalizedPath }
         ];
         const jsonLd = generateArticleJsonLdSchema(
           article.title,
           article.metaDescription,
           fullUrl,
           article.author,
           article.datePublished,
           article.dateModified,
           article.category,
           articleBreadcrumbs
         );
         return {
           path: normalizedPath,
           h1Title: article.title,
           metaTitle: article.metaTitle,
           metaDescription: article.metaDescription,
           canonicalUrl: fullUrl,
           isIndexable: true,
           pageCategory: 'resource',
           breadcrumbs: articleBreadcrumbs,
           guideContent: null,
           jsonLd
         };
      }
    }

    if (PAGE_IMPORTS[key]) {
      const module = await PAGE_IMPORTS[key]();
      const targetUrl = `https://zapixal.com${key === 'home' ? '' : `/${key}`}`;
      const seoRes = module.getPageSeo(targetUrl, normalizedPath);
      
      const toolData = TOOL_REGISTRY.find(t => t.id === key || t.route === `/${key}`);
      if (toolData) {
        // Auto-generate relatedRoutes from TOOL_REGISTRY if not hardcoded (or to override)
        const relatedRoutes = toolData.relatedTools.map(relId => {
          const relTool = TOOL_REGISTRY.find(t => t.id === relId);
          return relTool ? { path: relTool.route, label: relTool.name } : null;
        }).filter(Boolean) as { path: string; label: string }[];

        // Auto-generate breadcrumbs from TOOL_REGISTRY category
        const catMap: Record<string, string> = {
          'images': 'Image Tools',
          'documents': 'Document Tools',
          'developer': 'Developer Tools',
          'text': 'Text Tools',
          'utilities': 'Utilities'
        };
        const catTitle = catMap[toolData.category] || 'Tools';
        const breadcrumbs = [
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools' },
          { name: catTitle, url: `/tools?category=${toolData.category}` },
          { name: toolData.name, url: toolData.route }
        ];

        return { 
          ...seoRes, 
          path: normalizedPath,
          canonicalUrl: targetUrl,
          isIndexable: !isAlias,
          relatedRoutes: relatedRoutes.length > 0 ? relatedRoutes : seoRes.relatedRoutes,
          breadcrumbs: breadcrumbs
        };
      }

      return { 
        ...seoRes, 
        path: normalizedPath,
        canonicalUrl: targetUrl,
        isIndexable: !isAlias
      };
    }
    
    return getNotFoundSeo(fullUrl, normalizedPath);
  } catch (error) {
    console.error(`Failed to load SEO for path ${path}:`, error);
    return getNotFoundSeo(fullUrl, normalizedPath);
  }
}
