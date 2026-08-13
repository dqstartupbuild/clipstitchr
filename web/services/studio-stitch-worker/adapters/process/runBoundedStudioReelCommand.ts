import { spawn } from "node:child_process";
import { STUDIO_REEL_WORKER_LIMITS } from "../../constants/studioReelWorkerLimits";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelCommandProcessState } from "../../contracts/StudioReelCommandProcessState";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { captureStudioReelCommandOutput } from "./captureStudioReelCommandOutput";
import { createStudioReelChildEnvironment } from "./createStudioReelChildEnvironment";
import { failStudioReelCommandProcess } from "./failStudioReelCommandProcess";
import { handleStudioReelCommandSpawnError } from "./handleStudioReelCommandSpawnError";
import { settleStudioReelCommandProcess } from "./settleStudioReelCommandProcess";

export const runBoundedStudioReelCommand: StudioReelCommandRunner = async (
  input,
) =>
  new Promise((resolve, reject) => {
    const child = spawn(input.command, [...input.args], {
      cwd: input.cwd,
      env: createStudioReelChildEnvironment({
        cwd: input.cwd,
        path: process.env.PATH,
      }),
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const state: StudioReelCommandProcessState = {
      bytes: 0,
      child,
      maximumOutputBytes:
        input.maximumOutputBytes ?? STUDIO_REEL_WORKER_LIMITS.commandOutputBytes,
      reject,
      resolve,
      settled: false,
      stderr: [],
      stdout: [],
    };
    child.stdout.on(
      "data",
      captureStudioReelCommandOutput.bind(null, state, state.stdout),
    );
    child.stderr.on(
      "data",
      captureStudioReelCommandOutput.bind(null, state, state.stderr),
    );
    child.on("error", handleStudioReelCommandSpawnError.bind(null, state));
    state.timeout = setTimeout(
      failStudioReelCommandProcess.bind(
        null,
        state,
        new StudioReelWorkerError({
          code: "COMMAND_TIMEOUT",
          kind: "retryable",
          publicMessage: "A Studio Stitch media command timed out.",
        }),
      ),
      input.timeoutMs,
    );
    state.timeout.unref();
    child.on("close", settleStudioReelCommandProcess.bind(null, state));
  });
