import type { InteractiveShellNavigationAction } from "../interactiveShell/InteractiveShellNavigationAction.js";

export type InteractiveTuiResultAction =
  | "result:back"
  | InteractiveShellNavigationAction;
