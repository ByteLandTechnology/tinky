import createReconciler, {
  type OpaqueRoot,
  type ReactContext,
} from "react-reconciler";
import ReactReconciler from "react-reconciler";
import {
  DefaultEventPriority,
  NoEventPriority,
} from "react-reconciler/constants.js";
import { Display } from "taffy-layout";
import { createContext, ReactNode } from "react";
import {
  createTextNode,
  appendChildNode,
  insertBeforeNode,
  removeChildNode,
  setStyle,
  setTextNodeValue,
  createNode,
  setAttribute,
  type DOMNodeAttribute,
  type TextNode,
  type ElementNames,
  type DOMElement,
} from "./dom.js";
import { applyStyles, type Styles } from "./styles.js";
import { type OutputTransformer } from "./render-node-to-output.js";
import type { TaffyNode } from "./taffy-node.js";
import { process } from "../utils/node-adapter.js";
import { removeSizeObserversInSubtree } from "./size-observer.js";

// We need to conditionally perform devtools connection to avoid
// accidentally breaking other third-party code.
if (process?.env?.["DEV"] === "true") {
  try {
    await import("./devtools.js");
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "ERR_MODULE_NOT_FOUND") {
      console.warn(
        "Tinky: Env variable DEV is true, but `react-devtools-core` is missing.\n" +
          "Install it to use React Devtools: npm i -D react-devtools-core\n",
      );
    } else {
      throw error;
    }
  }
}

type AnyObject = Record<string, unknown>;

/**
 * Calculates the difference between two objects.
 *
 * @param before - The object before update.
 * @param after - The object after update.
 * @returns Object with changed keys and new values, or undefined if no changes.
 */
const diff = (before: AnyObject, after: AnyObject): AnyObject | undefined => {
  if (before === after) {
    return;
  }

  if (!before) {
    return after;
  }

  const changed: AnyObject = {};
  let isChanged = false;

  for (const key of Object.keys(before)) {
    const isDeleted = after ? !Object.hasOwn(after, key) : true;

    if (isDeleted) {
      changed[key] = undefined;
      isChanged = true;
    }
  }

  if (after) {
    for (const key of Object.keys(after)) {
      if (after[key] !== before[key]) {
        changed[key] = after[key];
        isChanged = true;
      }
    }
  }

  return isChanged ? changed : undefined;
};

/**
 * Cleans up a Taffy node by freeing its resources.
 *
 * @param node - The Taffy node to cleanup.
 */
const cleanupTaffyNode = (node?: TaffyNode): void => {
  node?.free();
};

type ReconcilerProps = Record<string, unknown>;

/**
 * Host context for tracking whether we're inside a Text component.
 */
interface HostContext {
  /** Whether the current node is inside a Text component. */
  isInsideText: boolean;
}

let currentUpdatePriority = NoEventPriority;

/**
 * Reference to the current root DOM element during rendering.
 * Used to track static node state across renders.
 */
let currentRootNode: DOMElement | undefined;

/**
 * React reconciler implementation for Tinky.
 * Handles the mapping between React components and Tinky's DOM-like structure.
 */
export const reconciler = createReconciler<
  ElementNames,
  ReconcilerProps,
  DOMElement,
  DOMElement,
  TextNode,
  DOMElement,
  unknown,
  unknown,
  unknown,
  HostContext,
  unknown,
  unknown,
  unknown,
  unknown
