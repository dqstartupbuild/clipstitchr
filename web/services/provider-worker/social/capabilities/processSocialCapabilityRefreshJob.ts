import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { SocialProviderJob } from "../SocialProviderJob";
import { getValidSocialAccessToken } from "../getValidSocialAccessToken";
import { markSocialProviderJobCompleted } from "../markSocialProviderJobCompleted";
import { queryTikTokCreatorInfo } from "../tiktok/queryTikTokCreatorInfo";
import { parseSocialCapabilityRefreshJobInput } from "./parseSocialCapabilityRefreshJobInput";

export async function processSocialCapabilityRefreshJob({
  client,
  job,
  providerWorkerSecret,
}: {
  client: ConvexHttpClient;
  job: SocialProviderJob;
  providerWorkerSecret: string;
}) {
  const { accountId } = parseSocialCapabilityRefreshJobInput(
    job.inputSnapshotJson,
  );
  const account = await client.query(
    api.socialAccounts.getSocialAccountForProvider.getSocialAccountForProvider,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: accountId,
    },
  );

  if (
    !account ||
    account.platform !== "tiktok" ||
    !["connected", "needs_attention"].includes(account.status)
  ) {
    throw new Error(
      "TikTok must be reconnected before loading posting choices.",
    );
  }

  const accessToken = await getValidSocialAccessToken({
    account,
    client,
    providerWorkerSecret,
  });
  const creatorInfo = await queryTikTokCreatorInfo(accessToken);

  await client.mutation(
    api.socialAccounts.saveSocialCapabilitySnapshot
      .saveSocialCapabilitySnapshot,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: account.id,
      capabilitySnapshotJson: JSON.stringify(creatorInfo),
      displayName: creatorInfo.creator_nickname,
      avatarUrl: creatorInfo.creator_avatar_url,
      now: new Date().toISOString(),
    },
  );
  await markSocialProviderJobCompleted({
    client,
    job,
    providerWorkerSecret,
    stage: "capabilities-refreshed",
  });
}
