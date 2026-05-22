export function createMediaBunnyProgressMapper(
  onProgress: ((progress: number) => void) | undefined,
  start: number,
  span: number,
) {
  return (progress: number) => onProgress?.(start + progress * span);
}
