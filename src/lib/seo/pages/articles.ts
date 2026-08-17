import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/articles';
  return {
    path,
    h1Title: 'Zapixal Articles, Research, and Guides',
    metaTitle: 'Zapixal Articles — Client-Side Image Compression & Performance Research',
    metaDescription: 'Read technical guides, image format comparisons, and original research benchmarks evaluating browser-based WebAssembly image optimization.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'resource',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Articles', url: '/articles' }],
    guideContent: { badge: '', section1Title: '', section1Body: '', section2Title: '', section2Body: '', steps: [], faqs: [] },
    jsonLd: generateJsonLdSchemas('Zapixal Articles', 'Technical articles and guides on client-side image compression and conversion.', fullUrl, [], [{ name: 'Home', url: '/' }, { name: 'Articles', url: '/articles' }], 'resource')
  };
}
