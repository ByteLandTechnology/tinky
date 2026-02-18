import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { runInkBenchmark, runTinkyBenchmark } from "./engines.js";
import { BENCHMARK_SCENARIOS, BENCHMARK_TERMINAL } from "./scenarios.js";
import {
  type BenchmarkResult,
  type BenchmarkSummary,
  type GlobalModeSummary,
  type InkMode,
  type Mode,
  type Scenario,
  type TinkyMode,
} from "./types.js";

const WARMUP_ROUNDS = 2;
const MEASURED_ROUNDS = 6;
const UPDATES_PER_ROUND = 120;

const TINKY_MODES: readonly TinkyMode[] = ["full", "line", "run"];
const INK_MODES: readonly InkMode[] = ["ink"];
const MODE_ORDER: readonly Mode[] = ["full", "line", "run", "ink"];
const SCENARIO_COUNT = 4;
const REPORT_RELATIVE_PATH = "docs/benchmark.md";

interface EnvironmentSnapshot {
  readonly platform: string;
  readonly release: string;
  readonly arch: string;
  readonly cpuModel: string;
  readonly cpuCores: number;
  readonly totalMemoryGiB: number;
  readonly bunVersion: string;
  readonly nodeCompatVersion: string;
  readonly terminalColumns: number;
  readonly terminalRows: number;
}

const average = (values: readonly number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};

const asFixed = (value: number, digits = 2): string => value.toFixed(digits);

const asInt = (value: number): string => Math.round(value).toString();

const asCompact = (value: number, digits = 3): string =>
  Number(value.toFixed(digits)).toString();

const plusPercent = (value: number): string =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const displayMode = (mode: Mode): string => {
  if (mode === "full") {
    return "full";
  }
  return mode;
};

const markdownCell = (value: string): string =>
  value.replaceAll("\\", "\\\\").replaceAll("|", "\\|");

const tableRow = (cells: readonly string[]): string =>
  `| ${cells.map(markdownCell).join(" | ")} |`;

const tableDivider = (columns: number): string =>
  `| ${Array.from({ length: columns }, () => "---").join(" | ")} |`;

const escapeMermaidText = (value: string): string =>
  value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

const chartUpperBound = (values: readonly number[]): number => {
  const maxValue = Math.max(0, ...values);
  if (maxValue <= 0) {
    return 1;
  }

  return Number((maxValue * 1.15).toFixed(3));
};

const orderedScenarioRows = (
  summary: BenchmarkSummary,
  scenario: Scenario,
): BenchmarkResult[] =>
  [...summary.byScenario[scenario]].sort(
    (a, b) => MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode),
  );

const mermaidBarChart = (
  title: string,
  yAxisLabel: string,
  values: readonly { label: string; value: number }[],
): string[] => {
  const labels = values
    .map((entry) => `"${escapeMermaidText(entry.label)}"`)
    .join(", ");
  const points = values.map((entry) => asCompact(entry.value)).join(", ");
  const upper = asCompact(chartUpperBound(values.map((entry) => entry.value)));

  return [
    "```mermaid",
    "xychart-beta",
    `    title "${escapeMermaidText(title)}"`,
    `    x-axis [${labels}]`,
    `    y-axis "${escapeMermaidText(yAxisLabel)}" 0 --> ${upper}`,
    `    bar [${points}]`,
    "```",
  ];
};

const percentDelta = (value: number, baseline: number): number => {
  if (baseline <= 0) {
    return 0;
  }

  return ((value - baseline) / baseline) * 100;
};

const assertCondition = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`Benchmark integrity check failed: ${message}`);
  }
};

const collectEnvironmentSnapshot = (): EnvironmentSnapshot => {
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model ?? "unknown";
  const bunVersion = Bun.version ?? process.versions.bun ?? "unknown";

  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuModel,
    cpuCores: cpus.length,
    totalMemoryGiB: os.totalmem() / 1024 ** 3,
    bunVersion,
    nodeCompatVersion: process.version,
    terminalColumns: BENCHMARK_TERMINAL.columns,
    terminalRows: BENCHMARK_TERMINAL.rows,
  };
};

