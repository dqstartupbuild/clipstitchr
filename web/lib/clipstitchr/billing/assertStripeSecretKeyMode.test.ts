import { describe, expect, it } from "vitest";
import { assertStripeSecretKeyMode } from "./assertStripeSecretKeyMode";

describe("assertStripeSecretKeyMode", () => {
  it.each([
    ["sk_test_example", "test"],
    ["sk_live_example", "live"],
  ] as const)("accepts a key matching %s", (secretKey, mode) => {
    expect(() => assertStripeSecretKeyMode(secretKey, mode)).not.toThrow();
  });

  it.each([
    ["sk_live_example", "test"],
    ["sk_test_example", "live"],
    ["rk_live_example", "live"],
  ] as const)("rejects a key that does not match %s", (secretKey, mode) => {
    expect(() => assertStripeSecretKeyMode(secretKey, mode)).toThrow(
      `Stripe secret key does not match ${mode} mode.`,
    );
  });
});
