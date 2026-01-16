import { createContext } from "react";
import { type LiteralUnion } from "type-fest";
import { type ForegroundColorName } from "ansi-styles";

/**
 * Union type for background colors.
 *
 * Accepts any named color from `ansi-styles`, hex colors, RGB colors,
 * or ANSI 256 color codes.
 *
 * @example
 * ```tsx
 * backgroundColor="red"                    // Named color
 * backgroundColor="#ff6600"                // Hex color
 * backgroundColor="rgb(255, 102, 0)"       // RGB color
 * backgroundColor="ansi256:208"            // ANSI 256 color
 * ```
 */
export type BackgroundColor = LiteralUnion<ForegroundColorName, string>;

/**
 * Context to pass the background color down the component tree.
 *
 * Allows nested components to inherit the background color from parents.
 *
 * @defaultValue undefined
 */
export const backgroundContext = createContext<BackgroundColor | undefined>(
  undefined,
);
