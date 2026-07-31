import { describe, expect, it } from "vitest";
import { getTikTokPublishErrorMessage } from "./getTikTokPublishErrorMessage";

describe("getTikTokPublishErrorMessage", () => {
  it("explains how to recover from TikTok's unaudited-client restriction", () => {
    expect(
      getTikTokPublishErrorMessage({
        fallbackMessage: "Please review our integration guidelines.",
        providerCode: "unaudited_client_can_only_post_to_private_accounts",
      }),
    ).toBe(
      "TikTok requires a private account for automatic posts until ClipStitchr's TikTok review is approved. Make this TikTok account private, or choose Send to TikTok for finishing.",
    );
  });

  it("keeps unknown provider messages", () => {
    expect(
      getTikTokPublishErrorMessage({
        fallbackMessage: "TikTok rejected this post.",
        providerCode: "future_provider_code",
      }),
    ).toBe("TikTok rejected this post.");
  });
});
