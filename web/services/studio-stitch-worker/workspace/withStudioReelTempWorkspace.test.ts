import { access, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { withStudioReelTempWorkspace } from "./withStudioReelTempWorkspace";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true })),
  );
});

describe("withStudioReelTempWorkspace", () => {
  it("removes its private workspace after success and failure", async () => {
    const rootPath = await mkdtemp(join(tmpdir(), "studio-stitch-root-"));
    roots.push(rootPath);
    let successfulPath = "";
    await withStudioReelTempWorkspace(
      async (workspace) => {
        successfulPath = workspace.path;
        await writeFile(join(workspace.path, "media.bin"), "safe");
      },
      { rootPath },
    );
    await expect(access(successfulPath)).rejects.toThrow();

    let failedPath = "";
    await expect(
      withStudioReelTempWorkspace(
        async (workspace) => {
          failedPath = workspace.path;
          throw new Error("test failure");
        },
        { rootPath },
      ),
    ).rejects.toThrow("test failure");
    await expect(access(failedPath)).rejects.toThrow();
  });

  it("fails closed when workspace content crosses the byte cap", async () => {
    const rootPath = await mkdtemp(join(tmpdir(), "studio-stitch-root-"));
    roots.push(rootPath);

    await expect(
      withStudioReelTempWorkspace(
        async (workspace) => {
          await writeFile(join(workspace.path, "oversize.bin"), "12345");
          await workspace.assertWithinBudget();
        },
        { maxBytes: 4, rootPath },
      ),
    ).rejects.toMatchObject({
      code: "WORKSPACE_LIMIT_EXCEEDED",
      kind: "permanent",
    });
  });
});
