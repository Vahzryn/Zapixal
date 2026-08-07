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

  // Handle path transitions
  useEffect(() => {
    const embedded = getEmbeddedSeoData();
    if (embedded && embedded.path === currentPath) {
      setSeoData(embedded);
      applySeoToHead(embedded);
    } else {
      // Set details immediately
      const seo = parseSeoRoute(currentPath);
      setSeoData(seo);
      applySeoToHead(seo);
    }
  }, [currentPath]);

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
