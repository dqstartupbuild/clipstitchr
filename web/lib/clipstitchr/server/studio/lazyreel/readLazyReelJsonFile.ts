import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getLazyReelVendorRoot } from "./getLazyReelVendorRoot";

export function readLazyReelJsonFile<T>(fileName: string): T {
  const path = join(getLazyReelVendorRoot(), "mcp", "data", fileName);
  return JSON.parse(readFileSync(path, "utf8")) as T;
}
