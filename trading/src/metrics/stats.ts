import type { EquityPoint, Trade } from '../types.js';
import type { RunResult } from '../engine/engine.js';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface PerformanceStats {
  totalReturn: number;
  cagr: number;
  annualVol: number;
  sharpe: number;
  /** Per-period Sharpe, which is what the deflation maths expects. */
  periodSharpe: number;
  sortino: number;
  maxDrawdown: number;
  maxDrawdownBars: number;
  calmar: number;
  trades: number;
  winRate: number;
  profitFactor: number;
  /** Mean net result per round trip, in bps of notional. The edge, after costs. */
  expectancyBps: number;
  /** Mean result per round trip *before* costs. The raw signal. */
  grossEdgeBps: number;
  /** Mean commission per round trip, in bps of notional. */
  costPerTradeBps: number;
  medianTradeBps: number;
  avgBarsHeld: number;
  /** Gross P&L before fees and slippage. */
  grossPnl: number;
  netPnl: number;
  totalCosts: number;
  /** Costs as a share of gross P&L. Above 1 means costs ate the whole edge. */
  costRatio: number;
  costDragBps: number;
  turnover: number;
  exposure: number;
  skew: number;
  excessKurtosis: number;
}

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdev(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1),
  );
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

function moments(values: readonly number[]): {
  skew: number;
  excessKurtosis: number;
} {
  const n = values.length;
  if (n < 4) return { skew: 0, excessKurtosis: 0 };
  const m = mean(values);
  const sd = stdev(values);
  if (sd === 0) return { skew: 0, excessKurtosis: 0 };
  let s3 = 0;
  let s4 = 0;
  for (const v of values) {
    const z = (v - m) / sd;
    s3 += z ** 3;
    s4 += z ** 4;
  }
  return { skew: s3 / n, excessKurtosis: s4 / n - 3 };
}

export function periodReturns(curve: readonly EquityPoint[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1]!.equity;
    if (prev > 0) out.push(curve[i]!.equity / prev - 1);
  }
  return out;
}

export function maxDrawdown(curve: readonly EquityPoint[]): {
  depth: number;
  bars: number;
} {
  let peak = -Infinity;
  let peakIndex = 0;
  let depth = 0;
  let bars = 0;
  for (let i = 0; i < curve.length; i++) {
    const equity = curve[i]!.equity;
    if (equity > peak) {
      peak = equity;
      peakIndex = i;
    }
    if (peak > 0) {
      const dd = 1 - equity / peak;
      if (dd > depth) {
        depth = dd;
        bars = i - peakIndex;
      }
    }
  }
  return { depth, bars };
}

function tradeStats(trades: readonly Trade[]): {
  winRate: number;
  profitFactor: number;
  expectancyBps: number;
  grossEdgeBps: number;
  costPerTradeBps: number;
  medianTradeBps: number;
  avgBarsHeld: number;
} {
  if (trades.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      expectancyBps: 0,
      grossEdgeBps: 0,
      costPerTradeBps: 0,
      medianTradeBps: 0,
      avgBarsHeld: 0,
    };
  }
  const notional = (t: Trade) => Math.max(1e-9, t.qty * t.entryPrice);
  const wins = trades.filter((t) => t.netPnl > 0);
  const grossWin = wins.reduce((a, t) => a + t.netPnl, 0);
  const grossLoss = trades
    .filter((t) => t.netPnl < 0)
    .reduce((a, t) => a + Math.abs(t.netPnl), 0);
  return {
    winRate: wins.length / trades.length,
    profitFactor:
      grossLoss === 0 ? (grossWin > 0 ? Infinity : 0) : grossWin / grossLoss,
    expectancyBps: mean(trades.map((t) => t.netBps)),
    grossEdgeBps: mean(
      trades.map((t) => ((t.grossPnl + t.slippage) / notional(t)) * 10_000),
    ),
    costPerTradeBps: mean(
      trades.map((t) => ((t.fees + t.slippage) / notional(t)) * 10_000),
    ),
    medianTradeBps: median(trades.map((t) => t.netBps)),
    avgBarsHeld: mean(trades.map((t) => t.barsHeld)),
  };
}

export function computeStats(result: RunResult): PerformanceStats {
  const curve = result.equityCurve;
  const returns = periodReturns(curve);
  const periodsPerYear = YEAR_MS / Math.max(1, result.barIntervalMs);

  const avg = mean(returns);
  const sd = stdev(returns);
  const downside = returns.filter((r) => r < 0);
  const downsideDev = Math.sqrt(mean(downside.map((r) => r * r)));

  const dd = maxDrawdown(curve);
  const netPnl = result.finalEquity - result.initialCash;
  const totalCosts = result.totalFees + result.totalSlippageCost;
  const grossPnl = netPnl + totalCosts;

  const elapsedMs =
    curve.length > 1 ? curve[curve.length - 1]!.ts - curve[0]!.ts : 0;
  const years = elapsedMs / YEAR_MS;
  const totalReturn = netPnl / result.initialCash;
  const cagr =
    years > 0 && 1 + totalReturn > 0 ? (1 + totalReturn) ** (1 / years) - 1 : 0;

  const periodSharpe = sd === 0 ? 0 : avg / sd;
  const annualVol = sd * Math.sqrt(periodsPerYear);
  const { skew, excessKurtosis } = moments(returns);
  const barsWithPosition = curve.filter((p) => p.position !== 0).length;

  return {
    totalReturn,
    cagr,
    annualVol,
    sharpe: periodSharpe * Math.sqrt(periodsPerYear),
    periodSharpe,
    sortino:
      downsideDev === 0 ? 0 : (avg / downsideDev) * Math.sqrt(periodsPerYear),
    maxDrawdown: dd.depth,
    maxDrawdownBars: dd.bars,
    calmar: dd.depth === 0 ? 0 : cagr / dd.depth,
    trades: result.trades.length,
    ...tradeStats(result.trades),
    grossPnl,
    netPnl,
    totalCosts,
    costRatio:
      Math.abs(grossPnl) < 1e-9 ? Infinity : totalCosts / Math.abs(grossPnl),
    costDragBps: (totalCosts / result.initialCash) * 10_000,
    turnover: result.grossTraded / result.initialCash,
    exposure: curve.length === 0 ? 0 : barsWithPosition / curve.length,
    skew,
    excessKurtosis,
  };
}
