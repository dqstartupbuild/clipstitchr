import { afterEach, describe, expect, it } from "vitest";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";

describe("getCliprHookModelId", () => {
  const originalShortFormTextModelId = process.env.SHORT_FORM_TEXT_MODEL_ID;

  afterEach(() => {
    if (originalShortFormTextModelId === undefined) {
      delete process.env.SHORT_FORM_TEXT_MODEL_ID;
    } else {
      process.env.SHORT_FORM_TEXT_MODEL_ID = originalShortFormTextModelId;
    }
  });

  it("delegates to the shared short-form text model configuration", () => {
    process.env.SHORT_FORM_TEXT_MODEL_ID = "openai/gpt-4.1";

    expect(getCliprHookModelId()).toBe("openai/gpt-4.1");
  });
});
