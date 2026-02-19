import { boxStyles } from "./box-styles.js";
import ansis from "ansis";
import stringWidth from "string-width";
import { type AnsiCode } from "../types/ansi.js";
import { getStyle } from "../utils/colorize.js";
import { type DOMNode } from "./dom.js";
import { type OutputLike } from "./output.js";

// Helper to resolve styles once
const resolveBorderStyles = (
  color: string | undefined,
  dim: boolean | undefined,
): AnsiCode[] => {
  const styles: AnsiCode[] = [];
  if (dim) {
    styles.push({
      type: "ansi",
      code: ansis.dim.open,
      endCode: ansis.dim.close,
    });
  }
  const colorStyle = getStyle(color, "foreground");
  if (colorStyle) {
    styles.push(colorStyle);
  }
  return styles;
};

export const renderBorder = (
  x: number,
  y: number,
  node: DOMNode,
  output: OutputLike,
): void => {
  const { borderStyle } = node.style;
  if (!borderStyle) {
    return;
  }

  const layout = node.taffyNode?.tree.getLayout(node.taffyNode.id);
  const width = layout?.width ?? 0;
  const height = layout?.height ?? 0;

  const box =
    typeof borderStyle === "string" ? boxStyles[borderStyle] : borderStyle;

  const {
    borderColor,
    borderTopColor,
    borderBottomColor,
    borderLeftColor,
    borderRightColor,
    borderDimColor,
    borderTopDimColor,
    borderBottomDimColor,
    borderLeftDimColor,
    borderRightDimColor,
  } = node.style;

  const showTopBorder = node.style.borderTop !== false;
  const showBottomBorder = node.style.borderBottom !== false;
  const showLeftBorder = node.style.borderLeft !== false;
  const showRightBorder = node.style.borderRight !== false;

  const contentWidth =
    width - (showLeftBorder ? 1 : 0) - (showRightBorder ? 1 : 0);

  // Top Border
  if (showTopBorder) {
    const styles = resolveBorderStyles(
      borderTopColor ?? borderColor,
      borderTopDimColor ?? borderDimColor,
    );

    if (showLeftBorder) {
      output.fill(x, y, 1, box.topLeft, stringWidth(box.topLeft), styles);
    }

    if (contentWidth > 0) {
      output.fill(
        x + (showLeftBorder ? 1 : 0),
        y,
        contentWidth,
        box.top,
        stringWidth(box.top),
        styles,
      );
    }

    if (showRightBorder) {
      output.fill(
        x + width - 1,
        y,
        1,
        box.topRight,
        stringWidth(box.topRight),
        styles,
      );
    }
  }

  // Vertical Borders
  let verticalBorderHeight = height;
  if (showTopBorder) verticalBorderHeight -= 1;
  if (showBottomBorder) verticalBorderHeight -= 1;

  if (verticalBorderHeight > 0) {
    const offsetY = y + (showTopBorder ? 1 : 0);

    // Optimization: Resolve styles once
    const leftStyles = showLeftBorder
      ? resolveBorderStyles(
          borderLeftColor ?? borderColor,
          borderLeftDimColor ?? borderDimColor,
        )
      : [];

    const rightStyles = showRightBorder
      ? resolveBorderStyles(
          borderRightColor ?? borderColor,
          borderRightDimColor ?? borderDimColor,
        )
      : [];

    // Optimization: Calculate widths once
    const leftWidth = showLeftBorder ? stringWidth(box.left) : 0;
    const rightWidth = showRightBorder ? stringWidth(box.right) : 0;

    for (let i = 0; i < verticalBorderHeight; i++) {
      const row = offsetY + i;
      if (showLeftBorder) {
        output.fill(x, row, 1, box.left, leftWidth, leftStyles);
      }
      if (showRightBorder) {
        output.fill(x + width - 1, row, 1, box.right, rightWidth, rightStyles);
      }
    }
  }

  // Bottom Border
  if (showBottomBorder) {
    const styles = resolveBorderStyles(
      borderBottomColor ?? borderColor,
      borderBottomDimColor ?? borderDimColor,
    );
    const bottomY = y + height - 1;

    if (showLeftBorder) {
      output.fill(
        x,
        bottomY,
        1,
        box.bottomLeft,
        stringWidth(box.bottomLeft),
        styles,
      );
    }

    if (contentWidth > 0) {
      output.fill(
        x + (showLeftBorder ? 1 : 0),
        bottomY,
        contentWidth,
        box.bottom,
        stringWidth(box.bottom),
        styles,
      );
    }

    if (showRightBorder) {
      output.fill(
        x + width - 1,
        bottomY,
        1,
        box.bottomRight,
        stringWidth(box.bottomRight),
        styles,
      );
    }
  }
};
