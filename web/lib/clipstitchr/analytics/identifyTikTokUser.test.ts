import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { identifyTikTokUser } from "@/lib/clipstitchr/analytics/identifyTikTokUser";

const mocks = vi.hoisted(() => ({
  getHasMarketingConsent: vi.fn(),
  hashTikTokIdentifier: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/getHasMarketingConsent", () => ({
  getHasMarketingConsent: mocks.getHasMarketingConsent,
}));

vi.mock("@/lib/clipstitchr/analytics/hashTikTokIdentifier", () => ({
  hashTikTokIdentifier: mocks.hashTikTokIdentifier,
}));

describe("identifyTikTokUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getHasMarketingConsent.mockReturnValue(true);
    mocks.hashTikTokIdentifier.mockImplementation(async (value: string) =>
      value ? `hashed:${value}` : null,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("identifies users with hashed marketing identifiers when consented", async () => {
    const identify = vi.fn();

    vi.stubGlobal("window", {
      ttq: {
        identify,
      },
    });

    await identifyTikTokUser({
      email: "user@example.com",
      externalId: "user_1",
      phoneNumber: "+15555550100",
    });

    expect(identify).toHaveBeenCalledWith({
      email: "hashed:user@example.com",
      external_id: "hashed:user_1",
      phone_number: "hashed:+15555550100",
    });
  });

  it("skips identification without a browser, consent, or identifiers", async () => {
    await identifyTikTokUser({ email: "user@example.com" });
    expect(mocks.hashTikTokIdentifier).not.toHaveBeenCalled();

    vi.stubGlobal("window", { ttq: { identify: vi.fn() } });
    mocks.getHasMarketingConsent.mockReturnValue(false);

    await identifyTikTokUser({ email: "user@example.com" });
    expect(window.ttq?.identify).not.toHaveBeenCalled();

    mocks.getHasMarketingConsent.mockReturnValue(true);
    await identifyTikTokUser({});
    expect(window.ttq?.identify).not.toHaveBeenCalled();
  });
});
