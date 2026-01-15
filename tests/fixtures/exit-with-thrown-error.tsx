/**
 * Fixture that renders a component which throws an error during rendering.
 *
 * Used to verify that the application correctly propagates exit errors.
 */
import { render } from "../../src/index.js";

const Test = () => {
  throw new Error("errored");
};

const { waitUntilExit } = render(<Test />);

try {
  await waitUntilExit();
} catch (error: unknown) {
  console.log((error as Error).message);
}
