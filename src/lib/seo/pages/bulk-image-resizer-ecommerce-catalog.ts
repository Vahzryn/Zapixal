import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getBulkEcommerceResizerContent(): RouteEditorialContent {
  return {
    badge: 'Uniform Canvas Resizing & Aspect Calibration',
    section1Title: 'Standardizing product catalog images for Amazon, Shopify, and eBay',
    section1Body: 'E-commerce platforms enforce strict product image guidelines, such as 1:1 square aspect ratios, 1000x1000 or 2000x2000 minimum pixel dimensions, and white background fills. Inconsistent product photos degrade buyer trust and trigger seller hub submission errors. Zapixal resizes, pads, and crops entire product catalog batches to uniform dimensions concurrently in browser RAM.',
    section2Title: 'High-throughput catalog batch processing without network bottlenecks',
    section2Body: 'Processing hundreds of raw product photos through remote systems leads to queue timeouts and subscription paywalls. Zapixal uses client-side Web Workers to process batch image queues in parallel directly on your CPU. Sellers can apply uniform square padding, adjust WebP or JPEG compression, and export catalog-ready assets in a single pass with zero file queue ceilings.',
    steps: [
      'Drag your entire product photo batch into the browser resizer.',
      'Set target square dimensions (e.g. 1000x1000) and choose padding or crop modes.',
      'Export uniform catalog images as a single ZIP or batch download locally.'
    ],
    faqs: [
      makeFaq('What are standard image requirements for Shopify and Amazon product listings?', 'Shopify and Amazon recommend 1:1 square images (1000x1000 or 2000x2000 pixels) with consistent padding and clean background fills.'),
      makeFaq('Can I resize product photos with different original aspect ratios without stretching?', 'Yes. Zapixal offers a "contain with padding" mode that centers non-square products on a clean background without distorting aspect ratios.'),
      makeFaq('Is there a limit on how many product images I can process at once?', 'No artificial software limits. Batch size is governed by your device memory.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/bulk-image-resizer-ecommerce-catalog';
  const guideContent = getBulkEcommerceResizerContent();
  return {
    path,
    h1Title: 'Bulk E-commerce Product Photo Resizer & Square Calibrator',
    metaTitle: 'Bulk E-Commerce Catalog Resizer | Zapixal',
    metaDescription: 'Resize and standardize product photos for Shopify, Amazon, and eBay in browser memory. Batch process 1:1 square dimensions locally on your hardware.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Bulk E-commerce Catalog Resizer', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Bulk E-commerce Product Photo Resizer & Square Calibrator',
      'Batch resize and pad product catalog photos to uniform 1:1 square dimensions locally in browser memory.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Bulk E-commerce Catalog Resizer', url: path }],
      'use-case',
      guideContent.steps
    )
  };
}
