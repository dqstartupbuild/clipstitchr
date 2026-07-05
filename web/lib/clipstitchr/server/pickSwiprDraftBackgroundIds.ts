export function pickSwiprDraftBackgroundIds({
  availableBackgroundIds,
  preferredFirstBackgroundId,
  random = Math.random,
  slideCount,
}: {
  availableBackgroundIds: string[];
  preferredFirstBackgroundId?: string;
  random?: () => number;
  slideCount: number;
}) {
  const uniqueBackgroundIds = Array.from(new Set(availableBackgroundIds)).filter(
    Boolean,
  );

  if (slideCount <= 0 || !uniqueBackgroundIds.length) {
    return [];
  }

  const backgroundIds: string[] = [];
  const preferredBackgroundId = uniqueBackgroundIds.includes(
    preferredFirstBackgroundId ?? "",
  )
    ? preferredFirstBackgroundId
    : undefined;
  let nextCycleSource = preferredBackgroundId
    ? uniqueBackgroundIds.filter((backgroundId) => {
        return backgroundId !== preferredBackgroundId;
      })
    : uniqueBackgroundIds;

  if (preferredBackgroundId) {
    backgroundIds.push(preferredBackgroundId);
  }

  while (backgroundIds.length < slideCount) {
    const cycleBackgroundIds = [
      ...(nextCycleSource.length ? nextCycleSource : uniqueBackgroundIds),
    ];

    for (let index = cycleBackgroundIds.length - 1; index > 0; index -= 1) {
      const randomValue = Math.max(0, Math.min(0.999999999999, random()));
      const swapIndex = Math.floor(randomValue * (index + 1));
      const currentBackgroundId = cycleBackgroundIds[index];

      cycleBackgroundIds[index] = cycleBackgroundIds[swapIndex] as string;
      cycleBackgroundIds[swapIndex] = currentBackgroundId as string;
    }

    const previousBackgroundId = backgroundIds.at(-1);

    if (
      previousBackgroundId &&
      cycleBackgroundIds.length > 1 &&
      cycleBackgroundIds[0] === previousBackgroundId
    ) {
      const replacementIndex = cycleBackgroundIds.findIndex((backgroundId) => {
        return backgroundId !== previousBackgroundId;
      });
      const replacementBackgroundId = cycleBackgroundIds[replacementIndex];

      cycleBackgroundIds[replacementIndex] = cycleBackgroundIds[0] as string;
      cycleBackgroundIds[0] = replacementBackgroundId as string;
    }

    for (const backgroundId of cycleBackgroundIds) {
      if (backgroundIds.length >= slideCount) {
        break;
      }

      backgroundIds.push(backgroundId);
    }

    nextCycleSource = uniqueBackgroundIds;
  }

  return backgroundIds;
}
