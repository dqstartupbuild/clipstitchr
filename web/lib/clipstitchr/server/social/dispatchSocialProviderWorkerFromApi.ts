import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";

export async function dispatchSocialProviderWorkerFromApi(
  convex: ConvexHttpClient,
) {
  try {
    await convex.action(api.workerDispatch.runWorkerFromApi, {
      secret: getAutomationWorkerSecret(),
      worker: "provider",
    });

    return "dispatched" as const;
  } catch {
    return "fallback_scheduled" as const;
  }
}
