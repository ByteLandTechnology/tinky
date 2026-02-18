[**tinky**](../README.md)

---

[tinky](../globals.md) / useInput

# Function: useInput()

> **useInput**(`inputHandler`, `options?`): `void`

This hook is used for handling user input. It's a more convenient
alternative to using `StdinContext` and listening for `data` events.
The callback you pass to `useInput` is called for each character when the
user enters any input. If the user pastes text, callback is called once
with the whole string passed as `input`.

## Parameters

### inputHandler

[`InputHandler`](../type-aliases/InputHandler.md)

The function to call when input is received.

### options?

[`InputOptions`](../interfaces/InputOptions.md) = `{}`

Configuration options.

## Returns

`void`

## Example

```tsx
import { render, useInput } from "tinky";

const UserInput = () => {
  useInput((input, key) => {
    if (input === "q") {
      // Exit program
    }

    if (key.leftArrow) {
      // Left arrow key pressed
    }
  });

  return null;
};

render(<UserInput />);
```
