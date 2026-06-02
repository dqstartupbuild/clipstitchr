import { describe, expect, it } from "vitest";
import { getCliprHookModelFamily } from "@/lib/clipstitchr/server/getCliprHookModelFamily";

describe("getCliprHookModelFamily", () => {
  it("detects Anthropic Claude text models", () => {
    expect(getCliprHookModelFamily("anthropic/claude-4.5-haiku")).toBe(
      "anthropic-claude",
    );
  });

  it("detects versioned Anthropic Claude text models", () => {
    expect(
      getCliprHookModelFamily("anthropic/claude-4.5-haiku:version-id"),
    ).toBe("anthropic-claude");
  });

  it("uses the OpenAI chat workflow by default", () => {
    expect(getCliprHookModelFamily("openai/gpt-4.1")).toBe("openai-chat");
  });
});
