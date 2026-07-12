import { describe, expect, it } from "vitest";
import { getHookLabVariationDirection } from "@/lib/clipstitchr/utils/getHookLabVariationDirection";
import { createHookLabEnforcedVisualPrompt } from "./createHookLabEnforcedVisualPrompt";

describe("createHookLabEnforcedVisualPrompt", () => {
  it("places the deterministic visual direction ahead of model-written detail", () => {
    const direction = getHookLabVariationDirection(3);
    const prompt = createHookLabEnforcedVisualPrompt(
      "The creator looks curious.",
      direction,
    );

    expect(prompt.startsWith(`Required visual direction: ${direction.visualDirection}`)).toBe(
      true,
    );
    expect(prompt).toContain("one continuous vertical shot");
  });
});
