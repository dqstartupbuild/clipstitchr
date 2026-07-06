import { join } from "node:path";
import { clipstitchrDirectoryName } from "../config/clipstitchrDirectoryName.js";

export function getRecordingsDirectoryPath(cwd = process.cwd()) {
  return join(cwd, clipstitchrDirectoryName, "recordings");
}
