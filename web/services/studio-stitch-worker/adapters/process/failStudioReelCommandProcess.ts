import type { StudioReelCommandProcessState } from "../../contracts/StudioReelCommandProcessState";
import type { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function failStudioReelCommandProcess(
  state: StudioReelCommandProcessState,
  error: StudioReelWorkerError,
) {
  if (state.settled) return;
  state.settled = true;
  if (state.timeout) clearTimeout(state.timeout);
  state.child.kill("SIGKILL");
  state.reject(error);
}
