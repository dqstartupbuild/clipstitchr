import { collectRoutePaths } from "./collectRoutePaths.js";
import { createScannedFlow } from "./createScannedFlow.js";

export async function scanProjectFlows(cwd = process.cwd()) {
  const routes = await collectRoutePaths(cwd);

  return routes.map(createScannedFlow).slice(0, 8);
}
