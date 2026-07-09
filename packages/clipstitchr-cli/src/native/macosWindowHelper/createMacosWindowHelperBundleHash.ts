import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { getMacosWindowHelperPackagePath } from "./getMacosWindowHelperPackagePath.js";

export async function createMacosWindowHelperBundleHash() {
  const packagePath = getMacosWindowHelperPackagePath();
  const sourcePath = join(packagePath, "Sources");
  const files = [join(packagePath, "Package.swift")];
  const pendingDirectories = [sourcePath];

  while (pendingDirectories.length) {
    const directory = pendingDirectories.pop() as string;
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        pendingDirectories.push(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  const hash = createHash("sha256");

  for (const filePath of files.sort()) {
    hash.update(relative(packagePath, filePath));
    hash.update(await readFile(filePath));
  }

  return hash.digest("hex");
}
