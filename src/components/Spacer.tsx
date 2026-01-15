import { Box } from "./Box.js";

/**
 * A flexible space that expands along the major axis of its containing layout.
 *
 * It's useful as a shortcut for filling all available space between elements.
 *
 * @example
 * ```tsx
 * import {render, Box, Text, Spacer} from 'tinky';
 *
 * render(
 *   <Box>
 *     <Text>Left</Text>
 *     <Spacer />
 *     <Text>Right</Text>
 *   </Box>
 * );
 * ```
 */
export function Spacer() {
  return <Box flexGrow={1} />;
}
