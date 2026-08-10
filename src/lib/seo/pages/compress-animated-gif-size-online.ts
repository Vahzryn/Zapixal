import { TargetFormat } from '../../../types';
import { RouteEditorialContent } from '../content';
import { DOMAIN } from '../routes';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getCompressAnimatedGifContent(): RouteEditorialContent {
  return {
    badge: 'Local First-Frame Quantization',
    section1Title: 'Client-side static GIF compression and frame flattening',
    section1Body: 'While animated GIFs are popular for looping sequences, standard browser rendering and local canvas constraints mean that web-based file manipulation often flattens animated sequences. Zapixal specializes in private, client-side static GIF compression. When you upload any GIF file—whether a single static graphic or a multi-frame animation—it is processed entirely in your web browser. If an animated GIF is supplied, our client-side processing pipeline flattens the file to its first frame, enabling you to optimize the dimensions and compress the output as a highly optimized static GIF image without any server-side round-trips.',
    section2Title: 'Browser-based palette quantization and first-frame extraction',
    section2Body: 'Since GIF files are limited to a maximum 256-color palette, compressing them efficiently relies on intelligent color quantization. Rather than sending your private files to third-party cloud servers, Zapixal executes standard spatial quantization routines directly inside your browser. This is ideal for extracting crisp, low-latency static thumbnail previews from heavy animated files, or optimizing original static GIF screenshots. Please note that animation is not preserved in this offline workflow; input files are flattened to their initial frame to maintain instant client-side performance and total privacy.',
    steps: [
      'Upload your GIF file (animated or static) into the browser-side dropzone.',
      'Adjust compression quality and dimensions. Multi-frame files will be flattened to their first frame.',
      'Download the optimized, lightweight static GIF image directly to your local storage.'
    ],
    faqs: [
      makeFaq('Does Zapixal preserve GIF animations?', 'No. To maintain complete privacy and high browser-based performance without massive video-processing overhead, Zapixal flattens any multi-frame animated GIF to its first frame. The output is saved as an optimized, static GIF image.'),
      makeFaq('Why does my compressed GIF no longer loop or animate?', 'Our privacy-first architecture runs entirely client-side using native Canvas APIs, which do not natively compile multi-frame GIF sequences. Any input GIF is optimized and exported as a single-frame static image to minimize file size and avoid client-side CPU lockups.'),
      makeFaq('What are the benefits of flattening and compressing a GIF locally?', 'By flattening multi-frame files into static GIF images, you can instantly reduce massive file sizes by over 95%, making them highly suited for static thumbnails, website headers, and fast-loading web assets with zero data tracking.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/compress-animated-gif-size-online';
  const guideContent = getCompressAnimatedGifContent();
    return {
      path,
      h1Title: 'Compress Static GIF Images & Extract First-Frame Previews',
      metaTitle: 'Compress GIF File Size — Static Frame Optimization',
      metaDescription: 'Reduce static GIF file sizes and extract high-performance static preview frames from animated GIFs entirely in your browser. Processed offline.',
      canonicalUrl: fullUrl,
      isIndexable: true,
      pageCategory: 'compression',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compress GIF', url: path }],
      guideContent,
      jsonLd: generateJsonLdSchemas(
        'Compress Static GIF Images & Extract First-Frame Previews',
        'Compress static GIF files locally or extract/flatten the first frame of an animated GIF in browser memory.',
        fullUrl,
        guideContent.faqs,
        [{ name: 'Home', url: '/' }, { name: 'Compress GIF', url: path }],
        'compression',
        guideContent.steps
      )
    };
}
