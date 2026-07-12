import { describe, expect, it, vi } from "vitest";
import { deleteHookLabTemporaryVideo } from "@/lib/clipstitchr/server/hookLab/deleteHookLabTemporaryVideo";

describe("deleteHookLabTemporaryVideo", () => {
  it("deletes local and R2 copies when both exist", async () => {
    const removeFile = vi.fn(async () => undefined);
    const deleteObject = vi.fn(async () => undefined);

    await deleteHookLabTemporaryVideo({
      deleteObject,
      filePath: "/tmp/hook-lab/video.mp4",
      objectKey: "users/owner/hook-lab-temp/video.mp4",
      removeFile,
    });

    expect(removeFile).toHaveBeenCalledWith("/tmp/hook-lab/video.mp4");
    expect(deleteObject).toHaveBeenCalledWith(
      "users/owner/hook-lab-temp/video.mp4",
    );
  });

  it("attempts every cleanup target even when one fails", async () => {
    const removeFile = vi.fn(async () => {
      throw new Error("disk busy");
    });
    const deleteObject = vi.fn(async () => undefined);

    await expect(
      deleteHookLabTemporaryVideo({
        deleteObject,
        filePath: "/tmp/hook-lab/video.mp4",
        objectKey: "users/owner/hook-lab-temp/video.mp4",
        removeFile,
      }),
    ).rejects.toThrow("Unable to delete temporary Hook Lab video");
    expect(deleteObject).toHaveBeenCalledTimes(1);
  });
});
