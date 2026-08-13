import type { PublishingWorkflowMediaObject } from "./PublishingWorkflowMediaObject.js";

export type PublishingWorkflowYouTubeSettings = Readonly<{
  provider: "youtube";
  title: string;
  description?: string;
  visibility: "private" | "public" | "unlisted";
  madeForKids: boolean;
  tags: readonly string[];
  thumbnail?: PublishingWorkflowMediaObject;
}>;
