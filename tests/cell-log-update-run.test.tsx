import { test, expect } from "bun:test";
import ansiEscapes from "ansi-escapes";
import stringWidth from "string-width";
import { createStdout } from "./helpers/create-stdout.js";
import { CellBuffer, StyleRegistry } from "../src/core/cell-buffer.js";
import { cellLogUpdateRun } from "../src/core/cell-log-update-run.js";

const writeRow = (buffer: CellBuffer, text: string, styleId = 0) => {
  let x = 0;
  for (const ch of text) {
    const width = Math.max(1, stringWidth(ch));
    if (x + width > buffer.width) {
      break;
    }
    buffer.setCell(x, 0, ch, width, styleId);
    x += width;
  }
};

const createBuffer = (
  width: number,
  text: string,
  styleRegistry: StyleRegistry,
): CellBuffer => {
  const buffer = new CellBuffer({ width, height: 1 }, styleRegistry);
  buffer.clear();
  writeRow(buffer, text);
  return buffer;
};

test("run-diff updates only changed segments inside a row", () => {
  const styleRegistry = new StyleRegistry();
  const stdout = createStdout();
  const render = cellLogUpdateRun.create(stdout, { incremental: true });

  const previous = createBuffer(10, "z123456789", styleRegistry);
  const next = createBuffer(10, "a123456789", styleRegistry);

  render(previous, previous, { forceFull: true });
  render(previous, next);

  const secondCall = stdout.secondCall();
  expect(secondCall.includes("a")).toBeTrue();
  expect(secondCall.includes("123456789")).toBeFalse();
});

test("run-diff preserves wide-character boundaries", () => {
  const styleRegistry = new StyleRegistry();
  const stdout = createStdout();
  const render = cellLogUpdateRun.create(stdout, { incremental: true });

  const previous = createBuffer(8, "ab中cd", styleRegistry);
  const next = createBuffer(8, "ab文cd", styleRegistry);

  render(previous, previous, { forceFull: true });
  render(previous, next);

  const secondCall = stdout.secondCall();
  expect(secondCall.includes("ab文")).toBeTrue();
  expect(secondCall.includes("cd")).toBeFalse();
});

test("run-diff clears tail when next row is shorter", () => {
  const styleRegistry = new StyleRegistry();
  const stdout = createStdout();
  const render = cellLogUpdateRun.create(stdout, { incremental: true });

  const previous = createBuffer(8, "abcdef", styleRegistry);
  const next = createBuffer(8, "abc", styleRegistry);

  render(previous, previous, { forceFull: true });
  render(previous, next);

  const secondCall = stdout.secondCall();
  expect(secondCall.includes(ansiEscapes.eraseEndLine)).toBeTrue();
  expect(secondCall.includes("def")).toBeFalse();
});

test("run-diff falls back to full redraw when dimensions change", () => {
  const styleRegistry = new StyleRegistry();
  const stdout = createStdout();
  const render = cellLogUpdateRun.create(stdout, { incremental: true });

  const previous = createBuffer(5, "abcde", styleRegistry);
  const next = createBuffer(6, "abcdef", styleRegistry);

  render(previous, previous, { forceFull: true });
  render(previous, next);

  expect(stdout.secondCall()).toBe(ansiEscapes.eraseLines(2) + "abcdef\n");
});

test("run-diff full redraw clears previous frame and newline slot", () => {
  const styleRegistry = new StyleRegistry();
  const stdout = createStdout();
  const render = cellLogUpdateRun.create(stdout, { incremental: true });

  const previous = createBuffer(5, "abcde", styleRegistry);
  const next = createBuffer(5, "vwxyz", styleRegistry);

  render(previous, previous, { forceFull: true });
  render(previous, next, { forceFull: true });

  expect(stdout.secondCall()).toBe(ansiEscapes.eraseLines(2) + "vwxyz\n");
});

test("run-diff clear erases previous frame and newline slot", () => {
  const styleRegistry = new StyleRegistry();
  const stdout = createStdout();
  const render = cellLogUpdateRun.create(stdout, { incremental: true });

  const frame = createBuffer(5, "abcde", styleRegistry);
  render(frame, frame, { forceFull: true });
  render.clear();

  expect(stdout.secondCall()).toBe(ansiEscapes.eraseLines(2));
});

test("run-diff done does not clear the rendered frame", () => {
  const styleRegistry = new StyleRegistry();
  const stdout = createStdout();
  const render = cellLogUpdateRun.create(stdout, { incremental: true });

  const frame = createBuffer(5, "abcde", styleRegistry);
  render(frame, frame, { forceFull: true });
  render.done();

  expect(stdout.callCount()).toBe(1);
  expect(stdout.firstCall()).toBe("abcde\n");
});
