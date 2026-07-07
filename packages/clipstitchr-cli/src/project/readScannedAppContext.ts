import { readFile } from "node:fs/promises";
import { getAppContextPath } from "./getAppContextPath.js";
import type { ScannedAppContext } from "./ScannedAppContext.js";

export async function readScannedAppContext(cwd = process.cwd()) {
  try {
    const contents = await readFile(getAppContextPath(cwd), "utf8");

    return JSON.parse(contents) as ScannedAppContext;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}
