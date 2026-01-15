import process from "node:process";
/**
 * Fixture that renders a Box with a single line of text and immediately calls
 * `erase()`.
 *
 * Used to verify that the erase operation clears the output correctly.
 */
import { Box, Text, render } from "../../src/index.js";

function Erase() {
  return (
    <Box flexDirection="column">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Box>
  );
}

process.stdout.rows = Number(process.argv[2]);
render(<Erase />);
