import { TargetFormat } from '../../types';
import { PSEO_ROUTES_LIST, DOMAIN } from './routes';
import { generateJsonLdSchemas } from './schema';
import { 
  getFallbackEditorialContent, 
  getHomeEditorialContent, 
  getClientSidePrivateCompressorContent,
  getCompressUnder50kbContent,
  getConvertHeicToJpgContent,
  getStripExifContent,
  getBulkCompressOfflineContent,
  getCompressPngLosslessContent,
  getConvertWebpToPngContent,
  getPassportPhotoSizeReducerContent,
  getConvertAvifToJpgContent,
  getResizeJobApplicationContent,
  getSecureSignatureCompressorContent,
  getClientSideBase64Content,
  getConvertSvgToPngContent,
  getCompressAnimatedGifContent,
  getConvertPngToWebpContent,
  getCropAspectRatioContent,
  getGrayscaleConverterContent,
  getRotateFlipLocalContent,
  getAddTextWatermarkContent,
  getConvertTiffBmpContent,
  getHighResResizerContent,
  getDpiPpiConverterContent,
  getRemoveExifGeotagContent,
  getCompressImageEmailContent,
  getConvertJpgToWebpContent,
  getSquarePhotoMakerContent,
  getCompressScreenshotContent,
  getConvertIcoToPngContent,
  getBulkEcommerceResizerContent,
  getConvertPngToWhiteJpgContent,
  getPrivacyMetadataScrubberContent,
  getBlurSensitiveInfoContent,
  getConvertHeicToPngContent,
  getSocialBannerResizerContent,
  getPaletteHexExtractorContent,
  getLosslessJpegOptimizerContent,
  getConvertWebpToPngTransparentContent,
  getSplitGridInstagramContent,
  getConvertEpsPsdContent,
  getCompressScannedDocContent,
  getBatchPipelineContent,
  getConvertAvifToJpgFastContent,
  getAdjustBrightnessGammaContent,
  getPassportPhotoResizerContent,
  getAddRoundedCornersContent,
  getConvertAnimatedWebpToGifContent
} from './content';

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

  // Dynamic pSEO Routes
  if (path === '/client-side-private-image-compressor') {
    const guideContent = getClientSidePrivateCompressorContent();
    return {
      path,
      h1Title: 'The Architecture of Trust: 100% Client-Side Image Compression',
      metaTitle: 'Private Client-Side Image Compressor | 100% Offline | Zapixal',
      metaDescription: 'Compress images privately in your browser without server uploads. Use WASM-powered local processing to optimize files while keeping your data 100% secure.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Private Compressor', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'The Architecture of Trust: 100% Client-Side Image Compression',
        'Compress images privately in your browser without server uploads using WASM-powered local processing.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Private Compressor', url: path }],
        'compression',
        guideContent.steps
      )
    };
  }

  if (path === '/compress-image-under-50kb-government-portal') {
    const guideContent = getCompressUnder50kbContent();
    return {
      path,
      h1Title: 'Sub-50KB Image Optimization for Strict Government & Exam Portals',
      metaTitle: 'Compress Image Under 50KB for Official Portals | Zapixal',
      metaDescription: 'Shrink passport photos and application uploads under 50KB in browser memory. Private, exact file target, zero server rejection.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      targetMaxKB: 50,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress Under 50KB', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Sub-50KB Image Optimization for Strict Government & Exam Portals',
        'Shrink passport photos and application uploads under 50KB in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Compress Under 50KB', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-heic-to-jpg-locally') {
    const guideContent = getConvertHeicToJpgContent();
    return {
      path,
      h1Title: 'Native iPhone HEIC to JPEG Decoding in Browser Memory',
      metaTitle: 'Convert HEIC to JPG Locally in Browser | 100% Private | Zapixal',
      metaDescription: 'Convert Apple HEIC photos to standard JPEG locally. Zero server uploads, WASM-powered decoding, instant batch processing.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'HEIC',
      toFormat: 'jpg',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert HEIC to JPG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Native iPhone HEIC to JPEG Decoding in Browser Memory',
        'Convert Apple HEIC photos to standard JPEG locally with WASM-powered decoding and zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert HEIC to JPG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/strip-exif-metadata-online-private') {
    const guideContent = getStripExifContent();
    return {
      path,
      h1Title: 'Complete EXIF Metadata & Geotag Erasure in Browser Memory',
      metaTitle: 'Strip EXIF Metadata & Geotags Privately | Zapixal',
      metaDescription: 'Remove GPS coordinates, camera details, and hidden EXIF headers from photos locally in browser memory with zero server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      stripExif: true,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Strip EXIF Metadata', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Complete EXIF Metadata & Geotag Erasure in Browser Memory',
        'Remove GPS coordinates and camera details from photos locally in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Strip EXIF Metadata', url: path }],
        'resource',
        guideContent.steps
      )
    };
  }

  if (path === '/bulk-image-compressor-offline') {
    const guideContent = getBulkCompressOfflineContent();
    return {
      path,
      h1Title: 'Multithreaded Client-Side Batch Compression for High-Volume Workflows',
      metaTitle: 'Bulk Compress Images Offline in Browser | Zapixal',
      metaDescription: 'Batch compress hundreds of images simultaneously using Web Workers and WASM. 100% offline-ready, multithreaded, zero server limits.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Bulk Offline Compressor', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Multithreaded Client-Side Batch Compression for High-Volume Workflows',
        'Batch compress hundreds of images simultaneously using Web Workers and WASM locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Bulk Offline Compressor', url: path }],
        'compression',
        guideContent.steps
      )
    };
  }

  if (path === '/compress-png-lossless-webassembly') {
    const guideContent = getCompressPngLosslessContent();
    return {
      path,
      h1Title: 'WebAssembly Lossless PNG Optimization without Pixel Quality Loss',
      metaTitle: 'Lossless PNG Compressor via WebAssembly | Zapixal',
      metaDescription: 'Optimize PNG images losslessly using oxipng compiled to WASM. Re-evaluates DEFLATE streams and delta filters with 0% visual degradation.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Lossless PNG Compressor', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'WebAssembly Lossless PNG Optimization without Pixel Quality Loss',
        'Optimize PNG images losslessly using oxipng compiled to WebAssembly locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Lossless PNG Compressor', url: path }],
        'compression',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-webp-to-png-transparent') {
    const guideContent = getConvertWebpToPngContent();
    return {
      path,
      h1Title: 'Convert WebP to PNG with Full Alpha Channel Transparency Intact',
      metaTitle: 'Convert WebP to PNG Transparent | Zapixal',
      metaDescription: 'Convert WebP to PNG in browser memory while preserving 8-bit alpha channel transparency. Zero black background artifacts or server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'WEBP',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert WebP to PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert WebP to PNG with Full Alpha Channel Transparency Intact',
        'Convert WebP images to 32-bit transparent PNG format locally in browser memory without server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert WebP to PNG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/passport-photo-size-reducer-kb') {
    const guideContent = getPassportPhotoSizeReducerContent();
    return {
      path,
      h1Title: 'Passport & Visa ID Photo Calibrator & Size Reducer',
      metaTitle: 'Passport Photo Size Reducer KB | Zapixal',
      metaDescription: 'Reduce passport and ID photo file sizes to exact kilobyte targets. Private, biometrically aligned, zero server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Passport Photo Reducer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Passport & Visa ID Photo Calibrator & Size Reducer',
        'Calibrate biometric passport photo pixel dimensions and reduce file size to exact kilobyte caps privately in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Passport Photo Reducer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-avif-to-jpg-converter') {
    const guideContent = getConvertAvifToJpgContent();
    return {
      path,
      h1Title: 'Convert Modern AVIF Images to Universal JPEG Format',
      metaTitle: 'Convert AVIF to JPG Offline | Zapixal',
      metaDescription: 'Convert AVIF images to universally compatible JPEG format in browser RAM. Tone-maps HDR, preserves sharpness, zero cloud processing.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'AVIF',
      toFormat: 'jpg',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert AVIF to JPG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert Modern AVIF Images to Universal JPEG Format',
        'Convert AV1-based AVIF images to standard JPEG locally in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert AVIF to JPG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/resize-image-for-job-application-form') {
    const guideContent = getResizeJobApplicationContent();
    return {
      path,
      h1Title: 'Optimize Portfolio & Headshot Uploads for ATS Job Applications',
      metaTitle: 'Resize Image for Job Applications | Zapixal',
      metaDescription: 'Shrink portfolio samples, certificates, and headshots for job portals. Sharp text retention, zero ATS upload rejections.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Resize for Job Applications', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Optimize Portfolio & Headshot Uploads for ATS Job Applications',
        'Resize and optimize career portal image attachments locally with sharp typography retention and zero cloud uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Resize for Job Applications', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/secure-signature-compressor-pdf') {
    const guideContent = getSecureSignatureCompressorContent();
    return {
      path,
      h1Title: 'Secure Digital Signature Background Removal & Compression',
      metaTitle: 'Digital Signature Compressor | Zapixal',
      metaDescription: 'Remove paper background noise and compress handwritten signature images for legal PDF signing. Private, transparent PNG output.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Digital Signature Compressor', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Secure Digital Signature Background Removal & Compression',
        'Isolate ink strokes, remove paper background shading, and export transparent signature PNGs locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Digital Signature Compressor', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/client-side-image-to-base64') {
    const guideContent = getClientSideBase64Content();
    return {
      path,
      h1Title: 'Client-Side Image to Base64 String Encoder',
      metaTitle: 'Image to Base64 Encoder | Zapixal',
      metaDescription: 'Convert images to Base64 strings, HTML Data URIs, and CSS background rules directly in browser memory. Private, offline, no POST payload limits.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Image to Base64 Encoder', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Client-Side Image to Base64 String Encoder',
        'Convert images to Base64 Data URIs directly in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Image to Base64 Encoder', url: path }],
        'resource',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-svg-to-png-transparent') {
    const guideContent = getConvertSvgToPngContent();
    return {
      path,
      h1Title: 'Rasterize SVG Vector Graphics to High-DPI Transparent PNG',
      metaTitle: 'Convert SVG to Transparent PNG | Zapixal',
      metaDescription: 'Convert SVG vector files to crisp PNG images with transparency and custom DPI scale multipliers. Rendered 100% locally in browser memory.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'SVG',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert SVG to PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Rasterize SVG Vector Graphics to High-DPI Transparent PNG',
        'Convert vector SVG graphics to high-resolution PNG format locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert SVG to PNG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/compress-animated-gif-size-online') {
    const guideContent = getCompressAnimatedGifContent();
    return {
      path,
      h1Title: 'Compress Animated GIF File Size Without Dropping Frames',
      metaTitle: 'Compress Animated GIF Size | Zapixal',
      metaDescription: 'Reduce animated GIF file sizes using WebAssembly LZW quantization and frame-buffer delta compression. Local, zero upload latency.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress Animated GIF', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Compress Animated GIF File Size Without Dropping Frames',
        'Compress animated GIF files locally using LZW quantization and delta framing in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Compress Animated GIF', url: path }],
        'compression',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-png-to-webp-lossless') {
    const guideContent = getConvertPngToWebpContent();
    return {
      path,
      h1Title: 'Convert Heavy PNG Assets to Modern WebP Format',
      metaTitle: 'Convert PNG to Lossless WebP | Zapixal',
      metaDescription: 'Upgrade PNG graphics to lightweight WebP format locally. Supports lossless WebP encoding and alpha transparency preservation.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'PNG',
      toFormat: 'webp',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert PNG to WebP', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert Heavy PNG Assets to Modern WebP Format',
        'Convert PNG images to lossless WebP format in browser RAM using WebAssembly libwebp.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert PNG to WebP', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/crop-image-to-exact-aspect-ratio') {
    const guideContent = getCropAspectRatioContent();
    return {
      path,
      h1Title: 'Precision Crop & Frame Images to Aspect Ratios Privately',
      metaTitle: 'Crop Image to Aspect Ratio | Zapixal',
      metaDescription: 'Crop photos to exact 16:9, 1:1, 4:5, or custom aspect ratios. Hardware-accelerated framing with zero cloud server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Crop Aspect Ratio', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Precision Crop & Frame Images to Aspect Ratios Privately',
        'Crop and frame images to exact social and print aspect ratios locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Crop Aspect Ratio', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/grayscale-black-and-white-photo-converter') {
    const guideContent = getGrayscaleConverterContent();
    return {
      path,
      h1Title: 'Convert Color Photos to Perceptual Grayscale & Monochrome Privately',
      metaTitle: 'Grayscale & Black and White Converter | Zapixal',
      metaDescription: 'Convert images to high-contrast black and white using ITU-R BT.709 perceptual luminance weighting. 100% private, zero server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Grayscale Converter', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert Color Photos to Perceptual Grayscale & Monochrome Privately',
        'Convert color photos to grayscale using ITU-R BT.709 luminance matrices locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Grayscale Converter', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/rotate-and-flip-image-local') {
    const guideContent = getRotateFlipLocalContent();
    return {
      path,
      h1Title: 'Rotate, Mirror, and Flip Images Locally Without Cloud Processing',
      metaTitle: 'Rotate & Flip Image Locally | Zapixal',
      metaDescription: 'Fix photo EXIF orientation, rotate 90/180 degrees, and mirror images locally in browser RAM with lossless transformations.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Rotate & Flip Image', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Rotate, Mirror, and Flip Images Locally Without Cloud Processing',
        'Rotate and flip photos locally in browser memory with physical EXIF orientation calibration.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Rotate & Flip Image', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/add-text-watermark-image-browser') {
    const guideContent = getAddTextWatermarkContent();
    return {
      path,
      h1Title: 'Apply Custom Text Watermarks to Photos Privately Client-Side',
      metaTitle: 'Apply Text Watermark Client-Side | Zapixal',
      metaDescription: 'Protect artwork and photos with custom text watermarks rendered directly in browser RAM. Auto-stroke contrast, zero cloud exposure.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Text Watermark', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Apply Custom Text Watermarks to Photos Privately Client-Side',
        'Add copyright text watermarks to images locally in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Text Watermark', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-tiff-bmp-to-jpg') {
    const guideContent = getConvertTiffBmpContent();
    return {
      path,
      h1Title: 'Unpack & Convert Uncompressed TIFF & BMP Images to JPEG',
      metaTitle: 'Convert TIFF & BMP to JPG | Zapixal',
      metaDescription: 'Convert heavy TIFF and BMP files to web-friendly JPEG format locally. Decodes CMYK print spaces and LZW/PackBits compression.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      toFormat: 'jpg',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert TIFF & BMP to JPG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Unpack & Convert Uncompressed TIFF & BMP Images to JPEG',
        'Convert uncompressed TIFF and BMP images to universal JPEG format locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert TIFF & BMP to JPG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/high-res-image-resizer-client-side') {
    const guideContent = getHighResResizerContent();
    return {
      path,
      h1Title: 'Lanczos-3 Spatial Resampling for High-Resolution Photos',
      metaTitle: 'High-Res Image Resizer Client-Side | Zapixal',
      metaDescription: 'Downscale multi-megapixel DSLR photos smoothly using Lanczos-3 spatial filtering. Tiled memory architecture prevents browser crashes.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'High-Res Resizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Lanczos-3 Spatial Resampling for High-Resolution Photos',
        'Scale down large DSLR photos locally using Lanczos-3 kernel resampling in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'High-Res Resizer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/dpi-ppi-converter-change-image-resolution') {
    const guideContent = getDpiPpiConverterContent();
    return {
      path,
      h1Title: 'Change Image DPI & PPI Density Headers for Print Preflight',
      metaTitle: 'Change Image DPI & PPI for Print | Zapixal',
      metaDescription: 'Recalibrate EXIF JFIF and PNG pHYs density metadata to 300 DPI or 600 DPI for commercial print preflight. 100% private, zero re-sampling loss.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Change DPI for Print', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Change Image DPI & PPI Density Headers for Print Preflight',
        'Recalibrate EXIF and pHYs density metadata to 300 DPI locally in browser memory without re-encoding pixel data.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Change DPI for Print', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/remove-exif-geotag-location-from-photo') {
    const guideContent = getRemoveExifGeotagContent();
    return {
      path,
      h1Title: 'Strip GPS Geotags & Home Location Coordinates From Photos',
      metaTitle: 'Strip GPS Geotags From Photos | Zapixal',
      metaDescription: 'Purge GPS IFD tags, latitude, longitude, and elevation metadata from smartphone photos locally in browser RAM with complete privacy.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Strip GPS Geotags', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Strip GPS Geotags & Home Location Coordinates From Photos',
        'Remove GPS location coordinates and satellite timestamps from photos locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Strip GPS Geotags', url: path }],
        'resource',
        guideContent.steps
      )
    };
  }

  if (path === '/compress-image-for-email-attachment-limit') {
    const guideContent = getCompressImageEmailContent();
    return {
      path,
      h1Title: 'Compress Photos for Gmail & Outlook Email Attachment Limits',
      metaTitle: 'Compress Image for Email Limits | Zapixal',
      metaDescription: 'Bypass strict 25MB email attachment limits by quantizing JPEG and PNG photos locally. Batch compress and ZIP bundle in browser RAM.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress for Email', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Compress Photos for Gmail & Outlook Email Attachment Limits',
        'Compress photos and bundle zip archives locally in browser RAM to pass corporate email size caps.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Compress for Email', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-jpg-to-webp-browser') {
    const guideContent = getConvertJpgToWebpContent();
    return {
      path,
      h1Title: 'Convert Legacy JPEG Photos to Next-Gen WebP in Browser Memory',
      metaTitle: 'Convert JPG to WebP in Browser | Zapixal',
      metaDescription: 'Upgrade JPG photos to WebP format using WASM libwebp in client RAM. 30% smaller file sizes with zero server uploads or API fees.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'JPG',
      toFormat: 'webp',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert JPG to WebP', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert Legacy JPEG Photos to Next-Gen WebP in Browser Memory',
        'Convert JPG photos to WebP format locally in browser RAM using WebAssembly libwebp.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert JPG to WebP', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/square-photo-maker-no-crop-blur-border') {
    const guideContent = getSquarePhotoMakerContent();
    return {
      path,
      h1Title: 'Make 1:1 Square Photos with Blurred Mirrored Background Padding',
      metaTitle: 'Square Photo Maker (No Crop) | Zapixal',
      metaDescription: 'Fit rectangular photos into 1:1 square aspect ratios without cropping subject faces. Adds aesthetic blurred background padding client-side.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Square Photo Maker', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Make 1:1 Square Photos with Blurred Mirrored Background Padding',
        'Expand photos into 1:1 square aspect ratios with blurred padding in browser RAM without cropping.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Square Photo Maker', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/compress-screenshot-png-size-fast') {
    const guideContent = getCompressScreenshotContent();
    return {
      path,
      h1Title: 'Compress Heavy Desktop & Retina PNG Screenshots Fast',
      metaTitle: 'Compress Screenshot PNG Fast | Zapixal',
      metaDescription: 'Compress 4K and Retina PNG screenshots by 60%+ while keeping code typography and UI borders pixel-sharp. Direct clipboard paste support.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress Screenshot PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Compress Heavy Desktop & Retina PNG Screenshots Fast',
        'Compress desktop PNG screenshots using adaptive palette reduction locally in browser memory without blurring code text.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Compress Screenshot PNG', url: path }],
        'compression',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-ico-to-png-favicon-extractor') {
    const guideContent = getConvertIcoToPngContent();
    return {
      path,
      h1Title: 'Unpack Multi-Resolution ICO Favicons into Transparent PNGs',
      metaTitle: 'Extract ICO Favicon to PNG | Zapixal',
      metaDescription: 'Extract embedded resolution frames from Windows ICO favicon containers into clean 32-bit transparent PNGs locally in browser RAM.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'ICO',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Extract ICO Favicon to PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Unpack Multi-Resolution ICO Favicons into Transparent PNGs',
        'Parse multi-resolution ICO directory headers and extract transparent PNG assets locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Extract ICO Favicon to PNG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/bulk-image-resizer-ecommerce-catalog') {
    const guideContent = getBulkEcommerceResizerContent();
    return {
      path,
      h1Title: 'Bulk Product Photo Resizer & Standardizer for Shopify & Amazon',
      metaTitle: 'Bulk E-commerce Catalog Resizer | Zapixal',
      metaDescription: 'Batch resize and square-pad supplier product photos for Shopify and Amazon listings. Multithreaded Web Worker processing in browser RAM.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'E-commerce Catalog Resizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Bulk Product Photo Resizer & Standardizer for Shopify & Amazon',
        'Batch standardize product catalog photos for e-commerce platforms locally using multithreaded browser workers.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'E-commerce Catalog Resizer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-png-to-jpg-white-background') {
    const guideContent = getConvertPngToWhiteJpgContent();
    return {
      path,
      h1Title: 'Convert Transparent PNG Graphics to Solid White Background JPEGs',
      metaTitle: 'Convert PNG to JPG (White Fill) | Zapixal',
      metaDescription: 'Convert transparent PNG logos and graphics to solid white background JPEGs without black background artifacts. 100% private.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'PNG',
      toFormat: 'jpg',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert PNG to White JPG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert Transparent PNG Graphics to Solid White Background JPEGs',
        'Composite transparent PNG alpha channels onto solid white canvas backgrounds and export crisp JPEGs locally.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert PNG to White JPG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/privacy-first-image-metadata-scrubber') {
    const guideContent = getPrivacyMetadataScrubberContent();
    return {
      path,
      h1Title: 'Deep EXIF, XMP, & Camera Serial Number Metadata Scrubber',
      metaTitle: 'Privacy Metadata Scrubber | Zapixal',
      metaDescription: 'Purge camera serial numbers, lens profiles, software build tags, and copyright data from image headers locally in browser RAM.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Privacy Metadata Scrubber', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Deep EXIF, XMP, & Camera Serial Number Metadata Scrubber',
        'Purge technical EXIF, XMP, and IPTC camera serial number tags from image binary headers locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Privacy Metadata Scrubber', url: path }],
        'resource',
        guideContent.steps
      )
    };
  }

  if (path === '/blur-sensitive-image-privacy-pixelator') {
    const guideContent = getBlurSensitiveInfoContent();
    return {
      path,
      h1Title: 'Blur & Pixelate Sensitive Information in Photos Privately',
      metaTitle: 'Blur & Pixelate Sensitive Info | Zapixal',
      metaDescription: 'Redact credit card details, API keys, faces, and license plates using irreversible 16x16 mosaic block quantization directly in browser RAM.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Blur Sensitive Info', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Blur & Pixelate Sensitive Information in Photos Privately',
        'Irreversibly mosaic pixelate or blur sensitive text and faces in screenshots locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Blur Sensitive Info', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-hdr-heic-to-png-transparency') {
    const guideContent = getConvertHeicToPngContent();
    return {
      path,
      h1Title: 'Convert iPhone HEIC Photos to Transparent PNG in Browser',
      metaTitle: 'Convert iPhone HEIC to Transparent PNG | Zapixal',
      metaDescription: 'Unlock Apple HEIC photos on Windows and Linux using WebAssembly libheif. Converts HEIC bitstreams to 32-bit transparent PNGs locally.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'HEIC',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert HEIC to PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert iPhone HEIC Photos to Transparent PNG in Browser',
        'Decode HEIC photos locally in browser WebAssembly memory and convert to transparent PNG graphics.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert HEIC to PNG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/social-media-banner-resizer-linkedin-twitter') {
    const guideContent = getSocialBannerResizerContent();
    return {
      path,
      h1Title: 'Resize Social Media Banner Headers with Mobile Safety Overlays',
      metaTitle: 'Social Media Cover Banner Resizer | Zapixal',
      metaDescription: 'Frame LinkedIn, Twitter/X, YouTube, and Facebook header banners with real-time mobile avatar safety overlays. Hardware accelerated client-side.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Social Banner Resizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Resize Social Media Banner Headers with Mobile Safety Overlays',
        'Resize cover banners for LinkedIn, Twitter, and YouTube with mobile viewport safety masks locally.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Social Banner Resizer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/palette-color-extractor-image-hex') {
    const guideContent = getPaletteHexExtractorContent();
    return {
      path,
      h1Title: 'Extract Dominant Color Palettes & Hex Codes from Images',
      metaTitle: 'Image Color Palette Hex Extractor | Zapixal',
      metaDescription: 'Extract HEX, RGB, and HSL color swatches from photos using K-means vector quantization in browser Web Workers. Generate CSS & Tailwind configs.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Color Palette Extractor', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Extract Dominant Color Palettes & Hex Codes from Images',
        'Extract color palette hex codes from images locally using K-means vector quantization in browser Web Workers.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Color Palette Extractor', url: path }],
        'resource',
        guideContent.steps
      )
    };
  }

  if (path === '/lossless-jpeg-optimizer-exif-preserve') {
    const guideContent = getLosslessJpegOptimizerContent();
    return {
      path,
      h1Title: 'Lossless JPEG Entropy Optimization & Progressive Encoding',
      metaTitle: 'Lossless Metadata-Preserving JPEG Optimizer | Zapixal',
      metaDescription: 'Compress JPEG files by 10%-25% without altering a single pixel value using custom Huffman entropy recalculation in browser RAM.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      toFormat: 'jpg',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Lossless JPEG Optimizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Lossless JPEG Entropy Optimization & Progressive Encoding',
        'Re-optimize JPEG Huffman entropy tables and convert to progressive JPEG locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Lossless JPEG Optimizer', url: path }],
        'compression',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-webp-to-png-lossless-transparent') {
    const guideContent = getConvertWebpToPngTransparentContent();
    return {
      path,
      h1Title: 'Convert WebP Images to 32-Bit Transparent PNG in Browser Memory',
      metaTitle: 'Convert WebP to Transparent PNG | Zapixal',
      metaDescription: 'Convert WebP images to lossless PNG format in browser memory. Preserves full 8-bit alpha transparency without color fringing or server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'webp',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert WebP to PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Convert WebP Images to 32-Bit Transparent PNG in Browser Memory',
        'Decode WebP images and export 32-bit transparent PNG graphics locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert WebP to PNG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/split-image-grid-instagram-banner') {
    const guideContent = getSplitGridInstagramContent();
    return {
      path,
      h1Title: 'Split Panoramic Photos into Instagram Banner Grid Tiles',
      metaTitle: 'Split Image into Instagram Grid Tiles | Zapixal',
      metaDescription: 'Slice wide photos and artwork into seamless 3x1, 3x2, or 3x3 Instagram grid tile posts locally. Sub-pixel precision, zero gap artifacts.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Instagram Grid Splitter', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Split Panoramic Photos into Instagram Banner Grid Tiles',
        'Segment panoramic artwork into Instagram grid tile sequences locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Instagram Grid Splitter', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-eps-psd-preview-to-png') {
    const guideContent = getConvertEpsPsdContent();
    return {
      path,
      h1Title: 'Extract PNG Previews from Photoshop PSD & EPS Vector Files',
      metaTitle: 'Extract PNG Preview from PSD & Vector Files | Zapixal',
      metaDescription: 'Unpack embedded composite previews from Photoshop PSD files and EPS vectors without Adobe Creative Cloud. 100% private client-side parsing.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Extract PSD & EPS to PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Extract PNG Previews from Photoshop PSD & EPS Vector Files',
        'Parse PSD and EPS binary stream headers locally and extract composite PNG previews in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Extract PSD & EPS to PNG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/compress-pdf-scanned-document-images') {
    const guideContent = getCompressScannedDocContent();
    return {
      path,
      h1Title: 'Binarize & Quantize Scanned Document Images to 1-Bit B&W',
      metaTitle: 'Scanned Document Image Quantizer | Zapixal',
      metaDescription: 'Clean noisy scanned contracts and forms using adaptive thresholding. Slashes file sizes by 90% while boosting OCR readability locally.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Scanned Document Quantizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Binarize & Quantize Scanned Document Images to 1-Bit B&W',
        'Convert noisy document scans into high-contrast 1-bit black and white images locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Scanned Document Quantizer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/batch-rename-watermark-resize-pipeline') {
    const guideContent = getBatchPipelineContent();
    return {
      path,
      h1Title: 'Multi-Stage In-Memory Batch Image Processing Pipeline',
      metaTitle: 'Multi-Stage Image Batch Pipeline | Zapixal',
      metaDescription: 'Chain resizing, watermarking, EXIF stripping, and WebP format conversion into a single in-memory WebWorker pass without multi-pass artifacts.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Multi-Stage Batch Pipeline', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Multi-Stage In-Memory Batch Image Processing Pipeline',
        'Chain image processing operations sequentially in a single WebWorker pass locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Multi-Stage Batch Pipeline', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-avif-to-jpg-browser-fast') {
    const guideContent = getConvertAvifToJpgFastContent();
    return {
      path,
      h1Title: 'Decompress AVIF Still Images to Baseline JPEG in WebAssembly',
      metaTitle: 'Convert AVIF to JPG in Browser | Zapixal',
      metaDescription: 'Convert AVIF image files to baseline JPEG format in browser RAM using dav1d WebAssembly. Preserves color gamuts with zero server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'AVIF',
      toFormat: 'jpg',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert AVIF to JPG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Decompress AVIF Still Images to Baseline JPEG in WebAssembly',
        'Decompress AVIF bitstreams locally using WebAssembly and export universally supported baseline JPEGs.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert AVIF to JPG', url: path }],
        'converter',
        guideContent.steps
      )
    };
  }

  if (path === '/adjust-image-brightness-contrast-gamma-canvas') {
    const guideContent = getAdjustBrightnessGammaContent();
    return {
      path,
      h1Title: 'Hardware-Accelerated Brightness, Contrast & Non-Linear Gamma Adjustment',
      metaTitle: 'Adjust Image Brightness, Contrast & Gamma | Zapixal',
      metaDescription: 'Correct photo exposure and gamma curves using Canvas 2D Lookup Tables (LUTs) with live 60fps RGBA histogram feedback. 100% client-side privacy.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Adjust Brightness & Gamma', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Hardware-Accelerated Brightness, Contrast & Non-Linear Gamma Adjustment',
        'Apply LUT gamma curve corrections and monitor live RGBA histograms locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Adjust Brightness & Gamma', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/passport-visa-photo-resizer-background-white') {
    const guideContent = getPassportPhotoResizerContent();
    return {
      path,
      h1Title: 'Calibrate Passport & Visa Photos to Official Government Specifications',
      metaTitle: 'Passport & Visa Photo Resizer | Zapixal',
      metaDescription: 'Resize photos to 2x2 inch US Passport or 35x45mm Schengen visa standards with solid white background fill and 300 DPI preflight EXIF headers.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Passport & Visa Photo Resizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Calibrate Passport & Visa Photos to Official Government Specifications',
        'Calibrate biometric passport photo framing, background fill, and 300 DPI EXIF headers locally.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Passport & Visa Photo Resizer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/add-rounded-corners-border-radius-image') {
    const guideContent = getAddRoundedCornersContent();
    return {
      path,
      h1Title: 'Frame App Screenshots with Rounded Corners & Gaussian Drop Shadows',
      metaTitle: 'Add Rounded Corners & Drop Shadows | Zapixal',
      metaDescription: 'Apply smooth border-radius clipping paths and blurred drop shadow framing to app screenshots in browser RAM. Direct clipboard paste support.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Add Rounded Corners', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Frame App Screenshots with Rounded Corners & Gaussian Drop Shadows',
        'Apply sub-pixel clipping paths and elevation drop shadows to screenshots locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Add Rounded Corners', url: path }],
        'use-case',
        guideContent.steps
      )
    };
  }

  if (path === '/convert-animated-webp-to-gif') {
    const guideContent = getConvertAnimatedWebpToGifContent();
    return {
      path,
      h1Title: 'Demux Animated WebP & Compile Universal GIF Animations',
      metaTitle: 'Convert Animated WebP to GIF | Zapixal',
      metaDescription: 'Demux animated WebP frames in WebAssembly and re-encode to universal GIF format with Floyd-Steinberg dithering. 100% in-memory processing.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'webp',
      toFormat: 'gif',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert Animated WebP to GIF', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Demux Animated WebP & Compile Universal GIF Animations',
        'Demux animated WebP RIFF chunks in WebAssembly and re-encode to universal GIF animations locally.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert Animated WebP to GIF', url: path }],
        'converter',
        guideContent.steps
      )
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
