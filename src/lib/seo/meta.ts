import { DOMAIN } from './routes';
import { SeoRouteData } from '../seoEngine';
import { getPageSeo as getNotFoundSeo } from './pages/not-found';
import { getArticleBySlug, getCategoryInfo, ALL_ARTICLES } from '../../content/articles';
import { generateArticleJsonLdSchema } from './schema';

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
  'convert-pdf-pages-to-jpg-images': () => import('./pages/convert-pdf-pages-to-jpg-images'),
};

export const RELATED_ROUTES_MAP: Record<string, Array<{ path: string; label: string }>> = {
  '/client-side-private-image-compressor': [
    { path: '/ai-image-compressor-online-private', label: 'Adaptive Image Compressor' },
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
    { path: '/ai-image-compressor-online-private', label: 'Adaptive Image Compressor' },
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
    { path: '/convert-hdr-heic-to-png-transparency', label: 'HEIC to Transparent PNG' },
  ],
  '/passport-photo-size-reducer-kb': [
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
    { path: '/resize-image-for-job-application-form', label: 'Job Application Resizer' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI' },
    { path: '/compress-image-to-100kb-online', label: 'Compress to 100KB' },
  ],
  '/convert-avif-to-jpg-converter': [
    { path: '/convert-to-avif-online-free', label: 'Convert to AVIF' },
    { path: '/convert-jpg-to-webp-browser', label: 'JPG to WebP Browser' },
    { path: '/convert-tiff-bmp-to-jpg', label: 'TIFF & BMP to JPG' },
    { path: '/convert-heic-to-jpg-locally', label: 'HEIC to JPG Locally' },
  ],
  '/resize-image-for-job-application-form': [
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Reducer' },
    { path: '/secure-signature-compressor-pdf', label: 'Signature Compressor' },
    { path: '/compress-image-to-100kb-online', label: 'Compress to 100KB' },
  ],
  '/secure-signature-compressor-pdf': [
    { path: '/compress-pdf-scanned-document-images', label: 'Scanned Document Quantizer' },
    { path: '/convert-pdf-pages-to-jpg-images', label: 'Convert PDF Pages to JPG' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
    { path: '/resize-image-for-job-application-form', label: 'Job Application Resizer' },
  ],
  '/client-side-image-to-base64': [
    { path: '/palette-color-extractor-image-hex', label: 'Palette Hex Extractor' },
    { path: '/convert-svg-to-png-transparent', label: 'SVG to High-Res PNG' },
    { path: '/convert-ico-to-png-favicon-extractor', label: 'Extract ICO Favicon' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI' },
  ],
  '/convert-svg-to-png-transparent': [
    { path: '/convert-webp-to-png-transparent', label: 'WebP to PNG Transparent' },
    { path: '/convert-ico-to-png-favicon-extractor', label: 'Extract ICO Favicon' },
    { path: '/client-side-image-to-base64', label: 'Image to Base64 Encoder' },
    { path: '/convert-png-to-jpg-white-background', label: 'PNG to JPG (White Fill)' },
  ],
  '/compress-animated-gif-size-online': [
    { path: '/discord-avatar-compressor-pfp-size', label: 'Discord Avatar Compressor' },
    { path: '/compress-screenshot-png-size-fast', label: 'Compress Screenshot PNG' },
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Custom Aspect Ratio' },
    { path: '/client-side-private-image-compressor', label: 'Private Image Compressor' },
  ],
  '/convert-png-to-webp-lossless': [
    { path: '/convert-jpg-to-webp-browser', label: 'JPG to WebP Browser' },
    { path: '/convert-to-avif-online-free', label: 'Convert to AVIF' },
    { path: '/compress-png-lossless-webassembly', label: 'Lossless PNG Compressor' },
    { path: '/convert-webp-to-png-transparent', label: 'WebP to PNG Transparent' },
  ],
  '/crop-image-to-exact-aspect-ratio': [
    { path: '/social-media-banner-resizer-linkedin-twitter', label: 'Social Banner Resizer' },
    { path: '/discord-avatar-compressor-pfp-size', label: 'Discord Avatar Compressor' },
    { path: '/high-res-image-resizer-client-side', label: 'High-Res Image Resizer' },
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Reducer' },
  ],
  '/add-text-watermark-image-browser': [
    { path: '/blur-sensitive-image-privacy-pixelator', label: 'Blur Sensitive Info' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata' },
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Custom Aspect Ratio' },
    { path: '/palette-color-extractor-image-hex', label: 'Palette Hex Extractor' },
  ],
  '/convert-tiff-bmp-to-jpg': [
    { path: '/convert-png-to-jpg-white-background', label: 'PNG to JPG White Fill' },
    { path: '/convert-heic-to-jpg-locally', label: 'Convert HEIC to JPG' },
    { path: '/convert-avif-to-jpg-converter', label: 'AVIF to JPG Converter' },
    { path: '/convert-pdf-pages-to-jpg-images', label: 'PDF Pages to JPG' },
  ],
  '/high-res-image-resizer-client-side': [
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Aspect Ratio' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI' },
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk Catalog Resizer' },
    { path: '/social-media-banner-resizer-linkedin-twitter', label: 'Social Banner Resizer' },
  ],
  '/dpi-ppi-converter-change-image-resolution': [
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Reducer' },
    { path: '/high-res-image-resizer-client-side', label: 'High-Res Image Resizer' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata' },
    { path: '/lossless-jpeg-optimizer-exif-preserve', label: 'Lossless JPEG Optimizer' },
  ],
  '/compress-image-for-email-attachment-limit': [
    { path: '/reduce-image-size-to-1mb-online', label: 'Reduce Size to 1MB' },
    { path: '/compress-image-to-200kb-online', label: 'Compress to 200KB' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Compressor' },
    { path: '/client-side-private-image-compressor', label: 'Private Image Compressor' },
  ],
  '/convert-jpg-to-webp-browser': [
    { path: '/convert-png-to-webp-lossless', label: 'PNG to Lossless WebP' },
    { path: '/convert-to-avif-online-free', label: 'Convert to AVIF' },
    { path: '/convert-webp-to-png-transparent', label: 'WebP to PNG Transparent' },
    { path: '/lossless-jpeg-optimizer-exif-preserve', label: 'Lossless JPEG Optimizer' },
  ],
  '/compress-screenshot-png-size-fast': [
    { path: '/compress-png-lossless-webassembly', label: 'Lossless PNG Compressor' },
    { path: '/convert-png-to-webp-lossless', label: 'PNG to Lossless WebP' },
    { path: '/convert-png-to-jpg-white-background', label: 'PNG to JPG White Fill' },
    { path: '/blur-sensitive-image-privacy-pixelator', label: 'Blur Sensitive Info' },
  ],
  '/convert-ico-to-png-favicon-extractor': [
    { path: '/convert-svg-to-png-transparent', label: 'SVG to High-Res PNG' },
    { path: '/convert-webp-to-png-transparent', label: 'WebP to PNG Transparent' },
    { path: '/client-side-image-to-base64', label: 'Image to Base64 Encoder' },
    { path: '/palette-color-extractor-image-hex', label: 'Palette Hex Extractor' },
  ],
  '/bulk-image-resizer-ecommerce-catalog': [
    { path: '/shopify-image-optimizer-bulk-free', label: 'Shopify Image Optimizer' },
    { path: '/etsy-image-resizer-batch-optimize', label: 'Etsy Image Resizer' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Compressor' },
    { path: '/high-res-image-resizer-client-side', label: 'High-Res Image Resizer' },
  ],
  '/convert-png-to-jpg-white-background': [
    { path: '/convert-png-to-webp-lossless', label: 'PNG to Lossless WebP' },
    { path: '/compress-png-lossless-webassembly', label: 'Lossless PNG Compressor' },
    { path: '/convert-tiff-bmp-to-jpg', label: 'TIFF & BMP to JPG' },
    { path: '/convert-heic-to-jpg-locally', label: 'HEIC to JPG Locally' },
  ],
  '/blur-sensitive-image-privacy-pixelator': [
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata' },
    { path: '/add-text-watermark-image-browser', label: 'Apply Text Watermark' },
    { path: '/client-side-private-image-compressor', label: 'Private Image Compressor' },
    { path: '/secure-signature-compressor-pdf', label: 'Signature Compressor' },
  ],
  '/convert-hdr-heic-to-png-transparency': [
    { path: '/convert-heic-to-jpg-locally', label: 'Convert HEIC to JPG' },
    { path: '/bulk-heic-to-jpg-converter-offline', label: 'Bulk HEIC to JPG' },
    { path: '/convert-webp-to-png-transparent', label: 'WebP to PNG Transparent' },
    { path: '/convert-svg-to-png-transparent', label: 'SVG to High-Res PNG' },
  ],
  '/social-media-banner-resizer-linkedin-twitter': [
    { path: '/discord-avatar-compressor-pfp-size', label: 'Discord Avatar Compressor' },
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Custom Aspect Ratio' },
    { path: '/high-res-image-resizer-client-side', label: 'High-Res Image Resizer' },
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk Catalog Resizer' },
  ],
  '/palette-color-extractor-image-hex': [
    { path: '/client-side-image-to-base64', label: 'Image to Base64 Encoder' },
    { path: '/convert-ico-to-png-favicon-extractor', label: 'Extract ICO Favicon' },
    { path: '/add-text-watermark-image-browser', label: 'Apply Text Watermark' },
    { path: '/blur-sensitive-image-privacy-pixelator', label: 'Blur Sensitive Info' },
  ],
  '/lossless-jpeg-optimizer-exif-preserve': [
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata' },
    { path: '/convert-jpg-to-webp-browser', label: 'JPG to WebP Browser' },
    { path: '/client-side-private-image-compressor', label: 'Private Image Compressor' },
    { path: '/dpi-ppi-converter-change-image-resolution', label: 'Change Image DPI' },
  ],
  '/compress-pdf-scanned-document-images': [
    { path: '/convert-pdf-pages-to-jpg-images', label: 'Convert PDF Pages to JPG' },
    { path: '/secure-signature-compressor-pdf', label: 'Signature Compressor' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
    { path: '/resize-image-for-job-application-form', label: 'Job Application Resizer' },
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
    { path: '/shopify-image-optimizer-bulk-free', label: 'Shopify Image Optimizer' },
  ],
  '/ai-image-compressor-online-private': [
    { path: '/client-side-private-image-compressor', label: 'Private Image Compressor' },
    { path: '/lossless-jpeg-optimizer-exif-preserve', label: 'Lossless JPEG Optimizer' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Compressor' },
    { path: '/compress-png-lossless-webassembly', label: 'Lossless PNG Compressor' },
  ],
  '/compress-image-to-100kb-online': [
    { path: '/compress-image-to-200kb-online', label: 'Compress to 200KB' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
    { path: '/reduce-image-size-to-1mb-online', label: 'Reduce to 1MB' },
    { path: '/passport-photo-size-reducer-kb', label: 'Passport Photo Reducer' },
  ],
  '/compress-image-to-200kb-online': [
    { path: '/compress-image-to-100kb-online', label: 'Compress to 100KB' },
    { path: '/reduce-image-size-to-1mb-online', label: 'Reduce to 1MB' },
    { path: '/compress-image-for-email-attachment-limit', label: 'Compress for Email' },
    { path: '/compress-image-under-50kb-government-portal', label: 'Compress Under 50KB' },
  ],
  '/bulk-heic-to-jpg-converter-offline': [
    { path: '/convert-heic-to-jpg-locally', label: 'Convert HEIC to JPG Locally' },
    { path: '/convert-hdr-heic-to-png-transparency', label: 'iPhone HEIC to PNG' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Compressor' },
    { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Metadata' },
  ],
  '/discord-avatar-compressor-pfp-size': [
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Custom Aspect Ratio' },
    { path: '/compress-animated-gif-size-online', label: 'Compress GIF Size' },
    { path: '/compress-screenshot-png-size-fast', label: 'Compress Screenshot PNG' },
    { path: '/social-media-banner-resizer-linkedin-twitter', label: 'Social Banner Resizer' },
  ],
  '/reduce-image-size-to-1mb-online': [
    { path: '/compress-image-to-200kb-online', label: 'Compress to 200KB' },
    { path: '/compress-image-for-email-attachment-limit', label: 'Compress for Email' },
    { path: '/compress-image-to-100kb-online', label: 'Compress to 100KB' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Compressor' },
  ],
  '/etsy-image-resizer-batch-optimize': [
    { path: '/shopify-image-optimizer-bulk-free', label: 'Shopify Image Optimizer' },
    { path: '/bulk-image-resizer-ecommerce-catalog', label: 'Bulk Catalog Resizer' },
    { path: '/crop-image-to-exact-aspect-ratio', label: 'Crop Custom Aspect Ratio' },
    { path: '/convert-png-to-jpg-white-background', label: 'PNG to JPG White Fill' },
  ],
  '/convert-pdf-pages-to-jpg-images': [
    { path: '/compress-pdf-scanned-document-images', label: 'Scanned Document Image Quantizer' },
    { path: '/secure-signature-compressor-pdf', label: 'Signature Compressor' },
    { path: '/convert-heic-to-jpg-locally', label: 'Convert HEIC to JPG' },
    { path: '/bulk-image-compressor-offline', label: 'Bulk Offline Compressor' },
  ],
};

export async function parseSeoRoute(pathname: string): Promise<SeoRouteData> {
  const rawPath = (pathname || '/').split('?')[0].split('#')[0].toLowerCase().trim();
  const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : (rawPath || '/');
  const fullUrl = `${DOMAIN}${path === '/' ? '' : path}`;
  const slug = path === '/' ? 'home' : path.slice(1);

  // Handle tools directory route
  if (path === '/tools') {
    return {
      path: '/tools',
      h1Title: 'Zapixal Tools Directory — All 42 Image Utilities',
      metaTitle: 'All 42 Free Client-Side Image Tools & Converters | Zapixal',
      metaDescription: 'Complete directory of 42 privacy-first image tools. Convert formats (HEIC, WebP, AVIF, PNG, JPG, SVG, PDF), compress to exact KB targets, and edit images 100% locally.',
      canonicalUrl: `${DOMAIN}/tools`,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Tools Directory', url: '/tools' },
      ],
      jsonLd: {
        softwareApp: null,
        howTo: null,
        faqPage: null,
        breadcrumbs: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN },
            { '@type': 'ListItem', position: 2, name: 'Tools Directory', item: `${DOMAIN}/tools` },
          ],
        },
        organization: { '@context': 'https://schema.org', '@type': 'Organization', name: 'Zapixal', url: DOMAIN, logo: `${DOMAIN}/icon-512.png` },
        website: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Zapixal', url: DOMAIN },
      },
    };
  }

  // Handle article system routes
  if (path === '/articles' || path.startsWith('/articles/')) {
    if (path === '/articles') {
      return {
        path: '/articles',
        h1Title: 'Zapixal Editorial & Technical Guides',
        metaTitle: 'Image Optimization & Codec Guides — Zapixal Editorial',
        metaDescription: 'In-depth architectural guides on image codecs, WebAssembly performance, EXIF metadata privacy risks, and client-side optimization workflows.',
        canonicalUrl: `${DOMAIN}/articles`,
        isIndexable: true,
        pageCategory: 'resource',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Articles', url: '/articles' },
        ],
        jsonLd: {
          softwareApp: null,
          howTo: null,
          faqPage: null,
          breadcrumbs: {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN },
              { '@type': 'ListItem', position: 2, name: 'Articles', item: `${DOMAIN}/articles` },
            ],
          },
          organization: { '@context': 'https://schema.org', '@type': 'Organization', name: 'Zapixal', url: DOMAIN, logo: `${DOMAIN}/icon-512.png` },
          website: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Zapixal', url: DOMAIN },
        },
      };
    }

    const subPath = path.replace(/^\/articles\//, '');
    const categoryInfo = getCategoryInfo(subPath);

    if (categoryInfo) {
      const catUrl = `${DOMAIN}/articles/${categoryInfo.slug}`;
      return {
        path: `/articles/${categoryInfo.slug}`,
        h1Title: categoryInfo.title,
        metaTitle: categoryInfo.metaTitle,
        metaDescription: categoryInfo.metaDescription,
        canonicalUrl: catUrl,
        isIndexable: true,
        pageCategory: 'resource',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Articles', url: '/articles' },
          { name: categoryInfo.shortTitle, url: `/articles/${categoryInfo.slug}` },
        ],
        relatedRoutes: categoryInfo.relatedTools,
        jsonLd: {
          softwareApp: null,
          howTo: null,
          faqPage: null,
          breadcrumbs: {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN },
              { '@type': 'ListItem', position: 2, name: 'Articles', item: `${DOMAIN}/articles` },
              { '@type': 'ListItem', position: 3, name: categoryInfo.shortTitle, item: catUrl },
            ],
          },
          organization: { '@context': 'https://schema.org', '@type': 'Organization', name: 'Zapixal', url: DOMAIN, logo: `${DOMAIN}/icon-512.png` },
          website: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Zapixal', url: DOMAIN },
        },
      };
    }

    const article = getArticleBySlug(subPath);
    if (article) {
      const artCategory = getCategoryInfo(article.category);
      const artUrl = `${DOMAIN}/articles/${article.slug}`;
      const articleBreadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Articles', url: '/articles' },
        { name: artCategory?.shortTitle || article.category, url: `/articles/${article.category}` },
        { name: article.title, url: `/articles/${article.slug}` },
      ];

      const articleJsonLd = generateArticleJsonLdSchema(
        article.title,
        article.metaDescription,
        artUrl,
        article.author,
        article.datePublished,
        article.dateModified,
        artCategory?.title || article.category,
        articleBreadcrumbs
      );

      return {
        path: `/articles/${article.slug}`,
        h1Title: article.title,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        canonicalUrl: artUrl,
        isIndexable: true,
        pageCategory: 'resource',
        breadcrumbs: articleBreadcrumbs,
        relatedRoutes: article.relatedTools,
        jsonLd: articleJsonLd,
      };
    }

    return getNotFoundSeo(fullUrl, path);
  }

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

  if (!seoData.ogImage) {
    const filename = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
    seoData.ogImage = {
      url: `${DOMAIN}/og-images/${filename}.png`,
      width: 1200,
      height: 630,
      alt: seoData.metaTitle,
    };
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

  const ogImageUrl = seoData.ogImage?.url || `${DOMAIN}/icon-512.png`;
  setMeta('property', 'og:title', seoData.metaTitle);
  setMeta('property', 'og:description', seoData.metaDescription);
  setMeta('property', 'og:url', seoData.canonicalUrl);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', 'Zapixal');
  setMeta('property', 'og:image', ogImageUrl);
  setMeta('property', 'og:image:width', '1200');
  setMeta('property', 'og:image:height', '630');
  setMeta('property', 'og:image:alt', seoData.ogImage?.alt || seoData.metaTitle);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', seoData.metaTitle);
  setMeta('name', 'twitter:description', seoData.metaDescription);
  setMeta('name', 'twitter:image', ogImageUrl);

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
    if (seoData.jsonLd.article) {
      injectJsonLd('jsonld-article', seoData.jsonLd.article);
    }
    injectJsonLd('jsonld-software', seoData.jsonLd.softwareApp);
    injectJsonLd('jsonld-howto', seoData.jsonLd.howTo);
    injectJsonLd('jsonld-faq', seoData.jsonLd.faqPage);
    injectJsonLd('jsonld-breadcrumbs', seoData.jsonLd.breadcrumbs);
    injectJsonLd('jsonld-organization', seoData.jsonLd.organization);
    injectJsonLd('jsonld-website', seoData.jsonLd.website);
  }
}

