import { type AvailableSpace } from "taffy-layout";
import stringWidth from "string-width";
import { measureText } from "../utils/measure-text.js";
import { type Styles } from "./styles.js";
import { wrapText } from "../utils/wrap-text.js";
import { squashTextNodes } from "../utils/squash-text-nodes.js";
import { type OutputTransformer } from "./render-node-to-output.js";
import { TaffyNode } from "./taffy-node.js";
import { type SizeObserver } from "./size-observer.js";

/**
 * Interface representing a node in the Tinky tree.
 */
export interface TinkyNode {
  /** Parent DOM element in the tree. */
  parentNode: DOMElement | undefined;
  /** Taffy layout node for computing dimensions. */
  taffyNode?: TaffyNode;
  /** Whether this node is inside a Static component. */
  internal_static?: boolean;
  /** Styles applied to this node. */
  style: Styles;
}

/**
 * Type representing a text node name.
 */
export type TextName = "#text";

/**
 * Type representing element names in the Tinky DOM.
 */
export type ElementNames =
  | "tinky-root"
  | "tinky-box"
  | "tinky-text"
  | "tinky-virtual-text"
  | "tinky-separator";

/**
 * Union type of all possible node names.
 */
export type NodeNames = ElementNames | TextName;

/**
 * Interface representing a DOM element in Tinky.
 */
export type DOMElement = {
  /** Name of the element type. */
  nodeName: ElementNames;
  /** Key-value pairs of element attributes. */
  attributes: Record<string, DOMNodeAttribute>;
  /** Array of child nodes. */
  childNodes: DOMNode[];
  /** Function to transform the output of this element. */
  internal_transform?: OutputTransformer;

  /** Accessibility attributes for screen readers. */
  internal_accessibility?: {
    /** ARIA role for the element. */
    role?:
      | "button"
      | "checkbox"
      | "combobox"
      | "list"
      | "listbox"
      | "listitem"
      | "menu"
      | "menuitem"
      | "option"
      | "progressbar"
      | "radio"
      | "radiogroup"
      | "tab"
      | "tablist"
      | "table"
      | "textbox"
      | "timer"
      | "toolbar";
    /** ARIA state values for the element. */
    state?: {
      /** Whether the element is busy. */
      busy?: boolean;
      /** Whether the element is checked. */
      checked?: boolean;
      /** Whether the element is disabled. */
      disabled?: boolean;
      /** Whether the element is expanded. */
      expanded?: boolean;
      /** Whether the element accepts multiline input. */
      multiline?: boolean;
      /** Whether multiple items can be selected. */
      multiselectable?: boolean;
      /** Whether the element is read-only. */
      readonly?: boolean;
      /** Whether the element is required. */
      required?: boolean;
      /** Whether the element is selected. */
      selected?: boolean;
    };
  };

  // Internal properties
  /** Whether static nodes need to be re-rendered. */
  isStaticDirty?: boolean;
  /** Reference to the Static component node. */
  staticNode?: DOMElement;
  /** Callback to compute layout before rendering. */
  onComputeLayout?: () => void;
  /** Callback to trigger a render. */
  onRender?: () => void;
  /** Callback to trigger an immediate render. */
  onImmediateRender?: () => void;
  /** Set of resize observers attached to this element. */
  resizeObservers?: Set<SizeObserver>;
} & TinkyNode;

/**
 * Interface representing a text node in Tinky.
 */
export type TextNode = {
  /** Text node identifier. */
  nodeName: TextName;
  /** Text content of the node. */
  nodeValue: string;
} & TinkyNode;

/**
 * Union type representing either a DOM element or a text node.
 */
export type DOMNode<T = { nodeName: NodeNames }> = T extends {
  nodeName: infer U;
}
  ? U extends "#text"
    ? TextNode
    : DOMElement
  : never;

/**
 * Type representing possible types for DOM node attributes.
 */
export type DOMNodeAttribute = boolean | string | number;

/**
 * Creates a new DOM element.
 *
 * @param nodeName - The name of the node to create.
 * @returns The created DOM element.
 */
export const createNode = (nodeName: ElementNames): DOMElement => {
  const node: DOMElement = {
    nodeName,
    style: {},
    attributes: {},
    childNodes: [],
    parentNode: undefined,
    taffyNode:
      nodeName === "tinky-virtual-text" ? undefined : new TaffyNode(nodeName),
    internal_accessibility: {},
  };

  if (nodeName === "tinky-text" && node.taffyNode) {
    node.taffyNode.measureFunc = measureTextNode.bind(null, node);
  }

  return node;
};

/**
 * Appends a child node to a parent node.
 *
 * @param node - The parent node.
 * @param childNode - The child node to append.
 */
export const appendChildNode = (
  node: DOMElement,
  childNode: DOMElement,
): void => {
  if (childNode.parentNode) {
    removeChildNode(childNode.parentNode, childNode);
  }

  childNode.parentNode = node;
  node.childNodes.push(childNode);

  if (childNode.taffyNode) {
    node.taffyNode?.tree.addChild(node.taffyNode.id, childNode.taffyNode.id);
  }

  if (
    node.nodeName === "tinky-text" ||
    node.nodeName === "tinky-virtual-text"
  ) {
    markNodeAsDirty(node);
  }
};

/**
 * Inserts a new child node before a reference node.
 *
 * @param node - The parent node.
 * @param newChildNode - The new child node to insert.
 * @param beforeChildNode - The reference node before which to insert the new node.
 */
