import { spawn } from "node:child_process";

export async function isCommandAvailable(command: string, args = ["--version"]) {
  return await new Promise<boolean>((resolve) => {
    const childProcess = spawn(command, args, {
      stdio: "ignore",
    });

    childProcess.once("error", () => resolve(false));
    childProcess.once("exit", () => resolve(true));
  });
}
