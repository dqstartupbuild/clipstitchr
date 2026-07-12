import { anyApi } from "convex/server";
import { getApifyActorRun } from "@/lib/clipstitchr/server/apify/getApifyActorRun";
import { getApifyDatasetItems } from "@/lib/clipstitchr/server/apify/getApifyDatasetItems";
import { getIsApifyActorRunPending } from "@/lib/clipstitchr/server/apify/getIsApifyActorRunPending";
import { createHookLabInstagramSource } from "@/lib/clipstitchr/server/hookLab/createHookLabInstagramSource";
import { createHookLabTikTokSource } from "@/lib/clipstitchr/server/hookLab/createHookLabTikTokSource";
import { getHookLabIdeaSourcePlatform } from "./getHookLabIdeaSourcePlatform";
import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";
import { markHookLabAnalysisJobStatus } from "./markHookLabAnalysisJobStatus";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";
import { startHookLabSocialActor } from "./startHookLabSocialActor";
import { waitForHookLabApifyRun } from "./waitForHookLabApifyRun";

const api = anyApi;

export async function loadHookLabSocialSource({
  client,
  idea,
  job,
  providerWorkerSecret,
}: ProcessHookLabIdeaAnalysisOptions & { idea: HookLabIdeaDocument }) {
  const runId = idea.providerRunId?.trim();

  if (!runId) {
    await startHookLabSocialActor({ client, idea, job, providerWorkerSecret });
    return null;
  }

  const run = await getApifyActorRun({ runId });

  if (getIsApifyActorRunPending(run.status)) {
    await waitForHookLabApifyRun({ client, job, providerWorkerSecret, runId });
    return null;
  }

  await markHookLabAnalysisJobStatus({
    client,
    job,
    progress: 0.2,
    providerJobId: run.id,
    providerWorkerSecret,
    stage: "hook-lab-reading-apify-result",
    status: "running",
  });

  if (run.status !== "SUCCEEDED") {
    throw new Error(`${getHookLabIdeaSourcePlatform(idea)} import did not complete.`);
  }

  const datasetId = run.defaultDatasetId ?? idea.providerDatasetId;

  if (!datasetId) {
    throw new Error("Hook Lab social import is missing its Apify dataset.");
  }

  await client.mutation(
    api["hookLabIdeas/recordProviderRun"].recordProviderRun,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: idea.id,
      providerRunId: run.id,
      providerDatasetId: datasetId,
      updatedAt: new Date().toISOString(),
    },
  );
  const [item] = await getApifyDatasetItems({ datasetId });

  if (!item) {
    throw new Error(`${getHookLabIdeaSourcePlatform(idea)} returned an empty dataset.`);
  }

  return getHookLabIdeaSourcePlatform(idea) === "tiktok"
    ? createHookLabTikTokSource(item, idea.canonicalUrl ?? "")
    : createHookLabInstagramSource(item, idea.canonicalUrl ?? "");
}
