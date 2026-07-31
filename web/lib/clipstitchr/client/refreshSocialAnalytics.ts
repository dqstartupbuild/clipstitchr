import { getJsonResponse } from "./getJsonResponse";

export async function refreshSocialAnalytics(input: {
  productId?: string;
  socialAccountId?: string;
  rangeStart: string;
  rangeEnd: string;
  includeTikTokSaves: boolean;
}) {
  const response = await fetch("/api/social/analytics/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return await getJsonResponse<{
    id: string;
    publicationCount: number;
    dispatchStatus: string;
  }>(response);
}
