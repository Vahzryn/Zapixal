import React, { useState } from 'react';
import { X, ExternalLink, ShieldAlert } from 'lucide-react';

interface AdBannerProps {
  type: 'leaderboard' | 'skyscraper' | 'mobileAnchor' | 'highDwell';
}

export const AdBanner: React.FC<AdBannerProps> = ({ type }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // 1. Leaderboard 728x90 (Desktop Top / Below Dropzone)
  if (type === 'leaderboard') {
    return (
      <div className="w-full max-w-5xl mx-auto my-4 hidden md:block">
        <button onClick={() => window.dispatchEvent(new Event('open-donate'))} className="block w-full max-w-[728px] mx-auto rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow">
          <img src="/supportbanner.png" alt="Support Zapixal on Whop" className="w-full h-auto object-cover max-h-[90px]" />
        </button>
      </div>
    );
  }

  // 2. Skyscraper 160x600 (Desktop Sticky Sidebar)
  if (type === 'skyscraper') {
    return (
      <aside className="hidden xl:flex w-[160px] flex-shrink-0 sticky top-20 h-[600px] bg-slate-50 border border-slate-200 rounded-xl flex-col items-center justify-center p-2 text-center overflow-hidden shadow-xs hover:shadow transition-shadow">
        <button onClick={() => window.dispatchEvent(new Event('open-donate'))} className="w-full h-full block">
          <img src="/supportbanner.png" alt="Support Zapixal" className="w-full h-full object-cover rounded-lg" />
        </button>
      </aside>
    );
  }

  // 3. Mobile Anchor Banner 320x50 (Stickied to viewport bottom, <30% screen height policy)
  if (type === 'mobileAnchor') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur border-t border-slate-200 p-1.5 flex items-center justify-center shadow-lg">
        <div className="w-full max-w-[320px] h-[50px] bg-slate-50/50 rounded-lg flex items-center justify-center relative">
          <button onClick={() => window.dispatchEvent(new Event('open-donate'))} className="block w-full h-full rounded-lg overflow-hidden">
             <img src="/supportbanner.png" alt="Support Zapixal" className="w-full h-full object-cover" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute right-1 top-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
            title="Close Ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 4. High Dwell-Time Slot (In SuccessState)
  if (type === 'highDwell') {
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow">
        <button onClick={() => window.dispatchEvent(new Event('open-donate'))} className="block w-full">
          <img src="/supportbanner.png" alt="Support Zapixal on Whop" className="w-full h-auto object-cover max-h-[120px]" />
        </button>
      </div>
    );
  }

  return null;
};
