import { describe, expect, it } from "vitest";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsByCliprContentType } from "@/lib/clipstitchr/utils/filterClipsByCliprContentType";

const clips = [
  {
    id: "clip-1",
    name: "Avatar clip",
    clipType: "ugc",
    cliprMetadata: {
      contentType: "avatar-talking-head",
    },
  },
  {
    id: "clip-2",
    name: "Product clip",
    clipType: "ugc",
    cliprMetadata: {
      contentType: "product-video",
    },
  },
  {
    id: "clip-3",
    name: "Legacy clip",
    clipType: "ugc",
    cliprMetadata: {},
  },
] as VideoClipMetadata[];

describe("filterClipsByCliprContentType", () => {
  it("keeps every clip when the all filter is active", () => {
    expect(filterClipsByCliprContentType(clips, "all")).toEqual(clips);
  });

  it("keeps matching content types and treats legacy Clipr clips as avatar clips", () => {
    expect(
      filterClipsByCliprContentType(clips, "avatar-talking-head"),
    ).toEqual([clips[0], clips[2]]);
  });

  it("filters to selected non-avatar content type", () => {
    expect(filterClipsByCliprContentType(clips, "product-video")).toEqual([
      clips[1],
    ]);
  });
});
