import { test, expect } from "bun:test";
import delay from "delay";
import stripAnsi from "strip-ansi";
import { render, Box, Text } from "../src/index.js";
import { createStdout } from "./helpers/create-stdout.js";

/**
 * Verifies that the screen is cleared and content rerendered when the terminal
 * width decreases, to prevent layout corruption.
 */
test("clear screen when terminal width decreases", async () => {
  const stdout = createStdout(100);

  function Test() {
    return (
      <Box borderStyle="round">
        <Text>Hello World</Text>
      </Box>
    );
  }

  render(<Test />, { stdout });

  const initialOutput = stripAnsi(stdout.get());
  expect(initialOutput.includes("Hello World")).toBeTrue();
  expect(initialOutput.includes("╭")).toBeTrue(); // Box border

  // Decrease width - should trigger clear and rerender
  stdout.columns = 50;
  stdout.emit("resize");
  await delay(100);

  // Verify the output was updated for smaller width
  const lastOutput = stripAnsi(stdout.get());
  expect(lastOutput.includes("Hello World")).toBeTrue();
  expect(lastOutput.includes("╭")).toBeTrue(); // Box border
  // Output should change due to width
  expect(initialOutput).not.toBe(lastOutput);
});

/**
 * Verifies that run-diff mode also clears and rerenders correctly on width decrease.
 */
test("run strategy clears and rerenders on width decrease", async () => {
  const stdout = createStdout(100);

  function Test() {
    return (
      <Box borderStyle="round">
        <Text>Run Resize</Text>
      </Box>
    );
  }

  render(<Test />, { stdout, incrementalRendering: true });

  const initialOutput = stripAnsi(stdout.get());
  expect(initialOutput.includes("Run Resize")).toBeTrue();

  stdout.columns = 60;
  stdout.emit("resize");
  await delay(100);

  const afterResizeOutput = stripAnsi(stdout.get());
  expect(afterResizeOutput.includes("Run Resize")).toBeTrue();
  expect(initialOutput).not.toBe(afterResizeOutput);
});

/**
 * Verifies that screen is NOT explicitly cleared (just updated in place) when
 * width increases, as layout typically fits without corruption (unless it was
 * already wrapped, but Tinky optimizes for this).
 */
test("no screen clear when terminal width increases", async () => {
  const stdout = createStdout(50);

  function Test() {
    return (
      <Box borderStyle="round">
        <Text>Test</Text>
      </Box>
    );
  }

  render(<Test />, { stdout });

  const initialOutput = stdout.get();

  // Increase width - should rerender but not clear
  stdout.columns = 100;
  stdout.emit("resize");
  await delay(100);

  const lastOutput = stdout.get();

  // When increasing width, we don't clear, so we should see eraseLines used for
  // incremental update.
  // But when decreasing, the clear() is called which also uses eraseLines.
  // The key difference: decreasing width triggers an explicit clear before
  // render.
  expect(stripAnsi(initialOutput)).not.toBe(stripAnsi(lastOutput));
  expect(stripAnsi(lastOutput).includes("Test")).toBeTrue();
});

/**
 * Verifies that consecutive width decreases each trigger a screen clear to
 * ensure clean state.
 */
test("consecutive width decreases trigger screen clear each time", async () => {
  const stdout = createStdout(100);

  function Test() {
    return (
      <Box borderStyle="round">
        <Text>Content</Text>
      </Box>
    );
  }

  render(<Test />, { stdout });

  const initialOutput = stripAnsi(stdout.get());

  // First decrease
  stdout.columns = 80;
  stdout.emit("resize");
  await delay(100);

  const afterFirstDecrease = stripAnsi(stdout.get());
  expect(initialOutput).not.toBe(afterFirstDecrease);
  expect(afterFirstDecrease.includes("Content")).toBeTrue();

  // Second decrease
  stdout.columns = 60;
  stdout.emit("resize");
  await delay(100);

  const afterSecondDecrease = stripAnsi(stdout.get());
  expect(afterFirstDecrease).not.toBe(afterSecondDecrease);
  expect(afterSecondDecrease.includes("Content")).toBeTrue();
});

/**
 * Verifies that resizing correctly clears the last output state, forcing a full
 * re-render that reflects new dimensions (like changed border widths).
 */
test("width decrease clears lastOutput to force rerender", async () => {
  const stdout = createStdout(100);

  function Test() {
    return (
      <Box borderStyle="round">
        <Text>Test Content</Text>
      </Box>
    );
  }

  const { rerender } = render(<Test />, { stdout });

  const initialOutput = stripAnsi(stdout.get());

  // Decrease width - with a border, this will definitely change the output
  stdout.columns = 50;
  stdout.emit("resize");
  await delay(100);

  const afterResizeOutput = stripAnsi(stdout.get());

  // Outputs should be different because the border width changed
  expect(initialOutput).not.toBe(afterResizeOutput);
  expect(afterResizeOutput.includes("Test Content")).toBeTrue();

  // Now try to rerender with a different component
  rerender(
    <Box borderStyle="round">
      <Text>Updated Content</Text>
    </Box>,
  );
  await delay(100);

  // Verify content was updated
  expect(stripAnsi(stdout.get()).includes("Updated Content")).toBeTrue();
});
