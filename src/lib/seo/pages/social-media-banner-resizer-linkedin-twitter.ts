import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getSocialBannerResizerContent(): RouteEditorialContent {
  return {
    badge: 'Multi-Platform Display Calibration',
    section1Title: 'Fitting cover banners across desktop and mobile display viewports without clipping',
    section1Body: 'Designing social media header banners for LinkedIn (1584x396), Twitter/X (1500x500), YouTube (2560x1440), and Facebook (820x312) is notoriously frustrating. Social platforms dynamically crop header banners depending on whether visitors view your profile on mobile smartphones or desktop screens. A banner that looks centered on desktop often gets cut off by profile avatar overlays on mobile devices. Zapixal provides a social media banner resizer with real-time viewport safety overlays.',
    section2Title: 'Smart scaling, focal point anchoring, and high-DPI export',
    section2Body: 'Instead of forcibly stretching banner artwork or slicing off critical call-to-action text, Zapixal allows you to anchor focal points, adjust background padding, and export double-resolution 2X Retina graphics. Higher pixel density prevents social media compression engines from blurring typography and logo vector shapes upon upload. All canvas compositing happens locally in browser memory.',
    steps: [
      'Upload your cover banner graphics or background photography.',
      'Select your target social platform preset (LinkedIn, Twitter/X, YouTube, or Facebook).',
      'Adjust framing using mobile avatar safety overlays and export crisp, correctly sized banners.'
    ],
    faqs: [
      makeFaq('Why does my LinkedIn or Twitter header banner look blurry after uploading?', 'Social platforms aggressively re-compress uploaded images. Exporting double-density graphics (e.g. 3168x792 for LinkedIn) counteracts platform compression and keeps text sharp.'),
      makeFaq('What is the "mobile safe zone" for social media cover photos?', 'The mobile safe zone is the central area of a banner that remains visible when profile pictures and mobile screen crops overlap header edges.'),
      makeFaq('Are my brand assets stored on remote servers when creating banners?', 'No. All canvas transformations and export operations execute locally in your browser memory.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/social-media-banner-resizer-linkedin-twitter';
  const guideContent = getSocialBannerResizerContent();
    return {
      path,
      h1Title: 'Resize Social Media Banner Headers with Mobile Safety Overlays',
      metaTitle: 'Social Media Cover Banner Resizer | Zapixal',
      metaDescription: 'Frame LinkedIn, Twitter/X, YouTube, and Facebook header banners with real-time mobile avatar safety overlays. Hardware accelerated client-side.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Social Banner Resizer', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Resize Social Media Banner Headers with Mobile Safety Overlays',
        'Resize cover banners for LinkedIn, Twitter, and YouTube with mobile viewport safety masks locally.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Social Banner Resizer', url: path }],
        'use-case',
        guideContent.steps
      )
    };
}
