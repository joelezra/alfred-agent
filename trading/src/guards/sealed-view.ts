import type { Bar, MarketView, PositionSnapshot } from '../types.js';

/**
 * Thrown when a strategy reaches for data the simulated clock has not reached.
 * This is the whole point of the sealed view: cheating becomes a crash, not a
 * silently excellent equity curve.
 */
export class LookaheadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LookaheadError';
  }
}

export interface AccountSnapshot {
  position(): PositionSnapshot;
  equity(): number;
  cash(): number;
}

/**
 * A point-in-time window over a bar series.
 *
 * The full array lives here, but the only way out of it is `bar(offset)`, which
 * indexes backwards from the last *closed* bar. Offsets beyond the sealed
 * length, or negative offsets (the future), throw.
 */
export class SealedView implements MarketView {
  #bars: readonly Bar[];
  #sealed = 0;
  #account: AccountSnapshot;

  constructor(bars: readonly Bar[], account: AccountSnapshot) {
    this.#bars = bars;
    this.#account = account;
  }

  /** Advance the clock by one bar. Called by the engine, never by a strategy. */
  seal(count: number): void {
    if (count < this.#sealed) {
      throw new LookaheadError('the simulated clock cannot run backwards');
    }
    if (count > this.#bars.length) {
      throw new LookaheadError('cannot seal more bars than the series holds');
    }
    this.#sealed = count;
  }

  get length(): number {
    return this.#sealed;
  }

  now(): number {
    if (this.#sealed === 0) {
      throw new LookaheadError('no bar has closed yet');
    }
    return this.#bars[this.#sealed - 1]!.closeTime;
  }

  bar(offset = 0): Bar {
    if (!Number.isInteger(offset)) {
      throw new LookaheadError(`bar offset must be an integer, got ${offset}`);
    }
    if (offset < 0) {
      throw new LookaheadError(
        `bar(${offset}) reaches into the future; offset 0 is the last closed bar`,
      );
    }
    const index = this.#sealed - 1 - offset;
    if (index < 0) {
      throw new LookaheadError(
        `bar(${offset}) reaches before the start of the series (${this.#sealed} bars closed)`,
      );
    }
    return this.#bars[index]!;
  }

  #series(n: number, pick: (bar: Bar) => number): number[] {
    if (n <= 0) return [];
    const available = Math.min(n, this.#sealed);
    const out = new Array<number>(available);
    for (let i = 0; i < available; i++) {
      // Oldest first, so callers can read them like a chart.
      out[available - 1 - i] = pick(this.bar(i));
    }
    return out;
  }

  closes(n: number): number[] {
    return this.#series(n, (bar) => bar.close);
  }

  highs(n: number): number[] {
    return this.#series(n, (bar) => bar.high);
  }

  lows(n: number): number[] {
    return this.#series(n, (bar) => bar.low);
  }

  volumes(n: number): number[] {
    return this.#series(n, (bar) => bar.volume);
  }

  position(): PositionSnapshot {
    return this.#account.position();
  }

  equity(): number {
    return this.#account.equity();
  }

  cash(): number {
    return this.#account.cash();
  }
}
