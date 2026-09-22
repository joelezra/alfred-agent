import type {
  EquityPoint,
  Fill,
  Millis,
  PositionSnapshot,
  Side,
  Trade,
} from '../types.js';

interface OpenLeg {
  side: Side;
  qty: number;
  /** Quantity-weighted entry price. */
  price: number;
  entryTs: Millis;
  entryBar: number;
  /** Entry commission accrued so far, in currency. */
  fees: number;
  /** Entry spread/impact cost accrued so far, in currency. */
  slippage: number;
}

/**
 * Cash, position, and the round-trip ledger.
 *
 * Average-cost accounting: adding to a position re-weights the entry price,
 * reducing it realises P&L on the closed quantity and emits a `Trade`. Fees are
 * allocated pro rata so that per-trade expectancy is net of costs — which is the
 * only number worth looking at.
 */
export class Portfolio {
  #cash: number;
  #qty = 0;
  #avgPrice = 0;
  #realizedPnl = 0;
  #totalFees = 0;
  #totalSlippageCost = 0;
  #grossTraded = 0;
  #leg: OpenLeg | null = null;
  #trades: Trade[] = [];
  #equityCurve: EquityPoint[] = [];
  #markPrice = 0;
  #barIndex = 0;

  constructor(initialCash: number) {
    this.#cash = initialCash;
  }

  get cash(): number {
    return this.#cash;
  }

  get qty(): number {
    return this.#qty;
  }

  get avgPrice(): number {
    return this.#avgPrice;
  }

  get trades(): readonly Trade[] {
    return this.#trades;
  }

  get equityCurve(): readonly EquityPoint[] {
    return this.#equityCurve;
  }

  get totalFees(): number {
    return this.#totalFees;
  }

  get totalSlippageCost(): number {
    return this.#totalSlippageCost;
  }

  get grossTraded(): number {
    return this.#grossTraded;
  }

  get realizedPnl(): number {
    return this.#realizedPnl;
  }

  equity(): number {
    return this.#cash + this.#qty * this.#markPrice;
  }

  grossExposure(): number {
    return Math.abs(this.#qty) * this.#markPrice;
  }

  snapshot(): PositionSnapshot {
    return {
      qty: this.#qty,
      avgPrice: this.#avgPrice,
      unrealizedPnl: this.#qty * (this.#markPrice - this.#avgPrice),
      realizedPnl: this.#realizedPnl,
    };
  }

  mark(price: number, ts: Millis, barIndex: number): void {
    this.#markPrice = price;
    this.#barIndex = barIndex;
    this.#equityCurve.push({
      ts,
      equity: this.equity(),
      position: this.#qty,
      price,
    });
  }

  /** Financing on gross exposure, charged once per simulated day. */
  chargeFinancing(bpsPerDay: number, fractionOfDay: number): void {
    if (bpsPerDay <= 0 || this.#qty === 0) return;
    const charge = this.grossExposure() * (bpsPerDay / 10_000) * fractionOfDay;
    this.#cash -= charge;
    this.#totalFees += charge;
  }

  applyFill(fill: Fill): void {
    const signed = fill.side === 'buy' ? fill.qty : -fill.qty;
    const notional = fill.qty * fill.price;

    this.#cash -= signed * fill.price;
    this.#cash -= fill.fee;
    this.#totalFees += fill.fee;
    const slippageCost = (Math.abs(fill.slippageBps) / 10_000) * notional;
    this.#totalSlippageCost += slippageCost;
    this.#grossTraded += notional;

    const sameDirection =
      this.#qty === 0 || Math.sign(signed) === Math.sign(this.#qty);

    if (sameDirection) {
      const newQty = this.#qty + signed;
      const absOld = Math.abs(this.#qty);
      const absNew = Math.abs(newQty);
      this.#avgPrice =
        absNew === 0
          ? 0
          : (this.#avgPrice * absOld + fill.price * fill.qty) / absNew;
      this.#qty = newQty;
      this.#openOrExtendLeg(fill);
      return;
    }

    // Opposing fill: close up to the open quantity, then possibly flip.
    const closing = Math.min(fill.qty, Math.abs(this.#qty));
    const direction = Math.sign(this.#qty);
    const pnl = closing * (fill.price - this.#avgPrice) * direction;
    this.#realizedPnl += pnl;
    this.#recordTrade(closing, fill, pnl);
    this.#qty += signed > 0 ? closing : -closing;

    const remainder = fill.qty - closing;
    if (Math.abs(this.#qty) < 1e-12) {
      this.#qty = 0;
      this.#avgPrice = 0;
      this.#leg = null;
    }
    if (remainder > 1e-12) {
      this.#qty = fill.side === 'buy' ? remainder : -remainder;
      this.#avgPrice = fill.price;
      this.#leg = {
        side: fill.side,
        qty: remainder,
        price: fill.price,
        entryTs: fill.ts,
        entryBar: this.#barIndex,
        // The flip's costs were already charged against the closing leg.
        fees: 0,
        slippage: 0,
      };
    }
  }

  #openOrExtendLeg(fill: Fill): void {
    const slippage =
      (Math.abs(fill.slippageBps) / 10_000) * fill.qty * fill.price;
    if (!this.#leg) {
      this.#leg = {
        side: fill.side,
        qty: fill.qty,
        price: fill.price,
        entryTs: fill.ts,
        entryBar: this.#barIndex,
        fees: fill.fee,
        slippage,
      };
      return;
    }
    const totalQty = this.#leg.qty + fill.qty;
    this.#leg.price =
      (this.#leg.price * this.#leg.qty + fill.price * fill.qty) / totalQty;
    this.#leg.qty = totalQty;
    this.#leg.fees += fill.fee;
    this.#leg.slippage += slippage;
  }

  #recordTrade(closedQty: number, exitFill: Fill, grossPnl: number): void {
    const leg = this.#leg;
    if (!leg || leg.qty <= 0) return;
    const share = Math.min(1, closedQty / leg.qty);
    const exitShare = Math.min(1, closedQty / exitFill.qty);
    const entryFees = leg.fees * share;
    const exitFees = exitFill.fee * exitShare;
    const fees = entryFees + exitFees;
    const entrySlippage = leg.slippage * share;
    const exitSlippage =
      (Math.abs(exitFill.slippageBps) / 10_000) *
      exitFill.qty *
      exitFill.price *
      exitShare;
    const slippage = entrySlippage + exitSlippage;
    const notional = closedQty * leg.price;

    this.#trades.push({
      entryTs: leg.entryTs,
      exitTs: exitFill.ts,
      side: leg.side,
      qty: closedQty,
      entryPrice: leg.price,
      exitPrice: exitFill.price,
      grossPnl,
      fees,
      slippage,
      netPnl: grossPnl - fees,
      netBps: notional > 0 ? ((grossPnl - fees) / notional) * 10_000 : 0,
      barsHeld: this.#barIndex - leg.entryBar,
    });

    leg.qty -= closedQty;
    leg.fees -= entryFees;
    leg.slippage -= entrySlippage;
    if (leg.qty <= 1e-12) this.#leg = null;
  }
}
