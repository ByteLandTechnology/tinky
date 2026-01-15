import { type DOMElement } from "./dom.js";

interface Output {
  /**
   * Element width.
   */
  width: number;

  /**
   * Element height.
   */
  height: number;
}

/**
 * Measure the dimensions of a particular `<Box>` element.
 *
 * @param node - The DOM element to measure.
 * @returns The measured dimensions.
 */
export const measureElement = (node: DOMElement): Output => {
  const layout = node.taffyNode?.tree.getLayout(node.taffyNode.id);
  return {
    width: layout?.width ?? 0,
    height: layout?.height ?? 0,
  };
};
