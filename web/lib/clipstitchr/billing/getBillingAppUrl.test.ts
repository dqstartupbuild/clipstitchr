import { afterEach, describe, expect, it, vi } from "vitest";
import { getBillingAppUrl } from "./getBillingAppUrl";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getBillingAppUrl", () => {
  it("returns the canonical HTTPS origin in live mode", () => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", "live");
    vi.stubEnv("CLIPSTITCHR_APP_URL", "https://clipstitchr.com/dashboard");

    expect(getBillingAppUrl()).toBe("https://clipstitchr.com");
  });

  it("allows localhost HTTP only in test mode", () => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", "test");
    vi.stubEnv("CLIPSTITCHR_APP_URL", "http://localhost:3000/settings");

    expect(getBillingAppUrl()).toBe("http://localhost:3000");
  });

  it.each([
    ["live", "http://localhost:3000"],
    ["test", "http://clipstitchr.test"],
  ] as const)("rejects insecure %s app URLs", (mode, appUrl) => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", mode);
    vi.stubEnv("CLIPSTITCHR_APP_URL", appUrl);

    expect(() => getBillingAppUrl()).toThrow(
      "CLIPSTITCHR_APP_URL must use HTTPS outside local tests.",
    );
  });
});
