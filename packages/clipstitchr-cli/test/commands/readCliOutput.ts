import { spawnSync } from "node:child_process";
import { join } from "node:path";

export function readCliOutput(args: string[]) {
  const result = spawnSync(process.execPath, [join("dist", "cli.js"), ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }

  return `${result.stdout}${result.stderr}`;
}
