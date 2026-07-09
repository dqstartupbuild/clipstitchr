import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { getInstalledMacosWindowHelperExecutablePath } from "../../dist/native/macosWindowHelper/getInstalledMacosWindowHelperExecutablePath.js";
import { getInstalledMacosWindowHelperIsCurrent } from "../../dist/native/macosWindowHelper/getInstalledMacosWindowHelperIsCurrent.js";
import { writeInstalledMacosWindowHelperMetadata } from "../../dist/native/macosWindowHelper/writeInstalledMacosWindowHelperMetadata.js";

describe("getInstalledMacosWindowHelperIsCurrent", () => {
  it("matches installed helper metadata to the current bundle hash", async () => {
    const home = await mkdtemp(join(tmpdir(), "clipstitchr-native-home-"));

    try {
      await mkdir(join(home, "Library", "Application Support", "ClipStitchr"), {
        recursive: true,
      });
      await writeFile(
        getInstalledMacosWindowHelperExecutablePath(home),
        "#!/bin/sh\n",
        "utf8",
      );
      await chmod(getInstalledMacosWindowHelperExecutablePath(home), 0o755);
      await writeInstalledMacosWindowHelperMetadata({
        home,
        metadata: {
          bundleHash: "hash_current",
          installedAt: "2026-01-01T00:00:00.000Z",
          version: 1,
        },
      });

      assert.equal(
        await getInstalledMacosWindowHelperIsCurrent({
          bundleHash: "hash_current",
          home,
        }),
        true,
      );
      assert.equal(
        await getInstalledMacosWindowHelperIsCurrent({
          bundleHash: "hash_new",
          home,
        }),
        false,
      );
    } finally {
      await rm(home, { force: true, recursive: true });
    }
  });
});
