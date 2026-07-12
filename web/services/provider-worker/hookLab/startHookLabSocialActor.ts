import { anyApi } from "convex/server";
import { startApifyActorRun } from "@/lib/clipstitchr/server/apify/startApifyActorRun";
import { createHookLabApifyInput } from "./createHookLabApifyInput";
import { getHookLabActorId } from "./getHookLabActorId";
import { getHookLabApifyMaxTotalChargeUsd } from "./getHookLabApifyMaxTotalChargeUsd";
import { getHookLabIdeaSourcePlatform } from "./getHookLabIdeaSourcePlatform";
import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";
import { waitForHookLabApifyRun } from "./waitForHookLabApifyRun";

const api = anyApi;

export async function startHookLabSocialActor({
  client,
  idea,
  job,
  providerWorkerSecret,
}: ProcessHookLabIdeaAnalysisOptions & { idea: HookLabIdeaDocument }) {
  const platform = getHookLabIdeaSourcePlatform(idea);
  const canonicalUrl = idea.canonicalUrl?.trim();

  if (!canonicalUrl) {
    throw new Error("Hook Lab social idea is missing its canonical URL.");
  }

  const requestedAt = new Date().toISOString();
  const preparation = (await client.mutation(
    api["hookLabIdeas/prepareProviderRun"].prepareProviderRun,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: idea.id,
      requestedAt,
    },
  )) as
    | { providerRunId: string; state: "recorded" }
    | { state: "start" | "unconfirmed" };

  if (preparation.state === "recorded") {
    await waitForHookLabApifyRun({
      client,
      job,
      providerWorkerSecret,
      runId: preparation.providerRunId,
    });
    return;
  }

  if (preparation.state === "unconfirmed") {
    throw new Error("The social import start could not be confirmed.");
  }

  const run = await startApifyActorRun({
    actorId: getHookLabActorId(platform),
    input: createHookLabApifyInput(platform, canonicalUrl),
    maxTotalChargeUsd: getHookLabApifyMaxTotalChargeUsd(),
  });
  const updatedAt = new Date().toISOString();

  await client.mutation(
    api["hookLabIdeas/recordProviderRun"].recordProviderRun,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: idea.id,
      providerRunId: run.id,
      providerDatasetId: run.defaultDatasetId,
      updatedAt,
    },
  );
  await waitForHookLabApifyRun({
    client,
    job,
    providerWorkerSecret,
    runId: run.id,
  });
}
