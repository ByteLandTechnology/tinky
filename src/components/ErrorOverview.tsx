import { Box } from "./Box.js";
import { Text } from "./Text.js";

interface ErrorProps {
  readonly error: Error;
}

/**
 * Renders an overview of an error, including the message and stack trace.
 */
export function ErrorOverview({ error }: ErrorProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text backgroundColor="red" color="white">
          {" "}
          ERROR{" "}
        </Text>

        <Text> {error.message}</Text>
      </Box>

      {error.stack && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>{error.stack}</Text>
        </Box>
      )}
    </Box>
  );
}
