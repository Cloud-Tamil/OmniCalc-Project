import React, { useState, useEffect } from 'react';
import { UnitCategory, UnitDefinition } from '../types/calculator.ts';
import { soundManager } from '../utils/audio.ts';
import { ArrowLeftRight, Ruler, Scale, Thermometer, HardDrive, Square, Gauge, Clock, Coins } from 'lucide-react';

const CATEGORIES: Array<{ id: UnitCategory; label: string; icon: React.ReactNode }> = [
  { id: 'length', label: 'Length', icon: <Ruler className="w-4 h-4" /> },
  { id: 'mass', label: 'Weight & Mass', icon: <Scale className="w-4 h-4" /> },
  { id: 'temperature', label: 'Temperature', icon: <Thermometer className="w-4 h-4" /> },
  { id: 'digital', label: 'Data Storage', icon: <HardDrive className="w-4 h-4" /> },
  { id: 'area', label: 'Area', icon: <Square className="w-4 h-4" /> },
  { id: 'speed', label: 'Speed', icon: <Gauge className="w-4 h-4" /> },
  { id: 'time', label: 'Time', icon: <Clock className="w-4 h-4" /> },
  { id: 'currency', label: 'Currency (USD base)', icon: <Coins className="w-4 h-4" /> },
];

const UNIT_DATA: Record<UnitCategory, UnitDefinition[]> = {
  length: [
    { id: 'm', name: 'Meter', symbol: 'm', factor: 1 },
    { id: 'km', name: 'Kilometer', symbol: 'km', factor: 1000 },
    { id: 'cm', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
    { id: 'mm', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
    { id: 'mi', name: 'Mile', symbol: 'mi', factor: 1609.344 },
    { id: 'yd', name: 'Yard', symbol: 'yd', factor: 0.9144 },
    { id: 'ft', name: 'Foot', symbol: 'ft', factor: 0.3048 },
    { id: 'in', name: 'Inch', symbol: 'in', factor: 0.0254 },
    { id: 'nmi', name: 'Nautical Mile', symbol: 'NM', factor: 1852 },
  ],
  mass: [
    { id: 'kg', name: 'Kilogram', symbol: 'kg', factor: 1 },
    { id: 'g', name: 'Gram', symbol: 'g', factor: 0.001 },
    { id: 'mg', name: 'Milligram', symbol: 'mg', factor: 0.000001 },
    { id: 'lb', name: 'Pound', symbol: 'lb', factor: 0.45359237 },
    { id: 'oz', name: 'Ounce', symbol: 'oz', factor: 0.02834952 },
    { id: 't', name: 'Metric Ton', symbol: 't', factor: 1000 },
    { id: 'st', name: 'Stone', symbol: 'st', factor: 6.35029 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', symbol: '°C', factor: 1, offset: 0 },
    { id: 'f', name: 'Fahrenheit', symbol: '°F', factor: 1, offset: 32 },
    { id: 'k', name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15 },
  ],
  digital: [
    { id: 'b', name: 'Byte', symbol: 'B', factor: 1 },
    { id: 'kb', name: 'Kilobyte (KB)', symbol: 'KB', factor: 1024 },
    { id: 'mb', name: 'Megabyte (MB)', symbol: 'MB', factor: 1024 * 1024 },
    { id: 'gb', name: 'Gigabyte (GB)', symbol: 'GB', factor: 1024 * 1024 * 1024 },
    { id: 'tb', name: 'Terabyte (TB)', symbol: 'TB', factor: 1024 * 1024 * 1024 * 1024 },
    { id: 'pb', name: 'Petabyte (PB)', symbol: 'PB', factor: 1024 * 1024 * 1024 * 1024 * 1024 },
  ],
  area: [
    { id: 'sq_m', name: 'Square Meter', symbol: 'm²', factor: 1 },
    { id: 'sq_km', name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
    { id: 'sq_ft', name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
    { id: 'sq_mi', name: 'Square Mile', symbol: 'mi²', factor: 2589988.11 },
    { id: 'acre', name: 'Acre', symbol: 'ac', factor: 4046.86 },
    { id: 'hectare', name: 'Hectare', symbol: 'ha', factor: 10000 },
  ],
  speed: [
    { id: 'mps', name: 'Meters per Second', symbol: 'm/s', factor: 1 },
    { id: 'kph', name: 'Kilometers per Hour', symbol: 'km/h', factor: 0.277778 },
    { id: 'mph', name: 'Miles per Hour', symbol: 'mph', factor: 0.44704 },
    { id: 'knot', name: 'Knot', symbol: 'kn', factor: 0.514444 },
  ],
  time: [
    { id: 's', name: 'Second', symbol: 's', factor: 1 },
    { id: 'min', name: 'Minute', symbol: 'min', factor: 60 },
    { id: 'hr', name: 'Hour', symbol: 'hr', factor: 3600 },
    { id: 'day', name: 'Day', symbol: 'd', factor: 86400 },
    { id: 'wk', name: 'Week', symbol: 'wk', factor: 604800 },
    { id: 'mo', name: 'Month (30d)', symbol: 'mo', factor: 2592000 },
    { id: 'yr', name: 'Year (365d)', symbol: 'yr', factor: 31536000 },
  ],
  currency: [
    { id: 'USD', name: 'US Dollar', symbol: '$', factor: 1.0 },
    { id: 'EUR', name: 'Euro', symbol: '€', factor: 0.92 },
    { id: 'GBP', name: 'British Pound', symbol: '£', factor: 0.78 },
    { id: 'JPY', name: 'Japanese Yen', symbol: '¥', factor: 154.2 },
    { id: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', factor: 1.36 },
    { id: 'AUD', name: 'Australian Dollar', symbol: 'AU$', factor: 1.52 },
    { id: 'INR', name: 'Indian Rupee', symbol: '₹', factor: 83.45 },
    { id: 'CNY', name: 'Chinese Yuan', symbol: '¥', factor: 7.24 },
    { id: 'CHF', name: 'Swiss Franc', symbol: 'CHF', factor: 0.89 },
  ],
};

export const UnitConverter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>('length');
  const units = UNIT_DATA[selectedCategory];

  const [fromUnitId, setFromUnitId] = useState<string>(units[0].id);
  const [toUnitId, setToUnitId] = useState<string>(units[1].id);
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');

  // Update unit selectors when category changes
  useEffect(() => {
    const list = UNIT_DATA[selectedCategory];
    setFromUnitId(list[0].id);
    setToUnitId(list[1]?.id || list[0].id);
  }, [selectedCategory]);

  const convertValues = (val: string, fromId: string, toId: string): string => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';

    const fromUnit = units.find((u) => u.id === fromId);
    const toUnit = units.find((u) => u.id === toId);
    if (!fromUnit || !toUnit) return '';

    // Temperature special case
    if (selectedCategory === 'temperature') {
      let celsius = num;
      if (fromId === 'f') celsius = ((num - 32) * 5) / 9;
      else if (fromId === 'k') celsius = num - 273.15;

      let target = celsius;
      if (toId === 'f') target = (celsius * 9) / 5 + 32;
      else if (toId === 'k') target = celsius + 273.15;

      return parseFloat(target.toFixed(4)).toString();
    }

    // Currency special case (factor is rate per 1 USD)
    if (selectedCategory === 'currency') {
      const inUsd = num / fromUnit.factor;
      const target = inUsd * toUnit.factor;
      return parseFloat(target.toFixed(4)).toString();
    }

    // Standard linear conversion
    const baseValue = num * fromUnit.factor;
    const result = baseValue / toUnit.factor;

    // Clean formatting
    if (Math.abs(result) < 0.00001 && result !== 0) {
      return result.toExponential(4);
    }
    return parseFloat(result.toFixed(6)).toString();
  };

  useEffect(() => {
    setToValue(convertValues(fromValue, fromUnitId, toUnitId));
  }, [fromValue, fromUnitId, toUnitId, selectedCategory]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromValue(val);
    setToValue(convertValues(val, fromUnitId, toUnitId));
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setToValue(val);
    setFromValue(convertValues(val, toUnitId, fromUnitId));
  };

  const handleSwap = () => {
    soundManager.playClick('action');
    const tempUnit = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(tempUnit);
  };

  const fromObj = units.find((u) => u.id === fromUnitId);
  const toObj = units.find((u) => u.id === toUnitId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick('action');
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Converter Dual Interface */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* "From" Card */}
          <div className="md:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">From</span>
            <input
              type="number"
              value={fromValue}
              onChange={handleFromChange}
              placeholder="0"
              className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-white focus:outline-none tabular-nums"
            />
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-center justify-center">
            <button
              onClick={handleSwap}
              title="Swap units"
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 shadow-md transition-all active:scale-90 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* "To" Card */}
          <div className="md:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">To Result</span>
            <input
              type="number"
              value={toValue}
              onChange={handleToChange}
              placeholder="0"
              className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-emerald-400 focus:outline-none tabular-nums"
            />
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula & Equivalent Ratio Explanation */}
        {fromObj && toObj && (
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-white font-semibold">1 {fromObj.symbol}</span>
              <span>=</span>
              <span className="text-emerald-400 font-semibold">
                {convertValues('1', fromUnitId, toUnitId)} {toObj.symbol}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              High-precision IEEE-754 arithmetic with auto-scaling
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
