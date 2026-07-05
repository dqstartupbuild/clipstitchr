import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { HeaderAuthActions } from "@/app/_components/HeaderAuthActions";

const mocks = vi.hoisted(() => ({
  linkProps: [] as Array<{
    className?: string;
    href: string;
    onClick?: () => void;
  }>,
  trackPostHogEvent: vi.fn(),
  trackTikTokButtonClick: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: (props: {
    children: ReactNode;
    href: string;
    onClick?: () => void;
  }) => {
    mocks.linkProps.push(props);
    return <a {...props}>{props.children}</a>;
  },
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: mocks.trackTikTokButtonClick,
}));

describe("HeaderAuthActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.linkProps = [];
  });

  it("renders public auth links and tracks sign-in/sign-up actions", () => {
    renderToStaticMarkup(<HeaderAuthActions variant="desktop" />);
    const [signInLink, signUpLink] = mocks.linkProps;

    expect(signInLink.href).toBe("/sign-in");
    expect(signUpLink.href).toBe("/sign-up");

    signInLink.onClick?.();
    signUpLink.onClick?.();

    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("auth_cta_clicked", {
      action: "sign_in",
      location: "header",
      variant: "desktop",
    });
    expect(mocks.trackTikTokButtonClick).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId: "header_sign_up",
      }),
    );
  });

  it("uses compact classes for mobile actions", () => {
    renderToStaticMarkup(<HeaderAuthActions variant="mobile" />);
    const [signInLink, signUpLink] = mocks.linkProps;

    expect(signInLink.className).toContain("h-9");
    expect(signUpLink.className).toContain("h-9");
  });
});
