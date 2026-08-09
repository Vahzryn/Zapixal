import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getConvertSvgToPngContent(): RouteEditorialContent {
  return {
    badge: 'Vector-to-Raster Engine',
    section1Title: 'Rasterizing Scalable Vector Graphics to crisp, high-DPI raster bitmaps',
    section1Body: 'SVG vector graphics offer infinite resolution scaling for web applications, but software like legacy image editors, email clients, social media platforms, and video editing suites often lack native SVG rendering support. Converting SVG to PNG requires precise DOM-to-Canvas rasterization that preserves path geometry, gradient fills, and transparent canvas backgrounds. Zapixal parses SVG XML trees inside a browser OffscreenCanvas, calculating exact viewports and rasterizing vectors to highly accurate PNG images at arbitrary target DPI resolutions.',
    section2Title: 'Custom DPI scaling and font embedding without external server rendering',
    section2Body: 'A frequent failure when converting SVG files using cloud conversion APIs is missing custom fonts or broken CSS stylesheets, resulting in default fallback typography and displaced elements. Zapixal renders SVG elements directly using your browser’s native Layout and Canvas 2D engines, ensuring embedded web fonts, CSS styling rules, and SVG clip-paths render exactly as authored. In addition, you can multiply the rasterization scale (e.g., 2x, 4x, or 8x) to produce crisp 4K or 8K PNG outputs without pixelation.',
    steps: [
      'Load your `.svg` vector file into the browser rasterization tool.',
      'Set your desired pixel output dimensions or resolution multiplier (1x, 2x, 4x, 8x).',
      'Export a high-resolution 32-bit transparent PNG instantly.'
    ],
    faqs: [
      makeFaq('Why do converted SVG images sometimes look blurry?', 'Many basic conversion processes default to a low fixed resolution. Zapixal allows you to specify custom pixel dimensions or scale multipliers up to 8x for razor-sharp rendering.'),
      makeFaq('Does converting SVG to PNG maintain transparent backgrounds?', 'Yes. Unfilled SVG root viewports automatically map to true 32-bit RGBA alpha transparency in the exported PNG.'),
      makeFaq('How does Zapixal handle inline SVG styles and embedded fonts?', 'Because conversion occurs natively in your browser DOM, all embedded CSS rules, web fonts, and inline style attributes render faithfully.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/convert-svg-to-png-transparent';
  const guideContent = getConvertSvgToPngContent();
    return {
      path,
      h1Title: 'Rasterize SVG Vector Graphics to High-DPI Transparent PNG',
      metaTitle: 'Convert SVG to Transparent PNG | Zapixal',
      metaDescription: 'Convert SVG vector files to crisp PNG images with transparency and custom DPI scale multipliers. Rendered locally in browser memory.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'converter',
      fromFormat: 'SVG',
      toFormat: 'png',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert SVG to PNG', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Rasterize SVG Vector Graphics to High-DPI Transparent PNG',
        'Convert vector SVG graphics to high-resolution PNG format locally in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Convert SVG to PNG', url: path }],
        'converter',
        guideContent.steps
      )
    };
}
