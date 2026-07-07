import { join } from "node:path";
import { defaultAppContextRelativePath } from "./defaultAppContextRelativePath.js";

export function getAppContextPath(cwd = process.cwd()) {
  return join(cwd, defaultAppContextRelativePath);
}
