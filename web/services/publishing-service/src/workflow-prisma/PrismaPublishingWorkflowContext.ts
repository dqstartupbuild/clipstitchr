import type { PublishingIntegrationRuntime } from "../integrations/PublishingIntegrationRuntime.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import type { ProviderTokenKeyring } from "../tokens/ProviderTokenKeyring.js";
import type { PublishingWorkflowPort } from "../workflow/PublishingWorkflowPort.js";
import type { PrismaPublishingWorkflowPersistence } from "./PrismaPublishingWorkflowPersistence.js";

export type PrismaPublishingWorkflowContext = Readonly<{
  keyring: ProviderTokenKeyring;
  cipherKey: ProviderTokenCipherKey;
  providerRuntimes: ReadonlyMap<
    PublishingProvider,
    PublishingIntegrationRuntime
  >;
  resolveMediaGrants: PublishingWorkflowPort["resolveMediaGrants"];
  now: () => Date;
  persistence: PrismaPublishingWorkflowPersistence;
}>;
