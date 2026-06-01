import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getAvatarIdentityMode } from "@/lib/clipstitchr/server/getAvatarIdentityMode";
import { getAvatarLightingOption } from "@/lib/clipstitchr/server/getAvatarLightingOption";
import { getAvatarPhotoGenerationCount } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationCount";
import { getAvatarPhotoGenerationModelId } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelId";
import { getAvatarStyleOption } from "@/lib/clipstitchr/server/getAvatarStyleOption";
import { getAvatarWardrobeStyle } from "@/lib/clipstitchr/server/getAvatarWardrobeStyle";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getGenerationSpeedTier } from "@/lib/clipstitchr/utils/getGenerationSpeedTier";

export const runtime = "nodejs";

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

    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const avatarId = getSwaprFormString(formData, "avatarId").trim();
    const avatarName = getSwaprFormString(formData, "avatarName").trim();
    const avatarDescription =
      getSwaprFormString(formData, "avatarDescription").trim();
    const count = getAvatarPhotoGenerationCount(
      getSwaprFormString(formData, "count"),
    );
    const context = getSwaprFormString(formData, "context").trim();
    const identityMode = getAvatarIdentityMode(
      getSwaprFormString(formData, "identityMode"),
    );
    const lighting = getAvatarLightingOption(
      getSwaprFormString(formData, "lighting"),
    );
    const location = getSwaprFormString(formData, "location").trim();
    const style = getAvatarStyleOption(getSwaprFormString(formData, "style"));
    const wardrobeStyle = getAvatarWardrobeStyle(
      getSwaprFormString(formData, "wardrobeStyle"),
    );
    const generationSpeedTier = getGenerationSpeedTier(
      getSwaprFormString(formData, "generationSpeedTier"),
    );

    if (!avatarId) {
      throw new Error("Choose an avatar before creating photos.");
    }

    if (!avatarName) {
      throw new Error("Avatar name is required.");
    }

    if (!avatarDescription) {
      throw new Error("Add an avatar description before creating photos.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const rateLimitSecret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeAvatarPhotoGenerate, {
      count,
      secret: rateLimitSecret,
    });

    const sourceImageId = createId();
    const imageBytes = await image.arrayBuffer();
    const imageType = image.type || "image/jpeg";
    const sourceImageObject = await putR2Object({
      body: imageBytes,
      contentType: imageType,
      key: createR2ObjectKey({
        contentType: imageType,
        kind: "provider-input-image",
        recordId: sourceImageId,
        userId,
      }),
    });
    const createdAt = new Date().toISOString();
    const job = await convex.mutation(api.providerJobs.create, {
      secret: rateLimitSecret,
      ownerId: userId,
      id: `provider:avatar-photo:${sourceImageId}`,
      jobType: "avatar-photo-generation",
      stage: "awaiting-provider",
      idempotencyKey: `${userId}:avatar-photo-generation:${sourceImageId}`,
      inputSnapshotJson: JSON.stringify({
        avatarDescription,
        avatarId,
        avatarName,
        context,
        count,
        generationSpeedTier,
        identityMode,
        lighting,
        location,
        sourceImageName: image.name || "avatar-reference.jpg",
        sourceImageObject,
        style,
        wardrobeStyle,
      }),
      createdAt,
    });

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "avatar_photos_generation_requested",
      properties: {
        count,
        style,
        lighting,
        identity_mode: identityMode,
        generation_speed_tier: generationSpeedTier,
        model_id: getAvatarPhotoGenerationModelId(),
      },
      request,
    });

    return NextResponse.json({
      generationSpeedTier,
      job,
      modelId: getAvatarPhotoGenerationModelId(),
      queuedCount: count,
    });
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
            : "Unable to generate avatar photos.",
      },
      { status: 500 },
    );
  }
}
