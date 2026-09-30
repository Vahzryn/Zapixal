import React from 'react';
import { 
  Minimize2, 
  Wand2, 
  Repeat, 
  Merge, 
  Split, 
  FileImage, 
  FileArchive, 
  ImagePlus, 
  Smartphone, 
  Sparkles, 
  ShieldCheck, 
  Braces, 
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeTaskDiscoveryProps {
  onNavigate: (path: string) => void;
}

interface TaskItem {
  id: string;
  name: string;
  shortDesc: string;
  tag?: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverBg: string;
    tagClass: string;
  };
}

const PRIMARY_IMAGE_TOOLS: TaskItem[] = [
  {
    id: 'compress',
    name: 'Compress Image',
    shortDesc: 'Reduce file size with visual quality controls',
    tag: 'Exact KB / Lossless',
    route: '/client-side-private-image-compressor',
    icon: Minimize2,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs shadow-emerald-500/20',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600/60',
      hoverBg: 'hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20',
      tagClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60',
    },
  },
  {
    id: 'bg-remover',
    name: 'Remove Background',
    shortDesc: 'Cut out subjects automatically in browser',
    tag: 'WebGPU AI',
    route: '/background-remover',
    icon: Wand2,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xs shadow-purple-500/20',
      iconText: 'text-purple-600 dark:text-purple-400',
      hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-600/60',
      hoverBg: 'hover:bg-purple-50/20 dark:hover:bg-purple-950/20',
      tagClass: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/60',
    },
  },
  {
    id: 'convert',
    name: 'Convert Image',
    shortDesc: 'Batch convert HEIC, PNG, JPG, WebP, AVIF',
    tag: 'Batch All Formats',
    route: '/bulk-image-compressor-offline',
    icon: Repeat,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs shadow-sky-500/20',
      iconText: 'text-sky-600 dark:text-sky-400',
      hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-600/60',
      hoverBg: 'hover:bg-sky-50/20 dark:hover:bg-sky-950/20',
      tagClass: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/60',
    },
  },
];

const PDF_TOOLS: TaskItem[] = [
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    shortDesc: 'Combine multiple documents',
    route: '/merge-pdf',
    icon: Merge,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-2xs',
      iconText: 'text-rose-600 dark:text-rose-400',
      hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-600/60',
      hoverBg: 'hover:bg-rose-50/20 dark:hover:bg-rose-950/20',
      tagClass: '',
    },
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    shortDesc: 'Extract pages or split files',
    route: '/split-pdf',
    icon: Split,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-2xs',
      iconText: 'text-orange-600 dark:text-orange-400',
      hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-600/60',
      hoverBg: 'hover:bg-orange-50/20 dark:hover:bg-orange-950/20',
      tagClass: '',
    },
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    shortDesc: 'Export pages as images',
    route: '/convert-pdf-pages-to-jpg-images',
    icon: FileImage,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-2xs',
      iconText: 'text-amber-600 dark:text-amber-400',
      hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-600/60',
      hoverBg: 'hover:bg-amber-50/20 dark:hover:bg-amber-950/20',
      tagClass: '',
    },
  },
  {
    id: 'pdf-compress',
    name: 'Compress PDF',
    shortDesc: 'Reduce document size',
    route: '/secure-document-compressor-pdf',
    icon: FileArchive,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xs',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600/60',
      hoverBg: 'hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20',
      tagClass: '',
    },
  },
  {
    id: 'img-to-pdf',
    name: 'Images to PDF',
    shortDesc: 'Photos into single PDF',
    route: '/convert-image-to-pdf',
    icon: ImagePlus,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xs',
      iconText: 'text-blue-600 dark:text-blue-400',
      hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-600/60',
      hoverBg: 'hover:bg-blue-50/20 dark:hover:bg-blue-950/20',
      tagClass: '',
    },
  },
];

