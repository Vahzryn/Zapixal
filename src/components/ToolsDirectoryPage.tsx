import React, { useState, useMemo } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { PSEO_ROUTES_LIST, SeoRouteItem } from '../lib/seo/routes';
import { 
  Zap, 
  Sliders, 
  FileImage, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Grid,
  CheckCircle2
} from 'lucide-react';

interface ToolsDirectoryPageProps {
  onNavigate: (path: string) => void;
}

type CategoryKey = 'all' | 'compression' | 'converter' | 'use-case' | 'resource';

interface CategoryMeta {
  key: CategoryKey;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_DEFINITIONS: Record<CategoryKey, CategoryMeta> = {
  all: {
    key: 'all',
    title: 'All Tools',
    badge: 'Directory',
    description: 'Complete collection of 42 client-side WebAssembly image processing tools.',
    icon: Grid,
  },
  converter: {
    key: 'converter',
    title: 'Format Converters',
    badge: 'Codecs',
    description: 'Convert between HEIC, WebP, AVIF, PNG, JPG, SVG, ICO, TIFF, BMP, and PDF.',
    icon: FileImage,
  },
  compression: {
    key: 'compression',
    title: 'Image Compression',
    badge: 'Optimization',
    description: 'Shrink file sizes to strict KB targets with WebAssembly quantizers.',
    icon: Zap,
  },
  'use-case': {
    key: 'use-case',
    title: 'Workflows & Resizers',
    badge: 'Specialty',
    description: 'Tailored tools for job forms, passports, e-commerce, social media, and PDFs.',
    icon: Sliders,
  },
  resource: {
    key: 'resource',
    title: 'Utilities & Metadata',
    badge: 'Privacy & Dev',
    description: 'Strip EXIF geolocation tags, encode Base64 arrays, and extract color palettes.',
    icon: ShieldCheck,
  },
};

export const ToolsDirectoryPage: React.FC<ToolsDirectoryPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Tools Directory', url: '/tools' },
  ];

  const filteredTools = useMemo(() => {
    return PSEO_ROUTES_LIST.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        tool.label.toLowerCase().includes(query) ||
        tool.path.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      all: PSEO_ROUTES_LIST.length,
      compression: 0,
      converter: 0,
      'use-case': 0,
      resource: 0,
    };
    PSEO_ROUTES_LIST.forEach((t) => {
      if (counts[t.category as CategoryKey] !== undefined) {
        counts[t.category as CategoryKey]++;
      }
    });
    return counts;
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* Header & Breadcrumbs */}
      <div className="text-center space-y-3">
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          <Grid className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>All 42 Single-Purpose Client-Side Image Tools</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
          Zapixal Tools Directory
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          100% private, browser-based utilities for image compression, format conversion, metadata editing, and workflow optimization. Zero cloud uploads.
        </p>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {(['converter', 'compression', 'use-case', 'resource'] as CategoryKey[]).map((catKey) => {
          const cat = CATEGORY_DEFINITIONS[catKey];
          const Icon = cat.icon;
          const isActive = selectedCategory === catKey;
          const count = categoryCounts[catKey];

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(isActive ? 'all' : catKey)}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-[#282a2e] border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs'
              }`}
            >
              <div className="w-full flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}>
                  {count}
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-tight uppercase opacity-80">{cat.badge}</span>
              <span className="text-sm font-black mt-0.5 leading-snug">{cat.title}</span>
              <span className={`text-[11px] mt-1 font-medium line-clamp-2 ${isActive ? 'text-blue-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#282a2e] border border-neutral-200/80 dark:border-neutral-700/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by format, tool name, or task (e.g. HEIC, 100KB, Crop, PDF)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-[#1a1b1e] border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
            {(['all', 'converter', 'compression', 'use-case', 'resource'] as CategoryKey[]).map((catKey) => {
              const cat = CATEGORY_DEFINITIONS[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {cat.title} ({categoryCounts[catKey]})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tools List Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
            Showing {filteredTools.length} of {PSEO_ROUTES_LIST.length} tools
            {selectedCategory !== 'all' && ` in ${CATEGORY_DEFINITIONS[selectedCategory].title}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {(selectedCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#282a2e] rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 space-y-3">
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              No tools found matching your search.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
            >
              View All 42 Tools
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => {
              const catDef = CATEGORY_DEFINITIONS[tool.category as CategoryKey] || CATEGORY_DEFINITIONS.resource;
              const Icon = catDef.icon;

              return (
                <a
                  key={tool.path}
                  href={tool.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(tool.path);
                  }}
                  className="group p-4 rounded-2xl bg-white dark:bg-[#282a2e] border border-neutral-200/80 dark:border-neutral-700/80 hover:border-blue-400 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/50">
                        <Icon className="w-3 h-3" />
                        {catDef.badge}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[120px]">
                        {tool.path}
                      </span>
                    </div>

                    <h2 className="text-sm font-black text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {tool.label}
                    </h2>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      100% Client-Side
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Banner Callout */}
      <div className="p-6 rounded-2xl bg-neutral-900 dark:bg-[#18191c] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-extrabold">Need to convert files right now?</h3>
          <p className="text-xs text-neutral-400">
            Drag and drop files directly on the Zapixal home workspace to start processing instantly.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          <span>Go to Workspace</span>
        </button>
      </div>
    </div>
  );
};
