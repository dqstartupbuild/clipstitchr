import { afterEach, describe, expect, it, vi } from "vitest";
import { assertStripeEventMode } from "./assertStripeEventMode";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("assertStripeEventMode", () => {
  it.each([
    ["test", false],
    ["live", true],
  ] as const)("accepts events matching %s mode", (mode, livemode) => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", mode);

    expect(() => assertStripeEventMode(livemode)).not.toThrow();
  });

  it.each([
    ["test", true],
    ["live", false],
  ] as const)("rejects events that do not match %s mode", (mode, livemode) => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", mode);

    expect(() => assertStripeEventMode(livemode)).toThrow(
      "Stripe webhook event mode does not match this deployment.",
    );
  });
});
