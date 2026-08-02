import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { PublishingIntegrationRecord } from "./PublishingIntegrationRecord.js";

export const assertRefreshedConnectionMatches = (
  integration: PublishingIntegrationRecord,
  connection: ProviderConnection,
): void => {
  if (
    connection.provider !== integration.providerIdentifier ||
    connection.provider !== integration.type ||
    connection.accountId !== integration.internalId
  ) {
    throw new ProviderRuntimeError(connection.provider, "invalid_response");
  }
};
