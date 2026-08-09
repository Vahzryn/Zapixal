import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { Article } from '../../content/articles/types';
import { ARTICLE_CATEGORIES, getRelatedArticles } from '../../content/articles';
import { ToolCalloutCard } from './ToolCalloutCard';
import { Calendar, Clock, User, ShieldCheck, ArrowRight, List, Share2, FileText, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';

interface ArticleViewPageProps {
  article: Article;
  onNavigate: (path: string) => void;
}

export const ArticleViewPage: React.FC<ArticleViewPageProps> = ({ article, onNavigate }) => {
  const categoryInfo = ARTICLE_CATEGORIES[article.category];
  const relatedArticles = getRelatedArticles(article.relatedArticleSlugs);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/articles' },
    { name: categoryInfo?.shortTitle || article.category, url: `/articles/${article.category}` },
    { name: article.title, url: `/articles/${article.slug}` },
  ];

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span 
            onClick={() => onNavigate(`/articles/${article.category}`)}
            className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/60 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {categoryInfo?.badge || article.category}
          </span>
          <span className="text-neutral-400">•</span>
          <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
              <User className="w-3.5 h-3.5 text-blue-600" />
              {article.author}
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Published: {article.datePublished}
            </span>
            {article.dateModified !== article.datePublished && (
              <>
                <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-neutral-500">
                  Updated: {article.dateModified}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
            title="Copy link to clipboard"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Table of Contents Accordion / Summary Box */}
      {article.headings && article.headings.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 dark:bg-[#18191c]/80 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <List className="w-4 h-4 text-blue-600" />
            <span>Table of Contents</span>
          </div>
          <ul className="space-y-1.5 text-xs font-semibold">
            {article.headings.map((h) => (
              <li key={h.id} style={{ paddingLeft: h.level === 3 ? '1rem' : '0rem' }}>
                <a
                  href={`#${h.id}`}
                  className="text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Body Content Sections */}
      <article className="prose dark:prose-invert max-w-none space-y-6 text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed">
        {article.sections.map((sec, idx) => {
          if (sec.type === 'paragraph') {
            return (
              <p key={idx} className="leading-relaxed font-medium text-neutral-700 dark:text-neutral-300">
                {sec.text}
              </p>
            );
          }

          if (sec.type === 'heading') {
            if (sec.level === 2) {
              return (
                <h2
                  key={idx}
                  id={sec.id}
                  className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white pt-4 pb-1 border-b border-neutral-200/80 dark:border-neutral-800 tracking-tight"
                >
                  {sec.text}
                </h2>
              );
            }
            return (
              <h3
                key={idx}
                id={sec.id}
                className="text-xl font-bold text-neutral-900 dark:text-white pt-2 tracking-tight"
              >
                {sec.text}
              </h3>
            );
          }

          if (sec.type === 'list') {
            if (sec.ordered) {
              return (
                <ol key={idx} className="list-decimal list-inside space-y-2 pl-2 font-medium text-neutral-700 dark:text-neutral-300">
                  {sec.items.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={idx} className="space-y-2 font-medium text-neutral-700 dark:text-neutral-300">
                {sec.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          }

          if (sec.type === 'callout') {
            const isWarning = sec.variant === 'warning';
            const isTip = sec.variant === 'tip';
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3 my-4 ${
                  isWarning
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                    : isTip
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                    : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
                }`}
              >
                {isWarning ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs sm:text-sm font-medium">
                  <span className="font-bold block text-sm">{sec.title}</span>
                  <p className="leading-relaxed opacity-95">{sec.text}</p>
                </div>
              </div>
            );
          }

          if (sec.type === 'toolCallout') {
            return (
              <ToolCalloutCard key={idx} tool={sec.tool} onNavigate={onNavigate} />
            );
          }

          if (sec.type === 'table') {
            return (
              <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-neutral-100 dark:bg-[#18191c] text-neutral-900 dark:text-white font-extrabold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      {sec.headers.map((h, i) => (
                        <th key={i} className="p-3.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 font-medium">
                    {sec.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3.5 text-neutral-700 dark:text-neutral-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          return null;
        })}
      </article>

      {/* Recommended Tools Section */}
      {article.relatedTools && article.relatedTools.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#18191c] border border-neutral-200/80 dark:border-neutral-800 space-y-4 my-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Related Tools for this Guide
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {article.relatedTools.map((tool) => (
              <button
                key={tool.path}
                onClick={() => onNavigate(tool.path)}
                className="flex flex-col items-start p-3.5 rounded-xl bg-white dark:bg-[#282a2e] border border-neutral-200/80 dark:border-neutral-700/80 hover:border-blue-400 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {tool.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium leading-normal line-clamp-2">
                  {tool.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Further Reading</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {relatedArticles.map((rel) => (
              <div
                key={rel.slug}
                onClick={() => onNavigate(`/articles/${rel.slug}`)}
                className="p-4 rounded-xl bg-white dark:bg-[#282a2e] border border-neutral-200/80 dark:border-neutral-700/80 hover:border-blue-400 transition-all cursor-pointer group space-y-1.5"
              >
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {rel.category}
                </span>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {rel.title}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 font-medium">
                  {rel.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
