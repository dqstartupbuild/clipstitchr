import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";

export type InteractiveShellAccountAction =
  | "doctor"
  | "link"
  | "login"
  | "logout"
  | "native"
  | "status"
  | "unlink"
  | "update"
  | InteractiveShellNavigationAction;
