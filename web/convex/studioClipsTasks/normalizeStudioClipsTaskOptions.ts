import type { StudioClipsTaskOptions } from "../../lib/clipstitchr/types/studioClips/StudioClipsTaskOptions";
import { normalizeStudioClipsCaptionStyle } from "./normalizeStudioClipsCaptionStyle";

export function normalizeStudioClipsTaskOptions(
  value: StudioClipsTaskOptions,
  ownerId: string,
  productId: string,
): StudioClipsTaskOptions {
  if (value.outputFormat !== "source" && value.outputFormat !== "vertical") {
    throw new Error("Choose original framing or vertical 9:16 output.");
  }
  return {
    addSubtitles: value.addSubtitles,
    includeBroll: value.includeBroll,
    outputFormat: value.outputFormat,
    ...(value.captionStyle
      ? {
          captionStyle: normalizeStudioClipsCaptionStyle(
            value.captionStyle,
            ownerId,
            productId,
          ),
        }
      : {}),
  };
}
