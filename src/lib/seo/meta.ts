import { DOMAIN } from './routes';
import { SeoRouteData } from '../seoEngine';
import { getPageSeo as getNotFoundSeo } from './pages/not-found';

const PAGE_IMPORTS: Record<string, () => Promise<{ getPageSeo: (fullUrl: string, path: string) => SeoRouteData }>> = {
  'home': () => import('./pages/home'),
  'privacy': () => import('./pages/privacy'),
  'terms': () => import('./pages/terms'),
  'about': () => import('./pages/about'),
  'client-side-private-image-compressor': () => import('./pages/client-side-private-image-compressor'),
  'compress-image-under-50kb-government-portal': () => import('./pages/compress-image-under-50kb-government-portal'),
  'convert-heic-to-jpg-locally': () => import('./pages/convert-heic-to-jpg-locally'),
  'strip-exif-metadata-online-private': () => import('./pages/strip-exif-metadata-online-private'),
  'bulk-image-compressor-offline': () => import('./pages/bulk-image-compressor-offline'),
  'compress-png-lossless-webassembly': () => import('./pages/compress-png-lossless-webassembly'),
  'convert-webp-to-png-transparent': () => import('./pages/convert-webp-to-png-transparent'),
  'passport-photo-size-reducer-kb': () => import('./pages/passport-photo-size-reducer-kb'),
  'convert-avif-to-jpg-converter': () => import('./pages/convert-avif-to-jpg-converter'),
  'resize-image-for-job-application-form': () => import('./pages/resize-image-for-job-application-form'),
  'secure-signature-compressor-pdf': () => import('./pages/secure-signature-compressor-pdf'),
  'client-side-image-to-base64': () => import('./pages/client-side-image-to-base64'),
  'convert-svg-to-png-transparent': () => import('./pages/convert-svg-to-png-transparent'),
  'compress-animated-gif-size-online': () => import('./pages/compress-animated-gif-size-online'),
  'convert-png-to-webp-lossless': () => import('./pages/convert-png-to-webp-lossless'),
  'crop-image-to-exact-aspect-ratio': () => import('./pages/crop-image-to-exact-aspect-ratio'),
  'add-text-watermark-image-browser': () => import('./pages/add-text-watermark-image-browser'),
  'convert-tiff-bmp-to-jpg': () => import('./pages/convert-tiff-bmp-to-jpg'),
  'high-res-image-resizer-client-side': () => import('./pages/high-res-image-resizer-client-side'),
  'dpi-ppi-converter-change-image-resolution': () => import('./pages/dpi-ppi-converter-change-image-resolution'),
  'compress-image-for-email-attachment-limit': () => import('./pages/compress-image-for-email-attachment-limit'),
  'convert-jpg-to-webp-browser': () => import('./pages/convert-jpg-to-webp-browser'),
  'compress-screenshot-png-size-fast': () => import('./pages/compress-screenshot-png-size-fast'),
  'convert-ico-to-png-favicon-extractor': () => import('./pages/convert-ico-to-png-favicon-extractor'),
  'bulk-image-resizer-ecommerce-catalog': () => import('./pages/bulk-image-resizer-ecommerce-catalog'),
  'convert-png-to-jpg-white-background': () => import('./pages/convert-png-to-jpg-white-background'),
  'blur-sensitive-image-privacy-pixelator': () => import('./pages/blur-sensitive-image-privacy-pixelator'),
  'convert-hdr-heic-to-png-transparency': () => import('./pages/convert-hdr-heic-to-png-transparency'),
  'social-media-banner-resizer-linkedin-twitter': () => import('./pages/social-media-banner-resizer-linkedin-twitter'),
  'palette-color-extractor-image-hex': () => import('./pages/palette-color-extractor-image-hex'),
  'lossless-jpeg-optimizer-exif-preserve': () => import('./pages/lossless-jpeg-optimizer-exif-preserve'),
  'compress-pdf-scanned-document-images': () => import('./pages/compress-pdf-scanned-document-images'),
  'shopify-image-optimizer-bulk-free': () => import('./pages/shopify-image-optimizer-bulk-free'),
  'convert-to-avif-online-free': () => import('./pages/convert-to-avif-online-free'),
  'ai-image-compressor-online-private': () => import('./pages/ai-image-compressor-online-private'),
  'compress-image-to-100kb-online': () => import('./pages/compress-image-to-100kb-online'),
  'compress-image-to-200kb-online': () => import('./pages/compress-image-to-200kb-online'),
  'bulk-heic-to-jpg-converter-offline': () => import('./pages/bulk-heic-to-jpg-converter-offline'),
  'discord-avatar-compressor-pfp-size': () => import('./pages/discord-avatar-compressor-pfp-size'),
  'reduce-image-size-to-1mb-online': () => import('./pages/reduce-image-size-to-1mb-online'),
  'etsy-image-resizer-batch-optimize': () => import('./pages/etsy-image-resizer-batch-optimize'),
};

