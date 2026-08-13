import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";

describe("PublishingProviderMark", () => {
  it("uses the retained authentic provider assets without a tile", () => {
    const markup = renderToStaticMarkup(
      <div>
        <PublishingProviderMark provider="instagram" />
        <PublishingProviderMark provider="tiktok" />
        <PublishingProviderMark provider="youtube" />
      </div>,
    );
    expect(markup).toContain("Instagram logo");
    expect(markup).toContain("TikTok logo");
    expect(markup).toContain("YouTube logo");
    expect(markup).not.toContain("icon-tile");
  });
});
