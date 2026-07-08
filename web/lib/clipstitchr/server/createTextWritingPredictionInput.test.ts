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

  it("keeps Anthropic writing requests above Replicate's max token floor", () => {
    expect(
      createTextWritingPredictionInput({
        maxCompletionTokens: 500,
        modelId: "anthropic/claude-sonnet-4.6",
        prompt: "Plan one safe action.",
        systemPrompt: "Return JSON.",
      }),
    ).toEqual({
      max_tokens: 1024,
      prompt: "Plan one safe action.",
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

  it("allows callers to lower temperature for strict planner output", () => {
    expect(
      createTextWritingPredictionInput({
        maxCompletionTokens: 500,
        modelId: "openai/gpt-5-mini",
        prompt: "Plan one safe action.",
        systemPrompt: "Return JSON.",
        temperature: 0.2,
      }),
    ).toEqual(
      expect.objectContaining({
        max_completion_tokens: 500,
        temperature: 0.2,
      }),
    );
  });
});
