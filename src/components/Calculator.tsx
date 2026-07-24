import React, { useState } from 'react';
import { Activity, Copy, Check } from 'lucide-react';

export const Calculator = () => {
  const [visitors, setVisitors] = useState<number>(50000);
  const [imagesPerPage, setImagesPerPage] = useState<number>(4);
  const [avgSizeKB, setAvgSizeKB] = useState<number>(300); // 300KB original PNG
  const [costPerGB, setCostPerGB] = useState<number>(0.08); // AWS standard egress

  const optimizedSizeKB = avgSizeKB * 0.3; // WebP is ~70% smaller than PNG
  const savedKB = avgSizeKB - optimizedSizeKB;
  const totalSavedGB = (visitors * imagesPerPage * savedKB) / (1024 * 1024);
  const moneySaved = totalSavedGB * costPerGB;
  
  // 1 GB data transfer = ~0.06 kg CO2 according to some studies
  const co2SavedKG = totalSavedGB * 0.06;

  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="https://zapixal.com/calculator-widget" width="100%" height="400" frameborder="0"></iframe><div style="font-size:12px;text-align:center;"><a href="https://zapixal.com">Powered by Zapixal Image Compressor</a></div>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-4 flex items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-emerald-500" />
          Bandwidth & Carbon Savings Calculator
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Calculate the bandwidth, money, and CO2 you can save by adopting next-gen WebP & AVIF formats instead of legacy PNG/JPGs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#303134] p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold mb-6">Traffic Inputs</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Monthly Visitors</label>
              <input type="range" min="1000" max="1000000" step="1000" value={visitors} onChange={(e) => setVisitors(Number(e.target.value))} className="w-full" />
              <div className="text-right text-sm text-neutral-500 mt-1">{visitors.toLocaleString()}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Images per Pageview</label>
              <input type="range" min="1" max="20" value={imagesPerPage} onChange={(e) => setImagesPerPage(Number(e.target.value))} className="w-full" />
              <div className="text-right text-sm text-neutral-500 mt-1">{imagesPerPage}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Avg Legacy Image Size (KB)</label>
              <input type="range" min="50" max="2000" step="50" value={avgSizeKB} onChange={(e) => setAvgSizeKB(Number(e.target.value))} className="w-full" />
              <div className="text-right text-sm text-neutral-500 mt-1">{avgSizeKB} KB</div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-6 text-emerald-800 dark:text-emerald-400">Monthly Savings</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800/50 pb-4">
              <span className="font-semibold">Bandwidth Saved:</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{totalSavedGB.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800/50 pb-4">
              <span className="font-semibold">Server Costs (AWS):</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">${moneySaved.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">CO2 Emissions Avoided:</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{co2SavedKG.toFixed(2)} kg</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white dark:bg-[#303134] p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold mb-2 flex items-center gap-2">Embed This Calculator</h3>
        <p className="text-sm text-neutral-500 mb-4">Add this interactive tool to your webmaster blog or technical documentation.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs overflow-x-auto break-all">
            {embedCode}
          </code>
          <button onClick={copyEmbed} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium shrink-0">
            {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
            {copied ? 'Copied' : 'Copy HTML'}
          </button>
        </div>
      </div>
    </div>
  );
};
