import React from 'react';
import { ShieldCheck, Lock, Activity, Image as ImageIcon } from 'lucide-react';

export const ValuePropsSection = React.memo(function ValuePropsSection() {
  return (
    <section className="w-full max-w-5xl mx-auto mb-8 rounded-3xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-[#3c4043] dark:bg-[#303134]/90 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-blue-600 dark:text-[#8ab4f8] mb-1">
            Why people choose Zapixal
          </p>
          <h2 className="mt-2 text-lg font-black text-neutral-900 dark:text-white sm:text-xl">
            A stronger image workflow for privacy, compatibility, and speed
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-[#2d523c] dark:bg-[#1e3427] dark:text-[#81c995]">
          <ShieldCheck className="h-4 w-4" />
          Zero uploads · 100% local
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
            <Lock className="h-4 w-4 text-emerald-600" />
            Privacy-first by design
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
            Files stay in your browser, which lowers the risk of exposing metadata, documents, or personal content.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
            <Activity className="h-4 w-4 text-blue-600" />
            Built for real workflows
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
            The app supports batch work, size targets, format changes, and accessible delivery for web, ecommerce, and documents.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
            <ImageIcon className="h-4 w-4 text-amber-600" />
            Better output decisions
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
            The guidance explains when to use JPEG, PNG, WebP, AVIF, or a smaller target size so the results are practical, not just smaller.
          </p>
        </div>
      </div>
    </section>
  );
});
