/**
 * Fixture that renders three lines of text (A, B, C) inside a column Box.
 *
 * After rendering, the test calls `clear()` to clear the output.
 *
 * Used to verify that the `clear` operation works correctly.
 */
import { Box, Text, render } from "../../src/index.js";

function Clear() {
  return (
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>
  );
}

const { clear } = render(<Clear />);
clear();
