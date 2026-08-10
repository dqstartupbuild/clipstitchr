import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertSocialPublishingPlatformMediaKind } from "@/lib/clipstitchr/server/socialPublishing/assertSocialPublishingPlatformMediaKind";
import { assertSocialPublishingSourceMediaKind } from "@/lib/clipstitchr/server/socialPublishing/assertSocialPublishingSourceMediaKind";
import { createSocialPublishingPost } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingPost";
import { createSocialPublishingPostReference } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingPostReference";
import { getSocialPublishingAccountPlatforms } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAccountPlatforms";
import { getSocialPublishingUploadedMediaSizeBytes } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingUploadedMediaSizeBytes";
import { groupSocialPublishingMedia } from "@/lib/clipstitchr/server/socialPublishing/groupSocialPublishingMedia";
import { getSocialPublishingSourceProductId } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingSourceProductId";
import { getSelectedSocialPublishingAccounts } from "@/lib/clipstitchr/server/socialPublishing/getSelectedSocialPublishingAccounts";
import { listSocialPublishingSocialAccounts } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingSocialAccounts";
import { readSocialPublishingScheduleRequest } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingScheduleRequest";
import { removeSocialPublishingTitleLineFromCaption } from "@/lib/clipstitchr/server/socialPublishing/removeSocialPublishingTitleLineFromCaption";
import { resolveSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/resolveSocialPublishingApiKey";
import { resolveSocialPublishingMediaKindForUploadedMedia } from "@/lib/clipstitchr/server/socialPublishing/resolveSocialPublishingMediaKindForUploadedMedia";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

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

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const input = await readSocialPublishingScheduleRequest(request);
    const source =
      input.sourceType === "stitch"
        ? await convex.query(api.stitches.get, { id: input.sourceId })
        : await convex.query(api.swipes.get, { id: input.sourceId });

    if (!source) {
      throw new Error("That saved post was not found.");
    }

    const mediaKind = resolveSocialPublishingMediaKindForUploadedMedia(input.mediaFiles);
    assertSocialPublishingSourceMediaKind(input.sourceType, mediaKind);
    const mediaSizeBytes = getSocialPublishingUploadedMediaSizeBytes(input.mediaFiles);

    await convex.mutation(api.rateLimits.consumeSocialPublishingSchedule, {
      secret: getRateLimitApiSecret(),
    });

    const sourceProductId = getSocialPublishingSourceProductId(
      input.sourceType,
      source,
    );
    const product = sourceProductId
      ? await convex.query(api.products.get, { id: sourceProductId })
      : null;
    const linkedAccountIds = product?.socialPublishingSocialAccountIds ?? [];
    const accountIds = input.socialAccountIds.length
      ? input.socialAccountIds
      : linkedAccountIds;
    const apiKey = await resolveSocialPublishingApiKey(convex);
    const selectedAccounts = getSelectedSocialPublishingAccounts(
      await listSocialPublishingSocialAccounts(apiKey),
      accountIds,
    );
    const platforms = getSocialPublishingAccountPlatforms(selectedAccounts);
    assertSocialPublishingPlatformMediaKind(mediaKind, platforms);
    const { customMediaIdsByPlatform, mediaIds } = groupSocialPublishingMedia(
      input.mediaFiles,
    );

    const post = await createSocialPublishingPost({
      accounts: selectedAccounts,
      apiKey,
      caption: input.caption,
      customMediaIdsByPlatform,
      mediaIds,
      mediaKind,
      scheduledAt: input.scheduledAt,
      tiktokCaption:
        input.sourceType === "swipe"
          ? removeSocialPublishingTitleLineFromCaption({
              caption: input.caption,
              title: input.title,
            })
          : undefined,
      tiktokCommercialContentType: input.tiktokCommercialContentType,
      tiktokConsentGiven: input.tiktokConsentGiven,
      tiktokPrivacyLevel: input.tiktokPrivacyLevel,
      title: input.title,
      useQueue: input.useQueue,
    });
    const postReference = createSocialPublishingPostReference({
      hasAudio: input.hasAudio,
      mediaIds,
      mediaKind,
      platforms,
      post,
      scheduledAt: input.scheduledAt,
      socialAccountIds: selectedAccounts.map((account) => account.id),
      sourceType: input.sourceType,
    });

    if (input.sourceType === "stitch") {
      await convex.mutation(api.stitches.addSocialPublishingPost, {
        id: input.sourceId,
        post: postReference,
      });
    } else {
      await convex.mutation(api.swipes.addSocialPublishingPost, {
        id: input.sourceId,
        post: postReference,
      });
    }

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "social_publishing_post_scheduled",
      properties: {
        has_audio: input.hasAudio,
        media_kind: mediaKind,
        media_size_bytes: mediaSizeBytes,
        platform_count: platforms.length,
        social_publishing_provider: "zernio",
        social_publishing_post_id: post.id,
        source_id: input.sourceId,
        source_type: input.sourceType,
        use_queue: input.useQueue,
      },
      request,
    });

    return Response.json({
      post,
      postReference,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to schedule this post.",
      },
      { status: 400 },
    );
  }
}
