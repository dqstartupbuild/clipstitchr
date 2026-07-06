import { spawn } from "node:child_process";

export function runShellCommand(command: string) {
  return spawn(command, {
    detached: process.platform !== "win32",
    shell: true,
    stdio: "inherit",
  });
}
