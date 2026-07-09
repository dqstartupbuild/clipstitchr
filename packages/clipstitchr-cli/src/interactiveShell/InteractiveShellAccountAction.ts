import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";

export type InteractiveShellAccountAction =
  | "link"
  | "login"
  | "logout"
  | "status"
  | "unlink"
  | InteractiveShellNavigationAction;
