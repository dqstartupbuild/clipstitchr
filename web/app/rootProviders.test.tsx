import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("root providers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("@clerk/nextjs");
    vi.doUnmock("next/font/google");
    vi.doUnmock("@vercel/analytics/next");
    vi.doUnmock("@/app/_components/analytics/CookieConsentManager");
    vi.doUnmock("@/app/ConvexClientProvider");
    vi.doUnmock("convex/react");
    vi.doUnmock("convex/react-clerk");
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("renders RootLayout with app-level providers and structured data", async () => {
    vi.doMock("@clerk/nextjs", () => ({
      ClerkProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-provider="clerk">{children}</div>
      ),
    }));
    vi.doMock("next/font/google", () => ({
      Barlow_Condensed: () => ({ variable: "font-display" }),
      DM_Sans: () => ({ variable: "font-body" }),
      Geist_Mono: () => ({ variable: "font-mono" }),
      Plus_Jakarta_Sans: () => ({ variable: "font-sans" }),
    }));
    vi.doMock("@vercel/analytics/next", () => ({
      Analytics: () => <span>Analytics</span>,
    }));
    vi.doMock("@/app/_components/analytics/CookieConsentManager", () => ({
      CookieConsentManager: () => <span>Cookie manager</span>,
    }));
    vi.doMock("@/app/ConvexClientProvider", () => ({
      ConvexClientProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-provider="convex">{children}</div>
      ),
    }));

    const { default: RootLayout, metadata } = await import("@/app/layout");
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>App child</main>
      </RootLayout>,
    );

    expect(metadata.applicationName).toBe("ClipStitchr");
    expect(markup).toContain("Cookie manager");
    expect(markup).toContain("App child");
    expect(markup).toContain("Analytics");
    expect(markup).toContain("Organization");
    expect(markup).toContain("WebSite");
  });

  it("creates the Convex provider with Clerk auth", async () => {
    const convexClient = vi.fn();
    const convexProviderWithClerk = vi.fn(
      ({ children }: { children: React.ReactNode }) => (
        <div data-provider="convex-clerk">{children}</div>
      ),
    );
    const useAuth = vi.fn();

    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://convex.example");
    vi.doMock("@clerk/nextjs", () => ({
      useAuth,
    }));
    vi.doMock("convex/react", () => ({
      ConvexReactClient: convexClient,
    }));
    vi.doMock("convex/react-clerk", () => ({
      ConvexProviderWithClerk: convexProviderWithClerk,
    }));

    const { ConvexClientProvider } = await import("@/app/ConvexClientProvider");
    const markup = renderToStaticMarkup(
      <ConvexClientProvider>
        <main>Convex child</main>
      </ConvexClientProvider>,
    );

    expect(convexClient).toHaveBeenCalledWith("https://convex.example");
    expect(convexProviderWithClerk).toHaveBeenCalledWith(
      expect.objectContaining({
        useAuth,
      }),
      undefined,
    );
    expect(markup).toContain("Convex child");
  });
});
