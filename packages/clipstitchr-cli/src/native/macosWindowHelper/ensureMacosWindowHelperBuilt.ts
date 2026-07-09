import { access } from "node:fs/promises";
import { buildMacosWindowHelper } from "./buildMacosWindowHelper.js";
import { getMacosWindowHelperExecutablePath } from "./getMacosWindowHelperExecutablePath.js";

export async function ensureMacosWindowHelperBuilt() {
  try {
    await access(getMacosWindowHelperExecutablePath());
  } catch {
    await buildMacosWindowHelper();
  }
}
