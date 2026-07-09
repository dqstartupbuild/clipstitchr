import { spawn } from "node:child_process";
import { getMacosWindowHelperPackagePath } from "./getMacosWindowHelperPackagePath.js";

export async function buildMacosWindowHelper() {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("swift", ["build", "-c", "release"], {
      cwd: getMacosWindowHelperPackagePath(),
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`macOS helper build failed with exit code ${code}.`));
    });
  });
}
