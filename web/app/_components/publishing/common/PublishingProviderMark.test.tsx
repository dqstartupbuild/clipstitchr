import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";

describe("PublishingProviderMark", () => {
  it("uses the retained authentic provider assets without a tile", () => {
    const markup = renderToStaticMarkup(
      <div>
        <PublishingProviderMark provider="instagram" />
        <PublishingProviderMark provider="tiktok" />
      </div>,
    );
    expect(markup).toContain("Instagram logo");
    expect(markup).toContain("TikTok logo");
    expect(markup).not.toContain("icon-tile");
  });
});
