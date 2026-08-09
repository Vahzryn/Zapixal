import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getBlurSensitiveInfoContent(): RouteEditorialContent {
  return {
    badge: 'Canvas Pixel Mosaic & Gaussian Redaction',
    section1Title: 'Irreversibly obfuscating confidential data on screenshots and documents',
    section1Body: 'Sharing screenshots, legal documents, or identity cards often risks accidentally exposing passwords, API keys, credit card numbers, or personal faces. Reversible black box overlays or semi-transparent layers can sometimes be removed by downstream editors. Zapixal applies true pixel-destructive Gaussian blurring or mosaic pixelation directly onto the canvas raster plane, permanently destroying underlying pixel values.',
    section2Title: 'Local browser-based redaction with zero remote data exposure',
    section2Body: 'Processing unredacted documents or sensitive screenshots on external systems risks exposing credentials across public networks. Zapixal renders the interactive redaction canvas entirely in your local browser tab. The pixel destructive transformation executes inside local RAM, ensuring unredacted original data never leaves your computer.',
    steps: [
      'Load the screenshot or document image into the privacy editor canvas.',
      'Select the blur or pixelate tool and drag over sensitive text, faces, or credentials.',
      'Export the permanently redacted image locally with zero network transmission.'
    ],
    faqs: [
      makeFaq('Can someone un-blur or reverse pixelated text from an image exported with Zapixal?', 'No. Zapixal performs pixel-destructive raster manipulation. The original RGB pixel values under the redacted selection are overwritten and destroyed.'),
      makeFaq('Why is Gaussian blur or mosaic better than drawing a black rectangle over text?', 'Both permanently destroy underlying pixels when flattened onto the raster image canvas. Mosaic pixelation visually indicates that information was redacted while preventing data recovery.'),
      makeFaq('Is my unredacted original image sent across a network before I apply the blur?', 'No. All image loading and redaction rendering occur locally inside your browser memory.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/blur-sensitive-image-privacy-pixelator';
  const guideContent = getBlurSensitiveInfoContent();
  return {
    path,
    h1Title: 'Blur & Pixelate Sensitive Info Privately in Browser',
    metaTitle: 'Blur & Pixelate Sensitive Info | Zapixal',
    metaDescription: 'Obfuscate passwords, faces, and credentials in screenshots using pixel-destructive blur. Processed locally in browser RAM for complete privacy.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Blur Sensitive Info', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Blur & Pixelate Sensitive Info Privately in Browser',
      'Irreversibly blur or pixelate confidential text, credentials, and faces directly in browser RAM with zero network transmission.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Blur Sensitive Info', url: path }],
      'use-case',
      guideContent.steps
    )
  };
}
