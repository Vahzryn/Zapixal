import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressUnder50kbContent(): RouteEditorialContent {
  return {
    badge: 'Adjustable Standard Sizing',
    section1Title: 'Overcoming rigid file size thresholds on official portals',
    section1Body: 'Government portals, passport agencies, and competitive examination systems routinely impose unyielding file size limits—often capped strictly at 50KB or 20KB. Note that individual agency portals enforce unique, highly variable validation criteria—including specific pixel dimensions, aspect ratios, file formats, and color profiles. You should always verify the exact, current requirements on the official organization portal prior to submitting your files. Zapixal solves this by running an automated, iterative quality-quantization loop in your browser’s RAM. The algorithm systematically calculates the highest achievable quality factor to help ensure the final output falls safely under the target byte limit.',
    section2Title: 'Precision quantization without sacrificing image clarity',
    section2Body: 'Hitting a strict target payload requires smart allocation of file bits rather than uniform degradation. Zapixal allows granular scaling control. Our client-side pipeline dynamically downscales excess pixel dimensions before applying custom JPEG quantization tables. By reducing dimensional overhead first, the algorithm preserves essential facial features and sharp line edges even at compressed thresholds. Because all iterations happen locally in browser memory, you can fine-tune target kilobytes without waiting for network re-uploads.',
    steps: [
      'Select your passport photo, ID scan, or digital signature.',
      'Specify 50KB as your maximum target file size threshold.',
      'Download the sanitized, precisely sized file ready for immediate portal submission.'
    ],
    faqs: [
      makeFaq('Why do government portals reject photos even when they look small?', 'Portals check exact file payload byte counts rather than visual dimensions on screen. A photo that appears small might still contain several megabytes of uncompressed header metadata and high-density color information.'),
      makeFaq('Will my photo become too blurry to pass automated verification?', 'No. By balancing pixel downscaling with localized quantization, the algorithm compresses file size while keeping facial landmarks and signature lines crisp enough for OCR and human inspection.'),
      makeFaq('Can the portal server detect that the image was compressed locally?', 'The output is a standard JPEG or PNG file. It contains clean image headers without any non-standard artifacts.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-image-under-50kb-government-portal';
  const guideContent = getCompressUnder50kbContent();
  
  return {
      path,
      h1Title: 'Compress Image Under 50KB for Government Portals',
      metaTitle: 'Compress Photo Under 50KB — Free Browser Tool',
      metaDescription: 'Shrink photos, signatures, and document scans under 50KB or 20KB locally. Meet strict government upload limits with adjustable standard sizing.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      targetMaxKB: 50,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress Under 50KB', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Sub-50KB Image Optimization for Strict Government & Exam Portals',
        'Shrink passport photos and application uploads under 50KB in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Compress Under 50KB', url: path }],
        'use-case',
        guideContent.steps
      )
    };
}
