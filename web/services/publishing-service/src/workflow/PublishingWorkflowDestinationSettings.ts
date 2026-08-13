import type { PublishingWorkflowInstagramSettings } from "./PublishingWorkflowInstagramSettings.js";
import type { PublishingWorkflowTikTokSettings } from "./PublishingWorkflowTikTokSettings.js";
import type { PublishingWorkflowYouTubeSettings } from "./PublishingWorkflowYouTubeSettings.js";

export type PublishingWorkflowDestinationSettings =
  | PublishingWorkflowInstagramSettings
  | PublishingWorkflowTikTokSettings
  | PublishingWorkflowYouTubeSettings;
