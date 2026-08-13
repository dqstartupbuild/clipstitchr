import type { StudioClipsCaptionStyle } from "./StudioClipsCaptionStyle";
import type { StudioClipsCoreOptions } from "./StudioClipsCoreOptions";

export type StudioClipsTaskOptions = StudioClipsCoreOptions & {
  captionStyle?: StudioClipsCaptionStyle;
};
