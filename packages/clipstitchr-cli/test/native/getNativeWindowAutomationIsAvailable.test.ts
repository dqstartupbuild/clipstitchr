import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNativeWindowAutomationIsAvailable } from "../../dist/native/getNativeWindowAutomationIsAvailable.js";

describe("getNativeWindowAutomationIsAvailable", () => {
  it("enables native visible-window automation only on macOS", () => {
    assert.equal(getNativeWindowAutomationIsAvailable("darwin"), true);
    assert.equal(getNativeWindowAutomationIsAvailable("win32"), false);
    assert.equal(getNativeWindowAutomationIsAvailable("linux"), false);
  });
});
