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
    section1Body: 'The most effective image workflows start by working backward from where the file will ultimately live. Before tweaking sliders or hitting convert, consider the destination. JPEG is still the undisputed standard for general compatibility and photography, while PNG handles transparency and crisp graphics best. WebP offers excellent efficiency for modern websites, and HEIC saves space on mobile devices even if it struggles with cross-platform sharing. By processing these files entirely within your browser, you eliminate unnecessary cloud uploads, ensuring your raw assets never leave your machine.',
    section2Title: 'Best practices for privacy, performance, and accessibility',
    section2Body: 'A reliable process means keeping your original files intact while generating optimized versions for specific tasks. Many people make the mistake of aggressively compressing an image just to make it smaller, only to ruin the legibility of important text or blur critical details. Whether you are prepping product shots for an online store, optimizing hero banners to improve page load times, or converting scanned documents, the goal is balance. Local conversion keeps your private data and metadata secure, while thoughtful compression ensures that faces, text, and interface elements remain sharp and accessible to everyone.',
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
    section1Body: 'Whether you are dealing with strict upload limits on government portals, tight constraints for marketplace product listings, or performance targets for a website, hitting a specific file size can be challenging. The trick is to reach that number without destroying the image. For photography, dialing in a JPEG is often the easiest path. If you are building for the web and the platform supports it, WebP and AVIF can deliver the same visual fidelity at a fraction of the weight, giving you more headroom to stay under the limit.',
    section2Title: 'What to verify before and after compression',
    section2Body: 'Trimming file size shouldn\'t mean sacrificing the core purpose of the image. Too often, files are squashed indiscriminately, leaving text unreadable or product edges looking jagged and artifact-heavy. When compressing things like ID scans, screenshots, or detailed ecommerce photography, you have to prioritize clarity over maximum compression. Always keep your original high-resolution master file safe, and visually verify the compressed version at its actual display size before you publish or submit it.',
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
    section1Body: 'Different image formats exist to solve entirely different problems. While JPEG has spent decades becoming the universal standard for photos, PNG carved out its niche by flawlessly handling transparency and sharp graphical edges. Newer formats like WebP and AVIF were engineered specifically to make the web faster. Converting between them shouldn\'t be a random guess; it should be a deliberate choice based on what the file needs to do next. And because this conversion happens directly on your device, you don\'t have to worry about handing your files over to a third-party server.',
    section2Title: 'Compatibility, security, and performance advice that actually helps',
    section2Body: 'Switching formats is only useful if the new file actually solves a problem for your workflow. It is easy to assume that a newer format is inherently better, but if the destination platform doesn\'t support it, or if you accidentally strip out necessary transparency, the conversion creates more headaches than it solves. Always verify your exported files in their final context—whether that is an email client, a CMS, or a design tool. Doing this locally not only speeds up the process, but ensures client assets and personal photos remain strictly private.',
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
      section1Body: 'HEIC is a brilliant piece of engineering for saving space on an iPhone, but it can turn into a massive headache the moment you try to share it outside the Apple ecosystem. If you have ever tried to upload an HEIC to a web form, send it to a Windows PC, or open it on an older Android device, you have likely hit a wall. Converting to JPG trades a tiny bit of storage efficiency for absolute, universal compatibility, ensuring that anyone can open your photo without downloading special software.',
      section2Title: 'When compatibility should matter more than file efficiency',
      section2Body: 'When sharing photos, the ability for the recipient to actually view the file matters far more than using the most cutting-edge compression algorithm. Holding onto HEIC makes sense for your personal archive, but when you are handing files off to a client, an employer, or a printing service, sticking to the universally recognized JPG format prevents endless friction. Handling this conversion right in your browser means you can fix these compatibility issues instantly, without exposing your private camera roll to the cloud.',
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
      section1Body: 'While WebP has taken over the internet by drastically reducing page load times, it can be notoriously frustrating to work with in traditional design workflows. Many older image editors, presentation tools, and desktop applications still struggle to import WebP files correctly. Converting back to PNG restores that expected behavior, giving you a widely supported, lossless format that cleanly preserves transparency and makes it easy to edit the asset across any software suite.',
      section2Title: 'When a more universal format is the better choice',
      section2Body: 'Web optimization formats are great for final delivery, but they are rarely the right choice for an active working file. If you need to drop a graphic into a client presentation, hand it off to a video editor, or keep it in a shared asset library, you need reliability over extreme compression. Converting to PNG ensures the file behaves predictably and looks perfectly crisp, without losing the transparent background. By doing this locally, you can quickly untangle format issues without breaking your flow to upload files to a remote server.',
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
    section1Body: 'Making the right choice with image processing often comes down to understanding exactly what the file is supposed to do next. It is not just about blindly converting formats; it is about weighing the tradeoffs between visual quality, file size, and compatibility. A solid workflow provides the context you need to decide whether an asset should be compressed further, shifted to a new format, or simply left alone. Clear, practical advice helps you hit your target without second-guessing the technical details.',
    section2Title: 'Why this guidance is more useful than a one-line tool description',
    section2Body: 'Managing images is rarely a one-size-fits-all process. Applying the exact same compression rules to a vibrant hero graphic, a text-heavy screenshot, and a transparent logo usually results in at least one of them looking terrible. The best approach involves assessing the original asset and understanding the limitations of where it is going to be published. By balancing performance requirements with readability and security, you ensure that the final result isn\'t just a smaller file, but a genuinely better one for its specific use case.',
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

