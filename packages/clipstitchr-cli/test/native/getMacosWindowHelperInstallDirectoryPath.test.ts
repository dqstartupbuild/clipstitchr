import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { getInstalledMacosWindowHelperExecutablePath } from "../../dist/native/macosWindowHelper/getInstalledMacosWindowHelperExecutablePath.js";
import { getInstalledMacosWindowHelperMetadataPath } from "../../dist/native/macosWindowHelper/getInstalledMacosWindowHelperMetadataPath.js";
import { getMacosWindowHelperInstallDirectoryPath } from "../../dist/native/macosWindowHelper/getMacosWindowHelperInstallDirectoryPath.js";

describe("macOS window helper install paths", () => {
  it("uses a stable user-level Application Support directory", () => {
    const home = "/Users/tester";

    assert.equal(
      getMacosWindowHelperInstallDirectoryPath(home),
      join(home, "Library", "Application Support", "ClipStitchr"),
    );
    assert.equal(
      getInstalledMacosWindowHelperExecutablePath(home),
      join(
        home,
        "Library",
        "Application Support",
        "ClipStitchr",
        "macos-window-helper",
      ),
    );
    assert.equal(
      getInstalledMacosWindowHelperMetadataPath(home),
      join(
        home,
        "Library",
        "Application Support",
        "ClipStitchr",
        "macos-window-helper.json",
      ),
    );
  });
});
