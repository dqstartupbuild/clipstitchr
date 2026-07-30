import type { SocialPlatform } from "@/lib/clipstitchr/social/types/SocialPlatform";
import { getJsonResponse } from "./getJsonResponse";

export async function startSocialOAuthConnection(
  platform: SocialPlatform,
  returnPath = "/dashboard/settings",
) {
  const response = await fetch(`/api/social/oauth/${platform}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnPath }),
  });
  const result = await getJsonResponse<{ authorizationUrl: string }>(response);

  window.location.assign(result.authorizationUrl);
}
