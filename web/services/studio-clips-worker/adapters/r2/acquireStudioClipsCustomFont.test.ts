import { copyFile, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { StudioClipsR2ObjectStore } from "./StudioClipsR2ObjectStore";
import { acquireStudioClipsCustomFont } from "./acquireStudioClipsCustomFont";

describe("acquireStudioClipsCustomFont", () => {
  it("downloads an immutable owner-scoped font and reads its internal family", async () => {
    const workspacePath = await mkdtemp(
      join(tmpdir(), "studio-clips-custom-font-"),
    );
    const fixture =
      "vendor/supoclip/v0_1_0/upstream/backend/fonts/TikTokSans-Regular.ttf";
    const fixtureSize = (await stat(fixture)).size;
    const key = "users/user_123/studio/v1/font/product_123/font_123/font.ttf";
    const downloadFile = vi.fn(
      async ({ outputPath }: { outputPath: string }) => {
        await copyFile(fixture, outputPath);
        return { sha256Hex: "0".repeat(64) };
      },
    );
    const store = {
      downloadFile,
      inspectFile: vi.fn(async () => ({
        contentType: "font/ttf",
        etag: "font-etag-123",
        sizeBytes: fixtureSize,
      })),
    } as unknown as StudioClipsR2ObjectStore;

    try {
      await expect(
        acquireStudioClipsCustomFont({
          objectKey: key,
          objects: store,
          ownerId: "user_123",
          productId: "product_123",
          workspacePath,
        }),
      ).resolves.toMatchObject({ family: "TikTok Sans Light" });
      expect(downloadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: "font/ttf",
          expectedEtag: "font-etag-123",
          key,
          maximumBytes: 10 * 1024 * 1024,
          sizeBytes: fixtureSize,
        }),
      );
    } finally {
      await rm(workspacePath, { force: true, recursive: true });
    }
  });

  it("rejects cross-owner keys before R2 is contacted", async () => {
    const inspectFile = vi.fn();
    await expect(
      acquireStudioClipsCustomFont({
        objectKey: "users/other/studio/v1/font/font_123/font.ttf",
        objects: { inspectFile } as unknown as StudioClipsR2ObjectStore,
        ownerId: "user_123",
        productId: "product_123",
        workspacePath: "/tmp/studio-clips-test",
      }),
    ).rejects.toMatchObject({ code: "CUSTOM_FONT_OWNERSHIP_MISMATCH" });
    expect(inspectFile).not.toHaveBeenCalled();
  });

  it("rejects another Product's font before R2 is contacted", async () => {
    const inspectFile = vi.fn();
    await expect(
      acquireStudioClipsCustomFont({
        objectKey:
          "users/user_123/studio/v1/font/product_456/font_123/font.ttf",
        objects: { inspectFile } as unknown as StudioClipsR2ObjectStore,
        ownerId: "user_123",
        productId: "product_123",
        workspacePath: "/tmp/studio-clips-test",
      }),
    ).rejects.toMatchObject({ code: "CUSTOM_FONT_OWNERSHIP_MISMATCH" });
    expect(inspectFile).not.toHaveBeenCalled();
  });
});
