import { describe, expect, it } from "vitest";
import { groupSocialPublishingMedia } from "@/lib/clipstitchr/server/socialPublishing/groupSocialPublishingMedia";

describe("groupSocialPublishingMedia", () => {
  it("separates shared media from Instagram-specific media", () => {
    expect(
      groupSocialPublishingMedia([
        {
          mediaId: "vertical_1",
          mediaKind: "image",
          mimeType: "image/png",
          name: "slide-1.png",
          sizeBytes: 100,
        },
        {
          customPlatform: "instagram",
          mediaId: "instagram_1",
          mediaKind: "image",
          mimeType: "image/png",
          name: "instagram-slide-1.png",
          sizeBytes: 100,
        },
      ]),
    ).toEqual({
      customMediaIdsByPlatform: { instagram: ["instagram_1"] },
      mediaIds: ["vertical_1"],
    });
  });
});
