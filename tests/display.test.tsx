import { test, expect } from "bun:test";
import { Box, Text } from "../src/index.js";
import { renderToString } from "./helpers/render-to-string.js";

/**
 * Verifies that `display="flex"` is the default and behaves correctly
 * (rendering the child).
 */
test("display flex", () => {
  const output = renderToString(
    <Box display="flex">
      <Text>X</Text>
    </Box>,
  );
  expect(output).toBe("X");
});

/**
 * Verifies that `display="none"` correctly hides the component and its children
 * from the output.
 */
test("display none", () => {
  const output = renderToString(
    <Box flexDirection="column">
      <Box display="none">
        <Text>Kitty!</Text>
      </Box>
      <Text>Doggo</Text>
    </Box>,
  );

  expect(output).toBe("Doggo");
});
