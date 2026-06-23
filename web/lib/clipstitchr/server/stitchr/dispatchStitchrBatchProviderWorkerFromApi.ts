import { api } from "@/convex/_generated/api";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import type { ConvexHttpClient } from "convex/browser";

export type StitchrBatchProviderDispatchStatus =
  | "dispatched"
  | "fallback_scheduled"
  | "skipped";

export async function dispatchStitchrBatchProviderWorkerFromApi({
  convex,
  shouldDispatch,
}: {
  convex: ConvexHttpClient;
  shouldDispatch: boolean;
}): Promise<StitchrBatchProviderDispatchStatus> {
  if (!shouldDispatch) {
    return "skipped";
  }

  try {
    await convex.action(api.workerDispatch.runWorkerFromApi, {
      secret: getAutomationWorkerSecret(),
      worker: "provider",
    });

    return "dispatched";
  } catch {
    return "fallback_scheduled";
  }
}
