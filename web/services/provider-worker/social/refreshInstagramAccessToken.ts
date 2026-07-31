import { readSocialApiResponse } from "./readSocialApiResponse";

type InstagramRefreshResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export async function refreshInstagramAccessToken(accessToken: string) {
  const url = new URL(
    "https://graph.instagram.com/refresh_access_token",
  );
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);

  return await readSocialApiResponse<InstagramRefreshResponse>(
    response,
    "Instagram could not refresh this account.",
  );
}
