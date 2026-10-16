import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/audio.ts';
import { LineChart, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

const PRESETS = [
  { name: 'Sine Wave', formula: 'Math.sin(x) * 2' },
  { name: 'Cosine Wave', formula: 'Math.cos(x) * 2' },
  { name: 'Parabola', formula: 'Math.pow(x, 2) - 4' },
  { name: 'Cubic Function', formula: '0.2 * Math.pow(x, 3) - 2 * x' },
  { name: 'Damped Sinc Wave', formula: 'Math.sin(3 * x) / (Math.abs(x) + 0.5)' },
  { name: 'Gaussian Bell', formula: '3 * Math.exp(-Math.pow(x, 2) / 2)' },
  { name: 'Tangent', formula: 'Math.tan(x)' },
];

export const GraphingCalculator: React.FC = () => {
  const [formula, setFormula] = useState<string>(PRESETS[0].formula);
  const [scale, setScale] = useState<number>(40); // Pixels per unit
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '10px JetBrains Mono, monospace';

    // Vertical grid lines
    const startX = Math.floor(-centerX / scale);
    const endX = Math.ceil((width - centerX) / scale);

    for (let x = startX; x <= endX; x++) {
      const px = centerX + x * scale;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      if (x !== 0 && px > 20 && px < width - 20) {
        ctx.fillText(x.toString(), px + 3, Math.min(Math.max(centerY - 4, 15), height - 8));
      }
    }

    // Horizontal grid lines
    const startY = Math.floor(-centerY / scale);
    const endY = Math.ceil((height - centerY) / scale);

    for (let y = startY; y <= endY; y++) {
      const py = centerY - y * scale;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      if (y !== 0 && py > 15 && py < height - 15) {
        ctx.fillText(y.toString(), Math.min(Math.max(centerX + 4, 8), width - 30), py - 4);
      }
    }

    // Main Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569'; // slate-600

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Plot Function Curve
    let compiledFn: ((x: number) => number) | null = null;
    try {
      let expr = formula
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\bsqrt\b/g, 'Math.sqrt');

      // Double prefix protection (e.g. Math.Math.sin)
      expr = expr.replace(/Math\.Math\./g, 'Math.');

      compiledFn = new Function('x', `"use strict"; return (${expr});`) as (x: number) => number;
    } catch {
      return;
    }

    if (!compiledFn) return;

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#34d399'; // emerald-400
    ctx.beginPath();

    let isDrawing = false;
    for (let px = 0; px <= width; px += 1.5) {
      const x = (px - centerX) / scale;
      try {
        const y = compiledFn(x);
        if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
          const py = centerY - y * scale;
          // Clamp jump discontinuities (e.g. tan(x))
          if (py < -height || py > height * 2) {
            isDrawing = false;
          } else {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          }
        } else {
          isDrawing = false;
        }
      } catch {
        isDrawing = false;
      }
    }
    ctx.stroke();

    // Crosshair hover dot & coordinate line
    if (hoverCoord && compiledFn) {
      try {
        const hY = compiledFn(hoverCoord.x);
        if (!isNaN(hY) && isFinite(hY)) {
          const ptX = centerX + hoverCoord.x * scale;
          const ptY = centerY - hY * scale;

          // Crosshair lines
          ctx.strokeStyle = '#a78bfa40'; // violet-400 with opacity
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ptX, 0);
          ctx.lineTo(ptX, height);
          ctx.moveTo(0, ptY);
          ctx.lineTo(width, ptY);
          ctx.stroke();

          // Highlight dot
          ctx.fillStyle = '#a78bfa'; // violet-400
          ctx.beginPath();
          ctx.arc(ptX, ptY, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } catch {}
    }
  }, [formula, scale, offsetX, offsetY, hoverCoord]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffsetX(e.clientX - dragStartRef.current.x);
      setOffsetY(e.clientY - dragStartRef.current.y);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const centerX = canvas.width / 2 + offsetX;
    const mathX = parseFloat(((px - centerX) / scale).toFixed(3));

    let mathY = 0;
    try {
      let expr = formula
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/Math\.Math\./g, 'Math.');
      const fn = new Function('x', `"use strict"; return (${expr});`);
      mathY = parseFloat(Number(fn(mathX)).toFixed(3));
    } catch {}

    setHoverCoord({ x: mathX, y: mathY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((s) => Math.min(s * 1.15, 250));
    } else {
      setScale((s) => Math.max(s / 1.15, 8));
    }
  };

  const handleReset = () => {
    soundManager.playClick('action');
    setScale(40);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Function Input Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 focus-within:border-emerald-500/50">
            <span className="font-mono text-sm font-bold text-emerald-400 mr-2 select-none">f(x) =</span>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="Math.sin(x) * 2"
              className="w-full bg-transparent text-sm font-mono text-white focus:outline-none py-2"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => {
                soundManager.playClick('action');
                setScale((s) => Math.min(s * 1.25, 250));
              }}
              title="Zoom In"
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundManager.playClick('action');
                setScale((s) => Math.max(s / 1.25, 8));
              }}
              title="Zoom Out"
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Function Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 shrink-0 font-medium">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                soundManager.playClick('action');
                setFormula(p.formula);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2D Canvas Viewport */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoverCoord(null);
          }}
          onWheel={handleWheel}
          className={`w-full h-auto block ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        />

        {/* Interactive Controls Overlay Hint */}
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
          Click & Drag to pan · Scroll to zoom
        </div>

        {/* Hover Coordinate HUD Badge */}
        {hoverCoord && !isNaN(hoverCoord.y) && (
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300 shadow-lg backdrop-blur-sm pointer-events-none flex items-center gap-2">
            <span>x: <span className="text-white font-bold">{hoverCoord.x}</span></span>
            <span className="text-slate-600">|</span>
            <span>y: <span className="text-white font-bold">{hoverCoord.y}</span></span>
          </div>
        )}
      </div>
    </div>
  );
};