const buildSummary = (
  results: readonly BenchmarkResult[],
): BenchmarkSummary => {
  const byScenario = {} as Record<Scenario, BenchmarkResult[]>;
  for (const scenario of BENCHMARK_SCENARIOS) {
    byScenario[scenario.id] = [];
  }

  for (const result of results) {
    byScenario[result.scenario].push(result);
  }

  const globalByMode: GlobalModeSummary[] = [];
  for (const mode of MODE_ORDER) {
    const rows = results.filter((result) => result.mode === mode);
    globalByMode.push({
      mode,
      avgMs: average(rows.map((row) => row.avgMs)),
      avgBytes: average(rows.map((row) => row.avgBytes)),
    });
  }

  return {
    results,
    byScenario,
    globalByMode,
  };
};

const assertSummaryIntegrity = (summary: BenchmarkSummary): void => {
  assertCondition(
    BENCHMARK_SCENARIOS.length === SCENARIO_COUNT,
    `Expected ${SCENARIO_COUNT} benchmark scenarios, got ${BENCHMARK_SCENARIOS.length}`,
  );

  const scenarios = new Set(summary.results.map((result) => result.scenario));
  assertCondition(
    scenarios.size === SCENARIO_COUNT,
    `Expected ${SCENARIO_COUNT} scenario ids in results, got ${scenarios.size}`,
  );

  const numericFields = [
    "avgMs",
    "p95Ms",
    "updatesPerSecond",
    "totalBytes",
    "visibleBytes",
    "avgBytes",
    "ansiBytes",
    "avgAnsiBytes",
    "writeCalls",
    "avgWriteCalls",
    "samples",
  ] as const;

  for (const scenario of BENCHMARK_SCENARIOS) {
    const rows = summary.byScenario[scenario.id];
    assertCondition(
      rows.length === MODE_ORDER.length,
      `Scenario ${scenario.id} expected ${MODE_ORDER.length} rows, got ${rows.length}`,
    );

    for (const mode of MODE_ORDER) {
      assertCondition(
        rows.some((row) => row.mode === mode),
        `Scenario ${scenario.id} missing mode ${mode}`,
      );
    }
  }

  for (const result of summary.results) {
    for (const field of numericFields) {
      const value = result[field];
      assertCondition(
        Number.isFinite(value),
        `Field ${field} for ${result.scenario}/${result.mode} is not finite`,
      );
      assertCondition(
        value >= 0,
        `Field ${field} for ${result.scenario}/${result.mode} is negative`,
      );
    }

    if (result.avgRenderTimeMs !== undefined) {
      assertCondition(
        Number.isFinite(result.avgRenderTimeMs),
        `avgRenderTimeMs for ${result.scenario}/${result.mode} is not finite`,
      );
      assertCondition(
        result.avgRenderTimeMs >= 0,
        `avgRenderTimeMs for ${result.scenario}/${result.mode} is negative`,
      );
    }

    if (result.p95RenderTimeMs !== undefined) {
      assertCondition(
        Number.isFinite(result.p95RenderTimeMs),
        `p95RenderTimeMs for ${result.scenario}/${result.mode} is not finite`,
      );
      assertCondition(
        result.p95RenderTimeMs >= 0,
        `p95RenderTimeMs for ${result.scenario}/${result.mode} is negative`,
      );
    }

    assertCondition(
      result.updatesPerSecond > 0,
      `updatesPerSecond for ${result.scenario}/${result.mode} must be > 0`,
    );
    assertCondition(
      result.totalBytes >= result.visibleBytes,
      `totalBytes must be >= visibleBytes for ${result.scenario}/${result.mode}`,
    );

    if (result.mode === "ink") {
      assertCondition(
        result.engine === "ink",
        `Expected ink engine for mode ${result.mode}`,
      );
    } else {
      assertCondition(
        result.engine === "tinky",
        `Expected tinky engine for mode ${result.mode}`,
      );
    }
  }
};

