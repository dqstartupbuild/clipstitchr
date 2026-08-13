export function toStudioReelAssColor(value: string) {
  const hex = value.slice(1);
  const red = hex.slice(0, 2);
  const green = hex.slice(2, 4);
  const blue = hex.slice(4, 6);
  const alpha = hex.length === 8 ? hex.slice(6, 8) : "FF";
  const assAlpha = (255 - Number.parseInt(alpha, 16))
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return `&H${assAlpha}${blue}${green}${red}&`;
}
