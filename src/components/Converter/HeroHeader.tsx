import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { SeoRouteData } from '../../lib/seoEngine';

interface HeroHeaderProps {
  seoData: SeoRouteData;
  onNavigate: (path: string) => void;
}

export const HeroHeader = React.memo<HeroHeaderProps>(function HeroHeader({ seoData, onNavigate }) {
  return (
    <div className="hero-container-cls-guard min-h-[80px] sm:min-h-[120px] flex flex-col items-center mb-4 sm:mb-6 text-center">
      <Breadcrumbs items={seoData.breadcrumbs} onNavigate={onNavigate} />
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white mb-1.5 sm:mb-3 max-w-4xl leading-snug sm:leading-tight">
        {seoData.h1Title}
      </h1>
      <p className="max-w-3xl text-xs sm:text-base text-neutral-600 dark:text-[#9aa0a6] font-medium leading-relaxed px-2">
        {seoData.metaDescription}
      </p>
    </div>
  );
});
