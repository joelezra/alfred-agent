/**
 * Multiple-testing correction.
 *
 * If you try two hundred strategy variants, the best one looks excellent
 * whether or not any of them has an edge. The deflated Sharpe ratio asks the
 * only interesting question: is this Sharpe bigger than the best you would
 * expect from that many coin flips? (Bailey & López de Prado, 2014.)
 */

const EULER_MASCHERONI = 0.5772156649015329;

/** Abramowitz & Stegun 7.1.26 error function, plenty accurate here. */
function erf(x: number): number {
  const sign = Math.sign(x);
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-z * z);
  return sign * y;
}

export function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/** Acklam's inverse normal CDF. */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [
    -39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269,
    -30.66479806614716, 2.506628277459239,
  ];
  const b = [
    -54.47609879822406, 161.5858368580409, -155.6989798598866,
    66.80131188771972, -13.28068155288572,
  ];
  const c = [
    -0.007784894002430293, -0.3223964580411365, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    0.007784695709041462, 0.3224671290700398, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q +
        c[5]!) /
      ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1)
    );
  }
  if (p > 1 - pLow) return -normalQuantile(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r +
      a[5]!) *
      q) /
    (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
  );
}

/**
 * The Sharpe you should expect from the luckiest of `trials` strategies that
 * all have no edge, given how much their Sharpes vary.
 */
export function expectedMaxSharpe(
  trials: number,
  sharpeDispersion: number,
): number {
  const n = Math.max(2, trials);
  const a = normalQuantile(1 - 1 / n);
  const b = normalQuantile(1 - 1 / (n * Math.E));
  return sharpeDispersion * ((1 - EULER_MASCHERONI) * a + EULER_MASCHERONI * b);
}

export interface DeflationInput {
  /** Per-period (not annualised) Sharpe ratio. */
  periodSharpe: number;
  /** Number of return observations. */
  observations: number;
  skew: number;
  excessKurtosis: number;
  /** How many variants were tried before this one was picked. */
  trials: number;
  /** Spread of per-period Sharpes across those variants. */
  sharpeDispersion: number;
}

/**
 * Probability that the observed Sharpe beats what selection bias alone would
 * produce. Below ~0.95 the result is not evidence of anything.
 */
export function deflatedSharpe(input: DeflationInput): number {
  const { periodSharpe, observations, skew, excessKurtosis } = input;
  if (observations < 4) return 0;
  const benchmark = expectedMaxSharpe(input.trials, input.sharpeDispersion);
  const kurtosis = excessKurtosis + 3;
  const variance =
    1 - skew * periodSharpe + ((kurtosis - 1) / 4) * periodSharpe ** 2;
  if (variance <= 0) return 0;
  const z =
    ((periodSharpe - benchmark) * Math.sqrt(observations - 1)) /
    Math.sqrt(variance);
  return normalCdf(z);
}
