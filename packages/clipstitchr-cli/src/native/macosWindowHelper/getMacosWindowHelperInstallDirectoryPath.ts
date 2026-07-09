import { join } from "node:path";
import { homedir } from "node:os";

export function getMacosWindowHelperInstallDirectoryPath(home = homedir()) {
  return join(home, "Library", "Application Support", "ClipStitchr");
}
