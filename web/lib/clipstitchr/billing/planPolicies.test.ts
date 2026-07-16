import { describe, expect, it } from "vitest";
import { getPlanGenerationProfile } from "@/lib/clipstitchr/billing/getPlanGenerationProfile";
import { getPlanPolicy } from "@/lib/clipstitchr/billing/getPlanPolicy";
import { creditRefillPolicy } from "@/lib/clipstitchr/billing/creditRefillPolicy";

describe("plan policies", () => {
  it("keeps the paid plan contract in one server-owned policy", () => {
    expect(getPlanPolicy("starter")).toMatchObject({
      monthlyPriceUsd: 39,
      productLimit: 1,
      monthlyCreationCredits: 2_000,
      aiVideoLimit: 3,
      dailyDraftProductLimit: 0,
      activeGenerationLimit: 1,
      queueWeight: 1,
      queueLabel: "Standard",
      stitchCreditCost: 10,
    });
    expect(getPlanPolicy("pro")).toMatchObject({
      monthlyPriceUsd: 99,
      productLimit: 3,
      monthlyCreationCredits: 8_000,
      aiVideoLimit: 10,
      dailyDraftProductLimit: 1,
      activeGenerationLimit: 2,
      queueWeight: 3,
      queueLabel: "Priority processing",
    });
    expect(getPlanPolicy("agency")).toMatchObject({
      monthlyPriceUsd: 399,
      productLimit: 10,
      monthlyCreationCredits: 20_000,
      aiVideoLimit: 50,
      dailyDraftProductLimit: 10,
      activeGenerationLimit: 4,
      queueWeight: 5,
      queueLabel: "Highest priority",
      stitchCreditCost: 0,
    });
  });

  it("owns generation profiles on the paid plan", () => {
    expect(getPlanGenerationProfile("starter").avatarImageConcurrency).toBe(1);
    expect(getPlanGenerationProfile("pro").avatarImageConcurrency).toBe(2);
    expect(getPlanGenerationProfile("agency").avatarImageConcurrency).toBe(4);
  });

  it("keeps refills separate from video allowances", () => {
    expect(creditRefillPolicy).toMatchObject({
      amount: 2_000,
      priceUsd: 29,
      requiresActiveSubscription: true,
    });
    expect(creditRefillPolicy).not.toHaveProperty("aiVideoLimit");
  });
});
