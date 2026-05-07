export function getHexColorLuminance(color: string) {
  const normalizedColor = color.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedColor)) {
    return 1;
  }

  const red = Number.parseInt(normalizedColor.slice(0, 2), 16) / 255;
  const green = Number.parseInt(normalizedColor.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(normalizedColor.slice(4, 6), 16) / 255;

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
