import { type ReactNode, useState } from "react";
import FakeTimers from "@sinonjs/fake-timers";
import { stub } from "sinon";
import { test, expect } from "bun:test";
import ansiEscapes from "ansi-escapes";
import stripAnsi from "strip-ansi";
import boxen from "boxen";
import delay from "delay";
import { render, Box, Text, useInput } from "../src/index.js";
import { type RenderMetrics } from "../src/core/tinky.js";
import { createStdout } from "./helpers/create-stdout.js";
import { createStdin } from "./helpers/create-stdin.js";
import { term } from "./helpers/term.js";

/**
 * Verifies that screen is NOT erased when the output height matches the
 * terminal height, preserving history.
 */
test("do not erase screen", async () => {
  const ps = term("erase", ["4"]);
  await ps.waitForExit();
  expect(ps.output.includes(ansiEscapes.clearTerminal)).toBeFalse();

  for (const letter of ["A", "B", "C"]) {
    expect(ps.output.includes(letter)).toBeTrue();
  }
});

/**
 * Verifies that screen is not erased even if a `<Static>` component (which
 * writes to history) is taller than the viewport, as long as the active output
 * fits.
 */
test("do not erase screen where <Static> is taller than viewport", async () => {
  const ps = term("erase-with-static", ["4"]);

  await ps.waitForExit();
  expect(ps.output.includes(ansiEscapes.clearTerminal)).toBeFalse();

  for (const letter of ["A", "B", "C", "D", "E", "F"]) {
    expect(ps.output.includes(letter)).toBeTrue();
  }
});

/**
 * Verifies that the screen IS erased (switched to alternate screen buffer
 * behavior or cleared) when the output exceeds the terminal viewport height.
 */
test("erase screen", async () => {
  const ps = term("erase", ["3"]);
  await ps.waitForExit();
  expect(ps.output.includes(ansiEscapes.clearTerminal)).toBeTrue();

  for (const letter of ["A", "B", "C"]) {
    expect(ps.output.includes(letter)).toBeTrue();
  }
});

/**
 * Verifies that screen is erased when the interactive part of the output is
 * taller than the viewport, even if `<Static>` items are present.
 */
test("erase screen where <Static> exists but interactive part is taller than viewport", async () => {
  const ps = term("erase", ["3"]);
  await ps.waitForExit();
  expect(ps.output.includes(ansiEscapes.clearTerminal)).toBeTrue();

  for (const letter of ["A", "B", "C"]) {
    expect(ps.output.includes(letter)).toBeTrue();
  }
});

/**
 * Verifies that screen is NOT erased when state updates occur within a viewport
 * large enough to hold the content. Instead, it should use cursor manipulation
 * to update in place.
 */
test("erase screen where state changes", async () => {
  const ps = term("erase-with-state-change", ["4"]);
  await ps.waitForExit();

  // The final frame is between the last eraseLines sequence and cursorShow
  // Split on cursorShow to isolate the final rendered content before the cursor is shown
  const beforeCursorShow = ps.output.split(ansiEscapes.cursorShow)[0];
  if (!beforeCursorShow) {
    expect().fail("beforeCursorShow is undefined");
    return;
  }

  // Find the last occurrence of an eraseLines sequence
  // eraseLines(1) is the minimal erase pattern used by Tinky
  const eraseLinesPattern = ansiEscapes.eraseLines(1);
  const lastEraseIndex = beforeCursorShow.lastIndexOf(eraseLinesPattern);

  const lastFrame =
    lastEraseIndex === -1
      ? beforeCursorShow
      : beforeCursorShow.slice(lastEraseIndex + eraseLinesPattern.length);

  const lastFrameContent = stripAnsi(lastFrame);

  for (const letter of ["A", "B", "C"]) {
    expect(lastFrameContent.includes(letter)).toBeFalse();
  }
});

/**
 * Verifies that the screen IS erased (cleared) when state changes occur in a
 * viewport too small for the content, forcing a clear-and-redraw instead of
 * in-place update.
 */
test("erase screen where state changes in small viewport", async () => {
  const ps = term("erase-with-state-change", ["3"]);
  await ps.waitForExit();

  const frames = ps.output.split(ansiEscapes.clearTerminal);
  const lastFrame = frames.at(-1);

  for (const letter of ["A", "B", "C"]) {
    expect(lastFrame?.includes(letter)).toBeFalse();
  }
});

/**
 * Verifies that using fullscreen mode does not add unnecessary newlines at the
 * bottom, ensuring the layout fits perfectly within specific dimensions.
 */
test("fullscreen mode should not add extra newline at the bottom", async () => {
  const ps = term("fullscreen-no-extra-newline", ["5"]);
  await ps.waitForExit();

  expect(ps.output.includes("Bottom line")).toBeTrue();

  const lastFrame = ps.output.split(ansiEscapes.clearTerminal).at(-1) ?? "";

  // Check that the bottom line is at the end without extra newlines
  // In a 5-line terminal:
  // Line 1: Fullscreen: top
  // Lines 2-4: empty (from flexGrow)
  // Line 5: Bottom line (should be usable)
  const lines = lastFrame.split("\n");

  expect(lines.length, "Should have exactly 5 lines for 5-row terminal").toBe(
    5,
  );

  expect(
    lines[4]?.includes("Bottom line") ?? false,
    "Bottom line should be on line 5",
  ).toBeTrue();
});

