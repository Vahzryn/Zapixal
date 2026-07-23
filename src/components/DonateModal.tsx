import React from 'react';
import { X, Heart, ExternalLink, Coffee } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    { name: 'Coffee Supporter', price: '$2.00', period: 'one time', url: 'https://whop.com/checkout/plan_iZf2yCdTauBIu', icon: '☕' },
    { name: 'Monthly Coffee', price: '$2.00', period: '/ month', url: 'https://whop.com/checkout/plan_DRC9jjg7J02HI', icon: '☕', highlight: true },
    { name: 'Monthly Supporter', price: '$3.00', period: '/ month', url: 'https://whop.com/checkout/plan_RDcCBXgVQA2XL', icon: '❤️' },
    { name: 'Tea Supporter (UK)', price: '£4.99', period: 'one time', url: 'https://whop.com/checkout/plan_prBXyumFgOn8i', icon: '🍵' },
    { name: 'Super Supporter', price: '$10.00', period: 'one time', url: 'https://whop.com/checkout/plan_ZAhJKwKEf2Aay', icon: '🚀' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Support Zapixal</h2>
          <p className="text-slate-500 text-sm">
            Help us keep Zapixal 100% free, private, and lightning-fast. Your support pays for development and updates!
          </p>
        </div>

        <div className="p-6 bg-slate-50">
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <a
                key={i}
                href={plan.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  plan.highlight 
                    ? 'border-pink-300 bg-pink-50 hover:bg-pink-100 hover:border-pink-400' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{plan.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{plan.name}</h3>
                    <div className="text-sm text-slate-500">
                      <span className="font-medium text-slate-900">{plan.price}</span> {plan.period}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1 ${
                  plan.highlight ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <span>Support</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </a>
            ))}
          </div>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-slate-400 flex items-center justify-center">
               <ShieldCheck className="w-3.5 h-3.5 mr-1" />
               Secure checkout provided by Whop
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick mock for ShieldCheck since I used it but didn't import
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
