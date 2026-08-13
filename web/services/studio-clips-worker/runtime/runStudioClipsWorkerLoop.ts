import type { StudioClipsWorkerClaimResult } from "./StudioClipsWorkerClaimResult";
import { waitForNextStudioClipsPoll } from "./waitForNextStudioClipsPoll";

export async function runStudioClipsWorkerLoop(input: {
  onResult?: (result: StudioClipsWorkerClaimResult) => void;
  pollIntervalMs: number;
  runOnce: () => Promise<StudioClipsWorkerClaimResult>;
  signal: AbortSignal;
}): Promise<void> {
  while (!input.signal.aborted) {
    const result = await input.runOnce();
    input.onResult?.(result);
    if (result.state === "idle") {
      await waitForNextStudioClipsPoll(input.pollIntervalMs, input.signal);
    }
  }
}
