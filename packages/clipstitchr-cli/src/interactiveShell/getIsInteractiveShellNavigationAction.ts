import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";

export function getIsInteractiveShellNavigationAction(
  action: string,
): action is InteractiveShellNavigationAction {
  return (
    action === "nav:back" ||
    action === "nav:exit" ||
    action === "nav:main" ||
    action === "nav:slash"
  );
}
