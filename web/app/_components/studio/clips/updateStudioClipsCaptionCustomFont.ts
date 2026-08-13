import type { ChangeEvent } from "react";
import type { StudioClipsStyleDraft } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsStyleDraft";

export function updateStudioClipsCaptionCustomFont(
  event: ChangeEvent<HTMLInputElement>,
  style: StudioClipsStyleDraft,
  onChange: (style: StudioClipsStyleDraft) => void,
) {
  onChange({ ...style, customFont: event.target.files?.[0] ?? null });
}
