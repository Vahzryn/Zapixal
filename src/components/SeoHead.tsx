import React, { useEffect } from 'react';
import { generateSoftwareApplicationSchema, getSeoInfoForRoute } from '../lib/seoData';

interface SeoHeadProps {
  currentRoute: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ currentRoute }) => {
  const seoInfo = getSeoInfoForRoute(currentRoute);

  useEffect(() => {
    // 1. Update Document Title
    document.title = seoInfo.title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoInfo.metaDescription);

    // 3. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    canonical.setAttribute('href', `${origin}${pathname}${currentRoute === '/' ? '' : currentRoute}`);

    // 4. Inject JSON-LD Schema Block
    const schemaId = 'software-app-jsonld';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(generateSoftwareApplicationSchema());

  }, [currentRoute, seoInfo]);

  return null;
};
