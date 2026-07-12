import { describe, expect, it } from "vitest";
import { getHookLabMediaJobTemporaryObjects } from "./getHookLabMediaJobTemporaryObjects.mjs";

describe("getHookLabMediaJobTemporaryObjects", () => {
  it("returns only valid temporary objects for Hook Lab finalization", () => {
    expect(
      getHookLabMediaJobTemporaryObjects({
        jobType: "hook-lab-variant-finalization",
        ownerId: "owner",
        inputSnapshotJson: JSON.stringify({
          temporaryObjects: [
            { contentType: "image/png", key: "users/owner/tmp/still.png", size: 12 },
            { contentType: "video/mp4", key: "users/owner/tmp/opening.mp4", size: 34 },
            { contentType: "video/mp4", key: "users/someone-else/tmp/opening.mp4", size: 34 },
            { key: "missing-fields" },
          ],
        }),
      }),
    ).toEqual([
      { contentType: "image/png", key: "users/owner/tmp/still.png", size: 12 },
      { contentType: "video/mp4", key: "users/owner/tmp/opening.mp4", size: 34 },
    ]);
  });

  it("ignores malformed and unrelated jobs", () => {
    expect(
      getHookLabMediaJobTemporaryObjects({
        jobType: "hook-lab-variant-finalization",
        ownerId: "owner",
        inputSnapshotJson: "not-json",
      }),
    ).toEqual([]);
    expect(
      getHookLabMediaJobTemporaryObjects({
        jobType: "clipr-finalization",
        ownerId: "owner",
        inputSnapshotJson: JSON.stringify({ temporaryObjects: [{}] }),
      }),
    ).toEqual([]);
  });
});
