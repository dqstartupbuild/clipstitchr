import { describe, expect, it } from "vitest";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsByDemoProductId } from "@/lib/clipstitchr/utils/filterClipsByDemoProductId";

const clips = [
  {
    id: "ugc-1",
    name: "Creator opener",
    clipType: "ugc",
  },
  {
    id: "demo-1",
    name: "Calendar walkthrough",
    clipType: "demo",
    productId: "product-1",
  },
  {
    id: "demo-2",
    name: "Checkout walkthrough",
    clipType: "demo",
    productId: "product-2",
  },
  {
    id: "demo-3",
    name: "Legacy walkthrough",
    clipType: "demo",
  },
] as VideoClipMetadata[];

describe("filterClipsByDemoProductId", () => {
  it("keeps every clip when the all filter is active", () => {
    expect(filterClipsByDemoProductId(clips, "all")).toEqual(clips);
  });

  it("keeps UGC and demos for the selected product", () => {
    expect(filterClipsByDemoProductId(clips, "product-1")).toEqual([
      clips[0],
      clips[1],
    ]);
  });
});
