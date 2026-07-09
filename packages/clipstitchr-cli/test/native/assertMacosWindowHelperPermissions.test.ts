import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertMacosWindowHelperPermissions } from "../../dist/native/macosWindowHelper/assertMacosWindowHelperPermissions.js";

describe("assertMacosWindowHelperPermissions", () => {
  it("explains missing macOS permissions", () => {
    assert.throws(
      () =>
        assertMacosWindowHelperPermissions({
          accessibility: false,
          screenRecording: false,
        }),
      (error) => {
        assert.match(String(error), /System Settings/);
        assert.match(String(error), /Screen Recording/);
        assert.match(String(error), /Accessibility/);
        return true;
      },
    );
  });
});
