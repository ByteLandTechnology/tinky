/**
 * Fixture that renders a `Static` list of items (A, B, C) and a column `Box`
 * with texts D, E, F.
 *
 * It then sets `process.stdout.rows` based on a CLI argument and renders the
 * component.
 *
 * Used to test static rendering combined with dynamic layout sizing.
 */
import process from "node:process";
import { Static, Box, Text, render } from "../../src/index.js";

function EraseWithStatic() {
  return (
    <>
      <Static items={["A", "B", "C"]}>
        {(item) => <Text key={item}>{item}</Text>}
      </Static>

      <Box flexDirection="column">
        <Text>D</Text>
        <Text>E</Text>
        <Text>F</Text>
      </Box>
    </>
  );
}

process.stdout.rows = Number(process.argv[3]);
render(<EraseWithStatic />);
