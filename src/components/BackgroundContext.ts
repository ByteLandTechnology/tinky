import { createContext } from "react";
import { type LiteralUnion } from "type-fest";
import { type ForegroundColorName } from "ansi-styles";

/**
 * Union type for background colors.
 */
export type BackgroundColor = LiteralUnion<ForegroundColorName, string>;

/**
 * Context to pass the background color down the component tree.
 */
export const backgroundContext = createContext<BackgroundColor | undefined>(
  undefined,
);
