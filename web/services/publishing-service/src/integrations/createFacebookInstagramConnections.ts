import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { InstagramAccountSelection } from "../provider-runtime/instagram/InstagramAccountSelection.js";

export const createFacebookInstagramConnections = (
  userConnection: ProviderConnection,
  accounts: readonly InstagramAccountSelection[],
): readonly ProviderConnection[] => {
  if (
    userConnection.provider !== "instagram" ||
    accounts.length < 1 ||
    accounts.length > 100
  ) {
    throw new ProviderRuntimeError("instagram", "auth_required");
  }

  const identifiers = new Set<string>();
  const connections = accounts.map((account) => {
    if (identifiers.has(account.accountId)) {
      throw new ProviderRuntimeError("instagram", "invalid_response");
    }
    identifiers.add(account.accountId);

    return Object.freeze({
      provider: "instagram" as const,
      accountId: account.accountId,
      accountName: account.accountName,
      username: account.username,
      pictureUrl: account.pictureUrl,
      accessToken: account.pageAccessToken,
      refreshToken: undefined,
      expiresInSeconds: userConnection.expiresInSeconds,
      refreshExpiresInSeconds: undefined,
      scopes: Object.freeze([...userConnection.scopes]),
    });
  });

  return Object.freeze(connections);
};
