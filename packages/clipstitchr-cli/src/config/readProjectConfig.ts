import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import type { ClipstitchrConfig } from "./ClipstitchrConfig.js";
import { getProjectConfigPath } from "./getProjectConfigPath.js";

export async function readProjectConfig(cwd = process.cwd()) {
  try {
    const contents = await readFile(getProjectConfigPath(cwd), "utf8");

    return (parse(contents) ?? {}) as ClipstitchrConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }

    throw error;
  }
}
