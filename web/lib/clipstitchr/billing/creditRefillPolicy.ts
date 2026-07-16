export const creditRefillPolicy = {
  amount: 2_000,
  expiresAfterMs: 365 * 24 * 60 * 60 * 1_000,
  priceUsd: 29,
  requiresActiveSubscription: true,
} as const;
