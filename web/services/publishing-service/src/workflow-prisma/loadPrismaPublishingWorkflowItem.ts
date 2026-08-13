import type { LeasedPublishingOutboxRecord } from "../persistence/LeasedPublishingOutboxRecord.js";
import type { PublishingWorkflowWorkItem } from "../workflow/PublishingWorkflowWorkItem.js";
import type { PrismaPublishingWorkflowContext } from "./PrismaPublishingWorkflowContext.js";
import { createPublishingWorkflowWorkItemFromDispatch } from "./createPublishingWorkflowWorkItemFromDispatch.js";

export const loadPrismaPublishingWorkflowItem = async (
  context: PrismaPublishingWorkflowContext,
  record: LeasedPublishingOutboxRecord,
): Promise<PublishingWorkflowWorkItem> => {
  const now = context.now();
  const destination = await context.persistence.loadDestination({
    outboxId: record.id,
    leaseOwner: record.leaseOwner,
    now,
  });

  return createPublishingWorkflowWorkItemFromDispatch(record, destination);
};
