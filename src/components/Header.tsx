import React from 'react';
import { Layers, ShieldCheck, Sparkles, Image as ImageIcon, Zap, Coffee } from 'lucide-react';
import { SEO_ROUTES } from '../lib/seoData';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  queueLength: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  queueLength,
}) => {
  const quickRoutes = [
    { hash: '/', label: 'All Converters' },
    { hash: '#/heic-to-jpg', label: 'HEIC to JPG' },
    { hash: '#/convert-to-avif', label: 'AVIF Speed' },
    { hash: '#/compress-png', label: 'PNG Compress' },
    { hash: '#/image-to-pdf', label: 'Image to PDF' },
    { hash: '#/webp-converter', label: 'WEBP Tool' },
    { hash: '#/ico-converter', label: 'Favicon .ICO' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm overflow-hidden border border-slate-200">
              <img src="/logo.png" className="w-full h-full object-cover" alt="Zapixal Logo" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Zapix<span className="text-blue-600">al</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  v2.5 Local
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Client-Side Batch Image Engine
              </p>
            </div>
          </div>

          {/* Quick Route Pills (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {quickRoutes.map((route) => {
              const isActive = currentRoute === route.hash || (currentRoute === '' && route.hash === '/');
              return (
                <button
                  key={route.hash}
                  onClick={() => onNavigate(route.hash)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  {route.label}
                </button>
              );
            })}
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={() => window.dispatchEvent(new Event('open-donate'))}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-semibold shadow-sm hover:shadow transition-shadow"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Donate on Whop</span>
              <span className="sm:hidden">Donate</span>
            </button>
            {/* Privacy Shield Indicator */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Private</span>
            </div>
          </div>
        </div>

        {/* Mobile Quick Navigation Scrollable Row */}
        <div className="lg:hidden flex items-center space-x-1.5 py-2 overflow-x-auto no-scrollbar border-t border-slate-100">
          {quickRoutes.map((route) => {
            const isActive = currentRoute === route.hash || (currentRoute === '' && route.hash === '/');
            return (
              <button
                key={route.hash}
                onClick={() => onNavigate(route.hash)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {route.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