>({
  getRootHostContext: () => ({
    isInsideText: false,
  }),
  prepareForCommit: () => null,
  preparePortalMount: () => null,
  clearContainer: () => false,
  resetAfterCommit(rootNode) {
    if (typeof rootNode.onComputeLayout === "function") {
      rootNode.onComputeLayout();
    }

    // Since renders are throttled at the instance level and <Static> component
    // children are rendered only once and then get deleted, we need an escape
    // hatch to trigger an immediate render to ensure <Static> children are
    // written to output before they get erased
    if (rootNode.isStaticDirty) {
      rootNode.isStaticDirty = false;
      if (typeof rootNode.onImmediateRender === "function") {
        rootNode.onImmediateRender();
      }

      return;
    }

    if (typeof rootNode.onRender === "function") {
      rootNode.onRender();
    }
  },
  getChildHostContext(parentHostContext, type) {
    const previousIsInsideText = parentHostContext.isInsideText;
    const isInsideText = type === "tinky-text" || type === "tinky-virtual-text";

    if (previousIsInsideText === isInsideText) {
      return parentHostContext;
    }

    return { isInsideText };
  },
  shouldSetTextContent: () => false,
  createInstance(originalType, newProps, rootNode, hostContext) {
    if (hostContext.isInsideText && originalType === "tinky-box") {
      throw new Error(`<Box> can’t be nested inside <Text> component`);
    }

    const type =
      originalType === "tinky-text" && hostContext.isInsideText
        ? "tinky-virtual-text"
        : originalType;

    const node = createNode(type);

    for (const [key, value] of Object.entries(newProps)) {
      if (key === "children") {
        continue;
      }

      if (key === "style") {
        setStyle(node, value as Styles);

        if (node.taffyNode) {
          applyStyles(node.taffyNode, value as Styles);
        }

        continue;
      }

      if (key === "internal_transform") {
        node.internal_transform = value as OutputTransformer;
        continue;
      }

      if (key === "internal_static") {
        currentRootNode = rootNode;
        node.internal_static = true;
        rootNode.isStaticDirty = true;

        // Save reference to <Static> node to skip traversal of entire
        // node tree to find it
        rootNode.staticNode = node;
        continue;
      }

      setAttribute(node, key, value as DOMNodeAttribute);
    }

    return node;
  },
  createTextInstance(text, _root, hostContext) {
    if (!hostContext.isInsideText) {
      throw new Error(
        `Text string "${text}" must be rendered inside <Text> component`,
      );
    }

    return createTextNode(text);
  },
  resetTextContent() {
    // no-op
  },
  hideTextInstance(node) {
    setTextNodeValue(node, "");
  },
  unhideTextInstance(node, text) {
    setTextNodeValue(node, text);
  },
  getPublicInstance: (instance) => instance,
  hideInstance(node) {
    const style = node.taffyNode?.tree.getStyle(node.taffyNode.id);
    if (style) {
      style.display = Display.None;
      node.taffyNode?.tree.setStyle(node.taffyNode.id, style);
    }
  },
  unhideInstance(node) {
    const style = node.taffyNode?.tree.getStyle(node.taffyNode.id);
    if (style) {
      style.display = Display.Flex;
      node.taffyNode?.tree.setStyle(node.taffyNode.id, style);
    }
  },
  appendInitialChild: appendChildNode,
  appendChild: appendChildNode,
  insertBefore: insertBeforeNode,
  finalizeInitialChildren() {
    return false;
  },
  isPrimaryRenderer: true,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  beforeActiveInstanceBlur() {
    // no-op
  },
  afterActiveInstanceBlur() {
    // no-op
  },
  detachDeletedInstance() {
    // no-op
  },
  getInstanceFromNode: () => null,
  prepareScopeUpdate() {
    // no-op
  },
  getInstanceFromScope: () => null,
  appendChildToContainer: appendChildNode,
  insertInContainerBefore: insertBeforeNode,
  removeChildFromContainer(node, removeNode) {
    removeChildNode(node, removeNode);
    removeSizeObserversInSubtree(removeNode);
    cleanupTaffyNode(removeNode.taffyNode);
  },
  commitUpdate(node, _type, oldProps, newProps) {
    if (currentRootNode && node.internal_static) {
      currentRootNode.isStaticDirty = true;
    }

    const props = diff(oldProps, newProps);

    const style = diff(
      oldProps["style"] as AnyObject,
      newProps["style"] as AnyObject,
    );

    if (!props && !style) {
      return;
    }

    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (key === "style") {
          setStyle(node, value as Styles);
          continue;
        }

        if (key === "internal_transform") {
          node.internal_transform = value as OutputTransformer;
          continue;
        }

        if (key === "internal_static") {
          node.internal_static = true;
          continue;
        }

        setAttribute(node, key, value as DOMNodeAttribute);
      }
    }

    if (style && node.taffyNode) {
      applyStyles(node.taffyNode, style);
    }
  },
  commitTextUpdate(node, _oldText, newText) {
    setTextNodeValue(node, newText);
  },
  removeChild(node, removeNode) {
    removeChildNode(node, removeNode);
    removeSizeObserversInSubtree(removeNode);
    cleanupTaffyNode(removeNode.taffyNode);
  },
  setCurrentUpdatePriority(newPriority: number) {
    currentUpdatePriority = newPriority;
  },
  getCurrentUpdatePriority: () => currentUpdatePriority,
  resolveUpdatePriority() {
    if (currentUpdatePriority !== NoEventPriority) {
      return currentUpdatePriority;
    }

    return DefaultEventPriority;
  },
  maySuspendCommit() {
    return false;
  },
  NotPendingTransition: undefined,
  HostTransitionContext: createContext(
    null,
  ) as unknown as ReactContext<unknown>,
  resetFormInstance() {
    // no-op
  },
  requestPostPaintCallback() {
    // no-op
  },
  shouldAttemptEagerTransition() {
    return false;
  },
  trackSchedulerEvent() {
    // no-op
  },
  resolveEventType() {
    return null;
  },
  resolveEventTimeStamp() {
    return -1.1;
  },
  preloadInstance() {
    return true;
  },
  startSuspendingCommit() {
    // no-op
  },
  suspendInstance() {
    // no-op
  },
  waitForCommitToBeReady() {
    return null;
  },
}) as unknown as ReactReconciler.Reconciler<
  DOMElement,
  DOMElement,
  TextNode,
  DOMElement,
  unknown,
  unknown
> & {
  updateContainerSync: (
    element: ReactNode,
    container: OpaqueRoot,
    parentComponent?: null,
    callback?: (() => void) | null,
  ) => void;
  flushSyncWork: () => void;
};
