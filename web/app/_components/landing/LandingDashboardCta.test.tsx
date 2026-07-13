import { describe, expect, it, vi, beforeEach } from "vitest";
import { LandingDashboardCta } from "@/app/_components/landing/LandingDashboardCta";

const mocks = vi.hoisted(() => ({
  prefetch: vi.fn(),
  redirectToSignIn: vi.fn(),
  redirectToSignUp: vi.fn(),
  trackPostHogEvent: vi.fn(),
  trackTikTokButtonClick: vi.fn(),
  userState: {
    isLoaded: true,
    isSignedIn: false,
  },
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => effect(),
  };
});

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({
    redirectToSignIn: mocks.redirectToSignIn,
    redirectToSignUp: mocks.redirectToSignUp,
  }),
  useUser: () => mocks.userState,
}));

vi.mock("next/link", () => ({
  default: (props: {
    children: unknown;
    className: string;
    href: string;
    onClick?: () => void;
  }) => ({
    props,
    type: "a",
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    prefetch: mocks.prefetch,
  }),
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: mocks.trackTikTokButtonClick,
}));

function renderCta() {
  return LandingDashboardCta({
    className: "button",
    contentId: "landing_cta",
    contentName: "Landing CTA",
    signedOutLabel: "Get ClipStitchr",
  }) as {
    props: {
      href?: string;
      onClick: () => void;
    };
    type: string;
  };
}

describe("LandingDashboardCta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userState.isLoaded = true;
    mocks.userState.isSignedIn = false;
  });

  it("redirects signed-out visitors without prefetching the dashboard", () => {
    const element = renderCta();

    element.props.onClick();

    expect(element.type).toBe("button");
    expect(element.props.href).toBeUndefined();
    expect(mocks.prefetch).not.toHaveBeenCalled();
    expect(mocks.redirectToSignUp).toHaveBeenCalled();
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("cta_clicked", {
      cta_id: "landing_cta",
      cta_label: "Landing CTA",
      destination: "/sign-up",
      location: "Landing page",
    });
  });

  it("does not redirect before Clerk has loaded", () => {
    mocks.userState.isLoaded = false;

    const element = renderCta();

    element.props.onClick();

    expect(mocks.prefetch).not.toHaveBeenCalled();
    expect(mocks.redirectToSignIn).not.toHaveBeenCalled();
    expect(mocks.redirectToSignUp).not.toHaveBeenCalled();
  });

  it("can redirect signed-out visitors to sign in", () => {
    const element = LandingDashboardCta({
      className: "button",
      contentId: "landing_sign_in",
      contentName: "Landing sign in",
      signedOutAction: "sign-in",
      signedOutLabel: "Sign in",
    }) as { props: { onClick: () => void } };

    element.props.onClick();

    expect(mocks.redirectToSignIn).toHaveBeenCalled();
    expect(mocks.redirectToSignUp).not.toHaveBeenCalled();
  });

  it("shows and prefetches the dashboard for signed-in visitors", () => {
    mocks.userState.isSignedIn = true;

    const element = renderCta();

    element.props.onClick();

    expect(element.props.href).toBe("/dashboard");
    expect(mocks.prefetch).toHaveBeenCalledWith("/dashboard");
    expect(mocks.redirectToSignUp).not.toHaveBeenCalled();
    expect(mocks.trackTikTokButtonClick).toHaveBeenCalledWith({
      contentCategory: "Landing page",
      contentId: "landing_cta",
      contentName: "Landing CTA",
    });
  });
});
