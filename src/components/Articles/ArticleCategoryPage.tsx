import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { CategoryInfo, Article } from '../../content/articles/types';
import { ARTICLE_CATEGORIES, getArticlesByCategory } from '../../content/articles';
import { FileImage, ShieldCheck, Sliders, Cpu, ArrowRight, Clock, Calendar, Zap, ChevronRight } from 'lucide-react';

interface ArticleCategoryPageProps {
  category: CategoryInfo;
  onNavigate: (path: string) => void;
}

const CATEGORY_ICONS = {
  formats: FileImage,
  privacy: ShieldCheck,
  workflows: Sliders,
  performance: Cpu,
};

export const ArticleCategoryPage: React.FC<ArticleCategoryPageProps> = ({ category, onNavigate }) => {
  const articles: Article[] = getArticlesByCategory(category.id);
  const Icon = CATEGORY_ICONS[category.id] || FileImage;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/articles' },
    { name: category.title, url: `/articles/${category.slug}` },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* Header & Breadcrumbs */}
      <div className="text-center space-y-3">
        <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Category: {category.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
          {category.title}
        </h1>

        <p className="max-w-2xl mx-auto text-xs sm:text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Category Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 overflow-x-auto">
        <button
          onClick={() => onNavigate('/articles')}
          className="px-3 py-1.5 text-xs font-bold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
        >
          All Categories
        </button>
        {Object.values(ARTICLE_CATEGORIES).map((cat) => {
          const isCurrent = cat.id === category.id;
          return (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/articles/${cat.slug}`)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {cat.shortTitle}
            </button>
          );
        })}
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
          Guides in {category.badge} ({articles.length})
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((art) => (
            <article
              key={art.slug}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#282a2e] border border-neutral-200/80 dark:border-neutral-700/80 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {category.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {art.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-black text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  <a href={`/articles/${art.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/articles/${art.slug}`); }}>
                    {art.title}
                  </a>
                </h3>

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
          ))}
        </div>
      </div>

      {/* Category Related Tools Section */}
      {category.relatedTools && category.relatedTools.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#18191c] border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Recommended Zapixal Tools for {category.shortTitle}
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {category.relatedTools.map((tool) => (
              <button
                key={tool.path}
                onClick={() => onNavigate(tool.path)}
                className="flex flex-col items-start p-3.5 rounded-xl bg-white dark:bg-[#282a2e] border border-neutral-200/80 dark:border-neutral-700/80 hover:border-blue-400 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {tool.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium leading-normal line-clamp-2">
                  {tool.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
