import type { PublishingWorkflowPort } from "./PublishingWorkflowPort.js";
import type { PublishingWorkflowWorkItem } from "./PublishingWorkflowWorkItem.js";

export type PublishingProviderWorkflowContext = Readonly<{
  item: PublishingWorkflowWorkItem;
  port: PublishingWorkflowPort;
  now: () => Date;
}>;
