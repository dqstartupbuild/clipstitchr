import type { ChildProcess } from "node:child_process";

export async function waitForChildProcessExit(childProcess: ChildProcess) {
  await new Promise<void>((resolve, reject) => {
    childProcess.once("error", reject);
    childProcess.once("exit", () => resolve());
  });
}
