import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that wide characters (double-width, emojis) do not cause layout
 * issues or add extra space when confined within a fixed-width Box.
 *
 * It ensures that the surrounding layout remains consistent regardless of the
 * character width.
 */
test("wide characters do not add extra space inside fixed-width Box", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Box>
        <Box width={2}>
          <Text>🍔</Text>
        </Box>
        <Text>|</Text>
      </Box>
      <Box>
        <Box width={2}>
          <Text>⏳</Text>
        </Box>
        <Text>|</Text>
      </Box>
    </Box>,
  );

  const lines = output.split("\n");
  // Both lines should have the pipe directly after the 2-column box
  expect(lines[0]).toBe("🍔|");
  expect(lines[1]).toBe("⏳|");
});
