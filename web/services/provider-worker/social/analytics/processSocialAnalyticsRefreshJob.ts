import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { SocialProviderJob } from "../SocialProviderJob";
import { getValidSocialAccessToken } from "../getValidSocialAccessToken";
import { markSocialProviderJobCompleted } from "../markSocialProviderJobCompleted";
import { createApifySavesAnalyticsSnapshot } from "./apify/createApifySavesAnalyticsSnapshot";
import { enrichTikTokSaves } from "./apify/enrichTikTokSaves";
import { getSocialAnalyticsApifyMaxTotalChargeUsd } from "./apify/getSocialAnalyticsApifyMaxTotalChargeUsd";
import type { SocialAnalyticsRefreshDocument } from "./SocialAnalyticsRefreshDocument";
import type { SocialAnalyticsSnapshot } from "./SocialAnalyticsSnapshot";
import { createUnavailableSocialAnalyticsSnapshot } from "./createUnavailableSocialAnalyticsSnapshot";
import { loadInstagramAnalyticsSnapshot } from "./instagram/loadInstagramAnalyticsSnapshot";
import { parseSocialAnalyticsRefreshJobInput } from "./parseSocialAnalyticsRefreshJobInput";
import { recordSocialAnalyticsPublicationResult } from "./recordSocialAnalyticsPublicationResult";
import { createTikTokOfficialAnalyticsSnapshot } from "./tiktok/createTikTokOfficialAnalyticsSnapshot";
import { queryTikTokVideoAnalytics } from "./tiktok/queryTikTokVideoAnalytics";

