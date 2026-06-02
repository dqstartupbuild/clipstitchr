import { describe, expect, it } from "vitest";
import { createCliprTextGenerationInput } from "@/lib/clipstitchr/server/createCliprTextGenerationInput";

describe("createCliprTextGenerationInput", () => {
  it("creates Claude inputs for Anthropic hook and script models", () => {
    const input = createCliprTextGenerationInput({
      modelId: "anthropic/claude-4.5-haiku",
      prompt: "Create JSON.",
      systemPrompt: "Return JSON only.",
    });

    expect(input).toEqual({
      prompt: "Create JSON.",
      system_prompt: "Return JSON only.",
      max_tokens: 1200,
    });
    expect(input).not.toHaveProperty("max_completion_tokens");
    expect(input).not.toHaveProperty("temperature");
  });

  it("keeps OpenAI chat inputs for existing OpenAI hook and script models", () => {
    expect(
      createCliprTextGenerationInput({
        modelId: "openai/gpt-4.1",
        prompt: "Create JSON.",
        systemPrompt: "Return JSON only.",
      }),
    ).toEqual({
      prompt: "Create JSON.",
      system_prompt: "Return JSON only.",
      temperature: 0.65,
      max_completion_tokens: 1200,
    });
  });
});
