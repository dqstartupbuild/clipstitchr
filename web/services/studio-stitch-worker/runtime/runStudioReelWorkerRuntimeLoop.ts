import type { StudioReelWorkerClaimResult } from "../contracts/StudioReelWorkerClaimResult";
import { runStudioReelWorkerLoop } from "./runStudioReelWorkerLoop";

export function runStudioReelWorkerRuntimeLoop(
  pollIntervalMs: number,
  runOnce: () => Promise<StudioReelWorkerClaimResult>,
  signal: AbortSignal,
  onResult?: (result: StudioReelWorkerClaimResult) => void,
): Promise<void> {
  return runStudioReelWorkerLoop({
    onResult,
    pollIntervalMs,
    runOnce,
    signal,
  });
}
