import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getSquarePhotoMakerContent(): RouteEditorialContent {
  return {
    badge: 'Non-Destructive Canvas Expansion',
    section1Title: 'Fitting rectangular photos into 1:1 square aspect ratios without cropping faces',
    section1Body: 'Social media avatars, e-commerce product thumbnails, and online directory profiles frequently require 1:1 square aspect ratio images. Using basic crop tools on wide landscape photos or tall vertical portraits often slices off subject faces, product edges, or background context. Zapixal solves this by extending image canvas dimensions into a 1:1 square layout and filling the side padding areas with an aesthetically pleasing, Gaussian-blurred mirrored extension of the original image background.',
    section2Title: 'Hardware-accelerated canvas blurring and custom background options',
    section2Body: 'Creating square padding manually in graphic editors requires multiple layer duplicates, clipping masks, and Gaussian blur passes. Zapixal automates this entire pipeline using HTML5 Canvas 2D spatial blur shaders. You can customize blur intensity, choose solid dark or light background fill colors, or apply subtle drop shadows. All compositing runs at 60 FPS on your local GPU, keeping original photo pixels untouched at the center.',
    steps: [
      'Load your rectangular landscape or vertical portrait photo into the square generator.',
      'Choose your padding style (Blurred background mirror, solid color, or ambient gradient).',
      'Export a precisely framed 1:1 square photo with zero subject cropping.'
    ],
    faqs: [
      makeFaq('How does the blurred background padding work?', 'Zapixal scales and mirrors your original photo into the background canvas layer, applies a Gaussian blur shader, and places your uncropped original photo cleanly in the center.'),
      makeFaq('Will making a photo square using padding reduce its sharpness?', 'No. The central original photo remains fully sharp and un-cropped; only the added side padding areas receive the soft blur effect.'),
      makeFaq('Can I customize the output resolution of the square image?', 'Yes. You can export square photos at standard social media dimensions such as 1080x1080 pixels or preserve full original height/width resolution.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/square-photo-maker-no-crop-blur-border';
  const guideContent = getSquarePhotoMakerContent();
    return {
      path,
      h1Title: 'Make 1:1 Square Photos with Blurred Mirrored Background Padding',
      metaTitle: 'Square Photo Maker (No Crop) | Zapixal',
      metaDescription: 'Fit rectangular photos into 1:1 square aspect ratios without cropping subject faces. Adds aesthetic blurred background padding client-side.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Square Photo Maker', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Make 1:1 Square Photos with Blurred Mirrored Background Padding',
        'Expand photos into 1:1 square aspect ratios with blurred padding in browser RAM without cropping.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Square Photo Maker', url: path }],
        'use-case',
        guideContent.steps
      )
    };
}
