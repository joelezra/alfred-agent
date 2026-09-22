import type {
  Bar,
  Bracket,
  Fill,
  Millis,
  Order,
  OrderRequest,
  Side,
} from '../types.js';
import type { Microstructure } from '../market/microstructure.js';
import type { Portfolio } from './portfolio.js';

export interface BrokerConfig {
  allowShort: boolean;
  maxLeverage: number;
}

interface Protective extends Bracket {
  /** Sign of the position this bracket was armed to protect. */
  armedSign: number;
}

/**
 * Order lifecycle and fills.
 *
 * The rules that matter, all of which exist to stop a backtest flattering
 * itself:
 *
 *  1. An order decided on the close of bar T cannot touch bar T. It arrives
 *     part-way into bar T+1, and the further into the bar latency pushes it,
 *     the less of that bar's range is still available to it.
 *  2. Limit orders must trade *through* their price, not merely touch it.
 *  3. Stops fill at the gap, not at the stop price.
 *  4. When a bracket's stop and target are both inside one bar, the stop wins.
 *  5. No order may take more than the configured share of a bar's volume. The
 *     rest stays working, which is what capacity limits actually feel like.
 */
export class Broker {
  #micro: Microstructure;
  #portfolio: Portfolio;
  #config: BrokerConfig;
  #orders = new Map<string, Order>();
  #fills: Fill[] = [];
  #protective: Protective | null = null;
  #seq = 0;
  #rejections: string[] = [];

  constructor(
    micro: Microstructure,
    portfolio: Portfolio,
    config: BrokerConfig,
  ) {
    this.#micro = micro;
    this.#portfolio = portfolio;
    this.#config = config;
  }

  get fills(): readonly Fill[] {
    return this.#fills;
  }

  get rejections(): readonly string[] {
    return this.#rejections;
  }

  working(): readonly Order[] {
    return [...this.#orders.values()].filter(
      (o) =>
        o.status === 'pending' ||
        o.status === 'working' ||
        o.status === 'partial',
    );
  }

  submit(request: OrderRequest, decidedAt: Millis, markPrice: number): string {
    const id = `o${++this.#seq}`;
    const order: Order = {
      ...request,
      id,
      createdAt: decidedAt,
      eligibleAt: decidedAt + this.#micro.latencyMs(),
      status: 'pending',
      filledQty: 0,
      avgFillPrice: 0,
      barsWorked: 0,
    };

    const rejection = this.#validate(order, markPrice);
    if (rejection) {
      order.status = 'rejected';
      order.rejectReason = rejection;
      this.#rejections.push(`${id}: ${rejection}`);
    }
    this.#orders.set(id, order);
    return id;
  }

