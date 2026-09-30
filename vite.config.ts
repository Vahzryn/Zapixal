import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      wasm()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2022',
      sourcemap: "hidden" as const
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
      allowedHosts: true as true,
      hmr: process.env.DISABLE_HMR === 'true'
        ? false
        : process.env.HMR_CLIENT_PORT
          ? { clientPort: parseInt(process.env.HMR_CLIENT_PORT, 10) }
          : true,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
