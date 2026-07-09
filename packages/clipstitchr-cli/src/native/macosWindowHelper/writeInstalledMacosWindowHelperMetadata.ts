import { mkdir, writeFile } from "node:fs/promises";
import { getMacosWindowHelperInstallDirectoryPath } from "./getMacosWindowHelperInstallDirectoryPath.js";
import { getInstalledMacosWindowHelperMetadataPath } from "./getInstalledMacosWindowHelperMetadataPath.js";
import type { MacosWindowHelperMetadata } from "./MacosWindowHelperMetadata.js";

export async function writeInstalledMacosWindowHelperMetadata(input: {
  home?: string;
  metadata: MacosWindowHelperMetadata;
}) {
  await mkdir(getMacosWindowHelperInstallDirectoryPath(input.home), {
    recursive: true,
  });
  await writeFile(
    getInstalledMacosWindowHelperMetadataPath(input.home),
    `${JSON.stringify(input.metadata, null, 2)}\n`,
    "utf8",
  );
}
