import { ConversionSettings, TargetFormat } from '../types';

export interface SeoRouteData {
  path: string;
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  isIndexable: boolean;
  pageCategory: 'converter' | 'compression' | 'use-case' | 'home';
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
  jsonLd: {
    softwareApp: object;
    howTo: object;
    faqPage: object;
    breadcrumbs: object;
    organization: object;
  };
}

const DOMAIN = typeof window !== 'undefined' ? window.location.origin : 'https://zapixal.com';

// List of topically related pSEO landing page routes for Link Hubs and Sitemap
export const PSEO_ROUTES_LIST = [
  { path: '/heic-to-jpg', label: 'HEIC to JPG Converter', category: 'converter' },
  { path: '/convert-png-to-webp', label: 'PNG to WEBP Converter', category: 'converter' },
  { path: '/convert-webp-to-jpg', label: 'WEBP to JPG Converter', category: 'converter' },
  { path: '/convert-png-to-avif', label: 'PNG to AVIF Converter', category: 'converter' },
  { path: '/convert-jpg-to-ico', label: 'JPG to ICO Favicon', category: 'converter' },
  { path: '/convert-heic-to-png', label: 'HEIC to PNG Converter', category: 'converter' },
  { path: '/compress-jpeg-under-200kb', label: 'Compress JPEG Under 200KB', category: 'compression' },
  { path: '/compress-jpeg-under-100kb', label: 'Compress JPEG Under 100KB', category: 'compression' },
  { path: '/compress-png-under-500kb', label: 'Compress PNG Under 500KB', category: 'compression' },
  { path: '/compress-image-under-50kb', label: 'Compress Image Under 50KB', category: 'compression' },
  { path: '/compress-jpeg-under-500kb', label: 'Compress JPEG Under 500KB', category: 'compression' },
  { path: '/passport-photo-compressor', label: 'Passport Photo Compressor', category: 'use-case' },
  { path: '/exif-metadata-remover', label: 'EXIF Metadata Remover', category: 'use-case' },
  { path: '/discord-emoji-compressor', label: 'Discord Emoji Compressor', category: 'use-case' },
  { path: '/shopify-product-image-optimizer', label: 'Shopify Image Optimizer', category: 'use-case' },
  { path: '/real-estate-photo-compressor', label: 'Real Estate Photo Compressor', category: 'use-case' },
];

