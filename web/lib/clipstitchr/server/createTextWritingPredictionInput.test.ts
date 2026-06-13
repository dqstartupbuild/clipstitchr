import { describe, expect, it } from "vitest";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";

describe("createTextWritingPredictionInput", () => {
  it("uses the Replicate Claude text schema for Anthropic writing models", () => {
    expect(
      createTextWritingPredictionInput({
        maxCompletionTokens: 1800,
        modelId: "anthropic/claude-opus-4.6",
        prompt: "Write a hook.",
        systemPrompt: "Return JSON.",
      }),
    ).toEqual({
      max_tokens: 1800,
      prompt: "Write a hook.",
      system_prompt: "Return JSON.",
    });
  });

  it("keeps the existing OpenAI-style schema for non-Claude writing models", () => {
    expect(
      createTextWritingPredictionInput({
        maxCompletionTokens: 1200,
        modelId: "openai/gpt-4.1",
        prompt: "Write slides.",
        systemPrompt: "Return JSON.",
      }),
    ).toEqual({
      max_completion_tokens: 1200,
      prompt: "Write slides.",
      system_prompt: "Return JSON.",
      temperature: 0.65,
    });
  });
});
