import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getAiCompressorContent(): RouteEditorialContent {
  return {
    badge: 'Private & Adaptive WASM Compression',
    section1Title: 'Beyond generic tools: Adaptive local optimization',
    section1Body: 'While many image compressors are merely cloud-based wrappers for basic scripts, Zapixal utilizes deterministic local quantization logic to provide an adaptive optimization experience. Our engine evaluates your image to apply optimal compression—whether it’s a detailed landscape or a sharp UI screenshot. By executing this logic entirely via WebAssembly within your browser, we provide a highly efficient compression result that rivals cloud-based tools while maintaining client-side data privacy.',
    section2Title: 'The privacy-first alternative to invasive cloud tools',
    section2Body: 'The primary risk of modern web tools is the collection and storage of your personal data. Zapixal rejects this model entirely. When you use our local compression pipeline, your original files never leave your device. Our local encoders utilize high-fidelity mathematics and entropy optimization to shrink your files without the "mushy" artifacts often introduced by low-bitrate cloud generators. You get the benefits of small-footprint image assets without the security trade-offs of the cloud.',
    steps: [
      'Drop your images into the private optimized queue.',
      'Adjust the quality parameters while our local engine computes the optimal quantization matrix.',
      'Export your compressed assets directly from your browser memory.'
    ],
    faqs: [
      makeFaq('Does this use AI?', 'No. Zapixal uses sophisticated, adaptive mathematical algorithms and deterministic quantization matrices that are optimized to run locally on your machine.'),
      makeFaq('How is this more private than cloud tools?', 'Cloud tools require you to upload your images to their servers, where they may be stored or used for data mining. Zapixal processes every pixel in your local RAM; your files never touch a server.'),
      makeFaq('Does adaptive compression make my photos look fake?', 'No. Our adaptive optimization is designed to preserve natural textures and sharp edges. It simply removes the data that the human eye cannot perceive.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/ai-image-compressor-online-private';
  const guideContent = getAiCompressorContent();
  return {
    path,
    h1Title: 'Adaptive Image Compressor: Private Local Optimization',
    metaTitle: 'Adaptive Image Compressor — Private Client-Side Tool',
    metaDescription: 'Experience adaptive image compression without the privacy risks of the cloud. Adaptive local optimization for PNG, JPEG, and WebP. 100% Client-Side.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'compression',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Adaptive Compressor', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Adaptive Local Image Compression',
      'A privacy-first alternative to cloud compressors. Adaptive, adaptive image optimization running 100% locally in your browser.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Adaptive Compressor', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
