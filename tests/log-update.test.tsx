import { test, expect } from "bun:test";
import ansiEscapes from "ansi-escapes";
import { logUpdate } from "../src/log-update.js";
import { createStdout } from "./helpers/create-stdout.js";

/**
 * Verifies standard rendering where each update writes to stdout.
 */
test("standard rendering - renders and updates output", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout);

  render("Hello");
  expect(stdout.callCount()).toBe(1);
  expect(stdout.firstCall()).toBe("Hello\n");

  render("World");
  expect(stdout.callCount()).toBe(2);
  expect(stdout.secondCall().includes("World")).toBeTrue();
});

/**
 * Verifies that standard rendering skips writing if the output is identical to
 * the previous frame.
 */
test("standard rendering - skips identical output", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout);

  render("Hello");
  render("Hello");

  expect(stdout.callCount()).toBe(1);
});

/**
 * Verifies that incremental rendering works similarly to standard rendering for
 * basic updates.
 */
test("incremental rendering - renders and updates output", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Hello");
  expect(stdout.callCount()).toBe(1);
  expect(stdout.firstCall()).toBe("Hello\n");

  render("World");
  expect(stdout.callCount()).toBe(2);
  expect(stdout.secondCall().includes("World")).toBeTrue();
});

/**
 * Verifies that incremental rendering also skips identical updates to save
 * resources.
 */
test("incremental rendering - skips identical output", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Hello");
  render("Hello");

  expect(stdout.callCount()).toBe(1);
});

/**
 * Verifies that incremental rendering performs "surgical updates", only writing
 * changed lines and skipping over unchanged ones using cursor movement.
 */
test("incremental rendering - surgical updates", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1\nLine 2\nLine 3");
  render("Line 1\nUpdated\nLine 3");

  const secondCall = stdout.secondCall();
  expect(secondCall.includes(ansiEscapes.cursorNextLine)).toBeTrue(); // Skips unchanged lines
  expect(secondCall.includes("Updated")).toBeTrue(); // Only updates changed line
  expect(secondCall.includes("Line 1")).toBeFalse(); // Doesn't rewrite unchanged
  expect(secondCall.includes("Line 3")).toBeFalse(); // Doesn't rewrite unchanged
});

/**
 * Verifies that extra lines are erased when the output shrinks in incremental
 * mode.
 */
test("incremental rendering - clears extra lines when output shrinks", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1\nLine 2\nLine 3");
  render("Line 1");

  const secondCall = stdout.secondCall();
  expect(secondCall.includes(ansiEscapes.eraseLines(2))).toBeTrue(); // Erases 2 extra lines
});

/**
 * Verifies that new lines are appended correctly when output grows in
 * incremental mode.
 */
test("incremental rendering - when output grows", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1");
  render("Line 1\nLine 2\nLine 3");

  const secondCall = stdout.secondCall();
  expect(secondCall.includes(ansiEscapes.cursorNextLine)).toBeTrue(); // Skips unchanged first line
  expect(secondCall.includes("Line 2")).toBeTrue(); // Adds new line
  expect(secondCall.includes("Line 3")).toBeTrue(); // Adds new line
  expect(secondCall.includes("Line 1")).toBeFalse(); // Doesn't rewrite unchanged
});

/**
 * Verifies that multiple updates in a single frame are handled efficiently with
 * one write call.
 */
test("incremental rendering - single write call with multiple surgical updates", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render(
    "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10",
  );
  render(
    "Line 1\nUpdated 2\nLine 3\nUpdated 4\nLine 5\nUpdated 6\nLine 7\nUpdated 8\nLine 9\nUpdated 10",
  );

  expect(stdout.callCount()).toBe(2); // Only 2 writes total (initial + update)
});

/**
 * Verifies that shrinking output correctly erases old lines and moves cursor back.
 */
test("incremental rendering - shrinking output keeps screen tight", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1\nLine 2\nLine 3");
  render("Line 1\nLine 2");
  render("Line 1");

  const thirdCall = stdout.get();

  expect(thirdCall).toBe(
    ansiEscapes.eraseLines(2) + // Erase Line 2 and ending cursorNextLine
      ansiEscapes.cursorUp(1) + // Move to beginning of Line 1
      ansiEscapes.cursorNextLine,
  );
});

/**
 * Verifies that clearing the log update instance resets its internal state,
 * causing a fresh full write next time.
 */
test("incremental rendering - clear() fully resets incremental state", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1\nLine 2\nLine 3");
  render.clear();
  render("Line 1");

  const afterClear = stdout.get();

  expect(afterClear).toBe(ansiEscapes.eraseLines(0) + "Line 1\n"); // Should do a fresh write
});

/**
 * Verifies that `done()` resets the state, treating the next render as a fresh
 * new output block rather than an update to the current one.
 */
test("incremental rendering - done() resets before next render", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1\nLine 2\nLine 3");
  render.done();
  render("Line 1");

  const afterDone = stdout.get();

  expect(afterDone).toBe(ansiEscapes.eraseLines(0) + "Line 1\n"); // Should do a fresh write
});

/**
 * Verifies that calling `clear()` multiple times is safe and results in proper
 * state reset.
 */
test("incremental rendering - multiple consecutive clear() calls (should be harmless no-ops)", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1\nLine 2\nLine 3");
  render.clear();
  render.clear();
  render.clear();

  expect(stdout.callCount()).toBe(4); // Initial render + 3 clears (each writes eraseLines)

  // Verify state is properly reset after multiple clears
  render("New content");
  const afterClears = stdout.get();
  expect(afterClears).toBe(ansiEscapes.eraseLines(0) + "New content\n"); // Should do a fresh write
});

/**
 * Verifies that `sync()` does not write to stdout, and subsequent `render`
 * correctly uses incremental logic (surgical update).
 */
test("incremental rendering - sync() followed by update (assert incremental path is used)", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render.sync("Line 1\nLine 2\nLine 3");
  expect(stdout.callCount()).toBe(0); // The sync() call shouldn't write to stdout

  render("Line 1\nUpdated\nLine 3");
  expect(stdout.callCount()).toBe(1);

  const firstCall = stdout.firstCall();
  expect(firstCall.includes(ansiEscapes.cursorNextLine)).toBeTrue(); // Skips unchanged lines
  expect(firstCall.includes("Updated")).toBeTrue(); // Only updates changed line
  expect(firstCall.includes("Line 1")).toBeFalse(); // Doesn't rewrite unchanged
  expect(firstCall.includes("Line 3")).toBeFalse(); // Doesn't rewrite unchanged
});

/**
 * Verifies rendering an empty string clears the output but avoids writing
 * redundant clear codes if repeated.
 */
test("incremental rendering - render to empty string (full clear vs early exit)", () => {
  const stdout = createStdout();
  const render = logUpdate.create(stdout, { incremental: true });

  render("Line 1\nLine 2\nLine 3");
  render("");

  expect(stdout.callCount()).toBe(2);
  expect(stdout.secondCall()).toBe(ansiEscapes.eraseLines(4) + "\n"); // Erases all 4 lines + writes single newline

  // Rendering empty string again should be skipped (identical output)
  render("");
  expect(stdout.callCount()).toBe(2); // No additional write
});
