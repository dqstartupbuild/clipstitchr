import { getApifyActorRun } from "@/lib/clipstitchr/server/apify/getApifyActorRun";

export async function waitForSocialAnalyticsApifyRun(runId: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const run = await getApifyActorRun({ runId });

    if (run.status === "SUCCEEDED") {
      if (!run.defaultDatasetId) {
        throw new Error("TikTok save enrichment returned no dataset.");
      }

      return run;
    }

    if (
      run.status === "FAILED" ||
      run.status === "TIMING-OUT" ||
      run.status === "TIMED-OUT" ||
      run.status === "ABORTED"
    ) {
      throw new Error("TikTok save enrichment could not finish.");
    }

    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }

  throw new Error("TikTok save enrichment is still running.");
}
