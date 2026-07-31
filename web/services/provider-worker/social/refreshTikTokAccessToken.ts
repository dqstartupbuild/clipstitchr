import { readSocialApiResponse } from "./readSocialApiResponse";

type TikTokRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  refresh_token: string;
};

export async function refreshTikTokAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY?.trim() || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET?.trim() || "",
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  if (!body.get("client_key") || !body.get("client_secret")) {
    throw new Error("TikTok OAuth is not configured.");
  }

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return await readSocialApiResponse<TikTokRefreshResponse>(
    response,
    "TikTok could not refresh this account.",
  );
}
