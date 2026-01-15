/**
 * Fixture for testing incremental rendering and static output.
 *
 * Renders a React component that updates a counter and a list of items every
 * 100ms.
 *
 * The component uses `Static` to render the list and a `Text` element for the
 * counter.
 *
 * It is used by tests that verify dynamic updates and unmount behavior.
 */
import React from "react";
import { render, Static, Text } from "../../src/index.js";

interface TestState {
  counter: number;
  items: string[];
}

class Test extends React.Component<Record<string, unknown>, TestState> {
  timer?: NodeJS.Timeout;

  override state: TestState = {
    items: [],
    counter: 0,
  };

  override render() {
    return (
      <>
        <Static items={this.state.items}>
          {(item) => <Text key={item}>{item}</Text>}
        </Static>

        <Text>Counter: {this.state.counter}</Text>
      </>
    );
  }

  override componentDidMount() {
    const onTimeout = () => {
      if (this.state.counter > 4) {
        return;
      }

      this.setState((prevState) => ({
        counter: prevState.counter + 1,
        items: [...prevState.items, `#${prevState.counter + 1}`],
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
