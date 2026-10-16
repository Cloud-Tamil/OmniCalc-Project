import React from 'react';
import { CalculatorMode } from '../types/calculator.ts';
import { Calculator, ArrowRightLeft, DollarSign, Binary, BarChart3, LineChart, History, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface CalculatorNavProps {
  currentMode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  historyCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const CalculatorNav: React.FC<CalculatorNavProps> = ({
  currentMode,
  onModeChange,
  isHistoryOpen,
  onToggleHistory,
  historyCount,
  soundEnabled,
  onToggleSound,
}) => {
  const modes: Array<{ id: CalculatorMode; label: string; icon: React.ReactNode }> = [
    { id: 'scientific', label: 'Scientific', icon: <Calculator className="w-4 h-4" /> },
    { id: 'converter', label: 'Unit Converter', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'finance', label: 'Loan & Finance', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'programmer', label: 'Programmer', icon: <Binary className="w-4 h-4" /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'graphing', label: '2D Grapher', icon: <LineChart className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark with logo matching favicon */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 p-1 flex flex-col justify-between shadow-md relative overflow-hidden">
            {/* Screen */}
            <div className="w-full h-2 rounded-[2px] bg-gradient-to-r from-sky-400 to-cyan-400" />
            {/* Keypad */}
            <div className="grid grid-cols-3 gap-0.5 pt-0.5">
              <div className="h-1 rounded-[1px] bg-slate-400" />
              <div className="h-1 rounded-[1px] bg-slate-400" />
              <div className="h-1 rounded-[1px] bg-slate-400" />
              <div className="h-1 rounded-[1px] bg-slate-400" />
              <div className="h-1 rounded-[1px] bg-slate-400" />
              <div className="h-1 rounded-[1px] bg-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              OmniCalc
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Pro Suite
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Modes */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  soundManager.playClick('action');
                  onModeChange(m.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Sound & History Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundManager.playClick('action');
            }}
            title={soundEnabled ? 'Acoustic tactile clicks enabled' : 'Acoustic clicks muted'}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={() => {
              soundManager.playClick('action');
              onToggleHistory();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isHistoryOpen
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Tape</span>
            {historyCount > 0 && (
              <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet mode bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-900 overflow-x-auto scrollbar-none">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              soundManager.playClick('action');
              onModeChange(m.id);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
              currentMode === m.id
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
