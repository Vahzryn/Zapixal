import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressPdfScannedDocumentContent(): RouteEditorialContent {
  return {
    badge: 'OCR & Binarization Engine',
    section1Title: 'Binarize scanned paper documents to extreme high-contrast monochrome layouts',
    section1Body: 'Scanned paper documents and PDF attachments compiled at high color resolutions often result in massive, multi-megabyte payloads that crash online tax portals, university admissions websites, and legal databases. Naive compressors blur text edges and introduce fuzzy JPEG artifacts around letters, rendering scanning materials unreadable for OCR (Optical Character Recognition) crawlers. Zapixal tackles this overhead by executing Otsu binarization algorithms locally on your device CPU, mapping 24-bit color layers down to extreme 1-bit monochrome pixel grids. This method cuts document byte volume by up to 95% while keeping hand-written text and printed lines perfectly sharp.',
    section2Title: 'Maximize OCR accuracy and text curve definitions with zero tracing servers',
    section2Body: 'Processing highly confidential scanned records, financial files, or medical forms on cloud sites introduces significant data exposure risks. Zapixal processes your images entirely inside your browser tab’s sandbox. By converting pixels locally, your records are binarized and resized without ever touching a database or remote network API. Adjust the binarization contrast threshold sliders in real-time, inspect fine ink details instantly, and download lightweight, high-fidelity files ready for official portal submissions.',
    steps: [
      'Load your color or grayscale scanned document images into the browser sandbox.',
      'Slide the local binarization slider to separate background shadows from hand-written ink strokes.',
      'Download your highly compressed, 1-bit monochrome page files and combine them safely into your PDF.'
    ],
    faqs: [
      makeFaq('How does Otsu binarization reduce document file size so effectively?', 'Standard images store 24 bits of color data per pixel. Otsu binarization calculates a dynamic threshold to convert pixels into either absolute white or absolute black, reducing depth to 1 bit per pixel. This mathematically drops your file size by up to 95% without sacrificing text readability.'),
      makeFaq('Is binarization better for OCR readers than basic compression?', 'Yes. Standard lossy compression introduces blocky visual noise around characters. Binarization removes gray paper shadows and isolates text shapes, allowing OCR scanners to read characters with higher accuracy.'),
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
    metaTitle: 'Compress Scanned Document Images — Binarization Tool',
    metaDescription: 'Compress scanned paper documents and PDF image pages locally using Otsu 1-bit binarization. Maximize text OCR accuracy and shrink file size entirely offline.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Scanned Document Quantizer', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Compress Scanned Document PDF Images Online',
      'Compress scanned paper documents and PDF image pages locally using Otsu 1-bit binarization.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Scanned Document Quantizer', url: path }],
      'use-case',
      guideContent.steps
    )
  };
}
