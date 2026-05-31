import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getIsAuthorizedAutomationRequest } from "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest";
import { parseSwaprAutomationTaskInput } from "@/lib/clipstitchr/server/automation/parseSwaprAutomationTaskInput";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { SWAPR_MODEL_ID } from "@/lib/clipstitchr/constants/swaprModelId";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";

export const runtime = "nodejs";

const LOCK_MS = 15 * 60 * 1000;

type AutomationSwaprFinalizeRequestBody = {
  now?: string;
  workerId?: string;
};

type ClaimedAutomationTask = {
  id: string;
  inputSnapshotJson: string;
  ownerId: string;
  providerJobIds: string[];
  runId: string;
  taskType: string;
};

async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {};
  }

  return (await request.json()) as AutomationSwaprFinalizeRequestBody;
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
    : "Unable to finalize Swapr automation.";
}

function getProviderPredictionId(task: ClaimedAutomationTask) {
  const [predictionId] = task.providerJobIds;

  if (!predictionId) {
    throw new Error("Swapr automation task is missing a provider job.");
  }

  return predictionId;
}

function getIsTerminalFailure(status: string) {
  return status === "failed" || status === "canceled" || status === "aborted";
}

export async function POST(request: Request) {
  let task: ClaimedAutomationTask | null = null;

  try {
    if (!getIsAuthorizedAutomationRequest(request)) {
      return NextResponse.json(
        { message: "Unauthorized Swapr finalization request." },
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
        : "nextjs-swapr-finalizer";

    task = await convex.mutation(api.automationTasks.claimNextByStage, {
      secret,
      workerId,
      lockedUntil: getLockedUntil(now),
      updatedAt: now,
      tool: "swapr",
      stage: "provider-created",
    });

    if (!task) {
      return NextResponse.json({ task: null });
    }

    if (task.taskType !== "swapr-video") {
      throw new Error("Claimed automation task is not a Swapr video task.");
    }

    const input = parseSwaprAutomationTaskInput(task.inputSnapshotJson);
    const predictionId = getProviderPredictionId(task);
    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.get(predictionId);
    const predictionStatus = getReplicatePredictionStatus(prediction.status);
    const outputUrl = getSwaprPredictionOutputUrl(prediction.output);
    const updatedAt = new Date().toISOString();

    await convex.mutation(api.replicateJobs.updateSwaprAutomationJobStatus, {
      secret,
      ownerId: task.ownerId,
      predictionId: prediction.id,
      status: predictionStatus,
      outputUrl: outputUrl ?? undefined,
      error:
        typeof prediction.error === "string" ? prediction.error : undefined,
      updatedAt,
    });

    if (getIsTerminalFailure(predictionStatus)) {
      await Promise.all([
        convex.mutation(api.automationTasks.markStatus, {
          secret,
          ownerId: task.ownerId,
          id: task.id,
          status: "failed",
          stage: "provider-failed",
          error:
            typeof prediction.error === "string"
              ? prediction.error
              : `Swapr provider ${predictionStatus}.`,
          updatedAt,
        }),
        convex.mutation(api.automationRuns.markStatus, {
          secret,
          ownerId: task.ownerId,
          id: task.runId,
          status: "failed",
          error:
            typeof prediction.error === "string"
              ? prediction.error
              : `Swapr provider ${predictionStatus}.`,
          updatedAt,
        }),
      ]);

      return NextResponse.json({
        task: {
          id: task.id,
          ownerId: task.ownerId,
          runId: task.runId,
          stage: "provider-failed",
          status: "failed",
        },
        mediaJob: null,
        prediction: {
          id: prediction.id,
          status: predictionStatus,
        },
      });
    }

    if (predictionStatus !== "succeeded") {
      await convex.mutation(api.automationTasks.markStatus, {
        secret,
        ownerId: task.ownerId,
        id: task.id,
        status: "running",
        stage: "provider-created",
        providerJobId: prediction.id,
        updatedAt,
      });

      return NextResponse.json({
        task: {
          id: task.id,
          ownerId: task.ownerId,
          runId: task.runId,
          stage: "provider-created",
          status: "running",
        },
        mediaJob: null,
        prediction: {
          id: prediction.id,
          status: predictionStatus,
        },
      });
    }

    if (!outputUrl) {
      throw new Error("Replicate completed but did not return a Swapr output.");
    }

    const clipId = createId();
    const mediaJob = await convex.mutation(
      api.mediaJobs.createSwaprFinalizationFromAutomation,
      {
        secret,
        ownerId: task.ownerId,
        id: `media:swapr-finalization:${task.id}`,
        idempotencyKey: `${task.id}:swapr-finalization`,
        inputSnapshotJson: JSON.stringify({
          automationDate: input.automationDate,
          automationRunId: task.runId,
          automationTaskId: task.id,
          characterOrientation: input.characterOrientation,
          clipId,
          clipName: `Swapr - ${input.sourcePhotoName} in ${input.referenceClipName}`,
          keepOriginalSound: input.keepOriginalSound,
          mode: input.mode,
          modelId: SWAPR_MODEL_ID,
          outputUrl,
          predictionId: prediction.id,
          prompt: input.prompt,
          referenceClipId: input.referenceClipId,
          referenceClipName: input.referenceClipName,
          sourcePhotoId: input.photoId,
          sourcePhotoName: input.sourcePhotoName,
          sourceSummary: `${input.sourcePhotoName} in ${input.referenceClipName}`,
        }),
        createdAt: updatedAt,
      },
    );

    await convex.mutation(api.automationTasks.markStatus, {
      secret,
      ownerId: task.ownerId,
      id: task.id,
      status: "running",
      stage: "awaiting-media-finalization",
      providerJobId: prediction.id,
      mediaJobId: mediaJob.id,
      releaseLock: true,
      updatedAt,
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
      prediction: {
        id: prediction.id,
        status: predictionStatus,
      },
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
            stage: "finalization-failed",
            error: getErrorMessage(error),
            updatedAt,
          })
          .catch(() => null),
        convex
          .mutation(api.automationRuns.markStatus, {
            secret,
            ownerId: task.ownerId,
            id: task.runId,
            status: "failed",
            error: getErrorMessage(error),
            updatedAt,
          })
          .catch(() => null),
      ]);
    }

    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
