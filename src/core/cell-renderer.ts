import {
  renderNodeToOutput,
  renderNodeToScreenReaderOutput,
} from "./render-node-to-output.js";
import { Output } from "./output.js";
import { type DOMElement } from "./dom.js";
import { type CellBuffer } from "./cell-buffer.js";
import { CellOutput } from "./cell-output.js";

interface CellRendererResult {
  /** Interactive frame rendered into `buffer`. */
  buffer: CellBuffer;
  /** Height (rows) of the interactive frame. */
  outputHeight: number;
  /** Newly appended `<Static>` output, with trailing newline when present. */
  staticOutput: string;
  /** Screen-reader text when screen-reader mode is enabled. */
  screenReaderOutput?: string;
}

/**
 * Renderer that writes interactive output into a CellBuffer.
 *
 * Static output is still rendered as string output because it is emitted once
 * and not updated incrementally.
 *
 * @param node - Root DOM node to render.
 * @param buffer - Reusable destination buffer for the interactive frame.
 * @param isScreenReaderEnabled - Enables screen-reader rendering path.
 * @returns The rendered interactive frame and any static output emitted this pass.
 */
export const cellRenderer = (
  node: DOMElement,
  buffer: CellBuffer,
  isScreenReaderEnabled: boolean,
): CellRendererResult => {
  if (!node.taffyNode) {
    buffer.resize(0, 0);
    buffer.clear();
    return { buffer, outputHeight: 0, staticOutput: "" };
  }

  if (isScreenReaderEnabled) {
    const output = renderNodeToScreenReaderOutput(node, {
      skipStaticElements: true,
    });

    const outputHeight = output === "" ? 0 : output.split("\n").length;
    let staticOutput = "";

    if (node.staticNode) {
      staticOutput = renderNodeToScreenReaderOutput(node.staticNode, {
        skipStaticElements: false,
      });
    }

    return {
      buffer,
      outputHeight,
      staticOutput: staticOutput ? `${staticOutput}\n` : "",
      screenReaderOutput: output,
    };
  }

  const layout = node.taffyNode.tree.getLayout(node.taffyNode.id);
  buffer.resize(layout.width, layout.height);
  buffer.clear();

  const output = new CellOutput(buffer);
  renderNodeToOutput(node, output, { skipStaticElements: true });

  let staticOutput: Output | undefined;
  if (node.staticNode?.taffyNode) {
    const staticLayout = node.staticNode.taffyNode.tree.getLayout(
      node.staticNode.taffyNode.id,
    );

    staticOutput = new Output({
      width: staticLayout.width,
      height: staticLayout.height,
    });

    renderNodeToOutput(node.staticNode, staticOutput, {
      skipStaticElements: false,
    });
  }

  return {
    buffer,
    outputHeight: buffer.height,
    staticOutput: staticOutput ? `${staticOutput.get().output}\n` : "",
  };
};
