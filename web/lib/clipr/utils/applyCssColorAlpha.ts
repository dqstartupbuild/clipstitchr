import { getCssColorHex } from "@/lib/clipr/utils/getCssColorHex";

export function applyCssColorAlpha(color: string, alpha: number) {
  if (alpha >= 1) {
    return color;
  }

  const hexColor = getCssColorHex(color);
  const red = Number.parseInt(hexColor.slice(1, 3), 16);
  const green = Number.parseInt(hexColor.slice(3, 5), 16);
  const blue = Number.parseInt(hexColor.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
