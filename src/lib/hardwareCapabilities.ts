export interface HardwareConfig {
  mode: 'STANDARD' | 'ECO';
  maxConcurrentWorkers: number;
  maxCanvasDimension: number;
}

export function detectHardwareCapabilities(): HardwareConfig {
  const isBrowser = typeof navigator !== 'undefined';
  const hardwareConcurrency = isBrowser ? (navigator.hardwareConcurrency || 2) : 2;
  // @ts-ignore - deviceMemory is non-standard but supported in Chromium
  const deviceMemory = isBrowser ? ((navigator as any).deviceMemory || 4) : 4; // GB

  // Default to Standard Mode
  let config: HardwareConfig = {
    mode: 'STANDARD',
    maxConcurrentWorkers: Math.max(1, hardwareConcurrency - 1),
    maxCanvasDimension: 8192, // High resolution support
  };

  // Eco-mode trigger conditions
  const isLowMemory = deviceMemory <= 4;
  const isLowCore = hardwareConcurrency <= 4;

  if (isLowMemory || isLowCore) {
    config = {
      mode: 'ECO',
      maxConcurrentWorkers: 1, // Sequential processing
      maxCanvasDimension: 2560, // Downscale to save memory
    };
  }

  return config;
}

// Battery Status API requires async setup if used, but we can do a quick check
export async function checkBatteryThrottling(config: HardwareConfig): Promise<HardwareConfig> {
  if (typeof navigator !== 'undefined' && typeof (navigator as any).getBattery === 'function') {
    try {
      const battery = await (navigator as any).getBattery();
      if (!battery.charging && battery.level < 0.2) {
        console.warn('Low battery detected, switching to ECO mode.');
        return {
          mode: 'ECO',
          maxConcurrentWorkers: 1,
          maxCanvasDimension: 2560,
        };
      }
    } catch (e) {
      console.warn('Battery API blocked or failed', e);
    }
  }
  return config;
}
