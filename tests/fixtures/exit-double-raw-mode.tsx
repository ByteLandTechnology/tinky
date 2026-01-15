/**
 * Fixture that renders a component which toggles raw mode twice and writes to
 * stdout.
 *
 * It is used to verify that raw mode handling and exit behavior work correctly
 * when raw mode is changed during the component lifecycle.
 */
import { Component } from "react";
import process from "node:process";
import { Text, render, useStdin } from "../../src/index.js";

class ExitDoubleRawMode extends Component<{
  setRawMode: (value: boolean) => void;
}> {
  override render() {
    return <Text>Hello World</Text>;
  }

  override componentDidMount() {
    const { setRawMode } = this.props;

    setRawMode(true);

    setTimeout(() => {
      setRawMode(false);
      setRawMode(true);

      // Start the test
      process.stdout.write("s");
    }, 500);
  }
}

function Test() {
  const { setRawMode } = useStdin();

  return <ExitDoubleRawMode setRawMode={setRawMode} />;
}

process.stdin.on("data", (data) => {
  if (String(data) === "q") {
    unmount();
  }
});

const { unmount, waitUntilExit } = render(<Test />);

await waitUntilExit();
console.log("exited");
