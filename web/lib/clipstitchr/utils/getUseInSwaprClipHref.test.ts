import { describe, expect, it } from "vitest";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getUseInSwaprClipHref } from "@/lib/clipstitchr/utils/getUseInSwaprClipHref";

describe("getUseInSwaprClipHref", () => {
  it("links eligible UGC clips into Swapr", () => {
    expect(
      getUseInSwaprClipHref({
        id: "ugc 1",
        clipType: "ugc",
      } as VideoClipMetadata),
    ).toBe("/dashboard/swapr?clipId=ugc%201");
  });

  it("does not deep-link demos into Swapr", () => {
    expect(
      getUseInSwaprClipHref({
        id: "demo-1",
        clipType: "demo",
      } as VideoClipMetadata),
    ).toBe("/dashboard/swapr");
  });
});