const printScenarioTables = (summary: BenchmarkSummary): void => {
  console.log("\n[benchmark] Scenario detail (average across measured rounds)");

  for (const scenario of BENCHMARK_SCENARIOS) {
    const rows = orderedScenarioRows(summary, scenario.id);

    console.log(
      `\n[scenario] ${scenario.id} (${scenario.updateFrequency}/${scenario.updateScope}) — ${scenario.useCase}`,
    );
    console.log("mode | average ms | average bytes | samples");

    for (const row of rows) {
      console.log(
        `${row.engine}:${displayMode(row.mode)} | ${asFixed(row.avgMs)} | ${asFixed(row.avgBytes)} | ${row.samples}`,
      );
    }
  }
};

const printGlobalTable = (summary: BenchmarkSummary): void => {
  console.log("\n[benchmark] Global summary (average across all scenarios)");
  console.log("mode | average ms | average bytes");

  for (const row of summary.globalByMode) {
    console.log(
      `${displayMode(row.mode)} | ${asFixed(row.avgMs)} | ${asFixed(row.avgBytes)}`,
    );
  }
};

const buildScenarioChartMarkdown = (summary: BenchmarkSummary): string[] => {
  const lines: string[] = [
    "## Scenario detail charts",
    "",
    "Each scenario is classified by update frequency and update scope.",
    "The charts only include average rendering speed and average bytes.",
    "",
  ];

  for (const scenario of BENCHMARK_SCENARIOS) {
    const rows = orderedScenarioRows(summary, scenario.id);

    lines.push(`### ${scenario.id}`);
    lines.push("");
    lines.push(`- Frequency: \`${scenario.updateFrequency}\``);
    lines.push(`- Scope: \`${scenario.updateScope}\``);
    lines.push(`- Use case: ${scenario.useCase}`);
    lines.push(`- Description: ${scenario.description}`);
    lines.push("");
    lines.push("#### Average render time (ms)");
    lines.push("");
    lines.push(
      ...mermaidBarChart(
        `${scenario.id} average render time`,
        "ms (lower is better)",
        rows.map((row) => ({ label: displayMode(row.mode), value: row.avgMs })),
      ),
    );
    lines.push("");
    lines.push("#### Average output bytes");
    lines.push("");
    lines.push(
      ...mermaidBarChart(
        `${scenario.id} average output bytes`,
        "bytes (lower is better)",
        rows.map((row) => ({
          label: displayMode(row.mode),
          value: row.avgBytes,
        })),
      ),
    );
    lines.push("");
  }

  return lines;
};

const buildScenarioMatrixMarkdown = (): string[] => {
  const lines: string[] = [
    "## Scenario matrix",
    "",
    "Representative scenarios selected by `update frequency × update scope`.",
    "",
    tableRow(["scenario", "frequency", "scope", "typical use case"]),
    tableDivider(4),
  ];

  for (const scenario of BENCHMARK_SCENARIOS) {
    lines.push(
      tableRow([
        scenario.id,
        scenario.updateFrequency,
        scenario.updateScope,
        scenario.useCase,
      ]),
    );
  }

  lines.push("");
  return lines;
};

const buildGlobalChartMarkdown = (summary: BenchmarkSummary): string[] => {
  const lines: string[] = [
    "## Global summary charts",
    "",
    "Global values are averages of per-scenario averages for each mode.",
    "",
  ];

  lines.push("#### Average render time (ms)");
  lines.push("");
  lines.push(
    ...mermaidBarChart(
      "global average render time",
      "ms (lower is better)",
      summary.globalByMode.map((row) => ({
        label: displayMode(row.mode),
        value: row.avgMs,
      })),
    ),
  );
  lines.push("");
  lines.push("#### Average output bytes");
  lines.push("");
  lines.push(
    ...mermaidBarChart(
      "global average output bytes",
      "bytes (lower is better)",
      summary.globalByMode.map((row) => ({
        label: displayMode(row.mode),
        value: row.avgBytes,
      })),
    ),
  );
  lines.push("");
  return lines;
};

