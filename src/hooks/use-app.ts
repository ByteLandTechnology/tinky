import { useContext } from "react";
import { AppContext } from "../components/AppContext.js";

/**
 * `useApp` is a React hook that exposes a method to manually exit the app
 * (unmount).
 *
 * @example
 * ```tsx
 * import {render, useApp, useInput} from 'tinky';
 *
 * const Component = () => {
 *   const {exit} = useApp();
 *
 *   useInput((input) => {
 *     if (input === 'q') {
 *       exit();
 *     }
 *   });
 *
 *   return null;
 * };
 *
 * render(<Component />);
 * ```
 *
 * @returns The app context containing the `exit` function.
 */
export const useApp = () => useContext(AppContext);
