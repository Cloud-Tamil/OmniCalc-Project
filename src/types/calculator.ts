export type CalculatorMode = 
  | 'scientific' 
  | 'converter' 
  | 'finance' 
  | 'programmer' 
  | 'statistics' 
  | 'graphing';

export type AngleUnit = 'deg' | 'rad';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  mode: CalculatorMode;
}

export type UnitCategory = 
  | 'length' 
  | 'mass' 
  | 'temperature' 
  | 'digital' 
  | 'area' 
  | 'speed' 
  | 'time' 
  | 'currency';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  factor: number; // Ratio to base unit
  offset?: number; // For temperature
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffMonths?: number;
  schedule: Array<{
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export interface StatResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
}

export type ProgrammerBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';
export type WordSize = 64 | 32 | 16 | 8;
export type SignedMode = 'unsigned' | 'signed';
