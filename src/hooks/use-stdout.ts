import { useContext } from "react";
import { StdoutContext } from "../components/StdoutContext.js";

/**
 * `useStdout` is a React hook that exposes the stdout stream where Tinky
 * renders your app.
 *
 * @returns The stdout context.
 */
export const useStdout = () => useContext(StdoutContext);
