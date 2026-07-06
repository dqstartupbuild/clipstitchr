import type { ChildProcess } from "node:child_process";

export function stopShellCommand(childProcess: ChildProcess | null) {
  if (!childProcess?.pid || childProcess.killed) {
    return;
  }

  if (process.platform === "win32") {
    childProcess.kill("SIGTERM");
    return;
  }

  try {
    process.kill(-childProcess.pid, "SIGTERM");
  } catch {
    childProcess.kill("SIGTERM");
  }
}
