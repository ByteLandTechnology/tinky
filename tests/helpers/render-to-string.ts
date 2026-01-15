import { JSX } from "react";
import { render } from "../../src/index.js";
import { createStdout } from "./create-stdout";

/**
 * Renders a React component to a string, simulating Tinky rendering.
 *
 * @param node - The React component to render.
 * @param options - Configuration options.
 * @param options.columns - The width of the simulated terminal in columns.
 * @param options.isScreenReaderEnabled - Whether to enable screen reader mode.
 * @returns The rendered string output.
 */
export const renderToString: (
  node: JSX.Element,
  options?: { columns?: number; isScreenReaderEnabled?: boolean },
) => string = (node, options) => {
  const stdout = createStdout(options?.columns ?? 100);

  render(node, {
    stdout,
    debug: true,
    isScreenReaderEnabled: options?.isScreenReaderEnabled,
  });

  return stdout.get();
};
