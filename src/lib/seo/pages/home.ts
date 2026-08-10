import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

export function getHomeContent(): RouteEditorialContent {
  return {
    badge: 'Practical image workflow',
    section1Title: 'How to choose the right image workflow before you convert anything',
    section1Body: 'The most effective image workflows start by working backward from where the file will ultimately live. Before tweaking sliders or hitting convert, consider the destination. JPEG is still the undisputed standard for general compatibility and photography, while PNG handles transparency and crisp graphics best. WebP offers excellent efficiency for modern websites, and HEIC saves space on mobile devices even if it struggles with cross-platform sharing. By processing these files entirely within your browser, you eliminate unnecessary server uploads, ensuring your raw assets never leave your machine.',
    section2Title: 'Best practices for privacy, performance, and accessibility',
    section2Body: 'A reliable process means keeping your original files intact while generating optimized versions for specific tasks. Many people make the mistake of aggressively compressing an image just to make it smaller, only to ruin the legibility of important text or blur critical details. Whether you are prepping product shots for an online store, optimizing hero banners to improve page load times, or converting scanned documents, the goal is balance. Local conversion keeps your private data and metadata secure, while thoughtful compression ensures that faces, text, and interface elements remain sharp and accessible to everyone.',
    steps: [
      'Select your source image files or drag them into the browser workspace.',
      'Choose the target format and adjust visual quality or sizing parameters locally.',
      'Export your optimized images instantly with zero server round-trips.'
    ],
    faqs: [
      { question: 'Are my images uploaded to any servers?', answer: 'No. Zapixal uses WebAssembly and standard browser APIs to process all images entirely on your local machine. Your files never leave your computer.' },
      { question: 'Is Zapixal free to use?', answer: 'Yes. Zapixal is completely free to use, without any registration, subscription, or watermark requirements.' }
    ]
  };
}

export function getPageSeo(fullUrl: string, path: string): SeoRouteData {
  const guideContent = getHomeContent();
  return {
    path,
    h1Title: 'Zapixal: Privacy-First Image Converter',
    metaTitle: 'Zapixal — Private In-Browser Image Converter & Compressor',
    metaDescription: 'Convert, compress, and crop images entirely inside your browser with WebAssembly. Images are processed locally and are not uploaded to servers.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    pageCategory: 'home',
    breadcrumbs: [{ name: 'Home', url: '/' }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Zapixal: Privacy-First Image Converter',
      'Convert and compress images entirely in your browser with zero server uploads.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }],
      'home',
      guideContent.steps
    )
  };
}
