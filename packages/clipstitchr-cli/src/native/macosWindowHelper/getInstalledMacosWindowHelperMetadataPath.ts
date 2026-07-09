import { join } from "node:path";
import { getMacosWindowHelperInstallDirectoryPath } from "./getMacosWindowHelperInstallDirectoryPath.js";

export function getInstalledMacosWindowHelperMetadataPath(home?: string) {
  return join(
    getMacosWindowHelperInstallDirectoryPath(home),
    "macos-window-helper.json",
  );
}
