import type { FormEvent } from "react";
import type { StudioClipsCaptionStyle } from "@/lib/clipstitchr/types/studioClips/StudioClipsCaptionStyle";

export async function saveStudioClipsProductStyle(
  event: FormEvent<HTMLFormElement>,
  style: StudioClipsCaptionStyle,
  saveStyle: (style: StudioClipsCaptionStyle) => Promise<unknown>,
  onUpdated: () => void,
) {
  event.preventDefault();
  if (await saveStyle(style)) {
    onUpdated();
  }
}
