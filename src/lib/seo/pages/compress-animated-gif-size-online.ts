import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressAnimatedGifContent(): RouteEditorialContent {
  return {
    badge: 'GIF Format Support Status',
    section1Title: 'Static image optimization and GIF format limitations',
    section1Body: 'While animated GIFs are popular for looping sequences, standard browser rendering and local canvas constraints make client-side web-based manipulation of multi-frame animations highly resource-intensive. To maintain instant client-side performance, stability, and total privacy, Zapixal currently blocks GIF file uploads.',
    section2Title: 'Alternative workflows for static imagery',
    section2Body: 'If you are looking to optimize static graphics, we recommend converting your GIF files to modern formats like WebP or PNG using local desktop software before importing them into Zapixal. Once in a supported raster format, Zapixal can efficiently compress and resize them locally in your browser memory without any server-side round-trips.',
    steps: [
      'Use a desktop tool to convert your GIF file to a supported format (PNG, WebP, JPG).',
      'Upload the converted static image into the browser-side dropzone.',
      'Download the optimized, lightweight image directly to your local storage.'
    ],
    faqs: [
      makeFaq('Does Zapixal support GIF animations?', 'No. To maintain complete privacy and high browser-based performance without massive processing overhead, Zapixal currently blocks GIF file uploads entirely.'),
      makeFaq('Why are GIF files blocked?', 'Our privacy-first architecture runs entirely client-side using native Canvas APIs, which do not natively support reliable decoding of multi-frame GIF sequences. Handling them requires heavy processing that can cause client-side CPU lockups.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-animated-gif-size-online';
  const guideContent = getCompressAnimatedGifContent();
  
  return {
    path,
    h1Title: 'Compress Static GIF Images & Extract First-Frame Previews',
    metaTitle: 'Compress GIF File Size — Optimization Tool Information',
    metaDescription: 'Information about GIF file support limitations in Zapixal and alternative workflows for static image optimization.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'compression',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress GIF', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Compress Static GIF Images',
      'Information about GIF format support in Zapixal.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Compress GIF', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
