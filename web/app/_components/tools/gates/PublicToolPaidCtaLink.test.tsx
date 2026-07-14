import { describe, expect, it, vi } from "vitest";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";

const mocks = vi.hoisted(() => ({
  trackPublicToolAnalyticsEvent: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/trackPublicToolAnalyticsEvent",
  () => ({
    trackPublicToolAnalyticsEvent: mocks.trackPublicToolAnalyticsEvent,
  }),
);

describe("PublicToolPaidCtaLink", () => {
  it("tracks only fixed catalog context", () => {
    const link = PublicToolPaidCtaLink({
      children: "See paid plans",
      className: "cta",
      contentCategory: "Five-day sprint",
      contentId: "five_day_sprint_pricing",
      contentName: "See paid plans",
      toolKey: "five-day-app-content-sprint",
      variant: "hybrid-v1",
    });

    link.props.onClick();

    expect(mocks.trackPublicToolAnalyticsEvent).toHaveBeenCalledWith(
      "tool_paid_cta_clicked",
      {
        gateMode: "email-native",
        toolKey: "five-day-app-content-sprint",
        variant: "hybrid-v1",
      },
    );
    expect(JSON.stringify(mocks.trackPublicToolAnalyticsEvent.mock.calls)).not.toMatch(
      /private@example\.com|private result|visitor name/i,
    );
  });
});
