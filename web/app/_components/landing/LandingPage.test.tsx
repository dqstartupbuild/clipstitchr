import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { LandingPage } from "@/app/_components/landing/LandingPage";
import { SiteHeader } from "@/app/site-header";

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    height,
    sizes,
    src,
    width,
  }: {
    alt: string;
    className?: string;
    height?: number;
    sizes?: string;
    src: string;
    width?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      data-sizes={sizes}
      height={height}
      src={src}
      width={width}
    />
  ),
}));

vi.mock("@/app/_components/HeaderAuthActions", () => ({
  HeaderAuthActions: ({ variant }: { variant?: string }) => (
    <span data-testid="header-auth-actions">{variant ?? "desktop"}</span>
  ),
}));

vi.mock("@/app/_components/landing/LandingDashboardCta", () => ({
  LandingDashboardCta: ({
    className,
    signedOutLabel,
  }: {
    className: string;
    signedOutLabel: string;
  }) => (
    <a className={className} href="/dashboard">
      {signedOutLabel}
    </a>
  ),
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));

describe("LandingPage", () => {
  it("renders the full landing page from the home route", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toMatch(/<main[^>]*>/);
    expect((markup.match(/<h1/g) ?? []).length).toBe(1);
    expect((markup.match(/<h2/g) ?? []).length).toBeGreaterThan(1);
    expect(markup.replace(/<[^>]+>/g, "").length).toBeGreaterThan(500);

    expect(markup).toContain("Your clips");
    expect(markup).toContain("Your campaign");
    expect(markup).toContain("Turn UGC clips and product demos into finished short-form app ads");
    expect(markup).toContain("TikTok, Instagram Reels, and YouTube Shorts");
    expect(markup).toContain("Get ClipStitchr");
    expect(markup).toContain("Paid plans start at $39/month");
    expect(markup).toContain("Every tool is included");
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start for free");
    expect(markup).toContain("See 21 real outputs");
    expect(markup).toContain("Built from real clips");
    expect(markup).toContain("One demo in. Ads out");
    expect(markup).toContain("One library. Three jobs");
    expect(markup).toContain("/example-outputs/clipstitchr-example-11.webm");
    expect(markup).toContain("/example-outputs/clipstitchr-example-20.webm");
    expect(markup).toContain("Batch up to 20 hooks");
    expect(markup).toContain("Social post analysis");
    expect(markup).toContain("Swipr carousels");
    expect(markup).toContain("queue finished work through Zernio");
    expect(markup).toContain("75");
    expect(markup).toContain("161K+");
    expect(markup).toContain("Make the batch. Keep building");
    expect(markup).toContain("Guppy production library inside ClipStitchr");
    expect(markup).toContain('"@type":"SoftwareApplication"');
    expect(markup).toContain("Plan your next app ad");
    expect(markup).toContain("Watch finished app ads");
    expect(markup).toContain("Learn the workflow");
  });

  it("renders landing and content header variants", () => {
    const landingMarkup = renderToStaticMarkup(<LandingPage />);
    const contentHeaderMarkup = renderToStaticMarkup(
      <SiteHeader variant="content" />,
    );

    expect(landingMarkup).toContain("How it works");
    expect(landingMarkup).toContain("Examples");
    expect(landingMarkup).toContain("Docs");
    expect(landingMarkup).toContain("Pricing");
    expect(landingMarkup).toContain('href="/examples"');
    expect(landingMarkup).toContain('href="/docs"');
    expect(landingMarkup).toContain('href="/pricing"');
    expect(landingMarkup).toContain("Built from real clips");
    expect(
      landingMarkup.indexOf("/example-outputs/clipstitchr-example-11.webm"),
    ).toBeLessThan(landingMarkup.indexOf("One demo in. Ads out"));
    expect(contentHeaderMarkup).toContain("Product");
    expect(contentHeaderMarkup).toContain("Pricing");
    expect(contentHeaderMarkup).toContain("Case studies");
    expect(contentHeaderMarkup).toContain("Menu");
    expect(contentHeaderMarkup).toContain('href="/tools"');
  });
});
