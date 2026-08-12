import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressPdfScannedDocumentContent(): RouteEditorialContent {
  return {
    badge: 'Local PDF Image Extraction',
    section1Title: 'Compress scanned paper documents and PDF attachments locally',
    section1Body: 'Scanned paper documents and PDF attachments compiled at high color resolutions often result in massive, multi-megabyte payloads that crash online tax portals, university admissions websites, and legal databases. Zapixal tackles this overhead by rendering PDF pages locally on your device CPU and extracting them as high-quality, compressed JPEG images. This method can significantly cut document byte volume while keeping hand-written text and printed lines sharp.',
    section2Title: 'Maximize privacy with zero tracing servers',
    section2Body: 'Processing highly confidential scanned records, financial files, or medical forms on cloud sites introduces significant data exposure risks. Zapixal processes your documents entirely inside your browser tab’s sandbox. By rendering pages locally, your records are extracted and compressed without ever touching a database or remote network API. Adjust the compression quality sliders in real-time and download lightweight files ready for official portal submissions.',
    steps: [
      'Load your scanned PDF documents into the browser sandbox.',
      'Adjust the output JPEG quality slider to balance readability and file size.',
      'Download your highly compressed page images safely to your device.'
    ],
    faqs: [
      makeFaq('How does Zapixal reduce PDF document file size?', 'Zapixal locally renders your PDF pages into images and applies standard JPEG compression. By adjusting the quality slider, you can find the perfect balance between file size and text readability.'),
      makeFaq('Are my confidential financial and medical scans safe with Zapixal?', 'Structurally yes. Zapixal is designed as a client-side application. No document scans, personal data, or metadata headers are ever sent over the network, ensuring complete confidentiality for your private files.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-pdf-scanned-document-images';
  const guideContent = getCompressPdfScannedDocumentContent();
  return {
    path,
    h1Title: 'Compress Scanned Document PDF Images Online',
    metaTitle: 'Compress Scanned Document Images — Local Tool',
    metaDescription: 'Compress scanned paper documents and PDF image pages locally using client-side rendering. Shrink file size entirely local.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Scanned Document Compressor', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Compress Scanned Document PDF Images Online',
      'Compress scanned paper documents and PDF image pages locally using client-side processing.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Scanned Document Compressor', url: path }],
      'use-case',
      guideContent.steps
    )
  };
}
