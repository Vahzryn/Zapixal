import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getHighResImageResizerContent(): RouteEditorialContent {
  return {
    badge: 'OffscreenCanvas & Chunked Memory Allocation',
    section1Title: 'Downscaling ultra-high-resolution photos without browser tab crashes',
    section1Body: 'Modern DSLR, mirrorless, and smartphone camera sensors produce 24MP to 100MP photos exceeding 6000x4000 pixels. Directly loading high-resolution rasters into a standard HTML canvas can trigger browser Out-Of-Memory (OOM) errors. Zapixal employs OffscreenCanvas and sub-sampled rendering tiles in Web Workers, downscaling multi-megapixel images efficiently in local RAM without locking the main browser thread.',
    section2Title: 'Sub-pixel interpolation for crisp edge retention on large rasters',
    section2Body: 'Standard linear interpolation often introduces blurriness or stair-step aliasing artifacts when downscaling 4K or 8K images. Zapixal utilizes multi-pass bicubic sub-pixel downscaling to preserve fine text, hair details, and architectural lines. Because computation is distributed across local CPU threads, high-resolution photos resize in seconds without network latency or privacy leaks.',
    steps: [
      'Load high-resolution camera or design files into the browser resizer.',
      'Specify target pixel dimensions or percentage scaling while maintaining aspect ratio.',
      'Export crisp resized images directly to your local drive without external data transfers.'
    ],
    faqs: [
      makeFaq('Can this tool resize 50MP camera RAW exports or 8K screenshots?', 'Yes. Zapixal handles large high-resolution images using chunked memory allocation and OffscreenCanvas workers.'),
      makeFaq('Why does downscaling high-res images sometimes cause blurriness?', 'Basic resizers drop pixel rows abruptly. Zapixal uses multi-stage interpolation passes to preserve edge sharpness.'),
      makeFaq('Is there a file size limit when downscaling photos locally?', 'Limits are governed by your device RAM. Most modern desktop and mobile browsers easily handle 50MB+ photos.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/high-res-image-resizer-client-side';
  const guideContent = getHighResImageResizerContent();
  return {
    path,
    h1Title: 'High-Resolution Image Resizer: Fast Client-Side Scaling',
    metaTitle: 'High-Res Image Resizer Client-Side | Zapixal',
    metaDescription: 'Resize high-resolution 4K and 24MP+ photos in browser memory. Sub-pixel interpolation preserves fine detail with zero remote data transfers.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'High-Res Image Resizer', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'High-Resolution Image Resizer: Fast Client-Side Scaling',
      'Downscale large DSLR and 4K photos directly in browser RAM with multi-stage sub-pixel interpolation.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'High-Res Image Resizer', url: path }],
      'use-case',
      guideContent.steps
    )
  };
}
