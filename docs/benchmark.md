# Render benchmark report

This report compares Tinky rendering modes with Ink across representative
application scenarios grouped by update frequency and update scope.
It reports only rendering speed and output bytes.

## What this benchmark measures

- Rendering speed (`average ms`, lower is better).
- Output size (`average bytes`, lower is better).

## Environment

| field                      | value    |
| -------------------------- | -------- |
| Platform                   | darwin   |
| OS release                 | 25.3.0   |
| Architecture               | arm64    |
| CPU model                  | Apple M5 |
| CPU cores                  | 10       |
| Total memory (GiB)         | 16.00    |
| Bun version                | 1.3.9    |
| Node compatibility version | v24.3.0  |
| Terminal columns           | 80       |
| Terminal rows              | 24       |

## Scenario matrix

Representative scenarios selected by `update frequency × update scope`.

| scenario                       | frequency | scope | typical use case           |
| ------------------------------ | --------- | ----- | -------------------------- |
| low-frequency-local-dashboard  | low       | local | Dashboard KPI card refresh |
| high-frequency-local-status    | high      | local | Worker status spinner      |
| low-frequency-broad-table      | low       | broad | Ticket table page switch   |
| high-frequency-broad-logstream | high      | broad | Live log stream            |

## Scenario detail charts

Each scenario is classified by update frequency and update scope.
The charts only include average rendering speed and average bytes.

### low-frequency-local-dashboard

- Frequency: `low`
- Scope: `local`
- Use case: Dashboard KPI card refresh
- Description: Low-frequency local refresh, representing dashboard metric card updates.

#### Average render time (ms)

```mermaid
xychart-beta
    title "low-frequency-local-dashboard average render time"
    x-axis ["full", "line", "run", "ink"]
    y-axis "ms (lower is better)" 0 --> 2.116
    bar [0.085, 0.07, 0.065, 1.84]
```

#### Average output bytes

```mermaid
xychart-beta
    title "low-frequency-local-dashboard average output bytes"
    x-axis ["full", "line", "run", "ink"]
    y-axis "bytes (lower is better)" 0 --> 422.05
    bar [351, 79.833, 44.9, 367]
```

### high-frequency-local-status

- Frequency: `high`
- Scope: `local`
- Use case: Worker status spinner
- Description: High-frequency local refresh, representing spinner/progress in status rows.

#### Average render time (ms)

```mermaid
xychart-beta
    title "high-frequency-local-status average render time"
    x-axis ["full", "line", "run", "ink"]
    y-axis "ms (lower is better)" 0 --> 3.357
    bar [0.079, 0.074, 0.072, 2.92]
```

#### Average output bytes

```mermaid
xychart-beta
    title "high-frequency-local-status average output bytes"
    x-axis ["full", "line", "run", "ink"]
    y-axis "bytes (lower is better)" 0 --> 576.15
    bar [485, 155, 106.908, 501]
```

### low-frequency-broad-table

- Frequency: `low`
- Scope: `broad`
- Use case: Ticket table page switch
- Description: Low-frequency broad refresh, representing list/table page replacement.

#### Average render time (ms)

```mermaid
xychart-beta
    title "low-frequency-broad-table average render time"
    x-axis ["full", "line", "run", "ink"]
    y-axis "ms (lower is better)" 0 --> 5.017
    bar [0.111, 0.094, 0.095, 4.363]
```

#### Average output bytes

```mermaid
xychart-beta
    title "low-frequency-broad-table average output bytes"
    x-axis ["full", "line", "run", "ink"]
    y-axis "bytes (lower is better)" 0 --> 906.2
    bar [772, 190, 148.125, 788]
```

### high-frequency-broad-logstream

- Frequency: `high`
- Scope: `broad`
- Use case: Live log stream
- Description: High-frequency broad refresh, representing continuous log stream updates.

#### Average render time (ms)

```mermaid
xychart-beta
    title "high-frequency-broad-logstream average render time"
    x-axis ["full", "line", "run", "ink"]
    y-axis "ms (lower is better)" 0 --> 7.881
    bar [0.121, 0.116, 0.146, 6.853]
```

#### Average output bytes

```mermaid
xychart-beta
    title "high-frequency-broad-logstream average output bytes"
    x-axis ["full", "line", "run", "ink"]
    y-axis "bytes (lower is better)" 0 --> 1271.191
    bar [1089.383, 993, 675.642, 1105.383]
```

## Global summary charts

Global values are averages of per-scenario averages for each mode.

#### Average render time (ms)

```mermaid
xychart-beta
    title "global average render time"
    x-axis ["full", "line", "run", "ink"]
    y-axis "ms (lower is better)" 0 --> 4.593
    bar [0.099, 0.088, 0.095, 3.994]
```

#### Average output bytes

```mermaid
xychart-beta
    title "global average output bytes"
    x-axis ["full", "line", "run", "ink"]
    y-axis "bytes (lower is better)" 0 --> 793.898
    bar [674.346, 354.458, 243.894, 690.346]
```

## Final summary vs Ink

Percentages compare each mode against `ink` using global averages.
Negative percentages mean lower ms or lower bytes than Ink.

| mode | average ms | speed vs ink | average bytes | bytes vs ink |
| ---- | ---------- | ------------ | ------------- | ------------ |
| full | 0.10       | -97.5%       | 674.35        | -2.3%        |
| line | 0.09       | -97.8%       | 354.46        | -48.7%       |
| run  | 0.09       | -97.6%       | 243.89        | -64.7%       |
| ink  | 3.99       | +0.0%        | 690.35        | +0.0%        |

## Notes

- This benchmark is a report-only tool and does not fail based on performance thresholds.
- Byte metrics are calculated from UTF-8 output.
