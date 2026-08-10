import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SocialPublishingSoundModePicker } from "@/app/_components/socialPublishing/SocialPublishingSoundModePicker";

describe("SocialPublishingSoundModePicker", () => {
  it("offers manual sound selection without automatic sound", () => {
    const markup = renderToStaticMarkup(
      <SocialPublishingSoundModePicker
        disabled={false}
        value="none"
        onChange={vi.fn()}
      />,
    );

    expect(markup).toContain("Choose");
    expect(markup).toContain("No sound");
    expect(markup).not.toContain("Automatic");
  });
});
