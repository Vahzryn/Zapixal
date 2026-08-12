import React from 'react';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { ToolCallout } from '../../content/articles/types';

interface ToolCalloutCardProps {
  tool: ToolCallout;
  onNavigate: (path: string) => void;
}

export const ToolCalloutCard: React.FC<ToolCalloutCardProps> = ({ tool, onNavigate }) => {
  return (
    <div className="my-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-blue-50/90 dark:from-[#1e293b]/90 dark:via-[#1e2330]/60 dark:to-[#1e293b]/90 border border-blue-200/80 dark:border-blue-900/60 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
              <Zap className="w-3 h-3" />
              {tool.badge || 'Zapixal Tool'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side Private
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight">
            {tool.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
            {tool.description}
          </p>
        </div>

        <button
          onClick={() => onNavigate(tool.targetPath)}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer group active:scale-95"
        >
          <span>{tool.buttonText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
