import { TargetFormat } from '../types';
import { PSEO_ROUTES_LIST, DOMAIN } from './seo/routes';
import { parseSeoRoute as originalParseSeoRoute } from './seo/meta';

export { PSEO_ROUTES_LIST, DOMAIN };

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
  guideContent?: {
    badge: string;
    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    steps: string[];
    faqs: { question: string; answer: string }[];
  } | null;
  relatedRoutes?: Array<{ path: string; label: string }> | null;
  jsonLd?: {
    softwareApp: object | null;
    howTo: object | null;
    faqPage: object | null;
    breadcrumbs: object | null;
    organization: object;
    website: object;
  } | null;
}

export const parseSeoRoute = originalParseSeoRoute;

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

  const injectJsonLd = (id: string, schemaObj: object | null | undefined) => {
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

  if (seoData.jsonLd) {
    injectJsonLd('jsonld-software', seoData.jsonLd.softwareApp);
    injectJsonLd('jsonld-howto', seoData.jsonLd.howTo);
    injectJsonLd('jsonld-faq', seoData.jsonLd.faqPage);
    injectJsonLd('jsonld-breadcrumbs', seoData.jsonLd.breadcrumbs);
    injectJsonLd('jsonld-organization', seoData.jsonLd.organization);
    injectJsonLd('jsonld-website', seoData.jsonLd.website);
  }
}
