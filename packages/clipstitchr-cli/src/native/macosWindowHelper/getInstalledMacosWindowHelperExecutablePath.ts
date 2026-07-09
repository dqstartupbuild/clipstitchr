import { join } from "node:path";
import { getMacosWindowHelperInstallDirectoryPath } from "./getMacosWindowHelperInstallDirectoryPath.js";

export function getInstalledMacosWindowHelperExecutablePath(home?: string) {
  return join(
    getMacosWindowHelperInstallDirectoryPath(home),
    "macos-window-helper",
  );
}
