import { access, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { withStudioClipsTempWorkspace } from "./withStudioClipsTempWorkspace";

describe("withStudioClipsTempWorkspace", () => {
  const roots: string[] = [];

  afterEach(async () => {
    await Promise.all(
      roots.splice(0).map((root) => rm(root, { force: true, recursive: true })),
    );
  });

  it("cleans up after success", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-clips-test-"));
    roots.push(root);
    let workspacePath = "";

    await withStudioClipsTempWorkspace(
      async (workspace) => {
        workspacePath = workspace.path;
        await writeFile(join(workspace.path, "source.mp4"), Buffer.alloc(8));
        await workspace.assertWithinBudget();
      },
      { maxBytes: 16, rootPath: root },
    );

    await expect(access(workspacePath)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("cleans up after an operation failure", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-clips-test-"));
    roots.push(root);
    let workspacePath = "";

    await expect(
      withStudioClipsTempWorkspace(
        async (workspace) => {
          workspacePath = workspace.path;
          throw new Error("pipeline failed");
        },
        { rootPath: root },
      ),
    ).rejects.toThrow("pipeline failed");
    await expect(access(workspacePath)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("enforces the byte budget and rejects symlinks", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-clips-test-"));
    roots.push(root);

    await expect(
      withStudioClipsTempWorkspace(
        async (workspace) => {
          await writeFile(join(workspace.path, "too-large.mp4"), Buffer.alloc(17));
          await workspace.assertWithinBudget();
        },
        { maxBytes: 16, rootPath: root },
      ),
    ).rejects.toThrow("storage limit");

    await expect(
      withStudioClipsTempWorkspace(
        async (workspace) => {
          await symlink(root, join(workspace.path, "escape"));
          await workspace.assertWithinBudget();
        },
        { maxBytes: 16, rootPath: root },
      ),
    ).rejects.toThrow("cannot contain links");
  });
});
