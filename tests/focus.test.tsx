import { useEffect } from "react";
import { test, expect } from "bun:test";
import delay from "delay";
import { render, Box, Text, useFocus, useFocusManager } from "../src/index.js";
import { createStdout } from "./helpers/create-stdout.js";
import { createStdin } from "./helpers/create-stdin.js";

/**
 * Props for the Test component.
 */
interface TestProps {
  readonly showFirst?: boolean;
  readonly disableFirst?: boolean;
  readonly disableSecond?: boolean;
  readonly disableThird?: boolean;
  readonly autoFocus?: boolean;
  readonly disabled?: boolean;
  readonly focusNext?: boolean;
  readonly focusPrevious?: boolean;
  readonly unmountChildren?: boolean;
}

function Test({
  showFirst = true,
  disableFirst = false,
  disableSecond = false,
  disableThird = false,
  autoFocus = false,
  disabled = false,
  focusNext = false,
  focusPrevious = false,
  unmountChildren = false,
}: TestProps) {
  const focusManager = useFocusManager();

  useEffect(() => {
    if (disabled) {
      focusManager.disableFocus();
    } else {
      focusManager.enableFocus();
    }
  }, [disabled]);

  useEffect(() => {
    if (focusNext) {
      focusManager.focusNext();
    }
  }, [focusNext]);

  useEffect(() => {
    if (focusPrevious) {
      focusManager.focusPrevious();
    }
  }, [focusPrevious]);

  if (unmountChildren) {
    return null;
  }

  return (
    <Box flexDirection="column">
      {showFirst && (
        <Item label="First" autoFocus={autoFocus} disabled={disableFirst} />
      )}
      <Item label="Second" autoFocus={autoFocus} disabled={disableSecond} />
      <Item label="Third" autoFocus={autoFocus} disabled={disableThird} />
    </Box>
  );
}

interface ItemProps {
  readonly label: string;
  readonly autoFocus: boolean;
  readonly disabled?: boolean;
}

function Item({ label, autoFocus, disabled = false }: ItemProps) {
  const { isFocused } = useFocus({
    autoFocus,
    isActive: !disabled,
  });

  return (
    <Text>
      {label} {isFocused && "✔"}
    </Text>
  );
}

/**
 * Verifies that focus is not automatically assigned to any component if
 * `autoFocus` is disabled on the container/hooks.
 */
test("dont focus on register when auto focus is off", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);

  expect(stdout.get()).toBe(["First", "Second", "Third"].join("\n"));
});

/**
 * Verifies that the first focusable component is focused automatically when
 * `autoFocus` is enabled.
 */
test("focus the first component to register", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);

  expect(stdout.get()).toBe(["First ✔", "Second", "Third"].join("\n"));
});

/**
 * Verifies that pressing keys (Esc) generally doesn't affect focus unless
 * handled, but here it seems to verify that focus isn't randomly grabbed or
 * lost?
 * Wait, the test name says "unfocus active component on Esc".
 * But the expectation shows no component is focused ("First", "Second"...).
 * Ah, in the setup `<Test />` (no autoFocus), nothing is focused initially.
 * Escape is sent.
 * Expectation still no focus.
 * If something was focused, would Esc unfocus it?
 * The test setup doesn't initially focus anything.
 * Wait, maybe `active` focus means if I manually focus it?
 * Actually, `useFocus` hook usually handles focus.
 * The test name implies it *should* unfocus.
 * If I look at `useFocusManager` or internal implementation, Esc might trigger
 * `disableFocus` or similar?
 * But here, nothing is focused to begin with.
 * Let's assume it verifies that Esc doesn't *cause* focus to happen or ensures
 * clean state.
 * Or maybe it is testing the behavior when *something* was focused?
 * Ah, let's look at `render(<Test />)`. `autoFocus` is false default.
 * So essentially this test confirms that if nothing is focused, sending Esc
 * changes nothing.
 * A more robust test would focus something first.
 * But based on the code:
 * "unfocus active component on Esc" -> seems to imply functionality exists.
 * Maybe it's testing that the focus manager handles Esc by clearing focus?
 * I will describe what it does: sends Esc and checks that nothing is focused
 * (which was already the case).
 */
test("unfocus active component on Esc", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\u001B");
  await delay(100);
  expect(stdout.get()).toBe(["First", "Second", "Third"].join("\n"));
});

/**
 * Verifies that pressing Tab focuses the first component if nothing is
 * currently focused.
 */
test("switch focus to first component on Tab", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First ✔", "Second", "Third"].join("\n"));
});

/**
 * Verifies that pressing Tab moves focus to the next component (First -> Second).
 */
test("switch focus to the next component on Tab", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\t");
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second ✔", "Third"].join("\n"));
});

/**
 * Verifies that pressing Tab at the end of the focusable list cycles back to
 * the first component.
 */
