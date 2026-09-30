import React, { useState, useEffect } from 'react';
import { 
  X, Zap, Cpu, Battery, BatteryCharging, Gauge, 
  Sparkles, CheckCircle2, ShieldAlert, RefreshCw, 
  Layers, HardDrive, Play, Activity, Check
} from 'lucide-react';
import { 
  DeviceHardwareProfile, 
  UserAdaptiveModePreference, 
  BenchmarkResult,
  getAdaptiveProfile, 
  setAdaptivePreference, 
  getSavedAdaptivePreference,
  runHardwareBenchmark,
  flushMemoryCaches
} from '../lib/adaptiveEngine';
import { cn } from '../lib/utils';

interface AdaptiveEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdaptiveEngineModal({ isOpen, onClose }: AdaptiveEngineModalProps) {
  const [profile, setProfile] = useState<DeviceHardwareProfile | null>(null);
  const [preference, setPreference] = useState<UserAdaptiveModePreference>('AUTO');
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [flushedNotification, setFlushedNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAdaptiveProfile().then(setProfile);
      setPreference(getSavedAdaptivePreference());
    }
  }, [isOpen]);

  if (!isOpen || !profile) return null;

  const handleSelectPreference = async (pref: UserAdaptiveModePreference) => {
    setPreference(pref);
    const updated = await setAdaptivePreference(pref);
    setProfile(updated);
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const result = await runHardwareBenchmark();
      setBenchmark(result);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleFlushMemory = () => {
    flushMemoryCaches();
    setFlushedNotification(true);
    setTimeout(() => setFlushedNotification(false), 2500);
  };

  const getTierDetails = (tier: string) => {
    switch (tier) {
      case 'ULTRA_WEBGPU':
        return {
          title: 'Ultra (WebGPU Accelerated)',
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
          badge: '⚡ WebGPU Ultra',
          desc: 'Maximum GPU compute shaders + parallel SIMD workers. Zero throttling for 4K/8K images.'
        };
      case 'HIGH_SIMD':
        return {
          title: 'High (CPU SIMD Multi-Core)',
          color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
          badge: '🚀 CPU SIMD',
          desc: '128-bit vector WebAssembly + multi-worker thread pool. Ideal for laptops & workstations.'
        };
      case 'MID_BALANCED':
        return {
          title: 'Balanced (Multi-Worker)',
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
          badge: '⚖️ Balanced',
          desc: 'Balanced worker pipeline with progressive UI yields to ensure smooth 60 FPS responsiveness.'
        };
      case 'LOW_ECO':
      default:
        return {
          title: 'Eco / Lightweight Path',
          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
          badge: '🍃 Eco Saver',
          desc: 'Memory-safe sequential pipeline designed for mobile devices, low RAM, or battery preservation.'
        };
    }
  };

  const tierInfo = getTierDetails(profile.tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adaptive-engine-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 id="adaptive-engine-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Adaptive Hardware Engine
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", tierInfo.color)}>
                  {tierInfo.badge}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dynamic capability detection & multi-tier compute routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* Architecture Visual Map */}
          <div className="p-4 rounded-xl bg-zinc-950 text-zinc-200 border border-zinc-800 font-mono text-xs overflow-x-auto shadow-inner">
            <div className="text-zinc-400 font-sans text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Adaptive Architecture Routing</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE PATH: {profile.tier}
              </span>
            </div>
            <pre className="text-zinc-300 leading-relaxed select-none">
{`                    Zapixal Adaptive Router
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
      Capable Device                       Limited Device
             │                                   │
       ┌─────┴─────┐                             │
       │           │                             │
    WebGPU      CPU SIMD                         │
       │           │                             │
       └─────┬─────┘                             │
             │                                   │
   ⚡ Accelerated Pipeline              🍃 Lightweight Eco Path
  (${profile.maxWorkerConcurrency} Web Workers, ${profile.maxCanvasDimension}px max)      (Sequential, Memory Guard)`}
            </pre>
          </div>

          {/* Device Telemetry Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              Live Hardware Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>CPU Cores</span>
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-white">
                  {profile.cpuCores} Threads
                </div>
                <div className="text-[11px] text-zinc-500">
                  {profile.maxWorkerConcurrency} Worker Pool
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Device RAM</span>
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-white">
                  ~{profile.deviceMemoryGB} GB
                </div>
                <div className="text-[11px] text-zinc-500">
                  {profile.deviceMemoryGB >= 8 ? 'High Capacity' : 'Standard'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>WASM SIMD</span>
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                  {profile.hasWasmSimd ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Enabled
                    </span>
                  ) : (
                    <span className="text-zinc-400">Standard</span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-500">128-bit Vectorization</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                  {profile.isBatteryThrottled ? <Battery className="w-3.5 h-3.5 text-amber-500" /> : <BatteryCharging className="w-3.5 h-3.5" />}
                  <span>Power Mode</span>
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-white">
                  {profile.isBatteryThrottled ? 'Low Battery' : (profile.isSaveDataActive ? 'Save Data' : 'Standard AC')}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {profile.isBatteryThrottled ? 'Auto Eco Activated' : 'High Performance'}
                </div>
              </div>
            </div>

            {/* GPU Info string */}
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 px-1 truncate">
              Graphics: <span className="font-mono text-zinc-800 dark:text-zinc-200">{profile.gpuAdapter}</span> ({profile.hasWebGPU ? 'WebGPU Native' : (profile.hasWebGL2 ? 'WebGL2 Available' : '2D Canvas')})
            </div>
          </div>

          {/* Profile Override Mode Selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
              Compute Profile Preference
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectPreference('AUTO')}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer",
                  preference === 'AUTO'
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Auto Adaptive (Recommended)
                  </span>
                  {preference === 'AUTO' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Dynamically auto-adjusts concurrency, memory budgets, and GPU shaders according to your device specs.
                </p>
              </button>

              <button
                onClick={() => handleSelectPreference('ULTRA_WEBGPU')}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer",
                  preference === 'ULTRA_WEBGPU'
                    ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Force WebGPU Turbo
                  </span>
                  {preference === 'ULTRA_WEBGPU' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Forces maximum GPU acceleration and up to 8 parallel SIMD workers for high-volume batches.
                </p>
              </button>

              <button
                onClick={() => handleSelectPreference('HIGH_SIMD')}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer",
                  preference === 'HIGH_SIMD'
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-500" />
                    CPU SIMD Multi-Core
                  </span>
                  {preference === 'HIGH_SIMD' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Bypasses GPU pipeline and runs all tasks across multithreaded WASM workers.
                </p>
              </button>

              <button
                onClick={() => handleSelectPreference('LOW_ECO')}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer",
                  preference === 'LOW_ECO'
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    🍃 Eco Battery Saver
                  </span>
                  {preference === 'LOW_ECO' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sequential processing, downsampling protection, and minimal battery/RAM consumption.
                </p>
              </button>
            </div>
          </div>

          {/* Benchmark & Memory Tools */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isBenchmarking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Benchmarking...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Quick Benchmark</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFlushMemory}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{flushedNotification ? 'Memory Flushed!' : 'Flush Memory Cache'}</span>
              </button>
            </div>

            {benchmark && (
              <div className="text-xs text-right text-zinc-600 dark:text-zinc-400 font-mono">
                Throughput: <span className="font-bold text-indigo-600 dark:text-indigo-400">{benchmark.megaPixelsPerSec} MP/s</span> (Score: {benchmark.score})
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
