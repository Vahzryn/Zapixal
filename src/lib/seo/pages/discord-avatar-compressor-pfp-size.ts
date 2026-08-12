import { RouteEditorialContent } from '../content';
import { generateJsonLdSchemas } from '../schema';
import { SeoRouteData } from '../../seoEngine';

function makeFaq(question: string, answer: string) {
  return { question, answer };
}

export function getDiscordCompressorContent(): RouteEditorialContent {
  return {
    badge: 'Discord-Ready Profile Optimizer',
    section1Title: 'Perfecting your Discord presence with optimized avatars and banners',
    section1Body: 'Discord’s strict file size limits (8MB for standard users, higher for Nitro) often make it difficult to upload high-resolution profile pictures (PFPs) or animated banners. Rejection messages are a common frustration when trying to share your digital identity. Zapixal’s Discord compressor is pre-calibrated to hit these exact targets. We provide automatic 1:1 cropping for avatars and optimize byte-counts to ensure your profiles load instantly for your friends and server-mates, without the blurry artifacts introduced by low-quality mobile apps.',
    section2Title: 'Balancing visual detail with Discord’s byte-size constraints',
    section2Body: 'Whether you’re uploading a detailed character illustration or a high-energy animated GIF, staying under Discord’s limit while maintaining sharpness is a challenge. Zapixal uses advanced quantization to keep your edges crisp and colors vibrant even at small file sizes. Our tool also allows you to preview the 128x128 avatar circle, ensuring that no vital parts of your profile picture are cut off by Discord’s interface. Processing everything locally in your browser ensures that your personal branding assets remain private and secure until you’re ready to upload them.',
    steps: [
      'Drop your high-res avatar or banner into the Discord optimizer.',
      'Use the 1:1 square crop for PFPs and set the target size to 8MB.',
      'Download your Discord-ready asset and update your profile instantly.'
    ],
    faqs: [
      makeFaq('What is the maximum file size for a Discord profile picture?', 'For standard Discord users, the limit is 8MB. Nitro users have a higher 100MB limit, but 8MB remains the ideal target for fast loading across all devices.'),
      makeFaq('Why does my Discord PFP look blurry?', 'Discord often compresses images aggressively if they are over the limit. Using Zapixal to pre-optimize your file ensures you control the quality and sharpness before upload.'),
      makeFaq('Can I compress animated GIFs for Discord here?', 'Yes. Zapixal can shrink the byte-count of animated GIFs to help them fit under Discord’s Nitro and non-Nitro profile banner limits.')
    ]
  };
}

export function getPageSeo(fullUrl: string): SeoRouteData {
  const path = '/discord-avatar-compressor-pfp-size';
  const guideContent = getDiscordCompressorContent();
  return {
    path,
    h1Title: 'Discord Avatar Compressor: Free PFP & Banner Size Reducer',
    metaTitle: 'Discord Avatar & PFP Compressor — Free Sizing Tool',
    metaDescription: 'Shrink your Discord profile pictures and banners to fit the 8MB limit. 1:1 square cropping and high-fidelity compression for avatars. Fast, free, and private.',
    canonicalUrl: fullUrl,
    isIndexable: true,
    presetResize: { maxWidth: 512, maxHeight: 512 },
    pageCategory: 'compression',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Discord Compressor', url: path }],
    guideContent,
    jsonLd: generateJsonLdSchemas(
      'Discord Profile Image Optimization',
      'Optimize your Discord identity with our free avatar and banner compressor. Meet 8MB limits with crisp, high-quality results.',
      fullUrl,
      guideContent.faqs,
      [{ name: 'Home', url: '/' }, { name: 'Discord Compressor', url: path }],
      'compression',
      guideContent.steps
    )
  };
}
