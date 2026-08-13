import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";

export type PublishingProviderRefreshCallback = (
  plaintextCredential: string,
) => Promise<ProviderConnection>;
