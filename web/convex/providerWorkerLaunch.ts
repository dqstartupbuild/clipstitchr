import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { mutation } from "./_generated/server";
import { requestWorkerLaunch } from "./workerLaunch";
import { workerContinuationDelayMs } from "./workerContinuationDelayMs";

export const requestContinuation = mutation({
  args: {
    secret: v.string(),
    requestedAt: v.string(),
  },
  handler: async (ctx, { secret, requestedAt }) => {
    assertProviderWorkerSecret(secret);

    await requestWorkerLaunch({
      ctx,
      delayMs: workerContinuationDelayMs,
      now: requestedAt,
      worker: "provider",
    });
  },
});
