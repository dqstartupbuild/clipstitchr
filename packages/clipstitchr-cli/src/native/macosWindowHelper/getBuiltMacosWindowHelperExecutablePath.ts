import { join } from "node:path";
import { getMacosWindowHelperPackagePath } from "./getMacosWindowHelperPackagePath.js";

export function getBuiltMacosWindowHelperExecutablePath() {
  return join(
    getMacosWindowHelperPackagePath(),
    ".build",
    "release",
    "macos-window-helper",
  );
}
