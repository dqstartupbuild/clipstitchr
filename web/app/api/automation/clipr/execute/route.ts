import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getIsAuthorizedAutomationRequest } from "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest";
import { parseCliprAutomationTaskInput } from "@/lib/clipstitchr/server/automation/parseCliprAutomationTaskInput";
import { createCliprAvatarVideo } from "@/lib/clipstitchr/server/createCliprAvatarVideo";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getCliprAvatarSourceScene } from "@/lib/clipstitchr/server/getCliprAvatarSourceScene";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";

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
    const textGeneration = await createCliprTextGeneration({
      durationSeconds: input.targetDurationSeconds,
      product: input.product,
      purpose: "clipr",
      replicate,
      slideCount: 4,
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

    const generatedAvatarVideo = await createCliprAvatarVideo({
      imageUrl: generatedAvatarImage.outputUrl,
      replicate,
      script: textGeneration.script,
      voiceId: input.voiceId,
    });
    const avatarVideoObject = await saveCliprAvatarVideoObject({
      body: generatedAvatarVideo.body,
      contentType: generatedAvatarVideo.contentType,
      jobId: input.jobId,
      userId: task.ownerId,
    });
    const job = await convex.mutation(
      api.cliprJobs.recordAvatarVideoOutputFromAutomation,
      {
        secret,
        ownerId: task.ownerId,
        id: input.jobId,
        avatarVideoObject,
        avatarVideoProviderPredictionId: generatedAvatarVideo.predictionId,
        providerModels: [generatedAvatarVideo.modelId],
        progress: 0.68,
        updatedAt: new Date().toISOString(),
      },
    );

    await convex.mutation(api.automationTasks.markStatus, {
      secret,
      ownerId: task.ownerId,
      id: task.id,
      status: "running",
      stage: "awaiting-media-finalization",
      providerJobId: generatedAvatarVideo.predictionId,
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
