import ws from "ws";

// Define a custom interface to extend the global Node.js environment
// with properties expected by React DevTools.
interface CustomGlobal {
  WebSocket?: typeof ws;
  window?: typeof globalThis & {
    __REACT_DEVTOOLS_COMPONENT_FILTERS__?: {
      type: number;
      value: number | string;
      isEnabled: boolean;
      isValid?: boolean;
    }[];
  };
  self?: typeof globalThis;
}

const customGlobal = global as unknown as CustomGlobal;

// Polyfill WebSocket for React DevTools backend communication.
// Node.js does not have a native WebSocket implementation, so we use 'ws'.
customGlobal.WebSocket ||= ws;

// Polyfill 'window' and 'self' to point to the global object.
// React DevTools expects a browser-like environment where these exist.
customGlobal.window ||= global;

customGlobal.self ||= global;

// Configure filters to hide internal Tinky components from the React DevTools
// component tree.
// This keeps the DevTools view clean, showing only the user's components.
customGlobal.window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = [
  {
    // ComponentFilterElementType
    type: 1,
    // ElementTypeHostComponent: Hide host components (e.g. text nodes rendered
    // by Tinky)
    value: 7,
    isEnabled: true,
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    // Hide the internal wrapper component 'InternalApp'
    value: "InternalApp",
    isEnabled: true,
    isValid: true,
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    // Hide the internal AppContext provider
    value: "InternalAppContext",
    isEnabled: true,
    isValid: true,
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    // Hide the internal StdoutContext provider
    value: "InternalStdoutContext",
    isEnabled: true,
    isValid: true,
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    // Hide the internal StderrContext provider
    value: "InternalStderrContext",
    isEnabled: true,
    isValid: true,
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    // Hide the internal StdinContext provider
    value: "InternalStdinContext",
    isEnabled: true,
    isValid: true,
  },
  {
    // ComponentFilterDisplayName
    type: 2,
    // Hide the internal FocusContext provider
    value: "InternalFocusContext",
    isEnabled: true,
    isValid: true,
  },
];
