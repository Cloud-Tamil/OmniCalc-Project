import React, { useState, useEffect, useCallback } from 'react';
import { AngleUnit, HistoryItem } from '../types/calculator.ts';
import { evaluateMathExpression, formatResult, getParenthesesBalance } from '../utils/mathEngine.ts';
import { SCIENTIFIC_CONSTANTS, ScientificConstant } from '../utils/constants.ts';
import { soundManager } from '../utils/audio.ts';
import { Delete, Copy, Check, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface ScientificCalculatorProps {
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  externalExpression?: string;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  onAddHistory,
  externalExpression,
}) => {
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [memory, setMemory] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConstants, setShowConstants] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Sync external expression if recalled from history
  useEffect(() => {
    if (externalExpression) {
      setExpression(externalExpression);
      const evalRes = evaluateMathExpression(externalExpression, angleUnit);
      if (!evalRes.error && !isNaN(evalRes.result)) {
        setDisplayValue(formatResult(evalRes.result));
      }
      setIsCalculated(false);
    }
  }, [externalExpression, angleUnit]);

  // Parentheses balance
  const parenBalance = getParenthesesBalance(expression);

  const handleInput = useCallback(
    (val: string) => {
      soundManager.playClick('number');

      if (isCalculated) {
        // If user enters operator, continue with previous result
        if (['+', '−', '×', '÷', '%', '^'].includes(val.trim())) {
          setExpression(displayValue.replace(/,/g, '') + ' ' + val.trim() + ' ');
          setIsCalculated(false);
          return;
        } else {
          // New calculation
          setExpression(val);
          setDisplayValue(val);
          setIsCalculated(false);
          return;
        }
      }

      setExpression((prev) => {
        if (prev === '0' && val !== '.') return val;
        return prev + val;
      });
    },
    [isCalculated, displayValue]
  );

  const handleFunction = useCallback(
    (fnName: string) => {
      soundManager.playClick('operator');
      setIsCalculated(false);

      if (fnName === 'sqrt') {
        setExpression((prev) => prev + '√(');
      } else if (fnName === 'cbrt') {
        setExpression((prev) => prev + '∛(');
      } else if (fnName === 'square') {
        setExpression((prev) => (prev ? `(${prev})^2` : '0^2'));
      } else if (fnName === 'cube') {
        setExpression((prev) => (prev ? `(${prev})^3` : '0^3'));
      } else if (fnName === 'pow') {
        setExpression((prev) => prev + '^');
      } else if (fnName === 'reciprocal') {
        setExpression((prev) => (prev ? `1/(${prev})` : '1/'));
      } else if (fnName === 'fact') {
        setExpression((prev) => prev + '!');
      } else if (fnName === 'abs') {
        setExpression((prev) => prev + 'abs(');
      } else if (fnName === 'rand') {
        const r = parseFloat(Math.random().toFixed(4));
        setExpression((prev) => prev + r.toString());
      } else {
        // sin, cos, tan, ln, log10, log2, asin, acos, atan, sinh, cosh, tanh
        setExpression((prev) => prev + `${fnName}(`);
      }
    },
    []
  );

  const handleInsertConstant = (c: ScientificConstant) => {
    soundManager.playClick('action');
    handleInput(c.symbol);
    setShowConstants(false);
  };

  const handleClear = useCallback(() => {
    soundManager.playClick('clear');
    setExpression('');
    setDisplayValue('0');
    setIsCalculated(false);
  }, []);

  const handleBackspace = useCallback(() => {
    soundManager.playClick('action');
    if (isCalculated) {
      handleClear();
      return;
    }
    setExpression((prev) => {
      if (prev.length <= 1) {
        setDisplayValue('0');
        return '';
      }
      return prev.slice(0, -1);
    });
  }, [isCalculated, handleClear]);

  const handleToggleSign = useCallback(() => {
    soundManager.playClick('action');
    if (!expression) return;
    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else {
      setExpression(`-(${expression})`);
    }
  }, [expression]);

  const handleEvaluate = useCallback(() => {
    if (!expression.trim()) return;
    soundManager.playClick('action');

    const evalRes = evaluateMathExpression(expression, angleUnit);
    if (evalRes.error || isNaN(evalRes.result)) {
      setDisplayValue('Error');
    } else {
      const formatted = formatResult(evalRes.result);
      setDisplayValue(formatted);
      setIsCalculated(true);
      onAddHistory({
        expression,
        result: formatted,
        mode: 'scientific',
      });
    }
  }, [expression, angleUnit, onAddHistory]);

  // Memory functions
  const handleMemory = useCallback(
    (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
      soundManager.playClick('action');
      const currentNum = parseFloat(displayValue.replace(/,/g, '')) || 0;

      switch (action) {
        case 'MC':
          setMemory(0);
          break;
        case 'MR':
          setExpression((prev) => prev + memory.toString());
          break;
        case 'M+':
          setMemory((prev) => prev + currentNum);
          break;
        case 'M-':
          setMemory((prev) => prev - currentNum);
          break;
        case 'MS':
          setMemory(currentNum);
          break;
      }
    },
    [displayValue, memory]
  );

  // Keyboard binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        handleInput(e.key);
      } else if (e.key === '+') {
        handleInput(' + ');
      } else if (e.key === '-') {
        handleInput(' − ');
      } else if (e.key === '*') {
        handleInput(' × ');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput(' ÷ ');
      } else if (e.key === '%') {
        handleInput('%');
      } else if (e.key === '(' || e.key === ')') {
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleEvaluate, handleBackspace, handleClear]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue.replace(/,/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Precision Display Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[145px]">
        {/* Top telemetry & status bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {/* Degree / Radian toggle */}
            <button
              onClick={() => {
                soundManager.playClick('action');
                setAngleUnit((prev) => (prev === 'deg' ? 'rad' : 'deg'));
              }}
              className="px-2.5 py-0.5 rounded font-mono font-semibold text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 uppercase transition-colors cursor-pointer"
            >
              {angleUnit}
            </button>

            {/* Parentheses Balance Indicator */}
            {parenBalance.diff > 0 && (
              <span
                onClick={() => handleInput(')'.repeat(parenBalance.diff))}
                title="Click to close all open parentheses"
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 cursor-pointer hover:bg-amber-500/20"
              >
                Open: {parenBalance.diff} (click to close)
              </span>
            )}

            {/* Memory Active Indicator */}
            {memory !== 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MEM: {memory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConstants(!showConstants)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                showConstants
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/60'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Constants</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy result"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expression Tape Line */}
        <div className="text-right text-sm sm:text-base text-slate-400 font-mono tracking-wide overflow-x-auto whitespace-nowrap py-1">
          {expression || '0'}
        </div>

        {/* Main Result Large Display */}
        <div className="text-right text-3xl sm:text-5xl font-mono font-bold text-white tracking-tight tabular-nums select-all truncate">
          {displayValue}
        </div>
      </div>

      {/* Constants Quick Drawer (collapsible) */}
      {showConstants && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span className="font-semibold text-slate-300">Scientific & Physical Constants</span>
            <span className="text-[11px] text-slate-500">Click any constant to insert into calculation</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SCIENTIFIC_CONSTANTS.map((c) => (
              <button
                key={c.symbol}
                onClick={() => handleInsertConstant(c)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-emerald-400 group-hover:text-emerald-300">
                    {c.symbol}
                  </span>
                  <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">{c.category}</span>
                </div>
                <div className="text-xs text-slate-200 font-medium truncate mt-1">{c.name}</div>
                <div className="text-[10px] font-mono text-slate-500 truncate">{c.value} {c.unit}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calculator Body */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        {/* Memory Toolbar */}
        <div className="grid grid-cols-5 gap-2 pb-1">
          {(['MC', 'MR', 'M+', 'M-', 'MS'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleMemory(m)}
              className="py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-400 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 transition-colors cursor-pointer active:scale-95"
            >
              {m}
            </button>
          ))}
        </div>

        {/* Scientific Functions Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {[
            { label: 'sin', action: () => handleFunction('sin') },
            { label: 'cos', action: () => handleFunction('cos') },
            { label: 'tan', action: () => handleFunction('tan') },
            { label: 'ln', action: () => handleFunction('ln') },
            { label: 'log₁₀', action: () => handleFunction('log10') },
            { label: 'log₂', action: () => handleFunction('log2') },

            { label: 'asin', action: () => handleFunction('asin') },
            { label: 'acos', action: () => handleFunction('acos') },
            { label: 'atan', action: () => handleFunction('atan') },
            { label: '√x', action: () => handleFunction('sqrt') },
            { label: '∛x', action: () => handleFunction('cbrt') },
            { label: 'xʸ', action: () => handleFunction('pow') },

            { label: 'x²', action: () => handleFunction('square') },
            { label: 'x³', action: () => handleFunction('cube') },
            { label: '1/x', action: () => handleFunction('reciprocal') },
            { label: 'n!', action: () => handleFunction('fact') },
            { label: 'π', action: () => handleInput('π') },
            { label: 'e', action: () => handleInput('e') },
          ].map((fn, idx) => (
            <button
              key={idx}
              onClick={fn.action}
              className="py-2 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800/80 transition-all cursor-pointer active:scale-95"
            >
              {fn.label}
            </button>
          ))}
        </div>

        {/* Advanced Hyperbolic Toggle */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            <span>Hyperbolic & Extras</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <button
              onClick={() => handleInput('(')}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:text-white"
            >
              (
            </button>
            <button
              onClick={() => handleInput(')')}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:text-white"
            >
              )
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1 animate-in fade-in">
            <button
              onClick={() => handleFunction('sinh')}
              className="py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800"
            >
              sinh
            </button>
            <button
              onClick={() => handleFunction('cosh')}
              className="py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800"
            >
              cosh
            </button>
            <button
              onClick={() => handleFunction('tanh')}
              className="py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800"
            >
              tanh
            </button>
            <button
              onClick={() => handleFunction('abs')}
              className="py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800"
            >
              |x|
            </button>
            <button
              onClick={() => handleFunction('rand')}
              className="py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800"
            >
              rand
            </button>
            <button
              onClick={() => handleInput('φ')}
              className="py-1.5 rounded-lg text-xs font-mono text-emerald-400 bg-slate-950 hover:bg-slate-800 border border-slate-800"
            >
              φ (phi)
            </button>
          </div>
        )}

        {/* Primary Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="py-3 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer active:scale-95"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 rounded-xl text-sm font-semibold text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer flex items-center justify-center active:scale-95"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleInput('%')}
            className="py-3 rounded-xl text-sm font-mono font-semibold text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            %
          </button>
          <button
            onClick={() => handleInput(' ÷ ')}
            className="py-3 rounded-xl text-base font-mono font-bold text-emerald-400 bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleInput('7')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            7
          </button>
          <button
            onClick={() => handleInput('8')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            8
          </button>
          <button
            onClick={() => handleInput('9')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            9
          </button>
          <button
            onClick={() => handleInput(' × ')}
            className="py-3 rounded-xl text-base font-mono font-bold text-emerald-400 bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleInput('4')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            4
          </button>
          <button
            onClick={() => handleInput('5')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            5
          </button>
          <button
            onClick={() => handleInput('6')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            6
          </button>
          <button
            onClick={() => handleInput(' − ')}
            className="py-3 rounded-xl text-base font-mono font-bold text-emerald-400 bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleInput('1')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            1
          </button>
          <button
            onClick={() => handleInput('2')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            2
          </button>
          <button
            onClick={() => handleInput('3')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            3
          </button>
          <button
            onClick={() => handleInput(' + ')}
            className="py-3 rounded-xl text-base font-mono font-bold text-emerald-400 bg-slate-950 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={handleToggleSign}
            className="py-3 rounded-xl text-sm font-mono font-semibold text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            ±
          </button>
          <button
            onClick={() => handleInput('0')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => handleInput('.')}
            className="py-3 rounded-xl text-base font-mono font-semibold text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            .
          </button>
          <button
            onClick={handleEvaluate}
            className="py-3 rounded-xl text-lg font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
