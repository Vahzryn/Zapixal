import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getClientSideBase64Content(): RouteEditorialContent {
  return {
    badge: 'Feature Status',
    section1Title: 'Image to Base64 Conversion',
    section1Body: 'Base64 encoding converts raw binary image buffers into ASCII string representations, enabling web developers, email template designers, and API engineers to embed images directly into CSS stylesheets, HTML Data URIs, or JSON API requests. Currently, Zapixal focuses on image compression, resizing, and format conversion (like PNG, JPG, WebP), and does not offer a direct Base64 text export feature.',
    section2Title: 'Alternative workflows for Data URIs',
    section2Body: 'While Zapixal does not export Base64 strings directly, you can still use our local tool to compress and optimize your images first. Once your image is reduced to an optimal file size, you can use built-in browser APIs or other local developer tools to encode the optimized image into a Base64 string, ensuring your embedded data remains as small as possible.',
    steps: [
      'Drop your image into the Zapixal converter to compress it.',
      'Download the highly optimized image file to your local device.',
      'Use a local terminal or developer tool to encode the compressed image into Base64.'
    ],
    faqs: [
      makeFaq('Does Zapixal output Base64 strings?', 'No. Zapixal does not currently support exporting images as raw Base64 strings or HTML/CSS Data URIs.'),
      makeFaq('Why should I compress an image before Base64 encoding?', 'Base64 maps binary data into text, increasing total string size by approximately 33%. Pre-compressing your image with Zapixal ensures the resulting Base64 string is as compact as possible.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/client-side-image-to-base64';
  const guideContent = getClientSideBase64Content();
  
  return {
    path,
    h1Title: 'Client-Side Image to Base64 String Encoder',
    metaTitle: 'Client-Side Image to Base64 Encoder — Information',
    metaDescription: 'Learn about Base64 encoding and why compressing your images locally before encoding can save payload overhead.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'resource',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Image to Base64 Encoder', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Client-Side Image to Base64 String Encoder',
      'Information on optimizing images prior to Base64 Data URI encoding.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Image to Base64 Encoder', url: path }],
      'resource',
      guideContent.steps
    )
  };
}
