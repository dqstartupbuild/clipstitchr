import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { redactSocialDiagnosticString } from "@/lib/clipstitchr/server/social/redactSocialDiagnosticString";
import type { SocialPublishDocument } from "../SocialPublishDocument";
import type { SocialPublishResult } from "../SocialPublishResult";
import { SocialApiError } from "../SocialApiError";
import { assertSocialAttemptCanInitializeProvider } from "../assertSocialAttemptCanInitializeProvider";
import { assertSocialPublishBillingForWorker } from "../assertSocialPublishBillingForWorker";
import { assertTikTokCapabilitiesMatch } from "./assertTikTokCapabilitiesMatch";
import { initializeTikTokPublish } from "./initializeTikTokPublish";
import { queryTikTokCreatorInfo } from "./queryTikTokCreatorInfo";
import { readTikTokTargetControls } from "./readTikTokTargetControls";
import { waitForTikTokPublishStatus } from "./waitForTikTokPublishStatus";

export async function processTikTokPublish({
  accessToken,
  attemptId,
  client,
  document,
  mediaUrls,
  providerWorkerSecret,
}: {
  accessToken: string;
  attemptId: string;
  client: ConvexHttpClient;
  document: SocialPublishDocument;
  mediaUrls: string[];
  providerWorkerSecret: string;
}): Promise<SocialPublishResult> {
  const controls = readTikTokTargetControls(document.target.controlsJson);
  const isPhotoPost = document.assets[0]?.kind === "image";
  const now = new Date().toISOString();
  const currentAttempt = document.attempts.find(
    (attempt) => attempt.id === attemptId,
  );
  let publishId = currentAttempt?.providerPublishId;

  if (!publishId) {
    const creatorInfo = await queryTikTokCreatorInfo(accessToken);

    await client.mutation(
      api.socialAccounts.saveSocialCapabilitySnapshot
        .saveSocialCapabilitySnapshot,
      {
        secret: providerWorkerSecret,
        ownerId: document.account.ownerId,
        id: document.account.id,
        capabilitySnapshotJson: JSON.stringify(creatorInfo),
        displayName: creatorInfo.creator_nickname,
        avatarUrl: creatorInfo.creator_avatar_url,
        now,
      },
    );
    assertTikTokCapabilitiesMatch({
      controls,
      creatorInfo,
      durationSeconds: document.assets[0]?.durationSeconds,
      isPhotoPost,
      publishMode: document.target.publishMode,
    });
    assertSocialAttemptCanInitializeProvider(currentAttempt);
    await assertSocialPublishBillingForWorker({
      client,
      ownerId: document.account.ownerId,
      providerWorkerSecret,
    });
    await client.mutation(
      api.socialPublishing.markSocialPublishAttemptIrreversible
        .markSocialPublishAttemptIrreversible,
      {
        secret: providerWorkerSecret,
        ownerId: document.account.ownerId,
        id: attemptId,
        stage: "provider_initialization_requested",
        now: new Date().toISOString(),
      },
    );
    const initialized = await initializeTikTokPublish({
      accessToken,
      caption: document.post.caption,
      controls,
      mediaUrls,
      publishMode: document.target.publishMode,
      title: document.post.title,
      isPhotoPost,
    });
    publishId = initialized.data.publish_id;

    await client.mutation(
      api.socialPublishing.updateSocialPublishAttemptStage
        .updateSocialPublishAttemptStage,
      {
        secret: providerWorkerSecret,
        ownerId: document.account.ownerId,
        id: attemptId,
        stage: "provider_accepted",
        providerPublishId: publishId,
        providerResponseJson: redactSocialDiagnosticString(
          JSON.stringify(initialized),
        ),
        now: new Date().toISOString(),
      },
    );
  }

  const status = await waitForTikTokPublishStatus(accessToken, publishId);

  if (!status) {
    return {
      state: "status_check",
      providerPublishId: publishId,
      nextStatusCheckAt: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  if (status.status === "FAILED") {
    throw new SocialApiError(
      status.fail_reason || "TikTok could not publish this post.",
      400,
      JSON.stringify(status),
    );
  }

  if (
    status.status !== "PUBLISH_COMPLETE" &&
    status.status !== "SEND_TO_USER_INBOX"
  ) {
    return {
      state: "status_check",
      providerPublishId: publishId,
      nextStatusCheckAt: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  const publicationIds =
    status.publicly_available_post_id ??
    status.publicaly_available_post_id ??
    [];

  return {
    state: "published",
    publicationIds,
    awaitingUser:
      status.status === "SEND_TO_USER_INBOX" && publicationIds.length === 0,
    providerResponseJson: JSON.stringify(status),
  };
}
