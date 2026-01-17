import { useMemo, useState, useLayoutEffect, type ReactNode } from "react";
import { type Styles } from "../core/styles.js";

/**
 * Props for the Static component.
 */
export interface StaticProps<T> {
  /**
   * Array of items of any type to render using the function you pass as a
   * child.
   */
  readonly items: T[];

  /**
   * Styles to apply to a container of child elements. See <Box> for properties.
   */
  readonly style?: Styles;

  /**
   * Function called to render each item in `items`. First arg is the item,
   * second is its index. Note that a `key` must be assigned to the root
   * component.
   */
  readonly children: (item: T, index: number) => ReactNode;
}

/**
 * `<Static>` component permanently renders its output above everything else.
 * It's useful for displaying activity like completed tasks or logs—things that
 * don't change after they're rendered (hence the name "Static").
 *
 * It's preferred to use `<Static>` for use cases when you can't know or control
 * the number of items that need to be rendered.
 *
 * @example
 * ```tsx
 * import {render, Static, Text} from 'tinky';
 *
 * const items = ['Item 1', 'Item 2', 'Item 3'];
 *
 * render(
 *   <Static items={items}>
 *     {(item, index) => (
 *       <Text key={index} color="green">
 *         {item}
 *       </Text>
 *     )}
 *   </Static>
 * );
 * ```
 */
export function Static<T>(props: StaticProps<T>) {
  const { items, children: render, style: customStyle } = props;
  const [index, setIndex] = useState(0);

  const itemsToRender: T[] = useMemo(() => {
    return items.slice(index);
  }, [items, index]);

  useLayoutEffect(() => {
    setIndex(items.length);
  }, [items.length]);

  const children = itemsToRender.map((item, itemIndex) => {
    return render(item, index + itemIndex);
  });

  const style: Styles = useMemo(
    () => ({
      position: "absolute",
      flexDirection: "column",
      ...customStyle,
    }),
    [customStyle],
  );

  return (
    <tinky-box internal_static style={style}>
      {children}
    </tinky-box>
  );
}
