import { spawn } from "node:child_process";

export function runShellCommand(command: string) {
  return spawn(command, {
    shell: true,
    stdio: "inherit",
  });
}
