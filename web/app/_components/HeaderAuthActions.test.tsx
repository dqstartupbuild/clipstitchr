import { describe, expect, it, vi, beforeEach } from "vitest";
import { HeaderAuthActions } from "@/app/_components/HeaderAuthActions";

const mocks = vi.hoisted(() => ({
  linkProps: null as { onClick?: () => void } | null,
  redirectToSignIn: vi.fn(),
  redirectToSignUp: vi.fn(),
  trackPostHogEvent: vi.fn(),
  trackTikTokButtonClick: vi.fn(),
  userState: {
    isLoaded: true,
    isSignedIn: false,
  },
}));

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => "UserButton",
  useClerk: () => ({
    redirectToSignIn: mocks.redirectToSignIn,
    redirectToSignUp: mocks.redirectToSignUp,
  }),
  useUser: () => mocks.userState,
}));

vi.mock("next/link", () => ({
  default: (props: {
    children: unknown;
    href: string;
    onClick?: () => void;
  }) => {
    mocks.linkProps = props;
    return {
      props,
      type: "a",
    };
  },
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: mocks.trackTikTokButtonClick,
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

describe("HeaderAuthActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.linkProps = null;
    mocks.userState.isLoaded = true;
    mocks.userState.isSignedIn = false;
  });

  it("returns a loading skeleton while Clerk is loading", () => {
    mocks.userState.isLoaded = false;

    const element = HeaderAuthActions({ variant: "mobile" }) as {
      props: { className: string };
    };

    expect(element.props.className).toContain("h-9");
  });

  it("tracks sign-in and sends signed-out visitors to pricing", () => {
    const element = HeaderAuthActions({ variant: "desktop" }) as {
      props: { children: unknown };
    };
    const [signInButton] = findElements(
      element,
      (child) => child.type === "button",
    );
    const [pricingLink] = findElements(
      element,
      (child) => child.props?.href === "/pricing",
    );

    (signInButton.props.onClick as () => void)();
    (pricingLink.props.onClick as () => void)();

    expect(pricingLink.props.children).toBe("See pricing");
    expect(mocks.redirectToSignIn).toHaveBeenCalled();
    expect(mocks.redirectToSignUp).not.toHaveBeenCalled();
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("auth_cta_clicked", {
      action: "sign_in",
      location: "header",
      variant: "desktop",
    });
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "pricing_cta_clicked",
      {
        location: "header",
        variant: "desktop",
      },
    );
    expect(mocks.trackTikTokButtonClick).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId: "header_pricing",
      }),
    );
  });

  it("renders signed-in dashboard actions and tracks dashboard clicks", () => {
    mocks.userState.isSignedIn = true;

    const element = HeaderAuthActions({ variant: "mobile" });
    const [dashboardLink] = findElements(
      element,
      (child) => typeof child.props?.href === "string",
    );

    (dashboardLink.props.onClick as () => void)();

    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "dashboard_cta_clicked",
      {
        location: "header",
        variant: "mobile",
      },
    );
    expect(mocks.trackTikTokButtonClick).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId: "header_dashboard",
      }),
    );
  });
});
