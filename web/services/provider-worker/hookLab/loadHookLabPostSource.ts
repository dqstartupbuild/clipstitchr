import { anyApi } from "convex/server";
import { getApifyActorRun } from "@/lib/clipstitchr/server/apify/getApifyActorRun";
import { getApifyDatasetItems } from "@/lib/clipstitchr/server/apify/getApifyDatasetItems";
import { getIsApifyActorRunPending } from "@/lib/clipstitchr/server/apify/getIsApifyActorRunPending";
import { createHookLabInstagramSource } from "@/lib/clipstitchr/server/hookLab/createHookLabInstagramSource";
import { createHookLabTikTokSource } from "@/lib/clipstitchr/server/hookLab/createHookLabTikTokSource";
import type { HookLabPostDocument } from "./HookLabPostDocument";
import { markHookLabPostAnalysisJobStatus } from "./markHookLabPostAnalysisJobStatus";
import type { ProcessHookLabPostAnalysisOptions } from "./ProcessHookLabPostAnalysisOptions";
import { startHookLabPostActor } from "./startHookLabPostActor";
import { waitForHookLabPostActor } from "./waitForHookLabPostActor";

const api = anyApi;

export async function loadHookLabPostSource({
  client,
  job,
  post,
  providerWorkerSecret,
}: ProcessHookLabPostAnalysisOptions & { post: HookLabPostDocument }) {
  const runId = post.providerRunId?.trim();

  if (!runId) {
    await startHookLabPostActor({ client, job, post, providerWorkerSecret });
    return null;
  }

  const run = await getApifyActorRun({ runId });

  if (getIsApifyActorRunPending(run.status)) {
    await waitForHookLabPostActor({
      client,
      job,
      providerWorkerSecret,
      runId,
    });
    return null;
  }

  await markHookLabPostAnalysisJobStatus({
    client,
    job,
    progress: 0.2,
    providerJobId: run.id,
    providerWorkerSecret,
    stage: "hook-lab-reading-apify-result",
    status: "running",
  });

  if (run.status !== "SUCCEEDED") {
    throw new Error(`${post.platform} import did not complete.`);
  }

  const datasetId = run.defaultDatasetId ?? post.providerDatasetId;

  if (!datasetId) {
    throw new Error("Hook Lab social import is missing its Apify dataset.");
  }

  await client.mutation(api["hookLabPosts/recordProviderRun"].recordProviderRun, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: post.id,
    providerRunId: run.id,
    providerDatasetId: datasetId,
    updatedAt: new Date().toISOString(),
  });
  const [item] = await getApifyDatasetItems({ datasetId });

  if (!item) {
    throw new Error(`${post.platform} returned an empty dataset.`);
  }

  return post.platform === "tiktok"
    ? createHookLabTikTokSource(item, post.canonicalUrl)
    : createHookLabInstagramSource(item, post.canonicalUrl);
}
