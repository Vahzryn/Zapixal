import { SeoRouteData } from '../../../seoEngine';

export function getPageSeo(fullUrl: string, path: string = '/articles/benchmarks'): SeoRouteData {
  return {
    path,
    h1Title: 'Browser Codec Performance Benchmarks',
    metaTitle: 'WebAssembly Codec Benchmarks: AVIF, WebP, MozJPEG | Zapixal',
    metaDescription: 'A reproducible benchmark comparing JPEG, WebP, AVIF, and PNG compression size and encoding time across 20 real-world images.',
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
        'headline': 'Reproducible Image Codec Compression Benchmarks (2026)',
        'description': 'A reproducible benchmark comparing JPEG, WebP, AVIF, and PNG compression size and encoding time across 20 real-world images.',
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
