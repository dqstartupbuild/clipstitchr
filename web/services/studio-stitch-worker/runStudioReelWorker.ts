import { runStudioReelWorkerCommand } from "./cli/runStudioReelWorkerCommand";

const controller = new AbortController();
process.once("SIGINT", () => controller.abort());
process.once("SIGTERM", () => controller.abort());

void runStudioReelWorkerCommand(
  process.argv.slice(2),
  {
    stderr: (value) => process.stderr.write(`${value}\n`),
    stdout: (value) => process.stdout.write(`${value}\n`),
  },
  { signal: controller.signal },
).then((exitCode) => {
  process.exitCode = exitCode;
});
