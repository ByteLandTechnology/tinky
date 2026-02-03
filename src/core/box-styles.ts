/**
 * @module box-styles
 *
 * This module provides box drawing characters for rendering borders in the terminal.
 * It defines various border styles (single, double, round, bold, etc.) that can be
 * used to create visually appealing boxes around content.
 */

/**
 * Style of the box border.
 * Defines the characters used for each part of a box border.
 */
export interface BoxStyle {
  readonly topLeft: string;
  readonly top: string;
  readonly topRight: string;
  readonly right: string;
  readonly bottomRight: string;
  readonly bottom: string;
  readonly bottomLeft: string;
  readonly left: string;
}

/**
 * All available box styles.
 * Provides a collection of predefined border styles for terminal boxes.
 */
export interface Boxes {
  /**
   * Single-line box style.
   * @example
   * ```
   * ┌────┐
   * │    │
   * └────┘
   * ```
   */
  readonly single: BoxStyle;

  /**
   * Double-line box style.
   * @example
   * ```
   * ╔════╗
   * ║    ║
   * ╚════╝
   * ```
   */
  readonly double: BoxStyle;

  /**
   * Rounded corner box style.
   * @example
   * ```
   * ╭────╮
   * │    │
   * ╰────╯
   * ```
   */
  readonly round: BoxStyle;

  /**
   * Bold line box style.
   * @example
   * ```
   * ┏━━━━┓
   * ┃    ┃
   * ┗━━━━┛
   * ```
   */
  readonly bold: BoxStyle;

  /**
   * Single horizontal, double vertical box style.
   * @example
   * ```
   * ╓────╖
   * ║    ║
   * ╙────╜
   * ```
   */
  readonly singleDouble: BoxStyle;

  /**
   * Double horizontal, single vertical box style.
   * @example
   * ```
   * ╒════╕
   * │    │
   * ╘════╛
   * ```
   */
  readonly doubleSingle: BoxStyle;

  /**
   * Classic ASCII box style.
   * @example
   * ```
   * +----+
   * |    |
   * +----+
   * ```
   */
  readonly classic: BoxStyle;

  /**
   * Arrow-based box style.
   * @example
   * ```
   * ↘↓↓↓↓↙
   * →    ←
   * ↗↑↑↑↑↖
   * ```
   */
  readonly arrow: BoxStyle;
}

/**
 * Predefined box styles for use in the terminal.
 *
 * @example
 * ```typescript
 * import { boxStyles } from './box-styles';
 *
 * console.log(boxStyles.single);
 * // {
 * //   topLeft: '┌',
 * //   top: '─',
 * //   topRight: '┐',
 * //   right: '│',
 * //   bottomRight: '┘',
 * //   bottom: '─',
 * //   bottomLeft: '└',
 * //   left: '│'
 * // }
 * ```
 */
export const boxStyles: Boxes = {
  single: {
    topLeft: "┌",
    top: "─",
    topRight: "┐",
    right: "│",
    bottomRight: "┘",
    bottom: "─",
    bottomLeft: "└",
    left: "│",
  },
  double: {
    topLeft: "╔",
    top: "═",
    topRight: "╗",
    right: "║",
    bottomRight: "╝",
    bottom: "═",
    bottomLeft: "╚",
    left: "║",
  },
  round: {
    topLeft: "╭",
    top: "─",
    topRight: "╮",
    right: "│",
    bottomRight: "╯",
    bottom: "─",
    bottomLeft: "╰",
    left: "│",
  },
  bold: {
    topLeft: "┏",
    top: "━",
    topRight: "┓",
    right: "┃",
    bottomRight: "┛",
    bottom: "━",
    bottomLeft: "┗",
    left: "┃",
  },
  singleDouble: {
    topLeft: "╓",
    top: "─",
    topRight: "╖",
    right: "║",
    bottomRight: "╜",
    bottom: "─",
    bottomLeft: "╙",
    left: "║",
  },
  doubleSingle: {
    topLeft: "╒",
    top: "═",
    topRight: "╕",
    right: "│",
    bottomRight: "╛",
    bottom: "═",
    bottomLeft: "╘",
    left: "│",
  },
  classic: {
    topLeft: "+",
    top: "-",
    topRight: "+",
    right: "|",
    bottomRight: "+",
    bottom: "-",
    bottomLeft: "+",
    left: "|",
  },
  arrow: {
    topLeft: "↘",
    top: "↓",
    topRight: "↙",
    right: "←",
    bottomRight: "↖",
    bottom: "↑",
    bottomLeft: "↗",
    left: "→",
  },
};
