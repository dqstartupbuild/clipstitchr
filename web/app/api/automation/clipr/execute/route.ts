import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getIsAuthorizedAutomationRequest } from "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest";
import { parseCliprAutomationTaskInput } from "@/lib/clipstitchr/server/automation/parseCliprAutomationTaskInput";
import { createCliprJobTextGeneration } from "@/lib/clipstitchr/server/createCliprJobTextGeneration";
import { createCliprJobVideoOutput } from "@/lib/clipstitchr/server/createCliprJobVideoOutput";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getCliprAvatarSourceScene } from "@/lib/clipstitchr/server/getCliprAvatarSourceScene";
import { getCliprLipSyncModelId } from "@/lib/clipstitchr/server/getCliprLipSyncModelId";
import { getCliprTtsModelId } from "@/lib/clipstitchr/server/getCliprTtsModelId";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getCliprFinalClipName } from "@/lib/clipstitchr/utils/getCliprFinalClipName";

export const runtime = "nodejs";

const LOCK_MS = 45 * 60 * 1000;

type AutomationCliprExecuteRequestBody = {
  now?: string;
  workerId?: string;
};

type ClaimedAutomationTask = {
  id: string;
  inputSnapshotJson: string;
  ownerId: string;
  runId: string;
  taskType: string;
};

async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {};
  }

  return (await request.json()) as AutomationCliprExecuteRequestBody;
}

function getNow(value: unknown) {
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
    return value;
  }

  return new Date().toISOString();
}

function getLockedUntil(now: string) {
  return new Date(Date.parse(now) + LOCK_MS).toISOString();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to execute Clipr automation.";
}

