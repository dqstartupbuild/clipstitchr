import { humanizeAppContextName } from "./humanizeAppContextName.js";

export function createAppContextRouteTitle(routePath: string | undefined) {
  if (!routePath || routePath === "/") {
    return "Main product workflow";
  }

  return `${humanizeAppContextName(routePath.split("/").filter(Boolean).at(-1) ?? routePath)} workflow`;
}
