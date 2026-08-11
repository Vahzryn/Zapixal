import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getResizeJobApplicationContent(): RouteEditorialContent {
  return {
    badge: 'No Signup, No Cloud Storage, Local Sizing',
    section1Title: 'Ensure career portal image attachments load perfectly without server transmissions',
    section1Body: 'Job application portals often have strict file dimension boundaries and size ceilings on uploaded resumes, profile headshots, and portfolio documents. Zapixal allows you to resize and optimize your attachments locally in-browser according to the specific dimensions and file-size requirements supplied by the employer. By keeping your entire image processing workflow inside your local device memory, you ensure that private data and CV materials never reach third-party processing servers.',
    section2Title: 'Consistent resizing for job application uploads',
    section2Body: 'When submitting application materials, your headshots and certificates should maintain clear dimensions and a lightweight byte profile. Our client-side resizing engine maintains crisp sub-pixel detail while optimizing your files to your target size limit. Adjust your scaling parameters in real-time and export precisely sized files directly from your browser tab.',
    steps: [
      'Load your resume headshot or certificate scan directly into the offline browser workspace.',
      'Specify target resolution parameters or choose custom height and width constraints.',
      'Adjust compression levels locally to fit under portal requirements and save your file.'
    ],
    faqs: [
      makeFaq('What is the standard image dimension for a job application photo?', 'Most Applicant Tracking Systems prefer standard portrait proportions such as 2x2 inches or 600x600 pixels. It is always recommended to verify the specific portal guidelines prior to submitting your files.'),
      makeFaq('Will compressing my certificate scan make the text unreadable for ATS?', 'No. Zapixal utilizes high-fidelity bicubic downscaling algorithms to compress file size while preserving high-contrast edge definitions, ensuring small text elements remain sharp for OCR readers.'),
      makeFaq('Is my resume photo or private data stored on Zapixal servers?', 'Absolutely not. Zapixal executes all of its decoding and processing tasks inside your browser RAM. Your credentials, personal details, and raw imagery are never transmitted over the network.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/resize-image-for-job-application-form';
  const guideContent = getResizeJobApplicationContent();
  return {
    path,
    h1Title: 'Resize Image for Job Application Form (No Signup)',
    metaTitle: 'Resize Image for Job Applications — Private Browser Tool',
    metaDescription: 'Resize and optimize career portal image attachments locally. No signup, no cloud storage, just local sizing directly in your browser.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    presetResize: { maxWidth: 600, maxHeight: 600 },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Resize for Job Applications', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Optimize Portfolio & Headshot Uploads for ATS Job Applications',
      'Resize and optimize career portal image attachments locally with sharp typography retention and zero server transmissions.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Resize for Job Applications', url: path }],
      'use-case',
      guideContent.steps
    )
  };
}
