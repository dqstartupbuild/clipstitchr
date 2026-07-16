import type { StripeMode } from "./types/StripeMode";

export function assertStripeSecretKeyMode(secretKey: string, mode: StripeMode) {
  const expectedPrefix = mode === "test" ? "sk_test_" : "sk_live_";

  if (!secretKey.startsWith(expectedPrefix)) {
    throw new Error(`Stripe secret key does not match ${mode} mode.`);
  }
}
