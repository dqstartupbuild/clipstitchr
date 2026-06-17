export function pickSwiprDraftBackgroundIds({
  availableBackgroundIds,
  offset,
  slideCount,
}: {
  availableBackgroundIds: string[];
  offset: number;
  slideCount: number;
}) {
  return Array.from({ length: slideCount }, (_, index) => {
    const nextIndex = (offset + index) % availableBackgroundIds.length;

    return availableBackgroundIds[nextIndex];
  });
}
