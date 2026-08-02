import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingWorkflowDestinationSettings } from "./PublishingWorkflowDestinationSettings.js";
import type { PublishingWorkflowMediaObject } from "./PublishingWorkflowMediaObject.js";

export type PublishingWorkflowWorkItem = Readonly<{
  tenantKey: PublishingTenantKey;
  postStateId: string;
  attemptId: string;
  attemptKey: string;
  checkpointVersion: number;
  checkpoint: unknown;
  providerCallAllowed: boolean;
  alreadyPublished: boolean;
  terminal: boolean;
  provider: PublishingProvider;
  integrationId: string;
  accountId: string;
  grantedScopes: readonly string[];
  caption: string;
  settings: PublishingWorkflowDestinationSettings;
  media: readonly PublishingWorkflowMediaObject[];
  createdAtEpochMilliseconds: number;
}>;
