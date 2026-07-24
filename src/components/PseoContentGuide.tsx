import React, { useState } from 'react';
import { SeoRouteData } from '../lib/seoEngine';
import { ShieldCheck, Zap, Lock, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface PseoContentGuideProps {
  seoData: SeoRouteData;
}

export function PseoContentGuide({ seoData }: PseoContentGuideProps) {
  const { guideContent } = seoData;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-16 px-4">
      {/* Header Badge */}
      <div className="flex justify-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-extrabold text-emerald-800 dark:text-[#81c995] bg-emerald-50 dark:bg-[#1a3824] border border-emerald-200 dark:border-[#2d523c] rounded-full shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#81c995]" />
          {guideContent.badge}
        </span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl p-6 sm:p-10 shadow-xs space-y-10">
        
        {/* Section 1 */}
        <section>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-800 dark:text-[#e8eaed] mb-3 tracking-tight">
            {guideContent.section1Title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-[#bdc1c6] leading-relaxed font-medium">
            {guideContent.section1Body}
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 bg-blue-50/60 dark:bg-[#1e293b]/50 border border-blue-100 dark:border-[#384c6c] rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-[#e8eaed]">
              {guideContent.section2Title}
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-[#bdc1c6] leading-relaxed font-medium mt-2">
            {guideContent.section2Body}
          </p>
        </section>

        {/* Section 3: Step-by-Step Instructions */}
        <section>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-[#e8eaed] mb-4">
            How to Convert & Compress Images Step-by-Step
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guideContent.steps.map((stepText, idx) => (
              <div key={idx} className="p-4 bg-neutral-50 dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-[#8ab4f8]">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-[#1e293b] flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span>STEP {idx + 1}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-[#e8eaed] leading-snug">
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Accordion FAQ Block */}
        <section className="pt-6 border-t border-neutral-200 dark:border-[#3c4043]">
          <h3 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-[#e8eaed] mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-3">
            {guideContent.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-neutral-200 dark:border-[#3c4043] rounded-2xl overflow-hidden bg-neutral-50/50 dark:bg-[#202124]/50 transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-neutral-800 dark:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#3c4043]/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm font-medium text-neutral-600 dark:text-[#9aa0a6] leading-relaxed border-t border-neutral-100 dark:border-[#3c4043]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
