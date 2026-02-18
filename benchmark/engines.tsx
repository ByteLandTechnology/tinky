import {
  render as renderTinky,
  Box as TinkyBox,
  Text as TinkyText,
  type Instance as TinkyInstance,
  type RenderMetrics,
} from "../src/index.js";
import { JSX, type ComponentType } from "react";
import { CaptureStream } from "./capture-stream.js";
import { BENCHMARK_TERMINAL } from "./scenarios.js";
import {
  type BenchmarkResult,
  type Engine,
  type EngineBenchmarkConfig,
  type InkMode,
  type Mode,
  type RoundSample,
  type ScenarioDefinition,
  type ScenarioFrame,
  type TinkyMode,
} from "./types.js";

const INTERNAL_ENV = {
  ...process.env,
  CI: "false",
  TINKY_SCREEN_READER: "false",
};

interface InkInstance {
  rerender: (node: JSX.Element) => void;
  unmount: () => void;
}

interface InkRuntime {
  readonly render: (
    node: JSX.Element,
    options?: Record<string, unknown>,
  ) => InkInstance;
  readonly Box: ComponentType<Record<string, unknown>>;
  readonly Text: ComponentType<Record<string, unknown>>;
}

let inkRuntimePromise: Promise<InkRuntime> | undefined;

const toSorted = (values: readonly number[]): number[] =>
  [...values].sort((a, b) => a - b);

const average = (values: readonly number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};

const percentile = (values: readonly number[], p: number): number => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = toSorted(values);
  const rawIndex = Math.ceil((p / 100) * sorted.length) - 1;
  const index = Math.min(sorted.length - 1, Math.max(0, rawIndex));
  return sorted[index] ?? 0;
};

const toTinkyFrame = (frame: ScenarioFrame): JSX.Element => (
  <TinkyBox flexDirection="column">
    <TinkyText color={frame.color} bold={frame.bold}>
      {frame.lines.join("\n")}
    </TinkyText>
  </TinkyBox>
);

async function withCiDisabled<T>(run: () => Promise<T>): Promise<T> {
  const previousCi = process.env.CI;
  const previousContinuousIntegration = process.env.CONTINUOUS_INTEGRATION;

  process.env.CI = "false";
  process.env.CONTINUOUS_INTEGRATION = "false";

  try {
    return await run();
  } finally {
    if (previousCi === undefined) {
      delete process.env.CI;
    } else {
      process.env.CI = previousCi;
    }

    if (previousContinuousIntegration === undefined) {
      delete process.env.CONTINUOUS_INTEGRATION;
    } else {
      process.env.CONTINUOUS_INTEGRATION = previousContinuousIntegration;
    }
  }
}

const getInkRuntime = async (): Promise<InkRuntime> => {
  if (!inkRuntimePromise) {
    inkRuntimePromise = withCiDisabled(async () => {
      const ink = await import("ink");
      return {
        render: ink.render as InkRuntime["render"],
        Box: ink.Box as InkRuntime["Box"],
        Text: ink.Text as InkRuntime["Text"],
      };
    });
  }

  return inkRuntimePromise;
};

const toInkFrame = (ink: InkRuntime, frame: ScenarioFrame): JSX.Element => {
  const InkBox = ink.Box;
  const InkText = ink.Text;

  return (
    <InkBox flexDirection="column">
      <InkText color={frame.color} bold={frame.bold}>
        {frame.lines.join("\n")}
      </InkText>
    </InkBox>
  );
};

const flushInk = async (): Promise<void> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
};

const runTinkyRound = (
  scenario: ScenarioDefinition,
  mode: TinkyMode,
  updatesPerRound: number,
): RoundSample => {
  const stdout = new CaptureStream(BENCHMARK_TERMINAL);
  const renderTimes: number[] = [];

  const incrementalRendering =
    mode === "full"
      ? false
      : mode === "line"
        ? { strategy: "line" as const }
        : true;

  let app: TinkyInstance | undefined;

  try {
    app = renderTinky(toTinkyFrame(scenario.frameAt(0)), {
      stdout,
      stdin: process.stdin,
      stderr: process.stderr,
      patchConsole: false,
      maxFps: 0,
      incrementalRendering,
      env: INTERNAL_ENV,
      onRender: (metrics: RenderMetrics) => {
        renderTimes.push(metrics.renderTime);
      },
    });

    stdout.resetCounters();
    renderTimes.length = 0;

    const start = performance.now();
    for (let step = 1; step <= updatesPerRound; step++) {
      app.rerender(toTinkyFrame(scenario.frameAt(step)));
    }
    const durationMs = performance.now() - start;

    return {
      durationMs,
      renderTimesMs: [...renderTimes],
      capture: stdout.snapshot(),
    };
  } finally {
    app?.unmount();
    app?.cleanup();
  }
};

