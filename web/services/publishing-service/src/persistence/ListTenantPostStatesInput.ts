import type { ClipPublishingInternalState } from "@prisma/client";

import type { PublishingListPageInput } from "./PublishingListPageInput.js";

export type ListTenantPostStatesInput = PublishingListPageInput &
  Readonly<{
    integrationId?: string;
    internalState?: ClipPublishingInternalState;
  }>;
