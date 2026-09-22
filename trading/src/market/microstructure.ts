import type { Bar, CostModel } from '../types.js';
import type { Rng } from '../rng.js';

/**
 * The cost of interacting with the market.
 *
 * A backtest that ignores this is a plot of a formula, not of a strategy. The
 * three charges below are the ones that decide whether a high-frequency edge is
 * real: you cross the spread, you move the price, and you wait.
 */
export class Microstructure {
  #costs: CostModel;
  #venueRng: Rng;

  constructor(costs: CostModel, venueRng: Rng) {
    this.#costs = costs;
    this.#venueRng = venueRng;
  }

  get costs(): CostModel {
    return this.#costs;
  }

  /**
   * Half of the quoted spread, in bps. Widens with realised volatility, because
   * that is exactly when a strategy most wants to trade and market makers most
   * want to be paid.
   */
  halfSpreadBps(volRatio: number): number {
    const stress = Math.max(0, volRatio - 1);
    return (
      (this.#costs.baseSpreadBps * (1 + this.#costs.spreadVolCoef * stress)) / 2
    );
  }

  /** How much of this bar we are allowed to be. Beyond it, orders fill partially. */
  maxFillQty(bar: Bar): number {
    return Math.max(0, bar.volume * this.#costs.maxParticipation);
  }

  /**
   * Square-root market impact. Taking 100% of the permitted participation costs
   * `impactCoef` bps; taking a quarter of it costs half that.
   */
  impactBps(qty: number, bar: Bar): number {
    const capacity = this.maxFillQty(bar);
    if (capacity <= 0) return this.#costs.impactCoef;
    const participation = Math.min(1, qty / capacity);
    return this.#costs.impactCoef * Math.sqrt(participation);
  }

  /** Decision-to-venue delay for one order, in milliseconds. */
  latencyMs(): number {
    const { latencyMs, latencyJitterMs } = this.#costs;
    return latencyMs + this.#venueRng.next() * latencyJitterMs;
  }
}

/**
 * Trailing realised volatility, expressed as a ratio of short-window to
 * long-window volatility. 1 means "normal"; 4 means the market just broke.
 */
export class VolatilityTracker {
  #returns: number[] = [];
  #short: number;
  #long: number;

  constructor(shortWindow = 20, longWindow = 200) {
    this.#short = shortWindow;
    this.#long = longWindow;
  }

  push(prevClose: number, close: number): void {
    if (prevClose > 0 && close > 0) {
      this.#returns.push(Math.log(close / prevClose));
      if (this.#returns.length > this.#long) this.#returns.shift();
    }
  }

  #stdev(window: number): number {
    const slice = this.#returns.slice(-window);
    if (slice.length < 2) return 0;
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance =
      slice.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (slice.length - 1);
    return Math.sqrt(variance);
  }

  /** Short-window vol over long-window vol. Falls back to 1 before warmup. */
  ratio(): number {
    if (this.#returns.length < this.#short * 2) return 1;
    const long = this.#stdev(this.#long);
    if (long <= 0) return 1;
    return this.#stdev(this.#short) / long;
  }

  /** Long-window volatility per bar, used to size stops and impact. */
  barVol(): number {
    return this.#stdev(this.#long);
  }
}
