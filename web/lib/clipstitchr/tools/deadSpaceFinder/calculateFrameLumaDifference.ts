export function calculateFrameLumaDifference(
  previous: Uint8ClampedArray,
  current: Uint8ClampedArray,
) {
  if (previous.length !== current.length || current.length < 4) {
    return 1;
  }

  let difference = 0;
  const pixelCount = current.length / 4;

  for (let index = 0; index < current.length; index += 4) {
    const previousLuma =
      previous[index] * 0.2126 +
      previous[index + 1] * 0.7152 +
      previous[index + 2] * 0.0722;
    const currentLuma =
      current[index] * 0.2126 +
      current[index + 1] * 0.7152 +
      current[index + 2] * 0.0722;
    difference += Math.abs(currentLuma - previousLuma) / 255;
  }

  return difference / pixelCount;
}
