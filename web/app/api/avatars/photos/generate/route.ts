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
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { sanitizeAvatarSceneControl } from "@/lib/clipstitchr/utils/sanitizeAvatarSceneControl";
import { getPlanGenerationProfile } from "@/lib/clipstitchr/billing/getPlanGenerationProfile";

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
    const avatarDescription = getSwaprFormString(
      formData,
      "avatarDescription",
    ).trim();
    const count = getAvatarPhotoGenerationCount(
      getSwaprFormString(formData, "count"),
    );
    const context = sanitizeAvatarSceneControl(
      getSwaprFormString(formData, "context"),
    );
    const identityMode = getAvatarIdentityMode(
      getSwaprFormString(formData, "identityMode"),
    );
    const productId = getSwaprFormString(formData, "productId").trim();
    const lighting = getAvatarLightingOption(
      getSwaprFormString(formData, "lighting"),
    );
    const location = sanitizeAvatarSceneControl(
      getSwaprFormString(formData, "location"),
    );
    const outfit = sanitizeAvatarSceneControl(
      getSwaprFormString(formData, "outfit"),
    );
    const style = getAvatarStyleOption(getSwaprFormString(formData, "style"));
    const wardrobeStyle = getAvatarWardrobeStyle(
      getSwaprFormString(formData, "wardrobeStyle"),
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

    if (productId) {
      const product = await convex.query(api.products.get, { id: productId });

      if (!product) {
        throw new Error("Product not found.");
      }
    }

    await convex.mutation(api.rateLimits.consumeAvatarPhotoGenerate, {
      count,
      secret: rateLimitSecret,
    });

    const sourceImageId = createId();
    const createdAt = new Date().toISOString();
    const providerJobId = `provider:avatar-photo:${sourceImageId}`;
    const reservations = await convex.mutation(
      api.usage.reserveCreationCreditBatch.reserveCreationCreditBatch,
      {
        batchId: sourceImageId,
        count,
        domainIdPrefix: providerJobId,
        domainKind: "provider_job_output",
        idempotencyPrefix: `avatar-photo:${userId}:${sourceImageId}`,
        now: createdAt,
        operation: "avatar_photo",
      },
    );

    if (reservations.length === 0) {
      throw new Error(
        "You need 25 creation credits for each avatar photo. Add credits or wait for your next plan renewal.",
      );
    }

    const usageReservationIds = reservations.flatMap((reservation) =>
      reservation.reservationId ? [reservation.reservationId] : [],
    );
    const generationProfile = getPlanGenerationProfile(reservations[0].planKey);
    const imageBytes = await image.arrayBuffer();
    const imageType = image.type || "image/jpeg";
    let sourceImageObject;

    try {
      sourceImageObject = await putR2Object({
        body: imageBytes,
        contentType: imageType,
        key: createR2ObjectKey({
          contentType: imageType,
          kind: "provider-input-image",
          recordId: sourceImageId,
          userId,
        }),
      });
    } catch (error) {
      await Promise.all(
        usageReservationIds.map((reservationId) =>
          convex.mutation(
            api.usage.cancelUsageReservation.cancelUsageReservation,
            {
              now: new Date().toISOString(),
              reason: "Avatar source image could not be stored",
              reservationId,
            },
          ),
        ),
      );
      throw error;
    }
    let job;

    try {
      job = await convex.mutation(api.providerJobs.create, {
        secret: rateLimitSecret,
        ownerId: userId,
        id: providerJobId,
        jobType: "avatar-photo-generation",
        stage: "awaiting-provider",
        idempotencyKey: `${userId}:avatar-photo-generation:${sourceImageId}`,
        inputSnapshotJson: JSON.stringify({
          avatarDescription,
          avatarId,
          avatarImageQuality: generationProfile.avatarImageQuality,
          avatarName,
          context,
          count: reservations.length,
          identityMode,
          lighting,
          location,
          outfit,
          productId: productId || undefined,
          sourceImageName: image.name || "avatar-reference.jpg",
          sourceImageObject,
          style,
          usageReservationIds,
          wardrobeStyle,
        }),
        usageReservationIds,
        createdAt,
      });
    } catch (error) {
      await deleteR2Object(sourceImageObject.key).catch(() => null);
      await Promise.all(
        usageReservationIds.map((reservationId) =>
          convex.mutation(
            api.usage.cancelUsageReservation.cancelUsageReservation,
            {
              now: new Date().toISOString(),
              reason: "Avatar photo job could not be queued",
              reservationId,
            },
          ),
        ),
      );
      throw error;
    }

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "avatar_photos_generation_requested",
      properties: {
        count,
        style,
        lighting,
        identity_mode: identityMode,
        generation_speed_label: generationProfile.publicSpeedLabel,
        model_id: getAvatarPhotoGenerationModelId(),
      },
      request,
    });

    return NextResponse.json({
      job,
      modelId: getAvatarPhotoGenerationModelId(),
      queuedCount: reservations.length,
      speedLabel: generationProfile.publicSpeedLabel,
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
