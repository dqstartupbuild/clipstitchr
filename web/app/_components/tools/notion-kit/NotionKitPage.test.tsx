import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotionKitPage } from "@/app/_components/tools/notion-kit/NotionKitPage";
import { notionKitTemplates } from "@/lib/clipstitchr/tools/notionKit/notionKitTemplates";

describe("NotionKitPage", () => {
  it("offers five real CSV downloads, the exact lead source, and paid plans", () => {
    const markup = renderToStaticMarkup(<NotionKitPage />);

    expect(markup).toContain("Five real CSV files");
    for (const template of notionKitTemplates) {
      expect(markup).toContain(`Download ${template.name} CSV`);
    }
    expect(markup).toContain(
      'id="short-form-content-system-notion-kit-lead-heading"',
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("Is this a one-click Notion duplicate link?");
  });
});
