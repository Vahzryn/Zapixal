import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getBulkHeicContent(): RouteEditorialContent {
  return {
    badge: 'Parallel Multi-Core HEIC Decoder',
    section1Title: 'Freeing your Apple photo library with high-speed bulk conversion',
    section1Body: 'The transition from iPhone to non-Apple platforms is often blocked by the HEIC (High Efficiency Image Container) format. Converting hundreds of vacation photos or business documents one by one is a tedious bottleneck. Zapixal’s bulk HEIC to JPG converter solves this by utilizing your device’s multi-core CPU to process entire folders in parallel. By running libheif-powered decoders directly via WebAssembly in your browser, we can convert massive batches of Apple photos to universally compatible JPEGs in a fraction of the time required by cloud-based tools.',
    section2Title: 'Absolute privacy for your personal photo archives',
    section2Body: 'Personal photos are among the most sensitive data we own. Uploading an entire library to a remote server creates a massive privacy risk. Zapixal eliminates this risk by keeping the entire conversion cycle local. Your HEIC files are decoded and re-encoded into JPEGs entirely within your browser’s RAM—nothing is ever uploaded or stored on our servers. Our converter also supports preserving original EXIF metadata, ensuring your timestamps and camera settings remain intact in the new JPEG files, giving you a smooth transition with zero privacy compromises.',
    steps: [
      'Select a batch of HEIC files or a whole folder from your device.',
      'Configure JPEG quality and choose whether to preserve metadata.',
      'Download your converted JPG ZIP or individual files instantly.'
    ],
    faqs: [
      makeFaq('Can I convert 100+ HEIC files at once?', 'Yes. Zapixal is designed for high-throughput bulk processing. We utilize Web Workers to process multiple files concurrently using your local hardware.'),
      makeFaq('Why use an offline converter for HEIC?', 'Speed and privacy. Offline conversion avoids the slow process of uploading large HEIC files to a server and keeps your personal photos strictly on your own device.'),
      makeFaq('Will my iPhone photos lose quality when converted to JPG?', 'HEIC is a highly efficient format. When converting to JPG, there is a minor re-encoding pass, but Zapixal uses high-quality MozJPEG settings to ensure the visual difference is imperceptible.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/bulk-heic-to-jpg-converter-offline';
  const guideContent = getBulkHeicContent();
  return {
    path,
    h1Title: 'Bulk HEIC to JPG Converter: Fast, Private & Offline Batching',
    metaTitle: 'Bulk HEIC to JPG Converter — Fast Offline Batching',
    metaDescription: 'Convert entire folders of iPhone HEIC photos to JPG instantly. Parallel multi-core processing running 100% locally in your browser. No uploads, total privacy.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    toFormat: 'jpg',
    pageCategory: 'converter',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Bulk HEIC to JPG', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'High-Speed Batch HEIC to JPG Conversion',
      'Convert Apple HEIC photos to standard JPG format in bulk. Privacy-focused local processing using multi-threaded WebAssembly decoders.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Bulk HEIC to JPG', url: path }],
      'converter',
      guideContent.steps
    )
  };
}
