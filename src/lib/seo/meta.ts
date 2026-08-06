import { TargetFormat } from '../../types';
import { PSEO_ROUTES_LIST, DOMAIN } from './routes';
import { generateJsonLdSchemas } from './schema';
import { getCompressionEditorialContent, getFormatPairIntelligence, getFallbackEditorialContent, getHomeEditorialContent, getEducationalEditorialContent } from './content';

export interface SeoRouteData {
  path: string;
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  isIndexable: boolean;
  pageCategory: 'converter' | 'compression' | 'use-case' | 'home' | 'resource';
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
    softwareApp: object;
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

  // Check specific matched route from list
  const matchedListRoute = PSEO_ROUTES_LIST.find((r) => r.path === path);

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

  // 1. Compression pattern: /compress-[format]-under-[size]kb or /compress-[format]-under-[size]mb
  const compressMatch = path.match(/^\/compress-([a-z0-9]+)-under-(\d+)(kb|mb)$/);
  if (compressMatch) {
    const rawFormat = compressMatch[1];
    const sizeNum = parseInt(compressMatch[2], 10);
    const unit = compressMatch[3];
    const sizeKB = unit === 'mb' ? sizeNum * 1024 : sizeNum;
    const isIndexable = sizeKB >= 10;
    const formatName = rawFormat.toUpperCase();
    const toFormat: TargetFormat = (['jpg', 'png', 'webp', 'avif', 'ico', 'pdf'].includes(rawFormat) ? rawFormat : 'jpg') as TargetFormat;
    const titleFormat = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)}MB` : `${sizeKB}KB`;

    return {
      path,
      h1Title: `Bulk Compress ${formatName} Under ${titleFormat} Offline & Free`,
      metaTitle: `Compress ${formatName} Under ${titleFormat} | Private Offline Tool | Zapixal`,
      metaDescription: `Compress ${formatName} under ${titleFormat} without uploading files to a server. Zapixal helps you preserve legibility, meet size limits, and keep sensitive images private while working locally in the browser.`,
      canonicalUrl: fullUrl,
      isIndexable,
      pageCategory: 'compression',
      fromFormat: rawFormat,
      toFormat,
      targetMaxKB: sizeKB,
      stripExif: true,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: `Compress Under ${titleFormat}`, url: path },
      ],
      guideContent: getCompressionEditorialContent(formatName, sizeKB, titleFormat),
      jsonLd: generateJsonLdSchemas(
        `Compress ${formatName} Under ${titleFormat}`,
        `Compress ${formatName} under ${titleFormat} free and privately in browser.`,
        fullUrl,
        [{ question: `Is compressing ${formatName} under ${titleFormat} safe for my privacy?`, answer: 'Yes, 100%. Zapixal runs in browser memory.' }],
        [{ name: 'Home', url: '/' }, { name: `Compress ${formatName} Under ${titleFormat}`, url: fullUrl }],
        'compression',
        [
          `Select or drop ${formatName} image files.`,
          `Zapixal applies compression to fit under ${titleFormat}.`,
          `Download your compressed ${formatName} image.`
        ]
      )
    };
  }

  // 2. Convert pattern: /convert-[from]-to-[to] or /[from]-to-[to]
  const convertMatch = path.match(/^\/(?:convert-)?([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (convertMatch) {
    const fromFmt = convertMatch[1].toUpperCase();
    const toFmtRaw = convertMatch[2].toLowerCase();
    const toFmtUpper = toFmtRaw.toUpperCase();
    const toFormat: TargetFormat = (['jpg', 'png', 'webp', 'avif', 'ico', 'pdf'].includes(toFmtRaw) ? toFmtRaw : 'jpg') as TargetFormat;
    const intel = getFormatPairIntelligence(fromFmt, toFmtUpper, toFormat);

    return {
      path,
      h1Title: `Free Offline Batch ${fromFmt} to ${toFmtUpper} Converter`,
      metaTitle: `Convert ${fromFmt} to ${toFmtUpper} Offline | Private Batch Image Converter | Zapixal`,
      metaDescription: `Convert ${fromFmt} to ${toFmtUpper} locally in your browser with Zapixal. The workflow stays private, supports batch work, and helps you choose a practical output format for web, sharing, or uploads.`,
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: convertMatch[1],
      toFormat,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: `${fromFmt} to ${toFmtUpper}`, url: path },
      ],
      guideContent: {
        badge: intel.badge,
        section1Title: intel.section1Title,
        section1Body: intel.section1Body,
        section2Title: intel.section2Title,
        section2Body: intel.section2Body,
        steps: intel.steps,
        faqs: intel.faqs
      },
      jsonLd: generateJsonLdSchemas(
        `Convert ${fromFmt} to ${toFmtUpper}`,
        `Convert ${fromFmt} to ${toFmtUpper} free and privately in browser.`,
        fullUrl,
        intel.faqs,
        [{ name: 'Home', url: '/' }, { name: `${fromFmt} to ${toFmtUpper}`, url: fullUrl }],
        'converter',
        [
          `Drop your ${fromFmt} files into the converter area.`,
          `Select your target format (${toFmtUpper}) and quality settings.`,
          `Download your converted ${toFmtUpper} files instantly.`
        ]
      )
    };
  }

  const educationalRoutes: Record<string, { title: string; metaTitle: string; metaDescription: string; guideContent: ReturnType<typeof getEducationalEditorialContent>; relatedRoutes: Array<{ path: string; label: string }> }> = {
    '/jpeg-vs-png': {
      title: 'JPEG vs PNG',
      metaTitle: 'JPEG vs PNG: Which Format Is Better for Photos and Graphics?',
      metaDescription: 'Learn when to use JPEG vs PNG for photos, graphics, transparency, and web delivery. The guide explains real-world tradeoffs and links to the right tool.',
      guideContent: getEducationalEditorialContent(
        'Format decision guide',
        'Why JPEG and PNG are still the most important format decisions',
        'JPEG is usually the best fit for photos and everyday sharing because it balances quality and size well. PNG is stronger when graphics need transparency, crisp edges, or repeated editing. The best choice depends on the destination of the file and the kind of detail that matters most.',
        'When to choose each format in practical workflows',
        'Professional teams usually choose JPEG for photos and screenshots that need broad compatibility. They choose PNG when a logo, icon, overlay, or transparent asset needs to stay editable and predictable across apps. The strongest workflow tests the output in the actual destination before it is published.',
        [
          'Start by deciding whether the image is primarily photographic or graphic.',
          'Choose JPEG for general photo use and PNG when transparency or editing flexibility matters.',
          'Test the output in the place where it will be used before you publish or share it.'
        ],
        [
          { question: 'Which format is better for photos?', answer: 'JPEG is usually the better default for photos because it keeps file sizes practical and is widely supported.' },
          { question: 'When should I choose PNG?', answer: 'PNG is the better choice for logos, icons, screenshots, and any asset that needs transparency or repeated editing.' },
          { question: 'Can I convert between these formats safely?', answer: 'Yes. The workflow stays local in the browser, so you can convert between formats without uploading the file to a remote service.' }
        ]
      ),
      relatedRoutes: [
        { path: '/convert-jpg-to-png', label: 'JPG to PNG Converter' },
        { path: '/convert-png-to-jpg', label: 'PNG to JPG Converter' },
        { path: '/compress-jpeg-under-200kb', label: 'Compress JPEG Under 200KB' },
        { path: '/compress-png-under-500kb', label: 'Compress PNG Under 500KB' }
      ]
    },
    '/heic-explained': {
      title: 'HEIC Explained',
      metaTitle: 'HEIC Explained: Why Apple Photos Use This Format',
      metaDescription: 'Understand HEIC and HEIF, why Apple uses them, and when converting to JPG or PNG makes more sense for sharing and uploads.',
      guideContent: getEducationalEditorialContent(
        'Apple format guide',
        'Why HEIC is efficient but not always practical',
        'HEIC is compact and efficient, which is why Apple devices use it for photos and screenshots. The tradeoff is compatibility. Some Windows systems, older apps, and upload portals still handle HEIC less smoothly than JPEG, which is why conversion is often a practical step.',
        'When conversion improves the workflow',
        'A HEIC file is a strong choice when storage is important and the file will stay on the same Apple ecosystem. It becomes less convenient when the file must be shared widely, uploaded to a form, or opened on other devices without extra software.',
        [
          'Check whether the destination device or portal supports HEIC before you keep the original file.',
          'Use JPG when compatibility and easy sharing matter more than storage efficiency.',
          'Use PNG when you need a format with a more universal editing or transparency workflow.'
        ],
        [
          { question: 'Is HEIC better than JPG?', answer: 'HEIC is usually more efficient for storage, but JPG is still more broadly compatible for sharing and uploads.' },
          { question: 'When should I convert HEIC to JPG?', answer: 'Convert when the file must work across more devices, apps, or upload forms.' },
          { question: 'Is HEIC safe to process locally?', answer: 'Yes. Local browser processing keeps the file private and avoids unnecessary uploads.' }
        ]
      ),
      relatedRoutes: [
        { path: '/convert-heic-to-jpg', label: 'HEIC to JPG Converter' },
        { path: '/convert-heic-to-png', label: 'HEIC to PNG Converter' },
        { path: '/convert-heic-to-pdf', label: 'HEIC to PDF Converter' },
        { path: '/compress-image-under-100kb', label: 'Compress Image Under 100KB' }
      ]
    },
    '/webp-explained': {
      title: 'WebP Explained',
      metaTitle: 'WebP Explained: Why This Modern Format Matters for Websites',
      metaDescription: 'Learn what WebP is, why it is efficient for web delivery, and when converting to PNG or JPG is the better choice.',
      guideContent: getEducationalEditorialContent(
        'Modern web format guide',
        'Why WebP is useful for responsive websites',
        'WebP is one of the most practical modern image formats for websites because it often delivers strong quality at smaller file sizes. It is especially useful for imagery that needs fast loading and efficient delivery across modern browsers.',
        'When WebP is not the best final format',
        'WebP is not always the most convenient choice for every downstream workflow. Designers, editors, and teams that need traditional compatibility may prefer PNG or JPG for a later stage of the workflow.',
        [
          'Use WebP when site speed and efficient delivery matter most.',
          'Convert to PNG when transparency and editing flexibility matter more than size.',
          'Convert to JPG when the image is photographic and a standard compatibility workflow is needed.'
        ],
        [
          { question: 'Is WebP good for websites?', answer: 'Yes. WebP is widely used because it often produces smaller files without a dramatic loss in visual quality.' },
          { question: 'Should I always use WebP?', answer: 'Not always. Some workflows need PNG or JPG because of editing needs or compatibility expectations.' },
          { question: 'Can I convert WebP without uploading files?', answer: 'Yes. The tool works locally in the browser so the file stays private.' }
        ]
      ),
      relatedRoutes: [
        { path: '/convert-png-to-webp', label: 'PNG to WebP Converter' },
        { path: '/convert-webp-to-png', label: 'WebP to PNG Converter' },
        { path: '/convert-webp-to-jpg', label: 'WebP to JPG Converter' },
        { path: '/compress-image', label: 'Compress Image Size' }
      ]
    },
    '/avif-explained': {
      title: 'AVIF Explained',
      metaTitle: 'AVIF Explained: A Next-Gen Format for Modern Performance',
      metaDescription: 'See how AVIF compares to JPEG, PNG, and WebP, and understand when this high-efficiency format is worth using.',
      guideContent: getEducationalEditorialContent(
        'High-efficiency format guide',
        'Why AVIF is attractive for performance-focused teams',
        'AVIF is designed for modern performance goals. It can produce impressive compression for many images while preserving quality well, especially for web delivery and responsive sites that must balance speed and clarity.',
        'Why compatibility still matters',
        'AVIF is powerful, but broad support is still more limited than JPEG or PNG in some older tools and workflows. A practical team will test support in the real destination environment before relying on it exclusively.',
        [
          'Use AVIF when you need excellent compression and your audience uses modern browsers.',
          'Keep a fallback format when compatibility or older software may be involved.',
          'Test the output in the destination environment before you publish it widely.'
        ],
        [
          { question: 'Is AVIF better than WebP?', answer: 'AVIF can offer strong compression, but the best choice depends on support, output goals, and how the asset will be used.' },
          { question: 'Is AVIF good for photography?', answer: 'It can be excellent for photos on modern web stacks, especially when the file is carefully tuned.' },
          { question: 'Can I convert to AVIF locally?', answer: 'Yes. The conversion workflow can stay in the browser, keeping the process private and fast.' }
        ]
      ),
      relatedRoutes: [
        { path: '/convert-png-to-avif', label: 'PNG to AVIF Converter' },
        { path: '/convert-avif-to-png', label: 'AVIF to PNG Converter' },
        { path: '/convert-avif-to-webp', label: 'AVIF to WebP Converter' },
        { path: '/compress-image-under-2mb', label: 'Compress Image Under 2MB' }
      ]
    },
    '/how-image-compression-works': {
      title: 'How Image Compression Works',
      metaTitle: 'How Image Compression Works: Quality, Size, and Tradeoffs',
      metaDescription: 'Learn how image compression works, why it changes file size, and how to choose the right balance between quality and performance.',
      guideContent: getEducationalEditorialContent(
        'Compression fundamentals',
        'Why compression changes an image without changing the subject',
        'Compression reduces the amount of data needed to represent an image. Some methods remove details that are less visible to the eye, while others preserve structure more aggressively. The goal is not to maximize reduction at any cost; it is to find the smallest file that still looks correct in the real destination.',
        'How to make compression decisions with confidence',
        'The most reliable approach is to understand whether the asset is photographic, graphic, or text-heavy, and then test the result at the actual target size. A screenshot, a passport photo, or a product photo each have different needs.',
        [
          'Start with the original image and the target file size or performance goal.',
          'Choose a compression setting that preserves the details that matter most.',
          'Review the output for artifacts, readability, and visual quality before you use it.'
        ],
        [
          { question: 'Why do compressed files look different?', answer: 'Because some information is removed or simplified to reduce the data required to represent the image.' },
          { question: 'Is lossy compression always bad?', answer: 'No. Lossy compression is often the right choice when the result still looks good at the intended size and resolution.' },
          { question: 'How do I know when I have compressed enough?', answer: 'You should test the output in the actual destination and stop when it still looks correct and meets the target requirement.' }
        ]
      ),
      relatedRoutes: [
        { path: '/compress-image', label: 'Compress Image Size' },
        { path: '/compress-jpeg-without-losing-quality', label: 'Compress JPEG Without Losing Quality' },
        { path: '/compress-png-under-500kb', label: 'Compress PNG Under 500KB' },
        { path: '/compress-image-under-50kb', label: 'Compress Image Under 50KB' }
      ]
    },
    '/what-is-exif': {
      title: 'What Is EXIF',
      metaTitle: 'What Is EXIF: Metadata in Camera Photos and Why It Matters',
      metaDescription: 'Learn what EXIF data is, what it can reveal, and how to remove it when you want more privacy or cleaner uploads.',
      guideContent: getEducationalEditorialContent(
        'Metadata awareness guide',
        'Why EXIF metadata is often more important than people expect',
        'EXIF data is embedded metadata that can include camera details, timestamps, GPS coordinates, and sometimes device-specific information. That metadata can be useful for photographers and archive workflows, but it can also create privacy concerns or clutter upload forms.',
        'When stripping metadata helps',
        'Removing EXIF data is often a smart step before sharing an image publicly, posting it online, or sending it to a portal that only needs the visible pixels. The decision depends on whether the metadata adds value or creates risk.',
        [
          'Check whether the image needs the original metadata for your workflow.',
          'Strip metadata when privacy, minimal uploads, or cleaner sharing matter more.',
          'Keep the original file if you might need the metadata later for archival work.'
        ],
        [
          { question: 'What is EXIF data?', answer: 'It is embedded metadata stored with the image file, often including camera settings, timestamps, and sometimes location information.' },
          { question: 'Should I remove EXIF data?', answer: 'It is often a good idea before sharing or uploading images publicly or to portals that do not need the metadata.' },
          { question: 'Can I remove EXIF metadata locally?', answer: 'Yes. Local processing keeps the task private and simple.' }
        ]
      ),
      relatedRoutes: [
        { path: '/strip-exif', label: 'Strip EXIF Metadata' },
        { path: '/exif-metadata-remover', label: 'EXIF Metadata Remover' },
        { path: '/remove-exif-data-for-reddit', label: 'Remove EXIF Data for Reddit' },
        { path: '/remove-gps-from-photo-offline', label: 'Remove GPS from Photo' }
      ]
    },
    '/image-dpi-guide': {
      title: 'Image DPI Guide',
      metaTitle: 'Image DPI Guide: What DPI Means and When It Matters',
      metaDescription: 'Understand image DPI, how it differs from pixel dimensions, and which workflows actually depend on it.',
      guideContent: getEducationalEditorialContent(
        'Print and display fundamentals',
        'Why DPI is often misunderstood',
        'DPI is often confused with image quality, but it is really a print-related measurement. The more important practical question is usually whether the image has enough pixel dimensions for the final output size and the intended display medium.',
        'How to use DPI correctly',
        'For web work, pixel dimensions usually matter more than DPI. For print, the combination of pixel dimensions and intended print size can matter a great deal. A clear workflow tests the file where it will be used instead of assuming a number alone is enough.',
        [
          'Identify whether the image is for screen use or print before changing its settings.',
          'For web, focus on pixel dimensions and file size.',
          'For print, check the output size and resolution together before you export.'
        ],
        [
          { question: 'Is DPI the same as image quality?', answer: 'No. DPI is a print-related measure, while visual quality also depends on pixel dimensions, compression, and the viewing context.' },
          { question: 'Does a higher DPI always make an image better?', answer: 'Not necessarily. It can help for print, but it does not automatically improve a screen-based image.' },
          { question: 'How do I choose the right settings?', answer: 'Match the image to the destination, then test the output to see whether it looks right at the intended size.' }
        ]
      ),
      relatedRoutes: [
        { path: '/image-resizer-online', label: 'Image Resizer Online' },
        { path: '/resize-image-to-1920x1080', label: 'Resize Image to 1920x1080' },
        { path: '/compress-image', label: 'Compress Image Size' },
        { path: '/website-image-optimizer', label: 'Website Image Optimizer' }
      ]
    },
    '/color-profiles-explained': {
      title: 'Color Profiles Explained',
      metaTitle: 'Color Profiles Explained: ICC, sRGB, and Color Management',
      metaDescription: 'Learn what color profiles are, why they matter, and how to avoid mismatched colors when preparing images for web and print.',
      guideContent: getEducationalEditorialContent(
        'Color management guide',
        'Why color profiles are part of a professional workflow',
        'Color profiles help define how colors should be interpreted across devices and software. Without them, the same image can look slightly different on a phone, monitor, printer, or design app. That difference matters when the image needs to look precise and consistent.',
        'How to avoid common color mistakes',
        'A practical workflow uses a profile that matches the output destination, especially for brand assets and print work. Web projects often lean toward sRGB, while print workflows may require a wider or more specific profile.',
        [
          'Identify whether the asset is for screen, print, or a brand system.',
          'Use a profile that matches the destination, especially for logo and brand work.',
          'Test the file on the device or printer that will receive it.'
        ],
        [
          { question: 'What is an ICC profile?', answer: 'It is a color profile that helps software interpret and reproduce colors consistently across devices.' },
          { question: 'Why do colors look different on different screens?', answer: 'Because devices vary in hardware, calibration, and color space interpretation.' },
          { question: 'Should I always convert to sRGB for web?', answer: 'For many web workflows, yes, because it is the most widely supported color space.' }
        ]
      ),
      relatedRoutes: [
        { path: '/convert-jpg-to-png', label: 'JPG to PNG Converter' },
        { path: '/convert-png-to-webp', label: 'PNG to WebP Converter' },
        { path: '/compress-image', label: 'Compress Image Size' },
        { path: '/website-image-optimizer', label: 'Website Image Optimizer' }
      ]
    },
    '/rgb-vs-cmyk': {
      title: 'RGB vs CMYK',
      metaTitle: 'RGB vs CMYK: Which Color Mode Should You Use?',
      metaDescription: 'Understand the difference between RGB and CMYK and choose the right color mode for screen, print, and design work.',
      guideContent: getEducationalEditorialContent(
        'Color mode guide',
        'Why RGB and CMYK solve different problems',
        'RGB is the standard color mode for screens, while CMYK is designed for print. Using the wrong color mode can lead to unexpected shifts in color and tone, especially when a design moves from a digital mockup to a printed piece.',
        'How to choose the right mode',
        'A strong workflow keeps images in RGB for digital delivery and converts to CMYK only when the print process requires it. The important step is to understand the destination before you finalize the file.',
        [
          'Choose RGB for web, digital ads, and screen-based work.',
          'Choose CMYK when preparing materials for print production.',
          'Review the output in the destination environment before finalizing it.'
        ],
        [
          { question: 'Is RGB or CMYK better for web?', answer: 'RGB is the correct choice for digital screens and most online assets.' },
          { question: 'Why do printed images look different?', answer: 'Because print uses a different color model and often different paper and ink conditions.' },
          { question: 'Do I need to convert before uploading to a website?', answer: 'Usually not. Web images should stay in RGB unless a specific print workflow requires a different profile.' }
        ]
      ),
      relatedRoutes: [
        { path: '/convert-jpg-to-png', label: 'JPG to PNG Converter' },
        { path: '/website-image-optimizer', label: 'Website Image Optimizer' },
        { path: '/compress-image', label: 'Compress Image Size' },
        { path: '/resize-image-to-1920x1080', label: 'Resize Image to 1920x1080' }
      ]
    },
    '/image-dimensions-guide': {
      title: 'Image Dimensions Guide',
      metaTitle: 'Image Dimensions Guide: Width, Height, and Resolution Explained',
      metaDescription: 'Learn how image dimensions affect layout, web performance, and print quality, and where resizing fits into a better workflow.',
      guideContent: getEducationalEditorialContent(
        'Resize strategy guide',
        'Why dimensions matter more than raw file size alone',
        'Image dimensions shape the visual experience and the technical requirements of a file. A banner, a thumbnail, and a product photo each need different dimensions, and resizing to the right size can dramatically improve performance and usability.',
        'How to choose dimensions with confidence',
        'The strongest approach is to match dimensions to the real display context, not simply to the largest possible format. This helps reduce unnecessary file weight and keeps the final asset appropriate for the platform.',
        [
          'Start with the platform or layout that will display the image.',
          'Resize to the intended display dimensions rather than the maximum possible size.',
          'Compress after resizing so the file stays practical without losing clarity.'
        ],
        [
          { question: 'What are image dimensions?', answer: 'They are the width and height of the image in pixels, and they directly affect how the file fits a layout or screen.' },
          { question: 'Does resizing hurt quality?', answer: 'It can if you enlarge an image beyond its source quality, but resizing down is often the right and practical choice.' },
          { question: 'When should I resize before compressing?', answer: 'Usually right before compression, because the final pixel dimensions influence how much data the file needs.' }
        ]
      ),
      relatedRoutes: [
        { path: '/image-resizer-online', label: 'Image Resizer Online' },
        { path: '/resize-image-to-1920x1080', label: 'Resize Image to 1920x1080' },
        { path: '/compress-image', label: 'Compress Image Size' },
        { path: '/website-image-optimizer', label: 'Website Image Optimizer' }
      ]
    },
    '/social-media-image-size-guide': {
      title: 'Social Media Image Size Guide',
      metaTitle: 'Social Media Image Size Guide: Sizes for Facebook, Instagram, LinkedIn, and More',
      metaDescription: 'Learn the image size requirements for major social platforms and prepare assets that look sharp without wasting bandwidth.',
      guideContent: getEducationalEditorialContent(
        'Platform-specific sizing guide',
        'Why every social platform has its own image expectations',
        'Social platforms optimize for different layout shapes, display sizes, and content priorities. A photo that fits one platform may be cropped, stretched, or displayed poorly on another. The best practice is to prepare platform-specific assets rather than rely on a one-size-fits-all image.',
        'How to build a practical content workflow',
        'A strong social media workflow creates a base image, then crops and resizes it for each platform. This reduces wasted time, keeps brand presentation consistent, and helps the image display more clearly on mobile screens.',
        [
          'Start with a landscape or portrait image that fits your core content theme.',
          'Resize and crop for each platform before you publish.',
          'Keep the final output compressed enough to load quickly on mobile.'
        ],
        [
          { question: 'Why do social images need different sizes?', answer: 'Because each platform uses different layouts, crop behavior, and display characteristics.' },
          { question: 'Is resizing enough for social media?', answer: 'Usually not; the image should also be checked for cropping, legibility, and performance.' },
          { question: 'Can these assets be optimized locally?', answer: 'Yes. The workflow can stay private and efficient while still producing platform-ready output.' }
        ]
      ),
      relatedRoutes: [
        { path: '/resize-image-to-1920x1080', label: 'Resize Image to 1920x1080' },
        { path: '/website-image-optimizer', label: 'Website Image Optimizer' },
        { path: '/compress-image', label: 'Compress Image Size' },
        { path: '/instagram-story-compressor', label: 'Instagram Story Compressor' }
      ]
    },
    '/government-image-upload-requirements': {
      title: 'Government Image Upload Requirements',
      metaTitle: 'Government Image Upload Requirements: How to Prepare Images for Forms and Portals',
      metaDescription: 'Understand common government image upload requirements and how to prepare files that meet size, format, and quality expectations.',
      guideContent: getEducationalEditorialContent(
        'Submission-ready image guide',
        'Why government forms often require tighter image rules',
        'Government portals frequently limit file size, resolution, and sometimes format. The practical goal is to keep the image readable, technically compliant, and free of unnecessary extras. That requires attention to file size, dimensions, and visual clarity.',
        'How to prepare files for submission workflows',
        'The best approach is to understand the exact portal instructions first, then prepare the image so it fits both the technical limits and the readability expectation. This avoids resubmissions, delays, and avoidable quality loss.',
        [
          'Review the portal instructions before resizing or converting the image.',
          'Keep the file within the required size, dimensions, and format constraints.',
          'Test the final output in the same way the portal will receive it.'
        ],
        [
          { question: 'Why do government portals have strict image requirements?', answer: 'Because they need consistent file sizes, readable documents, and a manageable workflow for large volumes of submissions.' },
          { question: 'What should I optimize first?', answer: 'Start with the required size limit, then focus on clarity and the correct dimensions.' },
          { question: 'Can I prepare these files locally?', answer: 'Yes. A local workflow helps protect sensitive images and keeps the process private.' }
        ]
      ),
      relatedRoutes: [
        { path: '/compress-image-under-100kb', label: 'Compress Image Under 100KB' },
        { path: '/compress-image-under-50kb', label: 'Compress Image Under 50KB' },
        { path: '/passport-photo-compressor', label: 'Passport Photo Compressor' },
        { path: '/compress-image-to-100kb', label: 'Compress Image to 100KB' }
      ]
    }
  };

  const educationalRoute = educationalRoutes[path];
  if (educationalRoute) {
    return {
      path,
      h1Title: educationalRoute.title,
      metaTitle: educationalRoute.metaTitle,
      metaDescription: educationalRoute.metaDescription,
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: educationalRoute.title, url: path },
      ],
      guideContent: educationalRoute.guideContent,
      relatedRoutes: educationalRoute.relatedRoutes,
      jsonLd: generateJsonLdSchemas(
        educationalRoute.title,
        educationalRoute.metaDescription,
        fullUrl,
        educationalRoute.guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: educationalRoute.title, url: fullUrl }],
        'resource'
      )
    };
  }

  // Generic fallback for any recognized list path
  const titleName = matchedListRoute ? matchedListRoute.label : path.replace(/[-/]/g, ' ').trim();
  const formattedTitle = titleName.charAt(0).toUpperCase() + titleName.slice(1);
  const routeCategory = matchedListRoute ? matchedListRoute.category : 'use-case';

  return {
    path,
    h1Title: formattedTitle,
    metaTitle: `${formattedTitle} | Private Offline Image Tool | Zapixal`,
    metaDescription: `${formattedTitle} with Zapixal. The workflow stays private, works locally in the browser, and helps users choose practical image settings for real-world use cases.`,
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: routeCategory,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: formattedTitle, url: path },
    ],
    guideContent: {
      ...getFallbackEditorialContent(formattedTitle),
      steps: [
        'Identify the exact image task you need to complete before changing any settings.',
        'Choose the output option that best matches the destination platform or upload rule.',
        'Review the output, keep the source file as a backup, and use the result only once it feels correct.'
      ]
    },
    jsonLd: generateJsonLdSchemas(
      formattedTitle,
      `${formattedTitle} with Zapixal's client-side WASM engine.`,
      fullUrl,
      [{ question: `Is ${formattedTitle} free?`, answer: 'Yes, 100% free and private.' }],
      [{ name: 'Home', url: '/' }, { name: formattedTitle, url: fullUrl }],
      routeCategory,
      [
        `Select images for ${formattedTitle}.`,
        'Configure options or target settings.',
        'Save processed outputs.'
      ]
    )
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
