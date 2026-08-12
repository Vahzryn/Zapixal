import React, { useState } from 'react';
import { 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface PopularToolsSectionProps {
  onNavigate: (path: string) => void;
}

interface ToolLinkItem {
  name: string;
  path: string;
  desc: string;
  badge: string;
  category: 'convert' | 'compress' | 'privacy' | 'workflow';
}

/**
 * Static configuration for the 10 featured tools displayed on the homepage.
 * Site owners can update or reorder this array to adjust homepage features.
 */
export const FEATURED_HOMEPAGE_TOOLS: ToolLinkItem[] = [
  {
    name: 'HEIC to JPG Converter',
    path: '/convert-heic-to-jpg-locally',
    desc: 'Convert iPhone HEIC photos to universal JPG format locally in browser.',
    badge: 'HEIC -> JPG',
    category: 'convert'
  },
  {
    name: 'Compress Image Under 50KB',
    path: '/compress-image-under-50kb-government-portal',
    desc: 'Hit strict 50KB upload constraints for government and portal submissions.',
    badge: 'Target 50KB',
    category: 'compress'
  },
  {
    name: 'Compress Image to 100KB',
    path: '/compress-image-to-100kb-online',
    desc: 'Precision target sizing for official application forms and ID photos.',
    badge: 'Target 100KB',
    category: 'compress'
  },
  {
    name: 'Compress Image to 200KB',
    path: '/compress-image-to-200kb-online',
    desc: 'Optimize photos for state application portals without losing clarity.',
    badge: 'Target 200KB',
    category: 'compress'
  },
  {
    name: 'Reduce Image Size to 1MB',
    path: '/reduce-image-size-to-1mb-online',
    desc: 'Shrink heavy camera photos under 1MB for email attachments and uploads.',
    badge: 'Target 1MB',
    category: 'compress'
  },
  {
    name: 'JPG to WebP Converter',
    path: '/convert-jpg-to-webp-browser',
    desc: 'Transform JPEG images into modern WebP for faster web loading.',
    badge: 'JPG -> WebP',
    category: 'convert'
  },
  {
    name: 'PNG to WebP Lossless',
    path: '/convert-png-to-webp-lossless',
    desc: 'Convert PNG graphics to WebP while retaining full alpha transparency.',
    badge: 'PNG -> WebP',
    category: 'convert'
  },
  {
    name: 'WebP to PNG Converter',
    path: '/convert-webp-to-png-transparent',
    desc: 'Decode WebP graphics back into high-fidelity transparent PNG files.',
    badge: 'WebP -> PNG',
    category: 'convert'
  },
  {
    name: 'Remove EXIF Metadata',
    path: '/strip-exif-metadata-online-private',
    desc: 'Strip camera tags, GPS location, and EXIF metadata from photos.',
    badge: 'EXIF Cleanup',
    category: 'privacy'
  },
  {
    name: 'Passport Photo Resizer',
    path: '/passport-photo-size-reducer-kb',
    desc: 'Format and compress passport or visa photos to official KB specifications.',
    badge: 'Passport',
    category: 'workflow'
  }
];

export const PopularToolsSection: React.FC<PopularToolsSectionProps> = ({ onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  const displayedTools = isExpanded ? FEATURED_HOMEPAGE_TOOLS : FEATURED_HOMEPAGE_TOOLS.slice(0, 4);

  return (
    <section 
      aria-label="Popular Image Tools and Specialized Workflows"
      className="w-full max-w-5xl mx-auto my-10 space-y-6 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#3c4043]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Featured Image Tools</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Popular Tools for Specific Tasks
          </h2>
          <p className="text-sm text-neutral-600 dark:text-[#9aa0a6] max-w-2xl leading-relaxed">
            Fast, private client-side utilities engineered for strict portal upload limits, format conversions, and EXIF removal.
          </p>
        </div>

        <a
          href="/tools"
          onClick={(e) => handleClick(e, '/tools')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-2xs self-start md:self-auto group"
        >
          <span>Explore All 42 Tools →</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Featured Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
        {displayedTools.map((tool) => (
          <a
            key={tool.path}
            href={tool.path}
            onClick={(e) => handleClick(e, tool.path)}
            className="group flex flex-col justify-between p-4 rounded-xl border border-neutral-200/80 dark:border-[#32353a] bg-white dark:bg-[#202124] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xs transition-all text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </span>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/40 shrink-0">
                  {tool.badge}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-[#9aa0a6] leading-snug">
                {tool.desc}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <span className="group-hover:translate-x-0.5 transition-transform">Run Tool →</span>
            </div>
          </a>
        ))}
      </div>

      {/* Expand / Collapse Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-[#3c4043] bg-white dark:bg-[#202124] text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-[#282a2e] hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-2xs group"
        >
          <span>{isExpanded ? 'Show Fewer Featured Tools' : 'Show More Featured Tools (10 Total)'}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-blue-800/50">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">All 42 Tools 100% Free & Private</span>
          </div>
          <h4 className="text-lg font-black tracking-tight">Looking for a specific converter or image utility?</h4>
          <p className="text-xs text-blue-200 max-w-xl">
            Browse our complete directory of 42 single-purpose image tools, format converters, and security utilities.
          </p>
        </div>
        <a
          href="/tools"
          onClick={(e) => handleClick(e, '/tools')}
          className="px-5 py-3 rounded-xl bg-white text-blue-950 font-black text-xs hover:bg-blue-50 transition-colors shrink-0 shadow-xs flex items-center gap-2 group"
        >
          <span>View All 42 Tools Directory</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-blue-600" />
        </a>
      </div>
    </section>
  );
};
