/**
 * Fixture that renders a component which triggers an error on exit after a
 * timeout.
 *
 * It increments a counter and then calls `onExit` with an Error.
 *
 * Used to test that the app correctly propagates exit errors.
 */
import { Component } from "react";
import { render, Text, useApp } from "../../src/index.js";

class Exit extends Component<
  { onExit: (error: Error) => void },
  { counter: number }
> {
  timer?: NodeJS.Timeout;

  override state = {
    counter: 0,
  };

  override render() {
    return <Text>Counter: {this.state.counter}</Text>;
  }

  override componentDidMount() {
    setTimeout(() => {
      this.props.onExit(new Error("errored"));
    }, 500);

    this.timer = setInterval(() => {
      this.setState((previousState) => ({
        counter: previousState.counter + 1,
      }));
    }, 100);
  }

  override componentWillUnmount() {
    clearInterval(this.timer);
  }
}

function Test() {
  const { exit } = useApp();
  return <Exit onExit={exit} />;
}

const app = render(<Test />);

try {
  await app.waitUntilExit();
} catch (error: unknown) {
  console.log((error as Error).message);
}
