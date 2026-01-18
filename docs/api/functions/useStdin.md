[**tinky**](../README.md)

---

[tinky](../globals.md) / useStdin

# Function: useStdin()

> **useStdin**(): [`StdinProps`](../interfaces/StdinProps.md)

`useStdin` is a React hook that exposes the stdin stream and related utilities.

## Returns

[`StdinProps`](../interfaces/StdinProps.md)

The stdin context containing the stdin stream, `setRawMode` function,
and `isRawModeSupported` flag.

## Example

```tsx
import { useStdin } from "tinky";

function InputComponent() {
  const { stdin, setRawMode, isRawModeSupported } = useStdin();

  useEffect(() => {
    if (isRawModeSupported) {
      setRawMode(true);
      return () => setRawMode(false);
    }
  }, [setRawMode, isRawModeSupported]);

  return <Text>Listening for input...</Text>;
}
```
