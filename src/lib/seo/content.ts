import { TargetFormat } from '../../types';

export interface RouteEditorialContent {
  badge: string;
  section1Title: string;
  section1Body: string;
  section2Title: string;
  section2Body: string;
  steps: string[];
  faqs: Array<{ question: string; answer: string }>;
}

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getEducationalEditorialContent(
  badge: string,
  section1Title: string,
  section1Body: string,
  section2Title: string,
  section2Body: string,
  steps: string[],
  faqs: Array<{ question: string; answer: string }>
): RouteEditorialContent {
  return {
    badge,
    section1Title,
    section1Body,
    section2Title,
    section2Body,
    steps,
    faqs
  };
}

export function getHomeEditorialContent(): RouteEditorialContent {
  return {
    badge: 'Practical image workflow',
    section1Title: 'How to choose the right image workflow before you convert anything',
    section1Body: 'Experience matters when the output will be used in a real setting. Expertise starts with choosing the destination first, then the format, and then the compression target. Authoritativeness comes from understanding that JPEG remains the broad compatibility standard, PNG is strongest for editing and transparency, WebP is efficient for modern web delivery, and HEIC is compact but less universal. Trustworthiness improves when the work stays in the browser so the file remains under your control and you avoid unnecessary uploads.',
    section2Title: 'Best practices for privacy, performance, and accessibility',
    section2Body: 'Professional workflows should preserve the original file, document the target size, and test the result on the device or platform where it will actually be used. Common mistakes include over-compressing before checking legibility, ignoring transparency, and assuming a newer format is always better. Real scenarios include ecommerce product photos, scanned documents, website hero images, and personal photos that need to stay private. Security advice matters because local processing reduces exposure of metadata and personal content. Accessibility advice matters because important text, faces, and interface details must remain readable. Performance advice matters because smaller files help page speed, but clarity should always come first.',
    steps: [
      'Start with the source image that matches the real use case.',
      'Choose a format and quality level that fits the destination platform.',
      'Review the output once before sharing, uploading, or publishing it.'
    ],
    faqs: [
      makeFaq('Why does privacy matter so much in image conversion?', 'Because image files often contain more than pixels. They can carry personal context, metadata, and document details that should stay under your control.'),
      makeFaq('Is browser-based processing enough for serious work?', 'Yes. For many everyday and professional tasks, local processing is simpler, faster to trust, and more appropriate than sending files to a remote service.'),
      makeFaq('What kind of files work well here?', 'This workflow is useful for photos, screenshots, logos, scanned documents, and product images that need to be converted or compressed for a real destination.'),
      makeFaq('When should I choose a different format?', 'Choose a different format when compatibility, transparency, or a strict size limit matters more than preserving the exact original structure.')
    ]
  };
}

export function getCompressionEditorialContent(formatName: string, sizeKB: number, titleFormat: string): RouteEditorialContent {
  const targetLabel = `${formatName.toUpperCase()} under ${titleFormat}`;
  return {
    badge: 'Practical size targeting',
    section1Title: `How to compress ${targetLabel} without harming readability`,
    section1Body: 'Industry standards often require a hard ceiling for forms, marketplaces, and public portals. The most effective compression workflow begins by defining the real limit, preserving the details that matter most, and testing the output before it is submitted or published. JPEG is usually the most practical choice for photographs, while WebP and AVIF can be better for modern web delivery when the output remains clear.',
    section2Title: 'What to verify before and after compression',
    section2Body: 'Professional workflows should preserve contrast, text clarity, and the important subject of the image before trimming file size. Common mistakes include squeezing the file too early, treating every pixel as equally important, or ignoring that a product edge, a signature, or a face often deserves more care than empty background space. Real scenarios include ID documents, ecommerce images, website headers, and screenshots that must stay legible. Best practice is to keep the original file until the compressed version has passed the actual test you care about.',
    steps: [
      `Start with the ${formatName.toUpperCase()} file that needs to meet the target size requirement.`,
      `Set the compression target around ${titleFormat} and preserve the parts of the image that carry information.`,
      `Review the result for readability, detail retention, and visible artifacts before downloading it.`
    ],
    faqs: [
      makeFaq(`Will compressing ${formatName.toUpperCase()} under ${titleFormat} keep the file readable?`, 'Yes, when the workflow focuses on clarity first and reduces only the parts of the image that do not carry useful detail.'),
      makeFaq(`What is the most common reason this task fails?`, 'It usually fails because the file is compressed too aggressively too early, which removes the information that makes the content usable.'),
      makeFaq(`Should I always choose the smallest file possible?`, 'No. The strongest result is the smallest file that still looks correct for its destination and remains easy to understand.'),
      makeFaq(`When does a format change help?`, 'A format change helps when the current file type is inefficient for the job and a different output format preserves clarity better at a lower size.')
    ]
  };
}

