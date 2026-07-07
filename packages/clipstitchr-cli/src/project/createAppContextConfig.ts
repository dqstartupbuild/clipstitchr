import type { ClipstitchrConfig } from "../config/ClipstitchrConfig.js";
import { defaultAppContextRelativePath } from "./defaultAppContextRelativePath.js";
import type { ScannedAppContext } from "./ScannedAppContext.js";

export function createAppContextConfig(
  appContext: ScannedAppContext,
): NonNullable<ClipstitchrConfig["appContext"]> {
  return {
    generatedAt: appContext.generatedAt,
    path: defaultAppContextRelativePath,
    routeCount: appContext.routes.length,
    workflowHintCount: appContext.workflowHints.length,
  };
}
