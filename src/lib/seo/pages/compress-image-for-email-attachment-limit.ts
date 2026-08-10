import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressEmailAttachmentContent(): RouteEditorialContent {
  return {
    badge: 'Email Mail-Size Optimization',
    section1Title: 'Bypass mail server attachment boundaries with local file compression',
    section1Body: 'Corporate Exchange networks, standard Gmail portals, and Outlook systems enforce strict visual file payload limits—typically capping individual email messages at 20MB or 25MB. When your high-resolution attachments or visual archives exceed this threshold, emails bounce back silently, stalling important communications. Zapixal resolves this issue by running multi-threaded JPEG and PNG compression directly inside your web browser. This client-side architecture scales your assets down to standard boundaries instantly without surrendering private documents to cloud-based caches.',
    section2Title: 'Granular quality controls to preserve high-fidelity document text',
    section2Body: 'Shrinking a photo’s byte footprint for an email often compromises structural details like text lines, small icons, or signatures, making them difficult to read. Rather than relying on coarse auto-compression presets, Zapixal provides a real-time sliding quality metric that calculates output dimensions in local browser RAM prior to export. This allows you to find the perfect compromise between byte volume and visual integrity. Enjoy fluid adjustments and rapid offline exports to prepare lightweight, business-ready email attachments.',
    steps: [
      'Drag your heavy attachments or image assets into the local browser sandbox.',
      'Slide the local compression quality slider to converge below your target size limit (such as 10MB or 15MB).',
      'Download your email-optimized files directly and attach them safely to your message.'
    ],
    faqs: [
      makeFaq('Why does my email client reject image attachments?', 'Most corporate and public email services have a hard message payload cap of 20MB to 25MB. Base64 encoding used during email transmission also inflates your file size by roughly 33%, calling for a safer, lower target limit.'),
      makeFaq('Will compressing email images render text in documents unreadable?', 'No. By choosing the right compression parameters locally in Zapixal, you can compress files significantly while keeping fine print and high-contrast lines extremely sharp.'),
      makeFaq('Is it secure to compress confidential business attachments here?', 'Yes. Zapixal is a client-side application running on your CPU using WebAssembly. Your business records, financial spreadsheets, or private contracts are processed in local memory and are never uploaded to any external server.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-image-for-email-attachment-limit';
  const guideContent = getCompressEmailAttachmentContent();
  return {
    path,
    h1Title: 'Compress Images for Email Attachment Size Limits',
    metaTitle: 'Compress Image for Email Limits — Free Sizing Tool',
    metaDescription: 'Compress heavy image attachments for Outlook, Gmail, and Exchange limits locally. Keep text readable while fitting under server message size caps.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress for Email', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Compress Images for Email Attachment Size Limits',
      'Compress heavy image attachments for Outlook, Gmail, and Exchange limits locally in your browser.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Compress for Email', url: path }],
      'use-case',
      guideContent.steps
    )
  };
}
