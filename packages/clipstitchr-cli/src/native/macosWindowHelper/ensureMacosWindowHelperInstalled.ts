import { chmod, copyFile, mkdir } from "node:fs/promises";
import { buildMacosWindowHelper } from "./buildMacosWindowHelper.js";
import { createMacosWindowHelperBundleHash } from "./createMacosWindowHelperBundleHash.js";
import { getBuiltMacosWindowHelperExecutablePath } from "./getBuiltMacosWindowHelperExecutablePath.js";
import { getInstalledMacosWindowHelperExecutablePath } from "./getInstalledMacosWindowHelperExecutablePath.js";
import { getInstalledMacosWindowHelperIsCurrent } from "./getInstalledMacosWindowHelperIsCurrent.js";
import { getMacosWindowHelperInstallDirectoryPath } from "./getMacosWindowHelperInstallDirectoryPath.js";
import type { MacosWindowHelperInstallResult } from "./MacosWindowHelperInstallResult.js";
import { writeInstalledMacosWindowHelperMetadata } from "./writeInstalledMacosWindowHelperMetadata.js";

export async function ensureMacosWindowHelperInstalled(input: {
  force?: boolean;
  home?: string;
} = {}): Promise<MacosWindowHelperInstallResult> {
  const bundleHash = await createMacosWindowHelperBundleHash();
  const executablePath = getInstalledMacosWindowHelperExecutablePath(input.home);
  const isCurrent =
    !input.force &&
    (await getInstalledMacosWindowHelperIsCurrent({
      bundleHash,
      home: input.home,
    }));

  if (isCurrent) {
    return {
      bundleHash,
      executablePath,
      installed: false,
    };
  }

  await buildMacosWindowHelper();
  await mkdir(getMacosWindowHelperInstallDirectoryPath(input.home), {
    recursive: true,
  });
  await copyFile(getBuiltMacosWindowHelperExecutablePath(), executablePath);
  await chmod(executablePath, 0o755);
  await writeInstalledMacosWindowHelperMetadata({
    home: input.home,
    metadata: {
      bundleHash,
      installedAt: new Date().toISOString(),
      version: 1,
    },
  });

  return {
    bundleHash,
    executablePath,
    installed: true,
  };
}
