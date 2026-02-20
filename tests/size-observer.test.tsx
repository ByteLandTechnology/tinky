import { useState, useEffect } from "react";
import { test, expect } from "bun:test";
import delay from "delay";
import { Box, Text, render, useSizeObserver } from "../src/index.js";
import { SizeObserver } from "../src/core/size-observer.js";
import { createNode } from "../src/core/dom.js";
import { createStdout } from "./helpers/create-stdout.js";
import { type TaffyNode } from "../src/core/taffy-node.js";

/**
 * Verifies that `useSizeObserver` reports the initial dimensions of an element.
 */
test("reports initial element dimensions", async () => {
  const stdout = createStdout();

  function Test() {
    const [ref, width, height] = useSizeObserver();

    return (
      <Box ref={ref}>
        <Text>
          {width}x{height}
        </Text>
      </Box>
    );
  }

  render(<Test />, { stdout, debug: true });
  expect(stdout.get()).toBe("100x1");
  await delay(100);
  expect(stdout.get()).toBe("100x1");
});

/**
 * Verifies that `useSizeObserver` updates when element size changes.
 */
test("updates when element size changes", async () => {
  const stdout = createStdout();

  function Test() {
    const [ref, width, height] = useSizeObserver();
    const [wide, setWide] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setWide(true);
      }, 150);

      return () => clearTimeout(timer);
    }, []);

    return (
      <Box ref={ref} width={wide ? 50 : 20} height={wide ? 5 : 3}>
        <Text>
          {width}x{height}
        </Text>
      </Box>
    );
  }

  render(<Test />, { stdout, debug: true });
  await delay(100);
  expect(stdout.get().trim()).toBe("20x3");

  await delay(200);
  expect(stdout.get().trim()).toBe("50x5");
});

/**
 * Verifies that `useSizeObserver` respects `isActive: false`.
 */
test("respects isActive option", async () => {
  const stdout = createStdout();

  function Test() {
    const [ref, width, height] = useSizeObserver({ isActive: false });

    return (
      <Box ref={ref}>
        <Text>
          {width}x{height}
        </Text>
      </Box>
    );
  }

  render(<Test />, { stdout, debug: true });
  await delay(100);
  // Should stay at initial 0x0 since observer is inactive
  expect(stdout.get()).toBe("0x0");
});

/**
 * Verifies that `useSizeObserver` detects size changes caused by a sibling
 * component updating — i.e. the observer component itself does NOT re-render,
 * but the observed element's layout changes due to a sibling taking more space.
 */
test("detects size change caused by sibling update", async () => {
  const stdout = createStdout();
  const observed: string[] = [];

  function Observer() {
    const [ref, width] = useSizeObserver();

    useEffect(() => {
      observed.push(String(width));
    });

    return (
      <Box ref={ref} flexGrow={1}>
        <Text>W:{width}</Text>
      </Box>
    );
  }

  function Sibling({ wide }: { wide: boolean }) {
    return (
      <Box width={wide ? 60 : 10}>
        <Text>{wide ? "wide" : "narrow"}</Text>
      </Box>
    );
  }

  function App() {
    const [wide, setWide] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setWide(true);
      }, 150);

      return () => clearTimeout(timer);
    }, []);

    return (
      <Box width={100}>
        <Observer />
        <Sibling wide={wide} />
      </Box>
    );
  }

  render(<App />, { stdout, debug: true });
  await delay(100);

  // Observer fills remaining space: 100 - 10 = 90
  expect(observed).toContain("90");

  await delay(200);

  // After sibling grows: 100 - 60 = 40
  expect(observed).toContain("40");
});

/**
 * Verifies that removing an observed element does not crash layout observer
 * notification.
 */
test("does not crash when observed element unmounts", async () => {
  const stdout = createStdout();

  function Observed() {
    const [ref, width, height] = useSizeObserver();

    return (
      <Box ref={ref}>
        <Text>
          {width}x{height}
        </Text>
      </Box>
    );
  }

  function App() {
    const [show, setShow] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setShow(false);
      }, 150);

      return () => clearTimeout(timer);
    }, []);

    return <Box>{show ? <Observed /> : <Text>gone</Text>}</Box>;
  }

  const app = render(<App />, { stdout, debug: true });

  await delay(300);
  expect(stdout.get().trim()).toContain("gone");

  app.unmount();
});

/**
 * Verifies that `useSizeObserver` registers once the ref target appears after
 * initial mount.
 */
test("attaches when observed element mounts later", async () => {
  const stdout = createStdout();
  const observed: string[] = [];

  function App() {
    const [show, setShow] = useState(false);
    const [ref, width, height] = useSizeObserver();

    useEffect(() => {
      observed.push(`${width}x${height}`);
    }, [width, height]);

    useEffect(() => {
      const timer = setTimeout(() => {
        setShow(true);
      }, 150);

      return () => clearTimeout(timer);
    }, []);

    return (
      <Box>
        {show ? (
          <Box ref={ref} width={30} height={2}>
            <Text>box</Text>
          </Box>
        ) : (
          <Text>wait</Text>
        )}
      </Box>
    );
  }

  const app = render(<App />, { stdout, debug: true });

  await delay(300);
  expect(observed).toContain("30x2");

  app.unmount();
});

/**
 * Verifies that `SizeObserver` returns an array of entries with target and dimension,
 * and passes the observer itself as the second callback argument.
 */
test("SizeObserver callback receives entries and observer", async () => {
  let callCount = 0;
  const node1 = createNode("tinky-box");
  const node2 = createNode("tinky-box");

  // We mock the taffy node so it doesn't affect the real tree
  const mockTaffyNode1 = {
    id: BigInt(1),
    tree: {
      getLayout: () => ({ width: 10, height: 20 }),
    },
  } as unknown as TaffyNode;

  const mockTaffyNode2 = {
    id: BigInt(2),
    tree: {
      getLayout: () => ({ width: 30, height: 40 }),
    },
  } as unknown as TaffyNode;

  node1.taffyNode = mockTaffyNode1;
  node2.taffyNode = mockTaffyNode2;

  const observer = new SizeObserver((entries, obs) => {
    expect(obs).toBe(observer);
    expect(entries.length).toBe(2);

    const targets = entries.map((e) => e.target);
    expect(targets).toContain(node1);
    expect(targets).toContain(node2);

    const entry1 = entries.find((e) => e.target === node1);
    if (entry1) {
      expect(entry1.dimension).toEqual({ width: 10, height: 20 });
    }

    const entry2 = entries.find((e) => e.target === node2);
    if (entry2) {
      expect(entry2.dimension).toEqual({ width: 30, height: 40 });
    }

    callCount++;
  });

  observer.observe(node1);
  observer.observe(node2);

  const mod = await import("../src/core/size-observer.js");
  mod.notifySizeObservers();

  expect(callCount).toBe(1);

  observer.disconnect();
  // Clean up
  node1.taffyNode = undefined;
  node2.taffyNode = undefined;
});

/**
 * Verifies that SizeObserver.disconnect() removes all observations for the observer.
 */
test("SizeObserver disconnects correctly", async () => {
  let callCount = 0;
  const node = createNode("tinky-box");

  const observer = new SizeObserver(() => {
    callCount++;
  });

  observer.observe(node);
  observer.disconnect();

  node.taffyNode = {
    id: BigInt(1),
    tree: {
      getLayout: () => ({ width: 10, height: 10 }),
    },
  } as unknown as TaffyNode;

  const mod = await import("../src/core/size-observer.js");
  mod.notifySizeObservers();

  // Shouldn't be called because disconnected
  expect(callCount).toBe(0);
  node.taffyNode = undefined;
});
