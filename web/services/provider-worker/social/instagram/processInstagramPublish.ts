import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { redactSocialDiagnosticString } from "@/lib/clipstitchr/server/social/redactSocialDiagnosticString";
import type { SocialPublishDocument } from "../SocialPublishDocument";
import type { SocialPublishResult } from "../SocialPublishResult";
import { SocialApiError } from "../SocialApiError";
import { assertSocialAttemptCanInitializeProvider } from "../assertSocialAttemptCanInitializeProvider";
import { assertSocialPublishBillingForWorker } from "../assertSocialPublishBillingForWorker";
import { createInstagramMediaContainer } from "./createInstagramMediaContainer";
import { fetchInstagramPermalink } from "./fetchInstagramPermalink";
import { publishInstagramContainer } from "./publishInstagramContainer";
import { readInstagramTargetControls } from "./readInstagramTargetControls";
import { waitForInstagramContainer } from "./waitForInstagramContainer";

export async function processInstagramPublish({
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
  const currentAttempt = document.attempts.find(
    (attempt) => attempt.id === attemptId,
  );
  const controls = readInstagramTargetControls(document.target.controlsJson);

  if (currentAttempt?.providerPublishId) {
    const permalink = await fetchInstagramPermalink(
      currentAttempt.providerPublishId,
      accessToken,
    ).catch(() => undefined);

    return {
      state: "published",
      publicationIds: [currentAttempt.providerPublishId],
      permalink,
    };
  }

  let containerId = currentAttempt?.providerContainerId;

  if (!containerId) {
    await assertSocialPublishBillingForWorker({
      client,
      ownerId: document.account.ownerId,
      providerWorkerSecret,
    });
    const container = await createInstagramMediaContainer({
      accessToken,
      accountId: document.account.externalAccountId,
      caption: document.post.caption,
      isVideo: document.assets[0]?.kind === "video",
      mediaUrls,
      shareToFeed: controls.shareToFeed,
    });
    containerId = container.id;

    await client.mutation(
      api.socialPublishing.updateSocialPublishAttemptStage
        .updateSocialPublishAttemptStage,
      {
        secret: providerWorkerSecret,
        ownerId: document.account.ownerId,
        id: attemptId,
        stage: "container_created",
        providerContainerId: containerId,
        providerResponseJson: redactSocialDiagnosticString(
          JSON.stringify(container),
        ),
        now: new Date().toISOString(),
      },
    );
  }

  const status = await waitForInstagramContainer(containerId, accessToken);

  if (!status || status.status_code === "IN_PROGRESS") {
    return {
      state: "status_check",
      nextStatusCheckAt: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  if (status.status_code !== "FINISHED") {
    throw new SocialApiError(
      status.status || "Instagram could not prepare this post.",
      400,
      JSON.stringify(status),
    );
  }

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
      stage: "final_publish_requested",
      now: new Date().toISOString(),
    },
  );

  const published = await publishInstagramContainer(
    document.account.externalAccountId,
    containerId,
    accessToken,
  );
  await client.mutation(
    api.socialPublishing.updateSocialPublishAttemptStage
      .updateSocialPublishAttemptStage,
    {
      secret: providerWorkerSecret,
      ownerId: document.account.ownerId,
      id: attemptId,
      stage: "provider_published",
      providerPublishId: published.id,
      providerResponseJson: redactSocialDiagnosticString(
        JSON.stringify(published),
      ),
      now: new Date().toISOString(),
    },
  );

  const permalink = await fetchInstagramPermalink(
    published.id,
    accessToken,
  ).catch(() => undefined);

  return {
    state: "published",
    publicationIds: [published.id],
    permalink,
    providerResponseJson: JSON.stringify({ published, status }),
  };
}
