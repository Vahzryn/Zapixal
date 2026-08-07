import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import wasm from 'vite-plugin-wasm';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      wasm(),
      cssInjectedByJsPlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
      sourcemap: "hidden" as const,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            icons: ['lucide-react'],
            chart: ['recharts'],
            pdf: ['jspdf'],
            exif: ['exifr'],
            codecs: ['@jsquash/jpeg', 'imagequant', 'upng-js', 'heic2any']
          }
        }
      }
    },
    worker: {
      format: 'es' as const,
      plugins: () => [
        wasm()
      ]
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR environment check
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === 'true' ? false : { clientPort: 443 },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
