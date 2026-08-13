import type { StudioReelCommandProcessState } from "../../contracts/StudioReelCommandProcessState";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function settleStudioReelCommandProcess(
  state: StudioReelCommandProcessState,
  code: number | null,
  signal: NodeJS.Signals | null,
) {
  if (state.timeout) clearTimeout(state.timeout);
  if (state.settled) return;
  state.settled = true;
  if (code !== 0) {
    state.reject(
      new StudioReelWorkerError({
        code: "COMMAND_FAILED",
        kind: signal ? "retryable" : "permanent",
        publicMessage: "A Studio Stitch media command could not finish.",
      }),
    );
    return;
  }
  state.resolve({
    stderr: Buffer.concat(state.stderr).toString("utf8"),
    stdout: Buffer.concat(state.stdout).toString("utf8"),
  });
}
