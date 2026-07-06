import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const children = [];
let stopping = false;
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = resolve(scriptDirectory, "..");
const nextBinary = resolve(
  appDirectory,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next",
);

function startChild(command, args) {
  const child = spawn(command, args, {
    cwd: appDirectory,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (stopping) {
      return;
    }

    stopping = true;
    stopChildren(child);
    process.exit(code ?? (signal ? 1 : 0));
  });

  return child;
}

function stopChildren(excludedChild) {
  for (const child of children) {
    if (child === excludedChild || child.killed) {
      continue;
    }

    child.kill("SIGTERM");
  }
}

function stopAndExit(exitCode) {
  if (stopping) {
    return;
  }

  stopping = true;
  stopChildren();
  setTimeout(() => process.exit(exitCode), 1000).unref();
}

process.on("SIGINT", () => stopAndExit(130));
process.on("SIGTERM", () => stopAndExit(143));

startChild(process.execPath, [
  resolve(scriptDirectory, "watch-content-collections.mjs"),
]);
startChild(nextBinary, ["dev", ...process.argv.slice(2)]);
