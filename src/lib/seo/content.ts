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