test("switch focus to the first component if currently focused component is the last one on Tab", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\t");
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second", "Third ✔"].join("\n"));

  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First ✔", "Second", "Third"].join("\n"));
});

/**
 * Verifies that disabled components are skipped during focus traversal with
 * Tab.
 */
test("skip disabled component on Tab", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus disableSecond />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second", "Third ✔"].join("\n"));
});

/**
 * Verifies that pressing Shift+Tab moves focus to the previous component.
 */
test("switch focus to the previous component on Shift+Tab", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second ✔", "Third"].join("\n"));

  stdin.emitReadable("\u001B[Z");
  await delay(150);

  expect(stdout.get()).toBe(["First ✔", "Second", "Third"].join("\n"));
});

/**
 * Verifies that pressing Shift+Tab on the first component cycles back to the
 * last component.
 */
test("switch focus to the last component if currently focused component is the first one on Shift+Tab", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\u001B[Z");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second", "Third ✔"].join("\n"));
});

/**
 * Verifies that disabled components are skipped during focus traversal with
 * Shift+Tab (reverse traversal).
 */
test("skip disabled component on Shift+Tab", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus disableSecond />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\u001B[Z");
  stdin.emitReadable("\u001B[Z");
  await delay(100);

  expect(stdout.get()).toBe(["First ✔", "Second", "Third"].join("\n"));
});

/**
 * Verifies that if the currently focused component is removed (unregistered),
 * focus is lost (reset) if no other logic intervenes.
 */
test("reset focus when focused component unregisters", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  const { rerender } = render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  rerender(<Test autoFocus showFirst={false} />);
  await delay(100);

  expect(stdout.get()).toBe(["Second", "Third"].join("\n"));
});

/**
 * Verifies that after a focused component unregisters, focus can be
 * re-established on remaining components (e.g. by pressing Tab).
 */
test("focus first component after focused component unregisters", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  const { rerender } = render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  rerender(<Test autoFocus showFirst={false} />);
  await delay(100);

  expect(stdout.get()).toBe(["Second", "Third"].join("\n"));

  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["Second ✔", "Third"].join("\n"));
});

/**
 * Verifies that focus management can be programmatically enabled and disabled.
 * When disabled, Tab keys shouldn't change focus.
 */
test("toggle focus management", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  const { rerender } = render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  rerender(<Test autoFocus disabled />);
  await delay(100);
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First ✔", "Second", "Third"].join("\n"));

  rerender(<Test autoFocus />);
  await delay(100);
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second ✔", "Third"].join("\n"));
});

/**
 * Verifies that `focusManager.focusNext()` correctly moves focus to the next
 * component programmatically.
 */
test("manually focus next component", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  const { rerender } = render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  rerender(<Test autoFocus focusNext />);
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second ✔", "Third"].join("\n"));
});

/**
 * Verifies that `focusManager.focusPrevious()` correctly moves focus to the
 * previous component programmatically.
 */
test("manually focus previous component", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  const { rerender } = render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  rerender(<Test autoFocus focusPrevious />);
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second", "Third ✔"].join("\n"));
});

/**
 * Verifies that the app doesn't crash if `focusNext()` is called while the app
 * is unmounting or has unmounted children.
 */
test("doesnt crash when focusing next on unmounted children", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  const { rerender } = render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  rerender(<Test focusNext unmountChildren />);
  await delay(100);

  expect(stdout.get()).toBe("");
});

/**
 * Verifies that the app doesn't crash if `focusPrevious()` is called while the
 * app is unmounting or has unmounted children.
 */
test("doesnt crash when focusing previous on unmounted children", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  const { rerender } = render(<Test autoFocus />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  rerender(<Test focusPrevious unmountChildren />);
  await delay(100);

  expect(stdout.get()).toBe("");
});

/**
 * Verifies that `autoFocus` correctly targets the first *enabled* component,
 * skipping disabled ones.
 */
test("focuses first non-disabled component", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus disableFirst disableSecond />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);

  expect(stdout.get()).toBe(["First", "Second", "Third ✔"].join("\n"));
});

/**
 * Verifies that wrapping around (focusing next after last) correctly skips
 * disabled elements at the start of the list.
 */
test("skips disabled elements when wrapping around", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus disableFirst />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\t");
  await delay(100);
  stdin.emitReadable("\t");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second ✔", "Third"].join("\n"));
});

/**
 * Verifies that wrapping around backwards (focusing previous after first)
 * correctly skips disabled elements at the end of the list.
 */
test("skips disabled elements when wrapping around from the front", async () => {
  const stdout = createStdout();
  const stdin = createStdin();
  render(<Test autoFocus disableThird />, {
    stdout,
    stdin,
    debug: true,
  });

  await delay(100);
  stdin.emitReadable("\u001B[Z");
  await delay(100);

  expect(stdout.get()).toBe(["First", "Second ✔", "Third"].join("\n"));
});
