import { readTikTokCreatorInfoResponse } from "@/lib/clipstitchr/publishing/client/readers/readTikTokCreatorInfoResponse";

export async function getTikTokCreatorInfo(
  integrationId: string,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({ integrationId });
  const response = await fetch(
    `/api/studio/publishing/integrations/tiktok/creator-info?${query}`,
    {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal,
    },
  );
  return readTikTokCreatorInfoResponse(response);
}
