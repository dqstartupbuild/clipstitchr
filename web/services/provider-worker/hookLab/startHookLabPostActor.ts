import { anyApi } from "convex/server";
import { startApifyActorRun } from "@/lib/clipstitchr/server/apify/startApifyActorRun";
import { createHookLabApifyInput } from "./createHookLabApifyInput";
import { getHookLabActorId } from "./getHookLabActorId";
import { getHookLabApifyMaxTotalChargeUsd } from "./getHookLabApifyMaxTotalChargeUsd";
import type { HookLabPostDocument } from "./HookLabPostDocument";
import type { ProcessHookLabPostAnalysisOptions } from "./ProcessHookLabPostAnalysisOptions";
import { waitForHookLabPostActor } from "./waitForHookLabPostActor";

const api = anyApi;

export async function startHookLabPostActor({
  client,
  job,
  post,
  providerWorkerSecret,
}: ProcessHookLabPostAnalysisOptions & { post: HookLabPostDocument }) {
  const preparation = (await client.mutation(
    api["hookLabPosts/prepareProviderRun"].prepareProviderRun,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: post.id,
      updatedAt: new Date().toISOString(),
    },
  )) as
    | { action: "reuse"; providerRunId: string }
    | { action: "start" | "wait" };

  if (preparation.action === "reuse") {
    await waitForHookLabPostActor({
      client,
      job,
      providerWorkerSecret,
      runId: preparation.providerRunId,
    });
    return;
  }

  if (preparation.action === "wait") {
    throw new Error("The social import start could not be confirmed.");
  }

  const run = await startApifyActorRun({
    actorId: getHookLabActorId(post.platform),
    input: createHookLabApifyInput(post.platform, post.canonicalUrl),
    maxTotalChargeUsd: getHookLabApifyMaxTotalChargeUsd(),
  });

  await client.mutation(api["hookLabPosts/recordProviderRun"].recordProviderRun, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: post.id,
    providerRunId: run.id,
    providerDatasetId: run.defaultDatasetId,
    updatedAt: new Date().toISOString(),
  });
  await waitForHookLabPostActor({
    client,
    job,
    providerWorkerSecret,
    runId: run.id,
  });
}