export function parseSeoRoute(pathname: string): SeoRouteData {
  const path = pathname.toLowerCase().trim() || '/';
  const fullUrl = `${DOMAIN}${path === '/' ? '' : path}`;

  // Default Homepage state
  if (path === '/' || path === '') {
    return createHomePageSeo(fullUrl);
  }

  // 1. Check for compression route pattern: /compress-[format]-under-[size]kb
  const compressMatch = path.match(/^\/compress-([a-z0-9]+)-under-(\d+)(kb|mb)$/);
  if (compressMatch) {
    const rawFormat = compressMatch[1];
    const sizeNum = parseInt(compressMatch[2], 10);
    const unit = compressMatch[3];
    const sizeKB = unit === 'mb' ? sizeNum * 1024 : sizeNum;

    // Quality Control & Spam Prevention rule:
    // If target size is under 10KB or unreasonable, mark as noindex to prevent low-quality index inflation
    const isIndexable = sizeKB >= 10;

    const formatName = rawFormat.toUpperCase();
    const toFormat: TargetFormat = (['jpg', 'png', 'webp', 'avif', 'ico', 'pdf'].includes(rawFormat)
      ? rawFormat
      : 'jpg') as TargetFormat;

    const titleFormat = `${sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)}MB` : `${sizeKB}KB`}`;

    return {
      path,
      h1Title: `Compress ${formatName} Under ${titleFormat} Online Free`,
      metaTitle: `Compress ${formatName} Under ${titleFormat} Free | 100% Private | Zapixal`,
      metaDescription: `Compress ${formatName} images under ${titleFormat} instantly in your browser. 100% private client-side processing, zero server uploads, no file limits.`,
      canonicalUrl: fullUrl,
      isIndexable,
      pageCategory: 'compression',
      fromFormat: rawFormat,
      toFormat,
      targetMaxKB: sizeKB,
      stripExif: true,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Compression Tools', url: '/compress-jpeg-under-200kb' },
        { name: `Under ${titleFormat}`, url: path },
      ],
      guideContent: {
        badge: 'Updated for 2026 • Verified Client-Side Engine',
        section1Title: `Why compress ${formatName} images under ${titleFormat}?`,
        section1Body: `Many web forms, application portals, and email attachments enforce strict maximum file size thresholds like ${titleFormat}. Our browser-based optimization engine re-encodes pixel matrices with mathematical precision to fit directly beneath your target file size without visible degradation.`,
        section2Title: '100% Browser-Local Processing Guarantee',
        section2Body: 'Unlike traditional cloud converters that upload your confidential photos to remote third-party servers, Zapixal processes every single byte directly inside your browser memory using WebAssembly and Web Workers. Your images never leave your device.',
        steps: [
          `Drag & drop your ${formatName} files into the zone above or press Ctrl+V to paste from your clipboard.`,
          `Zapixal automatically pre-configures a target max threshold of ${titleFormat} and strips tracking EXIF metadata.`,
          `Click 'Download All' to instantly save your lightweight, privacy-cleared images.`
        ],
        faqs: [
          {
            question: `Is compressing ${formatName} under ${titleFormat} safe for my privacy?`,
            answer: 'Yes, 100%. Zapixal runs entirely inside your browser memory. You can even disconnect your internet or turn off Wi-Fi and the compression will still execute instantly.'
          },
          {
            question: `How does Zapixal reach ${titleFormat} without ruining image quality?`,
            answer: 'Our algorithm uses iterative quantization and adaptive canvas sampling in Web Workers to reduce file size while maintaining optical clarity.'
          },
          {
            question: 'Are there any hidden costs, account signups, or daily file limits?',
            answer: 'No. Zapixal is completely free, unlimited, and requires no registration or subscription.'
          }
        ]
      },
      jsonLd: generateJsonLdSchemas(
        `Compress ${formatName} Under ${titleFormat}`,
        `Compress ${formatName} under ${titleFormat} free and privately in browser.`,
        fullUrl,
        [
          { question: `Is compressing ${formatName} under ${titleFormat} safe for my privacy?`, answer: 'Yes, 100%. Zapixal runs entirely in browser memory.' },
          { question: 'Is Zapixal free?', answer: 'Yes, 100% free with unlimited batch processing.' }
        ],
        [
          { name: 'Home', url: `${DOMAIN}/` },
          { name: `Compress ${formatName} Under ${titleFormat}`, url: fullUrl }
        ]
      )
    };
  }

  // 2. Check for convert route pattern: /convert-[from]-to-[to] or /heic-to-jpg
  const convertMatch = path.match(/^\/(?:convert-)?([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (convertMatch) {
    const fromFmt = convertMatch[1].toUpperCase();
    const toFmtRaw = convertMatch[2].toLowerCase();
    const toFmtUpper = toFmtRaw.toUpperCase();

    const toFormat: TargetFormat = (['jpg', 'png', 'webp', 'avif', 'ico', 'pdf'].includes(toFmtRaw)
      ? toFmtRaw
      : 'jpg') as TargetFormat;

    return {
      path,
      h1Title: `Convert ${fromFmt} to ${toFmtUpper} Online Free`,
      metaTitle: `Convert ${fromFmt} to ${toFmtUpper} Free | 100% Private | Zapixal`,
      metaDescription: `Convert ${fromFmt} to ${toFmtUpper} instantly in your browser. Fast, 100% private local processing, zero server uploads, unlimited batch conversion.`,
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: fromFmt.toLowerCase(),
      toFormat,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Image Converters', url: '/heic-to-jpg' },
        { name: `${fromFmt} to ${toFmtUpper}`, url: path },
      ],
      guideContent: {
        badge: 'Updated for 2026 • Verified Client-Side Engine',
        section1Title: `Why convert ${fromFmt} files to ${toFmtUpper}?`,
        section1Body: `Converting ${fromFmt} images into modern, universal formats like ${toFmtUpper} dramatically enhances web compatibility, speeds up page load times, and ensures seamless display across mobile apps, email clients, and web platforms.`,
        section2Title: '100% Offline & Private Local Engine',
        section2Body: `Your privacy is our priority. Zapixal relies on modern WebAssembly and HTML5 Canvas technology running inside your browser thread. No files are ever sent across the web to cloud servers.`,
        steps: [
          `Upload or drag your ${fromFmt} photos directly into the browser drop zone.`,
          `Target format is automatically set to ${toFmtUpper} with optional quality tuning and EXIF removal.`,
          `Download converted ${toFmtUpper} images individually or as a compressed batch ZIP file.`
        ],
        faqs: [
          {
            question: `How fast is ${fromFmt} to ${toFmtUpper} conversion?`,
            answer: 'Because processing happens on your local device CPU/GPU with WebAssembly, conversion takes milliseconds per image without queue wait times.'
          },
          {
            question: 'Can I convert multiple photos in batch?',
            answer: 'Yes! You can convert hundreds of images simultaneously with full multi-core Web Worker support.'
          },
          {
            question: 'Does converting remove my photo location data?',
            answer: 'You can check the "Strip EXIF Data" setting to automatically wipe GPS coordinates and camera model metadata.'
          }
        ]
      },
      jsonLd: generateJsonLdSchemas(
        `Convert ${fromFmt} to ${toFmtUpper}`,
        `Fast private ${fromFmt} to ${toFmtUpper} converter running 100% in browser.`,
        fullUrl,
        [
          { question: `Is ${fromFmt} to ${toFmtUpper} conversion private?`, answer: 'Yes, Zapixal processes 100% of images locally in your browser.' },
          { question: 'Is there a file limit?', answer: 'No limits. Zapixal supports unlimited batch processing.' }
        ],
        [
          { name: 'Home', url: `${DOMAIN}/` },
          { name: `Convert ${fromFmt} to ${toFmtUpper}`, url: fullUrl }
        ]
      )
    };
  }

  // 3. Special Use-Case Landing Pages
  if (path.includes('passport-photo')) {
    return createUseCaseSeo(
      path,
      fullUrl,
      'Passport Photo Compressor & Resizer',
      'Passport Photo Compressor & Resizer | 100% Private | Zapixal',
      'Compress and resize official passport photos to exact size limits (under 600KB) privately in your browser.',
      { targetMaxKB: 600, presetResize: { maxWidth: 600, maxHeight: 600 }, stripExif: true, toFormat: 'jpg' }
    );
  }

  if (path.includes('exif-metadata') || path.includes('privacy')) {
    return createUseCaseSeo(
      path,
      fullUrl,
      'EXIF Metadata & GPS Location Remover',
      'EXIF Metadata Remover | Wipe Photo GPS Location Privately',
      'Remove sensitive GPS locations, camera serials, and timestamps from your photos before sharing online.',
      { stripExif: true }
    );
  }

  if (path.includes('discord-emoji')) {
    return createUseCaseSeo(
      path,
      fullUrl,
      'Discord Emoji & Sticker Image Compressor',
      'Discord Emoji & Sticker Compressor | Under 256KB PNG/WEBP',
      'Compress images under 256KB to meet Discord emoji and sticker upload limits perfectly.',
      { targetMaxKB: 256, presetResize: { maxWidth: 128, maxHeight: 128 }, toFormat: 'png' }
    );
  }

  if (path.includes('shopify') || path.includes('ecommerce')) {
    return createUseCaseSeo(
      path,
      fullUrl,
      'Shopify Product Image Optimizer',
      'Shopify Product Image Optimizer | Speed Up Store Load',
      'Convert product photos to web-optimized WEBP/AVIF format for lightning-fast e-commerce stores.',
      { toFormat: 'webp', targetMaxKB: 300, stripExif: true }
    );
  }

  if (path.includes('real-estate')) {
    return createUseCaseSeo(
      path,
      fullUrl,
      'Real Estate Photo Compressor',
      'Real Estate Photo Compressor | MLS Ready Image Tool',
      'Batch compress high-resolution real estate photography for MLS listing portals and fast websites.',
      { toFormat: 'jpg', targetMaxKB: 800, stripExif: true }
    );
  }

  // Fallback for custom path
  return createHomePageSeo(fullUrl);
}

function createHomePageSeo(fullUrl: string): SeoRouteData {
  return {
    path: '/',
    h1Title: '100% Private Client-Side Image Converter & Compressor',
    metaTitle: 'Zapixal | Free Private Image Converter & Compressor',
    metaDescription: 'Convert HEIC, PNG, JPG, WEBP, AVIF, and PDF 100% offline in browser memory. Zero server uploads, zero wait times, unlimited batch speed.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'home',
    breadcrumbs: [{ name: 'Home', url: '/' }],
    guideContent: {
      badge: 'Updated for 2026 • Verified Client-Side Engine',
      section1Title: 'Why Choose 100% Client-Side Local Conversion?',
      section1Body: 'Most online file converters upload your sensitive personal and business images to remote cloud servers. Zapixal eliminates all security risks by executing conversion algorithms directly inside your browser using WebAssembly and Web Workers.',
      section2Title: 'Ultra-Fast Performance with Zero Queue Delay',
      section2Body: 'Because processing runs on your local CPU multi-cores, batch image conversion happens instantly. You can convert hundreds of images, strip EXIF GPS tracking data, and generate WebP/AVIF formats in seconds.',
      steps: [
        'Drop files or paste from clipboard (Ctrl+V).',
        'Choose output format, quality compression, and size targets.',
        'Download individual converted files or a combined batch ZIP archive.'
      ],
      faqs: [
        {
          question: 'Are my images ever uploaded to a server?',
          answer: 'Never. Zapixal works 100% offline in your browser memory. You can turn off Wi-Fi and test it yourself.'
        },
        {
          question: 'What image formats are supported?',
          answer: 'Zapixal supports HEIC, PNG, JPG, WEBP, AVIF, ICO, SVG, and combined PDF document export.'
        },
        {
          question: 'Is Zapixal free to use for commercial projects?',
          answer: 'Yes, Zapixal is 100% free with no account creation, no subscriptions, and no hidden limitations.'
        }
      ]
    },
    jsonLd: generateJsonLdSchemas(
      'Zapixal Image Converter',
      '100% private, browser-based local image converter and compressor.',
      fullUrl,
      [
        { question: 'Is Zapixal private?', answer: 'Yes, 100% client-side in browser memory.' },
        { question: 'Does Zapixal work offline?', answer: 'Yes, full offline support.' }
      ],
      [{ name: 'Home', url: `${DOMAIN}/` }]
    )
  };
}

function createUseCaseSeo(
  path: string,
  fullUrl: string,
  h1Title: string,
  metaTitle: string,
  metaDescription: string,
  autoFill: { targetMaxKB?: number; presetResize?: { maxWidth: number; maxHeight: number }; stripExif?: boolean; toFormat?: TargetFormat }
): SeoRouteData {
  return {
    path,
    h1Title,
    metaTitle,
    metaDescription,
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    toFormat: autoFill.toFormat,
    targetMaxKB: autoFill.targetMaxKB,
    stripExif: autoFill.stripExif,
    presetResize: autoFill.presetResize,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/passport-photo-compressor' },
      { name: h1Title, url: path }
    ],
    guideContent: {
      badge: 'Updated for 2026 • Verified Client-Side Engine',
      section1Title: `Specialized Tool: ${h1Title}`,
      section1Body: `Designed specifically to solve strict upload constraints and privacy requirements. Auto-configured to optimize dimensions, metadata, and byte weights instantly.`,
      section2Title: 'Browser-Native Privacy Integrity',
      section2Body: 'Executed entirely in client browser memory with zero network transmission. Guaranteed data isolation.',
      steps: [
        'Upload your source photo or paste from clipboard.',
        'Apply auto-filled optimizations or fine-tune slider controls.',
        'Download your publication-ready file.'
      ],
      faqs: [
        {
          question: `Is this ${h1Title} tool free?`,
          answer: 'Yes, completely free with zero signups or watermarks.'
        },
        {
          question: 'Does it work offline?',
          answer: 'Yes! Zapixal operates 100% client-side.'
        }
      ]
    },
    jsonLd: generateJsonLdSchemas(
      h1Title,
      metaDescription,
      fullUrl,
      [{ question: `Is ${h1Title} free?`, answer: 'Yes, 100% free and client-side.' }],
      [{ name: 'Home', url: `${DOMAIN}/` }, { name: h1Title, url: fullUrl }]
    )
  };
}

function generateJsonLdSchemas(
  name: string,
  description: string,
  url: string,
  faqs: { question: string; answer: string }[],
  breadcrumbs: { name: string; url: string }[]
) {
  return {
    softwareApp: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': `Zapixal - ${name}`,
      'operatingSystem': 'Any (Web Browser)',
      'applicationCategory': 'MultimediaApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'description': description,
      'url': url
    },
    howTo: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': `How to use ${name}`,
      'step': [
        {
          '@type': 'HowToStep',
          'name': 'Upload or Paste Image',
          'text': 'Drag and drop your images into the drop zone or paste directly using Ctrl+V.'
        },
        {
          '@type': 'HowToStep',
          'name': 'Adjust Settings',
          'text': 'Select desired format, target KB size, and toggle privacy options.'
        },
        {
          '@type': 'HowToStep',
          'name': 'Download Files',
          'text': 'Download converted images instantly to your local device.'
        }
      ]
    },
    faqPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(f => ({
        '@type': 'Question',
        'name': f.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': f.answer
        }
      }))
    },
    breadcrumbs: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': b.name,
        'item': b.url
      }))
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Zapixal Core Engine',
      'url': DOMAIN,
      'logo': `${DOMAIN}/logo.png`,
      'sameAs': ['https://twitter.com/zapixal']
    }
  };
}

/**
 * Apply SEO tags dynamically to document <head> without external heavy dependencies
 */
export function applySeoToHead(seoData: SeoRouteData) {
  if (typeof document === 'undefined') return;

  // Title
  document.title = seoData.metaTitle;

  // Helper to get or create meta tag
  const setMeta = (nameAttr: string, attrVal: string, contentVal: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentVal);
  };

  // Description
  setMeta('name', 'description', seoData.metaDescription);

  // Robots Tag (Spam Prevention & Quality Control)
  const robotsVal = seoData.isIndexable ? 'index, follow' : 'noindex, follow';
  setMeta('name', 'robots', robotsVal);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', seoData.canonicalUrl);

  // Open Graph
  setMeta('property', 'og:title', seoData.metaTitle);
  setMeta('property', 'og:description', seoData.metaDescription);
  setMeta('property', 'og:url', seoData.canonicalUrl);
  setMeta('property', 'og:type', 'website');

  // Twitter Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', seoData.metaTitle);
  setMeta('name', 'twitter:description', seoData.metaDescription);

  // Ingest JSON-LD Schemas
  const injectJsonLd = (id: string, schemaObj: object) => {
    let scriptEl = document.getElementById(id);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = id;
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schemaObj);
  };

  injectJsonLd('jsonld-software', seoData.jsonLd.softwareApp);
  injectJsonLd('jsonld-howto', seoData.jsonLd.howTo);
  injectJsonLd('jsonld-faq', seoData.jsonLd.faqPage);
  injectJsonLd('jsonld-breadcrumbs', seoData.jsonLd.breadcrumbs);
  injectJsonLd('jsonld-organization', seoData.jsonLd.organization);
}
