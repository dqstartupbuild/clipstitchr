export function getCssColorAlpha(color: string) {
  const rgbaMatch = color
    .trim()
    .match(/^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*([\d.]+)\s*\)$/i);

  if (!rgbaMatch) {
    return 1;
  }

  const alpha = Number(rgbaMatch[1]);

  return Number.isFinite(alpha) ? Math.min(1, Math.max(0, alpha)) : 1;
}
