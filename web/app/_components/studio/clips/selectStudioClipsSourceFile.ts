import type { ChangeEvent } from "react";
import type { StudioClipsSourceDraft } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsSourceDraft";

export function selectStudioClipsSourceFile(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (source: StudioClipsSourceDraft) => void,
) {
  onChange({ file: event.target.files?.[0] ?? null, kind: "upload" });
}
