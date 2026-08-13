import type { ClipPublishingAttemptStatus } from "@prisma/client";

import type { PublishingListPageInput } from "./PublishingListPageInput.js";

export type ListTenantAttemptsInput = PublishingListPageInput &
  Readonly<{
    postStateId?: string;
    status?: ClipPublishingAttemptStatus;
  }>;
