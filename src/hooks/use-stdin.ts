import { useContext } from "react";
import { StdinContext } from "../components/StdinContext.js";

/**
 * `useStdin` is a React hook that exposes the stdin stream.
 *
 * @returns The stdin context.
 */
export const useStdin = () => useContext(StdinContext);
