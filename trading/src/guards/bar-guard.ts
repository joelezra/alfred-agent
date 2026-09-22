import type { Bar } from '../types.js';
import { LookaheadError } from './sealed-view.js';

export interface GuardState {
  /** Index of the most recently closed bar. -1 before the run starts. */
  sealed: number;
  violations: string[];
}

/**
 * A bar array that refuses to be read ahead of the clock.
 *
 * The sealed view stops a strategy reaching into the future through the API it
 * is given. This stops it reaching around the API: if a strategy, an indicator
 * helper or a feature builder has been handed the raw series, every element
 * access is checked against where the simulation has actually got to, and
 * reading tomorrow's bar throws on the spot.
 *
 * `length` stays readable — knowing how long the backtest is will not make you
 * rich, and forbidding it would break every ordinary loop.
 */
export function createBarGuard(
  bars: readonly Bar[],
  state: GuardState,
): readonly Bar[] {
  return new Proxy(bars as Bar[], {
    get(target, property, receiver): unknown {
      if (typeof property === 'string' && /^\d+$/.test(property)) {
        const index = Number(property);
        if (index > state.sealed) {
          const message = `read bar ${index} while only bars up to ${state.sealed} had closed`;
          state.violations.push(message);
          throw new LookaheadError(message);
        }
      }
      return Reflect.get(target, property, receiver);
    },
  });
}
