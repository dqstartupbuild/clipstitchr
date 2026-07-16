import { afterEach, describe, expect, it, vi } from "vitest";
import { getStripeMode } from "./getStripeMode";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getStripeMode", () => {
  it.each(["test", "live"] as const)("accepts explicit %s mode", (mode) => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", mode);

    expect(getStripeMode()).toBe(mode);
  });

  it.each(["", "production", "TEST"])(
    "fails closed for an invalid mode value",
    (mode) => {
      vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", mode);

      expect(() => getStripeMode()).toThrow(
        "CLIPSTITCHR_STRIPE_MODE must be explicitly set to test or live.",
      );
    },
  );
});
