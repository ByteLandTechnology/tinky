import { boxStyles } from "./box-styles.js";
import ansis from "ansis";
import { colorize } from "../utils/colorize.js";
import { type DOMNode } from "./dom.js";
import { type OutputLike } from "./output.js";

/**
 * Renders the border for a DOM node.
 * Calculates border dimensions and draws border characters with specified
 * styles.
 *
 * @param x - The x-coordinate (column) where the border starts.
 * @param y - The y-coordinate (row) where the border starts.
 * @param node - The DOM node for which to render the border.
 * @param output - The output instance to write the border to.
 */
export const renderBorder = (
  x: number,
  y: number,
  node: DOMNode,
  output: OutputLike,
): void => {
  if (node.style.borderStyle) {
    const layout = node.taffyNode?.tree.getLayout(node.taffyNode.id);
    const width = layout?.width ?? 0;
    const height = layout?.height ?? 0;

    const box =
      typeof node.style.borderStyle === "string"
        ? boxStyles[node.style.borderStyle]
        : node.style.borderStyle;

    const topBorderColor = node.style.borderTopColor ?? node.style.borderColor;
    const bottomBorderColor =
      node.style.borderBottomColor ?? node.style.borderColor;
    const leftBorderColor =
      node.style.borderLeftColor ?? node.style.borderColor;
    const rightBorderColor =
      node.style.borderRightColor ?? node.style.borderColor;

    const dimTopBorderColor =
      node.style.borderTopDimColor ?? node.style.borderDimColor;

    const dimBottomBorderColor =
      node.style.borderBottomDimColor ?? node.style.borderDimColor;

    const dimLeftBorderColor =
      node.style.borderLeftDimColor ?? node.style.borderDimColor;

    const dimRightBorderColor =
      node.style.borderRightDimColor ?? node.style.borderDimColor;

    const showTopBorder = node.style.borderTop !== false;
    const showBottomBorder = node.style.borderBottom !== false;
    const showLeftBorder = node.style.borderLeft !== false;
    const showRightBorder = node.style.borderRight !== false;

    const contentWidth =
      width - (showLeftBorder ? 1 : 0) - (showRightBorder ? 1 : 0);

    let topBorder = showTopBorder
      ? colorize(
          (showLeftBorder ? box.topLeft : "") +
            box.top.repeat(contentWidth) +
            (showRightBorder ? box.topRight : ""),
          topBorderColor,
          "foreground",
        )
      : undefined;

    if (showTopBorder && dimTopBorderColor) {
      topBorder = ansis.dim(topBorder);
    }

    let verticalBorderHeight = height;

    if (showTopBorder) {
      verticalBorderHeight -= 1;
    }

    if (showBottomBorder) {
      verticalBorderHeight -= 1;
    }

    let leftBorder = (
      colorize(box.left, leftBorderColor, "foreground") + "\n"
    ).repeat(verticalBorderHeight);

    if (dimLeftBorderColor) {
      leftBorder = ansis.dim(leftBorder);
    }

    let rightBorder = (
      colorize(box.right, rightBorderColor, "foreground") + "\n"
    ).repeat(verticalBorderHeight);

    if (dimRightBorderColor) {
      rightBorder = ansis.dim(rightBorder);
    }

    let bottomBorder = showBottomBorder
      ? colorize(
          (showLeftBorder ? box.bottomLeft : "") +
            box.bottom.repeat(contentWidth) +
            (showRightBorder ? box.bottomRight : ""),
          bottomBorderColor,
          "foreground",
        )
      : undefined;

    if (showBottomBorder && dimBottomBorderColor) {
      bottomBorder = ansis.dim(bottomBorder);
    }

    const offsetY = showTopBorder ? 1 : 0;

    if (topBorder) {
      output.write(x, y, topBorder, { transformers: [] });
    }

    if (showLeftBorder) {
      output.write(x, y + offsetY, leftBorder, { transformers: [] });
    }

    if (showRightBorder) {
      output.write(x + width - 1, y + offsetY, rightBorder, {
        transformers: [],
      });
    }

    if (bottomBorder) {
      output.write(x, y + height - 1, bottomBorder, { transformers: [] });
    }
  }
};
