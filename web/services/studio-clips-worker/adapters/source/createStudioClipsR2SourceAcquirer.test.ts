import { describe, expect, it, vi } from "vitest";
import type { StudioClipsR2ObjectStore } from "../r2/StudioClipsR2ObjectStore";
import { createStudioClipsTestClaim } from "../../testing/createStudioClipsTestClaim";
import { createStudioClipsR2SourceAcquirer } from "./createStudioClipsR2SourceAcquirer";

describe("createStudioClipsR2SourceAcquirer", () => {
  it("downloads only from the claim Product's exact media-source namespace", async () => {
    const downloadFile = vi.fn(async () => ({ sha256Hex: "a".repeat(64) }));
    const acquire = createStudioClipsR2SourceAcquirer({
      downloadFile,
    } as unknown as StudioClipsR2ObjectStore);
    const claim = createStudioClipsTestClaim({
      source: {
        contentType: "video/mp4",
        kind: "r2",
        objectKey:
          "users/user_123/studio/v1/media-source/product_123/source_1/video.mp4",
        sizeBytes: 32,
      },
    });

    await expect(
      acquire({ claim, workspacePath: "/tmp/studio-clips-product-test" }),
    ).resolves.toMatchObject({ contentType: "video/mp4", sizeBytes: 32 });
    expect(downloadFile).toHaveBeenCalledTimes(1);

    await expect(
      acquire({
        claim: {
          ...claim,
          source: {
            contentType: "video/mp4",
            kind: "r2",
            objectKey:
              "users/user_123/studio/v1/media-source/product_456/source_1/video.mp4",
            sizeBytes: 32,
          },
        },
        workspacePath: "/tmp/studio-clips-product-test",
      }),
    ).rejects.toMatchObject({ code: "SOURCE_OWNERSHIP_MISMATCH" });
    expect(downloadFile).toHaveBeenCalledTimes(1);
  });
});
