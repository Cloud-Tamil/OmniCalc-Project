import React, { useState, useMemo } from 'react';
import { StatResult } from '../types/calculator.ts';
import { soundManager } from '../utils/audio.ts';
import { BarChart3, Sparkles, RefreshCw, Dices } from 'lucide-react';

const PRESETS = [
  { name: 'Exam Grades', data: '78, 85, 92, 88, 74, 95, 82, 90, 85, 68, 99, 84' },
  { name: 'Server Latencies (ms)', data: '14.2, 18.5, 12.1, 15.0, 42.8, 16.4, 13.9, 21.0, 14.2, 88.5, 15.1' },
  { name: 'Weekly Temperatures (°C)', data: '22, 24, 19, 18, 25, 27, 23, 21, 26, 20' },
];

export const StatisticsCalculator: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>(PRESETS[0].data);

  // Parse raw text into sorted number array
  const numbers = useMemo(() => {
    return rawInput
      .split(/[\s,;\n]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
  }, [rawInput]);

  // Compute statistics
  const stats = useMemo<StatResult | null>(() => {
    const n = numbers.length;
    if (n === 0) return null;

    const sum = numbers.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;

    // Mode
    const freqMap: Record<number, number> = {};
    let maxFreq = 0;
    numbers.forEach((v) => {
      freqMap[v] = (freqMap[v] || 0) + 1;
      if (freqMap[v] > maxFreq) maxFreq = freqMap[v];
    });

    const mode: number[] = [];
    if (maxFreq > 1) {
      Object.entries(freqMap).forEach(([val, count]) => {
        if (count === maxFreq) mode.push(parseFloat(val));
      });
    }

    const min = numbers[0];
    const max = numbers[n - 1];
    const range = max - min;

    // Variance & Standard Deviation (Sample)
    const variance = n > 1 ? numbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1) : 0;
    const stdDev = Math.sqrt(variance);

    // Quartiles
    const getQuartile = (arr: number[]) => {
      const len = arr.length;
      if (len === 0) return 0;
      const m = Math.floor(len / 2);
      return len % 2 !== 0 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
    };

    const lowerHalf = numbers.slice(0, Math.floor(n / 2));
    const upperHalf = n % 2 !== 0 ? numbers.slice(Math.floor(n / 2) + 1) : numbers.slice(Math.floor(n / 2));

    const q1 = getQuartile(lowerHalf);
    const q3 = getQuartile(upperHalf);
    const iqr = q3 - q1;

    return {
      count: n,
      sum,
      mean,
      median,
      mode,
      min,
      max,
      range,
      variance,
      stdDev,
      q1,
      q3,
      iqr,
    };
  }, [numbers]);

  // Histogram buckets (up to 8 bins)
  const histogram = useMemo(() => {
    if (!stats || numbers.length === 0 || stats.range === 0) return [];
    const numBins = Math.min(8, Math.max(4, Math.floor(Math.sqrt(numbers.length))));
    const binWidth = (stats.max - stats.min) / numBins;
    const bins = Array.from({ length: numBins }, (_, i) => ({
      min: stats.min + i * binWidth,
      max: stats.min + (i + 1) * binWidth,
      count: 0,
    }));

    numbers.forEach((v) => {
      let idx = Math.floor((v - stats.min) / binWidth);
      if (idx >= numBins) idx = numBins - 1;
      bins[idx].count++;
    });

    const maxCount = Math.max(...bins.map((b) => b.count), 1);
    return bins.map((b) => ({
      ...b,
      heightPercent: Math.round((b.count / maxCount) * 100),
    }));
  }, [stats, numbers]);

  const handleGenerateRandom = () => {
    soundManager.playClick('action');
    const sample = Array.from({ length: 15 }, () => Math.floor(Math.random() * 80 + 20));
    setRawInput(sample.join(', '));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Presets */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Statistical Data Analysis
            </h3>
          </div>

          {/* Sample Dataset Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-500 shrink-0">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  soundManager.playClick('action');
                  setRawInput(p.data);
                }}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={handleGenerateRandom}
              title="Generate 15 random numbers"
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Random</span>
            </button>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Input Dataset (numbers separated by commas, spaces, or newlines)</span>
            <span className="font-mono text-emerald-400 font-semibold">{numbers.length} values parsed</span>
          </label>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={3}
            placeholder="e.g. 12, 15, 18, 22, 25, 30..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-700 leading-relaxed resize-none"
          />
        </div>
      </div>

      {/* Computed Analytics Dashboard */}
      {stats && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-500 block">Mean (Average)</span>
              <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block tabular-nums">
                {stats.mean.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-500 block">Median</span>
              <span className="text-xl font-mono font-bold text-white mt-1 block tabular-nums">
                {stats.median.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-500 block">Standard Deviation (s)</span>
              <span className="text-xl font-mono font-bold text-indigo-400 mt-1 block tabular-nums">
                {stats.stdDev.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-500 block">Variance (s²)</span>
              <span className="text-xl font-mono font-bold text-white mt-1 block tabular-nums">
                {stats.variance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Histogram distribution bar chart */}
          {histogram.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Frequency Distribution Histogram
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {histogram.length} Bins (min: {stats.min} → max: {stats.max})
                </span>
              </div>
              <div className="h-32 flex items-end gap-2 pt-4 px-2">
                {histogram.map((bin, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {bin.count}
                    </span>
                    <div
                      style={{ height: `${Math.max(bin.heightPercent, 8)}%` }}
                      className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all shadow-sm"
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-1 truncate max-w-full">
                      {bin.min.toFixed(0)}-{bin.max.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Stats Table Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Extremes & Spread */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5 font-mono text-xs">
              <span className="font-sans font-bold text-slate-300 text-xs uppercase tracking-wider block border-b border-slate-800 pb-2">
                Extremes & Spread
              </span>
              <div className="flex justify-between text-slate-400">
                <span>Minimum:</span>
                <span className="text-white font-semibold">{stats.min}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Maximum:</span>
                <span className="text-white font-semibold">{stats.max}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Range:</span>
                <span className="text-white font-semibold">{stats.range.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Sum:</span>
                <span className="text-white font-semibold">{stats.sum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mode:</span>
                <span className="text-emerald-400 font-semibold">
                  {stats.mode.length > 0 ? stats.mode.join(', ') : 'No unique mode'}
                </span>
              </div>
            </div>

            {/* Quartiles & Box Plot Metrics */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5 font-mono text-xs">
              <span className="font-sans font-bold text-slate-300 text-xs uppercase tracking-wider block border-b border-slate-800 pb-2">
                Quartiles & Percentiles
              </span>
              <div className="flex justify-between text-slate-400">
                <span>First Quartile (Q1 - 25%):</span>
                <span className="text-white font-semibold">{stats.q1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Second Quartile (Median - 50%):</span>
                <span className="text-white font-semibold">{stats.median.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Third Quartile (Q3 - 75%):</span>
                <span className="text-white font-semibold">{stats.q3.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Interquartile Range (IQR):</span>
                <span className="text-indigo-400 font-semibold">{stats.iqr.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
