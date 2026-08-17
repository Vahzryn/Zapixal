import { SeoRouteData } from '../../seoEngine';
import { generateJsonLdSchemas } from '../schema';

export function getPageSeo(fullUrl: string, path: string): SeoRouteData {
  return {
    path: '/tools',
    h1Title: '42 Client-Side Image Processing Tools',
    metaTitle: '42 Free In-Browser Image Tools | Zapixal Privacy Suite',
    metaDescription: 'Explore 42 free, client-side image processing tools including HEIC to JPG, WebP conversion, batch compression, EXIF removal, and DPI adjustment.',
    canonicalUrl: 'https://zapixal.com/tools',
    isIndexable: true,
    pageCategory: 'resource',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Tools Directory', url: '/tools' }
    ],
    guideContent: null,
    jsonLd: generateJsonLdSchemas(
      'Zapixal 42 In-Browser Image Tools Directory',
      'Explore 42 client-side privacy-first image tools powered by WebAssembly and local browser memory.',
      fullUrl,
      [],
      [{ name: 'Home', url: '/' }, { name: 'Tools Directory', url: '/tools' }],
      'resource'
    )
  };
}
