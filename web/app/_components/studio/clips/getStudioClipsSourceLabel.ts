import type { StudioClipsTaskSource } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskSource";

export function getStudioClipsSourceLabel(source: StudioClipsTaskSource) {
  if (source.kind === "youtube") {
    try {
      return `YouTube · ${new URL(source.url).searchParams.get("v") ?? "video"}`;
    } catch {
      return "YouTube video";
    }
  }

  return `Uploaded video · ${source.contentType.replace("video/", "").toUpperCase()}`;
}
