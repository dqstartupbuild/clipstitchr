import { rm } from "node:fs/promises";
import { getProjectConfigPath } from "./getProjectConfigPath.js";

export async function deleteProjectConfig(cwd = process.cwd()) {
  await rm(getProjectConfigPath(cwd), { force: true });
}
