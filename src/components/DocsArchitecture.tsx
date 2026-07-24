import React from 'react';
import { ShieldCheck, Zap, Activity } from 'lucide-react';

export const DocsArchitecture = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-left">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        Technical Architecture
      </h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
        Zapixal is built on a modern, privacy-first technical stack. Unlike legacy web converters that rely on centralized cloud servers (AWS, GCP, etc.) to encode images, Zapixal pushes the entire processing workload to the edge—directly into your local browser thread.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            WebAssembly (WASM) & V8 Memory Sandboxing
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
            We compile heavy C/C++ imaging libraries (like <code>libvips</code>, <code>libheif</code>, and <code>mozjpeg</code>) into WebAssembly. This allows JavaScript to execute near-native speed encoding matrices entirely within the browser's V8 engine sandbox.
          </p>
          <ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 space-y-2">
            <li><strong>Zero Server Cost:</strong> By using the client's CPU, infrastructure costs are virtually zero.</li>
            <li><strong>Sandboxed Memory:</strong> Images are processed in isolated WASM memory heaps, meaning no malicious scripts can access the raw image buffers.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Local EXIF Stripping & Data Privacy
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            When you choose to strip EXIF data, Zapixal uses HTML5 Canvas APIs and byte-level buffer manipulation to strip Application Segments (APP1/APP2) which house GPS coordinates and camera serial data. Because this happens offline, there is zero risk of man-in-the-middle (MITM) interception of your sensitive location history.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            Offline Service Workers
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Zapixal is a Progressive Web App (PWA). Upon your first visit, our Service Worker caches the WASM binaries and UI assets. You can literally turn off your Wi-Fi, open Zapixal.com, and batch convert thousands of images. This architectural choice strongly aligns with Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals for high-utility, reliable web tools.
          </p>
        </section>
      </div>
    </div>
  );
};
