import { test, expect, beforeAll, afterAll } from "bun:test";
import { patchConsole } from "../src/patch-console.js";
import stripAnsi from "strip-ansi";
import { render } from "../src/index.js";
import { createStdout } from "./helpers/create-stdout.js";

let restore = () => {
  // no-op
};

beforeAll(() => {
  restore = patchConsole(() => {
    // no-op
  });
});

afterAll(() => {
  restore();
});

/**
 * Verifies that errors thrown during rendering are caught and displayed in the
 * output. It checks if the stack trace includes the component name and
 * location.
 */
test("catch and display error", () => {
  const stdout = createStdout();

  function Test() {
    throw new Error("Oh no");
    return <></>;
  }

  render(<Test />, { stdout });
  const output = stripAnsi(stdout.get()).split("\n");
  const stackLine = output.find((line) => line.includes(" - Test"));
  expect(stackLine).toBeDefined();
  expect(stackLine).toMatch(/ - Test \(.*tests\/errors\.test\.tsx:\d+:\d+\)/);
});
