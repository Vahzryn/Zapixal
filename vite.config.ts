import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1500, // Supress the limit warning since heic2any is fundamentally large
      rollupOptions: {
        output: {
          manualChunks: {
            jspdf: ['jspdf'],
            jszip: ['jszip'],
            heic2any: ['heic2any'],
            react: ['react', 'react-dom']
          }
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
