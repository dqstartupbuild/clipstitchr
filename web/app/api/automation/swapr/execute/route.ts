import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getIsAuthorizedAutomationRequest } from "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest";
import { parseSwaprAutomationTaskInput } from "@/lib/clipstitchr/server/automation/parseSwaprAutomationTaskInput";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwaprPredictionJson } from "@/lib/clipstitchr/server/createSwaprPredictionJson";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { SWAPR_MAX_REFERENCE_DURATION_SECONDS } from "@/lib/clipstitchr/constants/swaprMaxReferenceDurationSeconds";
import { SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES } from "@/lib/clipstitchr/constants/swaprReferenceVideoMaxSizeBytes";
import { SWAPR_MODEL_ID } from "@/lib/clipstitchr/constants/swaprModelId";
import { getSwaprSegmentDurationLimit } from "@/lib/clipstitchr/utils/getSwaprSegmentDurationLimit";

export const runtime = "nodejs";

const LOCK_MS = 15 * 60 * 1000;

type AutomationSwaprExecuteRequestBody = {
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

  return (await request.json()) as AutomationSwaprExecuteRequestBody;
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
    : "Unable to execute Swapr automation.";
}

export async function POST(request: Request) {
  let task: ClaimedAutomationTask | null = null;

  try {
    if (!getIsAuthorizedAutomationRequest(request)) {
      return NextResponse.json(
        { message: "Unauthorized Swapr automation request." },
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
        : "nextjs-swapr-automation";

    task = await convex.mutation(api.automationTasks.claimNext, {
      secret,
      workerId,
      lockedUntil: getLockedUntil(now),
      updatedAt: now,
      tool: "swapr",
    });

    if (!task) {
      return NextResponse.json({ task: null });
    }

    if (task.taskType !== "swapr-video") {
      throw new Error("Claimed automation task is not a Swapr video task.");
    }

    const input = parseSwaprAutomationTaskInput(task.inputSnapshotJson);

    assertR2ObjectKeyBelongsToUser(input.photoObject.key, task.ownerId);
    assertR2ObjectKeyBelongsToUser(
      input.referenceVideoObject.key,
      task.ownerId,
    );

    if (!input.photoObject.contentType.startsWith("image/")) {
      throw new Error("Swapr automation photo object must be an image.");
    }

    if (!input.referenceVideoObject.contentType.startsWith("video/")) {
      throw new Error("Swapr automation reference object must be a video.");
    }

    if (input.referenceVideoObject.size > SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES) {
      throw new Error("Swapr automation reference video is too large.");
    }

    const segmentDurationLimit = getSwaprSegmentDurationLimit(
      input.characterOrientation,
    );

    if (input.referenceDurationSeconds > segmentDurationLimit + 0.25) {
      throw new Error("Swapr automation reference segment is too long.");
    }

    if (input.referenceDurationSeconds > SWAPR_MAX_REFERENCE_DURATION_SECONDS) {
      throw new Error("Swapr automation reference video is too long.");
    }

    const [image, video] = await Promise.all([
      getR2DownloadSignedUrl(input.photoObject.key),
      getR2DownloadSignedUrl(input.referenceVideoObject.key),
    ]);
    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.create({
      model: SWAPR_MODEL_ID,
      input: {
        image: image.url,
        video: video.url,
        prompt: input.prompt,
        mode: input.mode,
        keep_original_sound: input.keepOriginalSound,
        character_orientation: input.characterOrientation,
      },
    });
    const updatedAt = new Date().toISOString();

    await convex.mutation(api.replicateJobs.recordSwaprAutomationJob, {
      secret,
      ownerId: task.ownerId,
      predictionId: prediction.id,
      modelId: SWAPR_MODEL_ID,
      status: getReplicatePredictionStatus(prediction.status),
      createdAt: updatedAt,
      updatedAt,
    });
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
      prediction: createSwaprPredictionJson(prediction, {
        characterOrientation: input.characterOrientation,
        mode: input.mode,
      }),
    });
  } catch (error) {
    if (task) {
      const secret = getAutomationWorkerSecret();
      const convex = createConvexHttpClient();
      const updatedAt = new Date().toISOString();

      await convex
        .mutation(api.automationTasks.markStatus, {
          secret,
          ownerId: task.ownerId,
          id: task.id,
          status: "failed",
          stage: "provider-failed",
          error: getErrorMessage(error),
          updatedAt,
        })
        .catch(() => null);
    }

    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
