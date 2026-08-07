import { TargetFormat } from '../types';
import { PSEO_ROUTES_LIST, DOMAIN } from './seo/routes';

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

const educationalRoutesLight: Record<string, { title: string; metaTitle: string; metaDescription: string }> = {
  '/jpeg-vs-png': {
    title: 'JPEG vs PNG',
    metaTitle: 'JPEG vs PNG: Which Format Is Better for Photos and Graphics?',
    metaDescription: 'Learn when to use JPEG vs PNG for photos, graphics, transparency, and web delivery. The guide explains real-world tradeoffs and links to the right tool.'
  },
  '/heic-explained': {
    title: 'HEIC Explained',
    metaTitle: 'HEIC Explained: Why Apple Photos Use This Format',
    metaDescription: 'Understand HEIC and HEIF, why Apple uses them, and when converting to JPG or PNG makes more sense for sharing and uploads.'
  },
  '/webp-explained': {
    title: 'WebP Explained',
    metaTitle: 'WebP Explained: Why This Modern Format Matters for Websites',
    metaDescription: 'Learn what WebP is, why it is efficient for web delivery, and when converting to PNG or JPG is the better choice.'
  },
  '/avif-explained': {
    title: 'AVIF Explained',
    metaTitle: 'AVIF Explained: A Next-Gen Format for Modern Performance',
    metaDescription: 'See how AVIF compares to JPEG, PNG, and WebP, and understand when this high-efficiency format is worth using.'
  },
  '/how-image-compression-works': {
    title: 'How Image Compression Works',
    metaTitle: 'How Image Compression Works: Quality, Size, and Tradeoffs',
    metaDescription: 'Learn how image compression works, why it changes file size, and how to choose the right balance between quality and performance.'
  },
  '/what-is-exif': {
    title: 'What Is EXIF',
    metaTitle: 'What Is EXIF: Metadata in Camera Photos and Why It Matters',
    metaDescription: 'Learn what EXIF data is, what it can reveal, and how to remove it when you want more privacy or cleaner uploads.'
  },
  '/image-dpi-guide': {
    title: 'Image DPI Guide',
    metaTitle: 'Image DPI Guide: What DPI Means and When It Matters',
    metaDescription: 'Understand image DPI, how it differs from pixel dimensions, and which workflows actually depend on it.'
  },
  '/color-profiles-explained': {
    title: 'Color Profiles Explained',
    metaTitle: 'Color Profiles Explained: ICC, sRGB, and Color Management',
    metaDescription: 'Learn what color profiles are, why they matter, and how to avoid mismatched colors when preparing images for web and print.'
  },
  '/rgb-vs-cmyk': {
    title: 'RGB vs CMYK',
    metaTitle: 'RGB vs CMYK: Which Color Mode Should You Use?',
    metaDescription: 'Understand the difference between RGB and CMYK and choose the right color mode for screen, print, and design work.'
  },
  '/image-dimensions-guide': {
    title: 'Image Dimensions Guide',
    metaTitle: 'Image Dimensions Guide: Width, Height, and Resolution Explained',
    metaDescription: 'Learn how image dimensions affect layout, web performance, and print quality, and where resizing fits into a better workflow.'
  },
  '/social-media-image-size-guide': {
    title: 'Social Media Image Size Guide',
    metaTitle: 'Social Media Image Size Guide: Sizes for Facebook, Instagram, LinkedIn, and More',
    metaDescription: 'Learn the image size requirements for major social platforms and prepare assets that look sharp without wasting bandwidth.'
  },
  '/government-image-upload-requirements': {
    title: 'Government Image Upload Requirements',
    metaTitle: 'Government Image Upload Requirements: How to Prepare Images for Forms and Portals',
    metaDescription: 'Understand common government image upload requirements and how to prepare files that meet size, format, and quality expectations.'
  }
};

export function parseSeoRoute(pathname: string): SeoRouteData {
  const rawPath = (pathname || '/').split('?')[0].split('#')[0].toLowerCase().trim();
  const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : (rawPath || '/');
  const fullUrl = `${DOMAIN}${path === '/' ? '' : path}`;

  if (path === '/' || path === '') {
    return {
      path: '/',
      h1Title: '100% Free Client-Side Batch Image Converter & Compressor',
      metaTitle: 'Free Offline Image Converter & Compressor | 100% Private | Zapixal',
      metaDescription: 'Convert, compress, and optimize HEIC, PNG, JPG, WebP, AVIF, SVG, and PDF files locally in your browser. Zapixal keeps images private, supports batch work, and helps you choose the right format for the job.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'home',
      breadcrumbs: [{ name: 'Home', url: '/' }]
    };
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
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }]
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
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms' }]
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
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]
    };
  }

  if (path === '/tools') {
    return {
      path,
      h1Title: 'All Preset Image Tools',
      metaTitle: 'All Offline Image Presets & Tools Directory | Zapixal',
      metaDescription: 'Browse our complete directory of offline, client-side batch image converters and compressors. Optimize under 50KB, 100KB, or convert instantly.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Tools Directory', url: '/tools' }]
    };
  }

  // 1. Compression pattern
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
        { name: `Compress Under ${titleFormat}`, url: path }
      ]
    };
  }

  // 2. Convert pattern
  const convertMatch = path.match(/^\/(?:convert-)?([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (convertMatch) {
    const fromFmtRaw = convertMatch[1].toLowerCase();
    const toFmtRaw = convertMatch[2].toLowerCase();
    const whitelist = ['heic', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'ico', 'pdf', 'bmp', 'tiff', 'svg', 'gif'];

    if (whitelist.includes(fromFmtRaw) && whitelist.includes(toFmtRaw)) {
      const fromFmt = fromFmtRaw.toUpperCase();
      const toFmtUpper = toFmtRaw.toUpperCase();
      const toFormat: TargetFormat = (['jpg', 'png', 'webp', 'avif', 'ico', 'pdf'].includes(toFmtRaw) ? toFmtRaw : 'jpg') as TargetFormat;

      return {
        path,
        h1Title: `Free Offline Batch ${fromFmt} to ${toFmtUpper} Converter`,
        metaTitle: `Convert ${fromFmt} to ${toFmtUpper} Offline | Private Batch Image Converter | Zapixal`,
        metaDescription: `Convert ${fromFmt} to ${toFmtUpper} locally in your browser with Zapixal. The workflow stays private, supports batch work, and helps you choose a practical output format for web, sharing, or uploads.`,
        canonicalUrl: fullUrl,
        isIndexable: true,
        pageCategory: 'converter',
        fromFormat: fromFmtRaw,
        toFormat,
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: `${fromFmt} to ${toFmtUpper}`, url: path }
        ]
      };
    }
  }

  // Educational Routes
  const eduRoute = educationalRoutesLight[path];
  if (eduRoute) {
    return {
      path,
      h1Title: eduRoute.title,
      metaTitle: eduRoute.metaTitle,
      metaDescription: eduRoute.metaDescription,
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: eduRoute.title, url: path }
      ]
    };
  }

  // Fallback to static lists
  const matchedListRoute = PSEO_ROUTES_LIST.find((r) => r.path === path);
  if (matchedListRoute) {
    const titleName = matchedListRoute.label;
    const formattedTitle = titleName.charAt(0).toUpperCase() + titleName.slice(1);
    const routeCategory = matchedListRoute.category;

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
        { name: formattedTitle, url: path }
      ]
    };
  }

  // Not found
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
      { name: 'Not Found', url: path }
    ]
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
