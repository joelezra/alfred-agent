#!/usr/bin/env -S npx tsx
/**
 * Trading centre CLI.
 *
 *   npm run trading -- scenarios
 *   npm run trading -- backtest --strategy sma-trend --scenario bull-trend
 *   npm run trading -- harness --strategy naive-scalper
 *   npm run trading -- audit --strategy sma-trend
 *   npm run trading -- walkforward --strategy sma-trend --scenario regime-flip
 */
import { writeFileSync } from 'node:fs';
import {
  SCENARIOS,
  parseInterval,
  scenarioById,
} from './src/scenarios/catalog.js';
import { generateBars, validateBars } from './src/scenarios/generator.js';
import { runBacktest } from './src/engine/engine.js';
import { computeStats } from './src/metrics/stats.js';
import { runSuite } from './src/harness/suite.js';
import { evaluateGates } from './src/harness/gates.js';
import { renderJson, renderMarkdown } from './src/harness/report.js';
import { walkForward } from './src/harness/walkforward.js';
import { auditLookahead } from './src/guards/lookahead-audit.js';
import { strategyByName } from './src/strategies/registry.js';

function parseArgs(argv: string[]): {
  command: string;
  flags: Record<string, string>;
} {
  const [command = 'help', ...rest] = argv;
  const flags: Record<string, string> = {};
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i]!;
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (next && !next.startsWith('--')) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = 'true';
    }
  }
  return { command, flags };
}

const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;

function cmdScenarios(): void {
  console.log('Scenario catalogue:\n');
  for (const spec of SCENARIOS) {
    console.log(`  ${spec.id.padEnd(18)} ${spec.description}`);
    console.log(`  ${''.padEnd(18)} breaks: ${spec.breaks}\n`);
  }
}

function cmdBacktest(flags: Record<string, string>): void {
  const factory = strategyByName(flags.strategy ?? 'sma-trend');
  const spec = {
    ...scenarioById(flags.scenario ?? 'regime-flip'),
    ...(flags.interval ? { intervalMs: parseInterval(flags.interval) } : {}),
    ...(flags.bars ? { bars: Number(flags.bars) } : {}),
  };
  const seed = Number(flags.seed ?? 1);
  const bars = generateBars(spec, seed);
  validateBars(bars);

  const result = runBacktest(factory(), bars, {
    seed,
    config: { costs: spec.costOverrides },
  });
  const stats = computeStats(result);

  console.log(
    `\n${result.strategyId} on ${spec.id} (seed ${seed}, ${bars.length} bars)\n`,
  );
  const rows: [string, string][] = [
    ['Total return', pct(stats.totalReturn)],
    ['Sharpe (annualised)', stats.sharpe.toFixed(2)],
    ['Max drawdown', pct(stats.maxDrawdown)],
    ['Trades', String(stats.trades)],
    ['Win rate', pct(stats.winRate)],
    ['Gross edge / trade', `${stats.grossEdgeBps.toFixed(2)}bps`],
    ['Cost / trade', `${stats.costPerTradeBps.toFixed(2)}bps`],
    ['Net expectancy / trade', `${stats.expectancyBps.toFixed(2)}bps`],
    [
      'Costs as share of gross',
      Number.isFinite(stats.costRatio) ? stats.costRatio.toFixed(2) : 'n/a',
    ],
    ['Turnover', `${stats.turnover.toFixed(1)}x`],
    ['Rejected orders', String(result.rejections.length)],
  ];
  for (const [label, value] of rows)
    console.log(`  ${label.padEnd(26)} ${value}`);
  console.log('');
}

function cmdHarness(flags: Record<string, string>): void {
  const name = flags.strategy ?? 'naive-scalper';
  const factory = strategyByName(name);
  const seeds = (flags.seeds ?? '1,2,3').split(',').map(Number);
  const scenarioIds = flags.scenarios ? flags.scenarios.split(',') : undefined;

  const suite = runSuite(factory, {
    seeds,
    scenarioIds,
    intervalMs: flags.interval ? parseInterval(flags.interval) : undefined,
    bars: flags.bars ? Number(flags.bars) : undefined,
  });
  const verdict = evaluateGates(
    suite,
    flags.trials ? { trials: Number(flags.trials) } : {},
  );
  const markdown = renderMarkdown(suite, verdict);

  console.log(markdown);
  if (flags.md) writeFileSync(flags.md, markdown);
  if (flags.json) writeFileSync(flags.json, renderJson(suite, verdict));

  process.exitCode = verdict.passed ? 0 : 1;
}