export const insertBeforeNode = (
  node: DOMElement,
  newChildNode: DOMNode,
  beforeChildNode: DOMNode,
): void => {
  if (newChildNode.parentNode) {
    removeChildNode(newChildNode.parentNode, newChildNode);
  }

  newChildNode.parentNode = node;

  const index = node.childNodes.indexOf(beforeChildNode);
  if (index >= 0) {
    node.childNodes.splice(index, 0, newChildNode);
    if (newChildNode.taffyNode) {
      node.taffyNode?.tree.insertChildAtIndex(
        node.taffyNode.id,
        index,
        newChildNode.taffyNode.id,
      );
    }

    return;
  }

  node.childNodes.push(newChildNode);

  if (newChildNode.taffyNode) {
    node.taffyNode?.tree.addChild(node.taffyNode.id, newChildNode.taffyNode.id);
  }

  if (
    node.nodeName === "tinky-text" ||
    node.nodeName === "tinky-virtual-text"
  ) {
    markNodeAsDirty(node);
  }
};

/**
 * Removes a child node from a parent node.
 *
 * @param node - The parent node.
 * @param removeNode - The child node to remove.
 */
export const removeChildNode = (
  node: DOMElement,
  removeNode: DOMNode,
): void => {
  if (removeNode.taffyNode) {
    removeNode.parentNode?.taffyNode?.tree.removeChild(
      removeNode.parentNode.taffyNode.id,
      removeNode.taffyNode.id,
    );
  }

  removeNode.parentNode = undefined;

  const index = node.childNodes.indexOf(removeNode);
  if (index >= 0) {
    node.childNodes.splice(index, 1);
  }

  if (
    node.nodeName === "tinky-text" ||
    node.nodeName === "tinky-virtual-text"
  ) {
    markNodeAsDirty(node);
  }
};

/**
 * Sets an attribute on a DOM element.
 *
 * @param node - The DOM element.
 * @param key - The attribute key.
 * @param value - The attribute value.
 */
export const setAttribute = (
  node: DOMElement,
  key: string,
  value: DOMNodeAttribute,
): void => {
  if (key === "internal_accessibility") {
    node.internal_accessibility = value as DOMElement["internal_accessibility"];
    return;
  }

  node.attributes[key] = value;
};

/**
 * Sets the style of a DOM node.
 *
 * @param node - The DOM node.
 * @param style - The style object.
 */
export const setStyle = (node: DOMNode, style: Styles): void => {
  node.style = style;
};

/**
 * Creates a text node.
 *
 * @param text - The text content.
 * @returns The created text node.
 */
export const createTextNode = (text: string): TextNode => {
  const node: TextNode = {
    nodeName: "#text",
    nodeValue: text,
    taffyNode: undefined,
    parentNode: undefined,
    style: {},
  };

  setTextNodeValue(node, text);

  return node;
};

/**
 * Measures the dimensions of a text node.
 *
 * @param node - The text node to measure.
 * @param width - The available width constraint.
 * @returns The measured width and height.
 */
const measureTextNode = function (
  node: DOMNode,
  width: AvailableSpace,
): { width: number; height: number } {
  const text =
    node.nodeName === "#text" ? node.nodeValue : squashTextNodes(node);

  // For minContent mode, compute the minimum possible width for the text.
  // This is the width of the widest character (e.g., emojis are typically 2
  // columns, ASCII chars are 1).
  if (width === "min-content") {
    const chars = [...text];
    const maxCharWidth = Math.max(...chars.map((c) => stringWidth(c)), 1);
    const textWrap = node.style?.textWrap ?? "wrap";
    const wrappedText = wrapText(text, maxCharWidth, textWrap);
    return measureText(wrappedText);
  }

  const dimensions = measureText(text);

  // For maxContent mode, return the natural text dimensions without wrapping
  if (width === "max-content") {
    return dimensions;
  }

  // For definite mode with width constraint:
  // Text fits into container, no need to wrap
  if (dimensions.width <= width) {
    return dimensions;
  }

  // This is happening when <Box> is shrinking child nodes and layout engine
  // asks if we can fit this text node in a <1px space, so we just tell it "no"
  if (dimensions.width >= 1 && width > 0 && width < 1) {
    return dimensions;
  }

  const textWrap = node.style?.textWrap ?? "wrap";
  const wrappedText = wrapText(text, width, textWrap);

  return measureText(wrappedText);
};

/**
 * Finds the closest Taffy node for a given DOM node.
 * Traverses up the DOM tree until a node with a Taffy node is found.
 *
 * @param node - The DOM node to start searching from.
 * @returns The closest Taffy node or undefined if not found.
 */
const findClosestTaffyNode = (node?: DOMNode): TaffyNode | undefined => {
  if (!node?.parentNode) {
    return undefined;
  }

  return node.taffyNode ?? findClosestTaffyNode(node.parentNode);
};

/**
 * Marks a node as dirty, triggering a re-measure of its layout.
 *
 * @param node - The DOM node to mark as dirty.
 */
const markNodeAsDirty = (node?: DOMNode): void => {
  // Mark closest Taffy node as dirty to measure text dimensions again
  const taffyNode = findClosestTaffyNode(node);
  taffyNode?.tree.markDirty(taffyNode.id);
};

/**
 * Sets the value of a text node.
 *
 * @param node - The text node.
 * @param text - The new text value.
 */
export const setTextNodeValue = (node: TextNode, text: string): void => {
  if (typeof text !== "string") {
    text = String(text);
  }

  node.nodeValue = text;
  markNodeAsDirty(node);
};
