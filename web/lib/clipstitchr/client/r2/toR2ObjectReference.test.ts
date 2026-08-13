import { describe, expect, it } from "vitest";
import { toR2ObjectReference } from "@/lib/clipstitchr/client/r2/toR2ObjectReference";

describe("toR2ObjectReference", () => {
  it("removes upload response metadata unsupported by legacy Convex validators", () => {
    expect(
      toR2ObjectReference({
        contentType: "video/mp4",
        etag: '"etag-1"',
        key: "users/user_123/stitches/stitch_123/video.mp4",
        size: 12,
        versionId: "version-1",
      }),
    ).toEqual({
      contentType: "video/mp4",
      key: "users/user_123/stitches/stitch_123/video.mp4",
      size: 12,
    });
  });
});
