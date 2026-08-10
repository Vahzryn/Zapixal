import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getAiCompressorContent(): RouteEditorialContent {
  return {
    badge: 'Private & Intelligent WASM Compression',
    section1Title: 'Beyond generic AI: Content-aware local optimization',
    section1Body: 'While many "AI" image compressors are merely cloud-based wrappers for basic scripts, Zapixal utilizes sophisticated local quantization logic to provide an intelligent, content-aware optimization experience. Our engine re-evaluates every pixel cluster to determine the optimal compression tables for your specific image—whether it’s a detailed landscape or a sharp UI screenshot. By executing this logic entirely via WebAssembly within your browser, we provide a "smart" compression result that rivals cloud-based AI tools while maintaining client-side data privacy.',
    section2Title: 'The privacy-first alternative to invasive cloud AI tools',
    section2Body: 'The primary risk of modern AI-powered web tools is the collection and storage of your personal data for model training. Zapixal rejects this model entirely. When you use our "AI" compression pipeline, your original files never leave your device. Our local encoders utilize high-fidelity mathematics and entropy optimization to shrink your files without the "mushy" artifacts often introduced by low-bitrate cloud AI generators. You get the benefits of intelligent, small-footprint image assets without the security trade-offs of the cloud.',
    steps: [
      'Drop your images into the private AI-optimized queue.',
      'Adjust the quality parameters while our local engine computes the optimal quantization matrix.',
      'Export your intelligently compressed assets directly from your browser memory.'
    ],
    faqs: [
      makeFaq('Is this real AI compression?', 'Zapixal uses sophisticated, content-aware mathematical algorithms and quantization matrices that function similarly to the "intelligent" logic found in AI tools, but optimized to run locally on your machine.'),
      makeFaq('How is this more private than cloud AI tools?', 'Cloud AI tools require you to upload your images to their servers, where they may be stored or used for training. Zapixal processes every pixel in your local RAM; your files never touch a server.'),
      makeFaq('Does "AI" compression make my photos look fake?', 'No. Our intelligent optimization is designed to preserve natural textures and sharp edges. It simply removes the data that the human eye cannot perceive.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/ai-image-compressor-online-private';
  const guideContent = getAiCompressorContent();
  return {
    path,
    h1Title: 'AI Image Compressor: Private & Intelligent Local Optimization',
    metaTitle: 'AI Image Compressor | Private & Intelligent Optimization | Zapixal',
    metaDescription: 'Experience intelligent image compression without the privacy risks of the cloud. Content-aware local optimization for PNG, JPEG, and WebP. 100% Client-Side.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'compression',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'AI Compressor', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Intelligent Local Image Compression',
      'A privacy-first alternative to cloud AI compressors. Intelligent, content-aware image optimization running 100% locally in your browser.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'AI Compressor', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
