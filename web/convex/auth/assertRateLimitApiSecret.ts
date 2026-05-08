export function assertRateLimitApiSecret(secret: string) {
  const expectedSecret = process.env.RATE_LIMIT_API_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    throw new Error("Not authorized to consume server rate limits.");
  }
}
