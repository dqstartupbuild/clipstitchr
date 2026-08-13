import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export type ProviderConnection = Readonly<{
  provider: PublishingProvider;
  accountId: string;
  accountName: string;
  username: string | undefined;
  pictureUrl: string | undefined;
  accessToken: string;
  refreshToken: string | undefined;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number | undefined;
  scopes: readonly string[];
}>;
