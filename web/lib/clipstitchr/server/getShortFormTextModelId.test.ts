import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_SHORT_FORM_TEXT_MODEL_ID } from "@/lib/clipstitchr/constants/defaultShortFormTextModelId";
import { getShortFormTextModelId } from "@/lib/clipstitchr/server/getShortFormTextModelId";

describe("getShortFormTextModelId", () => {
  const originalCliprHookModelId = process.env.CLIPR_HOOK_MODEL_ID;
  const originalShortFormTextModelId = process.env.SHORT_FORM_TEXT_MODEL_ID;

  afterEach(() => {
    if (originalCliprHookModelId === undefined) {
      delete process.env.CLIPR_HOOK_MODEL_ID;
    } else {
      process.env.CLIPR_HOOK_MODEL_ID = originalCliprHookModelId;
    }

    if (originalShortFormTextModelId === undefined) {
      delete process.env.SHORT_FORM_TEXT_MODEL_ID;
    } else {
      process.env.SHORT_FORM_TEXT_MODEL_ID = originalShortFormTextModelId;
    }
  });

  it("defaults Clipr, Stitchr, and Swipr text generation to Claude Haiku 4.5", () => {
    delete process.env.CLIPR_HOOK_MODEL_ID;
    delete process.env.SHORT_FORM_TEXT_MODEL_ID;

    expect(getShortFormTextModelId()).toBe(DEFAULT_SHORT_FORM_TEXT_MODEL_ID);
  });

  it("uses the configured shared short-form text model ID", () => {
    process.env.SHORT_FORM_TEXT_MODEL_ID = " openai/gpt-4.1 ";
    process.env.CLIPR_HOOK_MODEL_ID = "anthropic/claude-4.5-haiku";

    expect(getShortFormTextModelId()).toBe("openai/gpt-4.1");
  });

  it("keeps the previous Clipr hook model variable as a fallback", () => {
    delete process.env.SHORT_FORM_TEXT_MODEL_ID;
    process.env.CLIPR_HOOK_MODEL_ID = " openai/gpt-4.1 ";

    expect(getShortFormTextModelId()).toBe("openai/gpt-4.1");
  });
});
