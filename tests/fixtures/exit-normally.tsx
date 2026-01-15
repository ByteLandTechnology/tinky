/**
 * Fixture that renders a simple `Text` component and waits for the process to
 * exit.
 *
 * Used to verify normal exit handling without any additional cleanup.
 */
import { Text, render } from "../../src/index.js";

const { waitUntilExit } = render(<Text>Hello World</Text>);

await waitUntilExit();
console.log("exited");
