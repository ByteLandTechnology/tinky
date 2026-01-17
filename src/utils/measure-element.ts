import { type DOMElement } from "../core/dom.js";
import { type Dimension } from "./dimension.js";

/**
 * Measure the dimensions of a particular `<Box>` element.
 *
 * @param node - The DOM element to measure.
 * @returns The measured dimensions.
 */
export const measureElement = (node: DOMElement): Dimension => {
  const layout = node.taffyNode?.tree.getLayout(node.taffyNode.id);
  return {
    width: layout?.width ?? 0,
    height: layout?.height ?? 0,
  };
};
