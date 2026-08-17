import { SeoRouteData } from '../../../seoEngine';

export function getPageSeo(fullUrl: string, path: string = '/articles/benchmarks'): SeoRouteData {
  return {
    path,
    h1Title: 'Browser Codec Performance Benchmarks',
    metaTitle: 'WebAssembly Codec Benchmarks: AVIF, WebP, MozJPEG | Zapixal',
    metaDescription: 'Empirical benchmark analysis of in-browser WebAssembly image conversion speed, RAM footprint, and compression density across modern browser engines.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'resource',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Articles', url: '/articles' },
      { name: 'Benchmarks', url: path }
    ],
    guideContent: null,
    jsonLd: {
      article: {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Client-Side WebAssembly Image Codec Compression Benchmarks (2026)',
        'description': 'Empirical benchmark analysis evaluating WebAssembly image codecs (MozJPEG, libwebp, libavif, UPNG) across photography and UI screenshots.',
        'author': {
          '@type': 'Organization',
          'name': 'Zapixal Research Team',
          'url': 'https://zapixal.com'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Zapixal',
          'url': 'https://zapixal.com'
        },
        'datePublished': '2026-08-13',
        'dateModified': '2026-08-13',
        'mainEntityOfPage': fullUrl
      },
      softwareApp: null,
      howTo: null,
      faqPage: null,
      breadcrumbs: null,
      organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Zapixal',
        'url': 'https://zapixal.com'
      },
      website: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Zapixal',
        'url': 'https://zapixal.com'
      }
    }
  };
}