const buildGlobalPercentSummaryMarkdown = (
  summary: BenchmarkSummary,
): string[] => {
  const baseline = summary.globalByMode.find((row) => row.mode === "ink");
  if (!baseline) {
    return [];
  }

  const lines: string[] = [
    "## Final summary vs Ink",
    "",
    "Percentages compare each mode against `ink` using global averages.",
    "Negative percentages mean lower ms or lower bytes than Ink.",
    "",
    tableRow([
      "mode",
      "average ms",
      "speed vs ink",
      "average bytes",
      "bytes vs ink",
    ]),
    tableDivider(5),
  ];

  for (const row of summary.globalByMode) {
    const speedDelta = percentDelta(row.avgMs, baseline.avgMs);
    const bytesDelta = percentDelta(row.avgBytes, baseline.avgBytes);

    lines.push(
      tableRow([
        displayMode(row.mode),
        asFixed(row.avgMs),
        plusPercent(speedDelta),
        asFixed(row.avgBytes),
        plusPercent(bytesDelta),
      ]),
    );
  }

  lines.push("");
  return lines;
};

const buildMarkdownReport = (
  summary: BenchmarkSummary,
  environment: EnvironmentSnapshot,
): string => {
  const lines: string[] = [
    "# Render benchmark report",
    "",
    "This report compares Tinky rendering modes with Ink across representative",
    "application scenarios grouped by update frequency and update scope.",
    "It reports only rendering speed and output bytes.",
    "",
    "## What this benchmark measures",
    "",
    "- Rendering speed (`average ms`, lower is better).",
    "- Output size (`average bytes`, lower is better).",
    "",
    "## Environment",
    "",
    tableRow(["field", "value"]),
    tableDivider(2),
    tableRow(["Platform", environment.platform]),
    tableRow(["OS release", environment.release]),
    tableRow(["Architecture", environment.arch]),
    tableRow(["CPU model", environment.cpuModel]),
    tableRow(["CPU cores", asInt(environment.cpuCores)]),
    tableRow(["Total memory (GiB)", asFixed(environment.totalMemoryGiB, 2)]),
    tableRow(["Bun version", environment.bunVersion]),
    tableRow(["Node compatibility version", environment.nodeCompatVersion]),
    tableRow(["Terminal columns", asInt(environment.terminalColumns)]),
    tableRow(["Terminal rows", asInt(environment.terminalRows)]),
    "",
  ];

  lines.push(...buildScenarioMatrixMarkdown());
  lines.push(...buildScenarioChartMarkdown(summary));
  lines.push(...buildGlobalChartMarkdown(summary));
  lines.push(...buildGlobalPercentSummaryMarkdown(summary));
  lines.push("## Notes");
  lines.push("");
  lines.push(
    "- This benchmark is a report-only tool and does not fail based on performance thresholds.",
  );
  lines.push("- Byte metrics are calculated from UTF-8 output.");
  lines.push("");

  return `${lines.join("\n")}\n`;
};

const writeMarkdownReport = async (content: string): Promise<string> => {
  const reportPath = path.resolve(process.cwd(), REPORT_RELATIVE_PATH);
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, content, "utf8");
  return reportPath;
};

const run = async (): Promise<void> => {
  const start = performance.now();
  const results: BenchmarkResult[] = [];

  for (const scenario of BENCHMARK_SCENARIOS) {
    const config = {
      scenario,
      warmupRounds: WARMUP_ROUNDS,
      measuredRounds: MEASURED_ROUNDS,
      updatesPerRound: UPDATES_PER_ROUND,
    } as const;

    for (const mode of TINKY_MODES) {
      results.push(await runTinkyBenchmark(mode, config));
    }

    for (const mode of INK_MODES) {
      results.push(await runInkBenchmark(mode, config));
    }
  }

  const summary = buildSummary(results);
  assertSummaryIntegrity(summary);
  printScenarioTables(summary);
  printGlobalTable(summary);

  const durationMs = performance.now() - start;
  const environment = collectEnvironmentSnapshot();
  const markdownReport = buildMarkdownReport(summary, environment);
  const reportPath = await writeMarkdownReport(markdownReport);

  console.log(`\n[benchmark] Markdown report written to ${reportPath}`);
  console.log(`\n[benchmark] Completed in ${asFixed(durationMs / 1000, 2)}s`);
};

run().catch((error: unknown) => {
  console.error("\n[benchmark] Failed to run benchmark.");
  console.error(error);
  process.exit(1);
});
