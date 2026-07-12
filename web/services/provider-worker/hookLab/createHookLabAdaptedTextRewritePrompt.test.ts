import { describe, expect, it } from "vitest";
import { createHookLabAdaptedTextRewritePrompt } from "./createHookLabAdaptedTextRewritePrompt";

describe("createHookLabAdaptedTextRewritePrompt", () => {
  it("constrains the rewrite away from both source and rejected wording", () => {
    const prompt = createHookLabAdaptedTextRewritePrompt({
      candidateText: "This trick changed my mornings",
      productName: "Daily Brew",
      siblingHooks: ["The coffee shortcut I kept"],
      sourceText: "This trick changed everything",
      textBlueprint: {
        cadence: "short",
        claimsRequiringSupport: [],
        emotionalJob: "curiosity",
        exactReuseConstraints: [],
        productSpecificTokens: [],
        reusablePattern: "A better {{topic}}",
        semanticSlots: [{ meaning: "topic", name: "topic" }],
        sourceText: "This trick changed everything",
        unresolvedVisualReferences: [],
      },
      variationDirection: {
        fallbackTopic: "a question worth answering",
        hookTreatment: "Use a concrete question.",
        visualDirection: "Use a curious three-quarter frame.",
      },
    });

    expect(prompt).toContain("This trick changed everything");
    expect(prompt).toContain("This trick changed my mornings");
    expect(prompt).toContain("Change the wording, syntax");
    expect(prompt).toContain("The coffee shortcut I kept");
  });
});
