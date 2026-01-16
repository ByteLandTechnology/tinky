[**tinky**](../README.md)

---

[tinky](../globals.md) / useApp

# Function: useApp()

> **useApp**(): [`AppProps`](../interfaces/AppProps.md)

`useApp` is a React hook that exposes a method to manually exit the app
(unmount).

## Returns

[`AppProps`](../interfaces/AppProps.md)

The app context containing the `exit` function.

## Example

```tsx
import { render, useApp, useInput } from "tinky";

const Component = () => {
  const { exit } = useApp();

  useInput((input) => {
    if (input === "q") {
      exit();
    }
  });

  return null;
};

render(<Component />);
```
