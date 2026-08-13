import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PublishingIntentPicker } from "@/app/_components/publishing/compose/PublishingIntentPicker";
import { PublishingTikTokSettings } from "@/app/_components/publishing/compose/PublishingTikTokSettings";
import { createDefaultPublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/createDefaultPublishingComposerSettings";

describe("publishing composer controls", () => {
  it("offers one explicit final intent without a second action row", () => {
    const markup = renderToStaticMarkup(
      <PublishingIntentPicker onChange={vi.fn()} value="draft" />,
    );

    expect(markup.match(/type="radio"/g)).toHaveLength(3);
    expect(markup).toContain("Save draft");
    expect(markup).toContain("Publish now");
    expect(markup).toContain("Schedule");
  });

  it("states that TikTok inbox delivery still requires user action", () => {
    const settings = createDefaultPublishingComposerSettings("tiktok");
    if (settings.provider !== "tiktok") {
      throw new Error("Expected TikTok settings.");
    }
    const markup = renderToStaticMarkup(
      <PublishingTikTokSettings
        integrationId="integration_1"
        onChange={vi.fn()}
        settings={settings}
      />,
    );

    expect(markup).toContain("This does not publish the post.");
    expect(markup).toContain("finish and publish it within 24 hours");
    expect(markup).toContain("Needs action");
  });

  it("starts YouTube private and requires a made-for-kids choice", () => {
    const settings = createDefaultPublishingComposerSettings("youtube");

    expect(settings).toMatchObject({
      madeForKids: null,
      provider: "youtube",
      thumbnail: null,
      title: "",
      visibility: "private",
    });
  });
});
