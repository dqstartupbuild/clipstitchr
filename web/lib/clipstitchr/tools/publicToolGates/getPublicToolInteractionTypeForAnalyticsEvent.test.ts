import { describe, expect, it } from "vitest";
import { getPublicToolInteractionTypeForAnalyticsEvent } from "@/lib/clipstitchr/tools/publicToolGates/getPublicToolInteractionTypeForAnalyticsEvent";

describe("getPublicToolInteractionTypeForAnalyticsEvent", () => {
  it("maps only the three bounded qualification interactions", () => {
    expect(
      getPublicToolInteractionTypeForAnalyticsEvent("tool_result_displayed"),
    ).toBe("resultViewed");
    expect(
      getPublicToolInteractionTypeForAnalyticsEvent("tool_resource_unlocked"),
    ).toBe("resourceUnlocked");
    expect(
      getPublicToolInteractionTypeForAnalyticsEvent("tool_paid_cta_clicked"),
    ).toBe("paidCtaClicked");
    expect(getPublicToolInteractionTypeForAnalyticsEvent("tool_started")).toBeNull();
    expect(
      getPublicToolInteractionTypeForAnalyticsEvent("tool_gate_displayed"),
    ).toBeNull();
    expect(
      getPublicToolInteractionTypeForAnalyticsEvent("tool_lead_accepted"),
    ).toBeNull();
  });
});
