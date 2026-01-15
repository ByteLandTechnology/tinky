/**
 * Fixture that writes an error message to stderr and then exits.
 *
 * Used to verify that stderr output is captured correctly by the test harness.
 */
import { useEffect } from "react";
import { render, useStderr, Text, useApp } from "../../src/index.js";

function App() {
  const { write } = useStderr();
  const { exit } = useApp();

  useEffect(() => {
    write("Error Output");
    exit();
  }, []);

  return <Text>Writing to stderr...</Text>;
}

const { waitUntilExit } = render(<App />);
await waitUntilExit();
