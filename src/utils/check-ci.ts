import { process } from "./node-adapater";
/**
 * Checks if a specific environment variable is set and not explicitly disabled.
 *
 * @param key - The name of the environment variable to check.
 * @returns `true` if the environment variable is set and its value is not '0' or 'false', otherwise `false`.
 */

const check = (
  key: string,
  env: Record<string, string | undefined> = {},
): boolean => {
  const globalEnv = process?.env || {};
  const value = env[key] ?? globalEnv[key];
  return value !== undefined && value !== "0" && value !== "false";
};

/**
 * Determines if the current environment is a Continuous Integration (CI) environment.
 *
 * It checks for the presence of the `CI` or `CONTINUOUS_INTEGRATION` environment variables.
 * These variables are commonly set by CI providers like GitHub Actions, Travis CI, CircleCI, etc.
 *
 * The check follows the convention that if the variable is present, it is considered true,
 * unless explicitly set to '0' or 'false' (case-sensitive for the value check, though env vars are OS dependent).
 *
 * @param env - Optional environment variables override.
 */
export const isCI = (env?: Record<string, string | undefined>): boolean =>
  check("CI", env) || check("CONTINUOUS_INTEGRATION", env);
