import type { StudioReelWorkerClaimResult } from "../contracts/StudioReelWorkerClaimResult";
import { waitForStudioReelWorkerPoll } from "./waitForStudioReelWorkerPoll";

export async function runStudioReelWorkerLoop(input: {
  onResult?: (result: StudioReelWorkerClaimResult) => void;
  pollIntervalMs: number;
  runOnce: () => Promise<StudioReelWorkerClaimResult>;
  signal: AbortSignal;
}) {
  while (!input.signal.aborted) {
    const result = await input.runOnce();
    input.onResult?.(result);
    if (result.state === "idle") {
      await waitForStudioReelWorkerPoll(input.pollIntervalMs, input.signal);
    }
  }
}