export async function POST(request: Request) {
  let task: ClaimedAutomationTask | null = null;
  let jobId: string | null = null;

  try {
    if (!getIsAuthorizedAutomationRequest(request)) {
      return NextResponse.json(
        { message: "Unauthorized Clipr automation request." },
        { status: 401 },
      );
    }

    const body = await readBody(request);
    const now = getNow(body.now);
    const secret = getAutomationWorkerSecret();
    const convex = createConvexHttpClient();
    const workerId =
      typeof body.workerId === "string" && body.workerId.trim()
        ? body.workerId.trim()
        : "nextjs-clipr-automation";

    task = await convex.mutation(api.automationTasks.claimNext, {
      secret,
      workerId,
      lockedUntil: getLockedUntil(now),
      updatedAt: now,
      tool: "clipr",
    });

    if (!task) {
      return NextResponse.json({ task: null });
    }

    if (task.taskType !== "clipr-video") {
      throw new Error("Claimed automation task is not a Clipr video task.");
    }

    const input = parseCliprAutomationTaskInput(
      task.id,
      task.inputSnapshotJson,
    );

    jobId = input.jobId;

    assertR2ObjectKeyBelongsToUser(input.avatarPhotoObject.key, task.ownerId);

    if (!input.avatarPhotoObject.contentType.startsWith("image/")) {
      throw new Error("Clipr automation avatar photo must be an image.");
    }

    await convex.mutation(api.cliprJobs.createQueuedFromAutomation, {
      secret,
      ownerId: task.ownerId,
      id: input.jobId,
      productId: input.product.id,
      productName: input.product.name,
      productDetails: input.product.productDetails,
      audienceDetails: input.product.audienceDetails,
      productInferredProblem: input.product.inferredProblem,
      productInferredPainPoints: input.product.inferredPainPoints,
      avatarId: input.avatarId,
      avatarName: input.avatarName,
      avatarPhotoId: input.avatarPhotoId,
      voiceId: input.voiceId,
      requestedGenerationMode: input.requestedGenerationMode,
      generationMode: input.generationMode,
      requestedVideoModelId: input.requestedVideoModelId,
      videoModelId: input.videoModelId,
      targetDurationSeconds: input.targetDurationSeconds,
      createdAt: now,
    });
    await convex.mutation(api.automationTasks.markStatus, {
      secret,
      ownerId: task.ownerId,
      id: task.id,
      status: "running",
      stage: "script-provider",
      updatedAt: new Date().toISOString(),
    });

    const replicate = createReplicateClient();
    const textGeneration = await createCliprJobTextGeneration({
      durationSeconds: input.targetDurationSeconds,
      generationMode: input.generationMode,
      jobId: input.jobId,
      product: input.product,
      replicate,
    });

    await convex.mutation(api.cliprJobs.applyScriptPlanFromAutomation, {
      secret,
      ownerId: task.ownerId,
      id: input.jobId,
      hookStyleKey: textGeneration.hookStyleKey,
      hookTemplateId: textGeneration.hookTemplateId,
      filledHook: textGeneration.filledHook,
      variablesUsed: textGeneration.variablesUsed,
      script: textGeneration.script,
      scenePlan: textGeneration.scenePlan,
      providerModel: textGeneration.providerModel,
      updatedAt: new Date().toISOString(),
    });
    await convex.mutation(api.automationTasks.markStatus, {
      secret,
      ownerId: task.ownerId,
      id: task.id,
      status: "running",
      stage: "avatar-image-provider",
      updatedAt: new Date().toISOString(),
    });

    const referenceImageUrl = (
      await getR2DownloadSignedUrl(input.avatarPhotoObject.key)
    ).url;
    const avatarSourceScene = getCliprAvatarSourceScene(
      textGeneration.scenePlan,
      textGeneration.script,
    );
    const generatedAvatarImage = await createCliprSceneAvatarImage({
      avatarDescription: input.avatarDescription,
      generationMode: input.generationMode,
      referenceImageUrl,
      replicate,
      scene: avatarSourceScene,
    });
    const avatarImageObject = await saveCliprSceneImageObject({
      body: generatedAvatarImage.body,
      contentType: generatedAvatarImage.contentType,
      jobId: input.jobId,
      sceneId: "avatar-source",
      userId: task.ownerId,
    });

    await convex.mutation(api.cliprJobs.recordAvatarImageOutputFromAutomation, {
      secret,
      ownerId: task.ownerId,
      id: input.jobId,
      avatarImageObject,
      avatarImageProviderPredictionId: generatedAvatarImage.predictionId,
      providerModels: [generatedAvatarImage.modelId],
      progress: 0.45,
      updatedAt: new Date().toISOString(),
    });
    await convex.mutation(api.automationTasks.markStatus, {
      secret,
      ownerId: task.ownerId,
      id: task.id,
      status: "running",
      stage: "avatar-video-provider",
      providerJobId: generatedAvatarImage.predictionId,
      updatedAt: new Date().toISOString(),
    });

    const avatarImageUrl = await getR2DownloadSignedUrl(avatarImageObject.key);
    const avatarVideoOutput = await createCliprJobVideoOutput({
      durationSeconds: input.targetDurationSeconds,
      generationMode: input.generationMode,
      imageUrl: avatarImageUrl.url,
      jobId: input.jobId,
      lipSyncModelId: getCliprLipSyncModelId(),
      prompt: avatarSourceScene.visualPrompt,
      replicate,
      script: textGeneration.script,
      ttsModelId: getCliprTtsModelId(),
      userId: task.ownerId,
      videoModelId: input.videoModelId,
      voiceId: input.voiceId,
    });
    const mediaClipId = createId();
    const mediaJobId = `media:clipr-finalization:${input.jobId}`;
    const clipName = getCliprFinalClipName(input.product.name, now);
    const job = await convex.mutation(
      api.cliprJobs.recordAvatarVideoOutputFromAutomation,
      {
        secret,
        ownerId: task.ownerId,
        id: input.jobId,
        avatarVideoObject: avatarVideoOutput.avatarVideoObject,
        avatarVideoProviderPredictionId:
          avatarVideoOutput.avatarVideoProviderPredictionId,
        providerModels: avatarVideoOutput.providerModels,
        progress: 0.68,
        updatedAt: new Date().toISOString(),
      },
    );
    const mediaJob = await convex.mutation(
      api.mediaJobs.createCliprFinalizationFromAutomation,
      {
        secret,
        ownerId: task.ownerId,
        id: mediaJobId,
        idempotencyKey: `${task.id}:clipr-finalization`,
        inputSnapshotJson: JSON.stringify({
          automationDate: input.automationDate,
          automationRunId: task.runId,
          automationTaskId: task.id,
          avatarVideoProviderPredictionId:
            avatarVideoOutput.avatarVideoProviderPredictionId,
          clipId: mediaClipId,
          clipName,
          cliprJobId: input.jobId,
          sourceSummary: `${input.product.name} with ${input.avatarName}`,
          stripAudio: input.generationMode !== "script",
          sourceVideoObject: avatarVideoOutput.avatarVideoObject,
        }),
        createdAt: new Date().toISOString(),
      },
    );

    await convex.mutation(api.automationTasks.markStatus, {
      secret,
      ownerId: task.ownerId,
      id: task.id,
      status: "running",
      stage: "awaiting-media-finalization",
      providerJobId: avatarVideoOutput.avatarVideoProviderPredictionId,
      mediaJobId: mediaJob.id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      task: {
        id: task.id,
        ownerId: task.ownerId,
        runId: task.runId,
        stage: "awaiting-media-finalization",
        status: "running",
      },
      mediaJob,
      job,
    });
  } catch (error) {
    if (task) {
      const secret = getAutomationWorkerSecret();
      const convex = createConvexHttpClient();
      const updatedAt = new Date().toISOString();

      await Promise.all([
        convex
          .mutation(api.automationTasks.markStatus, {
            secret,
            ownerId: task.ownerId,
            id: task.id,
            status: "failed",
            stage: "provider-failed",
            error: getErrorMessage(error),
            updatedAt,
          })
          .catch(() => null),
        jobId
          ? convex
              .mutation(api.cliprJobs.failFromAutomation, {
                secret,
                ownerId: task.ownerId,
                id: jobId,
                error: getErrorMessage(error),
                updatedAt,
              })
              .catch(() => null)
          : Promise.resolve(null),
      ]);
    }

    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
