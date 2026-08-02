import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";

export async function syncPostBridgeAnalytics(apiKey: string) {
  await requestPostBridge<void>("/v1/analytics/sync", {
    apiKey,
    method: "POST",
  });
}