function cmdAudit(flags: Record<string, string>): void {
  const factory = strategyByName(flags.strategy ?? 'sma-trend');
  const spec = scenarioById(flags.scenario ?? 'regime-flip');
  const bars = generateBars(spec, Number(flags.seed ?? 1));
  const audit = auditLookahead(() => factory(), bars);

  console.log(
    `\nLookahead audit — ${flags.strategy ?? 'sma-trend'} on ${spec.id}\n`,
  );
  console.log(`  Verdict:        ${audit.clean ? 'CLEAN' : 'CONTAMINATED'}`);
  console.log(`  Cuts tested:    ${audit.cutsTested.join(', ')}`);
  console.log(`  Divergences:    ${audit.findings.length}`);
  console.log(
    `  One-bar delay:  ${(audit.shiftedPnlRatio * 100).toFixed(1)}% of P&L retained`,
  );
  for (const note of audit.notes) console.log(`  ! ${note}`);
  console.log('');
  process.exitCode = audit.clean ? 0 : 1;
}

function cmdWalkForward(flags: Record<string, string>): void {
  const name = flags.strategy ?? 'sma-trend';
  const factory = strategyByName(name);
  const spec = scenarioById(flags.scenario ?? 'regime-flip');
  const bars = generateBars({ ...spec, bars: 8000 }, Number(flags.seed ?? 1));

  const grid =
    name === 'sma-trend'
      ? [10, 20, 40].flatMap((fast) =>
          [60, 100, 200].map((slow) => ({ fast, slow })),
        )
      : [3, 4, 5].flatMap((lookback) =>
          [6, 10, 16].map((targetBps) => ({ lookback, targetBps })),
        );

  const result = walkForward(factory, bars, { grid, folds: 4 });
  console.log(`\nWalk-forward — ${name} on ${spec.id}\n`);
  for (const fold of result.folds) {
    console.log(
      `  fold ${fold.fold}: params ${JSON.stringify(fold.chosenParams)} ` +
        `in-sample ${pct(fold.inSampleReturn)} → out-of-sample ${pct(fold.outOfSampleReturn)}`,
    );
  }
  console.log('');
  console.log(`  Mean in-sample:     ${pct(result.meanInSample)}`);
  console.log(`  Mean out-of-sample: ${pct(result.meanOutOfSample)}`);
  console.log(
    `  Efficiency:         ${
      result.efficiency === null
        ? 'n/a (in-sample found no edge to hold on to)'
        : result.efficiency.toFixed(2)
    }`,
  );
  console.log(`  Consistency:        ${pct(result.consistency)}`);
  console.log(`  Trials to declare:  ${result.trials}`);
  console.log('');
}

function main(): void {
  const { command, flags } = parseArgs(process.argv.slice(2));
  switch (command) {
    case 'scenarios':
      return cmdScenarios();
    case 'backtest':
      return cmdBacktest(flags);
    case 'harness':
      return cmdHarness(flags);
    case 'audit':
      return cmdAudit(flags);
    case 'walkforward':
      return cmdWalkForward(flags);
    default:
      console.log(
        [
          'Usage: npm run trading -- <command> [flags]',
          '',
          '  scenarios                         list the market conditions in the catalogue',
          '  backtest    --strategy --scenario run one strategy over one scenario',
          '  harness     --strategy            run the full gate suite (exit 1 on failure)',
          '  audit       --strategy            check for lookahead only',
          '  walkforward --strategy --scenario rolling fit-then-test',
          '',
          '  Flags: --seed N  --seeds 1,2,3  --scenarios a,b  --interval 1m|5m|15m|1h|4h|1d',
          '         --bars N  --json out.json  --md out.md  --trials N',
        ].join('\n'),
      );
  }
}

main();
