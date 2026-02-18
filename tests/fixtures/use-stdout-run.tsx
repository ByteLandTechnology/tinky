import { useEffect } from "react";
import { render, useStdout, Text, useApp } from "../../src/index.js";

function WriteToStdout() {
  const { write } = useStdout();
  const { exit } = useApp();

  useEffect(() => {
    write("Hello from run mode stdout\n");
    exit();
  }, []);

  return <Text>Hello Run Mode</Text>;
}

const { waitUntilExit } = render(<WriteToStdout />, {
  incrementalRendering: true,
});

await waitUntilExit();
console.log("exited");
