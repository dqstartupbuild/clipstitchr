import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { CanonicalJsonValue } from "./CanonicalJsonValue.js";
import type { PublishingDestinationIntent } from "./PublishingDestinationIntent.js";

export type CreatePublishingDestinationInput = Readonly<{
  tenantKey: PublishingTenantKey;
  integrationId: string;
  mediaSourceId: string;
  idempotencyKey: string;
  actorClerkUserId: string;
  requestId: string;
  content: string;
  destinationSettings: CanonicalJsonValue;
  intent: PublishingDestinationIntent;
  group: string;
  title?: string;
}>;
