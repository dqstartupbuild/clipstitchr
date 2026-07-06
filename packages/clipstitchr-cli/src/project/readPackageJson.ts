import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type ProjectPackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

export async function readPackageJson(cwd = process.cwd()) {
  try {
    return JSON.parse(
      await readFile(join(cwd, "package.json"), "utf8"),
    ) as ProjectPackageJson;
  } catch {
    return null;
  }
}
