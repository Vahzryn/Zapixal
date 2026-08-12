# Zapixal Image Converter

Zapixal is a lightning-fast, 100% private, client-side batch image converter. It processes files like HEIC, JPG, PNG, WEBP, and AVIF entirely within the user's web browser memory. Unlike traditional converters, it never uploads photos to a server, guaranteeing full privacy and local client-side processing.

## Features

- **100% Private:** No server uploads. All processing happens locally in the browser.
- **Lightning Fast:** Uses client-side Web Workers and Canvas for zero-wait conversions.
- **Format Support:** Convert between HEIC, JPG, PNG, WEBP, AVIF, BMP, and ICO.
- **Batch Processing:** Convert and compress multiple images simultaneously.
- **Embeddable Web Component:** Includes a native `<zapixal-blog-tool>` Web Component for embedding the converter in blogs or web pages without the SEO or `X-Frame-Options` restrictions of traditional iframes.
- **Core Web Vitals Optimized:** Built for speed with sub-second LCP, low INP, and zero CLS. Includes automated programmatic SEO and JSON-LD schema.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Performance:** Native Web Workers, Canvas API, `heic2any` (lazy-loaded)

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Production Build (Cloudflare Pages / Vercel / Netlify)

This project is fully static and optimized for Edge networks.

1. Build the production assets:
   ```bash
   npm run build
   ```

2. The compiled assets will be in the `/dist` directory. You can configure your hosting provider (e.g., Cloudflare Pages) to use this directory as the build output.

## Embeds & External Integrations

Zapixal provides lightweight public assets for third-party websites and blogs to integrate image conversion tools directly into their pages:

1. **Web Component Embed (`public/zapixal-web-component.js`)**:
   Provides the `<zapixal-blog-tool>` custom element. It renders an in-browser dropzone powered by local Canvas and HEIC decoders without requiring iframes.

   ```html
   <script src="https://zapixal.com/zapixal-web-component.js" defer></script>
   <zapixal-blog-tool>
     <noscript>
       <div style="padding: 2rem; text-align: center; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 1rem; color: #475569;">
         <strong>JavaScript is Required</strong><br>
         Zapixal processes images securely in your browser to protect your privacy. Please enable JavaScript to use this tool.
       </div>
     </noscript>
   </zapixal-blog-tool>
   ```

2. **Promo Callout Badge (`public/widget.js`)**:
   A lightweight helper script that injects a compact informational box into `<div id="zapixal-widget"></div>` with a link to launch the main Zapixal application.

*Note: These assets are separate optional integration surfaces that operate completely client-side.*
