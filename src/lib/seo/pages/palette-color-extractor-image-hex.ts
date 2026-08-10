import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getPaletteColorExtractorContent(): RouteEditorialContent {
  return {
    badge: 'K-Means Color Quantization Engine',
    section1Title: 'Extracting dominant brand HEX and RGB color palettes from imagery',
    section1Body: 'Designers, frontend developers, and brand managers frequently need to extract exact dominant color codes from photos, logos, or UI mockups. Manual eyedropper tools are slow and miss dominant color clusters. Zapixal uses K-Means color quantization algorithms directly on raw RGBA canvas pixel buffers, identifying major dominant palette clusters and generating copyable HEX and RGB values in milliseconds.',
    section2Title: 'Client-side pixel analysis without external network transfers',
    section2Body: 'Proprietary brand guidelines, unreleased UI designs, and client creative assets should not be transferred to third-party web tools. Zapixal parses image color histograms locally within your browser tab. Dominant color extraction occurs instantly in local RAM, giving you immediate access to exact color codes without network data transmission.',
    steps: [
      'Drop your photo or design graphic into the color palette analyzer.',
      'Instantly view dominant color swatches categorized by pixel frequency.',
      'Copy exact HEX, RGB, and HSL color strings to your clipboard with one click.'
    ],
    faqs: [
      makeFaq('How does Zapixal calculate dominant colors from an image?', 'Zapixal samples RGBA pixel arrays across the image canvas and applies color quantization algorithms to group similar hues into dominant color clusters.'),
      makeFaq('Can I extract color codes from high-resolution UI mocks or RAW photos?', 'Yes. Sampling is performed locally on the HTML5 Canvas buffer, handling multi-megapixel graphics in milliseconds.'),
      makeFaq('Are my brand assets or images transferred across a network during color extraction?', 'No. Color extraction algorithms execute 100% locally in your browser RAM.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/palette-color-extractor-image-hex';
  const guideContent = getPaletteColorExtractorContent();
  return {
    path,
    h1Title: 'Extract Dominant Color Palette & HEX Codes Client-Side',
    metaTitle: 'Image Color Palette Hex Extractor — In-Browser Tool',
    metaDescription: 'Extract dominant HEX and RGB color palettes from images instantly in browser memory. Local quantization with zero network transfers.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'resource',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Color Palette Extractor', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Extract Dominant Color Palette & HEX Codes Client-Side',
      'Extract exact dominant HEX and RGB color codes from images directly in browser RAM with local color quantization.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Color Palette Extractor', url: path }],
      'resource',
      guideContent.steps
    )
  };
}
