export function toStudioReelAssTime(seconds: number) {
  const centiseconds = Math.max(0, Math.round(seconds * 100));
  const hours = Math.floor(centiseconds / 360_000);
  const minutes = Math.floor((centiseconds % 360_000) / 6_000);
  const wholeSeconds = Math.floor((centiseconds % 6_000) / 100);
  const remainder = centiseconds % 100;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(remainder).padStart(2, "0")}`;
}