  #validate(order: Order, markPrice: number): string | null {
    if (!(order.qty > 0) || !Number.isFinite(order.qty)) {
      return `invalid quantity ${order.qty}`;
    }
    if (order.type === 'limit' && !Number.isFinite(order.limitPrice ?? NaN)) {
      return 'limit order without a limit price';
    }
    if (order.type === 'stop' && !Number.isFinite(order.stopPrice ?? NaN)) {
      return 'stop order without a stop price';
    }
    const signed = order.side === 'buy' ? order.qty : -order.qty;
    const resulting = this.#portfolio.qty + signed;
    if (!this.#config.allowShort && resulting < -1e-12) {
      return 'shorting is disabled for this run';
    }
    const equity = this.#portfolio.equity();
    if (equity <= 0) return 'account is wiped out';
    const projectedGross = Math.abs(resulting) * markPrice;
    if (projectedGross > equity * this.#config.maxLeverage) {
      return `order would breach ${this.#config.maxLeverage}x leverage`;
    }
    return null;
  }

  cancel(id: string): void {
    const order = this.#orders.get(id);
    if (order && (order.status === 'pending' || order.status === 'working')) {
      order.status = 'cancelled';
    }
  }

  cancelAll(): void {
    for (const order of this.#orders.values()) {
      if (order.status === 'pending' || order.status === 'working') {
        order.status = 'cancelled';
      }
    }
  }

  /** Runs the bar against every resting and newly-arriving order. */
  processBar(bar: Bar, volRatio: number): Fill[] {
    const produced: Fill[] = [];
    let budget = this.#micro.maxFillQty(bar);
    // The portfolio is only updated once the bar is done, so track the position
    // as it moves within the bar. Without this, two exits in the same bar both
    // think they are closing and the second one opens a reversed position.
    let position = this.#portfolio.qty;

    // 1. Protective exits were already resting, so they see the whole bar.
    const protectiveFill = this.#runProtective(bar, volRatio, budget, position);
    if (protectiveFill) {
      produced.push(protectiveFill);
      budget -= protectiveFill.qty;
      position +=
        protectiveFill.side === 'buy'
          ? protectiveFill.qty
          : -protectiveFill.qty;
    }

    // 2. Orders that arrive during this bar see only what is left of it.
    for (const order of this.#orders.values()) {
      if (
        order.status === 'filled' ||
        order.status === 'cancelled' ||
        order.status === 'rejected'
      ) {
        continue;
      }
      if (order.eligibleAt >= bar.closeTime) continue; // still in flight
      if (budget <= 0) break;

      order.status = order.filledQty > 0 ? 'partial' : 'working';
      order.barsWorked += 1;

      const fill = this.#tryFill(order, bar, volRatio, budget, position);
      if (fill) {
        produced.push(fill);
        budget -= fill.qty;
        position += fill.side === 'buy' ? fill.qty : -fill.qty;
      }

      if (
        order.expiresInBars !== undefined &&
        order.barsWorked >= order.expiresInBars
      ) {
        const unfilled = order.filledQty < order.qty - 1e-12;
        if (unfilled) order.status = 'cancelled';
      }
    }

    for (const fill of produced) {
      this.#fills.push(fill);
      this.#portfolio.applyFill(fill);
    }
    if (this.#portfolio.qty === 0) this.#protective = null;
    return produced;
  }

  /**
   * Flatten whatever is open at the end of a run, paying full taker costs.
   * Leaving a position marked-to-market at the final close lets a strategy book
   * a paper profit it could never have realised.
   */
  liquidate(bar: Bar, volRatio: number): Fill | null {
    const position = this.#portfolio.qty;
    if (position === 0) return null;
    const side: Side = position > 0 ? 'sell' : 'buy';
    const fill = this.#syntheticTaker(
      side,
      Math.abs(position),
      bar.close,
      bar,
      volRatio,
      'eod-flat',
    );
    fill.orderId = 'liquidation';
    this.#fills.push(fill);
    this.#portfolio.applyFill(fill);
    this.#protective = null;
    return fill;
  }

  #arrivalFraction(order: Order, bar: Bar): number {
    const span = bar.closeTime - bar.openTime;
    if (span <= 0) return 0;
    return Math.min(1, Math.max(0, (order.eligibleAt - bar.openTime) / span));
  }

  #tryFill(
    order: Order,
    bar: Bar,
    volRatio: number,
    budget: number,
    position: number,
  ): Fill | null {
    const fraction = this.#arrivalFraction(order, bar);
    const remaining = 1 - fraction;
    const refPrice = bar.open + (bar.close - bar.open) * fraction;
    const effHigh = bar.close + (bar.high - bar.close) * remaining;
    const effLow = bar.close - (bar.close - bar.low) * remaining;
    let qty = Math.min(order.qty - order.filledQty, budget);

    if (order.reduceOnly) {
      const reducible =
        order.side === 'buy' ? Math.max(0, -position) : Math.max(0, position);
      if (reducible <= 1e-12) {
        order.status = 'cancelled';
        order.rejectReason = 'reduce-only order had nothing left to reduce';
        return null;
      }
      qty = Math.min(qty, reducible);
    } else {
      qty = Math.min(qty, this.#headroom(order.side, position, refPrice));
    }
    if (qty <= 1e-12) return null;

    const tick = this.#micro.costs.tickSize;
    const through = this.#micro.costs.requireTradeThrough ? tick : 0;

    if (order.type === 'market') {
      return this.#taker(order, qty, refPrice, bar, volRatio);
    }

    if (order.type === 'limit') {
      const limit = order.limitPrice!;
      const crossed =
        order.side === 'buy'
          ? effLow <= limit - through
          : effHigh >= limit + through;
      if (!crossed) return null;
      return this.#maker(order, qty, limit, bar, volRatio);
    }

    // Stop order: trigger on the effective range, fill at the gap if there is one.
    const stop = order.stopPrice!;
    const triggered = order.side === 'buy' ? effHigh >= stop : effLow <= stop;
    if (!triggered) return null;
    const gapped =
      order.side === 'buy'
        ? Math.max(stop, refPrice)
        : Math.min(stop, refPrice);
    return this.#taker(order, qty, gapped, bar, volRatio);
  }

  /**
   * How much more the account may take on in this direction before it breaches
   * the leverage limit. Checked at fill time as well as at submission, because
   * an order can sit working for bars while equity moves underneath it.
   */
  #headroom(side: Side, position: number, price: number): number {
    const signed = side === 'buy' ? 1 : -1;
    // Reducing an existing position never needs headroom.
    if (position !== 0 && Math.sign(position) !== signed) return Infinity;
    const equity = this.#portfolio.equity();
    if (equity <= 0 || price <= 0) return 0;
    const cap = (equity * this.#config.maxLeverage) / price;
    return Math.max(0, cap - Math.abs(position));
  }

  #runProtective(
    bar: Bar,
    volRatio: number,
    budget: number,
    position: number,
  ): Fill | null {
    const protective = this.#protective;
    if (!protective || position === 0 || budget <= 0) return null;

    // A bracket protects the position it was armed for. If that position has
    // been closed and reversed, the bracket is stale — firing it here would add
    // to the new position instead of protecting it.
    if (Math.sign(position) !== protective.armedSign) {
      this.#protective = null;
      return null;
    }

    const exitSide: Side = position > 0 ? 'sell' : 'buy';
    const qty = Math.min(Math.abs(position), budget);
    const isLong = position > 0;

    // Pessimistic ordering: if the bar spans both exits, assume the stop hit first.
    if (protective.stopLoss !== undefined) {
      const hit = isLong
        ? bar.low <= protective.stopLoss
        : bar.high >= protective.stopLoss;
      if (hit) {
        const gapped = isLong
          ? Math.min(protective.stopLoss, bar.open)
          : Math.max(protective.stopLoss, bar.open);
        const fill = this.#syntheticTaker(
          exitSide,
          qty,
          gapped,
          bar,
          volRatio,
          'bracket-stop',
        );
        fill.orderId = 'protective';
        return fill;
      }
    }
    if (protective.takeProfit !== undefined) {
      const tick = this.#micro.costs.requireTradeThrough
        ? this.#micro.costs.tickSize
        : 0;
      const hit = isLong
        ? bar.high >= protective.takeProfit + tick
        : bar.low <= protective.takeProfit - tick;
      if (hit) {
        const fill = this.#syntheticMaker(
          exitSide,
          qty,
          protective.takeProfit,
          bar,
          volRatio,
          'bracket-target',
        );
        fill.orderId = 'protective';
        return fill;
      }
    }
    return null;
  }

  #taker(
    order: Order,
    qty: number,
    reference: number,
    bar: Bar,
    volRatio: number,
  ): Fill {
    const fill = this.#syntheticTaker(
      order.side,
      qty,
      reference,
      bar,
      volRatio,
      order.tag,
    );
    fill.orderId = order.id;
    this.#settleOrder(order, fill);
    this.#armBracket(order);
    return fill;
  }

  #maker(
    order: Order,
    qty: number,
    price: number,
    bar: Bar,
    volRatio: number,
  ): Fill {
    const fill = this.#syntheticMaker(
      order.side,
      qty,
      price,
      bar,
      volRatio,
      order.tag,
    );
    fill.orderId = order.id;
    this.#settleOrder(order, fill);
    this.#armBracket(order);
    return fill;
  }

  #syntheticTaker(
    side: Side,
    qty: number,
    reference: number,
    bar: Bar,
    volRatio: number,
    tag?: string,
  ): Fill {
    const direction = side === 'buy' ? 1 : -1;
    const slippageBps =
      this.#micro.halfSpreadBps(volRatio) + this.#micro.impactBps(qty, bar);
    const price = reference * (1 + direction * (slippageBps / 10_000));
    return {
      orderId: '',
      ts: bar.closeTime,
      side,
      qty,
      price,
      fee: (qty * price * this.#micro.costs.takerFeeBps) / 10_000,
      slippageBps,
      tag,
    };
  }

  #syntheticMaker(
    side: Side,
    qty: number,
    price: number,
    bar: Bar,
    volRatio: number,
    tag?: string,
  ): Fill {
    const direction = side === 'buy' ? 1 : -1;
    // Resting orders skip the spread but pay for being on the wrong side of
    // whoever just took them out.
    const slippageBps =
      this.#micro.costs.adverseSelectionBps * Math.max(1, volRatio);
    const effective = price * (1 + direction * (slippageBps / 10_000));
    return {
      orderId: '',
      ts: bar.closeTime,
      side,
      qty,
      price: effective,
      fee: (qty * effective * this.#micro.costs.makerFeeBps) / 10_000,
      slippageBps,
      tag,
    };
  }

  #settleOrder(order: Order, fill: Fill): void {
    const filledBefore = order.filledQty;
    order.filledQty += fill.qty;
    order.avgFillPrice =
      (order.avgFillPrice * filledBefore + fill.price * fill.qty) /
      order.filledQty;
    order.status = order.filledQty >= order.qty - 1e-12 ? 'filled' : 'partial';
  }

  #armBracket(order: Order): void {
    if (!order.bracket) return;
    this.#protective = {
      ...order.bracket,
      armedSign: order.side === 'buy' ? 1 : -1,
    };
  }
}
