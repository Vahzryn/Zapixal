import { useState, useEffect, useCallback, useMemo } from 'react';
import { ConversionSettings } from '../types';
import { parseSeoRoute, applySeoToHead, SeoRouteData } from '../lib/seoEngine';

interface UseAppRoutingOptions {
  initialPath?: string;
  setSettings: React.Dispatch<React.SetStateAction<ConversionSettings>>;
}

export function useAppRouting({ initialPath, setSettings }: UseAppRoutingOptions) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath) return initialPath;
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const seoData: SeoRouteData = useMemo(() => parseSeoRoute(currentPath), [currentPath]);

  useEffect(() => {
    applySeoToHead(seoData);

    setSettings(prev => {
      const updated = { ...prev };
      if (seoData.toFormat) {
        updated.targetFormat = seoData.toFormat;
      }
      if (seoData.targetMaxKB !== undefined) {
        updated.targetMaxKB = seoData.targetMaxKB;
      }
      if (seoData.stripExif !== undefined) {
        updated.stripExif = seoData.stripExif;
      }
      if (seoData.presetResize) {
        updated.resize = {
          enabled: true,
          keepAspectRatio: true,
          maxWidth: seoData.presetResize.maxWidth,
          maxHeight: seoData.presetResize.maxHeight
        };
      }
      return updated;
    });
  }, [currentPath, seoData, setSettings]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((newPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', newPath);
      setCurrentPath(newPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return {
    currentPath,
    setCurrentPath,
    handleNavigate,
    seoData
  };
}
