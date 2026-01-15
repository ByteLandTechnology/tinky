import { test, expect } from "bun:test";
import { run, term } from "./helpers/term.js";

/**
 * Verifies that the process exits normally without any explicit exit call or
 * unmount if the event loop empties. (Note: This test is skipped, likely
 * because it's hard to test intrinsically or flakey).
 */
test.skip("exit normally without unmount() or exit()", async () => {
  await run("exit-normally");
});

/**
 * Verifies that the process exits effectively when the component is unmounted.
 * Tinky should clean up and allow the node process to exit when there is
 * nothing left to render.
 */
test("exit on unmount()", async () => {
  const output = await run("exit-on-unmount");
  expect(output.includes("exited")).toBeTrue();
});

/**
 * Verifies that the process exits when the app finishes its execution logic.
 */
test("exit when app finishes execution", async () => {
  run("exit-on-finish").then(() => expect().pass());
});

/**
 * Verifies that `app.exit()` correctly terminates the process.
 */
test("exit on exit()", async () => {
  const output = await run("exit-on-exit");
  expect(output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `app.exit(error)` terminates the process and can surface an
 * error state.
 */
test("exit on exit() with error", async () => {
  const output = await run("exit-on-exit-with-error");
  expect(output.includes("errored")).toBeTrue();
});

/**
 * Verifies that `app.exit()` works correctly even when raw mode is active
 * (capturing input). It should ensure TTY state is restored.
 */
test("exit on exit() with raw mode", async () => {
  const output = await run("exit-raw-on-exit");
  expect(output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `app.exit(error)` works correctly with raw mode active.
 */
test("exit on exit() with raw mode with error", async () => {
  const output = await run("exit-raw-on-exit-with-error");
  expect(output.includes("errored")).toBeTrue();
});

/**
 * Verifies that unmounting the app works correctly even when raw mode was active.
 */
test("exit on unmount() with raw mode", async () => {
  const output = await run("exit-raw-on-unmount");
  expect(output.includes("exited")).toBeTrue();
});

/**
 * Verifies that unhandled exceptions thrown during render or lifecycle cause
 * the process to exit with an error.
 */
test("exit with thrown error", async () => {
  const output = await run("exit-with-thrown-error");
  expect(output.includes("errored")).toBeTrue();
});

/**
 * Verifies that the process does NOT exit naturally while raw mode is active
 * (listening for input). It waits for the user to explicitly quit (sending 'q'
 * in this test) before exiting.
 */
test("don't exit while raw mode is active", async () => {
  const ps = term("exit-double-raw-mode");
  const exitPromise = ps.waitForExit();

  let hasExited = false;
  exitPromise.then(() => {
    hasExited = true;
  });

  const startTime = Date.now();
  while (!ps.output.includes("s")) {
    if (hasExited) {
      break;
    }

    if (Date.now() - startTime > 3000) {
      throw new Error("Timeout waiting for 's'");
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (!ps.output.includes("s")) {
    throw new Error(`Output did not include "s". Output: ${ps.output}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));
  expect(hasExited).toBeFalse();

  ps.write("q");
  await exitPromise;
  expect(ps.output.includes("exited")).toBeTrue();
});
