/**
 * Deterministic random numbers.
 *
 * Every run of the harness must reproduce bit-for-bit from its seed, otherwise
 * "the strategy got better" and "the dice got kinder" are indistinguishable.
 * Streams are named so that adding a venue-side draw (latency jitter) cannot
 * shift the market path a strategy sees.
 */

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Standard normal via Box-Muller. */
  normal(): number;
  /** Uniform in [min, max). */
  range(min: number, max: number): number;
  /** True with probability `p`. */
  chance(p: number): boolean;
}

/** xmur3 string hash, used to turn a stream name into a 32-bit seed. */
function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 — small, fast, good enough for simulation, fully deterministic. */
export function createRng(seed: number | string, stream = 'default'): Rng {
  const base = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
  let state = (base ^ hashString(stream)) >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let spare: number | null = null;
  const normal = (): number => {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return value;
    }
    let u = 0;
    let v = 0;
    let s = 0;
    do {
      u = next() * 2 - 1;
      v = next() * 2 - 1;
      s = u * u + v * v;
    } while (s === 0 || s >= 1);
    const scale = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * scale;
    return u * scale;
  };

  return {
    next,
    normal,
    range: (min, max) => min + next() * (max - min),
    chance: (p) => next() < p,
  };
}
