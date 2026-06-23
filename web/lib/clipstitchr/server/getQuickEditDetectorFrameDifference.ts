export function getQuickEditDetectorFrameDifference(
  first: Uint8Array,
  second: Uint8Array,
) {
  const length = Math.min(first.length, second.length);

  if (!length) {
    return 0;
  }

  let total = 0;

  for (let index = 0; index < length; index += 1) {
    total += Math.abs(first[index] - second[index]);
  }

  return total / length;
}
