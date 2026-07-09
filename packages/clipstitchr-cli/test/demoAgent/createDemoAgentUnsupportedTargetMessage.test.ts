import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoAgentUnsupportedTargetMessage } from "../../dist/demoAgent/createDemoAgentUnsupportedTargetMessage.js";

describe("createDemoAgentUnsupportedTargetMessage", () => {
  it("explains live targets need OpenAI Computer Use", () => {
    assert.match(
      createDemoAgentUnsupportedTargetMessage({
        projectType: "ios",
        targetMode: "live",
      }),
      /openai-mode relay/,
    );
  });

  it("explains local native targets can use the macOS window surface", () => {
    assert.match(
      createDemoAgentUnsupportedTargetMessage({
        projectType: "android",
        targetMode: "local",
      }),
      /--surface macos-window/,
    );
  });
});
