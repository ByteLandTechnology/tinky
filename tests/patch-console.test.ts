import { test, expect, describe, afterEach, beforeEach } from "bun:test";
import { patchConsole } from "../src/patch-console.js";

describe("patchConsole", () => {
  let restore: (() => void) | undefined;
  let output: string[] = [];
  let errorOutput: string[] = [];

  beforeEach(() => {
    output = [];
    errorOutput = [];
  });

  afterEach(() => {
    if (restore) {
      restore();
      restore = undefined;
    }
  });

  /**
   * Verifies that `console.log` is intercepted and directed to stdout.
   */
  test("should intercept console.log", () => {
    restore = patchConsole((stream, data) => {
      if (stream === "stdout") output.push(data);
    });

    console.log("foo");
    expect(output).toEqual(["foo"]);
  });

  /**
   * Verifies that `console.error` is intercepted and directed to stderr.
   */
  test("should intercept console.error", () => {
    restore = patchConsole((stream, data) => {
      if (stream === "stderr") errorOutput.push(data);
    });

    console.error("bar");
    expect(errorOutput).toEqual(["bar"]);
  });

  /**
   * Verifies that arguments are formatted correctly using pattern matching substitute (e.g., %s).
   */
  test("should format arguments correctly", () => {
    restore = patchConsole((stream, data) => {
      if (stream === "stdout") output.push(data);
    });

    console.log("foo %s", "bar");
    expect(output).toEqual(["foo bar"]);
  });

  /**
   * Verifies that `console.assert` operates correctly:
   * - Does nothing if assertion passes.
   * - Logs to stderr if assertion fails.
   */
  test("should handle console.assert correctly", () => {
    restore = patchConsole((stream, data) => {
      if (stream === "stderr") errorOutput.push(data);
    });

    console.assert(true, "should not log");
    console.assert(false, "should log");

    expect(errorOutput).toEqual(["should log"]);
  });

  /**
   * Verifies that calling the restore function reverts console methods to their original implementation.
   */
  test("should restore original methods", () => {
    const originalLog = console.log;
    restore = patchConsole(() => {
      // no-op
    });

    // Check that it's patched (not strictly equal to original, though implementation details might vary)
    // We check strict inequality because the patched version wraps the original
    expect(console.log).not.toBe(originalLog);

    restore();
    expect(console.log).toBe(originalLog);
  });

  /**
   * Verifies that multiple arguments are concatenated correctly (space-separated).
   */
  test("should intercept multiple args", () => {
    restore = patchConsole((stream, data) => {
      if (stream === "stdout") output.push(data);
    });

    console.log("a", "b", "c");
    expect(output).toEqual(["a b c"]);
  });
});
