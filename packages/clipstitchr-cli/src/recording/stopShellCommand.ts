import type { ChildProcess } from "node:child_process";

export function stopShellCommand(childProcess: ChildProcess | null) {
  if (!childProcess || childProcess.killed) {
    return;
  }

  childProcess.kill("SIGTERM");
}
