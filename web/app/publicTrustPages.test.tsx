import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AboutPage from "@/app/(content)/about/page";
import ContactPage from "@/app/(content)/contact/page";
import DevelopersPage from "@/app/(content)/developers/page";
import NotFound from "@/app/not-found";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

function getVisibleText(markup: string) {
  return markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

describe("public trust and recovery pages", () => {
  it.each([
    ["About", AboutPage],
    ["Contact", ContactPage],
    ["Developer Resources", DevelopersPage],
  ])("renders the %s page with structured, substantial HTML", (_, Page) => {
    const markup = renderToStaticMarkup(<Page />);
    const visibleText = getVisibleText(markup);

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup.match(/<h2/g)?.length).toBeGreaterThanOrEqual(2);
    expect(markup).toContain('class="prose-legal"');
    expect(visibleText.length).toBeGreaterThan(500);
  });

  it("renders a 404 recovery map for people and agents", () => {
    const markup = renderToStaticMarkup(<NotFound />);

    expect(markup).toContain("Page not found");
    expect(markup).toContain('href="/sitemap.xml"');
    expect(markup).toContain('href="/llms.txt"');
    expect(markup).toContain('href="/developers"');
    expect(markup).toContain('href="/openapi.json"');
  });
});
