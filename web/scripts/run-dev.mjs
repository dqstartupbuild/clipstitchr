import { spawn } from "node:child_process";

const childProcesses = new Set();
let isShuttingDown = false;

function spawnProcess(command, args) {
  const childProcess = spawn(command, args, {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  childProcesses.add(childProcess);

  childProcess.on("exit", (code, signal) => {
    childProcesses.delete(childProcess);

    if (isShuttingDown) {
      return;
    }

    const exitCode =
      signal === "SIGINT" || signal === "SIGTERM"
        ? 0
        : (code ?? (signal ? 1 : 0));
    shutdown(exitCode);
  });

  return childProcess;
}

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const childProcess of childProcesses) {
    childProcess.kill();
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 100);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

spawnProcess(process.execPath, ["./scripts/watch-content-collections.mjs"]);
spawnProcess("next", ["dev", "--webpack", ...process.argv.slice(2)]);
