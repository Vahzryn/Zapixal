import { useState, useEffect, useCallback } from 'react';
import { ConversionSettings } from '../types';
import { parseSeoRoute, applySeoToHead, SeoRouteData } from '../lib/seoEngine';
import { PSEO_ROUTES_LIST, DOMAIN } from '../lib/seo/routes';
import { getPageSeo as getNotFoundSeo } from '../lib/seo/pages/not-found';

interface UseAppRoutingOptions {
  initialPath?: string;
  initialSeoData?: SeoRouteData;
  setSettings: React.Dispatch<React.SetStateAction<ConversionSettings>>;
  touchedKeys?: Set<string>;
}

const STATIC_KNOWN_ROUTES = new Set([
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/404'
]);

export function isKnownRoute(pathname: string): boolean {
  const rawPath = (pathname || '/').split('?')[0].split('#')[0].toLowerCase().trim();
  const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : (rawPath || '/');
  if (STATIC_KNOWN_ROUTES.has(path)) return true;
  if (PSEO_ROUTES_LIST.some(r => r.path === path)) return true;
  if (path in REDIRECTS_MAP) return true;
  return false;
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
  '/convert-eps-psd-preview-to-png': '/convert-svg-to-png-transparent',
  '/passport-visa-photo-resizer-background-white': '/passport-photo-size-reducer-kb',
  '/rotate-and-flip-image-local': '/crop-image-to-exact-aspect-ratio',
  '/batch-rename-watermark-resize-pipeline': '/bulk-image-compressor-offline',
  '/square-photo-maker-no-crop-blur-border': '/crop-image-to-exact-aspect-ratio'
};

export function useAppRouting({ initialPath, initialSeoData, setSettings, touchedKeys }: UseAppRoutingOptions) {
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
    if (initialSeoData) return initialSeoData;
    const embedded = getEmbeddedSeoData();
    if (embedded) {
      if (embedded.path === currentPath || embedded.isNotFound) {
        return { ...embedded, path: currentPath };
      }
    }
    if (!isKnownRoute(currentPath)) {
      const fullUrl = `${DOMAIN}${currentPath === '/' ? '' : currentPath}`;
      return getNotFoundSeo(fullUrl, currentPath);
    }
    return { ...INITIAL_FALLBACK_SEO, path: currentPath };
  });

  const applySettings = useCallback((seo: SeoRouteData) => {
    setSettings(prev => {
      let next = { ...prev };
      const touched = touchedKeys || new Set<string>();

      if (!touched.has('targetFormat') && seo.toFormat) {
        next.targetFormat = seo.toFormat;
      }

      if (!touched.has('targetMaxKB')) {
        if (seo.targetMaxKB) {
          next.targetMaxKB = seo.targetMaxKB;
        } else {
          next.targetMaxKB = undefined;
        }
      }

      if (!touched.has('stripExif')) {
        if (seo.stripExif !== undefined) {
          next.stripExif = seo.stripExif;
        }
      }

      if (!touched.has('resize')) {
        if (seo.presetResize) {
          next.resize = {
            enabled: true,
            maxWidth: seo.presetResize.maxWidth,
            maxHeight: seo.presetResize.maxHeight,
            keepAspectRatio: true
          };
        } else if (seo.path.includes('resize') || seo.path.includes('passport') || seo.path.includes('size-reducer')) {
          next.resize = { ...next.resize, enabled: true, keepAspectRatio: true };
        } else {
          next.resize = { ...next.resize, enabled: false };
        }
      }

      if (!touched.has('cropAspectRatio')) {
        if (seo.path.includes('crop')) {
          next.cropAspectRatio = { width: 16, height: 9 };
        } else {
          next.cropAspectRatio = null;
        }
      }

      return next;
    });
  }, [setSettings, touchedKeys]);

  // Handle path transitions asynchronously
  useEffect(() => {
    let isCancelled = false;
    const embedded = getEmbeddedSeoData();
    if (embedded && embedded.path === currentPath) {
      setSeoData(embedded);
      applySeoToHead(embedded);
      applySettings(embedded);
    } else {
      parseSeoRoute(currentPath).then(seo => {
        if (!isCancelled) {
          setSeoData(seo);
          applySeoToHead(seo);
          applySettings(seo);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [currentPath, applySettings]);

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
