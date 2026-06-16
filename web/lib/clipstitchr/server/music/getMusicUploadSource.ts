import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";

const MUSIC_TRACK_SOURCES = new Set<MusicTrackSource>([
  "clipr",
  "library",
  "stitchr",
  "swipr",
]);

export function getMusicUploadSource(
  value: FormDataEntryValue | null,
): MusicTrackSource {
  const source = typeof value === "string" ? value.trim() : "";

  return MUSIC_TRACK_SOURCES.has(source as MusicTrackSource)
    ? (source as MusicTrackSource)
    : "library";
}