const UTILITY_TOOLS: TaskItem[] = [
  {
    id: 'heic',
    name: 'HEIC to JPG',
    shortDesc: 'iPhone photos to JPEG',
    route: '/convert-heic-to-jpg-locally',
    icon: Smartphone,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-2xs',
      iconText: 'text-sky-600 dark:text-sky-400',
      hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-600/60',
      hoverBg: 'hover:bg-sky-50/20 dark:hover:bg-sky-950/20',
      tagClass: '',
    },
  },
  {
    id: 'webp-png',
    name: 'WebP ↔ PNG',
    shortDesc: 'Convert transparent formats',
    route: '/convert-webp-to-png-transparent',
    icon: Sparkles,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-2xs',
      iconText: 'text-teal-600 dark:text-teal-400',
      hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-600/60',
      hoverBg: 'hover:bg-teal-50/20 dark:hover:bg-teal-950/20',
      tagClass: '',
    },
  },
  {
    id: 'privacy',
    name: 'Remove Metadata',
    shortDesc: 'Scrub GPS and EXIF data',
    route: '/strip-exif-metadata-online-private',
    icon: ShieldCheck,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-emerald-600 to-cyan-600 text-white shadow-2xs',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600/60',
      hoverBg: 'hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20',
      tagClass: '',
    },
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    shortDesc: 'JSON, JWT & Regex tools',
    route: '/tools/developer',
    icon: Braces,
    accentColor: {
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-2xs',
      iconText: 'text-violet-600 dark:text-violet-400',
      hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-600/60',
      hoverBg: 'hover:bg-violet-50/20 dark:hover:bg-violet-950/20',
      tagClass: '',
    },
  },
];

export const HomeTaskDiscovery: React.FC<HomeTaskDiscoveryProps> = ({ onNavigate }) => {
  return (
    <section className="w-full mb-3 space-y-3 animate-in fade-in duration-200 max-w-full overflow-hidden" id="home-task-discovery">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 px-0.5 pb-1 border-b border-zinc-200/80 dark:border-zinc-800">
        <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          What do you want to do?
        </h2>

        <button
          type="button"
          onClick={() => onNavigate('/tools')}
          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer group shrink-0"
        >
          <span>All 30+ tools</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 1. Image tools */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-0.5">
          Image tools
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {PRIMARY_IMAGE_TOOLS.map((task) => {
            const Icon = task.icon;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onNavigate(task.route)}
                className={cn(
                  "group flex sm:flex-col items-center sm:items-start text-left gap-3 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 active:scale-[0.98] min-w-0 relative overflow-hidden",
                  task.accentColor.hoverBorder,
                  task.accentColor.hoverBg
                )}
              >
                <div className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105",
                  task.accentColor.iconBg
                )}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="block text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {task.name}
                    </span>
                    {task.tag && (
                      <span className={cn(
                        "hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded border shrink-0 tracking-tight",
                        task.accentColor.tagClass
                      )}>
                        {task.tag}
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-1 mt-0.5">
                    {task.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PDF tools */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-0.5">
          PDF tools
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PDF_TOOLS.map((task) => {
            const Icon = task.icon;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onNavigate(task.route)}
                className={cn(
                  "group flex flex-col items-center text-center justify-center p-2.5 sm:p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:scale-[0.98] min-w-0 min-h-[82px] sm:min-h-[88px]",
                  task.accentColor.hoverBorder,
                  task.accentColor.hoverBg
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mb-1.5 transition-transform duration-150 group-hover:scale-110",
                  task.accentColor.iconBg
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="w-full min-w-0">
                  <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                    {task.name}
                  </span>
                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight truncate mt-0.5">
                    {task.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Utilities */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-0.5">
          Utilities
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {UTILITY_TOOLS.map((task) => {
            const Icon = task.icon;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onNavigate(task.route)}
                className={cn(
                  "group flex flex-col items-center text-center justify-center p-2.5 sm:p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 active:scale-[0.98] min-w-0 min-h-[82px] sm:min-h-[88px]",
                  task.accentColor.hoverBorder,
                  task.accentColor.hoverBg
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mb-1.5 transition-transform duration-150 group-hover:scale-110",
                  task.accentColor.iconBg
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="w-full min-w-0">
                  <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                    {task.name}
                  </span>
                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight truncate mt-0.5">
                    {task.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

