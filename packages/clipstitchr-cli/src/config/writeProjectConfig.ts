import { writeFile } from "node:fs/promises";
import { stringify } from "yaml";
import type { ClipstitchrConfig } from "./ClipstitchrConfig.js";
import { getProjectConfigPath } from "./getProjectConfigPath.js";

export async function writeProjectConfig(
  config: ClipstitchrConfig,
  cwd = process.cwd(),
) {
  await writeFile(getProjectConfigPath(cwd), stringify(config), "utf8");
}
