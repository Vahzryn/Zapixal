import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressScreenshotPngContent(): RouteEditorialContent {
  return {
    badge: 'Pngquant 8-bit Palette Quantizer',
    section1Title: 'Shrinking multi-megabyte 4K and Retina PNG screenshots fast',
    section1Body: 'High-DPI Retina displays on macOS and Windows capture screenshots at double pixel density, producing bloated 5MB to 15MB PNG files. These large files exceed email attachment bounds and messaging limits. Zapixal uses Pngquant WebAssembly binaries to convert 24-bit RGBA PNG screenshots into optimized 8-bit indexed palette PNGs, cutting file size by 60% to 80% while keeping UI text razor sharp.',
    section2Title: 'Preserving crisp UI text and interface clarity locally',
    section2Body: 'Standard JPEG compression introduces ringing artifacts and mosquito noise around sharp text characters in screenshots. Palette-based PNG quantizing reduces bit depth without blurring crisp vector typography, UI buttons, or code snippets. Because processing runs entirely in your local browser RAM, confidential screenshots containing internal code or staging URLs remain isolated in local memory.',
    steps: [
      'Paste or drag PNG screenshots into the browser compressor.',
      'Apply 8-bit palette quantizing or WebP conversion to shrink byte size.',
      'Download compact, crisp screenshots under 500KB with zero network transmission.'
    ],
    faqs: [
      makeFaq('Why are macOS and Windows 4K screenshots so large in file size?', 'Retina and High-DPI screens record double the pixel density, saving screenshots as 24-bit uncompressed PNG rasters.'),
      makeFaq('Why is PNG quantizing better than JPEG compression for screenshots?', 'JPEG creates blurry noise around sharp text. PNG palette quantizing reduces byte size by up to 80% while keeping text crisp.'),
      makeFaq('Will my sensitive screenshots or credentials be transmitted externally?', 'No. All quantization runs locally inside your browser memory using client-side WebAssembly.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-screenshot-png-size-fast';
  const guideContent = getCompressScreenshotPngContent();
  return {
    path,
    h1Title: 'Compress PNG Screenshots Fast: Keep UI Text Razor Sharp',
    metaTitle: 'Compress Screenshot PNG — Fast Client-Side Tool',
    metaDescription: 'Shrink Retina and 4K PNG screenshots by 60-80% in browser memory. Preserves crisp text and UI details with zero external data transfers.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'compression',
    fromFormat: 'PNG',
    toFormat: 'png',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress PNG Screenshots Fast', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Compress PNG Screenshots Fast: Keep UI Text Razor Sharp',
      'Shrink Retina and High-DPI PNG screenshots by 60-80% in browser memory using 8-bit palette quantization.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Compress PNG Screenshots Fast', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
