import { spawn } from "node:child_process";

export async function runNpmGlobalCliUpdate() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      npmCommand,
      ["install", "-g", "clipstitchr@latest"],
      {
        stdio: "inherit",
      },
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error("npm install did not finish successfully."));
    });
  });
}
