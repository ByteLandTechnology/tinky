/**
 * User-facing configuration for incremental rendering.
 *
 * You can use this object form when you need to choose a strategy explicitly
 * or disable incremental rendering without changing existing option shapes.
 */
export interface IncrementalRenderingConfig {
  /**
   * Master on/off switch for object mode.
   *
   * - `false`: disables incremental rendering, regardless of `strategy`.
   * - `true` or omitted: enables incremental rendering and uses `strategy`.
   */
  enabled?: boolean;

  /**
   * Diff strategy used for interactive output updates.
   *
   * - `"line"`: compares line strings and redraws changed lines.
   * - `"run"`: compares terminal cells and rewrites minimal changed runs.
   *
   * @defaultValue "run"
   */
  strategy?: "line" | "run";
}

/**
 * Public option accepted by `render(..., { incrementalRendering })`.
 */
export type IncrementalRenderingOption = boolean | IncrementalRenderingConfig;

/**
 * Internal normalized strategy used inside the renderer.
 */
export type IncrementalRenderStrategy = "none" | "line" | "run";

/**
 * Normalizes user-facing incremental rendering options to an internal strategy.
 *
 * Resolution order:
 * - `undefined` or `false` -> `"none"`
 * - `true` -> `"run"`
 * - `{ enabled: false }` -> `"none"`
 * - `{ strategy: "line" }` -> `"line"`
 * - `{ strategy: "run" }` or omitted strategy -> `"run"`
 */
export const normalizeIncrementalRendering = (
  value: IncrementalRenderingOption | undefined,
): IncrementalRenderStrategy => {
  if (value === undefined || value === false) {
    return "none";
  }

  if (value === true) {
    return "run";
  }

  if (value.enabled === false) {
    return "none";
  }

  return value.strategy ?? "run";
};
