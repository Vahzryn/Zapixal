import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getClientSideBase64Content(): RouteEditorialContent {
  return {
    badge: 'Data URI Inlining',
    section1Title: 'Inlining binary assets into CSS, HTML, and API payloads without server requests',
    section1Body: 'Base64 encoding converts raw binary image buffers into ASCII string representations, enabling web developers, email template designers, and API engineers to embed images directly into CSS stylesheets, HTML Data URIs, or JSON API requests. Traditional online Base64 converters require uploading image files to remote servers, exposing private interface mocks or email assets to cloud logging. Zapixal uses the FileReader browser API and Canvas ArrayBuffer representations to construct RFC 4648 data URIs locally in your browser memory.',
    section2Title: 'Direct string manipulation and syntax-formatted export options',
    section2Body: 'Base64 strings expand binary data size by roughly 33% due to 6-bit index encoding. To optimize data payload overhead, Zapixal allows you to pre-compress images prior to Base64 serialization. Once serialized, you can copy pure Base64 strings, formatted HTML <img> tags, or CSS url("data:image/png;base64,...") definitions with a single click. Because all operations execute locally, large high-resolution images are converted in milliseconds without encountering HTTP POST payload size limits or gateway timeouts.',
    steps: [
      'Drop your image into the browser conversion buffer.',
      'Choose output formatting options (Raw Base64 string, HTML Data URI, or CSS url syntax).',
      'Copy the serialized Base64 string directly to your clipboard or download it as a text file.'
    ],
    faqs: [
      makeFaq('Why does Base64 encoding increase file size?', 'Base64 maps binary 8-bit bytes into 6-bit ASCII characters (A-Z, a-z, 0-9, +, /), requiring 4 characters for every 3 bytes of binary input, which increases total string size by approximately 33%.'),
      makeFaq('When should I use Base64 strings instead of linking standard image files?', 'Base64 Data URIs are ideal for small icons in CSS files, inline assets in email templates, or single-file HTML distributions where reducing HTTP request counts is more critical than raw file size.'),
      makeFaq('Is there any file size limit for Base64 conversion on Zapixal?', 'Because encoding runs locally on your machine’s CPU and RAM, there are no arbitrary server POST body limits. You can encode large assets as long as your browser memory permits.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/client-side-image-to-base64';
  const guideContent = getClientSideBase64Content();
    return {
      path,
      h1Title: 'Client-Side Image to Base64 String Encoder',
      metaTitle: 'Image to Base64 Encoder | Zapixal',
      metaDescription: 'Convert images to Base64 strings, HTML Data URIs, and CSS background rules directly in browser memory. Private, offline, no POST payload limits.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'resource',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Image to Base64 Encoder', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Client-Side Image to Base64 String Encoder',
        'Convert images to Base64 Data URIs directly in browser memory with zero server uploads.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Image to Base64 Encoder', url: path }],
        'resource',
        guideContent.steps
      )
    };
}
