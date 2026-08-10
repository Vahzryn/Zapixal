import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getAddTextWatermarkContent(): RouteEditorialContent {
  return {
    badge: 'Vector Canvas Typography',
    section1Title: 'Protecting online visual assets with non-destructive client-side watermarking',
    section1Body: 'Photographers, digital illustrators, and real estate agents need to protect their preview images before publishing them online. Uploading high-res portfolio images to online watermarking websites exposes unwatermarked original files to server storage and public link scraping. Zapixal renders custom text watermarks, copyright notices, and brand signatures directly onto the image canvas in your local browser memory. You retain full control over opacity, font weight, rotation angle, and tiling patterns.',
    section2Title: 'Sub-pixel text anti-aliasing and smart stroke contrast outlines',
    section2Body: 'A common defect in web watermarking tools is poor text legibility when white text overlays light image backgrounds. Zapixal applies dual-pass text stroke rendering—drawing a subtle dark stroke border around semi-transparent light typography. This provides high-contrast visibility across light skies and dark shadow regions alike. Because canvas compositing runs on your local GPU, batch watermarking dozens of high-res photos finishes in seconds.',
    steps: [
      'Upload your photos or artwork into the watermarking workspace.',
      'Type your copyright text, adjust font size, opacity, color, and stroke outline.',
      'Export watermarked images ready for public web publication with zero server exposure.'
    ],
    faqs: [
      makeFaq('Is my unwatermarked original image ever sent over the internet?', 'Never. All typography rendering and canvas compositing happen locally on your computer.'),
      makeFaq('How can I ensure my watermark text is readable on light and dark backgrounds?', 'Zapixal includes an auto-stroke option that draws a contrasting outline around text, making it visible against any background color.'),
      makeFaq('Can I apply watermarks across multiple photos at once?', 'Yes. Our batch processor applies your configured watermark template across all queued images in parallel.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/add-text-watermark-image-browser';
  const guideContent = getAddTextWatermarkContent();
    return {
      path,
      h1Title: 'Apply Custom Text Watermarks to Photos Privately Client-Side',
      metaTitle: 'Add Text Watermark to Image — Client-Side Utility',
      metaDescription: 'Protect artwork and photos with custom text watermarks rendered directly in browser RAM. Auto-stroke contrast, zero cloud exposure.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Text Watermark', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Apply Custom Text Watermarks to Photos Privately Client-Side',
        'Add copyright text watermarks to images locally in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Text Watermark', url: path }],
        'use-case',
        guideContent.steps
      )
    };
}
