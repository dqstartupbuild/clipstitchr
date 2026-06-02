import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_CLIPR_HOOK_MODEL_ID } from "@/lib/clipstitchr/constants/defaultCliprHookModelId";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";

describe("getCliprHookModelId", () => {
  const originalCliprHookModelId = process.env.CLIPR_HOOK_MODEL_ID;

  afterEach(() => {
    if (originalCliprHookModelId === undefined) {
      delete process.env.CLIPR_HOOK_MODEL_ID;
    } else {
      process.env.CLIPR_HOOK_MODEL_ID = originalCliprHookModelId;
    }
  });

  it("defaults hook and script generation to Claude Haiku 4.5", () => {
    delete process.env.CLIPR_HOOK_MODEL_ID;

    expect(getCliprHookModelId()).toBe(DEFAULT_CLIPR_HOOK_MODEL_ID);
  });

  it("uses the configured hook and script model ID", () => {
    process.env.CLIPR_HOOK_MODEL_ID = " openai/gpt-4.1 ";

    expect(getCliprHookModelId()).toBe("openai/gpt-4.1");
  });
});
