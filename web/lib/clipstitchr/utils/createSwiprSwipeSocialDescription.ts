import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export function createSwiprSwipeSocialDescription(
  swipe: Pick<SwiprSwipe, "caption" | "hashtags">,
) {
  return [
    swipe.caption?.trim(),
    swipe.hashtags
      ?.map((hashtag) => hashtag.trim())
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}
