import type { Doc } from "./_generated/dataModel";

export function getSwipeCardSearchText(swipe: Doc<"swipes">) {
  return [
    swipe.name,
    swipe.productName,
    swipe.productContext,
    swipe.caption,
    swipe.description,
    swipe.hashtags?.join(" "),
    swipe.rationale,
    swipe.socialCaption,
    ...(swipe.slides ?? []).map((slide) => slide.textOverlay.text),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
