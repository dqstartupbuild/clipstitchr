import { join } from "node:path";
import { pathExists } from "./pathExists.js";

export async function getPackageManager(cwd = process.cwd()) {
  if (await pathExists(join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm" as const;
  }

  if (await pathExists(join(cwd, "bun.lockb"))) {
    return "bun" as const;
  }

  if (await pathExists(join(cwd, "yarn.lock"))) {
    return "yarn" as const;
  }

  return "npm" as const;
}
