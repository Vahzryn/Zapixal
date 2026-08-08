export interface HardwareConfig {
  mode: 'STANDARD' | 'ECO';
  tier: 'LOW' | 'MID' | 'HIGH';
  maxConcurrentWorkers: number;
  maxCanvasDimension: number;
  thumbnailBatchSize: number;
}

// Threshold constants for hardware tier classification
const MEMORY_LOW_THRESHOLD = 2; // GB of RAM
const CONCURRENCY_LOW_THRESHOLD = 2; // CPU logical cores
const MEMORY_HIGH_THRESHOLD = 8; // GB of RAM
const CONCURRENCY_HIGH_THRESHOLD = 8; // CPU logical cores

export function detectHardwareCapabilities(): HardwareConfig {
  const isBrowser = typeof navigator !== 'undefined';
  const hardwareConcurrency = isBrowser ? (navigator.hardwareConcurrency || 2) : 2;
  // @ts-ignore - deviceMemory is non-standard but supported in Chromium
  const deviceMemory = isBrowser ? ((navigator as any).deviceMemory || 4) : 4; // GB
  
  // Guard Chromium-only navigator.connection API
  const isSaveDataActive = isBrowser && !!(navigator as any).connection?.saveData;

  // Determine Tier
  let tier: 'LOW' | 'MID' | 'HIGH' = 'MID';

  if (deviceMemory <= MEMORY_LOW_THRESHOLD || hardwareConcurrency <= CONCURRENCY_LOW_THRESHOLD || isSaveDataActive) {
    tier = 'LOW';
  } else if (deviceMemory >= MEMORY_HIGH_THRESHOLD && hardwareConcurrency >= CONCURRENCY_HIGH_THRESHOLD) {
    tier = 'HIGH';
  } else {
    tier = 'MID';
  }

  // Derive config based on tier
  if (tier === 'LOW') {
    return {
      mode: 'ECO',
      tier: 'LOW',
      maxConcurrentWorkers: 1,
      maxCanvasDimension: 2048,
      thumbnailBatchSize: 1,
    };
  } else if (tier === 'MID') {
    return {
      mode: 'STANDARD',
      tier: 'MID',
      maxConcurrentWorkers: Math.max(1, Math.min(3, hardwareConcurrency - 1)),
      maxCanvasDimension: 4096, // High resolution support for MID tier
      thumbnailBatchSize: 2,
    };
  } else {
    return {
      mode: 'STANDARD',
      tier: 'HIGH',
      maxConcurrentWorkers: Math.max(1, Math.min(6, hardwareConcurrency - 1)),
      maxCanvasDimension: 8192,
      thumbnailBatchSize: 3,
    };
  }
}

// Battery Status API requires async setup if used, but we can do a quick check
export async function checkBatteryThrottling(config: HardwareConfig): Promise<HardwareConfig> {
  if (typeof navigator !== 'undefined' && typeof (navigator as any).getBattery === 'function') {
    try {
      const battery = await (navigator as any).getBattery();
      if (!battery.charging && battery.level < 0.2) {
        console.warn('Low battery detected, switching to ECO/LOW mode.');
        return {
          mode: 'ECO',
          tier: 'LOW',
          maxConcurrentWorkers: 1,
          maxCanvasDimension: 2048,
          thumbnailBatchSize: 1,
        };
      }
    } catch (e) {
      console.warn('Battery API blocked or failed', e);
    }
  }
  return config;
}
