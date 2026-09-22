import { describe, expect, it } from 'vitest';
import { generateBars, validateBars } from '../src/scenarios/generator.js';
import { SCENARIOS, scenarioById } from '../src/scenarios/catalog.js';

describe('scenario generator', () => {
  it('produces the same series for the same seed', () => {
    const spec = { ...scenarioById('chop-range'), bars: 400 };
    expect(generateBars(spec, 7)).toEqual(generateBars(spec, 7));
  });

  it('produces different series for different seeds', () => {
    const spec = { ...scenarioById('chop-range'), bars: 400 };
    expect(generateBars(spec, 7)).not.toEqual(generateBars(spec, 8));
  });

  it('emits structurally valid bars for every catalogued scenario', () => {
    for (const spec of SCENARIOS) {
      const series = generateBars({ ...spec, bars: 500 }, 1);
      expect(series).toHaveLength(500);
      expect(() => validateBars(series)).not.toThrow();
    }
  });

  it('makes the whipsaw scenario more volatile than the quiet one', () => {
    const noise = (id: string): number => {
      const series = generateBars({ ...scenarioById(id), bars: 1000 }, 3);
      const moves = series.map((b) => Math.abs(b.close / b.open - 1));
      return moves.reduce((a, b) => a + b, 0) / moves.length;
    };
    expect(noise('high-vol-whipsaw')).toBeGreaterThan(noise('quiet-drift') * 3);
  });

  it('gives the thin-liquidity scenario far less volume', () => {
    const volume = (id: string): number => {
      const series = generateBars({ ...scenarioById(id), bars: 500 }, 1);
      return series.reduce((a, b) => a + b.volume, 0) / series.length;
    };
    expect(volume('thin-liquidity')).toBeLessThan(volume('bull-trend') * 0.2);
  });
});
