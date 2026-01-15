/**
 * Fixture that renders a component which exits after a short timeout.
 *
 * It demonstrates the `exit` behavior when the component finishes its work.
 *
 * Used to verify that the app exits cleanly without additional cleanup.
 */
import { Component } from "react";
import { render, Text } from "../../src/index.js";

class Test extends Component<Record<string, unknown>, { counter: number }> {
  timer?: NodeJS.Timeout;

  override state = {
    counter: 0,
  };

  override render() {
    return <Text>Counter: {this.state.counter}</Text>;
  }

  override componentDidMount() {
    const onTimeout = () => {
      if (this.state.counter > 4) {
        return;
      }

      this.setState((previousState) => ({
        counter: previousState.counter + 1,
      }));

      this.timer = setTimeout(onTimeout, 100);
    };

    this.timer = setTimeout(onTimeout, 100);
  }

  override componentWillUnmount() {
    clearTimeout(this.timer);
  }
}

render(<Test />);