/**
 * Verifies use of `clear()` to manually clear the previous output, removing it
 * from view.
 */
test("clear output", async () => {
  const ps = term("clear");
  await ps.waitForExit();

  const secondFrame = ps.output.split(ansiEscapes.eraseLines(4))[1];

  for (const letter of ["A", "B", "C"]) {
    expect(secondFrame?.includes(letter)).toBeFalse();
  }
});

/**
 * Verifies that console methods (log, error, etc.) are intercepted and
 * displayed nicely above the active Tinky output, preserving both.
 */
test("intercept console methods and display result above output", async () => {
  const ps = term("console");
  await ps.waitForExit();

  const frames = ps.output
    .split(ansiEscapes.eraseLines(2))
    .map((line) => stripAnsi(line));

  expect(frames.some((frame) => frame.includes("Hello World"))).toBeTrue();
  expect(frames.some((frame) => frame.includes("First log"))).toBeTrue();
  expect(frames.some((frame) => frame.includes("Second log"))).toBeTrue();
});

/**
 * Verifies that the app re-renders when the terminal is resized.
 */
test("rerender on resize", async () => {
  const stdout = createStdout(10);

  function Test() {
    return (
      <Box borderStyle="round">
        <Text>Test</Text>
      </Box>
    );
  }

  const { unmount } = render(<Test />, { stdout });

  expect(stripAnsi(stdout.get())).toBe(
    boxen("Test".padEnd(8), { borderStyle: "round" }) + "\n",
  );

  expect(stdout.listeners("resize").length).toBe(1);

  stdout.columns = 8;
  stdout.emit("resize");
  await delay(100);

  expect(stripAnsi(stdout.get())).toBe(
    boxen("Test".padEnd(6), { borderStyle: "round" }) + "\n",
  );

  unmount();
  expect(stdout.listeners("resize").length).toBe(0);
});

function ThrottleTestComponent({ text }: { readonly text: string }) {
  return <Text>{text}</Text>;
}

/**
 * Verifies that rendering is throttled according to `maxFps` to prevent
 * excessive writes.
 */
test("throttle renders to maxFps", () => {
  const clock = FakeTimers.install(); // Controls timers + Date.now()
  try {
    const stdout = createStdout();

    const { unmount, rerender } = render(
      <ThrottleTestComponent text="Hello" />,
      {
        stdout,
        maxFps: 1, // 1 Hz => ~1000 ms window
      },
    );

    // Initial render (leading call)
    expect(stdout.callCount()).toBe(1);
    expect(stripAnsi(stdout.get())).toBe("Hello\n");

    // Trigger another render inside the throttle window
    rerender(<ThrottleTestComponent text="World" />);
    expect(stdout.callCount()).toBe(1);

    // Advance 999 ms: still within window, no trailing call yet
    clock.tick(999);
    expect(stdout.callCount()).toBe(1);

    // Cross the boundary: trailing render fires once
    clock.tick(1);
    expect(stdout.callCount()).toBe(2);
    expect(stripAnsi(stdout.get())).toBe("World\n");

    unmount();
  } finally {
    clock.uninstall();
  }
});

/**
 * Verifies that the `onRender` callback provides execution metrics like
 * `renderTime`.
 */
test("outputs renderTime when onRender is passed", async () => {
  const renderTimes: number[] = [];
  const functor = {
    onRender(metrics: RenderMetrics) {
      const { renderTime } = metrics;
      renderTimes.push(renderTime);
    },
  };

  const onRenderStub = stub(functor, "onRender").callThrough();

  function Test({ children }: { readonly children?: ReactNode }) {
    const [text, setText] = useState("Test");

    useInput((input) => {
      setText(input);
    });

    return (
      <Box borderStyle="round">
        <Text>{text}</Text>
        {children}
      </Box>
    );
  }

  const stdin = createStdin();
  const { unmount, rerender } = render(<Test />, {
    onRender: onRenderStub,
    stdin,
  });

  // Initial render
  expect(onRenderStub.callCount).toBe(1);
  expect(renderTimes[0] >= 0).toBeTrue();

  // Manual rerender
  onRenderStub.resetHistory();
  rerender(
    <Test>
      <Text>Updated</Text>
    </Test>,
  );
  await delay(100);
  expect(onRenderStub.callCount).toBe(1);
  expect(renderTimes[1] >= 0).toBeTrue();

  // Internal state update via useInput
  onRenderStub.resetHistory();
  stdin.emitReadable("a");
  await delay(100);
  expect(onRenderStub.callCount).toBe(1);
  expect(renderTimes[2] >= 0).toBeTrue();

  // Verify all renders were tracked
  expect(renderTimes.length).toBe(3);

  unmount();
});

/**
 * Verifies that no additional renders occur after unmounting, even if pending
 * throttled updates were queued (regression test).
 */
test("no throttled renders after unmount", () => {
  const clock = FakeTimers.install();
  try {
    const stdout = createStdout();

    const { unmount, rerender } = render(<ThrottleTestComponent text="Foo" />, {
      stdout,
    });

    expect(stdout.callCount()).toBe(1);

    rerender(<ThrottleTestComponent text="Bar" />);
    rerender(<ThrottleTestComponent text="Baz" />);
    unmount();

    const callCountAfterUnmount = stdout.callCount();

    clock.tick(1000);
    expect(stdout.callCount()).toBe(callCountAfterUnmount);
  } finally {
    clock.uninstall();
  }
});