export async function processSocialAnalyticsRefreshJob({
  client,
  job,
  providerWorkerSecret,
}: {
  client: ConvexHttpClient;
  job: SocialProviderJob;
  providerWorkerSecret: string;
}) {
  const { refreshRunId } = parseSocialAnalyticsRefreshJobInput(
    job.inputSnapshotJson,
  );
  const document = (await client.query(
    api.socialAnalytics.getSocialAnalyticsRefreshJobForProvider
      .getSocialAnalyticsRefreshJobForProvider,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      refreshRunId,
      now: new Date().toISOString(),
    },
  )) as SocialAnalyticsRefreshDocument;

  if (
    document.run.status === "completed" ||
    document.run.status === "partially_completed" ||
    document.run.status === "failed" ||
    document.run.status === "canceled"
  ) {
    await markSocialProviderJobCompleted({
      client,
      job,
      providerWorkerSecret,
      stage: "analytics-already-finished",
    });
    return;
  }

  const apifyMaximumTotalChargeUsd = document.run.includeTikTokSaves
    ? getSocialAnalyticsApifyMaxTotalChargeUsd()
    : undefined;

  await client.mutation(
    api.socialAnalytics.markSocialAnalyticsRefreshRunRunning
      .markSocialAnalyticsRefreshRunRunning,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: refreshRunId,
      apifyMaximumTotalChargeUsd,
      now: new Date().toISOString(),
    },
  );

  const tiktokDocuments = document.documents.filter(
    (candidate) => candidate.publication.platform === "tiktok",
  );
  const instagramDocuments = document.documents.filter(
    (candidate) => candidate.publication.platform === "instagram",
  );
  const tiktokOfficialSnapshots = new Map<string, SocialAnalyticsSnapshot>();
  const tiktokFailures = new Map<string, string>();
  const tiktokAccounts = new Map<
    string,
    (typeof tiktokDocuments)[number]["account"]
  >();

  for (const candidate of tiktokDocuments) {
    tiktokAccounts.set(candidate.publication.socialAccountId, candidate.account);
  }

  for (const [accountId, account] of tiktokAccounts) {
    const accountDocuments = tiktokDocuments.filter(
      (candidate) => candidate.publication.socialAccountId === accountId,
    );

    if (!account || account.status !== "connected") {
      for (const candidate of accountDocuments) {
        tiktokFailures.set(
          candidate.publication.id,
          "Reconnect TikTok before refreshing this post.",
        );
      }
      continue;
    }

    try {
      const accessToken = await getValidSocialAccessToken({
        account,
        client,
        providerWorkerSecret,
      });

      for (let offset = 0; offset < accountDocuments.length; offset += 20) {
        const batch = accountDocuments.slice(offset, offset + 20);

        try {
          const analytics = await queryTikTokVideoAnalytics(
            accessToken,
            batch.map(
              (candidate) => candidate.publication.externalPublicationId,
            ),
          );
          const analyticsById = new Map(
            analytics.map((entry) => [entry.id, entry]),
          );

          for (const candidate of batch) {
            const result = analyticsById.get(
              candidate.publication.externalPublicationId,
            );

            if (result) {
              tiktokOfficialSnapshots.set(
                candidate.publication.id,
                createTikTokOfficialAnalyticsSnapshot(result),
              );
            } else {
              tiktokFailures.set(
                candidate.publication.id,
                "TikTok did not return analytics for this public post.",
              );
            }
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "TikTok analytics could not be refreshed.";

          for (const candidate of batch) {
            tiktokFailures.set(candidate.publication.id, message);
          }
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "TikTok needs to be reconnected.";

      for (const candidate of accountDocuments) {
        tiktokFailures.set(candidate.publication.id, message);
      }
    }
  }

  let apifyRunCount = 0;
  let apifyErrorMessage: string | undefined;
  const apifySnapshots = new Map<string, SocialAnalyticsSnapshot>();

  if (
    document.run.includeTikTokSaves &&
    tiktokOfficialSnapshots.size > 0
  ) {
    const enrichable = tiktokDocuments
      .filter((candidate) =>
        tiktokOfficialSnapshots.has(candidate.publication.id),
      )
      .map((candidate) => ({
        externalPublicationId: candidate.publication.externalPublicationId,
        permalink: candidate.publication.permalink,
        username: candidate.account?.username ?? "",
      }));

    try {
      const enrichment = await enrichTikTokSaves(enrichable);
      apifyRunCount = enrichment.runCount;

      for (const candidate of tiktokDocuments) {
        const saves = enrichment.savesByExternalId.get(
          candidate.publication.externalPublicationId,
        );

        if (saves !== undefined) {
          apifySnapshots.set(
            candidate.publication.id,
            createApifySavesAnalyticsSnapshot(saves),
          );
        }
      }

      if (enrichment.skippedCount > 0) {
        apifyErrorMessage = `${enrichment.skippedCount} TikTok post saves were skipped by the enrichment safety limit.`;
      }
    } catch {
      apifyErrorMessage =
        "Official analytics were refreshed, but TikTok saves are unavailable.";
    }
  }

  for (const candidate of tiktokDocuments) {
    const official = tiktokOfficialSnapshots.get(candidate.publication.id);
    const failureReason =
      tiktokFailures.get(candidate.publication.id) ??
      "TikTok analytics are unavailable for this post.";

    await recordSocialAnalyticsPublicationResult({
      client,
      ownerId: job.ownerId,
      providerWorkerSecret,
      publicationId: candidate.publication.id,
      refreshRunId,
      snapshots: official
        ? [
            official,
            ...(apifySnapshots.has(candidate.publication.id)
              ? [apifySnapshots.get(candidate.publication.id)!]
              : []),
          ]
        : [
            createUnavailableSocialAnalyticsSnapshot(
              "tiktok_official",
              failureReason,
            ),
          ],
      succeeded: Boolean(official),
    });
  }

  const instagramTokenCache = new Map<string, string>();

  for (const candidate of instagramDocuments) {
    let snapshot: SocialAnalyticsSnapshot;
    let succeeded = false;

    try {
      if (!candidate.account || candidate.account.status !== "connected") {
        throw new Error("Reconnect Instagram before refreshing this post.");
      }

      let accessToken = instagramTokenCache.get(candidate.account.id);

      if (!accessToken) {
        accessToken = await getValidSocialAccessToken({
          account: candidate.account,
          client,
          providerWorkerSecret,
        });
        instagramTokenCache.set(candidate.account.id, accessToken);
      }

      snapshot = await loadInstagramAnalyticsSnapshot(
        candidate.publication.externalPublicationId,
        accessToken,
      );
      succeeded = true;
    } catch (error) {
      snapshot = createUnavailableSocialAnalyticsSnapshot(
        "instagram_official",
        error instanceof Error
          ? error.message
          : "Instagram analytics could not be refreshed.",
      );
    }

    await recordSocialAnalyticsPublicationResult({
      client,
      ownerId: job.ownerId,
      providerWorkerSecret,
      publicationId: candidate.publication.id,
      refreshRunId,
      snapshots: [snapshot],
      succeeded,
    });
  }

  await client.mutation(
    api.socialAnalytics.completeSocialAnalyticsRefreshRun
      .completeSocialAnalyticsRefreshRun,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: refreshRunId,
      apifyRunCount,
      errorMessage: apifyErrorMessage,
      now: new Date().toISOString(),
    },
  );
  await markSocialProviderJobCompleted({
    client,
    job,
    providerWorkerSecret,
    stage: "analytics-refreshed",
  });
}
