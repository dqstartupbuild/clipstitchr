import { getLatestPostBridgeAnalyticsSyncedAtMs } from "@/lib/clipstitchr/server/postBridge/getLatestPostBridgeAnalyticsSyncedAtMs";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { syncPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/syncPostBridgeAnalytics";

const postBridgeAnalyticsSyncProbeSize = 100;
const defaultMaxPolls = 4;
const defaultPollIntervalMs = 2000;

type WaitForPostBridgeAnalyticsSyncOptions = {
  maxPolls?: number;
  pollIntervalMs?: number;
};

export async function waitForPostBridgeAnalyticsSync(
  apiKey: string,
  postResultIds: string[] = [],
  {
    maxPolls = defaultMaxPolls,
    pollIntervalMs = defaultPollIntervalMs,
  }: WaitForPostBridgeAnalyticsSyncOptions = {},
) {
  const probePostResultIds = postResultIds.slice(
    0,
    postBridgeAnalyticsSyncProbeSize,
  );
  const baselineSyncedAtMs = getLatestPostBridgeAnalyticsSyncedAtMs(
    await listPostBridgeAnalytics(apiKey, probePostResultIds),
  );

  await syncPostBridgeAnalytics(apiKey);

  for (let poll = 0; poll < maxPolls; poll += 1) {
    if (pollIntervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    const probeSyncedAtMs = getLatestPostBridgeAnalyticsSyncedAtMs(
      await listPostBridgeAnalytics(apiKey, probePostResultIds),
    );

    if (
      probeSyncedAtMs !== null &&
      (baselineSyncedAtMs === null || probeSyncedAtMs > baselineSyncedAtMs)
    ) {
      return probeSyncedAtMs;
    }
  }

  return baselineSyncedAtMs;
}
