import widestLine from "widest-line";
import indentString from "indent-string";
import { Display } from "taffy-layout";
import { wrapText } from "../utils/wrap-text.js";
import { getMaxWidth } from "../utils/get-max-width.js";
import { squashTextNodes } from "../utils/squash-text-nodes.js";
import { renderBorder } from "./render-border.js";
import { renderBackground } from "../utils/render-background.js";
import { type DOMElement } from "./dom.js";
import { type Output } from "./output.js";

/**
 * Applies padding to text based on the layout of the first text node.
 *
 * If parent container is `<Box>`, text nodes will be treated as separate nodes
 * in the tree and will have their own coordinates in the layout.
 * To ensure text nodes are aligned correctly, it takes X and Y of the first
 * text node and uses it as offset for the rest of the nodes.
 *
 * Only first node is taken into account, because other text nodes can't have
 * margin or padding, so their coordinates will be relative to the first node
 * anyway.
 *
 * @param node - The DOM element containing the text.
 * @param text - The text to apply padding to.
 * @returns The text with applied padding and indentation.
 */
const applyPaddingToText = (node: DOMElement, text: string): string => {
  const taffyNode = node.childNodes[0]?.taffyNode;

  if (taffyNode) {
    const layout = taffyNode.tree.getLayout(taffyNode.id);
    const offsetX = layout.x;
    const offsetY = layout.y;
    text = "\n".repeat(offsetY) + indentString(text, offsetX);
  }

  return text;
};

/**
 * Function type for transforming output text.
 */
export type OutputTransformer = (s: string, index: number) => string;

/**
 * Renders a node and its children to a string suitable for screen readers.
 *
 * Traverses the DOM tree, handling different node types (tinky-text, tinky-box)
 * and constructing text with accessibility roles and states.
 *
 * @param node - The DOM element to render.
 * @param options - Configuration options.
 * @param options.parentRole - The accessibility role of the parent element.
 * @param options.skipStaticElements - Whether to skip static elements (e.g.
 *   already rendered).
 * @returns The screen reader friendly string representation.
 */
export const renderNodeToScreenReaderOutput = (
  node: DOMElement,
  options: {
    parentRole?: string;
    skipStaticElements?: boolean;
  } = {},
): string => {
  if (options.skipStaticElements && node.internal_static) {
    return "";
  }

  const { taffyNode } = node;
  if (taffyNode) {
    const display = taffyNode.tree.getStyle(taffyNode.id)?.display;
    if (display === Display.None) {
      return "";
    }
  }

  let output = "";

  if (node.nodeName === "tinky-text") {
    output = squashTextNodes(node);
  } else if (node.nodeName === "tinky-box" || node.nodeName === "tinky-root") {
    const separator =
      node.style.flexDirection === "row" ||
      node.style.flexDirection === "row-reverse"
        ? " "
        : "\n";

    const childNodes =
      node.style.flexDirection === "row-reverse" ||
      node.style.flexDirection === "column-reverse"
        ? [...node.childNodes].reverse()
        : [...node.childNodes];

    output = childNodes
      .map((childNode) => {
        const screenReaderOutput = renderNodeToScreenReaderOutput(
          childNode as DOMElement,
          {
            parentRole: node.internal_accessibility?.role,
            skipStaticElements: options.skipStaticElements,
          },
        );
        return screenReaderOutput;
      })
      .filter(Boolean)
      .join(separator);
  }

  if (node.internal_accessibility) {
    const { role, state } = node.internal_accessibility;

    if (state) {
      const stateKeys = Object.keys(state) as (keyof typeof state)[];
      const stateDescription = stateKeys.filter((key) => state[key]).join(", ");

      if (stateDescription) {
        output = `(${stateDescription}) ${output}`;
      }
    }

    if (role && role !== options.parentRole) {
      output = `${role}: ${output}`;
    }
  }

  return output;
};

