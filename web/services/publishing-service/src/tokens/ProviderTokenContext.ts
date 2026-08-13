import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenKind } from "./ProviderTokenKind.js";
import type { ProviderTokenProvider } from "./ProviderTokenProvider.js";

export type ProviderTokenContext = Readonly<{
  tenantKey: PublishingTenantKey;
  provider: ProviderTokenProvider;
  integrationId: string;
  tokenKind: ProviderTokenKind;
}>;
