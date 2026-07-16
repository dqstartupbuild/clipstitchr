export function toStripeIsoString(timestamp: number) {
  return new Date(timestamp * 1_000).toISOString();
}
