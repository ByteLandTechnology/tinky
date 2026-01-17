import { type DOMElement } from "../core/dom.js";

/**
 * Consolidates multiple text nodes into a single string.
 * Useful for combining adjacent text nodes to minimize write operations.
 * Handles nested text nodes recursively and applies internal transformations.
 *
 * @param node - The root DOM element containing text nodes to squash.
 * @returns The consolidated text string.
 */
export const squashTextNodes = (node: DOMElement): string => {
  let text = "";

  for (let index = 0; index < node.childNodes.length; index++) {
    const childNode = node.childNodes[index];

    if (childNode === undefined) {
      continue;
    }

    let nodeText = "";

    if (childNode.nodeName === "#text") {
      nodeText = childNode.nodeValue;
    } else {
      if (
        childNode.nodeName === "tinky-text" ||
        childNode.nodeName === "tinky-virtual-text"
      ) {
        nodeText = squashTextNodes(childNode);
      }

      // Since these text nodes are being concatenated, `Output` instance won't
      // be able to apply children transform, so we have to do it manually here
      // for each text node
      if (
        nodeText.length > 0 &&
        typeof childNode.internal_transform === "function"
      ) {
        nodeText = childNode.internal_transform(nodeText, index);
      }
    }

    text += nodeText;
  }

  return text;
};
