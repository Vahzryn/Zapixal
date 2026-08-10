import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressTo100kbContent(): RouteEditorialContent {
  return {
    badge: 'Guaranteed 100KB Target Hit',
    section1Title: 'Meeting strict 100KB limits with precision local re-encoding',
    section1Body: 'Many online portals—ranging from government applications to educational entrance exams—impose a hard ceiling of exactly 100KB for document and photo uploads. Hitting this target manually is frustrating and often leads to blurry, unreadable results. Zapixal simplifies this by providing a dedicated 100KB target-size engine. Instead of guessing quality levels, our tool uses an iterative "bisection" algorithm to find the exact maximum quality that fits within your 100KB budget, processing everything instantly in your browser RAM.',
    section2Title: 'Balancing resolution and byte-count for official submissions',
    section2Body: 'When compressing to 100KB, it is vital to keep text and facial features sharp. Generic compressors often over-optimize, turning your important documents into a mess of pixels. Zapixal’s local optimization allows you to preview the result in real-time, ensuring that while you stay under the 100KB limit, the visual integrity remains intact for official review. Because we use WebAssembly-powered codecs, we can dial in the bitstream parameters with surgical precision, giving you the clearest possible file for your sub-100KB requirement.',
    steps: [
      'Select the "Target Size" mode and set the limit to 100KB.',
      'Drop your high-resolution scan or photo into the queue.',
      'Download your perfectly sized 100KB file, ready for instant portal submission.'
    ],
    faqs: [
      makeFaq('How can I compress an image to exactly 100KB?', 'Zapixal allows you to specify a target size of 100KB. Our engine then automatically adjusts compression parameters locally until the output matches your goal.'),
      makeFaq('Will my image be too blurry at 100KB?', 'It depends on the original resolution, but Zapixal uses advanced quantization to preserve as much detail as possible. You can also resize the image dimensions to help meet the 100KB target with better clarity.'),
      makeFaq('Is it safe to compress official documents here?', 'Yes. Zapixal is privacy-first. Your documents are never uploaded to a server; all processing happens in your browser’s local sandbox.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-image-to-100kb-online';
  const guideContent = getCompressTo100kbContent();
  return {
    path,
    h1Title: 'Compress Image to 100KB: Free Precision Target Sizing',
    metaTitle: 'Compress Image to 100KB | Free Precision Target Sizing | Zapixal',
    metaDescription: 'Need an image under 100KB? Use our precision target-size tool to compress photos and scans to exactly 100KB without losing readability. 100% Client-Side.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'compression',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress to 100KB', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Precision 100KB Image Compression',
      'Hit strict 100KB upload limits with our iterative local compression engine. Perfect for government and application portals.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Compress to 100KB', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
