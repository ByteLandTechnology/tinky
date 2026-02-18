import { type ScenarioDefinition, type ScenarioFrame } from "./types.js";

export const BENCHMARK_TERMINAL = {
  columns: 80,
  rows: 24,
} as const;

const LOW_FREQUENCY_STRIDE = 6;

const pad = (value: number, width: number): string =>
  String(value).padStart(width, "0");

const repeatToLength = (seed: string, length: number): string => {
  if (seed.length >= length) {
    return seed.slice(0, length);
  }

  let result = "";
  while (result.length < length) {
    result += seed;
  }
  return result.slice(0, length);
};

const lowFrequencyLocalDashboardFrame = (step: number): ScenarioFrame => {
  const tick = Math.floor(step / LOW_FREQUENCY_STRIDE);
  const activeMetric = tick % 4;
  const dynamicValue = 100 + ((tick * 17) % 900);

  const lines = [
    "app: checkout dashboard",
    `step=${pad(step, 4)} tick=${pad(tick, 4)} mode=low/local`,
    "------------------------------------------------------------",
    `orders_per_min   : ${activeMetric === 0 ? pad(dynamicValue, 4) : "0475"}`,
    `payment_latency  : ${activeMetric === 1 ? pad(dynamicValue, 4) : "0128"} ms`,
    `success_rate     : ${activeMetric === 2 ? pad(dynamicValue, 4) : "0992"} bp`,
    `active_sessions  : ${activeMetric === 3 ? pad(dynamicValue, 4) : "0820"}`,
    "alerts           : 0",
    "region           : us-east-1",
  ];

  return { lines };
};

const highFrequencyLocalStatusFrame = (step: number): ScenarioFrame => {
  const spinner = ["|", "/", "-", "\\"];
  const activeRow = step % 6;
  const progress = (step * 7) % 100;
  const lines: string[] = [
    "app: worker status monitor",
    `step=${pad(step, 4)} mode=high/local`,
    "------------------------------------------------------------",
  ];

  for (let row = 0; row < 6; row++) {
    if (row === activeRow) {
      lines.push(
        `> worker-${row} ${spinner[step % spinner.length] ?? "|"} progress=${pad(progress, 3)}% state=running`,
      );
    } else {
      lines.push(`  worker-${row} . progress=100% state=idle`);
    }
  }

  lines.push("queue_depth      : 12");
  lines.push("retry_backoff_ms : 250");

  return { lines };
};

const lowFrequencyBroadTableFrame = (step: number): ScenarioFrame => {
  const tick = Math.floor(step / LOW_FREQUENCY_STRIDE);
  const lines: string[] = [
    "app: ticket table",
    `step=${pad(step, 4)} dataset=${pad(tick, 4)} mode=low/broad`,
    "id     owner      priority  status        sla(h)",
  ];

  for (let row = 0; row < 12; row++) {
    const id = 1000 + tick * 13 + row * 7;
    const owner = `team-${(row + tick) % 5}`;
    const priority = ["low", "normal", "high", "urgent"][(row + tick) % 4];
    const status = ["open", "triage", "assigned", "review", "closed"][
      (row * 3 + tick) % 5
    ];
    const sla = ((tick * 19 + row * 11) % 72) + 1;

    lines.push(
      `${pad(id, 5)}  ${repeatToLength(owner, 9)}  ${repeatToLength(priority ?? "normal", 8)}  ${repeatToLength(status ?? "open", 12)}  ${pad(sla, 2)}`,
    );
  }

  return { lines };
};

const highFrequencyBroadLogstreamFrame = (step: number): ScenarioFrame => {
  const windowSize = 14;
  const sequence = step + 1;
  const first = Math.max(1, sequence - windowSize + 1);
  const lines: string[] = [
    "app: build log stream",
    `step=${pad(step, 4)} window=${pad(first, 4)}..${pad(sequence, 4)} mode=high/broad`,
  ];

  for (let entry = first; entry <= sequence; entry++) {
    const shard = (entry * 7) % 9;
    const latency = 20 + ((entry * 13) % 180);
    const status = entry % 9 === 0 ? "WARN" : "INFO";
    lines.push(
      `log-${pad(entry, 4)} [${status}] shard=${shard} latency=${pad(latency, 3)}ms ${repeatToLength(`evt-${entry}-`, 28)}`,
    );
  }

  return { lines };
};

export const BENCHMARK_SCENARIOS: readonly ScenarioDefinition[] = [
  {
    id: "low-frequency-local-dashboard",
    description:
      "Low-frequency local refresh, representing dashboard metric card updates.",
    updateFrequency: "low",
    updateScope: "local",
    useCase: "Dashboard KPI card refresh",
    frameAt: lowFrequencyLocalDashboardFrame,
  },
  {
    id: "high-frequency-local-status",
    description:
      "High-frequency local refresh, representing spinner/progress in status rows.",
    updateFrequency: "high",
    updateScope: "local",
    useCase: "Worker status spinner",
    frameAt: highFrequencyLocalStatusFrame,
  },
  {
    id: "low-frequency-broad-table",
    description:
      "Low-frequency broad refresh, representing list/table page replacement.",
    updateFrequency: "low",
    updateScope: "broad",
    useCase: "Ticket table page switch",
    frameAt: lowFrequencyBroadTableFrame,
  },
  {
    id: "high-frequency-broad-logstream",
    description:
      "High-frequency broad refresh, representing continuous log stream updates.",
    updateFrequency: "high",
    updateScope: "broad",
    useCase: "Live log stream",
    frameAt: highFrequencyBroadLogstreamFrame,
  },
];
