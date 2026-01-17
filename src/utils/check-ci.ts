import process from "node:process";

/**
 * Checks if a specific environment variable is set and not explicitly disabled.
 *
 * @param key - The name of the environment variable to check.
 * @returns `true` if the environment variable is set and its value is not '0' or 'false', otherwise `false`.
 */
const check = (key: string): boolean => {
  const value = process.env[key];
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
 */
export const isCI: boolean = check("CI") || check("CONTINUOUS_INTEGRATION");
