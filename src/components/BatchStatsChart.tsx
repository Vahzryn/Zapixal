import React from 'react';
import { ImageFileItem } from '../types';
import { formatBytes } from '../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { TrendingDown, HardDrive, Zap, CheckCircle2 } from 'lucide-react';

interface BatchStatsChartProps {
  files: ImageFileItem[];
}

export function BatchStatsChart({ files }: BatchStatsChartProps) {
  const convertedFiles = files.filter(
    (f) => f.status === 'success' && f.convertedSize !== undefined
  );

  if (convertedFiles.length === 0) {
    return null;
  }

  const totalOriginal = convertedFiles.reduce((acc, f) => acc + f.originalSize, 0);
  const totalConverted = convertedFiles.reduce(
    (acc, f) => acc + (f.convertedSize || 0),
    0
  );
  const totalSaved = Math.max(0, totalOriginal - totalConverted);
  const overallSavingsPercent =
    totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  // Prepare data for per-file BarChart (MB conversion for cleaner numbers)
  const chartData = convertedFiles.map((file, idx) => {
    const origMB = parseFloat((file.originalSize / (1024 * 1024)).toFixed(2));
    const convMB = parseFloat(((file.convertedSize || 0) / (1024 * 1024)).toFixed(2));
    const savedPercent =
      file.originalSize > 0
        ? Math.round(
            ((file.originalSize - (file.convertedSize || 0)) / file.originalSize) * 100
          )
        : 0;

    const shortName =
      file.file.name.length > 16
        ? `${file.file.name.substring(0, 13)}...`
        : file.file.name;

    return {
      id: file.id,
      name: shortName,
      fullName: file.file.name,
      originalBytes: file.originalSize,
      convertedBytes: file.convertedSize || 0,
      'Original (MB)': origMB,
      'Converted (MB)': convMB,
      savedPercent,
    };
  });

  const pieData = [
    { name: 'Converted Size', value: totalConverted, color: '#3b82f6' },
    { name: 'Space Saved', value: totalSaved, color: '#10b981' },
  ];

  return (
    <div className="w-full mt-10 p-6 md:p-8 bg-white dark:bg-[#303134] border border-neutral-200 dark:border-[#3c4043] rounded-3xl shadow-sm transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-100 dark:border-[#3c4043]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-[#1a2c20] text-emerald-600 dark:text-[#81c995] rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-[#e8eaed]">
              Batch Compression Summary
            </h3>
            <p className="text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6]">
              Real-time size reduction analysis across {convertedFiles.length}{' '}
              {convertedFiles.length === 1 ? 'file' : 'files'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-emerald-500/10 dark:bg-[#1a2c20] px-4 py-2.5 rounded-2xl border border-emerald-500/20">
          <Zap className="w-5 h-5 text-emerald-600 dark:text-[#81c995]" />
          <div>
            <span className="block text-[11px] font-bold text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider">
              Total Space Saved
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-[#81c995]">
              {formatBytes(totalSaved)} ({overallSavingsPercent}% smaller)
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-neutral-50 dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
          <span className="block text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6]">
            Total Original Size
          </span>
          <span className="text-xl font-bold text-neutral-800 dark:text-[#e8eaed] mt-0.5 block">
            {formatBytes(totalOriginal)}
          </span>
        </div>

        <div className="p-4 bg-neutral-50 dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
          <span className="block text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6]">
            Total Output Size
          </span>
          <span className="text-xl font-bold text-blue-600 dark:text-[#8ab4f8] mt-0.5 block">
            {formatBytes(totalConverted)}
          </span>
        </div>

        <div className="p-4 bg-neutral-50 dark:bg-[#202124] border border-neutral-200 dark:border-[#3c4043] rounded-2xl">
          <span className="block text-xs font-semibold text-neutral-500 dark:text-[#9aa0a6]">
            Average Reduction
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-[#81c995] mt-0.5 block">
            {overallSavingsPercent}%
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Main Bar Chart: File Comparisons */}
        <div className="lg:col-span-2 h-[280px] w-full">
          <h4 className="text-xs font-bold text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider mb-3">
            Per-File Size Comparison (MB)
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                stroke="#9aa0a6"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#9aa0a6" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-neutral-900/95 dark:bg-[#202124] text-white rounded-xl shadow-xl border border-neutral-700 text-xs font-semibold space-y-1">
                        <p className="font-bold border-b border-neutral-700 pb-1 text-blue-300">
                          {data.fullName}
                        </p>
                        <p>Original: {formatBytes(data.originalBytes)}</p>
                        <p className="text-emerald-400">
                          Converted: {formatBytes(data.convertedBytes)}
                        </p>
                        <p className="text-amber-300">
                          Savings: {data.savedPercent}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar
                dataKey="Original (MB)"
                fill="#64748b"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="Converted (MB)"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Donut Chart */}
        <div className="h-[280px] w-full flex flex-col items-center justify-center">
          <h4 className="text-xs font-bold text-neutral-500 dark:text-[#9aa0a6] uppercase tracking-wider mb-1 self-start">
            Batch Weight Allocation
          </h4>
          <div className="relative w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatBytes(value)}
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-emerald-600 dark:text-[#81c995]">
                {overallSavingsPercent}%
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Saved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
