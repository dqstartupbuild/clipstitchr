import { access } from "node:fs/promises";
import { getInstalledMacosWindowHelperExecutablePath } from "./getInstalledMacosWindowHelperExecutablePath.js";
import { readInstalledMacosWindowHelperMetadata } from "./readInstalledMacosWindowHelperMetadata.js";

export async function getInstalledMacosWindowHelperIsCurrent(input: {
  bundleHash: string;
  home?: string;
}) {
  try {
    await access(getInstalledMacosWindowHelperExecutablePath(input.home));
    const metadata = await readInstalledMacosWindowHelperMetadata(input.home);

    return metadata.bundleHash === input.bundleHash;
  } catch {
    return false;
  }
}
