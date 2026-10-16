/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CalculatorMode, HistoryItem } from './types/calculator.ts';
import { CalculatorNav } from './components/CalculatorNav.tsx';
import { ScientificCalculator } from './components/ScientificCalculator.tsx';
import { UnitConverter } from './components/UnitConverter.tsx';
import { FinancialCalculator } from './components/FinancialCalculator.tsx';
import { ProgrammerCalculator } from './components/ProgrammerCalculator.tsx';
import { StatisticsCalculator } from './components/StatisticsCalculator.tsx';
import { GraphingCalculator } from './components/GraphingCalculator.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { soundManager } from './utils/audio.ts';

export default function App() {
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('scientific');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [recalledExpr, setRecalledExpr] = useState<string>('');

  // Load history from backend API on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/calc/history');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data)) {
            setHistory(json.data);
          }
        }
      } catch (err) {
        console.warn('Backend history sync warning:', err);
      }
    };
    fetchHistory();
  }, []);

  // Global hotkeys for mode switching & history tape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in a form input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        soundManager.playClick('action');
        setIsHistoryOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleToggleSound = () => {
    soundManager.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleAddHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const localItem: HistoryItem = {
      ...item,
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => [localItem, ...prev.slice(0, 49)]);

    // Send to backend store
    try {
      await fetch('/api/calc/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const handleClearHistory = async () => {
    setHistory([]);
    try {
      await fetch('/api/calc/history', { method: 'DELETE' });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentMode('scientific');
    setRecalledExpr(item.expression);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navbar */}
      <CalculatorNav
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        historyCount={history.length}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Calculator Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentMode === 'scientific' && (
          <ScientificCalculator
            onAddHistory={handleAddHistory}
            externalExpression={recalledExpr}
          />
        )}

        {currentMode === 'converter' && <UnitConverter />}

        {currentMode === 'finance' && <FinancialCalculator />}

        {currentMode === 'programmer' && <ProgrammerCalculator />}

        {currentMode === 'statistics' && <StatisticsCalculator />}

        {currentMode === 'graphing' && <GraphingCalculator />}
      </main>

      {/* Calculation Tape Slide-Out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
      />

      {/* Keyboard Shortcuts Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">OmniCalc</span>
            <span>·</span>
            <span>Precision Multi-Disciplinary Calculator Workstation</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Enter</kbd>
              <span>= Calculate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Esc</kbd>
              <span>= Clear</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Ctrl+H</kbd>
              <span>= Tape</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
