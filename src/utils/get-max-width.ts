import { type Layout } from "taffy-layout";

/**
 * Calculates the maximum available width for content within a Taffy layout.
 * It subtracts padding and borders from the total width of the element.
 *
 * @param layout - The Taffy layout object with width, padding, and border info.
 * @returns The maximum width available for content.
 */
export const getMaxWidth = (layout: Layout) => {
  return (
    layout.width -
    layout.paddingLeft -
    layout.paddingRight -
    layout.borderLeft -
    layout.borderRight
  );
};
