import { useState, useEffect, useCallback } from 'react';
import { ConversionSettings } from '../types';
import { parseSeoRoute, applySeoToHead, SeoRouteData } from '../lib/seoEngine';

interface UseAppRoutingOptions {
  initialPath?: string;
  setSettings: React.Dispatch<React.SetStateAction<ConversionSettings>>;
}

function getEmbeddedSeoData(): SeoRouteData | null {
  if (typeof document !== 'undefined') {
    const el = document.getElementById('seo-data-payload');
    if (el) {
      try {
        return JSON.parse(el.textContent || '') as SeoRouteData;
      } catch (e) {
        console.error('Failed to parse embedded SEO data:', e);
      }
    }
  }
  return null;
}

export function useAppRouting({ initialPath, setSettings }: UseAppRoutingOptions) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath) return initialPath;
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [seoData, setSeoData] = useState<SeoRouteData>(() => {
    const embedded = getEmbeddedSeoData();
    if (embedded && embedded.path === currentPath) {
      return embedded;
    }
    return parseSeoRoute(currentPath);
  });

  // Handle path transitions & fetch async full SEO JSON
  useEffect(() => {
    const embedded = getEmbeddedSeoData();
    if (embedded && embedded.path === currentPath) {
      setSeoData(embedded);
      applySeoToHead(embedded);
    } else {
      // Set lightweight details immediately
      const lightSeo = parseSeoRoute(currentPath);
      setSeoData(lightSeo);
      applySeoToHead(lightSeo);

      // Async fetch full SEO JSON data (including guideContent and jsonLd)
      const slug = currentPath === '/' ? 'home' : currentPath.slice(1).replace(/\//g, '-');
      fetch(`/seo-data/${slug}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`Not found: ${res.status}`);
          return res.json();
        })
        .then((fullSeo: SeoRouteData) => {
          setSeoData(prev => {
            if (prev.path === fullSeo.path) {
              applySeoToHead(fullSeo);
              return fullSeo;
            }
            return prev;
          });
        })
        .catch(err => {
          console.warn('Could not fetch full SEO payload asynchronously, using light version:', err);
        });
    }
  }, [currentPath]);

  // Handle setting updates when seoData changes
  useEffect(() => {
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
  }, [seoData, setSettings]);

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
