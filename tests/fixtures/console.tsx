/**
 * Fixture that renders an `App` component which sets a timeout on mount.
 *
 * It logs a message, then unmounts the component and logs another message.
 *
 * Used to test that cleanup functions run correctly and that console output
 * before and after unmount behaves as expected.
 */
import { useEffect } from "react";
import { Text, render } from "../../src/index.js";

function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // no-op
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return <Text>Hello World</Text>;
}

const { unmount } = render(<App />);
console.log("First log");
unmount();
console.log("Second log");
