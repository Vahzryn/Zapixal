import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getPassportPhotoResizerContent(): RouteEditorialContent {
  return {
    badge: 'Preflight Photo Calibration',
    section1Title: 'Sizing passport, visa, and ID photos to official 2x2 inch and 35x45mm specs',
    section1Body: 'Submitting passport applications or visa forms requires strict adherence to physical photo dimensions—such as 2x2 inches (51x51mm) for US Passports or 35x45mm for Schengen visas—alongside solid white backgrounds and specific head-to-canvas height ratios. Note that official photo and background specifications vary significantly by country, jurisdiction, and application type. You should always verify the latest, exact requirements with the official authority or passport office prior to submission. Zapixal provides a passport photo resizer with interactive face alignment guidelines to help you align with these specific needs.',
    section2Title: 'Solid white background matte fill and 300 DPI print preflight header',
    section2Body: 'Taking passport photos against off-white home walls often produces dark background tints. Zapixal allows you to composite background fill mattes onto solid #FFFFFF white while injecting 300 DPI EXIF print headers into output JPEG files. You can print multiple standard passport photos onto standard 4x6 inch print sheets or export single high-DPI files for digital submission portals, completely offline without paying expensive photo booth fees.',
    steps: [
      'Upload your portrait photo into the passport photo calibration workspace.',
      'Select your target country specification (US Passport 2x2 in, Schengen Visa 35x45mm, or custom ID).',
      'Align your head using interactive visual guidelines and download print-ready 300 DPI photos.'
    ],
    faqs: [
      makeFaq('What are the exact pixel dimensions for a 2x2 inch US passport photo at 300 DPI?', 'A 2x2 inch passport photo printed at 300 DPI requires exactly 600x600 physical pixels with the head measuring between 1 and 1.375 inches from chin to crown.'),
      makeFaq('Why do visa portals reject passport photos taken against home walls?', 'Visa preflight scanners flag non-white or shadowy backgrounds. Zapixal allows you to fill background padding with pure solid white #FFFFFF.'),
      makeFaq('Is my personal passport photo uploaded to any external database?', 'Never. All crop framing, DPI header injection, and background compositing execute locally in browser RAM.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/passport-visa-photo-resizer-background-white';
  const guideContent = getPassportPhotoResizerContent();
    return {
      path,
      h1Title: 'Calibrate Passport & Visa Photos to Official Specifications',
      metaTitle: 'Passport & Visa Photo Resizer — White Background & 300 DPI | Zapixal',
      metaDescription: 'Resize passport photos to standard 2x2 inch or 35x45mm Schengen visa dimensions. Set pure white backgrounds and 300 DPI EXIF headers privately offline.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Passport & Visa Photo Resizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Calibrate Passport & Visa Photos to Official Specifications',
        'Calibrate passport photo framing, background fill, and 300 DPI EXIF headers locally.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Passport & Visa Photo Resizer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
}
