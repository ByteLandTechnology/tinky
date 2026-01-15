/**
 * Props for the Newline component.
 */
export interface NewlineProps {
  /**
   * Number of newlines to insert.
   *
   * @defaultValue 1
   */
  readonly count?: number;
}

/**
 * Adds one or more newline (`\n`) characters. Must be used within `<Text>`
 * components.
 *
 * @example
 * ```tsx
 * import {render, Text, Newline} from 'tinky';
 *
 * render(
 *   <Text>
 *     Hello
 *     <Newline />
 *     World
 *   </Text>
 * );
 * ```
 */
export function Newline({ count = 1 }: NewlineProps) {
  return <tinky-text>{"\n".repeat(count)}</tinky-text>;
}
