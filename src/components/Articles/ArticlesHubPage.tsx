import React, { useState } from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { ALL_ARTICLES, ARTICLE_CATEGORIES, ArticleCategory } from '../../content/articles';
import { FileImage, ShieldCheck, Sliders, Cpu, ArrowRight, Clock, Calendar, Zap, BookOpen } from 'lucide-react';

interface ArticlesHubPageProps {
  onNavigate: (path: string) => void;
}

const CATEGORY_ICONS = {
  formats: FileImage,
  privacy: ShieldCheck,
  workflows: Sliders,
  performance: Cpu,
};

export const ArticlesHubPage: React.FC<ArticlesHubPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');

  const filteredArticles = selectedCategory === 'all'
    ? ALL_ARTICLES
    : ALL_ARTICLES.filter((a) => a.category === selectedCategory);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/articles' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* Header & Breadcrumbs */}
      <div className="text-center space-y-3">
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>In-Depth Technical Guides & Security Audits</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
          Zapixal Editorial & Technical Guides
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          In-depth architectural analysis on image codecs, WebAssembly performance, EXIF metadata privacy risks, and client-side optimization workflows.
        </p>
      </div>

      {/* Category Selection Hub Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Object.values(ARTICLE_CATEGORIES).map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id as ArticleCategory] || FileImage;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-[#282a2e] border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs'
              }`}
            >
              <div className={`p-2.5 rounded-xl mb-2.5 ${isActive ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold tracking-tight uppercase opacity-80">{cat.badge}</span>
              <span className="text-sm font-black mt-0.5 leading-snug">{cat.shortTitle}</span>
              <span className={`text-[11px] mt-1 font-medium line-clamp-2 ${isActive ? 'text-blue-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            All Articles ({ALL_ARTICLES.length})
          </button>
          {Object.values(ARTICLE_CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/articles/${cat.id}`)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer hidden sm:inline-block"
            >
              View {cat.shortTitle} Index →
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((art) => {
          const catInfo = ARTICLE_CATEGORIES[art.category];
          const Icon = CATEGORY_ICONS[art.category] || FileImage;

          return (
            <article
              key={art.slug}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#282a2e] border border-neutral-200/80 dark:border-neutral-700/80 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
                    <Icon className="w-3 h-3" />
                    {catInfo?.badge || art.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {art.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-black text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  <a href={`/articles/${art.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/articles/${art.slug}`); }}>
                    {art.title}
                  </a>
                </h2>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed line-clamp-3">
                  {art.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-3 h-3" />
                  {art.datePublished}
                </span>

                <button
                  onClick={() => onNavigate(`/articles/${art.slug}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer Banner Callout */}
      <div className="p-6 rounded-2xl bg-neutral-900 dark:bg-[#18191c] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-extrabold">Ready to process image files locally?</h3>
          <p className="text-xs text-neutral-400">Zapixal runs 100% in browser memory via Web Workers and WebAssembly. Zero cloud uploads.</p>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          <span>Launch Converter Engine</span>
        </button>
      </div>
    </div>
  );
};
