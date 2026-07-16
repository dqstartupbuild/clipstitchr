import type { StripeMode } from "./types/StripeMode";

export function getStripeMode(): StripeMode {
  const value = process.env.CLIPSTITCHR_STRIPE_MODE;

  if (value !== "test" && value !== "live") {
    throw new Error(
      "CLIPSTITCHR_STRIPE_MODE must be explicitly set to test or live.",
    );
  }

  return value;
}
