import { SeoRouteData } from '../../seoEngine';
import { generateJsonLdSchemas } from '../schema';

export function getPageSeo(fullUrl: string, path: string): SeoRouteData {
  return {
    path: '/tools',
    h1Title: 'Client-Side Privacy Tools & Utilities Directory',
    metaTitle: 'Free In-Browser Utility & Image Tools | Zapixal Privacy Suite',
    metaDescription: 'Explore free, client-side developer, document, and image processing tools including HEIC to JPG, WebP conversion, PDF merge, JSON formatting, and JWT debugging.',
    canonicalUrl: 'https://zapixal.com/tools',
    isIndexable: true,
    pageCategory: 'resource',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Tools Directory', url: '/tools' }
    ],
    guideContent: null,
    jsonLd: generateJsonLdSchemas(
      'Zapixal In-Browser Tools Directory',
      'Explore client-side privacy-first image, document, developer, and text tools powered by WebAssembly and local browser memory.',
      fullUrl,
      [],
      [{ name: 'Home', url: '/' }, { name: 'Tools Directory', url: '/tools' }],
      'resource'
    )
  };
}
