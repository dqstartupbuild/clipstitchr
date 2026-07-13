export function formatBitrate(bitsPerSecond: number | null) {
  if (!bitsPerSecond || !Number.isFinite(bitsPerSecond)) {
    return "Not available";
  }

  if (bitsPerSecond >= 1_000_000) {
    return `${(bitsPerSecond / 1_000_000).toFixed(1)} Mbps`;
  }

  return `${Math.round(bitsPerSecond / 1_000)} Kbps`;
}
