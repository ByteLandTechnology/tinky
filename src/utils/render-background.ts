import { colorize } from "./colorize.js";
import { type DOMNode } from "../core/dom.js";
import { type Output } from "../core/output.js";

/**
 * Renders the background color of a node to the output.
 *
 * @param x - The x-coordinate (column) where plotting starts.
 * @param y - The y-coordinate (row) where plotting starts.
 * @param node - The DOM node to render the background for.
 * @param output - The output instance to write to.
 */
export const renderBackground = (
  x: number,
  y: number,
  node: DOMNode,
  output: Output,
): void => {
  if (!node.style.backgroundColor) {
    return;
  }

  const layout = node.taffyNode?.tree.getLayout(node.taffyNode.id);
  const width = layout?.width ?? 0;
  const height = layout?.height ?? 0;

  // Calculate the actual content area considering borders
  const leftBorderWidth =
    node.style.borderStyle && node.style.borderLeft !== false ? 1 : 0;
  const rightBorderWidth =
    node.style.borderStyle && node.style.borderRight !== false ? 1 : 0;
  const topBorderHeight =
    node.style.borderStyle && node.style.borderTop !== false ? 1 : 0;
  const bottomBorderHeight =
    node.style.borderStyle && node.style.borderBottom !== false ? 1 : 0;

  const contentWidth = width - leftBorderWidth - rightBorderWidth;
  const contentHeight = height - topBorderHeight - bottomBorderHeight;

  if (!(contentWidth > 0 && contentHeight > 0)) {
    return;
  }

  // Create background fill for each row
  const backgroundLine = colorize(
    " ".repeat(contentWidth),
    node.style.backgroundColor,
    "background",
  );

  for (let row = 0; row < contentHeight; row++) {
    output.write(
      x + leftBorderWidth,
      y + topBorderHeight + row,
      backgroundLine,
      { transformers: [] },
    );
  }
};
