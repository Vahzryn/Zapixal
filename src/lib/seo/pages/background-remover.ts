import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getBackgroundRemoverContent(): RouteEditorialContent {
  return {
    badge: 'In-Browser AI Segmentation',
    section1Title: 'Client-side AI subject segmentation with zero server uploads',
    section1Body: 'Zapixal isolates foreground subjects and removes image backgrounds entirely inside your web browser. Utilizing modern neural segmentation models accelerated by WebGPU and WebAssembly SIMD, your images never leave your machine. This eliminates privacy risks when editing personal photos, product shots, signatures, or confidential enterprise graphics.',
    section2Title: 'Instant cutouts, custom backgrounds, and built-in compression',
    section2Body: 'Once the background is removed, export transparent PNG or WebP files, composite custom solid-color or blurred backgrounds, and pipe the resulting cutout directly into Zapixal\u2019s client-side compression pipeline to hit exact file-size targets \u2014 no cloud round-trips required.',
    steps: [
      'Click \u201cUpload Image\u201d or drag and drop a PNG, JPG, WebP, AVIF, or HEIC file.',
      'Click \u201cRemove Background\u201d \u2014 the on-device AI model segments the subject automatically.',
      'Choose Transparent, White, or a custom background color for your cutout.',
      'Download your optimized PNG or WebP file directly to your device.',
    ],
    faqs: [
      makeFaq(
        'Are my photos uploaded to any external server?',
        'No. Background removal runs 100% on your device using client-side WebGPU and WebAssembly. Your photos remain in browser memory and are never uploaded to any remote server or cloud service.'
      ),
      makeFaq(
        'Does this work on mobile phones like Android or iPhone?',
        'Yes. Zapixal detects your device and selects an optimal inference path \u2014 WebGPU on capable phones, or single-threaded WASM on constrained devices like the Galaxy A35. Processing may take 15\u201330 seconds more on older phones.'
      ),
      makeFaq(
        'What AI model powers the background removal?',
        'Zapixal uses RMBG-1.4 by BRIA AI, a state-of-the-art segmentation model optimized for fine hair detail, product boundaries, and portrait cutouts. The model weights (~40 MB) are downloaded once and cached in your browser.'
      ),
      makeFaq(
        'Can I download transparent PNG or WebP cutouts?',
        'Yes. Export cutouts with full alpha transparency as PNG or WebP, or replace the background with custom solid colors or blur effects before downloading.'
      ),
      makeFaq(
        'Why does first-run take longer?',
        'The AI model weights (~40 MB) are downloaded from a CDN on first use and then cached by your browser. Subsequent runs are instant with zero additional downloads.'
      ),
    ],
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/background-remover';
  const guideContent = getBackgroundRemoverContent();
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Image Tools', url: '/tools/images' },
    { name: 'Background Remover', url: path },
  ];

  return {
    path,
    h1Title: 'Free AI Background Remover \u2014 Private & In-Browser',
    metaTitle: 'AI Background Remover Free \u2014 100% Private | Zapixal',
    metaDescription:
      'Remove image backgrounds instantly in your browser. Client-side AI with WebGPU & WASM \u2014 zero uploads, works on mobile.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    breadcrumbs,
    guideContent,
    relatedRoutes: [
      { path: '/client-side-private-image-compressor', label: 'Image Compressor' },
      { path: '/compress-png-images-online', label: 'PNG Compressor' },
      { path: '/convert-heic-to-jpg-locally', label: 'HEIC to JPG' },
      { path: '/strip-exif-metadata-online-private', label: 'Strip EXIF Data' },
    ],
    relatedArticles: [
      { path: '/articles/browser-wasm-privacy-architecture', label: 'How Browser WASM Privacy Works' },
    ],
    jsonLd: generateJsonLdSchemas(
      'AI Background Remover',
      'Remove image backgrounds locally in your browser using WebGPU and WASM neural segmentation. Completely private \u2014 zero cloud uploads, works on Android and iPhone.',
      fullUrl,
      guideContent.faqs,
      breadcrumbs,
      'use-case',
      guideContent.steps
    ),
  };
}