export function getFormatPairIntelligence(fromFmt: string, toFmtUpper: string, toFormat: TargetFormat): RouteEditorialContent {
  const fromLabel = fromFmt.toUpperCase();
  const toLabel = toFmtUpper.toUpperCase();
  const base = {
    badge: 'Format conversion made practical',
    section1Title: `Why ${fromLabel} to ${toLabel} conversion should be guided by the destination`,
    section1Body: 'Image format history helps explain why this choice matters. JPEG became the compatibility standard for photographs, PNG became the standard for editing and transparency, WebP was built for modern web delivery, and AVIF pushes compression further for browsers that support it. Expertise means choosing the output format based on the real job: compatibility, transparency, performance, or editing flexibility. Trustworthiness improves when the output is tested in the environment where it will actually be used.',
    section2Title: 'Compatibility, security, and performance advice that actually helps',
    section2Body: 'Professional workflows should test the exported file in the destination app, browser, or upload form rather than assuming a format change is automatically better. Common mistakes include using the highest compression setting without checking the result, ignoring alpha transparency, or moving to a newer format when a more universal output would save time later. Security advice matters because local processing keeps your file under your control and limits exposure of personal or client content. Accessibility advice matters because images with text, logos, or faces must stay legible across screens and devices.',
    steps: [
      `Upload or drop your ${fromLabel} file into the converter workspace.`,
      `Choose the ${toLabel} output and adjust the quality to match your destination.`,
      `Review the result and download the finished file once it looks right.`
    ],
    faqs: [
      makeFaq(`Is converting ${fromLabel} to ${toLabel} a privacy-safe process?`, 'Yes. The workflow stays local to the browser so your image file does not need to be uploaded to a remote server.'),
      makeFaq(`Why would I choose ${toLabel} instead of keeping ${fromLabel}?`, 'Because the target format may be more compatible, more practical for the platform, or easier to use in your existing content workflow.'),
      makeFaq(`What usually goes wrong during a format conversion?`, 'The most common issue is choosing a preset that is too aggressive, which can damage the appearance of the final image.'),
      makeFaq(`When should I convert a file in batches?`, 'Batch conversion is most useful when you are processing many similar files, such as screenshots, exports, or photos taken on the same device.')
    ]
  };

  if (fromFmt === 'HEIC' && toFmtUpper === 'JPG') {
    return {
      ...base,
      badge: 'HEIC to JPG for everyday compatibility',
      section1Title: 'Why HEIC to JPG conversion is still one of the most practical image tasks',
      section1Body: 'Apple introduced HEIC as a compact camera format, but it is not always the most practical choice once the photo leaves the device. Experience shows that HEIC files are efficient for storage but often awkward for Windows PCs, Android phones, email clients, and upload forms. Expertise means choosing JPG when compatibility matters more than squeezing out every last byte. Trustworthiness improves when the output is easy to open, easy to share, and easy to re-use without special handling.',
      section2Title: 'When compatibility should matter more than file efficiency',
      section2Body: 'Professional workflows should consider the destination before preserving the original container. Common mistakes include assuming the newest format is always the best choice for sharing, or failing to test the file in the app or portal where it will be used. Best practice is to keep the output readable, preserve the important visual details, and avoid over-compressing the photo just because it is going to be shared. Security advice remains simple: local processing gives you more control over the image and avoids unnecessary exposure of personal content.',
      steps: [
        'Import the HEIC or HEIF file you want to make more widely usable.',
        'Select the JPG output and adjust the quality for sharing, uploads, or archival needs.',
        'Review the exported file and save it once it looks clear and practical.'
      ],
      faqs: [
        makeFaq('Will HEIC to JPG make my photos easier to share?', 'Yes. JPG is accepted across more systems, which makes it easier to send, upload, and open without compatibility issues.'),
        makeFaq('Is there a visible quality penalty?', 'There can be a small one, but it is often worth it for compatibility and day-to-day usability.'),
        makeFaq('Is this useful if I only have a few photos?', 'Yes. The workflow is still helpful because it removes friction even when the batch is small.'),
        makeFaq('Why might someone choose JPG over HEIC for the same file?', 'Because JPG is easier to open and more predictable for people using a wide range of devices and apps.')
      ]
    };
  }

  if (fromFmt === 'WEBP' && toFmtUpper === 'PNG') {
    return {
      ...base,
      badge: 'WebP to PNG for editing and transparency',
      section1Title: 'Why WebP to PNG still matters in professional design work',
      section1Body: 'WebP is strong for fast web delivery, but many designers and editors still need a more traditional raster file when they want broad compatibility with image software. Experience shows that PNG remains the more dependable choice when a graphic needs repeated editing, transparent backgrounds, or a predictable handoff to another tool. Expertise means choosing PNG when the next step in the workflow depends on editing flexibility rather than file efficiency.',
      section2Title: 'When a more universal format is the better choice',
      section2Body: 'Professional workflows should consider whether the file will be edited again, archived, or handed to another team member. Common mistakes include assuming the web-optimized format is always the best choice for every stage of the workflow, or failing to preserve transparency when the asset depends on it. Best practice is to test the output in the editor or delivery app that will actually use the file. Security advice remains important because the workflow should not introduce unnecessary uploads just to preserve compatibility.',
      steps: [
        'Import the WebP asset that will be used in a design, editing, or archival workflow.',
        'Choose the PNG output and preserve transparency if the asset needs it.',
        'Review the finished file in your editor or delivery app before saving it.'
      ],
      faqs: [
        makeFaq('Why would I convert WebP to PNG instead of keeping WebP?', 'Because PNG is often easier to edit and more predictable in design tools that expect a traditional raster format.'),
        makeFaq('Does PNG preserve transparency better?', 'Yes. For many graphics and overlays, PNG is a more dependable choice when transparency and editing flexibility matter.'),
        makeFaq('Is WebP still worth using for web delivery?', 'Absolutely. WebP remains excellent for publication and performance-focused delivery, even when PNG is preferred later in the workflow.'),
        makeFaq('Is this conversion useful for logos?', 'Yes. Logos and interface assets often benefit from a transparent, editable PNG output.')
      ]
    };
  }

  return base;
}

