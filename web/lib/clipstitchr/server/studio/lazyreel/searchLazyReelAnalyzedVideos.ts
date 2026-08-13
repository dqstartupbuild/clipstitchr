import type { LazyReelCorpusSnapshot } from "./LazyReelCorpusSnapshot";
import { normalizeLazyReelText } from "./normalizeLazyReelText";

export function searchLazyReelAnalyzedVideos(
  videos: LazyReelCorpusSnapshot["analyzedVideos"],
  query: string,
) {
  const terms = normalizeLazyReelText(query).split(" ").filter(Boolean);
  if (!terms.length) {
    return [];
  }

  return videos
    .map((video) => {
      const searchable = normalizeLazyReelText(
        [
          video.niche,
          video.productType,
          video.format,
          video.framework,
          video.hookPattern,
          video.hook,
          video.whyItWorked,
          ...video.tags,
        ].join(" "),
      );
      return {
        score: terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0),
        video,
      };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.video.id.localeCompare(right.video.id),
    )
    .map(({ video }) => video);
}
