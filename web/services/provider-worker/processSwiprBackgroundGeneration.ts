import type { Prediction } from "replicate";
import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwiprBackgroundGenerationInput } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationInput";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import type { ProviderImageJob } from "./ProviderImageJob";

const api = anyApi;

type SwiprBackgroundJobInput = {
  modelId: string;
  outputRecordId: string;
  prompt: string;
};

function parseInput(inputSnapshotJson: string): SwiprBackgroundJobInput {
  const input = JSON.parse(
    inputSnapshotJson,
  ) as Partial<SwiprBackgroundJobInput>;

  if (!input.modelId || !input.outputRecordId || !input.prompt) {
    throw new Error("Swipr background job input is incomplete.");
  }

  return {
    modelId: input.modelId,
    outputRecordId: input.outputRecordId,
    prompt: input.prompt,
  };
}

export async function processSwiprBackgroundGeneration(
  client: ConvexHttpClient,
  job: ProviderImageJob,
  providerWorkerSecret: string,
) {
  const input = parseInput(job.inputSnapshotJson);
  const replicate = createReplicateClient();
  const existingPredictionId = job.providerJobIds[0];
  const prediction = existingPredictionId
    ? await replicate.predictions.get(existingPredictionId)
    : await replicate.predictions.create({
        ...getReplicatePredictionModelReference(input.modelId),
        input: createSwiprBackgroundGenerationInput({
          modelId: input.modelId,
          prompt: input.prompt,
        }),
      });

  if (!existingPredictionId) {
    await client.mutation(api.providerJobs.markProviderStatus, {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "running",
      stage: "provider-created",
      providerJobId: prediction.id,
      progress: 0.2,
      updatedAt: new Date().toISOString(),
    });
  }

  const completedPrediction = await replicate.wait(prediction, {
    interval: 2_000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Swipr background generation.",
    );
  }

  const outputUrl = getReplicateOutputUrl(
    (completedPrediction as Prediction).output,
  );
  const outputResponse = await fetchReplicateOutput(outputUrl);
  const contentType =
    outputResponse.headers.get("content-type") ?? "image/jpeg";
  const body = await outputResponse.arrayBuffer();
  const outputObject = await putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "provider-output-image",
      recordId: input.outputRecordId,
      userId: job.ownerId,
    }),
  });

  await client.mutation(api.providerJobs.markProviderStatus, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status: "completed",
    stage: "completed",
    outputAssetId: outputObject.key,
    providerJobId: completedPrediction.id,
    progress: 1,
    updatedAt: new Date().toISOString(),
  });
}
