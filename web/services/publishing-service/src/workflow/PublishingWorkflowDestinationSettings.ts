import type { PublishingWorkflowInstagramSettings } from "./PublishingWorkflowInstagramSettings.js";
import type { PublishingWorkflowTikTokSettings } from "./PublishingWorkflowTikTokSettings.js";

export type PublishingWorkflowDestinationSettings =
  | PublishingWorkflowInstagramSettings
  | PublishingWorkflowTikTokSettings;
