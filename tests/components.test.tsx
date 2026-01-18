import React, { Component, useState } from "react";
import { test, expect, beforeAll } from "bun:test";
import ansis from "ansis";
import { spy } from "sinon";
import ansiEscapes from "ansi-escapes";
import {
  Box,
  Newline,
  render,
  RenderOptions,
  Spacer,
  Static,
  Text,
  Transform,
  useStdin,
} from "../src/index.js";
import { createStdout } from "./helpers/create-stdout.js";
import { createStdin } from "./helpers/create-stdin.js";
import { renderToString } from "./helpers/render-to-string.js";
import { run } from "./helpers/term.js";

beforeAll(() => {
  ansis.level = 3;
});

/**
 * Verifies that the `<Text>` component renders simple string content correctly.
 */
test("text", () => {
  const output = renderToString(<Text>Hello World</Text>);

  expect(output).toBe("Hello World");
});

/**
 * Verifies that the `<Text>` component correctly renders interpolated variables.
 */
test("text with variable", () => {
  const output = renderToString(<Text>Count: {1}</Text>);

  expect(output).toBe("Count: 1");
});

/**
 * Verifies that multiple text nodes within a `<Text>` component are
 * concatenated correctly.
 */
test("multiple text nodes", () => {
  const output = renderToString(
    <Text>
      {"Hello"}
      {" World"}
    </Text>,
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that a `<Text>` component can contain other components that render
 * text.
 */
test("text with component", () => {
  function World() {
    return <Text>World</Text>;
  }

  const output = renderToString(
    <Text>
      Hello <World />
    </Text>,
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that fragments (`<>...</>`) within `<Text>` are handled correctly.
 */
test("text with fragment", () => {
  const output = renderToString(
    <Text>
      Hello <>World</> {}
    </Text>,
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that text wraps when it exceeds the container width and
 * `wrap="wrap"` is set.
 */
test("wrap text", () => {
  const output = renderToString(
    <Box width={7}>
      <Text wrap="wrap">Hello World</Text>
    </Box>,
  );

  expect(output).toBe("Hello\nWorld");
});

/**
 * Verifies that text does NOT wrap if there is sufficient space, even with
 * `wrap="wrap"`.
 */
test("don’t wrap text if there is enough space", () => {
  const output = renderToString(
    <Box width={20}>
      <Text wrap="wrap">Hello World</Text>
    </Box>,
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that text is truncated at the end with an ellipsis when
 * `wrap="truncate"`.
 */
test("truncate text in the end", () => {
  const output = renderToString(
    <Box width={7}>
      <Text wrap="truncate">Hello World</Text>
    </Box>,
  );

  expect(output).toBe("Hello …");
});

/**
 * Verifies that text is truncated in the middle with an ellipsis when
 * `wrap="truncate-middle"`.
 */
test("truncate text in the middle", () => {
  const output = renderToString(
    <Box width={7}>
      <Text wrap="truncate-middle">Hello World</Text>
    </Box>,
  );

  expect(output).toBe("Hel…rld");
});

/**
 * Verifies that text is truncated at the beginning with an ellipsis when
 * `wrap="truncate-start"`.
 */
test("truncate text in the beginning", () => {
  const output = renderToString(
    <Box width={7}>
      <Text wrap="truncate-start">Hello World</Text>
    </Box>,
  );

  expect(output).toBe("… World");
});

/**
 * Verifies that empty text nodes are ignored and do not affect the output.
 */
test("ignore empty text node", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Box>
        <Text>Hello World</Text>
      </Box>
      <Text>{""}</Text>
    </Box>,
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that a single empty text node renders as an empty string.
 */
test("render a single empty text node", () => {
  const output = renderToString(<Text>{""}</Text>);
  expect(output).toBe("");
});

/**
 * Verifies that numbers are correctly converted to strings when rendered inside
 * `<Text>`.
 */
test("number", () => {
  const output = renderToString(<Text>{1}</Text>);

  expect(output).toBe("1");
});

/**
 * Verifies that rendering raw text strings outside of a `<Text>` component
 * throws an error. All text content in Tinky must be wrapped in a `<Text>`
 * component.
 */
test("fail when text nodes are not within <Text> component", () => {
  let error: Error | undefined;

  class ErrorBoundary extends Component<
    { children?: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children?: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    override render() {
      return this.state.hasError ? null : this.props.children;
    }

    override componentDidCatch(reactError: Error) {
      error = reactError;
    }
  }

  renderToString(
    <ErrorBoundary>
      <Box>
        Hello
        <Text>World</Text>
      </Box>
    </ErrorBoundary>,
  );

  expect(error).toBeTruthy();
  expect(error?.message).toBe(
    'Text string "Hello" must be rendered inside <Text> component',
  );
});

/**
 * Verifies that rendering a text string directly inside a `<Box>` (without a
 * wrapper `<Text>`) throws an error.
 */
test("fail when text node is not within <Text> component", () => {
  let error: Error | undefined;

  class ErrorBoundary extends Component<
    { children?: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children?: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    override render() {
      return this.state.hasError ? null : this.props.children;
    }

    override componentDidCatch(reactError: Error) {
      error = reactError;
    }
  }

  renderToString(
    <ErrorBoundary>
      <Box>Hello World</Box>
    </ErrorBoundary>,
  );

  expect(error).toBeTruthy();
  expect(error?.message).toBe(
    'Text string "Hello World" must be rendered inside <Text> component',
  );
});

/**
 * Verifies that a `<Box>` cannot be nested inside a `<Text>` component.
 * `<Text>` components usually only accept string children or other `<Text>`
 * components.
 */
test("fail when <Box> is inside <Text> component", () => {
  let error: Error | undefined;

  class ErrorBoundary extends Component<
    { children?: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children?: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    override render() {
      return this.state.hasError ? null : this.props.children;
    }

    override componentDidCatch(reactError: Error) {
      error = reactError;
    }
  }

  renderToString(
    <ErrorBoundary>
      <Text>
        Hello World
        <Box />
      </Text>
    </ErrorBoundary>,
  );

  expect(error).toBeTruthy();
  expect((error as Error).message).toBe(
    "<Box> can’t be nested inside <Text> component",
  );
});

/**
 * Verifies that text dimensions are recalculated when text content changes.
 * This ensures layout updates correctly when data changes.
 */
test("remesure text dimensions on text change", () => {
  const stdout = createStdout();

  const { rerender } = render(
    <Box>
      <Text>Hello</Text>
    </Box>,
    { stdout, debug: true },
  );

  expect(stdout.get()).toBe("Hello");

  rerender(
    <Box>
      <Text>Hello World</Text>
    </Box>,
  );

  expect(stdout.get()).toBe("Hello World");
});

/**
 * Verifies that React fragments correctly render their children.
 */
test("fragment", () => {
  const output = renderToString(
    <>
      <Text>Hello World</Text>
    </>,
  );

  expect(output).toBe("Hello World");
});

/**
 * Verifies that the `<Transform>` component can intercept and modify text
 * rendered by its children. Both the outer and inner transforms should apply in
 * order.
 */
test("transform children", () => {
  const output = renderToString(
    <Transform
      transform={(string: string, index: number) => `[${index}: ${string}]`}
    >
      <Text>
        <Transform
          transform={(string: string, index: number) => `{${index}: ${string}}`}
        >
          <Text>test</Text>
        </Transform>
      </Text>
    </Transform>,
  );

  expect(output).toBe("[0: {0: test}]");
});

/**
 * Verifies that multiple text nodes within a `<Transform>` are squashed into a
 * single string before being transformed.
 */
test("squash multiple text nodes", () => {
  const output = renderToString(
    <Transform
      transform={(string: string, index: number) => `[${index}: ${string}]`}
    >
      <Text>
        <Transform
          transform={(string: string, index: number) => `{${index}: ${string}}`}
        >
          {/* prettier-ignore */}
          <Text>hello{' '}world</Text>
        </Transform>
      </Text>
    </Transform>,
  );

  expect(output).toBe("[0: {0: hello world}]");
});

/**
 * Verifies that `<Transform>` handles multi-line strings correctly.
 * The transformation function should receive each line independently if the
 * implementation splits by newline.
 */
test("transform with multiple lines", () => {
  const output = renderToString(
    <Transform
      transform={(string: string, index: number) => `[${index}: ${string}]`}
    >
      {/* prettier-ignore */}
      <Text>hello{' '}world{'\n'}goodbye{' '}world</Text>
    </Transform>,
  );

  expect(output).toBe("[0: hello world]\n[1: goodbye world]");
});

/**
 * Verifies that nested text nodes (string + `<Text>`) are squashed before
 * transformation.
 */
test("squash multiple nested text nodes", () => {
  const output = renderToString(
    <Transform
      transform={(string: string, index: number) => `[${index}: ${string}]`}
    >
      <Text>
        <Transform
          transform={(string: string, index: number) => `{${index}: ${string}}`}
        >
          hello
          <Text> world</Text>
        </Transform>
      </Text>
    </Transform>,
  );

  expect(output).toBe("[0: {0: hello world}]");
});

/**
 * Verifies that empty text nodes are squashed effectively to empty strings,
 * which might result in no output or transformed empty strings depending on
 * implementation.
 */
test("squash empty `<Text>` nodes", () => {
  const output = renderToString(
    <Transform transform={(string: string) => `[${string}]`}>
      <Text>
        <Transform transform={(string: string) => `{${string}}`}>
          <Text>{[]}</Text>
        </Transform>
      </Text>
    </Transform>,
  );

  expect(output).toBe("");
});

/**
 * Verifies that `<Transform>` handles undefined children gracefully.
 */
test("<Transform> with undefined children", () => {
  const output = renderToString(
    <Transform transform={(children) => children} />,
  );
  expect(output).toBe("");
});

/**
 * Verifies that `<Transform>` handles null children gracefully.
 */
test("<Transform> with null children", () => {
  const output = renderToString(
    <Transform transform={(children) => children} />,
  );
  expect(output).toBe("");
});

/**
 * Verifies that React hooks (like `useState`) work correctly within Tinky
 * components.
 */
test("hooks", () => {
  function WithHooks() {
    const [value] = useState("Hello");

    return <Text>{value}</Text>;
  }

  const output = renderToString(<WithHooks />);
  expect(output).toBe("Hello");
});

/**
 * Verifies the `<Static>` component functionality.
 * `<Static>` items should be printed to the output permanently (like logs)
 * above the active component.
 */
test("static output", () => {
  const output = renderToString(
    <Box>
      <Static items={["A", "B", "C"]} style={{ paddingBottom: 1 }}>
        {(letter) => <Text key={letter}>{letter}</Text>}
      </Static>

      <Box marginTop={1}>
        <Text>X</Text>
      </Box>
    </Box>,
  );

  expect(output).toBe("A\nB\nC\n\n\nX");
});

/**
 * Verifies that `<Static>` correctly updates its output when new items are added.
 * It should print new items but not reprint old items.
 */
test("skip previous output when rendering new static output", () => {
  const stdout = createStdout();

  function Dynamic({ items }: { readonly items: string[] }) {
    return (
      <Static items={items}>{(item) => <Text key={item}>{item}</Text>}</Static>
    );
  }

  const { rerender } = render(<Dynamic items={["A"]} />, {
    stdout,
    debug: true,
  });

  expect(stdout.get()).toBe("A\n");

  rerender(<Dynamic items={["A", "B"]} />);
  expect(stdout.get()).toBe("A\nB\n");
});

/**
 * Verifies that only new items are rendered by `<Static>` on the final
 * render/unmount.
 */
test("render only new items in static output on final render", () => {
  const stdout = createStdout();

  function Dynamic({ items }: { readonly items: string[] }) {
    return (
      <Static items={items}>{(item) => <Text key={item}>{item}</Text>}</Static>
    );
  }

  const { rerender, unmount } = render(<Dynamic items={[]} />, {
    stdout,
    debug: true,
  });

  expect(stdout.get()).toBe("");

  rerender(<Dynamic items={["A"]} />);
  expect(stdout.get()).toBe("A\n");

  rerender(<Dynamic items={["A", "B"]} />);
  unmount();
  expect(stdout.get()).toBe("A\nB\n");
});

/**
 * Verifies that `wrap-ansi` integration preserves leading whitespace.
 * Tinky relies on `wrap-ansi` for text wrapping, and it's critical that
 * indentation or deliberate spaces are not trimmed.
 */
test("ensure wrap-ansi doesn’t trim leading whitespace", () => {
  const output = renderToString(<Text color="red">{" ERROR "}</Text>);

  expect(output).toBe(ansis.red(" ERROR "));
});

/**
 * Verifies that replacing a component with a simple text node during re-render
 * works correctly.
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
 * Verifies that raw mode (for handling input) is disabled when all components
 * that requested it are unmounted. It ensures reference counting for raw mode
 * works correctly so that raw mode remains active as long as at least one
 * component needs it, and turns off when the last one is gone.
 */
test("disable raw mode when all input components are unmounted", () => {
  const stdout = createStdout();

  const stdin = createStdin(true);

  const options: RenderOptions = {
    stdout,
    stdin,
    debug: true,
  };

  class Input extends Component<{ setRawMode: (mode: boolean) => void }> {
    override render() {
      return <Text>Test</Text>;
    }

    override componentDidMount() {
      this.props.setRawMode(true);
    }

    override componentWillUnmount() {
      this.props.setRawMode(false);
    }
  }

  function Test({
    renderFirstInput,
    renderSecondInput,
  }: {
    readonly renderFirstInput?: boolean;
    readonly renderSecondInput?: boolean;
  }) {
    const { setRawMode } = useStdin();

    return (
      <>
        {renderFirstInput && <Input setRawMode={setRawMode} />}
        {renderSecondInput && <Input setRawMode={setRawMode} />}
      </>
    );
  }

  const { rerender } = render(
    <Test renderFirstInput renderSecondInput />,

    options,
  );

  expect(stdin.setRawModeCallCount()).toBe(1);
  expect(stdin.refCallCount()).toBe(1);
  expect(stdin.setRawModeFirstCallArgs()).toEqual([true]);

  rerender(<Test renderFirstInput />);

  expect(stdin.setRawModeCallCount()).toBe(1);
  expect(stdin.refCallCount()).toBe(1);
  expect(stdin.unrefCallCount()).toBe(0);

  rerender(<Test />);

  expect(stdin.setRawModeCallCount()).toBe(2);
  expect(stdin.refCallCount()).toBe(1);
  expect(stdin.unrefCallCount()).toBe(1);
  expect(stdin.setRawModeLastCallArgs()).toEqual([false]);
});

/**
 * Verifies that `setRawMode` throws an error if called in an environment where
 * raw mode is not supported (e.g., non-TTY).
 */
test("setRawMode() should throw if raw mode is not supported", () => {
  const stdout = createStdout();
  const stdin = createStdin(false);

  const didCatchInMount = spy();
  const didCatchInUnmount = spy();

  const options: RenderOptions = {
    stdout,
    stdin,
    debug: true,
  };

  class Input extends Component<{ setRawMode: (mode: boolean) => void }> {
    override render() {
      return <Text>Test</Text>;
    }

    override componentDidMount() {
      try {
        this.props.setRawMode(true);
      } catch (error: unknown) {
        didCatchInMount(error);
      }
    }

    override componentWillUnmount() {
      try {
        this.props.setRawMode(false);
      } catch (error: unknown) {
        didCatchInUnmount(error);
      }
    }
  }

  function Test() {
    const { setRawMode } = useStdin();
    return <Input setRawMode={setRawMode} />;
  }

  const { unmount } = render(<Test />, options);
  unmount();

  expect(didCatchInMount.callCount).toBe(1);
  expect(didCatchInUnmount.callCount).toBe(1);
  expect(stdin.setRawModeCallCount()).toBe(0);
});

/**
 * Verifies that components can conditionally render content based on whether
 * `isRawModeSupported` is true (i.e., running in a TTY). This ensures that
 * `isRawModeSupported` from `useStdin` works correctly.
 */
test("render different component based on whether stdin is a TTY or not", () => {
  const stdout = createStdout();

  const stdin = createStdin(false);

  const options: RenderOptions = {
    stdout,
    stdin,
    debug: true,
  };

  class Input extends Component<{ setRawMode: (mode: boolean) => void }> {
    override render() {
      return <Text>Test</Text>;
    }

    override componentDidMount() {
      this.props.setRawMode(true);
    }

    override componentWillUnmount() {
      this.props.setRawMode(false);
    }
  }

  function Test({
    renderFirstInput,
    renderSecondInput,
  }: {
    readonly renderFirstInput?: boolean;
    readonly renderSecondInput?: boolean;
  }) {
    const { isRawModeSupported, setRawMode } = useStdin();

    return (
      <>
        {isRawModeSupported && renderFirstInput && (
          <Input setRawMode={setRawMode} />
        )}
        {isRawModeSupported && renderSecondInput && (
          <Input setRawMode={setRawMode} />
        )}
      </>
    );
  }

  const { rerender } = render(
    <Test renderFirstInput renderSecondInput />,
    options,
  );

  expect(stdin.setRawModeCallCount()).toBe(0);

  rerender(<Test renderFirstInput />);

  expect(stdin.setRawModeCallCount()).toBe(0);

  rerender(<Test />);

  expect(stdin.setRawModeCallCount()).toBe(0);
});

/**
 * Verifies that in a CI environment (where `CI=true`), only the final frame of
 * the output is rendered. This is to prevent CI logs from being flooded with
 * intermediate frames of a dynamic CLI app.
 */
test("render only last frame when run in CI", async () => {
  const output = await run("ci", {
    env: { CI: "true" },
    columns: 0,
  });

  for (const i of [0, 1, 2, 3, 4]) {
    expect(output.includes(`Counter: ${i}`)).toBeFalse();
  }

  expect(output.includes("Counter: 5")).toBeTrue();
});

/**
 * Verifies that explicit `CI=false` forces all frames to be rendered, even if
 * the environment might otherwise suggest a CI context. This allows users to
 * opt-in to full animation/updates in CI if desired.
 */
test("render all frames if CI environment variable equals false", async () => {
  const output = await run("ci", {
    env: { CI: "false" },
    columns: 0,
  });

  for (const i of [0, 1, 2, 3, 4, 5]) {
    expect(output.includes(`Counter: ${i}`)).toBeTrue();
  }
});

/**
 * Verifies that removing a prop (setting it to undefined/null during update) correctly resets the style/behavior associated with it.
 */
test("reset prop when it’s removed from the element", () => {
  const stdout = createStdout();

  function Dynamic({ remove }: { readonly remove?: boolean }) {
    return (
      <Box
        flexDirection="column"
        justifyContent="flex-end"
        height={remove ? undefined : 4}
      >
        <Text>x</Text>
      </Box>
    );
  }

  const { rerender } = render(<Dynamic />, {
    stdout,
    debug: true,
  });

  expect(stdout.get()).toBe("\n\n\nx");

  rerender(<Dynamic remove />);
  expect(stdout.get()).toBe("x");
});

/**
 * Verifies that `<Newline />` renders a newline character.
 */
test("newline", () => {
  const output = renderToString(
    <Text>
      Hello
      <Newline />
      World
    </Text>,
  );
  expect(output).toBe("Hello\nWorld");
});

/**
 * Verifies that `<Newline count={N} />` renders N newline characters.
 */
test("multiple newlines", () => {
  const output = renderToString(
    <Text>
      Hello
      <Newline count={2} />
      World
    </Text>,
  );
  expect(output).toBe("Hello\n\nWorld");
});

/**
 * Verifies that `<Spacer />` expands to fill available horizontal space between items.
 */
test("horizontal spacer", () => {
  const output = renderToString(
    <Box width={20}>
      <Text>Left</Text>
      <Spacer />
      <Text>Right</Text>
    </Box>,
  );

  expect(output).toBe("Left           Right");
});

/**
 * Verifies that `<Spacer />` expands to fill available vertical space between items in a column layout.
 */
test("vertical spacer", () => {
  const output = renderToString(
    <Box flexDirection="column" height={6}>
      <Text>Top</Text>
      <Spacer />
      <Text>Bottom</Text>
    </Box>,
  );

  expect(output).toBe("Top\n\n\n\n\nBottom");
});

/**
 * Verifies that ANSI escape codes for links are correctly closed.
 * This ensures that link formatting doesn't leak into subsequent text.
 */
test("link ansi escapes are closed properly", () => {
  const output = renderToString(
    <Text>{ansiEscapes.link("Example", "https://example.com")}</Text>,
  );

  expect(output).toBe(ansiEscapes.link("Example", "https://example.com"));
});
