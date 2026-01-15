/**
 * Fixture that renders a component which calls `onExit` after a short timeout.
 *
 * It also increments a counter while the app is running.
 *
 * Used to verify normal exit behavior and cleanup.
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
    setTimeout(this.props.onExit, 500);

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

await app.waitUntilExit();
console.log("exited");
