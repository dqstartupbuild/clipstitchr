import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import { normalizeAssetTag } from "@/lib/clipstitchr/utils/normalizeAssetTag";

type GetGeneratedMusicTrackTagsOptions = {
  includeStyleTags?: boolean;
  source: MusicTrackSource;
  style?: string;
};

export function getGeneratedMusicTrackTags({
  includeStyleTags = true,
  source,
  style,
}: GetGeneratedMusicTrackTagsOptions) {
  const styleTags = includeStyleTags
    ? (style ?? "")
        .split(/[\s,;/]+/)
        .map((tag) => normalizeAssetTag(tag))
        .filter(Boolean)
        .slice(0, 6)
    : [];

  return Array.from(
    new Set(["music", "ai", source, ...styleTags].filter(Boolean)),
  );
}
