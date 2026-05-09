import { describe, expect, it } from "vitest";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import { filterPhotosBySearchQuery } from "@/lib/clipstitchr/utils/filterPhotosBySearchQuery";

const photos = [
  { id: "photo-1", name: "Studio Portrait", tags: ["indoor", "headshot"] },
  {
    id: "photo-2",
    name: "Outdoor Reference",
    avatarDescription: "Short dark hair and angular brows",
    tags: ["sunlight"],
  },
  { id: "photo-3", name: "Desk Photo", tags: ["workspace"] },
] as PhotoAsset[];

describe("filterPhotosBySearchQuery", () => {
  it("matches photo names case-insensitively", () => {
    expect(filterPhotosBySearchQuery(photos, "OUTDOOR")).toEqual([photos[1]]);
  });

  it("matches photo tags", () => {
    expect(filterPhotosBySearchQuery(photos, "workspace")).toEqual([photos[2]]);
  });

  it("matches avatar descriptions", () => {
    expect(filterPhotosBySearchQuery(photos, "angular brows")).toEqual([
      photos[1],
    ]);
  });

  it("matches the photo type tag", () => {
    expect(filterPhotosBySearchQuery(photos, "photo")).toEqual(photos);
  });

  it("returns all photos when the query is blank", () => {
    expect(filterPhotosBySearchQuery(photos, "   ")).toEqual(photos);
  });
});
