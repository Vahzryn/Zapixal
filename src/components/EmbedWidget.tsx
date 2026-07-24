import React, { useState } from 'react';
import { Code, Copy, Check, ChevronDown, ChevronUp, Globe } from 'lucide-react';

export function EmbedWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://zapixal.com';

  const embedCode = `<!-- Zapixal Free Local Image Converter Widget -->
<iframe src="${currentDomain}" width="100%" height="650" frameborder="0" style="border-radius:20px; overflow:hidden; border:1px solid #e5e7eb;" title="Zapixal Free Image Converter"></iframe>
<p style="font-size:12px; font-family:sans-serif; text-align:center; margin-top:8px; color:#6b7280;">
  Powered by <a href="${currentDomain}" target="_blank" rel="noopener noreferrer" style="color:#2563eb; text-decoration:underline;">Zapixal Image Converter</a>
</p>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl overflow-hidden shadow-sm transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-6 py-5 text-left hover:bg-neutral-50 dark:hover:bg-[#3c4043]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-[#1e293b] text-blue-600 dark:text-[#8ab4f8] rounded-2xl">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-[#e8eaed]">
              Embed Zapixal Converter on Your Website
            </h3>
            <p className="text-xs text-neutral-500 dark:text-[#9aa0a6] font-medium">
              Free lightweight widget snippet for blogs, web tools, and SaaS sites
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-3 py-1 text-xs font-bold text-blue-700 dark:text-[#8ab4f8] bg-blue-50 dark:bg-[#1e293b] rounded-full">
            Free HTML Snippet
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-neutral-200 dark:border-[#3c4043] bg-neutral-50/50 dark:bg-[#202124]/50 animate-in fade-in duration-200">
          <p className="text-xs text-neutral-600 dark:text-[#9aa0a6] font-medium mb-3">
            Copy and paste this clean, responsive HTML snippet into your website or blog to give your visitors free, 100% private client-side image conversion.
          </p>

          <div className="relative mb-4">
            <pre className="p-4 bg-neutral-900 text-neutral-200 text-xs font-mono rounded-2xl overflow-x-auto leading-relaxed border border-neutral-800">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-[#8ab4f8] dark:text-[#202124] rounded-xl transition-all shadow-md active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-800" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 dark:text-[#9aa0a6]">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Includes responsive styling & subtle "Powered by Zapixal" backlink</span>
          </div>
        </div>
      )}
    </div>
  );
}
