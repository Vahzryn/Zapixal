import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getReduceTo1mbContent(): RouteEditorialContent {
  return {
    badge: 'High-Fidelity 1MB Target',
    section1Title: 'Achieving the 1MB threshold for professional web assets',
    section1Body: 'The 1 megabyte (1MB) limit is a common standard across corporate portals, CMS systems, and email marketing platforms. It represents a professional baseline for high-resolution images that need to remain sharp while avoiding excessive bandwidth consumption. Zapixal’s 1MB target-size tool provides a high-fidelity path to meeting this requirement. By using iterative local re-encoding, we find the highest possible quality setting that fits strictly within a 1MB budget, ensuring your photos and documents look great without being rejected for size.',
    section2Title: 'Precision compression for high-DPI and Retina displays',
    section2Body: 'When targeting 1MB, you have enough byte-budget to preserve significant detail, even for high-DPI and Retina displays. Zapixal’s WASM-powered encoders excel at balancing this trade-off. We prioritize fine textures and color accuracy, ensuring that your 1MB output maintains a premium look. Because the entire optimization happens in your browser’s local RAM, you can experiment with different formats (WebP vs JPEG) to see which yields the best visual results for your specific 1MB goal, all while keeping your data strictly in local browser memory.',
    steps: [
      'Enter "Target Size" mode and set the limit to 1MB.',
      'Drop your high-resolution images into the browser processing area.',
      'Download your perfectly sized 1MB files for instant professional use.'
    ],
    faqs: [
      makeFaq('How can I reduce an image to exactly 1MB?', 'Zapixal’s target-size engine allows you to input "1MB" as your goal. Our tool then automatically calculates the optimal compression locally to hit that target.'),
      makeFaq('Is 1MB enough for a high-quality photo?', 'Yes, 1MB is a generous budget for most web-use cases and allows for high-quality, sharp imagery even on large screens.'),
      makeFaq('Why use Zapixal for 1MB reduction?', 'Most tools guess or use low-quality presets. Zapixal uses precise, iterative local encoding to maximize quality within the 1MB constraint.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/reduce-image-size-to-1mb-online';
  const guideContent = getReduceTo1mbContent();
  return {
    path,
    h1Title: 'Reduce Image Size to 1MB: Free High-Fidelity Optimization',
    metaTitle: 'Reduce Image Size to 1MB — Free KB/MB Target Tool',
    metaDescription: 'Need to get an image under 1MB? Our precision target-size tool shrinks photos and scans to exactly 1MB while preserving high-fidelity detail. 100% Client-Side.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'compression',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Reduce to 1MB', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Precision 1MB Image Reduction',
      'Hit the 1MB file size requirement with our high-fidelity local compression engine. Balanced for quality and performance.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Reduce to 1MB', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
