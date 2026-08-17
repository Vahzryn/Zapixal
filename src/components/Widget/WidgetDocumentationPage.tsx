import React, { useState } from 'react';
import { Code, Shield, Zap, Layers, Copy, Check, Info, Cpu, Lock, HelpCircle } from 'lucide-react';

export default function WidgetDocumentationPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState('80');

  const embedCode = `<iframe 
  src="https://zapixal.com/embed?format=${format}&quality=${quality}" 
  width="100%" 
  height="420" 
  style="border: none; border-radius: 12px; max-width: 400px; width: 100%;" 
  title="Zapixal In-Browser Image Compressor"
  loading="lazy"
  sandbox="allow-scripts allow-downloads allow-same-origin"
></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500 min-h-screen">
      {/* Page Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-4">
          <Code className="w-3.5 h-3.5" />
          Third-Party Integration SDK & Iframe
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">
          Zapixal Embeddable Image Widget
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Provide zero-dependency, 100% private client-side image processing on your blog, form, or web portal without running server encoders or incurring API bills.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start mb-16">
        {/* Left Column: Embed Configurator & Instructions */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Embed Snippet Configurator
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Customize default target settings using query parameters. The widget operates inside a sandboxed iframe to guarantee zero CSS collisions or global script leaks.
            </p>

            {/* Interactive Configuration Selectors */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Default Target Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="webp">WebP (Recommended - Smallest)</option>
                  <option value="jpeg">JPEG (Universal Compatibility)</option>
                  <option value="png">PNG (Lossless Alpha)</option>
                  <option value="avif">AVIF (Next-Gen High Compression)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Default Quality Level ({quality}%)
                </label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full mt-3 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Generated Code Snippet */}
            <div className="relative group">
              <div className="absolute top-3 right-3">
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                  aria-label="Copy snippet to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Snippet'}
                </button>
              </div>
              <pre className="bg-neutral-900 text-neutral-300 p-5 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-neutral-800">
                <code>{embedCode}</code>
              </pre>
            </div>
          </section>

          {/* Value Propositions */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Architectural Highlights</h2>
            
            <div className="flex gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">Zero Third-Party Data Exposure</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  User images are loaded into browser RAM memory via WebAssembly array buffers. Bytes are never transmitted over HTTP networks, guaranteeing complete privacy compliance (GDPR/HIPAA friendly).
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800">
              <Cpu className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">Host Page Protection & Isolation</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Because the widget renders inside an iframe sandboxed environment, host-page JavaScript frameworks (React, Vue, Angular) and global CSS definitions can never conflict with widget operation.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">Universal Image Format Support</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Accepts Apple HEIC/HEIF photos, transparent PNGs, JPEGs, WebP, AVIF, TIFF, and BMP files directly from desktop drop zones or mobile photo pickers.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Interactive Iframe Preview */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-neutral-100 dark:bg-neutral-800/70 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-center shadow-inner">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Live Embedded Widget Preview
            </h3>
            
            <div className="flex justify-center">
              <iframe 
                src={`/embed?format=${format}&quality=${quality}`} 
                width="100%" 
                height="420" 
                style={{ border: 'none', borderRadius: '12px', maxWidth: '380px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} 
                title="Zapixal Image Compressor Live Embed Preview"
              ></iframe>
            </div>
            
            <p className="text-[11px] text-neutral-500 mt-4">
              Test dragging or picking a photo directly above to verify in-browser compression.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Specifications & Integration Guide */}
      <section className="mb-16 border-t border-neutral-200 dark:border-neutral-800 pt-12">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Technical Specifications & Limits</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Query Parameters Table */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-3">Supported Query Parameters</h3>
            <div className="space-y-3 text-xs">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <code className="font-bold text-blue-600 dark:text-blue-400">format</code>
                <span className="text-neutral-500 ml-2">(default: "webp")</span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Accepts: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">webp</code>, <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">jpeg</code>, <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">png</code>, <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">avif</code>.</p>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <code className="font-bold text-blue-600 dark:text-blue-400">quality</code>
                <span className="text-neutral-500 ml-2">(default: 80)</span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Accepts integer between 10 and 100 representing encoder quality level.</p>
              </div>
              <div>
                <code className="font-bold text-blue-600 dark:text-blue-400">sandbox</code>
                <span className="text-neutral-500 ml-2">(recommended)</span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Requires <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">allow-scripts allow-downloads allow-same-origin</code> attributes on the host iframe tag.</p>
              </div>
            </div>
          </div>

          {/* Browser Compatibility & Limits */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-3">Browser Requirements & Memory Limits</h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span><strong>Supported Browsers:</strong> Chrome 88+, Firefox 85+, Safari 14.1+, Edge 88+, iOS Safari 14.5+, Android Chrome.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span><strong>File Size Guidance:</strong> Optimized for images up to 50MB per file. For heavy batch processing (100+ files or multi-gigabyte photos), refer users to the main Zapixal app.</span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Troubleshooting:</strong> If downloads do not trigger on embedded mobile WebViews, verify that your native app shell allows standard HTML5 blob download links.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Cross-Link to Main Tools */}
      <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Need Advanced Batch Conversion or Custom KB Limits?</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-xl mx-auto text-sm">
          While the embed widget handles quick single-file compression, the full Zapixal app provides multi-file queue management, exact file size target controls, EXIF metadata stripping, and customizable aspect-ratio cropping.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => onNavigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
          >
            Launch Full Zapixal App
          </button>
          <button 
            onClick={() => onNavigate('/articles/benchmarks')}
            className="px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold rounded-xl transition-colors text-sm"
          >
            View Codec Benchmarks
          </button>
        </div>
      </div>
    </div>
  );
}
