import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingIntegrationRefreshCredentials } from "./PublishingIntegrationRefreshCredentials.js";
import type { PublishingIntegrationRuntime } from "./PublishingIntegrationRuntime.js";
import { assertRefreshedConnectionMatches } from "./assertRefreshedConnectionMatches.js";

export const refreshPublishingProviderConnection = async (
  runtimes: ReadonlyMap<PublishingProvider, PublishingIntegrationRuntime>,
  credentials: PublishingIntegrationRefreshCredentials,
): Promise<ProviderConnection> => {
  const provider = credentials.integration.providerIdentifier;

  if (provider === "instagram") {
    throw new ProviderRuntimeError("instagram", "auth_required");
  }

  let connection: ProviderConnection;

  if (provider === "instagram-standalone") {
    const runtime = runtimes.get("instagram-standalone");
    if (runtime?.id !== "instagram-standalone") {
      throw new ProviderRuntimeError(provider, "invalid_configuration");
    }
    if (credentials.accessToken === null) {
      throw new ProviderRuntimeError(provider, "auth_required");
    }
    connection = await runtime.refreshConnection(credentials.accessToken);
  } else if (provider === "tiktok") {
    const runtime = runtimes.get("tiktok");
    if (runtime?.id !== "tiktok") {
      throw new ProviderRuntimeError(provider, "invalid_configuration");
    }
    if (credentials.refreshToken === null) {
      throw new ProviderRuntimeError(provider, "auth_required");
    }
    connection = await runtime.refreshConnection(credentials.refreshToken);
  } else if (provider === "youtube") {
    const runtime = runtimes.get("youtube");
    if (runtime?.id !== "youtube") {
      throw new ProviderRuntimeError(provider, "invalid_configuration");
    }
    if (credentials.refreshToken === null) {
      throw new ProviderRuntimeError(provider, "auth_required");
    }
    connection = await runtime.refreshConnection(
      credentials.refreshToken,
      credentials.integration.internalId,
    );
  } else {
    throw new ProviderRuntimeError("instagram", "auth_required");
  }

  assertRefreshedConnectionMatches(credentials.integration, connection);
  return connection;
};
