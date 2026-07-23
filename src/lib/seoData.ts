import { SeoRouteInfo } from '../types';

export const SEO_ROUTES: Record<string, SeoRouteInfo> = {
  '/': {
    path: '/',
    title: 'Zapixal - Free Online Batch Image Converter & Compressor (100% Private)',
    metaDescription: 'Batch convert and compress JPG, PNG, WEBP, AVIF, HEIC, SVG, BMP to WEBP, AVIF, JPG, PNG, ICO, PDF locally in browser. Free, unlimited batches, 100% private, zero server uploads.',
    h1: 'Batch Image Converter & Ultra-Compressor',
    subtitle: 'Lightning-fast client-side batch converter. Convert HEIC, PNG, JPG, WEBP, AVIF instantly with 100% browser privacy, zero server latency, and unlimited batches.',
    badge: '100% Browser Native & Private',
    faqs: [
      {
        question: 'How does Zapixal convert and compress images without server uploads?',
        answer: 'Zapixal processes your images entirely inside your browser using modern WebAssembly, HTML5 Canvas API, and JavaScript decoders. Your files never touch an external server, offering 100% data privacy, immediate results, and complete confidentiality.'
      },
      {
        question: 'Which image formats are supported for input and output?',
        answer: 'Zapixal supports JPG, PNG, WEBP, AVIF, HEIC/HEIF (iPhone photos), SVG, BMP, and GIF for input files. You can convert them in bulk to WEBP, AVIF, JPG, PNG, BMP, ICO (favicon), and multi-page PDF documents.'
      },
      {
        question: 'What is the benefit of WEBP and AVIF next-gen formats?',
        answer: 'WEBP and AVIF deliver superior compression algorithms compared to legacy JPG and PNG formats. They typically reduce file sizes by 30% to 70% while maintaining crisp visual quality and preserving transparency support.'
      },
      {
        question: 'Is there any file size or batch conversion limit?',
        answer: 'You can process an unlimited number of images entirely for free! Since processing happens locally in your browser, you may want to avoid adding thousands of massive files at the exact same time to prevent your browser from running out of memory. Aside from your hardware constraints, there are absolutely no artificial batch limits or paywalls.'
      }
    ]
  },
  '/heic-to-jpg': {
    path: '/heic-to-jpg',
    targetFormat: 'jpg',
    title: 'HEIC to JPG Converter Online - Free iPhone Photo Batch Conversion',
    metaDescription: 'Convert HEIC and HEIF photos from Apple iPhone directly to JPG or PNG in high resolution. 100% free, private browser-based batch conversion.',
    h1: 'Convert iPhone HEIC Photos to Standard JPG',
    subtitle: 'Instantly transform HEIC/HEIF photos from iOS devices into universally compatible JPGs or PNGs without losing image metadata or quality.',
    badge: 'iPhone & Apple Media Ready',
    faqs: [
      {
        question: 'Why are Apple iPhone photos saved as HEIC files?',
        answer: 'Apple uses High Efficiency Image Container (HEIC) to save space on iOS devices. However, many Windows PCs, web applications, and older software cannot display HEIC files natively.'
      },
      {
        question: 'How do I batch convert HEIC photos to JPG for free?',
        answer: 'Simply drag and drop your .HEIC or .HEIF files into Zapixal. Select JPG or PNG as the target format, adjust quality if desired, and click Convert All. Download individually or as a ZIP archive.'
      },
      {
        question: 'Will converting HEIC to JPG decrease image quality?',
        answer: 'Zapixal defaults to 85% high-grade quality compression, ensuring visually indistinguishable photos while making them compatible with every device and platform.'
      }
    ]
  },
  '/convert-to-avif': {
    path: '/convert-to-avif',
    targetFormat: 'avif',
    title: 'AVIF Image Converter - Next-Gen High Compression Tool',
    metaDescription: 'Convert JPG, PNG, WEBP images to AVIF format. Achieve maximum web performance with up to 80% smaller file sizes using AVIF image compression.',
    h1: 'Next-Gen AVIF Image Compression & Converter',
    subtitle: 'Unlock maximum Core Web Vitals performance with AVIF image encoding. Superior fidelity at ultra-low file sizes.',
    badge: 'Next-Gen Compression (AV1)',
    faqs: [
      {
        question: 'What is AVIF and why should I convert my website images to AVIF?',
        answer: 'AVIF (AV1 Image File Format) is an advanced open-source image format offering up to 50% smaller sizes than WEBP and up to 80% smaller than JPG, dramatically boosting website load speeds and Google Core Web Vitals rankings.'
      },
      {
        question: 'Are AVIF images supported in modern web browsers?',
        answer: 'Yes! Google Chrome, Safari, Firefox, Edge, and Android all natively support AVIF images out of the box.'
      }
    ]
  },
  '/compress-png': {
    path: '/compress-png',
    targetFormat: 'png',
    title: 'Compress PNG Online - Lossless & Transparent PNG Optimizer',
    metaDescription: 'Shrink PNG image file sizes without sacrificing alpha channel transparency or sharp graphic details. Free batch PNG compression tool.',
    h1: 'Lossless PNG Image Compression & Optimization',
    subtitle: 'Optimize transparent PNG logos, UI mockups, and illustrations with precision control over image dimensions and alpha channel preservation.',
    badge: 'Transparency Preserved',
    faqs: [
      {
        question: 'Can I compress PNG images without losing transparent backgrounds?',
        answer: 'Yes! Zapixal retains 8-bit and 32-bit alpha transparency while stripping unnecessary color profiles and optimizing palette depth.'
      },
      {
        question: 'When should I use PNG over WEBP or JPG?',
        answer: 'Use PNG when working with transparent backgrounds, crisp vector graphics, text overlay graphics, or when strict lossless reproduction is mandatory.'
      }
    ]
  },
  '/image-to-pdf': {
    path: '/image-to-pdf',
    targetFormat: 'pdf',
    title: 'Batch Image to PDF Converter - Convert JPG, PNG to PDF Document',
    metaDescription: 'Combine multiple images into a single clean PDF document online. Free, secure client-side image to PDF converter with custom page fitting.',
    h1: 'Combine Images into Single or Multi-Page PDF',
    subtitle: 'Convert receipts, documents, photo collections, or scans into clean PDF files in seconds without registration or watermark.',
    badge: 'Multi-Page PDF Export',
    faqs: [
      {
        question: 'Can I combine multiple JPG or PNG images into one single PDF file?',
        answer: 'Yes! When selecting PDF as your output format, Zapixal allows you to combine all queue images into a unified multi-page PDF document or export individual PDF pages.'
      },
      {
        question: 'Are my document scans safe from privacy leaks?',
        answer: 'Absolutely. Zapixal processes every document page locally inside your browser memory. No scans or PDFs are ever transmitted or saved to external servers.'
      }
    ]
  },
  '/webp-converter': {
    path: '/webp-converter',
    targetFormat: 'webp',
    title: 'WEBP Converter & Compressor - Optimize Images for Web Speed',
    metaDescription: 'Batch convert JPG, PNG, and HEIC files to lightweight WEBP format. Speed up website load times with Google-recommended WEBP encoding.',
    h1: 'High-Efficiency WEBP Image Converter',
    subtitle: 'The standard web performance format. Drastically shrink image payload while retaining vivid colors and transparent alpha graphics.',
    badge: 'Google Core Web Vitals Ready',
    faqs: [
      {
        question: 'Why does Google recommend WEBP for website optimization?',
        answer: 'WEBP was built specifically for the web by Google, providing lossy and lossless compression that reduces bandwidth consumption by 30%+ compared to standard JPGs.'
      }
    ]
  },
  '/ico-converter': {
    path: '/ico-converter',
    targetFormat: 'ico',
    title: 'Image to ICO Favicon Generator - Free Icon Converter',
    metaDescription: 'Convert PNG, JPG, or SVG images into standard .ICO multi-resolution website favicons. Fast, client-side favicon creation.',
    h1: 'Favicon & .ICO Icon Converter',
    subtitle: 'Generate clean, multi-resolution .ICO files for website favicons, app shortcuts, and desktop icons from any input image.',
    badge: 'Multi-Size Favicon Ready',
    faqs: [
      {
        question: 'What dimensions work best when converting an image to .ICO?',
        answer: 'Square images (e.g. 512x512 PNGs or SVGs) work best. Zapixal automatically rescales your input graphic to standard favicon dimensions like 32x32, 48x48, and 64x64.'
      }
    ]
  },
  '/compress-jpeg': {
    path: '/compress-jpeg',
    targetFormat: 'jpg',
    title: 'Compress JPEG & JPG Online - Free Photo Compressor',
    metaDescription: 'Compress JPG and JPEG images without losing quality. Fast, free client-side photo compressor for reducing image file size in your browser.',
    h1: 'Compress JPEG & Photo Compressor',
    subtitle: 'Instantly reduce the file size of your JPG photos for faster web loading and easier sharing, all while maintaining high visual quality.',
    badge: 'Lossy Photo Compression',
    faqs: [
      {
        question: 'How do I compress a JPEG image without losing quality?',
        answer: 'Zapixal allows you to adjust the quality slider to find the perfect balance between file size and visual fidelity. A quality setting of 80-85% usually reduces file size significantly with no visible difference.'
      },
      {
        question: 'Is this photo compressor safe for personal images?',
        answer: 'Yes! All compression happens locally in your web browser. Your photos are never uploaded to any external server, ensuring 100% privacy.'
      }
    ]
  },
  '/image-format-changer': {
    path: '/image-format-changer',
    targetFormat: 'jpg',
    title: 'Free Image Format Changer & Bulk Converter',
    metaDescription: 'Batch change image formats to JPG, PNG, WEBP, AVIF, and more. 100% free, secure browser-based image format changer and converter.',
    h1: 'Universal Image Format Changer',
    subtitle: 'Drag and drop your pictures to instantly change their file format. Convert multiple photos at once with our bulk processing engine.',
    badge: 'Universal Format Converter',
    faqs: [
      {
        question: 'Which image formats can I change?',
        answer: 'You can change HEIC, PNG, WEBP, JPG, GIF, AVIF, and BMP files into any standard web format like JPG, PNG, WEBP, AVIF, or PDF.'
      },
      {
        question: 'Can I change the format of multiple images at once?',
        answer: 'Yes, Zapixal acts as a bulk image format changer. You can drop hundreds of images into the tool and change all of their formats simultaneously in your browser.'
      }
    ]
  },
};

export function getSeoInfoForRoute(routeHash: string): SeoRouteInfo {
  const normalized = routeHash || '/';
  if (SEO_ROUTES[normalized]) {
    return SEO_ROUTES[normalized];
  }
  return SEO_ROUTES['/'];
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Zapixal',
    'url': 'https://zapixal.pages.dev',
    'description': 'A 100% browser-native, client-side batch image converter and ultra-compressor. Convert HEIC to JPG, WEBP, AVIF, and Image to PDF privately without server uploads.',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'featureList': [
      'Batch Image Converter',
      'Client-Side Processing',
      'Zero Server Uploads',
      'HEIC to JPG',
      'Image to PDF',
      'Image Format Changer'
    ]
  };
}
