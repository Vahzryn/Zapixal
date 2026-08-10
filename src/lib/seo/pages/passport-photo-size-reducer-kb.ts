import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getPassportPhotoSizeReducerContent(): RouteEditorialContent {
  return {
    badge: 'Standard Dimensional Calibration',
    section1Title: 'Standardizing passport and ID photos to strict physical pixel grids',
    section1Body: 'Passport authorities, visa applications, and national ID databases mandate precise physical pixel dimensions (such as 600x600 pixels for US visas or 350x450 pixels for Schengen applications) coupled with tight file size caps (e.g. 20KB to 100KB). Because target file sizes and pixel grids vary widely depending on the country, jurisdiction, and department, always verify the exact and current guidelines with official government portals before submitting your materials. Zapixal pairs pixel-accurate bicubic resampling with intelligent quality quantization to help you hit these custom, official dimensions and kilobyte requirements simultaneously.',
    section2Title: 'Local processing for ultra-sensitive identity document photos',
    section2Body: 'Uploading sensitive passport photos, driver’s licenses, or official identification cards to third-party web converters is a severe personal privacy risk. Facial photos uploaded online can be scraped, logged, or indexed into facial recognition databases. Zapixal runs locally on your machine’s hardware. The canvas rasterization, cropping, dimension scaling, and JPEG quantization execute inside your browser sandbox. Once you close the browser tab, all image buffers are completely erased from RAM.',
    steps: [
      'Select your high-resolution passport portrait or ID headshot.',
      'Input target pixel dimensions and maximum allowed file size in kilobytes.',
      'Save the calibrated, privacy-protected ID photo directly to your computer.'
    ],
    faqs: [
      makeFaq('What pixel dimensions are standard for US Passport photos?', 'US Passport and Visa photos require a square aspect ratio of 600x600 pixels (equivalent to 2x2 inches at 300 DPI) with file sizes typically under 240KB.'),
      makeFaq('Does scaling down my photo alter my facial features?', 'No. Zapixal locks the aspect ratio during scaling, preventing unnatural stretching or squishing of facial geometry.'),
      makeFaq('Is my passport photo uploaded to any server during processing?', 'Never. All image scaling and quantization occur strictly inside your device’s browser memory.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/passport-photo-size-reducer-kb';
  const guideContent = getPassportPhotoSizeReducerContent();
    return {
      path,
      h1Title: 'Compress Passport Photo File Size under KB Limits',
      metaTitle: 'Passport Photo Size Reducer — Free KB Sizing Tool',
      metaDescription: 'Compress passport & visa photos to exact kilobyte targets (e.g., under 50KB or 100KB) privately in your browser. Adjust size and quality with zero server uploads.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Passport Photo Reducer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Compress Passport Photo File Size under KB Limits',
        'Compress passport and visa photos to exact kilobyte targets privately in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Passport Photo Reducer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
}
