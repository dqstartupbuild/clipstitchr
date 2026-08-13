import type { LazyReelExample } from "@/lib/clipstitchr/types/lazyreel/LazyReelExample";
import { matchesLazyReelTextFilter } from "./matchesLazyReelTextFilter";
import { normalizeLazyReelText } from "./normalizeLazyReelText";
import { sortLazyReelExamples } from "./sortLazyReelExamples";

export function filterLazyReelExamples(
  examples: LazyReelExample[],
  filters: { hookPattern?: string; niche?: string; query?: string; videoFormat?: string },
) {
  const queryTerms = normalizeLazyReelText(filters.query ?? "").split(" ").filter(Boolean);

  return sortLazyReelExamples(examples).filter((example) => {
    if (filters.niche && !matchesLazyReelTextFilter(example.niche, filters.niche)) {
      return false;
    }
    if (
      filters.videoFormat &&
      !matchesLazyReelTextFilter(example.videoFormat, filters.videoFormat)
    ) {
      return false;
    }
    if (
      filters.hookPattern &&
      !matchesLazyReelTextFilter(example.hookPattern, filters.hookPattern)
    ) {
      return false;
    }
    if (queryTerms.length) {
      const searchable = normalizeLazyReelText(
        [example.niche, example.videoFormat, example.hookPattern, example.framework, example.emotion]
          .filter(Boolean)
          .join(" "),
      );
      return queryTerms.some((term) => searchable.includes(term));
    }
    return true;
  });
}
