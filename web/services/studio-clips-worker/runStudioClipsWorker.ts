import { runStudioClipsWorkerCommand } from "./cli/runStudioClipsWorkerCommand";

const controller = new AbortController();
process.once("SIGINT", () => controller.abort());
process.once("SIGTERM", () => controller.abort());

void runStudioClipsWorkerCommand(process.argv.slice(2), {
  stderr: (value) => process.stderr.write(`${value}\n`),
  stdout: (value) => process.stdout.write(`${value}\n`),
}, { signal: controller.signal })
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch(() => {
    process.stderr.write("Studio Clips worker command failed.\n");
    process.exitCode = 1;
  });
