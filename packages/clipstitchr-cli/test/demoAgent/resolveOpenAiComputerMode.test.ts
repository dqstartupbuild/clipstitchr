import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveOpenAiComputerMode } from "../../dist/demoAgent/resolveOpenAiComputerMode.js";

describe("resolveOpenAiComputerMode", () => {
  it("uses relay when credentials exist and no local OpenAI key is available", () => {
    assert.equal(
      resolveOpenAiComputerMode({
        hasClipstitchrCredentials: true,
        hasLocalOpenAiApiKey: false,
      }),
      "relay",
    );
  });

  it("uses direct when a local OpenAI key is available", () => {
    assert.equal(
      resolveOpenAiComputerMode({
        hasClipstitchrCredentials: true,
        hasLocalOpenAiApiKey: true,
      }),
      "direct",
    );
  });

  it("honors explicit relay mode", () => {
    assert.equal(
      resolveOpenAiComputerMode({
        hasLocalOpenAiApiKey: true,
        optionMode: "relay",
      }),
      "relay",
    );
  });

  it("rejects unsupported modes", () => {
    assert.throws(
      () => resolveOpenAiComputerMode({ optionMode: "hosted" }),
      /direct or --openai-mode relay/,
    );
  });
});
