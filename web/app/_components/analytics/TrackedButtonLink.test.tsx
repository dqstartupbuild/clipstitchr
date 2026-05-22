import { describe, expect, it, vi } from "vitest";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";

const mocks = vi.hoisted(() => ({
  trackPostHogEvent: vi.fn(),
  trackTikTokButtonClick: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: (props: { children: unknown; href: string; onClick?: () => void }) => ({
    props,
    type: "a",
  }),
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: mocks.trackTikTokButtonClick,
}));

describe("TrackedButtonLink", () => {
  it("tracks PostHog and TikTok click payloads", () => {
    const element = TrackedButtonLink({
      children: "Open",
      className: "button",
      contentCategory: "Landing page",
      contentId: "cta_1",
      contentName: "CTA",
      href: "/dashboard",
    }) as { props: { onClick: () => void } };

    element.props.onClick();

    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("cta_clicked", {
      cta_id: "cta_1",
      cta_label: "CTA",
      destination: "/dashboard",
      location: "Landing page",
    });
    expect(mocks.trackTikTokButtonClick).toHaveBeenCalledWith({
      contentCategory: "Landing page",
      contentId: "cta_1",
      contentName: "CTA",
    });
  });
});
