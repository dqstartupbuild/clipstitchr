export function getCssColorHex(color: string, fallback = "#111827") {
  const normalizedColor = color.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(normalizedColor)) {
    return normalizedColor;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(normalizedColor)) {
    const [, red, green, blue] = normalizedColor;

    return `#${red}${red}${green}${green}${blue}${blue}`;
  }

  const rgbMatch = normalizedColor.match(
    /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\s*\)$/i,
  );

  if (!rgbMatch) {
    return fallback;
  }

  const red = Number(rgbMatch[1]).toString(16).padStart(2, "0");
  const green = Number(rgbMatch[2]).toString(16).padStart(2, "0");
  const blue = Number(rgbMatch[3]).toString(16).padStart(2, "0");

  return `#${red}${green}${blue}`;
}
