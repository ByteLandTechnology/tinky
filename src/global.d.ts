import { type ReactNode, type Key, type Ref } from "react";
import { type Except } from "type-fest";
import { type DOMElement } from "./dom.js";
import { type Styles } from "./styles.js";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "tinky-box": Tinky.Box;
      "tinky-text": Tinky.Text;
    }
  }
}

/**
 * Namespace for Tinky-specific types.
 */
declare namespace Tinky {
  /**
   * Props for the internal tinky-box element.
   */
  interface Box {
    internal_static?: boolean;
    children?: ReactNode;
    key?: Key;
    ref?: Ref<DOMElement>;
    style?: Except<Styles, "textWrap">;
    internal_accessibility?: DOMElement["internal_accessibility"];
  }

  /**
   * Props for the internal tinky-text element.
   */
  interface Text {
    children?: ReactNode;
    key?: Key;
    style?: Styles;

    internal_transform?: (children: string, index: number) => string;
    internal_accessibility?: DOMElement["internal_accessibility"];
  }
}
