import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getConvertHdrHeicToPngContent(): RouteEditorialContent {
  return {
    badge: 'HDR & Alpha Extraction',
    section1Title: 'Extract multi-channel iPhone HEIC layers with original alpha contours intact',
    section1Body: 'Newer iOS devices capture photos with complex multi-channel data, occasionally embedding alpha transparency channels, portrait depth masks, or wide gamut HDR color mappings inside High Efficiency Image Container (.heic) files. Standard, basic online converters struggle with these proprietary extensions, flattening transparent elements to solid black bounds or washing out rich color definitions. Zapixal uses a WASM-compiled libheif decoder directly inside your browser to parse the underlying HEVC container and isolate individual alpha arrays locally, preserving translucent contours with precision.',
    section2Title: 'Accurate Display P3 color space mapping without server-side rendering',
    section2Body: 'A persistent issue with cloud conversion tools is the compression and flattening of wide-gamut Display P3 colors down to basic sRGB channels, which leaves skin tones and landscapes looking flat. Zapixal’s client-side processing pipeline reads the original embedded color profile parameters and performs precise coordinate maps on your local CPU. Because Web Workers isolate the heavy decoding threads, you can drag and drop multiple high-depth HEIC assets at once without locking up your browser’s main rendering process.',
    steps: [
      'Load your iPhone .heic files containing transparent backgrounds or HDR depths into the browser window.',
      'Select PNG with alpha channels enabled as your target export format.',
      'Let the local WASM decoder rasterize your layers and download your transparent PNG files.'
    ],
    faqs: [
      makeFaq('Do iPhone HEIC images contain transparent layers?', 'Yes, certain portrait captures, live sticker creations, or cropped objects on iOS 16+ store alpha transparency details inside the HEIC container. Zapixal is designed to detect and preserve these transparency masks during conversion.'),
      makeFaq('Will converting HDR HEIC files distort my colors?', 'No. Instead of applying raw linear clipping, Zapixal maps embedded Display P3 wide-color properties to standard sRGB channels, maintaining color accuracy across different displays.'),
      makeFaq('Is my private photo stream processed securely?', 'Absolutely. The entire parsing, color-mapping, and rasterization process occurs in-browser on your machine. Your photos are never sent to external servers, protecting your private files and camera details.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/convert-hdr-heic-to-png-transparency';
  const guideContent = getConvertHdrHeicToPngContent();
  return {
    path,
    h1Title: 'Convert HDR HEIC to PNG with Transparency Online',
    metaTitle: 'Convert iPhone HEIC to PNG — Preserve Transparency',
    metaDescription: 'Convert iPhone HEIC captures to high-depth transparent PNG files. Extract embedded alpha channels and Display P3 profiles locally via browser WebAssembly.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    toFormat: 'png',
    pageCategory: 'converter',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Convert HEIC to PNG', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Convert HDR HEIC to PNG with Transparency Online',
      'Convert iPhone HEIC captures to high-depth transparent PNG files and extract alpha channels locally.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Convert HEIC to PNG', url: path }],
      'converter',
      guideContent.steps
    )
  };
}
