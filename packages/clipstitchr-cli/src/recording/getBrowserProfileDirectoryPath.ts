import { join } from "node:path";
import { clipstitchrDirectoryName } from "../config/clipstitchrDirectoryName.js";

export function getBrowserProfileDirectoryPath(cwd = process.cwd()) {
  return join(cwd, clipstitchrDirectoryName, "browser-profile");
}
