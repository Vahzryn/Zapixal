import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getShopifyOptimizerContent(): RouteEditorialContent {
  return {
    badge: '100% Free Shopify Bulk Optimizer',
    section1Title: 'Maximizing Shopify store speed with high-fidelity bulk optimization',
    section1Body: 'Zapixal provides a dedicated pipeline for Shopify merchants looking to optimize their entire product catalog in minutes. Slow-loading product images are a primary driver of high bounce rates and abandoned carts. By utilizing local WebAssembly encoders, Zapixal allows you to batch-compress hundreds of product shots without ever uploading them to a third-party server. This not only preserves your commercial privacy but also avoids the monthly subscription fees associated with many Shopify App Store optimizers.',
    section2Title: 'Uniform catalog sizing and next-gen format conversion',
    section2Body: 'Consistency is key for a professional e-commerce presentation. Zapixal can automatically resize your product images to Shopify’s recommended 2048x2048 pixel standard while ensuring a unified aspect ratio. We also support automatic conversion to WebP and AVIF, which can reduce your shop’s total image payload by up to 70% compared to standard JPEGs. Our tool also handles transparent PNGs by automatically adding a solid white background matte, ensuring your product listings look perfect on any Shopify theme.',
    steps: [
      'Drag your entire Shopify product image folder into the bulk queue.',
      'Select WebP or AVIF and enable the 2048px Shopify resize preset.',
      'Download your optimized catalog and upload directly to your Shopify Admin.'
    ],
    faqs: [
      makeFaq('What is the best image format for Shopify stores?', 'WebP and AVIF are currently the best formats for Shopify, as they offer significant file size savings over JPEG while maintaining excellent visual quality.'),
      makeFaq('Do I need to install a Shopify app to use this?', 'No. Zapixal is a browser-based tool that runs entirely on your device. You simply optimize your images here and then upload them to Shopify as usual.'),
      makeFaq('Will bulk optimization reduce the quality of my product photos?', 'Zapixal uses high-fidelity quantization matrices. You can adjust the quality slider to find the perfect balance between store speed and visual clarity.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/shopify-image-optimizer-bulk-free';
  const guideContent = getShopifyOptimizerContent();
  return {
    path,
    h1Title: 'Shopify Image Optimizer: Free Bulk Product Photo Compression',
    metaTitle: 'Shopify Product Image Optimizer — Free Batch Tool',
    metaDescription: 'Optimize your Shopify store speed with free bulk image compression. Convert product photos to WebP/AVIF locally. No apps, no fees, fully client-side.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    presetResize: { maxWidth: 2048, maxHeight: 2048 },
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Shopify Optimizer', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Professional Shopify Product Image Optimization',
      'Free bulk image optimizer for Shopify stores. Improve site speed and SEO with local WebP/AVIF conversion.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Shopify Optimizer', url: path }],
      'e-commerce',
      guideContent.steps
    )
  };
}
