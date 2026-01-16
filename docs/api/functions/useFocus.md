[**tinky**](../README.md)

---

[tinky](../globals.md) / useFocus

# Function: useFocus()

> **useFocus**(`options`): [`FocusState`](../interfaces/FocusState.md)

A component that uses the `useFocus` hook becomes "focusable" to Tinky, so
when the user presses <kbd>Tab</kbd>, Tinky will switch focus to this
component. If there are multiple components that execute the `useFocus`
hook, focus will be given to them in render order. This hook returns an
object with an `isFocused` boolean property, which determines whether
this component is focused.

## Parameters

### options

[`FocusOptions`](../interfaces/FocusOptions.md) = `{}`

Configuration options.

## Returns

[`FocusState`](../interfaces/FocusState.md)

Focus state and control methods.

## Example

```tsx
import { render, Text, useFocus } from "tinky";

const Component = () => {
  const { isFocused } = useFocus();

  return (
    <Text color={isFocused ? "green" : "white"}>
      {isFocused ? "I am focused" : "I am not focused"}
    </Text>
  );
};

render(<Component />);
```
