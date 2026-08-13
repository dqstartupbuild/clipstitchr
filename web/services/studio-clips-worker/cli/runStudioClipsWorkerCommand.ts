import type { StudioClipsWorkerCommandIO } from "./StudioClipsWorkerCommandIO";
import type { StudioClipsWorkerCommandDependencies } from "./StudioClipsWorkerCommandDependencies";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { redactStudioClipsSensitiveValue } from "../security/redactStudioClipsSensitiveValue";
import { createStudioClipsWorkerRuntime } from "../runtime/createStudioClipsWorkerRuntime";
import { getStudioClipsWorkerRuntimeCheck } from "../runtime/getStudioClipsWorkerRuntimeCheck";
import { readStudioClipsWorkerRuntimeConfig } from "../runtime/readStudioClipsWorkerRuntimeConfig";
import { writeStudioClipsWorkerResult } from "./writeStudioClipsWorkerResult";

export async function runStudioClipsWorkerCommand(
  args: readonly string[],
  io: StudioClipsWorkerCommandIO,
  dependencies: StudioClipsWorkerCommandDependencies = {},
): Promise<number> {
  const environment = dependencies.environment ?? process.env;
  if (args.length === 1 && args[0] === "--check") {
    io.stdout(JSON.stringify(getStudioClipsWorkerRuntimeCheck(environment)));
    return 0;
  }

  if (args.length !== 1 || (args[0] !== "--once" && args[0] !== "--run")) {
    io.stderr("Usage: studio-clips-worker --check | --once | --run");
    return 64;
  }

  try {
    const config = readStudioClipsWorkerRuntimeConfig(environment);
    const runtime = (
      dependencies.createRuntime ?? createStudioClipsWorkerRuntime
    )({
      config,
    });
    if (args[0] === "--once") {
      io.stdout(
        JSON.stringify(
          redactStudioClipsSensitiveValue(await runtime.runOnce()),
        ),
      );
      return 0;
    }
    const signal = dependencies.signal ?? new AbortController().signal;
    await runtime.run(signal, writeStudioClipsWorkerResult.bind(null, io));
    return 0;
  } catch (error) {
    const unavailable =
      error instanceof StudioClipsWorkerError &&
      (error.code === "WORKER_CONFIGURATION_UNAVAILABLE" ||
        error.code === "INVALID_WORKER_CONFIGURATION");
    const message =
      error instanceof StudioClipsWorkerError
        ? error.publicMessage
        : "Studio Clips worker execution failed.";
    io.stderr(String(redactStudioClipsSensitiveValue(message)));
    return unavailable ? 78 : 1;
  }
}
