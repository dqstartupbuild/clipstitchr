import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WaitlistForm } from "@/app/_components/auth/WaitlistForm";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    waitlist: {
      submit: "waitlist.submit",
    },
  },
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackWaitlistSignupConversion", () => ({
  trackWaitlistSignupConversion: vi.fn(),
}));

describe("WaitlistForm", () => {
  it("renders the private beta waitlist form", () => {
    const markup = renderToStaticMarkup(<WaitlistForm />);

    expect(markup).toContain("Invite-only beta");
    expect(markup).toContain("Join the ClipStitchr waitlist");
    expect(markup).toContain('autoComplete="name"');
    expect(markup).toContain('type="email"');
    expect(markup).toContain("Join waitlist");
    expect(markup).toContain('href="/sign-in"');
  });
});
