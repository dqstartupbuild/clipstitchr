import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PostBridgeSoundModePicker } from "@/app/_components/postBridge/PostBridgeSoundModePicker";

describe("PostBridgeSoundModePicker", () => {
  it("offers manual sound selection without automatic sound", () => {
    const markup = renderToStaticMarkup(
      <PostBridgeSoundModePicker
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
