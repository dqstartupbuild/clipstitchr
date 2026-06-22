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

    expect(markup).toContain(
      "Make more ad variants from the clips you already have",
    );
    expect(markup).toContain(
      "Upload your clips once. Pick the product demo. Click once",
    );
    expect(markup).toContain("Create your first batch");
    expect(markup).toContain("One simple flow from saved clips");
    expect(markup).toContain(
      "Saved clips + one demo = a batch of ad variants",
    );
    expect(markup).toContain(
      "One demo can turn your clip library into a full creative test",
    );
    expect(markup).toContain(
      "Know which clips are worth putting into the batch",
    );
    expect(markup).toContain("/example-outputs/clipstitchr-example-01.webm");
    expect(markup).toContain("/example-outputs/clipstitchr-example-21.webm");
    expect(markup).not.toContain("/examples/stitchr-fitness-score-reaction");
    expect(markup).toContain("When a format works, reuse it");
    expect(markup).toContain("Never start from an empty library");
    expect(markup).toContain("When a carousel fits better than a video");
    expect(markup).toContain("Let ClipStitchr prepare new drafts");
    expect(markup).toContain("What you get");
    expect(markup).toContain("repeatable ad engine");
    expect(markup).toContain("Create the next batch from clips you already have");
    expect(markup).toContain("ClipStitchr dashboard and video stitching");
  });

  it("renders landing and content header variants", () => {
    const landingMarkup = renderToStaticMarkup(<LandingPage />);
    const contentHeaderMarkup = renderToStaticMarkup(
      <SiteHeader variant="content" />,
    );

    expect(landingMarkup).toContain("How it Works");
    expect(landingMarkup).toContain("Examples");
    expect(landingMarkup).toContain("What you get");
    expect(landingMarkup).toContain("Pricing");
    expect(landingMarkup).toContain('href="/sign-up"');
    expect(landingMarkup).not.toContain("Features");
    expect(landingMarkup).not.toContain("Scores");
    expect(landingMarkup).not.toContain("Real Stitchr output");
    expect(landingMarkup).not.toContain("Real output reel");
    expect(
      landingMarkup.indexOf("/example-outputs/clipstitchr-example-01.webm"),
    ).toBeLessThan(landingMarkup.indexOf("One simple flow from saved clips"));
    expect(contentHeaderMarkup).toContain("Home");
    expect(contentHeaderMarkup).toContain("Dashboard");
  });
});
