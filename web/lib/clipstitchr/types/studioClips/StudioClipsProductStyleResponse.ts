import type { StudioClipsCaptionStyle } from "./StudioClipsCaptionStyle";
import type { StudioClipsRenderRevisionSummary } from "./StudioClipsRenderRevisionSummary";

export type StudioClipsProductStyleResponse = {
  created: boolean;
  productId: string;
  revision: number;
  renderRevision?: StudioClipsRenderRevisionSummary;
  style: StudioClipsCaptionStyle;
  updatedAt: string;
};
