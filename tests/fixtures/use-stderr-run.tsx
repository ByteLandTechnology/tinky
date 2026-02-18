import { useEffect } from "react";
import { render, useStderr, Text, useApp } from "../../src/index.js";

function App() {
  const { write } = useStderr();
  const { exit } = useApp();

  useEffect(() => {
    write("Run mode error output");
    exit();
  }, []);

  return <Text>Run mode stderr</Text>;
}

const { waitUntilExit } = render(<App />, {
  incrementalRendering: true,
});

await waitUntilExit();
