import { type DOMElement, type DOMNode } from "./dom.js";
import { type Dimension } from "../utils/dimension.js";

/**
 * Interface for elements returned by the SizeObserver callback.
 */
export interface SizeObserverEntry {
  target: DOMElement;
  dimension: Dimension;
}

/**
 * Callback type for resize observers.
 */
export type SizeObserverCallback = (
  entries: SizeObserverEntry[],
  observer: SizeObserver,
) => void;

/**
 * Global registry mapping DOMElements to their registered SizeObservers.
 */
export const resizeObserverRegistry = new Map<DOMElement, Set<SizeObserver>>();

/**
 * Implements a SizeObserver API similar to the HTML specification.
 * It allows observing changes to the computed dimensions of Tinky DOM elements.
 */
export class SizeObserver {
  private callback: SizeObserverCallback;

  /**
   * Creates a new SizeObserver.
   *
   * @param callback - The function to call when observed elements resize.
   */
  constructor(callback: SizeObserverCallback) {
    this.callback = callback;
  }

  /**
   * Starts observing the specified element.
   *
   * @param target - The element to observe.
   */
  observe(target: DOMElement): void {
    if (!target.resizeObservers) {
      target.resizeObservers = new Set();
    }
    target.resizeObservers.add(this);

    let observers = resizeObserverRegistry.get(target);
    if (!observers) {
      observers = new Set();
      resizeObserverRegistry.set(target, observers);
    }
    observers.add(this);
  }

  /**
   * Stops observing the specified element.
   *
   * @param target - The element to stop observing.
   */
  unobserve(target: DOMElement): void {
    target.resizeObservers?.delete(this);

    if (target.resizeObservers?.size === 0) {
      target.resizeObservers = undefined;
    }

    const observers = resizeObserverRegistry.get(target);
    if (observers) {
      observers.delete(this);
      if (observers.size === 0) {
        resizeObserverRegistry.delete(target);
      }
    }
  }

  /**
   * Stops observing all elements.
   */
  disconnect(): void {
    for (const [target, observers] of resizeObserverRegistry.entries()) {
      if (observers.has(this)) {
        this.unobserve(target);
      }
    }
  }

  /** @internal */
  _invokeCallback(entries: SizeObserverEntry[]): void {
    this.callback(entries, this);
  }
}

/**
 * Removes all resize observers from a node and its descendants.
 * Called during mutation cleanup to prevent stale observer entries.
 *
 * @param node - Root of the removed subtree.
 */
export const removeSizeObserversInSubtree = (node: DOMNode): void => {
  if (node.nodeName === "#text") {
    return;
  }

  if (node.resizeObservers) {
    // Collect all observers to avoid disconnecting while iterating
    const observers = Array.from(node.resizeObservers);
    for (const observer of observers) {
      observer.unobserve(node);
    }
    node.resizeObservers = undefined;
  }

  // Not strictly necessary here since unobserve handles it,
  // but good for completeness in case it fell through
  resizeObserverRegistry.delete(node);

  for (const childNode of node.childNodes) {
    removeSizeObserversInSubtree(childNode);
  }
};

/**
 * Notifies all registered resize observers of their current dimensions.
 * Called by the Tinky instance after each layout computation pass.
 */
export const notifySizeObservers = (): void => {
  const entriesByObserver = new Map<SizeObserver, SizeObserverEntry[]>();

  for (const [node, observers] of resizeObserverRegistry.entries()) {
    if (!node.taffyNode) {
      continue;
    }

    let layout;
    try {
      layout = node.taffyNode.tree.getLayout(node.taffyNode.id);
    } catch {
      // Node was removed from the tree before passive effect cleanup ran.
      const nodeObservers = Array.from(observers);
      for (const observer of nodeObservers) {
        observer.unobserve(node);
      }
      continue;
    }

    const dimension: Dimension = {
      width: layout?.width ?? 0,
      height: layout?.height ?? 0,
    };

    const entry: SizeObserverEntry = { target: node, dimension };

    for (const observer of observers) {
      let entries = entriesByObserver.get(observer);
      if (!entries) {
        entries = [];
        entriesByObserver.set(observer, entries);
      }
      entries.push(entry);
    }
  }

  for (const [observer, entries] of entriesByObserver.entries()) {
    observer._invokeCallback(entries);
  }
};