const runInkRound = async (
  scenario: ScenarioDefinition,
  updatesPerRound: number,
): Promise<RoundSample> => {
  const ink = await getInkRuntime();
  const stdout = new CaptureStream(BENCHMARK_TERMINAL);
  let app: InkInstance | undefined;

  try {
    app = ink.render(toInkFrame(ink, scenario.frameAt(0)), {
      stdout: stdout as unknown as NodeJS.WriteStream,
      stdin: process.stdin,
      stderr: process.stderr,
      patchConsole: false,
      maxFps: 0,
      incrementalRendering: false,
      exitOnCtrlC: false,
    });

    await flushInk();
    stdout.resetCounters();

    const start = performance.now();
    for (let step = 1; step <= updatesPerRound; step++) {
      app.rerender(toInkFrame(ink, scenario.frameAt(step)));
    }
    await flushInk();
    const durationMs = performance.now() - start;

    return {
      durationMs,
      renderTimesMs: [],
      capture: stdout.snapshot(),
    };
  } finally {
    app?.unmount();
  }
};

const buildResult = (
  scenario: ScenarioDefinition,
  engine: Engine,
  mode: Mode,
  updatesPerRound: number,
  measuredSamples: readonly RoundSample[],
): BenchmarkResult => {
  const msSamples = measuredSamples.map(
    (sample) => sample.durationMs / updatesPerRound,
  );
  const totalBytesSamples = measuredSamples.map(
    (sample) => sample.capture.totalBytes,
  );
  const visibleBytesSamples = measuredSamples.map(
    (sample) => sample.capture.visibleBytes,
  );
  const ansiBytesSamples = measuredSamples.map(
    (sample) => sample.capture.ansiBytes,
  );
  const writeCallsSamples = measuredSamples.map(
    (sample) => sample.capture.writeCalls,
  );
  const renderTimeSamples = measuredSamples.flatMap(
    (sample) => sample.renderTimesMs,
  );

  const avgMs = average(msSamples);
  const safeAvgMs = Math.max(avgMs, Number.EPSILON);
  const totalBytes = average(totalBytesSamples);
  const visibleBytes = average(visibleBytesSamples);
  const ansiBytes = average(ansiBytesSamples);
  const writeCalls = average(writeCallsSamples);

  return {
    scenario: scenario.id,
    engine,
    mode,
    avgMs,
    p95Ms: percentile(msSamples, 95),
    updatesPerSecond: 1000 / safeAvgMs,
    totalBytes,
    visibleBytes,
    avgBytes: totalBytes / updatesPerRound,
    ansiBytes,
    avgAnsiBytes: ansiBytes / updatesPerRound,
    writeCalls,
    avgWriteCalls: writeCalls / updatesPerRound,
    samples: measuredSamples.length,
    ...(renderTimeSamples.length > 0
      ? {
          avgRenderTimeMs: average(renderTimeSamples),
          p95RenderTimeMs: percentile(renderTimeSamples, 95),
        }
      : {}),
  };
};

export const runTinkyBenchmark = async (
  mode: TinkyMode,
  config: EngineBenchmarkConfig,
): Promise<BenchmarkResult> => {
  const totalRounds = config.warmupRounds + config.measuredRounds;
  const measuredSamples: RoundSample[] = [];

  for (let round = 0; round < totalRounds; round++) {
    const sample = runTinkyRound(config.scenario, mode, config.updatesPerRound);
    if (round >= config.warmupRounds) {
      measuredSamples.push(sample);
    }
  }

  return buildResult(
    config.scenario,
    "tinky",
    mode,
    config.updatesPerRound,
    measuredSamples,
  );
};

export const runInkBenchmark = async (
  mode: InkMode,
  config: EngineBenchmarkConfig,
): Promise<BenchmarkResult> => {
  const totalRounds = config.warmupRounds + config.measuredRounds;
  const measuredSamples: RoundSample[] = [];

  for (let round = 0; round < totalRounds; round++) {
    const sample = await runInkRound(config.scenario, config.updatesPerRound);
    if (round >= config.warmupRounds) {
      measuredSamples.push(sample);
    }
  }

  return buildResult(
    config.scenario,
    "ink",
    mode,
    config.updatesPerRound,
    measuredSamples,
  );
};

export const meanRenderTime = (samples: readonly number[]): number =>
  average(samples);
