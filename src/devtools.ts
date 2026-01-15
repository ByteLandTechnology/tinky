import "./devtools-window-polyfill.js";

import devtools from "react-devtools-core";

/**
 * Initializes React DevTools for Tinky functionality.
 * This sets up the WebSocket connection required for the standalone DevTools.
 */
devtools.initialize();
devtools.connectToDevTools();
