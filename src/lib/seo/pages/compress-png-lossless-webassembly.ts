import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressPngLosslessContent(): RouteEditorialContent {
  return {
    badge: 'WebAssembly PNG Engine',
    section1Title: 'Optimizing PNG filtering and DEFLATE streams without pixel loss',
    section1Body: 'Portable Network Graphics (PNG) images utilize lossless DEFLATE compression alongside predictive delta filtering (Sub, Up, Average, and Paeth) to store pixel arrays. Standard graphic software often uses default, low-effort filter selections to speed up saving, leaving massive amounts of redudant data inside the IDAT chunk stream. Zapixal executes WebAssembly-powered PNG encoders directly inside your browser’s RAM. By re-evaluating combination passes of adaptive filtering strategies and LZ77 sliding window parameters, our WASM engine (UPNG) squeezes out maximum byte savings, ensuring that lossless PNG compression preserves the decoded image pixels while optimizing the PNG representation. If you choose palette quantization for dramatic size reductions, our Imagequant WASM engine delivers a visually lossless output with fully preserved alpha transparency.',
    section2Title: 'Palette reduction, ancillary chunk pruning, and client-side execution',
    section2Body: 'Beyond DEFLATE stream optimization, significant PNG bloating stems from unnecessary ancillary metadata chunks—such as iCCP color profiles, sRGB tags, pHYs resolution metadata, and uncompressed tEXt commentary tags. Zapixal analyzes the raw image color buffer to identify whether an uncompressed 32-bit RGBA image actually uses fewer than 256 unique colors. If so, it transparently converts the file to a lossless indexed palette representation without dropping visual fidelity. Because these multi-pass heuristics execute entirely within local browser Web Workers, your master UI design assets and software screenshots are optimized securely without risking exposure to cloud logging.',
    steps: [
      'Drop your original PNG assets into the browser optimization pipeline.',
      'Select lossless optimization level to trigger WebAssembly compression filters.',
      'Download smaller, pixel-perfect PNG files with zero visual artifacts.'
    ],
    faqs: [
      makeFaq('What is the difference between lossy and lossless PNG compression?', 'Lossy compression reduces file size by reducing the total color palette or grouping similar colors, slightly altering pixel values. Lossless compression re-organizes data structure, filtering, and DEFLATE streams so that the decoded pixel grid remains mathematically identical to the original.'),
      makeFaq('How much file size reduction can I expect from lossless PNG optimization?', 'Depending on how inefficiently the original file was exported, lossless optimization typically yields 10% to 45% file size savings without altering a single pixel.'),
      makeFaq('Does lossless PNG optimization remove alpha channel transparency?', 'No. Full 8-bit alpha channel transparency and anti-aliased edge values are preserved completely intact throughout the optimization process.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-png-lossless-webassembly';
  const guideContent = getCompressPngLosslessContent();
    return {
      path,
      h1Title: 'WebAssembly Lossless PNG Optimization without Pixel Quality Loss',
      metaTitle: 'Lossless PNG Compressor — Client-Side WebAssembly',
      metaDescription: 'Optimize PNG images losslessly using Imagequant and UPNG compiled to WASM. Re-evaluates DEFLATE streams and delta filters with 0% visual degradation.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Lossless PNG Compressor', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'WebAssembly Lossless PNG Optimization without Pixel Quality Loss',
        'Optimize PNG images losslessly using Imagequant and UPNG compiled to WebAssembly locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Lossless PNG Compressor', url: path }],
        'compression',
        guideContent.steps
      )
    };
}
