import type { SocialOAuthAccountProfile } from "./SocialOAuthAccountProfile";

type TikTokTokenResponse = {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeTikTokAuthorizationCode({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<SocialOAuthAccountProfile> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();

  if (!clientKey || !clientSecret) {
    throw new Error("TikTok connection is not configured.");
  }

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const token = (await response.json()) as TikTokTokenResponse;

  if (
    !response.ok ||
    !token.access_token ||
    !token.open_id ||
    !token.refresh_token ||
    !token.expires_in
  ) {
    throw new Error(
      token.error_description || "TikTok did not complete the connection.",
    );
  }

  const profileUrl = new URL("https://open.tiktokapis.com/v2/user/info/");
  profileUrl.searchParams.set(
    "fields",
    "open_id,avatar_url,display_name",
  );
  const profileResponse = await fetch(profileUrl, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });
  const profileResult = (await profileResponse.json()) as {
    data?: {
      user?: {
        avatar_url?: string;
        display_name?: string;
        open_id?: string;
      };
    };
  };
  const user = profileResult.data?.user;

  if (!profileResponse.ok || !user) {
    throw new Error("TikTok connected, but the account details were missing.");
  }

  const now = Date.now();

  return {
    accessToken: token.access_token,
    accessTokenExpiresAt: new Date(
      now + token.expires_in * 1000,
    ).toISOString(),
    avatarUrl: user.avatar_url,
    displayName: user.display_name,
    externalAccountId: token.open_id,
    platform: "tiktok",
    refreshToken: token.refresh_token,
    refreshTokenExpiresAt: token.refresh_expires_in
      ? new Date(now + token.refresh_expires_in * 1000).toISOString()
      : undefined,
    scopes: (token.scope || "")
      .split(",")
      .map((scope) => scope.trim())
      .filter(Boolean),
    username:
      user.display_name?.trim() ||
      `TikTok ${token.open_id.slice(-6)}`,
  };
}