export const RELATED_ROUTES_MAP: Record<string, Array<{ path: string; label: string }>> = {
  '/client-side-private-image-compressor': [
    { path: '/ai-image-compressor-online-private', label: 'AI Image Compressor' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Compressor' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata' },
    { path: '/compress-image-to-100kb-online', label: 'Compress to 100KB' },
  ],
  '/compress-image-under-50kb-government-portal': [
    { path: '/compress-image-to-100kb-online', label: 'Compress to 100KB' },
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Size Reducer' },
    { path: '/resize-image-for-job-application-form', label: 'Job Application Resizer' },
    { path: '/secure-signature-compressor-pdf', label: 'Signature Compressor' },
  ],
  '/convert-heic-to-jpg-locally': [
    { path: '/bulk-heic-to-jpg-converter-offline', label: 'Bulk HEIC to JPG' },
    { path: '/convert-hdr-heic-to-png-transparency', label: 'iPhone HEIC to PNG' },
    { path: '/convert-avif-to-jpg-converter', label: 'AVIF to JPG Converter' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata' },
  ],
  '/strip-exif-metadata-online-private': [
    { path: '/lossless-jpeg-optimizer-exif-preserve', label: 'Lossless JPEG Optimizer' },
    { path: '/blur-sensitive-image-privacy-pixelator', label: 'Blur Sensitive Info' },
    { path: '/client-side-private-image-compressor', label: 'Private Image Compressor' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI' },
  ],
  '/bulk-image-compressor-offline': [
    { path: '/ai-image-compressor-online-private', label: 'AI Image Compressor' },
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk E-commerce Resizer' },
    { path: '/compress-image-for-email-attachment-limit', label: 'Compress for Email' },
    { path: '/shopify-image-optimizer-bulk-free', label: 'Shopify Image Optimizer' },
  ],
  '/compress-png-lossless-webassembly': [
    { path: '/convert-png-to-webp-lossless', label: 'PNG to Lossless WebP' },
    { path: '/compress-screenshot-png-size-fast', label: 'Compress Screenshot PNG' },
    { path: '/convert-png-to-jpg-white-background', label: 'PNG to JPG (White Fill)' },
    { path: '/client-side-private-image-compressor', label: 'Private Image Compressor' },
  ],
  '/convert-webp-to-png-transparent': [
    { path: '/convert-svg-to-png-transparent', label: 'SVG to High-Res PNG' },
    { path: '/convert-png-to-webp-lossless', label: 'PNG to Lossless WebP' },
    { path: '/convert-jpg-to-webp-browser', label: 'JPG to WebP Browser' },
  ],
  '/passport-photo-size-reducer-kb': [
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
    { path: '/resize-image-for-job-application-form', label: 'Job Application Resizer' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI' },
    { path: '/compress-image-to-100kb-online', label: 'Compress to 100KB' },
  ],
  '/shopify-image-optimizer-bulk-free': [
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk E-commerce Resizer' },
    { path: '/etsy-image-resizer-batch-optimize', label: 'Etsy Image Resizer' },
    { path: '/convert-to-avif-online-free', label: 'Convert to AVIF' },
    { path: '/convert-png-to-webp-lossless', label: 'PNG to Lossless WebP' },
  ],
  '/convert-to-avif-online-free': [
    { path: '/convert-jpg-to-webp-browser', label: 'JPG to WebP Browser' },
    { path: '/convert-png-to-webp-lossless', label: 'PNG to Lossless WebP' },
    { path: '/convert-avif-to-jpg-converter', label: 'AVIF to JPG Converter' },
  ],
  '/compress-image-to-100kb-online': [
    { path: '/compress-image-to-200kb-online', label: 'Compress to 200KB' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
    { path: '/reduce-image-size-to-1mb-online', label: 'Reduce to 1MB' },
  ],
  '/discord-avatar-compressor-pfp-size': [
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Aspect Ratio' },
    { path: '/compress-animated-gif-size-online', label: 'Compress GIF Size' },
    { path: '/compress-screenshot-png-size-fast', label: 'Compress Screenshot PNG' },
  ],
};

export async function parseSeoRoute(pathname: string): Promise<SeoRouteData> {
  const rawPath = (pathname || '/').split('?')[0].split('#')[0].toLowerCase().trim();
  const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : (rawPath || '/');
  const fullUrl = `${DOMAIN}${path === '/' ? '' : path}`;
  const slug = path === '/' ? 'home' : path.slice(1);

  let seoData: SeoRouteData;

  if (slug in PAGE_IMPORTS) {
    try {
      const pageModule = await PAGE_IMPORTS[slug]();
      seoData = pageModule.getPageSeo(fullUrl, path);
    } catch (err) {
      console.warn(`Failed to dynamically load page module for ${slug}:`, err);
      seoData = getNotFoundSeo(fullUrl, path);
    }
  } else {
    seoData = getNotFoundSeo(fullUrl, path);
  }

  if (!seoData.relatedRoutes) {
    seoData.relatedRoutes = RELATED_ROUTES_MAP[path] || null;
  }

  return seoData;
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
