import { spawnSync } from "node:child_process";
import { join } from "node:path";

export function readCliOutput(args: string[], cwd = process.cwd()) {
  const cliPath = join(process.cwd(), "dist", "cli.js");
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }

  return `${result.stdout}${result.stderr}`;
}
