/**
 * Fixture that writes a message to stdout and then exits.
 *
 * Used to verify that stdout output is captured correctly by the test harness.
 */
import { useEffect } from "react";
import { render, useStdout, Text, useApp } from "../../src/index.js";

function WriteToStdout() {
  const { write } = useStdout();
  const { exit } = useApp();

  useEffect(() => {
    write("Hello from Tinky to stdout\n");
    exit();
  }, []);

  return <Text>Hello World</Text>;
}

const { waitUntilExit } = render(<WriteToStdout />);

await waitUntilExit();
console.log("exited");
