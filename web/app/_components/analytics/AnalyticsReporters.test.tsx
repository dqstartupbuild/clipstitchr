import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PostHogIdentityReporter } from "@/app/_components/analytics/PostHogIdentityReporter";
import { PostHogPageViewTracker } from "@/app/_components/analytics/PostHogPageViewTracker";
import { TikTokIdentityReporter } from "@/app/_components/analytics/TikTokIdentityReporter";
import { TikTokPixelScript } from "@/app/_components/analytics/TikTokPixelScript";
import { TikTokViewContentTracker } from "@/app/_components/analytics/TikTokViewContentTracker";

const mocks = vi.hoisted(() => ({
  clearTimeout: vi.fn(),
  identifyPostHogUser: vi.fn(),
  identifyTikTokUser: vi.fn(),
  pathname: "/dashboard/stitchr",
  refValue: { current: false },
  resetPostHogUser: vi.fn(),
  setTimeout: vi.fn((callback: () => void) => {
    callback();
    return 123;
  }),
  trackPostHogEvent: vi.fn(),
  trackTikTokPageView: vi.fn(),
  trackTikTokViewContent: vi.fn(),
  userState: {
    isLoaded: true,
    isSignedIn: true,
    user: {
      fullName: "Ava Creator",
      id: "user_123",
      primaryEmailAddress: {
        emailAddress: "ava@example.com",
      },
    },
  },
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: (callback: () => void | (() => void)) => callback(),
    useRef: () => mocks.refValue,
  };
});

vi.mock("@clerk/nextjs", () => ({
  useUser: () => mocks.userState,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("next/script", () => ({
  default: ({
    children,
    id,
  }: {
    children: React.ReactNode;
    id: string;
  }) => <script id={id}>{children}</script>,
}));

vi.mock("@/lib/clipstitchr/analytics/identifyPostHogUser", () => ({
  identifyPostHogUser: mocks.identifyPostHogUser,
}));

vi.mock("@/lib/clipstitchr/analytics/resetPostHogUser", () => ({
  resetPostHogUser: mocks.resetPostHogUser,
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/analytics/identifyTikTokUser", () => ({
  identifyTikTokUser: mocks.identifyTikTokUser,
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokPageView", () => ({
  trackTikTokPageView: mocks.trackTikTokPageView,
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokViewContent", () => ({
  trackTikTokViewContent: mocks.trackTikTokViewContent,
}));

describe("analytics reporters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/dashboard/stitchr";
    mocks.refValue = { current: false };
    mocks.userState.isLoaded = true;
    mocks.userState.isSignedIn = true;
    mocks.userState.user = {
      fullName: "Ava Creator",
      id: "user_123",
      primaryEmailAddress: {
        emailAddress: "ava@example.com",
      },
    };
    vi.stubGlobal("window", {
      clearTimeout: mocks.clearTimeout,
      location: {
        href: "https://clipstitchr.test/dashboard/stitchr?tab=ugc",
        search: "?tab=ugc",
      },
      setTimeout: mocks.setTimeout,
    });
    vi.stubGlobal("document", {
      title: "Stitchr",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("identifies and resets PostHog users from Clerk state", () => {
    PostHogIdentityReporter();

    expect(mocks.identifyPostHogUser).toHaveBeenCalledWith("user_123", {
      email: "ava@example.com",
      name: "Ava Creator",
    });

    mocks.userState.isSignedIn = false;
    PostHogIdentityReporter();

    expect(mocks.resetPostHogUser).toHaveBeenCalledOnce();
  });

  it("tracks PostHog page views with page context", () => {
    PostHogPageViewTracker();

    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("$pageview", {
      page_category: "dashboard",
      page_path: "/dashboard/stitchr",
      page_search: "?tab=ugc",
      page_title: "Stitchr",
      page_url: "https://clipstitchr.test/dashboard/stitchr?tab=ugc",
    });
  });

  it("identifies TikTok users and tracks view content on route changes", () => {
    TikTokIdentityReporter();
    TikTokViewContentTracker();
    TikTokViewContentTracker();

    expect(mocks.identifyTikTokUser).toHaveBeenCalledWith({
      email: "ava@example.com",
      externalId: "user_123",
    });
    expect(mocks.trackTikTokViewContent).toHaveBeenCalledWith(
      "/dashboard/stitchr",
    );
    expect(mocks.trackTikTokPageView).toHaveBeenCalledOnce();
  });

  it("renders the TikTok pixel script when configured", () => {
    const markup = renderToStaticMarkup(<TikTokPixelScript />);

    expect(markup).toContain("tiktok-pixel");
    expect(markup).toContain("ttq.load");
  });
});
