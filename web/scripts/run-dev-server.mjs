import { spawn } from "node:child_process";

const children = [];
let stopping = false;

function startChild(command, args) {
  const child = spawn(command, args, {
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

startChild(process.execPath, ["./scripts/watch-content-collections.mjs"]);
startChild("next", ["dev"]);
