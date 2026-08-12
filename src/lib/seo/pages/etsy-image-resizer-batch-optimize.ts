import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getEtsyResizerContent(): RouteEditorialContent {
  return {
    badge: 'Handmade-Ready Etsy Optimizer',
    section1Title: 'Boosting Etsy visibility with professional, uniform product photography',
    section1Body: 'For Etsy sellers, visual consistency is the single most important factor for building trust and driving sales. Inconsistent listing photo sizes can make a shop look unprofessional and slow down the browsing experience for customers. Zapixal’s Etsy image resizer is specifically calibrated for the platform’s 2000px width recommendation. By batch-optimizing your listing photos locally, you ensure that every product thumbnail and detail view loads instantly, giving your handmade or vintage shop a competitive edge in the Etsy search rankings.',
    section2Title: 'Meeting Etsy’s aspect ratio standards without distorting your products',
    section2Body: 'Etsy recommends 4:3 or 5:4 aspect ratios for the best presentation across search results and listing pages. Naive resizing tools often stretch or crop your products destructively. Zapixal uses precise padding and cropping algorithms to ensure your items remain perfectly centered and undistorted. Our tool also supports automatic white background fill, which is essential for that clean, professional marketplace look. Best of all, because we process everything locally in your browser, your high-resolution commercial assets never leave your device.',
    steps: [
      'Upload your product photos to the bulk Etsy resizer queue.',
      'Select the 2000px width preset and choose your preferred aspect ratio.',
      'Download your optimized batch and update your Etsy listings in one go.'
    ],
    faqs: [
      makeFaq('What is the best image size for Etsy listings?', 'Etsy officially recommends listing images that are at least 2000 pixels wide. Zapixal’s Etsy preset is pre-configured to hit this target exactly.'),
      makeFaq('Does Etsy prefer square or rectangular photos?', 'Etsy’s search results vary by category, but 4:3 or 5:4 rectangular ratios are generally the safest and most professional choice for modern Etsy themes.'),
      makeFaq('How many Etsy photos can I optimize at once?', 'Zapixal has no artificial limit. You can process your entire product catalog in one batch, utilizing your local computer’s processing power.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/etsy-image-resizer-batch-optimize';
  const guideContent = getEtsyResizerContent();
  return {
    path,
    h1Title: 'Etsy Image Resizer: Free Batch Product Photo Optimizer',
    metaTitle: 'Etsy Listing Image Resizer — Batch Optimization Tool',
    metaDescription: 'Optimize your Etsy shop for more sales with professional, uniform product photos. Resize to 2000px, adjust aspect ratios, and compress locally. 100% Client-Side.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    presetResize: { maxWidth: 2000, maxHeight: 2000 },
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Etsy Resizer', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Professional Etsy Product Image Optimization',
      'Improve your Etsy shop speed and visual consistency with our free batch resizer. Calibrated for Etsy listing standards.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Etsy Resizer', url: path }],
      'e-commerce',
      guideContent.steps
    )
  };
}
