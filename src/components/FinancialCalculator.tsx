import React, { useState, useEffect } from 'react';
import { LoanResult } from '../types/calculator.ts';
import { soundManager } from '../utils/audio.ts';
import { DollarSign, Download, Sparkles, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

export const FinancialCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [years, setYears] = useState<number>(30);
  const [extraMonthly, setExtraMonthly] = useState<number>(0);
  const [loanData, setLoanData] = useState<LoanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculateLoan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calc/amortization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal,
          annualRate: interestRate,
          years,
          extraMonthly,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.ok) {
          setLoanData(json.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateLoan();
  }, [principal, interestRate, years, extraMonthly]);

  const handleExportCsv = () => {
    if (!loanData || !loanData.schedule) return;
    soundManager.playClick('action');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Month,Principal Paid,Interest Paid,Remaining Balance\n' +
      loanData.schedule
        .map((s) => `${s.month},${s.principal},${s.interest},${s.balance}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amortization-schedule-${principal}-${years}yr.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setLoanPreset = (p: number, r: number, y: number) => {
    soundManager.playClick('action');
    setPrincipal(p);
    setInterestRate(r);
    setYears(y);
  };

  const principalRatio =
    loanData && loanData.totalPayment > 0
      ? Math.round((principal / loanData.totalPayment) * 100)
      : 50;
  const interestRatio = 100 - principalRatio;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Preset Loan Templates */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
        <button
          onClick={() => setLoanPreset(350000, 6.75, 30)}
          className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
        >
          30-Yr Mortgage
        </button>
        <button
          onClick={() => setLoanPreset(250000, 5.85, 15)}
          className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
        >
          15-Yr Mortgage
        </button>
        <button
          onClick={() => setLoanPreset(35000, 4.9, 5)}
          className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
        >
          5-Yr Auto Loan
        </button>
        <button
          onClick={() => setLoanPreset(10000, 9.5, 3)}
          className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
        >
          3-Yr Personal
        </button>
      </div>

      {/* Input Controls & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Loan Parameters Card */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Loan & Mortgage Parameters</span>
          </h3>

          {/* Principal */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Loan Amount ($)</span>
              <span className="font-mono text-white font-semibold">${principal.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="10000"
              max="1500000"
              step="5000"
              value={principal}
              onChange={(e) => {
                soundManager.playClick('number');
                setPrincipal(Number(e.target.value));
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-700"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Annual Interest Rate (%)</span>
              <span className="font-mono text-white font-semibold">{interestRate}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => {
                soundManager.playClick('number');
                setInterestRate(Number(e.target.value));
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Term (Years) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">Loan Term</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    soundManager.playClick('action');
                    setYears(y);
                  }}
                  className={`py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    years === y
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {y} Years
                </button>
              ))}
            </div>
          </div>

          {/* Extra Monthly Payment */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-medium text-indigo-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extra Monthly Payment ($)</span>
              </span>
              <span className="font-mono text-indigo-300 font-semibold">+${extraMonthly}/mo</span>
            </label>
            <input
              type="number"
              min="0"
              max="5000"
              step="50"
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Calculation Results & Breakdown */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Breakdown</span>
              {extraMonthly > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>Early Payoff Active</span>
                </span>
              )}
            </div>

            {/* Monthly Payment Hero Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 block">Estimated Monthly Payment</span>
                <span className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 tracking-tight tabular-nums block mt-1">
                  ${loanData ? (loanData.monthlyPayment + extraMonthly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              <div className="text-right text-xs font-mono text-slate-500 space-y-0.5">
                <div>Base: ${loanData?.monthlyPayment.toLocaleString()}</div>
                {extraMonthly > 0 && <div className="text-indigo-400">Extra: +${extraMonthly.toLocaleString()}</div>}
              </div>
            </div>

            {/* KPI 3-col Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Total Principal</span>
                <span className="text-sm font-mono font-bold text-white mt-1 block">
                  ${principal.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-rose-400/80 block">Total Interest</span>
                <span className="text-sm font-mono font-bold text-rose-400 mt-1 block">
                  ${loanData ? loanData.totalInterest.toLocaleString() : '0'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 block">Total Loan Cost</span>
                <span className="text-sm font-mono font-bold text-white mt-1 block">
                  ${loanData ? loanData.totalPayment.toLocaleString() : '0'}
                </span>
              </div>
            </div>

            {/* Principal vs Interest Proportion Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-medium">Principal {principalRatio}%</span>
                <span className="text-rose-400 font-medium">Interest {interestRatio}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${principalRatio}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${interestRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Preview Table */}
      {loanData && loanData.schedule.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Amortization Schedule Milestones</span>
            </h4>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-slate-500 border-b border-slate-800 bg-slate-950/80 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Principal Paid</th>
                  <th className="py-2.5 px-3">Interest Paid</th>
                  <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loanData.schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-slate-400 font-medium">Month {row.month}</td>
                    <td className="py-2 px-3 text-emerald-400 font-medium">${row.principal.toLocaleString()}</td>
                    <td className="py-2 px-3 text-rose-400">${row.interest.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-white">${row.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
