import { randomUUID } from "node:crypto";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { SocialProviderJob } from "./SocialProviderJob";
import type { SocialPublishDocument } from "./SocialPublishDocument";
import { SocialApiError } from "./SocialApiError";
import { SocialNeedsAttentionError } from "./SocialNeedsAttentionError";
import { SocialOutcomeUnknownError } from "./SocialOutcomeUnknownError";
import { createSocialMediaFetchUrl } from "./createSocialMediaFetchUrl";
import { assertSocialPublishBillingForWorker } from "./assertSocialPublishBillingForWorker";
import { getSocialAttemptNeedsMedia } from "./getSocialAttemptNeedsMedia";
import { getValidSocialAccessToken } from "./getValidSocialAccessToken";
import { markSocialProviderJobCompleted } from "./markSocialProviderJobCompleted";
import { parseSocialPublishJobInput } from "./parseSocialPublishJobInput";
import { selectSocialPublishAttempt } from "./selectSocialPublishAttempt";
import { processInstagramPublish } from "./instagram/processInstagramPublish";
import { processTikTokPublish } from "./tiktok/processTikTokPublish";
import { redactSocialDiagnosticString } from "@/lib/clipstitchr/server/social/redactSocialDiagnosticString";

export async function processSocialPublishJob({
  client,
  job,
  providerWorkerSecret,
}: {
  client: ConvexHttpClient;
  job: SocialProviderJob;
  providerWorkerSecret: string;
}) {
  const input = parseSocialPublishJobInput(job.inputSnapshotJson);
  const document = (await client.query(
    api.socialPublishing.getSocialPublishJobForProvider
      .getSocialPublishJobForProvider,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      postId: input.postId,
      targetId: input.targetId,
    },
  )) as SocialPublishDocument;

  if (
    !["queued", "publishing", "status_check"].includes(document.target.status)
  ) {
    await markSocialProviderJobCompleted({
      client,
      job,
      providerWorkerSecret,
      stage: `target-${document.target.status}`,
    });
    return;
  }

  let attempt = selectSocialPublishAttempt(document.attempts, job.jobType);
  const reconciliationAttemptWasMissing =
    job.jobType === "social-status-reconcile" && !attempt;

  if (!attempt) {
    const attemptId = `social-attempt:${randomUUID()}`;
    attempt = (await client.mutation(
      api.socialPublishing.startSocialPublishAttempt.startSocialPublishAttempt,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        postId: input.postId,
        targetId: input.targetId,
        id: attemptId,
        idempotencyKey: `${job.id}:delivery`,
        now: new Date().toISOString(),
      },
    )) as SocialPublishDocument["attempts"][number];
    document.attempts.push(attempt);
  }

  try {
    if (reconciliationAttemptWasMissing) {
      throw new SocialOutcomeUnknownError(
        "ClipStitchr has no saved provider reference for this delivery, so it will not send the post again.",
      );
    }

    if (job.jobType === "social-publish") {
      await assertSocialPublishBillingForWorker({
        client,
        ownerId: job.ownerId,
        providerWorkerSecret,
      });
    }

    if (
      job.jobType === "social-status-reconcile" ||
      attempt.providerPublishId ||
      attempt.providerContainerId
    ) {
      await client.mutation(api.rateLimits.consumeSocialProviderStatusCheck, {
        secret: providerWorkerSecret,
        socialAccountId: document.account.id,
      });
    } else {
      await client.mutation(api.rateLimits.consumeSocialProviderPublish, {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        socialAccountId: document.account.id,
        platform: document.target.platform,
      });
    }

    const mediaUrls = getSocialAttemptNeedsMedia({
      jobType: job.jobType,
      providerContainerId: attempt.providerContainerId,
      providerPublishId: attempt.providerPublishId,
    })
      ? await Promise.all(
          document.assets.map((asset) =>
            createSocialMediaFetchUrl({
              client,
              objectKey: asset.objectKey,
              ownerId: job.ownerId,
              providerWorkerSecret,
              targetId: document.target.id,
            }),
          ),
        )
      : [];
    const accessToken = await getValidSocialAccessToken({
      account: document.account,
      client,
      providerWorkerSecret,
    });
    const result =
      document.target.platform === "tiktok"
        ? await processTikTokPublish({
            accessToken,
            attemptId: attempt.id,
            client,
            document,
            mediaUrls,
            providerWorkerSecret,
          })
        : await processInstagramPublish({
            accessToken,
            attemptId: attempt.id,
            client,
            document,
            mediaUrls,
            providerWorkerSecret,
          });

    if (result.state === "status_check") {
      await client.mutation(
        api.socialPublishing.markSocialPublishStatusCheck
          .markSocialPublishStatusCheck,
        {
          secret: providerWorkerSecret,
          ownerId: job.ownerId,
          postId: input.postId,
          targetId: input.targetId,
          attemptId: attempt.id,
          providerPublishId: result.providerPublishId,
          nextStatusCheckAt: result.nextStatusCheckAt,
          now: new Date().toISOString(),
        },
      );
      await markSocialProviderJobCompleted({
        client,
        job,
        providerWorkerSecret,
        stage: "awaiting-status-check",
      });
      return;
    }

    await client.mutation(
      api.socialPublishing.completeSocialPublishTarget
        .completeSocialPublishTarget,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        postId: input.postId,
        targetId: input.targetId,
        attemptId: attempt.id,
        platform: document.target.platform,
        publicationIds: result.publicationIds,
        awaitingUser: result.awaitingUser,
        permalink: result.permalink,
        providerResponseJson: result.providerResponseJson
          ? redactSocialDiagnosticString(result.providerResponseJson)
          : undefined,
        now: new Date().toISOString(),
      },
    );
    await markSocialProviderJobCompleted({
      client,
      job,
      providerWorkerSecret,
      stage: "published",
    });
  } catch (error) {
    const outcomeUnknown = error instanceof SocialOutcomeUnknownError;
    const needsAttention =
      error instanceof SocialNeedsAttentionError ||
      (error instanceof SocialApiError &&
        (error.responseStatus === 401 || error.responseStatus === 403));
    const isDefinitiveProviderFailure =
      error instanceof SocialApiError &&
      error.responseStatus >= 400 &&
      error.responseStatus < 500 &&
      error.responseStatus !== 429;

    if (!outcomeUnknown && !needsAttention && !isDefinitiveProviderFailure) {
      throw error;
    }

    const message = redactSocialDiagnosticString(
      error instanceof Error ? error.message : "Social publishing failed.",
    );

    if (needsAttention) {
      await client
        .mutation(
          api.socialAccounts.markSocialAccountNeedsAttentionFromProvider
            .markSocialAccountNeedsAttentionFromProvider,
          {
            secret: providerWorkerSecret,
            ownerId: job.ownerId,
            id: document.account.id,
            errorMessage: message,
            now: new Date().toISOString(),
          },
        )
        .catch(() => undefined);
    }

    await client.mutation(
      api.socialPublishing.failSocialPublishTarget.failSocialPublishTarget,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        postId: input.postId,
        targetId: input.targetId,
        attemptId: attempt.id,
        errorCode:
          error instanceof SocialApiError
            ? `provider_http_${error.responseStatus}`
            : undefined,
        errorMessage: message,
        needsAttention,
        outcomeUnknown,
        now: new Date().toISOString(),
      },
    );
    await markSocialProviderJobCompleted({
      client,
      job,
      providerWorkerSecret,
      stage: outcomeUnknown
        ? "outcome-unknown"
        : needsAttention
          ? "needs-attention"
          : "delivery-failed",
    });
  }
}
