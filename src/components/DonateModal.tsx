import React from 'react';
import { X, Heart, ShieldCheck, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  { 
    id: 'coffee', 
    emoji: '☕', 
    name: 'Coffee Supporter', 
    price: '$2.00', 
    period: 'one time', 
    url: 'https://whop.com/checkout/plan_iZf2yCdTauBIu', 
    highlight: false 
  },
  { 
    id: 'monthly_coffee', 
    emoji: '☕', 
    name: 'Monthly Coffee', 
    price: '$2.00', 
    period: '/ month', 
    url: 'https://whop.com/checkout/plan_DRC9jjg7J02HI', 
    highlight: true 
  },
  { 
    id: 'monthly_supporter', 
    emoji: '❤️', 
    name: 'Monthly Supporter', 
    price: '$3.00', 
    period: '/ month', 
    url: 'https://whop.com/checkout/plan_RDcCBXgVQA2XL', 
    highlight: false 
  },
  { 
    id: 'tea', 
    emoji: '🍵', 
    name: 'Tea Supporter (UK)', 
    price: '£4.99', 
    period: 'one time', 
    url: 'https://whop.com/checkout/plan_prBXyumFgOn8i', 
    highlight: false 
  },
  { 
    id: 'super', 
    emoji: '🚀', 
    name: 'Super Supporter', 
    price: '$10.00', 
    period: 'one time', 
    url: 'https://whop.com/checkout/plan_ZAhJKwKEf2Aay', 
    highlight: false 
  },
];

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] hover:bg-neutral-100 dark:hover:bg-[#3c4043] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center text-center mt-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 mb-4 bg-pink-50 dark:bg-[#3c2a2f] text-pink-500 dark:text-[#f28b82] rounded-full">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-[#e8eaed] mb-3 tracking-tight">Support Zapixal</h2>
          <p className="text-neutral-500 dark:text-[#9aa0a6] font-medium max-w-sm text-sm sm:text-base leading-relaxed">
            Help us keep Zapixal 100% free, private, and lightning-fast. Your <span className="text-white bg-blue-600 dark:bg-[#8ab4f8] dark:text-[#202124] px-1.5 py-0.5 rounded text-xs uppercase tracking-wider font-bold shadow-sm mx-0.5">support</span> pays for development and updates!
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:gap-4 w-full mb-8">
          {plans.map((plan) => (
            <a 
              key={plan.id}
              href={plan.url} 
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]",
                plan.highlight 
                  ? "border-pink-300 dark:border-[#5c3a42] bg-pink-50/50 dark:bg-[#3c2a2f]/60 hover:bg-pink-50 dark:hover:bg-[#3c2a2f] shadow-sm" 
                  : "border-neutral-200 dark:border-[#3c4043] bg-white dark:bg-[#202124] hover:border-neutral-300 dark:hover:border-[#5f6368] hover:bg-neutral-50 dark:hover:bg-[#303134] shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{plan.emoji}</span>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-neutral-900 dark:text-[#e8eaed] text-sm sm:text-base leading-tight mb-1">{plan.name}</span>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="font-extrabold text-neutral-900 dark:text-[#e8eaed]">{plan.price}</span>
                    <span className="text-neutral-500 dark:text-[#9aa0a6] font-medium">{plan.period}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors",
                  plan.highlight
                    ? "bg-pink-600 text-white dark:bg-[#f28b82] dark:text-[#202124] hover:bg-pink-700 shadow-sm"
                    : "bg-neutral-100 dark:bg-[#3c4043] text-neutral-700 dark:text-[#e8eaed] hover:bg-neutral-200 dark:hover:bg-[#5f6368] border border-neutral-200 dark:border-[#3c4043]"
                )}
              >
                Support <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </a>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-[#9aa0a6] pb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure checkout provided by Whop</span>
        </div>
      </div>
    </div>
  );
}
