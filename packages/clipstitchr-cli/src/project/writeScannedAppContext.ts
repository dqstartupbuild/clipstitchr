import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getAppContextPath } from "./getAppContextPath.js";
import type { ScannedAppContext } from "./ScannedAppContext.js";

export async function writeScannedAppContext(
  appContext: ScannedAppContext,
  cwd = process.cwd(),
) {
  const path = getAppContextPath(cwd);

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(appContext, null, 2)}\n`, "utf8");

  return path;
}
