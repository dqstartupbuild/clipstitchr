import type { StudioClipsCaptionStyle } from "./StudioClipsCaptionStyle";

export type StudioClipsCoreOptions = {
  addSubtitles: boolean;
  captionStyle?: StudioClipsCaptionStyle;
  includeBroll: boolean;
  outputFormat: "source" | "vertical";
};
