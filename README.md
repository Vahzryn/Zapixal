# Zapixal

Fast, privacy-first image conversion and compression directly in your browser.

Zapixal processes images locally using WebAssembly, Web Workers, and browser APIs. Your images are not uploaded to a server for conversion.

## Features

- Local, client-side image processing
- Batch conversion and compression
- HEIC, JPG, PNG, WebP, AVIF, BMP, and ICO support
- Web Workers for responsive processing
- Adaptive processing for different devices
- No account required
- No image uploads for conversion
- 42+ dedicated image tools

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- Web Workers
- WebAssembly
- Cloudflare Pages
- Cloudflare Functions

## Development

Install dependencies:

```bash
npm install
```


Start the development server:
```
npm run dev
```

Build for production:
```
npm run build
```

The production output is generated in dist/.

Testing

Run the test suite:
```
npm test
```

Run TypeScript checks:
```
npm run lint
```

Embeds

Zapixal provides optional public integrations for websites and blogs.

Web Component
<script src="https://zapixal.com/zapixal-web-component.js" defer></script>

<zapixal-blog-tool></zapixal-blog-tool>
Widget
<div id="zapixal-widget"></div>
<script src="https://zapixal.com/widget.js" defer></script>

These integrations are provided free of charge and process supported images locally in the user's browser.

Privacy

Zapixal's core image processing is client-side. Image files are processed in the user's browser rather than uploaded to a conversion server.

Feedback is handled separately through a Cloudflare Function.

Deployment

Zapixal is designed for static deployment on platforms such as Cloudflare Pages.

The production build generates the static application and required SEO assets.

License

See the repository license for usage terms.
