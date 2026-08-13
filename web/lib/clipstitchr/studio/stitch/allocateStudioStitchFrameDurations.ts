import { STUDIO_STITCH_CANVAS } from "./studioStitchCanvas";

export function allocateStudioStitchFrameDurations(
  totalSeconds: number,
  weights: readonly number[],
): number[] {
  if (
    !Number.isFinite(totalSeconds) ||
    totalSeconds <= 0 ||
    weights.length === 0 ||
    weights.some((weight) => !Number.isFinite(weight) || weight <= 0)
  ) {
    throw new Error("Frame allocation requires a positive duration and weights.");
  }
  const totalFrames = Math.round(
    totalSeconds * STUDIO_STITCH_CANVAS.framesPerSecond,
  );
  if (totalFrames < weights.length) {
    throw new Error("Frame allocation must provide at least one frame per item.");
  }
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const exactFrames = weights.map((weight) => (totalFrames * weight) / weightTotal);
  const frames = exactFrames.map((value) => Math.max(1, Math.floor(value)));
  let difference = totalFrames - frames.reduce((sum, value) => sum + value, 0);
  const rankedIndexes = exactFrames
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort(
      (left, right) =>
        right.remainder - left.remainder || left.index - right.index,
    );
  let cursor = 0;
  while (difference > 0) {
    frames[rankedIndexes[cursor % rankedIndexes.length].index] += 1;
    cursor += 1;
    difference -= 1;
  }
  while (difference < 0) {
    const index = rankedIndexes
      .slice()
      .reverse()
      .find((entry) => frames[entry.index] > 1)?.index;
    if (index === undefined) {
      throw new Error("Frame allocation could not preserve positive durations.");
    }
    frames[index] -= 1;
    difference += 1;
  }
  return frames.map(
    (frameCount) => frameCount / STUDIO_STITCH_CANVAS.framesPerSecond,
  );
}
