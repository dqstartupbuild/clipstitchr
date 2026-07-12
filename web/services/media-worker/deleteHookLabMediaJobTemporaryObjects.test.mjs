import { describe, expect, it, vi } from "vitest";
import { deleteHookLabMediaJobTemporaryObjects } from "./deleteHookLabMediaJobTemporaryObjects.mjs";

describe("deleteHookLabMediaJobTemporaryObjects", () => {
  it("attempts every temporary deletion even when one fails", async () => {
    const deleteR2Object = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValueOnce(undefined);
    const config = { bucketName: "bucket" };
    const r2 = { client: true };

    await expect(
      deleteHookLabMediaJobTemporaryObjects({
        config,
        deleteR2Object,
        job: {
          jobType: "hook-lab-variant-finalization",
          ownerId: "owner",
          inputSnapshotJson: JSON.stringify({
            temporaryObjects: [
              {
                contentType: "image/png",
                key: "users/owner/tmp/still.png",
                size: 12,
              },
              {
                contentType: "video/mp4",
                key: "users/owner/tmp/opening.mp4",
                size: 34,
              },
            ],
          }),
        },
        r2,
      }),
    ).resolves.toBeUndefined();
    expect(deleteR2Object).toHaveBeenCalledTimes(2);
    expect(deleteR2Object).toHaveBeenNthCalledWith(1, {
      client: r2,
      config,
      key: "users/owner/tmp/still.png",
    });
    expect(deleteR2Object).toHaveBeenNthCalledWith(2, {
      client: r2,
      config,
      key: "users/owner/tmp/opening.mp4",
    });
  });
});
