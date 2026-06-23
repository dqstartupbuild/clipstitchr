export function getQuickEditDetectorFrameStats(pixels: Uint8Array) {
  const mean =
    pixels.reduce((total, value) => total + value, 0) / Math.max(1, pixels.length);
  const variance =
    pixels.reduce((total, value) => total + (value - mean) ** 2, 0) /
    Math.max(1, pixels.length);

  return {
    mean,
    standardDeviation: Math.sqrt(variance),
  };
}
