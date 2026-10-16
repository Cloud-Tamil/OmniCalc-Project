import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  mode: string;
  timestamp: string;
}

let historyStore: CalculationRecord[] = [
  {
    id: 'h-1',
    expression: 'sin(45°) + √(144)',
    result: '12.7071',
    mode: 'scientific',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'h-2',
    expression: '1,250 × 1.0825',
    result: '1,353.125',
    mode: 'scientific',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'h-3',
    expression: '0xFF & 0b10101111',
    result: '175',
    mode: 'programmer',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

// Reference currency rates (relative to 1 USD)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 154.2,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.89,
  CNY: 7.24,
  INR: 83.45,
  SGD: 1.35,
  BRL: 5.15,
  MXN: 16.85,
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Safe response timing
  app.use((req, res, next) => {
    const start = performance.now();
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      if (!res.headersSent) {
        const duration = performance.now() - start;
        res.setHeader('X-Response-Time-Ms', duration.toFixed(2));
      }
      return (originalEnd as any).apply(res, args);
    };
    next();
  });

  // --- API 1: Backend Calculation History ---
  app.get('/api/calc/history', (req: Request, res: Response) => {
    res.json({ ok: true, data: historyStore });
  });

  app.post('/api/calc/history', (req: Request, res: Response) => {
    const { expression, result, mode = 'scientific' } = req.body;
    if (!expression || result === undefined) {
      return res.status(400).json({ ok: false, error: 'Expression and result are required' });
    }

    const item: CalculationRecord = {
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      expression: String(expression),
      result: String(result),
      mode,
      timestamp: new Date().toISOString(),
    };

    historyStore.unshift(item);
    if (historyStore.length > 50) historyStore = historyStore.slice(0, 50);

    res.status(201).json({ ok: true, data: item });
  });

  app.delete('/api/calc/history', (req: Request, res: Response) => {
    historyStore = [];
    res.json({ ok: true, message: 'History cleared' });
  });

  // --- API 2: Currency Exchange Rates ---
  app.get('/api/calc/exchange-rates', (req: Request, res: Response) => {
    res.json({
      ok: true,
      base: 'USD',
      rates: CURRENCY_RATES,
      updatedAt: new Date().toISOString(),
    });
  });

  // --- API 3: Loan & Mortgage Amortization Generator ---
  app.post('/api/calc/amortization', (req: Request, res: Response) => {
    const { principal, annualRate, years, extraMonthly = 0 } = req.body;

    const p = parseFloat(principal);
    const rate = parseFloat(annualRate);
    const y = parseFloat(years);
    const extra = parseFloat(extraMonthly) || 0;

    if (isNaN(p) || isNaN(rate) || isNaN(y) || p <= 0 || y <= 0) {
      return res.status(400).json({ ok: false, error: 'Invalid financial input values' });
    }

    const totalMonths = Math.round(y * 12);
    const monthlyRate = rate / 100 / 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = p / totalMonths;
    } else {
      monthlyPayment = (p * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const schedule: Array<{ month: number; principal: number; interest: number; balance: number }> = [];
    let balance = p;
    let totalInterest = 0;
    let totalPaid = 0;

    for (let m = 1; m <= totalMonths && balance > 0; m++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = (monthlyPayment - interestPayment) + extra;

      if (principalPayment > balance) {
        principalPayment = balance;
      }

      balance = Math.max(0, balance - principalPayment);
      totalInterest += interestPayment;
      totalPaid += principalPayment + interestPayment;

      // Sample first 24 months, last 12, or every 6th month to keep payload performant
      if (m <= 24 || m > totalMonths - 12 || m % 6 === 0 || balance === 0) {
        schedule.push({
          month: m,
          principal: +principalPayment.toFixed(2),
          interest: +interestPayment.toFixed(2),
          balance: +balance.toFixed(2),
        });
      }

      if (balance === 0) break;
    }

    res.json({
      ok: true,
      data: {
        monthlyPayment: +monthlyPayment.toFixed(2),
        totalPayment: +totalPaid.toFixed(2),
        totalInterest: +totalInterest.toFixed(2),
        payoffMonths: schedule[schedule.length - 1]?.month || totalMonths,
        schedule,
      },
    });
  });

  // --- Vite Dev Server Middleware or Static Production Serving ---
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexPath);
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (isProduction && hasDist) {
    console.log('Serving production static bundle from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(distIndexPath);
    });
  } else {
    console.log('Initializing Vite development middleware server...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ ok: false, error: 'API route not found' });
      }

      try {
        const rootIndex = path.resolve(__dirname, 'index.html');
        const targetPath = fs.existsSync(rootIndex) ? rootIndex : distIndexPath;
        let template = fs.readFileSync(targetPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite.ssrFixStacktrace) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Precision Calculator server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
