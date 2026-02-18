import { test, expect } from "bun:test";
import stripAnsi from "strip-ansi";
import { term } from "./helpers/term.js";

/**
 * Verifies that the `useInput` hook can capture lowercase keypresses.
 */
test("useInput - handle lowercase character", async () => {
  const ps = term("use-input", ["lowercase"]);
  ps.write("q");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` can capture uppercase keypresses.
 */
test("useInput - handle uppercase character", async () => {
  const ps = term("use-input", ["uppercase"]);
  ps.write("Q");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that carriage return (`\r`) is distinct from an uppercase character
 * in input handling. This ensures that Enter doesn't accidentally trigger
 * uppercase logic.
 */
test("useInput - \\r should not count as an uppercase character", async () => {
  const ps = term("use-input", ["uppercase"]);
  ps.write("\r");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that pasted text beginning with a carriage return is handled
 * correctly by `useInput`.
 */
test("useInput - pasted carriage return", async () => {
  const ps = term("use-input", ["pastedCarriageReturn"]);
  ps.write("\rtest");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that pasted text beginning with a tab is handled correctly.
 */
test("useInput - pasted tab", async () => {
  const ps = term("use-input", ["pastedTab"]);
  ps.write("\ttest");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures the Escape key.
 */
test("useInput - handle escape", async () => {
  const ps = term("use-input", ["escape"]);
  ps.write("\u001B");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Ctrl key combinations (e.g., Ctrl+F
 * represented by \u0006).
 */
test("useInput - handle ctrl", async () => {
  const ps = term("use-input", ["ctrl"]);
  ps.write("\u0006");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Meta key combinations (e.g., Meta+m).
 */
test("useInput - handle meta", async () => {
  const ps = term("use-input", ["meta"]);
  ps.write("\u001Bm");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures the Up Arrow key.
 */
test("useInput - handle up arrow", async () => {
  const ps = term("use-input", ["upArrow"]);
  ps.write("\u001B[A");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures the Down Arrow key.
 */
test("useInput - handle down arrow", async () => {
  const ps = term("use-input", ["downArrow"]);
  ps.write("\u001B[B");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures the Left Arrow key.
 */
test("useInput - handle left arrow", async () => {
  const ps = term("use-input", ["leftArrow"]);
  ps.write("\u001B[D");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures the Right Arrow key.
 */
test("useInput - handle right arrow", async () => {
  const ps = term("use-input", ["rightArrow"]);
  ps.write("\u001B[C");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Meta + Up Arrow.
 */
test("useInput - handle meta + up arrow", async () => {
  const ps = term("use-input", ["upArrowMeta"]);
  ps.write("\u001B\u001B[A");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Meta + Down Arrow.
 */
test("useInput - handle meta + down arrow", async () => {
  const ps = term("use-input", ["downArrowMeta"]);
  ps.write("\u001B\u001B[B");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Meta + Left Arrow.
 */
test("useInput - handle meta + left arrow", async () => {
  const ps = term("use-input", ["leftArrowMeta"]);
  ps.write("\u001B\u001B[D");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Meta + Right Arrow.
 */
test("useInput - handle meta + right arrow", async () => {
  const ps = term("use-input", ["rightArrowMeta"]);
  ps.write("\u001B\u001B[C");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Ctrl + Up Arrow.
 */
test("useInput - handle ctrl + up arrow", async () => {
  const ps = term("use-input", ["upArrowCtrl"]);
  ps.write("\u001B[1;5A");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Ctrl + Down Arrow.
 */
test("useInput - handle ctrl + down arrow", async () => {
  const ps = term("use-input", ["downArrowCtrl"]);
  ps.write("\u001B[1;5B");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Ctrl + Left Arrow.
 */
test("useInput - handle ctrl + left arrow", async () => {
  const ps = term("use-input", ["leftArrowCtrl"]);
  ps.write("\u001B[1;5D");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Ctrl + Right Arrow.
 */
test("useInput - handle ctrl + right arrow", async () => {
  const ps = term("use-input", ["rightArrowCtrl"]);
  ps.write("\u001B[1;5C");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Page Down key.
 */
test("useInput - handle page down", async () => {
  const ps = term("use-input", ["pageDown"]);
  ps.write("\u001B[6~");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Page Up key.
 */
test("useInput - handle page up", async () => {
  const ps = term("use-input", ["pageUp"]);
  ps.write("\u001B[5~");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Home key.
 */
test("useInput - handle home", async () => {
  const ps = term("use-input", ["home"]);
  ps.write("\u001B[H");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures End key.
 */
test("useInput - handle end", async () => {
  const ps = term("use-input", ["end"]);
  ps.write("\u001B[F");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Tab key.
 */
test("useInput - handle tab", async () => {
  const ps = term("use-input", ["tab"]);
  ps.write("\t");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Shift + Tab key.
 */
test("useInput - handle shift + tab", async () => {
  const ps = term("use-input", ["shiftTab"]);
  ps.write("\u001B[Z");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Backspace key.
 */
test("useInput - handle backspace", async () => {
  const ps = term("use-input", ["backspace"]);
  ps.write("\u0008");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures Delete key.
 */
test("useInput - handle delete", async () => {
  const ps = term("use-input", ["delete"]);
  ps.write("\u007F");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` captures forward Delete (Remove) key.
 */
test("useInput - handle remove (delete)", async () => {
  const ps = term("use-input", ["remove"]);
  ps.write("\u001B[3~");
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that multiple components using `useInput` only receive input if they
 * are active (isActive=true). This checks that the `isActive` flag correctly
 * filters input capability.
 */
test("useInput - ignore input if not active", async () => {
  const ps = term("use-input-multiple");
  ps.write("x");
  await ps.waitForExit();
  expect(ps.output.includes("xx")).toBeFalse();
  expect(ps.output.includes("x")).toBeTrue();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useInput` can intercept Ctrl+C if `exitOnCtrlC` is set to
 * false in the `render` options or app config.
 * Normally Ctrl+C exits the process, but here it should be captured as input.
 */
test("useInput - handle Ctrl+C when `exitOnCtrlC` is `false`", async () => {
  const ps = term("use-input-ctrl-c");
  await new Promise((resolve) => setTimeout(resolve, 500));
  ps.write("\u0003"); // Ctrl+C
  await ps.waitForExit();
  expect(ps.output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useStdout` allows writing directly to stdout, bypassing React
 * rendering for certain output (like logs).
 */
test("useStdout - write to stdout", async () => {
  const ps = term("use-stdout");
  await ps.waitForExit();

  const lines = stripAnsi(ps.output).split(/\r?\n/);

  expect(lines.slice(1, -1)).toEqual([
    "Hello from Tinky to stdout",
    "Hello World",
    "exited",
  ]);
});

/**
 * Verifies that stdout writes still restore the interactive frame in run mode.
 */
test("useStdout - write to stdout in run mode", async () => {
  const ps = term("use-stdout-run");
  await ps.waitForExit();

  const output = stripAnsi(ps.output);
  expect(output.includes("Hello from run mode stdout")).toBeTrue();
  expect(output.includes("Hello Run Mode")).toBeTrue();
  expect(output.includes("exited")).toBeTrue();
});

/**
 * Verifies that `useStderr` allows writing errors directly to stderr.
 */
test("useStderr - write to stderr", async () => {
  const ps = term("use-stderr");
  await ps.waitForExit();
  expect(ps.output.includes("Error Output")).toBeTrue();
});

/**
 * Verifies that stderr writes still restore the interactive frame in run mode.
 */
test("useStderr - write to stderr in run mode", async () => {
  const ps = term("use-stderr-run");
  await ps.waitForExit();

  const output = stripAnsi(ps.output);
  expect(output.includes("Run mode error output")).toBeTrue();
  expect(output.includes("Run mode stderr")).toBeTrue();
});
