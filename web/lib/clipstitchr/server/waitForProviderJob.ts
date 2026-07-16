import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function waitForProviderJob(
  convex: ConvexHttpClient,
  jobId: string,
  timeoutMs = 8 * 60_000,
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const job = await convex.query(api.providerJobs.get, { id: jobId });

    if (!job) {
      throw new Error("The queued creation could not be found.");
    }

    if (job.status === "completed") {
      return job;
    }

    if (job.status === "failed" || job.status === "canceled") {
      throw new Error(job.error ?? "The queued creation did not finish.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(
    "This creation is still queued. You can keep working while it finishes.",
  );
}
