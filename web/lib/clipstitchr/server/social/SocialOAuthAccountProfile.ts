import type { SocialPlatform } from "../../social/types/SocialPlatform";

export type SocialOAuthAccountProfile = {
  accessToken: string;
  accessTokenExpiresAt?: string;
  accountType?: string;
  avatarUrl?: string;
  displayName?: string;
  externalAccountId: string;
  platform: SocialPlatform;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  scopes: string[];
  username: string;
};
