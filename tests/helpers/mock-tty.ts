/**
 * Mocks the TTY environment if not already present.
 *
 * This is used to simulate a TTY environment in tests where process.stdin might
 * not be a TTY.
 */
if (!process.stdin.isTTY) {
  process.stdin.isTTY = true;
  process.stdin.setRawMode = () => {
    return process.stdin;
  };
}
