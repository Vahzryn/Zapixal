import React from 'react';
import { SeoRouteData } from '../../lib/seoEngine';
import { RelatedToolsSection } from './RelatedToolsSection';

interface SeoGuideContentProps {
  seoData: SeoRouteData;
  onNavigate?: (path: string) => void;
}

export const SeoGuideContent: React.FC<SeoGuideContentProps> = ({ seoData, onNavigate }) => {
  const guide = seoData.guideContent;
  if (!guide && (!seoData.relatedRoutes || seoData.relatedRoutes.length === 0)) return null;

  return (
    <section className="w-full max-w-5xl mx-auto mb-8 rounded-3xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-[#3c4043] dark:bg-[#303134]/90 sm:p-6">
      {guide && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="max-w-3xl">
              <p className="text-sm font-bold text-blue-600 dark:text-[#8ab4f8] mb-1">
                {guide.badge}
              </p>
              <h2 className="mt-2 text-lg font-black text-neutral-900 dark:text-white sm:text-xl">
                {guide.section1Title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
                {guide.section1Body}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
            <div className="max-w-3xl">
              <h2 className="text-lg font-black text-neutral-900 dark:text-white sm:text-xl">
                {guide.section2Title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
                {guide.section2Body}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-[#3c4043] dark:bg-[#202124]">
              <h3 className="mb-4 text-base font-black text-neutral-900 dark:text-white">
                Step-by-step guide
              </h3>
              <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
                {guide.steps.map((step: string, idx: number) => (
                  <li key={idx} className="pl-1">{step}</li>
                ))}
              </ol>
            </div>
            
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-[#3c4043] dark:bg-[#202124]">
              <h3 className="mb-4 text-base font-black text-neutral-900 dark:text-white">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3 text-sm">
                {guide.faqs.map((faq: { question: string; answer: string }, idx: number) => (
                  <details key={idx} className="group rounded-xl border border-neutral-200/60 bg-white p-3 dark:border-[#3c4043]/60 dark:bg-[#303134] [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between font-bold text-neutral-800 dark:text-white">
                      <span>{faq.question}</span>
                      <span className="ml-4 flex-shrink-0 transition group-open:rotate-180">
                        <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <p className="mt-3 leading-relaxed text-neutral-600 dark:text-[#9aa0a6]">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Always-visible Related Tools links near the bottom of landing page content */}
      <RelatedToolsSection relatedRoutes={seoData.relatedRoutes} onNavigate={onNavigate} />
    </section>
  );
};
