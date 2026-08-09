import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getLosslessJpegOptimizerContent(): RouteEditorialContent {
  return {
    badge: 'MozJPEG WebAssembly Engine',
    section1Title: 'High-fidelity JPEG optimization without visible quality loss',
    section1Body: 'Standard image editors often degrade image quality by increasing lossy Discrete Cosine Transform (DCT) quantization multipliers carelessly, causing muddy artifacts and ruined color gradients. Zapixal offers a high-fidelity visual optimization pass powered by MozJPEG compiled to WebAssembly. By employing advanced progressive encoding structure calculations, optimized color subsampling, and stripping redundant APP/COM metadata headers, file sizes drop by 10% to 25% while maintaining visually lossless, reference-grade quality.',
    section2Title: 'Progressive JPEG conversion for faster mobile web rendering',
    section2Body: 'In addition to entropy and scan table optimizations, Zapixal converts standard baseline JPEGs into progressive JPEGs. Progressive JPEGs load in multi-pass scans—rendering a low-resolution preview instantly before filling in crisp detail—which significantly improves perceived page load speed on slow mobile connections. All binary processing executes locally inside browser Web Workers without server latency or cloud privacy exposure.',
    steps: [
      'Load your JPEG photos or web assets into the optimizer.',
      'Enable MozJPEG progressive scan encoding and advanced quantization.',
      'Download lighter JPEGs with optimized visual fidelity and zero server uploads.'
    ],
    faqs: [
      makeFaq('Is JPEG re-encoding mathematically lossless?', 'No. While formats like PNG can be optimized mathematically losslessly, JPEG compression uses lossy Discrete Cosine Transform (DCT) algorithms. However, Zapixal uses MozJPEG to perform adaptive quantization that keeps these mathematical changes completely imperceptible to the human eye, yielding "visually lossless" results.'),
      makeFaq('What is the difference between baseline and progressive JPEGs?', 'Baseline JPEGs load top-to-bottom line by line. Progressive JPEGs display a full-frame blurred preview immediately and sharpen progressively in multiple passes.'),
      makeFaq('Is this optimization safe for high-res photography?', 'Yes. By keeping the quality setting high (90%+), MozJPEG preserves fine textures and sharp color boundaries, making it ideal for web delivery and portfolio displays.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/lossless-jpeg-optimizer-exif-preserve';
  const guideContent = getLosslessJpegOptimizerContent();
    return {
      path,
      h1Title: 'High-Fidelity JPEG Optimization & Progressive Encoding',
      metaTitle: 'High-Fidelity JPEG Optimizer via WebAssembly | Zapixal',
      metaDescription: 'Compress JPEG files by 10%-25% with visually lossless quality using MozJPEG compiled to WASM. Optimizes tables and converts to progressive scans in browser memory.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      toFormat: 'jpg',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'High-Fidelity JPEG Optimizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'High-Fidelity JPEG Optimization & Progressive Encoding',
        'Re-optimize JPEGs with visually lossless quality and convert to progressive JPEGs locally in browser RAM.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Lossless JPEG Optimizer', url: path }],
        'compression',
        guideContent.steps
      )
    };
}
