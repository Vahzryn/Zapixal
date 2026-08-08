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
  // 'convert-png-to-webp-lossless': () => import('./pages/convert-png-to-webp-lossless'),
  'crop-image-to-exact-aspect-ratio': () => import('./pages/crop-image-to-exact-aspect-ratio'),

  'rotate-and-flip-image-local': () => import('./pages/rotate-and-flip-image-local'),
  'add-text-watermark-image-browser': () => import('./pages/add-text-watermark-image-browser'),
  // 'convert-tiff-bmp-to-jpg': () => import('./pages/convert-tiff-bmp-to-jpg'),
  // 'high-res-image-resizer-client-side': () => import('./pages/high-res-image-resizer-client-side'),
  'dpi-ppi-converter-change-image-resolution': () => import('./pages/dpi-ppi-converter-change-image-resolution'),
  'compress-image-for-email-attachment-limit': () => import('./pages/compress-image-for-email-attachment-limit'),
  // 'convert-jpg-to-webp-browser': () => import('./pages/convert-jpg-to-webp-browser'),
  'square-photo-maker-no-crop-blur-border': () => import('./pages/square-photo-maker-no-crop-blur-border'),
  // 'compress-screenshot-png-size-fast': () => import('./pages/compress-screenshot-png-size-fast'),
  'convert-ico-to-png-favicon-extractor': () => import('./pages/convert-ico-to-png-favicon-extractor'),
  // 'bulk-image-resizer-ecommerce-catalog': () => import('./pages/bulk-image-resizer-ecommerce-catalog'),
  'convert-png-to-jpg-white-background': () => import('./pages/convert-png-to-jpg-white-background'),
  // 'blur-sensitive-image-privacy-pixelator': () => import('./pages/blur-sensitive-image-privacy-pixelator'),
  'convert-hdr-heic-to-png-transparency': () => import('./pages/convert-hdr-heic-to-png-transparency'),
  'social-media-banner-resizer-linkedin-twitter': () => import('./pages/social-media-banner-resizer-linkedin-twitter'),
  // 'palette-color-extractor-image-hex': () => import('./pages/palette-color-extractor-image-hex'),
  'lossless-jpeg-optimizer-exif-preserve': () => import('./pages/lossless-jpeg-optimizer-exif-preserve'),


  'compress-pdf-scanned-document-images': () => import('./pages/compress-pdf-scanned-document-images'),
  // 'batch-rename-watermark-resize-pipeline': () => import('./pages/batch-rename-watermark-resize-pipeline'),

  'passport-visa-photo-resizer-background-white': () => import('./pages/passport-visa-photo-resizer-background-white'),


};

