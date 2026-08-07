import { TargetFormat } from '../../types';
import { PSEO_ROUTES_LIST, DOMAIN } from './routes';
import { generateJsonLdSchemas } from './schema';
import { getFallbackEditorialContent, getHomeEditorialContent } from './content';

export interface SeoRouteData {
  path: string;
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  isIndexable: boolean;
  pageCategory: 'converter' | 'compression' | 'use-case' | 'home' | 'resource';
  isNotFound?: boolean;
  fromFormat?: string;
  toFormat?: TargetFormat;
  targetMaxKB?: number;
  stripExif?: boolean;
  presetResize?: { maxWidth: number; maxHeight: number };
  breadcrumbs: { name: string; url: string }[];
  guideContent: {
    badge: string;
    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    steps: string[];
    faqs: { question: string; answer: string }[];
  };
  relatedRoutes?: Array<{ path: string; label: string }>;
  jsonLd: {
    softwareApp: object | null;
    howTo: object | null;
    faqPage: object | null;
    breadcrumbs: object | null;
    organization: object;
    website: object;
  };
}

export function createHomePageSeo(fullUrl: string): SeoRouteData {
  return {
    path: '/',
    h1Title: '100% Free Client-Side Batch Image Converter & Compressor',
    metaTitle: 'Free Offline Image Converter & Compressor | 100% Private | Zapixal',
    metaDescription: 'Convert, compress, and optimize HEIC, PNG, JPG, WebP, AVIF, SVG, and PDF files locally in your browser. Zapixal keeps images private, supports batch work, and helps you choose the right format for the job.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'home',
    breadcrumbs: [{ name: 'Home', url: '/' }],
    guideContent: getHomeEditorialContent(),
    jsonLd: generateJsonLdSchemas(
      '100% Client-Side Batch Image Converter & Compressor',
      'Zapixal converts and compresses HEIC, PNG, JPG, WebP, AVIF, and PDF locally in browser memory with zero server uploads.',
      fullUrl,
      [
        { question: 'Is Zapixal free?', answer: 'Yes, 100% free with zero paywalls or limits.' },
        { question: 'Are files uploaded to a server?', answer: 'No. All processing happens 100% locally in your browser.' }
      ],
      [{ name: 'Home', url: fullUrl }],
      'home'
    )
  };
}

export function parseSeoRoute(pathname: string): SeoRouteData {
  const rawPath = (pathname || '/').split('?')[0].split('#')[0].toLowerCase().trim();
  const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : (rawPath || '/');
  const fullUrl = `${DOMAIN}${path === '/' ? '' : path}`;

  if (path === '/' || path === '') {
    return createHomePageSeo(fullUrl);
  }

  // Legal / Info Pages
  if (path === '/privacy') {
    return {
      path,
      h1Title: 'Privacy Policy',
      metaTitle: 'Privacy Policy | 100% Client-Side Processing | Zapixal',
      metaDescription: 'Zapixal Privacy Policy. 100% of image processing occurs locally in your browser memory using WebAssembly. Zero data collection.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }],
      guideContent: { badge: '', section1Title: '', section1Body: '', section2Title: '', section2Body: '', steps: [], faqs: [] },
      jsonLd: generateJsonLdSchemas('Privacy Policy', '100% client-side privacy policy.', fullUrl, [], [{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }], 'legal')
    };
  }

  if (path === '/terms') {
    return {
      path,
      h1Title: 'Terms of Service',
      metaTitle: 'Terms of Service | Zapixal',
      metaDescription: 'Zapixal Terms of Service. Terms governing offline client-side image processing.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms' }],
      guideContent: { badge: '', section1Title: '', section1Body: '', section2Title: '', section2Body: '', steps: [], faqs: [] },
      jsonLd: generateJsonLdSchemas('Terms of Service', 'Terms of service.', fullUrl, [], [{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms' }], 'legal')
    };
  }

  if (path === '/about') {
    return {
      path,
      h1Title: 'About Zapixal',
      metaTitle: 'About Zapixal | Privacy-First Image Converter',
      metaDescription: 'Zapixal is an ultra-fast, privacy-first image conversion engine that runs entirely inside your browser using WebAssembly.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }],
      guideContent: { badge: '', section1Title: '', section1Body: '', section2Title: '', section2Body: '', steps: [], faqs: [] },
      jsonLd: generateJsonLdSchemas('About Zapixal', 'About Zapixal offline image converter.', fullUrl, [], [{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }], 'legal')
    };
  }

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

export function applySeoToHead(seoData: SeoRouteData) {
  if (typeof document === 'undefined') return;

  document.title = seoData.metaTitle;

  const setMeta = (nameAttr: string, attrVal: string, contentVal: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentVal);
  };

  setMeta('name', 'description', seoData.metaDescription);

  const robotsVal = seoData.isIndexable
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, follow';
  setMeta('name', 'robots', robotsVal);
  setMeta('name', 'googlebot', robotsVal);

  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', seoData.canonicalUrl);

  setMeta('property', 'og:title', seoData.metaTitle);
  setMeta('property', 'og:description', seoData.metaDescription);
  setMeta('property', 'og:url', seoData.canonicalUrl);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', 'Zapixal');
  setMeta('property', 'og:image', `${DOMAIN}/icon-512.png`);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', seoData.metaTitle);
  setMeta('name', 'twitter:description', seoData.metaDescription);
  setMeta('name', 'twitter:image', `${DOMAIN}/icon-512.png`);

  const injectJsonLd = (id: string, schemaObj: object | null) => {
    let scriptEl = document.getElementById(id);
    if (!schemaObj) {
      if (scriptEl) scriptEl.remove();
      return;
    }
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = id;
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schemaObj).replace(/</g, '\\u003c');
  };

  injectJsonLd('jsonld-software', seoData.jsonLd.softwareApp);
  injectJsonLd('jsonld-howto', seoData.jsonLd.howTo);
  injectJsonLd('jsonld-faq', seoData.jsonLd.faqPage);
  injectJsonLd('jsonld-breadcrumbs', seoData.jsonLd.breadcrumbs);
  injectJsonLd('jsonld-organization', seoData.jsonLd.organization);
  injectJsonLd('jsonld-website', seoData.jsonLd.website);
}
