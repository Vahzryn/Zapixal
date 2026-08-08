import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getRotateFlipLocalContent(): RouteEditorialContent {
  return {
    badge: 'EXIF Orientation Calibration',
    section1Title: 'Fixing stubborn photo orientation bugs without metadata degradation',
    section1Body: 'Digital cameras and smartphones embed EXIF orientation tags (values 1 through 8) to indicate how an image should be displayed. However, many web browsers, CMS platforms, and desktop viewers ignore EXIF orientation headers, displaying vertical portraits sideways or inverted. Overwriting raw EXIF tags without re-rasterizing the underlying bitmap often leads to inconsistent rendering across different apps. Zapixal physically transposes the raw pixel grid using 2D Canvas coordinate matrix transformations, baking the intended orientation permanently into the pixel stream.',
    section2Title: 'Physical pixel transposition and high-fidelity client-side rendering',
    section2Body: 'Standard image editors sometimes ignore physical transposition, simply rewriting the EXIF orientation header which is frequently ignored by various browsers and email clients. Zapixal performs coordinate transformations using the browser\'s 2D Canvas matrix. This physically transposes the underlying raw pixel grid—rotating or flipping the actual image data. The rotated buffer is then re-encoded using high-fidelity WebAssembly compressors (such as MozJPEG or WebP) to prevent any visible compression artifacts, ensuring your image renders identically across all platforms and apps.',
    steps: [
      'Load your sideways or upside-down images into the browser editor.',
      'Click 90-degree rotate or horizontal/vertical flip controls to adjust alignment.',
      'Download permanently calibrated images with universally supported physical pixel orientation.'
    ],
    faqs: [
      makeFaq('Why do photos taken on smartphones sometimes appear sideways on computer screens?', 'Smartphones often use EXIF orientation flags rather than rotating physical pixels. Older desktop viewers, websites, or email portals that ignore EXIF flags render the unrotated raw bitmap.'),
      makeFaq('Does rotating an image on Zapixal degrade its visual quality?', 'No visible degradation occurs. Because Zapixal uses state-of-the-art WebAssembly encoders (MozJPEG and WebP) at high-quality configurations, the re-encoded physical pixels remain visually identical to the original.'),
      makeFaq('Can I flip an image horizontally to mirror a selfie photo?', 'Yes. Horizontal mirroring transposes the pixel matrix across the vertical axis instantly.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/rotate-and-flip-image-local';
  const guideContent = getRotateFlipLocalContent();
    return {
      path,
      h1Title: 'Rotate, Mirror, and Flip Images Locally Without Cloud Processing',
      metaTitle: 'Rotate & Flip Image Locally | Zapixal',
      metaDescription: 'Fix photo EXIF orientation, rotate 90/180 degrees, and mirror images locally in browser RAM with high-fidelity visual accuracy.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'use-case',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Rotate & Flip Image', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Rotate, Mirror, and Flip Images Locally Without Cloud Processing',
        'Rotate and flip photos locally in browser memory with physical EXIF orientation calibration.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Rotate & Flip Image', url: path }],
        'use-case',
        guideContent.steps
      )
    };
}
