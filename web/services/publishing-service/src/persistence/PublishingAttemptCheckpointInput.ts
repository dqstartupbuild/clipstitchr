import type { Prisma } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingProviderOperationKind } from "./PublishingProviderOperationKind.js";

export type PublishingAttemptCheckpointInput = Readonly<{
  tenantKey: PublishingTenantKey;
  attemptId: string;
  expectedVersion: number;
  checkpoint: Prisma.InputJsonValue;
  providerOperationKind: PublishingProviderOperationKind;
  providerOperationId: string;
  checkpointedAt: Date;
}>;
