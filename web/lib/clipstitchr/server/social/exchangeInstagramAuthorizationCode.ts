import type { SocialOAuthAccountProfile } from "./SocialOAuthAccountProfile";
import { getInstagramGraphApiVersion } from "../../social/getInstagramGraphApiVersion";
import { normalizeInstagramPermissions } from "./normalizeInstagramPermissions";

type InstagramShortTokenResponse = {
  access_token?: string;
  data_access_expiration_time?: number;
  permissions?: string | string[];
  user_id?: number | string;
};

type InstagramLongTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
};

export async function exchangeInstagramAuthorizationCode({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<SocialOAuthAccountProfile> {
  const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Instagram connection is not configured.");
  }

  const tokenRequest = new FormData();
  tokenRequest.set("client_id", clientId);
  tokenRequest.set("client_secret", clientSecret);
  tokenRequest.set("code", code);
  tokenRequest.set("grant_type", "authorization_code");
  tokenRequest.set("redirect_uri", redirectUri);

  const shortResponse = await fetch(
    "https://api.instagram.com/oauth/access_token",
    {
      method: "POST",
      body: tokenRequest,
    },
  );
  const shortToken =
    (await shortResponse.json()) as InstagramShortTokenResponse;

  if (!shortResponse.ok || !shortToken.access_token || !shortToken.user_id) {
    throw new Error("Instagram did not complete the connection.");
  }

  const exchangeUrl = new URL("https://graph.instagram.com/access_token");
  exchangeUrl.searchParams.set("grant_type", "ig_exchange_token");
  exchangeUrl.searchParams.set("client_secret", clientSecret);
  exchangeUrl.searchParams.set("access_token", shortToken.access_token);

  const longResponse = await fetch(exchangeUrl);
  const longToken = (await longResponse.json()) as InstagramLongTokenResponse;

  if (!longResponse.ok || !longToken.access_token) {
    throw new Error("Instagram could not finish securing this connection.");
  }

  const profileUrl = new URL(
    `https://graph.instagram.com/${getInstagramGraphApiVersion()}/me`,
  );
  profileUrl.searchParams.set(
    "fields",
    "id,username,name,profile_picture_url,account_type",
  );
  profileUrl.searchParams.set("access_token", longToken.access_token);

  const profileResponse = await fetch(profileUrl);
  const profile = (await profileResponse.json()) as {
    account_type?: string;
    id?: string;
    name?: string;
    profile_picture_url?: string;
    username?: string;
  };

  if (!profileResponse.ok || !profile.id || !profile.username) {
    throw new Error(
      "Instagram connected, but the professional account details were missing.",
    );
  }

  if (
    profile.account_type !== "BUSINESS" &&
    profile.account_type !== "MEDIA_CREATOR"
  ) {
    throw new Error(
      "Instagram publishing needs a professional account. Switch to a Business or Creator account, then connect again.",
    );
  }

  return {
    accessToken: longToken.access_token,
    accessTokenExpiresAt: longToken.expires_in
      ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
      : undefined,
    accountType: profile.account_type,
    avatarUrl: profile.profile_picture_url,
    displayName: profile.name,
    externalAccountId: profile.id,
    platform: "instagram",
    scopes: normalizeInstagramPermissions(shortToken.permissions),
    username: profile.username,
  };
}
