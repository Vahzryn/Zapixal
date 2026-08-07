import { TargetFormat } from '../../types';

export interface SeoRouteItem {
  path: string;
  label: string;
  category: 'converter' | 'compression' | 'use-case' | 'resource';
}

export const DOMAIN = 'https://zapixal.com';

export const PSEO_ROUTES_LIST: SeoRouteItem[] = [];
