import { type ReactElement } from "react";

export type Engine = "tinky" | "ink";
export type TinkyMode = "full" | "line" | "run";
export type InkMode = "ink";
export type Mode = TinkyMode | InkMode;
export type UpdateFrequency = "low" | "high";
export type UpdateScope = "local" | "broad";

export type Scenario =
  | "low-frequency-local-dashboard"
  | "high-frequency-local-status"
  | "low-frequency-broad-table"
  | "high-frequency-broad-logstream";

export interface ScenarioFrame {
  readonly lines: readonly string[];
  readonly color?: string;
  readonly bold?: boolean;
}

export interface ScenarioDefinition {
  readonly id: Scenario;
  readonly description: string;
  readonly updateFrequency: UpdateFrequency;
  readonly updateScope: UpdateScope;
  readonly useCase: string;
  frameAt: (step: number) => ScenarioFrame;
}

export interface CaptureMetrics {
  readonly totalBytes: number;
  readonly visibleBytes: number;
  readonly ansiBytes: number;
  readonly writeCalls: number;
  readonly writes: readonly string[];
}

export interface RoundSample {
  readonly durationMs: number;
  readonly renderTimesMs: readonly number[];
  readonly capture: CaptureMetrics;
}

export interface BenchmarkResult {
  readonly scenario: Scenario;
  readonly engine: Engine;
  readonly mode: Mode;
  readonly avgMs: number;
  readonly p95Ms: number;
  readonly updatesPerSecond: number;
  readonly totalBytes: number;
  readonly visibleBytes: number;
  readonly avgBytes: number;
  readonly ansiBytes: number;
  readonly avgAnsiBytes: number;
  readonly writeCalls: number;
  readonly avgWriteCalls: number;
  readonly samples: number;
  readonly avgRenderTimeMs?: number;
  readonly p95RenderTimeMs?: number;
}

export interface GlobalModeSummary {
  readonly mode: Mode;
  readonly avgMs: number;
  readonly avgBytes: number;
}

export interface BenchmarkSummary {
  readonly results: readonly BenchmarkResult[];
  readonly byScenario: Readonly<Record<Scenario, readonly BenchmarkResult[]>>;
  readonly globalByMode: readonly GlobalModeSummary[];
}

export interface EngineBenchmarkConfig {
  readonly scenario: ScenarioDefinition;
  readonly warmupRounds: number;
  readonly measuredRounds: number;
  readonly updatesPerRound: number;
}

export interface ScenarioRenderer {
  readonly renderFrame: (frame: ScenarioFrame) => ReactElement;
}
