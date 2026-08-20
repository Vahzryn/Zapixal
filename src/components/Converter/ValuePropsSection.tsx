import React from 'react';
import { ShieldCheck, Lock, Activity, Wrench } from 'lucide-react';

export const ValuePropsSection = React.memo(function ValuePropsSection() {
  return (
    <section className="w-full max-w-5xl mx-auto mb-8 rounded-2xl border border-neutral-200/80 bg-white/90 p-5 dark:border-[#3c4043] dark:bg-[#303134]/90 sm:p-6">
      <div className="max-w-2xl mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
          Why use Zapixal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-[#9aa0a6]">
          Fast browser-based tools engineered for privacy, performance, and day-to-day workflow tasks.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            In-browser processing
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
            Image compression, PDF manipulation, and developer parsing run locally in browser memory via WebAssembly and Web Workers.
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Zero software setup
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
            No desktop applications or account signups required. Load the tool and process files immediately with full batch capabilities.
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-[#3c4043] dark:bg-[#202124]">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Unified toolkit
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
            From HEIC conversions and PDF merges to JWT inspection and text diffing, access all essential tools in one clean environment.
          </p>
        </div>
      </div>
    </section>
  );
});

