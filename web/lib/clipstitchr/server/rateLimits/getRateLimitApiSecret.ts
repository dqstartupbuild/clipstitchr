export function getRateLimitApiSecret() {
  const secret = process.env.RATE_LIMIT_API_SECRET;

  if (!secret) {
    throw new Error("Missing RATE_LIMIT_API_SECRET.");
  }

  return secret;
}
