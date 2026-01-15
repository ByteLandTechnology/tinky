/**
 * Fixture that renders a component which enables raw mode and then unmounts.
 *
 * It tests that raw mode is correctly cleaned up when the component is
 * unmounted.
 */
import { Component } from "react";
import { render, Text, useStdin } from "../../src/index.js";

class Exit extends Component<{
  onSetRawMode: (value: boolean) => void;
}> {
  override render() {
    return <Text>Hello World</Text>;
  }

  override componentDidMount() {
    this.props.onSetRawMode(true);
  }
}

function Test() {
  const { setRawMode } = useStdin();
  return <Exit onSetRawMode={setRawMode} />;
}

const app = render(<Test />);

setTimeout(() => {
  app.unmount();
}, 500);

await app.waitUntilExit();
console.log("exited");
