import { Suspense } from "react";
import { test, expect } from "bun:test";
import ansis from "ansis";
import { Box, Text, render } from "../src/index.js";
import { createStdout } from "./helpers/create-stdout.js";

/**
 * Verifies that the reconciler correctly updates a text node's content when
 * props change.
 */
test("update child", () => {
  function Test({ update }: { readonly update?: boolean }) {
    return <Text>{update ? "B" : "A"}</Text>;
  }

  const stdoutActual = createStdout();
  const stdoutExpected = createStdout();

  const actual = render(<Test />, {
    stdout: stdoutActual,
    debug: true,
  });

  const expected = render(<Text>A</Text>, {
    stdout: stdoutExpected,
    debug: true,
  });

  expect(stdoutActual.get()).toBe(stdoutExpected.get());

  actual.rerender(<Test update />);
  expected.rerender(<Text>B</Text>);

  expect(stdoutActual.get()).toBe(stdoutExpected.get());
});

/**
 * Verifies that the reconciler updates specific text nodes within a container
 * without affecting siblings.
 */
test("update text node", () => {
  function Test({ update }: { readonly update?: boolean }) {
    return (
      <Box>
        <Text>Hello </Text>
        <Text>{update ? "B" : "A"}</Text>
      </Box>
    );
  }

  const stdoutActual = createStdout();
  const stdoutExpected = createStdout();

  const actual = render(<Test />, {
    stdout: stdoutActual,
    debug: true,
  });

  const expected = render(<Text>Hello A</Text>, {
    stdout: stdoutExpected,
    debug: true,
  });

  expect(stdoutActual.get()).toBe(stdoutExpected.get());

  actual.rerender(<Test update />);
  expected.rerender(<Text>Hello B</Text>);

  expect(stdoutActual.get()).toBe(stdoutExpected.get());
});

/**
 * Verifies that the reconciler correctly appends a new child element to a
 * container.
 */
test("append child", () => {
  function Test({ append }: { readonly append?: boolean }) {
    if (append) {
      return (
        <Box flexDirection="column">
          <Text>A</Text>
          <Text>B</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text>A</Text>
      </Box>
    );
  }

  const stdoutActual = createStdout();
  const stdoutExpected = createStdout();

  const actual = render(<Test />, {
    stdout: stdoutActual,
    debug: true,
  });

  const expected = render(
    <Box flexDirection="column">
      <Text>A</Text>
    </Box>,
    {
      stdout: stdoutExpected,
      debug: true,
    },
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());

  actual.rerender(<Test append />);

  expected.rerender(
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());
});

/**
 * Verifies that the reconciler correctly inserts a new child element between
 * existing children.
 */
test("insert child between other children", () => {
  function Test({ insert }: { readonly insert?: boolean }) {
    if (insert) {
      return (
        <Box flexDirection="column">
          <Text key="a">A</Text>
          <Text key="b">B</Text>
          <Text key="c">C</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text key="a">A</Text>
        <Text key="c">C</Text>
      </Box>
    );
  }

  const stdoutActual = createStdout();
  const stdoutExpected = createStdout();

  const actual = render(<Test />, {
    stdout: stdoutActual,
    debug: true,
  });

  const expected = render(
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>C</Text>
    </Box>,
    {
      stdout: stdoutExpected,
      debug: true,
    },
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());

  actual.rerender(<Test insert />);

  expected.rerender(
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>,
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());
});

/**
 * Verifies that the reconciler correctly removes a child element.
 */
test("remove child", () => {
  function Test({ remove }: { readonly remove?: boolean }) {
    if (remove) {
      return (
        <Box flexDirection="column">
          <Text>A</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text>A</Text>
        <Text>B</Text>
      </Box>
    );
  }

  const stdoutActual = createStdout();
  const stdoutExpected = createStdout();

  const actual = render(<Test />, {
    stdout: stdoutActual,
    debug: true,
  });

  const expected = render(
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
    {
      stdout: stdoutExpected,
      debug: true,
    },
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());

  actual.rerender(<Test remove />);

  expected.rerender(
    <Box flexDirection="column">
      <Text>A</Text>
    </Box>,
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());
});

/**
 * Verifies that the reconciler correctly reorders children based on `key` props.
 */
test("reorder children", () => {
  function Test({ reorder }: { readonly reorder?: boolean }) {
    if (reorder) {
      return (
        <Box flexDirection="column">
          <Text key="b">B</Text>
          <Text key="a">A</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text key="a">A</Text>
        <Text key="b">B</Text>
      </Box>
    );
  }

  const stdoutActual = createStdout();
  const stdoutExpected = createStdout();

  const actual = render(<Test />, {
    stdout: stdoutActual,
    debug: true,
  });

  const expected = render(
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
    </Box>,
    {
      stdout: stdoutExpected,
      debug: true,
    },
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());

  actual.rerender(<Test reorder />);

  expected.rerender(
    <Box flexDirection="column">
      <Text>B</Text>
      <Text>A</Text>
    </Box>,
  );

  expect(stdoutActual.get()).toBe(stdoutExpected.get());
});

/**
 * Verifies that a child element can be replaced by a text node during
 * reconciliation.
 */
test("replace child node with text", () => {
  const stdout = createStdout();

  function Dynamic({ replace }: { readonly replace?: boolean }) {
    return <Text>{replace ? "x" : <Text color="green">test</Text>}</Text>;
  }

  const { rerender } = render(<Dynamic />, {
    stdout,
    debug: true,
  });

  expect(stdout.get()).toBe(ansis.green("test"));

  rerender(<Dynamic replace />);
  expect(stdout.get()).toBe("x");
});

/**
 * Verifies React Suspense integration, ensuring fallback content is displayed
 * while async operations are pending, and actual content is shown upon
 * resolution.
 */
test("support suspense", async () => {
  const stdout = createStdout();

  let promise: Promise<void> | undefined;
  let state: "pending" | "done" | undefined;
  let value: string | undefined;

  const read = () => {
    if (!promise) {
      promise = new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      state = "pending";

      (async () => {
        await promise;
        state = "done";
        value = "Hello World";
      })();
    }

    if (state === "done") {
      return value;
    }

    throw promise;
  };

  function Suspendable() {
    return <Text>{read()}</Text>;
  }

  function Test() {
    return (
      <Suspense fallback={<Text>Loading</Text>}>
        <Suspendable />
      </Suspense>
    );
  }

  const out = render(<Test />, {
    stdout,
    debug: true,
  });

  expect(stdout.get()).toBe("Loading");

  await promise;
  out.rerender(<Test />);

  expect(stdout.get()).toBe("Hello World");
});
