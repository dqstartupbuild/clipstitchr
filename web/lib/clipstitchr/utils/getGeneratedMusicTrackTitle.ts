import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";

type GetGeneratedMusicTrackTitleOptions = {
  source: MusicTrackSource;
  style?: string;
};

export function getGeneratedMusicTrackTitle({
  source,
  style,
}: GetGeneratedMusicTrackTitleOptions) {
  const cleanStyle = style?.replace(/\s+/g, " ").trim();

  if (cleanStyle) {
    return cleanStyle.slice(0, 80);
  }

  switch (source) {
    case "clipr":
      return "Clipr background music";
    case "stitchr":
      return "Stitchr background music";
    case "longr":
      return "Longr background music";
    case "swipr":
      return "Swipr background music";
    default:
      return "Background music";
  }
}
