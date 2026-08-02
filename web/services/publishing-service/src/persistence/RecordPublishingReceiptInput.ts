import type { Prisma } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ProviderTokenProvider } from "../tokens/ProviderTokenProvider.js";
import type { PublishingReceiptResult } from "./PublishingReceiptResult.js";
import type { PublishingRemotePublication } from "./PublishingRemotePublication.js";

export type RecordPublishingReceiptInput = Readonly<{
  tenantKey: PublishingTenantKey;
  postStateId: string;
  attemptId: string;
  provider: ProviderTokenProvider;
  result: PublishingReceiptResult;
  responseDigest: string;
  safeMetadata: Prisma.InputJsonValue;
  remotePublications: readonly PublishingRemotePublication[];
  observedAt: Date;
}>;
