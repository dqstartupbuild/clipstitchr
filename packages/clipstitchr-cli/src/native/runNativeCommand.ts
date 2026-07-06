import { execFile } from "node:child_process";

export async function runNativeCommand(command: string, args: string[]) {
  return await new Promise<string>((resolve, reject) => {
    execFile(command, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim() || error.message));
        return;
      }

      resolve(stdout);
    });
  });
}