export function getFallbackEditorialContent(titleName: string): RouteEditorialContent {
  const friendlyTitle = titleName || 'this utility';
  return {
    badge: 'Helpful browser-native guidance',
    section1Title: `How ${friendlyTitle} fits into a better image workflow`,
    section1Body: 'A useful utility page should explain the problem, the tradeoff, and the practical outcome in a way that helps the reader decide quickly. Experience shows that users need context before they can judge whether an image should be converted, compressed, or preserved as-is. Expertise comes from explaining why one format is more appropriate than another for a given environment. Trustworthiness improves when the guidance is specific, honest, and focused on the actual destination of the file.',
    section2Title: 'Why this guidance is more useful than a one-line tool description',
    section2Body: 'Professional workflows are usually a sequence of choices rather than a single action. Common mistakes include over-promising a perfect result, skipping a real-world test, and treating every asset as if it had the same requirements. Best practice is to review the source quality, the output target, and the platform where the file will be used before making a second pass. Accessibility, privacy, and performance should be part of the decision because a file that is technically processed but visually weak or insecure is not a successful outcome.',
    steps: [
      'Identify the image task you need to complete before changing any settings.',
      'Choose the output option that best matches the destination platform or upload rule.',
      'Review the output, keep the source file as a backup, and use the result only once it feels correct.'
    ],
    faqs: [
      makeFaq(`Why is ${friendlyTitle} worth reading before using the tool?`, 'Because understanding the task helps the user avoid a result that is technically generated but practically wrong.'),
      makeFaq('What makes this guidance different from a generic FAQ?', 'It focuses on decision-making, practical tradeoffs, and the reasons behind the output choice rather than repeating the same statements across every page.'),
      makeFaq('When should I keep the original file?', 'Keep the original file whenever the output is meant to be revised, submitted, or archived and you may need to return to the source later.'),
      makeFaq('How do I know the final output is good enough?', 'It should meet the destination requirement, look correct in context, and not introduce artifacts that distract from the content.')
    ]
  };
}
