import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressTo200kbContent(): RouteEditorialContent {
  return {
    badge: 'Precise 200KB Ceiling Optimizer',
    section1Title: 'Dialing in the perfect 200KB image for web and mobile',
    section1Body: 'The 200KB threshold is a standard requirement for many modern web platforms, profile systems, and email marketing tools. It represents the "sweet spot" where high-resolution imagery meets fast loading performance. Zapixal’s 200KB target-size engine allows you to optimize your assets with surgical precision. By iterating through compression levels locally in your browser, we ensure that your file stays strictly under 200KB while preserving the maximum possible visual fidelity for your users.',
    section2Title: 'High-DPI results within a strict 200KB byte budget',
    section2Body: 'Compressing to 200KB doesn’t have to mean sacrificing quality. Zapixal utilizes modern WebP and JPEG encoders that prioritize edge sharpness and color accuracy. Our local processing model means you can test different target sizes and formats in seconds, seeing the results instantly without any upload latency. Whether you are prepping a professional CV photo or an e-commerce thumbnail, our tool guarantees that you hit your 200KB target every time, with 100% data privacy guaranteed.',
    steps: [
      'Enable "Target Size" mode and input 200KB as your limit.',
      'Drop your images into the local processing zone.',
      'Download your optimized 200KB files, ready for high-performance deployment.'
    ],
    faqs: [
      makeFaq('Is 200KB enough for a clear, high-res photo?', 'Yes, for most web and mobile applications, 200KB is sufficient to maintain excellent visual clarity when using modern compression like WebP or high-quality JPEG.'),
      makeFaq('How does Zapixal guarantee the 200KB limit?', 'Our engine performs multiple "mini-encodes" in local memory to find the highest quality setting that results in a file size just below 200KB.'),
      makeFaq('Can I bulk-compress multiple images to 200KB?', 'Absolutely. You can drop a batch of files and Zapixal will process each one to meet the 200KB constraint concurrently.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-image-to-200kb-online';
  const guideContent = getCompressTo200kbContent();
  return {
    path,
    h1Title: 'Compress Image to 200KB: Free Target-Size Optimization',
    metaTitle: 'Compress Image to 200KB — Free KB Target Tool',
    metaDescription: 'Optimize your photos for a 200KB limit without quality loss. Use our precise target-size engine to hit 200KB goals locally. Fast, free, and private.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'compression',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress to 200KB', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Precision 200KB Image Optimization',
      'Meet 200KB file size requirements for web and mobile with our high-fidelity local compression engine.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Compress to 200KB', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