export const RELATED_ROUTES_MAP: Record<string, Array<{ path: string; label: string }>> = {
  '/client-side-private-image-compressor': [
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Image Compressor' },
    { path: '/compress-png-lossless-webassembly', label: 'Lossless WebAssembly PNG Compressor' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata Privately' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Image Under 50KB' },
  ],
  '/compress-image-under-50kb-government-portal': [
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Size Reducer (KB)' },
    { path: '/resize-image-for-job-application-form', label: 'Resize Image for Job Applications' },
    { path: '/passport-visa-photo-resizer-background-white', label: 'Passport & Visa Photo Resizer' },
    { path: '/secure-signature-compressor-pdf', label: 'Secure Digital Signature Compressor' },
  ],
  '/convert-heic-to-jpg-locally': [
    { path: '/convert-hdr-heic-to-png-transparency', label: 'Convert iPhone HEIC to Transparent PNG' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata Privately' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Image Compressor' },
    { path: '/convert-avif-to-jpg-converter', label: 'Convert AVIF to JPG' },
  ],
  '/strip-exif-metadata-online-private': [
    { path: '/lossless-jpeg-optimizer-exif-preserve', label: 'Lossless Metadata-Preserving JPEG Optimizer' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI & PPI for Print' },
    { path: '/blur-sensitive-image-privacy-pixelator', label: 'Blur & Pixelate Sensitive Info' },
    { path: '/client-side-private-image-compressor', label: 'Client-Side Private Image Compressor' },
  ],
  '/bulk-image-compressor-offline': [
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk E-commerce Catalog Resizer' },
    { path: '/batch-rename-watermark-resize-pipeline', label: 'Multi-Stage Image Batch Pipeline' },
    { path: '/client-side-private-image-compressor', label: 'Client-Side Private Image Compressor' },
    { path: '/compress-image-for-email-attachment-limit', label: 'Compress Image for Email Limits' },
  ],
  '/compress-png-lossless-webassembly': [
    { path: '/convert-png-to-webp-lossless', label: 'Convert PNG to Lossless WebP' },
    { path: '/compress-screenshot-png-size-fast', label: 'Compress Screenshot PNG Fast' },
    { path: '/convert-png-to-jpg-white-background', label: 'Convert PNG to JPG (White Fill)' },
    { path: '/client-side-private-image-compressor', label: 'Client-Side Private Image Compressor' },
  ],
  '/convert-webp-to-png-transparent': [
    { path: '/convert-svg-to-png-transparent', label: 'Convert SVG to High-Res PNG' },
    { path: '/convert-png-to-webp-lossless', label: 'Convert PNG to Lossless WebP' },
    { path: '/convert-jpg-to-webp-browser', label: 'Convert JPG to WebP in Browser' },
    { path: '/compress-animated-gif-size-online', label: 'Compress Static GIF Size' },
  ],
  '/passport-photo-size-reducer-kb': [
    { path: '/passport-visa-photo-resizer-background-white', label: 'Passport & Visa Photo Resizer' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Image Under 50KB' },
    { path: '/square-photo-maker-no-crop-blur-border', label: 'Square Photo Maker (No Crop)' },
    { path: '/resize-image-for-job-application-form', label: 'Resize Image for Job Applications' },
  ],
  '/convert-avif-to-jpg-converter': [
    { path: '/convert-png-to-jpg-white-background', label: 'Convert PNG to JPG (White Fill)' },
    { path: '/convert-heic-to-jpg-locally', label: 'Convert HEIC to JPG Locally' },
    { path: '/convert-jpg-to-webp-browser', label: 'Convert JPG to WebP in Browser' },
    { path: '/convert-tiff-bmp-to-jpg', label: 'Convert TIFF & BMP to JPG' },
  ],
  '/resize-image-for-job-application-form': [
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Image Under 50KB' },
    { path: '/secure-signature-compressor-pdf', label: 'Secure Digital Signature Compressor' },
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Size Reducer (KB)' },
    { path: '/compress-image-for-email-attachment-limit', label: 'Compress Image for Email Limits' },
  ],
  '/secure-signature-compressor-pdf': [
    { path: '/compress-pdf-scanned-document-images', label: 'Scanned Document Image Quantizer' },
    { path: '/convert-png-to-jpg-white-background', label: 'Convert PNG to JPG (White Fill)' },
    { path: '/resize-image-for-job-application-form', label: 'Resize Image for Job Applications' },
    { path: '/blur-sensitive-image-privacy-pixelator', label: 'Blur & Pixelate Sensitive Info' },
  ],
  '/client-side-image-to-base64': [
    { path: '/convert-svg-to-png-transparent', label: 'Convert SVG to High-Res PNG' },
    { path: '/palette-color-extractor-image-hex', label: 'Image Color Palette Hex Extractor' },
    { path: '/convert-ico-to-png-favicon-extractor', label: 'Extract ICO Favicon to PNG' },
    { path: '/client-side-private-image-compressor', label: 'Client-Side Private Image Compressor' },
  ],
  '/convert-svg-to-png-transparent': [
    { path: '/convert-webp-to-png-transparent', label: 'Convert WebP to PNG (Alpha Intact)' },
    { path: '/convert-ico-to-png-favicon-extractor', label: 'Extract ICO Favicon to PNG' },
    { path: '/convert-png-to-webp-lossless', label: 'Convert PNG to Lossless WebP' },
    { path: '/client-side-image-to-base64', label: 'Client-Side Image to Base64 Encoder' },
  ],
  '/compress-animated-gif-size-online': [
    { path: '/compress-screenshot-png-size-fast', label: 'Compress Screenshot PNG Fast' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Image Compressor' },
    { path: '/client-side-private-image-compressor', label: 'Client-Side Private Image Compressor' },
  ],
  '/convert-png-to-webp-lossless': [
    { path: '/convert-jpg-to-webp-browser', label: 'Convert JPG to WebP in Browser' },
    { path: '/convert-webp-to-png-transparent', label: 'Convert WebP to PNG (Alpha Intact)' },
    { path: '/compress-png-lossless-webassembly', label: 'Lossless WebAssembly PNG Compressor' },
    { path: '/convert-png-to-jpg-white-background', label: 'Convert PNG to JPG (White Fill)' },
  ],
  '/crop-image-to-exact-aspect-ratio': [
    { path: '/square-photo-maker-no-crop-blur-border', label: 'Square Photo Maker (No Crop)' },
    { path: '/social-media-banner-resizer-linkedin-twitter', label: 'Social Media Cover Banner Resizer' },
    { path: '/high-res-image-resizer-client-side', label: 'High-Res Image Resizer Client-Side' },
  ],
  '/rotate-and-flip-image-local': [
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Image to Custom Aspect Ratio' },
    { path: '/square-photo-maker-no-crop-blur-border', label: 'Square Photo Maker (No Crop)' },
    { path: '/add-text-watermark-image-browser', label: 'Apply Text Watermark Client-Side' },
  ],
  '/add-text-watermark-image-browser': [
    { path: '/batch-rename-watermark-resize-pipeline', label: 'Multi-Stage Image Batch Pipeline' },
    { path: '/blur-sensitive-image-privacy-pixelator', label: 'Blur & Pixelate Sensitive Info' },
    { path: '/rotate-and-flip-image-local', label: 'Rotate & Flip Image Locally' },
  ],
  '/convert-tiff-bmp-to-jpg': [
    { path: '/convert-avif-to-jpg-converter', label: 'Convert AVIF to JPG Converter' },
    { path: '/convert-heic-to-jpg-locally', label: 'Convert HEIC to JPG Locally' },
    { path: '/convert-png-to-jpg-white-background', label: 'Convert PNG to JPG (White Fill)' },
  ],
  '/high-res-image-resizer-client-side': [
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk E-commerce Catalog Resizer' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI & PPI for Print' },
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Image to Custom Aspect Ratio' },
    { path: '/social-media-banner-resizer-linkedin-twitter', label: 'Social Media Cover Banner Resizer' },
  ],
  '/dpi-ppi-converter-change-image-resolution': [
    { path: '/high-res-image-resizer-client-side', label: 'High-Res Image Resizer Client-Side' },
    { path: '/passport-visa-photo-resizer-background-white', label: 'Passport & Visa Photo Resizer' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata Privately' },
    { path: '/convert-tiff-bmp-to-jpg', label: 'Convert TIFF & BMP to JPG' },
  ],
  '/blur-sensitive-image-privacy-pixelator': [
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata Privately' },
    { path: '/lossless-jpeg-optimizer-exif-preserve', label: 'Lossless Metadata-Preserving JPEG Optimizer' },
    { path: '/secure-signature-compressor-pdf', label: 'Secure Digital Signature Compressor' },
    { path: '/compress-screenshot-png-size-fast', label: 'Compress Screenshot PNG Fast' },
  ],
  '/convert-hdr-heic-to-png-transparency': [
    { path: '/convert-heic-to-jpg-locally', label: 'Convert HEIC to JPG Locally' },
    { path: '/convert-webp-to-png-transparent', label: 'Convert WebP to PNG (Alpha Intact)' },
    { path: '/convert-svg-to-png-transparent', label: 'Convert SVG to High-Res PNG' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata Privately' },
  ],
  '/social-media-banner-resizer-linkedin-twitter': [
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Image to Custom Aspect Ratio' },
    { path: '/square-photo-maker-no-crop-blur-border', label: 'Square Photo Maker (No Crop)' },
  ],
  '/palette-color-extractor-image-hex': [
    { path: '/client-side-image-to-base64', label: 'Client-Side Image to Base64 Encoder' },
    { path: '/convert-svg-to-png-transparent', label: 'Convert SVG to High-Res PNG' },
  ],
  '/lossless-jpeg-optimizer-exif-preserve': [
    { path: '/convert-jpg-to-webp-browser', label: 'Convert JPG to WebP in Browser' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata Privately' },
    { path: '/client-side-private-image-compressor', label: 'Client-Side Private Image Compressor' },
    { path: '/compress-image-for-email-attachment-limit', label: 'Compress Image for Email Limits' },
  ],
  '/batch-rename-watermark-resize-pipeline': [
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Image Compressor' },
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk E-commerce Catalog Resizer' },
    { path: '/add-text-watermark-image-browser', label: 'Apply Text Watermark Client-Side' },
    { path: '/high-res-image-resizer-client-side', label: 'High-Res Image Resizer Client-Side' },
  ],
  '/passport-visa-photo-resizer-background-white': [
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Size Reducer (KB)' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Image Under 50KB' },
    { path: '/square-photo-maker-no-crop-blur-border', label: 'Square Photo Maker (No Crop)' },
    { path: '/resize-image-for-job-application-form', label: 'Resize Image for Job Applications' },
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
