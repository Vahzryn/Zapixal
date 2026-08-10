import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getSignature10To20kbContent(): RouteEditorialContent {
  return {
    badge: '10–20KB Signature Preset',
    section1Title: 'Prepare a scanned signature for strict upload limits',
    section1Body: 'Some application systems require a scanned signature to stay inside a narrow file-size range. For example, the Staff Selection Commission states in its 2026 Combined Higher Secondary (10+2) Level examination notice that the scanned signature should be a JPEG of 10 to 20 KB and approximately 6.0 cm by 2.0 cm. Requirements are not universal: other examinations and recruitment notices can use different limits, dimensions, or formats. This Zapixal route starts with a 20KB maximum target so the exported file can be checked against the current instructions for the application you are completing.',
    section2Title: 'Use byte size as a validation step, not as proof of eligibility',
    section2Body: 'A file being below 20KB does not by itself make a signature compliant. Portals may also validate image format, dimensions, legibility, proportions, or other application-specific rules. Zapixal performs the image work locally in the browser and lets the target-size compressor reduce the encoded file toward the selected ceiling. Check the resulting file size and then compare the image with the current official notice before uploading it.',
    steps: [
      'Read the current application notice and confirm the required signature format, dimensions, and file-size range.',
      'Select the scanned signature and use the 10–20KB route with the 20KB maximum target.',
      'Inspect the exported signature for legibility and confirm its byte size before submitting it to the official portal.'
    ],
    faqs: [
      makeFaq('Does every government form require a 10–20KB signature?', 'No. File-size and dimension rules vary by examination, recruitment system, and application. Use the current official instructions for the exact application.'),
      makeFaq('What does the SSC 2026 notice require for the signature?', 'The SSC Combined Higher Secondary (10+2) Level Examination 2026 notice states that the scanned signature should be JPEG, 10 to 20 KB, and approximately 6.0 cm wide by 2.0 cm high.'),
      makeFaq('Does a 20KB file guarantee that my application will accept it?', 'No. File size is only one condition. The portal may also check format, dimensions, clarity, or other requirements. Verify the complete current instructions before submission.'),
      makeFaq('Are my signature files uploaded to Zapixal?', 'The image-processing pipeline is client-side. The selected image is decoded and processed in the browser rather than uploaded to a Zapixal image-processing server.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-signature-image-to-10-20kb';
  const guideContent = getSignature10To20kbContent();

  return {
    path,
    h1Title: 'Compress Signature Image to 10–20KB',
    metaTitle: 'Compress Signature to 10–20KB — Free Tool',
    metaDescription: 'Compress a scanned signature to a 10–20KB target locally in your browser. Verify the current portal format and dimension rules before upload.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'use-case',
    targetMaxKB: 20,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Signature Compressor', url: path }
    ],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Compress Signature Image to 10–20KB',
      'Prepare a scanned signature for narrow file-size limits with local browser processing. Official application requirements must be verified before submission.',
      fullUrl,
      guideContent.faqs,
      [
        { name: 'Home', url: '/' },
        { name: 'Signature Compressor', url: path }
      ],
      'use-case',
      guideContent.steps
    )
  };
}
