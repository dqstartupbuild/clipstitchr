import { readFile } from "node:fs/promises";
import type { MacosWindowHelperMetadata } from "./MacosWindowHelperMetadata.js";
import { getInstalledMacosWindowHelperMetadataPath } from "./getInstalledMacosWindowHelperMetadataPath.js";

export async function readInstalledMacosWindowHelperMetadata(home?: string) {
  return JSON.parse(
    await readFile(getInstalledMacosWindowHelperMetadataPath(home), "utf8"),
  ) as MacosWindowHelperMetadata;
}
