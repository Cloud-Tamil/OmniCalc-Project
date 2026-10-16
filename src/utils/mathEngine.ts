import { AngleUnit } from '../types/calculator.ts';

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS Number max
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function formatResult(num: number): string {
  if (Number.isNaN(num)) return 'Error';
  if (!Number.isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Check if zero
  if (num === 0) return '0';

  // Check if small or very large (use scientific notation)
  const abs = Math.abs(num);
  if (abs >= 1e12 || abs < 1e-9) {
    const expStr = num.toExponential(8);
    return expStr.replace(/\.?0+e/, 'e');
  }

  // Round to avoid float precision bugs (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const rounded = parseFloat(num.toPrecision(12));
  const parts = rounded.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Counts open vs closed parentheses in an expression
 */
export function getParenthesesBalance(expr: string): { open: number; closed: number; diff: number } {
  let open = 0;
  let closed = 0;
  for (const ch of expr) {
    if (ch === '(') open++;
    else if (ch === ')') closed++;
  }
  return { open, closed, diff: Math.max(0, open - closed) };
}

/**
 * Safely evaluates mathematical expression with functions, constants, and angle units
 */
export function evaluateMathExpression(
  expr: string,
  angleUnit: AngleUnit = 'deg'
): { result: number; error?: string } {
  try {
    if (!expr || !expr.trim()) return { result: 0 };

    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    // Auto-balance pending open parentheses
    const { diff } = getParenthesesBalance(sanitized);
    if (diff > 0) {
      sanitized += ')'.repeat(diff);
    }

    // Replace named constants before implicit multiplication
    sanitized = sanitized
      .replace(/φ/g, '(1.618033988749895)')
      .replace(/π/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E');

    // Implicit multiplication handling
    // 1) Number directly preceding a parenthesis: 2(3+4) -> 2*(3+4)
    sanitized = sanitized.replace(/(\d+(\.\d+)?)\s*\(/g, '$1*(');
    // 2) Closing parenthesis directly preceding an opening parenthesis: (2)(3) -> (2)*(3)
    sanitized = sanitized.replace(/\)\s*\(/g, ')*(');
    // 3) Closing parenthesis directly preceding a number: (2)3 -> (2)*3
    sanitized = sanitized.replace(/\)\s*(\d+(\.\d+)?)/g, ')*$1');
    // 4) Number directly preceding function or Math: 5sin(30) -> 5*sin(30)
    sanitized = sanitized.replace(/(\d+(\.\d+)?)\s*(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|ln|log|log10|log2|sqrt|cbrt|abs|Math)/g, '$1*$2');

    // Degree vs Radian conversions
    const toRad = angleUnit === 'deg' ? `*(Math.PI/180)` : '';
    const fromRad = angleUnit === 'deg' ? `*(180/Math.PI)` : '';

    // Percentage: (e.g. 50% -> (50/100))
    sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Factorials: (e.g. 5! -> factorial(5))
    sanitized = sanitized.replace(/(\d+)!/g, 'factorial($1)');

    // Power syntax: (e.g. 2^3 -> Math.pow(2,3))
    sanitized = sanitized.replace(/(\w+|\([^)]+\))\^(\w+|\([^)]+\))/g, 'Math.pow($1,$2)');

    // Square root & Cube root
    sanitized = sanitized.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
    sanitized = sanitized.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
    sanitized = sanitized.replace(/∛\(([^)]+)\)/g, 'Math.cbrt($1)');
    sanitized = sanitized.replace(/∛(\d+(\.\d+)?)/g, 'Math.cbrt($1)');

    // Logarithms
    sanitized = sanitized.replace(/log10\(/g, 'Math.log10(');
    sanitized = sanitized.replace(/ln\(/g, 'Math.log(');
    sanitized = sanitized.replace(/log2\(/g, 'Math.log2(');

    // Hyperbolic trig
    sanitized = sanitized.replace(/sinh\(([^)]+)\)/g, 'Math.sinh($1)');
    sanitized = sanitized.replace(/cosh\(([^)]+)\)/g, 'Math.cosh($1)');
    sanitized = sanitized.replace(/tanh\(([^)]+)\)/g, 'Math.tanh($1)');

    // Inverse trig
    sanitized = sanitized.replace(/asin\(([^)]+)\)/g, `(Math.asin($1)${fromRad})`);
    sanitized = sanitized.replace(/acos\(([^)]+)\)/g, `(Math.acos($1)${fromRad})`);
    sanitized = sanitized.replace(/atan\(([^)]+)\)/g, `(Math.atan($1)${fromRad})`);

    // Standard trig
    sanitized = sanitized.replace(/sin\(([^)]+)\)/g, `Math.sin(($1)${toRad})`);
    sanitized = sanitized.replace(/cos\(([^)]+)\)/g, `Math.cos(($1)${toRad})`);
    sanitized = sanitized.replace(/tan\(([^)]+)\)/g, `Math.tan(($1)${toRad})`);

    // Absolute
    sanitized = sanitized.replace(/abs\(([^)]+)\)/g, 'Math.abs($1)');

    // Clean multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Run safe math execution context without eval
    const fn = new Function(
      'Math',
      'factorial',
      `"use strict"; return (${sanitized});`
    );

    const val = fn(Math, factorial);
    if (typeof val !== 'number') {
      return { result: NaN, error: 'Invalid expression' };
    }

    return { result: val };
  } catch (err: any) {
    return { result: NaN, error: err.message || 'Syntax error' };
  }
}
