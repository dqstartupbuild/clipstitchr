import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createCliprDemoTextGeneration } from "@/lib/clipstitchr/server/createCliprDemoTextGeneration";
import { createCliprDemoVideoOutput } from "@/lib/clipstitchr/server/createCliprDemoVideoOutput";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getCliprFinalClipName } from "@/lib/clipstitchr/utils/getCliprFinalClipName";

const api = anyApi;

type DemoProviderConfig = {
  providerWorkerSecret: string;
};

type DemoProviderJob = {
  id: string;
  ownerId: string;
};

type DemoCliprProviderInput = {
  audienceDetails: string;
  demoClipId?: string;
  demoClipName?: string;
  demoVideoDescription?: string;
  demoVideoObject?: R2ObjectReference;
  durationSeconds: CliprDurationSeconds;
  inferredPainPoints: string[];
  inferredProblem?: string;
  jobId: string;
  productDetails: string;
  productId: string;
  productName: string;
};

type MarkDemoProviderJobStatus<
  TConfig extends DemoProviderConfig,
  TJob extends DemoProviderJob,
> = (options: {
  client: ConvexHttpClient;
  config: TConfig;
  error?: string;
  mediaJobId?: string;
  outputAssetId?: string;
  progress?: number;
  providerJobId?: string;
  releaseLock?: boolean;
  stage?: string;
  status: "queued" | "running" | "completed" | "failed" | "canceled";
  job: TJob;
}) => Promise<void>;

type ProcessManualCliprDemoOptions<
  TConfig extends DemoProviderConfig,
  TJob extends DemoProviderJob,
> = {
  client: ConvexHttpClient;
  config: TConfig;
  getNow: () => string;
  input: DemoCliprProviderInput;
  job: TJob;
  markProviderJobStatus: MarkDemoProviderJobStatus<TConfig, TJob>;
};

export async function processManualCliprDemo<
  TConfig extends DemoProviderConfig,
  TJob extends DemoProviderJob,
>({
  client,
  config,
  getNow,
  input,
  job,
  markProviderJobStatus,
}: ProcessManualCliprDemoOptions<TConfig, TJob>) {
  if (!input.demoClipId || !input.demoClipName || !input.demoVideoObject) {
    throw new Error("Clipr Demo mode needs a saved demo video.");
  }

  assertR2ObjectKeyBelongsToUser(input.demoVideoObject.key, job.ownerId);

  if (!input.demoVideoObject.contentType.startsWith("video/")) {
    throw new Error("Clipr Demo mode needs a video demo.");
  }

  const now = getNow();
  const product: ProductProfile = {
    id: input.productId,
    name: input.productName,
    productDetails: input.productDetails,
    audienceDetails: input.audienceDetails,
    inferredProblem: input.inferredProblem,
    inferredPainPoints: input.inferredPainPoints,
    createdAt: now,
    updatedAt: now,
  };
  const replicate = createReplicateClient();
  const textGeneration = createCliprDemoTextGeneration({
    demoClipId: input.demoClipId,
    demoClipName: input.demoClipName,
    demoVideoDescription: input.demoVideoDescription,
    durationSeconds: input.durationSeconds,
    product,
  });

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "demo-plan",
    progress: 0.18,
  });

  await client.mutation(api.cliprJobs.applyScriptPlanFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.jobId,
    hookStyleKey: textGeneration.hookStyleKey,
    hookTemplateId: textGeneration.hookTemplateId,
    filledHook: textGeneration.filledHook,
    variablesUsed: textGeneration.variablesUsed,
    script: textGeneration.script,
    scenePlan: textGeneration.scenePlan,
    providerModel: textGeneration.providerModel,
    updatedAt: getNow(),
  });

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "demo-video-provider",
    progress: 0.32,
  });

  const demoVideoUrl = await getR2DownloadSignedUrl(input.demoVideoObject.key);
  const avatarVideoOutput = await createCliprDemoVideoOutput({
    demoClipName: input.demoClipName,
    demoVideoDescription: input.demoVideoDescription,
    durationSeconds: input.durationSeconds,
    jobId: input.jobId,
    product,
    referenceVideoUrl: demoVideoUrl.url,
    replicate,
    userId: job.ownerId,
  });
  const clipName = getCliprFinalClipName(input.productName, getNow());
  const mediaClipId = createId();
  const mediaJob = (await client.mutation(
    api.mediaJobs.createCliprFinalizationFromProvider,
    {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      id: `media:clipr-finalization:${input.jobId}`,
      idempotencyKey: `${job.id}:clipr-finalization`,
      inputSnapshotJson: JSON.stringify({
        avatarVideoProviderPredictionId:
          avatarVideoOutput.avatarVideoProviderPredictionId,
        clipId: mediaClipId,
        clipName,
        cliprJobId: input.jobId,
        providerJobId: job.id,
        sourceSummary: `${input.productName} demo remix`,
        stripAudio: true,
        sourceVideoObject: avatarVideoOutput.avatarVideoObject,
      }),
      createdAt: getNow(),
    },
  )) as { id: string };

  await client.mutation(api.cliprJobs.recordAvatarVideoOutputFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.jobId,
    avatarVideoObject: avatarVideoOutput.avatarVideoObject,
    avatarVideoProviderPredictionId:
      avatarVideoOutput.avatarVideoProviderPredictionId,
    providerModels: avatarVideoOutput.providerModels,
    progress: 0.68,
    updatedAt: getNow(),
  });
  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "awaiting-media-finalization",
    providerJobId: avatarVideoOutput.avatarVideoProviderPredictionId,
    mediaJobId: mediaJob.id,
    progress: 0.72,
    releaseLock: true,
  });
}
