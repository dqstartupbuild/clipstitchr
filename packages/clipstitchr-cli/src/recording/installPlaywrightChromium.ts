import { spawn } from "node:child_process";
import { getPlaywrightCliPath } from "./getPlaywrightCliPath.js";

export async function installPlaywrightChromium() {
  await new Promise<void>((resolve, reject) => {
    const childProcess = spawn(
      process.execPath,
      [getPlaywrightCliPath(), "install", "chromium"],
      {
        stdio: "inherit",
      },
    );

    childProcess.on("error", reject);
    childProcess.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          signal
            ? `Recording browser install stopped with ${signal}.`
            : `Recording browser install failed with exit code ${code}.`,
        ),
      );
    });
  });
}
