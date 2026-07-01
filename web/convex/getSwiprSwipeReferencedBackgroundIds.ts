type SwiprSwipeReferenceSource = {
  backgroundId: string;
  slides: Array<{ backgroundId?: string }>;
};

export function getSwiprSwipeReferencedBackgroundIds(
  swipes: SwiprSwipeReferenceSource[],
) {
  return [
    ...new Set(
      swipes.flatMap((swipe) => [
        swipe.backgroundId,
        ...swipe.slides.map(
          (slide) => slide.backgroundId ?? swipe.backgroundId,
        ),
      ]),
    ),
  ].filter((backgroundId) => backgroundId.length > 0);
}
