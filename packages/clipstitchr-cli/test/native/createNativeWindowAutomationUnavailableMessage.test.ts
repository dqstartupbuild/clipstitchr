import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createNativeWindowAutomationUnavailableMessage } from "../../dist/native/createNativeWindowAutomationUnavailableMessage.js";

describe("createNativeWindowAutomationUnavailableMessage", () => {
  it("explains Windows native automation support boundaries", () => {
    const message = createNativeWindowAutomationUnavailableMessage("win32");

    assert.match(message, /Windows/);
    assert.match(message, /Browser demos still work/);
    assert.match(message, /Manual Android recording/);
    assert.match(message, /adb screenrecord/);
    assert.match(message, /macOS window helper/);
    assert.match(message, /windows-window/);
    assert.match(message, /android-adb/);
  });

  it("explains Linux native automation support boundaries", () => {
    const message = createNativeWindowAutomationUnavailableMessage("linux");

    assert.match(message, /Linux/);
    assert.match(message, /Browser demos still work/);
    assert.match(message, /macOS window helper/);
  });
});
