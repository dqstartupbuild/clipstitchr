import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StitchTemplatePicker } from "@/app/_components/stitchr/StitchTemplatePicker";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";

function createTemplate(overrides: Partial<StitchTemplate> = {}): StitchTemplate {
  return {
    createdAt: "2026-06-13T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 16,
    height: 1920,
    id: "template_1",
    name: "Hook template",
    sourceStitchId: "stitch_1",
    sourceStitchName: "Original stitch",
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    updatedAt: "2026-06-13T00:00:00.000Z",
    width: 1080,
    ...overrides,
  };
}

describe("StitchTemplatePicker", () => {
  it("renders none as the default picker option", () => {
    const markup = renderToStaticMarkup(
      <StitchTemplatePicker
        isLoading={false}
        selectedTemplateId=""
        templates={[createTemplate()]}
        onTemplateChange={vi.fn()}
      />,
    );

    expect(markup).toContain("Template");
    expect(markup).toContain("None");
    expect(markup).toContain("Hook template");
    expect(markup).toContain('value="" selected');
  });

  it("disables the picker while templates load", () => {
    const markup = renderToStaticMarkup(
      <StitchTemplatePicker
        isLoading={true}
        selectedTemplateId=""
        templates={[]}
        onTemplateChange={vi.fn()}
      />,
    );

    expect(markup).toContain("disabled");
  });
});
