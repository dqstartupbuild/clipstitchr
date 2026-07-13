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

    expect(markup).toContain("Turn raw footage into finished ads");
    expect(markup).toContain("Upload Hook/UGC clips and product demos once");
    expect(markup).toContain("Get ClipStitchr");
    expect(markup).toContain("Starts at $39/month");
    expect(markup).toContain("Every tool included");
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start for free");
    expect(markup).toContain("Watch examples");
    expect(markup).toContain("Three steps. Zero timelines");
    expect(markup).toContain("Every tool feeds one library");
    expect(markup).toContain(
      "Run product work from the repo you already have open",
    );
    expect(markup).toContain("npm install -g clipstitchr");
    expect(markup).toContain("/docs/clipstitchr-cli");
    expect(markup).toContain("Writing overlay text that does not sound fake");
    expect(markup).toContain(
      "Paste lines from posts that made you stop scrolling",
    );
    expect(markup).toContain(
      "Use one product demo without dragging it into every ad yourself",
    );
    expect(markup).toContain(
      "Nobody wants to discover a clip was bad after running the ad",
    );
    expect(markup).toContain("/example-outputs/clipstitchr-example-01.webm");
    expect(markup).toContain("/example-outputs/clipstitchr-example-21.webm");
    expect(markup).not.toContain("/examples/stitchr-fitness-score-reaction");
    expect(markup).toContain(
      "Starting from zero is what makes the next post feel heavy",
    );
    expect(markup).toContain(
      "Sometimes the problem is just not having enough usable clips",
    );
    expect(markup).toContain("When video feels like overkill");
    expect(markup).toContain(
      "Showing up daily is hard when you do not like social",
    );
    expect(markup).toContain("Scheduling after the draft is ready");
    expect(markup).toContain("/docs/post-bridge");
    expect(markup).toContain("Upload once");
    expect(markup).toContain("Create everything");
    expect(markup).toContain("ClipStitchr dashboard and video stitching");
  });

  it("renders landing and content header variants", () => {
    const landingMarkup = renderToStaticMarkup(<LandingPage />);
    const contentHeaderMarkup = renderToStaticMarkup(
      <SiteHeader variant="content" />,
    );

    expect(landingMarkup).toContain("How it works");
    expect(landingMarkup).toContain("Features");
    expect(landingMarkup).toContain("Examples");
    expect(landingMarkup).toContain("Docs");
    expect(landingMarkup).toContain("Pricing");
    expect(landingMarkup).toContain('href="/examples"');
    expect(landingMarkup).toContain('href="/docs"');
    expect(landingMarkup).toContain('href="/pricing"');
    expect(landingMarkup).not.toContain("Real Stitchr output");
    expect(landingMarkup).not.toContain("Real output reel");
    expect(
      landingMarkup.indexOf("/example-outputs/clipstitchr-example-01.webm"),
    ).toBeLessThan(landingMarkup.indexOf("Three steps. Zero timelines"));
    expect(contentHeaderMarkup).toContain("Home");
    expect(contentHeaderMarkup).toContain("Pricing");
    expect(contentHeaderMarkup).toContain("Dashboard");
  });
});
