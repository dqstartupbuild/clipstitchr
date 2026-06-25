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

    // Hero
    expect(markup).toContain("For solo app founders who hate content");
    expect(markup).toContain(
      "Turn saved clips into short-form ads you can actually test",
    );
    expect(markup).toContain("Start with your clips");
    expect(markup).toContain("See how it works");

    // Proof strip
    expect(markup).toContain("161K+");
    expect(markup).toContain("58K+");
    expect(markup).toContain("Read the case study");

    // Before/After
    expect(markup).toContain(
      "Content feels heavy because the same tiny steps keep repeating",
    );
    expect(markup).toContain("Without ClipStitchr");
    expect(markup).toContain("With ClipStitchr");

    // Workflow
    expect(markup).toContain("From saved clips to testable ads in four steps");
    expect(markup).toContain("Save your source clips");
    expect(markup).toContain("Build batches around one demo");
    expect(markup).toContain("Score before you post");
    expect(markup).toContain("Reuse what worked");

    // Product showcase
    expect(markup).toContain(
      "One system for the parts of content you keep avoiding",
    );
    expect(markup).toContain("Batch the ads");
    expect(markup).toContain("Hook Lab");

    // Library thin
    expect(markup).toContain(
      "When you do not have enough usable clips, make more source material",
    );

    // Examples
    expect(markup).toContain("Examples of drafts builders can make");
    expect(markup).toContain("/example-outputs/clipstitchr-example-11.webm");

    // Challenge teaser
    expect(markup).toContain("10k Organic Views Challenge");
    expect(markup).toContain(
      "Publish 30 ClipStitchr-made posts in 30 days",
    );

    // Final CTA
    expect(markup).toContain(
      "You can grow on short-form without becoming a content person",
    );
  });

  it("renders landing and content header variants", () => {
    const landingMarkup = renderToStaticMarkup(<LandingPage />);
    const contentHeaderMarkup = renderToStaticMarkup(
      <SiteHeader variant="content" />,
    );

    expect(landingMarkup).toContain("How it works");
    expect(landingMarkup).toContain("Examples");
    expect(landingMarkup).toContain("Case Studies");
    expect(landingMarkup).toContain("Pricing");
    expect(landingMarkup).toContain('href="/case-studies"');
    expect(landingMarkup).toContain('href="/pricing"');
    expect(landingMarkup).not.toContain("Features");
    expect(landingMarkup).not.toContain("Real Stitchr output");
    expect(landingMarkup).not.toContain("Real output reel");
    expect(contentHeaderMarkup).toContain("Home");
    expect(contentHeaderMarkup).toContain("Pricing");
    expect(contentHeaderMarkup).toContain("Dashboard");
  });
});