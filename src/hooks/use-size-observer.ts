import { useCallback, useRef, useState } from "react";
import { type DOMElement } from "../core/dom.js";
import { type Dimension } from "../utils/dimension.js";
import { measureElement } from "../utils/measure-element.js";
import { SizeObserver, type SizeObserverEntry } from "../core/size-observer.js";
import { reconciler } from "../core/reconciler.js";

/**
 * Options for the `useSizeObserver` hook.
 */
export interface SizeObserverOptions {
  /**
   * Enable or disable the size observer.
   *
   * @defaultValue true
   */
  isActive?: boolean;
}

/**
 * Hook that observes the computed layout dimensions of a `<Box>` element
 * and triggers a re-render whenever its size changes.
 *
 * The observer is registered in a global resize observer registry that is
 * invoked by the Tinky core after each layout computation pass. This means
 * size changes are detected regardless of which component caused the
 * re-render — including sibling updates and terminal resize events.
 *
 * Multiple observers can be attached to the same element.
 *
 * This is similar to HTML's `SizeObserver` API.
 *
 * @example
 * ```tsx
 * import { Box, Text, useSizeObserver } from 'tinky';
 *
 * function MyComponent() {
 *   const [ref, width, height] = useSizeObserver();
 *
 *   return (
 *     <Box ref={ref} width="50%" height={10}>
 *       <Text>Size: {width}x{height}</Text>
 *     </Box>
 *   );
 * }
 * ```
 *
 * @param options - Configuration options.
 * @returns A tuple containing `[refCallback, width, height]`. Attach `refCallback` to a `<Box>` element.
 */
export const useSizeObserver = (
  options: SizeObserverOptions = {},
): [(node: DOMElement | null) => void, number, number] => {
  const [size, setSize] = useState<Dimension>({ width: 0, height: 0 });
  const observerRef = useRef<SizeObserver | null>(null);
  const prevSize = useRef<Dimension>({ width: 0, height: 0 });
  const { isActive = true } = options;

  const callbackRef = useCallback(
    (node: DOMElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // If active and node is attached, start observing
      if (isActive && node) {
        const callback = (entries: SizeObserverEntry[]) => {
          if (entries.length === 0) return;

          const { dimension } = entries[0];
          if (
            dimension.width !== prevSize.current.width ||
            dimension.height !== prevSize.current.height
          ) {
            prevSize.current = { ...dimension };
            reconciler.batchedUpdates(() => {
              setSize({ ...dimension });
            }, null);
          }
        };

        const observer = new SizeObserver(callback);

        // Read initial dimensions
        const initial = measureElement(node);
        callback([{ target: node, dimension: initial }]);

        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [isActive],
  );

  return [callbackRef, size.width, size.height];
};
