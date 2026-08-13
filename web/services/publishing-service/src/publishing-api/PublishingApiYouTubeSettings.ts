import type { PublishingApiMediaManifest } from "./PublishingApiMediaManifest.js";
import type { PublishingApiYouTubeVisibility } from "./PublishingApiYouTubeVisibility.js";

export type PublishingApiYouTubeSettings = Readonly<{
  title: string;
  description?: string;
  visibility: PublishingApiYouTubeVisibility;
  madeForKids: boolean;
  tags?: readonly string[];
  thumbnail?: PublishingApiMediaManifest;
}>;
