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

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));

describe("LandingPage", () => {
  it("renders the full landing page from the home route", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain("Turn your UGC into");
    expect(markup).toContain("One reusable ad library");
    expect(markup).toContain("/social-proof/clipstitchr-stitch-01.webm");
    expect(markup).toContain("/social-proof/clipstitchr-stitch-21.webm");
    expect(markup).toContain("Stitch first, generate when needed");
    expect(markup).toContain("Stop collecting clips you never use");
    expect(markup).toContain("Five ways to turn your library");
    expect(markup).toContain("Turn your clip library into the next ad batch");
    expect(markup).toContain("ClipStitchr dashboard and video stitching");
  });

  it("renders landing and content header variants", () => {
    const landingMarkup = renderToStaticMarkup(<LandingPage />);
    const contentHeaderMarkup = renderToStaticMarkup(
      <SiteHeader variant="content" />,
    );

    expect(landingMarkup).toContain("Features");
    expect(landingMarkup).toContain("How it Works");
    expect(landingMarkup).not.toContain("Real Stitchr output");
    expect(landingMarkup).not.toContain("Real output reel");
    expect(
      landingMarkup.indexOf("/social-proof/clipstitchr-stitch-01.webm"),
    ).toBeLessThan(landingMarkup.indexOf("One reusable ad library"));
    expect(contentHeaderMarkup).toContain("Home");
    expect(contentHeaderMarkup).toContain("Dashboard");
  });
});
