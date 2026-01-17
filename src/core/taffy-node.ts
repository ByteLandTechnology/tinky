import {
  loadTaffy,
  AlignItems,
  type AvailableSpace,
  Display,
  FlexDirection,
  Style,
  TaffyTree,
} from "taffy-layout";
import { type ElementNames } from "./dom.js";

// Initialize Taffy and create a global tree instance
await loadTaffy();

/**
 * Global Taffy tree instance used for all layout calculations.
 * Taffy is a high-performance, cross-platform UI layout library.
 */
const taffyTree = new TaffyTree();

/**
 * Represents a node in the Taffy layout tree.
 * This class wraps a Taffy node ID and manages its lifecycle.
 */
export class TaffyNode {
  /**
   * The Taffy tree instance this node belongs to.
   */
  tree: TaffyTree;

  /**
   * Unique identifier for the node within the Taffy tree.
   */
  id: bigint;

  /**
   * Callback function to measure the content of the node.
   * Used for text nodes or other content with intrinsic size.
   *
   * @param width - Available width for content.
   * @returns Element dimensions.
   */
  measureFunc?: (width: AvailableSpace) => { width: number; height: number };

  /**
   * Creates a new TaffyNode.
   *
   * @param nodeName - The name of the element.
   */
  constructor(nodeName?: ElementNames) {
    this.tree = taffyTree;
    const style = new Style();
    style.display = Display.Flex;
    style.flexDirection =
      nodeName === "tinky-root" ? FlexDirection.Column : FlexDirection.Row;
    style.alignItems = AlignItems.Stretch;
    this.id = this.tree.newLeafWithContext(style, this);
  }

  /**
   * Removes the node and all its descendants from the Taffy tree.
   * Necessary to prevent memory leaks as Taffy nodes aren't GC'd automatically.
   */
  free() {
    for (const childId of this.tree.children(this.id)) {
      this.freeRecursive(childId);
    }

    this.tree.remove(this.id);
  }

  /**
   * Recursively removes a node and all its descendants from the Taffy tree.
   *
   * @param id - The ID of the node to remove.
   */
  private freeRecursive(id: bigint) {
    for (const childId of this.tree.children(id)) {
      this.freeRecursive(childId);
    }

    this.tree.remove(id);
  }
}