/**
 * Renders a DOM element and its children to the Output instance.
 *
 * It handles layout positioning, text wrapping, transformers, background,
 * borders, and clipping.
 *
 * @param node - The DOM element to render.
 * @param output - The Output instance to write to.
 * @param options - Rendering options.
 * @param options.offsetX - X offset for rendering.
 * @param options.offsetY - Y offset for rendering.
 * @param options.transformers - Array of text transformers.
 * @param options.skipStaticElements - Whether to skip static elements.
 */
export const renderNodeToOutput = (
  node: DOMElement,
  output: Output,
  options: {
    offsetX?: number;
    offsetY?: number;
    transformers?: OutputTransformer[];
    skipStaticElements: boolean;
  },
) => {
  const {
    offsetX = 0,
    offsetY = 0,
    transformers = [],
    skipStaticElements,
  } = options;

  if (skipStaticElements && node.internal_static) {
    return;
  }

  const { taffyNode } = node;

  if (taffyNode) {
    if (taffyNode.tree.getStyle(taffyNode.id).display === Display.None) {
      return;
    }

    const layout = taffyNode.tree.getLayout(taffyNode.id);

    // Left and top positions in Taffy are relative to their parent node
    const x = offsetX + layout.x;
    const y = offsetY + layout.y;

    // Transformers are functions that transform final text output of each
    // component See Output class for logic that applies transformers
    let newTransformers = transformers;

    if (typeof node.internal_transform === "function") {
      newTransformers = [node.internal_transform, ...transformers];
    }

    if (node.nodeName === "tinky-text") {
      let text = squashTextNodes(node);

      if (text.length > 0) {
        const currentWidth = widestLine(text);
        const maxWidth = getMaxWidth(layout);

        if (currentWidth > maxWidth) {
          const textWrap = node.style.textWrap ?? "wrap";
          text = wrapText(text, maxWidth, textWrap);
        }

        text = applyPaddingToText(node, text);

        output.write(x, y, text, { transformers: newTransformers });
      }

      return;
    }

    if (node.nodeName === "tinky-separator") {
      const separatorChar =
        (node.attributes["internal_separatorChar"] as string) || "─";
      const direction =
        (node.attributes["internal_separatorDirection"] as string) ||
        "horizontal";

      let separatorText: string;

      if (direction === "horizontal") {
        // Fill width with the separator character
        const width = Math.max(0, Math.floor(layout.width));
        separatorText = separatorChar.repeat(width);
      } else {
        // Fill height with the separator character (one per line)
        const height = Math.max(0, Math.floor(layout.height));
        separatorText = (separatorChar + "\n").repeat(height).trimEnd();
      }

      output.write(x, y, separatorText, { transformers: newTransformers });
      return;
    }

    let clipped = false;

    if (node.nodeName === "tinky-box") {
      renderBackground(x, y, node, output);
      renderBorder(x, y, node, output);

      const clipHorizontally =
        node.style.overflowX === "hidden" || node.style.overflow === "hidden";
      const clipVertically =
        node.style.overflowY === "hidden" || node.style.overflow === "hidden";

      if (clipHorizontally || clipVertically) {
        const x1 = clipHorizontally ? x + layout.borderLeft : undefined;

        const x2 = clipHorizontally
          ? x + layout.width - layout.borderRight
          : undefined;

        const y1 = clipVertically ? y + layout.borderTop : undefined;

        const y2 = clipVertically
          ? y + layout.height - layout.borderBottom
          : undefined;

        output.clip({ x1, x2, y1, y2 });
        clipped = true;
      }
    }

    if (node.nodeName === "tinky-root" || node.nodeName === "tinky-box") {
      for (const childNode of node.childNodes) {
        renderNodeToOutput(childNode as DOMElement, output, {
          offsetX: x,
          offsetY: y,
          transformers: newTransformers,
          skipStaticElements,
        });
      }

      if (clipped) {
        output.unclip();
      }
    }
  }
};
