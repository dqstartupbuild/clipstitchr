import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { SWAPR_MAX_REFERENCE_DURATION_SECONDS } from "@/lib/clipstitchr/constants/swaprMaxReferenceDurationSeconds";
import { SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES } from "@/lib/clipstitchr/constants/swaprReferenceVideoMaxSizeBytes";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getGenerationSpeedTier } from "@/lib/clipstitchr/utils/getGenerationSpeedTier";
import { getGenerationSpeedTierProfile } from "@/lib/clipstitchr/utils/getGenerationSpeedTierProfile";
import { getSwaprSegmentDurationLimit } from "@/lib/clipstitchr/utils/getSwaprSegmentDurationLimit";

export const runtime = "nodejs";

type SwaprGenerationRequestBody = {
  batchId?: unknown;
  characterOrientation?: unknown;
  clipId?: unknown;
  clipName?: unknown;
  generationSpeedTier?: unknown;
  keepOriginalSound?: unknown;
  mode?: unknown;
  photoId?: unknown;
  prompt?: unknown;
  referenceClipId?: unknown;
  referenceClipName?: unknown;
  segments?: unknown;
  totalEstimatedDurationSeconds?: unknown;
};

function getString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${label}.`);
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Missing ${label}.`);
  }

  return value;
}

function getSwaprMode(value: unknown) {
  return value === "pro" ? "pro" : "std";
}

function getSwaprCharacterOrientation(value: unknown) {
  return value === "video" ? "video" : "image";
}

function getR2ObjectReference(value: unknown): R2ObjectReference {
  if (!value || typeof value !== "object") {
    throw new Error("Missing Swapr reference video object.");
  }

  const object = value as Partial<R2ObjectReference>;

  if (!object.key || typeof object.key !== "string") {
    throw new Error("Missing Swapr reference video object key.");
  }

  if (!object.contentType || typeof object.contentType !== "string") {
    throw new Error("Missing Swapr reference video content type.");
  }

  if (
    typeof object.size !== "number" ||
    !Number.isFinite(object.size) ||
    object.size <= 0
  ) {
    throw new Error("Missing Swapr reference video size.");
  }

  return {
    key: object.key,
    contentType: object.contentType,
    size: Math.ceil(object.size),
  };
}

function getSegments(value: unknown) {
  if (!Array.isArray(value) || !value.length) {
    throw new Error("Choose a source video before starting Swapr.");
  }

  return value.map((segment, index) => {
    if (!segment || typeof segment !== "object") {
      throw new Error("Invalid Swapr segment.");
    }

    const item = segment as {
      duration?: unknown;
      videoObject?: unknown;
    };

    return {
      duration: getNumber(item.duration, "Swapr segment duration"),
      index,
      videoObject: getR2ObjectReference(item.videoObject),
    };
  });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const body = (await request.json()) as SwaprGenerationRequestBody;
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();
    const batchId = getOptionalString(body.batchId) ?? createId();
    const photoId = getString(body.photoId, "Swapr photo ID");
    const photoDocument = await convex.query(api.photoAssets.get, {
      id: photoId,
    });

    if (!photoDocument) {
      throw new Error("Saved Swapr photo not found.");
    }

    assertR2ObjectKeyBelongsToUser(photoDocument.photoObject.key, userId);

    if (!photoDocument.photoObject.contentType.startsWith("image/")) {
      throw new Error("Swapr photo object must be an image.");
    }

    const requestedGenerationSpeedTier = getOptionalString(
      body.generationSpeedTier,
    );
    const generationSpeedTier = requestedGenerationSpeedTier
      ? getGenerationSpeedTier(requestedGenerationSpeedTier)
      : undefined;
    const speedProfile = generationSpeedTier
      ? getGenerationSpeedTierProfile(generationSpeedTier)
      : undefined;
    const mode = speedProfile?.swaprMode ?? getSwaprMode(body.mode);
    const characterOrientation =
      speedProfile?.swaprCharacterOrientation ??
      getSwaprCharacterOrientation(body.characterOrientation);
    const segments = getSegments(body.segments);
    const segmentDurationLimit = getSwaprSegmentDurationLimit(
      characterOrientation,
    );
    const totalEstimatedDurationSeconds = getNumber(
      body.totalEstimatedDurationSeconds,
      "Swapr total duration",
    );

    if (
      totalEstimatedDurationSeconds >
      SWAPR_MAX_REFERENCE_DURATION_SECONDS + 0.25
    ) {
      throw new Error("Swapr reference video is too long.");
    }

    for (const segment of segments) {
      assertR2ObjectKeyBelongsToUser(segment.videoObject.key, userId);

      if (!segment.videoObject.contentType.startsWith("video/")) {
        throw new Error("Swapr reference object must be a video.");
      }

      if (segment.videoObject.size > SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES) {
        throw new Error("Choose a smaller source video for Swapr.");
      }

      if (segment.duration > segmentDurationLimit + 0.25) {
        throw new Error("Swapr reference segment is too long.");
      }
    }

    await Promise.all(
      segments.map((segment, index) =>
        convex.mutation(api.rateLimits.consumeSwaprJobCreate, {
          estimatedSeconds:
            index === 0 ? totalEstimatedDurationSeconds : segment.duration,
          secret,
          shouldConsumeUserQuota: index === 0,
        }),
      ),
    );
    await Promise.all(
      Array.from({ length: segments.length + 1 }, () =>
        convex.mutation(api.rateLimits.consumeR2Download, { secret }),
      ),
    );

    const createdAt = new Date().toISOString();
    const job = await convex.mutation(api.providerJobs.create, {
      secret,
      ownerId: userId,
      id: `provider:swapr:${batchId}`,
      jobType: "manual-swapr",
      stage: "awaiting-provider",
      idempotencyKey: `${userId}:manual-swapr:${batchId}`,
      inputSnapshotJson: JSON.stringify({
        batchId,
        characterOrientation,
        clipId: getOptionalString(body.clipId) ?? createId(),
        clipName:
          getOptionalString(body.clipName) ??
          `Swapr - ${photoDocument.name ?? "Generated clip"}`,
        generationSpeedTier,
        keepOriginalSound: body.keepOriginalSound === true,
        mode,
        photoObject: photoDocument.photoObject,
        prompt: getOptionalString(body.prompt) ?? "",
        referenceClipId: getString(body.referenceClipId, "reference clip ID"),
        referenceClipName: getString(
          body.referenceClipName,
          "reference clip name",
        ),
        segments: segments.map((segment) => ({
          ...segment,
          referenceClipId: getString(body.referenceClipId, "reference clip ID"),
          referenceClipName: getString(
            body.referenceClipName,
            "reference clip name",
          ),
        })),
        sourcePhotoId: photoDocument.id,
        sourcePhotoName: photoDocument.name,
        totalEstimatedDurationSeconds,
      }),
      createdAt,
    });

    return NextResponse.json({ job });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to queue Swapr generation.",
      },
      { status: 500 },
    );
  }
}
