import type { Prisma } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingMediaObject } from "./PublishingMediaObject.js";
import type { PublishingSourceKind } from "./PublishingSourceKind.js";

export type CreatePublishingMediaSourceInput = Readonly<{
  tenantKey: PublishingTenantKey;
  sourceKind: PublishingSourceKind;
  sourceRecordId: string;
  sourceRevision: string;
  contentChecksum: string;
  displayName: string;
  originalName?: string;
  mediaType: string;
  objects: readonly PublishingMediaObject[];
  compatibilityFacts: Prisma.InputJsonValue;
}>;
