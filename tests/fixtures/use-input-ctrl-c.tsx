/**
 * Fixture that tests `useInput` handling of Ctrl+C to trigger exit.
 *
 * The component registers an input handler that exits on Ctrl+C and throws
 * otherwise.
 */
import { render, useInput, useApp } from "../../src/index.js";

function UserInput() {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === "c" && key.ctrl) {
      exit();
      return;
    }

    throw new Error("Crash");
  });

  return null;
}

const { waitUntilExit } = render(<UserInput />, { exitOnCtrlC: false });

await waitUntilExit();
console.log("exited");
