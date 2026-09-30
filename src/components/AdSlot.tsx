import React from 'react';
import { cn } from '../lib/utils';

interface AdSlotProps {
  /**
   * Placement context for future ad targeting/analytics.
   */
  placement?: 'homepage' | 'tool-result' | 'directory' | 'article';
  /**
   * Optional custom styling.
   */
  className?: string;
}

/**
 * Reusable layout container reserved for small, privacy-friendly future sponsorships/advertisements.
 * 
 * Design specifications:
 * - Positioned strictly AFTER primary useful interactions/results and BEFORE lower-priority supporting content.
 * - Normal document flow (strictly no sticky, floating, popup, or interstitial overlays).
 * - Explicit "Advertisement" label for full transparency.
 * - Visually distinct from Zapixal's own tool cards (neutral dashed border, muted surface).
 * - Layout-shift protected: fixed/min-height reserve guard prevents CLS.
 * - Client-side static placeholder: no third-party ad networks or tracking scripts loaded.
 */
export const AdSlot: React.FC<AdSlotProps> = React.memo(function AdSlot() {
  // Ad spaces disabled per user request
  return null;
});

