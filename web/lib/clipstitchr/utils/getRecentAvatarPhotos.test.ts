import { describe, expect, it } from "vitest";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import { getRecentAvatarPhotos } from "@/lib/clipstitchr/utils/getRecentAvatarPhotos";

function createPhoto(
  id: string,
  avatarId: string | undefined,
  createdAt: string,
): PhotoAssetMetadata {
  return {
    id,
    avatarId,
    name: id,
    originalName: `${id}.jpg`,
    photoObject: {
      key: `${id}.jpg`,
      contentType: "image/jpeg",
      size: 100,
    },
    mimeType: "image/jpeg",
    size: 100,
    width: 1080,
    height: 1920,
    createdAt,
    updatedAt: createdAt,
  };
}

describe("getRecentAvatarPhotos", () => {
  it("returns only the newest photo for each avatar", () => {
    const photos = [
      createPhoto("avatar-1-old", "avatar-1", "2026-01-01T00:00:00.000Z"),
      createPhoto("avatar-2-new", "avatar-2", "2026-01-04T00:00:00.000Z"),
      createPhoto("avatar-1-new", "avatar-1", "2026-01-05T00:00:00.000Z"),
      createPhoto("avatar-2-old", "avatar-2", "2026-01-02T00:00:00.000Z"),
    ];

    expect(getRecentAvatarPhotos(photos, 4).map((photo) => photo.id)).toEqual([
      "avatar-1-new",
      "avatar-2-new",
    ]);
  });

  it("ignores photos without an avatar and applies the limit", () => {
    const photos = [
      createPhoto("unassigned", undefined, "2026-01-06T00:00:00.000Z"),
      createPhoto("avatar-1", "avatar-1", "2026-01-03T00:00:00.000Z"),
      createPhoto("avatar-2", "avatar-2", "2026-01-02T00:00:00.000Z"),
    ];

    expect(getRecentAvatarPhotos(photos, 1).map((photo) => photo.id)).toEqual([
      "avatar-1",
    ]);
  });
});
