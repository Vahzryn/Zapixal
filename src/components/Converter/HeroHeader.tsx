import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { SeoRouteData } from '../../lib/seoEngine';

interface HeroHeaderProps {
  seoData: SeoRouteData;
  onNavigate: (path: string) => void;
}

export const HeroHeader = React.memo<HeroHeaderProps>(function HeroHeader({ seoData, onNavigate }) {
  return (
    <div className="hero-container-cls-guard min-h-[60px] md:min-h-[80px] flex flex-col items-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-center px-4">
      <Breadcrumbs items={seoData.breadcrumbs} onNavigate={onNavigate} />
      <h1 className="text-lg min-[360px]:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-neutral-900 dark:text-white mb-1 sm:mb-2 max-w-4xl leading-snug sm:leading-tight">
        {seoData.h1Title}
      </h1>
      <p className="max-w-2xl text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm text-neutral-600 dark:text-[#9aa0a6] font-medium leading-relaxed px-2">
        {seoData.metaDescription}
      </p>
    </div>
  );
});
