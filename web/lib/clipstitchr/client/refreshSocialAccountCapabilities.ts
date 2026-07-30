import { getJsonResponse } from "@/lib/clipstitchr/client/getJsonResponse";

export async function refreshSocialAccountCapabilities(accountId: string) {
  const response = await fetch(
    `/api/social/accounts/${encodeURIComponent(accountId)}/capabilities`,
    {
      method: "POST",
    },
  );

  return await getJsonResponse<{ queued: boolean }>(response);
}
