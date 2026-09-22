import type { SuiteResult } from './suite.js';
import type { Verdict } from './gates.js';

const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;

/** Human-readable verdict. Written to be read by a person who is about to say no. */
export function renderMarkdown(suite: SuiteResult, verdict: Verdict): string {
  const lines: string[] = [];

  lines.push(`# Harness report — \`${suite.strategyId}\``);
  lines.push('');
  lines.push(`**${verdict.summary}**`);
  lines.push('');
  lines.push(
    `${suite.runCount} runs across ${suite.scenarioIds.length} scenarios × ${suite.seeds.length} seeds in ${(suite.elapsedMs / 1000).toFixed(1)}s.`,
  );
  lines.push('');

  lines.push('## Gates');
  lines.push('');
  lines.push('| | Gate | Observed | Threshold |');
  lines.push('|---|---|---|---|');
  for (const gate of verdict.gates) {
    const mark = gate.passed
      ? '✅'
      : gate.severity === 'blocking'
        ? '❌'
        : '⚠️';
    lines.push(
      `| ${mark} | ${gate.title} | ${gate.observed} | ${gate.threshold} |`,
    );
  }
  lines.push('');

  const failures = [...verdict.blockingFailures, ...verdict.advisoryFailures];
  if (failures.length > 0) {
    lines.push('### Why these failed');
    lines.push('');
    for (const gate of failures) {
      lines.push(`- **${gate.title}** (${gate.severity}) — ${gate.rationale}`);
      lines.push(`  - observed ${gate.observed}, needs ${gate.threshold}`);
    }
    lines.push('');
  }

  lines.push('## Scenarios (baseline costs)');
  lines.push('');
  lines.push(
    '| Scenario | Return | Sharpe | Max DD | Trades | Edge/trade | Cost/trade |',
  );
  lines.push('|---|---:|---:|---:|---:|---:|---:|');
  for (const scenario of suite.scenarios) {
    const v = scenario.variants.baseline;
    if (!v) continue;
    lines.push(
      `| \`${scenario.scenarioId}\` | ${pct(v.medianReturn)} | ${v.medianSharpe.toFixed(2)} | ${pct(v.medianMaxDrawdown)} | ${v.medianTrades.toFixed(0)} | ${v.medianGrossEdgeBps.toFixed(1)}bps | ${v.medianCostPerTradeBps.toFixed(1)}bps |`,
    );
  }
  lines.push('');

  lines.push('## Stress variants (median return across scenarios)');
  lines.push('');
  const variantIds = Object.keys(suite.scenarios[0]?.variants ?? {});
  lines.push(`| Scenario | ${variantIds.join(' | ')} |`);
  lines.push(`|---|${variantIds.map(() => '---:').join('|')}|`);
  for (const scenario of suite.scenarios) {
    const cells = variantIds.map((id) =>
      pct(scenario.variants[id]?.medianReturn ?? 0),
    );
    lines.push(`| \`${scenario.scenarioId}\` | ${cells.join(' | ')} |`);
  }
  lines.push('');

  lines.push('## Cost floor (what the market allows, before any strategy)');
  lines.push('');
  lines.push(
    'A strategy with perfect foresight, paying the same costs, at each holding period:',
  );
  lines.push('');
  lines.push(
    '| Hold (bars) | Oracle return | Edge/trade | Cost/trade | Viable |',
  );
  lines.push('|---:|---:|---:|---:|:--:|');
  for (const h of suite.costFloor.horizons) {
    lines.push(
      `| ${h.horizonBars} | ${pct(h.oracleReturn)} | ${h.oracleExpectancyBps.toFixed(1)}bps | ${h.costPerTradeBps.toFixed(1)}bps | ${h.viable ? '✅' : '❌'} |`,
    );
  }
  lines.push('');
  lines.push(
    suite.costFloor.shortestViableHorizon === null
      ? '**Nothing is viable at any horizon tested.** At these costs this market cannot be traded profitably on this timeframe, by anyone.'
      : `**Cost floor: ${suite.costFloor.shortestViableHorizon} bars.** Anything held for less than that loses to costs even with perfect foresight.`,
  );
  lines.push('');

  lines.push('## Lookahead audit');
  lines.push('');
  lines.push(
    suite.audit.clean
      ? '- Clean. No unclosed bar was read, decisions were identical across forked futures, and the edge survives a one-bar delay.'
      : '- **Not clean.**',
  );
  for (const note of suite.audit.notes) lines.push(`- ${note}`);
  lines.push('');

  if (verdict.blockingFailures.length > 0) {
    lines.push('## What this scenario was built to expose');
    lines.push('');
    for (const scenario of suite.scenarios) {
      const v = scenario.variants.baseline;
      if (v && v.medianReturn < 0) {
        lines.push(
          `- \`${scenario.scenarioId}\` (${pct(v.medianReturn)}) — ${scenario.breaks}`,
        );
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/** Machine-readable verdict, for the agent loop rather than the human one. */
export function renderJson(suite: SuiteResult, verdict: Verdict): string {
  return JSON.stringify(
    {
      strategyId: suite.strategyId,
      passed: verdict.passed,
      summary: verdict.summary,
      gates: verdict.gates,
      costFloor: {
        shortestViableHorizon: suite.costFloor.shortestViableHorizon,
        horizons: suite.costFloor.horizons,
      },
      audit: {
        clean: suite.audit.clean,
        findings: suite.audit.findings.length,
        guardViolations: suite.audit.guardViolations,
        shiftedPnlRatio: suite.audit.shiftedPnlRatio,
        notes: suite.audit.notes,
      },
      scenarios: suite.scenarios.map((scenario) => ({
        id: scenario.scenarioId,
        breaks: scenario.breaks,
        variants: Object.fromEntries(
          Object.entries(scenario.variants).map(([id, v]) => [
            id,
            {
              medianReturn: v.medianReturn,
              medianSharpe: v.medianSharpe,
              medianMaxDrawdown: v.medianMaxDrawdown,
              medianTrades: v.medianTrades,
              medianBarsHeld: v.medianBarsHeld,
              medianGrossEdgeBps: v.medianGrossEdgeBps,
              medianCostPerTradeBps: v.medianCostPerTradeBps,
            },
          ]),
        ),
      })),
      runCount: suite.runCount,
      elapsedMs: suite.elapsedMs,
    },
    null,
    2,
  );
}
