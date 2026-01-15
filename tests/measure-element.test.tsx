import { useState, useRef, useEffect } from "react";
import { test, expect } from "bun:test";
import delay from "delay";
import stripAnsi from "strip-ansi";
import {
  Box,
  Text,
  render,
  measureElement,
  type DOMElement,
} from "../src/index.js";
import { createStdout } from "./helpers/create-stdout.js";

/**
 * Verifies that `measureElement` can retrieve the dimensions of a rendered
 * element via a ref.
 */
test("measure element", async () => {
  const stdout = createStdout();

  function Test() {
    const [width, setWidth] = useState(0);
    const ref = useRef<DOMElement>(null);

    useEffect(() => {
      if (!ref.current) {
        return;
      }

      setWidth(measureElement(ref.current).width);
    }, []);

    return (
      <Box ref={ref}>
        <Text>Width: {width}</Text>
      </Box>
    );
  }

  render(<Test />, { stdout, debug: true });
  expect(stdout.get()).toBe("Width: 0");
  await delay(100);
  expect(stdout.get()).toBe("Width: 100");
});

/**
 * Verifies that `measureElement` works correctly even when rendering is
 * throttled or during layout updates.
 */
test("calculate layout while rendering is throttled", async () => {
  const stdout = createStdout();

  function Test() {
    const [width, setWidth] = useState(0);
    const ref = useRef<DOMElement>(null);

    useEffect(() => {
      if (!ref.current) {
        return;
      }

      setWidth(measureElement(ref.current).width);
    }, []);

    return (
      <Box ref={ref}>
        <Text>Width: {width}</Text>
      </Box>
    );
  }

  const { rerender } = render(null, { stdout, patchConsole: false });
  rerender(<Test />);
  await delay(100);

  expect(stripAnsi(stdout.get()).trim()).toBe("Width: 100");
});
