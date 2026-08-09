import { DOMAIN } from '../routes';
import { SeoRouteData } from '../../seoEngine';

export function getPageSeo(fullUrl: string, path: string): SeoRouteData {
  return {
    path,
    h1Title: 'Page Not Found',
    metaTitle: 'Page Not Found | Zapixal',
    metaDescription: 'The requested page could not be found.',
    canonicalUrl: fullUrl,
    isIndexable: false,
    isNotFound: true,
    pageCategory: 'use-case',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Not Found', url: path },
    ],
    guideContent: {
      badge: '',
      section1Title: '',
      section1Body: '',
      section2Title: '',
      section2Body: '',
      steps: [],
      faqs: []
    },
    jsonLd: {
      softwareApp: {},
      howTo: null,
      faqPage: null,
      breadcrumbs: null,
      organization: {},
      website: {}
    }
  };
}
