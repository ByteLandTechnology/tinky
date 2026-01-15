/**
 * Fixture that renders a component which enables raw mode, then exits normally.
 *
 * It tests that raw mode is correctly cleaned up on a normal exit.
 */
import { Component } from "react";
import { render, Text, useApp, useStdin } from "../../src/index.js";

class Exit extends Component<{
  onSetRawMode: (value: boolean) => void;
  onExit: (error: Error) => void;
}> {
  override render() {
    return <Text>Hello World</Text>;
  }

  override componentDidMount() {
    this.props.onSetRawMode(true);
    setTimeout(this.props.onExit, 500);
  }
}

function Test() {
  const { exit } = useApp();
  const { setRawMode } = useStdin();

  return <Exit onExit={exit} onSetRawMode={setRawMode} />;
}

const app = render(<Test />);

await app.waitUntilExit();
console.log("exited");
