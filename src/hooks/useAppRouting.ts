import { useState, useEffect, useCallback } from 'react';
import { ConversionSettings } from '../types';
import { parseSeoRoute, applySeoToHead, SeoRouteData } from '../lib/seoEngine';

interface UseAppRoutingOptions {
  initialPath?: string;
  setSettings: React.Dispatch<React.SetStateAction<ConversionSettings>>;
}

const INITIAL_FALLBACK_SEO: SeoRouteData = {
  path: '/',
  h1Title: '100% Free Client-Side Batch Image Converter & Compressor',
  metaTitle: 'Free Offline Image Converter & Compressor | Secure Processing | Zapixal',
  metaDescription: 'Convert, compress, and optimize HEIC, PNG, JPG, WebP, AVIF, SVG, and PDF files locally in your browser.',
  canonicalUrl: 'https://zapixal.com',
  isIndexable: true,
  pageCategory: 'home',
  breadcrumbs: [{ name: 'Home', url: '/' }],
  guideContent: null,
  jsonLd: null
};

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

const REDIRECTS_MAP: Record<string, string> = {
  '/grayscale-black-and-white-photo-converter': '/client-side-private-image-compressor',
  '/adjust-image-brightness-contrast-gamma-canvas': '/client-side-private-image-compressor',
  '/add-rounded-corners-border-radius-image': '/client-side-private-image-compressor',
  '/split-image-grid-instagram-banner': '/social-media-banner-resizer-linkedin-twitter',
  '/convert-animated-webp-to-gif': '/convert-webp-to-png-transparent',
  '/convert-eps-psd-preview-to-png': '/convert-svg-to-png-transparent'
};

export function useAppRouting({ initialPath, setSettings }: UseAppRoutingOptions) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    let rawPath = initialPath;
    if (!rawPath && typeof window !== 'undefined') {
      rawPath = window.location.pathname || '/';
    }
    rawPath = rawPath || '/';
    const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
    if (path in REDIRECTS_MAP) {
      const target = REDIRECTS_MAP[path];
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', target);
      }
      return target;
    }
    return path;
  });

  const [seoData, setSeoData] = useState<SeoRouteData>(() => {
    const embedded = getEmbeddedSeoData();
    if (embedded && embedded.path === currentPath) {
      return embedded;
    }
    return { ...INITIAL_FALLBACK_SEO, path: currentPath };
  });

  // Handle path transitions asynchronously
  useEffect(() => {
    let isCancelled = false;
    const embedded = getEmbeddedSeoData();
    if (embedded && embedded.path === currentPath) {
      setSeoData(embedded);
      applySeoToHead(embedded);
    } else {
      parseSeoRoute(currentPath).then(seo => {
        if (!isCancelled) {
          setSeoData(seo);
          applySeoToHead(seo);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname || '/';
      const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
      if (normalizedPath in REDIRECTS_MAP) {
        const target = REDIRECTS_MAP[normalizedPath];
        window.history.replaceState(null, '', target);
        setCurrentPath(target);
      } else {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((newPath: string) => {
    if (typeof window !== 'undefined') {
      const normalizedPath = newPath.length > 1 && newPath.endsWith('/') ? newPath.slice(0, -1) : newPath;
      const targetPath = normalizedPath in REDIRECTS_MAP ? REDIRECTS_MAP[normalizedPath] : newPath;
      window.history.pushState(null, '', targetPath);
      setCurrentPath(targetPath);
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
