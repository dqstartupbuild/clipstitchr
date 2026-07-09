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
      /OPENAI_API_KEY/,
    );
  });

  it("explains local native targets need device-control support", () => {
    assert.match(
      createDemoAgentUnsupportedTargetMessage({
        projectType: "android",
        targetMode: "local",
      }),
      /device-control support/,
    );
  });
});
