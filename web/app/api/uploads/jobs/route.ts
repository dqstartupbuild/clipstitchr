import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { UploadNormalizationLayout } from "@/lib/clipstitchr/types/UploadNormalizationLayout";

export const runtime = "nodejs";

type UploadVideoJobRequestBody = {
  clipId?: unknown;
  clipType?: unknown;
  layout?: unknown;
  originalName?: unknown;
  productId?: unknown;
  sourceVideoObject?: unknown;
};

function getString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${label}.`);
  }

  return value.trim();
}

function getClipType(value: unknown): ClipType {
  return value === "demo" ? "demo" : "ugc";
}

function getUploadNormalizationLayout(
  value: unknown,
): UploadNormalizationLayout | undefined {
  if (
    value === "crop-fill" ||
    value === "fit-with-background"
  ) {
    return value;
  }

  return undefined;
}

function getR2ObjectReference(value: unknown): R2ObjectReference {
  if (!value || typeof value !== "object") {
    throw new Error("Missing source video object.");
  }

  const object = value as Partial<R2ObjectReference>;

  if (!object.key || typeof object.key !== "string") {
    throw new Error("Missing source video object key.");
  }

  if (!object.contentType || typeof object.contentType !== "string") {
    throw new Error("Missing source video content type.");
  }

  if (
    typeof object.size !== "number" ||
    !Number.isFinite(object.size) ||
    object.size <= 0
  ) {
    throw new Error("Missing source video size.");
  }

  return {
    key: object.key,
    contentType: object.contentType,
    size: Math.ceil(object.size),
  };
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

    const body = (await request.json()) as UploadVideoJobRequestBody;
    const clipId = getString(body.clipId, "clip ID");
    const clipType = getClipType(body.clipType);
    const layout = getUploadNormalizationLayout(body.layout);
    const originalName = getString(body.originalName, "original name");
    const productId =
      typeof body.productId === "string" && body.productId.trim()
        ? body.productId.trim()
        : undefined;
    const sourceVideoObject = getR2ObjectReference(body.sourceVideoObject);

    assertR2ObjectKeyBelongsToUser(sourceVideoObject.key, userId);

    if (!sourceVideoObject.contentType.startsWith("video/")) {
      throw new Error("Upload source must be a video.");
    }

    if (!productId) {
      throw new Error("Choose a product before uploading videos.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    const product = await convex.query(api.products.get, { id: productId });

    if (!product) {
      throw new Error("Product not found.");
    }

    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeUploadVideoAnalysis, {
      secret,
    });

    const createdAt = new Date().toISOString();
    const job = await convex.mutation(api.mediaJobs.createUploadNormalization, {
      secret,
      ownerId: userId,
      id: `media:upload-normalization:${clipId}`,
      idempotencyKey: `${userId}:upload-normalization:${clipId}`,
      inputSnapshotJson: JSON.stringify({
        clipId,
        clipType,
        layout,
        originalName,
        productId,
        sourceVideoObject,
      }),
      createdAt,
    });

    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
      },
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to queue this upload.",
      },
      { status: 500 },
    );
  }
}
