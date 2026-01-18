import { useContext } from "react";
import { StdinContext } from "../contexts/StdinContext.js";

/**
 * `useStdin` is a React hook that exposes the stdin stream and related utilities.
 *
 * @returns The stdin context containing the stdin stream, `setRawMode` function,
 *          and `isRawModeSupported` flag.
 *
 * @example
 * ```tsx
 * import { useStdin } from 'tinky';
 *
 * function InputComponent() {
 *   const { stdin, setRawMode, isRawModeSupported } = useStdin();
 *
 *   useEffect(() => {
 *     if (isRawModeSupported) {
 *       setRawMode(true);
 *       return () => setRawMode(false);
 *     }
 *   }, [setRawMode, isRawModeSupported]);
 *
 *   return <Text>Listening for input...</Text>;
 * }
 * ```
 */
export const useStdin = () => useContext(StdinContext);
