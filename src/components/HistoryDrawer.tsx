import React, { useState } from 'react';
import { HistoryItem, CalculatorMode } from '../types/calculator.ts';
import { soundManager } from '../utils/audio.ts';
import { X, Trash2, Download, History, ArrowUpRight, Copy, Check } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = filterMode === 'all' 
    ? history 
    : history.filter((h) => h.mode === filterMode);

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Timestamp,Mode,Expression,Result\n' +
      history
        .map((h) => `"${h.timestamp}","${h.mode}","${h.expression}","${h.result}"`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calculation-tape-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyResult = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Calculation Tape</h3>
            <span className="font-mono text-xs text-slate-500">({history.length})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-950/30">
          {['all', 'scientific', 'programmer', 'finance'].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === m
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* History Tape Entries */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-3 space-y-1.5">
          {filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
              <History className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
              <p className="text-xs font-medium">No calculations in tape</p>
              <span className="text-[11px] text-slate-600 mt-0.5">Executed calculations are automatically logged here</span>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  soundManager.playClick('action');
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="group p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-slate-700 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="uppercase text-emerald-400/80 font-semibold">{item.mode}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="text-xs font-mono text-slate-400 truncate">
                  {item.expression}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
                    = {item.result}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCopyResult(e, item.id, item.result)}
                      title="Copy result"
                      className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="opacity-0 group-hover:opacity-100 text-[11px] text-emerald-400 flex items-center gap-0.5 transition-opacity">
                      <span>Recall</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        {history.length > 0 && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick('clear');
                onClearHistory();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Tape</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
