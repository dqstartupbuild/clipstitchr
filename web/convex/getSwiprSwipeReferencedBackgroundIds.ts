import type { Doc } from "./_generated/dataModel";

export function getSwiprSwipeReferencedBackgroundIds(
  swipes: Pick<Doc<"swipes">, "backgroundId" | "slides">[],
) {
  return [
    ...new Set(
      swipes.flatMap((swipe) => [
        swipe.backgroundId,
        ...swipe.slides.map((slide) => slide.backgroundId ?? swipe.backgroundId),
      ]),
    ),
  ].filter((backgroundId) => backgroundId.length > 0);
}
