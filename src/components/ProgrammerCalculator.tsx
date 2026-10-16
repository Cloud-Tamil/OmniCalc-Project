import React, { useState } from 'react';
import { soundManager } from '../utils/audio.ts';
import { ProgrammerBase, WordSize, SignedMode } from '../types/calculator.ts';
import { Binary, Copy, Check, RotateCcw } from 'lucide-react';

export const ProgrammerCalculator: React.FC = () => {
  const [value, setValue] = useState<bigint>(42n);
  const [activeBase, setActiveBase] = useState<ProgrammerBase>('DEC');
  const [wordSize, setWordSize] = useState<WordSize>(32);
  const [signedMode, setSignedMode] = useState<SignedMode>('unsigned');
  const [operator, setOperator] = useState<string | null>(null);
  const [storedValue, setStoredValue] = useState<bigint | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const getMask = (bits: WordSize): bigint => {
    return (1n << BigInt(bits)) - 1n;
  };

  const maskedValue = value & getMask(wordSize);

  // Two's complement signed calculation
  const getSignedDec = (val: bigint, bits: WordSize): string => {
    const signBit = 1n << BigInt(bits - 1);
    if ((val & signBit) !== 0n) {
      // Negative
      const signedVal = val - (1n << BigInt(bits));
      return signedVal.toString(10);
    }
    return val.toString(10);
  };

  // String representations
  const hexString = maskedValue.toString(16).toUpperCase();
  const decString = signedMode === 'signed' ? getSignedDec(maskedValue, wordSize) : maskedValue.toString(10);
  const octString = maskedValue.toString(8);
  const binString = maskedValue.toString(2).padStart(wordSize, '0');

  // Formatted binary display with 4-bit nibbles
  const formattedBin = binString.replace(/(.{4})/g, '$1 ').trim();

  const handleInputDigit = (digit: string) => {
    soundManager.playClick('number');
    try {
      let currentStr = '';
      if (activeBase === 'HEX') currentStr = hexString;
      else if (activeBase === 'DEC') currentStr = maskedValue.toString(10);
      else if (activeBase === 'OCT') currentStr = octString;
      else currentStr = binString.replace(/^0+/, '') || '0';

      if (currentStr === '0') currentStr = '';
      const newStr = currentStr + digit;

      let baseRadix = 10;
      if (activeBase === 'HEX') baseRadix = 16;
      else if (activeBase === 'OCT') baseRadix = 8;
      else if (activeBase === 'BIN') baseRadix = 2;

      let newVal = 0n;
      const lower = newStr.toLowerCase();
      for (let i = 0; i < lower.length; i++) {
        const char = lower[i];
        let val = 0;
        if (char >= '0' && char <= '9') val = char.charCodeAt(0) - 48;
        else if (char >= 'a' && char <= 'f') val = char.charCodeAt(0) - 97 + 10;
        newVal = newVal * BigInt(baseRadix) + BigInt(val);
      }

      setValue(newVal & getMask(wordSize));
    } catch {
      // Ignore invalid character entry
    }
  };

  const handleToggleBit = (index: number) => {
    soundManager.playClick('action');
    const bitPos = BigInt(index);
    const flipped = maskedValue ^ (1n << bitPos);
    setValue(flipped & getMask(wordSize));
  };

  const handleBitwiseOp = (op: string) => {
    soundManager.playClick('operator');
    const mask = getMask(wordSize);

    if (op === 'NOT') {
      setValue((~maskedValue) & mask);
      return;
    }
    if (op === '<<') {
      setValue((maskedValue << 1n) & mask);
      return;
    }
    if (op === '>>') {
      setValue((maskedValue >> 1n) & mask);
      return;
    }
    if (op === 'ROL') {
      // Rotate left
      const msb = (maskedValue >> BigInt(wordSize - 1)) & 1n;
      setValue(((maskedValue << 1n) | msb) & mask);
      return;
    }
    if (op === 'ROR') {
      // Rotate right
      const lsb = maskedValue & 1n;
      setValue(((maskedValue >> 1n) | (lsb << BigInt(wordSize - 1))) & mask);
      return;
    }

    setOperator(op);
    setStoredValue(maskedValue);
    setValue(0n);
  };

  const handleExecute = () => {
    if (!operator || storedValue === null) return;
    soundManager.playClick('action');

    let result = 0n;
    switch (operator) {
      case 'AND':
        result = storedValue & maskedValue;
        break;
      case 'OR':
        result = storedValue | maskedValue;
        break;
      case 'XOR':
        result = storedValue ^ maskedValue;
        break;
      case 'NAND':
        result = ~(storedValue & maskedValue);
        break;
      case 'NOR':
        result = ~(storedValue | maskedValue);
        break;
      case 'XNOR':
        result = ~(storedValue ^ maskedValue);
        break;
    }

    setValue(result & getMask(wordSize));
    setOperator(null);
    setStoredValue(null);
  };

  const handleClear = () => {
    soundManager.playClick('clear');
    setValue(0n);
    setOperator(null);
    setStoredValue(null);
  };

  const handleCopy = (text: string, base: string) => {
    navigator.clipboard.writeText(text);
    setCopied(base);
    setTimeout(() => setCopied(null), 2000);
  };

  // Valid keys per active base
  const isKeyValid = (key: string): boolean => {
    if (activeBase === 'BIN') return key === '0' || key === '1';
    if (activeBase === 'OCT') return key >= '0' && key <= '7';
    if (activeBase === 'DEC') return key >= '0' && key <= '9';
    return (key >= '0' && key <= '9') || (key >= 'A' && key <= 'F');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 4-Base Interactive Display */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3 font-mono">
        {/* Word Size & Signedness Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <Binary className="w-4 h-4 text-emerald-400" />
            <span className="font-sans font-bold text-slate-300">Programmer Multi-Base</span>
            {operator && (
              <span className="ml-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
                {storedValue?.toString(16).toUpperCase()} {operator} ...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Signed / Unsigned Toggle */}
            <button
              onClick={() => {
                soundManager.playClick('action');
                setSignedMode(signedMode === 'unsigned' ? 'signed' : 'unsigned');
              }}
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              {signedMode === 'signed' ? 'Signed (2s Comp)' : 'Unsigned'}
            </button>

            {/* Word size buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {([64, 32, 16, 8] as const).map((bits) => (
                <button
                  key={bits}
                  onClick={() => {
                    soundManager.playClick('action');
                    setWordSize(bits);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    wordSize === bits
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {bits}b
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Radix Rows */}
        <div className="space-y-2">
          {[
            { id: 'HEX', label: 'HEX', val: hexString, prefix: '0x' },
            { id: 'DEC', label: 'DEC', val: decString, prefix: '' },
            { id: 'OCT', label: 'OCT', val: octString, prefix: '0o' },
            { id: 'BIN', label: 'BIN', val: formattedBin, prefix: '' },
          ].map((row) => {
            const isSelected = activeBase === row.id;
            return (
              <div
                key={row.id}
                onClick={() => {
                  soundManager.playClick('action');
                  setActiveBase(row.id as ProgrammerBase);
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-950 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`text-xs font-bold w-9 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold tracking-wider tabular-nums truncate">
                    {row.prefix}{row.val}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(row.val, row.id);
                  }}
                  className="p-1 rounded text-slate-500 hover:text-slate-300 shrink-0"
                  title={`Copy ${row.label}`}
                >
                  {copied === row.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Binary Bit Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
          <span>Interactive Bit Flipper ({wordSize}-bit)</span>
          <span className="text-[11px] text-slate-500">Toggle individual bits to inspect values</span>
        </div>

        {/* Binary Bits Visual Grid */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 py-1">
          {Array.from({ length: wordSize }).map((_, i) => {
            const bitIndex = wordSize - 1 - i;
            const isSet = (maskedValue & (1n << BigInt(bitIndex))) !== 0n;

            return (
              <button
                key={bitIndex}
                onClick={() => handleToggleBit(bitIndex)}
                className={`py-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer active:scale-90 border ${
                  isSet
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10 font-bold'
                    : 'bg-slate-950 text-slate-500 border-slate-800/80 hover:text-slate-300'
                }`}
              >
                <span className="text-xs">{isSet ? '1' : '0'}</span>
                <span className="text-[9px] text-slate-500 tabular-nums">{bitIndex}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Programmer Keypad */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        {/* Bitwise operations bar */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {['AND', 'OR', 'XOR', 'XNOR', 'NOT', 'NAND', 'NOR', '<<', '>>', 'ROL'].map((op) => (
            <button
              key={op}
              onClick={() => handleBitwiseOp(op)}
              className="py-2 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer active:scale-95"
            >
              {op}
            </button>
          ))}
        </div>

        {/* Digits & Hex Keys */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {['A', 'B', 'C', 'D', 'E', 'F', '7', '8', '9', '4', '5', '6', '1', '2', '3', '0'].map((digit) => {
            const valid = isKeyValid(digit);
            return (
              <button
                key={digit}
                disabled={!valid}
                onClick={() => handleInputDigit(digit)}
                className={`py-2.5 rounded-xl font-mono text-sm font-semibold transition-all border ${
                  valid
                    ? 'bg-slate-950 text-white hover:bg-slate-800 border-slate-800 cursor-pointer active:scale-95'
                    : 'bg-slate-950/20 text-slate-700 border-slate-900 cursor-not-allowed opacity-40'
                }`}
              >
                {digit}
              </button>
            );
          })}

          <button
            onClick={handleClear}
            className="py-2.5 rounded-xl font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer active:scale-95"
          >
            Clear
          </button>

          <button
            onClick={handleExecute}
            className="py-2.5 rounded-xl font-mono text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-500/20"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
