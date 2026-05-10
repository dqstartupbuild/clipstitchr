export function getSwiprSlideFileName(index: number) {
  return `swipr-slide-${String(index + 1).padStart(2, "0")}.png`;
}
