import { useContext } from "react";
import { StderrContext } from "../components/StderrContext.js";

/**
 * `useStderr` is a React hook that exposes the stderr stream.
 *
 * @returns The stderr context.
 */
export const useStderr = () => useContext(StderrContext);
