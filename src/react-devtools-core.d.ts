/**
 * Type declarations for react-devtools-core.
 * This is an untyped module, so we declare it here to avoid implicit any
 * errors.
 */
declare module "react-devtools-core" {
  export function initialize(settings?: object): void;
  export function connectToDevTools(settings?: object): void;
}
