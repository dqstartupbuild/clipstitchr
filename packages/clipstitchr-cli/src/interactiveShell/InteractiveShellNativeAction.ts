import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";

export type InteractiveShellNativeAction =
  | "native-check"
  | "native-init"
  | InteractiveShellNavigationAction;
