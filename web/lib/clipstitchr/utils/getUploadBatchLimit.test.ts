import { describe, expect, it } from "vitest";
import { MAX_EXPANDED_PHOTO_UPLOAD_BATCH_SIZE } from "@/lib/clipstitchr/constants/maxExpandedPhotoUploadBatchSize";
import { MAX_PHOTO_UPLOAD_BATCH_SIZE } from "@/lib/clipstitchr/constants/maxPhotoUploadBatchSize";
import { MAX_VIDEO_UPLOAD_BATCH_SIZE } from "@/lib/clipstitchr/constants/maxVideoUploadBatchSize";
import { getUploadBatchLimit } from "@/lib/clipstitchr/utils/getUploadBatchLimit";

describe("getUploadBatchLimit", () => {
  it("limits standard photo batches", () => {
    expect(
      getUploadBatchLimit({
        assetType: "photo",
        shouldExpandWithAi: false,
      }),
    ).toBe(MAX_PHOTO_UPLOAD_BATCH_SIZE);
  });

  it("limits expanded photo batches to one file", () => {
    expect(
      getUploadBatchLimit({
        assetType: "photo",
        shouldExpandWithAi: true,
      }),
    ).toBe(MAX_EXPANDED_PHOTO_UPLOAD_BATCH_SIZE);
  });

  it("limits video batches", () => {
    expect(
      getUploadBatchLimit({
        assetType: "ugc",
        shouldExpandWithAi: false,
      }),
    ).toBe(MAX_VIDEO_UPLOAD_BATCH_SIZE);
  });
});
