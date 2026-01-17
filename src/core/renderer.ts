import {
  renderNodeToOutput,
  renderNodeToScreenReaderOutput,
} from "./render-node-to-output.js";
import { Output } from "./output.js";
import { type DOMElement } from "./dom.js";

/**
 * Interface representing the result of a render operation.
 */
interface Result {
  /**
   * The rendered string output.
   */
  output: string;

  /**
   * The height of the rendered output in lines.
   */
  outputHeight: number;

  /**
   * The static output generated during rendering (e.g., from <Static>).
   */
  staticOutput: string;
}

/**
 * Renders the DOM tree to a string output.
 *
 * @param node - The root DOM element to render.
 * @param isScreenReaderEnabled - Whether screen reader support is enabled.
 * @returns The render result with output string, height, and static output.
 */
export const renderer = (
  node: DOMElement,
  isScreenReaderEnabled: boolean,
): Result => {
  if (node.taffyNode) {
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
        output,
        outputHeight,
        staticOutput: staticOutput ? `${staticOutput}\n` : "",
      };
    }

    const layout = node.taffyNode.tree.getLayout(node.taffyNode.id);

    const output = new Output({
      width: layout.width,
      height: layout.height,
    });

    renderNodeToOutput(node, output, {
      skipStaticElements: true,
    });

    let staticOutput;

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

    const { output: generatedOutput, height: outputHeight } = output.get();

    return {
      output: generatedOutput,
      outputHeight,
      // Newline at the end is needed, because static output doesn't have one,
      // so interactive output will override last line of static output
      staticOutput: staticOutput ? `${staticOutput.get().output}\n` : "",
    };
  }

  return {
    output: "",
    outputHeight: 0,
    staticOutput: "",
  };
};
