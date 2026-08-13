import { createStudioReelWorkerRuntime } from "../runtime/createStudioReelWorkerRuntime";
import { checkStudioReelWorkerCommands } from "../runtime/checkStudioReelWorkerCommands";
import { getStudioReelWorkerRuntimeCheck } from "../runtime/getStudioReelWorkerRuntimeCheck";
import { readStudioReelWorkerRuntimeConfig } from "../runtime/readStudioReelWorkerRuntimeConfig";
import { runBoundedStudioReelCommand } from "../adapters/process/runBoundedStudioReelCommand";
import type { StudioReelCommandRunner } from "../contracts/StudioReelCommandRunner";
import { redactStudioReelWorkerText } from "../security/redactStudioReelWorkerText";

export async function runStudioReelWorkerCommand(
  args: readonly string[],
  io: { stderr: (value: string) => void; stdout: (value: string) => void },
  dependencies: {
    environment?: NodeJS.ProcessEnv;
    runner?: StudioReelCommandRunner;
    signal?: AbortSignal;
  } = {},
) {
  const environment = dependencies.environment ?? process.env;
  if (args.length === 1 && args[0] === "--check") {
    const runtimeCheck = getStudioReelWorkerRuntimeCheck(environment);
    const commandsAvailable = await checkStudioReelWorkerCommands({
      commands: runtimeCheck.requiredCommands,
      cwd: process.cwd(),
      runner: dependencies.runner ?? runBoundedStudioReelCommand,
    });
    io.stdout(JSON.stringify({ ...runtimeCheck, commandsAvailable }));
    return commandsAvailable ? 0 : 1;
  }
  if (args.length !== 1 || !["--once", "--run"].includes(args[0])) {
    io.stderr("Usage: studio-stitch-worker --check | --once | --run");
    return 64;
  }
  try {
    const runtime = createStudioReelWorkerRuntime({
      config: readStudioReelWorkerRuntimeConfig(environment),
    });
    if (args[0] === "--once") {
      io.stdout(JSON.stringify(await runtime.runOnce()));
      return 0;
    }
    await runtime.run(
      dependencies.signal ?? new AbortController().signal,
      (result) => io.stdout(JSON.stringify(result)),
    );
    return 0;
  } catch (error) {
    io.stderr(
      redactStudioReelWorkerText(
        error instanceof Error
          ? error.message
          : "Studio Stitch worker execution failed.",
      ),
    );
    return 1;
  }
}
