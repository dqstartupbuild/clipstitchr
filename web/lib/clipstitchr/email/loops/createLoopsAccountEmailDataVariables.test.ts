import { describe, expect, it } from "vitest";
import { createLoopsAccountEmailDataVariables } from "./createLoopsAccountEmailDataVariables";

const common = {
  dashboardUrl: "https://clipstitchr.com/dashboard",
  firstName: "Owner",
  settingsUrl: "https://clipstitchr.com/dashboard/settings#plan-and-usage",
  supportEmail: "support@followusai.com",
} as const;

describe("createLoopsAccountEmailDataVariables", () => {
  it("strips unrelated values from the subscription template payload", () => {
    expect(
      createLoopsAccountEmailDataVariables({
        ...common,
        eventVariables: {
          creditsAdded: 20_000,
          effectiveDate: "2026-07-16",
          headline: "Agency is active",
          planName: "Agency",
          summary: "Your plan is ready.",
        },
        templateKey: "subscription-status",
      }),
    ).toEqual({
      effectiveDate: "2026-07-16",
      firstName: "Owner",
      headline: "Agency is active",
      planName: "Agency",
      settingsUrl: common.settingsUrl,
      summary: "Your plan is ready.",
      supportEmail: common.supportEmail,
    });
  });

  it("fails closed when a published-template variable is absent", () => {
    expect(() =>
      createLoopsAccountEmailDataVariables({
        ...common,
        eventVariables: { headline: "Credits ready" },
        templateKey: "credits-updated",
      }),
    ).toThrow("not configured");
  });
});
