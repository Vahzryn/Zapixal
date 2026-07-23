import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { SeoRouteInfo } from '../types';

interface FaqSectionProps {
  seoInfo: SeoRouteInfo;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ seoInfo }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full max-w-5xl mx-auto my-12 pt-8 border-t border-slate-200 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 text-blue-700 text-xs font-semibold uppercase tracking-wider bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Image Format Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Everything you need to know about batch image conversion, quality compression, and browser privacy.
        </p>
      </div>

      <div className="space-y-3">
        {seoInfo.faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-colors hover:border-slate-300"
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full p-4 text-left flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-blue-600 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
